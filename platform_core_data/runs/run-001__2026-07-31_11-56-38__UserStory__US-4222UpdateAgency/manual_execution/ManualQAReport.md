# Manual QA Report — run-001__2026-07-31_11-56-38__UserStory__US-4222UpdateAgency

**Status:** Pending Review · **Branch:** Manual Execution (terminal)

## 1. Run Identification

| Field | Value |
|---|---|
| Run Folder | `run-001__2026-07-31_11-56-38__UserStory__US-4222UpdateAgency` |
| Execution ID | EXEC-4M-US4222-001 |
| Run Scope Type / Run Type | User Story / User Story — US-4222 "[Admin] Update Agency" |
| Modules in scope | `agency` |
| Target environment | STG (shared, live commercial data) — http://192.168.1.70 |
| Execution window | 2026-07-31 → 2026-08-02 |
| Browser mode | Headed |
| Executed by | Manual Execution skill (Stage 4M), Super Admin role |

## 2. Executive Summary

US-4222 describes updating an agency. We tested it against the real staging system, on a real agency record
(`AGN2 — Test Egypt`), and the feature works: of the 37 test cases you approved, 31 passed.
Agency details, owner details, payment settings, documents, the logo, product selection and the
submit-for-approval workflow all behave as the story describes.

Two things need your attention. **A file that is not a PDF is accepted and stored as an agency contract
document** — the system checks neither the contents nor even the file name extension, although the logo
upload beside it does check both. And **deselecting a product cannot be undone**: re-selecting it demands
supplier-credential details the agency never had, so the form will not save. We found the second one by
doing it, which means one change is still outstanding on the record — the `Flight` product remains
deselected on `AGN2`, and putting it back needs a decision from you (§8).

Three cases could not be run at all, for one reason: the installation has a single login, so an update
cannot be submitted by one person and approved by another. That is the separation the approval workflow
exists to enforce, and it is the one part of US-4222 we cannot tell you anything about.

16 of the 53 designed cases were not authorized to run — you rejected them at review — so
this report covers 69.8% of the designed suite.

## 3. Outcome Figures

| Status | Count | % of scope |
|---|---|---|
| Passed | 31 | 83.8% |
| Failed | 1 | 2.7% |
| Blocked | 4 | 10.8% |
| Skipped | 1 | 2.7% |
| Not Executed | 0 | 0.0% |
| Inconclusive | 0 | 0.0% |
| **Executable scope** (`Review = Approved`) | **37** | **100%** |

Not authorized to run this pass — reported, not dropped:

| Excluded | Count | % of suite |
|---|---|---|
| Pending Review | 0 | 0.0% |
| Rejected at Review | 16 | 30.2% |
| **Suite total** | **53** | **100%** |

**Authorized Coverage:** 69.8% of the designed suite (37 of 53) was approved for execution in this pass.

## 4. Requirement Coverage

| Requirement ID | Requirement | Covering test cases | Verification state | Note |
|---|---|---|---|---|
| AC-1 | Agency Master fields | 001, 002, 003, 004, 005, 006, 007, 008, 009, 010, 011, 052, 053 | Partially verified | 6 of 7 approved cases executed; the rest were Blocked or Deferred. |
| AC-10 | AC-10 | 044 | Verified | All approved cases in this group executed and passed. |
| AC-2 | Agency Owner Details | 012, 013, 014, 015 | Verified | All approved cases in this group executed and passed. |
| AC-3 | Upload Document Details (documents + contract dates) | 016, 017, 018, 019, 020, 021, 051 | Failed | At least one approved case failed — see the Defect Register. |
| AC-4 | Agency Logo | 022, 023, 024 | Verified | All approved cases in this group executed and passed. |
| AC-5 | Wonder Travel Sales Contact | 025, 026, 027, 028 | Verified | All approved cases in this group executed and passed. |
| AC-6 | Bank Account Details | 029, 030, 031, 032 | Not verified | No case in this group was approved for execution, so nothing about it was verified this pass. |
| AC-7 | Payment settings | 033, 034, 035, 036, 037, 038, 039 | Partially verified | 5 of 6 approved cases executed; the rest were Blocked or Deferred. |
| AC-8 | Product Access / Agency Features | 040, 041, 042 | Verified | All approved cases in this group executed and passed. |
| AC-9 | AC-9 | 043 | Not verified | No case in this group was approved for execution, so nothing about it was verified this pass. |
| No acceptance criterion | Behaviour with no governing acceptance criterion (later enhancements, workflow) | 045, 046, 047, 048, 049, 050 | Partially verified | 3 of 6 approved cases executed; the rest were Blocked or Deferred. |

**Requirements verified:** 5 / 11 (45.5%)

AC-6 (Bank Account Details) is reported as **Not verified** by design: every case covering it was rejected at
review, a decision recorded in the Coverage Report §11.2 and accepted there. It is listed rather than omitted
because a missing row reads as "nothing to say", which is the opposite of the truth.

## 5. Defect Register

| Test Case | Defect summary | Severity | Priority | Category | Layer | Reproducibility | Full write-up |
|---|---|---|---|---|---|---|---|
| TC-AGENCY-020 | A file whose contents are not a PDF is accepted and stored as an agency contract document; neither content nor extension is validated | Medium | P2 | Validation | Frontend + Backend | Unable to confirm (one observation) | [details](./ManualExecutionResults.md#tc-agency-020--a-file-whose-contents-are-not-a-pdf-is-accepted-and-stored-as-an-agency-contract-document) |
| TC-AGENCY-041 | Deselecting a product is irreversible through the UI and destroys its supplier-credential configuration *(the case itself passed)* | High | P1 | Workflow | Frontend | Always (four attempts) | [details](./ManualExecutionResults.md#tc-agency-041--a-deselected-product-cannot-be-re-selected-and-saved-and-its-configuration-is-lost) |

**Defects by severity:** Critical 0 · High 1 · Medium 1 · Low 0

The second row is not a Failed case. TC-AGENCY-041 asserted that a deselected product stays deselected, and it
did. The defect is what the attempt to undo it revealed, and reporting it only as a passing case would bury
the more important finding.

## 6. Assumptions & Risks Resolved

| Assumption / Risk | Source test case | Resolution | Evidence |
|---|---|---|---|
| ASM-012 — the Mandatory marking on document and logo may describe create-time only, not a re-upload on every update | TC-AGENCY-051 | **Confirmed** — an agency with an existing document and logo was updated without touching either section, and both remained attached | `manual_execution/artifacts/TC-AGENCY-051.png` |
| ASM-016 — changing Branch may overwrite Product Access and Sales Contact | TC-AGENCY-052 | **Unverified** — deferred, requires a dedicated environment. TC-AGENCY-041 gave the deferral concrete support: a product change on this form could not be undone | — |
| Reviewer-reported rule: the agency name accepts letters, digits and underscore only | TC-AGENCY-053 | **Refuted** — `QA Test Agency` was accepted and redisplayed with its space intact. The reported rule does not hold for the space character, which matters because the agency's own stored name contains one | `manual_execution/artifacts/TC-AGENCY-053.png` |
| FINDING-005 — Outstanding Threshold is a later enhancement, mandatory, with an unconfirmed valid range | TC-AGENCY-033 | **Confirmed** — the field accepted `10` against an observed `5`; no constraint was encountered at that value | `manual_execution/artifacts/TC-AGENCY-033.png` |
| FINDING-007 — a single credential prevents maker/checker separation from being tested | TC-AGENCY-048, 049, 050 | **Confirmed** — all three remain Blocked for exactly this reason | — |

## 7. Known Limitations

| Limitation | Affected test cases | Why | Consequence for confidence |
|---|---|---|---|
| Approval by a second user could not be tested | TC-AGENCY-048, 049, 050 | The installation has one credential (`odeysysadmin`, Super Admin), so submitter and approver are the same identity | The approval workflow's central control — that somebody else approves — is unverified. Everything upstream of it is verified |
| One environment change remains outstanding | TC-AGENCY-041 | The application will not save a re-selected product without supplier-credential values the agency never held | The record is not identical to its pre-run state; `AGN2` is currently missing the `Flight` product |
| Branch re-inheritance not exercised | TC-AGENCY-052 | Deferred by the case's own notes — potentially destructive on a shared environment | ASM-016 remains open |
| One case is blocked for automation only | TC-AGENCY-037 | The payment-option checkboxes cannot be driven reliably through the public UI: the visible controls read unchecked while the underlying model still carried a selection, confirmed by network capture | None for the application — the behaviour was verified manually and is correct. The limitation is the harness's |
| 16 designed cases were not authorized | see CSV, `Status = Excluded` | Rejected at review | 30.2% of the designed suite is unexamined this pass, by decision rather than by omission |
| Product Access supplier rows changed mid-run, not by this run | — | The read-only supplier list changed from `SalamAir`/`FlyNas` to `Sabre` between two clean verifications | Recorded, not corrected — overwriting it would have destroyed somebody else's configuration |

## 8. Recommendations

| Item | Recommendation | Owner suggestion |
|---|---|---|
| TC-AGENCY-041 — outstanding change | Decide how to restore the `Flight` product on `AGN2`: supply the two supplier-credential values through the UI, which adds data the agency did not previously hold, or restore the product association directly in the database. This is a data decision, not a QA one | Reviewer / DBA |
| TC-AGENCY-041 — defect | Treat the irreversibility as a defect in its own right: re-selecting a product should restore it without demanding credential details that were never required to remove it | Development |
| TC-AGENCY-020 | Validate document uploads at least as strictly as logo uploads already are — the logo control's `accept` attribute and its format check are the working model, on the same form | Development |
| TC-AGENCY-048, 049, 050 | Provide a second, non-Super-Admin credential with approval rights so maker/checker separation can be tested. This is the single change that would unblock the most coverage | Environment owner |
| TC-AGENCY-052 | Schedule on a dedicated environment where Branch re-inheritance can be exercised without risking live data | QA lead |
| Credential hygiene | Rotate the `odeysysadmin` password now that the run is complete | Environment owner |

---

## Delivery Completeness

| Requirement | Status |
|---|---|
| Every test case in scope has a recorded outcome | Yes — all 53 suite cases appear, 37 with an execution outcome and 16 as `Excluded` |
| Every Failed/Inconclusive case meets the Defect Documentation Standard in full (§10.1) | Yes — TC-AGENCY-020, plus TC-AGENCY-041 documented to the same standard despite passing |
| Every result's evidence captured, or its absence stated with a reason | Yes — Results §4 |
| CSV has one row per test case in scope, statuses unabbreviated | Yes — 53 rows |
| Coverage computed from the Traceability Matrix, uncovered requirements shown as *not verified* | Yes — §4, AC-6 shown explicitly |
| **All three renderings agree on every test case's status** | Yes — all three are generated from one result set in a single pass, so they cannot diverge |
| No script of any kind was produced as an artifact (§2.1) | Yes — the execution harness was scratchpad scaffolding and is deleted |
