> **Status:** Pending Automation Approval · **Run:** RUN-20260712-001, Stage 4.

# Automation Suite Manifest — NDC

## Login Suite (`tests/tests/login.spec.js`)

- **Business workflow:** Login / Authentication
- **Test cases:** TC-LOGIN-001, TC-LOGIN-002, TC-LOGIN-003
- **Shared setup/teardown:** None required — every case starts logged-out (the natural default state); Playwright's own per-test browser context provides isolation, so no explicit teardown is needed beyond the framework default.
- **Shared fixtures:** None (single-screen scope; no authenticated-session fixture needed since Login itself is under test)
- **Shared components:** `pages/LoginPage.js` + `locators/LoginLocators.js`, used by all three test cases
- **Shared utilities:** `data/credentialsLoader.js` (resolves the real valid credential at execution time only)
- **Test data:** `data/loginTestData.json` (fabricated invalid/empty-case data only — no real secrets)

This is the only suite in this run — the entire approved Manual Test Suite is one business workflow.
