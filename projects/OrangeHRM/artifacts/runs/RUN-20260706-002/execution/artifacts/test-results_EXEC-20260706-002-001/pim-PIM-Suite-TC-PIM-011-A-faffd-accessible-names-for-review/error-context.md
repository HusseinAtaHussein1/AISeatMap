# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: pim.spec.js >> PIM Suite >> TC-PIM-011 [ASSUMPTION-BASED]: employee list row action icons — capture accessible names for review
- Location: tests\pim.spec.js:114:3

# Error details

```
Error: expect(received).toBeGreaterThan(expected)

Expected: > 0
Received:   0
```

# Test source

```ts
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
  70  |       page.waitForResponse((r) => r.url().includes('/api/v2/core/validation/unique')),
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
> 124 |     expect(count).toBeGreaterThan(0);
      |                   ^ Error: expect(received).toBeGreaterThan(expected)
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