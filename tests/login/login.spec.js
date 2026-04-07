// @ts-check
const path = require('path');
const fs = require('fs');
const { test, expect } = require('../fixtures/base');
const { DEFAULT_TEST_CREDENTIALS } = require('../../config/constants');

/** Same path as `tests/auth.setup.spec.js` — shared for dashboard/orders `storageState`. */
const authStorageFile = path.join(__dirname, '..', '..', '.auth', 'bo-user.json');

const { MOBILE: TEST_MOBILE, OTP: TEST_OTP } = DEFAULT_TEST_CREDENTIALS;

test.describe('Back Office Login', () => {
  test('login page loads and shows log in option', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.expectOnLoginPage();
  });

  test('mobile input is visible and focusable', async ({ loginPage }) => {
    await loginPage.goto();
    await expect(loginPage.mobileInput).toBeVisible();
    await loginPage.enterMobileNumber(TEST_MOBILE);
    await expect(loginPage.mobileInput).toHaveValue(TEST_MOBILE);
  });

  test(`OTP step shows SUBMIT and GO BACK, then full login (${TEST_MOBILE} / ${TEST_OTP})`, async ({
    page,
    loginPage,
    dashboardPage,
  }) => {
    await loginPage.goto();
    await loginPage.enterMobileNumber(TEST_MOBILE);
    await loginPage.loginButton.click();
    await loginPage.expectOtpStepVisible();
    await loginPage.submitOtpAndFinishLogin(TEST_OTP);
    await dashboardPage.expectLoggedIn();
    fs.mkdirSync(path.dirname(authStorageFile), { recursive: true });
    await page.context().storageState({ path: authStorageFile });
  });
});
