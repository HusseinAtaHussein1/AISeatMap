# {{PROJECT_NAME}} Knowledge Base

Project Knowledge for this project only — never consulted by any other project (`pipeline/pipeline.md` §10.6). Scaffolded automatically at project creation (`pipeline/pipeline.md` §10.4); do not remove any subfolder even if currently empty.

Resolved alongside Platform Knowledge (`platform/knowledge/`) in the fixed order defined in `pipeline/pipeline.md` §10.2.

| Folder | Contains |
|---|---|
| `automation/` | Reusable code-asset notes specific to this project's automation package |
| `diagnosis/` | Evidence-gathering findings specific to this application |
| `repair/` | Execution-confirmed repair records for this application, each citing the Platform pattern (if any) it implements |
| `execution/` | Execution history specific to this project |
| `application/` | Application findings, known behaviors, module relationships |
| `ui/` | UI observations, navigation knowledge, screen inventory |
| `findings/` | Discovery artifacts / findings not otherwise categorized |
| `business_rules/` | Business rules discovered from this application |
| `lessons_learned/` | Project-specific lessons learned |

A pattern proven out here may be proposed for promotion to Platform Knowledge — see `pipeline/pipeline.md` §10.5. Promotion always requires explicit human approval; nothing is promoted automatically.

Update `INDEX.md` in this directory whenever a document is added, so agents can locate relevant knowledge without scanning every file.
