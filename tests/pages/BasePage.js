// @ts-check
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

  /**
   * Navigate to a path (relative to baseURL from config).
   * @param {string} path – path relative to base URL (e.g. '/' or '/roles')
   */
  async goto(path) {
    await this.page.goto(path);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Wait for a specific load state.
   * @param {'load'|'domcontentloaded'|'networkidle'} [state='domcontentloaded']
   */
  async waitForLoadState(state = 'domcontentloaded') {
    await this.page.waitForLoadState(state);
  }

  /**
   * Return current page URL (for assertions in tests).
   * @returns {string}
   */
  get currentUrl() {
    return this.page.url();
  }
}

module.exports = { BasePage };
