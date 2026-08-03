# FINDING-008 — "PAN Number" field absent from the live Create Branch screen

- **Finding ID:** FINDING-008
- **Title:** "PAN Number" field absent from the live Create Branch screen
- **Category:** Requirement Gap
- **Severity:** N/A
- **Severity Reason:** Category `Requirement Gap` is always N/A per the Severity Matrix.
- **Confidence Score:** 95%
- **Evidence Category:** Direct Observation, corroborated by Human Observation (module-owner direction, 2026-08-03)
- **Status:** Rejected
- **Business Risk:** If PAN Number is a genuinely required optional-capture field for some branches (e.g. certain tax jurisdictions), its absence means that data can never be captured at Branch creation through this screen.
- **Technical Risk:** None identified.
- **Module:** branch
- **Workflow:** Admin → Branch → Create Branch → Branch Details
- **Description:** The Branch Details section shows "Service Tax Number" and "ABTA Number" fields, but no "PAN Number" field anywhere on the page — confirmed via a full-page text search for the literal string "PAN", which returned no match.
- **Expected Behavior:** "The user may enter a PAN Number, Service Tax Number, and ABTA Number. Inputs are alphanumeric, and values are in uppercase. (Optional)" (PRD_UserStories.md US 5 §Branch Details).
- **Actual Behavior:** Service Tax Number and ABTA Number fields are present and match the AC; no PAN Number field or label exists anywhere in the page's rendered text.
- **Steps to Reproduce:** 1) Log in as Super Admin. 2) Navigate to `/admin/branch/add`. 3) Search the rendered page text for "PAN" — no match found; visually confirm only Service Tax Number and ABTA Number appear in that field group.
- **Investigation/Recovery Result:** Not applicable — an absence check is deterministic; no retry category applies.
- **Investigation Notes:** Only a full-page text-content search was performed (not a check for a differently-labeled field that might serve the same purpose under another name) — if the business intends PAN Number to exist under a different label, this Finding would not have detected it, and that possibility is left open here rather than ruled out.

  **Human Review Update (2026-08-03):** The module owner directed this Finding (together with FINDING-009) to be ignored — "ignore this Two Mandatory fields from the story don't exist in the UI at all" — in the context of US 8605 being confirmed old/outdated elsewhere in the same review. The absence itself remains accurately observed; only its disposition changes, from "needs Product/Business confirmation" to "explicitly deprioritized by module-owner direction."
- **Occurrence Count:** 1
- **Evidence Links:** `failure.png` (full-page screenshot of the Create Branch form's Branch Details section, showing Service Tax Number and ABTA Number with no PAN Number field between or near them).
- **Recommendation:** No further action this run per module-owner direction. If PAN Number is reinstated in a future story revision, re-open this check.
