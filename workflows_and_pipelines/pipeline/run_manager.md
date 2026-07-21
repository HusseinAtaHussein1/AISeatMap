> **Position:** Outside the 6-stage Agent pipeline defined in [`workflows_and_pipelines/pipeline/pipeline.md`](pipeline.md) and [`.claude/skills/`](../../.claude/skills/). The Run Manager is an **orchestration component, not an Agent** — it does not appear as a stage in `workflows_and_pipelines/pipeline/pipeline.md`'s Pipeline Overview, and this document does not alter that stage order.
> **Relationship to existing concepts:** `workflows_and_pipelines/pipeline/pipeline.md` §5.3/§9 already names a "Pipeline Orchestrator (tooling, not a person)" responsible for invoking agents in order and maintaining a Run Manifest (§7). The Run Manager is the full specification of that tooling role. It is additive: it does not change the Pipeline Orchestrator's responsibilities, the six agents' Input/Output contracts, or any existing artifact path documented elsewhere.
> **Scope of this revision:** This document defines the Run Manager only. No existing agent file, the pipeline specification, or any project artifact has been modified or generated as part of authoring it. Wiring the six agents to read/write inside a Run Workspace (§6) is a future integration step, out of scope here.
> **2026-07-21 update:** §4, §5, §6, §7, and §9 were extended to add an AI-generated Display Name/Title/Description on top of the pre-existing immutable Run ID — see §5.4 for the backward-compatibility guarantee this update makes: no existing run folder, `run.json`, or `run_summary.md` is renamed, migrated, or otherwise touched by it.

# 1. Component Name

**Run Manager**

# 2. Purpose

The Run Manager is an orchestration component responsible for preparing, organizing, monitoring, and finalizing every execution run of the Agentic AI Testing Platform pipeline.

**It is not an AI Agent.** It never analyzes software behavior, never forms an opinion about whether observed behavior is correct, never generates Findings, and never generates test cases. It has no judgment role anywhere in the pipeline. Its entire responsibility is mechanical: give every run a unique identity, a well-organized workspace, and a running record of what happened — nothing about *whether* what happened was good or bad.

Where the six Agents (Project Context, Explorer, Test Design, Automation, Execution, Reporting) answer "what does the application do, and what should be tested, built, run, and reported," the Run Manager only answers "which run is this, where does its output go, and what state is it in."

# 3. Non-Responsibilities

To keep this component's boundary unambiguous, the Run Manager explicitly must **not**:

- Analyze, interpret, or judge application behavior.
- Generate, classify, score, or triage Findings (that is the Explorer Agent's responsibility — see `.claude/skills/explorer-agent/SKILL.md`).
- Generate, design, or modify test cases (Test Design Agent) or automation scripts (Automation Agent).
- Decide whether a run "passed" or "succeeded" in a quality sense — it records mechanical status (§8), not a verdict.
- Modify the content of any artifact an Agent produces.
- Substitute for, or bypass, any Human Review / Automation Approval checkpoint defined in `workflows_and_pipelines/pipeline/pipeline.md` §5.

**Note on the Display Name, Title, and Description (§5, §7):** generating these is mechanical *summarization* of context that already exists elsewhere (the workflow name, the Run Scope, a User Story/Bug ID, a Feature/Module name) — never an analytical judgment about the application under test. It does not cross into Findings, test-case generation, or quality verdicts, and it does not weaken the boundary in this section.

# 4. Responsibilities

The Run Manager must:

1. **Create a unique, immutable Run ID** for every execution run, per the naming convention in §5.
2. **Generate a human-readable Display Name** — an AI-generated, kebab-case slug summarizing the run's purpose, derived from the best-available context per §5's priority order, and appended to the Run ID to form the run's folder name.
3. **Generate a Run Title and Description** (§7) — a short human-readable title and a longer descriptive summary of the run's objective, generated from the same context used for the Display Name.
4. **Validate filesystem-safe naming** — confirm the full Run ID + Display Name string is lowercase, kebab-case, and free of characters unsafe for a directory name, before creating the Run Workspace.
5. **Prevent duplicate folder names** — confirm the resulting Run Workspace folder name does not already exist before creating it, adjusting the Display Name if a collision is found (the Run ID portion is already guaranteed unique per §5).
6. **Create the Run Workspace** — the directory structure in §6 — before any Agent begins work for that run.
7. **Generate Run Metadata** (`run.json`, §7) at the start of the run and keep it current as the run progresses.
8. **Provide workspace paths to downstream agents** — the concrete, run-scoped paths each Agent should treat as its working directory for that run's artifacts.
9. **Track execution status** — maintaining the run's current state from the Execution Status enum (§8) as the run moves through the pipeline.
10. **Maintain artifact organization** — ensuring every artifact produced during the run lands in the correct subdirectory of the Run Workspace (§6), without altering the content of any artifact.
11. **Publish a Run Summary** (`run_summary.md`, §9) once the run reaches a terminal status.

# 5. Run Naming Convention

**Revision note (2026-07-21):** this section adds an AI-generated Display Name to every newly created run's folder name, on top of the immutable Run ID that already existed. **This is additive only** — see §5.4 Backward Compatibility. No existing run is renamed, and the Run ID itself (§5.1) is unchanged.

## 5.1 Run ID (immutable)

The Run ID remains generated exactly as before:

```
RUN-YYYYMMDD-XXX
```

- `YYYYMMDD` — the run's start date.
- `XXX` — a zero-padded, 3-digit sequence number, starting at `001` for the first run started on that date and incrementing for each subsequent run started the same date. The sequence resets at `001` on the next calendar date.
- The Run Manager is responsible for guaranteeing uniqueness even if two runs are requested at nearly the same time — it must allocate the sequence number atomically, never hand out the same Run ID twice.
- The Run ID alone is the stable identifier referenced by `run.json`'s `runId` field, cross-references, and anywhere only immutable identity matters. It never includes the Display Name.

Examples:

```
RUN-20260706-001
RUN-20260706-002
```

## 5.2 Display Name (AI-generated, appended)

Every newly created run additionally gets a Display Name — a concise, AI-generated slug describing the run's purpose — appended to the Run ID to form the run's folder name:

```
RUN-YYYYMMDD-XXX-{ai_generated_slug}
```

Examples:

```
RUN-20260721-001-first-run-login
RUN-20260721-002-userstory-flight-search
RUN-20260721-003-bug-payment-timeout
RUN-20260721-004-regression-booking
RUN-20260721-005-discovery-admin-module
```

The slug must be:

- lowercase
- kebab-case (hyphen-separated, no underscores or spaces)
- concise — maximum 6–8 words
- filesystem-safe — letters, digits, and hyphens only, no special characters
- generated from the best available context, in this priority order:

  1. Workflow Name (e.g. `first_run`, `user_story_run`, `bug_fix_run`)
  2. Run Scope (`workflows_and_pipelines/pipeline/run_scope.md` §3)
  3. User Story
  4. Bug ID
  5. Feature Name
  6. Module Name
  7. Project Context

  When more than one of these is available, the Run Manager generates the single most meaningful summary rather than concatenating every source — e.g. `bug-245-payment`, not `bug-245-payment-checkout-module-regression-full`.

## 5.3 Uniqueness and Duplicate Prevention

The Run ID's sequence number (§5.1) already guarantees the run's identity is unique even if two runs share an identical Display Name on the same day. Before creating the Run Workspace (§6), the Run Manager additionally:

1. Validates the complete folder name (`RUN-YYYYMMDD-XXX-{slug}`) is filesystem-safe per §5.2.
2. Confirms that exact folder name does not already exist under `projects/{{PROJECT_NAME}}/artifacts/runs/`.
3. In the rare case of a collision (identical Run ID and identical generated slug — not possible under normal sequencing, but never assumed away), regenerates a more specific slug rather than silently overwriting the existing folder.

## 5.4 Backward Compatibility

This convention applies **only to runs created after this revision.** Existing run folders (e.g. `RUN-20260706-001`, `RUN-20260710-001`, `RUN-20260712-001`, `RUN-20260718-001`) keep their original `RUN-YYYYMMDD-XXX` folder names, `run.json` schema, and content exactly as they are — they are never renamed, backfilled with a Display Name, or otherwise modified to match this revision.

# 6. Workspace Structure

**Revision note (repository v1.0 architecture):** every project is now fully self-contained under `projects/{{PROJECT_NAME}}/` — there is no root-level `artifacts/` directory. Project Artifacts (the current-approved state) and Run Artifacts (immutable per-run snapshots) both live under `projects/{{PROJECT_NAME}}/artifacts/`, as two siblings: the stage-named folders directly under `artifacts/` hold the current approved state, and `artifacts/runs/RUN-XXXX/` holds each run's own snapshot. This also consolidates the previous cross-cutting `evidence/`, `screenshots/`, `videos/`, `logs/`, `network/` folders into the owning stage's own folder (`discovery/` for Explorer-produced evidence, `execution/` for Execution-produced evidence) rather than keeping them as separate top-level run folders — no evidence type is dropped, only regrouped by which stage produces it.

**On-demand folder creation (revised):** the Run Manager creates only `metadata/` before any Agent starts — every run has one, regardless of which stages it reaches. Every other subfolder is created **only at the moment the corresponding Agent actually produces its first output**, never upfront as an empty placeholder:

```
projects/
  {{PROJECT_NAME}}/
    artifacts/
      runs/
        RUN-YYYYMMDD-XXX-{ai_generated_slug}/
          metadata/              <- always created immediately
          context/                <- created only when Stage 1 writes to it
          discovery/               <- created only when Stage 2 writes to it
            findings/               <- created only when a Finding is actually raised
          test_design/            <- created only when Stage 3 writes to it
          automation/              <- created only when Stage 4 writes to it
          execution/               <- created only when Stage 5 writes to it
          reporting/               <- created only when Stage 6 writes to it
```

**Naming note:** the `RUN-YYYYMMDD-XXX-{ai_generated_slug}` folder name applies to runs created after §5's revision only. Pre-existing run folders keep their original `RUN-YYYYMMDD-XXX` name (§5.4) — every reference to a run's workspace path elsewhere in this document uses the placeholder `RUN-YYYYMMDD-XXX` for brevity, but for a run created under the new convention that placeholder always resolves to the full `RUN-YYYYMMDD-XXX-{slug}` folder name.

A run that only ever reaches Stage 2 (Explorer) has exactly `metadata/` and `discovery/` on disk — `context/`, `test_design/`, `automation/`, `execution/`, and `reporting/` are never created for that run. This applies for the life of the run: if it's later resumed and reaches further stages, each newly-reached stage's folder is created at that point, not before.

- `metadata/` — `run.json` (§7) and `run_summary.md` (§9), plus any other run-bookkeeping file. The one folder every run has, always.
- `context/` — the Project Context version(s) used by this run.
- `discovery/` — Explorer Agent discovery snapshots, QA Assessment Report, and evidence (screenshots/videos/logs/network captures) produced during this run.
- `discovery/findings/` — Explorer Agent Finding evidence packages produced during this run (see `.claude/skills/explorer-agent/SKILL.md` §5.11).
- `test_design/` — Test Design Agent's Manual Test Suite, Traceability Matrix, and Coverage Report for this run.
- `automation/` — Automation Agent's Automation Package, Plan, Manifest, Decision Report, Coverage Report, Suite Manifest, and Summary for this run.
- `execution/` — Execution Agent's Execution Results and captured evidence (screenshots, traces, logs, HAR, framework reports) for this run.
- `reporting/` — Reporting Agent's Final QA Report for this run.

**Retroactive note (2026-07-17):** this replaces an earlier version of this section that had the Run Manager create the full seven-folder skeleton upfront, before any Agent ran. Existing runs created under that earlier behavior had empty subfolders for stages they never reached; those empty folders have been removed from NDC's existing runs to match this corrected behavior (no run content was touched — only folders with zero files were removed).

This Run Workspace is **additive** to, not a replacement for, the current-approved per-project artifact paths already documented in `workflows_and_pipelines/pipeline/pipeline.md` and each Agent's own specification (e.g., `projects/{{PROJECT_NAME}}/artifacts/context/{{PROJECT_NAME}}_ProjectContext.md`, `projects/{{PROJECT_NAME}}/artifacts/discovery/*.md`) — those remain the authoritative "current approved" locations per `workflows_and_pipelines/pipeline/pipeline.md` §7, now living as siblings of `runs/` rather than at the repository root. The Run Workspace is where the Run Manager organizes a run-scoped view — for monitoring, history, and archival — of the artifacts produced while that run was active.

# 7. Run Metadata

The Run Manager generates and maintains a single metadata file per run:

```
projects/{{PROJECT_NAME}}/artifacts/runs/RUN-YYYYMMDD-XXX-{ai_generated_slug}/metadata/run.json
```

**Schema revision (2026-07-21):** `run.json` for runs created after this revision uses the extended, camelCase-keyed schema below — it adds the Display Name, Title, Description, Objective, Workflow, and Scope fields described in §5 on top of every field the file already tracked. Per §5.4, this is additive only: pre-existing runs' `run.json` files keep their original field names and shape unchanged; they are not migrated to this schema.

`run.json` must contain the following fields:

| JSON key | Description |
|---|---|
| `runId` | This run's immutable Run ID, per §5.1 (`RUN-YYYYMMDD-XXX`) — never includes the Display Name |
| `displayName` | The AI-generated, kebab-case slug from §5.2 (e.g. `first-run-login`) — identical to the slug used in the run's folder name |
| `title` | A short, human-readable title generated from the same context as `displayName` (e.g. `"First Run - Login Module Validation"`) |
| `description` | A one-paragraph, human-readable description of what this run does and why, generated from the same context |
| `objective` | A one-sentence statement of this run's specific validation objective |
| `workflow` | The workflow this run executes, if invoked via a named workflow in `workflows_and_pipelines/workflows/` (e.g. `first_run`, `user_story_run`, `bug_fix_run`); `unversioned` if run ad hoc, outside any named workflow |
| `scope` | This run's Run Scope, per `workflows_and_pipelines/pipeline/run_scope.md` §3 (e.g. `"Login Module"`) |
| `project` | `{{PROJECT_NAME}}` |
| `pipelineVersion` | The version identifier of `workflows_and_pipelines/pipeline/pipeline.md` in effect for this run |
| `projectContextVersion` | The version suffix of the Project Context artifact this run used (e.g., `v1`), per `workflows_and_pipelines/pipeline/pipeline.md` §7 |
| `explorerVersion` | The version identifier of `.claude/skills/explorer-agent/SKILL.md` in effect for this run |
| `testDesignVersion` | The version identifier of `.claude/skills/test-design-agent/SKILL.md` in effect for this run |
| `automationVersion` | The version identifier of `.claude/skills/automation-agent/SKILL.md` in effect for this run |
| `executionVersion` | The version identifier of `.claude/skills/execution-agent/SKILL.md` in effect for this run |
| `reportingVersion` | The version identifier of `.claude/skills/reporting-agent/SKILL.md` in effect for this run |
| `browser` | The browser (name/version) used for browser-driven stages of this run |
| `environment` | The target environment, per the Project Context's Environment Constraints |
| `resolution` | The viewport/screen resolution used for browser-driven stages |
| `createdBy` | Who/what initiated the run — the requesting human's identifier if known, else `"Run Manager"` |
| `startedTime` | Timestamp the run entered `Preparing` |
| `finishedTime` | Timestamp the run reached a terminal status (`Completed`, `Failed`, or `Cancelled`); absent while the run is still active |
| `duration` | `finishedTime − startedTime`; absent while the run is still active |
| `status` | The run's current value from the Execution Status enum (§8) |

Notes:
- A "version identifier" for a component that does not yet carry an explicit version tag is recorded as `unversioned` rather than invented — the Run Manager records what exists, it does not assign version numbers to specs that don't declare one.
- `title`, `description`, and `objective` are generated once, at run creation, from the same priority-ordered context as `displayName` (§5.2) — they are not re-derived or altered by later stages.
- `run.json` is updated in place as the run progresses (e.g., `status` changes, `finishedTime`/`duration` are populated on completion) — this is metadata *about* the run, not a project artifact whose content the Run Manager is forbidden from touching (§10).

# 8. Execution Status

Every run's status is exactly one of the following values at any given time:

| Status | Meaning |
|---|---|
| **Preparing** | The Run Manager has allocated a Run ID and is creating the Run Workspace and initial `run.json`; no Agent has started yet. |
| **Running** | At least one Agent stage is actively executing for this run. |
| **Paused** | Execution has been deliberately suspended (not a checkpoint — a manual pause) and is expected to resume. |
| **Waiting For Approval** | The run is stopped at one of the Human Review / Automation Approval checkpoints defined in `workflows_and_pipelines/pipeline/pipeline.md` §5, awaiting a reviewer decision. |
| **Completed** | The run reached the terminal Reporting Agent stage and finished successfully. |
| **Failed** | The run stopped due to an error condition (e.g., an Agent could not complete its stage) rather than a deliberate pause or rejection. |
| **Cancelled** | The run was deliberately terminated before reaching a terminal stage, by explicit human decision. |

The Run Manager transitions a run's status based on mechanical signals (an Agent stage starting/finishing, a checkpoint opening per `workflows_and_pipelines/pipeline/pipeline.md` §5.3, an error being raised, an explicit pause/cancel instruction) — never based on its own interpretation of whether the Agents' output is good or correct.

# 9. Run Summary

Once a run reaches a terminal status (`Completed`, `Failed`, or `Cancelled`), the Run Manager publishes:

```
projects/{{PROJECT_NAME}}/artifacts/runs/RUN-YYYYMMDD-XXX-{ai_generated_slug}/metadata/run_summary.md
```

**Header revision (2026-07-21):** for runs created after this revision, `run_summary.md` opens with a `# Run Summary` heading followed by the run's descriptive identity fields (sourced verbatim from `run.json`, §7), before the pre-existing factual roll-up. Pre-existing runs' `run_summary.md` files are unchanged (§5.4).

`run_summary.md` must begin with:

```markdown
# Run Summary

- Run ID: {runId}
- Display Name: {displayName}
- Workflow: {workflow}
- Project: {project}
- Run Scope: {scope}
- Execution Purpose: {objective}
- Description: {description}
- Status: {status}
- Duration: {duration}
```

...then continue with the existing summary:

| Field | Description |
|---|---|
| Visited Screens | Count of distinct screens/states captured in this run's `discovery/` (a mechanical count of Explorer Agent discovery snapshots, not a judgment of exploration completeness) |
| Executed Agents | Which of the six Agents ran during this run, and in what order |
| Generated Artifacts | A count/list of artifacts produced across all Run Workspace subdirectories (§6) |
| Findings Count | Count of Finding evidence packages under this run's `discovery/findings/` |
| Evidence Count | Count of evidence items across `discovery/` (screenshots/videos/logs/network captures) and `execution/` (screenshots/traces/logs/HAR/framework reports) |
| Screenshots Count | Count of screenshot files under `discovery/` and `execution/` (including any embedded within `discovery/findings/` evidence packages) |
| Videos Count | Count of video recordings under `discovery/` and `execution/` (including any embedded within `discovery/findings/` evidence packages) |
| Logs Count | Count of log files under `discovery/` and `execution/` |
| Coverage | The mechanical ratio of in-scope modules/screens actually visited (per Discovery Artifacts) against the Project Context's declared in-scope list — a count, not an assessment of whether that coverage was sufficient |
| Overall Status | The run's final value from the Execution Status enum (§8) — the same value as the opening block's `Status`, repeated here as it was in the pre-existing summary shape |

`run_summary.md` is a factual roll-up of counts and statuses drawn from what each Agent already produced, plus the descriptive identity fields already generated for `run.json` — it must never include an assessment of quality, correctness, or defect severity. Any such judgment belongs in the Explorer Agent's Findings Summary or the Reporting Agent's Final QA Report, not here.

# 10. Rules

1. The Run Manager never performs testing of any kind — it does not drive a browser, does not call an application, and does not execute test cases.
2. The Run Manager never interprets results — it counts and records what Agents produced; it does not decide whether those results are correct, acceptable, or a defect.
3. The Run Manager never changes the content of any project artifact produced by an Agent. It may organize where artifacts live within the Run Workspace (§6) and it may create/update its own metadata files (`run.json`, `run_summary.md`), but it must never edit, rewrite, or delete an Agent-produced artifact.
4. The Run Manager only prepares and coordinates execution — Run ID allocation, Display Name/Title/Description generation (§5, §7), workspace creation, metadata tracking, status tracking, and summary publication are its entire mandate.
5. The Run Manager must not bypass, shortcut, or auto-resolve any Human Review or Automation Approval checkpoint defined in `workflows_and_pipelines/pipeline/pipeline.md` §5 — reaching `Waiting For Approval` status is as far as it goes; only a human decision moves the run past that point.
6. The Run Manager must not read the PRD — per `workflows_and_pipelines/pipeline/pipeline.md` §6 Rule 4, only Stage 1 (Project Context Agent) is permitted to do so, and the Run Manager is not a stage.

# 11. Inputs & Outputs

| | |
|---|---|
| **Inputs** | Project Name · Run Configuration (target environment, browser, resolution) · signals from each Agent stage marking start/completion/error · checkpoint state from `workflows_and_pipelines/pipeline/pipeline.md` §5.3 |
| **Outputs** | Run Workspace (§6) · `run.json` (§7) · `run_summary.md` (§9) |

The Run Manager does not consume the PRD, the Project Context's business content, or any Agent's analytical output as *input to a decision* — it only observes that those artifacts exist, where they are, and what stage produced them.

# 12. Allowed Operations

- File system: create directories (Run Workspace), create/update the Run Manager's own metadata files (`run.json`, `run_summary.md`), read (not write) Agent-produced artifacts strictly to count/organize them.
- Read-only directory-listing and file-counting operations for compiling the Run Summary (§9).

**Not permitted:** browser automation tools, any tool that edits or deletes an Agent-produced artifact's content, any tool that mutates application data, and any tool that would let it act as an Agent (e.g., generating a Finding, test case, or report section).

# 13. Architecture

The Run Manager sits outside the 6-stage Agent pipeline defined in `workflows_and_pipelines/pipeline/pipeline.md`. It is the concrete specification of the "Pipeline Orchestrator (tooling, not a person)" role already named in that document's §5.3 and §9 Roles Summary.

```
                    ┌─────────────────────────────────────────┐
                    │              Run Manager                 │
                    │  (orchestration component, not an Agent) │
                    │                                           │
                    │  Creates Run ID + Display Name,           │
                    │  Run Workspace, run.json                  │
                    │  Tracks status through the run            │
                    │  Publishes run_summary.md at the end      │
                    └───────────────────┬───────────────────────┘
                                         │ provides workspace paths to
                                         ▼
   Stage 1        Stage 2        Stage 3        Stage 4        Stage 5        Stage 6
Project Context → Explorer  → Test Design → Automation → Execution → Reporting
   Agent            Agent        Agent          Agent        Agent        Agent
```

It orchestrates *execution* — allocating identity, workspace, and tracking to a run — but it is not considered an Agent, does not appear in the Pipeline Overview diagram in `workflows_and_pipelines/pipeline/pipeline.md` §3, and does not change that diagram's stage order, gates, or artifact contracts.

# 14. Example

*Illustrative only — not executed as part of this task.*

```text
Run started for: NDC
Workflow: first_run · Run Scope: Login Module
Allocated Run ID: RUN-20260721-001
Generated Display Name: first-run-login
Run folder: RUN-20260721-001-first-run-login
```

Hypothetical resulting workspace:

```
projects/NDC/artifacts/runs/RUN-20260721-001-first-run-login/
  metadata/
    run.json
    run_summary.md
  context/
  discovery/
    findings/
  test_design/
  automation/
  execution/
  reporting/
```

Hypothetical `run.json` (abbreviated):

```json
{
  "runId": "RUN-20260721-001",
  "displayName": "first-run-login",
  "title": "First Run - Login Module Validation",
  "description": "Execute the First Run workflow against the Login module to validate the end-to-end pipeline including project context generation, application discovery, manual test design, automation generation, execution, and reporting.",
  "objective": "Validate the platform workflow for the Login module.",
  "workflow": "first_run",
  "scope": "Login Module",
  "project": "NDC",
  "pipelineVersion": "unversioned",
  "projectContextVersion": "v1",
  "explorerVersion": "unversioned",
  "testDesignVersion": "unversioned",
  "automationVersion": "unversioned",
  "executionVersion": "unversioned",
  "reportingVersion": "unversioned",
  "browser": "Chromium 126",
  "environment": "Staging",
  "resolution": "1920x1080",
  "createdBy": "Run Manager",
  "startedTime": "2026-07-21T09:00:00Z",
  "finishedTime": "2026-07-21T10:42:00Z",
  "duration": "1h42m",
  "status": "Completed"
}
```

Hypothetical `run_summary.md` (abbreviated):

```markdown
# Run Summary

- Run ID: RUN-20260721-001
- Display Name: first-run-login
- Workflow: first_run
- Project: NDC
- Run Scope: Login Module
- Execution Purpose: Validate the platform workflow for the Login module.
- Description: Execute the First Run workflow against the Login module to validate the end-to-end pipeline including project context generation, application discovery, manual test design, automation generation, execution, and reporting.
- Status: Completed
- Duration: 1h42m

- Visited Screens: 11
- Executed Agents: Project Context, Explorer, Test Design, Automation, Execution, Reporting
- Generated Artifacts: 47
- Findings Count: 6
- Evidence Count: 22
- Screenshots Count: 14
- Videos Count: 3
- Logs Count: 5
- Coverage: 11/11 in-scope screens visited
- Overall Status: Completed
```

Both examples are illustrative only, shown to make the schema concrete — no run was executed and no such files were generated as part of this specification.
