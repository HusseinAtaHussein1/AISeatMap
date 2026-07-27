<!--
TEMPLATE — Coverage Report (Stage 3 of 7)
Renders to: platform_core_data/runs/{{RUN_FOLDER}}/test_design/CoverageReport.md
Authority:  .claude/skills/test-design-skill/SKILL.md §18 (Standard Output Contract — these 12
            sections, this order), §8 (Coverage Tracking), §9 Outputs #4, §12

Section order is mandatory: the Automation skill (and any future consumer) must never have to
interpret free-form prose to extract what it needs.
-->

# Coverage Report — {{RUN_FOLDER}}

| Field | Value |
|---|---|
| Run Folder | `{{RUN_FOLDER}}` |
| Generated | {{TIMESTAMP}} |
| Status | {{STATUS}} <!-- Pending Review / Approved --> |

## 1. Run Scope

<!-- The Run Scope Type/Source and Run Type this run used (§16), and which Project Context this run
     designed against. -->

| Field | Value |
|---|---|
| Run Scope Type / Source | {{RUN_SCOPE_TYPE}} / {{RUN_SCOPE_SOURCE}} |
| Run Type | {{RUN_TYPE}} |
| Project Context | `runs/{{RUN_FOLDER}}/context/ProjectContext.md` |

## 2. Requirements Covered

<!-- The Covered list from §8.1/§8.3, each with its requirement ID. -->

| Requirement ID | Summary | Test Case ID(s) |
|---|---|---|
| {{REQUIREMENT_ID}} | {{SUMMARY}} | {{TEST_CASE_IDS}} |

**Coverage Percentage: {{COVERAGE_PERCENT}}%**
<!-- Computed against COVERED ONLY. Partially Covered, Out-of-Scope, and Unknown/Unassessed are
     reported ALONGSIDE it (§8, §8.3) — never folded into the same percentage, so a reviewer cannot
     mistake a high percentage for full assurance while partial/unknown items exist. -->

| Category | Count |
|---|---|
| Covered | {{COVERED_COUNT}} |
| Partially Covered | {{PARTIAL_COUNT}} |
| Out-of-Scope | {{OUT_OF_SCOPE_COUNT}} |
| Unknown / Unassessed | {{UNKNOWN_COUNT}} |
| Uncovered | {{UNCOVERED_COUNT}} <!-- the only category that is always a defect in this stage's output --> |

## 3. Coverage Matrix

<!-- Requirement ID × Test Case ID(s) — consolidating what TraceabilityMatrix.md already states,
     presented here for at-a-glance review alongside the rest of this contract. -->

| Requirement ID | Test Case ID(s) | Status |
|---|---|---|
| {{REQUIREMENT_ID}} | {{TEST_CASE_IDS}} | {{STATUS}} |

## 4. Business Rules

<!-- Every `BR-`prefixed requirement (§5.4) and its test case(s) — listed SEPARATELY from
     §2 Requirements Covered so business-rule coverage is auditable on its own. -->

| Business Rule ID | Rule | Test Case ID(s) | Status |
|---|---|---|---|
| {{BR_ID}} | {{RULE}} | {{TEST_CASE_IDS}} | {{STATUS}} |

## 5. Test Scenarios

<!-- A count/breakdown of designed scenarios by module and by dimension (§7 Negative Test Generation,
     §17 Required Dimensions). Also the roll-up point for Category and Test Type (§6.2). -->

**By module:**

| Module | Total | Atomic | Scenario | E2E | Positive | Negative | Exploratory |
|---|---|---|---|---|---|---|---|
| {{MODULE}} | {{TOTAL}} | {{ATOMIC}} | {{SCENARIO}} | {{E2E}} | {{POSITIVE}} | {{NEGATIVE}} | {{EXPLORATORY}} |

**By dimension (§7, §17):**

| Dimension / Negative Subtype | Case Count |
|---|---|
| {{DIMENSION}} | {{COUNT}} |

## 6. Manual Test Cases

<!-- REFERENCE ONLY to the Markdown/Excel suites — full case content lives there, NEVER restated
     here. -->

| Module | Markdown | Excel |
|---|---|---|
| {{MODULE}} | `test_design/TestCases_{{MODULE}}.md` | `test_design/TestCases_{{MODULE}}.xlsx` |

## 7. Assumptions

<!-- Every assumption-based test case (§3) carried forward from the Project Context's
     Assumptions/Risks. Each carried-forward assumption gets its own explicitly tagged case — never
     folded silently into another case. -->

| Assumption ID (Project Context) | Assumption | Test Case ID | Tag |
|---|---|---|---|
| {{ASSUMPTION_ID}} | {{STATEMENT}} | {{TEST_CASE_ID}} | {{TAG}} |

## 8. Coverage Gaps

<!-- Uncovered Requirements (§8.1), Uncovered Findings (§8.2), and Partially Covered /
     Unknown-Unassessed items (§8.3) — EACH WITH ITS STATED REASON.
     Where a gap is blocked, state the SMALLEST missing prerequisite that would resolve it (§20 #2):
       Good: "Re-run Stage 1 with T3087's DBA-approved max-airline-count constraint recorded"
       Bad:  "requirements incomplete" -->

| Gap Type | ID | Reason | Smallest Unblocking Prerequisite |
|---|---|---|---|
| {{GAP_TYPE}} <!-- Uncovered Requirement / Uncovered Finding / Partially Covered / Unknown-Unassessed --> | {{ID}} | {{REASON}} | {{PREREQUISITE}} |

## 9. Risks

<!-- Every test case's Risk entry from the Traceability Matrix (§6.2), aggregated, with High/Critical
     items called out EXPLICITLY. -->

**High / Critical:**

| Risk Level | Test Case ID(s) | Statement |
|---|---|---|
| {{RISK_LEVEL}} | {{TEST_CASE_IDS}} | {{STATEMENT}} |

**All risks:**

| Risk Level | Count |
|---|---|
| {{RISK_LEVEL}} | {{COUNT}} |

## 10. Recommendations

<!-- Exploratory Recommendations (§17) and any other non-fixed-case suggestion for the human
     reviewer. Also where a Global Stop Condition's minimal prerequisite is recorded (§20 #3). -->

| ID | Recommendation | Rationale |
|---|---|---|
| {{REC_ID}} | {{RECOMMENDATION}} | {{RATIONALE}} |

## 11. Automation Candidates

<!-- Test cases flagged as LIKELY well-suited to automation — an ADVISORY, PRIORITIZATION-ONLY hint,
     consumed first by the Manual Execution skill (§9.2 there).
     The binding Automation Decision (Reuse / Generate / Partially Automatable / Manual Only) remains
     EXCLUSIVELY the Automation skill's authority (automation-skill §13) and is never pre-empted here. -->

| Test Case ID | Module | Why a Candidate (advisory) | Priority Hint |
|---|---|---|---|
| {{TEST_CASE_ID}} | {{MODULE}} | {{RATIONALE}} | {{PRIORITY_HINT}} |

## 12. Inputs for Manual Execution skill

<!-- The explicit handoff package (§21) — confirmation that every input
     .claude/skills/manual-execution-skill/SKILL.md §4 declares it needs is present AND SPECIFIC. -->

| Required Input (Manual Execution §4) | Present? | Location / Note |
|---|---|---|
| {{REQUIRED_INPUT}} | {{PRESENT}} | {{LOCATION}} |

**Handoff confirmation:** {{HANDOFF_CONFIRMATION}}
