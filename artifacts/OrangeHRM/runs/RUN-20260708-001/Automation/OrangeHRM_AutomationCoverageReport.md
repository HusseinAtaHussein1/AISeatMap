# OrangeHRM — Automation Coverage Report — RUN-20260708-001

> Per `agents/automation_agent.md` §16. Aggregate view over the Automation Decision Report (`OrangeHRM_AutomationDecisionReport.md`). Scope: the 11 approved Login / Authentication & Access test cases only (`RUN-20260706-002`'s PIM test cases are out of scope for this run — see Automation Plan §1 header).

## 1. Decision Counts

| Decision | Count | % of 11 |
|---|---|---|
| Reuse Existing Automation | 0 | 0.0% |
| Generate New Automation | 9 | 81.8% |
| Partially Automatable | 0 | 0.0% |
| Manual Only | 2 | 18.2% |

**Automation Coverage (Reuse + Generate, full or partial): 9/11 = 81.8%.**

## 2. Named Reasons — Manual Only (2)

| Test Case | Reason |
|---|---|
| TC-LOGIN-006 | EXPLORATORY disposition (FINDING-002) — Test Design's own Expected Result specifies no fixed pass/fail assertion; a human reviewer decision, not a system behavior, is what's being sought. |
| TC-LOGIN-010 | EXPLORATORY disposition (FINDING-006) — same reasoning; Test Design's Expected Result asks a human reviewer to judge whether timing/availability asymmetry is in-scope, with no assertable system behavior specified. |

## 3. Named Reasons — Partially Automatable (0)

None. Every test case in this scope resolved cleanly to either a full `Generate New Automation` or a full `Manual Only` decision — no test case had a mix of automatable and non-automatable steps.

## 4. Finding Coverage (this run's scope)

Of the 6 Findings from `RUN-20260706-002`'s approved `Findings_Summary.md`, 4 are Login-scoped and therefore relevant here:

| Finding | Test Case | Automation Decision |
|---|---|---|
| FINDING-001 (Emoji username → server error) | TC-LOGIN-004 | Generate New Automation (regression, expected to fail against current build) |
| FINDING-002 (No brute-force protection) | TC-LOGIN-006 | Manual Only (exploratory) |
| FINDING-005 (Forgot Password 504) | TC-LOGIN-009 | Generate New Automation (regression, expected to fail against current build) |
| FINDING-006 (Forgot Password enumeration timing) | TC-LOGIN-010 | Manual Only (exploratory) |

FINDING-003 and FINDING-004 are PIM-scoped and out of scope for this run.

## 5. Carried-Forward Test Gaps (informational — not this agent's to resolve)

Per `RUN-20260706-002`'s Coverage Report §4, one Login-relevant gap exists upstream of this stage: TC-LOGIN-011's Discovery Reference relies on `RUN-20260706-001` rather than this run's own re-verification. This does not block automation (the test case itself is fully specified) but is noted here for the Execution Agent and any future Stage 3 revision, per §16's requirement to name every exception rather than silently omit it.
