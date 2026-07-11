# Agentic AI Testing Platform — Pipeline Specification

**Type:** Reusable pipeline orchestration specification
**Status:** Specification only — no stage, agent, or checkpoint in this document has been executed.
**Governs:** The six agents defined in [`agents/`](../agents/) — `project_context_agent.md`, `explorer_agent.md`, `test_design_agent.md`, `automation_agent.md`, `execution_agent.md`, `reporting_agent.md`.

---

## 1. Purpose

This document defines the **execution workflow** of the Agentic AI Testing Platform: the fixed order in which agents run, the artifacts that flow between them, and the human checkpoints that gate progression. The Agent Framework (`agents/`) specifies *what each agent does in isolation*; this Pipeline Specification defines *how those agents are wired together into one governed, repeatable process*.

The pipeline is project-agnostic. Running it against a new project means substituting `{{PROJECT_NAME}}` and supplying a new PRD/run configuration — the stage order, checkpoints, and rules below do not change.

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
                          └───────────────────┘
                                    │
                     ⛔ CHECKPOINT — Human Review Required ⛔
                                    │ (approved)
                                    ▼
                          ┌───────────────────┐
   Approved Manual ───────▶                   │
     Test Suites          │  STAGE 4           │──▶ Automation Scripts
   Project Context ───────▶  Automation Agent  │
                          └───────────────────┘
                                    │
                     ⛔ CHECKPOINT — Automation Approval Required ⛔
                                    │ (approved)
                                    ▼
                          ┌───────────────────┐
   Automation Scripts ────▶  STAGE 5           │──▶ Execution Results
                          │  Execution Agent   │──▶ Screenshots
                          └───────────────────┘──▶ Logs
                                    │              ──▶ Execution Metadata
                                    │ (no gate — mechanical run)
                                    ▼
                          ┌───────────────────┐
   Execution Results ─────▶                   │
   Traceability Matrix ───▶  STAGE 6           │──▶ Final QA Report
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

**Spec:** [`agents/project_context_agent.md`](../agents/project_context_agent.md)

| | |
|---|---|
| **Input** | PRD · Supporting Documents · Run Configuration |
| **Output** | Project Context |
| **Checkpoint** | **Human Review Required** |
| **Artifact path** | `projects/{{PROJECT_NAME}}/artifacts/context/{{PROJECT_NAME}}_ProjectContext.md` |

Notes:
- "Supporting Documents" (optional) covers any material that informs scope but is not itself the PRD — e.g., prior audit/QA reports, compliance policies, org-specific testing standards. These are folded into the Project Context alongside the PRD; they are never treated as a substitute source of requirements.
- This is the **only** stage in the pipeline permitted to read the PRD. Once its output is approved, the PRD is not re-consulted by any later stage.

### Stage 2 — Explorer Agent

**Spec:** [`agents/explorer_agent.md`](../agents/explorer_agent.md)

| | |
|---|---|
| **Input** | Project Context · Running Application |
| **Output** | Discovery Artifacts |
| **Checkpoint** | **Human Review Required** |
| **Artifact path** | `projects/{{PROJECT_NAME}}/artifacts/discovery/*.md`, `projects/{{PROJECT_NAME}}/artifacts/discovery/QA_Assessment_Report.md` |

Notes:
- "Running Application" is the live target system, reached through browser automation — it is data to be observed, not a source of requirements.
- Output includes the Gap Analysis (documented vs. observed) required by the Explorer Agent specification.

### Stage 3 — Test Design Agent

**Spec:** [`agents/test_design_agent.md`](../agents/test_design_agent.md)

| | |
|---|---|
| **Input** | Project Context (primary) · Discovery Artifacts (secondary) |
| **Output** | Manual Test Suites (Markdown) · Manual Test Suites (Excel) · Requirement Traceability Matrix |
| **Checkpoint** | **Human Review Required** |
| **Artifact path** | `projects/{{PROJECT_NAME}}/artifacts/test_design/{{PROJECT_NAME}}_TestCases_{Module}.md`, `...{Module}.xlsx`, `projects/{{PROJECT_NAME}}/artifacts/test_design/{{PROJECT_NAME}}_TraceabilityMatrix.md` |

Notes:
- Project Context governs *what* is tested; Discovery Artifacts only validate, enrich, and surface gaps — per the reversed primary/secondary relationship established in the Agent Framework.
- The Markdown and Excel test suites must never diverge — they are two renderings of one underlying test case set.

### Stage 4 — Automation Agent

**Spec:** [`agents/automation_agent.md`](../agents/automation_agent.md)

| | |
|---|---|
| **Input** | Approved Manual Test Suites · Project Context |
| **Output** | Automation Scripts |
| **Checkpoint** | **Automation Approval Required** |
| **Artifact path** | `projects/{{PROJECT_NAME}}/artifacts/automation/{{PROJECT_NAME}}_tests/`, `projects/{{PROJECT_NAME}}/artifacts/automation/{{PROJECT_NAME}}_AutomationSummary.md` |

Notes:
- The word "Approved" in the Input is load-bearing: this stage may only consume the Stage 3 artifacts *after* they have cleared the Stage 3 checkpoint, never a draft or in-progress test suite.
- "Automation Approval Required" is deliberately named differently from "Human Review Required" (see §5) because it gates the point at which generated code is authorized to later execute against a real environment.

### Stage 5 — Execution Agent

**Spec:** [`agents/execution_agent.md`](../agents/execution_agent.md)

| | |
|---|---|
| **Input** | Automation Scripts |
| **Output** | Execution Results · Screenshots · Logs · Execution Metadata |
| **Checkpoint** | *None — mechanical run, gated only by the Stage 4 Automation Approval that already occurred* |
| **Artifact path** | `projects/{{PROJECT_NAME}}/artifacts/execution/{{PROJECT_NAME}}_ExecutionResults.md`, `projects/{{PROJECT_NAME}}/artifacts/execution/artifacts/` |

Notes:
- Project Context remains a standing reference for this stage (target environment, credentials, safety constraints) even though it is not re-listed as a primary artifact input here — see §6, Rule 5. The Execution Agent's own specification requires it to confirm the target environment against the Project Context before running anything.
- Execution Metadata includes, at minimum, the Executed Test Case ID and Automation Script ID for every result, plus Execution Time — per the Execution Agent specification.
- No human checkpoint follows this stage: once automation is approved (Stage 4 gate), running it is a deterministic, repeatable operation, not a judgment call. Any judgment on the *results* happens in Stage 6.

### Stage 6 — Reporting Agent

**Spec:** [`agents/reporting_agent.md`](../agents/reporting_agent.md)

| | |
|---|---|
| **Input** | Execution Results · Traceability Matrix · Project Context |
| **Output** | Final QA Report |
| **Checkpoint** | *None — terminal stage, delivered to human stakeholders outside the pipeline* |
| **Artifact path** | `projects/{{PROJECT_NAME}}/artifacts/reporting/{{PROJECT_NAME}}_Final_QA_Report.md` |

Notes:
- The Traceability Matrix is consulted here specifically to compute Requirement Coverage and Automation Coverage, and to carry forward every Manual Test Suite "Assumption-based test" tag into a resolved (confirmed/refuted/unverified) status.
- This is the last stage. Its output is consumed by people, not by another agent — there is nothing downstream to gate.

## 5. Checkpoint & Approval Gates

The pipeline defines exactly two gate types. Both **stop the pipeline** until a named human explicitly approves — no agent may infer approval, time out into approval, or proceed on silence.

### 5.1 Human Review Required (Stages 1, 2, 3)

| Stage | Suggested Reviewer Role | Reviews For |
|---|---|---|
| 1 — Project Context | Business Analyst / Product Owner | Scope accuracy, correct in-scope/out-of-scope split, correct carried-forward assumptions |
| 2 — Discovery Artifacts | QA Lead | Exploration completeness within scope, correctness of the Gap Analysis, no unauthorized mutating actions taken |
| 3 — Manual Test Suites | QA Architect / Test Lead | Test case correctness, traceability completeness, appropriate use of Discovery for enrichment (not as an unauthorized requirements source) |

### 5.2 Automation Approval Required (Stage 4)

| Stage | Suggested Reviewer Role | Reviews For |
|---|---|---|
| 4 — Automation Scripts | Automation Lead / Release Manager | Selector robustness, correct skip/not-automatable reporting, environment safety (no unauthorized destructive actions scripted), no invented business logic |

This gate is named distinctly from "Human Review Required" because approving it authorizes code that will execute against a real environment in Stage 5 — a materially different risk than approving a document. Treat it as at least as strict as a production deployment approval, not as a lighter-weight variant of Stage 1–3 review.

### 5.3 Gate Mechanics

1. On completing its output, an agent stops and marks its artifact `Pending Review` (or `Pending Automation Approval` for Stage 4). It does not hand off to the next stage itself.
2. A human with the appropriate role (§5.1/§5.2) reviews the artifact against the criteria above.
3. **Approved:** the reviewer marks the artifact `Approved` (see §7 for the recommended mechanism) and the next stage's agent may now be invoked with that artifact as input.
4. **Rejected:** the pipeline halts at the current stage. The rejecting reviewer's feedback is attached to the artifact. The *same* agent that produced the rejected artifact re-runs, incorporating that feedback, against its original inputs — a rejection does not cascade back further up the pipeline unless the reviewer explicitly determines the fault lies in an upstream artifact (e.g., a flawed Project Context surfaced only once Test Design tried to use it), in which case the reviewer escalates to that earlier stage's checkpoint instead.
5. No stage may be invoked while its predecessor's checkpoint is open (`Pending`). This applies even if a human attempts to run a later stage manually — the orchestrator must refuse.

## 6. General Pipeline Rules

1. **Agents execute sequentially.** Stage *N+1* never starts before Stage *N* completes and, where applicable, clears its checkpoint.
2. **Every stage consumes artifacts from the previous stage(s).** No stage invents its own inputs or reaches past its declared Input list.
3. **No agent may skip a stage.** All six stages run, in order, on every full pipeline execution — even when a stage's output is small (e.g., zero defects), it still runs and produces its artifact.
4. **No downstream agent may read the PRD directly.** Only Stage 1 has the PRD in its Input list. This is enforced structurally, not just by convention: no other stage's Input table in §4 contains the PRD.
5. **Project Context is the Single Source of Truth.** From Stage 1 onward, every agent's understanding of "what the product should do" is scoped by the Project Context artifact — including Stage 5 and 6, which reference it for environment/safety and risk-resolution purposes even where it is not the headline input of that stage.
6. **Human approval gates must stop the pipeline until approval is granted.** See §5.3 — no silent timeouts, no auto-approval, no proceeding on an assumed "looks fine."
7. **All artifacts must be versionable.** See §7 — every artifact carries a version identifier and prior versions are retained, never overwritten in place.
8. **Every output must maintain traceability.** See §8 — every artifact from Stage 3 onward can be traced back, ID for ID, to the Project Context requirement (and, transitively, the PRD) that generated it.
9. **Project Isolation.** When onboarding or executing a project, agents must load knowledge exclusively from that project's own directory (`projects/{{PROJECT_NAME}}/`) and its corresponding artifacts (`projects/{{PROJECT_NAME}}/artifacts/`). Other projects under `projects/` may be consulted only as structural examples or templates (e.g., to see how a sibling project's `resources/` folder is laid out) — they must never contribute functional requirements, business rules, test cases, or domain knowledge to the project currently being worked on.

## 7. Artifact & Versioning Conventions

Every artifact produced by this pipeline lives under `projects/{{PROJECT_NAME}}/artifacts/` in the subdirectory conventions established in the Agent Framework (`context/`, `discovery/`, `Reports/`, `testcases/`, `Automation/`, `execution/`).

To satisfy Rule 7 (versionable artifacts) and Rule 6 (gates that truly stop the pipeline), each stage's artifact is versioned as follows:

- **Version-suffixed files:** each artifact is written with a version suffix, e.g. `{{PROJECT_NAME}}_ProjectContext.v1.md`, `.v2.md`, etc. A rejected-and-revised artifact is a new version, never an in-place edit of the rejected one — the rejected version remains on record.
- **A "current approved" pointer:** the unsuffixed filename referenced throughout the Agent Framework (e.g., `{{PROJECT_NAME}}_ProjectContext.md`) always refers to the **latest approved** version. It is only updated at the moment a reviewer approves a version — never before.
- **Run Manifest:** a single tracking artifact, `projects/{{PROJECT_NAME}}/artifacts/pipeline/{{PROJECT_NAME}}_RunManifest.md`, records for every stage: version number produced, timestamp, checkpoint status (`Pending Review` / `Pending Automation Approval` / `Approved` / `Rejected`), the approving reviewer, and a direct link to that version's artifact file. This manifest is the pipeline orchestrator's own source of truth for "where are we right now" and is what a human or orchestration tool consults before invoking the next stage.

## 8. Traceability Chain

Every artifact must be traceable, end to end, back through the chain that produced it:

```
PRD
 └─▶ Project Context
       ├─▶ Discovery Artifacts               (validates/enriches only)
       └─▶ Manual Test Suites (MD + Excel)
             └─▶ Requirement Traceability Matrix
                   └─▶ Automation Scripts
                         └─▶ Execution Results (+ Screenshots, Logs, Execution Metadata)
                               └─▶ Final QA Report
```

Concretely, this means:
- Every Manual Test Suite test case cites the Project Context requirement ID it covers (§4, Stage 3).
- Every Automation Script cites the Test Case ID it automates (Agent Framework, Automation Agent §7).
- Every Execution Result cites the Test Case ID *and* the Automation Script ID that produced it (Agent Framework, Execution Agent §3).
- The Final QA Report's Requirement Coverage and Automation Coverage sections walk this entire chain in reverse — from Execution Result back to Project Context requirement — to compute what was actually verified versus merely documented.

A gap anywhere in this chain (an artifact that cannot cite its predecessor) is itself a pipeline defect and must be surfaced at the next available checkpoint, not silently patched over.

## 9. Roles Summary

| Role | Responsible For |
|---|---|
| Business Analyst / Product Owner | Stage 1 checkpoint |
| QA Lead | Stage 2 checkpoint |
| QA Architect / Test Lead | Stage 3 checkpoint |
| Automation Lead / Release Manager | Stage 4 checkpoint |
| Pipeline Orchestrator (tooling, not a person) | Invoking each agent in order, enforcing §5.3 gate mechanics, maintaining the Run Manifest |
| All stakeholders | Consumers of the Stage 6 Final QA Report — no approval role, as this is the terminal artifact |

---

*This document defines the reusable pipeline only. It does not itself invoke any agent, and no stage described above has been run as part of producing this specification.*
