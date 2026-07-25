# NDC — Automation Manifest — RUN-20260712-002 — SHAFT

Package location: `platform_core_data/runs/RUN-20260712-001/automation/tests_SHAFT/` (continued in place — this run's Strategy answer, per `agents/automation_agent.md` §31.4, the package's "last touched" run moves to RUN-20260712-002 without relocating its files).

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

## Added 2026-07-18 (TC-BRANCH-008)

| File | Type |
|---|---|
| `src/main/java/AdminPages/Master/PaymentGateway/PaymentMethod_Page.java` | Page Object — new, no Reference Project equivalent (first automation asset for the Master module) |
| `src/main/java/AdminPages/Admin/Branch/Branch_Page.java` | Modified — added `openEdit()`/`paymentOptionLabelPresent()` |
| `src/test/java/AdminPages/Admin/Branch/Branch_TC.java` | Modified — added `branchPaymentOptionReflectsMasterPaymentMethodStatus()` (1 new `@Test`) |
| `src/test/resources/testDataFiles/branchTestData.json` | Modified — added `paymentMethodBranchId`/`paymentMethodTestEntry` |
| `testng-branch-payment-method.xml` | New — scoped diagnostic suite for this one test, mirrors `testng-agency-create-only.xml`'s pattern |
| `src/main/java/AdminPages/Login/LogIn_Page.java` | Modified — login URL repointed `.80` → `.70` (see Known Limitations, environment split) |
| `utilities/CredentialsLoader.java` | **Bug fix, unrelated to this feature** — stale relative path (5 `../` → 4 `../`) corrected after the repo's `artifacts/runs/` → `runs/` restructuring broke it |
