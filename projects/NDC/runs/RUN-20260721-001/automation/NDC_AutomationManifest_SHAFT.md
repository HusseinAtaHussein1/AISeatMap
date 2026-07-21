# NDC — Automation Manifest — RUN-20260721-001 — SHAFT

**Status:** Pending Review · Package: `projects/NDC/runs/RUN-20260712-001/automation/NDC_tests_SHAFT/` (continued in place)

## File Inventory

| File | Status | Notes |
|---|---|---|
| `src/main/java/AdminPages/Admin/AdminMenu.java` | **Extended** (not overwritten) | Added `Btn_Company`/`Btn_Role` fields and `openCompany()`/`openRole()` methods. All existing fields/methods untouched. |
| `src/main/java/AdminPages/Admin/Company/Role/Role_Page.java` | **New** | Page Object for the Add Role screen. |
| `src/test/java/AdminPages/Admin/Company/Role/Role_TC.java` | **New** | TestNG test class, extends `AdminTestBase`. 13 `@Test` methods. |
| `src/test/resources/testDataFiles/roleTestData.json` | **New** | Role Name test values. |

No other file in the existing package was modified. Login/Branch/Agency/Staff assets are entirely untouched.

## Self Review (per §15)

- **Naming consistency:** `Role_Page`/`Role_TC` follow the exact naming convention already established by `Branch_Page`/`Branch_TC`, `Staff_Page`/`Staff_TC`. `roleTestData.json` follows `branchTestData.json`/`staffTestData.json`'s naming pattern.
- **Duplicate code:** None identified — validation-message and Cancel-button locator *patterns* are reused from `Branch_Page.java` (same PrimeNG conventions), not duplicated as copy-pasted code; `Role_Page.java` defines its own instance since Page Objects in this codebase are not shared across modules.
- **Broken references:** None — every `Role_TC` test method references only methods that exist on `Role_Page`/`AdminMenu`/`AdminTestBase`, confirmed by a successful `mvn -o clean test-compile` (see below).
- **Missing reusable assets:** None identified this run — `openModuleSegment(label)`/`openSubModuleTab(label)` and the row-scoped checkbox helpers are already generalized (parametrized by label), not one-off per-tab methods.
- **Missing page objects:** None — all Role screen interaction goes through `Role_Page`, never inline `driver` calls in the test class.
- **Missing utilities:** None new needed — existing `AdminTestBase`/`CommonMethod`/`CredentialsLoader` infrastructure covers login/session setup.
- **Missing test data:** None — `roleTestData.json` externalizes every Role Name value used; no hardcoded literal appears inside `Role_TC.java` itself.
- **Architecture:** Matches the Automation Plan's stated Page Object Model / `AdminTestBase`-extension pattern — no deviation.
- **Compilation/syntax readiness:** `mvn -o clean test-compile` → **BUILD SUCCESS** (10 main source files, 7 test source files; confirmed 2026-07-21).
- **Framework compliance:** Uses `SHAFT.GUI.WebDriver`, `driver.element().click/type()`, TestNG `@Test`/`Assert` — no raw, unwrapped Selenium calls introduced.
- **Traceability:** Every `Role_TC` test method's comment states its Test Case ID and (where applicable) Finding Reference; all resolve against `workspace/test_design/Role/NDC_TraceabilityMatrix.md`.

## Recommendations

- The row-scoped checkbox locator (`Role_Page.rowCheckbox()`) has not yet been independently confirmed live through SHAFT's own Selenium binding — recommend this be the first thing checked when Stage 5 runs this suite, before trusting a green run at face value for TC-ROLE-013 through 016.
- Consider, in a future run, reconciling `Role_Page.java`'s `openModuleSegment(label)`/`openSubModuleTab(label)` approach back into the Reference Project's own `Role_Page.java` (currently 15 hardcoded positional methods) — an explicit, human-approved "Update the Reference Project directly" run, not done automatically here per the Target Decision Gate answer.
