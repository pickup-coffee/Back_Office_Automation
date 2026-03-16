// @ts-check
const { LoginPage } = require('./LoginPage');
const { DashboardPage } = require('./DashboardPage');

/**
 * Central factory for all Back Office page objects.
 *
 * Usage in tests (via fixtures):
 *   const { test } = require('../fixtures/base');
 *
 *   test('example', async ({ pageFactory }) => {
 *     const loginPage = pageFactory.loginPage;
 *     await loginPage.goto();
 *   });
 */
class PageFactory {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    /** @type {LoginPage | null} */
    this._loginPage = null;
    /** @type {DashboardPage | null} */
    this._dashboardPage = null;
  }

  /** @returns {LoginPage} */
  get loginPage() {
    if (!this._loginPage) {
      this._loginPage = new LoginPage(this.page);
    }
    return this._loginPage;
  }

  /** @returns {DashboardPage} */
  get dashboardPage() {
    if (!this._dashboardPage) {
      this._dashboardPage = new DashboardPage(this.page);
    }
    return this._dashboardPage;
  }
}

module.exports = { PageFactory };

