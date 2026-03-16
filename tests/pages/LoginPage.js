// @ts-check
const { expect } = require('@playwright/test');

const BASE_PATH = '/';

/**
 * Page object for the Back Office login page.
 * https://staging.bo.pickup-coffee.net/
 */
class LoginPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.url = BASE_PATH;
  }

  async goto() {
    await this.page.goto(this.url);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Mobile number input (may be inside a wrapper with country code +63).
   */
  get mobileInput() {
    return this.page.getByPlaceholder(/mobile number/i).or(
      this.page.locator('input[type="tel"]').or(this.page.locator('input[name*="mobile"]'))
    ).first();
  }

  /**
   * Password input if present (some back offices use OTP only).
   */
  get passwordInput() {
    return this.page.getByPlaceholder(/password/i).or(
      this.page.locator('input[type="password"]')
    ).first();
  }

  get loginButton() {
    return this.page.getByRole('button', { name: /log in/i }).or(
      this.page.getByRole('link', { name: /log in/i })
    ).first();
  }

  async login(mobile, password = '') {
    await this.mobileInput.fill(mobile);
    if (password) {
      const pw = this.passwordInput;
      if (await pw.isVisible()) await pw.fill(password);
    }
    await this.loginButton.click();
  }

  async expectLoginVisible() {
    await expect(this.loginButton).toBeVisible();
  }

  async expectOnLoginPage() {
    await expect(this.page).toHaveURL(new RegExp(this.url));
    await this.expectLoginVisible();
  }
}

module.exports = { LoginPage };
