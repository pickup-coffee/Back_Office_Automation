// @ts-check
const { expect } = require('@playwright/test');

/**
 * Page object for the Back Office dashboard (post-login).
 */
class DashboardPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
  }

  get rolesLink() {
    return this.page.getByRole('link', { name: /roles/i }).first();
  }

  get logoutLink() {
    return this.page.getByRole('link', { name: /log out/i }).or(
      this.page.getByRole('button', { name: /log out/i })
    ).first();
  }

  get greeting() {
    return this.page.getByText(/hello,/i).first();
  }

  async expectLoggedIn() {
    await expect(this.logoutLink).toBeVisible({ timeout: 15000 });
  }

  async goToRoles() {
    await this.rolesLink.click();
  }

  async logout() {
    await this.logoutLink.click();
  }
}

module.exports = { DashboardPage };
