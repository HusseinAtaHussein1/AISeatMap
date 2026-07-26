# Platform Knowledge Index

| ID | Category | Title | Status | Producer | Consumers | Path |
|---|---|---|---|---|---|---|
| REPAIR-001 | repair_patterns | Bounded poll for post-submit redirect state, not an immediate assertion | Confirmed | automation-execution-skill | automation-execution-skill, automation-skill | `repair_patterns/REPAIR-001.md` |
| REPAIR-002 | repair_patterns | Transient toast/snackbar — text-content locator + non-throwing presence poll | Confirmed | automation-execution-skill | automation-execution-skill, automation-skill | `repair_patterns/REPAIR-002.md` |
| REASON-001 | reasoning | Prefer Direct Observation over secondary/documentation sources for expected values | Confirmed | automation-execution-skill | automation-execution-skill, automation-skill, test-design-skill | `reasoning/REASON-001.md` |

Empty categories (`automation_patterns/`, `diagnosis_patterns/`, `execution_patterns/`, `framework_patterns/`, `reporting/`) have no promoted documents yet — see `workflows_and_pipelines/pipeline/pipeline.md` §10.5 for how a document arrives here.

`pipeline_decision_patterns/` is intentionally excluded from that list: it has no defined reader in `pipeline.md` §10.7 and no project-level `knowledge_base/` counterpart to promote from, so it cannot yet participate in the Promotion Workflow at all — see `README.md`.
