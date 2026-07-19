# NDC — Project Context v3

**Run:** RUN-20260712-002 · **Status:** `Pending` (checkpoint open per `pipeline/pipeline.md` §5.3 Rule 5 — Stages 1–4 to be reviewed together, batch approval, per this run's Spike/exploratory nature) · **Produced by:** Project Context Agent (Stage 1) · **Date:** 2026-07-12
**Run Scope:** Type = Feature · Source = Custom scope description · per `pipeline/run_scope.md` §3/§4.1

> ⚠️ **OBSERVATION-BASED SPIKE — NOT PRD-BACKED.** `projects/NDC/PRD.md` contains zero content on Administration/Branch/Agency/Staff (it holds only the two Credential Routes Filter user stories used by RUN-20260710-001). Per explicit user authorization on 2026-07-12, this run's scope is established via a **Custom scope description** (`pipeline/run_scope.md` §4.2) instead of a PRD, and every requirement below is derived from **directly observed live application behavior**, not a written business rule. Every such item is tagged **"Observation-derived"**. This does not supersede `NDC_ProjectContext_CredentialRoutesFilter.md` (Credential Routes Filter) or `v2.md` (Login/Authentication) — both remain independently Approved and untouched. See the platform's "Observation-based Spike run type" standing decision.

---

## 1. Scope Summary

This run is a scoped Spike covering the NDC Admin Portal's **Administration module — Branch, Agency, and Staff** screens, part of the Company → Branch → Agency → Staff organizational structure (`architecture.md`'s Admin module row). Purpose: produce a defensible functional test baseline (including create/edit lifecycle behavior, since mutation is authorized for this run — see §5) for these three screens, and carry the pipeline through to a real, executable Automation Agent output, consistent with the standing execution-priority directive. Scope is intentionally limited to Branch, Agency, and Staff — the Company/Operating-Country sub-item of Admin, and every other Admin module area (Agency's own sub-items: Search Login Details, Registration Requests, Category Management, Agency Assignation), are explicitly out of scope for this run (§3).

## 2. Modules In Scope

| Module | Why in scope | Source |
|---|---|---|
| Admin → Company → Branch (list/add/edit) | Explicit target of this run, per direct user instruction 2026-07-12 ("branch") | Custom scope description |
| Admin → Agency (list/add/edit — the Agency entity itself, not its sub-items) | Explicit target of this run, per direct user instruction 2026-07-12 ("agency") | Custom scope description |
| Admin → Staff (list/add/edit) | Explicit target of this run, per direct user instruction 2026-07-12 ("Stuff" confirmed as "Staff") | Custom scope description |

## 3. Modules Out of Scope

Everything else in the NDC Admin Portal, including but not limited to:
- **Admin → Company → Operating Country** — a sibling of Branch under Company, not requested.
- **Admin → Agency's own sub-items** — Search Login Details, Registration Requests, Category Management, Agency Assignation — distinct screens from the Agency entity CRUD itself.
- All modules already scoped by prior runs: Login/Authentication (v2), Credential Routes Filter / Airport / Supplier Credentials / Airline / Booking-Mid Office / Portal Booking Module (v1).
- Master, Rule Engine, Settings, User Management, Profile, Reports, PNR Query, Transfer PNR, Import PNR, Import Booked PNR — untouched by this run.

## 4. Roles & Credentials Required

- **Admin** credential — required and available (`projects/NDC/credentials/credentials.json`, STG environment) — Branch/Agency/Staff CRUD screens live under the Admin nav and are expected to require Admin-tier access.
- **Agency** credential — listed in `run_configuration.md` as "unconfirmed — expected available." Not required for the core CRUD validation (that's Admin-tier), but relevant if this run probes whether an Agency-role user can view/is blocked from these Admin screens (an Authorization boundary check per `agents/explorer_agent.md` §5.8). Explorer should note if this credential is unavailable rather than blocking on it.
- **Agent** credential — confirmed not available for this run (per `run_configuration.md`); any Agent-role authorization check is a Coverage Gap, not a resolved item.

## 5. Environment Constraints

Per `projects/NDC/run_configuration.md`:
- Target: `http://192.168.1.70`, **shared staging**, not isolated to this testing effort.
- **Mutation authorized for this run, Branch/Agency/Staff only** — a run-specific override of the project's standing read-only constraint, explicitly granted by the user 2026-07-12. Create/edit/delete actions against Branch, Agency, and Staff records are in scope. This authorization does **not** extend to any other module, and does not carry forward to future runs by default.
- Because this is a **shared** environment, any created test data (Branch/Agency/Staff records) must be clearly identifiable as test data (e.g., a distinctive naming convention such as a `QA_SPIKE_` prefix) so it doesn't get mistaken for real organizational data by other teams — Explorer/Test Design/Automation should adopt and record a naming convention before creating anything.
- Per the standing shared-environment negative-testing default, destructive/negative-path testing (e.g., attempting to delete a Branch/Agency/Staff record that has dependent child records, to observe cascade/referential-integrity behavior) is permitted to *attempt and observe* but not to leave the environment in a broken state — any such probe must be followed by cleanup/restoration where the UI supports it.

## 6. Carried-Forward Assumptions & Risks

Since this is a Spike with no PRD, this section carries forward **Open Questions requiring direct observation** rather than PRD-sourced assumptions:

| # | Item | Status this run should treat it as |
|---|---|---|
| 1 | Exact field set, labels, and validation behavior of the Branch, Agency, and Staff add/edit forms | Unconfirmed — Explorer must observe directly (Observation-derived) |
| 2 | Whether Branch/Agency/Staff have a parent-child dependency enforced at delete time (e.g., can a Branch be deleted if it has Agencies under it?) | Unconfirmed — a specific Explorer investigation target given mutation is authorized |
| 3 | Whether an Agency-role or Agent-role user can reach these Admin screens at all (authorization boundary) | Unconfirmed — best-effort only; Agent credential unavailable, Agency credential unconfirmed |
| 4 | Uniqueness constraints (e.g., can two Branches share a name under different Companies?) | Unconfirmed — Explorer to probe as a Validation boundary condition |
| 5 | Whether Staff records are scoped per-Agency, per-Branch, or global | Unconfirmed — architecture.md states "Staff" as an Admin sub-item but doesn't confirm its scoping key |

## 7. Traceability Anchor

| Item above | Section | Source |
|---|---|---|
| §1–§3 (Scope) | Custom scope description | User instruction, 2026-07-12 (chat: "Run NDC automation for branch and agency and Stuff," confirmed scope = Branch + Agency + Staff) |
| §2 (module structure) | `architecture.md` Admin module row | `projects/NDC/architecture.md`, line: "Admin \| Company (Operating Country, Branch), Agency (...), Staff \| Organization structure — Company → Branch → Agency → Staff" |
| §4 (Credentials) | Existing project setup | `projects/NDC/credentials/credentials.json`, `projects/NDC/run_configuration.md` |
| §5 (Environment Constraints, mutation authorization) | User instruction, 2026-07-12 | Recorded in `run_configuration.md` Environment Constraints (run-specific override) and `NDC_RunManifest.md` |
| §6 (Open Questions) | Observation-derived | To be resolved by Stage 2 (Explorer Agent), Discovery Mode: **User-guided exploration** (per user decision 2026-07-12 — human operator drives the live app; Findings capped at `Needs Human Review`, never `Confirmed`, per `agents/explorer_agent.md` §8.3/§29) |

---

*Per `pipeline/pipeline.md` §5.1, this artifact requires Human Review before Stage 2 (Explorer Agent) may formally clear its own checkpoint. Per the same batch-approval pattern used for RUN-20260712-001, Stages 1–4's checkpoints are open together — see `NDC_RunManifest.md`.*
