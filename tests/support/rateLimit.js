// @ts-check
/**
 * HTTP 429 (Too Many Requests) — staging often rate-limits automated traffic.
 * Use gotoWith429Retry for navigations; set TEST_THROTTLE_MS to pause between tests.
 */

/**
 * Navigate and retry when the document response is 429.
 * @param {import('@playwright/test').Page} page
 * @param {string} url
 * @param {import('@playwright/test').GotoOptions} [options]
 * @returns {Promise<import('@playwright/test').Response | null>}
 */
async function gotoWith429Retry(page, url, options = {}) {
  const max = Math.max(1, Number(process.env.NAV_429_RETRIES || 3));
  const delayMs = Math.max(0, Number(process.env.NAV_429_RETRY_MS || 5000));
  const merged = { waitUntil: 'load', timeout: 30_000, ...options };
  let lastStatus = /** @type {number | null} */ (null);

  for (let attempt = 1; attempt <= max; attempt++) {
    const response = await page.goto(url, merged);
    const status = response?.status() ?? null;
    lastStatus = status;
    if (status !== 429) {
      return response;
    }
    // eslint-disable-next-line no-console
    console.error(
      `[HTTP 429] Navigation rate-limited (${attempt}/${max}): ${url}\n` +
        `  Retrying in ${delayMs}ms… (tune NAV_429_RETRY_MS, NAV_429_RETRIES, or TEST_THROTTLE_MS)`
    );
    if (attempt < max) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }

  throw new Error(
    `HTTP 429 Too Many Requests after ${max} navigation attempts to ${url} (last status ${lastStatus}). ` +
      `Staging is throttling requests. Try: TEST_THROTTLE_MS=800 between tests, NAV_429_RETRY_MS=10000, ` +
      `run only --project=orders, or retry later.`
  );
}

/**
 * Log any 429 from XHR/fetch so failures are easier to explain (not only timeouts).
 * @param {import('@playwright/test').Page} page
 * @returns {() => void} call to remove listener (optional)
 */
function attach429ApiLogger(page) {
  /** @param {import('@playwright/test').Response} res */
  const handler = (res) => {
    if (res.status() !== 429) return;
    const rt = res.request().resourceType();
    if (rt !== 'fetch' && rt !== 'xhr') return;
    // eslint-disable-next-line no-console
    console.error(`[HTTP 429] API ${res.request().method()} ${res.url()}`);
  };
  page.on('response', handler);
  return () => page.off('response', handler);
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {import('@playwright/test').PageReloadOptions} [options]
 * @returns {Promise<import('@playwright/test').Response | null>}
 */
async function reloadWith429Retry(page, options = {}) {
  const max = Math.max(1, Number(process.env.NAV_429_RETRIES || 3));
  const delayMs = Math.max(0, Number(process.env.NAV_429_RETRY_MS || 5000));
  const merged = { waitUntil: 'load', timeout: 30_000, ...options };
  let lastStatus = /** @type {number | null} */ (null);

  for (let attempt = 1; attempt <= max; attempt++) {
    const response = await page.reload(merged);
    const status = response?.status() ?? null;
    lastStatus = status;
    if (status !== 429) {
      return response;
    }
    // eslint-disable-next-line no-console
    console.error(
      `[HTTP 429] Reload rate-limited (${attempt}/${max})\n` +
        `  Retrying in ${delayMs}ms…`
    );
    if (attempt < max) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }

  throw new Error(
    `HTTP 429 Too Many Requests after ${max} reload attempts (last status ${lastStatus}). ` +
      `Try TEST_THROTTLE_MS or retry later.`
  );
}

module.exports = { gotoWith429Retry, reloadWith429Retry, attach429ApiLogger };
