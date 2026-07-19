# NDC — Reference Automation Project

**Registered:** 2026-07-12, per explicit user instruction. This is the company's real, production SHAFT automation codebase for NDC — analyzed once and persisted here as project knowledge so future Stage 4 (Automation Agent) runs never have to re-derive it from scratch.

## Location

`E:\Automation2\NDC-Uplift-Automation` — **outside this repository**, on local disk. A real Git repository with remote `origin` = `https://github.com/ahmedrefat-prog/NDC-Uplift-Automation.git`.

## Status: Read-Only by Default

**This project must never be modified by the Automation Agent unless the human explicitly selects "Update Existing Project" via the Automation Target Decision Gate** (`agents/automation_agent.md` §32). Default handling is always read-only: inspect, learn from, and generate code *compatible with* its architecture — never edit its files in place without that explicit choice.

## Security Flag (pre-existing condition, not introduced by this platform)

`src/test/resources/Environment.properties` and several Java files (`AdminPages/Login/LogIn_Page.java`, `src/test/java/AdminPages/Login/LogIn_TC.java`) contain **hardcoded plaintext credentials** for both the NDC Admin and Super Admin accounts, committed to Git history on a repo with a live GitHub remote. Values are deliberately **not reproduced in this document or anywhere else in this platform** — flagged here only as a standing fact for whoever owns that repo to address (rotate credentials; scrub Git history if that remote is not private). This platform's own credential handling (`tools/browser_driver/`, `projects/NDC/credentials/`) already keeps real secrets out of Git — this is a good example of why that convention exists.

## Architecture Summary

| Aspect | Finding |
|---|---|
| **Detected framework** | SHAFT Engine |
| **Framework version** | `7.4.20231015` (pinned in `pom.xml`) — noticeably older than the current SHAFT release (`9.1.20250203` as of this analysis); a version-upgrade decision is a human call, not something this platform should do unprompted. |
| **Java version** | 17 (`maven-compiler-plugin` source/target) |
| **Build system** | Maven. `groupId=io.github.shafthq`, `artifactId=NDC_Automated`. Two Maven profiles: `testng` (default, active) and `junit` (activates only if a JUnit listener service file is present — it isn't; TestNG is the real, active runner). |
| **Test runner** | TestNG via SHAFT's `com.shaft.listeners.TestNGListener` (wired through Surefire, not a checked-in `testng.xml` — Surefire auto-discovers `*_TC.java`/`*Test.java` classes). Sequential execution only (`TestNG.properties`: `setParallel=NONE`, `setThreadCount=1`). |
| **Reporting** | Allure enabled (`cleanAllureResultsDirectoryBeforeExecution=true`, `generateAllureReportArchive=true`, `openAllureReportAfterExecution=true`). Extent Reports explicitly **disabled** (`generateExtentReports=false`) despite an `extent-reports/` folder existing at the root — leftover from an earlier configuration, not currently active. |
| **Project modules** | `AdminPages/` (by business module: Admin, BookingMidOffice, DashBoard, ForgetPassword, Login, Master, Profile, Reports, RuleEngine, Settings.AdminSettings, UserManagement, importPNR) and `PortalPages/` (separate portal-side pages: Login, Reports, Settings, Topup, TravellerPages) — mirrors NDC's real Admin-vs-Portal split that this platform's own Discovery has also observed. |
| **Page Object pattern** | One `_Page`-suffixed class per screen (e.g. `LogIn_Page.java`), constructed with an injected `SHAFT.GUI.WebDriver`. Methods return `this` for fluent chaining (`.EnterUserName(...).EnterPassword(...).ClickOnLoginButton()`), similar in spirit to (but not literally using) SHAFT's own `.and()` connector. |
| **Locators** | **Declared as `private final By` fields directly inside each Page class** — not split into a separate Locators class. Prefixed `Txt_`/`Btn_`, matching this platform's mandated naming table (`projects/NDC/automation_framework.md` §2) — but the *separation* into its own Locators Layer is not how the reference project actually works. **This is the single biggest structural gap vs. `automation_framework.md`'s mandated "separate Locators Layer, one class per page" — a genuine Gap Resolution Rule case (automation_framework.md's own escalation path), not something to silently resolve either way.** |
| **Base test classes** | Per-module (not one shared base) — e.g. `AdminPages/Login` alone has *two* near-duplicate base classes, `TestBase.java` and `TestBase_TC.java`, both doing the same `@BeforeTest` driver setup. Real, pre-existing duplication — not a pattern to blindly replicate. |
| **Driver initialization** | Two coexisting patterns: (a) inline `new SHAFT.GUI.WebDriver(DriverFactory.DriverType.CHROME)` directly in a test base class (most common), and (b) `Drive_Factory.CommonMethod.setupDriver(browser)`, a more reusable factory with custom `ChromeOptions` (disables Chrome's password-manager/leak-detection prompts — relevant given the plaintext-credential logins this suite performs). (b) is the more reusable pattern but is not universally adopted yet. |
| **Assertions** | Plain `org.testng.Assert.assertEquals(...)` directly in test classes — not SHAFT's own fluent `.assertThat()` API, and not centralized into a shared Assertions helper. `LogIn_Page` also instantiates a `SoftAssert` in its constructor that is never actually used in its methods — dead field. |
| **Test data strategy** | Mixed, not uniform: most Login tests hardcode literals directly; one method (`AdminLogin()`) reads from `Environment.properties` via `utilities.DataUtils.get(key)`; a large `src/test/resources/testDataFiles/*.json` library exists for most *other* modules (144 files) accessed via `DataUtils.getJsonData(fileName, field)` — but Login itself barely uses this JSON path even though a `loginData.json` file exists in that folder. |
| **Configuration** | `src/test/resources/Environment.properties` — base URLs (Admin `192.168.1.70`, Portal `192.168.1.92:9500`) plus credentials in plain text (see Security Flag above). |
| **Reusable utilities** | `Drive_Factory.CommonMethod` (driver factory, partially adopted), `utilities.DataUtils` (properties + JSON test-data reader), `utilities.FakerSingleton` (Java Faker wrapper), `utilities.FileUploadUtil`, `Generic_Classes.*` (direct STG database query execution — `Connect_DB_And_Execute_Query`, `Get_DB_Config_STG`, `Execute_And_Save_To_CSV_Production_DB` — a DB-level verification capability beyond pure UI, directly relevant to this platform's own still-open Assumption #7 about NDC's database engine). |
| **Naming conventions** | `_Page` suffix (Page Objects), `_TC` suffix (Test Cases), `Btn_`/`Txt_` locator prefixes (matches `automation_framework.md`'s table). |
| **What Stage 4 should always reuse from here** | `SHAFT.GUI.WebDriver` + `Drive_Factory.CommonMethod` for driver setup (prefer over ad-hoc inline instantiation), `utilities.DataUtils` for any property/JSON test data, the existing `AdminPages.Login.LogIn_Page` class itself for Login specifically — extend it, never re-author a competing Login page object from scratch. |

## Standing Rules for Future Stage 4 Runs Against This Project

1. **Auto-detect this file at the start of every Stage 4 run for NDC.** State plainly: "Reference Project detected: `E:\Automation2\NDC-Uplift-Automation`" and ask whether to continue using it, change it, or remove it (never silently assume "yes"). See `agents/automation_agent.md` §32.
2. **Never recreate SHAFT infrastructure or framework boilerplate** (driver factory, base test classes, TestNG/Allure wiring) that already exists here — generate only the business/page-specific automation code that fits this existing architecture.
3. **Reuse existing utilities and patterns whenever possible** (table above) rather than authoring parallel equivalents.
4. **Read-only by default** — see "Status" above.
