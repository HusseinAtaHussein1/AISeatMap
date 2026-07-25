// Tests Layer — platform_core_data/automation_framework.md §3.
// Flow + assertions only. No locators, no static data, no business logic — calls LoginPage
// (Pages Layer) methods and reads test data from the Data Layer only.
const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const testData = require('../data/loginTestData.json');
const { loadValidCredential } = require('../data/credentialsLoader');

test.describe('NDC — Login / Authentication (RUN-20260712-001)', () => {
  test('TC-LOGIN-001 — Valid login redirects to the Dashboard', async ({ page, baseURL }) => {
    const loginPage = new LoginPage(page, baseURL);
    const { username, password } = loadValidCredential();

    await loginPage.navigate();
    await loginPage.login(username, password);

    // Asserts on the documented success signal (matches browser/profile.json's successSelector),
    // not a specific host — see FINDING-NDC-LOGIN-001 and Automation Plan Risks.
    await expect(await loginPage.getDashboardSignalLocator()).toBeVisible({ timeout: 20000 });
  });

  test('TC-LOGIN-002 — Invalid credentials are rejected with a generic message', async ({ page, baseURL }) => {
    const loginPage = new LoginPage(page, baseURL);
    const { invalidLogin } = testData;

    await loginPage.navigate();
    await loginPage.login(invalidLogin.username, invalidLogin.password);

    await expect(await loginPage.getErrorMessageLocator()).toBeVisible({ timeout: 10000 });
    expect(loginPage.currentUrl()).toContain('/auth/login');
  });

  test('TC-LOGIN-003 — Empty Username/Password blocked by required-field validation [assumption-based]', async ({ page, baseURL }) => {
    // ASSUMPTION-BASED (see Coverage Report §7 / Automation Plan "Known Manual Tests"): Discovery
    // did not independently re-observe this exact submission this run. This test asserts the
    // weakest safe claim — an empty submission must NOT reach the same "Invalid credentials"
    // round-trip as a real (non-empty) invalid attempt — rather than asserting unverified
    // required-field UI text as fact.
    const loginPage = new LoginPage(page, baseURL);

    await loginPage.navigate();
    await loginPage.submitEmpty();

    await expect(await loginPage.getErrorMessageLocator()).not.toBeVisible({ timeout: 3000 });
    expect(loginPage.currentUrl()).toContain('/auth/login');
  });
});
