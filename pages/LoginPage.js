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

  /** Locator: mobile number input (placeholders like "+63 9123456789", "Mobile Number") */
  get mobileInput() {
    return this.page
      .getByPlaceholder(/mobile number|\+63|921\d+|912\d+/i)
      .or(this.page.locator('input[type="tel"]').first())
      .or(this.page.locator('main section input').first());
  }

  /** Locator: password input (if present) */
  get passwordInput() {
    return this.page
      .getByPlaceholder(/password/i)
      .or(this.page.locator('input[type="password"]'))
      .first();
  }

  /** Locator: OTP field (must not match mobile — do not use generic "main textbox") */
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

  /** Locator: primary action on OTP step (SUBMIT — may be disabled until OTP is complete) */
  get submitOtpButton() {
    return this.page
      .getByRole('button', { name: /^submit$/i })
      .or(this.page.getByRole('button', { name: /verify|confirm|submit|log in/i }))
      .or(this.page.getByRole('link', { name: /verify|confirm|submit|log in/i }))
      .first();
  }

  /** Locator: GO BACK on OTP step (not always a link; match visible text) */
  get goBackControl() {
    return this.page.getByText(/go back/i).first();
  }

  /** Navigate to the login page */
  async goto() {
    await super.goto(this.path);
  }

  /**
   * After clicking LOG IN on the mobile step, wait until the OTP step is shown.
   * Retries LOG IN a few times — staging can drop the first request or show the OTP UI late.
   */
  async waitForOtpStepAfterMobileClick() {
    const otpPrimary = this.page
      .getByRole('button', { name: /^submit$/i })
      .or(this.page.getByRole('button', { name: /^(verify|confirm)$/i }));
    const maxRounds = 4;
    for (let round = 0; round < maxRounds; round++) {
      try {
        await otpPrimary.waitFor({ state: 'visible', timeout: round === 0 ? 14_000 : 10_000 });
        return;
      } catch (e) {
        if (round === maxRounds - 1) {
          throw e;
        }
        await this.loginButton.click();
        await this.page.waitForTimeout(500);
      }
    }
  }

  /**
   * On the OTP step only: enter OTP and submit (mobile step must already be done).
   * @param {string} otp – e.g. 123456
   */
  async submitOtpAndFinishLogin(otp) {
    const otpField = this.otpInput;
    await otpField.click();
    await otpField.clear();
    await otpField.pressSequentially(otp, { delay: 40 });
    const submitBtn = this.page.getByRole('button', { name: /submit/i });
    await expect(submitBtn).toBeEnabled({ timeout: 15_000 });
    await submitBtn.click();
  }

  /**
   * Perform login with mobile and OTP (two-step: mobile → click → OTP → click).
   * @param {string} mobile – e.g. 9123456789
   * @param {string} otp – e.g. 123456
   */
  async loginWithOtp(mobile, otp) {
    await this.mobileInput.fill(mobile);
    await this.loginButton.click();
    await this.waitForOtpStepAfterMobileClick();
    await this.submitOtpAndFinishLogin(otp);
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

  /** Assert: OTP step (SUBMIT, GO BACK) visible after mobile step */
  async expectOtpStepVisible() {
    await this.waitForOtpStepAfterMobileClick();
    await expect(this.otpInput).toBeVisible({ timeout: 10_000 });
    await expect(this.goBackControl).toBeVisible();
  }
}

module.exports = { LoginPage };
