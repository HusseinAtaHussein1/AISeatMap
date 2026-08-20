# Automation Package Registry

| Field | Value |
|---|---|
| Baseline root | `platform_core_data/automation_baseline/` |
| Packages registered | 1 promoted · **1 Draft** (`agency`, awaiting the Stage 4A gate) |
| Last updated | 2026-08-18 |
| Last updated by run | `run-004__2026-08-17_14-35-25__UserStory__US-4222-UpdateAgency` |
| Ownership manifest | `shaft/tests_SHAFT/.baseline_ownership.json` — which module owns which paths (`pipeline.md` §12.9) |

## 1. Packages

| Framework | Location | Language | Suites | Test Cases | Module | State | Baseline Ref | Last Assembled | Last Merged Run |
|---|---|---|---|---|---|---|---|---|---|
| SHAFT Engine | `automation_baseline/shaft/tests_SHAFT/` | Java 17 | 4 | 31 | `branch` | **Promoted** — this is the module's single source of truth | `09bafbd` | 2026-08-17 | `run-003__2026-08-04_11-24-38__UserStory__US-8599-SearchActions_US-8606-UpdateBranch` |
| SHAFT Engine | `modules/agency/automation/tests_SHAFT/` | Java 17 | 1 | 18 | `agency` | **Generated** — Draft; module workspace is the source of truth | seeded from `c072129` | *not assembled* | *not merged* |

**`agency` is a Draft module (2026-08-18), deliberately not assembled.** Its project lives in the module
workspace and was seeded from this baseline via `copy-in` at `c072129a3ac2efc0a2da488d325e46d9034a60a3`, so
it reuses `TestBase`, `LogIn_Page`, `BrowserSession`, `EnvironmentConfig`, `Branch_Common`, `AddBranch_Page`,
`SearchBranch_Page`, `BranchDataFactory` and `BranchTestData` **unchanged** rather than duplicating them.

**Nothing was written into this baseline.** `check-ownership --module agency` returns `allowed: true` with
every list empty — verified by tool, not asserted. The baseline remains exactly as `branch` promoted it.
Assembly happens only after the Stage 4A approval gate and a passing module-scoped run (`pipeline.md` §5.2).

Resolve its root with `automation_lifecycle/cli.js resolve-root --module agency`; never hardcode it.

**`branch` is Promoted (2026-08-17).** Its module working copy at
`modules/branch/automation/tests_SHAFT/` was verified byte-identical here, proven by a 31/31 Headed
run from this baseline, and then **permanently deleted**. Generation, execution, repair and
self-healing for `branch` now happen in this baseline, scoped by `.baseline_ownership.json` and run
with `testng-branch.xml`. Resolve the path with
`automation_lifecycle/cli.js resolve-root --module branch`; never hardcode either location.

## 2. Package Detail

### SHAFT Engine

| Field | Value |
|---|---|
| Location | `platform_core_data/automation_baseline/shaft/tests_SHAFT/` (Workspace Automation Baseline — **and `branch`'s single source of truth**) |
| Source module project | **Retired 2026-08-17.** Was `platform_core_data/modules/branch/automation/tests_SHAFT/`; permanently deleted after verification and a passing live run. Must never be recreated (`pipeline.md` §12.10 rule 3) |
| Module-scoped suite | `testng-branch.xml` — `mvn test -DsuiteXmlFile=testng-branch.xml` |
| Whole-project regression | `testng.xml` — `mvn test` |
| Summary artifact | `modules/branch/automation/AutomationSummary_SHAFT.md` |
| Promotion record | `modules/branch/automation/automation_promotion.md` |
| Created by run | `run-002__2026-08-03_10-26-17__UserStory__US-8605CreateBranch` |
| Baseline Ref | `33a6ff1` (assembly commit, 2026-08-17) |
| Last Assembled | 2026-08-17 — module `branch`, second assembly |
| Status | Approved and assembled (`.module_automation_state.json`: `state: Approved`, `assembledAt: 2026-08-17`) |

**Suites:**

| Suite | Business Workflow | Test Cases |
|---|---|---|
| CreateBranchSuite (`CreateBranch_Admin_TC`) | Create Branch (Admin → Branch → Add branch) | 13 |
| SearchBranchSuite (`SearchBranch_TC`) | Search and filter Branch (US-8599) | 10 |
| UpdateBranchSuite (`UpdateBranch_TC`) | Update Branch (US-8606) | 5 |
| BranchActionsSuite (`BranchActions_TC`) | Grid row actions on Branch | 3 |

### SHAFT Engine — `agency` module project (Draft)

| Field | Value |
|---|---|
| Location | `platform_core_data/modules/agency/automation/tests_SHAFT/` (module workspace — **the source of truth while Draft**) |
| Seeded from | `automation_baseline/shaft/tests_SHAFT` @ `c072129a3ac2efc0a2da488d325e46d9034a60a3`, via `copy-in` |
| Module-scoped suite | `testng-agency.xml` — `mvn test -DsuiteXmlFile=testng-agency.xml` |
| Summary artifact | `modules/agency/automation/AutomationSummary_SHAFT.md` |
| Created by run | `run-004__2026-08-17_14-35-25__UserStory__US-4222-UpdateAgency` |
| State | **`Generated`** — awaiting the Stage 4A approval gate. Not executed, not assembled |
| Build | `mvn -o test-compile` clean |

**Suites:**

| Suite | Business Workflow | Test Cases |
|---|---|---|
| AgencyModuleSuite — Inheritance & Read-only | Values inherited from Branch/Supplier; controls that must not be editable | 2 |
| AgencyModuleSuite — Field Persistence | Edit a run-owned Agency's sections and confirm the values persist | 5 |
| AgencyModuleSuite — Validation | Mandatory-field and format behaviour on the Update form | 3 |
| AgencyModuleSuite — Documents & Logo | Upload, contract dates, file-type and file-size behaviour | 4 |
| AgencyModuleSuite — Maker–Checker | The full approval workflow on a run-created record | 4 |

All five are **one TestNG `<test>` block**, not five. TestNG scopes `@Test(priority)` to the `<test>` tag, and
the suite shares a single Agency fixture whose state the maker–checker cases transition one way — so
splitting the block would silently discard the required ordering.

## 3. Merge History

| Date | Assembly Commit | Source Module | Approved In Run | Added | Modified | Deleted | Renamed | Conflicts |
|---|---|---|---|---|---|---|---|---|
| 2026-08-05 | `eedfaa2` | `branch` | `run-003` | 46 | 0 | 0 | 0 | 0 |
| 2026-08-17 | `33a6ff1` | `branch` | `run-003__2026-08-04_11-24-38__UserStory__US-8599-SearchActions_US-8606-UpdateBranch` | 7 | 21 | 16 | 0 | 0 |

**No further merges will happen for `branch`.** It was promoted the same day, so its future changes are
**in-place baseline updates** recorded by `recordBaselineUpdate()` rather than merges — there is no
second copy to merge from. Merge History stays as the record of how the code got here.

## 3.1 Promotion (2026-08-17)

| Field | Value |
|---|---|
| Module | `branch` |
| Verification | **PASSED** — 38 files byte-identical, 0 missing, 0 differing |
| Standalone compile | **PASSED** — `mvn test-compile`, 0 errors |
| Acceptance run | **31/31 passed**, Headed, from this baseline, 2026-08-17 11:36, 984.6 s, BUILD SUCCESS |
| Accepted exceptions | **None** |
| Retired path | `modules/branch/automation/tests_SHAFT/` — permanently deleted |
| Approved by | ahmed.ayman@tildetech.ae |
| Full record | `modules/branch/automation/automation_promotion.md` |

The 2026-08-17 assembly carried the delta produced since the first one by `81cff38` (Search/Actions
and Update Branch self-healing) and `01c7edf` (`BranchActions_TC` recovery and full-suite run). It
required a **fresh** Automation Approval: pipeline.md §5.2 states a Stage `5H` repair does not
inherit Stage `4A`'s approval, and the 2026-08-14 approval was superseded by code changes on
2026-08-15. Full detail in the module's `automation_promotion.md`.

## 4. Human Decisions On Repository Structure

| Date | Decision | Framework | Rationale | Approved By |
|---|---|---|---|---|
| 2026-08-03 | Start a project for a framework with none yet (no "extend" option existed — the registry was empty) | SHAFT Engine | User's explicit choice among Playwright / SHAFT Engine (Java) / Selenium (Java), presented because no automation project existed for this platform in any framework | Module owner (user, this session) |
| 2026-08-17 | Comment out the `platform_core_data/` rule in `.git/info/exclude` before assembling | SHAFT Engine | The rule made `discoverRepo()` treat the data root as gitignored, so §12.4's dirty pre-check, three-way conflict check and ignored-file classification were all silently inert. Local and per-clone, so reversible; restore it when working on `tool-development` | Module owner (user, this session) |
| 2026-08-18 | Generate into the **module working copy first**, not the shared baseline | SHAFT Engine | Keeps `branch`'s promoted baseline untouched while `agency` is still Draft. Verified by `check-ownership` returning every list empty | Module owner (user, this session) |
| 2026-08-18 | Seed the module project from the baseline via `copy-in` rather than duplicating shared assets | SHAFT Engine | `automation_baseline/shaft/shared/` does not exist, so honouring "module working copy, don't touch the baseline" literally would have meant hand-copying ~8 shared files plus the Branch factory — five copies of an auth fixture guarantee five drifts (§11D.2) | Module owner (user, this session) |
| 2026-08-18 | **One Agency fixture for the entire execution**, not one per test case | SHAFT Engine | STG has no DELETE (`PO-3`): per-test provisioning would leave 34 permanent records per run instead of 2. Accepted cost: the tests are no longer mutually independent, so ordering is explicit and the maker-checker cases chain. Recorded as Automation Plan §5.1 | Module owner (user, this session) |
