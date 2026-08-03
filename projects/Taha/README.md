# Taha — Project Knowledge

This folder contains **all project-specific knowledge for Taha only** — onboarding notes, run configuration, the architecture of the application under test, and domain terminology. It does not contain any pipeline output.

**Generated outputs remain under [`artifacts/Taha/`](../../artifacts/Taha/)** — Project Context, Discovery Artifacts, Manual Test Suites, Automation Scripts, Execution Results, Reports, and Run Workspaces, per `pipeline/pipeline.md` and `pipeline/run_manager.md`. Nothing in this folder is read or written by the pipeline agents themselves; it exists for the humans (and future agent sessions) who need to get oriented on this project before or between pipeline runs.

## Files in this folder

| File | Purpose |
|---|---|
| [`onboarding.md`](onboarding.md) | Start here — what Taha is, where its knowledge lives, how to get oriented fast |
| [`run_configuration.md`](run_configuration.md) | The run configuration (modules in scope, target URL, credentials, environment constraints) the Project Context Agent consumes |
| [`architecture.md`](architecture.md) | Architecture of the Taha application under test (not the testing platform itself) |
| [`glossary.md`](glossary.md) | Taha domain/product terminology |
| [`resources/`](resources/) | Supplementary reference material — see `resources/README.md` for the standardized subfolder layout |

## Where the real project artifacts live

| Artifact | Path |
|---|---|
| Product Requirements Document | `artifacts/Taha/knowledge/Taha_PRD.md` |
| Project Context (current approved) | `artifacts/Taha/context/Taha_ProjectContext.md` |
| Discovery Artifacts | `artifacts/Taha/discovery/*.md` |
| Manual Test Suites & Traceability Matrix | `artifacts/Taha/testcases/` |
| Automation Scripts | `artifacts/Taha/Automation/` |
| Run Workspaces | `artifacts/Taha/runs/RUN-YYYYMMDD-XXX/` |
| Run Manifest | `artifacts/Taha/pipeline/Taha_RunManifest.md` |
| Reports | `artifacts/Taha/Reports/` |
