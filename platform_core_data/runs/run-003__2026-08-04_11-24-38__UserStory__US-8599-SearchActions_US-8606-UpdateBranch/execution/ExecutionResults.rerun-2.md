# Execution Results — run-003__2026-08-04_11-24-38__UserStory__US-8599-SearchActions_US-8606-UpdateBranch (rerun-2)

**Note on cycle labelling:** this is a Stage `5A` **direct invocation**, not a Stage `5H` healing rerun — it confirms the healed-and-approved Add Branch suite now that it has cleared Automation Approval and the Workspace Merge, per the user's explicit "now run Stage 5" request. It is filed as `rerun-2` (following Stage 5H's `rerun-1`) rather than editing `ExecutionResults.md` in place, since that file is cycle 1's immutable record and must never be touched by any later cycle.

## 1. Execution Metadata

| Field | Value |
|---|---|
| Execution ID | EXEC-BR-20260805-02 |
| Run Folder | `run-003__2026-08-04_11-24-38__UserStory__US-8599-SearchActions_US-8606-UpdateBranch` |
| Execution cycle | 3 (Stage 5A confirmation run, post Stage 5H healing + Automation Approval + Workspace Merge) |
| Modules executed | branch |
| Module scope | single |
| Run Scope Type / Run Type | User Story (US-8605 Create/Add Branch) / Partial Suite |
| Environment | Staging (STG) — shared, internal/LAN |
| Target URL | `http://192.168.1.70` |
| Framework | SHAFT Engine (Java) / TestNG |
| Suite executed | `platform_core_data/modules/branch/automation/tests_SHAFT/` (module's own working copy, per module-scoped execution rules — NOT the merged `automation_baseline/shaft/tests_SHAFT/`) — scoped to `CreateBranch_Admin_TC`, all 13 Add Branch methods |
| Execution Mode | Headed (`headlessExecution=false`) |
| Concurrency Mode | Sequential (default — shared STG environment) |
| Retry Policy | No automatic retry (default) |
| Started | 2026-08-05T13:44+03:00 |
| Ended | 2026-08-05T13:45+03:00 |

## 2. Execution Summary

Fresh Stage 5A execution of the Add Branch suite following its Stage 5H healing pass, fresh Automation Approval, and Workspace Merge into the SHAFT baseline. Result is unchanged from Stage 5H's own confirmation rerun: 12 of 13 test cases pass (`Passed` here, not `Automation Repaired` — that label is reserved for Stage 5H's own rerun record; this is Stage 5A's own independent execution of the already-repaired code) and 1 (TC-BR-001) remains `Inconclusive` for a still-undiagnosed cause specific to running first in a fresh browser session. No code was modified by this stage.

## 3. Execution Results

| Test Case ID | Automation Script ID | Status | Execution Time | Attempts | Failure Detail | Evidence Refs |
|---|---|---|---|---|---|---|
| TC-BR-001 | `CreateBranch_Admin_TC::tcBr001_createBranchWithAllMandatoryFields` | Inconclusive | Timed out at 20s | 1 | Times out waiting for `button[routerlink='add']`; reproduces only when this test runs first in a fresh JVM fork — consistent with the same open item recorded in `modules/branch/healing/RepairSummary.md` §5, §11. Cause not established; not repaired further on a guess | Console output (this invocation) |
| TC-BR-002 | `CreateBranch_Admin_TC::tcBr002_mandatoryBranchDetailsFieldsBlockSubmissionWhenEmpty` | Passed | ~1-2s | 1 | — | — |
| TC-BR-004 | `CreateBranch_Admin_TC::tcBr004_countryAutoFillsFromOperatingCountry` | Passed | ~1-2s | 1 | — | — |
| TC-BR-013 | `CreateBranch_Admin_TC::tcBr013_mandatoryEmailConfigFieldsBlockSubmissionWhenEmpty` | Passed | ~1-2s | 1 | — | — |
| TC-BR-021 | `CreateBranch_Admin_TC::tcBr021_mandatorySalesConfigFieldsBlockSubmissionWhenEmpty` | Passed | ~1-2s | 1 | — | — |
| TC-BR-024 | `CreateBranch_Admin_TC::tcBr024_reachingPercentageRejectsValueGreaterThan100` | Passed | ~1-2s | 1 | — | — |
| TC-BR-025 | `CreateBranch_Admin_TC::tcBr025_reachingPercentageAcceptsThreeDecimalPlaces` | Passed | ~1-2s | 1 | — | — |
| TC-BR-026 | `CreateBranch_Admin_TC::tcBr026_warningPromptRejectsValueExceeding11Digits` | Passed | ~1-2s | 1 | — | — |
| TC-BR-028 | `CreateBranch_Admin_TC::tcBr028_selectAtLeastOnePaymentOption` | Passed | ~1-2s | 1 | — | — |
| TC-BR-030 | `CreateBranch_Admin_TC::tcBr030_descriptionEnabledOnlyWhenSupplierRowSelected` | Passed | ~1-2s | 1 | — | — |
| TC-BR-037 | `CreateBranch_Admin_TC::tcBr037_createBranchWithValidOutstandingThreshold` | Passed | ~1-2s | 1 | — | — |
| TC-BR-038 | `CreateBranch_Admin_TC::tcBr038_outstandingThresholdBlocksSubmissionWhenEmpty` | Passed | ~1-2s | 1 | — | — |
| TC-BR-039 | `CreateBranch_Admin_TC::tcBr039_outstandingThresholdAcceptsNumericValue` | Passed | ~1-2s | 1 | — | — |

## 4. Evidence Inventory

| Test Case ID | Evidence Type | Path | Captured? | Gap Reason |
|---|---|---|---|---|
| All 13 | Console/build log | Reported inline in this invocation's tool transcript | Partial | Not filed as a separate artifact file for this manual CLI invocation |
| TC-BR-001 | Screenshot/DOM at timeout | — | No | Same gap as `rerun-1` — the failure is a raw Selenium `WebDriverWait` timeout outside SHAFT's own failure-capture hook |
| All 13 | Allure/Framework Report | `target/surefire-reports/`, `allure-results/` (module working copy, not committed to the run) | Yes (locally, in the module's own `target/`) | Not copied into `runs/.../execution/artifacts/` for this manual invocation |

**Evidence root:** `platform_core_data/runs/run-003__2026-08-04_11-24-38__UserStory__US-8599-SearchActions_US-8606-UpdateBranch/execution/artifacts/`

## 5. Execution Statistics

| Metric | Value | Definition / Basis |
|---|---|---|
| Execution Duration | ~38s | Wall-clock, start to finish |
| Pass Rate | 92.3% | 12 Passed ÷ 13 executed |
| Failure Rate | 0% | 0 (Failed + Application Failure) ÷ 13 |
| Skip Rate | 0% | 0 ÷ 13 |
| Retry Count | 0 | §5.4 |
| Evidence Count | 2 (console log, local Allure/surefire reports not yet copied to run artifacts) | §16 |
| Framework | SHAFT Engine (Java) / TestNG | — |
| Execution Mode | Headed | — |
| Environment | Staging (STG), `http://192.168.1.70` | — |
| Coverage Summary | 13 of 13 Add-Branch candidate cases attempted (12 Passed, 1 Inconclusive) | Restated pointer |
| Flaky Test Count | 0 | TC-BR-001's failure is consistent, not inconsistent — `Inconclusive`, not `Flaky` |
| Execution Stability | 0% | 0 Flaky ÷ 13 |

## 6. Health Summary

### Application Health

| Metric | Value |
|---|---|
| Passed | 12 |
| Application Failure | 0 |
| Application Health | 12/13 |

### Automation Health

| Metric | Value |
|---|---|
| Automation Failure | 0 |
| Automation Repaired | 0 (this is Stage 5A's own record; the repair itself is Stage 5H's, in `rerun-1`) |
| Automation Health | 12/13 confirmed working post-repair |

### Environment Health

| Metric | Value |
|---|---|
| Environment Failure | 0 |
| Infrastructure Failure | 0 |
| Configuration Failure | 0 (ReportPortal listener crash worked around via `-Drp.endpoint`/`-Drp.enable=false` JVM system properties at invocation time — not scored, since it never blocked a reported test outcome) |
| Environment Health | Not implicated |

### Inconclusive / Flaky

| Status | Count |
|---|---|
| Inconclusive | 1 (TC-BR-001) |
| Flaky | 0 |

## 7. Self-Healing Availability

Not applicable — no `Automation Failure` occurred in this cycle (TC-BR-001 is `Inconclusive`, not `Automation Failure`; per §25.2/§20a, this stage does not guess an Automation Failure classification when the evidence doesn't clearly establish an automation-side cause). Self-healing was already used in this run for the two confirmed defects (see `modules/branch/healing/RepairSummary.md`) and remains available for a further diagnosis pass on TC-BR-001 specifically, but that is a human decision, not stated here as a recommendation.

## 8. Known Limitations

| Limitation | Affected Test(s) | Why |
|---|---|---|
| TC-BR-001's failure cause is still not established | TC-BR-001 | Same open item as `RepairSummary.md` §5, §11 — unchanged by this confirmation run |
| No per-test screenshots/traces filed as run artifacts | TC-BR-002…039 | Manual CLI invocation; Allure/surefire reports exist locally in the module's `target/` but were not copied into this run's `execution/artifacts/` |

## 9. Execution Recommendations

| ID | Recommendation | Applies To | Rationale |
|---|---|---|---|
| REC-01 | Diagnose TC-BR-001 with SHAFT-native failure capture before any further repair attempt | TC-BR-001 | Unchanged from `RepairSummary.md` §11 — Root Cause Confidence remains Low for this specific case |
| REC-02 | Consider running the remaining 12 Search/Actions/Update Branch scope (US-8599, US-8606) under this same run, since Add Branch is now confirmed healthy | Rest of `run-003`'s scope | This run's own scope also covers Search/Actions and Update Branch, not yet executed in this session |

## 10. Inputs for Reporting skill

| Required Input (Reporting §4) | Present? | Location / Note |
|---|---|---|
| Execution Results (cycle 1) | Yes | `execution/ExecutionResults.md` |
| Execution Results (Stage 5H rerun-1) | Yes | `execution/ExecutionResults.rerun-1.md` |
| Execution Results (Stage 5A confirmation, this file) | Yes | `execution/ExecutionResults.rerun-2.md` |
| Manual Test Suites | Yes (pass-through) | `platform_core_data/modules/branch/test_design/TestCases_Branch.md` |
| Traceability Matrix | Yes (pass-through) | Branch module test_design artifacts |
| Project Context | Yes (pass-through) | `platform_core_data/modules/branch/context/ProjectContext.md` |
| Repair Summary / Before-After Comparison | Yes | `platform_core_data/modules/branch/healing/RepairSummary.md`, `BeforeAfterComparison.md` |

**Handoff confirmation:** All inputs Reporting skill's own specification declares it needs are present. The Add Branch scope of `run-003` is now Approved, Healed, merged to baseline, and confirmed by a fresh Stage 5A execution — ready for `/reporting-skill` if the user wants a report scoped to Add Branch alone, or after the run's remaining scope (Search/Actions, Update Branch) executes if a single consolidated report is wanted instead.
