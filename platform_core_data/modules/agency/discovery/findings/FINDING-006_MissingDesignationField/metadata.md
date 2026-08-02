# FINDING-006

- **Finding ID:** FINDING-006

- **Title:** AC-5's `Designation` dropdown is absent from the Sales Contact section on both forms

- **Category:** Requirement Gap

- **Requirement Disposition:** **`Story Outdated / Requires Business Confirmation`** *(Project Context §1.1, **row 2** — added 2026-07-31 by user directive)*
  **Basis:** the PRD is **silent** on the Sales Contact section's field list — ORG-05 `[V]` names the
  section but never enumerates its fields — so no source corroborates the story here, and row 2 applies:
  design to observed behaviour, flagged as resting on the directive.
  **Why this is row 2 and FINDING-002 is row 3**, given both are absences: there, two `[V]`-tagged PRD
  requirements described the missing section, making removal the likely explanation. Here nothing but
  US-4222 ever asked for `Designation`, so "specified once and never built" is at least as likely as
  "built and removed" — and the field is Optional, so nothing depends on it either way.
  **This is not an application defect.**

- **Severity:** N/A

- **Severity Reason:** `Requirement Gap` carries no impact-if-defect rating (§5.4).

- **Confidence Score:** 90%

- **Evidence Category:** Direct Observation

- **Status:** Needs Human Review

- **Business Risk:** Low. `Designation` is the only **Optional** field in AC-5, so its absence blocks one acceptance criterion rather than a workflow. Nothing else in the story or the PRD depends on it.

- **Technical Risk:** None identified.

- **Module:** `agency`

- **Workflow:** Admin → Agency → Agency → edit an existing agency → Wonder Travel Sales Contact

- **Description:** AC-5 defines four fields for the Wonder Travel Sales Contact section: `Name` (mandatory), `Designation` (optional dropdown, *"Select a Designation from a pre-populated list"*), `Email ID` (mandatory), `Phone No.` (mandatory). The application renders **three**: `Name *`, `Email ID *`, `Phone Number *`, plus an `Add` button for additional sales personnel. No `Designation` control is present. The term `Designation` does not occur anywhere in the rendered text of either the update form or the create form.

  A related mandatory-marking difference was noted in the same section: AC-5 marks `Email ID` and `Phone No.` mandatory, and the application does render `Email ID *` and `Phone Number *` — so those agree. Only `Designation` is missing.

- **Expected Behavior:** The Project Context (`modules/agency/context/ProjectContext.md` §2, row "Wonder Travel Sales Contact") lists this section in scope citing **US-4222 AC-5**, whose field table includes `Designation` as a `Drop Down`, `Optional`, with the message `"Please Select a valid Designation."` **PRD ORG-05 `[V]`** lists *"Sales Contact"* as a section of the agency form but does not enumerate its fields, so the story is the only source that names `Designation`.

- **Actual Behavior:** The Sales Contact section renders `Name *`, `Email ID *`, `Phone Number *`, and `Add`. No `Designation` control exists on either the update or the create form.

- **Steps to Reproduce:**
  1. Authenticate to `http://192.168.1.70` as an Admin-capable account.
  2. Navigate Admin → Agency → Agency; open any agency via the pencil icon (observed at `/admin/agency/edit/949`).
  3. Scroll to the **Wonder Travel Sales Contact** section.
  4. Observe three fields and an `Add` button; no Designation dropdown.
  5. Repeat on the create form (`Add agency`) to confirm the absence is not specific to the update flow.

- **Investigation/Recovery Result:** Not applicable — no Investigation & Recovery Engine failure category matched (§5.7); nothing failed. As with FINDING-002, the observation was corroborated on the create form rather than by repetition, which is what distinguishes "missing from this flow" from "missing from the product".

- **Investigation Notes:** The form was fully scrolled before the text was read, so a lazily-mounted control would have rendered. The term search was run over the complete rendered text of both forms, case-insensitively. **Not exercised, and the reason Confidence is 90% rather than higher:** the field might appear only after clicking `Add` to create a *second* sales contact row, if the first row is a reduced form of the second. Clicking `Add` adds an unsaved row to a live agency's form — harmless in itself, since nothing was saved, but it was not attempted because the story gives no basis for expecting the first and subsequent rows to differ, and the more economical resolution is to ask the product owner. Stage 4M can settle it in one step while executing AC-5's "add multiple Sales personnel" criterion.

- **Root Cause Hypothesis:** Consistent with FINDING-005's reading that US-4222 describes an earlier or idealised version of the form — `Designation` may have been specified and dropped, or never built. Its absence from both forms means it is not an update-flow omission. **Confidence in this hypothesis: 55%.** *Unknowns:* whether a Designation master-data list exists anywhere in the product to populate such a dropdown; whether the field appears on additional sales-contact rows.

- **Occurrence Count:** 1

- **Evidence Links:**
  - `sales_contact_section.png` — the Wonder Travel Sales Contact section as rendered, showing exactly three fields and the `Add` button
  - `../FINDING-002_MissingPccSection/section_inventory.txt` — complete rendered text of the update form, searchable for the term (held once, referenced not duplicated)
  - **Not captured:** the state after clicking `Add` — deliberately not attempted (see Investigation Notes). Console log — the session produced zero console output.

- **Recommendation:** Confirm with the product owner whether `Designation` is expected. If it is, this is a small missing-field defect and AC-5's Designation criterion should be marked `Blocked — field not present` rather than `Failed`. If it is not, correct the story. Cheapest resolution path: have Stage 4M click `Add` while executing AC-5's multiple-sales-personnel criterion and record whether a Designation control appears on the added row — that closes the one open condition at no extra cost.
