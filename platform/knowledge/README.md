# Platform Knowledge

Reusable, application-agnostic engineering knowledge — automation/repair/diagnosis strategies, Confidence Engine rules, framework best practices, synchronization patterns, retry policies, reasoning patterns. Never application-specific.

**Canonical architecture definition:** `pipeline/pipeline.md` §10 (Knowledge Architecture) — resolution order, promotion workflow, isolation guarantee, agent read/write map. This file is a pointer, not a duplicate; read §10 first.

Project-specific knowledge (business rules, UI observations, findings, execution/repair history for one application) lives instead in `projects/{{PROJECT_NAME}}/knowledge_base/` — never here.

## Structure

One concern per document, one stable ID per document (e.g. `REPAIR-001`), grouped by category:

| Folder | Contains |
|---|---|
| `automation_patterns/` | Reusable automation-generation strategies |
| `diagnosis_patterns/` | Evidence-gathering strategies (no code/behavior change) |
| `repair_patterns/` | Confirmed, cross-project repair strategies |
| `execution_patterns/` | Execution Engine rules (retry, concurrency, stop conditions) |
| `framework_patterns/` | Framework best practices (SHAFT, Playwright, etc.) |
| `confidence_patterns/` | Confidence Engine rules (how confidence is derived) |
| `reasoning/` | General AI reasoning patterns |
| `reporting/` | Reporting conventions |
| `pipeline/` | Pipeline decision patterns |
| `skills/` | Cross-cutting agent skills |

See `INDEX.md` for the full catalog of documents currently in this layer.

## Promotion

Nothing is written here automatically. A pattern arrives here only via the Promotion Workflow (`pipeline/pipeline.md` §10.5) — explicit human approval, after a project first proves the pattern out in its own `knowledge_base/`.
