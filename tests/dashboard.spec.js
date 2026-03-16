// @ts-check
const { test } = require('./fixtures/base');
const { ENV_KEYS } = require('../config/constants');

test.describe('Dashboard (authenticated)', () => {
  test('roles link works after login', async ({
    loginPage,
    dashboardPage,
  }) => {
    const mobile = process.env[ENV_KEYS.MOBILE] || process.env[ENV_KEYS.MOBILE_ALT];
    const password = process.env[ENV_KEYS.PASSWORD] || process.env[ENV_KEYS.PASSWORD_ALT];

    test.skip(!mobile || !password, `Set ${ENV_KEYS.MOBILE} and ${ENV_KEYS.PASSWORD} to run`);

    await loginPage.goto();
    await loginPage.login(mobile, password || '');
    await dashboardPage.expectLoggedIn();
    await dashboardPage.goToRoles();
    await dashboardPage.expectOnRolesPage();
  });
});
