# `platform_core_data/`

## Purpose

This folder holds **everything specific to the one application the platform is currently pointed at** — durable knowledge about the application (what it is, how to reach it, what's been learned about it) *and* every artifact the pipeline produces while validating it. Nothing application-specific lives outside this folder; nothing reusable lives inside it, with the single, explicitly-gated exception of `knowledge_base/patterns/`.

**The platform hosts exactly one project at a time** ([`workflows_and_pipelines/pipeline/pipeline.md`](../workflows_and_pipelines/pipeline/pipeline.md) §1). There is no project-name path segment, no project selector, and no sibling project directory. Retargeting the platform at a different application means running `agentic-testing init` in that application's repository — not adding a second folder here, and not editing any specification outside it.

**This folder always sits inside the Tool Root** — `agentic-testing-tool/platform_core_data/` once installed into a host repository. Every *process* artifact lives here; the Target Project receives generated automation code and nothing else. That split is the two-root contract ([`pipeline.md` §13](../workflows_and_pipelines/pipeline/pipeline.md), enforced by [`platform_core/tools/platform_paths/`](../platform_core/tools/platform_paths/)). `init` never overwrites this folder, even with `--force`.

## The four top-level folders

Everything here is one of exactly four things, and the distinction is what decides where a new file goes:

| Folder | Lifetime | Holds |
|---|---|---|
| [`knowledge_base/`](knowledge_base/) | **Durable — shared across every run and every module** | Inputs, project reference docs, detected stack, supporting material, browser/credential assets, accumulated knowledge |
| [`modules/`](modules/) | **Durable — per module, evolves in place across runs** | One subfolder per module, holding that module's Context, Discovery, Test Design, Automation, and Healing output, plus its `README.md` summary and `module.json` state. `modules.json` beside them is the registry *and* the active-module pointer (`module_architecture.md` §6) |
| [`runs/`](runs/) | **Per-run — a run folder is immutable once written** | One folder per pipeline execution, holding that run's **execution** artifacts and evidence: manual execution results, automation execution results, the Final QA Report, and run metadata. Two bookkeeping files sit beside the run folders and are deliberately mutable: `current_active_run.json` (§5.7) and `.run_folder_index.json` (§5.6) |
| [`automation_baseline/`](automation_baseline/) | **Long-lived source code** | The assembled whole-project Automation Package(s) under a three-way-merge lifecycle (`pipeline.md` §12), plus the `shared/` assets every module project references |

**The rule that decides the location, stated once:**

- Hand-authored, true of the whole application → `knowledge_base/`
- **Something a later run would want to *start from* → `modules/{module}/`**
- **Evidence of what happened in *one* execution → `runs/{{RUN_FOLDER}}/`**
- Assembled, whole-project automation source → `automation_baseline/`

The clearest illustration is the stack: `knowledge_base/stack.md` records what the project's toolchain *is* (durable, whole-project), `modules/login/automation/StackDocumentationContext_{Framework}.md` records which documentation queries were made while automating Login (durable, per module), and `runs/{{RUN_FOLDER}}/execution/ExecutionResults.md` records what happened when that suite ran on a given day (per run, immutable).

> **Changed 2026-07-29 (user-mandated).** `modules/` is new, and the Run Folder is narrowed to execution artifacts. Before this change every stage wrote into the Run Folder, which made a run the unit of everything — identity, scope, location, and lifetime. Working a project module by module across many sessions broke that: a module's design ended up scattered across the runs that touched it, and `runs/`' immutability (right for *what happened*) fought a module's design, which legitimately accumulates. [`module_architecture.md`](../workflows_and_pipelines/pipeline/module_architecture.md) specifies the split; `pipeline.md` §7 states the rule. **A pre-existing run folder holding `context/`, `discovery/`, or `test_design/` is never rewritten.**

> **Changed 2026-07-27.** Shared-across-runs material used to be scattered across four locations: input documents at this folder's root, supporting material under `resources/`, plus separate top-level `browser/`, `credentials/`, and `ui/` folders. It is now consolidated into `knowledge_base/`, because "is this shared or per-run?" is a question with one answer per file, while "root or `resources/`?" was a question with two plausible answers and no rule. Unused `resources/` subfolders (`TestData/`, `Documents/`, `Records/`, `sample_data/`, `external_links/`, `screenshots/`, `credentials/`), the empty `browser/pages/`, and the duplicate `patterns/diagnosis/` were removed in the same change — no stage read any of them.
>
> **Also 2026-07-27:** seven knowledge categories were removed — `application/`, `automation/`, `execution/`, `findings/`, `repair/`, `ui/`, and `notes/`. All had stood empty since the platform's inception, because each named output the platform **already holds in full elsewhere**: findings in `modules/{module}/discovery/findings/`, execution history in `runs/{{RUN_FOLDER}}/execution/`, repair records in `modules/{module}/healing/`, generated automation in the module project and `automation_baseline/`. `business_rules/` and `lessons_learned/` survive because neither a single module nor a single run owns their content. Application-agnostic engineering knowledge travels one way only: through the `patterns/` Promotion gate (`pipeline.md` §10.3, §10.5).

## Responsibility

**This folder owns what the application under test *is*, everything the pipeline has produced by validating it, and the reusable engineering knowledge promoted out of that experience (`knowledge_base/patterns/`).** It does not own agent behavior (`.claude/skills/`), the shared runtime engines that operate on it (`platform_core/tools/`), or the stage sequencing and checkpoint rules that govern it (`workflows_and_pipelines/`).

## What Does NOT Belong Here

- **Reusable engineering knowledge, anywhere outside `knowledge_base/patterns/`.** A pattern that would still hold against a *different* application is promoted into `patterns/` through the explicit human gate (`pipeline.md` §10.5) — never grown indefinitely in the project-scoped folders on the assumption it "probably applies everywhere," and never written straight into `patterns/` without that approval.
- **Agent behavioral specifications.** What a Skill does belongs in `.claude/skills/`; this folder supplies a Skill's *inputs*, never its behavior.
- **Orchestration or sequencing logic.** Stage order and checkpoint mechanics belong in `workflows_and_pipelines/`.
- **A second project.** Adding one would reintroduce exactly the project-selection ambiguity the single-project model removes (`pipeline.md` §6 Rule 9).
- **Real secrets committed to git.** `credentials.json` is git-ignored by design (two overlapping `.gitignore` rules); only `credentials.template.json`, placeholders only, is ever committed.
- **Execution results inside a module, or design artifacts inside a run.** These are the two ways to undo the §"four top-level folders" split by hand. A module's `README.md` *links* to the runs that executed it; it never restates their results. A run *cites* the module artifacts it consumed; it never copies them.
- **A copy of `knowledge_base/` content inside a module.** The PRD is read by Stage 1 and cited, never copied into a module.

## Folder Structure

```
platform_core_data/
  README.md                       # this file
  knowledge_base/                 # ── SHARED ACROSS RUNS ────────────────────────────────
    INDEX.md                        # catalog of Project Knowledge entries
    # Stage 1 inputs — human-authored, the only requirements source (pipeline.md §10.3)
    PRD.md                          # Product Requirements Document — Stage 1 INPUT, never generated
    PRD_UserStories.md              # user-story breakdown accompanying the PRD
    run_configuration.md            # modules in scope, target URL, environment notes
    # Execution Safety — what may actually execute here (pipeline.md §14, added 2026-08-07)
    execution_safety_policy.json    # THE policy: action x ownership x environment -> Allowed /
                                    #   Approval Required / Forbidden. Machine-readable, schema-validated,
                                    #   authoritative for evaluation. Evaluated by
                                    #   platform_core/tools/execution_safety/, which holds no rule itself
    execution_safety_policy.md      # the same policy for a human reviewer, with the provenance of every
                                    #   rule — migrated evidence / human decision / conservative default
    # Project reference — human-authored
    architecture.md                 # architecture of the application under test (not the platform)
    glossary.md                     # domain/product terminology
    onboarding.md                   # how a new person/agent gets oriented fast
    automation_framework.md         # binding framework structure — Stage 4A complies, never re-selects
    reference_automation_project.md # registration of an external reference automation repo (read-only)
    # Generated but durable
    stack.md                        # detected stack + pinned dependencies, written by Stage 4A (§34.4),
                                    #   correctable by hand; shared across runs
    # Supporting material — human-maintained
    requirements/                   # organized by Type only: epics/, features/, user_stories/,
                                    #   bugs/, specifications/ — Source is in-file metadata, not a
                                    #   subfolder (see workflows_and_pipelines/pipeline/run_scope.md §4.3)
    api/{swagger,postman}/          # API specifications and collections
    diagrams/                       # architecture and flow diagrams
    # Live-browser assets — Browser Driver Layer
    browser/
      profile.json                    # auth + browser init ONLY (no selectors, no URLs, no secrets)
      screens/ · components/          # per-screen / shared-component locator knowledge
    credentials/                    # real (git-ignored) credentials — see credentials/README.md
      credentials.template.json       # committed — schema only, placeholder values
      credentials.json                # real values — NEVER committed
    ui/screenshots/                 # canonical baseline screenshot per screen (created on demand)
    # Accumulated knowledge — the two categories a run folder cannot carry (pipeline.md §10.3)
    business_rules/                 # rules this application enforces — true between runs, never promoted
    lessons_learned/                # cross-run observations about working with this application
    patterns/                       # PLATFORM Knowledge — application-agnostic, promotion-only.
                                    #   Nested here structurally; still a SEPARATE layer, resolved
                                    #   first (§10.2), never receiving app-specific content (§10.6)
      repair_patterns/ · reasoning/    # the two populated categories (REPAIR-NNN, REASON-NNN)
      automation_patterns/ · diagnosis_patterns/ · execution_patterns/    # empty until promoted
      framework_patterns/ · reporting/ · pipeline_decision_patterns/      # empty until promoted
      INDEX.md · README.md             # catalog of promoted documents + the layer's own spec
  modules/                        # ── PER MODULE — DURABLE, EVOLVES IN PLACE ────────────
    modules.json                    # the module registry AND the active-module pointer
                                    #   (module_architecture.md §6) — mutable, committed
    README.md                       # what this folder is, and how to work with it
    {module}/                       # one folder per module — a slug: login, agency-management
      README.md                       # THE MODULE SUMMARY — regenerated, never hand-authored
      module.json                     # this module's authoritative state record
      context/                        # Stage 1  — ProjectContext.md (this module's slice)
      discovery/                      # Stage 2  — snapshot, QA assessment, coverage, timeline,
                                      #            findings/, evidence/
      test_design/                    # Stage 3  — TestCases_{Module}.md + .xlsx, matrix, coverage
      automation/                     # Stage 4A — a STANDALONE, runnable project (pipeline.md §12.1)
        tests_{Framework}/              #   its own config + dependency manifest
        .module_automation_state.json   #   Generated → Executed → Healed → Approved
      healing/                        # Stage 5H — created ONLY if a human invoked self-healing
  runs/                           # ── PER RUN — EXECUTION ONLY, IMMUTABLE ONCE WRITTEN ──
    current_active_run.json         # which run the pipeline is working in (§5.7) — mutable pointer;
                                    #   overridden per-process by AGENTIC_TESTING_RUN_FOLDER
    .run_folder_index.json          # legacy-name compatibility index (§5.6) — mutable
    run-NNN__YYYY-MM-DD_HH-mm-ss__Scope__Target/   # current convention (run_manager.md §5)
    RUN-YYYYMMDD-XXX[-slug]/                       # pre-existing runs — never renamed (§5.6)
      metadata/                       # run.json (+ targetRef §5.8, + modules[]/moduleScope/
                                      #   moduleArtifactRefs[]) + run_summary.md + RunManifest.md
                                      #   + lineage.json on a refinement run (§5.9) — always created
        SafetyPreflight.md            #   mutation footprint, written BEFORE executing (pipeline.md §14)
        SafetyAuthorizations.json/.md #   run-scoped human approvals — never carried to another run
        observability/                #   run telemetry (pipeline.md §15) — created on the first event.
                                      #   Events.jsonl is evidence (append-only); Metrics.json,
                                      #   Report.md and Dashboard.html are derived and regenerable.
                                      #   Absent on any run created before 2026-08-07 — those report
                                      #   Not Instrumented, and no event is fabricated for them
      manual_execution/               # Stage 4M — created only when it writes
      execution/                      # Stage 5A — results + evidence, plus any 5H rerun cycle
                                      #   (ExecutionResults.rerun-N.md, artifacts_rerun-N/)
      reporting/                      # Stage 6A — Final_QA_Report.md
                                      # NOTE: context/, discovery/, test_design/, automation/, and
                                      #   self_healing/ are NO LONGER created here. Runs predating
                                      #   2026-07-29 that hold them keep them, unchanged (§5.6)
  automation_baseline/            # ── LONG-LIVED AUTOMATION CODE ────────────────────────
    {framework}/tests_{Framework}/  # the authoritative, whole-project Automation Package, assembled
                                    #   from APPROVED module projects (pipeline.md §12.4)
    {framework}/shared/             # base page objects, auth fixtures, utilities, data factories —
                                    #   generated once, referenced by every module project
    {framework}/AutomationSummary_{Framework}.md
    TargetWriteLedger.md
```

**Artifact filenames carry no project prefix:** `ProjectContext_Agency.md`, not `NDC_ProjectContext_Agency.md`. With one project, that prefix was a constant on every filename and distinguished nothing.

**Hard rule, no exceptions:** secrets, passwords, and API keys must never be committed anywhere in this repository.

## Getting a fresh project running

The nine hand-authored documents at `knowledge_base/`'s root — every root `.md` except the generated `stack.md` — ship as blank scaffolds: headings and inline guidance, no invented content. `init` writes them on install and **never overwrites them afterwards**, so a filled-in `PRD.md` survives every upgrade. Fill them in this order:

| Order | File | Why it comes here |
|---|---|---|
| 1 | `PRD.md` | The approved requirements — the only document Stage 1 reads. Stage 1 halts without it. |
| 2 | `run_configuration.md` | Target URL, environment, in-scope modules — the other Stage 1 input. |
| 3 | `credentials/credentials.json` | Copy from `credentials.template.json` and fill in. Git-ignored; never committed, never echoed. |
| 4 | `browser/profile.json` | Login selectors plus a post-login success signal — needed for any live-browser stage. |
| 5 | everything else | `architecture.md`, `glossary.md`, `onboarding.md`, `automation_framework.md`, `PRD_UserStories.md` — read when relevant, never required to start. |

`stack.md` needs no manual step: Stage 4A writes it on the first automation run. Edit it only to record a correction detection got wrong — Stage 4A surfaces such conflicts rather than silently overwriting them.

## Where the Current Artifacts Live

| Artifact | Path |
|---|---|
| Product Requirements Document | `knowledge_base/PRD.md` |
| Detected stack | `knowledge_base/stack.md` |
| **Module registry + active module** | `modules/modules.json` |
| **Module summary** (what do we know about Login?) | `modules/{module}/README.md` |
| Project Context | `modules/{module}/context/ProjectContext.md` |
| Discovery Artifacts | `modules/{module}/discovery/` |
| Manual Test Suites & Traceability Matrix | `modules/{module}/test_design/` |
| Automation Suite *(per module, standalone)* | `modules/{module}/automation/tests_{Framework}/` |
| Repair Summary *(only if Stage 5H ran)* | `modules/{module}/healing/` |
| Manual Execution Results | `runs/{{RUN_FOLDER}}/manual_execution/` |
| Execution Results | `runs/{{RUN_FOLDER}}/execution/` |
| Final QA Report | `runs/{{RUN_FOLDER}}/reporting/Final_QA_Report.md` |
| Run Manifest | `runs/{{RUN_FOLDER}}/metadata/RunManifest.md` |
| Automation Package *(assembled, whole-project)* | `automation_baseline/{framework}/tests_{Framework}/` |

Each artifact is **one file, edited in place** — no `.vN` suffixes and no separate "approved" copy. Approval flips a `status:` field and is recorded in the Run Manifest; git supplies the version history (`pipeline.md` §7).

**Which module is active is a fact on disk, not something you remember:**

```bash
node platform_core/tools/module_manager/cli.js list            # every module, status, active marked *
node platform_core/tools/module_manager/cli.js active --json    # what is active, and the scope
node platform_core/tools/module_manager/cli.js use login        # activate one (sticky)
node platform_core/tools/module_manager/cli.js show login       # one module's full state
```

## Related Layers

- [`../platform_core/`](../platform_core/) — the shared runtime Tools (Browser Driver, MCP layer, Run Manager, Automation Lifecycle) that resolve this folder's paths at runtime. Reusable *Knowledge* is not there: [`knowledge_base/patterns/`](knowledge_base/patterns/), inside this folder, is the only layer a pattern may be promoted into.
- [`../docs/USER_GUIDE.md`](../docs/USER_GUIDE.md) — how to populate this folder's inputs and where each generated artifact lands ([§3](../docs/USER_GUIDE.md#3-prepare-your-inputs), [§7](../docs/USER_GUIDE.md#7-where-your-artifacts-live)).
- [`../.claude/`](../.claude/) — the Skills whose declared Inputs and Outputs resolve to paths in this folder.
- [`../workflows_and_pipelines/`](../workflows_and_pipelines/) — where every path convention, versioning rule, and Run Workspace layout realized here is actually defined. `pipeline.md` §10.3–§10.4 is the canonical specification of this folder's shape.
