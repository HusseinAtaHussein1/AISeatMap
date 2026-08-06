# Automation Manifest — SHAFT — branch

| Field | Value |
|---|---|
| Module | `branch` |
| Produced by run | `run-002__2026-08-03_10-26-17__UserStory__US-8605CreateBranch` |
| Framework | SHAFT Engine |
| Module project | `modules/branch/automation/tests_SHAFT/` |
| Shared assets referenced | None — no `automation_baseline/shaft/shared/` exists yet (greenfield, first automation project for this platform) |
| Lifecycle state | Generated |
| Total files | 13 |
| Generated | 13 |
| Reused | 0 |
| Created | 2026-08-03 |

## 1. File Inventory

| File | Type | Origin | Suite | For Test Case(s) | Lines |
|---|---|---|---|---|---|
| `pom.xml` | config | Generated | — (project-level) | — | 40 |
| `testng.xml` | config | Generated | — (project-level) | — | 8 |
| `.gitignore` | config | Generated | — (project-level) | — | 3 |
| `README.md` | config/docs | Generated | — (project-level) | — | 47 |
| `src/main/resources/properties/execution.properties` | config | Generated | — (project-level) | — | 9 |
| `src/test/resources/environment.properties` | config | Generated | — (project-level) | — | 4 |
| `src/test/resources/branch_baseline.properties` | test data | Generated | CreateBranchSuite | TC-BR-001, 013, 021, 038 | 14 |
| `src/main/java/utilities/EnvironmentConfig.java` | utility | Generated | CreateBranchSuite | All 13 | 46 |
| `src/main/java/utilities/BranchDataFactory.java` | utility | Generated | CreateBranchSuite | TC-BR-001, 013, 021, 038 | 18 |
| `src/main/java/AdminPages/Admin/Branch/BranchTestData.java` | fixture | Generated | CreateBranchSuite | TC-BR-001, 013, 021, 038 | 60 |
| `src/test/java/AdminPages/Login/TestBase_TC.java` | fixture (base class) | Generated | CreateBranchSuite | All 13 | 24 |
| `src/main/java/AdminPages/Login/LogIn_Page.java` | page object | Generated | CreateBranchSuite | All 13 (shared setup) | 30 |
| `src/main/java/AdminPages/Admin/Branch/AddBranch_Page.java` | page object | Generated | CreateBranchSuite | All 13 | ~315 |
| `src/test/java/AdminPages/Admin/Branch/CreateBranch_Admin_TC.java` | test script | Generated | CreateBranchSuite | TC-BR-001, 002, 004, 013, 021, 024, 025, 026, 028, 030, 037, 038, 039 | ~215 |

## 2. By Type

| Type | Generated | Reused | Total |
|---|---|---|---|
| test script | 1 | 0 | 1 |
| page object | 2 | 0 | 2 |
| fixture | 2 | 0 | 2 |
| utility | 2 | 0 | 2 |
| config/data | 6 | 0 | 6 |

## 3. Self Review Findings (§15)

*(Full account in `SelfReviewReport_SHAFT.md`. Summarized here per this template's own requirement.)*

| # | Finding | File(s) | Severity | Status | Resolution / Why Unresolved |
|---|---|---|---|---|---|
| 1 | `pom.xml` had an invalid XML comment (a `--` sequence inside a comment), which failed POM parsing outright | `pom.xml` | High (blocked all compilation) | Resolved | Rewrote the comment without any `--` sequence |
| 2 | Dead-code line (`AdminPages.Login.TestBase_TC fresh = this;`) left over from an earlier draft | `src/test/java/AdminPages/Admin/Branch/CreateBranch_Admin_TC.java` | Low | Resolved | Removed |
| 3 | Assumed Maven coordinate `com.shafthq:SHAFT_ENGINE` does not exist on Maven Central | `pom.xml` | High (blocked all compilation) | Resolved | Corrected to `io.github.shafthq:SHAFT_ENGINE:9.4.20251220`, confirmed via a live Maven Central search |
| 4 | Assumed SHAFT API surface (`SHAFT.GUI` with plain `getAttribute()`/`getText()`) does not match the real, resolved library's fluent/assertion-first API | `AdminPages/Login/LogIn_Page.java`, `AdminPages/Admin/Branch/AddBranch_Page.java`, `AdminPages/Login/TestBase_TC.java` | High (~40 compile errors) | Resolved | Inspected the resolved jar directly with `javap -p`; rewrote all three files to the confirmed real API (`SHAFT.GUI.WebDriver`, `driver.assertThat().element(locator).attribute(...).isEqualTo(...).perform()`) |
| 5 | This SHAFT_ENGINE version's browser-level validation builder has no fluent `text()`/page-source check | `AdminPages/Admin/Branch/AddBranch_Page.java` | Medium | Resolved | Used the concrete `BrowserActions` class's plain `getPageSource()`/`getCurrentURL()` methods with a direct TestNG `Assert`, documented in code comments as a version-specific workaround |

## 4. Self Review Recommendations (§15)

| # | Recommendation | Rationale |
|---|---|---|
| 1 | Re-run the Stack Documentation step (§34) once Context7 access is restored, to fetch real version-specific SHAFT_ENGINE 9.4.20251220 guidance beyond the raw method signatures this run had to reverse-engineer via `javap` | The generated code is confirmed to compile and use real methods, but idiomatic best-practice guidance (e.g. recommended wait strategies, soft-vs-hard assertion conventions) was never fetched — only inferred from method names |
| 2 | When this project is next extended, evaluate upgrading to `io.github.shafthq:shaft-engine:10.3.20260707` once a JDK 25 toolchain is available, since it is the actively maintained current artifact | This run's environment could not compile against it (JDK 23 max), so 9.4.20251220 was pinned as a documented, disclosed compromise, not a permanent choice |

## 5. Locator Fallbacks (§24.2)

*(None. Every locator in `SelectorVerificationReport_SHAFT.md` resolved via its primary strategy — no fallback strategy was needed for any of the 13 in-scope test cases' elements.)*

---

# Revision 2 — run-003

| Field | Value |
|---|---|
| Produced by run | `run-003__2026-08-04_11-24-38__UserStory__US-8599-SearchActions_US-8606-UpdateBranch` |
| Framework | SHAFT Engine 9.4.20251220 (unchanged) |
| Lifecycle state | Generated |
| Total files | 21 (13 carried + 7 created + 1 base page) |
| Created this revision | 8 |
| Modified this revision | 4 |
| Unchanged | 9 |
| Generated | 2026-08-04 |

## Created

| File | Purpose |
|---|---|
| `src/test/java/AdminPages/Login/TestBase.java` | Driver lifecycle + Super Admin login + `navigateToStartScreen()` hook |
| `src/main/java/AdminPages/Admin/Branch/Branch_Common.java` | Shared driver handle, bounded-wait factory, read helpers *(added during self-review to remove duplication — beyond the approved file list, flagged explicitly)* |
| `src/main/java/AdminPages/Admin/Branch/SearchBranch_Page.java` | Filters, grid, row-by-code actions, custom `tilde-paginator` |
| `src/main/java/AdminPages/Admin/Branch/UpdateBranch_Page.java` | Readiness poll, field reads, remarks, action buttons |
| `src/test/java/AdminPages/Admin/Branch/BranchProvisioner.java` | Creates a run-tagged branch, returns its assigned Branch Code |
| `src/test/java/AdminPages/Admin/Branch/SearchBranch_TC.java` | 11 tests |
| `src/test/java/AdminPages/Admin/Branch/BranchActions_TC.java` | 3 tests |
| `src/test/java/AdminPages/Admin/Branch/UpdateBranch_TC.java` | 5 tests |

## Modified

| File | Change |
|---|---|
| `src/test/java/AdminPages/Login/TestBase_TC.java` | Now extends `TestBase`; contributes only the Add Branch navigation. Behaviour preserved exactly. |
| `src/main/java/utilities/EnvironmentConfig.java` | `editBranchPath()` accessor added |
| `src/test/resources/environment.properties` | `editBranchPath` key added |
| `testng.xml` | Three new suites registered |

## Unchanged — verified byte-identical via `git diff`

`AdminPages/Admin/Branch/CreateBranch_Admin_TC.java` · `AdminPages/Admin/Branch/AddBranch_Page.java` · `AdminPages/Login/LogIn_Page.java` · `utilities/BranchDataFactory.java` · `AdminPages/Admin/Branch/BranchTestData.java` · `src/test/resources/branch_baseline.properties` · `pom.xml` · `src/main/resources/properties/execution.properties` · `README.md`

## Knowledge-base rules applied

| Rule | Application points |
|---|---|
| REPAIR-001 | Grid readiness · post-search settle · approval-status change (re-read from a fresh search) · Update-form pre-fill |
| REPAIR-002 | Remarks prompt · validation messages · success toasts — all non-throwing boolean polls |

## Build verification

`mvn -o -DskipTests test-compile` → **BUILD SUCCESS**, offline, against the pinned 9.4.20251220. 17 classes produced. **The suite was not executed — that is Stage 5A.**
