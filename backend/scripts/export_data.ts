import { getDb } from '../db.js';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function exportData() {
    console.log('🚀 Starting data export...');
    const db = await getDb();

    try {
        const users = await db.all('SELECT id, email, subscription_status, trial_expires_at, created_at FROM users');
        const assets = await db.all('SELECT * FROM assets');
        const portfolios = await db.all('SELECT * FROM portfolios');

        const backup = {
            timestamp: new Date().toISOString(),
            users,
            assets,
            portfolios
        };

        const backupDir = path.join(__dirname, '..', 'backups');
        await fs.mkdir(backupDir, { recursive: true });

        const filename = `backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
        const filepath = path.join(backupDir, filename);

        await fs.writeFile(filepath, JSON.stringify(backup, null, 2));
        console.log(`✅ Data exported successfully to: ${filepath}`);
    } catch (error) {
        console.error('❌ Export failed:', error);
        process.exit(1);
    }
}

exportData();
