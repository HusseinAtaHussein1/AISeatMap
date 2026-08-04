# FINDING-009 — Mandatory "Department" multi-select absent from Branch Contact Info

- **Finding ID:** FINDING-009
- **Title:** Mandatory "Department" multi-select absent from Branch Contact Info
- **Category:** Requirement Gap
- **Severity:** N/A
- **Severity Reason:** Category `Requirement Gap` is always N/A per the Severity Matrix — though this gap concerns a field the AC marks Mandatory, severity itself stays N/A by the Category rule; its business impact is instead captured in Business Risk.
- **Confidence Score:** 95%
- **Evidence Category:** Direct Observation, corroborated by Human Observation (module-owner direction, 2026-08-03)
- **Status:** Rejected
- **Business Risk:** The AC marks Department selection as Mandatory for every Branch Contact Person; since no such control exists anywhere on the live form, this specific acceptance criterion cannot currently be satisfied by any user action — a Test Design case written directly against the AC would be un-executable as written until this is resolved.
- **Technical Risk:** None identified.
- **Module:** branch
- **Workflow:** Admin → Branch → Create Branch → Branch Contact Info
- **Description:** The Branch Contact Info section contains Name, Email ID, and Phone Number fields followed directly by an "Add" button — there is no Department field, multi-select or otherwise, anywhere in that section or elsewhere on the page (confirmed via a full-page text search for "Department", which returned no match).
- **Expected Behavior:** "The user must select a Department from a multi-select dropdown. (Mandatory)" (PRD_UserStories.md US 5 §Branch Contact Info).
- **Actual Behavior:** No Department control of any kind exists on the Create Branch screen; Branch Contact Info consists only of Name, Email ID, Phone Number, and the Add button.
- **Steps to Reproduce:** 1) Log in as Super Admin. 2) Navigate to `/admin/branch/add`. 3) Scroll to "Branch Contact Info". 4) Search the rendered page text for "Department" — no match found.
- **Investigation/Recovery Result:** Not applicable — an absence check is deterministic; no retry category applies.
- **Investigation Notes:** This absence is corroborated by, but distinct from, the run-configuration decomposition gap already recorded in `modules/branch/context/ProjectContext.md` §3.1 — that item is about which *module* owns Department CRUD (attributed to `company`, still Proposed); this Finding is about the Branch Create *form itself* lacking any Department-selection control regardless of which module manages Department master data.

  **Human Review Update (2026-08-03):** The module owner directed this Finding (together with FINDING-008) to be ignored — "ignore this Two Mandatory fields from the story don't exist in the UI at all" — in the context of US 8605 being confirmed old/outdated elsewhere in the same review. The absence itself remains accurately observed; only its disposition changes.

  **Occurrence 2 (run-003, 2026-08-04):** Re-observed on the **Update Branch** screen, run-003, 2026-08-04. A full-page text scan finds no match for `/Department/i`, and the Branch Contact Info section contains only Name, Email ID and Phone Number controls. US 8606 restates the Department multi-select as **Mandatory**, so a mandatory field named by the story is absent from the Update screen exactly as it is from Create. Resolves ProjectContext.md RISK-BR-5 for this criterion: the "ignore" disposition **extends** on direct evidence.
- **Occurrence Count:** 2
- **Evidence Links:** `failure.png` (full-page screenshot showing Branch Contact Info's three fields and Add button with no Department control present).
- **Recommendation:** No further action this run per module-owner direction. If Department selection is reinstated in a future story revision, re-open this check.
