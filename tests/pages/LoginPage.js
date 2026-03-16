// @ts-check
const { expect } = require('@playwright/test');
const { BasePage } = require('./BasePage');
const { PATHS } = require('../../config/constants');

/**
 * Page Object for the Back Office Login page.
 * Encapsulates locators and actions for https://staging.bo.pickup-coffee.net/
 */
class LoginPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);
    this.path = PATHS.LOGIN;
  }

  /** Locator: mobile number input */
  get mobileInput() {
    return this.page
      .getByPlaceholder(/mobile number/i)
      .or(this.page.locator('input[type="tel"]').or(this.page.locator('input[name*="mobile"]')))
      .first();
  }

  /** Locator: password input (if present) */
  get passwordInput() {
    return this.page
      .getByPlaceholder(/password/i)
      .or(this.page.locator('input[type="password"]'))
      .first();
  }

  /** Locator: Log in button or link */
  get loginButton() {
    return this.page
      .getByRole('button', { name: /log in/i })
      .or(this.page.getByRole('link', { name: /log in/i }))
      .first();
  }

  /** Navigate to the login page */
  async goto() {
    await super.goto(this.path);
  }

  /**
   * Perform login with mobile (and optional password).
   * @param {string} mobile
   * @param {string} [password]
   */
  async login(mobile, password = '') {
    await this.mobileInput.fill(mobile);
    if (password) {
      const pw = this.passwordInput;
      if (await pw.isVisible()) await pw.fill(password);
    }
    await this.loginButton.click();
  }

  /** Assert: login button is visible (page loaded) */
  async expectLoginVisible() {
    await expect(this.loginButton).toBeVisible();
  }

  /** Assert: current page is the login page */
  async expectOnLoginPage() {
    await expect(this.page).toHaveURL(new RegExp(this.path));
    await this.expectLoginVisible();
  }
}

module.exports = { LoginPage };
