// @ts-check
const { test, expect } = require('./fixtures/base');
const { ENV_KEYS } = require('../config/constants');

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

  test('full login flow when credentials provided', async ({
    loginPage,
    dashboardPage,
  }) => {
    const mobile = process.env[ENV_KEYS.MOBILE] || process.env[ENV_KEYS.MOBILE_ALT];
    const password = process.env[ENV_KEYS.PASSWORD] || process.env[ENV_KEYS.PASSWORD_ALT];

    test.skip(!mobile || !password, `Set ${ENV_KEYS.MOBILE} and ${ENV_KEYS.PASSWORD} to run login flow`);

    await loginPage.goto();
    await loginPage.login(mobile, password || '');
    await dashboardPage.expectLoggedIn();
  });
});
