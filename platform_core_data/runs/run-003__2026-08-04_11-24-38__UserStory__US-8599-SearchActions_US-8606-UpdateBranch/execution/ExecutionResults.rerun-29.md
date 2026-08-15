# Execution Results — Rerun 29

**Cycle:** 29 · **Type:** Targeted run of the two `BranchActions_TC` cases that had never executed.

**Both passed. `BranchActions_TC` is now fully verified — 3 of 3.** With TC-BR-056 already passing in
`rerun-28`, every approve/reject-from-grid case in the Branch module now has a real result for the
first time.

## 1. Execution Metadata

| Field | Value |
|---|---|
| Execution ID | `EXEC-BR-20260815-07` |
| Module | `branch` |
| Scope | `BranchActions_TC` — TC-BR-058 and TC-BR-057 only, run separately |
| Environment | Staging (STG), `http://192.168.1.70` |
| **Execution Mode** | **Headed** (operator choice) |
| Concurrency Mode | Sequential |
| Retry Policy | None configured — no result here is a retry result |
| Framework | SHAFT Engine 7.4.20231015 / TestNG / Selenium 4.13.0 / Java 24.0.1 |
| Window | 2026-08-15 18:35 → 18:39 (+03:00) |
| Safety Preflight | `metadata/SafetyPreflight.md` — **found a missing REJECT authorization**, see §4 |

## 2. Result

```
TC-BR-058:  Tests run: 1, Failures: 0, Errors: 0, Skipped: 0   (51.26 s)
TC-BR-057:  Tests run: 1, Failures: 0, Errors: 0, Skipped: 0   (51.79 s)
```

## 3. Execution Results

| Test Case ID | Automation Script ID | Status | Duration |
|---|---|---|---|
| TC-BR-058 | `BranchActions_TC::tcBr058_approveAndRejectCaptureRemarksEntry` | **Passed** | 51.26 s |
| TC-BR-057 | `BranchActions_TC::tcBr057_rejectPendingBranchFromResultsGrid` | **Passed** | 51.79 s (29.2 s in the test method itself) |

**TC-BR-058** provisioned its own Branch, clicked thumbs-up, confirmed the mandatory Remarks prompt
appeared, submitted a remark, and confirmed the record read `Approved`. Its open question from
Discovery — whether the grid raises a Remarks prompt at all — is now answered by execution rather
than by observation: it always does.

**TC-BR-057** provisioned its own Branch, clicked thumbs-down, confirmed the Remarks prompt, submitted
a remark, and confirmed the record read `Rejected`. **This is the first time branch rejection from the
grid has ever been exercised by automation.**

Both ran through the recovered `completeRemarksPrompt` and the repaired `BranchProvisioner`, which
confirmed by exact Branch Code that each record belonged to this run before acting on it.

## 4. Execution Safety — a gap the preflight caught

**The preflight found that no `REJECT` authorization existed.** The four grants in force covered
CREATE, UPDATE, SUBMIT and APPROVE. TC-BR-057 rejects a branch, so it had nothing to run under.

This is the case §14A exists for: `Automation = Approved` made the test an asset, but it never
authorized the business mutation the test performs. Those are decided by different mechanisms, and
finding the gap by executing the rejection would have defeated the check.

| Test | Preflight outcome |
|---|---|
| TC-BR-058 | **Allowed** — executed immediately on the existing grants |
| TC-BR-057 | **Held**, authorization requested, granted, then executed |

`AUTH-BRANCH-REJECT-SelfCreated` was granted by `ahmed.ayman@tildetech.ae`, scoped to records this run
created. **Rejecting any pre-existing branch remains forbidden** — the narrower of the two options was
deliberately taken, because other teams' records sit in the same grid on this shared environment.

**No test was deselected. No result is `Skipped — Execution Safety Policy`.**

## 5. Health Summary

| Health figure | Result |
|---|---|
| **Application Health** | **0 failures / 2 passed** — approval and rejection from the grid both behave correctly, and both correctly require a remark |
| **Automation Health** | **0 failures** — the recovered suite worked on first use in both directions |
| **Environment Health** | **0 failures** — login worked on both runs. The exhaustion seen earlier did not recur, consistent with these being 2 logins rather than 25 |

| Inconclusive | Flaky |
|---|---|
| 0 | 0 |

## 6. Evidence Inventory

Under `execution/artifacts_rerun-29/`.

| Evidence Type | Captured | Note |
|---|---|---|
| Framework Report (Allure) | Yes — **TC-BR-057 only** | See the limitation below |
| Screenshots | 10 | From the TC-BR-057 run |
| Execution Logs | Yes — both | `maven-console-TC-BR-058.log`, `maven-console-TC-BR-057.log` |
| Runner report (Surefire) | Yes — TC-BR-057 | `surefire-TC-BR-057.xml` |
| Videos / Traces / HAR | No | Not enabled for this project |

**Limitation — TC-BR-058's Allure evidence was overwritten.** SHAFT clears `allure-results/` at the
start of every run, so launching TC-BR-057 destroyed the result files TC-BR-058 had just written. Its
outcome is evidenced by its Maven console log, which records `Total Cases: 1 --> Passed: 1 | Failed: 0
| Skipped: 0`, and that is sufficient — but the richer per-step Allure detail for that test no longer
exists.

**This also destroyed the last remaining Allure evidence for `rerun-28`.** That run's outcomes were
already extracted into `ExecutionResults.rerun-28.md` before this happened, so nothing is lost from
the record — but the raw files behind it are gone. Anything to be kept from an Allure run must be
copied out before the next run starts.

## 7. Known Limitations

- **Two separate Maven invocations, not one run.** The tests were run individually because TC-BR-057
  was held pending authorization. That is why there is no single combined Surefire report.
- **Java 24.0.1**, not the Java 21 named as canonical in the authorization note. Java 21 is still not
  installed on this machine.
- **Per-operation safety enforcement was not in effect** (§14A.1). Enforcement was at preflight and
  test selection only.
- **`BranchActionsSuite` is still commented out in `testng.xml`.** These tests ran by direct selection.
  A full-suite run still will not include them until that block is restored.

## 8. Execution Recommendations

1. **Restore `BranchActionsSuite` in `testng.xml`.** All three cases now pass on real evidence, which
   was the condition for reviewing their isolated execution. Leaving the block commented recreates the
   original problem — a suite that looks covered and never runs.
2. **Copy Allure output before starting another run**, or configure SHAFT not to clear it. This run
   destroyed two earlier result sets, and only prior extraction saved them.
3. **Two Branch records were left on Staging**, one `Approved` and one `Rejected`, both named
   `QA_<nanoTime>`. Deletion is not authorized and none was attempted.

---

**No automation code was modified by this stage. This stage never repairs.**
