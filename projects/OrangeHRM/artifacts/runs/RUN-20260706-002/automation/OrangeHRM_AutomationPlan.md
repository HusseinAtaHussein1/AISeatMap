> **Status:** `Approved` (reviewer: Aymoon, Automation Lead / Release Manager role, 2026-07-06) — this checkpoint is stricter than a document review; approving it authorized the generated code to execute against a real environment (Stage 5, now complete). Per `pipeline/pipeline.md` §5.2.
> **Run:** RUN-20260706-002, Stage 4 (Automation Agent v2).

# Automation Plan — OrangeHRM (Login + PIM)

## Target Framework

**Playwright** (JS test runner, `@playwright/test`).

Justification (per `agents/automation_agent.md` §7): the Project Context does not explicitly specify a framework. No existing automation *project* (test files, page objects, runner config) exists at `artifacts/OrangeHRM/Automation/` — it is empty prior to this run. However, `playwright` (`^1.61.1`) is already an installed devDependency of this exact repository (used by the Explorer Agent for MCP-driven browser automation) — introducing a second web-automation library into the same repo to author test scripts would be redundant. Combined with the application type (Web) and the absence of any stated team standard to the contrary, Playwright is selected on both the "existing reusable technology" and general-criteria grounds. SHAFT Engine (`agents/automation_agent.md` §8) was not selected: nothing in the Project Context, PRD, or repository signals a Java/TestNG/SHAFT stack — SHAFT would introduce an entirely new language and toolchain with no existing foothold in this repository.

## Target Language

**JavaScript** (not TypeScript). Justification: `package.json` declares `"type": "commonjs"` with no `typescript`, `ts-node`, or `tsconfig.json` present anywhere in the repository — plain JavaScript is the actual, observed convention of this codebase. `pipeline/pipeline.md`'s own Stage 4 example uses "Playwright + TypeScript," but that document explicitly frames it as an *illustrative* example ("this has not been explicitly confirmed as the chosen framework going forward" — `SESSION_HANDOFF.md` Open Questions), not a binding instruction — matching the repository's real, observed convention takes precedence over an illustrative example.

## Project Architecture

Page Object Model, with a shared fixture for authenticated-session setup:

```
artifacts/OrangeHRM/runs/RUN-20260706-002/Automation/OrangeHRM_tests/
  playwright.config.js
  pages/
    LoginPage.js
    ForgotPasswordPage.js
    EmployeeListPage.js
    AddEmployeePage.js
    EmployeeDetailPage.js
  fixtures/
    testData.js
    authenticatedPage.fixture.js
  tests/
    login.spec.js
    pim.spec.js
```

## Design Pattern

**Page Object Model** — one class per screen, encapsulating locators and actions; test files contain assertions and orchestration only, never raw selectors. A shared `authenticatedPage` fixture provides a pre-logged-in page for PIM tests, avoiding duplicated login boilerplate across every PIM test case (composition over duplication, per §14).

## Planned Automation Suites

Two suites, organized by business workflow per the Suite Planning Engine (§10), matching the two Manual Test Suite modules:

- **Login Suite** (`tests/login.spec.js`) — all `TC-LOGIN-*` cases. Shared setup: none required beyond navigation (each test starts logged-out, which is the natural starting state). Shared test data: credential sets, boundary-value strings.
- **PIM Suite** (`tests/pim.spec.js`) — all `TC-PIM-*` cases. Shared setup: the `authenticatedPage` fixture (logs in once per test via the API-less UI flow, since PIM requires an authenticated session for every case). Shared components: `EmployeeListPage`'s filter-panel helper, reused by both the Employee List and Add Employee test groups where applicable.

## Existing Assets

None. `artifacts/OrangeHRM/Automation/` (flat path) is empty; this run's own workspace `Automation/` directory is newly created. Per Existing Framework Analysis (§9): no existing test scripts, page objects, components, utilities, fixtures, test data, helpers, folder structure, naming conventions, reporting solution, or build tool were found to reuse. This is a greenfield generation.

## Assets To Generate

- `playwright.config.js` (base URL, test directory, reporter)
- 5 Page Object classes (`LoginPage`, `ForgotPasswordPage`, `EmployeeListPage`, `AddEmployeePage`, `EmployeeDetailPage`)
- 1 shared test-data module (`fixtures/testData.js`) — credentials, boundary-value strings (emoji, SQLi payload, long strings), reused across both suites per the Automation Knowledge Base principle (§11) rather than inlining duplicate literals per test
- 1 shared authenticated-session fixture (`fixtures/authenticatedPage.fixture.js`)
- 2 spec files (`tests/login.spec.js`, `tests/pim.spec.js`)

## Assets To Reuse

None this run (greenfield). This section exists for future runs against this same project, where the Page Objects and fixtures generated here become the reusable knowledge base per §11.

## Estimated Automation Coverage

21 of 25 test cases (84%) are expected to receive "Generate New Automation"; 3 (12%) "Partially Automatable" (the two Exploratory-disposition Findings-derived cases, TC-LOGIN-006 and TC-LOGIN-010, plus the Assumption-based TC-PIM-011 — each has an automatable observation/reproduction component but a human-judgment component that cannot be coded as a fixed assertion); 0 "Reuse Existing Automation" (nothing exists yet to reuse); 0 "Manual Only" (every case has at least a partially automatable component). See the Automation Decision Report for the finalized, per-case breakdown.

## Known Manual Tests

The judgment component of TC-LOGIN-006, TC-LOGIN-010, and TC-PIM-011 (see above) is inherently manual — no code change can make "is this severity/policy discrepancy acceptable" a scriptable assertion. This is expected and intentional, not a gap.

## Blocked Tests

None. Every one of the 25 approved test cases has enough information (Test Data, Steps, Expected Result) to proceed to an Automation Decision.

## Risks

- **Shared public demo instability**: as already documented throughout this project (PRD §14, Project Context §5), the target environment is shared with all internet users of the demo. Automation run against it (Stage 5) may encounter transient failures unrelated to the application itself (e.g., data-count assertions like "(95) Records Found" will drift as other users add/remove records over time). Test data assertions that depend on exact counts are written to tolerate this where feasible (see Code Generation Standards notes in each spec file).
- **Regression tests assert not-yet-fixed behavior**: TC-LOGIN-004, TC-LOGIN-009, TC-PIM-004, and TC-PIM-006 are regression tests written against the *corrected* behavior (per Test Design Agent v2 §5.3) — since the underlying bugs (FINDING-001, 003, 004, 005) are not yet fixed, these automated tests are **expected to fail** when Stage 5 actually runs them. This is by design (per `agents/automation_agent.md`'s inherited philosophy: the agent scripts what was designed, it doesn't only script currently-passing behavior) and must not be misread as an automation defect when Stage 5 reports the failures.

## Assumptions

- Assumes the shared demo's current credentials (`Admin`/`admin123`) remain valid at Stage 5 execution time.
- Assumes no other concurrent process (another user of the shared demo) mutates the specific employee record (`empNumber` 104) used in `TC-PIM-008`/`009`/`010` between this stage and Stage 5 execution — if that employee is later modified/removed by another demo user, those three tests may need a different target record at execution time (flagged here, not silently worked around by hardcoding a fallback).
