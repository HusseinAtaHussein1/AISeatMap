# OrangeHRM — Automation Plan — RUN-20260709-001

> **Status:** `Pending Automation Approval` — awaiting Stage 4 checkpoint (Automation Lead / Release Manager role) per `pipeline/pipeline.md` §5.2.
> **Run:** RUN-20260709-001 — a new Stage 4 (Automation Agent) invocation, explicitly scoped to the **Login / Authentication & Access** module only, using an explicitly human-instructed framework (Playwright, Java) that differs from both the Playwright/JavaScript package approved under RUN-20260706-002 and the SHAFT Engine/Java package approved under RUN-20260708-001. This is a deliberately separate, parallel automation effort — it does not modify, replace, or supersede either existing package.
> **Upstream artifacts consumed:** all Stage 1–3 artifacts this plan relies on were produced and approved under `RUN-20260706-002`; no Stage 1–3 agent was re-run to produce this plan, per `pipeline/pipeline.md` §6 (an already-`Approved` artifact may be consumed by a later stage without re-running its producing stage).

## 1. Target Framework

**Playwright**, authored in **Java**.

**Justification:** Explicitly specified by direct human instruction for this run, ahead of any framework-selection process this agent would otherwise perform (`agents/automation_agent.md` §6–§7). Per §7 Rule 1: *"If the Project Context explicitly specifies a framework, the agent must use it. No selection process overrides an explicit instruction."* An explicit run-level human instruction is treated as equivalent in force to a Project Context framework specification, per the same precedent already established for RUN-20260708-001's SHAFT Engine choice. This is a higher-precedence signal than §7 Rule 2's "reuse an existing framework already in the project," which would otherwise have pointed at either the Playwright/JavaScript package (RUN-20260706-002) or the SHAFT/Java package (RUN-20260708-001). The user explicitly confirmed (before this plan was written) that this is intended as a third, parallel automation stack, not a migration replacing either existing package — satisfying §7 Rule 2's requirement that introducing a competing framework requires an explicit human decision.

## 2. Target Language

Java (17+), built with Maven.

## 3. Project Architecture

Page Object Model with a shared browser/session lifecycle layer, following standard Playwright Java conventions:

- A single shared `Playwright` / `Browser` instance per test run (created once, closed once); a fresh `BrowserContext` + `Page` per test method (created/torn down via shared `BaseTest` JUnit 5 `@BeforeEach`/`@AfterEach` — no test manages its own browser lifecycle).
- Page Objects hold only locators and page-level interaction methods; no assertions live inside a Page Object.
- Test classes hold only test flow (arrange → act → assert) and JUnit 5 metadata annotations (`@Test`, `@DisplayName`, `@ParameterizedTest`/`@MethodSource` where a test case's Test Data enumerates more than one combination).
- JUnit 5 as the test runner (Playwright Java's own documented default), invoked via Maven Surefire.
- Playwright's built-in trace/screenshot-on-failure configured in `BaseTest`, in lieu of a separate reporting library — no Allure or equivalent added, since none was called for by the Project Context or this run's instructions.

## 4. Design Pattern

Page Object Model, with shared test data centralized in a single `TestData` utility class (no hardcoded credential/payload literals inside test classes) — mirroring the design precedent already established by both existing packages (RUN-20260706-002's `fixtures/testData.js`, RUN-20260708-001's `Utilities/TestData.java`).

## 5. Planned Automation Suites

One suite, per this run's narrow (Login-only) scope and the Project Context's own module boundary (Project Context v2 §2: "Login / Authentication & Access — the login form, credential validation/error messaging, the 'Forgot Password' flow, and unauthenticated-access redirect behavior"):

- **Login & Access Suite** — organized around the single business workflow "authenticate or recover access to the application," not around individual pages. Internally grouped by two related sub-flows sharing the same workflow, matching the grouping already validated by RUN-20260708-001 for the same test case set:
  - Login sub-flow (credential submission, validation, redirect behavior)
  - Forgot Password sub-flow (part of the same Authentication & Access workflow, not a separate suite)

Full realized structure: see Automation Suite Manifest (`OrangeHRM_AutomationSuiteManifest.md`).

## 6. Existing Assets

**Existing Framework Analysis result:** two existing automation projects exist for this project:

1. `artifacts/OrangeHRM/runs/RUN-20260706-002/Automation/OrangeHRM_tests/` — Playwright, **JavaScript**. Same automation tool family (Playwright) as this run's target, but a different language runtime (Node.js vs. JVM) with no source-level compatibility — a Playwright *page object* written against `@playwright/test`'s JS API cannot be imported or extended by Java code. Structure (`fixtures/`, `pages/`, `tests/`) and its Page Object Model shape were inspected and are carried forward as **design precedent** (locator strategy, suite/fixture organization), not as reused code.
2. `artifacts/OrangeHRM/runs/RUN-20260708-001/Automation/OrangeHRM_tests_shaft/` — SHAFT Engine, Java. Same JVM/Java language as this run's target, but a different automation tool (SHAFT/Selenium, not Playwright) with an incompatible driver/assertion API (`SHAFT.GUI.WebDriver` vs. Playwright's `Page`/`Locator`) — no source-level reuse possible despite sharing a language.

**Conclusion:** nothing from either existing package can be reused as-is by a Playwright/Java project. No existing Playwright Engine Java automation project exists anywhere in this repository for OrangeHRM — this is a greenfield generation for this specific framework+language combination.

## 7. Assets To Generate

- `base/BaseTest.java` (shared `Playwright`/`Browser` singleton + per-test `BrowserContext`/`Page` setup/teardown)
- `utils/TestData.java` (shared test data: valid credentials, invalid credential combinations, SQLi-style payload, 259-character boundary string, emoji character, known/unknown Forgot-Password usernames, expected message strings)
- `pages/LoginPage.java` (Page Object: navigate, enter username/password, click Login, read inline validation/alert text, open Forgot Password link)
- `pages/ForgotPasswordPage.java` (Page Object: enter username, submit, read outcome message)
- 9 test classes, one per `Generate New Automation` decision (§13 below / Automation Decision Report)
- `pom.xml`, `src/test/resources/config.properties`

## 8. Assets To Reuse

None — see §6. This is a greenfield Playwright/Java project; there is no existing Playwright-Java asset in this repository to reuse or extend.

## 9. Estimated Automation Coverage

Projected before generation: **9 of 11 approved Login test cases (≈81.8%)** receive `Generate New Automation`; **2 of 11 (≈18.2%)** are `Known Manual Tests` (§10 below) and receive no generated code. No `Partially Automatable` or `Reuse Existing Automation` decisions are anticipated — this mirrors RUN-20260708-001's own projection exactly, since the decision for each test case turns on whether Test Design specified a fixed assertion, not on which framework automates it.

## 10. Known Manual Tests

Carried forward directly from Test Design's own exploratory dispositions (`agents/test_design_agent.md` §5.3), identical reasoning to RUN-20260708-001 since these are properties of the test case specification, not of the automation framework:

- **TC-LOGIN-006** — EXPLORATORY (repeated failed logins / brute-force protection, FINDING-002). Expected Result is "Reviewer confirms whether the observed absence of a lockout control is acceptable... or must be remediated" — not a system behavior an automated assertion can check.
- **TC-LOGIN-010** — EXPLORATORY (Forgot Password response time/availability parity, FINDING-006). Expected Result is "Reviewer decides whether the demonstrated asymmetry... is in-scope" — same reasoning.

## 11. Blocked Tests

None. All 11 approved Login test cases have a complete specification, a resolvable target environment (Project Context v2 §5), and either a clear automatable assertion or an explicit Manual Only disposition — no test case is blocked on a missing prerequisite.

## 12. Risks

- **Shared public demo environment** (Project Context v2 §5): `https://opensource-demo.orangehrmlive.com` is shared across all internet users; test data, timing, and even the specific defects this suite targets (FINDING-001, FINDING-005) could change or be fixed outside this project's control between generation and execution.
- **TC-LOGIN-009 currently exercises a known-defective path** (FINDING-005: Forgot Password with a valid username currently hangs to a `504` after the full reverse-proxy timeout window). The generated test asserts the *corrected* behavior (per Test Design's regression-test intent) and will fail — by design — against the current, unfixed build. Playwright's default navigation/action timeout is overridden to a generous value specifically for this test so it fails on a clear assertion mismatch rather than an ambiguous `TimeoutError`, but a very slow shared-environment response could still surface as a timeout exception instead of a clean assertion failure — the same caveat already logged for RUN-20260708-001's equivalent test.
- **No brute-force lockout exists** (FINDING-002) — repeated invalid-credential submissions across this suite and any re-run remain safe to repeat without risk of the shared `Admin` credential becoming locked.
- Playwright's own accessibility-role-based locators (`getByRole`, `getByLabel`, `getByText`) are used in preference to CSS/XPath wherever the page exposes a stable role/label/text — a stronger resilience guarantee than the SHAFT/Selenium package could offer (Automation Plan RUN-20260708-001 §12 noted Selenium's weaker equivalent), but any inline validation text OrangeHRM renders without an accessible role still falls back to a text-content locator.

## 13. Assumptions

- The target URL, credentials, and environment constraints in Project Context v2 (`artifacts/OrangeHRM/runs/RUN-20260706-002/context/OrangeHRM_ProjectContext.v2.md`) remain current and unchanged since that context was approved.
- A JDK 17+, Maven, and the Playwright Java driver's bundled Chromium (installed via `mvn exec:java -e -Dexec.mainClass=com.microsoft.playwright.CLI -Dexec.args="install"`) are available in whatever environment eventually executes this package — this agent does not execute it, so no such tool was verified as part of producing this plan.
- This suite is intended to be executed against the same shared demo environment as this project's own Discovery/Findings evidence was gathered against — no isolated/sandboxed environment is assumed to exist.
