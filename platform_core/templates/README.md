# `platform_core/templates/` — Output Artifact Templates

The single home for the **structure of every artifact the pipeline writes**. One template per
artifact, per stage. A skill renders its output by copying the matching template and filling the
`{{PLACEHOLDER}}` tokens — it does not re-derive the section list from prose. The set is 30 templates:
`metadata/` (run-wide) plus `stage_1_context/` … `stage_6a_reporting/`.

## Why this folder exists

Before this folder, each artifact's structure lived as a prose section-list inside its
`.claude/skills/*/SKILL.md` ("Document structure: 1. Executive Summary, 2. …"). That made the
structure hard to diff, impossible to reuse, and easy to drift between runs — two runs of the same
stage could legitimately produce differently-shaped documents while both "followed the spec."

These templates are now **authoritative**. Each `SKILL.md` points here instead of restating the
structure, so there is exactly one place to change when an artifact's shape changes.

## `ndc_supplier_intake/` — a second template pair, deliberately not a numbered stage

`ndc_supplier_intake/SupplierChecklist.md` and `ndc_supplier_intake/FeatureChecklistProfile.md`
template the NDC Core Service Supplier-intake artifacts (`module_architecture.md` §11,
`new_us_intake.md` §12). They live outside the `stage_N_.../` numbering because they aren't one of
the 8 pipeline-stage artifacts — a Supplier Checklist plays the same "intake document a later run
starts from and refines in place" role for a Supplier that `stage_1_context/ProjectContext.md` plays
for a module/Feature, so it follows this folder's same `{{TOKEN}}`/HTML-comment/section-order
conventions rather than living as prose inside a Skill.

Two templates, not one, because a Supplier Checklist is never authored standalone — it is always a
merge of the generic base template and that Feature's own `FeatureChecklistProfile.md` instance
(`services/ndc-core-service/<feature>/context/FeatureChecklistProfile.md`), so one Feature's business
rows are never hardcoded into the reusable base:

```
ndc_supplier_intake/SupplierChecklist.md          (generic, Feature-agnostic)
                    +
<feature>/context/FeatureChecklistProfile.md      (this Feature's own rows, sourced from its
                                                     approved shared context(s))
                    ↓
<feature>/suppliers/<supplier>/context/SupplierChecklist.md   (rendered)
```

The merge is a Skill/agent responsibility exactly like every other template here — see
`new_us_intake.md` §12.2a for the full rendering procedure, including how `Source Status`
(Confirmed/Open/Provisional/Pending Confirmation) survives the merge unchanged.

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
│   ├── AutomationPlan.md              # incl. Responsibility Map · Optional Abstractions ·
│   │                                  #       Architecture Deviations (automation-skill §8)
│   ├── AutomationManifest.md          # incl. Architecture Review §3A (blocking, §15.1)
│   ├── AutomationDecisionReport.md
│   ├── AutomationCoverageReport.md
│   ├── AutomationSuiteManifest.md
│   ├── StackDocumentationContext.md
│   ├── AutomationSummary.md
│   └── AutomationPackages.md          # project-level registry (automation_baseline/)
│                                      # No TargetWritePlan/SelfReviewReport template yet: both are
│                                      # declared outputs of automation-skill (§11C.4, §15A) whose
│                                      # structure still lives in that spec — see the note below.
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

### Stage 4A and the Java/SHAFT UI Automation Architecture

`automation-skill` §8 defines the platform's mandatory architecture for **Java/SHAFT UI automation**:
one approved Maven structure — Page Classes and their dedicated Locator Classes under
`src/main/java/AdminPages/`, the Driver Factory under `src/main/java/Drive_Factory/`, Generic Classes
and technical utilities under `src/main/java/`, configuration under `src/main/resources/properties/`,
Test Classes under `src/test/java/AdminPages/`, shared fixtures under `src/test/java/utilities/`, and
JSON test data under `src/test/resources/`. Four consequences for the templates in this folder:

1. **Every file-level row carries its responsibility area** — Page · Locator · Test · Fixture ·
   Driver · Generic · Utility · Data · Config. `AutomationManifest.md` §1, `AutomationSummary.md` §2,
   and `AutomationSuiteManifest.md` §3 all require it; a blank area is an inventory defect, not an
   acceptable omission.
2. **`AutomationPlan.md` plans the architecture rather than inventing one** — §3 states the approved
   structure by reference, §3A is the Responsibility Map, §3B lists Optional Abstractions with their
   §8.11 justification, and §3C records Architecture Deviations with their §8.13 classification.
3. **`AutomationManifest.md` §3A is the blocking Architecture Review** (§15.1) — 22 named conditions,
   six recorded fields per violation, and no `Passed` verdict while an unapproved violation remains.
4. **No template requires an empty section for an optional layer.** Workflows, services, assertion
   classes, Component Object packages, adapters, builders, and data factories appear in a rendered
   artifact only when one was actually used and justified (§8.11). `Shared Components` is the one
   legacy row kept, and it renders as `None — §8.11` unless justified in the Plan's §3B.

For a **non-Java/SHAFT-UI** package (API, mobile, messaging, batch, cloud, or a framework with its
own explicitly approved structure), the same templates are used with that stack's own areas: §8.1's
folders are never forced onto another system shape (§8.12), and an Architecture Review condition with
no meaning for the shape is recorded `Not applicable` rather than dropped.

**Two of `automation-skill`'s declared outputs have no template here yet** — the Target Write Plan
(§11C.4) and the Self Review Report (§15A). Their structure is specified inline in that skill, and
the Architecture Review's detail is carried by `AutomationManifest.md` §3A. This is a known,
pre-existing gap in the template set, recorded here rather than left to be rediscovered.

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
