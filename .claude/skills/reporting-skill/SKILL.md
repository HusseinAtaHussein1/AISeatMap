---
name: reporting-skill
description: Stage 7 of 7 (terminal stage) in the Agentic AI Testing Platform pipeline. Synthesizes raw Execution Results, the Traceability Matrix, and the Project Context into a stakeholder-facing Final QA Report — Requirement Coverage, Automation Coverage, defects, and resolved assumptions/risks. Use when producing the final QA report after an execution run.
inputs:
  - name: execution_results
    type: file_path
    required: true
    description: "`platform_core_data/runs/{{RUN_FOLDER}}/execution/ExecutionResults.md` — sole source of pass/fail/skip outcomes."
  - name: manual_test_suites
    type: file_path
    required: true
    description: "`platform_core_data/runs/{{RUN_FOLDER}}/test_design/TestCases_*.md`."
  - name: traceability_matrix
    type: file_path
    required: true
    description: "`platform_core_data/runs/{{RUN_FOLDER}}/test_design/TraceabilityMatrix.md`."
  - name: project_context
    type: file_path
    required: true
    description: "`platform_core_data/runs/{{RUN_FOLDER}}/context/ProjectContext.md` — for resolving carried-forward assumptions/risks."
outputs:
  - name: final_qa_report
    type: file_path
    location: "platform_core_data/runs/{{RUN_FOLDER}}/reporting/Final_QA_Report.md"
    description: "Stakeholder-facing report — Executive Summary, Requirement Coverage, Automation Coverage, Defect Summary, Risks, Recommendations."
dependencies:
  - automation-execution-skill, test-design-skill, project-context-skill (upstream skills)
  - "platform_core_data/knowledge_base/patterns/reporting/ (Platform Knowledge patterns, if any promoted)"
---

> **Pipeline position:** Stage 7 of 7 — final stage, consumes Execution Results, produces the Final QA Report.
> **Traceability:** `Execution → Reports`.
> **Revision history:** see `docs/CHANGELOG.md`.

> **Revision note (2026-07-27, user-mandated):** artifacts now live in this run's own Run Folder (`platform_core_data/runs/{{RUN_FOLDER}}/{stage}/`) — `platform_core_data/workspace/` is removed, and the persistent Workspace Automation Baseline now lives at `platform_core_data/automation_baseline/{framework}/`. Each Markdown artifact is **one file, edited in place**: no `.vN` suffixes, and **no duplicate "final" copy is ever written on approval**. Refinement edits the same file the reviewer read. Git is the version history. See `workflows_and_pipelines/pipeline/pipeline.md` §7 and §12.

# 1. Skill Name

**Reporting skill**

# 2. Purpose

The Reporting skill is the final stage of the pipeline. It synthesizes the raw Execution Results into a clear, accurate, stakeholder-facing QA report — computing requirement and automation coverage against the Manual Test Suites' Traceability Matrix, resolving the status of every carried-forward assumption/risk from the Project Context, and surfacing defects and recommendations. It reports what happened; it does not re-run tests, re-interpret code, or diagnose root cause.

# 3. Responsibilities

- Read the Execution Results as the sole source of pass/fail/skip/error outcomes — never fabricate or estimate a result not present there.
- Read the Manual Test Suites and Traceability Matrix to compute two distinct coverage measures:
  - **Requirement Coverage** — what fraction of Project Context requirements have at least one traced, executed test case
  - **Automation Coverage** — what fraction of designed manual test cases were successfully automated and executed
- Read the Project Context to cross-reference every carried-forward assumption/risk and state whether execution confirmed it, refuted it, or left it still unverified.
- Group defects/failures by module and assign a severity, based strictly on the failure evidence in the Execution Results.
- Explicitly call out anything designed but never automated, and anything automated but never executed — gaps are reported, not hidden.
- Produce recommendations and next steps, clearly framed as suggestions requiring follow-up (e.g., developer investigation), never as an implied code fix already applied.
- Never alter execution results, test cases, or the Project Context to make outcomes look better than they were.

# 4. Inputs

| Input | Role | Required? | Description |
|---|---|---|---|
| Execution Results | Primary | Required | `platform_core_data/runs/{{RUN_FOLDER}}/execution/ExecutionResults.md` |
| Manual Test Suites | Required | Required | `platform_core_data/runs/{{RUN_FOLDER}}/test_design/TestCases_*.md` (Markdown and/or Excel) |
| Traceability Matrix | Required | Required | `platform_core_data/runs/{{RUN_FOLDER}}/test_design/TraceabilityMatrix.md` |
| Project Context | Required | Required | `platform_core_data/runs/{{RUN_FOLDER}}/context/ProjectContext.md` |

# 5. Outputs

**Final QA Report** — the stakeholder-facing synthesis of the entire pipeline run: what was tested, what passed/failed, how much of the Project Context is covered, how much of the manual suite is automated, what remains unverified, and what should happen next.

# 6. Allowed Tools

- File tools: Read (execution results, test suites, traceability matrix, Project Context), Write (final report)
- Directory-listing shell commands (read-only)

**Not permitted:** browser automation tools, code execution tools, or any tool that could re-run tests or mutate application data. This skill only reads and synthesizes.

# 7. Execution Rules

1. Must base every statistic and outcome strictly on the Execution Results — no invented, estimated, or "typical" results.
2. Must explicitly report test cases that were designed but not automated, and automated but not executed — gaps are visible, never silently dropped.
3. Must preserve and resolve every "Assumption-based test" flag: state whether it was confirmed, refuted, or remains unverified based on the execution outcome.
4. Must compute Requirement Coverage and Automation Coverage as two separate, clearly labeled figures — never conflate "we tested it" with "we automated it."
5. Must not recommend a specific code fix as if already applied — findings are reported as needing developer investigation.
6. Must not re-run any test or modify upstream artifacts (Execution Results, test cases, Project Context, PRD).
7. Must group defects by module and assign severity based only on evidence present in the Execution Results.

# 8. Expected Artifacts

| Artifact | Path | Template |
|---|---|---|
| Final QA Report | `platform_core_data/runs/{{RUN_FOLDER}}/reporting/Final_QA_Report.md` | [`platform_core/templates/stage_7_reporting/Final_QA_Report.md`](../../../platform_core/templates/stage_7_reporting/Final_QA_Report.md) |

**Document structure is defined by the template, not restated here.** Render the report by copying the
template and filling its `{{PLACEHOLDER}}` tokens; its section order is mandatory and its inline
`<!-- -->` guidance is stripped from the rendered output. The template also encodes this stage's
degraded-run markings (§12), so an absent input renders as a named gap rather than a favourable
result. `platform_core/templates/README.md` states the conventions every template follows.

# 9. Operational Contract

Role: execution-to-stakeholder-report synthesis (Stage 7 of 7, terminal).

Synthesize raw execution results into a clear, accurate, stakeholder-facing QA report based only on the Execution Results, the Manual Test Suites / Traceability Matrix, and the Project Context. Execution is fully specified above — §3 (Responsibilities, incl. the two distinct coverage measures), §4 (Inputs), §5 (Outputs), §7 (Execution Rules), §8 (Artifacts and the eight required report sections). This section adds no rules of its own; the contract is stated once above rather than restated here.

# 10. Example Execution

*Illustrative only — not executed as part of this task.*

```text
Input:
  platform_core_data/runs/{{RUN_FOLDER}}/execution/ExecutionResults.md
  platform_core_data/runs/{{RUN_FOLDER}}/test_design/TestCases_Admin.md
  platform_core_data/runs/{{RUN_FOLDER}}/test_design/TestCases_PIM.md
  platform_core_data/runs/{{RUN_FOLDER}}/test_design/TestCases_Leave.md
  platform_core_data/runs/{{RUN_FOLDER}}/test_design/TraceabilityMatrix.md
  platform_core_data/runs/{{RUN_FOLDER}}/context/ProjectContext.md
```

Hypothetical result: `platform_core_data/runs/{{RUN_FOLDER}}/reporting/Final_QA_Report.md` stating, e.g., an Executive Summary of overall run health; a Detailed Execution Report listing each of the 36 executed tests with its Test Case ID and Automation Script ID; Passed/Failed Statistics showing 31 passed / 3 failed / 2 skipped; a Defect Summary describing TC-PIM-013, TC-PIM-014, and TC-LEA-013; Requirement Coverage showing, e.g., 47 of 52 traced Project Context requirements have an executed test; Automation Coverage showing 36 of 56 manual test cases were automated; and a Risks section noting that SR-5 (brute-force protection) remains unverified because the corresponding test was never authorized to run against the shared demo environment.

# 11. Architecture Principle

> Agents communicate through artifacts only. Each has a single responsibility. Every output becomes the input of another whenever applicable.

For this skill specifically: its single responsibility is synthesis and reporting — never re-testing or code diagnosis. It is the terminal node of the pipeline; its output is consumed by human stakeholders, not by another skill.

# 12. Direct Invocation

This skill is independently invocable — `/reporting-skill`, optionally with a run-scoped instruction (e.g. `/reporting-skill executive summary only`). Full rules: `workflows_and_pipelines/pipeline/pipeline.md` §5.3.1.

- **Instruction prompts are run-scoped, never spec-overriding** (§5.3.1 #3). An instruction may set report emphasis, audience, or section depth. It never authorizes re-testing, code diagnosis, inferring an outcome not present in the Execution Results (§7), or reading the PRD directly — this skill reports what the artifacts say, nothing more.
- **Upstream `Pending Review` → request approval, then recommend** (§5.3.1 #4). Report which input is open, then offer both paths (approve → `/reporting-skill`, or revise → the producing skill's command).
- **Missing upstream → run degraded** (§5.3.1 #5). This is the terminal stage and the most common legitimate direct-invocation target — a report on a partial run is often exactly what is wanted. Report on whatever exists, and state the basis explicitly:
  - *No Execution Results:* report coverage and design status only. Mark every outcome-dependent section (`Defect Summary`, pass/fail figures, Automation Coverage) as `Not Executed — Requires Stage 6`, never as zero defects or as passing.
  - *No Traceability Matrix:* omit the Requirement Coverage table and state why, rather than computing coverage from an incomplete basis.
  - *No Project Context:* carry no assumption/risk resolution section; mark it `Requires Stage 1`.
  - **A gap is always reported as a gap, never as a favourable result.** An absent input must never render as 0 defects, 100% pass, or full coverage.
- **Closing message must state the report's basis** (§5.3.1 #6):

```
Stage 7 complete — Final QA Report
  platform_core_data/runs/{{RUN_FOLDER}}/reporting/Final_QA_Report.md
  Basis: {inputs present} | Declared gaps: {inputs absent}

Next step — either:
  1. Regenerate with different emphasis:  /reporting-skill <your focus>
  2. Fill a declared gap first:           /automation-execution-skill   (then re-report)
```

# 13. Resolving `{{RUN_FOLDER}}`

Every path in this specification containing `{{RUN_FOLDER}}` resolves to the **active run**, recorded
at `platform_core_data/runs/current_active_run.json` — the single fact that says which of a project's
many runs the pipeline is currently working in (`workflows_and_pipelines/pipeline/run_manager.md` §5.7).

```bash
node platform_core/tools/run_manager/cli.js active   # -> the run folder name to write into
node platform_core/tools/run_manager/cli.js list     # every run, newest first, active marked *
```

- **Never hand-pick, guess, or infer a run folder.** Resolve it from the pointer (`resolveActiveRunFolder()` in JS, or the `active` verb). A stage that writes into a run it guessed at is exactly how one logical run's artifacts end up scattered across several folders.
- **No active run → ask, never assume.** If the pointer is absent, stop and ask which run to use, listing what exists. Never fall back to "the newest run" or create one silently.
- **A pointer naming a missing folder → report it and stop.** A stale pointer means the run was deleted or renamed; redirecting this stage's output into some other run would corrupt both.
- **The pointer is sticky.** It stays on the same run across invocations until someone switches it, so a multi-stage session keeps writing into one run without restating which.
- **Switching runs is the human's call.** This stage never rewrites the pointer to redirect its own output. Working on a different run means the switch happens first, as an explicit step (`cli.js use <run>`).

This stage never creates a run. It reports on the active run, and is the most common target of a deliberate switch back to an older run ("re-report on run-002").

## Inherited artifacts and code drift

A run may be a **refinement** of an earlier one (`run_manager.md` §5.9). Such a run carries
`metadata/lineage.json` recording `inheritsFrom` / `supersedes`, and its inherited artifacts live in
the prior run and are **referenced by path, never copied** (`pipeline.md` §7 "Cross-run reuse").

```bash
node platform_core/tools/run_manager/cli.js drift          # what moved in the app since this run was anchored
node platform_core/tools/run_manager/cli.js drift --json    # machine-readable, exit 2 when not "unchanged"
```

- **Resolve `{{PRIOR_RUN_FOLDER}}` from the lineage record**, via `resolvePriorRunFolder()` — never by
  picking a plausible-looking earlier run. A run with no lineage record inherits nothing.
- **An inherited artifact is an input, not a conclusion this run has re-established.** Cite it by its
  prior-run path so a reader can see it was inherited rather than produced here.
- **Drift decides what may be reused as-is.** When `drift` reports `moved`, every inherited finding,
  test case, or locator touching a changed path is **unverified against current code** until this run
  re-checks it. Say so explicitly rather than presenting it as still current.
- **`unknown-*` is not `unchanged`.** No anchor, no git, or an unresolvable ref all mean drift could
  not be computed — treat inherited conclusions as unverified, never as confirmed.
- **A refinement targets today's project state.** The prior run described the app at its own
  `targetRef`; this run describes it now. Never carry forward a conclusion that drift contradicts.
