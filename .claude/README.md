# `.claude/`

## Purpose

This folder exists to hold the platform's **Capability layer** — the executable behavioral specifications the harness loads as Skills. Every other layer in this repository (orchestration, knowledge, project content) is inert documentation or data; `.claude/skills/` is where "what an agent actually does" is defined in a form the harness can load and invoke by name.

It exists as its own top-level folder, separate from `platform_core/` and `workflows_and_pipelines/`, because Capability is architecturally distinct from Knowledge and from Orchestration — a distinction this platform enforces deliberately (see the 2026-07-21 Platform Knowledge governance review, which removed a `platform_core_data/knowledge_base/patterns/skills/` category for exactly this reason: Capability must never be duplicated inside the Knowledge layer).

## Responsibility

**This folder owns what each pipeline agent does in isolation** — its own contract (declared inputs, outputs, dependencies) and its own behavioral rules, execution logic, and stop conditions.

It does **not** own *when* or *in what order* agents run (that is `workflows_and_pipelines/`'s responsibility), *what reusable engineering knowledge* an agent consults (`platform_core_data/knowledge_base/patterns/`'s responsibility), or *what the hosted application's business content is* (the rest of `platform_core_data/`'s responsibility). A Skill in this folder is written to be correct standing entirely alone, independent of which application `platform_core_data/` currently holds.

## What Lives Here

- **Skills** — one `SKILL.md` per pipeline-stage agent, each a self-contained behavioral specification: a YAML frontmatter contract (`name`, `description`, `inputs`, `outputs`, `dependencies`) followed by the full prose specification of that agent's rules, execution logic, output contract, and stop conditions.
- **Harness configuration** — `settings.json` / `settings.local.json`, the permission and tooling configuration for the coding-agent harness itself (e.g. allowlisted shell commands). This is operational tooling config, not part of the platform's own architecture.

## What Does NOT Belong Here

- **Orchestration or sequencing logic.** Stage order, checkpoints, approval gates, and run identity/workspace management belong in `workflows_and_pipelines/` — a Skill file never declares when it runs relative to another Skill.
- **Reusable, cross-project engineering knowledge.** A pattern, heuristic, or repair strategy proven across projects belongs in `platform_core_data/knowledge_base/patterns/`, cited from a Skill's `dependencies` line — never restated or grown in place inside the Skill spec itself.
- **Project-specific business rules, findings, or credentials.** Anything true of one application only belongs under `platform_core_data/`.
- **Generated artifacts, execution results, or reports.** A Skill's *output* always lands under `platform_core_data/workspace/` — never inside `.claude/` itself.
- **Revision history.** A Skill's own change log is not recorded inline in the `SKILL.md` file — it lives in `docs/CHANGELOG.md`, so each spec describes only its current behavior.

## Folder Structure

```
.claude/
├── settings.json / settings.local.json   # harness permission/tooling config
└── skills/
    ├── project-context-skill/SKILL.md    # Stage 1 — PRD + Run Configuration → Project Context
    ├── explorer-skill/SKILL.md           # Stage 2 — Project Context → Discovery Artifacts + Findings
    ├── test-design-skill/SKILL.md        # Stage 3 — Discovery → Manual Test Suite + Traceability Matrix
    ├── manual-execution-skill/SKILL.md   # Stage 4 — Manual Test Suite → Manual Execution Results + Automation Candidate Package
    ├── automation-skill/SKILL.md         # Stage 5 — Automation Candidate Package → Automation Package
    ├── automation-execution-skill/SKILL.md  # Stage 6 — Automation Package → Execution Results
    └── reporting-skill/SKILL.md          # Stage 7 — Execution Results → Final QA Report
```

Each subfolder corresponds 1:1 to one of the seven pipeline stages defined in `workflows_and_pipelines/pipeline/pipeline.md` §4 — there is no Skill here without a matching stage, and no stage without a matching Skill. Siblings never call each other directly; each declares its own inputs/outputs, and it is the orchestration layer's job to wire the output of one into the input of the next.

## Interaction with Other Layers

```
workflows_and_pipelines/pipeline/pipeline.md
        │  (governs — sequences, gates, invokes)
        ▼
   .claude/skills/{stage}/SKILL.md
        │  (resolves, per its own dependencies line)
        ├──▶ platform_core_data/knowledge_base/patterns/   (Platform Knowledge — read-only, Promotion writes only)
        ├──▶ platform_core/tools/           (shared engines, e.g. browser_driver)
        └──▶ platform_core_data/            (reads its declared Inputs, writes its declared Outputs)
```

- **`workflows_and_pipelines/` → `.claude/`:** one-directional. `pipeline.md`'s header states it "Governs" the seven skills; it invokes them in a fixed order and enforces checkpoints. A Skill never reads `pipeline.md` to decide its own behavior — it only needs to already conform to the contract that document describes.
- **`.claude/` → `platform_core_data/knowledge_base/patterns/` and `platform_core/tools/`:** each Skill's `dependencies` line names exactly which Platform Knowledge subfolders it consults (e.g. `automation-skill` reads `repair_patterns/`, `automation_patterns/`, `framework_patterns/`) and, where relevant, which shared tool it uses (e.g. the Browser Driver, `platform_core/tools/browser_driver/`).
- **`.claude/` → `platform_core_data/`:** every Skill's actual Inputs and Outputs at runtime resolve to files under `platform_core_data/workspace/` (and, for knowledge writes, `platform_core_data/knowledge_base/`). A Skill file names those paths literally — there is no project-name segment to substitute, because the platform hosts one project (`pipeline.md` §1).

## Lifecycle

A Skill participates every time its stage is invoked during a pipeline run — it has no independent lifecycle of its own outside that invocation:

```
Run invoked (workflows_and_pipelines/)
        ↓
Pipeline Orchestrator invokes Stage N's Skill
        ↓
Skill resolves Platform Knowledge + Project Knowledge (pipeline.md §10.2)
        ↓
Skill reads its declared Inputs from platform_core_data/workspace/
        ↓
Skill produces its declared Outputs, marks itself Pending Review/Approval
        ↓
Human checkpoint clears (pipeline.md §5) → Stage N+1 invoked
```

## Design Principles

- **Single Responsibility** — one Skill, one pipeline stage, one concern.
- **Statelessness** — a Skill retains no memory between runs; every invocation re-supplies its declared Inputs fresh.
- **Separation of Concerns** — contract (this folder) is deliberately split from orchestration (`workflows_and_pipelines/`), per `pipeline.md` §1's own stated architecture principle: "Agents communicate through artifacts only."
- **Application Agnosticism** — every Skill is written once, generically, and runs unchanged if `platform_core_data/` is retargeted at a different application. A Skill must never name a screen, business rule, or requirement of the currently hosted one.
- **Governed Extensibility** — adding a Skill means adding a pipeline stage, a deliberate architectural decision (see `workflows_and_pipelines/pipeline/pipeline.md` §6 Rule 3: no stage may be skipped, and none may be added silently).

## Rules

- **Always** declare `inputs`, `outputs`, and `dependencies` in YAML frontmatter before any prose specification.
- **Always** cite a `platform_core_data/knowledge_base/patterns/` subfolder by name in `dependencies` rather than restating its content inline.
- **Always** state a rule exactly once, in the numbered section that owns it, and cite that section (`§N`) from anywhere else that needs it. A Skill's `Operational Contract` section names the role and points at the sections that specify execution — it never restates them as a second, parallel copy of the spec.
- **Never** renumber an existing section. Section numbers are cited by `workflows_and_pipelines/`, `docs/`, and run artifacts across the repo; append new sections rather than shifting existing ones.
- **Never** read the PRD, except `project-context-skill` — the only Skill permitted to (`pipeline.md` §6 Rule 4).
- **Never** invoke another Skill directly — sequencing is `workflows_and_pipelines/`'s responsibility, never this folder's.
- **Never** embed project-specific business logic, screen names, or credentials — a Skill file must remain correct for every project.
- **Must not** grow a Skill's own scoring rubric or engine mechanics into a "promotable knowledge" category once it's fixed Capability logic (e.g. the Confidence Engine rubric in `automation-execution-skill/SKILL.md` §27.2) — that logic stays here, permanently, as Capability.
- **Must** record revision history in `docs/CHANGELOG.md`, never inline in the `SKILL.md` itself.

## Typical Flow

```
Pipeline Orchestrator (workflows_and_pipelines/pipeline/pipeline.md)
        ↓
.claude/skills/automation-skill/SKILL.md invoked for Stage 5
        ↓
Resolves platform_core_data/knowledge_base/patterns/repair_patterns/, automation_patterns/, framework_patterns/
        ↓
Reads platform_core_data/workspace/manual_execution/ (Automation Candidate Package — its declared primary Input) and artifacts/test_design/ (content source)
        ↓
Writes platform_core_data/workspace/automation/ (its declared Output)
        ↓
Marks Pending Automation Approval — pipeline.md §5.2 checkpoint
```

## Common Mistakes

- **"Add the new sequencing rule to the Skill file."** No — sequencing, gates, and stage order belong exclusively in `workflows_and_pipelines/pipeline/pipeline.md`.
- **"This repair pattern is proven now, just leave it growing inside `automation-execution-skill/SKILL.md`."** No — once a pattern is confirmed reusable across projects, it is promoted to `platform_core_data/knowledge_base/patterns/repair_patterns/`, cited from the Skill's `dependencies` line, not accumulated inline indefinitely.
- **"Note this project's specific screen name in the Skill spec so it's handled correctly."** No — a Skill file must stay project-agnostic; project specifics belong in `platform_core_data/`.
- **"Log this revision at the top of the SKILL.md like before."** No — revision history was deliberately extracted to `docs/CHANGELOG.md`; a Skill file describes only its current behavior.

## Related Layers

- [`../platform_core/`](../platform_core/) — the reusable shared Tools every Skill's `dependencies` line draws from.
- [`../workflows_and_pipelines/`](../workflows_and_pipelines/) — the orchestration layer that sequences and gates every Skill defined here.
- [`../platform_core_data/`](../platform_core_data/) — where every Skill's actual Inputs and Outputs live at runtime, where the reusable Platform Knowledge it cites lives (`patterns/`), and where application-specific knowledge/business content is kept out of this layer entirely.
- [`../docs/USER_GUIDE.md`](../docs/USER_GUIDE.md) — how a human invokes these Skills, including **direct invocation outside pipeline order** and its approve-and-recommend / degraded-run semantics ([§6](../docs/USER_GUIDE.md#6-calling-a-single-skill-directly)).
