<!--
TEMPLATE — Automation Package Registry (Stage 4A — Automation branch)
Renders to: platform_core_data/automation_baseline/AutomationPackages.md
Authority:  .claude/skills/automation-skill/SKILL.md §19 (Artifacts — the registry row), §31.1;
            workflows_and_pipelines/pipeline/pipeline.md §12.7

The ONE PROJECT-LEVEL (not per-package, not per-run) index of every Automation Package that exists.

Read at the START of every run (§31.1) and updated at the END of every run that adds or continues a
package. It is DURABLE — it lives in automation_baseline/, not in a run folder, because it describes
the project rather than a run.

v8 CARDINALITY RULE: a project holds EXACTLY ONE authoritative Automation Package PER FRAMEWORK.
Different frameworks may coexist (e.g. one SHAFT project and one Playwright project), but never two
competing packages within one framework.
-->

# Automation Package Registry

| Field | Value |
|---|---|
| Baseline root | `platform_core_data/automation_baseline/` |
| Packages registered | {{PACKAGE_COUNT}} |
| Last updated | {{TIMESTAMP}} |
| Last updated by run | `{{RUN_FOLDER}}` |

## 1. Packages

<!-- One row PER FRAMEWORK — never two rows for the same framework (v8).

     Baseline Ref (pipeline.md §12.7) — the Workspace Automation Baseline's PATH-SCOPED git commit
     hash as of the last successful Workspace Merge. This is what lets a later run tell whether the
     baseline moved underneath it.

     Last Merged Run — which run's automation was most recently merged in. -->

| Framework | Location | Language | Suites | Test Cases | Baseline Ref | Last Merged Run | Last Touched By Run/Checkpoint |
|---|---|---|---|---|---|---|---|
| {{FRAMEWORK}} | `automation_baseline/{{FRAMEWORK_LOWER}}/tests_{{FRAMEWORK}}/` | {{LANGUAGE}} | {{SUITE_COUNT}} | {{CASE_COUNT}} | {{BASELINE_REF}} | `{{LAST_MERGED_RUN}}` | {{LAST_TOUCHED}} |

## 2. Package Detail

### {{FRAMEWORK}}

| Field | Value |
|---|---|
| Location | `platform_core_data/automation_baseline/{{FRAMEWORK_LOWER}}/tests_{{FRAMEWORK}}/` |
| Summary artifact | `automation_baseline/{{FRAMEWORK_LOWER}}/AutomationSummary_{{FRAMEWORK}}.md` |
| Created by run | `{{CREATED_BY_RUN}}` |
| Baseline Ref | {{BASELINE_REF}} |
| Last Merged Run | `{{LAST_MERGED_RUN}}` |
| Status | {{STATUS}} |

**Suites:**

| Suite | Business Workflow | Test Cases |
|---|---|---|
| {{SUITE}} | {{WORKFLOW}} | {{CASE_COUNT}} |

<!-- Repeat the block above for every registered framework. -->

## 3. Merge History

<!-- Append-only: one row per successful Workspace Merge (pipeline.md §12.4), which only ever runs
     AFTER Automation Approval. Rewriting or pruning history here defeats the point of the Baseline
     Ref — a run needs to be able to see what happened before it. -->

| Date | Framework | Run Folder | Baseline Ref (after merge) | Files Added | Files Modified |
|---|---|---|---|---|---|
| {{DATE}} | {{FRAMEWORK}} | `{{RUN_FOLDER}}` | {{BASELINE_REF}} | {{FILES_ADDED}} | {{FILES_MODIFIED}} |

## 4. Human Decisions On Repository Structure

<!-- §31.6 — repository-structure decisions (extend the existing project / start a project for a
     framework with none yet / reset a framework's project from scratch) are GATHER, ANALYZE,
     RECOMMEND, THEN WAIT FOR EXPLICIT HUMAN APPROVAL. Never a default, never resolved silently.

     Recorded here so a later run can see what was decided and by whom, rather than re-deriving it.
     This section exists because a real consolidation surfaced a test-class redesign that had silently
     dropped a business-rule-backed assertion — exactly the class of decision that must reach a human. -->

| Date | Decision | Framework | Rationale | Approved By |
|---|---|---|---|---|
| {{DATE}} | {{DECISION}} <!-- extend existing / start new framework project / reset from scratch (rare, explicit) --> | {{FRAMEWORK}} | {{RATIONALE}} | {{APPROVED_BY}} |
