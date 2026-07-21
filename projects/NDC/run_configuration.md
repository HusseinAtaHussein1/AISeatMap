# NDC — Run Configuration

This is the durable, versioned home for the "run configuration" that `agents/project_context_agent.md` §4 lists as a required input alongside the PRD.

> This file describes configuration, not a decision — the Project Context Agent still produces the actual Project Context artifact, and any change here takes effect only the next time that agent is (re-)run. Editing this file does not retroactively change an already-approved Project Context version.

## Target Environment

| Field | Value |
|---|---|
| Application | NDC Admin Portal |
| Environment | Shared staging (not isolated — other testers/teams may have data on it) |
| URL | `http://192.168.1.70` — confirmed via live screenshots, 2026-07-10 (internal/LAN address, plain HTTP) |

## Execution Configuration

| Field | Value |
|---|---|
| Execution Mode | **Headed** — set 2026-07-12 for RUN-20260712-001's Stage 5 (Execution Agent), per `agents/execution_agent.md` §5.1 (no default assumed; asked explicitly since this field was previously undefined). Applies to future runs unless a run's own Project Context overrides it. |

## Credentials Available

| Role | Username | Password | Status |
|---|---|---|---|
| Admin | <!-- username --> (displayed as `E.Saady`) | <!-- password, see resources/credentials/ --> | confirmed working — live screenshots 2026-07-10 show a full-nav Admin session (Dashboard, Admin, Master, Rule Engine, Settings, User Management, Booking-Mid Office, Profile, Reports, PNR Query, Transfer PNR, Import PNR, Import Booked PNR). Actual username/password still not recorded here — see `resources/credentials/`. |
| Agency | <!-- username --> | <!-- password, see resources/credentials/ --> | unconfirmed — expected available |
| Agent | — | — | not available for this run |

Do not paste real secret values into this table for a non-public environment — reference `resources/credentials/` (documentation about *where* credentials live) or a secrets manager instead. See `resources/README.md`.

## Browser Automation (Browser Driver Layer)

Available for this project — engine is shared platform infrastructure (`tools/browser_driver/`), everything project-specific lives inside this project's own folder. See `tools/browser_driver/README.md` for the full contract. Four separate pieces:
- **Shared execution engine** (not project-specific): `tools/browser_driver/driver.js` + `api.js`.
- **Browser Profile** (non-secret, versioned, small/stable): `browser/profile.json` — auth + browser init only (login selectors, default URL, browser settings). Deliberately NOT under `automation/` — that name is reserved for Stage 4's SHAFT output (`artifacts/automation/`).
- **Screen/Component Knowledge** (non-secret, versioned, grows over time): `browser/screens/*.json` and `.../components/*.json` — one file per screen or shared component, loaded on demand via `useScreen()`/`useComponent()`. Currently has `components/GlobalNavigation.json` and `screens/CredentialRoutesFilter.json`.
- **Credentials** (real, git-ignored, never committed): `credentials/credentials.json` — copy `credentials/credentials.template.json`, fill in real values. `STG` confirmed reachable at `http://192.168.1.70`; `PREPROD`/`PROD` not yet set up for this project.
- Agents request a session via `BrowserDriver.authenticate({project: 'NDC', env})` — credentials load automatically by project name; agents never see login mechanics or credential values directly.

## Environment Constraints (standing, project-wide)

- **Shared environment** — this staging instance is not isolated to this testing effort; assume other teams/testers have live data on it.
- **Read-only for now** — no data mutation (create/update/delete) is authorized until explicitly cleared. Runs against this environment must be limited to read/navigation/validation activity — no creating or modifying Companies, Branches, Agencies, Agents, bookings, or reference data.
- Revisit this constraint once mutation is explicitly authorized (recorded here) — do not assume it loosens automatically for future runs.

**Run-specific override — RUN-20260712-002 only:** mutation (create/edit/delete) explicitly authorized by the user 2026-07-12 for **Branch, Agency, and Staff** records only, for the duration of this run. This does not loosen the standing read-only constraint for any other module or any other run — future runs must ask fresh rather than assuming this carries forward, per platform memory `feedback_automation_decision_gates`.

## Automation Packages (per-package, not project-wide — updated 2026-07-12, `agents/automation_agent.md` v5)

NDC does **not** bind every automation effort to one project-wide framework — the platform stores independent Automation Packages, and which one (and which framework) a given Stage 4 run targets is decided by that run's Framework Decision Gate (`agents/automation_agent.md` §31), asked fresh every run. See `projects/NDC/workspace/automation/NDC_AutomationPackages.md` for the current registry of packages that exist.

[`automation_framework.md`](automation_framework.md) documents the **SHAFT package's** own internal structure (Pages / Locators / Tests / Data layers, naming conventions, core rules) — binding whenever a run's Framework Decision Gate selects SHAFT, not a project-wide mandate. Not to be redesigned; only extended per that document's Gap Resolution Rule when a SHAFT-package run discovers a real implementation gap.

## Reference Automation Project (registered 2026-07-12)

NDC has a registered **Reference Automation Project** — the company's real, external, production SHAFT codebase at `E:\Automation2\NDC-Uplift-Automation` (outside this repository; a live Git repo with remote `ahmedrefat-prog/NDC-Uplift-Automation`). See [`reference_automation_project.md`](reference_automation_project.md) for its full Architecture Summary. **Read-only by default** — per `agents/automation_agent.md` §32, every Stage 4 run must detect it, state it plainly, and ask the Automation Target Decision Gate (generate inside the platform / export a compatible package / update the Reference Project directly) before generating or modifying anything; a prior run's answer is never carried forward as a default.

⚠️ That reference project's `Environment.properties` and some Login-related Java files contain hardcoded plaintext NDC credentials, committed to Git history — a pre-existing condition, not introduced by this platform, flagged in `reference_automation_project.md` for the credential owner's attention (rotation / history scrub).

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

| Run | Run Type | Run Scope (Type / Source) | In-scope modules (summary) | Project Context document |
|---|---|---|---|---|
| RUN-20260710-001 | User Story | User Story / Pasted text (Q2-CORE-WT1-T3002-066 + T3087, jointly scoped) | Credential Routes Filter, Airport BlackList/WhiteList, Supplier Credentials (Restricted Airlines), Airline (GDS/LCC type), Booking-Mid Office + Portal Booking Module | `NDC_ProjectContext_CredentialRoutesFilter.md` — Approved |
| RUN-20260712-001 | Feature (Observation-based Spike) | Feature / Custom scope description | Login/Authentication | `NDC_ProjectContext_LoginAuthentication.md` — Approved |
| RUN-20260712-002 | Feature (Observation-based Spike) | Feature / Custom scope description | Administration — Branch, Agency, Staff (Company → Branch → Agency → Staff) | `NDC_ProjectContext_BranchAgencyStaff.md` — in progress (Agency portion since superseded by `NDC_ProjectContext_Agency.md`) |
| RUN-20260713-001 | Feature (Observation-based Spike) | Feature / Custom scope description | Admin/Agency — Search Agency automation, Activate Agency spike (Blocked), FINDING-006 resolution, Branch full re-verification | Continuing `NDC_ProjectContext_BranchAgencyStaff.md` |
| RUN-20260718-001 | User Story | User Story / Pasted text | Admin → Agency full CRUD lifecycle (Track A: Create, Search, Update, Actions/Approve-Reject) — see `context/NDC_ProjectContext_Agency.md`; Track B (WT1-T2919 E-Ticket Agency Branding) tracked separately, non-Agency-CRUD scope | Non-versioned (per 2026-07-18 process change) — Pending |
| RUN-20260721-001 | User Story | User Story / Pasted text | Admin → Role Management — Create Role (Role Name, module/sub-module/tab permission grid, Submit for Approval/Cancel) — new scope/entity | `NDC_ProjectContext_Role.md` — Approved |
| <!-- RUN-YYYYMMDD-XXX-{slug} --> | <!-- Full Regression / Smoke / Feature / User Story / Bug / Epic / Custom --> | <!-- e.g. User Story / Pasted text --> | <!-- summary --> | <!-- vN --> |
