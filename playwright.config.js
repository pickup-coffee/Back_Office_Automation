// @ts-check
const path = require('path');
const { defineConfig, devices } = require('@playwright/test');
const { BASE_URL, TIMEOUTS } = require('./config/constants');

const authStorageState = path.join(__dirname, '.auth', 'bo-user.json');

/** When set to `1`, `setup` runs after `login` (stricter ordering; login spec refreshes `.auth` first). */
const requireLoginBeforeSetup = process.env.REQUIRE_LOGIN_BEFORE_SETUP === '1';

module.exports = defineConfig({
  testDir: './tests',
  // Parallel test execution disabled for now (single worker, sequential)
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  timeout: TIMEOUTS.DEFAULT,
  expect: { timeout: TIMEOUTS.ASSERTION },
  globalSetup: require.resolve('./setup/globalSetup.js'),
  globalTeardown: require.resolve('./setup/globalTeardown.js'),
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
  },
  projects: [
    {
      name: 'login',
      timeout: 60_000,
      use: {
        ...devices['Desktop Chrome'],
        storageState: { cookies: [], origins: [] },
      },
      testMatch: /login\.spec\.js/,
    },
    {
      name: 'setup',
      /** Login + OTP + storage write can exceed default TIMEOUTS.DEFAULT on slow staging. */
      timeout: 60_000,
      use: { ...devices['Desktop Chrome'] },
      testMatch: /auth\.setup\.spec\.js/,
      // Default: no `login` dep so `--project=orders` skips login tests. Set REQUIRE_LOGIN_BEFORE_SETUP=1 for login → setup ordering.
      dependencies: requireLoginBeforeSetup ? ['login'] : [],
    },
    {
      name: 'dashboard',
      use: {
        ...devices['Desktop Chrome'],
        storageState: authStorageState,
      },
      testMatch: /dashboard\.spec\.js/,
      dependencies: ['setup'],
    },
    {
      name: 'orders',
      /** Longer: API functional tests retry on HTTP 429 with backoff (staging rate limits). */
      timeout: 120_000,
      use: {
        ...devices['Desktop Chrome'],
        storageState: authStorageState,
      },
      testMatch: /orders\/orders\.spec\.js/,
      dependencies: ['setup'],
    },
  ],
});
