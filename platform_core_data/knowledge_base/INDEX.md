# Project Knowledge Index

Knowledge discovered from **this** application only — never consulted by any other project (`workflows_and_pipelines/pipeline/pipeline.md` §10.6).

**No application is currently hosted.** This index is empty because the prior experiment's entries were purged on 2026-07-26 along with the knowledge files they pointed at; the folder shape remains so the tree stays valid for a fresh install.

| ID | Category | Title | Platform Pattern | Path |
|---|---|---|---|---|
| _(none yet)_ | | | | |

Two categories exist, and both have no entries yet — an empty, indexed folder means "this category applies and is unpopulated," which is not the same as a missing folder (`pipeline.md` §10.4):

| Folder | Holds |
|---|---|
| `business_rules/` | A rule this application enforces — true between runs, never promoted (application-specific by definition) |
| `lessons_learned/` | A cross-run observation about working with this application |

**Seven categories were removed on 2026-07-27** (`application/`, `automation/`, `execution/`, `findings/`, `repair/`, `ui/`, `notes/`). Each had stood empty because the pipeline's own output folders already held that content in full — findings in `modules/{module}/discovery/findings/`, repair records in `modules/{module}/healing/`, automation in `modules/{module}/automation/` and the assembled `automation_baseline/`, execution history in `runs/{{RUN_FOLDER}}/execution/`. Those writes stay with the module or run that produced them, and cross-run reuse goes through the `patterns/` Promotion gate (`pipeline.md` §10.3, §10.5; `module_architecture.md` §4 for which of the two owns what).

## What to record here, and how

An entry is added whenever a stage learns something durable about the application. Use the category's own ID prefix (`REP-NNN` for repair records, `BR-NNN` for business rules, `APP-NNN` for application behavior, and so on), one file per entry, and add its row above so an agent can find it without scanning every file.

**The `Platform Pattern` column** records whether the lesson was promoted to the application-agnostic layer: a `[[REPAIR-001]]`-style link once promoted, `candidate, not yet promoted` when it looks generalizable but has not passed the gate, or `N/A — application-specific` when it never should be. Promotion is an explicit human decision and never inferred (`pipeline.md` §10.5).

## Scope of this index

This covers **Project Knowledge only** — the application-scoped categories listed above. It deliberately does not catalog [`patterns/`](patterns/), which sits nested inside this folder but is the separate, application-agnostic **Platform Knowledge** layer with its own [`patterns/INDEX.md`](patterns/INDEX.md) (`pipeline.md` §10.1, §10.6). The `diagnosis/` category moved into that layer on 2026-07-26 and was folded into its `diagnosis_patterns/` sibling on 2026-07-27; it is not indexed here.

It also does not catalog the **shared input and reference documents** that now sit at this folder's root (`PRD.md`, `run_configuration.md`, `stack.md`, `architecture.md`, and the rest) or the supporting assets beside them (`requirements/`, `api/`, `diagrams/`, `browser/`, `credentials/`). Those are inputs and project reference material rather than accumulated knowledge entries — see [`../README.md`](../README.md) for the full folder map.
