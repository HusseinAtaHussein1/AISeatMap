# `platform_core_data/modules/`

## Purpose

This folder holds **what the platform knows about each module of the application under test, and where each module stands in the pipeline.**

A module is a coherent area of the application — `login`, `agency-management`, `flight-search`. The module list is derived from the PRD by Stage 1 and approved by a human at Stage 1's gate; no other stage may propose one, and none is ever created silently.

**This is the durable half of the pipeline's output.** The other half lives in [`../runs/`](../runs/). The rule that decides which, stated once:

> If re-running the pipeline tomorrow would want to **start from** the artifact, it belongs to the module.
> If it is the **evidence of one execution**, it belongs to the run.

So a module's Project Context, Discovery, Test Design, Automation, and Healing output live here and are refined in place across many runs. Manual execution results, automation execution results, and the Final QA Report live in the run that produced them and are immutable once written.

The full specification is [`workflows_and_pipelines/pipeline/module_architecture.md`](../../workflows_and_pipelines/pipeline/module_architecture.md); `pipeline.md` §3.7 and §7 are the pipeline-level statement of the same rule. **Where this README and either of those disagree, they win** — this file is an entry point, not a source of truth.

## Layout

```
modules/
  modules.json                      # the module registry + the active-module pointer
  README.md                         # this file

  {module}/                         # one folder per module — a slug (lowercase-hyphenated)
    README.md                       # THE MODULE SUMMARY — regenerated, never hand-authored
    module.json                     # this module's authoritative state record

    context/                        # ── Stage 1 ───────────────────────────────────────
      ProjectContext.md               # this module's context slice

    discovery/                      # ── Stage 2 ───────────────────────────────────────
      DiscoverySnapshot.md · QA_Assessment_Report.md · Coverage_Summary.md · Timeline.md
      findings/                       # FINDING-NNN.md + Findings_Summary.md
      evidence/                       # screenshots documenting in-scope screens

    test_design/                    # ── Stage 3 ───────────────────────────────────────
      TestCases_{Module}.md · TestCases_{Module}.xlsx   # the .xlsx is GENERATED from the .md
      TraceabilityMatrix.md · CoverageReport.md

    automation/                     # ── Stage 4A — a STANDALONE PROJECT ───────────────
      tests_{Framework}/              # runnable on its own: own config, own dependencies
      AutomationPlan.md · AutomationManifest.md · AutomationSuiteManifest.md
      AutomationDecisionReport.md · AutomationCoverageReport.md · AutomationSummary.md
      StackDocumentationContext_{Framework}.md · TargetWritePlan.md
      .module_automation_state.json   # Generated → Executed → Healed → Approved

    healing/                        # ── Stage 5H — created ONLY if 5H actually ran ─────
      RepairSummary.md · RepairConfidenceReport.md · BeforeAfterComparison.md
      QuarantineRegister.md · kb_promotion_proposals.md
```

**A folder's absence is a record.** `test_design/` absent means Stage 3 has not run for that module. `healing/` absent is the normal case — Stage 5H is optional and never runs on its own. Only `context/` and `discovery/` are created when a module is scaffolded, because Stages 1 and 2 follow immediately.

## Working with modules

Which module the pipeline is working on is **an explicit fact on disk, not something inferred from conversation** — the same discipline the Active Run pointer applies to runs.

```bash
node platform_core/tools/module_manager/cli.js list                   # every module, status, active marked *
node platform_core/tools/module_manager/cli.js use login              # activate one (sticky)
node platform_core/tools/module_manager/cli.js use login,booking       # activate several
node platform_core/tools/module_manager/cli.js use --all               # activate every approved module
node platform_core/tools/module_manager/cli.js active --json           # what is active, and the scope
node platform_core/tools/module_manager/cli.js show login              # one module's full state
node platform_core/tools/module_manager/cli.js summary login           # regenerate its README.md
node platform_core/tools/module_manager/cli.js drift [login] [--json]  # has the code moved since we designed it?
```

`activeScope` records what an activation *means* — `single`, `multi`, or `full-project` — so a stage can tell "just Login" from "all five, of which Login happens to be first."

**When nothing is active, a stage asks.** It never guesses, and it never creates a module as a fallback.

## Rules

1. **A stage never invents a module.** It resolves the active module(s) from `modules.json`. A pointer naming a folder that does not exist is an error to report, not a prompt to fall back.
2. **Only Stage 1 may propose a module**, from the PRD, and only a human may approve one. A proposed module is recorded with `status: Proposed` and is **not** scaffolded until then.
3. **Only the Module Manager writes `modules.json`.** Stages read it and record their own progress through `recordStage()`; they never hand-edit the registry. The Run Manager never writes here at all.
4. **`module.json` is authoritative; the registry's copy is a display cache.** Where they disagree, `module.json` wins. Where a stage needs to know whether an artifact is approved, **the artifact's own `status:` header wins over both.**
5. **A module folder is never renamed.** Other artifacts cite its path. A module that must be re-identified is superseded via `module.json`'s `supersededBy`, and both stay readable.
6. **Every artifact here declares what it consumed.** Its `upstream` header names each input artifact and the revision of it that was read — which is what makes the chain from PRD to test case to script mechanically traceable, and what lets the platform flag a downstream artifact **stale** when its input has moved.
7. **The registry is committed, not ignored.** Which modules exist and where each stands is shared state a teammate or a later session needs, and its git history is a usable audit trail.

## What must never go in here

- **A copy of anything in `../knowledge_base/`.** The PRD is read by Stage 1 and cited, never copied into a module.
- **Execution results of any kind.** Manual and automation execution evidence belongs to the run that produced it. A module's `README.md` *links* to those runs; it never restates their results.
- **Application-agnostic engineering knowledge.** A repair pattern that would hold against a *different* application is promoted into `../knowledge_base/patterns/` through the explicit human gate, never left to accumulate in a module as though it were general.
- **A second copy of the automation baseline.** `{module}/automation/` holds this module's suite while it is developed and approved; `../automation_baseline/` holds the assembled whole-project suite.
- **Debug output.** Scratch scripts and raw dumps go to a temp location, or to the run's `_debug/` folder when Debug Mode is on — never here, because a Module Workspace is durable and would outlive every reason the scratch file was written.

## Related

- [`../../workflows_and_pipelines/pipeline/module_architecture.md`](../../workflows_and_pipelines/pipeline/module_architecture.md) — the full specification of this folder
- [`../../workflows_and_pipelines/pipeline/pipeline.md`](../../workflows_and_pipelines/pipeline/pipeline.md) — §3.7 (module vs. run), §7 (artifact conventions), §12 (module automation lifecycle)
- [`../../workflows_and_pipelines/pipeline/run_scope.md`](../../workflows_and_pipelines/pipeline/run_scope.md) — how a Run Scope resolves to a module set
- [`../runs/`](../runs/) — the other half: per-run, immutable execution evidence
- [`../../platform_core/tools/module_manager/`](../../platform_core/tools/module_manager/) — the only writer of `modules.json`
