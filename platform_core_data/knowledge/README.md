# Knowledge

> ## ⚠️ Superseded — this tree is residue, and no stage reads it
>
> **`platform_core_data/knowledge/` was replaced by `platform_core_data/knowledge_base/`.** The
> layout described below — `business/` + `patterns/` with the layer carried in a `scope:` frontmatter
> field — is **not** the platform's current knowledge architecture and is not what the installer
> scaffolds. The current model is defined canonically in
> [`workflows_and_pipelines/pipeline/pipeline.md`](../../workflows_and_pipelines/pipeline/pipeline.md)
> §10 and realized by `platform_core/tools/init/plan.js` (`DATA_DIRS`):
>
> | Layer | Current location |
> |---|---|
> | **Platform Knowledge** (application-agnostic, Promotion-only) | `platform_core_data/knowledge_base/patterns/` |
> | **Project Knowledge** (this application) | `platform_core_data/knowledge_base/business_rules/`, `.../lessons_learned/` |
>
> This folder is empty, has no reader, and is retained only pending cleanup — see the root
> [`README.md` §9](../../README.md#9-repository-structure) "Residue on disk, not a fifth category."
> **Never write a new file here.** Everything below is historical.

---

All of the platform's runtime knowledge, in **one tree under project data**.

**Canonical architecture definition:** [`workflows_and_pipelines/pipeline/pipeline.md`](../../workflows_and_pipelines/pipeline/pipeline.md) §10
(Knowledge Architecture) — resolution order, promotion workflow, layer guarantee, Skill read/write
map. This file is a pointer and a locator, not a duplicate; read §10 first.

## The one structural rule

> **Category is the folder. Layer is the `scope:` frontmatter field.**

```
knowledge/
├── business/          # application-specific — always scope: project
│   ├── requirements/    # requirement-derived knowledge scoped to this application
│   ├── rules/           # business rules and application-behaviour facts (BR-*, APP-*)
│   ├── ui/              # UI observations, screen/locator behaviour
│   ├── api/             # API-surface knowledge for this application
│   ├── findings/        # Finding-derived knowledge worth keeping past its run
│   └── lessons_learned/ # what a run taught us about *this application*
└── patterns/          # engineering knowledge — scope: project OR platform
    ├── automation/      # generation-time strategies
    ├── diagnosis/       # evidence-gathering strategies (no code/behaviour change)
    ├── repair/          # repair strategies and confirmed repair records
    ├── framework/       # framework best practices
    ├── execution/       # proven exceptions to Execution Engine defaults
    ├── reasoning/       # cross-Skill reasoning patterns
    └── reporting/       # reporting conventions
```

`platform_core/knowledge/` **no longer exists**. The platform layer owns capability and tooling, not
runtime knowledge; all runtime knowledge is project data. What survived that move is the *distinction*
between durable and disposable knowledge — carried by `scope:` instead of by a separate directory tree.

## The two layers, inside one tree

| `scope:` | Means | Lives in | Survives a retarget? |
|---|---|---|---|
| `project` | true of **this application only** — a screen's quirk, a business rule, one run's confirmed repair | `business/**` (always) and `patterns/**` (application-specific instances) | No — discarded with the application |
| `platform` | true of **testing engineering** — a locator recovery strategy, a retry pattern, a framework convention | `patterns/**` only | Yes — this is what compounds |

`business/**` is `scope: project` by definition. A business rule that appeared to be
application-independent would not be a business rule.

**Why keep the distinction at all?** So that retargeting the platform at a different application can
discard the application's specifics without discarding everything the platform has learned about
doing its job. A single flat pile would force a choice between losing history and carrying the old
application's assumptions forward.

**Why not two directory trees?** Because a category then existed twice — `repair_patterns/` beside
`repair/`, `reasoning/` beside nothing — and a reader had to know which tree a given ID lived in
before they could find it. Category and layer are independent facts; encoding both as folders forced
them into one hierarchy that fit neither.

## Naming and IDs

| Prefix | Meaning | Example |
|---|---|---|
| `REPAIR-NNN` | generalized repair pattern (`scope: platform`) | `patterns/repair/REPAIR-001.md` |
| `REP-NNN` | a confirmed repair record from one run (`scope: project`) | `patterns/repair/REP-001.md` |
| `REASON-NNN` | generalized reasoning pattern (`scope: platform`) | `patterns/reasoning/REASON-001.md` |
| `BR-NNN` | business rule (`scope: project`) | `business/rules/BR-001.md` |
| `APP-NNN` | application-behaviour fact (`scope: project`) | `business/rules/APP-001.md` |

A generalized document and the record it came from **coexist in the same folder**, linked in both
directions: the pattern carries `generalizes: REP-001`, the record carries
`generalized_by: REPAIR-001`. That is the promotion metadata, preserved through this migration.

## Document metadata standard

```yaml
---
id: REPAIR-003                # stable, unique, prefix-typed (see above)
scope: platform               # platform | project — the layer
category: patterns/repair     # mirrors the folder path exactly
title: <one-line summary>
status: confirmed             # proposed | confirmed | superseded | retired
tags: [spa, redirect, auth]   # free-form, retrieval-oriented
producer: automation-execution            # the Skill/workflow/human that authored this
consumers: [automation-execution, automation]  # every Skill expected to read it
generalizes: REP-001          # (platform scope) the project record this generalizes
generalized_by: REPAIR-001    # (project scope) the pattern this fed, or null
confidence: "2 executions"    # evidence count, never invented
related_knowledge: [REASON-001]
created: 2026-07-14
last_updated: 2026-07-29
version: 1
---
```

`related_knowledge` is mandatory whenever a document's content depends on another category (a
`patterns/repair/` document relying on a `patterns/framework/` fact cites it rather than restating
it). A document is never silently deleted — mark it `superseded`/`retired` with a pointer to its
replacement, preserving the record for future retrieval.

## Promotion — `scope: project` → `scope: platform`

Nothing becomes `scope: platform` automatically. Promotion is the explicit, human-gated workflow in
[`pipeline.md` §10.5](../../workflows_and_pipelines/pipeline/pipeline.md): a Skill writes
`scope: project` by default, and when it recognizes a lesson that would still hold against a
*different* application, it asks exactly once. Approved, it authors a generalized `scope: platform`
document in the matching `patterns/` category and links the two. Declined, the record stays
project-scoped and is not re-proposed on every subsequent run of the same pattern.

`business/**` never participates: it has no `platform`-scope form.

## Retired categories

- **`confidence/`** — not created. The Confidence Engine's scoring rubric is fixed Capability logic
  in the `automation-execution` Skill's specification, not promotable Knowledge. It has never needed
  a calibration layer, and keeping an empty category open for one invited scope ambiguity.
- **`pipeline_decision_patterns/`** — dropped. It was held deliberately empty under the old tree
  because no reader was ever named in `pipeline.md` §10.7 and no project-level counterpart existed to
  promote from. Carrying an empty, unreachable category through a restructure would preserve a
  mistake. Reintroduce it only alongside a named reader.
- **`skills/`** — never existed here and must not. Cross-cutting Skill capability lives in
  `.claude/skills/`, a different platform layer (Capability, not Knowledge).

## Rules

- **Always** write `scope: project` by default; `scope: platform` only via the Promotion Workflow's human gate.
- **Always** keep `category:` identical to the document's folder path.
- **Never** put an application-specific fact in a `scope: platform` document, and never "generalize on the way in" to skip the gate.
- **Never** duplicate a Skill's fixed Capability logic as a Knowledge document.
- **Never** delete a document — mark it `superseded`/`retired` with a pointer to its replacement.

## Related

- [`INDEX.md`](INDEX.md) — the catalog of every document in this tree.
- [`../../workflows_and_pipelines/pipeline/pipeline.md`](../../workflows_and_pipelines/pipeline/pipeline.md) §10 — the canonical architecture.
- [`../../platform_core/README.md`](../../platform_core/README.md) — the platform layer, which owns Tools and Prerequisites but no longer any Knowledge.
