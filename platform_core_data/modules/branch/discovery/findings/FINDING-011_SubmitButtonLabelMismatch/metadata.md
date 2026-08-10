# FINDING-011 — Submit button reads "Send For Approval" instead of the AC's "Submit for Approval"

- **Finding ID:** FINDING-011
- **Title:** Submit button reads "Send For Approval" instead of the AC's "Submit for Approval"
- **Category:** ~~Bug~~ → **Requirement Gap (Outdated Requirement)**
- **Severity:** ~~Low~~ → **N/A**
- **Severity Reason:** Not a defect. The application's label is the correct one; the acceptance criteria are out of date.
- **Confidence Score:** 95% (that the label reads "Send For Approval" — unchanged and not in dispute; only its disposition changed)
- **Evidence Category:** Direct Observation
- **Status:** **Rejected — Outdated Requirement** (was `Confirmed`, 2026-08-03 → 2026-08-10)

- **Human Review Update (2026-08-10, module owner):** *"هو Send For Approval"* — **"Send For Approval" is the correct, intended label.** The application is right and the acceptance criteria are stale. Same disposition class as FINDING-005/006/007: an Outdated Requirement, not a bug. The observation itself is unchanged and remains accurate — the button does read "Send For Approval"; what changes is which side of the mismatch is wrong.

  **Two consequences, neither actioned here:**
  1. **`PRD_UserStories.md` should be corrected** to read "Send For Approval" wherever it specifies the Create/Update Branch submit label, so this does not get re-raised as a defect on the next Discovery pass.
  2. **`TC-BR-035`** ("Submit action button displays the label \"Submit for Approval\"") now asserts the stale wording and would fail against correct behaviour. It has **not** been rewritten — that is a Stage 3 decision. Flagged in `TestCases_Branch.md`.

  Worth noting for anyone reading the automation: `UpdateBranch_TC` already drives the real button via `clickSendForApproval()` and its own comment records that it deliberately targets "the label that actually exists" rather than the AC's wording — so no automation change is needed, and that earlier judgement is now confirmed correct.
- **Business Risk:** Minimal — could cause minor confusion if the business specifically expects the literal label "Submit for Approval" to appear (e.g. for training materials or other stories that reference that exact wording).
- **Technical Risk:** None identified.
- **Module:** branch
- **Workflow:** Admin → Branch → Create Branch → Buttons & Actions
- **Description:** The primary action button at the bottom of the Create Branch form is labeled "Send For Approval"; the Cancel button's label matches the AC exactly.
- **Expected Behavior:** "Submit for Approval: Saves the updates and submits the branch for review. (Mandatory)" (PRD_UserStories.md US 5 §Buttons & Actions).
- **Actual Behavior:** The button reads "Send For Approval," not "Submit for Approval."
- **Steps to Reproduce:** 1) Log in as Super Admin. 2) Navigate to `/admin/branch/add`. 3) Scroll to the bottom of the form and read the primary action button's label.
- **Investigation/Recovery Result:** Not applicable — a label read is deterministic; no retry category applies.
- **Investigation Notes:** Did not click the button (doing so would attempt to submit an incomplete/deliberately-invalid form populated with several of this run's probe values) — the label was read directly from the rendered screenshot/DOM text without interacting with the control.

  **Occurrence 2 (run-003, 2026-08-04):** Re-observed on the **Update Branch** screen, run-003, 2026-08-04. The submit action is labelled **`Send For Approval`** there too, against US 8606 §Buttons & Actions' "Submit for Approval". The same label mismatch therefore spans both the Create and Update screens, and both stories (US 8605 and US 8606) use the "Submit for Approval" wording. Full observed button set on an Approved record: `Add`, `Add`, `Change Threshold`, `Cancel`, `Reject`, `Approve`, `Send For Approval`. Unlike Create, the Update screen also renders `Approve` and `Reject` directly on the form. Treated as one underlying condition (the product's label differs from the stories' label) rather than a second Finding, per §5.9.
- **Occurrence Count:** 2
- **Evidence Links:** `failure.png` (full-page screenshot showing the "Send For Approval" and "Cancel" buttons at the bottom of the form).
- **Recommendation:** Low priority — confirm with Product/Business whether the exact button wording matters for this story; if not, treat as a non-issue and update the AC's wording instead.
