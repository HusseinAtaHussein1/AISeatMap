# `workflows_and_pipelines/`

## Purpose

This folder exists to define the **fixed, repeatable process** that wires the platform's eight independent Skills (`.claude/skills/`) together into two governed pipelines — a Manual Execution pipeline and an Automation pipeline, sharing their first three stages — the sequencing, the artifact handoff contracts, the human checkpoints, and the run-identity/workspace mechanics around them.

`.claude/skills/` defines what each stage does *in isolation*; this folder defines *how those stages are wired together*, in what order, with what gates, and how one run is told apart from another. Without this layer, "what order do agents run in" and "who approves what" would have to be re-decided, informally, every time — this folder exists so that decision is made once and enforced mechanically on every run.

## Responsibility

**This folder owns orchestration and process governance** — control flow, approval gates, run identity, and reusable named invocations of a subset of stages. It owns none of the behavioral logic of any individual stage (that's `.claude/`'s), none of the reusable cross-project engineering knowledge a stage consults (`platform_core_data/knowledge_base/patterns/`'s), and none of the hosted application's business content (`platform_core_data/`'s).

## What Lives Here

- **The pipeline specification** — the invariant execution model for **both** pipelines: the shared Stages 1–3, the two branches that diverge from them, stage order, artifact handoff contracts, checkpoint/approval gates, versioning conventions, the two end-to-end traceability chains, and the Knowledge Architecture governing `platform_core_data/knowledge_base/patterns/` (including the two shared knowledge bases both branches read, §10.8).
- **Orchestration component specifications** — mechanical (non-judgment) components the pipeline specification delegates full detail to: run identity/workspace/status management, and the Run Scope concept (what a given run is allowed to validate).
- **Named, reusable workflows** — specific, narrower-than-full-pipeline invocations layered on top of the pipeline specification (e.g. a three-stage smoke check), never modifying it.

## What Does NOT Belong Here

- **Skill behavioral logic.** What a Skill actually does belongs in `.claude/skills/` — this folder only sequences and gates it.
- **Reusable engineering knowledge.** A repair pattern, framework fact, or reasoning heuristic belongs in `platform_core_data/knowledge_base/patterns/`, cited by a Skill, never encoded as pipeline logic here.
- **Application-specific business content.** Nothing here ever names the hosted application's screens, business rules, or requirements. Paths are written literally against `platform_core_data/`, which is a *location*, not an application identity.
- **Generated run artifacts.** Execution output lives under `platform_core_data/runs/` — this folder only defines the rules governing that structure, it never contains a run's actual output.

## Folder Structure

```
workflows_and_pipelines/
├── pipeline/
│   ├── pipeline.md       # the canonical specification of both pipelines — the shared Stages 1–3,
│   │                      #   the 4M / 4A branches, gates, versioning, traceability,
│   │                      #   Knowledge Architecture (§10), Debug Mode (§11)
│   ├── module_architecture.md  # the Module Workspace — registry, Active Module pointer, per-stage
│   │                      #   status, drift, and the module automation lifecycle
│   ├── run_manager.md    # the Run Manager — a mechanical orchestration component, not a Skill:
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
                                     platform_core_data/knowledge_base/patterns/   platform_core_data/runs/{{RUN_FOLDER}}/
```

- **`workflows_and_pipelines/` → `.claude/`:** one-directional. `pipeline.md`'s header states it "Governs" the eight Skills — it invokes each in sequence within a branch and enforces its checkpoints. A Skill never reads `pipeline.md` at runtime to decide its own behavior; it only needs to already conform to the contract this folder describes.
- **`workflows_and_pipelines/` → `platform_core_data/knowledge_base/patterns/`:** `pipeline.md` §10 is the *canonical specification* of the Knowledge Architecture that `platform_core_data/knowledge_base/patterns/` implements — that folder's own `README.md` is explicitly a pointer back here, not a duplicate.
- **`workflows_and_pipelines/` → `platform_core_data/`:** this folder defines every artifact path convention, artifact-lifecycle rule, Module/Run Workspace layout, and Run Scope concept that governs how `platform_core_data/modules/` (durable design output — Stages 1, 2, 3, `4A`, `5H`) and `platform_core_data/runs/` (per-run execution output — Stages `4M`, `5A`, `6A`) are organized, per `pipeline.md` §7 and [`pipeline/module_architecture.md`](pipeline/module_architecture.md) — but it never contains the generated content itself.
- **`.claude/` never depends back on this folder.** The dependency direction is strictly one-way: orchestration invokes behavior, behavior never invokes orchestration.

## Lifecycle

This folder isn't a participant with a "before/after" role the way Knowledge is — it **is** the lifecycle definition. It's active from the moment a run is requested through to its terminal status:

```
Run requested (optionally via a named workflows/{name}.md)
        ↓
Run Manager (run_manager.md) generates the run folder name (run-NNN__…, §5.1), creates the Run Workspace
        ↓
pipeline.md invokes Stage 1 → checkpoint (§5.1) → Stage 2 → checkpoint → Stage 3 → checkpoint
        ├─ MANUAL:     → Stage 4M → checkpoint (§5.1) → delivered (terminal)
        └─ AUTOMATION: → Stage 4A → checkpoint (§5.2) → Stage 5A (mechanical, no gate)
                        → [Stage 5H — optional, opt-in only, gate §5.6] → Stage 6A
        ↓
Each stage resolves Knowledge (platform_core_data/knowledge_base/patterns/ + platform_core_data/knowledge_base/, §10)
        ↓
Each stage writes to modules/{module}/{stage}/ (design) or runs/{{RUN_FOLDER}}/{stage}/ (execution), per pipeline.md §7
        ↓
Run reaches a terminal status (§8 of run_manager.md) — Run Manager publishes run_summary.md
```

## Design Principles

- **Layer Isolation** — orchestration, behavior, knowledge, and project content are four distinct concerns, never blurred; this is `pipeline.md` §2's own stated Architecture Principle ("Agents communicate through artifacts only").
- **Single Responsibility, mechanically enforced** — the Run Manager explicitly must never judge, analyze, or generate a Finding; its entire mandate is identity, workspace, and status bookkeeping (`run_manager.md` §3).
- **Governance-first** — nothing crosses a checkpoint without an explicit human decision; no silent timeout, no inferred approval (`pipeline.md` §5.3, §6 Rule 6).
- **Extensibility via composition, not modification** — a new named workflow is added under `workflows/` without editing `pipeline.md`, `run_manager.md`, or any Skill spec.
- **Application Agnosticism** — every rule here is expressed in terms of `platform_core_data/` and `{{RUN_FOLDER}}`, never a concrete application's modules or screens.

## Rules

- **Always** stop at a Human Review or Automation Approval checkpoint (`pipeline.md` §5.1–§5.2) — never infer approval, time out into it, or proceed on silence.
- **Always** keep one file per artifact, edited in place — a rejected-and-revised artifact is an edit to that same file, never a `.vN`/`_final` sibling or an extra "approved" copy; git is the version history (`pipeline.md` §7).
- **Never** let a named workflow under `workflows/` add a pipeline stage, remove one, or edit `pipeline.md`/`run_manager.md`/a Skill spec — it only selects and narrows what already exists.
- **Never** let the Run Manager act as a Skill — no judgment, no Finding, no test case, no report content (`run_manager.md` §3, §10).
- **Only** Stage 1 (Project Context Skill) may read the PRD — enforced structurally by this folder's own stage-order rule (`pipeline.md` §6 Rule 4), not merely by convention.
- **Must** generate every run's folder name through `platform_core/tools/run_manager` — a unique, index-prefixed `run-NNN__…` name (`run_manager.md` §5.1, §5.5) — and never rename or migrate a pre-existing run's workspace when the naming convention changes (`run_manager.md` §5.4, §5.6 Backward Compatibility).

## Typical Flow

```
Named Workflow (workflows/first_run.md)
        ↓
Run Manager creates Run Workspace, generates the run-NNN__… folder name
        ↓
pipeline.md Stage 1 (Project Context) → ⛔ checkpoint → Stage 2 (Explorer) → ⛔ checkpoint
        → Stage 3 (Test Design) → ⛔ checkpoint → Stop (this workflow excludes Stages 4M, 4A, 5A, 5H, 6A)
        ↓
Run Manifest updated at each checkpoint; Run Summary published on terminal status
```

## Common Mistakes

- **"Add a fourth Login sub-check as a new pipeline stage."** No — each pipeline's stage set is fixed (`pipeline.md` §6 Rule 3); a narrower or additional check is expressed as a named workflow selecting existing stages, never a new stage.
- **"Put this agent behavioral rule in `pipeline.md` since it affects the whole run."** No — agent behavior belongs exclusively in the corresponding `.claude/skills/{stage}/SKILL.md`; `pipeline.md` only sequences and gates it.
- **"Let the Run Manager flag this Finding since it's already tracking the run."** No — the Run Manager has no judgment role of any kind; a Finding is exclusively the Explorer Skill's output.
- **"Store this run's screenshots inside `workflows_and_pipelines/`."** No — generated run content lives under `platform_core_data/runs/`; this folder only defines the rules for that structure.

## Related Layers

- [`../.claude/`](../.claude/) — the Skills this layer sequences and gates; dependency flows one way, from here into `.claude/`.
- [`../platform_core/`](../platform_core/) — the shared runtime Tools the Skills this layer sequences invoke directly.
- [`../platform_core_data/`](../platform_core_data/) — where every artifact path, versioning rule, and Run Workspace this layer defines is actually realized on disk, and where the Knowledge Architecture canonically defined in `pipeline/pipeline.md` §10 is implemented (`patterns/` + `knowledge_base/`), not restated.
- [`../docs/USER_GUIDE.md`](../docs/USER_GUIDE.md) — the operator-facing view of what this layer specifies: running the pipeline ([§5](../docs/USER_GUIDE.md#5-run-the-pipeline)), the named workflows ([§8](../docs/USER_GUIDE.md#8-named-workflows)), and the approval gates ([§9](../docs/USER_GUIDE.md#9-approvals-and-gates)).
