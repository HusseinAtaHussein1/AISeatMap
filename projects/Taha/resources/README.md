# resources/

Supplementary reference material for the Taha project that doesn't fit `onboarding.md`, `run_configuration.md`, `architecture.md`, or `glossary.md`. This layout is standardized across every project under `projects/` so material is always in a predictable place — see `projects/README.md` for how this fits into the overall `projects/` vs `artifacts/` split.

> **Never commit secrets.** Passwords, API keys, tokens, connection strings, or any other credential material must never be committed to this repository — not in `credentials/`, not in `sample_data/`, not anywhere else in this folder or the project. Reference where real credentials are stored (a secrets manager, vault, or environment variable) instead of pasting the values themselves. See `credentials/` below.

## Folders

| Folder | Purpose | When to use it |
|---|---|---|
| `docs/` | General supplementary documentation not covered by the standard project files (vendor documentation, specs, standards references). | Drop in any reference document that informs the project but isn't itself onboarding/architecture/glossary content. |
| `api/` | API-related reference material for the project. | Use the subfolders below rather than placing files directly here. |
| `api/swagger/` | OpenAPI/Swagger specification files for the application under test. | When the application exposes an API and you have (or produce) its OpenAPI/Swagger definition. |
| `api/postman/` | Postman collections and environment files. | When API exploration/testing uses Postman collections worth keeping alongside the project's knowledge. |
| `diagrams/` | Architecture, flow, or sequence diagrams (image exports or source files, e.g. draw.io, Mermaid, PlantUML). | When a diagram would clarify something `architecture.md` describes only in prose. |
| `screenshots/` | Reference screenshots of the application under test — baseline UI captures for human orientation. | For onboarding/context screenshots only. This is **not** where pipeline-generated evidence goes — that belongs under `artifacts/Taha/runs/RUN-YYYYMMDD-XXX/screenshots/` per `pipeline/run_manager.md`. |
| `sample_data/` | Sample or fixture data for understanding the domain. | Anonymized/synthetic data only — **never** real production or personally identifiable data. |
| `credentials/` | Documentation *about* credentials — e.g., which vault/secrets manager holds them, which roles exist, rotation policy. | Never for the actual secret values. See the warning above. This folder ships with a `.gitignore` that blocks anything except `README.md`/`.gitkeep` from being committed, as a safety net — it is not a substitute for care. |
| `notes/` | Free-form working notes, meeting notes, scratch thoughts related to the project. | Anything too informal or in-progress for the structured project files. |
| `external_links/` | Links to external resources — ticket trackers, dashboards, wikis, vendor portals. | Keep as a simple Markdown list of `[Label](URL) — why it matters`; don't duplicate content that belongs in `docs/`. |

## Adding a new project from this template

This entire `project_template/` directory (including this `resources/` layout) is meant to be copied wholesale into a new `projects/Taha/` directory — see `projects/README.md` → "Adding a new project."
