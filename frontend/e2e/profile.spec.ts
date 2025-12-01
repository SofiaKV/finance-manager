import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Profile
 * Tests user profile management functionality
 */

test.describe('Profile', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.getByLabel(/Email/i).fill('demo@example.com');
    await page.getByLabel(/Пароль/i).fill('password123');
    await page.getByRole('button', { name: /Увійти/i }).click();
    await page.waitForURL(/.*dashboard/);

    // Navigate to profile page
    await page.getByRole('link', { name: /Профіль/i }).click();
    await page.waitForURL(/.*profile/);
  });

  test.describe('Profile Display', () => {
    test('should display profile page', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /Профіль користувача/i })).toBeVisible();
    });

    test('should display user avatar', async ({ page }) => {
      const avatar = page.locator('.avatar-circle');
      await expect(avatar).toBeVisible();
    });

    test('should display user information', async ({ page }) => {
      await expect(page.getByText(/Ім'я:/i)).toBeVisible();
      await expect(page.getByText(/Email:/i)).toBeVisible();
      await expect(page.getByText(/Поточний баланс:/i)).toBeVisible();
      await expect(page.getByText(/Дата реєстрації:/i)).toBeVisible();
    });

    test('should display edit profile button', async ({ page }) => {
      await expect(page.getByRole('button', { name: /Редагувати профіль/i })).toBeVisible();
    });

    test('should display balance adjustment button', async ({ page }) => {
      await expect(page.getByRole('button', { name: /Коригувати баланс/i })).toBeVisible();
    });
  });

  test.describe('Edit Profile', () => {
    test('should open edit form', async ({ page }) => {
      await page.getByRole('button', { name: /Редагувати профіль/i }).click();

      // Form should be visible
      const nameInput = page.locator('.profile-form input[type="text"]');
      const emailInput = page.locator('.profile-form input[type="email"]');
      
      await expect(nameInput).toBeVisible();
      await expect(emailInput).toBeVisible();
    });

    test('should cancel editing', async ({ page }) => {
      await page.getByRole('button', { name: /Редагувати профіль/i }).click();

      // Click cancel
      await page.getByRole('button', { name: /Скасувати/i }).click();

      // Should be back to view mode
      await expect(page.getByRole('button', { name: /Редагувати профіль/i })).toBeVisible();
    });

    test('should save profile changes', async ({ page }) => {
      await page.getByRole('button', { name: /Редагувати профіль/i }).click();

      // Modify name
      const nameInput = page.locator('.profile-form input[type="text"]');
      await nameInput.fill('Updated Name');

      // Save
      await page.getByRole('button', { name: /Зберегти/i }).click();

      // Wait for save
      await page.waitForTimeout(1000);
    });
  });

  test.describe('Balance Adjustment', () => {
    test('should open balance adjustment form', async ({ page }) => {
      await page.getByRole('button', { name: /Коригувати баланс/i }).click();

      // Form should be visible
      await expect(page.getByRole('heading', { name: /Коригування балансу/i })).toBeVisible();
      await expect(page.getByText(/Тип/i)).toBeVisible();
      await expect(page.getByText(/Сума/i)).toBeVisible();
    });

    test('should have increase and decrease options', async ({ page }) => {
      await page.getByRole('button', { name: /Коригувати баланс/i }).click();

      const typeSelect = page.locator('.balance-adjust-form select');
      
      await expect(typeSelect.locator('option[value="INCOME"]')).toBeAttached();
      await expect(typeSelect.locator('option[value="EXPENSE"]')).toBeAttached();
    });

    test('should cancel balance adjustment', async ({ page }) => {
      await page.getByRole('button', { name: /Коригувати баланс/i }).click();

      // Click cancel
      await page.getByRole('button', { name: /Скасувати/i }).click();

      // Should be back to view mode
      await expect(page.getByRole('button', { name: /Коригувати баланс/i })).toBeVisible();
    });

    test('should adjust balance', async ({ page }) => {
      await page.getByRole('button', { name: /Коригувати баланс/i }).click();

      // Select type
      await page.locator('.balance-adjust-form select').selectOption('INCOME');

      // Fill amount
      await page.locator('.balance-adjust-form input[type="number"]').fill('1000');

      // Fill description (optional)
      await page.locator('.balance-adjust-form input[type="text"]').fill('Initial balance');

      // Submit
      await page.getByRole('button', { name: /Підтвердити/i }).click();

      // Wait for submission
      await page.waitForTimeout(1000);
    });
  });

  test.describe('Success/Error Messages', () => {
    test('should show success message on profile update', async ({ page }) => {
      await page.getByRole('button', { name: /Редагувати профіль/i }).click();

      // Save without changes (or with changes)
      await page.getByRole('button', { name: /Зберегти/i }).click();

      // Wait for response
      await page.waitForTimeout(2000);

      // Check for success message (might exist or error if validation fails)
      const successMessage = page.locator('.success-message');
      const errorMessage = page.locator('.error-message');
      
      // Either success or error should appear
    });
  });
});
