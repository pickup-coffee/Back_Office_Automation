// @ts-check
const { test } = require('./fixtures/base');

test.describe('Dashboard (authenticated)', () => {
  test('roles link works after login', async ({
    authenticatedPage,
    dashboardPage,
  }) => {
    await dashboardPage.expectLoggedIn();
    await dashboardPage.goToRoles();
    await dashboardPage.expectOnRolesPage();
  });
});
