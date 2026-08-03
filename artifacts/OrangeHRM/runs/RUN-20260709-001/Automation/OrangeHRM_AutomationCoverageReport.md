# OrangeHRM — Automation Coverage Report — RUN-20260709-001

> Per `agents/automation_agent.md` §16. Aggregate view of the Automation Decision Engine's output (§13 / `OrangeHRM_AutomationDecisionReport.md`).

## 1. Aggregate Decision Counts

| Decision | Count | % of Suite |
|---|---|---|
| Reuse Existing Automation | 0 | 0% |
| Generate New Automation | 9 | 81.8% |
| Partially Automatable | 0 | 0% |
| Manual Only | 2 | 18.2% |
| **Total (approved Login test cases)** | **11** | **100%** |

**Automation Coverage: 9/11 (≈81.8%)** — identical to RUN-20260708-001's coverage figure for the same test case set, since coverage is a function of test-case specification completeness, not the executing framework.

## 2. Named Reasons — Manual Only (2)

| Test Case ID | Reason |
|---|---|
| TC-LOGIN-006 | EXPLORATORY disposition (Test Design) — no fixed pass/fail assertion exists to automate; asserting one would invent business logic Test Design deliberately declined to set. See FINDING-002. |
| TC-LOGIN-010 | EXPLORATORY disposition (Test Design) — same reasoning; response-time/availability parity is a pending policy decision, not an assertable criterion. See FINDING-006. |

## 3. Named Reasons — Partially Automatable (0)

None — no test case in this scope received a Partially Automatable decision.

## 4. Regression Tests Expected to Fail By Design

| Test Case ID | Finding | Expected Outcome |
|---|---|---|
| TC-LOGIN-004 | FINDING-001 | Fails against the current build ("Unexpected error occurred" actually shown vs. "Invalid credentials" expected) — confirms the defect, not an automation defect. |
| TC-LOGIN-009 | FINDING-005 | Fails or times out against the current build (504 Gateway Time-out) — confirms the defect, not an automation defect. |

## 5. Suite-Level Summary

- **Total approved test cases in scope:** 11 (Login / Authentication & Access, per Project Context v2 §2)
- **Automated (Generate New Automation):** 9
- **Manual/Exploratory (no automation asset):** 2
- **Reused from an existing package:** 0 — no source-level reuse was possible across the language/framework boundary (Automation Plan §6)
- **Framework:** Playwright, Java (Maven, JUnit 5)
