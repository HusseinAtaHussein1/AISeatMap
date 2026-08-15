# Execution Results — run-003 (rerun-23) — REPAIR-BR-012 verification (TC-BR-045 synchronization)

**Execution ID:** `EXEC-BR-20260815-01` · **JDK:** Java 21.0.11 (Microsoft) · **Runner:** Maven Surefire 3.1.2 · **Mode:** Headed · **Environment:** Staging
**Safety:** `SEARCH`/`READ`, `Shared`, branch, Staging → Allowed. Nothing created, updated, approved, rejected or deleted.
**Code changes:** `SearchBranch_Page.java` only, before execution. None during. No retries, no healing.

## 1. Stage 1-2 — TC-BR-045 alone, three consecutive runs

| Run | Result | Evidence |
|---|---|---|
| 1 | **Failed** | `selectStatus Active selected on attempt 1 of 3`. Then `IllegalStateException: Search did not produce a fresh result cycle within 20s`. `radios: Active{selected=true value=1} Inactive{selected=false} Both{selected=false}` — the filter was applied; the **Search click** did not deliver. 21.97 s |
| 2 | **Passed** | All three statuses selected on attempt 1. `fresh result cycle confirmed` at 1895 ms / 1106 ms / 1121 ms. Totals read: **Active 509 → Inactive 172 → Both 681.** 33.09 s |
| 3 | **Failed** | Identical to run 1 — Status committed, Search click did not deliver. 21.96 s |

**Run 2 is the proof the synchronization defect is fixed.** `summaryAfter` progressed `509 → 172 → 681`, exactly the values manual verification reports, and `681 = 509 + 172`. The old code could never produce this: it read `509` for Inactive every time.

**Runs 1 and 3 prove TC-BR-045 is not yet stable.** They fail on a different, independent defect — Search-button click delivery — which the new guard now surfaces instead of silently returning the previous search's total.

## 2. Stage 3 — full SearchBranchSuite regression

`Tests run: 11, Failures: 11, Errors: 0, Skipped: 0`, 367.3 s.

| TC | Failure |
|---|---|
| 040 | `BRN2` not in grid; codes returned `[BRN309, BRN782, BRN781, BRN780, BRN779, BRN778, …]` — a different row set than any prior cycle |
| 041, 043, 054, 060, 061 | `IllegalState: Status filter "Both" was not selected after 3 click attempt(s)` — `Active{selected=true}` throughout |
| 042, 045, 052, 055 | `IllegalState: Search did not produce a fresh result cycle within 20s` |
| 046 | `NoSuchElement: option never became clickable` — pre-existing intermittent, unrelated |

**Compared with `rerun-22` (same tests, pre-repair): 6 Passed / 5 Failed → 0 Passed / 11 Failed.**

## 3. Assessment — the repair is NOT classified as verified

Two separate facts, neither of which should be collapsed into the other:

1. **The synchronization defect this repair targeted is fixed**, demonstrated through the suite's own SHAFT/Selenium runner in run 2.
2. **TC-BR-045 is not stable, and the suite regressed from 6 passes to 0.** Per the standing instruction, a repair is verified only when the test passes through the suite's own runner *reliably*; 1 of 3 isolated and 0 of 1 in-suite does not meet that bar.

### Are the five newly-failing tests genuine regressions or exposed false positives?

The evidence supports **exposed false positives**, but this is stated as an assessment, not a proven fact:

- TC-BR-060/061 call `selectStatus(BOTH)` then `clickSearch()`. In this run the Both radio never became selected, so before the repair they were paginating the **Active-only** result set while claiming to test Both. They passed because pagination works on any result set.
- TC-BR-042/052/055 call `clickSearch()` and then assert against whatever the grid shows. If the Search click never delivered, the initially-loaded grid satisfied them. `rerun-22` shows the tell: `clickSearch start summaryBefore=""` → `resolved t=275ms`, the empty-baseline artefact that made any rendered summary look like a fresh result.
- TC-BR-040's pass was already classified a Test Integrity Finding for exactly this reason.

**What is proven is that the guards are correct assertions about delivery, and that delivery failed in this session for nearly every interaction.** What is *not* proven is that each of those five tests was previously passing vacuously on every occasion.

### The underlying blocker

Delivery through SHAFT's `driver.element()` wrapper on this screen is **intermittent and session-dependent**: in the isolated run 2 every Status click and every Search click landed; in the 11-test suite run, Status clicks failed 5 times and Search clicks failed 4 times. The isolated runs are ~33-46 s; the suite run is 367 s. This is consistent with, but does not prove, degradation over a longer session.

## 4. Files and methods changed

`SearchBranch_Page.java` only — REPAIR-BR-012:

| Member | Change |
|---|---|
| `waitUntilGridIsReady()` | Now delegates to the new `awaitGridSettled()`; "ready" requires rows **and** a rendered summary, or an empty state held for the existing 600 ms `EMPTY_STATE_SETTLE` |
| `awaitGridSettled(String)` *(new, private)* | The single definition of "the grid may be read". Reuses REPAIR-BR-009's contract; no duplicate implementation |
| `selectStatus(Status)` | Clicks the label, then waits for the requested radio to report `isSelected()`, re-driving up to `STATUS_SELECT_ATTEMPTS` (3) before throwing with all three radios' state |
| `clickSearch()` | Captures the first `<tr>`, clicks, then requires a fresh result cycle before returning; then settles |
| `awaitFreshResultCycle(WebElement, long)` *(new, private)* | Waits for `stalenessOf` the captured row — grid DOM replacement |
| `radioOf(Status)`, `statusDiagnostics()` *(new, private)* | Locator helper and failure diagnostics |
| `STATUS_SELECT_ATTEMPTS`, `STATUS_COMMIT_TIMEOUT` *(new constants)* | 3 attempts, 3 s |

No `Thread.sleep`, no hardcoded totals, no assertion weakened, no test file touched, no locator changed.

## 5. Why the old wait returned the Active total for Inactive

`open()` → `waitUntilGridIsReady()` returned as soon as `rowCount() > 0`. The result summary renders **after** the rows, so `open()` returned while `resultSummaryText()` was still `""`. `clickSearch()` captured `summaryBefore = ""`, and its condition was:

```java
boolean summaryChanged = !empty && !now.isEmpty() && !now.equals(summaryBefore);
```

With an empty baseline, the first summary to render **at all** satisfied "changed" — and that was the *initial page-load* summary, i.e. the previous Active result. `rerun-22` captured it exactly:

```
Inactive: clickSearch start summaryBefore=""  → resolved t=542ms → "Showing 10 results of 509 results"
```

Active was correct only by luck: its baseline had rendered in time, so the wait ran the full 20 s and timed out, and Active's true total also happens to be 509.

## 6. Why the new synchronization proves fresh results were delivered

The signal is **grid DOM replacement**, measured in `DIAG-BR-20260814-03`/`04`: the application re-creates every `<tr>` on each search — 10 removed and 10 added even on a byte-identical 509 → 509 search, and the empty-state row detached on an empty → rows search. There is no `trackBy` reuse.

So a previously-captured row going stale means the grid genuinely re-rendered from a new response. It is independent of whether the total changed — which matters because two valid filters can legitimately return the same count, and a `newTotal != previousTotal` check would deadlock on that. It is also terminal: once stale, always stale, so no polling interval can miss it. And because it cannot be satisfied by the pre-existing grid, a search that never ran now fails loudly instead of returning a stale total.

## 7. Regression risk and remaining uncertainty

- **`clickSearch()` and `selectStatus()` now throw** where they previously continued silently. Callers affected: all of `SearchBranch_TC`, `UpdateBranch_TC:50,65`, `BranchProvisioner:97`, and `waitForApprovalStatus`. **`BranchProvisioner` is used by the Create and Update families, so this repair can affect tests well outside SearchBranchSuite. Those were not executed in this cycle and their impact is unmeasured.**
- **Unresolved:** why SHAFT's `driver.element()` click delivery is intermittent on this screen. Untouched by this repair.
- **Not established:** whether each newly-failing test was previously passing vacuously on every run, or only in this session.

## 8. No further action

No commit, push, merge, promotion, or modification of unrelated files. No full Branch run. Stopped for human review.
