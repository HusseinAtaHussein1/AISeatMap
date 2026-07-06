# Run Manifest — OrangeHRM

Tracking artifact maintained by the Run Manager (`pipeline/run_manager.md`), per `pipeline/pipeline.md` §7. Records every stage version produced, its checkpoint status, approving reviewer, and a link to the artifact — cumulative across all runs for this project.

| Run ID | Stage | Version | Timestamp (UTC) | Checkpoint Status | Reviewer | Artifact Link |
|---|---|---|---|---|---|---|
| RUN-20260706-001 | Stage 1 — Project Context Agent | v1 | 2026-07-06T10:02:30Z | Approved | Aymoon (Business Analyst / Product Owner role) | `artifacts/OrangeHRM/context/OrangeHRM_ProjectContext.v1.md` (current approved pointer: `artifacts/OrangeHRM/context/OrangeHRM_ProjectContext.md`) |
| RUN-20260706-001 | Stage 2 — Explorer Agent | v1 | 2026-07-06T10:24Z–10:42Z | Pending Review | *(unassigned)* | `artifacts/OrangeHRM/runs/RUN-20260706-001/reports/QA_Assessment_Report.md`, `artifacts/OrangeHRM/runs/RUN-20260706-001/discovery/*.md`, `artifacts/OrangeHRM/runs/RUN-20260706-001/findings/Findings_Summary.md` |

## Artifact Location Note (Stage 2, this run)

Per explicit instruction, this run's Stage 2 outputs are generated **inside the Run Workspace only** (`artifacts/OrangeHRM/runs/RUN-20260706-001/`), not at the flat `artifacts/OrangeHRM/discovery/`, `artifacts/OrangeHRM/Reports/`, `artifacts/OrangeHRM/findings/` paths that `agents/explorer_agent.md` §10 nominally specifies. This avoids any collision with, or risk to, the pre-existing legacy-pipeline artifacts at those flat paths (in particular `artifacts/OrangeHRM/Reports/QA_Assessment_Report.md`, which predates this run and must remain unmodified). No legacy artifact was renamed, moved, or overwritten — the baseline `discovery/` and `findings/` directories at the project root remain intact (the latter was already empty prior to this run, since Findings are a new-architecture concept with no legacy equivalent).

Five files were briefly written to the flat `artifacts/OrangeHRM/discovery/` and `artifacts/OrangeHRM/findings/` paths earlier in this run's Stage 2 execution, before being relocated into the Run Workspace for the reason above. Original → relocated path, for traceability:

| Original path (as first written) | Relocated path (current, authoritative) |
|---|---|
| `artifacts/OrangeHRM/discovery/login_initial.md` | `artifacts/OrangeHRM/runs/RUN-20260706-001/discovery/login_initial.md` |
| `artifacts/OrangeHRM/discovery/login_validation_states.md` | `artifacts/OrangeHRM/runs/RUN-20260706-001/discovery/login_validation_states.md` |
| `artifacts/OrangeHRM/discovery/login_bruteforce_probe.md` | `artifacts/OrangeHRM/runs/RUN-20260706-001/discovery/login_bruteforce_probe.md` |
| `artifacts/OrangeHRM/discovery/login_deeplink_and_successful_login.md` | `artifacts/OrangeHRM/runs/RUN-20260706-001/discovery/login_deeplink_and_successful_login.md` |
| `artifacts/OrangeHRM/discovery/forgot_password_flow.md` | `artifacts/OrangeHRM/runs/RUN-20260706-001/discovery/forgot_password_flow.md` |
| `artifacts/OrangeHRM/findings/Findings_Summary.md` | `artifacts/OrangeHRM/runs/RUN-20260706-001/findings/Findings_Summary.md` |
| `artifacts/OrangeHRM/findings/FINDING-001_EmojiUsernameUnexpectedError/` (dir) | `artifacts/OrangeHRM/runs/RUN-20260706-001/findings/FINDING-001_EmojiUsernameUnexpectedError/` |
| `artifacts/OrangeHRM/findings/FINDING-002_NoBruteForceProtection/` (dir) | `artifacts/OrangeHRM/runs/RUN-20260706-001/findings/FINDING-002_NoBruteForceProtection/` |
| `artifacts/OrangeHRM/findings/FINDING-003_ForgotPasswordTimeoutKnownUser/` (dir) | `artifacts/OrangeHRM/runs/RUN-20260706-001/findings/FINDING-003_ForgotPasswordTimeoutKnownUser/` |
| `artifacts/OrangeHRM/findings/FINDING-004_ForgotPasswordEnumerationViaTimeout/` (dir) | `artifacts/OrangeHRM/runs/RUN-20260706-001/findings/FINDING-004_ForgotPasswordEnumerationViaTimeout/` |
| `artifacts/OrangeHRM/runs/RUN-20260706-001/logs/bruteforce_network.log` | `artifacts/OrangeHRM/runs/RUN-20260706-001/network/bruteforce_network.log` (intra-workspace reorganization, per `pipeline/run_manager.md` §6's `network/` vs `logs/` distinction) |

The `QA_Assessment_Report.md` for this run was written directly to `artifacts/OrangeHRM/runs/RUN-20260706-001/reports/QA_Assessment_Report.md` and never touched the flat `artifacts/OrangeHRM/Reports/QA_Assessment_Report.md` path, which continues to hold the untouched legacy-pipeline report.

---

## RUN-20260706-002 — First End-to-End Platform Validation Run

**Purpose:** the first full Stage 1→6 execution of the platform, exercising every checkpoint type (Human Review ×3, Automation Approval ×1). Not a QA engagement on OrangeHRM itself — the object under test is the pipeline's own machinery. Findings about the *platform* (gaps, ambiguities, friction) are captured in this run's eventual Platform Validation Report and `LESSONS_LEARNED.md`, not fixed in place per this run's explicit instructions.

**Artifact Location Policy (this entire run):** every artifact this run produces, across all six stages, is generated **inside `artifacts/OrangeHRM/runs/RUN-20260706-002/` only** — never at the flat `artifacts/OrangeHRM/{context,discovery,findings,testcases,Automation,execution,Reports}/` paths. This extends the policy already established for RUN-20260706-001's Stage 2 (above) to the whole run, per this run's explicit instruction. `pipeline/run_manager.md` §6's documented Workspace Structure does not define subfolders for Stage 3 (`testcases/`), Stage 4 (`Automation/`), or Stage 5 (`execution/`) outputs — its own worked example only exercises Stages 1–3. `testcases/`, `Automation/`, and `execution/` subfolders were added to this run's workspace as a minimal, undocumented extension to accommodate this; this gap is recorded here and will be carried into the Platform Validation Report rather than treated as license to redesign `run_manager.md`.

| Run ID | Stage | Version | Timestamp (UTC) | Checkpoint Status | Reviewer | Artifact Link |
|---|---|---|---|---|---|---|
| RUN-20260706-002 | Stage 1 — Project Context Agent | v2 | 2026-07-06T13:55Z–14:10Z | Approved | Aymoon (Business Analyst / Product Owner role) | `artifacts/OrangeHRM/runs/RUN-20260706-002/context/OrangeHRM_ProjectContext.v2.md` (flat current-approved pointer promoted: `artifacts/OrangeHRM/context/OrangeHRM_ProjectContext.md`) |
| RUN-20260706-002 | Stage 2 — Explorer Agent (v2 spec) | v1 | 2026-07-06T14:12Z–15:15Z | Approved | Aymoon (QA Lead role) | `artifacts/OrangeHRM/runs/RUN-20260706-002/reports/QA_Assessment_Report.md`, `discovery/`, `findings/Findings_Summary.md` (6 Findings: FINDING-001..006) |
| RUN-20260706-002 | Stage 3 — Test Design Agent (v2 spec) | v1 | 2026-07-06T15:20Z–15:35Z | Approved | Aymoon (QA Architect / Test Lead role) | `artifacts/OrangeHRM/runs/RUN-20260706-002/testcases/` — 25 test cases (11 Login + 14 PIM), Markdown + Excel, `OrangeHRM_TraceabilityMatrix.md`, `OrangeHRM_CoverageReport.md` |
| RUN-20260706-002 | Stage 4 — Automation Agent (v2 spec) | v1 | 2026-07-06T15:40Z–16:05Z | Approved | Aymoon (Automation Lead / Release Manager role) | `artifacts/OrangeHRM/runs/RUN-20260706-002/Automation/` — Plan, Package (11 files/25 tests), Manifest, Decision Report, Coverage Report, Suite Manifest |
| RUN-20260706-002 | Stage 5 — Execution Agent | EXEC-20260706-002-001 | 2026-07-06T12:43:52Z–12:48:47Z | *(no gate — mechanical run, per pipeline.md §4 Stage 5)* | *(n/a)* | `artifacts/OrangeHRM/runs/RUN-20260706-002/execution/OrangeHRM_ExecutionResults.md` — 12 Passed, 12 Failed, 1 Skipped, 0 Flaky |
| RUN-20260706-002 | Stage 6 — Reporting Agent | v1 | 2026-07-06 | *(no gate — terminal stage, per pipeline.md §4 Stage 6)* | *(n/a — consumed by stakeholders, not another agent)* | `artifacts/OrangeHRM/runs/RUN-20260706-002/reports/OrangeHRM_Final_QA_Report.md` |
| RUN-20260706-002 | Stage 5 — Execution Agent (v2 spec, re-execution) | EXEC-20260706-002-002 | 2026-07-06T13:21:52Z–13:26:34Z | *(no gate — mechanical run)* | *(n/a)* | `artifacts/OrangeHRM/runs/RUN-20260706-002/execution/OrangeHRM_ExecutionResults_EXEC-20260706-002-002.md` — 13 Passed, 11 Failed, 1 Skipped, 0 Flaky. Execution Mode: **Headed** (Run Configuration did not define one; agent halted and asked the user directly, per `agents/execution_agent.md` v2 §5.1). First execution under the v2 spec's mode requirement. |

*This manifest is updated by the Run Manager as each stage completes within a run. No entry is added for a stage until that stage actually produces its output artifact — this file is not pre-populated speculatively.*
