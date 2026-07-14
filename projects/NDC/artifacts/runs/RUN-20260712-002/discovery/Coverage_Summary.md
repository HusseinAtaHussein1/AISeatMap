# NDC — Coverage Summary (RUN-20260712-002)

Basis: Project Context v3 §2 in-scope surface = Admin → Branch (list/add/edit), Admin → Agency (list/add/edit), Admin → Staff (list/add/edit). 9 named screen-states.

| Screen/State | Status | Discovery Mode | Notes |
|---|---|---|---|
| Branch — List | Visited | Browser Automation | 149 records observed |
| Branch — Add | Visited | Browser Automation | Full field set captured |
| Branch — Edit | **Blocked** | Browser Automation | Actions-column click landed on Reject/Deactivate, not Edit — see FINDING-004. Not re-attempted this run. |
| Agency — List | Visited | Browser Automation | 9,537 records (after explicit Search) |
| Agency — Add | Visited | Browser Automation | Full field set captured |
| Agency — Edit | **Unreachable this run** | — | Not attempted, given the Branch-Edit near-miss; deprioritized to avoid risking a real record on shared data without a verified-safe selector. |
| Staff — List | Visited | Browser Automation | Grid empty even under Both-status Search — see FINDING-005 |
| Staff — Add | Visited | Browser Automation | Full field set captured |
| Staff — Edit | **Unreachable this run** | — | No Staff record was found to open for Edit (List returned zero rows) |

**Coverage % = 6/9 in-scope screen-states visited (67%)** — List + Add for all three modules; Edit unconfirmed for all three (one blocked by a near-miss, two unreachable given no located record / a now-known Actions-column risk).

## Skipped / Deferred

- Deleting or attempting to delete a Branch/Agency with dependent child records (Project Context v3 §6 Q2) — deferred, since the Edit-screen Actions-column ambiguity (FINDING-004) makes any Actions-column click risky until locators are verified precisely; recommend resolving that first (e.g., in Stage 4 Automation's selector verification) before any destructive-action probing.
- Role-based authorization check (Agency/Agent credential access to these Admin screens, §6 Q3) — deferred; Agent credential unavailable, Agency credential unconfirmed per `run_configuration.md`.
- Uniqueness-constraint probing (§6 Q4) — deferred; would require actually submitting an Add form, which Discovery intentionally did not do (mutation is reserved for Stage 5 Execution against designed test cases, not ad hoc Discovery probing).
