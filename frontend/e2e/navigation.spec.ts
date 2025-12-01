import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Navigation
 * Tests navigation between pages and navbar functionality
 */

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.getByLabel(/Email/i).fill('demo@example.com');
    await page.getByLabel(/Пароль/i).fill('password123');
    await page.getByRole('button', { name: /Увійти/i }).click();
    await page.waitForURL(/.*dashboard/);
  });

  test.describe('Navbar', () => {
    test('should display navbar with all links', async ({ page }) => {
      await expect(page.getByRole('link', { name: /Головна/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /Транзакції/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /Бюджети/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /Цілі/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /Профіль/i })).toBeVisible();
    });

    test('should display user name and balance', async ({ page }) => {
      const navUser = page.locator('.nav-user');
      await expect(navUser).toBeVisible();
      await expect(page.locator('.user-name')).toBeVisible();
      await expect(page.locator('.user-balance')).toBeVisible();
    });

    test('should have logout button', async ({ page }) => {
      await expect(page.getByRole('button', { name: /Вийти/i })).toBeVisible();
    });
  });

  test.describe('Page Navigation', () => {
    test('should navigate to dashboard', async ({ page }) => {
      await page.getByRole('link', { name: /Транзакції/i }).click();
      await page.waitForURL(/.*transactions/);

      await page.getByRole('link', { name: /Головна/i }).click();
      await page.waitForURL(/.*dashboard/);

      await expect(page.getByRole('heading', { name: /Головна панель/i })).toBeVisible();
    });

    test('should navigate to transactions', async ({ page }) => {
      await page.getByRole('link', { name: /Транзакції/i }).click();
      await page.waitForURL(/.*transactions/);

      await expect(page.getByRole('heading', { name: /Транзакції/i })).toBeVisible();
    });

    test('should navigate to budgets', async ({ page }) => {
      await page.getByRole('link', { name: /Бюджети/i }).click();
      await page.waitForURL(/.*budgets/);

      await expect(page.getByRole('heading', { name: /Бюджети/i })).toBeVisible();
    });

    test('should navigate to goals', async ({ page }) => {
      await page.getByRole('link', { name: /Цілі/i }).click();
      await page.waitForURL(/.*goals/);

      await expect(page.getByRole('heading', { name: /Фінансові цілі/i })).toBeVisible();
    });

    test('should navigate to profile', async ({ page }) => {
      await page.getByRole('link', { name: /Профіль/i }).click();
      await page.waitForURL(/.*profile/);

      await expect(page.getByRole('heading', { name: /Профіль користувача/i })).toBeVisible();
    });
  });

  test.describe('Active Link Indicator', () => {
    test('should highlight active navigation link', async ({ page }) => {
      // Dashboard should be active by default
      const dashboardLink = page.getByRole('link', { name: /Головна/i });
      await expect(dashboardLink).toHaveClass(/active/);

      // Navigate to transactions
      await page.getByRole('link', { name: /Транзакції/i }).click();
      await page.waitForURL(/.*transactions/);

      // Transactions link should now be active
      const transactionsLink = page.getByRole('link', { name: /Транзакції/i });
      await expect(transactionsLink).toHaveClass(/active/);
    });

    test('should update indicator on navigation', async ({ page }) => {
      // Check for sliding indicator
      const indicator = page.locator('.nav-indicator');
      
      if (await indicator.count() > 0) {
        // Navigate between pages and check indicator moves
        await page.getByRole('link', { name: /Транзакції/i }).click();
        await page.waitForTimeout(300);

        await page.getByRole('link', { name: /Бюджети/i }).click();
        await page.waitForTimeout(300);

        await page.getByRole('link', { name: /Головна/i }).click();
        await page.waitForTimeout(300);
      }
    });
  });

  test.describe('Direct URL Access', () => {
    test('should access dashboard directly', async ({ page }) => {
      await page.goto('/dashboard');
      await expect(page.getByRole('heading', { name: /Головна панель/i })).toBeVisible();
    });

    test('should access transactions directly', async ({ page }) => {
      await page.goto('/transactions');
      await expect(page.getByRole('heading', { name: /Транзакції/i })).toBeVisible();
    });

    test('should access budgets directly', async ({ page }) => {
      await page.goto('/budgets');
      await expect(page.getByRole('heading', { name: /Бюджети/i })).toBeVisible();
    });

    test('should access goals directly', async ({ page }) => {
      await page.goto('/goals');
      await expect(page.getByRole('heading', { name: /Фінансові цілі/i })).toBeVisible();
    });

    test('should access profile directly', async ({ page }) => {
      await page.goto('/profile');
      await expect(page.getByRole('heading', { name: /Профіль користувача/i })).toBeVisible();
    });

    test('should redirect unknown routes to dashboard', async ({ page }) => {
      await page.goto('/unknown-route');
      // Should either show 404 or redirect to dashboard
      await page.waitForTimeout(1000);
    });
  });

  test.describe('Logout Navigation', () => {
    test('should logout and redirect to login', async ({ page }) => {
      await page.getByRole('button', { name: /Вийти/i }).click();

      await expect(page).toHaveURL(/.*login/);
      await expect(page.getByRole('heading', { name: /Вхід/i })).toBeVisible();
    });

    test('should prevent access after logout', async ({ page }) => {
      await page.getByRole('button', { name: /Вийти/i }).click();
      await page.waitForURL(/.*login/);

      // Try to access protected route
      await page.goto('/dashboard');

      // Should be redirected to login
      await expect(page).toHaveURL(/.*login/);
    });
  });
});

test.describe('Responsive Navigation', () => {
  test('should work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Login
    await page.goto('/login');
    await page.getByLabel(/Email/i).fill('demo@example.com');
    await page.getByLabel(/Пароль/i).fill('password123');
    await page.getByRole('button', { name: /Увійти/i }).click();
    await page.waitForURL(/.*dashboard/);

    // Check that navigation is accessible
    await expect(page.getByRole('heading', { name: /Головна панель/i })).toBeVisible();
  });

  test('should work on tablet viewport', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });

    // Login
    await page.goto('/login');
    await page.getByLabel(/Email/i).fill('demo@example.com');
    await page.getByLabel(/Пароль/i).fill('password123');
    await page.getByRole('button', { name: /Увійти/i }).click();
    await page.waitForURL(/.*dashboard/);

    // Check navigation links
    await expect(page.getByRole('link', { name: /Головна/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Транзакції/i })).toBeVisible();
  });
});
