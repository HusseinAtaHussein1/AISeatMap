<!--
TEMPLATE — Manual Test Suite, per module (Stage 3 — shared, divergence point)
Renders to: platform_core_data/runs/{{RUN_FOLDER}}/test_design/TestCases_{{MODULE}}.md
Authority:  .claude/skills/test-design-skill/SKILL.md §9 Outputs #1–#2, §6 (Test Case Schema),
            §9.1 (Excel Rendering), §12

Each test case block follows `TestCase_entry.md` in this folder — that file is the authoritative
per-case field list. Do not restate or extend the field list here.

THIS MARKDOWN FILE IS THE AUTHORED ARTIFACT. THE .xlsx IS GENERATED FROM IT — NEVER WRITTEN BY HAND:

    node platform_core/tools/test_suite_export/cli.js

§9 requires the Markdown and Excel suites to be "two renderings of one test case set — they must
never diverge in content." Deriving the workbook from this file is what actually GUARANTEES that;
authoring both by hand makes it a matter of discipline, and when they drift, Stage 4M silently
executes against whichever one the tester happened to open. Nothing downstream can detect that.

So: edit THIS file, then re-run the export. Never hand-edit a generated .xlsx — the next export
discards the edit silently. The column contract the exporter produces is in
`platform_core/tools/test_suite_export/README.md`; it is §6.1's field list, in §6.1's order.

Only the platform's own canonical artifacts are produced. No output is shaped around, named after, or
structured to match any external ALM, issue-tracking, or test-management system.
-->

<!-- One file per artifact, edited in place — no `.vN` copies. Git is the version history
     (templates/README.md §6, pipeline.md §7). A superseded TestCases_{{MODULE}}.vN.md left beside
     this file is skipped by the exporter rather than rendered into a shadow workbook Stage 4M could
     execute by accident. -->

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
