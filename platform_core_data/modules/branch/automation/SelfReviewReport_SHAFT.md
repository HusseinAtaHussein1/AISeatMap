# Self Review Report — SHAFT — run-002__2026-08-03_10-26-17__UserStory__US-8605CreateBranch

| Field | Value |
|---|---|
| Module | `branch` |
| Produced by run | `run-002__2026-08-03_10-26-17__UserStory__US-8605CreateBranch` |
| Revision | 1 |
| Iteration budget | MAX_ITERATIONS = 3 (default, §15A.2) |
| Time budget | Not separately time-boxed — bounded instead by convergence (a clean `mvn test-compile`), reached within budget |
| Iterations actually used | 3 |

## Iteration 1 — initial generation

**Checks run:** naming consistency, duplicate code, broken references, missing reusable assets/page objects/utilities/test data, architecture-vs-plan match, compilation readiness, framework compliance, traceability.

**Findings:**
- `pom.xml` had an invalid XML comment (a `--` sequence inside a comment body) — not caught until the first `mvn test-compile` attempt, which failed to even parse the POM.
- `CreateBranchTests.java` contained one dead-code line (`base.BaseTest fresh = this;`) left over from an earlier draft of the mandatory-fields loop — no functional effect, but a naming-consistency/duplication concern (a variable that exists for no reason).
- Compilation readiness: **failed outright** — could not get past POM parsing.

**Fixes applied:** removed the invalid comment syntax; deleted the dead-code line.

## Iteration 2 — dependency and API verification

**Checks run:** compilation readiness (re-run), framework compliance.

**Findings:**
- The originally-assumed Maven coordinate (`com.shafthq:SHAFT_ENGINE`) does not exist — dependency resolution failed.
- After correcting the coordinate (`io.github.shafthq:SHAFT_ENGINE`) and pinning a version, compilation failed again with ~40 "cannot find symbol" errors: every `driver.element()`, `driver.browser()`, and `driver.quit()` call was rejected. The API this skill had assumed (a plain `SHAFT.GUI` with direct `getAttribute()`/`getText()` reads) does not match the actual resolved library — the real driver class is `SHAFT.GUI.WebDriver`, and value-reading is done through a fluent, assertion-first API (`driver.assertThat().element(locator).attribute(...).isEqualTo(...).perform()`), not plain getters.
- **Framework compliance:** the *first* draft, before this fix, would have violated §8's "must avoid generic/incorrect framework usage" standard by construction — it simply would not have compiled, which is the most severe form of non-compliance.

**Fixes applied:** inspected the resolved jar directly with `javap -p` (since Context7 was unavailable) against `SHAFT$GUI$WebDriver`, `ElementActionsContract`/the concrete `Actions` class, `BrowserActions`, `ElementAssertions`, `WebDriverBrowserValidationsBuilder`, `NativeValidationsBuilder`, and `ValidationsExecutor`. Rewrote `LoginPage.java`, `AddBranchPage.java`, `BaseTest.java`, and `CreateBranchTests.java` to the confirmed real API. Also discovered mid-fix that this SHAFT_ENGINE version's browser-level validation builder has no `text()`/page-source fluent check (that appears to be a later-version addition) — worked around with a direct `driver.browser().getPageSource()` read plus a plain TestNG `Assert`, disclosed in code comments rather than silently forced into the fluent style.

## Iteration 3 — confirmation pass

**Checks run:** full re-run of every §15 check.

**Findings:** none. `mvn test-compile` succeeded — 7/7 classes (`BaseTest`, `BranchTestData`, `AddBranchPage`, `LoginPage`, `CreateBranchTests`, `BranchDataFactory`, `EnvironmentConfig`) compiled with zero errors and zero warnings surfaced by the build. Traceability re-checked: every one of the 13 test methods carries its Test Case ID in its method name, `@Description`, and a Javadoc block citing its Requirement/Discovery/Finding reference — all resolvable against `TraceabilityMatrix.md`. Naming, duplication, page-object completeness, and reusable-asset checks all pass (one Page Object per screen, one shared `BaseTest`, one shared `BranchTestData`/`BranchDataFactory`, no test hardcodes a value the fixtures already provide).

**Convergence:** reached at iteration 3 (a clean pass). Not exhausted — no unsatisfied check remains to disclose.

## Summary

```
Self-Review — 3 iterations, converged (not budget-exhausted)
  PASS  traceability · naming · duplication · page objects · framework compliance · compilation
  FAIL  0 checks unsatisfied
```

**One item deliberately left as a disclosed limitation, not a self-review failure:** `tcBr026_warningPromptRejectsValueExceeding11Digits` is expected to fail when actually executed, because it asserts the *corrected* behavior for a still-open defect (FINDING-004). This is by design (automation-skill §13's regression-test guidance), not something self-review should "fix" by weakening the assertion — §15A.4 explicitly forbids that.
