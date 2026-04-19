// @ts-check
const { expect } = require('@playwright/test');
const { BasePage } = require('./BasePage');
const { PATHS } = require('../config/constants');
const { CreateGiftCard } = require('../tests/locators/createGiftCard.locators');
const { GiftCardDesignsLocators } = require('../tests/locators/giftCardDesigns.locators');
const { GiftCardDesignEditorLocators } = require('../tests/locators/giftCardDesignEditor.locators');
const { GiftCardDesignDeleteConfirmLocators } = require('../tests/locators/giftCardDesignDeleteConfirm.locators');

class GiftCardsPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);
    this.path = PATHS.GIFT_CARDS_SETTINGS;
  }

  get mobileInput() {
    return this.page.getByRole('textbox').first();
  }

  get otpInput() {
    return this.page
      .getByPlaceholder(/otp|123456|enter.*code/i)
      .or(this.page.locator('input[maxlength="6"]'))
      .or(this.page.locator('input[inputmode="numeric"]'))
      .first();
  }

  get loginButton() {
    return this.page.getByRole('button', { name: 'LOG IN' });
  }

  get submitOtpButton() {
    return this.page.getByRole('button', { name: 'SUBMIT' });
  }

  get walletEcosystemTrigger() {
    return this.page.getByText('WALLET ECOSYSTEM').first();
  }

  get giftCardsLink() {
    return this.page.getByRole('link', { name: 'GIFT CARDS' }).first();
  }

  get settingsTab() {
    return this.page.locator(GiftCardDesignsLocators.giftCardSettingsTab).first();
  }

  get designsTab() {
    return this.page.locator(GiftCardDesignsLocators.giftCardDesignsTab).first();
  }

  get reminderTab() {
    return this.page.locator(GiftCardDesignsLocators.reminderMessageTab).first();
  }

  get createGiftCardButton() {
    return this.page.getByRole('button', { name: /create gift card/i }).first();
  }

  get amountInput() {
    return this.page
      .getByLabel(/^amount/i)
      .or(this.page.getByPlaceholder('500'))
      .or(this.page.locator(CreateGiftCard.amountInput))
      .first();
  }

  get settingsNotesInput() {
    return this.page
      .getByLabel(/^notes/i)
      .or(this.page.locator('textarea'))
      .or(this.page.locator(CreateGiftCard.notesTextarea))
      .first();
  }

  get createConfirmButton() {
    return this.page.getByRole('button', { name: /^create$/i }).first();
  }

  get updateButton() {
    return this.page.getByRole('button', { name: /^update$/i }).first();
  }

  get editCardTitle() {
    return this.page.getByText(/^edit gift card$/i).first();
  }

  get editCardRecommendedSlider() {
    return this.page
      .getByText(/mark this gift card as recommend/i)
      .last()
      .locator('xpath=ancestor::div[1]')
      .locator('.slider')
      .first();
  }

  get editCardNotesInput() {
    return this.page
      .getByLabel(/^notes/i)
      .last()
      .or(this.page.locator('textarea').last());
  }

  get firstEditButton() {
    return this.page
      .locator(GiftCardDesignEditorLocators.firstEditButton)
      .or(this.page.locator(GiftCardDesignsLocators.editButtons))
      .or(this.page.getByRole('button', { name: /^edit$/i }))
      .first();
  }

  get firstDeleteButton() {
    return this.page
      .locator(GiftCardDesignsLocators.deleteButtons)
      .or(this.page.getByRole('button', { name: /^delete$/i }))
      .first();
  }

  get deleteYesButton() {
    return this.page
      .locator(GiftCardDesignEditorLocators.confirmDeleteButton)
      .or(this.page.getByRole('button', { name: /yes,\s*delete/i }))
      .first();
  }

  get cancelButton() {
    return this.page
      .locator(GiftCardDesignEditorLocators.cancelButton)
      .or(this.page.getByRole('button', { name: /^cancel$/i }))
      .first();
  }

  get closeButton() {
    return this.page
      .locator(GiftCardDesignEditorLocators.closeButton)
      .or(this.page.getByRole('button', { name: /^close$/i }))
      .first();
  }

  get deleteModal() {
    return this.page
      .locator(
        `//*[self::div or self::section][.//*[contains(normalize-space(),'Delete this gift card setting?')] and .//button[normalize-space()='Yes, Delete']]`
      )
      .last();
  }

  get editCardModal() {
    return this.page
      .locator(
        `//*[self::div or self::section][.//*[contains(normalize-space(),'Edit Gift Card')] and .//button[normalize-space()='Update']]`
      )
      .last();
  }

  get deleteModalCancelButton() {
    return this.deleteModal.getByRole('button', { name: /^cancel$/i }).first();
  }

  get deleteModalCloseButton() {
    return this.deleteModal.locator(`button:has(svg)`).first();
  }

  get editModalCancelButton() {
    return this.editCardModal.getByRole('button', { name: /^cancel$/i }).first();
  }

  get editModalCloseButton() {
    return this.editCardModal.locator(`button:has(svg)`).first();
  }

  get statusSlider() {
    return this.page.locator('.slider').first();
  }

  get createModalRecommendedSlider() {
    return this.page
      .getByText(/mark this gift card as recommend/i)
      .locator('xpath=ancestor::div[1]')
      .locator('.slider')
      .first();
  }

  get filterAllStatusButton() {
    return this.page
      .locator(`(//*[contains(normalize-space(),'FILTER BY')]/following::*[contains(normalize-space(),'All Status')])[1]`)
      .first();
  }

  get filterActiveButton() {
    return this.page.getByRole('button', { name: /active/i }).first();
  }

  get filterInactiveButton() {
    return this.page.getByRole('button', { name: /inactive/i }).first();
  }

  get sortRecentButton() {
    return this.page
      .getByRole('button', { name: /recent/i })
      .or(this.page.locator(`//*[translate(normalize-space(),'abcdefghijklmnopqrstuvwxyz','ABCDEFGHIJKLMNOPQRSTUVWXYZ')='RECENT']`))
      .first();
  }

  get sortAmountButton() {
    return this.page
      .getByRole('button', { name: /amount/i })
      .or(this.page.locator(`//*[translate(normalize-space(),'abcdefghijklmnopqrstuvwxyz','ABCDEFGHIJKLMNOPQRSTUVWXYZ')='AMOUNT']`))
      .first();
  }

  get searchInput() {
    return this.page.locator(GiftCardDesignsLocators.searchInput).first();
  }

  get addCardDesignButton() {
    return this.page.locator(GiftCardDesignsLocators.addCardDesignBtn).first();
  }

  get designNameInput() {
    return this.page
      .locator(`//input[@placeholder='e.g., Birthday, Holiday, Thank You']`)
      .or(this.page.getByPlaceholder(/e\.?g\.?,?\s*birthday,\s*holiday/i))
      .or(this.page.locator('input[placeholder*="birthday"]'))
      .or(this.page.locator('input[placeholder*="Holiday"]'))
      .first();
  }

  get designMessageInput() {
    return this.page
      .getByPlaceholder(/add message template/i)
      .or(this.page.getByLabel(/message/i))
      .or(this.page.locator('textarea').first());
  }

  get designImageInput() {
    return this.page.locator('input[type="file"]').first();
  }

  get reminderInput() {
    return this.page.getByRole('textbox', { name: /hey \{receiver name\}! i sent/i }).first();
  }

  get designEditorTitle() {
    return this.page
      .getByText(/add card design|edit card design/i)
      .or(this.page.getByRole('heading', { name: /add card design|edit card design/i }))
      .first();
  }

  get editDesignHeading() {
    return this.page.locator(`//h1[normalize-space()='Edit Gift Card Design'] | //h2[normalize-space()='Edit Gift Card Design']`).first();
  }

  get addDesignHeading() {
    return this.page.locator(`//h1[normalize-space()='Add Card Design'] | //h2[normalize-space()='Add Card Design']`).first();
  }

  get designEditorModal() {
    return this.editDesignHeading.locator('xpath=ancestor::div[contains(@class,"fixed")][1]').first();
  }

  get addDesignModal() {
    return this.addDesignHeading.locator('xpath=ancestor::div[contains(@class,"fixed")][1]').first();
  }

  get designEditorMessageInput() {
    return this.page.locator(`//textarea[@placeholder='Add message template']`).first();
  }

  get designEditorUpdateButton() {
    return this.page.getByRole('button', { name: /^update$/i }).first();
  }

  get designModalDeleteButton() {
    return this.page.locator(`//button[normalize-space()='Delete']`).first();
  }

  get designDeleteConfirmTitle() {
    return this.page.locator(GiftCardDesignDeleteConfirmLocators.deleteConfirmTitle).first();
  }

  get designDeleteConfirmCancelButton() {
    return this.page.locator(GiftCardDesignDeleteConfirmLocators.deleteConfirmCancelButton).first();
  }

  get designDeleteConfirmCloseButton() {
    return this.page.locator(GiftCardDesignDeleteConfirmLocators.deleteConfirmCloseButton).first();
  }

  get designDeleteConfirmYesDeleteButton() {
    return this.page.locator(GiftCardDesignDeleteConfirmLocators.deleteConfirmYesDeleteButton).first();
  }

  get createGiftCardModal() {
    return this.page.locator(CreateGiftCard.modal).first();
  }

  get createGiftCardTitle() {
    return this.page.getByText(/create gift card/i).first();
  }

  get createGiftCardSubtitle() {
    return this.page.getByText(/fill in the details to create a new gift card/i).first();
  }

  get createGiftCardRecommendedToggle() {
    return this.page.locator(CreateGiftCard.recommendedToggle).first();
  }

  get createGiftCardCancelButton() {
    return this.page.locator(CreateGiftCard.cancelBtn).first();
  }

  async loginWithOtp(mobile, otp) {
    await this.page.goto('/');
    await this.mobileInput.click();
    await this.mobileInput.fill(mobile);
    await this.loginButton.click();
    await expect(this.otpInput).toBeVisible({ timeout: 10_000 });
    await this.otpInput.fill(otp);
    await this.submitOtpButton.click();
    await expect(this.page.getByText(/log out/i)).toBeVisible({ timeout: 20_000 });
  }

  async openGiftCardsFromNav() {
    await this.page.goto('/');
    await this.waitForVisible(this.walletEcosystemTrigger);
    await this.walletEcosystemTrigger.hover();
    await this.safeClick(this.giftCardsLink, { noWaitAfter: true });

    const onGiftCardsUrl = await this.page
      .waitForURL(/gift-cards/i, { timeout: 6_000 })
      .then(() => true)
      .catch(() => false);

    if (!onGiftCardsUrl) {
      await this.page.goto(this.path, { waitUntil: 'domcontentloaded' });
    }

    const moduleDenied = this.page.getByText(/do not have permission to access this module/i).first();
    const loaded = await Promise.race([
      this.createGiftCardButton.waitFor({ state: 'visible', timeout: 20_000 }).then(() => 'ok'),
      this.settingsTab.waitFor({ state: 'visible', timeout: 20_000 }).then(() => 'ok'),
      moduleDenied.waitFor({ state: 'visible', timeout: 20_000 }).then(() => 'denied'),
    ]);

    if (loaded === 'denied') {
      throw new Error('Gift Cards module is not accessible for this user role.');
    }
  }

  async openCreateGiftCardModal() {
    await this.safeClick(this.createGiftCardButton);
    await expect(this.amountInput).toBeVisible({ timeout: 12_000 });
  }

  /**
   * Fill and submit Create Gift Card modal using systematic locators.
   * @param {{ amount: string|number, notes?: string, recommended?: boolean }} payload
   */
  async createGiftCard(payload) {
    await this.openCreateGiftCardModal();
    await this.replaceFieldWithDigits(this.amountInput, String(payload.amount));
    await expect(this.amountInput).toHaveValue(String(payload.amount));
    if (payload.recommended) {
      await this.createModalRecommendedSlider.click({ force: true });
    }
    if (payload.notes) {
      await this.settingsNotesInput.fill(payload.notes);
    }
    await expect(this.createConfirmButton).toBeEnabled({ timeout: 10_000 });
    await this.createConfirmButton.click();
  }

  /**
   * Update first gift card row through Edit modal.
   * @param {{ notes?: string, toggleRecommended?: boolean }} payload
   */
  async updateFirstGiftCard(payload = {}) {
    await this.safeClick(this.firstEditButton);
    await expect(this.editCardTitle).toBeVisible({ timeout: 10_000 });
    if (payload.toggleRecommended) {
      await this.editCardRecommendedSlider.click({ force: true });
    }
    if (payload.notes) {
      await this.editCardNotesInput.fill(payload.notes);
    }
    await expect(this.updateButton).toBeEnabled({ timeout: 10_000 });
    await this.updateButton.click();
  }

  async openDeleteModalForFirstGiftCard() {
    await this.safeClick(this.firstDeleteButton);
    await expect(this.deleteModal).toBeVisible({ timeout: 8_000 });
  }

  async openEditModalForFirstGiftCard() {
    await this.safeClick(this.firstEditButton);
    await expect(this.editCardModal).toBeVisible({ timeout: 8_000 });
  }

  async cancelDeleteForFirstGiftCard() {
    await this.openDeleteModalForFirstGiftCard();
    await expect(this.deleteModalCancelButton).toBeVisible({ timeout: 5_000 });
    await this.deleteModalCancelButton.click();
  }

  async closeDeleteForFirstGiftCard() {
    await this.openDeleteModalForFirstGiftCard();
    if (await this.deleteModalCloseButton.isVisible().catch(() => false)) {
      await this.deleteModalCloseButton.click();
    } else {
      await this.deleteModalCancelButton.click();
    }
  }

  async cancelEditForFirstGiftCard() {
    await this.openEditModalForFirstGiftCard();
    await expect(this.editModalCancelButton).toBeVisible({ timeout: 5_000 });
    await this.editModalCancelButton.click();
  }

  async closeEditForFirstGiftCard() {
    await this.openEditModalForFirstGiftCard();
    if (await this.editModalCloseButton.isVisible().catch(() => false)) {
      await this.editModalCloseButton.click();
    } else {
      await this.editModalCancelButton.click();
    }
  }

  /**
   * Attempt to open Add Card Design editor.
   * @returns {Promise<boolean>}
   */
  async tryOpenAddDesignEditor() {
    await this.safeClick(this.addCardDesignButton);
    const openedOnFirstClick = await this.isVisible(this.addDesignHeading, 3_000);
    if (!openedOnFirstClick) {
      await this.safeClick(this.addCardDesignButton);
    }
    const headingVisible = await this.isVisible(this.addDesignHeading, 8_000);
    const nameVisible = await this.isVisible(this.designNameInput, 3_000);
    return headingVisible || nameVisible;
  }

  /**
   * Attempt to open first design row editor.
   * @returns {Promise<boolean>}
   */
  async tryOpenFirstDesignEditor() {
    await this.safeClick(this.firstEditButton);
    const openedOnFirstClick = await this.isVisible(this.editDesignHeading, 3_000);
    if (!openedOnFirstClick) {
      await this.safeClick(this.firstEditButton);
    }
    await expect(this.editDesignHeading).toBeVisible({ timeout: 8_000 });
    await expect(this.designEditorMessageInput).toBeVisible({ timeout: 8_000 });
    return true;
  }

  /**
   * Update first design message in edit modal.
   * @param {string} text
   */
  async updateFirstDesignMessage(text) {
    await this.tryOpenFirstDesignEditor();
    await this.waitForVisible(this.designEditorMessageInput, 8_000);
    await this.designEditorMessageInput.click();
    await this.designEditorMessageInput.fill(text);
    await expect(this.designEditorUpdateButton).toBeEnabled({ timeout: 10_000 });
    await this.designEditorUpdateButton.click();
  }

  /**
   * Cover delete confirm prompt: cancel, close, then confirm.
   * @returns {Promise<void>}
   */
  async runDesignDeleteConfirmFlow() {
    await this.tryOpenFirstDesignEditor();
    await this.safeClick(this.designModalDeleteButton);
    await expect(this.designDeleteConfirmTitle).toBeVisible({ timeout: 8_000 });
    await this.safeClick(this.designDeleteConfirmCancelButton);

    await this.safeClick(this.designModalDeleteButton);
    await expect(this.designDeleteConfirmTitle).toBeVisible({ timeout: 8_000 });
    await this.safeClick(this.designDeleteConfirmCloseButton);

    await this.safeClick(this.designModalDeleteButton);
    await expect(this.designDeleteConfirmTitle).toBeVisible({ timeout: 8_000 });
    await this.safeClick(this.designDeleteConfirmYesDeleteButton);
  }
}

module.exports = { GiftCardsPage };
