# Automation Suite Manifest — SHAFT — branch

| Field | Value |
|---|---|
| Module | `branch` |
| Produced by run | `run-002__2026-08-03_10-26-17__UserStory__US-8605CreateBranch` |
| Framework | SHAFT Engine |
| Module project | `modules/branch/automation/tests_SHAFT/` |
| Runs standalone | Yes — its own `pom.xml`, `testng.xml`, and test data; confirmed via a real `mvn test-compile` run in this environment (0 errors). Execution (`mvn test`) was not run this stage (§2.1 — execution is exclusively Stage 5A's responsibility), but the project compiles and resolves its own dependencies independently. |
| Suites | 1 |
| Automated test cases | 13 |
| Generated | 2026-08-03 |

## 1. Suite Index

| Suite | Business Workflow | Test Cases | Assets | Execution Order |
|---|---|---|---|---|
| CreateBranchSuite | Create Branch (Admin → Branch → Add branch) | 13 | 7 Java files + 6 config/data files | Unordered — every `@Test` method is independent and idempotent (its own `@BeforeMethod`/`@AfterMethod` driver lifecycle, own unique test data via `BranchDataFactory`) |

## 2. Suites

### CreateBranchSuite

**Business workflow:** Create Branch — every in-scope test case exercises the same Admin → Branch → Add branch screen and submission flow; grouping by form-section would have fragmented one workflow into artificial per-page suites (automation-skill §10's explicit prohibition).

**Test cases:**

| Test Case ID | Automation Script | Decision | Status |
|---|---|---|---|
| TC-BR-001 | `tests/CreateBranchTests.tcBr001_createBranchWithAllMandatoryFields` | Generate | Ready |
| TC-BR-002 | `tests/CreateBranchTests.tcBr002_mandatoryBranchDetailsFieldsBlockSubmissionWhenEmpty` | Generate | Ready |
| TC-BR-004 | `tests/CreateBranchTests.tcBr004_countryAutoFillsFromOperatingCountry` | Generate | Ready |
| TC-BR-013 | `tests/CreateBranchTests.tcBr013_mandatoryEmailConfigFieldsBlockSubmissionWhenEmpty` | Generate | Ready |
| TC-BR-021 | `tests/CreateBranchTests.tcBr021_mandatorySalesConfigFieldsBlockSubmissionWhenEmpty` | Generate | Ready |
| TC-BR-024 | `tests/CreateBranchTests.tcBr024_reachingPercentageRejectsValueGreaterThan100` | Generate | Ready |
| TC-BR-025 | `tests/CreateBranchTests.tcBr025_reachingPercentageAcceptsThreeDecimalPlaces` | Generate | Ready |
| TC-BR-026 | `tests/CreateBranchTests.tcBr026_warningPromptRejectsValueExceeding11Digits` | Generate | Ready (expected to Fail against the live app until FINDING-004 is fixed) |
| TC-BR-028 | `tests/CreateBranchTests.tcBr028_selectAtLeastOnePaymentOption` | Generate | Ready |
| TC-BR-030 | `tests/CreateBranchTests.tcBr030_descriptionEnabledOnlyWhenSupplierRowSelected` | Generate | Ready |
| TC-BR-037 | `tests/CreateBranchTests.tcBr037_createBranchWithValidOutstandingThreshold` | Generate | Ready |
| TC-BR-038 | `tests/CreateBranchTests.tcBr038_outstandingThresholdBlocksSubmissionWhenEmpty` | Generate | Ready |
| TC-BR-039 | `tests/CreateBranchTests.tcBr039_outstandingThresholdAcceptsNumericValue` | Generate | Ready |

**Shared elements (§10):**

| Element | Value / Location |
|---|---|
| Shared Setup | `base/BaseTest.setUp` (`@BeforeMethod`) — `DriverFactory` init via `new SHAFT.GUI.WebDriver()`, login as Super Admin (`LoginPage`), navigate to Add Branch (`AddBranchPage.open`) |
| Shared Teardown | `base/BaseTest.tearDown` (`@AfterMethod`) — `driver.quit()` |
| Shared Fixtures | `data/BranchTestData.java` + `src/test/resources/branch_baseline.properties` |
| Shared Components | None — all interactions are on one screen (`AddBranchPage`); no cross-screen shared component was needed for this scope |
| Shared Utilities | `utils/EnvironmentConfig.java` (config + credentials-from-env-var), `utils/BranchDataFactory.java` (unique Name/Email generation) |
| Shared Test Data | `branch_baseline.properties` (Operating Country/State/City, Address, Post Office Box, Phone, Email Password, Contact Name/Phone, Credit Limit/Top-Up/Credit Terms, Outstanding Threshold) |

## 3. Cross-Suite Shared Assets

*(None — one suite this run; nothing yet to share cross-suite. `automation_baseline/shaft/shared/` does not exist yet, since this is the first SHAFT automation project for this platform.)*

## 4. Divergence From Plan

*(None. The realized structure matches Automation Plan §5 exactly — one suite, one Page Object per screen, the same shared fixture/utility set.)*
