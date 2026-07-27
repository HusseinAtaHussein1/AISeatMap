<!--
TEMPLATE — Manual Test Suite, per module (Stage 3 of 7)
Renders to: platform_core_data/runs/{{RUN_FOLDER}}/test_design/TestCases_{{MODULE}}.md
Also renders to the identical .xlsx: TestCases_{{MODULE}}.xlsx
Authority:  .claude/skills/test-design-skill/SKILL.md §9 Outputs #1–#2, §6 (Test Case Schema), §12

Each test case block follows `TestCase_entry.md` in this folder — that file is the authoritative
per-case field list. Do not restate or extend the field list here.

MARKDOWN AND EXCEL ARE TWO RENDERINGS OF ONE TEST CASE SET — they must never diverge in content.
A field added, corrected, or removed in one is added, corrected, or removed in the other IN THE SAME
PASS.

Only the platform's own canonical artifacts are produced. No output is shaped around, named after, or
structured to match any external ALM, issue-tracking, or test-management system.
-->

# Manual Test Suite — {{MODULE}}

| Field | Value |
|---|---|
| Run Folder | `{{RUN_FOLDER}}` |
| Module | {{MODULE}} |
| Run Scope Type / Run Type | {{RUN_SCOPE_TYPE}} / {{RUN_TYPE}} |
| Project Context | `runs/{{RUN_FOLDER}}/context/ProjectContext.md` |
| Total Test Cases | {{TOTAL_CASES}} |
| Generated | {{TIMESTAMP}} |
| Status | {{STATUS}} <!-- Pending Review / Approved --> |

## Case Index

<!-- At-a-glance index for this module. Traceability (Requirement Reference, Risk, Discovery
     Reference) is deliberately NOT here — it lives in TraceabilityMatrix.md keyed by Test Case ID,
     keeping this execution-facing document lean (§6, §6.2). -->

| Test Case ID | Title | Tier | Priority | Tags |
|---|---|---|---|---|
| {{TEST_CASE_ID}} | {{TITLE}} | {{TIER}} <!-- Atomic / Scenario / E2E --> | {{PRIORITY}} | {{TAGS}} |

**Tier breakdown:** {{ATOMIC_COUNT}} Atomic · {{SCENARIO_COUNT}} Scenario · {{E2E_COUNT}} E2E

## Test Cases

<!-- One block per case, rendered per TestCase_entry.md. Repeat for every case in the index above —
     the index and the case blocks must always agree in count and IDs. -->

{{TEST_CASE_BLOCKS}}
