# NDC — Findings Summary

**Run:** RUN-20260710-001 · **Stage:** 2 — Explorer Agent

Index of every finalized Finding raised during this run. Searched before creating any new Finding (duplicate detection, per `agents/explorer_agent.md` §5.9).

| ID | Title | Category | Severity | Confidence | Status | Occurrences | Module |
|---|---|---|---|---|---|---|---|
| FINDING-001 | Nav bar missing Import PNR / Import Booked PNR vs. `architecture.md` — now explained by role difference | Observation | N/A | 85% | Needs Human Review | 1 | Global navigation |
| FINDING-002 | Logged-in identity `odeysysadmin` vs. `run_configuration.md`'s `E.Saady` — confirmed as Super Admin vs. Admin | Observation | N/A | 90% | Needs Human Review | 1 | Global session/identity |
| FINDING-003 | Credential Routes Filter Routes list hard-capped at 50, undocumented | Requirement Gap | N/A | 85% | Needs Human Review | 1 | Master → Supplier → Credential Routes Filter |
| FINDING-004 | Multiple Admin-tier roles (Super Admin, Admin) with different feature access — not in Project Context | Requirement Gap | N/A | 90% | Needs Human Review | 1 | Global — role/access-control model |
