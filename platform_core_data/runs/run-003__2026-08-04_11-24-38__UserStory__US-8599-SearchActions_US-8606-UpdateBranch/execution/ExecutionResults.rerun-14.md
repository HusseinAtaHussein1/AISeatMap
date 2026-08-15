# Execution Results — run-003__2026-08-04_11-24-38__UserStory__US-8599-SearchActions_US-8606-UpdateBranch (rerun-14)

**Note on cycle labelling:** Targeted regression verification of exactly **TC-BR-002, TC-BR-013, TC-BR-021, TC-BR-038**, requested 2026-08-14, to confirm the shared `clickSubmit()` validation-settle wait and normal-click Submit (repaired this session for TC-BR-066/067/068/069) did not break these negative Create Branch tests. **TC-BR-001 (quarantined) was deliberately excluded.** **No code, configuration, or test file was modified before or during this execution.**

## 1. Execution Metadata

| Field | Value |
|---|---|
| Execution ID | `EXEC-BR-20260814-07` |
| Run Folder | `run-003__2026-08-04_11-24-38__UserStory__US-8599-SearchActions_US-8606-UpdateBranch` |
| Execution cycle | 15 |
| Modules executed | branch |
| Run Scope Type | Selective regression run — exactly 4 tests, no others |
| Environment | Staging (STG) |
| Target URL | `http://192.168.1.70` |
| Suite executed | `artifacts_rerun-14/testng-verify-002-013-021-038.xml` (new, scoped to exactly these 4 tests) |
| Suite code state | Unchanged — no repair applied this cycle |
| Execution Mode | **Headed** (`-DheadlessExecution=false`), per explicit instruction |
| Exact command | `mvn -q test -Dsurefire.suiteXmlFiles="<abs path>/artifacts_rerun-14/testng-verify-002-013-021-038.xml" -DheadlessExecution=false -Drp.endpoint=http://localhost:8080 -Drp.enable=false` |
| Authorization | Fresh, explicitly re-approved this cycle: `AUTH-BRANCH-CREATE-SelfCreated`, re-created 2026-08-14T14:41:08.618Z, evaluated `Allowed` before execution. No UPDATE/SUBMIT/APPROVE action occurs in any of these 4 tests — none was requested |
| Start | 2026-08-14T17:42:22 (local, PM) | End | 2026-08-14T17:46:12 (local, PM) |
| Maven/process exit code | **1** (1 of 4 tests failed) |
| SHAFT summary | `Total Cases: 4 --> Passed: 3 | Failed: 1 | Skipped: 0` |

**One artifact-only correction made before execution, disclosed here:** the first attempt to run this suite (17:38 local) failed at XML-parse time — `org.xml.sax.SAXParseException: The string "--" is not permitted within comments` — because this run's own newly-authored suite-file comment (not a production file) used `--` as a prose dash inside an XML comment, which is invalid XML. The comment text was corrected to remove the `--` before any test executed; **no test-, page-object-, or configuration-file changed**, and no test ran during that first, failed attempt (Maven failed at suite-load time, before any browser opened). This is disclosed rather than silently omitted, per the "no hidden retry" requirement, even though it precedes the counted execution rather than occurring during it.

## 2. Per-iteration evidence — every field-omission loop iteration recorded independently

**Governing rule, per explicit instruction: application-side blocking (URL still contains `/admin/branch/add`) is what satisfies each negative assertion. The validation-settle wait itself is never treated as the expected block — it only waits for Branch Name's async pending state to clear before Submit is clicked; `assertSubmissionBlocked()` separately and independently checks the URL.**

### 2.1 TC-BR-002 — `tcBr002_mandatoryBranchDetailsFieldsBlockSubmissionWhenEmpty` — **Passed** (7/7 iterations)

Fields under test, in loop order: `operatingCountry`, `name`, `state`, `city`, `address1`, `postOfficeBox`, `phoneNumber`.

| Iteration | Omitted field | Credential selection | Submit reached after validation settled | Navigation state after Submit | Persistence | Final assertion |
|---|---|---|---|---|---|---|
| 1 | `operatingCountry` | "Live" selected, 1st attempt, no retry | Yes — `Click "Send For Approval".` logged | Blocked — URL still `/admin/branch/add` | Not applicable (blocked) | `assertSubmissionBlocked()` **Passed** |
| 2 | `name` | Same | Yes | Blocked — same URL | Not applicable | **Passed** |
| 3 | `state` | Same | Yes | Blocked — same URL | Not applicable | **Passed** |
| 4 | `city` | Same | Yes | Blocked — same URL | Not applicable | **Passed** |
| 5 | `address1` | Same | Yes | Blocked — same URL | Not applicable | **Passed** |
| 6 | `postOfficeBox` | Same | Yes | Blocked — same URL | Not applicable | **Passed** |
| 7 | `phoneNumber` | Same | Yes | Blocked — same URL | Not applicable | **Passed** |

All 7 iterations show an identical pattern in the console log: `Click element.` / `Click "Live".` (Credential committed, first attempt, no retry-diagnostic text in any of the 7) / `Click "Send For Approval".` / `Get current url` reads `http://192.168.1.70/admin/branch/add` / `Assertion "ValidateBrowserAttribute" PASSED... Comparison Type "CONTAINS"`. No `StaleElementReferenceException`, no `IllegalStateException`, in any of the 7.

### 2.2 TC-BR-013 — `tcBr013_mandatoryEmailConfigFieldsBlockSubmissionWhenEmpty` — **Passed** (2/2 iterations)

Fields under test: `branchEmailId`, `emailPassword`.

| Iteration | Omitted field | Credential selection | Submit reached | Navigation state | Persistence | Final assertion |
|---|---|---|---|---|---|---|
| 1 | `branchEmailId` | "Live" selected, 1st attempt, no retry | Yes | Blocked — same URL | Not applicable | **Passed** |
| 2 | `emailPassword` | "Live" selected, 1st attempt, no retry | Yes | Blocked — same URL | Not applicable | **Passed** |

Both iterations clean, no retries, no exceptions.

### 2.3 TC-BR-021 — `tcBr021_mandatorySalesConfigFieldsBlockSubmissionWhenEmpty` — **Failed** (iteration 1 of 3; iterations 2-3 never executed this cycle)

Fields under test, in loop order: `creditLimit`, `topUpLimit`, `creditTermsDays`.

| Iteration | Omitted field | Outcome |
|---|---|---|
| 1 | `creditLimit` | **Failed** — inside `fillMandatoryBaseline()`, before Submit was ever reached (see exact evidence below) |
| 2 | `topUpLimit` | **Not executed this cycle** — the loop aborted on iteration 1's uncaught exception; this iteration never ran |
| 3 | `creditTermsDays` | **Not executed this cycle** — same reason |

**Exact failure, iteration 1 (`creditLimit`), verbatim from the console log:**

```
java.lang.IllegalStateException: Credential dropdown open action did not commit after 3 interaction attempt(s).
History: [
  Interaction attempt 1: click dispatched, no commit signal within 2s --
    requestedValue="Live"; dropdownMatchCount=1;
    dropdownState={ariaDisabled=null, className=p-dropdown p-component p-dropdown-clearable, disabledAttr=null,
      outerHtmlSnippet=<div class="p-dropdown p-component p-dropdown-clearable"><div class="p-hidden-accessible">
      <input type="text" readonly="" aria-haspopup="listbox" pautofocus="" role="combobox" class="p-element"
      id="id-supplier-199" placeholder="Select" aria-expanded="false"></div><!----><span class="p-dropdown-label ,
      pointerEvents=auto, visibleLabel=Select}; overlayPanelCount=0;
  | Interaction attempt 2: click dispatched, no commit signal within 2s -- (identical state, overlayPanelCount=0, aria-expanded="false")
  | Interaction attempt 3: click dispatched, no commit signal within 2s -- (identical state, overlayPanelCount=0, aria-expanded="false")
]
    at AdminPages.Admin.Branch.AddBranch_Page.openCredentialDropdownWithRetry(AddBranch_Page.java:738)
    at AdminPages.Admin.Branch.AddBranch_Page.selectFirstSupplierCredential(AddBranch_Page.java:596)
    at AdminPages.Admin.Branch.AddBranch_Page.fillMandatoryBaseline(AddBranch_Page.java:1143)
    at AdminPages.Admin.Branch.CreateBranch_Admin_TC.tcBr021_mandatorySalesConfigFieldsBlockSubmissionWhenEmpty(CreateBranch_Admin_TC.java:108)
```

**What the console log shows, in full, for this test method:** exactly 3 `Click element.` lines (05:45:30, 05:45:32, 05:45:35 PM — the 3 dispatched clicks the exception's history describes), then immediately teardown. **No `Click "Live".` line appears anywhere in this test's log** — unlike every other Credential selection in this run and in `rerun-12`/`rerun-13`, where `Click "Live".` follows `Click element.` within the same second. **No `Click "Send For Approval".` line appears.** This is therefore a failure entirely inside provisioning, before Submit was ever attempted — the test never reached the condition it exists to test.

**State observed across all 3 attempts, per the exception's own diagnostics:** `overlayPanelCount=0` and `aria-expanded="false"` on every attempt, with no change in `dropdownState` between attempts 1, 2, and 3 — i.e. the dropdown click was dispatched three times and the DOM shows no observable difference after any of them. This is the identical symptom signature the Credential open-commit retry (`openCredentialDropdownWithRetry()`) was written this session to detect and retry through — and formally verified passing for TC-BR-069 in `rerun-12`/`rerun-13`, and passing cleanly (first attempt, no retry needed) in this same run's own TC-BR-002 (7/7) and TC-BR-013 (2/2) iterations, all using the identical method.

**Persistence:** not applicable — the test never reached a Submit attempt, so there is nothing that could have been persisted.

**Per the explicit instruction against hidden retry or automatic repair: no further attempt, diagnosis, or repair was made. This finding is reported as raw evidence, and execution of this regression group stops here.**

### 2.4 TC-BR-038 — `tcBr038_outstandingThresholdBlocksSubmissionWhenEmpty` — **Passed** (1/1 iteration)

| Iteration | Omitted field | Credential selection | Submit reached | Navigation state | Persistence | Final assertion |
|---|---|---|---|---|---|---|
| 1 | `outstandingThreshold` | "Live" selected, 1st attempt, no retry | Yes | Blocked — same URL | Not applicable | **Passed** |

## 3. Attempts and internal retries — recorded per instruction, none hidden

- TC-BR-002: 7 iterations, each with a single Credential-open interaction attempt (no retry needed in any). No `StaleElementReferenceException`.
- TC-BR-013: 2 iterations, same pattern.
- TC-BR-021: iteration 1 exhausted **all 3** of `openCredentialDropdownWithRetry()`'s configured interaction attempts, none of which committed — this is the method's own designed failure mode (throwing after its attempt budget is exhausted), not a silent retry. Iterations 2-3 did not run.
- TC-BR-038: 1 iteration, single attempt, no retry.

## 4. Screenshots, Logs, Reports

| Evidence | Location |
|---|---|
| Full console log (all 4 tests, full stack trace) | `artifacts_rerun-14/maven-console.log` |
| Surefire report | `artifacts_rerun-14/surefire/TEST-TestSuite.xml` — 4 tests, 1 failure |
| Scoping input | `artifacts_rerun-14/testng-verify-002-013-021-038.xml` (new, corrected once for an XML-comment syntax error before any test ran — see §1 note) |

## 5. Health Summary

| Figure | Count |
|---|---|
| Automation Health | 3/4 test methods passed cleanly across all their own iterations (10 of 10 field-omission iterations passed across TC-BR-002/013/038); 1/4 (TC-BR-021) failed on its own first iteration, inside shared provisioning, before reaching its own assertion |
| Application Health | 0 confirmed application defects this cycle |
| Environment Health | 0 confirmed this cycle — not yet established as the cause of TC-BR-021's failure |
| Regression status | **Not clean.** TC-BR-021 previously passed (`RepairSummary.md` HEAL-BR-20260806-01, confirmed Passed `EXEC-BR-20260806-03`) and has now failed, on the exact symptom signature the Credential open-commit retry was built to resolve, in the same method that passed cleanly 9 times elsewhere in this same run (7× TC-BR-002, 2× TC-BR-013) and twice more in `rerun-12`/`rerun-13` (TC-BR-069, TC-BR-067's own Credential step). Root cause of this specific occurrence is **not established** — this could be genuine intermittency in the repaired retry logic, an environment/timing condition specific to this iteration, or something else; no conclusion is drawn here |

## 6. Quarantine Register Cross-Reference

**TC-BR-001's quarantine is unaffected by this run and remains open** (`QuarantineRegister.md`) — TC-BR-001 was deliberately excluded from this regression group and this run does not touch that record.

## 7. Reconciled Totals — updated based on this verified result only (iterations not counted as separate test cases)

| Bucket | Count | Test Case IDs | Change this cycle |
|---|---|---|---|
| **Confirmed Passed** | **23** | Previous 24 minus **TC-BR-021** (moved out this cycle) | **-1** |
| **Confirmed Application Failures** | 2 | TC-BR-026, TC-BR-052 | No change |
| **Confirmed Automation Failures** | 1 | TC-BR-054 | No change |
| **Inconclusive / Needs Diagnosis** | **2** | TC-BR-046, **TC-BR-021** (2026-08-14, `EXEC-BR-20260814-07` — regression failure on its first iteration, identical symptom to the already-repaired Credential open-commit defect, root cause not established; iterations 2-3 never executed this cycle) | **+1** |
| **Not Executed / Unverified** | 3 | TC-BR-056, 057, 058 | No change |
| **Quarantined** | 1 | TC-BR-001 | No change — remains open |
| **Total** | **32** | | 23+2+1+2+3+1 = 32 ✓ |

## 8. Recommendations

- **TC-BR-002, TC-BR-013, TC-BR-038:** confirmed passing across all their own field-omission iterations. No regression observed in these three.
- **TC-BR-021:** stopped here per instruction. Recommend a live, read-only diagnosis of this specific occurrence (e.g. re-running this one test in isolation, headed, with close observation of the Credential dropdown's timing) before proposing any repair — do not assume this is the same root cause as the original, already-repaired defect merely because the symptom matches.
- **No code was changed, and no repair or rerun was attempted**, per the explicit instruction to stop after this regression group.
