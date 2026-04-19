// @ts-check

const GiftCardDesignsLocators = {
  // ===== LEFT MENU =====
  giftCardSettingsTab: `//div[normalize-space()='GIFT CARD SETTINGS']`,
  giftCardDesignsTab: `//div[normalize-space()='GIFT CARD DESIGNS']`,
  reminderMessageTab: `//div[normalize-space()='REMINDER MESSAGE']`,

  // ===== PAGE / SECTION =====
  pageTitle: `//*[normalize-space()='GIFT CARD DESIGNS']`,
  addCardDesignBtn: `//button[normalize-space()='Add Card Design']`,

  // ===== FILTERS / SEARCH =====
  activeTab: `//button[normalize-space()='ACTIVE']`,
  inactiveTab: `//button[normalize-space()='INACTIVE']`,
  recentBtn: `//button[normalize-space()='RECENT']`,
  searchInput: `//input[@placeholder='Search']`,

  // ===== GENERIC DESIGN CARD / LIST =====
  designCards: `//div[contains(@class,'flex') and .//button[normalize-space()='EDIT']]`,
  editButtons: `//button[normalize-space()='EDIT']`,
  deleteButtons: `//button[normalize-space()='Delete' or normalize-space()='DELETE']`,
  statusToggles: `//*[contains(@class,'slider')]`,

  // ===== DYNAMIC BY DESIGN NAME =====
  designByName: (name) => `//*[normalize-space()='${name}']`,

  editByName: (name) =>
    `//*[normalize-space()='${name}']/ancestor::*[self::div or self::li][1]//button[normalize-space()='EDIT']`,

  deleteByName: (name) =>
    `//*[normalize-space()='${name}']/ancestor::*[self::div or self::li][1]//button[normalize-space()='Delete' or normalize-space()='DELETE']`,

  toggleByName: (name) =>
    `//*[normalize-space()='${name}']/ancestor::*[self::div or self::li][1]//*[contains(@class,'slider')]`,

  // ===== EMPTY / SEARCH STATES =====
  noResults: `//*[contains(normalize-space(),'No Results Found')]`,
  emptyState: `//*[normalize-space()='Page is Empty']`,

  // ===== CREATE / EDIT MODAL =====
  modalTitleAdd: `//*[normalize-space()='Add Card Design']`,
  modalTitleEdit: `//*[contains(normalize-space(),'Edit')]`,
  designNameInput: `//input[@placeholder='e.g., Birthday, Holiday,']`,
  messageTemplateInput: `//textarea | //input[@placeholder='Add message template'] | //div[@contenteditable='true']`,
  uploadInput: `//input[@type='file']`,
  modalToggle: `//div[contains(@class,'slider')]`,
  createBtn: `//button[normalize-space()='Create']`,
  updateBtn: `//button[normalize-space()='Update']`,
  cancelBtn: `//button[normalize-space()='Cancel']`,
  closeBtn: `//button[normalize-space()='Close']`,
  deleteBtnInModal: `//button[normalize-space()='Delete']`,
  confirmDeleteBtn: `//button[normalize-space()='Yes, Delete']`,

  // ===== TOASTS / FEEDBACK =====
  designUpdatedToast: `//*[contains(normalize-space(),'Gift card design updated')]`,
  designDeletedToast: `//*[contains(normalize-space(),'Gift card design deleted')]`,
  inactiveDeleteValidation: `//*[contains(normalize-space(),'Only inactive designs can be')]`,
};

module.exports = { GiftCardDesignsLocators };
