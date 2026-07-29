<!--
TEMPLATE — Before/After Comparison (Stage 5H — Self-Healing, OPTIONAL)
Renders to: platform_core_data/modules/{{MODULE_SLUG}}/healing/BeforeAfterComparison.md
Authority:  .claude/skills/self-healing-skill/SKILL.md §13, §12 (Targeted Rerun), §10.2 (KB write rule)

Only the REPAIRED tests are rerun — never the full suite unless every test in it was repaired (§12).

TWO RULES THIS DOCUMENT EXISTS TO ENFORCE:
  1. A fixed test is labelled `Automation Repaired`, NEVER `Passed` — so no reader, and no Stage 6A
     report, mistakes a repaired result for a clean first attempt.
  2. A New Failure is NEVER netted off against a fix. "8 fixed, 1 newly broken" is reported as
     exactly that.
-->

# Before/After Comparison — {{MODULE}}

**Module:** `{{MODULE_SLUG}}` · **Healing Pass:** {{HEALING_PASS_ID}} · **Triggering run:** `{{RUN_FOLDER}}`
**Source Execution:** {{EXECUTION_IDS}} · **Scope:** {{HEALING_SCOPE}} · **Rerun cycle:** `ExecutionResults.rerun-{{N}}.md`

<!-- This document is the REVIEWABLE PROSE record of the change, not the mechanism by which it is
     recoverable — the repair is applied in place to the module project, and git is the before/after
     record (module_architecture.md §8.1). The rerun's raw results live in the triggering run above. -->

## 1. Headline

| | Count |
|---|---|
| Tests repaired and rerun | {{N_RERUN}} |
| **Fixed** (`Automation Repaired`) | {{N_FIXED}} |
| **Remaining Failures** | {{N_REMAINING}} |
| **New Failures** (introduced by a repair) | {{N_NEW}} |

<!-- If N_NEW > 0, say so plainly here in one sentence. Never present a net figure. -->

{{HEADLINE_STATEMENT}}

## 2. Fixed — repaired and now passing

<!-- Labelled `Automation Repaired`, never `Passed` (§13). These are the ONLY tests whose repairs
     may be written to the Repair KB (§10.2). -->

| Test Case | Script | Root Cause | Strategy Applied | Proposed Conf. | Confirmed | Evidence (before / after) |
|---|---|---|---|---|---|---|
| {{TC_ID}} | {{SCRIPT_ID}} | {{ROOT_CAUSE}} | {{STRATEGY}} | {{PROPOSED_CONF}}% | ✔ rerun passed | {{BEFORE_REF}} / {{AFTER_REF}} |

## 3. Remaining Failures — repaired, still failing

<!-- The fix did not resolve it, or surfaced a different issue. NOT written to the KB (§10.2) —
     a repair that did not work is not knowledge, however plausible its reasoning was. -->

| Test Case | Strategy Attempted | Proposed Conf. | What actually happened | Attempt count | Next step |
|---|---|---|---|---|---|
| {{TC_ID}} | {{STRATEGY}} | {{PROPOSED_CONF}}% | {{OUTCOME}} | {{ATTEMPTS}} | {{NEXT}} <!-- retry with another strategy | quarantine (§14) | reclassify --> |

## 4. New Failures — regressions introduced by a repair

<!-- Passed BEFORE the repair, fails AFTER it. The most important column in this document:
     a repair that broke a working test is a net negative regardless of how many others it fixed. -->

| Test Case | Was | Now | Which repair caused it | Recommended action |
|---|---|---|---|---|
| {{TC_ID}} | Passed | {{NOW_STATUS}} | {{CAUSING_REPAIR}} | {{ACTION}} <!-- revert that repair | narrow its scope | escalate --> |

<!-- Where this table is non-empty, the reviewer must be able to see, without inference, that
     approving this pass means accepting these regressions. -->

## 5. Confidence Calibration

<!-- Did the confidence estimates actually predict the outcome? Feeds §25's Confidence Calibration
     metric. A well-calibrated engine separates Fixed from Remaining clearly; if it does not, §9.2's
     factors need review rather than the results being explained away. -->

| | Mean proposed confidence | Count |
|---|---|---|
| Fixed | {{MEAN_CONF_FIXED}}% | {{N_FIXED}} |
| Remaining | {{MEAN_CONF_REMAINING}}% | {{N_REMAINING}} |
| New failures | {{MEAN_CONF_NEW}}% | {{N_NEW}} |

**Calibration note:** {{CALIBRATION_NOTE}}

## 6. Health Impact

| Figure | Before | After |
|---|---|---|
| **Application Health** | {{APP_BEFORE}} | {{APP_AFTER}} <!-- must be unchanged (§8) --> |
| Automation Health | {{AUTO_BEFORE}} | {{AUTO_AFTER}} |
| Environment Health | {{ENV_BEFORE}} | {{ENV_AFTER}} |

**If Application Health changed, stop and investigate before approving** — healing must not be able
to move the figure that describes whether the application itself works (`self-healing-skill` §8).
