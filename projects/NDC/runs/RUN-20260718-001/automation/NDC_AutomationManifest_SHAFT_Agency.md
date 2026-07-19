# NDC — Automation Manifest (Agency, SHAFT, new package) — RUN-20260718-001

Package: `NDC_tests_SHAFT_Agency` (this run's folder, `runs/RUN-20260718-001/automation/NDC_tests_SHAFT_Agency/`).

## Scaffold — Reused verbatim (copied from `NDC_tests_SHAFT`, RUN-20260712-001/002)

| File | Origin |
|---|---|
| `pom.xml` | Adapted (new `artifactId`, same dependencies/plugins) |
| `src/main/java/Drive_Factory/CommonMethod.java` | Copied verbatim |
| `src/main/java/AdminPages/Login/LogIn_Page.java` | Copied verbatim (still targets `.70`, consistent with this run's environment override) |
| `src/main/java/AdminPages/Admin/AdminMenu.java` | Copied verbatim |
| `src/test/java/AdminPages/Admin/AdminTestBase.java` | Copied verbatim |
| `src/main/java/utilities/CredentialsLoader.java` | Copied verbatim |
| `src/main/resources/properties/**`, `src/test/resources/META-INF/services/org.testng.ITestNGListener`, `.gitignore` | Copied verbatim |
| `src/test/resources/testAssets/qa_spike_agency_asset.png` | Copied verbatim |

## Reused (existing Agency-specific assets, extended not replaced)

| File | Origin | Extension this run |
|---|---|---|
| `Agency_Page.java` | `NDC_tests_SHAFT` (RUN-20260712-002) | + Company URL, Fax No, IATA radio, Payment Settings (Credit Limit/Top-Up Limit/Credit Terms/Reaching %/Warning Prompt/Credit Agency/full Payment Option set), Product Access (Select Product), Agency Features (Import PNR/Transfer PNR/Blue Command Screen), Cancel button, first-Invoice-option helper |
| `SearchAgency_Page.java` | `NDC_tests_SHAFT` (RUN-20260713-001) | + Agency Code, Country/State/City multiselects, Active/Inactive radios, Add-agency button |

## Generated (new this run)

| File | Purpose |
|---|---|
| `src/main/java/AdminPages/Admin/Agency/Agency/AgencyActions_Page.java` | New page object — grid Actions column (pencil/thumbs-up/thumbs-down, remark popup) |
| `src/test/java/AdminPages/Admin/Agency/Agency_Create_TC.java` | 28 `@Test` methods — CREATE-001 (Reuse, ported), CREATE-002/003/005/006/007/008/009/010/011/012/013/014/017/018/025/026/027/029/034/036/038/039 (Generate), CREATE-004/015/019/020/028 (Partially Automatable) |
| `src/test/java/AdminPages/Admin/Agency/Agency_Search_TC.java` | 9 `@Test` methods — SEARCH-002 (Reuse, ported), SEARCH-001/003/004/005/006/007/008/009 (Generate) |
| `src/test/java/AdminPages/Admin/Agency/Agency_Actions_TC.java` | 9 `@Test` methods — ACTIONS-001 through -009 (Generate) |
| `src/test/java/AdminPages/Admin/Agency/Agency_Update_TC.java` | 7 `@Test` methods — UPDATE-001/002/003/004 (Generate), UPDATE-005/006/007 (Partially Automatable) |
| `src/test/resources/testDataFiles/agencyTestData.json` | Fixture data — happy path (env-corrected for `.70`) + every new field's positive/negative data + `.70` search fixtures |
| `src/test/resources/testAssets/qa_spike_invalid_upload.txt` | Non-PDF/non-image asset for negative upload tests |
| `testng.xml` | 4-suite TestNG runner (Create/Search/Actions/Update) |

## Not generated (Blocked/Deferred/Manual Only/Superseded — see Automation Plan)

CREATE-016/021/022/023/024 (Blocked), CREATE-030/031/032/033/035 (Deferred, FINDING-008), ACTIONS-010 (Manual Only), CREATE-037/SEARCH-010 (Superseded/N/A, already retired by the Test Design itself).
