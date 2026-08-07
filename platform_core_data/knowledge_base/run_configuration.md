# Run Configuration

> Describes *this run's* scope and environment. It never names which project it applies to — the
> Target Project's location is tool configuration (`platform.config.json` → `targetRoot`), not run
> configuration (`pipeline.md` §1.1).
>
> This file records **configuration, not a decision already executed**. Any change here takes effect the
> next time Stage 1 runs; editing it never retroactively changes an approved Project Context.

**Application:** NDC Admin Portal
**Configured:** 2026-08-04, updated for the active run (**run-003** — US 8599 Search & Actions Branch + US 8606 Update Branch); supersedes the 2026-08-03 configuration written for run-002 (US-8605 — Create Branch), whose scope entry is preserved in §History of scope choices.

## Target Environment

| Key | Value |
|---|---|
| Environment | **STG** — shared staging, *not* isolated (other testers/teams have live data on it) |
| Application URL | `http://192.168.1.70` — internal/LAN address, plain HTTP |
| Environment notes | Shared environment. Originally confirmed as the run target by the user on 2026-07-31; last verified reachable during the pre-migration NDC runs (2026-07-25). **Reachability has not been re-verified since the 2026-07-29 platform migration, and has not been re-checked for this run** — Stage 2 (Discovery) confirms it before doing anything else and reports it as a blocker if unreachable. |
| Execution Mode | **Headed** — mandatory for Stage `4M`, so a human can watch each interaction live (`pipeline.md` §3.4). **Applicable to this run:** the Manual branch was chosen on 2026-08-04 (below). |

## Pipeline Branch

**Manual Execution Pipeline (`4M`) — chosen by the user on 2026-08-04**, at Stage 1's Human Review gate rather than deferred to the Stage 3 divergence point.

Consequences, per `pipeline.md` §3.3 and §6 Rule 3a:

- The run's stage path is **1 → 2 → 3 → 4M**, and `4M` is **terminal** — it self-reports its own Manual QA Report and Test Results CSV. There is no `5A` (Automation Execution), no `5H` (Self-Healing), and no `6A` (Reporting) for this run.
- The run folder will hold **`metadata/` + `manual_execution/`** only. The absence of `execution/` and `reporting/` **records the branch taken and is not a coverage gap.**
- Execution Mode is **Headed** — not optional on this branch.
- Stage `4A` (Automation) is not invoked, so no addition is made to the module's SHAFT package this run. The existing `modules/branch/automation/` package (Create Branch only, `Generated`) is untouched.

## Run Scope

| Key | Value |
|---|---|
| Run Type | **User Story** |
| Run Scope Type | **User Story** (`run_scope.md` §3) — resolved to `single` module (`branch`) |
| Run Scope Source | **Pasted text**, transcribed into [`PRD_UserStories.md`](PRD_UserStories.md) as User Story 7 and User Story 8 (Stage 1, 2026-08-04), per `run_scope.md` §4.1 |
| Target | **US 8599 — [Admin] Search & Actions Branch** *and* **US 8606 — [Admin] Update Branch** (two stories, one run) |
| Why two stories | US 8599's edit-pen AC asserts navigation to a pre-filled "Update Branch" page. US 8606 was supplied by the user expressly so that criterion resolves against a real requirement instead of being stubbed or deferred. US 8606's own `Dependency` names **Add Branch**, already covered by the module at Revision 5. |
| Active run folder | `run-003__2026-08-04_11-24-38__UserStory__US-8599-SearchActions_US-8606-UpdateBranch` |

## Modules In Scope

_The modules this run covers. Everything else is out of scope for this run._

**Resolved at Stage 1's gate on 2026-08-03: `branch`.** Proposed and approved (module was previously
`Proposed`, scaffolded on approval); it is the platform's active module for this run. No other module is in
scope for this run.

The story's own **Reflection** section names four downstream areas (Search Branch, Booking Module, Staff
CRUD, Agency CRUD) and its **Dependency** section names three upstream ones (Country POS, Department CRUD,
Payment Mode). These are recorded as Out-of-Scope / Module-Boundary items in
[`modules/branch/context/ProjectContext.md`](../modules/branch/context/ProjectContext.md) §3–§3.1, not
widened into this run's scope.

**Department CRUD ownership** — resolved from authoritative project documentation: `modules.json`'s own
proposed scope statement for the `company` module names "Departments (with referential-integrity delete)"
explicitly, sourced from PRD.md ORG-02. Ownership is therefore attributed to `company`, **which remains
`Proposed` (not yet approved/scaffolded)** — the attribution is settled; the module's approval is not. This
is not treated as an open item.

## Requirements Sources

| Source | Path | Status |
|---|---|---|
| **PRD** | [`PRD.md`](PRD.md) | ⚠️ **Reverse-engineered from the Reference Automation Project on 2026-07-25, marked *Draft for business review* — not business-approved.** Every requirement carries an evidence tag: **[V]** verified by an automated assertion, **[O]** observed but unasserted, **[I]** inferred from locators/field names only. Downstream stages must carry those tags forward and treat `[O]`/`[I]` as **unconfirmed**, never as settled acceptance criteria. For Branch, PRD.md §7.2 ORG-03/ORG-04 exist but are far coarser than the in-scope story below. |
| **In-scope User Stories** | [`PRD_UserStories.md`](PRD_UserStories.md) User Story 7 (US 8599 — Search & Actions Branch) and User Story 8 (US 8606 — Update Branch) | Business-supplied, verbatim, appended 2026-08-04. These are the **authoritative** requirements for this run where they and PRD.md disagree — business-written and more granular; PRD.md is reverse-engineered from automation. A disagreement is reported as a Finding/discrepancy, never silently reconciled, and never converted into a settled requirement without evidence from the running application. |
| **PRD cross-cutting sections — corroborating, not competing** | [`PRD.md`](PRD.md) §6.1 (XC-01…XC-07), §6.2 (XC-08…XC-16), §6.3 (XC-17…XC-23), §9.2 | **New emphasis for this run.** For US 8605 (Create), PRD.md was *coarser* than the story. For US 8599 the reverse holds in places: the story describes the search/action surface in business terms while PRD.md specifies the platform-wide behaviours it instantiates — including **[V]**-tagged contractual strings (`No data has been found!`, `Showing <n> results of <m> results`) and structural rules (Status and Approval Status are **distinct** columns, XC-07) the story never restates. Where the two are silent-vs-specific rather than contradictory, **both** are carried into Test Design. See `modules/branch/context/ProjectContext.md` §1. |
| **Prior in-scope User Story** | [`PRD_UserStories.md`](PRD_UserStories.md) User Story 5 (US 8605 — Create Branch) | run-002's requirement. Still relevant here as the **create** path this run uses to seed its own test records (see the mutation override below), and because US 8606 restates its field rules for the Update screen. |
| **Prior user stories** | [`PRD_UserStories.md`](PRD_UserStories.md) User Stories 1–4, User Story 6 | Historical context (Create Agency, Create Role, Credential Route lists, Airline whitelist/blacklist, Agency wallet Threshold) — not requirement sources for this run, though User Story 3's Product Access Details is cited as a structural analogue, and User Story 6 §2/§4 remains the authoritative source for the Branch "Outstanding Threshold" field. |

### Requirement authority — revised 2026-07-31 by user directive (historical — scoped to US-4222 only)

**This subsection describes the prior run's (US-4222) override and does not apply to the current run
(US-8605 — Create Branch).** For US-8605, the default rule in the Requirements Sources table above stands
unmodified: the in-scope User Story (US 8605) is authoritative over PRD.md where they disagree, with no
application-primacy override granted. Preserved below for traceability of the prior run's decision.

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
| Super Admin (`odeysysadmin`, per PRD.md §2 Actor table) | Stage 2 Discovery; the Search Branch grid, filters and pagination; the Update Branch form; and the approve/reject actions (Super Admin is the platform's approver role, XC-06). Also the Create Branch flow, used this run to **seed the run's own test records** | ✅ **Set up 2026-08-03, still current.** Supplied by the user and written directly to `credentials.json` (git-ignored); values are never echoed in any artifact, tool call, or report. |
| **Admin** (day-to-day operator, PRD.md §2 `LogIn_Page.ClickAdmin()`) | US 8599 names **two** actors — *"As a Super Admin and admin"* — where US 8605 named only "System Administrator" | ✅ **Resolved by user directive 2026-08-04:** *"treate odeysysadmin as an admin and super admin."* The single Super Admin account stands in for both actors this run. No second credential is needed to proceed. **Two limits survive the directive** — see the note below; they are limits of *observation*, not of authorization, and neither blocks the run. |

**Note on the single-account directive (2026-08-04) — what it does and does not cover.**

✅ **XC-06 self-approval IS testable, and must be designed.** An earlier reading of this configuration recorded self-approval as blocked-for-lack-of-a-second-account. That was wrong: one account is *precisely* the self-approval configuration — create a Branch as `odeysysadmin`, then attempt to approve that same Branch as `odeysysadmin`. If it succeeds, XC-06 is unimplemented (a definitive answer to PRD.md `OQ-1` and a governance finding); if it is blocked, XC-06 is confirmed on evidence and PRD.md's **[I]** tag can be upgraded.

⚠️ **No control case.** With one account, "approval was blocked" cannot be distinguished from "approval is broken for everyone." A blocked result must be reported as *self-approval appears blocked*, with the message and behaviour captured as evidence (XC-03).

⚠️ **No role-differentiated observation.** `odeysysadmin` carries Super Admin privileges regardless of which actor it stands in for. Whether a genuinely lower-privileged Admin sees different grid columns, row actions, or enabled/disabled icon states **cannot be observed from a privileged account**. Those cases are marked `Not Covered — Single-Account Run` and reported untested, never passed.
| Agency (Portal) | Not needed — no Reflection-area check for this run requires the agency portal | Not set up (not required) |

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

## History of scope choices

| Run | Scope Type | Target | Notes |
|---|---|---|---|
| *(pre-migration runs)* | — | — | Runs before 2026-07-29 live under `platform_core_data/runs/RUN-2026071*` and predate the Module Workspace architecture. Their scope history is preserved in `NDC_Previous_used_helper_docs_tobe_delete/run_configuration.md`. |
| `run-001` (folder created at Stage `4M`) | User Story | US-4222 — [Admin] Update Agency | Manual Execution Pipeline. Agency-record mutation authorized (historical override, preserved above). First module registered on this install. |
| `run-002__2026-08-03_10-26-17__UserStory__US-8605CreateBranch` | User Story | US 8605 — [Admin] Create Branch | Manual Execution Pipeline. Branch-record mutation authorized (override preserved above). `branch` module approved and scaffolded 2026-08-03; Super Admin credentials supplied 2026-08-03. Executed 31 of 39 cases: 27 Passed, 3 Failed, 1 Inconclusive. |
| `run-003__2026-08-04_11-24-38__UserStory__US-8599-SearchActions_US-8606-UpdateBranch` | User Story | US 8599 — Search & Actions Branch **+** US 8606 — Update Branch | **Manual Execution Pipeline (`4M`), chosen at Stage 1's gate 2026-08-04.** Two stories in one run — US 8606 supplied to resolve US 8599's edit-pen dependency. Mutation narrowed to **self-created Branch records only** (above). Project Context approved at Revision 7. Closes the Search Branch exclusion that Revision 5 had deferred to "the module's own future Search scope". Open coverage gap: Admin-role credentials not provisioned, so XC-06 self-approval is untestable. |
