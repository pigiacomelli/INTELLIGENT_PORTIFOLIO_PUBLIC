import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.string().default('3001').transform(Number),
    DATABASE_URL: z.string().url('DATABASE_URL deve ser uma URL válida'),
    JWT_SECRET: z.string().min(32, 'JWT_SECRET deve ter pelo menos 32 caracteres para segurança'),
    FRONTEND_URL: z.string().min(1, 'FRONTEND_URL é obrigatória'),

    // Data Providers
    BRAPI_API_KEY: z.string().optional(),
    GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY é obrigatória'),

    // Payments
    STRIPE_SECRET_KEY: z.string().min(1, 'STRIPE_SECRET_KEY é obrigatória'),
    STRIPE_WEBHOOK_SECRET: z.string().min(1, 'STRIPE_WEBHOOK_SECRET é obrigatória'),

    // Observability
    ALERT_WEBHOOK_URL: z.string().url().optional().or(z.literal('')),
    TRIAL_DAYS: z.string().default('30').transform(Number),
    LOG_LEVEL: z.enum(['info', 'warn', 'error', 'fatal']).default('info'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
    console.error('❌ Invalid environment variables:', JSON.stringify(_env.error.format(), null, 2));
    if (process.env.NODE_ENV === 'production') {
        process.exit(1);
    }
}

export const config = _env.success ? _env.data : ({} as z.infer<typeof envSchema>);

export type Config = typeof config;
