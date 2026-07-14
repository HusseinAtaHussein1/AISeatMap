# NDC — Execution Results — RUN-20260712-001

## 1. Execution Metadata

| Field | Value |
|---|---|
| Execution ID | EXEC-20260712-001-001 (initial), EXEC-20260712-001-001-REPAIR (repair rerun, same day) |
| Run Scope / Run Type | Feature · Custom scope description · Observation-based Spike (Project Context v2) |
| Environment | Shared staging, `http://192.168.1.70` (read-only for app data; login itself is the feature under test) |
| Framework | SHAFT Engine 7.4.20231015 / Java 17 / Maven / TestNG (`NDC_tests_SHAFT`) |
| Execution Mode | **Headed** (per user decision, 2026-07-12 — recorded in `run_configuration.md`) |
| Concurrency Mode | Sequential (`setParallel=NONE`, `setThreadCount=1`) |
| Retry Policy | None configured — each test ran exactly once per execution (repair rerun is a separate, explicit execution, not an automatic retry) |
| Started / Finished (initial) | 2026-07-12 11:28:55 → 11:32:41 (~3m 46s) |
| Started / Finished (repair rerun, 5 tests only) | 2026-07-12 ~12:22 → 12:25:03 (~3m) |

## 2. Execution Summary

All 8 approved Login test cases (TC-LOGIN-001–008) were executed live for the first time, headed Chrome, against the shared staging environment. Initial result: 3 Passed, 5 Failed (4 Automation Failure, 1 Inconclusive) — **0 Application Failures**. Two Automation Repair Loop passes followed (`agents/execution_agent.md` §25–§26); see `NDC_AutomationRepairReport.md` for full detail. **Final state: all 8 test cases confirmed working — 3 clean Passed, 5 Automation Repaired. 0 outstanding Automation Failures, 0 Application Failures.**

## 3. Health Summary (§25.6 — never a single merged "Failed" count)

| Health | Figure | Basis |
|---|---|---|
| **Application Health** | **8/8 (100%)** — no evidence of any application defect | 0 `Application Failure` classifications across every execution. Every failure traced to the automation, never to NDC's live behavior. |
| **Automation Health** | **8/8 (100%) confirmed working** | TC-LOGIN-001/003/005/006: `Automation Failure` → `Automation Repaired` (1st repair pass). TC-LOGIN-002: `Automation Failure` → `Inconclusive`-turned-`Automation Failure` → `Automation Repaired` (2nd repair pass, diagnosis-first per §26.0). TC-LOGIN-004/007/008: clean `Passed`, no repair needed. |
| **Environment Health** | **Nominal** | 0 `Environment Failure`/`Infrastructure Failure`/`Configuration Failure` across all three executions. |

`Inconclusive`/`Flaky`: 0 remaining.

## 4. Execution Results (per test, final state)

| Test Case ID | Automation Script | Final Status | Detail |
|---|---|---|---|
| TC-LOGIN-001 | `validLoginRedirectsToDashboard` | **Automation Repaired** | Fixed by polling for the page title to contain "Dashboard" instead of asserting immediately after click. |
| TC-LOGIN-002 | `invalidCredentialsShowGenericMessage` | **Automation Repaired** | 2 repair passes. 1st attempt failed due to a Java `catch (Exception e)` not catching SHAFT's `AssertionError`. A Diagnosis Strategy (DOM snapshot at 1/3/5/7/10s) then revealed the real root cause: the `aria-label`-based locator never matched the real element, even while the message text was plainly present (and auto-dismissed by ~7s). Fixed by switching to a text-content-based locator + a raw presence check. Confirmed passing on rerun. |
| TC-LOGIN-003 | `emptyUsernameAndPasswordBlocked` | **Automation Repaired** | Fixed — expected text corrected to "Required". |
| TC-LOGIN-004 | `passwordFieldIsMasked` | Passed | Clean pass, first attempt. |
| TC-LOGIN-005 | `emptyUsernameOnlyBlocked` | **Automation Repaired** | Fixed — expected text corrected to "Required". |
| TC-LOGIN-006 | `emptyPasswordOnlyBlocked` | **Automation Repaired** | Fixed — expected text corrected to "Required". |
| TC-LOGIN-007 | `loginButtonHasLoadingIndicatorAttribute` | Passed | Clean pass, first attempt. |
| TC-LOGIN-008 | `wrongPasswordForRealUsernameShowsSameGenericMessage` | Passed | Clean pass, first attempt — anti-enumeration property holds. |

## 5. Evidence Inventory

| Test Case | Evidence | Path |
|---|---|---|
| TC-LOGIN-002 | Failure screenshot (initial run, auto-captured) | `evidence/TC-LOGIN-002_failure_blank_form.png` |
| All (initial) | Raw execution log, Surefire/Allure results | `../automation/NDC_tests_SHAFT/target/` (cleared after each run — not committed; see `.gitignore`) |
| Repair rerun | `testng-repair.xml` (method-filtered suite used for the targeted rerun) | `../automation/NDC_tests_SHAFT/testng-repair.xml` |

No evidence gaps — every non-Passed result has a precise log-timestamp trail and/or screenshot sufficient to explain it.

## 6. Execution Statistics

- Initial execution: Total 8 · Passed 3 · Failed 5 (4 Automation Failure, 1 Inconclusive) · 0 Application/Environment/Infrastructure/Configuration Failure
- Repair rerun #1: Total 5 (targeted) · Passed 4 · Failed 1 (TC-LOGIN-002)
- Diagnosis pass (TC-LOGIN-002, read-only, no test execution): DOM/console/network capture, 5 timestamped samples
- Repair rerun #2: Total 1 (targeted) · Passed 1
- Retry count: 0 (each rerun is a distinct, human-approved execution, not an automatic retry) · Flaky count: 0

## 7. Automation Repair Loop Outcome (§25–§26)

Triggered (4 `Automation Failure` results from the initial execution). Repair pass #1: 4/4 fixed (`Automation Repaired`), 1 additional item (TC-LOGIN-002, `Inconclusive`) included by explicit request but not resolved — root cause only partially understood at that point (a real code bug, but not why the element was absent). Per the new Root Cause Confidence gate (§26.0), TC-LOGIN-002 was classified **Medium** confidence, not High — a Diagnosis Strategy ran before any second repair attempt, per platform rule (never repair on a Medium-confidence guess). The diagnosis identified the true root cause (wrong locator, not a timing gap), which raised confidence to High; repair pass #2 then fixed it, confirmed by rerun. Full detail, both Repair Confidence Reports, and the Before/After comparisons: **`NDC_AutomationRepairReport.md`**. Final outcome: **8 Fixed/Passed, 0 Remaining Failures, 0 New Failures.**

New Knowledge Base rules written (execution-confirmed only, `knowledge_base/AUTOMATION_REPAIR_KB.md`): **AUTO-RULE-001** (SPA redirect timing), **AUTO-RULE-002** (stale assumed text from a secondary source), **AUTO-RULE-003** (transient toast + wrong locator + framework-internal-wait pitfall).

## 8. Known Limitations

- The Test Case document (`NDC_TestCases_Login.md`) still states the Reference Project's original "Username/Password is required" text — deliberately not changed by this repair (out of scope per §25.3 rule 4) — so the Test Case doc and the now-repaired automation intentionally disagree on this one string pending a separate, explicit Test Design correction.
- The Reference Project's own `Btn_RememberMyInfoNextTime` locator and `ClickSuperAdmin()`/`ClickAdmin()` hardcoded-credential methods (not reused here) remain unaddressed in that external repository — flagged, not fixed, per its read-only-by-default status.

## 9. Execution Recommendations

1. Correct `NDC_TestCases_Login.md`/`.xlsx` and `NDC_TraceabilityMatrix.md` to state "Required" instead of "Username/Password is required" — an explicit Test Design update, deliberately not done automatically by this repair.
2. Flag to the Reference Project's maintainers that its own `LogIn_TC.java` asserts the same stale "Username/Password is required" text, and that its `Btn_RememberMyInfoNextTime` locator targets a removed element.
3. Consider investigating the `.../odeysysadmin/Admin2/loginAction` API route observed during TC-LOGIN-002's diagnosis (the real account's username appears embedded in the login endpoint path regardless of the username submitted) — noted as an interesting observation, not evaluated for security impact by this run.
4. This Login automation package (`NDC_tests_SHAFT`) is now validated end-to-end: 0 Application Failures, 0 outstanding Automation Failures, 8/8 test cases confirmed working.

## 10. Inputs for Reporting Agent

- Execution Results: this document
- Automation Repair Report: `NDC_AutomationRepairReport.md`
- Automation Summary: `../automation/NDC_AutomationSummary_SHAFT.md`
- Test Design: `../test_design/NDC_CoverageReport.md`, `NDC_TestCases_Login.md`, `NDC_LoginGapAnalysis.md`
- Discovery: `../discovery/QA_Assessment_Report.md`, `Login_Screen.md`, Findings (`FINDING-NDC-LOGIN-001`, `FINDING-NDC-LOGIN-002`)
- Project Context: `../context/NDC_ProjectContext.v2.md`
- Evidence: `evidence/`
