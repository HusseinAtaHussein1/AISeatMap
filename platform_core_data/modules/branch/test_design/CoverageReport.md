# Coverage Report — run-002__2026-08-03_10-26-17__UserStory__US-8605CreateBranch

| Field | Value |
|---|---|
| Module | `branch` |
| Produced by run | `run-002__2026-08-03_10-26-17__UserStory__US-8605CreateBranch` |
| Revision | 2 (in place — RISK-BR-2/TC-BR-027 assumption resolved; TC-BR-026 re-isolated from the confirmed cross-field rule) |
| Generated | 2026-08-03 |
| Status | Approved — Test Design closed 2026-08-03 with 31/39 test cases Approved, 8 Rejected (module owner decision — Rejected cases retained in the suite, out of Stage 4 scope) |

## 1. Run Scope

| Field | Value |
|---|---|
| Run Scope Type / Source | User Story / `PRD_UserStories.md` User Story 5 (US 8605), extended by User Story 6 (US 51489) for the Outstanding Threshold field per confirmed traceability |
| Run Type | User Story |
| Project Context | `modules/branch/context/ProjectContext.md` (revision 4, Approved) |

Per the User Story strategy (§16): test design is scoped to US 8605's enumerated acceptance criteria plus the one field (Outstanding Threshold) the module owner confirmed traces to US 51489 §2. No broader wandering into adjacent Branch functionality (e.g. Search Branch, full Booking/Staff/Agency reflection) was undertaken — those remain out of scope per `ProjectContext.md` §3.

## 2. Requirements Covered

| Requirement ID | Summary | Test Case ID(s) |
|---|---|---|
| US5 §Branch Details | Operating Country, Branch Name, Country auto-fill, State/City cascade, Address 1/2, Post Office Box, Phone Number, Service Tax/ABTA Number | TC-BR-001–011 |
| US5 §Branch Email Configuration | Branch Email ID, Email Password | TC-BR-012–015 |
| US5 §Branch Contact Info | Contact Name, Email ID, Phone Number, Add button | TC-BR-016–019 |
| US5 §Branch Sales Configuration | Target/Month/Year + Add Target, Credit Limit, Top-Up Limit, Credit Terms, Reaching Percentage, Warning Prompt, Payment Option | TC-BR-020–028 |
| US5 §Product Access Details | Grid columns, Description rule, GDS sub-grid, PCC removal | TC-BR-029–033 |
| US5 §Buttons & Actions | Submit for Approval, Cancel | TC-BR-034–036 |

**Coverage Percentage: 6/13 in-scope requirement groups = 46%** (computed against Covered only, per §8.3)

| Category | Count |
|---|---|
| Covered | 6 |
| Partially Covered | 1 |
| Out-of-Scope | 5 |
| Unknown / Unassessed | 1 |
| Uncovered | 0 |

**Reading this percentage:** the low headline figure reflects that 5 of the 13 assessed requirement groups were deliberately excluded this run — not missed. Of the 8 groups that were actually in scope for this pass (6 Covered + 1 Partially Covered + 1 Unknown/Unassessed), 7 received substantive test design; only US6 §4 (deferred per explicit user instruction) received none. See §8 for the full accounting.

## 3. Coverage Matrix

| Requirement ID | Test Case ID(s) | Status |
|---|---|---|
| US5 §Branch Details | TC-BR-001–011 | Covered |
| US5 §Branch Details — PAN Number | — | Out-of-Scope |
| US5 §Branch Email Configuration | TC-BR-012–015 | Covered |
| US5 §Branch Contact Info | TC-BR-016–019 | Covered |
| US5 §Branch Contact Info — Department | — | Out-of-Scope |
| US5 §Branch Sales Configuration | TC-BR-020–028 | Covered |
| US5 §Branch Sales Configuration — Payment Gateway | — | Out-of-Scope |
| US5 §Product Access Details | TC-BR-029–033 | Covered |
| US5 §Product Access Details — Flight default | — | Out-of-Scope |
| US5 §Import PNR | — | Out-of-Scope |
| US5 §Buttons & Actions | TC-BR-034–036 | Covered |
| US6 §2 Branch Module | TC-BR-037–039 | Partially Covered |
| US6 §4 Branch Threshold Update | — | Unknown / Unassessed |

## 4. Business Rules

No requirement in `ProjectContext.md` for this module is stated with a `BR-`prefixed ID — Branch's requirements are cited by User Story section (US5/US6), not a formal FR/BR/SR numbering scheme (consistent with how Discovery's own Findings cite them). The following AC items function as business rules and are called out here for auditability:

| Business Rule (cited by AC text) | Rule | Test Case ID(s) | Status |
|---|---|---|---|
| Post Office Box length | Max 8 alphanumeric characters | TC-BR-007, TC-BR-008 | Covered (TC-BR-008 currently fails against observed behavior — regression pending fix) |
| Credit Limit numeric + length | Numeric only, max 15 characters | TC-BR-022, TC-BR-023 | Covered (TC-BR-023 currently fails against observed behavior — regression pending fix) |
| Reaching Percentage cap | Must not exceed 100%, up to 3 decimal places | TC-BR-024, TC-BR-025 | Covered |
| Warning Prompt length + cross-field | Max 11 digits, must not be greater than Credit Terms (Days) | TC-BR-026, TC-BR-027 | Covered (TC-BR-026 re-isolated 2026-08-03 from the now-confirmed cross-field rule — still fails against observed behavior, regression pending fix; TC-BR-027 confirmed enforced via module-owner evidence, not yet formally executed) |
| Add Target gating | Add Target enabled only once Target Amount, Month, Year are all entered | TC-BR-020 | Covered |
| Description enable/mandatory rule | Description enabled and mandatory only once a Supplier row is selected | TC-BR-030, TC-BR-031 | Covered |

## 5. Test Scenarios

**By module:**

| Module | Total | Atomic | Scenario | E2E | Positive | Negative | Exploratory |
|---|---|---|---|---|---|---|---|
| branch | 39 | 36 | 3 | 0 | 22 | 17 | 0 |

**By dimension (§7, §17):**

| Dimension / Negative Subtype | Case Count |
|---|---|
| Positive Scenarios | 22 |
| Negative — Empty Values | 6 (TC-BR-002, 013, 017, 021, 031, 038) |
| Negative — Special Characters | 2 (TC-BR-003, 018) |
| Negative — Invalid Inputs | 3 (TC-BR-010, 022, 027) |
| Negative — Boundary Values | 5 (TC-BR-008, 015, 023, 024, 026) |
| Negative — UI Label | 1 (TC-BR-035) |
| Boundary (positive-tagged) | 3 (TC-BR-007, 014, 025) |
| Regression (Finding-derived) | 4 (TC-BR-008, 023, 026, 035) |
| Assumption-Based | 2 (TC-BR-027, 038) |
| Expected Implementation | 3 (TC-BR-037, 038, 039) |
| Unicode | 0 — Not Applicable this pass. Discovery did not test Unicode input on any Branch field, and no AC states Unicode-specific behavior; recommended as future exploratory coverage (§10) rather than invented here. |
| Security Inputs (SQLi/path traversal/header injection) | 0 — Not Applicable this pass. No field in US 8605/US 51489 is described as security-sensitive beyond standard input validation already covered by Invalid Inputs/Special Characters; a dedicated security probe was not designed to avoid inventing scope beyond the AC. |
| Timeouts | 0 — Not Applicable. This run's environment/tooling has no mechanism to induce a slow/hung backend response; recorded as Not Applicable rather than silently skipped. |
| Permissions | 0 — Not Applicable this pass. `ProjectContext.md` §4 names only Super Admin for this run; no second role/credential is available to design an access-control comparison case against. |
| Configuration | 0 — Not Applicable. No feature-flag/config-toggle is documented in `ProjectContext.md` for Branch creation. |
| Regression Impact (proactive, beyond Finding-derived) | 0 — Not Applicable this pass. A User Story-scoped run per §16 does not proactively assess impact on other, previously-tested requirements outside its own AC; none was identified as plausibly affected. |
| Integration Behaviour | 1 (TC-BR-032 — Supplier-selection-triggers-sub-grid interaction) |

## 6. Manual Test Cases

| Module | Markdown | Excel | Case Count |
|---|---|---|---|
| branch | `test_design/TestCases_Branch.md` | `test_design/TestCases_Branch.xlsx` | 39 |
| **Total** | | | **39** |

## 7. Assumptions

| Assumption ID (Project Context) | Assumption | Test Case ID | Tag |
|---|---|---|---|
| ~~RISK-BR-2 (Warning Prompt < Credit Terms half)~~ | **Resolved 2026-08-03** — confirmed enforced via module-owner-supplied evidence; no longer assumption-based | TC-BR-027 | Removed — see §6/§9 of QA_Assessment_Report.md |
| New (Test Design, 2026-08-03) | Child Agencies Threshold Amount ("Outstanding Threshold") is Mandatory, per the live UI's asterisk — US 51489 §2 does not itself state Mandatory/Optional | TC-BR-038 | AssumptionBased, ExpectedImplementation |

ASM-BR-1 and ASM-BR-2 (unstated validation-message wording; Address 1/2 character-set behavior) are carried forward implicitly across the relevant test cases' Expected Result wording (stated as observable outcomes, not exact message text where unconfirmed) rather than as their own dedicated assumption-tagged cases, since no single case isolates them alone.

## 8. Coverage Gaps

| Gap Type | ID | Reason | Smallest Unblocking Prerequisite |
|---|---|---|---|
| Out-of-Scope | PAN Number (US5 §Branch Details) | Confirmed absent from the live UI; ignored per explicit module-owner direction (FINDING-008) | None — deliberately excluded, not a gap to close |
| Out-of-Scope | Department (US5 §Branch Contact Info) | Confirmed absent from the live UI; ignored per explicit module-owner direction (FINDING-009) | None — deliberately excluded, not a gap to close |
| Out-of-Scope | Payment Gateway conditional dropdown (US5 §Branch Sales Configuration) | Outdated Requirement, confirmed by module owner (FINDING-007) | None — deliberately excluded, not a gap to close |
| Out-of-Scope | Flight backend-only default (US5 §Product Access Details) | Outdated Requirement, confirmed by module owner (FINDING-006) | None — deliberately excluded, not a gap to close |
| Out-of-Scope | Import PNR "always checked" (US5 §Import PNR) | Confirmed intended feature (unchecked default); US 8605's wording is outdated with no replacement requirement stated (FINDING-005) — the current behavior is recorded as an Observation, not converted into a requirement, per explicit instruction | If a replacement requirement is authored describing Import PNR's intended current behavior, Test Design can then design a case against it |
| Unknown / Unassessed | US6 §4 Branch Threshold Update (confirmation-popup flow) | Deferred per explicit user instruction (2026-08-03) — "can remain as future work unless they become required to design or execute a test case." No test case in this suite depends on it. | Run Discovery against the Branch Threshold Update flow (update an existing Branch's threshold with child agencies holding custom values), then re-run Test Design for this item |
| Partially Covered | US6 §2 Branch Module — Mandatory/Optional status | US 51489 §2 does not state whether Child Agencies Threshold Amount is Mandatory or Optional; TC-BR-038 assumes Mandatory per the live UI's asterisk | Confirm with Product/Business whether the field is intended to be Mandatory; update US 51489 §2 or `ProjectContext.md` §6 accordingly |
| Partially Covered | US6 §2 Branch Module — format constraints | US 51489 §2 states no length/decimal/format rule for Child Agencies Threshold Amount, unlike every other numeric field in US 8605 | Confirm with Product/Business the intended format constraints (if any); a boundary test case can then be designed without inventing a rule |
| Partially Covered | US5 §Branch Details — Operating Country→State/City cascade | Not independently verified in Discovery (OQ-BR-1); TC-BR-004/005/006 are designed but unexecuted against live master data | Execute TC-BR-004/005/006 against real Operating Country/State/City master data during Stage 4M/4A — no Stage 1–3 rework needed |
| Partially Covered | US5 §Product Access Details — GDS sub-grid | Blocked during Discovery (Coverage_Summary.md §5) — no GDS-type supplier row was checked; TC-BR-032/033 designed but unexecuted | Execute TC-BR-032/033 against a live GDS-type supplier row during Stage 4M/4A — no Stage 1–3 rework needed |

**Uncovered Requirements: 0. Uncovered Findings: 0** (see Traceability Matrix §3 — all 11 Findings dispositioned).

## 9. Risks

**High / Critical:** none.

**All risks:**

| Risk Level | Count |
|---|---|
| Critical | 0 |
| High | 0 |
| Medium | 3 (TC-BR-008, TC-BR-023, TC-BR-026 — inherited from FINDING-002/003/004) |
| Low | 36 |

## 10. Recommendations

| ID | Recommendation | Rationale |
|---|---|---|
| REC-TD-1 | Confirm with Product/Business whether Child Agencies Threshold Amount is Mandatory or Optional, and its intended format constraints | Closes the two Partially Covered items on US6 §2 (Coverage Gaps §8) without this skill inventing a business rule |
| REC-TD-2 | Author a replacement requirement describing Import PNR's current intended behavior (now a user-controlled toggle, not "always checked") | US 8605's wording is confirmed outdated; without a replacement statement, this behavior can only be recorded as an Observation, never tested as a requirement |
| REC-TD-3 | When ready, run Discovery against US6 §4's Branch Threshold Update confirmation-popup flow, then extend this suite | Explicitly deferred this pass per user instruction; no blocker exists beyond scheduling |
| REC-TD-4 (Exploratory Recommendation, §17) | Consider a scoped exploratory charter for Unicode/emoji input across Address 1/2, Branch Email ID, and Contact Name, rather than a fixed pass/fail case | US 8605 states "free text, all character input" for several fields with no stated rejection behavior — genuinely ambiguous what "pass" means for non-ASCII input without inventing a rule |

## 11. Automation Status

*(Section renamed from "Automation Candidates" per the current Test Design skill specification, 2026-08-01 revision — the advisory candidate list is retired in favor of the binding `Automation` column on each test case.)*

Every test case in this suite carries `Automation: Pending` — no automation decision has been made for any of the 39 cases yet, since none has completed human Review.

| Automation Value | Count |
|---|---|
| Pending | 39 |
| Approved | 0 |
| Rejected | 0 |

No case is in scope for Stage `4A` yet: automation requires `Review = Approved AND Automation = Approved` (test-design-skill §6.3.2), and every case here is still `Review: Pending`.

## 12. Inputs for Both Branches

| Required Input | Present? | Location / Note |
|---|---|---|
| Project Context (Governing) | Yes | `modules/branch/context/ProjectContext.md` (revision 4, Approved) — unchanged pass-through |
| Manual Test Suite (Primary) | Yes | `test_design/TestCases_Branch.md` + `.xlsx` (generated after export, see below) |
| Requirement Traceability Matrix (Secondary) | Yes | `test_design/TraceabilityMatrix.md` — every case carries Requirement/Discovery/Finding/Evidence/Acceptance Criteria/Run Scope References |
| Coverage Report (Secondary) | Yes | This file |
| Discovery Artifacts (Secondary, for Stage 4A selector detail) | Yes | `discovery/DiscoverySnapshot_CreateBranch.md`, `discovery/Coverage_Summary.md`, `discovery/QA_Assessment_Report.md` — all Approved |
| Findings (Secondary) | Yes | `discovery/findings/Findings_Summary.md` + individual `metadata.md` files — all 11 dispositioned (§3 of Traceability Matrix) |
| Evidence Packages (Secondary) | Yes | Cited specifically per Finding-derived test case (TC-BR-008, 023, 026, 035, 037–039) — never the Finding as a whole |

**Handoff confirmation:** Every input both `manual-execution-skill` §4 and `automation-skill` §4 declare as needed is present and specific. No Discovery/Finding/Evidence Reference in the Traceability Matrix is a bare "see Discovery" — each cites a specific file and, where applicable, a specific section or evidence file. The Excel workbook (`TestCases_Branch.xlsx`) must still be generated via `platform_core/tools/test_suite_export/cli.js` before this handoff is fully satisfied per §9.1 — recorded as the one remaining mechanical step, not a content gap.
