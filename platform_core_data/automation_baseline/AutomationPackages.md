# Automation Package Registry

| Field | Value |
|---|---|
| Baseline root | `platform_core_data/automation_baseline/` |
| Packages registered | 1 |
| Last updated | 2026-08-03 |
| Last updated by run | `run-002__2026-08-03_10-26-17__UserStory__US-8605CreateBranch` |

## 1. Packages

| Framework | Location | Language | Suites | Test Cases | Baseline Ref | Last Merged Run | Last Touched By Run/Checkpoint |
|---|---|---|---|---|---|---|---|
| SHAFT Engine | `modules/branch/automation/tests_SHAFT/` (not yet merged to `automation_baseline/shaft/`) | Java 17 | 1 | 13 | N/A — no merge has happened yet | N/A | `run-002__2026-08-03_10-26-17__UserStory__US-8605CreateBranch` / branch/automation = Generated, Pending Review |

## 2. Package Detail

### SHAFT Engine

| Field | Value |
|---|---|
| Location | `platform_core_data/modules/branch/automation/tests_SHAFT/` (module project; the Workspace Automation Baseline copy at `automation_baseline/shaft/tests_SHAFT/` does not exist yet — no Workspace Merge has ever run for this platform, in any framework) |
| Summary artifact | `modules/branch/automation/AutomationSummary_SHAFT.md` |
| Created by run | `run-002__2026-08-03_10-26-17__UserStory__US-8605CreateBranch` |
| Baseline Ref | N/A — pre-merge |
| Last Merged Run | N/A — never merged |
| Status | Generated (per `.module_automation_state.json`'s lifecycle: Generated → Executed → Healed → Approved) |

**Suites:**

| Suite | Business Workflow | Test Cases |
|---|---|---|
| CreateBranchSuite | Create Branch (Admin → Branch → Add branch) | 13 |

## 3. Merge History

*(Empty — no Workspace Merge has run yet for this package, or for this platform in any framework.)*

## 4. Human Decisions On Repository Structure

| Date | Decision | Framework | Rationale | Approved By |
|---|---|---|---|---|
| 2026-08-03 | Start a project for a framework with none yet (no "extend" option existed — the registry was empty) | SHAFT Engine | User's explicit choice among Playwright / SHAFT Engine (Java) / Selenium (Java), presented because no automation project existed for this platform in any framework | Module owner (user, this session) |
