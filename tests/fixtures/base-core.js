// @ts-check
/**
 * Core POM fixtures only (no global test.beforeEach/afterEach).
 * Each page object is `new PageClass(page)` once per test.
 * `base.js` re-exports this and adds global hooks for classic specs.
 */
const playwrightTest = require('@playwright/test');
const { LoginPage } = require('../../pages/LoginPage');
const { DashboardPage } = require('../../pages/DashboardPage');
const { OrdersPage } = require('../../pages/OrdersPage');
const { ENV_KEYS, DEFAULT_TEST_CREDENTIALS } = require('../../config/constants');

exports.test = playwrightTest.test.extend({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },

  ordersPage: async ({ page }, use) => {
    await use(new OrdersPage(page));
  },

  authenticatedPage: async ({ page, loginPage }, use) => {
    const mobile =
      process.env[ENV_KEYS.MOBILE] ||
      process.env[ENV_KEYS.MOBILE_ALT] ||
      DEFAULT_TEST_CREDENTIALS.MOBILE;
    const otp =
      process.env[ENV_KEYS.OTP] ||
      process.env[ENV_KEYS.OTP_ALT] ||
      DEFAULT_TEST_CREDENTIALS.OTP;
    const password = process.env[ENV_KEYS.PASSWORD] || process.env[ENV_KEYS.PASSWORD_ALT];
    await loginPage.goto();
    if (otp) {
      await loginPage.loginWithOtp(mobile, otp);
    } else {
      await loginPage.login(mobile, password || '');
    }
    await use(page);
  },
});

exports.expect = playwrightTest.expect;
