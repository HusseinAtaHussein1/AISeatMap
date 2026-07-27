<!--
TEMPLATE — Run Manifest (per-run orchestrator state, all stages)
Renders to: platform_core_data/runs/{{RUN_FOLDER}}/metadata/RunManifest.md
Authority:  workflows_and_pipelines/pipeline/pipeline.md §7 (fields, Cross-run reuse),
            §5.3.1 #7 (Invocation Path), run_manager.md §6 (metadata/ is always created)

**This is the pipeline orchestrator's own source of truth for "where are we right now."** A human or
orchestration tool consults it before invoking the next stage.

Created at run creation (Step 1 of every workflow), then appended to as each stage completes and each
checkpoint resolves. Unlike a stage artifact it is *expected* to change many times during a run — it
records the sequence, while git holds the history of each change.

Three notes on why fields exist:
- **Revision count replaced version suffixes.** Artifacts are one file edited in place — no `.vN`,
  no duplicate "final" copy (§7). The count is how many times the reviewer's file was revised.
- **Invocation Path** distinguishes a stage reached through the pipeline from one called directly, and
  a direct call that ran degraded (declared missing inputs) from one that had everything.
- **Source Run** is the structural slot for §7's "Cross-run reuse" requirement — that a run reusing an
  earlier run's artifact "records the source run in its own Run Manifest." Before this template that
  obligation had no field to live in.
-->

# Run Manifest — {{RUN_FOLDER}}

| Field | Value |
|---|---|
| Run Folder | `{{RUN_FOLDER}}` |
| Run Scope Type / Run Type | {{RUN_SCOPE_TYPE}} / {{RUN_TYPE}} |
| Workflow | {{WORKFLOW}} <!-- first_run / user_story_run / bug_fix_run / unversioned (ad hoc) --> |
| Status | {{STATUS}} <!-- Execution Status enum, run_manager.md §8 --> |
| Created | {{CREATED_TIMESTAMP}} |
| Last updated | {{UPDATED_TIMESTAMP}} |

## 1. Code-State Anchor

<!-- run_manager.md §5.8 — which state of the application under test this run's conclusions are about.
     Carried from run.json; restated here because this is the file a reviewer opens to ask "can I still
     trust this run?". `null` is a legitimate value and is stated as such, never left blank: an
     unversioned target is not the same as an unchanged one. -->

| Field | Value |
|---|---|
| `targetRef` | {{TARGET_REF}} |
| Scoped to | {{TARGET_REF_SCOPE}} <!-- in-scope paths; empty = repo-wide --> |
| Captured at | {{TARGET_REF_CAPTURED_AT}} |
| Note | {{TARGET_REF_REASON}} <!-- why it is what it is, including why null --> |

## 2. Stage Ledger

<!-- One row per stage this run has reached. A stage that was never reached has no row — absence means
     "not reached", which is why no row is ever pre-created as "Not started".

     Checkpoint status: Pending Review / Pending Automation Approval / Approved / Rejected (§7)
     Invocation Path:   Pipeline / Direct / Direct (degraded)   (§5.3.1 #7) -->

| Stage | Artifact | Timestamp | Checkpoint Status | Reviewer | Revisions | Invocation Path | Run-Scoped Instruction |
|---|---|---|---|---|---|---|---|
| {{STAGE}} | [{{ARTIFACT_NAME}}]({{ARTIFACT_PATH}}) | {{TIMESTAMP}} | {{CHECKPOINT_STATUS}} | {{REVIEWER}} | {{REVISION_COUNT}} | {{INVOCATION_PATH}} | {{INSTRUCTION}} |

## 3. Cross-Run Reuse / Source Runs

<!-- §7 "Cross-run reuse" — a run that reuses an earlier run's approved artifact references it BY PATH
     and records the source run HERE. It does not copy the file in.

     `Mode` distinguishes the two cases §7 defines:
       Referenced — read in place from the prior run; nothing was copied
       Copied     — a stage needed to EVOLVE the artifact, so it was copied into this run ONCE, at that
                    point, and this row records that the copy's origin was the prior run

     For a refinement run (run_manager.md §5.9) this section restates what metadata/lineage.json holds
     structurally; lineage.json is authoritative, this is the human-readable view.

     Omit this section entirely on a run that reuses nothing. -->

| Artifact | Source Run | Mode | Approved in source? | Drift since source |
|---|---|---|---|---|
| {{ARTIFACT}} | `{{PRIOR_RUN_FOLDER}}` | {{MODE}} | {{SOURCE_APPROVED}} | {{DRIFT_STATUS}} <!-- unchanged / moved / unknown-* per §5.8 --> |

**Lineage:** {{LINEAGE_SUMMARY}}
<!-- e.g. "inheritsFrom / supersedes run-002__… — see metadata/lineage.json" — or "None; this run
     inherits nothing." Never leave blank. -->

**Drift implication:** {{DRIFT_IMPLICATION}}
<!-- MANDATORY when any Drift column is `moved` or `unknown-*`: state which inherited findings or test
     cases are consequently unverified against current code (§5.9 Rule 4). An inherited conclusion is
     never presented as current when drift contradicts it. -->

## 4. Checkpoint History

<!-- Append-only. Every checkpoint transition, in order — this is the audit trail of who decided what
     and when. A Rejected entry keeps its feedback: the revision that followed is what the reviewer
     asked for, and losing the reason makes the revision unreviewable. -->

| # | Timestamp | Stage | Transition | Decided By | Feedback / Reason |
|---|---|---|---|---|---|
| {{N}} | {{TIMESTAMP}} | {{STAGE}} | {{FROM}} → {{TO}} | {{DECIDED_BY}} | {{FEEDBACK}} |

## 5. Declared Gaps

<!-- Anything this run knowingly proceeded without — a degraded direct invocation's missing inputs, a
     skipped stage, an unreachable in-scope area. A gap recorded here is a gap the Final QA Report must
     also carry (reporting §12); the two must not disagree.

     Omit only when the run declared none. -->

| Gap | Stage Affected | Why | Consequence Stated In |
|---|---|---|---|
| {{GAP}} | {{STAGE}} | {{REASON}} | {{WHERE_REPORTED}} |
