# FINDING-010 — "Outstanding Threshold" field traces to US 51489's "Child Agencies Threshold Amount"

- **Finding ID:** FINDING-010
- **Title:** "Outstanding Threshold" field traces to US 51489's "Child Agencies Threshold Amount"
- **Category:** Observation
- **Severity:** N/A
- **Severity Reason:** Category `Observation` is always N/A per the Severity Matrix — reclassified from `Requirement Gap` now that traceability to an authoritative requirement is established; this is expected, documented behavior, not a gap.
- **Confidence Score:** 97%
- **Evidence Category:** Direct Observation, corroborated by Human Observation (module-owner confirmation, 2026-08-03)
- **Status:** Rejected
  <!-- Closest fit in the fixed Status enum (§5.6: Confirmed / Needs Human Review / Duplicate / Rejected) for "this was investigated further and determined to be a non-issue" — the module owner's own disposition language for this item is **Expected Implementation / Requirement Traceability**, recorded verbatim below and in ProjectContext.md §6, since the platform's Status enum has no closer-matching value. This must NOT be read or reported as an application defect. -->
- **Business Risk:** None identified — this is expected, documented behavior once traced to its authoritative source.
- **Technical Risk:** None identified.
- **Module:** branch
- **Workflow:** Admin → Branch → Create Branch → Branch Sales Configuration
- **Description:** A field labeled "Outstanding Threshold *" (marked Mandatory by its asterisk) appears in the Branch Sales Configuration section, positioned after Payment Option and before Product Access Details, pre-filled with the value "5".
- **Expected Behavior:** "Add a new Child Agencies Threshold Amount field. Allows administrators to define a default threshold for all child agencies under the branch. The configured threshold is automatically applied to child agencies that inherit the branch configuration." (PRD_UserStories.md User Story 6 / US 51489 / WT1-T3177 §2 Branch Module) — **this is now the field's authoritative requirement**, confirmed by the module owner as the same feature as the live "Outstanding Threshold" field, despite the literal label difference.
- **Actual Behavior:** An "Outstanding Threshold *" numeric input is present and pre-populated with "5" on a fresh Create Branch form.
- **Steps to Reproduce:** 1) Log in as Super Admin. 2) Navigate to `/admin/branch/add`. 3) Scroll past the Payment Option row. 4) Observe the "Outstanding Threshold *" field with default value "5".
- **Investigation/Recovery Result:** Not applicable — a presence observation is deterministic; no retry category applies.
- **Investigation Notes:** Did not investigate this field's validation rules (numeric bounds, whether it's editable) beyond confirming its presence and default value, since it falls outside US 8605's stated scope and this run's User Story-scoped strategy (§16) directs against wandering into un-scoped territory beyond what's needed to verify the story. The confirmation-popup flow described in US 51489 §4 (Branch Threshold Update) was not exercised this run and remains an Open Question for a follow-up pass.

  **Human Review Update (2026-08-03, first pass):** The module owner identified this field as belonging to a separate, newer story — US 51489 (Q3-INTE-CORE-049 / WT1-T3177, "[Admin] Agency wallet Threshold option") — and supplied its text, now recorded as PRD_UserStories.md User Story 6. Disposition at that point: Outdated/Extended Requirement, pending confirmation of the exact field-identity match.

  **Human Review Update (2026-08-03, second pass):** The module owner explicitly confirmed the match — "Outstanding Threshold on the Branch UI corresponds to 'Child Agencies Threshold Amount' defined in US 51489 / WT1-T3177" — and directed that this Finding be reclassified from `Needs Human Review` to **Expected Implementation / Requirement Traceability**, and never reported as an application defect. Traceability is now established: US 51489 §2 Branch Module is this field's authoritative requirement, and `ProjectContext.md` has been updated accordingly (§2, §6, §7) so Stage 3 (Test Design) uses US 51489 as the source for this field.
- **Occurrence Count:** 1
- **Evidence Links:** `failure.png` (full-page screenshot showing "Outstanding Threshold *" with default value "5" between Payment Option and Product Access Details).
- **Recommendation:** Test Design should design cases against US 51489 §2 (the field itself) and §4 (the Branch Threshold Update confirmation-popup flow, not yet explored by Discovery) using US 51489 as the authoritative requirement — not against US 8605, which does not mention this field at all.
