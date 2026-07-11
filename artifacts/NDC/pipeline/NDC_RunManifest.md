# NDC — Run Manifest

Tracking artifact per `pipeline/pipeline.md` §7 — records, per stage, what version was produced, when, and its checkpoint status. The pipeline orchestrator (and any human) consults this before invoking the next stage.

## RUN-20260710-001

Run Scope: Type = User Story (T3002-066 + T3087, jointly scoped) · Source = Pasted text
Run Workspace: `artifacts/NDC/runs/RUN-20260710-001/`

| Stage | Version | Timestamp | Checkpoint Status | Approving Reviewer | Artifact |
|---|---|---|---|---|---|
| 1 — Project Context | v1 | 2026-07-10 | **Pending Review** | — | `artifacts/NDC/context/NDC_ProjectContext.v1.md` |
| 2 — Explorer | — | — | Not started | — | — |
| 3 — Test Design | — | — | Not started | — | — |
| 4 — Automation | — | — | Not started | — | — |
| 5 — Execution | — | — | Not started | — | — |
| 6 — Reporting | — | — | Not started | — | — |

Per `pipeline/pipeline.md` §5.3 Rule 5: no later stage may be invoked while Stage 1's checkpoint remains `Pending Review`.
