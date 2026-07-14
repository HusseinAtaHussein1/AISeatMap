> **Status:** Pending Automation Approval (`pipeline/pipeline.md` §5.2). Consolidated Decision Gate answered 2026-07-12: Generate now = Yes · Automation Target = **Export a package compatible with the Reference Project** · Framework = **SHAFT Engine** · Automation Strategy = **Generate a completely new package**.
> **Run:** RUN-20260712-001, Stage 4 (Automation Agent v6).

# Automation Plan — NDC Login (SHAFT, Reference-Project-Compatible Export)

## Target Framework

**SHAFT Engine** `7.4.20231015` — pinned to the exact version already in use by the Reference Automation Project (`E:\Automation2\NDC-Uplift-Automation`), per the Automation Target answer (export must be compatible, not just "some SHAFT version").

## Target Language

**Java 17**, Maven — matches the Reference Project's own `pom.xml` (`maven-compiler-plugin` source/target 17).

## Project Architecture

```
projects/NDC/artifacts/runs/RUN-20260712-001/automation/NDC_tests_SHAFT/
  pom.xml
  src/main/resources/properties/default/{TestNG.properties, Reporting.properties}
  src/main/java/
    AdminPages/Login/LogIn_Page.java
    Drive_Factory/CommonMethod.java        (export copy — see "Existing Assets")
    utilities/CredentialsLoader.java       (new — see "Assets To Generate")
  src/test/java/AdminPages/Login/{TestBase.java, LogIn_TC.java}
  src/test/resources/testDataFiles/loginTestData.json
```

Package/class names (`AdminPages.Login.LogIn_Page`, `AdminPages.Login.LogIn_TC`) deliberately match the Reference Project's own naming exactly, per the Target answer — this is a holding project meant for a human to merge the relevant files into the real repository, not a permanently separate codebase.

## Design Pattern

Page Object Model, matching the **Reference Project's actual convention** — locators as `private final By` fields directly inside the Page class (not a separate Locators class). This is a deliberate departure from `projects/NDC/automation_framework.md`'s mandated separate Locators Layer, per the Gap Resolution Rule that document itself defines: `automation_framework.md` governs the platform-native package path (Automation Target = "inside the platform"); it does not govern a Reference-Project-compatible export, where fitting the *actual, already-adopted* architecture takes precedence (`agents/automation_agent.md` §32.5) over the platform's own structural preference. This is disclosed here explicitly, not applied silently.

## Existing Framework Analysis (§9) / Existing Assets

Per `projects/NDC/reference_automation_project.md`'s Architecture Summary (one-time analysis, 2026-07-12):
- **Reused verbatim:** `Txt_Username`, `Txt_Password`, `Btn_LogINButton`, `Txt_ErrorOfUserName`, `Txt_ErrorOfPassword`, `Txt_InValidCred` — all six locators are the Reference Project's own real, confirmed-working selectors (re-confirmed live by this run's own Discovery, 2026-07-12), not re-derived from scratch.
- **Reproduced as an export copy, not reused directly:** `Drive_Factory.CommonMethod` — cannot literally `import` across two separate Maven projects, so a copy is included here for this package to compile/run standalone. Flagged in the Automation Manifest to be deleted in favor of the real one at merge time.
- **Deliberately NOT carried over:**
  1. `Btn_RememberMyInfoNextTime` / `ClickRememberMe()` — confirmed absent from the live screen (FINDING-NDC-LOGIN-002); reusing it would automate against a non-existent element.
  2. `ClickSuperAdmin()` / `ClickAdmin()` — hardcode real plaintext credentials directly in source (the Reference Project's own flagged security antipattern, `reference_automation_project.md` Security Flag). Replaced by `loginWithValidCredential()` / `loginWithValidUsernameWrongPassword()`, which read the real credential from the platform's own git-ignored `credentials.json` at execution time only, via the new `utilities.CredentialsLoader`.

## Assets To Generate

- `utilities.CredentialsLoader` — new, security-conscious credential loading (see above).
- `AdminPages.Login.LogIn_Page` — new `Txt_LoginButtonAttribute`-equivalent method (`getLoginButtonLoadingIconAttribute()`) for TC-LOGIN-007; new `getPasswordFieldType()` for TC-LOGIN-004; new `loginWithValidCredential()`/`loginWithValidUsernameWrongPassword()` methods.
- `AdminPages.Login.LogIn_TC` — 8 TestNG methods, one per approved test case (TC-LOGIN-001 through 008), no more, no fewer.
- `AdminPages.Login.TestBase` — per-method (not per-test-class) driver setup/teardown, since 3 of the 8 cases are structural checks that must start from a guaranteed-clean, logged-out state.
- `loginTestData.json` — fabricated invalid-username/wrong-password test data only (Data Layer, JSON-driven per `automation_framework.md` §4 — still applied even in Reference-compatible mode, since it doesn't conflict with the Reference Project's own convention for other modules).

## Planned Automation Suites

One suite (Login), matching Stage 3's single business workflow — all 8 test cases in `LogIn_TC.java`.

## Estimated Automation Coverage

8 of 8 approved test cases (100%) — Generate New Automation. See Automation Decision Report for per-case detail.

## Known Manual Tests

None — every one of the 8 cases has a fully scriptable assertion, including the three assumption-based empty-field cases (TC-LOGIN-003/005/006), which assert the Reference Project's own expected message text as their best-available specification, explicitly labeled assumption-based in comments.

## Blocked Tests

None.

## Risks

- **TC-LOGIN-003/005/006's exact assertion text** ("Username is required" / "Password is required") is sourced from the Reference Project's own tests (Documentation-category evidence), not this run's own Direct Observation — if Stage 5 execution shows different actual text, that's a Test Design re-verification item, not an automation defect.
- **FINDING-NDC-LOGIN-001 (cross-host redirect):** TC-LOGIN-001's assertion checks the page title contains "Dashboard," not a specific host/URL, to stay stable regardless of that Finding's resolution.
- **`Drive_Factory.CommonMethod` duplication:** this package's copy will silently drift from the real one if the Reference Project's version changes before merge — flagged, not a reason to withhold this export.

## Assumptions

- Assumes SHAFT Engine `7.4.20231015` (pinned to match the Reference Project) remains resolvable from Maven Central / the local `.m2` cache — confirmed via a successful `mvn test-compile` this run (exit 0, all 5 classes produced).
- Assumes the existing NDC STG credential (`projects/NDC/credentials/credentials.json`) remains valid at Stage 5 execution time.
