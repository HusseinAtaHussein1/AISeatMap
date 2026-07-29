> **Position:** A reusable workflow specification, layered on top of [`workflows_and_pipelines/pipeline/pipeline.md`](../pipeline/pipeline.md) and [`workflows_and_pipelines/pipeline/run_manager.md`](../pipeline/run_manager.md). It does not modify either document, does not modify any Agent specification under [`.claude/skills/`](../../.claude/skills/), and does not change the platform's 7-stage architecture — it defines one specific, narrow-scoped *invocation* of the first three stages of that architecture.
> **Status:** Specification only. This document defines the workflow; it has not been executed, and no run, agent, or project artifact has been produced as part of authoring it.

# 1. Workflow Name

**First Run**

# 2. Purpose

This workflow validates that the platform is **operational** — that the Run Manager, Project Context Agent, Explorer Agent, and Test Design Agent can each execute correctly, in order, and hand off a usable artifact to the next stage.

**Its objective is NOT full software testing.** It is a narrow, fast, end-to-end smoke check of the pipeline machinery itself: can a run be initialized, can requirements be captured, can the application be explored with evidence, and can test cases be designed from the result — not "is this application free of defects." A clean pass proves the platform works; it does not constitute a QA sign-off on the application.

# 3. Scope

| | |
|---|---|
| **Module** | Login |

Only the Login module is included. No other module may be explored, tested, or referenced as in-scope by any stage of this workflow.

This scope constraint is supplied to Stage 1 via the Run Configuration input (see `workflows_and_pipelines/pipeline/pipeline.md` §4, Stage 1) — the Project Context Agent's own specification is unmodified; this workflow simply instructs it, through its existing Run Configuration input, to declare Login as the only "In Scope" module and every other module "Out of Scope." Every downstream stage already respects that scope boundary as documented in its own specification (e.g., `.claude/skills/explorer-skill/SKILL.md` §9 Execution Rule 1: "Must not explore any module the Project Context marks 'Out of Scope.'").

# 4. Execution Flow

This workflow runs exactly three Agent stages, orchestrated by the Run Manager, and then stops deliberately. Workflow step numbers below are local to this document; the corresponding Pipeline Stage number from `workflows_and_pipelines/pipeline/pipeline.md` §4 is noted for cross-reference.

```
 1. Run Manager
      │
      ├─ Prepare Workspace         (workflows_and_pipelines/pipeline/run_manager.md §6)
      │
      ├─ Generate Run Metadata     (run.json — workflows_and_pipelines/pipeline/run_manager.md §7)
      │
      ├─ Create Run Manifest       (workflows_and_pipelines/pipeline/pipeline.md §7)
      │
      └─ Launch Stage 1
              │
              ▼
 2. Project Context Agent            [= Pipeline Stage 1]
      │  ⛔ Human Review Required ⛔
              │ (approved)
              ▼
 3. Explorer Agent                   [= Pipeline Stage 2]
      │  ⛔ Human Review Required ⛔
              │ (approved)
              ▼
 4. Test Design Agent                [= Pipeline Stage 3]
      │  ⛔ Human Review Required ⛔
              │ (approved)
              ▼
      Stop Workflow
      (Manual Execution, Automation, Automation Execution, and Reporting
       Agents are intentionally excluded from this workflow)
```

## Step 1 — Run Manager

Per `workflows_and_pipelines/pipeline/run_manager.md`, before any Agent runs:

1. **Create the run** — one command does the whole of what used to be four manual steps (`run_manager.md` §5.10):

   ```bash
   node platform_core/tools/run_manager/cli.js new \
     --scope UserStory --target Login --workflow first_run --scope-paths <in-scope paths>
   ```

   It generates the folder name (§5.5 — never hand-formatted; the pre-2026-07-27 "Run ID + AI-generated Display Name" pair is retired, §5), creates the Run Workspace (§6), writes `run.json` **with the Target Project code-state anchor** (`targetRef`, §5.8), creates `metadata/RunManifest.md` from its template (§5.11), and **activates the run** (§5.7) so Stage 1 knows where to write. Where the anchor cannot be captured, that is recorded as a declared gap rather than left silent.
2. **Launch Stage 1** — hand off to the Project Context Agent, having set run Status to `Running`. As each stage completes or a checkpoint resolves, record it: `cli.js stage "<Stage>" --status <status> --reviewer <who>` (§5.11).

The Run Manager takes no further action of its own until a stage signals completion, error, or a checkpoint is reached (`workflows_and_pipelines/pipeline/run_manager.md` §8) — it does not analyze, and does not influence, what any Agent produces.

## Step 2 — Project Context Agent *(Pipeline Stage 1)*

**Spec:** `.claude/skills/project-context-skill/SKILL.md` — unmodified.

| | |
|---|---|
| **Input** | PRD · Supporting Documents · Run Configuration (declaring Login as the sole In Scope module, per §3 above) |
| **Contract keys consumed** | `prd`, `run_configuration` (per the skill's own `inputs` contract) |
| **Output** | Project Context — `platform_core_data/runs/{{RUN_FOLDER}}/context/ProjectContext.md` |
| **Contract key produced** | `project_context` |
| **Checkpoint** | **Human Review Required** (Business Analyst / Product Owner, per `workflows_and_pipelines/pipeline/pipeline.md` §5.1) |

The workflow does not proceed to Step 3 until this checkpoint is explicitly approved.

## Step 3 — Explorer Agent *(Pipeline Stage 2)*

**Spec:** `.claude/skills/explorer-skill/SKILL.md` — unmodified. See §5 below for the First-Run-specific objectives this workflow asks the (unchanged) Explorer Agent to apply.

| | |
|---|---|
| **Input** | Project Context · Running Application |
| **Contract keys consumed** | `project_context` (Step 2's `project_context` output, re-supplied unchanged), `discovery_source` |
| **Output** | Discovery Report (`platform_core_data/runs/{{RUN_FOLDER}}/discovery/QA_Assessment_Report.md`) · Findings Summary (`platform_core_data/runs/{{RUN_FOLDER}}/discovery/findings/Findings_Summary.md`) · Evidence Packages (`platform_core_data/runs/{{RUN_FOLDER}}/discovery/findings/FINDING-{ID}_{ShortName}/`) |
| **Contract keys produced** | `qa_assessment_report`, `findings_summary`, `evidence_packages`, `discovery_snapshots`, `timeline`, `coverage_summary` |
| **Checkpoint** | **Human Review Required** (QA Lead, per `workflows_and_pipelines/pipeline/pipeline.md` §5.1) |

Note: `.claude/skills/explorer-skill/SKILL.md` also always produces per-screen discovery snapshots (`platform_core_data/runs/{{RUN_FOLDER}}/discovery/*.md`) as a standing, non-optional part of its output (its own §9 Execution Rule 4) — that continues to happen as part of this step even though this workflow's artifact list in §6 groups them together with the Discovery Report rather than naming them separately.

The workflow does not proceed to Step 4 until this checkpoint is explicitly approved.

## Step 4 — Test Design Agent *(Pipeline Stage 3)*

**Spec:** `.claude/skills/test-design-skill/SKILL.md` — unmodified.

| | |
|---|---|
| **Input** | Project Context (primary) · Discovery Report / Discovery Artifacts (secondary) |
| **Contract keys consumed** | `project_context` (Step 2's output, re-supplied unchanged), `discovery_artifacts` (satisfied by Step 3's `qa_assessment_report`/`findings_summary`/`evidence_packages`) |
| **Output** | Manual Test Suite (Markdown) · Manual Test Suite (Excel) · Requirement Traceability Matrix |
| **Contract keys produced** | `manual_test_suite_md`, `manual_test_suite_xlsx`, `traceability_matrix`, `coverage_report` |
| **Checkpoint** | **Human Review Required** (QA Architect / Test Lead, per `workflows_and_pipelines/pipeline/pipeline.md` §5.1) |

## Stop Workflow

Once Step 4's checkpoint is approved, this workflow ends. The following stages are **intentionally excluded** from First Run and must not be launched under this workflow:

- Manual Execution Agent (Stage `4M` — Manual branch)
- Automation Agent (Stage `4A` — Automation branch)
- Automation Execution Agent (Stage `5A` — Automation branch)
- Self-Healing Agent (Stage `5H` — Automation branch, optional)
- Reporting Agent (Stage `6A` — Automation branch)

Excluding these stages from *this workflow* does not remove them from the platform's architecture — a full run of either pipeline (per `workflows_and_pipelines/pipeline/pipeline.md`) still includes every stage of the branch it takes. First Run stops at the end of the **shared foundation** (Stages 1–3), which is exactly the divergence point: from its output, either branch may then be run, in any order, or both (`pipeline.md` §3.3).

# 5. Explorer Objectives (First-Run-Specific Direction)

These are instructions this workflow gives to the unmodified Explorer Agent for its Step 3 invocation — they invoke existing Explorer Agent capabilities (`.claude/skills/explorer-skill/SKILL.md`) with a narrowed scope, not new behavior:

1. **Explore only the Login module.** No other module may be visited, per §3.
2. **Capture screenshots whenever applicable**, per the Explorer Agent's existing Evidence Collection and Smart Evidence Collection rules (`.claude/skills/explorer-skill/SKILL.md` §5.9–§5.10).
3. **Capture video whenever supported**, per the same evidence rules.
4. **Collect console logs whenever supported**, per the same evidence rules.
5. **Collect network logs whenever supported**, per the same evidence rules.
6. **Apply the Retry Policy** exactly as specified in `.claude/skills/explorer-skill/SKILL.md` §5.6 — no first-run-specific override of retry counts or categories.
7. **Apply Investigation Mode** exactly as specified in `.claude/skills/explorer-skill/SKILL.md` §5.7 — boundary conditions for any Validation, Navigation, or Authorization candidate encountered within the Login module (e.g., empty/invalid credentials, session expiration on the login screen, direct URL access to a post-login route while unauthenticated).
8. **Generate Findings only when supported by evidence.** Per `.claude/skills/explorer-skill/SKILL.md` §9 Execution Rule 11 and its Core Philosophy (§4): no Finding is published without a complete evidence package; an observation that cannot be backed by evidence is logged as an Open Question in the Discovery Report instead.

This workflow does not loosen, tighten, or otherwise alter any Explorer Agent rule — it only narrows *where* the agent looks (Login only) while leaving *how* it investigates and reports entirely governed by the Explorer Agent's own specification.

# 6. Generated Artifacts

| Artifact | Path | Produced By |
|---|---|---|
| Project Context | `platform_core_data/runs/{{RUN_FOLDER}}/context/ProjectContext.md` | Project Context Agent |
| Discovery Report | `platform_core_data/runs/{{RUN_FOLDER}}/discovery/QA_Assessment_Report.md` | Explorer Agent |
| Findings Summary | `platform_core_data/runs/{{RUN_FOLDER}}/discovery/findings/Findings_Summary.md` | Explorer Agent |
| Evidence Packages | `platform_core_data/runs/{{RUN_FOLDER}}/discovery/findings/FINDING-{ID}_{ShortName}/` | Explorer Agent |
| Manual Test Suites (Markdown) | `platform_core_data/runs/{{RUN_FOLDER}}/test_design/TestCases_Login.md` | Test Design Agent |
| Manual Test Suites (Excel) | `platform_core_data/runs/{{RUN_FOLDER}}/test_design/TestCases_Login.xlsx` | Test Design Agent |
| Requirement Traceability Matrix | `platform_core_data/runs/{{RUN_FOLDER}}/test_design/TraceabilityMatrix.md` | Test Design Agent |
| Run Summary | `platform_core_data/runs/{{RUN_FOLDER}}/metadata/run_summary.md` | Run Manager |

# 7. Success Criteria

The workflow is successful only if **all** of the following hold:

- [ ] Run Manager completes successfully (Run Workspace created, `run.json` maintained throughout, no initialization error).
- [ ] Project Context is generated and clears its Human Review checkpoint.
- [ ] Explorer completes without interruption (no crash, no unhandled error) within the Login-only scope.
- [ ] Evidence is collected for every Finding the Explorer Agent raises (per its own §9 Execution Rule 11 — no Finding without an evidence package).
- [ ] Discovery Report is generated and clears its Human Review checkpoint.
- [ ] Manual Test Suites are generated in **both** Markdown and Excel form.
- [ ] Requirement Traceability Matrix is generated.
- [ ] Run Summary is generated with Overall Status `Completed`.

# 8. Failure Criteria

The workflow fails if **any** of the following occur:

- Run initialization fails (Run Manager cannot allocate a Run ID or create the Run Workspace).
- Project Context cannot be generated.
- Explorer crashes (an unhandled error stops exploration before the Login module is covered).
- Evidence cannot be collected for a Finding that is nonetheless reported (a violation of the Explorer Agent's own no-Finding-without-evidence rule) — the correct behavior in that situation is to log an Open Question instead, per §5 item 8; failing to do so is itself a workflow failure.
- Any of the required artifacts listed in §6 is missing at the point the workflow stops.

On failure, the Run Manager records Status `Failed` in `run.json` and `run_summary.md` reflects that Overall Status — per `workflows_and_pipelines/pipeline/run_manager.md` §8, the Run Manager only records this mechanically; it does not diagnose *why* the failure occurred.

# 9. Rules

1. **The workflow must stop immediately whenever a Human Review checkpoint is reached.** No stage proceeds past its own checkpoint on its own initiative — see `workflows_and_pipelines/pipeline/pipeline.md` §5.3, unmodified and fully in effect here.
2. **The next stage may execute only after approval.** An open (`Pending`) checkpoint blocks the next stage exactly as `workflows_and_pipelines/pipeline/pipeline.md` §5.3 Rule 5 requires.
3. **The workflow never skips a stage.** Steps 2, 3, and 4 (§4) each run in full, in order, every time this workflow executes.
4. **The workflow never executes excluded stages.** Manual Execution, Automation, Automation Execution, and Reporting Agents (§4, "Stop Workflow") must not be launched under this workflow under any circumstance, including on retry after a failure — retrying First Run means re-running Steps 1–4, not extending into the excluded stages.

# 10. Relationship to the Platform Architecture

This workflow does not introduce a new pipeline, a new stage, or a new agent. It is a **reusable, scoped invocation** of the **shared** first three stages defined in `workflows_and_pipelines/pipeline/pipeline.md`, orchestrated by the existing Run Manager defined in `workflows_and_pipelines/pipeline/run_manager.md`. A full run of either pipeline remains the platform's standard execution mode; First Run exists alongside it as a fast operational check, not a replacement — and because it ends precisely at the divergence point, its output is directly usable by whichever branch is chosen next.

# 11. Example

*Illustrative only — not executed as part of this task.*

```text
Workflow: First Run
Module: Login
```

Hypothetical result: Run Manager generates the folder name `run-001__2026-07-06_09-30-00__UserStory__Login` and creates its workspace under `platform_core_data/runs/run-001__2026-07-06_09-30-00__UserStory__Login/`; the Project Context Agent produces `ProjectContext.md` scoped to Login only (In Scope: Login; Out of Scope: everything else) and it clears Human Review; the Explorer Agent explores only the Login screen and its immediate boundary conditions (invalid credentials, empty fields, session expiration, direct URL access while unauthenticated), producing `QA_Assessment_Report.md`, a `Findings_Summary.md` with, say, two Findings (e.g., a `Security Concern` around missing lockout behavior, status `Needs Human Review`, and a `UX Issue` around an unclear error message, status `Needs Human Review`), each with a complete evidence package, and clears its own Human Review checkpoint; the Test Design Agent produces `TestCases_Login.md` / `.xlsx` and `TraceabilityMatrix.md` and clears its checkpoint; the workflow then stops, Automation/Execution/Reporting are never invoked, and the Run Manager publishes `run_summary.md` with Overall Status `Completed`.
