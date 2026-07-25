# Test Design — Workspace (Latest Approved State)

Test cases, coverage, and traceability documents organized by module. These are **copies** of the latest-approved artifacts from their originating run — the run itself remains the immutable source of record.

| Module | Source run | Note |
|---|---|---|
| `Login/` | `platform_core_data/runs/RUN-20260712-001/test_design/` | Self-contained (own Coverage Report + Traceability Matrix) |
| `Agency/` | `platform_core_data/runs/RUN-20260718-001/test_design/` | **Updated 2026-07-18** — 66 test cases (`TC-AGENCY-CREATE-*`, `TC-AGENCY-SEARCH-*`, `TC-AGENCY-ACTIONS-*`, `TC-AGENCY-UPDATE-*`), User-Story-backed, self-contained (own Coverage Report + Traceability Matrix). Supersedes the RUN-20260712-002-sourced Agency rows in the top-level `CoverageReport.md`/`TraceabilityMatrix.md` below, per explicit user instruction to rely only on the new suite. |
| `ETicketBranding/` | `platform_core_data/runs/RUN-20260718-001/test_design/` | **New 2026-07-18** — 24 test cases (`TC-ETB-*`, WT1-T2919), self-contained. A separate scope from Agency CRUD (Track B) — see `context/ProjectContext_ETicketBranding.md`. |
| `Branch/` | `platform_core_data/runs/RUN-20260712-002/test_design/` | Unchanged |
| `Staff/` | `platform_core_data/runs/RUN-20260712-002/test_design/` | Unchanged |

`CoverageReport.md` and `TraceabilityMatrix.md` at this level (not inside a module folder) come from `RUN-20260712-002` and originally covered Agency, Branch, and Staff together. As of 2026-07-18, their **Agency** rows are superseded (see the banner at the top of each file) — `Branch` and `Staff` rows remain fully authoritative and unchanged. `Login/`, `Agency/`, and `ETicketBranding/` each have their own self-contained Coverage Report and Traceability Matrix.

When a future run produces a newer approved test design artifact for a module, update the copy here to match — this folder should always reflect the latest approved state, while `platform_core_data/runs/` keeps every run's original version untouched.
