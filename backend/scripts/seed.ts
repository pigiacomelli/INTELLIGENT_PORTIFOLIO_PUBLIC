import { getDb } from '../db.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const moduleDirectory = path.dirname(fileURLToPath(import.meta.url));

async function seed() {
    const db = await getDb();
    const user = await db.get('SELECT id FROM users ORDER BY id ASC LIMIT 1');

    if (!user) {
        throw new Error('Crie uma conta no aplicativo antes de importar os dados de exemplo.');
    }

    let group = await db.get(
        'SELECT id FROM portfolio_groups WHERE user_id = ? ORDER BY id ASC LIMIT 1',
        [user.id]
    );
    if (!group) {
        const insertion = await db.run(
            'INSERT INTO portfolio_groups (user_id, name) VALUES (?, ?)',
            [user.id, 'Minha Carteira']
        );
        group = { id: insertion.lastInsertRowid };
    }

    const dataPath = path.resolve(moduleDirectory, '../portfolio.json');
    if (!fs.existsSync(dataPath)) {
        console.log('Arquivo portfolio.json não encontrado. Nada a importar.');
        return;
    }

    const portfolio = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    const positions = Object.entries(portfolio.ativos || {}).flatMap(([category, items]) =>
        (items as any[]).map((asset) => ({ category, asset }))
    );

    const result = await db.transaction(async (tx) => {
        await tx.run(
            "DELETE FROM portfolios WHERE user_id = ? AND portfolio_id = ? AND source = 'seed'",
            [user.id, group.id]
        );

        let count = 0;
        for (const { category, asset } of positions) {
            const symbol = String(asset.ticker || '').trim().toUpperCase();
            if (!symbol) continue;

            await tx.run(
                `INSERT INTO assets (symbol, name, type)
                 VALUES (?, ?, ?)
                 ON CONFLICT (symbol) DO UPDATE SET type = EXCLUDED.type`,
                [symbol, symbol, category]
            );
            await tx.run(
                `INSERT INTO portfolios
                 (user_id, symbol, quantity, avg_price, instituicao, indexador, emissor, source, portfolio_id)
                 VALUES (?, ?, ?, ?, ?, ?, ?, 'seed', ?)`,
                [
                    user.id,
                    symbol,
                    Number(asset.Quantidade) || 0,
                    Number(asset.precoUnitario) || 0,
                    asset['Instituição'] || null,
                    asset.indexador || null,
                    asset.Emissor || null,
                    group.id
                ]
            );
            count += 1;
        }
        return count;
    });

    console.log(`Dados de exemplo importados: ${result} posições.`);
}

seed().catch((error) => {
    console.error('Falha ao importar dados de exemplo:', error.message);
    process.exit(1);
});
