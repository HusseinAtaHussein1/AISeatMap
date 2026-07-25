# NDC — Coverage Report — RUN-20260712-002 (Admin: Branch, Agency, Staff)

> **Agency rows below are superseded (2026-07-18).** Per explicit user instruction, the Agency test cases in this document (TC-AGENCY-001–005) are no longer relied upon — `test_design/Agency/CoverageReport.md` (66 test cases, User-Story-backed, RUN-20260718-001) is now the sole authoritative Agency coverage document. **Branch and Staff rows below remain fully authoritative, unchanged.**

**Status:** Pending Review (Branch/Staff portions) · Produced by Test Design Agent v3, per the Standard Output Contract (`agents/test_design_agent.md` §18).

## 1. Run Scope

Type = Feature · Source = Custom scope description · **Observation-based Spike** — see `ProjectContext_BranchAgencyStaff.md`. Scope: Admin → Branch, Agency, Staff (List + Add; Edit deferred — see Coverage Gaps). Designed against Project Context v3 and Discovery Artifacts from RUN-20260712-002 (both currently `Pending` — per Execution Rule 4 this would normally block Stage 3, but per `pipeline/pipeline.md` §5.3 Rule 5 this run's Spike/exploratory nature authorizes Stages 1–4 to be reviewed together in one batch, the same deviation used for RUN-20260712-001).

## 2. Requirements Covered

3/3 in-scope module requirements covered (OBS-BRANCH-CRUD, OBS-AGENCY-CRUD, OBS-STAFF-CRUD) for List+Add; Edit is Partially Covered for all three (see Coverage Matrix). Of the 5 carried-forward Open Questions (Project Context v3 §6), 2 are covered by designed test cases (Q1, Q4), 1 is partially confirmed via Discovery observation alone (Q5), and 2 are explicitly deferred (Q2, Q3).

## 3. Coverage Matrix

| Item | Category | Test Case(s) |
|---|---|---|
| Branch — Add (happy path + validation + boundary + security) | Covered | TC-BRANCH-001–004 |
| Branch — List (auto-load) | Covered | TC-BRANCH-005 |
| Branch — Edit | Partially Covered — blocked by FINDING-004, exploratory charter designed instead of a fixed case | TC-BRANCH-006, TC-BRANCH-007 |
| Agency — Add/List/Edit (superseded) | **See `test_design/Agency/CoverageReport.md` instead** — TC-AGENCY-001/002/004/005 superseded by the `TC-AGENCY-CREATE-*` suite; TC-AGENCY-003/006 (List/Search) still valid but now cross-referenced from the new Agency suite rather than tracked here | — |
| Staff — Add (happy path + validation + uniqueness) | Covered | TC-STAFF-001, 002, 003, 005 |
| Staff — List (record existence) | Unknown/Unassessed — inconclusive per FINDING-005 | TC-STAFF-004 (exploratory) |
| Staff — Edit | Unknown/Unassessed — no record was ever located to edit | — |
| OBS-Q2 (delete/referential integrity) | Out-of-Scope this run — deliberately deferred, not attempted | — |
| OBS-Q3 (role-boundary access) | Out-of-Scope this run — credential unavailable/unconfirmed | — |

## 4. Business Rules

No `BR-`prefixed requirements exist for this scope — no PRD backs this module, so no formally documented business rule set exists to trace against (unlike a PRD-backed run). The closest analogues — the approval-workflow requirement (FINDING-002) and Username uniqueness (TC-STAFF-003) — are tracked as Requirement Gap / Open-Question-derived test cases instead, per the Observation-based Spike pattern.

## 5. Test Scenarios

17 test cases total: 7 Branch, 5 Agency, 5 Staff. By dimension: 6 Positive, 3 Negative–Empty Values, 1 Negative–Boundary Values, 1 Negative–Security Inputs, 1 Negative–Unicode, 1 Business Rules (uniqueness), 1 Validation Rules, 3 Exploratory (Finding-derived). Negative Test Generation categories not represented this run — Special Characters, Timeouts — are recorded as "Not Applicable — {reason}" below (§8).

## 6. Manual Test Cases (by reference)

TC-BRANCH-001–007 (`TestCases_Branch.md`/`.xlsx`), TC-AGENCY-001–005 (`TestCases_Agency.md`/`.xlsx`), TC-STAFF-001–005 (`TestCases_Staff.md`/`.xlsx`).

## 7. Assumptions

- TC-BRANCH-002/003/004, TC-AGENCY-002/005, TC-STAFF-002/003 are assumption-based — Discovery this run captured field structure only and did not submit any Add form, so live validation/boundary/uniqueness/Unicode-handling behavior is inferred, not directly observed. Flagged individually on each test case per §3's requirement.
- TC-STAFF-001's Expected Result assumes the Staff List issue (FINDING-005) doesn't prevent verifying the created record's Pending status — if the List truly cannot show any Staff record, this assertion may need to shift to a different verification method (e.g., a direct detail-view lookup) at execution time.

## 8. Coverage Gaps

| Gap | Reason | Disposition |
|---|---|---|
| Branch/Agency/Staff Edit screens (field-level detail) | Blocked (Branch — FINDING-004 near-miss) / not attempted (Agency, Staff) | Test Gap — recommend Stage 4/5 resolve TC-BRANCH-006's exploratory charter first, then a small follow-up Discovery pass to capture all three Edit forms' field sets |
| OBS-Q2 — parent-child delete/referential integrity | Deliberately deferred by Discovery, given the Actions-column risk this run surfaced | Deferred — recommend a dedicated, carefully-scoped follow-up run once Edit/Delete selectors are verified safe |
| OBS-Q3 — Agency/Agent role-boundary access | Agency credential unconfirmed, Agent credential unavailable (`run_configuration.md`) | Deferred — recommend once credentials are confirmed available |
| Special Characters (Negative category, §7) | Not designed — no field-level HTML/markup-injection-shaped probe was scoped this run, distinct from the SQL-injection-style probe already covered (TC-BRANCH-004) | Not Applicable this run — recommend adding to a future hardening pass, not silently dropped |
| Timeouts (Negative category, §7) | This platform's Discovery/Test Design cannot induce a live timeout condition without dedicated tooling (e.g., network throttling) not available this run | Not Applicable — {reason as stated} |
| Configuration (Required Dimension, §17) | No feature-flag/config-toggle affecting Branch/Agency/Staff behavior was documented anywhere this run | Not Applicable — {reason as stated} |
| Permissions (Required Dimension, §17), beyond OBS-Q3 | Same credential-availability constraint as OBS-Q3 | Not Applicable this run — see OBS-Q3 gap above |
| Integration Behaviour (Required Dimension, §17) — Branch↔Agency↔Staff parent-child composition | Overlaps with OBS-Q2 (deferred) — no delete/cascade probing was attempted | Deferred — same disposition as OBS-Q2 |
| Payment Option / Supplier-routing dynamic checkbox blocks (Branch/Agency Add forms) | Not itemized individually — Master-data-driven, dozens of dynamically-named options; testing every one individually is out of this Spike's granularity | Out-of-Scope this run — recommend a "select at least one" / "select none" validation-boundary case if this area is prioritized in a future run |

## 9. Risks

- **High** — TC-BRANCH-006/007 (Actions-column ambiguity, FINDING-004): automating Branch's Edit/Reject flow before resolving this exploratory charter risks a real shared-environment record being rejected/deactivated by mistake, exactly as this run's Discovery nearly did.
- **High** — TC-BRANCH-001/TC-AGENCY-001/TC-STAFF-001 (FINDING-002): any automation assuming immediate Active status post-Add will produce false failures; must assert Pending/Approval-queue state instead.
- **Medium** — All assumption-based test cases (§7): automating a hard assertion against unverified behavior risks a false pass or false fail if actual behavior differs once observed.
- **Low** — FINDING-003/FINDING-005 (List-screen inconsistencies): mostly a UX/coverage-confidence concern, not a defect risk to automation correctness once each screen's actual behavior is coded for individually rather than assumed uniform.

## 10. Recommendations

- Resolve TC-BRANCH-006 (Actions-column selector charter) before Stage 4 generates any Edit/Reject automation for Branch (and, by extension, Agency, which shares the same visual pattern).
- Re-run TC-STAFF-004's manual check (or ask the environment owner) before Stage 4 commits to automating any Staff List assertion.
- Consider a small, tightly-scoped follow-up Discovery pass focused solely on Branch/Agency/Staff **Edit** screens, now that Actions-column risk is understood and can be avoided deliberately.

## 11. Automation Candidates (advisory only — not a binding Automation Decision)

| Test Case | Candidate Disposition |
|---|---|
| TC-BRANCH-001, TC-AGENCY-001, TC-STAFF-001 | Strong candidates — Generate (core create-flow assertions, clearly observed structure) |
| TC-BRANCH-002/003/004, TC-AGENCY-002/005, TC-STAFF-002/003 | Candidates — Generate, but carry the assumption-based label into the generated test's documentation, per the Login run's precedent |
| TC-BRANCH-005 | Strong candidate — Generate (simple, directly observed) |
| TC-BRANCH-006 | **Not a Generate candidate** — this is an exploratory/manual charter; Automation should treat its outcome as a prerequisite, not attempt to automate the charter itself |
| TC-BRANCH-007 | Candidate — Generate, but only after TC-BRANCH-006's charter confirms the safe selector |
| TC-AGENCY-003, TC-STAFF-004 | **Not Generate candidates** — both are exploratory/human-judgment charters |
| TC-AGENCY-004 | Candidate — Generate, assumption-based label |

## 12. Inputs for Automation Agent

- Manual Test Suite: `TestCases_Branch.md`/`.xlsx`, `TestCases_Agency.md`/`.xlsx`, `TestCases_Staff.md`/`.xlsx` (this folder)
- Traceability Matrix: `TraceabilityMatrix.md` (this folder)
- Coverage Report: this document
- Discovery Artifacts: `../discovery/Branch_List.md`, `Branch_Add.md`, `Agency_List.md`, `Agency_Add.md`, `Staff_List.md`, `Staff_Add.md`, `Timeline.md`, `Coverage_Summary.md`, `QA_Assessment_Report.md`
- Findings: `../discovery/findings/Findings_Summary.md` and all 5 `FINDING-*/metadata.md`
- Project Context: `../context/ProjectContext_BranchAgencyStaff.md` (or `platform_core_data/workspace/context/ProjectContext_BranchAgencyStaff.md`)
- Automation Package options (per the platform's multi-package model, `agents/automation_agent.md` §31): the SHAFT-structure spec at `platform_core_data/automation_framework.md`, and/or the Reference SHAFT Project at `platform_core_data/reference_automation_project.md` — which one (or neither) applies, and the Automation Target/Framework/Strategy, is decided fresh by Stage 4's own Decision Gate, not fixed here.
