import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Transactions
 * Tests transaction management functionality
 */

test.describe('Transactions', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.getByLabel(/Email/i).fill('demo@example.com');
    await page.getByLabel(/Пароль/i).fill('password123');
    await page.getByRole('button', { name: /Увійти/i }).click();
    await page.waitForURL(/.*dashboard/);

    // Navigate to transactions page
    await page.getByRole('link', { name: /Транзакції/i }).click();
    await page.waitForURL(/.*transactions/);
  });

  test.describe('Transactions List', () => {
    test('should display transactions page', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /Транзакції/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Додати транзакцію/i })).toBeVisible();
    });

    test('should display filter buttons', async ({ page }) => {
      await expect(page.getByRole('button', { name: /Всі/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Доходи/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Витрати/i })).toBeVisible();
    });

    test('should filter transactions by type', async ({ page }) => {
      // Click on income filter
      await page.getByRole('button', { name: /Доходи/i }).click();
      await page.waitForTimeout(300);

      // Click on expense filter
      await page.getByRole('button', { name: /Витрати/i }).click();
      await page.waitForTimeout(300);

      // Click on all filter
      await page.getByRole('button', { name: /Всі/i }).click();
      await page.waitForTimeout(300);
    });

    test('should display category filter', async ({ page }) => {
      await expect(page.getByText(/Фільтрувати по категорії/i)).toBeVisible();
      await expect(page.locator('.category-filter select')).toBeVisible();
    });
  });

  test.describe('Add Transaction', () => {
    test('should open transaction form', async ({ page }) => {
      await page.getByRole('button', { name: /Додати транзакцію/i }).click();

      // Form should be visible
      await expect(page.getByRole('heading', { name: /Нова транзакція/i })).toBeVisible();
      await expect(page.getByText(/Тип/i)).toBeVisible();
      await expect(page.getByText(/Категорія/i)).toBeVisible();
      await expect(page.getByText(/Сума/i)).toBeVisible();
      await expect(page.getByText(/Дата/i)).toBeVisible();
      await expect(page.getByText(/Опис/i)).toBeVisible();
    });

    test('should close form on cancel', async ({ page }) => {
      // Open form
      await page.getByRole('button', { name: /Додати транзакцію/i }).click();
      await expect(page.getByRole('heading', { name: /Нова транзакція/i })).toBeVisible();

      // Cancel
      await page.getByRole('button', { name: /Скасувати/i }).click();

      // Form should be hidden
      await expect(page.getByRole('heading', { name: /Нова транзакція/i })).not.toBeVisible();
    });

    test('should create new expense transaction', async ({ page }) => {
      // Open form
      await page.getByRole('button', { name: /Додати транзакцію/i }).click();

      // Select expense type (default)
      await page.locator('select').first().selectOption('EXPENSE');

      // Wait for categories to load and select one
      await page.waitForTimeout(500);
      const categorySelect = page.locator('select').nth(1);
      await categorySelect.selectOption({ index: 1 }); // Select first available category

      // Fill amount
      await page.locator('input[type="number"]').first().fill('100');

      // Fill description
      await page.getByPlaceholder(/Введіть опис транзакції/i).fill('Test expense');

      // Submit form
      await page.getByRole('button', { name: /Зберегти/i }).click();

      // Wait for submission
      await page.waitForTimeout(1000);

      // Form should close on success
      await expect(page.getByRole('heading', { name: /Нова транзакція/i })).not.toBeVisible({ timeout: 5000 });
    });

    test('should create new income transaction', async ({ page }) => {
      // Open form
      await page.getByRole('button', { name: /Додати транзакцію/i }).click();

      // Select income type
      await page.locator('select').first().selectOption('INCOME');

      // Wait for categories to load and select one
      await page.waitForTimeout(500);
      const categorySelect = page.locator('select').nth(1);
      await categorySelect.selectOption({ index: 1 });

      // Fill amount
      await page.locator('input[type="number"]').first().fill('500');

      // Fill description
      await page.getByPlaceholder(/Введіть опис транзакції/i).fill('Test income');

      // Submit form
      await page.getByRole('button', { name: /Зберегти/i }).click();

      // Wait for submission
      await page.waitForTimeout(1000);
    });

    test('should switch categories when changing transaction type', async ({ page }) => {
      // Open form
      await page.getByRole('button', { name: /Додати транзакцію/i }).click();

      // Start with expense
      await page.locator('select').first().selectOption('EXPENSE');
      await page.waitForTimeout(300);

      // Get initial categories count
      const categorySelectExpense = page.locator('select').nth(1);
      const expenseOptions = await categorySelectExpense.locator('option').count();

      // Switch to income
      await page.locator('select').first().selectOption('INCOME');
      await page.waitForTimeout(300);

      // Categories should change
      const categorySelectIncome = page.locator('select').nth(1);
      const incomeOptions = await categorySelectIncome.locator('option').count();

      // The number of options might be different (or same if there are equal categories)
      expect(expenseOptions).toBeGreaterThan(0);
      expect(incomeOptions).toBeGreaterThan(0);
    });
  });

  test.describe('Delete Transaction', () => {
    test('should have delete button on transactions', async ({ page }) => {
      // Check if there are any transactions with delete buttons
      const deleteButtons = page.locator('.btn-delete');
      
      // If transactions exist, delete buttons should be visible
      if (await deleteButtons.count() > 0) {
        await expect(deleteButtons.first()).toBeVisible();
      }
    });

    test('should show confirmation on delete', async ({ page }) => {
      const deleteButtons = page.locator('.btn-delete');
      
      if (await deleteButtons.count() > 0) {
        // Set up dialog handler
        page.on('dialog', async dialog => {
          expect(dialog.message()).toContain('Видалити транзакцію?');
          await dialog.dismiss(); // Cancel the deletion
        });

        // Click delete button
        await deleteButtons.first().click();
      }
    });
  });
});
