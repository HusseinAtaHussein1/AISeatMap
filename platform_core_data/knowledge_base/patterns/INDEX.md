# Platform Knowledge Index

| ID | Category | Title | Status | Producer | Consumers | Path |
|---|---|---|---|---|---|---|
| REPAIR-001 | repair_patterns | Bounded poll for post-submit redirect state, not an immediate assertion | Confirmed | automation-execution-skill | automation-execution-skill, automation-skill | `repair_patterns/REPAIR-001.md` |
| REPAIR-002 | repair_patterns | Transient toast/snackbar — text-content locator + non-throwing presence poll | Confirmed | automation-execution-skill | automation-execution-skill, automation-skill | `repair_patterns/REPAIR-002.md` |
| REASON-001 | reasoning | Prefer Direct Observation over secondary/documentation sources for expected values | Confirmed | automation-execution-skill | automation-execution-skill, automation-skill, test-design-skill | `reasoning/REASON-001.md` |

Empty categories (`automation_patterns/`, `diagnosis_patterns/`, `execution_patterns/`, `framework_patterns/`, `reporting/`) have no promoted documents yet — see `workflows_and_pipelines/pipeline/pipeline.md` §10.5 for how a document arrives here.

`pipeline_decision_patterns/` is intentionally excluded from that list: it has no defined reader in `pipeline.md` §10.7 and no project-level counterpart folder to promote from, so it cannot yet participate in the Promotion Workflow at all — see `README.md`. (A separate, empty `diagnosis/` folder was relocated into this layer on 2026-07-26 and folded into `diagnosis_patterns/` on 2026-07-27.)

This index catalogs the **Platform Knowledge** layer only. Although this folder is nested inside `platform_core_data/knowledge_base/` as of 2026-07-26, the surrounding project-scoped folders are a separate layer with their own `../INDEX.md` — see `pipeline.md` §10.1 and §10.6.
