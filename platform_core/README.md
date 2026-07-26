# `platform_core/`

## Purpose

This folder exists to hold everything that stays true **no matter which application the platform is pointed at** — its own durable engineering assets, as distinct from the hosted application's business content (`platform_core_data/`), any single run's generated output, any orchestration logic (`workflows_and_pipelines/`), or any agent's behavioral specification (`.claude/`).

It is the most upstream, most stable layer in the repository: it depends on nothing else here, and everything else may draw on it.

## Responsibility

**This folder owns what any application under test can be examined *with* — never what the current one *is*.** Concretely, that splits into two reusable asset types: proven engineering *knowledge* (patterns, strategies, heuristics) and shared engineering *tooling* (runtime engines that behave identically regardless of what `platform_core_data/` currently holds).

It does not own agent behavior (`.claude/skills/`), stage sequencing (`workflows_and_pipelines/`), or anything specific to the application under test (`platform_core_data/`).

## What Lives Here

- **Platform Knowledge** (`knowledge/`) — small, versioned, human-approved documents capturing a reusable automation/repair/diagnosis/framework/reasoning pattern, never an application-specific fact.
- **Shared Tools** (`tools/`) — reusable runtime engines callable identically for any project, with zero project-specific data baked in (e.g. the Browser Driver).

Both categories share one property: population of either is deliberate. Neither grows by accretion during ordinary pipeline execution — see Rules below.

## What Does NOT Belong Here

- **Project-specific business rules, findings, credentials, or screen locators.** All of that belongs under `platform_core_data/` — never here, no matter how "generic" it looks on first observation.
- **Generated artifacts, execution results, or reports.** Those are per-project, per-run outputs under `platform_core_data/workspace/`.
- **Orchestration or sequencing logic.** Stage order, checkpoints, and run identity belong in `workflows_and_pipelines/`.
- **Agent behavioral specifications.** What an agent *does* is `.claude/skills/`'s responsibility, not this folder's.
- **Anything promoted without proof.** A category existing here (even an empty one) is not license to populate it — see the Promotion Workflow below.

## Folder Structure

```
platform_core/
├── knowledge/     # Platform Knowledge — reusable, application-agnostic engineering knowledge
│   ├── automation_patterns/         # generation-time strategies
│   ├── diagnosis_patterns/          # evidence-gathering strategies (no code/behavior change)
│   ├── repair_patterns/             # confirmed, cross-project repair strategies
│   ├── execution_patterns/         # proven exceptions to Execution Engine defaults
│   ├── framework_patterns/          # framework best practices (SHAFT, Playwright, etc.)
│   ├── reasoning/                   # general, cross-agent AI reasoning patterns
│   ├── reporting/                   # reporting conventions
│   ├── pipeline_decision_patterns/  # cross-project pipeline decision heuristics (held empty — see its README note)
│   ├── INDEX.md                     # catalog of every promoted document
│   └── README.md                    # full architecture: structure, promotion, document metadata standard
└── tools/
    └── browser_driver/  # shared browser automation engine — zero project-specific data
        ├── driver.js     # resolves project paths, loads profile + credentials, launches, logs in
        ├── api.js        # BrowserDriver — the only surface Skills/scripts use
        └── README.md
```

`knowledge/` and `tools/` are peers, not a hierarchy — a Skill may depend on either or both independently. See `platform_core/knowledge/README.md` for the full Knowledge layer specification (structure, document metadata standard, promotion mechanics) and `platform_core/tools/browser_driver/README.md` for the Tools layer's design (the four-way split between the shared engine, a project's Browser Profile, its Screen/Component Knowledge, and its Credentials).

## Interaction with Other Layers

```
platform_core_data/knowledge_base/          .claude/skills/{stage}/SKILL.md
        │                                            │
        │  Promotion Workflow                        │  Knowledge Resolution (read)
        │  (explicit human approval)                 │  + Tool invocation
        ▼                                            ▼
              platform_core/knowledge/  ◀────────────┘
              platform_core/tools/      ◀── resolves platform_core_data/ at runtime
```

- **`platform_core/` → nothing.** This layer has no dependency on `.claude/`, `workflows_and_pipelines/`, or `platform_core_data/` — it is pure, reusable content.
- **`.claude/skills/` → `platform_core/` (read-heavy).** Each Skill's `dependencies` line names exactly which `knowledge/` subfolders it consults, resolved per `workflows_and_pipelines/pipeline/pipeline.md` §10.2 (Platform Knowledge first, then `platform_core_data/knowledge_base/`). Skills also call into `tools/browser_driver/` directly; the driver resolves the profile and credentials from `platform_core_data/` itself, so no caller passes a project identifier.
- **`platform_core_data/knowledge_base/` → `platform_core/knowledge/` (write, gated).** The only path anything ever gets written here: a pattern proven against the hosted application, explicitly promoted by human approval (`pipeline.md` §10.5) — never written directly by a Skill mid-run.
- **`workflows_and_pipelines/` governs, doesn't consume.** `pipeline.md` §10 is the *canonical specification* of this folder's structure, resolution order, and promotion rules — `platform_core/knowledge/README.md` is deliberately a pointer to it, not a duplicate.

## Lifecycle

Platform Knowledge is **consulted** at the start of nearly every Skill invocation (Knowledge Resolution) but **written to** only after a run completes, via explicit human decision:

```
Skill invoked for Stage N
        ↓
Resolve platform_core/knowledge/ (first) + platform_core_data/knowledge_base/ (extends it)
        ↓
Skill performs its work using the merged context
        ↓
        ... run completes, a lesson proves reusable ...
        ↓
Promotion Workflow: human approves → platform_core/knowledge/{category}/ gains a document
```

`tools/` participates differently — it is invoked directly, synchronously, whenever a stage needs a live browser session (chiefly Explorer's Browser Automation Discovery Mode, Manual Execution's test case execution, and Automation's selector verification), not through the Knowledge Resolution flow.

## Design Principles

- **Reusability** — this folder's entire reason to exist; nothing here is single-project by definition.
- **Isolation Guarantee** — a project's own knowledge never leaks in here automatically (`pipeline.md` §10.6); only the explicit Promotion Workflow crosses that boundary.
- **Promotion Safety** — every document arrives via proof-then-approval, never invented or defaulted to "looks generic enough."
- **Zero Project-Specific Data (Tools)** — `browser_driver/` resolves every project-specific path dynamically from a `project` argument; the shared engine itself never hardcodes a project name, selector, or credential.
- **Category ≠ License** — an empty `knowledge/` subfolder existing is not permission to populate it; a category needs a defined producer, consumer, and promotion source before it may receive a document (see the 2026-07-21 governance review, `docs/CHANGELOG.md`).

## Rules

- **Always** promote a Platform Knowledge document only via explicit human approval, after it has first proven itself in a project's own `knowledge_base/`.
- **Never** write a project-specific fact, business rule, or credential here — no exception for something that "seems like it'll apply everywhere."
- **Never** populate `pipeline_decision_patterns/` until it has a named reader in `pipeline.md` §10.7 and a project-level source folder to promote from — see `knowledge/README.md`.
- **Only** `tools/browser_driver/` may contain the shared automation engine's code; project-specific profiles, screens, components, and credentials live under `platform_core_data/browser/` and `platform_core_data/credentials/` instead.
- **Must not** duplicate a Skill's own fixed Capability logic as a "Knowledge" document (e.g. the Confidence Engine's base scoring rubric, which stays in `automation-execution-skill/SKILL.md` §27.2, not in `knowledge/`).

## Typical Flow

```
Project                 Skill                              Platform Core
NDC          ──▶   automation-execution-skill invoked ──▶   resolves repair_patterns/, diagnosis_patterns/
                                                       + platform_core_data/knowledge_base/repair/
                    proposes a repair using
                    the merged context
                          │
                    repair confirmed by rerun
                          │
                    "reusable beyond NDC?" → human approves
                          ▼
                                                    platform_core/knowledge/repair_patterns/
                                                    gains REPAIR-NNN.md
```

## Common Mistakes

- **"This business rule is obviously true for every project, put it in `platform_core/knowledge/` directly."** No — it must first prove itself in that project's own `knowledge_base/`, and promotion is always a human decision, never inferred from how generic something looks.
- **"Add this project's login selectors to `platform_core/tools/browser_driver/`."** No — the shared engine holds zero project data by design; selectors belong in `platform_core_data/browser/screens/`.
- **"The category folder already exists, so it's fine to write into it."** No — an existing empty category (e.g. `pipeline_decision_patterns/`) is not itself authorization; it needs a defined consumer and promotion source first.
- **"Restate the repair rule inside the Skill spec instead of citing the Knowledge doc."** No — that duplicates content across two layers and lets them silently drift apart.

## Related Layers

- [`../.claude/`](../.claude/) — the Skills that read this layer's Knowledge and invoke its Tools.
- [`../workflows_and_pipelines/`](../workflows_and_pipelines/) — where this layer's canonical architecture (`pipeline.md` §10) is actually defined; this folder's own `knowledge/README.md` is a pointer to it, not a duplicate.
- [`../platform_core_data/`](../platform_core_data/) — the paired Project Knowledge layer, and the only legitimate source a Platform Knowledge document may be promoted from.
