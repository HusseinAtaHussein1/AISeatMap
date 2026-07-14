> **Status:** Pending Automation Approval · **Run:** RUN-20260712-001, Stage 4.

# Automation Manifest — NDC Login (SHAFT Export)

## File Inventory

| File | Status | Layer |
|---|---|---|
| `NDC_tests_SHAFT/pom.xml` | Generated (mirrors Reference Project's coordinates) | Config |
| `src/main/resources/properties/default/TestNG.properties` | Generated (mirrors Reference Project) | Config |
| `src/main/resources/properties/default/Reporting.properties` | Generated (mirrors Reference Project) | Config |
| `src/main/java/AdminPages/Login/LogIn_Page.java` | Generated (locators reused from Reference Project verbatim; new methods for TC-LOGIN-004/007/008) | Page Object |
| `src/main/java/Drive_Factory/CommonMethod.java` | Export copy of the Reference Project's real file — **delete on merge**, reuse the original instead | Utility |
| `src/main/java/utilities/CredentialsLoader.java` | Generated — new | Utility |
| `src/test/java/AdminPages/Login/TestBase.java` | Generated | Test base |
| `src/test/java/AdminPages/Login/LogIn_TC.java` | Generated — 8 test methods | Tests |
| `src/test/resources/testDataFiles/loginTestData.json` | Generated | Data |

## Self Review (`agents/automation_agent.md` §15)

- **Naming consistency:** Matches the Reference Project's own conventions exactly (`_Page`, `_TC`, `Btn_`/`Txt_` prefixes) — a deliberate departure from `automation_framework.md`'s separate-Locators-Layer mandate, disclosed in the Automation Plan's "Design Pattern" section per the Gap Resolution Rule.
- **Duplicate code:** `Drive_Factory.CommonMethod` is a deliberate, disclosed duplicate (export-copy) of the Reference Project's real file — not an undisclosed one. No other duplication found.
- **Broken references / compilation readiness:** **Verified — `mvn test-compile` run against this package completed with exit code 0**, all 5 main+test classes compiled successfully (`LogIn_Page`, `CommonMethod`, `CredentialsLoader`, `TestBase`, `LogIn_TC`). This is a real, executed static check (compilation only — no live browser/test execution), not an assumption.
- **Framework Compliance:** SHAFT Engine idioms used throughout (`SHAFT.GUI.WebDriver`, `driver.element()`, `driver.browser()`) — no raw Selenium/WebDriver calls, per `agents/automation_agent.md` §8.
- **Traceability:** Every test method's comment cites its Test Case ID; `LogIn_TC.java`'s class-level comment cites `NDC_TestCases_Login.md`/`NDC_TraceabilityMatrix.md`.
- **Missing reusable assets:** None for Login. Future NDC modules automated against this Reference Project should extend this same package/folder convention (new `AdminPages/{Module}/...` classes) rather than starting a third, parallel structure.
- **Recommendations:**
  1. On merge into the Reference Project, delete this package's `Drive_Factory.CommonMethod` copy and re-point `TestBase` at the real one.
  2. Add a stable `data-testid` to the login error message element (same recommendation as the earlier Playwright package's Manifest) — the current `Txt_InValidCred` locator is an `aria-label`-based XPath, a reasonable Level 1-adjacent choice but still brittle to copy changes.
  3. Before treating TC-LOGIN-003/005/006 as strong regression signals, independently re-observe the exact empty-field error messages via a Discovery pass (currently sourced from the Reference Project's tests, not this run's own observation).
  4. Flag to the Reference Project's maintainers that `Btn_RememberMyInfoNextTime` (their `LogIn_Page.java`) targets a no-longer-existent element (FINDING-NDC-LOGIN-002) and that `ClickSuperAdmin()`/`ClickAdmin()` hardcode real plaintext credentials — a security issue independent of this automation task.
