# FINDING-001

- **Finding ID:** FINDING-001

- **Title:** Mandatory-field violations render `Required`, not the per-field messages US-4222 specifies

- **Category:** Requirement Gap

- **Requirement Disposition:** **`Story Outdated — PRD-corroborated`** *(Project Context §1.1, row 1 — added 2026-07-31 by user directive)*
  <!-- A user-mandated field, not part of the §5.14 schema. Placed adjacent to Category because the two
       are read together: Category says what kind of Finding this is, Disposition says which source wins. -->
  **Basis:** the discriminator's strongest case. **PRD XC-17 `[V]`** states the platform-wide
  mandatory-field message is `Required` — an automation-asserted requirement that matches observed
  behaviour exactly. Two independent sources (the application and the PRD) therefore agree, and US-4222
  is the outlier. **This resolves DOQ-01.** Stage 3 designs to `Required`; the story's ~20 per-field
  strings are recorded as outdated specification, not as unmet requirements.
  **This is not an application defect.**

- **Severity:** N/A

- **Severity Reason:** `Requirement Gap` carries no impact-if-defect rating (Severity Matrix, §5.4) — it asserts a documentation/requirement conflict, not an application defect. The consequence is stated under Business Risk instead, and it is large.

- **Confidence Score:** 95%

- **Evidence Category:** Direct Observation

- **Status:** Needs Human Review

- **Business Risk:** **US-4222 specifies an exact validation message for roughly twenty fields, and the application appears to use one shared message for all of them.** Every one of those acceptance criteria is therefore unverifiable as written. If Stage 3 encodes the story's strings as expected results, essentially every negative test case in the suite will fail — on message text, not on behaviour — and a reviewer reading that suite would conclude the product is broken when the requirement may simply be wrong. This is the single largest risk to the correctness of this run's test design, which is why it is raised before Stage 3 rather than discovered during Stage 4M.

- **Technical Risk:** None identified. A single shared validation string is a deliberate, consistent implementation choice, not a fault: PRD XC-17 records `Required` as the platform-wide mandatory-field message and marks it `[V]` — asserted by the existing automation across multiple modules. The technical implementation is self-consistent; the disagreement is with the story.

- **Module:** `agency`

- **Workflow:** Admin → Agency → edit an existing agency → clear a mandatory field → blur

- **Description:** Four mandatory fields on the Update Agency form were cleared and blurred, one at a time. In every case the application rendered the single word **`Required`** beneath the field, in red, with a red field border. None of the four rendered the field-specific message US-4222 specifies for it. A fifth field (`Bank name`, optional in the story) rendered no message at all, which is consistent with it being optional.

  | Field | US-4222 specifies | Application rendered |
  |---|---|---|
  | Agency name (AC-1) | `Please enter a valid Agency Name.` | `Required` |
  | Post office box (AC-1) | `Please enter a valid City Post Office.` | `Required` |
  | Contact person (AC-2) | `Please enter a valid Name.` | `Required` |
  | Credit limit (AC-7) | `Please enter a valid Credit Limit.` | `Required` |
  | Bank name (AC-6, optional) | `Please enter a valid Bank Name.` | *(no message — field is optional)* |

- **Expected Behavior:** The Project Context's in-scope requirement set (`modules/agency/context/ProjectContext.md` §2, row "Field-level validation and messages for every field above") states that US-4222 specifies an exact message per field and that the story is **authoritative** for this run where it and the PRD disagree. The Project Context also carries the competing statement forward: §7 Traceability Anchor cites **PRD XC-17 `[V]`** — *"Mandatory-field violation message is `Required` platform-wide"* — and ASM-018 records the story's message strings as an open question precisely because message assertions are exact-match. So the Project Context documents **both** positions and explicitly does not resolve them; that unresolved conflict is what this Finding reports.

- **Actual Behavior:** A single shared message, `Required`, is rendered for every mandatory-field violation observed, matching PRD XC-17 and contradicting the twenty-odd distinct strings US-4222 specifies.

- **Steps to Reproduce:**
  1. Authenticate to `http://192.168.1.70` as an Admin-capable account.
  2. Navigate Admin → Agency → Agency, and open any agency's edit form via the pencil icon in its grid row (observed at `/admin/agency/edit/949`).
  3. Clear the `Agency *` field.
  4. Move focus out of the field (blur), without submitting.
  5. Observe the message rendered beneath the field.
  6. Repeat for `Post office box *`, `Contact person *`, and `Credit limit *`.

- **Investigation/Recovery Result:** Investigation & Recovery Engine — **`Validation failure` category: no retry, by specification** (§5.7: validation behaviour is deterministic, so retrying adds no information). The condition was instead corroborated by breadth rather than repetition: four independent fields across three different form sections (Agency Master, Agency Owner Details, Payment settings) all produced the identical message on first observation. Recovery was not applicable and none was attempted.

- **Investigation Notes:** Investigation Mode (§5.8) `Validation` boundary conditions were probed only to the extent that does not persist data: the **empty-value** condition was exercised on all four fields. The remaining listed boundary conditions — spaces-only, Unicode, emoji, long input, SQL-injection input-handling probe, special characters — were **deliberately skipped at this stage**, for two reasons stated rather than omitted: (a) each requires typing content and, to see the server's response rather than only client-side validation, submitting the form — which would mutate a live agency record on shared staging; and (b) exercising them is Stage 4M's job under a designed test case with a recorded pre-edit state, not Discovery's. Every field was restored to its original value in the browser immediately after the probe, and the page was navigated away from **without saving** — `Send For Approval`, `Approve`, and `Reject` were never clicked, so the run's Agency-mutation authorization was not drawn on. Optional-field behaviour was checked as a control: `Bank name` (optional per AC-6) rendered no message, so the `Required` message is genuinely tied to mandatory status and not shown indiscriminately.

- **Root Cause Hypothesis:** The story's per-field message column may be **specification boilerplate rather than an implemented requirement** — possibly copied from a template or from a sister story. Two independent details are consistent with that reading: the story's Expected Outcome section contains an unmistakable copy-paste artefact (`Cancel` is described as exiting *"the role update process"* in a story about agencies — recorded as Project Context ASM-011), and PRD XC-17 records the shared `Required` string as `[V]`, i.e. pinned by an existing automated assertion, which means the platform-wide behaviour predates this story. **Confidence in this hypothesis: 60%.** *Unknowns:* whether the per-field messages were ever specified for implementation and dropped, whether they are planned but unbuilt, or whether the story's column was never intended as literal copy. Resolving this needs the story's author or the product owner — it cannot be settled from the application.

- **Occurrence Count:** 4 *(one per field observed; a single underlying condition, not four Findings — §5.9)*

- **Evidence Links:**
  - `required_message_on_cleared_agency_name.png` — the `Agency *` field cleared, red border, `Required` rendered beneath it, in the context of the full Agency Master section
  - `before_clearing_mandatory_field.png` — the same form region before any field was cleared, for before/after comparison
  - `observed_messages.txt` — all four probes, each with the field's prior value and the exact string rendered, plus the two competing requirement statements
  - **Not captured:** console log for this Finding — the session produced **zero** console output (recorded in `../../evidence/session_console.log`), so there is nothing to attach rather than a capture failure. DOM snapshot deliberately not captured: it would be selector/DOM material, which `pipeline.md` §3.5 and `explorer-skill` §5.15 place outside this stage's scope, and the rendered message is fully evidenced by the screenshot.

- **Recommendation:** **Resolved — no longer blocking.** Under the 2026-07-31 directive and the §1.1 discriminator, outcome (b) below applies: `Required` is the platform standard, US-4222's message column is outdated specification, and Stage 3 encodes `Required` as the expected result for all ~20 negative cases. Two follow-ups remain, neither blocking: (i) have the story's author correct the message column so a future reader is not misled, and (ii) if per-field messages are genuinely wanted, raise them as a **separate enhancement** rather than as defects against this build.

  *Recorded for traceability — the three outcomes considered before the directive settled it:* (a) the story's messages are the real requirement and their absence is a product defect, giving ~20 reported failures; **(b) `Required` is the accepted platform standard, so the story is corrected — the option now taken**; (c) per-field messages are wanted but unbuilt, making them a separate enhancement. The evidence favoured (b) even before the directive, because PRD XC-17's `[V]` tag means the shared string was already pinned by a passing assertion and therefore predates this story.
