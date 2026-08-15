# Execution Results — run-003__2026-08-04_11-24-38__UserStory__US-8599-SearchActions_US-8606-UpdateBranch (rerun-15)

**Note on cycle labelling:** Full execution of all 29 currently executable Branch test cases, requested 2026-08-14. This is a raw evidence record only — no root-cause classification is asserted here beyond what was already established in prior cycles; new failures are recorded as observed, not diagnosed. **No code, test data, configuration, assertion, or suite-membership file was modified before or during this execution.**

## 1. Execution Metadata

| Field | Value |
|---|---|
| Execution ID | `EXEC-BR-20260814-08` |
| Run Folder | `run-003__2026-08-04_11-24-38__UserStory__US-8599-SearchActions_US-8606-UpdateBranch` |
| Execution cycle | 16 |
| Modules executed | branch |
| Run Scope Type | Full module execution — all structurally executable cases |
| Environment | Staging (STG) |
| Target URL | `http://192.168.1.70` |
| Suite executed | `artifacts_rerun-15/testng-full-executable.xml` (new; scoping-only workaround, user-approved — see §2) |
| Execution Mode | **Headed** (`-DheadlessExecution=false`), user's explicit choice |
| Exact command | `mvn -q test -Dsurefire.suiteXmlFiles="<abs path>/artifacts_rerun-15/testng-full-executable.xml" -DheadlessExecution=false -Drp.endpoint=http://localhost:8080 -Drp.enable=false` |
| Authorization | Fresh, run-scoped: `AUTH-BRANCH-CREATE-SelfCreated`, `AUTH-BRANCH-UPDATE-SelfCreated`, `AUTH-BRANCH-SUBMIT-SelfCreated`, `AUTH-BRANCH-APPROVE-SelfCreated`, all re-created 2026-08-14T14:58:42.270Z, all evaluated `Allowed` before execution. SelfCreated records only |
| Start | ~05:59:50 PM (local) | End | ~06:13:03 PM (local) |
| Maven/process exit code | **1** (9 of 29 executed tests failed) |
| SHAFT summary | `Total Cases: 29 --> Passed: 20 | Failed: 9 | Skipped: 0` |

## 2. Structural availability and the approved-runner conflict

**testng.xml (the module's approved runner) cannot load.** It declares `BranchActionsSuite` → `AdminPages.Admin.Branch.BranchActions_TC`, and that class has never been generated (confirmed again this cycle — no such file exists under `tests_SHAFT/src/test/java/AdminPages/Admin/Branch/`). TestNG fails to parse the whole XML file when a declared class does not exist, so pointing Maven directly at `testng.xml` fails before any test runs — it does not produce a 29-tests-run/3-not-executed result.

**Per your explicit decision**, this cycle used `artifacts_rerun-15/testng-full-executable.xml` — a scoping-only suite file kept outside the `AdminPages` package, declaring the exact same 3 `<test>` blocks as `testng.xml` (`CreateBranchSuite`, `SearchBranchSuite`, `UpdateBranchSuite`), each with its single class and zero method filtering, in the same relative order, at the same verbosity. Only the one `<test>` block that cannot load (`BranchActionsSuite`) is omitted. **`testng.xml` itself was not modified.** Its full contents are reproduced below.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE suite SYSTEM "https://testng.org/testng-1.0.dtd">
<!--
    Full execution of all 29 currently executable Branch test cases, requested 2026-08-14. This is a
    scoping-only workaround for the approved testng.xml's own load failure: testng.xml declares
    BranchActionsSuite -> AdminPages.Admin.Branch.BranchActions_TC, and that class has never been
    generated (Stage 4A packaging gap, unresolved), so TestNG cannot parse testng.xml at all in its
    current form. This file is byte-for-byte identical to testng.xml in every other respect: same 3
    <test> blocks, same names, same single-class-per-suite declarations with zero method filtering, same
    verbose level, same suite name and structure. Only the BranchActionsSuite test block is omitted,
    because it is the one block that cannot load. testng.xml itself is not modified by this file's
    existence. TC-BR-056/057/058 (BranchActionsSuite's 3 cases) are recorded separately as Not Executed.
    No test, assertion, or suite-membership change accompanies this file.
-->
<suite name="BranchAutomationSuite" verbose="1">
    <test name="CreateBranchSuite">
        <classes>
            <class name="AdminPages.Admin.Branch.CreateBranch_Admin_TC"/>
        </classes>
    </test>
    <test name="SearchBranchSuite">
        <classes>
            <class name="AdminPages.Admin.Branch.SearchBranch_TC"/>
        </classes>
    </test>
    <test name="UpdateBranchSuite">
        <classes>
            <class name="AdminPages.Admin.Branch.UpdateBranch_TC"/>
        </classes>
    </test>
</suite>
```

**Two failed attempts preceded the counted execution, disclosed rather than hidden:** the suite-file comment above used `--` as a prose dash twice across two attempts, which XML forbids inside comments (`org.xml.sax.SAXParseException`). Both times Maven failed at suite-parse time, before any browser opened — **no test executed, no code file changed** in either failed attempt. The comment was corrected (removing the `--`) before the counted, successful run below. This is an artifact-authoring mistake on my part, not a production or test-suite change.

**This is not called a complete 32-test execution.** It is a full execution of the 29 currently executable Branch test cases. TC-BR-056, TC-BR-057, TC-BR-058 are **Not Executed** — `BranchActions_TC.java` still does not exist.

## 3. Result summary (raw, as reported by the suite runner)

`Total Cases: 29 --> Passed: 20 | Failed: 9 | Skipped: 0` — no test was skipped, and the execution was not stopped early; every one of the 29 declared tests ran to its own completion (pass or fail) independently, each in its own fresh browser session (SHAFT's per-test-method `setUp`/`tearDown` lifecycle, confirmed via each test's own login sequence in the console log).

## 4. Passed (20)

TC-BR-001, 002 (7/7 field-omission iterations), 004, 024, 025, 028, 037, 038, 039, 040, 042, 046, 055, 060, 061, 065, 066, 067, 068, 069.

No hidden retries occurred in any of these 20 beyond what is already documented for TC-BR-001 in `QuarantineRegister.md` (this cycle's own execution showed a clean single-attempt pass for TC-BR-001 — recorded here, not blended into its Quarantined bucket status, per the existing rule that its latest-pass result is reported separately from its quarantine).

## 5. Failed (9) — raw evidence only, full stack traces in `artifacts_rerun-15/maven-console.log`

### TC-BR-013 — `tcBr013_mandatoryEmailConfigFieldsBlockSubmissionWhenEmpty`
Failed inside `fillMandatoryBaseline()` → `selectFirstSupplierCredential()` → `openCredentialDropdownWithRetry()`, on the test's first field-omission iteration (`branchEmailId`) — before Submit was ever reached, before the test's own assertion was reached.
```
java.lang.IllegalStateException: Credential dropdown open action did not commit after 3 interaction attempt(s).
All 3 attempts: overlayPanelCount=0, aria-expanded="false", unchanged across attempts.
  at AddBranch_Page.openCredentialDropdownWithRetry(AddBranch_Page.java:738)
  at AddBranch_Page.selectFirstSupplierCredential(AddBranch_Page.java:596)
  at AddBranch_Page.fillMandatoryBaseline(AddBranch_Page.java:1143)
  at CreateBranch_Admin_TC.tcBr013_mandatoryEmailConfigFieldsBlockSubmissionWhenEmpty(CreateBranch_Admin_TC.java:89)
```
This test passed cleanly (2/2 iterations) a few hours earlier in the same day's `ExecutionResults.rerun-14.md`. This is the same exception signature as TC-BR-021's `rerun-14` failure and TC-BR-069's original (already-repaired) defect.

### TC-BR-021 — `tcBr021_mandatorySalesConfigFieldsBlockSubmissionWhenEmpty`
Same failure point and identical exception signature as TC-BR-013 above, on its first field-omission iteration (`creditLimit`). Iterations 2-3 (`topUpLimit`, `creditTermsDays`) did not execute this cycle — the loop aborted on iteration 1's exception. This is the second consecutive cycle in which this test has failed this same way (see `ExecutionResults.rerun-14.md`).

### TC-BR-026 — `tcBr026_warningPromptRejectsValueExceeding11Digits`
Own business assertion reached and failed.
```
java.lang.AssertionError: Warning Prompt (Days) should be capped at 11 digits, but retained 15 characters:
"999999999999999" (FINDING-004, still open) expected [true] but found [false]
  at AddBranch_Page.assertWarningPromptCappedAt11DigitsOrMessageShown(AddBranch_Page.java:535)
```
Matches the already-documented `FINDING-004` (Confirmed Application Failure) exactly, including the test's own embedded reference to that finding ID.

### TC-BR-030 — `tcBr030_descriptionEnabledOnlyWhenSupplierRowSelected`
Own business assertion reached and failed. **No prior failure exists for this test in any artifact this session.**
```
java.lang.AssertionError: First Supplier row's Description should be enabled once its row is selected
expected [false] but found [true]
  at AddBranch_Page.assertFirstSupplierDescriptionEnabled(AddBranch_Page.java:574)
```

### TC-BR-041 — `tcBr041_searchByBranchNameReturnsMatchingRecord`
Own business assertion reached and failed. **No prior failure exists for this test in any artifact this session.**
```
java.lang.AssertionError: Expected a row named "Emirates NDC"; the grid returned [QA_1924166850960800,
QA_1921746026389000, QA_1921426639455500, NDC2_Ahmed Alhussieny, Anglea_ee4e8e, Test, Uplift2_Mohanad
Dawood, Uplif1_Ahmed Refat Galal, Uplif1_Ahmed Mohamed AbdelDaiem, kiko] expected [true] but found [false]
```

### TC-BR-043 — `tcBr043_searchWithNonMatchingCriteriaShowsEmptyState`
Own business assertion reached and failed. **No prior failure exists for this test in any artifact this session.**
```
java.lang.AssertionError: Expected the empty-state message for Branch Code ZZZZQQ9. expected [true] but found [false]
```

### TC-BR-045 — `tcBr045_statusFilterReturnsOnlyRecordsMatchingSelectedStatus`
Own business assertion reached and failed. **No prior failure exists for this test in any artifact this session.**
```
java.lang.AssertionError: Expected Both (506) to equal Active (506) plus Inactive (506). expected [1012] but found [506]
```

### TC-BR-052 — `tcBr052_resultsGridDisplaysAllSpecifiedColumns`
Own business assertion reached and failed.
```
java.lang.AssertionError: Grid is missing required column(s) [Branch Code, State]. Headers rendered:
[Code, Branch Name, Country Name, City, Approval Status, Actions]. FINDING-012 confirms the State column
is absent -- this assertion asserts the corrected behaviour and must not be weakened to match the defect.
```
Matches the already-documented `FINDING-012` (Confirmed Application Failure) exactly.

### TC-BR-054 — `tcBr054_rowActionIconsMatchApprovalState`
Own precondition check reached and failed (inside `assertIconsForStatus`, called from the test's own body).
```
java.lang.AssertionError: Unmet precondition: no row with Approval Status "Rejected" was found within
10 pages, so its icon set could not be verified.
  at SearchBranch_TC.assertIconsForStatus(SearchBranch_TC.java:272)
  at SearchBranch_TC.tcBr054_rowActionIconsMatchApprovalState(SearchBranch_TC.java:236)
```
Matches the already-documented, previously-confirmed root cause (`BranchFailureAnalysis_2026-08-14.md`: scan-bound automation defect, confirmed via a prior direct API cross-check showing genuine "Rejected" records exist beyond the automation's 10-page scan; fix decided but not yet implemented).

## 6. Screenshots, Logs, Reports

| Evidence | Location |
|---|---|
| Full console log (all 29 tests, full stack traces) | `artifacts_rerun-15/maven-console.log` |
| Surefire report | `artifacts_rerun-15/surefire/TEST-TestSuite.xml` — 29 tests, 9 failures |
| Scoping input (full contents reproduced in §2) | `artifacts_rerun-15/testng-full-executable.xml` |

## 7. Quarantine Register Cross-Reference

TC-BR-001 executed as part of this run (`CreateBranchSuite`) and **passed cleanly this cycle**. Per the established rule (`BranchFailureAnalysis_2026-08-14.md` §Reconciled Totals bucketing notes), this latest pass is recorded here but does **not** move TC-BR-001 out of `Quarantined` — the original quarantine cause (button-open intermittency, attempts 1-4) remains unresolved and independent of this cycle's result.

## 8. Addendum, 2026-08-14 — TC-BR-013 classification and cross-execution comparison

**Recorded per explicit instruction, following your manual re-execution of TC-BR-013:**

| Fact | Value |
|---|---|
| Isolated manual-triggered run (you) | **Passed** |
| Agent-triggered suite run (`rerun-15`, this artifact) | **Failed** — Credential dropdown open action did not commit after 3 interaction attempts, inside shared provisioning |
| Classification | **Intermittent / Flaky Automation Interaction Failure** |
| Application behavior | **Not established as defective** |
| TC-BR-013's own negative email-field assertion | **Not the cause** — never reached; failure occurred entirely inside shared Credential-selection provisioning, before the test's own logic ran |

### Cross-execution comparison — evidence available on the agent side, per your requested dimensions

| Dimension | `rerun-14` (TC-BR-013 Passed) | `rerun-15` (TC-BR-013 Failed) |
|---|---|---|
| Exact command | `mvn -q test -Dsurefire.suiteXmlFiles=".../artifacts_rerun-14/testng-verify-002-013-021-038.xml" -DheadlessExecution=false -Drp.endpoint=http://localhost:8080 -Drp.enable=false` | `mvn -q test -Dsurefire.suiteXmlFiles=".../artifacts_rerun-15/testng-full-executable.xml" -DheadlessExecution=false -Drp.endpoint=http://localhost:8080 -Drp.enable=false` |
| Headed/Headless | Headed | Headed (identical flag) |
| Test method / iteration | `tcBr013_mandatoryEmailConfigFieldsBlockSubmissionWhenEmpty`, iteration 1 of 2 (`branchEmailId`) | Same method, same iteration 1 of 2 (`branchEmailId`) — failed before iteration 2 could run |
| Isolated run vs. suite position | Suite run, test **2 of 4** (`TC-BR-002` immediately before it) | Suite run, test **4 of 29** (`TC-BR-001`, `TC-BR-002` [7 iterations], `TC-BR-004` immediately before it) — **different preceding sequence and position**; your manual run's own isolation/position is not visible to me and would need your confirmation if relevant |
| Git commit (working tree base) | `0becb64d78cb5b310f27eb8418aeec2f440a5b4a` (no commits made this session) | Same — `0becb64d78cb5b310f27eb8418aeec2f440a5b4a` |
| `AddBranch_Page.java` content hash | Identical — no edit occurred between `rerun-14` and `rerun-15` (confirmed: no `Edit`/`Write` call touched this file in that window); current working-tree sha256 = `5981d648b86dc6d6c8aac8297a3129a17e41a8b7c135be444d32ea6e25b04a69` (581 insertions/5 deletions vs. HEAD, unchanged both runs) | Identical, same hash |
| JVM / Maven / SHAFT | Java 24.0.1 (Oracle), Maven 3.9.11, SHAFT v.7.4.20231015 — same toolchain, no version-affecting change made between runs | Same |
| Chrome / ChromeDriver | Chrome `150.0.7871.187` (from console: `"Unable to find version of CDP to use for 150.0.7871.187"`) | Chrome `150.0.7871.187` — **identical version in both runs** |
| Browser lifecycle / session reuse | Fresh `setUp`/`tearDown` per test method (own login, own driver instance); **no session or browser reuse across tests in either run** — confirmed via `Successfully Closed Driver` / `Successfully Opened: "windows | Chrome"` bracketing every test in both console logs | Same lifecycle, same pattern |
| Environment URL / test data | `http://192.168.1.70` (STG); Credential value requested: `"Live"` (fixture constant); Branch Name/Code randomly generated per test (`BranchDataFactory`) | Same URL, same fixture Credential value, same data-generation pattern |
| Timestamps | Navigate-complete: 05:44:39 PM; first (and only) Credential-open click: 05:44:51 PM — **~12s** between page-ready and first attempt; committed immediately, no retry | Navigate-complete: 06:02:19 PM; 3 Credential-open clicks at 06:02:23, 06:02:26, 06:02:28 PM — **~4s** between page-ready and first attempt; none of the 3 committed |
| System/application load | Not independently measured in either run — no server-side load metrics were captured by either execution | Same — not measured |
| Time from Status-checkbox selection to Credential readiness | Not separately observable — `checkFirstSupplierRow()` uses the JS-dispatched `clickVia()` path, which (by this file's own design, documented in its class comment) is invisible to SHAFT's reporter; only the subsequent Credential-open click attempts are logged | Same limitation — not separately observable in either run |
| Time and DOM state per dropdown-open attempt | Single attempt, committed same second it was dispatched (`Click element.` → `Click "Live".` within 1s); no failed-attempt DOM state captured because none failed | 3 attempts, each held open for the full `CREDENTIAL_OPEN_COMMIT_TIMEOUT` (2s) with **no observable DOM change between attempts**: `overlayPanelCount=0`, `aria-expanded="false"`, identical `outerHtmlSnippet` on all 3 |

**Not dismissed, not escalated:** both results stand as reported — your isolated manual run Passed, the agent-triggered suite run Failed on the identical, unmodified code. No retry count was increased. No repair was proposed or applied for this occurrence.

**Open, unconfirmed candidate factors** (listed for visibility only, none adopted as a conclusion): suite-position/sequential-load effects (more prior tests and browser launches before TC-BR-013 in `rerun-15` than in `rerun-14`); non-deterministic timing in the target application's PrimeNG dropdown rendering under the shorter ~4s field-fill-to-click window observed in `rerun-15` vs. the ~12s window in `rerun-14`. Neither is established; both would need targeted, controlled repetition to confirm or rule out, which was not performed here per your instruction not to propose a repair yet.

## 9. No repair, rerun, or speculative classification update performed

Per explicit instruction, this artifact records raw evidence and the one classification you provided (§8) — nothing beyond that. No code was changed. No test was rerun in connection with this comparison.
