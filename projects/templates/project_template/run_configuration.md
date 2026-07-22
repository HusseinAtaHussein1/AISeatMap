# {{PROJECT_NAME}} — Run Configuration

This is the durable, versioned home for the "run configuration" that `agents/project_context_agent.md` §4 lists as a required input alongside the PRD.

> This file describes configuration, not a decision — the Project Context Agent still produces the actual Project Context artifact, and any change here takes effect only the next time that agent is (re-)run. Editing this file does not retroactively change an already-approved Project Context version.

## Target Environment

| Field | Value |
|---|---|
| Application | <!-- name/version --> |
| Environment | <!-- shared/isolated, staging/prod-like, etc. --> |
| URL | <!-- target environment URL --> |

## Credentials Available

| Role | Username | Password | Status |
|---|---|---|---|
| <!-- Role --> | <!-- username --> | <!-- password --> | <!-- confirmed working / unconfirmed --> |

Do not paste real secret values into this table for a non-public environment — reference `resources/credentials/` (documentation about *where* credentials live) or a secrets manager instead. See `resources/README.md`.

## Browser Automation (Browser Driver Layer)

If Browser Automation Discovery Mode is used for this project, see `tools/browser_driver/README.md` for the full contract. `tools/browser_driver/` is shared, project-agnostic infrastructure — everything project-specific lives inside this project's own folder:
- **Browser Profile** (non-secret, versioned, small/stable): `browser/profile.json` — create this once, from a one-time inspection of the login page. Auth + browser init only — never add screen/menu/table locators here. Deliberately NOT under `automation/` — that name is reserved for Stage 4's SHAFT output (`artifacts/automation/`).
- **Screen/Component Knowledge** (non-secret, versioned, grows over time): `browser/screens/*.json` and `.../components/*.json` — one small file per screen or shared component, added as each is explored.
- **Credentials** (real, git-ignored, never committed): `credentials/credentials.json` — copy `credentials/credentials.template.json` (already scaffolded in this template, along with a local `.gitignore`) and fill in real values, keyed by environment (`STG`/`PREPROD`/`PROD`).
- Agents request a session via `BrowserDriver.authenticate({project: '{{PROJECT_NAME}}', env})` — credentials load automatically by project name; agents never see login mechanics or credential values directly.

## Environment Constraints (standing, project-wide)

<!-- Standing rules that apply to every run against this project, e.g. data-mutation boundaries, exploitation limits. -->

## Modules

See [`architecture.md`](architecture.md) for the full module list. Which modules are **in scope for a given run** is decided per run and recorded in that run's Project Context — this file only records what modules and credentials *exist to be chosen from*.

## Run Scope Sources Available

Per [`../../pipeline/run_scope.md`](../../pipeline/run_scope.md), a run's scope (Type + Source) is what actually narrows Project Knowledge into that run's Project Context. This section records which **Sources** are set up for this project — not what any specific run chose.

| Source | Available? | Notes |
|---|---|---|
| Entire Project | <!-- yes/no --> | <!-- notes --> |
| Pasted text | <!-- yes/no --> | <!-- notes --> |
| Markdown file (`resources/requirements/`, `resources/notes/`) | <!-- yes/no --> | <!-- notes --> |
| Uploaded document | <!-- yes/no --> | <!-- notes --> |
| Requirement document reference | <!-- yes/no --> | <!-- notes --> |
| Custom scope description | <!-- yes/no --> | <!-- notes --> |
| Azure DevOps ID (future) | Not yet integrated | See `pipeline/run_scope.md` §4.2 |
| Jira ID (future) | Not yet integrated | See `pipeline/run_scope.md` §4.2 |

## History of scope choices

| Run | Run Type | Run Scope (Type / Source) | In-scope modules (summary) | Project Context version |
|---|---|---|---|---|
| <!-- RUN-YYYYMMDD-XXX-{slug} --> | <!-- Full Regression / Smoke / Feature / User Story / Bug / Epic / Custom --> | <!-- e.g. User Story / Pasted text --> | <!-- summary --> | <!-- vN --> |
