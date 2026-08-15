# Execution Results — run-003__2026-08-04_11-24-38__UserStory__US-8599-SearchActions_US-8606-UpdateBranch (rerun-17)

**Note on cycle labelling:** Targeted verification of exactly **TC-BR-026, TC-BR-066, TC-BR-067, TC-BR-068**, requested 2026-08-14, following two changes this session: (1) `assertWarningPromptCappedAt11DigitsOrMessageShown()` renamed to `assertWarningPromptCappedAt11Digits()` (Javadoc/name correction only, no assertion-logic change); (2) `UPDATED_ADDRESS` test-data constant changed from `"Updated by QA run-003"` to `"2 Test Street"` (invalid-hyphen automation test-data defect fix). **No code, configuration, assertion, or suite-membership file was modified before or during this execution.**

## 1. Execution Metadata

| Field | Value |
|---|---|
| Execution ID | `EXEC-BR-20260814-10` |
| Suite executed | `artifacts_rerun-17/testng-verify-026-066-067-068.xml` (new, scoped to exactly these 4 tests) |
| Execution Mode | **Headless** (`-DheadlessExecution=true`), your explicit choice |
| Exact command | `mvn -q test -Dsurefire.suiteXmlFiles="<abs path>/artifacts_rerun-17/testng-verify-026-066-067-068.xml" -DheadlessExecution=true -Drp.endpoint=http://localhost:8080 -Drp.enable=false` |
| Authorization | Fresh, run-scoped: `AUTH-BRANCH-CREATE/UPDATE/SUBMIT-SelfCreated`, re-created 2026-08-14T15:55:20.940Z, all evaluated `Allowed` before execution |
| Maven/process exit code | **1** (4 of 4 tests failed) |
| SHAFT summary | `Total Cases: 4 --> Passed: 0 | Failed: 4 | Skipped: 0` |

## 2. Results, per test

### TC-BR-026 — `tcBr026_warningPromptRejectsValueExceeding11Digits` — **Failed, exactly as expected**
Own business assertion reached and failed, unchanged from every prior cycle:
```
java.lang.AssertionError: Warning Prompt (Days) should be capped at 11 digits, but retained 15 characters:
"999999999999999" (FINDING-004, still open) expected [true] but found [false]
  at AddBranch_Page.assertWarningPromptCappedAt11Digits(AddBranch_Page.java:538)
```
**Confirms the rename introduced no behavioral change**: identical message, identical retained value, identical line-level assertion outcome as every pre-rename execution. **Classification unchanged: Confirmed Application Failure; `FINDING-004` remains open.**

### TC-BR-066, TC-BR-067, TC-BR-068 — all 3 **Failed — own business behavior Not Executed**

All 3 failed at the **identical earliest blocker**, inside shared record provisioning, before any of the 3 tests' own logic (including the Address field) was ever reached:

```
java.lang.IllegalStateException: Credential dropdown open action did not commit after 3 interaction attempt(s).
All 3 attempts: overlayPanelCount=0, aria-expanded="false", unchanged across attempts.
  at AddBranch_Page.openCredentialDropdownWithRetry(:738)
  at AddBranch_Page.selectFirstSupplierCredential(:599)
  at AddBranch_Page.fillMandatoryBaseline(:1146)
  at BranchProvisioner.createPendingBranch(:91)
  at UpdateBranch_TC.tcBr0XX(...)
```

This is the same signature already classified as **Intermittent/Flaky Automation Interaction Failure** for TC-BR-013/TC-BR-021 earlier this session (`BranchFailureAnalysis_2026-08-14.md`).

**Per-test record:**

| Test | Own business behavior reached? | Address field reached? | `"2 Test Street"` entered? | "Please enter a valid address" seen? | Result |
|---|---|---|---|---|---|
| TC-BR-066 | **No** | No | Not exercised | Not exercised | Failed in provisioning |
| TC-BR-067 | **No** | No | Not exercised | Not exercised | Failed in provisioning |
| TC-BR-068 | **No** | No | Not exercised | Not exercised | Failed in provisioning |

**Address test-data correction status: Not Exercised / Unverified this cycle.** The fix was never reached by any of the 3 tests it targets — this run neither confirms nor disproves it.

## 3. Pattern observed, recorded as raw evidence only

The identical Credential-dropdown open-commit signature occurred in **3 consecutive tests within the same execution**, all in Headless mode. Every prior occurrence of this signature this session (TC-BR-013 in `rerun-15`, TC-BR-021 in `rerun-14` and `rerun-15`) was a single isolated test within a larger, otherwise-passing run. This is the first time it has affected multiple consecutive tests in one execution.

**This is recorded as an evidence-backed hypothesis only, not a conclusion:** the co-occurrence with Headless mode and with 3 consecutive failures is noted, but **Headless-specific causation is explicitly not classified** — this run alone cannot distinguish "Headless triggers or worsens this" from "this specific run coincidentally hit a bad streak of the same pre-existing intermittency, independent of mode." A direct mode comparison (Headed vs. Headless, same tests, same code) is needed before any such classification, and is the next step requested separately.

## 4. Screenshots, Logs, Reports

| Evidence | Location |
|---|---|
| Full console log | `artifacts_rerun-17/maven-console.log` |
| Surefire report | `artifacts_rerun-17/surefire/TEST-TestSuite.xml` — 4 tests, 4 failures |
| Scoping input | `artifacts_rerun-17/testng-verify-026-066-067-068.xml` |

## 5. No repair, retry, or speculative classification performed

Per explicit instruction, no automatic repair or retry was attempted for any of the 4 failures. No mode-specific cause was concluded. This artifact is preserved in full despite the Address change not being reached, per explicit instruction not to omit it.
