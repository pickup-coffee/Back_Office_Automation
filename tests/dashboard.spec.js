// @ts-check
const { test, expect } = require('./fixtures/base');

test.describe('Dashboard (authenticated)', () => {

  test('roles link works after login', async ({
    loginPage,
    dashboardPage,
    page,
  }) => {
    const mobile = process.env.BO_MOBILE || process.env.TEST_MOBILE;
    const password = process.env.BO_PASSWORD || process.env.TEST_PASSWORD;

    test.skip(!mobile || !password, 'Set BO_MOBILE and BO_PASSWORD to run');

    await loginPage.goto();
    await loginPage.login(mobile, password || '');
    await dashboardPage.expectLoggedIn();
    await dashboardPage.goToRoles();
    await expect(page).toHaveURL(/\/roles/);
  });
});
