---
name: automation-execution-skill
description: Stage 6 of 7 in the Agentic AI Testing Platform pipeline. Executes an approved automation suite against a target environment and records raw, structured Execution Results (pass/fail/evidence, full Result Classification, Health Summary) plus the Automation Repair Loop for automation-side failures. Use when running an approved automation package against an environment.
inputs:
  - name: automation_suite
    type: file_path
    required: true
    description: Approved Automation Package at `platform_core_data/runs/{{RUN_FOLDER}}/automation/tests_{Framework}/`.
  - name: automation_summary
    type: file_path
    required: true
    description: Framework Used, Execution Instructions, Coverage, Known Limitations.
  - name: project_context
    type: file_path
    required: true
    description: Target environment, credentials, safety constraints.
  - name: execution_mode
    type: environment_var
    required: false
    description: "Headless | Headed | Debug, sourced from the Run Configuration. If absent, this skill halts and requests it explicitly before running anything — never defaulted."
  - name: execution_scope
    type: environment_var
    required: false
    description: Which subset of the suite to run — full suite by default, or a Selective/Failed Test Re-run scope.
outputs:
  - name: execution_results
    type: file_path
    location: "platform_core_data/runs/{{RUN_FOLDER}}/execution/ExecutionResults.md"
    description: "Structured per-test results, Evidence Inventory, Metrics, and separated Application/Automation/Environment Health figures."
  - name: execution_artifacts
    type: file_path
    location: "platform_core_data/runs/{{RUN_FOLDER}}/execution/artifacts/"
    description: Captured screenshots, traces, logs, HAR files, framework reports.
dependencies:
  - automation-skill (upstream skill)
  - The test runner/framework CLI named in the Automation Summary's Execution Instructions
  - "platform_core_data/knowledge_base/patterns/repair_patterns/, diagnosis_patterns/, execution_patterns/ (Platform Knowledge, consulted during the Automation Repair Loop)"
  - "platform_core/tools/mcp/ (MCP tools layer — the `context7` server, permitted only inside the Automation Repair Loop per §7 and that README's §2.6)"
---

> **Pipeline position:** Stage 6 of 7 — consumes the Automation Suite, produces raw Execution Results.
> **Traceability:** `Automation → Execution`.
> **Revision history:** see `docs/CHANGELOG.md`.

> **Revision note (2026-07-27, user-mandated):** artifacts now live in this run's own Run Folder (`platform_core_data/runs/{{RUN_FOLDER}}/{stage}/`) — `platform_core_data/workspace/` is removed, and the persistent Workspace Automation Baseline now lives at `platform_core_data/automation_baseline/{framework}/`. Each Markdown artifact is **one file, edited in place**: no `.vN` suffixes, and **no duplicate "final" copy is ever written on approval**. Refinement edits the same file the reviewer read. Git is the version history. See `workflows_and_pipelines/pipeline/pipeline.md` §7 and §12.

# 1. Skill Name

**Automation Execution skill** — v3

# 2. Purpose

The Automation Execution skill runs the automated test suite produced by the Automation skill against a specified environment and produces a raw, unedited, structured record of what happened — pass/fail/skip status, durations, failure messages, and captured artifacts (screenshots, traces, logs). It does not interpret, summarize narratively, or draw conclusions from the results; that synthesis is the Reporting skill's job. Its only job is faithful execution and faithful recording.

**As of v2, execution may not begin at all until an explicit Execution Mode is known.** This is a precondition alongside the existing environment-match check (§7 Rule 1) — this skill confirms both *where* it is about to run (target environment) and *how* (Headless/Headed/Debug) before invoking the test runner, and refuses to proceed on an assumed value for either.

# 3. Responsibilities

- Read the Automation Suite and confirm its structure before running anything.
- Read the Project Context to confirm the target environment, credentials, and which actions are safe to perform against it.
- Verify that the target environment for this run matches what the Project Context expects; halt and report a mismatch rather than proceeding blindly.
- **Determine the Execution Mode before running anything** (§5.1): read it from the approved Run Configuration if present; if absent, halt and request it from the user — never assume Headless, Headed, or Debug as a silent default.
- Execute the automated test suite (in full, or a specified scope) using its configured test runner, invoked with whichever Execution Mode was determined above.
- Record, for every test executed, at minimum:
  - **Executed Test Case ID** — the manual Test Case ID this run traces back to (from the Traceability Matrix)
  - **Automation Script ID** — the specific automation script/file (and test name) that was run
  - **Status** — Passed / Failed / Skipped / Error
  - **Execution Time** — start time, end time, and duration
  - **Screenshots** — path/reference to any captured screenshot, especially on failure
  - **Logs** — path/reference to console/network/framework logs captured during the run
  - **Failure message / stack trace** (if applicable)
- Record the **Execution Mode** used for the run once, as a run-level Execution Metadata field (§5.2) — not per-test, since the mode applies uniformly to the whole execution.
- Never modify test code to force a pass, suppress a failure, or otherwise alter outcomes.
- Never run a test case against an environment the Project Context has not explicitly marked safe for that test's mutating actions.
- Produce a single, timestamped Execution Results artifact per run — reruns must be clearly labeled, never silently overwritten without a run identifier.
- **Adapt execution strategy to the run's Run Scope and Run Type** (§13) — an Entire Project run, a Bug's single-reproduction validation, and a Selective Re-run of only previously-failed tests are different activities, not one default "run everything" behavior.
- **Invoke the test runner in a framework-agnostic way** (§15) — determine how to invoke the suite from the Automation Summary's own Execution Instructions (`.claude/skills/automation-skill/SKILL.md` §25), never by assuming Playwright or hardcoding one framework's flags.
- **Classify every result using the full Result Classification set** (§17) — Passed/Failed alone is insufficient; this skill distinguishes Skipped, Blocked, Not Executed, Inconclusive, Flaky, and the four failure-cause categories (Infrastructure/Environment/Automation/Application/Configuration Failure).
- **Produce a structured Evidence Inventory** (§16) covering every evidence type actually captured (and naming what wasn't, and why), not only screenshots and logs.
- **Produce output conforming to the Standard Output Contract** (§18) so the Reporting skill never has to interpret free-form prose.
- **Recognize named Stop Conditions** (§19) and, rather than failing outright, recommend the smallest corrective action (§20) — retry, resume, switch mode, validate environment, re-run only the affected subset, or recommend Automation skill regeneration where the fault is in the generated automation itself, not the environment.
- **Verify handoff completeness in both directions** (§21) — confirm every input the Automation skill's output actually provides is used correctly, and confirm every input the Reporting skill's own specification declares it needs is present in the Execution Results.
- **Track and report execution Metrics** (§22) — duration, pass/fail/skip rates, retry count, evidence count, flaky test count, and execution stability — as part of the Standard Output Contract, not as an afterthought.
- **Execute reliably and deterministically** (§23) — stable test ordering, idempotent reruns, isolated failures that don't cascade into unrelated tests reporting false failures.

# 4. Inputs

| Input | Required? | Description |
|---|---|---|
| Automation Suite | Required | `platform_core_data/runs/{{RUN_FOLDER}}/automation/tests/` — the generated/reused project itself |
| **Automation Summary** (renamed from "Automation Coverage Summary" — see §21's Confirmed Contract Mismatch) | Required | `platform_core_data/runs/{{RUN_FOLDER}}/automation/AutomationSummary.md` — the consolidated handoff document per `.claude/skills/automation-skill/SKILL.md` §25: Framework Used, Coverage, Automation Decisions, Known Limitations, and — critically for this skill — **Execution Instructions**, which is what makes framework-agnostic invocation (§15) possible without this skill assuming a framework itself |
| Run Scope | Required (embedded) | Not a separate file — the Type/Source recorded in the Project Context's own Scope Summary (`workflows_and_pipelines/pipeline/run_scope.md` §3–§4), plus the Run Type (Full Regression/Smoke/etc., §5 there). Drives §13's strategy selection. |
| Project Context | Required | `platform_core_data/runs/{{RUN_FOLDER}}/context/ProjectContext.md` — environment, credentials, safety constraints |
| Execution Configuration | Required, composite | Not a single file — the set of run-time execution parameters this skill must resolve before running anything: Execution Mode (§5.1), Concurrency Mode (§5.3), Retry Policy (§5.4), and Resume state (§5.5). Named explicitly here so none of these is a silent default — each has its own determination rule below. |
| Execution Mode | Required, but not necessarily pre-supplied — see §5.1 | Sourced from the approved Run Configuration if it defines one; otherwise obtained by pausing and asking the user before execution begins. One of: `Headless`, `Headed`, `Debug` — no other value is valid. |
| Framework Configuration | Required, not assumed | Not this skill's decision — sourced from the Automation Summary's Framework Used / Execution Instructions sections (§15). This skill never independently selects or assumes a framework; it only reads what Stage 5 already decided and justified. |
| Environment Configuration | Required (embedded) | The named environment (§14) this run targets, drawn from the Project Context's Environment Constraints — not a hidden default, and never inferred from where this skill itself happens to be running. |
| Execution scope / Execution Parameters | Optional | Which subset of the suite to run (defaults to the full suite); for a Selective Re-run or Failed Test Re-run (§13), this is the specific test case ID list or "previously Failed" filter. |
| Evidence Locations | Required (fixed convention) | `platform_core_data/runs/{{RUN_FOLDER}}/execution/artifacts/` — not configurable per run; named explicitly here so it's a stated input/convention rather than an implicit assumption. |
| Execution History | Optional — required only for Resume/Selective Re-run/Failed Test Re-run (§5.5, §13) | Prior Execution Results artifact(s) for this run (`ExecutionResults_{Execution ID}.md`), consulted only to determine what to resume or re-run — never edited, never treated as this run's own result. |

# 5. Execution Mode

## 5.1 Determining the Mode

Before invoking the test runner on any test, this skill must determine exactly one Execution Mode:

1. **Check the approved Run Configuration** for an explicit Execution Mode value. If it defines one of `Headless`, `Headed`, or `Debug`, use it. No further confirmation is needed — an explicitly configured mode is treated as already authorized.
2. **If the Run Configuration does not define an Execution Mode, halt.** Do not proceed with any default, and do not infer a mode from the environment (e.g., "CI implies Headless"). Ask the user directly which of the three supported modes to use, and wait for an explicit answer before taking any further action.
3. Once determined — whether from the Run Configuration or from the user's direct answer — proceed to execution using that mode, and record it per §5.2.

**Supported Execution Modes** and what each means, independent of framework:

| Mode | Meaning |
|---|---|
| **Headless** | No visible browser/app UI; the fastest, most CI-like mode. |
| **Headed** | A visible, on-screen UI for every test. |
| **Debug** | Interactive step-through execution, for diagnosing a specific failure rather than a full unattended run. |

**How each mode maps to an actual invocation is never assumed by this skill — it is read from the Automation Summary's Execution Instructions** (`.claude/skills/automation-skill/SKILL.md` §25, and see §15 below), which state the concrete command/flag for whichever framework Stage 5 selected. This table previously hardcoded Playwright-specific flags (`--headed`, `PWDEBUG=1`); that was itself a framework assumption this revision removes — see §15 for the corrected, framework-agnostic mechanism.

## 5.2 Recording the Mode

The determined Execution Mode is recorded as a distinct, run-level field in the Execution Metadata (§8) — e.g., `"Execution Mode": "Headless"` — once per Execution Results artifact, not repeated per individual test result. A future rerun using a different mode is a distinct execution (its own Execution ID, per §8 Rule 9) and records its own mode value independently; modes are never merged or averaged across reruns.

## 5.3 Concurrency Mode — Parallel / Sequential

A separate axis from Execution Mode (§5.1) — concurrency determines *how many* tests run at once, not *how visibly*.

- **Sequential** — one test at a time. Default when the Run Configuration/Automation Summary does not specify otherwise, since it is the safest choice against a shared, non-isolated environment (per the Environment Constraints already carried in every Project Context this platform has produced to date).
- **Parallel** — multiple tests run concurrently, worker count sourced from the Run Configuration if stated. **Must not be assumed available or safe** — a shared staging environment's Environment Constraints (§14) may prohibit concurrent mutating actions; this skill checks this before enabling Parallel, and falls back to Sequential with a stated reason if Parallel is requested but not safe for this environment.
- Recorded in Execution Metadata alongside Execution Mode, e.g., `"Concurrency Mode": "Sequential"` or `"Concurrency Mode": "Parallel (4 workers)"`.

## 5.4 Retry Policy

- Sourced from the Run Configuration if it defines one (e.g., "retry failed tests up to 2 times"); if absent, defaults to **no automatic retry** — a Failed result is reported as Failed, not silently retried into a false Passed.
- Where a retry is configured and used, every attempt is recorded (per §22's Retry Count metric), and the final recorded Status reflects the last attempt — **but if any attempt failed, the Result Classification (§17) records this as `Flaky` rather than a clean `Passed`** if a later attempt succeeded, so a reviewer never mistakes "passed on retry" for "passed cleanly."
- Never conflated with the Investigation & Recovery Engine's retry logic (`.claude/skills/explorer-skill/SKILL.md` §5.7) — that is Explorer's exploration-time recovery; this is Execution's run-time retry of an already-generated, already-approved automated test.

## 5.5 Resume Capability

- Where a prior execution was interrupted (environment failure, timeout, manual stop) before completing the full suite/scope, this skill may **Resume** rather than restart from zero — reading Execution History (§4) to determine which tests already have a recorded outcome and running only the remainder.
- A Resume is still a distinct Execution ID (§8 Rule 9) whose Execution Metadata states `"Resumed From": "{prior Execution ID}"` and whose final Execution Results for the full logical run is the union of the prior recorded outcomes plus this session's — never a silent merge that loses which outcomes came from which execution.
- Resume is only valid within the same Run — it never carries results forward across a new Run Scope or a new Automation Package version (§21).

## 5.6 Dry Run (future capability — not yet implemented)

A **Dry Run** mode — validating that the suite *would* execute (environment reachable, framework initializes, selectors resolve) without performing any mutating action or recording pass/fail outcomes — is a documented future capability, not implemented by this revision. Naming it here means adding it later requires only a new Execution Mode value and a corresponding Result Classification (§17) state, not a redesign of this section.

# 6. Outputs

**Execution Results** — a raw, structured record of a single test run, structured per the Standard Output Contract (§18): Execution Metadata, Execution Summary, per-test Execution Results, Evidence Inventory (§16), Execution Statistics/Metrics (§22), Failure Summary, Known Limitations, Execution Recommendations, and Inputs for Reporting skill. Every recorded result explicitly references: the Executed Test Case ID, the Automation Script ID, Status (per the full Result Classification, §17), Execution Time, and its Evidence Inventory entries — plus failure detail and an environment/run-identity header that includes the Execution Mode, Concurrency Mode, and Retry Policy used. No narrative interpretation. This remains a single artifact (§9) — the Standard Output Contract defines required internal sections, not new files.

# 7. Allowed Tools

- Shell/Bash (to install dependencies and invoke the test runner using whatever command the Automation Summary's Execution Instructions state, per §15 — never a hardcoded assumption of a specific framework's CLI)
- File tools: Read (automation suite, Automation Summary, Project Context), Write (execution results, logs)
- The test framework's own automation layer (browser, API client, mobile driver, or other, per whichever framework Stage 5 selected), as invoked by the test runner itself — not ad hoc manual interaction
- A direct means of asking the user a question and waiting for their answer, used strictly for the Execution Mode determination in §5.1 when the Run Configuration does not already define one — not used to ask about anything else within this skill's scope
- **`context7` MCP server** (`resolve-library-id`, `query-docs`) — permitted **only inside the Automation Repair Loop (§25)**, and only when a failure's diagnosis turns on a framework/dependency API question ("is this locator API valid at the pinned version this suite runs against?"). Read this run's `StackDocumentationContext_{Framework}.md` (written by Stage 5, `automation-skill/SKILL.md` §34) **first** and reuse what it already records rather than re-querying; query only for the specific question that artifact does not answer, and record the answer in the Repair Summary (§25.1). Never used to change what a test asserts, and never a source of business logic — a repair needing new business logic is out of the loop's scope regardless of what documentation says. See `platform_core/tools/mcp/README.md` §2.6.

**Not permitted:** editing test scripts to change their logic or expected assertions, editing the PRD/Project Context/test cases, or running any test the Project Context has not authorized for the target environment.

# 8. Execution Rules

1. Must confirm the target environment matches the Project Context before running anything; halt and report on mismatch.
2. **Must determine an explicit Execution Mode before running anything** (§5.1) — Headless, Headed, or Debug, sourced only from the approved Run Configuration.
3. **Must never assume a default Execution Mode.** If the Run Configuration does not define one, this skill must halt and request it from the user, and must not proceed until an explicit answer is given.
4. **Must record the determined Execution Mode in the Execution Metadata** (§5.2, §9) on every Execution Results artifact — an artifact missing this field is incomplete, per the same standard already applied to the other required fields in Rule 8 below.
5. Must not modify automation scripts to force a pass or hide a failure.
6. Must not execute any test case against an environment not explicitly marked safe for that test's mutating actions.
7. Must record every test's outcome — no silent skips. A test that cannot run must be logged with an explicit reason.
8. Must not interpret, summarize, or draw narrative conclusions from the results — report raw outcomes only, verbatim.
9. Must timestamp and uniquely identify each run so results are never ambiguous about which execution they came from.
10. Must include, for every executed test, its Test Case ID, Automation Script ID, Screenshots, Logs, and Execution Time as distinct fields — a result missing any of these (where applicable/captured) is incomplete and must be flagged as such rather than submitted silently.
11. **Must never assume, hardcode, or default to a specific framework's invocation syntax.** The test runner command and flags come from the Automation Summary's Execution Instructions (§15) — a framework-specific assumption here (e.g., Playwright flags) is a specification violation, the same category of defect §8 of `.claude/skills/automation-skill/SKILL.md` names for generating unwrapped Selenium under SHAFT.
12. **Must select the Execution Strategy matching this run's Run Scope and Run Type** (§13) — never apply one default "run everything" behavior regardless of scope.
13. **Must classify every result using the full Result Classification set** (§17) — never collapse Blocked/Not Executed/Inconclusive/Flaky/the four failure-cause categories into a bare Passed/Failed/Skipped/Error.
14. **Must produce a structured Evidence Inventory** (§16) naming every evidence type captured and every one that could not be, with a reason for the latter — never silently omitted.
15. **Must recognize the named Stop Conditions** (§19) and, for any condition with a Local scope, continue executing every other unaffected test rather than halting the whole run — and must recommend the smallest corrective action for every blocked/failed item (§20), never a bare failure with no next step.
16. **Must verify Handoff completeness in both directions** (§21) before treating a run's Execution Results as finished — confirm the Automation Summary's Execution Instructions were actually followed, and confirm every input `.claude/skills/reporting-skill/SKILL.md` §4 declares it needs is present in the Execution Results.
17. **Must record execution Metrics** (§22) — duration, pass/fail/skip rates, retry count, evidence count, flaky count, execution stability — as part of every Execution Results artifact.
18. **Must execute deterministically and idempotently** (§23) — a rerun of the same suite against the same environment state must not itself be a source of divergent results; where non-determinism is observed, it is reported as `Flaky` (§17), never silently re-run until it passes.
19. **Must trigger the Automation Repair Loop (§25) whenever at least one result classifies as `Automation Failure`** — inspect for repairability, present a Repair Summary per test case, and ask the human once (§25.2) before repairing or rerunning anything. Must never repair automatically without that question, and must never modify Discovery artifacts, Project Context, or approved Test Cases as part of a repair (§25.3).
20. **Must always report Application Health, Automation Health, and Environment Health as three separate figures** (§25.6) — never a single merged "Failed" count that would let a genuine application defect hide behind (or be mistaken for) an automation-authoring gap, or vice versa.

# 9. Expected Artifacts

| Artifact | Path |
|---|---|
| Execution Results | `platform_core_data/runs/{{RUN_FOLDER}}/execution/ExecutionResults.md` |
| Captured screenshots / traces / logs / HAR / framework reports | `platform_core_data/runs/{{RUN_FOLDER}}/execution/artifacts/` |

No new artifact paths are introduced by this revision — the Standard Output Contract (§18) defines required sections *within* the existing `ExecutionResults.md` file, preserving the Reporting skill's existing single-file input expectation (`.claude/skills/reporting-skill/SKILL.md` §4) without requiring any change on that skill's side.

The Execution Results document's run-identity header must include the Execution Mode, Concurrency Mode, and Retry Policy used, alongside the existing run-identity fields (Execution ID, environment, timestamps).

**Relationship to the Automation Asset Lifecycle (`workflows_and_pipelines/pipeline/pipeline.md` §12, added 2026-07-24):** the Automation Suite this skill executes (§4) is always this run's own **working copy** (`platform_core_data/runs/{{RUN_FOLDER}}/automation/tests_{Framework}/`), never the Workspace Automation Baseline directly — this skill never reads from or writes to the baseline location. Execution happens strictly *before* the Workspace Merge (§12.4), which only ever runs after Automation Approval; everything this skill produces — Execution Results, evidence, and any Automation Repair Loop output (§25) — is exactly what Cleanup (§12.5) preserves forever once the run's source code is later removed, since none of it lives inside the merged package directory.

# 10. Operational Contract

Role: automation suite execution and result recording (Stage 6 of 7).

Execute the approved Automation Package against the target environment and record raw, structured Execution Results. Execution is fully specified above — §4 (Inputs), §5 (Execution Mode, incl. concurrency §5.3, retry policy §5.4, resume §5.5), §6 (Outputs), §8 (Execution Rules), §9 (Artifacts), §13 (Execution Strategy by Run Scope and Run Type), §14 (Environment Awareness), §15 (Framework-Agnostic Execution), §16 (Evidence Collection), §17 (Result Classification), §18 (Standard Output Contract), §19–§20 (Stop Conditions and Recovery), §21 (Handoff Contracts), §22 (Metrics), §23 (Execution Reliability), and the Automation Repair Loop in §25–§29. This section adds no rules of its own; the contract is stated once above rather than restated here.

# 11. Example Execution

*Illustrative only — not executed as part of this task.*

```text
Input:
  platform_core_data/runs/{{RUN_FOLDER}}/automation/tests/
  platform_core_data/runs/{{RUN_FOLDER}}/context/ProjectContext.md
  APP_URL          = https://opensource-demo.orangehrmlive.com/
  TEST_SCOPE       = all
  EXECUTION_MODE   = (not defined in Run Configuration)
```

Hypothetical result: this skill confirms the target environment matches the Project Context, then checks the Run Configuration for an Execution Mode — finds none defined — and halts, asking: *"No Execution Mode is defined in the Run Configuration. Please choose one: Headless, Headed, or Debug."* Only after the user answers, say, "Headed," does this skill proceed to run `npx playwright test --headed`, and the resulting `platform_core_data/runs/{{RUN_FOLDER}}/execution/ExecutionResults.md` records `"Execution Mode": "Headed"` in its run-identity header alongside the usual per-test outcomes — e.g., "36 tests executed — 31 Passed, 3 Failed (TC-PIM-013 → `pim.spec.ts::AddEmployee_MissingName`, TC-PIM-014, TC-LEA-013 — validation messages not shown as expected), 2 Skipped (destructive Maintenance actions not authorized against the shared demo)," with each row showing its Test Case ID, Automation Script ID, Execution Time, and linked Screenshots/Logs under `platform_core_data/runs/{{RUN_FOLDER}}/execution/artifacts/`.

# 12. Architecture Principle

> Agents communicate through artifacts only. Each has a single responsibility. Every output becomes the input of another whenever applicable.

For this skill specifically: its single responsibility is faithful execution and faithful recording — never interpretation, and never silently deciding *how* to run on the user's behalf when that decision (Execution Mode) was left unspecified. Its output, the Execution Results, becomes the Reporting skill's sole primary input in the final stage.

# 13. Execution Strategy by Run Scope and Run Type

Execution scope and priority follow the run's Run Scope Type and Run Type (`workflows_and_pipelines/pipeline/run_scope.md` §3, §5), named explicitly in this skill's Run Scope input (§4) — not one default "run everything" behavior regardless of what this run covers:

| Run Scope Type / Run Type | Strategy |
|---|---|
| **Entire Project** | Execute the full Automation Suite, every test case the Automation skill produced a Reuse/Generate decision for. |
| **Epic** | Execute the suites covering the Epic's constituent Features/Stories, plus any integration test cases designed at their seams (`.claude/skills/test-design-skill/SKILL.md` §16). |
| **Feature** | Execute only the one feature's suite. |
| **User Story** | Execute only the test cases traceable to that story's acceptance criteria — never opportunistically run adjacent, unrelated suite content just because it shares a file. |
| **Bug Validation** | Execute the specific reproduction and regression test case(s) tied to the Finding first; broader suite execution, if any, is a separate, explicitly scoped decision, not an automatic bundle. |
| **Full Regression** (Run Type) | Execute the entire suite, prioritizing already-covered/previously-passing areas to confirm continued correctness — this is the canonical "run everything" case. |
| **Smoke** (Run Type) | Execute only P1/critical-path test cases; everything else is deliberately not run this pass. |
| **Partial Suite** | Execute an explicitly named subset (module, tag, or suite) per the Execution scope input (§4) — the subset boundary is stated in Execution Metadata, never left implicit. |
| **Selective Re-run** | Execute only the specific test case IDs named in the Execution scope/Execution Parameters (§4) — e.g., re-running just the cases touched by a recent Automation Package change. |
| **Failed Test Re-run** | Execute only the test cases whose most recent recorded Status (per Execution History, §4) was Failed/Error/Flaky — never silently re-runs a Passed test as if it were new information. |
| **API** | Same strategy rules apply; "test" here may be a request/response cycle rather than a UI flow — the Result Classification (§17) and Evidence Inventory (§16) both already accommodate this without change. |
| **UI** | Baseline behavior, unchanged from the rest of this specification. |
| **Mixed** (UI + API in the same suite) | Execute the suite as authored — a single test case combining UI and API steps runs as one unit; its Status reflects the whole case, not a per-step average. |

If the Project Context/Run Scope does not state an explicit Type, this skill defaults to executing the full Automation Suite (Entire Project behavior) and states that default explicitly in the Execution Metadata.

# 14. Environment Awareness

This skill must never assume a specific environment — every run states, in its Execution Metadata, exactly which named environment it targeted, drawn from the Project Context's Environment Constraints:

| Environment | Meaning | Execution implication |
|---|---|---|
| **Local** | A developer's own machine. | Typically Headed/Debug-friendly; no shared-environment safety constraint applies unless stated. |
| **Development** | A shared dev environment, likely unstable/frequently changing. | Failures here may be Environment Failure (§17) rather than Application Failure — treat instability as expected, not automatically a defect. |
| **QA / Testing** | A dedicated test environment. | The most common target for Full Regression/Smoke runs. |
| **Staging / Pre-Production** | A production-like environment, often shared across teams. | Concurrency Mode (§5.3) defaults to Sequential here unless explicitly confirmed safe, per the existing shared-environment caution already carried in every Project Context this platform has produced. |
| **Production Validation (read-only)** | The live production system, with execution strictly limited to non-mutating verification. | This skill must confirm the Project Context explicitly authorizes read-only production validation before running anything here — absent that explicit authorization, Production is never a valid execution target, full stop (this is a stricter, non-negotiable case of Rule 6's existing "not explicitly marked safe" check). |
| **CI/CD** | An automated pipeline runner, not a human-attended session. | Concurrency/Retry Policy is typically sourced from CI-specific Run Configuration; Debug mode is not meaningful here and should not be selected. |
| **Container** | A containerized instance of the application/environment. | No different execution behavior from any other environment — named here so "container" is a recognized Environment Constraint value, not an unhandled case. |
| **Cloud** | A cloud-hosted target (dev/staging/prod, per the categories above). | Same as Container — the deployment substrate doesn't change execution behavior; only the named environment tier (Dev/QA/Staging/Production) does. |

**This skill must never infer the environment from where it itself happens to be running** (e.g., "I am running inside CI, therefore the target must be a CI-appropriate environment") — the target environment is always what the Project Context states, confirmed via Rule 1's existing environment-match check, regardless of this skill's own execution context.

# 15. Framework-Agnostic Execution

**This skill must never assume Playwright, or any other single framework.** Prior versions of §5.1's Execution Mode table hardcoded Playwright-specific flags (`--headed`, `PWDEBUG=1`); that was itself a framework assumption, corrected by this revision.

## 15.1 How Invocation Is Actually Determined

1. Read the Automation Summary's **Framework Used** section (`.claude/skills/automation-skill/SKILL.md` §25) to know which framework was selected and why.
2. Read the Automation Summary's **Execution Instructions** section (same artifact) for the concrete command(s), required environment variables, and prerequisite setup — this is authored by the Automation skill specifically so this skill never has to guess.
3. Map the determined Execution Mode/Concurrency Mode/Retry Policy (§5) onto whatever flags/configuration the Execution Instructions state for those concepts in the selected framework — never onto a hardcoded, framework-specific flag this skill invented itself.

## 15.2 Framework Examples (illustrative only, never assumed)

| Framework | Example invocation shape (from Execution Instructions, not assumed here) |
|---|---|
| Playwright | `npx playwright test`, `--headed`, `PWDEBUG=1` |
| SHAFT Engine | TestNG suite XML invocation, Allure report generation as a post-step |
| Selenium (raw) | Whatever test runner wraps it (JUnit/TestNG/pytest), per the Execution Instructions |
| Cypress | `npx cypress run`, `--headed` |
| Appium | Framework-specific mobile test runner invocation, per the Execution Instructions |
| REST Assured / Postman | A build-tool invocation (e.g., Maven/Gradle) or `newman run`, respectively — no browser mode concept applies; Execution Mode may be `N/A` for these |

This table is illustrative, not authoritative — the authoritative source is always the Automation Summary's Execution Instructions for the specific project and run.

# 16. Evidence Collection

**Evidence Inventory** — the full set of evidence types this skill may capture during execution, structured and traceable per test result. Not every type applies to every framework/test; this skill records what was captured and explicitly names what wasn't, with a reason (mirroring the Explorer skill's own evidence-gap discipline, `.claude/skills/explorer-skill/SKILL.md` §5.10):

| Evidence Type | When applicable |
|---|---|
| Screenshots | UI-based frameworks; captured at minimum on failure, ideally also on key steps |
| Videos | UI-based frameworks where the runner supports session recording |
| Execution Traces | Frameworks with a trace/replay capability (e.g., Playwright Trace Viewer) |
| Console Logs | UI-based frameworks with browser console access |
| Network Logs / HAR Files | Any framework capturing request/response traffic |
| Execution Logs | All frameworks — the test runner's own stdout/stderr/log output |
| Framework Reports | Framework-native report formats (e.g., Allure for SHAFT/TestNG, Playwright HTML report) |
| Attachments | Any other framework-specific artifact (e.g., a downloaded file a test verified) |
| Failure Artifacts | Anything captured specifically because a test failed — stack trace, failure screenshot, failure-state DOM/response |

**Evidence Inventory as a required Execution Results section** (§18) lists, per test, exactly which of the above were captured, their file paths under `platform_core_data/runs/{{RUN_FOLDER}}/execution/artifacts/`, and — for anything not captured — the reason (e.g., "Videos: not supported by REST Assured for this API-only suite," not silently absent).

# 17. Result Classification

A binary Passed/Failed (or even the existing four-state Passed/Failed/Skipped/Error) understates what actually happens during execution. Every test result is classified as exactly one of the following:

| Status | Meaning |
|---|---|
| **Passed** | The test executed and every assertion succeeded. |
| **Failed** | The test executed and at least one assertion did not succeed — a genuine, reproducible discrepancy between expected and actual behavior. |
| **Skipped** | The test was deliberately not run (e.g., not authorized for this environment, per Rule 6) — a decision, not a failure. |
| **Blocked** | The test could not run because a precondition (a prior test in a dependent chain, required test data, an environment state) was not met — distinct from Skipped, which is a deliberate decision, and from Failed, which means it ran and didn't pass. |
| **Not Executed** | The test was in scope but the run ended (time limit, environment failure, manual stop) before reaching it — distinct from Blocked (a specific precondition failure) and Skipped (a deliberate decision). |
| **Inconclusive** | The test ran but produced a result this skill cannot confidently classify as Passed or Failed (e.g., an assertion that itself errored rather than evaluated false) — reported as such, never forced into Passed or Failed. |
| **Flaky** | The test's outcome was not consistent across attempts within this same execution (e.g., failed then passed on retry, per §5.4) — reported distinctly from a clean Passed so a reviewer knows reliability is in question even though the final attempt succeeded. |
| **Infrastructure Failure** | The test could not run due to a failure in the execution infrastructure itself (test runner crash, out-of-memory, CI runner failure) — not the application or the environment under test. |
| **Environment Failure** | The target environment was unreachable, degraded, or in an unexpected state not attributable to the application under test's own defects (e.g., a shared staging instance down for unrelated maintenance). |
| **Automation Failure** | The generated automation itself is broken (a stale selector, a script referencing a removed page object) — distinct from Application Failure; the application may be working fine, but the automation asset needs fixing (a signal back to the Automation skill, §20). |
| **Application Failure** | The application under test genuinely behaved incorrectly, and the automation/environment/infrastructure are confirmed not at fault — the closest match to a traditional "Failed" caused by a real defect. |
| **Configuration Failure** | Execution could not proceed correctly due to a configuration problem (wrong environment URL, missing credential, invalid Execution Mode/framework config) — distinct from Environment Failure, which is about the target system's own state. |

**Rules:**
- Every result gets exactly one classification — never zero, never more than one.
- `Failed` is reserved for genuine application-behavior discrepancies; where the cause is actually Infrastructure/Environment/Automation/Configuration, the more specific classification is used instead, so a reviewer doesn't mistake an environment hiccup for a real defect (or vice versa).
- Where the cause is genuinely ambiguous even after the failure detail is captured, `Inconclusive` is the honest classification — never force-fit into `Failed` for the sake of a cleaner-looking report.

# 18. Standard Output Contract

The Execution Results artifact (§9 — same file, no new artifact path) must contain exactly these sections, in this order, so the Reporting skill never has to interpret free-form prose to extract what it needs:

| # | Section | Must contain, at minimum |
|---|---|---|
| 1 | **Execution Metadata** | Execution ID, Run Scope/Run Type (§13), environment (§14), framework used, Execution Mode, Concurrency Mode, Retry Policy, timestamps |
| 2 | **Execution Summary** | One-paragraph narrative: what was executed, overall outcome, headline pass/fail figures |
| 3 | **Execution Results** | Per-test detail: Test Case ID, Automation Script ID, Status (§17), Execution Time, Evidence Inventory references, failure detail where applicable |
| 4 | **Evidence Inventory** | The consolidated list per §16 — every evidence type captured, per test, with paths, and every gap with a reason |
| 5 | **Execution Statistics** | The Metrics from §22 — duration, pass/fail/skip rates, retry count, evidence count, flaky count, stability |
| 6 | **Health Summary (§25.6)** | **Application Health, Automation Health, and Environment Health reported as three separate figures — never one merged "Failed" counter.** `Inconclusive`/`Flaky` reported as their own line, folded into neither. |
| 7 | **Automation Repair Loop Outcome (§25, when triggered)** | The Repair Summary (§25.1), the human's answer (§25.2), and — if repair was approved — the Before/After comparison (§25.4): Fixed (`Automation Repaired`), Remaining failures, New failures, Root cause, Confidence. Omitted entirely (not left as an empty section) when no `Automation Failure` occurred this run. |
| 8 | **Known Limitations** | Anything this execution could not fully verify (e.g., a test marked Blocked, a Skipped mutating action) and why |
| 9 | **Execution Recommendations** | The corrective actions recommended per §20 for any blocked/failed item — retry, resume, switch mode, validate environment, re-run subset, or flag for Automation regeneration |
| 10 | **Inputs for Reporting skill** | The explicit handoff package per §21 — confirmation that every input `.claude/skills/reporting-skill/SKILL.md` §4 declares it needs is present |

# 19. Stop Conditions

This skill recognizes the following named conditions. Recognizing one is never, by itself, a reason to halt the entire run — see §20 for the required corrective-action recommendation before any blocked item is left unresolved.

| Condition | Scope | Required Action |
|---|---|---|
| **Missing Automation Package** | Global | Halt — there is nothing to execute. Report the gap; recommend confirming Stage 5 completed and its output is `Approved`. |
| **Missing Framework** (the Automation Summary doesn't state one, and none can be inferred) | Global | Halt — per §15, this skill never selects a framework itself. Recommend re-running the Automation skill to produce a complete Automation Summary. |
| **Missing Execution Configuration** (no Execution Mode, and the Run Configuration provides no way to obtain one) | Global | Per existing Rule 3: halt and ask the user directly — never default. |
| **Invalid Run Configuration** (e.g., an Execution Mode value other than Headless/Headed/Debug, or a Retry Policy that doesn't parse) | Global | Halt and report the specific invalid value — never silently coerce it to a nearest-guess valid value. |
| **Environment Unavailable** (target URL unreachable, application down) | Global | Halt; recommend validating the environment (§20) before retrying — never repeatedly retry against a genuinely down target as if that were a flaky-test problem. |
| **Authentication Failure** (the Project Context's credentials don't work) | Global | Halt; this is a credential/environment problem, not a test defect — classify any in-flight test as Environment Failure (§17), not Application Failure. |
| **Framework Initialization Failure** (the test runner itself fails to start — missing dependency, bad config) | Global | Halt; recommend the smallest fix (e.g., "run the install step from the Execution Instructions") rather than a bare crash report. |
| **Execution Dependency Failure** (a specific test's precondition — seed data, a prior test in a required chain — isn't met) | Local — that test only | Classify as `Blocked` (§17); continue executing every other test whose preconditions are met. |

# 20. Recovery Strategy — Smallest Corrective Action

Like the Test Design and Automation skills (`.claude/skills/test-design-skill/SKILL.md` §20, `.claude/skills/automation-skill/SKILL.md` §27), this skill's recovery behavior is: **never simply fail — recommend the smallest corrective action, and never let one blocked test stop the whole run.**

1. For a Local Stop Condition (§19, e.g., Execution Dependency Failure), continue executing every other unaffected test — a single blocked test is never a reason to produce zero output for the run.
2. For every failure/block, recommend the smallest corrective action from this list, matched to the Result Classification (§17) that caused it:
   - **Retry execution** — for a suspected transient Infrastructure/Environment Failure, within the configured Retry Policy (§5.4).
   - **Resume execution** — for a run interrupted mid-suite (§5.5), rather than restarting from zero.
   - **Switch execution mode** — e.g., recommend Debug mode specifically for re-diagnosing a single persistent Failed test, rather than re-running the whole suite Headless again.
   - **Validate environment** — for an Environment Failure or Authentication Failure, before any retry is attempted.
   - **Re-run affected subset only** — a Selective Re-run (§13) of just the failed/blocked test IDs, once the underlying cause is believed fixed.
   - **Recommend Automation Package regeneration** — where the classification is `Automation Failure` (a broken selector/reference, not an application defect) — this skill cannot fix the automation itself; it flags the specific test case(s) for the Automation skill to regenerate, per §21's upstream escalation path.
3. Every recommendation is recorded in the Execution Results' Execution Recommendations section (§18) — never only in a narrative aside a reviewer could miss.

# 21. Handoff Contracts

## 21.1 Automation skill → Automation Execution skill

| This skill needs (§4) | Satisfied by (`.claude/skills/automation-skill/SKILL.md` §16/§25) |
|---|---|
| Automation Suite | Automation Package (§16 #2) |
| Automation Summary (Framework Used, Execution Instructions, Coverage, Known Limitations) | Automation Summary (§16 #7, §25) |
| Project Context | Unchanged pass-through from Stage 1 |

**Confirmed Contract Mismatch (identified during the Automation skill's own v3 review, closed from this side):** this skill's §4 previously named the required input "Automation Coverage Summary" at path `AutomationSummary.md` — a filename that Automation skill v2's actual six-artifact split never produced (verified against the real `platform_core_data/runs/RUN-20260706-002/Automation/` output). Automation skill v3 closed this by adding an actual `AutomationSummary` artifact at exactly that path (`.claude/skills/automation-skill/SKILL.md` §16 #7, §25). This skill's §4 row is now renamed "Automation Summary" and its description corrected to match what that artifact actually contains — the mismatch is resolved on both ends as of this pair of revisions. `workflows_and_pipelines/pipeline/pipeline.md` §4 Stage 5's artifact path list still references the same pre-v2 filename in its own prose; that file is out of scope for both this revision and the Automation skill's ("do not modify the pipeline"), so it remains a known, harmless label lag (the actual filename it names now happens to be correct again, by coincidence of the v3 fix, even though the document itself was never updated).

## 21.2 Automation Execution skill → Reporting skill

| Reporting skill needs (`.claude/skills/reporting-skill/SKILL.md` §4) | Satisfied by (this skill's output) |
|---|---|
| Execution Results (`ExecutionResults.md`) | §9 — unchanged path, now internally structured per the Standard Output Contract (§18) |
| Manual Test Suites | Not produced by this skill — unchanged pass-through from Stage 3 |
| Traceability Matrix | Not produced by this skill — unchanged pass-through from Stage 3 |
| Project Context | Unchanged pass-through from Stage 1 |

**No contract mismatch found on this side.** Reporting skill's own spec expects exactly one Execution Results file (not a separate Evidence Inventory/Metrics file) — this revision deliberately keeps the Standard Output Contract's nine sections (§18) *inside* that single existing artifact rather than splitting them into new files, specifically to avoid creating a second instance of the same category of drift just closed in §21.1. Reporting skill's existing per-test read of "Test Case ID, Automation Script ID, Execution Time, Screenshots/Logs references" (its own §4/§9) remains satisfied by this skill's Execution Results section (§18 #3) and Evidence Inventory (§18 #4) — no change required on Reporting's side, and none is made here.

# 22. Metrics

Every Execution Results artifact reports the following, consolidated in its Execution Statistics section (§18 #5):

| Metric | Definition |
|---|---|
| **Execution Duration** | Total wall-clock time for this execution, start to finish. |
| **Pass Rate** | Passed ÷ total executed (excludes Skipped/Blocked/Not Executed from the denominator, stated explicitly). |
| **Failure Rate** | (Failed + Application Failure) ÷ total executed — genuine application-behavior failures, kept distinct from infrastructure-caused non-passes. |
| **Skip Rate** | Skipped ÷ total in scope. |
| **Retry Count** | Total retry attempts made across the run, per §5.4. |
| **Evidence Count** | Total evidence items captured, per §16. |
| **Framework** | The framework actually used (from the Automation Summary, §15). |
| **Execution Mode** | Headless/Headed/Debug, per §5.1. |
| **Environment** | The named environment, per §14. |
| **Coverage Summary** | A restated pointer to the Automation Coverage Report's figures (`.claude/skills/automation-skill/SKILL.md` §16 #5) — this skill does not recompute coverage, only cites it for a reader who wants the figure alongside execution results. |
| **Flaky Test Count** | Count of results classified `Flaky` (§17). |
| **Execution Stability** | Flaky Test Count ÷ total executed — a simple, stated ratio, not a subjective judgment of "how stable" the suite is. |

# 23. Execution Reliability

- **Deterministic execution** — given the same Automation Suite, environment state, and configuration, a rerun produces the same classifications for the same tests; where it doesn't, the divergence is itself reported as `Flaky` (§17), never silently absorbed by re-running until a clean pass appears.
- **Stable ordering** — tests execute in a consistent, recorded order run-to-run (per the suite's own configured order, per `.claude/skills/automation-skill/SKILL.md` §10) unless Parallel execution (§5.3) is explicitly in effect, in which case the non-deterministic ordering itself is noted in Execution Metadata.
- **Repeatability** — a Selective Re-run or Failed Test Re-run (§13) of the same test IDs against an unchanged environment/automation version is expected to reproduce the same outcome; a case that doesn't is flagged `Flaky`.
- **Retry policies** — per §5.4, bounded and recorded, never silent or unbounded.
- **Failure isolation** — one test's failure must not cause unrelated tests to report false failures (e.g., leaked session state, uncleaned test data) — where the Automation skill's own idempotency rule (`.claude/skills/automation-skill/SKILL.md` §14, Execution Rule 20) was followed, this should not occur; where it is observed anyway, it is itself an `Automation Failure` classification (§17), not an application defect.
- **Partial reruns** — Selective Re-run/Resume (§13, §5.5) never silently discard or overwrite the prior execution's recorded outcomes for tests not included in the partial rerun — the full logical picture is always the union, clearly attributed by Execution ID.
- **Idempotent execution** — running the same test twice without an intervening state change produces the same result; where the application itself is not idempotent-safe for a given mutating test, that is a `Skipped`/environment-constraint case (Rule 6), not something this skill works around by suppressing the second run's evidence.

# 24. Future Scalability

The abstractions this revision relies on — framework-agnostic invocation (§15), a Result Classification (§17) already defined in terms of cause rather than "browser passed/failed," and an Evidence Inventory (§16) already itemized by evidence *type* rather than "screenshot" specifically — extend to non-web-UI systems and new testing disciplines with, at most, a new framework entry and new evidence-type rows, never a change to the Traceability fields, Standard Output Contract (§18), or Handoff Contracts (§21):

| Future capability | How it fits today's model |
|---|---|
| **Web** (current) | Baseline. |
| **API** | REST Assured/Postman (already listed, §15.2) as framework; Evidence Inventory's Network Logs/HAR rows already cover request/response capture; no browser-mode concept applies (Execution Mode may be `N/A`). |
| **Mobile** | Appium (already listed) as framework; Evidence Inventory extends with device logs/screen recordings under the existing Videos/Console Logs rows. |
| **Desktop** | A desktop-automation framework slots into §15's extensible framework list the same way SHAFT/Appium already do. |
| **Microservices** | Execution Strategy (§13) already treats a workflow spanning services as one suite, matching the Automation skill's own Suite Planning; Result Classification's Infrastructure/Environment Failure rows already distinguish a downstream service outage from an application defect. |
| **Batch Jobs** | A "test" becomes a job-trigger-and-verify cycle; Evidence Inventory's Execution Logs/Attachments rows already cover job output artifacts. |
| **Queues** | Same pattern — Evidence Inventory covers published/consumed message payloads as Attachments. |
| **Cloud Resources** | Environment Awareness (§14) already names Cloud as a deployment substrate; Framework Detection extends to a cloud provider's SDK/CLI. |
| **Performance Testing** | A new Result Classification consideration (a performance test "fails" on a threshold breach, not a boolean assertion) — fits under Application Failure (threshold genuinely breached) versus Infrastructure Failure (the load-generation infrastructure itself failed), without a new Status value. Metrics (§22) would extend with latency/throughput figures alongside the existing set. |
| **Security Testing** | Fits the existing model directly — a security assertion is still a Passed/Failed/Application Failure classification; Evidence Inventory's Network Logs/HAR rows are often the primary evidence type for this discipline already. |
| **Accessibility Testing** | An accessibility-scan result is still a test with a Status; Evidence Inventory extends with an "Accessibility Report" row alongside Framework Reports. |
| **Distributed Execution** | Concurrency Mode (§5.3) already models "more than one worker"; distributed execution across multiple machines/runners is the same concept at larger scale — Execution Metadata records however many distributed workers/nodes were used, the same way it records a local Parallel worker count. |

**What would need to change, explicitly, and what would not:** supporting any of the above requires naming a new framework (§15) and/or a new Evidence Inventory row (§16) — it requires **no change** to the Result Classification's cause-based structure (§17), the Standard Output Contract (§18), the Stop Conditions/Recovery Strategy (§19–§20), or either Handoff Contract (§21). Those are already defined in terms of test outcomes and evidence, not in terms of "a browser."

# 25. Automation Repair Loop

**Every execution that produces at least one `Automation Failure` (§17) triggers this loop before the run is considered finished** — it is not an optional follow-up, and it is not silent auto-repair either. Only `Automation Failure` triggers it; `Application Failure`, `Environment Failure`, `Infrastructure Failure`, `Configuration Failure`, and `Inconclusive` do not (an `Inconclusive` result is presented to the human separately, alongside the Repair Summary, but is never folded into an automatic repair proposal — its cause isn't yet known to be automation-side).

## 25.1 Step 1 — Inspect, consult, and propose (no code change yet)

For every `Automation Failure`, inspect the failure evidence (Evidence Inventory, §16) and:

1. **Consult the Automation Repair Knowledge Base first** (§28) — if a confirmed rule matches this failure pattern, it is presented as a candidate strategy (citing its Rule ID) rather than re-derived from scratch.
2. **Run the Repair Strategy Decision Engine** (§26) — identify every reasonable repair strategy (not just one), including any KB-sourced candidate, before any code changes.
3. **Produce a Repair Confidence Report** (§27) for the strategy ultimately selected (§26.2) — this replaces the simpler `Reason / Proposed Fix / Confidence (High/Medium/Low)` format used the first time this loop ran; every confidence value is a percentage derived from cited evidence, never invented.

A pattern with no repairable strategy at all, or where every candidate strategy carries low confidence, is still reported in full (never silently dropped) — low confidence is disclosed, not hidden or omitted.

## 25.2 Step 2 — Ask once (Human Decision — not an Engineering Decision, per `workflows_and_pipelines/pipeline/pipeline.md` §5.5)

After presenting every Repair Summary entry together, ask exactly once:

```
Repair automation and rerun ONLY affected tests?
1. Repair and rerun affected tests
2. Mark as Known Automation Issue
3. Skip repair
```

This is asked once for the whole batch of Automation Failures from this execution, not once per test case, and this skill does not proceed with any repair before this question is answered — even though the individual fixes (a missing wait, a corrected assertion string) would ordinarily be exactly the kind of Engineering Decision `workflows_and_pipelines/pipeline/pipeline.md` §5.5 says to make automatically. The distinction: those rules govern Test Design–time authoring; this gate governs *re-executing against a real (often shared) environment*, which is why it stays a Human Decision.

## 25.3 Step 3 — Repair scope (if approved)

If the human chooses "Repair and rerun affected tests":

1. **Modify only the generated Automation Package** — the specific files responsible for the diagnosed issue (Page Object methods, locators, wait logic, assertion values).
2. **Never modify Discovery artifacts** (Timeline, Coverage Summary, QA Assessment Report, Findings) — a repair may *reveal* something Discovery should eventually re-verify, but that is a recommendation surfaced in the comparison report (§25.4), never an in-place edit here.
3. **Never modify Project Context or any other project documentation.**
4. **Never modify approved Manual Test Cases** unless the human explicitly, separately requests it — a corrected assertion value inside the *automation* is not the same thing as amending the Test Case document itself; where they now disagree, that disagreement is disclosed in the comparison report, not silently reconciled by editing the Test Case.
5. **Rerun only the tests that were repaired** — never the full suite, unless every test in the suite happened to need repair.

## 25.4 Step 4 — Before/After comparison report

After the targeted rerun, produce a comparison covering:

- **Fixed tests** — repaired and now passing; labeled `Automation Repaired`, never `Passed` outright, so a reviewer can see this result required a fix, not a clean first attempt.
- **Remaining failures** — repaired but still failing (the fix didn't resolve it, or surfaced a different issue).
- **New failures** — anything that passed before the repair but fails after it (a regression introduced by the fix itself).
- **Root cause** and **Confidence**, carried forward per test case from §25.1, updated with the actual rerun outcome.

For every test in **Fixed**, write or update an Automation Repair Knowledge Base rule (§28) — this is the *only* point at which the KB is ever written. Nothing in **Remaining failures** or **New failures** is written to the KB, per §28's "confirmed-only" rule — a repair that didn't work is not knowledge, no matter how plausible it looked in the Repair Confidence Report.

## 25.5 If declined or marked Known Issue

- **"Mark as Known Automation Issue"**: the test's classification stays `Automation Failure`, but it is additionally tagged `Known Automation Issue` in the Execution Results, with the Repair Summary's diagnosis attached — so a future execution doesn't re-diagnose the same thing from scratch.
- **"Skip repair"**: no code change, no rerun; the original classification and evidence stand as the final result for this execution.

## 25.6 Application Health / Automation Health / Environment Health — always separated

The final Execution Results (§18) never reports one merged "Failed" count. It reports three distinct headline figures:

- **Application Health** — pass/fail counted only from `Application Failure` classifications (plus genuine Passed results) — this is the only figure that speaks to whether the application under test is actually working.
- **Automation Health** — `Automation Failure` (and, after this loop, `Automation Repaired`) counted separately — this speaks to the quality/maintenance state of the generated suite, not the application.
- **Environment Health** — `Environment Failure`/`Infrastructure Failure`/`Configuration Failure` counted separately — this speaks to the target environment/execution infrastructure, not either of the above.

`Inconclusive` and `Flaky` are reported as their own line, not folded into any of the three health figures, since folding them in either direction would misrepresent which system is actually at fault.

# 26. Repair Strategy Decision Engine

**Before any code is modified, identify every reasonable repair strategy for the failure — never just one.** This runs as part of §25.1, for every `Automation Failure` (and any `Inconclusive` the human has chosen to include in the repair pass). **Diagnosis and Repair are never the same decision — see §26.0 first.**

## 26.0 Root Cause Confidence gate — Diagnosis vs. Repair

Before enumerating strategies, classify the current Root Cause Confidence for this specific failure — **High / Medium / Low** — and always state which state it's in, so the human always knows whether this skill is currently trying to *understand* the problem or *fix* it:

| Root Cause Confidence | Meaning | Required Action |
|---|---|---|
| **High** | The evidence directly and unambiguously explains the failure — no material open question about *why* it happened. | Proceed straight to §26.1, Repair Strategies only. |
| **Medium** | Part of the picture is confirmed (e.g., a bug in the automation's own retry logic), but a real open question remains about the underlying cause — a repair attempted now would be a guess with unclear odds. | Recommend a lightweight Diagnosis Strategy (§26.1) *before* proposing any Repair Strategy — do not modify automation yet on the strength of a Medium-confidence guess. |
| **Low** | The evidence doesn't meaningfully explain the failure. | Recommend Diagnosis only. **Do not propose or apply a repair.** |

**Diagnosis Strategies and Repair Strategies are never ranked or compared against each other in the same list** — they answer different questions (understand vs. fix) and use different criteria (a diagnosis step has no "regression risk" or "fixes the test" outcome; a repair does). Present them as two clearly separated categories:

- **Diagnosis Strategies** (evidence-gathering, no code/behavior change): collect a DOM snapshot, capture network log, capture console errors, capture page source, record additional evidence.
- **Repair Strategies** (an actual code change, per §26.1's format): update a locator, add synchronization, update an assertion, replace a brittle selector, refactor Page Object logic.

**If a selected Diagnosis Strategy's evidence resolves the open question, this skill automatically returns to Repair Strategy selection (§26.1) using that new evidence** — this is not a second, separate human ask; the loop-back itself is expected and automatic once real evidence exists, only the *resulting* repair proposal goes through the normal §26.2/§25.2 gates again.

## 26.1 Enumerate strategies

For each failure, list 2–4 named strategy options, each with:

```
Option {A/B/C}
{Strategy name}

Pros
{brief}

Risk
{Low | Medium | High} — regression risk this specific strategy introduces

Confidence
{percentage — derived per §27.2, never invented}
```

If §28's Knowledge Base has a confirmed rule matching this exact failure pattern, that rule's approach is always included as one of the options, explicitly citing its Rule ID and confirmation count — it does not automatically win by default, but it does not get silently omitted either.

## 26.2 Ask once (Human Decision)

After every failure's options are listed, ask exactly once, for the whole batch:

```
Which repair strategy should be used?
1. Highest confidence
2. Lowest regression risk
3. Fastest execution
4. Custom
5. Let platform recommend
```

- Options 1–3 apply mechanically per failure (whichever listed option scores best on that axis) — no further back-and-forth per test case.
- **Custom**: the human specifies which option to use, potentially differing per failure; this skill asks follow-up only for the specific failures where the human's custom instruction is ambiguous, never for every failure by default.
- **Let platform recommend**: this skill picks per failure and states, in one line, why (e.g., "Option A — highest confidence and lowest risk, no tradeoff to weigh").

This question may be asked in the same exchange as §25.2's repair-and-rerun gate (a single consolidated ask, per the established pattern at `.claude/skills/automation-skill/SKILL.md` §33.1) — but it is a distinct decision, never inferred from the other.

# 27. Repair Confidence Engine

**Every proposed repair, once a strategy is selected (§26.2), is presented as a structured Repair Confidence Report — never a bare "Fixed" or "Probably fixed."**

## 27.1 Report format

```
Repair Confidence Report

Test Case:
{Test Case ID}

Classification:
{Automation Failure | Inconclusive (pre-repair)}

Root Cause:
{one-line, evidence-backed}

Proposed Repair:
{one-line description of the code change}

Confidence:
{percentage}

Reasoning:
- {evidence-based factor}
- {evidence-based factor}
- {...}

Regression Risk:
{Low | Medium | High} — brief reason

Evidence:
{before-state reference} / {after-state reference, once rerun; "pending rerun" before that}
```

## 27.2 Deriving Confidence — never invented

Confidence is a percentage built additively from **only** these observed-evidence factors — never a round number chosen because it "feels right," and every contributing factor must be named in Reasoning:

| Factor | Contribution | Requires |
|---|---|---|
| Root cause directly observed (log timestamp, stack trace, screenshot) rather than guessed | Base 40–60% | The specific evidence artifact is cited |
| Repair directly targets that observed root cause (not an adjacent/speculative cause) | +10–15% | The causal link is stated, not assumed |
| Failure reproduced more than once with the same signature | +10% | Cite the occurrences (e.g., "same failure reproduced twice") |
| A confirmed Knowledge Base rule (§28) matches this exact pattern | +15%, scaling with the rule's confirmation count | Cite the Rule ID and confirmation count |
| The fix has been statically verified (compiles / lints clean) before rerun | +5% | Cite the check performed |
| Novel pattern, no prior confirmation anywhere | Capped at 60% regardless of other factors | — |

A report is never issued above 95% before the repair is actually rerun and confirmed — the pre-rerun number is a *proposed* confidence, and the Evidence field distinguishes it from the *confirmed* outcome once the rerun completes (§25.4).

# 28. Automation Repair Knowledge Base

**A two-layer, cross-run store of repair patterns, per the Knowledge Architecture (`workflows_and_pipelines/pipeline/pipeline.md` §10) — distinct from `.claude/skills/automation-skill/SKILL.md` §11's "Automation Knowledge Base," which is reusable *code assets* within one project's package.** This one is reusable *repair reasoning*: what failure pattern, what fix worked, under what conditions.

- **This run's record (always written):** the Repair Summary in `platform_core_data/runs/{{RUN_FOLDER}}/execution/` — the full per-execution narrative of what failed, what was tried, and what worked.
- **Platform Knowledge (read always; written only via Promotion):** `platform_core_data/knowledge_base/patterns/repair_patterns/REPAIR-{NNN}.md` and `platform_core_data/knowledge_base/patterns/reasoning/REASON-{NNN}.md` — generalized, cross-project repair/reasoning patterns.

> **Revision (2026-07-27, user-mandated):** there is no longer a project-scoped `knowledge_base/repair/` layer. It was removed along with `execution/`, `findings/`, and `ui/` — all four had stood empty since the platform's inception, and a write target that is never read is a place for knowledge to go and be forgotten. A confirmed repair is now recorded **once**, in the producing run's Repair Summary, and carried across runs only by passing the §28.2 Promotion gate into `patterns/`. The trade-off is deliberate and worth stating plainly: an unpromoted repair is no longer discoverable from a later run, so **Promotion is now the only mechanism for cross-run repair memory** — §28.2's question matters more than it did when a project-scoped fallback existed.

Every read consults Platform Knowledge (`pipeline.md` §10.2) plus the Repair Summaries of prior runs. Writes never touch `platform_core_data/knowledge_base/patterns/` directly, per §10.5's Promotion Workflow below.

## 28.1 Write rule — confirmed repairs only

**A rule is written or updated at exactly one point: §25.4, for a test in the Fixed column.** Never for a proposed-but-unexecuted repair, never for a repair attempt that remained in Remaining Failures or introduced a New Failure. "Do not learn from failed repairs" is absolute — a repair that looked high-confidence and still didn't work contributes nothing to the Knowledge Base, however plausible the original Reasoning was.

The confirmed repair is recorded in this run's Repair Summary (schema, §28.2). Once recorded, evaluate whether it qualifies for Promotion to Platform Knowledge (§28.2) — a separate, explicit step, never bundled silently into the same write.

## 28.2 Recording a confirmed repair, and Promotion to Platform Knowledge

Each confirmed repair is recorded in this run's Repair Summary with enough detail to stand alone:

```
Implements Platform Pattern:
{Platform Pattern ID, e.g. REPAIR-{NNN} or REASON-{NNN} — or "none yet" if this is a
new, not-yet-generalized pattern}

Execution Context:
{Execution ID(s), suite, Test Case ID(s)}

What Happened:
{the failure pattern addressed and the fix that worked, in this project's own terms}
```

Then propose promotion (per `workflows_and_pipelines/pipeline/pipeline.md` §10.5) when the pattern is genuinely reusable beyond this one application (e.g., a synchronization strategy, a locator-recovery technique, a framework-level hazard) — never for something tied to this application's own specific behavior. Ask exactly once, per §10.5's exact question.

**Because the project-scoped layer is gone, a declined promotion means the repair lives only in this run's Repair Summary.** That is the intended behavior, not an oversight — but it makes the judgment call real: a genuinely reusable pattern left unpromoted will be rediscovered the hard way, by failing again in a later run. If approved:

```
ID:
REPAIR-{NNN}  (or REASON-{NNN} for a reasoning/process pattern rather than a code-level repair)

Problem:
{the failure pattern, generalized beyond the one project/test case}

Strategy:
{the fix that worked, generalized}

Applicable Conditions:
{what kind of test/flow/framework this generalizes to}

Confidence:
Confirmed by {N} execution(s), across {M} project(s)

Confirmed In:
{the run folder(s) and Execution ID(s) whose Repair Summary backs this,
e.g. "run-004__2026-07-27_14-30-05__Smoke__Login / EXEC-002"}
```

A later run independently confirming the same Platform pattern increments its confirmation count and appends its own run reference as an additional "Confirmed In" entry — it does not create a duplicate Platform document, and the detailed per-execution narrative stays in that run's Repair Summary, never copied into the Platform document (avoiding duplication across layers).

## 28.3 Read rule — consult before creating something new

- **Automation Execution skill (§25.1)**: before proposing a new repair strategy, check Platform Knowledge (`platform_core_data/knowledge_base/patterns/repair_patterns/`, `platform_core_data/knowledge_base/patterns/reasoning/`) for a matching rule, then this project's prior-run Repair Summaries under `platform_core_data/runs/*/execution/`; if found, include it as a candidate option (§26.1), explicitly cited by ID or by run reference.
- **Automation skill**: before generating any new automation (`.claude/skills/automation-skill/SKILL.md` §5, §11), consult Platform Knowledge for patterns relevant to the flows being automated (e.g., a Login suite consults any rule tagged "Authentication flows") and applies a matching rule's approach proactively, rather than waiting to discover the same failure via execution again.

## 28.4 Explainability

Every recorded repair and every Platform rule must remain independently reviewable — a human reading one entry, with no other context, can tell what problem it solves, what fix worked, where it generalizes, and which real executions back it. A rule that can't be explained this plainly is not ready to be written. A Platform-layer rule must additionally be reviewable *without* opening the run whose Repair Summary it came from — its Problem/Strategy/Applicable Conditions must stand on their own, generalized, with the run cited only as supporting evidence, not as required context.

# 29. Explainability & Platform Rules

The platform must always be able to answer, for any repair, past or present:

- **Why was this repair chosen?** — the Repair Confidence Report's Root Cause + Reasoning (§27.1).
- **Which previous executions support it?** — the Platform pattern's Confirmed In entries (§28.2), if one was reused, or "none — first occurrence" if not.
- **What confidence does it have?** — the Repair Confidence Report's Confidence field, always a percentage traceable to §27.2's factors.
- **Which rule was reused?** — the cited Rule ID (§26.1), or "none — new pattern" if this repair created new knowledge rather than reusing it.

Hard constraints, restated explicitly (all already established individually across §25/§28, consolidated here for a single point of reference):

1. Never hide a failure — every classification, repaired or not, is reported (§18, §25.6).
2. Never silently rewrite a Test Case — §25.3 rule 4.
3. Never silently overwrite a Reference Automation Project — `.claude/skills/automation-skill/SKILL.md` §32.2.
4. Never update Test Cases automatically — §25.3 rule 4 (only on a separate, explicit request).
5. Never update Discovery artifacts automatically — §25.3 rule 2.
6. Never learn from a failed repair — §28.1.
7. Every learning artifact (Knowledge Base rule) must remain explainable and reviewable — §28.4.

# 30. Direct Invocation

This skill is independently invocable — `/automation-execution-skill`, optionally with a run-scoped instruction (e.g. `/automation-execution-skill run the Login spec only, headed`). Full rules: `workflows_and_pipelines/pipeline/pipeline.md` §5.3.1.

- **Instruction prompts are run-scoped, never spec-overriding** (§5.3.1 #3). An instruction may set the Execution Scope (a subset, a failed-test re-run) and may supply the Execution Mode explicitly — supplying it in the invocation is a valid answer to Rule 3's question, and is recorded in the run-identity header exactly as a Run Configuration value would be. An instruction never authorizes assuming a *default* mode when none is given anywhere (Rule 3's halt stands), proceeding against an environment that mismatches the Project Context (Rule 1), running destructive actions the Project Context does not authorize, executing against a Workspace Automation Baseline instead of this run's working copy (§22), or entering the Automation Repair Loop without §25.2's human answer.
- **Upstream `Pending Automation Approval` → request approval, then recommend** (§5.3.1 #4). This is the strictest gate in the pipeline (§5.2): approving it authorizes code to run against a real environment. A direct invocation never substitutes for it. Report it and offer both paths (approve → `/automation-execution-skill`, or revise → `/automation-skill <feedback>`).
- **Missing upstream → run degraded** (§5.3.1 #5):
  - *No Automation Package:* nothing to execute — existing §19 Stop Condition stands. This skill never generates what it would then run.
  - *No Automation Summary:* if the framework and execution command can be determined from the package itself, execute and mark the Results' framework basis as `Inferred from package — Requires Upstream Stage`. If the framework cannot be determined, the existing Missing Framework halt applies (§15 — this skill never selects one).
  - *No Project Context:* execute only if the target environment is supplied in the invocation; record the environment/safety basis as `Open Question — Requires Stage 1`, and treat every destructive action not authorized by default as prohibited.
- **Closing message must recommend the next step** (§5.3.1 #6):

```
Stage 6 complete — Execution Results
  platform_core_data/runs/{{RUN_FOLDER}}/execution/ExecutionResults.md
  {P} Passed | {F} Failed | {S} Skipped | {B} Blocked
  Application {a} / Automation {b} / Environment {c} failures
  Execution Mode: {mode}

Next step — either:
  1. Produce the final report:   /reporting-skill
  2. Repair automation failures: /automation-execution-skill repair   (§25.2 gate applies)
  3. Re-run failures only:       /automation-execution-skill re-run failed
```
