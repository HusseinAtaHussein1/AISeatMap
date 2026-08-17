# Execution Results — Rerun 30 (post-repair verification, Stage 5H)

> Cycle 5 of this run's execution record. `ExecutionResults.md` and every earlier rerun file are
> unchanged — this is an append, never a rewrite (`pipeline.md` §12.1).

## 1. Execution Metadata

| Field | Value |
|---|---|
| Execution ID | `EXEC-BR-20260817-5H-01` |
| Cycle | Rerun 30 — post-repair verification for REPAIR-BR-013 |
| Stage | `5H` Self-Healing (targeted rerun, §12) |
| Module | `branch` — **Promoted**, so this executed from the Workspace Automation Baseline |
| Suite location | `platform_core_data/automation_baseline/shaft/tests_SHAFT/` |
| Date | 2026-08-17 |
| Target environment | `http://192.168.1.70` — matched against the approved Project Context before running |
| Scope | The two repaired tests, then the full suite, then `UpdateBranch_TC` |

**Execution Mode was confirmed with the human before every one of the runs below** (`pipeline.md` §6
Rule 11). Each row states the mode that was actually used; none was inferred or carried over.

## 2. The runs, in order

| # | Scope | Mode | Result | Purpose |
|---|---|---|---|---|
| 1 | `tcBr055`, `tcBr065` | **Headed** | **2 failed** | Pre-repair diagnosis — reproduced the failure live |
| 2 | `tcBr055`, `tcBr065` | **Headless** | **2 failed** | Pre-repair diagnosis — same failure, so not mode-specific |
| 3 | `tcBr055`, `tcBr065` | **Headed** | **2 passed** | Post-repair verification |
| 4 | `tcBr055`, `tcBr065` | **Headless** | **2 passed** | Post-repair confirmation in the other mode |
| 5 | Full suite (31) | **Headless** | 24 passed, 2 failed, 5 skipped, 1 setUp failure | Regression |
| 6 | `UpdateBranch_TC` (5) | **Headed** | **5 passed** | Completed what run 5 skipped |

## 3. Per-run detail

**Runs 1–2 — pre-repair diagnosis (both modes, both FAILED).** This is what established the root
cause. The instrumentation line is the evidence:

```
Headed:    waitUntilLoaded resolved t=967ms  cityLabel=""  cityPlaceholder=true  stateLabel=""
Headless:  waitUntilLoaded resolved t=697ms  cityLabel=""  cityPlaceholder=true  stateLabel="Cairo"
Headless:  city() t=498ms sinceLoaded  value="loading..."  placeholder=true
```

The third line is decisive: 498 ms *after* the wait declared the form ready, the City field read
`"loading..."`. The dropdown had not started loading when the wait released.

**Runs 3–4 — post-repair (both PASSED).**

```
Headed:    waitUntilLoaded resolved t=3980ms / t=7494ms  cityLabel="Cairo"  cityPlaceholder=false
Headless:  waitUntilLoaded resolved t=2688ms / t=3408ms  cityLabel="Cairo"  cityPlaceholder=false
```

**Run 5 — full-suite regression, Headless, 27 min.**

| Class | Result |
|---|---|
| `CreateBranch_Admin_TC` | 13 passed |
| `SearchBranch_TC` | 9 passed, 1 failed — `tcBr061` |
| `BranchActions_TC` | 2 passed, 1 failed — `tcBr057` |
| `UpdateBranch_TC` | **0 executed** — `setUp` failed, all 5 skipped |

`UpdateBranch_TC.setUp` failed on login:

```
Failed to Type into "By.cssSelector: #id-Username"
NoSuchElementException: Unable to locate element {"css selector":"#id-Username"}
   at LogIn_Page.loginAsSuperAdmin(LogIn_Page.java:45)
   at TestBase.setUp(TestBase.java:48)
```

This is a login failure, unrelated to the repair, and **intermittent** — the same setUp succeeded six
times in run 6 an hour later. It is recorded as an Environment/Infrastructure-class observation, not
healed (§5).

**Run 6 — `UpdateBranch_TC`, Headed, all 5 PASSED**, including `tcBr065`. Six `waitUntilLoaded`
resolutions, every one `cityLabel="Cairo" cityPlaceholder=false`, 843 ms – 2425 ms.

## 4. Result classification

| Test | Result | Classification |
|---|---|---|
| `tcBr055_editPenOpensUpdateBranchPreFilled` | Passed | **Automation Repaired** |
| `tcBr065_updateBranchPreFillsEveryStoredValue` | Passed | **Automation Repaired** |
| `tcBr061_navigateToLastPage` | Failed in run 5 | Open — needs an isolating run (§5) |
| `tcBr057_rejectPendingBranchFromResultsGrid` | Failed in run 5 | Open — needs an isolating run (§5) |
| `UpdateBranch_TC.setUp` | Failed in run 5, passed in run 6 | Intermittent login failure — not healed |

## 5. Health

| Dimension | Before | After |
|---|---|---|
| **Application Health** | unchanged | **unchanged** — no assertion was weakened, removed, or widened |
| **Automation Health** | 2 known failures in the repaired area | **0** — both repaired and verified in both modes |
| **Environment Health** | — | 1 intermittent login failure observed (run 5), self-resolved by run 6 |
