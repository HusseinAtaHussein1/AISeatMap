// Test Design Agent v3 — single source of truth for NDC's Role (Create Role) Manual Test Suite (RUN-20260721-001).
// Generates both Markdown and Excel renderings from one data set (Test Design Agent SKILL.md §9/§11 rule 13).
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

const OUT_DIR = __dirname;
const RUN_SCOPE = 'User Story / Pasted text — Create-Role.md (RUN-20260721-001)';
const DISC = 'runs/RUN-20260721-001/discovery/';

const ROLE_CASES = [
  {
    id: 'TC-ROLE-001', title: 'Role Name accepts a valid alphabetic name (with spaces)', objective: 'Verify a Role Name containing only letters and spaces is accepted by client-side format/uniqueness validation.',
    priority: 'P1', risk: 'High — this is the primary positive path for the entire Create Role feature',
    preconditions: 'Logged in as odeysysadmin (Super Admin). On /admin/role/add.',
    testData: 'Role Name: "QA Spike Test Role" (unique, alphabetic + spaces only)',
    steps: '1. Enter "QA Spike Test Role" in Role Name. 2. Select at least one permission checkbox (e.g. Dashboard > View). 3. Click Send For Approval.',
    expected: 'No Role Name format/uniqueness error is shown; submission proceeds past Role Name validation (indirectly confirmed — Timeline #15 showed only the Authorization message when this same name was combined with zero permissions, i.e. Role Name itself raised no error).',
    reqRef: 'FR-ROLECRT-NAME-01', discRef: DISC + 'Timeline.md #15', findRef: 'N/A', evidRef: 'N/A',
    acRef: '"Must be a text field. Allows only normal characters (no special characters or numbers)."', runScopeRef: RUN_SCOPE,
    category: 'Positive', assumptionBased: true,
    assumptionNote: 'A full end-to-end success (role actually saved) was deliberately not executed this run — mutation is not authorized on this shared staging environment. This case verifies the Role-Name-accepted signal only; full save/submit success remains Assumption-based until mutation is authorized.',
  },
  {
    id: 'TC-ROLE-002', title: 'Role Name rejects numbers and special characters', objective: 'Verify a Role Name containing numbers/special characters is rejected before submission.',
    priority: 'P1', risk: 'Medium — inherited from FINDING-002 (Business Risk: asserting the AC\'s original message text would false-negative against the real app)',
    preconditions: 'Logged in as odeysysadmin. On /admin/role/add.',
    testData: 'Role Name: "QA123!@#"',
    steps: '1. Enter "QA123!@#" in Role Name. 2. Select any one permission checkbox. 3. Click Send For Approval.',
    expected: '"Only alphabetic characters are allowed, with spaces permitted between words" is shown under Role Name; submission is blocked. (This is the corrected/actual expected text — NOT the AC\'s original "Role Name already exists..." string, per FINDING-002.)',
    reqRef: 'FR-ROLECRT-NAME-01', discRef: DISC + 'Timeline.md #16; findings/FINDING-002_ValidationMessageTextMismatch/case3-invalid-format-OnlyAlphabetic.png', findRef: 'FINDING-002', evidRef: 'findings/FINDING-002_ValidationMessageTextMismatch/case3-invalid-format-OnlyAlphabetic.png',
    acRef: '"Allows only normal characters (no special characters or numbers)."', runScopeRef: RUN_SCOPE,
    category: 'Negative — Invalid Inputs / Special Characters',
  },
  {
    id: 'TC-ROLE-003', title: 'Empty Role Name is rejected as required', objective: 'Verify submitting with Role Name blank is blocked with a required-field message.',
    priority: 'P1', risk: 'Medium — inherited from FINDING-002',
    preconditions: 'Logged in as odeysysadmin. On /admin/role/add.',
    testData: 'Role Name: (empty)',
    steps: '1. Leave Role Name blank. 2. Select any one permission checkbox. 3. Click Send For Approval.',
    expected: '"Required" is shown under Role Name; submission is blocked. (Actual live text — not the AC\'s quoted duplicate-name message, per FINDING-002.)',
    reqRef: 'FR-ROLECRT-NAME-01', discRef: DISC + 'Timeline.md #14; findings/FINDING-002_ValidationMessageTextMismatch/case1-empty-name-Required.png', findRef: 'FINDING-002', evidRef: 'findings/FINDING-002_ValidationMessageTextMismatch/case1-empty-name-Required.png',
    acRef: '"Must be a text field."', runScopeRef: RUN_SCOPE,
    category: 'Negative — Empty Values',
  },
  {
    id: 'TC-ROLE-004', title: 'Role Name rejects a name matching an existing role', objective: 'Verify a Role Name matching an existing role (exact match) is rejected as a duplicate.',
    priority: 'P1', risk: 'Medium — inherited from FINDING-002',
    preconditions: 'Logged in as odeysysadmin. On /admin/role/add. An existing role named "Admin Role" is present in the Role list (confirmed, 115-row grid).',
    testData: 'Role Name: "Admin Role" (pre-existing)',
    steps: '1. Enter "Admin Role" in Role Name. 2. Click Send For Approval (permissions left as previously selected).',
    expected: '"Name already exists" is shown under Role Name; submission is blocked. (Actual live text — close in meaning to, but not a literal match of, the AC\'s quoted string, per FINDING-002.)',
    reqRef: 'FR-ROLECRT-NAME-02', discRef: DISC + 'Timeline.md #17; findings/FINDING-002_ValidationMessageTextMismatch/case4-duplicate-name-NameAlreadyExists.png', findRef: 'FINDING-002', evidRef: 'findings/FINDING-002_ValidationMessageTextMismatch/case4-duplicate-name-NameAlreadyExists.png',
    acRef: '"Must be unique; duplication of names is not allowed."', runScopeRef: RUN_SCOPE,
    category: 'Negative — Invalid Inputs (duplicate)',
  },
  {
    id: 'TC-ROLE-005', title: 'Whitespace-only Role Name', objective: 'Verify a Role Name consisting only of spaces is rejected, not accepted as a valid non-empty value.',
    priority: 'P3', risk: 'Low — edge case unlikely in normal use, but a real gap if the field silently accepts it',
    preconditions: 'Logged in as odeysysadmin. On /admin/role/add.',
    testData: 'Role Name: "   " (spaces only)',
    steps: '1. Enter three spaces in Role Name. 2. Select any one permission checkbox. 3. Click Send For Approval.',
    expected: 'Blocked by either the "Required" message (if trimmed server/client-side) or the alphabetic-only message — not independently verified this run.',
    reqRef: 'FR-ROLECRT-NAME-01', discRef: 'Not independently verified in Discovery this run — this run\'s User Story strategy prioritized the AC\'s explicitly stated cases over an exhaustive input-fuzzing pass (see FINDING-002 Investigation Notes).', findRef: 'N/A', evidRef: 'N/A',
    acRef: '"Allows only normal characters (no special characters or numbers)."', runScopeRef: RUN_SCOPE,
    category: 'Negative — Empty Values (boundary)', assumptionBased: true,
    assumptionNote: 'Assumption-based test — verify requirement before execution.',
  },
  {
    id: 'TC-ROLE-006', title: 'Unicode/non-Latin script in Role Name', objective: 'Verify how the Role Name field handles non-Latin-script input (e.g. Arabic, CJK).',
    priority: 'P3', risk: 'Low — no AC statement either way; this project has a precedent (BR-001, Agency Contact-person) of Arabic-script input being unsupported by design elsewhere in this app',
    preconditions: 'Logged in as odeysysadmin. On /admin/role/add.',
    testData: 'Role Name: "دور تجريبي" (Arabic) and, separately, "テスト役割" (Japanese)',
    steps: '1. Enter the Unicode string in Role Name. 2. Select any one permission checkbox. 3. Click Send For Approval.',
    expected: 'Not independently verified this run — likely rejected by the "alphabetic characters only" rule (consistent with TC-ROLE-002), but not directly confirmed for non-Latin scripts specifically.',
    reqRef: 'FR-ROLECRT-NAME-01', discRef: 'Not independently verified in Discovery this run.', findRef: 'N/A', evidRef: 'N/A',
    acRef: '"Allows only normal characters (no special characters or numbers)."', runScopeRef: RUN_SCOPE,
    category: 'Negative — Unicode', assumptionBased: true,
    assumptionNote: 'Assumption-based test — verify requirement before execution.',
  },
  {
    id: 'TC-ROLE-007', title: 'Long Role Name (boundary)', objective: 'Verify behavior when Role Name is filled with a very long string (e.g. 500+ characters).',
    priority: 'P4', risk: 'Low — no stated max-length in the AC; a genuine but low-likelihood gap',
    preconditions: 'Logged in as odeysysadmin. On /admin/role/add.',
    testData: 'Role Name: a repeated-letter string, 500 characters',
    steps: '1. Enter the 500-character string in Role Name. 2. Select any one permission checkbox. 3. Click Send For Approval.',
    expected: 'Not independently verified this run — no max-length behavior observed or documented.',
    reqRef: 'FR-ROLECRT-NAME-01', discRef: 'Not independently verified in Discovery this run.', findRef: 'N/A', evidRef: 'N/A',
    acRef: 'N/A — no max-length stated in the AC', runScopeRef: RUN_SCOPE,
    category: 'Negative — Boundary Values', assumptionBased: true,
    assumptionNote: 'Assumption-based test — verify requirement before execution.',
  },
  {
    id: 'TC-ROLE-008', title: 'SQL-injection-style string in Role Name (input-handling probe only)', objective: 'Verify a SQL-injection-shaped string is handled as ordinary invalid text input, with no database error surfaced and no unintended effect — probe only, never to actually exploit anything.',
    priority: 'P3', risk: 'Medium — a raw DB error or unexpected success would be a real input-handling defect',
    preconditions: 'Logged in as odeysysadmin. On /admin/role/add.',
    testData: "Role Name: \"' OR '1'='1\"",
    steps: '1. Enter the payload string in Role Name. 2. Select any one permission checkbox. 3. Click Send For Approval.',
    expected: 'Not independently verified this run — expected to be rejected by the same alphabetic-only rule as TC-ROLE-002 (the payload contains special characters), with no raw error/stack trace surfaced.',
    reqRef: 'FR-ROLECRT-NAME-01', discRef: 'Not independently verified in Discovery this run.', findRef: 'N/A', evidRef: 'N/A',
    acRef: '"Allows only normal characters (no special characters or numbers)."', runScopeRef: RUN_SCOPE,
    category: 'Negative — Security Inputs', assumptionBased: true,
    assumptionNote: 'Assumption-based test — verify requirement before execution.',
  },
  {
    id: 'TC-ROLE-009', title: 'At least one authorization checkbox is required', objective: 'Verify submitting with zero permission checkboxes selected (valid Role Name) is blocked.',
    priority: 'P1', risk: 'Medium — inherited from FINDING-002',
    preconditions: 'Logged in as odeysysadmin. On /admin/role/add.',
    testData: 'Role Name: "QA Spike Test Role" (valid, unique). Zero permission checkboxes selected.',
    steps: '1. Enter a valid unique Role Name. 2. Leave every permission checkbox unselected. 3. Click Send For Approval.',
    expected: '"Please Select at least one Privilege." is shown; submission is blocked. (Actual live text — not the AC\'s quoted "One authorization at least must be selected.", per FINDING-002.)',
    reqRef: 'FR-ROLECRT-AUTH-01', discRef: DISC + 'Timeline.md #15; findings/FINDING-002_ValidationMessageTextMismatch/case2-no-authorization-PleaseSelectPrivilege.png', findRef: 'FINDING-002', evidRef: 'findings/FINDING-002_ValidationMessageTextMismatch/case2-no-authorization-PleaseSelectPrivilege.png',
    acRef: '"At least one segment or authority check box has to be selected."', runScopeRef: RUN_SCOPE,
    category: 'Negative — Empty Values',
  },
  {
    id: 'TC-ROLE-010', title: 'Selecting one permission checkbox satisfies the Authorization requirement', objective: 'Verify selecting exactly one permission checkbox (any row) clears the "at least one authorization" validation.',
    priority: 'P2', risk: 'Low — positive counterpart to TC-ROLE-009',
    preconditions: 'Logged in as odeysysadmin. On /admin/role/add.',
    testData: 'Role Name: valid, unique. Dashboard > View checkbox selected.',
    steps: '1. Enter a valid unique Role Name. 2. Select Dashboard > View only. 3. Click Send For Approval.',
    expected: 'No "Please Select at least one Privilege." message is shown (indirectly confirmed via TC-ROLE-001\'s combined scenario).',
    reqRef: 'FR-ROLECRT-AUTH-01', discRef: DISC + 'Timeline.md #15', findRef: 'N/A', evidRef: 'N/A',
    acRef: '"At least one segment or authority check box has to be selected."', runScopeRef: RUN_SCOPE,
    category: 'Positive',
  },
  {
    id: 'TC-ROLE-011', title: 'Module segments are displayed as a tab bar', objective: 'Verify the Add Role screen displays every primary module as a segment/tab.',
    priority: 'P1', risk: 'High — the entire permission-assignment UI depends on this structure existing',
    preconditions: 'Logged in as odeysysadmin. On /admin/role/add.',
    testData: 'N/A (structural observation)',
    steps: '1. Navigate to /admin/role/add. 2. Observe the module-segment tab bar (scroll/click "›" to see all entries).',
    expected: '11 segments observed for this session\'s tier: Dashboard, Admin, Master, Rule Engine, Settings, User Management, Booking-Mid Office, Profile, Reports, PNR Query, Transfer PNR. NOTE: asserts the ACTUALLY-OBSERVED 11-item list, not the AC\'s original 9-item list (Dashboard/Admin/Master/Rule Engine/Settings/User Management/Booking Mid Office/Profile/Reports) — see FINDING-004.',
    reqRef: 'FR-ROLECRT-MOD-01', discRef: DISC + '01-AddRole_Admin-Company-tab.png; Timeline.md #8, #18', findRef: 'N/A', evidRef: 'N/A',
    acRef: '"The system must display all primary modules as segments..."', runScopeRef: RUN_SCOPE,
    category: 'Positive (structural)',
  },
  {
    id: 'TC-ROLE-012', title: 'Admin segment shows Company/Branch/Agency/Staff sub-module tabs', objective: 'Verify the Admin module segment reveals its documented sub-module tabs.',
    priority: 'P1', risk: 'High — core structural requirement for the Admin segment specifically',
    preconditions: 'Logged in as odeysysadmin. On /admin/role/add.',
    testData: 'N/A (structural observation)',
    steps: '1. Click the "Admin" module segment. 2. Observe the sub-module tab bar beneath it.',
    expected: 'Company, Branch, Agency, Staff sub-module tabs are shown, matching the AC\'s own example exactly.',
    reqRef: 'FR-ROLECRT-MOD-04', discRef: DISC + '01-AddRole_Admin-Company-tab.png; Timeline.md #9', findRef: 'N/A', evidRef: 'N/A',
    acRef: '"Example: Admin: Company, Branch, Agency, Staff"', runScopeRef: RUN_SCOPE,
    category: 'Positive (structural)',
  },
  {
    id: 'TC-ROLE-013', title: 'Company sub-module shows its tab grid (Operating Country/Role/Department/Advance Credit-Top Up)', objective: 'Verify a sub-module tab displays a grid listing its specific tabs, each with View/Edit/Approve checkboxes.',
    priority: 'P1', risk: 'High — core structural requirement; this is also the row that resolves the Project Context\'s naming-collision question',
    preconditions: 'Logged in as odeysysadmin. On /admin/role/add, Admin segment active.',
    testData: 'N/A (structural observation)',
    steps: '1. With the Admin segment active, click the "Company" sub-module tab. 2. Observe the grid.',
    expected: '4 rows shown: Operating Country, Role, Department, Advance Credit/Top Up — each with its own View/Edit/Approve checkbox triplet. Confirms the AC\'s own example verbatim, and confirms this "Role" row is the same entity as this whole document\'s subject (Project Context §6 #3, resolved).',
    reqRef: 'FR-ROLECRT-TAB-01', discRef: DISC + '01-AddRole_Admin-Company-tab.png; Timeline.md #9', findRef: 'N/A', evidRef: 'N/A',
    acRef: '"...must have a grid listing its specific tabs, such as: Operating Countries, Role, Department, Advanced Pop-Up"', runScopeRef: RUN_SCOPE,
    category: 'Positive (structural)',
  },
  {
    id: 'TC-ROLE-014', title: 'View checkbox can be selected independently', objective: 'Verify selecting only View (without Edit or Approve) on any permission row is allowed and does not force-select the others.',
    priority: 'P1', risk: 'Medium — inherited from the AC\'s own explicit checkbox-behavior statement',
    preconditions: 'Logged in as odeysysadmin. On /admin/role/add, Admin > Company tab active.',
    testData: 'Advance Credit/Top Up row: View checkbox only.',
    steps: '1. Click the View checkbox on the "Advance Credit/Top Up" row only. 2. Observe Edit and Approve on the same row.',
    expected: 'View is checked; Edit and Approve remain unchecked.',
    reqRef: 'FR-ROLECRT-PERM-01', discRef: DISC + '03-AddRole_Approve-implies-View_and_View-alone.png; Timeline.md #13', findRef: 'N/A', evidRef: 'N/A',
    acRef: '"The \'View\' checkbox can be selected independently."', runScopeRef: RUN_SCOPE,
    category: 'Positive',
  },
  {
    id: 'TC-ROLE-015', title: 'Ticking Edit auto-selects View', objective: 'Verify ticking the Edit checkbox on a permission row automatically checks View on the same row.',
    priority: 'P1', risk: 'Medium — inherited from the AC\'s own explicit checkbox-behavior statement',
    preconditions: 'Logged in as odeysysadmin. On /admin/role/add, Admin > Company tab active.',
    testData: 'Role row: Edit checkbox.',
    steps: '1. Click the Edit checkbox on the "Role" row. 2. Observe View and Approve on the same row.',
    expected: 'Edit is checked; View is automatically checked; Approve remains unchecked.',
    reqRef: 'FR-ROLECRT-PERM-02', discRef: DISC + '02-AddRole_Edit-implies-View.png; Timeline.md #11', findRef: 'N/A', evidRef: 'N/A',
    acRef: '"If the \'Edit\' checkbox is ticked, the \'View\' checkbox is automatically selected."', runScopeRef: RUN_SCOPE,
    category: 'Positive',
  },
  {
    id: 'TC-ROLE-016', title: 'Ticking Approve auto-selects View', objective: 'Verify ticking the Approve checkbox on a permission row automatically checks View on the same row.',
    priority: 'P1', risk: 'Medium — inherited from the AC\'s own explicit checkbox-behavior statement',
    preconditions: 'Logged in as odeysysadmin. On /admin/role/add, Admin > Company tab active.',
    testData: 'Department row: Approve checkbox.',
    steps: '1. Click the Approve checkbox on the "Department" row. 2. Observe View and Edit on the same row.',
    expected: 'Approve is checked; View is automatically checked; Edit remains unchecked.',
    reqRef: 'FR-ROLECRT-PERM-03', discRef: DISC + '03-AddRole_Approve-implies-View_and_View-alone.png; Timeline.md #12', findRef: 'N/A', evidRef: 'N/A',
    acRef: '"If the \'Approval\' checkbox is ticked, the \'View\' checkbox is automatically selected."', runScopeRef: RUN_SCOPE,
    category: 'Positive',
  },
  {
    id: 'TC-ROLE-017', title: 'Unchecking Edit/Approve does not auto-uncheck View', objective: 'Verify that once View has been auto-selected by Edit or Approve, subsequently unchecking Edit/Approve leaves View checked (no reverse auto-deselect).',
    priority: 'P3', risk: 'Low — plausible but unstated corollary of PERM-02/03; not itself AC-mandated',
    preconditions: 'Logged in as odeysysadmin. On /admin/role/add, Admin > Company tab active. Edit ticked on the "Role" row (View auto-checked per TC-ROLE-015).',
    testData: 'Role row: uncheck Edit after it auto-selected View.',
    steps: '1. With Edit checked and View auto-checked on the Role row, click Edit again to uncheck it. 2. Observe View.',
    expected: 'Not independently verified this run — the AC states only the forward direction (ticking Edit/Approve selects View); the reverse behavior is unstated and untested.',
    reqRef: 'FR-ROLECRT-PERM-02', discRef: 'Not independently verified in Discovery this run — the AC does not state reverse-direction behavior; this is a plausible corollary check, not a stated requirement.', findRef: 'N/A', evidRef: 'N/A',
    acRef: 'N/A — not stated by the AC', runScopeRef: RUN_SCOPE,
    category: 'Negative — Boundary (interaction)', assumptionBased: true,
    assumptionNote: 'Assumption-based test — verify requirement before execution.',
  },
  {
    id: 'TC-ROLE-018', title: 'Checkbox selections on one row do not affect other rows', objective: 'Verify that selecting/deselecting permissions on one row (e.g. Role) has no effect on sibling rows (e.g. Operating Country, Department) in the same grid.',
    priority: 'P3', risk: 'Low — plausible isolation expectation, not directly AC-stated, but a real risk if the grid were mis-implemented as a single shared state',
    preconditions: 'Logged in as odeysysadmin. On /admin/role/add, Admin > Company tab active.',
    testData: 'Role row: Edit + View auto-checked. Operating Country / Department / Advance Credit-Top Up rows: untouched.',
    steps: '1. Tick Edit on the "Role" row (per TC-ROLE-015). 2. Observe the other three rows in the same grid.',
    expected: 'Operating Country, Department, and Advance Credit/Top Up rows remain exactly as they were before — unaffected by the Role row\'s change. Indirectly supported by the screenshot evidence (only the Role row\'s checkboxes changed state across the session) but not exhaustively re-verified for every row combination.',
    reqRef: 'FR-ROLECRT-TAB-01', discRef: DISC + '02-AddRole_Edit-implies-View.png (row-isolation visible in the same screenshot used for TC-ROLE-015)', findRef: 'N/A', evidRef: 'N/A',
    acRef: 'N/A — Integration Behaviour dimension, not directly AC-stated', runScopeRef: RUN_SCOPE,
    category: 'Positive (Integration Behaviour)',
  },
  {
    id: 'TC-ROLE-019', title: 'Cancel discards inputs and navigates to the Role List (Search Role) screen', objective: 'Verify clicking Cancel on Add Role clears/exits the form without saving and navigates to the Role List screen.',
    priority: 'P1', risk: 'Medium — inherited from BR-ROLECRT-01 (navigation-target dependency)',
    preconditions: 'Logged in as odeysysadmin. On /admin/role/add with an unsaved Role Name entered.',
    testData: 'Role Name: "QA Spike Unsaved" (deliberately never submitted).',
    steps: '1. Enter "QA Spike Unsaved" in Role Name. 2. Click Cancel.',
    expected: 'Navigates to /admin/role (the Role List/Search screen). No new role named "QA Spike Unsaved" appears in the Role list (115-row count unchanged).',
    reqRef: 'FR-ROLECRT-ACTION-02', discRef: DISC + '04-Cancel_navigates-to-RoleList.png; Timeline.md #19', findRef: 'N/A', evidRef: 'N/A',
    acRef: '"Cancel: Clears the inputs or exits the role creation process without saving & navigates to the Search Role Screen."', runScopeRef: RUN_SCOPE,
    category: 'Positive',
  },
  {
    id: 'TC-ROLE-020', title: 'Submission button is labeled "Send For Approval"', objective: 'Verify the primary submission button\'s live label, since it differs from the AC\'s stated wording.',
    priority: 'P4', risk: 'Low — inherited from FINDING-003 (cosmetic/label mismatch)',
    preconditions: 'Logged in as odeysysadmin. On /admin/role/add.',
    testData: 'N/A (structural observation)',
    steps: '1. Observe the primary submission button at the bottom of the Add Role form.',
    expected: 'Button reads "Send For Approval" — NOT "Submit for Approval" as the AC states. Assert the live label per FINDING-003; the underlying submit-and-route-to-approval behavior is otherwise unaffected.',
    reqRef: 'FR-ROLECRT-ACTION-01', discRef: DISC + '00-AddRole_Dashboard-tab.png; findings/FINDING-003_ActionButtonLabelMismatch/send-for-approval-button.png', findRef: 'FINDING-003', evidRef: 'findings/FINDING-003_ActionButtonLabelMismatch/send-for-approval-button.png',
    acRef: '"Submit for Approval: Initiates the process to save and submit the role for approval."', runScopeRef: RUN_SCOPE,
    category: 'Positive (structural)',
  },
  {
    id: 'TC-ROLE-021', title: 'Exploratory charter — confirm intended status of the "Select All" checkbox (FINDING-001)', objective: 'Not a fixed pass/fail assertion — a scoped charter for a human reviewer to confirm whether "Select All" is planned, descoped, or a build defect, since it does not exist live despite the AC describing it.',
    priority: 'P2', risk: 'Medium — inherited from FINDING-001 Business Risk',
    preconditions: 'Logged in as odeysysadmin (or Admin tier, if available). On /admin/role/add.',
    testData: 'N/A — exploratory charter, not a fixed input',
    steps: '1. Reviewer opens any sub-module tab with multiple rows (e.g. Admin > Company). 2. Confirm with the Product Owner/dev team whether a "Select All" control was intentionally omitted from this build, is planned for a later release, or is a genuine defect. 3. If/when implemented, re-verify it selects View+Edit+Approval for every row in that sub-module.',
    expected: 'Reviewer confirms one of: (a) intentionally not built yet — track as a future enhancement, (b) a genuine defect — file for a fix, or (c) the AC itself should be corrected to remove this requirement. No fixed pass/fail outcome is asserted by this agent.',
    reqRef: 'FR-ROLECRT-MOD-02 / FR-ROLECRT-MOD-03', discRef: DISC + 'findings/FINDING-001_SelectAllCheckboxMissing/metadata.md', findRef: 'FINDING-001', evidRef: 'findings/FINDING-001_SelectAllCheckboxMissing/company-tab-no-select-all.png, dashboard-tab-no-select-all.png',
    acRef: '"...with an option to \'Select All\' checkbox. Behavior: Select all checkboxes (View, Edit, Approval) for all Rows..."', runScopeRef: RUN_SCOPE,
    category: 'Exploratory (Finding disposition)',
  },
  {
    id: 'TC-ROLE-022', title: 'Exploratory charter — confirm the intended module-segment list, and whether it is tier-dependent (FINDING-004)', objective: 'Not a fixed pass/fail assertion — a scoped charter for a human reviewer to confirm the correct segment list and whether it varies by Admin tier.',
    priority: 'P3', risk: 'N/A — ties to a Requirement Gap, not a defect claim',
    preconditions: 'This run: odeysysadmin (Super Admin) only. Admin-tier credential (e.saady) not available in credentials.json.',
    testData: 'N/A — exploratory charter',
    steps: '1. Reviewer confirms with the Product Owner the intended, complete module-segment list for the Add Role screen. 2. Once the Admin-tier credential is available, re-open /admin/role/add as that tier and compare its segment list against this run\'s 11-item Super Admin list.',
    expected: 'Reviewer confirms the intended segment list (updating the AC/Project Context accordingly) and, once tested, whether the Admin tier sees a different list — directly closing out the project\'s existing FINDING-004 (multi-tier roles) for this specific screen.',
    reqRef: 'FR-ROLECRT-MOD-01', discRef: DISC + 'findings/FINDING-004_ModuleSegmentListDiscrepancy/metadata.md', findRef: 'FINDING-004', evidRef: 'findings/FINDING-004_ModuleSegmentListDiscrepancy/full-segment-tab-bar.png, super-admin-11item-navbar.png',
    acRef: '"...including: Dashboard, Admin, Master, Rule Engine, Settings, User Management, Booking Mid Office, Profile, Reports."', runScopeRef: RUN_SCOPE,
    category: 'Exploratory (Finding disposition)',
  },
];

// ---- Coverage Gaps / Not Applicable dimension log (documented, never silently dropped) ----
const COVERAGE_GAPS = [
  { area: 'FR-ROLECRT-MOD-02 / FR-ROLECRT-MOD-03 (Select All)', status: 'Blocked — feature not present live', reason: 'Cannot design a fixed pass/fail positive test for a control that does not exist. Dispositioned as Exploratory charter TC-ROLE-021 instead. See FINDING-001.' },
  { area: 'Permissions dimension — role-tier access to /admin/role/add itself', status: 'Unknown/Unassessed', reason: 'Whether a lower-privileged or Admin-tier (non-Super-Admin) user can reach this screen at all is untested — only the odeysysadmin (Super Admin) credential is available in credentials.json this run. Ties to Project Context §6 #2/#7 and the project\'s existing FINDING-004.' },
  { area: 'Configuration dimension', status: 'Not Applicable', reason: 'No feature-flag/config toggle is documented in the Project Context for this screen.' },
  { area: 'Timeouts (Negative Test Generation)', status: 'Not Applicable', reason: 'No slow-network simulation tool was available this run; standard submission timing was not distinguishable from the Empty/Invalid categories already covered.' },
  { area: 'Full end-to-end successful Role creation', status: 'Partially Covered', reason: 'Mutation is not authorized on this shared staging environment this run (Project Context §5) — TC-ROLE-001/010 verify the pre-submission validation signals only, not a completed save. See TC-ROLE-001\'s assumption note.' },
];

// ---- Markdown generation ----
function renderMarkdownSuite(moduleName, cases) {
  let md = `# NDC — Manual Test Suite — ${moduleName}\n\n`;
  md += `> **Run:** RUN-20260721-001 | **Status:** Pending Review | Generated by Test Design Agent v3 from a single source of truth shared with the Excel export (never diverges). Run Scope: ${RUN_SCOPE}.\n\n`;
  for (const c of cases) {
    md += `## ${c.id} — ${c.title}\n\n`;
    if (c.assumptionNote) md += `> ${c.assumptionNote}\n\n`;
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
    md += `| Acceptance Criteria Reference | ${c.acRef} |\n`;
    md += `| Run Scope Reference | ${c.runScopeRef} |\n`;
    md += `| Category | ${c.category} |\n\n`;
  }
  md += `## Coverage Gaps / Not Applicable Dimensions (documented, not silently dropped)\n\n`;
  md += `| Area | Status | Reason |\n|---|---|---|\n`;
  for (const g of COVERAGE_GAPS) md += `| ${g.area} | ${g.status} | ${g.reason} |\n`;
  return md;
}

fs.writeFileSync(path.join(OUT_DIR, 'NDC_TestCases_Role.md'), renderMarkdownSuite('Admin → Role Management → Create Role', ROLE_CASES));

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
  { header: 'Requirement Reference', key: 'reqRef', width: 24 },
  { header: 'Discovery Reference', key: 'discRef', width: 40 },
  { header: 'Finding Reference', key: 'findRef', width: 16 },
  { header: 'Evidence Reference', key: 'evidRef', width: 30 },
  { header: 'Acceptance Criteria Reference', key: 'acRef', width: 40 },
  { header: 'Run Scope Reference', key: 'runScopeRef', width: 30 },
  { header: 'Category', key: 'category', width: 30 },
];

async function buildWorkbook() {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Test Design Agent v3';

  const ws = wb.addWorksheet('Role');
  ws.columns = COLUMNS;
  ws.getRow(1).font = { bold: true };
  ROLE_CASES.forEach((c) => ws.addRow(c));
  ws.autoFilter = { from: 'A1', to: `${String.fromCharCode(64 + COLUMNS.length)}1` };

  const wsGaps = wb.addWorksheet('Coverage Gaps');
  wsGaps.columns = [
    { header: 'Area', key: 'area', width: 45 },
    { header: 'Status', key: 'status', width: 25 },
    { header: 'Reason', key: 'reason', width: 80 },
  ];
  wsGaps.getRow(1).font = { bold: true };
  COVERAGE_GAPS.forEach((g) => wsGaps.addRow(g));

  await wb.xlsx.writeFile(path.join(OUT_DIR, 'NDC_TestCases_Role.xlsx'));
  console.log('Excel workbook written.');
}

buildWorkbook().then(() => console.log('Markdown + Excel generated for', ROLE_CASES.length, 'Role test cases.'));

module.exports = { ROLE_CASES, COVERAGE_GAPS };
