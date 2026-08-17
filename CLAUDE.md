# Agentic AI Testing Platform — working rules

Spec-driven agentic QA pipeline. Eight Skills across two pipelines, defined in
[`workflows_and_pipelines/pipeline/pipeline.md`](workflows_and_pipelines/pipeline/pipeline.md).

## New User Story intake — routing comes first

**Trigger: any supplied User Story.** Pasted text, a Markdown file, a work-item reference, or a
description in prose. If a message contains something a reasonable reader would call a User Story,
this fires.

**Do not create a module, a run, a Feature, an active pointer, or a Project Context before intake is
answered and the proposed structure is confirmed.**

### Question 1 — always asked

> Is this User Story for a standalone Feature or part of a module CRUD scope?
>
> 1. `Feature`
> 2. `CRUD`

**Never infer this from the story title.** "Bulk Export Agencies" reads like a Feature and may be an
Update-Agency acceptance criterion. "[Admin] Update Agency" reads like CRUD and may be a standalone
capability. The title is evidence of nothing.

### If `Feature`

1. Collect the complete User Story and Acceptance Criteria if not already supplied.
2. Scope is `Run Scope Type: Feature` · `Run Type: User Story`. **The Feature defines the scope** —
   never widen it into the parent module's full CRUD scope.
3. Identify and **confirm** the parent module.
4. Run the scope sweep (below).
5. Propose `platform_core_data/modules/<module>/features/<feature>/` — creating the parent module
   first if it does not exist — and **wait for confirmation**.

### If `CRUD`

1. Ask: **one User Story, or multiple CRUD User Stories?**
2. If multiple, ask which areas: **Add/Create · Update · Search · Approve · Reject**. Never assume an
   area exists because another one was supplied.
3. Request the User Story and Acceptance Criteria for every selected area not yet provided.
4. Run the scope sweep, propose **one consolidated module** — `platform_core_data/modules/<module>/`,
   **no feature folder per CRUD area** — and **wait for confirmation**.

### The boundary

A capability supplied **as part of a CRUD package** stays in the consolidated module and gets **no
Feature folder**, however feature-shaped it sounds. A capability the human presents **as an
independent Feature/User Story** gets one. The test is *how it was supplied*, not whether it could be
described as a feature.

**If the classification is unclear, ask. Never decide silently.**

### The scope sweep — before anything is created

```bash
node platform_core/tools/module_manager/cli.js inspect-scope --user-story "US-1234" --name "..." --json
```

Reports registered modules, registered Features, User Story mappings, module and Feature contexts,
current stage states, and the active pointers. Exit `2` means overlap candidates.

**Overlap is a candidate, never a verdict.** Do not identify overlap from the User Story number
alone — compare the business scope and Acceptance Criteria. The same number can mean different scope;
a different number can mean the same scope.

**When scope already exists,** explain what exists and ask which is wanted: a new independent run
against it · extend the module with a new Feature · add missing CRUD coverage · refresh because the
requirements changed. **Never overwrite, continue, or modify a previous run unless explicitly asked.**

### Before writing, show

Proposed parent module · proposed feature name · proposed paths · whether an overlapping module or
Feature exists · the proposed run scope · what is deliberately *not* being created. Then wait.

`cli.js feature scaffold <module> <feature> --dry-run` prints the exact directory and file list and
creates nothing — so the proposal is the real plan.

**Keep intake questions short and explicit.** Two options, plainly worded, no preamble.

**Full rule, and the enforcement that does not depend on this file:**
[`workflows_and_pipelines/pipeline/new_us_intake.md`](workflows_and_pipelines/pipeline/new_us_intake.md).

## Scope pointers

| | |
|---|---|
| `cli.js use <module>` | Consolidated module/CRUD scope. **Clears `activeFeature`.** |
| `cli.js use-feature <module> <feature>` | Feature scope. Sets both pointers. |
| `activeFeature: null` | Module/CRUD scope. Resolve `{{MODULE_SLUG}}` only. |
| `activeFeature` set | Feature scope. Resolve **both** `{{MODULE_SLUG}}` and `{{FEATURE_SLUG}}`. |

**An invalid or stale Feature pointer is an error, never a fallback to module scope.** Stop and ask
for correction — silently dropping to module scope writes Feature output into its parent's folders.

## Standing rules

- **Never overwrite, continue, or modify a previous run** unless explicitly asked.
- **Existing modules are not migrated.** Modules created before the Features layer are valid as they
  are. Do not move or normalize `branch`, `agency`, or any existing artifact to match a new convention.
- **A module is never created silently.** Stage 1 proposes; a human approves; the Module Manager
  records (`module_architecture.md` §6.4). The same applies to a Feature.
- **Never hand-edit `modules.json`, `module.json`, or `feature.json`** — every write goes through
  `platform_core/tools/module_manager/cli.js`.
- **Never hand-format a slug or a run folder name.** The tooling generates both.
- **Scope is not authorization.** A module being in scope is not permission to mutate its records;
  that is decided per action against `execution_safety_policy.json` (`pipeline.md` §14).
- **Ask before every execution whether it runs Headed or Headless.** Never inferred, never carried
  over from the previous run.

## Tests

```bash
npm test                  # node --test across platform_core/tools/**/__tests__
npm run verify:boundary   # branch-boundary check
```
