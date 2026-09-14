import { test, expect } from '@playwright/test';

test.describe('Critical Flow', async () => {
    test.slow();

    const testUser = {
        email: `test_${Date.now()}@example.com`,
        password: 'password123'
    };

    test('should complete the full critical flow: register -> login -> dashboard -> logout', async ({ page }) => {
        // 1. Landing Page
        await page.goto('/', { waitUntil: 'networkidle' });
        const cta = page.getByRole('button', { name: /Blindar minha Carteira Agora/i });
        await expect(cta).toBeVisible({ timeout: 15000 });
        await cta.click();

        // 2. Register Form
        const switchToRegister = page.getByRole('button', { name: /Registre-se/i });
        await expect(switchToRegister).toBeVisible();
        await switchToRegister.click();

        await expect(page.getByText('Crie sua conta')).toBeVisible();
        await page.fill('input[placeholder="E-mail"]', testUser.email);

        const passwords = page.locator('input[type="password"]');
        await passwords.nth(0).fill(testUser.password);
        await passwords.nth(1).fill(testUser.password);

        await page.getByRole('button', { name: 'Registrar' }).click();

        // 3. Success & Transition to Login
        await expect(page.getByText('Conta criada com sucesso')).toBeVisible({ timeout: 10000 });

        // Wait for the transition bit (2 seconds in AuthForms.tsx)
        // We'll wait until "Seja bem-vindo" appears, signifying we are back to LoginForm
        await expect(page.getByText('Seja bem-vindo')).toBeVisible({ timeout: 10000 });

        // 4. Login
        await page.fill('input[placeholder="E-mail"]', testUser.email);
        await page.fill('input[placeholder="Senha"]', testUser.password);
        await page.getByRole('button', { name: 'Entrar' }).click();

        // 5. Dashboard Loading & Tutorial
        await expect(page.getByText('Sincronizando sua inteligência financeira')).toBeVisible({ timeout: 15000 });
        await expect(page.getByText('Sincronizando sua inteligência financeira')).toBeHidden({ timeout: 30000 });

        // Handle onboarding tutorial if it appears
        const tutorialBtn = page.getByRole('button', { name: 'Entendi, Vamos Começar!' });
        if (await tutorialBtn.isVisible({ timeout: 5000 })) {
            await tutorialBtn.click();
        }

        await expect(page.locator('text=Patrimônio Consolidado')).toBeVisible();

        // 6. Sidebar & Trial
        const sidebar = page.locator('aside.sidebar-collapsible');
        const isClosed = await sidebar.evaluate(el => el.classList.contains('closed'));
        if (isClosed) {
            await page.click('button[title="Abrir menu"]');
        }
        await expect(page.locator('text=TRIAL ACTIVE')).toBeVisible();

        // 7. Navigation to Mercado
        await page.click('text=Minha Carteira'); // Go to portfolio just in case
        await page.click('text=Mercado');
        await expect(page.locator('text=Monitor de Mercado')).toBeVisible();

        // 8. Logout
        await page.click('text=Sair da Conta');
        await expect(page).toHaveTitle(/Intelligent Portfolio/i);
    });
});
