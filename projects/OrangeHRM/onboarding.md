# OrangeHRM — Onboarding

Read this first if you're picking up work on the OrangeHRM project for the first time.

## What OrangeHRM is

OrangeHRM is a web-based Human Resource Management System (HRMS) — the **application under test** for this project, not part of the testing platform itself. It covers the employee lifecycle: identity/access administration, personnel records (PIM), leave management, time & attendance, recruitment, and performance management.

- **Target instance:** OrangeHRM OS 5.8, public open-source demo — `https://opensource-demo.orangehrmlive.com/`
- **This is a shared public demo.** Its data is shared across all internet users of the demo. Any exploration or testing must avoid destructive or persistent data-mutating actions unless explicitly authorized for a given run — see [`run_configuration.md`](run_configuration.md) and the current approved Project Context for the exact boundary.

## Reading order

1. [`run_configuration.md`](run_configuration.md) — what's in scope right now, credentials, environment constraints
2. [`architecture.md`](architecture.md) — how the application itself is structured (modules, navigation, shared components)
3. [`glossary.md`](glossary.md) — domain terms you'll hit in the PRD and discovery artifacts
4. `projects/OrangeHRM/PRD.md` — the full Product Requirements Document (a **Reconstructed PRD**, derived from observed UI behavior rather than an original spec; every unconfirmed statement is flagged `> Assumption`)
5. `projects/OrangeHRM/artifacts/context/OrangeHRM_ProjectContext.md` — the current approved Project Context: the single source of truth every pipeline agent downstream of Stage 1 actually reads (see `pipeline/pipeline.md` §6 Rule 5)

## Where things stand

For the current state of the pipeline (which stages have run, which artifacts exist, what's pending), don't rely on this file — it will go stale. Instead check:

- `projects/OrangeHRM/artifacts/pipeline/OrangeHRM_RunManifest.md` — per-stage version/checkpoint status
- `projects/OrangeHRM/artifacts/runs/` — individual run workspaces (each `RUN-YYYYMMDD-XXX` directory)
- [`SESSION_HANDOFF.md`](../../docs/SESSION_HANDOFF.md) under `docs/` — platform-wide continuity notes, includes an OrangeHRM status table as of its last update

## Key things to know before touching this project

- **The PRD is reconstructed, not original.** Treat every `> Assumption` tag in it as an open question, not a confirmed requirement — the Project Context Agent carries these forward deliberately (see `agents/project_context_agent.md` §3).
- **Only one role has ever been exercised:** Admin. ESS/non-Admin, Supervisor/Approver, and Hiring Manager roles are referenced in the UI but never logged into or verified — see PRD §3.
- **Legacy vs. new pipeline artifacts coexist under `projects/OrangeHRM/artifacts/`.** Some content (`knowledge/`, some of `discovery/`, `testcases/`) was produced under the old 4-stage `prompts/` pipeline before the current 6-agent `agents/` + `pipeline/` architecture existed. Don't assume an artifact was produced under the current pipeline just because it exists — check `pipeline/pipeline.md` and the Run Manifest.
