import { logger } from '../utils/logger.js';
import Stripe from 'stripe';
import { getDb } from '../db.js';
import { alertService } from './alertService.js';
import { config } from '../config.js';

const stripe = config.STRIPE_SECRET_KEY
    ? new Stripe(config.STRIPE_SECRET_KEY, { apiVersion: '2025-02-24.acacia' as any })
    : null;

export class StripeSyncJob {
    async syncSubscriptions() {
        if (!stripe) {
            logger.info('[Stripe Sync] Desativado no modo local.');
            return;
        }
        logger.info('[Stripe Sync] 🔄 Iniciando reconciliação de assinaturas com o Stripe...');
        const db = await getDb();

        try {
            // Get all users that have a stripe_customer_id
            const users = await db.all(
                'SELECT id, stripe_customer_id, subscription_status FROM users WHERE stripe_customer_id IS NOT NULL'
            );

            logger.info(`[Stripe Sync] Encontrados ${users.length} usuários para verificar.`);
            let updatedCount = 0;

            for (const user of users) {
                try {
                    // Fetch the customer's active subscriptions
                    const subscriptions = await stripe.subscriptions.list({
                        customer: user.stripe_customer_id,
                        status: 'all',
                        limit: 1 // Assume they only have one active subscription at a time
                    });

                    let newStatus = 'inactive';
                    let newPlan = 'none';
                    let endDate = null;

                    if (subscriptions.data.length > 0) {
                        const sub = subscriptions.data[0];
                        newStatus = sub.status; // 'active', 'past_due', 'canceled', etc.
                        endDate = new Date((sub as any).current_period_end * 1000);

                        // Just basic logic assuming if they have a sub it's the Pro plan
                        if (sub.status === 'active' || sub.status === 'trialing') {
                            newPlan = 'pro';
                        }
                    } else if (user.subscription_status === 'active' || user.subscription_status === 'past_due') {
                        newStatus = 'canceled';
                    }

                    // Update if status differs
                    if (newStatus !== user.subscription_status) {
                        logger.info(`[Stripe Sync] ⚠️ Divergência encontrada! User ${user.id}: DB=${user.subscription_status} -> Stripe=${newStatus}. Atualizando banco...`);
                        await db.run(
                            `UPDATE users
                             SET subscription_status = ?, subscription_plan = ?, subscription_end_date = ?
                             WHERE id = ?`,
                            [newStatus, newPlan, endDate, user.id]
                        );
                        updatedCount++;
                    }

                } catch (userErr: any) {
                    logger.error(`[Stripe Sync] Erro ao sincronizar usuário ${user.id}: ${userErr.message}`);
                }
            }

            logger.info(`[Stripe Sync] ✅ Reconciliação finalizada. ${updatedCount} usuários atualizados.`);

        } catch (error: any) {
            logger.error('[Stripe Sync] ❌ Erro na execução do job de reconciliação:', error.message);
            alertService.sendAlert(`Stripe Sync Job Failed: ${error.message}`, 'SEV2').catch(() => { });
        }
    }

    startScheduler() {
        if (!stripe) return;
        // Run immediately on start
        this.syncSubscriptions();

        // Run every 12 hours (43200000 ms)
        setInterval(() => {
            this.syncSubscriptions();
        }, 12 * 60 * 60 * 1000);

        logger.info('[Stripe Sync] ⏱️ Scheduler de reconciliação iniciado (execução a cada 12 horas).');
    }
}

export const stripeSyncJob = new StripeSyncJob();
