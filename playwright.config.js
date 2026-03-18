// @ts-check
const { defineConfig, devices } = require('@playwright/test');
const { BASE_URL, TIMEOUTS } = require('./config/constants');

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 5,
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
      use: { ...devices['Desktop Chrome'] },
      testMatch: /login\.spec\.js/,
    },
    {
      name: 'dashboard',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /dashboard\.spec\.js/,
      dependencies: ['login'],
    },
  ],
});
