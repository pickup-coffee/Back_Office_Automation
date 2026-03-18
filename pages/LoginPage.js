// @ts-check
const { expect } = require('@playwright/test');
const { BasePage } = require('./BasePage');
const { PATHS } = require('../config/constants');

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
      .getByPlaceholder(/mobile number|921\d+/i)
      .or(this.page.locator('input[type="tel"]').first());
  }

  /** Locator: password input (if present) */
  get passwordInput() {
    return this.page
      .getByPlaceholder(/password/i)
      .or(this.page.locator('input[type="password"]'))
      .first();
  }

  /** Locator: OTP input (appears after mobile submit) */
  get otpInput() {
    return this.page
      .getByPlaceholder(/otp|enter.*code|verification|^\d{6}$/i)
      .or(this.page.locator('input[inputmode="numeric"]'))
      .or(this.page.locator('input[type="tel"][maxlength="6"]'))
      .or(this.page.locator('input[maxlength="6"]'))
      .first();
  }

  /** Locator: Log in button or link */
  get loginButton() {
    return this.page
      .getByRole('button', { name: /log in/i })
      .or(this.page.getByRole('link', { name: /log in/i }))
      .first();
  }

  /** Locator: Submit/Verify button (after OTP entry) */
  get submitOtpButton() {
    return this.page
      .getByRole('button', { name: /verify|confirm|submit|log in/i })
      .or(this.page.getByRole('link', { name: /verify|confirm|submit|log in/i }))
      .first();
  }

  /** Navigate to the login page */
  async goto() {
    await super.goto(this.path);
  }

  /**
   * Perform login with mobile and OTP (two-step: mobile → click → OTP → click).
   * @param {string} mobile – e.g. 9123456789
   * @param {string} otp – e.g. 123456
   */
  async loginWithOtp(mobile, otp) {
    await this.mobileInput.fill(mobile);
    await this.loginButton.click();
    const otpField = this.otpInput;
    await otpField.waitFor({ state: 'visible', timeout: 20_000 });
    await otpField.fill(otp);
    await this.submitOtpButton.or(this.loginButton).first().click();
  }

  /**
   * Perform login with mobile (and optional password/OTP).
   * @param {string} mobile
   * @param {string} [passwordOrOtp]
   */
  async login(mobile, passwordOrOtp = '') {
    await this.mobileInput.fill(mobile);
    if (passwordOrOtp) {
      const pw = this.passwordInput;
      const otp = this.otpInput;
      if (await pw.isVisible()) {
        await pw.fill(passwordOrOtp);
      } else {
        await this.loginButton.click();
        await otp.waitFor({ state: 'visible', timeout: 12_000 });
        await otp.fill(passwordOrOtp);
      }
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
