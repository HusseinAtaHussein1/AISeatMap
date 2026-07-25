# NDC — Automation Plan — RUN-20260721-001 — SHAFT

**Status:** Pending Review · Structured per `.claude/skills/automation-agent/SKILL.md` §5.

## Consolidated Decision Gate (answered explicitly this run)

- **Proceed to Stage 4:** Yes (explicit user instruction, 2026-07-21).
- **Automation Target:** Export, Reference-Project-compatible — `E:\Automation2\NDC-Uplift-Automation` stays read-only; nothing written there directly.
- **Framework:** SHAFT Engine (Java 17 / Maven / TestNG / Allure).
- **Automation Strategy:** Continue the existing `tests_SHAFT` package (`platform_core_data/runs/RUN-20260712-001/automation/tests_SHAFT/`).

## Target Framework

SHAFT Engine 7.4.20231015 (matches the existing `tests_SHAFT` package's own `pom.xml`) — per explicit user answer, not independently selected by this agent.

## Target Language

Java 17 / Maven / TestNG, matching the existing package exactly (no new build tool introduced).

## Project Architecture

Page Object Model with a shared `DriverFactory`-based session layer (`Drive_Factory.CommonMethod`), unchanged from the existing package. This run adds one new Page Object (`Role_Page.java`) and one new TestNG test class (`Role_TC.java`), both under the package path `AdminPages.Admin.Company.Role` — deliberately matching the Reference Automation Project's own package structure for this screen (`E:\Automation2\NDC-Uplift-Automation\src\main\java\AdminPages\Admin\Company\Role\`), so the two remain easy to reconcile later.

## Design Pattern

Page Object Model, extending `AdminTestBase` (shared per-method login + Admin-tab-open setup/teardown, already established by the Branch/Agency/Staff suites) — no new pattern introduced.

## Existing Framework Analysis (Existing Assets)

Inspected before generating anything new, per §9/§11:

**Inside this platform's own package (`tests_SHAFT`):**
- `AdminMenu.java` — reused and **extended** (not overwritten): added `openCompany()`/`openRole()` alongside the existing `openSubAdmin()`/`openBranch()`/`openStaff()`/`openAgency()`, none of which were touched.
- `AdminTestBase.java` — reused verbatim (per-method login + Admin-tab-open convention already fits this scope exactly).
- `Branch_Page.java`'s `Txt_ValidationSummary` pattern (`contains(@class,'p-error') or contains(@class,'invalid-feedback')`) — reused verbatim as `Role_Page.Txt_ValidationMessages`.
- `Branch_Page.java`'s `Btn_CancelApprove` text-based pattern (`//button[normalize-space()="Cancel"]`) — reused verbatim as `Role_Page.Btn_Cancel`.

**In the registered Reference Automation Project (`E:\Automation2\NDC-Uplift-Automation`, read-only):**
- `AdminPages/Admin/Company/Role/Role_Page.java` and `SearchRolePage.java` **already exist** — inspected in full before writing anything (per §9/§11/§32.5, never skip this). Reused verbatim: `txt_RoleName` (`//input[@placeholder='Role Name']`) and the permission checkboxes' real Angular `formcontrolname` attributes (`isView`/`isEdit`/`isApprove`) — both independently confirmed by this run's own Discovery too, not just carried over on trust.
- `AdminMenu.java`'s own `Company()`/`Role()` pair — the underlying idea (sidebar text-match locators) reused; the *specific* `Btn_Role` locator was **not** reused verbatim (see Assets To Generate below).

## Assets To Generate (and why nothing existing covers it)

- **`Role_Page.java`** (new) — no existing Page Object in this platform's own package covers the Add Role screen. The Reference Project's own `Role_Page.java` exists but its module/sub-module tab locators are positional (`p-tabpanel-{N}-label`, tied to render order) and its permission-checkbox scoping uses mutable instance-field indices (`i`/`j`/`k`) walked across a hardcoded 1..61 loop with hardcoded tab-switch breakpoints — both patterns are exactly the class of fragility this project's own precedent already repairs elsewhere (`AdminMenu`'s `Btn_Branch`/`Btn_Staff`, RUN-20260712-002), and directly risky here since **FINDING-004** (this run's own Discovery) confirms the segment list is Admin-tier-dependent. Generated instead: `openModuleSegment(label)`/`openSubModuleTab(label)` (parametrized by visible text) and row-label-scoped checkbox locators.
- **`Role_TC.java`** (new) — no existing test class covers any of the 22 approved `TC-ROLE-*` cases. The Reference Project's own `Role_TC.java` exists but automates a materially different, broader scope (full create-role-then-create-staff-then-login-as-that-staff-and-verify-permissions flows that actually persist data) — not reusable as-is under this run's read-only environment constraint, and not what Test Design's 22 cases specify.
- **`AdminMenu.openCompany()`/`openRole()`** (extension) — no existing method in this platform's own `AdminMenu.java` reaches Company/Role at all.
- **`roleTestData.json`** (new) — no existing test-data file covers Role Name values.

## Assets To Reuse

- `AdminTestBase.java` (unchanged) — every `Role_TC` test method inherits its per-method login + Admin-tab-open setup.
- `Branch_Page.java`'s validation-message and Cancel-button locator *patterns* (not the file itself) — same PrimeNG conventions apply to the Add Role screen.
- Reference Project's `txt_RoleName` and `formcontrolname` locators (see Existing Framework Analysis).

## Estimated Automation Coverage

13/22 (59%) Generate New Automation, 1/22 (4.5%) Partially Automatable, 8/22 (36.4%) Manual Only (6 assumption-based cases Test Design left for future execution + 2 Exploratory charters) — see `AutomationCoverageReport_SHAFT.md` for the confirmed figures.

## Known Manual Tests

TC-ROLE-005, 006, 007, 008, 017, 018 (assumption-based, Test Design's own disposition) and TC-ROLE-021, 022 (Exploratory charters, Finding disposition) — known before generation began, per the Coverage Report this agent read as input.

## Blocked Tests

None. Every one of the 22 approved test cases received a decision this run (13 Generate, 1 Partially Automatable, 8 Manual Only) — no test case was blocked on a missing prerequisite.

## Risks

- **Row-scoped checkbox locator not independently confirmed live through SHAFT's own Selenium binding this run** — this platform's own Discovery for this scope used a raw Playwright mouse-event workaround (browser_driver), not SHAFT/Selenium; Stage 5 is this locator's first live test. Flagged in `Role_Page.java`'s own class-level comment and in Known Limitations below.
- **Mutation not authorized this run** — every generated test is designed to never complete a real save (see Automation Decision Report). If a future run authorizes mutation and asks for a true end-to-end positive test, `Role_Page.java`'s existing methods are sufficient — no new Page Object work needed, only a new test method.
- **Shared staging environment** — the same standing risk as every other suite in this package (other testers/teams may have live data on it); this run's tests only ever read/observe or trigger validation failures, never persist anything.

## Assumptions

- Assumes the existing `tests_SHAFT` package's `AdminTestBase`/`CommonMethod`/`CredentialsLoader` infrastructure remains stable for the duration of this run's generation (unchanged from prior runs' own assumption).
- Assumes the Reference Project's `formcontrolname="isView"/"isEdit"/"isApprove"` attributes are still current (last confirmed by the Reference Project's own codebase, cross-checked against this run's own Discovery screenshots — consistent).
