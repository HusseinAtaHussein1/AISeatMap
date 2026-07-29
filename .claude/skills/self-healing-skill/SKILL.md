---
name: self-healing-skill
description: Stage 5H of the Agentic AI Testing Platform's Automation Pipeline — OPTIONAL and opt-in only. Applies evidence-grounded reasoning to Automation Failures from an execution run, proposes repair strategies with derived confidence, applies human-approved repairs to the automation suite, reruns only the affected tests, and records confirmed repairs to the shared Repair Knowledge Base. Use when an automation execution produced Automation Failures and a human explicitly asks to enhance/repair the suite for named modules or scope.
inputs:
  - name: execution_results
    type: file_path
    required: true
    description: Stage 5A Execution Results containing at least one `Automation Failure`, with its full Result Classification and Evidence Inventory.
  - name: automation_suite
    type: file_path
    required: true
    description: The approved automation suite (run working copy) whose failing tests are to be repaired.
  - name: project_context
    type: file_path
    required: true
    description: Target environment, credentials, and safety constraints governing any rerun.
  - name: repair_kb
    type: file_path
    required: false
    description: Shared Repair Knowledge Base (pipeline.md §10.8) — Platform repair/diagnosis/reasoning patterns plus prior runs' Repair Summaries. Consulted before deriving any new strategy.
  - name: selector_verification_kb
    type: file_path
    required: false
    description: Shared Selector Verification KB (pipeline.md §10.8) — verified locators per screen/component, used to repair a broken locator against known-good evidence rather than by guessing.
  - name: healing_scope
    type: string
    required: false
    description: Optional module/test-ID scope for this healing pass (e.g. "Login, Agency" or "TC-LOGIN-004..009"). Absent means every Automation Failure in the Execution Results.
outputs:
  - name: repair_summary
    type: file_path
    location: "platform_core_data/runs/{{RUN_FOLDER}}/self_healing/RepairSummary.md"
    description: Per-failure diagnosis, strategies considered, strategy selected, Repair Confidence Report, and outcome.
  - name: before_after_comparison
    type: file_path
    location: "platform_core_data/runs/{{RUN_FOLDER}}/self_healing/BeforeAfterComparison.md"
    description: Fixed / Remaining / New-failure classification after the targeted rerun.
  - name: quarantine_register
    type: file_path
    location: "platform_core_data/runs/{{RUN_FOLDER}}/self_healing/QuarantineRegister.md"
    description: Tests withdrawn from healing after repeated failed repair attempts, with full attempt history.
  - name: repaired_automation_suite
    type: file_path
    location: "platform_core_data/runs/{{RUN_FOLDER}}/automation/tests_{Framework}/"
    description: The automation suite with approved repairs applied — requires fresh Automation Approval before it re-merges to the baseline.
dependencies:
  - automation-execution-skill (upstream skill — supplies classified Execution Results)
  - automation-skill (owns the suite being repaired, and the Selector Verification KB this skill reads)
  - Playwright MCP server (headless) for diagnosis evidence and targeted reruns
---

> **Pipeline position:** Stage `5H` of the **Automation Pipeline** — sits between Stage `5A` (Automation Execution) and Stage `6A` (Reporting). **Optional and opt-in only** (`workflows_and_pipelines/pipeline/pipeline.md` §3.6).
> **Traceability:** `Execution Result (Automation Failure) → Diagnosis → Repair Strategy → Repair Confidence Report → Applied Repair → Targeted Rerun → Automation Repaired | Remaining | Quarantined`.
> **Branch:** Automation only. This skill never touches a Manual Execution artifact (§3.3), and the Manual branch never invokes it.
>
> **Origin note:** this skill absorbs the **Automation Repair Loop, Repair Strategy Decision Engine, Repair Confidence Engine, and Automation Repair Knowledge Base** that were previously §25–§28 of `automation-execution-skill/SKILL.md`. Those sections are removed there and live here, and nowhere else — there is exactly one repair engine in the platform, so there is no boundary to police between a "tactical" and a "strategic" repairer. Stage `5A` reverted to a pure mechanical runner as a result.

# 1. Skill Name

**Self-Healing skill** — v1

# 2. Purpose

The Self-Healing skill exists to answer one question, with evidence: **when generated automation fails, is the automation wrong — and if so, what is the smallest correct change that makes it right?**

It applies reasoning to `Automation Failure` results from Stage `5A`, proposes repair strategies grounded in cited evidence and prior confirmed repairs, applies only human-approved repairs, reruns only the affected tests, and records what actually worked so the platform does not rediscover the same fix by failing again.

**Its value is reasoning quality, not throughput.** A repair applied on a guess is worse than no repair: it consumes an approval, mutates reviewed code, and — if it happens to make a test pass for the wrong reason — destroys the signal the test existed to provide. This skill is therefore built to *decline* to repair more readily than to attempt one (§7, §8).

## 2.1 What this skill must never do

Three prohibitions define this skill more sharply than its capabilities do:

1. **Never heal an application defect.** A test failing because the application is genuinely broken must never be modified to stop failing (§8). This is the single failure mode that would turn the platform from a defect-detection system into a defect-concealment system.
2. **Never run automatically.** No failing execution, and no orchestrator, may invoke this skill (§6). A human asks, or it does not run.
3. **Never repair on low confidence.** Below a High root-cause confidence, the only permitted action is *diagnosis* — gathering evidence, changing nothing (§7.1).

# 3. Responsibilities

- **Accept only `Automation Failure` as repair scope** (§5) — and refuse `Application Failure` categorically, `Environment`/`Infrastructure`/`Configuration Failure` as out of scope, and `Inconclusive` unless a human explicitly admits it to a diagnosis pass.
- **Consult the shared Repair KB and Selector Verification KB before deriving anything new** (§10, `pipeline.md` §10.8) — a confirmed prior repair is a candidate strategy citing its Rule ID, never re-derived from scratch.
- **Establish Root Cause Confidence before proposing any repair** (§7.1) — and propose diagnosis rather than repair at Medium or Low.
- **Enumerate 2–4 named strategies per failure, never one** (§7.2) — each with pros, regression risk, and an evidence-derived confidence percentage.
- **Produce a Repair Confidence Report per selected strategy** (§9) — every percentage built additively from cited evidence factors, never a round number that felt right.
- **Ask exactly once, for the whole batch** (§6.2, `pipeline.md` §5.6) — never once per test case.
- **Apply only approved repairs, to automation code only** (§11) — never to test cases, Project Context, Discovery artifacts, or the application.
- **Rerun only the affected tests** (§12) — never the full suite unless every test in it was repaired.
- **Produce a Before/After Comparison** (§13) distinguishing Fixed, Remaining, and New failures — a repair that introduced a regression is reported as such, never buried.
- **Label a repaired pass `Automation Repaired`, never `Passed`** (§13) — so no reader mistakes a fixed test for a clean first attempt.
- **Quarantine rather than repair indefinitely** (§14) — a test repaired and re-failed across the configured attempt limit is withdrawn with its history, not patched a third time.
- **Write confirmed repairs only** (§10.2) — a repair that did not work contributes nothing to the KB, however plausible its reasoning was.
- **Re-enter the Automation Approval gate before any re-merge** (§15) — Stage `4A`'s approval does not cover code this skill changed.
- **Be scoped by the invocation** (§4.1) — a healing pass named for `Login` touches nothing outside `Login`.

# 4. Inputs

| Input | Role | Required? | Description |
|---|---|---|---|
| Execution Results | **Primary** | Required | `platform_core_data/runs/{{RUN_FOLDER}}/execution/ExecutionResults.md` — with full Result Classification and Evidence Inventory. At least one `Automation Failure` must be present, or there is nothing to heal (§16). |
| Automation Suite | **Primary** | Required | `platform_core_data/runs/{{RUN_FOLDER}}/automation/tests_{Framework}/` — the run's working copy. **Never the baseline directly** (`pipeline.md` §12.3). |
| Project Context | Governing | Required, must be `Approved` | Target environment, credentials, safety constraints governing the rerun. |
| Repair KB | Secondary | Optional (read) | Platform `repair_patterns/`, `diagnosis_patterns/`, `reasoning/` + prior runs' Repair Summaries (`pipeline.md` §10.8). Absent means no prior art — reasoning proceeds from evidence alone, and every strategy's confidence is capped accordingly (§9.2). |
| Selector Verification KB | Secondary | Optional (read) | `knowledge_base/browser/screens/`, `.../components/` — verified locators with their code-state anchors (`pipeline.md` §10.8). |
| Healing Scope | Governing | Optional | The modules/test IDs this pass covers. Absent = every `Automation Failure` in the Execution Results. |

**This skill must never read the PRD** (`pipeline.md` §6 Rule 4). A test whose *expected result* appears wrong is a Test Design discrepancy to disclose (§8.3), never a reason to consult requirements directly.

**It never reads a Manual Execution artifact.** Branch isolation (`pipeline.md` §3.3) is not relaxed for repair: a manual pass or failure is not evidence about automation correctness.

## 4.1 Scope discipline

A healing pass is bounded by its invocation and reports its own bounds:

- **Scoped invocation** (`/self-healing-skill Login, Agency`) — only failures in those modules are analysed. Failures outside are listed, untouched, under *Out of Scope for This Pass*, so an unscoped failure is never mistaken for a resolved one.
- **Unscoped invocation** (`/self-healing-skill`) — every `Automation Failure` in the Execution Results is analysed.
- **Scope never widens mid-pass.** Discovering that a `Login` repair would also fix an `Agency` test does not authorize touching `Agency`; it is recorded as a recommendation for a later pass.

# 5. Eligibility — what may be healed

Stage `5A` classifies every result by *cause*. That classification is this skill's gate, and it is applied before any reasoning begins:

| Stage `5A` Classification | Eligible? | Why |
|---|---|---|
| **Automation Failure** | **Yes** — the only eligible class | The automation itself is at fault: a stale locator, a missing wait, a bad setup assumption. Fixing it is this skill's entire purpose. |
| **Application Failure** | **Never** (§8) | The application is genuinely broken. The test is correctly reporting a defect. "Healing" it would suppress a real finding. |
| **Environment Failure** | No | A target environment problem. The fix is to the environment, not the code. Reported, not healed. |
| **Infrastructure Failure** | No | The execution infrastructure failed (runner, container, network). Not an automation defect. |
| **Configuration Failure** | No | Misconfiguration (credentials, base URL, profile). Corrected in configuration, not by patching tests. |
| **Inconclusive** | **Diagnosis only, by explicit human choice** | The cause is not yet known to be automation-side. It may be admitted to a *diagnosis* pass to establish cause; it is never admitted to a *repair* pass by default. |
| **Flaky** | Diagnosis first, then repair if automation-side | Non-determinism is often a genuine automation defect (a race, a missing wait), but the root cause must be established before a repair — a "fix" that merely lowers failure frequency is not a fix (§14.1). |

**A misclassification discovered mid-pass is corrected, not worked around.** If reasoning establishes that a failure labelled `Automation Failure` is in fact any other class, this skill stops work on that test, records the reclassification with its evidence, and reports it — even where the batch containing it was already approved (§8.2).

# 6. Invocation — opt-in, never automatic

## 6.1 The trigger is a human, always

This skill has **no auto-trigger**. Specifically:

- A Stage `5A` execution producing `Automation Failure` results does **not** invoke it.
- No orchestrator may chain into it, and "the previous stage finished with failures" is never authorization (`pipeline.md` §4.1 note, §3.6).
- A prior healing pass does not schedule the next one.

It runs when a human issues `/self-healing-skill`, optionally with scope. That is the only entry point.

**Why it is opt-in.** Healing costs a human approval and mutates reviewed code. Many failing runs should not be healed at all — the right response to a red suite is often to fix the application, fix the environment, or accept the finding. A stage that ran automatically would apply repair pressure to every failure regardless of which of those was true, and the most common outcome of automatic healing is a green suite that no longer tests anything.

## 6.2 The gate — asked once per pass

Per `pipeline.md` §5.6.2, after presenting every analysed failure together:

```
Self-Healing — {N} Automation Failures analysed, {R} repairs proposed, {D} need diagnosis first
Scope: {modules or "all failures"}

  {module}  {TC-ID}  {root cause, one line}   confidence {NN}%  risk {Low|Med|High}
  ...

  Out of scope for this pass:  {IDs, if any}
  Not eligible:                {IDs + classification, per §5}

Proceed?
  1. Apply proposed repairs and rerun only affected tests
  2. Diagnose only — gather evidence, change no code
  3. Mark as Known Automation Issue (no change, recorded)
  4. Skip — leave results exactly as Stage 5A reported them
```

- **One question per pass, never per test case.** A 14-failure suite produces one question. Per-case prompting reliably trains a reviewer to approve without reading, which is worse than not asking.
- **Silence is not approval.** No code changes until this is answered.
- **Approval covers the listed batch only.** A repair discovered mid-pass that was not presented requires returning to this gate.
- The Repair Strategy selection question (§7.3) may be asked in the same exchange, but is a distinct decision and is never inferred from this one.

# 7. Repair Reasoning Engine

## 7.1 Root Cause Confidence gate — diagnosis is not repair

**Before enumerating any strategy**, classify Root Cause Confidence for that specific failure, and always state which state it is in — so a human always knows whether this skill is trying to *understand* the problem or *fix* it:

| Confidence | Meaning | Permitted action |
|---|---|---|
| **High** | The evidence directly and unambiguously explains the failure. No material open question about *why*. | Proceed to Repair Strategies (§7.2). |
| **Medium** | Part of the picture is confirmed, but a real open question remains. A repair now would be a guess with unclear odds. | **Diagnosis Strategy first.** Do not modify automation on a Medium-confidence guess. |
| **Low** | The evidence does not meaningfully explain the failure. | **Diagnosis only. Never propose or apply a repair.** |

**Diagnosis and Repair strategies are never ranked in the same list.** They answer different questions and use different criteria — a diagnosis step has no "regression risk" and no "fixes the test" outcome. Present them as two clearly separated categories:

- **Diagnosis Strategies** (evidence-gathering; no code or state change): capture DOM snapshot, console log, network log, page source, screenshot at failure point, re-run once with tracing enabled to observe timing.
- **Repair Strategies** (an actual code change): update a locator, add or correct synchronization, correct a setup/precondition step, replace a brittle selector, refactor a Page Object method, correct navigation.

**Diagnosis needs no approval gate** (`pipeline.md` §5.6.3) — it changes no code and no application state. When diagnosis raises confidence to High, this skill loops back to §7.2 automatically and the *resulting repair* passes the §6.2 gate normally.

## 7.2 Strategy enumeration — never a single option

For each eligible failure, list **2–4 named strategies**:

```
Option {A|B|C}
{Strategy name}

Pros
{brief}

Risk
{Low | Medium | High} — the regression risk this specific strategy introduces

Confidence
{percentage — derived per §9.2, never invented}

Basis
{cited evidence, and/or Repair KB Rule ID + confirmation count, and/or
 Selector Verification KB record}
```

- **A matching confirmed Repair KB rule is always included as an option**, citing its Rule ID and confirmation count. It does not automatically win, and it is never silently omitted.
- **A Selector Verification KB record is preferred over a freshly-guessed locator** — a locator already confirmed against this application is stronger evidence than a plausible-looking new one. Where its code-state anchor shows drift, it is re-verified live before being proposed (`pipeline.md` §10.8 rule 3).
- **"No repairable strategy exists" is a valid, reportable outcome.** A failure with no sound strategy, or where every candidate is low-confidence, is reported in full — never silently dropped, and never given a weak repair to avoid an empty result.

## 7.3 Strategy selection

After every failure's options are listed, ask once, for the whole batch:

```
Which repair strategy should be used?
  1. Highest confidence
  2. Lowest regression risk
  3. Fastest to apply
  4. Custom (specify per failure)
  5. Let the platform recommend
```

- Options 1–3 apply mechanically per failure — no further per-case back-and-forth.
- **Custom:** the human names the option, possibly differing per failure; follow-up questions only where their instruction is genuinely ambiguous for a specific failure.
- **Let the platform recommend:** this skill selects per failure and states, in one line, why (e.g. "Option A — highest confidence and lowest risk; no tradeoff to weigh").

# 8. The Application-Defect Prohibition

**This is the most important rule in this skill.** A test that fails because the application is genuinely broken must never be modified to stop failing.

## 8.1 What is never a valid repair

Regardless of confidence, approval, or how green it would make the suite:

- **Weakening an assertion** — loosening an expected value, comparing a substring instead of the value, asserting "not empty" instead of the actual expected content.
- **Removing an assertion** or the step that produces it.
- **Adding a conditional skip, try/catch swallow, or tolerance** so a genuinely failing behaviour passes or is not evaluated.
- **Widening an expected value** to include the observed-but-wrong value.
- **Increasing a timeout so an operation that never completes correctly appears to.** (Adding a *correct* wait for an operation that does complete is a legitimate synchronization repair — the distinction is whether the awaited state is the correct one.)
- **Marking a failing test skipped/pending** to remove it from the failure count. A test withdrawn from healing is *quarantined and recorded* (§14), never silently disabled.

**The line, stated once:** a repair may change **how the test interacts with the application** — locators, waits, setup, navigation, data preparation. It may never change **what the test asserts to be correct**. The first is automation mechanics; the second is the requirement, which belongs to Stage 3 and the approved Project Context.

## 8.2 On discovering a genuine application defect mid-pass

When reasoning establishes that an `Automation Failure` is in fact an `Application Failure`:

1. **Stop work on that test immediately** — even if a repair would make it pass, and even if the batch containing it was already approved. Batch approval covers repairing automation defects, never suppressing application defects.
2. **Reclassify it** to `Application Failure`, with the evidence that established the reclassification.
3. **Report it as a defect finding**, so it reaches the Stage `6A` Final QA Report as a real result rather than disappearing into a repair record.
4. **Record the reclassification in the Repair Summary**, including that a repair was considered and deliberately not applied. A reader must be able to see the decision was made, not merely that nothing happened.

## 8.3 On a genuine disagreement with the test case

Where a repair would require changing an assertion's *expected value* to match observed behaviour, the automation and the approved Manual Test Suite disagree about what is correct. That is neither an automation defect nor necessarily an application defect — it is a **documentation discrepancy**, and this skill:

- Does **not** edit the automation's assertion to match the application.
- Does **not** edit the Manual Test Suite (it has no write access to Stage 3 artifacts, §17).
- **Discloses the discrepancy** in the Repair Summary, naming both sides and the evidence, for a human to resolve at Stage 3.

# 9. Repair Confidence Engine

Every proposed repair, once its strategy is selected, is presented as a structured report — never a bare "fixed" or "probably fixed."

## 9.1 Report format

```
Repair Confidence Report

Test Case:            {Test Case ID}
Automation Script:    {Script ID / path}
Classification:       {Automation Failure | Inconclusive (pre-repair, diagnosis-admitted)}
Root Cause Confidence:{High | Medium | Low}   (§7.1)

Root Cause:
{one line, evidence-backed}

Proposed Repair:
{one line describing the code change}

Confidence:
{percentage}

Reasoning:
- {evidence-based factor, with its citation}
- {...}

Regression Risk:
{Low | Medium | High} — brief reason

Evidence:
{before-state reference} / {after-state reference, or "pending rerun"}
```

## 9.2 Deriving confidence — additive, cited, never invented

Confidence is built additively from **only** these observed-evidence factors, and every contributing factor must appear in Reasoning:

| Factor | Contribution | Requires |
|---|---|---|
| Root cause directly observed (log timestamp, stack trace, screenshot, DOM snapshot) rather than inferred | Base 40–60% | The specific evidence artifact is cited |
| The repair directly targets that observed root cause (not an adjacent or speculative one) | +10–15% | The causal link is stated, not assumed |
| The failure reproduced more than once with the same signature | +10% | Cite the occurrences |
| A confirmed Repair KB rule matches this exact pattern | +15%, scaling with the rule's confirmation count | Cite Rule ID + confirmation count |
| A Selector Verification KB record supplies the replacement locator, re-verified live | +10% | Cite the record and its verification timestamp |
| The fix is statically verified (compiles / lints clean) before rerun | +5% | Cite the check performed |
| Novel pattern, no prior confirmation anywhere | **Capped at 60%** regardless of other factors | — |

- **No report is issued above 95% before the repair is actually rerun and confirmed.** The pre-rerun number is a *proposed* confidence; the Evidence field distinguishes it from the confirmed outcome (§13).
- **A percentage with no cited factors is not a confidence value.** If the factors above cannot be evidenced, the honest output is a low number with its reason, or a Diagnosis Strategy instead (§7.1).

# 10. Shared Repair Knowledge Base

Per `pipeline.md` §10.8, the Repair KB is **shared across both pipelines** — Stage `4A` reads it to pre-empt known failure modes at generation time, Stage `4M` reads it to recognize a known quirk during manual execution, and **this skill is its sole writer**.

- **This run's record (always written):** the Repair Summary in `platform_core_data/runs/{{RUN_FOLDER}}/self_healing/` — the full per-pass narrative of what failed, what was considered, what was applied, and what happened.
- **Platform Knowledge (read always; written only via Promotion):** `platform_core_data/knowledge_base/patterns/repair_patterns/REPAIR-{NNN}.md`, `.../diagnosis_patterns/`, `.../reasoning/REASON-{NNN}.md`.

## 10.1 Read rule — consult before deriving

Before proposing any strategy: check Platform `repair_patterns/`, `diagnosis_patterns/`, and `reasoning/`, then this project's prior-run Repair Summaries under `platform_core_data/runs/*/self_healing/` (and, for runs predating this stage, `runs/*/execution/`). A match is included as a candidate option citing its ID (§7.2).

## 10.2 Write rule — confirmed repairs only

**A rule is written at exactly one point: after the targeted rerun, for a test in the Fixed column (§13).** Never for a proposed-but-unapplied repair, never for one that stayed in Remaining Failures, never for one that introduced a New Failure.

**"Do not learn from failed repairs" is absolute.** A repair that looked high-confidence and still did not work contributes nothing, however plausible its reasoning was. Recording it would poison the KB with a pattern that reads as confirmed.

## 10.3 Recording, and Promotion to Platform Knowledge

Each confirmed repair is recorded in this run's Repair Summary:

```
Implements Platform Pattern:  {REPAIR-{NNN} / REASON-{NNN}, or "none yet"}
Execution Context:            {Execution ID(s), suite, Test Case ID(s)}
What Happened:                {the failure pattern addressed and the fix that worked}
```

Then, when the pattern is genuinely reusable beyond this application (a synchronization strategy, a locator-recovery technique, a framework-level hazard — never an app-specific behaviour), propose Promotion per `pipeline.md` §10.5, asking exactly once:

> "This lesson looks application-independent. Promote it to Platform Knowledge?"

**Promotion is the only mechanism for cross-run repair memory** at the Platform layer, so the judgment is real: a genuinely reusable pattern left unpromoted will be rediscovered the hard way. If approved:

```
ID:                    REPAIR-{NNN}  (or REASON-{NNN} for a reasoning/process pattern)
Problem:               {failure pattern, generalized beyond this project/test case}
Strategy:              {the fix that worked, generalized}
Applicable Conditions: {what kind of test/flow/framework this generalizes to}
Confidence:            Confirmed by {N} execution(s), across {M} project(s)
Confirmed In:          {run folder(s) + Execution ID(s) backing this}
```

A later run confirming the same pattern **increments its count and appends its run reference** — it never creates a duplicate Platform document, and the per-execution narrative stays in that run's Repair Summary.

## 10.4 Explainability

Every recorded repair and Platform rule must be independently reviewable: a human reading one entry, with no other context, can tell what problem it solves, what fix worked, where it generalizes, and which real executions back it. A Platform-layer rule must be reviewable *without* opening the run it came from. A rule that cannot be explained this plainly is not ready to be written.

# 11. Repair Scope — what may be modified

If the human approves repairs:

1. **Modify only the automation suite's own files** — the specific Page Objects, locators, wait logic, setup helpers, or assertion *mechanics* responsible for the diagnosed issue, in the **run's working copy** (`platform_core_data/runs/{{RUN_FOLDER}}/automation/`), never the baseline directly (`pipeline.md` §12.3).
2. **Never modify approved Manual Test Cases.** A corrected value inside the automation is not an amendment to the test case document; where they disagree, disclose it (§8.3).
3. **Never modify Discovery artifacts.** A repair may *reveal* something Discovery should re-verify — that is a recommendation in the Before/After report, never an in-place edit.
4. **Never modify the Project Context, PRD, Traceability Matrix, Coverage Report, or any Stage 1–3 artifact.**
5. **Never modify the application under test**, its configuration, or its data beyond what an approved test's own steps legitimately do.
6. **Never modify a Manual branch artifact** (`pipeline.md` §3.3).
7. **Stay inside the healing scope** (§4.1).

# 12. Targeted Rerun

- **Rerun only the repaired tests** — never the full suite, unless every test in it was repaired. A full-suite rerun after a two-test repair wastes environment time and obscures which change caused which outcome.
- **Confirm the target environment against the Project Context before rerunning anything** — the same environment-match discipline every execution-capable stage applies.
- **Run headless** through the Playwright MCP server, consistent with the Automation branch (`pipeline.md` §3.4).
- **Never execute a mutating action against an environment the Project Context has not marked safe for it.**
- **Capture the same evidence classes Stage `5A` captures**, so a before/after comparison is genuinely comparable rather than comparing rich evidence against thin evidence.

# 13. Before/After Comparison

After the targeted rerun, produce a comparison covering every repaired test:

| Column | Meaning |
|---|---|
| **Fixed** | Repaired and now passing. Labelled **`Automation Repaired`**, never `Passed` — so a reviewer and the Stage `6A` report can always see this result required a fix. |
| **Remaining Failures** | Repaired but still failing — the fix did not resolve it, or surfaced a different issue. |
| **New Failures** | Passed before the repair, fails after it — a regression introduced by the repair itself. |
| **Reclassified** | Established mid-pass as a non-automation failure (§8.2) — repair deliberately not applied. |
| **Quarantined** | Withdrawn from further healing per §14. |

Each row carries its Root Cause and Confidence from §9, **updated with the actual rerun outcome** rather than left at the proposed value.

**A New Failure is never presented as a net win.** "8 fixed, 1 newly broken" is reported as exactly that, with the regression's detail in full — never summarized as "8 tests fixed."

For every test in **Fixed**, write the confirmed repair per §10.2–§10.3. Nothing in Remaining, New, Reclassified, or Quarantined is written to the KB.

# 14. Quarantine — bounded healing attempts

**A test is not repaired indefinitely.** Each test carries a repair-attempt count across healing passes within the run (and, where lineage exists, across the runs it inherits from). When a test has been repaired and failed again across the configured attempt limit — **default 2 prior attempts, so the third failure quarantines it** — it is moved to the Quarantine Register instead of being repaired again.

The Quarantine Register records, per test: Test Case ID, Automation Script ID, every attempt's strategy/confidence/outcome, the current classification, and a recommendation (redesign the test, re-verify with Discovery, investigate application stability, or accept as Known Automation Issue).

**Quarantine is not deletion and not a skip.** The test remains in the suite and remains reported; it is withdrawn from *automated repair*, with its history intact, and referred to a human. A test needing perpetual healing is evidence about the test's design or the application's stability that another patch will not address — continuing to patch it manufactures a green suite and hides that evidence.

## 14.1 Flakiness is diagnosed, not smoothed

A `Flaky` result is a genuine automation defect more often than not (a race, a missing wait, order dependence, shared state). It is diagnosed to root cause before any repair. **Reducing failure frequency is not a repair** — adding a retry or lengthening a timeout so a race loses less often leaves the defect in place and removes the signal that it exists. Where the root cause cannot be established, the honest outcome is a diagnosis record and, on repetition, quarantine.

# 15. Re-approval Before Re-merge

**Stage `4A`'s Automation Approval does not cover code this skill changed** (`pipeline.md` §5.2). Once repairs are applied:

1. The repaired suite is marked `Pending Automation Approval`.
2. It is reviewed against the §5.2 `5H` criteria: each repair matches its approved strategy; no `Application Failure` was healed into silence (§8); the Before/After comparison including any New Failure; quarantined tests recorded rather than deleted.
3. **Only after that approval** may it merge to the Workspace Automation Baseline (`pipeline.md` §12.4) or project into the Target Project (§13.3).

Treating the original approval as still covering repaired code is the most likely path by which unreviewed code reaches a real environment.

# 16. Stop Conditions

| Condition | Scope | Required Action |
|---|---|---|
| **No Execution Results** | Global | Halt — there is nothing to analyse. Recommend running Stage `5A` first. |
| **No `Automation Failure` in the results** | Global | Halt, and report it as a *success*, not a gap: there is nothing to heal. Never manufacture work by widening into other classifications (§5). |
| **Every candidate failure is `Application Failure`** | Global | Halt healing and report the defects (§8.2). This is the correct outcome, not a failed pass. |
| **Automation Suite missing** | Global | Halt — there is no code to repair. Recommend confirming Stage `4A` output exists. |
| **Environment unavailable for the rerun** | Global | Apply no repair. A repair that cannot be verified by rerun is not confirmed, and must not be presented as such. Report and recommend retrying when the environment is available. |
| **Root Cause Confidence Low** | Local — that failure only | Diagnosis only (§7.1). Continue with other failures. |
| **Repair attempt limit reached** | Local — that test only | Quarantine (§14). Continue with other failures. |
| **A repair would require changing an assertion's expected value** | Local — that test only | Disclose as a documentation discrepancy (§8.3); apply nothing. Continue with other failures. |

**Local conditions never halt the whole pass** — every unaffected failure continues to be analysed, consistent with every other execution-capable stage in this pipeline.

# 17. Allowed Tools

- **Playwright MCP server (headless)** — for diagnosis evidence (DOM snapshots, console/network capture, screenshots) and targeted reruns. A credential value is **never** typed into an MCP tool call; authenticate per the platform's credential contract, then act against that session.
- **File tools:** Read (Execution Results, Automation Suite, Project Context, both KBs, prior Repair Summaries), Write (Repair Summary, Before/After Comparison, Quarantine Register, repaired automation files in the run's working copy, Repair KB entries per §10.2).

**Not permitted:** editing any Stage 1–3 artifact (Project Context, PRD, Discovery, Test Suite, Traceability Matrix, Coverage Report) · editing any Manual branch artifact · editing the Workspace Automation Baseline directly · writing to the Selector Verification KB (Stage `4A` is its sole writer, `pipeline.md` §10.8 rule 1) · merging to the baseline or projecting into the Target Project before fresh Automation Approval (§15) · running the full suite when only a subset was repaired (§12) · modifying the application under test.

# 18. Expected Artifacts

| Artifact | Path | Template |
|---|---|---|
| Repair Summary | `platform_core_data/runs/{{RUN_FOLDER}}/self_healing/RepairSummary.md` | [`stage_5h_self_healing/RepairSummary.md`](../../../platform_core/templates/stage_5h_self_healing/RepairSummary.md) |
| Repair Confidence Report *(block, embedded per failure)* | within the Repair Summary | [`stage_5h_self_healing/RepairConfidenceReport.md`](../../../platform_core/templates/stage_5h_self_healing/RepairConfidenceReport.md) |
| Before/After Comparison | `platform_core_data/runs/{{RUN_FOLDER}}/self_healing/BeforeAfterComparison.md` | [`stage_5h_self_healing/BeforeAfterComparison.md`](../../../platform_core/templates/stage_5h_self_healing/BeforeAfterComparison.md) |
| Quarantine Register | `platform_core_data/runs/{{RUN_FOLDER}}/self_healing/QuarantineRegister.md` | [`stage_5h_self_healing/QuarantineRegister.md`](../../../platform_core/templates/stage_5h_self_healing/QuarantineRegister.md) |
| Repaired automation suite | `platform_core_data/runs/{{RUN_FOLDER}}/automation/tests_{Framework}/` | — (code, not a document) |

**Every artifact's document structure is defined by its template**; render by copying the template and filling `{{PLACEHOLDER}}` tokens. Section order is mandatory and inline `<!-- -->` guidance is stripped from rendered output.

# 19. Standard Output Contract

The Repair Summary must contain exactly these sections, so Stage `6A` never has to interpret prose:

| # | Section | Must contain, at minimum |
|---|---|---|
| 1 | **Healing Metadata** | Healing Pass ID, Run Folder, source Execution ID(s), scope (§4.1), environment, timestamps, invocation path and any run-scoped instruction |
| 2 | **Eligibility Summary** | Per §5: how many failures of each classification were present, which were eligible, which were excluded and why, which were out of scope for this pass |
| 3 | **Per-Failure Analysis** | Per eligible failure: Root Cause Confidence (§7.1), Diagnosis and/or Repair strategies enumerated (§7.2), strategy selected and by which rule (§7.3), full Repair Confidence Report (§9.1) |
| 4 | **Applied Repairs** | Exactly which files changed, per test, and the nature of each change — reviewable without reading a diff |
| 5 | **Rerun Outcome** | The Before/After Comparison's figures, cross-referenced to the standalone artifact (§13) |
| 6 | **Reclassifications** | Every failure established as non-automation (§8.2), with evidence, and the explicit note that a repair was considered and not applied |
| 7 | **Disclosed Discrepancies** | Every automation-vs-test-case disagreement (§8.3), naming both sides |
| 8 | **Quarantine** | Tests withdrawn this pass and why, cross-referenced to the Register (§14) |
| 9 | **Knowledge Recorded** | Confirmed repairs written (§10.2–§10.3), and every Promotion proposed with its outcome |
| 10 | **Health Impact** | Automation Health before vs. after. **Application Health must be reported as unchanged by healing** — if it moved, a repair suppressed a real defect and that is a §8 violation to investigate, not a result to report |
| 11 | **Recommendations** | Smallest corrective action per Remaining/New/Quarantined item |
| 12 | **Approval Status** | That the repaired suite is `Pending Automation Approval` and may not merge until it clears (§15) |

# 20. Execution Rules

1. **Must never run automatically** — human invocation only (§6.1).
2. **Must accept only `Automation Failure` as repair scope** (§5), and never repair an `Application Failure` (§8).
3. **Must stop, reclassify, and report** on discovering a genuine application defect mid-pass — even inside an approved batch (§8.2).
4. **Must never weaken, remove, widen, or skip an assertion** to make a failing behaviour pass (§8.1).
5. **Must establish Root Cause Confidence before proposing a repair**, and propose diagnosis only at Medium or Low (§7.1).
6. **Must enumerate 2–4 strategies per failure, never one** (§7.2).
7. **Must consult the Repair KB and Selector Verification KB before deriving a new strategy** (§10.1).
8. **Must derive every confidence percentage additively from cited evidence** (§9.2) — never an invented number.
9. **Must ask once per batch, never per test case** (§6.2), and must not proceed on silence.
10. **Must treat approval as covering the presented batch only** (§6.2).
11. **Must modify automation code only, in the run's working copy** (§11) — never a Stage 1–3 artifact, a Manual branch artifact, the baseline directly, or the application.
12. **Must rerun only the affected tests** (§12).
13. **Must label a repaired pass `Automation Repaired`, never `Passed`** (§13).
14. **Must report New Failures explicitly**, never nett them off against fixes (§13).
15. **Must quarantine at the attempt limit rather than repair again** (§14), and must never silently skip or disable a test.
16. **Must diagnose flakiness to root cause** rather than reduce its frequency (§14.1).
17. **Must write only confirmed repairs to the KB** (§10.2).
18. **Must obtain fresh Automation Approval before any re-merge** (§15).
19. **Must stay within the invoked healing scope** (§4.1).
20. **Must never read the PRD** (`pipeline.md` §6 Rule 4) or any Manual Execution artifact (§3.3).
21. **Must report "nothing to heal" as a success**, never widen scope to manufacture work (§16).
22. **Must continue on Local stop conditions** rather than halting the whole pass (§16).

# 21. Operational Contract

Role: evidence-grounded repair reasoning over automation failures, and the platform's sole owner of repair knowledge (Stage `5H`, optional).

Analyse `Automation Failure` results, propose strategies with derived confidence, apply only human-approved repairs to automation code, rerun only what changed, and record only what actually worked. Execution is fully specified above — §4 (Inputs), §5 (Eligibility), §6 (Opt-in invocation and the batch gate), §7 (Reasoning Engine), §8 (Application-Defect Prohibition), §9 (Confidence Engine), §10 (Shared Repair KB), §11 (Repair Scope), §12 (Targeted Rerun), §13 (Before/After), §14 (Quarantine), §15 (Re-approval), §16 (Stop Conditions), §17 (Tools), §18–§19 (Artifacts and Output Contract), §20 (Execution Rules). This section adds no rules of its own.

# 22. Architecture Principle

> Agents communicate through artifacts only. Each has a single responsibility. Every output becomes the input of another whenever applicable.

For this skill: its single responsibility is **reasoning about why automation failed and what fix is actually justified** — never running the suite for the first time (Stage `5A`), never generating it (Stage `4A`), never executing manual test cases (Stage `4M`), and never deciding what the application should do (Stage 1). Its outputs feed Stage `6A`'s report and the shared Repair KB, which both branches then read.

# 23. Example Execution

*Illustrative only — not executed as part of this task.*

```text
Invocation:  /self-healing-skill Login
Input:       runs/{{RUN_FOLDER}}/execution/ExecutionResults.md
             runs/{{RUN_FOLDER}}/automation/tests_Playwright/
```

Hypothetical pass: the Execution Results carry 6 failures — 4 `Automation Failure`, 1 `Application Failure`, 1 `Environment Failure`. Scope `Login` covers 3 of the 4 automation failures; the fourth (`Agency`) is listed Out of Scope, untouched.

`TC-LOGIN-004`: the submit button's locator no longer resolves. The Selector Verification KB holds a confirmed locator for that control from an earlier run; its code-state anchor shows drift, so it is re-verified live and confirms. Root cause directly observed → confidence 85%, risk Low. `TC-LOGIN-007`: a race between navigation and assertion, reproduced twice with the same signature, and Repair KB rule `REPAIR-003` matches → confidence 88%. `TC-LOGIN-009`: evidence shows only a generic timeout with no identifiable cause → Root Cause Confidence **Low**, so **diagnosis only** is proposed, no repair.

The human approves option 1 with "highest confidence." The two repairs are applied and only those two tests rerun: `TC-LOGIN-004` passes (labelled `Automation Repaired`), `TC-LOGIN-007` still fails and stays in Remaining Failures. Only `TC-LOGIN-004`'s repair is written to the KB; `REPAIR-003`'s confirmation count is *not* incremented, because the repair citing it did not work.

The `Application Failure` is reported as a defect and never healed (§8). Application Health is unchanged by the pass; Automation Health improves by one test. The repaired suite is marked `Pending Automation Approval` and cannot merge until it clears (§15).

# 24. Direct Invocation

This skill is **only** ever directly invoked — it has no pipeline-driven entry point (§6.1). Full rules: `pipeline.md` §5.3.1.

- **Forms:** `/self-healing-skill` (every eligible failure) · `/self-healing-skill Login, Agency` (module scope) · `/self-healing-skill TC-LOGIN-004..009` (test-ID scope) · `/self-healing-skill diagnose only` (evidence gathering, no repair proposal).
- **Instruction prompts are run-scoped, never spec-overriding** (§5.3.1 #3). An instruction may narrow scope, prefer a strategy axis, or restrict to diagnosis. It never authorizes repairing an `Application Failure` (§8), weakening an assertion (§8.1), skipping the batch gate (§6.2), repairing at Low confidence (§7.1), exceeding the attempt limit (§14), re-merging without approval (§15), or reading the PRD.
- **Upstream `Pending Review` → request approval, then recommend** (§5.3.1 #4).
- **Missing upstream → run degraded, declare the gap** (§5.3.1 #5):
  - *No Execution Results:* halt — nothing to analyse (§16).
  - *No Automation Suite:* halt — no code to repair.
  - *No Project Context:* diagnosis only, and no rerun, unless the environment and credentials are supplied in the invocation. Record the basis as `Open Question — Requires Stage 1`.
  - *No Repair KB / Selector Verification KB:* proceed from evidence alone; cap every novel-pattern confidence at 60% (§9.2) and state that no prior art was available.
- **Closing message must recommend the next step** (§5.3.1 #6):

```
Stage 5H complete — Repair Summary → repaired suite Pending Automation Approval
  platform_core_data/runs/{{RUN_FOLDER}}/self_healing/RepairSummary.md
  {F} Repaired | {R} Remaining | {N} New failures | {Q} Quarantined | {D} Diagnosis only
  Application Health: unchanged   Automation Health: {before} → {after}

Next step — either:
  1. Approve the repaired suite:   "approved"  →  merge to baseline, then /reporting-skill
  2. Heal another module:          /self-healing-skill {module}
  3. Report as-is:                 /reporting-skill   (repairs remain unmerged)
```

# 25. Metrics

| Metric | Definition |
|---|---|
| **Healing Yield** | Fixed ÷ repairs attempted — how often an approved repair actually worked. |
| **Diagnosis Rate** | Failures routed to diagnosis ÷ eligible failures — how often evidence was insufficient to repair. A high rate is a signal about evidence capture in Stage `5A`, not a failure of this stage. |
| **Regression Rate** | New Failures ÷ repairs applied. **The metric to watch**: a rising value means repairs are causing damage. |
| **Confidence Calibration** | Mean proposed confidence of Fixed repairs vs. of Remaining ones. A well-calibrated engine separates them clearly; if it does not, §9.2's factors need review. |
| **KB Reuse Rate** | Repairs where a KB rule supplied the winning strategy ÷ total repairs — how much the platform is learning rather than rediscovering. |
| **Quarantine Rate** | Tests quarantined ÷ tests healed across the run's history. |
| **Reclassification Count** | Failures found to be non-automation (§8.2) — each one is a defect Stage `5A` mislabelled, worth feeding back into classification quality. |

# 26. Future Scalability

The reasoning model here is defined over *a classified failure with evidence*, not over "a browser," so it extends without structural change:

| Direction | How it fits |
|---|---|
| **API / Mobile / Desktop suites** | Strategy categories change (an API repair adjusts a payload or auth header; a mobile repair adjusts a gesture or an accessibility ID) but §7's confidence gate, §9's derivation, §8's prohibition, and §14's quarantine are unchanged. |
| **Performance suites** | A threshold breach is an `Application Failure` (genuinely slow) or an `Infrastructure Failure` (load generator) — §5 already routes both away from healing, which is the correct default. |
| **Larger suites / distributed runs** | Batch gating (§6.2) already scales: one question per pass regardless of failure count. Quarantine (§14) is what keeps a large suite from accumulating perpetually-healed tests. |
| **Cross-run trend reasoning** | Already supported by reading prior runs' Repair Summaries (§10.1) and the per-test attempt count (§14); richer trend analysis extends §25's metrics without changing any gate. |

**What would need to change, explicitly:** a new failure class in Stage `5A`'s classification would need an eligibility row in §5. Nothing else — §7–§15 are defined in terms of evidence and confidence, not technology.

# 27. Resolving `{{RUN_FOLDER}}`

Every path containing `{{RUN_FOLDER}}` resolves to the **active run**, recorded at
`platform_core_data/runs/current_active_run.json` (`workflows_and_pipelines/pipeline/run_manager.md` §5.7).

```bash
node platform_core/tools/run_manager/cli.js active   # -> the run folder to write into
node platform_core/tools/run_manager/cli.js list     # every run, newest first, active marked *
```

- **Never hand-pick, guess, or infer a run folder.** Resolve it from the pointer.
- **No active run → ask, never assume.** Never fall back to "the newest run" and never create one.
- **A pointer naming a missing folder → report it and stop.**
- **The pointer is sticky**, so a multi-stage session keeps writing into one run.
- **Switching runs is the human's call** (`cli.js use <run>`). This stage never rewrites the pointer.

This stage never creates a run. It heals the active run's automation and writes its records back into that same run.

## Inherited artifacts and code drift

A run may be a **refinement** of an earlier one (`run_manager.md` §5.9), carrying `metadata/lineage.json`.

```bash
node platform_core/tools/run_manager/cli.js drift          # what moved in the app since this run was anchored
node platform_core/tools/run_manager/cli.js drift --json    # exit 2 when not "unchanged"
```

**Drift matters more to this skill than to most**, because a repair's correctness depends on the application's current state:

- **A Selector Verification KB record whose anchor predates a `moved` drift is unverified** — re-verify it live before proposing it as a replacement locator, never trust it as-is (`pipeline.md` §10.8 rule 3).
- **A prior run's confirmed repair may no longer apply** where drift touches the same paths. Cite it as a candidate, state that it is unverified against current code, and let the live evidence decide.
- **`unknown-*` is not `unchanged`.** No anchor, no git, or an unresolvable ref all mean drift could not be computed — treat inherited repair knowledge as unverified rather than confirmed.
- **A repair-attempt count is inherited across lineage** (§14), so a test repeatedly healed across refinements reaches quarantine rather than resetting its budget each run.
