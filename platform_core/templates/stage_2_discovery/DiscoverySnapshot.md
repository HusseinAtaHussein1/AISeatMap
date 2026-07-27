<!--
TEMPLATE — Discovery Snapshot (Stage 2 of 7)
Renders to: platform_core_data/runs/{{RUN_FOLDER}}/discovery/{{SCREEN_OR_STATE}}.md
Authority:  .claude/skills/explorer-skill/SKILL.md §9 Outputs #1, §12 Artifacts

ONE FILE PER DISTINCT SCREEN/STATE explored, scoped to exactly the modules the Project Context marked
"In Scope". A raw STRUCTURAL snapshot — what is actually there — not an assessment.

Judgments, severity, and conclusions do not belong here: they live in Findings. This artifact records
observable structure so a later stage can locate elements without re-exploring.

Every snapshot states its Discovery Mode (§8.3). Items that could not be captured under the selected
mode (e.g. no console log obtainable from a static screenshot) are NAMED AS MISSING with the reason
(§5.10) — never silently omitted, never fabricated.
-->

# Discovery Snapshot — {{SCREEN_NAME}}

| Field | Value |
|---|---|
| Run Folder | `{{RUN_FOLDER}}` |
| Screen / State | {{SCREEN_NAME}} |
| Module | {{MODULE}} |
| URL / Route | {{URL}} |
| Discovery Mode | {{DISCOVERY_MODE}} <!-- §8.1 --> |
| Evidence Category | {{EVIDENCE_CATEGORY}} <!-- §17 --> |
| Captured | {{TIMESTAMP}} |
| Role / Credential used | {{ROLE}} <!-- role name only — NEVER a credential value --> |

## 1. Purpose

<!-- What this screen/state is for, in one or two factual sentences. -->

{{PURPOSE}}

## 2. Entry Points

<!-- How this screen is reached: navigation path, direct URL, or the action in another screen that
     leads here. -->

| From | Action | Result |
|---|---|---|
| {{FROM_SCREEN}} | {{ACTION}} | {{RESULT}} |

## 3. Structure

<!-- The observable layout: regions, forms, tables, and the reusable components present. Reusable
     components are ALSO recorded once in Coverage_Summary.md §3. -->

| Region / Section | Type | Notes |
|---|---|---|
| {{REGION}} | {{TYPE}} | {{NOTES}} |

## 4. Interactive Elements

<!-- Every element a test could act on. Locator is what a later stage needs to find the element —
     record the most stable one observed (accessible name/role/label before a brittle CSS path).
     Stage 5 consumes these; a fallback locator must be flagged as such. -->

| Element | Type | Label / Accessible Name | Locator | Required? | Notes |
|---|---|---|---|---|---|
| {{ELEMENT}} | {{TYPE}} | {{LABEL}} | {{LOCATOR}} | {{REQUIRED}} | {{NOTES}} |

## 5. Observed Validation & Business Rules

<!-- Validation behaviour ACTUALLY WITNESSED on this screen, stated factually. Rules inferred but
     not observed belong in the QA Assessment Report §7 Assumptions, not here. -->

| Field / Action | Observed Behaviour | Trigger | Finding ID (if raised) |
|---|---|---|---|
| {{FIELD}} | {{BEHAVIOUR}} | {{TRIGGER}} | {{FINDING_ID}} |

## 6. States Observed

<!-- Distinct states of this screen seen during the run: empty, populated, loading, error, permission-
     denied, etc. A materially different state warrants its own snapshot file. -->

| State | How Reached | What Differs |
|---|---|---|
| {{STATE}} | {{HOW_REACHED}} | {{DIFFERENCE}} |

## 7. System Responses

<!-- Network/console observations captured for this screen: request/response status, console errors,
     redirects. OMIT this section entirely if the Discovery Mode could not produce any — and record
     that in §9 rather than leaving an empty table. -->

| Type | Observation |
|---|---|
| {{TYPE}} <!-- Network / Console / Redirect --> | {{OBSERVATION}} |

## 8. Evidence Captured

| Evidence | Path |
|---|---|
| {{EVIDENCE_TYPE}} | `{{EVIDENCE_PATH}}` |

## 9. Not Captured

<!-- Every item this snapshot would normally carry but could not, WITH THE REASON — per §5.10.
     Omit this section only when nothing was missing. An empty section is never a substitute for
     naming a gap. -->

| Missing Item | Reason |
|---|---|
| {{MISSING_ITEM}} | {{REASON}} |

## 10. Findings Raised From This Screen

| Finding ID | Category | Severity |
|---|---|---|
| FINDING-{{ID}} | {{CATEGORY}} | {{SEVERITY}} |
