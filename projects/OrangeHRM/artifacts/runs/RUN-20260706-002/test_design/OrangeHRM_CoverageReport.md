# OrangeHRM — Coverage Report — RUN-20260706-002

> **Status:** `Approved` (reviewer: Aymoon, QA Architect / Test Lead role, 2026-07-06). Per `agents/test_design_agent.md` §8.

## 1. Requirement Coverage

### Covered Requirements (13/14)

| Requirement | Test Case(s) |
|---|---|
| PRD FR-1 (login form) | TC-LOGIN-001, 002, 003, 005, 011 |
| PRD FR-2 / §10 SR-1 (deep-link redirect) | TC-LOGIN-007 |
| PRD FR-3 / §10 SR-3 (Forgot Password anti-enumeration) | TC-LOGIN-008, 009, 010 |
| PRD §10 SR-5 (brute-force protection) | TC-LOGIN-006 |
| PRD FR-5 (Employee List display) | TC-PIM-001 |
| PRD FR-6 (Employee List filters) | TC-PIM-002, 003, 004, 014 |
| PRD FR-7 (sorting/pagination) | TC-PIM-012, 013 |
| PRD FR-8 (row Actions, Assumption) | TC-PIM-011 |
| PRD FR-9 / VR-1 (Add Employee) | TC-PIM-005 |
| PRD VR-2 (photo upload constraint) | TC-PIM-007 |
| PRD FR-10 (Employee Detail tabs) | TC-PIM-008 |
| PRD FR-11 (Personal Details fields) | TC-PIM-009 |
| PRD BR-3 (stable empNumber) | TC-PIM-010 |

### Uncovered Requirements (1/14)

| Requirement | Reason |
|---|---|
| PRD BR-4 (Employee Id free-text/editable, uniqueness unconfirmed) | The field's editable/free-text property was observed structurally during Add Employee exploration (`discovery/pim_add_employee.md`) but was not captured as its own dedicated test case — TC-PIM-004 and TC-PIM-006 exercise the same field but trace to FINDING-003/FINDING-004, not to BR-4 directly. True uniqueness-enforcement cannot be tested at all without actually saving a duplicate Employee Id, which Project Context §5 places out of scope for this run. Genuine gap — should be closed in a future Stage 3 revision, not retrofitted here to inflate the count. |

**Requirement Coverage: 13/14 = 92.9%**

## 2. Finding Coverage

Every Finding from the approved `findings/Findings_Summary.md` (6 total) received exactly one disposition, per `agents/test_design_agent.md` §5.3:

| Finding | Disposition | Test Case |
|---|---|---|
| FINDING-001 (Login emoji → server error) | Regression test | TC-LOGIN-004 |
| FINDING-002 (No brute-force protection) | Exploratory test | TC-LOGIN-006 |
| FINDING-003 (Employee Id filter silent 422) | Regression test | TC-PIM-004 |
| FINDING-004 (Employee Id uniqueness-check 500) | Regression test | TC-PIM-006 |
| FINDING-005 (Forgot Password 504) | Regression test | TC-LOGIN-009 |
| FINDING-006 (Forgot Password enumeration timing) | Exploratory test | TC-LOGIN-010 |

**Covered Findings: 6/6. Uncovered Findings: 0. Documented exceptions: 0.**
**Finding Coverage: 6/6 = 100%.**

No Finding this run was `Rejected`/`Duplicate` or otherwise out of testable scope, so no "documented exception" disposition was needed — every Finding was either `Confirmed` (→ regression test, asserting the corrected behavior) or `Needs Human Review` (→ exploratory test, asking a reviewer to make the call this agent cannot make unilaterally).

## 3. Negative Test Generation Coverage

Per `agents/test_design_agent.md` §7, every applicable category was evaluated for the Login and PIM workflows:

| Category | Login | PIM |
|---|---|---|
| Invalid Inputs | TC-LOGIN-002 | TC-PIM-003 |
| Boundary Values | TC-LOGIN-011 (evidence-thin, Test Gap) | TC-PIM-004 |
| Empty Values | TC-LOGIN-003 | TC-PIM-005 |
| Unicode | TC-LOGIN-004 | TC-PIM-006 |
| Special Characters | **Not Applicable this run** — no dedicated test case generated; PRD-adjacent coverage exists only via `RUN-20260706-001`'s independent exploration of the Login form (not this run's own Discovery), which is why it is not cited as this run's Discovery Reference. Logged as a Test Gap, not silently omitted. | **Not Applicable this run** — not independently tested on any PIM field; Test Gap. |
| Security Inputs | TC-LOGIN-005 | Not independently tested on PIM fields this run — Test Gap (the SQLi-style probe was only run against Login). |
| Timeouts | TC-LOGIN-009, TC-LOGIN-010 (both stem from the Forgot Password 504) | Not applicable — no PIM timeout condition was observed this run. |

## 4. Test Gaps Summary (carried forward for the Automation/Execution Agents' awareness)

1. Employee List sorting and pagination — functionally untested (TC-PIM-012/013 are designed but evidence-thin).
2. 6 of 7 Employee List filter fields — only Employee Id was functionally tested (TC-PIM-014 is designed but evidence-thin, with Risk explicitly elevated given FINDING-003's precedent).
3. 8 of 10 Employee Detail tabs — not individually opened (Contact Details, Emergency Contacts, Dependents, Immigration, Salary, Report-to, Qualifications, Memberships).
4. Special Characters and Security Inputs negative-test categories on PIM fields — not independently tested this run.
5. BR-4 (Employee Id true uniqueness enforcement) — cannot be tested without a data mutation out of this run's scope.
