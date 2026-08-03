# Run Manifest — run-002__2026-08-03_10-26-17__UserStory__US-8605CreateBranch

| Field | Value |
|---|---|
| Run Folder | `run-002__2026-08-03_10-26-17__UserStory__US-8605CreateBranch` |
| Run Scope Type / Run Type | UserStory / UserStory |
| Workflow | unversioned |
| Status | Preparing |
| Created | 2026-08-03T07:26:17.560Z |
| Last updated | 2026-08-03T13:44:02.384Z |

## 1. Code-State Anchor

<!-- run_manager.md §5.8 — which state of the application under test this run is about. `null` is a
     legitimate value and is stated with its reason: an unversioned target is not an unchanged one. -->

| Field | Value |
|---|---|
| `targetRef` | `ff287f90c81637550f96a9713382672b6977dbb6` |
| Scoped to | repo-wide |
| Captured at | 2026-08-03T07:26:17.560Z |
| Note | git repository at C:/Users/Sheen/agentic-ai-testing-platform |

## 2. Stage Ledger

<!-- One row per stage this run has reached. A stage never reached has NO row — absence means "not
     reached", which is why no row is pre-created as "Not started". -->

| Stage | Artifact | Timestamp | Checkpoint Status | Reviewer | Revisions | Invocation Path | Run-Scoped Instruction |
|---|---|---|---|---|---|---|---|
| Project Context | — | 2026-08-03T07:28:29.746Z | Pending Review | — | 0 | — | — |
| Discovery | — | 2026-08-03T08:24:29.650Z | Approved | ahmed.ayman@tildetech.ae | 0 | — | — |
| Test Design | — | 2026-08-03T09:53:16.653Z | Approved | — | 0 | — | — |
| Manual Execution | [ManualQAReport.md](platform_core_data/runs/run-002__2026-08-03_10-26-17__UserStory__US-8605CreateBranch/manual_execution/ManualQAReport.md) | 2026-08-03T12:32:09.395Z | Approved | — | 0 | — | — |
| Automation | [AutomationSummary_SHAFT.md](platform_core_data/modules/branch/automation/AutomationSummary_SHAFT.md) | 2026-08-03T13:44:02.384Z | Pending Review | — | 0 | — | — |

## 3. Cross-Run Reuse / Source Runs

<!-- pipeline.md §7 "Cross-run reuse" — one row per reused artifact. `Referenced` = read in place
     from the prior run; `Copied` = a stage needed to evolve it, so it was copied in once. -->

| Artifact | Source Run | Mode | Approved in source? | Drift since source |
|---|---|---|---|---|
| _(this run reuses nothing)_ | | | | |

**Lineage:** None; this run inherits nothing.

## 4. Checkpoint History

<!-- Append-only. Every checkpoint transition, in order. A Rejected entry keeps its feedback: the
     revision that followed is what the reviewer asked for. -->

| # | Timestamp | Stage | Transition | Decided By | Feedback / Reason |
|---|---|---|---|---|---|
| 1 | 2026-08-03T07:26:17.560Z | — | Run created (`Preparing`) | Run Manager | ad hoc run |
| 2 | 2026-08-03T07:28:29.746Z | Project Context | Pending Review | Run Manager | — |
| 3 | 2026-08-03T07:55:10.553Z | Discovery | Pending Review | Run Manager | — |
| 4 | 2026-08-03T08:24:29.650Z | Discovery | Pending Review → Approved | ahmed.ayman@tildetech.ae | — |
| 5 | 2026-08-03T08:33:32.599Z | Test Design | Pending Review | Run Manager | — |
| 6 | 2026-08-03T09:53:16.653Z | Test Design | Pending Review → Approved | Run Manager | — |
| 7 | 2026-08-03T10:42:37.718Z | Manual Execution | Pending Review | Run Manager | — |
| 8 | 2026-08-03T12:32:09.395Z | Manual Execution | Pending Review → Approved | Run Manager | — |
| 9 | 2026-08-03T13:44:02.384Z | Automation | Pending Review | Run Manager | — |

## 5. Declared Gaps

<!-- Anything this run knowingly proceeded without. A gap here must also appear in the Final QA
     Report (reporting §12) — the two must not disagree. -->

| Gap | Stage Affected | Why | Consequence Stated In |
|---|---|---|---|
| _(none declared)_ | | | |
