# Automation Promotion Record

Per workflows_and_pipelines/pipeline/pipeline.md §12 (Automation Asset Lifecycle) — this file is
permanent run history and is never deleted by Cleanup.

> **Superseded 2026-07-24 (same day):** the destination this record describes,
> `projects/NDC/workspace/automation/shaft/NDC_tests_SHAFT_Agency/`, no longer exists as a separate
> Workspace Automation Baseline. Once the platform adopted "exactly one authoritative automation
> project per framework" (`.claude/skills/automation-agent/SKILL.md` §31.5, v8), this package's
> content was folded into `projects/NDC/workspace/automation/shaft/NDC_tests_SHAFT/` instead. This
> record remains accurate as a description of what was migrated *at the time* — see
> `../../../workspace/automation/NDC_AutomationPackages.md` Notes for the consolidation record
> (what was kept, what was ported, what was dropped, and why).

- **Promotion Status:** Bootstrap Migration
- **Merge Date:** 2026-07-24T12:51:45.822Z
- **Approved By:** N/A — Bootstrap Migration
- **Source Run:** RUN-20260718-001
- **Workspace Destination:** projects/NDC/workspace/automation/shaft/NDC_tests_SHAFT_Agency/
- **Merge Result:** Success

## Files Added
- .gitignore
- pom.xml
- src/main/java/AdminPages/Admin/AdminMenu.java
- src/main/java/AdminPages/Admin/Agency/Agency/AgencyActions_Page.java
- src/main/java/AdminPages/Admin/Agency/Agency/Agency_Page.java
- src/main/java/AdminPages/Admin/Agency/Agency/SearchAgency_Page.java
- src/main/java/AdminPages/Login/LogIn_Page.java
- src/main/java/Drive_Factory/CommonMethod.java
- src/main/java/utilities/CredentialsLoader.java
- src/main/resources/properties/cucumber.properties
- src/main/resources/properties/customWebdriverCapabilities.properties
- src/main/resources/properties/default/cucumber.properties
- src/main/resources/properties/default/customWebdriverCapabilities.properties
- src/main/resources/properties/default/log4j2.properties
- src/main/resources/properties/default/Reporting.properties
- src/main/resources/properties/default/TestNG.properties
- src/main/resources/properties/log4j2.properties
- src/main/resources/properties/TestNG.properties
- src/test/java/AdminPages/Admin/AdminTestBase.java
- src/test/java/AdminPages/Admin/Agency/Agency_Actions_TC.java
- src/test/java/AdminPages/Admin/Agency/Agency_Create_TC.java
- src/test/java/AdminPages/Admin/Agency/Agency_Search_TC.java
- src/test/java/AdminPages/Admin/Agency/Agency_Update_TC.java
- src/test/resources/META-INF/services/org.testng.ITestNGListener
- src/test/resources/testAssets/qa_spike_agency_asset.png
- src/test/resources/testAssets/qa_spike_invalid_upload.txt
- src/test/resources/testDataFiles/agencyTestData.json
- testng.xml

## Files Modified
- (none)

## Files Deleted
- (none)

## Files Renamed
- (none)

## Discarded Untracked Files
- allure-results/00c8390d-45ad-4717-b11f-a212475b8f14-container.json
- allure-results/0145071a-4ff0-4bb6-ab7e-33f6c270a101-container.json
- allure-results/0409bb8e-80a9-4b0f-b0ae-0b6d2cb47ccc-container.json
- allure-results/04463f7a-b978-4487-9603-8bc86537697c-result.json
- allure-results/050cef85-981f-4c62-b38d-bb0788a1f2f1-container.json
- allure-results/0813f47e-bb89-4d01-b966-6f8c0919be52-result.json
- allure-results/085e2d57-640e-4603-af80-eb0ebcf2e78f-container.json
- allure-results/0aa8a1a2-f5fe-4664-9772-99103211a296-attachment.properties
- allure-results/0ae4687e-0807-42c5-8328-a9e49f30de1b-attachment.txt
- allure-results/0bb45fcc-d0a4-4061-8191-eab0d82f35c0-attachment.txt
- allure-results/0c91518a-ef28-4e6f-b458-492bd493bd74-container.json
- allure-results/0e905ef0-dccb-4ea5-81f1-57ab371173c5-attachment.txt
- allure-results/0fb48da1-7995-4efb-8d7a-242505f2e6ae-result.json
- allure-results/10786af1-a802-41d0-82fb-070d0a07471d-result.json
- allure-results/10971e47-034c-44ee-8bce-8fc6876b1068-attachment.txt
- allure-results/1257adf3-a342-4533-9985-8505512c9e37-attachment.txt
- allure-results/1262219f-e9a1-41ef-bf8d-3801c2f4990d-attachment.txt
- allure-results/1461107e-8411-41b2-8e90-f57c65e541e2-attachment.txt
- allure-results/1757fa5c-1c78-47c7-ab2f-f63dc126dbca-attachment
- allure-results/18228a0e-a4eb-4bc3-bf32-f9237efc789c-attachment.txt
- allure-results/186ed0f4-00e3-42dc-b668-b196cf16bc96-attachment.txt
- allure-results/191c78e0-07f4-40a0-af77-054d9318909a-attachment.txt
- allure-results/1a0325dc-4c53-4648-bd4d-2f04d7b1c8aa-result.json
- allure-results/1a35c942-195a-40cb-b3cb-1e55f8b59a3a-attachment.txt
- allure-results/1b2f2064-fb85-4f23-b080-3046d8a52b9b-attachment.txt
- allure-results/1c4ec5c5-f2c4-4dea-89b2-5cbcadd04d0f-attachment.txt
- allure-results/1f562496-028b-4335-8a0d-51050bf3e6c6-container.json
- allure-results/205a5e9b-c8ab-43de-9c63-4078d4cb67ef-attachment.txt
- allure-results/20d827bd-9f11-4b31-acea-fbcca5d49db8-attachment.txt
- allure-results/20ee9a8b-163c-48f4-934f-b40c45b21649-container.json
- allure-results/22b85c87-9506-4c1d-ad75-3fe99dbbb843-container.json
- allure-results/24b30873-6e7f-4661-ad40-ed6ac361fa2b-container.json
- allure-results/25ba7564-8572-4e19-b6fa-f24c4ce499aa-result.json
- allure-results/268370d0-d4c0-418f-8c94-4b33bf6bd098-container.json
- allure-results/27a9ba53-ae0a-4afe-b397-d13828622eaf-attachment.png
- allure-results/2c25d147-6667-4684-b31d-9ed6977e6a25-container.json
- allure-results/2c6ce2d6-224f-440c-8d2b-5ca3e6c00a6a-container.json
- allure-results/2cfc4661-8d17-4b9e-8792-ccc60ddcfa54-attachment.txt
- allure-results/2d474865-9a81-4e8a-95eb-d71a5ee1b3ad-attachment.txt
- allure-results/2e33bdc4-bff4-436f-9e00-19e1fc3bf166-container.json
- allure-results/2f57485a-d7f2-46ee-9c26-d9296157ee9a-attachment.txt
- allure-results/31353dae-479b-4161-bdfb-5406af67487d-attachment
- allure-results/31b6a2c3-7fc2-4a3f-a268-f2ec004f7ffd-attachment.txt
- allure-results/32781496-c8c2-4f69-a85f-2035fed9b48f-attachment.txt
- allure-results/354fb680-8b0c-4724-a96a-2e586b9fe5af-attachment.txt
- allure-results/35a0fb11-a4b8-4769-801e-63fa2018860f-attachment.txt
- allure-results/35b5f9df-2bdc-4867-8fd3-8efdeb3cf7b0-container.json
- allure-results/3a5f41cc-ff6c-421d-8ee3-01f851e867ef-attachment.txt
- allure-results/3d41b79d-1da0-4a55-bdfd-6c872cead374-attachment.txt
- allure-results/3e915b28-40ba-4789-9cce-e386cb867b91-container.json
- allure-results/413380b5-9aca-40ad-a8ba-d1c2679779f1-result.json
- allure-results/43357150-3562-4ad8-b2c6-e57cfd4d4451-attachment.txt
- allure-results/449f0c2e-a572-49ea-8c10-129405dbc5bb-container.json
- allure-results/44a03e3f-b7ef-4416-bf17-66923cb32190-attachment.txt
- allure-results/457ea6c0-64c3-4dc2-94f5-11eb50ec7a91-container.json
- allure-results/470e2315-477c-4338-9a87-4e56da63b564-container.json
- allure-results/4866046f-4348-4bcf-864a-35223e680252-attachment.txt
- allure-results/4b33d9bb-0fcf-41d5-8e04-cfaa7a4d39cc-container.json
- allure-results/4b5a923c-4cbe-4fe8-b92f-d1dae95ada5e-attachment.txt
- allure-results/4ce703af-1d64-4696-a511-b1e9f4a057e7-container.json
- allure-results/4ec92881-3a05-441f-992d-c06dd71a1957-attachment.txt
- allure-results/4efdfb45-2f3f-45c0-9c61-43d0fa3ef3d6-attachment.txt
- allure-results/502af24b-8bfc-47dc-b2b6-9185de471940-attachment.txt
- allure-results/51072fc2-617c-4455-ae6c-dbb9645fe497-attachment.txt
- allure-results/538b821b-a470-429c-925b-bbdee325a447-attachment.png
- allure-results/5401e185-491d-4de8-91c9-305ae2ff26fa-result.json
- allure-results/550b4733-178d-4e79-a55b-daf7f623b2a2-attachment.txt
- allure-results/5525672d-14e3-4da1-894d-248e31bf6808-container.json
- allure-results/55666e63-82a2-4492-8e73-adb394d5a476-attachment
- allure-results/57feb456-c4d8-44f6-b22f-cbd9a8b9291b-attachment.txt
- allure-results/586f141b-e53f-4adc-bfb6-63976af0b1bd-attachment.html
- allure-results/59041877-7a99-440f-9bbf-89196d6063ae-attachment.txt
- allure-results/5a331e4d-6b6f-4cee-8ec1-aa60d31a82a9-attachment.txt
- allure-results/5b04753f-ad96-49cc-a8ef-2f3697c185e8-result.json
- allure-results/5b0ae7b5-754c-4d59-aacf-4e8d023e51e7-attachment.txt
- allure-results/5da45379-8507-453c-ad98-e8524cad6e49-result.json
- allure-results/5ea72763-2518-48a1-a707-aa4418fe0dec-container.json
- allure-results/603d515c-8e23-43db-b32d-7d39f809e286-attachment.txt
- allure-results/60d5dfc4-4ec2-4dc8-b894-373d05707954-container.json
- allure-results/61395e87-e2ca-49b0-a95e-de707300a764-attachment.png
- allure-results/615cd6da-9a64-4fd1-856b-c5d4278558ed-result.json
- allure-results/61b28112-a3f9-4e5d-988c-d1bea3939e69-attachment.txt
- allure-results/61d38041-d290-449a-832a-db1a66fd4b07-container.json
- allure-results/6430f6b6-0b71-4b34-ba4c-a00e4d31fc18-result.json
- allure-results/64d31754-fdc6-4132-98b8-dfdfb410ab99-result.json
- allure-results/6570eb88-4a7f-4dc7-a0be-19c4472b9fcd-attachment.txt
- allure-results/683a3f06-4d5d-41e5-9589-e0fcd432886d-attachment
- allure-results/6a4d04ad-096d-4a98-8a3b-f68cf11b2a8b-container.json
- allure-results/6baf235f-74c7-41e9-be45-8ff558cc5ff8-attachment.txt
- allure-results/6ed3ba10-f0be-4334-8404-8582850db14c-result.json
- allure-results/71d04d4c-b2f0-43b2-8d5e-a4fd017d017b-attachment.txt
- allure-results/72b7ef4b-9a72-44a6-9b9b-015f7de0c6cb-attachment.png
- allure-results/73677dc9-1c4c-4661-844a-57a9ba7c9e9b-container.json
- allure-results/73fb1bf8-d4ba-4295-b8d5-9c405fc518fd-result.json
- allure-results/7463402e-7d96-4a8a-b5b9-afcce9bec15c-attachment.txt
- allure-results/749434bd-a008-4640-9fa7-22c9a1cc3d7c-result.json
- allure-results/7537a48f-f021-413f-8e66-0f1c5d509bda-attachment.txt
- allure-results/75d1b675-5c46-4f02-9431-4b24166b4960-attachment.txt
- allure-results/77f538a6-575f-475f-9a56-ca43cdfbe8e8-result.json
- allure-results/7de8163c-6e01-45cf-a3c0-755230834309-attachment.txt
- allure-results/7e3c1f68-786b-418c-b248-f1d5b751d295-result.json
- allure-results/7e799102-2731-40ca-8b9c-8ad02231f771-container.json
- allure-results/7f160d58-2b3e-4f31-bf0d-3f37d52ebb90-attachment.properties
- allure-results/809a851c-6cfa-45a4-8ccb-c3645a898c65-attachment.txt
- allure-results/80d9fe25-2867-4db5-9d0f-195b8034f99c-container.json
- allure-results/80e4decc-2f4c-49c8-84fa-9209bf202dc6-container.json
- allure-results/817b51fa-c4d0-47da-8a17-d4248e46a5fe-attachment.txt
- allure-results/81e82369-596b-4b4a-b469-191b9a8e7af7-attachment.txt
- allure-results/84639229-697f-4429-88a9-484c5b63bee0-attachment.txt
- allure-results/84955fcc-8c41-4f1b-9070-cbbe54dd777d-result.json
- allure-results/849720aa-110e-491f-847e-e63e479a493b-container.json
- allure-results/879ad486-bf9c-45a0-9715-5ae94c4dc1a2-container.json
- allure-results/87fa6aad-3fba-4ec5-b4cb-3f03cbddab41-attachment.png
- allure-results/88d47399-efc1-4541-89a9-2fe8e16b9a84-container.json
- allure-results/8ea86beb-72c6-4487-b889-f24d796e03c1-container.json
- allure-results/8eff47ac-92e9-4efa-b45b-066535ddee63-attachment.html
- allure-results/902a904f-538f-4f84-8dbb-bfbbb18383e4-attachment.png
- allure-results/9649247a-3e8d-46b6-b9e2-60751e69e01f-attachment.txt
- allure-results/993d0eaa-f60e-4360-bd67-7de011d4473f-container.json
- allure-results/995b544d-91aa-4b74-abbd-efbdd97b7539-container.json
- allure-results/99c7a5e5-3e5c-4484-953b-b945939df7bc-attachment.txt
- allure-results/9c621775-9e62-4964-bb32-f0cfe04a4fa9-attachment.txt
- allure-results/9e7340bb-6bf1-41c3-989d-d48f16d22d62-attachment.csv
- allure-results/a04eb287-de62-4890-b225-8020b1f53f62-attachment.txt
- allure-results/a116a872-6b02-4a6c-9b7d-afa31ae4df0e-container.json
- allure-results/a151be40-a48a-4ff6-9ac1-b72e855af975-attachment.txt
- allure-results/a2968136-78e6-4766-910b-151f0587ecfb-attachment.properties
- allure-results/a45b2ba9-6778-4967-8907-e7d6dd961f97-attachment
- allure-results/a465faef-3ecf-4b14-aab3-1dcbfeec0a0c-result.json
- allure-results/a50d7b6c-8681-4eb2-b6a3-3a95c288efeb-attachment
- allure-results/a5896552-f4c2-4328-b487-96750cb763bf-container.json
- allure-results/a6497e2e-da99-438c-b566-1edbe0129efa-attachment.txt
- allure-results/a81e8f88-bbde-44ff-858d-73225b2d64ed-attachment.txt
- allure-results/a88f9f8c-fe14-4a82-918c-50d3b6c10d28-result.json
- allure-results/a8ae98fd-6cd4-4aee-a3c5-dea75e59bbe0-container.json
- allure-results/a97b3406-3bfd-426c-848b-74bc75427431-attachment.txt
- allure-results/aa54cf89-cad8-4bd1-84e3-ce95bf40d95e-container.json
- allure-results/aa627039-6021-48c2-b6f9-07643d1bc71a-attachment.txt
- allure-results/aab963d2-88f7-4a2c-8415-ab21e5776d6a-attachment.txt
- allure-results/aaf99754-5314-47f2-9c06-2b41e3dddc3b-result.json
- allure-results/ada275c9-40be-4bb6-b25d-8c295f8e6ed0-attachment
- allure-results/adb468f8-921e-4de3-89f7-3b811b0943cb-attachment
- allure-results/aed2cf3d-e815-4c21-bad8-8afd1be1c911-attachment.properties
- allure-results/afc48fd1-379a-4b78-99e6-dd3c45b8ffe8-attachment.txt
- allure-results/b20a9841-78ae-429d-9498-5b622ae346db-result.json
- allure-results/b3d78ef9-6a2b-4a44-b23f-00f9d94b1af1-container.json
- allure-results/b52324ee-7592-4043-9797-b074f240a7c6-attachment.txt
- allure-results/b54483b2-6bbf-4c86-ac12-722664ea148d-attachment.txt
- allure-results/b5f64aee-cffb-4c6d-b90d-e7b54bfa0e81-attachment.txt
- allure-results/b634e273-494c-435c-9340-0eb692e41323-attachment.txt
- allure-results/b9ac573a-09f1-44c5-9cce-e98edfeb9d4e-container.json
- allure-results/be99a01c-8162-4ec7-8a11-985a3b0a1fe5-attachment.txt
- allure-results/bf092446-02fe-437c-9eed-e110795528a9-container.json
- allure-results/bf2ccff2-187d-4d9b-ac9b-c1b44fdab399-attachment
- allure-results/bfd908a7-e36e-4511-b662-0856cd48342d-attachment.png
- allure-results/c01b8201-a89c-4076-aea2-f90b05abc5ea-result.json
- allure-results/c8569e45-9102-44a8-878c-83f7ec03bb9c-attachment.txt
- allure-results/c9707cc3-145f-417a-a53e-bba2f1c927b2-attachment.png
- allure-results/cb92878a-58ad-4b31-b504-e2337ed9232d-container.json
- allure-results/cbd9831f-f34f-4bae-ac61-4243a5f945c4-container.json
- allure-results/cc34c372-0a10-44d6-9db8-047a4a9bc26d-attachment.txt
- allure-results/ce71c396-1f5b-4fdb-9e32-8ccf0aafc624-container.json
- allure-results/d075b0bd-c13a-4725-98c2-4f6e9224dce7-attachment
- allure-results/d346467a-9625-49c6-85ae-12511461dc60-attachment.txt
- allure-results/d46f06ee-47ff-4238-8130-a1a4db41828d-attachment.txt
- allure-results/d72e7f15-6278-4e2d-a534-906c892a6aa2-attachment.txt
- allure-results/d81ebaa6-f2cb-4682-8526-cc113c84f9bc-attachment.txt
- allure-results/d87e95d3-b022-4335-af10-45297dbc9c05-container.json
- allure-results/d8c8c7fc-4062-4d3c-b743-7aa5ee019f5f-container.json
- allure-results/db5868c9-50b9-4503-a689-38e2dd1824ea-attachment.txt
- allure-results/dcb36305-3b68-437d-bd83-6ebef995c0ad-container.json
- allure-results/dd5909a8-649d-4daa-8dfc-4875f25fd99b-attachment.txt
- allure-results/de01380c-2089-413a-9ae7-fd3451e1d559-attachment.txt
- allure-results/df249e99-0c1d-4e30-a52f-141fb2d6aa85-attachment.txt
- allure-results/e06ad12e-0e45-4063-938e-5491665607e7-attachment.txt
- allure-results/e0870951-dc8a-4d5e-a273-971aa3ad30ae-container.json
- allure-results/e08f456c-d4b2-4150-b91c-fb2c26c2b3c5-attachment.png
- allure-results/e2957e9d-81fa-4e27-8792-001dd5b5c5d0-container.json
- allure-results/e339e08c-c854-436e-94a4-2bf25f823436-attachment.txt
- allure-results/e53e8d8d-cb47-4d80-99f0-33aae65f7eff-container.json
- allure-results/e58a7ad4-8f59-4d88-bd9a-e1ee50d1af67-attachment.txt
- allure-results/e80b73e0-3243-4e52-9e31-7b695c65455a-container.json
- allure-results/e99ab463-e1e0-471c-a67a-38291af0ecbf-container.json
- allure-results/eba8b997-45dc-4a78-a9c6-319ad08d6a9b-result.json
- allure-results/ebe976a7-4525-4397-b109-ccc3260d2aa3-attachment.txt
- allure-results/eceb1544-3322-49e8-9874-272f43cd46f0-attachment.txt
- allure-results/ef504e19-0efc-44a4-9d2e-0aa6f573c53f-attachment.txt
- allure-results/environment.xml
- allure-results/f12a2b5c-52ac-44a9-934e-9f89b15ec6a0-container.json
- allure-results/f14734e6-01f0-459e-915d-ed12282bcae9-attachment
- allure-results/f420abd0-af22-40f5-b60b-d70bc0e4603c-attachment.txt
- allure-results/f541752e-4a3e-4ac1-9620-0a1e43ce6984-container.json
- allure-results/f5910e41-6d63-46c8-a82b-c40cb21524c3-attachment.png
- allure-results/f696c785-f35b-4e1f-9fb2-f63768e940e4-container.json
- allure-results/f812d309-c596-41c8-b8b3-50a50d46a42d-result.json
- allure-results/f84c124a-81e1-4615-b82a-0a7466cdcb8a-result.json
- allure-results/f8599dcf-950d-480e-b5a4-69819fb36f8a-container.json
- allure-results/fa79316f-a8b2-47c2-a3f2-647fbc3483f6-container.json
- allure-results/fe2d9a99-22ef-428b-9840-a0860c1a2c66-attachment.txt
- allure-results/ff51d5ad-04d7-4b9f-ba01-75d7f7f6f812-result.json
- allure-results/ffb86c11-73a8-442b-bb73-18f7a5922451-attachment.txt
- execution-summary/ExecutionSummaryReport_23-07-2026_20-15-24-0795-PM.html
- generatedReport_20260718-175642.zip
- generatedReport_20260723-201523.zip
- generate_allure_report.bat
- target/classes/AdminPages/Admin/AdminMenu.class
- target/classes/AdminPages/Admin/Agency/Agency/AgencyActions_Page.class
- target/classes/AdminPages/Admin/Agency/Agency/Agency_Page.class
- target/classes/AdminPages/Admin/Agency/Agency/SearchAgency_Page.class
- target/classes/AdminPages/Login/LogIn_Page.class
- target/classes/Drive_Factory/CommonMethod.class
- target/classes/properties/cucumber.properties
- target/classes/properties/customWebdriverCapabilities.properties
- target/classes/properties/default/cucumber.properties
- target/classes/properties/default/customWebdriverCapabilities.properties
- target/classes/properties/default/log4j2.properties
- target/classes/properties/default/Reporting.properties
- target/classes/properties/default/TestNG.properties
- target/classes/properties/log4j2.properties
- target/classes/properties/TestNG.properties
- target/classes/utilities/CredentialsLoader.class
- target/logs/log4j.log
- target/maven-status/maven-compiler-plugin/compile/default-compile/createdFiles.lst
- target/maven-status/maven-compiler-plugin/compile/default-compile/inputFiles.lst
- target/maven-status/maven-compiler-plugin/testCompile/default-testCompile/createdFiles.lst
- target/maven-status/maven-compiler-plugin/testCompile/default-testCompile/inputFiles.lst
- target/test-classes/AdminPages/Admin/AdminTestBase.class
- target/test-classes/AdminPages/Admin/Agency/Agency_Actions_TC.class
- target/test-classes/AdminPages/Admin/Agency/Agency_Create_TC.class
- target/test-classes/AdminPages/Admin/Agency/Agency_Search_TC.class
- target/test-classes/AdminPages/Admin/Agency/Agency_Update_TC.class
- target/test-classes/META-INF/services/org.testng.ITestNGListener
- target/test-classes/testAssets/qa_spike_agency_asset.png
- target/test-classes/testAssets/qa_spike_invalid_upload.txt
- target/test-classes/testDataFiles/agencyTestData.json

## Conflicts Detected
- (none)

## Conflicts Resolved
- (none)

## Notes

Bootstrap Migration Acknowledgment — pre-existing content relocated from this run into the new Workspace Automation Baseline (workflows_and_pipelines/pipeline/pipeline.md §12), not yet reviewed against pipeline.md §5.2 Automation Approval criteria. This package remains Pending Automation Approval exactly as it was before migration — only its storage location changed. NDC_tests_SHAFT_Agency was generated as an independent package (not an extension of NDC_tests_SHAFT), per the human decision recorded at this run's Framework/Strategy Decision Gate.
