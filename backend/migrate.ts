import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDb } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

async function ensureMigrationsTable() {
    const db = await getDb();
    await db.exec(`
        CREATE TABLE IF NOT EXISTS _migrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT UNIQUE NOT NULL,
            applied_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `);
}

async function getAppliedMigrations(): Promise<Set<string>> {
    const db = await getDb();
    const rows = await db.all('SELECT filename FROM _migrations');
    return new Set(rows.map((row: any) => row.filename));
}

async function runMigration(filename: string, direction: 'up' | 'down' = 'up') {
    const db = await getDb();
    const migrationPath = path.join(MIGRATIONS_DIR, filename);
    const content = await fs.readFile(migrationPath, 'utf-8');

    // Split by -- DOWN or similar marker if using single file, 
    // but for simplicity let's support separate .down.sql files if they exist
    const downPath = migrationPath.replace('.sql', '.down.sql');
    let sql = content;

    if (direction === 'down') {
        try {
            sql = await fs.readFile(downPath, 'utf-8');
        } catch (e) {
            console.warn(`⚠️ No down migration found for ${filename}, skipping SQL execution.`);
            sql = '';
        }
    }

    console.log(`🔄 ${direction === 'up' ? 'Applying' : 'Rolling back'} migration: ${filename}`);
    await db.transaction(async (tx) => {
        if (sql) await tx.exec(sql);
        if (direction === 'up') {
            await tx.run('INSERT INTO _migrations (filename) VALUES (?)', [filename]);
        } else {
            await tx.run('DELETE FROM _migrations WHERE filename = ?', [filename]);
        }
    });
    console.log(`✅ Migration ${direction === 'up' ? 'applied' : 'rolled back'}: ${filename}`);
}

async function rollback() {
    await ensureMigrationsTable();
    const db = await getDb();
    const lastMigration = await db.get('SELECT filename FROM _migrations ORDER BY id DESC LIMIT 1');

    if (!lastMigration) {
        console.log('ℹ️ No migrations to rollback.');
        return;
    }

    await runMigration(lastMigration.filename, 'down');
}

async function migrate() {
    await ensureMigrationsTable();

    const files = (await fs.readdir(MIGRATIONS_DIR))
        .filter((file) => file.endsWith('.sql') && !file.endsWith('.down.sql'))
        .sort();

    const applied = await getAppliedMigrations();

    let appliedCount = 0;
    for (const file of files) {
        if (applied.has(file)) {
            continue;
        }
        await runMigration(file, 'up');
        appliedCount += 1;
    }

    console.log(`✅ Migration process finished. New migrations applied: ${appliedCount}`);
}

const command = process.argv[2] || 'up';

if (command === 'up') {
    migrate().catch((error) => {
        console.error('❌ Migration runner failed:', error);
        process.exit(1);
    });
} else if (command === 'down') {
    rollback().catch((error) => {
        console.error('❌ Rollback failed:', error);
        process.exit(1);
    });
}
