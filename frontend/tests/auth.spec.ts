import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
    test('should show login page', async ({ page }) => {
        await page.goto('/');
        // Adjust selector based on actual UI
        await expect(page).toHaveTitle(/Intelligent Portfolio/i);
    });

    test('should fail login with invalid credentials', async ({ page }) => {
        await page.goto('/login'); // Adjust route if needed
        // These selectors are placeholders and need to be verified against the codebase
        await page.fill('input[name="email"]', 'wrong@example.com');
        await page.fill('input[name="password"]', 'wrongpassword');
        await page.click('button[type="submit"]');

        // Expect some error message
        // await expect(page.locator('text=invalid credentials')).toBeVisible();
    });
});
