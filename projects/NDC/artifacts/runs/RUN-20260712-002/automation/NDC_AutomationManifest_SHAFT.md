# NDC — Automation Manifest — RUN-20260712-002 — SHAFT

Package location: `projects/NDC/artifacts/runs/RUN-20260712-001/automation/NDC_tests_SHAFT/` (continued in place — this run's Strategy answer, per `agents/automation_agent.md` §31.4, the package's "last touched" run moves to RUN-20260712-002 without relocating its files).

## New files (this run)

| File | Type |
|---|---|
| `src/main/java/AdminPages/Admin/AdminMenu.java` | Page/nav helper — reused from Reference Project |
| `src/main/java/AdminPages/Admin/Branch/Branch_Page.java` | Page Object — reused (Add form) + new (`Btn_Edit`/`Icn_ThumbDown`) |
| `src/main/java/AdminPages/Admin/Agency/Agency/Agency_Page.java` | Page Object — new, fresh from this run's Discovery |
| `src/main/java/AdminPages/Admin/Staff_Page.java` | Page Object — reused/trimmed from Reference Project |
| `src/test/java/AdminPages/Admin/AdminTestBase.java` | Test base — new |
| `src/test/java/AdminPages/Admin/Branch/Branch_TC.java` | Test class — new (6 `@Test` methods) |
| `src/test/java/AdminPages/Admin/Agency/Agency_TC.java` | Test class — new (4 `@Test` methods) |
| `src/test/java/AdminPages/Admin/Staff/Staff_TC.java` | Test class — new (4 `@Test` methods) |
| `src/test/resources/testDataFiles/branchTestData.json` | Test data — new |
| `src/test/resources/testDataFiles/agencyTestData.json` | Test data — new |
| `src/test/resources/testDataFiles/staffTestData.json` | Test data — new |
| `testng.xml` | Modified — 3 new `<test>` entries added (Branch/Agency/Staff), existing Login entry untouched |

## Unmodified (existing, from RUN-20260712-001)

`AdminPages/Login/*` (LogIn_Page.java, LogIn_TC.java, TestBase.java), `Drive_Factory/CommonMethod.java`, `utilities/CredentialsLoader.java`, `pom.xml`, resource properties files — none of these were touched this run.
