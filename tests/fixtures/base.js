// @ts-check
const path = require('path');
const fs = require('fs');
const playwrightTest = require('@playwright/test');
const baseCore = require('./base-core');
const { stepPause, stepPauseAfterTest } = require('../support/stepPause');

/**
 * Playwright test fixtures using Page Object Model (POM classes from `pages/`).
 * Global hooks apply to `*.spec.js` files that use this fixture.
 *
 * **Pauses:** ~400 ms before each test (`stepPause`); **~1 s after each test** (`stepPauseAfterTest`)
 * so you can see the result before the next case. `PW_STEP_PAUSE_MS=0` disables all; tune with
 * `PW_STEP_PAUSE_AFTER_MS` (after-test only). CI: off by default. Use `PW_SLOW_MO_MS` for slower clicks.
 */
exports.test = baseCore.test;
exports.expect = baseCore.expect;

playwrightTest.test.beforeEach(async ({ page }) => {
  await stepPause(page, 'test-start');
});

/**
 * ~1s pause after each test (local default). Hook order: failure screenshot runs first, then this pause.
 */
playwrightTest.test.afterEach(async ({ page }) => {
  await stepPauseAfterTest(page);
});

playwrightTest.test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus && page) {
    const dir = path.join(process.cwd(), 'test-results', 'screenshots');
    fs.mkdirSync(dir, { recursive: true });
    const name = `${testInfo.project.name}_${testInfo.title.replace(/[^a-z0-9]/gi, '_')}.png`;
    await page.screenshot({ path: path.join(dir, name) });
  }
});
