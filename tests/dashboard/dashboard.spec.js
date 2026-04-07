// @ts-check
const { test } = require('../fixtures/base');

test.describe('Dashboard (authenticated)', () => {
  test('roles link works after login', async ({ page, dashboardPage }) => {
    await page.goto('/');
    await dashboardPage.expectLoggedIn();
    await dashboardPage.goToRoles();
    await dashboardPage.expectOnRolesPage();
  });
});
