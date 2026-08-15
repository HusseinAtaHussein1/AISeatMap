# Observability Report — run-003__2026-08-04_11-24-38__UserStory__US-8599-SearchActions_US-8606-UpdateBranch

> **Partially Instrumented.** Some telemetry is missing, so this report is incomplete. It is
> not presented as a full picture:

> - No RUN_STARTED event — run-level timing is not measured.

## 1. Run Summary

| Field | Value |
|---|---|
| Run | `run-003__2026-08-04_11-24-38__UserStory__US-8599-SearchActions_US-8606-UpdateBranch` |
| Scope / Target | UserStory / US-8599-SearchActions_US-8606-UpdateBranch |
| Workflow | unversioned |
| Environment | — |
| Status | Preparing |
| Started | 2026-08-04T08:24:38.821Z |
| Completed | _(not recorded)_ |
| Total duration | **Unavailable** |
| Instrumentation | **Partially Instrumented** |
| Events recorded | 73 (0 platform-tool · 73 skill) |
| Schema version | 1 |

**Provenance.** platform-tool events are emitted by platform code as a side effect of the work itself and cannot be forgotten. skill events are emitted because a Skill specification requires it; their presence is reliable, their ABSENCE proves nothing. The two are not the same reliability class and are never presented as one.

## 2. Stage Timing

<!-- A stage never reached has no row. `Incomplete` means the stage opened and never closed:
     it carries no duration, because none was measured. -->

| Stage | Started | Completed | Duration | Status |
|---|---|---|---|---|
| Stage 5A — Automation Execution | 2026-08-15T14:11:08.743Z | 2026-08-15T14:29:28.891Z | 18m 20s | Completed |
| Stage 6A — Reporting | 2026-08-15T14:30:37.780Z | 2026-08-15T14:35:23.087Z | 4m 45s | Completed |

_Stages with no row were not reached by this run: Stage 1 — Project Context · Stage 2 — Discovery · Stage 3 — Test Design · Stage 4M — Manual Execution · Stage 4A — Automation · Stage 5H — Self-Healing._

### 2.1 Skill Timing

<!-- A stage is not a skill: one stage may invoke several, so these are listed rather than
     folded into the stage above. -->

| Skill | Stage | Duration | Status |
|---|---|---|---|
| `automation-execution-skill` | Stage 5A — Automation Execution | 18m 20s | Completed |
| `reporting-skill` | Stage 6A — Reporting | 4m 45s | Completed |

## 3. Inputs / Outputs

| Metric | Value |
|---|---|
| Stages started | 2 |
| Test cases generated this run | 0 |
| Test cases in scope (all modules) | 134 |
| Artifacts created | 2 updated after creation |

## 4. Tool Activity

| Metric | Value |
|---|---|
| Tool calls | 0 |
| Succeeded | 0 |
| Failed | 0 |
| Incomplete (opened, never closed) | 0 |
| Retries | 0 |
| Timeouts | 0 |
| Tool failure rate | **Unavailable** |

## 5. Human Decisions

| Metric | Value |
|---|---|
| Requested | 0 |
| Resolved | 0 |
| Pending | 0 |
| Per stage | 0.0% |

_A fact, not a quality score. Some decisions exist deliberately for governance; more of them is not worse._

## 6. Test Design Metrics

<!-- Review and Automation are INDEPENDENT decisions and are never merged into one lifecycle
     status. Derived from the module Case Index, not from telemetry. -->

| Decision | Approved | Rejected | Pending |
|---|---|---|---|
| Review | 110 | 24 | 0 |
| Automation | 43 | 87 | 4 |

**Test Case Acceptance Rate:** 82.1% — `Review Approved / (Review Approved + Review Rejected)`

_Human acceptance, not factual correctness. A reviewer approving a case does not make it right._

_Derived from the module Case Index, which is the canonical record of these decisions._

> 1 test case(s) carry `Review: Rejected` with `Automation: Approved`. 
> Reported as a fact; resolving it is a governance decision, not observability's to make.

## 7. Automation Metrics

<!-- Kept separate by lifecycle phase (§26). "Generated" and "Passed" are never collapsed into
     one success number — building a test and the test passing are different achievements. -->

| Phase | Value |
|---|---|
| Eligible (Automation Approved) | 43 |
| Selected | 0 |
| Generated | 0 |
| Reused | 0 |
| Modified | 0 |
| Compile attempts | 0 |
| Compile passed / failed | 0 / 0 |
| First-pass success | 100.0% |

## 8. Execution Metrics

| Outcome | Count |
|---|---|
| Planned | 58 |
| Executed | 52 |
| Passed | 52 |
| Failed | 0 |
| Skipped | 6 |
| Blocked | 0 |
| Inconclusive | 0 |
| — of which blocked by Execution Safety | 0 |
| Pass rate | 100.0% |

_A test blocked by Execution Safety was never run. It is not a failure of the application, the automation, or the environment, and is never counted as one._

## 9. Repair / Rework

| Metric | Value |
|---|---|
| Repair cycles | 0 |
| Repair attempts | 0 |
| Repair successes | 0 |
| Tests repaired | 0 |
| Remaining failures | 0 |
| Repair success rate | **Unavailable** |
| Artifacts updated after creation | 2 |
| Validation failures | 0 |
| Human corrections | **Unavailable** |

_Explicit counters only. There is no `reworkScore`, because no defensible formula for one exists._

## 10. Platform Validation

<!-- PLATFORM validation, not application tests. A failing application test is a QA result; a
     failing schema check is a platform problem. They are never summed. -->

| Metric | Value |
|---|---|
| Validation runs | 0 |
| Passed | 0 |
| Failed | 0 |
| Failure rate | **Unavailable** |

## 11. Execution Safety Metrics

<!-- CONSUMED from Execution Safety evidence, never recomputed (§44). Observability does not
     hold a second opinion about whether an operation was allowed. -->

| Metric | Value |
|---|---|
| Policy | — |
| Policy hash | — |
| Environment | — |
| Operations evaluated | **Unavailable** |
| Allowed | **Unavailable** |
| Approval Required | **Unavailable** |
| Pre-authorized | **Unavailable** |
| Forbidden | **Unavailable** |
| Blocked | 0 |
| Cleanup required / completed | **Unavailable** / **Unavailable** |
| Cleanup completion rate | **Unavailable** |
| Safety block rate | **Unavailable** |

| Authorization | Action | Ownership | Module | Approved by | Approved at |
|---|---|---|---|---|---|
| `AUTH-BRANCH-CREATE-SelfCreated` | CREATE | SelfCreated | branch | ahmed.ayman@tildetech.ae | 2026-08-14T16:20:39.627Z |
| `AUTH-BRANCH-UPDATE-SelfCreated` | UPDATE | SelfCreated | branch | ahmed.ayman@tildetech.ae | 2026-08-14T16:20:39.627Z |
| `AUTH-BRANCH-SUBMIT-SelfCreated` | SUBMIT | SelfCreated | branch | ahmed.ayman@tildetech.ae | 2026-08-14T16:20:39.627Z |
| `AUTH-BRANCH-APPROVE-SelfCreated` | APPROVE | SelfCreated | branch | ahmed.ayman@tildetech.ae | 2026-08-14T16:20:39.627Z |

_A high block count means the policy did its job. It is not a quality signal._

## 12. AI Usage

| Metric | Value |
|---|---|
| Token telemetry | **Unavailable** |
| Cost telemetry | **Unavailable** |
| Provider | **Unavailable** |
| Model | **Unavailable** |

**Reason:** No supported run-attributable provider usage source. The platform carries zero runtime dependencies and no provider SDK, and its tools run as child processes with no model context. Claude Code session transcripts are deliberately not read: they are session-scoped rather than run-scoped, and are not an official stable contract (HD-OBS-002).

_No token count is estimated from text length, and no cost is computed from hardcoded pricing. This section is shown rather than hidden so the measurement boundary stays visible._

## 13. Unavailable Metrics

<!-- `0` and `Unavailable` are different claims and this section is where the second one is
     accounted for. An unavailable metric always carries the reason it could not be measured. -->

| Metric | Why it could not be measured |
|---|---|
| `run.durationMs` | This run has started but not finished. An in-progress run has an elapsed time, not a duration, and the two are not reported as the same thing (§15). |
| `repair.rework.humanCorrections` | The platform cannot attribute an edit to a human. A git diff proves a change, not its author (§61), and inferring authorship would make the metric confidently wrong. |
| `safety.operationsEvaluated` | The preflight record carries no operation total. |
| `safety.allowed` | The preflight record carries no allowed total. |
| `safety.approvalRequired` | The preflight record carries no approval-required total. |
| `safety.preAuthorized` | The preflight record carries no pre-authorized total. |
| `safety.forbidden` | The preflight record carries no forbidden total. |
| `safety.cleanupRequired` | The preflight record carries no cleanup-required total. |
| `safety.cleanupCompleted` | Cleanup completion is recorded by the executing stage and was not reported for this run. |
| `formulas.TOOL_FAILURE_RATE` | No tool call completed, so there is no failure rate. |
| `formulas.RETRY_RATE` | No tool call was started, so there is no retry rate. |
| `formulas.VALIDATION_FAILURE_RATE` | No validation ran. |
| `formulas.SAFETY_BLOCK_RATE` | This run has no Execution Safety preflight evidence. |
| `formulas.CLEANUP_COMPLETION_RATE` | This run has no Execution Safety cleanup evidence. |
| `formulas.REPAIR_SUCCESS_RATE` | No repair was attempted. |

## 14. Measurement Limitations

- **Skill-emitted telemetry is spec-compliance evidence, not machine-guaranteed.** Its presence is reliable; its absence proves nothing. Platform-tool events cannot be forgotten. The two counts are reported separately in §1 and are never added together as though equally certain.
- **Per-operation automation telemetry does not exist.** Stage `5A` invokes an opaque external runner; the platform observes suite and per-test outcomes only.
- **Human corrections cannot be attributed.** A git diff proves a change, not its author.
- **Token and cost usage is unavailable** for the reason stated in §12.
- **An incomplete span never becomes a duration.** It is reported as `Incomplete`.

---

**Dashboard:** [`ObservabilityDashboard.html`](ObservabilityDashboard.html) — a read-only visual view of these same metrics. This Markdown report and `ObservabilityMetrics.json` remain authoritative; the dashboard is presentation only.

---

_Generated by `platform_core/tools/observability` at 2026-08-15T15:14:10.934Z from `ObservabilityEvents.jsonl` (73 events). Every number above is arithmetic over recorded evidence — no value was recalled, estimated, or inferred by a model._
