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

### 5.4 Automation Start Decision Gate (pre-flight — added 2026-07-12, user-mandated)

**Added after the orchestrator, during a real run, unilaterally decided to run Stages 1–4 in a single pass on a bare request to "run automation" — a judgment call it had no authority to make alone.** This gate runs *before* any stage is invoked or resumed, whenever a human asks for automation (Stage 4) or any other single downstream stage, for any project:

1. **Inspect, don't assume.** The orchestrator reads that project's Run Manifest (§7) and determines, per stage: does an Approved artifact exist? A Pending one? Nothing at all? It must not proceed on an assumption about what "probably" exists.
2. **Report the actual state plainly**, e.g.:
   ```
   Current project state
   ✓ Stage 1 — Approved
   ✓ Stage 2 — Approved
   ✓ Stage 3 — Approved
   ✗ Stage 4 — Not started
   ```
   or, for a project/scope with nothing yet: "No previous automation exists."
3. **Ask how to proceed** — present at minimum these options, and let the human choose (or specify something else via "Other"):
   1. Continue from the latest approved pipeline stage.
   2. Run the full pipeline from Stage 1.
   3. Generate automation directly (skip missing stages) — an explicit, human-authorized exception to §6 Rule 3's default "no skip" rule, never the orchestrator inventing scope or shortcuts on its own.
   4. Other.
4. **The orchestrator must never choose one of these on the human's behalf** — not even under a standing "minimize unnecessary decisions" or "drive forward automatically" directive elsewhere in this project's operating instructions. This is precisely the category of judgment call those directives are meant to exclude, not fold into "routine progress."

This does not weaken §6 Rule 3 in the normal, non-Spike case — it only makes explicit that a human-authorized partial or skip-ahead run is a distinct, deliberately chosen path each time, never an inferred default.

### 5.5 Human Decisions vs. Engineering Decisions (added 2026-07-12, user-mandated — applies to every stage, not only Stage 4)

**Not every judgment call an agent makes is a Human Decision.** §5.4 and `agents/automation_agent.md` §31–§33 added several legitimate human-in-the-loop gates; this section exists so those gates don't over-fire into ordinary engineering work that no stage's own spec requires a human to approve mid-flight (the Checkpoint & Approval Gates in §5.1–§5.2 already provide the real review point — this section is about what happens *before* that checkpoint, while an agent is still doing its own work).

**Human Decisions — always ask, never infer:**
- Which automation framework to use (§31)
- Continue an existing package/framework or create a new one (§31, §33)
- Which project/repository to target — including whether to generate inside the platform, export a compatible package, or modify an external Reference Automation Project directly (§32)
- Environment selection, when more than one is genuinely available for a run
- Executing any destructive or irreversible operation
- Business ambiguity — anything that would change the run's actual business objective or scope in a way a stakeholder would care about

**Engineering Decisions — make the call, document it, keep moving; never pause to ask:**
- Adding security-relevant test cases (e.g. anti-enumeration checks), boundary cases, empty-field variants, invalid-credential cases, validation-rule checks — ordinary Test Design Agent (Stage 3) work
- Marking a scenario Deferred / Requires Dedicated Environment because the current environment can't safely execute it (state why; never silently drop it, and never ask permission to defer it — see the "can't safely execute" rule below)
- Risk annotations, traceability updates, coverage-gap documentation
- Whether an adjacent, unrequested feature stays out of the current run's scope (e.g. Logout when only Login was asked for) — document it as "Out of Current Scope / potential future module" in the relevant artifact and continue; never pause execution to ask whether to fold an adjacent feature into scope unless doing so would change the run's business objective (a Human Decision, above)

**The "can't safely execute" rule:** when Discovery or Test Design identifies a scenario that cannot safely run against the current environment (e.g. a lockout/brute-force risk on shared staging), the agent does not ask what to do — it automatically creates the test case, marks it `Deferred` / `Requires Dedicated Environment`, states the reason, and continues with everything else. This extends the existing Coverage Gap / Stop Condition disclosure rules already present in `agents/explorer_agent.md` and `agents/test_design_agent.md` — it does not relax them, it clarifies that disclosure, not a question, is the correct response.

**Why:** the same day these gates were introduced, the user drew this line explicitly: "The platform should stop interrupting the workflow for engineering decisions. Reserve questions only for real human decisions." Confirmed concretely against an anti-enumeration test-case addition and an adjacent-scope (Logout) question — both are Engineering Decisions and should never have been asked about.

## 6. General Pipeline Rules

1. **Agents execute sequentially.** Stage *N+1* never starts before Stage *N* completes and, where applicable, clears its checkpoint.
2. **Every stage consumes artifacts from the previous stage(s).** No stage invents its own inputs or reaches past its declared Input list.
3. **No agent may skip a stage.** All six stages run, in order, on every full pipeline execution — even when a stage's output is small (e.g., zero defects), it still runs and produces its artifact.
4. **No downstream agent may read the PRD directly.** Only Stage 1 has the PRD in its Input list. This is enforced structurally, not just by convention: no other stage's Input table in §4 contains the PRD.
5. **Project Context is the Single Source of Truth.** From Stage 1 onward, every agent's understanding of "what the product should do" is scoped by the Project Context artifact — including Stage 5 and 6, which reference it for environment/safety and risk-resolution purposes even where it is not the headline input of that stage.
6. **Human approval gates must stop the pipeline until approval is granted.** See §5.3 — no silent timeouts, no auto-approval, no proceeding on an assumed "looks fine."
7. **All artifacts must be versionable.** See §7 — every artifact carries a version identifier and prior versions are retained, never overwritten in place.
8. **Every output must maintain traceability.** See §8 — every artifact from Stage 3 onward can be traced back, ID for ID, to the Project Context requirement (and, transitively, the PRD) that generated it.
9. **Project Isolation.** When onboarding or executing a project, agents must load knowledge exclusively from that project's own directory (`projects/{{PROJECT_NAME}}/`) and its corresponding artifacts (`projects/{{PROJECT_NAME}}/artifacts/`), plus Platform Knowledge (§10) — never from another project's directory. Other projects under `projects/` may be consulted only as structural examples or templates (e.g., to see how a sibling project's `resources/` folder is laid out) — they must never contribute functional requirements, business rules, test cases, or domain knowledge to the project currently being worked on.

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

## 10. Knowledge Architecture (added 2026-07-12, user-mandated — the canonical definition every agent references)

**The platform is not a single-project automation generator — it must support dozens of projects simultaneously, each with isolated knowledge, while still reusing genuinely cross-project engineering knowledge.** This section is the single source of truth for that model; every agent spec references it by number rather than restating it.

### 10.1 Two layers

| Layer | Location | Contains | Never contains |
|---|---|---|---|
| **Platform Knowledge** | `platform/knowledge/` | Reusable, application-agnostic engineering knowledge: automation strategies, repair strategies, diagnosis strategies, Confidence Engine rules, Execution Engine rules, framework best practices, synchronization patterns, locator recovery strategies, retry policies, reporting conventions, AI reasoning patterns, pipeline decision patterns, Execution Mode policies, shared engineering lessons | Anything application-specific (a named screen, a specific business rule, a specific app's redirect behavior) |
| **Project Knowledge** | `projects/{{PROJECT_NAME}}/knowledge_base/` | Knowledge discovered from that one application only: business rules, UI observations, application findings, known behaviors, module relationships, navigation knowledge, screen inventory, discovery artifacts, execution history, automation history, repair history, known workarounds, project-specific locator rules, lessons learned | Anything reusable enough to apply to a different project unmodified — that belongs in Platform Knowledge instead, via Promotion (§10.5) |

### 10.2 Knowledge Resolution

Whenever any agent needs knowledge to do its job, it resolves in this fixed order and merges both into its working context — never one layer alone:

1. **Platform Knowledge** (`platform/knowledge/`)
2. **Current Project Knowledge** (`projects/{{PROJECT_NAME}}/knowledge_base/`)

Project Knowledge *extends* Platform Knowledge; it never overrides or contradicts it silently — a project-specific finding that appears to contradict a Platform pattern is disclosed as a discrepancy, not silently substituted.

### 10.3 Structure — small versioned documents, not one giant file

Both layers are organized as small, individually-versioned documents, one concern per file — never a single growing markdown file. Each document carries a stable ID (e.g. `REPAIR-001` at the Platform layer, `REP-001` within a project's `repair/`) so it can be cited from other artifacts without re-stating its content.

Platform Knowledge subfolders: `automation_patterns/`, `diagnosis_patterns/`, `repair_patterns/`, `execution_patterns/`, `framework_patterns/`, `confidence_patterns/`, `reasoning/`, `reporting/`, `pipeline/`, `skills/`.

Project Knowledge subfolders (identical shape for every project, per §10.4): `automation/`, `diagnosis/`, `repair/`, `execution/`, `application/`, `ui/`, `findings/`, `business_rules/`, `lessons_learned/`.

Each top-level knowledge directory carries an `INDEX.md` (ID · Category · Title · Status · Path) so an agent can locate relevant knowledge without scanning every file's full content.

### 10.4 Automatic Project Scaffolding

Whenever a new project is created under `projects/`, its `knowledge_base/` tree (§10.3's project subfolder list, each with its own `INDEX.md`) is scaffolded automatically as part of project setup — no manual step, no exceptions, the same shape every time.

### 10.5 Promotion Workflow — explicit human approval only

Not every lesson learned on one project becomes Platform Knowledge. Whichever agent writes a new piece of knowledge (e.g. the Execution Agent writing a confirmed repair rule, per `agents/execution_agent.md` §28) writes it **only into the current project's `knowledge_base/`** by default. When that agent recognizes the lesson as reusable beyond this one application (generic locator recovery, a retry strategy, a synchronization strategy, a framework pattern, a diagnosis pattern — not an app-specific behavior like "NDC's dashboard redirect" or "OrangeHRM's Employee workflow"), it proposes promotion and asks exactly once:

> "This lesson appears reusable across multiple projects. Promote it to Platform Knowledge?"

- **Approved:** the agent authors a new (or updates an existing) Platform Knowledge document in the matching `platform/knowledge/` subfolder, generalized beyond the one project, and the project-level document is updated to reference it (§10.2's merge, made explicit) rather than duplicating its content.
- **Declined:** the knowledge stays exactly where it is, project-scoped, and is never silently re-proposed on every subsequent run of the same pattern — only when a *different* project independently produces the same pattern does the question resurface, since that is new evidence of reusability.

This is a Human Decision (`§5.5`), never inferred, never defaulted to "yes" because a pattern merely looks generic.

### 10.6 Isolation guarantee

Knowledge belonging to one project must never automatically appear inside another project's working context — this extends §6 Rule 9 (Project Isolation) to the knowledge layer explicitly. `projects/NDC/knowledge_base/` must never leak into `projects/OrangeHRM/` or any future project; only Platform Knowledge is shared, and only after passing the explicit Promotion Workflow above.

### 10.7 Agent read/write map

| Agent | Reads | Writes |
|---|---|---|
| Project Context Agent (Stage 1) | Platform Knowledge + current Project Knowledge | Project Knowledge (`business_rules/`, `application/`) as it establishes scope |
| Explorer Agent (Stage 2) | Platform Knowledge + current Project Knowledge | Project Knowledge (`findings/`, `ui/`, `application/`) |
| Test Design Agent (Stage 3) | Platform Knowledge + current Project Knowledge | Project Knowledge (`findings/`, `lessons_learned/`) where a design decision surfaces one |
| Automation Agent (Stage 4) | Platform Knowledge (`repair_patterns/`, `automation_patterns/`, `framework_patterns/`) + current Project Knowledge (`automation/`), per `agents/automation_agent.md` §11 | Project Knowledge (`automation/`) |
| Execution Agent (Stage 5) | Platform Knowledge (`repair_patterns/`, `diagnosis_patterns/`, `confidence_patterns/`) + current Project Knowledge (`repair/`, `diagnosis/`, `execution/`), per `agents/execution_agent.md` §28 | Project Knowledge (`repair/`, `diagnosis/`, `execution/`) by default; Platform Knowledge only via §10.5 Promotion |
| Reporting Agent (Stage 6) | Platform Knowledge (`reporting/`) + current Project Knowledge | — (terminal stage) |

## 11. Debug Mode & Temporary Execution Artifacts (added 2026-07-12, user-mandated)

Stages that drive a live browser or write throwaway scripts to accomplish their work (chiefly Stage 2 Explorer, Stage 4 Automation's selector verification, Stage 5 Execution) must not let that internal tooling leak into a project's permanent artifact tree. Only the **outputs** those stages are actually specified to produce (§4's Expected Artifacts per agent — Discovery snapshots/Findings/Coverage/QA Assessment Report, Automation packages, Execution Results/Evidence, Reports) belong under `projects/{{PROJECT_NAME}}/artifacts/`.

### 11.1 Debug Mode flag

A project- or run-level flag, **default `Off`**, recorded in that run's Project Context or `run_configuration.md` if ever turned on:

- **Debug Mode: Off (default).** Any script written purely to drive browser automation, probe a screen's structure, or otherwise accomplish a stage's work (e.g., a one-off Node/Playwright script) must be written to a temporary location outside the project tree (the platform's scratchpad, or an OS temp directory) and **deleted immediately after the run extracts what it needs from it**. Raw tool-output dumps (full-page JSON captures, unfiltered element enumerations) are never written into `artifacts/` — only the synthesized, human-readable artifact the stage is actually specified to produce.
- **Debug Mode: On.** Explicitly enabled by the user for active troubleshooting of the tooling itself (not of the application under test). When on, intermediate scripts and raw result dumps may be persisted, but only under a clearly separated `_debug/` subfolder within that run's workspace (e.g. `artifacts/runs/{{RUN_ID}}/_debug/`) — never mixed into `discovery/`, `automation/`, `execution/`, etc. — and the run's manifest entry must note Debug Mode was on, so a reviewer isn't confused about why extra files exist.

### 11.2 What counts as a permanent artifact vs. debug scaffolding

- **Permanent:** a Discovery snapshot, a Finding and its Evidence Package, the QA Assessment Report, Timeline, Coverage Summary, Test Design outputs, an Automation package, Execution Results/evidence, the Final QA Report — i.e., anything §4/Expected-Artifacts tables across the agent specs actually name. A screenshot that documents an in-scope screen as part of a Discovery snapshot or a Finding's evidence is permanent.
- **Debug scaffolding, never persisted by default:** the Node/Playwright (or other) script used to drive the browser to get that screenshot; raw, pre-synthesis JSON dumps of every element on a page; one-off reconnaissance screenshots taken only to verify navigation/tooling before the real discovery pass, not to document an application screen.
- When in doubt whether a given file is a deliverable or scaffolding, ask: "Does an agent spec's Expected Artifacts table name this?" If not, it does not belong in `artifacts/`.

### 11.3 Retroactive scope

This rule governs all runs from 2026-07-12 onward. Pre-existing debug scripts/raw dumps left in earlier runs' artifact folders (e.g., `_login_discovery.js` and its `_results.json` under RUN-20260712-001) are not automatically deleted by this section — cleaning up a prior, already-approved run's artifacts is a separate decision to confirm with the user, not an automatic side effect of adopting this rule.

This must remain a permanent platform capability, not a one-off built for any single project — every future project (OrangeHRM, Banking, ERP, or otherwise) loads Platform Knowledge plus its own Project Knowledge, with no architectural change required.

---

*This document defines the reusable pipeline only. It does not itself invoke any agent, and no stage described above has been run as part of producing this specification.*
