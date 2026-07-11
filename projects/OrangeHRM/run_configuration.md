# OrangeHRM — Run Configuration

This is the durable, versioned home for the "run configuration" that `agents/project_context_agent.md` §4 lists as a required input alongside the PRD. Previously this information only existed inline in that agent spec's illustrative example (§10) or was restated ad hoc per run; it now lives here so it can be reviewed and updated independently of the agent spec itself.

> This file describes configuration, not a decision — the Project Context Agent still produces the actual Project Context artifact, and any change here takes effect only the next time that agent is (re-)run. Editing this file does not retroactively change an already-approved Project Context version.

## Target Environment

| Field | Value |
|---|---|
| Application | OrangeHRM OS 5.8 |
| Environment | Public open-source demo (shared, not isolated) |
| URL | `https://opensource-demo.orangehrmlive.com/web/index.php/auth/login` |

## Credentials Available

| Role | Username | Password | Status |
|---|---|---|---|
| Admin | `Admin` | `admin123` | Confirmed working — the only role directly exercised to date |
| ESS / non-Admin | — | — | Not available; referenced in the UI but never confirmed (PRD §3) |
| Supervisor / Approver | — | — | Not available; inferred from UI affordances only (PRD §3) |
| Hiring Manager | — | — | Not available; may be a data attribute rather than a login role (PRD §3) |

## Environment Constraints (standing, project-wide)

- **Shared public demo state.** Data mutations are visible to every user of the demo instance. Do not perform destructive or persistent data-mutating actions without explicit, run-specific authorization.
- Any run-specific relaxation or tightening of this boundary (e.g., "a single successful login is authorized," "the Add Employee form may be opened but never submitted") is a decision for that run's Project Context, not this file — see the current approved Project Context for the operative boundary.
- No genuine exploitation of any suspected weakness (e.g., brute-force, injection) is ever authorized — probing is limited to input-handling/error-message observation.

## Modules

See [`architecture.md`](architecture.md) for the full module list. Which modules are **in scope for a given run** is decided per run and recorded in that run's Project Context (`projects/OrangeHRM/artifacts/context/OrangeHRM_ProjectContext.md`) — this file only records what modules and credentials *exist to be chosen from*, not what any specific run covers.

## Run Scope Sources Available

Per [`../../pipeline/run_scope.md`](../../pipeline/run_scope.md), a run's scope (Type + Source) is what actually narrows Project Knowledge into that run's Project Context. This section records which **Sources** are set up for OrangeHRM — not what any specific run chose.

| Source | Available? | Notes |
|---|---|---|
| Entire Project | Yes | The PRD covers all 10 sidebar modules; any run may scope to all of them. |
| Pasted text | Yes | Used to date — both existing runs' scope narrowing (see below) was expressed as prose in the run's Project Context, not a separate structured file. |
| Markdown file (`resources/requirements/`, `resources/notes/`) | Not yet used | `resources/requirements/` (renamed from `resources/docs/`, 2026-07-10) and `resources/notes/` exist but are currently empty. |
| Uploaded document | Not yet used | — |
| Requirement document reference | Yes | The PRD itself (`projects/OrangeHRM/PRD.md`) is the standing requirement document every run's scope is drawn from. |
| Custom scope description | Yes | Used to date — see below; neither prior run mapped cleanly to a single Epic/Feature/Story/Bug. |
| Azure DevOps ID (future) | Not yet integrated | See `pipeline/run_scope.md` §4.2 |
| Jira ID (future) | Not yet integrated | See `pipeline/run_scope.md` §4.2 |

## History of scope choices

> The Run Scope concept (`pipeline/run_scope.md`) was introduced after both runs below were executed. The **Run Scope** column classifies them retrospectively, for consistency — neither run was actually authored against a formal Run Scope Type/Source at the time.

| Run | Run Type | Run Scope (Type / Source) | In-scope modules (summary) | Project Context version |
|---|---|---|---|---|
| RUN-20260706-001 | User Story *(closest retrospective fit)* | Custom Scope / Pasted text | Login / Authentication only | v1 (approved) |
| RUN-20260706-002 | Custom | Custom Scope / Pasted text | Login / Authentication + PIM (read/search/validate only) | v2 (approved, superseded as current pointer) |
| RUN-20260707-001 | Full Regression | Entire Project / Entire Project | All 10 PRD Core Modules | v3 (**current approved**) |

For the authoritative detail behind any row, read the corresponding Project Context version file directly — this table is a pointer, not a substitute. The flat `projects/OrangeHRM/artifacts/context/OrangeHRM_ProjectContext.md` pointer now mirrors v3.
