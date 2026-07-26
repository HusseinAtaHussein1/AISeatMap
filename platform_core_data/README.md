# `platform_core_data/`

## Purpose

This folder holds **everything specific to the one application the platform is currently pointed at** — durable Project Knowledge (what the application is, how to reach it, what's been learned about it) *and* every artifact the pipeline produces while validating it. Nothing application-specific lives outside this folder; nothing reusable lives inside it.

**The platform hosts exactly one project at a time** ([`workflows_and_pipelines/pipeline/pipeline.md`](../workflows_and_pipelines/pipeline/pipeline.md) §1). There is no project-name path segment, no project selector, and no sibling project directory. Retargeting the platform at a different application means running `agentic-testing init` in that application's repository — not adding a second folder here, and not editing any specification outside it.

**This folder always sits inside the Tool Root** — `agentic-testing-tool/platform_core_data/` once installed into a host repository. Every *process* artifact lives here; the Target Project receives generated automation code and nothing else. That split is the two-root contract ([`pipeline.md` §13](../workflows_and_pipelines/pipeline/pipeline.md), enforced by [`platform_core/tools/platform_paths/`](../platform_core/tools/platform_paths/)). `init` never overwrites this folder, even with `--force`.

**No application is currently hosted here.** The prior experiment's (NDC) generated output, knowledge base entries, inputs, and assets were purged on 2026-07-26; the folder structure and templates remain so the tree stays valid for a fresh install. See [`docs/BRANCH_COMPARISON.md`](../docs/BRANCH_COMPARISON.md) for what was removed and what deliberately survived.

It exists as its own top-level layer, separate from [`platform_core/`](../platform_core/) (reusable engineering assets), [`.claude/`](../.claude/) (skill behavior), and [`workflows_and_pipelines/`](../workflows_and_pipelines/) (orchestration rules), because everything under here is true of exactly one application and is never generalized without an explicit Promotion decision (`pipeline.md` §10.5).

## Responsibility

**This folder owns what the application under test *is*, everything the pipeline has produced by validating it, and the reusable engineering knowledge promoted out of that experience (`patterns/`).** It does not own agent behavior (`.claude/skills/`), the shared runtime engines that operate on it (`platform_core/tools/`), or the stage sequencing and checkpoint rules that govern it (`workflows_and_pipelines/`).

## What Lives Here

- **Project Knowledge** — durable facts about the application: its PRD, onboarding notes, architecture, domain glossary, run configuration, and supporting resources (requirements, API specs, diagrams, screenshots, credentials documentation). Written by humans; changes only when the application itself changes.
- **Project Knowledge Base** (`knowledge_base/`) — accumulated engineering experience against *this* application: confirmed repairs, automation assets, application/UI findings, business rules, lessons learned. Its own direct subfolders (`repair/`, `execution/`, `automation/`, `application/`, `ui/`, `findings/`, `business_rules/`, `lessons_learned/`) are the application-scoped layer, per `pipeline.md` §10.
- **Platform Knowledge** (`knowledge_base/patterns/`) — the application-*agnostic* layer, nested one level inside the Project Knowledge Base: reusable automation/repair/diagnosis/framework/reasoning patterns, each promoted out of its sibling project-scoped folders by explicit human approval (`pipeline.md` §10.5). Resolved *before* the surrounding `knowledge_base/` folders and read-only outside Promotion. **The nesting is structural only, not semantic** — `patterns/` is a distinct layer that happens to live inside `knowledge_base/`, and nothing application-specific may enter it, per §10.6's Isolation Guarantee. Relocated from `platform_core/knowledge/` → `platform_core_data/patterns/` → here on 2026-07-26.
- **Browser Driver assets** (`browser/`, `credentials/`) — the Browser Profile (login mechanics), Screen/Component locator knowledge, and real (git-ignored) credentials. See [`platform_core/tools/browser_driver/README.md`](../platform_core/tools/browser_driver/README.md) for the full four-way split this implements.
- **Workspace** (`workspace/`) — the current-approved output of each pipeline stage.
- **Runs** (`runs/`) — immutable per-run snapshots.

## What Does NOT Belong Here

- **Reusable engineering knowledge, anywhere outside `patterns/`.** A pattern that would still hold against a *different* application is promoted out of `knowledge_base/` into `patterns/` (`pipeline.md` §10.5) — never grown indefinitely in `knowledge_base/` on the assumption it "probably applies everywhere," and never written straight into `patterns/` without that approval.
- **Agent behavioral specifications.** What a Skill does belongs in `.claude/skills/`; this folder supplies a Skill's *inputs*, never its behavior.
- **Orchestration or sequencing logic.** Stage order and checkpoint mechanics belong in `workflows_and_pipelines/`.
- **A second project.** Adding one would reintroduce exactly the project-selection ambiguity the single-project model removes (`pipeline.md` §6 Rule 9).
- **Real secrets committed to git.** `credentials.json` is git-ignored by design (two overlapping `.gitignore` rules); only `credentials.template.json`, placeholders only, is ever committed.

## Folder Structure

```
platform_core_data/
  PRD.md                          # Product Requirements Document — Stage 1 INPUT, never generated
  PRD_UserStories.md              # user-story breakdown accompanying the PRD
  README.md                       # this file
  onboarding.md                   # how a new person/agent gets oriented fast
  run_configuration.md            # modules in scope, target URL, credentials, environment notes
  architecture.md                 # architecture of the application under test (not the platform)
  glossary.md                     # domain/product terminology
  automation_framework.md         # binding SHAFT package structure — Stage 5 must comply, not re-select
  reference_automation_project.md # registration of the external production SHAFT repo (read-only)
  resources/                      # supplementary material — standardized layout
    requirements/                   # organized by Type only: epics/, features/, user_stories/,
                                    #   bugs/, specifications/ — Source is in-file metadata, not a
                                    #   subfolder (see workflows_and_pipelines/pipeline/run_scope.md §4.3)
    api/{swagger,postman}/
    diagrams/ · screenshots/ · sample_data/ · notes/ · external_links/ · Documents/ · Records/ · TestData/
    credentials/                    # documentation ABOUT credentials only — never real secrets
  knowledge_base/                 # this application's own engineering experience (pipeline.md §10)
    repair/                         # confirmed repair records (REP-NNN)
    execution/ · automation/        # execution / generation history
    application/ · ui/              # application behavior and UI observations
    findings/ · lessons_learned/    # Explorer/Test Design-surfaced knowledge
    business_rules/                 # this application's business logic (never promoted)
    INDEX.md
    patterns/                     # PLATFORM Knowledge — application-agnostic, promotion-only (pipeline.md §10).
                                  #   Nested here structurally; still a SEPARATE layer, resolved first (§10.2)
                                  #   and never receiving application-specific content (§10.6).
      repair_patterns/ · reasoning/  # the two populated categories (REPAIR-NNN, REASON-NNN)
      diagnosis/ · diagnosis_patterns/                                   # empty until promoted
      automation_patterns/ · execution_patterns/                         # empty until promoted
      framework_patterns/ · reporting/ · pipeline_decision_patterns/     # empty until promoted
      INDEX.md · README.md          # catalog of promoted documents + the layer's own spec
  browser/                        # Browser Driver Layer — live-browser assets
    profile.json                    # auth + browser init only
    screens/ · components/          # per-screen / shared-component locator knowledge
  credentials/                    # real (git-ignored) credentials — see credentials/README.md
    credentials.template.json       # committed — schema only, placeholder values
    credentials.json                # real values — NEVER committed
  ui/screenshots/                 # UI Knowledge Base — canonical baseline screenshots
  workspace/                      # current-approved state, one folder per stage
    context/                        # current-approved Project Context
    discovery/                      # current-approved Discovery snapshots, QA Assessment Report
      findings/                       # current Finding evidence packages
    test_design/                    # current-approved Manual Test Suite, Traceability Matrix, Coverage Report
    manual_execution/               # current-approved Manual Execution Results / Summary / Candidate Package
    automation/                     # Workspace Automation Baseline — the authoritative, persistent
      {framework}/                  #   Automation Package(s); a run's own automation/ is only ever a
        tests_{Framework}/          #   temporary working copy of this, per the Automation Asset
                                    #   Lifecycle (pipeline.md §12)
    execution/                      # current Execution Results + evidence
    reporting/                      # current Final QA Report
    pipeline/                       # RunManifest.md — generated pipeline artifacts only
  runs/                           # immutable per-run snapshots
    YYYY-MM-DD_HH-mm-ss__Scope__Target/   # current naming convention (run_manager.md §5)
    RUN-YYYYMMDD-XXX[-slug]/              # pre-existing runs — never renamed (run_manager.md §5.6)
      metadata/                       # run.json + run_summary.md — always created
      context/ · discovery/{findings/} · test_design/ · manual_execution/ · execution/ · reporting/
                                      # created only when that stage actually writes to it
      automation/                     # temporary working copy of the Workspace Automation Baseline
                                      #   (pipeline.md §12.1) — its source is removed after a successful
                                      #   Workspace Merge; automation_promotion.md and every
                                      #   Plan/Manifest/Report/Summary stay forever
```

**Artifact filenames carry no project prefix** (changed 2026-07-25): `ProjectContext_Agency.md`, not `NDC_ProjectContext_Agency.md`. With one project, that prefix was a constant on every filename and distinguished nothing.

**Hard rule, no exceptions:** secrets, passwords, and API keys must never be committed anywhere in this repository.

## Where the Current Artifacts Live

| Artifact | Path |
|---|---|
| Product Requirements Document | `PRD.md` |
| Project Context (current approved) | `workspace/context/ProjectContext_{Scope}.md` |
| Discovery Artifacts | `workspace/discovery/*.md` |
| Manual Test Suites & Traceability Matrix | `workspace/test_design/` |
| Automation Baseline | `workspace/automation/{framework}/tests_{Framework}/` |
| Run Manifest | `workspace/pipeline/RunManifest.md` |
| Reports | `workspace/reporting/` |
| Run history (immutable) | `runs/` |

## Human-Facing Files

The documents below are not *generated* artifacts — they exist for the humans (and future skill sessions) getting oriented before or between runs. `PRD.md` and `run_configuration.md` are the exception: they are Stage 1's declared **inputs**.

> **Currently these seven documents sit in [`NDC_Previous_used_helper_docs_tobe_delete/`](NDC_Previous_used_helper_docs_tobe_delete/), not at this folder's root.** They hold the prior experiment's (NDC) content and were staged for deletion, then deliberately deferred rather than removed — see [`docs/BRANCH_COMPARISON.md` § Known Open Items](../docs/BRANCH_COMPARISON.md#known-open-items). The links below point at their real location so they resolve. **A self-hosted run therefore has no `PRD.md` at the path Stage 1 expects**; installed usage is unaffected, because `init` scaffolds blank inputs into the target project independently.

| File | Purpose |
|---|---|
| [`onboarding.md`](NDC_Previous_used_helper_docs_tobe_delete/onboarding.md) | Start here — what the application is, where its knowledge lives, how to get oriented fast |
| [`run_configuration.md`](NDC_Previous_used_helper_docs_tobe_delete/run_configuration.md) | Modules in scope, target URL, credentials location, environment constraints — a Stage 1 input |
| [`architecture.md`](NDC_Previous_used_helper_docs_tobe_delete/architecture.md) | Architecture of the application under test (not of the testing platform) |
| [`automation_framework.md`](NDC_Previous_used_helper_docs_tobe_delete/automation_framework.md) | **Mandatory** SHAFT package structure — Stage 5 must comply with it, not select or invent an alternative |
| [`reference_automation_project.md`](NDC_Previous_used_helper_docs_tobe_delete/reference_automation_project.md) | Registration of the external production SHAFT repository this package must stay merge-compatible with |
| [`glossary.md`](NDC_Previous_used_helper_docs_tobe_delete/glossary.md) | Domain/product terminology |
| [`resources/`](resources/) | Supplementary reference material — see `resources/README.md` for the standardized subfolder layout |

## Related Layers

- [`../platform_core/`](../platform_core/) — the shared runtime Tools (Browser Driver, MCP layer, Run Manager, Automation Lifecycle) that resolve this folder's paths at runtime. Note that reusable *Knowledge* is no longer there: [`knowledge_base/patterns/`](knowledge_base/patterns/), inside this folder, is the only layer a pattern from `knowledge_base/` may be promoted into.
- [`../docs/USER_GUIDE.md`](../docs/USER_GUIDE.md) — how to populate this folder's inputs and where each generated artifact lands ([§3](../docs/USER_GUIDE.md#3-prepare-your-inputs), [§7](../docs/USER_GUIDE.md#7-where-your-artifacts-live)).
- [`../.claude/`](../.claude/) — the Skills whose declared Inputs and Outputs resolve to paths in this folder.
- [`../workflows_and_pipelines/`](../workflows_and_pipelines/) — where every path convention, versioning rule, and Run Workspace layout realized here is actually defined.
