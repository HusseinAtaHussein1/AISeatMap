# Stack Documentation Context — `agency` / SHAFT

| Field | Value |
|---|---|
| Module | `agency` |
| Framework | SHAFT Engine, Java 17 |
| Produced by run | `run-004__2026-08-17_14-35-25__UserStory__US-4222-UpdateAgency` |
| Detected at | 2026-08-18 |
| Detector | `platform_core/tools/mcp/stack_docs/cli.js --root modules/agency/automation/tests_SHAFT` |
| Status | **Complete, with one documentation gap recorded** |

## 1. Detected Stack

Extracted from the project, never assumed (§34.2). Source of record: `pom.xml` in the seeded module
project.

| Field | Value |
|---|---|
| Ecosystem | Maven |
| Frameworks | SHAFT Engine · TestNG |
| Language | Java 17 |
| Build | Maven, Surefire |
| Config | `testng.xml`, `testng-branch.xml`, `src/main/resources/properties/` (SHAFT) |
| Reporting | Allure (via SHAFT), `generate_allure_report.bat` |

## 2. Dependency Table

| Library | Group | Resolved version | Pinned? | Source | Queried? |
|---|---|---|---|---|---|
| `SHAFT_ENGINE` | `io.github.shafthq` | **7.4.20231015** | **yes** | `pom.xml` | **no — see §4** |
| `surefire-testng` | `org.apache.maven.surefire` | **3.1.2** | **yes** | `pom.xml` | no — build plumbing, not an imported API |

Both versions are **resolved and pinned**, not ranges. No lockfile applies (Maven resolves from the
POM's explicit versions here).

## 3. Queries Performed

**None succeeded.** One `resolve-library-id` call was attempted for `SHAFT_ENGINE`, scoped to the
concepts this generation actually needs (page-object construction, element actions, TestNG wiring,
typing with real keystrokes).

## 4. Documentation Gaps

| Gap | Detail | Consequence |
|---|---|---|
| **`context7` unavailable** | The MCP server rejected the call: *"Invalid API key. Please check your API key. API keys should start with 'ctx7sk' prefix."* No documentation was retrieved for SHAFT Engine 7.4.20231015. | Per §34.6, this is recorded and generation proceeds. **No model-memory recall is presented as fetched documentation** — the substitute authority is the existing project's own conventions (§5), which are version-accurate by construction because they compile and run against this exact pinned version. |

**Nothing was backfilled from memory.** Where this run needed to know how SHAFT is used in practice, it
read the seeded project's own code — 31 tests that pass against SHAFT 7.4.20231015 — rather than
recalling an API surface.

## 5. Guidelines Extracted — from the project, not from fetched docs

Because §4 left no fetched documentation, the generation guidelines below come from **reading the
seeded baseline's working code**. Each is a convention the existing suite already proves against this
pinned version.

| Guideline | Source in the project | Why it binds |
|---|---|---|
| **Never call `new SHAFT.GUI.WebDriver()` directly.** Construct via `BrowserSession.start()`. | `utilities/BrowserSession.java`; `AdminPages/Login/TestBase.java` | Chrome's password-manager leak detection raises a tab-modal dialog invisible to WebDriver that blocks every interaction while the driver still reports success. `BrowserSession` disables it for the throwaway profile. Documented as the root cause of weeks of intermittency |
| **Extend `TestBase`; override `navigateToStartScreen()` — never re-annotate `@BeforeMethod`.** | `AdminPages/Login/TestBase.java` | TestNG annotation inheritance makes an overridden-and-re-annotated setup easy to run twice or not at all. One annotated setup in the hierarchy removes the question |
| **Do not add a JVM warm-up driver cycle.** | `TestBase` Javadoc, 2026-08-05 | It made SHAFT's own listener report all 13 tests `Skipped` while Surefire claimed 12 PASS — a direct contradiction caused by a second WebDriver construction interfering with SHAFT's per-test driver tracking |
| **Environment values and credentials come from `EnvironmentConfig`, never inline literals.** | `utilities/EnvironmentConfig.java` | Configuration Management (§14.1). Repointing environments stays a single-file change |
| **Provision your own record, tag it, then read back the application-assigned code.** | `Branch/BranchProvisioner.java` | Mutation authorisation is per-record and must be *provable*. Directly reusable for `PO-2`/`PO-14` |
| **Never accept row 1 of a search result as "your" record.** Match identity per row. | `BranchProvisioner.codeOfExactlyThisBranch` | A result set may contain other records; approving one that is not this run's is exactly what the safety policy forbids |
| **Bound a post-create lookup by attempt count, not by a sleep.** | `BranchProvisioner.LOOKUP_ATTEMPTS = 4` | A just-submitted record is not immediately returnable by search; a record that genuinely was not created must still fail rather than loop |
| **Package/naming layout** | `src/main/java/AdminPages/Admin/{Module}/` for page objects, `src/test/java/AdminPages/Admin/{Module}/` for tests, `utilities/` for shared helpers | Matches the detected structure; `agency` mirrors `Branch`'s shape exactly |

## 6. Conflicts

| Conflict | Resolution |
|---|---|
| None between the detected stack and the project's stated framework | `knowledge_base/automation_framework.md`-level standards and the detected stack agree: SHAFT + TestNG + Allure, Java 17, Maven |

**One conflict is recorded elsewhere, not here:** the operator's Stage 4A decision was
*"module working copy, do not touch the shared baseline"*, while §11D.2's model expects shared assets in
`automation_baseline/{framework}/shared/` — a folder that does not exist for SHAFT. Resolved by operator
decision to seed the module project from the baseline via `copy-in`. Recorded in the Automation Plan's
Assumptions, because it is a repository-structure decision (§31.6), not a stack fact.
