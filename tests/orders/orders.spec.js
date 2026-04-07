// @ts-check
/**
 * Orders list: UI, API-style checks, and lightweight non-functional checks.
 */
const path = require('path');
const fs = require('fs');
const { test, expect } = require('../fixtures/base');
const { DashboardPage } = require('../../pages/DashboardPage');
const { BASE_URL } = require('../../config/constants');
const { waitForOrdersBackendAfter } = require('../support/ordersNetwork');
const {
  gotoWith429Retry,
  reloadWith429Retry,
  attach429ApiLogger,
} = require('../support/rateLimit');

const authStorageFile = path.join(__dirname, '..', '..', '.auth', 'bo-user.json');

let hasOrdersAccess = false;

test.describe('Orders page', () => {
  test.describe.configure({ mode: 'serial', timeout: 120_000 });

  test.beforeAll(async ({ browser }, testInfo) => {
    if (!fs.existsSync(authStorageFile)) {
      testInfo.skip(true, 'Missing .auth/bo-user.json — run auth setup first');
      return;
    }
    const context = await browser.newContext({ storageState: authStorageFile });
    const page = await context.newPage();
    try {
      await gotoWith429Retry(page, `${BASE_URL}/orders`);
      await expect(page.locator('main h1').first()).toBeVisible({ timeout: 15_000 });
      const title = ((await page.locator('main h1').first().textContent()) || '').trim();
      hasOrdersAccess = /^orders$/i.test(title);
    } finally {
      await context.close();
    }
  });

  test.beforeEach(async ({ page }) => {
    attach429ApiLogger(page);
    await gotoWith429Retry(page, `${BASE_URL}/orders`);
  });

  test.afterEach(async () => {
    const ms = Number(process.env.TEST_THROTTLE_MS || 0);
    if (ms > 0) {
      await new Promise((r) => setTimeout(r, ms));
    }
  });

  test.afterAll(async ({ browser }) => {
    if (!fs.existsSync(authStorageFile)) {
      return;
    }
    const context = await browser.newContext({ storageState: authStorageFile });
    const page = await context.newPage();
    const dashboardPage = new DashboardPage(page);
    try {
      await gotoWith429Retry(page, `${BASE_URL}/`);
      if (await dashboardPage.logoutLink.isVisible().catch(() => false)) {
        await dashboardPage.logout();
      }
    } finally {
      await context.close();
    }
  });

  test('route shows Orders heading or permission message', async ({ page }) => {
    const mainHeading = page.locator('main h1').first();
    await expect(mainHeading).toBeVisible({ timeout: 15_000 });
    const title = ((await mainHeading.textContent()) || '').trim();
    const ok = /^orders$/i.test(title) || /do not have permission/i.test(title);
    expect(ok).toBeTruthy();
  });

  test('heading, subtitle, search, refresh, summary visible', async ({ ordersPage }) => {
    test.skip(!hasOrdersAccess, 'No Orders module access');
    await ordersPage.expectOnOrdersPage();
    await expect(ordersPage.page.getByText(/manage and track.*orders/i)).toBeVisible();
    await ordersPage.expectSearchVisible();
    await expect(ordersPage.refreshButton).toBeVisible();
    await ordersPage.expectOrdersSummaryVisible();
  });

  test('search text then Clear empties field', async ({ ordersPage }) => {
    test.skip(!hasOrdersAccess, 'No Orders module access');
    await ordersPage.expectOnOrdersPage();
    await ordersPage.searchOrderNo('TEST-NONEXISTENT-99999');
    await expect(ordersPage.searchOrderInput).toHaveValue('TEST-NONEXISTENT-99999');
    await ordersPage.clearSearch();
    await expect(ordersPage.searchOrderInput).toHaveValue('');
  });

  test('Search submit keeps orders summary visible', async ({ ordersPage }) => {
    test.skip(!hasOrdersAccess, 'No Orders module access');
    await ordersPage.expectOnOrdersPage();
    await ordersPage.searchOrderNo('000000');
    await ordersPage.submitSearch();
    await ordersPage.expectOrdersSummaryVisible();
  });

  test('no-match search shows guidance text', async ({ ordersPage }) => {
    test.skip(!hasOrdersAccess, 'No Orders module access');
    await ordersPage.expectOnOrdersPage();
    await ordersPage.searchOrderNo('NO-SUCH-ORDER-XYZ');
    await ordersPage.submitSearch();
    await expect(
      ordersPage.page.getByText(/please verify your search or filter/i)
    ).toBeVisible();
  });

  test('navigate from home to Orders via nav', async ({ page, ordersPage }) => {
    test.skip(!hasOrdersAccess, 'No Orders module access');
    await gotoWith429Retry(page, `${BASE_URL}/`);
    await ordersPage.goToOrdersFromNav();
    await ordersPage.expectOnOrdersPage();
    await expect(ordersPage.ordersSubtitle).toBeVisible();
  });

  test('Refresh keeps heading and summary', async ({ ordersPage }) => {
    test.skip(!hasOrdersAccess, 'No Orders module access');
    await ordersPage.expectOnOrdersPage();
    await ordersPage.expectOrdersSummaryVisible();
    await ordersPage.refreshOrdersList();
    await expect(ordersPage.ordersHeading).toBeVisible({ timeout: 15_000 });
    await ordersPage.expectOrdersSummaryVisible();
  });

  test('Clear after typing empties search', async ({ ordersPage }) => {
    test.skip(!hasOrdersAccess, 'No Orders module access');
    await ordersPage.expectOnOrdersPage();
    await expect(ordersPage.clearSearchButton).toBeVisible();
    await ordersPage.searchOrderNo('VIS-CLR-TEST');
    await ordersPage.clearSearch();
    await expect(ordersPage.searchOrderInput).toHaveValue('');
  });

  test('Search with Enter keeps summary', async ({ ordersPage }) => {
    test.skip(!hasOrdersAccess, 'No Orders module access');
    await ordersPage.expectOnOrdersPage();
    await ordersPage.searchOrderNo('000000');
    await ordersPage.submitSearchWithEnter();
    await ordersPage.expectOrdersSummaryVisible();
  });

  test('open Filters shows Apply Filters button', async ({ ordersPage }) => {
    test.skip(!hasOrdersAccess, 'No Orders module access');
    await ordersPage.expectOnOrdersPage();
    await expect(ordersPage.filtersControl).toBeVisible({ timeout: 15_000 });
    await ordersPage.openFiltersPanel();
    await expect(ordersPage.applyFiltersButton).toBeVisible({ timeout: 10_000 });
  });

  test('filter panel fields visible; toggle logistics and Apply Filters', async ({
    ordersPage,
  }) => {
    test.skip(!hasOrdersAccess, 'No Orders module access');
    await ordersPage.expectOnOrdersPage();
    await ordersPage.openFiltersPanel();
    await ordersPage.expectFilterPanelFieldsVisible();
    await ordersPage.toggleLogisticsCheckbox('pandago');
    await ordersPage.applyFilters();
    await ordersPage.expectOrdersSummaryVisible();
  });

  test('Clear All Filters keeps Orders page and summary', async ({ ordersPage }) => {
    test.skip(!hasOrdersAccess, 'No Orders module access');
    await ordersPage.expectOnOrdersPage();
    await expect(ordersPage.clearAllFiltersLink).toBeVisible({ timeout: 10_000 });
    await ordersPage.clearAllFilters();
    await ordersPage.expectOnOrdersPage();
    await ordersPage.expectOrdersSummaryVisible();
  });

  test('orders table has thead and tbody', async ({ ordersPage }) => {
    test.skip(!hasOrdersAccess, 'No Orders module access');
    await ordersPage.expectOnOrdersPage();
    await expect(ordersPage.ordersTable).toBeVisible();
    await expect(ordersPage.ordersTable.locator('thead')).toBeVisible();
    await expect(ordersPage.ordersTable.locator('tbody')).toBeVisible();
  });

  test('search submit returns successful backend response', async ({ page, ordersPage }) => {
    test.skip(!hasOrdersAccess, 'No Orders module access');
    await ordersPage.expectOnOrdersPage();
    await ordersPage.searchOrderNo('000000');
    const response = await waitForOrdersBackendAfter(page, () => ordersPage.submitSearch());
    expect(response.ok()).toBeTruthy();
    await ordersPage.expectOrdersSummaryVisible();
  });

  test('Apply Filters returns successful backend response', async ({ page, ordersPage }) => {
    test.skip(!hasOrdersAccess, 'No Orders module access');
    const response = await waitForOrdersBackendAfter(page, async () => {
      await ordersPage.expectOnOrdersPage();
      await expect(ordersPage.filtersControl).toBeVisible({ timeout: 15_000 });
      await ordersPage.filtersControl.click();
      const apply = page.getByRole('button', { name: /apply filters/i });
      await expect(apply).toBeVisible({ timeout: 10_000 });
      await apply.click();
    });
    expect(response.ok()).toBeTruthy();
  });

  test('reload completes within load-time budget', async ({ page }) => {
    test.skip(!hasOrdersAccess, 'No Orders module access');
    const start = Date.now();
    await reloadWith429Retry(page);
    await expect(page.locator('main h1').first()).toBeVisible({ timeout: 15_000 });
    const loadMs = Date.now() - start;
    expect(loadMs).toBeLessThan(25_000);
  });

  test('main landmark is present', async ({ page }) => {
    test.skip(!hasOrdersAccess, 'No Orders module access');
    await expect(page.locator('main')).toBeVisible();
    await expect(page.getByRole('main')).toBeVisible();
  });
});
