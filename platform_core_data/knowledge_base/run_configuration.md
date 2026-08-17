# Run Configuration

> Describes *this run's* scope and environment. It never names which project it applies to — the
> Target Project's location is tool configuration (`platform.config.json` → `targetRoot`), not run
> configuration (`pipeline.md` §1.1).
>
> This file records **configuration, not a decision already executed**. Any change here takes effect the
> next time Stage 1 runs; editing it never retroactively changes an approved Project Context.

**Application:** NDC Admin Portal
**Configured:** 2026-08-17, updated for the active run (**run-004** — US-4222 [Admin] Update Agency, module `agency`); supersedes the 2026-08-04 configuration written for run-003 (US 8599 + US 8606, module `branch`), whose scope entry is preserved in §History of scope choices.

## Target Environment

| Key | Value |
|---|---|
| Environment | **STG** — shared staging, *not* isolated (other testers/teams have live data on it) |
| Application URL | `http://192.168.1.70` — internal/LAN address, plain HTTP |
| Environment notes | Shared environment. **Re-confirmed as the run target by the user on 2026-08-17** for run-004. Reachability has not been re-verified since run-003 — Stage 2 (Discovery) confirms it before doing anything else and reports it as a blocker if unreachable. When a browser navigation times out, probe the URL over raw HTTP first: on run-003 an apparent outage was local tooling, not the application. |
| Execution Mode | **Not yet decided.** The Automation branch does not fix this the way `4M` does. Headed vs Headless is asked **immediately before every execution**, including reruns and verification runs, and is never inferred from a previous run. |

## Pipeline Branch

**Automation Pipeline (`4A` → `5A` → `6A`) — chosen by the user on 2026-08-17**, at Stage 1's Human Review gate rather than deferred to the Stage 3 divergence point. **This is a change of branch for the `agency` module**, which took the Manual branch (`4M`) in run-001.

Consequences, per `pipeline.md` §3.3 and §6 Rule 3a:

- The run's stage path is **1 → 2 → 3 → 4A → 5A → (optional 5H) → 6A**. `6A` is terminal.
- Stage `4A` generates a production-quality automation package for `agency` and **never executes it**. Stage `5A` executes. Stage `5H` (Self-Healing) is optional and opt-in only.
- Stage `4A` must use the mandatory SHAFT structure defined in [`automation_framework.md`](automation_framework.md) — the framework is **not** selected or invented per run.
- `agency` currently has **no** automation package (`automation: Not Started`). `modules/branch/automation/` exists and is a separate package; Agency's package is not written into it.
- The run folder will hold `metadata/`, `automation/`, `execution/`, and `reporting/`. There is no `manual_execution/` — that absence records the branch taken and is not a coverage gap.

## Run Scope

| Key | Value |
|---|---|
| Run Type | **User Story** |
| Run Scope Type | **User Story** (`run_scope.md` §3) — resolved to `single` module (`agency`) |
| Run Scope Source | **Pasted text** (2026-08-17), verified identical to the existing transcription at [`requirements/user_stories/US-4222_Admin_Update_Agency.md`](requirements/user_stories/US-4222_Admin_Update_Agency.md) — no re-transcription was needed and none was made |
| Target | **US-4222 — [Admin] Update Agency** |
| Active run folder | `run-004__2026-08-17_14-35-25__UserStory__US-4222-UpdateAgency` |
| Relationship to run-001 | **A new, independent run — not a refinement.** run-001's own artifacts are read-only reference and are not modified. The module's durable Stage 1–3 artifacts are re-checked in place, which is the normal module-workspace behaviour and is not a change to run-001. |

## Modules In Scope

_The modules this run covers. Everything else is out of scope for this run._

**`agency` — already Active and scaffolded** (registered run-001, 2026-07-31). The active-module pointer
was switched from `branch` to `agency` on 2026-08-17 for this run. No other module is in scope.

The story's **Reflection** section names five downstream areas (Rule Engine, Search & Booking, NDC Portal,
Reports, Top Up) and its **Dependencies** section names three upstream ones (Branch CRUD, Supplier CRUD,
Payment Method). These are recorded as Out-of-Scope / Module-Boundary items in
[`modules/agency/context/ProjectContext.md`](../modules/agency/context/ProjectContext.md) §3–§3.1, not
widened into this run's scope.

## Cross-module knowledge reuse — `branch` → `agency` (run-004)

**Directed by the user on 2026-08-17.** Reusable knowledge, patterns, conventions, and validated solutions
from the `branch` module are carried into this run. **Branch-specific test data, selectors, assumptions,
defects, and artifacts are not.** The module boundary stays intact: nothing is copied into
`modules/agency/`, and every reused item is cited by its `modules/branch/…` path.

What was reused, and what was deliberately not, is recorded per item in
[`runs/run-004…/metadata/BranchKnowledgeReuse.md`](../runs/run-004__2026-08-17_14-35-25__UserStory__US-4222-UpdateAgency/metadata/BranchKnowledgeReuse.md).

## Requirements Sources

| Source | Path | Status |
|---|---|---|
| **PRD** | [`PRD.md`](PRD.md) | ⚠️ **Reverse-engineered from the Reference Automation Project on 2026-07-25, marked *Draft for business review* — not business-approved.** Every requirement carries an evidence tag: **[V]** verified by an automated assertion, **[O]** observed but unasserted, **[I]** inferred from locators/field names only. Downstream stages must carry those tags forward and treat `[O]`/`[I]` as **unconfirmed**, never as settled acceptance criteria. For Agency, PRD.md §7.2 ORG-05…ORG-10 describe agency **creation**; **no PRD requirement describes the Agency update flow** (only XC-04 establishes that maker–checker covers updates). |
| **In-scope User Story** | [`requirements/user_stories/US-4222_Admin_Update_Agency.md`](requirements/user_stories/US-4222_Admin_Update_Agency.md) — US-4222 [Admin] Update Agency | Business-supplied, transcribed verbatim 2026-07-31. **Re-verified against the user's freshly pasted text on 2026-08-17: identical across all 10 ACs, Dependencies, Expected Outcome, and Reflection. No requirement drift.** Its authority is qualified by the application-primacy directive below. |
| **PRD cross-cutting sections — corroborating, not competing** | [`PRD.md`](PRD.md) §6.1 (XC-01…XC-07), §6.2 (XC-08…XC-16), §6.3 (XC-17…XC-23), §9.1, §9.2 | The story specifies Agency's own fields; PRD.md specifies the platform-wide behaviours it instantiates — the maker–checker workflow, the grid/search contract, and the **[V]**-tagged validation message vocabulary. Where the two are silent-vs-specific rather than contradictory, **both** are carried into Test Design. |
| **Prior user stories** | [`PRD_UserStories.md`](PRD_UserStories.md) User Stories 1–8 | Historical context. User Story 3 (Create Agency) is the structural analogue for the sections this Update form mirrors; User Stories 5–8 are Branch and are not requirement sources for this run. |

### Requirement authority — US-4222 application-primacy directive (2026-07-31, **still in force for run-004**)

**Confirmed as still applying on 2026-08-17.** It was granted for US-4222 and this run's requirement is
US-4222, so it travels with the story rather than with the run. It does **not** extend to any other story.

**US-4222 is relatively old, and the application has evolved since it was authored.** Functionality has
been added and changed after the story was written — the **Threshold-related fields are confirmed later
enhancements** and are expected to exist despite the story's silence.

**The running application is therefore the primary reference where the story is clearly outdated.** This
supersedes the original rule (US-4222 authoritative outright) recorded in the Requirements Sources table
above.

Every mismatch is still recorded as a Finding and stays fully traceable. What changes is the **disposition**
assigned to it, and the platform distinguishes two things that must not be conflated:

| | Meaning |
|---|---|
| **Application defect** | The implementation violates current intended behaviour |
| **Outdated requirement** | The implementation has legitimately evolved beyond the original story |

The taxonomy, and the discriminator that assigns a disposition (**when the application and the story
disagree, the PRD decides**), are specified once in
[`modules/agency/context/ProjectContext.md`](../modules/agency/context/ProjectContext.md) §1.1 and applied
per Finding in `modules/agency/discovery/findings/`. The rule deliberately does **not** collapse to "the
application is always right": where a `[V]`-tagged PRD requirement corroborates the *story* against the
application, the disposition is `Possible Application Defect / Possible Removed Feature` and is escalated
rather than written off.

**Available but deliberately not restored:** `architecture.md`, `glossary.md`, `onboarding.md`,
`automation_framework.md`, `reference_automation_project.md` still sit in
`platform_core_data/NDC_Previous_used_helper_docs_tobe_delete/`. The last two describe the SHAFT automation
package and the external reference codebase — neither is relevant to a Manual-branch run. Restore any of
them explicitly if wanted; nothing here reads them.

## Credentials

Credentials live in `platform_core_data/knowledge_base/credentials/credentials.json`, created by a human from
`credentials.template.json`. That file is git-ignored and its values are never written into any
artifact, never typed into a tool call, and never echoed in a report.

| Role | Purpose | Available? |
|---|---|---|
| Super Admin (`odeysysadmin`, per PRD.md §2 Actor table) | Stage 2 Discovery; reaching an Agency record; the Update Agency form; Send For Approval; and the Approve/Reject actions (Super Admin is the platform's approver role, XC-06). Also the **Create Agency** flow, used this run only to seed the run's own test records | ✅ **Set up 2026-08-03, still current** in `credentials.json` (git-ignored). Values are never echoed in any artifact, tool call, or report. **Not re-verified as still valid on this environment** — Stage 2 confirms login before anything else. |
| **Admin** (day-to-day operator, PRD.md §2 `LogIn_Page.ClickAdmin()`) | US-4222 is written *"As an Admin"*. No separate Admin credential is provisioned. | ⚠️ **Carried over from the 2026-08-04 directive** (*"treate odeysysadmin as an admin and super admin"*). That directive was granted for run-003 and has **not** been re-granted for run-004. Treated as the working assumption, flagged for confirmation at Stage 1's gate. Two limits survive it — see below. |
| Agency Owner / Agent (Portal) | Not needed — no Reflection-area check in this run requires the agency portal | Not set up (not required) |

**Note on the single-account arrangement — what it does and does not cover.**

✅ **XC-06 self-approval IS testable, and must be designed.** One account is *precisely* the self-approval
configuration: update an Agency as `odeysysadmin`, then attempt to approve that same record as
`odeysysadmin`. If it succeeds, XC-06 is unimplemented (a definitive answer to PRD.md `OQ-1` and a
governance finding); if it is blocked, XC-06 is confirmed on evidence and PRD.md's **[I]** tag can be
upgraded. This directly resolves the `agency` module's ASM-004 and RSK-003, which run-001 left open.

⚠️ **No control case.** With one account, "approval was blocked" cannot be distinguished from "approval is
broken for everyone." A blocked result is reported as *self-approval appears blocked*, with the message and
behaviour captured as evidence (XC-03).

⚠️ **No role-differentiated observation.** `odeysysadmin` carries Super Admin privileges regardless of which
actor it stands in for. Whether a genuinely lower-privileged Admin sees a different Agency form, different
row actions, or different enabled/disabled states **cannot be observed from a privileged account**. Those
cases are marked `Not Covered — Single-Account Run` and reported untested, never passed.

## Environment Constraints (standing, project-wide)

> **⚠️ The canonical, machine-readable form of these rules is now
> [`execution_safety_policy.json`](execution_safety_policy.json), explained for reviewers in
> [`execution_safety_policy.md`](execution_safety_policy.md) (introduced 2026-08-07).** The prose below is
> retained because it is the *evidence* the policy was migrated from, and because it remains the
> authoritative record for `run-001`, `run-002`, and `run-003`, which executed before the mechanism
> existed and were never evaluated by it.
>
> **For any run created on or after 2026-08-07, the policy file decides** — a Skill evaluates it through
> `platform_core/tools/execution_safety/`, and does not interpret this prose. Where the two ever
> disagree, the policy file is what runs, and this section is out of date. Do not add a new standing rule
> here without adding it there.
>
> Print the current standing decisions with
> `node platform_core/tools/execution_safety/cli.js summary`, or `agentic-testing doctor`.

- **Shared environment** — this staging instance is not isolated to this testing effort; assume other
  teams/testers have live data on it.
- **Standing default is read-only** — no data mutation is authorized unless a run-specific override below
  grants it. An override never loosens the default for any other run.
  *(Now expressed as: every mutating action resolves `Approval Required` or `Forbidden`; nothing but
  reading is `Allowed` outright.)*
- **Negative tests that endanger a shared environment are deferred, not asked about** — lockout,
  brute-force, and similar destructive negative cases are designed in full and marked
  `Deferred / Requires Dedicated Environment` with the reason stated (`pipeline.md` §5.5).
  *(This is a Test **Design** rule, not an execution-authorization rule, and it stays here — the policy
  governs what may execute, not what may be written down.)*

### Run-specific mutation override — US-4222 only

**Granted by the user on 2026-07-31.** Mutation of **Agency records only** is authorized for this run:
update of agency detail sections, **Submit for Approval**, **Approve**, and **Reject**.

Limits that are part of the same authorization:

1. The standing read-only constraint remains in **full force for every other entity** — Company, Branch,
   Staff, Supplier, Role, reference data, and every module outside Agency.
2. **No bookings, payments, wallet charges, top-ups, holds, or ticketing** are permitted, even in service of
   verifying a Reflection-area effect of an agency change. Verification of a downstream effect is limited to
   searching and reading.
3. **Does not carry forward.** A future run asks fresh rather than inheriting this
   (memory: `feedback_automation_decision_gates`).

### Run-specific mutation override — US-8605 / `branch` only

**Granted by the user on 2026-08-03**, modelled on the same shape as the US-4222 override above. Mutation
of **Branch records only** is authorized for this run: creation of a Branch, **Submit for Approval**,
**Approve**, and **Reject**.

Limits that are part of the same authorization:

1. The standing read-only constraint remains in **full force for every other entity** — Company, Agency,
   Staff, Supplier, Role, reference data (Country/State/City, Department, Payment Method), and every module
   outside Branch. Discovery may read these to populate dropdowns/cascades but must not create, edit, or
   delete them.
2. **No bookings, payments, wallet charges, top-ups, holds, or ticketing** are permitted, even in service of
   verifying a Reflection-area effect of a Branch change. Verification of a downstream effect (Search
   Branch, Booking Module, Staff CRUD, Agency CRUD) is limited to searching and reading.
3. **Does not carry forward.** A future run asks fresh rather than inheriting this
   (memory: `feedback_automation_decision_gates`).

### Run-specific mutation override — run-003 / US-8599 + US-8606 / `branch` only

**Granted by the user on 2026-08-04**, at Stage 1's Human Review gate. Verbatim:

> *"Mutation authorization don't edit or add or delete any exist branches or agencies but create your own and make actions on it"*

This is a **narrower grant than run-002's**, and the narrowing is the point: it authorizes mutation of records **this run brings into existence**, not of the shared environment's existing data.

**Permitted:**

1. **Create new Branch records** — via the Create Branch flow (US 8605), used here to seed this run's own test data.
2. **The full action set on records this run created** — update/edit via the edit pen (US 8606), Submit for Approval, **Approve** (thumbs-up), **Reject** (thumbs-down) (US 8599).

**Forbidden:**

1. **Any mutation of any Agency record** — create, edit, or delete. No exception. Agency is out of scope for this module entirely.
2. **Any mutation of a Branch record this run did not create** — including editing, approving, rejecting, or deleting. On a shared environment a pending Branch may belong to another team's in-flight work, and approving or rejecting it is **not undone by re-running the test**.
3. **Bookings, payments, wallet charges, top-ups, holds, ticketing** — the standing prohibition is unaffected, even in service of verifying a downstream Reflection effect.

**Reading is unrestricted.** Searching, filtering, paginating, and viewing pre-existing Branch rows is not mutation and is fully in scope — this is most of US 8599's surface.

**Two operational consequences, both binding:**

| Consequence | Why |
|---|---|
| **Every Branch this run creates must carry an identifiable, run-tagged marker recorded at creation time** | The grant's boundary is *"records this run created."* Without a captured identifier, a later approve/reject cannot prove it acted on an authorized record, and the line between an authorized and a prohibited action becomes unreconstructable after the fact. Stage `4M` captures the identifier **before** acting. |
| **run-002's Branch records are treated as pre-existing (conservative reading)** | They were created by this platform but **not by this run**. They stay **fully usable as read-only search fixtures** — which is where their value lies (the TC-BR-003 special-character branch is directly relevant to US 8599's Branch Name filter). If the reviewer intends prior-run records to be actionable, that widens the set and should be stated explicitly. |

**Does not carry forward.** A future run asks fresh rather than inheriting this (memory: `feedback_automation_decision_gates`).

### Run-specific mutation grant — run-004 / US-4222 / `agency` only

**Granted by the user on 2026-08-17**, at Stage 1's Human Review gate, in answer to an explicit question.
The answer chosen was **"Self-created agencies only."**

**This run was created after 2026-08-07, so [`execution_safety_policy.json`](execution_safety_policy.json)
governs it and the prose in this file does not.** The grant below is the human answer that the policy's
`Approval Required` decisions are waiting for; it is recorded here as the audit record of the decision.
The formal per-class authorization records are written by the executing stage (`5A`), not by Stage 1.

**Permitted:**

1. **Create new Agency records** (`CREATE SelfCreated` — Approval Required, now answered). Used only to
   seed this run's own test data. Create Agency is **not** a test target of US-4222; it is a means.
2. **The full US-4222 action set on records this run created** — update every section, **Send For
   Approval**, **Approve**, **Reject** (`UPDATE / APPROVE / REJECT SelfCreated`).

**Forbidden:**

1. **Approving or rejecting any Agency record this run did not create.** `APPROVE Shared` and
   `REJECT Shared` are **`Forbidden (absolute)`** in the policy, and **no human grant can lift an
   absolute Forbidden** — the evaluator refuses it. On a shared environment a pending Agency may be
   another team's in-flight work, and approving it is not undone by re-running the test.
2. **Deleting any Agency record**, self-created or not. `DELETE` is `Forbidden (absolute)` for `Shared`
   and `Unknown`; for `SelfCreated` it is Approval Required and **was not requested or granted**. Records
   this run creates are therefore left in place, tagged, not cleaned up.
3. **Any mutation outside `agency`** — Branch, Supplier, Staff, Role, Payment Method, reference data.
   Reading them to populate dropdowns and observe cascades is unrestricted.
4. **Bookings, payments, wallet charges, top-ups, holds, ticketing, refunds, voids** — `Forbidden
   (absolute)`, unaffected by any grant, even to verify a Reflection-area effect.

**One operational consequence, binding:** every Agency this run creates must carry an identifiable,
run-tagged marker **recorded at creation time**. The grant's boundary is *"records this run created"*;
without a captured identifier a later approve/reject cannot prove it acted on an authorized record, and
the line between an authorized and an absolutely-forbidden action becomes unreconstructable after the fact.

**Does not carry forward.** A future run asks fresh rather than inheriting this
(memory: `feedback_automation_decision_gates`).

## History of scope choices

| Run | Scope Type | Target | Notes |
|---|---|---|---|
| *(pre-migration runs)* | — | — | Runs before 2026-07-29 live under `platform_core_data/runs/RUN-2026071*` and predate the Module Workspace architecture. Their scope history is preserved in `NDC_Previous_used_helper_docs_tobe_delete/run_configuration.md`. |
| `run-001` (folder created at Stage `4M`) | User Story | US-4222 — [Admin] Update Agency | Manual Execution Pipeline. Agency-record mutation authorized (historical override, preserved above). First module registered on this install. |
| `run-002__2026-08-03_10-26-17__UserStory__US-8605CreateBranch` | User Story | US 8605 — [Admin] Create Branch | Manual Execution Pipeline. Branch-record mutation authorized (override preserved above). `branch` module approved and scaffolded 2026-08-03; Super Admin credentials supplied 2026-08-03. Executed 31 of 39 cases: 27 Passed, 3 Failed, 1 Inconclusive. |
| `run-003__2026-08-04_11-24-38__UserStory__US-8599-SearchActions_US-8606-UpdateBranch` | User Story | US 8599 — Search & Actions Branch **+** US 8606 — Update Branch | **Manual Execution Pipeline (`4M`), chosen at Stage 1's gate 2026-08-04.** Two stories in one run — US 8606 supplied to resolve US 8599's edit-pen dependency. Mutation narrowed to **self-created Branch records only** (above). Project Context approved at Revision 7. Closes the Search Branch exclusion that Revision 5 had deferred to "the module's own future Search scope". Open coverage gap: Admin-role credentials not provisioned, so XC-06 self-approval is untestable. |
| `run-004__2026-08-17_14-35-25__UserStory__US-4222-UpdateAgency` | User Story | US-4222 — [Admin] Update Agency | **Automation Pipeline (`4A` → `5A` → `6A`), chosen at Stage 1's gate 2026-08-17** — a branch change for `agency`, which ran `4M` in run-001. A **new, independent run**, not a refinement of run-001; run-001's artifacts are read-only reference. Requirement re-verified against freshly pasted AC — **no drift**. Mutation narrowed to **self-created Agency records only**; the run is the first `agency` run governed by `execution_safety_policy.json`. Branch-module knowledge reused under a recorded boundary (see `metadata/BranchKnowledgeReuse.md`). |
