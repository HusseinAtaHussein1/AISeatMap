# Run Manifest — run-001__2026-07-31_11-56-38__UserStory__US-4222UpdateAgency

| Field | Value |
|---|---|
| Run Folder | `run-001__2026-07-31_11-56-38__UserStory__US-4222UpdateAgency` |
| Run Scope Type / Run Type | UserStory / UserStory |
| Workflow | user_story_run |
| Status | Preparing |
| Created | 2026-07-31T08:56:38.061Z |
| Last updated | 2026-08-02T13:40:18.729Z |

## 1. Code-State Anchor

<!-- run_manager.md §5.8 — which state of the application under test this run is about. `null` is a
     legitimate value and is stated with its reason: an unversioned target is not an unchanged one. -->

| Field | Value |
|---|---|
| `targetRef` | `f7009447e8704ac516008843b343b0999212b039` |
| Scoped to | repo-wide |
| Captured at | 2026-07-31T08:56:38.061Z |
| Note | git repository at E:/Projects/agentic-ai-testing-platform |

## 2. Stage Ledger

<!-- One row per stage this run has reached. A stage never reached has NO row — absence means "not
     reached", which is why no row is pre-created as "Not started". -->

| Stage | Artifact | Timestamp | Checkpoint Status | Reviewer | Revisions | Invocation Path | Run-Scoped Instruction |
|---|---|---|---|---|---|---|---|
| Stage 1 — Project Context | — | 2026-07-31T10:56:38.600Z | Approved | Ahmed Ayman | 2 | — | — |
| Stage 2 — Discovery | — | 2026-08-01T08:24:55.105Z | Approved | Ahmed Ayman | 2 | — | — |
| Stage 3 — Test Design | [TestCases_Agency.md](platform_core_data/modules/agency/test_design/TestCases_Agency.md) | 2026-08-02T13:40:18.729Z | Approved | Ahmed Ayman | 1 | Pipeline | — |
| Stage 4M — Manual Execution | [ManualExecutionResults.md](platform_core_data/runs/run-001__2026-07-31_11-56-38__UserStory__US-4222UpdateAgency/manual_execution/ManualExecutionResults.md) | 2026-08-02T13:39:47.631Z | Pending Review | — | 1 | Pipeline | — |

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
| 1 | 2026-07-31T08:56:38.061Z | — | Run created (`Preparing`) | Run Manager | via user_story_run |
| 2 | 2026-07-31T08:59:41.736Z | Stage 1 — Project Context | Pending Review | Run Manager | — |
| 3 | 2026-07-31T10:56:38.600Z | Stage 1 — Project Context | Pending Review → Approved | Ahmed Ayman | — |
| 4 | 2026-07-31T11:27:30.702Z | Stage 2 — Discovery | Pending Review | Run Manager | — |
| 5 | 2026-08-01T08:24:55.105Z | Stage 2 — Discovery | Pending Review → Approved | Ahmed Ayman | — |
| 6 | 2026-08-01T08:34:41.619Z | Stage 3 — Test Design | Pending Review | Run Manager | — |
| 7 | 2026-08-02T13:39:35.959Z | Stage 3 — Test Design | Pending Review → Approved | Ahmed Ayman | — |
| 8 | 2026-08-02T13:39:47.631Z | Stage 4M — Manual Execution | Pending Review | Run Manager | — |

## 5. Declared Gaps

<!-- Anything this run knowingly proceeded without. A gap here must also appear in the Final QA
     Report (reporting §12) — the two must not disagree. -->

| Gap | Stage Affected | Why | Consequence Stated In |
|---|---|---|---|
| credentials.json absent — knowledge_base/credentials/ has no real credential file | all | Only a human may create it; Stage 2 (Discovery) and Stage 4M (Manual Execution) cannot authenticate to http://192.168.1.70 without it. Stage 1 does not require it. | — |
| US-4222 predates later application enhancements — application is the primary reference where the story is outdated (user directive 2026-07-31) | all | Every mismatch stays recorded as a Finding with a Requirement Disposition (ProjectContext.md 1.1). Two of ten gaps are deliberately NOT dispositioned as story-outdated: GAP-D02 (PCC section, two [V]-tagged PRD requirements corroborate the story) and GAP-D10 (PDF-only rule, unsuperseded). DOQ-02 remains the sole Stage 3 blocker. | — |
