# NDC — Automation Summary (Agency, SHAFT, new package) — RUN-20260718-001

Per `agents/automation_agent.md` §25 Standard Output Contract.

## 1. Automation Summary

Run Scope: Agency Module, full v3 Test Design (66 approved cases, `runs/RUN-20260718-001/test_design/NDC_TestCases_Agency.md`). Framework: SHAFT Engine (Java/TestNG/Allure), a new independent package (`NDC_tests_SHAFT_Agency`), per the Consolidated Decision Gate answered at run start (Target=Inside the platform, Framework=SHAFT, Strategy=Start a new package). Outcome: 53/66 cases (80%) received a real TestNG `@Test` method this run (2 Reuse, 43 Generate, 8 Partially Automatable); the remaining 13 are individually accounted for (5 Blocked, 5 Deferred per a new Finding — FINDING-008 — 1 Manual Only, 2 already-Superseded). Live discovery (via `tools/browser_driver`) was performed mid-run to close two prior gaps — Actions column behavior (FINDING-007's open question) and the Update screen — before any code was generated. The package compiles cleanly (`mvn -o clean test-compile` → BUILD SUCCESS).

## 2. Generated Files

See `NDC_AutomationManifest_SHAFT_Agency.md` for the full file-level listing (scaffold reused verbatim, `Agency_Page`/`SearchAgency_Page` extended, `AgencyActions_Page` new, 4 new TestNG classes with 53 `@Test` methods total, extended test data, new `testng.xml`).

## 3. Framework Used

**SHAFT Engine 7.4.20231015** (Java 17 / Maven / TestNG / Allure), per `projects/NDC/automation_framework.md`'s SHAFT package structure — selected via the Framework Decision Gate (human answer, recorded in `NDC_AutomationPlan_SHAFT_Agency.md`), not inferred or defaulted.

## 4. Coverage

53/66 (80%) cases have a real `@Test` method this run. See `NDC_AutomationCoverageReport_SHAFT_Agency.md` for the full breakdown by disposition and by suite.

## 5. Automation Decisions

Reuse: 2. Generate: 43. Partially Automatable: 8. Blocked: 5. Deferred: 5. Manual Only: 1. Superseded/N/A: 2. Full per-case table: `NDC_AutomationDecisionReport_SHAFT_Agency.md`.

## 6. Known Limitations

- **FINDING-008** — the live app does not have a PCC/Airline Supplier Credential section, a "Save as Draft" button, or the detailed Product Access mandatory sub-fields the Test Design describes; also, Actions-column Approve/Reject visibility is a per-status icon toggle, not a Pending-only pair as `ACTIONS-002` literally states. Human-confirmed 2026-07-18 to leave the affected cases Deferred rather than pursue further discovery this run.
- **5 Blocked cases** (Bank Account Details fields, Sales Contact "Designation," document remove/replace) have no live-verified locator anywhere in this project's discovery history. Human-confirmed 2026-07-18 to leave these Blocked rather than pursue further discovery this run.
- **Environment discrepancy** — this package's `TestBase`/`LogIn_Page` target `http://192.168.1.70`, per live user instruction this run, while `projects/NDC/browser/profile.json` and FINDING-001 (2026-07-13) document `.80` as the resolved STG host. The two are confirmed-independent datasets. Needs human reconciliation before this package is treated as the project's standing Agency automation — see Automation Plan Risk #1.
- **8 Partially Automatable cases** assert only the live-evidence-backed portion of their scenario; the remainder (e.g., exact length-limit judgment, Update screen's own Approve/Reject buttons specifically) stays manual — see the Decision Report for each one's specific narrowing.
- **PrimeNG dropdown read-back quirk** — Branch/State/City/Invoice-generation fields' proxy `<input>` reads back empty even with a real selection; UPDATE-001 deliberately does not assert these.

## 7. Execution Instructions

```
cd projects/NDC/runs/RUN-20260718-001/automation/NDC_tests_SHAFT_Agency
mvn -o clean test-compile   # verify compilation (already run, BUILD SUCCESS)
mvn -o test                 # runs testng.xml's 4 suites (Create/Search/Actions/Update) against http://192.168.1.70
```

Prerequisites: `projects/NDC/credentials/credentials.json` must exist locally (git-ignored, not created by this agent) with a valid Admin credential for `.70`; Maven's local repository must already have the SHAFT Engine 7.4.20231015 artifact cached (confirmed present this run, offline build succeeded). Chrome must be installed (SHAFT's `DriverFactory` launches `channel: chrome`). No environment variables are required beyond the credentials file.

## 8. Inputs for Execution Agent

| `agents/execution_agent.md` §4 input | Present? |
|---|---|
| Automation Suite (`NDC_tests_SHAFT_Agency/`) | Yes — this run's `automation/NDC_tests_SHAFT_Agency/` folder, compiles cleanly |
| Automation Coverage Summary (`NDC_AutomationSummary_SHAFT_Agency.md`) | Yes — this document |
| Project Context (environment, credentials, safety constraints) | Unchanged pass-through — Execution reads `projects/NDC/workspace/context/NDC_ProjectContext_Agency.md` directly; this agent did not modify it |
| Execution Mode | Not this agent's concern — Execution Agent sources it directly |
| Execution scope | Not this agent's concern — an Execution-time parameter |

**Flag for whoever runs Execution next:** confirm which host (`.70` or `.80`) Execution should actually target before running this suite for real — see Known Limitations above.
