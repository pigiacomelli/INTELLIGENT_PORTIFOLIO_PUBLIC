import { logger } from './utils/logger.js';
import express from 'express';
import cors from 'cors';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import * as crypto from 'crypto';
import { config } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = config.PORT;

// Trust proxy for express-rate-limit to work correctly in production (Render/Cloudflare/Heroku)
app.set('trust proxy', 1);

// Service imports
import { MarketDataService } from './services/marketDataService.js';
import { PortfolioService } from './services/portfolioService.js';
import { AIService } from './services/aiService.js';
import { AuthService } from './services/authService.js';
import { authenticateToken } from './middleware/authMiddleware.js';
import { PriceUpdateService } from './services/priceUpdateService.js';
import { requestLogger } from './middleware/logger.js';
import { checkSubscription } from './middleware/subscriptionMiddleware.js';
import { stripeService } from './services/stripeService.js';
import { stripeSyncJob } from './services/stripeSyncJob.js';
import { getDb } from './db.js';
import { alertService } from './services/alertService.js';

// Zod Schemas
const authSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres')
});

const assetSchema = z.object({
    ticker: z.string().min(1, 'Nome ou ticker é obrigatório').max(80),
    category: z.string().max(30).optional().default('outros'),
    Instituição: z.string().max(100).optional().nullable(),
    Emissor: z.string().max(100).optional().nullable(),
    indexador: z.string().max(50).optional().nullable(),
    Quantidade: z.number().min(0).default(0),
    precoUnitario: z.number().min(0).default(0),
    vencimento: z.string().optional().nullable(),
    taxa: z.string().max(50).optional().nullable()
});

const tickerSchema = z.string()
    .trim()
    .min(1, 'Ticker obrigatório')
    .max(20, 'Ticker inválido')
    .regex(/^[A-Za-z0-9.^=\-]+$/, 'Ticker inválido');

const marketDataService = new MarketDataService();
const portfolioService = new PortfolioService();
const aiService = new AIService();
const authService = new AuthService();
const priceUpdateService = new PriceUpdateService();

const getDashboardWithCurrentPrices = async (userId: number, portfolioId?: number) => {
    const symbolsData = await portfolioService.getUserPortfolio(userId, portfolioId);
    const marketPricedTypes = new Set(['acoes', 'fiis', 'etfs', 'etfs_internacional', 'cripto', 'acoes_internacionais', 'bonds']);
    const tickerSymbols = [...new Set(
        symbolsData
            .filter(asset => marketPricedTypes.has(asset.type || 'acoes'))
            .map(asset => asset.symbol)
    )];

    const batchPrices = await marketDataService.getBatchPrices(tickerSymbols);
    const currentPrices: Record<string, number> = {};
    Object.entries(batchPrices).forEach(([symbol, price]) => {
        currentPrices[symbol] = price.price;
    });

    return portfolioService.getDashboardFormat(userId, currentPrices, portfolioId);
};

// Rate limiters
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    message: { error: 'Muitas tentativas de acesso. Tente novamente em 15 minutos.' }
});

const chatLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 50,
    message: { error: 'Limite de mensagens atingido. Tente novamente em 1 hora.' }
});

const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 500,
    message: { error: 'Muitas requisições desta rede. Tente novamente em 15 minutos.' }
});

app.use(requestLogger);
app.use(helmet());
app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = config.FRONTEND_URL.split(',').map(o => o.trim());
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id']
}));
app.use(express.json());

// Stripe Webhook
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    try {
        const signature = req.headers['stripe-signature'] as string;
        await stripeService.handleWebhook(req.body, signature);
        res.json({ received: true });
    } catch (error: any) {
        logger.error('[PAYMENT] Webhook error:', error);
        alertService.sendAlert(`Webhook Error: ${error.message}`, 'SEV1').catch(() => { });
        res.status(400).send(`Webhook Error`);
    }
});

// Webhook Stub for E2E testing
app.post('/api/payments/webhook-stub', async (req, res) => {
    if (config.NODE_ENV === 'production') {
        return res.status(403).json({ error: 'Not allowed in production' });
    }
    try {
        const { eventType, userId, plan } = req.body;
        // Simulate the effect of a webhook
        const db = await getDb();
        if (eventType === 'checkout.session.completed') {
            await db.run(
                'UPDATE users SET subscription_status = ?, subscription_plan = ? WHERE id = ?',
                ['active', plan || 'pro', userId]
            );
        }
        res.json({ success: true, message: 'Stub processed' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});


app.use('/api/', globalLimiter);

// --- Health Check ---
app.get('/health', async (req, res) => {
    try {
        const db = await getDb();
        await db.get('SELECT 1');
        res.json({
            status: 'UP',
            db: 'Connected',
            storage: config.LOCAL_MODE ? 'local-sqlite' : 'sqlite',
            databasePath: config.DATABASE_PATH,
            timestamp: new Date().toISOString()
        });
    } catch (err: any) {
        logger.error('[HEALTH CHECK] Database connection failed:', err);
        alertService.sendAlert(`Health Check Failed: ${err.message}`, 'SEV1').catch(() => { });
        res.status(503).json({ status: 'DOWN', db: 'Disconnected', timestamp: new Date().toISOString() });
    }
});

// --- Auth Routes ---
app.post('/api/local/session', async (_req, res) => {
    if (!config.LOCAL_MODE) {
        return res.status(404).json({ error: 'Modo local desativado.' });
    }
    try {
        const session = await authService.createLocalSession();
        res.json(session);
    } catch (error: any) {
        logger.error('[LOCAL] Failed to initialize local profile:', error);
        res.status(500).json({ error: 'Não foi possível abrir a carteira local.' });
    }
});

app.post('/api/auth/register', authLimiter, async (req, res) => {
    try {
        const validated = authSchema.parse(req.body);
        const user = await authService.registerUser(validated.email, validated.password);
        res.status(201).json(user);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/api/auth/login', authLimiter, async (req, res) => {
    try {
        const validated = authSchema.parse(req.body);
        const data = await authService.loginUser(validated.email, validated.password);
        res.json(data);
    } catch (error: any) {
        res.status(401).json({ error: error.message });
    }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
        const userId = req.userId!;
        const userData = await authService.getUserById(userId);
        res.json(userData);
    } catch (error: any) {
        res.status(404).json({ error: error.message });
    }
});

app.delete('/api/auth/me', authenticateToken, async (req, res) => {
    try {
        const userId = req.userId!;
        await authService.deleteAccount(userId);
        res.json({ success: true, message: 'Account deleted' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// --- Market Data Routes ---

app.get('/api/market/price/:ticker', authenticateToken, async (req, res) => {
    try {
        const ticker = tickerSchema.parse(req.params.ticker).toUpperCase();
        const quote = await marketDataService.getStockPrice(ticker);

        if (!Number.isFinite(quote.price) || quote.price <= 0) {
            return res.status(404).json({ error: 'Cotação não encontrada para este ticker.' });
        }

        res.json({
            ...quote,
            symbol: ticker,
            currency: 'BRL'
        });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Informe um ticker válido.' });
        }

        logger.warn(`[MARKET] Quote not found for ${req.params.ticker}:`, error?.message || error);
        res.status(404).json({ error: 'Não encontramos uma cotação para este ticker.' });
    }
});

// --- Portfolio Group Routes ---

app.get('/api/portfolio/groups', authenticateToken, async (req, res) => {
    try {
        const groups = await portfolioService.getPortfolioGroups(req.userId!);
        res.json(groups);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch portfolio groups' });
    }
});

app.post('/api/portfolio/groups', authenticateToken, async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: 'Name is required' });
        const newGroup = await portfolioService.createPortfolioGroup(req.userId!, name);
        res.json(newGroup);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create portfolio group' });
    }
});

app.delete('/api/portfolio/groups/:id', authenticateToken, async (req, res) => {
    try {
        const result = await portfolioService.deletePortfolioGroup(req.userId!, parseInt(String(req.params.id)));
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// --- Portfolio Asset Routes ---

app.get('/api/portfolio', authenticateToken, checkSubscription, async (req, res) => {
    try {
        const userId = req.userId!;
        const portfolioIdRaw = req.query.portfolioId;
        let portfolioId: number | undefined;
        if (typeof portfolioIdRaw === 'string') {
            portfolioId = parseInt(portfolioIdRaw);
        } else if (Array.isArray(portfolioIdRaw) && typeof portfolioIdRaw[0] === 'string') {
            portfolioId = parseInt(portfolioIdRaw[0]);
        }

        const dashboard = await getDashboardWithCurrentPrices(userId, portfolioId);
        res.json(dashboard);
    } catch (error) {
        logger.error('Portfolio fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch portfolio' });
    }
});

app.post('/api/portfolio/asset', authenticateToken, checkSubscription, async (req, res) => {
    try {
        const userId = req.userId!;
        const assetData = assetSchema.parse(req.body);
        const { portfolioId } = req.body;
        const db = await getDb();

        await db.run(
            'INSERT INTO assets (symbol, name, type) VALUES (?, ?, ?) ON CONFLICT (symbol) DO NOTHING',
            [assetData.ticker.toUpperCase(), assetData.ticker.toUpperCase(), assetData.category]
        );

        let targetId = portfolioId;
        if (!targetId) {
            const firstGroup = await db.get('SELECT id FROM portfolio_groups WHERE user_id = ? ORDER BY id ASC LIMIT 1', [userId]);
            targetId = firstGroup?.id;
        }
        if (!targetId) return res.status(400).json({ error: 'Carteira não encontrada.' });

        await db.run(
            `INSERT INTO portfolios (user_id, symbol, quantity, avg_price, instituicao, indexador, emissor, source, portfolio_id, vencimento, taxa) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                userId,
                assetData.ticker.toUpperCase(),
                assetData.Quantidade,
                assetData.precoUnitario,
                assetData['Instituição'],
                assetData.indexador,
                assetData.Emissor,
                'manual',
                targetId,
                assetData.vencimento || null,
                assetData.taxa || null
            ]
        );

        const dashboard = await getDashboardWithCurrentPrices(userId, targetId);
        res.json({ success: true, dashboard });
    } catch (error: any) {
        logger.error('[ASSET] Error adding asset:', error?.message || error);
        res.status(500).json({ error: 'Failed to add asset', details: error?.message });
    }
});

app.post('/api/portfolio/bulk', authenticateToken, checkSubscription, async (req, res) => {
    try {
        const { assets, portfolioId } = req.body;
        await portfolioService.bulkAddAssets(req.userId!, assets, portfolioId);
        const dashboard = await getDashboardWithCurrentPrices(req.userId!, portfolioId);
        res.json({ success: true, dashboard });
    } catch (error: any) {
        logger.error('[ASSET] Error in bulk import:', error?.message || error);
        res.status(500).json({ error: 'Failed to import assets', details: error?.message });
    }
});

app.put('/api/portfolio/asset/:id', authenticateToken, checkSubscription, async (req, res) => {
    try {
        const assetData = assetSchema.parse(req.body);
        const { portfolioId } = req.body;
        const db = await getDb();

        await db.run(
            `UPDATE portfolios 
             SET symbol = ?, quantity = ?, avg_price = ?, instituicao = ?, indexador = ?, emissor = ?, vencimento = ?, taxa = ?
             WHERE id = ? AND user_id = ?`,
            [
                assetData.ticker.toUpperCase(),
                assetData.Quantidade,
                assetData.precoUnitario,
                assetData['Instituição'],
                assetData.indexador,
                assetData.Emissor,
                assetData.vencimento || null,
                assetData.taxa || null,
                req.params.id,
                req.userId!
            ]
        );

        const dashboard = await getDashboardWithCurrentPrices(req.userId!, portfolioId);
        res.json({ success: true, dashboard });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update asset' });
    }
});

app.delete('/api/portfolio/asset/:id', authenticateToken, checkSubscription, async (req, res) => {
    try {
        const userId = req.userId!;
        const portfolioIdRaw = req.query.portfolioId;
        let portfolioId: number | undefined;
        if (typeof portfolioIdRaw === 'string') {
            portfolioId = parseInt(portfolioIdRaw);
        } else if (Array.isArray(portfolioIdRaw) && typeof portfolioIdRaw[0] === 'string') {
            portfolioId = parseInt(portfolioIdRaw[0]);
        }
        const db = await getDb();
        await db.run('DELETE FROM portfolios WHERE id = ? AND user_id = ?', [req.params.id, req.userId!]);
        const dashboard = await getDashboardWithCurrentPrices(req.userId!, portfolioId);
        res.json({ success: true, dashboard });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete asset' });
    }
});

app.post('/api/portfolio/share', authenticateToken, checkSubscription, async (req, res) => {
    try {
        const { portfolioId } = req.body;
        const db = await getDb();
        let targetId = portfolioId;
        if (!targetId) {
            const firstGroup = await db.get('SELECT id FROM portfolio_groups WHERE user_id = ? ORDER BY id ASC LIMIT 1', [req.userId!]);
            targetId = firstGroup?.id;
        }
        if (!targetId) return res.status(400).json({ error: 'Carteira não encontrada.' });

        const token = crypto.randomUUID();
        await db.run(
            `INSERT INTO public_portfolios (user_id, portfolio_id, public_token) 
             VALUES (?, ?, ?) 
             ON CONFLICT (user_id) DO UPDATE SET public_token = EXCLUDED.public_token, portfolio_id = EXCLUDED.portfolio_id`,
            [req.userId!, targetId, token]
        );
        res.json({ token, portfolioId: targetId });
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate share link' });
    }
});

app.get('/api/portfolio/public/:token', async (req, res) => {
    try {
        const db = await getDb();
        const mapping = await db.get('SELECT user_id, portfolio_id FROM public_portfolios WHERE public_token = ?', [req.params.token]);
        if (!mapping) return res.status(404).json({ error: 'Portfólio não encontrado.' });

        const dashboardData = await portfolioService.getDashboardFormat(mapping.user_id, {}, mapping.portfolio_id);
        res.json({
            ativos: dashboardData.ativos,
            totais: dashboardData.totais,
            total_geral: dashboardData.totalInvestido,
            allocations: dashboardData.allocations,
            patrimonioAtual: dashboardData.patrimonioAtual
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to load public portfolio' });
    }
});


// --- AI Routes ---

app.get('/api/portfolio/diagnostic', authenticateToken, checkSubscription, async (req, res) => {
    try {
        logger.info('📡 [ROUTE] GET /api/portfolio/diagnostic hit');
        const userId = req.userId!;
        const dashboardData = await portfolioService.getDashboardFormat(userId, {});
        logger.info('📊 [ROUTE] Dashboard data retrieved for diagnostic');
        const result = await aiService.generateDiagnostic(dashboardData);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/chat', authenticateToken, checkSubscription, chatLimiter, async (req, res) => {
    try {
        const { message, history } = req.body;
        const portfolioContext = await portfolioService.getDashboardFormat(req.userId!, {});
        const reply = await aiService.generateChatResponse(message, portfolioContext, history);
        res.json({ reply });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// --- Payment Routes ---

app.post('/api/payments/create-checkout-session', authenticateToken, async (req: any, res) => {
    try {
        const frontendUrl = config.FRONTEND_URL;
        const session = await stripeService.createCheckoutSession(req.userId!, req.user?.email || '', frontendUrl);
        res.json({ url: session.url });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create checkout session' });
    }
});

app.post('/api/payments/create-portal-session', authenticateToken, async (req: any, res) => {
    try {
        const frontendUrl = config.FRONTEND_URL;
        const session = await stripeService.createCustomerPortalSession(req.userId!, frontendUrl);
        res.json({ url: session.url });
    } catch (error: any) {
        res.status(400).json({ error: error.message || 'Failed to create portal session' });
    }
});

app.get('/api/payments/subscription-status', authenticateToken, async (req: any, res) => {
    try {
        if (config.LOCAL_MODE) {
            return res.json({
                status: 'active',
                plan: 'local',
                isActive: true,
                isTrial: false,
                trialDaysLeft: 0,
                subscriptionEndDate: null,
                localMode: true
            });
        }
        const db = await getDb();
        const user = await db.get(
            'SELECT subscription_status, subscription_plan, trial_expires_at, subscription_end_date FROM users WHERE id = ?',
            [req.userId!]
        );
        if (!user) return res.status(404).json({ error: 'User not found' });

        const now = new Date();
        const trialExpires = user.trial_expires_at ? new Date(user.trial_expires_at) : null;
        const trialDaysLeft = trialExpires
            ? Math.max(0, Math.ceil((trialExpires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
            : 0;

        res.json({
            status: user.subscription_status,
            plan: user.subscription_plan,
            isActive: user.subscription_status === 'active',
            isTrial: trialExpires ? trialExpires > now : false,
            trialDaysLeft,
            subscriptionEndDate: user.subscription_end_date,
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch subscription status' });
    }
});

// --- Global Error Handler ---
app.use((err: any, req: any, res: any, next: any) => {
    if (err instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation failed', details: err.issues });
    }
    logger.error(`[ERROR] 500 Unhandled Exception - URL: ${req.url} - Error:`, err);

    // MVP Alert
    alertService.sendAlert(`Unhandled Exception at ${req.url}: ${err.message}`, 'SEV1', req.requestId).catch(() => { });

    res.status(500).json({ error: 'Internal Server Error', requestId: req.requestId });
});

export { app };

async function verifyDatabaseConnection() {
    try {
        const db = await getDb();
        await db.get('SELECT 1');
        logger.info('Database connectivity check passed.');
        return true;
    } catch (error: any) {
        logger.error('[STARTUP] Database connectivity check failed:', error);
        return false;
    }
}

export async function startServer(nodeEnv = process.env.NODE_ENV) {
    const dbReady = await verifyDatabaseConnection();

    if (!dbReady && (nodeEnv === 'production' || config.NODE_ENV === 'production')) {
        throw new Error('Startup aborted: database is unreachable in production.');
    }

    const server = app.listen(PORT, () => logger.info(`Server running at http://localhost:${PORT}`));

    if (!dbReady) {
        logger.warn('[STARTUP] Skipping background jobs because the database is unavailable.');
        return server;
    }

    // Stagger background jobs to prevent overwhelming the DB/Network on start
    setTimeout(() => {
        priceUpdateService.startScheduler();
    }, 5000);

    if (config.STRIPE_SECRET_KEY && !config.LOCAL_MODE) {
        setTimeout(() => {
            stripeSyncJob.startScheduler();
        }, 10000);
    }

    return server;
}

if (config.NODE_ENV !== 'test') {
    startServer().catch((error) => {
        logger.fatal('[STARTUP] Fatal error while starting server:', error);
        process.exit(1);
    });
}
