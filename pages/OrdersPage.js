// @ts-check
const { expect } = require('@playwright/test');
const { BasePage } = require('./BasePage');
const { PATHS } = require('../config/constants');

/**
 * Page Object for Back Office Orders (list, search, filters).
 * Locators align with staging DOM: placeholder Search Order No., .clear-search-btn, etc.
 */
class OrdersPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);
    this.path = PATHS.ORDERS;
  }

  /** Main nav link to Orders */
  get ordersNavLink() {
    return this.page.getByRole('link', { name: /^orders$/i }).first();
  }

  /** Page title (h1 on Orders list) */
  get ordersHeading() {
    return this.page.locator('main h1').filter({ hasText: /^orders$/i });
  }

  /** Search Order No. input */
  get searchOrderInput() {
    return this.page.getByPlaceholder('Search Order No.');
  }

  /** Clear button next to search */
  get clearSearchButton() {
    return this.page.locator('.clear-search-btn');
  }

  /** Green Search button */
  get searchButton() {
    return this.page.getByRole('button', { name: /^search$/i }).first();
  }

  /** Refresh control (button or clickable with Refresh text) */
  get refreshButton() {
    return this.page
      .getByRole('button', { name: /refresh/i })
      .or(this.page.getByText(/^refresh$/i))
      .first();
  }

  /** "Showing X of Y Orders" summary line */
  get ordersSummary() {
    return this.page.getByText(/showing\s+\d+\s+of\s+\d+\s+orders/i);
  }

  /** Filters control (link or button depending on layout) */
  get filtersControl() {
    return this.page
      .getByRole('link', { name: /^filters$/i })
      .or(this.page.getByRole('button', { name: /^filters$/i }))
      .first();
  }

  /** Clear All Filters (next to Filters on the toolbar) */
  get clearAllFiltersLink() {
    return this.page
      .getByRole('link', { name: /clear all filters/i })
      .or(this.page.getByRole('button', { name: /clear all filters/i }))
      .first();
  }

  /** Main orders table (staging uses a table in main) */
  get ordersTable() {
    return this.page.locator('main table').first();
  }

  /** Subtitle under Orders heading */
  get ordersSubtitle() {
    return this.page.getByText(/manage and track.*orders/i);
  }

  /** Empty list message */
  get emptyStateMessage() {
    return this.page.getByText(/item not found/i);
  }

  /**
   * Date order — staging uses textbox "Datepicker input" and a `… calendar` button, not always placeholder "Select date range".
   */
  get filterDateRangeInput() {
    const panel = this.page.getByRole('main');
    return panel
      .getByRole('button', { name: /calendar/i })
      .or(panel.getByRole('textbox', { name: /datepicker input/i }))
      .or(panel.getByPlaceholder(/select date range/i))
      .or(panel.getByRole('button', { name: /select date range/i }))
      .first();
  }

  /** Primary action in expanded filter block */
  get applyFiltersButton() {
    return this.page.getByRole('button', { name: /apply filters/i });
  }

  /**
   * Label + "All" dropdown — find the **row** `div` (ancestor of the label that contains the button).
   * @param {string} labelText — e.g. "Payment Method", "Store Branch"
   * @returns {import('@playwright/test').Locator}
   */
  filterRowDropdown(labelText) {
    return this.ordersFilterCard
      .getByText(labelText, { exact: true })
      .locator('xpath=ancestor::*[.//button][1]')
      .getByRole('button', { name: /^All$/i })
      .first();
  }

  /** Payment Method dropdown trigger */
  get filterPaymentMethodCombobox() {
    return this.filterRowDropdown('Payment Method');
  }

  /** Payment Status dropdown trigger */
  get filterPaymentStatusCombobox() {
    return this.filterRowDropdown('Payment Status');
  }

  /** Order Status dropdown trigger */
  get filterOrderStatusCombobox() {
    return this.filterRowDropdown('Order Status');
  }

  /** Store Branch dropdown trigger */
  get filterStoreBranchCombobox() {
    return this.filterRowDropdown('Store Branch');
  }

  /** Logistics option checkboxes */
  get filterLogisticsPandago() {
    return this.page.getByRole('checkbox', { name: /pandago/i });
  }

  get filterLogisticsAngkas() {
    return this.page.getByRole('checkbox', { name: /angkas/i });
  }

  /** Order method checkboxes */
  get filterOrderMethodSelfPickup() {
    return this.page.getByRole('checkbox', { name: /self pickup/i });
  }

  get filterOrderMethodDelivery() {
    return this.page.getByRole('checkbox', { name: /delivery/i });
  }

  get filterOrderMethodAutoAccepted() {
    return this.page.getByRole('checkbox', { name: /auto accepted orders/i });
  }

  async goto() {
    await super.goto(this.path);
  }

  /** Open Orders from main navigation (when not already on /orders). */
  async goToOrdersFromNav() {
    await this.ordersNavLink.click();
    await this.expectOnOrdersPage();
  }

  async expectOnOrdersPage() {
    await expect(this.page).toHaveURL(new RegExp(`${PATHS.ORDERS.replace('/', '\\/')}`));
    await expect(this.ordersHeading).toBeVisible();
  }

  async expectSearchVisible() {
    await expect(this.searchOrderInput).toBeVisible();
  }

  async searchOrderNo(value) {
    await this.searchOrderInput.fill(value);
  }

  async submitSearch() {
    await this.searchButton.click();
  }

  async clearSearch() {
    await this.clearSearchButton.click();
  }

  async expectOrdersSummaryVisible() {
    await expect(this.ordersSummary).toBeVisible();
  }

  async refreshOrdersList() {
    await this.refreshButton.click();
  }

  async clearAllFilters() {
    await this.clearAllFiltersLink.click();
  }

  /** Region of `main` that contains Apply Filters (dropdowns + checkboxes live here). */
  get ordersFilterCard() {
    return this.page.locator('main').filter({
      has: this.page.getByRole('button', { name: /apply filters/i }),
    });
  }

  /** Open Filters accordion/panel until Apply Filters is visible. */
  async openFiltersPanel() {
    await this.filtersControl.click();
    await expect(this.applyFiltersButton).toBeVisible({ timeout: 10_000 });
  }

  /** Assert expanded filter panel controls are present (staging uses custom widgets, not always combobox roles). */
  async expectFilterPanelFieldsVisible() {
    await expect(this.filterDateRangeInput).toBeVisible({ timeout: 10_000 });
    const allDropdowns = this.ordersFilterCard.getByRole('button', { name: /^All$/i });
    await expect(allDropdowns).toHaveCount(4);
    await expect(this.filterLogisticsPandago).toBeVisible();
    await expect(this.filterLogisticsAngkas).toBeVisible();
    await expect(this.filterOrderMethodSelfPickup).toBeVisible();
    await expect(this.filterOrderMethodDelivery).toBeVisible();
    await expect(this.filterOrderMethodAutoAccepted).toBeVisible();
    await expect(this.applyFiltersButton).toBeVisible();
  }

  /**
   * Toggle a logistics checkbox (UI smoke; does not assert API).
   * @param {'pandago'|'angkas'} which
   */
  async toggleLogisticsCheckbox(which) {
    const box = which === 'pandago' ? this.filterLogisticsPandago : this.filterLogisticsAngkas;
    await box.click();
  }

  /** Click Apply Filters (after opening panel). */
  async applyFilters() {
    await this.applyFiltersButton.click();
  }

  /** Submit search via keyboard (Enter) */
  async submitSearchWithEnter() {
    await this.searchOrderInput.press('Enter');
  }
}

module.exports = { OrdersPage };
