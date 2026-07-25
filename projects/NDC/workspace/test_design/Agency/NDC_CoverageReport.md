# NDC — Coverage Report — Admin / Agency (Create · Search · Update · Actions)

> **Approved** 2026-07-18 (user) — copied here from `runs/RUN-20260718-001/test_design/` as the current latest-approved state, per `workspace/test_design/README.md`. **Note added 2026-07-25:** `TestCases_Agency.md` was rewritten to the Canonical Test Case Writing Standard (lean, execution-focused fields) — Risk moved to `TraceabilityMatrix.md`'s new Test Case Reference appendix, and Test Type/Category/Automation-Candidate-hint moved to each test case's Tags field. Content/scope below is unchanged; only the source fields' location shifted.

**Run:** RUN-20260718-001 · Structured per `agents/test_design_agent.md` §18 Standard Output Contract.

## 1. Run Scope

- **Run Scope Type:** User Story · **Source:** Pasted text — four jointly-scoped User Stories: Create Agency, Search Agency, Agency Actions, Update Agency.
- **Run Type:** User Story.
- **Project Context designed against:** `context/ProjectContext_Agency.md` — a single living document, not a version sequence (per explicit user instruction 2026-07-18); status `Pending` at time of this Test Design pass.
- **Test Design Strategy applied:** User Story strategy per `agents/test_design_agent.md` §16 — narrowest breadth, one test case per enumerated acceptance criterion. Update Agency's field-level validation is cited from Create Agency's own test cases (Regression Impact dimension, §17) rather than re-derived; this suite does not wander into WT1-T2919's E-Ticket Branding scope (Track B, separate document).

## 2. Requirements Covered

84 of 96 in-scope Requirement IDs (`ProjectContext_Agency.md` §2) are **Covered** (§8.1) — at least one test case's Requirement Reference cites them with no open ambiguity. See `TraceabilityMatrix.md` for the full per-requirement list.

## 3. Coverage Matrix

See `TraceabilityMatrix.md` for the full Requirement ID × Test Case ID cross-reference, organized by section (Create Agency §2.1, Search Agency §2.2, Agency Actions §2.3/§2.4, Update Agency §2.5).

## 4. Business Rules

| Requirement ID | Test Case(s) | Note |
|---|---|---|
| BR-AGCRT-01 (Branch CRUD dependency) | TC-AGENCY-CREATE-001, -008, -019, -029, -031 | Precondition/inheritance source (Country, Sales Contact defaults, Product Access). |
| BR-AGCRT-02 (Supplier CRUD dependency) | TC-AGENCY-CREATE-001, -031 | Precondition/inheritance source for Airline Supplier Credential PCC defaults. |
| BR-AGCRT-03 (Payment Method dependency) | TC-AGENCY-CREATE-001, -027 | Payment Options list's data source; enrichment only from `knowledge_base` APP-002. |
| BR-AGSEARCH-01 (Add Agency Page dependency) | TC-AGENCY-SEARCH-008 | Search's "Add" button destination. |
| BR-AGSEARCH-02 (Region Module dependency) | TC-AGENCY-SEARCH-003 | State/City data source, not independently tested. |
| BR-AGACTION-01 (Create Agency dependency) | TC-AGENCY-ACTIONS-001 through -009 | A record must exist to act on. |
| BR-AGACTION-02 (Update Agency dependency) | TC-AGENCY-ACTIONS-001 | Pen icon's destination. |

## 5. Test Scenarios

66 test cases designed (39 Create Agency + 10 Search Agency + 10 Agency Actions + 7 Update Agency), plus one retired pointer (`TC-AGENCY-CREATE-037`, superseded) and one cross-reference pointer (`TC-AGENCY-SEARCH-010`, to the still-valid prior-run `TC-AGENCY-003`).

By module: **Create Agency** — see this Coverage Report's original per-section breakdown (Agency Master, Owner, Documents, Logo, Sales Contact, Bank, Payment, Product Access, PCC, Import PNR, Submission Workflow, Security/Unicode). **Search Agency** (10: TC-AGENCY-SEARCH-001 through -010) — field validation, result display, No Results Found, Add navigation, combined-filter AND semantics, List-auto-load cross-reference. **Agency Actions** (10: TC-AGENCY-ACTIONS-001 through -010) — pen icon navigation, Approve/Reject visibility and remark-mandatory enforcement, Status Reflection (individual and consolidated matrix), FINDING-004 regression guard, role-terminology exploratory charter. **Update Agency** (7: TC-AGENCY-UPDATE-001 through -007) — pre-population, edit-and-resubmit re-entering approval, Cancel, a Create-validation spot-check, Approve/Reject of an edited record, post-Reject data-state exploratory charter.

**Negative Test Generation Engine (§7) accounting:** Invalid Inputs, Boundary Values, Empty Values, Unicode, and Special Characters categories are each represented. **Timeouts** remains Not Applicable across the entire suite (Stage 5 environment control unavailable to Test Design).

**Required Dimensions (§17) accounting:** Positive Scenarios, Boundary Testing, Validation Rules, Business Rules, Error Handling, Permissions (now partially exercised — see §9's role-terminology risk, distinct from the "N/A" verdict in the original Create-Agency-only pass), Configuration (N/A, unchanged), Regression Impact (Update Agency's whole approach to Create's field validation *is* this dimension — cited, not re-derived; also FINDING-004's regression guard, TC-AGENCY-ACTIONS-008), Integration Behaviour (Agency Actions ↔ Update Agency ↔ Create Agency's shared approval-workflow loop, TC-AGENCY-UPDATE-002/005/006), Risk-based Prioritization, and Exploratory Recommendations (§10) are all evaluated.

## 6. Manual Test Cases

Full test case content: `test_design/TestCases_Agency.md` (Markdown) and `test_design/TestCases_Agency.xlsx` (Excel) — identical underlying data. Every test case's **Tags** field carries its Test Type (Smoke/Regression) and, where flagged Yes, an `AutomationCandidate` tag (advisory); Partial/No dispositions and reasons are listed in §11 below and in the Traceability Matrix appendix, not on the test case itself.

## 7. Assumptions

| Project Context §6 item | Test Case(s) tagging it |
|---|---|
| #1 Search Agency Status field type inconsistency (Radio Button vs. Drop Down wording) | TC-AGENCY-SEARCH-004 |
| #2 Approve/Reject actor terminology ("Admin" vs. "authorized users/supervisors") | TC-AGENCY-ACTIONS-010 |
| #3 Update Agency's field validation assumed identical to Create's | TC-AGENCY-UPDATE-004 (spot-check, cites Create's own cases) |
| #4 Search/Actions/Update never independently discovered; FINDING-004 relevance | TC-AGENCY-ACTIONS-001, -008 |
| #5 "No Results Found" exact wording unconfirmed | TC-AGENCY-SEARCH-005 |
| #6 Phone country-code — Resolved | TC-AGENCY-CREATE-007 |
| #7 Approve/Reject location — Resolved | TC-AGENCY-ACTIONS-003 through -008 (superseding TC-AGENCY-CREATE-037) |

Plus every Create-Agency-only assumption already tagged in the original pass (Product Access/PCC/Bank never discovered, numeric boundaries unstated, Agency Name special-characters reading, Arabic-script re-verification) — unchanged, not repeated here.

## 8. Coverage Gaps

**Uncovered Requirements:** 0 — every Requirement ID in `ProjectContext_Agency.md` §2 has at least one citing test case.

**Partially Covered Requirements (12):**

| Requirement ID | Reason |
|---|---|
| FR-AGCRT-MASTER-11 (Address 2) | Only Security/Unicode probes exist; no dedicated positive/optional-blank case. |
| FR-AGCRT-BANK-02 (Account Type) | Partial-entry validation behavior unstated (Exploratory). |
| FR-AGCRT-PAY-08 (Reaching Percentage) | No stated numeric boundary. |
| FR-AGCRT-PNR-01 (Import PNR toggle) | Admin-side covered; Portal-side effect out of scope. |
| FR-AGCRT-SUBMIT-02 (Save as Draft) | Draft's own minimum-field floor unstated. |
| FR-AGSEARCH-05 (Search Status field) | Control-type ambiguity (Radio Button vs. Drop Down wording) — Project Context §6 #1. |
| FR-AGSEARCH-07 (No Results Found) | Exact message wording unconfirmed — Project Context §6 #5. |
| FR-AGACTION-06 (Submit → Inactive/Pending) | Depends on whether FINDING-007's Pending-exclusion-from-Search still holds — needs re-verification. |
| FR-AGUPDATE-05 (Approve, authorized users) | Role-terminology discrepancy — Project Context §6 #2. |
| FR-AGUPDATE-06 (Reject, authorized users) | Same role discrepancy, plus post-Reject data-retention behavior unstated. |

(Two more from the original Create Agency pass carried unchanged: none remaining after the phone-format resolution — the count above already reflects that; 10 listed + the phone-related items already resolved out.)

**Out-of-Scope Requirements:** WT1-T2919 (Track B) entirely; Branch/Staff CRUD (v3); Login (v2); Credential Routes Filter et al. (v1); Reflection-named modules (Rule Engine, Search & Booking, NDC Portal, Reports, Import PNR portal display, Region Module CRUD).

**Granularity note (added 2026-07-25, `.claude/skills/test-design-agent/SKILL.md` §6.0.1):** this suite is 63 Atomic + 3 Scenario (`CREATE-001`, `UPDATE-002`, `ACTIONS-009`) + **0 End-to-End**. The one journey that would qualify as E2E — "Agency Creation → Approval → Availability for Booking" — crosses into the Search & Booking module, already Out-of-Scope above. Not a gap in this suite's own execution, but a real gap in end-to-end coverage of the Agency lifecycle's actual business purpose; worth a dedicated E2E run once Search & Booking is in scope.

**Unknown/Unassessed Requirements:** none.

**Coverage Percentage:** 84/96 = **87.5%** (Covered only; the 12 Partially Covered items above are reported separately).

## 9. Risks

- **High:** ~~Approve/Reject location unresolved~~ — **Resolved 2026-07-18** by the Agency Actions User Story; superseded `TC-AGENCY-CREATE-037` with `TC-AGENCY-ACTIONS-003` through `-008`.
- **High:** FINDING-007 (Pending Agencies excluded from Search) may still apply now that Agency Actions formally requires Pending agencies to be actionable from the grid — if a Pending Agency genuinely cannot be found via Search, Approve/Reject may be unreachable in practice. `TC-AGENCY-ACTIONS-007` re-examines this directly; treat as an open risk until re-verified live.
- **High:** Role-terminology discrepancy (Admin vs. "authorized users/supervisors") for Approve/Reject — if a distinct role is actually enforced and no such credential exists in this project's setup, every Approve/Reject test case may need re-scoping.
- **High:** FINDING-004's Actions-column near-miss (Branch) — now directly relevant to Agency's own Actions column (pen icon + Approve/Reject in close proximity); `TC-AGENCY-ACTIONS-008` is a direct regression guard, not yet executed live.
- **High:** Payment Settings and Airline Supplier Credential PCC Mandatory-field enforcement — financial/ticketing-critical, unchanged from the original assessment.
- **Medium:** Search Agency, Agency Actions, and Update Agency have never been independently observed in Discovery at all — every new test case in this pass is AC-only.
- **Medium:** Post-Reject data-retention behavior (does a rejected edit silently apply or revert?) is unstated — `TC-AGENCY-UPDATE-007`.
- **Low:** Search Agency's Status control-type and "No Results Found" wording ambiguities.

## 10. Recommendations

1. **Re-verify FINDING-007 against the Agency Actions requirement** — since Pending agencies must now be actionable (Approve/Reject) from the grid, confirm whether they're actually reachable via Search at all; if FINDING-007 still holds, this is a functional blocker for the entire Approve/Reject workflow, not just a Search-usability concern.
2. **Clarify the Approve/Reject actor/role** — confirm whether "authorized users, e.g., supervisors" (Update Agency) is the same Admin credential already available or a distinct role this project hasn't set up yet.
3. **Run Discovery (Stage 2) against Search Agency, Agency Actions, and Update Agency** — none of the three have ever been observed live; this would resolve the FINDING-007 re-verification (Recommendation 1) and surface any AC/observed-behavior gaps before Stage 4.
4. **Confirm post-Reject data-retention behavior** for Update Agency (`TC-AGENCY-UPDATE-007`) — does a rejected edit silently apply, or does the record revert to its pre-edit values?
5. Carry forward every Recommendation already open from the Create-Agency-only pass (Bank/Product Access/PCC Discovery, "special characters allowed" reading, boundary-value exploratory items) — unchanged.

## 11. Automation Candidates

Advisory only — the binding Automation Decision remains the Automation Agent's authority.

- **Yes:** 29 Create Agency cases (unchanged) + 8 Search Agency (TC-001,002,003,006,007,008,009 — TC-004 partial) + 8 Agency Actions (TC-001 through 004, 006, 008, 009 — TC-005 same as 003's pattern, counted Yes) + 5 Update Agency (TC-001,002,003,004,005,006) ≈ **52 of 66** total.
- **Partially:** TC-002 (Create, matrix scale), TC-014/034/039 (Create), TC-AGENCY-SEARCH-004 (Status control ambiguity), TC-AGENCY-SEARCH-005 (message wording), TC-AGENCY-ACTIONS-007 (pending FINDING-007 re-verification) ≈ **7**.
- **No — Exploratory/Manual Only:** TC-004/024/026 (Create), TC-AGENCY-SEARCH-010 (pointer only), TC-AGENCY-ACTIONS-010 (role clarification), TC-AGENCY-UPDATE-007 (post-Reject data state), plus the retired TC-AGENCY-CREATE-037 pointer ≈ **7**.

## 12. Inputs for Automation Agent

| Automation Agent needs | Status |
|---|---|
| Project Context (Governing) | `context/ProjectContext_Agency.md` — present, `Pending` review |
| Manual Test Suite (Primary) | `test_design/TestCases_Agency.md` + `.xlsx` — present, 66 active test cases (+1 retired pointer) |
| Requirement Traceability Matrix (Primary) | `test_design/TraceabilityMatrix.md` — present, updated for all four User Stories |
| Coverage Report (Secondary) | This document |
| Discovery Artifacts (Secondary) | Partial for Create Agency; **none** for Search Agency/Agency Actions/Update Agency — a real gap, per Recommendation 3 |
| Findings (Secondary) | FINDING-002 (resolved), FINDING-004 (regression-guarded, TC-AGENCY-ACTIONS-008), FINDING-006 (resolved), FINDING-007 (re-examined, not yet re-confirmed) |
| Evidence Packages (Secondary) | Cited by specific file wherever a Finding Reference is populated |

**Handoff completeness: satisfied, with four flagged open risks** (FINDING-007 re-verification, role-terminology discrepancy, never-discovered new screens, post-Reject data state) that Stage 4/5 should treat as known risks, not silently-resolved assumptions.
