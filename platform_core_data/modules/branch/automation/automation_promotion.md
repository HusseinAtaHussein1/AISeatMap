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
