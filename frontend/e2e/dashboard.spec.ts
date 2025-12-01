import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Dashboard
 * Tests the main dashboard functionality
 */

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.getByLabel(/Email/i).fill('demo@example.com');
    await page.getByLabel(/Пароль/i).fill('password123');
    await page.getByRole('button', { name: /Увійти/i }).click();
    await page.waitForURL(/.*dashboard/);
  });

  test.describe('Dashboard Overview', () => {
    test('should display dashboard with all main sections', async ({ page }) => {
      // Check main heading
      await expect(page.getByRole('heading', { name: /Головна панель/i })).toBeVisible();

      // Check period selector
      await expect(page.getByRole('button', { name: /Місяць/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Рік/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Все/i })).toBeVisible();

      // Check stat cards (disambiguate from chart toggle button)
      await expect(page.locator('.stat-label', { hasText: /^Доходи$/ })).toBeVisible();
      await expect(page.locator('.stat-label', { hasText: /^Витрати$/ })).toBeVisible();
      await expect(page.locator('.stat-label', { hasText: /^Баланс$/ })).toBeVisible();
      await expect(page.locator('.stat-label', { hasText: /^Транзакції$/ })).toBeVisible();
    });

    test('should display user balance in navigation', async ({ page }) => {
      // Check user info in navbar
      await expect(page.locator('.nav-user')).toBeVisible();
      await expect(page.getByText(/Баланс:/i)).toBeVisible();
    });

    test('should switch between periods', async ({ page }) => {
      // Click on different period buttons
      await page.getByRole('button', { name: /Рік/i }).click();
      // Wait for data to reload
      await page.waitForTimeout(500);

      await page.getByRole('button', { name: /Все/i }).click();
      await page.waitForTimeout(500);

      await page.getByRole('button', { name: /Місяць/i }).click();
      await page.waitForTimeout(500);

      // Should still be on dashboard
      await expect(page.getByRole('heading', { name: /Головна панель/i })).toBeVisible();
    });

    test('should switch between expense and income chart types', async ({ page }) => {
      // Find chart type selector
      await expect(page.getByRole('button', { name: /^Витрати$/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /^Доходи$/i })).toBeVisible();

      // Switch to income
      await page.getByRole('button', { name: /^Доходи$/i }).click();
      await page.waitForTimeout(500);

      // Switch back to expenses
      await page.getByRole('button', { name: /^Витрати$/i }).click();
      await page.waitForTimeout(500);
    });

    test('should display recent transactions section', async ({ page }) => {
      // Check recent transactions section
      await expect(page.getByRole('heading', { name: /Останні транзакції/i })).toBeVisible();
    });
  });
});
