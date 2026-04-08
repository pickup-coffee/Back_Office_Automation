// @ts-check
const { expect } = require('@playwright/test');
const { BasePage } = require('./BasePage');
const { PATHS } = require('../config/constants');

/**
 * Back Office Staff list, new/edit forms, disable/delete modals (staging).
 */
class StaffPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);
    this.path = PATHS.STAFF;
  }

  /** Main nav link to Staff */
  get staffNavLink() {
    return this.page.getByRole('link', { name: /^staff$/i }).first();
  }

  get staffListHeading() {
    return this.page.getByRole('heading', { name: /staff list/i });
  }

  /** Primary CTA on list (staging: link → `/staff/create`) */
  get newStaffMemberButton() {
    return this.page
      .getByRole('link', { name: /new staff member/i })
      .or(this.page.getByRole('button', { name: /new staff member/i }))
      .first();
  }

  get roleSidebar() {
    return this.page.locator('main aside').first();
  }

  get searchEmployeeInput() {
    return this.page.getByPlaceholder(/search employee/i);
  }

  get sortAlphabetical() {
    return this.page.getByRole('button', { name: /^alphabetical$/i });
  }

  get sortRecentlyAdded() {
    return this.page.getByRole('button', { name: /^recently added$/i });
  }

  /** Selected role title above the table */
  get selectedRoleHeading() {
    return this.page.locator('main').getByRole('heading', { level: 4 }).first();
  }

  get staffTable() {
    return this.page.locator('main table').first();
  }

  get backToStaffListLink() {
    return this.page.getByRole('link', { name: /back to staff list/i });
  }

  get newStaffFormHeading() {
    return this.page.getByRole('heading', { name: /\+?\s*new staff member/i });
  }

  get editStaffFormHeading() {
    return this.page.getByRole('heading', { name: /edit staff member/i });
  }

  /** Create form uses placeholders; edit may expose labels — prefer label when present */
  get firstNameInput() {
    return this.page.getByLabel(/^first name/i).or(this.page.getByPlaceholder(/maria antonette/i));
  }

  get lastNameInput() {
    return this.page.getByLabel(/^last name/i).or(this.page.getByPlaceholder(/^ex\.\s*cruz$/i));
  }

  get staffMobileTextbox() {
    return this.page
      .getByLabel(/^mobile number/i)
      .or(this.page.getByRole('textbox', { name: /ex\.\s*921/i }));
  }

  get employeeNumberInput() {
    return this.page.getByLabel(/^employee number/i).or(this.page.getByPlaceholder(/^ex\.\s*123456$/i));
  }

  get jobTitleInput() {
    return this.page.getByLabel(/^job title/i).or(this.page.getByPlaceholder(/barista service crew/i));
  }

  get emailInput() {
    return this.page.getByLabel(/^email address/i).or(this.page.getByPlaceholder(/pickupcoffee\.com/i));
  }

  get accountAccessTrigger() {
    return this.page
      .getByRole('combobox', { name: /account access level/i })
      .or(this.page.getByRole('button', { name: /^select$/i }))
      .or(this.page.getByLabel(/account access level/i))
      .first();
  }

  get addToStaffListButton() {
    return this.page.getByRole('button', { name: /add to staff list/i });
  }

  /** Edit screen primary save (copy varies: “Update Staff Details” / “Update Staff Member”) */
  get updateStaffButton() {
    return this.page.getByRole('button', { name: /update staff (details|member)/i });
  }

  /** Active staff: Disable… — disabled staff: Enable… */
  get staffAccountEnableDisableButton() {
    return this.page.getByRole('button', { name: /disable staff account|enable staff account/i });
  }

  get deleteConfirmHeading() {
    return this.page.getByText(/Are you sure you want to permanently delete/i);
  }

  /**
   * Delete confirmation: heading is `h1`; primary actions sit in a sibling block (avoid a `div`
   * that only wraps the text and not the buttons).
   */
  get deleteModalDeleteButton() {
    return this.page
      .getByRole('heading', { name: /Are you sure you want to permanently delete/i })
      .locator('xpath=ancestor::div[.//button][1]')
      .getByRole('button', { name: /^DELETE$/i })
      .first();
  }

  get deleteModalCancelButton() {
    return this.page
      .getByRole('heading', { name: /Are you sure you want to permanently delete/i })
      .locator('xpath=ancestor::div[.//button][1]')
      .getByRole('button', { name: /^cancel$/i })
      .first();
  }

  toastSuccess() {
    return this.page.getByText(/success|saved|created|updated/i).first();
  }

  getValidationError(textPattern) {
    return this.page.getByText(textPattern);
  }

  async goto() {
    await super.goto(this.path);
    await this.expectOnStaffList();
  }

  async navigateViaMainNav() {
    await this.staffNavLink.click();
    await this.expectOnStaffList();
  }

  async expectOnStaffList() {
    await expect(this.staffListHeading).toBeVisible({ timeout: 20_000 });
    await expect(this.newStaffMemberButton).toBeVisible();
  }

  async expectNewStaffForm() {
    await expect(this.newStaffFormHeading).toBeVisible({ timeout: 15_000 });
  }

  async expectEditStaffForm() {
    await expect(this.editStaffFormHeading).toBeVisible({ timeout: 15_000 });
  }

  async fillCompositeMobileDigits(field, mobile) {
    const digits = String(mobile).replace(/\D/g, '');
    await field.click();
    await field.click({ clickCount: 3 });
    await this.page.keyboard.press('Backspace');
    await field.pressSequentially(digits, { delay: 35 });
  }

  async selectRoleInSidebar(roleLabel) {
    const aside = this.roleSidebar;
    await aside.getByText(roleLabel, { exact: false }).first().click();
  }

  async searchEmployee(term) {
    await this.searchEmployeeInput.fill(term);
  }

  async openNewStaffMember() {
    await this.newStaffMemberButton.click();
    await this.expectNewStaffForm();
  }

  async goBackToStaffListFromForm() {
    await this.backToStaffListLink.click();
    await this.expectOnStaffList();
  }

  staffRowByName(displayName) {
    const esc = displayName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return this.page.getByRole('row', { name: new RegExp(esc, 'i') });
  }

  editDetailsInRow(displayName) {
    return this.staffRowByName(displayName).getByText(/edit details/i);
  }

  deleteInRow(displayName) {
    return this.staffRowByName(displayName).getByRole('button', { name: /delete/i });
  }

  async openEditForStaff(displayName) {
    await this.editDetailsInRow(displayName).click();
    await this.expectEditStaffForm();
  }

  /** Pick first option in account access list (custom dropdown). */
  async selectFirstAccountAccessOption() {
    const section = this.page.locator('main').filter({ hasText: /Account Access Level/i });
    await section.getByRole('button', { name: /select/i }).click();
    await section.getByRole('listitem').first().click({ timeout: 10_000 });
  }

  async confirmDeleteInModal() {
    const btn = this.deleteModalDeleteButton;
    await expect(btn).toBeVisible({ timeout: 10_000 });
    await btn.click();
  }

  async cancelDeleteInModal() {
    await this.deleteModalCancelButton.click();
  }

}

module.exports = { StaffPage };
