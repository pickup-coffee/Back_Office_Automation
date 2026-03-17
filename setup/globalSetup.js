// @ts-check
/**
 * Global setup – runs once before all tests.
 * Use for: env validation, reporting start, one-time prep.
 */
module.exports = async () => {
  const baseUrl = process.env.BASE_URL || 'https://staging.bo.pickup-coffee.net';
  console.log('[globalSetup] Starting Back Office UI automation');
  console.log(`[globalSetup] Base URL: ${baseUrl}`);
};
