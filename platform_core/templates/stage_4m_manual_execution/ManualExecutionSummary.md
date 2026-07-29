<!--
TEMPLATE — Manual Execution Summary (Stage 4M — Manual branch, terminal)
Renders to: platform_core_data/runs/{{RUN_FOLDER}}/manual_execution/ManualExecutionSummary.md
Authority:  .claude/skills/manual-execution-skill/SKILL.md §10 (Standard Output Contract — the
            Summary-side sections #2, #5, #6, #7, #8), §13

The narrative/handoff half of the Standard Output Contract. The raw per-test record lives in its
sibling ManualExecutionResults.md; the two together satisfy the full contract. Do not restate
per-test detail here.
-->

# Manual Execution Summary — {{RUN_FOLDER}}

| Field | Value |
|---|---|
| Execution ID | {{EXECUTION_ID}} |
| Run Folder | `{{RUN_FOLDER}}` |
| Results artifact | `manual_execution/ManualExecutionResults.md` |
| Generated | {{TIMESTAMP}} |
| Status | {{STATUS}} <!-- Pending Review / Approved --> |

## 2. Execution Summary

<!-- §10 #2 — ONE PARAGRAPH narrative covering: what was executed, the overall outcome, the headline
     pass/fail/blocked figures, AND the count/reason of every test case EXCLUDED from the Automation
     Candidate Package. The exclusion accounting is mandatory here — it is what lets a reviewer see
     why the candidate set is narrower than the full suite. -->

{{EXECUTION_SUMMARY_NARRATIVE}}

**Headline figures:** {{PASSED_COUNT}} Passed · {{FAILED_COUNT}} Failed · {{BLOCKED_COUNT}} Blocked · {{SKIPPED_COUNT}} Skipped · {{NOT_EXECUTED_COUNT}} Not Executed · {{INCONCLUSIVE_COUNT}} Inconclusive

## 5. Delivery Artifacts

<!-- §10 #5 / §9 — this stage is TERMINAL (pipeline.md §3.3): it self-reports rather than
     handing off. Confirm all three renderings exist and AGREE on every test case's status.

     The Automation Candidate Package and its qualifying-criteria engine were REMOVED from the
     platform in this revision: Stage 4A now takes its scope directly from the approved Stage 3
     test cases and grounds correctness in its own live selector verification. This stage
     produces no candidate list, and no Automation-branch artifact of any kind. -->

| Artifact | Path | Present? |
|---|---|---|
| Manual Execution Results (authoritative) | `manual_execution/ManualExecutionResults.md` | {{CHK_RESULTS}} |
| Manual Test Results CSV | `manual_execution/ManualTestResults.csv` | {{CHK_CSV}} |
| Manual QA Report (stakeholder deliverable) | `manual_execution/ManualQAReport.md` | {{CHK_REPORT}} |
| Evidence | `manual_execution/artifacts/` | {{CHK_EVIDENCE}} |

**All three renderings agree on every status:** {{CHK_AGREEMENT}}

<!-- The row above is the one that actually fails in practice. A status corrected in the Results
     without regenerating the CSV produces a delivery that contradicts itself — and the
     contradiction is normally found by the stakeholder, not the reviewer. -->

**Scripts produced:** none. <!-- §2.1 — this stage never produces a script of any kind. A throwaway
     driver script used to reach a screen is debug scaffolding, deleted after use (pipeline.md §11). -->
## 6. Known Limitations

<!-- §10 #6 — anything this execution could not fully verify (e.g. a Blocked precondition, a Skipped
     mutating action) AND WHY. A limitation is always stated as a limitation, never left implicit in a
     pass count. -->

| Limitation | Affected Test Case(s) | Why |
|---|---|---|
| {{LIMITATION}} | {{TEST_CASE_IDS}} | {{REASON}} |

## 7. Recommendations

<!-- §10 #7 — the corrective actions recommended per §19 for any blocked/failed item. Suggestions
     requiring follow-up, never a claim that a fix has been applied. -->

| ID | Recommendation | Applies To | Rationale |
|---|---|---|---|
| {{REC_ID}} | {{RECOMMENDATION}} | {{APPLIES_TO}} | {{RATIONALE}} |

## 8. Inputs for Automation skill

<!-- §10 #8 — the explicit handoff package (§20): confirmation that every input
     .claude/skills/automation-skill/SKILL.md §4 declares it needs FROM THIS STAGE is present. -->

| Required Input (Automation §4) | Present? | Location / Note |
|---|---|---|
| {{REQUIRED_INPUT}} | {{PRESENT}} | {{LOCATION}} |

**Handoff confirmation:** {{HANDOFF_CONFIRMATION}}
