# FirstDemo — Project Knowledge

> **Status:** Structural example. This project was created to demonstrate the `projects/templates/` onboarding workflow (see `projects/README.md` → "Adding a new project"), not to represent a real application under test. No PRD, run configuration, or pipeline run exists for it yet — fill in the placeholders below (and in the other files in this folder) when/if it becomes a real project.

This folder contains **all project-specific knowledge for FirstDemo only** — onboarding notes, run configuration, the architecture of the application under test, and domain terminology. It does not contain any pipeline output.

**Generated outputs remain under [`artifacts/FirstDemo/`](../../artifacts/FirstDemo/)** — Project Context, Discovery Artifacts, Manual Test Suites, Automation Scripts, Execution Results, Reports, and Run Workspaces, per `pipeline/pipeline.md` and `pipeline/run_manager.md`. That directory does not exist yet, since no pipeline stage has been run for this project. Nothing in this folder is read or written by the pipeline agents themselves; it exists for the humans (and future agent sessions) who need to get oriented on this project before or between pipeline runs.

## Files in this folder

| File | Purpose |
|---|---|
| [`onboarding.md`](onboarding.md) | Start here — what FirstDemo is, where its knowledge lives, how to get oriented fast |
| [`run_configuration.md`](run_configuration.md) | The run configuration (modules in scope, target URL, credentials, environment constraints) the Project Context Agent consumes |
| [`architecture.md`](architecture.md) | Architecture of the FirstDemo application under test (not the testing platform itself) |
| [`glossary.md`](glossary.md) | FirstDemo domain/product terminology |
| [`resources/`](resources/) | Supplementary reference material |

## Where the real project artifacts will live (once a pipeline run exists)

| Artifact | Path |
|---|---|
| Product Requirements Document | `artifacts/FirstDemo/knowledge/FirstDemo_PRD.md` |
| Project Context (current approved) | `artifacts/FirstDemo/context/FirstDemo_ProjectContext.md` |
| Discovery Artifacts | `artifacts/FirstDemo/discovery/*.md` |
| Manual Test Suites & Traceability Matrix | `artifacts/FirstDemo/testcases/` |
| Automation Scripts | `artifacts/FirstDemo/Automation/` |
| Run Workspaces | `artifacts/FirstDemo/runs/RUN-YYYYMMDD-XXX/` |
| Run Manifest | `artifacts/FirstDemo/pipeline/FirstDemo_RunManifest.md` |
| Reports | `artifacts/FirstDemo/Reports/` |
