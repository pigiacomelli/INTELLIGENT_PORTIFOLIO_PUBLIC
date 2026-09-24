import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const booleanFromEnv = z.string().default('true').transform((value) => value !== 'false');

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.string().default('3001').transform(Number),
    DATABASE_PATH: z.string().min(1).default('data/intelligent-portfolio.db'),
    LOCAL_MODE: booleanFromEnv,
    JWT_SECRET: z.string().min(32).default('intelligent-portfolio-local-secret-2026'),
    FRONTEND_URL: z.string().min(1).default('http://localhost:5173'),

    BRAPI_API_KEY: z.string().optional().default(''),
    GEMINI_API_KEY: z.string().optional().default(''),

    STRIPE_SECRET_KEY: z.string().optional().default(''),
    STRIPE_WEBHOOK_SECRET: z.string().optional().default(''),

    ALERT_WEBHOOK_URL: z.string().url().optional().or(z.literal('')).default(''),
    TRIAL_DAYS: z.string().default('30').transform(Number),
    LOG_LEVEL: z.enum(['info', 'warn', 'error', 'fatal']).default('info'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error('❌ Variáveis de ambiente inválidas:', JSON.stringify(parsed.error.format(), null, 2));
    throw new Error('Não foi possível iniciar o aplicativo. Revise backend/.env.');
}

export const config = parsed.data;
export type Config = typeof config;
