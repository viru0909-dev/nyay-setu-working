import { test, expect } from '@playwright/test';

test('login and navigation flow', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('button', { name: 'All Roles' }).click();
  await page.getByRole('button', { name: 'Lawyer' }).click();
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.getByRole('textbox', { name: 'your.email@example.com' }).click();
});