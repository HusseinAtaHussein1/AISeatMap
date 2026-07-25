# NDC — QA Assessment Report (RUN-20260712-002)

**Stage:** 2 — Explorer Agent · **Run:** RUN-20260712-002 · **Date:** 2026-07-12 · **Project Context:** v3

## Scope

Admin → Branch, Agency, Staff (list/add/edit), per `ProjectContext_BranchAgencyStaff.md`. Observation-based Spike — no PRD backing.

## Objectives

1. Establish the real field set and structure of Branch/Agency/Staff Add screens (Project Context v3 §6 Q1).
2. Confirm the organizational hierarchy (Company → Branch → Agency → Staff) at the UI level.
3. Investigate the open questions in Project Context v3 §6 to the extent safely possible without submitting mutations.

## Evidence Sources

**Discovery Mode: Browser Automation**, via `tools/browser_driver/` (a real, authenticated Playwright session). This upgrades the run's initially-decided Discovery Mode (User-guided exploration) — once the driver was confirmed working against this project (precedent: RUN-20260712-001's Login discovery), Explorer Agent §8.2 requires using the highest-priority available mode rather than a lower one out of convenience. No manual user walkthrough was required as a result.

## Modules Explored

Branch (List, Add; Edit blocked — FINDING-004), Agency (List, Add; Edit not attempted), Staff (List, Add; Edit unreachable — no record found).

## Observed Behaviour

See the six Discovery snapshots (`Branch_List.md`, `Branch_Add.md`, `Agency_List.md`, `Agency_Add.md`, `Staff_List.md`, `Staff_Add.md`) for full per-screen detail. Headline observations:

- All three modules' Add forms submit to an approval queue ("Send For/for Approval"), not immediate activation (FINDING-002).
- Branch and Agency share a structurally identical Payment Option checkbox set, suggesting shared Master-data configuration.
- Branch's List auto-populates; Agency's requires an explicit Search click (FINDING-003); Staff's search behavior is unresolved (FINDING-005).
- A Branch List Actions-column click landed on Reject/Deactivate rather than Edit, with no mutation submitted (FINDING-004) — this blocked Edit-screen discovery for Branch, and Agency/Staff Edit were not attempted given the same risk.

## Confirmed Behaviour

- Organizational hierarchy confirmed at the UI level: Branch requires Operating Country; Agency requires Branch (dropdown); Staff requires Operating Country + Branch. Matches `architecture.md`'s Company → Branch → Agency → Staff chain.
- Branch: 149 records. Agency: 9,537 records (only visible after explicit Search — FINDING-003). Staff: 0 records visible under any filter tried (unconfirmed as real — FINDING-005).

## Assumptions

Per Project Context v3 §6, all five carried-forward Open Questions are addressed below:

| # | Question | Resolution this run |
|---|---|---|
| 1 | Exact field set/validation of Add/Edit forms | Add forms fully captured (Branch/Agency/Staff); Edit forms not captured (blocked/unreachable) |
| 2 | Parent-child delete/referential integrity | Not tested — deferred (Coverage_Summary) |
| 3 | Agency/Agent role access to these screens | Not tested — Agency credential status unconfirmed, Agent credential unavailable |
| 4 | Uniqueness constraints | Not tested — no Add form was submitted this Discovery pass |
| 5 | Staff scoping (per-Agency/per-Branch/global) | Partially confirmed: Staff's List filter and Add form both key on Branch, not Agency — suggests Branch-scoped |

## Open Questions

- Is `192.168.1.70` (documented) or `192.168.1.80` (actual) the correct STG URL going forward? (FINDING-001)
- Does Staff genuinely have zero records in STG, or did this run's automation mis-click the Both-status filter? (FINDING-005)
- Where are Branch/Agency/Staff "Send For Approval" submissions actually approved — the Agency submenu's "Registration Requests" screen is a plausible candidate but was out of scope this run.

## Discovered Risks

See Findings Summary — FINDING-004 is the most operationally significant: any future automation against Branch's (or Agency's) List Actions column must use a verified, non-positional selector to avoid accidentally rejecting/deactivating real shared-environment data.

## Coverage

67% (6/9 in-scope screen-states) — see `Coverage_Summary.md` for the full breakdown and deferral rationale.

## Gaps

- Branch/Agency/Staff Edit screens — not captured this run (see Coverage_Summary for per-module reasons).
- No delete/referential-integrity, role-boundary, or uniqueness probing performed (all deferred, per Project Context v3's mutation-authorization being reserved for Stage 5 Execution against designed test cases, not ad hoc Discovery).

## Recommendations

1. Resolve FINDING-001 (URL) and FINDING-004 (Actions-column selector risk) before Stage 4 Automation scripts any Edit/Reject flow.
2. Stage 3 Test Design should treat "Send For Approval" as the actual create-flow outcome (FINDING-002), not "record immediately Active."
3. Re-attempt Staff List's Both-status search with an interstitial screenshot to resolve FINDING-005 before assuming zero Staff records.

## Inputs for Test Design

- Full field inventories: `Branch_Add.md`, `Agency_Add.md`, `Staff_Add.md`.
- List-screen filter/column inventories: `Branch_List.md`, `Agency_List.md`, `Staff_List.md`.
- All 5 Findings, each with a stated Recommendation.
- Project Context v3's still-open questions (§6), reconciled against what this run could/couldn't resolve (table above).
