> **Status:** `Approved` (reviewer: Aymoon, Automation Lead / Release Manager role, 2026-07-06).

# Automation Suite Manifest — RUN-20260706-002

## Login Suite (`tests/login.spec.js`)

- **Test Cases:** TC-LOGIN-001 through TC-LOGIN-011 (11 total)
- **Shared Setup:** none beyond navigation — every test starts from a logged-out state, which is the natural starting point for this suite
- **Shared Teardown:** none required — Playwright's default per-test context isolation is sufficient
- **Shared Fixtures:** none (Login tests do not require an authenticated session)
- **Shared Components:** `LoginPage`, `ForgotPasswordPage`
- **Shared Utilities:** none beyond the Page Objects themselves
- **Shared Test Data:** `fixtures/testData.js` — `validCredentials`, `invalidPassword`, `unknownUsernameForResetProbe`, `boundaryValues` (emoji, SQLi payload, long string), `protectedDeepLinkUrl`

## PIM Suite (`tests/pim.spec.js`)

- **Test Cases:** TC-PIM-001 through TC-PIM-014 (14 total)
- **Shared Setup:** the `authenticatedPage` fixture (`fixtures/authenticatedPage.fixture.js`) — logs in once per test via the real UI login flow
- **Shared Teardown:** none required — default per-test context isolation
- **Shared Fixtures:** `authenticatedPage`
- **Shared Components:** `EmployeeListPage`, `AddEmployeePage`, `EmployeeDetailPage`
- **Shared Utilities:** none beyond the Page Objects themselves
- **Shared Test Data:** `fixtures/testData.js` — `boundaryValues.employeeId10Chars`/`employeeId11Chars`/`numericNonexistentEmployeeId`/`emoji`, `knownExistingEmpNumber`

## Cross-Suite Reuse

`fixtures/testData.js` is shared by both suites (e.g., `boundaryValues.emoji` is used by both `TC-LOGIN-004` and `TC-PIM-006`, since both regress the same defect class) — a single source of truth for boundary values, per the Automation Knowledge Base principle (§11), rather than duplicating the literal in two places.
