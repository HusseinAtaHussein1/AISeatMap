# Automation Framework Standards

> The project's own automation standards. **These win over anything fetched from external
> documentation**: where an idiomatic upstream layout contradicts this document, this document is
> authoritative (`automation-skill` §34.5).

## Framework

SHAFT Engine (Java), `io.github.shafthq:SHAFT_ENGINE:9.4.20251220` — chosen at the Framework Decision
Gate (`automation-skill` §31), 2026-08-03, for the `branch` module's first automation project. This
is the platform's first automation project of any kind — the choice binds SHAFT as this project's
authoritative framework going forward (§31.5); a future module needing automation extends this
convention rather than re-asking from a blank slate, though the Framework Decision Gate is still
asked every run per Execution Rule 29.

## Project Structure

Maven-conventional: `pom.xml` + `testng.xml` at the project root, `src/test/java/{pages,base,data,
utils,tests}`, `src/test/resources/` (test data + `environment.properties`), `src/main/resources/
properties/` (SHAFT's own `execution.properties`). See `automation_baseline/shaft/tests_SHAFT/` (the retired `modules/branch/automation/tests_SHAFT/` was its home until `branch` was promoted on 2026-08-17) for
the realized example.

## Page Object Pattern

One Page Object per screen, named `{Screen}Page.java` (e.g. `AddBranchPage.java`,
`LoginPage.java`). Locators are `private static final org.openqa.selenium.By` constants at the top
of the class. Actions return `this` for chaining; assertions are separate, named `void` methods
(e.g. `assertCountryEquals(String expected)`) built on SHAFT's fluent
`driver.assertThat().element(locator)...perform()` API — never inlined as raw TestNG `Assert` calls
inside a test method, except where SHAFT's own validation builder does not expose a needed check
(documented case: page-source/body-text checks, which fall back to `driver.browser().getPageSource()`
+ a plain `org.testng.Assert`, since this SHAFT_ENGINE version's `WebDriverBrowserValidationsBuilder`
has no fluent `text()` method — confirmed via `javap`, not assumed).

## Naming Conventions

| Artifact | Convention | Example |
|---|---|---|
| Test file | `{Workflow}Tests.java` | `CreateBranchTests.java` |
| Page object | `{Screen}Page.java` | `AddBranchPage.java` |
| Test method | `tcBrNNN_camelCaseDescription` — the Test Case ID prefix is mandatory (traceability, §12) | `tcBr001_createBranchWithAllMandatoryFields` |

## Assertions and Reporting

SHAFT's own fluent assertion API (`driver.assertThat()` for hard assertions, `driver.verifyThat()`
for soft ones), which reports through SHAFT's built-in Allure integration automatically — no separate
reporting wiring is authored per test. Plain `org.testng.Assert` is used only where SHAFT's validation
builder does not expose an equivalent check (see Page Object Pattern above) — every such case is
documented in-code with a comment explaining why, not silently mixed in as a stylistic default.

## Test Data Strategy

One shared baseline fixture per module workflow (`data/BranchTestData.java` reading
`src/test/resources/branch_baseline.properties`) for values every "fill every other mandatory field"
test case reuses, plus a `utils/{Module}DataFactory.java` for values that must be unique per run
(Branch Name, emails) to avoid cross-run collisions. Never hardcode a shared value inline in a test
method. Credentials are never in a properties file — read from environment variables via
`utils/EnvironmentConfig.java`, mirroring `platform_core/tools/browser_driver/README.md` §4's
contract in this standalone Java project's own terms.
