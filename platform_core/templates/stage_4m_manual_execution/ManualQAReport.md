<!--
TEMPLATE — Manual QA Report (Stage 4M — Manual Execution Pipeline, TERMINAL stage)
Renders to: platform_core_data/runs/{{RUN_FOLDER}}/manual_execution/ManualQAReport.md
Authority:  .claude/skills/manual-execution-skill/SKILL.md §9.1 (these 8 sections, this order),
            §9 (self-reporting), §8 (Result Classification), §10.1 (Defect Documentation Standard)
            workflows_and_pipelines/pipeline/pipeline.md §3.3 (branch isolation), §5.1

THIS IS THE MANUAL PIPELINE'S STAKEHOLDER DELIVERABLE. Stage 4M is terminal: there is no Reporting
stage downstream (Stage 6A serves the Automation branch and consumes automation results, not these).
A run that took only the Manual branch has no Final QA Report, and that is correct, not a gap.

ONE RESULT SET, THREE RENDERINGS — this report, ManualTestResults.csv, and ManualExecutionResults.md
are derived from the same per-test results and MUST NEVER DISAGREE. The Results document is
authoritative; this report and the CSV are derived from it. A figure here that cannot be recomputed
from the Results is a defect in this stage's output.

REPORTS MANUAL COVERAGE ONLY. Never states or implies anything about automation coverage, even where
the Automation branch also ran the same scope (§9.1).
-->

# Manual QA Report — {{RUN_FOLDER}}

**Status:** {{STATUS}} <!-- Draft | Pending Review | Approved --> · **Branch:** Manual Execution (terminal)

## 1. Run Identification

| Field | Value |
|---|---|
| Run Folder | `{{RUN_FOLDER}}` |
| Execution ID | {{EXECUTION_ID}} |
| Run Scope Type / Run Type | {{RUN_SCOPE_TYPE}} / {{RUN_TYPE}} |
| Modules in scope | {{MODULES}} |
| Target environment | {{ENVIRONMENT}} — {{APP_URL}} |
| Execution window | {{STARTED_AT}} → {{COMPLETED_AT}} |
| Browser mode | {{BROWSER_MODE}} <!-- Headed (normal for this stage, §11.1) | Headless — with the reason, per Known Limitations --> |
| Executed by | {{EXECUTOR}} |

## 2. Executive Summary

<!-- §9.1 #2 — plain language a non-QA stakeholder can act on. What was validated, what the overall
     outcome was, and what (if anything) needs a decision from them. No QA jargon, no unexplained
     status vocabulary. -->

{{EXECUTIVE_SUMMARY}}

## 3. Outcome Figures

<!-- §9.1 #3 — ALL SIX statuses (§8), never a bare pass/fail split. The denominator is every test
     case IN SCOPE, including Blocked / Skipped / Not Executed — reporting only executed cases
     overstates the pass rate. -->

| Status | Count | % of scope |
|---|---|---|
| Passed | {{N_PASSED}} | {{PCT_PASSED}}% |
| Failed | {{N_FAILED}} | {{PCT_FAILED}}% |
| Blocked | {{N_BLOCKED}} | {{PCT_BLOCKED}}% |
| Skipped | {{N_SKIPPED}} | {{PCT_SKIPPED}}% |
| Not Executed | {{N_NOT_EXEC}} | {{PCT_NOT_EXEC}}% |
| Inconclusive | {{N_INCONCLUSIVE}} | {{PCT_INCONCLUSIVE}}% |
| **Total in scope** | **{{N_TOTAL}}** | **100%** |

## 4. Requirement Coverage

<!-- §9.1 #4 — computed FROM THE TRACEABILITY MATRIX, never asserted. A requirement with no executed
     test case is reported as `Not verified` WITH ITS REASON — never omitted, since an absent row
     reads as "nothing to say", which is the opposite of the truth. -->

| Requirement ID | Requirement | Covering test cases | Verification state | Note |
|---|---|---|---|---|
| {{REQ_ID}} | {{REQ_TITLE}} | {{TC_IDS}} | {{STATE}} <!-- Verified | Failed | Partially verified | Not verified --> | {{NOTE}} |

**Requirements verified:** {{N_VERIFIED}} / {{N_REQS}} ({{PCT_VERIFIED}}%)

## 5. Defect Register

<!-- §9.1 #5 — one row per Failed/Inconclusive case. Each row LINKS to its full §10.1 write-up in
     ManualExecutionResults.md; the full defect narrative is never duplicated here. -->

| Test Case | Defect summary | Severity | Priority | Category | Layer | Reproducibility | Full write-up |
|---|---|---|---|---|---|---|---|
| {{TC_ID}} | {{DEFECT_SUMMARY}} | {{SEVERITY}} | {{PRIORITY}} | {{CATEGORY}} | {{LAYER}} | {{REPRO}} | [details](./ManualExecutionResults.md#{{ANCHOR}}) |

**Defects by severity:** Critical {{N_CRIT}} · High {{N_HIGH}} · Medium {{N_MED}} · Low {{N_LOW}}

<!-- Where a Repair KB entry explains an observed behaviour (§9.3), it is CITED ALONGSIDE the defect
     — never used to downgrade or suppress it. A documented quirk is still a defect if the behaviour
     is wrong. -->

## 6. Assumptions & Risks Resolved

<!-- §9.1 #6 — every Test Design "Assumption-based test" tag carried to a resolved state. An
     assumption left unexamined is reported as `Unverified`, never quietly dropped. -->

| Assumption / Risk | Source test case | Resolution | Evidence |
|---|---|---|---|
| {{ASSUMPTION}} | {{TC_ID}} | {{RESOLUTION}} <!-- Confirmed | Refuted | Unverified --> | {{EVIDENCE_REF}} |

## 7. Known Limitations

<!-- §9.1 #7 — what this run could NOT verify, and why. Blocked preconditions, Skipped mutating
     actions, and any headless fallback (§11.1) belong here. A limitation stated is a limitation the
     stakeholder can act on; a limitation omitted becomes a false assurance. -->

| Limitation | Affected test cases | Why | Consequence for confidence |
|---|---|---|---|
| {{LIMITATION}} | {{TC_IDS}} | {{WHY}} | {{CONSEQUENCE}} |

## 8. Recommendations

<!-- §9.1 #8 / §19 — the smallest corrective action per blocked/failed item. Never a code fix
     presented as already applied. -->

| Item | Recommendation | Owner suggestion |
|---|---|---|
| {{ITEM}} | {{RECOMMENDATION}} | {{OWNER}} |

---

## Delivery Completeness

<!-- §20 — this stage hands off to NOBODY, so this checklist replaces an outbound handoff contract.
     The last row is the one that actually fails in practice: a status corrected in the Results
     without regenerating the CSV produces a delivery that contradicts itself — and the
     contradiction is normally found by the stakeholder, not the reviewer. -->

| Requirement | Status |
|---|---|
| Every test case in scope has a recorded outcome | {{CHK_1}} |
| Every Failed/Inconclusive case meets the Defect Documentation Standard in full (§10.1) | {{CHK_2}} |
| Every result's evidence captured, or its absence stated with a reason | {{CHK_3}} |
| CSV has one row per test case in scope, statuses unabbreviated | {{CHK_4}} |
| Coverage computed from the Traceability Matrix, uncovered requirements shown as *not verified* | {{CHK_5}} |
| **All three renderings agree on every test case's status** | {{CHK_6}} |
| No script of any kind was produced as an artifact (§2.1) | {{CHK_7}} |
