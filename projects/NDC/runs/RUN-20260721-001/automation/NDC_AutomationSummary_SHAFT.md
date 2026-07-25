# NDC — Automation Summary — RUN-20260721-001 — SHAFT

Structured per `.claude/skills/automation-agent/SKILL.md` §25 Standard Output Contract.

## 1. Automation Summary

Run Scope: User Story / Pasted text (`Create-Role.md`) — Admin → Role Management → Create Role. Framework: SHAFT (Java 17/Maven/TestNG), continuing the existing `tests_SHAFT` package (Target: Export, Reference-Project-compatible). Outcome: 13 of 22 approved test cases fully automated (Generate), 1 Partially Automatable (a deliberately mutation-safe design), 8 Manual Only (6 assumption-based per Test Design, 2 Exploratory charters per Finding disposition). Compilation verified — BUILD SUCCESS.

## 2. Generated Files

See `AutomationManifest_SHAFT.md` — 2 new Java files (`Role_Page.java`, `Role_TC.java`), 1 new JSON test-data file (`roleTestData.json`), 1 extended file (`AdminMenu.java`, additive only). All existing Login/Branch/Agency/Staff assets untouched.

## 3. Framework Used

SHAFT Engine, per the consolidated Decision Gate answered explicitly this run (`AutomationPlan_SHAFT.md`) — Automation Target = Export/Reference-Project-compatible, Framework = SHAFT, Strategy = Continue `tests_SHAFT`.

## 4. Coverage

59.1% Generate, 4.5% Partially Automatable, 36.4% Manual Only, 0% Uncovered. See `AutomationCoverageReport_SHAFT.md` for the full breakdown.

## 5. Automation Decisions

13 Generate, 1 Partially Automatable, 8 Manual Only, 0 Reuse — full per-case reasoning in `AutomationDecisionReport_SHAFT.md`.

## 6. Known Limitations

- **Row-scoped permission-checkbox locator not yet independently confirmed live through SHAFT's own Selenium binding** — this run's own Discovery used a raw Playwright mouse-event workaround (`platform_core/tools/browser_driver`), not SHAFT. Stage 5 is this locator's first live test (affects TC-ROLE-013 through 016).
- **`AdminMenu.Btn_Role` (new this run) is likewise not yet independently confirmed live via SHAFT** — deliberately authored as a text-match locator (`//span[normalize-space()='Role']`) rather than reusing the Reference Project's own positional equivalent, per FINDING-004's tier-dependent-list risk, but this specific locator's live behavior is untested until Stage 5.
- **No test in this suite completes a real Role save** — by design, since mutation is not authorized this run (Project Context §5). TC-ROLE-001/010 assert pre-submission validation signals only; a true end-to-end positive test needs a future mutation-authorized run (no new Page Object work required, only a new test method on the existing `Role_Page`).
- **8 test cases deliberately not automated this run** — 6 assumption-based (Test Design's own disposition, behavior not independently verified in Discovery) and 2 Exploratory charters (Finding disposition, FINDING-001/FINDING-004) — see Coverage Report for named reasons.
- **The Reference Project's own, pre-existing `Role_Page.java`/`Role_TC.java` were inspected but not reused as-is** — their scope (create-role-then-create-staff-then-login-and-verify, real data persisted) doesn't fit this run's read-only environment constraint or this run's specific 22 approved test cases; their proven locators (`txt_RoleName`, `formcontrolname` attributes) were reused, their fragile tab/index-based methods were not.

## 7. Execution Instructions

From `platform_core_data/runs/RUN-20260712-001/automation/tests_SHAFT/`:
```
mvn -o clean test-compile   # verify compilation only, already confirmed 2026-07-21
mvn -o test                 # runs the full testng.xml — add Role_TC to testng.xml's suite
                             # definition first if a Role-only run is wanted (not yet added
                             # this run — Stage 5's own scoping decision)
```
No new environment variables/config required beyond what the Login run already established (`platform_core_data/credentials/credentials.json`, read automatically by `CredentialsLoader`/`AdminTestBase`).

## 8. Inputs for Execution Agent

- This automation package: `platform_core_data/runs/RUN-20260712-001/automation/tests_SHAFT/` (continued in place)
- Manual Test Suite / Traceability Matrix / Coverage Report: `platform_core_data/workspace/test_design/Role/`
- Discovery Artifacts + Findings: `platform_core_data/runs/RUN-20260721-001/discovery/`
- Project Context: `platform_core_data/workspace/context/ProjectContext_Role.md`
- **Before executing:** confirm whether Stage 5 should scope to Role tests only (a new `testng-role-only.xml`, matching this package's existing per-scope XML precedent, e.g. `testng-branch-payment-method.xml`) or run the full suite; confirm mutation authorization is still not granted before any test attempting a real save is added in a future run.
