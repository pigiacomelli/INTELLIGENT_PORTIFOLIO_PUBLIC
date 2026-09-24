import { expect, test } from '@playwright/test';

test.describe('Carteira pessoal local', () => {
    test('abre direto no painel e navega entre carteira e mercado', async ({ page }) => {
        await page.addInitScript(() => localStorage.setItem('hasSeenTutorial', 'true'));
        await page.goto('/', { waitUntil: 'networkidle' });

        await expect(page.getByText('Patrimônio Consolidado')).toBeVisible({ timeout: 30000 });
        await expect(page.getByText('DADOS LOCAIS')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Importar B3' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Adicionar Ativo', exact: true })).toBeVisible();

        await page.getByRole('button', { name: 'Mercado' }).click();
        await expect(page.getByText('Monitor de Mercado')).toBeVisible();

        await page.getByRole('button', { name: 'Minha Carteira', exact: true }).click();
        await expect(page.getByText('Patrimônio Consolidado')).toBeVisible();
    });

    test('mantém o painel legível em telas pequenas', async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.addInitScript(() => localStorage.setItem('hasSeenTutorial', 'true'));
        await page.goto('/', { waitUntil: 'networkidle' });

        await expect(page.getByTitle('Abrir menu')).toBeVisible({ timeout: 30000 });
        await expect(page.getByText('Patrimônio Investido')).toBeVisible();

        const pageFitsViewport = await page.evaluate(() =>
            document.documentElement.scrollWidth <= window.innerWidth
        );
        expect(pageFitsViewport).toBe(true);

        await page.getByTitle('Abrir menu').click();
        await expect(page.getByTitle('Fechar menu')).toBeVisible();
        await page.getByTitle('Fechar menu').click();
        await expect(page.getByTitle('Abrir menu')).toBeVisible();

        const legends = page.locator('.chart-legend');
        if (await legends.count()) {
            const legendFits = await legends.evaluateAll((elements) =>
                elements.every((element) => element.scrollWidth <= element.clientWidth + 1)
            );
            expect(legendFits).toBe(true);
        }
    });
});
