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
};

/** Environment variable names for test credentials (do not commit values) */
const ENV_KEYS = {
  MOBILE: 'BO_MOBILE',
  MOBILE_ALT: 'TEST_MOBILE',
  PASSWORD: 'BO_PASSWORD',
  PASSWORD_ALT: 'TEST_PASSWORD',
};

/** Default timeouts in milliseconds */
const TIMEOUTS = {
  DEFAULT: 30_000,
  ASSERTION: 10_000,
};

module.exports = {
  BASE_URL,
  PATHS,
  ENV_KEYS,
  TIMEOUTS,
};
