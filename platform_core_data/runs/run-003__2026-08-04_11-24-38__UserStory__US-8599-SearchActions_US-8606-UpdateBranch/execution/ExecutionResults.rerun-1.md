# Execution Results — run-003__2026-08-04_11-24-38__UserStory__US-8599-SearchActions_US-8606-UpdateBranch (rerun-1)

## 1. Execution Metadata

| Field | Value |
|---|---|
| Execution ID | EXEC-BR-20260805-01-RERUN1 |
| Run Folder | `run-003__2026-08-04_11-24-38__UserStory__US-8599-SearchActions_US-8606-UpdateBranch` |
| Execution cycle | 2 (Stage 5H targeted rerun of `ExecutionResults.md`'s 13 Automation Failures) |
| Modules executed | branch |
| Module scope | single |
| Run Scope Type / Run Type | User Story (US-8605 Create/Add Branch) / Selective Re-run (Stage 5H, post-repair) |
| Environment | Staging (STG) — shared, internal/LAN |
| Target URL | `http://192.168.1.70` |
| Framework | SHAFT Engine (Java) / TestNG |
| Suite executed | `platform_core_data/modules/branch/automation/tests_SHAFT/` — scoped to `CreateBranch_Admin_TC` (Add Branch, US-8605), all 13 methods |
| Execution Mode | Headed (`headlessExecution=false`) |
| Concurrency Mode | Sequential (default — shared STG environment) |
| Retry Policy | No automatic retry (default) |
| Started | 2026-08-05T13:04+03:00 |
| Ended | 2026-08-05T13:08+03:00 |

## 2. Execution Summary

Targeted rerun of all 13 Add Branch cases following two applied Stage 5H repairs: an explicit TestNG Surefire-provider binding (`pom.xml`) and a navigation fix reaching Add Branch via the branch-list screen's own "Add branch" button rather than a direct URL navigation (`AddBranch_Page.java`). 12 of 13 cases now pass and are labelled `Automation Repaired`. 1 case (TC-BR-001) still fails on a cause this pass could not establish — reported as `Inconclusive`, not forced into either Passed or Failed.

## 3. Execution Results

| Test Case ID | Automation Script ID | Status | Execution Time | Attempts | Failure Detail | Evidence Refs |
|---|---|---|---|---|---|---|
| TC-BR-001 | `CreateBranch_Admin_TC::tcBr001_createBranchWithAllMandatoryFields` | Inconclusive | Timed out at 20s (also tested at 45s, 90s in isolation) | 4 (across reruns in this pass) | Times out waiting for `button[routerlink='add']`; only when this test runs first in a fresh JVM fork. Cause not established — a live Playwright reproduction of an identical fresh-login-then-navigate sequence did not reproduce the hang | See RepairSummary.md §5 |
| TC-BR-002 | `CreateBranch_Admin_TC::tcBr002_mandatoryBranchDetailsFieldsBlockSubmissionWhenEmpty` | Automation Repaired | ~1-2s | 1 | — | — |
| TC-BR-004 | `CreateBranch_Admin_TC::tcBr004_countryAutoFillsFromOperatingCountry` | Automation Repaired | ~1-2s | 1 | — | — |
| TC-BR-013 | `CreateBranch_Admin_TC::tcBr013_mandatoryEmailConfigFieldsBlockSubmissionWhenEmpty` | Automation Repaired | ~1-2s | 1 | — | — |
| TC-BR-021 | `CreateBranch_Admin_TC::tcBr021_mandatorySalesConfigFieldsBlockSubmissionWhenEmpty` | Automation Repaired | ~1-2s | 1 | — | — |
| TC-BR-024 | `CreateBranch_Admin_TC::tcBr024_reachingPercentageRejectsValueGreaterThan100` | Automation Repaired | ~1-2s | 1 | — | — |
| TC-BR-025 | `CreateBranch_Admin_TC::tcBr025_reachingPercentageAcceptsThreeDecimalPlaces` | Automation Repaired | ~1-2s | 1 | — | — |
| TC-BR-026 | `CreateBranch_Admin_TC::tcBr026_warningPromptRejectsValueExceeding11Digits` | Automation Repaired | ~1-2s | 1 | — | — |
| TC-BR-028 | `CreateBranch_Admin_TC::tcBr028_selectAtLeastOnePaymentOption` | Automation Repaired | ~1-2s | 1 | — | — |
| TC-BR-030 | `CreateBranch_Admin_TC::tcBr030_descriptionEnabledOnlyWhenSupplierRowSelected` | Automation Repaired | ~1-2s | 1 | — | — |
| TC-BR-037 | `CreateBranch_Admin_TC::tcBr037_createBranchWithValidOutstandingThreshold` | Automation Repaired | ~1-2s | 1 | — | — |
| TC-BR-038 | `CreateBranch_Admin_TC::tcBr038_outstandingThresholdBlocksSubmissionWhenEmpty` | Automation Repaired | ~1-2s | 1 | — | — |
| TC-BR-039 | `CreateBranch_Admin_TC::tcBr039_outstandingThresholdAcceptsNumericValue` | Automation Repaired | ~1-2s | 1 | — | — |

## 4. Evidence Inventory

| Test Case ID | Evidence Type | Path | Captured? | Gap Reason |
|---|---|---|---|---|
| All 13 | Execution/build log (final rerun) | Reported inline in this pass's tool transcript; not separately filed as a run artifact | Partial | SHAFT's own Allure/screenshot capture path was not wired into this manual CLI invocation; console output was the evidence source |
| TC-BR-001 | Screenshot/DOM at timeout | — | No | The failure is a raw Selenium `WebDriverWait` timeout outside SHAFT's own `Actions.reportBroken` path, so SHAFT's failure-screenshot hook never fired — named as a concrete gap in RepairSummary.md §11 |

**Evidence root:** `platform_core_data/runs/run-003__2026-08-04_11-24-38__UserStory__US-8599-SearchActions_US-8606-UpdateBranch/execution/artifacts/`

## 5. Execution Statistics

| Metric | Value | Definition / Basis |
|---|---|---|
| Execution Duration | ~35-50s per full run (varies; several full runs performed in this pass) | Wall-clock, start to finish |
| Pass Rate | 92.3% | 12 Automation Repaired ÷ 13 executed (Automation Repaired counted as passing for this rate; Inconclusive excluded per §17) |
| Failure Rate | 0% | 0 (Failed + Application Failure) ÷ 13 — no genuine application-behaviour failure observed |
| Skip Rate | 0% | 0 ÷ 13 |
| Retry Count | 0 (no TestNG-level auto-retry; multiple manual reruns performed across this pass, tracked separately) | §5.4 |
| Evidence Count | 1 (console log); 1 named gap | §16 |
| Framework | SHAFT Engine (Java) / TestNG | — |
| Execution Mode | Headed | — |
| Environment | Staging (STG), `http://192.168.1.70` | — |
| Coverage Summary | 13 of 13 Add-Branch candidate cases attempted (12 repaired, 1 inconclusive) | Restated pointer |
| Flaky Test Count | 0 | TC-BR-001 is `Inconclusive`, not `Flaky` — its failure was consistent (always fails), not inconsistent across attempts |
| Execution Stability | 0% | 0 Flaky ÷ 13 |

## 6. Health Summary

### Application Health

| Metric | Value |
|---|---|
| Passed (Automation Repaired counted here per §25.2, distinct from a clean first-attempt Passed) | 12 |
| Application Failure | 0 |
| Application Health | 12/13 — first genuine application-behaviour signal this run has produced for Add Branch |

### Automation Health

| Metric | Value |
|---|---|
| Automation Failure | 0 (TC-BR-001 downgraded to Inconclusive, not counted as a confirmed Automation Failure) |
| Automation Repaired | 12 |
| Automation Health | 12/13 confirmed repaired |

### Environment Health

| Metric | Value |
|---|---|
| Environment Failure | 0 |
| Infrastructure Failure | 0 |
| Configuration Failure | 0 (the ReportPortal listener crash was worked around via JVM system properties at invocation time, not scored as a health figure since it never blocked a reported test outcome) |
| Environment Health | Not implicated |

### Inconclusive / Flaky

| Status | Count |
|---|---|
| Inconclusive | 1 (TC-BR-001) |
| Flaky | 0 |

## 7. Self-Healing Availability

Not applicable to this file — this IS the Stage 5H rerun record. See `modules/branch/healing/RepairSummary.md` and `BeforeAfterComparison.md` for the full repair narrative.

## 8. Known Limitations

| Limitation | Affected Test(s) | Why |
|---|---|---|
| TC-BR-001's failure cause is not established | TC-BR-001 | See RepairSummary.md §5, §11 — needs SHAFT-native evidence capture at the moment of failure, not yet obtained |
| No fine-grained per-test evidence (screenshots/traces) for the 12 repaired cases beyond console pass/fail | TC-BR-002…039 | This pass's reruns were driven via direct Maven CLI invocation rather than a full Stage 5A-style evidence-capturing run |

## 9. Execution Recommendations

| ID | Recommendation | Applies To | Rationale |
|---|---|---|---|
| REC-01 | Diagnose TC-BR-001 with SHAFT-native failure capture (wrap the button-presence wait in a SHAFT-reporting-visible action, or add an explicit screenshot-on-timeout) before proposing any further repair | TC-BR-001 | Root Cause Confidence is currently Low for this specific case; §7.1 forbids repairing on a guess |
| REC-02 | Fix the ReportPortal `log4j2.properties` appender so it respects `rp.enable=false` instead of crashing regardless, or remove it if unused | All future executions of this project | Currently requires `-Drp.endpoint=... -Drp.enable=false` supplied manually on every invocation |
| REC-03 | Obtain fresh Automation Approval for the repaired suite before any merge to the Workspace Automation Baseline | All 13 Add Branch cases | Stage 4A's original approval does not cover Stage 5H's changes (self-healing-skill §15) |

## 10. Inputs for Reporting skill

| Required Input (Reporting §4) | Present? | Location / Note |
|---|---|---|
| Execution Results (cycle 1) | Yes | `execution/ExecutionResults.md` |
| Execution Results (rerun-1) | Yes | This file |
| Manual Test Suites | Yes (pass-through) | `platform_core_data/modules/branch/test_design/TestCases_Branch.md` |
| Traceability Matrix | Yes (pass-through) | Branch module test_design artifacts |
| Project Context | Yes (pass-through) | `platform_core_data/modules/branch/context/ProjectContext.md` |
| Repair Summary / Before-After Comparison | Yes | `platform_core_data/modules/branch/healing/RepairSummary.md`, `BeforeAfterComparison.md` |

**Handoff confirmation:** All inputs Reporting skill's own specification declares it needs are present. The repaired suite remains `Pending Automation Approval` (self-healing-skill §15) — Reporting may report this cycle's results as-is, but the suite may not merge to baseline until that approval clears.
