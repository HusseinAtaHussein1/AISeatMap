# Execution Results — Rerun 28

**Cycle:** 28 · **Type:** Operator-run verification of the recovered `BranchActions_TC` suite.

**Run by the user directly, not by this stage.** These results were not produced by an invocation of
`automation-execution-skill`. They are reconstructed from the Allure result files the run left in
`tests_SHAFT/allure-results/`, which is the only record of it. Recorded here so the run is not lost
and so Stage 6A has a citable basis.

**Headline: TC-BR-056 passed — the first approve-from-grid test ever to execute successfully in this
module.** TC-BR-057 and TC-BR-058 never ran: the login screen stopped rendering partway through the
session.

## 1. Execution Metadata

| Field | Value |
|---|---|
| Execution ID | `EXEC-BR-20260815-06` |
| Module | `branch` |
| Run by | Operator, directly |
| Scope | `CreateBranch_Admin_TC` (13) · `SearchBranch_TC` (10) · `BranchActions_TC` (3). **`UpdateBranch_TC` was not part of this run** |
| Environment | Staging (STG), `http://192.168.1.70` |
| Mode | Not recorded — this stage did not invoke the run and does not infer it |
| Framework | SHAFT Engine 7.4.20231015 / TestNG |
| Window | 2026-08-15 17:54:37 → 18:05:34 (+03:00) |
| Duration | 11.0 min |
| Evidence basis | `tests_SHAFT/allure-results/*-result.json` |

## 2. Result

```
passed: 24   failed: 1 (setUp fixture)   skipped: 2
```

## 3. Execution Results

### 3.1 Passed (24)

| Suite | Test Case IDs | Result |
|---|---|---|
| `CreateBranch_Admin_TC` | TC-BR-001, 002, 004, 013, 021, 024, 025, 026, 028, 030, 037, 038, 039 | 13 Passed |
| `SearchBranch_TC` | TC-BR-040, 041, 042, 043, 045, 046, 054, 055, 060, 061 | 10 Passed |
| `BranchActions_TC` | **TC-BR-056** | **1 Passed** |

**TC-BR-056 — `tcBr056_approvePendingBranchFromResultsGrid`, Passed, 21.3 s.** This is new
information, and it is the most valuable result in the run. It is the first execution of any
approve-from-grid case in this module's history. Passing exercised the entire recovered path in one
go: `BranchProvisioner` created a Branch, confirmed by exact Branch Code that the record was its own,
and `completeRemarksPrompt` filled and submitted the mandatory Remarks dialog, after which the grid
showed the record as `Approved`.

### 3.2 Not Executed (2)

| Test Case ID | Script | Classification | Reason |
|---|---|---|---|
| TC-BR-057 | `BranchActions_TC::tcBr057_rejectPendingBranchFromResultsGrid` | **Not Executed** | Its `@BeforeMethod` setup failed, so TestNG skipped the method. No browser reached the test |
| TC-BR-058 | `BranchActions_TC::tcBr058_approveAndRejectCaptureRemarksEntry` | **Not Executed** | Same |

**Neither test failed. Neither passed. Both were skipped before their first line ran.**

## 4. The setup failure — Environment Failure

```
Failed to Type into "By.cssSelector: #id-Username"
org.openqa.selenium.NoSuchElementException:
  no such element: Unable to locate element: {"method":"css selector","selector":"#id-Username"}
```

The login form's username field was not present when the driver tried to type into it — the login
screen did not render. This is **Environment Failure** (§17), not eligible for healing.

**It is the third time today this application has stopped accepting logins mid-session**, and the
pattern is consistent:

| Run | Time | Logins before it broke | Signature |
|---|---|---|---|
| `rerun-26` | 15:35 | ~40 that day | Login page served, submission never redirected |
| `rerun-27` | 17:12–17:24 | 28, all succeeded | No failure |
| **`rerun-28`** | 17:54–18:05 | **24 succeeded, then broke** | Login page did not render its fields at all |

Every test builds its own WebDriver and authenticates separately, so a full suite is 25–30 logins
against one account. The failure lands after roughly that many, and only in the later part of a
session. That is consistent with rate limiting or lockout on the QA account, which is the same
unconfirmed hypothesis `rerun-26` recorded. **It remains unconfirmed** — confirming it means more
login attempts against an account that may already be limited.

**Nothing about this points at the recovered code.** TC-BR-056 exercised that code fully and passed
21 seconds earlier. The failure is in the fixture that logs in, which no part of the recovery touched.

## 5. Health Summary

| Health figure | Result |
|---|---|
| **Application Health** | **0 failures / 24 passed** — every check that ran behaved correctly |
| **Automation Health** | **0 failures** — nothing broken, nothing for Stage 5H |
| **Environment Health** | **1 failure** — the login screen stopped rendering, costing 2 tests |

| Inconclusive | Flaky |
|---|---|
| 0 | 0 |

## 6. Known Limitations

- **Execution Mode is not recorded.** This stage did not invoke the run, and no mode is present in
  the artifacts. It is left unstated rather than guessed.
- **`UpdateBranch_TC` was not part of this run.** Its 5 cases stand on `rerun-27`, where they passed.
- **TC-BR-026 and TC-BR-052 are unchanged.** The weakened assertion and the deleted test method
  described in `rerun-27` §8 are still exactly as they were. TC-BR-026's pass here carries no more
  information than it did there.
- **These results were reconstructed, not captured.** No Surefire report or console log exists for
  this run; `target/surefire-reports/` still holds `rerun-27`'s output. Allure result files are the
  whole record.

## 7. Execution Recommendations

1. **Re-run TC-BR-057 and TC-BR-058 alone**, once login recovers. Two tests is 2 logins, not 25, so
   it is very unlikely to hit the same limit. That is all that stands between this suite and full
   coverage of the three action cases.
2. **Raise the login-exhaustion pattern with the environment owner.** Three occurrences in one day,
   always late in a session, always after 24+ logins. Either confirm the account limit or rule it
   out — right now every long run is at risk of losing its tail.
3. **Consider whether every test needs its own login.** A shared authenticated session across a suite
   would cut 25+ logins to 1 and remove this failure mode. That is an Automation Plan decision, not a
   repair, and it is well outside this stage's authority.

---

**No automation code was modified by this stage. This stage never repairs.**
