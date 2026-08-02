# Run Configuration

> Describes *this run's* scope and environment. It never names which project it applies to — the
> Target Project's location is tool configuration (`platform.config.json` → `targetRoot`), not run
> configuration (`pipeline.md` §1.1).
>
> This file records **configuration, not a decision already executed**. Any change here takes effect the
> next time Stage 1 runs; editing it never retroactively changes an approved Project Context.

**Application:** NDC Admin Portal
**Configured:** 2026-07-31, from the user's answers to this run's pre-flight decision gate (`pipeline.md` §5.4, §5.5).

## Target Environment

| Key | Value |
|---|---|
| Environment | **STG** — shared staging, *not* isolated (other testers/teams have live data on it) |
| Application URL | `http://192.168.1.70` — internal/LAN address, plain HTTP |
| Environment notes | Shared environment. Confirmed as this run's target by the user on 2026-07-31; last verified reachable during the pre-migration NDC runs (2026-07-25). **Reachability has not been re-verified since the 2026-07-29 platform migration** — Stage 2 confirms it before doing anything else and reports it as a blocker if unreachable. |
| Execution Mode | **Headed** for Stage `4M` — mandatory for the Manual branch, so a human can watch each interaction live (`pipeline.md` §3.4) |

## Pipeline Branch

**Manual Execution Pipeline — Stages 1 → 2 → 3 → `4M`.** Chosen by the user on 2026-07-31.

The Automation branch (`4A` → `5A` → optional `5H` → `6A`) is **not applicable to this run** — a branch not
taken is never recorded as a gap (`pipeline.md` §6 Rule 3a). No automation code is generated, no script of
any kind is produced, and no framework decision is required.

## Run Scope

| Key | Value |
|---|---|
| Run Type | **User Story** |
| Run Scope Type | **User Story** (`run_scope.md` §3) — expected to resolve to `single` module |
| Run Scope Source | **Markdown file** — [`requirements/user_stories/US-4222_Admin_Update_Agency.md`](requirements/user_stories/US-4222_Admin_Update_Agency.md) (originally supplied as pasted text on 2026-07-31, transcribed to that file before Stage 1 ran) |
| Target | US-4222 — [Admin] Update Agency |

## Modules In Scope

_The modules this run covers. Everything else is out of scope for this run._

**To be proposed by Stage 1 and approved by a human at Stage 1's gate.** The story's acceptance criteria
target the Admin → Agency update flow; Stage 1 proposes the decomposition and no other stage may (`pipeline.md`
§4 Stage 1). `modules/modules.json` is currently empty — this is the first module registered on this
platform install.

The story's own **Reflection** section names five downstream areas (Rule Engine, Search & Booking, NDC
Portal Screens, Reports, Top Up). Whether those are in scope for downstream-effect verification or listed
as impact awareness only is Open Question #8 in the story file — Stage 1 resolves or carries it forward,
and does not widen scope on its own (§5.3.1 #3).

## Requirements Sources

| Source | Path | Status |
|---|---|---|
| **PRD** | [`PRD.md`](PRD.md) | Restored 2026-07-31 from `NDC_Previous_used_helper_docs_tobe_delete/PRD.md` by user decision. ⚠️ **Reverse-engineered from the Reference Automation Project on 2026-07-25, marked *Draft for business review* — not business-approved.** Every requirement carries an evidence tag: **[V]** verified by an automated assertion, **[O]** observed but unasserted, **[I]** inferred from locators/field names only. Downstream stages must carry those tags forward and treat `[O]`/`[I]` as **unconfirmed**, never as settled acceptance criteria. |
| **In-scope User Story** | [`requirements/user_stories/US-4222_Admin_Update_Agency.md`](requirements/user_stories/US-4222_Admin_Update_Agency.md) | Business-supplied, verbatim. This is the **authoritative** requirement for this run where it and the PRD disagree — it is business-written and the PRD is reverse-engineered. A disagreement is reported as a discrepancy, never silently reconciled. |
| **Prior user stories** | [`PRD_UserStories.md`](PRD_UserStories.md) | Restored alongside `PRD.md` because that document's own provenance note cites it. Historical context (Create Agency, Create Role, Credential Route lists, Airline whitelist/blacklist) — not a requirement source for this run. |

### Requirement authority — revised 2026-07-31 by user directive

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
| Admin | Stage 2 Discovery and Stage `4M` execution of the Admin → Agency update flow | ⛔ **`credentials.json` does not exist on this install.** It must be created by a human — the platform never writes it. Stage 1 does not need it; **Stage 2 cannot start without it.** |
| Agency (Portal) | Only if a Reflection-area check requires viewing the agency portal | Not set up |

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

## History of scope choices

| Run | Scope Type | Target | Notes |
|---|---|---|---|
| *(pre-migration runs)* | — | — | Runs before 2026-07-29 live under `platform_core_data/runs/RUN-2026071*` and predate the Module Workspace architecture. Their scope history is preserved in `NDC_Previous_used_helper_docs_tobe_delete/run_configuration.md`. |
| *(this run — folder created at Stage `4M`)* | User Story | US-4222 — [Admin] Update Agency | Manual Execution Pipeline. Agency-record mutation authorized (above). First module registered on this install. |
