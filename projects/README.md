# `projects/`

## Purpose

This folder exists to hold **everything specific to one application under test** — durable Project Knowledge (what the application is, how to reach it, what's been learned about it) plus, as of the repository's v1.0 architecture, that project's own **generated artifacts**. Every project is fully self-contained: `projects/{{PROJECT_NAME}}/` holds both the durable knowledge and the generated output for that project, with nothing project-specific living outside its own folder. There is no repository-root `artifacts/` directory.

It exists as its own top-level layer, separate from `platform_core/` (reusable across projects), `.claude/` (agent behavior, project-agnostic), and `workflows_and_pipelines/` (orchestration rules, project-agnostic), because everything under here is true of exactly one application, never generalized without an explicit Promotion decision.

## Responsibility

**This folder owns what one application under test *is*, and everything the pipeline has produced by validating it.** It does not own reusable engineering knowledge (`platform_core/knowledge/`), agent behavior (`.claude/skills/`), or the stage sequencing/checkpoint rules that operate on it (`workflows_and_pipelines/`).

## What Lives Here

- **Project Knowledge** — durable facts about the application: its PRD, onboarding notes, architecture, domain glossary, run configuration, and supporting resources (requirements, API specs, diagrams, screenshots, credentials documentation). Written by humans, changes only when the project itself changes.
- **Project Knowledge Base** (`knowledge_base/`) — this project's own accumulated engineering experience: confirmed repairs, diagnosis notes, automation assets, application/UI findings, business rules, and lessons learned. The project-scoped counterpart to `platform_core/knowledge/`, per `workflows_and_pipelines/pipeline/pipeline.md` §10.
- **Browser Driver assets** (`browser/`, `credentials/`) — this project's Browser Profile (login mechanics), Screen/Component locator knowledge, and real (git-ignored) credentials — see `platform_core/tools/browser_driver/README.md` for the full four-way split this implements.
- **Generated Artifacts** (`artifacts/`) — every output the 6-stage pipeline produces while running against this project: Project Context, Discovery Artifacts, Manual Test Suites, Automation Packages, Execution Results, and the Final QA Report, plus immutable per-run snapshots.
- **Templates** (`templates/project_template/`) — the canonical, copyable skeleton for onboarding a new project, mirroring every category above with placeholder content.

## What Does NOT Belong Here

- **Reusable, cross-project engineering knowledge.** A pattern proven true beyond this one application is promoted out to `platform_core/knowledge/` — never grown indefinitely inside a project's own `knowledge_base/` under the assumption it "probably applies everywhere."
- **Agent behavioral specifications.** What a Skill does belongs in `.claude/skills/`, not here — a project folder supplies *inputs* to a Skill, never behavior.
- **Orchestration or sequencing logic.** Stage order and checkpoint mechanics belong in `workflows_and_pipelines/`.
- **Another project's knowledge, findings, or artifacts.** Project Isolation is enforced explicitly (`pipeline.md` §6 Rule 9, §10.6): one project's `knowledge_base/` or `artifacts/` must never leak into another's working context.
- **Real secrets committed to git.** `credentials.json` files are git-ignored by design (two overlapping `.gitignore` rules) — only `credentials.template.json` (placeholders only) is ever committed.

## Folder Structure

```
projects/
  {{PROJECT_NAME}}/                # one directory per project — fully self-contained
    PRD.md                         # Product Requirements Document — Stage 1 INPUT, never generated
    README.md                      # what this project is, links to its artifacts/
    onboarding.md                  # how a new person/agent gets oriented on this project
    run_configuration.md           # modules in scope, target URL, credentials, environment notes
    architecture.md                # architecture of the application under test (not the platform)
    glossary.md                    # domain/product terminology specific to this project
    resources/                     # supplementary material — standardized layout
      requirements/                  # organized by Type only: epics/, features/, user_stories/,
                                      #   bugs/, specifications/ — Source is in-file metadata, not a
                                      #   subfolder (see workflows_and_pipelines/pipeline/run_scope.md §4.3)
      api/{swagger,postman}/
      diagrams/ · screenshots/ · sample_data/ · notes/ · external_links/
      credentials/                  # documentation ABOUT credentials only — never real secrets
    knowledge_base/                 # Project Knowledge Base — this project's own engineering experience
      repair/                        # confirmed repair records (REP-NNN)
      diagnosis/ · execution/ · automation/     # this project's evidence-gathering/execution/
                                                 #   automation-generation history
      application/ · ui/                        # application behavior and UI observations
      findings/ · lessons_learned/               # Explorer/Test Design-surfaced knowledge
      business_rules/                            # this project's own business logic (never promoted)
      INDEX.md
    browser/                        # Browser Driver Layer — this project's live-browser assets
      profile.json                    # auth + browser init only
      screens/ · components/          # per-screen/shared-component locator knowledge
    credentials/                    # real (git-ignored) credentials — see credentials/README.md
      credentials.template.json       # committed — schema only, placeholder values
      credentials.json                # real values — NEVER committed
    artifacts/                      # generated outputs — no root-level artifacts/ (repo v1.0 architecture)
      context/                        # current-approved Project Context
      discovery/                      # current-approved Discovery snapshots, QA Assessment Report
        findings/                       # current Finding evidence packages
      test_design/                    # current-approved Manual Test Suite, Traceability Matrix, Coverage Report
      automation/                     # current-approved Automation Package, Plan, Manifest, Summary
      execution/                      # current Execution Results + evidence
      reporting/                      # current Final QA Report
      pipeline/                       # Run Manifest — generated pipeline artifacts only, no project knowledge
      runs/                           # immutable per-run snapshots
        RUN-YYYYMMDD-XXX-{slug}/        # slug is AI-generated for runs created after 2026-07-21 (see
                                         #   workflows_and_pipelines/pipeline/run_manager.md §5)
          metadata/                       # run.json + run_summary.md — always created
          context/ · discovery/{findings/} · test_design/ · automation/ · execution/ · reporting/
                                           # created only when that stage actually writes to it
  templates/
    project_template/               # canonical, copyable skeleton — same shape as above, all placeholders
```

Every project's `resources/` folder follows the same standardized layout so material is always in a predictable place — see any project's `resources/README.md`. **Hard rule, no exceptions:** secrets, passwords, and API keys must never be committed anywhere in this repository.

## Interaction with Other Layers

```
              writes Inputs                    reads Outputs / writes back
platform_core/  ────────────▶  projects/{PROJECT}/  ◀────────────  .claude/skills/{stage}/SKILL.md
knowledge/                              │                                    │
                                        │ Promotion Workflow                 │ invoked, in order, by
                                        │ (explicit human approval)          ▼
                                        ▼                          workflows_and_pipelines/pipeline/pipeline.md
                              platform_core/knowledge/
```

- **`projects/` ← `.claude/skills/`:** every Skill reads its declared Inputs from, and writes its declared Outputs to, a specific project's `artifacts/` (and `knowledge_base/`, for repair/diagnosis writes) — a Skill file itself names no project; the project folder supplies the concrete data.
- **`projects/` ← `workflows_and_pipelines/`:** the orchestration layer governs every artifact path, versioning rule, and Run Workspace structure realized under a project's `artifacts/` — this folder implements those rules, it doesn't define them.
- **`projects/knowledge_base/` → `platform_core/knowledge/`:** the only legitimate promotion source. A pattern proven here may become Platform Knowledge only via explicit human approval (`pipeline.md` §10.5) — never the reverse; Platform Knowledge is read by every project, but no project's content is ever pulled in from another project.
- **`projects/{PROJECT}/browser/` + `credentials/` ← `platform_core/tools/browser_driver/`:** the shared engine resolves these paths dynamically at runtime by project name; this folder supplies the actual profile/screens/credentials data, the engine itself holds none of it.

## Lifecycle

A project participates in every stage of every run targeted at it — it is the substrate the entire pipeline operates on:

```
Project onboarded (copy templates/project_template/, fill in PRD/onboarding/architecture/glossary)
        ↓
Run requested, scoped via Run Scope (workflows_and_pipelines/pipeline/run_scope.md)
        ↓
Run Manager allocates a Run Workspace under artifacts/runs/
        ↓
Stage 1–6 read/write artifacts/{context,discovery,test_design,automation,execution,reporting}/
        ↓
Confirmed repairs/lessons accumulate in knowledge_base/
        ↓
(optional) a lesson proves reusable → Promotion Workflow → platform_core/knowledge/
```

## Design Principles

- **Full Self-Containment** — a project's knowledge and its generated output live under the same root; nothing project-specific lives outside `projects/{{PROJECT_NAME}}/`.
- **Project Isolation** — one project's knowledge and artifacts never leak into another's working context, enforced explicitly, not just by convention.
- **Knowledge vs. Generated-Output Separation** — durable Project Knowledge (changes when the project changes) is conceptually distinct from `artifacts/` (changes on every pipeline run), even though both live under the same folder root.
- **Promotion, Never Assumption** — a pattern discovered here stays project-scoped by default; it becomes Platform Knowledge only through the explicit, human-gated Promotion Workflow.
- **Templated Onboarding** — every project starts from the same `templates/project_template/` skeleton, so structure is predictable across projects regardless of how many exist.

## Rules

- **Always** keep a project's durable knowledge (`PRD.md`, `onboarding.md`, `architecture.md`, `glossary.md`, `run_configuration.md`, `resources/`) conceptually separate from its generated `artifacts/` — even though both live under the same root.
- **Always** version generated artifacts; a rejected-and-revised artifact is a new version, never an in-place edit.
- **Never** let one project's `knowledge_base/` or `artifacts/` be read as input while working on a different project — sibling projects may only be consulted as *structural* examples (e.g. how a `resources/` folder is laid out), never as a source of business rules or requirements.
- **Never** commit a real `credentials.json` — only `credentials.template.json` (placeholders) is tracked.
- **Only** a human, via the Promotion Workflow, may move a pattern from a project's `knowledge_base/` into `platform_core/knowledge/`.

## Typical Flow

```
projects/OrangeHRM/PRD.md + run_configuration.md
        ↓
Stage 1 (Project Context Agent) → artifacts/context/
        ↓
Stage 2 (Explorer Agent, using browser/ + credentials/) → artifacts/discovery/
        ↓
Stage 3 (Test Design Agent) → artifacts/test_design/
        ↓
Stage 4 (Automation Agent) → artifacts/automation/
        ↓
Stage 5 (Execution Agent) → artifacts/execution/ + knowledge_base/repair/ (on confirmed fixes)
        ↓
Stage 6 (Reporting Agent) → artifacts/reporting/
```

## Common Mistakes

- **"This finding is obviously true of every project, write it straight to `platform_core/knowledge/`."** No — it must first land in this project's own `knowledge_base/`, then be promoted only via explicit human approval.
- **"Reference OrangeHRM's business rule while working on NDC, it's a similar module."** No — Project Isolation forbids one project's business content from informing another's, even when the modules look similar.
- **"Put the login selector inside `run_configuration.md`."** No — locator knowledge belongs in `browser/screens/` or `browser/components/`, not the durable knowledge files.
- **"Just commit `credentials.json`, it's only staging creds."** No — never commit any real credentials file, regardless of environment.
- **"Skip the template, just create a folder and start writing the PRD."** No — always start from `templates/project_template/` so every project shares the same predictable shape.

## Adding a New Project

1. Copy `projects/templates/project_template/` wholesale into a new `projects/{{PROJECT_NAME}}/` directory.
2. Fill in `PRD.md`, `README.md`, `onboarding.md`, `run_configuration.md`, `architecture.md`, `glossary.md` with the new project's specifics, and populate `resources/` subfolders as material becomes available.
3. Set up `browser/profile.json` and `credentials/credentials.json` (from the template) per `platform_core/tools/browser_driver/README.md`'s "Adding a new project" steps.
4. Point the Project Context Agent (`.claude/skills/project-context-agent/SKILL.md`) at the new project's `PRD.md` and `run_configuration.md` for its first run — no change to any Skill spec or `workflows_and_pipelines/pipeline/pipeline.md` is required; both are already project-agnostic via `{{PROJECT_NAME}}` substitution.

## Related Layers

- [`../platform_core/`](../platform_core/) — the reusable Knowledge and Tools layer this folder's `knowledge_base/` promotes into and `browser/`/`credentials/` are resolved by at runtime.
- [`../.claude/`](../.claude/) — the Skills whose declared Inputs/Outputs resolve to concrete files under this folder.
- [`../workflows_and_pipelines/`](../workflows_and_pipelines/) — the orchestration rules governing every artifact path, run identity, and Run Scope concept realized here.
