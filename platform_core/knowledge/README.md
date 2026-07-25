# Platform Knowledge

Reusable, application-agnostic engineering knowledge — automation/repair/diagnosis strategies, framework best practices, synchronization patterns, retry policies, reasoning patterns. Never application-specific.

**Canonical architecture definition:** `workflows_and_pipelines/pipeline/pipeline.md` §10 (Knowledge Architecture) — resolution order, promotion workflow, isolation guarantee, agent read/write map. This file is a pointer, not a duplicate; read §10 first.

Project-specific knowledge (business rules, UI observations, findings, execution/repair history for one application) lives instead in `projects/{{PROJECT_NAME}}/knowledge_base/` — never here.

## Structure

One concern per document, one stable ID per document (e.g. `REPAIR-001`), grouped by category:

| Folder | Contains |
|---|---|
| `automation_patterns/` | Reusable automation-generation strategies |
| `diagnosis_patterns/` | Evidence-gathering strategies specific to root-causing an automation/execution failure (no code/behavior change) |
| `repair_patterns/` | Confirmed, cross-project repair strategies |
| `execution_patterns/` | Proven, empirically-derived exceptions to Execution Engine defaults (e.g. an environment class where a default concurrency/retry setting needs overriding) — never the engine's core retry/concurrency/stop-condition mechanics, which are fixed capability logic in `.claude/skills/automation-execution-agent/SKILL.md` §5, §19–§20 |
| `framework_patterns/` | Framework best practices (SHAFT, Playwright, etc.) |
| `reasoning/` | General AI reasoning patterns that apply across more than one agent/skill — if a pattern is specifically about sourcing evidence during failure investigation, it belongs in `diagnosis_patterns/` instead |
| `reporting/` | Reporting conventions |
| `pipeline_decision_patterns/` | Cross-project pipeline decision heuristics (e.g. "defer Stage 5 by default for Run Scope=Bug on a Shared environment") — distinct from `workflows_and_pipelines/pipeline/`, which is the orchestration engine's own spec, not a knowledge category. **Currently held empty**: no agent or workflow is yet named as a reader in `pipeline.md` §10.7, and no project-level `knowledge_base/` counterpart folder exists to promote from — do not promote a document into this folder until both exist. |

See `INDEX.md` for the full catalog of documents currently in this layer.

There is no `skills/` category here. Cross-cutting agent capability lives in `.claude/skills/` — a different platform layer entirely (Capability, not Knowledge). Meta-guidance on how to author a good `SKILL.md` belongs as documentation alongside that layer, never inside this runtime-consulted Knowledge Base.

There is no `confidence_patterns/` category here (removed, 2026-07-21). The Confidence Engine's scoring rubric is fixed Capability logic in `.claude/skills/automation-execution-agent/SKILL.md` §27.2 — that spec is the sole source of truth for how confidence is derived.

## Document metadata standard

Every document promoted into this layer carries this frontmatter, extending the existing `id`/`title`/`category`/`status` fields already in use:

```yaml
---
id: REPAIR-003                # stable, unique, category-prefixed
title: <one-line summary>
category: repair_patterns
status: confirmed              # proposed | confirmed | superseded | retired
tags: [spa, redirect, auth]     # free-form, retrieval-oriented
producer: automation-execution-agent       # the skill/workflow/human that authored this
consumers: [automation-execution-agent, automation-agent]  # every skill expected to read it
promoted_from: NDC/REP-001      # the exact project-level document this generalizes
confidence: "2 executions, 2 projects"  # evidence count, never invented
related_knowledge: [REASON-001] # cross-references to other documents in this layer
created: 2026-07-14
last_updated: 2026-07-21
version: 1
---
```

`related_knowledge` is mandatory whenever a document's content depends on another category (e.g. a `repair_patterns/` document that relies on a `framework_patterns/` fact cites it here rather than restating it). A document is never silently deleted — mark it `superseded`/`retired` with a pointer to its replacement, preserving the record for future retrieval.

## Promotion

Nothing is written here automatically. A pattern arrives here only via the Promotion Workflow (`workflows_and_pipelines/pipeline/pipeline.md` §10.5) — explicit human approval, after a project first proves the pattern out in its own `knowledge_base/`. A category with no project-level counterpart folder and no named reader in `pipeline.md` §10.7 cannot legally receive a document under this workflow — see `pipeline_decision_patterns/` above.
