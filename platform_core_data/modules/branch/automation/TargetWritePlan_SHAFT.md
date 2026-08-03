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
