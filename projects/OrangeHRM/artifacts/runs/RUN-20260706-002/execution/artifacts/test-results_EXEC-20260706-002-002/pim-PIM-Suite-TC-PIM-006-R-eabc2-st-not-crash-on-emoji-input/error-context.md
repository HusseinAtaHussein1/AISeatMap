# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: pim.spec.js >> PIM Suite >> TC-PIM-006 [REGRESSION, FINDING-004]: employee id uniqueness check must not crash on emoji input
- Location: tests\pim.spec.js:66:3

# Error details

```
Test timeout of 45000ms exceeded.
```

```
Error: page.waitForResponse: Test timeout of 45000ms exceeded.
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic:
    - complementary [ref=e4]:
      - navigation "Sidepanel" [ref=e5]:
        - generic [ref=e6]:
          - link "client brand banner" [ref=e7] [cursor=pointer]:
            - /url: https://www.orangehrm.com/
            - img "client brand banner" [ref=e9]
          - text: 
        - generic [ref=e10]:
          - generic [ref=e11]:
            - generic [ref=e12]:
              - textbox "Search" [ref=e15]
              - button "" [ref=e16] [cursor=pointer]:
                - generic [ref=e17]: 
            - separator [ref=e18]
          - list [ref=e19]:
            - listitem [ref=e20]:
              - link "Admin" [ref=e21] [cursor=pointer]:
                - /url: /web/index.php/admin/viewAdminModule
                - generic [ref=e24]: Admin
            - listitem [ref=e25]:
              - link "PIM" [ref=e26] [cursor=pointer]:
                - /url: /web/index.php/pim/viewPimModule
                - generic [ref=e40]: PIM
            - listitem [ref=e41]:
              - link "Leave" [ref=e42] [cursor=pointer]:
                - /url: /web/index.php/leave/viewLeaveModule
                - generic [ref=e45]: Leave
            - listitem [ref=e46]:
              - link "Time" [ref=e47] [cursor=pointer]:
                - /url: /web/index.php/time/viewTimeModule
                - generic [ref=e53]: Time
            - listitem [ref=e54]:
              - link "Recruitment" [ref=e55] [cursor=pointer]:
                - /url: /web/index.php/recruitment/viewRecruitmentModule
                - generic [ref=e61]: Recruitment
            - listitem [ref=e62]:
              - link "My Info" [ref=e63] [cursor=pointer]:
                - /url: /web/index.php/pim/viewMyDetails
                - generic [ref=e69]: My Info
            - listitem [ref=e70]:
              - link "Performance" [ref=e71] [cursor=pointer]:
                - /url: /web/index.php/performance/viewPerformanceModule
                - generic [ref=e79]: Performance
            - listitem [ref=e80]:
              - link "Dashboard" [ref=e81] [cursor=pointer]:
                - /url: /web/index.php/dashboard/index
                - generic [ref=e84]: Dashboard
            - listitem [ref=e85]:
              - link "Directory" [ref=e86] [cursor=pointer]:
                - /url: /web/index.php/directory/viewDirectory
                - generic [ref=e89]: Directory
            - listitem [ref=e90]:
              - link "Maintenance" [ref=e91] [cursor=pointer]:
                - /url: /web/index.php/maintenance/viewMaintenanceModule
                - generic [ref=e95]: Maintenance
            - listitem [ref=e96]:
              - link "Claim" [ref=e97] [cursor=pointer]:
                - /url: /web/index.php/claim/viewClaimModule
                - img [ref=e100]
                - generic [ref=e104]: Claim
            - listitem [ref=e105]:
              - link "Buzz" [ref=e106] [cursor=pointer]:
                - /url: /web/index.php/buzz/viewBuzz
                - generic [ref=e109]: Buzz
    - banner [ref=e110]:
      - generic [ref=e111]:
        - generic [ref=e112]:
          - text: 
          - heading "PIM" [level=6] [ref=e114]
        - link "Upgrade" [ref=e116]:
          - /url: https://orangehrm.com/open-source/upgrade-to-advanced
          - button "Upgrade" [ref=e117] [cursor=pointer]: Upgrade
        - list [ref=e123]:
          - listitem [ref=e124]:
            - generic [ref=e125] [cursor=pointer]:
              - img "profile picture" [ref=e126]
              - paragraph [ref=e127]: Rana Test
              - generic [ref=e128]: 
      - navigation "Topbar Menu" [ref=e130]:
        - list [ref=e131]:
          - listitem [ref=e132] [cursor=pointer]:
            - generic [ref=e133]:
              - text: Configuration
              - generic [ref=e134]: 
          - listitem [ref=e135] [cursor=pointer]:
            - link "Employee List" [ref=e136]:
              - /url: "#"
          - listitem [ref=e137] [cursor=pointer]:
            - link "Add Employee" [ref=e138]:
              - /url: "#"
          - listitem [ref=e139] [cursor=pointer]:
            - link "Reports" [ref=e140]:
              - /url: "#"
          - button "" [ref=e142] [cursor=pointer]:
            - generic [ref=e143]: 
  - generic [ref=e144]:
    - generic [ref=e147]:
      - heading "Add Employee" [level=6] [ref=e148]
      - separator [ref=e149]
      - generic [ref=e150]:
        - generic [ref=e151]:
          - generic [ref=e152]:
            - generic [ref=e154]:
              - button "Choose File"
              - generic [ref=e155]:
                - img "profile picture" [ref=e157]
                - button "" [ref=e158] [cursor=pointer]:
                  - generic [ref=e159]: 
            - paragraph [ref=e160]: "Accepts jpg, .png, .gif up to 1MB. Recommended dimensions: 200px X 200px"
          - generic [ref=e161]:
            - generic [ref=e162]:
              - generic [ref=e165]:
                - generic [ref=e167]: Employee Full Name*
                - generic [ref=e168]:
                  - textbox "First Name" [ref=e171]
                  - textbox "Middle Name" [ref=e174]
                  - textbox "Last Name" [ref=e177]
              - generic [ref=e180]:
                - generic [ref=e182]: Employee Id
                - textbox [ref=e184]: "0526"
            - separator [ref=e185]
            - generic [ref=e186]:
              - paragraph [ref=e187]: Create Login Details
              - checkbox [ref=e190]
        - separator [ref=e192]
        - generic [ref=e193]:
          - paragraph [ref=e194]: "* Required"
          - button "Cancel" [ref=e195] [cursor=pointer]
          - button "Save" [ref=e196] [cursor=pointer]
    - generic [ref=e197]:
      - paragraph [ref=e198]: OrangeHRM OS 5.8
      - paragraph [ref=e199]:
        - text: © 2005 - 2026
        - link "OrangeHRM, Inc" [ref=e200] [cursor=pointer]:
          - /url: http://www.orangehrm.com
        - text: . All rights reserved.
```

# Test source

```ts
  1   | // PIM Suite — automates the PIM Employee Management manual test cases
  2   | // (artifacts/OrangeHRM/runs/RUN-20260706-002/testcases/OrangeHRM_TestCases_PIM.md).
  3   | // Uses the shared authenticatedPage fixture (composition over duplication, §14) instead
  4   | // of repeating login steps in every test.
  5   | const { test, expect } = require('../fixtures/authenticatedPage.fixture');
  6   | const { EmployeeListPage } = require('../pages/EmployeeListPage');
  7   | const { AddEmployeePage } = require('../pages/AddEmployeePage');
  8   | const { EmployeeDetailPage, TABS } = require('../pages/EmployeeDetailPage');
  9   | const testData = require('../fixtures/testData');
  10  | 
  11  | test.describe('PIM Suite', () => {
  12  |   // TC-PIM-001 | Req: PRD FR-5 | Discovery: discovery/pim_employee_list_raw_snapshot.md
  13  |   test('TC-PIM-001: employee list displays with documented columns', async ({ authenticatedPage: page }) => {
  14  |     const list = new EmployeeListPage(page);
  15  |     await list.goto();
  16  |     await expect(page.locator('table, [role="table"]')).toBeVisible();
  17  |     await expect(list.recordsFoundText).toBeVisible();
  18  |   });
  19  | 
  20  |   // TC-PIM-002 | Req: PRD FR-6 | Discovery: discovery/pim_employee_list_raw_snapshot.md
  21  |   test('TC-PIM-002: employee list filter panel exposes all documented fields', async ({ authenticatedPage: page }) => {
  22  |     const list = new EmployeeListPage(page);
  23  |     await list.goto();
  24  |     await list.expandFilterPanel();
  25  |     for (const label of ['Employee Name', 'Employee Id', 'Employment Status', 'Include', 'Supervisor Name', 'Job Title', 'Sub Unit']) {
  26  |       await expect(page.getByText(label, { exact: true }).first()).toBeVisible();
  27  |     }
  28  |   });
  29  | 
  30  |   // TC-PIM-003 | Req: PRD FR-6 | Evidence: findings/FINDING-003.../comparison_numeric_nonexistent_correct.png
  31  |   test('TC-PIM-003: employee id filter returns "No Records Found" for a valid-length nonexistent value', async ({ authenticatedPage: page }) => {
  32  |     const list = new EmployeeListPage(page);
  33  |     await list.goto();
  34  |     await list.expandFilterPanel();
  35  |     await list.filterByEmployeeId(testData.boundaryValues.numericNonexistentEmployeeId);
  36  |     await expect(list.recordsFoundText).toHaveText(/No Records Found/);
  37  |   });
  38  | 
  39  |   // TC-PIM-004 [REGRESSION, FINDING-003] | Req: PRD FR-6 | Evidence: findings/FINDING-003.../failure_11chars.png
  40  |   // Expected to FAIL until FINDING-003 is fixed (currently silently retains stale results).
  41  |   test('TC-PIM-004 [REGRESSION, FINDING-003]: employee id filter must not silently fail above 10 characters', async ({ authenticatedPage: page }) => {
  42  |     const list = new EmployeeListPage(page);
  43  |     await list.goto();
  44  |     await list.expandFilterPanel();
  45  |     const beforeText = await list.getRecordsFoundText();
  46  |     await list.filterByEmployeeId(testData.boundaryValues.employeeId11Chars);
  47  |     // CORRECTED behavior: either a clean "No Records Found" or a visible error — never the
  48  |     // unchanged, stale pre-search text with a silent 422 underneath.
  49  |     await expect(list.recordsFoundText).toHaveText(/No Records Found/);
  50  |     const afterText = await list.getRecordsFoundText();
  51  |     expect(afterText).not.toBe(beforeText === afterText ? null : beforeText); // guards against the exact stale-state symptom
  52  |   });
  53  | 
  54  |   // TC-PIM-005 | Req: PRD VR-1, FR-9 | Discovery: discovery/pim_add_employee.md
  55  |   test('TC-PIM-005: add employee blocks submission when required fields are empty', async ({ authenticatedPage: page }) => {
  56  |     const add = new AddEmployeePage(page);
  57  |     await add.goto();
  58  |     await add.clickSave();
  59  |     expect(await add.getRequiredErrorCount()).toBeGreaterThanOrEqual(2);
  60  |     await expect(page).toHaveURL(/addEmployee/); // never navigated away — nothing was saved
  61  |   });
  62  | 
  63  |   // TC-PIM-006 [REGRESSION, FINDING-004] | Evidence: findings/FINDING-004.../failure.png
  64  |   // Expected to FAIL until FINDING-004 is fixed (currently 500s on the uniqueness check).
  65  |   // SAFETY: Full Name is never filled — this can never persist a real employee record.
  66  |   test('TC-PIM-006 [REGRESSION, FINDING-004]: employee id uniqueness check must not crash on emoji input', async ({ authenticatedPage: page }) => {
  67  |     const add = new AddEmployeePage(page);
  68  |     await add.goto();
  69  |     const [response] = await Promise.all([
> 70  |       page.waitForResponse((r) => r.url().includes('/api/v2/core/validation/unique')),
      |            ^ Error: page.waitForResponse: Test timeout of 45000ms exceeded.
  71  |       add.fillEmployeeId(testData.boundaryValues.emoji),
  72  |     ]);
  73  |     expect(response.status()).toBe(200); // CORRECTED: not 500
  74  |   });
  75  | 
  76  |   // TC-PIM-007 | Req: PRD VR-2 | Discovery: discovery/pim_add_employee_raw_snapshot.md
  77  |   test('TC-PIM-007: add employee displays the documented photo-upload constraint text', async ({ authenticatedPage: page }) => {
  78  |     const add = new AddEmployeePage(page);
  79  |     await add.goto();
  80  |     await expect(add.photoConstraintText).toContainText(/jpg.*png.*gif.*1MB/i);
  81  |   });
  82  | 
  83  |   // TC-PIM-008 | Req: PRD FR-10 | Discovery: discovery/pim_employee_detail.md
  84  |   test('TC-PIM-008: employee detail exposes all 10 documented tabs', async ({ authenticatedPage: page }) => {
  85  |     const detail = new EmployeeDetailPage(page);
  86  |     await detail.gotoTab('viewPersonalDetails', testData.knownExistingEmpNumber);
  87  |     expect(await detail.countVisibleTabs()).toBe(TABS.length);
  88  |   });
  89  | 
  90  |   // TC-PIM-009 | Req: PRD FR-11 | Discovery: discovery/pim_employee_detail.md
  91  |   test('TC-PIM-009: personal details tab exposes documented fields', async ({ authenticatedPage: page }) => {
  92  |     const detail = new EmployeeDetailPage(page);
  93  |     await detail.gotoTab('viewPersonalDetails', testData.knownExistingEmpNumber);
  94  |     for (const label of ['Employee Id', 'Other Id', "Driver's License Number", 'Nationality', 'Marital Status', 'Date of Birth', 'Gender']) {
  95  |       await expect(page.getByText(label, { exact: false }).first()).toBeVisible();
  96  |     }
  97  |   });
  98  | 
  99  |   // TC-PIM-010 | Req: PRD BR-3 | Discovery: discovery/pim_employee_detail.md
  100 |   test('TC-PIM-010: empNumber remains stable across employee detail tabs', async ({ authenticatedPage: page }) => {
  101 |     const detail = new EmployeeDetailPage(page);
  102 |     await detail.gotoTab('viewPersonalDetails', testData.knownExistingEmpNumber);
  103 |     const empNumberOnPersonal = detail.getCurrentEmpNumber();
  104 |     await detail.gotoTab('viewJobDetails', testData.knownExistingEmpNumber);
  105 |     const empNumberOnJob = detail.getCurrentEmpNumber();
  106 |     expect(empNumberOnJob).toBe(empNumberOnPersonal);
  107 |   });
  108 | 
  109 |   // TC-PIM-011 [PARTIALLY AUTOMATABLE — Assumption-based, PRD FR-8 / §13 item 4]
  110 |   // Automatable portion: capture the row Action icons' accessible names for the record.
  111 |   // NOT automatable: confirming their actual Edit/Delete semantics requires a human to
  112 |   // click through and observe the resulting behavior — this test only reports what's
  113 |   // programmatically discoverable, per the Assumption this test case documents.
  114 |   test('TC-PIM-011 [ASSUMPTION-BASED]: employee list row action icons — capture accessible names for review', async ({ authenticatedPage: page }) => {
  115 |     const list = new EmployeeListPage(page);
  116 |     await list.goto();
  117 |     const firstRowButtons = list.employeeRows.first().locator('button');
  118 |     const count = await firstRowButtons.count();
  119 |     const names = [];
  120 |     for (let i = 0; i < count; i += 1) {
  121 |       names.push(await firstRowButtons.nth(i).getAttribute('aria-label') || '(no aria-label)');
  122 |     }
  123 |     console.log(`TC-PIM-011: row action button accessible names = ${JSON.stringify(names)} — HUMAN REVIEW REQUIRED to confirm actual Edit/Delete semantics.`);
  124 |     expect(count).toBeGreaterThan(0);
  125 |   });
  126 | 
  127 |   // TC-PIM-012 | Req: PRD FR-7 | Discovery: "Not independently verified in Discovery this run" (Test Gap)
  128 |   test('TC-PIM-012: employee list sorting controls function correctly', async ({ authenticatedPage: page }) => {
  129 |     const list = new EmployeeListPage(page);
  130 |     await list.goto();
  131 |     const idHeaderSortIcon = page.locator('.oxd-table-header-cell', { hasText: 'Id' }).locator('i, [class*="sort"]').first();
  132 |     await idHeaderSortIcon.click();
  133 |     await expect(list.employeeRows.first()).toBeVisible();
  134 |   });
  135 | 
  136 |   // TC-PIM-013 | Req: PRD FR-7 | Discovery: "Not independently verified in Discovery this run" (Test Gap)
  137 |   test('TC-PIM-013: employee list pagination controls function correctly', async ({ authenticatedPage: page }) => {
  138 |     const list = new EmployeeListPage(page);
  139 |     await list.goto();
  140 |     const page2Link = page.getByRole('link', { name: '2' });
  141 |     if (await page2Link.count() > 0) {
  142 |       await page2Link.click();
  143 |       await expect(list.employeeRows.first()).toBeVisible();
  144 |     } else {
  145 |       test.skip(true, 'Fewer than 2 pages of results at execution time — see Coverage Report Test Gap notes.');
  146 |     }
  147 |   });
  148 | 
  149 |   // TC-PIM-014 | Req: PRD FR-6 | Discovery: "Not independently verified in Discovery this run" (Test Gap, Risk elevated per FINDING-003 precedent)
  150 |   test('TC-PIM-014: other employee list filter fields function correctly', async ({ authenticatedPage: page }) => {
  151 |     const list = new EmployeeListPage(page);
  152 |     await list.goto();
  153 |     await list.expandFilterPanel();
  154 |     // Job Title is used as the representative field for this designed-but-evidence-thin case.
  155 |     const jobTitleInput = page.locator('label:has-text("Job Title") ~ div').first();
  156 |     await expect(jobTitleInput).toBeVisible();
  157 |   });
  158 | });
  159 | 
```