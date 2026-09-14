import request from 'supertest';
import { beforeAll, describe, expect, it, vi } from 'vitest';

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/test';
process.env.JWT_SECRET = 'test-secret-that-is-at-least-32-characters-long';

vi.mock('jsonwebtoken', () => ({
    default: {
        verify: vi.fn((token, secret, cb) => {
            if (token === 'valid-jwt') cb(null, { userId: 1, email: 'test@example.com' });
            else cb(new Error('invalid'));
        }),
        sign: vi.fn(() => 'valid-jwt')
    }
}));

const mockRun = vi.fn();
const mockGet = vi.fn();
const mockAll = vi.fn();
const mockExec = vi.fn();

vi.mock('../db.js', () => ({
    getDb: vi.fn(async () => ({ run: mockRun, get: mockGet, all: mockAll, exec: mockExec }))
}));

vi.mock('../services/priceUpdateService.js', () => ({
    PriceUpdateService: class {
        startScheduler() { }
    }
}));

vi.mock('../services/stripeSyncJob.js', () => ({
    stripeSyncJob: { startScheduler: vi.fn() }
}));

vi.mock('../services/marketDataService.js', () => ({
    MarketDataService: class {
        async getBatchPrices() { return {}; }
    }
}));

vi.mock('../services/portfolioService.js', () => ({
    PortfolioService: class {
        async getPortfolioGroups() { return [{ id: 1, name: 'Minha Carteira' }]; }
        async getPortfolio() { return { id: 1, name: 'Minha Carteira', assets: [] }; }
    }
}));

vi.mock('../services/stripeService.js', () => ({
    stripeService: {
        createCheckoutSession: vi.fn(async () => ({ url: 'https://stripe.com/checkout' })),
        getSubscriptionStatus: vi.fn(async () => ({ isActive: true, plan: 'pro' }))
    }
}));

vi.mock('../services/aiService.js', () => ({
    AIService: class { }
}));

vi.mock('../services/authService.js', () => ({
    AuthService: class {
        async registerUser(email: string) {
            return { token: 'valid-jwt', user: { id: 1, email, subscriptionStatus: 'trial', subscriptionPlan: 'free' } };
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

let app: any;

beforeAll(async () => {
    app = (await import('../index.js')).app;
});

describe('Contract tests', () => {
    it('GET /health returns UP when db is connected', async () => {
        mockGet.mockResolvedValueOnce({ ok: 1 });

        const response = await request(app).get('/health');

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('UP');
    });

    it('POST /api/auth/register validates invalid payload', async () => {
        const response = await request(app).post('/api/auth/register').send({ email: 'invalid-email', password: '123' });
        expect(response.status).toBe(400);
    });

    it('POST /api/auth/register accepts valid payload', async () => {
        const response = await request(app).post('/api/auth/register').send({ email: 'valid@email.com', password: '12312345' });
        expect(response.status).toBe(201);
        expect(response.body.token).toBeDefined();
        expect(response.body.user).toBeDefined();
    });

    it('POST /api/auth/login accepts valid payload', async () => {
        const response = await request(app).post('/api/auth/login').send({ email: 'valid@email.com', password: '12312345' });
        expect(response.status).toBe(200);
        expect(response.body.token).toBeDefined();
    });

    it('GET /api/portfolio/groups requires authentication', async () => {
        const response = await request(app).get('/api/portfolio/groups');
        expect(response.status).toBe(401);
    });

    it('GET /api/portfolio/groups returns groups for authenticated user', async () => {
        const response = await request(app)
            .get('/api/portfolio/groups')
            .set('Authorization', 'Bearer valid-jwt');

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body[0].name).toBe('Minha Carteira');
    });

    it('POST /api/payments/create-checkout-session returns stripe url', async () => {
        const response = await request(app)
            .post('/api/payments/create-checkout-session')
            .set('Authorization', 'Bearer valid-jwt')
            .send({ priceId: 'price_123' });

        expect(response.status).toBe(200);
        expect(response.body.url).toBe('https://stripe.com/checkout');
    });
});
