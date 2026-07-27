<!--
TEMPLATE — Manual Execution Results (Stage 4 of 7)
Renders to: platform_core_data/runs/{{RUN_FOLDER}}/manual_execution/ManualExecutionResults.md
Authority:  .claude/skills/manual-execution-skill/SKILL.md §10 (Standard Output Contract — the
            Results-side sections #1, #3, #4), §8 (Result Classification), §10.1, §13

This artifact carries the RAW, per-test record. The narrative, candidate list, limitations, and
recommendations live in its sibling ManualExecutionSummary.md — the two together satisfy the full
Standard Output Contract.

Every `Failed` / `Inconclusive` case is documented IN FULL per Defect_entry.md in this folder — never
a one-line summary.
-->

# Manual Execution Results — {{RUN_FOLDER}}

## 1. Execution Metadata

<!-- §10 #1 -->

| Field | Value |
|---|---|
| Execution ID | {{EXECUTION_ID}} |
| Run Folder | `{{RUN_FOLDER}}` |
| Run Scope Type / Run Type | {{RUN_SCOPE_TYPE}} / {{RUN_TYPE}} <!-- §17 --> |
| Environment | {{ENVIRONMENT}} |
| Target URL | {{APP_URL}} |
| Role(s) used | {{ROLES}} <!-- role names only — never a credential value --> |
| Started | {{START_TIMESTAMP}} |
| Ended | {{END_TIMESTAMP}} |
| Test Suites executed | {{SUITE_FILES}} |

## 2. Result Totals

<!-- The mechanical count behind the Summary's narrative. Every classification from §8 gets its own
     line — a non-Passed result is never folded into another bucket. -->

| Status | Count |
|---|---|
| Passed | {{PASSED_COUNT}} |
| Failed | {{FAILED_COUNT}} |
| Blocked | {{BLOCKED_COUNT}} |
| Skipped | {{SKIPPED_COUNT}} |
| Not Executed | {{NOT_EXECUTED_COUNT}} |
| Inconclusive | {{INCONCLUSIVE_COUNT}} |
| **Total in scope** | {{TOTAL_COUNT}} |

## 3. Per-Test Results

<!-- §10 #3 — one row per executed test case. Exactly one Status per case (§8):
       Passed        — executed, Expected Result observed exactly as stated
       Failed        — executed, observed result did not match — a genuine, reproducible discrepancy
       Blocked       — a stated Precondition could not be established (distinct from Skipped/Failed)
       Skipped       — deliberately not executed (e.g. mutating action unauthorized for this env)
       Not Executed  — in scope, but the run ended before reaching it
       Inconclusive  — executed but cannot be confidently classified Passed or Failed; reported as
                       such, NEVER forced into Passed or Failed

     EVERY non-Passed result carries its reason here — never left unstated. -->

| Test Case ID | Module | Status | Execution Time | Reason (non-Passed) | Evidence Refs |
|---|---|---|---|---|---|
| {{TEST_CASE_ID}} | {{MODULE}} | {{STATUS}} | {{EXECUTION_TIME}} | {{REASON}} | {{EVIDENCE_REFS}} |

### 3.1 Defect Detail — Failed / Inconclusive cases

<!-- One full block per Failed/Inconclusive case, rendered per Defect_entry.md (§10.1).
     Omit this subsection entirely only when there are zero Failed/Inconclusive results. -->

{{DEFECT_ENTRY_BLOCKS}}

## 4. Evidence Inventory

<!-- §10 #4 — every evidence type captured (§7), PER TEST CASE, with paths, and EVERY GAP WITH A
     REASON. A missing evidence item is named with its reason, never silently omitted. -->

| Test Case ID | Evidence Type | Path | Captured? | Gap Reason |
|---|---|---|---|---|
| {{TEST_CASE_ID}} | {{EVIDENCE_TYPE}} | `manual_execution/artifacts/{{FILE}}` | {{CAPTURED}} | {{GAP_REASON}} |

**Evidence root:** `platform_core_data/runs/{{RUN_FOLDER}}/manual_execution/artifacts/`
