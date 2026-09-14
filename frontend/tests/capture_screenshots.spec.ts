import { test, expect } from '@playwright/test';
import path from 'path';

test('capture screenshots', async ({ page }) => {
    const artifactDir = path.join(__dirname, '../test-results/screenshots');

    await page.setViewportSize({ width: 1280, height: 800 });

    console.log('Navigating to app...');
    await page.goto('http://localhost:5173');

    // 1. Landing Page
    await page.screenshot({ path: path.join(artifactDir, 'screenshot_landing.png') });

    // 2. Register
    const testEmail = `tour-${Date.now()}@example.com`;
    await page.getByRole('button', { name: 'Blindar minha Carteira Agora' }).click();
    await page.fill('input[placeholder="Seu melhor email"]', testEmail);
    await page.fill('input[placeholder="Mínimo 6 caracteres"]', 'password123');
    await page.getByRole('button', { name: 'Criar Minha Conta Grátis' }).click();

    // Wait for loading
    await expect(page.getByText('Sincronizando sua inteligência financeira')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Sincronizando sua inteligência financeira')).toBeHidden({ timeout: 30000 });

    // 3. How It Works Modal
    await expect(page.getByText('Como Funciona')).toBeVisible();
    await page.screenshot({ path: path.join(artifactDir, 'screenshot_onboarding.png') });

    // Dismiss
    await page.getByRole('button', { name: 'Entendi, Vamos Começar!' }).click();

    // 4. Dashboard
    await expect(page.locator('text=Patrimônio Consolidado')).toBeVisible();
    await page.screenshot({ path: path.join(artifactDir, 'screenshot_dashboard.png') });

    // 5. Market Page
    await page.getByRole('button', { name: 'Mercado' }).click();
    await expect(page.getByText('Monitor de Mercado')).toBeVisible();
    // Wait for TradingView widgets
    await page.waitForTimeout(5000);
    await page.screenshot({ path: path.join(artifactDir, 'screenshot_market.png') });
});
