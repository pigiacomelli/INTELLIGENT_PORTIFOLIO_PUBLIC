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
});
