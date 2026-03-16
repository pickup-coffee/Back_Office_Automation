// @ts-check
const playwrightTest = require('@playwright/test');
const { PageFactory } = require('../pages/PageFactory');
const { ENV_KEYS } = require('../../config/constants');

/**
 * Playwright test fixtures using Page Object Model and Page Factory.
 */
exports.test = playwrightTest.test.extend({
  pageFactory: async ({ page }, use) => {
    await use(new PageFactory(page));
  },

  loginPage: async ({ pageFactory }, use) => {
    await use(pageFactory.loginPage);
  },

  dashboardPage: async ({ pageFactory }, use) => {
    await use(pageFactory.dashboardPage);
  },

  authenticatedPage: async ({ pageFactory }, use) => {
    const mobile = process.env[ENV_KEYS.MOBILE] || process.env[ENV_KEYS.MOBILE_ALT];
    const password = process.env[ENV_KEYS.PASSWORD] || process.env[ENV_KEYS.PASSWORD_ALT];
    if (mobile && password) {
      const loginPage = pageFactory.loginPage;
      await loginPage.goto();
      await loginPage.login(mobile, password);
    }
    await use(pageFactory.page);
  },
});

exports.expect = playwrightTest.expect;
