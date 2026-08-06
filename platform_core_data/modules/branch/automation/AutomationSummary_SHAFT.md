# Automation Summary — SHAFT

| Field | Value |
|---|---|
| Framework | SHAFT Engine |
| Run Folder (this update) | `run-002__2026-08-03_10-26-17__UserStory__US-8605CreateBranch` |
| Current location (pending Automation Approval) | `platform_core_data/modules/branch/automation/tests_SHAFT/` |
| Baseline location (after Automation Approval + Workspace Merge, per pipeline.md §12.4) | `platform_core_data/automation_baseline/shaft/tests_SHAFT/` (does not exist yet — no prior automation project has ever been merged for this platform, in any framework) |
| Generated | 2026-08-03 |
| Status | Pending Review |

## 1. Automation Summary

Run Scope: User Story (US 8605 — Create Branch), narrowed to the 13 test cases in
`modules/branch/test_design/TestCases_Branch.md` where both `Review = Approved` and
`Automation = Approved`. Framework: SHAFT Engine (Java), chosen by explicit human decision at the
Framework Decision Gate — this is the first automation project for this platform, in any framework
or module. Outcome: all 13 in-scope test cases received a Generate New Automation decision (100%
coverage of this run's scope); the generated project compiles cleanly (`mvn test-compile`, 7/7
classes, 0 errors) after a self-review pass caught and fixed an invalid `pom.xml` XML comment, a
wrong Maven coordinate, and a materially incorrect assumption about SHAFT_ENGINE's API surface
(corrected by inspecting the resolved jar directly with `javap`, since Context7 was unavailable).
One generated test (`TC-BR-026`) is expected to fail when actually executed, by design — it is a
regression check for a still-open defect (FINDING-004).

## 2. Generated Files

| File | Type | Generated / Reused | Suite |
|---|---|---|---|
| `pom.xml` | config | Generated | — |
| `testng.xml` | config | Generated | — |
| `.gitignore` | config | Generated | — |
| `README.md` | docs | Generated | — |
| `src/main/resources/properties/execution.properties` | config | Generated | — |
| `src/test/resources/environment.properties` | config | Generated | — |
| `src/test/resources/branch_baseline.properties` | test data | Generated | CreateBranchSuite |
| `src/main/java/utilities/EnvironmentConfig.java` | utility | Generated | CreateBranchSuite |
| `src/main/java/utilities/BranchDataFactory.java` | utility | Generated | CreateBranchSuite |
| `src/main/java/AdminPages/Admin/Branch/BranchTestData.java` | fixture | Generated | CreateBranchSuite |
| `src/test/java/AdminPages/Login/TestBase_TC.java` | fixture (base class) | Generated | CreateBranchSuite |
| `src/main/java/AdminPages/Login/LogIn_Page.java` | page object | Generated | CreateBranchSuite |
| `src/main/java/AdminPages/Admin/Branch/AddBranch_Page.java` | page object | Generated | CreateBranchSuite |
| `src/test/java/AdminPages/Admin/Branch/CreateBranch_Admin_TC.java` | test script | Generated | CreateBranchSuite |

**Totals:** 14 generated · 0 reused

## 3. Framework Used

| Field | Value |
|---|---|
| Framework | SHAFT Engine |
| Version | `7.4.20231015` (`io.github.shafthq:SHAFT_ENGINE`) — changed 2026-08-05, user-mandated, from the originally-pinned `9.4.20251220` |
| Selection basis | Framework Decision Gate (§31) — human choice among Playwright / SHAFT Engine (Java) / Selenium (Java), asked explicitly since no automation project existed for any framework |
| Justification | Human decision; no existing project to extend, no Discovery-tooling bias applied (Discovery/Stage 4M used the Playwright MCP server and Browser Driver, which carried zero weight in this choice per §31.5) |
| Version realignment (2026-08-05) | User pointed to a real, pre-existing NDC SHAFT project (`C:\Users\Sheen\NDC-Automation`, not previously known to this platform) that already automates Branch and other Admin screens on `SHAFT_ENGINE 7.4.20231015`. `pom.xml` and the TestNG listener registration (`META-INF/services/org.testng.ITestNGListener` + explicit `surefire-testng`/`aspectjweaver` plugin bindings) were realigned to match it exactly. Confirmed to compile and run cleanly under this environment's JDK 23 toolchain (no JDK-25 issue, unlike the newer 10.3 release); the four stale `io.qameta.allure.listener.*` service files from the original 9.4-era generation were removed as they referenced classes (`com.shaft.listeners.AllureListener`) that do not exist in 7.4 and crashed the TestNG provider on startup. |

## 4. Coverage

| Metric | Value |
|---|---|
| Automation coverage | 100% |
| Basis | 13 of 13 candidate cases (`Review = Approved AND Automation = Approved`) |

| Decision | Count |
|---|---|
| Reuse Existing Automation | 0 |
| Generate New Automation | 13 |
| Partially Automatable | 0 |
| Manual Only | 0 |

## 5. Automation Decisions

**Full report:** `modules/branch/automation/AutomationDecisionReport_SHAFT.md`

All 13 in-scope test cases: Generate New Automation. Zero Partially Automatable, zero Manual Only.

## 6. Known Limitations

**Locator fallbacks (§24.2):**

*(None — every locator resolved via its primary strategy; see `SelectorVerificationReport_SHAFT.md`.)*

**Partially Automatable / Manual Only reasons:**

*(None — zero such decisions this run.)*

**Unresolved Self Review findings (§15):**

*(None — all 5 findings from the self-review loop were resolved within the 3-iteration budget; see `SelfReviewReport_SHAFT.md`. Two standing recommendations, not findings, remain open: re-run Stack Documentation once Context7 is restored, and re-evaluate the newer `shaft-engine:10.3.20260707` artifact once a JDK 25 toolchain is available.)*

**Other disclosed limitations:**

| Item | Detail |
|---|---|
| TC-BR-026 expected failure | Regression test for FINDING-004 (Warning Prompt length cap), still an open defect as of this run's own Stage 4M execution — will report Failed until fixed, by design |
| SHAFT_ENGINE version | Pinned to 7.4.20231015 (2026-08-05, user-mandated realignment to the pre-existing `NDC-Automation` reference project) — not the latest published (10.3.20260707), which requires a JDK 25 compiler this environment does not have |
| Context7 unavailable | No version-specific documentation was fetched; the API used was confirmed via direct `javap` inspection of the resolved jar instead — real and verified, but not documentation-guideline-informed beyond raw method signatures |

## 7. Execution Instructions

**Prerequisites:** JDK 17+ (compiled to release 17; runs fine on this environment's JDK 23), Maven 3.9+, network access to Maven Central (resolves `aspectjweaver` to `~/.m2/repository/...` — the surefire `argLine` javaagent path depends on it being present there), `BRANCH_QA_USERNAME` and `BRANCH_QA_PASSWORD` environment variables set.

```bash
cd platform_core_data/modules/branch/automation/tests_SHAFT
mvn test
```

A known, pre-existing gap unrelated to this run's changes: the bundled `log4j2.properties`/`reportportal.properties` `ReportPortalAppender` initializes regardless of `rp.enable=false` and crashes with "Base url for ReportPortal server is not set!" unless `rp.endpoint` is also supplied as a JVM system property. Until that's fixed at the config-file level (see `modules/branch/healing/RepairSummary.md` §11 REC-02), run with both flags:

```bash
mvn test -Drp.endpoint=http://localhost:8080 -Drp.enable=false
```

| Required Config / Env Var | Purpose | Source |
|---|---|---|
| `BRANCH_QA_USERNAME` | Super Admin login | Set by the operator before running; never committed |
| `BRANCH_QA_PASSWORD` | Super Admin login | Set by the operator before running; never committed |
| `src/test/resources/environment.properties` | Target base URL (`http://192.168.1.70`) and paths | Checked in, non-secret |

## 8. Inputs for Automation Execution skill

| Required Input (Automation Execution §4) | Present? | Location / Note |
|---|---|---|
| Automation Package | Yes | `modules/branch/automation/tests_SHAFT/` — standalone, compiles cleanly |
| Automation Manifest | Yes | `modules/branch/automation/AutomationManifest_SHAFT.md` |
| Automation Decision Report | Yes | `modules/branch/automation/AutomationDecisionReport_SHAFT.md` |
| Automation Coverage Report | Yes | `modules/branch/automation/AutomationCoverageReport_SHAFT.md` |
| Automation Suite Manifest | Yes | `modules/branch/automation/AutomationSuiteManifest_SHAFT.md` |
| Selector Verification Report | Yes | `modules/branch/automation/SelectorVerificationReport_SHAFT.md` |

**Handoff confirmation:** All inputs Automation Execution's own specification declares it needs are present. This project has **not yet cleared Automation Approval** — Stage 5A must not execute it until a human approves this Stage 4A output (`pipeline.md` §5.2), after which the Workspace Merge promotes it into `automation_baseline/shaft/tests_SHAFT/`.

**Suite to execute:** `modules/branch/automation/tests_SHAFT/` (this run's working copy — Stage 5A executes this, never a baseline directly, per the standing rule).

---

# Revision 2 — run-003

| Field | Value |
|---|---|
| Run Folder (this update) | `run-003__2026-08-04_11-24-38__UserStory__US-8599-SearchActions_US-8606-UpdateBranch` |
| Generated | 2026-08-04 |
| Status | Pending Review |

## What this revision added

19 new automated test cases covering US 8599 (Search & Actions Branch) and US 8606 (Update Branch), bringing the module's SHAFT project from 13 to **32** automated cases across four workflow-shaped suites. The project was **extended in place**, never recreated.

## Handoff to Stage 5A (§28 completeness check)

| Input Stage 5A declares it needs | Present? |
|---|---|
| Runnable module project | Yes — `modules/branch/automation/tests_SHAFT/`, compiles offline against the pinned SHAFT version |
| Entry point | `testng.xml`, 4 suites |
| Environment configuration | `src/test/resources/environment.properties` (4 keys, all with accessors) |
| Credential mechanism | Environment variables `BRANCH_QA_USERNAME` / `BRANCH_QA_PASSWORD`; never in any file |
| Case-to-method traceability | Automation Suite Manifest §Case-to-method map |
| Known expected failures | Yes — TC-BR-052, stated in advance with the reason |
| Unverified locators | Yes — 3, disclosed in the Selector Verification Report |
| Data preconditions | Yes — 4, listed in the Suite Manifest |

**Handoff is complete.** Stage 5A needs no information this stage did not supply.

## Three things Stage 5A should not misread

1. **TC-BR-052 failing is correct.** It asserts the requirement; the application does not meet it (FINDING-012). Do not repair it into passing.
2. **TC-BR-054 / TC-BR-060 / TC-BR-061 can fail on data, not on defects.** Each says so explicitly in its failure message. Treat those as Environment Health, not Application Health.
3. **A TC-BR-067 failure is ambiguous by disclosure.** Its validation-message locator is unverified, so a red result may mean a wrong locator rather than a missing message. Its failure text carries that caveat.

## Records this run will create

Seven Branch records per full execution, named `QARUN003_<nanoTime>`, all left in place — deletion is not authorised. They are the only records any test in this suite is permitted to mutate.
