# Before/After Comparison — `agency` / SHAFT, 2026-08-23

| Test / Fixture | Before (exec2, Run 1) | Repair Applied | After (rerun1, Run 1) | Column |
|---|---|---|---|---|
| `AgencyInheritanceAndReadOnly_TC` (`prepareClassFixture`) | Failed — "did not submit" at ~21.1s | `SUBMIT_OUTCOME_TIMEOUT` 15s → 30s | Failed again — "did not submit" at ~35.3s | **Remaining Failure** |
| `AgencyDocumentsAndLogo_TC` (`prepareClassFixture`) | Failed — "did not submit" at ~20.6s | `SUBMIT_OUTCOME_TIMEOUT` 15s → 30s | Failed again — "did not submit" at ~35.2s | **Remaining Failure** |
| Both, same run | — | — | Passed on SHAFT's own automatic retry (Run 2), both times | Not a "Fixed" outcome — the retry mechanism, not the repair, produced the pass |

**No test moved to Fixed.** The repair (widening the timeout) is a real, low-risk improvement, but the observed duration on rerun (~35s) exceeded even the new 30s window, so it cannot be credited with resolving the failure. Per the Repair Summary §9, nothing here is written to the Repair Knowledge Base.

**No New Failures.** No previously-passing test began failing because of this change.

**No Quarantine.** This is the first healing attempt against this pattern (1 of 2 prior attempts before the default quarantine threshold).
