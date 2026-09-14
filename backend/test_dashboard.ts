import { PortfolioService } from './services/portfolioService.js';
import { MarketDataService } from './services/marketDataService.js';

async function testDashboard(userId: number) {
    const portfolioService = new PortfolioService();
    const marketDataService = new MarketDataService();

    console.log(`\n--- TESTING USER ID: ${userId} ---`);
    const portfolioData = await portfolioService.getUserPortfolio(userId);
    console.log(`Assets in DB for user ${userId}: ${portfolioData.length}`);

    const symbols = [...new Set(portfolioData.map(p => p.symbol))];
    const batchPrices = await marketDataService.getBatchPrices(symbols);
    const currentPrices: Record<string, number> = {};
    if (Array.isArray(batchPrices)) {
        batchPrices.forEach(p => {
            currentPrices[p.symbol] = p.price;
        });
    }

    const dashboardData = await portfolioService.getDashboardFormat(userId, currentPrices);
    console.log('TOTAL INVESTIDO:', dashboardData.totalInvestido);
    console.log('ATIVOS CATEGORIES:', Object.keys(dashboardData.ativos));
}

async function run() {
    await testDashboard(2);
    await testDashboard(3);
}

run().catch(console.error);
