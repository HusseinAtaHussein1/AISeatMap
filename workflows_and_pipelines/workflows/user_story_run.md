> **Position:** A reusable workflow specification, layered on top of [`pipeline/pipeline.md`](../pipeline/pipeline.md), [`pipeline/run_manager.md`](../pipeline/run_manager.md), and [`pipeline/run_scope.md`](../pipeline/run_scope.md). It does not modify any of those documents, does not modify any Agent specification under [`.claude/skills/`](../../.claude/skills/), and does not change the platform's 6-stage architecture — it defines one specific, narrow-scoped *invocation* of Stages 3–6 against an already-existing Project Context and Discovery baseline.
> **Status:** Specification only. This document defines the workflow; it has not been executed, and no run, agent, or project artifact has been produced as part of authoring it.

# 1. Workflow Name

**User Story Run**

# 2. Purpose

This workflow takes a single, already-scoped User Story from requirement to a stakeholder-facing report — design, automate, execute, report — **without re-running Stage 1 (Project Context) or Stage 2 (Explorer)**, when an Approved Project Context and Approved Discovery Artifacts already exist and remain current for the module(s) the story touches.

It exists for the common case where a project has already been onboarded and explored at least once (e.g., via a prior Entire Project or First Run pass), and a new User Story arrives against that same, still-valid application surface — re-discovering the whole application for one story would be wasted, redundant work.

**This workflow does not decide, by itself, that Stages 1–2 don't need to run.** That determination is made by the existing Automation Start Decision Gate mechanism (`pipeline/pipeline.md` §5.4), applied here at Stage 3's entry point rather than Stage 4's — see §4 Step 1.

# 3. Scope

| | |
|---|---|
| **Application** | `{{PROJECT_NAME}}` |
| **Run Scope Type** | `User Story` (per `pipeline/run_scope.md` §3) |
| **Run Scope Source** | Whatever this story is supplied as — pasted text, a Markdown file under `projects/{{PROJECT_NAME}}/resources/requirements/user_stories/`, or (once integrated) a tracked work item ID (`pipeline/run_scope.md` §4) |
| **Module(s)** | Whatever module(s) the story's acceptance criteria touch — named explicitly in the story content, not assumed |

Only this story's acceptance criteria are in scope for Stage 3's test design (`.claude/skills/test-design-agent/SKILL.md` §16, "User Story" strategy: "narrowest and most literal... no broader wandering into adjacent feature coverage the story didn't ask for"). This workflow does not widen that scope.

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
 3. Automation Agent                 [= Pipeline Stage 4]
      │  ⛔ Automation Approval Required ⛔
              │ (approved)
              ▼
 4. Execution Agent                  [= Pipeline Stage 5]
      │  (mechanical — no separate gate, per pipeline/pipeline.md §4 Stage 5)
              ▼
 5. Reporting Agent                  [= Pipeline Stage 6]
              │
              ▼
      Stop Workflow
```

## Step 1 — Run Manager & Stage-State Check

Before Stage 3 is invoked, the Run Manager performs the Automation Start Decision Gate check (`pipeline/pipeline.md` §5.4) — **extended here to any downstream entry point, not only Stage 4** — because this workflow is itself a request to begin at a stage other than Stage 1:

1. Inspect the project's Run Manifest and report, plainly, the actual current state of Stages 1–2 (Approved / Pending / not started) for `{{PROJECT_NAME}}`.
2. If Stage 1 and Stage 2 both show `Approved`: confirm with whoever invoked this workflow that the existing Project Context and Discovery Artifacts are still expected to be current for the module(s) this story touches, then proceed to Step 2.
3. If either stage is missing or not `Approved`: **do not proceed and do not assume.** Ask explicitly — per §5.4's existing options (continue from latest approved stage, run the full pipeline from Stage 1, or other) — this workflow never silently substitutes a full pipeline run for its own narrower scope, and never silently proceeds against a missing/unapproved Project Context or Discovery baseline.
4. Once confirmed, the Run Manager allocates a Run ID + AI-generated Display Name and workspace exactly as it would for any run (`pipeline/run_manager.md` §5–§6) — for this workflow, the Display Name is derived from the `user_story_run` workflow name and the story's Run Scope — and Step 2 launches with `test_design/` as the first subfolder created for this run (`context/` and `discovery/` are not recreated — the existing approved artifacts are referenced, not duplicated).

## Step 2 — Test Design Agent *(Pipeline Stage 3)*

**Spec:** `.claude/skills/test-design-agent/SKILL.md` — unmodified.

| | |
|---|---|
| **Input** | Existing Approved Project Context (primary) · Existing Approved Discovery Artifacts (secondary) · this User Story's content (Run Scope) |
| **Contract keys consumed** | `project_context`, `discovery_artifacts` — both satisfied by the *existing, already-Approved* artifacts identified in Step 1, not freshly generated |
| **Output** | Manual Test Suite (Markdown + Excel) · Requirement Traceability Matrix · Coverage Report — all scoped to this story only |
| **Contract keys produced** | `manual_test_suite_md`, `manual_test_suite_xlsx`, `traceability_matrix`, `coverage_report` |
| **Checkpoint** | **Human Review Required** (QA Architect / Test Lead, per `pipeline/pipeline.md` §5.1) |

Per `.claude/skills/test-design-agent/SKILL.md` §16 ("User Story" strategy): at minimum one test case per enumerated acceptance criterion, and every carried-forward Assumption/Risk tied to this story gets its own explicitly tagged assumption-based test case. If the story's specific area was never independently exercised by the existing Discovery Artifacts, the agent's own existing rule applies — it records `"Not independently verified in Discovery"` (§5.1) rather than treating that as a blocker.

## Step 3 — Automation Agent *(Pipeline Stage 4)*

**Spec:** `.claude/skills/automation-agent/SKILL.md` — unmodified.

| | |
|---|---|
| **Input** | Approved Manual Test Suite / Traceability Matrix / Coverage Report from Step 2 · existing Approved Project Context · any existing Automation Package for this project |
| **Contract keys consumed** | `manual_test_suite`, `traceability_matrix`, `coverage_report`, `project_context`, `existing_automation_package` (optional) |
| **Output** | Automation Package (new assets for this story's test cases, or reused/extended existing assets per the agent's own reuse-before-generate rule) |
| **Contract keys produced** | `automation_plan`, `automation_package`, `automation_manifest`, `automation_decision_report`, `automation_coverage_report`, `automation_suite_manifest`, `automation_summary` |
| **Checkpoint** | **Automation Approval Required** (Automation Lead / Release Manager, per `pipeline/pipeline.md` §5.2) |

The Framework Decision Gate (`.claude/skills/automation-agent/SKILL.md` §31) still applies in full — this workflow does not pre-select a framework on the human's behalf.

## Step 4 — Execution Agent *(Pipeline Stage 5)*

**Spec:** `.claude/skills/execution-agent/SKILL.md` — unmodified.

| | |
|---|---|
| **Input** | Approved Automation Package + Automation Summary from Step 3 · existing Approved Project Context |
| **Contract keys consumed** | `automation_suite`, `automation_summary`, `project_context`, `execution_mode` (must still be explicitly resolved per the skill's own §5.1 — never defaulted by this workflow) |
| **Execution scope** | Selective — only this story's newly generated/extended test cases, per `.claude/skills/execution-agent/SKILL.md` §13 ("User Story" Run Scope Type: "execute only the test cases traceable to that story's acceptance criteria") |
| **Output** | Execution Results + evidence |
| **Contract keys produced** | `execution_results`, `execution_artifacts` |
| **Checkpoint** | *None — mechanical, gated only by Step 3's Automation Approval* |

## Step 5 — Reporting Agent *(Pipeline Stage 6)*

**Spec:** `.claude/skills/reporting-agent/SKILL.md` — unmodified.

| | |
|---|---|
| **Input** | Step 4's Execution Results · Step 2's Manual Test Suite + Traceability Matrix · existing Approved Project Context |
| **Contract keys consumed** | `execution_results`, `manual_test_suites`, `traceability_matrix`, `project_context` |
| **Output** | Final QA Report, scoped to this story |
| **Contract key produced** | `final_qa_report` |
| **Checkpoint** | *None — terminal stage* |

# 5. Reused (Not Regenerated) Artifacts

| Artifact | Path | Source |
|---|---|---|
| Project Context | `projects/{{PROJECT_NAME}}/artifacts/context/{{PROJECT_NAME}}_ProjectContext.md` | Existing Approved version from a prior run — reused as-is |
| Discovery Artifacts | `projects/{{PROJECT_NAME}}/artifacts/discovery/` (QA Assessment Report, Findings Summary, Evidence Packages) | Existing Approved version from a prior run — reused as-is |

Neither of these is regenerated by this workflow. If either does not exist or is not `Approved`, Step 1's Stage-State Check stops the workflow and asks how to proceed — it does not fabricate a substitute.

# 6. Generated Artifacts

| Artifact | Path | Produced By |
|---|---|---|
| Manual Test Suite (Markdown) | `projects/{{PROJECT_NAME}}/artifacts/test_design/{{PROJECT_NAME}}_TestCases_{Module}.md` | Test Design Agent |
| Manual Test Suite (Excel) | `projects/{{PROJECT_NAME}}/artifacts/test_design/{{PROJECT_NAME}}_TestCases_{Module}.xlsx` | Test Design Agent |
| Requirement Traceability Matrix | `projects/{{PROJECT_NAME}}/artifacts/test_design/{{PROJECT_NAME}}_TraceabilityMatrix.md` | Test Design Agent |
| Coverage Report | `projects/{{PROJECT_NAME}}/artifacts/test_design/{{PROJECT_NAME}}_CoverageReport.md` | Test Design Agent |
| Automation Package + supporting reports | `projects/{{PROJECT_NAME}}/artifacts/automation/{{PROJECT_NAME}}_tests_{Framework}/` and siblings | Automation Agent |
| Execution Results | `projects/{{PROJECT_NAME}}/artifacts/execution/{{PROJECT_NAME}}_ExecutionResults.md` | Execution Agent |
| Final QA Report | `projects/{{PROJECT_NAME}}/artifacts/reporting/{{PROJECT_NAME}}_Final_QA_Report.md` | Reporting Agent |
| Run Summary | `projects/{{PROJECT_NAME}}/artifacts/runs/RUN-YYYYMMDD-XXX-{ai_generated_slug}/metadata/run_summary.md` | Run Manager |

NDC uses its `workspace/` variant of these paths — see `projects/NDC/onboarding.md`.

# 7. Success Criteria

- [ ] Step 1's Stage-State Check confirms Stages 1–2 are `Approved` before Stage 3 launches (or the human explicitly chose an alternative path).
- [ ] Test Design output covers every acceptance criterion in the story, each with a populated `Acceptance Criteria Reference` (`.claude/skills/test-design-agent/SKILL.md` §5.4).
- [ ] Automation Decision is recorded for every generated test case; Automation Approval is granted.
- [ ] Execution Results cover exactly this story's test cases — no unrelated suite content opportunistically included.
- [ ] Final QA Report is produced and clearly scoped to this story.

# 8. Failure Criteria

- Stage 1 or Stage 2 artifacts are missing/not `Approved` and the workflow proceeds anyway (a rule violation — see §9).
- Test Design widens scope beyond this story's acceptance criteria without it being a deliberate, disclosed Human Decision.
- Any required checkpoint is bypassed.

# 9. Rules

1. **This workflow never re-runs Stage 1 or Stage 2** — it consumes their existing Approved outputs unchanged. If they don't exist or aren't current, Step 1 stops and asks; it does not run them itself (that would make this workflow indistinguishable from a full pipeline run, which already exists).
2. **The Stage-State Check (§4 Step 1) always runs first** — never assumed, never skipped, per `pipeline/pipeline.md` §5.4's existing "never choose on the human's behalf" rule.
3. **All applicable checkpoints from `pipeline/pipeline.md` §5 still apply in full** — Human Review at Stage 3, Automation Approval at Stage 4.
4. **Scope never widens beyond this story's acceptance criteria** without an explicit, disclosed Human Decision (`pipeline/pipeline.md` §5.5) — an adjacent feature staying out of scope is documented, not silently folded in.

# 10. Relationship to the Platform Architecture

This workflow does not introduce a new pipeline, stage, or skill. It is a **reusable, scoped invocation** of Stages 3–6 of the existing six-stage architecture, conditioned on Stages 1–2 already being satisfied. A full pipeline run remains the platform's standard execution mode for a new project or a genuinely new exploration pass; User Story Run exists alongside it for the common case of adding one story to an already-explored application.

# 11. Example

*Illustrative only — not executed as part of this task.*

```text
Workflow: User Story Run
Application: OrangeHRM
Run Scope: User Story — "As an Admin, I want to filter the Employee List by
           Sub Unit so that I can quickly find employees in a given department."
```

Hypothetical result: the Stage-State Check finds Stage 1 (`OrangeHRM_ProjectContext.md`, v2) and Stage 2 Approved and current; Test Design Agent produces `OrangeHRM_TestCases_PIM.md`/`.xlsx` scoped to this one filter behavior, each case citing its Acceptance Criteria Reference, and clears Human Review; Automation Agent extends the existing `OrangeHRM_tests_Playwright/` package with the new filter test cases and clears Automation Approval; Execution Agent runs only those new cases; Reporting Agent produces a Final QA Report scoped to this story alone.
