> **Status:** Pending Automation Approval (Stage 4 checkpoint, `pipeline/pipeline.md` §5.2) — submitted together with Stages 1–3 for a single combined review, per this run's Spike nature.
> **Run:** RUN-20260712-001, Stage 4 (Automation Agent v3).

# Automation Plan — NDC (Login / Authentication)

## Target Framework

**Playwright**, driven through **SHAFT-structured** Page/Locator/Test/Data layers per `projects/NDC/automation_framework.md` (mandatory, project-wide — Framework Configuration is explicit, so §7 Rule 1 applies; no criteria-based selection needed).

Justification: `automation_framework.md` mandates the SHAFT **structure** (Pages Layer, Locators Layer with prefix naming, Tests Layer, JSON-driven Data Layer) — it does not mandate a specific language/runner. Per §7 Rule 2 ("reuse an existing framework already in the project"), this repository already has Playwright (`^1.61.1`, root `package.json`) as its one and only browser-automation dependency, already used by `tools/browser_driver/` (Stage 2 tooling) and by OrangeHRM's own prior automation run (`projects/OrangeHRM/artifacts/runs/RUN-20260706-002/automation/`). Introducing Java/TestNG/SHAFT-the-library would add a second, competing toolchain with zero existing foothold in this repository — exactly what §7 Rule 2 forbids without an explicit human decision to migrate. Playwright + the mandated SHAFT structure satisfies both the project's explicit framework mandate and the "reuse what exists" rule simultaneously.

## Target Language

**JavaScript** (CommonJS) — matches the repository's own convention (`package.json`: `"type": "commonjs"`, no TypeScript anywhere in the repo).

## Project Architecture

SHAFT-structured Page Object Model — one Page class + one Locators class per screen, Tests calling Page methods only, Data in JSON:

```
projects/NDC/artifacts/runs/RUN-20260712-001/automation/NDC_tests/
  playwright.config.js
  pages/
    LoginPage.js
  locators/
    LoginLocators.js
  tests/
    login.spec.js
  data/
    loginTestData.json
```

## Design Pattern

Page Object Model, SHAFT-structured per `projects/NDC/automation_framework.md`:
- **Pages Layer** (`pages/LoginPage.js`) — UI-interaction methods only (`navigate()`, `login(username, password)`, `getErrorMessage()`, `isOnDashboard()`). No locators, no assertions, no business logic.
- **Locators Layer** (`locators/LoginLocators.js`) — one class, one method per locator, prefixed per the mandatory naming table (`Txt_Username`, `Txt_Password`, `Btn_Login`, `Txt_ErrorMessage`, `Txt_DashboardSignal`). The "Forgot Password?" link (confirmed present during Discovery, `discovery/Login_Screen.md`) has no locator here — the flow is explicitly out of scope this run (Project Context v2 §3), so no locator was generated for it, avoiding both dead code and the need to extend the mandatory prefix table (which has no `Link` element type) for something not actually automated.
- **Tests Layer** (`tests/login.spec.js`) — flow + assertions only, calling `LoginPage` methods, reading test data from the Data Layer — no locators, no hardcoded strings.
- **Data Layer** (`data/loginTestData.json`) — the non-existent probe username/password and expected message text; the one real valid-credential case reads from `projects/NDC/credentials/credentials.json` at run time (never duplicated into this JSON file, per the credentials-handling contract).

## Planned Automation Suites

One suite, per the Suite Planning Engine (§10) — a single business workflow (Login):
- **Login Suite** (`tests/login.spec.js`) — all `TC-LOGIN-*` cases. Shared setup: none required beyond navigation (every case starts logged-out, the natural starting state for this screen).

## Existing Assets

None. `projects/NDC/artifacts/automation/` (flat path) is empty — this is NDC's first-ever Automation Agent run. Per Existing Framework Analysis (§9): no existing test scripts, page objects, fixtures, or config found to reuse anywhere in the project. This is greenfield generation. (`tools/browser_driver/` was inspected and is a *Discovery*-stage tool, not a Stage 4 automation asset — reused only as a naming/convention reference, not as code.)

## Assets To Generate

- `playwright.config.js` (base URL from Project Context v2, test directory, reporter)
- 1 Locators class (`LoginLocators`)
- 1 Page Object class (`LoginPage`)
- 1 Data file (`loginTestData.json`)
- 1 spec file (`login.spec.js`) covering TC-LOGIN-001, 002, 003

## Assets To Reuse

None this run (greenfield). This section exists for NDC's future automation runs, where `LoginPage`/`LoginLocators` become the reusable knowledge base per §11.

## Estimated Automation Coverage

3 of 3 approved test cases (100%) are expected to receive "Generate New Automation" — see the caveat on TC-LOGIN-003 below (Known Manual Tests / Coverage Report §7 Assumption). 0 "Reuse Existing Automation" (nothing exists yet). 0 "Partially Automatable" / 0 "Manual Only" at plan time — finalized per-case in the Automation Decision Report.

## Known Manual Tests

None outright — but TC-LOGIN-003's expected result carries an unverified assumption (empty-field behavior not independently re-observed in Discovery, per Coverage Report §7). The generated test encodes the assumption explicitly in its own comments/title rather than asserting it as unquestioned fact.

## Blocked Tests

None. All 3 approved test cases have sufficient Test Data/Steps/Expected Result to proceed to an Automation Decision.

## Risks

- **Shared staging environment**: as documented in Project Context v2 §5, this is not an isolated environment. The generated suite performs exactly one invalid-login attempt using a fabricated, non-existent username (never a real shared credential) — consistent with the manual test design — so repeated Stage 5 executions carry no cumulative lockout risk against a real account.
- **FINDING-NDC-LOGIN-001 (cross-host redirect)**: the valid-login assertion is written against the profile's documented success signal (`text=Dashboard`), not a specific URL/host, so it remains stable regardless of how that Finding is eventually resolved (per Coverage Report §9 Risk).
- **TC-LOGIN-003 assumption**: if the empty-field behavior turns out to differ from what's assumed once Stage 5 actually runs it, that is a Test Design input to revisit, not an Automation Agent defect — flagged here for visibility.

## Assumptions

- Assumes the existing NDC STG credential (`projects/NDC/credentials/credentials.json`) remains valid at Stage 5 execution time.
- Assumes `browser/profile.json`'s selectors (`#id-Username`, `#id-Password`, submit button text "Login", success text "Dashboard") remain the live, correct selectors — confirmed directly during this run's own Stage 2 Discovery (2026-07-12), not stale.
