<!--
TEMPLATE — Automation Candidate Package (Stage 4 of 7)
Renders to: platform_core_data/runs/{{RUN_FOLDER}}/manual_execution/AutomationCandidatePackage.md
Authority:  .claude/skills/manual-execution-skill/SKILL.md §9.3 (package contents), §9.1 (qualifying
            criteria), §9.2, §13

Lists, for every QUALIFYING test case: its Test Case ID, its References carried UNMODIFIED from the
Traceability Matrix, the Manual Execution Result(s) that confirmed it, and the Manual Test Suite
file/module it lives in — enough for the Automation skill to LOCATE the full test case content
WITHOUT this stage duplicating it.

A test case that does not qualify is NEVER included here. Its exclusion reason is recorded in
ManualExecutionSummary.md §2 so a reviewer can see why the candidate set is narrower than the suite.

This package is evidence-based on actual execution outcomes — it is never a copy of Test Design's
advisory Automation Candidates hint (§9.2).
-->

# Automation Candidate Package — {{RUN_FOLDER}}

| Field | Value |
|---|---|
| Execution ID | {{EXECUTION_ID}} |
| Run Folder | `{{RUN_FOLDER}}` |
| Qualifying candidates | {{CANDIDATE_COUNT}} |
| Executed cases considered | {{TOTAL_COUNT}} |
| Excluded (reasons in Summary §2) | {{EXCLUDED_COUNT}} |
| Generated | {{TIMESTAMP}} |

## 1. Candidates

<!-- One row per qualifying case. References are carried UNMODIFIED from
     runs/{{RUN_FOLDER}}/test_design/TraceabilityMatrix.md — never re-derived or re-worded here.
     `Confirming Result` points at the Per-Test Results row(s) in ManualExecutionResults.md §3 that
     establish the Passed outcome this qualification rests on. -->

| Test Case ID | Module | Suite File | Requirement Ref | Discovery Ref | Finding Ref | Evidence Ref | Confirming Result | Execution Time |
|---|---|---|---|---|---|---|---|---|
| {{TEST_CASE_ID}} | {{MODULE}} | `test_design/TestCases_{{MODULE}}.md` | {{REQUIREMENT_REF}} | {{DISCOVERY_REF}} | {{FINDING_REF}} | {{EVIDENCE_REF}} | {{CONFIRMING_RESULT}} | {{EXECUTION_TIME}} |

## 2. Qualification Basis

<!-- Per candidate, how each of §9.1's four criteria was satisfied. This is what makes the package
     auditable rather than a bare list. -->

| Test Case ID | Passed this run | Deterministic & assertable | Repeat executions agreed | Not an Exploratory disposition |
|---|---|---|---|---|
| {{TEST_CASE_ID}} | {{C1}} | {{C2}} | {{C3}} | {{C4}} |

## 3. Advisory Hint Reconciliation

<!-- OPTIONAL but recommended — where this evidence-based package DIVERGES from Test Design's
     pre-execution advisory hint (test-design §18 #11), and why. Divergence is expected and correct;
     recording it stops a reviewer from reading the difference as an error. -->

| Test Case ID | Test Design hint | This package | Why |
|---|---|---|---|
| {{TEST_CASE_ID}} | {{HINT}} | {{ACTUAL}} | {{REASON}} |

## 4. Notes for the Automation skill

<!-- Anything the Automation skill should know before making its BINDING Automation Decision
     (Reuse / Generate / Partially Automatable / Manual Only — automation-skill §13).
     This stage NEVER pre-empts that decision: notes are input to it, not a substitute for it. -->

| Test Case ID | Note |
|---|---|
| {{TEST_CASE_ID}} | {{NOTE}} |
