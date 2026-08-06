# Branch Automation — SHAFT Engine (Java)

Automates the 13 test cases from `TestCases_Branch.md` where both `Review = Approved` and
`Automation = Approved`. See `AutomationPlan_SHAFT.md`, `AutomationDecisionReport_SHAFT.md`, and
`AutomationCoverageReport_SHAFT.md` in the parent `automation/` folder for the full record.

## Prerequisites

- JDK 17+ (this project targets `maven.compiler.release=17`; built and verified against a JDK 23
  toolchain in this run)
- Maven 3.9+
- Network access to Maven Central (to resolve `io.github.shafthq:SHAFT_ENGINE:9.4.20251220`)

## Credentials

The QA Super Admin credentials are held in `src/main/java/utilities/EnvironmentConfig.java`
(`USERNAME` / `PASSWORD`), so the suite runs from any terminal or IDE with no setup step. Keep them
in that one class — never inline a credential in a test or page class. To point the suite at a
different environment, change those two constants alongside `environment.properties`.

## Running the suite

```bash
mvn test
```

This compiles the project and runs `testng.xml` (the `CreateBranchSuite`) via the Maven Surefire
plugin. Allure results are written to `target/allure-results/` (view with `allure serve
target/allure-results` if the Allure CLI is installed).

To compile only (no execution) — the check this project's own generation used for self-review:

```bash
mvn test-compile
```

## Known, expected failures

`tcBr026_warningPromptRejectsValueExceeding11Digits` is **expected to fail** until FINDING-004
(Warning Prompt (Days) has no 11-digit max-length enforcement) is fixed in the application — this is
a regression test asserting the *corrected* behavior, per Test Design's own instruction. A failure
here is the test doing its job, not a broken script. See `AutomationDecisionReport_SHAFT.md` and
`AutomationPlan_SHAFT.md` RISK-AUTO-2.

## Project layout

Follows the company's standard NDC automation layout (`AdminPages.<Module>.<SubModule>` packages,
`_Page`/`_TC`/`_Common` suffixes), the same convention used by `NDC-Uplift-Automation`:

```
src/main/java/AdminPages/Login/LogIn_Page.java
src/main/java/AdminPages/Admin/Branch/{AddBranch_Page,SearchBranch_Page,UpdateBranch_Page,Branch_Common}.java
src/main/java/utilities/{EnvironmentConfig,BranchDataFactory}.java
src/test/java/AdminPages/Login/{TestBase,TestBase_TC}.java
src/test/java/AdminPages/Admin/Branch/{CreateBranch_Admin_TC,SearchBranch_TC,UpdateBranch_TC,BranchActions_TC,BranchProvisioner,BranchTestData}.java
```

## Target environment

`src/test/resources/environment.properties` — non-secret (base URL, paths only). Change this file,
never the test logic, to point the suite at a different environment.
