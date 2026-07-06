# Product Requirements Document — OrangeHRM (Open Source Edition)

**Source of truth:** UI discovery artifacts (`artifacts/OrangeHRM/discovery/*.md`, Playwright accessibility snapshots) and `QA_Assessment_Report.md` (`artifacts/OrangeHRM/Reports/QA_Assessment_Report.md`).
**Target instance:** OrangeHRM OS 5.8, public open-source demo (`https://opensource-demo.orangehrmlive.com/`)
**Document status:** Reconstructed PRD — derived from observed UI behavior, not from an original spec. Any statement not directly observable in the discovery artifacts is explicitly flagged as an **Assumption**.

---

## 1. Product Overview

OrangeHRM is a web-based Human Resource Management System (HRMS) covering the core employee lifecycle: identity/access administration, personnel records (PIM), leave management, time & attendance, recruitment, and performance management.

The application is organized around a persistent left sidebar exposing 10 top-level modules — **Admin, PIM, Leave, Time, Recruitment, My Info, Performance, Dashboard, Directory, Maintenance** — and a per-module horizontal topbar with tabs/dropdowns for sub-features. Most entity records (employees, leave requests, timesheets, candidates) are cross-referenced by an internal employee identifier (`empNumber`) and are searchable through a shared "Employee Name" typeahead component reused across five modules (PIM, Leave, Time, Performance, Directory).

> Assumption: The functional intent of the product is to serve as a single system of record for employee data that other HR processes (leave, time, recruitment, performance) key off of — this is inferred from the consistent use of `empNumber` and the shared Employee Name typeahead across modules, not from an explicit design document.

## 2. Business Objectives

The following objectives are inferred from observed functionality, since no business requirements or goals documents were provided.

- Provide a centralized employee master record (PIM) that other HR functions depend on. > Assumption
- Enable self-service and manager workflows for leave requests, approvals, and entitlement tracking. > Assumption
- Support time capture (timesheets, attendance/punch clock) for payroll/project-tracking purposes. > Assumption
- Support end-to-end recruitment tracking from vacancy to candidate hire/rejection. > Assumption
- Support performance review cycles tied to employee records. > Assumption
- Provide administrators with organization-wide configuration (job structure, localization, integrations) and a controlled, re-authenticated path for destructive operations (employee purge). Confirmed by `maintenance.md`.
- Provide a searchable company directory for general employee lookup. Confirmed by `directory.md`.

## 3. User Roles

Only one role (**Admin**) was directly observed and exercised in the discovery artifacts and QA assessment ("Account used: Admin / admin123 (Admin role)").

| Role | Evidence | Status |
|---|---|---|
| **Admin** | Full sidebar access to Admin, PIM, Leave, Time, Recruitment, Performance, Maintenance, Directory, Dashboard, My Info observed directly in every discovery file. | Confirmed |
| **ESS (Employee Self-Service) / non-Admin role** | Referenced indirectly — the Add User screen exposes a "User Role" dropdown (per QA report sitemap) implying at least one other role exists. | > Assumption — role-based restrictions were never directly tested; the QA report explicitly states: *"no ESS (Employee Self-Service) or other role was available to verify role-based access boundaries directly."* |
| **Supervisor / Approver** | Leave List screen has a "Show Leave with Status" filter defaulting to "Pending Approval," and the QA report's user workflows describe "approver actions." | > Assumption — no distinct supervisor login was tested; approval actions are inferred from UI affordances, not exercised. |
| **Hiring Manager** | Recruitment > Candidates list includes a "Hiring Manager" column and filter, and candidate rows list named hiring managers (e.g., "Fernando Callejas"). | > Assumption — this may be a data attribute on the Candidate/Vacancy record rather than a distinct login role. |

## 4. Core Modules

| Module | Purpose | Key Screens Observed |
|---|---|---|
| **Admin** | System user accounts, RBAC roles, org structure, job metadata, localization/integration config. | Referenced in sidebar/QA sitemap; no discovery screenshot captured beyond navigation link. |
| **PIM** (Personnel Information Management) | Employee master data system of record. | `pim_employee_list.md`, `pim_list2.md`, `pim_add_employee.md`, `emp_detail.md` |
| **Leave** | Leave requests, approvals, entitlements. | `apply_leave.md`, `leave.md` |
| **Time** | Timesheets, attendance. | `time.md` |
| **Recruitment** | Candidate pipeline, vacancies. | `recruitment.md` |
| **Performance** | Review cycles, KPIs, trackers. | `performance.md` |
| **My Info** | Self-service view of own PIM record (same view as Personal Details, scoped to self). | Referenced via sidebar link `/pim/viewMyDetails`; not separately captured. |
| **Directory** | Org-wide employee search/lookup. | `directory.md` |
| **Dashboard** | Landing page. | Referenced in sidebar; not separately captured. |
| **Maintenance** | Step-up-authenticated destructive utilities (employee purge). | `maintenance.md` |

## 5. Functional Requirements

### 5.1 Authentication & Access
- FR-1: The system must present a login form (Admin credential re-entry captured in `maintenance.md` shows disabled prefilled Username + active Password field).
- FR-2: Deep-linking to a protected URL while unauthenticated must redirect to login, and after successful login must return the user to the originally requested page. (Confirmed only for the Admin > System Users URL per QA report; **not verified for every module URL** — flagged as an open question in the QA report.)
- FR-3: A "Forgot Password" flow must accept a username and return a generic success message regardless of whether the username exists (anti-enumeration). (Confirmed behavior in QA report §6, finding 3.)
- FR-4: Destructive administrative functions (Maintenance module) must require step-up re-authentication — re-entry of the current user's password via a modal ("Administrator Access") before proceeding. Confirmed in `maintenance.md`.

### 5.2 PIM — Employee Management
- FR-5: The system must display a paginated, filterable Employee List with columns: Id, First (& Middle) Name, Last Name, Job Title, Employment Status, Sub Unit, Supervisor, Actions. Confirmed in `pim_employee_list.md`, `pim_list2.md`.
- FR-6: Employee List filters must include: Employee Name (typeahead), Employee Id, Employment Status, "Current Employees Only" toggle, Supervisor Name (typeahead), Job Title, Sub Unit. Confirmed in `pim_employee_list.md`.
- FR-7: Employee List must support column sorting (sort icons present on Id, Name, Job Title, Employment Status, Sub Unit, Supervisor headers) and pagination (page 1/2 controls observed in `pim_list2.md` with 51 records across pages).
- FR-8: Each employee row must expose row-level Actions (two icon buttons per row, presumed Edit/Delete based on standard OrangeHRM iconography). > Assumption — icon button labels/tooltips were not resolved in the accessibility snapshot.
- FR-9: The system must provide an "Add Employee" form capturing: profile photo upload (jpg/png/gif, ≤1MB, recommended 200×200px), Employee Full Name (First/Middle/Last), Employee Id (editable, pre-filled with a suggested next value), and an optional "Create Login Details" toggle. Confirmed in `pim_add_employee.md`.
- FR-10: The employee detail view must expose the following tabs, each independently navigable via URL (`/pim/{tab}/empNumber/{id}`): Personal Details, Contact Details, Emergency Contacts, Dependents, Immigration, Job, Salary, Report-to, Qualifications, Memberships. Confirmed in `emp_detail.md`.
- FR-11: The Personal Details tab must capture: Employee Full Name (required), Employee Id, Other Id, Driver's License Number + Expiry Date, Nationality, Marital Status, Date of Birth, Gender (Male/Female radio), plus a Custom Fields section (e.g., Blood Type, "Test_Field") and an Attachments section (file table: File Name, Description, Size, Type, Date Added, Added By, Actions). Confirmed in `emp_detail.md`.

### 5.3 Leave Management
- FR-12: The system must provide an "Apply Leave" screen that displays available leave types with balance, or a blocking message ("No Leave Types with Leave Balance") when no entitlement exists. Confirmed in `apply_leave.md`.
- FR-13: The Leave module topbar must expose: Apply, My Leave, Entitlements, Reports, Configure, Leave List, Assign Leave. Confirmed in `apply_leave.md` and `leave.md`.
- FR-14: The Leave List screen must support filtering by: From Date, To Date, Show Leave with Status (required field, default "Pending Approval"), Leave Type, Employee Name (typeahead), Sub Unit, and an "Include Past Employees" toggle. Confirmed in `leave.md`.
- FR-15: The Leave List results table must display columns: Date, Employee Name, Leave Type, Leave Balance (Days), Number of Days, Status, Comments, Actions, with row selection checkboxes. Confirmed in `leave.md`.
- FR-16: Date fields in the Leave List filter use a `yyyy-dd-mm` format (day before month), confirmed via placeholder text and a populated example value (`2026-24-08`). This is a genuine UI observation, not an assumption, though its *intentionality* is unconfirmed (see [Risks](#14-risks)).

### 5.4 Time & Attendance
- FR-17: The Time module topbar must expose: Timesheets, Attendance, Reports, Project Info. Confirmed in `time.md`.
- FR-18: The Timesheets screen must provide a "Select Employee" search (Employee Name typeahead, required) with a "View" action, and a "Timesheets Pending Action" table listing Employee Name, Timesheet Period, and a per-row "View" action. Confirmed in `time.md`.
- FR-19: Timesheet periods are recorded as date ranges (e.g., "2026-29-06 - 2026-05-07"), using the same day-before-month date convention seen in Leave.

### 5.5 Recruitment
- FR-20: The Recruitment module topbar must expose: Candidates, Vacancies. Confirmed in `recruitment.md`.
- FR-21: The Candidates screen must support filtering by: Job Title, Vacancy, Hiring Manager, Status, Candidate Name (typeahead), Keywords (comma-separated), Date of Application (From/To range), Method of Application. Confirmed in `recruitment.md`.
- FR-22: The Candidates results table must display: Vacancy, Candidate, Hiring Manager, Date of Application, Status, Actions (multiple icon buttons per row — presumed view/edit/delete-adjacent actions). Confirmed structurally; icon semantics are > Assumption.
- FR-23: Candidate status values observed include "Hired" and "(Deleted)" — implying a candidate pipeline with at least these two terminal/soft-delete states. > Assumption on the full status set, since only these two were visible in the sampled data.

### 5.6 Performance Management
- FR-24: The Performance module topbar must expose: Configure, Manage Reviews, My Trackers, Employee Trackers. Confirmed in `performance.md`.
- FR-25: The "Employee Reviews" (Manage Reviews) screen must support filtering by: Employee Name (typeahead), Job Title, Sub Unit, Include (default "Current Employees Only"), Review Status, From Date, To Date. Confirmed in `performance.md`.
- FR-26: The Employee Reviews results table must display: Employee, Job Title, Sub Unit, Review Period, Due Date, Review Status, Actions, each column sortable. Confirmed in `performance.md`.

### 5.7 Directory
- FR-27: The Directory screen must allow org-wide employee search by Employee Name (typeahead), Job Title, and Location, with Reset/Search actions. Confirmed in `directory.md`.
- FR-28: Directory results must render as a card grid showing profile picture, name, and (where available) job title + department/location — most sampled cards showed name only, with fuller detail (job title, sub-unit, location) shown for at least one record. Confirmed in `directory.md`.
- FR-29: The Directory must report a total record count ("(53) Records Found") matching the org's active employee population at time of query. Confirmed in `directory.md`.

### 5.8 Maintenance
- FR-30: Accessing the Maintenance module's purge/administrative functions must present an "Administrator Access" interstitial requiring the current Admin password (Cancel/Confirm actions) before proceeding. Confirmed in `maintenance.md`.

## 6. User Journeys

The following journeys are reconstructed from the discovery artifacts and the QA report's "User Workflows" section (§3).

1. **Employee onboarding (Add Employee → full profile):** Admin navigates to PIM > Add Employee → uploads photo, enters Full Name + Employee Id → optionally enables "Create Login Details" → Save → lands on the new employee's Personal Details tab → completes Contact/Job/Salary/etc. tabs → employee becomes searchable via the Employee Name typeahead across Leave/Time/Performance/Directory. Confirmed structurally across `pim_add_employee.md` and `emp_detail.md`; the post-save navigation target is > Assumption (not captured mid-transition).
2. **Leave request lifecycle:** Entitlement must first be assigned (via Leave > Entitlements, not captured in discovery) → employee applies via Leave > Apply (blocked if zero balance, per `apply_leave.md`) → request appears in Leave List with "Pending Approval" status by default → an approver actions it (approve/reject — action mechanics not captured in discovery; inferred from the Status filter and QA report language "approver actions"). > Assumption on approval step mechanics.
3. **Timesheet review:** Employee submits a timesheet (submission screen not captured in discovery) → it appears under "Timesheets Pending Action" → a supervisor/admin selects "View" to review. Confirmed for the review-side only (`time.md`); submission-side UI is > Assumption.
4. **Recruitment pipeline:** A Vacancy is created (screen not captured) → Candidates are linked to a Vacancy/Job Title/Hiring Manager → Candidate status progresses (e.g., to "Hired") or the candidate record is soft-deleted ("(Deleted)"). Confirmed status values from `recruitment.md`; the intermediate pipeline stages (e.g., screening, interview) are > Assumption, since only "Hired" and "(Deleted)" were observed in sampled data.
5. **Step-up authentication for destructive action:** Admin navigates toward Maintenance > (implied) Purge Employee → is intercepted by the "Administrator Access" modal → must re-enter password → Confirm to proceed or Cancel to abort. Confirmed in `maintenance.md`; the screen reached after Confirm was not captured.
6. **Directory lookup:** Any authenticated user searches the Directory by name/job title/location to find a colleague's profile card. Confirmed in `directory.md`.

## 7. CRUD Matrix

| Entity | Create | Read | Update | Delete |
|---|---|---|---|---|
| **Employee (PIM)** | Confirmed — "Add Employee" form (`pim_add_employee.md`) | Confirmed — Employee List, Personal Details and other tabs (`pim_employee_list.md`, `emp_detail.md`) | Confirmed — Personal Details "Save" button, Custom Fields "Save" button (`emp_detail.md`); other tabs presumed editable but not captured | > Assumption — row Action icons in Employee List imply delete capability; no delete flow captured. Maintenance > Purge is the confirmed destructive path (`maintenance.md`), gated by step-up auth. |
| **System User (login account)** | > Assumption — referenced only via QA report sitemap (`/admin/saveSystemUser`) and the "Create Login Details" toggle on Add Employee; not directly captured in discovery. | > Assumption — Admin > User Management referenced in sitemap, not captured. | > Assumption | > Assumption |
| **Leave Request** | Confirmed — Apply Leave screen (`apply_leave.md`), blocked without entitlement | Confirmed — Leave List with filters (`leave.md`) | > Assumption — Comments column and Status filter imply an approval/edit action exists; mechanics not captured. | > Assumption — no delete/cancel action captured. |
| **Leave Entitlement** | > Assumption — "Assign Leave" and "Entitlements" topbar links exist (`apply_leave.md`, `leave.md`) but the entitlement-assignment screen itself was not captured. | > Assumption | > Assumption | > Assumption |
| **Timesheet** | > Assumption — submission UI not captured; only the review/list side is confirmed. | Confirmed — "Timesheets Pending Action" list, per-employee "View" (`time.md`) | > Assumption | > Assumption |
| **Candidate** | > Assumption — "Add" button present on Candidates screen (`recruitment.md`) but the Add Candidate form was not captured. | Confirmed — Candidates list with filters (`recruitment.md`) | > Assumption — multiple row-action icons present; semantics not confirmed. | Confirmed as a state, not a mechanic — "(Deleted)" status appears on several candidate rows, implying soft delete (`recruitment.md`). |
| **Performance Review** | > Assumption — "Configure"/"Manage Reviews" imply review-cycle creation, not captured. | Confirmed — Employee Reviews list with filters (`performance.md`) | > Assumption | > Assumption |
| **Directory Entry** | N/A — derived view over Employee (PIM) data, not independently created. | Confirmed — Directory search and card results (`directory.md`) | N/A | N/A |

## 8. Business Rules

- BR-1: A leave request cannot be submitted for a leave type with zero remaining balance — the Apply Leave screen suppresses the leave type entirely and shows "No Leave Types with Leave Balance" instead of allowing submission. Confirmed in `apply_leave.md`.
- BR-2: Destructive administrative operations (at minimum, employee purge under Maintenance) require the acting user to re-authenticate with their current password, independent of their already-active session. Confirmed in `maintenance.md`.
- BR-3: An employee record is uniquely addressable by an internal `empNumber`, which is stable across all of that employee's tabs (Personal Details, Contact Details, Job, Salary, etc.) and is the join key referenced (indirectly, via the Employee Name typeahead) from Leave, Time, Performance, and Directory. Confirmed by consistent `empNumber` in tab URLs (`emp_detail.md`).
- BR-4: The "Employee Id" (business-facing identifier, distinct from `empNumber`) is suggested/pre-filled on Add Employee but is not enforced as read-only or system-generated — it is a free-text, user-editable field. Confirmed in `pim_add_employee.md`; uniqueness enforcement is unconfirmed (see [Risks](#14-risks)).
- BR-5: Employee List and similar record lists support a "Current Employees Only" vs. include-all toggle, implying employees have an active/inactive (e.g., terminated, past) lifecycle state that affects default visibility in search results. Confirmed via toggle presence in `pim_employee_list.md`, `performance.md`; the exact state model (e.g., what statuses exist beyond active/past) is > Assumption.
- BR-6: A Candidate can reach a "(Deleted)" status distinct from being physically removed from the list — it remains visible with a `(Deleted)` label. > Assumption that this is a genuine soft-delete business rule rather than a demo-data artifact; not confirmed via an explicit deletion action.

## 9. Validation Rules

- VR-1: Employee Full Name — First Name and Last Name are marked required ("Employee Full Name*") on both Add Employee and Personal Details forms; Middle Name is optional. Confirmed in `pim_add_employee.md`, `emp_detail.md`.
- VR-2: Profile photo upload — must be `.jpg`, `.png`, or `.gif`, and no larger than 1MB; recommended dimensions 200×200px. Confirmed in `pim_add_employee.md`. Whether these constraints are enforced client-side, server-side, or both is > Assumption.
- VR-3: Leave List "Show Leave with Status" is a required filter field (marked with `*`) — a search cannot be run without a status selected. Confirmed in `leave.md`.
- VR-4: Time > Select Employee "Employee Name" field is required (marked with `*`) before the "View" action can be meaningfully used. Confirmed in `time.md`.
- VR-5: Date fields across Leave and Performance filters follow a `yyyy-dd-mm` textbox pattern (placeholder literally reads "yyyy-dd-mm"), confirmed in `leave.md`, `performance.md`, `time.md`. No client-side format-mismatch handling was observed or tested.
- VR-6: No visible password complexity enforcement (e.g., real-time strength meter) was observed in the discovery artifacts for any credential-entry screen (only the Maintenance step-up modal was captured, which has no complexity hint at all). Per QA report §4, the standalone Add User form shows only a text hint, not enforced validation — this is carried over from the QA report since the Add User screen itself was not in the discovery set. > Assumption (QA-report-sourced, not directly re-confirmed in discovery).

## 10. Security Requirements

- SR-1: Protected routes must require an authenticated session; unauthenticated access must redirect to login and, after successful login, return the user to the originally requested deep link. Confirmed (Admin > System Users case only) per QA report §4/§6.
- SR-2: Destructive operations (employee purge) must require step-up re-authentication (password re-entry) even within an active session. Confirmed in `maintenance.md`.
- SR-3: The password-reset flow must not disclose whether a submitted username exists in the system — identical generic success messaging for valid and invalid usernames. Confirmed per QA report §6, finding 3.
- SR-4: Role-based access control must restrict Admin/Maintenance functionality to appropriately privileged roles. **Not confirmed** — only an Admin-role session was tested; the QA report explicitly flags this as unverified: *"Are Admin/Maintenance routes blocked server-side for those roles, or only hidden from navigation?"* > Assumption that RBAC exists at all beyond a UI-hiding level, based on the presence of a "User Role" concept in Admin > Add User.
- SR-5: Brute-force/credential-stuffing protection (lockout, throttling, CAPTCHA) — **no such control was observed in the UI** after repeated failed logins. This is a confirmed *absence of visible control*, not a confirmed vulnerability, since server-side enforcement may exist without UI feedback. See [Risks](#14-risks).
- SR-6: File uploads (profile photo, employee Attachments) should be restricted by type and size — confirmed as a stated UI constraint (VR-2) for photos; the Attachments table on Personal Details accepts arbitrary files via an "Add" button with no stated type/size constraint captured in `emp_detail.md`. > Assumption that server-side restrictions mirror or exceed the stated UI constraint.

## 11. Non-Functional Requirements

- NFR-1: **Stability** — no JavaScript console errors were observed during navigation across all 10 modules, login, logout, and forgot-password flows, per QA report §6, finding 9.
- NFR-2: **Consistency** — the Employee Name typeahead, topbar tab/dropdown pattern, and user profile menu (About/Support/Change Password/Logout) are implemented identically across modules, per QA report §2.3. This supports a consistent, learnable UX but was not independently re-verified in every discovery file (topbar structure was confirmed per-module; the profile menu itself was not expanded/captured in any file).
- NFR-3: **Localization/date format** — the application displays dates in a `yyyy-dd-mm` format in at least Leave, Time, and Performance filters; this is either an intentional locale setting or a latent defect (see [Risks](#14-risks)). No broader internationalization behavior (language switching, currency, etc.) was captured in the discovery set.
- NFR-4: **Data scale observed** — the tested instance held approximately 50–53 employee records and 24 candidate records at the time of assessment; this is demo-scale data, not a load/performance benchmark. > Assumption that production deployments would need to be validated at materially larger scale (hundreds–thousands of employees) since no load testing was performed.
- NFR-5: **Browser automation compatibility** — the UI is built with accessible, labeled form controls and consistent ARIA roles/structure sufficient for accessibility-tree-based automated testing (as evidenced by the discovery artifacts themselves being clean Playwright accessibility snapshots). This is an observed property, not a stated requirement.

## 12. Dependencies

- The application depends on employee master data (PIM) as an upstream input to Leave, Time, Performance, and Directory — none of those modules appear to allow ad-hoc entry of a person's name; all reference the shared Employee Name typeahead resolving to a PIM record. Confirmed structurally across all discovery files that include this control.
- Leave request submission depends on a prior, separately configured Leave Entitlement for the requesting employee (BR-1) — this is an inter-feature dependency where the "Assign Leave"/"Entitlements" functions must run before "Apply" can succeed. Confirmed by the blocking message in `apply_leave.md`; the entitlement-assignment feature itself was not captured.
- Recruitment Candidate records depend on Vacancy and (implicitly) Job Title records existing first, since Candidates list filters reference both. > Assumption, since the Vacancy creation screen was not captured.
- Performance reviews depend on employee and job-title/sub-unit organizational data being populated, since the Employee Reviews filter set mirrors the PIM organizational fields. > Assumption.
- Maintenance's step-up authentication depends on the current session's Admin username being known/prefilled (the Username field is disabled and shows "Admin") — implying the step-up flow is tied to the already-logged-in identity, not a fresh independent login. Confirmed in `maintenance.md`.

## 13. Assumptions

Consolidated list of assumptions made throughout this document, each already flagged inline above:

1. The product's intended purpose is a centralized employee-record system underpinning Leave/Time/Recruitment/Performance (§1).
2. All stated Business Objectives (§2) beyond the confirmed Maintenance step-up control and Directory search are inferred from functionality, not from an explicit goals document.
3. Roles beyond Admin (ESS, Supervisor/Approver, Hiring Manager) exist but were never directly tested or logged into (§3).
4. Row-level Action icons (Employee List, Candidates, Performance Reviews) perform edit/delete-type operations, based on standard iconography conventions rather than confirmed tooltips/labels (§5.2, §5.5, §5.6, §7).
5. Post-save navigation behavior after Add Employee, and the mechanics of leave approval/rejection, timesheet submission, and candidate pipeline progression, are inferred from surrounding UI, not directly observed end-to-end (§6).
6. System User (login account) CRUD is assumed to exist based on the QA report's sitemap reference and the "Create Login Details" toggle, but was not present in the discovery artifact set (§7).
7. The candidate status model beyond "Hired" and "(Deleted)" (e.g., screening/interview stages) is assumed to exist but unconfirmed (§5.5, §6).
8. RBAC enforcement is assumed to extend to the server/API layer, not just UI-level hiding of navigation links (§10, SR-4).
9. Server-side validation (password complexity, file-upload restrictions, Employee Id uniqueness) is assumed to exist even where no client-side enforcement was visible (§9, §10).
10. Production-scale performance and load behavior is assumed to require separate validation, since only demo-scale data (~50 employees) was observed (§11, NFR-4).

## 14. Risks

Carried forward and consolidated from the QA Assessment Report §4 (Risk Analysis) and §6 (Findings), all of which are already source-confirmed observations rather than new assumptions:

| Risk | Description | Impact |
|---|---|---|
| **No visible brute-force protection** | Repeated failed logins showed no CAPTCHA, lockout, or delay in the UI. | High — potential credential-stuffing exposure if not enforced server-side. |
| **User creation / RBAC linkage** | Add User ties Username + Password + Role + Employee together; incorrect linkage or role assignment is privilege-escalation-adjacent. | High |
| **Destructive Maintenance function** | Employee Purge is a real data-deletion path; gated by password re-entry (positive control), but cascading effects on Leave/Time/Performance records are unverified. | High |
| **Data integrity in PIM** | The shared demo's Employee List shows duplicate names, blank Job Title/Employment Status/Sub Unit fields, and garbled entries — indicates weak/absent validation on required-ish fields and/or accumulated dirty test data. | Medium |
| **Employee Id is free-text and editable** | The suggested next ID is shown in an editable textbox, risking duplicate or malformed submissions. | Medium |
| **Leave balance misconfiguration** | Apply Leave fails gracefully but confirms entitlement provisioning is an easy-to-misconfigure prerequisite for a core workflow. | Low–Medium |
| **Password strength** | Only a text hint is shown on Add User; no visible real-time strength meter or enforced complexity in the UI. | Medium |
| **Date format ambiguity** | `yyyy-dd-mm` (day before month) is non-standard and easy to misread or mis-enter. | Medium |
| **Shared/public demo state** | The tested instance is shared across all internet users of the demo; exploration that mutates data affects everyone — an environment risk that constrained what could safely be tested. | N/A (environment, not app) |
| **Auth-gated deep links — partial verification** | Confirmed only for one URL (Admin > System Users); unverified whether this redirect-and-return pattern holds for every module. | Medium |

## 15. Future Enhancements

No roadmap or future-enhancement artifacts were provided. The following are candidate areas surfaced by the QA report's "Open Questions" (§8) and observed gaps — presented as potential improvement directions, not committed scope. All items in this section are > Assumption / suggestion, not sourced requirements.

- Add visible brute-force protections (lockout, throttling, or CAPTCHA) to the login form. > Assumption
- Enforce server-side uniqueness and format validation on the Employee Id field, or make it fully system-generated and read-only. > Assumption
- Clarify or correct the `yyyy-dd-mm` date format across Leave/Time/Performance filters to a less error-prone convention (e.g., `yyyy-mm-dd`), if the current format is not an intentional localization choice. > Assumption
- Add a visible password-strength meter and enforce complexity rules on account creation (Add User / Create Login Details). > Assumption
- Define and document the cascade/soft-delete behavior for Leave, Timesheet, and Performance records when an employee is purged via Maintenance. > Assumption
- Extend testing/verification to non-Admin roles to confirm RBAC is enforced server-side, not just hidden in navigation. > Assumption
- Resolve and clean up duplicate/garbled employee records identified in the shared demo data, or confirm this is demo-only noise that would not occur in a fresh deployment. > Assumption
