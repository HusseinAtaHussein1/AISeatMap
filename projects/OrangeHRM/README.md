# OrangeHRM — Project Knowledge

This folder contains **all project-specific knowledge for OrangeHRM only** — onboarding notes, run configuration, the architecture of the application under test, and domain terminology. It does not contain any pipeline output.

**Generated outputs remain under [`artifacts/OrangeHRM/`](../../artifacts/OrangeHRM/)** — Project Context, Discovery Artifacts, Manual Test Suites, Automation Scripts, Execution Results, Reports, and Run Workspaces, per `pipeline/pipeline.md` and `pipeline/run_manager.md`. Nothing in this folder is read or written by the pipeline agents themselves; it exists for the humans (and future agent sessions) who need to get oriented on this project before or between pipeline runs.

## Files in this folder

| File | Purpose |
|---|---|
| [`onboarding.md`](onboarding.md) | Start here — what OrangeHRM is, where its knowledge lives, how to get oriented fast |
| [`run_configuration.md`](run_configuration.md) | The run configuration (modules in scope, target URL, credentials, environment constraints) the Project Context Agent consumes |
| [`architecture.md`](architecture.md) | Architecture of the OrangeHRM application under test (not the testing platform itself) |
| [`glossary.md`](glossary.md) | OrangeHRM domain/product terminology |
| [`resources/`](resources/) | Supplementary reference material |

## Where the real project artifacts live

| Artifact | Path |
|---|---|
| Product Requirements Document | `artifacts/OrangeHRM/knowledge/OrangeHRM_PRD.md` |
| Project Context (current approved) | `artifacts/OrangeHRM/context/OrangeHRM_ProjectContext.md` |
| Discovery Artifacts | `artifacts/OrangeHRM/discovery/*.md` |
| Manual Test Suites & Traceability Matrix | `artifacts/OrangeHRM/testcases/` |
| Automation Scripts | `artifacts/OrangeHRM/Automation/` |
| Run Workspaces | `artifacts/OrangeHRM/runs/RUN-YYYYMMDD-XXX/` |
| Run Manifest | `artifacts/OrangeHRM/pipeline/OrangeHRM_RunManifest.md` |
| Reports | `artifacts/OrangeHRM/Reports/` |

This README is a map, not a duplicate — see [`SESSION_HANDOFF.md`](../../SESSION_HANDOFF.md) and [`LESSONS_LEARNED.md`](../../LESSONS_LEARNED.md) at the repo root for the platform's own history and open questions, which are platform-wide, not OrangeHRM-specific.
