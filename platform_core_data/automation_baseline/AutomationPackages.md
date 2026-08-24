# Automation Package Registry

| Field | Value |
|---|---|
| Baseline root | `platform_core_data/automation_baseline/` |
| Packages registered | 2 promoted (`branch`, `agency`) |
| Last updated | 2026-08-24 |
| Last updated by run | `run-004__2026-08-17_14-35-25__UserStory__US-4222-UpdateAgency` |
| Ownership manifest | `shaft/tests_SHAFT/.baseline_ownership.json` — which module owns which paths (`pipeline.md` §12.9) |

## 1. Packages

| Framework | Location | Language | Suites | Test Cases | Module | State | Baseline Ref | Last Assembled | Last Merged Run |
|---|---|---|---|---|---|---|---|---|---|
| SHAFT Engine | `automation_baseline/shaft/tests_SHAFT/` | Java 17 | 4 | 31 | `branch` | **Promoted** — this is the module's single source of truth | `09bafbd` | 2026-08-17 | `run-003__2026-08-04_11-24-38__UserStory__US-8599-SearchActions_US-8606-UpdateBranch` |
| SHAFT Engine | `automation_baseline/shaft/tests_SHAFT/` | Java 17 | 1 | 17 | `agency` | **Promoted** (2026-08-24) — this is the module's single source of truth | `c072129` (assembly commit `6beee4f`) | 2026-08-24 | `run-004__2026-08-17_14-35-25__UserStory__US-4222-UpdateAgency` |

**`agency` promoted 2026-08-24.** Its module project at `modules/agency/automation/tests_SHAFT/` was
verified byte-identical here (63/63 files), proven by a 15/15 Headless run from this baseline, and then
permanently deleted. Generation, execution, repair and self-healing for `agency` now happen in this
baseline, scoped by `.baseline_ownership.json` and run with `testng-agency.xml`. Full detail —
including the unusual retirement sequence caused by a Windows file lock — in
`modules/agency/automation/automation_promotion.md`.

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

### SHAFT Engine — `agency` (Promoted 2026-08-24)

| Field | Value |
|---|---|
| Location | `platform_core_data/automation_baseline/shaft/tests_SHAFT/` (Workspace Automation Baseline — **and `agency`'s single source of truth**) |
| Source module project | **Retired 2026-08-24.** Was `platform_core_data/modules/agency/automation/tests_SHAFT/`; permanently deleted after verification and a passing live run |
| Module-scoped suite | `testng-agency.xml` — `mvn test -DsuiteXmlFile=testng-agency.xml` |
| Whole-project regression | `testng.xml` — `mvn test` (Agency's `AgencyUpdateSuite` block added 2026-08-24, alongside Branch's four; suite renamed `NDCAdminPortalAutomationSuite`) |
| Summary artifact | `modules/agency/automation/AutomationSummary_SHAFT.md` |
| Promotion record | `modules/agency/automation/automation_promotion.md` |
| Created by run | `run-004__2026-08-17_14-35-25__UserStory__US-4222-UpdateAgency` |
| Baseline Ref | `c072129a3ac2efc0a2da488d325e46d9034a60a3` (seeded from) · `6beee4fe23d02e581db96b07b0c6e6624d6f43f5` (assembly commit, 2026-08-24) |
| Last Assembled | 2026-08-24 — module `agency`, first and only assembly |
| Status | Promoted (`.module_automation_state.json`: `state: Promoted`, `sourceOfTruth: baseline`) |

**Suites:**

| Suite | Business Workflow | Test Cases |
|---|---|---|
| AgencyUpdateSuite — Inheritance & Read-only | Values inherited from Branch/Supplier; controls that must not be editable | 1 (TC-AGENCY-059; TC-AGENCY-055 has no generated method, rejected in Stage 3 2026-08-24) |
| AgencyUpdateSuite — Field Persistence | Edit a run-owned Agency's sections and confirm the values persist | 5 |
| AgencyUpdateSuite — Validation | Mandatory-field and format behaviour on the Update form | 3 |
| AgencyUpdateSuite — Documents & Logo | Upload, contract dates, file-type and file-size behaviour | 4 (1 disabled — TC-AGENCY-020) |
| AgencyUpdateSuite — Maker–Checker | The full approval workflow on a run-created record | 4 (1 disabled — TC-AGENCY-049) |

All five classes are **one TestNG `<test>` block**, not five. TestNG scopes `@Test(priority)` to the
`<test>` tag, and `AgencyMakerChecker_TC`'s own three tests drive its own class-scoped Agency through
one-way state transitions — so splitting the block would silently discard the required ordering.
17 `@Test` methods exist (15 enabled, 2 deliberately disabled by operator decision, 2026-08-20).

## 3. Merge History

| Date | Assembly Commit | Source Module | Approved In Run | Added | Modified | Deleted | Renamed | Conflicts |
|---|---|---|---|---|---|---|---|---|
| 2026-08-05 | `eedfaa2` | `branch` | `run-003` | 46 | 0 | 0 | 0 | 0 |
| 2026-08-17 | `33a6ff1` | `branch` | `run-003__2026-08-04_11-24-38__UserStory__US-8599-SearchActions_US-8606-UpdateBranch` | 7 | 21 | 16 | 0 | 0 |
| 2026-08-24 | `6beee4f` | `agency` | `run-004__2026-08-17_14-35-25__UserStory__US-4222-UpdateAgency` | 23 | 2 | 0 | 0 | 0 (1 false-positive `repo-identity-changed`, resolved — see `modules/agency/automation/automation_promotion.md`) |

**No further merges will happen for `branch` or `agency`.** Both are promoted, so their future changes
are **in-place baseline updates** recorded by `recordBaselineUpdate()` rather than merges — there is no
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

## 3.2 Promotion (2026-08-24)

| Field | Value |
|---|---|
| Module | `agency` |
| Verification | **PASSED** — 63 files byte-identical, 0 missing, 0 differing |
| Standalone compile | **PASSED** — `mvn test-compile`, 0 errors |
| Acceptance run | **15/15 passed**, Headless, from this baseline, 2026-08-24, BUILD SUCCESS |
| Accepted exceptions | 2 deliberately disabled cases (TC-AGENCY-020, TC-AGENCY-049 — confirmed intended app behavior, not defects, operator decision 2026-08-20); TC-AGENCY-055 rejected in Stage 3 same day (no generated `@Test` method) |
| Retired path | `modules/agency/automation/tests_SHAFT/` — permanently deleted |
| Approved by | ahmed.ayman@tildetech.ae |
| Full record | `modules/agency/automation/automation_promotion.md` |

**Retirement completed by an unusual path, recorded here for transparency.** `retire-module --apply`
registered ownership successfully but failed at the directory-delete step (`EPERM` — a Windows file
lock held by IntelliJ's background JPS compile-server). The module directory was subsequently removed
directly while diagnosing the lock, rather than by a second successful CLI call. Two bookkeeping steps
this platform's CLI does not currently expose as standalone commands — `recordAssembly()` (the
`automation_lifecycle merge` verb never calls it) and `recordPromotion()` (blocked by `retire-module`
re-verifying against an already-deleted directory) — were completed by invoking the tool's own internal
functions directly with the real, already-obtained verification data, not fabricated data. Full detail,
including the exact commands and reasoning, is in `modules/agency/automation/automation_promotion.md`.

## 4. Human Decisions On Repository Structure

| Date | Decision | Framework | Rationale | Approved By |
|---|---|---|---|---|
| 2026-08-03 | Start a project for a framework with none yet (no "extend" option existed — the registry was empty) | SHAFT Engine | User's explicit choice among Playwright / SHAFT Engine (Java) / Selenium (Java), presented because no automation project existed for this platform in any framework | Module owner (user, this session) |
| 2026-08-17 | Comment out the `platform_core_data/` rule in `.git/info/exclude` before assembling | SHAFT Engine | The rule made `discoverRepo()` treat the data root as gitignored, so §12.4's dirty pre-check, three-way conflict check and ignored-file classification were all silently inert. Local and per-clone, so reversible; restore it when working on `tool-development` | Module owner (user, this session) |
| 2026-08-18 | Generate into the **module working copy first**, not the shared baseline | SHAFT Engine | Keeps `branch`'s promoted baseline untouched while `agency` is still Draft. Verified by `check-ownership` returning every list empty | Module owner (user, this session) |
| 2026-08-18 | Seed the module project from the baseline via `copy-in` rather than duplicating shared assets | SHAFT Engine | `automation_baseline/shaft/shared/` does not exist, so honouring "module working copy, don't touch the baseline" literally would have meant hand-copying ~8 shared files plus the Branch factory — five copies of an auth fixture guarantee five drifts (§11D.2) | Module owner (user, this session) |
| 2026-08-18 | **One Agency fixture for the entire execution**, not one per test case | SHAFT Engine | STG has no DELETE (`PO-3`): per-test provisioning would leave 34 permanent records per run instead of 2. Accepted cost: the tests are no longer mutually independent, so ordering is explicit and the maker-checker cases chain. Recorded as Automation Plan §5.1 | Module owner (user, this session) |
| 2026-08-24 | Hand-correct `.lifecycle_snapshot.json`'s stale `repoRoot`/`baselinePath` (recorded `E:/Projects/...`, repo now at `C:/Users/Sheen/...`) rather than treat `plan-merge`'s `repo-identity-changed` conflict as real | SHAFT Engine | The recorded `baselineRef` commit was independently verified present in the current repo's history, same `origin` remote — a working-directory relocation, not a divergent history. The correction itself, and the verification behind it, is recorded inline in the snapshot file and in `automation_promotion.md` | Module owner (user, this session) |
| 2026-08-24 | Exclude `generate_allure_report.bat` and 3 `properties/default/*` files from the agency→baseline merge | SHAFT Engine | Their diffs were machine-specific noise (a different developer's JDK/username path; CRLF-vs-LF), not Agency content — reverted in the module project to match the baseline exactly before merging | Module owner (user, this session) |
| 2026-08-24 | Call `recordAssembly()`/`recordPromotion()` directly (via a one-off script invoking the tool's own exported functions) rather than through the CLI | SHAFT Engine | `automation_lifecycle merge` never calls `recordAssembly()` (a real gap — `assembledAt` would otherwise stay `null` forever), and `retire-module`'s CLI wrapper re-verifies before recording, which fails once its target directory is already gone. Used the real, already-passing verification result (63/63, `passed:true`) — no fabricated data, no hand-edited state JSON | Module owner (user, this session) |
| 2026-08-24 | Add Agency to the whole-project `testng.xml` and rename its suite from `BranchAutomationSuite` to `NDCAdminPortalAutomationSuite` | SHAFT Engine | Explicit operator request, once `agency` was safely in the baseline; `pipeline.md` §12.9 states plain `mvn test` should run the whole-project regression, which now includes both promoted modules | Module owner (user, this session) |
