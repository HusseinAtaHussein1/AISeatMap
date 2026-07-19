// Pages Layer — projects/NDC/automation_framework.md §1.
// UI-interaction methods only. No business logic, no assertions — those belong to the Tests Layer.
const { LoginLocators } = require('../locators/LoginLocators');

class LoginPage {
  constructor(page, baseUrl) {
    this.page = page;
    this.baseUrl = baseUrl;
    this.locators = new LoginLocators();
  }

  async navigate() {
    await this.page.goto(this.baseUrl, { waitUntil: 'networkidle', timeout: 20000 });
  }

  async login(username, password) {
    await this.page.fill(this.locators.Txt_Username(), username);
    await this.page.fill(this.locators.Txt_Password(), password);
    await this.page.click(this.locators.Btn_Login());
  }

  async submitEmpty() {
    await this.page.fill(this.locators.Txt_Username(), '');
    await this.page.fill(this.locators.Txt_Password(), '');
    await this.page.click(this.locators.Btn_Login());
  }

  async getErrorMessageLocator() {
    return this.page.locator(this.locators.Txt_ErrorMessage());
  }

  async getDashboardSignalLocator() {
    return this.page.locator(this.locators.Txt_DashboardSignal());
  }

  currentUrl() {
    return this.page.url();
  }
}

module.exports = { LoginPage };
