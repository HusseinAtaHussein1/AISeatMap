# QA Assessment Report — OrangeHRM (Open Source Demo)

**Target application:** https://opensource-demo.orangehrmlive.com/
**Version:** OrangeHRM OS 5.8
**Account used:** `Admin` / `admin123` (Admin role)
**Assessment method:** Manual, browser-driven exploratory testing via Playwright MCP tools (no automation code written)
**Date:** 2026-07-03

---

## 1. Application Overview

OrangeHRM is an open-source Human Resource Management System (HRMS) covering the core employee lifecycle: identity/access administration, personnel records, leave, time & attendance, recruitment, and performance management. The instance under test is the public shared demo environment — it is pre-seeded with real-looking data from prior anonymous testers and is **not an isolated test environment**, which materially affects what can safely be exercised (see [Assumptions](#7-assumptions)).

The application is a single-page app (Vue-based, `oxd-*` component classes) served behind a traditional server-rendered login page. Navigation is organized around a persistent left sidebar (10 top-level modules) and a per-module horizontal tab/dropdown bar. Most entity records (employees, users, leave requests) are cross-referenced by internal IDs (`empNumber`, etc.) and surfaced via a shared "Employee Name" typeahead component reused across five different modules.

**Top-level modules:** Admin, PIM, Leave, Time, Recruitment, My Info, Performance, Dashboard, Directory, Maintenance.

---

## 2. Feature Inventory

### 2.1 Sitemap

```
/auth/login                                  Login
/auth/requestPasswordResetCode               Forgot Password (username entry)
/auth/sendPasswordReset                      Reset-link confirmation
/dashboard/index                             Dashboard

/admin/viewSystemUsers                       Admin > User Management > Users
/admin/saveSystemUser                        Admin > Add/Edit User
  Admin > Job > Job Titles / Pay Grades / Employment Status / Job Categories / Work Shifts
  Admin > Organization > General Information / Locations / Structure
  Admin > Qualifications > Skills / Education / Licenses / Languages / Memberships
  Admin > Nationalities
  Admin > Corporate Branding
  Admin > Configuration > Email Configuration / Email Subscriptions / Localization /
           Language Packages / Modules / Social Media Auth / Register OAuth Client / LDAP Configuration

/pim/viewEmployeeList                        PIM > Employee List
/pim/addEmployee                             PIM > Add Employee
  PIM > Reports
/pim/viewPersonalDetails/empNumber/{id}      Employee > Personal Details
/pim/contactDetails/empNumber/{id}           Employee > Contact Details
/pim/viewEmergencyContacts/empNumber/{id}    Employee > Emergency Contacts
/pim/viewDependents/empNumber/{id}           Employee > Dependents
/pim/viewImmigration/empNumber/{id}          Employee > Immigration
/pim/viewJobDetails/empNumber/{id}           Employee > Job
/pim/viewSalaryList/empNumber/{id}           Employee > Salary
/pim/viewReportToDetails/empNumber/{id}      Employee > Report-to
/pim/viewQualifications/empNumber/{id}       Employee > Qualifications
/pim/viewMemberships/empNumber/{id}          Employee > Memberships
/pim/viewMyDetails                           My Info (= own Personal Details view)

/leave/applyLeave                            Leave > Apply
/leave/viewLeaveList                         Leave > My Leave / Leave List
  Leave > Entitlements > Add / Employee / My Entitlements
  Leave > Reports > Leave Entitlements & Usage / My Usage
  Leave > Configure > Leave Period / Leave Types / Work Week / Holidays
  Leave > Assign Leave

/time/viewEmployeeTimesheet                  Time > Timesheets (Select Employee / Pending Action)
  Time > Attendance > My Records / Punch In-Out / Employee Records / Configuration
  Time > Reports
  Time > Project Info

/recruitment/viewCandidates                  Recruitment > Candidates
  Recruitment > Vacancies

/performance/searchEvaluatePerformanceReview Performance > Manage Reviews
  Performance > My Trackers / Employee Trackers
  Performance > Configure > KPIs / Trackers

/directory/viewDirectory                     Directory (org-wide employee search)

/maintenance/viewMaintenanceModule → /maintenance/purgeEmployee
  Gated by an "Administrator Access" re-authentication (password re-entry) screen
```

~45+ distinct routed views across 10 top-level modules once submenus and per-employee tabs are counted.

### 2.2 Business Modules

| Module | Purpose |
|---|---|
| **Admin** | System user accounts, RBAC roles, org structure, job metadata, localization, integrations (LDAP/OAuth/social login) |
| **PIM** (Personnel Info Management) | Employee master data — the system of record other modules key off (`empNumber`) |
| **Leave** | Leave requests, approvals, entitlements, leave types/periods/holidays config |
| **Time** | Timesheets, attendance/punch clock, project time tracking |
| **Recruitment** | Candidate pipeline, vacancies, hiring workflow |
| **Performance** | KPIs, performance trackers, review cycles |
| **My Info / Directory** | Self-service view of own record; org-wide people search |
| **Dashboard** | Landing page — Time at Work widget, My Actions, Quick Launch, org distribution charts |
| **Maintenance** | Destructive/administrative utilities (employee purge), step-up authenticated |

### 2.3 Key Reusable Components

- **Employee Name typeahead** — identical component appears in PIM, Leave, Time, Performance, and Directory search filters, all resolving to the same employee master record.
- **Topbar tab/dropdown navigation** — consistent pattern (flat tabs + dropdown menus) across every module.
- **User profile menu** — About, Support, Change Password, Logout (top-right avatar).

---

## 3. User Workflows

1. **Authentication** — login, invalid-credential handling, forgot-password (username → emailed reset link), logout, deep-link redirect-after-login.
2. **User provisioning** — Admin creates a System User (User Role, linked Employee, Username, Password) **or** ties login credentials to a new employee at creation time in PIM via the "Create Login Details" toggle — two entry points converge on the same user-account object.
3. **Employee lifecycle** — Add Employee → fill out Personal/Contact/Job/Salary/Immigration/Dependents/Qualifications tabs → assign Job Title/Sub Unit/Supervisor → appears in Directory and as a selectable "Employee Name" typeahead across Leave/Time/Performance.
4. **Leave request lifecycle** — entitlement assigned (Admin/Supervisor) → employee applies (blocked if zero balance) → appears in Leave List with status → approver actions.
5. **Timesheet lifecycle** — employee submits timesheet → appears under "Timesheets Pending Action" → supervisor/admin views and approves.
6. **Attendance punch** — Punch In/Out feeds the Dashboard "Time at Work" widget in near real time.
7. **Recruitment pipeline** — Vacancy created → Candidates linked to vacancy/job title/hiring manager → status progression.
8. **Step-up auth for destructive action** — accessing Maintenance > Purge Employee requires re-entering the current user's password before proceeding.
9. **Cross-module identity binding** — the "Employee Name" typeahead appears identically in five modules, all resolving to the same employee master record.

---

## 4. Risk Analysis

| Risk Area | Observation | Impact |
|---|---|---|
| **No visible brute-force protection** | Repeated failed logins showed no CAPTCHA, lockout, or delay in the UI after a wrong password. | High — credential-stuffing exposure if not enforced server-side |
| **User creation / RBAC** | Add User ties Username + Password + Role + Employee together; incorrect Employee↔User linkage or role assignment is a privilege-escalation-adjacent risk. | High |
| **Destructive Maintenance function** | Purge Employee is a real data-deletion path. Gated by password re-entry (good), but is the single highest blast-radius action in the app; cascading references from Leave/Time/Performance need verification. | High |
| **Data integrity in PIM** | The shared demo's Employee List (50 records) shows duplicate names, blank Job Title/Employment Status/Sub Unit fields, and garbled entries (e.g., "èdf fff", "hihh rff"). Indicates weak/absent validation on required-ish fields and/or accumulated dirty test data. | Medium |
| **Employee Id field is free-text and editable** | The suggested next ID (e.g., "0491") on Add Employee is shown in an editable textbox — a user could submit a duplicate or malformed ID. | Medium |
| **Leave balance edge case** | Apply Leave fails gracefully into a "No Leave Types with Leave Balance" message rather than a hard error, but confirms entitlement provisioning is an easy-to-misconfigure prerequisite. | Low–Medium |
| **Password strength** | Only a text hint is shown on Add User ("use upper/lower/symbols/numbers"); no visible real-time strength meter or enforced complexity in the UI. | Medium |
| **Date format ambiguity** | Leave List filters use `yyyy-dd-mm` (day before month) rather than the more common `yyyy-mm-dd` — high risk of misreading/mis-entry. | Medium |
| **Shared/public demo state** | This instance is shared across all internet users of the demo; any exploration that creates/edits/deletes data affects everyone. | N/A (environment risk, not app risk) |
| **Auth-gated deep links** | Confirmed unauthenticated access to a direct Admin URL redirects to login and returns to the originally requested page after login. Needs verification this pattern holds for every module URL, not just Admin. | Medium |

---

## 5. Regression Test Candidates

**Authentication**
- Valid login → dashboard; invalid password → "Invalid credentials" alert, form retains username, password field cleared.
- Deep-link to a protected URL while logged out → redirected to login → after successful login, lands on the originally requested page (not just dashboard).
- Forgot Password with a valid vs. invalid username → identical generic success message (regression-test that this stays true; a message differing by username validity would be an enumeration regression).
- Logout invalidates session — back button after logout should not reveal cached protected content.
- Repeated failed logins — confirm whether/when an account lock or throttle kicks in.

**User & Employee Management**
- Create System User with each Role (Admin/ESS) × Status (Enabled/Disabled) combination; verify Disabled users cannot log in.
- Create Employee with "Create Login Details" ON vs OFF; verify the System Users list reflects the linkage correctly.
- Duplicate Employee Id submission — confirm server rejects, or the UI's suggested ID always stays unique under concurrent adds.
- Required-field validation on Employee Full Name, Username, Password/Confirm Password mismatch.
- Delete/purge an employee who has existing Leave, Timesheet, or Performance records — verify referential integrity (no orphaned records, no server errors elsewhere).

**Leave**
- Apply Leave with zero entitlement → correct blocking message (baseline behavior already observed).
- Apply Leave spanning a weekend/holiday per configured Work Week/Holidays.
- Leave List date filters at format boundaries (day = 31, month = 12) given the `yyyy-dd-mm` layout.
- Approve/reject a pending leave request and verify balance recalculation.

**Time**
- Punch In → Punch Out → verify Dashboard "Time at Work" and weekly total update correctly.
- Submit a timesheet, confirm it appears under "Timesheets Pending Action" for the correct approver only.

**Cross-cutting**
- Employee Name typeahead (used in PIM/Leave/Time/Performance/Directory) — verify consistent search behavior, and that "Current Employees Only" / "Include Past Employees" toggles are respected.
- Role-based visibility — log in as an ESS (non-admin) user and verify Admin/Maintenance modules are blocked at the URL level, not just hidden from navigation.
- Maintenance > Purge Employee — Cancel must not perform any deletion or partial mutation; the Confirm path needs isolated test-environment coverage only (never against shared demo data).

---

## 6. Exploratory Testing Findings

| # | Finding | Type |
|---|---|---|
| 1 | **Apply Leave blocked with "No Leave Types with Leave Balance"** for the default Admin account — core workflow is unusable until entitlements are explicitly configured. | Functional / data-dependency |
| 2 | **Maintenance module requires step-up re-authentication** (password re-entry) before reaching the employee purge screen. | Positive security control |
| 3 | **Password-reset flow returns an identical generic success message** ("Reset Password link sent successfully") for both a valid and a clearly nonexistent username. | Positive security control (anti-enumeration) |
| 4 | **No lockout, delay, or CAPTCHA observed** after a failed login attempt in the UI. | Potential gap |
| 5 | **Login after a deep-link redirect returns the user to the originally requested page** (tested via Admin > System Users), not a generic dashboard. | Functional (positive UX/consistency) |
| 6 | **Employee List (50 records) contains visible data-quality issues**: duplicate names ("Alaa Mohamed" ×6, "Ishwari Devendra Bendale" ×4, "Sanjay Kumar s" ×3), blank Job Title/Employment Status/Sub Unit for most rows, and garbled test entries ("èdf fff", "hihh rff", "hiih hihi"). | Data integrity |
| 7 | **Add Employee's "Employee Id" field is pre-filled but freely editable** as plain text, rather than being read-only/system-generated. | Design/validation gap |
| 8 | **Leave List date pickers use a `yyyy-dd-mm` field format** (confirmed via placeholder and populated value `2026-24-08`), which is non-standard and easy to misread. | Usability |
| 9 | **Console messages showed no JavaScript errors** during navigation across all 10 modules, login, logout, and the forgot-password flow. | Positive (stability) |
| 10 | **"Create Login Details" toggle on Add Employee** was not fully exercised (avoided to prevent creating persistent data in the shared demo) — behavior of the revealed username/password sub-fields is inferred, not confirmed, to mirror the standalone Add User form. | Needs follow-up |

---

## 7. Assumptions

- The instance tested is the **public, shared OrangeHRM demo environment** — data was not created or reset by this assessment, and pre-existing records (50 employees, 3 system users) reflect prior anonymous users' activity, not a controlled fixture set.
- Testing was performed with a **single Admin-role account**; no ESS (Employee Self-Service) or other role was available to verify role-based access boundaries directly — RBAC risk statements are inferred from UI structure (role dropdown values, module gating) rather than confirmed by logging in as a lower-privileged user.
- **No destructive or state-mutating actions were performed** (no employee/user creation, no purge execution) to avoid corrupting shared demo data; several findings (e.g., duplicate-ID handling, purge cascade behavior) are therefore based on UI inspection rather than end-to-end execution.
- Server-side enforcement (e.g., password complexity, brute-force throttling, RBAC on API endpoints) **may exist even where not visible in the UI**; absence of a visible control was treated as a risk to verify, not a confirmed defect.
- The application version is assumed stable at **OrangeHRM OS 5.8** for the duration of this assessment; the shared demo may be reset or updated by its maintainers at any time, invalidating specific data-based observations (e.g., record counts).

---

## 8. Open Questions

1. Does the backend enforce **account lockout or rate-limiting** after repeated failed login attempts, even though no such control is visible client-side?
2. What are the exact **role-permission boundaries** for non-Admin roles (e.g., ESS)? Are Admin/Maintenance routes blocked server-side for those roles, or only hidden from navigation?
3. What happens to an employee's **Leave, Timesheet, and Performance records** when that employee is purged via Maintenance — cascade delete, soft-delete, or orphaned references?
4. Is the **Employee Id** field on Add Employee validated for uniqueness server-side, and can it be edited post-creation?
5. Is the **duplicate/garbled employee data** observed in this shared instance a known artifact of public demo usage, or would it also occur in a fresh, isolated deployment (i.e., is there a real data-validation gap in Add Employee/Add User)?
6. What is the intended behavior of the **"Create Login Details" toggle** in Add Employee — does it enforce the same password rules as the standalone Add User form, and does it prevent duplicate-username conflicts with existing System Users?
7. Is the **`yyyy-dd-mm` date format** in Leave filters intentional/localized, or a labeling defect (i.e., should it read `yyyy-mm-dd`)?
8. Are there rate limits or notifications on the **password-reset email** flow (e.g., can it be triggered repeatedly for the same or different usernames without throttling)?

---

*Report generated from manual exploratory testing session using Playwright MCP browser automation tools. No test automation code was produced as part of this assessment.*
