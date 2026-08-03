# OrangeHRM — Automation Suite Manifest — RUN-20260708-001

> Per `agents/automation_agent.md` §16. Realized suite structure from the Suite Planning Engine (§10).

## Login & Access Suite

**Business workflow:** authenticate or recover access to the application (Project Context v2 §2's single "Login / Authentication & Access" module) — organized as one workflow-level suite with two internal groupings for readability, not two independent page-level suites.

**Location:** `OrangeHRM_tests_shaft/` (Maven/TestNG project root)

### Shared Setup / Teardown

`Utilities/BaseTest.java` — every test class extends this; `@BeforeMethod` creates a fresh `SHAFT.GUI.WebDriver`, `@AfterMethod` quits it. No test manages its own driver lifecycle.

### Shared Fixtures / Test Data

`Utilities/TestData.java` — all credentials, payloads, and boundary values used across the suite (valid/invalid credentials, SQLi-style payload, emoji username, 259-character username, Forgot Password known/unknown usernames, expected message strings).

### Shared Components / Page Objects

- `Pages/LoginPage.java` — navigation, credential entry, Login submission, inline validation/alert reads, Forgot Password link.
- `Pages/ForgotPasswordPage.java` — username entry, Reset Password submission, outcome message read.

### Shared Utilities

None beyond `TestData` and `BaseTest` — no additional cross-cutting utility was needed for this scope.

### Test Group: Login

| Test Class | Test Case ID | TestNG `testng.xml` Test |
|---|---|---|
| `Tests/LoginSuite/ValidLoginTest.java` | TC-LOGIN-001 | Login |
| `Tests/LoginSuite/InvalidCredentialsTest.java` | TC-LOGIN-002 | Login |
| `Tests/LoginSuite/EmptyFormValidationTest.java` | TC-LOGIN-003 | Login |
| `Tests/LoginSuite/EmojiUsernameRegressionTest.java` | TC-LOGIN-004 | Login |
| `Tests/LoginSuite/SqlInjectionLoginTest.java` | TC-LOGIN-005 | Login |
| `Tests/LoginSuite/DeepLinkRedirectTest.java` | TC-LOGIN-007 | Login |
| `Tests/LoginSuite/LongUsernameBoundaryTest.java` | TC-LOGIN-011 | Login |

### Test Group: ForgotPassword

| Test Class | Test Case ID | TestNG `testng.xml` Test |
|---|---|---|
| `Tests/ForgotPasswordSuite/UnknownUsernameForgotPasswordTest.java` | TC-LOGIN-008 | ForgotPassword |
| `Tests/ForgotPasswordSuite/KnownUsernameForgotPasswordRegressionTest.java` | TC-LOGIN-009 | ForgotPassword |

### Not in this Suite (Manual Only)

TC-LOGIN-006 and TC-LOGIN-010 — no automation asset exists for these by design (see Automation Decision Report). They remain tracked as manual/exploratory items outside this suite's execution.

### Configuration

- `pom.xml` — Maven project, SHAFT Engine + TestNG dependencies.
- `testng.xml` — defines the `Login` and `ForgotPassword` TestNG `<test>` groups above, both under a single `<suite name="OrangeHRM Login & Access Suite">`.
- `src/test/resources/properties/execution.properties` — target browser/environment configuration, including the extended navigation timeout needed for TC-LOGIN-009 (see Automation Plan §12).
