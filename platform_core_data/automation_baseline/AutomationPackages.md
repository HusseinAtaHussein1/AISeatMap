# Automation Package Registry

| Field | Value |
|---|---|
| Baseline root | `platform_core_data/automation_baseline/` |
| Packages registered | 1 |
| Last updated | 2026-08-17 |
| Last updated by run | `run-003__2026-08-04_11-24-38__UserStory__US-8599-SearchActions_US-8606-UpdateBranch` |

## 1. Packages

| Framework | Location | Language | Suites | Test Cases | Module | Baseline Ref | Last Assembled | Last Merged Run |
|---|---|---|---|---|---|---|---|---|
| SHAFT Engine | `automation_baseline/shaft/tests_SHAFT/` | Java 17 | 4 | 31 | `branch` | `33a6ff1` | 2026-08-17 | `run-003__2026-08-04_11-24-38__UserStory__US-8599-SearchActions_US-8606-UpdateBranch` |

## 2. Package Detail

### SHAFT Engine

| Field | Value |
|---|---|
| Location | `platform_core_data/automation_baseline/shaft/tests_SHAFT/` (Workspace Automation Baseline) |
| Source module project | `platform_core_data/modules/branch/automation/tests_SHAFT/` |
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

## 3. Merge History

| Date | Assembly Commit | Source Module | Approved In Run | Added | Modified | Deleted | Renamed | Conflicts |
|---|---|---|---|---|---|---|---|---|
| 2026-08-05 | `eedfaa2` | `branch` | `run-003` | 46 | 0 | 0 | 0 | 0 |
| 2026-08-17 | `33a6ff1` | `branch` | `run-003__2026-08-04_11-24-38__UserStory__US-8599-SearchActions_US-8606-UpdateBranch` | 7 | 21 | 16 | 0 | 0 |

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
