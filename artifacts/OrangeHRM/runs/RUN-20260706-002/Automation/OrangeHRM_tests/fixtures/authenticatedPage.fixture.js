// Shared fixture — an already-logged-in page, reused by every PIM test (composition over
// duplication, agents/automation_agent.md §14) instead of repeating the login steps in
// every single PIM test case.
const base = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const testData = require('./testData');

exports.test = base.test.extend({
  authenticatedPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(testData.validCredentials.username, testData.validCredentials.password);
    await page.waitForURL(/dashboard|pim/);
    await use(page);
  },
});

exports.expect = base.expect;
