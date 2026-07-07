> **Position:** Outside the 6-stage Agent pipeline defined in [`pipeline/pipeline.md`](pipeline.md) and [`agents/`](../agents/). Run Scope is a **configuration concept, not an Agent and not a pipeline stage** — it does not add a stage to `pipeline/pipeline.md`'s Pipeline Overview, and this document does not alter that stage order, that count (still six), or any agent's Inputs/Allowed-Tools/Execution-Rules tables.
> **Relationship to existing concepts:** `agents/project_context_agent.md` §4 already lists "Run configuration" as a required input to Stage 1, described there as "modules in scope for this run, target environment URL, credentials/roles available, environment safety constraints." Run Scope is the formal name and structure for the *scope* portion of that existing input — it does not add a new input the Project Context Agent didn't already declare, and it does not change that agent's Purpose, Responsibilities, Execution Rules, or Expected Artifacts. This document also does not alter `pipeline/pipeline.md` §8's traceability chain; §6 below presents an extended, more granular view of the same Stage 1→3 handoff that document already describes, for use alongside it.
> **Scope of this revision:** This document defines the Run Scope concept only. No existing agent file, `pipeline/pipeline.md`, or any project artifact has been modified or generated as part of authoring it.

# 1. Concept Name

**Run Scope**

# 2. Purpose

Run Scope defines **exactly what a given pipeline run is allowed to validate** — the boundary the Project Context Agent narrows the approved Project Knowledge down to when producing that run's Project Context.

Without a named Run Scope concept, "what does this run cover" is answered ad hoc, differently, every time (as it already is today in each Project Context's free-text "Scope Summary" section — see `artifacts/OrangeHRM/context/OrangeHRM_ProjectContext.md` §1 for an example of this being worked out in prose per run). Run Scope exists so that the platform can support running against something narrower than "the entire project" — a single Epic, Feature, User Story, Bug, or an ad hoc requirement document — **without changing the pipeline, without adding an agent, and without changing how many stages exist.** The 6-stage pipeline already treats "what's in scope" as data it consumes (via the Project Context); Run Scope simply gives that data a name, a fixed set of Types, and a documented set of Sources.

# 3. Run Scope Types

A Run Scope is always exactly one of the following Types:

| Type | Meaning |
|---|---|
| **Entire Project** | No narrowing — the run validates against the full approved Project Knowledge scope (this is today's default/only behavior, e.g. `RUN-20260706-002`'s Login + PIM scope was itself a narrowing choice made in prose; "Entire Project" is the un-narrowed case). |
| **Epic** | The run validates everything under a named Epic (a grouping of Features/User Stories). |
| **Feature** | The run validates a single Feature and its constituent behavior. |
| **User Story** | The run validates a single User Story's acceptance criteria. |
| **Bug** | The run validates a specific reported defect — reproduction, and (once fixed) regression confirmation. |
| **Requirement Document** | The run validates whatever a specific supplied document defines — broader than one story, not necessarily the whole project (e.g., a short spec for a small change). |
| **Custom Scope** | Any scope that doesn't cleanly fit the above — described directly in the run configuration rather than pointing at a tracked work item. |

# 4. Run Scope Sources

A Run Scope Source is **how the content of a given Type is actually delivered** to the Project Context Agent. Sources and Types are independent axes — e.g., a **User Story** Type can be sourced from pasted text today, or from an Azure DevOps User Story ID once that integration exists.

## 4.1 Available now

| Source | How it works | Typical Types it feeds |
|---|---|---|
| **Entire Project** | No specific item supplied; the Project Context Agent scopes to the full approved Project Knowledge. | Entire Project |
| **Pasted text** | The Epic/Feature/Story/Bug description is pasted directly into the run configuration or the prompt given to the Project Context Agent. | Epic, Feature, User Story, Bug, Custom Scope |
| **Markdown file** | A `.md` file — e.g. under `projects/<Project>/resources/docs/` or `resources/notes/` — is referenced as the scope definition. | Feature, User Story, Bug, Requirement Document, Custom Scope |
| **Uploaded document** | A non-Markdown file (Word, PDF, etc.) is supplied out of band and referenced by path or attachment. | Requirement Document, Feature, Epic |
| **Requirement document reference** | A pointer to an existing document already in the project's knowledge (e.g., a specific section of the PRD, or a file under `resources/docs/`), rather than a newly pasted/uploaded one. | Requirement Document |
| **Custom scope description** | A free-form scope statement that doesn't reference any tracked item or document at all. | Custom Scope |

## 4.2 Future (integration-dependent — not implemented)

| Source | Status |
|---|---|
| **Azure DevOps User Story ID** | Future. Would resolve a work item ID via an Azure DevOps integration into a Run Scope of Type User Story. |
| **Azure DevOps Feature / Epic / Bug ID** | Future. Same integration, other work item types. |
| **Jira Story ID** | Future. Would resolve a Jira issue key via a Jira integration into a Run Scope of Type User Story. |
| **Jira Epic / Bug ID** | Future. Same integration, other issue types. |

These are documented as supported future input sources only. No Azure DevOps or Jira connectivity exists in this platform today, and none is implemented by this document.

# 5. Run Types

A **Run Type** is distinct from a Run Scope Type: it describes the *testing intent/depth* of the run, not *what subset of the product* it targets. The two are chosen independently, though some pairings are typical:

| Run Type | Meaning | Typical Run Scope pairing |
|---|---|---|
| **Full Regression** | Exercise everything currently in scope, at full depth. | Entire Project |
| **Smoke** | Exercise only critical paths, for a fast confidence check. | Entire Project (shallow) or a single Feature |
| **Feature** | Validate one Feature end to end. | Feature |
| **User Story** | Validate one User Story's acceptance criteria. | User Story |
| **Bug** | Reproduce a defect and/or confirm a fix via regression. | Bug |
| **Epic** | Validate everything under an Epic. | Epic |
| **Custom** | Whatever the accompanying Custom Scope defines. | Custom Scope |

Example: a **Smoke** run type can still be paired with an **Entire Project** Run Scope (shallow pass over everything) or a **Feature** Run Scope (shallow pass over one feature only) — Run Type and Run Scope Type compose rather than duplicate each other.

# 6. Relationship to Project Knowledge and Project Context

Per `projects/README.md`, `projects/<Project>/` is the **canonical, standing knowledge base** for a project — `onboarding.md`, `architecture.md`, `glossary.md`, `run_configuration.md`, and `resources/`. This does not change: Project Knowledge remains the durable source of what the project *is*, independent of any single run.

What changes conceptually is how the **Project Context** — the artifact `agents/project_context_agent.md` produces at `artifacts/<Project>/context/<Project>_ProjectContext.md` — is described:

```
Project Context  =  Project Knowledge  +  Run Scope
```

- **Project Knowledge** (`projects/<Project>/`) supplies the durable facts: what the application is, its architecture, its glossary, its available credentials/environments, and — via `run_configuration.md` — which Run Scope Sources are set up for this project at all.
- **Run Scope** (this document) supplies the narrowing: *which* Epic/Feature/Story/Bug/Requirement Document/Custom Scope, or the Entire Project, this particular run is validating.
- **Project Context** (`artifacts/<Project>/context/`) is what the Project Context Agent produces by applying a specific Run Scope to the standing Project Knowledge for one run, exactly as it already does today — its existing "Scope Summary," "Modules In Scope," and "Modules Out of Scope" sections (per `agents/project_context_agent.md` §8) are precisely where a resolved Run Scope materializes. No change to that document structure is introduced by this concept.

This reframing does not change the Project Context Agent's Inputs table (§4 of its spec already names "Run configuration" as required) — it clarifies that the scope portion of that input is now a structured Run Scope (Type + Source) rather than free text, and that Project Knowledge is the other half of what the agent reconciles.

**The approved Project Context remains the operational source of truth for the current run only** — per `pipeline/pipeline.md` §6 Rule 5, every downstream stage reads only the approved Project Context, never the PRD or Project Knowledge directly. A new Run Scope means a new Project Context version; it does not retroactively change any prior run's approved Project Context.

# 7. Where Run Scope Is Recorded

| What | Where | Persists across runs? |
|---|---|---|
| Which Run Scope Sources are available/set up for this project (e.g., "ADO not yet integrated," "requirement docs are pasted-text based") | `projects/<Project>/run_configuration.md` | Yes — durable, project-wide |
| Which specific Run Scope (Type + Source + resolved content) a given run actually used | That run's approved Project Context, `artifacts/<Project>/context/<Project>_ProjectContext.md` (its existing Scope Summary / Modules In Scope sections) | No — scoped to that run/version, per `pipeline/pipeline.md` §7 versioning rules |
| A quick-reference history of past runs' scope choices | `projects/<Project>/run_configuration.md` → "History of scope choices" table | Yes — an append-only log |

# 8. Extended Traceability Model

`pipeline/pipeline.md` §8 already defines the traceability chain from PRD through to the Final QA Report. With Run Scope named explicitly, and Discovery's Findings shown as their own link (already an Explorer Agent output — see `agents/explorer_agent.md` §5.11 and `pipeline/run_manager.md` §6's `findings/` workspace folder, just not previously drawn as a distinct node in the pipeline-level diagram), the fuller chain reads:

```
Project (Project Knowledge)
   └─▶ Run Scope
         └─▶ Project Context
               └─▶ Discovery
                     └─▶ Findings
                           └─▶ Manual Test Cases
                                 └─▶ Automation
                                       └─▶ Execution
                                             └─▶ Reporting
```

This is a more granular *view* of the same chain `pipeline/pipeline.md` §8 already documents (PRD → Project Context → Discovery Artifacts → Manual Test Suites → Traceability Matrix → Automation Scripts → Execution Results → Final QA Report) — it does not replace that section, add an artifact type that doesn't already exist, or change any stage's Input/Output contract. "Project" here stands in for the PRD + Project Knowledge that already feeds Stage 1; "Run Scope" is the newly named narrowing step described in §6 above; "Findings" names the Explorer Agent's existing per-observation evidence packages explicitly rather than leaving them implicit inside "Discovery Artifacts."

# 9. Future Integrations

The following are **documented as future integration targets only** — none are implemented, connected, or executed by this platform today:

| System | Role once integrated |
|---|---|
| **Azure DevOps** | Resolve a User Story / Feature / Epic / Bug work item ID into a Run Scope, per §4.2. |
| **Jira** | Resolve a Story / Epic / Bug issue key into a Run Scope, per §4.2. |
| **Xray** | Test management traceability sync — would let Manual Test Cases / Execution Results generated by this pipeline be reflected back into Xray against the originating Jira issue. |
| **TestRail** | Test management traceability sync — would let Manual Test Cases / Execution Results be reflected back into TestRail. |

Adding any of these integrations in the future is expected to extend §4.2 (new Sources) and this section, without requiring a new pipeline stage, a new agent, or a change to the six existing agents' Inputs/Outputs — a resolved Run Scope, regardless of where it came from, is still just data flowing into the same Stage 1 input the Project Context Agent already declares.

# 10. Non-Goals

To keep this concept's boundary unambiguous, Run Scope explicitly does **not**:

- Add a pipeline stage. The pipeline remains six stages, per `pipeline/pipeline.md` §3.
- Add a new agent. Resolving a Run Scope into a Project Context remains the Project Context Agent's job, per its existing spec.
- Change any agent's Inputs, Allowed Tools, Execution Rules, or Expected Artifacts tables.
- Implement Azure DevOps, Jira, Xray, or TestRail connectivity — §9 is documentation of future intent only.
- Change how an already-approved Project Context version is treated — `pipeline/pipeline.md` §7's versioning rules apply unchanged.

# 11. Example

*Illustrative only — not executed as part of this task.*

```text
Project:      OrangeHRM
Run Type:     User Story
Run Scope:
  Type:       User Story
  Source:     Pasted text
  Content:    "As an Admin, I want to filter the Employee List by
               Sub Unit so that I can quickly find employees in a
               given department."
```

Hypothetical result: the Project Context Agent reconciles this Run Scope against OrangeHRM's Project Knowledge (`projects/OrangeHRM/`) and the existing approved PRD, producing a new Project Context version scoped narrowly to the Employee List's Sub Unit filter behavior (PRD §5.2 FR-6) — rather than the broader Login + PIM scope of `OrangeHRM_ProjectContext.md` v2. No such run has actually occurred; this is shown only to make the Type/Source/Content shape concrete.
