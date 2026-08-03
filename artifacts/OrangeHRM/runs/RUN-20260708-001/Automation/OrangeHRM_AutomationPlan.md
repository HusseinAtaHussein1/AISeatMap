# OrangeHRM — Automation Plan — RUN-20260708-001

> **Status:** `Pending Automation Approval` — awaiting Stage 4 checkpoint (Automation Lead / Release Manager role) per `pipeline/pipeline.md` §5.2.
> **Run:** RUN-20260708-001 — a new Stage 4 (Automation Agent) invocation, explicitly scoped to the **Login / Authentication & Access** module only, using an explicitly human-instructed framework (SHAFT Engine, Java) that differs from the framework already approved for the full RUN-20260706-002 automation package (Playwright/JavaScript). This is a deliberately separate, parallel automation effort — it does not modify, replace, or supersede RUN-20260706-002's approved Automation Package.
> **Upstream artifacts consumed:** all Stage 1–3 artifacts this plan relies on were produced and approved under `RUN-20260706-002`; no Stage 1–3 agent was re-run to produce this plan, per `pipeline/pipeline.md` §6 (an already-`Approved` artifact may be consumed by a later stage without re-running its producing stage).

## 1. Target Framework

**SHAFT Engine**, authored in **Java**.

**Justification:** This framework was explicitly specified by direct human instruction for this automation run, ahead of any framework-selection process the agent would otherwise perform (§6–§7 of `agents/automation_agent.md`). Per that spec's Framework Selection precedence (§7, Rule 1): *"If the Project Context explicitly specifies a framework, the agent must use it. No selection process overrides an explicit instruction."* An explicit run-level human instruction is treated as equivalent in force to a Project Context framework specification for the purposes of this rule — it is a higher-precedence signal than Rule 2's "reuse an existing framework already in the project," which would otherwise have pointed at the Playwright/JavaScript package already approved under RUN-20260706-002. Introducing SHAFT Engine here is therefore not an unauthorized "second, competing framework" (the concern §7 Rule 2 and `agents/automation_agent.md` §18.5 guard against) — it is a framework choice made *by* the human authority whose sign-off that rule exists to protect, for an explicitly new, separate automation project.

## 2. Target Language

Java (11+), built with Maven.

## 3. Project Architecture

Page Object Model with a shared driver/session layer, following standard SHAFT Engine project conventions:

- `SHAFT.GUI.WebDriver` instance per test (created/torn down via shared `BaseTest` setup/teardown — no test manages its own driver lifecycle).
- Page Objects hold only locators and page-level interaction methods; no assertions live inside a Page Object.
- Test classes hold only test flow (arrange → act → assert) and SHAFT/Allure metadata annotations.
- TestNG as the test runner; `testng.xml` defines the Login Suite (§10 below).
- Allure Reporting via SHAFT's built-in Allure integration (no separate reporting library configured).

## 4. Design Pattern

Page Object Model, with shared test data centralized in a single `TestData` utility class (no hardcoded credential/payload literals inside test classes).

## 5. Planned Automation Suites

One suite, per this run's narrow (Login-only) scope and the Project Context's own module boundary (Project Context v2 §2: "Login / Authentication & Access — the login form, credential validation/error messaging, the 'Forgot Password' flow, and unauthenticated-access redirect behavior"):

- **Login & Access Suite** — organized around the single business workflow "authenticate or recover access to the application," not around individual pages. Internally grouped by two related sub-flows sharing the same workflow:
  - Login sub-flow (credential submission, validation, redirect behavior)
  - Forgot Password sub-flow (part of the same Authentication & Access workflow, not a separate suite — splitting it out would recreate the per-page fragmentation §10 of the agent spec explicitly disallows)

Full realized structure: see Automation Suite Manifest (`OrangeHRM_AutomationSuiteManifest.md`).

## 6. Existing Assets

**Existing Framework Analysis result:** an existing automation project **does** exist for this project — `artifacts/OrangeHRM/runs/RUN-20260706-002/Automation/OrangeHRM_tests/` (Playwright + JavaScript, approved). It was inspected per §9 of the agent spec. Findings:

- Framework/language: Playwright, JavaScript — not source-compatible with SHAFT Engine/Java in any way (different language, different driver/assertion/reporting APIs, different page-object base classes).
- Structure: `fixtures/`, `pages/`, `tests/` — conceptually the same Page Object Model shape this plan also adopts, but nothing at the source-code level is reusable across the language boundary.
- **Conclusion:** nothing from the existing Playwright package can be reused as-is by a Java/SHAFT project. The *organizing principles* (Page Object Model, shared fixtures for auth/test data) were carried forward as design precedent, not as reused code. No existing SHAFT Engine or other Java automation project exists anywhere in this repository for OrangeHRM — this is a greenfield generation for this framework.

## 7. Assets To Generate

- `BaseTest` (shared `SHAFT.GUI.WebDriver` setup/teardown)
- `TestData` (shared test data: valid credentials, invalid credential combinations, SQLi-style payload, long-string boundary value, emoji character, known/unknown Forgot-Password usernames)
- `LoginPage` (Page Object: navigate, enter username/password, click Login, read inline validation/alert text)
- `ForgotPasswordPage` (Page Object: open Forgot Password link, enter username, submit, read outcome message)
- 9 test classes, one per `Generate New Automation` decision (§13 below / Automation Decision Report)
- `pom.xml`, `testng.xml`, `execution.properties`

## 8. Assets To Reuse

None — see §6. This is a greenfield SHAFT Engine project; there is no existing SHAFT/Java asset in this repository to reuse or extend.

## 9. Estimated Automation Coverage

Projected before generation: **9 of 11 approved Login test cases (≈81.8%)** receive `Generate New Automation`; **2 of 11 (≈18.2%)** are `Known Manual Tests` (§10 below) and receive no generated code. No `Partially Automatable` or `Reuse Existing Automation` decisions are anticipated for this test case set — confirmed against the actual per-test-case analysis in the Automation Decision Report.

## 10. Known Manual Tests

Carried forward directly from Test Design's own exploratory dispositions (`agents/test_design_agent.md` §5.3) — both are explicitly "no fixed pass/fail assertion" by design, which this agent cannot convert into a deterministic automated assertion without inventing a pass/fail criterion Test Design deliberately declined to set:

- **TC-LOGIN-006** — EXPLORATORY (repeated failed logins / brute-force protection, FINDING-002). Expected Result is "Reviewer confirms whether the observed absence of a lockout control is acceptable... or must be remediated" — not a system behavior an automated assertion can check.
- **TC-LOGIN-010** — EXPLORATORY (Forgot Password response time/availability parity, FINDING-006). Expected Result is "Reviewer decides whether the demonstrated asymmetry... is in-scope" — same reasoning.

## 11. Blocked Tests

None. All 11 approved Login test cases have a complete specification, a resolvable target environment (Project Context v2 §5), and either a clear automatable assertion or an explicit Manual Only disposition — no test case is blocked on a missing prerequisite.

## 12. Risks

- **Shared public demo environment** (Project Context v2 §5): `https://opensource-demo.orangehrmlive.com` is shared across all internet users; test data, timing, and even the specific defects this suite targets (FINDING-001, FINDING-005) could change or be fixed outside this project's control between generation and execution.
- **TC-LOGIN-009 currently exercises a known-defective path** (FINDING-005: Forgot Password with a valid username currently hangs to a `504` after the full reverse-proxy timeout window). The generated test asserts the *corrected* behavior (per Test Design's regression-test intent) and will fail — by design — against the current, unfixed build. Its SHAFT/TestNG timeout is set generously (see Known Limitations in the Automation Decision Report) specifically so the test fails on a clear assertion mismatch rather than an ambiguous client-side timeout exception, but a very slow shared-environment response could still produce a timeout exception instead of a clean assertion failure.
- **No brute-force lockout exists** (FINDING-002) — TC-LOGIN-002's and TC-LOGIN-005's repeated invalid-credential submissions, plus any suite re-run, remain safe to repeat without risk of the account becoming locked, but also means nothing in this suite can incidentally trigger a lockout that would affect other tests' shared `Admin` credential use. Suite execution order should still avoid unnecessary redundant invalid-login volume as a matter of courtesy to the shared demo, not because of a functional risk.
- **Selenium (which SHAFT wraps) has no direct equivalent to accessibility-role-based locators** the way some other frameworks do. Locators in this package therefore prefer stable `name`/`id` attributes and visible, user-facing text over structural CSS/XPath position — the most resilient option available within Selenium's own locator API — but this is a narrower resilience guarantee than true role-based querying. Recorded as a standing limitation, not silently treated as equivalent.

## 13. Assumptions

- The target URL, credentials, and environment constraints in Project Context v2 (`artifacts/OrangeHRM/runs/RUN-20260706-002/context/OrangeHRM_ProjectContext.v2.md`) remain current and unchanged since that context was approved.
- A Java 11+ JDK, Maven, and a Chrome browser (or SHAFT's configured default) are available in whatever environment eventually executes this package — this agent does not execute it, so no such tool was verified as part of producing this plan.
- SHAFT Engine's own driver management (via its `execution.properties` configuration) handles browser/driver provisioning; no separate WebDriverManager setup is authored here, consistent with standard SHAFT Engine usage.
- This suite is intended to be executed against the same shared demo environment as this project's own Discovery/Findings evidence was gathered against — no isolated/sandboxed environment is assumed to exist.
