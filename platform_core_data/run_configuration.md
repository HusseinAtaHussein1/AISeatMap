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
| Execution Mode | **Headed** — set 2026-07-12 for RUN-20260712-001's Stage 6 (Automation Execution Agent, renamed from Execution Agent), per `.claude/skills/automation-execution-agent/SKILL.md` §5.1 (no default assumed; asked explicitly since this field was previously undefined). Applies to future runs unless a run's own Project Context overrides it. |

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
- **Browser Profile** (non-secret, versioned, small/stable): `browser/profile.json` — auth + browser init only (login selectors, default URL, browser settings). Deliberately NOT under `automation/` — that name is reserved for Stage 5's SHAFT output (`artifacts/automation/`).
- **Screen/Component Knowledge** (non-secret, versioned, grows over time): `browser/screens/*.json` and `.../components/*.json` — one file per screen or shared component, loaded on demand via `useScreen()`/`useComponent()`. Currently has `components/GlobalNavigation.json` and `screens/CredentialRoutesFilter.json`.
- **Credentials** (real, git-ignored, never committed): `credentials/credentials.json` — copy `credentials/credentials.template.json`, fill in real values. `STG` confirmed reachable at `http://192.168.1.70`; `PREPROD`/`PROD` not yet set up for this project.
- Agents request a session via `BrowserDriver.authenticate({ env })` — credentials load automatically from `platform_core_data/credentials/`; agents never see login mechanics or credential values directly.

## Environment Constraints (standing, project-wide)

- **Shared environment** — this staging instance is not isolated to this testing effort; assume other teams/testers have live data on it.
- **Read-only for now** — no data mutation (create/update/delete) is authorized until explicitly cleared. Runs against this environment must be limited to read/navigation/validation activity — no creating or modifying Companies, Branches, Agencies, Agents, bookings, or reference data.
- Revisit this constraint once mutation is explicitly authorized (recorded here) — do not assume it loosens automatically for future runs.

**Run-specific override — RUN-20260712-002 only:** mutation (create/edit/delete) explicitly authorized by the user 2026-07-12 for **Branch, Agency, and Staff** records only, for the duration of this run. This does not loosen the standing read-only constraint for any other module or any other run — future runs must ask fresh rather than assuming this carries forward, per platform memory `feedback_automation_decision_gates`.

**Run-specific override — `2026-07-25_16-45-00__Module__RuleEngine` only:** mutation (create / update / activate-deactivate / approve / reject / clone / delete) explicitly authorized by the user 2026-07-25 for **Rule Engine records only** — Markup, Discount, Service Charge, Cancellation Charge, Fare Rules, Offer Pricing, Terms & Conditions. Two limits are part of the same authorization: (1) the standing read-only constraint remains in full force for every other module, including the Branch/Agency/Staff records the 2026-07-12 override once covered; (2) **no bookings, payments, wallet charges, holds, or ticketing** are permitted even in service of verifying a rule's price effect — fare verification is limited to searching and reading the fare breakdown. Does not carry forward; a future run must ask fresh. See that run's Project Context §5.1 and §5.2 (four mandatory shared-environment containment obligations, since Rule Engine changes alter the prices other testers see).

## Automation Packages (per-package, not project-wide — updated 2026-07-12, `agents/automation_agent.md` v5)

NDC does **not** bind every automation effort to one project-wide framework — the platform stores independent Automation Packages, and which one (and which framework) a given Stage 5 run targets is decided by that run's Framework Decision Gate (`.claude/skills/automation-agent/SKILL.md` §31), asked fresh every run. See `platform_core_data/workspace/automation/AutomationPackages.md` for the current registry of packages that exist.

[`automation_framework.md`](automation_framework.md) documents the **SHAFT package's** own internal structure (Pages / Locators / Tests / Data layers, naming conventions, core rules) — binding whenever a run's Framework Decision Gate selects SHAFT, not a project-wide mandate. Not to be redesigned; only extended per that document's Gap Resolution Rule when a SHAFT-package run discovers a real implementation gap.

## Reference Automation Project (registered 2026-07-12)

NDC has a registered **Reference Automation Project** — the company's real, external, production SHAFT codebase at `E:\Automation2\NDC-Uplift-Automation` (outside this repository; a live Git repo with remote `ahmedrefat-prog/NDC-Uplift-Automation`). See [`reference_automation_project.md`](reference_automation_project.md) for its full Architecture Summary. **Read-only by default** — per `.claude/skills/automation-agent/SKILL.md` §32, every Stage 5 run must detect it, state it plainly, and ask the Automation Target Decision Gate (generate inside the platform / export a compatible package / update the Reference Project directly) before generating or modifying anything; a prior run's answer is never carried forward as a default.

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
| Requirement document reference | yes | **Available since 2026-07-25.** `platform_core_data/PRD.md` is now a full application PRD (reverse-engineered from the Reference Automation Project, ~180 requirements across 14 modules), so a run can be scoped by pointing at a PRD section — first used by `2026-07-25_16-45-00__Module__RuleEngine` (§7.7 Rule Engine). ⚠️ That PRD is marked *Draft for business review*, not business-approved, and tags each requirement `[V]` verified / `[O]` observed / `[I]` inferred — a run sourced from it must carry those tags forward and treat `[O]`/`[I]` as unconfirmed. The prior pasted-User-Stories PRD is preserved unchanged at `PRD_UserStories.md`, which is what every pre-2026-07-25 run's "PRD.md User Story 1–4" citation resolves to. |
| Custom scope description | yes | "Administration + Identity" chosen as first run scope by user, 2026-07-10 |
| Azure DevOps ID (future) | Not yet integrated | See `pipeline/run_scope.md` §4.2 |
| Jira ID (future) | Not yet integrated | See `pipeline/run_scope.md` §4.2 |

## History of scope choices

| Run | Run Type | Run Scope (Type / Source) | In-scope modules (summary) | Project Context document |
|---|---|---|---|---|
| RUN-20260710-001 | User Story | User Story / Pasted text (Q2-CORE-WT1-T3002-066 + T3087, jointly scoped) | Credential Routes Filter, Airport BlackList/WhiteList, Supplier Credentials (Restricted Airlines), Airline (GDS/LCC type), Booking-Mid Office + Portal Booking Module | `ProjectContext_CredentialRoutesFilter.md` — Approved |
| RUN-20260712-001 | Feature (Observation-based Spike) | Feature / Custom scope description | Login/Authentication | `ProjectContext_LoginAuthentication.md` — Approved |
| RUN-20260712-002 | Feature (Observation-based Spike) | Feature / Custom scope description | Administration — Branch, Agency, Staff (Company → Branch → Agency → Staff) | `ProjectContext_BranchAgencyStaff.md` — in progress (Agency portion since superseded by `ProjectContext_Agency.md`) |
| RUN-20260713-001 | Feature (Observation-based Spike) | Feature / Custom scope description | Admin/Agency — Search Agency automation, Activate Agency spike (Blocked), FINDING-006 resolution, Branch full re-verification | Continuing `ProjectContext_BranchAgencyStaff.md` |
| RUN-20260718-001 | User Story | User Story / Pasted text | Admin → Agency full CRUD lifecycle (Track A: Create, Search, Update, Actions/Approve-Reject) — see `context/ProjectContext_Agency.md`; Track B (WT1-T2919 E-Ticket Agency Branding) tracked separately, non-Agency-CRUD scope | Non-versioned (per 2026-07-18 process change) — Pending |
| RUN-20260721-001 | User Story | User Story / Pasted text | Admin → Role Management — Create Role (Role Name, module/sub-module/tab permission grid, Submit for Approval/Cancel) — new scope/entity | `ProjectContext_Role.md` — Approved |
| 2026-07-25_16-45-00__Module__RuleEngine | Full Regression | Feature (module-level) / Requirement document reference (`PRD.md` §7.7 Rule Engine, §9, §11 E2E-01) | Rule Engine — all seven rule types (Markup, Discount, Service Charge, Cancellation Charge, Fare Rules, Offer Pricing, Terms & Conditions) + Rule History; Booking Mid Office → Booking / Manual Booking Invoice in scope as fare-observation surface only. Mutation authorized for Rule Engine records only. | `ProjectContext_RuleEngine.md` — Pending Review |
| <!-- YYYY-MM-DD_HH-mm-ss__Scope__Target --> | <!-- Full Regression / Smoke / Feature / User Story / Bug / Epic / Custom --> | <!-- e.g. User Story / Pasted text --> | <!-- summary --> | <!-- vN --> |

**Run folder naming (2026-07-23 update):** every run above still uses its original `RUN-YYYYMMDD-XXX` folder name — none were renamed (see `workflows_and_pipelines/pipeline/run_manager.md` §5.6 for why). Their inferred equivalents under the new `YYYY-MM-DD_HH-mm-ss__Scope__Target` convention are recorded in `platform_core_data/runs/.run_folder_index.json`. Every run going forward gets a folder name in the new convention directly, generated via `platform_core/tools/run_manager/` — no new row here should cite a `RUN-YYYYMMDD-XXX` name.
