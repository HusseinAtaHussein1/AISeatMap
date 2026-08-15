# Execution Results — run-003__2026-08-04_11-24-38__UserStory__US-8599-SearchActions_US-8606-UpdateBranch (rerun-18)

**Note on cycle labelling:** Headed comparison run, requested 2026-08-14, of the exact same 3 tests that all failed identically at the Credential-provisioning step in `rerun-17` (Headless): TC-BR-066, TC-BR-067, TC-BR-068. Purpose: (1) verify the Address test-data correction (`"2 Test Street"`) that `rerun-17` never reached; (2) determine whether the Credential-dropdown open-commit intermittency is mode-dependent. **No code, configuration, assertion, or suite-membership file was modified before or during this execution** — confirmed unchanged since `rerun-17`.

## 1. Execution Metadata

| Field | Value |
|---|---|
| Execution ID | `EXEC-BR-20260814-11` |
| Suite executed | `artifacts_rerun-18/testng-verify-066-067-068.xml` (new, scoped to exactly these 3 tests) |
| Execution Mode | **Headed** (`-DheadlessExecution=false`), your explicit choice |
| Authorization | Fresh, run-scoped: `AUTH-BRANCH-CREATE/UPDATE/SUBMIT-SelfCreated`, re-created 2026-08-14T16:03:26.833Z, all evaluated `Allowed` before execution |
| Maven/process exit code | **1** (1 of 3 tests failed) |
| SHAFT summary | `Total Cases: 3 --> Passed: 2 | Failed: 1 | Skipped: 0` |

## 2. Result, per test

### TC-BR-066 — **Failed — identical Credential-provisioning blocker as `rerun-17`, this time Headed**
3 Credential-open interaction attempts (`Click element.` at 07:06:05, :07, :10 PM), then the identical exception:
```
java.lang.IllegalStateException: Credential dropdown open action did not commit after 3 interaction attempt(s).
All 3 attempts: overlayPanelCount=0, aria-expanded="false", unchanged.
  at AddBranch_Page.openCredentialDropdownWithRetry(:738)
  at AddBranch_Page.selectFirstSupplierCredential(:599)
  at AddBranch_Page.fillMandatoryBaseline(:1146)
```
Own business behavior **Not Executed** — same as `rerun-17`. Address field never reached.

### TC-BR-067 — **Passed** — Address fix confirmed working when reached
Credential committed on the first attempt (`Click element.` → `Click "Live".`, 1s apart). Log line: `Type "2 Test Street" into "By.xpath: (//textarea)[1]".` — **the new Address value was entered, no "Please enter a valid address" message appeared anywhere in the log**, and the test proceeded to its own Remarks-mandatory business assertion, which passed (`Get Text from element, text is "Required".`, matched the Remarks-scoped locator, text equals "Required").

### TC-BR-068 — **Passed** — Address fix confirmed working, Cancel/discard confirmed
Credential needed 1 retry (`Click element.` at 07:07:18 and :21 PM, ~3s apart) then committed (`Click "Live".` immediately after) — recorded as 2 attempts, not hidden. Original Address 1 read as `"1 Test Street"` before the edit. Log line: `Type "2 Test Street" into "By.xpath: (//textarea)[1]".` — no invalid-address message. Clicked Cancel, reopened the record, and Address 1 read back `"1 Test Street"` (the original value) — **Cancel correctly discarded the unsaved `"2 Test Street"` edit**.

## 3. Direct comparison against `rerun-17` (Headless, same 3 tests, same unmodified code)

| Test | `rerun-17` (Headless) | `rerun-18` (Headed) |
|---|---|---|
| TC-BR-066 | Failed — Credential provisioning, 3/3 attempts, no commit | **Failed — identical signature, 3/3 attempts, no commit** |
| TC-BR-067 | Failed — Credential provisioning, 3/3 attempts, no commit | **Passed** — Credential committed on attempt 1; Address fix confirmed |
| TC-BR-068 | Failed — Credential provisioning, 3/3 attempts, no commit | **Passed** — Credential committed on attempt 2 of 3; Address fix confirmed; Cancel/discard confirmed |

**This does not satisfy the "all three pass Headed while all three failed Headless" condition.** TC-BR-066 failed identically in both modes. **The Credential-dropdown open-commit intermittency is therefore NOT classified as a strong mode-dependent defect candidate** — it occurs in both Headed and Headless, on the same unmodified code, consistent with the broader Intermittent/Flaky classification already recorded for TC-BR-013/021 (neither of which is mode-specific either, per `rerun-15`/`rerun-16`'s own evidence). Per your explicit instruction, this comparison is reported as-is; no promotion, repair, or further classification narrowing is performed.

## 4. Address test-data correction — verification result

**Confirmed working, in both tests that reached it (TC-BR-067, TC-BR-068):** `"2 Test Street"` is entered into the Address 1 field, no `"Please enter a valid address"` message appears, and each test's own subsequent business logic (Remarks-mandatory assertion for TC-BR-067; Cancel/discard comparison for TC-BR-068) completes normally. TC-BR-066 still has not reached this field in any cycle so far (`rerun-17` or `rerun-18`) — its own verification of the Address fix remains outstanding, blocked by the same upstream Credential intermittency.

## 5. Screenshots, Logs, Reports

| Evidence | Location |
|---|---|
| Full console log | `artifacts_rerun-18/maven-console.log` |
| Surefire report | `artifacts_rerun-18/surefire/TEST-TestSuite.xml` — 3 tests, 1 failure |
| Scoping input | `artifacts_rerun-18/testng-verify-066-067-068.xml` |

## 6. No repair, retry, or promotion performed

Per explicit instruction: no automatic repair or retry was attempted for TC-BR-066's failure. No promotion was performed. The mode-comparison conclusion above reflects the actual result (mixed, not a clean split) rather than the conditional outcome that would have triggered a stronger classification.

## 7. Addendum, 2026-08-14 — user-triggered isolated IntelliJ run of TC-BR-066

You reported manually triggering TC-BR-066 alone from IntelliJ, on the same unchanged code, and it Passed. Inspected the run's own Allure artifacts (`allure-results/6001a976-deeb-43d7-af0e-8ddae47c6d1a-result.json` and `environment.xml`, both timestamped immediately after `rerun-18` completed) to record this independently rather than take the report unverified.

**Both facts recorded, neither dismissed:**
- `rerun-17` (agent-triggered, Headless): **Failed** — Credential provisioning, 3/3 attempts, no commit.
- `rerun-18` (agent-triggered, Headed): **Failed** — identical signature, 3/3 attempts, no commit.
- **User-triggered isolated IntelliJ run: Passed**, same current code (confirmed — see below).

### Extracted from the run's own artifacts

| Item | Value |
|---|---|
| Execution mode | **Headed** (`environment.xml`: `headlessExecution=false`) — same mode as `rerun-18`, not a Headed/Headless variable |
| Runner / configuration | `com.intellij.rt.testng.RemoteTestNGStarter` (IntelliJ's built-in TestNG runner, single-method "Run Test"), **not** Maven Surefire — no custom suite XML; Allure labels show `suite=tests_SHAFT`, `parentSuite=Default Suite`, consistent with IntelliJ's own default single-test invocation |
| Start / stop | 2026-08-14 19:08:50 → 19:09:21 (local, EEST/GMT+0300) — 30.4s total, immediately after `rerun-18` finished (19:07:31) |
| Git commit | `0becb64d78cb5b310f27eb8418aeec2f440a5b4a` — same as `rerun-17`/`rerun-18` (same working tree, no commits made) |
| `AddBranch_Page.java` content hash | `e407bfecc4080517313c35d45140c1e87ededfd29782705655945a0b86f9c61c` — confirmed identical to the file `rerun-17`/`rerun-18` compiled against; `git status` shows no changes since | 
| Credential interaction attempts | **1 — committed immediately.** `Click element.` at 19:09:04.023, `Click "Live".` at 19:09:04.257 (234ms later). No retry, no `IllegalStateException`, no diagnostic history — contrasts directly with `rerun-18`'s 3 exhausted attempts (2s timeout each) with no DOM change |
| Provisioned Branch Code | `BRN777` (Branch Name `QA_1929182408781000`) |
| `"2 Test Street"` entered without validation error? | **Yes** — `Type "2 Test Street" into "By.xpath: (//textarea)[1]".` at 19:09:11.021, immediately followed by typing Remarks and clicking Submit; no `"Please enter a valid address"` or any validation step appears anywhere in the run |
| Send For Approval completed? | **Yes** — `Click "Send For Approval".` at 19:09:11.738, followed by the standard post-submit page-source/URL polling sequence |
| Final Pending-for-approval assertion | **Passed** — independent re-search for `BRN777` found `Get Text from "Pending for approval", text is "Pending for approval".` (twice) |

### Recorded conclusions, per your instruction

- **TC-BR-066 business behavior: Confirmed working in this isolated run.**
- **Address test-data fix (`"2 Test Street"`): Verified for TC-BR-066** — entered cleanly, no validation error, flow completed.
- **Shared Credential provisioning: still an open Intermittent/Flaky Automation Interaction Failure** — the same unchanged code, same Headed mode, same machine, failed twice (`rerun-17`, `rerun-18`) and passed once (this run). Not classified as resolved from this one isolated pass.
- **Application defect: Not present** — the application accepted the valid address and completed the update-and-submit flow correctly when the automation itself did not block on Credential selection.

### First evidence-backed difference between the successful isolated run and the failed `rerun-18` run

Comparing `environment.xml` from this run against the JVM/toolchain used for `rerun-18` (`mvn -version` output recorded earlier this session):

| | `rerun-18` (failed) | Isolated IntelliJ run (passed) |
|---|---|---|
| JVM | Java **24.0.1**, Oracle Corporation | Java **21.0.11**, **Microsoft** build |
| Java class path / compiled classes source | Maven-compiled (`mvn test-compile`) | IntelliJ-compiled (`target/classes`, `target/test-classes`, IDE build) |
| Runner | Maven Surefire, forked JVM (`ForkedBooter`) | IntelliJ `RemoteTestNGStarter`, IDE-managed process |
| Execution mode | Headed | Headed (same) |

**This is presented as the first evidence-backed difference only — not a conclusion.** A JVM major-version and vendor difference (24/Oracle vs 21/Microsoft), combined with a different test-launch mechanism, is a plausible factor in a timing-sensitive UI interaction (the Credential dropdown's 2-second-per-attempt commit window), but nothing here proves it is the cause. No repair or rerun was performed to test this hypothesis, per your explicit instruction.
