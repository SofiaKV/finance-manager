import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Goals
 * Tests financial goals management functionality
 */

test.describe('Goals', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.getByLabel(/Email/i).fill('demo@example.com');
    await page.getByLabel(/Пароль/i).fill('password123');
    await page.getByRole('button', { name: /Увійти/i }).click();
    await page.waitForURL(/.*dashboard/);

    // Navigate to goals page
    await page.getByRole('link', { name: /Цілі/i }).click();
    await page.waitForURL(/.*goals/);
  });

  test.describe('Goals List', () => {
    test('should display goals page', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /Фінансові цілі/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Додати ціль/i })).toBeVisible();
    });

    test('should display goal cards or empty state', async ({ page }) => {
      // Treat a goal card as the container around a level-3 heading (goal title)
      const goalHeadings = page.getByRole('heading', { level: 3 });
      const goalCards = goalHeadings.locator('..').locator('..');
      const emptyState = page.getByText(/^Немає фінансових цілей$/i);

      // Wait for either cards or empty state to avoid flakiness
      await Promise.race([
        goalHeadings.first().waitFor({ state: 'visible' }).catch(() => null),
        emptyState.waitFor({ state: 'visible' }).catch(() => null),
      ]);

      const hasCards = (await goalHeadings.count()) > 0;

      if (hasCards) {
        await expect(goalCards.first()).toBeVisible();
      } else {
        await expect(emptyState).toBeVisible();
      }
    });
  });

  test.describe('Add Goal', () => {
    test('should open goal form', async ({ page }) => {
      await page.getByRole('button', { name: /Додати ціль/i }).click();

      // Form should be visible
      await expect(page.getByRole('heading', { name: /Нова ціль/i })).toBeVisible();
      await expect(page.getByText(/Назва цілі/i)).toBeVisible();
      await expect(page.getByText(/Цільова сума/i)).toBeVisible();
      await expect(page.getByText(/Термін досягнення/i)).toBeVisible();
    });

    test('should close form on cancel', async ({ page }) => {
      // Open form
      await page.getByRole('button', { name: /Додати ціль/i }).click();
      await expect(page.getByRole('heading', { name: /Нова ціль/i })).toBeVisible();

      // Cancel
      await page.getByRole('button', { name: /Скасувати/i }).click();

      // Form should be hidden
      await expect(page.getByRole('heading', { name: /Нова ціль/i })).not.toBeVisible();
    });

    test('should create new goal', async ({ page }) => {
      // Open form
      await page.getByRole('button', { name: /Додати ціль/i }).click();

      // Fill goal name
      await page.getByPlaceholder(/Наприклад: Відпустка/i).fill('Нова машина');

      // Fill target amount
      await page.locator('input[type="number"]').fill('50000');

      // Set deadline (6 months from now)
      const deadline = new Date();
      deadline.setMonth(deadline.getMonth() + 6);
      const deadlineStr = deadline.toISOString().split('T')[0];
      await page.locator('input[type="date"]').fill(deadlineStr);

      // Submit form
      await page.getByRole('button', { name: /Створити/i }).click();

      // Wait for submission
      await page.waitForTimeout(1000);
    });

    test('should show placeholder in name field', async ({ page }) => {
      await page.getByRole('button', { name: /Додати ціль/i }).click();

      const nameInput = page.getByPlaceholder(/Наприклад: Відпустка, Новий автомобіль/i);
      await expect(nameInput).toBeVisible();
    });
  });

  test.describe('Goal Display', () => {
    test('should display goal progress bar', async ({ page }) => {
      const goalHeadings = page.getByRole('heading', { level: 3 });
      // Use the heading's grandparent as the full card container
      const goalCards = goalHeadings.locator('..').locator('..');
      
      if (await goalHeadings.count() > 0) {
        // e.g., "0% досягнуто"
        const progressIndicator = goalCards.first().getByText(/\d+%\s+досягнуто/i);
        await expect(progressIndicator).toBeVisible();
      }
    });

    test('should display goal amounts', async ({ page }) => {
      const goalHeadings = page.getByRole('heading', { level: 3 });
      const goalCards = goalHeadings.locator('..').locator('..');
      
      if (await goalHeadings.count() > 0) {
        await expect(goalCards.first().getByText(/Накопичено/i)).toBeVisible();
        await expect(goalCards.first().getByText(/Ціль/i)).toBeVisible();
      }
    });

    test('should display percentage and days remaining', async ({ page }) => {
      const goalHeadings = page.getByRole('heading', { level: 3 });
      const goalCards = goalHeadings.locator('..').locator('..');
      
      if (await goalHeadings.count() > 0) {
        await expect(goalCards.first().getByText(/\d+%\s+досягнуто/i)).toBeVisible();
        // Either "днів залишилось" or "Термін минув"
        const daysText = goalCards.first().getByText(/(днів залишилось|Термін минув)/i);
        await expect(daysText).toBeVisible();
      }
    });

    test('should have add funds button', async ({ page }) => {
      const goalHeadings = page.getByRole('heading', { level: 3 });
      const goalCards = goalHeadings.locator('..').locator('..');
      
      if (await goalHeadings.count() > 0) {
        const addFundsButton = goalCards.first().getByRole('button', { name: /Додати кошти/i });
        await expect(addFundsButton).toBeVisible();
      }
    });
  });

  test.describe('Add Funds to Goal', () => {
    test('should open add funds form', async ({ page }) => {
      const goalHeadings = page.getByRole('heading', { level: 3 });
      const goalCards = goalHeadings.locator('..').locator('..');
      
      if (await goalHeadings.count() > 0) {
        // Click add funds button
        await goalCards.first().getByRole('button', { name: /Додати кошти/i }).click();
 
        // Form should appear
        await expect(goalCards.first().locator('input[type="number"]')).toBeVisible();
        await expect(goalCards.first().getByRole('button', { name: /Додати/i })).toBeVisible();
        await expect(goalCards.first().getByRole('button', { name: /Скасувати/i })).toBeVisible();
      }
    });

    test('should cancel add funds', async ({ page }) => {
      const goalHeadings = page.getByRole('heading', { level: 3 });
      const goalCards = goalHeadings.locator('..').locator('..');
      
      if (await goalHeadings.count() > 0) {
        // Click add funds button
        await goalCards.first().getByRole('button', { name: /Додати кошти/i }).click();
 
        // Click cancel
        await goalCards.first().getByRole('button', { name: /Скасувати/i }).click();
 
        // Add funds button should be visible again
        await expect(goalCards.first().getByRole('button', { name: /Додати кошти/i })).toBeVisible();
      }
    });

    test('should add funds to goal', async ({ page }) => {
      const goalHeadings = page.getByRole('heading', { level: 3 });
      const goalCards = goalHeadings.locator('..').locator('..');
      
      if (await goalHeadings.count() > 0) {
        // Click add funds button
        await goalCards.first().getByRole('button', { name: /Додати кошти/i }).click();
 
        // Fill amount
        await goalCards.first().locator('input[type="number"]').fill('100');
 
        // Submit
        await goalCards.first().getByRole('button', { name: /Додати/i }).click();
 
        // Wait for submission
        await page.waitForTimeout(1000);
      }
    });
  });

  test.describe('Delete Goal', () => {
    test('should have delete button on goal cards', async ({ page }) => {
      const goalCards = page.locator('.goal-card');
      
      if (await goalCards.count() > 0) {
        const deleteButton = goalCards.first().locator('.btn-delete-small');
        await expect(deleteButton).toBeVisible();
      }
    });

    test('should show confirmation on delete', async ({ page }) => {
      const goalCards = page.locator('.goal-card');
      
      if (await goalCards.count() > 0) {
        // Set up dialog handler
        page.on('dialog', async dialog => {
          expect(dialog.message()).toContain('Видалити ціль?');
          await dialog.dismiss();
        });

        // Click delete button
        const deleteButton = goalCards.first().locator('.btn-delete-small');
        await deleteButton.click();
      }
    });
  });
});
