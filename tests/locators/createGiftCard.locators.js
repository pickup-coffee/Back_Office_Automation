// @ts-check

const CreateGiftCard = {
  // ===== MODAL =====
  modal: `//div[contains(@class,'fixed') and .//h1[contains(.,'Create Gift Card')]]`,
  title: `//h1[normalize-space()='Create Gift Card']`,
  closeBtn: `//button//*[name()='svg'] | //button[contains(@class,'close')]`,

  // ===== DESCRIPTION =====
  subtitle: `//p[contains(.,'Fill in the details')]`,

  // ===== AMOUNT =====
  amountLabel: `//label[contains(.,'Amount')]`,
  amountInput: `//input[@type='number' and @placeholder='500'] | //input[@placeholder='500']`,
  amountHelperText: `//p[contains(.,'Limit')]`,

  // ===== RECOMMENDED TOGGLE =====
  recommendedSection: `//div[contains(.,'Recommended')]`,
  recommendedToggle: `//div[contains(.,'Recommended')]//div[contains(@class,'switch') or contains(@class,'slider')]`,
  recommendedInfo: `//p[contains(.,'Only one gift card')]`,

  // ===== NOTES =====
  notesLabel: `//label[contains(.,'Notes')]`,
  notesTextarea: `//textarea | //div[@contenteditable='true']`,
  notesHelperText: `//p[contains(.,'0/150')]`,

  // ===== ACTION BUTTONS =====
  cancelBtn: `//button[normalize-space()='Cancel']`,
  createBtn: `//button[normalize-space()='Create']`,
};

module.exports = { CreateGiftCard };
