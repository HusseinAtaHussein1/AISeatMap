// Login Suite — automates the Login / Authentication & Access manual test cases
// (artifacts/OrangeHRM/runs/RUN-20260706-002/testcases/OrangeHRM_TestCases_Login.md).
// Traceability: every test below cites its Test Case ID; through that ID it inherits
// (without alteration) that test case's own Requirement/Discovery/Finding/Evidence
// References — see agents/automation_agent.md §12.
const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { ForgotPasswordPage } = require('../pages/ForgotPasswordPage');
const testData = require('../fixtures/testData');

test.describe('Login Suite', () => {
  // TC-LOGIN-001 | Req: PRD FR-1 | Discovery: discovery/login_deeplink_and_successful_login.md
  test('TC-LOGIN-001: valid login redirects successfully', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(testData.validCredentials.username, testData.validCredentials.password);
    await expect(page).not.toHaveURL(/auth\/login$/);
  });

  // TC-LOGIN-002 | Req: PRD FR-1 | Discovery: discovery/login_validation_and_bruteforce.md
  test('TC-LOGIN-002: invalid credentials rejected with generic message', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(testData.validCredentials.username, testData.invalidPassword);
    await expect(login.alert).toHaveText(/Invalid credentials/);
  });

  // TC-LOGIN-003 | Req: PRD FR-1 | Discovery: discovery/login_validation_and_bruteforce.md
  test('TC-LOGIN-003: empty login form blocked by required-field validation', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.loginButton.click();
    expect(await login.getRequiredErrorCount()).toBeGreaterThanOrEqual(2);
    await expect(page).toHaveURL(/auth\/login/);
  });

  // TC-LOGIN-004 | REGRESSION for FINDING-001 | Evidence: findings/FINDING-001_EmojiUsernameUnexpectedError/failure.png
  // Expected Result asserts the CORRECTED behavior — this test is expected to FAIL until
  // FINDING-001 is fixed. That failure is the correct, intended signal (see Automation Plan, Risks).
  test('TC-LOGIN-004 [REGRESSION, FINDING-001]: emoji username must not surface a generic server error', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(testData.boundaryValues.emoji, testData.invalidPassword);
    await expect(login.alert).toHaveText(/Invalid credentials/); // NOT "Unexpected error occurred"
  });

  // TC-LOGIN-005 | Req: PRD §10 (Security Requirements, general) | Discovery: discovery/login_validation_and_bruteforce.md
  test('TC-LOGIN-005: SQL-injection-style payload does not bypass authentication', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(testData.boundaryValues.sqlInjectionPayload, testData.boundaryValues.sqlInjectionPayload);
    await expect(login.alert).toHaveText(/Invalid credentials/);
    await expect(page).toHaveURL(/auth\/login/); // no bypass
  });

  // TC-LOGIN-006 [PARTIALLY AUTOMATABLE, FINDING-002] | Req: PRD §10 SR-5
  // Automatable portion: reproduce the 5 attempts and assert no lockout/CAPTCHA appeared.
  // NOT automatable: whether the absence of a lockout control is an ACCEPTABLE risk for this
  // build is a human policy judgment (agents/automation_agent.md §13) — this test only
  // reports the technical observation, per FINDING-002's own "Needs Human Review" status.
  test('TC-LOGIN-006 [EXPLORATORY, FINDING-002]: repeated failed logins — observe brute-force protection', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    for (let i = 0; i < 5; i += 1) {
      await login.login(testData.validCredentials.username, `${testData.invalidPassword}${i}`);
      await expect(login.alert).toHaveText(/Invalid credentials/);
      await login.goto();
    }
    // Reported for human review, not asserted as pass/fail: see FINDING-002.
    console.log('TC-LOGIN-006: 5/5 attempts rejected normally; no lockout/CAPTCHA observed — HUMAN REVIEW REQUIRED on acceptability.');
  });

  // TC-LOGIN-007 | Req: PRD FR-2, §10 SR-1 | Discovery: discovery/login_deeplink_and_successful_login.md
  test('TC-LOGIN-007: unauthenticated deep-link redirects to login and returns after login', async ({ page }) => {
    await page.goto(testData.protectedDeepLinkUrl);
    await expect(page).toHaveURL(/auth\/login/);
    const login = new LoginPage(page);
    await login.login(testData.validCredentials.username, testData.validCredentials.password);
    await expect(page).toHaveURL(new RegExp(testData.protectedDeepLinkUrl.replace(/\//g, '\\/')));
  });

  // TC-LOGIN-008 | Req: PRD FR-3, §10 SR-3 | Discovery: discovery/forgot_password_flow.md
  test('TC-LOGIN-008: forgot password with unknown username returns generic success', async ({ page }) => {
    const forgot = new ForgotPasswordPage(page);
    await forgot.goto();
    await forgot.requestReset(testData.unknownUsernameForResetProbe);
    await expect(forgot.resultHeading).toHaveText(/sent successfully/i);
  });

  // TC-LOGIN-009 | REGRESSION for FINDING-005 | Evidence: findings/FINDING-005_ForgotPasswordTimeoutKnownUser/failure.png
  // Expected to FAIL until FINDING-005 is fixed (currently 504s instead of succeeding).
  test('TC-LOGIN-009 [REGRESSION, FINDING-005]: forgot password with a valid username must not time out', async ({ page }) => {
    const forgot = new ForgotPasswordPage(page);
    await forgot.goto();
    await forgot.requestReset(testData.validCredentials.username, { timeout: 10_000 });
    await expect(forgot.resultHeading).toHaveText(/sent successfully/i);
  });

  // TC-LOGIN-010 [PARTIALLY AUTOMATABLE, FINDING-006] | Req: PRD FR-3, §10 SR-3
  // Automatable portion: capture and report the outcome/timing asymmetry.
  // NOT automatable: whether timing/availability parity is IN SCOPE for the anti-enumeration
  // requirement is a policy question for a human reviewer (see FINDING-006).
  test('TC-LOGIN-010 [EXPLORATORY, FINDING-006]: forgot password response asymmetry between valid/invalid usernames', async ({ page }) => {
    const forgot = new ForgotPasswordPage(page);
    const start1 = Date.now();
    await forgot.goto();
    let knownUserOutcome = 'success';
    try {
      await forgot.requestReset(testData.validCredentials.username, { timeout: 10_000 });
    } catch {
      knownUserOutcome = 'timeout/error';
    }
    const knownUserDurationMs = Date.now() - start1;

    await forgot.goto();
    const start2 = Date.now();
    await forgot.requestReset(testData.unknownUsernameForResetProbe);
    const unknownUserDurationMs = Date.now() - start2;

    console.log(`TC-LOGIN-010: known-user outcome=${knownUserOutcome} (${knownUserDurationMs}ms); unknown-user outcome=success (${unknownUserDurationMs}ms) — HUMAN REVIEW REQUIRED on whether this asymmetry is in-scope for anti-enumeration.`);
  });

  // TC-LOGIN-011 | Req: PRD FR-1 | Discovery: "Not independently verified in Discovery this run" (Test Gap)
  test('TC-LOGIN-011: long username input does not degrade login handling', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(testData.boundaryValues.longAlphaNumeric259, testData.invalidPassword);
    await expect(login.alert).toHaveText(/Invalid credentials/);
  });
});
