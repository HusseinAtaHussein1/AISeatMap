<!--
TEMPLATE — Repair Summary (Stage 5H — Self-Healing, OPTIONAL)
Renders to: platform_core_data/modules/{{MODULE_SLUG}}/healing/RepairSummary.md
Authority:  .claude/skills/self-healing-skill/SKILL.md §19 (Standard Output Contract — these
            12 sections, this order), §5 (Eligibility), §7 (Reasoning Engine), §8 (Application-
            Defect Prohibition), §9 (Confidence Engine), §10 (Shared Repair KB), §13, §14
            workflows_and_pipelines/pipeline/pipeline.md §5.6 (Batch Repair Approval)

Section order is mandatory. This stage NEVER runs automatically (pipeline.md §3.6) — it exists
only because a human invoked it.

ONE FILE PER MODULE. An invocation scoped to several modules produces one healing folder per module,
each holding only that module's repairs. There is NO combined cross-module repair document, because a
repair is always to one module's suite and a combined document would have to be split again to be
actionable (module_architecture.md §8.3).

WHERE THE PIECES GO: this reasoning record lives in the MODULE. The repair CODE is applied in place to
modules/{{MODULE_SLUG}}/automation/tests_{{FRAMEWORK}}/ with git as the before/after record. The
RERUN's results go to the TRIGGERING RUN's execution/ folder, as ExecutionResults.rerun-N.md — a
rerun is an execution, and it belongs with the execution it is a cycle of (§8.2).

THE RULE THAT OVERRIDES EVERY OTHER: an Application Failure is NEVER healed (§8). If a repair pass
reveals that a failure classified Automation Failure is in fact an application defect, work on that
test STOPS, it is reclassified, and it is reported as a defect — recorded in section 6 below.
-->

# Repair Summary — {{MODULE}}

**Status:** {{STATUS}} <!-- Draft | Pending Automation Approval (for the repaired suite) | Approved -->

## 1. Healing Metadata

<!-- §19 #1 -->

| Field | Value |
|---|---|
| Healing Pass ID | {{HEALING_PASS_ID}} |
| Module | `{{MODULE_SLUG}}` |
| Triggering run | `{{RUN_FOLDER}}` <!-- the run whose failures prompted this pass, and whose execution/ folder receives the rerun --> |
| Revision | {{REVISION_COUNT}} <!-- in-place edits since creation; this artifact belongs to the module, not the run --> |
| Source Execution ID(s) | {{EXECUTION_IDS}} |
| Rerun cycle written | `runs/{{RUN_FOLDER}}/execution/ExecutionResults.rerun-{{N}}.md` <!-- the original results file is NEVER edited --> |
| Scope | {{HEALING_SCOPE}} <!-- the test IDs within THIS module, or "all Automation Failures in this module" (§4.1) --> |
| Module lifecycle state after | {{AUTOMATION_STATE}} <!-- Healed on approval — then re-enters the §5.2 gate before assembly (pipeline.md §13.7) --> |
| Environment | {{ENVIRONMENT}} |
| Framework | {{FRAMEWORK}} |
| Started / Completed | {{STARTED_AT}} / {{COMPLETED_AT}} |
| Invocation Path | Direct <!-- always Direct: this stage has no pipeline-driven entry point (§6.1) --> |
| Run-scoped instruction | {{INSTRUCTION}} <!-- verbatim, or "none" --> |

## 2. Eligibility Summary

<!-- §19 #2 / §5 — what was present, what was eligible, what was excluded and why. -->

| Stage 5A Classification | Count | Eligible for repair? | Disposition |
|---|---|---|---|
| Automation Failure | {{N_AUTO}} | **Yes** | {{DISPOSITION_AUTO}} |
| Application Failure | {{N_APP}} | **Never (§8)** | Reported as defects — see §6 |
| Environment Failure | {{N_ENV}} | No | Reported; environment fix, not a code fix |
| Infrastructure Failure | {{N_INFRA}} | No | Reported |
| Configuration Failure | {{N_CONFIG}} | No | Reported |
| Inconclusive | {{N_INCONCL}} | Diagnosis only, by explicit human choice | {{DISPOSITION_INCONCL}} |
| Flaky | {{N_FLAKY}} | Diagnosis first | {{DISPOSITION_FLAKY}} |

**Out of scope for this pass:** {{OUT_OF_SCOPE_IDS}} <!-- present but outside the invoked scope; untouched, never mistaken for resolved (§4.1) -->

## 3. Per-Failure Analysis

<!-- §19 #3 — one block per eligible failure. Repeat this block.
     Root Cause Confidence GATES what may be proposed (§7.1):
       High   -> repair strategies may be proposed
       Medium -> diagnosis FIRST; no repair on a guess
       Low    -> diagnosis ONLY; never propose or apply a repair
     Diagnosis and Repair strategies are NEVER ranked in the same list (§7.1). -->

### {{TEST_CASE_ID}} — {{TEST_CASE_TITLE}}

| Field | Value |
|---|---|
| Automation Script | {{SCRIPT_ID}} |
| Classification | {{CLASSIFICATION}} |
| Root Cause Confidence | {{ROOT_CAUSE_CONFIDENCE}} <!-- High | Medium | Low (§7.1) --> |
| Evidence consulted | {{EVIDENCE_REFS}} |
| KB consulted | {{KB_REFS}} <!-- Rule IDs + confirmation counts, or "no matching prior art" (§10.1) --> |

**Diagnosis Strategies** <!-- omit when Root Cause Confidence is High -->

| Option | Strategy | What it would establish |
|---|---|---|
| {{DIAG_OPT}} | {{DIAG_STRATEGY}} | {{DIAG_ESTABLISHES}} |

**Repair Strategies** <!-- omit entirely when confidence is Low (§7.1) -->

<!-- 2–4 options, never one (§7.2). A matching confirmed KB rule is ALWAYS listed as an option,
     cited by ID — it does not automatically win, and is never silently omitted. -->

| Option | Strategy | Pros | Risk | Confidence | Basis |
|---|---|---|---|---|---|
| {{OPT}} | {{STRATEGY_NAME}} | {{PROS}} | {{RISK}} | {{CONF}}% | {{BASIS}} |

**Strategy selected:** {{SELECTED}} — by {{SELECTION_RULE}} <!-- highest confidence | lowest risk | fastest | custom | platform recommendation (§7.3) -->

**Repair Confidence Report** <!-- §9.1 — full block, see RepairConfidenceReport.md -->

```
Root Cause:            {{ROOT_CAUSE}}
Proposed Repair:       {{PROPOSED_REPAIR}}
Confidence:            {{CONFIDENCE}}%
Reasoning:
  - {{FACTOR_1}}
  - {{FACTOR_2}}
Regression Risk:       {{REGRESSION_RISK}} — {{RISK_REASON}}
Evidence:              {{BEFORE_REF}} / {{AFTER_REF}}
```

## 4. Applied Repairs

<!-- §19 #4 — reviewable WITHOUT reading a diff. Automation code only, in the run's working copy
     (§11). Never a Stage 1–3 artifact, never a Manual branch artifact, never the baseline directly. -->

| Test Case | File changed | Nature of change | Strategy applied |
|---|---|---|---|
| {{TC_ID}} | `{{FILE}}` | {{CHANGE_NATURE}} | {{STRATEGY}} |

**Batch approval reference:** {{APPROVAL_REF}} <!-- who approved, when, which option (pipeline.md §5.6.2). Approval covers the batch AS LISTED — nothing more. -->

## 5. Rerun Outcome

<!-- §19 #5 — only the affected tests are rerun, never the full suite (§12).
     Cross-references BeforeAfterComparison.md. -->

| Column | Count | Test Case IDs |
|---|---|---|
| **Fixed** (`Automation Repaired`) | {{N_FIXED}} | {{FIXED_IDS}} |
| **Remaining Failures** | {{N_REMAINING}} | {{REMAINING_IDS}} |
| **New Failures** (regression from a repair) | {{N_NEW}} | {{NEW_IDS}} |
| **Reclassified** (§6) | {{N_RECLASS}} | {{RECLASS_IDS}} |
| **Quarantined** (§8) | {{N_QUARANTINED}} | {{QUARANTINED_IDS}} |

<!-- A New Failure is NEVER netted off against a fix (§13). "8 fixed, 1 newly broken" is reported
     as exactly that — never summarized as "8 tests fixed". -->

## 6. Reclassifications — failures that were NOT automation defects

<!-- §19 #6 / §8.2. THE MOST IMPORTANT SECTION IN THIS DOCUMENT.
     Every failure established mid-pass as a genuine application defect, with the evidence, and the
     explicit statement that a repair was considered and deliberately NOT applied. A reader must be
     able to see the decision was MADE — not merely that nothing happened. -->

| Test Case | Was | Now | Evidence | Repair considered but not applied |
|---|---|---|---|---|
| {{TC_ID}} | Automation Failure | **Application Failure** | {{EVIDENCE}} | {{WHY_NOT_APPLIED}} |

**Defects reported for developer investigation:** {{DEFECT_REFS}}

## 7. Disclosed Discrepancies

<!-- §19 #7 / §8.3 — where a repair would have required changing an assertion's EXPECTED VALUE, the
     automation and the approved Manual Test Suite disagree about what is correct. Disclosed for a
     human to resolve at Stage 3 — never silently reconciled by editing either side. -->

| Test Case | Automation expects | Test case states | Observed | For resolution at |
|---|---|---|---|---|
| {{TC_ID}} | {{AUTO_EXPECTS}} | {{TC_STATES}} | {{OBSERVED}} | Stage 3 (Test Design) |

## 8. Quarantine

<!-- §19 #8 / §14 — tests withdrawn from automated repair after the attempt limit (default: 3rd
     failure quarantines). Quarantine is NOT deletion and NOT a skip: the test stays in the suite
     and stays reported. Cross-references QuarantineRegister.md. -->

| Test Case | Attempts | Why withdrawn | Recommendation |
|---|---|---|---|
| {{TC_ID}} | {{ATTEMPTS}} | {{REASON}} | {{RECOMMENDATION}} |

## 9. Knowledge Recorded

<!-- §19 #9 / §10.2 — CONFIRMED REPAIRS ONLY. Nothing from Remaining, New, Reclassified, or
     Quarantined is ever written to the KB, however plausible its reasoning was. -->

| Test Case | Confirmed repair recorded | Promotion proposed? | Outcome |
|---|---|---|---|
| {{TC_ID}} | {{WHAT_WORKED}} | {{PROMOTION_PROPOSED}} | {{PROMOTION_OUTCOME}} <!-- approved -> REPAIR-{NNN} | declined (stays run-local) --> |

## 10. Health Impact

<!-- §19 #10. Application Health MUST be unchanged by healing. If it moved, a repair suppressed a
     real defect — that is a §8 violation to investigate, not a result to report. -->

| Figure | Before | After | Note |
|---|---|---|---|
| **Application Health** | {{APP_BEFORE}} | {{APP_AFTER}} | **Must be unchanged** — see §8 |
| Automation Health | {{AUTO_BEFORE}} | {{AUTO_AFTER}} | The figure healing is allowed to move |
| Environment Health | {{ENV_BEFORE}} | {{ENV_AFTER}} | Out of scope for healing |

## 11. Recommendations

<!-- §19 #11 — smallest corrective action per Remaining / New / Quarantined item. -->

| Item | Recommendation |
|---|---|
| {{ITEM}} | {{RECOMMENDATION}} |

## 12. Approval Status

<!-- §19 #12 / §15 — Stage 4A's approval does NOT cover code this stage changed. -->

| Field | Value |
|---|---|
| Repaired suite status | **Pending Automation Approval** |
| May merge to baseline? | **No — not until this clears (pipeline.md §5.2, §12.4)** |
| May project into Target Project? | **No — not until this clears (pipeline.md §13.3)** |
| Reviewer | {{REVIEWER}} |

**Treating Stage `4A`'s original approval as still covering repaired code is the most likely path by
which unreviewed code reaches a real environment.**
