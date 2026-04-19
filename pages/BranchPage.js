// @ts-check
const { expect } = require('@playwright/test');
const { BasePage } = require('./BasePage');
const { PATHS } = require('../config/constants');

class BranchPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);
    this.path = PATHS.BRANCHES || '/branches';
  }

  get branchNavLink() {
    return this.page.getByRole('link', { name: /^branches?$/i }).first();
  }

  get branchListHeading() {
    return this.page
      .getByRole('heading', { name: /branch management|branch list|branches/i })
      .or(this.page.locator('main h1').filter({ hasText: /branch/i }))
      .first();
  }

  get newBranchButton() {
    return this.page
      .getByRole('link', { name: /new branch/i })
      .or(this.page.getByRole('button', { name: /new branch/i }))
      .first();
  }

  get branchTable() {
    return this.page.locator('main table').first();
  }

  get branchRows() {
    return this.branchTable.locator('tbody tr');
  }

  get sortAlphabetical() {
    return this.page.getByRole('button', { name: /^alphabetical$/i });
  }

  get sortRecentlyAdded() {
    return this.page.getByRole('button', { name: /^recently added$/i });
  }

  get searchBranchInput() {
    return this.page.getByPlaceholder(/search branch|search/i).first();
  }

  get newBranchFormHeading() {
    return this.page.getByRole('heading', { name: /\+?\s*new branch/i });
  }

  get editBranchFormHeading() {
    return this.page.getByRole('heading', { name: /Edit Branch/i });
  }

  get createBranchButton() {
    return this.page.getByRole('button', { name: /CREATE BRANCH/i }).first();
  }

  get applyEditsButton() {
    return this.page.getByRole('button', { name: /apply edits|update branch/i }).first();
  }

  get branchNameInput() {
    return this.page.getByLabel(/^Branch Name/i).or(this.page.getByPlaceholder(/ex. Uptown Bonifacio/i)).first();
  }

  get addressLineInput() {
    return this.page.getByLabel(/aAddress Line/i).or(this.page.getByPlaceholder(/ex. Uptown Bonifacio, 9th Avenue, Taguig, Metro.../i)).first();
  }

  get cityInput() {
    return this.page.getByLabel(/^City/i).or(this.page.getByPlaceholder(/ex. Manila/i)).first();
  }

  get latitudeInput() {
    return this.page.getByLabel(/lN° Latitude*/i).or(this.page.getByPlaceholder(/14.566329007665326/i)).first();
  }

  get longitudeInput() {
    return this.page.getByLabel(/E° Longitude*/i).or(this.page.getByPlaceholder(/121.03563493548702/i)).first();
  }

  get openingDropdown() {
    return this.page.locator('label:has-text("Opening")').locator('xpath=following-sibling::div//button[1]');
  }

  get closingDropdown() {
    return this.page.locator('label:has-text("Closing")').locator('xpath=following-sibling::div//button[1]');
  }

  get regionDropdown() {
    return this.page
      .locator('label:has-text("Region")')
      .locator('xpath=following-sibling::div[1]')
      .locator('button')
      .first();
  }

  get subregionDropdown() {
    return this.page
      .locator('label:has-text("Sub Region*")')
      .locator('xpath=following-sibling::div[1]')
      .locator('button')
      .first();
  }

  async selectRegion(value) {
    const esc = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const exact = new RegExp(`^\\s*${esc}\\s*$`, 'i');
    await expect(this.regionDropdown).toBeVisible();
    await expect(this.regionDropdown).toBeEnabled();
    await this.regionDropdown.click();
  
    const option = this.page
      .locator('ul:visible li')
      .filter({ hasText: exact })
      .first();
  
    await expect(option).toBeVisible();
    await option.click();
  }

  async selectSubRegion(value) {
    const esc = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const exact = new RegExp(`^\\s*${esc}\\s*$`, 'i');
    await expect(this.subregionDropdown).toBeVisible();
    await expect(this.subregionDropdown).toBeEnabled();
    await this.subregionDropdown.click();
  
    const option = this.page
      .locator('ul:visible li')
      .filter({ hasText: exact })
      .first();
  
    await expect(option).toBeVisible();
    await option.click();
  }

  getToggleBySectionTitle(title) {
    return this.page
      .locator(`h5:has-text("${title}")`)
      .locator('xpath=following-sibling::div[1]//label[contains(@class,"switch")]');
  }
  
  getCheckboxBySectionTitle(title) {
    return this.page
      .locator(`h5:has-text("${title}")`)
      .locator('xpath=following-sibling::div[1]//input[@type="checkbox"]');
  }

  getCheckboxBySection(name) {
    return this.page
    .locator('div.flex.items-center', { hasText: name })
    .locator('input[type="checkbox"]');
  }

  getToggleBySection(name) {
    return this.page
      .locator('div.flex.items-center', { hasText: name })
      .locator('label.switch');
  }

  get handleDeliveryToggle() {
    return this.getToggleBySectionTitle('Handle Delivery');
  }
  
  get handleDeliveryCheckbox() {
    return this.getCheckboxBySectionTitle('Handle Delivery');
  }
  
  get cashOnDeliveryToggle() {
    return this.getToggleBySectionTitle('Cash On Delivery');
  }
  
  get cashOnDeliveryCheckbox() {
    return this.getCheckboxBySectionTitle('Cash On Delivery');
  }

  get mosaicToggle() {
    return this.getToggleBySection('Mosaic');
  }

  get mosaicCheckbox() {
    return this.getCheckboxBySection('Mosaic');
  }

  get xilnexToggle() {
    return this.getToggleBySection('Xilnex');
  }

  get xilnexCheckbox() {
    return this.getCheckboxBySection('Xilnex');
  }

  get branchImageInput() {
    return this.page.locator('input[type="file"]').first();
  }

  get locationNotesInput() {
    return this.page
      .getByLabel(/location notes|notes/i)
      .or(this.page.getByPlaceholder(/notes/i))
      .first();
  }

  get uploadedImagePreview() {
    return this.page
      .locator('img')
      .filter({ hasNotText: /logo|avatar/i })
      .first();
  }

  // get invalidFileValidation() {
  //   return this.page.getByText(/invalid file|png|jpg|jpeg|unsupported/i).first();
  // }

  get posMosaicLabel() {
    return this.page.getByText(/mosaic/i).first();
  }

  get mosaicBranchIdLabel() {
    return this.page.getByText(/Mosaic Branch ID*/i).first();
  }

  get mosaicBranchNameLabel() {
    return this.page.getByText(/Mosaic Branch Name/i).first();
  }

  get mosaicBranchIdInput() {
    return this.page.getByPlaceholder(/Enter Mosaic Branch ID/i).first();
  }

  get mosaicBranchNameInput() {
    return this.page.getByPlaceholder(/Enter Mosaic Branch Name/i).first();
  }

  get posXilnexLabel() {
    return this.page.getByText(/xilnex/i).first();
  }

  get xilnexBranchIdLabel() {
    return this.page.getByText(/Xilnex Branch ID*/i).first();
  }

  get xilnexBranchNameLabel() {
    return this.page.getByText(/Xilnex Branch Name/i).first();
  }

  get xilnexBranchIdInput() {
    return this.page.getByPlaceholder(/Enter Xilnex Branch ID/i).first();
  }

  get xilnexBranchNameInput() {
    return this.page.getByPlaceholder(/Enter Xilnex Branch Name/i).first();
  }

  toastSuccess() {
    return this.page.getByText(/success|saved|created|updated/i).first();
  }

  getValidationError(textPattern) {
    return this.page.getByText(textPattern);
  }

  // mandatoryLabel(labelText) {
  //   const esc = labelText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  //   return this.page
  //     .locator('label, p, span, div')
  //     .filter({ hasText: new RegExp(`^\\s*${esc}\\s*\\*`, 'i') })
  //     .first();
  // }

  // timeOption(timeText) {
  //   const esc = timeText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  //   const exact = new RegExp(`^\\s*${esc}\\s*$`, 'i');
  //   return this.page
  //     .getByRole('option', { name: exact })
  //     .or(this.page.getByRole('listitem', { name: exact }))
  //     .or(this.page.getByText(exact))
  //     .first();
  // }

  dropdownOption(text) {
    const esc = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const exact = new RegExp(`^\\s*${esc}\\s*$`, 'i');
    return this.page
      .getByRole('option', { name: exact })
      .or(this.page.getByRole('listitem', { name: exact }))
      .or(this.page.getByText(exact))
      .first();
  }

  branchRowByName(name) {
    const esc = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return this.page.getByRole('row', { name: new RegExp(esc, 'i') });
  }

  editDetailsInRow(name) {
    return this.branchRowByName(name).getByText(/edit/i).first();
  }

  async goto() {
    await super.goto(this.path);
    await this.expectOnBranchList();
  }

  async navigateViaMainNav() {
    await this.branchNavLink.click();
    await this.expectOnBranchList();
  }

  async expectOnBranchList() {
    await expect(this.branchListHeading).toBeVisible({ timeout: 20_000 });
    await expect(this.newBranchButton).toBeVisible();
  }

  async searchBranch(term) {
    await this.searchBranchInput.fill(term);
  }

  async openNewBranch() {
    await this.newBranchButton.click();
    await expect(this.newBranchFormHeading).toBeVisible({ timeout: 15_000 });
  }

  async selectDropdownOption(trigger, value) {
    const esc = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const exact = new RegExp(`^\\s*${esc}\\s*$`, 'i');
  
    await expect(trigger).toBeVisible();
    await expect(trigger).toBeEnabled();
    await trigger.click();
    const option = this.page
      .locator('ul:visible li')
      .filter({ hasText: exact })
      .first();
    await expect(option).toBeVisible();
    await option.click();
  }

  async selectOpeningTime(value) {
    await this.selectDropdownOption(this.openingDropdown, value);
  }

  async selectClosingTime(value) {
    await this.selectDropdownOption(this.closingDropdown, value);
  }

  async openClosingTimeDropdown() {
    await this.closingDropdown.click();
  }

  get menuTemplateDropdown() {
    return this.page
      .locator('label:has-text("Menu Template")')
      .locator('xpath=following-sibling::div[1]')
      .locator('button')
      .first();
  }

  async selectMenuTemplate(value) {
    const esc = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const exact = new RegExp(`^\\s*${esc}\\s*$`, 'i');
    await expect(this.menuTemplateDropdown).toBeVisible();
    await expect(this.menuTemplateDropdown).toBeEnabled();
    await this.menuTemplateDropdown.click();
    const option = this.page
      .locator('ul:visible li')
      .filter({ hasText: exact })
      .first();
    await expect(option).toBeVisible();
    await option.click();
  }

  get productOfferingDropdown() {
    return this.page
      .locator('label:has-text("Product Offerings*")')
      .locator('xpath=following-sibling::div[1]')
      .locator('button')
      .first();
  }

  async selectProductOffering(value) {
    await expect(this.productOfferingDropdown).toBeVisible();
    await this.productOfferingDropdown.click();
    const dropdown = this.page.locator('ul:visible').last();
    await expect(dropdown).toBeVisible();
    const checkbox = dropdown.getByRole('checkbox', { name: value, exact: true });
    await expect(checkbox).toBeVisible();
    await checkbox.check();
  }

  async selectOfficerInCharge(name) {
    const esc = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const exact = new RegExp(`^\\s*${esc}\\s*$`, 'i');
    await expect(this.officerInChargeDropdown).toBeVisible();
    await expect(this.officerInChargeDropdown).toBeEnabled();
    await this.officerInChargeDropdown.click();
    await expect(this.officerSearchInput).toBeVisible();
    await this.officerSearchInput.fill(name);
    const option = this.page
      .locator('div.search-select-option')
      .filter({ hasText: exact })
      .first();
    await expect(option).toBeVisible();
    await option.click();
  }

  get officerInChargeDropdown() {
    return this.page
      .locator('label:has-text("Officer-In-Charge")')
      .locator('xpath=following-sibling::div//button[1]');
  }
  
  get officerSearchInput() {
    return this.page.getByPlaceholder(/search staff by name or phone/i);
  }

  async openEditForBranch(name) {
    await this.editDetailsInRow(name).click();
    await expect(this.editBranchFormHeading).toBeVisible({ timeout: 15_000 });
  }
}

module.exports = { BranchPage };