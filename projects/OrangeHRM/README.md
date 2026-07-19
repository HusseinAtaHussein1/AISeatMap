# OrangeHRM — Project Knowledge

This folder contains **all project-specific knowledge for OrangeHRM only** — onboarding notes, run configuration, the architecture of the application under test, and domain terminology. It does not contain any pipeline output.

**Generated outputs remain under [`projects/OrangeHRM/artifacts/`](artifacts/)** — Project Context, Discovery Artifacts, Manual Test Suites, Automation Scripts, Execution Results, Reports, and Run Workspaces, per `pipeline/pipeline.md` and `pipeline/run_manager.md`. Nothing in this folder is read or written by the pipeline agents themselves; it exists for the humans (and future agent sessions) who need to get oriented on this project before or between pipeline runs.

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
| Product Requirements Document | `projects/OrangeHRM/PRD.md` |
| Project Context (current approved) | `projects/OrangeHRM/artifacts/context/OrangeHRM_ProjectContext.md` |
| Discovery Artifacts | `projects/OrangeHRM/artifacts/discovery/*.md` |
| Manual Test Suites & Traceability Matrix | `projects/OrangeHRM/artifacts/test_design/` |
| Automation Scripts | `projects/OrangeHRM/artifacts/automation/` |
| Run Workspaces | `projects/OrangeHRM/artifacts/runs/RUN-YYYYMMDD-XXX/` |
| Run Manifest | `projects/OrangeHRM/artifacts/pipeline/OrangeHRM_RunManifest.md` |
| Reports | `projects/OrangeHRM/artifacts/discovery/` |

This README is a map, not a duplicate — see [`SESSION_HANDOFF.md`](../../docs/SESSION_HANDOFF.md) and [`LESSONS_LEARNED.md`](../../docs/LESSONS_LEARNED.md) under `docs/` for the platform's own history and open questions, which are platform-wide, not OrangeHRM-specific.
