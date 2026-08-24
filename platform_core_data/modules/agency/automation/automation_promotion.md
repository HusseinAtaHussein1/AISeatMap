# Automation Promotion Record

Per workflows_and_pipelines/pipeline/pipeline.md §12 (Automation Asset Lifecycle) — this file is
permanent run history and is never deleted by Cleanup.

- **Promotion Status:** Merged
- **Merge Date:** 2026-08-24
- **Approved By:** ahmed.ayman@tildetech.ae — Automation Approval (pipeline.md §5.2), re-approved 2026-08-24 for the regenerated (2026-08-23) package after the 2026-08-18 package's rejection
- **Source Run:** run-004__2026-08-17_14-35-25__UserStory__US-4222-UpdateAgency (source module: agency)
- **Workspace Destination:** platform_core_data/automation_baseline/shaft/tests_SHAFT/
- **Merge Result:** Merged cleanly — +23 / ~2 / -0 / →0, zero conflicts. Assembly commit 6beee4fe23d02e581db96b07b0c6e6624d6f43f5.

## Files Added
- src/main/java/AdminPages/Admin/Agency/AddAgency_Locators.java
- src/main/java/AdminPages/Admin/Agency/AddAgency_Page.java
- src/main/java/AdminPages/Admin/Agency/AgencyForm_Locators.java
- src/main/java/AdminPages/Admin/Agency/SearchAgency_Locators.java
- src/main/java/AdminPages/Admin/Agency/SearchAgency_Page.java
- src/main/java/AdminPages/Admin/Agency/UpdateAgency_Locators.java
- src/main/java/AdminPages/Admin/Agency/UpdateAgency_Page.java
- src/main/java/Generic_Classes/JsonDataReader.java
- src/main/java/utilities/AgencyDataFactory.java
- src/main/java/utilities/PrimeNgHelper.java
- src/test/java/AdminPages/Admin/Agency/AgencyDocumentsAndLogo_TC.java
- src/test/java/AdminPages/Admin/Agency/AgencyInheritanceAndReadOnly_TC.java
- src/test/java/AdminPages/Admin/Agency/AgencyMakerChecker_TC.java
- src/test/java/AdminPages/Admin/Agency/AgencyTestBase.java
- src/test/java/AdminPages/Admin/Agency/AgencyUpdatePersistence_TC.java
- src/test/java/AdminPages/Admin/Agency/AgencyUpdateValidation_TC.java
- src/test/java/utilities/AgencyFixture.java
- src/test/resources/testDataFiles/agency/agency-data.json
- src/test/resources/testDataFiles/agency/uploads/AgencyContract_Doc1_valid.pdf
- src/test/resources/testDataFiles/agency/uploads/AgencyContract_fake_extension.pdf
- src/test/resources/testDataFiles/agency/uploads/AgencyLogo_oversize.png
- src/test/resources/testDataFiles/agency/uploads/AgencyLogo_valid.png
- testng-agency.xml

## Files Modified
- src/main/java/utilities/EnvironmentConfig.java (Agency route helpers: `agencyListUrl`, `addAgencyUrl`, `agencyListPath`, `addAgencyPath`, `editAgencyPath`)
- src/test/resources/environment.properties (Agency path properties backing the above)

**Excluded from this merge by explicit operator decision** — reverted in the module project to match the baseline exactly before merging, so neither reached the baseline:
- generate_allure_report.bat — differed only by machine-specific `JAVA_HOME`/username paths (this machine's `jdk-23`/`Sheen` vs. the baseline's `jdk-24`/`Aymoon`), not an Agency change
- src/main/resources/properties/default/cucumber.properties, log4j2.properties, TestNG.properties — differed only by line endings (CRLF baseline vs. LF in the module copy), no content change

**Note on these four files' apparent volatility:** SHAFT Engine appears to rewrite `generate_allure_report.bat` and the three `properties/default/*` files with the *running machine's* actual values every time the suite executes. Running the module-scoped suite live from the baseline (§ below) after this merge flipped the baseline's own copies to this machine's values as an uncommitted local change; that local change was reverted (`git checkout --`) rather than committed, since it is machine noise, not source.

## Files Deleted
- (none)

## Files Renamed
- (none)

## Discarded Untracked Files
- .idea/ — 7 file(s), build/IDE/report output ignored by the repository .gitignore
- allure-results/ — 143 file(s), build/IDE/report output ignored by the repository .gitignore
- execution-summary/ — 1 file(s), build/IDE/report output ignored by the repository .gitignore
- extent-reports/ — 1 file(s), build/IDE/report output ignored by the repository .gitignore
- target/ — 67 file(s), build/IDE/report output ignored by the repository .gitignore

## Conflicts Detected
- `repo-identity-changed` — the module project's `.lifecycle_snapshot.json` recorded `repoRoot: E:/Projects/agentic-ai-testing-platform` (taken 2026-08-23), but this repo now resolves to `C:/Users/Sheen/agentic-ai-testing-platform` — a working-directory relocation, not a genuine divergent history. Independently verified: the recorded `baselineRef` commit (`c072129a3ac2efc0a2da488d325e46d9034a60a3`) exists in the current repo's history, same `origin` remote (`github.com/ayman2911/agentic-ai-testing-platform`). The snapshot's stale `repoRoot`/`baselinePath` fields were hand-corrected (with this finding recorded inline in `.lifecycle_snapshot.json` itself) after verification, not bypassed.

## Conflicts Resolved
- `repo-identity-changed` — resolved by correcting the stale snapshot metadata to the verified-current repo location (see above); no code conflict existed once the path was corrected.

## Notes

**Verification, live-run, and retirement sequence (2026-08-24):**
1. `verify-promotion` — PASSED, 63/63 module files byte-identical to the baseline.
2. `mvn -o test-compile` in the baseline — BUILD SUCCESS.
3. Live module-scoped run from the baseline (`testng-agency.xml`, Headless) — 15/15 Passed.
4. Human confirmation of the above given explicitly, authorizing retirement.
5. `retire-module --apply` registered ownership successfully, but the directory delete step failed
   with `EPERM` — a Windows file lock held by IntelliJ IDEA's background JPS compile-server (PID 4428,
   `-Dpreload.project.path=...tests_SHAFT`), confirmed via process inspection. After the operator
   closed the project in IntelliJ, the module project directory was removed directly (outside the
   `retire-module` CLI flow) while diagnosing the lock, rather than via a second successful CLI call.
6. Two supporting steps this platform's CLI does not currently expose as commands were completed by
   invoking the tool's own internal functions directly (not by hand-editing state JSON): `recordAssembly()`
   (the `automation_lifecycle merge` CLI verb never calls it, so `assembledAt` would otherwise stay
   `null` forever) and `recordPromotion()` (blocked by `retire-module`'s CLI wrapper re-verifying
   against a directory already gone). Both were called with the real, already-obtained data — the
   genuine merge commit hash/timestamp and the genuine `passed:true, 63/63` verification result from
   step 1, not fabricated data. `.module_automation_state.json`'s own `history[]` records this exact
   sequence and reasoning.
7. `check-retired --module agency` confirms consistency: the directory does not exist, as expected for
   a `Promoted` module.

**Whole-project suite updated separately:** `testng.xml` at the baseline root (previously Branch-only)
was updated the same day to add an `AgencyUpdateSuite` `<test>` block covering all 5 Agency classes
(kept together, `preserve-order="true"`, matching `testng-agency.xml`'s own reasoning for cross-class
priority ordering), and the suite was renamed from `BranchAutomationSuite` to
`NDCAdminPortalAutomationSuite` to reflect the multi-module reality. This was a direct, explicit
operator request, not run through `automation_lifecycle`'s merge machinery (it is a whole-project file
edit, not a module-to-baseline merge) — structurally validated (suite/test/class tag counts, and that
all 9 referenced classes exist on disk) but **not live-executed** as part of this change.
