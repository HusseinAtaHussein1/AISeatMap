# `platform_core/templates/` — Output Artifact Templates

The single home for the **structure of every artifact the pipeline writes**. One template per
artifact, per stage. A skill renders its output by copying the matching template and filling the
`{{PLACEHOLDER}}` tokens — it does not re-derive the section list from prose. The set is 26 templates:
`metadata/` (run-wide) plus `stage_1_context/` … `stage_6a_reporting/`.

## Why this folder exists

Before this folder, each artifact's structure lived as a prose section-list inside its
`.claude/skills/*/SKILL.md` ("Document structure: 1. Executive Summary, 2. …"). That made the
structure hard to diff, impossible to reuse, and easy to drift between runs — two runs of the same
stage could legitimately produce differently-shaped documents while both "followed the spec."

These templates are now **authoritative**. Each `SKILL.md` points here instead of restating the
structure, so there is exactly one place to change when an artifact's shape changes.

## Not to be confused with

| Location | What it templates | Direction |
|---|---|---|
| **`platform_core/templates/`** (this folder) | Pipeline **output** artifacts — what the stages write | Outputs |
| [`platform_core/tools/init/templates.js`](../tools/init/templates.js) | **Input** documents written by `agentic-testing init` (`PRD.md`, `run_configuration.md`, `credentials.template.json`) | Inputs |
| [`platform_core/tools/init/fragments.js`](../tools/init/fragments.js) | `CLAUDE.md` / settings fragments injected on init | Config |

`init/templates.js` is deliberately left in place: [`scripts/verifyPackable.js`](../../scripts/verifyPackable.js)
compares committed `knowledge_base/` files against it to block one project's real content from being
published. That guard is about inputs and is unaffected by this folder.

## Layout

```
platform_core/templates/
├── README.md                          # this file
├── metadata/
│   └── RunManifest.md                 # per-run orchestrator state — all stages, not one
├── stage_1_context/
│   └── ProjectContext.md
├── stage_2_discovery/
│   ├── DiscoverySnapshot.md
│   ├── Timeline.md
│   ├── Coverage_Summary.md
│   ├── QA_Assessment_Report.md
│   └── findings/
│       ├── Findings_Summary.md
│       └── FINDING_metadata.md
├── stage_3_test_design/
│   ├── TestCases_Module.md
│   ├── TestCase_entry.md              # the per-case block used inside TestCases_{Module}.md
│   ├── TraceabilityMatrix.md
│   └── CoverageReport.md
├── stage_4m_manual_execution/         # MANUAL branch (terminal)
│   ├── ManualExecutionResults.md
│   ├── ManualExecutionSummary.md
│   ├── ManualQAReport.md              # stakeholder deliverable — this branch self-reports
│   └── Defect_entry.md                # §10.1 Defect Documentation Standard block
│                                      # ManualTestResults.csv has no template: its schema is
│                                      # fixed by manual-execution-skill §9.2
├── stage_4a_automation/               # AUTOMATION branch
│   ├── AutomationPlan.md
│   ├── AutomationManifest.md
│   ├── AutomationDecisionReport.md
│   ├── AutomationCoverageReport.md
│   ├── AutomationSuiteManifest.md
│   ├── StackDocumentationContext.md
│   ├── AutomationSummary.md
│   └── AutomationPackages.md          # project-level registry (automation_baseline/)
├── stage_5a_execution/
│   └── ExecutionResults.md
├── stage_5h_self_healing/             # OPTIONAL, opt-in only (pipeline.md §3.6)
│   ├── RepairSummary.md
│   ├── RepairConfidenceReport.md      # per-failure block embedded in RepairSummary §3
│   ├── BeforeAfterComparison.md
│   └── QuarantineRegister.md
└── stage_6a_reporting/                # AUTOMATION branch only — the Manual branch
    └── Final_QA_Report.md             # self-reports at 4M and never reaches here
```

Sub-folders are named `stage_{N}_{stage-folder}` so a template's folder matches the destination folder
segment its artifact lands in — `stage_6a_reporting/` → `runs/{{RUN_FOLDER}}/reporting/`,
`stage_3_test_design/` → `modules/{{MODULE_SLUG}}/test_design/`.

### Which of the two locations a template renders into

Every template's own `Renders to:` line is authoritative. The pattern behind them is `pipeline.md`
§7's two-location rule:

| Template folder | Renders into | Because |
|---|---|---|
| `stage_1_context/` · `stage_2_discovery/` · `stage_3_test_design/` · `stage_4a_automation/` · `stage_5h_self_healing/` | `platform_core_data/modules/{{MODULE_SLUG}}/…` | A later run would want to **start from** it — durable, refined in place |
| `stage_4m_manual_execution/` · `stage_5a_execution/` · `stage_6a_reporting/` · `metadata/` | `platform_core_data/runs/{{RUN_FOLDER}}/…` | It is the **evidence of one execution** — immutable once written |
| `stage_4a_automation/AutomationPackages.md` · `AutomationSummary.md` | `platform_core_data/automation_baseline/…` | Whole-project registry/summary, not one module's |

The one folder whose templates split across locations is `stage_4a_automation/`: the per-module Plan,
Manifest, Decision Report, Coverage Report, Suite Manifest, and Stack Documentation Context render
into the module; the whole-project `AutomationPackages.md` registry and `AutomationSummary_{FW}.md`
render into the baseline. That split is the same rule applied to two different scopes, not an
exception to it.

`metadata/` follows the same naming rule but is not a stage: it holds the run-wide artifacts every run
has (`runs/{{RUN_FOLDER}}/metadata/`). `run.json` and `run_summary.md` have no template here because
`platform_core/tools/run_manager` generates them; `RunManifest.md` does, because nothing generates it —
a workflow's Step 1 creates it by hand.

**There are no `module/` templates for `README.md` or `module.json`**, and that is deliberate:
`platform_core/tools/module_manager` generates both in full — `moduleSummary.js` renders the summary
and `moduleRegistry.js` writes the state record. A template for a generated file would be a second
shape to keep in sync by hand, which is exactly what convention 7 below forbids.

## Conventions every template follows

1. **`{{TOKEN}}` marks a value the stage fills.** `{{RUN_FOLDER}}`, `{{MODULE}}`, `{{MODULE_SLUG}}`,
   `{{FRAMEWORK}}` carry the same meaning as everywhere else in the platform.

   `{{MODULE}}` and `{{MODULE_SLUG}}` are **not interchangeable**: `{{MODULE}}` is the human-readable
   name (`Flight Search`) used in headings and prose; `{{MODULE_SLUG}}` is the filesystem-safe folder
   name (`flight-search`) used in every path. Using the name where a path is expected produces a path
   that does not exist, so the two tokens are kept distinct rather than normalized at render time.
2. **`<!-- HTML comments carry the rule -->`** — what belongs in the section, and the halt/degrade
   behaviour when the input for it is missing. Comments are guidance for the rendering agent and are
   **stripped from the rendered artifact**.
3. **Section order is mandatory.** These templates encode each stage's Standard Output Contract; the
   order is what lets the next stage parse the artifact without interpreting prose.
4. **A missing input is rendered as a named gap, never as a favourable result.** An absent execution
   result is `Not Executed — Requires Stage 5A`, never `0 defects` or `100% pass`.
5. **Optional sections say so.** A section marked optional is omitted whole when it doesn't apply —
   never left in place as an empty heading.
6. **One file per artifact, edited in place.** No `.vN` suffixes, no duplicate "final" copy on
   approval — git is the version history (`workflows_and_pipelines/pipeline/pipeline.md` §7). For a
   **module** artifact, "in place" spans runs: a later run refining Login's Test Design re-opens
   `modules/login/test_design/TestCases_Login.md`, and `{{REVISION_COUNT}}` in its header is the
   in-place-edit equivalent of a version number.
6a. **A module artifact declares its module and what it consumed.** Its header carries
   `{{MODULE_SLUG}}`, the run that produced the current revision, `{{REVISION_COUNT}}`, and — where the
   artifact has upstream inputs — the revision of each input it read. That last field is what makes the
   PRD → test case → script chain mechanically traceable and lets the platform flag a downstream
   artifact **stale** when its input moves (`module_architecture.md` §10.1, §10.4).
6b. **A `status:` field in a module artifact's own header is authoritative.** `module.json` and
   `modules.json` cache it for fast listing; a stage that requires approved input reads the header,
   never a cache (`pipeline.md` §7).
7. **A template describes an *authored* artifact.** Where a stage also ships a non-Markdown rendering
   of the same content, that rendering is **generated from the authored file by a tool**, so there is
   no second template for it. The one case today is Stage 3's Manual Test Suite: `TestCases_Module.md`
   is authored, and [`tools/test_suite_export`](../tools/test_suite_export/) renders the matching
   `.xlsx` from it (`test-design-skill/SKILL.md` §9.1). Deriving it is what makes the two provably
   non-divergent — a second template would just be two shapes to keep in sync by hand.

## Adding or changing a template

- Changing an artifact's structure means editing **the template**, then checking that no `SKILL.md`
  has quietly re-acquired an inline copy of that structure.
- A new artifact needs: the template file here, a row in its stage's `SKILL.md` Expected Artifacts
  table pointing at it, and a line in the layout tree above.
