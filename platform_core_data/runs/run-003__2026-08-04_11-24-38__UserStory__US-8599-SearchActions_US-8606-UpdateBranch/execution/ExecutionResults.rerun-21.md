# Execution Results — run-003 (rerun-21) — targeted verification of the shared action-delivery repair

**Purpose:** verify the Strategy A action-delivery repair (native Selenium interactions + commit guards + observer-based Search delivery signal) against exactly TC-BR-040, TC-BR-041, TC-BR-043, TC-BR-045.

## 1. Execution Metadata

| Field | Value |
|---|---|
| Execution ID | `EXEC-BR-20260814-14` |
| JDK | **Java 21.0.11 (Microsoft)**; `mvn clean compile test-compile` exit 0 before execution |
| Mode | **Headed** (`-DheadlessExecution=false`) |
| Suite | `artifacts_rerun-21/testng-verify-040-041-043-045.xml` — scoping only; `testng.xml` untouched and unused |
| Safety | `SEARCH`/`READ`, `Shared`, branch, Staging → **Allowed** (`policy.categories.read.Shared`). Nothing created, updated, approved, rejected or deleted |
| Result | **`Tests run: 4, Failures: 4`** |
| Code changes during execution | **None** |
| Retries / healing | **None** |
| Console log | `artifacts_rerun-21/maven-console.log` · Surefire: `artifacts_rerun-21/surefire/` |

## 2. Headline — the delivery repair is NOT verified

**Native `clear()` + `sendKeys()` does not deliver text on this screen either.** Strategy A is refuted for text inputs. After a native `sendKeys`, the field is still empty and the Angular control still pristine — the identical state D1 recorded for SHAFT's `driver.element().type()`.

**What the repair did achieve:** it converted three silent, vacuous or misattributed results into loud, evidenced failures at the exact point of non-delivery. TC-BR-040 can no longer pass falsely. That is the loud-failure contract working as designed, and it is a real gain — but it is not a fix.

## 3. Per-test result, with actual criteria

| Test | Criterion actually requested | Result | Failed at |
|---|---|---|---|
| TC-BR-040 | Branch Code `BRN2`, Status Both | **Failed** | `SearchBranch_TC:63` — text commit guard, before Search |
| TC-BR-041 | Branch Name `Emirates NDC`, Status Both | **Failed** | `SearchBranch_TC:79` — text commit guard, before Search |
| TC-BR-043 | Branch Code `ZZZZQQ9`, Status Both | **Failed** | `SearchBranch_TC:119` — text commit guard, before Search |
| TC-BR-045 | Status Active (no text criteria) | **Failed** | `SearchBranch_TC:137→totalForStatus:151` — Search delivery guard |

**No test reached its own business assertion.** All four stopped at a delivery guard.

## 4. Commit evidence — text controls

Identical for all three text-input tests:

```
IllegalState: Filter value was not delivered to Branch Code.
[diagnostics] intended="BRN2" visibleValue=""
  class="p-inputtext p-component p-element fg-input ng-untouched ng-pristine ng-valid"
  displayed=true enabled=true;
  url="http://192.168.1.70/admin/branch" summary="Showing 10 results of 509 results"
  rowCount=10 emptyStateShown=false visibleCodes=[BRN782, BRN774, BRN768, ...]
```

| Test | Requested | Visible value after native `sendKeys` | `ng-dirty`? |
|---|---|---|---|
| TC-BR-040 | `BRN2` | `""` | No — `ng-pristine ng-untouched` |
| TC-BR-041 | `Emirates NDC` | `""` | No — `ng-pristine ng-untouched` |
| TC-BR-043 | `ZZZZQQ9` | `""` | No — `ng-pristine ng-untouched` |

The control was **visible and enabled** in every case, so this is not an interactability problem. The keystrokes are simply not landing.

## 5. Commit evidence — Status control: **this part works**

TC-BR-045 reached line 151, which means the Status guard at line 150 **passed**. The log records the guard's own read:

```
[INFO] Click element.
[INFO] Get Attribute "value" from "Active", value is "1".
```

**Native label click delivers; the intended radio was checked with the expected DOM value `1`, and it was the only one checked.** This is the first control on this screen confirmed to commit under a native Selenium interaction, and it cleanly separates the two mechanisms: **clicks deliver, keystrokes do not.**

## 6. Search delivery evidence — and a defect in this repair

Exactly one `clickSearch` executed all cycle (TC-BR-045):

```
[DIAG-SYNC] clickSearch start summaryBefore="" rowsBefore=0 emptyBefore=true
[DIAG-SYNC] clickSearch clicked t=157ms
...
IllegalState: Search click was not delivered from an empty pre-click grid: the loading-overlay
cycle was never observed and no rows appeared within 10s. The unchanged empty state is NOT
accepted as a successful search.
[diagnostics] elapsed=10391ms observerEvents=[] -> overlay cycle NOT recorded by the pre-armed
observer ... summary="Showing 10 results of 509 results" rowCount=10
```

**This result must not be read as evidence about the application, because two defects in the repair itself contaminated it.** Both are mine, introduced in this change:

**Defect R1 — the rows-appeared escape is unreachable when `emptyRef` is null.** In `awaitSearchDelivered`, the empty-grid branch reads:
```java
return emptyRef != null && !d.findElements(GRID_BODY_ROWS).isEmpty();
```
The `emptyRef != null &&` conjunct is wrong. "Rows arrived" is a valid completion signal regardless of whether an empty-state cell reference was captured. The diagnostics show `rowCount=10` at timeout — rows **had** arrived, and the guard ignored them.

**Defect R2 — REPAIR-BR-009's false-empty settle was dropped.** Rewriting `clickSearch` removed the `EMPTY_STATE_SETTLE` (600 ms) window that REPAIR-BR-009 introduced on 2026-08-09 precisely because the empty-state placeholder renders transiently while the grid clears before new rows stream in. `waitUntilGridIsReady()` accepts a transient empty state instantly, so `clickSearch` captured `rowsBefore=0, emptyBefore=true` for a Status=Active search over 509 records — a state that cannot be the real result. The pre-click state was almost certainly a false-empty read, which then routed execution down the wrong branch.

**Consequence:** whether the native Search click delivers is **Not Established** by this cycle. It was never tested under correct conditions.

## 7. Observer cleanup — verified

| Check | Result |
|---|---|
| `clickSearch` invocations | 1 |
| `disarmSearchDeliveryObserver()` invocations | 1 (from `finally`) |
| `[DIAG-SYNC] observer disarm FAILED` / `did NOT confirm removal` | **Absent from the log** — cleanup returned `true` |
| Cleanup masked the original exception? | **No** — the propagated exception is the delivery diagnostic, not a cleanup error |
| Failure evidence preserved before deletion? | **Yes** — `observerEvents=[]` appears in the thrown message, composed in the `catch` before `finally` deleted the state |
| Observers accumulated | None — one arm, one disarm, on a page that was freshly navigated per test |

Cleanup behaved exactly as specified on the one path exercised. Paths not exercised this cycle: click exception, stabilization exception, cleanup-failure branch.

## 8. Answers to the five review questions

1. **Is the shared delivery repair verified?** **No.** Native `sendKeys` fails to deliver exactly as SHAFT's wrapper did. Strategy A is refuted for text inputs. Status clicks are confirmed working. Search-click delivery is untested due to R1/R2.
2. **TC-BR-040 — weak assertion despite the filter now being delivered?** The filter is **not** delivered, so the premise does not yet hold. The Test Integrity Finding **stands unchanged**: its assertion remains vacuous and must still be rewritten. It no longer passes falsely — it now fails honestly at the guard.
3. **TC-BR-041 — still needs runtime-discovery redesign?** **Yes**, unchanged. The hardcoded-`Emirates NDC` dependency is a Test-Design Defect independent of delivery. (`Emirates NDC`/`BRN22` does still exist — confirmed in `DIAG-BR-20260814-01`.)
4. **TC-BR-043 / TC-BR-045 — pass unchanged?** **Not established.** Neither reached its assertion. Both assertions were separately confirmed correct against real behaviour in `DIAG-BR-20260814-01` (`ZZZZQQ9` → `total: 0` + empty state; `681 == 509 + 172`), so neither is expected to need modification — but that is prior evidence, not this cycle's.
5. **New Test Integrity Findings?** None beyond TC-BR-040's, already recorded. No test was newly exposed as a false positive this cycle, because none reached an assertion.

## 9. No repair, retry, or promotion

No automatic retry, no healing, no assertion change, no code change during execution. R1 and R2 are recorded here for human decision, not fixed. Unrelated working-tree changes preserved. Stopped after these four tests.
