# NDC — Run Manifest

Tracking artifact per `pipeline/pipeline.md` §7 — records, per stage, what version was produced, when, and its checkpoint status. The pipeline orchestrator (and any human) consults this before invoking the next stage.

## RUN-20260710-001

Run Scope: Type = User Story (T3002-066 + T3087, jointly scoped) · Source = Pasted text
Run Workspace: `projects/NDC/artifacts/runs/RUN-20260710-001/`

| Stage | Version | Timestamp | Checkpoint Status | Approving Reviewer | Artifact |
|---|---|---|---|---|---|
| 1 — Project Context | v1 | 2026-07-10 | **Approved** | Aymoon (Business Analyst / Product Owner role) | `projects/NDC/artifacts/context/NDC_ProjectContext.v1.md` |
| 2 — Explorer | — | — | Not started | — | — |
| 3 — Test Design | — | — | Not started | — | — |
| 4 — Automation | — | — | Not started | — | — |
| 5 — Execution | — | — | Not started | — | — |
| 6 — Reporting | — | — | Not started | — | — |

Stage 2 (Explorer) may now begin, per `pipeline/pipeline.md` §5.3 Rule 5. Per `agents/explorer_agent.md` §8.1, browser automation is unavailable for this run — Discovery Mode will be **User-guided exploration**, capping any resulting Findings at `Needs Human Review` (never `Confirmed`), per §8.3/§18.
