// @ts-check
const playwrightTest = require('@playwright/test');
const { PageFactory } = require('../pages/PageFactory');

/**
 * Extended test fixture with Page Object Model and Page Factory.
 */
exports.test = playwrightTest.test.extend({
  /**
   * Central page factory – preferred way to get page objects.
   */
  pageFactory: async ({ page }, use) => {
    await use(new PageFactory(page));
  },

  /**
   * Backwards-compatible fixtures that delegate to the factory.
   */
  loginPage: async ({ pageFactory }, use) => {
    await use(pageFactory.loginPage);
  },

  dashboardPage: async ({ pageFactory }, use) => {
    await use(pageFactory.dashboardPage);
  },

  authenticatedPage: async ({ pageFactory }, use) => {
    const mobile = process.env.BO_MOBILE || process.env.TEST_MOBILE;
    const password = process.env.BO_PASSWORD || process.env.TEST_PASSWORD;
    if (mobile && password) {
      const loginPage = pageFactory.loginPage;
      await loginPage.goto();
      await loginPage.login(mobile, password);
    }
    await use(pageFactory.page);
  },
});

exports.expect = playwrightTest.expect;
