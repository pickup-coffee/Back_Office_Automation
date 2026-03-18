// @ts-check
const { test, expect } = require('./fixtures/base');

test.describe('Back Office Login', () => {
  test('login page loads and shows log in option', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.expectOnLoginPage();
  });

  test('mobile input is visible and focusable', async ({ loginPage }) => {
    await loginPage.goto();
    await expect(loginPage.mobileInput).toBeVisible();
    await loginPage.mobileInput.focus();
    await loginPage.mobileInput.fill('9123456789');
    await expect(loginPage.mobileInput).toHaveValue('9123456789');
  });

  test('login with mobile and OTP (9123456789 / 123456)', async ({
    loginPage,
    dashboardPage,
  }) => {
    await loginPage.goto();
    await loginPage.loginWithOtp('9123456789', '123456');
    await dashboardPage.expectLoggedIn();
  });
});
