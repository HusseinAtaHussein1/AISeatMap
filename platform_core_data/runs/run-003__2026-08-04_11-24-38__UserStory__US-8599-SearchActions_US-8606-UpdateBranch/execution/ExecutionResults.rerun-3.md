# Execution Results — run-003__2026-08-04_11-24-38__UserStory__US-8599-SearchActions_US-8606-UpdateBranch (rerun-3)

**Note on cycle labelling:** a Stage `5A` **direct invocation** (`/automation-execution-skill`, scoped to Create Branch / US-8605), not a Stage `5H` healing rerun. Filed as `rerun-3` following `ExecutionResults.md` (cycle 1), `ExecutionResults.rerun-1.md` (Stage 5H), and `ExecutionResults.rerun-2.md` (Stage 5A confirmation) — none of which is touched by this file.

## 1. Execution Metadata

| Field | Value |
|---|---|
| Execution ID | EXEC-BR-20260806-01 |
| Run Folder | `run-003__2026-08-04_11-24-38__UserStory__US-8599-SearchActions_US-8606-UpdateBranch` |
| Execution cycle | 4 (Stage 5A direct invocation) |
| Modules executed | branch |
| Module scope | single |
| Run Scope Type / Run Type | User Story (US-8605 Create Branch) / Partial Suite |
| Environment | Staging (STG) — shared, internal/LAN. Reachability confirmed before execution (`HTTP 200` on `http://192.168.1.70`) |
| Target URL | `http://192.168.1.70` |
| Framework | SHAFT Engine 7.4.20231015 (Java) / TestNG, per `AutomationSummary_SHAFT.md` §3 |
| Suite executed | `platform_core_data/modules/branch/automation/tests_SHAFT/` (module working copy, per module-scoped execution rules — never the merged baseline), scoped to `CreateBranch_Admin_TC` (all 13 Create Branch methods) |
| Scope mechanism | `-Dsurefire.suiteXmlFiles=<scratchpad>/testng-createbranch.xml` — a scoping-only suite file held **outside** the automation package, so the approved `testng.xml` was not modified by this stage. Copy preserved as `artifacts/exec-0806/testng-createbranch-scope.xml` |
| Execution Mode | Headed (`execution.properties` → `headlessExecution=false`; matches the Headed mode recorded in `knowledge_base/run_configuration.md` and used by cycle 3). **Note:** the *committed* value of that key is `headlessExecution=true` — the working tree carried an uncommitted change to `false` before this execution began, and this stage did not modify it. The mode recorded here is what actually ran |
| Concurrency Mode | Sequential (default — shared STG environment) |
| Retry Policy | No automatic retry (default — none configured) |
| Command | `mvn test -Dsurefire.suiteXmlFiles=... -Drp.endpoint=http://localhost:8080 -Drp.enable=false` (the ReportPortal flags are the documented workaround in `AutomationSummary_SHAFT.md` §7) |
| Started | 2026-08-06T10:04:07+03:00 |
| Ended | 2026-08-06T10:08:36+03:00 |

## 2. Execution Summary

All 13 Create Branch test cases executed, none skipped or blocked: **11 Passed, 2 Failed** (TestNG: `Tests run: 13, Failures: 2, Errors: 0, Skipped: 0`, total 4 min 16 s). Of the two failures, **TC-BR-026 is an expected `Application Failure`** — the still-open FINDING-004 (Warning Prompt (Days) not capped at 11 digits) — and **TC-BR-001 is an `Automation Failure`**: the happy-path submission was rejected by the application's own field validation because the suite's shared `fillMandatoryBaseline` fixture does not leave the form in a submittable state. The post-submit DOM captured 11 `Required` errors, and the console log records **70 unresolved `//li[normalize-space(.)='EgyptUAT']` lookups** across the run — meaning the Operating Country → State → City cascade silently never commits, since SHAFT 7.4 logs that miss as a `WARN` instead of failing the step. Separately, the Product Access grid's **Credential Name** dropdown — mandatory once a supplier row is checked — has no page-object method at all, so the checked row is never completed. This execution modified no automation code.

## 3. Execution Results

| Test Case ID | Automation Script ID | Status (§17) | Execution Time | Attempts | Failure Detail | Evidence Refs |
|---|---|---|---|---|---|---|
| TC-BR-001 | `CreateBranch_Admin_TC::tcBr001_createBranchWithAllMandatoryFields` | **Automation Failure** | 8.300 s | 1 | `AssertionError: Expected the Branch to be saved with status "Pending for approval."` (`AddBranch_Page.java:520`, via `CreateBranch_Admin_TC.java:39`). The browser stayed on `/admin/branch/add`. The test's own `[DIAG8]` probes captured the reason: `errors=Required ×10 ~ FlightOthers`, and `emptyFields=Address 2 \| Service Tax Number \| ABTA Number \| Email Password * \| Name* \| Email ID* \| Phone Number * \| Enter Target Amount \| Reaching Percentage \| Warning Prompt(Days) \| id-supplier-180 … (15 supplier-row inputs)`. See §9 REC-01…REC-04 for the four distinct contributing causes | `artifacts/exec-0806/maven-console.log` L279-281 (DIAG8), L3604-3630 (stack trace); `artifacts/exec-0806/allure/` |
| TC-BR-002 | `CreateBranch_Admin_TC::tcBr002_mandatoryBranchDetailsFieldsBlockSubmissionWhenEmpty` | Passed | 57.460 s | 1 | — (see §8 KL-01 — passes on a weak assertion) | `artifacts/exec-0806/allure/` |
| TC-BR-004 | `CreateBranch_Admin_TC::tcBr004_countryAutoFillsFromOperatingCountry` | Passed | 1.867 s | 1 | — | `artifacts/exec-0806/allure/` |
| TC-BR-013 | `CreateBranch_Admin_TC::tcBr013_mandatoryEmailConfigFieldsBlockSubmissionWhenEmpty` | Passed | 15.514 s | 1 | — (see §8 KL-01) | `artifacts/exec-0806/allure/` |
| TC-BR-021 | `CreateBranch_Admin_TC::tcBr021_mandatorySalesConfigFieldsBlockSubmissionWhenEmpty` | Passed | 25.625 s | 1 | — (see §8 KL-01) | `artifacts/exec-0806/allure/` |
| TC-BR-024 | `CreateBranch_Admin_TC::tcBr024_reachingPercentageRejectsValueGreaterThan100` | Passed | 0.265 s | 1 | — | `artifacts/exec-0806/allure/` |
| TC-BR-025 | `CreateBranch_Admin_TC::tcBr025_reachingPercentageAcceptsThreeDecimalPlaces` | Passed | 0.255 s | 1 | — | `artifacts/exec-0806/allure/` |
| TC-BR-026 | `CreateBranch_Admin_TC::tcBr026_warningPromptRejectsValueExceeding11Digits` | **Application Failure** | 0.287 s | 1 | `AssertionError: Warning Prompt (Days) should be capped at 11 digits, but retained 15 characters: "999999999999999" (FINDING-004, still open)` (`AddBranch_Page.java:360`, via `CreateBranch_Admin_TC.java:153`). **Expected failure, disclosed in advance** by `AutomationSummary_SHAFT.md` §6 — the test asserts the requirement, the application does not meet it. Must not be "repaired" into passing | `artifacts/exec-0806/maven-console.log` L3632-3678 |
| TC-BR-028 | `CreateBranch_Admin_TC::tcBr028_selectAtLeastOnePaymentOption` | Passed | 0.215 s | 1 | — | `artifacts/exec-0806/allure/` |
| TC-BR-030 | `CreateBranch_Admin_TC::tcBr030_descriptionEnabledOnlyWhenSupplierRowSelected` | Passed | 0.941 s | 1 | — | `artifacts/exec-0806/allure/` |
| TC-BR-037 | `CreateBranch_Admin_TC::tcBr037_createBranchWithValidOutstandingThreshold` | Passed | 0.216 s | 1 | — | `artifacts/exec-0806/allure/` |
| TC-BR-038 | `CreateBranch_Admin_TC::tcBr038_outstandingThresholdBlocksSubmissionWhenEmpty` | Passed | 6.614 s | 1 | — (see §8 KL-01) | `artifacts/exec-0806/allure/` |
| TC-BR-039 | `CreateBranch_Admin_TC::tcBr039_outstandingThresholdAcceptsNumericValue` | Passed | 0.224 s | 1 | — | `artifacts/exec-0806/allure/` |

**Not executed by this scope (stated, not silently absent):** `SearchBranch_TC`, `UpdateBranch_TC` — out of this invocation's US-8605 scope. `BranchActionsSuite` could not have been executed by any invocation this cycle: see §8 KL-02.

## 4. Evidence Inventory

| Evidence Type | Captured? | Location / Reason |
|---|---|---|
| Execution Logs | Yes | `artifacts/exec-0806/maven-console.log` — full Maven + SHAFT console output, 3 705 lines |
| Framework Reports | Yes | `artifacts/exec-0806/ExecutionSummaryReport_06-08-2026_10-08-35-0225-AM.html` (SHAFT execution summary); `artifacts/exec-0806/allure/` — 145 raw Allure result/container/attachment files for this execution only |
| Screenshots | Yes | Inside `artifacts/exec-0806/allure/` as `*-attachment.png` (SHAFT attaches per-step and on failure); not individually renamed, since Allure keys them by UUID |
| Failure Artifacts | Yes | Stack traces in `artifacts/exec-0806/surefire/TEST-*.xml` and in the console log; the in-test `[DIAG8]` DOM probes (error labels + empty-field labels) for TC-BR-001 |
| Test Runner Reports | Yes | `artifacts/exec-0806/surefire/` — 2 JUnit-format XML reports |
| Scoping input | Yes | `artifacts/exec-0806/testng-createbranch-scope.xml` — exactly what was handed to Surefire |
| Videos | No | SHAFT 7.4 session recording not enabled in `execution.properties` for this project |
| Execution Traces | No | Not a capability of this framework/version (Selenium-backed, no trace/replay artifact) |
| Console Logs (browser) | No | Not captured — browser log collection not enabled in this project's SHAFT configuration |
| Network Logs / HAR | No | Not captured — not enabled; this is a UI-only suite |

## 5. Execution Statistics

| Metric | Value |
|---|---|
| Execution Duration | 4 min 16 s (wall clock, Maven-reported) |
| Tests in scope / executed | 13 / 13 |
| Pass Rate | 11/13 = **84.6%** (denominator = executed; nothing Skipped/Blocked/Not Executed) |
| Failure Rate (Application) | 1/13 = **7.7%** (TC-BR-026 only) |
| Skip Rate | 0/13 = 0% |
| Retry Count | 0 |
| Evidence Count | 149 files (145 Allure + 2 Surefire XML + 1 framework HTML + 1 console log), plus the scoping XML |
| Framework | SHAFT Engine 7.4.20231015 / TestNG |
| Execution Mode | Headed |
| Environment | Staging (STG), `http://192.168.1.70` |
| Coverage Summary (cited, not recomputed) | 13/13 in-scope Create Branch cases automated = 100%, per `AutomationCoverageReport_SHAFT.md` |
| Flaky Test Count | 0 |
| Execution Stability | 0/13 = 0% flaky |

**Cross-cycle note (not a metric):** cycle 3 (`ExecutionResults.rerun-2.md`) recorded TC-BR-001 as `Inconclusive` (20 s timeout on `button[routerlink='add']`). This cycle it reached the assertion and failed with a diagnosable cause. That is a change in *how far the test got*, not a flaky outcome within this execution — TC-BR-001 has never Passed.

## 6. Health Summary

| Figure | Count | What it means |
|---|---|---|
| **Application Health** | **1 failure** — TC-BR-026 | The only figure about the application itself. It is a **known, previously-recorded open defect** (FINDING-004), not a new regression. Every other application behaviour this scope exercised behaved as asserted |
| **Automation Health** | **1 failure** — TC-BR-001, plus 1 non-executable suite declaration (§8 KL-02) | Suite-quality problems, not application problems: the shared baseline fixture does not produce a submittable form, and `testng.xml` declares a class that does not exist |
| **Environment Health** | **0 failures** | STG reachable (`HTTP 200`), Super Admin login succeeded on every one of the 13 tests, no infrastructure or configuration failure |
| Inconclusive / Flaky | 0 / 0 | Neither folded into any figure above |

## 7. Self-Healing Availability

```
  1 Automation Failure recorded. Self-healing is available but never automatic:
      /self-healing-skill            analyse every Automation Failure
      /self-healing-skill branch     scope the pass to named modules
```

Naming the option is not invoking it and is not a recommendation to invoke it. **TC-BR-026 is explicitly out of scope for any healing pass** — it is an `Application Failure` asserting a requirement the application does not meet (FINDING-004); repairing it would silence a genuine defect.

## 8. Known Limitations

| ID | Limitation |
|---|---|
| KL-01 | **The 4 "leave one field empty" cases (TC-BR-002 / 013 / 021 / 038) pass on a weak assertion.** `assertSubmissionBlocked()` only checks that the URL still contains `/admin/branch/add`. Because the shared `fillMandatoryBaseline` fixture leaves *other* mandatory fields empty (see §9 REC-01…REC-04), submission is blocked regardless of the field each case intends to test. Their green results therefore do **not** evidence that the field under test is the blocking one, and do not evidence that the baseline fill works. This is a confidence gap in the suite, not a failure of this execution |
| KL-02 | **`testng.xml` declares a class that does not exist in the project:** `AdminPages.Admin.Branch.BranchActions_TC` (`testng.xml` → `BranchActionsSuite`). Only `BranchProvisioner`, `CreateBranch_Admin_TC`, `SearchBranch_TC`, `UpdateBranch_TC` exist under that package. A run through the approved `testng.xml` cannot load the suite; this execution ran a scoping-only suite file held outside the package, which is why it was unaffected. Not caused by this run, and not fixed by this stage |
| KL-03 | **`AutomationSummary_SHAFT.md` §7 is out of date about credentials.** It states `BRANCH_QA_USERNAME` / `BRANCH_QA_PASSWORD` environment variables are required and that credentials are "never committed." `utilities/EnvironmentConfig.java:56-57` now hardcodes both, and they are committed to the repository. Neither variable was set in this execution's shell, and every login still succeeded — confirming the file, not the environment, is the credential source. Recorded here as a factual handoff discrepancy (and a secret-in-repo exposure); changing either the code or the document is not this stage's action |
| KL-04 | TC-BR-035 (submit-button label) and the GDS-conditional PCC sub-grid remain outside this suite's scope, as already disclosed upstream |

## 9. Execution Recommendations

Smallest corrective action per finding (§20). **No code was modified by this stage.**

| ID | Applies to | Observed evidence | Recommended smallest action |
|---|---|---|---|
| REC-01 | TC-BR-001 — Operating Country / State / City cascade | 70 occurrences of `NoSuchElementException: //li[normalize-space(.)='EgyptUAT']` in the console log. SHAFT 7.4 logs the miss as `WARN` + `InvocationTargetException` and execution continues, so `selectOperatingCountry()` reports success while selecting nothing. Post-submit `Country` therefore never auto-fills and State/City stay empty | Re-verify the Operating Country autocomplete against live STG: whether `EgyptUAT` is still valid master data (`AutomationPlan_SHAFT.md` ASM-AUTO-2 flags exactly this risk), and whether the filtered panel still renders options as `<li>`. Then make the selection **fail loudly** instead of silently. Diagnosis + repair belong to `/self-healing-skill`, not to this stage |
| REC-02 | TC-BR-001 — Product Access grid | `[DIAG8] errors` includes `FlightOthers`, and 15 `id-supplier-*` inputs are empty. `fillMandatoryBaseline()` (`AddBranch_Page.java:469-472`) checks the first supplier row and fills its **Description** only. The grid's **Credential Name** dropdown — mandatory once a row is checked — has **no page-object method anywhere in the project**. `DiscoverySnapshot_CreateBranch.md:63` already recorded it as *"Not exercised — no supplier row was selected this run"*, so no selector for it was ever verified | Add a Credential Name selection step to the checked supplier row (selector needs live verification first, since Discovery never exercised it). Until then, no happy-path submission can succeed |
| REC-03 | TC-BR-001 — Branch Sales Configuration | `[DIAG8] emptyFields` includes `Enter Target Amount`, `Reaching Percentage`, `Warning Prompt(Days)`, all reported `Required` by the application. `fillMandatoryBaseline()` fills Credit Limit, Top-Up Limit, Credit Terms (Days), Payment Option and Outstanding Threshold, but never these three | Extend the baseline fixture to cover them (with values added to `branch_baseline.properties`), so the shared fixture actually satisfies every mandatory field the application enforces |
| REC-04 | TC-BR-001 — Email Config / Contact Person | `[DIAG8] emptyFields` includes `Email Password *`, `Name*`, `Email ID*`, `Phone Number *`, even though `fillMandatoryBaseline()` calls `setEmailPassword()` and `addContactPerson()`. Cause not established from this run's evidence — the empty `Name*`/`Email ID*`/`Phone Number *` triplet is consistent with `addContactPerson()`'s `Add` click appending a fresh empty contact row *after* filling, but that is a hypothesis, not a confirmed finding | Diagnose under `/self-healing-skill` with a Debug-mode single-test run (`/automation-execution-skill run TC-BR-001 only, debug`) — do not change code on this hypothesis |
| REC-05 | KL-02 — `testng.xml` | `BranchActionsSuite` names a non-existent class | Either add `BranchActions_TC` or remove the suite declaration — a Stage `4A` package correction, since Stage 5A never edits automation assets |
| REC-06 | KL-01 — negative-case assertions | `assertSubmissionBlocked()` asserts only the URL | Strengthen to assert the specific field-level `Required` message for the field each case leaves empty. Stage `3`/`4A` change, not a healing repair |
| REC-07 | KL-03 — credentials | Hardcoded and committed in `EnvironmentConfig.java`; `AutomationSummary_SHAFT.md` §7 says otherwise | Reconcile document and code, and rotate the exposed STG Super Admin password. Neither is this stage's action |
| REC-08 | TC-BR-026 | Reproducible, matches FINDING-004 | **Do not repair.** Fix the application, or accept the finding. Re-run this case once FINDING-004 is closed |

## 10. Inputs for Reporting Skill

| Input `reporting-skill` §4 declares it needs | Present? | Location |
|---|---|---|
| Execution Results (single file) | Yes | this file |
| Per-test Test Case ID / Automation Script ID / Status / Execution Time / Evidence refs | Yes | §3 |
| Evidence paths | Yes | §4 → `execution/artifacts/exec-0806/` |
| Metrics | Yes | §5 |
| Separated health figures | Yes | §6 |
| Manual Test Suite | Yes (pass-through, Stage 3) | `modules/branch/test_design/TestCases_Branch.md` |
| Traceability Matrix | Yes (pass-through, Stage 3) | `modules/branch/test_design/TraceabilityMatrix.md` |
| Project Context | Yes (pass-through, Stage 1) | `modules/branch/context/ProjectContext.md` |

**Handoff confirmation:** complete — Stage 6A needs no information this stage did not record.

**Upstream staleness note:** `run drift` reports this run's anchor (`42de80a`) as `moved` (3 commits, 129 changed files) — the changes are to this platform's own repository (the run-003 automation commit and the Automation Merge), not to the application under test, whose target is the external STG deployment at `http://192.168.1.70`. No inherited conclusion in this file depends on the moved paths beyond the automation package itself, which this execution read at its current state.
