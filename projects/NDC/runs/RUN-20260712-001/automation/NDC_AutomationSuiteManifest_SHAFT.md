> **Status:** Pending Automation Approval · **Run:** RUN-20260712-001, Stage 4.

# Automation Suite Manifest — NDC Login (SHAFT Export)

## Login Suite (`tests_SHAFT/src/test/java/AdminPages/Login/LogIn_TC.java`)

- **Business workflow:** Login / Authentication
- **Test cases:** TC-LOGIN-001 through TC-LOGIN-008
- **Shared setup/teardown:** `TestBase` — per-method `@BeforeMethod`/`@AfterMethod` driver setup/teardown via `Drive_Factory.CommonMethod`, giving every test case (including the 3 structural, no-submission checks) a guaranteed clean, logged-out browser state.
- **Shared fixtures:** None beyond `TestBase`.
- **Shared components:** `AdminPages.Login.LogIn_Page` (Page Object, reused across all 8 test methods).
- **Shared utilities:** `utilities.CredentialsLoader` (resolves the real valid credential at execution time only).
- **Test data:** `src/test/resources/testDataFiles/loginTestData.json` (fabricated invalid-username/wrong-password data only).

This is the only suite in this package — the entire approved Manual Test Suite is one business workflow.
