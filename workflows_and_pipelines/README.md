# `workflows_and_pipelines/`

## Purpose

This folder exists to define the **fixed, repeatable process** that wires the platform's seven independent Skills (`.claude/skills/`) together into one governed pipeline — the sequencing, the artifact handoff contracts, the human checkpoints, and the run-identity/workspace mechanics around them.

`.claude/skills/` defines what each stage does *in isolation*; this folder defines *how those stages are wired together*, in what order, with what gates, and how one run is told apart from another. Without this layer, "what order do agents run in" and "who approves what" would have to be re-decided, informally, every time — this folder exists so that decision is made once and enforced mechanically on every run.

## Responsibility

**This folder owns orchestration and process governance** — control flow, approval gates, run identity, and reusable named invocations of a subset of stages. It owns none of the behavioral logic of any individual stage (that's `.claude/`'s), none of the reusable cross-project engineering knowledge a stage consults (`platform_core/knowledge/`'s), and none of the hosted application's business content (`platform_core_data/`'s).

## What Lives Here

- **The pipeline specification** — the invariant, seven-stage execution model: stage order, artifact handoff contracts, checkpoint/approval gates, versioning conventions, the end-to-end traceability chain, and the Knowledge Architecture governing `platform_core/knowledge/`.
- **Orchestration component specifications** — mechanical (non-judgment) components the pipeline specification delegates full detail to: run identity/workspace/status management, and the Run Scope concept (what a given run is allowed to validate).
- **Named, reusable workflows** — specific, narrower-than-full-pipeline invocations layered on top of the pipeline specification (e.g. a three-stage smoke check), never modifying it.

## What Does NOT Belong Here

- **Agent behavioral logic.** What a Skill actually does belongs in `.claude/skills/` — this folder only sequences and gates it.
- **Reusable engineering knowledge.** A repair pattern, framework fact, or reasoning heuristic belongs in `platform_core/knowledge/`, cited by a Skill, never encoded as pipeline logic here.
- **Application-specific business content.** Nothing here ever names the hosted application's screens, business rules, or requirements. Paths are written literally against `platform_core_data/`, which is a *location*, not an application identity.
- **Generated run artifacts.** Execution output lives under `platform_core_data/runs/` — this folder only defines the rules governing that structure, it never contains a run's actual output.

## Folder Structure

```
workflows_and_pipelines/
├── pipeline/
│   ├── pipeline.md       # the canonical 7-stage specification — stages, gates, versioning,
│   │                      #   traceability, Knowledge Architecture (§10), Debug Mode (§11)
│   ├── run_manager.md    # the Run Manager — a mechanical orchestration component, not an Agent:
│   │                      #   Run ID/workspace/metadata/status, never a judgment role
│   └── run_scope.md      # the Run Scope concept — Types (Epic/Feature/Story/Bug/...) and
│                          #   Sources (pasted text/Markdown/future ADO-Jira) a run can be narrowed to
└── workflows/
    ├── first_run.md         # named workflow: Stages 1–3 only, Login module — platform smoke check
    ├── user_story_run.md    # named workflow: scoped to one User Story
    └── bug_fix_run.md       # named workflow: scoped to one Bug
```

`pipeline/` is the **invariant core** — one execution model, valid for every project, revised only deliberately and explicitly (every revision in `pipeline.md` is dated and justified). `workflows/` is the **variable layer** — named, reusable invocations composed on top of `pipeline/`, each one narrowing scope or stage count without ever editing the specification underneath it.

## Interaction with Other Layers

```
workflows/{name}.md  ──layers on top of──▶  pipeline/pipeline.md
                                                    │
                                                    │ invokes, in order, gated by §5
                                                    ▼
                                          .claude/skills/{stage}/SKILL.md
                                                    │
                                     resolves ──────┼────── governs the rules of
                                                    ▼                  ▼
                                     platform_core/knowledge/   platform_core_data/workspace/
```

- **`workflows_and_pipelines/` → `.claude/`:** one-directional. `pipeline.md`'s header states it "Governs" the seven Skills — it invokes each in sequence and enforces its checkpoints. A Skill never reads `pipeline.md` at runtime to decide its own behavior; it only needs to already conform to the contract this folder describes.
- **`workflows_and_pipelines/` → `platform_core/`:** `pipeline.md` §10 is the *canonical specification* of the Knowledge Architecture that `platform_core/knowledge/` implements — that folder's own `README.md` is explicitly a pointer back here, not a duplicate.
- **`workflows_and_pipelines/` → `platform_core_data/`:** this folder defines every artifact path convention, versioning rule, Run Workspace layout, and Run Scope concept that governs how `platform_core_data/workspace/` (current-approved state) and `platform_core_data/runs/` (per-run snapshots) are organized — but it never contains the generated content itself.
- **`.claude/` never depends back on this folder.** The dependency direction is strictly one-way: orchestration invokes behavior, behavior never invokes orchestration.

## Lifecycle

This folder isn't a participant with a "before/after" role the way Knowledge is — it **is** the lifecycle definition. It's active from the moment a run is requested through to its terminal status:

```
Run requested (optionally via a named workflows/{name}.md)
        ↓
Run Manager (run_manager.md) allocates Run ID + Display Name, creates the Run Workspace
        ↓
pipeline.md invokes Stage 1 → checkpoint (§5.1) → Stage 2 → checkpoint → Stage 3 → checkpoint
        → Stage 4 → checkpoint (§5.1) → Stage 5 → checkpoint (§5.2) → Stage 6 (mechanical, no gate) → Stage 7
        ↓
Each stage resolves Knowledge (platform_core/knowledge/ + platform_core_data/knowledge_base/, §10)
        ↓
Each stage reads/writes platform_core_data/workspace/, per pipeline.md §7's versioning rules
        ↓
Run reaches a terminal status (§8 of run_manager.md) — Run Manager publishes run_summary.md
```

## Design Principles

- **Layer Isolation** — orchestration, behavior, knowledge, and project content are four distinct concerns, never blurred; this is `pipeline.md` §1's own stated architecture principle ("Agents communicate through artifacts only").
- **Single Responsibility, mechanically enforced** — the Run Manager explicitly must never judge, analyze, or generate a Finding; its entire mandate is identity, workspace, and status bookkeeping (`run_manager.md` §3).
- **Governance-first** — nothing crosses a checkpoint without an explicit human decision; no silent timeout, no inferred approval (`pipeline.md` §5.3, §6 Rule 6).
- **Extensibility via composition, not modification** — a new named workflow is added under `workflows/` without editing `pipeline.md`, `run_manager.md`, or any Skill spec.
- **Application Agnosticism** — every rule here is expressed in terms of `platform_core_data/` and `{{RUN_FOLDER}}`, never a concrete application's modules or screens.

## Rules

- **Always** stop at a Human Review or Automation Approval checkpoint (`pipeline.md` §5.1–§5.2) — never infer approval, time out into it, or proceed on silence.
- **Always** version every artifact; a rejected-and-revised artifact is a new version, never an in-place edit (`pipeline.md` §7).
- **Never** let a named workflow under `workflows/` add a pipeline stage, remove one, or edit `pipeline.md`/`run_manager.md`/a Skill spec — it only selects and narrows what already exists.
- **Never** let the Run Manager act as an Agent — no judgment, no Finding, no test case, no report content (`run_manager.md` §3, §10).
- **Only** Stage 1 (Project Context Agent) may read the PRD — enforced structurally by this folder's own stage-order rule (`pipeline.md` §6 Rule 4), not merely by convention.
- **Must** allocate a unique, immutable Run ID for every run and never rename or migrate a pre-existing run's workspace when the naming convention changes (`run_manager.md` §5.4 Backward Compatibility).

## Typical Flow

```
Named Workflow (workflows/first_run.md)
        ↓
Run Manager creates Run Workspace, allocates Run ID
        ↓
pipeline.md Stage 1 (Project Context) → ⛔ checkpoint → Stage 2 (Explorer) → ⛔ checkpoint
        → Stage 3 (Test Design) → ⛔ checkpoint → Stop (this workflow excludes Stages 4–7)
        ↓
Run Manifest updated at each checkpoint; Run Summary published on terminal status
```

## Common Mistakes

- **"Add a fourth Login sub-check as a new pipeline stage."** No — the pipeline is fixed at seven stages (`pipeline.md` §6 Rule 3); a narrower or additional check is expressed as a named workflow selecting existing stages, never a new stage.
- **"Put this agent behavioral rule in `pipeline.md` since it affects the whole run."** No — agent behavior belongs exclusively in the corresponding `.claude/skills/{stage}/SKILL.md`; `pipeline.md` only sequences and gates it.
- **"Let the Run Manager flag this Finding since it's already tracking the run."** No — the Run Manager has no judgment role of any kind; a Finding is exclusively the Explorer Agent's output.
- **"Store this run's screenshots inside `workflows_and_pipelines/`."** No — generated run content lives under `platform_core_data/runs/`; this folder only defines the rules for that structure.

## Related Layers

- [`../.claude/`](../.claude/) — the Skills this layer sequences and gates; dependency flows one way, from here into `.claude/`.
- [`../platform_core/`](../platform_core/) — whose Knowledge Architecture (`platform_core/knowledge/`) is canonically defined in `pipeline/pipeline.md` §10, not restated there.
- [`../platform_core_data/`](../platform_core_data/) — where every artifact path, versioning rule, and Run Workspace this layer defines is actually realized on disk.
