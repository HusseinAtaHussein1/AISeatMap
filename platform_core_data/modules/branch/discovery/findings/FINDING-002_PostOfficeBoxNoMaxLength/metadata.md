# FINDING-002 — Post Office Box field has no 8-character max-length enforcement

- **Finding ID:** FINDING-002
- **Title:** Post Office Box field has no 8-character max-length enforcement
- **Category:** ~~Bug~~ → **Observation (Not Reproducible)**
- **Severity:** ~~Medium~~ → **N/A**
- **Severity Reason:** No defect exists. The module owner confirmed on 2026-08-10 that the field **does** stop at 8 characters in real use — see Human Review Update.
- **Confidence Score:** ~~90%~~ → **Withdrawn.** The 90% rested on a probe method now known to be capable of producing exactly this false result.
- **Evidence Category:** ~~Direct Observation~~ → Direct Observation **of a probe artefact**, not of application behaviour
- **Status:** **Rejected — Not Reproducible** (was `Confirmed`, 2026-08-03 → 2026-08-10)

- **Human Review Update (2026-08-10, module owner):** *"دي اخرها 8 ch فعلا"* — the Post Office Box field **does** enforce its 8-character maximum; typing stops at 8. **This Finding's core observation was wrong**, and it is closed as Not Reproducible rather than as a fixed defect, because there was nothing to fix.

- **Why the original observation was wrong — probable, and it matters beyond this Finding:** the recorded evidence is "the field's `maxlength` attribute is `null`" plus "a 12-character value is retained in full". A probe that sets a field's value by **assigning `element.value` in JavaScript bypasses HTML `maxlength` entirely** — the browser only enforces `maxlength` against real keystrokes. Such a probe will always report the full string retained, on a field that caps correctly for a human typist. That is consistent with everything recorded here and with the module owner's contradicting observation. **The same method underlies FINDING-003 and FINDING-004**, both of which the module owner has also now contradicted or dropped — three for three, which is what turns this from a one-off mistake into a method defect. It equally affects this suite's own automation: `Branch_Common.typeVia` / `AddBranch_Page.setValueAndNotify` set `.value` in JS, so **any max-length test built on them cannot fail an app that enforces the cap, and cannot pass one that does** — it will always read back the full string. Any future length-cap check must drive real keystrokes (`sendKeys`) instead.
- **Business Risk:** Branch records could be created with a Post Office Box value far longer than the business rule allows, producing inconsistent data and potential downstream formatting/display issues wherever Post Office Box is printed or matched (e.g. correspondence, reports).
- **Technical Risk:** The field carries no `maxlength` attribute and no client-side length validation; if the same absence extends server-side, arbitrarily long values could reach the database and any dependent report/label rendering.
- **Module:** branch
- **Workflow:** Admin → Branch → Create Branch → Branch Details → Post Office Box
- **Description:** Typing a 12-character alphanumeric string ("A1B2C3D4E5F6") into the Post Office Box field is fully accepted — no truncation, no `maxlength` HTML attribute, and no validation message on blur.
- **Expected Behavior:** "The user must enter a Post Office Box — input is alphanumeric and has a max length of 8 characters. (Mandatory)" (PRD_UserStories.md US 5 §Branch Details).
- **Actual Behavior:** The field's `maxlength` attribute is `null` (absent); a 12-character value is retained in full with no error shown on blur.
- **Steps to Reproduce:** 1) Log in as Super Admin. 2) Navigate to `/admin/branch/add`. 3) Click the Post Office Box field and type "A1B2C3D4E5F6" (12 characters). 4) Click away (blur) and observe the field retains all 12 characters with no error message.
- **Investigation/Recovery Result:** Failure category "Validation failure" (§5.7) — deterministic behavior, no retry required per the Engine's rule; validated once, result recorded.
- **Investigation Notes:** Investigation Mode (§5.8) Validation boundary conditions probed: long input (12 chars, tested) confirmed accepted. Empty value, spaces-only, unicode, emoji, and special characters were not probed for this field within this run's time-bounded scope (User Story strategy, §16) — recorded as not tested rather than assumed passing.
- **Occurrence Count:** 1
- **Evidence Links:** `failure.png` (full-page screenshot showing the 12-character value accepted with no error, alongside other probes from the same session). Console log and DOM snapshot not captured for this candidate — recorded as missing evidence (ad hoc probe scripts did not wire console/DOM capture).
- **Recommendation:** Add a `maxlength="8"` constraint (or equivalent framework-level validator) to the Post Office Box field and a corresponding validation message; confirm the same limit is enforced server-side.
