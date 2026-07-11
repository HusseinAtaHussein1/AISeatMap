> **Status:** `Approved` (reviewer: Aymoon, Automation Lead / Release Manager role, 2026-07-06). Per `agents/automation_agent.md` §13 — every manual test case receives exactly one decision.

# Automation Decision Report — RUN-20260706-002

## Login Suite

| Test Case | Decision | Justification | Reused Assets | Generated Assets | Automation Readiness | Known Limitations |
|---|---|---|---|---|---|---|
| TC-LOGIN-001 | Generate New Automation | Deterministic positive case, fully specified. | None | `login.spec.js` test, `LoginPage` | Ready | None |
| TC-LOGIN-002 | Generate New Automation | Deterministic negative case. | `LoginPage` | `login.spec.js` test | Ready | None |
| TC-LOGIN-003 | Generate New Automation | Deterministic empty-value case. | `LoginPage` | `login.spec.js` test | Ready | None |
| TC-LOGIN-004 | Generate New Automation | Regression test for FINDING-001; deterministic once the fix lands. | `LoginPage`, `testData.boundaryValues.emoji` | `login.spec.js` test | Ready — **expected to fail until FINDING-001 is fixed** (by design) | Asserts corrected behavior, not current behavior |
| TC-LOGIN-005 | Generate New Automation | Deterministic security-input case; well-suited to automation (no bypass = pass). | `LoginPage`, `testData.boundaryValues.sqlInjectionPayload` | `login.spec.js` test | Ready | None |
| TC-LOGIN-006 | Partially Automatable | The 5-attempt reproduction and "no lockout observed" capture is deterministic; whether that absence is *acceptable* is a human policy judgment this agent cannot assert. | `LoginPage` | `login.spec.js` test (reports via console log, asserts only the deterministic sub-observations) | Ready for its automatable portion; judgment portion remains manual | Test does not assert pass/fail on the policy question — see FINDING-002 |
| TC-LOGIN-007 | Generate New Automation | Deterministic redirect-and-return behavior. | `LoginPage`, `testData.protectedDeepLinkUrl` | `login.spec.js` test | Ready | Assumes the PIM Employee List route remains the same |
| TC-LOGIN-008 | Generate New Automation | Deterministic positive case. | `ForgotPasswordPage` | `login.spec.js` test | Ready | None |
| TC-LOGIN-009 | Generate New Automation | Regression test for FINDING-005. | `ForgotPasswordPage` | `login.spec.js` test | Ready — **expected to fail until FINDING-005 is fixed** (by design) | Uses a shortened 10s timeout rather than waiting for a full 504; if the fix introduces its own multi-second latency, this timeout may need raising at execution time |
| TC-LOGIN-010 | Partially Automatable | Capturing outcome/timing for both usernames is deterministic; whether the demonstrated asymmetry is in-scope for the anti-enumeration requirement is a policy judgment. | `ForgotPasswordPage` | `login.spec.js` test (reports via console log) | Ready for its automatable portion; judgment portion remains manual | Does not assert pass/fail on the policy question — see FINDING-006 |
| TC-LOGIN-011 | Generate New Automation | Deterministic boundary case. | `LoginPage`, `testData.boundaryValues.longAlphaNumeric259` | `login.spec.js` test | Ready | None |

## PIM Suite

| Test Case | Decision | Justification | Reused Assets | Generated Assets | Automation Readiness | Known Limitations |
|---|---|---|---|---|---|---|
| TC-PIM-001 | Generate New Automation | Deterministic display check. | `authenticatedPage` fixture | `EmployeeListPage`, `pim.spec.js` test | Ready | None |
| TC-PIM-002 | Generate New Automation | Deterministic structural check. | `authenticatedPage`, `EmployeeListPage` | `pim.spec.js` test | Ready | None |
| TC-PIM-003 | Generate New Automation | Deterministic positive-boundary case. | `authenticatedPage`, `EmployeeListPage`, `testData.boundaryValues.numericNonexistentEmployeeId` | `pim.spec.js` test | Ready | None |
| TC-PIM-004 | Generate New Automation | Regression test for FINDING-003; deterministic once fixed. | `authenticatedPage`, `EmployeeListPage`, `testData.boundaryValues.employeeId11Chars` | `pim.spec.js` test | Ready — **expected to fail until FINDING-003 is fixed** (by design) | Assertion approach (checking for "No Records Found" or a changed state) may need adjustment once the actual fix behavior is known |
| TC-PIM-005 | Generate New Automation | Deterministic required-field case. | `authenticatedPage` | `AddEmployeePage`, `pim.spec.js` test | Ready | None |
| TC-PIM-006 | Generate New Automation | Regression test for FINDING-004; deterministic via the uniqueness-check response status. | `authenticatedPage`, `AddEmployeePage`, `testData.boundaryValues.emoji` | `pim.spec.js` test | Ready — **expected to fail until FINDING-004 is fixed** (by design) | None |
| TC-PIM-007 | Generate New Automation | Deterministic text-content check. | `authenticatedPage`, `AddEmployeePage` | `pim.spec.js` test | Ready | None |
| TC-PIM-008 | Generate New Automation | Deterministic structural check. | `authenticatedPage`, `testData.knownExistingEmpNumber` | `EmployeeDetailPage`, `pim.spec.js` test | Ready | Depends on empNumber 104 remaining a valid record on the shared demo — see Automation Plan Assumptions |
| TC-PIM-009 | Generate New Automation | Deterministic structural check. | `authenticatedPage`, `EmployeeDetailPage` | `pim.spec.js` test | Ready | Same empNumber dependency as TC-PIM-008 |
| TC-PIM-010 | Generate New Automation | Deterministic identifier-stability check. | `authenticatedPage`, `EmployeeDetailPage` | `pim.spec.js` test | Ready | Same empNumber dependency as TC-PIM-008 |
| TC-PIM-011 | Partially Automatable | Capturing accessible names is deterministic; confirming actual Edit/Delete semantics requires a human to click through and observe. | `authenticatedPage`, `EmployeeListPage` | `pim.spec.js` test (reports via console log) | Ready for its automatable portion; judgment portion remains manual | Does not assert Edit/Delete semantics as fact — Assumption-based, per PRD §13 item 4 |
| TC-PIM-012 | Generate New Automation | Deterministic, though Discovery evidence for this exact behavior is thin (Test Gap) — the automation itself is still straightforward to write against the documented requirement. | `authenticatedPage`, `EmployeeListPage` | `pim.spec.js` test | Ready, but unverified against live behavior — selector for the sort icon may need adjustment at first execution | Discovery Reference is "Not independently verified" — treat first execution result as also validating the selector, not just the requirement |
| TC-PIM-013 | Generate New Automation | Same reasoning as TC-PIM-012. | `authenticatedPage`, `EmployeeListPage` | `pim.spec.js` test | Ready, with a built-in skip if fewer than 2 pages exist at execution time | Same selector-validation caveat as TC-PIM-012 |
| TC-PIM-014 | Generate New Automation | Same reasoning as TC-PIM-012/013; only the Job Title field is scripted as the representative case per the Manual Test Suite's own consolidation choice. | `authenticatedPage`, `EmployeeListPage` | `pim.spec.js` test | Ready, with the same selector-validation caveat | Only asserts the field is visible/reachable, not a full functional narrowing-of-results check — a lighter-weight automation than the Manual Test Suite's full Steps describe, given the "evidence-thin" status; noted here rather than silently claiming full parity |

## Summary

- **Reuse Existing Automation: 0** (no existing automation project — greenfield run)
- **Generate New Automation: 21**
- **Partially Automatable: 3** (TC-LOGIN-006, TC-LOGIN-010, TC-PIM-011)
- **Manual Only: 0**
- **Total: 25/25 test cases decisioned — none left undecided.**
