import { getDb } from './db.js';

async function migratePublic() {
    console.log('🔄 Creating public_portfolios table...');
    const db = await getDb();
    try {
        await db.run(`
            CREATE TABLE IF NOT EXISTS public_portfolios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL UNIQUE,
                portfolio_id INTEGER,
                public_token TEXT NOT NULL UNIQUE,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ public_portfolios table created successfully.');
    } catch (e) {
        console.error('❌ Migration failed:', e);
    }
}

migratePublic().catch(console.error);
