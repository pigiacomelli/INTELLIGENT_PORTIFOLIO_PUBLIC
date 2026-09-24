import { logger } from '../utils/logger.js';
import Stripe from 'stripe';
import { getDb } from '../db.js';
import { config } from '../config.js';

const stripe = config.STRIPE_SECRET_KEY
    ? new Stripe(config.STRIPE_SECRET_KEY, { apiVersion: '2025-02-24.acacia' as any })
    : null;

const requireStripe = () => {
    if (!stripe) {
        throw new Error('Pagamentos não estão configurados no modo local.');
    }
    return stripe;
};

export const stripeService = {
    async createCheckoutSession(userId: number, userEmail: string, frontendUrl: string) {
        const session = await requireStripe().checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'subscription',
            customer_email: userEmail,
            client_reference_id: userId.toString(),
            line_items: [
                {
                    price_data: {
                        currency: 'brl',
                        product_data: {
                            name: 'Intelligent Portfolio — Pro Advisor',
                            description: 'Assinatura Mensal com IA Ilimitada e Ativos Reais',
                        },
                        unit_amount: 2990, // R$ 29,90
                        recurring: { interval: 'month' },
                    },
                    quantity: 1,
                },
            ],
            success_url: `${frontendUrl}/?session_id={CHECKOUT_SESSION_ID}&success=true`,
            cancel_url: `${frontendUrl}/?canceled=true`,
        });

        return { url: session.url };
    },

    /**
     * Opens the Stripe Customer Portal so the user can manage/cancel their own subscription.
     * Requires stripe_customer_id to be saved in the users table.
     */
    async createCustomerPortalSession(userId: number, frontendUrl: string) {
        const stripeClient = requireStripe();
        const db = await getDb();
        const user = await db.get('SELECT stripe_customer_id FROM users WHERE id = ?', [userId]);

        if (!user?.stripe_customer_id) {
            throw new Error('Nenhuma assinatura ativa encontrada para este usuário.');
        }

        const session = await stripeClient.billingPortal.sessions.create({
            customer: user.stripe_customer_id,
            return_url: `${frontendUrl}/dashboard`,
        });

        return { url: session.url };
    },

    async handleWebhook(body: any, signature: string) {
        const stripeClient = requireStripe();
        const webhookSecret = config.STRIPE_WEBHOOK_SECRET;
        let event: Stripe.Event;

        try {
            if (webhookSecret) {
                event = stripeClient.webhooks.constructEvent(body, signature, webhookSecret);
            } else {
                event = body as Stripe.Event;
            }
        } catch (err: any) {
            logger.error(`[Stripe] Webhook signature error: ${err.message}`);
            throw new Error(`Webhook Error: ${err.message}`);
        }

        const db = await getDb();

        // ── Insert Idempotency Key ──────────────────────────────────────────
        const eventId = event.id;
        try {
            await db.run('INSERT INTO stripe_events (id, type) VALUES (?, ?)', [eventId, event.type]);
        } catch (err: any) {
            // Se já existir a chave primária, significa que já processamos este evento
            if (err.message.includes('UNIQUE constraint') || err.message.includes('duplicate key') || err.code === '23505') {
                logger.info(`[Stripe] 🔄 Webhook event ${eventId} already processed. Skipping.`);
                return { received: true };
            }
            throw err;
        }

        switch (event.type) {
            // ── User just paid — activate subscription ──────────────────────
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                const userId = session.client_reference_id;
                const customerId = session.customer as string;

                if (userId) {
                    logger.info(`[Stripe] ✅ User ${userId} subscribed. Activating...`);
                    await db.run(
                        `UPDATE users
                         SET subscription_status = ?, subscription_plan = ?, stripe_customer_id = ?
                         WHERE id = ?`,
                        ['active', 'pro', customerId, parseInt(userId, 10)]
                    );
                }
                break;
            }

            // ── Subscription changed (e.g. plan upgrade/downgrade, renewal) ─
            case 'customer.subscription.updated': {
                const sub = event.data.object as Stripe.Subscription;
                const customerId = sub.customer as string;
                const status = sub.status; // 'active' | 'past_due' | 'canceled' | 'trialing' etc.
                const endDate = new Date((sub as any).current_period_end * 1000);

                logger.info(`[Stripe] 🔄 Subscription updated for customer ${customerId}: ${status}`);
                await db.run(
                    `UPDATE users
                     SET subscription_status = ?, subscription_end_date = ?
                     WHERE stripe_customer_id = ?`,
                    [status, endDate, customerId]
                );
                break;
            }

            // ── Subscription cancelled ───────────────────────────────────────
            case 'customer.subscription.deleted': {
                const sub = event.data.object as Stripe.Subscription;
                const customerId = sub.customer as string;

                logger.info(`[Stripe] ❌ Subscription cancelled for customer ${customerId}`);
                await db.run(
                    `UPDATE users
                     SET subscription_status = ?, subscription_plan = ?
                     WHERE stripe_customer_id = ?`,
                    ['canceled', 'none', customerId]
                );
                break;
            }

            // ── Payment failed ───────────────────────────────────────────────
            case 'invoice.payment_failed': {
                const invoice = event.data.object as Stripe.Invoice;
                const customerId = invoice.customer as string;

                logger.warn(`[Stripe] ⚠️ Payment failed for customer ${customerId}`);
                await db.run(
                    `UPDATE users SET subscription_status = ? WHERE stripe_customer_id = ?`,
                    ['past_due', customerId]
                );
                break;
            }

            default:
                logger.info(`[Stripe] Unhandled event type: ${event.type}`);
        }

        return { received: true };
    },
};
