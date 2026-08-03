# FINDING-005 — Import PNR checkbox is unchecked by default on a fresh Create Branch form

- **Finding ID:** FINDING-005
- **Title:** Import PNR checkbox is unchecked by default on a fresh Create Branch form
- **Category:** Requirement Gap
- **Severity:** N/A
- **Severity Reason:** Category `Requirement Gap` is always N/A per the Severity Matrix — reclassified from `Bug` after human review confirmed the unchecked default is intended, current behavior, and US 8605's "always checked" wording is outdated.
- **Confidence Score:** 96%
- **Evidence Category:** Direct Observation, corroborated by Human Observation (module-owner clarification, 2026-08-03)
- **Status:** Rejected
- **Business Risk:** If a Branch is created without a human explicitly checking Import PNR, and the AC's intent is that it should always be on, branches could be created lacking Import PNR functionality that the business expects to be universal.
- **Technical Risk:** The checkbox's default `checked` state in the DOM is `false`, i.e. the client renders it unchecked; whether Import PNR is nonetheless forced on server-side (independent of this checkbox's visual state) is unverified.
- **Module:** branch
- **Workflow:** Admin → Branch → Create Branch → Import PNR
- **Description:** On a freshly loaded Create Branch form, the "Import PNR" checkbox's `checked` DOM property reads `false`; it renders visually unchecked in the corresponding screenshot.
- **Expected Behavior:** "The Import PNR checkbox is always checked." (PRD_UserStories.md US 5 §Import PNR).
- **Actual Behavior:** The checkbox is unchecked (`checked: false`) immediately after navigating to `/admin/branch/add`, confirmed both via direct DOM property read and visually in a full-page screenshot.
- **Steps to Reproduce:** 1) Log in as Super Admin. 2) Navigate to `/admin/branch/add` (fresh page load). 3) Scroll to the "Import PNR" checkbox at the bottom of the form. 4) Observe it is unchecked.
- **Investigation/Recovery Result:** Failure category "Unexpected UI rendering" (§5.7) — recovery behavior "refresh the page once" was applied by re-navigating to `/admin/branch/add` in a separate authenticated session; the checkbox was unchecked on both occasions — outcome: persisted after recovery attempt.
- **Investigation Notes:** Did not attempt to submit the form with Import PNR left unchecked to observe server-side behavior, since doing so would create a real Branch record and this specific check does not require it — checking the client-rendered default state was sufficient to evidence the discrepancy. Not checking the box and inspecting a created record's actual Import PNR flag server-side would require completing a full submission, which is a larger action deferred to Test Design/Execution rather than performed speculatively here.

  **Human Review Update (2026-08-03):** The module owner confirmed the unchecked default is intentional, current behavior — "this is a feature not a bug." US 8605's "always checked" acceptance criterion is outdated relative to the current build. The observation itself (unchecked by default) stands as correctly reported; only its disposition changes, from a defect to an outdated-requirement gap.
- **Occurrence Count:** 1
- **Evidence Links:** `failure.png` (full-page screenshot of the Create Branch form showing the unchecked Import PNR checkbox). DOM property read (`checked: false`) captured in this Finding's Investigation Notes rather than as a separate file.
- **Recommendation:** Update US 8605's Import PNR acceptance criterion to match current, confirmed behavior (user-controlled toggle, not forced-checked) rather than treating the current build as non-compliant.
