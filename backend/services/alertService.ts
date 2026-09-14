import axios from 'axios';
import { config } from '../config.js';

type Severity = 'SEV1' | 'SEV2' | 'SEV3';

class AlertService {
    private webhookUrl: string | undefined;

    constructor() {
        this.webhookUrl = config.ALERT_WEBHOOK_URL;
    }

    async sendAlert(message: string, severity: Severity = 'SEV3', requestId?: string) {
        const payload = {
            timestamp: new Date().toISOString(),
            severity,
            requestId: requestId || null,
            message
        };

        process.stdout.write(`[ALERT] ${JSON.stringify(payload)}\n`);

        if (!this.webhookUrl) {
            return;
        }

        try {
            await axios.post(this.webhookUrl, {
                content: `🚨 **[${severity}] ALERT**\nRequestId: ${requestId || 'n/a'}\n${message}\nTimestamp: ${payload.timestamp}`
            });
        } catch (error) {
            process.stderr.write(`[ALERT] Failed to send webhook alert: ${error}\n`);
        }
    }
}

export const alertService = new AlertService();
