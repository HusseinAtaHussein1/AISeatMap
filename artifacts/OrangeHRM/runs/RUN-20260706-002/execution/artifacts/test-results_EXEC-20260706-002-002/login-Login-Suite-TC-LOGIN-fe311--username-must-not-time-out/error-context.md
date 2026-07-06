# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: login.spec.js >> Login Suite >> TC-LOGIN-009 [REGRESSION, FINDING-005]: forgot password with a valid username must not time out
- Location: tests\login.spec.js:92:3

# Error details

```
Error: expect(locator).toHaveText(expected) failed

Locator: locator('h6')
Expected pattern: /sent successfully/i
Received string:  "Reset Password"
Timeout: 5000ms

Call log:
  - Expect "toHaveText" with timeout 5000ms
  - waiting for locator('h6')
    - locator resolved to <h6 data-v-7b563373="" data-v-76e562c4="" class="oxd-text oxd-text--h6 orangehrm-forgot-password-title">Reset Password</h6>
    - unexpected value "Reset Password"
    - waiting for" https://opensource-demo.orangehrmlive.com/web/index.php/auth/requestResetPassword" navigation to finish...

```

```yaml
- heading "Reset Password" [level=6]
```

# Test source

```ts
  1   | // Login Suite — automates the Login / Authentication & Access manual test cases
  2   | // (artifacts/OrangeHRM/runs/RUN-20260706-002/testcases/OrangeHRM_TestCases_Login.md).
  3   | // Traceability: every test below cites its Test Case ID; through that ID it inherits
  4   | // (without alteration) that test case's own Requirement/Discovery/Finding/Evidence
  5   | // References — see agents/automation_agent.md §12.
  6   | const { test, expect } = require('@playwright/test');
  7   | const { LoginPage } = require('../pages/LoginPage');
  8   | const { ForgotPasswordPage } = require('../pages/ForgotPasswordPage');
  9   | const testData = require('../fixtures/testData');
  10  | 
  11  | test.describe('Login Suite', () => {
  12  |   // TC-LOGIN-001 | Req: PRD FR-1 | Discovery: discovery/login_deeplink_and_successful_login.md
  13  |   test('TC-LOGIN-001: valid login redirects successfully', async ({ page }) => {
  14  |     const login = new LoginPage(page);
  15  |     await login.goto();
  16  |     await login.login(testData.validCredentials.username, testData.validCredentials.password);
  17  |     await expect(page).not.toHaveURL(/auth\/login$/);
  18  |   });
  19  | 
  20  |   // TC-LOGIN-002 | Req: PRD FR-1 | Discovery: discovery/login_validation_and_bruteforce.md
  21  |   test('TC-LOGIN-002: invalid credentials rejected with generic message', async ({ page }) => {
  22  |     const login = new LoginPage(page);
  23  |     await login.goto();
  24  |     await login.login(testData.validCredentials.username, testData.invalidPassword);
  25  |     await expect(login.alert).toHaveText(/Invalid credentials/);
  26  |   });
  27  | 
  28  |   // TC-LOGIN-003 | Req: PRD FR-1 | Discovery: discovery/login_validation_and_bruteforce.md
  29  |   test('TC-LOGIN-003: empty login form blocked by required-field validation', async ({ page }) => {
  30  |     const login = new LoginPage(page);
  31  |     await login.goto();
  32  |     await login.loginButton.click();
  33  |     expect(await login.getRequiredErrorCount()).toBeGreaterThanOrEqual(2);
  34  |     await expect(page).toHaveURL(/auth\/login/);
  35  |   });
  36  | 
  37  |   // TC-LOGIN-004 | REGRESSION for FINDING-001 | Evidence: findings/FINDING-001_EmojiUsernameUnexpectedError/failure.png
  38  |   // Expected Result asserts the CORRECTED behavior — this test is expected to FAIL until
  39  |   // FINDING-001 is fixed. That failure is the correct, intended signal (see Automation Plan, Risks).
  40  |   test('TC-LOGIN-004 [REGRESSION, FINDING-001]: emoji username must not surface a generic server error', async ({ page }) => {
  41  |     const login = new LoginPage(page);
  42  |     await login.goto();
  43  |     await login.login(testData.boundaryValues.emoji, testData.invalidPassword);
  44  |     await expect(login.alert).toHaveText(/Invalid credentials/); // NOT "Unexpected error occurred"
  45  |   });
  46  | 
  47  |   // TC-LOGIN-005 | Req: PRD §10 (Security Requirements, general) | Discovery: discovery/login_validation_and_bruteforce.md
  48  |   test('TC-LOGIN-005: SQL-injection-style payload does not bypass authentication', async ({ page }) => {
  49  |     const login = new LoginPage(page);
  50  |     await login.goto();
  51  |     await login.login(testData.boundaryValues.sqlInjectionPayload, testData.boundaryValues.sqlInjectionPayload);
  52  |     await expect(login.alert).toHaveText(/Invalid credentials/);
  53  |     await expect(page).toHaveURL(/auth\/login/); // no bypass
  54  |   });
  55  | 
  56  |   // TC-LOGIN-006 [PARTIALLY AUTOMATABLE, FINDING-002] | Req: PRD §10 SR-5
  57  |   // Automatable portion: reproduce the 5 attempts and assert no lockout/CAPTCHA appeared.
  58  |   // NOT automatable: whether the absence of a lockout control is an ACCEPTABLE risk for this
  59  |   // build is a human policy judgment (agents/automation_agent.md §13) — this test only
  60  |   // reports the technical observation, per FINDING-002's own "Needs Human Review" status.
  61  |   test('TC-LOGIN-006 [EXPLORATORY, FINDING-002]: repeated failed logins — observe brute-force protection', async ({ page }) => {
  62  |     const login = new LoginPage(page);
  63  |     await login.goto();
  64  |     for (let i = 0; i < 5; i += 1) {
  65  |       await login.login(testData.validCredentials.username, `${testData.invalidPassword}${i}`);
  66  |       await expect(login.alert).toHaveText(/Invalid credentials/);
  67  |       await login.goto();
  68  |     }
  69  |     // Reported for human review, not asserted as pass/fail: see FINDING-002.
  70  |     console.log('TC-LOGIN-006: 5/5 attempts rejected normally; no lockout/CAPTCHA observed — HUMAN REVIEW REQUIRED on acceptability.');
  71  |   });
  72  | 
  73  |   // TC-LOGIN-007 | Req: PRD FR-2, §10 SR-1 | Discovery: discovery/login_deeplink_and_successful_login.md
  74  |   test('TC-LOGIN-007: unauthenticated deep-link redirects to login and returns after login', async ({ page }) => {
  75  |     await page.goto(testData.protectedDeepLinkUrl);
  76  |     await expect(page).toHaveURL(/auth\/login/);
  77  |     const login = new LoginPage(page);
  78  |     await login.login(testData.validCredentials.username, testData.validCredentials.password);
  79  |     await expect(page).toHaveURL(new RegExp(testData.protectedDeepLinkUrl.replace(/\//g, '\\/')));
  80  |   });
  81  | 
  82  |   // TC-LOGIN-008 | Req: PRD FR-3, §10 SR-3 | Discovery: discovery/forgot_password_flow.md
  83  |   test('TC-LOGIN-008: forgot password with unknown username returns generic success', async ({ page }) => {
  84  |     const forgot = new ForgotPasswordPage(page);
  85  |     await forgot.goto();
  86  |     await forgot.requestReset(testData.unknownUsernameForResetProbe);
  87  |     await expect(forgot.resultHeading).toHaveText(/sent successfully/i);
  88  |   });
  89  | 
  90  |   // TC-LOGIN-009 | REGRESSION for FINDING-005 | Evidence: findings/FINDING-005_ForgotPasswordTimeoutKnownUser/failure.png
  91  |   // Expected to FAIL until FINDING-005 is fixed (currently 504s instead of succeeding).
  92  |   test('TC-LOGIN-009 [REGRESSION, FINDING-005]: forgot password with a valid username must not time out', async ({ page }) => {
  93  |     const forgot = new ForgotPasswordPage(page);
  94  |     await forgot.goto();
  95  |     await forgot.requestReset(testData.validCredentials.username, { timeout: 10_000 });
> 96  |     await expect(forgot.resultHeading).toHaveText(/sent successfully/i);
      |                                        ^ Error: expect(locator).toHaveText(expected) failed
  97  |   });
  98  | 
  99  |   // TC-LOGIN-010 [PARTIALLY AUTOMATABLE, FINDING-006] | Req: PRD FR-3, §10 SR-3
  100 |   // Automatable portion: capture and report the outcome/timing asymmetry.
  101 |   // NOT automatable: whether timing/availability parity is IN SCOPE for the anti-enumeration
  102 |   // requirement is a policy question for a human reviewer (see FINDING-006).
  103 |   test('TC-LOGIN-010 [EXPLORATORY, FINDING-006]: forgot password response asymmetry between valid/invalid usernames', async ({ page }) => {
  104 |     const forgot = new ForgotPasswordPage(page);
  105 |     const start1 = Date.now();
  106 |     await forgot.goto();
  107 |     let knownUserOutcome = 'success';
  108 |     try {
  109 |       await forgot.requestReset(testData.validCredentials.username, { timeout: 10_000 });
  110 |     } catch {
  111 |       knownUserOutcome = 'timeout/error';
  112 |     }
  113 |     const knownUserDurationMs = Date.now() - start1;
  114 | 
  115 |     await forgot.goto();
  116 |     const start2 = Date.now();
  117 |     await forgot.requestReset(testData.unknownUsernameForResetProbe);
  118 |     const unknownUserDurationMs = Date.now() - start2;
  119 | 
  120 |     console.log(`TC-LOGIN-010: known-user outcome=${knownUserOutcome} (${knownUserDurationMs}ms); unknown-user outcome=success (${unknownUserDurationMs}ms) — HUMAN REVIEW REQUIRED on whether this asymmetry is in-scope for anti-enumeration.`);
  121 |   });
  122 | 
  123 |   // TC-LOGIN-011 | Req: PRD FR-1 | Discovery: "Not independently verified in Discovery this run" (Test Gap)
  124 |   test('TC-LOGIN-011: long username input does not degrade login handling', async ({ page }) => {
  125 |     const login = new LoginPage(page);
  126 |     await login.goto();
  127 |     await login.login(testData.boundaryValues.longAlphaNumeric259, testData.invalidPassword);
  128 |     await expect(login.alert).toHaveText(/Invalid credentials/);
  129 |   });
  130 | });
  131 | 
```