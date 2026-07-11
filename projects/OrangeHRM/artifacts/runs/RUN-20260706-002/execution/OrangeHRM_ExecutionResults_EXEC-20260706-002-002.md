> **Status:** Raw execution record — no interpretation, per `agents/execution_agent.md` §8 Rule 8. Narrative synthesis, if needed for this execution specifically, is the Reporting Agent's responsibility, not performed here.
> **Run:** RUN-20260706-002, Stage 5 (Execution Agent v2) — **second** execution of this run's Automation Package.
> **Execution ID:** `EXEC-20260706-002-002`. The first execution, `EXEC-20260706-002-001`, is preserved unmodified at `OrangeHRM_ExecutionResults_EXEC-20260706-002-001.md` (renamed from its original unsuffixed filename specifically to protect it before this second execution began) — this document does not supersede or overwrite it.

# Execution Results — OrangeHRM (RUN-20260706-002), Execution 2 of 2 to date

## Execution Mode (new required field, per `agents/execution_agent.md` v2 §5)

| Field | Value |
|---|---|
| Source | Not defined in the approved Run Configuration for this run — the agent halted and asked the user directly, per §5.1 Rule 2 |
| User's answer | **Headed** |
| Runner invocation | `npx playwright test --headed --reporter=list,json` |

No default was assumed at any point. This is the first execution of this Automation Package performed under the v2 Execution Agent spec; `EXEC-20260706-002-001` predates that spec and has no Execution Mode field recorded, which is expected and not retroactively added to that document.

## Environment Confirmation (Execution Rule 1)

| Field | Project Context (Approved) Expectation | Actual (this execution) | Match? |
|---|---|---|---|
| Target URL | `https://opensource-demo.orangehrmlive.com/` | `playwright.config.js` → `baseURL` (unchanged since Execution 1) | Yes |
| Environment type | Shared public demo, no destructive mutations authorized | Same, unmodified Automation Package as Execution 1 | Yes |
| Credentials | Admin / admin123 | `fixtures/testData.js` (unchanged) | Yes |

No mismatch found.

## Run Metadata

| Field | Value |
|---|---|
| Automation Suite | `artifacts/OrangeHRM/runs/RUN-20260706-002/Automation/OrangeHRM_tests/` (unmodified since Execution 1 — no automation code was changed between executions) |
| Test Runner | `@playwright/test` v1.61.1 |
| Command | `npx playwright test --headed --reporter=list,json` (run from `OrangeHRM_tests/`) |
| Execution Scope | Full suite (both `login.spec.js` and `pim.spec.js`) |
| Workers | 2 configured concurrent execution slots |
| Wall-clock Start | 2026-07-06T13:21:52.021Z |
| Wall-clock Duration | 282,121 ms (≈4m 42s) |
| Full console transcript | `execution/EXEC-20260706-002-002_execution_console_output.log` (also contains the full raw JSON report — this run's CLI reporter flags did not write a separate `.json` file, per Playwright's own behavior when `--reporter` is specified on the command line without an explicit `outputFile`) |
| Evidence root | `execution/artifacts/test-results_EXEC-20260706-002-002/` |

## Aggregate Counts

| Status | Count |
|---|---|
| Passed | 13 |
| Failed | 11 |
| Skipped | 1 |
| Flaky | 0 (same caveat as Execution 1: `retries: 0`, so flakiness is structurally undetectable by Playwright's own mechanism — see below) |
| **Total** | **25** |

## Comparison to Execution 1 (`EXEC-20260706-002-001`) — factual only, no cause asserted

| Test | Execution 1 | Execution 2 | Changed? |
|---|---|---|---|
| TC-LOGIN-002 | Failed (`[role="alert"] element(s) not found`, 5000ms timeout) | **Passed** | **Yes** |
| All other 24 tests | (see Execution 1's own results table) | Identical status to Execution 1 | No |

This is stated as a fact about the two executions' outputs, not a diagnosis of *why* `TC-LOGIN-002` changed status. It is consistent with — but does not itself prove — the possibility raised in the Final QA Report (§3, "0 Flaky" caveat) that this specific failure was a one-off timing occurrence rather than a reproducible one; a definitive answer would require enabling retries, which this run's Automation Package deliberately does not do.

## Per-Test Results

### Login Suite (`tests/login.spec.js`)

| Executed Test Case ID | Automation Script ID | Status | Start Time (UTC) | Duration | Evidence | Failure Message |
|---|---|---|---|---|---|---|
| TC-LOGIN-001 | `login.spec.js::TC-LOGIN-001` | Passed | 13:21:52.464Z | 4,913 ms | — | — |
| TC-LOGIN-002 | `login.spec.js::TC-LOGIN-002` | **Passed** (was Failed in Execution 1) | 13:21:58.548Z | 4,242 ms | — | — |
| TC-LOGIN-003 | `login.spec.js::TC-LOGIN-003` | Passed | 13:22:02.803Z | 2,788 ms | — | — |
| TC-LOGIN-004 [REGRESSION, FINDING-001] | `login.spec.js::TC-LOGIN-004` | **Failed** | 13:22:05.602Z | 7,911 ms | `test-results_EXEC-20260706-002-002/login-Login-Suite-TC-LOGIN-cc68e-.../{test-failed-1.png,video.webm,trace.zip,error-context.md}` | `toHaveText failed — Expected: /Invalid credentials/ — Received: "Unexpected error occurred"` (identical to Execution 1) |
| TC-LOGIN-005 | `login.spec.js::TC-LOGIN-005` | Passed | 13:22:14.187Z | 3,199 ms | — | — |
| TC-LOGIN-006 [EXPLORATORY, FINDING-002] | `login.spec.js::TC-LOGIN-006` | Passed | 13:22:17.605Z | 10,445 ms | stdout: `5/5 attempts rejected normally; no lockout/CAPTCHA observed — HUMAN REVIEW REQUIRED on acceptability.` | — |
| TC-LOGIN-007 | `login.spec.js::TC-LOGIN-007` | Passed | 13:22:28.063Z | 3,418 ms | — | — |
| TC-LOGIN-008 | `login.spec.js::TC-LOGIN-008` | Passed | 13:22:31.496Z | 3,738 ms | — | — |
| TC-LOGIN-009 [REGRESSION, FINDING-005] | `login.spec.js::TC-LOGIN-009` | **Failed** | 13:22:35.246Z | 13,058 ms | `test-results_EXEC-20260706-002-002/login-Login-Suite-TC-LOGIN-fe311-.../{video.webm,trace.zip,error-context.md}` (no screenshot — navigation-level failure, same as Execution 1) | `toHaveText failed — Expected: /sent successfully/i — Received: "Reset Password"` (identical to Execution 1) |
| TC-LOGIN-010 [EXPLORATORY, FINDING-006] | `login.spec.js::TC-LOGIN-010` | **Failed** (timedOut) | 13:22:48.976Z | 57,351 ms | `test-results_EXEC-20260706-002-002/login-Login-Suite-TC-LOGIN-de017-.../{video.webm,trace.zip,error-context.md}` | `Test timeout of 45000ms exceeded` — `page.goto: net::ERR_ABORTED; maybe frame was detached? ... at ForgotPasswordPage.goto` (same underlying error as Execution 1; this time surfaced as the outer test timeout rather than a same-tick `ERR_ABORTED` throw — both attributable to the same navigation-abort condition) |
| TC-LOGIN-011 | `login.spec.js::TC-LOGIN-011` | Passed | 13:23:47.166Z | 3,192 ms | — | — |

### PIM Suite (`tests/pim.spec.js`)

| Executed Test Case ID | Automation Script ID | Status | Start Time (UTC) | Duration | Evidence | Failure Message |
|---|---|---|---|---|---|---|
| TC-PIM-001 | `pim.spec.js::TC-PIM-001` | Passed | 13:21:52.465Z | 5,864 ms | — | — |
| TC-PIM-002 | `pim.spec.js::TC-PIM-002` | **Failed** (timedOut) | 13:21:59.497Z | 46,236 ms | `test-results_EXEC-20260706-002-002/pim-PIM-Suite-TC-PIM-002-.../{test-failed-1.png,video.webm,trace.zip,error-context.md}` | `Test timeout of 45000ms exceeded` — `expandFilterPanel`, `EmployeeListPage.js:23` (identical to Execution 1) |
| TC-PIM-003 | `pim.spec.js::TC-PIM-003` | **Failed** (timedOut) | 13:22:46.428Z | 46,514 ms | same folder pattern | Same `expandFilterPanel` timeout (identical to Execution 1) |
| TC-PIM-004 [REGRESSION, FINDING-003] | `pim.spec.js::TC-PIM-004` | **Failed** (timedOut) | 13:23:33.785Z | 46,529 ms | same folder pattern | Same `expandFilterPanel` timeout (identical to Execution 1 — did not reach its own FINDING-003 assertion, same as before) |
| TC-PIM-005 | `pim.spec.js::TC-PIM-005` | **Failed** | 13:24:21.286Z | 5,158 ms | same folder pattern | `getRequiredErrorCount()` returned 0, expected ≥2 (identical to Execution 1) |
| TC-PIM-006 [REGRESSION, FINDING-004] | `pim.spec.js::TC-PIM-006` | **Failed** (timedOut) | 13:24:27.402Z | 46,487 ms | same folder pattern | `waitForResponse` timeout for `/api/v2/core/validation/unique` (identical to Execution 1 — did not reach its own FINDING-004 assertion, same as before) |
| TC-PIM-007 | `pim.spec.js::TC-PIM-007` | Passed | 13:25:14.853Z | 4,784 ms | — | — |
| TC-PIM-008 | `pim.spec.js::TC-PIM-008` | **Failed** | 13:25:19.845Z | 3,930 ms | same folder pattern | `countVisibleTabs()` returned 0, expected 10 (identical to Execution 1) |
| TC-PIM-009 | `pim.spec.js::TC-PIM-009` | Passed | 13:25:24.471Z | 5,513 ms | — | — |
| TC-PIM-010 | `pim.spec.js::TC-PIM-010` | Passed | 13:25:30.188Z | 4,264 ms | — | — |
| TC-PIM-011 [ASSUMPTION-BASED] | `pim.spec.js::TC-PIM-011` | **Failed** | 13:25:34.464Z | 3,687 ms | same folder pattern; stdout: `row action button accessible names = [] — HUMAN REVIEW REQUIRED...` | Button count 0, expected >0 (identical to Execution 1) |
| TC-PIM-012 | `pim.spec.js::TC-PIM-012` | Passed | 13:25:38.895Z | 4,518 ms | — | — |
| TC-PIM-013 | `pim.spec.js::TC-PIM-013` | **Skipped** | 13:25:43.611Z | 3,650 ms | — | Skip annotation (built into the test): `"Fewer than 2 pages of results at execution time — see Coverage Report Test Gap notes."` (identical to Execution 1) |
| TC-PIM-014 | `pim.spec.js::TC-PIM-014` | **Failed** (timedOut) | 13:25:47.275Z | 46,513 ms | same folder pattern | Same `expandFilterPanel` timeout (identical to Execution 1) |

## Console / Network Log Availability

Same disclosed limitation as Execution 1: no standalone `.log` files for console/network output exist separately from what each failed test's `trace.zip` embeds internally, per the Automation Package's own (unmodified) `playwright.config.js`. Passed and Skipped tests retain no trace/video/screenshot, per that same configuration.

## Rerun Note (Execution Rule 6/9)

This is `EXEC-20260706-002-002`, the second execution of this run's Automation Package. `EXEC-20260706-002-001`'s artifacts were renamed (never deleted or overwritten) to carry its own Execution ID in their filenames before this execution began, specifically to satisfy the "never silently overwritten" requirement now that two executions exist for the same run.
