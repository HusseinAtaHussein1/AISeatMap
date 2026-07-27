<!--
TEMPLATE — Automation Decision Report (Stage 5 of 7)
Renders to: platform_core_data/runs/{{RUN_FOLDER}}/automation/AutomationDecisionReport_{{FRAMEWORK}}.md
Authority:  .claude/skills/automation-skill/SKILL.md §13 (Automation Decision Engine — the four
            decisions and the six mandatory fields per decision), §16 Outputs #4, §19

HARD RULE (§13): EVERY test case named in the Automation Candidate Package receives EXACTLY ONE
decision. No candidate is left undecided.

A test case ABSENT from the Automation Candidate Package (never executed manually, or executed but
not confirmed successful/stable) receives NO decision this run — its status belongs to the Manual
Execution skill and is not re-litigated here.

This stage holds the BINDING automation decision. Test Design's advisory Automation Candidates hint
never pre-empts it.
-->

# Automation Decision Report — {{FRAMEWORK}} — {{RUN_FOLDER}}

| Field | Value |
|---|---|
| Run Folder | `{{RUN_FOLDER}}` |
| Framework | {{FRAMEWORK}} <!-- the human's Framework Decision Gate answer (§31) --> |
| Candidate Package | `runs/{{RUN_FOLDER}}/manual_execution/AutomationCandidatePackage.md` |
| Candidates decided | {{DECIDED_COUNT}} of {{CANDIDATE_COUNT}} |
| Generated | {{TIMESTAMP}} |

## 1. Decision Totals

<!-- Must sum to the Candidate Package's count — a shortfall means a candidate was left undecided,
     which §13 forbids. -->

| Decision | Count |
|---|---|
| Reuse Existing Automation | {{REUSE_COUNT}} |
| Generate New Automation | {{GENERATE_COUNT}} |
| Partially Automatable | {{PARTIAL_COUNT}} |
| Manual Only | {{MANUAL_ONLY_COUNT}} |
| **Total decided** | {{DECIDED_COUNT}} |

## 2. Per-Test-Case Decisions

<!-- One block per candidate test case. All six fields (§13) are mandatory on every decision.

     Decisions:
       Reuse Existing Automation — an existing asset already covers this case, as-is or via
                                  straightforward composition; no new code beyond suite wiring.
       Generate New Automation   — no suitable existing automation; new code authored per §14, and
                                  where a Finding Reference is populated, §12 traceability inheritance.
       Partially Automatable     — part of the steps/assertions can be automated reliably; the
                                  remainder cannot. The automatable portion IS generated; the
                                  non-automatable remainder is EXPLICITLY CALLED OUT, never silently
                                  dropped.
       Manual Only               — cannot be automated at all with acceptable reliability or safety
                                  (subjective visual judgment; still an assumption-based test pending
                                  verification; or expected behaviour underspecified such that
                                  codifying it would require inventing business logic). No code. -->

### {{TEST_CASE_ID}}

| Field | Value |
|---|---|
| **Decision** | {{DECISION}} <!-- exactly one of the four --> |
| **Justification** | {{JUSTIFICATION}} <!-- why THIS decision, referencing the specific test case content, existing assets, or specification gap involved — never a generic rationale --> |
| **Reused Assets** | {{REUSED_ASSETS}} <!-- which existing assets this relies on, or `None` --> |
| **Generated Assets** | {{GENERATED_ASSETS}} <!-- which new assets this produces, or `None` --> |
| **Automation Readiness** | {{READINESS}} <!-- ready to hand to Stage 6, or blocked pending something specific (e.g. a missing test data fixture) — name the blocker --> |
| **Known Limitations** | {{KNOWN_LIMITATIONS}} <!-- reliability, scope, and edge cases this automation does NOT cover --> |

**Traceability (carried from the Candidate Package, unmodified):**

| Requirement Ref | Discovery Ref | Finding Ref | Evidence Ref |
|---|---|---|---|
| {{REQUIREMENT_REF}} | {{DISCOVERY_REF}} | {{FINDING_REF}} | {{EVIDENCE_REF}} |

<!-- Repeat the block above for every candidate test case. -->

## 3. Partially Automatable — Non-Automated Remainders

<!-- MANDATORY whenever any case was decided Partially Automatable. The portion that was NOT
     automated is named here explicitly, so it is never silently lost between stages.
     Omit this section entirely only when there are zero Partially Automatable decisions. -->

| Test Case ID | Automated Portion | Non-Automated Remainder | Why Not Automatable |
|---|---|---|---|
| {{TEST_CASE_ID}} | {{AUTOMATED_PORTION}} | {{REMAINDER}} | {{REASON}} |

## 4. Manual Only — Reasons

<!-- One row per Manual Only decision, with its specific reason. Omit the section when empty. -->

| Test Case ID | Reason |
|---|---|
| {{TEST_CASE_ID}} | {{REASON}} |
