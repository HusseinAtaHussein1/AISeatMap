# NDC — Coverage Report — E-Ticket Agency Branding (WT1-T2919)

> **Approved** 2026-07-18 (user) — copied here from `runs/RUN-20260718-001/test_design/` as the current latest-approved state, per `workspace/test_design/README.md`.

**Run:** RUN-20260718-001 · Structured per `agents/test_design_agent.md` §18 Standard Output Contract.

## 1. Run Scope

- **Run Scope Type:** User Story · **Source:** Pasted text — WT1-T2919 "E-Ticket Template Modification – Agency Branding On/Off Feature."
- **Run Type:** User Story.
- **Project Context designed against:** `context/NDC_ProjectContext_ETicketBranding.md` ("Track B" — a separate document from `NDC_ProjectContext_Agency.md`, per the user-confirmed track split 2026-07-18), status `Pending`.
- **Test Design Strategy applied:** User Story strategy — narrowest breadth, one test case per enumerated acceptance criterion. Several genuine AC ambiguities (§7) meant designing both a literal-reading case and, where a contrast/inverse behavior was only inferred rather than stated, a separate inferred-continuity case — flagged as such, not silently merged with the directly-stated one.

## 2. Requirements Covered

12 of 19 in-scope Requirement IDs are **Covered**. See `NDC_TraceabilityMatrix_ETicketBranding.md` for the full list.

## 3. Coverage Matrix

See `NDC_TraceabilityMatrix_ETicketBranding.md`.

## 4. Business Rules

| Requirement ID | Test Case(s) | Note |
|---|---|---|
| BR-ETB-01 (Agency CRUD dependency) | TC-ETB-001, -002 | Agency Type must be configurable on Agency CRUD before any downstream rendering rule can be exercised. |

## 5. Test Scenarios

24 test cases designed.

| Dimension | Count |
|---|---|
| Positive | 14 (incl. 6 "inferred contrast" B2B cases: TC-ETB-005, -008, -012, -015, -019, -023) |
| Negative — regression guard | 1 (TC-ETB-021, already-issued tickets unimpacted) |
| Exploratory | 5 (TC-ETB-004, -009 partial, -013 blocked, -020 partial, -022) |
| Integration Behaviour | 1 (TC-ETB-024) |

By area: Agency Type Configuration (4: TC-001 through 004), E-Ticket Page (11: TC-005 through 015), Booking Confirmation Page (4: TC-016 through 019), Edge Cases (2: TC-020, 021), Design Notes/Integration (3: TC-022 through 024).

**Negative Test Generation Engine (§7) accounting:** this feature has no free-text/numeric user-input fields of its own (Agency Type is a two-value radio button already covered by Positive/Exploratory design) — Invalid Inputs, Boundary Values, Unicode, Special Characters, and Security Inputs are **Not Applicable** for this User Story's own new surface (they remain applicable to Agency CRUD's *other* fields, already covered in `NDC_TestCases_Agency.md`). Empty Values is applicable and covered (TC-ETB-004, Agency Type left unselected). Timeouts is Not Applicable (Stage 5 environment control unavailable to Test Design).

**Required Dimensions (§17) accounting:** Positive Scenarios, Validation Rules (partial — Mandatory/Optional status itself unstated), Business Rules, Permissions (N/A — no new role introduced), Configuration (this entire feature *is* a configuration-driven rendering toggle — Agency Type as the config, TC-ETB-001 through 024 collectively cover it), Regression Impact (TC-ETB-021's already-issued-tickets guard), Integration Behaviour (TC-ETB-024), Risk-based Prioritization, and Exploratory Recommendations (§10) are all evaluated. Boundary Testing and Error Handling are largely Not Applicable — this feature has no numeric/format fields or user-facing error messages of its own.

## 6. Manual Test Cases

Full test case content: `test_design/NDC_TestCases_ETicketBranding.md` (Markdown) and `.xlsx` (Excel) — identical underlying data.

## 7. Assumptions

| Project Context §6 item | Test Case(s) tagging it |
|---|---|
| #1 Agency Type Mandatory/Optional unstated | TC-ETB-004 |
| #2 Title/Subtitle/ordering scope (Freelance-only vs. all) unstated | TC-ETB-009 |
| #3 B2B's continuation of existing behavior is inferred, not directly stated | TC-ETB-005, -008, -012, -015, -019, -023 (each explicitly marked "inferred contrast") |
| #4 No end-user credential available to test the full config→view loop | Not directly tagged on any single test case — all test cases in this suite assume Admin-session reachability of the E-Ticket/Booking Confirmation screens; flagged here as a standing Coverage Gap (§8) |
| #5 Background image asset not yet supplied | TC-ETB-013 (blocked) |
| #6 No prior Discovery for this module at all | Every test case's Discovery Reference states this explicitly |

## 8. Coverage Gaps

**Uncovered Requirements:** 0 — every Requirement ID has at least one citing test case.

**Partially Covered Requirements (7):**

| Requirement ID | Reason |
|---|---|
| FR-ETB-AGTYPE-01 | Mandatory/Optional status unstated by the AC. |
| FR-ETB-ETICKET-04/05/06 | Freelance-only vs. all-tickets scope for Title/Subtitle/ordering is genuinely ambiguous. |
| FR-ETB-ETICKET-09 | Blocked — background image asset not yet supplied by the business. |
| FR-ETB-EDGE-01 | Depends on TC-ETB-004 first confirming an Agency-Type-unset state is actually reachable. |
| FR-ETB-DESIGN-01 | Visual-consistency check (TC-ETB-022) is a judgment call, not a fixed assertion. |

**Out-of-Scope Requirements:** Agency CRUD's own existing field-level validation (governed by `NDC_ProjectContext_Agency.md`); any Booking Module screen other than E-Ticket/Booking Confirmation; Rule Engine Module (not named by this User Story).

**Unknown/Unassessed Requirements:** none.

**Coverage Percentage:** 12/19 = **63.2%** (Covered only; the 7 Partially Covered items above are reported separately). This is meaningfully lower than the Agency CRUD suite's 87.5% — an honest reflection of this User Story containing more genuine scope ambiguity (three separate unresolved AC-reading questions) and one hard external blocker (the image asset), not a quality gap in this Test Design pass itself.

## 9. Risks

- **High:** Title/Subtitle/flight-details-ordering scope ambiguity (FR-ETB-ETICKET-04/05/06) — if this actually applies to all tickets (not just Freelance) and is implemented as Freelance-only, every B2B ticket would be missing an intended UI change; the reverse is equally possible.
- **High:** No prior Discovery exists for the E-Ticket or Booking Confirmation Page at all — every test case here is AC-only, with a correspondingly higher chance the live screens don't work exactly as assumed (e.g., what "the agency details section" or "the section" for Booking Confirmation actually refers to structurally).
- **Medium:** End-user credential gap (Project Context §6 #4) — if the E-Ticket/Booking Confirmation Page cannot actually be reached from the Admin session (e.g., requires a genuine customer-facing booking flow), most of this suite's Preconditions are not achievable as written.
- **Medium:** FR-ETB-AGTYPE-01's Mandatory/Optional ambiguity directly gates FR-ETB-EDGE-01 (the "not configured" edge case) — if Agency Type turns out to be Mandatory with a forced default, the "not configured" state may never actually be reachable, making TC-ETB-020 unexecutable as designed.
- **Low:** Background image replacement is blocked on an external asset delivery, not a testing or requirements gap.

## 10. Recommendations

1. **Confirm the Title/Subtitle/flight-details-ordering scope** (Freelance-only vs. all tickets) before Stage 4 — this is the single highest-value clarification in this suite, affecting potentially every B2B ticket.
2. **Run Discovery (Stage 2) against the E-Ticket Page and Booking Confirmation Page** — neither has ever been observed; this would resolve several ambiguities directly (actual screen structure, whether Admin session can reach these pages, current pre-feature appearance for the "inferred contrast" B2B cases).
3. **Obtain the replacement background image asset** to unblock TC-ETB-013.
4. **Confirm whether Agency Type is Mandatory or Optional**, and if Optional, confirm the "not configured" state is genuinely reachable (needed to execute TC-ETB-020 as designed).
5. **Confirm an end-user credential/session path** for reaching issued E-Tickets, if the Admin session cannot reach them directly (Project Context §6 #4).

## 11. Automation Candidates

- **Yes:** 16 of 24 (TC-ETB-001, -002, -003, -005 through -008, -010 through -012, -014 through -019, -023, -024).
- **Partially:** 2 — TC-ETB-009 (Freelance side yes, B2B side blocked on scope clarification), TC-ETB-020 (depends on TC-ETB-004).
- **No — Exploratory/Manual Only/Blocked:** 6 — TC-ETB-004 (Mandatory/Optional ambiguity), TC-ETB-013 (blocked, no asset), TC-ETB-022 (visual judgment call).

## 12. Inputs for Automation Agent

| Automation Agent needs | Status |
|---|---|
| Project Context (Governing) | `context/NDC_ProjectContext_ETicketBranding.md` — present, `Pending` review |
| Manual Test Suite (Primary) | `test_design/NDC_TestCases_ETicketBranding.md` + `.xlsx` — present, 24 test cases |
| Requirement Traceability Matrix (Primary) | `test_design/NDC_TraceabilityMatrix_ETicketBranding.md` — present |
| Coverage Report (Secondary) | This document |
| Discovery Artifacts (Secondary) | **None exist** — every Discovery Reference in this suite says so explicitly; a real, standing gap per Recommendation 2 |
| Findings (Secondary) | None raised yet — no Discovery has run |
| Evidence Packages (Secondary) | N/A — no Findings yet |

**Handoff completeness: satisfied with five flagged open risks/blockers** (scope ambiguity, no Discovery at all, end-user credential gap, Mandatory/Optional ambiguity, missing image asset) — this suite is markedly less "automation-ready" than the Agency CRUD suite and should not be treated as equally mature at Stage 4.
