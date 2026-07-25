# NDC — Automation Plan — RUN-20260712-002 (Admin: Branch, Agency, Staff) — SHAFT

**Produced by:** Automation Agent, Stage 4 · **Date:** 2026-07-12 · Written in full before any code generation, per `agents/automation_agent.md` §5.

## Consolidated Decision Gate — answered once, 2026-07-12

1. **Proceed with Stage 4 now?** Yes.
2. **Automation Target** (§32.3): **Export, Reference-Project-compatible** — same choice as RUN-20260712-001's Login package. `E:\Automation2\NDC-Uplift-Automation` remains read-only; nothing in this run writes to it.
3. **Framework** (§31.2): **SHAFT** — matches the Reference Project and the existing `tests_SHAFT` package.
4. **Automation Strategy** (§33): **Continue `tests_SHAFT`** — this run extends the existing package in place (`platform_core_data/runs/RUN-20260712-001/automation/tests_SHAFT/`), adding new Branch/Agency/Staff assets alongside the existing, untouched Login assets. Nothing under `AdminPages/Login/` was modified.

## Target Framework

SHAFT Engine (Java 17 / Maven / TestNG / Allure) — per the consolidated gate above, matching the existing package and the Reference Project.

## Target Language

Java 17, matching the existing package's `pom.xml` (`<source>17</source>` / `<target>17</target>`).

## Project Architecture

Page Object Model with a shared driver/session layer (`Drive_Factory.CommonMethod`, reused unchanged from the existing package) — identical architecture to the existing Login suite, extended with a new shared `AdminTestBase` (per-method login + Admin-tab navigation) that Branch/Agency/Staff test classes extend, mirroring `AdminPages.Login.TestBase`'s own per-method setup/teardown pattern.

## Design Pattern

Page Object Model — one Page class per screen/module (`Branch_Page`, `Agency_Page`, `Staff_Page`), no locators in test classes, JSON-driven test data — per `platform_core_data/automation_framework.md`'s SHAFT package structure (Pages / Locators / Tests / Data layers).

## Planned Automation Suites

Organized by business workflow, per module (not by individual screen):
- **Branch Suite** — create, list-load verification, reject-with-remark safety control (6 automated cases)
- **Agency Suite** — create, business-type selection, Unicode input handling (4 automated cases)
- **Staff Suite** — create, uniqueness probe, default-radio confirmation (4 automated cases)

## Existing Assets (per §9 Existing Framework Analysis)

Inspected both the platform's own registry (`AutomationPackages.md`) and the registered Reference Automation Project (`E:\Automation2\NDC-Uplift-Automation`), per §31.1/§32.4:

| Asset | Source | Disposition |
|---|---|---|
| `Branch_Page.java` (Add form + List/Actions locators) | Reference Project | **Reused, trusted** — its IDs matched this run's own live Discovery exactly (`Branch_Add.md`) |
| `Staff_Page.java` (Add form, undercut radios) | Reference Project | **Reused, trusted** — same match against `Staff_Add.md` |
| `AdminMenu.java` (Admin tab navigation) | Reference Project | **Reused as-is** — including its known positional-selector brittleness (see Known Limitations) |
| `SearchAgency_Page.java` (Agency List/Search) | Reference Project | Inspected, confirmed current/reusable, **not needed this run** (TC-AGENCY-003 is a manual charter, not automated) |
| `AddAgencyCore_Page.java` (Agency Add form) | Reference Project | **NOT reused — stale.** Targets a materially different, older form (`groupId`/`agencyphone`/`orgModal.address` ids, jQuery-UI datepicker) that matches nothing this run's Discovery observed. A Reference Project staleness gap, not silently fixed in place (§32.2). |
| `AddAgency_Page.java` | Reference Project | **NOT reused — empty stub**, no locators/methods at all. |
| `Drive_Factory.CommonMethod` | This platform's own `tests_SHAFT` (RUN-20260712-001) | Reused unchanged |
| `AdminPages.Login.LogIn_Page` / `CredentialsLoader` | This platform's own `tests_SHAFT` (RUN-20260712-001) | Reused unchanged, for the shared `AdminTestBase` login step |

## Assets To Generate

- `AdminPages/Admin/Agency/Agency/Agency_Page.java` — fresh, from this run's own Discovery (`Agency_Add.md`), since the Reference Project's equivalent is stale/stub.
- `Btn_Edit`/`Icn_ThumbDown` locators added to `Branch_Page.java` — new this run, not present in the Reference Project's version (which only had `Btn_ThumbUp`), added by analogy to the Reference Project's own `Staff_Page.java` icon-class convention. Resolves FINDING-004.
- `AdminTestBase.java` — new shared base for Branch/Agency/Staff test classes (login + open Admin tab).
- `Branch_TC.java`, `Agency_TC.java`, `Staff_TC.java` — new test classes, 13 `@Test` methods total.
- `branchTestData.json`, `agencyTestData.json`, `staffTestData.json` — new JSON test data files.

## Assets To Reuse

See "Existing Assets" table above — `Branch_Page.java`'s and `Staff_Page.java`'s Add-form locators, `AdminMenu.java`, `Drive_Factory.CommonMethod`, `LogIn_Page`/`CredentialsLoader`.

## Estimated Automation Coverage

13 of 17 approved test cases (76%) received a Generate decision. 1 (TC-BRANCH-007) is a conditional Generate, pending TC-BRANCH-006's charter. 3 (TC-BRANCH-006, TC-AGENCY-003, TC-STAFF-004) are Manual Only — Exploratory-test dispositions carried directly from Test Design, never forced into a fixed-assertion script. See `AutomationDecisionReport_SHAFT.md` for the full per-case breakdown.

## Known Manual Tests

TC-BRANCH-006, TC-AGENCY-003, TC-STAFF-004 — all three are Test Design's Exploratory-test dispositions (Finding-derived, Status `Needs Human Review`); none can responsibly become a fixed pass/fail script.

## Blocked Tests

None outright blocked — TC-BRANCH-007 is generated but its real selectors (`Icn_ThumbDown`) are not yet independently confirmed live against Branch specifically; Execution (Stage 5) is its first live test, exactly as TC-BRANCH-006's charter anticipates.

## Risks

- **High** — `Icn_ThumbDown`/`Btn_Edit` reuse-by-analogy (Branch_Page.java) has not been independently confirmed against Branch's live Actions column by this platform's own Discovery. If wrong, Execution could repeat this run's Discovery near-miss (FINDING-004) on a real record instead of a `QA_SPIKE_`-created one — mitigated by `rejectRequiresNonEmptyRemark()` only targeting a `QA_SPIKE_`-created Branch (`dependsOnMethods`), never a pre-existing record.
- **Medium** — Staff dropdown option values (Department/Role/Approver List) in `staffTestData.json` are placeholders, not confirmed against live dropdown contents — flagged explicitly in that file's own `note` field.
- **Medium** — All "Partially Automatable" cases (validation-message assertions) capture observed text via `System.out.println` rather than asserting a fixed expected value, by design — a human/Execution Agent must review these outputs rather than treat a clean TestNG pass as full confirmation.
- **Low** — `AdminMenu.java`'s positional Branch/Staff-tab selectors are reused from the Reference Project unchanged, a pre-existing brittleness not introduced by this run.

## Assumptions

- Assumes `Branch_Page.java`'s and `Staff_Page.java`'s Reference-Project locators remain accurate against the live app for the duration of this suite (last independently confirmed via this run's own Discovery, 2026-07-12).
- Assumes the STG base URL question (FINDING-001) does not block this suite — `AdminTestBase` reuses the existing `LogIn_Page.navigateToLogin()`, which already resolves the correct live URL via `credentials.json`.
