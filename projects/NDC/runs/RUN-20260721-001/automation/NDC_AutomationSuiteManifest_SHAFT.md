# NDC — Automation Suite Manifest — RUN-20260721-001 — SHAFT

**Status:** Pending Review

## Role Suite (new)

Business-workflow-organized around the Create Role workflow (not a per-screen split), matching this project's existing Login/Branch/Agency/Staff suite convention.

- **Test class:** `AdminPages.Admin.Company.Role.Role_TC` (extends `AdminTestBase`)
- **Test cases:** TC-ROLE-001 (partial), 002, 003, 004, 009, 010, 011, 012, 013, 014, 015, 016, 019, 020 (13 full + 1 partial = 14 `@Test` methods)
- **Shared Setup/Teardown:** Inherited from `AdminTestBase` — per-method login as `odeysysadmin` + Admin tab opened, before every test; driver quit after every test.
- **Shared Fixtures/Components:** `AdminMenu` (extended with `openCompany()`/`openRole()`), `Role_Page` (this suite's own Page Object).
- **Shared Utilities:** `CommonMethod`/`CredentialsLoader` (unchanged, shared platform-wide across every suite in this package).
- **Shared Test Data:** `src/test/resources/testDataFiles/roleTestData.json`.

## Not Part of Any Suite (deliberately)

TC-ROLE-005, 006, 007, 008, 017, 018 (Manual Only, assumption-based) and TC-ROLE-021, 022 (Manual Only, Exploratory charters) are not TestNG methods anywhere in this package — see Automation Decision Report for each one's reason.

## Relationship to Existing Suites

The Login/Branch/Agency/Staff suites in this same package (`NDC_tests_SHAFT`) are entirely untouched by this run — no shared fixture/utility used by them was modified, only `AdminMenu.java` was extended (additively).
