# FINDING-010 — Numeric and URL fields reject or accept input silently, with no format message

| Field | Value |
|---|---|
| **Finding ID** | FINDING-010 |
| **Title** | Numeric fields discard non-numeric keystrokes with no message (PRD XC-20 requires one); `Company URL` accepts free text with no message (US-4222 requires one) |
| **Category** | Bug |
| **Severity** | Medium |
| **Severity Reason** | Severity Matrix, `Medium` — *"Validation issues · Business rule inconsistencies"*. The form remains usable and no workflow is blocked, so it does not reach `High`; a platform-wide `[V]` validation message failing to appear is more than cosmetic, so it does not fall to `Low`. |
| **Confidence Score** | 92% |
| **Evidence Category** | Direct Observation |
| **Status** | Needs Human Review |
| **Discovery Mode** | Browser automation — **Browser Driver**, headed |
| **Requirement Disposition** | Numeric half: **`Application Defect (candidate)`** (ProjectContext §1.1 row 5) — PRD **XC-20** `[V]` states the message and no source supersedes it. URL half: `Story Outdated / Requires Business Confirmation` (row 2) — the PRD is silent on URL validation. |
| **Business Risk** | A user typing letters into `Credit limit` sees the field silently revert to its previous value with no explanation, which reads as the application ignoring input. On `Company URL`, an unusable value such as `asdas` is stored and shown as valid, so downstream consumers of the agency's URL receive junk. |
| **Technical Risk** | Client-side masking without a message means the only signal that input was rejected is the absent character. If any equivalent server-side validation is missing too, a non-numeric value arriving from another client would not be caught here. Not verified — no API-level probe was run. |
| **Module** | `agency` |
| **Workflow** | Admin → Agency → edit agency 949 → Agency Master (`Company URL`) and Payment settings (`Credit limit *`) |

## Description

Two distinct format behaviours, both silent:

| Field | Typed with real keystrokes | Kept by the field | Message shown |
|---|---|---|---|
| `Credit limit *` | `abcdef` | `1000000` (the previous value) | **none** |
| `Phone No *` | `abcdefgh` | *(empty)* | `Required` — a mandatory message, not a format message |
| `Company URL` | `not a url at all` | `not a url at all` | **none** |

Two adjacent behaviours were verified as correct in the same pass and are recorded here so the boundary is clear rather than implied:

| Field | Typed | Result |
|---|---|---|
| `Email ID *` (Agency Owner Details) | `not-an-email` | **`Please enter a valid email`** — matches PRD XC-18 `[V]` exactly |
| `Post office box *` | 12 characters | 8 kept — max length enforced against real keystrokes |
| `Credit Terms (Days) *` | 15 characters | 11 kept — max length enforced against real keystrokes |

## Expected Behavior

- **Numeric fields:** PRD **XC-20** `[V]` — *"Numeric-only fields must reject non-numeric input: **'Please match the requested format, only numeric values are allowed'**"*. The requirement names both the rejection **and** the message.
- **Company URL:** US-4222 AC-1 states `Company URL`, type URL, Optional, message **"Please enter a valid URL."**. The PRD does not mention URL validation, so it neither corroborates nor contradicts the story.

## Actual Behavior

Rejection happens; the message does not. `Credit limit *` discarded every alphabetic keystroke and, on blur, displayed its previous value `1000000` with no error text anywhere in the field's container. `Company URL` accepted `not a url at all` verbatim and showed no message; the record's stored value at load time was already `asdas`, which is consistent with this having been possible for some time.

## Steps to Reproduce

1. Log in as `odeysysadmin`, open `/admin/agency/edit/949`, wait for pre-fill.
2. Click `Credit limit *`, select all, delete, and **type** `abcdef` with real keystrokes (do not assign `element.value` — a scripted assignment bypasses the browser's own input handling and produces a false result).
3. Press Tab. Observe the field shows `1000000` and no message is rendered.
4. Click `Company URL`, clear it, type `not a url at all`, press Tab. Observe the value is kept and no message is rendered.
5. Do not save. Reload the record to discard the in-form edits.

## Investigation/Recovery Result

Investigation and Recovery Engine — **"Validation failure" category: no retry, by rule.** Validation behaviour is deterministic, so a retry adds no information. Each probe was nevertheless performed once per field and the field restored to its original value immediately afterwards; the form was never saved.

## Investigation Notes

Boundary conditions probed per §5.8 (Validation), all through real keystrokes:

| Probe | Field | Result |
|---|---|---|
| Empty value | `Agency *` | `Required` |
| Empty value | `Phone No *` | `Required` |
| Invalid format | `Email ID *` | `Please enter a valid email` |
| Alphabetic into numeric | `Credit limit *` | silently discarded, previous value restored, **no message** |
| Alphabetic into phone | `Phone No *` | silently discarded, field left empty, then `Required` |
| Over max length | `Post office box *` | truncated at 8 |
| Over max length | `Credit Terms (Days) *` | truncated at 11 |
| Free text into URL | `Company URL` | accepted, **no message** |

**Skipped and why:** Unicode, emoji, and SQL-injection-shaped payloads were not typed into this record's fields. The mutation grant covers records this run created (ProjectContext §5), and this is a shared record; every probe above was chosen because it can be fully reversed in-form without saving, and a payload probe adds risk without adding to what XC-20 already settles. These belong in Stage 5A against a self-created record.

## Root Cause Hypothesis

- **Possible Root Cause** — the numeric fields may use an input mask or `keypress` filter that drops disallowed characters before they reach the form control, so the control never enters an invalid state and the message bound to that state never renders.
- **Confidence** — 65%.
- **Supporting Evidence** — the typed characters never appeared in the field at all (the accepted value equals the previous value, not a partially-typed string), which is the signature of a keystroke filter rather than of post-hoc validation.
- **Unknowns** — the form-generator's field configuration, and whether XC-20's message exists elsewhere in the application (it is `[V]` against Rate of Exchange, so the string is implemented somewhere).

## Occurrence Count

2 — one occurrence per behaviour (numeric masking, URL acceptance), recorded as a single Finding because both are the same underlying condition: a format rule enforced or skipped without its message.

## Unclear Items

| Rect | What was observed | What exactly is unclear | The question | Why the answer matters | Original | Annotated |
|---|---|---|---|---|---|---|
| `Q5` | `Credit limit *` discarded `abcdef` and re-displayed `1000000` with no message. | Whether silent masking is the intended platform behaviour, given PRD XC-20 `[V]` names an explicit message for exactly this case. | Should numeric-only fields show *"Please match the requested format, only numeric values are allowed"*, or is silent masking the current intended design and XC-20 outdated? | It decides whether Stage 3 asserts a message (and execution reports a failure) or asserts silent masking. The two expected results are mutually exclusive. | `input_format.png` | `input_format.annotated.png` |
| `Q6` | `Company URL` accepted `not a url at all`; the stored value on load was `asdas`. | Whether URL format validation was ever implemented, given the story specifies *"Please enter a valid URL."* and the PRD says nothing. | Is `Company URL` meant to validate URL format on Agency Update? | It decides whether AC-1's URL row is designed as a negative case or recorded as an outdated story line. | `input_format.png` | `input_format.annotated.png` |

## Evidence Links

| File | What it shows |
|---|---|
| `input_format.png` | Full page in the state where `Company URL` holds `not a url at all` |
| `input_format.annotated.png` | `Q5` and `Q6` rectangles around `Credit limit *` and `Company URL` |
| `format_and_maxlength_probes.json` | Every probe: typed string, accepted value, lengths, and the messages found next to each field |
| `../../evidence/run-004/phase_e_message_field_map.json` | The field-to-message map captured from the create form |
| `../../evidence/run-004/phase_f_console.log` | Console during the probing session |

**Not captured:** no DOM snapshot was saved for the invalid states. The probe JSON records the accepted value and the rendered messages per field, which is the evidence the claim rests on; a serialized DOM would not add to it.

## Recommendation

Confirm with the product owner whether XC-20's numeric message should appear on the Agency form. Because XC-20 is `[V]` and unsuperseded, treat the numeric half as an application defect candidate — design the case to the requirement and let execution report the outcome (ProjectContext §1.1 row 5). Ask separately whether `Company URL` should validate format at all.
