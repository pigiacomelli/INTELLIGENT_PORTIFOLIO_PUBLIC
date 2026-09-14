import { neon } from '@neondatabase/serverless';
import { config } from './config.js';

// Single neon HTTP client instance – no per-query curl process spawning
const sql = neon(config.DATABASE_URL);

// Convert SQLite/knex-style "?" placeholders → PostgreSQL "$1, $2, ..." style
const convertQuery = (query: string): string => {
    let index = 1;
    return query.replace(/\?/g, () => `$${index++}`);
};

async function queryWithRetry(queryText: string, params: any[] = [], maxRetries = 3) {
    let lastError: any;
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await sql.query(queryText, params);
        } catch (error: any) {
            lastError = error;
            const isTransient = error.message?.includes('fetch failed') || error.code === 'ETIMEDOUT' || error.message?.includes('socket hang up');
            if (isTransient && i < maxRetries - 1) {
                const delay = Math.pow(2, i) * 1000;
                console.warn(`[DB] Query failed (attempt ${i + 1}/${maxRetries}), retrying in ${delay}ms...`, error.message);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }
            throw error;
        }
    }
    throw lastError;
}

export async function getDb() {
    const run = async (queryText: string, params: any[] = []) => {
        const pgQuery = convertQuery(queryText);
        return await queryWithRetry(pgQuery, params);
    };

    const get = async (queryText: string, params: any[] = []): Promise<any> => {
        const pgQuery = convertQuery(queryText);
        const result = await queryWithRetry(pgQuery, params);
        return (result as any[])[0] || null;
    };

    const all = async (queryText: string, params: any[] = []): Promise<any[]> => {
        const pgQuery = convertQuery(queryText);
        return (await queryWithRetry(pgQuery, params)) as any[];
    };

    const exec = async (queryText: string) => {
        // Neon HTTP driver supports multiple statements in a single execution when NOT using placeholders.
        // This is much safer than naive splitting by semicolon which fails inside strings/comments.
        return await sql.query(queryText, []);
    };

    const transaction = async <T>(
        callback: (tx: {
            run: (q: string, p?: any[]) => Promise<any>;
            get: (q: string, p?: any[]) => Promise<any>;
            all: (q: string, p?: any[]) => Promise<any[]>;
        }) => Promise<T>
    ): Promise<T> => {
        // Neon HTTP driver doesn't support interactive transactions.
        // For atomic multi-query operations use sql.transaction([...]) at the call site.
        return await callback({ run, get, all });
    };

    return { run, get, all, exec, transaction };
}
