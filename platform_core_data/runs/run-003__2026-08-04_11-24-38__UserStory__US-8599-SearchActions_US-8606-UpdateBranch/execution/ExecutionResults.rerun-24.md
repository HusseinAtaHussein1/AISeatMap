# Execution Results — Rerun 24 (post-repair, Healing Pass HEAL-BR-20260815-01)

**Cycle:** 24 · **Type:** Targeted rerun after an approved Stage `5H` repair
**Scope:** `SearchBranch_TC` — the 7 filter-dependent Search tests only
**Do not read this as a full-suite result.** 4 of the module's 29 tests are not covered here.

## 1. Execution Metadata

| Field | Value |
|---|---|
| Execution ID | EXEC-BR-20260815-02 |
| Triggered by | Healing Pass `HEAL-BR-20260815-01` (Stage `5H`) |
| Module | `branch` |
| Suite | `SearchBranch_TC` (`AdminPages.Admin.Branch`) |
| Environment | Staging (STG), `http://192.168.1.70` |
| Mode | **Headed** — human-selected. Recorded deviation: this skill's §12 specifies a headless Playwright MCP rerun, which does not apply to a SHAFT/Maven Java suite. Every prior healing pass in this module ran through Maven; this follows that precedent |
| Framework | SHAFT Engine 7.4.20231015 / TestNG / Java 24.0.1 / Chrome 150 |
| Command | `mvn -o test -Dtest=SearchBranch_TC#tcBr040+tcBr041+tcBr042+tcBr043+tcBr045+tcBr046+tcBr054 -Drp.enable=false` |
| Completed | 2026-08-15T15:00:51 (+03:00) |
| Duration | 457.4 s |

## 2. Result

```
Tests run: 7, Failures: 1, Errors: 0, Skipped: 0
```

| Test Case | Cycle 23 (pre-repair) | Cycle 24 (post-repair) | Classification |
|---|---|---|---|
| TC-BR-040 | Failed — `Branch Code input did not retain "BRN2". Actual value: ""` | **Passed** | `Automation Repaired` |
| TC-BR-041 | Failed — `Branch Name input did not retain "Emirates NDC". Actual value: ""` | **Passed** | `Automation Repaired` |
| TC-BR-042 | Failed — `Search did not produce a fresh result cycle within 20s` | **Passed** | `Automation Repaired` |
| TC-BR-043 | Failed — `Branch Code input did not retain "ZZZZQQ9". Actual value: ""` | **Passed** | `Automation Repaired` |
| TC-BR-045 | Failed — `Search did not produce a fresh result cycle within 20s` | **Passed** | `Automation Repaired` |
| TC-BR-046 | Failed — `option never became clickable` | **Passed** | `Automation Repaired` |
| TC-BR-054 | Failed — `Status filter "Both" was not selected after 3 click attempt(s)` | **Failed — different cause** | Automation defect resolved; **Environment data gap remains** |

## 3. TC-BR-054 — what actually changed

The failure this test carried into the pass is gone. It no longer fails at the Status filter; it now reaches its own logic and stops there:

```
No row with Approval Status "Rejected" was found within the configured 10-page scan limit.
The icon behavior was not verified. This is an automation or test-data limitation;
no application defect is confirmed.
```

That is the test's own explicit unmet-precondition path, and it reports itself correctly. **This is not a repair failure and not a regression** — it is the next problem, revealed only because the first one was fixed. It is an environment data gap, which §5 makes ineligible for healing. The fix approach was already chosen at the 2026-08-14 approval (search by status directly rather than raising the page-scan limit) and is not implemented yet.

## 4. Evidence — the fallbacks firing

Each line below is the repaired code reporting, at runtime, that the normal interaction did not arrive and that the fallback did. This is the direct confirmation of the root cause, captured live:

```
[DIAG-SYNC] Branch Code keystrokes did not arrive (value=""); applying the DOM set + event dispatch fallback
[DIAG-SYNC] Branch Name keystrokes did not arrive (value=""); applying the DOM set + event dispatch fallback
[DIAG-SYNC] selectStatus Both NOT selected by the normal click on attempt 1; radios: Active{selected=true value=1} ...
[DIAG-SYNC] selectStatus Both selected on attempt 1 of 3 (dispatched click fallback)
[DIAG-SYNC] clickSearch normal click produced no result cycle t=3539ms; applying the dispatched click fallback
[DIAG-SYNC] selectCountry panel did not open on the normal click (attempt 1); applying the dispatched click fallback
[DIAG-SYNC] selectCountry "Egypt" committed on attempt 1 (normal click)
```

Two observations worth keeping:

1. **The normal path is still used wherever it works.** `selectStatus Active selected on attempt 1 (normal click)`, `selectStatus Inactive selected on attempt 1 (normal click)`, and several `Both` selections later in the run committed on the normal click. The fallback is not a blanket replacement — it engages only when the normal interaction is observed to have failed.
2. **`selectCountry` needed the fallback to *open* the panel, then the normal click committed the option.** The delivery failure is not uniform even within one control.

## 5. Health

| Figure | Before this rerun | After |
|---|---|---|
| **Application Health** | Unchanged | **Unchanged — no application defect was suppressed, hidden, or newly introduced.** No assertion, expected value, or timeout was modified by this repair |
| **Automation Health** (this 7-test scope) | 7 failures | **1** |
| **Environment Health** | 0 recorded | **1** — TC-BR-054's missing `Rejected` record, surfaced by this rerun |

## 6. Not covered by this cycle

`TC-BR-052` — expected red against the open FINDING-012. Not repaired, not rerun, and must stay red.

## 7. Regression check — TC-BR-055 / 060 / 061 (2026-08-15T15:07)

These three were not repaired, so §12 kept them out of the cycle above. They were run separately, immediately afterwards, purely to confirm the repair caused them no harm:

```
Tests run: 3, Failures: 0, Errors: 0, Skipped: 0   (88.21 s)   BUILD SUCCESS
```

All three passed. The run log also shows they were **already exercising the repaired paths**, and needing them:

```
[DIAG-SYNC] selectStatus Both selected on attempt 1 of 3 (dispatched click fallback)
[DIAG-SYNC] clickSearch normal click produced no result cycle t=3594ms; applying the dispatched click fallback
```

So the repair's reach is wider than the 7 tests it was scoped to. **Zero regressions across the whole Search suite.**
