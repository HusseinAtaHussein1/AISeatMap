<!--
TEMPLATE — Manual Execution Summary (Stage 4 of 7)
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

**Automation Candidate exclusions:** {{EXCLUDED_COUNT}} of {{TOTAL_COUNT}} executed cases excluded.

| Test Case ID | Exclusion Reason (§9.1 criterion not met) |
|---|---|
| {{TEST_CASE_ID}} | {{EXCLUSION_REASON}} |

## 5. Automation Candidates

<!-- §10 #5 — the qualifying criteria APPLIED (§9.1) and the resulting list, cross-referenced to the
     standalone AutomationCandidatePackage.md.

     Inclusion is ALWAYS evidence-based on an actual execution outcome (§9.2) — never inherited from
     Test Design's pre-execution advisory hint, which is only a prioritization signal for execution
     order. -->

**Criteria applied (all four must hold, §9.1):**

| # | Criterion | How it was applied this run |
|---|---|---|
| 1 | Status this run is `Passed` | {{CRITERION_1_APPLICATION}} |
| 2 | Steps and Expected Result are deterministic and objectively verifiable | {{CRITERION_2_APPLICATION}} |
| 3 | Repeat executions within this run all agreed on the outcome | {{CRITERION_3_APPLICATION}} |
| 4 | Not dispositioned by Test Design as an Exploratory test against a Finding | {{CRITERION_4_APPLICATION}} |

**Qualifying candidates:** {{CANDIDATE_COUNT}} — full package: `manual_execution/AutomationCandidatePackage.md`

| Test Case ID | Module |
|---|---|
| {{TEST_CASE_ID}} | {{MODULE}} |

**Manual-Only characteristics noted for the Automation skill's awareness (§9.1 #2):**

| Test Case ID | Why subjective / not assertable |
|---|---|
| {{TEST_CASE_ID}} | {{REASON}} |

**Not Stable exclusions (§9.1 #3) — both outcomes cited:**

| Test Case ID | Outcome 1 | Outcome 2 |
|---|---|---|
| {{TEST_CASE_ID}} | {{OUTCOME_1}} | {{OUTCOME_2}} |

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
