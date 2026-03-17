// @ts-check
const path = require('path');
const fs = require('fs');
const playwrightTest = require('@playwright/test');
const { PageFactory } = require('../../pages/PageFactory');
const { ENV_KEYS } = require('../../config/constants');

/**
 * Playwright test fixtures using Page Object Model and Page Factory.
 * Includes setup/teardown hooks and screenshot on failure.
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

// Setup: runs before each test
playwrightTest.test.beforeEach(async () => {
  // Per-test setup (e.g. reset state, log)
});

// Teardown: runs after each test; captures screenshot on failure
playwrightTest.test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus && page) {
    const dir = path.join(process.cwd(), 'test-results', 'screenshots');
    fs.mkdirSync(dir, { recursive: true });
    const name = `${testInfo.project.name}_${testInfo.title.replace(/[^a-z0-9]/gi, '_')}.png`;
    await page.screenshot({ path: path.join(dir, name) });
  }
});
