# Agentic AI Testing Platform — Pipeline Specification

**Type:** Reusable pipeline orchestration specification
**Status:** Specification only — no stage, agent, or checkpoint in this document has been executed.
**Governs:** The seven skills defined in [`.claude/skills/`](../../.claude/skills/) — `project-context-skill`, `explorer-skill`, `test-design-skill`, `manual-execution-skill`, `automation-skill`, `automation-execution-skill`, `reporting-skill`.

---

## 1. Purpose

This document defines the **execution workflow** of the Agentic AI Testing Platform: the fixed order in which agents run, the artifacts that flow between them, and the human checkpoints that gate progression. The Agent Framework (`.claude/skills/`) specifies *what each skill does in isolation*, via each skill's own YAML contract header (`inputs`/`outputs`/`dependencies`); this Pipeline Specification defines *how those skills are wired together into one governed, repeatable process*.

**The platform tests exactly one Target Project at a time.** Every *process artifact* the platform produces — Project Context, Discovery Artifacts, Manual Test Suite, execution results, reports, run history, knowledge base — lives under a single root, `platform_core_data/`, resolved relative to the Tool Root (§1.1). There is no project-name path segment, no project selector, and no second project's artifacts to disambiguate against.

The **Target Project** is the application repository under test. It is a distinct root, `{{TARGET_ROOT}}` (§1.1), and it has exactly one role in this pipeline: it is where the *generated automation code* lives, and it is the authority on its own technology stack and coding conventions. It is never a source of requirements or business rules — those come exclusively from the approved Project Context (§6 Rule 5). §13 defines precisely what the platform may read from it, what it may write to it, and what it must never touch.

The stage order, checkpoints, and rules below remain reusable process logic. Retargeting the platform at a different application means running `agentic-testing init` against that repository — which replaces `platform_core_data/`'s *contents* (PRD, run configuration, resources, knowledge base), clears `workspace/` and `runs/`, and re-resolves `{{TARGET_ROOT}}` — never editing this specification.

### 1.1 Root resolution

Two roots exist, and **both are resolved by `platform_core/tools/platform_paths/paths.js` and by nothing else**:

| Root | What it is | How it is resolved |
|---|---|---|
| **Tool Root** | the platform's own folder — `platform_core/`, `platform_core_data/`, `workflows_and_pipelines/`, `platform.config.json` | marker walk-up from the tool's own location |
| **Target Project Root** (`{{TARGET_ROOT}}`) | the application repository under test | `targetRoot` in `platform.config.json`, or the `AGENTIC_TESTING_TARGET_ROOT` environment variable — **never inferred** |

An agent that needs an absolute root runs `node platform_core/tools/platform_paths/cli.js roots --json`. **An agent must never infer either root** from `process.cwd()`, from `__dirname`, or by searching for `.git`: installed inside a host project, each of those resolves to the host's repository rather than the tool folder, which is how generated artifacts end up in the wrong place and how a commit ends up in the wrong history.

When the platform is *self-hosted* (`mode: "self-hosted"`, the two roots being the same directory) it is testing its own repository. That is a degenerate case of the same model, not a second one.

Every path written in this specification and in the seven skills — `platform_core_data/knowledge_base/PRD.md`, `platform_core_data/runs/…`, `platform_core_data/automation_baseline/…` — is **relative to the Tool Root**. Those paths are correct as written whether the platform is self-hosted or installed as a folder inside a host project; only the resolved prefix differs.

## 2. Architecture Principle

> Agents communicate through artifacts only.
>
> Each agent has a single responsibility.
>
> Every output produced by an agent becomes the input of another agent whenever applicable.

The pipeline exists to enforce this principle mechanically: no stage may reach into another stage's internal reasoning, only into its published artifact.

## 3. Pipeline Overview

```
                          ┌───────────────────┐
   PRD ───────────────────▶                   │
   Supporting Documents ──▶  STAGE 1           │
   Run Configuration ─────▶  Project Context   │──▶ Project Context
                          │  Agent             │
                          └───────────────────┘
                                    │
                     ⛔ CHECKPOINT — Human Review Required ⛔
                                    │ (approved)
                                    ▼
                          ┌───────────────────┐
   Project Context ───────▶                   │
   Running Application ──▶  STAGE 2           │──▶ Discovery Artifacts
                          │  Explorer Agent    │
                          └───────────────────┘
                                    │
                     ⛔ CHECKPOINT — Human Review Required ⛔
                                    │ (approved)
                                    ▼
                          ┌───────────────────┐
   Project Context ───────▶                   │──▶ Manual Test Suites (Markdown)
   Discovery Artifacts ───▶  STAGE 3           │──▶ Manual Test Suites (Excel)
                          │  Test Design Agent │──▶ Requirement Traceability Matrix
                          └───────────────────┘──▶ Coverage Report
                                    │
                     ⛔ CHECKPOINT — Human Review Required ⛔
                                    │ (approved)
                                    ▼
                          ┌───────────────────┐
   Approved Manual ───────▶                   │──▶ Manual Execution Results
     Test Suites          │  STAGE 4          │──▶ Manual Execution Summary
   Traceability Matrix ───▶  Manual Execution  │──▶ Automation Candidate Package
   Coverage Report ───────▶  Agent             │──▶ Evidence
   Project Context ───────▶                   │
                          └───────────────────┘
                                    │
                     ⛔ CHECKPOINT — Human Review Required ⛔
                                    │ (approved)
                                    ▼
                          ┌───────────────────┐
   Automation Candidate ──▶                   │
     Package              │  STAGE 5           │──▶ Automation Scripts
   Manual Test Suites ────▶  Automation Agent  │
   Project Context ───────▶                   │
                          └───────────────────┘
                                    │
                     ⛔ CHECKPOINT — Automation Approval Required ⛔
                                    │ (approved)
                                    ▼
                          ┌───────────────────┐
   Automation Scripts ────▶  STAGE 6           │──▶ Execution Results
                          │  Automation        │──▶ Screenshots
                          │  Execution Agent    │──▶ Logs
                          └───────────────────┘──▶ Execution Metadata
                                    │
                                    │ (no gate — mechanical run)
                                    ▼
                          ┌───────────────────┐
   Execution Results ─────▶                   │
   Traceability Matrix ───▶  STAGE 7           │──▶ Final QA Report
   Project Context ───────▶  Reporting Agent   │
                          └───────────────────┘
                                    │
                                    ▼
                         Delivered to stakeholders
                          (terminal node — no
                           downstream agent)
```

## 4. Stage Definitions

### Stage 1 — Project Context Agent

**Spec:** [`.claude/skills/project-context-skill/SKILL.md`](../../.claude/skills/project-context-skill/SKILL.md)

| | |
|---|---|
| **Input** | PRD · Supporting Documents · Run Configuration |
| **Output** | Project Context |
| **Checkpoint** | **Human Review Required** |
| **Artifact path** | `platform_core_data/runs/{{RUN_FOLDER}}/context/ProjectContext.md` |

Notes:
- "Supporting Documents" (optional) covers any material that informs scope but is not itself the PRD — e.g., prior audit/QA reports, compliance policies, org-specific testing standards. These are folded into the Project Context alongside the PRD; they are never treated as a substitute source of requirements.
- This is the **only** stage in the pipeline permitted to read the PRD. Once its output is approved, the PRD is not re-consulted by any later stage.

### Stage 2 — Explorer Agent

**Spec:** [`.claude/skills/explorer-skill/SKILL.md`](../../.claude/skills/explorer-skill/SKILL.md)

| | |
|---|---|
| **Input** | Project Context · Running Application |
| **Output** | Discovery Artifacts |
| **Checkpoint** | **Human Review Required** |
| **Artifact path** | `platform_core_data/runs/{{RUN_FOLDER}}/discovery/*.md`, `platform_core_data/runs/{{RUN_FOLDER}}/discovery/QA_Assessment_Report.md` |

Notes:
- "Running Application" is the live target system, reached through browser automation — it is data to be observed, not a source of requirements.
- Output includes the Gap Analysis (documented vs. observed) required by the Explorer Agent specification.

### Stage 3 — Test Design Agent

**Spec:** [`.claude/skills/test-design-skill/SKILL.md`](../../.claude/skills/test-design-skill/SKILL.md)

| | |
|---|---|
| **Input** | Project Context (primary) · Discovery Artifacts (secondary) |
| **Output** | Manual Test Suites (Markdown) · Manual Test Suites (Excel) · Requirement Traceability Matrix |
| **Checkpoint** | **Human Review Required** |
| **Artifact path** | `platform_core_data/runs/{{RUN_FOLDER}}/test_design/TestCases_{Module}.md`, `...{Module}.xlsx`, `platform_core_data/runs/{{RUN_FOLDER}}/test_design/TraceabilityMatrix.md` |

Notes:
- Project Context governs *what* is tested; Discovery Artifacts only validate, enrich, and surface gaps — per the reversed primary/secondary relationship established in the Agent Framework.
- The Markdown and Excel test suites must never diverge — they are two renderings of one underlying test case set. The Markdown is authored; the `.xlsx` is **generated from it** by `platform_core/tools/test_suite_export/cli.js` (`test-design-skill/SKILL.md` §9.1), which is what makes non-divergence structural rather than a matter of discipline. Re-run the export after any edit to a suite document, and never hand-edit a workbook.

### Stage 4 — Manual Execution Agent

**Spec:** [`.claude/skills/manual-execution-skill/SKILL.md`](../../.claude/skills/manual-execution-skill/SKILL.md)

| | |
|---|---|
| **Input** | Approved Manual Test Suites · Requirement Traceability Matrix · Coverage Report · Project Context |
| **Output** | Manual Execution Results · Manual Execution Summary · Automation Candidate Package · Evidence |
| **Checkpoint** | **Human Review Required** |
| **Artifact path** | `platform_core_data/runs/{{RUN_FOLDER}}/manual_execution/ManualExecutionResults.md`, `platform_core_data/runs/{{RUN_FOLDER}}/manual_execution/ManualExecutionSummary.md`, `platform_core_data/runs/{{RUN_FOLDER}}/manual_execution/AutomationCandidatePackage.md`, `platform_core_data/runs/{{RUN_FOLDER}}/manual_execution/artifacts/` |

Notes:
- The word "Approved" in the Input is load-bearing: this stage may only consume the Stage 3 artifacts *after* they have cleared the Stage 3 checkpoint, never a draft or in-progress test suite.
- This stage executes manually-designed test cases against the live application — validating that they actually hold true — *before* any automation effort is committed to them. It never writes or runs automation code.
- The Automation Candidate Package it produces is the *sole* scope-determining input for Stage 5 (Automation Agent): only test cases confirmed successful and stable here are eligible for an automation decision downstream.
- Reviewed here, rather than passed straight through, because this stage performs real execution against a live environment (mutating actions included) — the same category of risk Stage 2 review already covers for Discovery.

### Stage 5 — Automation Agent

**Spec:** [`.claude/skills/automation-skill/SKILL.md`](../../.claude/skills/automation-skill/SKILL.md)

| | |
|---|---|
| **Input** | Approved Automation Candidate Package · Manual Execution Summary · Manual Test Suites (content source) · Traceability Matrix · Coverage Report · Project Context |
| **Output** | Automation Scripts |
| **Checkpoint** | **Automation Approval Required** |
| **Artifact path** | `platform_core_data/automation_baseline/tests/`, `platform_core_data/automation_baseline/AutomationSummary.md` |

Notes:
- The word "Approved" in the Input is load-bearing: this stage may only consume the Stage 4 Automation Candidate Package *after* it has cleared the Stage 4 checkpoint, never a draft or in-progress result set.
- This stage no longer determines automation scope directly from the raw Manual Test Suite — only test case IDs named in the Automation Candidate Package receive an automation decision; the Manual Test Suite is still read directly, but only for full test case content (Steps, Test Data, Expected Result), not for scope.
- "Automation Approval Required" is deliberately named differently from "Human Review Required" (see §5) because it gates the point at which generated code is authorized to later execute against a real environment.

### Stage 6 — Automation Execution Agent

**Spec:** [`.claude/skills/automation-execution-skill/SKILL.md`](../../.claude/skills/automation-execution-skill/SKILL.md)

| | |
|---|---|
| **Input** | Automation Scripts |
| **Output** | Execution Results · Screenshots · Logs · Execution Metadata |
| **Checkpoint** | *None — mechanical run, gated only by the Stage 5 Automation Approval that already occurred* |
| **Artifact path** | `platform_core_data/runs/{{RUN_FOLDER}}/execution/ExecutionResults.md`, `platform_core_data/runs/{{RUN_FOLDER}}/execution/artifacts/` |

Notes:
- Project Context remains a standing reference for this stage (target environment, credentials, safety constraints) even though it is not re-listed as a primary artifact input here — see §6, Rule 5. The Automation Execution Agent's own specification requires it to confirm the target environment against the Project Context before running anything.
- Execution Metadata includes, at minimum, the Executed Test Case ID and Automation Script ID for every result, plus Execution Time — per the Automation Execution Agent specification.
- No human checkpoint follows this stage: once automation is approved (Stage 5 gate), running it is a deterministic, repeatable operation, not a judgment call. Any judgment on the *results* happens in Stage 7.
- This stage executes only automated test suites — running manually-designed test cases directly is exclusively Stage 4's (Manual Execution Agent's) responsibility; the two never overlap.

### Stage 7 — Reporting Agent

**Spec:** [`.claude/skills/reporting-skill/SKILL.md`](../../.claude/skills/reporting-skill/SKILL.md)

| | |
|---|---|
| **Input** | Execution Results · Traceability Matrix · Project Context |
| **Output** | Final QA Report |
| **Checkpoint** | *None — terminal stage, delivered to human stakeholders outside the pipeline* |
| **Artifact path** | `platform_core_data/runs/{{RUN_FOLDER}}/reporting/Final_QA_Report.md` |

Notes:
- The Traceability Matrix is consulted here specifically to compute Requirement Coverage and Automation Coverage, and to carry forward every Manual Test Suite "Assumption-based test" tag into a resolved (confirmed/refuted/unverified) status.
- This is the last stage. Its output is consumed by people, not by another agent — there is nothing downstream to gate.

## 4.1 Explicit Skill I/O Chaining (Contract-Level)

Each skill under `.claude/skills/` now declares a strict `inputs`/`outputs`/`dependencies` contract in its own frontmatter (see any `SKILL.md`). This table makes explicit, at the contract level, which upstream output artifact satisfies which downstream input — the same handoff §3's diagram and §4's per-stage tables already describe, restated here in terms of each skill's own declared contract keys so an orchestrator can wire the chain mechanically rather than by re-reading prose:

| Upstream skill | Output key(s) (contract) | → | Downstream skill | Input key(s) (contract) satisfied |
|---|---|---|---|---|
| *(none — first stage)* | — | → | `project-context-skill` | `prd`, `run_configuration` (supplied at invocation) |
| `project-context-skill` | `project_context` | → | `explorer-skill` | `project_context` |
| `explorer-skill` | `qa_assessment_report`, `findings_summary`, `evidence_packages`, `discovery_snapshots` | → | `test-design-skill` | `discovery_artifacts` (`project_context` is re-supplied from Stage 1's output, not re-derived) |
| `test-design-skill` | `manual_test_suite_md`, `manual_test_suite_xlsx`, `traceability_matrix`, `coverage_report` | → | `manual-execution-skill` | `manual_test_suite`, `traceability_matrix`, `coverage_report` |
| `manual-execution-skill` | `automation_candidate_package`, `manual_execution_summary` | → | `automation-skill` | `automation_candidate_package`, `manual_execution_summary` |
| `test-design-skill` (pass-through) | `manual_test_suite_md`/`.xlsx`, `traceability_matrix`, `coverage_report` | → | `automation-skill` | `manual_test_suite`, `traceability_matrix`, `coverage_report` — content source only; scope comes from `manual-execution-skill`'s output above |
| `automation-skill` | `automation_package`, `automation_summary` | → | `automation-execution-skill` | `automation_suite`, `automation_summary` |
| `automation-execution-skill` | `execution_results` | → | `reporting-skill` | `execution_results` |
| `test-design-skill` (pass-through) | `traceability_matrix`, `manual_test_suite_md`/`.xlsx` | → | `reporting-skill` | `traceability_matrix`, `manual_test_suites` |
| `project-context-skill` (pass-through) | `project_context` | → | *every stage 2–7* | `project_context` — re-supplied unchanged at each stage, per §6 Rule 5 (Single Source of Truth), never re-derived |

Notes:
- A downstream skill's input key name does not need to match the upstream skill's output key name verbatim (each contract is written independently, like a function's own parameter names) — this table is what reconciles them for orchestration purposes.
- "Pass-through" rows mean the artifact is produced once (Stage 1 or Stage 3) and re-supplied, unchanged, to a later stage that also declares it as an input — it is not regenerated at each stage.
- This section restates §3/§4 in contract terms; it does not change any stage's Input/Output table, checkpoint, or artifact path. If this section and a skill's own `SKILL.md` contract ever disagree, the `SKILL.md` contract is authoritative — update this table to match, not the other way around.

## 5. Checkpoint & Approval Gates

The pipeline defines exactly two gate types. Both **stop the pipeline** until a named human explicitly approves — no agent may infer approval, time out into approval, or proceed on silence.

### 5.1 Human Review Required (Stages 1, 2, 3, 4)

| Stage | Suggested Reviewer Role | Reviews For |
|---|---|---|
| 1 — Project Context | Business Analyst / Product Owner | Scope accuracy, correct in-scope/out-of-scope split, correct carried-forward assumptions |
| 2 — Discovery Artifacts | QA Lead | Exploration completeness within scope, correctness of the Gap Analysis, no unauthorized mutating actions taken |
| 3 — Manual Test Suites | QA Architect / Test Lead | Test case correctness, traceability completeness, appropriate use of Discovery for enrichment (not as an unauthorized requirements source) |
| 4 — Manual Execution Results / Automation Candidate Package | QA Lead / Test Lead | Execution correctness against the live application, completeness of the Evidence Inventory, no unauthorized mutating actions taken, and that the Automation Candidate Package's qualifying criteria were actually applied rather than rubber-stamping Test Design's advisory hint |

### 5.2 Automation Approval Required (Stage 5)

| Stage | Suggested Reviewer Role | Reviews For |
|---|---|---|
| 5 — Automation Scripts | Automation Lead / Release Manager | Selector robustness, correct skip/not-automatable reporting, environment safety (no unauthorized destructive actions scripted), no invented business logic |

This gate is named distinctly from "Human Review Required" because approving it authorizes code that will execute against a real environment in Stage 6 — a materially different risk than approving a document. Treat it as at least as strict as a production deployment approval, not as a lighter-weight variant of Stage 1–4 review.

### 5.3 Gate Mechanics

1. On completing its output, an agent stops and marks its artifact `Pending Review` (or `Pending Automation Approval` for Stage 5). It does not hand off to the next stage itself.
2. A human with the appropriate role (§5.1/§5.2) reviews the artifact against the criteria above.
3. **Approved:** the reviewer marks the artifact `Approved` (see §7 for the recommended mechanism) and the next stage's agent may now be invoked with that artifact as input.
4. **Rejected:** the pipeline halts at the current stage. The rejecting reviewer's feedback is attached to the artifact. The *same* agent that produced the rejected artifact re-runs, incorporating that feedback, against its original inputs — a rejection does not cascade back further up the pipeline unless the reviewer explicitly determines the fault lies in an upstream artifact (e.g., a flawed Project Context surfaced only once Test Design tried to use it), in which case the reviewer escalates to that earlier stage's checkpoint instead.
5. **A stage is not blocked from being *invoked* by its predecessor's open checkpoint — it is blocked from *silently consuming un-approved input*.** A human may invoke any skill directly, at any time, in any order (§5.3.1). What an open (`Pending`) predecessor checkpoint forbids is the *pipeline* advancing on its own: no stage may auto-chain into the next, and no orchestrator may treat "the previous stage finished" as authorization to continue. When a directly-invoked stage finds its required upstream artifact `Pending Review` / `Pending Automation Approval`, it stops and requests that approval per §5.3.1 — it does not refuse the invocation outright, and it does not proceed on the un-approved draft.

### 5.3.1 Direct Skill Invocation (added 2026-07-26, user-mandated)

**Added because approval was the only way to move between stages: finishing Stage *N* left the user able to say "approved" and nothing else. There was no way to call a specific skill on demand, or to call one with extra instructions.** Every skill in `.claude/skills/` is independently invocable by name, as a first-class entry point — not only as the pipeline's next link.

**1. Invocation forms.** All three are equally valid ways to start a skill:

| Form | Example | Meaning |
|---|---|---|
| Bare | `/test-design-skill` | Run the skill per its own specification, on its declared inputs. |
| With instructions | `/test-design-skill cover only the Login module, negative cases only` | Same, plus a run-scoped instruction that narrows or focuses the work. |
| Approval-driven (pre-existing) | "approved" | Unchanged: approve the open checkpoint, then the recommended next stage may be invoked. |

**2. A direct invocation is authorization to run *that skill*, and nothing else.** It never implies authorization to run, resume, or skip any *other* stage — §5.4's Automation Start Decision Gate and §6 Rule 3 are untouched. Calling `/automation-skill` authorizes the Automation skill to begin its own work; it does not authorize a silent Stages 1–4 catch-up pass.

**3. Instruction prompts are run-scoped, never spec-overriding.** An instruction passed with a direct call may narrow scope, set focus, or prioritize (a module, a requirement ID, a subset of test cases, an output emphasis). It must never be read as permission to violate the invoked skill's own Execution Rules, this document's General Pipeline Rules (§6), the PRD-access restriction (§6 Rule 4), or a Human Decision gate (§5.5). Where an instruction conflicts with a rule, the rule wins and the skill says so plainly, then proceeds with the compliant remainder of the instruction. An instruction that *widens* scope beyond the run's business objective is a Human Decision (§5.5), not a free-form override.

**4. Un-approved upstream artifact → request approval, then recommend.** When a directly-invoked skill's required upstream artifact exists but is `Pending Review` / `Pending Automation Approval`, the skill does not run and does not bypass the gate. It reports what is awaiting approval, requests that approval, and — in the *same* message — names the next step concretely, including the literal command to issue. Format:

```
Cannot start Stage 3 yet — an upstream checkpoint is open.

  Stage 2 — Discovery Artifacts ....... Pending Review
    platform_core_data/runs/run-004__2026-07-27_14-30-05__Smoke__Login/discovery/QA_Assessment_Report.md

Next step — either:
  1. Approve it, then run this stage:   "approved"  →  /test-design-skill
  2. Revise Stage 2 first:              /explorer-skill <your feedback>
```

The point of the recommendation is that approval is no longer the *only* move the user can make — the message must always show the direct command as an explicit, available alternative path.

**5. Missing upstream artifact → run degraded, declare the gap.** When a required upstream artifact does not exist at all, a directly-invoked skill runs on whatever inputs *are* present rather than halting. It must, before producing anything: state which required inputs are absent; state what it is falling back to; and mark every affected output section as a declared gap (`Test Gap` / `Open Question` / `Requires Upstream Stage`, per the invoked skill's own gap vocabulary) rather than inventing the missing content. This is the same discipline `.claude/skills/explorer-skill/SKILL.md` §8.2 already applies to unavailable Discovery Modes, generalized to upstream artifacts. It never licenses reading the PRD out of turn (§6 Rule 4) or fabricating requirements — a gap is disclosed, never filled by guessing.

**6. Every skill ends by recommending the next step, with commands.** On completing its work, a skill's closing message states its own checkpoint status *and* the concrete next actions available — the approval that opens the normal path, and the direct commands the user may issue instead. A bare "Pending Review, awaiting approval" is no longer a complete closing message.

**7. Traceability records the invocation path.** The Run Manifest (§7) records, per stage, how that stage was entered: `Pipeline` (invoked after its predecessor's approval), `Direct` (invoked by name), or `Direct (degraded)` (invoked by name with one or more required inputs absent, per #5). Any artifact produced under `Direct (degraded)` carries the same note in its own header, so a later reader can never mistake a gap-laden run for a fully-fed one.

### 5.4 Automation Start Decision Gate (pre-flight — added 2026-07-12, user-mandated)

**Added after the orchestrator, during a real run, unilaterally decided to run Stages 1–4 in a single pass on a bare request to "run automation" — a judgment call it had no authority to make alone.** This gate runs *before* any stage is invoked or resumed, whenever a human asks for automation (Stage 5) or any other single downstream stage, for any project:

1. **Inspect, don't assume.** The orchestrator reads that project's Run Manifest (§7) and determines, per stage: does an Approved artifact exist? A Pending one? Nothing at all? It must not proceed on an assumption about what "probably" exists.
2. **Report the actual state plainly**, e.g.:
   ```
   Current project state
   ✓ Stage 1 — Approved
   ✓ Stage 2 — Approved
   ✓ Stage 3 — Approved
   ✓ Stage 4 — Approved
   ✗ Stage 5 — Not started
   ```
   or, for a project/scope with nothing yet: "No previous automation exists."
3. **Ask how to proceed** — present at minimum these options, and let the human choose (or specify something else via "Other"):
   1. Continue from the latest approved pipeline stage.
   2. Run the full pipeline from Stage 1.
   3. Generate automation directly (skip missing stages) — an explicit, human-authorized exception to §6 Rule 3's default "no skip" rule, never the orchestrator inventing scope or shortcuts on its own.
   4. Other.
4. **The orchestrator must never choose one of these on the human's behalf** — not even under a standing "minimize unnecessary decisions" or "drive forward automatically" directive elsewhere in this project's operating instructions. This is precisely the category of judgment call those directives are meant to exclude, not fold into "routine progress."

This does not weaken §6 Rule 3 in the normal, non-Spike case — it only makes explicit that a human-authorized partial or skip-ahead run is a distinct, deliberately chosen path each time, never an inferred default.

### 5.5 Human Decisions vs. Engineering Decisions (added 2026-07-12, user-mandated — applies to every stage, not only Stage 5)

**Not every judgment call an agent makes is a Human Decision.** §5.4 and `.claude/skills/automation-skill/SKILL.md` §31–§33 added several legitimate human-in-the-loop gates; this section exists so those gates don't over-fire into ordinary engineering work that no stage's own spec requires a human to approve mid-flight (the Checkpoint & Approval Gates in §5.1–§5.2 already provide the real review point — this section is about what happens *before* that checkpoint, while an agent is still doing its own work).

**Human Decisions — always ask, never infer:**
- Which automation framework to use (§31)
- Extend the existing project for a framework, start a project for a framework with none yet, or (rare, explicit) reset one from scratch (§31, §33) — never a coexisting second package for a framework that already has a project (`.claude/skills/automation-skill/SKILL.md` §31.5)
- **Automation merge destination and repository structure** (added 2026-07-24) — which project a run's automation is merged into, and any other repository-structure question the Automation Asset Lifecycle (§12) surfaces; governed by the explicit gather → analyze → recommend → wait procedure in `.claude/skills/automation-skill/SKILL.md` §31.6
- Which project/repository to target — including whether to generate inside the platform, export a compatible package, or modify an external Reference Automation Project directly (§32)
- Environment selection, when more than one is genuinely available for a run
- Executing any destructive or irreversible operation
- Business ambiguity — anything that would change the run's actual business objective or scope in a way a stakeholder would care about

**Engineering Decisions — make the call, document it, keep moving; never pause to ask:**
- Adding security-relevant test cases (e.g. anti-enumeration checks), boundary cases, empty-field variants, invalid-credential cases, validation-rule checks — ordinary Test Design Agent (Stage 3) work
- Marking a scenario Deferred / Requires Dedicated Environment because the current environment can't safely execute it (state why; never silently drop it, and never ask permission to defer it — see the "can't safely execute" rule below)
- Risk annotations, traceability updates, coverage-gap documentation
- Whether an adjacent, unrequested feature stays out of the current run's scope (e.g. Logout when only Login was asked for) — document it as "Out of Current Scope / potential future module" in the relevant artifact and continue; never pause execution to ask whether to fold an adjacent feature into scope unless doing so would change the run's business objective (a Human Decision, above)

**The "can't safely execute" rule:** when Discovery or Test Design identifies a scenario that cannot safely run against the current environment (e.g. a lockout/brute-force risk on shared staging), the agent does not ask what to do — it automatically creates the test case, marks it `Deferred` / `Requires Dedicated Environment`, states the reason, and continues with everything else. This extends the existing Coverage Gap / Stop Condition disclosure rules already present in `.claude/skills/explorer-skill/SKILL.md` and `.claude/skills/test-design-skill/SKILL.md` — it does not relax them, it clarifies that disclosure, not a question, is the correct response.

**Why:** the same day these gates were introduced, the user drew this line explicitly: "The platform should stop interrupting the workflow for engineering decisions. Reserve questions only for real human decisions." Confirmed concretely against an anti-enumeration test-case addition and an adjacent-scope (Logout) question — both are Engineering Decisions and should never have been asked about.

## 6. General Pipeline Rules

1. **Agents execute sequentially.** Stage *N+1* never starts before Stage *N* completes and, where applicable, clears its checkpoint. This governs *pipeline-driven* progression — the pipeline never advances itself past an open checkpoint. It does not restrict a human from invoking a skill directly and out of order (§5.3.1), which is a separate, explicitly-authorized entry point with its own disclosure requirements.
2. **Every stage consumes artifacts from the previous stage(s).** No stage invents its own inputs or reaches past its declared Input list.
3. **No agent may skip a stage.** All seven stages run, in order, on every full pipeline execution — even when a stage's output is small (e.g., zero defects), it still runs and produces its artifact. "No agent may skip" binds the *agents and the orchestrator*, not the human: a human invoking a single skill directly (§5.3.1) is choosing a deliberate partial run each time, and the invoked skill must declare the resulting gaps (§5.3.1 #5) rather than pretend the skipped stages ran.
4. **No downstream agent may read the PRD directly.** Only Stage 1 has the PRD in its Input list. This is enforced structurally, not just by convention: no other stage's Input table in §4 contains the PRD.
5. **Project Context is the Single Source of Truth.** From Stage 1 onward, every agent's understanding of "what the product should do" is scoped by the Project Context artifact — including Stages 4, 6, and 7, which reference it for environment/safety and risk-resolution purposes even where it is not the headline input of that stage.
6. **Human approval gates must stop the pipeline until approval is granted.** See §5.3 — no silent timeouts, no auto-approval, no proceeding on an assumed "looks fine." A direct skill invocation (§5.3.1) is not an approval and never satisfies this rule: a directly-invoked stage whose upstream artifact is `Pending` still stops and requests that approval (§5.3.1 #4).
7. **All artifacts must be versionable.** See §7 — every artifact carries a version identifier and prior versions are retained, never overwritten in place.
8. **Every output must maintain traceability.** See §8 — every artifact from Stage 3 onward can be traced back, ID for ID, to the Project Context requirement (and, transitively, the PRD) that generated it.
9. **Two Roots, One Project.** Exactly two roots exist (§1.1), and every read and write an agent performs resolves inside one of them:

    **(a) The Tool Root** — `platform_core_data/` holds every process artifact and every source of *requirements and business rules*; `platform_core/` and `workflows_and_pipelines/` hold Platform Knowledge (§10). This is the **only** source of what the product should do.

    **(b) The Target Project Root** (`{{TARGET_ROOT}}`) — readable for **technical facts only**: technology stack, dependency versions, test-directory layout, coding and naming conventions, existing automation code to extend or reuse. Writable in **exactly one** location: the configured automation target directory (`target.automationRoot` in `platform.config.json`), and only by Stage 5 and Stage 6, and only within the configured write allowlist (§13).

    **Requirements, business rules, acceptance criteria, and test cases are never sourced from the Target Project.** A source file, a comment, an existing test's assertions, or a commit message found in the Target Project is evidence of *what the code currently does* — never evidence of what it *should* do. A discrepancy between the Target Project's code and the approved Project Context is a **Finding to report**, never a requirement to adopt. This is the same discipline §32 already applies to a Reference Automation Project, generalized: read for structure and style, never for intent.

    Nothing outside these two roots may be read or written, with one registered exception: a **Reference Automation Project** (`platform_core_data/knowledge_base/reference_automation_project.md`) — a read-only structural reference for automation *style*, never a source of functional requirements, business rules, test cases, or domain knowledge, and never modified except via the explicit gate at `.claude/skills/automation-skill/SKILL.md` §32.3.

## 7. Artifact & Versioning Conventions

> **Revision note (2026-07-27, user-mandated):** this section previously (a) rooted every artifact at `platform_core_data/workspace/` and (b) mandated version-suffixed files plus an unsuffixed "current approved" copy. Both are replaced below. Real runs showed the two rules producing redundant copies of the same Markdown: a `.v1` file, an unsuffixed approved duplicate of it, and a fresh `.v2` whenever the reviewer asked for a refinement rather than an edit of the file they had just reviewed. **`platform_core_data/workspace/` is removed** — every artifact now lives in its own Run Folder — and **each artifact is now a single file, edited in place**, with git as the version history.

**Every artifact produced by this pipeline lives under that run's own Run Folder:**

```
platform_core_data/runs/{{RUN_FOLDER}}/{stage}/
```

where `{{RUN_FOLDER}}` is generated by `platform_core/tools/run_manager` (`run_manager.md` §5) and `{stage}` is one of `metadata/`, `context/`, `discovery/`, `test_design/`, `manual_execution/`, `automation/`, `execution/`, `reporting/`. There is no second location: a stage writes its artifact once, in its own run, and never mirrors it anywhere else.

To satisfy Rule 7 (versionable artifacts) and Rule 6 (gates that truly stop the pipeline):

- **One file per artifact, edited in place.** An artifact has exactly one path for the life of its run — `ProjectContext.md`, not `ProjectContext.v1.md`. No version suffix is ever appended, and no copy is ever made.
- **Approval changes status, never location.** Approving an artifact updates the `status:` field in its own header (`Draft` → `Pending Review` → `Approved`) and records the approval in the Run Manifest. **A stage must never, on approval, write a "final" copy of its Markdown outputs** — the file the reviewer read *is* the approved artifact.
- **Refinement edits the reviewed file.** When a reviewer requests changes — whether the artifact is `Pending Review`, `Approved`, or was rejected — the producing stage re-opens that same file and edits it in place. It must never create a `.v2`, `_final`, `_revised`, or otherwise-suffixed sibling.
- **Git is the version history.** Prior states of every artifact are recoverable from version control, which is why an in-place edit loses nothing. Each stage's write and each approval is a commit-worthy change; the Run Manifest records the sequence.
- **A rejected artifact is preserved only when the reviewer asks for it.** The default is an in-place revision. If a reviewer explicitly wants the rejected text kept alongside the revision for audit, it is written once to `{artifact}.rejected-{N}.md` in the same folder and never touched again.
- **Run Manifest:** a single tracking artifact, `platform_core_data/runs/{{RUN_FOLDER}}/metadata/RunManifest.md`, records for every stage: timestamp, checkpoint status (`Pending Review` / `Pending Automation Approval` / `Approved` / `Rejected`), the approving reviewer, the revision count (how many times the artifact has been edited in place — replacing the old version number), the **Invocation Path** (`Pipeline` / `Direct` / `Direct (degraded)`, per §5.3.1 #7) together with any run-scoped instruction given at invocation, and a direct link to the artifact file. This manifest is the pipeline orchestrator's own source of truth for "where are we right now" and is what a human or orchestration tool consults before invoking the next stage.

**Cross-run reuse.** A run that reuses an upstream artifact from an earlier run (e.g. an already-approved Project Context) references that run's file by path — `platform_core_data/runs/{{PRIOR_RUN_FOLDER}}/context/ProjectContext.md` — and records the source run in its own Run Manifest. It does not copy the file into the current run. When a stage does need to evolve a reused artifact, it copies it into the current run *once*, at that point, and the Run Manifest records that the copy's origin was the prior run.

`{{PRIOR_RUN_FOLDER}}` is **resolved, not filled in by hand**: `resolvePriorRunFolder()` reads it from the run's own `metadata/lineage.json` (`run_manager.md` §5.9), which records `inheritsFrom`/`supersedes` and every inherited artifact's path. The Run Manifest's **Cross-Run Reuse / Source Runs** section ([`platform_core/templates/metadata/RunManifest.md`](../../platform_core/templates/metadata/RunManifest.md)) is where the requirement above lands structurally — one row per reused artifact, recording the source run, whether it was `Referenced` or `Copied`, and the **drift** between that run's code-state anchor and now (`run_manager.md` §5.8). Where drift reports `moved` or any `unknown-*`, the reused artifact's conclusions are *unverified against current code* and the consuming stage says so rather than presenting them as current.

## 8. Traceability Chain

Every artifact must be traceable, end to end, back through the chain that produced it:

```
PRD
 └─▶ Project Context
       ├─▶ Discovery Artifacts               (validates/enriches only)
       └─▶ Manual Test Suites (MD + Excel)
             └─▶ Requirement Traceability Matrix
                   └─▶ Manual Execution Results
                         └─▶ Automation Candidate Package
                               └─▶ Automation Scripts
                                     └─▶ Execution Results (+ Screenshots, Logs, Execution Metadata)
                                           └─▶ Final QA Report
```

Concretely, this means:
- Every Manual Test Suite test case cites the Project Context requirement ID it covers (§4, Stage 3).
- Every Manual Execution Result cites the Test Case ID it executed (Agent Framework, Manual Execution Agent §3).
- Every Automation Candidate Package entry cites the Manual Execution Result that confirmed it (Agent Framework, Manual Execution Agent §9.3).
- Every Automation Script cites the Test Case ID it automates (Agent Framework, Automation Agent §7).
- Every Execution Result cites the Test Case ID *and* the Automation Script ID that produced it (Agent Framework, Automation Execution Agent §3).
- The Final QA Report's Requirement Coverage and Automation Coverage sections walk this entire chain in reverse — from Execution Result back to Project Context requirement — to compute what was actually verified versus merely documented.

A gap anywhere in this chain (an artifact that cannot cite its predecessor) is itself a pipeline defect and must be surfaced at the next available checkpoint, not silently patched over.

## 9. Roles Summary

| Role | Responsible For |
|---|---|
| Business Analyst / Product Owner | Stage 1 checkpoint |
| QA Lead | Stage 2 checkpoint |
| QA Architect / Test Lead | Stage 3 checkpoint |
| QA Lead / Test Lead | Stage 4 checkpoint |
| Automation Lead / Release Manager | Stage 5 checkpoint |
| Pipeline Orchestrator (tooling, not a person) | Invoking each agent in order, enforcing §5.3 gate mechanics, maintaining the Run Manifest |
| All stakeholders | Consumers of the Stage 7 Final QA Report — no approval role, as this is the terminal artifact |

## 10. Knowledge Architecture (added 2026-07-12, user-mandated — the canonical definition every agent references)

**The platform hosts one project at a time (§1), but knowledge still splits into two layers — and that split survives the restructure for a reason.** Knowledge that is *about this application* (a screen's quirk, a business rule, a redirect behavior) is disposable the moment the platform is retargeted; knowledge that is *about testing engineering* (a locator recovery strategy, a retry pattern, a framework convention) must outlive it. Keeping the two apart is what lets `platform_core_data/` be cleared and repopulated for a new application without throwing away everything the platform has learned about doing its job. This section is the single source of truth for that model; every agent spec references it by number rather than restating it.

Note (2026-07-25): this section previously justified the split by cross-project isolation — dozens of concurrent projects each needing a sealed knowledge base. That justification no longer applies; the durability one above does, and it is now the operative rationale.

### 10.1 Two layers

| Layer | Location | Contains | Never contains |
|---|---|---|---|
| **Platform Knowledge** | `platform_core_data/knowledge_base/patterns/` | Reusable, application-agnostic engineering knowledge: automation strategies, repair strategies, diagnosis strategies, proven exceptions to Execution Engine defaults (not the engine's core retry/concurrency/stop-condition mechanics — fixed capability logic in `.claude/skills/automation-execution-skill/SKILL.md` §5, §19–§20), framework best practices, synchronization patterns, locator recovery strategies, reporting conventions, AI reasoning patterns, pipeline decision patterns, shared engineering lessons | Anything application-specific (a named screen, a specific business rule, a specific app's redirect behavior); anything that is Capability rather than Knowledge (agent skill definitions, orchestration/engine mechanics, runtime configuration) — those belong in `.claude/skills/` or `workflows_and_pipelines/`, never here |
| **Project Knowledge** | `platform_core_data/knowledge_base/` | Knowledge discovered from the hosted application only: business rules, UI observations, application findings, known behaviors, module relationships, navigation knowledge, screen inventory, discovery artifacts, execution history, automation history, repair history, known workarounds, application-specific locator rules, lessons learned | Anything that would still be true after the platform is retargeted at a different application — that belongs in Platform Knowledge instead, via Promotion (§10.5) |

### 10.2 Knowledge Resolution

Whenever any agent needs knowledge to do its job, it resolves in this fixed order and merges both into its working context — never one layer alone:

1. **Platform Knowledge** (`platform_core_data/knowledge_base/patterns/`)
2. **Project Knowledge** (`platform_core_data/knowledge_base/`)

Project Knowledge *extends* Platform Knowledge; it never overrides or contradicts it silently — a project-specific finding that appears to contradict a Platform pattern is disclosed as a discrepancy, not silently substituted.

### 10.3 Structure — small versioned documents, not one giant file

Both layers are organized as small, individually-versioned documents, one concern per file — never a single growing markdown file. Each document carries a stable ID (e.g. `REPAIR-001` at the Platform layer, `REP-001` within a project's `repair/`) so it can be cited from other artifacts without re-stating its content.

Platform Knowledge subfolders: `automation_patterns/`, `diagnosis_patterns/`, `repair_patterns/`, `execution_patterns/`, `framework_patterns/`, `reasoning/`, `reporting/`, `pipeline_decision_patterns/`.

**Revision (2026-07-27):** the separate `diagnosis/` folder is removed. It was relocated into this layer empty on 2026-07-26 and then sat alongside `diagnosis_patterns/` — two folders for one category, with no rule distinguishing them and nothing in either. `diagnosis_patterns/` is the surviving name, consistent with every other `*_patterns/` sibling.

`pipeline_decision_patterns/` (renamed from `pipeline/`, 2026-07-21 governance review — the old name collided with this file's own layer, `workflows_and_pipelines/pipeline/`) is held deliberately empty: no agent or workflow is yet named as a reader in §10.7, and no Project Knowledge subfolder exists to promote a pattern from. Do not write into it until both exist.

There is no `skills/` subfolder here (removed, 2026-07-21 governance review). Cross-cutting agent capability is not Knowledge — it lives in `.claude/skills/`, a separate platform layer.

There is no `confidence_patterns/` subfolder here (removed, 2026-07-21). The Confidence Engine's scoring rubric (§27.2 of the Automation Execution Agent spec) is fixed Capability logic, not a promotable Knowledge category — the rubric has never needed a calibration-adjustment layer in practice, and keeping an empty category open for one invited exactly the scope ambiguity flagged in that review.

Project Knowledge subfolders (the fixed shape §10.4 scaffolds): `business_rules/` and `lessons_learned/`.

**Revision (2026-07-27, user-mandated): seven categories were removed** — `application/`, `automation/`, `execution/`, `findings/`, `repair/`, `ui/`, and the supporting `notes/`. Every one had stood empty since the platform's inception. The reason they stayed empty is structural, not accidental: each named a kind of output that a **run folder already holds in full** — discovery findings live in `runs/{{RUN_FOLDER}}/discovery/findings/`, execution history in `runs/{{RUN_FOLDER}}/execution/`, repair records in that run's Repair Summary, generated automation in `automation_baseline/`. Writing a second copy into a knowledge folder duplicated the run's own record and created a place for knowledge to go and be forgotten.

The two survivors are the categories a run folder genuinely cannot carry:

| Folder | Why it survives |
|---|---|
| `business_rules/` | A rule the application enforces is true between runs and is never promoted to the Platform layer (it is application-specific by definition). No single run owns it. |
| `lessons_learned/` | A cross-run observation about working with *this* application — by construction not scoped to the run that noticed it. |

**Where the removed categories' writes go now:** into the producing run's own folder, and — when the lesson generalizes beyond this application — into `patterns/` via the §10.5 Promotion gate. Promotion is therefore now the *only* mechanism for carrying engineering knowledge across runs; see `.claude/skills/automation-execution-skill/SKILL.md` §28 for the consequence that has for repair records specifically.

**`knowledge_base/` also holds everything else that is shared across runs** (revision 2026-07-27, user-mandated). Beyond the knowledge categories above, this folder is the single home for every document and asset that is true of the *project* rather than of one execution:

| Group | Contents | Written by |
|---|---|---|
| Stage 1 inputs | `PRD.md`, `PRD_UserStories.md`, `run_configuration.md` | Humans |
| Project reference | `architecture.md`, `glossary.md`, `onboarding.md`, `automation_framework.md`, `reference_automation_project.md` | Humans |
| Detected stack | `stack.md` | Stage 5 (§34.4 of `automation-skill`), correctable by humans |
| Supporting material | `requirements/{epics,features,user_stories,bugs,specifications}/`, `api/{swagger,postman}/`, `diagrams/` | Humans |
| Browser Driver assets | `browser/profile.json`, `browser/screens/`, `browser/components/` | Stage 2 tooling + humans |
| Credentials | `credentials/credentials.template.json` (committed), `credentials/credentials.json` (git-ignored) | Humans only |
| Baseline screenshots | `ui/screenshots/` — created on demand by the Browser Driver, not scaffolded | Browser Driver |

**The rule that decides the location:** if a document would still be correct at the start of the *next* run, it belongs in `knowledge_base/`; if it records what happened during one run, it belongs in that run's folder (§7). `stack.md` and its per-run companion `StackDocumentationContext_{Framework}.md` are the clearest illustration — the stack is durable, the record of which queries were made about it is not.

A previous layout scattered these across `platform_core_data/` root (the input documents), `platform_core_data/resources/` (supporting material), `platform_core_data/browser/`, `platform_core_data/credentials/`, and `platform_core_data/ui/`. Consolidating them removed the ambiguity of two plausible homes for the same kind of file, and left `platform_core_data/` with three top-level members whose distinction is real: `knowledge_base/` (shared, durable), `runs/` (per-run, immutable), and `automation_baseline/` (long-lived automation source code, §12).

Each top-level knowledge directory carries an `INDEX.md` (ID · Category · Title · Status · Producer · Consumers · Path) so an agent can locate relevant knowledge without scanning every file's full content.

### 10.4 Automatic Scaffolding

`platform_core_data/knowledge_base/` always carries §10.3's full subfolder list, each with its own `INDEX.md` — including folders currently holding nothing. An empty, indexed folder tells an agent "this category exists and has no entries yet"; a missing folder tells it nothing, and invites each agent to invent its own place to write. Whenever the platform is retargeted at a new application, that tree is scaffolded as part of setup — no manual step, no exceptions, the same shape every time.

**The scaffold is code, not prose.** `platform_core/tools/init/plan.js` holds the authoritative list as `DATA_DIRS` (folders) and `DATA_TEMPLATES` (the documents from §10.3's table, written blank from `templates.js`). This specification and that array must agree; when they disagree, the array is what actually runs, and the mismatch is a defect in whichever was updated without the other. `init` creates missing folders on re-install but **never overwrites an existing document** — the team's filled-in `PRD.md` survives every upgrade, `--force` included.

### 10.5 Promotion Workflow — explicit human approval only

Not every lesson learned becomes Platform Knowledge. Whichever agent writes a new piece of knowledge (e.g. the Automation Execution Agent writing a confirmed repair rule, per `.claude/skills/automation-execution-skill/SKILL.md` §28) writes it **only into `platform_core_data/knowledge_base/`** by default. When that agent recognizes the lesson as one that would still hold against a *different* application (generic locator recovery, a retry strategy, a synchronization strategy, a framework pattern, a diagnosis pattern — not an app-specific behavior like "the dashboard redirects after login"), it proposes promotion and asks exactly once:

> "This lesson looks application-independent. Promote it to Platform Knowledge?"

- **Approved:** the agent authors a new (or updates an existing) Platform Knowledge document in the matching `platform_core_data/knowledge_base/patterns/` subfolder, generalized beyond this application, and the project-level document is updated to reference it (§10.2's merge, made explicit) rather than duplicating its content.
- **Declined:** the knowledge stays exactly where it is, project-scoped, and is never silently re-proposed on every subsequent run of the same pattern. It may be re-proposed only on genuinely new evidence of generality — most obviously, the same pattern recurring after the platform has been retargeted at a different application.

This is a Human Decision (`§5.5`), never inferred, never defaulted to "yes" because a pattern merely looks generic.

### 10.6 Layer separation guarantee

Application-specific knowledge must never end up in `platform_core_data/knowledge_base/patterns/` — this extends §6 Rule 9 (Two Roots, One Project) to the knowledge layer explicitly. An agent writes to Platform Knowledge only by passing the §10.5 Promotion Workflow's explicit human gate; it never writes there directly, and never "generalizes on the way in" to justify skipping the gate. The failure this prevents: a Platform layer quietly accumulating this application's screens and business rules, so that retargeting the platform carries the old application's assumptions along with it.

Note (2026-07-26): the Platform layer now sits **nested inside** the Project layer — Platform Knowledge at `platform_core_data/knowledge_base/patterns/`, Project Knowledge in the folders surrounding it (`knowledge_base/business_rules/` and `lessons_learned/`, after the 2026-07-27 removal of the seven empty categories — see §10.3). It reached this location in two steps, from `platform_core/knowledge/` via `platform_core_data/patterns/`. **The nesting is structural only and confers nothing semantically:** `patterns/` is not a category of Project Knowledge and does not inherit its application scope. Two consequences follow, and both are unchanged in force:

- **§10.2 resolution order is unaffected.** `knowledge_base/patterns/` still resolves *first*, then the project-scoped folders around it. An agent walking `knowledge_base/` must treat `patterns/` as a separate layer, not as one more project category to merge in at the same precedence.
- **This §10.6 rule binds regardless of parent folder.** `patterns/` is application-agnostic and Promotion-only wherever it lives. Because it now sits inside the folder that gets emptied on retarget, the isolation guarantee is *more* dependent on convention than before, not less — see `README.md` §16 step 4/5, where `patterns/` is the one subtree inside `knowledge_base/` that is deliberately **not** cleared.

The duplicate `diagnosis/` folder this move created alongside `diagnosis_patterns/` was removed on 2026-07-27 (§10.3) — the category has one folder, `diagnosis_patterns/`.

### 10.7 Agent read/write map

| Agent | Reads | Writes |
|---|---|---|
| Project Context Agent (Stage 1) | Platform Knowledge + Project Knowledge | Project Knowledge (`business_rules/`) as it establishes scope |
| Explorer Agent (Stage 2) | Platform Knowledge + Project Knowledge | This run's `discovery/` folder (`findings/`, evidence, UI observations) — the `findings/`, `ui/`, and `application/` knowledge categories were removed 2026-07-27 (§10.3); Project Knowledge only for a `business_rules/` or `lessons_learned/` entry |
| Test Design Agent (Stage 3) | Platform Knowledge + Project Knowledge | Project Knowledge (`lessons_learned/`) where a design decision surfaces one; a design-surfaced finding goes in this run's `test_design/` artifacts |
| Manual Execution Agent (Stage 4) | Platform Knowledge + Project Knowledge | Project Knowledge (`lessons_learned/`) where a manual execution surfaces one; the execution record itself stays in this run's `manual_execution/` |
| Automation Agent (Stage 5) | Platform Knowledge (`repair_patterns/`, `automation_patterns/`, `framework_patterns/`) + `knowledge_base/stack.md`, per `.claude/skills/automation-skill/SKILL.md` §11 | Project Knowledge (`automation/`) |
| Automation Execution Agent (Stage 6) | Platform Knowledge (`repair_patterns/`, `diagnosis_patterns/`, `execution_patterns/`) + prior runs' Repair Summaries, per `.claude/skills/automation-execution-skill/SKILL.md` §28 | This run's `execution/` folder (Execution Results, evidence, Repair Summary). The project-scoped `repair/` and `execution/` categories were removed 2026-07-27 (§10.3), so a confirmed repair is recorded once in this run's Repair Summary and carried forward only via §10.5 Promotion — never written to `patterns/` directly. |
| Reporting Agent (Stage 7) | Platform Knowledge (`reporting/`) + Project Knowledge | — (terminal stage) |
| Pipeline Orchestrator (tooling) | *(none — no read dependency on `pipeline_decision_patterns/` is defined yet)* | — |

## 11. Debug Mode & Temporary Execution Artifacts (added 2026-07-12, user-mandated)

Stages that drive a live browser or write throwaway scripts to accomplish their work (chiefly Stage 2 Explorer, Stage 4 Manual Execution, Stage 5 Automation's selector verification, Stage 6 Automation Execution) must not let that internal tooling leak into a project's permanent artifact tree. Only the **outputs** those stages are actually specified to produce (§4's Expected Artifacts per agent — Discovery snapshots/Findings/Coverage/QA Assessment Report, Automation packages, Execution Results/Evidence, Reports) belong under `platform_core_data/runs/{{RUN_FOLDER}}/`.

### 11.1 Debug Mode flag

A project- or run-level flag, **default `Off`**, recorded in that run's Project Context or `run_configuration.md` if ever turned on:

- **Debug Mode: Off (default).** Any script written purely to drive browser automation, probe a screen's structure, or otherwise accomplish a stage's work (e.g., a one-off Node/Playwright script) must be written to a temporary location outside the project tree (the platform's scratchpad, or an OS temp directory) and **deleted immediately after the run extracts what it needs from it**. Raw tool-output dumps (full-page JSON captures, unfiltered element enumerations) are never written into `platform_core_data/` — only the synthesized, human-readable artifact the stage is actually specified to produce.
- **Debug Mode: On.** Explicitly enabled by the user for active troubleshooting of the tooling itself (not of the application under test). When on, intermediate scripts and raw result dumps may be persisted, but only under a clearly separated `_debug/` subfolder within that run's own folder (`platform_core_data/runs/{{RUN_FOLDER}}/_debug/`) — never mixed into `discovery/`, `automation/`, `execution/`, etc. — and the run's manifest entry must note Debug Mode was on, so a reviewer isn't confused about why extra files exist.

### 11.2 What counts as a permanent artifact vs. debug scaffolding

- **Permanent:** a Discovery snapshot, a Finding and its Evidence Package, the QA Assessment Report, Timeline, Coverage Summary, Test Design outputs, an Automation package, Execution Results/evidence, the Final QA Report — i.e., anything §4/Expected-Artifacts tables across the agent specs actually name. A screenshot that documents an in-scope screen as part of a Discovery snapshot or a Finding's evidence is permanent.
- **Debug scaffolding, never persisted by default:** the Node/Playwright (or other) script used to drive the browser to get that screenshot; raw, pre-synthesis JSON dumps of every element on a page; one-off reconnaissance screenshots taken only to verify navigation/tooling before the real discovery pass, not to document an application screen.
- When in doubt whether a given file is a deliverable or scaffolding, ask: "Does an agent spec's Expected Artifacts table name this?" If not, it does not belong anywhere under `platform_core_data/`.

### 11.3 Retroactive scope

This rule governs all runs from 2026-07-12 onward. Pre-existing debug scripts/raw dumps left in earlier runs' artifact folders (e.g., `_login_discovery.js` and its `_results.json` under RUN-20260712-001) are not automatically deleted by this section — cleaning up a prior, already-approved run's artifacts is a separate decision to confirm with the user, not an automatic side effect of adopting this rule.

This must remain a permanent platform capability, not a habit built around the currently-hosted application — whatever `platform_core_data/` is retargeted at next loads Platform Knowledge plus its own Project Knowledge, with no architectural change required.

## 12. Automation Asset Lifecycle (added 2026-07-24, user-mandated)

> **Path revision (2026-07-27):** the baseline moved from `platform_core_data/workspace/automation/{framework}/` to `platform_core_data/automation_baseline/{framework}/` when §7 removed `workspace/`. **Only the path changed — every rule in this section is unchanged.** The baseline is deliberately *not* relocated into a Run Folder: it is long-lived automation *source code* under a three-way-merge lifecycle that must outlive any single run, which is the exact opposite of the per-run, single-file-in-place discipline §7 applies to a stage's Markdown artifacts. Keeping it a sibling of `runs/` preserves that distinction, and the "Workspace Automation Baseline" term is retained throughout for continuity with §12.2–§12.6 and `automation-skill` §30–§33.

**The platform generates automation inside a Run, but a Run is temporary — without a persistent baseline, generated automation is either lost to a growing pile of per-run folders, or, as happened here prior to this section, the process quietly reverses course and starts hand-editing one run folder's files in place across several later runs, defeating the "immutable run" model this pipeline otherwise enforces.** This section makes explicit what the Folder Structure diagram in [`platform_core_data/README.md`](../../platform_core_data/README.md) already implied but never operationalized: `platform_core_data/automation_baseline/{Framework}/` is the **Workspace Automation Baseline** — the single authoritative, persistent copy of the project's automation code — and every Run works from a **temporary working copy** of it, never the baseline directly.

### 12.1 Two locations

| Location | Path | Role |
|---|---|---|
| **Workspace Automation Baseline** | `platform_core_data/automation_baseline/{framework}/tests_{Framework}/` — e.g. `.../automation/shaft/tests_SHAFT/` | The authoritative, persistent copy of one Automation Package. Never edited directly during generation — only ever written by the Workspace Merge (§12.4). |
| **Run Automation Working Copy** | `platform_core_data/runs/{{RUN_FOLDER}}/automation/tests_{Framework}/` | Temporary. Where Stage 5 (Automation Agent) actually generates/extends code for this run, and where Stage 6 (Automation Execution Agent) actually runs it. Deleted (source only — see §12.5) once its content has been merged back into the baseline. |

The framework subfolder appears in the baseline path but not the run path, and that asymmetry is deliberate: the baseline holds every framework's package side by side and needs them separated, while a run works on exactly one package (resolved by §33.1's gate) and has nothing to separate it from.

This composes with, and does not replace, `.claude/skills/automation-skill/SKILL.md` §30–§33.1's existing consolidated Decision Gate — that gate decides *which* package (Target/Framework/Strategy) a run works on; this section governs what happens to that package's *files* before, during, and after the run.

### 12.2 The four steps

1. **Working Copy Creation** (§12.3) — right after §33.1's gate resolves the package identity, before any generation.
2. **Automation Review** — the *existing*, unmodified §5.2 Automation Approval Required gate. Only `Approved` triggers step 3.
3. **Workspace Merge** (§12.4) — only after Approved.
4. **Cleanup** (§12.5) — only for files the merge actually accounted for.

```
  Workspace Automation Baseline                     Run Automation Working Copy
  (authoritative, persistent)                       (temporary, per run)
 ┌───────────────────────────┐    Step 1: Copy-in   ┌───────────────────────────┐
 │  {Project}_tests_{FW}/     │ ───────────────────▶ │  {Project}_tests_{FW}/     │
 │                            │                       │  (Stage 5 generates here)  │
 └───────────────────────────┘                       └─────────────┬─────────────┘
              ▲                                                     │
              │                                        Step 2: Automation Review
              │                                          (pipeline.md §5.2)
              │                                                     │
              │                                            Approved │  Rejected/Needs Changes
              │                                                     │  (loop back to Stage 5,
              │   Step 3: Workspace Merge                           │   same working copy)
              └───────────────  (after Approved) ◀───────────────────┘
                         │
                         ▼
               Step 4: Cleanup — delete the
               working copy's merged source;
               keep every report/evidence file
               (see §12.5) forever
```

### 12.3 Step 1 — Working Copy Creation

Once §33.1's consolidated gate has resolved which package this run targets:

- If a Workspace Automation Baseline already exists for that package, copy it wholesale into the run's working automation folder before any generation begins. Record a **baseline snapshot** — the baseline's path-scoped git commit hash at that moment (`git log -1 --format=%H -- <baseline-path>`, never a bare repo `HEAD`, since this is a monorepo and an unrelated commit elsewhere must never look like a baseline change) — in a small per-run file, `.lifecycle_snapshot.json`, alongside the working copy. This is what Step 3's conflict check compares against later.
- If no baseline exists yet (a brand-new package), the run starts empty, exactly as today.
- **Generation happens only inside the run's working copy.** The Automation Agent must never edit the Workspace Automation Baseline directly (see the corresponding Execution Rule added to `.claude/skills/automation-skill/SKILL.md` §18).
- Implemented by `platform_core/tools/automation_lifecycle/baselineCopy.js` (`copyBaselineIntoRun`) — no agent or script hand-rolls this copy step, the same discipline already established for run folder naming (`workflows_and_pipelines/pipeline/run_manager.md` §5.5).

### 12.4 Step 3 — Workspace Merge

Only triggered once Automation Review (§5.2) marks the run's automation `Approved`.

1. **Hard pre-check:** the baseline must have zero uncommitted changes (`git status --porcelain`). A dirty baseline — e.g. a human hand-edited a file directly, outside the pipeline — blocks the merge and is reported; it is never silently overwritten.
2. **Conflict check:** compare the baseline's current path-scoped commit hash to the snapshot recorded at Step 1.
   - **Unchanged** — nothing else has merged into this baseline since this run started. A plain two-way diff (working copy vs. baseline) is valid: every difference is this run's own intentional change. Fast-forward merge.
   - **Changed** — a *different* run's merge landed in this same baseline while this run was in flight. A naive two-way diff is unsound here: it cannot tell "the other run added this, we never saw it" apart from "we deleted this," and would silently delete the other run's already-merged work. Instead, a proper **three-way classification** is used — base (baseline content at the recorded snapshot, reconstructed via `git show`), theirs (baseline now), ours (working copy now) — the same base/theirs/ours model every real merge tool uses. Only a path genuinely changed on *both* sides since the snapshot is a real conflict, held for explicit human approval before merging just those files; everything else merges normally.
3. **Lock guard:** an exclusive lock file (`.automation_lifecycle.lock`, created via an atomic `wx`-flag write) in the baseline directory prevents two merges from racing on the same baseline.
4. **Write the merge:** new/modified content is copied over the baseline and `git add`-ed; deletions are `git rm`-ed; unambiguous, unmodified renames are `git mv`-ed (a renamed-and-modified file is not auto-detected as a rename — it merges as a separate delete+add; this is a stated, acceptable limitation, not a data-loss risk, since the content is still fully accounted for). The commit message records the source run and Added/Modified/Deleted/Renamed counts.
5. **Untracked/ignored files are classified separately, never silently dropped or silently merged.** A generated package commonly contains build/IDE output its own nested `.gitignore` excludes (confirmed real example: `tests_SHAFT/` has 299 files on disk but only 65 tracked — `target/`, `allure-results/`, `execution-summary/`, `generatedReport*.zip` are all git-ignored) — these are evaluated via `git check-ignore --no-index` (which works even on a not-yet-committed working copy) and reported on their own explicit "Discarded Untracked" line in the Merge Summary.
6. Produces a **Merge Summary**: Added / Modified / Deleted / Renamed / Conflicts (and resolution) / Discarded Untracked — the source data for `automation_promotion.md` (§12.6).

Implemented by `platform_core/tools/automation_lifecycle/mergePlan.js` (plan computation, side-effect-free) and `mergeApply.js` (the actual writes, gated behind an explicit `apply` flag — dry-run by default, mirroring `run_manager/migrate.js`'s own `--apply` convention).

### 12.5 Step 4 — Cleanup

Only for files the Merge Summary actually accounted for (added/modified/deleted/renamed-from/discarded-untracked) — anything still held back for an unresolved conflict stays in the run until a follow-up merge resolves it.

- Deletes the run's working copy of the merged package's source/build content (its `src/`, page objects, components, utilities, `pom.xml`/`build.gradle`/`package.json`/`playwright.config.*`/`testng.xml`/other framework source, and any build/IDE artifacts already logged as Discarded Untracked).
- **Never touches anything outside the package directory** — every one of the following is permanent run history and is never deleted by this step: the Automation Plan/Manifest/Decision Report/Coverage Report/Suite Manifest/Summary (`.claude/skills/automation-skill/SKILL.md` §19), Automation Review notes, Stage 6 Execution Results and all evidence (screenshots/videos/logs/traces/network captures), Automation Repair Loop reports, and `automation_promotion.md` itself.
- Implemented by `platform_core/tools/automation_lifecycle/cleanup.js` (`cleanupRunPackage`) — deletion is always driven by the Merge Summary's own accounted-for file list, never a blind recursive directory delete, so nothing can vanish from a run without a corresponding line in that run's Merge Summary.

### 12.6 `automation_promotion.md`

Written permanently into the run (never deleted by Cleanup) at `.../automation/automation_promotion.md`, recording: Promotion Status, Merge Date, Approved By, Source Run, Workspace Destination, Files Added, Files Modified, Files Deleted, Files Renamed, Discarded Untracked Files, Conflicts Detected, Conflicts Resolved, Merge Result, Notes. Rendered by `platform_core/tools/automation_lifecycle/promotionRecord.js`.

A **Bootstrap Migration** — lifting pre-existing, not-yet-lifecycle-managed automation into a Workspace Automation Baseline for the first time — is recorded with `Promotion Status: Bootstrap Migration` and `Approved By: N/A — Bootstrap Migration`, never a fabricated Automation Approval record for code that hasn't actually been reviewed against §5.2's real criteria. The originating run's own Automation Approval checkpoint is left exactly as it was — a bootstrap migration and a real Automation Approval are two distinct events, never conflated.

### 12.7 Registry cross-reference

`AutomationPackages.md` (`.claude/skills/automation-skill/SKILL.md` §19/§31) is extended with a Baseline Ref / Last Merged Run column per package, so the next Stage 5 run's registry summary (§31.1) can state not just which packages exist, but whether their Workspace Automation Baseline is current.

## 13. Target Project Integration (added 2026-07-26, user-mandated)

**The platform is installed into the repository it tests.** The tool folder sits inside the Target Project, and the generated automation this pipeline produces belongs in the Target Project's own test directories — not in a parallel universe under `platform_core_data/`. A suite the host team cannot run with their own `npm test` / `mvn verify` is not a deliverable. This section defines the contract that makes that safe.

### 13.1 The two roots

| Root | Resolved from | Contains | Platform access |
|---|---|---|---|
| **Tool Root** | marker walk-up (§1.1) | `platform_core/`, `platform_core_data/`, `workflows_and_pipelines/`, `platform.config.json` | Read + write, unrestricted |
| **Target Project Root** (`{{TARGET_ROOT}}`) | `platform.config.json` → `targetRoot` | the application under test | Read per §13.2, write per §13.3, never per §13.4 |

Both are resolved by `platform_core/tools/platform_paths/paths.js` and by nothing else. An agent that needs an absolute root runs `node platform_core/tools/platform_paths/cli.js roots --json`. An agent must never infer either root from `process.cwd()`, from `__dirname`, or by searching for `.git`.

### 13.2 What may be READ from the Target Project

Permitted, for **technical fact-finding only**:

1. **Dependency manifests and lockfiles** — via `detectStack` (`platform_core/tools/mcp/stack_docs/detectStack.js`). Establishes framework and version so Stage 5 generates against the real API surface (§34).
2. **Test-framework configuration** — `playwright.config.*`, `pom.xml`, `pytest.ini`, `testng.xml`, etc. Establishes where tests live and how they run.
3. **Test directories and their contents** — via `detectTestDirs` (`platform_core/tools/mcp/stack_docs/detectTestDirs.js`). Establishes layout, file naming, page-object pattern, fixture strategy, language, and formatting, so generated code is indistinguishable in style from what the team already writes.
4. **Existing automation code** — read to *extend and reuse* rather than duplicate. This is §11's Automation Knowledge Base rule and §32.5's reuse rule, applied to the Target Project.
5. **Build/test scripts** — `package.json#scripts`, Maven/Gradle test tasks — so Stage 6 invokes the suite the way the team does.

**Not permitted as a source of intent, under any circumstances:** application source code, database schemas, API implementations, comments, commit history, issue trackers, or existing tests' assertions, used to derive requirements, business rules, acceptance criteria, or expected behavior. Reading application source to *understand a selector or a route* is permitted and is a technical fact. Reading it to decide *what the correct output should be* is a §6 Rule 9 violation. When the two are hard to separate, the agent stops and asks (§26 Stop Conditions) rather than deciding.

**A read denylist is enforced mechanically**, not by convention: `target.readDenylist` in `platform.config.json`, merged with a non-overridable built-in list (`.env*`, `**/credentials*.json`, `**/secrets*`, `**/*.pem`, `**/*.key`, `**/.aws/**`, `**/id_rsa*`). Secrets reach the platform only through `platform_core_data/knowledge_base/credentials/credentials.json` (the Browser Driver contract), never by reading the Target Project.

### 13.3 What may be WRITTEN to the Target Project

Writes are **fail-closed**: if `target.writeAllowlist` is absent or empty, the platform writes nothing to the Target Project and Stage 5 falls back to generating inside `platform_core_data/` (the §32.3 Option 1 behavior).

Permitted, when allowlisted:

1. **Generated automation source** under `target.automationRoot` — test files, page objects, fixtures, helpers, test data. This is the deliverable.
2. **Test-framework configuration**, only when the resolved framework has none and the human approved scaffolding at init (greenfield test infra, §13.6).
3. **Test-script wiring** — a single added `scripts` entry or Maven/Gradle test-task stanza — only with explicit per-run human approval, and only additive: an existing script value is never modified.

Every write obeys these rules:

- **Filesystem writes only. The platform never runs `git add`, `git commit`, `git mv`, `git rm`, or any other history-modifying git command against the Target Project.** Generated automation is left in the working tree for the host team to review and commit with their own conventions, hooks, and review process. Enforced by `assertSameRepo` in `platform_core/tools/automation_lifecycle/gitUtils.js` — the lifecycle only ever holds the repository handle governing `platform_core_data/`, so a Target Project path passed to any git write raises `RepoBoundaryError`.
- **Every write is preceded by a Target Write Plan** — the full list of files to be created, modified, or deleted, with a one-line reason each — presented at the Automation Approval gate (§5.2). No file is written to the Target Project before that gate clears.
- **An existing Target Project file is never modified without being named in the Write Plan and individually approved.** Creating a new file in an allowlisted directory is covered by the gate's blanket approval; modifying a file the team already owns is not.
- **No deletions**, other than a file this platform itself created in a prior run and recorded in `platform_core_data/automation_baseline/TargetWriteLedger.md`.
- **Every write is recorded in the Target Write Ledger** (`platform_core_data/automation_baseline/TargetWriteLedger.md`): path, run folder, operation, sha256 after writing. This is the platform's record of what it owns inside someone else's repository, and it is what makes uninstall and drift-detection possible.

### 13.4 What must NEVER be touched

Application source outside the allowlist · CI/CD configuration (`.github/`, `.gitlab-ci.yml`, `Jenkinsfile`, `azure-pipelines.yml`) · `.git/` and every git hook · dependency lockfiles · `.env` and every secret file · the host's `.gitignore` and `.mcp.json` and `.claude/` **outside** the additive fragments written once at install time (§13.5) · infrastructure-as-code · database migrations · any file matching `readDenylist`.

### 13.5 Install-time fragments are not pipeline writes

The additive `.gitignore` marker block, the additive `.mcp.json` server keys, and the `.claude/skills/` directories are written **once, by `agentic-testing init`, with human confirmation** — never by a pipeline stage. No stage may modify them. They are recorded in `.install_manifest.json` and are the only platform-authored content in the Target Project outside `target.automationRoot`.

### 13.6 Greenfield: test infrastructure only

When no stack is detected, the platform scaffolds **test infrastructure only** — the test directory, the framework's config file, one example smoke test, and (with approval) the test-script wiring. **It never scaffolds the application**: no source files, no build config, no framework skeleton, no dependency manifest beyond a test-scoped devDependency the human approved. A greenfield install produces a repository ready to *receive* tests, and nothing else.

### 13.7 Relationship to §12 and to §32.3

§12's Automation Asset Lifecycle is unchanged and continues to govern the **baseline** under `platform_core_data/automation_baseline/{framework}/`, which remains the platform's authoritative, lifecycle-managed, three-way-merge-protected copy. §13 governs the **projection** of an approved baseline into the Target Project's test directories.

Ordering is fixed: generate in the run's working copy (§12.3) → Automation Approval (§5.2) → Workspace Merge into the baseline (§12.4) → **then** project into the Target Project (§13.3). The Target Project is never written before the baseline is updated, so the baseline is always the reproducible source and the Target Project's copy is always reconstructible from it.

This adds a fourth option to `.claude/skills/automation-skill/SKILL.md` §32.3's Automation Target Decision Gate:

```
4. Write into the Target Project's own test directories ({{TARGET_ROOT}}/<automationRoot>) —
   the installed-platform default. Generates in the run's working copy, merges to the
   baseline on approval, then projects into the Target Project per pipeline.md §13.3.
```

When `platform.config.json` declares `mode: "installed"` with a non-empty `writeAllowlist`, Option 4 is the **presented default** — still asked, never assumed (§31.2's "Ask, never infer" is unchanged).

### 13.8 Bootstrap Migration for an existing suite

A brownfield Target Project that already has automation in `target.automationRoot` is lifted into a Workspace Automation Baseline using §12.6's existing **Bootstrap Migration** promotion status — `Promotion Status: Bootstrap Migration`, `Approved By: N/A — Bootstrap Migration`, never a fabricated Automation Approval for code this platform has not reviewed against §5.2. This runs once, at init or at the first Stage 5, and it is what makes "extend the existing suite" (§33 Strategy 1) mean the *team's real suite* rather than an empty baseline.

### 13.9 Degraded git modes

`git.mode` in `platform.config.json` decides which repository the lifecycle's own git operations act on:

| Mode | Meaning |
|---|---|
| `tool-repo` (default) | the tool folder is its own nested git repository, so baseline three-way-merge protection always works and no commit ever lands in the host's history |
| `host-repo` | process artifacts are committed into the Target Project's repository, restricted to paths under `dataRoot` |
| `off` | no git; the lifecycle runs filesystem-only |

When git is unavailable — no repository, or the host gitignores the tool folder — the Merge Plan carries `degradedMode: 'no-git'` and a warning reproduced verbatim in the Merge Summary and in `automation_promotion.md`. **The absence of protection is always reported, never implied**: a merge that could not be verified is never presented as a verified one. If a run's Step-1 snapshot recorded that git *was* available and it is not at merge time, that is a hard block, not a downgrade.

---

*This document defines the reusable pipeline only. It does not itself invoke any agent, and no stage described above has been run as part of producing this specification.*
