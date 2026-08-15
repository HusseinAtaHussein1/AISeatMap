# Execution Results — Rerun 25 (post-repair, Healing Pass HEAL-BR-20260815-02)

**Cycle:** 25 · **Type:** Targeted rerun after an approved Stage `5H` repair, followed by a full-class regression run
**Scope:** `SearchBranch_TC` — TC-BR-052 and TC-BR-054 repaired; all 11 tests in the class rerun

## 1. Execution Metadata

| Field | Value |
|---|---|
| Execution ID | EXEC-BR-20260815-03 |
| Triggered by | Healing Pass `HEAL-BR-20260815-02` (Stage `5H`) |
| Module | `branch` |
| Environment | Staging (STG), `http://192.168.1.70` |
| Mode | **Headed** — carried forward from this session's Stage `5H` pass |
| Framework | SHAFT Engine 7.4.20231015 / TestNG / Java 24.0.1 / Chrome 150 |
| Completed | 2026-08-15T15:33 (+03:00) |
| Duration | 318.5 s (full class, 11 tests) |

## 2. Result

```
Tests run: 11, Failures: 1, Errors: 0, Skipped: 0
```

| Test Case | Before this pass | After | Classification |
|---|---|---|---|
| TC-BR-052 | Failed — missing `[Branch Code, State]` | **Failed — missing `[State]` only** | Partially repaired; one open question remains |
| TC-BR-054 | Failed — `No row with Approval Status "Rejected" ... within the 10-page scan limit` | **Passed** | `Automation Repaired` |
| TC-BR-040, 041, 042, 043, 045, 046, 055, 060, 061 | Passed (cycle 24) | **Passed** | No regression |

## 3. TC-BR-054 — repaired

**Root cause.** The test scanned pages for a record in each approval state. `Approved` and `Pending for approval` are reliably on page 1, but `Rejected` records sit deep in the default ordering. A diagnosis probe that temporarily raised the scan limit to 60 located one at **page 18 of roughly 52** — well past the 10-page bound, which is why the test reported an environment data gap.

**The approach agreed on 2026-08-14 was not available.** That decision was "search or sort by status directly". The Branch Search form has six controls and **none of them filters on Approval Status** — the `Status` filter is Active/Inactive/Both, a different property entirely (Discovery §3). This was reported rather than silently substituted.

**What was applied instead.** The `Rejected` fixture is now configured (`knownRejectedBranchCode=BRN466`) and reached by a direct code search — one search rather than 18 page hops. `Approved` and `Pending` still scan, because page 1 finds them immediately and no fixture is needed.

The new helper verifies the record is **still in the claimed state before judging its icons**, so a fixture that goes out of date fails as exactly that, naming the record and telling the reader what to change — never as a false icon defect.

**Measured effect:** TC-BR-052 + TC-BR-054 together now run in 57.5 s, against 71.3 s for TC-BR-054 alone under the 60-page probe.

```
[DIAG-SYNC] assertIconsForStatus matched "Approved" at branchCode=BRN801 page=1 row=1
[DIAG-SYNC] assertIconsForStatus matched "Pending for approval" at branchCode=BRN800 page=1 row=2
[DIAG-SYNC] assertIconsForStatus matched "Rejected" at branchCode=BRN466 page=18 row=4   ← probe run only
```

## 4. TC-BR-052 — partially repaired, still failing by design

**Repaired (our error).** The test expected a column labelled `Branch Code`. The grid renders `Code`, and has never rendered anything else — Discovery recorded it on 2026-08-03, and a live read on 2026-08-15 confirmed it again. The business owner confirmed on 2026-08-14 that the grid's columns are correct, so the application's label is the one to expect. The expected value was corrected.

**Deliberately not repaired.** `State` remains in the expected list. Removing it would make the test pass and would record an unresolved disagreement as settled — the repair §8.1 forbids.

```
Before:  Grid is missing required column(s) [Branch Code, State]
After:   Grid is missing required column(s) [State]
         Rendered headers: [Code, Branch Name, Country Name, City, Approval Status, Actions]
```

### The unresolved disagreement

| Source | Says |
|---|---|
| Discovery 2026-08-03 §4 — explicit `offsetParent`/`display` check, two independent page loads | State absent, not responsive-hidden |
| This suite's own column indices — `cityOf` reads column 4, `approvalStatusOf` reads column 5 | A six-column grid. If State existed, TC-BR-055's City assertion would fail. It passes |
| Live read, 2026-08-15 | Six headers, no State |
| Business owner, 2026-08-14 (the basis for retracting FINDING-012) | "Branch Code and State are present; there is no application defect" |

Three independent observations contradict the fourth. This is disclosed under §8.3 and left to a human — it is neither an automation defect to patch nor an application defect this skill may declare.

## 5. Health

| Figure | Before | After |
|---|---|---|
| **Application Health** | Unchanged | **Unchanged.** No defect suppressed or introduced. The one assertion corrected was an automation-side expected value the business owner had already ruled on |
| **Automation Health** (SearchBranch_TC, 11 tests) | 2 failures | **1** |
| **Environment Health** | 1 (TC-BR-054's missing Rejected record) | **0** — resolved by configuring the fixture |

## 6. Open

`TC-BR-052` remains red on the State column pending a human decision. `TestCases_Branch.md` and `TraceabilityMatrix.md` still specify "Branch Code" and need the same label correction at Stage 3 — outside this skill's write access.
