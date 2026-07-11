> **Status:** `Approved` (reviewer: Aymoon, Automation Lead / Release Manager role, 2026-07-06).

# Automation Coverage Report — RUN-20260706-002

## Decision Distribution

| Decision | Count | % of 25 |
|---|---|---|
| Generate New Automation | 21 | 84% |
| Partially Automatable | 3 | 12% |
| Reuse Existing Automation | 0 | 0% |
| Manual Only | 0 | 0% |

**Automation Coverage (fully or partially automated): 24/25 = 96%.** (All 25 have *some* automated component; the 3 Partially Automatable cases each still produce a runnable, deterministic sub-observation — see the Automation Decision Report for exactly what is/isn't asserted in each.)

## Named Reasons — Partially Automatable Cases

- **TC-LOGIN-006, TC-LOGIN-010**: both stem from Findings whose Status is `Needs Human Review` (FINDING-002, FINDING-006) — the underlying ambiguity is a policy/acceptability judgment, not a technical question. Automating a fixed pass/fail assertion on top of a Finding this agent's own upstream stage explicitly marked as requiring human judgment would contradict that judgment, not respect it.
- **TC-PIM-011**: Assumption-based (PRD §13 item 4) — the row Action icons' semantics were never confirmed by any stage. Automating an assertion of "these are Edit/Delete buttons" would assert something not yet established as fact.

## Regression Tests Expected to Fail at Stage 5 (by design — not an automation defect)

TC-LOGIN-004 (FINDING-001), TC-LOGIN-009 (FINDING-005), TC-PIM-004 (FINDING-003), TC-PIM-006 (FINDING-004) — each asserts the *corrected* behavior for a Confirmed bug that has not been fixed. See Automation Plan, Risks section.
