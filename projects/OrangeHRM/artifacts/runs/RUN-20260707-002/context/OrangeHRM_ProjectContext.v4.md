> **Status:** `Pending Review` — awaiting the Stage 1 Human Review checkpoint (reviewer role: Business Analyst / Product Owner, per `pipeline/pipeline.md` §5.1) before Stage 2 (Explorer Agent) may be invoked for this run.
> **Run:** Produced under `RUN-20260707-002`.
> **Run Scope** (per `pipeline/run_scope.md`): **Type** — Custom Scope. **Source** — Pasted text (user-supplied, 2026-07-07). **Run Type** — Custom.
> **Source of scope content:** The Claim module is **not documented anywhere in `artifacts/OrangeHRM/knowledge/OrangeHRM_PRD.md`** — it is absent from PRD §4 (Core Modules) and from `projects/OrangeHRM/architecture.md`'s navigation model. Per `agents/project_context_agent.md` §7 rule 2 ("must not invent scope beyond what is stated in the PRD or explicit run configuration"), this run's scope content is drawn entirely from the **explicit run configuration** the user pasted directly into this conversation — a reverse-engineered description of a typical OrangeHRM Claims module, explicitly caveated by its author as *not* the application's actual internal PRD, but an inference from public documentation, system architecture, and standard HR-software configuration patterns. This is the `Custom Scope` / `Pasted text` mechanism `pipeline/run_scope.md` §4.1 already documents (the same mechanism `RUN-20260706-001`/`002` used) — it does not require editing the project PRD.
> **Consequence of this source:** Because none of this content has been confirmed against either the PRD or the live application, **every item in §2 and §6 below is an unconfirmed Assumption, not a verified requirement**, until the Explorer Agent (Stage 2) checks it against `https://opensource-demo.orangehrmlive.com/`. This Project Context deliberately carries a higher proportion of "Assumption" content than `v1`–`v3`, which is expected given the source.

# OrangeHRM — Project Context (v4)

## 1. Scope Summary

This run validates the **Claim (expense claims) module** only — a module the standing project knowledge (PRD, `architecture.md`) does not document at all. The scope content comes from a user-supplied, explicitly reverse-engineered description of how OrangeHRM's Claims module typically works (roles, approval workflow, currency/localization, reporting), pasted directly as this run's Custom Scope. No other module is in scope for this run; `v1`, `v2`, and `v3` remain independently approved at their own paths and are unaffected by this run.

Because the source material is inferred rather than confirmed, this run's primary purpose is **discovery-as-validation**: hold the pasted description up against whatever the live demo instance actually presents under "Claim," and record agreement, contradiction, or absence explicitly — exactly the Gap Analysis role `agents/explorer_agent.md` §3 already assigns to Stage 2. Nothing here should be read as a confirmed fact about the target application until Stage 2 says so.

## 2. Modules In Scope

- **Claim** — expense claim creation/assignment, the approval workflow state machine (Draft → Pending Supervisor Approval → Pending Final Approval → Approved/Rejected → Paid), expense type configuration, currency selection, receipt/document attachment, and the claims reporting engine — **as described in the pasted Custom Scope text below**, all unconfirmed against the live application prior to Stage 2:

  > *(Verbatim pasted Custom Scope content, retained here for traceability per `agents/project_context_agent.md` §7 rule 5 — this run has no PRD section to cite instead)*
  >
  > **Core Objectives:** a centralized, transparent, automated system for employees to submit expense claims, managers to review them, and HR/Finance to process and report on reimbursements.
  >
  > **User Roles and Access Levels:** Employee Self-Service (ESS) — create/edit-while-draft/delete/submit own claims, view own claim status history. Supervisor/HOD — view/approve/reject subordinates' claims, create/assign claims on their behalf. HR/System Admin — global oversight: configure expense types, manage final approval, assign claims to any employee, mark claims as paid, generate global reports.
  >
  > **Claim Creation and Assignment:** both bottom-up (employee-driven) and top-down (admin-driven) claim generation. Expense Categorization via admin-configured "Expense Types" (e.g., Meals, Mileage, Accommodation), each with custom form fields. Claim Context linkage: General / Projects / Approved Travel Requests. Delegated Assignment: Admins/Supervisors may create and fill a claim on an employee's behalf.
  >
  > **Approval Workflow (state machine):**
  >
  > | Initial Status | Actor | Available Actions | Resulting Status |
  > |---|---|---|---|
  > | Draft | ESS / Supervisor / Admin | Save, Delete, Submit | Draft, Deleted, Pending Supervisor Approval |
  > | Pending Supervisor Approval | Supervisor | Save, Reject, Approve | Pending Supervisor Approval, Rejected, Pending Final Approval |
  > | Pending Final Approval | Admin | Save, Reject, Approve | Pending Final Approval, Rejected, Approved |
  > | Rejected | ESS | Save, Submit | Draft, Pending Supervisor Approval |
  >
  > Once Admin-approved, a claim enters a payment queue where an Admin can "Mark as Paid."
  >
  > **Currency and Localization:** local currency selectable per claim. Supporting documentation (receipts/invoices) attachable per expense line item.
  >
  > **Reporting and Analytics:** custom report builder (selection criteria e.g. Sub Unit, Expense Type); filters by Employee ID/Name, Job Title/Location, Claim Status, Submitted/Approved Date, Employment Status; export to CSV/PDF.

## 3. Modules Out of Scope

Everything except Claim is out of scope for **this run** (`RUN-20260707-002`) — this does not change any other run's own scope:

- Admin, PIM, Leave, Time, Recruitment, My Info, Performance, Dashboard, Directory, Maintenance, Login/Authentication — all in scope for `v3` (`RUN-20260707-001`), out of scope here. Login is the sole exception: reaching the Claim module requires the same Admin login already authorized under `v1`–`v3`; that single login action is carried forward as a mechanical prerequisite, not as a re-opening of Login/Authentication as a validation target in its own right this run.

The following are explicitly **out of scope as actions, within the in-scope Claim module**, pending explicit run-specific authorization (mirroring the non-destructive discipline `run_configuration.md` establishes project-wide, and PIM's Add-Employee precedent in `v2`/`v3`):

- Actually **submitting** a claim to a state that persists against the shared demo instance (Draft → Pending Supervisor Approval, or beyond). The Submit Claim / New Claim form may be opened, populated, and validated, but not completed to a persisting submission.
- Actually **approving, rejecting, or marking a claim as Paid** — even if a pre-existing claim in the shared demo data happens to be reachable in a state where these actions are exposed. Observe the controls; do not invoke them to completion.
- Creating, editing, or deleting an **Expense Type** or any other Claims-related configuration record.
- Uploading a real file as claim-attachment evidence beyond what is needed to observe the attach-control's presence/behavior (e.g., accepted file types, size limit messaging) — no attachment should be left persisting against the shared instance.
- Generating and exporting an actual CSV/PDF report file to disk, if that would write outside the sandboxed browser session — the report *screen* and its filter/criteria UI may be exercised read-only.

## 4. Roles & Credentials Required

| Role | Credentials | Source |
|---|---|---|
| Admin | Username: `Admin`, Password: `admin123` | Carried forward from `run_configuration.md` — the only role confirmed to exist and be usable in this environment |

**Material limitation, specific to this module:** the pasted Custom Scope describes a three-role workflow (ESS, Supervisor, Admin) as central to Claim's entire approval state machine. No ESS or Supervisor credentials are available (per `run_configuration.md` and every prior Project Context's §4). This means the Supervisor-approval and ESS-submission halves of the described workflow **cannot be exercised from their originating role** this run — only whatever the Admin session's own UI surface exposes (e.g., an Admin-side "Assign Claim" or "My Claims"-equivalent view, if one exists) can be observed. This is carried forward into §6 as an explicit, high-priority item for the Explorer Agent to characterize as a Test Gap rather than silently skip.

## 5. Environment Constraints

- **Target environment:** `https://opensource-demo.orangehrmlive.com/web/index.php/auth/login` — the same shared public demo instance as every prior OrangeHRM run (`run_configuration.md`).
- **General rule for this run:** read, navigate, filter, sort, search, and client-side-validate actions are authorized on the Claim module. Any action that would create, update, delete, approve, reject, or mark-paid a *persistent* Claim record is **not** authorized — see §3 for the specific exclusions.
- **Login:** a single Admin login is authorized, solely as the mechanical prerequisite to reach the Claim module (not a re-validation of Login itself this run).
- **No genuine exploitation** of any suspected weakness is authorized (consistent with every prior run) — any input-handling probe (emoji, long input, injection-style payload, etc.) on a Claim form field is an observation of error-handling/validation behavior only, never an attempt to actually succeed at exploiting anything.
- Where the pasted Custom Scope's described behavior cannot be verified without violating the non-destructive constraints above (e.g., the full approval state machine, "Mark as Paid," report export), the Explorer Agent must log this as an explicit **limitation/Test Gap**, never work around it by actually performing the excluded action.

## 6. Carried-Forward Assumptions & Risks

Unlike `v1`–`v3`, these are not carried forward from PRD `> Assumption`/Risk entries (the PRD has none for a module it doesn't document). They are instead the assumptions **implicit in the pasted Custom Scope text itself** — each one is a claim about how OrangeHRM's Claims module "typically" behaves, explicitly caveated by its own source as inferred rather than confirmed, and each must be checked against the live application in Stage 2:

| # | Assumption | Source | What Explorer Must Check |
|---|---|---|---|
| 1 | A "Claim" module/sidebar entry exists at all in this demo instance, in a form resembling the description in §2. | Pasted Custom Scope (entirely unconfirmed against this specific demo build) | First and most fundamental check: does the live app even expose a Claim module to the Admin user, and does it structurally resemble what's described? |
| 2 | Three distinct roles (ESS, Supervisor/HOD, Admin) each have materially different Claim capabilities. | Pasted Custom Scope | Only the Admin-side surface is directly reachable (§4) — observe what Admin's UI implies about other roles' capabilities (e.g., a visible "assign to employee" control) without asserting the ESS/Supervisor experience directly. |
| 3 | Claims can be linked to General expenses, Projects, or Approved Travel Requests. | Pasted Custom Scope | Check whether the claim-creation form actually exposes this three-way linkage, or a different/simpler model. |
| 4 | The approval state machine (Draft → Pending Supervisor Approval → Pending Final Approval → Approved/Rejected → Paid) matches this demo's actual states. | Pasted Custom Scope | Observe whatever state/status labels the live UI actually uses (e.g., a status filter dropdown, or an existing claim's displayed status) without invoking a state transition (§3). |
| 5 | Expense Types are admin-configurable, each with custom fields. | Pasted Custom Scope | Check for an Expense Type configuration screen; observe read-only. |
| 6 | Per-claim currency selection exists. | Pasted Custom Scope | Check the claim-creation form for a currency field. |
| 7 | Receipt/document attachment is supported per expense line item. | Pasted Custom Scope | Check for an attach-file control; observe its constraints (accepted types, size) without leaving a persisted upload (§3). |
| 8 | A custom report builder exists with the filters listed in §2. | Pasted Custom Scope | Check the Claims reporting screen's actual filter/criteria fields against this list; note any mismatch as a Gap rather than assuming the list is correct. |
| R1 | Because none of the above is sourced from this project's own PRD or any prior observation of this specific demo instance, there is a material risk that the live Claim module differs substantially from — or entirely lacks — the described behavior. | Derived from this Project Context's own sourcing caveat, §0 banner | The Gap Analysis for this run should treat "the pasted description does not match observed reality" as an expected, non-alarming possible outcome, not evidence of an application defect — the *description* has no confirmed authority here, unlike PRD-sourced assumptions in `v1`–`v3`. |

## 7. Traceability Anchor

| Item | Source |
|---|---|
| Scope Summary / Modules In Scope | Pasted Custom Scope text, supplied directly by the user in this conversation, 2026-07-07 (reproduced verbatim in §2) — **not** PRD-sourced, per the §0 banner |
| Modules Out of Scope (module-level) | `artifacts/OrangeHRM/context/OrangeHRM_ProjectContext.v3.md` §2 (the ten PRD Core Modules + Login, all out of scope for this narrower run) |
| Modules Out of Scope (action-level exclusions) | Precedent set by `v2`/`v3` §3 (PIM Add Employee non-completion discipline), applied by analogy to Claim's Submit/Approve/Reject/Mark-as-Paid actions — no PRD business rule exists for Claim to cite instead |
| Roles & Credentials | `projects/OrangeHRM/run_configuration.md` (Admin credentials; ESS/Supervisor unavailable) |
| Environment Constraints | `projects/OrangeHRM/run_configuration.md` "Environment Constraints (standing, project-wide)" |
| Carried-Forward Assumptions & Risks | This document's own §2 pasted text (self-sourced, since no PRD section exists) |
