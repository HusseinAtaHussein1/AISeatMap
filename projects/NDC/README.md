# NDC — Project Knowledge

This folder contains **all project-specific knowledge for NDC only** — onboarding notes, run configuration, the architecture of the application under test, and domain terminology. It does not contain any pipeline output.

**Generated outputs remain under [`artifacts/NDC/`](../../artifacts/NDC/)** — Project Context, Discovery Artifacts, Manual Test Suites, Automation Scripts, Execution Results, Reports, and Run Workspaces, per `pipeline/pipeline.md` and `pipeline/run_manager.md`. Nothing in this folder is read or written by the pipeline agents themselves; it exists for the humans (and future agent sessions) who need to get oriented on this project before or between pipeline runs.

## Files in this folder

| File | Purpose |
|---|---|
| [`onboarding.md`](onboarding.md) | Start here — what NDC is, where its knowledge lives, how to get oriented fast |
| [`run_configuration.md`](run_configuration.md) | The run configuration (modules in scope, target URL, credentials, environment constraints) the Project Context Agent consumes |
| [`architecture.md`](architecture.md) | Architecture of the NDC application under test (not the testing platform itself) |
| [`glossary.md`](glossary.md) | NDC domain/product terminology |
| [`resources/`](resources/) | Supplementary reference material — see `resources/README.md` for the standardized subfolder layout |

## Where the real project artifacts live

| Artifact | Path |
|---|---|
| Product Requirements Document | `artifacts/NDC/knowledge/NDC_PRD.md` |
| Project Context (current approved) | `artifacts/NDC/context/NDC_ProjectContext.md` |
| Discovery Artifacts | `artifacts/NDC/discovery/*.md` |
| Manual Test Suites & Traceability Matrix | `artifacts/NDC/testcases/` |
| Automation Scripts | `artifacts/NDC/Automation/` |
| Run Workspaces | `artifacts/NDC/runs/RUN-YYYYMMDD-XXX/` |
| Run Manifest | `artifacts/NDC/pipeline/NDC_RunManifest.md` |
| Reports | `artifacts/NDC/Reports/` |
