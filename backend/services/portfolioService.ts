import { logger } from '../utils/logger.js';
import { getDb } from '../db.js';

export interface PortfolioAsset {
    id: number;
    symbol: string;
    quantity: number;
    avg_price: number;
    current_price?: number;
    name?: string;
    type?: string;
    sector?: string;
    instituicao?: string;
    indexador?: string;
    emissor?: string;
    source?: string;
    vencimento?: string;
    taxa?: string;
}

export class PortfolioService {
    async getUserPortfolio(userId: number = 1, portfolioId?: number): Promise<PortfolioAsset[]> {
        const db = await getDb();

        // If portfolioId is not provided, find the first one for the user
        let targetPortfolioId = portfolioId;
        if (!targetPortfolioId) {
            const firstGroup = await db.get('SELECT id FROM portfolio_groups WHERE user_id = ? ORDER BY id ASC LIMIT 1', [userId]);
            if (firstGroup) targetPortfolioId = firstGroup.id;
        }

        if (!targetPortfolioId) return [];

        // Use LEFT JOIN to ensure assets in portfolios table are shown even if they don't have metadata in assets table
        const query = `
            SELECT p.*, a.name, a.type, a.sector 
            FROM portfolios p
            LEFT JOIN assets a ON p.symbol = a.symbol
            WHERE p.user_id = ? AND p.portfolio_id = ?
        `;
        return db.all(query, [userId, targetPortfolioId]);
    }

    async getPortfolioGroups(userId: number) {
        const db = await getDb();
        return db.all('SELECT * FROM portfolio_groups WHERE user_id = ? ORDER BY id ASC', [userId]);
    }

    async createPortfolioGroup(userId: number, name: string) {
        const db = await getDb();
        await db.run('INSERT INTO portfolio_groups (user_id, name) VALUES (?, ?)', [userId, name]);
        return db.get('SELECT * FROM portfolio_groups WHERE user_id = ? AND name = ? ORDER BY id DESC LIMIT 1', [userId, name]);
    }

    async deletePortfolioGroup(userId: number, groupId: number) {
        const db = await getDb();
        // Check if it's the last one
        const groups = await this.getPortfolioGroups(userId);
        if (groups.length <= 1) {
            throw new Error('Você deve ter pelo menos uma carteira.');
        }
        await db.run('DELETE FROM portfolio_groups WHERE id = ? AND user_id = ?', [groupId, userId]);
        return { success: true };
    }

    async calculatePortfolioValue(userId: number = 1, currentPrices: Record<string, number> = {}, portfolio?: PortfolioAsset[], portfolioId?: number): Promise<number> {
        const assets = portfolio || await this.getUserPortfolio(userId, portfolioId);
        let total = 0;
        for (const asset of assets) {
            const priceToUse = currentPrices[asset.symbol] || asset.avg_price || 1;
            total += (asset.quantity * priceToUse);
        }
        return total;
    }

    async calculateAssetAllocation(userId: number = 1, currentPrices: Record<string, number> = {}, portfolio?: PortfolioAsset[], portfolioId?: number) {
        const assets = portfolio || await this.getUserPortfolio(userId, portfolioId);
        const allocation: Record<string, number> = {};

        for (const asset of assets) {
            const validCategories = ['acoes', 'fiis', 'fundos', 'imoveis', 'etfs', 'etfs_internacional', 'renda_fixa', 'cripto', 'tesouro', 'coe', 'caixa', 'acoes_internacionais', 'bonds'];
            let type = asset.type || 'acoes';
            if (!validCategories.includes(type)) type = 'acoes';

            const priceToUse = currentPrices[asset.symbol] || asset.avg_price || 1;
            const value = asset.quantity * priceToUse;

            allocation[type] = (allocation[type] || 0) + value;
        }

        return allocation;
    }

    async calculateSectorExposure(userId: number = 1, currentPrices: Record<string, number> = {}, portfolio?: PortfolioAsset[], portfolioId?: number) {
        const assets = portfolio || await this.getUserPortfolio(userId, portfolioId);
        const exposure: Record<string, number> = {};

        for (const asset of assets) {
            const sector = asset.sector || 'Outros';
            const priceToUse = currentPrices[asset.symbol] || asset.avg_price || 1;
            const value = asset.quantity * priceToUse;

            exposure[sector] = (exposure[sector] || 0) + value;
        }

        return exposure;
    }

    async calculateProfitLoss(userId: number = 1, currentPrices: Record<string, number> = {}, portfolio?: PortfolioAsset[], portfolioId?: number) {
        const currentValue = await this.calculatePortfolioValue(userId, currentPrices, portfolio, portfolioId);
        return {
            totalInvested: 0,
            currentValue,
            profitLoss: 0,
            profitLossPercentage: 0
        };
    }

    // Helper to format data for the frontend dashboard
    async getDashboardFormat(userId: number = 1, currentPrices: Record<string, number> = {}, portfolioId?: number) {
        const portfolio = await this.getUserPortfolio(userId, portfolioId);

        const ativos: Record<string, any[]> = {};
        const totais: Record<string, number> = {};
        let totalInvestido = 0;

        const validCategories = ['acoes', 'fiis', 'fundos', 'imoveis', 'etfs', 'etfs_internacional', 'renda_fixa', 'cripto', 'tesouro', 'coe', 'caixa', 'acoes_internacionais', 'bonds'];

        for (const asset of portfolio) {
            let type = asset.type || 'acoes';
            if (!validCategories.includes(type)) {
                type = 'acoes';
            }

            if (!ativos[type]) ativos[type] = [];

            const priceToUse = currentPrices[asset.symbol] || asset.avg_price || 1;
            const valorAtualizado = asset.quantity * priceToUse;

            ativos[type].push({
                id: asset.id,
                ticker: asset.symbol,
                Quantidade: asset.quantity,
                precoAtual: priceToUse,
                "Valor Atualizado": valorAtualizado,
                Instituição: asset.instituicao,
                Emissor: asset.emissor,
                indexador: asset.indexador,
                category: type,
                source: asset.source || 'manual',
                vencimento: asset.vencimento,
                taxa: asset.taxa
            });

            totais[type] = (totais[type] || 0) + valorAtualizado;
            if (type !== 'caixa') {
                totalInvestido += valorAtualizado;
            }
        }

        const rentabilidade = await this.calculateProfitLoss(userId, currentPrices, portfolio);
        const sectorExposure = await this.calculateSectorExposure(userId, currentPrices, portfolio);
        const assetAllocation = await this.calculateAssetAllocation(userId, currentPrices, portfolio);

        return {
            ativos,
            totais,
            totalInvestido,
            patrimonioAtual: rentabilidade.currentValue,
            lucroPrejuizo: 0,
            lucroPrejuizoPercentual: 0,
            allocations: {
                tipo: assetAllocation,
                setor: sectorExposure
            }
        };
    }

    async bulkAddAssets(userId: number, assets: any[], portfolioId?: number) {
        const db = await getDb();

        let targetPortfolioId = portfolioId;
        if (!targetPortfolioId) {
            const firstGroup = await db.get('SELECT id FROM portfolio_groups WHERE user_id = ? ORDER BY id ASC LIMIT 1', [userId]);
            if (firstGroup) targetPortfolioId = firstGroup.id;
        }

        if (!targetPortfolioId) throw new Error("Carteira não encontrada.");

        logger.info(`[IMPORT] Starting bulk import for user ${userId} into portfolio ${targetPortfolioId} (${assets.length} assets)`);

        let successful = 0;
        let failed = 0;

        try {
            return await db.transaction(async (tx) => {
                // 1. Clear existing B3 data for this user to ensure we only have the latest import
                // but KEEP manually added assets.
                await tx.run("DELETE FROM portfolios WHERE user_id = ? AND portfolio_id = ? AND source = 'b3'", [userId, targetPortfolioId]);

                if (assets.length === 0) return { successful: 0, failed: 0 };

                // 2. Prepare Bulk Data for Assets Metadata
                const validCategories = ['acoes', 'fiis', 'fundos', 'imoveis', 'etfs', 'etfs_internacional', 'renda_fixa', 'cripto', 'tesouro', 'coe', 'caixa', 'acoes_internacionais', 'bonds'];

                const assetsParams: any[] = [];
                const portfoliosParams: any[] = [];
                let validAssetCount = 0;

                for (const asset of assets) {
                    const symbol = String(asset.ticker || '').trim().toUpperCase().substring(0, 80);
                    if (!symbol) continue;

                    let category = String(asset.category || '').trim().toLowerCase();
                    if (!validCategories.includes(category)) category = 'acoes';

                    const instituicao = asset['Instituição'] ? String(asset['Instituição']).trim().substring(0, 100) : null;
                    const emissor = asset.Emissor ? String(asset.Emissor).trim().substring(0, 100) : null;
                    const indexador = asset.indexador ? String(asset.indexador).trim().substring(0, 50) : null;
                    const quantity = Math.max(0, Number(asset.Quantidade) || 0);
                    const avgPrice = Math.max(0, Number(asset.precoUnitario) || 0);

                    // For assets table (bulk update metadata)
                    assetsParams.push(symbol, symbol, category);

                    // For portfolios table (bulk insert positions)
                    portfoliosParams.push(userId, symbol, quantity, avgPrice, instituicao, indexador, emissor, 'b3', targetPortfolioId);

                    validAssetCount++;
                }

                if (validAssetCount === 0) return { successful: 0, failed: 0 };

                // 3. Bulk Insert Assets Metadata
                const assetsPlaceholders = Array.from({ length: validAssetCount }, (_, i) => `($${i * 3 + 1}, $${i * 3 + 2}, $${i * 3 + 3})`).join(', ');
                const assetsQuery = `
                    INSERT INTO assets (symbol, name, type) 
                    VALUES ${assetsPlaceholders}
                    ON CONFLICT (symbol) DO UPDATE SET type = EXCLUDED.type 
                    WHERE assets.type = 'outros' OR assets.type IS NULL
                `;
                await tx.run(assetsQuery, assetsParams);

                // 4. Bulk Insert Portfolio Positions
                const portfolioPlaceholders = Array.from({ length: validAssetCount }, (_, i) => `($${i * 9 + 1}, $${i * 9 + 2}, $${i * 9 + 3}, $${i * 9 + 4}, $${i * 9 + 5}, $${i * 9 + 6}, $${i * 9 + 7}, $${i * 9 + 8}, $${i * 9 + 9})`).join(', ');
                const portfolioQuery = `
                    INSERT INTO portfolios (user_id, symbol, quantity, avg_price, instituicao, indexador, emissor, source, portfolio_id)
                    VALUES ${portfolioPlaceholders}
                `;
                await tx.run(portfolioQuery, portfoliosParams);

                logger.info(`[IMPORT] Successfully imported ${validAssetCount} assets for user ${userId} in bulk.`);
                return { successful: validAssetCount, failed: 0 };
            });
        } catch (error) {
            logger.error(`[IMPORT] Bulk import transaction failed for user ${userId}:`, error);
            throw error;
        }
    }
}
