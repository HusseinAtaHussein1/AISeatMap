# Execution Results — Rerun 27

**Cycle:** 27 · **Type:** Full-suite run of the Branch module automation project, requested directly.

**Headline: every test the runner was given passed — 28 of 28.** Login worked normally, so the
environment problem that stopped rerun-26 did not recur.

**Read one thing before the numbers.** A 100% pass rate here covers 28 of the 32 test cases the
Suite Manifest declares, and one of those 28 passes cannot fail as it is currently written. Both
points are set out in §8. Neither is a reason to distrust the other 27 results; both are reasons not
to read "28/28" as "the Branch module is fully verified."

## 1. Execution Metadata

| Field | Value |
|---|---|
| Execution ID | `EXEC-BR-20260815-05` |
| Module | `branch` |
| Run | `run-003__2026-08-04_11-24-38__UserStory__US-8599-SearchActions_US-8606-UpdateBranch` |
| Run Scope / Run Type | User Story (US 8599 Search & Actions, US 8606 Update Branch) · Full suite |
| Environment | Staging (STG), `http://192.168.1.70` — reachable, HTTP 200 |
| Framework | SHAFT Engine 7.4.20231015 / TestNG / Selenium 4.13.0 / Chrome |
| Execution Mode | **Headless** (chosen by the user; set with `-DheadlessExecution=true`, no file changed) |
| Concurrency Mode | Sequential (single TestNG thread) |
| Retry Policy | **None configured.** No test was retried, so no result is a retry result |
| Java | **24.0.1** — see KL-03 |
| Command | `mvn test -DheadlessExecution=true -Drp.endpoint=http://localhost:8080 -Drp.enable=false` |
| Started / Finished | 2026-08-15 17:12:22 / 17:24:57 (+03:00) |
| Duration | 12 min 38 s total · 753.3 s inside the test suite |
| Resumed From | — (not a resume) |

## 2. Execution Summary

The full `testng.xml` suite ran in one pass: `CreateBranch_Admin_TC` (13), `SearchBranch_TC` (10),
and `UpdateBranch_TC` (5) — 28 test methods. All 28 passed. There were no failures, no errors, no
skips, and no blocked tests. Maven reported `BUILD SUCCESS`.

Authentication worked on every one of the 28 logins. That directly answers the open question left by
rerun-26, which aborted because login never redirected: whatever caused it has cleared, and it did
not return under headless execution.

`BranchActionsSuite` is commented out in `testng.xml` and was therefore never handed to the runner.
TC-BR-052 has no test method in the source at all. Those four cases are recorded as **Not Executed**
in §3 rather than left out of the totals.

## 3. Execution Results

### 3.1 CreateBranchSuite — `CreateBranch_Admin_TC` (13 Passed)

| Test Case ID | Automation Script ID | Status | Duration (s) |
|---|---|---|---|
| TC-BR-001 | `CreateBranch_Admin_TC::tcBr001_createBranchWithAllMandatoryFields` | Passed | 7.695 |
| TC-BR-002 | `CreateBranch_Admin_TC::tcBr002_mandatoryBranchDetailsFieldsBlockSubmissionWhenEmpty` | Passed | 58.414 |
| TC-BR-004 | `CreateBranch_Admin_TC::tcBr004_countryAutoFillsFromOperatingCountry` | Passed | 0.764 |
| TC-BR-013 | `CreateBranch_Admin_TC::tcBr013_mandatoryEmailConfigFieldsBlockSubmissionWhenEmpty` | Passed | 13.977 |
| TC-BR-021 | `CreateBranch_Admin_TC::tcBr021_mandatorySalesConfigFieldsBlockSubmissionWhenEmpty` | Passed | 26.670 |
| TC-BR-024 | `CreateBranch_Admin_TC::tcBr024_reachingPercentageRejectsValueGreaterThan100` | Passed | 0.105 |
| TC-BR-025 | `CreateBranch_Admin_TC::tcBr025_reachingPercentageAcceptsThreeDecimalPlaces` | Passed | 0.097 |
| **TC-BR-026** | `CreateBranch_Admin_TC::tcBr026_warningPromptRejectsValueExceeding11Digits` | **Passed — see KL-01** | 0.150 |
| TC-BR-028 | `CreateBranch_Admin_TC::tcBr028_selectAtLeastOnePaymentOption` | Passed | 0.076 |
| TC-BR-030 | `CreateBranch_Admin_TC::tcBr030_descriptionEnabledOnlyWhenSupplierRowSelected` | Passed | 0.461 |
| TC-BR-037 | `CreateBranch_Admin_TC::tcBr037_createBranchWithValidOutstandingThreshold` | Passed | 0.113 |
| TC-BR-038 | `CreateBranch_Admin_TC::tcBr038_outstandingThresholdPrefilledWithDefaultValue` | Passed | 0.034 |
| TC-BR-039 | `CreateBranch_Admin_TC::tcBr039_outstandingThresholdAcceptsNumericValue` | Passed | 0.109 |

### 3.2 SearchBranchSuite — `SearchBranch_TC` (10 Passed)

| Test Case ID | Automation Script ID | Status | Duration (s) |
|---|---|---|---|
| TC-BR-040 | `SearchBranch_TC::tcBr040_searchByBranchCodeReturnsMatchingRecord` | Passed | 2.127 |
| TC-BR-041 | `SearchBranch_TC::tcBr041_searchByBranchNameReturnsMatchingRecord` | Passed | 1.889 |
| TC-BR-042 | `SearchBranch_TC::tcBr042_searchWithNoCriteriaReturnsDefaultActiveResultSet` | Passed | 1.961 |
| TC-BR-043 | `SearchBranch_TC::tcBr043_searchWithNonMatchingCriteriaShowsEmptyState` | Passed | 2.609 |
| TC-BR-045 | `SearchBranch_TC::tcBr045_statusFilterReturnsOnlyRecordsMatchingSelectedStatus` | Passed | 8.884 |
| TC-BR-046 | `SearchBranch_TC::tcBr046_stateFilterStaysDisabledUntilCountrySelected` | Passed | 1.391 |
| TC-BR-054 | `SearchBranch_TC::tcBr054_rowActionIconsMatchApprovalState` | Passed | 8.480 |
| TC-BR-055 | `SearchBranch_TC::tcBr055_editPenOpensUpdateBranchPreFilled` | Passed | 2.820 |
| TC-BR-060 | `SearchBranch_TC::tcBr060_navigateToNextPage` | Passed | 4.467 |
| TC-BR-061 | `SearchBranch_TC::tcBr061_navigateToLastPage` | Passed | 3.077 |

Note on TC-BR-054, TC-BR-060 and TC-BR-061: the Automation Summary warned these three can fail on
missing data rather than on defects. They passed, so that risk did not materialise this run.

### 3.3 UpdateBranchSuite — `UpdateBranch_TC` (5 Passed)

| Test Case ID | Automation Script ID | Status | Duration (s) |
|---|---|---|---|
| TC-BR-065 | `UpdateBranch_TC::tcBr065_updateBranchPreFillsEveryStoredValue` | Passed | 2.863 |
| TC-BR-066 | `UpdateBranch_TC::tcBr066_updateBranchAndSubmitForApproval` | Passed | 32.398 |
| TC-BR-067 | `UpdateBranch_TC::tcBr067_remarksIsMandatoryBeforeAnyUpdateAction` | Passed | 21.240 |
| TC-BR-068 | `UpdateBranch_TC::tcBr068_cancelDiscardsUnsavedChanges` | Passed | 24.465 |
| TC-BR-069 | `UpdateBranch_TC::tcBr069_approveBranchUpdateRequestFromUpdateScreen` | Passed | 31.855 |

TC-BR-067 was disclosed as ambiguous because its validation-message locator is unverified. It
passed, so the ambiguity did not need resolving this run.

### 3.4 Not Executed (4)

These are in the Suite Manifest's declared scope but no test method ran for them. They are listed so
the totals cover the declared scope rather than only what the runner was given.

| Test Case ID | Reason | Classification |
|---|---|---|
| TC-BR-052 | **No test method exists.** `SearchBranch_TC` carries its full Javadoc, but the method it documented is gone — the comment now sits above the private `containsIgnoringCase` helper | Not Executed |
| TC-BR-056 | `BranchActionsSuite` is commented out in `testng.xml`; `BranchActions_TC.java` does not exist | Not Executed |
| TC-BR-057 | Same as above | Not Executed |
| TC-BR-058 | Same as above | Not Executed |

## 4. Evidence Inventory

All evidence for this execution is under
`platform_core_data/runs/run-003__.../execution/artifacts_rerun-27/`.

| Evidence Type | Captured | Location / Note |
|---|---|---|
| Screenshots | Yes — 93 PNG files | `artifacts_rerun-27/allure-results/*.png`. Named per test method. All are **action-retry** screenshots (§5.4), not failure screenshots — no test failed |
| Framework Report (Allure) | Yes — 296 result files | `artifacts_rerun-27/allure-results/` |
| Framework Report (Extent) | Yes | `artifacts_rerun-27/ExtentReports_15-08-2026_17-12-27-0113-PM.html` (23.5 MB) |
| SHAFT Execution Summary | Yes | `artifacts_rerun-27/ExecutionSummaryReport_15-08-2026_17-24-56-0741-PM.html` |
| Execution Logs | Yes | `artifacts_rerun-27/log4j.log` (854 KB) and `artifacts_rerun-27/maven-console.log` (854 KB) |
| Runner report (Surefire) | Yes | `artifacts_rerun-27/TEST-TestSuite.xml` — the source of every duration in §3 |
| Videos | **No** | SHAFT session recording is not enabled in `execution.properties` for this project |
| Execution Traces | **No** | SHAFT/Selenium has no trace-replay equivalent to Playwright's; nothing was available to capture |
| Network Logs / HAR | **No** | Not enabled for this suite; the tests assert on UI state, not on traffic |
| Failure Artifacts | **None needed** | No test failed, so no failure-state capture was triggered |

## 5. Execution Statistics

| Metric | Value |
|---|---|
| Execution Duration | 12 min 38 s total · 753.3 s in-suite |
| Tests executed | 28 |
| Pass Rate | **100%** — 28 Passed ÷ 28 executed |
| Failure Rate | **0%** — 0 Failed, 0 Application Failures |
| Skip Rate | 0% of tests invoked · **12.5% of declared scope not executed** (4 of 32, §3.4) |
| Retry Count (test level) | **0** — no retry policy configured |
| Action-level retries inside tests | **52** (50 `isEnabled`, 2 `getText`) across 17 tests — see KL-04 |
| Evidence Count | 93 screenshots + 296 Allure files + 4 reports/logs |
| Flaky Test Count | 0 |
| Execution Stability | 0 flaky ÷ 28 executed = **0** |
| Framework | SHAFT Engine 7.4.20231015 |
| Execution Mode | Headless |
| Environment | Staging, `http://192.168.1.70` |
| Coverage Summary | Automation Coverage Report records 100% of dual-approved cases automated. This run executed 28 of the 32 cases in the Suite Manifest |

## 6. Health Summary

Three separate figures. They are never added together.

| Health figure | Result | What it means |
|---|---|---|
| **Application Health** | **0 failures / 28 passed** | The application behaved correctly in every check that ran. **Read with KL-01 and §3.4** — 4 declared cases never ran, and one pass proves nothing |
| **Automation Health** | **0 failures** | No stale selector, no broken script, nothing for Stage 5H to repair. **The 52 action-level retries in KL-04 are a maintenance signal, not a failure count** |
| **Environment Health** | **0 failures** | Staging was reachable and stable. All 28 logins succeeded. The rerun-26 authentication problem did not recur |

| Inconclusive | Flaky |
|---|---|
| 0 | 0 |

## 7. Self-Healing Availability

**Not applicable — omitted deliberately.** No result classified as an `Automation Failure`, so there
is nothing for Stage 5H to act on. Nothing in §8 below is a healing task either: KL-01 is a test-
validity question for a human, and §3.4 is missing test code, not broken test code.

## 8. Known Limitations

### KL-01 — TC-BR-026 passed, but it cannot fail as currently written (most important)

**This is the one result in this run that should not be trusted at face value.**

TC-BR-026 is the regression test for FINDING-004: the Warning Prompt (Days) field should reject
input longer than 11 digits. It was documented everywhere as *expected to fail* until that defect is
fixed. It passed.

It passed because the test no longer tests the rule:

| | Committed version | What ran today |
|---|---|---|
| Value typed into the field | `999999999999999` (15 digits) | `9999999` (**7 digits**) |
| Assertion | `actual.length() <= 11` | `actual.length() <= 7` |

A 7-digit input checked against a 7-digit limit can never fail. The requirement — an 11-digit cap —
is no longer exercised at all. The method name, its Javadoc, and the Suite Manifest all still say
"11 digits" and still say the test is expected to fail.

**Both edits are uncommitted working-tree changes**, present in
`CreateBranch_Admin_TC.java` and `AddBranch_Page.java` but in no commit. They are not part of the
committed healing pass `0becb64`.

This stage changed nothing and takes no position on whether FINDING-004 is still open. It records
that this particular `Passed` carries no information about the application, and that deciding what
the test should assert is a human call, not a repair.

### KL-02 — 4 of 32 declared cases never ran

Per §3.4. TC-BR-052 has lost its test method while keeping its documentation, which is the easier of
the two to miss: the file still reads as though the case is covered. TC-BR-056/057/058 are visibly
commented out in `testng.xml`, which is at least self-announcing.

### KL-03 — Java 24, not the approved Java 21

The safety authorizations record that Java 21 is the approved JDK for this project and that Java 24
results are "non-canonical". **Java 21 is not installed on this machine** — only JDK 22 and JDK 24
are present, and Maven runs on 24. The project compiles to release 17 and ran cleanly, but this run
does not meet that stated canonical-JDK condition.

### KL-04 — 52 action-level retries inside passing tests

SHAFT's `isEnabled` check failed and was retried 50 times across 17 tests (plus 2 `getText`
retries), each writing a screenshot. Every one recovered, so no test outcome was affected and
nothing here is classified Flaky. It is recorded because it is a timing-fragility signal in the page
objects and because it explains why 93 screenshots exist for a run with zero failures.

### KL-05 — Safety enforcement is pre-execution only

Per §14A.1, this stage enforces policy at suite preflight and test selection. Maven/SHAFT is an
opaque external process, so **no per-operation enforcement was in effect once the runner started**.
No test was deselected; the four granted authorizations (CREATE/UPDATE/SUBMIT/APPROVE on
self-created records) covered everything the suite does, and the suite performs no DELETE.

### KL-06 — The Execution Instructions are stale on credentials

The Automation Summary says `BRANCH_QA_USERNAME` and `BRANCH_QA_PASSWORD` must be set. They are not
used — the credentials are hardcoded in `EnvironmentConfig.java`. The run worked with neither
variable set. Following the documented instructions would not have failed, but they describe a
mechanism that is not there.

### KL-07 — The suite executed contains uncommitted changes

The working tree differs from `HEAD` across the automation project (630 added lines in
`AddBranch_Page.java` alone). This run therefore reflects code that is not in git history, so the
result cannot be reproduced from a clean checkout of the current commit.

## 9. Execution Recommendations

Ordered by what matters most. This stage recommends only; it changed nothing.

1. **Decide what TC-BR-026 should assert (human decision, KL-01).** Either FINDING-004 is fixed and
   the test should be restored to the 15-digit input and 11-digit cap to prove it, or the defect is
   still open and the test should go back to failing honestly. Leaving it as-is records a rule as
   tested when it is not. This is not a Stage 5H repair — the automation is not broken, its intent is
   in question.
2. **Restore or formally drop TC-BR-052 (KL-02).** Its documentation without its method is the worst
   of both: the case reads as covered and is not. If the State-column disagreement is still open,
   the case should exist and fail; if it is settled, both the case and its comment should reflect that.
3. **Decide on TC-BR-056/057/058.** `BranchActionsSuite` has no class behind it. Either build it or
   remove the commented block, so `testng.xml` stops implying coverage that does not exist.
4. **Install Java 21 before treating any run as canonical (KL-03),** or update the authorization note
   to accept the JDK actually available here. Right now no run on this machine can satisfy it.
5. **Look at the `isEnabled` retries (KL-04)** if suite runtime matters. 52 recovered retries are a
   large share of the 12.5-minute duration.
6. **Correct the Execution Instructions on credentials (KL-06)** — a Stage 4A documentation fix.
7. **Commit or revert the working-tree changes (KL-07)** so a future run is reproducible.

No retry, resume, mode switch, environment validation, or selective re-run is recommended: nothing
failed, and the environment was healthy throughout.

## 10. Inputs for Reporting Skill

| Input the Reporting skill declares it needs | Present? | Location |
|---|---|---|
| Execution Results | Yes | this file |
| Per-test Test Case ID, Script ID, Status, Duration | Yes | §3 |
| Evidence references | Yes | §4, with paths under `artifacts_rerun-27/` |
| Execution Statistics | Yes | §5 |
| Separated health figures | Yes | §6 |
| Known Limitations | Yes | §8 |
| Manual Test Suites | Pass-through from Stage 3 | `modules/branch/test_design/TestCases_Branch.md` |
| Traceability Matrix | Pass-through from Stage 3 | `modules/branch/test_design/TraceabilityMatrix.md` |
| Project Context | Pass-through from Stage 1 | `modules/branch/context/ProjectContext.md` |

**Handoff is complete.** One caution for Stage 6A: **do not report "100% pass, Branch module
verified."** The honest sentence is that 28 of 32 declared cases ran and passed, 4 never ran, and one
of the 28 does not test what its name says.

---

**No automation code was modified by this stage. This stage never repairs.**
