# Execution Results — run-003__2026-08-04_11-24-38__UserStory__US-8599-SearchActions_US-8606-UpdateBranch (rerun-16)

**Note on cycle labelling:** Continuation of the planned full execution of all 29 currently executable Branch test cases, requested 2026-08-14, using the same declared mode (Headed) and the same scoping-only suite XML as `rerun-15`. **No code, test data, configuration, assertion, or suite-membership file was modified before or during this execution** — confirmed unchanged since `rerun-15` (same git HEAD, same `AddBranch_Page.java` content hash).

## 1. Execution Metadata

| Field | Value |
|---|---|
| Execution ID | `EXEC-BR-20260814-09` |
| Run Folder | `run-003__2026-08-04_11-24-38__UserStory__US-8599-SearchActions_US-8606-UpdateBranch` |
| Execution cycle | 17 |
| Suite executed | `artifacts_rerun-16/testng-full-executable.xml` (byte-identical copy of `rerun-15`'s scoping-only suite file) |
| Execution Mode | **Headed** (`-DheadlessExecution=false`), your explicit choice |
| Exact command | `mvn -q test -Dsurefire.suiteXmlFiles="<abs path>/artifacts_rerun-16/testng-full-executable.xml" -DheadlessExecution=false -Drp.endpoint=http://localhost:8080 -Drp.enable=false` |
| Authorization | Fresh, run-scoped: `AUTH-BRANCH-CREATE/UPDATE/SUBMIT/APPROVE-SelfCreated`, re-created 2026-08-14T15:21:53.805Z, all evaluated `Allowed` before execution |
| Maven/process exit code | **1** (7 of 29 executed tests failed) |
| SHAFT summary | `Total Cases: 29 --> Passed: 22 | Failed: 7 | Skipped: 0` |

## 2. Result summary

No test was skipped; the execution was not stopped early. Every one of the 29 declared tests ran to its own completion, each in its own fresh browser session. TC-BR-056/057/058 remain **Not Executed** (`BranchActions_TC.java` still does not exist).

## 3. Comparison against `rerun-15` (same suite, same unmodified code, ~15 minutes apart)

| Test | `rerun-15` | `rerun-16` | Pattern |
|---|---|---|---|
| TC-BR-013 | Failed (Credential open-commit) | **Passed** | Did not reproduce — consistent with the Intermittent/Flaky classification already recorded |
| TC-BR-021 | Failed (Credential open-commit, iteration 1) | **Passed** | Did not reproduce — same classification |
| TC-BR-030 | Failed (Description-enabled assertion) | **Passed** | Did not reproduce |
| TC-BR-041 | Failed — expected row "Emirates NDC" not in grid | **Failed again — same assertion, same missing row** | **Reproduced identically**, 2 of 2 |
| TC-BR-043 | Failed — empty-state message not detected | **Failed again — identical message** | **Reproduced identically**, 2 of 2 |
| TC-BR-045 | Failed — Both(506) ≠ Active+Inactive(1012) | **Failed again — Both(507) ≠ Active+Inactive(1014), same pattern (counts grew by 1 from new self-created records, same relationship)** | **Reproduced identically**, 2 of 2 |
| TC-BR-026 | Failed (`FINDING-004`) | Failed (`FINDING-004`) | Reproduced, as expected (known Confirmed Application Failure) |
| TC-BR-052 | Failed (`FINDING-012`) | Failed (`FINDING-012`) | Reproduced, as expected (known Confirmed Application Failure) |
| TC-BR-054 | Failed (10-page scan-bound precondition) | Failed (same precondition) | Reproduced, as expected (known Confirmed Automation Failure, unrepaired) |
| TC-BR-046 | *(not in `rerun-15`'s failure list — passed that cycle)* | **Failed — `NoSuchElementException: option never became clickable`, clicking the Country dropdown** | Matches the pre-existing, already-documented failure signature first recorded 2026-08-09 (`rerun-5`/`6`/`7`), not a new defect |

**No recurrence of the Credential-dropdown open-commit signature this cycle** (TC-BR-013, TC-BR-021, and every other Credential-dependent test passed cleanly). Per your instruction, this absence is recorded as-is — it is not treated as resolution, and no repair or retry-count change was made.

## 4. Exact failures, this cycle (full detail)

```
CreateBranch_Admin_TC.tcBr026_warningPromptRejectsValueExceeding11Digits:153
  Warning Prompt (Days) should be capped at 11 digits, but retained 15 characters:
  "999999999999999" (FINDING-004, still open) expected [true] but found [false]

SearchBranch_TC.tcBr041_searchByBranchNameReturnsMatchingRecord:88
  Expected a row named "Emirates NDC"; the grid returned [QA_1925805352563400, QA_1924166850960800,
  QA_1921746026389000, QA_1921426639455500, NDC2_Ahmed Alhussieny, Anglea_ee4e8e, Test,
  Uplift2_Mohanad Dawood, Uplif1_Ahmed Refat Galal, Uplif1_Ahmed Mohamed AbdelDaiem]
  expected [true] but found [false]

SearchBranch_TC.tcBr043_searchWithNonMatchingCriteriaShowsEmptyState:121
  Expected the empty-state message for Branch Code ZZZZQQ9. expected [true] but found [false]

SearchBranch_TC.tcBr045_statusFilterReturnsOnlyRecordsMatchingSelectedStatus:143
  Expected Both (507) to equal Active (507) plus Inactive (507). expected [1014] but found [507]

SearchBranch_TC.tcBr046_stateFilterStaysDisabledUntilCountrySelected:166
  NoSuchElementException: option never became clickable
  (log: 3 clicks dispatched on the Country dropdown ancestor at 06:31:21, :27, :33 PM, ~6s apart,
  before the option-click itself threw)

SearchBranch_TC.tcBr052_resultsGridDisplaysAllSpecifiedColumns:200
  Grid is missing required column(s) [Branch Code, State]. Headers rendered:
  [Code, Branch Name, Country Name, City, Approval Status, Actions]. FINDING-012 confirms the State
  column is absent -- this assertion asserts the corrected behaviour and must not be weakened to
  match the defect. expected [true] but found [false]

SearchBranch_TC.tcBr054_rowActionIconsMatchApprovalState:236->assertIconsForStatus:272
  Unmet precondition: no row with Approval Status "Rejected" was found within 10 pages, so its icon
  set could not be verified. This is an environment data gap, not an application defect.
```

## 5. Screenshots, Logs, Reports

| Evidence | Location |
|---|---|
| Full console log | `artifacts_rerun-16/maven-console.log` |
| Surefire report | `artifacts_rerun-16/surefire/TEST-TestSuite.xml` — 29 tests, 7 failures |
| Scoping input | `artifacts_rerun-16/testng-full-executable.xml` (byte-identical to `rerun-15`'s) |

## 6. Quarantine Register Cross-Reference

TC-BR-001 passed again this cycle. Per the established rule, this does not move it out of `Quarantined` — the original quarantine cause remains unresolved and independent of this result.

## 7. No repair, rerun, or speculative classification update performed

This artifact records raw evidence and the reproduction pattern across two consecutive full-execution cycles. No code was changed. No retry count was increased. No new classification beyond what the evidence directly shows was applied.
