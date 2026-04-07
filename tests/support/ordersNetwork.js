// @ts-check
/**
 * Match Orders-related XHR/fetch responses (functional / API-style checks).
 * Optional: ORDERS_API_URL_MATCH=substring for stricter matching.
 */

/**
 * Same URL heuristics as backend checks, without filtering by HTTP status.
 * @param {import('@playwright/test').Response} response
 * @returns {boolean}
 */
function ordersApiUrlMatches(response) {
  const rt = response.request().resourceType();
  if (rt !== 'fetch' && rt !== 'xhr') {
    return false;
  }
  const custom = process.env.ORDERS_API_URL_MATCH;
  const url = response.url();
  if (custom && url.includes(custom)) {
    return true;
  }
  const u = url.toLowerCase();
  return (
    /\/api\//.test(u) ||
    /graphql/i.test(u) ||
    (/order/.test(u) && !u.endsWith('.js') && !u.endsWith('.css'))
  );
}

/**
 * @param {import('@playwright/test').Response} response
 * @returns {boolean}
 */
function isLikelyOrdersBackendResponse(response) {
  if (response.status() < 200 || response.status() >= 400) {
    return false;
  }
  return ordersApiUrlMatches(response);
}

/**
 * Use as `page.waitForResponse` predicate: matches successful Orders API responses,
 * but throws a clear error if the server returns 429 (otherwise Playwright only times out).
 * @param {import('@playwright/test').Response} response
 * @returns {boolean}
 */
function matchOrdersBackendOrThrow429(response) {
  if (!ordersApiUrlMatches(response)) {
    return false;
  }
  if (response.status() === 429) {
    throw new Error(
      `HTTP 429 Too Many Requests (rate limited) — ${response.url()}\n` +
        `  Staging often throttles automated traffic. Options: TEST_THROTTLE_MS=500-2000 (pause between tests), ` +
        `NAV_429_RETRY_MS=10000, run fewer projects, or retry later.`
    );
  }
  if (response.status() < 200 || response.status() >= 400) {
    return false;
  }
  return true;
}

/**
 * Wait for a successful Orders-shaped API response after `trigger()` runs.
 * On HTTP 429, logs and retries `trigger` + wait (staging rate limits).
 *
 * @param {import('@playwright/test').Page} page
 * @param {() => Promise<void>} trigger
 * @param {{ maxAttempts?: number, delayMs?: number, timeout?: number }} [opts]
 * @returns {Promise<import('@playwright/test').Response>}
 */
async function waitForOrdersBackendAfter(page, trigger, opts = {}) {
  const maxAttempts = Math.max(
    1,
    Number(opts.maxAttempts ?? process.env.ORDERS_API_429_RETRIES ?? 4)
  );
  const delayMs = Math.max(
    0,
    Number(opts.delayMs ?? process.env.ORDERS_API_429_DELAY_MS ?? 8000)
  );
  const timeout = Number(opts.timeout ?? 25_000);
  /** @type {unknown} */
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const responsePromise = page.waitForResponse(
        (r) => matchOrdersBackendOrThrow429(r),
        { timeout }
      );
      await trigger();
      return await responsePromise;
    } catch (e) {
      lastError = e;
      const message = e instanceof Error ? e.message : String(e);
      const is429 =
        message.includes('429') || message.includes('Too Many Requests');
      const isWaitTimeout =
        message.includes('Timeout') ||
        message.includes('timeout') ||
        message.includes('exceeded');
      const retriable = (is429 || isWaitTimeout) && attempt < maxAttempts;
      if (retriable) {
        // eslint-disable-next-line no-console
        console.error(
          `[Orders API] ${is429 ? 'HTTP 429' : 'wait/response timeout'} — retry ${attempt}/${maxAttempts} after ${delayMs}ms`
        );
        await new Promise((r) => setTimeout(r, delayMs));
        continue;
      }
      throw e;
    }
  }
  throw lastError;
}

module.exports = {
  isLikelyOrdersBackendResponse,
  matchOrdersBackendOrThrow429,
  ordersApiUrlMatches,
  waitForOrdersBackendAfter,
};
