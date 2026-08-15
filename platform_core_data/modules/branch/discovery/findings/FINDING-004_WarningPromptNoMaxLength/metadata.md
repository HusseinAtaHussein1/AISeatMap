# FINDING-004 — Warning Prompt (Days) field has no 11-digit max-length enforcement

- **Finding ID:** FINDING-004
- **Title:** Warning Prompt (Days) field has no 11-digit max-length enforcement
> **DISPOSITION (2026-08-10, module owner): dropped, and removed from automation scope.** *"دي سيبك منها وشيلها من التيست كيسز بتاعت الاوتوميشن"* — leave this one alone and take it out of the automation test cases. Accordingly: **`TC-BR-026` has been removed from the automation suite** (the `tcBr026_…` method is deleted, not merely disabled) and its `Automation` flag set to `Rejected — removed from scope`. The Stage 3 test case itself is **retained, unchanged**, in the manual suite — removing it from automation is a scope decision, not a decision to discard the case.
>
> **Status changed to `Rejected — Dropped by module owner`.** Note this Finding rests on the **same probe-method defect** that made FINDING-002 and FINDING-003 false: assigning `element.value` in JavaScript bypasses HTML `maxlength`, so "14 digits accepted with no truncation" is what that probe would report even against a field that correctly caps at 11. Three findings, one method, all three now contradicted or dropped by the module owner. This one is closed on instruction rather than on re-verification — the field's real behaviour was **not** re-probed with keystrokes, so whether it enforces 11 digits remains genuinely unverified, not confirmed-good.
>
> **Also still open and untouched by this disposition:** **FINDING-016**, the conflict between Warning Prompt's documented 11-digit cap and Credit Terms' 7-digit cap. That is a requirements contradiction, independent of whether the app enforces either cap, and it does not go away by dropping this Finding.

- **Category:** ~~Bug~~ → **Observation (Dropped)**
- **Severity:** ~~Medium~~ → **N/A**
- **Severity Reason:** Matches the Medium criterion "Validation issues" — a documented input-length business rule is not enforced.
- **Confidence Score:** 88%
- **Evidence Category:** Direct Observation
- **Status:** **Rejected — Dropped by module owner** (was `Confirmed`, 2026-08-03 → 2026-08-10)
- **Business Risk:** An unreasonably large Warning Prompt value could be configured, undermining the intent of an early-warning threshold ahead of Credit Terms (Days) expiry.
- **Technical Risk:** No `maxlength` attribute is present on this field.
- **Module:** branch
- **Workflow:** Admin → Branch → Create Branch → Branch Sales Configuration → Warning Prompt (Days)
- **Description:** Typing 14 digits ("99999999999999") into Warning Prompt (Days) is fully accepted with no truncation and no visible error, exceeding the AC's stated 11-digit maximum by 3 digits.
- **Expected Behavior:** "The user may enter a Warning Prompt (Days) (free text, numeric input, it has a max length of 11 number and should be less than Credit Terms (Days).). (Optional)" (PRD_UserStories.md US 5 §Branch Sales Configuration).
- **Actual Behavior:** 14 digits are accepted in full; no length-related validation message appears.
- **Steps to Reproduce:** 1) Log in as Super Admin. 2) Navigate to `/admin/branch/add`. 3) Type "99999999999999" (14 digits) into Warning Prompt (Days). 4) Click away and observe the full value is retained with no length error.
- **Investigation/Recovery Result:** Failure category "Validation failure" (§5.7) — deterministic, no retry required.
- **Investigation Notes:** The cross-field rule "should be less than Credit Terms (Days)" could not be tested in this run because Credit Terms (Days) was left empty during this probe sequence (it is a separate Mandatory field not populated for this specific check) — this sub-rule was recorded as Open Question OQ-BR-2 in the QA Assessment Report. An initial automated scrape appeared to show a "Reaching Percentage should not be greater than 100%" message near this field; a full-page screenshot review showed that message belongs to the adjacent Reaching Percentage field and does not actually render under Warning Prompt — this is noted explicitly so the mis-attribution is not mistaken for observed Warning Prompt behavior.
- **Update 2026-08-03 (module owner, Human Observation evidence) — OQ-BR-2 resolved:** the module owner supplied a screenshot (Credit Terms(Days)=10000, Warning Prompt(Days)=151515) showing the live application does enforce the cross-field rule, rendering the inline message **"Warning prompt days should not be greater than credit terms days"** on blur. This confirms the cross-field comparison is implemented and separate from the still-open, unenforced 11-digit length cap this Finding is about. It does **not** change this Finding's own Category/Status — the length-cap defect (14 digits accepted with no error) was observed with Credit Terms left empty, a condition the new evidence does not re-test. Consequence for Test Design: any future length-cap probe of this field must set Credit Terms (Days) to a value at least as large as the Warning Prompt test value, or the cross-field message will fire first and mask whether the length cap is enforced.
- **Occurrence Count:** 1
- **Evidence Links:** `failure.png` (full-page screenshot showing the 14-digit value in Warning Prompt with no adjacent error). Console log and DOM snapshot not captured — recorded as missing evidence. Module-owner-supplied screenshot (2026-08-03, chat) confirming the cross-field message — Human Observation evidence category, not filed as a evidence-package artifact.
- **Recommendation:** Add a `maxlength="11"` constraint to Warning Prompt (Days). The cross-field "should not be greater than Credit Terms (Days)" validation is now confirmed working and needs no further development fix.
