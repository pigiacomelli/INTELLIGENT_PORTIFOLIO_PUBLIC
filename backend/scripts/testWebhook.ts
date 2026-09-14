import { getDb } from '../db.js';
import { stripeService } from '../services/stripeService.js';
import dotenv from 'dotenv';
dotenv.config();

async function runTest() {
    console.log("Starting Stripe Webhook Integration Test...");
    const db = await getDb();

    // 1. Create a dummy user
    const email = `test_webhook_${Date.now()}@example.com`;
    const res = await db.run(
        'INSERT INTO users (email, password_hash, subscription_status) VALUES (?, ?, ?) RETURNING id',
        [email, 'dummy_hash', 'inactive']
    );
    // Use lastID to get the inserted user's ID
    const userRow = await db.get('SELECT id FROM users WHERE email = ?', [email]);
    const userId = userRow.id;
    console.log(`Created test user: ID ${userId}`);

    // 2. Prepare mock Stripe event
    const eventId = `evt_test_${Date.now()}`;
    const mockEvent = {
        id: eventId,
        type: 'checkout.session.completed',
        data: {
            object: {
                client_reference_id: userId.toString(),
                customer: `cus_test_${userId}`
            }
        }
    };

    // 3. Temporarily bypass webhook secret verify by deleting it from env for this exact call
    const originalSecret = process.env.STRIPE_WEBHOOK_SECRET;
    delete process.env.STRIPE_WEBHOOK_SECRET;

    console.log("Sending checkout.session.completed event to stripeService...");
    await stripeService.handleWebhook(mockEvent, '');

    // Restore secret
    if (originalSecret) process.env.STRIPE_WEBHOOK_SECRET = originalSecret;

    // 4. Verify DB changes
    const updatedUser = await db.get('SELECT subscription_status, subscription_plan, stripe_customer_id FROM users WHERE id = ?', [userId]);
    console.log("Updated User State:", updatedUser);

    if (updatedUser.subscription_status === 'active' && updatedUser.subscription_plan === 'pro') {
        console.log("✅ SUCCESS: Webhook properly updated user subscription status.");
    } else {
        console.error("❌ FAILED: User status was not updated correctly.");
        process.exit(1);
    }

    // 5. Verify Idempotency - sending again should not crash
    console.log("Sending duplicated event to test idempotency...");
    await stripeService.handleWebhook(mockEvent, '');
    const countEvents = await db.get('SELECT COUNT(*) as count FROM stripe_events WHERE id = ?', [eventId]);
    if (countEvents.count === 1) {
        console.log("✅ SUCCESS: Event was not processed twice (idempotency works).");
    } else {
        console.error("❌ FAILED: Event idempotency failed.");
        process.exit(1);
    }

    // Cleanup
    await db.run('DELETE FROM stripe_events WHERE id = ?', [eventId]);
    await db.run('DELETE FROM users WHERE id = ?', [userId]);
    console.log("Test finished successfully.");
    process.exit(0);
}

runTest().catch(console.error);
