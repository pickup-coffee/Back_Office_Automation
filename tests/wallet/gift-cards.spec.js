// @ts-check
const { test, expect } = require('../fixtures/base');

const MOBILE = process.env.BO_MOBILE || '9123456789';
const OTP = process.env.BO_OTP || '123456';

async function ensureLoggedInOnce(page, loginPage) {
  await page.goto('/');
  const logout = page.getByText(/log out/i).first();
  if (await logout.isVisible().catch(() => false)) {
    return;
  }

  await loginPage.goto();
  await loginPage.loginWithOtp(MOBILE, OTP);
  await expect(logout).toBeVisible({ timeout: 30_000 });
}

test.describe('Gift Card Settings', () => {
  test.beforeEach(async ({ giftCardsPage, page, loginPage }) => {
    await ensureLoggedInOnce(page, loginPage);
    await giftCardsPage.openGiftCardsFromNav();
    await giftCardsPage.settingsTab.click();
  });

  test('create gift card setting', async ({ giftCardsPage }) => {
    await giftCardsPage.createGiftCard({
      amount: '10000',
      notes: 'test',
    });
  });

  test('update gift card setting', async ({ giftCardsPage }) => {
    await giftCardsPage.updateFirstGiftCard({
      notes: 'test test again',
    });
  });

  test('delete modal cancel and close', async ({ giftCardsPage }) => {
    await giftCardsPage.cancelDeleteForFirstGiftCard();
    await giftCardsPage.closeDeleteForFirstGiftCard();
  });

  test('edit modal cancel and close', async ({ giftCardsPage }) => {
    await giftCardsPage.cancelEditForFirstGiftCard();
    await giftCardsPage.closeEditForFirstGiftCard();
  });

  test('delete gift card setting', async ({ giftCardsPage }) => {
    await giftCardsPage.firstDeleteButton.click();
    await giftCardsPage.deleteYesButton.click();
  });

  test('sort and filter gift card settings', async ({ giftCardsPage }) => {
    await giftCardsPage.sortRecentButton.click();
    await giftCardsPage.sortAmountButton.click();
    await giftCardsPage.filterAllStatusButton.click();
    await giftCardsPage.filterActiveButton.click();
    await giftCardsPage.filterActiveButton.click();
    await giftCardsPage.filterInactiveButton.click();
    await giftCardsPage.filterInactiveButton.click();
    await giftCardsPage.filterAllStatusButton.click();
  });

  test('toggle gift card status', async ({ giftCardsPage }) => {
    await giftCardsPage.statusSlider.click();
    await giftCardsPage.statusSlider.click();
  });
});

test.describe('Gift Card Designs', () => {
  test.beforeEach(async ({ giftCardsPage, page, loginPage }) => {
    await ensureLoggedInOnce(page, loginPage);
    await giftCardsPage.openGiftCardsFromNav();
    await giftCardsPage.designsTab.click();
    await expect(giftCardsPage.designsTab).toBeVisible();
  });

  test('toggle gift card design status', async ({ giftCardsPage }) => {
    await giftCardsPage.statusSlider.click();
    await giftCardsPage.statusSlider.click();
  });

  test('edit gift card design', async ({ giftCardsPage }) => {
    await giftCardsPage.updateFirstDesignMessage(`auto update ${Date.now()}`);
  });

  test('delete design flow', async ({ giftCardsPage }) => {
    await giftCardsPage.runDesignDeleteConfirmFlow();
  });

  test('search design valid and invalid', async ({ giftCardsPage }) => {
    await giftCardsPage.searchInput.fill('christa');
    await giftCardsPage.searchInput.fill('chris');
  });

  test('create gift card design', async ({ giftCardsPage }) => {
    const opened = await giftCardsPage.tryOpenAddDesignEditor();
    test.skip(!opened, 'Add design modal did not open for this role/environment.');
    await giftCardsPage.designNameInput.fill('chetan');
    const imagePath = process.env.GIFTCARD_DESIGN_IMAGE_PATH;
    test.skip(!imagePath, 'Set GIFTCARD_DESIGN_IMAGE_PATH for design upload.');
    await giftCardsPage.designImageInput.setInputFiles(imagePath);
    await giftCardsPage.designMessageInput.fill('test');
    await giftCardsPage.createConfirmButton.click();
  });
});

test.describe('Gift Card Reminder Message', () => {
  test.beforeEach(async ({ giftCardsPage, page, loginPage }) => {
    await ensureLoggedInOnce(page, loginPage);
    await giftCardsPage.openGiftCardsFromNav();
  });

  test('open reminder message section', async ({ giftCardsPage }) => {
    await giftCardsPage.reminderTab.click();
    await giftCardsPage.reminderInput.click();
  });
});
