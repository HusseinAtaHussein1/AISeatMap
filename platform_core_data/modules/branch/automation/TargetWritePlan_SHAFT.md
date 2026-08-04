# Target Write Plan — SHAFT — run-002__2026-08-03_10-26-17__UserStory__US-8605CreateBranch

```
Target Write Plan — SHAFT Engine (Java)
Fit: Greenfield — scaffolding test infrastructure (automation-skill §11C.3). No automation
     project exists yet for this platform, in any framework.
Destination: platform_core_data/modules/branch/automation/tests_SHAFT/
             (the Module Automation Project, §11D — NOT the Target Project. platform.config.json's
             target.writeAllowlist is empty, so Option 4 of the Automation Target Decision Gate
             §32.3 was never offered; this run generates inside the platform only.)
Layout/naming: SHAFT Engine standard (Maven-conventional src/test/java, src/test/resources,
             src/main/resources/properties) -- nothing to match, since no existing project's
             conventions could be detected (greenfield).

  CREATE  pom.xml                                          project descriptor, pinned SHAFT_ENGINE 9.4.20251220
  CREATE  testng.xml                                       TestNG suite descriptor
  CREATE  .gitignore                                       excludes target/, *.class, allure-results/
  CREATE  README.md                                        execution instructions, credentials contract
  CREATE  src/main/resources/properties/execution.properties   SHAFT driver config (headless chrome)
  CREATE  src/test/resources/environment.properties         target base URL + paths (non-secret)
  CREATE  src/test/resources/branch_baseline.properties     shared baseline test data fixture
  CREATE  src/test/java/utils/EnvironmentConfig.java         config + credential-from-env-var reader
  CREATE  src/test/java/utils/BranchDataFactory.java         unique Name/Email generator
  CREATE  src/test/java/data/BranchTestData.java              baseline fixture reader
  CREATE  src/test/java/base/BaseTest.java                    DriverFactory lifecycle (@BeforeMethod/@AfterMethod)
  CREATE  src/test/java/pages/LoginPage.java                  login Page Object
  CREATE  src/test/java/pages/AddBranchPage.java               Add Branch form Page Object
  CREATE  src/test/java/tests/CreateBranchTests.java           13 @Test methods, one per in-scope TC-BR-ID

Selector verification: 19 verified (reused from this run's own Stage 4M live evidence, §11A) ·
                        0 unverified
Self-review: 3 iterations, converged (not budget-exhausted), 0 checks left unsatisfied
```

## Notes

- **No modification of any existing file.** Every row above is `CREATE` — there is nothing to
  extend (greenfield), so no `MODIFY`/`REUSE`/`DELETE` row applies.
- **No Target Project write of any kind.** `platform.config.json`'s `target.writeAllowlist` is
  empty, so per `pipeline.md` §13.3 writes are fail-closed and generation stays entirely inside
  `platform_core_data/`.
- This plan is presented for review alongside the Automation Approval gate (`pipeline.md` §5.2), per
  §11C.4 — no file above was written to a location outside the Module Automation Project before this
  plan existed to describe it.

---

# Revision 2 — run-003 — approved 2026-08-04

```
Target Write Plan — SHAFT Engine (Java)
Fit: BROWNFIELD — extending modules/branch/automation/tests_SHAFT/ in place (§11C).
     A SHAFT project already exists for this module; it is the registry's one authoritative
     package for this framework (§19), so this is an extension, not a new project or a reset.
Destination: platform_core_data/modules/branch/automation/tests_SHAFT/
Layout: matched from the existing project (base/ pages/ data/ utils/ tests/)

  CREATE  base/AbstractBaseTest.java        driver lifecycle + login + start-screen hook
  CREATE  pages/SearchBranchPage.java       filters · grid · row-by-code · tilde-paginator
  CREATE  pages/UpdateBranchPage.java       readiness poll · field reads · action buttons
  CREATE  utils/BranchProvisioner.java      run-tagged record + its assigned Branch Code
  CREATE  tests/SearchBranchTests.java      11 cases
  CREATE  tests/BranchActionsTests.java     3 cases  (self-created records)
  CREATE  tests/UpdateBranchTests.java      5 cases  (self-created records)

  MODIFY  base/BaseTest.java                extends AbstractBaseTest; keeps Add Branch nav
  MODIFY  testng.xml                        register 3 new suites
  MODIFY  src/test/resources/environment.properties   + editBranchPath
  MODIFY  utils/EnvironmentConfig.java      + editBranchPath() accessor

  REUSE   pages/LoginPage.java · pages/AddBranchPage.java · utils/BranchDataFactory.java
          data/BranchTestData.java
  UNTOUCHED  tests/CreateBranchTests.java   verified byte-identical afterwards
```

**Approved by the user on 2026-08-04**, with the `AbstractBaseTest` extraction chosen explicitly over a duplicate standalone base class.

## Deviation from the approved plan — one file

`pages/BasePage.java` was **added during self-review**, not in the approved plan. Justification: `selenium()`, `waitFor()`, `hasClass()` and the value/text readers were byte-identical across both new page objects, and the user's own review checklist required eliminating duplicated waits and DRY violations. It touches only files created this run — `AddBranchPage` and `LoginPage` deliberately still do not extend it, because retro-fitting them would modify code the 13 passing Create Branch tests depend on, which is outside the approved write scope.

Recorded here rather than folded in silently, so the delta between what was approved and what was written is visible.
