> **Status:** Raw execution record — no interpretation, per `agents/execution_agent.md` §2/§7 Rule 5. Narrative synthesis is the Reporting Agent's responsibility (Stage 6), not yet invoked.
> **Run:** RUN-20260706-002, Stage 5 (Execution Agent).
> **Execution ID:** `EXEC-20260706-002-001` (first, and to date only, execution of this run's Automation Package — unique per `agents/execution_agent.md` §7 Rule 6).

# Execution Results — OrangeHRM (RUN-20260706-002)

## Environment Confirmation (Execution Rule 1)

| Field | Project Context (Approved) Expectation | Actual (this execution) | Match? |
|---|---|---|---|
| Target URL | `https://opensource-demo.orangehrmlive.com/` | `playwright.config.js` → `baseURL: 'https://opensource-demo.orangehrmlive.com'` | Yes |
| Environment type | Shared public demo, no destructive mutations authorized | Automation Package generated (Stage 4) and approved (Automation Approval gate) specifically within that constraint — no test in this suite performs a persistence-committing action | Yes |
| Credentials | Admin / admin123 | `fixtures/testData.js` → `validCredentials: { username: 'Admin', password: 'admin123' }` | Yes |

No mismatch found. Execution proceeded.

## Run Metadata

| Field | Value |
|---|---|
| Automation Suite | `artifacts/OrangeHRM/runs/RUN-20260706-002/Automation/OrangeHRM_tests/` |
| Test Runner | `@playwright/test` v1.61.1 |
| Command | `npx playwright test --reporter=list,json` (run from `OrangeHRM_tests/`) |
| Execution Scope | Full suite (both `login.spec.js` and `pim.spec.js`) — no scope restriction applied |
| Workers | 2 configured concurrent execution slots (Playwright's own internal parallelization; `fullyParallel: false` per the Automation Package's config) |
| Wall-clock Start | 2026-07-06T12:43:52.831Z |
| Wall-clock Duration | 295,165 ms (≈4m 55s) |
| Raw JSON reporter output | `execution/playwright-report.json` |
| Full console transcript | `execution/execution_console_output.log` |
| Evidence root | `execution/artifacts/test-results/` (relocated as-is from the Automation Package's own `test-results/` output directory — file contents unmodified) |

## Aggregate Counts

| Status | Count |
|---|---|
| Passed | 12 |
| Failed | 12 |
| Skipped | 1 |
| Flaky | 0 |
| **Total** | **25** |

## Per-Test Results

### Login Suite (`tests/login.spec.js`)

| Executed Test Case ID | Automation Script ID | Status | Start Time (UTC) | Duration | Screenshots | Logs | Failure Message |
|---|---|---|---|---|---|---|---|
| TC-LOGIN-001 | `login.spec.js::TC-LOGIN-001: valid login redirects successfully` | Passed | 12:43:53.262Z | 12,114 ms | — (none on pass) | trace/video not retained on pass (config: retain-on-failure) | — |
| TC-LOGIN-002 | `login.spec.js::TC-LOGIN-002: invalid credentials rejected with generic message` | **Failed** | 12:44:06.557Z | 8,816 ms | `test-results/login-Login-Suite-TC-LOGIN-4d07c-jected-with-generic-message/test-failed-1.png` | video: `.../video.webm`; trace: `.../trace.zip`; error-context: `.../error-context.md` | `expect(locator).toHaveText(expected) failed — Locator: locator('[role="alert"]') — Expected pattern: /Invalid credentials/ — Timeout: 5000ms — Error: element(s) not found` |
| TC-LOGIN-003 | `login.spec.js::TC-LOGIN-003: empty login form blocked by required-field validation` | Passed | 12:44:15.861Z | 4,615 ms | — | — | — |
| TC-LOGIN-004 [REGRESSION, FINDING-001] | `login.spec.js::TC-LOGIN-004: emoji username must not surface a generic server error` | **Failed** | 12:44:20.583Z | 9,370 ms | `test-results/login-Login-Suite-TC-LOGIN-cc68e-face-a-generic-server-error/test-failed-1.png` | video, trace, error-context in same folder | `expect(locator).toHaveText(expected) failed — Expected pattern: /Invalid credentials/ — Received string: "Unexpected error occurred"` |
| TC-LOGIN-005 | `login.spec.js::TC-LOGIN-005: SQL-injection-style payload does not bypass authentication` | Passed | 12:44:30.474Z | 8,078 ms | — | — | — |
| TC-LOGIN-006 [EXPLORATORY, FINDING-002] | `login.spec.js::TC-LOGIN-006: repeated failed logins — observe brute-force protection` | Passed | 12:44:38.658Z | 25,222 ms | — | stdout: `TC-LOGIN-006: 5/5 attempts rejected normally; no lockout/CAPTCHA observed — HUMAN REVIEW REQUIRED on acceptability.` | — |
| TC-LOGIN-007 | `login.spec.js::TC-LOGIN-007: unauthenticated deep-link redirects to login and returns after login` | Passed | 12:45:03.891Z | 6,869 ms | — | — | — |
| TC-LOGIN-008 | `login.spec.js::TC-LOGIN-008: forgot password with unknown username returns generic success` | Passed | 12:45:10.772Z | 6,315 ms | — | — | — |
| TC-LOGIN-009 [REGRESSION, FINDING-005] | `login.spec.js::TC-LOGIN-009: forgot password with a valid username must not time out` | **Failed** | 12:45:17.096Z | 12,743 ms | (none — network/navigation-level failure, no screenshot captured) | video, trace, error-context: `test-results/login-Login-Suite-TC-LOGIN-fe311--username-must-not-time-out/` | `expect(locator).toHaveText(expected) failed — Locator: locator('h6') — Expected pattern: /sent successfully/i — Received string: "Reset Password" — Timeout: 5000ms` |
| TC-LOGIN-010 [EXPLORATORY, FINDING-006] | `login.spec.js::TC-LOGIN-010: forgot password response asymmetry between valid/invalid usernames` | **Failed** | 12:45:30.336Z | 13,692 ms | (none — navigation-level failure) | video, trace, error-context: `test-results/login-Login-Suite-TC-LOGIN-de017-een-valid-invalid-usernames/` | `page.goto: net::ERR_ABORTED at https://opensource-demo.orangehrmlive.com/web/index.php/auth/requestPasswordResetCode` (raised from `ForgotPasswordPage.goto`, line 13, called at `login.spec.js:115`) |
| TC-LOGIN-011 | `login.spec.js::TC-LOGIN-011: long username input does not degrade login handling` | Passed | 12:45:44.624Z | 6,381 ms | — | — | — |

### PIM Suite (`tests/pim.spec.js`)

| Executed Test Case ID | Automation Script ID | Status | Start Time (UTC) | Duration | Screenshots | Logs | Failure Message |
|---|---|---|---|---|---|---|---|
| TC-PIM-001 | `pim.spec.js::TC-PIM-001: employee list displays with documented columns` | Passed | 12:43:53.271Z | 18,936 ms | — | — | — |
| TC-PIM-002 | `pim.spec.js::TC-PIM-002: employee list filter panel exposes all documented fields` | **Failed** (timedOut) | 12:44:13.378Z | 46,247 ms | `test-results/pim-PIM-Suite-TC-PIM-002-e-a5d9a-poses-all-documented-fields/test-failed-1.png` | video, trace, error-context in same folder | `Test timeout of 45000ms exceeded.` — `locator.click: Test timeout of 45000ms exceeded. Call log: waiting for getByRole('heading', { name: 'Employee Information' }).locator('xpath=following-sibling::button[1] \| ../button').first()` at `EmployeeListPage.js:23` (`expandFilterPanel`) |
| TC-PIM-003 | `pim.spec.js::TC-PIM-003: employee id filter returns "No Records Found" for a valid-length nonexistent value` | **Failed** (timedOut) | 12:45:00.211Z | 46,319 ms | `test-results/pim-PIM-Suite-TC-PIM-003-e-e2516-id-length-nonexistent-value/test-failed-1.png` | video, trace, error-context in same folder | Same `expandFilterPanel` timeout as TC-PIM-002, at `EmployeeListPage.js:23` |
| TC-PIM-004 [REGRESSION, FINDING-003] | `pim.spec.js::TC-PIM-004: employee id filter must not silently fail above 10 characters` | **Failed** (timedOut) | 12:45:47.196Z | 46,210 ms | `test-results/pim-PIM-Suite-TC-PIM-004-R-faba3-ly-fail-above-10-characters/test-failed-1.png` | video, trace, error-context in same folder | Same `expandFilterPanel` timeout as TC-PIM-002, at `EmployeeListPage.js:23` (test did not reach its own FINDING-003-specific assertion) |
| TC-PIM-005 | `pim.spec.js::TC-PIM-005: add employee blocks submission when required fields are empty` | **Failed** | 12:46:34.087Z | 6,544 ms | `test-results/pim-PIM-Suite-TC-PIM-005-a-88646-n-required-fields-are-empty/test-failed-1.png` | video, trace, error-context in same folder | `expect(received).toBeGreaterThanOrEqual(expected) — Expected: >= 2 — Received: 0` (`getRequiredErrorCount()`) |
| TC-PIM-006 [REGRESSION, FINDING-004] | `pim.spec.js::TC-PIM-006: employee id uniqueness check must not crash on emoji input` | **Failed** (timedOut) | 12:46:41.283Z | 46,452 ms | `test-results/pim-PIM-Suite-TC-PIM-006-R-eabc2-st-not-crash-on-emoji-input/test-failed-1.png` | video, trace, error-context in same folder | `Test timeout of 45000ms exceeded.` — `page.waitForResponse: Test timeout of 45000ms exceeded.` waiting for a response matching `/api/v2/core/validation/unique` |
| TC-PIM-007 | `pim.spec.js::TC-PIM-007: add employee displays the documented photo-upload constraint text` | Passed | 12:47:28.391Z | 4,393 ms | — | — | — |
| TC-PIM-008 | `pim.spec.js::TC-PIM-008: employee detail exposes all 10 documented tabs` | **Failed** | 12:47:32.888Z | 4,174 ms | `test-results/pim-PIM-Suite-TC-PIM-008-e-e909f-oses-all-10-documented-tabs/test-failed-1.png` | video, trace, error-context in same folder | `expect(received).toBe(expected) // Object.is equality — Expected: 10 — Received: 0` (`countVisibleTabs()`) |
| TC-PIM-009 | `pim.spec.js::TC-PIM-009: personal details tab exposes documented fields` | Passed | 12:47:37.584Z | 4,580 ms | — | — | — |
| TC-PIM-010 | `pim.spec.js::TC-PIM-010: empNumber remains stable across employee detail tabs` | Passed | 12:47:42.263Z | 4,631 ms | — | — | — |
| TC-PIM-011 [ASSUMPTION-BASED] | `pim.spec.js::TC-PIM-011: employee list row action icons — capture accessible names for review` | **Failed** | 12:47:46.905Z | 3,569 ms | `test-results/pim-PIM-Suite-TC-PIM-011-A-faffd-accessible-names-for-review/test-failed-1.png` | video, trace, error-context in same folder; stdout: `TC-PIM-011: row action button accessible names = [] — HUMAN REVIEW REQUIRED to confirm actual Edit/Delete semantics.` | `expect(received).toBeGreaterThan(expected) — Expected: > 0 — Received: 0` |
| TC-PIM-012 | `pim.spec.js::TC-PIM-012: employee list sorting controls function correctly` | Passed | 12:47:50.981Z | 5,054 ms | — | — | — |
| TC-PIM-013 | `pim.spec.js::TC-PIM-013: employee list pagination controls function correctly` | **Skipped** | 12:47:56.135Z | 5,119 ms | — | — | Skip annotation (built into the test, per its own designed logic): `"Fewer than 2 pages of results at execution time — see Coverage Report Test Gap notes."` |
| TC-PIM-014 | `pim.spec.js::TC-PIM-014: other employee list filter fields function correctly` | **Failed** (timedOut) | 12:48:01.265Z | 46,532 ms | `test-results/pim-PIM-Suite-TC-PIM-014-o-2408f-r-fields-function-correctly/test-failed-1.png` | video, trace, error-context in same folder | Same `expandFilterPanel` timeout as TC-PIM-002, at `EmployeeListPage.js:23` |

## Console / Network Log Availability (disclosed, per Execution Rule 7)

No standalone `.log` files containing console or network output were produced separately from the above. Per the Automation Package's own `playwright.config.js` (generated and approved at Stage 4, unmodified by this stage): `trace: 'retain-on-failure'` and `video: 'retain-on-failure'` — for every **Failed** test, the linked `trace.zip` embeds that test's console messages and network request/response log internally (viewable via `npx playwright show-trace <path>`); for every **Passed** or **Skipped** test, no trace/video/screenshot was retained at all, per that same configuration, and so no console/network evidence exists for those 12 passed + 1 skipped tests. This is a property of the Automation Package as approved; the Execution Agent did not alter it and is not the source of this limitation.

## Rerun Note (Execution Rule 6)

This is Execution ID `EXEC-20260706-002-001` — the first execution of this run's Automation Package. No prior execution exists for RUN-20260706-002 to be confused with.
