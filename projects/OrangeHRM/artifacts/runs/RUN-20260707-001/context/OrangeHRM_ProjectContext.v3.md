> **Status:** `Approved` — cleared the Human Review checkpoint (reviewer: Aymoon, Business Analyst / Product Owner role, 2026-07-07) per `pipeline/pipeline.md` §5.1. This is version `v3` of the OrangeHRM Project Context artifact lineage. `v1` (Login-only, `RUN-20260706-001`) and `v2` (Login + PIM read-only, `RUN-20260706-002`) remain `Approved` at their own paths — `v3` does not supersede either in the sense of being wrong, only in the sense that it is now the broader "latest approved" version per `pipeline/pipeline.md` §7.
> **Run:** Produced under `RUN-20260707-001`.
> **Run Scope** (per `pipeline/run_scope.md`): **Type** — Entire Project. **Source** — Entire Project (no narrowing; every PRD Core Module is in scope). **Run Type** — Full Regression.
> **Source PRD:** `artifacts/OrangeHRM/knowledge/OrangeHRM_PRD.md`
> **Artifact location policy (this run):** following the precedent set by `RUN-20260706-002`, this version's authoritative source stays in this Run Workspace. The flat `artifacts/OrangeHRM/context/OrangeHRM_ProjectContext.md` pointer has been updated to mirror this content, since §7 requires the unsuffixed pointer to always reflect the latest *approved* version project-wide, independent of which run produced it.

# OrangeHRM — Project Context (v3)

## 1. Scope Summary

This run validates OrangeHRM's **entire PRD-documented surface** — all ten sidebar modules (Admin, PIM, Leave, Time, Recruitment, My Info, Performance, Dashboard, Directory, Maintenance) — as a Full Regression pass, using the Run Scope Type "Entire Project" defined in `pipeline/run_scope.md` §3. This is broader than either prior run: `v1` covered Login only; `v2` covered Login + PIM (read-only). No PRD Core Module (§4) is excluded from this run's scope.

Breadth here does not relax the environment's safety posture. This remains a **shared public demo instance** (PRD §14 Risks). "Entire Project in scope" means every module's *read, search, filter, navigate, and client-side-validate* behavior is authorized to explore; it does **not** by itself authorize every persistent, data-mutating action within those modules — those are enumerated explicitly in §5 below, following the same non-destructive discipline `v1` and `v2` already established for Login and PIM.

## 2. Modules In Scope

All ten PRD Core Modules (§4), in full:

- **Admin** — system user accounts, RBAC roles, org structure, job metadata, localization/integration config (browsing/observation; see §5 for what's excluded).
- **PIM** — Employee List (display, filter, sort, pagination), Employee row Actions (observation), Add Employee form (validation/boundary testing, never submitted to completion), Employee Detail view (read-only navigation across all tabs) (PRD §5.2 FR-5–FR-11).
- **Leave** — Apply Leave screen, Leave List filtering/browsing, topbar navigation (Apply, My Leave, Entitlements, Reports, Configure, Leave List, Assign Leave) (PRD §5.3 FR-12–FR-16).
- **Time** — Timesheets review side ("Timesheets Pending Action," View action), Attendance, Reports, Project Info topbar (PRD §5.4 FR-17–FR-19).
- **Recruitment** — Candidates list filtering/browsing, Vacancies (PRD §5.5 FR-20–FR-23).
- **My Info** — self-service read-only view of the logged-in Admin's own PIM record.
- **Performance** — Employee Reviews (Manage Reviews) filtering/browsing, Configure/My Trackers/Employee Trackers topbar (PRD §5.6 FR-24–FR-26).
- **Dashboard** — post-login landing page content (in scope this run, unlike `v1`/`v2`, which stopped at confirming the redirect only).
- **Directory** — org-wide employee search by name/job title/location (PRD §5.7 FR-27–FR-29).
- **Maintenance** — step-up-authenticated "Administrator Access" interstitial behavior (PRD §5.8 FR-30), observation of the challenge only — see §5 for the destructive action itself.
- **Login / Authentication & Access** — carried forward unchanged in scope from `v1`/`v2` (PRD §5.1 FR-1–FR-4).

## 3. Modules Out of Scope

**None** — this run's Run Scope Type is Entire Project; every PRD Core Module is in scope per §2.

The following are **specific actions, within otherwise in-scope modules, that remain out of scope for execution** — an environment-safety exclusion, not a module exclusion. Each mirrors the non-destructive discipline already established in `v1`/`v2`:

- **PIM:** actually completing and submitting the Add Employee form (would create a persistent record); saving any edit on an existing employee's detail tabs.
- **Leave:** submitting an Apply Leave request to completion where it would actually persist (i.e., where entitlement exists and the request would succeed) — the form may be opened and validated, but a request should not be left pending against the shared instance's data. If BR-1's zero-balance block is what's naturally reached, that outcome may be observed without further action.
- **Recruitment:** completing an Add Candidate submission, if that control exists (PRD §7 flags this as unconfirmed) — observation of the form/control only.
- **Performance:** creating a new review cycle or Employee Review record, if "Configure"/"Manage Reviews" exposes a create action.
- **Admin:** creating, editing, or deleting a System User account, job/organization metadata, or any Admin-managed configuration record.
- **Maintenance:** proceeding past the "Administrator Access" modal to actually execute the Purge (or any other destructive Maintenance function). The modal itself may be reached and the password re-entry challenge observed (per BR-2) — Cancel out, or simply stop, before confirming.
- **Any module:** any action whose only way to be verified is by actually creating a duplicate/conflicting record (e.g., confirming Employee Id uniqueness enforcement per BR-4) — log as a limitation, do not perform.

## 4. Roles & Credentials Required

| Role | Credentials | Source |
|---|---|---|
| Admin | Username: `Admin`, Password: `admin123` | PRD §3 — the only role directly confirmed to exist and be usable |

No other role's credentials are available for this run. PRD §3 explicitly flags ESS/non-Admin, Supervisor/Approver, and Hiring Manager as unconfirmed/assumed roles never actually logged into — RBAC (SR-4) therefore remains untestable from the privileged side this run has access to; it can only be probed via what the Admin session's own UI exposes or hides (per Carried-Forward Assumption #8, §6 below).

## 5. Environment Constraints

- **Target environment:** `https://opensource-demo.orangehrmlive.com/web/index.php/auth/login` — a **shared public demo instance** (PRD §14 Risks: "the tested instance is shared across all internet users of the demo; exploration that mutates data affects everyone").
- **General rule for this run, across all ten in-scope modules:** read, navigate, filter, sort, search, and client-side-validate actions are authorized everywhere. Any action that would create, update, or delete a *persistent* record is **not** authorized unless explicitly carved out below — see §3 for the specific exclusions this implies per module.
- **Explicit exceptions (mirroring `v1`/`v2`):**
  - A single successful Admin login is authorized, to verify FR-1/FR-2 and to reach every other in-scope module this run.
  - Login-form negative testing (invalid/malformed credentials, empty form, a small number of repeated failed attempts to probe SR-5) is authorized and non-destructive.
  - The Forgot Password flow may be exercised exactly as in `v1`/`v2` (known vs. unknown username) — it does not, per prior evidence, deliver email or mutate account state in this environment.
  - The Maintenance "Administrator Access" password-challenge modal may be triggered and observed (BR-2) but not confirmed through to the destructive action behind it.
- **No genuine exploitation** of any suspected weakness is authorized in any module (e.g., no real brute-force attempt beyond a small, reasonable probe count; no injection-style payload submitted with intent to succeed) — any such probe is an input-handling/error-message observation only, per `agents/explorer_agent.md` §5.8.
- Where a full PRD requirement cannot be verified without violating the non-destructive constraints above (e.g., BR-4 Employee Id uniqueness, cascade effects of Maintenance purge per PRD §14), the Explorer Agent must log this as an explicit **limitation**, never work around it by actually performing the excluded action.

## 6. Carried-Forward Assumptions & Risks

Because this run's scope is the entire project, **every** PRD Assumption (§13) and Risk (§14) is potentially relevant — unlike `v1`/`v2`, which each carried forward only the subset touching their narrower scope.

| # | Assumption / Risk | PRD Source | What Explorer Must Check |
|---|---|---|---|
| 1 | Product's intended purpose is a centralized employee-record system underpinning Leave/Time/Recruitment/Performance. | PRD §1, §13 item 1 | Observe whether cross-module references (Employee Name typeahead, `empNumber`) hold consistently across every module now in scope, not just PIM. |
| 2 | Business Objectives beyond the confirmed Maintenance step-up control and Directory search are inferred, not sourced. | PRD §2, §13 item 2 | No direct check possible — carry forward unchanged; do not treat inferred objectives as confirmed requirements. |
| 3 | Roles beyond Admin (ESS, Supervisor/Approver, Hiring Manager) exist but were never directly tested. | PRD §3, §13 item 3 | Cannot be resolved this run either (no other role's credentials are available, §4) — carry forward unchanged. |
| 4 | Row-level Action icons (Employee List, Candidates, Performance Reviews) perform edit/delete-type operations, based on iconography convention, not confirmed labels. | PRD §5.2/§5.5/§5.6, §13 item 4 | Attempt to resolve icon labels/tooltips via the accessibility tree in each of these three screens; if still unresolved anywhere, carry the Assumption forward unchanged. |
| 5 | Post-save navigation (Add Employee), leave approval/rejection mechanics, timesheet submission, and candidate pipeline progression are inferred, not observed end-to-end. | PRD §6, §13 item 5 | Since Add Employee is never submitted to completion (§3), post-save navigation stays unconfirmed this run too; observe as much of the surrounding UI (pre-submission) as possible. |
| 6 | System User (login account) CRUD is assumed to exist based on sitemap reference and the "Create Login Details" toggle. | PRD §7, §13 item 6 | Observe the Admin > User Management screen's presence/fields (read-only); do not create a System User (§3). |
| 7 | Candidate status model beyond "Hired"/"(Deleted)" is assumed to exist but unconfirmed. | PRD §5.5/§6, §13 item 7 | Browse the current Candidates data for any additional status values beyond the two previously observed. |
| 8 | RBAC enforcement is assumed to extend to the server/API layer, not just UI-level hiding of navigation links. | PRD §10 SR-4, §13 item 8 | Cannot be directly confirmed without a non-Admin session (§4) — but note anything the Admin session's own UI implies about role-gating (e.g., a "User Role" concept in Add User) without asserting server-side enforcement. |
| 9 | Server-side validation (password complexity, file-upload restrictions, Employee Id uniqueness) is assumed to exist even where no client-side enforcement is visible. | PRD §9/§10, §13 item 9 | Observe client-side constraints only (VR-2, VR-6); do not attempt to confirm server-side enforcement via an actual duplicate/oversized submission (§3). |
| 10 | Production-scale performance/load behavior is assumed to require separate validation; only demo-scale data (~50 employees) was observed. | PRD §11 NFR-4, §13 item 10 | Note the current record counts (Employee List, Directory, Candidates) as of this run for comparison; no load testing is in scope. |
| R1 | No visible brute-force protection on Login (High impact). | PRD §10 SR-5, §14 | Re-attempt a small number of failed logins; observe for lockout/delay/CAPTCHA. |
| R2 | User creation / RBAC linkage is privilege-escalation-adjacent (High impact). | PRD §14 | Observation-only per §3 (no System User created); note the Add User form's Role/Employee linkage fields if reachable read-only. |
| R3 | Destructive Maintenance function (Employee Purge) has unverified cascading effects on Leave/Time/Performance records (High impact). | PRD §14 | Do not execute the purge (§3); note only that the step-up challenge is present as a positive control. |
| R4 | Data integrity in PIM — duplicate names, blank fields, garbled entries in shared demo data (Medium impact). | PRD §14 | Observe and report as a data-quality Observation, not a Bug — this is a property of the shared demo's accumulated data. |
| R5 | Employee Id is free-text and editable, risking duplicate/malformed submissions (Medium impact). | PRD BR-4, §14 | Confirm the field remains editable and accepts arbitrary values without submitting (§3); true uniqueness enforcement is a logged limitation, not a resolved finding. |
| R6 | Leave balance misconfiguration is an easy-to-misconfigure prerequisite (Low–Medium impact). | PRD §14 | Observe the "No Leave Types with Leave Balance" blocking message if naturally reached; do not attempt to provision entitlement to bypass it. |
| R7 | No visible password strength enforcement on Add User (Medium impact). | PRD VR-6, §14 | Observe the text hint only, read-only, without creating a System User (§3). |
| R8 | Date format ambiguity — `yyyy-dd-mm` across Leave/Time/Performance filters (Medium impact). | PRD §14, NFR-3 | Re-confirm the format is still present in each of the three modules now in scope; note any inconsistency between them. |
| R9 | Shared/public demo state — mutations affect everyone (environment risk, not app defect). | PRD §14 | Governs every constraint in §5 of this document; no separate check beyond adhering to those constraints. |
| R10 | Auth-gated deep links confirmed only for one URL previously (Medium impact). | PRD §5.1 FR-2, §10 SR-1, §14 | Attempt at least one additional protected-URL deep-link check beyond the previously-confirmed Admin > System Users case, now that more modules are in scope (e.g., a PIM or Leave deep link while unauthenticated). |

## 7. Traceability Anchor

| Item | PRD Section |
|---|---|
| Scope Summary / Entire Project definition | PRD §1 (Product Overview), §4 (Core Modules) |
| Modules In Scope (per-module detail) | PRD §5.1–§5.8 (Functional Requirements) |
| Modules Out of Scope (action-level exclusions) | PRD §7 (CRUD Matrix), §8 (Business Rules BR-1, BR-2, BR-4), §14 (Risks) |
| Roles & Credentials | PRD §3 (User Roles) |
| Environment Constraints | PRD §14 (Risks — "Shared/public demo state") |
| Carried-Forward Assumptions #1–#10 | PRD §13 (Assumptions, items 1–10) |
| Carried-Forward Risks R1–R10 | PRD §14 (Risks table, all ten rows) |
