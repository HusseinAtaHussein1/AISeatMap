# {{PROJECT_NAME}} — Project Knowledge

This folder contains **all project-specific knowledge for {{PROJECT_NAME}} only** — onboarding notes, run configuration, the architecture of the application under test, and domain terminology. It does not contain any pipeline output.

**Generated outputs remain under [`projects/{{PROJECT_NAME}}/artifacts/`](../../projects/{{PROJECT_NAME}}/artifacts/)** — Project Context, Discovery Artifacts, Manual Test Suites, Automation Scripts, Execution Results, Reports, and Run Workspaces, per `pipeline/pipeline.md` and `pipeline/run_manager.md`. Nothing in this folder is read or written by the pipeline agents themselves; it exists for the humans (and future agent sessions) who need to get oriented on this project before or between pipeline runs.

## Files in this folder

| File | Purpose |
|---|---|
| [`onboarding.md`](onboarding.md) | Start here — what {{PROJECT_NAME}} is, where its knowledge lives, how to get oriented fast |
| [`run_configuration.md`](run_configuration.md) | The run configuration (modules in scope, target URL, credentials, environment constraints) the Project Context Agent consumes |
| [`architecture.md`](architecture.md) | Architecture of the {{PROJECT_NAME}} application under test (not the testing platform itself) |
| [`glossary.md`](glossary.md) | {{PROJECT_NAME}} domain/product terminology |
| [`resources/`](resources/) | Supplementary reference material — see `resources/README.md` for the standardized subfolder layout |

## Where the real project artifacts live

| Artifact | Path |
|---|---|
| Product Requirements Document | `projects/{{PROJECT_NAME}}/PRD.md` |
| Project Context (current approved) | `projects/{{PROJECT_NAME}}/artifacts/context/{{PROJECT_NAME}}_ProjectContext.md` |
| Discovery Artifacts | `projects/{{PROJECT_NAME}}/artifacts/discovery/*.md` |
| Manual Test Suites & Traceability Matrix | `projects/{{PROJECT_NAME}}/artifacts/test_design/` |
| Automation Scripts | `projects/{{PROJECT_NAME}}/artifacts/automation/` |
| Run Workspaces | `projects/{{PROJECT_NAME}}/artifacts/runs/RUN-YYYYMMDD-XXX/` |
| Run Manifest | `projects/{{PROJECT_NAME}}/artifacts/pipeline/{{PROJECT_NAME}}_RunManifest.md` |
| Reports | `projects/{{PROJECT_NAME}}/artifacts/Reports/` |
