# Execution Results — run-003__2026-08-04_11-24-38__UserStory__US-8599-SearchActions_US-8606-UpdateBranch (rerun-4)

**Note on cycle labelling:** a Stage `5A` **direct invocation** — the first *full* Create Branch execution against the code produced by healing pass `HEAL-BR-20260806-01`. Filed as `rerun-4`; `ExecutionResults.md` (cycle 1), `.rerun-1.md` (Stage 5H), `.rerun-2.md` (Stage 5A), and `.rerun-3.md` (Stage 5A, pre-healing) are untouched.

## 1. Execution Metadata

| Field | Value |
|---|---|
| Execution ID | EXEC-BR-20260806-02 |
| Run Folder | `run-003__2026-08-04_11-24-38__UserStory__US-8599-SearchActions_US-8606-UpdateBranch` |
| Execution cycle | 5 (Stage 5A, post-healing) |
| Modules executed | branch |
| Module scope | single |
| Run Scope Type / Run Type | User Story (US-8605 Create Branch) / Partial Suite |
| Environment | Staging (STG), shared internal/LAN |
| Target URL | `http://192.168.1.70` |
| Framework | SHAFT Engine 7.4.20231015 (Java) / TestNG |
| Suite executed | `modules/branch/automation/tests_SHAFT/` (module working copy), scoped to `CreateBranch_Admin_TC`, all 13 methods |
| Suite code state | **Post-healing, `Pending Automation Approval`** — contains REPAIR-BR-001…007 from `modules/branch/healing/RepairSummary.md` (pass HEAL-BR-20260806-01), not yet approved and not merged to the baseline |
| Scope mechanism | `-Dsurefire.suiteXmlFiles=<scratchpad>/testng-createbranch.xml` — scoping-only suite file held outside the package (the approved `testng.xml` still cannot load; see §8 KL-02) |
| Execution Mode | Headed (`headlessExecution=false` in the working tree; the committed value is `true` — a pre-existing uncommitted change this stage did not make) |
| Concurrency Mode | Sequential |
| Retry Policy | No automatic retry |
| Started | 2026-08-06T11:30:22+03:00 |
| Ended | 2026-08-06T11:34:52+03:00 |

## 2. Execution Summary

All 13 Create Branch test cases executed, none skipped or blocked: **7 Passed, 6 Failed** (TestNG: `Tests run: 13, Failures: 6, Errors: 0, Skipped: 0`, 4 min 28 s). Against the pre-healing baseline of 11 Passed / 2 Failed, the headline count is worse, and the reason is the one the healing pass already recorded: four negative test cases that used to pass on an assertion that could not fail now fail loudly on a real, previously-masked automation defect. Of the 6 failures, **1 is an expected `Application Failure`** (TC-BR-026 / FINDING-004, unchanged), and **5 are `Automation Failure`** — TC-BR-001, still blocked at submit with the sole remaining validation label `FlightOthers` and zero `Required` errors, and TC-BR-002 / 013 / 021 / 038, all timing out on the same wait for `#id-Country` to auto-fill on a re-opened form. TC-BR-038 passed in the healing pass's 5-test rerun and failed here in the 13-test run, which is a cross-execution divergence recorded in §5. This execution modified no automation code.

## 3. Execution Results

| Test Case ID | Automation Script ID | Status (§17) | Execution Time | Attempts | Failure Detail | Evidence Refs |
|---|---|---|---|---|---|---|
| TC-BR-001 | `::tcBr001_createBranchWithAllMandatoryFields` | **Automation Failure** | 6.122 s | 1 | `AssertionError: Expected the Branch to be saved with status "Pending for approval."` — browser stayed on `/admin/branch/add`. `[DIAG8] errors=FlightOthers` and **zero `Required` errors** (was 11 pre-healing); the only empty fields left are the three optional ones (Address 2, Service Tax Number, ABTA Number) plus the unselected supplier rows | `artifacts/exec-0806b/maven-console.log`; `artifacts/exec-0806b/allure/` |
| TC-BR-002 | `::tcBr002_mandatoryBranchDetailsFieldsBlockSubmissionWhenEmpty` | **Automation Failure** | 31.060 s | 1 | 20s `Timeout` in `AddBranch_Page.openDependentDropdown` (line 308) — `#id-Country` never auto-fills on a **re-opened** form, so the Operating Country selection is not committing on loop iterations past the first | as above |
| TC-BR-004 | `::tcBr004_countryAutoFillsFromOperatingCountry` | Passed | 0.982 s | 1 | — | `artifacts/exec-0806b/allure/` |
| TC-BR-013 | `::tcBr013_mandatoryEmailConfigFieldsBlockSubmissionWhenEmpty` | **Automation Failure** | 33.925 s | 1 | Same as TC-BR-002 | as above |
| TC-BR-021 | `::tcBr021_mandatorySalesConfigFieldsBlockSubmissionWhenEmpty` | **Automation Failure** | 32.350 s | 1 | Same as TC-BR-002 | as above |
| TC-BR-024 | `::tcBr024_reachingPercentageRejectsValueGreaterThan100` | Passed | 0.237 s | 1 | — | `artifacts/exec-0806b/allure/` |
| TC-BR-025 | `::tcBr025_reachingPercentageAcceptsThreeDecimalPlaces` | Passed | 0.182 s | 1 | — | `artifacts/exec-0806b/allure/` |
| TC-BR-026 | `::tcBr026_warningPromptRejectsValueExceeding11Digits` | **Application Failure** | 0.334 s | 1 | `AssertionError: Warning Prompt (Days) should be capped at 11 digits, but retained 15 characters: "999999999999999" (FINDING-004, still open)`. **Expected failure, disclosed in advance.** Must not be repaired | `artifacts/exec-0806b/maven-console.log` |
| TC-BR-028 | `::tcBr028_selectAtLeastOnePaymentOption` | Passed | 0.155 s | 1 | — | `artifacts/exec-0806b/allure/` |
| TC-BR-030 | `::tcBr030_descriptionEnabledOnlyWhenSupplierRowSelected` | Passed | 0.911 s | 1 | — | `artifacts/exec-0806b/allure/` |
| TC-BR-037 | `::tcBr037_createBranchWithValidOutstandingThreshold` | Passed | 0.205 s | 1 | — | `artifacts/exec-0806b/allure/` |
| TC-BR-038 | `::tcBr038_outstandingThresholdBlocksSubmissionWhenEmpty` | **Automation Failure** | 21.114 s | 1 | Same wait as TC-BR-002. **Diverges from the healing pass**, where this case passed — see §5 | as above |
| TC-BR-039 | `::tcBr039_outstandingThresholdAcceptsNumericValue` | Passed | 0.211 s | 1 | — | `artifacts/exec-0806b/allure/` |

All script IDs are methods of `AdminPages.Admin.Branch.CreateBranch_Admin_TC`.

## 4. Evidence Inventory

| Evidence Type | Captured? | Location / Reason |
|---|---|---|
| Execution Logs | Yes | `artifacts/exec-0806b/maven-console.log` |
| Framework Reports | Yes | `artifacts/exec-0806b/ExecutionSummaryReport_*.html`; `artifacts/exec-0806b/allure/` (this execution's Allure results only) |
| Screenshots | Yes | `*-attachment.png` within `artifacts/exec-0806b/allure/` |
| Failure Artifacts | Yes | Stack traces in `artifacts/exec-0806b/surefire/`; the in-test `[DIAG8]` DOM probes for TC-BR-001 |
| Test Runner Reports | Yes | `artifacts/exec-0806b/surefire/` |
| Videos / Execution Traces / Browser Console / HAR | No | Not enabled in this project's SHAFT configuration (Videos, console, HAR) and not a capability of this Selenium-backed version (traces) — unchanged from EXEC-BR-20260806-01 |

## 5. Execution Statistics

| Metric | Value |
|---|---|
| Execution Duration | 4 min 28 s |
| Tests in scope / executed | 13 / 13 |
| Pass Rate | 7/13 = **53.8%** (denominator = executed; nothing Skipped/Blocked/Not Executed) |
| Failure Rate (Application) | 1/13 = **7.7%** (TC-BR-026 only) |
| Skip Rate | 0% |
| Retry Count | 0 |
| Evidence Count | 119 files |
| Framework / Mode / Environment | SHAFT 7.4.20231015 + TestNG / Headed / STG `http://192.168.1.70` |
| Coverage Summary (cited, not recomputed) | 13/13 in-scope cases automated = 100%, per `AutomationCoverageReport_SHAFT.md` |
| Flaky Test Count (within this execution) | 0 — no test was attempted more than once here |
| Execution Stability | 0/13 flaky within this execution |

**Cross-execution divergence (§23), reported rather than absorbed:** TC-BR-038 **passed** in healing pass HEAL-BR-20260806-01's targeted rerun and **failed** here, on identical code. The two runs differ in scope — 5 methods there, 13 here — so the conditions were not identical and this is not recorded as `Flaky` within either execution. It is nonetheless a reproducibility concern pointing at order- or state-dependence between tests, and is listed for investigation in §9 (REC-04). No test was re-run to make it agree.

## 6. Health Summary

| Figure | Count | What it means |
|---|---|---|
| **Application Health** | **1 failure** — TC-BR-026 | The only figure about the application itself, and it is **unchanged across every execution this session**: one known, previously-recorded open defect (FINDING-004). Healing did not move it, as required |
| **Automation Health** | **5 failures** — TC-BR-001, 002, 013, 021, 038 — plus 1 non-loadable suite declaration (§8 KL-02) | Was 1 pre-healing. The increase is the healing pass's disclosed outcome: 4 assertions that could not fail now can, and they fail on a real defect (§8 KL-01) |
| **Environment Health** | **0 failures** | STG reachable, Super Admin login succeeded on all 13 tests |
| Inconclusive / Flaky | 0 / 0 | Folded into none of the above |

## 7. Self-Healing Availability

```
  5 Automation Failures recorded. Self-healing is available but never automatic:
      /self-healing-skill            analyse every Automation Failure
      /self-healing-skill branch     scope the pass to named modules
```

Naming the option is not invoking it, and is not a recommendation to invoke it. Two cautions a reader
must carry into any such pass:

- **TC-BR-026 is out of scope for healing entirely** — `Application Failure`, FINDING-004.
- **TC-BR-001's next step is diagnosis, not repair.** `modules/branch/healing/RepairSummary.md` §11
  records its Root Cause Confidence as **Medium** (the `FlightOthers` label is present even on an
  untouched form), and §7.1 permits only diagnosis at Medium.
- TC-BR-001's cumulative repair-attempt count is now **2**. A third failed repair attempt quarantines it (§14).

## 8. Known Limitations

| ID | Limitation |
|---|---|
| KL-01 | The four now-failing negative cases (TC-BR-002 / 013 / 021 / 038) previously passed only because `assertSubmissionBlocked()` checks nothing but the URL, so submission being blocked *for any reason* satisfied them. Their failure here is the loss of a false pass, not the loss of working coverage. Strengthening those assertions to name each field's own `Required` message is a Stage 3 / `4A` change |
| KL-02 | `testng.xml` still declares `AdminPages.Admin.Branch.BranchActions_TC`, which does not exist in the project — the approved suite file cannot load. Unchanged; healing does not touch Stage `4A` package defects |
| KL-03 | `EnvironmentConfig.java:56-57` hardcodes and commits the STG Super Admin credentials, contradicting `AutomationSummary_SHAFT.md` §7. Unchanged |
| KL-04 | Both this execution and every repair verification behind it ran **Headed**. The repairs are unverified headless, and the committed `execution.properties` says `headlessExecution=true` — so a CI run would exercise an untested mode |
| KL-05 | This execution ran a suite that is `Pending Automation Approval`. It is a verification of healing's effect, not a run of approved code, and nothing here authorizes a merge to the baseline |

## 9. Execution Recommendations

| ID | Applies to | Recommended smallest corrective action |
|---|---|---|
| REC-01 | TC-BR-001 | Diagnose, do not repair (Medium confidence). One probe that submits a fully-populated form and records verbatim what the application returns, plus a Debug-mode single-test run capturing the DOM and a screenshot at the moment of submit — enough to settle whether `FlightOthers` is a blocking validation on the Product Access Flight/Others group or an always-present element the diagnostic selector merely matches |
| REC-02 | TC-BR-002 / 013 / 021 / 038 | Diagnose the specific difference the evidence points at: re-open the Add Branch form in a probe and repeat the Operating Country selection, to find why `#id-Country` auto-fills on a first load but not on a re-opened one. All four share this single cause |
| REC-03 | KL-01 | Strengthen `assertSubmissionBlocked()` to assert the specific field's own validation message (Stage 3 / `4A`) |
| REC-04 | TC-BR-038 divergence | Re-run the 5-test and 13-test scopes back to back, unchanged, to establish whether the difference is order/state dependence between tests. Do not re-run repeatedly to obtain a pass |
| REC-05 | KL-04 | Re-verify the repairs with `-DheadlessExecution=true` before any merge |
| REC-06 | KL-02 / KL-03 | Stage `4A`: fix the `testng.xml` declaration; reconcile the credential documentation and rotate the exposed password |
| REC-07 | TC-BR-026 | **Do not repair.** Fix the application or accept the finding. Re-run once FINDING-004 is closed |
| REC-08 | Approval | The suite remains `Pending Automation Approval` (`RepairSummary.md` §12). A reviewer weighing it should read this file's §6 alongside `healing/BeforeAfterComparison.md` |

## 10. Inputs for Reporting Skill

| Input `reporting-skill` §4 declares it needs | Present? | Location |
|---|---|---|
| Execution Results (single file) | Yes | this file |
| Per-test ID / Script ID / Status / Time / Evidence refs | Yes | §3 |
| Evidence paths | Yes | §4 → `execution/artifacts/exec-0806b/` |
| Metrics | Yes | §5 |
| Separated health figures | Yes | §6 |
| Manual Test Suite | Yes (Stage 3 pass-through) | `modules/branch/test_design/TestCases_Branch.md` |
| Traceability Matrix | Yes (Stage 3 pass-through) | `modules/branch/test_design/TraceabilityMatrix.md` |
| Project Context | Yes (Stage 1 pass-through) | `modules/branch/context/ProjectContext.md` |

**Handoff confirmation:** complete. A Stage 6A report drawing on this file must carry §6's separation and
§8 KL-01 — a bare "7 of 13 passed, down from 11" would misrepresent what changed.
