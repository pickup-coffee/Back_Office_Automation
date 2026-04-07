// @ts-check
const path = require('path');
const fs = require('fs');
const playwrightTest = require('@playwright/test');
const baseCore = require('./base-core');

/**
 * Playwright test fixtures using Page Object Model (POM classes from `pages/`).
 * Global hooks apply to `*.spec.js` files that use this fixture.
 */
exports.test = baseCore.test;
exports.expect = baseCore.expect;

playwrightTest.test.beforeEach(async () => {
  // Per-test setup (e.g. reset state, log)
});

playwrightTest.test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus && page) {
    const dir = path.join(process.cwd(), 'test-results', 'screenshots');
    fs.mkdirSync(dir, { recursive: true });
    const name = `${testInfo.project.name}_${testInfo.title.replace(/[^a-z0-9]/gi, '_')}.png`;
    await page.screenshot({ path: path.join(dir, name) });
  }
});
