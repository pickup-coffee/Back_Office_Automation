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

  test('full login flow when credentials provided', async ({
    loginPage,
    dashboardPage,
  }) => {
    const mobile = process.env.BO_MOBILE || process.env.TEST_MOBILE;
    const password = process.env.BO_PASSWORD || process.env.TEST_PASSWORD;

    test.skip(!mobile || !password, 'Set BO_MOBILE and BO_PASSWORD to run login flow');

    await loginPage.goto();
    await loginPage.login(mobile, password || '');
    await dashboardPage.expectLoggedIn();
  });
});
