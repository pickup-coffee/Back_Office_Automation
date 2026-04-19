// @ts-check

const GiftCardDesignDeleteConfirmLocators = {
  // delete confirmation modal
  deleteConfirmModal: `//div[contains(@class,'fixed') and .//*[contains(normalize-space(),'Delete this design?')]]`,
  deleteConfirmTitle: `//*[normalize-space()='Delete this design?']`,
  deleteConfirmSubtitle: `//*[contains(normalize-space(),'This action cannot be undone')]`,

  // buttons
  deleteConfirmCancelButton: `//div[contains(@class,'fixed') and .//*[contains(normalize-space(),'Delete this design?')]]//button[normalize-space()='Cancel']`,
  deleteConfirmYesDeleteButton: `//div[contains(@class,'fixed') and .//*[contains(normalize-space(),'Delete this design?')]]//button[normalize-space()='Yes, Delete']`,
  deleteConfirmCloseButton: `//div[contains(@class,'fixed') and .//*[contains(normalize-space(),'Delete this design?')]]//button//*[name()='svg']/ancestor::button`,
};

module.exports = { GiftCardDesignDeleteConfirmLocators };
