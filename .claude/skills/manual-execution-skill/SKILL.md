---
name: manual-execution-skill
description: Stage 4 of 7 in the Agentic AI Testing Platform pipeline. Executes the approved Manual Test Suite against a target environment, records raw structured Manual Execution Results with full Result Classification and Evidence, and identifies Automation Candidates from successful, stable executions for the Automation skill to consume. Use when validating manually-designed test cases against a live application before committing automation effort to them.
inputs:
  - name: manual_test_suite
    type: file_path
    required: true
    description: Approved Manual Test Suite (Markdown + Excel) from the Test Design skill — the test cases to execute.
  - name: traceability_matrix
    type: file_path
    required: true
    description: Approved Requirement Traceability Matrix — carried through unmodified onto Manual Execution Results and the Automation Candidate Package.
  - name: coverage_report
    type: file_path
    required: true
    description: Approved Coverage Report — informs which test cases Test Design already excluded/dispositioned, so this skill doesn't attempt to execute what Stage 3 already marked out of scope.
  - name: project_context
    type: file_path
    required: true
    description: Target environment, credentials, and safety constraints.
outputs:
  - name: manual_execution_results
    type: file_path
    location: "platform_core_data/runs/{{RUN_FOLDER}}/manual_execution/ManualExecutionResults.md"
    description: Structured per-test-case results, Evidence Inventory, and full Result Classification.
  - name: manual_execution_summary
    type: file_path
    location: "platform_core_data/runs/{{RUN_FOLDER}}/manual_execution/ManualExecutionSummary.md"
    description: Consolidated run-level summary — what was executed, headline outcome figures, Known Limitations.
  - name: automation_candidate_package
    type: file_path
    location: "platform_core_data/runs/{{RUN_FOLDER}}/manual_execution/AutomationCandidatePackage.md"
    description: The specific, execution-confirmed test case IDs judged successful and stable enough to hand to the Automation skill, each cited back to its Manual Test Suite/Traceability Matrix entry.
  - name: manual_execution_artifacts
    type: file_path
    location: "platform_core_data/runs/{{RUN_FOLDER}}/manual_execution/artifacts/"
    description: Captured screenshots, videos, notes, and logs.
dependencies:
  - test-design-skill (upstream skill)
  - Platform Browser Driver Layer (`tools/browser_driver/`), for executing UI steps against the live environment
---

> **Pipeline position:** Stage 4 of 7 — consumes the approved Manual Test Suite, Requirement Traceability Matrix, and Coverage Report, produces raw Manual Execution Results and the Automation Candidate Package.
> **Traceability:** `Manual Test Case → Manual Execution Result → Automation Candidate`.
> **Revision history:** see `docs/CHANGELOG.md`.
>
> **Revision note (2026-07-27, user-mandated):** artifacts now live in this run's own Run Folder (`platform_core_data/runs/{{RUN_FOLDER}}/{stage}/`) — `platform_core_data/workspace/` is removed — and each artifact is **one file, edited in place**: no `.vN` suffixes, and **no duplicate "final" copy is ever written on approval**. Refinement edits the same file the reviewer read. Git is the version history. See `workflows_and_pipelines/pipeline/pipeline.md` §7.

# 1. Skill Name

**Manual Execution skill** — v1

# 2. Purpose

The Manual Execution skill runs the approved Manual Test Suite — exactly as the Test Design skill authored it — against a target environment, and produces a raw, unedited, structured record of what actually happened: pass/fail/blocked status, evidence, and failure detail, per test case. It exists to answer one question before any automation effort is spent: *does this manually-designed test case actually hold true against the live application, reliably?*

**Its second responsibility is narrower and just as important: identifying which successfully, stably executed test cases are worth automating**, and packaging exactly those — never the whole suite by default — as the Automation Candidate Package the Automation skill consumes. A test case that failed, was blocked, or produced an inconsistent outcome this run is never included as a candidate, regardless of how well-written the manual test case itself is.

**This skill does not automate anything and does not decide what gets automated.** Identifying a test case as an Automation Candidate is an evidence-based observation about *execution stability*, not a binding automation decision — that decision (Reuse Existing Automation / Generate New Automation / Partially Automatable / Manual Only) remains exclusively the Automation skill's own authority, per `.claude/skills/automation-skill/SKILL.md` §13, applied only to the candidates this skill hands it.

**This skill does not execute automated test suites.** Running a generated automation package against an environment is exclusively the Automation Execution skill's responsibility (Stage 6) — the two skills never overlap: this skill executes manually-designed test cases before automation exists for them; the Automation Execution skill executes automation code after it exists.

# 3. Responsibilities

- **Execute manual test cases generated by the Test Design skill** — exactly as authored (Steps, Test Data, Expected Result, per `.claude/skills/test-design-skill/SKILL.md` §6) — never inventing, skipping, or reinterpreting a step to make it easier to pass.
- **Validate preconditions before execution** (§5) — confirm the test case's stated Preconditions (login state, data state, role) actually hold before running its Steps; a test case whose preconditions cannot be met is `Blocked`, never force-run against an unmet precondition.
- **Execute tests on the target environment** named in the Project Context, using the Platform Browser Driver Layer (`tools/browser_driver/`) the same way the Explorer skill does — but **headed, not headless** (§11.1), so a human can watch each interaction happen live — confirming the target environment matches what the Project Context expects before running anything.
- **Record execution results** for every test case: Status, Execution Time, and, on failure/block, the specific step and observed-vs-expected discrepancy.
- **Capture execution evidence** (§7) — screenshots, videos, notes, and logs where applicable — and name explicitly what wasn't captured and why, never a silent gap.
- **Classify every result** using exactly the Result Classification set (§8): Passed, Failed, Blocked, Skipped, Not Executed, Inconclusive.
- **Generate a Manual Execution Summary** — a run-level narrative and headline figures, distinct from the raw per-test Manual Execution Results.
- **Identify Automation Candidates** (§9) based on successful and stable manual executions only — never a test case that failed, was blocked, or produced an inconsistent outcome this run.
- **Produce an Automation Candidate Package** (§9.3) — the specific, execution-confirmed test case IDs, cited back to the Manual Test Suite and Traceability Matrix, that the Automation skill consumes as its primary scope-determining input.
- Never modify the approved Manual Test Suite, Traceability Matrix, or Coverage Report — a test case that appears wrong or outdated is escalated as a discrepancy for Stage 3 to address, never silently corrected here.
- Never execute a test case's mutating actions against an environment the Project Context has not explicitly marked safe for them.
- **Adapt execution strategy to the run's Run Scope and Run Type** (§17), consistent with the same Run Scope model every other stage uses.
- **Produce output conforming to the Standard Output Contract** (§10) so the Automation skill never has to interpret free-form prose to find what it needs.
- **Recognize named Stop Conditions** (§18) and, rather than halting the entire run over one blocked test case, recommend the smallest corrective action (§19) while continuing to execute every other unaffected test case.
- **Verify handoff completeness in both directions** (§20) — confirm every input the Test Design skill's output actually provides is used correctly, and confirm every input the Automation skill's own specification declares it needs from this stage is present.

# 4. Inputs

| Input | Role | Required? | Description |
|---|---|---|---|
| Manual Test Suite | **Primary** | Required, must be `Approved` | `platform_core_data/runs/{{RUN_FOLDER}}/test_design/TestCases_*.md` and `.xlsx` — the exact test cases to execute; this skill never adds, removes, or reinterprets a case |
| Requirement Traceability Matrix | Secondary | Required, must be `Approved` | `platform_core_data/runs/{{RUN_FOLDER}}/test_design/TraceabilityMatrix.md` — carried through unmodified onto every Manual Execution Result and the Automation Candidate Package |
| Coverage Report | Secondary | Required, must be `Approved` | `platform_core_data/runs/{{RUN_FOLDER}}/test_design/CoverageReport.md` — read for its Coverage Gaps (§18 of `.claude/skills/test-design-skill/SKILL.md`) and advisory Automation Candidates (§18 #11 there), which this skill treats only as a starting hint to prioritize, never as a substitute for this skill's own execution-based confirmation |
| Project Context | Governing | Required, must be `Approved` | `platform_core_data/runs/{{RUN_FOLDER}}/context/ProjectContext.md` — target environment, credentials, and safety constraints that govern which test cases' mutating actions may actually be executed |
| Run Scope | Governing (embedded) | Required | Not a separate file — the Type/Source recorded in the Project Context's own Scope Summary (`workflows_and_pipelines/pipeline/run_scope.md` §3–§4). Drives §17's strategy selection. |

**Every input above must be in an `Approved` checkpoint state before this skill consumes it.** If any required input is still `Pending Review`, `Pending Automation Approval`, or `Rejected`, this skill halts and reports the blocking artifact rather than executing against a draft.

**This skill must never read the PRD directly** — only Stage 1 (Project Context skill) is permitted to, per `workflows_and_pipelines/pipeline/pipeline.md` §6 Rule 4. A test case whose expected result appears wrong is a discrepancy to log against Test Design, never a reason to independently consult the PRD.

# 5. Precondition Validation

Before executing a test case's Steps, this skill confirms its stated Preconditions (§6 of `.claude/skills/test-design-skill/SKILL.md` — login state, data state, role) actually hold in the target environment:

- If a precondition can be established directly (e.g., logging in as the stated role) as part of ordinary setup, this skill does so and proceeds.
- If a precondition cannot be established — required seed data is absent, a prior test case in a dependent chain hasn't run, the stated role/credential doesn't exist in this environment — the test case is classified `Blocked` (§8), never force-run against an unmet precondition and never silently marked `Skipped` instead (Blocked and Skipped are distinct, per §8).

# 6. Environment Awareness

This skill confirms the target environment matches what the Project Context expects before executing anything — the same environment-match discipline every execution-capable stage in this pipeline applies (`.claude/skills/automation-execution-skill/SKILL.md` §14). It never executes a test case's mutating actions against an environment the Project Context has not explicitly marked safe for them; an unauthorized mutating action is `Skipped`, with the environment constraint named as the reason.

# 7. Evidence Collection

For every executed test case, this skill captures, wherever applicable, and names explicitly what wasn't captured and why:

| Evidence Type | When applicable |
|---|---|
| Screenshots | At minimum on failure/block; ideally also on key steps |
| Videos | Where the environment/tooling supports session recording |
| Notes | Free-text observations a screenshot alone doesn't capture — e.g., a subjective UI judgment, timing behavior, or an ambiguity worth flagging to Test Design |
| Logs | Console/network logs, where the target application and tooling expose them |

Evidence is stored under `platform_core_data/runs/{{RUN_FOLDER}}/manual_execution/artifacts/` and referenced by path from the Manual Execution Results' Evidence Inventory (§10).

# 8. Result Classification

Every test case executed gets exactly one classification:

| Status | Meaning |
|---|---|
| **Passed** | The test case executed and its Expected Result was observed exactly as stated. |
| **Failed** | The test case executed and the observed result did not match the Expected Result — a genuine, reproducible discrepancy. |
| **Blocked** | A stated Precondition (§5) could not be established — distinct from Skipped (a deliberate decision) and from Failed (it ran and didn't pass). |
| **Skipped** | The test case was deliberately not executed (e.g., its mutating action is not authorized for this environment, per §6) — a decision, not a failure. |
| **Not Executed** | The test case was in scope but the run ended (time limit, environment failure, manual stop) before reaching it. |
| **Inconclusive** | The test case was executed but produced a result this skill cannot confidently classify as Passed or Failed (e.g., a genuinely ambiguous UI state) — reported as such, never forced into Passed or Failed. |

A `Failed`, `Blocked`, `Not Executed`, or `Inconclusive` result is never, by itself, treated as an Automation Candidate exclusion reason that goes unstated — every non-Passed result carries its reason in the Manual Execution Results (§10).

# 9. Automation Candidate Identification

## 9.1 Qualifying criteria

A test case qualifies as an Automation Candidate only when **all** of the following hold:

1. Its Status this run is `Passed` (§8) — a Failed, Blocked, Skipped, Not Executed, or Inconclusive result never qualifies.
2. Its Steps and Expected Result are deterministic and objectively verifiable — a test case whose Expected Result requires subjective human/visual judgment (rather than an assertable state) is excluded, however well it executed, and noted as a Manual-Only characteristic for the Automation skill's own awareness.
3. Where this skill executed the same test case more than once within this run (e.g., a re-validation), every execution agreed on the outcome — a test case that passed once but produced a different outcome on a repeat execution is excluded as **Not Stable**, with both outcomes cited, never silently included on the strength of its best result.
4. It is not a test case Test Design (§5.3 of `.claude/skills/test-design-skill/SKILL.md`) already dispositioned as an **Exploratory test** against a Finding — an exploratory disposition means the right resolution depends on ongoing human judgment, which this skill does not override.

## 9.2 Relationship to Test Design's advisory flag

Test Design's own Coverage Report already carries an advisory, non-binding **Automation Candidates** hint (`.claude/skills/test-design-skill/SKILL.md` §18 #11). This skill treats that hint only as a prioritization signal for which test cases to execute first — it never substitutes for, or is copied directly into, this skill's own Automation Candidate Package. Inclusion in this skill's package is always evidence-based on an actual execution outcome (§9.1), never inherited from a pre-execution guess.

## 9.3 Automation Candidate Package

The package lists, for every qualifying test case: its Test Case ID, Requirement/Discovery/Finding/Evidence References (carried unmodified from the Traceability Matrix), the Manual Execution Result(s) that confirmed it, and the specific Manual Test Suite file/module it lives in — enough for the Automation skill to locate the full test case content without this skill duplicating it. A test case that does not qualify is never included, but its exclusion reason is recorded in the Manual Execution Summary (§10 #2) so a reviewer can see why the candidate set is narrower than the full suite.

# 10. Standard Output Contract

The Manual Execution Results and Manual Execution Summary artifacts must together contain exactly these sections, so the Automation skill never has to interpret free-form prose to extract what it needs:

| # | Section | Artifact | Must contain, at minimum |
|---|---|---|---|
| 1 | **Execution Metadata** | Results | Execution ID, Run Scope/Run Type (§17), environment, timestamps |
| 2 | **Execution Summary** | Summary | One-paragraph narrative: what was executed, overall outcome, headline pass/fail/blocked figures, and the count/reason of every test case excluded from the Automation Candidate Package |
| 3 | **Per-Test Results** | Results | Test Case ID, Status (§8), Execution Time, Evidence Inventory references, failure/block detail where applicable — every `Failed`/`Inconclusive` case follows the Defect Documentation Standard (§10.1) in full, not a one-line summary |
| 4 | **Evidence Inventory** | Results | Every evidence type captured (§7), per test case, with paths, and every gap with a reason |
| 5 | **Automation Candidates** | Summary + Candidate Package | The qualifying criteria applied (§9.1) and the resulting list, cross-referenced to the standalone Automation Candidate Package artifact |
| 6 | **Known Limitations** | Summary | Anything this execution could not fully verify (e.g., a Blocked precondition, a Skipped mutating action) and why |
| 7 | **Recommendations** | Summary | The corrective actions recommended per §19 for any blocked/failed item |
| 8 | **Inputs for Automation skill** | Summary | The explicit handoff package per §20 — confirmation that every input `.claude/skills/automation-skill/SKILL.md` §4 declares it needs from this stage is present |

## 10.1 Defect Documentation Standard (Failed / Inconclusive test cases)

**Per explicit user instruction (2026-07-25):** every `Failed` or `Inconclusive` test case's entry in the Per-Test Results (§10 #3) must be written to this standard — professional, complete-sentence, ready to paste directly into Jira/Azure DevOps without further editing. A one-line "expected: X, actual: Y" note is never sufficient for a non-Passed result.

**Required sections, in this order, for every Failed/Inconclusive test case:**

1. **Test Case ID**
2. **Execution Status** (§8's classification)
3. **Execution Time**
4. **Preconditions** (if relevant to how the defect manifested)
5. **Test Data**
6. **Steps Performed** (brief — the actual sequence executed, not the Test Design steps restated verbatim)
7. **Expected Result** — a complete, professional statement naming the requirement/business rule that should have governed the outcome, not a fragment. ("Blocked" alone is insufficient — state *why* it should be blocked.)
8. **Actual Result** — a complete, professional statement of what was actually observed, including the specific condition that let the actual behavior occur.
9. **Impact** — the concrete user/business consequence (see Business Impact below).
10. **Classification** (see Classification below) — Category, Layer, Reproducibility, Regression, Suspected Component, Confidence.
11. **Root Cause Analysis** (when it can be reasonably inferred from what was observed) — a plausible implementation explanation, always hedged (see Root Cause below). Omit this section entirely, rather than guessing, when no reasonable inference is possible from what was observed.
12. **Conclusion** — a concise statement of the actual defect, not a repetition of the execution result.
13. **Severity** (Critical/High/Medium/Low) with a one-line justification.
14. **Priority** (P0/P1/P2/P3).
15. **Evidence** — file references per §7/§10 #4.

**Defect writing guidelines — do not simply state what happened. Explain:**
1. What business rule or requirement is being violated.
2. Why the observed behavior is incorrect.
3. Under which conditions the issue occurs (if the defect is conditional, state the conditions explicitly — never imply it's unconditional when it isn't).
4. The user/business impact.
5. Whether the issue is a UI problem, validation problem, business logic issue, workflow issue, security issue, data integrity issue, or documentation mismatch — classify it explicitly.

**Expected vs. Actual — write as complete professional statements, not fragments.**

Bad: `Expected: blocked. Actual: submitted.`

Good:
> **Expected Result:** The system should prevent submission because the Product Access section contains mandatory fields, and at least one Product Access configuration is required before creating an Agency.
>
> **Actual Result:** The Agency was successfully created even though no Product Access entry was added. Validation was not triggered because the entire Product Access section was skipped.

**Classification — a fixed six-field block, always present, even when a field's honest answer is "Unknown" or "Not applicable."** Never omit a field to avoid an uncertain answer — an honest "Unknown" is correct output, a missing field is not.

| Field | Values | Guidance |
|---|---|---|
| **Category** | Validation / UI / Workflow / Authorization / Business Rule / Data Integrity / Performance / Security | The technical nature of the defect. Prefer the most mechanically precise category over the broadest applicable one — e.g. a missing "at least one required" check is `Validation` even though the underlying rule is a business rule; a decision-reversal path that shouldn't exist is `Workflow`, not `Validation`. |
| **Layer** | Frontend / Backend / API / Database / Integration / Unknown | Where the defect is suspected to live, based only on what was actually observed (e.g., a client-side condition that never fired vs. a value that round-tripped to the backend and was persisted). Use `Unknown` rather than guessing when the evidence doesn't distinguish layers. |
| **Reproducibility** | Always / Intermittent / Unable to confirm | Based strictly on how many times this run actually observed the behavior — `Always` requires at least two independent observations agreeing (consistent with the Automation Candidate "stability" bar, §9.1 #3); a single observation is `Unable to confirm`, not `Always`. |
| **Regression** | Yes / No / Unknown | Whether this behavior is newly broken vs. a prior confirmed-working state. Default to `Unknown` unless a prior run's Discovery/execution evidence directly establishes the behavior once worked differently — never infer regression status from absence of prior testing. |
| **Suspected Component** | Free text, or "N/A" | Name the specific screen/form/control/service suspected, when inferable from what was observed (e.g., "Add/Update Agency form's Product Access FormArray validator"). Use "N/A" when no component can be responsibly named — never invent a component name to fill the field. |
| **Confidence** | High / Medium / Low | Confidence in the *defect's existence* as observed (not in the Root Cause guess, which is separately hedged) — `High` when multiple independent observations agree and the observed behavior itself is unambiguous; `Low` when the finding rests on a single observation, an inference from a different test case, or a test-execution limitation muddied the result (as with an Inconclusive case). |

For an **Inconclusive** case where no defect was actually confirmed, most Classification fields should honestly read "Not applicable" / "Unable to confirm" / "Unknown" / "N/A" rather than being framed as if a defect were confirmed — see `TC-AGENCY-CREATE-032` in `runs/RUN-20260725-001/manual_execution/ManualExecutionResults_Agency.md` §2.2 for a worked example.

**Root Cause Analysis — infer the likely implementation issue whenever possible, but never present an assumption as a fact.** Use hedging language explicitly: *Likely*, *Appears to*, *Based on the observed behavior*. Example: "Likely validation is executed only after a Product Access row is created, while no validation exists for an entirely empty Product Access collection."

**Impact — always explain why the issue matters**, e.g.: users can create invalid Agency configurations; required business rules are bypassed; invalid data may reach downstream workflows; the approval workflow becomes inconsistent; security restrictions can be bypassed.

**Severity — recommend a severity with a short justification**, e.g.: "Severity: High. Reason: Mandatory validation can be bypassed, allowing invalid Agency configurations to be persisted."

**Conclusion — end every Failed/Inconclusive entry with a concise statement of the actual defect**, distinct from and beyond a restatement of the execution result.

**General writing rules:** clear professional English, complete sentences, no vague wording, no repeated information across sections, facts clearly separated from assumptions (via the hedging language above), and application defects explicitly distinguished from documentation gaps and test-data issues — a Test Design AC that turns out to be wrong is a documentation gap, not an application defect, and must be labeled as such rather than folded into the same defect narrative.

# 11. Allowed Tools

- A live browser mechanism to execute each test case's Steps against the live environment — the same execution mechanism the Explorer skill uses for live investigation, here driven by Test Design's authored Steps rather than free exploration. **Two selectable peers** (`platform_core/tools/mcp/README.md` §1.1–§1.2): the **Platform Browser Driver Layer** (`platform_core/tools/browser_driver/`) — the default, and strongly preferred here, because executing authored Steps is repeatable, credential-aware work the driver is built for — or the **`playwright` MCP server**, appropriate only where a Step reaches a screen with no Screen/Component Knowledge yet, or where the driver is unavailable for a reason unrelated to the application. A credential value is **never** typed into an MCP tool call (`mcp/README.md` §1.3): authenticate via `BrowserDriver.authenticate()`, then execute the remaining Steps against that authenticated session. Each executed test case records which mechanism produced its evidence.
- File tools: Read (Manual Test Suite, Traceability Matrix, Coverage Report, Project Context), Write (Manual Execution Results, Manual Execution Summary, Automation Candidate Package, evidence files)

**Not permitted:** writing or editing automation code of any kind, executing an already-generated Automation Package (that is the Automation Execution skill's responsibility, Stage 6), editing the Manual Test Suite/Traceability Matrix/Coverage Report/Project Context/PRD, or executing any test case's mutating actions against an environment not explicitly marked safe for them.

## 11.1 Headed Browser — Required for This Skill

**This skill runs the browser headed (visible), not headless.** It is the one deliberate exception to the platform-wide headless default (`platform_core/tools/mcp/README.md` §1.1.1, which the Explorer skill follows per its own §10). The reason is specific to Stage 4's purpose: this stage exists so a human can *watch* authored Steps being executed against the live application and judge, in real time, whether the observed behavior actually matches the Expected Result — including the timing, transient, and visual-state behavior (§7's "Notes" evidence type, §9.1 #2's subjective-judgment exclusion) that a post-hoc screenshot does not preserve. A headless run of this stage would produce the same artifacts while removing the live human observation the stage is designed around.

**How to run headed, per mechanism:**

| Mechanism | How to run headed |
|---|---|
| **Platform Browser Driver** (default, strongly preferred) | **Pass `stage: 'manual_execution'`** — e.g. `BrowserDriver.authenticate({ env, stage: 'manual_execution' })`. The profile's `browser.headlessByStage` maps that stage to `false`, so the driver launches headed on its own; no call site has to remember `headless: false`. Passing an explicit `headless: true` would still override it — never do so in this skill. |
| **`playwright` MCP server** (fallback only, per §11) | The server is registered in the repo-root `.mcp.json` with a hard-coded `--headless` flag, which a tool call cannot override at runtime. A headed MCP run therefore requires a human operator to remove `--headless` from `.mcp.json` and restart the MCP server. This skill must not edit `.mcp.json` itself — that file is outside this skill's write scope (§11 "Not permitted"). |

**When headed is genuinely unavailable** — no display/session is attached (a CI runner, a headless container), or the operator has not enabled headed mode for the MCP fallback — this skill does **not** halt. It proceeds headless and records the fact explicitly in the Manual Execution Results' Execution Metadata (§10 #1) and in Known Limitations (§10 #6), naming which mechanism ran headless and why. Evidence capture is unaffected either way (screenshots, DOM, console, and network are captured identically), so a headless fallback run changes no result's Status (§8) and no Automation Candidate's qualification (§9.1) — the only thing lost is live human observation, which is what the Known Limitations entry must say.

# 12. Execution Rules

1. Must execute test cases exactly as the Test Design skill authored them — no invented, skipped, or reinterpreted steps.
2. **Must validate every stated Precondition before executing a test case's Steps** (§5) — an unmet precondition is `Blocked`, never force-run.
3. Must confirm the target environment matches the Project Context before executing anything; halt and report on mismatch.
4. Must not execute any test case's mutating actions against an environment not explicitly marked safe for them — classify as `Skipped` with the constraint named.
5. Must record every test case's outcome — no silent omissions. A test case that cannot run must be logged with an explicit reason.
6. **Must classify every result using the full six-state Result Classification** (§8) — never collapse Blocked/Skipped/Not Executed/Inconclusive into a bare Pass/Fail.
7. **Must produce a structured Evidence Inventory** (§7, §10) naming every evidence type captured and every one that could not be, with a reason.
8. Must never modify the Manual Test Suite, Traceability Matrix, or Coverage Report — a test case that appears wrong is escalated as a discrepancy for Stage 3, never silently corrected here.
9. **Must apply the Automation Candidate qualifying criteria in full** (§9.1) before including any test case in the Automation Candidate Package — a Failed, Blocked, Not Executed, Inconclusive, subjective, or Not Stable test case is never included.
10. **Must never treat Test Design's advisory Automation Candidates hint as a substitute for this skill's own execution-based confirmation** (§9.2).
11. Must timestamp and uniquely identify each run so results are never ambiguous about which execution they came from.
12. **Must select the Execution Strategy matching this run's Run Scope and Run Type** (§17) — never apply one default "execute everything" behavior regardless of scope.
13. **Must produce output conforming to the Standard Output Contract** (§10).
14. **Must recognize the named Stop Conditions** (§18) and, for any condition with a Local scope, continue executing every other unaffected test case rather than halting the whole run — and must recommend the smallest corrective action for every blocked/failed item (§19).
15. **Must verify Handoff completeness in both directions** (§20) before treating a run's outputs as finished.
16. Must never execute an automated test suite or write automation code — that is exclusively the Automation skill's (generation) and Automation Execution skill's (running) responsibility.
17. **Must never read the PRD directly.** Only Stage 1 may do so (`workflows_and_pipelines/pipeline/pipeline.md` §6 Rule 4).
18. **Must never consume an input artifact that is not itself `Approved`** at its own pipeline checkpoint (§4).
19. **Must run the browser headed, so each interaction is visible live** (§11.1) — this is the skill's normal behaviour, not an opt-in. Pass `stage: 'manual_execution'` to `BrowserDriver.authenticate()` and the profile's `browser.headlessByStage` makes it headed automatically; never pass `headless: true`, which would override it. Where headed is genuinely unavailable (no display attached, or the MCP fallback's `--headless` flag not removed by an operator), proceed headless rather than halting, and state it in Execution Metadata (§10 #1) and Known Limitations (§10 #6).

# 13. Expected Artifacts

| Artifact | Path |
|---|---|
| Manual Execution Results | `platform_core_data/runs/{{RUN_FOLDER}}/manual_execution/ManualExecutionResults.md` |
| Manual Execution Summary | `platform_core_data/runs/{{RUN_FOLDER}}/manual_execution/ManualExecutionSummary.md` |
| Automation Candidate Package | `platform_core_data/runs/{{RUN_FOLDER}}/manual_execution/AutomationCandidatePackage.md` |
| Captured screenshots / videos / notes / logs | `platform_core_data/runs/{{RUN_FOLDER}}/manual_execution/artifacts/` |

# 14. Operational Contract

Role: manual test case execution, raw result recording, and Automation Candidate identification (Stage 4 of 7).

Execute the approved Manual Test Suite exactly as authored, record a raw unedited result per test case, and identify which stably-executed cases are worth handing to Stage 5. Execution is fully specified above — §4 (Inputs, all of which must be Approved), §5 (Precondition Validation), §6 (Environment Awareness), §7 (Evidence Collection), §8 (Result Classification), §9 (Automation Candidate Identification), §10 (Standard Output Contract, incl. the Defect Documentation Standard §10.1), §11.1 (Headed Browser — required), §12 (Execution Rules), §13 (Artifacts), §17 (Execution Strategy by Run Scope), §18–§19 (Stop Conditions and Recovery), §20 (Handoff Contracts). This section adds no rules of its own; the contract is stated once above rather than restated here.

# 15. Example Execution

*Illustrative only — not executed as part of this task.*

```text
Input:
  platform_core_data/runs/{{RUN_FOLDER}}/test_design/TestCases_Login.md / .xlsx
  platform_core_data/runs/{{RUN_FOLDER}}/test_design/TraceabilityMatrix.md
  platform_core_data/runs/{{RUN_FOLDER}}/test_design/CoverageReport.md
  platform_core_data/runs/{{RUN_FOLDER}}/context/ProjectContext.md
```

Hypothetical result: this skill confirms the target environment matches the Project Context, then executes all 12 Login test cases. `TC-LOGIN-001` (valid login) and `TC-LOGIN-002` (invalid password) both Pass with deterministic, objectively verifiable outcomes and are included in the Automation Candidate Package. `TC-LOGIN-004` (the Forgot Password regression case tied to `FINDING-003`) Fails — the observed response still times out — and is excluded, with the failure detail and screenshot cited in the Manual Execution Results. `TC-LOGIN-007` (an exploratory test case dispositioned against `FINDING-004`, the anti-enumeration concern) Passes but is excluded from the Automation Candidate Package per §9.1 rule 4, since its resolution still depends on a pending human policy call. The resulting `AutomationCandidatePackage.md` lists 9 of the 12 test cases, and the Summary states the 3 exclusions and their reasons.

# 16. Architecture Principle

> Agents communicate through artifacts only. Each has a single responsibility. Every output becomes the input of another whenever applicable.

For this skill specifically: its single responsibility is faithfully executing manually-designed test cases and evidencing which of them are actually stable enough to justify automation effort — never deciding what gets automated, and never executing automation code itself. Its outputs — the Manual Execution Results, Manual Execution Summary, and Automation Candidate Package — become the Automation skill's primary scope-determining input in the next stage.

# 17. Execution Strategy by Run Scope and Run Type

| Run Scope Type / Run Type | Strategy |
|---|---|
| **Entire Project** | Execute every test case in the approved Manual Test Suite. |
| **Epic / Feature / User Story** | Execute only the test cases traceable to that scope's requirements/acceptance criteria, per the same Run Scope Reference (`.claude/skills/test-design-skill/SKILL.md` §5.4) every test case already carries. |
| **Bug Validation** | Execute the specific reproduction and regression test case(s) tied to the Finding first. |
| **Full Regression** (Run Type) | Execute the entire suite. |
| **Smoke** (Run Type) | Execute only P1/critical-path test cases. |
| **Selective Re-run** | Execute only the specific test case IDs named for this run — e.g., re-validating cases whose Manual Test Suite entry changed. |

If the Project Context/Run Scope states no explicit Type, this skill defaults to executing the full Manual Test Suite and states that default explicitly in the Execution Metadata.

# 18. Stop Conditions

| Condition | Scope | Required Action |
|---|---|---|
| **Missing approved Manual Test Suite** | Global | Halt — there is nothing to execute. Recommend confirming Stage 3 completed and its output is `Approved`. |
| **Environment Unavailable** (target URL unreachable, application down) | Global | Halt; recommend validating the environment before retrying. |
| **Authentication Failure** (the Project Context's credentials don't work) | Global | Halt; this is a credential/environment problem, not a test defect. |
| **Precondition Not Met** (§5) | Local — that test case only | Classify `Blocked`; continue executing every other test case whose preconditions are met. |

# 19. Recovery Strategy — Smallest Corrective Action

Consistent with every other execution-capable stage in this pipeline (`.claude/skills/automation-execution-skill/SKILL.md` §20): never simply fail — recommend the smallest corrective action, and never let one blocked test case stop the whole run.

1. For a Local Stop Condition (§18), continue executing every other unaffected test case.
2. For every block/failure, recommend the smallest corrective action: validate environment, re-run the affected subset once the underlying cause is believed fixed, or flag the specific test case for Test Design if the block reveals the test case itself (not the environment) is the problem.
3. Every recommendation is recorded in the Manual Execution Summary's Recommendations section (§10).

# 20. Handoff Contracts

## 20.1 Test Design skill → Manual Execution skill

| This skill needs (§4) | Satisfied by (`.claude/skills/test-design-skill/SKILL.md` §9/§21) |
|---|---|
| Manual Test Suite | §9 Outputs #1–#2 |
| Requirement Traceability Matrix | §9 Outputs #3 |
| Coverage Report (incl. advisory Automation Candidates, §18 #11 there) | §9 Outputs #4 |
| Project Context | Unchanged pass-through from Stage 1 |

## 20.2 Manual Execution skill → Automation skill

| Automation skill needs (`.claude/skills/automation-skill/SKILL.md` §4) | Satisfied by (this skill's output) |
|---|---|
| Automation Candidate Package (Primary) | §9.3 |
| Manual Execution Summary (Secondary) | §10 #2, #5 |
| Manual Test Suite / Traceability Matrix / Coverage Report (content source, unchanged pass-through) | Not produced by this skill — still read directly from `test_design/` by the Automation skill for full test case content; this skill's package only bounds *which* IDs are in scope |
| Project Context | Unchanged pass-through from Stage 1 |

**A run is not complete until every row above is verifiably satisfied.** An Automation Candidate cited in the package without a resolvable Manual Test Suite/Traceability Matrix reference is a handoff defect, not an acceptable shorthand.

# 21. Metrics

| Metric | Definition |
|---|---|
| **Execution Duration** | Total wall-clock time for this execution, start to finish. |
| **Pass Rate** | Passed ÷ total executed. |
| **Automation Candidate Rate** | Automation Candidates ÷ total executed — how much of the suite this run judged ready to hand to Automation. |
| **Block/Skip Rate** | (Blocked + Skipped) ÷ total in scope. |
| **Evidence Count** | Total evidence items captured, per §7. |

# 22. Future Scalability

The Result Classification (§8) and Automation Candidate criteria (§9.1) are already defined in terms of outcome and determinism rather than "a web page" — they extend to Mobile, Desktop, and API-shaped manual test cases (where "Steps" become device gestures or request/response definitions, per `.claude/skills/test-design-skill/SKILL.md` §22) with no change to this skill's Standard Output Contract (§10) or Handoff Contracts (§20).

# 23. Direct Invocation

This skill is independently invocable — `/manual-execution-skill`, optionally with a run-scoped instruction (e.g. `/manual-execution-skill run TC-LOGIN-001..008 only`). Full rules: `workflows_and_pipelines/pipeline/pipeline.md` §5.3.1.

- **Instruction prompts are run-scoped, never spec-overriding** (§5.3.1 #3). An instruction may select which test case IDs to execute, set an execution order, or limit the session. It never authorizes force-running a test whose Preconditions are unmet (§5 — that is `Blocked`), taking unauthorized destructive actions, relaxing Evidence capture, reading the PRD directly (§17), or admitting a test case into the Automation Candidate Package without applying §9.1's criteria.
- **Upstream `Pending Review` → request approval, then recommend** (§5.3.1 #4). Report which of the Manual Test Suite / Traceability Matrix / Coverage Report / Project Context is open, then offer both paths (approve → `/manual-execution-skill`, or revise → `/test-design-skill <feedback>`).
- **Missing upstream → run degraded** (§5.3.1 #5):
  - *No Manual Test Suite:* there is nothing to execute — report it as the blocking gap (existing §18 Stop Condition stands). This skill executes designed test cases; it never authors them to fill the gap.
  - *No Project Context:* execute only if the target environment and credentials are supplied in the invocation itself; otherwise report the gap. Record the environment/safety basis as `Open Question — Requires Stage 1` and treat every ambiguous action as non-destructive-only.
  - *No Traceability Matrix / Coverage Report:* execute anyway, carry through whatever traceability the test cases themselves state, and mark the Results' traceability section as `Requires Upstream Stage`.
- **Closing message must recommend the next step** (§5.3.1 #6):

```
Stage 4 complete — Manual Execution Results → Pending Review
  platform_core_data/runs/{{RUN_FOLDER}}/manual_execution/ManualExecutionResults.md
  {P} Passed | {F} Failed | {B} Blocked | {C} Automation Candidates

Next step — either:
  1. Approve, then continue:   "approved"  →  /automation-skill
  2. Re-run failed cases:      /manual-execution-skill re-run {IDs}
  3. Report without automating: /reporting-skill   (declares Automation Coverage gap)
```
