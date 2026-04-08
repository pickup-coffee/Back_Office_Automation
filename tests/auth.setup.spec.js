// @ts-check
/**
 * Ensures `.auth/bo-user.json` exists for dashboard + orders projects.
 * Reuses session from the login project's full OTP test when possible (avoids a second OTP).
 */
const path = require('path');
const fs = require('fs');
const { test: setup, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { DEFAULT_TEST_CREDENTIALS, BASE_URL } = require('../config/constants');
const { stepPause } = require('./support/stepPause');

const authFile = path.join(__dirname, '..', '.auth', 'bo-user.json');

function ensureAuthDir() {
  fs.mkdirSync(path.dirname(authFile), { recursive: true });
}

function hasAuthPayload(data) {
  return (
    (Array.isArray(data.cookies) && data.cookies.length > 0) ||
    (Array.isArray(data.origins) && data.origins.length > 0)
  );
}

setup('authenticate staging user', async ({ browser }) => {
  ensureAuthDir();

  const forceLogin = process.env.FORCE_AUTH_SETUP === '1';

  if (!forceLogin && fs.existsSync(authFile)) {
    try {
      const data = JSON.parse(fs.readFileSync(authFile, 'utf8'));
      if (hasAuthPayload(data)) {
        const context = await browser.newContext({
          baseURL: BASE_URL,
          storageState: authFile,
        });
        const page = await context.newPage();
        try {
          await page.goto(BASE_URL, { waitUntil: 'load' });
          await expect(page.getByText(/log out/i)).toBeVisible({ timeout: 30_000 });
          await stepPause(page, 'auth-reuse-ok');
          await context.storageState({ path: authFile });
          await context.close();
          return;
        } catch {
          await context.close();
        }
      }
    } catch {
      // Invalid JSON or unreadable file — fall through to full login
    }
  }

  const context = await browser.newContext({ baseURL: BASE_URL });
  const page = await context.newPage();
  const loginPage = new LoginPage(page);
  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await context.clearCookies();
      await loginPage.goto();
      await loginPage.loginWithOtp(
        DEFAULT_TEST_CREDENTIALS.MOBILE,
        DEFAULT_TEST_CREDENTIALS.OTP
      );
      await expect(page.getByText(/log out/i)).toBeVisible({ timeout: 30_000 });
      await stepPause(page, 'auth-login-ok');
      break;
    } catch (e) {
      if (attempt === maxAttempts) {
        await context.close();
        throw e;
      }
      await page.waitForTimeout(4000);
    }
  }
  await context.storageState({ path: authFile });
  await context.close();
});
