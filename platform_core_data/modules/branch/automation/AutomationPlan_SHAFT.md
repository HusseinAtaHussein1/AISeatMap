# Automation Plan — SHAFT — run-002__2026-08-03_10-26-17__UserStory__US-8605CreateBranch

| Field | Value |
|---|---|
| Module | `branch` |
| Produced by run | `run-002__2026-08-03_10-26-17__UserStory__US-8605CreateBranch` |
| Revision | 1 |
| Framework Decision Gate answer (§31) | SHAFT Engine (Java) — human choice, asked explicitly ("Playwright / SHAFT Engine (Java) / Selenium (Java)"). No existing automation project for any framework exists for this platform (any module) — this is a new project for a framework with none yet, not an extension or a reset. |
| Scope source | `modules/branch/test_design/TestCases_Branch.md` (Approved) — scope AND content, narrowed to the 13 test cases where **both** `Review = Approved` **and** `Automation = Approved` (`automation-skill` §revision note, 2026-08-01) |
| Stack Documentation Context | `modules/branch/automation/StackDocumentationContext_SHAFT.md` |
| Generated | 2026-08-03 |
| Status | Pending Review |

## 1. Target Framework

| Field | Value |
|---|---|
| Framework | SHAFT Engine |
| Version | `9.4.20251220` (`io.github.shafthq:SHAFT_ENGINE`) — pinned during generation. Context7 was unavailable, but the real coordinate/version were confirmed directly: a Maven Central search after the originally-guessed `com.shafthq:SHAFT_ENGINE` failed dependency resolution, then `javap` against the resolved jar to confirm the real API surface. A newer `io.github.shafthq:shaft-engine:10.3.20260707` exists but requires JDK 25 (incompatible with this environment's JDK 23 compiler) — see Stack Documentation Context §2/§6. |
| Justification | Human decision at the Framework Decision Gate (§31), asked explicitly rather than inferred. No existing automation project exists for this platform in any framework, so there was no "extend" option; the human chose SHAFT Engine over Playwright/Selenium. Per §31.5, Discovery's use of the Playwright MCP server for Stage 2/Stage 4M carried zero weight in this choice, and was not cited. |

## 2. Target Language

Java 17 (LTS) — SHAFT Engine's native language; no project-stated version to detect (greenfield), LTS chosen as the conservative default. Recorded as an assumption (§13), not a detected fact.

## 3. Project Architecture

Page Object Model with a shared driver/session layer, per SHAFT Engine's standard architecture (`automation-skill` §8): `SHAFT.GUI()` fluent API driven through SHAFT's own `DriverFactory`, TestNG as the test runner, Allure (TestNG adapter) for reporting. The project is standalone (`automation-skill` §11D.1) — its own `pom.xml` and `testng.xml`, runnable independently of any other module's automation.

## 4. Design Pattern

Page Object Model. One Page Object per screen actually interacted with by this scope's 13 test cases (login screen, Add Branch form) — locators as `public static By` constants, actions composed through SHAFT's fluent API, never raw unwrapped Selenium calls (per §8's explicit prohibition).

## 5. Planned Automation Suites

<!-- All 13 in-scope test cases exercise one business workflow — creating a Branch record — so this
     is one suite, not fragmented per form-section. A suite organized around "Branch Details section
     tests" disconnected from "Branch Sales Configuration section tests" would be the wrong shape
     per §10 — they are one workflow (Create Branch), not several screens. -->

| Suite | Business Workflow | Test Case IDs | Shared Setup | Shared Teardown | Shared Fixtures | Shared Components | Shared Utilities | Shared Test Data |
|---|---|---|---|---|---|---|---|---|
| CreateBranchSuite | Create Branch (Admin → Branch → Add branch) | TC-BR-001, 002, 004, 013, 021, 024, 025, 026, 028, 030, 037, 038, 039 | `@BeforeMethod`: `DriverFactory` init + login as Super Admin + navigate to Add Branch form | `@AfterMethod`: `DriverFactory.closeAllDrivers()` | Baseline valid Branch data fixture (`BranchTestData`) | `AddBranchPage` (all field/section interactions), `LoginPage` | `BranchDataFactory` (unique Name/Email generation per run, mirroring TC-BR-001's own uniqueness need) | `data/branch_baseline.properties` — the one set of valid values every "fill everything else" test case reuses |

## 6. Existing Assets

| Asset | Type | Location | Reusable As-Is? |
|---|---|---|---|
| — | — | — | N/A — no existing automation project exists for this platform, in any framework (`automation-skill` §9's Existing Framework Analysis is trivially empty; recorded explicitly per its own instruction rather than silently skipped) |

## 7. Assets To Generate

| Asset | Type | For Test Case(s) | Why nothing existing covers it |
|---|---|---|---|
| `LoginPage.java` | Page Object | All 13 (shared setup) | No existing automation project; first login flow ever automated for this platform |
| `AddBranchPage.java` | Page Object | All 13 | No existing automation project; encapsulates every locator this scope's Steps interact with (Operating Country/State/City cascade, Name, Post Office Box, Phone, Branch Email Config, Credit Limit/Top-Up/Credit Terms, Reaching Percentage, Warning Prompt, Payment Option checkboxes, Outstanding Threshold, Product Access grid, submit button) |
| `BranchTestData.java` + `data/branch_baseline.properties` | Test data fixture | TC-BR-001, 013, 021, 026, 030, 038 (every case that needs "every other mandatory field filled with valid data") | No existing fixture; centralizes the one baseline dataset so it is never hardcoded per test |
| `BranchDataFactory.java` | Utility | TC-BR-001 (unique Branch Name/Email per run, mirroring the uniqueness this case's own Test Data implies) | No existing utility; avoids duplicate-record collisions across repeated runs |
| `CreateBranchTests.java` | TestNG test class | All 13 | No existing test class |
| `BaseTest.java` | Shared base class | All 13 (`@BeforeMethod`/`@AfterMethod`) | No existing base class; SHAFT Engine convention for `DriverFactory` lifecycle |
| `pom.xml`, `testng.xml` | Build/test config | Project-level | Greenfield — nothing to extend |

## 8. Assets To Reuse

| Existing Asset | Reused Where | Composition Needed |
|---|---|---|
| — | — | N/A — greenfield, nothing existed to reuse |

## 9. Estimated Automation Coverage

<!-- Estimated BEFORE generation; realized figures live in AutomationCoverageReport_SHAFT.md. -->

| Projected Decision | Estimated Count | Estimated % |
|---|---|---|
| Reuse / Generate | 13 | 100% |
| Partially Automatable | 0 | 0% |
| Manual Only | 0 | 0% |

All 13 cases were pre-screened by this run's own Stage 4M execution (same day, same build) as reachable and assertable through the exact selectors this plan intends to use — see §12 and the Selector Verification Report. No case in this dual-approved scope is expected to need a Partially Automatable or Manual Only decision; the estimate is deliberately unhedged because the evidence behind it is unusually fresh (hours old, same build), not because this skill is assuming success.

## 10. Known Manual Tests

| Test Case ID | Why Manual Only |
|---|---|
| — | None in this scope. (The 26 cases with `Automation = Rejected` — including some genuinely hard-to-automate ones like TC-BR-032's GDS sub-grid or TC-BR-003's special-character probe — are out of this run's scope entirely by the reviewer's own decision, not a Manual Only automation decision this skill is making.) |

## 11. Blocked Tests

| Test Case ID | Missing Prerequisite |
|---|---|
| — | None. All 13 in-scope cases' preconditions (Super Admin login, reachable Add Branch form, a working Operating Country/State/City cascade via the `EgyptUAT`/`Cairo`/`Cairo` combination) were confirmed reachable this same run, during Stage 4M execution. |

## 12. Version-Specific Guidelines Applied

| Library | Pinned Version | Guideline Applied | Source |
|---|---|---|---|
| — | — | None — no Context7 query succeeded this run | N/A |

**Documentation gaps:** SHAFT_ENGINE, TestNG, and Allure's pinned versions and version-specific API guidance could not be fetched — Context7 returned "Invalid API key" (unavailable this run). Generation below follows SHAFT Engine's established, publicly stable conventions (`DriverFactory`, Page Object Model, TestNG, `SHAFT.GUI()`) as team/platform convention, explicitly not as version-verified fetched documentation. See `StackDocumentationContext_SHAFT.md` §6 for the full gap record.

## 13. Assumptions

| ID | Assumption | If false, impact |
|---|---|---|
| ASM-AUTO-1 | Java 17 (LTS) is an acceptable runtime target — not detected from any project manifest, since none exists yet | If the team's actual CI runs an older/newer JDK, `pom.xml`'s `maven.compiler.release` needs a one-line correction; no test logic is affected |
| ASM-AUTO-2 | The `EgyptUAT` / `Cairo` / `Cairo` Operating Country/State/City combination, confirmed reachable and populated during this run's Stage 4M execution (same day), remains valid STG master data at the time this suite is actually executed by Stage 4A/5A | If that master-data record is later renamed/removed, every generated test's location-cascade step fails identically — a single, easily diagnosed break, not scattered flakiness, since all 13 tests share one `AddBranchPage` method for this step |
| ASM-AUTO-3 | The SHAFT_ENGINE `RELEASE` Maven coordinate resolves successfully at build time in this environment (internet/Maven Central access assumed available to whoever runs `mvn install`) | If Maven Central is unreachable from the execution environment, the project fails to build; this is a documented gap (§Documentation gaps above), not a coverage decision |

## 14. Risks

| ID | Risk | Likelihood / Impact | Mitigation |
|---|---|---|---|
| RISK-AUTO-1 (realized and resolved during this run) | SHAFT_ENGINE's actual current API surface differed materially from this skill's initial, general-knowledge assumption (a simpler `getAttribute()`/`getText()` surface) — the real 9.4.20251220 API is fluent/assertion-based (`driver.assertThat().element(locator).attribute(...).isEqualTo(...).perform()`). This was not a hypothetical risk: `mvn test-compile` failed with ~40 "cannot find symbol" errors on the first attempt. | Realized — Medium impact, fully mitigated this run | Diagnosed via `javap` against the resolved jar rather than guessing further; Page Objects and the test class were rewritten to the real API; `mvn test-compile` was re-run and now succeeds (7/7 classes, 0 errors) — see Self Review Report. Still recommend re-running the Stack Documentation step with Context7 restored, to get version-specific guidance beyond raw method signatures. |
| RISK-AUTO-2 | TC-BR-026 (Warning Prompt length cap) is a regression test whose Expected Result asserts the *corrected* behavior (per Test Design's own instruction) — the underlying defect (FINDING-004) is still open per this run's own Stage 4M execution. Running this generated test today will genuinely **fail**, correctly, until the defect is fixed. | Certain (by design) / Low impact if understood correctly | Stated plainly in the Automation Decision Report and Automation Summary's Known Limitations, so Stage 5A does not mistake an expected, meaningful failure for a broken script |
| RISK-AUTO-3 | The Product Access grid and Payment Option section both carry live master data (supplier list, payment-gateway-derived options) that can change independently of this application's own release cycle (per Discovery's FINDING-001/FINDING-007 observations) | Low likelihood / Medium impact — TC-BR-028 hardcodes "Cash" as a stable, always-present option; low risk, but not zero | `AddBranchPage`'s Payment Option locator is scoped by the checkbox's own `id` (`id-PaymentOption-Cash`), not by position, so a reordering of the list does not break it — only removal of "Cash" itself would |
