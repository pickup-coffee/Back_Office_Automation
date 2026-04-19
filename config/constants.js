// @ts-check
/**
 * Central configuration and constants for Back Office UI automation.
 * Use environment variables for secrets and environment-specific values.
 */

const BASE_URL = process.env.BASE_URL || 'https://staging.bo.pickup-coffee.net';

/** Paths relative to base URL */
const PATHS = {
  LOGIN: '/',
  ROLES: '/roles',
  ORDERS: '/orders',
  STAFF: '/staff',
  BRANCHES: '/branches',
  GIFT_CARDS_SETTINGS:
    process.env.BO_GIFT_CARDS_SETTINGS_PATH || '/marketing-tools/gift-cards/settings',
};

/** Environment variable names for test credentials (do not commit values) */
const ENV_KEYS = {
  MOBILE: 'BO_MOBILE',
  MOBILE_ALT: 'TEST_MOBILE',
  PASSWORD: 'BO_PASSWORD',
  PASSWORD_ALT: 'TEST_PASSWORD',
  OTP: 'BO_OTP',
  OTP_ALT: 'TEST_OTP',
};

/** Staging test login: mobile + OTP (override with BO_MOBILE / BO_OTP env vars) */
const DEFAULT_TEST_CREDENTIALS = {
  MOBILE: process.env[ENV_KEYS.MOBILE] || process.env[ENV_KEYS.MOBILE_ALT] || '9123456789',
  OTP: process.env[ENV_KEYS.OTP] || process.env[ENV_KEYS.OTP_ALT] || '123456',
};

/** Default timeouts in milliseconds */
const TIMEOUTS = {
  DEFAULT: 25_000,
  ASSERTION: 8_000,
};

module.exports = {
  BASE_URL,
  PATHS,
  ENV_KEYS,
  TIMEOUTS,
  DEFAULT_TEST_CREDENTIALS,
};
