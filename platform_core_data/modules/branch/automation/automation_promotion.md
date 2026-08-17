# Automation Promotion Record

Per workflows_and_pipelines/pipeline/pipeline.md §12 (Automation Asset Lifecycle) — this file is
permanent run history and is never deleted by Cleanup.

- **Promotion Status:** Merged
- **Merge Date:** 2026-08-17
- **Approved By:** ahmed.ayman@tildetech.ae — Automation Approval (pipeline.md §5.2), re-granted 2026-08-17 for the post-healing code
- **Source Run:** run-003__2026-08-04_11-24-38__UserStory__US-8599-SearchActions_US-8606-UpdateBranch (source module: branch)
- **Workspace Destination:** platform_core_data/automation_baseline/shaft/tests_SHAFT/
- **Merge Result:** Merged cleanly — +7 / ~21 / -16 / →0, zero conflicts. Assembly commit 33a6ff1.

## Files Added
- run-tests.bat
- src/main/java/AdminPages/Admin/Branch/ApprovalStatus.java
- src/main/resources/properties/TestNG.properties
- src/main/resources/properties/cucumber.properties
- src/main/resources/properties/customWebdriverCapabilities.properties
- src/main/resources/properties/log4j2.properties
- src/test/java/AdminPages/Admin/Branch/BranchActions_TC.java

## Files Modified
- README.md
- generate_allure_report.bat
- pom.xml
- src/main/java/AdminPages/Admin/Branch/AddBranch_Page.java
- src/main/java/AdminPages/Admin/Branch/BranchTestData.java
- src/main/java/AdminPages/Admin/Branch/Branch_Common.java
- src/main/java/AdminPages/Admin/Branch/SearchBranch_Page.java
- src/main/java/AdminPages/Admin/Branch/UpdateBranch_Page.java
- src/main/java/AdminPages/Login/LogIn_Page.java
- src/main/java/utilities/EnvironmentConfig.java
- src/main/resources/properties/default/TestNG.properties
- src/main/resources/properties/default/cucumber.properties
- src/main/resources/properties/default/log4j2.properties
- src/main/resources/properties/execution.properties
- src/test/java/AdminPages/Admin/Branch/BranchProvisioner.java
- src/test/java/AdminPages/Admin/Branch/CreateBranch_Admin_TC.java
- src/test/java/AdminPages/Admin/Branch/SearchBranch_TC.java
- src/test/java/AdminPages/Admin/Branch/UpdateBranch_TC.java
- src/test/java/AdminPages/Login/TestBase.java
- src/test/resources/branch_baseline.properties
- testng.xml

## Files Deleted
- allure-report/2026-08-05_12-56-34-163_AllureReport.html
- allure-report/2026-08-05_12-58-42-061_AllureReport.html
- allure-report/2026-08-05_13-00-40-646_AllureReport.html
- allure-report/2026-08-05_13-04-54-283_AllureReport.html
- allure-report/2026-08-05_13-08-20-840_AllureReport.html
- execution-summary/ExecutionSummaryReport_05-08-2026_13-08-04-0088-PM.html
- performanceReport/PerformanceReport_05-08-2026_12-56-26-0509-PM.html
- performanceReport/PerformanceReport_05-08-2026_12-58-32-0891-PM.html
- performanceReport/PerformanceReport_05-08-2026_13-00-31-0065-PM.html
- performanceReport/PerformanceReport_05-08-2026_13-04-43-0099-PM.html
- performanceReport/PerformanceReport_05-08-2026_13-08-04-0096-PM.html
- src/test/resources/META-INF/services/io.qameta.allure.listener.ContainerLifecycleListener
- src/test/resources/META-INF/services/io.qameta.allure.listener.FixtureLifecycleListener
- src/test/resources/META-INF/services/io.qameta.allure.listener.StepLifecycleListener
- src/test/resources/META-INF/services/io.qameta.allure.listener.TestLifecycleListener
- src/test/resources/META-INF/services/uuid

## Files Renamed
- (none)

## Discarded Untracked Files
- .idea/ — 9 file(s), build/IDE/report output ignored by the repository .gitignore
- allure-results/ — 31 file(s), build/IDE/report output ignored by the repository .gitignore
- execution-summary/ — 1 file(s), build/IDE/report output ignored by the repository .gitignore
- extent-reports/ — 1 file(s), build/IDE/report output ignored by the repository .gitignore
- target/ — 46 file(s), build/IDE/report output ignored by the repository .gitignore

## Conflicts Detected
- (none)

## Conflicts Resolved
- (none)

## Notes

**Second assembly of this module.** The first was `eedfaa2` (2026-08-05, approved in run-003). Everything here is the delta produced since then by
`81cff38` (Search/Actions and Update Branch self-healing) and `01c7edf` (BranchActions_TC recovery and full-suite run).

**Fresh approval, not an inherited one.** pipeline.md §5.2 states a Stage 5H repair does not inherit Stage 4A's approval. The 2026-08-14 approval
was superseded by code changes on 2026-08-15, so this assembly waited on a new Automation Approval rather than reusing the old record.

**Baseline protection had been inert and was restored first.** `.git/info/exclude` carried a `platform_core_data/` rule, so `discoverRepo()` saw the
data root as gitignored and returned `available: false` — which silently disabled the §12.4 step 1 dirty pre-check, the three-way conflict check, and
the step 5 ignored-file classification. Before this merge the plan therefore listed 0 discarded files and proposed copying 88 `target/`, `.idea/`,
`allure-results/` and `extent-reports/` files into the baseline. The rule was commented out (local, per-clone, reversible), after which the plan
classified all 88 correctly and the pre-check ran for real.

**One pre-existing dirty file was cleared honestly.** `src/main/java/utilities/BrowserSession.java` sat untracked in the baseline: the 2026-08-05
assembly copied it in, but its `git add` was a no-op under the same exclude rule. Content was byte-identical to the approved module copy, so it was
committed as `ccee095` to satisfy the hard pre-check rather than merging over a dirty baseline.

**Deletions are intentional.** The 11 `allure-report/`, `execution-summary/` and `performanceReport/` files were stale 2026-08-05 run output that the
baseline's own nested `.gitignore` never covered; the 5 `META-INF/services/` entries were removed from the module during the framework realignment to
the NDC-Automation reference project.

**Plan said 22 modified, git recorded 21.** `src/main/resources/properties/default/customWebdriverCapabilities.properties` differed only in
line endings, so the copy landed but produced no committed change. Baseline and module copies are byte-identical after the merge.

---

# Retirement — the module working copy is gone, the baseline is the source of truth

**Recorded 2026-08-17.** `pipeline.md` §12.5.1 (Verification and Retirement), §12.9, §12.10.

| Field | Value |
|---|---|
| Promotion Status | **Promoted — terminal** |
| Source of truth | `platform_core_data/automation_baseline/shaft/tests_SHAFT/` |
| Retired path | `platform_core_data/modules/branch/automation/tests_SHAFT/` — **permanently deleted** |
| Retired at | 2026-08-17T08:49:32Z |
| Promoted by | ahmed.ayman@tildetech.ae |
| Baseline commit at retirement | `09bafbd` |
| Accepted failures / exceptions | **None.** The acceptance run was clean |

## Why this module may no longer be edited under `modules/`

The Workspace Automation Baseline is now the only copy of this module's automation that exists. Every
later change — generation, execution, repair, self-healing — happens there, scoped by
`.baseline_ownership.json`. `modules/branch/automation/tests_SHAFT/` must never be recreated; if it
reappears, `resolveAutomationRoot()` throws `MODULE_DIR_RESURRECTED` and work stops rather than
continuing in a directory nothing executes from (§12.10 rule 3).

Everything else in this module folder is **permanent history and stays**: this record, the Automation
Plan / Manifest / Decision Report / Coverage Report / Suite Manifest / Summary / Selector Verification
/ Self Review / Target Write Plan / Stack Documentation Context, `.module_automation_state.json`,
`healing/`, `discovery/`, `test_design/`, and `README.md`.

## Ownership inside the shared baseline

| Classification | Paths |
|---|---|
| **Owned by `branch`** | `src/main/java/AdminPages/Admin/Branch/**`, `src/test/java/AdminPages/Admin/Branch/**`, `src/test/resources/branch_baseline.properties`, `testng-branch.xml` |
| **Shared** (whole-project gate, declared in the Decision Report) | `pom.xml`, `testng.xml`, `src/main/java/AdminPages/Login/**`, `src/test/java/AdminPages/Login/**`, `src/main/java/utilities/**`, `src/main/resources/properties/**`, `src/test/resources/environment.properties`, `src/test/resources/META-INF/**`, `README.md`, `run-tests.bat`, `generate_allure_report.bat`, `.gitignore` |
| **Module-scoped suite** | `testng-branch.xml` — `mvn test -DsuiteXmlFile=testng-branch.xml` |

## Verification evidence

**Byte-identity — PASSED.** 38 files present in the baseline with identical SHA-256; 0 missing, 0
differing. 86 build/IDE files correctly excluded from comparison. Re-run immediately before deletion,
not carried over from an earlier check.

**Standalone compile — PASSED.** `mvn test-compile` in the baseline, 0 errors; all 4 test classes and
8 page objects produced.

**Live proof — three runs, and the disagreement between them is the point.**

| # | Location | Mode | Scope | Result |
|---|---|---|---|---|
| 1 | Baseline | Headless | 31 cases | **29 passed, 2 failed** — TC-BR-045 (`Both (534) != Active+Inactive (755)`), TC-BR-055 (`City = "loading..."`) |
| 2a | **Module copy** | Headed | TC-BR-045, TC-BR-055 | **both FAILED** — action-delivery signatures, 368 s |
| 2b | Baseline | Headed | TC-BR-045, TC-BR-055 | **both PASSED**, 73 s |
| 3 | Baseline | Headed | 31 cases | **31 PASSED — BUILD SUCCESS**, 984.6 s, 2026-08-17 11:36 |

Run 1's two failures reproduced signatures documented in `healing/BranchFailureAnalysis_2026-08-14.md`
— TC-BR-045's "Both equals Active alone" relationship (reproduced across `rerun-15`, `rerun-16`,
`rerun-19`, root cause never established, repair direction stopped by human decision on 2026-08-14)
and TC-BR-055's pre-REPAIR-BR-012 dependent-dropdown race.

Run 2 was the A/B that settled whether the promotion caused them. With the trees byte-identical and
the mode held constant, **the module copy failed and the baseline passed**. The promotion is therefore
not the cause of anything — the new location outperformed the old one on the same code.

**What is deliberately not claimed:** why identical bytes behaved differently. The module copy's
`target/` dated from 2026-08-15 while the baseline's was rebuilt that morning, the runs were
sequential rather than simultaneous, and the underlying Search action-delivery defect has been
intermittent since 2026-08-14. Those three cannot be separated from this evidence, and no single cause
is asserted. What run 3 establishes is narrower and sufficient: the full suite passes 31/31 from the
baseline in Headed mode.

## Two shared-asset changes, declared per §12.1

1. **`pom.xml` — `<suiteXmlFiles>` parameterized** to `${suiteXmlFile}` with `testng.xml` as the
   default. Plain `mvn test` is unchanged; `-DsuiteXmlFile=testng-branch.xml` now scopes a run to one
   module. Required because promoted modules share one project, so "run just this module" has to be a
   suite file rather than a separate directory. Surefire's own `surefire.suiteXmlFiles` user property
   cannot serve — an explicit POM value wins over it.
2. **`.gitignore` — extended** to cover `allure-report/`, `extent-reports/`, `performanceReport/`,
   `execution-summary/`, `generatedReport_*.zip` and `.idea/`, with matching rules added to the
   repository root for `automation_baseline/**`. A promoted module executes *in* the baseline, so
   Maven, Allure, Extent and the SHAFT performance hook now write there; without these rules the first
   post-promotion run commits roughly 23 MB of report output into the authoritative source tree.

Both are whole-project surface and clear the whole-project gate, not `branch`'s. `branch` is currently
the only module in this baseline, so neither has cross-module impact today.

## Operational notes worth keeping

**Deleting the directory took three attempts.** The first two failed with `EPERM`. The holders were 14
orphaned `chromedriver` processes left behind by test runs on 2026-08-07 through 2026-08-15, whose
working directory was inside the module project. IntelliJ was a red herring — it did have the project
open and did recreate `.idea/` mid-deletion, but closing it was not sufficient; killing the stale
chromedrivers was. **Kill leftover driver processes before any retirement**, and expect a stale-run
process leak to be the default cause of a locked automation directory on Windows.

**A `git checkout --` restore reintroduced a false verification failure.** Restoring the module tree
mid-retirement rewrote four `properties/default/*.properties` files with CRLF line endings, while the
baseline held LF copies written byte-for-byte by the merge. Content was identical; `verifyPromotion()`
is byte-exact by design and correctly refused. Resolved by copying the baseline's — the promoted —
versions into the module before deleting it, never by relaxing the check. If this recurs often, a
line-ending-normalizing comparison mode is worth considering; it was not added here because weakening
a guard during the operation it guards is the wrong time to do it.

**A safety archive was taken** before deletion (module tree including `.idea/`, 739 KB) and retained
for this session. Tracked files remain recoverable from git at `09bafbd`; `.idea/` never was, which is
why the archive existed.
