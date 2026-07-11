# resources/

Supplementary reference material for the {{PROJECT_NAME}} project that doesn't fit `onboarding.md`, `run_configuration.md`, `architecture.md`, or `glossary.md`. This layout is standardized across every project under `projects/` so material is always in a predictable place — see `projects/README.md` for how this fits into the overall `projects/` vs `projects/{{PROJECT_NAME}}/artifacts/` split.

> **Never commit secrets.** Passwords, API keys, tokens, connection strings, or any other credential material must never be committed to this repository — not in `credentials/`, not in `sample_data/`, not anywhere else in this folder or the project. Reference where real credentials are stored (a secrets manager, vault, or environment variable) instead of pasting the values themselves. See `credentials/` below.

## Folders

| Folder | Purpose | When to use it |
|---|---|---|
| `requirements/` | Requirement source material, organized by kind — see the breakdown below. Replaces the old flat `docs/` folder (renamed, 2026-07-10, to give requirement documents a predictable, typed location instead of a catch-all). | Drop in any Epic, Feature, User Story, Bug, or standalone specification/requirement document that informs the project's scope. |
| `api/` | API-related reference material for the project. | Use the subfolders below rather than placing files directly here. |
| `api/swagger/` | OpenAPI/Swagger specification files for the application under test. | When the application exposes an API and you have (or produce) its OpenAPI/Swagger definition. |
| `api/postman/` | Postman collections and environment files. | When API exploration/testing uses Postman collections worth keeping alongside the project's knowledge. |
| `diagrams/` | Architecture, flow, or sequence diagrams (image exports or source files, e.g. draw.io, Mermaid, PlantUML). | When a diagram would clarify something `architecture.md` describes only in prose. |
| `screenshots/` | Reference screenshots of the application under test — baseline UI captures for human orientation. | For onboarding/context screenshots only. This is **not** where pipeline-generated evidence goes — that belongs under `projects/{{PROJECT_NAME}}/artifacts/runs/RUN-YYYYMMDD-XXX/screenshots/` per `pipeline/run_manager.md`. |
| `sample_data/` | Sample or fixture data for understanding the domain. | Anonymized/synthetic data only — **never** real production or personally identifiable data. |
| `credentials/` | Documentation *about* credentials — e.g., which vault/secrets manager holds them, which roles exist, rotation policy. | Never for the actual secret values. See the warning above. This folder ships with a `.gitignore` that blocks anything except `README.md`/`.gitkeep` from being committed, as a safety net — it is not a substitute for care. |
| `notes/` | Free-form working notes, meeting notes, scratch thoughts related to the project. | Anything too informal or in-progress for the structured project files. |
| `external_links/` | Links to external resources — ticket trackers, dashboards, wikis, vendor portals. | Keep as a simple Markdown list of `[Label](URL) — why it matters`; don't duplicate content that belongs in `requirements/`. |

### `requirements/` breakdown

Organized by **Requirement Type only** — mirrors the Run Scope Types in [`pipeline/run_scope.md`](../../../../pipeline/run_scope.md) §3, so a requirement document's location tells you its Type at a glance. There is no further nesting by Source (see below):

| Subfolder | Run Scope Type it corresponds to | When to use it |
|---|---|---|
| `epics/` | Epic | A named Epic grouping Features/User Stories. |
| `features/` | Feature | A single Feature's requirement doc. |
| `user_stories/` | User Story | Any User Story, regardless of how it was delivered — see Source metadata below. |
| `bugs/` | Bug | A specific reported defect's reproduction/details. |
| `specifications/` | Requirement Document | A standalone spec/requirement doc broader than one story but not the whole project. |

### Requirement Source is metadata, not a folder

Requirement **Type** (Epic/Feature/User Story/Bug/Requirement Document) is stable and determines the subfolder above. Requirement **Source** (how it was delivered — Plain Text, Markdown, PDF, Word Document, Azure DevOps, Jira, GitHub, TestRail, Xray, Confluence, Figma, Email, and others as new integrations are added) is expected to keep growing over time, so it is **not** encoded in the directory structure. Instead, every requirement file records its Source as a metadata line near the top, e.g.:

```markdown
**Type:** User Story · **Source:** Plain Text (pasted) · **Received:** 2026-07-10
```

This keeps the folder layout stable regardless of where a requirement came from — adding a new Source (e.g. Figma or Xray) never requires a new subfolder, only a new value in the `Source:` field. See `pipeline/run_scope.md` §4 for the full list of Run Scope Sources this maps to.

*(Folder-per-Source was tried first — `user_stories/pasted/`, `user_stories/markdown/`, `user_stories/azure_devops/` — and replaced with this metadata-based approach on 2026-07-10 once it became clear Source would proliferate faster than Type.)*

## Adding a new project from this template

This entire `project_template/` directory (including this `resources/` layout) is meant to be copied wholesale into a new `projects/{{PROJECT_NAME}}/` directory — see `projects/README.md` → "Adding a new project."
