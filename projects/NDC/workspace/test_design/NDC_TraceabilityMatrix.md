# NDC — Requirement Traceability Matrix (RUN-20260712-002)

> **OBS-AGENCY-CRUD row below is superseded (2026-07-18).** Per explicit user instruction, see `test_design/Agency/NDC_TraceabilityMatrix.md` instead (`FR-AGCRT-*`/`FR-AGSEARCH-*`/`FR-AGACTION-*`/`FR-AGUPDATE-*`, RUN-20260718-001) — the current sole authoritative Agency traceability document. **OBS-BRANCH-CRUD and OBS-STAFF-CRUD remain fully authoritative, unchanged.**

**Status:** Pending Review (Branch/Staff portions) · Produced by Test Design Agent v3. Requirement IDs are Observation-derived (`OBS-` prefix), since no PRD exists for this Custom-scope Spike — traced to Project Context v3 §2 (in-scope modules) and §6 (carried-forward Open Questions), not to any external requirement document.

| Requirement Reference | Project Context v3 Anchor | Test Case(s) | Discovery Reference | Finding Reference | Validation Status |
|---|---|---|---|---|---|
| OBS-BRANCH-CRUD | §2, row 1 | TC-BRANCH-001, 002, 003, 004, 005, 006, 007 | `discovery/Branch_Add.md`, `discovery/Branch_List.md` | FINDING-002, FINDING-004 (partial) | Validated (Add/List structure); Edit unconfirmed |
| ~~OBS-AGENCY-CRUD~~ (superseded) | §2, row 2 | **See `test_design/Agency/` instead** | — | — | Superseded 2026-07-18 — this row is historical only |
| OBS-STAFF-CRUD | §2, row 3 | TC-STAFF-001, 002, 004, 005 | `discovery/Staff_Add.md`, `discovery/Staff_List.md` | FINDING-002, FINDING-005 | Validated (Add structure); List record-count unresolved; Edit unconfirmed |
| OBS-Q1 (exact field set/validation) | §6 item 1 | All Add-form test cases above | All `*_Add.md` snapshots | N/A | Field sets confirmed; live validation behavior not independently re-verified (assumption-based tests) |
| OBS-Q2 (parent-child delete dependency) | §6 item 2 | Not designed this run | N/A | N/A | Deferred — no delete was attempted (Coverage Gap) |
| OBS-Q3 (Agency/Agent role access) | §6 item 3 | Not designed this run | N/A | N/A | Deferred — credential unavailable/unconfirmed (Coverage Gap) |
| OBS-Q4 (uniqueness constraints) | §6 item 4 | TC-BRANCH-003, TC-STAFF-003 | Not independently re-verified in Discovery | N/A | Assumption-based, to be confirmed at execution |
| OBS-Q5 (Staff scoping) | §6 item 5 | TC-STAFF-001 (Preconditions), `Staff_List.md`/`Staff_Add.md` observations | `discovery/Staff_List.md`, `discovery/Staff_Add.md` | N/A | Partially confirmed (Branch-scoped, not Agency-scoped) — see QA Assessment Report |

## Findings Traceability

| Finding | Test Case(s) | Disposition |
|---|---|---|
| FINDING-001 (URL discrepancy) | None | Documented exception — infra/tooling issue, not an application test case |
| FINDING-002 (Approval workflow) | TC-BRANCH-001, TC-AGENCY-001, TC-STAFF-001 | Regression test (Expected Result asserts the correct Pending-approval behavior) |
| FINDING-003 (List auto-load inconsistency) | TC-AGENCY-003 | Exploratory test |
| FINDING-004 (Actions column ambiguity) | TC-BRANCH-006, TC-BRANCH-007 | Exploratory test (006) + Positive confirmation (007) |
| FINDING-005 (Staff grid empty) | TC-STAFF-004 | Exploratory test |
| FINDING-006 (Contact person strips Arabic script) | TC-AGENCY-005 | Regression test, assertion narrowed to what the application actually guarantees (Partially Automatable) |
| FINDING-007 (Pending Agency excluded from Search) | TC-AGENCY-006 (avoided as a target — search uses a stable Approved record instead) | Documented constraint; blocks Activate Agency scoping until resolved |
