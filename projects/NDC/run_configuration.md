# NDC — Run Configuration

This is the durable, versioned home for the "run configuration" that `agents/project_context_agent.md` §4 lists as a required input alongside the PRD.

> This file describes configuration, not a decision — the Project Context Agent still produces the actual Project Context artifact, and any change here takes effect only the next time that agent is (re-)run. Editing this file does not retroactively change an already-approved Project Context version.

## Target Environment

| Field | Value |
|---|---|
| Application | NDC Admin Portal |
| Environment | Shared staging (not isolated — other testers/teams may have data on it) |
| URL | `http://192.168.1.70` — confirmed via live screenshots, 2026-07-10 (internal/LAN address, plain HTTP) |

## Credentials Available

| Role | Username | Password | Status |
|---|---|---|---|
| Admin | <!-- username --> (displayed as `E.Saady`) | <!-- password, see resources/credentials/ --> | confirmed working — live screenshots 2026-07-10 show a full-nav Admin session (Dashboard, Admin, Master, Rule Engine, Settings, User Management, Booking-Mid Office, Profile, Reports, PNR Query, Transfer PNR, Import PNR, Import Booked PNR). Actual username/password still not recorded here — see `resources/credentials/`. |
| Agency | <!-- username --> | <!-- password, see resources/credentials/ --> | unconfirmed — expected available |
| Agent | — | — | not available for this run |

Do not paste real secret values into this table for a non-public environment — reference `resources/credentials/` (documentation about *where* credentials live) or a secrets manager instead. See `resources/README.md`.

## Environment Constraints (standing, project-wide)

- **Shared environment** — this staging instance is not isolated to this testing effort; assume other teams/testers have live data on it.
- **Read-only for now** — no data mutation (create/update/delete) is authorized until explicitly cleared. Runs against this environment must be limited to read/navigation/validation activity — no creating or modifying Companies, Branches, Agencies, Agents, bookings, or reference data.
- Revisit this constraint once mutation is explicitly authorized (recorded here) — do not assume it loosens automatically for future runs.

## Modules

See [`architecture.md`](architecture.md) for the full module list. Which modules are **in scope for a given run** is decided per run and recorded in that run's Project Context — this file only records what modules and credentials *exist to be chosen from*.

Intended first run's target modules: **Administration** (Company/Branch/Agency/Staff structure) and **Identity & Profile** (system users/traveller profiles). No PRD is available yet for these modules — see history table below.

## Run Scope Sources Available

Per [`../../pipeline/run_scope.md`](../../pipeline/run_scope.md), a run's scope (Type + Source) is what actually narrows Project Knowledge into that run's Project Context. This section records which **Sources** are set up for this project — not what any specific run chose.

| Source | Available? | Notes |
|---|---|---|
| Entire Project | no | Not intended for first run — starting with Administration + Identity |
| Pasted text | yes | Architecture overview so far captured via chat/infographic, not a formal PRD |
| Markdown file (`resources/requirements/`, `resources/notes/`) | not yet | No dedicated Markdown-file-sourced requirement doc supplied yet — the two User Stories used for RUN-20260710-001 are recorded under `resources/requirements/user_stories/` with `Source: Plain Text (pasted)` in each file's own metadata line, not this Source |
| Uploaded document | not yet | No PRD uploaded yet |
| Requirement document reference | not yet | — |
| Custom scope description | yes | "Administration + Identity" chosen as first run scope by user, 2026-07-10 |
| Azure DevOps ID (future) | Not yet integrated | See `pipeline/run_scope.md` §4.2 |
| Jira ID (future) | Not yet integrated | See `pipeline/run_scope.md` §4.2 |

## History of scope choices

| Run | Run Type | Run Scope (Type / Source) | In-scope modules (summary) | Project Context version |
|---|---|---|---|---|
| RUN-20260710-001 | User Story | User Story / Pasted text (Q2-CORE-WT1-T3002-066 + T3087, jointly scoped) | Credential Routes Filter, Airport BlackList/WhiteList, Supplier Credentials (Restricted Airlines), Airline (GDS/LCC type), Booking-Mid Office + Portal Booking Module | v1 — Pending Review |
| <!-- RUN-YYYYMMDD-XXX --> | <!-- Full Regression / Smoke / Feature / User Story / Bug / Epic / Custom --> | <!-- e.g. User Story / Pasted text --> | <!-- summary --> | <!-- vN --> |
