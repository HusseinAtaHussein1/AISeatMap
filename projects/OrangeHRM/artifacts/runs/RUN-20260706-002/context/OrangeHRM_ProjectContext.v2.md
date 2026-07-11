> **Status:** `Approved` — cleared the Human Review checkpoint (reviewer: Aymoon, Business Analyst / Product Owner role, 2026-07-06) per `pipeline/pipeline.md` §5.1. This is version `v2` of the OrangeHRM Project Context artifact lineage (v1, produced under `RUN-20260706-001`, remains `Approved` at `artifacts/OrangeHRM/context/OrangeHRM_ProjectContext.v1.md` for its own narrower Login-only scope — v1 is not superseded in the sense of being wrong, only in the sense that v2 is now the broader "latest approved" version per `pipeline/pipeline.md` §7). This version's authoritative source stays in this Run Workspace per this run's artifact-location policy; the flat `artifacts/OrangeHRM/context/OrangeHRM_ProjectContext.md` pointer has been updated to mirror this content, since §7 requires the unsuffixed pointer to always reflect the latest *approved* version project-wide, independent of which run produced it.
> **Run:** Produced under `RUN-20260706-002` — the first full Stage 1→6 end-to-end validation of the Agentic AI Testing Platform.
> **Source PRD:** `artifacts/OrangeHRM/knowledge/OrangeHRM_PRD.md`

# OrangeHRM — Project Context (v2)

## 1. Scope Summary

This run validates the Agentic AI Testing Platform's full six-stage pipeline, end to end, for the first time — every agent, every checkpoint type (Human Review ×3, Automation Approval ×1). The application scope was deliberately chosen to be broad enough to meaningfully exercise Stage 3's suite/negative-test coverage and Stage 4's business-workflow suite planning (which needs more than one workflow to validate), while remaining bounded enough to complete a full pipeline run and staying within this shared public demo's safe-testing limits.

**In scope:** the PRD's §5.1 Authentication & Access functional area ("Login," re-derived fresh for this run rather than reusing `RUN-20260706-001`'s still-unapproved output, since this run is self-contained), and the PRD's §5.2 PIM — Employee Management functional area, **read/search/filter/navigate/validate operations only** — explicitly excluding the final, persistence-committing step of the Add Employee workflow (see §5 Environment Constraints).

No other sidebar module (Admin, Leave, Time, Recruitment, My Info, Performance, Dashboard, Directory, Maintenance) is in scope for this run.

## 2. Modules In Scope

- **Login / Authentication & Access** — the login form, credential validation/error messaging, the "Forgot Password" flow, and unauthenticated-access redirect behavior (PRD §5.1: FR-1 through FR-4).
- **PIM — Employee Management, read/search/validate scope** (PRD §5.2: FR-5 through FR-11):
  - Employee List: display, filtering, sorting, pagination (FR-5, FR-6, FR-7)
  - Employee row Actions (FR-8) — observation/documentation only; the underlying Edit/Delete semantics are themselves a PRD-flagged Assumption (PRD §13 item 4), not something this run resolves
  - Add Employee form: field-level validation and boundary-condition testing only — **the form is never submitted to completion** (FR-9; see Environment Constraints)
  - Employee Detail view: navigation across tabs and read-only content verification for an **existing** employee record only (FR-10, FR-11) — no edits saved on any tab

## 3. Modules Out of Scope

- Admin
- Leave
- Time
- Recruitment
- My Info
- Performance
- Dashboard (including the post-login landing page — confirm redirect only, do not explore content)
- Directory
- Maintenance
- Within PIM specifically: **actually creating a new employee record (completing and saving the Add Employee form) is out of scope** — this would be a persistent, shared-environment data mutation with no explicit authorization for this run. Editing/saving any field on an existing employee's detail tabs is likewise out of scope for the same reason.

## 4. Roles & Credentials Required

| Role | Credentials | Source |
|---|---|---|
| Admin | Username: `Admin`, Password: `admin123` | PRD §3 — the only role directly confirmed to exist and be usable; "Account used: Admin / admin123 (Admin role)" |

No other role's credentials are available or required for this run — PRD §3 explicitly flags ESS/non-Admin, Supervisor/Approver, and Hiring Manager as unconfirmed/assumed roles never actually logged into.

## 5. Environment Constraints

- **Target environment:** `https://opensource-demo.orangehrmlive.com/web/index.php/auth/login` — a **shared public demo instance** (PRD §14 Risks: "Shared/public demo state... tested instance is shared across all internet users of the demo; exploration that mutates data affects everyone").
- **No destructive or persistent data-mutating actions are authorized in this run.** This is stricter than "avoid obviously destructive actions" — it specifically means:
  - Login-form testing (invalid/malformed credentials, empty form, a small number of repeated failed attempts, boundary-condition input) is authorized and non-destructive, as in `RUN-20260706-001`.
  - **A single successful login with the confirmed Admin credentials is authorized**, to verify FR-1/FR-2.
  - PIM Employee List browsing, filtering, sorting, and pagination is authorized (read-only).
  - Opening an **existing** employee's Detail view and navigating its tabs is authorized, **read-only** — no field may be edited and saved on any tab.
  - The Add Employee form may be opened and its fields exercised for validation/boundary-condition testing (VR-1, VR-2, and this run's negative-test categories) — **but the form must never be submitted to completion.** If a boundary-condition test would only be observable by actually saving (e.g., confirming server-side Employee Id uniqueness by creating two employees with the same ID), that specific check is skipped and logged as a limitation, not performed anyway.
  - The Forgot Password flow may be exercised exactly as in `RUN-20260706-001` (known vs. unknown username), since it does not, per prior evidence, actually deliver email or mutate account state in this environment.
- **Do not attempt to actually exploit** any weakness this run probes for (e.g., no genuine brute-force attempt beyond a small, reasonable number of probe attempts; no SQL-injection-style payload submitted with intent to succeed — any such probe is an input-handling/error-message observation only, per `agents/explorer_agent.md` §5.8).
- Exploration must stop at confirming a successful-login redirect occurred; no further navigation into out-of-scope modules is authorized, and the agent should log out (or simply stop) once in-scope exploration is complete.

## 6. Carried-Forward Assumptions & Risks

| # | Assumption / Risk | PRD Source | What Explorer Must Check |
|---|---|---|---|
| 1 | **No visible brute-force protection** on Login. | PRD §10 SR-5, §14 Risks | Re-attempt a small number of failed logins; observe for lockout/delay/CAPTCHA. (Already reproduced independently under `RUN-20260706-001`'s still-pending Findings — this run re-derives its own evidence rather than citing that other run's unapproved output.) |
| 2 | **Auth-gated deep links — partial verification.** SR-1/FR-2 confirmed only for the Admin > System Users URL in the original legacy exploration. | PRD §5.1 FR-2, §10 SR-1, §14 Risks | Attempt at least one direct/deep-link navigation to a protected URL while unauthenticated; confirm redirect-to-login and return-to-original-URL behavior. |
| 3 | **Forgot Password anti-enumeration.** Must return an identical generic success message regardless of username validity. | PRD §5.1 FR-3, §10 SR-3 | Re-confirm with a known and an unknown username; treat any difference — in message text **or in response availability/timing** — as a Finding. |
| 4 | **Employee Id is free-text and editable, not system-enforced.** Suggested next value is shown in an editable textbox; uniqueness enforcement is unconfirmed. | PRD BR-4, §14 Risks | Confirm the field remains editable and accepts arbitrary values in the Add Employee form (without submitting); note that true uniqueness-enforcement cannot be confirmed without actually saving a duplicate, which is out of scope (§5 above) — log this as a limitation, not a resolved finding. |
| 5 | **Employee List data-quality issues** — duplicate names, blank Job Title/Employment Status/Sub Unit fields, garbled entries in the shared demo's sample data. | PRD §14 Risks ("Data integrity in PIM") | Observe whether these data-quality issues are still present; this is a property of the shared demo's accumulated data, not of the application's own logic, and should be reported as an Observation, not a Bug. |
| 6 | **Employee List row Actions semantics unconfirmed** — presumed Edit/Delete icons, never confirmed via tooltip/label. | PRD FR-8, §13 item 4 | Attempt to resolve the icon labels/tooltips via the accessibility tree during Discovery; if still unresolved, carry the Assumption forward unchanged rather than guessing at their function. |
| 7 | **Profile photo / Attachments upload restrictions** — stated client-side constraints (jpg/png/gif, ≤1MB) for photo upload; Attachments table has no stated constraint at all. | PRD VR-2, SR-6 | Observe the stated constraints in the Add Employee form's UI (without uploading a real file that would need to be attached to a saved record — form-field/label observation only, since this form is never submitted). |
| 8 | **Login form UI stability** — no JavaScript console errors previously observed. | PRD §11 NFR-1 | Capture console logs throughout Login and PIM exploration; compare against this prior "no errors" baseline. |

No other PRD assumption/risk items (RBAC on Admin/Maintenance, date format ambiguity in Leave/Time/Performance, password strength on Add User, Maintenance purge cascade effects) are in scope for this run — they pertain to modules explicitly out of scope per §3.

## 7. Traceability Anchor

| Item | PRD Section |
|---|---|
| Scope Summary / Login + PIM definition | PRD §4 (Core Modules), §5.1 (Authentication & Access), §5.2 (PIM — Employee Management) |
| Roles & Credentials | PRD §3 (User Roles) |
| Environment Constraints (shared public demo; PIM non-destructive boundary) | PRD §14 (Risks — "Shared/public demo state"), BR-4 |
| Carried-Forward Risk #1 (brute-force) | PRD §10 SR-5, §14 Risks |
| Carried-Forward Risk #2 (deep-link redirect) | PRD §5.1 FR-2, §10 SR-1, §14 Risks |
| Carried-Forward Assumption #3 (Forgot Password) | PRD §5.1 FR-3, §10 SR-3 |
| Carried-Forward Risk #4 (Employee Id editable) | PRD BR-4, §14 Risks |
| Carried-Forward Risk #5 (PIM data quality) | PRD §14 Risks |
| Carried-Forward Assumption #6 (row Action icons) | PRD FR-8, §13 item 4 |
| Carried-Forward Assumption #7 (upload restrictions) | PRD VR-2, SR-6 |
| Carried-Forward Observation #8 (console stability) | PRD §11 NFR-1 |
