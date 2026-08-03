# Manual QA Report — run-002__2026-08-03_10-26-17__UserStory__US-8605CreateBranch

**Status:** Approved · **Branch:** Manual Execution (terminal)

## 1. Run Identification

| Field | Value |
|---|---|
| Run Folder | `run-002__2026-08-03_10-26-17__UserStory__US-8605CreateBranch` |
| Execution ID | EXEC-BR-001 |
| Run Scope Type / Run Type | User Story / User Story |
| Modules in scope | branch |
| Target environment | STG (shared) — `http://192.168.1.70` |
| Execution window | 2026-08-03 |
| Browser mode | Headless — per explicit user instruction ("Stage 4M in headless mode"); see Known Limitations |
| Executed by | Manual Execution skill (Browser Driver, Super Admin role) |

## 2. Executive Summary

This run executed the Branch module's "Create Branch" test suite (US 8605) against the live staging application. Of the 39 designed test cases, 31 had cleared human review and were authorized to run; the other 8 were rejected during review and were not attempted. Of the 31 that ran, 27 behaved exactly as expected, 3 confirmed real defects, and 1 could not be conclusively verified by automation and needs a quick manual double-check.

Two of the three confirmed defects were already known from the earlier Discovery phase and remain unfixed: the Warning Prompt (Days) field still accepts unreasonably long values, and the primary submit button still reads "Send For Approval" instead of the agreed "Submit for Approval." The third is new: the Branch Name field accepts special/markup characters (e.g., `<script>` tags) it should reject per the "alphanumeric input only" rule. None of these block day-to-day use of the feature — a Branch can still be created and submitted for approval successfully — but all three should be fixed.

Because the Branch Name finding involved script-like input, we specifically investigated whether it amounts to a Stored XSS vulnerability, per your request, rather than assuming the worst from the input behavior alone. It does not: the value is stored, and when it is later displayed in the Branch list, the browser renders it as safe, HTML-encoded text (`&lt;script&gt;`, not an executable `<script>` tag) — the injected script never ran, at entry or at display. This is a real but lower-severity data-validation gap (non-conforming names can be saved), not a confirmed security vulnerability, and we've reclassified and re-scored it accordingly (Medium → Low). This conclusion covers the one display location we checked (the Branch list); other places the name might appear were not re-checked.

One methodology note worth a decision, kept exactly as a discrepancy rather than resolved either way: while re-testing more carefully with realistic typing (rather than pasting values in one shot), the Credit Limit field appeared to correctly cap input at 15 characters — apparently contradicting an earlier Discovery finding that it did not. We are not treating this as settled; it stays flagged as a Discovery/Execution inconsistency until Discovery re-runs its own check using the same realistic typing method and either confirms or refutes the original finding.

## 3. Outcome Figures

| Status | Count | % of scope |
|---|---|---|
| Passed | 27 | 87.1% |
| Failed | 3 | 9.7% |
| Blocked | 0 | 0% |
| Skipped | 0 | 0% |
| Not Executed | 0 | 0% |
| Inconclusive | 1 | 3.2% |
| **Executable scope** (`Review = Approved`) | **31** | **100%** |

Not authorized to run this pass — reported, not dropped:

| Excluded | Count | % of suite |
|---|---|---|
| Pending Review | 0 | 0% |
| Rejected at Review | 8 | 20.5% |
| **Suite total** | **39** | **100%** |

**Authorized Coverage:** 79.5% of the designed suite (31 of 39) was approved for execution in this pass.

## 4. Requirement Coverage

<!-- Computed from TraceabilityMatrix.md §2 Requirement → Test Case Roll-Up, restricted to groups with at least one executable (Review=Approved) test case this run. -->

| Requirement ID | Requirement | Covering test cases | Verification state | Note |
|---|---|---|---|---|
| US5 §Branch Details | Operating Country, Branch Name, Country auto-fill, State/City cascade, Address 1, Post Office Box, Phone Number | TC-BR-001, 002, 003, 004, 005, 006, 010 (TC-BR-007, 008, 009, 011 Excluded — Rejected at Review) | Partially verified | All Passed except TC-BR-003 (Branch Name special-character rejection) — see Defect Register |
| US5 §Branch Email Configuration | Branch Email ID, Email Password | TC-BR-012, 013 (TC-BR-014, 015 Excluded — Rejected at Review) | Verified | Both cases Passed |
| US5 §Branch Contact Info | Contact Name, Email ID, Phone Number, Add button | TC-BR-016, 017, 019 (TC-BR-018 Excluded — Rejected at Review) | Partially verified | TC-BR-016/017 Passed; TC-BR-019 (second contact) Inconclusive |
| US5 §Branch Sales Configuration | Target/Month/Year, Credit Limit, Top-Up Limit, Credit Terms, Reaching Percentage, Warning Prompt, Payment Option | TC-BR-021, 022, 023, 024, 025, 026, 027, 028 (TC-BR-020 Excluded — Rejected at Review) | Partially verified | All Passed except TC-BR-026 (Warning Prompt length cap) |
| US5 §Product Access Details | Grid columns, Description enable/mandatory rule, GDS sub-grid | TC-BR-029, 030, 031, 032, 033 | Verified | All 5 cases Passed |
| US5 §Buttons & Actions | Submit for Approval, Cancel | TC-BR-034, 035, 036 | Partially verified | TC-BR-034/036 Passed; TC-BR-035 Failed (button label) |
| US6 §2 Branch Module | Child Agencies Threshold Amount ("Outstanding Threshold") | TC-BR-037, 038, 039 | Verified | All 3 cases Passed (Mandatory/Optional and format-constraint ambiguities noted in Test Design's Coverage Report remain open questions, unrelated to this run's pass/fail outcome) |

**Requirements verified:** 3 / 7 (43%) fully verified; 4 / 7 (57%) partially verified with a named, documented exception. Zero requirement groups are unverified.

## 5. Defect Register

| Test Case | Defect summary | Severity | Priority | Category | Layer | Reproducibility | Full write-up |
|---|---|---|---|---|---|---|---|
| TC-BR-003 | Branch Name accepts unfiltered special/markup characters at input (`<script>` tag retained verbatim). **Investigated and confirmed NOT Stored XSS**: the value persists and later renders HTML-encoded (`&lt;script&gt;`) on the Branch list, and the injected script never executed at any point checked. Input-validation gap only. | Low | P3 | Validation | Frontend (input) | Always (input-side acceptance, confirmed twice); output-side safety confirmed for the one rendering location checked | [details](./ManualExecutionResults.md#tc-br-003--branch-name-accepts-unfiltered-specialmarkup-characters-input-validation-gap-not-confirmed-stored-xss) |
| TC-BR-026 | Warning Prompt (Days) accepts a 15-digit value with no truncation or message | Medium | P1 | Validation | Frontend | Always (confirmed in Discovery and this run) | [details](./ManualExecutionResults.md#tc-br-026--warning-prompt-days-still-has-no-11-digit-length-enforcement) |
| TC-BR-035 | Submit button reads "Send For Approval" instead of "Submit for Approval" | Low | P4 | UI | Frontend | Always (confirmed in Discovery and this run) | [details](./ManualExecutionResults.md#tc-br-035--submit-button-label-still-reads-send-for-approval) |
| TC-BR-019 | Second Contact Person's persistence could not be conclusively verified (Inconclusive, not a confirmed defect) | N/A | P3 | N/A | Unknown | Unable to confirm | [details](./ManualExecutionResults.md#tc-br-019--second-contact-person-could-not-be-reliably-re-verified) |

**Defects by severity:** Critical 0 · High 0 · Medium 1 · Low 2

## 6. Assumptions & Risks Resolved

| Assumption / Risk | Source test case | Resolution | Evidence |
|---|---|---|---|
| Child Agencies Threshold Amount ("Outstanding Threshold") is Mandatory (assumption carried from Test Design, since US 51489 does not itself state Mandatory/Optional) | TC-BR-038 | Confirmed — submitting with the field empty was blocked, consistent with the live UI's Mandatory asterisk | `manual_execution/artifacts/TC-BR-038.png` |
| A GDS-type Supplier row exists and reveals a distinct Supplier Credentials sub-grid (Discovery had recorded this area as Blocked, unable to identify a GDS row from the UI alone) | TC-BR-032 | Confirmed — the "Amadeus" supplier row was empirically found to be GDS-type; selecting it reveals "Generic supplier credentials (PCC)", "Manager Name", and "Description" fields exactly as the requirement describes | `manual_execution/artifacts/TC-BR-032.png` |
| RISK-BR-1 boundary conditions for Post Office Box (7/8/9 chars) and Credit Limit (14/15/16 digits) | Not exercised this run (TC-BR-007/008 Excluded — Rejected at Review) | Unverified — the Post Office Box boundary was not re-tested this pass; Credit Limit's boundary was re-tested (TC-BR-023) and its result is reported separately below | — |
| FINDING-003 (Credit Limit has no 15-character max-length enforcement) — treated here as a risk to re-examine, not an assumption | TC-BR-023 | Refuted (pending Discovery's own re-confirmation) — this run's realistic character-by-character typing found the field blocks entry past 15 characters. The original Discovery finding used a one-shot value assignment that does not exercise the same keydown-level filter a real user's typing would trigger. See Recommendations. | `manual_execution/artifacts/TC-BR-023.png` |

## 7. Known Limitations

| Limitation | Affected test cases | Why | Consequence for confidence |
|---|---|---|---|
| Browser run headless, not headed | All 31 executed cases | Run per explicit user instruction and the platform's existing headless default; this is this stage's normal behavior being deliberately overridden, not a fallback for an unavailable capability (§11.1) | None observed — every interaction and validation message was captured identically to what a headed run would show, via screenshots |
| Second Contact Person not reliably re-verified | TC-BR-019 | Automation-methodology ambiguity across repeated attempts; inconsistent with the single-contact case (TC-BR-016), which passed reliably | Confidence in Branch Contact Info's "multiple contacts" behavior is low until a human re-checks it directly |
| No reliable way to identify a GDS-type Supplier row from the UI alone | TC-BR-032 | Discovery had already flagged this as Blocked for the same reason; this run found "Amadeus" empirically | Resolved for this run via direct observation, but a future run without this prior knowledge would face the same difficulty |
| Console logs and network captures not persisted as evidence | All 31 executed cases | Only screenshots were retained; deeper technical evidence (console errors, network responses) was not saved to disk | Sufficient to confirm each case's Pass/Fail outcome, but not sufficient for deep root-cause work without re-running |

## 8. Recommendations

| Item | Recommendation | Owner suggestion |
|---|---|---|
| FINDING-003 (Credit Limit length cap) | Re-verify in Discovery using realistic character-by-character typing; this run's evidence suggests the field is actually correctly enforced, contradicting the finding's current "Confirmed" status | Module owner / Explorer skill re-run |
| TC-BR-019 (second Contact Person) | Manually add two Contact Persons directly through the UI (no automation) and confirm whether both persist | Module owner or a human tester |
| TC-BR-003 (Branch Name special characters) | File a defect for the missing input-side validation (data-integrity/business-rule gap, not a security defect — output-encoding was directly verified safe on the Branch list). If the Branch Name is ever rendered in a location not yet checked (e.g., correspondence, other reports), confirm that location also encodes output before considering this fully closed | Development team |
| TC-BR-026 / FINDING-004 (Warning Prompt length cap) | Prioritize a fix — now confirmed by two independent observations | Development team |
| TC-BR-035 / FINDING-011 (button label) | Low-effort label fix — now confirmed by two independent observations | Development team |
| Mandatory submission gates not in the original AC | Document that at least one Payment Option and at least one Product Access Supplier row are mandatory for successful Branch submission — discovered during this run, not previously documented in US 8605 or the Test Design suite | Product / Business, then Test Design for a future revision |

---

## Delivery Completeness

| Requirement | Status |
|---|---|
| Every test case in scope has a recorded outcome | Yes — all 39 (31 executed + 8 Excluded) |
| Every Failed/Inconclusive case meets the Defect Documentation Standard in full (§10.1) | Yes — 4 full write-ups in ManualExecutionResults.md §3.1 |
| Every result's evidence captured, or its absence stated with a reason | Yes — 31 screenshots captured; console/network-log gap stated with reason |
| CSV has one row per test case in scope, statuses unabbreviated | Yes — 39 rows in `ManualTestResults.csv` |
| Coverage computed from the Traceability Matrix, uncovered requirements shown as *not verified* | Yes — §4 above; zero requirement groups are unverified |
| **All three renderings agree on every test case's status** | Yes |
| No script of any kind was produced as an artifact (§2.1) | Yes — driver scripts were session scratchpad only |
