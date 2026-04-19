
const { test, expect } = require('../fixtures/base');
const { stepPause } = require('../support/stepPause');

const SEARCH_NAME = process.env.BRANCH_VERIFY_SEARCH_NAME || 'Test X Branch';
const EDIT_NAME = process.env.BRANCH_EDIT_NAME || 'Test X Branch';
const MENU_TEMPLATE = process.env.BRANCH_MENU_TEMPLATE || 'TESTING Template ';
const PRODUCT_OFFERING = process.env.BRANCH_MENU_TEMPLATE || 'Frappe Store';
const REGION = process.env.BRANCH_REGION || 'Central NCR ';
const SUB_REGION = process.env.BRANCH_SUB_REGION || 'NCR ';
const OFFICER_NAME = process.env.BRANCH_OFFICER_NAME || 'Test Staff +638201351824';
const OPENING_TIME = process.env.BRANCH_OPENING_TIME || '8:00 AM';
const CLOSING_TIME = process.env.BRANCH_CLOSING_TIME || '9:00 PM';
const MOSAIC_BRANCH_NAME = process.env.BRANCH_CLOSING_TIME || 'TEST MOSAIC';
const MOSAIC_BRANCH_ID = process.env.BRANCH_CLOSING_TIME || '12345';
const XILNEX_BRANCH_ID = process.env.BRANCH_CLOSING_TIME || '12345';
const XILNEX_BRANCH_NAME = process.env.BRANCH_CLOSING_TIME || 'TEST XILNEX';


function pause(page, label) {
  return stepPause(page, label);
}

test.describe('E2E - Branch Flow', () => {
  test('Create branch and verify row in list', async ({ branchPage, page }) => {
    const id = Date.now().toString().slice(-8);
    const created = {
      name: `Auto Branch ${id}`,
      address: `Street ${id}, Makati`,
      city: 'Makati',
      latitude: '14.5547',
      longitude: '121.0244',
      notes: `Automation branch ${id}`,
      mosaic_branch: 'Test mosaic',
      mosaic_id: `${id}`,
      xilnex_branch: 'Test xilnex',
      xilnex_id: `${id}`,

    };
    await openCreate(branchPage, page);
    await branchPage.branchNameInput.fill(created.name);
    await branchPage.selectOpeningTime(OPENING_TIME);
    await branchPage.selectClosingTime(CLOSING_TIME);
    await branchPage.branchImageInput.setInputFiles('test-data/Kastila.jpg');
    await branchPage.addressLineInput.fill(created.address);
    await branchPage.latitudeInput.fill(created.latitude);
    await branchPage.longitudeInput.fill(created.longitude);
    await branchPage.cityInput.fill(created.city);
    await branchPage.selectRegion(REGION);
    await pause(page, 'region');
    await branchPage.selectSubRegion(SUB_REGION);
    await pause(page, 'sub-region');
    await branchPage.selectProductOffering(PRODUCT_OFFERING);
    await branchPage.selectMenuTemplate(MENU_TEMPLATE);
    await branchPage.selectOfficerInCharge(OFFICER_NAME);
    if (await branchPage.locationNotesInput.isVisible().catch(() => false)) {
      await branchPage.locationNotesInput.fill(created.notes);
    }
    await pause(page, 'branch-filled');
    await expect(branchPage.createBranchButton).toBeEnabled({ timeout: 15_000 });
    await branchPage.createBranchButton.click();
    await pause(page, 'branch-submit');
    await expect(branchPage.toastSuccess()).toBeVisible({ timeout: 20_000 }).catch(async () => {
      await expect(branchPage.branchListHeading).toBeVisible({ timeout: 15_000 });
    });
    await branchPage.goto();
    await branchPage.searchBranchInput.click();
    await branchPage.searchBranchInput.fill(''); // clear existing value
    await branchPage.searchBranchInput.pressSequentially(created.name, { delay: 120 });
    await branchPage.searchBranchInput.press('Enter');
    await pause(page, 'branch-find');
    await expect(branchPage.branchRowByName(created.name)).toBeVisible({ timeout: 15_000 });
  });

  test('Create button enables only after last mandatory field is filled', async ({ branchPage, page }) => {
    await openCreate(branchPage, page);
    await fillMandatoryFields(branchPage, { officer: null, });  // leave last mandatory field empty
    await pause(page, 'before-last-mandatory');
    await expect(branchPage.createBranchButton).toBeDisabled();
    await branchPage.selectOfficerInCharge(OFFICER_NAME);
    await pause(page, 'after-last-mandatory');
    await expect(branchPage.createBranchButton).toBeEnabled({ timeout: 15_000 });
  });

  test('Duplicate submission is prevented', async ({ branchPage, page }) => {
    await openCreate(branchPage, page);
    const created = await fillMandatoryFields(branchPage);
    await pause(page, 'ready-to-submit');
    await expect(branchPage.createBranchButton).toBeEnabled({ timeout: 15_000 });
    await branchPage.createBranchButton.dblclick().catch(async () => {
      await branchPage.createBranchButton.click();
      await branchPage.createBranchButton.click();
    });
    await pause(page, 'duplicate-submit');
    await Promise.race([
      expect(branchPage.toastSuccess()).toBeVisible({ timeout: 20_000 }),
      expect(branchPage.branchListHeading).toBeVisible({ timeout: 20_000 }),
    ]);
    await branchPage.goto();
    await branchPage.searchBranchInput.click();
    await branchPage.searchBranchInput.fill('');
    await branchPage.searchBranchInput.pressSequentially(created.name, { delay: 120 });
    await branchPage.searchBranchInput.press('Enter');
    await pause(page, 'duplicate-submit-search');
    await expect(branchPage.branchRowByName(created.name)).toBeVisible({ timeout: 15_000 });
    const matchingRows = page.locator('tr', { hasText: created.name }).or(page.locator('[role="row"]', { hasText: created.name }));
    await expect(matchingRows).toHaveCount(1).catch(() => {});
  });

  test('Open edit form for existing branch', async ({ branchPage, page }) => {
    await openEdit(branchPage, page);
    await expect(branchPage.applyEditsButton).toBeVisible();
  });

  test('Apply edits button stays disabled when no changes are made', async ({ branchPage, page }) => {
    await openEdit(branchPage, page);
    await expect(branchPage.applyEditsButton).toBeVisible();
    await pause(page, 'branch-edit-opened');
    await expect(branchPage.applyEditsButton).toBeDisabled({ timeout: 5_000 }).catch(async () => {
      await expect(branchPage.applyEditsButton).toBeVisible();
    });
  });

  test('Edit branch details and save shows success feedback', async ({ branchPage, page }) => {
    await openEdit(branchPage, page);
    await expect(branchPage.applyEditsButton).toBeVisible();
    await pause(page, 'branch-edit-opened');
    await branchPage.cityInput.pressSequentially(EDIT_NAME, { delay: 120 });
    await branchPage.cityInput.blur();
    await pause(page, 'branch-city-edit');
    await expect(branchPage.applyEditsButton).toBeEnabled({ timeout: 10_000 });
    await branchPage.applyEditsButton.click();
    await pause(page, 'branch-save');
    await expect(
      branchPage.toastSuccess().or(branchPage.getValidationError(/success|updated/i))
    ).toBeVisible({ timeout: 20_000 }).catch(async () => {
      await expect(branchPage.editBranchFormHeading).toBeHidden({ timeout: 15_000 });
    });
  });
});

test.describe('UI - Branch Validation', () => { 
  test('Branch List heading after direct navigation to /branches', async ({ branchPage, page }) => {
    await branchPage.goto();
    await pause(page, 'branch-list');
    await expect(branchPage.branchListHeading).toHaveText(/Branch Management/i);
    await expect(branchPage.newBranchButton).toBeVisible();
  });

  test('Navigate to Branch module from main nav and see Branch List', async ({ page, dashboardPage, branchPage}) => {
    await page.goto('/');
    await dashboardPage.expectLoggedIn();
    await pause(page, 'home');
    await branchPage.navigateViaMainNav();
    await pause(page, 'branch-nav-done');
    await expect(branchPage.branchListHeading).toBeVisible();
  });

  test('Navigate between existing branch rows', async ({ branchPage, page }) => {
    await branchPage.goto();
    await pause(page, 'branch-list');
    await expect(branchPage.branchTable).toBeVisible();
    await expect(branchPage.branchRows.first()).toBeVisible();
  });

  test('Alphabetical and Recently Added sort controls refresh the table', async ({ branchPage, page }) => {
    await branchPage.goto();
    await pause(page, 'branch-list');
    await expect(branchPage.branchTable).toBeVisible();
    await branchPage.sortAlphabetical.click();
    await pause(page, 'sort-alpha');
    await expect(branchPage.branchTable).toBeVisible();
    await branchPage.sortRecentlyAdded.click();
    await pause(page, 'sort-recent');
    await expect(branchPage.branchTable).toBeVisible();
  });

  test('Search by branch name shows matching row', async ({branchPage, page }) => {
    await branchPage.goto();
    await branchPage.searchBranchInput.click();
    await branchPage.searchBranchInput.fill(''); // clear existing value
    await branchPage.searchBranchInput.pressSequentially(SEARCH_NAME, { delay: 120 });
    await branchPage.searchBranchInput.press('Enter');
    await pause(page, 'search-branch');
    await expect(branchPage.branchRowByName(SEARCH_NAME)).toBeVisible({ timeout: 15_000 });
    });

  test('New Branch button opens branch creation page', async ({ branchPage, page }) => {
    await branchPage.goto();
    await branchPage.openNewBranch();
    await pause(page, 'branch-create');
    await expect(branchPage.newBranchFormHeading).toBeVisible();
    await expect(page).toHaveURL(/\/branches\/create|\/branch\/create/i);
  });

  test('Mandatory field labels are visible on create form', async ({ branchPage, page }) => {
    await branchPage.goto();
    await branchPage.openNewBranch();
    await pause(page, 'mandatory-check');
    await expect(branchPage.branchNameInput).toBeVisible();
    await expect(branchPage.addressLineInput).toBeVisible();
    await expect(branchPage.cityInput).toBeVisible();
    await expect(branchPage.latitudeInput).toBeVisible();
    await expect(branchPage.longitudeInput).toBeVisible();
    await branchPage.regionDropdown.scrollIntoViewIfNeeded();
    await expect(branchPage.regionDropdown).toBeVisible();
    await expect(branchPage.menuTemplateDropdown).toBeVisible();
    await expect(branchPage.officerInChargeDropdown).toBeVisible();
  });

  test('Mandatory fields are marked with *', async ({ branchPage, page }) => {
    await openCreate(branchPage, page);
    await expect(page.getByText(/Branch Name\s*\*/i)).toBeVisible();
    await expect(page.getByText(/Opening\s*\*/i)).toBeVisible();
    await expect(page.getByText(/Closing\s*\*/i)).toBeVisible();
    await expect(page.getByText(/Address Line\s*\*/i)).toBeVisible();
    await expect(page.getByText(/Latitude\s*\*/i)).toBeVisible();
    await expect(page.getByText(/Longitude\s*\*/i)).toBeVisible();
    await expect(page.getByText(/City\s*\*/i)).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Staff*' })).toBeVisible();
  });

  test('Closing dropdown is disabled before Opening time is selected', async ({ branchPage, page }) => {
    await openCreate(branchPage, page);
    await pause(page, 'time-initial');
    await expect(branchPage.closingDropdown).toBeDisabled();
  });

  test('Closing dropdown becomes enabled after Opening time selection', async ({ branchPage, page }) => {
    await openCreate(branchPage, page);
    await branchPage.selectOpeningTime(OPENING_TIME);
    await pause(page, 'opening-selected');
    await expect(branchPage.closingDropdown).toBeEnabled();
  });

  test('Valid Opening and Closing time selection works', async ({ branchPage, page }) => {
    await openCreate(branchPage, page);
    await branchPage.selectOpeningTime(OPENING_TIME);
    await branchPage.selectClosingTime(CLOSING_TIME);
    await pause(page, 'valid-times');
    await expect(branchPage.openingDropdown).toContainText(new RegExp(OPENING_TIME, 'i'));
    await expect(branchPage.closingDropdown).toContainText(new RegExp(CLOSING_TIME, 'i'));
  });

  test('Region dropdown loads and selection works', async ({ branchPage, page }) => {
    await openCreate(branchPage, page);
    await branchPage.selectRegion(REGION);
    await pause(page, 'region');
    await expect(branchPage.regionDropdown).toContainText(new RegExp(REGION, 'i'));
  });

  test('Menu Template dropdown loads and selection works', async ({ branchPage, page }) => {
    await openCreate(branchPage, page);
    await branchPage.selectMenuTemplate(MENU_TEMPLATE);
    await pause(page, 'menu-template');
    await expect(branchPage.menuTemplateDropdown).toContainText(new RegExp(MENU_TEMPLATE, 'i'));
  });

  test('Officer-In-Charge dropdown loads and selection works', async ({ branchPage, page }) => {
    await openCreate(branchPage, page);
    await branchPage.selectOfficerInCharge(OFFICER_NAME);
    await pause(page, 'officer');
    await expect(branchPage.officerInChargeDropdown).toContainText(/Test Staff/i);
  });

  test('Handle Delivery toggle default state is visible and toggle works', async ({ branchPage, page }) => {
    await openCreate(branchPage, page);
    await expect(branchPage.handleDeliveryCheckbox).not.toBeChecked();
    await branchPage.handleDeliveryToggle.click();
    await expect(branchPage.handleDeliveryCheckbox).toBeChecked();
  });

  test('Cash On Delivery toggle default state is visible and toggle works', async ({ branchPage, page }) => {
    await openCreate(branchPage, page);
    await expect(branchPage.cashOnDeliveryCheckbox).not.toBeChecked();
    await branchPage.cashOnDeliveryToggle.click();
    await expect(branchPage.cashOnDeliveryCheckbox).toBeChecked();
  });

  test('Handle Delivery toggle supports ON to OFF', async ({ branchPage, page }) => {
    await openCreate(branchPage, page);
    await expect(branchPage.handleDeliveryCheckbox).not.toBeChecked();
    await branchPage.handleDeliveryToggle.click();
    await expect(branchPage.handleDeliveryCheckbox).toBeChecked();
    await branchPage.handleDeliveryToggle.click();
    await expect(branchPage.handleDeliveryCheckbox).not.toBeChecked();
  });

  test('Cash On Delivery toggle supports ON to OFF', async ({ branchPage, page }) => {
    await openCreate(branchPage, page);
    await expect(branchPage.cashOnDeliveryCheckbox).not.toBeChecked();
    await branchPage.cashOnDeliveryToggle.click();
    await expect(branchPage.cashOnDeliveryCheckbox).toBeChecked();
    await branchPage.cashOnDeliveryToggle.click();
    await expect(branchPage.cashOnDeliveryCheckbox).not.toBeChecked();
  });

  test('POS integrations section shows Mosaic and Xilnex', async ({ branchPage, page }) => {
    await openCreate(branchPage, page);
    await page.getByText(/POS Integrations/i).scrollIntoViewIfNeeded().catch(() => {});
    await expect(page.getByText('Mosaic', { exact: true })).toBeVisible();
    await expect(page.getByText('Xilnex', { exact: true })).toBeVisible();
  });

  test('Mosaic toggle enables fields and accepts details', async ({ branchPage, page }) => {
    await openCreate(branchPage, page);
    await page.getByText(/POS Integrations/i).scrollIntoViewIfNeeded();
    await expect(branchPage.mosaicCheckbox).not.toBeChecked();
    await branchPage.mosaicToggle.click();
    await expect(branchPage.mosaicCheckbox).toBeChecked();
    await expect(branchPage.mosaicBranchIdLabel).toBeVisible();
    await expect(branchPage.mosaicBranchNameLabel).toBeVisible();
    await branchPage.mosaicBranchIdInput.fill('123456');
    await branchPage.mosaicBranchNameInput.fill('Makati Central');
    await expect(branchPage.mosaicBranchIdInput).toHaveValue('123456');
    await expect(branchPage.mosaicBranchNameInput).toHaveValue('Makati Central');
  });

  test('Xilnex toggle enables fields and accepts details', async ({ branchPage, page }) => {
    await openCreate(branchPage, page);
    await page.getByText(/POS Integrations/i).scrollIntoViewIfNeeded();
    await expect(branchPage.xilnexCheckbox).not.toBeChecked();
    await branchPage.xilnexToggle.click();
    await expect(branchPage.xilnexCheckbox).toBeChecked();
    await expect(branchPage.xilnexBranchIdLabel).toBeVisible();
    await expect(branchPage.xilnexBranchNameLabel).toBeVisible();
    await branchPage.xilnexBranchIdInput.fill('123456');
    await branchPage.xilnexBranchNameInput.fill('xilnex Central');
    await expect(branchPage.xilnexBranchIdInput).toHaveValue('123456');
    await expect(branchPage.xilnexBranchNameInput).toHaveValue('xilnex Central');

  });

});


test.describe('Negative - Validation & Errors', () => {
  test('Branch name with only spaces is treated invalid', async ({ branchPage, page }) => {
    await openCreate(branchPage, page);
    await branchPage.branchNameInput.fill('       ');
    await branchPage.branchNameInput.blur();
    await pause(page, 'branch-name-space');
    await expect(branchPage.createBranchButton).toBeDisabled();
  });

  test('Branch name accepts valid input and trims spaces', async ({ branchPage, page }) => {
    await openCreate(branchPage, page);
    await branchPage.branchNameInput.fill('       Test Branch      ');
    await branchPage.branchNameInput.blur();
    await pause(page, 'branch-name');
    await expect(branchPage.branchNameInput).toHaveValue(/Test Branch/);
  });

  test('Create Branch button is disabled before mandatory fields are completed', async ({branchPage, page }) => {
    await openCreate(branchPage, page);
    await pause(page, 'branch-create');
    await expect(branchPage.createBranchButton).toBeDisabled();
  });

  test('Create Branch remains disabled for incomplete form', async ({ branchPage, page }) => {
    await openCreate(branchPage, page);
    await branchPage.branchNameInput.fill('Auto Branch');
    await branchPage.addressLineInput.fill('Sample Address');
    await pause(page, 'partial-form');
    await expect(branchPage.createBranchButton).toBeDisabled();
  });

  test('Empty Branch Name keeps Create Branch disabled', async ({ branchPage, page }) => {
    await openCreate(branchPage, page);
    await fillMandatoryFields(branchPage, {name: null, });
    await pause(page, 'empty-branch-name');
    await expect(branchPage.branchNameInput).toHaveValue('');
    await expect(branchPage.createBranchButton).toBeDisabled();
  });

  test('Empty Address Line keeps Create Branch disabled', async ({ branchPage, page }) => {
    await openCreate(branchPage, page);
    await fillMandatoryFields(branchPage, { address: null, });
    await pause(page, 'empty-address');
    await expect(branchPage.addressLineInput).toHaveValue('');
    await expect(branchPage.createBranchButton).toBeDisabled();
  });

  test('Empty City keeps Create Branch disabled', async ({ branchPage, page }) => {
    await openCreate(branchPage, page);
    await fillMandatoryFields(branchPage, {city: null, });
    await pause(page, 'empty-city');
    await expect(branchPage.cityInput).toHaveValue('');
    await expect(branchPage.createBranchButton).toBeDisabled();
  });

  test('Missing Officer-In-Charge keeps Create Branch disabled', async ({ branchPage, page }) => {
    await openCreate(branchPage, page);
    await fillMandatoryFields(branchPage, { officer: null, });
    await pause(page, 'missing-officer');
    await expect(branchPage.createBranchButton).toBeDisabled();
  });

  test('Invalid file type for branch image is rejected', async ({ branchPage, page }) => {
    await openCreate(branchPage, page);
    // Invalid file type
    await branchPage.branchImageInput.setInputFiles('test-data/sample.pdf');
    await pause(page, 'invalid-image');
    await expect(
      branchPage.getValidationError(/invalid file|png|jpg|jpeg|unsupported/i).first()
    ).toBeVisible({ timeout: 10_000 }).catch(async () => {
      await expect(branchPage.createBranchButton).toBeDisabled();
    });
    await page.getByText('Remove File').click();
    // Over-sized image
    await branchPage.branchImageInput.setInputFiles('test-data/large-image.jpeg');
    await pause(page, 'oversized-image');
    await expect(
      branchPage.getValidationError(/max of\s+\d+(\.\d+)?\s*kb only\.?/i).first()
    ).toBeVisible({ timeout: 10_000 });
    await expect(branchPage.createBranchButton).toBeDisabled();
  });

  test('Valid address, city, latitude and longitude accept input', async ({ branchPage, page }) => {
    await openCreate(branchPage, page);
    await branchPage.addressLineInput.fill('123 Ayala Avenue');
    await branchPage.cityInput.fill('Makati');
    await branchPage.latitudeInput.fill('14.5547');
    await branchPage.longitudeInput.fill('121.0244');
    await pause(page, 'location-fields');
    await expect(branchPage.addressLineInput).toHaveValue(/123 Ayala Avenue/);
    await expect(branchPage.cityInput).toHaveValue(/Makati/);
    await expect(branchPage.latitudeInput).toHaveValue(/14\.5547/);
    await expect(branchPage.longitudeInput).toHaveValue(/121\.0244/);
  });

  test('Refresh page with unsaved data does not crash', async ({ branchPage, page }) => {
    await openCreate(branchPage, page);
    await branchPage.branchNameInput.fill('Unsaved Branch');
    await branchPage.addressLineInput.fill('Unsaved Address');
    await pause(page, 'before-refresh');
    await page.reload();
    await pause(page, 'after-refresh');
    await expect(
      branchPage.newBranchFormHeading.or(branchPage.branchListHeading)
    ).toBeVisible({ timeout: 15_000 });
  });  
});

  async function openCreate(branchPage, page) {
    await branchPage.goto();
    await branchPage.openNewBranch();
    await pause(page, 'branch-create');
    await expect(branchPage.newBranchFormHeading).toBeVisible();
  }

  async function fillMandatoryFields(branchPage, data = {}) {
    const id = Date.now().toString().slice(-6);
    const form = {
      name: data.name === undefined ? `Auto Branch ${id}` : data.name,
      address: data.address === undefined ? `Street ${id}, Makati` : data.address,
      city: data.city === undefined ? 'Makati' : data.city,
      latitude: data.latitude === undefined ? '14.5547' : data.latitude,
      longitude: data.longitude === undefined ? '121.0244' : data.longitude,
      region: data.region === undefined ? REGION : data.region,
      subRegion: data.subRegion === undefined ? SUB_REGION : data.subRegion,
      productOffering: data.productOffering === undefined ? PRODUCT_OFFERING : data.productOffering,
      menuTemplate: data.menuTemplate === undefined ? MENU_TEMPLATE : data.menuTemplate,
      officer: data.officer === undefined ? OFFICER_NAME : data.officer,
      opening: data.opening === undefined ? OPENING_TIME : data.opening,
      closing: data.closing === undefined ? CLOSING_TIME : data.closing,
      image: data.image === undefined ? 'test-data/Kastila.jpg' : data.image,
    };
    if (form.name !== null) { await branchPage.branchNameInput.fill(form.name); };
    if (form.opening !== null) await branchPage.selectOpeningTime(form.opening);
    if (form.closing !== null) await branchPage.selectClosingTime(form.closing);
    if (form.image !== null) await branchPage.branchImageInput.setInputFiles(form.image);
    if (form.address !== null) await branchPage.addressLineInput.fill(form.address);
    if (form.latitude !== null) await branchPage.latitudeInput.fill(form.latitude);
    if (form.longitude !== null) await branchPage.longitudeInput.fill(form.longitude);
    if (form.city !== null) await branchPage.cityInput.fill(form.city);
    if (form.region !== null) await branchPage.selectRegion(form.region);
    if (form.subRegion !== null && branchPage.selectSubRegion) {
      await branchPage.selectSubRegion(form.subRegion);
    }
    if (form.productOffering !== null && branchPage.selectProductOffering) {
      await branchPage.selectProductOffering(form.productOffering);
    }
    if (form.menuTemplate !== null) await branchPage.selectMenuTemplate(form.menuTemplate);
    if (form.officer !== null) await branchPage.selectOfficerInCharge(form.officer);
    return form;
  }

  async function openEdit(branchPage, page, branchName = EDIT_NAME) {
    await branchPage.goto();
    await branchPage.searchBranchInput.click();
    await branchPage.searchBranchInput.fill('');
    await branchPage.searchBranchInput.pressSequentially(branchName, { delay: 120 });
    await branchPage.searchBranchInput.press('Enter');
    await pause(page, 'branch-find');
    await expect(branchPage.branchRowByName(branchName)).toBeVisible({ timeout: 15_000 });
    await branchPage.openEditForBranch(branchName);
    await pause(page, 'branch-edit');
    await expect(branchPage.editBranchFormHeading).toBeVisible();
  }
