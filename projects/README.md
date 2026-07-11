# projects/

This directory holds **project knowledge** — everything a human or agent needs to understand *what a project under test is* and *how to run the pipeline against it*.

It is deliberately separate from [`artifacts/`](../artifacts/), which holds **generated outputs** — the artifacts the 6-agent pipeline ([`pipeline/pipeline.md`](../pipeline/pipeline.md), [`agents/`](../agents/)) produces while running against a project (Project Context, Discovery, Test Cases, Automation, Execution Results, Reports).

## Why the split

| | `projects/{{PROJECT_NAME}}/` | `artifacts/{{PROJECT_NAME}}/` |
|---|---|---|
| **Contains** | Onboarding notes, run configuration, target-application architecture, domain glossary, supporting resources | Pipeline-stage outputs: context, discovery, testcases, Automation, execution, Reports, runs, pipeline manifest |
| **Written by** | Humans, before/between pipeline runs | Agents, during pipeline runs |
| **Changes when** | Project knowledge changes (new module in scope, new environment, corrected onboarding notes) | A pipeline stage is (re-)executed |
| **Lifetime** | Persists as long as the project is tracked | Versioned per run (`RUN-YYYYMMDD-XXX`) per `pipeline/run_manager.md` |

Neither directory replaces the other. The Project Context Agent ([`agents/project_context_agent.md`](../agents/project_context_agent.md)) still reads the PRD and run configuration and writes its output to `artifacts/{{PROJECT_NAME}}/context/`; `projects/{{PROJECT_NAME}}/run_configuration.md` is simply where that run configuration now lives as a durable, versioned file instead of being restated ad hoc for every run.

**`projects/{{PROJECT_NAME}}/` is the canonical project knowledge base** — it doesn't change from run to run; it changes only when the project itself changes (a new module, a corrected assumption, a new environment). **`artifacts/{{PROJECT_NAME}}/context/`, by contrast, holds the generated Project Context for one run at a time** — a distilled, narrowed lens onto that canonical knowledge, produced fresh (as a new version) whenever a run's scope changes. See [`../pipeline/run_scope.md`](../pipeline/run_scope.md) for how that narrowing — the **Run Scope** — works: `Project Context = Project Knowledge + Run Scope`.

## Run Scope

A pipeline run rarely needs to validate an entire project at once — it might target a single Epic, Feature, User Story, Bug, or an ad hoc requirement document instead. **Run Scope** is the platform concept that names this: it defines exactly what a given run is allowed to validate, and it becomes part of both the Run Configuration (`projects/{{PROJECT_NAME}}/run_configuration.md`) and the resulting Project Context.

This does not add a pipeline stage, a new agent, or change any of the six existing agents' behavior — it names and structures an input ("modules/scope in scope for this run") the Project Context Agent already declared. Full specification: [`../pipeline/run_scope.md`](../pipeline/run_scope.md).

## Layout

```
projects/
  OrangeHRM/                    # one directory per project
    README.md                   # what this project is, links to its artifacts/
    onboarding.md               # how a new person/agent gets oriented on this project
    run_configuration.md        # modules in scope, target URL, credentials, environment notes
    architecture.md             # architecture of the application under test (not the platform)
    glossary.md                 # domain/product terminology specific to this project
    resources/                  # supplementary material — standardized layout, see below
      requirements/              # requirement material, organized by Type only (renamed from docs/, 2026-07-10)
        epics/
        features/
        user_stories/            # Source (Pasted text/Markdown/Azure DevOps/...) is a metadata field inside
        bugs/                    #   each file, not a subfolder — see resources/README.md and pipeline/run_scope.md §4
        specifications/
      api/
        swagger/
        postman/
      diagrams/
      screenshots/
      sample_data/
      credentials/               # documentation ABOUT credentials only — never real secrets
      notes/
      external_links/
  templates/
    project_template/           # canonical, copyable skeleton for onboarding a new project
      README.md
      onboarding.md
      run_configuration.md
      architecture.md
      glossary.md
      resources/                 # same standardized layout as above
```

Every project's `resources/` folder follows the same standardized subfolder layout so material is always in a predictable place across projects — see any project's `resources/README.md` for what each subfolder is for (and a hard rule: secrets, passwords, and API keys must never be committed anywhere in this repository).

## Adding a new project

1. Copy `projects/templates/project_template/` wholesale into a new `projects/{{PROJECT_NAME}}/` directory.
2. Fill in each file (`README.md`, `onboarding.md`, `run_configuration.md`, `architecture.md`, `glossary.md`) with the new project's specifics, and populate `resources/` subfolders as material becomes available.
3. Point the Project Context Agent at the new project's PRD and `projects/{{PROJECT_NAME}}/run_configuration.md` when starting its first run — this does not require any change to the agent specs or `pipeline/pipeline.md`, both of which are already project-agnostic (`{{PROJECT_NAME}}` substitution).

This reorganization does not move, rename, or alter any existing file under `artifacts/` or `agents/`, does not change the number of pipeline stages or any agent's behavior, and adds only one new, purely-additive file under `pipeline/` (`run_scope.md`) — `pipeline/pipeline.md` itself is unchanged.
