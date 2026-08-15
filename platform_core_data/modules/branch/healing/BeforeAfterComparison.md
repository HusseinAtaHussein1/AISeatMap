# Before / After Comparison — branch module

> **This file is edited in place per healing pass** (`self-healing-skill` §18). The pass below supersedes
> nothing in the previous section — earlier passes are retained underneath for history.

---


# Before/After — Healing Pass HEAL-BR-20260815-01 (2026-08-15)

**Scope:** `SearchBranch_TC` + `SearchBranch_Page`
**Before:** `EXEC-BR-20260815-01` (cycle 23, diagnosis, no code change)
**After:** `EXEC-BR-20260815-02` (`execution/ExecutionResults.rerun-24.md`, cycle 24)
**Mode:** Headed, Java 24.0.1, Chrome 150, STG

## Summary

| Column | Count | Tests |
|---|---|---|
| **Fixed** (`Automation Repaired`) | **6** | TC-BR-040, 041, 042, 043, 045, 046 |
| **Remaining Failures** | **1** | TC-BR-054 — but on a *different, non-automation* cause (see below) |
| **New Failures** | **0** | — |
| **Reclassified** | **1** | TC-BR-054 → Environment data gap |
| **Quarantined** | **0** | — |

## Per test

| Test | Before | After | Status |
|---|---|---|---|
| TC-BR-040 | Failed — `Branch Code input did not retain "BRN2". Actual value: ""` | Passed | **Automation Repaired** |
| TC-BR-041 | Failed — `Branch Name input did not retain "Emirates NDC". Actual value: ""` | Passed | **Automation Repaired** |
| TC-BR-042 | Failed — `Search did not produce a fresh result cycle within 20s` | Passed | **Automation Repaired** |
| TC-BR-043 | Failed — `Branch Code input did not retain "ZZZZQQ9". Actual value: ""` | Passed | **Automation Repaired** |
| TC-BR-045 | Failed — `Search did not produce a fresh result cycle within 20s` | Passed | **Automation Repaired** |
| TC-BR-046 | Failed — `option never became clickable` | Passed | **Automation Repaired** |
| TC-BR-054 | Failed — `Status filter "Both" was not selected after 3 click attempt(s)` | Failed — `No row with Approval Status "Rejected" ... within the configured 10-page scan limit` | **Remaining, reclassified** |

## TC-BR-054 read honestly

The repair worked for this test too: the Status filter now commits, and the test reaches its own logic for the first time. It then stops on a precondition it cannot satisfy — the environment holds no `Rejected` branch within 10 pages. That is a data gap, not an automation defect and not an application defect, and §5 makes it ineligible for healing.

**This is not counted as a fix.** It stays in Remaining Failures. Counting it as fixed because "the original error is gone" would misreport a test that still does not verify what it exists to verify.

## Regression check

**Zero New Failures.** No test that passed before this pass fails after it.

**Gap closed, 2026-08-15T15:07.** TC-BR-055, TC-BR-060 and TC-BR-061 were not repaired, so §12 kept them out of the cycle above. They were run separately straight afterwards, purely to confirm the repair caused them no harm:

```
Tests run: 3, Failures: 0, Errors: 0, Skipped: 0   (88.21 s)   BUILD SUCCESS
```

All three passed. Their logs also show them using the repaired fallback paths and needing them — `selectStatus Both selected on attempt 1 of 3 (dispatched click fallback)` and `clickSearch normal click produced no result cycle t=3594ms; applying the dispatched click fallback`. The repair therefore helps these three as well, which the scoped rerun could not have shown.

**Zero regressions across the whole Search suite.**

## Health

| Figure | Before | After |
|---|---|---|
| **Application Health** | Unchanged | **Unchanged.** No assertion, expected value or timeout was modified. TC-BR-052 / FINDING-012 remains open and deliberately red |
| **Automation Health** (7-test scope) | 7 failures | **1** |
| **Environment Health** | 0 recorded | **1** — TC-BR-054's missing `Rejected` record |


---

# Before/After — Healing Pass HEAL-BR-20260815-02 (2026-08-15)

**Scope:** TC-BR-052 and TC-BR-054
**After:** `EXEC-BR-20260815-03` (`execution/ExecutionResults.rerun-25.md`) — full `SearchBranch_TC` class, 11 tests
**Mode:** Headed, Java 24.0.1, Chrome 150, STG

## Summary

| Column | Count | Tests |
|---|---|---|
| **Fixed** (`Automation Repaired`) | **1** | TC-BR-054 |
| **Remaining Failures** | **1** | TC-BR-052 — partially repaired, still red on the State column **by design** |
| **New Failures** | **0** | — |
| **Reclassified** | **0** | — |
| **Quarantined** | **0** | — |

## Per test

| Test | Before | After | Status |
|---|---|---|---|
| TC-BR-054 | Failed — `No row with Approval Status "Rejected" was found within the configured 10-page scan limit` | Passed | **Automation Repaired** |
| TC-BR-052 | Failed — missing `[Branch Code, State]` | Failed — missing `[State]` | **Partially repaired, deliberately still failing** |

## Full-class regression

```
Tests run: 11, Failures: 1, Errors: 0, Skipped: 0   (318.5 s)
```

Passing: TC-BR-040, 041, 042, 043, 045, 046, 054, 055, 060, 061.
Failing: TC-BR-052 only.

**Zero regressions.** Every test that passed after HEAL-BR-20260815-01 still passes.

## Why TC-BR-052 is counted as Remaining and not as a win

Half of it was genuinely repaired: the expected column label `Branch Code` was our error, and the grid has always rendered `Code`. Correcting it removed one of the two reported failures.

The other half was left alone on purpose. `State` stays in the expected list because three independent observations say the column is not rendered, while the business owner states it is. Removing the expectation would make the test green and would quietly record that disagreement as settled.

**A test that is red for one honest, open reason is a better result than a test that is green because the question was deleted.** Counting this as Fixed would misreport it.

## Health

| Figure | Before | After |
|---|---|---|
| **Application Health** | Unchanged | **Unchanged.** The one corrected assertion was an automation-side expected value the business owner had already ruled on |
| **Automation Health** (SearchBranch_TC, 11 tests) | 2 failures | **1** |
| **Environment Health** | 1 — TC-BR-054's missing Rejected record | **0** — resolved by configuring the fixture |
# Pass HEAL-BR-20260809-01 (2026-08-09)

**Source execution:** `EXEC-BR-20260806-03` — `runs/run-003__.../execution/ExecutionResults.rerun-5.md`
**Scope:** `branch`, all 12 `Automation Failure` results from `rerun-5` (Create/Search/Update).
**Reruns performed:** 2 (`rerun-6` Headless, `rerun-7` Headed — deliberately run in both modes to
isolate the repair effect from the execution-mode variable, after the two were initially confounded).

## Outcome

| Column | Count | Tests |
|---|---|---|
| **Fixed** (`Automation Repaired`) | 1 | TC-BR-043 |
| **Remaining Failures** | 6 | TC-BR-046 (repair applied, confirmed not working) plus TC-BR-054, 055, 060, 061, 065 (original symptoms gone, but each fails on a different, unrepaired defect — see below) |
| **New Failures** | 0 | — |
| **Flaky → Quarantined** | 1 | TC-BR-001 (see `QuarantineRegister.md`) |
| **Unverified — never reached repaired code** | 4 | TC-BR-066, 067, 068, 069 |

**Correction (2026-08-09, same day):** an earlier version of this table classified TC-BR-054/055/060/061/065
as `Environment Failure`, reasoning from each test's own assertion-message text ("environment data gap")
without independently checking the live application. **A human reviewer correctly challenged this.** A
live DOM check of `/admin/branch` (unfiltered) via `platform_core/tools/browser_driver/` showed a
normally-rendering grid with 498 real records, "Approved" rows plainly present, and non-sequential
pagination buttons (`["1","2","50"]`) — directly contradicting the "no data"/"data gap" framing. These
5 tests are real, unrepaired automation defects in the search/filter and pagination logic, not an
environment problem. Full corrected analysis: `RepairSummary.md`, Pass `HEAL-BR-20260809-01` §6.

**Honest headline: 1 of 12 confirmed fixed this pass.** Not a data-volume story — an unresolved
automation-code story, with concrete, evidence-backed leads (§11 of the Repair Summary) for the next
diagnosis pass.

---

# Pass HEAL-BR-20260806-01 (2026-08-06)

**Source execution:** `EXEC-BR-20260806-01` — `runs/run-003__.../execution/ExecutionResults.rerun-3.md`
**Scope:** `branch`, Create Branch (US-8605). 1 eligible `Automation Failure` (TC-BR-001).
**Rerun scope:** TC-BR-001 plus the 4 other tests consuming the repaired shared fixture
(`fillMandatoryBaseline`) — TC-BR-002 / 013 / 021 / 038 — so a regression could not hide.
**Reruns performed:** 3 (rerun-2 → rerun-3 → rerun-4 of the repair cycle; evidence in
`runs/run-003__.../execution/artifacts_rerun4/`).

## Outcome

| Column | Count | Tests |
|---|---|---|
| **Fixed** (`Automation Repaired`) | **1** | TC-BR-038 |
| **Remaining Failures** | **1** | TC-BR-001 |
| **New Failures** | **3** | TC-BR-002, TC-BR-013, TC-BR-021 |
| Reclassified | 0 | — |
| Quarantined | 0 | — (TC-BR-001 attempt count = 1; limit not reached) |

**This is not reported as a net win, and it is not one.** One test was fixed, three that were green
before this pass are now red, and the test the pass existed to repair still fails. What the pass did
achieve is diagnostic rather than numerical, and it is stated as such below.

## Per-test detail

| Test | Before (EXEC-BR-20260806-01) | After | Status |
|---|---|---|---|
| TC-BR-038 | Passed — but only because submission was blocked by *other* unfilled fields, not by the empty Outstanding Threshold it asserts (KL-01) | Passes with the baseline actually complete, so the assertion now means what it claims | **Automation Repaired** |
| TC-BR-001 | `Automation Failure` — submit rejected with **11 `Required`** field errors | Still fails the same assertion, but with **zero `Required` errors**: the only remaining error label is `FlightOthers`, and the only empty fields left are the three optional ones (Address 2, Service Tax Number, ABTA Number) | **Remaining Failure** |
| TC-BR-002 | Passed (weak assertion, KL-01) | Fails: 20s timeout in `openDependentDropdown` waiting for Country to auto-fill on a **re-opened** form | **New Failure** |
| TC-BR-013 | Passed (weak assertion, KL-01) | Same as TC-BR-002 | **New Failure** |
| TC-BR-021 | Passed (weak assertion, KL-01) | Same as TC-BR-002 | **New Failure** |

## Why the three New Failures are honest, and what they actually mean

The three regressions all fail at the same point, and they were **caused by REPAIR-BR-001 making a
silent failure loud** — not by breaking a working interaction:

- Before this pass, `selectAutocompleteOption`'s `WebDriverWait` aborted on its first poll (SHAFT's
  listener throws a wrapped `TimeoutException`, which `FluentWait` does not ignore), and SHAFT then
  logged the failure as a `WARN` and continued. Every location selection **silently did nothing**.
- Those three tests only assert "submission was blocked" (URL still `/admin/branch/add`), so a form
  where nothing was ever selected satisfied them perfectly. They were **green for the wrong reason** —
  recorded as KL-01 in the source Execution Results *before* this pass ran.
- With the selection now failing loudly, the real defect they were masking is visible: on a
  **re-opened** form (every loop iteration after the first), the Operating Country selection does not
  commit — `#id-Country` never auto-fills, so the State cascade never populates.

**A green-again suite could be had by reverting REPAIR-BR-001.** That is explicitly not proposed: it
would restore the silent swallow and with it four assertions that cannot fail, which §8.1 prohibits in
substance even though it is a revert rather than an assertion edit.

## TC-BR-001 — the one open blocker

`errors=FlightOthers` is now the sole validation label on the page at submit time, with no `Required`
anywhere. `FlightOthers` has been present on *every* observation of this form since the first probe,
including on a freshly-opened form with nothing filled at all
(`healing/evidence_0806/diagnosis.log` §D6), so whether it is a genuine blocking validation on the
Product Access Flight/Others checkbox group or a permanently-present element the diagnostic selector
merely happens to match is **not established**. Root Cause Confidence: **Medium** → per §7.1 the
permitted next action is diagnosis, not another repair. No repair was attempted on it.

## Health impact

| Figure | Before | After |
|---|---|---|
| **Application Health** | 1 failure (TC-BR-026, FINDING-004) | **1 failure — unchanged.** No application-behaviour signal was suppressed, weakened, or removed by any repair in this pass |
| **Automation Health** | 1 failure (TC-BR-001) | 4 failures (TC-BR-001 + 3 newly-loud) — worse as a count, and better as a signal: 4 tests that could not fail now can |
| **Environment Health** | 0 | 0 |

## Addendum — REPAIR-BR-008 confirmed by EXEC-BR-20260806-03

After this section was first written, a further repair (REPAIR-BR-008, the autocomplete commit-signal
fix for RC-8) was approved at a fourth gate and applied. The full-cycle execution
`EXEC-BR-20260806-03` (`runs/run-003__.../execution/ExecutionResults.rerun-5.md`) confirms it, so this
pass's final columns are:

| Column | Count | Tests |
|---|---|---|
| **Fixed** (`Automation Repaired`) | **5** | TC-BR-002, TC-BR-013, TC-BR-021, TC-BR-038 (all four New Failures above, now resolved) + TC-BR-038's earlier fix |
| **Remaining Failures** | **1** | TC-BR-001 |
| **New Failures** | **0** | — the three regressions recorded above are resolved |
| Quarantined | 0 | — |

The three New Failures listed earlier in this section were therefore **transient within the pass**: they
were caused by REPAIR-BR-001 making a silent failure loud, and REPAIR-BR-008 fixed the real defect that
became visible. The Create Branch suite went **6 failures → 2** (`EXEC-BR-20260806-02` →
`EXEC-BR-20260806-03`), and the remaining two are TC-BR-001 and the untouchable `Application Failure`
TC-BR-026. Recording the intermediate regression rather than only the final figure is deliberate: the
suite genuinely was worse for three reruns, and a reader deciding whether to trust this pass should see
that.

**TC-BR-001's status also changed, by diagnosis rather than repair.** Probe 6 established that its
submission **succeeds** (`POST 204`, toast "Added Successfully", navigation to `/admin/branch`) and that
`assertSubmissionSucceeded()` simply reads the URL before Angular navigates. `FlightOthers`, treated as
the blocker for three cycles, is not an error — see `ExecutionResults.rerun-5.md` §5. The fix for the
missing wait is a **new repair, not yet proposed at a gate**; the accompanying expected-value question
(`"Pending for approval."` vs `"Added Successfully"`) is a §8.3 discrepancy that healing may not decide.

---

# Pass HEAL-BR-20260805 (2026-08-05) — RECONSTRUCTED

> **Provenance warning, stated rather than hidden.** This section is **not** the original document.
> The 2026-08-05 pass's own `BeforeAfterComparison.md` was overwritten in error on 2026-08-06 while
> writing the pass above, and could not be restored — `modules/branch/healing/` has never been
> committed, so git held no version of it. The figures below are reconstructed verbatim from
> `RepairSummary.md` §5 and `runs/run-003__.../execution/ExecutionResults.rerun-1.md`, both of which
> survive intact. Anything the original said *beyond* those two sources is lost. Treat those two files,
> not this section, as the authoritative record of that pass.

**Source execution:** run-003 cycle 1 — `runs/run-003__.../execution/ExecutionResults.md`
**Repairs applied:** 2 — the explicit Surefire `surefire-testng` provider binding (REPAIR-003), and
reaching the Add Branch Angular route via the list screen's `routerLink` button (REPAIR-004).

| Column | Count | Tests |
|---|---|---|
| **Fixed** (`Automation Repaired`) | 12 | TC-BR-002, 004, 013, 021, 024, 025, 026, 028, 030, 037, 038, 039 |
| **Remaining Failures** | 1 | TC-BR-001 — downgraded to `Inconclusive`, root cause not established |
| **New Failures** | 0 | — |
| Reclassified | 0 | — |
| Quarantined | 0 | — |

**Superseded since:** REPAIR-004's conclusion (that direct navigation to the route cannot work) was
reversed on 2026-08-05 — see `AddBranch_Page.open()`'s own note. TC-BR-001's `Inconclusive` verdict was
superseded on 2026-08-06 by `EXEC-BR-20260806-01`, which reproduced it as a diagnosable
`Automation Failure`.

---
