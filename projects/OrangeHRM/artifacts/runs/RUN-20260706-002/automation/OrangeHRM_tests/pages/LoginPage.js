// Page Object — Login screen (/web/index.php/auth/login)
// Selectors confirmed via Explorer Agent v2 discovery (RUN-20260706-002/discovery/login_initial.md)
class LoginPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.usernameInput = page.locator('input[name="username"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.alert = page.locator('[role="alert"]');
    this.forgotPasswordLink = page.getByText('Forgot your password?');
  }

  async goto() {
    await this.page.goto('/web/index.php/auth/login');
  }

  async login(username, password) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async getAlertText() {
    return this.alert.isVisible().then((visible) => (visible ? this.alert.innerText() : null));
  }

  async getRequiredErrorCount() {
    return this.page.getByText('Required', { exact: true }).count();
  }

  async clickForgotPassword() {
    await this.forgotPasswordLink.click();
  }
}

module.exports = { LoginPage };
