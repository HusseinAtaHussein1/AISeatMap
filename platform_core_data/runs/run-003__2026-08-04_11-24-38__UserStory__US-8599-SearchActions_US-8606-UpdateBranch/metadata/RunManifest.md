# Run Manifest — run-003__2026-08-04_11-24-38__UserStory__US-8599-SearchActions_US-8606-UpdateBranch

| Field | Value |
|---|---|
| Run Folder | `run-003__2026-08-04_11-24-38__UserStory__US-8599-SearchActions_US-8606-UpdateBranch` |
| Run Scope Type / Run Type | UserStory / UserStory |
| Workflow | unversioned |
| Status | Preparing |
| Created | 2026-08-04T08:24:38.821Z |
| Last updated | 2026-08-04T12:25:48.197Z |

## 1. Code-State Anchor

<!-- run_manager.md §5.8 — which state of the application under test this run is about. `null` is a
     legitimate value and is stated with its reason: an unversioned target is not an unchanged one. -->

| Field | Value |
|---|---|
| `targetRef` | `42de80a1148cbef6bf43f7a9a8071ae6d0a8e1cc` |
| Scoped to | repo-wide |
| Captured at | 2026-08-04T08:24:38.821Z |
| Note | git repository at E:/Projects/agentic-ai-testing-platform |

## 2. Stage Ledger

<!-- One row per stage this run has reached. A stage never reached has NO row — absence means "not
     reached", which is why no row is pre-created as "Not started". -->

| Stage | Artifact | Timestamp | Checkpoint Status | Reviewer | Revisions | Invocation Path | Run-Scoped Instruction |
|---|---|---|---|---|---|---|---|
| Stage 1 — Project Context | — | 2026-08-04T09:02:26.152Z | Approved | ahmed.ayman@tildetech.ae | 8 | Direct | — |
| Stage 2 — Discovery | — | 2026-08-04T09:34:11.777Z | Approved | ahmed.ayman@tildetech.ae | 1 | Direct | — |
| Stage 3 — Test Design | — | 2026-08-04T12:25:48.197Z | Approved | ahmed.ayman@tildetech.ae | 3 | Direct | — |

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
| 1 | 2026-08-04T08:24:38.821Z | — | Run created (`Preparing`) | Run Manager | ad hoc run |
| 2 | 2026-08-04T08:29:58.378Z | Stage 1 — Project Context | Pending Review | Run Manager | — |
| 3 | 2026-08-04T08:54:47.473Z | Stage 1 — Project Context | Pending Review → Approved | ahmed.ayman@tildetech.ae | — |
| 4 | 2026-08-04T09:32:33.409Z | Stage 2 — Discovery | Pending Review | Run Manager | — |
| 5 | 2026-08-04T09:34:11.777Z | Stage 2 — Discovery | Pending Review → Approved | ahmed.ayman@tildetech.ae | — |
| 6 | 2026-08-04T09:42:00.191Z | Stage 3 — Test Design | Pending Review | Run Manager | — |
| 7 | 2026-08-04T12:25:48.197Z | Stage 3 — Test Design | Pending Review → Approved | ahmed.ayman@tildetech.ae | — |

## 5. Declared Gaps

<!-- Anything this run knowingly proceeded without. A gap here must also appear in the Final QA
     Report (reporting §12) — the two must not disagree. -->

| Gap | Stage Affected | Why | Consequence Stated In |
|---|---|---|---|
| Admin-role credentials not provisioned; only Super Admin exists | all | US 8599 names two actors ('Super Admin and admin'). Without a second account, XC-06 self-approval (PRD.md OQ-1) and role-differentiated grid behaviour (RISK-BR-6) cannot be tested. Approve/reject IS exercisable with Super Admin alone; what is untestable is whether a maker is blocked from approving their own change. Affected cases must be marked 'Blocked - Requires Second Account' and reported untested, never passed. | — |
| Role-differentiated behaviour unobservable (single-account run) | all | User directive 2026-08-04: odeysysadmin stands in for both the Admin and Super Admin actors US 8599 names. Account holds Super Admin privileges throughout, so criteria resting on what an Admin sees as distinct from a Super Admin cannot be observed. SUPERSEDES the earlier gap entry: XC-06 self-approval is NOT blocked - one account is the correct configuration for testing it, and it is now in scope. Remaining limits: no control case for a blocked approval, and no role-differentiated view. | — |
