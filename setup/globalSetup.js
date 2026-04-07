// @ts-check
/**
 * Global setup – env validation, reporting start.
 * Authenticated sessions for dashboard/orders are created in tests/auth.setup.spec.js.
 */
module.exports = async () => {
  const baseUrl = process.env.BASE_URL || 'https://staging.bo.pickup-coffee.net';
  console.log('[globalSetup] Starting Back Office UI automation');
  console.log(`[globalSetup] Base URL: ${baseUrl}`);
};
