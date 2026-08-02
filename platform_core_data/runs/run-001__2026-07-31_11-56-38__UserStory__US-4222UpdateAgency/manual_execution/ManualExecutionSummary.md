# Manual Execution Summary — run-001__2026-07-31_11-56-38__UserStory__US-4222UpdateAgency

| Field | Value |
|---|---|
| Execution ID | EXEC-4M-US4222-001 |
| Run Folder | `run-001__2026-07-31_11-56-38__UserStory__US-4222UpdateAgency` |
| Results artifact | `manual_execution/ManualExecutionResults.md` |
| Generated | 2026-08-02 |
| Status | Pending Review |

## 2. Execution Summary

All 37 test cases carrying `Review = Approved` were executed against agency `AGN2 — Test Egypt` on the
shared STG environment, in a headed browser, with every mutating case reverted and the full record re-verified
against a 74-value baseline before the next case began. 31 passed, 1 failed, 4 were blocked and
1 was deferred by its own notes. The single failure, TC-AGENCY-020, is a genuine validation gap: a file whose
contents are not a PDF is stored as a contract document. A second defect of higher severity was found by a case
that passed — deselecting a product cannot be undone (TC-AGENCY-041) — and it is the reason one change remains
outstanding on the record. The 4 blocked cases divide into three that need a second credential
(TC-AGENCY-048, 049, 050) and one blocked for automation only (TC-AGENCY-037), whose behaviour was verified
manually and is correct. The remaining 16 of the 53 designed cases were **Excluded**: their `Review`
column is `Rejected`, so this run was never authorized to execute them.

**Headline figures:** 31 Passed · 1 Failed · 4 Blocked · 1 Skipped · 0 Not Executed · 0 Inconclusive · 16 Excluded

**Scope:** 37 of 53 cases were authorized to execute (`Review = Approved`). Every figure above is against that executable scope; the excluded remainder is broken down in the QA Report.

## 5. Delivery Artifacts

| Artifact | Path | Present? |
|---|---|---|
| Manual Execution Results (authoritative) | `manual_execution/ManualExecutionResults.md` | Yes |
| Manual Test Results CSV | `manual_execution/ManualTestResults.csv` | Yes |
| Manual QA Report (stakeholder deliverable) | `manual_execution/ManualQAReport.md` | Yes |
| Evidence | `manual_execution/artifacts/` | Yes — 57 files |

**All three renderings agree on every status:** Yes — generated from one result set in a single pass.

**Scripts produced:** none. The execution harness lived in the session scratchpad and was deleted after the run.

## 6. Known Limitations

| Limitation | Affected Test Case(s) | Why |
|---|---|---|
| Maker/checker separation untestable | TC-AGENCY-048, 049, 050 | One credential exists on this install |
| One outstanding environment change | TC-AGENCY-041 | The `Flight` product cannot be re-selected without supplier-credential values the agency never held |
| Branch re-inheritance deferred | TC-AGENCY-052 | Potentially destructive on a shared environment |
| Automation cannot drive the payment-option checkboxes | TC-AGENCY-037 | The visible controls desynchronize from the underlying model; confirmed by network capture. The application itself is correct |
| 16 cases unexamined | `Status = Excluded` in the CSV | Rejected at review — a decision, not an omission |

## 7. Recommendations

| ID | Recommendation | Applies To | Rationale |
|---|---|---|---|
| REC-1 | Decide how to restore the `Flight` product on `AGN2` — UI with invented credential values, or a database correction | TC-AGENCY-041 | The environment is not yet identical to its pre-run state, and the remaining route changes data |
| REC-2 | Validate document uploads to the standard the logo upload already meets | TC-AGENCY-020 | The working model is on the same form |
| REC-3 | Fix the irreversibility of a product deselection | TC-AGENCY-041 | A reversible-looking action is not reversible |
| REC-4 | Add a second non-Super-Admin credential with approval rights | TC-AGENCY-048, 049, 050 | Unblocks the most coverage of any single change |
| REC-5 | Rotate the `odeysysadmin` password | — | The run is complete |

## 8. Inputs for Automation skill

Not applicable. Stage 4M is the Manual branch's terminal stage and hands off to nobody: Stage 4A takes its
scope directly from the approved Stage 3 test cases (`pipeline.md` §3.3). No Automation Candidate Package is
produced, and no Automation-branch artifact was read or written by this stage.

**Handoff confirmation:** none required — terminal stage.
