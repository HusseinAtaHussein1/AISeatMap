# `platform_core/templates/` — Output Artifact Templates

The single home for the **structure of every artifact the pipeline writes**. One template per
artifact, per stage. A skill renders its output by copying the matching template and filling the
`{{PLACEHOLDER}}` tokens — it does not re-derive the section list from prose.

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
├── stage_4_manual_execution/
│   ├── ManualExecutionResults.md
│   ├── ManualExecutionSummary.md
│   ├── AutomationCandidatePackage.md
│   └── Defect_entry.md                # §10.1 Defect Documentation Standard block
├── stage_5_automation/
│   ├── AutomationPlan.md
│   ├── AutomationManifest.md
│   ├── AutomationDecisionReport.md
│   ├── AutomationCoverageReport.md
│   ├── AutomationSuiteManifest.md
│   ├── StackDocumentationContext.md
│   ├── AutomationSummary.md
│   └── AutomationPackages.md          # project-level registry (automation_baseline/)
├── stage_6_execution/
│   └── ExecutionResults.md
└── stage_7_reporting/
    └── Final_QA_Report.md
```

Sub-folders are named `stage_{N}_{stage-folder}` so a template's folder matches the run-folder
segment its artifact lands in — `stage_7_reporting/` → `runs/{{RUN_FOLDER}}/reporting/`.

`metadata/` follows the same rule but is not a stage: it holds the run-wide artifacts every run has
(`runs/{{RUN_FOLDER}}/metadata/`). `run.json` and `run_summary.md` have no template here because
`platform_core/tools/run_manager` generates them; `RunManifest.md` does, because nothing generates it —
a workflow's Step 1 creates it by hand.

## Conventions every template follows

1. **`{{TOKEN}}` marks a value the stage fills.** `{{RUN_FOLDER}}`, `{{MODULE}}`, `{{FRAMEWORK}}`
   carry the same meaning as everywhere else in the platform.
2. **`<!-- HTML comments carry the rule -->`** — what belongs in the section, and the halt/degrade
   behaviour when the input for it is missing. Comments are guidance for the rendering agent and are
   **stripped from the rendered artifact**.
3. **Section order is mandatory.** These templates encode each stage's Standard Output Contract; the
   order is what lets the next stage parse the artifact without interpreting prose.
4. **A missing input is rendered as a named gap, never as a favourable result.** An absent execution
   result is `Not Executed — Requires Stage 6`, never `0 defects` or `100% pass`.
5. **Optional sections say so.** A section marked optional is omitted whole when it doesn't apply —
   never left in place as an empty heading.
6. **One file per artifact, edited in place.** No `.vN` suffixes, no duplicate "final" copy on
   approval — git is the version history (`workflows_and_pipelines/pipeline/pipeline.md` §7).

## Adding or changing a template

- Changing an artifact's structure means editing **the template**, then checking that no `SKILL.md`
  has quietly re-acquired an inline copy of that structure.
- A new artifact needs: the template file here, a row in its stage's `SKILL.md` Expected Artifacts
  table pointing at it, and a line in the layout tree above.
