// One-off selector-verification script (NOT part of the generated suite).
// Purpose: inspect live DOM for the PIM Employee List filter panel, the Add Employee
// required-field errors, and the Employee Detail tabs, to fix broken Page Object
// selectors in EmployeeListPage.js / AddEmployeePage.js / EmployeeDetailPage.js.
const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ baseURL: 'https://opensource-demo.orangehrmlive.com' });

  await page.goto('/web/index.php/auth/login');
  await page.locator('input[name="username"]').fill('Admin');
  await page.locator('input[name="password"]').fill('admin123');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForURL(/dashboard/);

  console.log('\n=== Employee List filter panel ===');
  await page.goto('/web/index.php/pim/viewEmployeeList');
  await page.waitForLoadState('networkidle');
  const headingCount = await page.getByRole('heading', { name: 'Employee Information' }).count();
  console.log('Heading "Employee Information" count:', headingCount);
  // Dump all buttons near the top of the table header area
  const headerButtons = await page.locator('.oxd-table-filter-header button, .oxd-table-filter-header-title button, [class*="oxd-table-filter"] button').all();
  console.log('Candidate filter-area buttons found:', headerButtons.length);
  for (const btn of headerButtons) {
    console.log(' -', await btn.evaluate((el) => el.outerHTML.slice(0, 200)));
  }
  // Print the general filter area HTML for manual inspection
  const filterAreaHtml = await page.locator('form').first().evaluate((el) => el.outerHTML.slice(0, 1500)).catch(() => '(no <form> found)');
  console.log('\nFilter <form> (first 1500 chars):\n', filterAreaHtml);

  console.log('\n=== Add Employee required errors ===');
  await page.goto('/web/index.php/pim/addEmployee');
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: 'Save' }).click();
  await page.waitForTimeout(1000);
  const requiredExact = await page.getByText('Required', { exact: true }).count();
  console.log('getByText("Required", exact) count:', requiredExact);
  const requiredClassBased = await page.locator('.oxd-input-group__message, .oxd-text--span.oxd-text--error, span.oxd-input-field-error-message').count();
  console.log('Class-based error message count:', requiredClassBased);
  const anyRequiredText = await page.getByText(/required/i).count();
  console.log('Case-insensitive "required" text count:', anyRequiredText);

  console.log('\n=== Employee Detail tabs ===');
  await page.goto('/web/index.php/pim/viewEmployeeList');
  await page.waitForLoadState('networkidle');
  const firstRowLink = page.locator('.oxd-table-card').first().locator('a').first();
  const empDetailHref = await firstRowLink.getAttribute('href').catch(() => null);
  console.log('First employee row link href:', empDetailHref);
  if (empDetailHref) {
    await page.goto(empDetailHref);
    await page.waitForLoadState('networkidle');
    const tabLinks = await page.locator('.oxd-topbar-body-nav-tab-item a, a.oxd-topbar-body-nav-tab-item, .orangehrm-tabs a, ul.oxd-topbar-body-nav-tab li a').all();
    console.log('Tab link candidates found:', tabLinks.length);
    for (const t of tabLinks) {
      console.log(' -', (await t.innerText().catch(() => '')).trim(), '|', await t.getAttribute('href').catch(() => ''));
    }
    // fallback broader
    const allNavLinks = await page.locator('nav a, [class*="tab"] a').all();
    console.log('Broader nav/tab <a> count:', allNavLinks.length);
    for (const t of allNavLinks) {
      const href = await t.getAttribute('href').catch(() => '');
      if (href && href.includes('empNumber')) {
        console.log('   nav a ->', (await t.innerText().catch(() => '')).trim(), '|', href);
      }
    }
  }

  await browser.close();
})().catch((e) => {
  console.error('INSPECTION SCRIPT ERROR:', e);
  process.exit(1);
});
