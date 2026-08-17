<!--
TEMPLATE — Finding metadata (Stage 2 — shared)
Renders to: platform_core_data/modules/{{MODULE_SLUG}}/discovery/findings/FINDING-{{ID}}_{{SHORT_NAME}}/metadata.md
Authority:  .claude/skills/explorer-skill/SKILL.md §5.14 (this exact field order), §5.12 (package layout)

Every field below is MANDATORY and appears in this order, except `Root Cause Hypothesis`, which is
omitted entirely when no hypothesis is warranted (never left blank).

metadata.md is always present in an evidence package, even when evidence capture was partial —
`Evidence Links` then names what could not be captured and why.
-->

# FINDING-{{ID}} — {{TITLE}}

- **Finding ID:** FINDING-{{ID}}
  <!-- Must match this evidence package's directory name. -->

- **Title:** {{TITLE}}
  <!-- Short, specific, human-scannable. e.g. "Emoji in Username field triggers generic server error" -->

- **Category:** {{CATEGORY}}
  <!-- Exactly ONE value from §5.3. Note: a Finding of Category `Recommendation` is a
       suggestion-shaped observation with no underlying defect — distinct from the
       `Recommendation` FIELD below, which every Finding of every Category carries. -->

- **Severity:** {{SEVERITY}}
  <!-- Critical / High / Medium / Low / N/A — assigned via the Severity Matrix (§5.4). -->

- **Severity Reason:** {{SEVERITY_REASON}}
  <!-- The Severity Matrix criterion matched — or, if defaulted to Low, the stated ambiguity. -->

- **Confidence Score:** {{CONFIDENCE_SCORE}}%
  <!-- 0–100, per the Confidence Model (§5.5, §18). -->

- **Evidence Category:** {{EVIDENCE_CATEGORY}}
  <!-- Exactly one of: Direct Observation / System Response / Documentation / Human Observation /
       Static Artifact / Assumption (§17) — or the STRONGEST where several corroborate.
       This states what KIND of evidence the Finding rests on, independent of which Discovery Mode
       produced it: classify by what the evidence actually is, not by the tool that produced it. -->

- **Status:** {{STATUS}}
  <!-- One value from §5.6. -->

- **Business Risk:** {{BUSINESS_RISK}}
  <!-- Impact in business/user terms. Stated even when Severity is N/A if there is a
       business-relevant angle worth naming; otherwise exactly "None identified". -->

- **Technical Risk:** {{TECHNICAL_RISK}}
  <!-- Impact in system/architecture/security terms. Same "None identified" fallback. -->

- **Module:** {{MODULE}}
  <!-- The in-scope module this Finding belongs to. -->

- **Workflow:** {{WORKFLOW}}
  <!-- The workflow / user journey the Finding was encountered within. -->

- **Description:** {{DESCRIPTION}}
  <!-- Plain-language statement of what was observed. -->

- **Expected Behavior:** {{EXPECTED_BEHAVIOR}}
  <!-- EXACTLY what the Project Context states — quoted, or closely paraphrased WITH a citation to
       the relevant Project Context section. If the Project Context is silent, write exactly
       "Not defined in Project Context". NEVER a behaviour this skill inferred on its own.
       Stage 3 depends on this citation to populate its Requirement/Discovery References. -->

- **Actual Behavior:** {{ACTUAL_BEHAVIOR}}
  <!-- Exactly what was observed, described factually. -->

- **Steps to Reproduce:** {{STEPS_TO_REPRODUCE}}
  <!-- The precise action sequence, FROM A KNOWN STARTING STATE, that produces the behaviour. -->

- **Investigation/Recovery Result:** {{INVESTIGATION_RECOVERY_RESULT}}
  <!-- Whether the Investigation & Recovery Engine (§5.7) applied, which recovery behaviour(s) were
       attempted, how many attempts were made, and the outcome:
       resolved on recovery / persisted after max attempts / not applicable (no category matched). -->

- **Investigation Notes:** {{INVESTIGATION_NOTES}}
  <!-- What boundary conditions / surrounding behaviours were probed per Investigation Mode (§5.8),
       what each probe revealed, and any probe or recovery step SKIPPED due to Environment
       Constraints — named, with the reason, never silently omitted.
       On a duplicate occurrence (§5.9), append a short note here describing when/where it recurred
       rather than creating a new Finding. -->

- **Root Cause Hypothesis:** {{ROOT_CAUSE_HYPOTHESIS}}
  <!-- OPTIONAL (§5.13) — include only when a hypothesis is warranted. Omit the whole bullet
       otherwise; never leave it blank or write "none". Always hedged, never asserted as fact. -->

- **Occurrence Count:** {{OCCURRENCE_COUNT}}
  <!-- How many times this exact underlying condition was encountered this run (§5.9). Starts at 1
       and is incremented on each duplicate rather than raising a second Finding. -->

- **Unclear Items:**
  <!-- REQUIRED whenever §5.11.1 applies — an Open Question, an ambiguous UI observation, a control
       whose purpose could not be determined, unclear wording/validation/status/icon/column/section
       behaviour, a product-owner decision needed about a visual element, or a mismatch that could
       not yet be classified. OMIT THIS WHOLE BULLET otherwise; never leave an empty table.

       One row per rectangle in the annotated screenshot, and every rectangle appears exactly once.
       A rectangle with no row, or a row with no rectangle, is an incomplete Finding.

       "Why the answer matters" is not padding — it is what tells the reviewer whether this blocks
       Stage 3 or can wait. A row that cannot state an impact is usually an Observation, not an
       Open Question.

       Under §5.11.3 (no live page — supplied screenshot, recording, document, static artifact) the
       Annotated cell carries the verbatim string
         Annotated evidence not capturable — Discovery Mode: <mode>
       and "What exactly is unclear" describes the location as precisely as the evidence allows
       (section heading, row and column, field label, neighbouring text). EVERY OTHER COLUMN STAYS
       MANDATORY. Never fabricate or estimate a rectangle, and never use this route when a live
       browser page was available. -->

  | Rect | What was observed | What exactly is unclear | The question | Why the answer matters | Original | Annotated |
  |---|---|---|---|---|---|---|
  | {{RECT_LABEL}} | {{OBSERVED}} | {{UNCLEAR}} | {{QUESTION}} | {{WHY_IT_MATTERS}} | `{{ORIGINAL_PATH}}` | `{{ANNOTATED_PATH}}` |

- **Evidence Links:** {{EVIDENCE_LINKS}}
  <!-- Every evidence file in this package (§5.12), AND a note on any item that could not be
       captured, with the reason. Never overwrite an existing evidence file.
       An annotated copy is listed ALONGSIDE the original it was taken from, never instead of it —
       a reviewer disputing the annotation needs the unmarked image to check it against. -->

- **Recommendation:** {{RECOMMENDATION}}
  <!-- A suggested next step for the human reviewer (e.g. "confirm with Product Owner whether X is
       intended", "reproduce in staging", "no action needed if intentional").
       A suggestion, NEVER a directive, and never a claim that the Finding is definitely a defect.
       Present on every Finding regardless of Category. -->
