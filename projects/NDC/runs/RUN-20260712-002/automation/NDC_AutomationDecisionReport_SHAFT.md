# NDC — Automation Decision Report — RUN-20260712-002 — SHAFT

Per `agents/automation_agent.md` §13 — every approved test case gets exactly one decision: Reuse, Generate, Partially Automatable, or Manual Only.

| Test Case | Decision | Reasoning |
|---|---|---|
| TC-BRANCH-001 | Generate | Clean, directly observed happy-path structure; Reference Project locators trusted (matched live Discovery) |
| TC-BRANCH-002 | Partially Automatable | Action automated (submit with empty required fields); exact validation message not independently observed — captured, not asserted, per Test Design's assumption-based framing |
| TC-BRANCH-003 | Partially Automatable | Same reasoning as TC-BRANCH-002 — boundary-length behavior unconfirmed |
| TC-BRANCH-004 | Partially Automatable | Same reasoning — security-probe response unconfirmed; automated as an input-handling probe only |
| TC-BRANCH-005 | Generate | Simple, directly observed structural check (row count > 0) |
| TC-BRANCH-006 | **Manual Only** | Exploratory-test disposition (FINDING-004, Status Needs Human Review) — a human-judgment charter, never a fixed-assertion script |
| TC-BRANCH-007 | **Blocked** (2026-07-18, FINDING-008) | Icon selector itself confirmed fine; genuinely blocked upstream — the Pending Branch it needs to reject is not visible in the List/Grid via any path (Search, default view, or any Status filter). Same shape as Activate Agency. Code remains in `Branch_TC.java` but cannot pass until the real approval mechanism is found. |
| TC-BRANCH-008 | Generate | Confirmed application behavior (APP-002, 2026-07-18): Branch Payment Option reflects Master Payment Method Online/Offline status directly — asserted end-to-end, execution-confirmed passing against `.70` (see `NDC_AutomationSummary_SHAFT.md`'s Known Limitations for the environment note) |
| TC-AGENCY-001 | Generate | Clean happy-path structure; but see Known Limitations — Agency_Page.java is newly authored this run, not yet execution-confirmed |
| TC-AGENCY-002 | Partially Automatable | Same reasoning as TC-BRANCH-002 |
| TC-AGENCY-003 | **Manual Only** | Exploratory-test disposition (FINDING-003) |
| TC-AGENCY-004 | Partially Automatable | Radio-group default/enforcement behavior unconfirmed |
| TC-AGENCY-005 | Generate | Confirmed application behavior (BR-001, 2026-07-18): Arabic-script stripped by design, CJK/Latin preserved — asserted directly. (Interim reclassification to Partially Automatable during RUN-20260713-001, while expected behavior was still an open question, is superseded — see FINDING-006 Resolution.) |
| TC-STAFF-001 | Generate | Clean happy-path structure; Reference Project locators trusted |
| TC-STAFF-002 | Partially Automatable | Same reasoning as TC-BRANCH-002 |
| TC-STAFF-003 | Partially Automatable | Uniqueness-enforcement behavior unconfirmed |
| TC-STAFF-004 | **Manual Only** | Exploratory-test disposition (FINDING-005) |
| TC-STAFF-005 | Generate | Simple, directly observed structural check (default radio state) |

**Totals:** 6 Generate (unconditional) + 1 Generate (conditional) + 7 Partially Automatable + 3 Manual Only = 17.
