# NDC — Project Context — Role (Create Role, Admin — Role Management)

**Run:** RUN-20260721-001 · **Status:** `Pending` (checkpoint open per `pipeline/pipeline.md` §5.1 — awaiting Human Review) · **Produced by:** Project Context Agent (Stage 1) · **Date:** 2026-07-21
**Run Scope:** Type = User Story · Source = Pasted text — **Create Role**, one User Story (Search Role/Update Role/Staff CRUD named only in its own Reflection section, not jointly scoped this run).

> **Relationship to other Project Context documents:** this is a new scope/entity — no prior Project Context document covers Role/permission management. `ProjectContext_Agency.md`, `ProjectContext_BranchAgencyStaff.md` (Branch/Staff sections), `ProjectContext_CredentialRoutesFilter.md`, `ProjectContext_LoginAuthentication.md`, and `ProjectContext_ETicketBranding.md` are untouched and unrelated. Per the project's per-scope naming convention, this document is filed as `ProjectContext_Role.md` and will be extended in place (not re-versioned) if Search Role / Update Role arrive later, per the same track-split precedent used for Agency.
>
> **Approval workflow:** this file lives under `runs/RUN-20260721-001/context/` while still `Pending`. Once approved it moves to `platform_core_data/workspace/context/ProjectContext_Role.md`, per the project's standing approval-flow convention.

---

## 1. Scope Summary

This document covers the **Admin → Role Management → Create Role** screen: a single User Story defining the Add-Role form's Role Name field (text-only, unique, with its own duplicate/empty validation messages), a granular, module/sub-module/tab permission-assignment grid (View/Edit/Approval checkboxes with auto-select-on-dependency behavior, plus per-row and per-sub-module "Select All"), and the screen's two action buttons (Submit for Approval, Cancel). The User Story's own **Reflection** section names three adjacent items — **Search Role**, **Update Role**, **STAFF CRUD** — as related but not delivered in this story; they are treated as explicitly Out of Scope for this document (§3), not assumed or designed against.

## 2. Modules In Scope

### 2.1 Role Name Field

| Req. ID | Field / Behavior | Validation | Error Msg | Field Type | Status |
|---|---|---|---|---|---|
| FR-ROLECRT-NAME-01 | Role Name | Text field; only normal characters allowed — no special characters, no numbers | N/A (see FR-ROLECRT-NAME-02 for the stated message) | Text Input | Mandatory |
| FR-ROLECRT-NAME-02 | Role Name uniqueness | Must be unique across existing roles; duplication not allowed | "Role Name already exists, Please Enter another Role Name." | Text Input | Mandatory |

> The AC states one message ("Role Name already exists…") covering "invalid or duplicated" — but the message text itself only names duplication, not the no-special-characters/no-numbers rule. See §6 #1.

### 2.2 Authorization Selection

| Req. ID | Behavior | Validation | Error Msg |
|---|---|---|---|
| FR-ROLECRT-AUTH-01 | At least one segment or authority checkbox must be selected before the role can be saved/submitted | Required — at least one of the module/sub-module/tab-row permission checkboxes must be checked | "One authorization at least must be selected." |

### 2.3 Modules and Sub-Modules (Segment Structure)

| Req. ID | Field / Behavior |
|---|---|
| FR-ROLECRT-MOD-01 | The system displays all primary modules as segments: Dashboard, Admin, Master, Rule Engine, Settings, User Management, Booking Mid Office, Profile, Reports |
| FR-ROLECRT-MOD-02 | Each module has smaller segments for its sub-modules, each with a "Select All" checkbox |
| FR-ROLECRT-MOD-03 | "Select All" behavior: selects all checkboxes (View, Edit, Approval) for every row ("Sub-Tab") under that sub-module |
| FR-ROLECRT-MOD-04 | Example structure — Admin module's sub-modules: Company, Branch, Agency, Staff |

### 2.4 Tab Management within Sub-Modules

| Req. ID | Field / Behavior |
|---|---|
| FR-ROLECRT-TAB-01 | Each sub-module (e.g., Company) has a grid listing its specific tabs, e.g.: Operating Countries, Role, Department, Advanced Pop-Up |

### 2.5 Permissions Checkboxes

| Req. ID | Checkbox | Behavior |
|---|---|---|
| FR-ROLECRT-PERM-01 | View | Can be selected independently |
| FR-ROLECRT-PERM-02 | Edit | If ticked, View is automatically selected |
| FR-ROLECRT-PERM-03 | Approval | If ticked, View is automatically selected |

### 2.6 Action Buttons

| Req. ID | Button | Behavior |
|---|---|---|
| FR-ROLECRT-ACTION-01 | Submit for Approval | Initiates the process to save and submit the role for approval |
| FR-ROLECRT-ACTION-02 | Cancel | Clears the inputs or exits the role creation process without saving, and navigates to the Search Role Screen |

### 2.7 Dependencies

| Req. ID | Dependency | Why it matters |
|---|---|---|
| BR-ROLECRT-01 | Search Role screen | `FR-ROLECRT-ACTION-02`'s Cancel navigates there — screen itself is Out of Scope (§3), so this is a navigation-target dependency only, not a tested destination this run |

## 3. Modules Out of Scope

- **Search Role** — named only in the User Story's own Reflection section; no AC provided this run.
- **Update Role** — same; no AC provided this run.
- **STAFF CRUD** — named in Reflection; already independently governed by `ProjectContext_BranchAgencyStaff.md` (Staff section) — not duplicated here.
- Every other module/sub-module named only as a **segment label** in §2.3 (Dashboard, Master, Rule Engine, Settings, User Management, Booking Mid Office, Profile, Reports, and Admin's Branch/Agency/Staff sub-modules) — these appear in this User Story solely as entries the Role Create grid must display, not as modules whose own screens/functionality are being tested by this document.
- All modules already scoped by prior runs and unrelated to Role Management: Login/Authentication, Credential Routes Filter/Airport/Supplier Credentials/Airline/Booking-Mid Office, Agency CRUD (Create/Search/Update/Actions), E-Ticket Agency Branding, Branch (Admin) CRUD.

## 4. Roles & Credentials Required

- **OdesysesAdmin / Admin** — the User Story's own actor line ("As an OdesysesAdmin & Admin"). Maps to the existing **Admin** credential (`platform_core_data/credentials/credentials.json`, STG environment) — confirmed available. Whether "OdesysesAdmin" here refers to the distinct Super Admin tier already documented in **FINDING-004** (`ProjectContext_CredentialRoutesFilter.md` §4 — Super Admin `odeysysadmin` vs. Admin `e.saady`, different feature access) is not stated by this User Story and is carried forward as an open item (§6 #2).

## 5. Environment Constraints

Per `platform_core_data/run_configuration.md`'s standing constraint: **shared staging environment, read-only by default** — no mutation authorization has been asked for or granted for this run. This document governs Stage 1 (Project Context) and, if the user proceeds, Stage 3 (Test Design) only; per platform memory `feedback_automation_decision_gates`, mutation authorization (needed for actually creating a Role live) is not assumed from any prior run's grant and must be asked fresh if/when Discovery or Execution against this scope is requested.

## 6. Carried-Forward Assumptions & Risks

| # | Item | Status this run should treat it as |
|---|---|---|
| 1 | **Role Name's stated validation message only names duplication** ("Role Name already exists…"), but the AC also states a separate rule (no special characters/numbers) without giving that rule its own message text. | Design a distinct empty/invalid-format assertion without asserting an unconfirmed exact string for that specific case; log as a Coverage Gap. |
| 2 | **Actor ambiguity: "OdesysesAdmin & Admin"** — this User Story's own actor line names two labels together, and it is not stated whether "OdesysesAdmin" is the same distinct Super Admin tier already raised in FINDING-004 (`odeysysadmin`, cannot complete Booking Cycle) or a typo/synonym for the single existing Admin role. | Design against the existing Admin credential; log the tier question as a Coverage Gap rather than assume a new credential is needed. |
| 3 | **"Role" appears twice with different meanings**: as this document's whole subject (a permission-assignment entity, Admin → Role Management → Create Role) and, separately, as one *tab name* inside Company's own tab grid (§2.4 example: "Operating Countries, Role, Department, Advanced Pop-Up"). Whether Company's "Role" tab is the same screen this document describes, or an unrelated tab that happens to share the word "Role," is not stated. | Treat as two distinct things per the User Story's literal wording; flag the naming collision as a Coverage Gap for Explorer to resolve by direct observation before Test Design assumes either reading. |
| 4 | **This screen/module ("Role Management" / "Create Role") does not appear anywhere in `architecture.md`'s Navigation Model** (observed Admin sub-items are Company, Agency, Staff only — no "Role" top-level entry under Admin, and no standalone "Role Management" module). | Unconfirmed — Explorer must directly observe where this screen actually lives in the live navigation (a new Admin sub-module, a Settings item, or elsewhere) before Test Design or Automation can target it. |
| 5 | **Segment/module list named in this AC** (Dashboard, Admin, Master, Rule Engine, Settings, User Management, Booking Mid Office, Profile, Reports) **does not include PNR Query, Transfer PNR, Import PNR, or Import Booked PNR**, all of which `architecture.md` lists as live top-nav modules. | Not treated as a defect — the Role Create grid's exact segment list is only confirmed by direct observation; log the discrepancy as a Coverage Gap rather than assume the AC's list is complete or that those four modules are deliberately ungoverned by roles. |
| 6 | **Select All / Edit-implies-View / Approval-implies-View interaction rules are stated as behavior, never independently observed live.** | Unconfirmed — Explorer to verify directly once Discovery is authorized for this scope. |
| 7 | **FINDING-004** (existing, `ProjectContext_CredentialRoutesFilter.md` §4 / `workspace/discovery/findings/FINDING-004_MultipleAdminRolesNotInProjectContext`) is now directly on-topic: it documents that NDC has at least two distinct Admin-tier roles with different feature access, and recommends Project Context explicitly name both when next revised. This document's own actor ambiguity (#2 above) is a direct instance of that still-open recommendation. | Carried forward, not newly resolved by this document — the Role Management screen itself may be exactly where that permission model is configured, making its own Discovery relevant to closing FINDING-004. |

## 7. Traceability Anchor

| Item above | Section | Source |
|---|---|---|
| §2.1–§2.6 (Create Role AC) | User Story, full text | `resources/requirements/user_stories/Create-Role.md`; `PRD.md` User Story 4 |
| §3 (Out of Scope: Search Role/Update Role/STAFF CRUD) | User Story's own "Reflection" section | `resources/requirements/user_stories/Create-Role.md` |
| §4 (Roles & Credentials, actor ambiguity) | User Story Description line; existing Finding | `resources/requirements/user_stories/Create-Role.md`; `workspace/discovery/findings/FINDING-004_MultipleAdminRolesNotInProjectContext/metadata.md` |
| §6 #4–#5 (navigation/segment-list discrepancies) | `architecture.md` Navigation Model table | `platform_core_data/architecture.md` |
| §6 #7 (FINDING-004 relevance) | Existing Finding, RUN-20260710-001 | `workspace/discovery/findings/FINDING-004_MultipleAdminRolesNotInProjectContext/metadata.md` |

---

*Per `pipeline/pipeline.md` §5.1, this artifact requires Human Review before Stage 2 (Explorer Agent) or Stage 3 (Test Design Agent) may formally clear its own checkpoint. Once approved, this file moves to `platform_core_data/workspace/context/ProjectContext_Role.md` per the project's standing approval-flow convention.*
