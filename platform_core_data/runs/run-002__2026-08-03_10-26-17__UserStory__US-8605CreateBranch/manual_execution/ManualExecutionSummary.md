# Manual Execution Summary — run-002__2026-08-03_10-26-17__UserStory__US-8605CreateBranch

| Field | Value |
|---|---|
| Execution ID | EXEC-BR-001 |
| Run Folder | `run-002__2026-08-03_10-26-17__UserStory__US-8605CreateBranch` |
| Results artifact | `manual_execution/ManualExecutionResults.md` |
| Generated | 2026-08-03 |
| Status | Approved |

## 2. Execution Summary

This run executed the Branch module's 39-case Manual Test Suite against the live STG environment (`http://192.168.1.70`), restricted to the 31 cases whose `Review` column reads `Approved` (`manual-execution-skill` §4.1). The 8 cases whose `Review` column reads `Rejected` (TC-BR-007, 008, 009, 011, 014, 015, 018, 020) were never authorized to run and are recorded `Excluded — Rejected at Review`, not attempted. Of the 31 executable cases, 27 Passed, 3 Failed, and 1 was Inconclusive. Two of the three confirmed Failed cases correspond to previously-Discovered, still-unresolved defects (FINDING-004 Warning Prompt length cap, FINDING-011 button label); the third (TC-BR-003, Branch Name accepts unfiltered special/markup characters) was newly confirmed this run and then specifically investigated at the module owner's request to determine whether it is a Stored XSS vulnerability or simply an unfiltered input-validation gap — it was confirmed to be the latter: the value persists and renders safely HTML-encoded on the Branch list, with no script execution observed at entry or on display, so it is scored Low severity, not a security defect. The one Inconclusive case (TC-BR-019, adding a second Contact Person) could not be reliably reproduced by this run's automation and needs a human tester's direct confirmation before it is scored.

A significant, unplanned finding surfaced during this run's methodology: the initial pass used a one-shot value-assignment technique to enter text into fields, which several of this application's client-side validators do not respond to the same way a real user's keystrokes would. Re-testing the length-sensitive and character-filtering cases with realistic, character-by-character typing overturned one Discovery-stage conclusion — see §7 Known Limitations and the Recommendations below.

**Headline figures:** 27 Passed · 3 Failed · 0 Blocked · 0 Skipped · 0 Not Executed · 1 Inconclusive · 8 Excluded

**Scope:** 31 of 39 cases were authorized to execute (`Review = Approved`). Every figure above is against that executable scope; the excluded remainder is broken down in the QA Report.

## 5. Delivery Artifacts

| Artifact | Path | Present? |
|---|---|---|
| Manual Execution Results (authoritative) | `manual_execution/ManualExecutionResults.md` | Yes |
| Manual Test Results CSV | `manual_execution/ManualTestResults.csv` | Yes |
| Manual QA Report (stakeholder deliverable) | `manual_execution/ManualQAReport.md` | Yes |
| Evidence | `manual_execution/artifacts/` | Yes (31 screenshots) |

**All three renderings agree on every status:** Yes — Results, CSV, and QA Report were all derived from the same 39-row result set compiled in this run.

**Scripts produced:** none. The Node/Playwright driver scripts used to reach and interact with each screen during this execution were throwaway debug scaffolding in the session scratchpad and are not part of this stage's delivered artifacts.

## 6. Known Limitations

| Limitation | Affected Test Case(s) | Why |
|---|---|---|
| Browser run headless, not headed | All 31 executed cases | Executed per explicit user instruction ("Stage 4M in headless mode") and the platform's own `.mcp.json`/browser profile default, which already runs headless for this project. This is a deliberate deviation from this skill's normal headed behavior (§11.1), not an unavailability fallback — disclosed here per that section's own disclosure requirement. No evidence of a functional difference was observed; screenshots were captured identically either way. |
| Second Contact Person could not be reliably re-verified | TC-BR-019 | See the TC-BR-019 defect entry (ManualExecutionResults.md §3.1) — automation-methodology ambiguity, not a confirmed application behavior either way. |
| No GDS/non-GDS classification exists in the UI | TC-BR-032 | Discovery had already flagged this area as Blocked for the same reason (`Coverage_Summary.md` §5). This run empirically discovered that the "Amadeus" supplier row is GDS-type (its selection reveals the expected PCC/Manager Name/Description sub-grid) — this is now known and can be reused directly in future passes, but there is still no UI-visible indicator that would let a tester identify a GDS row without this prior knowledge. |
| Console logs and network captures not persisted | All 31 executed cases | Only screenshots were retained as evidence this run; see Evidence Inventory gap reason in ManualExecutionResults.md §4. |

## 7. Recommendations

| ID | Recommendation | Applies To | Rationale |
|---|---|---|---|
| REC-EXEC-1 | Re-verify FINDING-003 (Credit Limit — no 15-character max-length enforcement) in Discovery. This run's TC-BR-023, using realistic character-by-character typing, found the field DOES block a 16th digit client-side (value capped at 15 characters) — directly contradicting FINDING-003's "Confirmed" Bug status, which was based on a one-shot value assignment that bypasses keydown-level input filters. | FINDING-003, TC-BR-023 | A finding's Confidence and Status should reflect the interaction method actually used to obtain it; a one-shot value assignment does not exercise the same code path as real user typing on fields with keydown-based length caps. |
| REC-EXEC-2 | Manually re-verify whether a Branch can retain more than one Contact Person (TC-BR-019) by adding two contacts directly through the UI, without automation. | TC-BR-019 | Resolves the one Inconclusive result in this run before it is scored Passed or Failed. |
| REC-EXEC-3 | File a defect for Branch Name's unfiltered acceptance of special/markup characters (TC-BR-003) as a data-validation gap, not a security defect — output-encoding was directly verified safe on the Branch list this run. If Branch Name is ever rendered elsewhere (branch pickers, reports, correspondence), confirm those locations also encode output before treating the security question as fully closed. | TC-BR-003 | Investigated and confirmed NOT Stored XSS this run (persists, renders HTML-encoded, no script execution observed); the input-side gap remains real and worth fixing, now scored Low rather than Medium. |
| REC-EXEC-4 | Re-open FINDING-004 (Warning Prompt length cap) and FINDING-011 (button label) for a development fix — both remain unresolved and were independently reconfirmed this run using an improved, more realistic interaction method. | TC-BR-026, TC-BR-035 | Both defects are now confirmed by two independent observations (Discovery + this Execution pass), meeting the "Always" reproducibility bar. |
| REC-EXEC-5 | Document the newly-discovered mandatory gates on full Branch submission — at least one Payment Option and at least one Product Access Supplier row must be selected — in the Project Context and/or PRD_UserStories.md, since neither US 8605's AC nor the original Test Design test cases called these out as submission prerequisites. | TC-BR-001, TC-BR-034 | These are real, confirmed application behaviors discovered only during execution; the requirement documentation should reflect them so future test design and execution runs don't have to rediscover them by trial and error. |

## 8. Inputs for Automation skill

| Required Input (Automation §4) | Present? | Location / Note |
|---|---|---|
| Approved Manual Test Suite | Yes | `modules/branch/test_design/TestCases_Branch.md` (`.xlsx`) |
| Approved Requirement Traceability Matrix | Yes | `modules/branch/test_design/TraceabilityMatrix.md` |
| Approved Coverage Report | Yes | `modules/branch/test_design/CoverageReport.md` |
| Approved Project Context | Yes | `modules/branch/context/ProjectContext.md` |

**Handoff confirmation:** All inputs the Automation skill's own specification (§4) declares it needs are present and Approved at their own checkpoints. Per this stage's architecture, the Automation branch (`4A`) takes its scope directly from Stage 3's approved test cases and does not depend on this Execution stage's results — this table confirms availability only, not a dependency this stage creates.
