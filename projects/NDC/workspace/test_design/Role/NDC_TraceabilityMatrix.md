# NDC — Requirement Traceability Matrix — Role (Create Role) — RUN-20260721-001

**Status:** Approved (2026-07-21) — moved to `workspace/test_design/Role/` · Run Scope: User Story / Pasted text (`Create-Role.md`) · Governing Project Context: `workspace/context/NDC_ProjectContext_Role.md` (Approved 2026-07-21)

| Requirement ID | Requirement | Test Case(s) | Discovery Reference | Finding Reference | Coverage Status |
|---|---|---|---|---|---|
| `FR-ROLECRT-NAME-01` | Role Name: text field, alphabetic-only (no numbers/special chars) | TC-ROLE-001, 002, 003, 005, 006, 007, 008 | `discovery/Timeline.md` #14–#16 | FINDING-002 (TC-002/003) | Covered |
| `FR-ROLECRT-NAME-02` | Role Name must be unique | TC-ROLE-004 | `discovery/Timeline.md` #17 | FINDING-002 | Covered |
| `FR-ROLECRT-AUTH-01` | At least one authorization checkbox required | TC-ROLE-009, 010 | `discovery/Timeline.md` #15 | FINDING-002 | Covered |
| `FR-ROLECRT-MOD-01` | All primary modules displayed as segments | TC-ROLE-011, 022 | `discovery/01-AddRole_Admin-Company-tab.png`; Timeline #8, #18 | FINDING-004 | Covered |
| `FR-ROLECRT-MOD-02` | Sub-module "Select All" checkbox exists | TC-ROLE-021 (exploratory charter only) | `discovery/findings/FINDING-001.../metadata.md` | FINDING-001 | **Partially Covered** — feature absent live; see Coverage Report §8 |
| `FR-ROLECRT-MOD-03` | "Select All" selects View/Edit/Approval for all rows | TC-ROLE-021 (exploratory charter only) | `discovery/findings/FINDING-001.../metadata.md` | FINDING-001 | **Partially Covered** — same as above |
| `FR-ROLECRT-MOD-04` | Admin sub-modules example: Company, Branch, Agency, Staff | TC-ROLE-012 | `discovery/01-AddRole_Admin-Company-tab.png`; Timeline #9 | N/A | Covered |
| `FR-ROLECRT-TAB-01` | Sub-module tab-grid (Operating Country/Role/Department/Advance Credit-Top Up) | TC-ROLE-013, 018 | `discovery/01-AddRole_Admin-Company-tab.png`; Timeline #9 | N/A | Covered |
| `FR-ROLECRT-PERM-01` | View independently selectable | TC-ROLE-014 | `discovery/03-AddRole_Approve-implies-View_and_View-alone.png`; Timeline #13 | N/A | Covered |
| `FR-ROLECRT-PERM-02` | Edit ticked → View auto-selected | TC-ROLE-015, 017 | `discovery/02-AddRole_Edit-implies-View.png`; Timeline #11 | N/A | Covered |
| `FR-ROLECRT-PERM-03` | Approval ticked → View auto-selected | TC-ROLE-016 | `discovery/03-AddRole_Approve-implies-View_and_View-alone.png`; Timeline #12 | N/A | Covered |
| `FR-ROLECRT-ACTION-01` | Submit-for-Approval button | TC-ROLE-020 | `discovery/00-AddRole_Dashboard-tab.png` | FINDING-003 | Covered |
| `FR-ROLECRT-ACTION-02` | Cancel clears/exits, navigates to Search Role Screen | TC-ROLE-019 | `discovery/04-Cancel_navigates-to-RoleList.png`; Timeline #19 | N/A | Covered |
| `BR-ROLECRT-01` | Dependency: Search Role screen (Cancel's target) | TC-ROLE-019 | `discovery/05-RoleList_SearchRole-screen.png` | N/A | Covered |

**Totals:** 14 Requirement IDs — 12 Covered, 2 Partially Covered, 0 Uncovered, 0 Out-of-Scope, 0 Unknown/Unassessed.
