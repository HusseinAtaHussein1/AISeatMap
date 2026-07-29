<!--
TEMPLATE — Automation Coverage Report (Stage 4A — Automation branch)
Renders to: platform_core_data/runs/{{RUN_FOLDER}}/automation/AutomationCoverageReport_{{FRAMEWORK}}.md
Authority:  .claude/skills/automation-skill/SKILL.md §16 Outputs #5, §13 (the four decisions), §19

The AGGREGATE view: how many test cases received each of the four decisions, an automation coverage
percentage, and NAMED REASONS for EVERY Partially Automatable / Manual Only case.

"Named reasons for every" is the load-bearing requirement — a count without per-case reasons does not
satisfy this artifact.

This is realized coverage. The Automation Plan §9's figure was an estimate; §4 below reconciles the two.
-->

# Automation Coverage Report — {{FRAMEWORK}} — {{RUN_FOLDER}}

| Field | Value |
|---|---|
| Run Folder | `{{RUN_FOLDER}}` |
| Framework | {{FRAMEWORK}} |
| Decision Report | `runs/{{RUN_FOLDER}}/automation/AutomationDecisionReport_{{FRAMEWORK}}.md` |
| Candidates decided | {{DECIDED_COUNT}} |
| Generated | {{TIMESTAMP}} |

## 1. Automation Coverage

<!-- State the BASIS with the percentage — as elsewhere in the platform, a bare number without its
     denominator is not acceptable. Coverage counts Reuse + Generate; Partially Automatable and
     Manual Only are reported separately rather than folded in, so a reviewer cannot mistake a high
     figure for full automation. -->

**{{AUTOMATION_COVERAGE_PERCENT}}%** — basis: {{COVERAGE_BASIS}}
<!-- e.g. "31 of 36 candidate cases received a Reuse or Generate decision = 86%" -->

## 2. Decision Counts

| Decision | Count | % of Candidates |
|---|---|---|
| Reuse Existing Automation | {{REUSE_COUNT}} | {{REUSE_PERCENT}}% |
| Generate New Automation | {{GENERATE_COUNT}} | {{GENERATE_PERCENT}}% |
| Partially Automatable | {{PARTIAL_COUNT}} | {{PARTIAL_PERCENT}}% |
| Manual Only | {{MANUAL_ONLY_COUNT}} | {{MANUAL_ONLY_PERCENT}}% |
| **Total** | {{DECIDED_COUNT}} | 100% |

## 3. By Module and Suite

| Module | Suite | Candidates | Automated | Partial | Manual Only |
|---|---|---|---|---|---|
| {{MODULE}} | {{SUITE}} | {{CANDIDATES}} | {{AUTOMATED}} | {{PARTIAL}} | {{MANUAL}} |

## 4. Estimate Reconciliation

<!-- The Automation Plan §9 projected coverage BEFORE generation. Where realized differs from
     projected, state why — this is what makes the projection auditable rather than decorative. -->

| Decision | Projected (Plan §9) | Realized | Variance | Why |
|---|---|---|---|---|
| {{DECISION}} | {{PROJECTED}} | {{REALIZED}} | {{VARIANCE}} | {{WHY}} |

## 5. Partially Automatable — Named Reasons

<!-- MANDATORY: one row per Partially Automatable case, with the automated portion, the remainder, and
     the reason. The remainder is never silently dropped (§13).
     Omit this section only when the count is zero. -->

| Test Case ID | Module | Automated Portion | Non-Automated Remainder | Reason |
|---|---|---|---|---|
| {{TEST_CASE_ID}} | {{MODULE}} | {{AUTOMATED_PORTION}} | {{REMAINDER}} | {{REASON}} |

## 6. Manual Only — Named Reasons

<!-- MANDATORY: one row per Manual Only case, with its specific reason (§13):
       depends entirely on subjective visual judgment; or is still an assumption-based test pending
       verification; or its expected behaviour is underspecified such that codifying it would require
       inventing business logic.
     Omit this section only when the count is zero. -->

| Test Case ID | Module | Reason |
|---|---|---|
| {{TEST_CASE_ID}} | {{MODULE}} | {{REASON}} |

## 7. Coverage Against the Manual Suite

<!-- The wider view: designed cases → manually executed → automation candidates → automated. Each
     narrowing is a place cases legitimately drop out, and each drop-out count is named so the funnel
     is auditable end to end. -->

| Stage | Count | Dropped Here | Why |
|---|---|---|---|
| Designed (Stage 3) | {{DESIGNED_COUNT}} | — | — |
| Manually executed (Stage 4M — other branch, informational only) | {{EXECUTED_COUNT}} | {{DROPPED_EXECUTION}} | {{WHY_EXECUTION}} |
| Advisory automation-candidate hint (Stage 3 Coverage Report) | {{CANDIDATE_COUNT}} | {{DROPPED_CANDIDATE}} | {{WHY_CANDIDATE}} |
| Automated (this stage) | {{AUTOMATED_COUNT}} | {{DROPPED_AUTOMATION}} | {{WHY_AUTOMATION}} |
