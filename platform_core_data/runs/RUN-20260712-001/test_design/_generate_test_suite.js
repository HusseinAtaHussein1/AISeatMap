// Test Design Agent v3 — single source of truth for NDC's Login Manual Test Suite (RUN-20260712-001).
// Generates both Markdown and Excel renderings from one data set (agents/test_design_agent.md §9/§11 rule 13).
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

const OUT_DIR = __dirname;

const LOGIN_CASES = [
  {
    id: 'TC-LOGIN-001', title: 'Valid login redirects to the Dashboard', objective: 'Verify that submitting correct, existing credentials logs the user in and reaches the Dashboard.',
    priority: 'P1', risk: 'High — core authentication path, every other module depends on it',
    preconditions: 'User is logged out. A valid NDC credential is available (platform_core_data/credentials/credentials.json).',
    testData: 'Existing valid username/password (see credentials.json — not reproduced here)',
    steps: '1. Navigate to the NDC login screen. 2. Enter a valid Username and Password. 3. Click Login.',
    expected: 'User is redirected to the Dashboard (page title "NDC - Dashboard"); login screen is no longer shown.',
    reqRef: 'Observation-derived (Project Context v2 §6 item 5)', discRef: 'discovery/Login_Screen.md (§ "Valid login")', findRef: 'FINDING-NDC-LOGIN-001', evidRef: 'discovery/login_screen_valid_post_login.png',
    category: 'Positive',
  },
  {
    id: 'TC-LOGIN-002', title: 'Invalid credentials are rejected with a generic message', objective: 'Verify that a non-existent username/password combination is rejected with a clear, generic error, and the user stays on the login screen.',
    priority: 'P1', risk: 'Medium — an incorrect rejection or a message that leaks account existence would be a security-relevant defect',
    preconditions: 'User is logged out.',
    testData: 'Username: a fabricated, non-existent value (e.g. qa_probe_nonexistent_user) — never a real shared credential, per the shared-env negative-testing default. Password: any fabricated value.',
    steps: '1. Navigate to the NDC login screen. 2. Enter a non-existent Username and any Password. 3. Click Login.',
    expected: '"Invalid credentials, Please try again." is shown; user remains on the login screen.',
    reqRef: 'Observation-derived (Project Context v2 §6 item 3)', discRef: 'discovery/Login_Screen.md (§ "Invalid login attempt")', findRef: 'N/A', evidRef: 'discovery/login_screen_invalid_attempt.png',
    category: 'Negative — Invalid Inputs',
  },
  {
    id: 'TC-LOGIN-003', title: 'Empty Username/Password blocked by required-field validation', objective: 'Verify that submitting the login form with both fields empty does not attempt authentication and surfaces required-field feedback.',
    priority: 'P2', risk: 'Low — UX/validation completeness, not itself a security issue',
    preconditions: 'User is logged out.',
    testData: 'Username: (empty), Password: (empty)',
    steps: '1. Navigate to the NDC login screen. 2. Leave both fields empty. 3. Click Login.',
    expected: 'Form does not submit as a valid login attempt (no "Invalid credentials" round-trip for an empty submission); required-field feedback is shown, or the Login action is not triggered. Exact client-side behavior not yet independently re-verified this run — see Coverage Report Assumption.',
    reqRef: 'Observation-derived (Project Context v2 §6 item 1)', discRef: 'Not independently re-verified in Discovery this run — Discovery exercised the invalid-credential and valid-credential paths but did not separately submit an all-empty form (Coverage Report Test Gap).', findRef: 'N/A', evidRef: 'N/A',
    category: 'Negative — Empty Values', assumptionBased: true,
  },
  {
    id: 'TC-LOGIN-004', title: 'Password field masks input', objective: 'Verify the Password field renders as a masked (obscured) input, not plain text.',
    priority: 'P3', risk: 'Low — basic UI/security hygiene expectation, not a functional break if missing',
    preconditions: 'User is logged out, viewing the login screen.',
    testData: 'N/A (structural check only, no submission)',
    steps: '1. Navigate to the NDC login screen. 2. Inspect the Password field\'s `type` attribute.',
    expected: 'Password field has `type="password"` (masked rendering).',
    reqRef: 'Observation-derived (this validation pass)', discRef: 'discovery/_login_discovery_results.json (`fields.inputs`)', findRef: 'N/A', evidRef: 'N/A',
    category: 'Positive (structural/observation-only)',
  },
  {
    id: 'TC-LOGIN-005', title: 'Empty Username only (Password filled) blocked', objective: 'Verify that submitting with Username empty but Password filled does not succeed as a valid login attempt.',
    priority: 'P3', risk: 'Low — UX/validation completeness',
    preconditions: 'User is logged out.',
    testData: 'Username: (empty), Password: any fabricated value',
    steps: '1. Navigate to the NDC login screen. 2. Leave Username empty, fill Password. 3. Click Login.',
    expected: 'Does not reach the Dashboard; required-field feedback is shown or the action is blocked. Exact assertion carries the same caveat as TC-LOGIN-003 (not independently re-verified this run for the split case).',
    reqRef: 'Observation-derived (this validation pass)', discRef: 'Not independently re-verified this run — split from TC-LOGIN-003\'s combined case (Coverage Report Test Gap).', findRef: 'N/A', evidRef: 'N/A',
    category: 'Negative — Empty Values', assumptionBased: true,
  },
  {
    id: 'TC-LOGIN-006', title: 'Empty Password only (Username filled) blocked', objective: 'Verify that submitting with Password empty but Username filled does not succeed as a valid login attempt.',
    priority: 'P3', risk: 'Low — UX/validation completeness',
    preconditions: 'User is logged out.',
    testData: 'Username: any fabricated non-existent value, Password: (empty)',
    steps: '1. Navigate to the NDC login screen. 2. Fill Username, leave Password empty. 3. Click Login.',
    expected: 'Does not reach the Dashboard; required-field feedback is shown or the action is blocked. Exact assertion carries the same caveat as TC-LOGIN-003 (not independently re-verified this run for the split case).',
    reqRef: 'Observation-derived (this validation pass)', discRef: 'Not independently re-verified this run — split from TC-LOGIN-003\'s combined case (Coverage Report Test Gap).', findRef: 'N/A', evidRef: 'N/A',
    category: 'Negative — Empty Values', assumptionBased: true,
  },
  {
    id: 'TC-LOGIN-007', title: 'Login button exposes a loading-indicator attribute', objective: 'Verify the Login button carries a loading-state-capable attribute, consistent with a spinner/loading UX during submission.',
    priority: 'P4', risk: 'Low — cosmetic/UX, not a functional break if absent',
    preconditions: 'User is logged out, viewing the login screen.',
    testData: 'N/A (structural check only)',
    steps: '1. Navigate to the NDC login screen. 2. Inspect the Login button\'s attributes.',
    expected: 'Login button has a `loadingicon` attribute (observed value: `pi pi-spin pi-spinner`).',
    reqRef: 'Observation-derived (this validation pass)', discRef: 'discovery/_login_discovery_supplement_results.json (`loginButtonAttributes`)', findRef: 'N/A', evidRef: 'discovery/login_screen_supplement.png',
    category: 'Positive (structural/observation-only)',
  },
  {
    id: 'TC-LOGIN-008', title: 'Anti-enumeration — wrong password against a real, valid username yields the same generic message', objective: 'Verify that a wrong-password attempt against a real, existing NDC username produces the identical generic "Invalid credentials" message as a wrong attempt against a non-existent username (TC-LOGIN-002) — no username-existence leak.',
    priority: 'P2', risk: 'Medium — a message or timing difference here would be a real anti-enumeration security gap, not cosmetic',
    preconditions: 'User is logged out. A valid, existing NDC username is available (platform_core_data/credentials/credentials.json).',
    testData: 'Username: the real, existing NDC username from credentials.json. Password: one fabricated, deliberately wrong value. Exactly one attempt — never repeated, per the shared-env negative-testing default.',
    steps: '1. Navigate to the NDC login screen. 2. Enter the real, existing Username with a deliberately wrong Password. 3. Click Login.',
    expected: '"Invalid credentials, Please try again." is shown — textually identical to TC-LOGIN-002\'s message; user remains on the login screen. No lockout, delay, or distinguishing behavior observed on this single attempt.',
    reqRef: 'Observation-derived (this validation pass — added per the automatic Engineering Decision rule, see LoginGapAnalysis.md)', discRef: 'Not yet independently observed this run — mirrors the Reference SHAFT Project\'s LogInWithInvalidPassword test as secondary evidence that this scenario is safe and meaningful to design.', findRef: 'N/A', evidRef: 'N/A',
    category: 'Negative — Security Inputs (anti-enumeration)',
  },
];

// ---- Deferred scenarios (documented per Test Design Agent §5.3/§11 rule 8 — never silently dropped) ----
const DEFERRED = [
  { category: 'Negative — Lockout / Brute-force', reason: 'Shared staging environment — repeated invalid attempts against a real account risk tripping a lockout other testers depend on. Deferred per platform default (see Project Context v2 §5).' },
  { category: 'Negative — Rate-limiting', reason: 'Same shared-environment constraint as above.' },
  { category: 'Negative — Security Inputs (e.g. SQL-injection-style payloads)', reason: 'Explicitly out of scope for this functional-validation Spike per user instruction 2026-07-12 — deferred to a future dedicated security-testing pass on an isolated environment.' },
  { category: 'Negative — Boundary Values (e.g. very long Username/Password strings)', reason: 'Not attempted — would require an additional live login attempt beyond the one-safe-attempt budget for this shared environment.' },
  { category: 'Forgot Password flow', reason: 'Explicitly out of scope this run (Project Context v2 §3) — link presence confirmed, flow itself not exercised.' },
  { category: 'Logout', reason: 'Out of Current Scope — this run targets the Login screen only. The Reference SHAFT Project tests Logout as part of its Login test class, but Logout was not requested for this run and doesn\'t change this run\'s business objective, so it stays excluded per the platform\'s Human-vs-Engineering-Decision rule (documented, not asked about). Candidate for a future module/run.' },
];

// ---- Pending Decisions ----
// (none currently — the anti-enumeration case and Logout scope question were both resolved
// automatically as Engineering Decisions, 2026-07-12, per pipeline.md §5.5; see LoginGapAnalysis.md.)
const PENDING_DECISION = [];

// ---- Markdown generation ----
function renderMarkdownSuite(moduleName, cases) {
  let md = `# NDC — Manual Test Suite — ${moduleName}\n\n`;
  md += `> **Run:** RUN-20260712-001 | **Status:** Pending Review | Generated by Test Design Agent v3 from a single source of truth shared with the Excel export (never diverges). **Observation-based Spike — every Requirement Reference below is Observation-derived, not PRD-sourced** (see Project Context v2).\n\n`;
  for (const c of cases) {
    md += `## ${c.id} — ${c.title}\n\n`;
    if (c.assumptionBased) md += `> Assumption-based test — verify requirement before execution\n\n`;
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
  md += `## Deferred Scenarios (documented, not designed for execution this run)\n\n`;
  md += `| Category | Reason Deferred |\n|---|---|\n`;
  for (const d of DEFERRED) md += `| ${d.category} | ${d.reason} |\n`;
  if (PENDING_DECISION.length) {
    md += `\n## Pending Decisions (not deferred, not designed — awaiting an explicit human answer; see LoginGapAnalysis.md)\n\n`;
    md += `| Category | Reason |\n|---|---|\n`;
    for (const p of PENDING_DECISION) md += `| ${p.category} | ${p.reason} |\n`;
  }
  return md;
}

fs.writeFileSync(path.join(OUT_DIR, 'TestCases_Login.md'), renderMarkdownSuite('Login / Authentication', LOGIN_CASES));

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
  { header: 'Finding Reference', key: 'findRef', width: 20 },
  { header: 'Evidence Reference', key: 'evidRef', width: 30 },
  { header: 'Category', key: 'category', width: 30 },
];

async function buildWorkbook() {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Test Design Agent v3';

  const ws = wb.addWorksheet('Login');
  ws.columns = COLUMNS;
  ws.getRow(1).font = { bold: true };
  LOGIN_CASES.forEach((c) => ws.addRow(c));
  ws.autoFilter = { from: 'A1', to: `${String.fromCharCode(64 + COLUMNS.length)}1` };

  const wsDeferred = wb.addWorksheet('Deferred');
  wsDeferred.columns = [{ header: 'Category', key: 'category', width: 40 }, { header: 'Reason Deferred', key: 'reason', width: 80 }];
  wsDeferred.getRow(1).font = { bold: true };
  DEFERRED.forEach((d) => wsDeferred.addRow(d));

  if (PENDING_DECISION.length) {
    const wsPending = wb.addWorksheet('Pending Decisions');
    wsPending.columns = [{ header: 'Category', key: 'category', width: 40 }, { header: 'Reason', key: 'reason', width: 80 }];
    wsPending.getRow(1).font = { bold: true };
    PENDING_DECISION.forEach((p) => wsPending.addRow(p));
  }

  await wb.xlsx.writeFile(path.join(OUT_DIR, 'TestCases_Login.xlsx'));
  console.log('Excel workbook written.');
}

buildWorkbook().then(() => console.log('Markdown + Excel generated for', LOGIN_CASES.length, 'Login test cases.'));

module.exports = { LOGIN_CASES, DEFERRED, PENDING_DECISION };
