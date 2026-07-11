// Test Design Agent v2 — single source of truth for the Manual Test Suite.
// Generates both the Markdown and Excel renderings from one data set (agents/test_design_agent.md §9 rule 13).
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

const OUT_DIR = __dirname;

// ---- Test case data (one array per module/suite) ----

const LOGIN_CASES = [
  {
    id: 'TC-LOGIN-001', title: 'Valid login redirects successfully', objective: 'Verify that submitting correct credentials logs the user in and redirects away from the login page.',
    priority: 'P1', risk: 'High — core authentication path', preconditions: 'User is logged out. Valid credentials (Admin/admin123) are available.',
    testData: 'Username: Admin, Password: admin123', steps: '1. Navigate to /auth/login. 2. Enter Username=Admin, Password=admin123. 3. Click Login.',
    expected: 'User is redirected away from /auth/login (to the Dashboard, or to a previously-requested protected URL — see TC-LOGIN-007).',
    reqRef: 'PRD FR-1', discRef: 'discovery/login_deeplink_and_successful_login.md', findRef: 'N/A', evidRef: 'N/A', category: 'Positive'
  },
  {
    id: 'TC-LOGIN-002', title: 'Invalid credentials rejected with generic message', objective: 'Verify that any incorrect Username/Password combination is rejected with the standard "Invalid credentials" message.',
    priority: 'P1', risk: 'Medium — incorrect rejection or message could mislead users or leak account validity', preconditions: 'User is logged out.',
    testData: 'Username: Admin, Password: wrongpass (also: unknown username + wrong password)', steps: '1. Navigate to /auth/login. 2. Enter a wrong Username/Password combination. 3. Click Login.',
    expected: '"Invalid credentials" alert is shown; user remains on /auth/login. Message text is identical whether the username itself is valid or invalid (no enumeration via the Login form).',
    reqRef: 'PRD FR-1', discRef: 'discovery/login_validation_and_bruteforce.md', findRef: 'N/A', evidRef: 'N/A', category: 'Negative — Invalid Inputs'
  },
  {
    id: 'TC-LOGIN-003', title: 'Empty login form blocked by required-field validation', objective: 'Verify that submitting the login form with both fields empty is blocked client-side.',
    priority: 'P2', risk: 'Low — cosmetic/UX if missing, not a security issue', preconditions: 'User is logged out.',
    testData: 'Username: (empty), Password: (empty)', steps: '1. Navigate to /auth/login. 2. Leave both fields empty. 3. Click Login.',
    expected: 'A "Required" message is shown under both fields; no request is sent; user remains on /auth/login.',
    reqRef: 'PRD FR-1', discRef: 'discovery/login_validation_and_bruteforce.md', findRef: 'N/A', evidRef: 'N/A', category: 'Negative — Empty Values'
  },
  {
    id: 'TC-LOGIN-004', title: 'REGRESSION — Emoji in Username must not surface a generic server error', objective: 'Verify that a corrected build handles an emoji-containing Username the same way as any other invalid username, not with a distinct "Unexpected error occurred" message.',
    priority: 'P2', risk: 'Medium — inherited from FINDING-001 (input-handling robustness on an authentication boundary)', preconditions: 'User is logged out.',
    testData: 'Username: 😀 (single emoji character), Password: any string', steps: '1. Navigate to /auth/login. 2. Enter an emoji character as the Username. 3. Enter any Password. 4. Click Login.',
    expected: 'CORRECTED behavior: "Invalid credentials" is shown, identical to any other wrong-username case — NOT "Unexpected error occurred" (the currently-observed, defective behavior).',
    reqRef: 'Not defined in Project Context (Missing Requirement — see FINDING-001)', discRef: 'discovery/login_validation_and_bruteforce.md', findRef: 'FINDING-001', evidRef: 'findings/FINDING-001_EmojiUsernameUnexpectedError/failure.png', category: 'Negative — Unicode', disposition: 'Regression test'
  },
  {
    id: 'TC-LOGIN-005', title: 'SQL-injection-style payload does not bypass authentication', objective: 'Verify that a SQL-injection-style string in either credential field is treated as ordinary invalid input, with no authentication bypass.',
    priority: 'P1', risk: 'High — a successful bypass would be a critical security failure', preconditions: 'User is logged out.',
    testData: "Username: ' OR '1'='1' -- , Password: ' OR '1'='1' -- ", steps: "1. Navigate to /auth/login. 2. Enter the payload string in both fields. 3. Click Login.",
    expected: '"Invalid credentials" is shown; no authentication bypass occurs; no database error is exposed.',
    reqRef: 'PRD §10 (Security Requirements, general input-handling expectation)', discRef: 'discovery/login_validation_and_bruteforce.md', findRef: 'N/A', evidRef: 'N/A', category: 'Negative — Security Inputs'
  },
  {
    id: 'TC-LOGIN-006', title: 'EXPLORATORY — Repeated failed logins and brute-force protection', objective: 'Have a human reviewer confirm whether the absence of visible lockout/CAPTGHA/delay after repeated failed logins is an accepted risk for this build or a gap to remediate.',
    priority: 'P3', risk: "Per FINDING-002: this Explorer Agent's own matrix defaults to Low, but the source PRD independently rates the same condition High — the discrepancy itself is what must be resolved by a human, not this test case.",
    preconditions: 'User is logged out. A valid username (Admin) is available to test against.',
    testData: '5+ consecutive wrong passwords against Admin', steps: '1. Submit Admin + a wrong password 5 times in succession. 2. Observe whether any lockout, delay, throttling, or CAPTCHA appears on any attempt.',
    expected: 'EXPLORATORY — no fixed pass/fail assertion. Reviewer confirms whether the observed absence of a lockout control is acceptable for this build (public demo) or must be remediated.',
    reqRef: 'PRD §10 SR-5', discRef: 'discovery/login_validation_and_bruteforce.md', findRef: 'FINDING-002', evidRef: 'findings/FINDING-002_NoBruteForceProtection/after.png', category: 'Negative — Timeouts/Rate-limiting (adjacent)', disposition: 'Exploratory test'
  },
  {
    id: 'TC-LOGIN-007', title: 'Unauthenticated deep-link redirects to login and returns to the original URL after login', objective: 'Verify that requesting a protected URL while logged out redirects to Login, and that a subsequent successful login returns the user to that original URL.',
    priority: 'P1', risk: 'Medium — an incorrect redirect could either block a legitimate deep link or leak access', preconditions: 'User is logged out.',
    testData: 'Protected URL: /web/index.php/pim/viewEmployeeList', steps: '1. While logged out, navigate directly to the protected PIM Employee List URL. 2. Observe redirect to /auth/login. 3. Log in with valid credentials.',
    expected: 'Step 2: redirected to /auth/login. Step 3: redirected to the originally-requested PIM URL, not a default landing page.',
    reqRef: 'PRD FR-2, §10 SR-1', discRef: 'discovery/login_deeplink_and_successful_login.md', findRef: 'N/A', evidRef: 'N/A', category: 'Positive (Authorization boundary)'
  },
  {
    id: 'TC-LOGIN-008', title: 'Forgot Password with an unknown username returns the generic success message', objective: 'Verify the anti-enumeration behavior holds for a username that does not exist.',
    priority: 'P1', risk: 'Medium — this is the anti-enumeration control itself', preconditions: 'User is logged out.',
    testData: 'Username: nonexistent_user_run002', steps: '1. From Login, click "Forgot your password?". 2. Enter an unknown username. 3. Click Reset Password.',
    expected: '"Reset Password link sent successfully" is shown, quickly (no timeout).',
    reqRef: 'PRD FR-3, §10 SR-3', discRef: 'discovery/forgot_password_flow.md', findRef: 'N/A', evidRef: 'N/A', category: 'Positive'
  },
  {
    id: 'TC-LOGIN-009', title: 'REGRESSION — Forgot Password with a valid username must not time out', objective: 'Verify that a corrected build returns the required generic success message for a real, existing username instead of a 504 Gateway Time-out.',
    priority: 'P1', risk: 'High — inherited from FINDING-005 (required functionality completely unavailable for its intended user)', preconditions: 'User is logged out. Admin is a known-valid username.',
    testData: 'Username: Admin', steps: '1. From Login, click "Forgot your password?". 2. Enter Admin. 3. Click Reset Password.',
    expected: 'CORRECTED behavior: "Reset Password link sent successfully" is returned within a reasonable time — NOT a 504 Gateway Time-out (the currently-observed, defective behavior).',
    reqRef: 'PRD FR-3, §10 SR-3', discRef: 'discovery/forgot_password_flow.md', findRef: 'FINDING-005', evidRef: 'findings/FINDING-005_ForgotPasswordTimeoutKnownUser/failure.png', category: 'Negative — Timeouts', disposition: 'Regression test'
  },
  {
    id: 'TC-LOGIN-010', title: 'EXPLORATORY — Forgot Password response time/availability parity between valid and invalid usernames', objective: 'Have a human reviewer confirm whether response-timing/availability symmetry (as opposed to message-text symmetry) is in-scope for the anti-enumeration requirement.',
    priority: 'P2', risk: 'Medium — per FINDING-006, an enumeration side channel exists even when message text itself is never observed to differ', preconditions: 'A known-valid username and a made-up username are both available.',
    testData: 'Admin (valid) vs. any made-up username', steps: '1. Submit Forgot Password for Admin, note outcome/timing. 2. Submit Forgot Password for a made-up username, note outcome/timing. 3. Compare.',
    expected: 'EXPLORATORY — no fixed pass/fail assertion. Reviewer decides whether the demonstrated asymmetry (504 vs. fast success) is in-scope for the anti-enumeration requirement.',
    reqRef: 'PRD FR-3, §10 SR-3', discRef: 'discovery/forgot_password_flow.md', findRef: 'FINDING-006', evidRef: 'findings/FINDING-006_ForgotPasswordEnumerationViaTimeout/known_user_timeout.png, unknown_user_success.png', category: 'Negative — Security Inputs (timing side-channel)', disposition: 'Exploratory test'
  },
  {
    id: 'TC-LOGIN-011', title: 'Long input in Username field does not degrade login handling', objective: 'Verify that an unusually long Username value is handled the same as any other invalid credential, without error or crash.',
    priority: 'P3', risk: 'Low — no anomaly observed for this category in exploration to date', preconditions: 'User is logged out.',
    testData: 'A 259-character alphanumeric string', steps: '1. Navigate to /auth/login. 2. Enter a very long string as Username. 3. Enter any Password. 4. Click Login.',
    expected: '"Invalid credentials" is shown normally; no error page, no client-side max-length block observed.',
    reqRef: 'PRD FR-1', discRef: 'Not independently verified in Discovery this run — confirmed clean under RUN-20260706-001\'s exploration of the same Login form (see that run\'s login_validation_states.md); this run\'s own Discovery did not independently re-test this specific category (Coverage Report Test Gap).', findRef: 'N/A', evidRef: 'N/A', category: 'Negative — Boundary Values'
  },
];

const PIM_CASES = [
  {
    id: 'TC-PIM-001', title: 'Employee List displays with documented columns', objective: 'Verify the Employee List table renders with the columns the PRD documents.',
    priority: 'P2', risk: 'Low — display-only requirement', preconditions: 'Logged in as Admin.',
    testData: 'N/A (default list view)', steps: '1. Navigate to PIM > Employee List.',
    expected: 'Table displays Id, First (& Middle) Name, Last Name, and (for records that have them populated) Job Title, Employment Status, Sub Unit, Supervisor, plus row Actions.',
    reqRef: 'PRD FR-5', discRef: 'discovery/pim_employee_list_raw_snapshot.md', findRef: 'N/A', evidRef: 'N/A', category: 'Positive'
  },
  {
    id: 'TC-PIM-002', title: 'Employee List filter panel exposes all documented fields', objective: 'Verify the filter panel contains all 7 documented filter fields.',
    priority: 'P2', risk: 'Low', preconditions: 'Logged in as Admin, on Employee List.',
    testData: 'N/A', steps: '1. Expand the "Employee Information" filter panel.',
    expected: 'Employee Name, Employee Id, Employment Status, Include, Supervisor Name, Job Title, and Sub Unit fields are all present.',
    reqRef: 'PRD FR-6', discRef: 'discovery/pim_employee_list_raw_snapshot.md (screenshots/pim_employee_list_filters_expanded.png)', findRef: 'N/A', evidRef: 'N/A', category: 'Positive'
  },
  {
    id: 'TC-PIM-003', title: 'Employee Id filter correctly returns "No Records Found" for a valid-length, nonexistent value', objective: 'Verify the filter behaves correctly for the normal negative case (a well-formed but nonexistent ID).',
    priority: 'P2', risk: 'Low', preconditions: 'Logged in as Admin, on Employee List.',
    testData: 'Employee Id: 999999 (or any value ≤10 characters not matching a real record)', steps: '1. Enter the value in the Employee Id filter. 2. Click Search.',
    expected: '"No Records Found" is shown; the record count updates accordingly.',
    reqRef: 'PRD FR-6', discRef: 'findings/FINDING-003_EmployeeIdFilterSilent422/comparison_numeric_nonexistent_correct.png', findRef: 'N/A', evidRef: 'N/A', category: 'Negative — Invalid Inputs (valid-length)'
  },
  {
    id: 'TC-PIM-004', title: 'REGRESSION — Employee Id filter must not silently fail for values over 10 characters', objective: 'Verify that a corrected build either accepts a longer Employee Id value or shows a clear error — never silently retains stale results with no feedback.',
    priority: 'P2', risk: 'Medium — inherited from FINDING-003 (a real user could be misled by stale, unrelated results)', preconditions: 'Logged in as Admin, on Employee List.',
    testData: 'Employee Id: 11+ character string (e.g., "AAAAAAAAAAA")', steps: '1. Enter an 11+ character value in the Employee Id filter. 2. Click Search.',
    expected: 'CORRECTED behavior: either the search succeeds normally (if the length limit is removed/raised) or a clear, user-visible error message is shown — NOT a silent failure that leaves the previous, unrelated result set on screen (the currently-observed, defective behavior).',
    reqRef: 'PRD FR-6', discRef: 'findings/FINDING-003_EmployeeIdFilterSilent422/failure_11chars.png', findRef: 'FINDING-003', evidRef: 'findings/FINDING-003_EmployeeIdFilterSilent422/failure_11chars.png, failure_22chars.png', category: 'Negative — Boundary Values', disposition: 'Regression test'
  },
  {
    id: 'TC-PIM-005', title: 'Add Employee blocks submission when required Full Name fields are empty', objective: 'Verify VR-1 required-field validation on the Add Employee form.',
    priority: 'P1', risk: 'Medium — a failure here could allow malformed employee records', preconditions: 'Logged in as Admin, on Add Employee.',
    testData: 'First Name: (empty), Last Name: (empty)', steps: '1. Leave First Name and Last Name empty. 2. Click Save.',
    expected: '"Required" messages are shown for First Name and Last Name; the form is not submitted; no employee is created.',
    reqRef: 'PRD VR-1, FR-9', discRef: 'discovery/pim_add_employee.md', findRef: 'N/A', evidRef: 'N/A', category: 'Negative — Empty Values'
  },
  {
    id: 'TC-PIM-006', title: 'REGRESSION — Employee Id uniqueness check must not crash on emoji input', objective: 'Verify that a corrected build handles an emoji character in the Employee Id field gracefully during the live uniqueness check, without an HTTP 500.',
    priority: 'P2', risk: 'Medium — inherited from FINDING-004; second independent confirmation of the same defect class as FINDING-001', preconditions: 'Logged in as Admin, on Add Employee.',
    testData: 'Employee Id: 😀 (single emoji character)', steps: '1. Enter an emoji character in the Employee Id field (leave Full Name empty so the form cannot be saved). 2. Observe the live uniqueness-check request.',
    expected: 'CORRECTED behavior: the uniqueness check returns a normal result (e.g., "available" or a graceful validation message) — NOT an HTTP 500 with a generic "Unexpected Error Occurred" (the currently-observed, defective behavior).',
    reqRef: 'Not defined in Project Context (Missing Requirement — see FINDING-004)', discRef: 'discovery/pim_add_employee.md', findRef: 'FINDING-004', evidRef: 'findings/FINDING-004_EmployeeIdEmojiServerError/failure.png', category: 'Negative — Unicode', disposition: 'Regression test'
  },
  {
    id: 'TC-PIM-007', title: 'Add Employee displays the documented photo-upload constraint text', objective: 'Verify the stated photo-upload constraints are visible to the user (observation-level check; no file is actually uploaded).',
    priority: 'P4', risk: 'Low — informational text only', preconditions: 'Logged in as Admin, on Add Employee.',
    testData: 'N/A', steps: '1. Observe the text under the photo-upload control.',
    expected: 'Text reads "Accepts jpg, .png, .gif up to 1MB. Recommended dimensions: 200px X 200px" (or equivalent), matching PRD VR-2.',
    reqRef: 'PRD VR-2', discRef: 'discovery/pim_add_employee_raw_snapshot.md', findRef: 'N/A', evidRef: 'N/A', category: 'Positive (observation-only)'
  },
  {
    id: 'TC-PIM-008', title: 'Employee Detail exposes all 10 documented tabs for an existing employee', objective: 'Verify the Employee Detail view exposes every PRD-documented tab, each independently navigable.',
    priority: 'P2', risk: 'Low', preconditions: 'Logged in as Admin. An existing employee record is available.',
    testData: 'An existing employee (e.g., empNumber 104)', steps: '1. Open an existing employee\'s detail view. 2. Confirm each tab link/URL.',
    expected: 'Personal Details, Contact Details, Emergency Contacts, Dependents, Immigration, Job, Salary, Report-to, Qualifications, and Memberships tabs are all present, each at /pim/{tab}/empNumber/{id}.',
    reqRef: 'PRD FR-10', discRef: 'discovery/pim_employee_detail.md', findRef: 'N/A', evidRef: 'N/A', category: 'Positive'
  },
  {
    id: 'TC-PIM-009', title: 'Personal Details tab exposes documented fields', objective: 'Verify the Personal Details tab contains the fields the PRD documents.',
    priority: 'P2', risk: 'Low', preconditions: 'Logged in as Admin, viewing an existing employee\'s Personal Details tab.',
    testData: 'N/A', steps: '1. Open the Personal Details tab for an existing employee.',
    expected: 'Employee Full Name, Employee Id, Other Id, Driver\'s License Number + Expiry Date, Nationality, Marital Status, Date of Birth, Gender, Custom Fields, and Attachments sections are all present.',
    reqRef: 'PRD FR-11', discRef: 'discovery/pim_employee_detail.md', findRef: 'N/A', evidRef: 'N/A', category: 'Positive'
  },
  {
    id: 'TC-PIM-010', title: 'empNumber remains stable across Employee Detail tabs', objective: 'Verify the internal empNumber identifier does not change when navigating between tabs for the same employee.',
    priority: 'P3', risk: 'Low — a mismatch would indicate a data-integrity/routing defect (BR-3)', preconditions: 'Logged in as Admin, viewing an existing employee.',
    testData: 'An existing employee (e.g., empNumber 104)', steps: '1. Open Personal Details for the employee. 2. Note the empNumber in the URL. 3. Navigate to the Job tab. 4. Compare the empNumber in the URL.',
    expected: 'The empNumber value is identical across both tab URLs.',
    reqRef: 'PRD BR-3', discRef: 'discovery/pim_employee_detail.md', findRef: 'N/A', evidRef: 'N/A', category: 'Positive'
  },
  {
    id: 'TC-PIM-011', title: 'ASSUMPTION-BASED — Employee List row Action icons\' semantics remain unconfirmed', objective: 'Document that the row-level Action icons\' exact function (presumed Edit/Delete) is not confirmed via any label or tooltip, and must be verified before this becomes a firm requirement.',
    priority: 'P4', risk: 'Low — documentation gap, not a defect', preconditions: 'Logged in as Admin, on Employee List.',
    testData: 'N/A', steps: '1. Inspect the two icon buttons in each row\'s Actions column via the accessibility tree and any visible tooltip.',
    expected: 'Assumption-based test — verify requirement before execution. As of this run, the icons\' accessible names/tooltips remain unresolved; do not assert Edit/Delete functionality as fact until confirmed.',
    reqRef: 'PRD FR-8 (Assumption — PRD §13 item 4)', discRef: 'discovery/pim_employee_list_raw_snapshot.md', findRef: 'N/A', evidRef: 'N/A', category: 'Positive (documentation/assumption)', assumptionBased: true
  },
  {
    id: 'TC-PIM-012', title: 'Employee List sorting controls function correctly', objective: 'Verify that clicking a sortable column header re-orders the Employee List accordingly.',
    priority: 'P3', risk: 'Low', preconditions: 'Logged in as Admin, on Employee List.',
    testData: 'N/A', steps: '1. Click the sort icon on the Id column header. 2. Observe row order. 3. Click again to reverse.',
    expected: 'Rows re-order ascending/descending by the selected column.',
    reqRef: 'PRD FR-7', discRef: 'Not independently verified in Discovery this run — sort controls were confirmed structurally present but not functionally exercised (Coverage Report Test Gap).', findRef: 'N/A', evidRef: 'N/A', category: 'Positive (designed, evidence-thin)'
  },
  {
    id: 'TC-PIM-013', title: 'Employee List pagination controls function correctly', objective: 'Verify that pagination controls correctly navigate between pages of results.',
    priority: 'P3', risk: 'Low', preconditions: 'Logged in as Admin, on Employee List, with more records than fit on one page.',
    testData: 'N/A', steps: '1. Navigate to page 2 via the pagination control. 2. Confirm a different set of records is shown. 3. Navigate back to page 1.',
    expected: 'Each page shows a distinct, correctly-ordered subset of the full record set.',
    reqRef: 'PRD FR-7', discRef: 'Not independently verified in Discovery this run — pagination controls were confirmed structurally present but not functionally exercised (Coverage Report Test Gap).', findRef: 'N/A', evidRef: 'N/A', category: 'Positive (designed, evidence-thin)'
  },
  {
    id: 'TC-PIM-014', title: 'Other Employee List filter fields (Employee Name, Employment Status, Include, Supervisor Name, Job Title, Sub Unit) function correctly', objective: 'Verify the remaining 6 documented filter fields correctly narrow the Employee List results.',
    priority: 'P3', risk: 'Medium — FINDING-003 demonstrated the Employee Id field has an unhandled boundary; the same class of defect has not been ruled out for these 6 fields.',
    preconditions: 'Logged in as Admin, on Employee List.',
    testData: 'One representative value per field (e.g., a known employee\'s name for Employee Name typeahead)', steps: '1. For each of the 6 fields, enter a representative value and click Search. 2. Confirm results narrow correctly.',
    expected: 'Each field independently narrows the result set as expected, with no silent failures analogous to FINDING-003.',
    reqRef: 'PRD FR-6', discRef: 'Not independently verified in Discovery this run — only Employee Id was functionally tested; the other 6 fields were confirmed structurally present but not functionally exercised (Coverage Report Test Gap, explicitly elevated in Risk given FINDING-003\'s precedent).', findRef: 'N/A', evidRef: 'N/A', category: 'Positive (designed, evidence-thin)'
  },
];

// ---- Requirement Coverage computation ----
const ALL_REQS = [
  'PRD FR-1', 'PRD FR-2', 'PRD §10 SR-1', 'PRD FR-3', 'PRD §10 SR-3', 'PRD §10 SR-5',
  'PRD FR-5', 'PRD FR-6', 'PRD FR-7', 'PRD FR-8 (Assumption — PRD §13 item 4)', 'PRD FR-9', 'PRD VR-1', 'PRD VR-2', 'PRD FR-10', 'PRD FR-11', 'PRD BR-3', 'PRD BR-4',
];

function reqsCoveredBy(cases) {
  const covered = new Set();
  for (const c of cases) {
    for (const token of ['FR-1','FR-2','FR-3','FR-5','FR-6','FR-7','FR-8','FR-9','FR-10','FR-11','SR-1','SR-3','SR-5','VR-1','VR-2','BR-3','BR-4']) {
      if (c.reqRef.includes(token)) covered.add(token);
    }
  }
  return covered;
}

// ---- Markdown generation ----
function renderMarkdownSuite(moduleName, cases) {
  let md = `# OrangeHRM — Manual Test Suite — ${moduleName}\n\n`;
  md += `> **Run:** RUN-20260706-002 | **Status:** Pending Review | Generated by Test Design Agent v2 from a single source of truth shared with the Excel export (never diverges).\n\n`;
  for (const c of cases) {
    md += `## ${c.id} — ${c.title}\n\n`;
    if (c.assumptionBased) md += `> Assumption-based test — verify requirement before execution\n\n`;
    if (c.disposition) md += `> **Finding disposition:** ${c.disposition} (see \`agents/test_design_agent.md\` §5.3)\n\n`;
    md += `| Field | Value |\n|---|---|\n`;
    md += `| Objective | ${c.objective} |\n`;
    md += `| Priority | ${c.priority} |\n`;
    md += `| Risk | ${c.risk} |\n`;
    md += `| Preconditions | ${c.preconditions} |\n`;
    md += `| Test Data | ${c.testData} |\n`;
    md += `| Steps | ${c.steps} |\n`;
    md += `| Expected Result | ${c.expected} |\n`;
    md += `| Requirement Reference | ${c.reqRef} |\n`;
    md += `| Discovery Reference | ${c.discRef} |\n`;
    md += `| Finding Reference | ${c.findRef} |\n`;
    md += `| Evidence Reference | ${c.evidRef} |\n`;
    md += `| Category | ${c.category} |\n\n`;
  }
  return md;
}

fs.writeFileSync(path.join(OUT_DIR, 'OrangeHRM_TestCases_Login.md'), renderMarkdownSuite('Login / Authentication & Access', LOGIN_CASES));
fs.writeFileSync(path.join(OUT_DIR, 'OrangeHRM_TestCases_PIM.md'), renderMarkdownSuite('PIM — Employee Management', PIM_CASES));

// ---- Excel generation ----
const COLUMNS = [
  { header: 'Test Case ID', key: 'id', width: 16 },
  { header: 'Title', key: 'title', width: 40 },
  { header: 'Objective', key: 'objective', width: 40 },
  { header: 'Priority', key: 'priority', width: 10 },
  { header: 'Risk', key: 'risk', width: 30 },
  { header: 'Preconditions', key: 'preconditions', width: 30 },
  { header: 'Test Data', key: 'testData', width: 30 },
  { header: 'Steps', key: 'steps', width: 40 },
  { header: 'Expected Result', key: 'expected', width: 40 },
  { header: 'Requirement Reference', key: 'reqRef', width: 30 },
  { header: 'Discovery Reference', key: 'discRef', width: 40 },
  { header: 'Finding Reference', key: 'findRef', width: 16 },
  { header: 'Evidence Reference', key: 'evidRef', width: 30 },
  { header: 'Category', key: 'category', width: 30 },
  { header: 'Finding Disposition', key: 'disposition', width: 18 },
];

async function buildWorkbook() {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Test Design Agent v2';
  wb.created = new Date('2026-07-06T15:30:00Z');

  for (const [sheetName, cases] of [['Login', LOGIN_CASES], ['PIM', PIM_CASES]]) {
    const ws = wb.addWorksheet(sheetName);
    ws.columns = COLUMNS;
    ws.getRow(1).font = { bold: true };
    for (const c of cases) {
      ws.addRow({ ...c, disposition: c.disposition || (c.assumptionBased ? 'Assumption-based (documented)' : '') });
    }
    ws.autoFilter = { from: 'A1', to: `${String.fromCharCode(64 + COLUMNS.length)}1` };
  }
  await wb.xlsx.writeFile(path.join(OUT_DIR, 'OrangeHRM_TestCases_Login.xlsx'));

  // Split into per-module workbooks too, matching the per-module path convention
  const wbLogin = new ExcelJS.Workbook();
  const wsLogin = wbLogin.addWorksheet('Login');
  wsLogin.columns = COLUMNS;
  wsLogin.getRow(1).font = { bold: true };
  LOGIN_CASES.forEach(c => wsLogin.addRow({ ...c, disposition: c.disposition || (c.assumptionBased ? 'Assumption-based (documented)' : '') }));
  await wbLogin.xlsx.writeFile(path.join(OUT_DIR, 'OrangeHRM_TestCases_Login.xlsx'));

  const wbPim = new ExcelJS.Workbook();
  const wsPim = wbPim.addWorksheet('PIM');
  wsPim.columns = COLUMNS;
  wsPim.getRow(1).font = { bold: true };
  PIM_CASES.forEach(c => wsPim.addRow({ ...c, disposition: c.disposition || (c.assumptionBased ? 'Assumption-based (documented)' : '') }));
  await wbPim.xlsx.writeFile(path.join(OUT_DIR, 'OrangeHRM_TestCases_PIM.xlsx'));

  console.log('Excel workbooks written.');
}

buildWorkbook().then(() => {
  console.log('Markdown + Excel generated.');
  console.log('Login requirement tokens covered:', [...reqsCoveredBy(LOGIN_CASES)].join(', '));
  console.log('PIM requirement tokens covered:', [...reqsCoveredBy(PIM_CASES)].join(', '));
});
