import { logger } from '../utils/logger.js';
import { getDb } from '../db.js';
import { MarketDataService } from './marketDataService.js';
import { alertService } from './alertService.js';

export class PriceUpdateService {
    private marketDataService: MarketDataService;
    private interval: NodeJS.Timeout | null = null;

    constructor() {
        this.marketDataService = new MarketDataService();
    }

    async updateAllPrices(retries = 2) {
        logger.info('🕒 Starting background price update for known portfolio assets...');
        const db = await getDb();

        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                // Get all unique symbols currently in portfolios except fixed income
                const symbolsResult = await db.all(`
                    SELECT DISTINCT p.symbol 
                    FROM portfolios p
                    LEFT JOIN assets a ON p.symbol = a.symbol
                    WHERE a.type IS NULL OR a.type NOT IN ('renda_fixa', 'tesouro')
                `);
                const symbols = symbolsResult.map((r: any) => r.symbol);

                if (symbols.length === 0) {
                    logger.info('ℹ️ No assets in portfolios to update.');
                    return;
                }

                logger.info(`ℹ️ Updating prices for ${symbols.length} portfolio symbols (Attempt ${attempt})...`);
                const results = await this.marketDataService.getBatchPrices(symbols);

                const successful = Object.keys(results).length;
                logger.info(`✅ Background price update completed. (${successful}/${symbols.length} successful)`);
                return; // Success, exit retry loop
            } catch (error) {
                logger.error(`❌ Error in updateAllPrices (Attempt ${attempt}/${retries}):`, error);
                if (attempt < retries) {
                    await new Promise(resolve => setTimeout(resolve, 5000 * attempt)); // Exponential backoff
                } else {
                    alertService.sendAlert(`Price Update Service failed after ${retries} attempts: ${error instanceof Error ? error.message : String(error)}`, 'SEV2').catch(() => { });
                }
            }
        }
    }

    startScheduler() {
        if (this.interval) return;

        logger.info(`🚀 PriceUpdateService scheduler started (Portfolio 30min).`);

        // 1. Initial syncs
        this.updateAllPrices();

        // 2. Periodic schedules
        setInterval(() => this.updateAllPrices(), 30 * 60 * 1000);
    }

    stopScheduler() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
            logger.info('🛑 PriceUpdateService scheduler stopped.');
        }
    }
}
