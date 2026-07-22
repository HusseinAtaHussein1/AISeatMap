# NDC — Project Knowledge

This folder contains **all project-specific knowledge for NDC only** — onboarding notes, run configuration, the architecture of the application under test, and domain terminology. It does not contain any pipeline output.

**Generated outputs remain under [`projects/NDC/workspace/`](workspace/)** (latest approved state) **and [`projects/NDC/runs/`](runs/)** (immutable per-run history) — Project Context, Discovery Artifacts, Manual Test Suites, Automation Scripts, Execution Results, and Reports, per `pipeline/pipeline.md` and `pipeline/run_manager.md`. NDC uses `workspace/` + `runs/` instead of the platform-default `artifacts/` folder name — see `onboarding.md`. Nothing in this folder is read or written by the pipeline agents themselves; it exists for the humans (and future agent sessions) who need to get oriented on this project before or between pipeline runs.

## Files in this folder

| File | Purpose |
|---|---|
| [`onboarding.md`](onboarding.md) | Start here — what NDC is, where its knowledge lives, how to get oriented fast |
| [`run_configuration.md`](run_configuration.md) | The run configuration (modules in scope, target URL, credentials, environment constraints) the Project Context Agent consumes |
| [`architecture.md`](architecture.md) | Architecture of the NDC application under test (not the testing platform itself) |
| [`automation_framework.md`](automation_framework.md) | **Mandatory** SHAFT automation framework structure — Stage 4 (Automation Agent) must comply with this, not select or invent a different architecture |
| [`glossary.md`](glossary.md) | NDC domain/product terminology |
| [`resources/`](resources/) | Supplementary reference material — see `resources/README.md` for the standardized subfolder layout |

## Where the real project artifacts live

| Artifact | Path |
|---|---|
| Product Requirements Document | `projects/NDC/PRD.md` |
| Project Context (current approved) | `projects/NDC/workspace/context/NDC_ProjectContext_CredentialRoutesFilter.md` |
| Discovery Artifacts | `projects/NDC/workspace/discovery/*.md` |
| Manual Test Suites & Traceability Matrix | `projects/NDC/workspace/test_design/` |
| Automation Scripts | `projects/NDC/workspace/automation/` |
| Run Workspaces (immutable history) | `projects/NDC/runs/RUN-YYYYMMDD-XXX-{slug}/` (new runs); pre-existing runs keep their original `RUN-YYYYMMDD-XXX/` name |
| Run Manifest | `projects/NDC/workspace/pipeline/NDC_RunManifest.md` |
| Reports | `projects/NDC/workspace/reporting/` |
