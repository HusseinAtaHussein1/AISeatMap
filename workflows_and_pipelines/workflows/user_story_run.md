> **Position:** A reusable workflow specification, layered on top of [`pipeline/pipeline.md`](../pipeline/pipeline.md), [`pipeline/run_manager.md`](../pipeline/run_manager.md), and [`pipeline/run_scope.md`](../pipeline/run_scope.md). It does not modify any of those documents, does not modify any Agent specification under [`.claude/skills/`](../../.claude/skills/), and does not change the platform's 7-stage architecture — it defines one specific, narrow-scoped *invocation* of Stages 3–7 against an already-existing Project Context and Discovery baseline.
> **Status:** Specification only. This document defines the workflow; it has not been executed, and no run, agent, or project artifact has been produced as part of authoring it.

# 1. Workflow Name

**User Story Run**

# 2. Purpose

This workflow takes a single, already-scoped User Story from requirement to a stakeholder-facing report — design, automate, execute, report — **without re-running Stage 1 (Project Context) or Stage 2 (Explorer)**, when an Approved Project Context and Approved Discovery Artifacts already exist and remain current for the module(s) the story touches.

It exists for the common case where a project has already been onboarded and explored at least once (e.g., via a prior Entire Project or First Run pass), and a new User Story arrives against that same, still-valid application surface — re-discovering the whole application for one story would be wasted, redundant work.

**This workflow does not decide, by itself, that Stages 1–2 don't need to run.** That determination is made by the existing Automation Start Decision Gate mechanism (`pipeline/pipeline.md` §5.4), applied here at Stage 3's entry point rather than Stage 4M's — see §4 Step 1.

# 3. Scope

| | |
|---|---|
| **Run Scope Type** | `User Story` (per `pipeline/run_scope.md` §3) |
| **Run Scope Source** | Whatever this story is supplied as — pasted text, a Markdown file under `platform_core_data/knowledge_base/requirements/user_stories/`, or (once integrated) a tracked work item ID (`pipeline/run_scope.md` §4) |
| **Module(s)** | Whatever module(s) the story's acceptance criteria touch — named explicitly in the story content, not assumed |

Only this story's acceptance criteria are in scope for Stage 3's test design (`.claude/skills/test-design-skill/SKILL.md` §16, "User Story" strategy: "narrowest and most literal... no broader wandering into adjacent feature coverage the story didn't ask for"). This workflow does not widen that scope.

# 4. Execution Flow

```
 1. Run Manager
      │
      ├─ Stage-State Check          (pipeline/pipeline.md §5.4, applied at this
      │                               workflow's entry point — Stage 3)
      │
      └─ [if Stages 1–2 Approved and current] Launch Stage 3
              │
              ▼
 2. Test Design Agent                [= Pipeline Stage 3]
      │  reuses existing project_context + discovery_artifacts (§5 below)
      │  ⛔ Human Review Required ⛔
              │ (approved)
              ▼
 3. Manual Execution Agent           [= Pipeline Stage 4M]
      │  ⛔ Human Review Required ⛔
              │ (approved)
              ▼
 4. Automation Agent                 [= Pipeline Stage 4A]
      │  ⛔ Automation Approval Required ⛔
              │ (approved)
              ▼
 5. Automation Execution Agent       [= Pipeline Stage 5A]
      │  (mechanical — no separate gate, per pipeline/pipeline.md §4 Stage 5A)
              ▼
 6. Reporting Agent                  [= Pipeline Stage 6A]
              │
              ▼
      Stop Workflow
```

## Step 1 — Run Manager & Stage-State Check

Before Stage 3 is invoked, the Run Manager performs the Automation Start Decision Gate check (`pipeline/pipeline.md` §5.4) — **extended here to any downstream entry point, not only Stage 4** — because this workflow is itself a request to begin at a stage other than Stage 1:

1. Inspect the project's Run Manifest and report, plainly, the actual current state of Stages 1–2 (Approved / Pending / not started).
2. If Stage 1 and Stage 2 both show `Approved`: confirm with whoever invoked this workflow that the existing Project Context and Discovery Artifacts are still expected to be current for the module(s) this story touches. **Bring the computed answer to that conversation, not just the question** — `cli.js drift --run <prior-run>` (`run_manager.md` §5.8) reports whether the application actually moved in those paths since that run was anchored, so "are these still current?" is answered with evidence where an anchor exists, and explicitly as *unknown* where it does not.
3. If either stage is missing or not `Approved`: **do not proceed and do not assume.** Ask explicitly — per §5.4's existing options (continue from latest approved stage, run the full pipeline from Stage 1, or other) — this workflow never silently substitutes a full pipeline run for its own narrower scope, and never silently proceeds against a missing/unapproved Project Context or Discovery baseline.
4. Once confirmed, **create the run as a refinement of the run whose artifacts it reuses** — a single command (`run_manager.md` §5.9, §5.10):

   ```bash
   node platform_core/tools/run_manager/cli.js refine <prior-run> \
     --scope UserStory --target "<story>" --reason "<what this story adds>" --scope-paths <paths>
   ```

   This creates a **new** run (never editing the prior one), records `inheritsFrom`/`supersedes` and every inherited artifact in `metadata/lineage.json` **and** in the Run Manifest's Cross-Run Reuse section (§5.11, discharging `pipeline.md` §7's "records the source run" obligation), anchors the new run to the application's **current** code state (§5.8), writes its Run Manifest, and activates it. `--dry-run` first shows what would be inherited and the drift, creating nothing.
5. **Act on the drift the refinement reports.** Where it says the application moved in the paths this story touches, the inherited Discovery findings covering those paths are *unverified against current code* — Step 2 treats them as such rather than as current (§5.9 Rule 4). The Manifest carries that implication in writing, so it is not left to memory.

## Step 2 — Test Design Agent *(Pipeline Stage 3)*

**Spec:** `.claude/skills/test-design-skill/SKILL.md` — unmodified.

| | |
|---|---|
| **Input** | Existing Approved Project Context (primary) · Existing Approved Discovery Artifacts (secondary) · this User Story's content (Run Scope) |
| **Contract keys consumed** | `project_context`, `discovery_artifacts` — both satisfied by the *existing, already-Approved* artifacts identified in Step 1, not freshly generated |
| **Output** | Manual Test Suite (Markdown + Excel) · Requirement Traceability Matrix · Coverage Report — all scoped to this story only |
| **Contract keys produced** | `manual_test_suite_md`, `manual_test_suite_xlsx`, `traceability_matrix`, `coverage_report` |
| **Checkpoint** | **Human Review Required** (QA Architect / Test Lead, per `pipeline/pipeline.md` §5.1) |

Per `.claude/skills/test-design-skill/SKILL.md` §16 ("User Story" strategy): at minimum one test case per enumerated acceptance criterion, and every carried-forward Assumption/Risk tied to this story gets its own explicitly tagged assumption-based test case. If the story's specific area was never independently exercised by the existing Discovery Artifacts, the agent's own existing rule applies — it records `"Not independently verified in Discovery"` (§5.1) rather than treating that as a blocker.

## Step 3 — Manual Execution Agent *(Pipeline Stage 4M)*

**Spec:** `.claude/skills/manual-execution-skill/SKILL.md` — unmodified.

| | |
|---|---|
| **Input** | Approved Manual Test Suite / Traceability Matrix / Coverage Report from Step 2 · existing Approved Project Context |
| **Contract keys consumed** | `manual_test_suite`, `traceability_matrix`, `coverage_report`, `project_context` |
| **Output** | Manual Execution Results · Manual Execution Summary · Automation Candidate Package, scoped to this story's test cases only |
| **Contract keys produced** | `manual_execution_results`, `manual_execution_summary`, `automation_candidate_package`, `manual_execution_artifacts` |
| **Checkpoint** | **Human Review Required** (QA Lead / Test Lead, per `pipeline/pipeline.md` §5.1) |

Per `.claude/skills/manual-execution-skill/SKILL.md` §17 ("User Story" Run Scope): execute only the test cases traceable to this story's acceptance criteria — no opportunistic execution of unrelated suite content. Only test cases confirmed successful and stable here (§9 of that spec) become Automation Candidates for Step 4.

## Step 4 — Automation Agent *(Pipeline Stage 4A)*

**Spec:** `.claude/skills/automation-skill/SKILL.md` — unmodified.

| | |
|---|---|
| **Input** | Approved Automation Candidate Package + Manual Execution Summary from Step 3 · Manual Test Suite / Traceability Matrix / Coverage Report from Step 2 (content source) · existing Approved Project Context · any existing Automation Package for this project |
| **Contract keys consumed** | `automation_candidate_package`, `manual_execution_summary`, `manual_test_suite`, `traceability_matrix`, `coverage_report`, `project_context`, `existing_automation_package` (optional) |
| **Output** | Automation Package (new assets for this story's Automation Candidates, or reused/extended existing assets per the agent's own reuse-before-generate rule) |
| **Contract keys produced** | `automation_plan`, `automation_package`, `automation_manifest`, `automation_decision_report`, `automation_coverage_report`, `automation_suite_manifest`, `automation_summary` |
| **Checkpoint** | **Automation Approval Required** (Automation Lead / Release Manager, per `pipeline/pipeline.md` §5.2) |

The Framework Decision Gate (`.claude/skills/automation-skill/SKILL.md` §31) still applies in full — this workflow does not pre-select a framework on the human's behalf. Only test case IDs named in Step 3's Automation Candidate Package receive an automation decision — a story's acceptance criterion whose test case failed or was blocked during Step 3 is never automated this run.

## Step 5 — Automation Execution Agent *(Pipeline Stage 5A)*

**Spec:** `.claude/skills/automation-execution-skill/SKILL.md` — unmodified.

| | |
|---|---|
| **Input** | Approved Automation Package + Automation Summary from Step 4 · existing Approved Project Context |
| **Contract keys consumed** | `automation_suite`, `automation_summary`, `project_context`, `execution_mode` (must still be explicitly resolved per the skill's own §5.1 — never defaulted by this workflow) |
| **Execution scope** | Selective — only this story's newly generated/extended test cases, per `.claude/skills/automation-execution-skill/SKILL.md` §13 ("User Story" Run Scope Type: "execute only the test cases traceable to that story's acceptance criteria") |
| **Output** | Execution Results + evidence |
| **Contract keys produced** | `execution_results`, `execution_artifacts` |
| **Checkpoint** | *None — mechanical, gated only by Step 4's Automation Approval* |

## Step 6 — Reporting Agent *(Pipeline Stage 6A)*

**Spec:** `.claude/skills/reporting-skill/SKILL.md` — unmodified.

| | |
|---|---|
| **Input** | Step 5's Execution Results · Step 2's Manual Test Suite + Traceability Matrix · existing Approved Project Context |
| **Contract keys consumed** | `execution_results`, `manual_test_suites`, `traceability_matrix`, `project_context` |
| **Output** | Final QA Report, scoped to this story |
| **Contract key produced** | `final_qa_report` |
| **Checkpoint** | *None — terminal stage* |

# 5. Reused (Not Regenerated) Artifacts

| Artifact | Path | Source |
|---|---|---|
| Project Context | `platform_core_data/modules/{module}/context/ProjectContext.md` | The Approved artifact in the module's own workspace — read at its current revision, not copied in |
| Discovery Artifacts | `platform_core_data/modules/{module}/discovery/` (QA Assessment Report, Findings Summary, Evidence) | The Approved artifacts in the module's own workspace — read at their current revision, not copied in |

These are **module** artifacts, not run artifacts: a module's design is durable and evolves in place, so this workflow resolves them from the Module Workspace at their current revision rather than reaching into whichever prior run last touched them (`module_architecture.md` §9.2 — run lineage now relates *executions* to each other; design artifacts resolve from the module registry).

Per `workflows_and_pipelines/pipeline/pipeline.md` §7, this workflow **references** each artifact by its own path and records the exact revision it consumed in this run's `moduleArtifactRefs[]` and Run Manifest (`platform_core_data/runs/{{RUN_FOLDER}}/metadata/RunManifest.md`) — it never copies a module artifact into the run folder, because the copy would immediately begin to diverge from the original. Neither artifact is regenerated by this workflow. If either does not exist or is not `Approved`, Step 1's Stage-State Check stops the workflow and asks how to proceed — it does not fabricate a substitute.

# 6. Generated Artifacts

| Artifact | Path | Produced By |
|---|---|---|
| Manual Test Suite (Markdown) | `platform_core_data/modules/{{MODULE_SLUG}}/test_design/TestCases_{Module}.md` | Test Design Agent |
| Manual Test Suite (Excel) | `platform_core_data/modules/{{MODULE_SLUG}}/test_design/TestCases_{Module}.xlsx` | Test Design Agent — generated from the Markdown by `platform_core/tools/test_suite_export/cli.js` (`test-design-skill/SKILL.md` §9.1), never authored separately |
| Requirement Traceability Matrix | `platform_core_data/modules/{{MODULE_SLUG}}/test_design/TraceabilityMatrix.md` | Test Design Agent |
| Coverage Report | `platform_core_data/modules/{{MODULE_SLUG}}/test_design/CoverageReport.md` | Test Design Agent |
| Manual Execution Results | `platform_core_data/runs/{{RUN_FOLDER}}/manual_execution/ManualExecutionResults.md` | Manual Execution Agent |
| Manual Execution Summary | `platform_core_data/runs/{{RUN_FOLDER}}/manual_execution/ManualExecutionSummary.md` | Manual Execution Agent |
| Manual Test Results CSV | `platform_core_data/runs/{{RUN_FOLDER}}/manual_execution/ManualTestResults.csv` | Manual Execution Agent |
| Manual QA Report | `platform_core_data/runs/{{RUN_FOLDER}}/manual_execution/ManualQAReport.md` | Manual Execution Agent — the Manual branch self-reports (`pipeline.md` §3.3) |
| Automation Package + supporting reports | `platform_core_data/modules/{{MODULE_SLUG}}/automation/tests_{Framework}/` and siblings | Automation Agent |
| Execution Results | `platform_core_data/runs/{{RUN_FOLDER}}/execution/ExecutionResults.md` | Automation Execution Agent |
| Final QA Report | `platform_core_data/runs/{{RUN_FOLDER}}/reporting/Final_QA_Report.md` | Reporting Agent |
| Run Summary | `platform_core_data/runs/{{RUN_FOLDER}}/metadata/run_summary.md` | Run Manager |

`{{RUN_FOLDER}}` resolves to this run's own folder name, per `workflows_and_pipelines/pipeline/run_manager.md` §5.1 (e.g. `run-007__2026-07-27_11-20-33__UserStory__US-245_AddCabinClassFilter`) — see `platform_core_data/knowledge_base/onboarding.md`.

# 7. Success Criteria

- [ ] Step 1's Stage-State Check confirms Stages 1–2 are `Approved` before Stage 3 launches (or the human explicitly chose an alternative path).
- [ ] Test Design output covers every acceptance criterion in the story, each with a populated `Acceptance Criteria Reference` (`.claude/skills/test-design-skill/SKILL.md` §5.4).
- [ ] Manual Execution Results cover exactly this story's test cases, and the Automation Candidate Package's qualifying criteria (`.claude/skills/manual-execution-skill/SKILL.md` §9.1) were actually applied before Human Review approval.
- [ ] Automation Decision is recorded for every test case named in the Automation Candidate Package; Automation Approval is granted.
- [ ] Execution Results cover exactly this story's test cases — no unrelated suite content opportunistically included.
- [ ] Final QA Report is produced and clearly scoped to this story.

# 8. Failure Criteria

- Stage 1 or Stage 2 artifacts are missing/not `Approved` and the workflow proceeds anyway (a rule violation — see §9).
- Test Design widens scope beyond this story's acceptance criteria without it being a deliberate, disclosed Human Decision.
- Any required checkpoint is bypassed.

# 9. Rules

1. **This workflow never re-runs Stage 1 or Stage 2** — it consumes their existing Approved outputs unchanged. If they don't exist or aren't current, Step 1 stops and asks; it does not run them itself (that would make this workflow indistinguishable from a full pipeline run, which already exists).
2. **The Stage-State Check (§4 Step 1) always runs first** — never assumed, never skipped, per `pipeline/pipeline.md` §5.4's existing "never choose on the human's behalf" rule.
3. **All applicable checkpoints from `pipeline/pipeline.md` §5 still apply in full** — Human Review at Stage 3 and Stage 4M, Automation Approval at Stage 4A.
4. **Scope never widens beyond this story's acceptance criteria** without an explicit, disclosed Human Decision (`pipeline/pipeline.md` §5.5) — an adjacent feature staying out of scope is documented, not silently folded in.

# 10. Relationship to the Platform Architecture

This workflow does not introduce a new pipeline, stage, or skill. It is a **reusable, scoped invocation** of Stages 3–7 of the existing seven-stage architecture, conditioned on Stages 1–2 already being satisfied. A full pipeline run remains the platform's standard execution mode for a new project or a genuinely new exploration pass; User Story Run exists alongside it for the common case of adding one story to an already-explored application.

# 11. Example

*Illustrative only — not executed as part of this task.*

```text
Workflow: User Story Run
Run Scope: User Story — "As an Admin, I want to filter the Employee List by
           Sub Unit so that I can quickly find employees in a given department."
```

Hypothetical result: the Stage-State Check finds Stage 1 (`ProjectContext.md`, v2) and Stage 2 Approved and current; Test Design Agent produces `TestCases_PIM.md`/`.xlsx` scoped to this one filter behavior, each case citing its Acceptance Criteria Reference, and clears Human Review; Manual Execution Agent executes those cases against the live application, confirms all of them Passed and stable, produces an Automation Candidate Package naming all of them, and clears Human Review; Automation Agent extends the existing `tests_Playwright/` package with the new filter test cases named in that package and clears Automation Approval; Automation Execution Agent runs only those new cases; Reporting Agent produces a Final QA Report scoped to this story alone.
