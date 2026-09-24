import { beforeEach, describe, expect, it, vi } from 'vitest';

const dbMocks = vi.hoisted(() => ({
    all: vi.fn()
}));

vi.mock('../db.js', () => ({
    getDb: vi.fn(async () => ({ all: dbMocks.all }))
}));

import { PortfolioService } from '../services/portfolioService.js';

describe('PortfolioService current value calculation', () => {
    beforeEach(() => {
        dbMocks.all.mockReset();
        dbMocks.all.mockResolvedValue([{
            id: 10,
            symbol: 'BITI11.SA',
            quantity: 5515,
            avg_price: 38.93,
            type: 'etfs',
            source: 'b3'
        }]);
    });

    it('keeps quantity separate and calculates value with the current market price', async () => {
        const service = new PortfolioService();
        const dashboard = await service.getDashboardFormat(1, { 'BITI11.SA': 40.5 }, 1);
        const asset = dashboard.ativos.etfs[0];

        expect(asset.Quantidade).toBe(5515);
        expect(asset.precoUnitario).toBe(38.93);
        expect(asset.precoAtual).toBe(40.5);
        expect(asset['Valor Atualizado']).toBe(5515 * 40.5);
    });

    it('uses the saved unit price as fallback instead of treating quantity as value', async () => {
        const service = new PortfolioService();
        const dashboard = await service.getDashboardFormat(1, {}, 1);
        const asset = dashboard.ativos.etfs[0];

        expect(asset.Quantidade).toBe(5515);
        expect(asset.precoAtual).toBe(38.93);
        expect(asset['Valor Atualizado']).toBeCloseTo(5515 * 38.93, 2);
    });
});
