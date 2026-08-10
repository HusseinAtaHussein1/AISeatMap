# FINDING-003 — Credit Limit field has no 15-digit max-length enforcement

- **Finding ID:** FINDING-003
- **Title:** Credit Limit field has no 15-digit max-length enforcement
- **Category:** ~~Bug~~ → **Observation (Not Reproducible / Confirmed Intended Behaviour)**
- **Severity:** ~~Medium~~ → **N/A**
- **Severity Reason:** No defect exists on either count — the length cap **is** enforced, and the absence of a validation message is intended. See Human Review Update.
- **Confidence Score:** ~~90%~~ → **Withdrawn** (same probe-method defect as FINDING-002).
- **Evidence Category:** ~~Direct Observation~~ → Direct Observation **of a probe artefact**, not of application behaviour
- **Status:** **Rejected — Not Reproducible + Confirmed Intended Behaviour** (was `Confirmed`, 2026-08-03 → 2026-08-10)

- **Human Review Update (2026-08-10, module owner):** *"دي اخرها 15 وبعدها مبتعرفش تكتب تاني بس مفيش validation message بتظهر وده برضو هما عايزينه كده"* — the field **does** stop at 15 characters; typing beyond that is simply not possible. No validation message appears when the cap is reached, and **that is intended behaviour the business wants**. This Finding is therefore wrong on its central claim and closed:
  - **"No 15-digit max enforced"** → **factually incorrect.** The cap is enforced by the input itself. Same probe-method defect as FINDING-002: assigning `element.value` in JavaScript bypasses HTML `maxlength`, so the probe read back 16 characters from a field that never accepts more than 15 from a keyboard.
  - **"No length-related error message"** → **correct observation, intended behaviour.** Silently refusing the 16th keystroke *is* the intended UX; no message is expected. Not a defect.

- **Note on the separately-recorded numeric-only rule:** the original Investigation Notes recorded that non-numeric input **is** correctly rejected with "Please enter a numeric value (with 2 decimal places allowed)." That observation is unaffected by this disposition and remains valid — it was produced by a different check. The undocumented "2 decimal places" constraint it revealed is still worth documenting in the requirements; that item is *not* closed by this update.
- **Business Risk:** Credit Limit is a core credit-risk control field (PRD.md §1.1 objective 2, "control credit risk per agency/branch"); accepting values beyond the documented 15-digit cap could allow unintended, extremely large credit limits to be configured.
- **Technical Risk:** No `maxlength` attribute is present; if server-side validation mirrors this gap, an oversized numeric value could reach the database, risking overflow/precision issues in downstream credit-calculation logic.
- **Module:** branch
- **Workflow:** Admin → Branch → Create Branch → Branch Sales Configuration → Credit Limit
- **Description:** Typing a 16-digit numeric string ("1234567890123456") into Credit Limit is fully accepted with no truncation and no error — one digit beyond the AC's stated 15-character maximum. Separately, typing a non-numeric string ("abc123xyz789") into the same field IS caught by an inline validation message ("Please enter a numeric value (with 2 decimal places allowed).") shown on blur — the numeric-only rule itself is enforced; only the length cap is not.
- **Expected Behavior:** "The user must enter a Credit Limit (numeric input only). It has a max length of 15 characters. (Mandatory)" (PRD_UserStories.md US 5 §Branch Sales Configuration).
- **Actual Behavior:** 16 numeric digits are accepted in full (`maxlength` attribute absent); the numeric-only rule is separately and correctly enforced via a blur-triggered validation message.
- **Steps to Reproduce:** 1) Log in as Super Admin. 2) Navigate to `/admin/branch/add`. 3) Type "1234567890123456" (16 digits) into Credit Limit. 4) Click away and observe no length-related error and the full value retained.
- **Investigation/Recovery Result:** Failure category "Validation failure" (§5.7) — deterministic, no retry required.
- **Investigation Notes:** Investigation Mode boundary conditions probed: long numeric input (16 digits, tested — accepted); non-numeric input (tested separately — correctly rejected with an inline message, see Actual Behavior). The message text specifies "2 decimal places allowed," a constraint not mentioned anywhere in the AC — recorded as a separate, undocumented business rule rather than folded into this Finding's defect claim (see QA Assessment Report §7 Assumptions).
- **Occurrence Count:** 1
- **Evidence Links:** `failure.png` (screenshot showing the 16-digit value retained in the Credit Limit field). Console log and DOM snapshot not captured — recorded as missing evidence.
- **Recommendation:** Add a `maxlength="15"` constraint (or equivalent) to Credit Limit and confirm the same cap is enforced server-side; separately confirm with the business whether the "2 decimal places" rule surfaced by the validation message is an intended, documented requirement.
