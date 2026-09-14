import { getDb } from '../db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seed() {
    console.log('🔄 Iniciando migração para PostgreSQL...');

    // We use a direct client to execute large schema dumps safely on Neon instead of Pool wrappers
    const pgClient = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
    await pgClient.connect();

    const db = await getDb();

    // 1. Criar as tabelas
    const schemaPath = path.resolve(__dirname, '../../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    await pgClient.query(schema);
    await pgClient.end();
    console.log('✅ Schema criado com sucesso.');

    // 2. Ler dados locais
    const dataPath = path.resolve(__dirname, '../portfolio.json');
    if (!fs.existsSync(dataPath)) {
        console.log('⚠️ Arquivo portfolio.json não encontrado. Base inicial vazia.');
        return;
    }

    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const portfolio = JSON.parse(rawData);

    // 3. Inserir ativos e carteira no banco
    const userId = 1; // Admin padrão criado no schema.sql

    // Limpar carteira existente do user para evitar duplicidade re-rodando o script
    await db.run('DELETE FROM portfolios WHERE user_id = ?', [userId]);

    let count = 0;
    for (const category of Object.keys(portfolio.ativos)) {
        const assetsList = portfolio.ativos[category];
        for (const asset of assetsList) {
            const symbol = asset.ticker;
            const name = asset.ticker; // Simplificação para MVP
            const type = category;
            const instituicao = asset['Instituição'] || null;
            const emissor = asset.Emissor || null;
            const indexador = asset.indexador || null;
            const quantity = asset.Quantidade || 0;
            const avgPrice = asset.precoUnitario || 0;

            // Inserir ou ignorar Ativo
            await db.run(
                'INSERT INTO assets (symbol, name, type) VALUES (?, ?, ?) ON CONFLICT (symbol) DO NOTHING',
                [symbol, name, type]
            );

            // Inserir na Carteira
            await db.run(
                `INSERT INTO portfolios 
                 (user_id, symbol, quantity, avg_price, instituicao, indexador, emissor) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [userId, symbol, quantity, avgPrice, instituicao, indexador, emissor]
            );
            count++;
        }
    }

    console.log(`✅ Migração concluída! ${count} ativos inseridos no portfólio do usuário.`);
}

seed().catch(console.error);
