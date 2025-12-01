import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Budgets
 * Tests budget management functionality
 */

test.describe('Budgets', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.getByLabel(/Email/i).fill('demo@example.com');
    await page.getByLabel(/Пароль/i).fill('password123');
    await page.getByRole('button', { name: /Увійти/i }).click();
    await page.waitForURL(/.*dashboard/);

    // Navigate to budgets page
    await page.getByRole('link', { name: /Бюджети/i }).click();
    await page.waitForURL(/.*budgets/);
  });

  test.describe('Budgets List', () => {
    test('should display budgets page', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /Бюджети/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Додати бюджет/i })).toBeVisible();
    });

    test('should display budget cards or empty state', async ({ page }) => {
      // Either budgets exist or empty state is shown
      const budgetCards = page.locator('.budget-card');
      const emptyState = page.getByText(/Немає бюджетів/i);

      if (await budgetCards.count() > 0) {
        await expect(budgetCards.first()).toBeVisible();
      } else {
        await expect(emptyState).toBeVisible();
      }
    });
  });

  test.describe('Add Budget', () => {
    test('should open budget form', async ({ page }) => {
      await page.getByRole('button', { name: /Додати бюджет/i }).click();

      // Form should be visible
      await expect(page.getByRole('heading', { name: /Новий бюджет/i })).toBeVisible();
      await expect(page.getByText(/Категорія/i)).toBeVisible();
      await expect(page.getByText(/Сума/i)).toBeVisible();
      await expect(page.getByText(/Період/i)).toBeVisible();
    });

    test('should close form on cancel', async ({ page }) => {
      // Open form
      await page.getByRole('button', { name: /Додати бюджет/i }).click();
      await expect(page.getByRole('heading', { name: /Новий бюджет/i })).toBeVisible();

      // Cancel
      await page.getByRole('button', { name: /Скасувати/i }).click();

      // Form should be hidden
      await expect(page.getByRole('heading', { name: /Новий бюджет/i })).not.toBeVisible();
    });

    test('should create new budget', async ({ page }) => {
      // Open form
      await page.getByRole('button', { name: /Додати бюджет/i }).click();

      // Select category
      await page.waitForTimeout(500);
      const categorySelect = page.locator('select').first();
      await categorySelect.selectOption({ index: 1 });

      // Fill amount
      await page.locator('input[type="number"]').fill('1000');

      // Select period (default is MONTHLY)
      const periodSelect = page.locator('select').nth(1);
      await periodSelect.selectOption('MONTHLY');

      // Submit form
      await page.getByRole('button', { name: /Створити/i }).click();

      // Wait for submission
      await page.waitForTimeout(1000);
    });

    test('should have different period options', async ({ page }) => {
      // Open form
      await page.getByRole('button', { name: /Додати бюджет/i }).click();

      // Check period options
      const periodSelect = page.locator('select').nth(1);
      
      await expect(periodSelect.locator('option[value="MONTHLY"]')).toBeAttached();
      await expect(periodSelect.locator('option[value="WEEKLY"]')).toBeAttached();
      await expect(periodSelect.locator('option[value="YEARLY"]')).toBeAttached();
    });
  });

  test.describe('Budget Display', () => {
    test('should display budget progress bar', async ({ page }) => {
      const budgetCards = page.locator('.budget-card');
      
      if (await budgetCards.count() > 0) {
        // Check for progress bar
        const progressBar = budgetCards.first().locator('.progress-bar');
        await expect(progressBar).toBeVisible();
      }
    });

    test('should display budget amounts', async ({ page }) => {
      const budgetCards = page.locator('.budget-card');
      
      if (await budgetCards.count() > 0) {
        // Check for spent and limit amounts
        await expect(budgetCards.first().getByText(/Витрачено/i)).toBeVisible();
        await expect(budgetCards.first().getByText(/Ліміт/i)).toBeVisible();
      }
    });

    test('should display remaining amount and percentage', async ({ page }) => {
      const budgetCards = page.locator('.budget-card');
      
      if (await budgetCards.count() > 0) {
        await expect(budgetCards.first().getByText(/використано/i)).toBeVisible();
        await expect(budgetCards.first().getByText(/Залишилось/i)).toBeVisible();
      }
    });
  });

  test.describe('Delete Budget', () => {
    test('should have delete button on budget cards', async ({ page }) => {
      const budgetCards = page.locator('.budget-card');
      
      if (await budgetCards.count() > 0) {
        const deleteButton = budgetCards.first().locator('.btn-delete-small');
        await expect(deleteButton).toBeVisible();
      }
    });

    test('should show confirmation on delete', async ({ page }) => {
      const budgetCards = page.locator('.budget-card');
      
      if (await budgetCards.count() > 0) {
        // Set up dialog handler
        page.on('dialog', async dialog => {
          expect(dialog.message()).toContain('Видалити бюджет?');
          await dialog.dismiss();
        });

        // Click delete button
        const deleteButton = budgetCards.first().locator('.btn-delete-small');
        await deleteButton.click();
      }
    });
  });
});
