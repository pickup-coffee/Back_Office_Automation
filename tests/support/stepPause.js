// @ts-check
/**
 * Pauses so you can follow each step (especially with `--headed`).
 *
 * **Before test & inline steps (`stepPause`):** default **400 ms** locally (`PW_STEP_PAUSE_MS`, `0` = off).
 *
 * **After each test completes (`stepPauseAfterTest`):** default **1000 ms** (1 s) locally so you can
 * see the screen before the next test — `PW_STEP_PAUSE_AFTER_MS` to override, `0` to off.
 * If `PW_STEP_PAUSE_MS=0`, all pauses (including after-test) are off.
 *
 * **CI:** defaults to **0** unless env vars are set explicitly.
 *
 * **Debug:** `PW_DEBUG_PAUSE=1` logs each pause label.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} [_label]
 */
function resolveStepPauseMs() {
  const raw = process.env.PW_STEP_PAUSE_MS;
  if (raw === '0') return 0;
  if (raw !== undefined && String(raw).trim() !== '') {
    const n = Number(raw);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  }
  if (process.env.CI) return 0;
  return 400;
}

/** Longer beat after each test finishes (next test hasn’t started yet). */
function resolveAfterTestPauseMs() {
  if (process.env.PW_STEP_PAUSE_MS === '0') return 0;
  const raw = process.env.PW_STEP_PAUSE_AFTER_MS;
  if (raw === '0') return 0;
  if (raw !== undefined && String(raw).trim() !== '') {
    const n = Number(raw);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  }
  if (process.env.CI) return 0;
  return 1000;
}

async function stepPause(page, _label) {
  const ms = resolveStepPauseMs();
  if (ms > 0 && page) {
    if (process.env.PW_DEBUG_PAUSE === '1' && _label) {
      console.log(`[stepPause] ${_label} (${ms}ms)`);
    }
    await page.waitForTimeout(ms);
  }
}

async function stepPauseAfterTest(page) {
  const ms = resolveAfterTestPauseMs();
  if (ms > 0 && page) {
    if (process.env.PW_DEBUG_PAUSE === '1') {
      console.log(`[stepPause] test-done (${ms}ms)`);
    }
    await page.waitForTimeout(ms);
  }
}

module.exports = { stepPause, stepPauseAfterTest, resolveStepPauseMs, resolveAfterTestPauseMs };
