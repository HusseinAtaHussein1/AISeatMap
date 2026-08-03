# OrangeHRM — Automation Decision Report — RUN-20260708-001

> Per `agents/automation_agent.md` §13. Every one of the 11 approved Login test cases (`artifacts/OrangeHRM/runs/RUN-20260706-002/testcases/OrangeHRM_TestCases_Login.md`) receives exactly one decision below.

## TC-LOGIN-001 — Valid login redirects successfully

- **Decision:** Generate New Automation
- **Justification:** Deterministic, fully specified positive-path assertion (redirect away from `/auth/login`) with confirmed test data.
- **Reused Assets:** None
- **Generated Assets:** `Tests/LoginSuite/ValidLoginTest.java`, `Pages/LoginPage.java`
- **Automation Readiness:** Ready for the Execution Agent.
- **Known Limitations:** None beyond the shared-environment risk logged in the Automation Plan §12.

## TC-LOGIN-002 — Invalid credentials rejected with generic message

- **Decision:** Generate New Automation
- **Justification:** Deterministic assertion on a fixed, known message string; both Test Data combinations (valid username/wrong password, unknown username/wrong password) are covered via a TestNG `@DataProvider` rather than duplicated test methods.
- **Reused Assets:** `LoginPage`
- **Generated Assets:** `Tests/LoginSuite/InvalidCredentialsTest.java`
- **Automation Readiness:** Ready for the Execution Agent.
- **Known Limitations:** None.

## TC-LOGIN-003 — Empty login form blocked by required-field validation

- **Decision:** Generate New Automation
- **Justification:** Deterministic assertion on a fixed "Required" message.
- **Reused Assets:** `LoginPage`
- **Generated Assets:** `Tests/LoginSuite/EmptyFormValidationTest.java`
- **Automation Readiness:** Ready for the Execution Agent.
- **Known Limitations:** The page shows a "Required" message under *both* the Username and Password fields simultaneously. The generated assertion checks the locator group's text against a single expected value; depending on the SHAFT Engine version's handling of multi-element locators, this may only validate the first matching element rather than both independently. Flagged for reviewer attention at the Stage 4 checkpoint rather than silently assumed correct.

## TC-LOGIN-004 — REGRESSION — Emoji in Username must not surface a generic server error

- **Decision:** Generate New Automation
- **Justification:** Test Design already resolved this to a fully-specified corrected-behavior assertion ("Invalid credentials", not "Unexpected error occurred") — automating it is exactly what a regression test is for, per `agents/automation_agent.md` §12/§13. Not invented business logic: the expected value comes directly from the approved test case, not from this agent's own judgment.
- **Reused Assets:** `LoginPage`
- **Generated Assets:** `Tests/LoginSuite/EmojiUsernameRegressionTest.java`
- **Automation Readiness:** Ready for the Execution Agent, with the caveat below.
- **Known Limitations:** This test is expected to **fail** against the current, unfixed build (FINDING-001, Status: Needs Human Review) — it will report a genuine, informative failure ("Invalid credentials" expected, "Unexpected error occurred" actually shown) rather than an execution error, which is the correct and intended regression-test behavior, not a defect in the automation itself.

## TC-LOGIN-005 — SQL-injection-style payload does not bypass authentication

- **Decision:** Generate New Automation
- **Justification:** Deterministic assertion; payload submission as ordinary form input carries no destructive risk (Project Context v2 §5 explicitly authorizes this as an observation-only probe).
- **Reused Assets:** `LoginPage`
- **Generated Assets:** `Tests/LoginSuite/SqlInjectionLoginTest.java`
- **Automation Readiness:** Ready for the Execution Agent.
- **Known Limitations:** None.

## TC-LOGIN-006 — EXPLORATORY — Repeated failed logins and brute-force protection

- **Decision:** Manual Only
- **Justification:** Test Design's own Expected Result is explicit — "EXPLORATORY — no fixed pass/fail assertion... Reviewer confirms whether the observed absence of a lockout control is acceptable." There is no pass/fail criterion in the approved test case for this agent to encode; inventing one (e.g., asserting a specific number of allowed attempts) would be inventing business logic Test Design deliberately declined to assert, which `agents/automation_agent.md` §13/§18.14 explicitly forbids.
- **Reused Assets:** None
- **Generated Assets:** None
- **Automation Readiness:** N/A — not automatable by design, not blocked.
- **Known Limitations:** If a future human decision (per FINDING-002) fixes a specific lockout policy, this test case should be revisited by Stage 3 with a concrete assertion, at which point it would become automatable.

## TC-LOGIN-007 — Unauthenticated deep-link redirects to login and returns to the original URL after login

- **Decision:** Generate New Automation
- **Justification:** Deterministic two-stage assertion (redirect-to-login, then redirect-to-original-URL after login) with confirmed test data (`/pim/viewEmployeeList`).
- **Reused Assets:** `LoginPage`
- **Generated Assets:** `Tests/LoginSuite/DeepLinkRedirectTest.java`
- **Automation Readiness:** Ready for the Execution Agent.
- **Known Limitations:** None.

## TC-LOGIN-008 — Forgot Password with an unknown username returns the generic success message

- **Decision:** Generate New Automation
- **Justification:** Deterministic assertion on a fixed, known message string.
- **Reused Assets:** `LoginPage` (navigation + Forgot Password link), `ForgotPasswordPage`
- **Generated Assets:** `Tests/ForgotPasswordSuite/UnknownUsernameForgotPasswordTest.java`, `Pages/ForgotPasswordPage.java`
- **Automation Readiness:** Ready for the Execution Agent.
- **Known Limitations:** None.

## TC-LOGIN-009 — REGRESSION — Forgot Password with a valid username must not time out

- **Decision:** Generate New Automation
- **Justification:** Same reasoning as TC-LOGIN-004 — Test Design already specified the corrected-behavior expectation; automating it is the regression test's purpose.
- **Reused Assets:** `LoginPage`, `ForgotPasswordPage`
- **Generated Assets:** `Tests/ForgotPasswordSuite/KnownUsernameForgotPasswordRegressionTest.java`
- **Automation Readiness:** Ready for the Execution Agent, with the caveat below.
- **Known Limitations:** This test is expected to **fail** against the current, unfixed build (FINDING-005, Status: Confirmed, Severity: High) — the live demo currently hangs this request to a `504 Gateway Time-out` after the full reverse-proxy timeout window. `execution.properties` sets a generous 90-second navigation timeout specifically so this surfaces as a slow, clean failure rather than an ambiguous SHAFT/Selenium timeout exception, but a materially slower shared-environment response than previously observed could still produce a timeout exception instead. Either outcome should be read by the Execution Agent as confirming the defect, not as an automation defect.

## TC-LOGIN-010 — EXPLORATORY — Forgot Password response time/availability parity between valid and invalid usernames

- **Decision:** Manual Only
- **Justification:** Same reasoning as TC-LOGIN-006 — Test Design's Expected Result is explicit: "EXPLORATORY — no fixed pass/fail assertion... Reviewer decides whether the demonstrated asymmetry... is in-scope." No assertable criterion exists in the approved test case.
- **Reused Assets:** None
- **Generated Assets:** None
- **Automation Readiness:** N/A — not automatable by design, not blocked.
- **Known Limitations:** If FINDING-005 is fixed and FINDING-006's timing question is separately resolved by a human reviewer into a concrete timing threshold, this test case would become automatable in a future Stage 3 revision.

## TC-LOGIN-011 — Long input in Username field does not degrade login handling

- **Decision:** Generate New Automation
- **Justification:** Deterministic assertion; the 259-character test data value is explicitly specified in the approved test case.
- **Reused Assets:** `LoginPage`
- **Generated Assets:** `Tests/LoginSuite/LongUsernameBoundaryTest.java`
- **Automation Readiness:** Ready for the Execution Agent.
- **Known Limitations:** This run's own Discovery did not independently re-verify this category (per the test case's own Discovery Reference note, citing `RUN-20260706-001` instead) — the automation itself is unaffected, but the Execution Agent should be aware the underlying behavior's currency is one run older than the rest of this suite's evidence.

---

**Summary:** 9 × Generate New Automation, 0 × Reuse Existing Automation, 0 × Partially Automatable, 2 × Manual Only. See `OrangeHRM_AutomationCoverageReport.md` for the aggregate view.
