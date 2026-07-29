<!--
TEMPLATE — Findings Summary (Stage 2 — shared)
Renders to: platform_core_data/runs/{{RUN_FOLDER}}/discovery/findings/Findings_Summary.md
Authority:  .claude/skills/explorer-skill/SKILL.md §9 Outputs #5, §5.9 (Duplicate Detection)

A single INDEX of every finalized Finding — so a reviewer can triage the full set without opening
every evidence package. Full detail stays in each Finding's own metadata.md.

This is also the index searched during Duplicate Detection (§5.9) BEFORE creating each new Finding:
an equivalent existing Finding gets its Occurrence Count incremented instead of a new row here.
-->

# Findings Summary — {{RUN_FOLDER}}

| Field | Value |
|---|---|
| Run Folder | `{{RUN_FOLDER}}` |
| Total Findings | {{TOTAL_FINDINGS}} |
| Generated | {{TIMESTAMP}} |

## Index

<!-- One row per finalized Finding. Columns are fixed (§9 Outputs #5). The one-line description is a
     triage aid, not a substitute for metadata.md's Description field. -->

| ID | Title | Category | Severity | Confidence | Status | Occurrences | Module | Description (one line) |
|---|---|---|---|---|---|---|---|---|
| FINDING-{{ID}} | {{TITLE}} | {{CATEGORY}} | {{SEVERITY}} | {{CONFIDENCE}}% | {{STATUS}} | {{OCCURRENCE_COUNT}} | {{MODULE}} | {{ONE_LINE_DESCRIPTION}} |

## Breakdown

<!-- Counts only — a triage overview. Do not restate Finding content here. -->

**By Severity:** {{CRITICAL_COUNT}} Critical · {{HIGH_COUNT}} High · {{MEDIUM_COUNT}} Medium · {{LOW_COUNT}} Low · {{NA_COUNT}} N/A

**By Category:** {{CATEGORY_BREAKDOWN}}

**By Status:** {{STATUS_BREAKDOWN}}

**By Module:** {{MODULE_BREAKDOWN}}

## Evidence Packages

<!-- One row per Finding, pointing at its self-contained package folder (§5.12). Every package
     contains metadata.md plus the evidence actually captured for that Finding. -->

| Finding ID | Evidence Package | Evidence Files |
|---|---|---|
| FINDING-{{ID}} | `findings/FINDING-{{ID}}_{{SHORT_NAME}}/` | {{EVIDENCE_FILE_COUNT}} |
