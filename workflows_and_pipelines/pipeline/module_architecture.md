> **Position:** A specification of the **Module Workspace** — the second persistent artifact location alongside the Run Folder. It is governed by, and refines, [`pipeline.md`](pipeline.md) §7 (Artifact & Versioning Conventions) and §12 (Automation Asset Lifecycle). It does not add, remove, or reorder any pipeline stage.
> **Status:** **Applied.** The edit set in §12 has been carried out across the specifications, skills, templates, and tooling. No pipeline stage was executed as part of applying it — this is a specification-and-tooling change, and `platform_core_data/modules/` holds no project data yet.
> **Added 2026-07-29 (user-mandated).** Relocates the outputs of Stages 1, 2, 3, 4A, and 5H from the Run Folder into a per-module workspace, leaving the Run Folder as the home of **execution** artifacts only.
>
> **Two corrections were made while applying it**, both recorded here because they change what the tooling does rather than only where files go:
> 1. **`activeScope: full-project` is never derived** — only set by explicit intent (`cli.js use --all`). §6.2 originally implied a selection covering every module *is* full-project. That misses what the value does: §9.1 has Stage `5A` execute the **assembled baseline** for a full-project scope, so on a one-module project every single-module selection would have tried to run a baseline that greenfield does not yet exist. A project-spanning selection is now **reported** (`spansEveryModule`) so a human can opt in.
> 2. **Cleanup defaults to build output only** (§7.6's narrowing of §12.5), enforced by a `scope` parameter rather than by the caller remembering. A forgotten scope now keeps a runnable module project; the failure mode is a stale `target/` directory rather than a deleted test suite.

# 1. Concept Name

**Module Workspace** — `platform_core_data/modules/{module}/`

# 2. Purpose

## 2.1 The problem this solves

Before this revision every stage wrote into the Run Folder. That made a run the unit of everything: identity, scope, artifact location, and lifetime. It works for a single pass over a project, and it breaks in three ways the moment a project is worked on the way real projects are worked on — module by module, across many sessions:

1. **A module's design is scattered across the runs that touched it.** The Login module's Project Context is in `run-002`, its Discovery in `run-002`, its Test Design refined in `run-005`, and its automation extended in `run-009`. Answering "what do we know about Login?" means reading four run folders and knowing which supersedes which.
2. **Design artifacts are immutable, but a module's design is not.** `runs/` is immutable once written (`run_manager.md` §5.9), which is correct for *what happened during an execution* and wrong for *what a module is*. A module's understanding accumulates; forcing each refinement into a new run folder produced the lineage/supersedes machinery that exists purely to answer "which copy is current."
3. **Automation had no per-module home between generation and approval.** §12 gave it exactly two locations — a temporary run working copy and the whole-project baseline. A module's suite could not be developed, executed, healed, and approved as a coherent unit before joining the baseline.

## 2.2 The split

The fix is to separate the two kinds of artifact the pipeline produces, by the question each one answers:

| Question the artifact answers | Where it lives | Lifetime |
|---|---|---|
| **What is this module, and what should be tested in it?** | `platform_core_data/modules/{module}/` | **Durable, evolves in place.** Refined by later runs, never superseded by a copy |
| **What happened when we executed against it, on this date, at this code state?** | `platform_core_data/runs/{{RUN_FOLDER}}/` | **Per-run, immutable once written.** The historical record |

**The rule that decides the location, stated once:** if re-running the pipeline tomorrow would want to *start from* the artifact, it belongs to the module. If it is the *evidence of one execution*, it belongs to the run.

That is the same rule `platform_core_data/README.md` already applies to `knowledge_base/` vs. `runs/`, extended to cover the middle layer neither of them held: **per-module engineering output**, which is neither hand-authored project input nor a record of one execution.

# 3. Non-Responsibilities

This document defines *where artifacts live* and *how modules are tracked*. It explicitly does **not**:

- Add, remove, reorder, or rename any pipeline stage. The eight stages of `pipeline.md` §4 are unchanged.
- Change any stage's Input/Output *contract* — only the paths those contracts resolve to.
- Change any approval gate. Every gate in `pipeline.md` §5 fires exactly as before, at the same point, with the same reviewer question.
- Change the Knowledge Architecture (`pipeline.md` §10). `knowledge_base/` and `patterns/` are untouched; a Module Workspace is neither.
- Weaken run immutability. `runs/` stays immutable; this revision *narrows what lands there*, it does not make it mutable.
- Change the two-root contract (`pipeline.md` §13). The Target Project is still written only per §13.3, still only after baseline merge.

# 4. The Three Persistent Locations

`platform_core_data/` now holds **four** top-level concerns, not three. This supersedes the three-folder table in [`platform_core_data/README.md`](../../platform_core_data/README.md):

| Folder | Lifetime | Holds | Mutability |
|---|---|---|---|
| `knowledge_base/` | Durable, shared across every run and module | Human-authored inputs (PRD, run configuration, architecture), detected stack, browser/credential assets, accumulated cross-run knowledge, promoted `patterns/` | Edited in place by humans; `stack.md` by Stage 4A |
| **`modules/`** | **Durable, per module, evolves across runs** | **Per-module Context, Discovery, Test Design, Automation, and Healing output — one subfolder per module — plus `ApplicationContext.md`, the cross-module relationship map (§6.7)** | **Edited in place by the owning stage; every edit is git history** |
| `runs/` | Per run, **immutable once written** | Manual Execution results and Automation Execution results, plus each run's metadata, manifest, and evidence | Written once by the executing stage |
| `automation_baseline/` | Long-lived source code | The whole-project Automation Package under the §12 three-way-merge lifecycle | Written only by the Workspace Merge |

The flow between them is one-directional and always in the same order:

```
knowledge_base/PRD.md                    (human-authored input)
        │
        ▼  Stage 1
modules/{module}/context/                (per-module design — durable)
        │
        ▼  Stage 2 → Stage 3
modules/{module}/discovery/ · test_design/
        │
        ├─────────────────────────────────┐
        ▼  Stage 4M                       ▼  Stage 4A
runs/{{RUN_FOLDER}}/manual_execution/    modules/{module}/automation/
        (evidence — immutable)                   │  standalone project
                                                 ▼  Stage 5A
                                        runs/{{RUN_FOLDER}}/execution/
                                                 (evidence — immutable)
                                                 │
                                                 ▼  Stage 5H (optional)
                                        modules/{module}/healing/
                                                 │  + rerun → runs/{{RUN_FOLDER}}/execution/
                                                 ▼  on approval
                                        automation_baseline/    (greenfield)
                                        {{TARGET_ROOT}}/…       (brownfield, per §13.3)
```

# 5. Module Workspace Structure

## 5.1 Layout

```
platform_core_data/modules/
  modules.json                      # the module registry + active-module pointer (§6)
  README.md                         # what this folder is (points here, never duplicates)

  {module}/                         # one folder per module — slug, filesystem-safe (§5.2)
    README.md                       # THE MODULE SUMMARY (§5.3) — regenerated, never hand-authored
    module.json                     # this module's own state record (§6.3)

    context/                        # ── Stage 1 output ────────────────────────────────
      ProjectContext.md               # this module's context slice

    discovery/                      # ── Stage 2 output ────────────────────────────────
      DiscoverySnapshot.md
      QA_Assessment_Report.md
      Coverage_Summary.md
      Timeline.md
      findings/                       # FINDING-NNN.md + Findings_Summary.md
      evidence/                       # screenshots documenting in-scope screens

    test_design/                    # ── Stage 3 output ────────────────────────────────
      TestCases_{Module}.md
      TestCases_{Module}.xlsx         # generated from the .md, never hand-edited
      TraceabilityMatrix.md
      CoverageReport.md

    automation/                     # ── Stage 4A output — a STANDALONE PROJECT (§7) ───
      tests_{Framework}/              # runnable on its own: config, deps, tests
      AutomationPlan.md
      AutomationManifest.md
      AutomationSuiteManifest.md
      AutomationDecisionReport.md
      AutomationCoverageReport.md
      AutomationSummary.md
      StackDocumentationContext_{Framework}.md
      TargetWritePlan.md
      .module_automation_state.json   # standalone → approved lifecycle state (§7.4)

    healing/                        # ── Stage 5H output — created only if 5H ran (§8) ──
      RepairSummary.md
      RepairConfidenceReport.md
      BeforeAfterComparison.md
      QuarantineRegister.md
      kb_promotion_proposals.md

    features/                       # ── STANDALONE FEATURES (§5.5) ────────────────────
                                    #    OPTIONAL. Created only when an approved standalone
                                    #    Feature is scaffolded — never eagerly, never empty.
      {feature}/
        feature.json                  # this Feature's own state record, incl. its stages map
        context/                      # Stage 1, feature-scoped
        discovery/                    # Stage 2, feature-scoped
          findings/  evidence/
        test_design/                  # created on first write, like the module's
        automation/
        healing/
```

## 5.2 Module identity

A module's folder name is its **slug**: lowercase, hyphen-separated, sanitized filesystem-safe, capped at 60 characters — `flight-search`, `agency-management`, `us-245-cabin-class-filter`. The slug is immutable once created; the human-readable name lives in `module.json` and may be corrected freely without moving the folder.

Slug generation reuses `sanitizeSegment()` from `platform_core/tools/run_manager/runFolderName.js` rather than reimplementing sanitization — the same discipline `run_manager.md` §5.5 applies to run folder names. **No agent hand-formats a module slug.**

A module is never renamed on disk for the same reason a legacy run folder is never renamed (`run_manager.md` §5.6): other artifacts cite its path. A module that must be re-identified is superseded via `module.json`'s `supersededBy`, and both stay readable.

## 5.3 `README.md` — the module summary

Each module's `README.md` is the **single human entry point to that module** — the answer to "what do we know about Login, and where does it stand?" without opening five folders. It is:

- **Regenerated, never hand-authored.** Written by `platform_core/tools/module_manager/moduleSummary.js` from `module.json` plus the actual files present on disk. Hand-edits are overwritten without warning, which is why the file says so in its own header.
- **A summary and an index, never a source of truth.** Every figure in it is cited from the artifact that owns it. Where the summary and an artifact disagree, the artifact wins — the same rule the Active Run pointer follows (`run_manager.md` §5.7).

It contains, in order: module name and slug · current pipeline stage and status · one-paragraph scope statement (quoted from `context/ProjectContext.md`) · a stage-by-stage table (stage, status, artifact link, last-updated, the run that last touched it) · test-case and requirement-coverage counts (from `test_design/CoverageReport.md`) · automation status and its standalone/approved lifecycle state (§7.4) · open findings count · healing history · links to every run that has executed this module.

## 5.4 What a Module Workspace must never contain

- **A copy of anything in `knowledge_base/`.** The PRD is read by Stage 1 and cited, never copied into a module.
- **Execution results of any kind.** Manual and automation execution evidence lives in the run that produced it (§9). A module's `README.md` *links* to those runs; it never restates their results.
- **Application-agnostic engineering knowledge.** A repair pattern that would hold against a different application is promoted into `knowledge_base/patterns/` through the §10.5 gate, never left to accumulate in a module.
- **A second copy of the automation baseline.** `automation/` holds this module's suite while it is being developed and approved; `automation_baseline/` holds the assembled whole-project suite (§7.5).

## 5.5 Standalone Features within a module

*(Added 2026-08-17, user-mandated. Routing rule: [`new_us_intake.md`](new_us_intake.md).)*

A **standalone Feature** is one capability, supplied as its own User Story, that belongs to a module's
business area **without being part of that entity's CRUD package**. It lives at
`modules/{module}/features/{feature}/` and tracks its own stages.

### 5.5.1 What is a Feature, and what is not

| Supplied as | Result |
|---|---|
| An **independent Feature / User Story** | A dedicated Feature folder. |
| Part of an entity's **CRUD package** — Add/Create, Update, Search, Approve, Reject | **Stays in the consolidated module.** No Feature folder, however feature-shaped the capability sounds. |

**The test is how it was supplied, not whether it could be called a feature** — almost any capability
could. **The classification is a human decision made at intake and is never inferred**; an ambiguous
case is asked about, not guessed (`new_us_intake.md` §4.1).

A Feature is always a **child** of a module, never a peer, because modules partition the *application*
and a Feature is a capability *within* one of those partitions. This is the same reason §6.4 forbids
proposing a module to hold a work item.

### 5.5.2 Independent stages

**A Feature's `stages` map is its own, and nothing rolls up in either direction.**

| Level | Its `stages` map means |
|---|---|
| Module | the **consolidated CRUD scope** |
| Feature | **that Feature only** |

A Feature reaching `test_design: Approved` says nothing about the module's CRUD suite, and a module
reaching it says nothing about any Feature. Rolling either into the other would claim coverage nobody
produced — which is exactly the failure that makes a status field worth keeping.

The module's `README.md` renders both: a *Pipeline Status — consolidated module (CRUD) scope* table
and, when Features exist, a separate **Features** table with each Feature's own stage columns (§5.3).

```bash
node platform_core/tools/module_manager/cli.js stage <module> <stage> --status Approved
node platform_core/tools/module_manager/cli.js feature stage <module> <feature> <stage> --status Approved
```

### 5.5.3 Rules

1. **`features/` is created only when an approved standalone Feature is scaffolded.** A CRUD-only
   module never grows an empty one — an empty `features/` folder reads as "this module has Features",
   the same way a scaffolded module folder reads as "this module exists" (§6.4 #4).
2. **A Proposed Feature is registered, never scaffolded.** Same gate discipline as a module.
3. **A Feature never brings its parent module into existence.** Registering one under a nonexistent
   module is refused; creating the module is a separate, human-approved step.
4. **Feature artifacts stay inside the Feature boundary; module CRUD artifacts stay inside the parent
   module.** Neither writes into the other.
5. **A Feature is never renamed**, for the reason §5.2 gives for modules. It is superseded instead.
6. **Existing modules are not migrated.** A module created before this section is valid exactly as it
   is; nothing is moved or normalized to match the new shape.

### 5.5.4 Registry representation — additive, no migration

`features[]` is an **optional** key on a module's entry, and `schemaVersion` stays **1**.

An absent `features` key means *"this module has no registered standalone Features"* — which is
precisely what every registry written before this section means. So **nothing migrates**, and every
existing reader keeps working by never looking at a key that is not there. Bumping the version would
instead make every pre-existing registry unreadable until each reader was updated in lockstep, buying
nothing.

### 5.5.5 The active Feature pointer

`modules.json` carries a nullable **`activeFeature`** alongside `activeModules[]`:

| State | Meaning | A stage resolves |
|---|---|---|
| `activeFeature: null` | consolidated module / CRUD scope | `{{MODULE_SLUG}}` only |
| `activeFeature` set | that standalone Feature | **both** `{{MODULE_SLUG}}` and `{{FEATURE_SLUG}}` |

- A non-null `activeFeature` is valid **only** when the Feature belongs to the single active module.
- **`cli.js use <module>` clears it** — selecting module/CRUD scope is an explicit scope choice, and
  switching modules therefore clears an incompatible Feature as a matter of course. The clear is
  reported, never silent.
- **`cli.js use-feature <module> <feature>`** sets the pair together. The pair is the unit: a Feature
  slug without its module cannot be resolved to a path.
- **An invalid or stale pointer fails loudly and asks for correction. It NEVER degrades to module
  scope.** `resolveActiveFeature()` throws; a plain `active` read still *shows* the broken pointer, so
  it can be looked at in order to be fixed.

The no-silent-fallback rule is the load-bearing one. Falling back would send a Feature's artifacts
into its parent's folders — indistinguishable, afterwards, from work that was always module-scoped.

# 6. The Module Registry — `modules/modules.json`

Directly modeled on the Active Run pointer (`run_manager.md` §5.7), for the same reason and with the same discipline: **which module the pipeline is working on must be an explicit, inspectable fact on disk, not something inferred from conversational context.**

## 6.1 Two responsibilities, one file

`modules.json` is both the **registry** (every module that exists, and its state) and the **active-module pointer** (which one the pipeline is working on). They are one file because they are read together on every stage invocation, and splitting them would create two files that must agree.

## 6.2 Schema

| JSON key | Description |
|---|---|
| `schemaVersion` | Currently `1`. A reader encountering a **higher** version fails loudly rather than misreading an older shape |
| `derivedFrom` | Provenance of the module list: the PRD path and its sha256 at the time Stage 1 proposed the decomposition (§6.4) |
| `approvedAt` / `approvedBy` | When and by whom the module decomposition cleared the Stage 1 gate. Never auto-filled |
| `activeModules[]` | The module slug(s) the pipeline is currently working on — **an array, because a run may legitimately scope to several modules or to all of them** |
| `activeScope` | `single` · `multi` · `full-project` — what the current activation *means*, so a stage can tell "just Login" from "all five, of which Login happens to be first". **`full-project` is never derived from the selection's extent — only set by explicit intent** (`cli.js use --all`), because §9.1 has Stage `5A` execute the assembled baseline for it. `single` and `multi` follow from the count |
| `spansEveryModule` | True when the active selection happens to cover every approved module. **Reported, never acted on:** it lets the CLI say "that is every module — did you mean `--all`?" without deciding for the human that it did |
| `activeFeature` | **Nullable.** The standalone Feature under `activeModules[0]` that the pipeline is working on, or `null` for consolidated module/CRUD scope (§5.5.5). Cleared whenever module scope is selected |
| `previousActiveFeature` | The prior Feature pointer, so a cleared one can be seen and restored |
| `switchedAt` / `setBy` / `note` | Provenance of the last activation change |
| `previousActiveModules` | The prior activation, so a mis-switch is one command to undo |
| `modules[]` | The registry proper — one entry per module (§6.3) |

## 6.3 Per-module entry, and `module.json`

Each registry entry carries `slug`, `name`, `description`, `status`, `createdAt`, `supersededBy`, a `stages` map, and — **optionally** — a `features[]` array (§5.5.4). An entry with no `features` key has no standalone Features, which is what every pre-2026-08-17 entry means; `schemaVersion` is unchanged at 1. **The same content is written into the module's own `module.json`**, and the rule for the duplication is the one the Active Run pointer already establishes: **`module.json` is authoritative; `modules.json`'s copy is a display cache**, refreshed whenever a stage records progress. Where they disagree, `module.json` wins. The registry exists so that listing every module's state is one file read instead of N.

The `stages` map holds one entry per stage that writes to this module — `context`, `discovery`, `test_design`, `automation`, `healing` — each recording:

| Field | Meaning |
|---|---|
| `status` | `Not Started` · `Draft` · `Pending Review` · `Pending Automation Approval` · `Approved` · `Rejected` — the **same vocabulary** as the Run Manifest (`pipeline.md` §7), never a parallel one |
| `artifactPath` | Repo-relative path to the stage's primary artifact |
| `lastRun` | The run folder that last wrote this stage, so a module's design traces back to the execution context that produced it |
| `lastUpdated` | ISO timestamp |
| `revisionCount` | How many times the artifact has been edited in place — the in-place-edit equivalent of a version number (`pipeline.md` §7) |
| `targetRefAtWrite` | The Target Project's path-scoped commit when this stage last wrote (`run_manager.md` §5.8), so **drift is computable per module, not just per run** (§10.3) |

## 6.4 Who decides the module list

**Stage 1 proposes; the human approves; the registry records.** This is the answer to "where do modules come from," and it is deliberately not left to any other stage.

1. Stage 1 reads `knowledge_base/PRD.md` and `knowledge_base/run_configuration.md` — the same two inputs it reads today, unchanged — and **proposes a module decomposition**: a list of modules, each with a name, a one-line scope statement, and the PRD sections it derives from.
2. The proposal is presented at Stage 1's existing **Human Review Required** gate (`pipeline.md` §5.1). No new gate is introduced; the decomposition is reviewed as part of the Project Context the reviewer already reviews.
3. On approval, the Module Manager writes `modules.json` with one entry per approved module and scaffolds each module folder.
4. **A later run whose PRD has changed re-proposes.** New PRD areas surface as *proposed* modules — recorded in `modules.json` with `status: Proposed` and never scaffolded — until a human approves them at the same gate. A module is never created silently.
5. **Only Stage 1 may propose a module.** No other stage creates one. A Stage 2 or Stage 3 discovery that a module should be split reports it as a gap for the next Stage 1 pass — it does not act.

This preserves `pipeline.md` §6 Rule 4 exactly: the PRD is read by Stage 1 and no one else, and the module decomposition — being derived from the PRD — is therefore Stage 1's output and nobody else's.

## 6.7 `ApplicationContext.md` — the module layer's own context

*(Added 2026-08-18, user-mandated.)*

`modules/ApplicationContext.md` sits beside `modules.json` and holds **what no single module can hold**:
the dependency graph between modules, the cross-module business rules index, the end-to-end journeys,
the fixture build order, and the application-wide environment and safety posture.

**It is not the "project-wide Project Context" that `project-context-skill` §5 rejected, and the
distinction is the whole reason it is allowed to exist.** That objection was to a document which
*summarises* the per-module contexts — it would disagree with them at the first edit, and nothing would
say which is authoritative. This file summarises nothing. It is governed by one rule:

> **If a statement belongs to one module, it belongs in that module's context.**
> This file may only state what is true of **two or more modules at once**.

The test for a violation is mechanical: *if a paragraph could move into a single module's context
without losing meaning, it was never application-level.*

### 6.7.1 Lifecycle — refreshed at run start, final only after the last stage

Unlike a module's Project Context, this file is **not** approved once and then edited freely. It carries
a status that moves with the run:

| Moment | Status | Who acts |
|---|---|---|
| A run is created | `Draft — refreshed for {run}` | **Stage 1** re-reads the module registry and refreshes §1 (module map), §2 (dependency graph) and §6 (posture) against reality, then records what it changed |
| Through Stages 2 … 5 | `Draft` | Any stage that **proves** a cross-module dependency, adds a cross-module rule, or changes an E2E journey's coverage appends to it. A stage never marks it final |
| After the branch's **terminal stage** — `6A` Reporting (Automation) or `4M` Manual Execution (Manual) | `Pending Review` | The terminal stage presents the diff of what this run changed |
| A human approves | `Approved — {run}` | Only then is it final for that cycle. The next run reopens it as `Draft` |

**Why the approval sits at the end and not at Stage 1.** What a run learns about the relationships
*between* modules is mostly discovered while it executes — run-004's Branch → Agency supplier cascade
was proven at Stage 2 and again after a live Branch change, not written at Stage 1. Approving this file
before the run has run would approve last week's understanding.

**A stage never silently marks it `Approved`.** The status is a human's, exactly like every other gate
in `pipeline.md` §5.

### 6.7.2 Rules

1. **Never copy a module's scope, acceptance criteria, findings, or dispositions into it.** Link by path.
2. **Never restate a cross-module rule's full text** — cite its ID from `knowledge/INDEX.md` and record
   only which modules it binds.
3. **Never record a metric, count, or percentage.** A derived number drifts the moment its source moves.
4. **A module's own revision does not oblige an edit here.** Only a change in the *relationship* between
   modules reaches this file. That asymmetry is what stops it growing into a second copy of everything.
5. **Status lives in the document's own header, and nowhere else.** No sidecar JSON and no registry field
   were added for it, deliberately: a second home for the status is a second thing to keep in sync, and
   nothing yet reads it programmatically. When a tool needs it, that tool brings its own record.
6. **It is committed, like the registry beside it** — the relationship map is shared state a teammate or
   a later session needs.

## 6.5 Rules

1. **A stage never invents a module.** It resolves the active module(s) from `modules.json`. When `activeModules` is empty, the stage **asks** — it does not guess and does not create one as a fallback. This is `run_manager.md` §5.7 Rule 1, applied to modules.
2. **A pointer naming a module folder that no longer exists is an error, not a prompt to fall back.**
3. **Only the Module Manager writes `modules.json`.** Stages read it, and record their own progress through the Module Manager's `recordStage()` — they never hand-edit the registry.
4. **Activating a module and creating it are distinct steps.** Activation refuses a nonexistent module.
5. **The registry is committed, not ignored** — which modules exist and where each stands is shared state a teammate or a later session needs, and its git history is a usable audit trail.
6. **Every rule above applies to Features too.** A stage never invents one, only the Module Manager writes them, registering and scaffolding are distinct steps, and an unresolvable Feature pointer is an error rather than a prompt to fall back to module scope (§5.5).

## 6.6 Tooling

A new `platform_core/tools/module_manager/`, mirroring `run_manager/`'s structure and conventions exactly — plan/apply split, explicit `now` parameters, no internal defaulting, a behavioral test suite under `__tests__/`:

| File | Responsibility |
|---|---|
| `moduleSlug.js` | `generateModuleSlug()`, `isValidModuleSlug()`, `assertValidModuleSlug()`, `resolveModuleSlug()`, `uniqueModuleSlug()` — reuses `sanitizeSegment()` from `run_manager/` |
| `moduleRegistry.js` | `readRegistry()`, `writeRegistry()`, `registerModule()`, `recordStage()`, `proposeModules()`, `approveModules()`, `supersedeModule()`, `resolveModule()`, `listModules()` |
| `activeModule.js` | `resolveActiveModules()` — **the accessor a stage calls**; `setActiveModules()` / `setActiveModulesToAll()` — the only writers of the pointer; `readActiveModules()`, `isActiveModuleStale()`, `clearActiveModules()`, `deriveActiveScope()`, `coversEveryModule()` |
| `moduleScaffold.js` | `planScaffold()` / `scaffoldModule()` — the folder skeleton, plan/apply split; `ensureStageFolder()`, `moduleArtifactPath()` |
| `automationState.js` | `readAutomationState()` / `recordAutomationState()` — the module project's `Generated → Executed → Healed → Approved` lifecycle (§7.4) |
| `moduleDrift.js` | Per-module drift and staleness (§10.3–§10.4) |
| `moduleSummary.js` | `renderModuleSummary()` / `writeModuleSummary()` — regenerates a module's `README.md` (§5.3) |
| `cli.js` | The CLI surface below |

```bash
# selecting and inspecting
node platform_core/tools/module_manager/cli.js list [--json]             # every module, status, active marked *
node platform_core/tools/module_manager/cli.js use <slug>[,<slug>…]      # activate one or several (sticky)
node platform_core/tools/module_manager/cli.js use --all                 # every approved module — full-project
node platform_core/tools/module_manager/cli.js active [--json]           # what is active, and the scope
node platform_core/tools/module_manager/cli.js show <slug> [--json]      # one module's full state
node platform_core/tools/module_manager/cli.js summary <slug>            # regenerate its README.md
node platform_core/tools/module_manager/cli.js drift [<slug>] [--json]   # per-module drift (§10.3)
node platform_core/tools/module_manager/cli.js clear                     # clear the selection

# Stage 1's decomposition — three steps, because they are three decisions (§6.4)
node platform_core/tools/module_manager/cli.js propose --name "Flight Search" [--prd <path>]
node platform_core/tools/module_manager/cli.js approve [<slug>…] --by "<reviewer>"
node platform_core/tools/module_manager/cli.js scaffold <slug> [--dry-run]

# recording progress — called by the stages
node platform_core/tools/module_manager/cli.js stage <slug> <stage> --status <…> [--artifact P] [--run R]
node platform_core/tools/module_manager/cli.js automation <slug> --state <…> [--by R] [--baseline-ref <sha>]
```

`--modules-dir` overrides where `modules/` is looked for on every verb; it defaults to the conventional location. **There is no `create` verb** — `propose` records an intent, `approve` records a human decision, and `scaffold` acts on it. Collapsing them would let a module exist on disk that nobody approved.

# 7. Automation as a Standalone Module Project

## 7.1 What changes

`pipeline.md` §12.1 defined two locations for automation code: the run working copy and the whole-project baseline. This revision **inserts a third, between them** — and it is where Stage 4A now actually generates:

| Location | Path | Role |
|---|---|---|
| **Module Automation Project** | `modules/{module}/automation/tests_{Framework}/` | **NEW.** Where Stage 4A generates, Stage 5A executes from, and Stage 5H heals. A **standalone, independently runnable project** — its own config and dependency manifest — until approved. **Since 2026-08-17 this is a pre-promotion home only**: it is permanently deleted once the module is promoted (`pipeline.md` §12.5.1) |
| **Workspace Automation Baseline** | `automation_baseline/{framework}/tests_{Framework}/` | Unchanged in role: the authoritative, persistent, whole-project suite. Now assembled *from approved module projects* (§7.5) rather than merged from a run working copy. **After a module is promoted it is that module's single source of truth** — generated, executed and healed in place, scoped by `.baseline_ownership.json` (`pipeline.md` §12.9) |
| **Target Project** | `{{TARGET_ROOT}}/<automationRoot>/` | Unchanged: the projection of an approved baseline, per §13.3 |

The **Run Automation Working Copy** (`runs/{{RUN_FOLDER}}/automation/`) is **removed**. Its entire purpose was to give generation a scratch location that was not the baseline; the Module Automation Project serves that purpose better, because it persists, is scoped to one module, and can be executed and healed as a unit.

## 7.2 Why standalone

"Standalone" is a hard requirement, not a description: **a module's automation project must be runnable on its own, with its own config and dependency manifest, before it is approved.** Because:

- **Stage 5A must be able to execute one module without the rest of the project existing.** In a greenfield build the other modules' suites may not be written yet.
- **Stage 5H must be able to heal and re-run one module in isolation**, so a repair's effect is observable without whole-suite noise.
- **A reviewer must be able to run it themselves** before approving. An approval gate on code nobody can execute is a formality.

The project is generated against the framework bound by `knowledge_base/automation_framework.md` — Stage 4A complies with it and never re-selects, exactly as today.

## 7.3 Shared code across module projects

Standalone must not mean duplicated. Genuinely shared assets — base page objects, auth fixtures, common utilities, test data factories — are generated once into:

```
platform_core_data/automation_baseline/{framework}/shared/
```

and referenced by each module project through a relative path recorded in that project's config. **This is the one direction in which a module project reads outside itself**, and it is deliberate: duplicating an auth fixture five ways guarantees five drifts.

A module project that needs a change to a shared asset **does not edit it directly.** It proposes the change in its `AutomationDecisionReport.md`, and the change is applied to `shared/` at approval time (§7.5) — a shared asset is whole-project surface, so it clears the whole-project gate, not one module's.

## 7.4 The module automation lifecycle

`.module_automation_state.json` tracks a module project through exactly four states:

| State | Meaning | Set by |
|---|---|---|
| `Generated` | Stage 4A wrote it; not yet executed | Stage 4A |
| `Executed` | Stage 5A ran it; results are in a run folder, referenced here | Stage 5A |
| `Healed` | Stage 5H applied approved repairs and re-ran the affected tests | Stage 5H |
| `Approved` | Cleared the §5.2 Automation Approval gate; eligible for assembly into the baseline | The gate, recorded by the Module Manager |

The file also carries `sourceRuns[]` (every run that executed this project), `baselineRef` (the `shared/` commit it was generated against, path-scoped per §12.3's rule), and `assembledAt` (when it last joined the baseline, `null` if never).

**Approval is per module, and it is the existing §5.2 gate** — not a new one. The reviewer approves *this module's* suite; approving Login's automation says nothing about Booking's.

## 7.5 Assembly into the baseline

When a module project reaches `Approved`, its content is assembled into the whole-project automation. **This replaces §12.4's Workspace Merge as the trigger, and reuses its entire mechanism** — the hard pre-check, the three-way conflict classification, the lock guard, the untracked-file classification, and the Merge Summary are all unchanged. Only the *source* of the merge changes: an approved Module Automation Project rather than a run working copy.

The two project types differ in destination, and only in destination:

**Greenfield** — the baseline is the deliverable:

```
modules/login/automation/tests_PW/     ─┐
modules/booking/automation/tests_PW/    ├─▶  automation_baseline/playwright/tests_PW/
modules/agency/automation/tests_PW/    ─┘         (one project, all approved modules)
                                                          │
                                                          ▼  §13.3, after the gate
                                                  {{TARGET_ROOT}}/tests/
```

**Brownfield** — the existing suite is the deliverable, and its structure governs:

```
modules/login/automation/tests_PW/  ──▶  automation_baseline/  ──▶  merged into the team's
   (generated to match the                  (lifecycle-managed,        existing structure at
    detected layout — §13.2)                 reproducible source)      {{TARGET_ROOT}}, per §13.3
```

In brownfield the module project is generated to match the **detected** layout, naming, and page-object pattern from the start (`pipeline.md` §13.2 #3) — so assembly is a merge into an existing structure, never an imposition of the platform's own. The baseline still sits in between, unchanged from §13.7's ordering rule: **generate → approve → merge to baseline → then project into the Target Project.** The baseline is always the reproducible source.

## 7.6 What §12 sections survive

| §12 section | Status under this revision |
|---|---|
| §12.1 Two locations | **Superseded** by §7.1's three locations |
| §12.2 The four steps | **Amended**: Step 1 (Working Copy Creation) is replaced by generation into the Module Automation Project; Steps 2–4 are unchanged in mechanism |
| §12.3 Working Copy Creation | **Superseded.** Its `.lifecycle_snapshot.json` role is served by `.module_automation_state.json`'s `baselineRef` |
| §12.4 Workspace Merge | **Unchanged in full.** Triggered by module approval instead of run approval |
| §12.5 Cleanup | **Narrowed.** A module project is *not* deleted after assembly by cleanup — cleanup applies only to build/IDE output already classified as Discarded Untracked. **Superseded in part on 2026-08-17**: the project is no longer durable, and a separate Retirement step deletes it once the baseline copy is verified and live-proven (`pipeline.md` §12.5.1) |
| §12.6 `automation_promotion.md` | **Unchanged**, written to `modules/{module}/automation/` instead of a run folder. Bootstrap Migration is unchanged |
| §12.7 Registry cross-reference | **Extended**: `AutomationPackages.md` gains a per-module column |

# 8. Self-Healing Under the Module Workspace

Stage 5H is **unchanged in every behavioral respect** — still optional, still opt-in only, still never triggered by a failing execution, still governed by the §5.6 Batch Repair Approval gate, still forbidden from healing an Application Failure. Only its output location changes.

## 8.1 Where healing output goes

Repair *reasoning and record* — `RepairSummary.md`, `RepairConfidenceReport.md`, `BeforeAfterComparison.md`, `QuarantineRegister.md`, and any KB promotion proposals — is written to `modules/{module}/healing/`, because it describes **that module's suite**, which is durable, not that execution, which is history.

Repair *code changes* are applied directly to `modules/{module}/automation/tests_{Framework}/`, in place — or, once the module is **Promoted**, to its owned paths inside the Workspace Automation Baseline, which is then the suite being healed (`pipeline.md` §12.9). Stage 5H resolves which of the two through `automation_lifecycle/automationRoot.js` and never recreates a retired working copy. There is no separate healed copy either way: the resolved root **is** the suite being healed, and git is the before/after record — the same in-place discipline `pipeline.md` §7 applies to every other artifact. `BeforeAfterComparison.md` documents the change in reviewable prose; it is not the mechanism by which the change is recoverable.

## 8.2 Where the rerun's results go

**Into the triggering run's `execution/` folder**, as a clearly-marked additional cycle:

```
runs/{{RUN_FOLDER}}/execution/
  ExecutionResults.md              # cycle 1 — the failures that prompted healing
  ExecutionResults.rerun-1.md      # cycle 2 — post-repair, scoped to the affected tests
  artifacts/ · artifacts_rerun-1/  # evidence per cycle
```

The rerun is an execution, so it obeys the execution rule (§9): its results are evidence of what happened at a moment in time, and they belong with the execution they are a cycle of. Keeping both cycles in one run folder is what makes "these 12 tests failed, then 10 passed after repair and 2 were quarantined" readable as one story.

This is the **one place a Stage 5H write lands outside the module** — and it is an append of a new file to the run, never an edit of `ExecutionResults.md`. Run immutability is preserved: the original results file is never touched.

## 8.3 Healing several modules at once

An invocation scoped to several modules (`/self-healing-skill Login, Agency`) produces **one healing folder per module**, each holding only that module's repairs. There is no combined cross-module repair document, because a repair is always to one module's suite and a combined document would have to be split again to be actionable. The triggering run's `execution/` folder holds the rerun results for all of them, since they were one rerun.

## 8.4 After approval

An approved repair updates the module's `.module_automation_state.json` to `Healed`, then follows §7.5's assembly path unchanged — **the repaired suite re-enters the normal §5.2 gate before it merges to the baseline or projects into the Target Project**, exactly as `pipeline.md` §4 Stage 5H already requires. Healing does not shortcut assembly, and an approved repair is not an approved merge.

# 9. What Stays in the Run Folder

The Run Folder becomes the home of **execution and run bookkeeping only**:

```
platform_core_data/runs/{{RUN_FOLDER}}/
  metadata/                        # run.json, lineage.json, RunManifest.md, run_summary.md
  manual_execution/                # Stage 4M — results, CSV, QA report, evidence
    ManualExecutionResults.md · ManualTestResults.csv · ManualQAReport.md · artifacts/
  execution/                       # Stage 5A — results and evidence, plus any 5H rerun cycle
    ExecutionResults.md · ExecutionResults.rerun-N.md · artifacts/ · artifacts_rerun-N/
  reporting/                       # Stage 6A — the Final QA Report
    Final_QA_Report.md
```

`context/`, `discovery/`, `test_design/`, `automation/`, and `self_healing/` are **no longer created in a run folder.** A run references the module artifacts it consumed, by path, and records them in its Run Manifest.

**Everything `pipeline.md` §7 says about run artifacts still applies to what remains**: one file per artifact, edited in place *within its run*, approval flips a `status:` field, the Run Manifest tracks the sequence, and a run folder is immutable once written.

## 9.1 Run scope, and how a run addresses modules

A run's scope selects **which modules it executes against** — this is the existing Run Scope concept (`run_scope.md`), now given a concrete referent it previously lacked:

| Run scope | `activeModules` | What executes |
|---|---|---|
| One module | `["login"]`, `activeScope: single` | That module's suite only |
| Several modules | `["login","booking"]`, `activeScope: multi` | Each named module's suite |
| Full project | every approved slug, `activeScope: full-project` | The assembled baseline, as one system |

**Full-project execution runs the assembled baseline, not the module projects individually** — that is the point of assembly, and it is how cross-module interaction is exercised at all. A module-scoped execution runs the module project directly (§7.2).

`run.json` gains three fields recording this, so a run's module scope is a fact on disk and not an inference from its folder name:

| Field | Description |
|---|---|
| `modules[]` | The module slugs this run executed against |
| `moduleScope` | `single` · `multi` · `full-project` |
| `moduleArtifactRefs[]` | Per module: which artifact paths it consumed, and each one's `status:` at consumption time |

`moduleArtifactRefs` is what makes a run reproducible after the module has moved on. A module's design evolves in place; a run's record of *which state of it was consumed* must not. This is the module-layer analogue of `targetRef` (`run_manager.md` §5.8), and it exists for the identical reason.

## 9.2 Run lineage is narrowed, not removed

`run_manager.md` §5.9's refinement mechanism (`inheritsFrom`/`supersedes`/`lineage.json`) stays, but its job shrinks. It previously carried design artifacts forward between runs; **the Module Workspace now does that natively**, because a module's design is durable and the next run simply reads its current state.

Lineage remains for what it was always actually for: **relating one execution to another** — a re-run of the same scope after a fix, a regression pass superseding an earlier one's conclusions. `inheritedArtifacts[]` now lists execution artifacts; design artifacts are resolved from the module registry, not inherited.

`{{PRIOR_RUN_FOLDER}}` and `resolvePriorRunFolder()` are unchanged and still resolve.

# 10. Knowledge Sharing and Cross-Stage Integration

This section states the guarantees that make the split safe. Each is the answer to a specific way a two-location layout can lose information.

## 10.1 Every artifact declares where it came from

Every artifact written under `modules/` carries the standard header (`pipeline.md` §7) plus three module-scoped fields:

```yaml
module: login                       # the owning module slug
status: Approved                    # Draft | Pending Review | Approved | Rejected
producedByRun: run-007__2026-07-29_… # the run whose invocation produced this revision
revisionCount: 3                    # in-place edits since creation
targetRefAtWrite: a1b2c3d           # the Target Project commit this revision describes
upstream:                           # the exact artifacts this one consumed
  - platform_core_data/knowledge_base/PRD.md@sha256:…
  - platform_core_data/modules/login/context/ProjectContext.md@rev:2
```

`upstream` is the load-bearing field. It makes the chain from PRD to test case to script **mechanically traceable** rather than reconstructable by convention, and it is what lets a stage detect that its input has been revised since it last ran (§10.4).

## 10.2 A stage reads the current module state, and says so

A downstream stage resolves its input from the module registry — `modules/{module}/{stage}/` at its current revision — and records in its own `upstream` the revision it consumed. It never copies an upstream artifact into its own folder, for the same reason `pipeline.md` §7 forbids copying across runs: the copy immediately begins to diverge from the original, and nothing then says which is current.

## 10.3 Drift is computed per module

`run_manager.md` §5.8's drift machinery is extended to modules. Each module records `targetRefAtWrite` per stage (§6.3), so `computeDrift()` answers **"has the code under this module changed since we designed it?"** — a strictly more useful question than the run-level equivalent, because a run may span modules that have drifted very differently.

The five drift statuses are unchanged, and so is the rule that makes them worth having: **every "unknown" is its own answer**, never collapsed into "unchanged." A module whose discovery predates a `moved` status has conclusions that are *unverified against current code*, and the consuming stage says so rather than presenting them as current.

## 10.4 Staleness is surfaced, never silently tolerated

Because every artifact records the revision of every input it consumed, a stage can compare what it consumed against what is there now. When an upstream artifact has been revised since a downstream artifact was produced, the downstream artifact is **flagged stale** in the module's `README.md` and in `modules.json`.

**Stale is a report, never an automatic re-run.** Re-running a stage is a human decision at that stage's own gate — a Test Design suite is not silently regenerated because Discovery was refined. The pipeline's job is to make the staleness impossible to miss, not to resolve it unasked.

## 10.5 Approval status travels with the artifact

`pipeline.md` §7's "approval changes status, never location" is unchanged and now spans two locations. A module artifact's `status:` field is authoritative; `module.json` caches it; `modules.json` caches that. Both caches are refreshed on every `recordStage()`, and **where they disagree, the artifact's own header wins** — the same precedence the Active Run pointer already declares.

A downstream stage that requires an approved input (Stage 4M and Stage 4A both require an approved Stage 3 suite) reads the artifact's own header, never a cache.

## 10.6 The knowledge layers are unchanged

`pipeline.md` §10's two-layer Knowledge Architecture is untouched. A Module Workspace is **neither layer**: it is per-module *engineering output*, not project knowledge and not promoted platform knowledge.

Resolution order for a stage is now three deep, and the precedence is unchanged from §10.2 — Platform Knowledge first, then Project Knowledge:

```
1. platform_core/knowledge/patterns/  Platform Knowledge — application-agnostic, promotion-only
2. knowledge_base/             Project Knowledge  — this application, all modules
3. modules/{module}/           Module output      — this module specifically
```

The promotion gate (§10.5) is unchanged: a pattern learned while working one module is promoted into `patterns/` by explicit human approval, never written there directly and never left to accumulate in the module as though it were general.

The two shared execution knowledge bases (§10.8 — Selector Verification and Repair) stay **shared, not per-module**. A selector confirmed while automating Login is exactly as valid when automating Booking, and per-module copies would defeat their purpose.

# 11. Migration

There are currently **no run folders on disk** (`platform_core_data/runs/` is empty), and `modules/` and `automation_baseline/` are both empty. This revision therefore has **no data to migrate** — it is a specification-and-tooling change applied before any project data exists under the new layout.

The compatibility rules are stated anyway, because they will matter the first time this platform is upgraded in a repository that *does* hold runs:

1. **A pre-existing run folder is never rewritten.** A run holding `context/`, `discovery/`, or `test_design/` keeps them, exactly as-is. This is `run_manager.md` §5.6's rule, unchanged: backward compatibility outranks layout consistency.
2. **Adoption is a forward-only choice.** The first Stage 1 invocation after upgrade proposes a decomposition (§6.4) and, once approved, writes the module workspace. Earlier runs stay readable under the old layout.
3. **Lifting an earlier run's design into a module is explicit, human-invoked, and recorded** — never an automatic side effect of the upgrade. It copies the artifact once, into the module, and records the source run in `upstream` (§10.1).
4. **A path resolver spans both layouts.** `resolveStageArtifact(stage, module)` checks the module workspace first, then falls back to the run folder for pre-migration runs, mirroring `resolveRunFolder()`'s dual-name handling.

# 12. Documents This Revision Changes

Every row below is **applied**. The table was written as a reviewable edit set before any of it existed, and is retained as the record of what the revision touched.

| Document | Change |
|---|---|
| `pipeline.md` §4 | Stage 1/2/3/4A/5H artifact paths repoint to `modules/{module}/…`. Stage 1 gains the module-decomposition proposal. Stage 4M/5A/6A paths unchanged |
| `pipeline.md` §7 | Amended: two artifact locations, with §4's rule deciding between them. Run-artifact rules unchanged for what remains in a run |
| `pipeline.md` §12 | Amended per §7.6's table above |
| `pipeline.md` §3, §8 | The branch diagram and traceability chain gain the module layer |
| `run_manager.md` §5.9, §6, §7 | Lineage narrowed to execution artifacts (§9.2); Workspace Structure drops the five relocated folders; `run.json` gains `modules[]`, `moduleScope`, `moduleArtifactRefs[]` |
| `run_scope.md` §3, §7 | Run Scope gains its concrete referent: which modules a run executes against (§9.1) |
| **`module_architecture.md`** | **This document — new** |
| `platform_core_data/README.md` | The three-folder table becomes four (§4); the Folder Structure diagram gains `modules/` |
| `.claude/skills/project-context-skill/` | Writes per-module context; proposes the decomposition at its existing gate |
| `.claude/skills/explorer-skill/` · `test-design-skill/` | Write per module; resolve inputs from the module workspace |
| `.claude/skills/automation-skill/` | Generates a standalone module project (§7.2); §32.3's Target Decision Gate gains the module-project source |
| `.claude/skills/automation-execution-skill/` | Executes a module project or the assembled baseline (§9.1); results still to the run folder |
| `.claude/skills/self-healing-skill/` | Output to `modules/{module}/healing/`; rerun results to the triggering run (§8) |
| `.claude/skills/manual-execution-skill/` · `reporting-skill/` | Input paths only — outputs unchanged |
| `platform_core/tools/module_manager/` | **New** (§6.6) |
| `platform_core/tools/automation_lifecycle/` | Merge source becomes an approved module project (§7.5); merge mechanism unchanged. `copyBaselineIntoModule()` is the sanctioned Step-1 entry point; `cleanupPackage()` gains a `scope`, defaulting to build output only; the assembly commit message records the source module |
| `platform_core/templates/` | Stage template folders gain module-scoped headers and `{{MODULE_SLUG}}` render paths. **No `module/` templates were added:** `moduleSummary.js` and `moduleRegistry.js` generate `README.md` and `module.json` in full, and a template for a generated file would be a second shape to keep in sync by hand |
| `platform_core_data/modules/README.md` | **New** — the folder's own entry point |
| `docs/USER_GUIDE.md` §2, §5, §7, §10, §12 | Module activation, per-stage destinations, both artifact locations, retargeting, and a `module_manager` CLI reference |
| `workflows_and_pipelines/workflows/first_run.md` | Step 1 covers module selection, and the fresh-install case where Stage 1 must propose first |

---

*This document defines the Module Workspace layout and its integration contracts only. It does not itself invoke any agent, and no stage described in it has been run — either in producing it or in applying it.*
