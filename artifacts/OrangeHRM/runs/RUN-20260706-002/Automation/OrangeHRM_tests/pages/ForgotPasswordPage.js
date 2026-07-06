// Page Object — Forgot Password flow (/web/index.php/auth/requestPasswordResetCode)
// Confirmed via RUN-20260706-002/discovery/forgot_password_flow.md
class ForgotPasswordPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.usernameInput = page.getByRole('textbox', { name: 'Username' });
    this.resetButton = page.getByRole('button', { name: 'Reset Password' });
    this.resultHeading = page.locator('h6');
  }

  async goto() {
    await this.page.goto('/web/index.php/auth/requestPasswordResetCode');
  }

  /**
   * Submits the Forgot Password form. NOTE: for a valid, existing username this is known
   * (FINDING-005) to hang until an nginx 504 — callers testing that specific case should
   * pass a generous timeout and expect this call to reject/time out until the bug is fixed.
   */
  async requestReset(username, { timeout } = {}) {
    await this.usernameInput.fill(username);
    await this.resetButton.click({ timeout });
  }

  async getResultHeadingText() {
    return this.resultHeading.innerText();
  }
}

module.exports = { ForgotPasswordPage };
