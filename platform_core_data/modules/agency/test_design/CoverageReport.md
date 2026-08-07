# Coverage Report — Agency

| Field | Value |
|---|---|
| Module | `agency` |
| Produced by run | `run-001__2026-07-31_11-56-38__UserStory__US-4222UpdateAgency` |
| Revision | 1 |
| Project Context | `modules/agency/context/ProjectContext.md` (revision 2, Approved) |
| Generated | 2026-08-01 |
| Status | **Approved** |
| Approved | 2026-08-02 — reviewer, after per-case review of all 53 cases (37 Approved / 16 Rejected / 0 Pending) |

## 1. Run Scope

| | |
|---|---|
| **Run Scope Type** | User Story |
| **Run Scope Source** | Markdown file — `knowledge_base/requirements/user_stories/US-4222_Admin_Update_Agency.md` |
| **Run Type** | User Story |
| **Strategy applied** | **User Story** (§16) — narrowest and most literal: at minimum one case per enumerated acceptance criterion, no wandering into adjacent features, and every carried-forward Assumption/Risk given an explicitly tagged case or a stated disposition |
| **Project Context designed against** | revision 2, `Approved` — the revision carrying the §1.1 Requirement Disposition taxonomy |
| **Branch** | Manual Execution Pipeline. Cases are authored branch-agnostically; §11's **Review & Automation** roll-up summarizes the two binding per-case decisions that gate each branch |

**The governing design decision.** US-4222 predates later application enhancements, so per Project Context §1.1 the **running application is the primary reference where the story is clearly outdated**. Expected results are written against observed behaviour for disposition rows 1, 2 and 4; against the *requirement* for row 5; and AC-9 (row 3) is designed but Blocked. Every case whose expected result rests on the directive rather than on the story says so in its Notes.

## 2. Requirements Covered

| Requirement | Coverage Status | Test Cases |
|---|---|---|
| AC-1 — Agency Master | Covered | TC-AGENCY-001 … 011, 053 |
| AC-2 — Agency Owner Details | Covered | TC-AGENCY-012 … 015 |
| AC-3 — Upload Document | Covered | TC-AGENCY-016 … 021, 051 |
| AC-4 — Agency Logo | Covered | TC-AGENCY-022, 023, 024, 051 |
| AC-5 — Wonder Travel Sales Contact | **Partially Covered** | TC-AGENCY-025 … 028 |
| AC-6 — Bank Account Details | Covered | TC-AGENCY-029 … 032 |
| AC-7 — Payment Settings | **Partially Covered** | TC-AGENCY-033 … 039 |
| AC-8 — Product Access Details | Covered | TC-AGENCY-040, 041, 042 |
| AC-9 — Airline Supplier Credential (PCC) | **Unknown / Unassessed** | TC-AGENCY-043 (Blocked) |
| AC-10 — Import PNR Option | Covered | TC-AGENCY-044 |
| Expected Outcome — Submit for Approval | Covered | TC-AGENCY-045, 046 |
| Expected Outcome — Cancel | Covered | TC-AGENCY-047 |
| Expected Outcome — Approve | **Partially Covered** | TC-AGENCY-048, 050 (Blocked) |
| Expected Outcome — Reject | **Partially Covered** | TC-AGENCY-049 (Blocked) |

**Coverage Percentage: 9/14 = 64% Covered** — basis: 14 in-scope requirement groups (10 AC groups + 4 Expected Outcome actions); 9 fully Covered, 4 Partially Covered, 1 Unknown/Unassessed.

**Read that figure with its companions, not alone.** Per §8.3, Partially Covered and Unknown/Unassessed are reported beside the percentage rather than folded into it. **Nothing is Uncovered** — the one category that would represent a defect in this stage's own output. All five non-Covered requirements are designed; three are blocked by a missing credential or a pending business answer, and two are bounded by open questions the Project Context already records.

> **This table measures DESIGN coverage, not what will actually run.** *(Added 2026-08-02.)* A requirement is `Covered` here when Stage 3 authored cases for it — which is this stage's own responsibility and is unaffected by review outcomes. **Authorized coverage is a different measurement**, reported in §11.2, and the two now disagree in one place that matters: **AC-6 reads `Covered` above and has zero approved cases**, so nothing about Bank Account Details will be verified in this pass. The rows are not reconciled into one figure deliberately — collapsing them would either hide that Stage 3 did its job, or hide that the run will not exercise it.

## 3. Coverage Matrix

| Requirement | TC-001 … 011 | 012 … 015 | 016 … 021 | 022 … 024 | 025 … 028 | 029 … 032 | 033 … 039 | 040 … 042 | 043 | 044 | 045 … 047 | 048 … 050 | 051 | 052 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| AC-1 | ● | | | | | | | | | | | | | ● |
| AC-2 | | ● | | | | | | | | | | | | |
| AC-3 | | | ● | | | | | | | | | | ● | |
| AC-4 | | | | ● | | | | | | | | | ● | |
| AC-5 | | | | | ● | | | | | | | | | ● |
| AC-6 | | | | | | ● | | | | | | | | |
| AC-7 | | | | | | | ● | | | | | | | |
| AC-8 | | | | | | | | ● | | | | | | ● |
| AC-9 | | | | | | | | | ● | | | | | |
| AC-10 | | | | | | | | | | ● | | | | |
| Expected Outcome | | | | | | | | | | | ● | ● | | |

Full per-case detail is in `TraceabilityMatrix.md` §1; this is the at-a-glance view.

## 4. Business Rules

The Project Context carries no `BR-`prefixed requirement IDs — it enumerates its in-scope surface as US-4222's acceptance-criteria groups, each citing the PRD requirement behind it (see `TraceabilityMatrix.md` header). The **platform-level business rules** that govern this module's behaviour are therefore cited through their PRD identifiers, and each is exercised directly rather than incidentally:

| Business Rule | Source | Test Cases |
|---|---|---|
| Mandatory-field violation renders `Required`, platform-wide | PRD XC-17 `[V]` | TC-AGENCY-002, 013, 021, 027, 034, 046 |
| A governed record is submitted for approval, not published on save | PRD XC-01, XC-04 `[V]` | TC-AGENCY-045 |
| Approve/Reject accept a free-text Remarks entry as the audit reason | PRD XC-03 `[V]` | TC-AGENCY-046, 048, 049 |
| A checker approves or rejects a pending record | PRD XC-02 `[V]` | TC-AGENCY-048, 049, 050 (Blocked) |
| An approver should not approve their own change | PRD XC-06 `[I]` — unproven | TC-AGENCY-048, 050 (Blocked) |
| Cancel must not persist an edit | PRD GEO-09, SUP-10 `[V]` | TC-AGENCY-047 |
| Country is inherited from the Branch and read-only | PRD ORG-05 `[V]`, AC-1 | TC-AGENCY-003 |
| Supplier credentials cascade to Agency level | PRD SUP-05 `[V]` | TC-AGENCY-040 |
| Import PNR must be explicitly enabled per organisation | PRD IPN-05 `[V]` | TC-AGENCY-044 |
| Numeric-only fields reject non-numeric input | PRD XC-20 `[V]` | TC-AGENCY-004, 032, 035 |
| Email validation message | PRD XC-18 `[V]` | TC-AGENCY-014 |
| Phone validation message | PRD XC-19 `[V]` | TC-AGENCY-008 |

## 5. Test Scenarios

**By tier:** 47 Atomic · 5 Scenario · 1 E2E
**By priority:** 19 P1 · 19 P2 · 15 P3 · 0 P4

**By dimension** — Negative Test Generation Engine (§7):

| Category | Cases | Notes |
|---|---|---|
| Empty Values | 8 | TC-AGENCY-002, 013, 021, 027, 031, 034, 037, 046 |
| Invalid Inputs | 10 | TC-AGENCY-004, 005, 008, 009, 014, 015, 019, 024, 032, 035 |
| Boundary Values | 2 | TC-AGENCY-006 (name length), 023 (2 MB logo) |
| Special Characters | 2 | TC-AGENCY-005 asserts they are **rejected** (rewritten 2026-08-01, §11.1); TC-AGENCY-053 asserts the space is **accepted** |
| Unicode | 1 | TC-AGENCY-005 — non-Latin input, now expected to be rejected rather than stored |
| Security Inputs | 2 | TC-AGENCY-007 (injection-shaped input), 020 (extension spoofing) |
| Timeouts | 0 | **Not Applicable** — no timeout condition can be induced from a manual browser session against a shared environment, and no requirement states timeout behaviour for this form |

**By dimension** — Required Dimensions (§17):

| Dimension | Cases / Disposition |
|---|---|
| Positive Scenarios | TC-AGENCY-001, 010, 011, 012, 016, 017, 018, 022, 025, 026, 029, 030, 031, 033, 036, 038, 039, 040, 041, 044, 045, 047, 051, 053 |
| Boundary Testing | TC-AGENCY-006, 023 — evaluated once, shared with §7 rather than duplicated |
| Validation Rules | TC-AGENCY-002, 004, 005, 007, 008, 009, 013, 014, 015, 021, 027, 032, 034, 035, 037, 046, 053 |
| Business Rules | See §4 — every listed rule has at least one case |
| Error Handling | TC-AGENCY-002, 013, 019, 023, 034 — these assert the *message rendered*, not merely that the error triggers |
| Permissions | TC-AGENCY-048, 049, 050 — **Partially Applicable**: the only role boundary US-4222 states is maker vs. approver, and it is Blocked (one identity). No other role boundary is documented in the Project Context |
| Configuration | TC-AGENCY-010, 011, 039, 041, 044 — the agency-level switches the form exposes. **Not Applicable** for global feature flags: the Project Context documents none affecting this form |
| Regression Impact | TC-AGENCY-044 carries the assessment explicitly — disabling Import PNR causes downstream import refusals (PRD IPN-05). Broader impact on the five Reflection areas is Out-of-Scope per Project Context §3 |
| Integration Behaviour | TC-AGENCY-028, 040, 052 — Branch → Agency inheritance and the supplier-credential cascade. Two of the three are Deferred; see §8 |
| Risk-based Prioritization | Applied — every High-risk case in `TraceabilityMatrix.md` §4 carries P1 or P2. No High-risk requirement is left at P3/P4 |
| Exploratory Recommendations | 4 recorded in §10 |

## 6. Manual Test Cases

| Artifact | Path | Cases |
|---|---|---|
| Manual Test Suite (Markdown, authored) | `modules/agency/test_design/TestCases_Agency.md` | 52 |
| Manual Test Suite (Excel, generated) | `modules/agency/test_design/TestCases_Agency.xlsx` | 52 |

**Count reconciliation (§9.1 #6):** the suite document's own Total Test Cases states **53**; `TraceabilityMatrix.md` §1 carries **53** rows; the export tool reported **53 case(s) across 1 module(s)** and exited 0 with no warnings. All three agree. *(52 → 53 on 2026-08-01: TC-AGENCY-053 was added for the Agency Name space question, §11.1. The suite header total and the Case Index are now re-rendered from the case bodies by `cli.js --sync-index`, so a hand-maintained count can no longer drift from them.)*

The workbook was generated by `node platform_core/tools/test_suite_export/cli.js`, never hand-authored. **No flag is needed** — with `agency` the active module, the default call resolves this folder. *(The original export required an explicit `--dir` because the tool's default still targeted the active run's `test_design/`, which the 2026-07-29 module-workspace migration had moved to `modules/{module}/test_design/`. That was platform defect **DREC-T04**, fixed 2026-08-01; the workbook has since been regenerated by the plain default call.)*

This module's suite is one file for one module; no grouping caveat applies.

## 7. Assumptions

Assumption-based cases carried forward from the Project Context, plus the disposition of every Project Context assumption not converted into a case.

| Project Context ID | Statement | Disposition in this suite |
|---|---|---|
| ASM-009 | PDF-only and 2 MB constraints are story-sourced and never verified | **Cases** — TC-AGENCY-019, 020, 023, 024 |
| ASM-012 | Must documents/logo be re-uploaded on every update? | **Case** — TC-AGENCY-051, tagged `Assumption-based` |
| ASM-016 | Does changing Branch overwrite inherited values? | **Case** — TC-AGENCY-052, tagged `Assumption-based`, **Deferred** |
| ASM-004, ASM-015 | Is self-approval prohibited? Which role may approve? | **Cases** — TC-AGENCY-048, 049, 050, **Blocked** pending a second credential |
| ASM-014 | Authoritative Payment Option set unknown | **Bounded case** — TC-AGENCY-036 exercises the five real instruments and deliberately does not assert the full list |
| ASM-018 | Are the story's message strings literal? | **Resolved before this stage** — refuted as framed; the application renders `Required`. Cases assert `Required` |
| ASM-008 | Draft-save discrepancy | **No case** — refuted in Discovery; no draft control exists on either form and no in-scope source requires one |
| ASM-013 | AC-9 table shape ambiguity | **Moot** — the whole section is absent; folded into TC-AGENCY-043 |
| ASM-001, ASM-002, ASM-007, ASM-010 | PRD is reverse-engineered; no PRD requirement for the update flow; no prior field-validation coverage; test data is environment-specific | **Standing context, not testable** — these shape how results are read rather than defining behaviour to verify. ASM-010 is why every case names `AGN2 — Test Egypt` explicitly rather than assuming a record exists |
| ASM-003 | PCC inherited from Supplier & Branch | **Unresolvable here** — the section does not exist; folded into TC-AGENCY-043 |
| ASM-005 | Credit enforcement behaviour unspecified | **No case** — verifying enforcement requires bookings/payments, forbidden on this environment (Project Context §5) |
| ASM-006 | Complete approval matrix unknown | **Partially** — TC-AGENCY-048/049 would establish it for agencies if unblocked |
| ASM-011 | `Cancel` "role update process" wording | **Case** — TC-AGENCY-047 tests the agency behaviour; the wording error is a documentation correction |
| ASM-017 | Are the Reflection areas in scope? | **No case** — Out-of-Scope per Project Context §3 pending DOQ-11 |

## 8. Coverage Gaps

**Uncovered Requirements: 0.** **Uncovered Findings: 0.**

| Item | Category | Reason | Minimal prerequisite to close (§20) |
|---|---|---|---|
| AC-9 — Airline Supplier Credential (PCC), five fields | **Unknown / Unassessed** | The section is absent from both the update and create forms. Two `[V]`-tagged PRD requirements describe it, so disposition row 3 applies: designing to observed behaviour would assert the section was legitimately removed, which nothing establishes | **Answer DOQ-02** — confirm with the product owner whether AC-9 was superseded by Product Access Details or is missing |
| AC-5 — `Designation` field | **Partially Covered** | No surface exists to test; the field is absent from both forms (FINDING-006) | Confirm with the product owner whether `Designation` is expected. TC-AGENCY-026 step 3 closes the one remaining condition (does it appear on an added row?) at no extra cost |
| AC-5 — Branch-inherited Sales Contact defaults | **Partially Covered** | TC-AGENCY-028 is **Deferred** — verifying inheritance requires changing Branch, which may overwrite live values (ASM-016) | A dedicated (non-shared) environment, or an agency created for the purpose |
| AC-7 — authoritative Payment Option set | **Partially Covered** | 23 of 28 rendered options are meaningless data (FINDING-003); the correct set is undefined in both sources | Master-data cleanup on STG, or confirmation of the authoritative option list |
| Expected Outcome — Approve, Reject | **Partially Covered** | TC-AGENCY-048, 049, 050 are designed in full but **Blocked** — one credential exists, so maker and checker cannot be separated (FINDING-007) | **Add a second, non-Super-Admin credential** to `knowledge_base/credentials/credentials.json` |
| `Transfer Pnr Option`, `Blue Command Screen`, `Enable Search Limit` | **Uncovered — deliberately, with reason** | Three later-enhancement switches with **no acceptance criteria in any source**. Designing a case would mean inventing the expected result, which Execution Rule 6 forbids. Toggling them changes live agency behaviour | Confirm intended behaviour for each; then one persistence case each, mirroring TC-AGENCY-011 |
| Contract End Date must follow Contract Start Date | **Uncovered — deliberately, with reason** | A natural boundary rule that **no source states** for this form. PRD RPT-08 has a date-order rule but for Statement reports, not agency contracts | Confirm whether the rule applies here; then one boundary case |
| Timeout behaviour (§7) | **Not Applicable** | No timeout condition can be induced from a manual browser session against a shared environment, and no requirement states timeout behaviour | — |

## 9. Risks

Aggregated from `TraceabilityMatrix.md` §4. **Six High-risk items**, called out explicitly:

| Risk | Cases | Why it is High |
|---|---|---|
| **Contract documents may be storable in any format** | TC-AGENCY-019, 020 | The document input declares no accepted type and a `.png` is already attached to a live agency. These are the run's strongest genuine defect candidates |
| **AC-9's section may be a removed feature, not an outdated story** | TC-AGENCY-043 | Two `[V]`-tagged PRD requirements describe it. Mis-dispositioning this would convert a regression into a documentation correction |
| **Four-eyes governance cannot be verified** | TC-AGENCY-048, 049, 050 | PRD §1.1 lists it as a business objective; one identity makes a genuine segregation failure indistinguishable from correct behaviour |
| **~20 acceptance criteria specify messages the application does not render** | TC-AGENCY-002, 013, 034 | Resolved by the directive — cases assert `Required`. Residual risk is that the story stays uncorrected and misleads a later reader |
| **Live commercial settings are edited on shared staging** | TC-AGENCY-033 | Credit limit, payment options and product access affect what other testers see when they search and book. Restoration after each case is mandatory, not optional |
| **Changing Branch may overwrite existing values** | TC-AGENCY-028, 052 | Both Deferred for exactly this reason — potentially unrecoverable on a live record |

**Medium: 15 cases · Low: remaining.** The standing Medium risk across all mutating cases is shared-environment interference (Project Context RSK-001) — another tester may change `AGN2 — Test Egypt` mid-execution, producing a false failure.

## 10. Recommendations

| ID | Recommendation | Rationale |
|---|---|---|
| DREC-T01 | **Add a second, non-Super-Admin credential before Stage 4M** | Unblocks TC-AGENCY-048, 049, 050 and resolves ASM-004, ASM-015 and PRD OQ-1 in one step. Currently the single largest coverage gap |
| DREC-T02 | **Answer DOQ-02 before executing TC-AGENCY-043** | Executing it now records a failure against a criterion whose status is undecided |
| DREC-T03 | **Record `AGN2 — Test Egypt`'s full pre-edit state before the first mutating case** | 20 cases mutate this record. A single captured baseline makes every restoration step verifiable rather than a matter of memory |
| DREC-T04 | ~~**Update the export tool's default path resolution**~~ — **RESOLVED 2026-08-01** | It resolved `runs/{run}/test_design/`, which the module-workspace migration replaced with `modules/{module}/test_design/`, so the default was wrong for every module suite — a platform defect, not a suite defect. The default now resolves the **active module**, with `--module <slug>` to name one and `--run` retained for historic run folders. 8 regression tests added (48/48 pass); this workbook was regenerated by the plain default call |
| DREC-T05 | Get `Outstanding Threshold`'s valid range and business meaning | Its existence is confirmed; its semantics are not. The observed value is `5` against a credit limit of `1000000`, so it is plainly not a currency amount. A guessed value gives a test that passes while asserting nothing meaningful |
| DREC-T06 | **Exploratory charter — the four undocumented switches** | `Agency Business Type`, `Transfer Pnr Option`, `Blue Command Screen`, `Enable Search Limit`. A time-boxed session to establish what each does, rather than fixed cases that would encode invented expectations |
| DREC-T07 | **Exploratory charter — Payment Option data** | Establish whether the 23 non-payment entries exist outside STG. Decides whether this is staging hygiene or a production data-integrity defect |
| DREC-T08 | **Exploratory charter — contract date relationships** | Start/end ordering, past dates, and overlapping document periods. No source states these rules, so a charter is more honest than fabricated assertions |
| DREC-T09 | **Exploratory charter — `Reaching Percentage` bounds** | The field is numeric with no stated range. Whether values above 100 are accepted is worth knowing before writing a boundary case |
| DREC-T10 | Correct US-4222 once the outstanding questions are answered | The message column, `Submit for Approval` vs `Send For Approval`, the "role update process" wording, and the seven undocumented fields. Otherwise the next reader repeats this run's analysis |

## 11. Review & Automation

*(Section renamed and re-scoped 2026-08-01, and renamed again 2026-08-07 to the canonical umbrella heading `Review & Automation` (`test-design-skill` §18 #11). It was "Automation Candidates" — an advisory list — then "Automation Status", then "Lifecycle Status — Review and Automation". It is a **roll-up of the two binding columns** each test case carries, per `test-design-skill` §6.3. "Lifecycle Status" was dropped because the two decisions are independent and must not read as one combined state.)*

**Roll-up as of the reviewer's completed review, imported 2026-08-02** (`cli.js --import-lifecycle`). The suite is **53** cases:

**Review is complete — no case is `Pending`.** TC-AGENCY-020 was the last, approved by direct reviewer instruction on 2026-08-02.

| Column | Pending | Approved | Rejected |
|---|---|---|---|
| **Review** | **0** | **37** | **16** |
| **Automation** | 4 | **11** | 38 |

| Decision | Count | Cases |
|---|---|---|
| `Review = Approved` — **executable by Stage `4M`** | 37 | 001–003, 008, 011–018, 020–024, 027, 033–037, 039–042, 044–053 |
| `Review = Rejected` — excluded, reason `Rejected at Review` | 16 | 004–007, 009, 010, 019, 025, 026, 028–032, 038, 043 |
| `Review = Approved AND Automation = Approved` — in scope for Stage `4A` | 10 | 001, 002, 020, 021, 022, 040, 047, 050, 052, 053 |

**Inconsistent pairs — 1, awaiting human resolution.** `TC-AGENCY-019` carries `Review: Rejected` with `Automation: Approved`. These are two recorded human decisions that disagree (`test-design-skill` §6.3.4). **Neither value has been changed.** The case is already excluded from Stage `4A` by the gate above — automation requires `Review = Approved` independently — so nothing can be generated from it; and it is excluded from Stage `4M` as `Rejected at Review`. `cli.js --check` reports this on every export (exit `2`) until a human resolves it by setting either column. Context: the case is a deliberate "designed to the requirement, not to observed behaviour" negative case (FINDING-004), which may be why its review was contested while the scenario was still judged worth automating.

**Authorized Coverage: 37 ÷ 53 = 69.8%.** Of those 37, four cannot execute in this run regardless: TC-AGENCY-048, 049, 050 are `Blocked` on a second identity, and TC-AGENCY-052 is `Deferred` as destructive on a shared environment. **The executable count for this pass is therefore 33.**

### 11.2 Authorized coverage per acceptance criterion — two groups fall to zero

| Requirement group | Approved | Rejected | Pending |
|---|---|---|---|
| AC-1 Agency Master | 6 | 6 | 0 |
| AC-2 Agency Owner Details | 4 | 0 | 0 |
| AC-3 Upload Document | **6** | 1 | 0 |
| AC-4 Agency Logo | 3 | 0 | 0 |
| AC-5 Wonder Travel Sales Contact | 1 | 3 | 0 |
| **AC-6 Bank Account Details** | **0** | **4** | 0 |
| AC-7 Payment Settings | 6 | 1 | 0 |
| AC-8 Product Access Details | 3 | 0 | 0 |
| **AC-9 Airline Supplier Credential (PCC)** | **0** | **1** | 0 |
| AC-10 Import PNR Option | 1 | 0 | 0 |
| Expected Outcomes (Submit/Cancel/Approve/Reject) | 6 | 0 | 0 |

**AC-6 has no executable coverage at all.** All four of its cases — TC-AGENCY-029, 030, 031, 032 — were rejected, so this Stage `4M` pass will verify **nothing** about Bank Account Details.

> **Reviewer decision, 2026-08-02 — accepted, not overlooked.** The reviewer was shown that AC-6 falls to zero and chose to proceed without re-authoring the four cases *("سيبها دلوقتي" — leave it for now)*. **AC-6 is therefore deliberately unverified in this run.**
>
> Recorded here because a deliberate omission and an accidental one are indistinguishable in a results table, and only this note tells them apart. It carries three obligations, and none of them is optional:
>
> 1. **The Manual QA Report must state that AC-6 was not verified in this pass, and why** (`manual-execution-skill` §10 #6, Known Limitations) — a report that simply omits AC-6 would read as though the criterion does not exist.
> 2. **Requirement coverage must not count AC-6 as covered.** §2 records it `Covered` by *design* — four cases exist — but zero of them are authorized to run, and the two figures must not be conflated. Design coverage and authorized coverage are different measurements.
> 3. **This does not close AC-6.** It defers it. Re-authoring the four cases, or approving them as written, remains open work for a later revision of this suite.

**AC-9 was already `Unknown / Unassessed`** — TC-AGENCY-043 was `Blocked` pending DOQ-02, and rejecting it changes the reason, not the outcome. No coverage is lost that the run had.

**AC-5 retains one case of four.** TC-AGENCY-027 (mandatory-field validation) survives; the positive path, the multiple-contact case, and the inheritance case do not. AC-5 was already `Partially Covered` by design; it is now thinner than that label suggests.

**One of the two upload-security cases survives, and that is enough to move FINDING-004 — but only halfway.** TC-AGENCY-019 (non-PDF rejected) is `Rejected`; TC-AGENCY-020 (a `.pdf`-named file with non-PDF content) is **approved**. Both are `P1, Regression` and both derive from FINDING-004, whose status turns on the single untested question: does the form *accept* a non-PDF on submit? TC-AGENCY-020 answers whether a **content** check exists. It cannot answer whether validation is **extension-only**, because that comparison needed TC-AGENCY-019 beside it. So FINDING-004 can be advanced by this run but **not fully closed**, and the result must say which half was established.

### 11.3 One contradictory marking remains

| Case | `Review` | `Automation` | Why it is flagged |
|---|---|---|---|
| ~~TC-AGENCY-020~~ | `Approved` | `Approved` | **Resolved 2026-08-02** — approved by direct reviewer instruction. Now consistently marked and in scope for both branches |
| **TC-AGENCY-019** | `Rejected` | `Approved` | A case rejected as a test case is nonetheless marked for automation — the two decisions disagree |

**Neither is dangerous, because the gate holds in both directions.** Stage `4A` requires `Review = Approved AND Automation = Approved`, so both are out of automation scope regardless of their `Automation` value (`test-design-skill` §6.3.2), and Stage `4M` excludes both on `Review` alone. They are reported because a contradiction that changes nothing today still records an intent nobody can act on later.

**TC-AGENCY-005 was rejected on 2026-08-01, rewritten, and reset to `Pending` per §6.3.1** — and has since been reviewed again and `Rejected` on its new text. That is a settled decision on the current wording, not a stale verdict.

### 11.1 Discrepancy — the Agency Name character set

*(Raised 2026-08-01 from a reviewer report, mid-review.)*

| | |
|---|---|
| **Reported behaviour** | The `Agency` field accepts **letters, digits and underscore only** |
| **US-4222 AC-1 states** | Agency Name — *"Special characters allowed"* |
| **PRD** | **Silent** — no character rule for this field anywhere |
| **Discovery** | Never exercised it. `AgencyUpdateForm.md` §4 records the field exists and is mandatory, nothing about accepted characters |
| **Evidence category** | `[O]` **Observed — reviewer-reported.** Not captured by the platform, not reproduced by Discovery |
| **Disposition** | **`Story Outdated / Requires Business Confirmation`** — Project Context §1.1 **row 2** |

**Why row 2 and not row 3.** §1.1 row 3 — *PRD corroborates the story* — would make this a **Possible Application Defect** that must be escalated, never auto-dispositioned as outdated. That row does not apply, and the check is not a formality: the PRD was searched for any Agency Name character rule and has none. With the PRD silent, row 2 governs: design to observed behaviour, label it, and do not treat the application as wrong.

**What it changed.** TC-AGENCY-005 was inverted from "accepts special characters and Unicode" to "rejects characters outside letters, digits and underscore". TC-AGENCY-007 (injection-shaped input) changed its expected result from *stored as literal text* to *refused at input* — every character that makes that payload dangerous is outside the reported set, so the payload should never be stored at all. That is a **stronger** security outcome, which is why the case was rewritten rather than dropped.

**What still needs confirming, and it is not cosmetic.** TC-AGENCY-053 was added at **P1** because a literal reading of the reported rule excludes the **space** — yet the test agency's own stored name, `Test Egypt`, contains one. Either the space is in the allowed set and the rule is "letters, digits, underscore and space", or every agency whose name contains a space cannot be resubmitted without being renamed first. The second reading would be a high-severity defect across the existing data set, so the question is settled by execution, not by assumption.

**Open question for the product owner:** was AC-1's "Special characters allowed" superseded deliberately (a tightening), or has the field's validation drifted from the requirement? Row 2 records the behaviour without answering that, which is exactly what the disposition is for.

**Both columns are `Pending` until a human changes them.** Stage 3 always writes `Pending`; **no skill may change either value** (§6.3.1). The four decisions above were made by the reviewer in the workbook and moved into the Markdown by the import tool, which is the only sanctioned path.

**What changed and why.** This section previously flagged 22 cases as advisory automation candidates via an `AutomationCandidate` tag. Both the tag and the advisory list are **retired**: an advisory hint sitting beside a binding column can disagree with it, leaving a reader no way to tell which governs. There is now one authoritative automation decision per case, recorded on the case.

**The engineering judgment behind that former list is not lost** — it is the input a reviewer should use when setting the `Automation` column, so it is preserved here as guidance rather than as a decision:

- **Well suited to automation** — deterministic field-level input and validation cases with a single observable assertion, no file handling, no judgment call, no second identity: TC-AGENCY-001, 002, 003, 004, 005, 008, 010, 012, 013, 014, 025, 027, 029, 031, 033, 034, 035, 036, 041, 044, 045, 046, 047.
- **Poorly suited, and why** — the upload cases (TC-AGENCY-016 … 024) need real fixtures and OS-level file dialogs; the Blocked and Deferred cases (TC-AGENCY-028, 043, 048, 049, 050, 052) cannot execute at all yet; and the exploratory-disposition cases (TC-AGENCY-036's option list, TC-AGENCY-043) turn on human judgment a fixed assertion would misrepresent.

**Stage `4M` consumes the `Review` column** (not this section, and never the `Automation` column) — it executes a case only when `Review = Approved` and records every other case as `Excluded` with its reason (`manual-execution-skill` §4.1).

## 12. Inputs for Manual Execution skill

**Both branches consume this stage's output independently.** This section confirms the handoff for each.

| Stage `4M` needs | Satisfied by | Status |
|---|---|---|
| Project Context (governing) | `modules/agency/context/ProjectContext.md` rev 2, `Approved` — read directly, unmodified by this stage | ✅ |
| Manual Test Suite (primary) | `TestCases_Agency.md` + `.xlsx`, 53 cases, parsed clean | ✅ |
| Requirement Traceability Matrix (secondary) | `TraceabilityMatrix.md` — 52 rows, all six reference dimensions populated per §5.1/§5.4 rules | ✅ |
| Coverage Report (secondary) | This document — §8 states what Stage 4M should **not** attempt | ✅ |
| Discovery Artifacts (secondary) | Not produced here. Every Discovery Reference cites a specific artifact **and section** (e.g. `AgencyUpdateForm.md` §5), never "see Discovery" | ✅ |
| Findings (secondary) | Not produced here. All 7 dispositioned in `TraceabilityMatrix.md` §3 — 3 regression, 2 exploratory, 2 documented exception. Zero Uncovered | ✅ |
| Evidence Packages (secondary) | Not produced here. Every Evidence Reference cites specific file(s), never a Finding as a whole | ✅ |

**Stage 4M must know four things before it starts:**

1. **Six cases cannot execute** and must be recorded `Blocked` or `Deferred`, never `Failed`: TC-AGENCY-043 (pending DOQ-02), TC-AGENCY-048, 049, 050 (second credential), TC-AGENCY-028, 052 (deferred — destructive).
2. **Expected results follow observed behaviour, not the story**, wherever the disposition says the story is outdated. A cleared mandatory field must render `Required` — a per-field message appearing instead is a finding to report, not a pass.
3. **TC-AGENCY-019 is expected to fail.** It asserts the requirement (PDF-only) against an application that appears not to enforce it. That failure is the intended outcome and the run's strongest defect candidate — it must not be "corrected" into a pass.
4. **Restoration is part of every mutating case.** 20 cases change a live agency on a shared environment; each names the values to record and restore.

**Fixtures required and already prepared:** eight files in the session fixture folder (`fixtures/us-4222/` with `FIXTURES.md`) — three valid PDFs, a valid 0.27 MB logo, a 3.46 MB oversize logo, and three wrong-format/extension-spoofing files.

**Handoff confirmation:** every input `manual-execution-skill` §4 declares is present and specific. Every Discovery, Finding and Evidence Reference names a concrete artifact and location. **One item is not resolved and is declared rather than assumed:** TC-AGENCY-043's expected result depends on DOQ-02, which is why the case is Blocked rather than carrying a fabricated assertion.
