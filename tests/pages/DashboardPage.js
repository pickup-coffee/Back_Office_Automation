// @ts-check
const { expect } = require('@playwright/test');
const { BasePage } = require('./BasePage');
const { PATHS } = require('../../config/constants');

/**
 * Page Object for the Back Office Dashboard (post-login).
 * Use after successful login to interact with main app shell.
 */
class DashboardPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);
  }

  /** Locator: ROLES navigation link */
  get rolesLink() {
    return this.page.getByRole('link', { name: /roles/i }).first();
  }

  /** Locator: Log out link or button */
  get logoutLink() {
    return this.page
      .getByRole('link', { name: /log out/i })
      .or(this.page.getByRole('button', { name: /log out/i }))
      .first();
  }

  /** Locator: greeting text (e.g. "Hello, Admin") */
  get greeting() {
    return this.page.getByText(/hello,/i).first();
  }

  /** Assert: user is logged in (logout visible) */
  async expectLoggedIn() {
    await expect(this.logoutLink).toBeVisible({ timeout: 15000 });
  }

  /** Action: navigate to Roles page */
  async goToRoles() {
    await this.rolesLink.click();
  }

  /** Action: log out */
  async logout() {
    await this.logoutLink.click();
  }

  /** Assert: current URL is the roles page */
  async expectOnRolesPage() {
    await expect(this.page).toHaveURL(new RegExp(PATHS.ROLES));
  }
}

module.exports = { DashboardPage };
