# Run Configuration

> Describes *this run's* scope and environment. It never names which project it applies to — the
> Target Project's location is tool configuration (`platform.config.json` → `targetRoot`), not run
> configuration (`pipeline.md` §1.1).
>
> This file records **configuration, not a decision already executed**. Any change here takes effect the
> next time Stage 1 runs; editing it never retroactively changes an approved Project Context.

**Application:** NDC Admin Portal
**Configured:** 2026-08-03, updated for the active run (US-8605 — Create Branch); supersedes the 2026-07-31 configuration written for the prior run (US-4222 — Update Agency), preserved at the bottom of §History of scope choices.

## Target Environment

| Key | Value |
|---|---|
| Environment | **STG** — shared staging, *not* isolated (other testers/teams have live data on it) |
| Application URL | `http://192.168.1.70` — internal/LAN address, plain HTTP |
| Environment notes | Shared environment. Originally confirmed as the run target by the user on 2026-07-31; last verified reachable during the pre-migration NDC runs (2026-07-25). **Reachability has not been re-verified since the 2026-07-29 platform migration, and has not been re-checked for this run** — Stage 2 (Discovery) confirms it before doing anything else and reports it as a blocker if unreachable. |
| Execution Mode | **Headed** for Stage `4M` — mandatory for the Manual branch, so a human can watch each interaction live (`pipeline.md` §3.4). Not yet applicable — see Pipeline Branch below. |

## Pipeline Branch

**Not yet chosen for this run.** The prior run (US-4222) took the Manual Execution Pipeline; that choice does not carry forward. Stage 2 (Discovery) does not require this to be resolved; it becomes a blocker only at the Stage 3→4 branch point (`pipeline.md` §3, §5.4–§5.5).

## Run Scope

| Key | Value |
|---|---|
| Run Type | **User Story** |
| Run Scope Type | **User Story** (`run_scope.md` §3) — resolved to `single` module (`branch`) |
| Run Scope Source | **Pasted text**, transcribed into [`PRD_UserStories.md`](PRD_UserStories.md) as User Story 5 (Stage 1, 2026-08-03), per `run_scope.md` §4.1 |
| Target | US 8605 — [Admin] Create Branch |
| Active run folder | `run-002__2026-08-03_10-26-17__UserStory__US-8605CreateBranch` |

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
| **In-scope User Story** | [`PRD_UserStories.md`](PRD_UserStories.md) User Story 5 (US 8605 — Create Branch) | Business-supplied, verbatim, appended 2026-08-03. This is the **authoritative** requirement for this run where it and PRD.md disagree — it is business-written and more granular; PRD.md is reverse-engineered from automation. A disagreement is reported as a Finding/discrepancy, never silently reconciled, and never converted into a settled requirement without evidence from the running application. |
| **Prior user stories** | [`PRD_UserStories.md`](PRD_UserStories.md) User Stories 1–4 | Historical context (Create Agency, Create Role, Credential Route lists, Airline whitelist/blacklist) — not a requirement source for this run, though User Story 3 (Create Agency)'s Product Access Details section is cited as a structural analogue in the Branch Project Context §2. |

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
| Super Admin (`odeysysadmin`, per PRD.md §2 Actor table) | Stage 2 Discovery and any execution of the Admin → Branch → Create Branch flow, including approval steps (Super Admin is the platform's approver role, XC-06) | ✅ **Set up 2026-08-03.** Supplied by the user and written directly to `credentials.json` (git-ignored); values are never echoed in any artifact, tool call, or report. Covers both the maker (create) and checker (approve) steps for this run since Super Admin is the platform's highest-privilege account. |
| Agency (Portal) | Not needed — no Reflection-area check for this run requires the agency portal | Not set up (not required) |

## Environment Constraints (standing, project-wide)

- **Shared environment** — this staging instance is not isolated to this testing effort; assume other
  teams/testers have live data on it.
- **Standing default is read-only** — no data mutation is authorized unless a run-specific override below
  grants it. An override never loosens the default for any other run.
- **Negative tests that endanger a shared environment are deferred, not asked about** — lockout,
  brute-force, and similar destructive negative cases are designed in full and marked
  `Deferred / Requires Dedicated Environment` with the reason stated (`pipeline.md` §5.5).

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

## History of scope choices

| Run | Scope Type | Target | Notes |
|---|---|---|---|
| *(pre-migration runs)* | — | — | Runs before 2026-07-29 live under `platform_core_data/runs/RUN-2026071*` and predate the Module Workspace architecture. Their scope history is preserved in `NDC_Previous_used_helper_docs_tobe_delete/run_configuration.md`. |
| `run-001` (folder created at Stage `4M`) | User Story | US-4222 — [Admin] Update Agency | Manual Execution Pipeline. Agency-record mutation authorized (historical override, preserved above). First module registered on this install. |
| `run-002__2026-08-03_10-26-17__UserStory__US-8605CreateBranch` | User Story | US 8605 — [Admin] Create Branch | Pipeline branch not yet chosen. Branch-record mutation authorized (above). `branch` module approved and scaffolded 2026-08-03; Super Admin credentials supplied 2026-08-03. |
