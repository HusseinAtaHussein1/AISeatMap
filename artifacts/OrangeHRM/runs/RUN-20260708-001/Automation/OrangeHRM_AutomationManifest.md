# OrangeHRM — Automation Manifest — RUN-20260708-001

> Per `agents/automation_agent.md` §16. Structured inventory of the Automation Package (`OrangeHRM_tests_shaft/`) plus Self Review (§15) findings and recommendations.

## 1. File Inventory

| File | Type | Origin |
|---|---|---|
| `pom.xml` | Maven project descriptor | Generated |
| `testng.xml` | TestNG suite definition | Generated |
| `src/test/resources/properties/execution.properties` | SHAFT Engine configuration | Generated |
| `src/test/java/Utilities/BaseTest.java` | Shared setup/teardown | Generated |
| `src/test/java/Utilities/TestData.java` | Shared test data | Generated |
| `src/test/java/Pages/LoginPage.java` | Page Object | Generated |
| `src/test/java/Pages/ForgotPasswordPage.java` | Page Object | Generated |
| `src/test/java/Tests/LoginSuite/ValidLoginTest.java` | Test (TC-LOGIN-001) | Generated |
| `src/test/java/Tests/LoginSuite/InvalidCredentialsTest.java` | Test (TC-LOGIN-002) | Generated |
| `src/test/java/Tests/LoginSuite/EmptyFormValidationTest.java` | Test (TC-LOGIN-003) | Generated |
| `src/test/java/Tests/LoginSuite/EmojiUsernameRegressionTest.java` | Test (TC-LOGIN-004) | Generated |
| `src/test/java/Tests/LoginSuite/SqlInjectionLoginTest.java` | Test (TC-LOGIN-005) | Generated |
| `src/test/java/Tests/LoginSuite/DeepLinkRedirectTest.java` | Test (TC-LOGIN-007) | Generated |
| `src/test/java/Tests/LoginSuite/LongUsernameBoundaryTest.java` | Test (TC-LOGIN-011) | Generated |
| `src/test/java/Tests/ForgotPasswordSuite/UnknownUsernameForgotPasswordTest.java` | Test (TC-LOGIN-008) | Generated |
| `src/test/java/Tests/ForgotPasswordSuite/KnownUsernameForgotPasswordRegressionTest.java` | Test (TC-LOGIN-009) | Generated |

**Totals:** 16 files — 2 Page Objects, 2 shared utilities, 9 test classes, 3 project/config files. 0 files reused from any existing project (greenfield generation — see Automation Plan §6).

## 2. Self Review

Performed as a distinct pass after generation, per `agents/automation_agent.md` §15.

### Naming Consistency

Consistent across the package: PascalCase for classes, camelCase for methods, `*Test` suffix for every test class, `*Page` suffix for every Page Object, package names matching directory structure (`Pages`, `Tests.LoginSuite`, `Tests.ForgotPasswordSuite`, `Utilities`). No inconsistency found.

### Duplicate Code

None found. Every test method composes `LoginPage`/`ForgotPasswordPage` methods and `TestData` constants rather than re-implementing navigation or data-entry logic. TC-LOGIN-002's two Test Data combinations are handled via a single `@DataProvider`-driven test method rather than two near-identical methods.

### Broken References

**One issue found and corrected during this Self Review pass:** the initial draft of `EmojiUsernameRegressionTest.java` and `KnownUsernameForgotPasswordRegressionTest.java` used Allure `@Link` annotations with paths relative to this run's own workspace (e.g., `../findings/...`), which would resolve incorrectly — the cited Findings live under `RUN-20260706-002/findings/`, not anywhere reachable by a `../` traversal from `RUN-20260708-001/Automation/OrangeHRM_tests_shaft/`. **Corrected** to repo-root-relative path strings (e.g., `artifacts/OrangeHRM/runs/RUN-20260706-002/findings/FINDING-001_EmojiUsernameUnexpectedError/metadata.md`).

**Recommendation (not fixed, disclosed instead):** a repo-relative path string in an Allure `@Link` is not itself a clickable hyperlink unless Allure's report is configured with a matching link-pattern/base URL, which this package does not configure. As written, these annotations are correct, unambiguous *references* but will render as plain text in the Allure report, not as working links. Whether to configure an Allure link pattern (e.g., pointing at wherever this repository is hosted) is a decision outside this agent's authority — recommended for the Stage 4 reviewer to decide, not silently assumed.

Every Test Case ID cited in a test class's header comment was cross-checked against `OrangeHRM_TestCases_Login.md` and the Automation Decision Report — no orphaned or mismatched ID found.

### Missing Reusable Assets

None identified for this scope. `TestData` and `BaseTest` cover every cross-cutting need this suite's 9 generated tests have; no repeated inline logic was found that should have been extracted into a further shared asset.

### Missing Page Objects

None. Every screen interacted with (Login, Forgot Password) has a corresponding Page Object; no test interacts with a locator directly.

### Missing Utilities

None found for this scope. One item noted for awareness rather than as a defect: `LoginPage.LOGIN_URL` is a `public static final String` on the Page Object rather than in `TestData`, since it is page-identity information (the page's own URL) rather than test input data — this is a deliberate placement choice, not an oversight, but is recorded here so a future suite's author doesn't have to rediscover the reasoning.

### Missing Test Data

None. Every literal value used across the 9 generated tests (credentials, payloads, boundary values, expected messages) is sourced from `TestData`, not hardcoded inline in a test class.

## 3. Recommendations Summary

1. Decide whether to configure an Allure link pattern so `@Link` references resolve to clickable URLs in generated reports (see "Broken References" above) — deferred to the Stage 4 reviewer.
2. If a future run adds a second suite (e.g., a PIM suite under this same SHAFT Engine project), promote `TestData`/`BaseTest` placement and package naming conventions established here rather than re-deriving them, to keep the two suites' conventions aligned.
