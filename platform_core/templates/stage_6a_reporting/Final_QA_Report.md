<!--
TEMPLATE — Final QA Report (Stage 6A — Automation branch, terminal)
Renders to: platform_core_data/runs/{{RUN_FOLDER}}/reporting/Final_QA_Report.md
Authority:  .claude/skills/reporting-skill/SKILL.md §8 (these 8 sections, this order), §3
            (Responsibilities — the two distinct coverage measures), §7 (Execution Rules), §12

The STAKEHOLDER-FACING synthesis of the whole run. Its consumer is a human, not another skill.

HARD RULES (§7):
  1. Every statistic and outcome comes STRICTLY from ExecutionResults.md — no invented, estimated, or
     "typical" results.
  2. Designed-but-not-automated and automated-but-not-executed are REPORTED EXPLICITLY — gaps are
     visible, never silently dropped.
  3. Every assumption-based test flag is resolved: confirmed / refuted / still unverified.
  4. Requirement Coverage and Automation Coverage are TWO SEPARATE, CLEARLY LABELLED figures — never
     conflate "we tested it" with "we automated it".
  5. Never recommend a specific code fix AS IF ALREADY APPLIED — findings need developer investigation.
  6. Never re-run a test or modify an upstream artifact.
  7. Defects grouped by module, severity based ONLY on evidence present in the Execution Results.

DEGRADED RUNS (§12): a gap is ALWAYS reported as a gap, NEVER as a favourable result. An absent input
must never render as 0 defects, 100% pass, or full coverage. Mark outcome-dependent sections
`Not Executed — Requires Stage 5A` instead.
-->

# Final QA Report — {{RUN_FOLDER}}

| Field | Value |
|---|---|
| Run Folder | `{{RUN_FOLDER}}` |
| Environment | {{ENVIRONMENT}} |
| Report generated | {{TIMESTAMP}} |
| **Basis** | {{INPUTS_PRESENT}} |
| **Declared gaps** | {{INPUTS_ABSENT}} |

<!-- Basis / Declared gaps are mandatory even on a complete run — they are what let a stakeholder
     judge how much the report's figures can carry. -->

## 1. Executive Summary

<!-- §8 #1 — overall run health for a stakeholder audience. Grounded entirely in the Execution
     Results; no estimate, no projection, no "typical" figure. -->

{{EXECUTIVE_SUMMARY}}

## 2. Detailed Execution Report

<!-- §8 #2 — per-test outcomes, referencing Test Case ID, Automation Script ID, Execution Time, and
     Screenshots/Logs FROM the Execution Results. This stage does not re-run or re-interpret; it
     reports what the artifact says. -->

| Test Case ID | Automation Script ID | Module | Status | Execution Time | Evidence |
|---|---|---|---|---|---|
| {{TEST_CASE_ID}} | {{SCRIPT_ID}} | {{MODULE}} | {{STATUS}} | {{EXECUTION_TIME}} | {{EVIDENCE_REFS}} |

## 3. Passed / Failed Statistics

<!-- §8 #3 — totals AND a by-module breakdown: passed / failed / skipped / not automated. -->

**Totals:**

| Status | Count |
|---|---|
| Passed | {{PASSED_COUNT}} |
| Failed | {{FAILED_COUNT}} |
| Skipped | {{SKIPPED_COUNT}} |
| Not Automated | {{NOT_AUTOMATED_COUNT}} |
| Not Executed | {{NOT_EXECUTED_COUNT}} |
| **Total designed** | {{TOTAL_DESIGNED}} |

**By module:**

| Module | Passed | Failed | Skipped | Not Automated | Not Executed |
|---|---|---|---|---|---|
| {{MODULE}} | {{PASSED}} | {{FAILED}} | {{SKIPPED}} | {{NOT_AUTOMATED}} | {{NOT_EXECUTED}} |

<!-- Where the Execution Results separated Application / Automation / Environment health (§25.2
     there), preserve that separation rather than re-merging it into one "Failed" figure — a merged
     count would tell a stakeholder the application is broken when the environment was. -->

**Health split (carried from Execution Results §6):**

| Health Figure | Value |
|---|---|
| Application Health | {{APP_HEALTH}} |
| Automation Health | {{AUTOMATION_HEALTH}} |
| Environment Health | {{ENV_HEALTH}} |
| Inconclusive / Flaky | {{INCONCLUSIVE_FLAKY}} |

## 4. Defect Summary

<!-- §8 #4 — grouped BY MODULE, with severity assigned based ONLY on the failure evidence present in
     the Execution Results (§7 rule 7). No severity inferred from intuition about business impact
     that the evidence does not support. -->

### {{MODULE}}

| Test Case ID | Defect | Severity | Evidence | Classification (from Execution Results) |
|---|---|---|---|---|
| {{TEST_CASE_ID}} | {{DEFECT_SUMMARY}} | {{SEVERITY}} | {{EVIDENCE_REFS}} | {{CLASSIFICATION}} |

<!-- Repeat per module with any defects. A module with none is stated as such rather than omitted, so
     a reader can tell "no defects found" from "not covered". -->

**Modules with no defects recorded:** {{CLEAN_MODULES}}

## 5. Requirement Coverage

<!-- §8 #5 / §3 — what fraction of PROJECT CONTEXT REQUIREMENTS have at least one traced, EXECUTED
     test case. This is the first of the two distinct measures; it must never be conflated with §6.
     Basis stated with the figure. -->

**{{REQUIREMENT_COVERAGE_PERCENT}}%** — basis: {{REQUIREMENT_COVERAGE_BASIS}}
<!-- e.g. "47 of 52 traced Project Context requirements have an executed test" -->

| Requirement ID | Traced Test Case(s) | Executed? | Outcome |
|---|---|---|---|
| {{REQUIREMENT_ID}} | {{TEST_CASE_IDS}} | {{EXECUTED}} | {{OUTCOME}} |

**Requirements with no executed test:**

| Requirement ID | Why not executed |
|---|---|
| {{REQUIREMENT_ID}} | {{REASON}} |

## 6. Automation Coverage

<!-- §8 #6 / §3 — what fraction of DESIGNED MANUAL TEST CASES were successfully automated AND
     executed. The second distinct measure. Clearly labelled and separately computed from §5.

     §7 rule 2: designed-but-never-automated and automated-but-never-executed are BOTH reported here
     explicitly. -->

**{{AUTOMATION_COVERAGE_PERCENT}}%** — basis: {{AUTOMATION_COVERAGE_BASIS}}
<!-- e.g. "36 of 56 manual test cases were automated" -->

| Test Case ID | Designed | Automated | Executed | Status |
|---|---|---|---|---|
| {{TEST_CASE_ID}} | {{DESIGNED}} | {{AUTOMATED}} | {{EXECUTED}} | {{STATUS}} |

**Designed but never automated:**

| Test Case ID | Reason |
|---|---|
| {{TEST_CASE_ID}} | {{REASON}} |

**Automated but never executed:**

| Test Case ID | Reason |
|---|---|
| {{TEST_CASE_ID}} | {{REASON}} |

## 7. Risks

<!-- §8 #7 / §7 rule 3 — every carried-forward Project Context assumption/risk, resolved as
     CONFIRMED / REFUTED / STILL UNVERIFIED based on the execution outcome.
     "Still unverified" is a legitimate, expected answer — never upgrade it to confirmed because a
     related test passed, and never quietly drop an entry that stayed open. -->

| ID | Assumption / Risk (from Project Context) | Resolution | Basis |
|---|---|---|---|
| {{ID}} | {{STATEMENT}} | {{RESOLUTION}} <!-- Confirmed / Refuted / Still Unverified --> | {{BASIS}} |

**Still unverified — why:**

| ID | Why it remains unverified |
|---|---|
| {{ID}} | {{REASON}} |
<!-- e.g. "SR-5 (brute-force protection) remains unverified because the corresponding test was never
     authorized to run against the shared demo environment." -->

## 8. Recommendations & Next Steps

<!-- §8 #8 — clearly framed as SUGGESTIONS REQUIRING FOLLOW-UP (e.g. developer investigation), NEVER
     as an implied code fix already applied (§7 rule 5). -->

| # | Recommendation | Applies To | Owner (suggested) | Rationale |
|---|---|---|---|---|
| {{N}} | {{RECOMMENDATION}} | {{APPLIES_TO}} | {{SUGGESTED_OWNER}} | {{RATIONALE}} |

## 9. Declared Gaps

<!-- OPTIONAL — include on any degraded run (§12). Name every absent input and exactly which sections
     above it limits. Omit the section entirely only when every declared input was present.

     Per §12: no absent input may render as a favourable result.
       No Execution Results  → outcome-dependent sections marked `Not Executed — Requires Stage 5A`
       No Traceability Matrix → §5 omitted, with the reason stated, rather than computed from an
                                incomplete basis
       No Project Context     → §7 carries no resolution; marked `Requires Stage 1` -->

| Absent Input | Sections Limited | How It Is Marked |
|---|---|---|
| {{ABSENT_INPUT}} | {{SECTIONS}} | {{MARKING}} |
