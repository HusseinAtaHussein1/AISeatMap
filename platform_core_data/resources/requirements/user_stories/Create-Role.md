# Create Role (Admin — Role Management)

**Type:** User Story · **Source:** Plain Text (pasted) · **Received:** 2026-07-21 · **Status:** Raw pasted-text source, not yet used to generate a Project Context (per `pipeline/run_scope.md` §4.1, this is a User Story Run Scope, Source = Pasted text).

> Source is metadata, not a folder — see `resources/README.md` → "Requirement Source is metadata." This file lives at `requirements/user_stories/` regardless of Source; only the `Source:` field above records how it was delivered.

## Description

As an OdesysesAdmin & Admin, I want to Create and manage roles with granular permissions for each module, sub-module, and their respective functionalities, So that I can ensure users have appropriate access levels while maintaining system security and usability.

## Acceptance Criteria

### Role Name Field

| Field | Validation | Msg | Field Type | Status |
|---|---|---|---|---|
| Role Name | Text field; only normal characters allowed (no special characters or numbers); must be unique — duplication of names is not allowed | "Role Name already exists, Please Enter another Role Name." | Text Input | Mandatory |

### Authorization Selection

- At least one segment or authority checkbox has to be selected.
- Validation message: "One authorization at least must be selected."

### Modules and Sub-Modules

The system must display all primary modules as segments:

- Dashboard
- Admin
- Master
- Rule Engine
- Settings
- User Management
- Booking Mid Office
- Profile
- Reports

- Each module must have smaller segments for sub-modules, with a "Select All" checkbox.
- "Select All" behavior: selects all checkboxes (View, Edit, Approval) for all rows ("Sub-Tabs").

Example — Admin module sub-modules:
- Company
- Branch
- Agency
- Staff

### Tab Management within Sub-Modules

Each sub-module (e.g., Company) must have a grid listing its specific tabs, such as:
- Operating Countries
- Role
- Department
- Advanced Pop-Up

### Permissions Checkboxes

Each row in the tab grid must include the following permission checkboxes: View, Edit, Approval.

| Checkbox | Behavior |
|---|---|
| View | Can be selected independently. |
| Edit | If ticked, View is automatically selected. |
| Approval | If ticked, View is automatically selected. |

### Action Buttons

Two buttons must be displayed at the bottom of the screen:

| Button | Behavior |
|---|---|
| Submit for Approval | Initiates the process to save and submit the role for approval. |
| Cancel | Clears the inputs or exits the role creation process without saving & navigates to the Search Role Screen. |

## Dependencies

- N/A

## Reflection

- Search Role
- Update Role
- STAFF CRUD
