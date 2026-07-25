# NDC — Automation Candidate Package — Agency (Create · Search · Update · Actions)

**Run:** RUN-20260725-001 · **Produced by:** Manual Execution Agent (Stage 4) · **Date:** 2026-07-25
**Qualifying criteria applied in full** (Manual Execution Agent skill §9.1): Passed this run · deterministic/objectively verifiable · consistent across every execution this run · not dispositioned Exploratory by Test Design.

This package lists **only** the 13 test cases that qualify out of the 16 executed this run. `TC-AGENCY-CREATE-030` (Failed) and `TC-AGENCY-CREATE-032` (Inconclusive) are excluded per criterion 1 — see `ManualExecutionResults_Agency.md` §2 for why. The 48 Not Executed and 2 Superseded cases from the full 66-case suite are not listed here at all — they have no execution-based confirmation from this run.

| Test Case ID | Requirement Reference | Discovery/Finding/Evidence Reference | Manual Execution Result | Manual Test Suite location |
|---|---|---|---|---|
| TC-AGENCY-CREATE-001 | FR-AGCRT-MASTER-01–11, FR-AGCRT-OWNER-01–03, FR-AGCRT-DOC-01–03, FR-AGCRT-LOGO-01, FR-AGCRT-SALES-01/03/04, FR-AGCRT-PAY-01/02/03/07/11, FR-AGCRT-PRODUCT-01/02/04/06, FR-AGCRT-PCC-01/03/04/05, FR-AGCRT-PNR-01, FR-AGCRT-SUBMIT-01, BR-AGCRT-01/02/03 | FINDING-002 | Passed — `ManualExecutionResults_Agency.md` §2 | `workspace/test_design/Agency/TestCases_Agency.md` |
| TC-AGENCY-CREATE-027 | FR-AGCRT-PAY-11, FR-AGCRT-PAY-12, BR-AGCRT-03 | `RunManifest.md`, KB APP-002 | Passed (both sub-cases) | same |
| TC-AGENCY-SEARCH-001 | FR-AGSEARCH-01, FR-AGSEARCH-06 | `runs/RUN-20260713-001/discovery/Agency_Search.md` | Passed | same |
| TC-AGENCY-SEARCH-002 | FR-AGSEARCH-02, FR-AGSEARCH-06 | `runs/RUN-20260713-001/discovery/Agency_Search.md` | Passed | same |
| TC-AGENCY-ACTIONS-001 | FR-AGACTION-01, FR-AGACTION-02 | FINDING-004 | Passed | same |
| TC-AGENCY-ACTIONS-003 | FR-AGACTION-03/04/05 | FINDING-002 | Passed | same |
| TC-AGENCY-ACTIONS-004 | FR-AGACTION-07 | — | Passed | same |
| TC-AGENCY-ACTIONS-005 | FR-AGACTION-03/04/05 | FINDING-002 | Passed | same |
| TC-AGENCY-ACTIONS-006 | FR-AGACTION-08 | — | Passed | same |
| TC-AGENCY-ACTIONS-007 | FR-AGACTION-06 | FINDING-007 (re-resolved this run, see Results §2) | Passed | same |
| TC-AGENCY-ACTIONS-009 | FR-AGACTION-06/07/08 | — | Passed (consolidated) | same |
| TC-AGENCY-UPDATE-001 | FR-AGUPDATE-01 | — | Passed | same |
| TC-AGENCY-UPDATE-002 | FR-AGUPDATE-02/03, FR-AGACTION-06 | — | Passed | same |

**Excluded, with reason (per §9.3 — not silently omitted):**

| Test Case ID | Reason for exclusion |
|---|---|
| TC-AGENCY-CREATE-030 | Failed — Product Access Mandatory fields not enforced when the section is left entirely unset; real discrepancy, not an execution error (see Results §2, Summary §5 #1). |
| TC-AGENCY-CREATE-032 | Inconclusive — could not isolate the PCC section's own control within this run's budget (see Results §2, Summary §5 #3). |
| TC-AGENCY-ACTIONS-002 | Failed — Approve/Reject icon visibility not strictly limited to Pending rows (see Results §2, Summary §5 #2). Not included even though the underlying Approve/Reject *mechanism* it tests overlaps with ACTIONS-003–006 (which did qualify) — this specific case's own assertion (icon absence) did not hold. |
| All 48 Regression-tagged cases + 2 Superseded cases | Not executed this run — no execution-based confirmation to offer. See `ManualExecutionResults_Agency.md` §2 for the full list. |

## Cross-reference note for Stage 5

An Agency SHAFT automation package already exists at `runs/RUN-20260718-001/automation/` (merged to `main`), generated directly from Discovery + Test Design without a prior Manual Execution pass. This is the first Manual-Execution-confirmed candidate set for Agency. Reconciling the two (which of the already-generated package's cases this 13-case confirmed set actually backs, vs. cases generated without execution confirmation) is left to the Automation Agent's own judgment at Stage 5 — not decided here.
