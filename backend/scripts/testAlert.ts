import dotenv from 'dotenv';
dotenv.config();

// Temporary bypass just for manual verification script
if (!process.env.ALERT_WEBHOOK_URL) {
    process.env.ALERT_WEBHOOK_URL = 'https://discord.com/api/webhooks/mocked_for_test';
}

import { alertService } from '../services/alertService.js';

async function testAlert() {
    console.log(`Triggering test alert to: ${process.env.ALERT_WEBHOOK_URL}`);
    try {
        await alertService.sendAlert('MANUAL TEST ALERT: This is a test of the incident alerting system.', 'SEV1', 'mock-req-1234');
        console.log('✅ Alert payload processed by service.');
    } catch (error) {
        console.error('❌ Failed to test alert', error);
    }
}

testAlert();
