# OrangeHRM — Requirement Traceability Matrix — RUN-20260706-002

> **Status:** `Approved` (reviewer: Aymoon, QA Architect / Test Lead role, 2026-07-06). Maps every Project Context / PRD requirement covered this run to its Test Case ID(s), Discovery Reference, and (where applicable) Finding/Evidence Reference. 100% of generated test cases are traced to a requirement — no orphans.

## Login / Authentication & Access

| Requirement | Test Case ID(s) | Discovery Reference | Finding Reference | Validation Status |
|---|---|---|---|---|
| PRD FR-1 (login form) | TC-LOGIN-001, TC-LOGIN-002, TC-LOGIN-003, TC-LOGIN-005, TC-LOGIN-011 | `discovery/login_deeplink_and_successful_login.md`, `discovery/login_validation_and_bruteforce.md` | N/A | Confirmed holding for every tested case except emoji input |
| PRD FR-2 / §10 SR-1 (deep-link redirect) | TC-LOGIN-007 | `discovery/login_deeplink_and_successful_login.md` | N/A | Confirmed |
| PRD FR-3 / §10 SR-3 (Forgot Password anti-enumeration) | TC-LOGIN-008, TC-LOGIN-009, TC-LOGIN-010 | `discovery/forgot_password_flow.md` | FINDING-005, FINDING-006 | **Contradicted** for valid usernames (FINDING-005); enumeration side channel open (FINDING-006) |
| PRD §10 SR-5 (brute-force protection) | TC-LOGIN-006 | `discovery/login_validation_and_bruteforce.md` | FINDING-002 | Confirmed absent; severity discrepancy vs. PRD flagged for human review |
| Not defined in Project Context (emoji input handling) | TC-LOGIN-004 | `discovery/login_validation_and_bruteforce.md` | FINDING-001 | **Contradicted** (defective) — regression test generated against corrected behavior |

## PIM — Employee Management

| Requirement | Test Case ID(s) | Discovery Reference | Finding Reference | Validation Status |
|---|---|---|---|---|
| PRD FR-5 (Employee List display) | TC-PIM-001 | `discovery/pim_employee_list_raw_snapshot.md` | N/A | Confirmed |
| PRD FR-6 (Employee List filters) | TC-PIM-002, TC-PIM-003, TC-PIM-004, TC-PIM-014 | `discovery/pim_employee_list_raw_snapshot.md`, `findings/FINDING-003.../metadata.md` | FINDING-003 | **Contradicted** for the Employee Id field above 10 characters; 6 of 7 fields not independently verified (Test Gap) |
| PRD FR-7 (sorting/pagination) | TC-PIM-012, TC-PIM-013 | Not independently verified in Discovery this run (Test Gap) | N/A | Structurally present; functionally untested |
| PRD FR-8 (row Actions — Assumption) | TC-PIM-011 | `discovery/pim_employee_list_raw_snapshot.md` | N/A | Assumption carried forward unresolved, per PRD §13 item 4 |
| PRD FR-9 / VR-1 (Add Employee, required fields) | TC-PIM-005 | `discovery/pim_add_employee.md` | N/A | Confirmed |
| Not defined in Project Context (Employee Id emoji handling) | TC-PIM-006 | `discovery/pim_add_employee.md` | FINDING-004 | **Contradicted** (defective) — regression test generated against corrected behavior |
| PRD VR-2 (photo upload constraint text) | TC-PIM-007 | `discovery/pim_add_employee_raw_snapshot.md` | N/A | Confirmed (text present; not functionally exercised) |
| PRD FR-10 (Employee Detail tabs) | TC-PIM-008 | `discovery/pim_employee_detail.md` | N/A | Confirmed |
| PRD FR-11 (Personal Details fields) | TC-PIM-009 | `discovery/pim_employee_detail.md` | N/A | Confirmed |
| PRD BR-3 (stable empNumber) | TC-PIM-010 | `discovery/pim_employee_detail.md` | N/A | Confirmed |

## Discrepancies Logged (not silently resolved)

- **FINDING-002's severity**: this Explorer Agent's own Severity Matrix defaults to Low for "absence of a security control"; the source PRD (§14 Risks) independently rates the same condition High. Carried into TC-LOGIN-006 as an explicit Risk-field discrepancy for the human reviewer, not resolved by this agent.
- **FR-8's Assumption status**: PRD §13 item 4 flags the row Action icons' semantics as unconfirmed; TC-PIM-011 documents this rather than asserting Edit/Delete as fact.

## Requirement Reference → Test Case ID orphan check

Every test case listed in `OrangeHRM_TestCases_Login.md`/`.xlsx` and `OrangeHRM_TestCases_PIM.md`/`.xlsx` appears in this matrix under its Requirement Reference. No orphan test case exists (25/25 test cases traced).
