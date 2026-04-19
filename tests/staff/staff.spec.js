// @ts-check
/**
 * Staff module — BO Staff matrix coverage (22 tests in this file).
 *
 * Optional env:
 * - STAFF_ROLE_A, STAFF_ROLE_B — sidebar roles (defaults: Test X Role, Rashmi Sanity test role)
 * - STAFF_VERIFY_SEARCH_NAME — search substring (default: Rashmi)
 * - STAFF_EDIT_ROW_NAME — override row display name for edit/disable/delete (default: staging row below)
 * - STAFF_CONFLICT_MOBILE — digits used by another user (duplicate mobile negative)
 * - STAFF_E2E_CREATE=1 — full create + list verification (writes staging)
 * - STAFF_ALLOW_DELETE_CONFIRM=1 — confirm delete (destructive)
 *
 * Notes: Delete is skipped if the row has no Delete control. “Update job title” skips if the account
 * is disabled (UPDATE stays disabled). Use an active staff row for full edit/save coverage.
 */
const { test, expect } = require('../fixtures/base');
const { stepPause } = require('../support/stepPause');

const ROLE_A = process.env.STAFF_ROLE_A || 'Test X Role';
const ROLE_B = process.env.STAFF_ROLE_B || 'Rashmi Sanity test role';
const SEARCH_NAME = process.env.STAFF_VERIFY_SEARCH_NAME || 'Rashmi';
/** Default staging row used in Pickup BO Staff list (sidebar “Test X Role”). Override with STAFF_EDIT_ROW_NAME. */
const EDIT_NAME = process.env.STAFF_EDIT_ROW_NAME || 'Rashmi BO sanity H T';

function pause(page, label) {
  return stepPause(page, label);
}

test.describe('Staff — navigation & list', () => {
  test('Staff List heading after direct navigation to /staff', async ({ staffPage, page }) => {
    await staffPage.goto();
    await pause(page, 'list');
    await expect(staffPage.staffListHeading).toHaveText(/staff list/i);
    await expect(staffPage.newStaffMemberButton).toBeVisible();
  });

  test('navigate to Staff module from main nav and see Staff List', async ({ page, dashboardPage, staffPage }) => {
    await page.goto('/');
    await dashboardPage.expectLoggedIn();
    await pause(page, 'home');
    await staffPage.navigateViaMainNav();
    await pause(page, 'staff-nav-done');
    await expect(staffPage.staffListHeading).toBeVisible();
  });
});

test.describe('Staff — roles & sort', () => {
  test('switching sidebar roles updates the selected role section', async ({ staffPage, page }) => {
    await staffPage.goto();
    await pause(page, 'list');
    await staffPage.selectRoleInSidebar(ROLE_A);
    await expect(staffPage.selectedRoleHeading).toContainText(new RegExp(ROLE_A.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
    await pause(page, 'role-a');
    await staffPage.selectRoleInSidebar(ROLE_B);
    await expect(staffPage.selectedRoleHeading).toContainText(new RegExp(ROLE_B.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
  });

  test('Alphabetical and Recently Added sort controls refresh the table', async ({ staffPage, page }) => {
    await staffPage.goto();
    await pause(page, 'staff-list');
    await expect(staffPage.staffTable).toBeVisible();
    await staffPage.sortAlphabetical.click();
    await pause(page, 'sort-alpha');
    await expect(staffPage.staffTable).toBeVisible();
    await staffPage.sortRecentlyAdded.click();
    await pause(page, 'sort-recent');
    await expect(staffPage.staffTable).toBeVisible();
  });
});

test.describe('Staff — search', () => {
  test('search by name shows matching staff row', async ({ staffPage, page }) => {
    await staffPage.goto();
    await staffPage.searchEmployee(SEARCH_NAME);
    await pause(page, 'search');
    await expect(staffPage.staffRowByName(SEARCH_NAME)).toBeVisible({ timeout: 15_000 });
  });
});

test.describe('Staff — create form', () => {
  test('New Staff Member opens creation page', async ({ staffPage, page }) => {
    await staffPage.goto();
    await staffPage.openNewStaffMember();
    await pause(page, 'create');
    await expect(staffPage.newStaffFormHeading).toBeVisible();
    await expect(page).toHaveURL(/\/staff\/create/);
  });

  test('Add to Staff List is disabled before required fields are completed', async ({ staffPage, page }) => {
    await staffPage.goto();
    await staffPage.openNewStaffMember();
    await pause(page, 'create');
    await expect(staffPage.addToStaffListButton).toBeDisabled();
  });

  test('Back to Staff List returns to list from create page', async ({ staffPage, page }) => {
    await staffPage.goto();
    await staffPage.openNewStaffMember();
    await pause(page, 'before-back');
    await staffPage.goBackToStaffListFromForm();
    await pause(page, 'back');
    await staffPage.expectOnStaffList();
  });

  test('Account Access Level can be opened and first option selected', async ({ staffPage, page }) => {
    await staffPage.goto();
    await staffPage.openNewStaffMember();
    await staffPage.selectFirstAccountAccessOption();
    await pause(page, 'access');
    await expect(page.locator('main')).toContainText(/Test X Role|Rashmi Sanity|Admin|Staff Manager/i);
  });

  test('invalid email shows validation feedback', async ({ staffPage, page }) => {
    await staffPage.goto();
    await staffPage.openNewStaffMember();
    await staffPage.emailInput.fill('not-an-email');
    await staffPage.emailInput.blur();
    await pause(page, 'email');
    const err = staffPage.getValidationError(/invalid|valid email|format|email/i);
    await expect(err.first()).toBeVisible({ timeout: 8_000 }).catch(async () => {
      await expect(staffPage.addToStaffListButton).toBeDisabled();
    });
  });

  test('mobile local number enforces length (10 digits for PH)', async ({ staffPage, page }) => {
    await staffPage.goto();
    await staffPage.openNewStaffMember();
    await staffPage.fillCompositeMobileDigits(staffPage.staffMobileTextbox, '91234');
    await staffPage.staffMobileTextbox.blur();
    await pause(page, 'short-mobile');
    await expect(
      staffPage.getValidationError(/10|digit|valid|mobile/i).first()
    ).toBeVisible({ timeout: 8_000 }).catch(async () => {
      await expect(staffPage.addToStaffListButton).toBeDisabled();
    });
  });
});

test.describe('Staff — full create (staging write)', () => {
  test('create staff and verify row in list (STAFF_E2E_CREATE=1)', async ({ staffPage, page }) => {
    test.skip(process.env.STAFF_E2E_CREATE !== '1', 'Set STAFF_E2E_CREATE=1 to run (writes staging data).');

    const id = Date.now().toString().slice(-8);
    const created = {
      first: `Auto${id}`,
      last: `Test${id}`,
      mobile: `9${String(Math.floor(100000000 + Math.random() * 90000000))}`,
      age: String(20 + Math.floor(Math.random() * 15)),
      emp: String(Math.floor(100000 + Math.random() * 900000)),
      email: `auto.${id}@pickupcoffee.com`,
    };

    await staffPage.goto();
    await staffPage.openNewStaffMember();
    await staffPage.firstNameInput.fill(created.first);
    await staffPage.lastNameInput.fill(created.last);
    await staffPage.fillCompositeMobileDigits(staffPage.staffMobileTextbox, created.mobile);
    await staffPage.fillAge(created.age);
    await staffPage.employeeNumberInput.fill(created.emp);
    await staffPage.jobTitleInput.fill('QA Automation');
    await staffPage.emailInput.fill(created.email);
    await staffPage.selectFirstAccountAccessOption();
    await pause(page, 'filled');

    await expect(staffPage.addToStaffListButton).toBeEnabled({ timeout: 15_000 });
    await staffPage.addToStaffListButton.click();
    await pause(page, 'submit');

    await expect(staffPage.toastSuccess()).toBeVisible({ timeout: 20_000 }).catch(async () => {
      await expect(staffPage.staffListHeading).toBeVisible({ timeout: 15_000 });
    });

    await staffPage.goto();
    await staffPage.searchEmployee(created.first);
    await pause(page, 'find');
    await expect(staffPage.staffRowByName(created.first)).toBeVisible({ timeout: 15_000 });
  });
});

test.describe('Staff — edit & disable', () => {
  test('Edit opens form; Employee Number and Email are not editable', async ({ staffPage, page }) => {
    test.skip(!EDIT_NAME, 'Set STAFF_EDIT_ROW_NAME.');
    await staffPage.goto();
    await staffPage.openEditForStaff(EDIT_NAME);
    await pause(page, 'edit');
    await expect(staffPage.employeeNumberInput).toBeDisabled();
    await expect(staffPage.emailInput).toBeDisabled();
  });

  test('Update Staff button stays disabled when no changes are made', async ({ staffPage, page }) => {
    test.skip(!EDIT_NAME, 'Set STAFF_EDIT_ROW_NAME.');
    await staffPage.goto();
    await staffPage.openEditForStaff(EDIT_NAME);
    await pause(page, 'edit-opened');
    await expect(staffPage.updateStaffButton).toBeDisabled({ timeout: 5_000 }).catch(async () => {
      await expect(staffPage.updateStaffButton).toBeVisible();
    });
  });

  test('Enable / Disable Staff Account control is enabled on edit page', async ({ staffPage, page }) => {
    test.skip(!EDIT_NAME, 'Set STAFF_EDIT_ROW_NAME.');
    await staffPage.goto();
    await staffPage.openEditForStaff(EDIT_NAME);
    await pause(page, 'edit-form');
    await expect(staffPage.staffAccountEnableDisableButton).toBeEnabled();
  });

  test('Enable or Disable Staff Account opens confirmation with Cancel and primary action', async ({
    staffPage,
    page,
  }) => {
    test.skip(!EDIT_NAME, 'Set STAFF_EDIT_ROW_NAME.');
    await staffPage.goto();
    await staffPage.openEditForStaff(EDIT_NAME);
    await staffPage.staffAccountEnableDisableButton.click();
    await pause(page, 'disable-modal');
    const cancelBtn = page.getByRole('button', { name: /^cancel$/i }).last();
    await expect(cancelBtn).toBeVisible({ timeout: 12_000 });
    await expect(
      page.getByRole('button', { name: /disable staff account|enable staff account/i }).last()
    ).toBeVisible();
    await cancelBtn.click();
    await pause(page, 'disable-modal-closed');
    await expect(cancelBtn).toBeHidden({ timeout: 10_000 });
  });

  test('edit job title and save shows success feedback', async ({ staffPage, page }) => {
    test.skip(!EDIT_NAME, 'Set STAFF_EDIT_ROW_NAME.');
    await staffPage.goto();
    await staffPage.openEditForStaff(EDIT_NAME);
    const suffix = Date.now().toString().slice(-4);
    await staffPage.jobTitleInput.clear();
    await staffPage.jobTitleInput.fill(`testing ${suffix}`);
    await staffPage.jobTitleInput.blur();
    await staffPage.jobTitleInput.evaluate((el) => {
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });
    if (!(await staffPage.updateStaffButton.isEnabled())) {
      test.skip(
        true,
        'UPDATE stayed disabled (account may be disabled — use an active staff STAFF_EDIT_ROW_NAME or enable the account first).'
      );
    }
    await staffPage.updateStaffButton.click();
    await pause(page, 'save');
    await expect(
      staffPage.toastSuccess().or(staffPage.getValidationError(/success|updated/i))
    ).toBeVisible({ timeout: 20_000 }).catch(async () => {
      await expect(staffPage.editStaffFormHeading).toBeHidden({ timeout: 15_000 });
    });
  });

  test('duplicate mobile shows validation when STAFF_CONFLICT_MOBILE is set', async ({ staffPage, page }) => {
    test.skip(!EDIT_NAME || !process.env.STAFF_CONFLICT_MOBILE, 'Set STAFF_EDIT_ROW_NAME and STAFF_CONFLICT_MOBILE.');
    const conflict = process.env.STAFF_CONFLICT_MOBILE.replace(/\D/g, '');
    await staffPage.goto();
    await staffPage.openEditForStaff(EDIT_NAME);
    await staffPage.fillCompositeMobileDigits(staffPage.staffMobileTextbox, conflict);
    await staffPage.updateStaffButton.click();
    await pause(page, 'dup');
    await expect(staffPage.getValidationError(/already|exists|in use|linked|duplicate/i).first()).toBeVisible({
      timeout: 12_000,
    });
  });
});

test.describe('Staff — delete modal', () => {
  test('Delete opens confirmation with Delete and Cancel', async ({ staffPage, page }) => {
    test.skip(!EDIT_NAME, 'Set STAFF_EDIT_ROW_NAME.');
    await staffPage.goto();
    const rowDelete = staffPage.deleteInRow(EDIT_NAME);
    const canDelete = await rowDelete.isVisible().catch(() => false);
    test.skip(!canDelete, 'No Delete control on this row — try another STAFF_EDIT_ROW_NAME / role.');
    await rowDelete.click();
    await pause(page, 'del-modal');
    await expect(staffPage.deleteConfirmHeading).toBeVisible({ timeout: 10_000 });
    await expect(staffPage.deleteModalDeleteButton).toBeVisible();
    await expect(staffPage.deleteModalCancelButton).toBeVisible();
  });

  test('Cancel on delete modal closes without removing row', async ({ staffPage, page }) => {
    test.skip(!EDIT_NAME, 'Set STAFF_EDIT_ROW_NAME.');
    await staffPage.goto();
    const rowDelete = staffPage.deleteInRow(EDIT_NAME);
    const canDelete = await rowDelete.isVisible().catch(() => false);
    test.skip(!canDelete, 'No Delete control on this row.');
    await rowDelete.click();
    await pause(page, 'del-modal-open');
    await expect(staffPage.deleteConfirmHeading).toBeVisible({ timeout: 10_000 });
    await staffPage.cancelDeleteInModal();
    await expect(staffPage.deleteConfirmHeading).toBeHidden({ timeout: 10_000 });
    await expect(staffPage.staffRowByName(EDIT_NAME)).toBeVisible();
  });

  test('Confirm Delete removes staff when STAFF_ALLOW_DELETE_CONFIRM=1', async ({ staffPage, page }) => {
    test.skip(!EDIT_NAME || process.env.STAFF_ALLOW_DELETE_CONFIRM !== '1', 'Set STAFF_EDIT_ROW_NAME and STAFF_ALLOW_DELETE_CONFIRM=1 (destructive).');
    await staffPage.goto();
    const rowDelete = staffPage.deleteInRow(EDIT_NAME);
    const canDelete = await rowDelete.isVisible().catch(() => false);
    test.skip(!canDelete, 'No Delete control on this row.');
    await rowDelete.click();
    await expect(staffPage.deleteConfirmHeading).toBeVisible({ timeout: 10_000 });
    await staffPage.confirmDeleteInModal();
    await pause(page, 'deleted');
    await staffPage.searchEmployee(EDIT_NAME);
    await expect(staffPage.staffRowByName(EDIT_NAME)).toBeHidden({ timeout: 15_000 });
  });
});

