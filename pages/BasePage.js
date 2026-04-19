// @ts-check
const { expect } = require('@playwright/test');
const { TIMEOUTS } = require('../config/constants');

/**
 * Base Page Object – all page objects extend this class.
 * Encapsulates common Playwright page behavior and shared helpers.
 * Follows industry-standard Page Object Model (POM).
 */
class BasePage {
  /**
   * @param {import('@playwright/test').Page} page – Playwright page instance
   */
  constructor(page) {
    /** @type {import('@playwright/test').Page} */
    this.page = page;
  }

  /** Primary app content region (Back Office layouts use `main`). */
  get main() {
    return this.page.locator('main').first();
  }

  /**
   * Navigate to a path (relative to baseURL from config).
   * @param {string} path – path relative to base URL (e.g. '/' or '/roles')
   * @param {import('@playwright/test').PageGotoOptions} [options]
   */
  async goto(path, options = {}) {
    await this.page.goto(path, { waitUntil: 'load', timeout: 10_000, ...options });
  }

  /**
   * Reload the current document.
   * @param {import('@playwright/test').PageReloadOptions} [options]
   */
  async reload(options = {}) {
    await this.page.reload({ waitUntil: 'load', ...options });
  }

  /** Browser history back. */
  async goBack(options = {}) {
    await this.page.goBack({ waitUntil: 'domcontentloaded', ...options });
  }

  /**
   * Wait for a specific load state.
   * @param {'load'|'domcontentloaded'|'networkidle'} [state='domcontentloaded']
   */
  async waitForLoadState(state = 'domcontentloaded') {
    await this.page.waitForLoadState(state);
  }

  /**
   * @param {import('@playwright/test').Locator} locator
   * @param {number} [timeout=TIMEOUTS.DEFAULT]
   */
  async waitForVisible(locator, timeout = TIMEOUTS.DEFAULT) {
    await locator.waitFor({ state: 'visible', timeout });
  }

  /**
   * @param {import('@playwright/test').Locator} locator
   * @param {number} [timeout=TIMEOUTS.DEFAULT]
   */
  async waitForHidden(locator, timeout = TIMEOUTS.DEFAULT) {
    await locator.waitFor({ state: 'hidden', timeout });
  }

  /**
   * @param {import('@playwright/test').Locator} locator
   * @param {number} [timeout=TIMEOUTS.DEFAULT]
   */
  async waitForAttached(locator, timeout = TIMEOUTS.DEFAULT) {
    await locator.waitFor({ state: 'attached', timeout });
  }

  /**
   * Click after the locator is visible (common guard for flaky shells).
   * @param {import('@playwright/test').Locator} locator
   * @param {import('@playwright/test').LocatorClickOptions} [clickOptions]
   * @param {number} [timeout=TIMEOUTS.DEFAULT]
   */
  async safeClick(locator, clickOptions = {}, timeout = TIMEOUTS.DEFAULT) {
    await this.waitForVisible(locator, timeout);
    await locator.click(clickOptions);
  }

  /**
   * Scroll locator into view, then click.
   * @param {import('@playwright/test').Locator} locator
   * @param {import('@playwright/test').LocatorClickOptions} [clickOptions]
   */
  async clickInView(locator, clickOptions = {}) {
    await locator.scrollIntoViewIfNeeded();
    await this.safeClick(locator, clickOptions);
  }

  /**
   * @param {import('@playwright/test').Locator} locator
   * @param {string} value
   * @param {import('@playwright/test').LocatorFillOptions} [fillOptions]
   */
  async fillField(locator, value, fillOptions = {}) {
    await locator.fill(value, fillOptions);
  }

  /**
   * Clear then fill (inputs that support clear()).
   * @param {import('@playwright/test').Locator} locator
   * @param {string} value
   */
  async clearAndFill(locator, value) {
    await locator.click();
    await locator.clear();
    await locator.fill(value);
  }

  /**
   * Replace field contents like a user: focus, select all, delete, type with optional per-key delay.
   * Works well for composite phone widgets where `fill()` does not fire validation.
   * @param {import('@playwright/test').Locator} locator
   * @param {string} text
   * @param {{ delay?: number }} [options]
   */
  async replaceFieldText(locator, text, options = {}) {
    const delay = options.delay ?? 35;
    await locator.click();
    await locator.click({ clickCount: 3 });
    await this.page.keyboard.press('Backspace');
    await locator.pressSequentially(text, { delay });
  }

  /**
   * Strip non-digits, then {@link replaceFieldText}.
   * @param {import('@playwright/test').Locator} locator
   * @param {string} value
   * @param {{ delay?: number }} [options]
   */
  async replaceFieldWithDigits(locator, value, options = {}) {
    const digits = String(value).replace(/\D/g, '');
    await this.replaceFieldText(locator, digits, options);
  }

  /**
   * @param {string} key – e.g. `Escape`, `Enter`, `Tab`
   * @param {import('@playwright/test').KeyboardPressOptions} [pressOptions]
   */
  async pressKey(key, pressOptions = {}) {
    await this.page.keyboard.press(key, pressOptions);
  }

  /**
   * @param {import('@playwright/test').Locator} locator
   */
  async blurActive(locator) {
    await locator.blur();
  }

  /**
   * Whether the locator becomes visible within the timeout (does not throw).
   * @param {import('@playwright/test').Locator} locator
   * @param {number} [timeout=TIMEOUTS.ASSERTION]
   * @returns {Promise<boolean>}
   */
  async isVisible(locator, timeout = TIMEOUTS.ASSERTION) {
    try {
      await locator.waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Assert current URL matches string or RegExp (delegates to Playwright expect).
   * @param {string|RegExp|((url: URL) => boolean)} urlOrPredicate
   */
  async expectUrl(urlOrPredicate) {
    await expect(this.page).toHaveURL(urlOrPredicate);
  }

  /**
   * Return current page URL (for assertions in tests).
   * @returns {string}
   */
  get currentUrl() {
    return this.page.url();
  }

  /**
   * `td` with a responsive `data-label` (common on BO Tailwind tables).
   * @param {import('@playwright/test').Locator} row – table row locator
   * @param {string} label – exact `data-label` value, e.g. `"Name"`
   */
  tdByDataLabel(row, label) {
    return row.locator(`td[data-label="${label.replace(/"/g, '\\"')}"]`);
  }
}

module.exports = { BasePage };
