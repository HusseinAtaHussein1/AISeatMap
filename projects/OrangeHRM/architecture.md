# OrangeHRM — Application Architecture

This describes the architecture of **OrangeHRM itself, the application under test** — not the Agentic AI Testing Platform's own architecture (for that, see the repo root `agents/`, `pipeline/pipeline.md`, and `pipeline/run_manager.md`).

Everything below is drawn from `artifacts/OrangeHRM/knowledge/OrangeHRM_PRD.md` §1 and §4, itself a **reconstructed** description derived from observed UI behavior rather than an original design document. Treat unconfirmed structural claims accordingly.

## Navigation Model

OrangeHRM is organized around a persistent left sidebar exposing 10 top-level modules, each with a per-module horizontal topbar of tabs/dropdowns for sub-features:

| Module | Purpose |
|---|---|
| **Admin** | System user accounts, RBAC roles, org structure, job metadata, localization/integration config |
| **PIM** (Personnel Information Management) | Employee master data — the system of record other modules key off of |
| **Leave** | Leave requests, approvals, entitlements |
| **Time** | Timesheets, attendance/punch clock |
| **Recruitment** | Candidate pipeline, vacancies |
| **Performance** | Review cycles, KPIs, trackers |
| **My Info** | Self-service view of the logged-in user's own PIM record |
| **Dashboard** | Post-login landing page |
| **Directory** | Org-wide employee search/lookup |
| **Maintenance** | Step-up-authenticated destructive utilities (e.g., employee purge) |

## Cross-Module Data Model

Most entity records (employees, leave requests, timesheets, candidates) are cross-referenced by an internal employee identifier (`empNumber`) and are searchable through a shared "Employee Name" typeahead component reused across five modules: PIM, Leave, Time, Performance, and Directory.

> Assumption (PRD §1): the product's functional intent is to serve as a single system of record for employee data that other HR processes key off of. Inferred from the consistent `empNumber` cross-referencing and shared typeahead, not from an explicit design document.

## PIM Detail-View Structure

The employee detail view exposes independently URL-addressable tabs (`/pim/{tab}/empNumber/{id}`): Personal Details, Contact Details, Emergency Contacts, Dependents, Immigration, Job, Salary, Report-to, Qualifications, Memberships (PRD §5.2 FR-10).

## Access Control

- Authentication is a standard login form; deep-linking to a protected URL while unauthenticated redirects to login and returns the user to the originally requested page after successful login (PRD §5.1 FR-2) — **confirmed only for the Admin > System Users URL**, not verified for every module.
- The Maintenance module requires step-up re-authentication (password re-entry via an "Administrator Access" modal) before proceeding (PRD §5.1 FR-4).
- Only the **Admin** role has been directly observed and exercised. ESS/non-Admin, Supervisor/Approver, and Hiring Manager roles are referenced by UI affordances (a "User Role" dropdown, a "Pending Approval" filter default, a "Hiring Manager" candidate column) but never logged into or verified (PRD §3).

## Known Structural Risks

These are standing properties of the application/environment relevant to any future exploration or test design, carried from PRD §14 (Risks):

- Shared/public demo state — data mutations are visible to all internet users of the demo.
- No visible brute-force protection on Login.
- Employee Id in the Add Employee form is free-text/editable with an unconfirmed server-side uniqueness constraint.
- Data-quality issues (duplicate names, blank fields) exist in the shared demo's accumulated sample data — a property of the demo's data, not of application logic.

For the full, current-run-scoped version of these risks (which are actively being tracked vs. which are out of scope), see the current approved Project Context, not this file — this file is a standing description of the application, not of any particular run's scope.
