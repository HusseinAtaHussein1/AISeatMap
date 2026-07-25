# NDC — Coverage Report — Role (Create Role) — RUN-20260721-001

**Status:** Pending Review · **Produced by:** Test Design Agent (Stage 3) · **Date:** 2026-07-21

## 1. Run Scope

Run Scope Type: **User Story** (narrowest strategy — one case per acceptance-criterion statement, no wandering into adjacent coverage). Source: Pasted text (`resources/requirements/user_stories/Create-Role.md`; `PRD.md` User Story 4). Designed against: `workspace/context/ProjectContext_Role.md` (Approved 2026-07-21), informed by `runs/RUN-20260721-001/discovery/` (Approved via this run's own Stage 2 completion — QA_Assessment_Report.md, Timeline.md, Coverage_Summary.md, Findings_Summary.md + FINDING-001..004, all produced this same run).

## 2. Requirements Covered

12 of 14 Requirement IDs fully Covered: `FR-ROLECRT-NAME-01`, `FR-ROLECRT-NAME-02`, `FR-ROLECRT-AUTH-01`, `FR-ROLECRT-MOD-01`, `FR-ROLECRT-MOD-04`, `FR-ROLECRT-TAB-01`, `FR-ROLECRT-PERM-01`, `FR-ROLECRT-PERM-02`, `FR-ROLECRT-PERM-03`, `FR-ROLECRT-ACTION-01`, `FR-ROLECRT-ACTION-02`, `BR-ROLECRT-01`. 2 Partially Covered: `FR-ROLECRT-MOD-02`, `FR-ROLECRT-MOD-03` (see §8).

## 3. Coverage Matrix

See `TraceabilityMatrix.md` (Requirement ID × Test Case ID, with Discovery/Finding References) — full cross-reference lives there, not restated here.

## 4. Business Rules

This Project Context names one dependency-shaped item with a `BR-` prefix: `BR-ROLECRT-01` (Search Role screen, Cancel's navigation target) — covered by TC-ROLE-019. No other `BR-`-prefixed requirements exist in this scope (all others are `FR-`-prefixed functional requirements).

## 5. Test Scenarios

22 test cases designed, by dimension/category:
- **Positive (structural/behavioral):** TC-ROLE-001, 010, 011, 012, 013, 014, 015, 016, 018, 019, 020 (11 cases)
- **Negative — Invalid Inputs / Special Characters:** TC-ROLE-002
- **Negative — Empty Values:** TC-ROLE-003, 005, 009
- **Negative — Unicode:** TC-ROLE-006
- **Negative — Boundary Values:** TC-ROLE-007, 017
- **Negative — Security Inputs:** TC-ROLE-008
- **Negative — Invalid Inputs (duplicate):** TC-ROLE-004
- **Exploratory (Finding disposition):** TC-ROLE-021, 022

By module: all 22 cases are within Admin → Role Management → Create Role (this run's sole in-scope screen).

## 6. Manual Test Cases

See `TestCases_Role.md` and `TestCases_Role.xlsx` — full test case content (Objective, Preconditions, Test Data, Steps, Expected Result, all traceability fields) lives there, not restated here.

## 7. Assumptions

Carried forward as explicitly tagged Assumption-based test cases (Project Context §6 items, plus new ones surfaced this run):
- TC-ROLE-001 — full end-to-end successful Role save is untested (mutation not authorized this run).
- TC-ROLE-005 — whitespace-only Role Name behavior untested.
- TC-ROLE-006 — Unicode/non-Latin-script Role Name behavior untested.
- TC-ROLE-007 — long Role Name (boundary) behavior untested.
- TC-ROLE-008 — SQL-injection-style input handling untested (probe-only, not yet executed).
- TC-ROLE-017 — reverse-direction checkbox behavior (unchecking Edit/Approve after auto-select) untested; not AC-stated either way.

## 8. Coverage Gaps

| Area | Status | Reason |
|---|---|---|
| `FR-ROLECRT-MOD-02` / `FR-ROLECRT-MOD-03` (Select All) | Partially Covered | The described control does not exist live (FINDING-001). A fixed pass/fail positive test cannot be designed for a nonexistent control; dispositioned instead as Exploratory charter TC-ROLE-021, per the user's explicit instruction not to assert Covered against the AC's original wording. |
| Permissions dimension — role-tier access to `/admin/role/add` | Unknown/Unassessed | Only the Super Admin (`odeysysadmin`) credential is available in `credentials.json` this run; whether the Admin tier or any lower-privileged role can reach/use this screen is untested. Ties to Project Context §6 #2/#7 and the project's existing FINDING-004. |
| Configuration dimension | Not Applicable | No feature-flag/config toggle is documented for this screen in the Project Context. |
| Timeouts (Negative Test Generation) | Not Applicable | No slow-network simulation tool was available this run. |
| Full end-to-end successful Role creation | Partially Covered | Mutation not authorized on this shared staging environment (Project Context §5) — see TC-ROLE-001's assumption note. |

**Uncovered Requirements: 0. Uncovered Findings: 0** (all 4 Findings dispositioned — see §8 continuation via Finding disposition below).

**Finding Disposition (all 4 dispositioned, 0 Uncovered):**

| Finding | Status | Disposition | Resulting Artifact |
|---|---|---|---|
| FINDING-001 (Select All absent) | Needs Human Review | **Exploratory test** | TC-ROLE-021 — charter, not a fixed assertion, per explicit user instruction not to assert this Covered against the AC's original wording |
| FINDING-002 (4 validation-message mismatches) | Needs Human Review | **Regression test** | TC-ROLE-002, 003, 004, 009 — assert the actually-observed live message text as the correct, going-forward expected behavior, per explicit user instruction |
| FINDING-003 (button label mismatch) | Needs Human Review | **Regression test** | TC-ROLE-020 — asserts the live label ("Send For Approval") as correct, per explicit user instruction |
| FINDING-004 (segment-list discrepancy) | Needs Human Review | **Exploratory test** | TC-ROLE-022 — charter, not a fixed assertion, per explicit user instruction not to assert this Covered against the AC's original wording |

## 9. Risks

High-risk test cases: TC-ROLE-001 (P1, High — primary positive path), TC-ROLE-011/012/013/014/015/016 (P1, High/Medium — core structural and checkbox-behavior requirements). Medium-risk: every FINDING-002/003/004-linked case (message/label/segment-list discrepancies — false-negative risk if the AC's original wording is asserted instead of the live text). No Critical-risk items this run (no application-availability, data-loss, or security-breach-class condition was found).

## 10. Recommendations

- Resolve FINDING-001/002/003/004 with the Product Owner per each Finding's own Recommendation field before this suite is used as a long-term regression baseline (the current test cases assert live-observed behavior as a pragmatic interim baseline, per explicit user instruction, not as confirmation that the live behavior is the intended final design).
- Populate the Admin-tier (`e.saady`) credential in `credentials.json` to close the Permissions-dimension gap (§8) and the project's standing FINDING-004 question.
- Regression Impact note: Company's own "Role" tab (`FR-ROLECRT-TAB-01`'s Role row) is this same Create-Role feature's self-referential permission entry — any future change to the Add Role screen's structure should also regress-test this recursive relationship, not just treat it as an ordinary grid row.
- Once mutation is authorized on this (or an isolated) environment, execute TC-ROLE-001/010 to their actual completion (a real role saved and confirmed in the Role list) rather than the pre-submission-signal-only verification this run relied on.

## 11. Automation Candidates

Advisory only — the binding Automation Decision remains the Automation Agent's own authority. Likely well-suited to automation: TC-ROLE-002, 003, 004, 009 (validation-message assertions — deterministic, high-value regression guards), TC-ROLE-014/015/016 (checkbox auto-select rules — deterministic, core behavior), TC-ROLE-011/012/013 (structural presence checks), TC-ROLE-019 (Cancel navigation), TC-ROLE-020 (button label). Likely Manual/Exploratory Only: TC-ROLE-021, 022 (charters, not fixed assertions by design). TC-ROLE-001/010 are Partially Automatable pending mutation authorization (can automate the pre-submission signal now; the full save-and-confirm assertion needs an authorized environment).

## 12. Inputs for Automation Agent

- **Project Context (Governing):** `workspace/context/ProjectContext_Role.md` (Approved) — unchanged pass-through.
- **Manual Test Suite (Primary):** `TestCases_Role.md` / `.xlsx` (this folder).
- **Requirement Traceability Matrix (Primary):** `TraceabilityMatrix.md` (this folder).
- **Coverage Report (Secondary):** this document — see §8 (Coverage Gaps) and §11 (Automation Candidates) so Automation doesn't attempt what Stage 3 already excluded (e.g., TC-ROLE-021/022's charters).
- **Discovery Artifacts (Secondary):** `runs/RUN-20260721-001/discovery/` — every Discovery Reference above cites a specific screenshot/Timeline entry, never a bare "see Discovery."
- **Findings (Secondary):** `runs/RUN-20260721-001/discovery/findings/` — every Finding Reference above is unambiguous about its disposition (regression vs. exploratory), so Automation knows whether a script is expected.
- **Evidence Packages (Secondary):** cited per-Finding above, specific files, not whole-Finding references.

**Environment note for Automation Agent:** this project's shared staging environment remains read-only by default (Project Context §5) — mutation authorization has not been asked for or granted this run and must be requested fresh before any automation attempts a real Role save, per the standing platform decision-gate rule.
