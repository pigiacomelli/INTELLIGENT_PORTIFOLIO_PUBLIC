import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/test';
process.env.JWT_SECRET = 'test-secret';

const startupMocks = vi.hoisted(() => ({
    mockDbGet: vi.fn(),
    mockDbRun: vi.fn(),
    mockDbAll: vi.fn(),
    mockDbExec: vi.fn(),
    mockPriceStartScheduler: vi.fn(),
    mockStripeStartScheduler: vi.fn(),
    mockLoggerInfo: vi.fn(),
    mockLoggerWarn: vi.fn(),
    mockLoggerError: vi.fn(),
    mockLoggerFatal: vi.fn(),
    mockServer: { close: vi.fn() }
}));

vi.mock('../db.js', () => ({
    getDb: vi.fn(async () => ({
        get: startupMocks.mockDbGet,
        run: startupMocks.mockDbRun,
        all: startupMocks.mockDbAll,
        exec: startupMocks.mockDbExec
    }))
}));

vi.mock('../utils/logger.js', () => ({
    logger: {
        info: startupMocks.mockLoggerInfo,
        warn: startupMocks.mockLoggerWarn,
        error: startupMocks.mockLoggerError,
        fatal: startupMocks.mockLoggerFatal
    }
}));

vi.mock('../services/priceUpdateService.js', () => ({
    PriceUpdateService: class {
        startScheduler() {
            startupMocks.mockPriceStartScheduler();
        }
    }
}));

vi.mock('../services/stripeSyncJob.js', () => ({
    stripeSyncJob: {
        startScheduler: startupMocks.mockStripeStartScheduler
    }
}));

vi.mock('../services/marketDataService.js', () => ({
    MarketDataService: class {
        async getBatchPrices() {
            return {};
        }
    }
}));

vi.mock('../services/portfolioService.js', () => ({
    PortfolioService: class {
        async getPortfolioGroups() {
            return [{ id: 1, name: 'Minha Carteira' }];
        }

        async getPortfolio() {
            return { id: 1, name: 'Minha Carteira', assets: [] };
        }
    }
}));

vi.mock('../services/stripeService.js', () => ({
    stripeService: {
        createCheckoutSession: vi.fn(async () => ({ url: 'https://stripe.com/checkout' })),
        getSubscriptionStatus: vi.fn(async () => ({ isActive: true, plan: 'pro' })),
        handleWebhook: vi.fn(async () => undefined)
    }
}));

vi.mock('../services/alertService.js', () => ({
    alertService: {
        sendAlert: vi.fn(async () => undefined)
    }
}));

vi.mock('../services/aiService.js', () => ({
    AIService: class { }
}));

vi.mock('../services/authService.js', () => ({
    AuthService: class {
        async registerUser(email: string) {
            return { id: 1, email };
        }

        async loginUser(email: string) {
            return { token: 'jwt', user: { id: 1, email } };
        }

        async getUserById() {
            return { id: 1, email: 'test@example.com' };
        }

        async deleteAccount() {
            return;
        }
    }
}));

describe('startServer', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.useFakeTimers();

        startupMocks.mockDbGet.mockReset();
        startupMocks.mockDbRun.mockReset();
        startupMocks.mockDbAll.mockReset();
        startupMocks.mockDbExec.mockReset();
        startupMocks.mockPriceStartScheduler.mockReset();
        startupMocks.mockStripeStartScheduler.mockReset();
        startupMocks.mockLoggerInfo.mockReset();
        startupMocks.mockLoggerWarn.mockReset();
        startupMocks.mockLoggerError.mockReset();
        startupMocks.mockLoggerFatal.mockReset();
        startupMocks.mockServer.close.mockReset();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    it.skip('starts the server and schedules background jobs when the database is available', async () => {
        startupMocks.mockDbGet.mockResolvedValueOnce({ ok: 1 });

        const { app, startServer } = await import('../index.js');
        const listenSpy = vi.spyOn(app, 'listen').mockImplementation((() => startupMocks.mockServer) as any);

        const server = await startServer();

        expect(server).toBe(startupMocks.mockServer);
        expect(listenSpy).toHaveBeenCalledTimes(1);
        expect(startupMocks.mockLoggerInfo).toHaveBeenCalledWith('Database connectivity check passed.');

        // Advance timers to trigger staggered background jobs
        vi.advanceTimersByTime(11000);

        expect(startupMocks.mockPriceStartScheduler).toHaveBeenCalledTimes(1);
        expect(startupMocks.mockStripeStartScheduler).toHaveBeenCalledTimes(1);
    });

    it.skip('starts the server but skips background jobs outside production when the database is unavailable', async () => {
        startupMocks.mockDbGet.mockRejectedValueOnce(new Error('db down'));

        const { app, startServer } = await import('../index.js');
        const listenSpy = vi.spyOn(app, 'listen').mockImplementation((() => startupMocks.mockServer) as any);

        const server = await startServer('development');

        expect(server).toBe(startupMocks.mockServer);
        expect(listenSpy).toHaveBeenCalledTimes(1);
        expect(startupMocks.mockLoggerWarn).toHaveBeenCalledWith('[STARTUP] Skipping background jobs because the database is unavailable.');

        vi.advanceTimersByTime(11000);
        expect(startupMocks.mockPriceStartScheduler).not.toHaveBeenCalled();
        expect(startupMocks.mockStripeStartScheduler).not.toHaveBeenCalled();
    });

    it.skip('fails fast in production when the database is unavailable', async () => {
        startupMocks.mockDbGet.mockRejectedValueOnce(new Error('db down'));

        const { app, startServer } = await import('../index.js');
        const listenSpy = vi.spyOn(app, 'listen').mockImplementation((() => startupMocks.mockServer) as any);

        await expect(startServer('production')).rejects.toThrow('Startup aborted: database is unreachable in production.');

        expect(listenSpy).not.toHaveBeenCalled();

        vi.advanceTimersByTime(11000);
        expect(startupMocks.mockPriceStartScheduler).not.toHaveBeenCalled();
        expect(startupMocks.mockStripeStartScheduler).not.toHaveBeenCalled();
    });
});
