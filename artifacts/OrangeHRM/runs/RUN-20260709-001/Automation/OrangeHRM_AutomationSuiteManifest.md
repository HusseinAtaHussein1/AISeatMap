# OrangeHRM — Automation Suite Manifest — RUN-20260709-001

> Per `agents/automation_agent.md` §16. Realized suite structure from the Suite Planning Engine (§10).

## Login & Access Suite

**Business workflow:** authenticate or recover access to the application (Project Context v2 §2's single "Login / Authentication & Access" module) — organized as one workflow-level suite with two internal groupings for readability, not two independent page-level suites.

**Location:** `OrangeHRM_tests_playwright_java/` (Maven project root)

### Shared Setup / Teardown

`src/test/java/com/orangehrm/base/BaseTest.java` — every test class extends this; `@BeforeAll`/`@AfterAll` manage a single shared `Playwright`/`Browser` instance for the run, `@BeforeEach`/`@AfterEach` create/close a fresh `BrowserContext` + `Page` per test method. No test manages its own browser lifecycle.

### Shared Fixtures / Test Data

`src/test/java/com/orangehrm/utils/TestData.java` — all credentials, payloads, and boundary values used across the suite (valid/invalid credentials, SQLi-style payload, emoji username, 259-character username, Forgot Password known/unknown usernames, expected message strings).

### Shared Components / Page Objects

- `src/test/java/com/orangehrm/pages/LoginPage.java` — navigation, credential entry, Login submission, inline validation/alert reads, Forgot Password link.
- `src/test/java/com/orangehrm/pages/ForgotPasswordPage.java` — username entry, Reset Password submission, outcome message read.

### Shared Utilities

None beyond `TestData` and `BaseTest` — no additional cross-cutting utility was needed for this scope.

### Test Group: login

| Test Class | Test Case ID |
|---|---|
| `tests/login/ValidLoginTest.java` | TC-LOGIN-001 |
| `tests/login/InvalidCredentialsTest.java` | TC-LOGIN-002 |
| `tests/login/EmptyFormValidationTest.java` | TC-LOGIN-003 |
| `tests/login/EmojiUsernameRegressionTest.java` | TC-LOGIN-004 |
| `tests/login/SqlInjectionLoginTest.java` | TC-LOGIN-005 |
| `tests/login/DeepLinkRedirectTest.java` | TC-LOGIN-007 |
| `tests/login/LongUsernameBoundaryTest.java` | TC-LOGIN-011 |

### Test Group: forgotpassword

| Test Class | Test Case ID |
|---|---|
| `tests/forgotpassword/UnknownUsernameForgotPasswordTest.java` | TC-LOGIN-008 |
| `tests/forgotpassword/KnownUsernameForgotPasswordRegressionTest.java` | TC-LOGIN-009 |

### Not in this Suite (Manual Only)

TC-LOGIN-006 and TC-LOGIN-010 — no automation asset exists for these by design (see Automation Decision Report). They remain tracked as manual/exploratory items outside this suite's execution.

### Configuration

- `pom.xml` — Maven project, Playwright + JUnit 5 dependencies, Surefire configured to pick up `**/tests/**/*Test.java`.
- `src/test/resources/config.properties` — target environment, headless flag, default/extended timeouts (the extended timeout is needed for TC-LOGIN-009 — see Automation Plan §12).
