// @ts-check

const GiftCardDesignEditorLocators = {
  // list page
  firstEditButton: `(//button[.//span[normalize-space()='EDIT']])[1]`,
  editButtonByName: (name) =>
    `//*[normalize-space()='${name}']/ancestor::div[@data-draggable='true'][1]//button[.//span[normalize-space()='EDIT']]`,

  // edit drawer / modal
  editorModal: `//div[contains(@class,'fixed') and contains(@class,'inset-0')]`,
  notesTextarea: `//textarea[@placeholder='Add message template']`,
  notesCounter: `//p[contains(normalize-space(),'/120')]`,

  updateButton: `//button[normalize-space()='Update']`,
  deleteButton: `//button[normalize-space()='Delete']`,
  confirmDeleteButton: `//button[normalize-space()='Yes, Delete']`,
  cancelButton: `//button[normalize-space()='Cancel']`,
  closeButton: `//button[normalize-space()='Close'] | //button//*[name()='svg']`,
};

module.exports = { GiftCardDesignEditorLocators };
