# Execution Results — run-003__2026-08-04_11-24-38__UserStory__US-8599-SearchActions_US-8606-UpdateBranch (rerun-5)

**Note on cycle labelling:** a Stage `5A` **direct invocation** — the first execution covering the *whole* Branch cycle available in this project (Create + Search + Update), on the post-healing code including REPAIR-BR-008. Filed as `rerun-5`; cycles 1–5 (`ExecutionResults.md`, `.rerun-1` … `.rerun-4`) are untouched.

## 1. Execution Metadata

| Field | Value |
|---|---|
| Execution ID | EXEC-BR-20260806-03 |
| Run Folder | `run-003__2026-08-04_11-24-38__UserStory__US-8599-SearchActions_US-8606-UpdateBranch` |
| Execution cycle | 6 |
| Modules executed | branch |
| Module scope | single |
| Run Scope Type / Run Type | User Story (US-8605 Create + US-8599 Search + US-8606 Update) / Partial Suite |
| Environment | Staging (STG), shared internal/LAN |
| Target URL | `http://192.168.1.70` |
| Framework | SHAFT Engine 7.4.20231015 (Java) / TestNG |
| Suite executed | `modules/branch/automation/tests_SHAFT/` — `CreateBranch_Admin_TC` (13) + `SearchBranch_TC` (11) + `UpdateBranch_TC` (5) = 29 methods |
| Suite code state | **Post-healing, `Pending Automation Approval`** — REPAIR-BR-001…008 (`modules/branch/healing/RepairSummary.md`), not approved, not merged |
| **Approve / Reject NOT EXECUTED** | `testng.xml`'s `BranchActionsSuite` names `AdminPages.Admin.Branch.BranchActions_TC`, a class that **does not exist** in the project (§8 KL-02). Declaring it makes the entire suite fail to load, so it was omitted from the scoping file. Approve/Reject coverage for US-8599 has **never executed in any cycle** — it is `Not Executed`, not passing |
| Scope mechanism | `-Dsurefire.suiteXmlFiles=<scratchpad>/testng-fullcycle.xml` (copy preserved in `artifacts/exec-0806c/`) |
| Execution Mode | Headed (`headlessExecution=false` in the working tree; committed value is `true`) |
| Concurrency Mode | Sequential |
| Retry Policy | No automatic retry |
| Started | 2026-08-06T11:56:00+03:00 |
| Ended | 2026-08-06T12:10:35+03:00 |

## 2. Execution Summary

29 test cases executed, none skipped or blocked: **15 Passed, 14 Failed** (TestNG: `Tests run: 29, Failures: 14, Errors: 0, Skipped: 0`, 13 min 58 s). The Create Branch suite improved sharply — from 6 failures in `EXEC-BR-20260806-02` to **2**, confirming REPAIR-BR-008 (the autocomplete commit-signal repair) fixed TC-BR-002 / 013 / 021 / 038. The two remaining Create failures are TC-BR-001 and the expected `Application Failure` TC-BR-026. Search and Update, neither of which this healing pass was scoped to touch, contributed the other 12: **2 `Application Failure`** (TC-BR-026, TC-BR-052 — both previously-disclosed open defects), and **10 `Automation Failure`** clustering into three single causes — 5 `StaleElementReference` faults in `SearchBranch_Page`'s grid handling, 1 instance of the same autocomplete race in the Search screen's country filter (a screen REPAIR-BR-008 did not cover), and 4 Update tests blocked at `BranchProvisioner:94`, which calls the very `assertSubmissionSucceeded()` that TC-BR-001 fails on. A Branch record named `QAPROBE_06483862` was created during this session's diagnosis (probe 6), and further records were created by the suite's own tests. This execution modified no automation code.

## 3. Execution Results

### Create Branch (US-8605) — 11 Passed / 2 Failed

| Test Case ID | Automation Script ID | Status (§17) | Time | Failure Detail |
|---|---|---|---|---|
| TC-BR-001 | `CreateBranch_Admin_TC::tcBr001_...AllMandatoryFields` | **Automation Failure** | 5.510 s | `AssertionError: Expected the Branch to be saved with status "Pending for approval."` (`:39`). **Diagnosis this session establishes the submit actually succeeds** — see §5 |
| TC-BR-002 | `::tcBr002_mandatoryBranchDetails...` | **Passed** | 97.286 s | — (was failing in cycle 5; fixed by REPAIR-BR-008) |
| TC-BR-004 | `::tcBr004_countryAutoFills...` | Passed | 1.064 s | — |
| TC-BR-013 | `::tcBr013_mandatoryEmailConfig...` | **Passed** | 33.101 s | — (fixed by REPAIR-BR-008) |
| TC-BR-021 | `::tcBr021_mandatorySalesConfig...` | **Passed** | 36.998 s | — (fixed by REPAIR-BR-008) |
| TC-BR-024 | `::tcBr024_reachingPercentageRejects...` | Passed | 0.233 s | — |
| TC-BR-025 | `::tcBr025_reachingPercentageAccepts...` | Passed | 0.196 s | — |
| TC-BR-026 | `::tcBr026_warningPromptRejects...` | **Application Failure** | 0.255 s | Warning Prompt (Days) retained 15 characters — **FINDING-004, still open. Expected failure, disclosed in advance. Must not be repaired** |
| TC-BR-028 | `::tcBr028_selectAtLeastOnePaymentOption` | Passed | 0.178 s | — |
| TC-BR-030 | `::tcBr030_descriptionEnabledOnly...` | Passed | 0.905 s | — |
| TC-BR-037 | `::tcBr037_createBranchWithValidOutstanding...` | Passed | 0.172 s | — |
| TC-BR-038 | `::tcBr038_outstandingThresholdBlocks...` | **Passed** | 8.340 s | — (fixed by REPAIR-BR-008; also resolves the cycle-4/5 divergence recorded in `rerun-4.md` §5) |
| TC-BR-039 | `::tcBr039_outstandingThresholdAccepts...` | Passed | 0.190 s | — |

### Search & Actions Branch (US-8599) — 4 Passed / 7 Failed

| Test Case ID | Automation Script ID | Status (§17) | Time | Failure Detail |
|---|---|---|---|---|
| TC-BR-040 | `SearchBranch_TC::tcBr040_searchByBranchCode...` | Passed | 22.177 s | — |
| TC-BR-041 | `::tcBr041_searchByBranchName...` | Passed | 1.803 s | — |
| TC-BR-042 | `::tcBr042_searchWithNoCriteria...` | Passed | 0.689 s | — |
| TC-BR-043 | `::tcBr043_searchWithNonMatchingCriteria...` | **Automation Failure** | 3.009 s | `StaleElementReference` (`:119`) — grid re-render between locating and reading |
| TC-BR-045 | `::tcBr045_statusFilterReturnsOnly...` | Passed | 26.174 s | — |
| TC-BR-046 | `::tcBr046_stateFilterStaysDisabled...` | **Automation Failure** | 63.048 s | `Failed to Click "//li[normalize-space(.)='Egypt']" … NoSuchElementException` (`:166`) — **the same autocomplete race REPAIR-BR-008 fixed on the Add Branch screen**, in `SearchBranch_Page`, which this healing pass was not scoped to touch |
| TC-BR-052 | `::tcBr052_resultsGridDisplaysAllColumns` | **Application Failure** | 0.694 s | `Grid is missing required column(s) [Branch Code, State]. Headers rendered: [Code, Branch Name, Country Name, City, Approval Status, Actions]`. **FINDING-012, still open. Disclosed in advance by `AutomationSummary_SHAFT.md` revision 2 as a correct failure. Must not be repaired** |
| TC-BR-054 | `::tcBr054_rowActionIconsMatchApprovalState` | **Automation Failure** | 134.251 s | `StaleElementReference` (`:235→assertIconsForStatus:263`) |
| TC-BR-055 | `::tcBr055_editPenOpensUpdateBranchPreFilled` | **Automation Failure** | 2.990 s | `StaleElementReference` (`:291`) |
| TC-BR-060 | `::tcBr060_navigateToNextPage` | **Automation Failure** | 26.828 s | `StaleElementReference` (`:319`) |
| TC-BR-061 | `::tcBr061_navigateToLastPage` | **Automation Failure** | 25.085 s | `StaleElementReference` (`:346`) |

**Correction to an upstream disclosure:** `AutomationSummary_SHAFT.md` revision 2 warned that TC-BR-054 / 060 / 061 "can fail on data, not on defects — treat those as Environment Health." The actual failures are `StaleElementReference` in the automation's own grid handling, not missing data, so they are classified **`Automation Failure`** and counted under Automation Health, not Environment Health. The disclosure anticipated a different failure mode than the one that occurred.

### Update Branch (US-8606) — 0 Passed / 5 Failed

| Test Case ID | Automation Script ID | Status (§17) | Time | Failure Detail |
|---|---|---|---|---|
| TC-BR-065 | `UpdateBranch_TC::tcBr065_updateBranchPreFillsEveryStoredValue` | **Automation Failure** | 31.334 s | 30s `Timeout` in `UpdateBranch_Page` (`:67`) |
| TC-BR-066 | `::tcBr066_updateBranchAndSubmitForApproval` | **Automation Failure** | 9.260 s | `Expected the Branch to be saved with status "Pending for approval."` — thrown from `BranchProvisioner:94`, i.e. **the suite could not provision its own test record**, not an Update defect |
| TC-BR-067 | `::tcBr067_remarksIsMandatoryBeforeAnyUpdateAction` | **Automation Failure** | 11.614 s | Same provisioning failure |
| TC-BR-068 | `::tcBr068_cancelDiscardsUnsavedChanges` | **Automation Failure** | 14.495 s | Same provisioning failure |
| TC-BR-069 | `::tcBr069_approveBranchUpdateRequestFromUpdateScreen` | **Automation Failure** | 15.480 s | Same provisioning failure |

**The Update suite is not independently assessed.** Four of its five cases never reached an Update assertion at all — `BranchProvisioner.createPendingBranch` calls `AddBranch_Page.assertSubmissionSucceeded()` at line 94, the same assertion TC-BR-001 fails on, so the whole suite is gated behind that one defect. Update Branch behaviour is therefore **unverified by this run**, not "broken."

### Not Executed

| Scope | Status | Reason |
|---|---|---|
| Approve / Reject from the grid (`BranchActionsSuite`, US-8599) | **Not Executed** | `BranchActions_TC` does not exist in the project (§8 KL-02). Never executed in any cycle |

## 4. Evidence Inventory

| Evidence Type | Captured? | Location / Reason |
|---|---|---|
| Execution Logs | Yes | `artifacts/exec-0806c/maven-console.log` |
| Framework Reports | Yes | `artifacts/exec-0806c/ExecutionSummaryReport_*.html`; `artifacts/exec-0806c/allure/` (this execution only) |
| Screenshots | Yes | `*-attachment.png` in `artifacts/exec-0806c/allure/` |
| Failure Artifacts | Yes | `artifacts/exec-0806c/surefire/`; `[DIAG8]` DOM probes for TC-BR-001 |
| Test Runner Reports | Yes | `artifacts/exec-0806c/surefire/` |
| Scoping input | Yes | `artifacts/exec-0806c/testng-fullcycle.xml` |
| Diagnosis evidence (Stage 5H, cited not owned) | Yes | `modules/branch/healing/evidence_0806/` — 8 probe logs, 17 screenshots, 2 DOM dumps |
| Videos / Traces / Browser Console / HAR | No | Not enabled in this project's SHAFT configuration; traces unsupported in this Selenium-backed version |

## 5. Execution Statistics

| Metric | Value |
|---|---|
| Execution Duration | 13 min 58 s |
| Tests in scope / executed | 29 / 29 |
| Pass Rate | 15/29 = **51.7%** |
| Failure Rate (Application) | 2/29 = **6.9%** (TC-BR-026, TC-BR-052 — both known open defects) |
| Skip Rate | 0% |
| Retry Count | 0 |
| Evidence Count | 251 files |
| Framework / Mode / Environment | SHAFT 7.4.20231015 + TestNG / Headed / STG `http://192.168.1.70` |
| Coverage Summary (cited, not recomputed) | 32 automated cases across 4 suites per `AutomationSuiteManifest_SHAFT.md`; **29 executable** — the 3 in `BranchActionsSuite` cannot run (KL-02) |
| Flaky Test Count (within this execution) | 0 |
| Execution Stability | 0/29 flaky within this execution |

**Diagnosis finding that changes TC-BR-001's interpretation, recorded here because it was established this session:** a Stage 5H probe filled the form exactly as the repaired fixture does and submitted once. The application returned `POST 204 /odeysysadmin/Master2/Branch/`, showed the toast **"Added Successfully"**, and navigated to `/admin/branch` — **the record was created**. Two consequences:

1. `assertSubmissionSucceeded()` reads the URL immediately after `clickSubmit()` with no wait for the outcome, so it can observe the pre-navigation URL and report failure on a submission that succeeded. TC-BR-001 has therefore most likely been **creating Branch records on STG on every run while reporting failure**.
2. The application's success text is **"Added Successfully"**, not the `"Pending for approval."` the approved test case specifies. That is an automation-vs-test-case disagreement, disclosed as a discrepancy for Stage 3 to resolve — **this stage and Stage 5H both refuse to change the expected value** to match observed behaviour.

Evidence: `modules/branch/healing/evidence_0806/diagnosis6.log`.

**Also corrected this session:** `FlightOthers`, treated in cycles 3–5 as the last remaining validation error on TC-BR-001, is **not an error at all** — it is an `<ndc-fg-input>` whose class contains `product-error`, matched only because the `[DIAG8]` probe selector uses `[class*=error]`; its parent is `ng-valid`. TC-BR-001's form has zero real validation errors.

## 6. Health Summary

| Figure | Count | What it means |
|---|---|---|
| **Application Health** | **2 failures** — TC-BR-026 (FINDING-004), TC-BR-052 (FINDING-012) | Both are previously-recorded open defects, both disclosed in advance as correct failures. **No new application defect surfaced**, and no repair in any pass has moved this figure |
| **Automation Health** | **12 failures** — TC-BR-001 · 043 · 046 · 054 · 055 · 060 · 061 · 065 · 066 · 067 · 068 · 069 — plus 3 cases that cannot execute (KL-02) | They reduce to **four** causes: the missing post-submit wait (TC-BR-001 + the 4 provisioner-blocked Update cases = 5 tests), `StaleElementReference` in the Search grid (5), the autocomplete race on the Search screen (1), and an Update-screen timeout (1) |
| **Environment Health** | **0 failures** | STG reachable throughout; login succeeded on all 29 tests; no infrastructure or configuration failure |
| Inconclusive / Flaky | 0 / 0 | Folded into none of the above |

## 7. Self-Healing Availability

```
  12 Automation Failures recorded. Self-healing is available but never automatic:
      /self-healing-skill            analyse every Automation Failure
      /self-healing-skill branch     scope the pass to named modules
```

Naming the option is not invoking it. Carry into any such pass:

- **TC-BR-026 and TC-BR-052 are out of scope for healing entirely** — `Application Failure`, both asserting requirements the application does not meet (FINDING-004, FINDING-012). Repairing either would silence a real defect.
- **TC-BR-001's expected-value discrepancy is not healable** (§8.3): the fix for the *wait* is automation mechanics and is fair game; changing `"Pending for approval."` to `"Added Successfully"` is a Stage 3 decision.
- TC-BR-001's cumulative repair-attempt count is now **3**, which reaches the §14 limit — a further failed attempt quarantines it rather than repairing it again.

## 8. Known Limitations

| ID | Limitation |
|---|---|
| KL-01 | `BranchActions_TC` (Approve/Reject, 3 cases) does not exist; `testng.xml` cannot load as written. **Approve/Reject has never been executed.** Stage `4A` fix required |
| KL-02 | Update Branch behaviour is **unverified**, not broken — 4 of its 5 cases never reached an Update assertion because provisioning failed first |
| KL-03 | `EnvironmentConfig.java:56-57` hardcodes and commits STG Super Admin credentials, contradicting `AutomationSummary_SHAFT.md` §7 |
| KL-04 | Everything this session — every repair verification and every execution — ran **Headed**. The committed `execution.properties` says `headlessExecution=true`, so CI would exercise an unverified mode |
| KL-05 | This run executed a suite that is `Pending Automation Approval`; nothing here authorizes a merge to the baseline |
| KL-06 | Real records were created on shared STG this session (`QAPROBE_06483862` from diagnosis, plus each passing/failing Create and provisioning attempt). Deletion is not authorised, so they remain. Every one is prefixed `QARUN`/`QAPROBE` |
| KL-07 | The `[DIAG8]` probe's `[class*=error]` selector produces false positives (it reported `FlightOthers` as an error for three cycles). Any future reading of that output must account for it |

## 9. Execution Recommendations

| ID | Applies to | Recommended smallest corrective action |
|---|---|---|
| REC-01 | TC-BR-001 + TC-BR-066/067/068/069 (5 tests, 1 cause) | Add a bounded wait for the post-submit outcome in `assertSubmissionSucceeded()` before evaluating it — navigation away from `/admin/branch/add`, or the success toast appearing. High confidence: the successful `POST 204` and the "Added Successfully" toast are directly observed. This one change is expected to unblock the entire Update suite |
| REC-02 | Expected-value discrepancy | Stage 3 decision: either the test case's `"Pending for approval."` is wrong for this screen, or the application's `"Added Successfully"` is. **Neither Stage 5A nor 5H may decide it** |
| REC-03 | TC-BR-043 / 054 / 055 / 060 / 061 (5 tests, 1 cause) | `StaleElementReference` in `SearchBranch_Page`: re-locate grid elements after each re-render instead of holding references across it. Stage 5H repair, once scoped to Search |
| REC-04 | TC-BR-046 | Apply REPAIR-BR-008's commit-signal pattern to `SearchBranch_Page`'s country filter — the identical race, on a screen this pass was not scoped to |
| REC-05 | TC-BR-065 | Diagnose the 30s `UpdateBranch_Page:67` timeout separately; it is the one Update failure *not* explained by provisioning |
| REC-06 | KL-01 | Stage `4A`: write `BranchActions_TC` or remove the suite declaration. Until then Approve/Reject is uncovered, and the coverage figure overstates what can run |
| REC-07 | KL-04 | Re-verify headless before merge |
| REC-08 | KL-03 | Reconcile the credential documentation and rotate the exposed password |
| REC-09 | TC-BR-026 / TC-BR-052 | **Do not repair.** Fix the application or accept the findings |

## 10. Inputs for Reporting Skill

| Input `reporting-skill` §4 declares it needs | Present? | Location |
|---|---|---|
| Execution Results (single file) | Yes | this file |
| Per-test ID / Script ID / Status / Time / Evidence refs | Yes | §3 |
| Evidence paths | Yes | §4 → `execution/artifacts/exec-0806c/` |
| Metrics | Yes | §5 |
| Separated health figures | Yes | §6 |
| Manual Test Suite / Traceability Matrix / Project Context | Yes (pass-through) | `modules/branch/test_design/`, `modules/branch/context/` |

**Handoff confirmation:** complete. A Stage 6A report must carry three things from here or it will misrepresent the run: that Approve/Reject **never executed**, that Update Branch is **unverified rather than failing**, and that only **2 of the 14 failures are application defects**, both already known.
