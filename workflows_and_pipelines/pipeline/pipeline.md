# Agentic AI Testing Platform — Pipeline Specification

**Type:** Reusable pipeline orchestration specification
**Status:** Specification only — no stage, agent, or checkpoint in this document has been executed.
**Governs:** The seven skills defined in [`.claude/skills/`](../../.claude/skills/) — `project-context-skill`, `explorer-skill`, `test-design-skill`, `manual-execution-skill`, `automation-skill`, `automation-execution-skill`, `reporting-skill`.

---

## 1. Purpose

This document defines the **execution workflow** of the Agentic AI Testing Platform: the fixed order in which agents run, the artifacts that flow between them, and the human checkpoints that gate progression. The Agent Framework (`.claude/skills/`) specifies *what each skill does in isolation*, via each skill's own YAML contract header (`inputs`/`outputs`/`dependencies`); this Pipeline Specification defines *how those skills are wired together into one governed, repeatable process*.

**The platform hosts exactly one project at a time** (restructured 2026-07-25, user-mandated). That project's every input and every generated artifact lives under a single root, `platform_core_data/` — there is no project-name path segment, no project selector, and no second project to disambiguate against. The stage order, checkpoints, and rules below are still written as reusable process logic: retargeting the platform at a different application means replacing `platform_core_data/`'s *contents* (PRD, run configuration, resources, knowledge base) and clearing its `workspace/` and `runs/`, not editing this specification.

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
| **Artifact path** | `platform_core_data/workspace/context/ProjectContext.md` |

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
| **Artifact path** | `platform_core_data/workspace/discovery/*.md`, `platform_core_data/workspace/discovery/QA_Assessment_Report.md` |

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
| **Artifact path** | `platform_core_data/workspace/test_design/TestCases_{Module}.md`, `...{Module}.xlsx`, `platform_core_data/workspace/test_design/TraceabilityMatrix.md` |

Notes:
- Project Context governs *what* is tested; Discovery Artifacts only validate, enrich, and surface gaps — per the reversed primary/secondary relationship established in the Agent Framework.
- The Markdown and Excel test suites must never diverge — they are two renderings of one underlying test case set.

### Stage 4 — Manual Execution Agent

**Spec:** [`.claude/skills/manual-execution-skill/SKILL.md`](../../.claude/skills/manual-execution-skill/SKILL.md)

| | |
|---|---|
| **Input** | Approved Manual Test Suites · Requirement Traceability Matrix · Coverage Report · Project Context |
| **Output** | Manual Execution Results · Manual Execution Summary · Automation Candidate Package · Evidence |
| **Checkpoint** | **Human Review Required** |
| **Artifact path** | `platform_core_data/workspace/manual_execution/ManualExecutionResults.md`, `platform_core_data/workspace/manual_execution/ManualExecutionSummary.md`, `platform_core_data/workspace/manual_execution/AutomationCandidatePackage.md`, `platform_core_data/workspace/manual_execution/artifacts/` |

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
| **Artifact path** | `platform_core_data/workspace/automation/tests/`, `platform_core_data/workspace/automation/AutomationSummary.md` |

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
| **Artifact path** | `platform_core_data/workspace/execution/ExecutionResults.md`, `platform_core_data/workspace/execution/artifacts/` |

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
| **Artifact path** | `platform_core_data/workspace/reporting/Final_QA_Report.md` |

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
5. No stage may be invoked while its predecessor's checkpoint is open (`Pending`). This applies even if a human attempts to run a later stage manually — the orchestrator must refuse.

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

1. **Agents execute sequentially.** Stage *N+1* never starts before Stage *N* completes and, where applicable, clears its checkpoint.
2. **Every stage consumes artifacts from the previous stage(s).** No stage invents its own inputs or reaches past its declared Input list.
3. **No agent may skip a stage.** All seven stages run, in order, on every full pipeline execution — even when a stage's output is small (e.g., zero defects), it still runs and produces its artifact.
4. **No downstream agent may read the PRD directly.** Only Stage 1 has the PRD in its Input list. This is enforced structurally, not just by convention: no other stage's Input table in §4 contains the PRD.
5. **Project Context is the Single Source of Truth.** From Stage 1 onward, every agent's understanding of "what the product should do" is scoped by the Project Context artifact — including Stages 4, 6, and 7, which reference it for environment/safety and risk-resolution purposes even where it is not the headline input of that stage.
6. **Human approval gates must stop the pipeline until approval is granted.** See §5.3 — no silent timeouts, no auto-approval, no proceeding on an assumed "looks fine."
7. **All artifacts must be versionable.** See §7 — every artifact carries a version identifier and prior versions are retained, never overwritten in place.
8. **Every output must maintain traceability.** See §8 — every artifact from Stage 3 onward can be traced back, ID for ID, to the Project Context requirement (and, transitively, the PRD) that generated it.
9. **Single Project Root.** Every input and every artifact an agent may read or write lives under `platform_core_data/` (plus Platform Knowledge, §10). Agents must not read application content from anywhere else on disk — most importantly not from an external Reference Automation Project (`platform_core_data/reference_automation_project.md`), which is a read-only structural reference for automation *style*, never a source of functional requirements, business rules, test cases, or domain knowledge. The platform hosts one project at a time (§1); there is no sibling-project directory to isolate against, and none may be introduced under `platform_core_data/`.

## 7. Artifact & Versioning Conventions

Every artifact produced by this pipeline lives under `platform_core_data/workspace/` in the subdirectory conventions established in the Agent Framework (`context/`, `discovery/`, `Reports/`, `testcases/`, `manual_execution/`, `Automation/`, `execution/`).

To satisfy Rule 7 (versionable artifacts) and Rule 6 (gates that truly stop the pipeline), each stage's artifact is versioned as follows:

- **Version-suffixed files:** each artifact is written with a version suffix, e.g. `ProjectContext.v1.md`, `.v2.md`, etc. A rejected-and-revised artifact is a new version, never an in-place edit of the rejected one — the rejected version remains on record.
- **A "current approved" pointer:** the unsuffixed filename referenced throughout the Agent Framework (e.g., `ProjectContext.md`) always refers to the **latest approved** version. It is only updated at the moment a reviewer approves a version — never before.
- **Run Manifest:** a single tracking artifact, `platform_core_data/workspace/pipeline/RunManifest.md`, records for every stage: version number produced, timestamp, checkpoint status (`Pending Review` / `Pending Automation Approval` / `Approved` / `Rejected`), the approving reviewer, and a direct link to that version's artifact file. This manifest is the pipeline orchestrator's own source of truth for "where are we right now" and is what a human or orchestration tool consults before invoking the next stage.

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

Platform Knowledge subfolders: `automation_patterns/`, `diagnosis_patterns/`, `repair_patterns/`, `execution_patterns/`, `framework_patterns/`, `reasoning/`, `reporting/`, `pipeline_decision_patterns/`, plus `diagnosis/` (relocated in from the project layer 2026-07-26 and held empty — see §10.6).

`pipeline_decision_patterns/` (renamed from `pipeline/`, 2026-07-21 governance review — the old name collided with this file's own layer, `workflows_and_pipelines/pipeline/`) is held deliberately empty: no agent or workflow is yet named as a reader in §10.7, and no Project Knowledge subfolder exists to promote a pattern from. Do not write into it until both exist.

There is no `skills/` subfolder here (removed, 2026-07-21 governance review). Cross-cutting agent capability is not Knowledge — it lives in `.claude/skills/`, a separate platform layer.

There is no `confidence_patterns/` subfolder here (removed, 2026-07-21). The Confidence Engine's scoring rubric (§27.2 of the Automation Execution Agent spec) is fixed Capability logic, not a promotable Knowledge category — the rubric has never needed a calibration-adjustment layer in practice, and keeping an empty category open for one invited exactly the scope ambiguity flagged in that review.

Project Knowledge subfolders (the fixed shape §10.4 scaffolds): `automation/`, `repair/`, `execution/`, `application/`, `ui/`, `findings/`, `business_rules/`, `lessons_learned/`. As of 2026-07-26, `diagnosis/` is no longer among them — it was relocated to the Platform layer at `knowledge_base/patterns/diagnosis/` by user-mandated change, alongside that layer's existing `diagnosis_patterns/`. Diagnosis notes specific to *this* application therefore have no dedicated project-scoped folder; record them in the `repair/` record that consumed the diagnosis, or in `findings/`.

Each top-level knowledge directory carries an `INDEX.md` (ID · Category · Title · Status · Producer · Consumers · Path) so an agent can locate relevant knowledge without scanning every file's full content.

### 10.4 Automatic Scaffolding

`platform_core_data/knowledge_base/` always carries §10.3's full subfolder list, each with its own `INDEX.md` — including folders currently holding nothing. An empty, indexed folder tells an agent "this category exists and has no entries yet"; a missing folder tells it nothing, and invites each agent to invent its own place to write. Whenever the platform is retargeted at a new application, that tree is scaffolded as part of setup — no manual step, no exceptions, the same shape every time.

### 10.5 Promotion Workflow — explicit human approval only

Not every lesson learned becomes Platform Knowledge. Whichever agent writes a new piece of knowledge (e.g. the Automation Execution Agent writing a confirmed repair rule, per `.claude/skills/automation-execution-skill/SKILL.md` §28) writes it **only into `platform_core_data/knowledge_base/`** by default. When that agent recognizes the lesson as one that would still hold against a *different* application (generic locator recovery, a retry strategy, a synchronization strategy, a framework pattern, a diagnosis pattern — not an app-specific behavior like "the dashboard redirects after login"), it proposes promotion and asks exactly once:

> "This lesson looks application-independent. Promote it to Platform Knowledge?"

- **Approved:** the agent authors a new (or updates an existing) Platform Knowledge document in the matching `platform_core_data/knowledge_base/patterns/` subfolder, generalized beyond this application, and the project-level document is updated to reference it (§10.2's merge, made explicit) rather than duplicating its content.
- **Declined:** the knowledge stays exactly where it is, project-scoped, and is never silently re-proposed on every subsequent run of the same pattern. It may be re-proposed only on genuinely new evidence of generality — most obviously, the same pattern recurring after the platform has been retargeted at a different application.

This is a Human Decision (`§5.5`), never inferred, never defaulted to "yes" because a pattern merely looks generic.

### 10.6 Layer separation guarantee

Application-specific knowledge must never end up in `platform_core_data/knowledge_base/patterns/` — this extends §6 Rule 9 (Single Project Root) to the knowledge layer explicitly. An agent writes to Platform Knowledge only by passing the §10.5 Promotion Workflow's explicit human gate; it never writes there directly, and never "generalizes on the way in" to justify skipping the gate. The failure this prevents: a Platform layer quietly accumulating this application's screens and business rules, so that retargeting the platform carries the old application's assumptions along with it.

Note (2026-07-26): the Platform layer now sits **nested inside** the Project layer — Platform Knowledge at `platform_core_data/knowledge_base/patterns/`, Project Knowledge in the folders surrounding it (`knowledge_base/repair/`, `execution/`, `automation/`, `application/`, `ui/`, `findings/`, `business_rules/`, `lessons_learned/`). It reached this location in two steps, from `platform_core/knowledge/` via `platform_core_data/patterns/`. **The nesting is structural only and confers nothing semantically:** `patterns/` is not a category of Project Knowledge and does not inherit its application scope. Two consequences follow, and both are unchanged in force:

- **§10.2 resolution order is unaffected.** `knowledge_base/patterns/` still resolves *first*, then the project-scoped folders around it. An agent walking `knowledge_base/` must treat `patterns/` as a separate layer, not as one more project category to merge in at the same precedence.
- **This §10.6 rule binds regardless of parent folder.** `patterns/` is application-agnostic and Promotion-only wherever it lives. Because it now sits inside the folder that gets emptied on retarget, the isolation guarantee is *more* dependent on convention than before, not less — see `README.md` §16 step 4/5, where `patterns/` is the one subtree inside `knowledge_base/` that is deliberately **not** cleared.

Note that `knowledge_base/patterns/` contains both a `diagnosis/` and a `diagnosis_patterns/` folder as of this move; `diagnosis/` was relocated in from the project layer by the same user-mandated change.

### 10.7 Agent read/write map

| Agent | Reads | Writes |
|---|---|---|
| Project Context Agent (Stage 1) | Platform Knowledge + Project Knowledge | Project Knowledge (`business_rules/`, `application/`) as it establishes scope |
| Explorer Agent (Stage 2) | Platform Knowledge + Project Knowledge | Project Knowledge (`findings/`, `ui/`, `application/`) |
| Test Design Agent (Stage 3) | Platform Knowledge + Project Knowledge | Project Knowledge (`findings/`, `lessons_learned/`) where a design decision surfaces one |
| Manual Execution Agent (Stage 4) | Platform Knowledge + Project Knowledge | Project Knowledge (`execution/`, `lessons_learned/`) where a manual execution surfaces one |
| Automation Agent (Stage 5) | Platform Knowledge (`repair_patterns/`, `automation_patterns/`, `framework_patterns/`) + Project Knowledge (`automation/`), per `.claude/skills/automation-skill/SKILL.md` §11 | Project Knowledge (`automation/`) |
| Automation Execution Agent (Stage 6) | Platform Knowledge (`repair_patterns/`, `diagnosis_patterns/`, `execution_patterns/`) + Project Knowledge (`repair/`, `execution/`), per `.claude/skills/automation-execution-skill/SKILL.md` §28 | Project Knowledge (`repair/`, `execution/`) by default; Platform Knowledge only via §10.5 Promotion. **Note:** the project-scoped `diagnosis/` folder this row previously named was relocated into the Platform layer on 2026-07-26 (§10.6), so diagnosis findings are recorded inside the `repair/` record that consumed them, or in `findings/` — never written to `patterns/diagnosis/` directly. |
| Reporting Agent (Stage 7) | Platform Knowledge (`reporting/`) + Project Knowledge | — (terminal stage) |
| Pipeline Orchestrator (tooling) | *(none — no read dependency on `pipeline_decision_patterns/` is defined yet)* | — |

## 11. Debug Mode & Temporary Execution Artifacts (added 2026-07-12, user-mandated)

Stages that drive a live browser or write throwaway scripts to accomplish their work (chiefly Stage 2 Explorer, Stage 4 Manual Execution, Stage 5 Automation's selector verification, Stage 6 Automation Execution) must not let that internal tooling leak into a project's permanent artifact tree. Only the **outputs** those stages are actually specified to produce (§4's Expected Artifacts per agent — Discovery snapshots/Findings/Coverage/QA Assessment Report, Automation packages, Execution Results/Evidence, Reports) belong under `platform_core_data/workspace/`.

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

**The platform generates automation inside a Run, but a Run is temporary — without a persistent baseline, generated automation is either lost to a growing pile of per-run folders, or, as happened here prior to this section, the process quietly reverses course and starts hand-editing one run folder's files in place across several later runs, defeating the "immutable run" model this pipeline otherwise enforces.** This section makes explicit what the Folder Structure diagram in [`platform_core_data/README.md`](../../platform_core_data/README.md) already implied but never operationalized: `platform_core_data/workspace/automation/{Framework}/` is the **Workspace Automation Baseline** — the single authoritative, persistent copy of the project's automation code — and every Run works from a **temporary working copy** of it, never the baseline directly.

### 12.1 Two locations

| Location | Path | Role |
|---|---|---|
| **Workspace Automation Baseline** | `platform_core_data/workspace/automation/{framework}/tests_{Framework}/` — e.g. `.../automation/shaft/tests_SHAFT/` | The authoritative, persistent copy of one Automation Package. Never edited directly during generation — only ever written by the Workspace Merge (§12.4). |
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

---

*This document defines the reusable pipeline only. It does not itself invoke any agent, and no stage described above has been run as part of producing this specification.*
