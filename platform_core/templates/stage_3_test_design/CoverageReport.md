<!--
TEMPLATE — Coverage Report (Stage 3 — shared, divergence point)
Renders to: platform_core_data/modules/{{MODULE_SLUG}}/test_design/CoverageReport.md
Authority:  .claude/skills/test-design-skill/SKILL.md §18 (Standard Output Contract — these 12
            sections, this order), §8 (Coverage Tracking), §9 Outputs #4, §12

Section order is mandatory: the Automation skill (and any future consumer) must never have to
interpret free-form prose to extract what it needs.
-->

# Coverage Report — {{RUN_FOLDER}}

| Field | Value |
|---|---|
| Module | `{{MODULE_SLUG}}` |
| Produced by run | `{{RUN_FOLDER}}` |
| Revision | {{REVISION_COUNT}} <!-- in-place edits since creation; this artifact belongs to the module, not the run --> |
| Generated | {{TIMESTAMP}} |
| Status | {{STATUS}} <!-- Pending Review / Approved --> |

## 1. Run Scope

<!-- The Run Scope Type/Source and Run Type this run used (§16), and which Project Context this run
     designed against. -->

| Field | Value |
|---|---|
| Run Scope Type / Source | {{RUN_SCOPE_TYPE}} / {{RUN_SCOPE_SOURCE}} |
| Run Type | {{RUN_TYPE}} |
| Project Context | `modules/{{MODULE_SLUG}}/context/ProjectContext.md` |

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
     here.

     The Markdown is authored; the .xlsx is generated from it by
     `platform_core/tools/test_suite_export/cli.js` (§9.1), which is what makes the two provably
     non-divergent rather than merely intended to match.

     Case Count is per module and must agree with the suite document's own Total Test Cases and with
     that module's row count in TraceabilityMatrix.md §1. This is the reconciliation point where a
     miscount gets caught — a wrong total here propagates into the Stage 4M and Stage 4A summaries, where
     it is much harder to notice. State the count you actually counted from the files, never one
     carried over from a draft.

     Where a single file deliberately groups several requirement groups (e.g. NAV + NFR + BR in
     TestCases_Navigation.md), say so in a note under this table rather than leaving a reader to
     notice the file name and the module list in §2 disagree. -->

| Module | Markdown | Excel | Case Count |
|---|---|---|---|
| {{MODULE}} | `test_design/TestCases_{{MODULE}}.md` | `test_design/TestCases_{{MODULE}}.xlsx` | {{CASE_COUNT}} |
| **Total** | | | **{{TOTAL_CASES}}** |

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

## 11. Review & Automation

<!-- CANONICAL HEADING. `Review & Automation` is the umbrella whenever a section covers BOTH
     lifecycle columns. Do NOT title it "Automation Candidates" (retired), "Automation Status"
     (only Automation), or "Lifecycle Status" (implies one combined state). Where a section
     genuinely covers only one field, `Review` or `Automation` may stand alone.

     A ROLL-UP of the two binding columns each test case carries (test-design-skill §6.3, §18 #11).
     It is a COUNT OF DECISIONS ALREADY RECORDED ON THE CASES, never a separate recommendation —
     the advisory "Automation Candidates" list this section replaced is RETIRED (§6.3.2), because an
     advisory hint sitting beside a binding column can disagree with it.

     The two decisions are INDEPENDENT and answer different questions:
       Review     — has this test case been reviewed and accepted?
       Automation — should this (accepted) test case be automated?
     Eligibility is DERIVED from the pair, never stored as a third field:
       Stage 4M — Review = Approved                            (Automation is NOT read)
       Stage 4A — Review = Approved AND Automation = Approved
     Both are HUMAN decisions; no skill may write anything but `Pending` (§6.3.1). The engineering
     Automation Decision (Reuse / Generate / Partially Automatable / Not Automatable) for a case
     already in scope remains EXCLUSIVELY the Automation skill's authority (automation-skill §13). -->

| Column | Pending | Approved | Rejected |
|---|---|---|---|
| **Review** | {{REVIEW_PENDING}} | {{REVIEW_APPROVED}} | {{REVIEW_REJECTED}} |
| **Automation** | {{AUTO_PENDING}} | {{AUTO_APPROVED}} | {{AUTO_REJECTED}} |

| Decision | Count | Test Case IDs |
|---|---|---|
| `Review = Approved` — **executable by Stage `4M`** | {{COUNT_MANUAL}} | {{IDS_MANUAL}} |
| `Review = Rejected` — excluded, reason `Rejected at Review` | {{COUNT_REVIEW_REJECTED}} | {{IDS_REVIEW_REJECTED}} |
| `Review = Pending` — excluded, reason `Pending Review` | {{COUNT_REVIEW_PENDING}} | {{IDS_REVIEW_PENDING}} |
| `Review = Approved AND Automation = Approved` — **in scope for Stage `4A`** | {{COUNT_AUTO}} | {{IDS_AUTO}} |
| `Review = Approved AND Automation = Rejected` — manual **by decision**, *not* a coverage gap | {{COUNT_MANUAL_ONLY}} | {{IDS_MANUAL_ONLY}} |

<!-- Report inconsistent pairs here, or state that there are none. An inconsistency is
     `Automation = Approved` with `Review != Approved` — two human decisions that disagree.
     It is NEVER reconciled here: both values stand, the case is already excluded from Stage 4A by
     the gate above, and resolution is a Human Decision (test-design-skill §6.3.4). -->

**Inconsistent pairs:** {{NONE_OR_LIST}}

## 12. Inputs for Manual Execution skill

<!-- The explicit handoff package (§21) — confirmation that every input
     .claude/skills/manual-execution-skill/SKILL.md §4 declares it needs is present AND SPECIFIC. -->

| Required Input (Manual Execution §4) | Present? | Location / Note |
|---|---|---|
| {{REQUIRED_INPUT}} | {{PRESENT}} | {{LOCATION}} |

**Handoff confirmation:** {{HANDOFF_CONFIRMATION}}
