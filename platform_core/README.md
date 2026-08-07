# `platform_core/`

## Purpose

This folder exists to hold the platform's **shared engineering tooling** — the runtime engines that behave identically no matter which application the platform is pointed at, as distinct from the hosted application's business content (`platform_core_data/`), any single run's generated output, any orchestration logic (`workflows_and_pipelines/`), or any agent's behavioral specification (`.claude/`).

It is the most upstream, most stable layer in the repository: it depends on nothing else here, and everything else may draw on it.

> **Note (2026-08-07):** the Platform Knowledge layer lives here again, at [`knowledge/patterns/`](knowledge/patterns/). It was moved out to `platform_core_data/knowledge_base/patterns/` on 2026-07-26 and moved back on 2026-08-07, because Platform Knowledge is reusable *product* — it ships with the tool via `package.json` `files[]` — while `platform_core_data/` is project-owned data that the tool must be distributable without. Keeping it under the data root made the two inseparable. The two-layer Knowledge Architecture itself is unchanged: only the physical location moved, and only for the reusable layer. See `workflows_and_pipelines/pipeline/pipeline.md` §10 and `docs/CHANGELOG.md`.

## Responsibility

**This folder owns what any application under test can be examined *with* — never what the current one *is*.** Concretely: shared engineering *tooling* — runtime engines that behave identically regardless of what `platform_core_data/` currently holds.

It does not own agent behavior (`.claude/skills/`), stage sequencing (`workflows_and_pipelines/`), reusable engineering *knowledge* (`platform_core/knowledge/patterns/`), or anything specific to the application under test (the rest of `platform_core_data/`).

## What Lives Here

- **Shared Tools** (`tools/`) — reusable runtime engines callable identically for any project, with zero project-specific data baked in (the Platform Paths resolver, the Browser Driver, the MCP tools layer, the Run Manager, the Automation Lifecycle tools, the Test Suite Export renderer, and the `init` installer). `tools/mcp/` is the one member that holds no engine code of its own: it registers the `playwright` and `context7` MCP servers (repo-root `.mcp.json`) and specifies the contract under which Skills may drive them — plus `stack_docs/`, the extractor that reads a project's manifests/lockfiles so documentation is fetched for the versions the suite actually runs against.
- **Output Artifact Templates** (`templates/`) — the authoritative *structure* of every artifact the pipeline writes, one template per artifact per stage. Blank Markdown skeletons with `{{PLACEHOLDER}}` tokens and inline `<!-- -->` guidance; they hold no project content, which is exactly why they belong in this layer. Each `.claude/skills/*/SKILL.md` points at its templates rather than restating the structure inline, so an artifact's shape has one home. See [`templates/README.md`](templates/README.md).

Population is deliberate: this layer does not grow by accretion during ordinary pipeline execution — see Rules below.

## What Does NOT Belong Here

- **Project-specific business rules, findings, credentials, or screen locators.** All of that belongs under `platform_core_data/` — never here, no matter how "generic" it looks on first observation.
- **Reusable engineering knowledge documents.** A repair pattern, framework fact, or reasoning heuristic belongs in `platform_core/knowledge/patterns/`, cited from a Skill's `dependencies` line — not here.
- **Generated artifacts, execution results, or reports.** Those are project outputs: per-module design under `platform_core_data/modules/`, per-run execution evidence under `platform_core_data/runs/`.
- **Orchestration or sequencing logic.** Stage order, checkpoints, and run identity belong in `workflows_and_pipelines/`.
- **Agent behavioral specifications.** What an agent *does* is `.claude/skills/`'s responsibility, not this folder's.

## Folder Structure

```
platform_core/
├── templates/                # output artifact templates — the structure of everything the
│   ├── README.md             #   pipeline writes, one template per artifact per stage
│   │                         #   → MODULE:  stage_1 · stage_2 · stage_3 · stage_4a · stage_5h
│   │                         #   → RUN:     metadata · stage_4m · stage_5a · stage_6a
│   ├── metadata/            #   RunManifest — run-wide, not owned by any one stage
│   ├── stage_1_context/      #   ProjectContext — one per module
│   ├── stage_2_discovery/    #   snapshots, Timeline, Coverage, QA Report, findings/
│   ├── stage_3_test_design/  #   TestCases (+ per-case entry), Traceability, Coverage
│   ├── stage_4m_manual_execution/  # Results, Summary, QA Report, Defect entry
│   ├── stage_4a_automation/   #   Plan, Manifests, Decision/Coverage Reports, Summary
│   ├── stage_5a_execution/    #   ExecutionResults
│   ├── stage_5h_self_healing/ #   RepairSummary, Confidence, Before/After, Quarantine
│   └── stage_6a_reporting/    #   Final_QA_Report
└── tools/
    ├── automation_lifecycle/ # seeds a module project from the baseline, merge plan/apply,
    │                         #   promotion record, scoped cleanup
    ├── browser_driver/       # shared browser automation engine — zero project-specific data
    │   ├── driver.js          # resolves project paths, loads profile + credentials, launches, logs in
    │   ├── api.js             # BrowserDriver — the only surface Skills/scripts use
    │   └── README.md
    ├── execution_safety/     # "may this action execute here, now?" — deterministic policy evaluator
    │                         #   Allowed / Approval Required / Forbidden, plus the run preflight and
    │                         #   run-scoped authorizations. Holds NO project rule: the policy itself
    │                         #   lives in platform_core_data/knowledge_base/execution_safety_policy.json
    ├── init/                 # `agentic-testing init/upgrade/uninstall` — plan-then-apply installer
    ├── mcp/                  # MCP servers layer — registration + usage contract (no server code)
    │   ├── stack_docs/        # stack + pinned-dependency extractor; plans the Context7 lookups
    │   └── README.md          # `playwright` (2nd selectable browser mode) + `context7` (stack docs)
    ├── observability/        # "what happened during this run, and how efficiently?" — append-only
    │                         #   events, a pure deterministic aggregator, and the Markdown report +
    │                         #   self-contained HTML dashboard rendered from them. Decides nothing.
    │                         #   Telemetry lives per run, in runs/{RUN}/metadata/observability/
    ├── module_manager/       # module identity — slug generation (the only place a module name is
    │                         #   formatted), the registry, the Active Module pointer, per-module
    │                         #   stage/automation state, per-module drift, the module README
    ├── platform_paths/       # the two-root resolver (Tool Root / Target Root) every tool here uses
    ├── run_manager/          # run identity — folder naming/indexing (the only place a run name is
    │                         #   formatted), the Active Run pointer, Run Manifest, lineage, targetRef
    └── test_suite_export/    # Stage 3's authored Markdown test suites -> the matching .xlsx;
                              #   dependency-free writer, workbook derived and never hand-authored
```

**`module_manager/` and `run_manager/` are deliberate siblings with a hard boundary between them.** The Run Manager owns `runs/` and never writes under `modules/`; the Module Manager owns `modules/` and never writes under `runs/`. Two writers for one pointer is how a pointer stops being trustworthy — see `run_manager.md` §3 and `module_architecture.md` §6.5.

`platform_core/tools/` and `platform_core/knowledge/patterns/` are peers, not a hierarchy — a Skill may depend on either or both independently. See `platform_core/knowledge/patterns/README.md` for the full Knowledge layer specification (structure, document metadata standard, promotion mechanics) and `platform_core/tools/browser_driver/README.md` for this layer's design (the four-way split between the shared engine, a project's Browser Profile, its Screen/Component Knowledge, and its Credentials). `platform_core/tools/mcp/README.md` specifies the two registered MCP servers: `playwright` as a second, selectable browser mode alongside the Browser Driver (§1.2's selection rule, §1.3's absolute prohibition on credential values in MCP tool calls), and `context7` as the source of version-accurate documentation for a project's own extracted stack (§2).

## Interaction with Other Layers

```
.claude/skills/{stage}/SKILL.md
        │
        │  Tool invocation
        ▼
platform_core/tools/      ◀── resolves platform_core_data/ at runtime
```

- **`platform_core/` → nothing.** This layer has no dependency on `.claude/`, `workflows_and_pipelines/`, or `platform_core_data/` at rest — it is pure, reusable code. Its engines resolve `platform_core_data/` paths at runtime.
- **`.claude/skills/` → `platform_core/` (invocation).** Skills call into `tools/browser_driver/` directly; the driver resolves the profile and credentials from `platform_core_data/` itself, so no caller passes a project identifier. Each Skill's `dependencies` line also names which `platform_core/knowledge/patterns/` subfolders it consults — that resolution is specified in `workflows_and_pipelines/pipeline/pipeline.md` §10.2 and no longer touches this folder.
- **`workflows_and_pipelines/` governs, doesn't consume.** `pipeline.md` is the canonical specification of stage sequencing; this layer's engines are invoked by Skills, never by the orchestration layer directly.

## Lifecycle

`tools/` is invoked directly and synchronously, whenever a stage needs a live browser session (chiefly Explorer's Browser Automation Discovery Mode, Manual Execution's test case execution, and Automation's selector verification) or a stack-documentation lookup. It does not participate in the Knowledge Resolution flow — that resolves `platform_core/knowledge/patterns/` then `platform_core_data/knowledge_base/`, per `pipeline.md` §10.2.

## Design Principles

- **Reusability** — this folder's entire reason to exist; nothing here is single-project by definition.
- **Zero Project-Specific Data** — `browser_driver/` resolves every project-specific path dynamically at runtime; the shared engine itself never hardcodes a project name, selector, or credential.
- **One formatter per concern** — e.g. `run_manager/` is the only place a run folder name is ever formatted, so run identity cannot drift between callers.
- **Credentials never transit a tool argument** — `tools/mcp/README.md` §1.3: authenticate via `BrowserDriver.authenticate()` and hand MCP only an already-authenticated session, because tool arguments are transcript-visible.

## Rules

- **Never** write a project-specific fact, business rule, or credential here — no exception for something that "seems like it'll apply everywhere."
- **Never** add a reusable-knowledge document here; it belongs in `platform_core/knowledge/patterns/`, arriving only via the Promotion Workflow (`pipeline.md` §10.5).
- **Only** `tools/browser_driver/` may contain the shared automation engine's code; project-specific profiles, screens, components, and credentials live under `platform_core_data/knowledge_base/browser/` and `platform_core_data/knowledge_base/credentials/` instead.
- **Must not** duplicate a Skill's own fixed Capability logic as tooling (e.g. the Repair Confidence Engine's base scoring rubric stays in `self-healing-skill/SKILL.md` §9).

## Typical Flow

```
Skill                                   Platform Core
manual-execution-skill invoked  ──▶   BrowserDriver.authenticate()
                                       │  resolves platform_core_data/knowledge_base/browser/ profile
                                       │  + platform_core_data/knowledge_base/credentials/ (never echoed)
                                       ▼
                                      authenticated session returned
        │
        ▼
executes the authored Steps against that session
```

## Common Mistakes

- **"Add this project's login selectors to `platform_core/tools/browser_driver/`."** No — the shared engine holds zero project data by design; selectors belong in `platform_core_data/knowledge_base/browser/screens/`.
- **"This repair pattern is reusable, put it in `platform_core/`."** No — Platform Knowledge lives in `platform_core/knowledge/patterns/`, and only via the Promotion Workflow after proving itself in `platform_core_data/knowledge_base/`.
- **"Pass the password to the Playwright MCP tool so it can log in."** No — `tools/mcp/README.md` §1.3 prohibits a credential value in any MCP tool call; authenticate with the Browser Driver first.
- **"Format the run folder name inline here, it's just a string."** No — `run_manager/` owns that format; duplicating it lets run identity drift.

## Related Layers

- [`../.claude/`](../.claude/) — the Skills that invoke this layer's Tools.
- [`../workflows_and_pipelines/`](../workflows_and_pipelines/) — the orchestration layer that sequences the Skills which call into these engines.
- [`../platform_core_data/`](../platform_core_data/) — the hosted application's content, resolved by these engines at runtime, and the home of the Platform Knowledge layer (`patterns/`) that used to live here.
- [`tools/platform_paths/README.md`](tools/platform_paths/README.md) — the two-root resolver every other tool here depends on; start here to understand how Tool Root and Target Root are resolved and enforced.
- [`tools/test_suite_export/README.md`](tools/test_suite_export/README.md) — why Stage 3's Excel suite is *derived* from its Markdown rather than authored beside it, and why the writer carries no dependencies.
- [`../docs/USER_GUIDE.md`](../docs/USER_GUIDE.md) — operating these tools from the CLI ([§12](../docs/USER_GUIDE.md#12-cli-reference)) and setting up the browser/MCP layers ([§4](../docs/USER_GUIDE.md#4-browser-and-mcp-setup)).
