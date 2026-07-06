> **Position:** Outside the 6-stage Agent pipeline defined in [`pipeline/pipeline.md`](pipeline.md) and [`agents/`](../agents/). The Run Manager is an **orchestration component, not an Agent** — it does not appear as a stage in `pipeline/pipeline.md`'s Pipeline Overview, and this document does not alter that stage order.
> **Relationship to existing concepts:** `pipeline/pipeline.md` §5.3/§9 already names a "Pipeline Orchestrator (tooling, not a person)" responsible for invoking agents in order and maintaining a Run Manifest (§7). The Run Manager is the full specification of that tooling role. It is additive: it does not change the Pipeline Orchestrator's responsibilities, the six agents' Input/Output contracts, or any existing artifact path documented elsewhere.
> **Scope of this revision:** This document defines the Run Manager only. No existing agent file, the pipeline specification, or any project artifact has been modified or generated as part of authoring it. Wiring the six agents to read/write inside a Run Workspace (§6) is a future integration step, out of scope here.

# 1. Component Name

**Run Manager**

# 2. Purpose

The Run Manager is an orchestration component responsible for preparing, organizing, monitoring, and finalizing every execution run of the Agentic AI Testing Platform pipeline.

**It is not an AI Agent.** It never analyzes software behavior, never forms an opinion about whether observed behavior is correct, never generates Findings, and never generates test cases. It has no judgment role anywhere in the pipeline. Its entire responsibility is mechanical: give every run a unique identity, a well-organized workspace, and a running record of what happened — nothing about *whether* what happened was good or bad.

Where the six Agents (Project Context, Explorer, Test Design, Automation, Execution, Reporting) answer "what does the application do, and what should be tested, built, run, and reported," the Run Manager only answers "which run is this, where does its output go, and what state is it in."

# 3. Non-Responsibilities

To keep this component's boundary unambiguous, the Run Manager explicitly must **not**:

- Analyze, interpret, or judge application behavior.
- Generate, classify, score, or triage Findings (that is the Explorer Agent's responsibility — see `agents/explorer_agent.md`).
- Generate, design, or modify test cases (Test Design Agent) or automation scripts (Automation Agent).
- Decide whether a run "passed" or "succeeded" in a quality sense — it records mechanical status (§8), not a verdict.
- Modify the content of any artifact an Agent produces.
- Substitute for, or bypass, any Human Review / Automation Approval checkpoint defined in `pipeline/pipeline.md` §5.

# 4. Responsibilities

The Run Manager must:

1. **Create a unique Run ID** for every execution run, per the naming convention in §5.
2. **Create the Run Workspace** — the directory structure in §6 — before any Agent begins work for that run.
3. **Generate Run Metadata** (`run.json`, §7) at the start of the run and keep it current as the run progresses.
4. **Provide workspace paths to downstream agents** — the concrete, run-scoped paths each Agent should treat as its working directory for that run's artifacts.
5. **Track execution status** — maintaining the run's current state from the Execution Status enum (§8) as the run moves through the pipeline.
6. **Maintain artifact organization** — ensuring every artifact produced during the run lands in the correct subdirectory of the Run Workspace (§6), without altering the content of any artifact.
7. **Publish a Run Summary** (`run_summary.md`, §9) once the run reaches a terminal status.

# 5. Run Naming Convention

Run IDs are generated as:

```
RUN-YYYYMMDD-XXX
```

- `YYYYMMDD` — the run's start date.
- `XXX` — a zero-padded, 3-digit sequence number, starting at `001` for the first run started on that date and incrementing for each subsequent run started the same date. The sequence resets at `001` on the next calendar date.
- The Run Manager is responsible for guaranteeing uniqueness even if two runs are requested at nearly the same time — it must allocate the sequence number atomically, never hand out the same Run ID twice.

Examples:

```
RUN-20260706-001
RUN-20260706-002
```

# 6. Workspace Structure

For every run, the Run Manager creates the following directory tree before any Agent starts:

```
artifacts/
  {{PROJECT_NAME}}/
    runs/
      RUN-YYYYMMDD-XXX/
        context/
        discovery/
        findings/
        evidence/
        screenshots/
        videos/
        logs/
        network/
        reports/
        metadata/
```

- `context/` — the Project Context version(s) used by this run.
- `discovery/` — Explorer Agent discovery snapshots produced during this run.
- `findings/` — Explorer Agent Finding evidence packages produced during this run (see `agents/explorer_agent.md` §5.11).
- `evidence/` — general evidence artifacts that don't fall under the more specific subdirectories below.
- `screenshots/` — screenshot evidence, run-wide.
- `videos/` — video/session recordings, run-wide.
- `logs/` — console and application logs, run-wide.
- `network/` — network captures (e.g., HAR files), run-wide.
- `reports/` — QA Assessment Report, Final QA Report, and any other stage report generated during this run.
- `metadata/` — `run.json` (§7) and `run_summary.md` (§9), plus any other run-bookkeeping file.

This Run Workspace is **additive** to, not a replacement for, the flat per-project artifact paths already documented in `pipeline/pipeline.md` and each Agent's own specification (e.g., `artifacts/{{PROJECT_NAME}}/context/{{PROJECT_NAME}}_ProjectContext.md`, `artifacts/{{PROJECT_NAME}}/discovery/*.md`). Those remain the authoritative "current approved" locations per `pipeline/pipeline.md` §7. The Run Workspace is where the Run Manager organizes a run-scoped view — for monitoring, history, and archival — of the artifacts produced while that run was active.

# 7. Run Metadata

The Run Manager generates and maintains a single metadata file per run:

```
artifacts/{{PROJECT_NAME}}/runs/RUN-YYYYMMDD-XXX/metadata/run.json
```

`run.json` must contain the following fields:

| Field | Description |
|---|---|
| Run ID | This run's unique identifier, per §5 |
| Project Name | `{{PROJECT_NAME}}` |
| Pipeline Version | The version identifier of `pipeline/pipeline.md` in effect for this run |
| Project Context Version | The version suffix of the Project Context artifact this run used (e.g., `v1`), per `pipeline/pipeline.md` §7 |
| Explorer Version | The version identifier of `agents/explorer_agent.md` in effect for this run |
| Test Design Version | The version identifier of `agents/test_design_agent.md` in effect for this run |
| Automation Version | The version identifier of `agents/automation_agent.md` in effect for this run |
| Execution Version | The version identifier of `agents/execution_agent.md` in effect for this run |
| Reporting Version | The version identifier of `agents/reporting_agent.md` in effect for this run |
| Browser | The browser (name/version) used for browser-driven stages of this run |
| Environment | The target environment, per the Project Context's Environment Constraints |
| Resolution | The viewport/screen resolution used for browser-driven stages |
| Started Time | Timestamp the run entered `Preparing` |
| Finished Time | Timestamp the run reached a terminal status (`Completed`, `Failed`, or `Cancelled`); absent while the run is still active |
| Duration | `Finished Time − Started Time`; absent while the run is still active |
| Status | The run's current value from the Execution Status enum (§8) |

Notes:
- A "version identifier" for a component that does not yet carry an explicit version tag is recorded as `unversioned` rather than invented — the Run Manager records what exists, it does not assign version numbers to specs that don't declare one.
- `run.json` is updated in place as the run progresses (e.g., `Status` changes, `Finished Time`/`Duration` are populated on completion) — this is metadata *about* the run, not a project artifact whose content the Run Manager is forbidden from touching (§10).

# 8. Execution Status

Every run's status is exactly one of the following values at any given time:

| Status | Meaning |
|---|---|
| **Preparing** | The Run Manager has allocated a Run ID and is creating the Run Workspace and initial `run.json`; no Agent has started yet. |
| **Running** | At least one Agent stage is actively executing for this run. |
| **Paused** | Execution has been deliberately suspended (not a checkpoint — a manual pause) and is expected to resume. |
| **Waiting For Approval** | The run is stopped at one of the Human Review / Automation Approval checkpoints defined in `pipeline/pipeline.md` §5, awaiting a reviewer decision. |
| **Completed** | The run reached the terminal Reporting Agent stage and finished successfully. |
| **Failed** | The run stopped due to an error condition (e.g., an Agent could not complete its stage) rather than a deliberate pause or rejection. |
| **Cancelled** | The run was deliberately terminated before reaching a terminal stage, by explicit human decision. |

The Run Manager transitions a run's status based on mechanical signals (an Agent stage starting/finishing, a checkpoint opening per `pipeline/pipeline.md` §5.3, an error being raised, an explicit pause/cancel instruction) — never based on its own interpretation of whether the Agents' output is good or correct.

# 9. Run Summary

Once a run reaches a terminal status (`Completed`, `Failed`, or `Cancelled`), the Run Manager publishes:

```
artifacts/{{PROJECT_NAME}}/runs/RUN-YYYYMMDD-XXX/metadata/run_summary.md
```

`run_summary.md` must include:

| Field | Description |
|---|---|
| Run ID | This run's unique identifier |
| Duration | Total elapsed time, per `run.json`'s `Duration` |
| Visited Screens | Count of distinct screens/states captured in this run's `discovery/` (a mechanical count of Explorer Agent discovery snapshots, not a judgment of exploration completeness) |
| Executed Agents | Which of the six Agents ran during this run, and in what order |
| Generated Artifacts | A count/list of artifacts produced across all Run Workspace subdirectories (§6) |
| Findings Count | Count of Finding evidence packages under this run's `findings/` |
| Evidence Count | Count of evidence items across `evidence/`, `screenshots/`, `videos/`, `logs/`, and `network/` |
| Screenshots Count | Count of screenshot files under `screenshots/` (and any embedded within `findings/` evidence packages) |
| Videos Count | Count of video recordings under `videos/` (and any embedded within `findings/` evidence packages) |
| Logs Count | Count of log files under `logs/` |
| Coverage | The mechanical ratio of in-scope modules/screens actually visited (per Discovery Artifacts) against the Project Context's declared in-scope list — a count, not an assessment of whether that coverage was sufficient |
| Overall Status | The run's final value from the Execution Status enum (§8) |

`run_summary.md` is a factual roll-up of counts and statuses drawn from what each Agent already produced — it must never include an assessment of quality, correctness, or defect severity. Any such judgment belongs in the Explorer Agent's Findings Summary or the Reporting Agent's Final QA Report, not here.

# 10. Rules

1. The Run Manager never performs testing of any kind — it does not drive a browser, does not call an application, and does not execute test cases.
2. The Run Manager never interprets results — it counts and records what Agents produced; it does not decide whether those results are correct, acceptable, or a defect.
3. The Run Manager never changes the content of any project artifact produced by an Agent. It may organize where artifacts live within the Run Workspace (§6) and it may create/update its own metadata files (`run.json`, `run_summary.md`), but it must never edit, rewrite, or delete an Agent-produced artifact.
4. The Run Manager only prepares and coordinates execution — Run ID allocation, workspace creation, metadata tracking, status tracking, and summary publication are its entire mandate.
5. The Run Manager must not bypass, shortcut, or auto-resolve any Human Review or Automation Approval checkpoint defined in `pipeline/pipeline.md` §5 — reaching `Waiting For Approval` status is as far as it goes; only a human decision moves the run past that point.
6. The Run Manager must not read the PRD — per `pipeline/pipeline.md` §6 Rule 4, only Stage 1 (Project Context Agent) is permitted to do so, and the Run Manager is not a stage.

# 11. Inputs & Outputs

| | |
|---|---|
| **Inputs** | Project Name · Run Configuration (target environment, browser, resolution) · signals from each Agent stage marking start/completion/error · checkpoint state from `pipeline/pipeline.md` §5.3 |
| **Outputs** | Run Workspace (§6) · `run.json` (§7) · `run_summary.md` (§9) |

The Run Manager does not consume the PRD, the Project Context's business content, or any Agent's analytical output as *input to a decision* — it only observes that those artifacts exist, where they are, and what stage produced them.

# 12. Allowed Operations

- File system: create directories (Run Workspace), create/update the Run Manager's own metadata files (`run.json`, `run_summary.md`), read (not write) Agent-produced artifacts strictly to count/organize them.
- Read-only directory-listing and file-counting operations for compiling the Run Summary (§9).

**Not permitted:** browser automation tools, any tool that edits or deletes an Agent-produced artifact's content, any tool that mutates application data, and any tool that would let it act as an Agent (e.g., generating a Finding, test case, or report section).

# 13. Architecture

The Run Manager sits outside the 6-stage Agent pipeline defined in `pipeline/pipeline.md`. It is the concrete specification of the "Pipeline Orchestrator (tooling, not a person)" role already named in that document's §5.3 and §9 Roles Summary.

```
                    ┌─────────────────────────────────────────┐
                    │              Run Manager                 │
                    │  (orchestration component, not an Agent) │
                    │                                           │
                    │  Creates Run ID, Run Workspace, run.json  │
                    │  Tracks status through the run            │
                    │  Publishes run_summary.md at the end      │
                    └───────────────────┬───────────────────────┘
                                         │ provides workspace paths to
                                         ▼
   Stage 1        Stage 2        Stage 3        Stage 4        Stage 5        Stage 6
Project Context → Explorer  → Test Design → Automation → Execution → Reporting
   Agent            Agent        Agent          Agent        Agent        Agent
```

It orchestrates *execution* — allocating identity, workspace, and tracking to a run — but it is not considered an Agent, does not appear in the Pipeline Overview diagram in `pipeline/pipeline.md` §3, and does not change that diagram's stage order, gates, or artifact contracts.

# 14. Example

*Illustrative only — not executed as part of this task.*

```text
Run started for: OrangeHRM
Allocated Run ID: RUN-20260706-001
```

Hypothetical resulting workspace:

```
artifacts/OrangeHRM/runs/RUN-20260706-001/
  context/
  discovery/
  findings/
  evidence/
  screenshots/
  videos/
  logs/
  network/
  reports/
  metadata/
    run.json
    run_summary.md
```

Hypothetical `run.json` (abbreviated):

```json
{
  "Run ID": "RUN-20260706-001",
  "Project Name": "OrangeHRM",
  "Pipeline Version": "unversioned",
  "Project Context Version": "v1",
  "Explorer Version": "unversioned",
  "Test Design Version": "unversioned",
  "Automation Version": "unversioned",
  "Execution Version": "unversioned",
  "Reporting Version": "unversioned",
  "Browser": "Chromium 126",
  "Environment": "Staging",
  "Resolution": "1920x1080",
  "Started Time": "2026-07-06T09:00:00Z",
  "Finished Time": "2026-07-06T10:42:00Z",
  "Duration": "1h42m",
  "Status": "Completed"
}
```

Hypothetical `run_summary.md` (abbreviated):

```markdown
# Run Summary — RUN-20260706-001

- Run ID: RUN-20260706-001
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
