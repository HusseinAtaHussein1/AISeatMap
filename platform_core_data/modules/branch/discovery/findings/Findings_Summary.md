# Findings Summary — module `branch`

| Field | Value |
|---|---|
| Module | `branch` |
| Runs contributing | `run-002__2026-08-03…US-8605CreateBranch` (FINDING-001…011) · `run-003__2026-08-04…US-8599-SearchActions_US-8606-UpdateBranch` (FINDING-012…015, plus occurrence-2 appends) |
| Total Findings | 15 |
| Last updated | 2026-08-04 |

> **Durable, edited in place.** This index spans every run that has explored this module. run-003 appended four new Findings and recorded a second occurrence against five existing ones rather than re-raising them (§5.9).

## Index

| ID | Title | Category | Severity | Confidence | Status | Occ. | Module | Description (one line) |
|---|---|---|---|---|---|---|---|---|
| FINDING-001 | Payment Option checkbox group contains ~25 non-payment-method entries | Observation | N/A | 95% | Rejected | **2** | branch | Confirmed intended cross-module reflection of Payment Gateway Active records. Re-observed on Update, now ~29 entries. |
| FINDING-002 | Post Office Box field has no 8-character max-length enforcement | Bug | Medium | 90% | Confirmed | 1 | branch | 12-character input accepted with no truncation or error, vs. AC's 8-char max. |
| FINDING-003 | Credit Limit field has no 15-digit max-length enforcement | Bug | Medium | 90% | Confirmed | 1 | branch | 16-digit input accepted with no truncation or error, vs. AC's 15-char max. |
| FINDING-004 | Warning Prompt (Days) field has no 11-digit max-length enforcement | Bug | Medium | 88% | Confirmed | 1 | branch | 14-digit input accepted with no truncation or error, vs. AC's 11-digit max. |
| FINDING-005 | Import PNR checkbox is unchecked by default on a fresh Create Branch form | Requirement Gap | N/A | 96% | Rejected | 1 | branch | Confirmed intended feature; US 8605's "always checked" wording is outdated. |
| FINDING-006 | "Flight" Product Access checkbox is user-editable rather than backend-only | Requirement Gap | N/A | 93% | Rejected | 1 | branch | Outdated Requirement — US 8605 predates current behavior, per module owner. |
| FINDING-007 | No Payment Gateway dropdown appears when Credit Card payment option is selected | Requirement Gap | N/A | 92% | Rejected | **2** | branch | Outdated Requirement. **Re-confirmed on Update with Credit Card already saved-checked — disposition extends (RISK-BR-5).** |
| FINDING-008 | "PAN Number" field absent from the live Create Branch screen | Requirement Gap | N/A | 95% | Rejected | **2** | branch | Ignored per module-owner direction. **Confirmed equally absent on Update — disposition extends (RISK-BR-5).** |
| FINDING-009 | Mandatory "Department" multi-select absent from Branch Contact Info | Requirement Gap | N/A | 95% | Rejected | **2** | branch | Ignored per module-owner direction. **Confirmed equally absent on Update — disposition extends (RISK-BR-5).** |
| FINDING-010 | "Outstanding Threshold" field traces to US 51489's "Child Agencies Threshold Amount" | Observation | N/A | 97% | Rejected | 1 | branch | Expected Implementation / Requirement Traceability — not a defect. Field re-seen populated on Update. |
| FINDING-011 | Submit button reads "Send For Approval" instead of the AC's "Submit for Approval" | Bug | Low | 95% | Confirmed | **2** | branch | Cosmetic label mismatch. **Now confirmed on both Create and Update screens, against both US 8605 and US 8606.** |
| **FINDING-012** | **"State" column is absent from the Search Branch results grid** | **Bug** | **Medium** | **97%** | **Confirmed** | 1 | branch | US 8599 enumerates 7 grid columns; 6 render. State is genuinely absent, not responsive-hidden. |
| **FINDING-013** | **Stored Branch Email Password is returned to the browser and pre-filled into the Update form** | **Security Concern** | **High** | **95%** | **Confirmed** | 1 | branch | Masked on screen but present in the DOM; recoverable by any operator who can open the edit screen. |
| **FINDING-014** | **Records are filterable by Active/Inactive status, but that status is never displayed in the grid** | **Requirement Gap** | **N/A** | **96%** | **Needs Human Review** | 1 | branch | `Both` returns 616 mixed records with no column distinguishing Active from Inactive. Bears on RISK-BR-8. |
| **FINDING-015** | **City search filter is a multi-select, where the AC specifies a dropdown** | **Requirement Gap** | **N/A** | **94%** | **Needs Human Review** | 1 | branch | Cascade dependency behaves as specified; only the control's cardinality diverges. |

## Breakdown

**By Severity:** 0 Critical · **1 High** · 3 Medium · 1 Low · 10 N/A

**By Category:** 5 Bug · 7 Requirement Gap · 2 Observation · **1 Security Concern**

**By Status:** 6 Confirmed · **2 Needs Human Review** · 7 Rejected

**By Module:** 15 branch

**Note (2026-08-03):** Statuses/Categories for FINDING-001 and FINDING-005 through FINDING-010 were updated after module-owner review of run-002's Discovery output — see each Finding's "Human Review Update" note and `ProjectContext.md` §6 for the dispositions and their basis.

**Note (2026-08-04, run-003):** Four new Findings were added (FINDING-012…015) and five existing ones gained a second occurrence. The occurrence appends are the substantive answer to `ProjectContext.md` **RISK-BR-5** — whether the module owner's Create-screen dispositions extend to the Update screen. For PAN Number, Department and Payment-Gateway-on-Credit-Card they **do**, on direct evidence. For Import PNR the comparison **does not transfer**, because Update shows a saved record's stored value rather than a form default; that is recorded as not-comparable rather than forced into an answer. **Two Findings now sit at `Needs Human Review`** — the module's first open dispositions since run-002 closed.

## Candidates investigated and NOT published as Findings

Recorded here because a rejected candidate is a result, not an absence of one.

| Candidate | Outcome | Why |
|---|---|---|
| Update Branch form appears not to pre-fill State, City, Name, Post Office Box, Credit Limit or Email Password | **Rejected — false read** | A fixed-delay sample caught the page mid-render. Polling across two fresh navigations and a hard reload showed **10/10 fields populated within 500ms** and stable. Would have been published as a high-severity defect had it been taken from the first symptom. See `DiscoverySnapshot_UpdateBranch.md` §4. |
| Search form appears to be missing the Country, State, City and Status filters | **Rejected — false read** | A native-element scan (`input`/`select`) under-reported PrimeNG widgets. A widget-aware probe found all six specified controls present and behaving correctly. See `DiscoverySnapshot_SearchBranch.md` §3. |
| Browser navigation to the login page timed out repeatedly | **Rejected — not an application condition** | Raw HTTP probes returned `200` in ~50–850ms across five consecutive attempts. The environment was healthy; the timeout was local tooling. No Finding raised against the application. |

## Evidence Packages

| Finding ID | Evidence Package | Occurrences |
|---|---|---|
| FINDING-001 | `findings/FINDING-001_PaymentOptionListPollution/` | 2 |
| FINDING-002 | `findings/FINDING-002_PostOfficeBoxNoMaxLength/` | 1 |
| FINDING-003 | `findings/FINDING-003_CreditLimitNoMaxLength/` | 1 |
| FINDING-004 | `findings/FINDING-004_WarningPromptNoMaxLength/` | 1 |
| FINDING-005 | `findings/FINDING-005_ImportPnrDefaultUnchecked/` | 1 |
| FINDING-006 | `findings/FINDING-006_FlightCheckboxEditable/` | 1 |
| FINDING-007 | `findings/FINDING-007_NoPaymentGatewayOnCreditCard/` | 2 |
| FINDING-008 | `findings/FINDING-008_PanNumberFieldAbsent/` | 2 |
| FINDING-009 | `findings/FINDING-009_DepartmentFieldAbsent/` | 2 |
| FINDING-010 | `findings/FINDING-010_UndocumentedOutstandingThreshold/` | 1 |
| FINDING-011 | `findings/FINDING-011_SubmitButtonLabelMismatch/` | 2 |
| **FINDING-012** | `findings/FINDING-012_StateColumnMissingFromGrid/` — `failure.png`, `full_page.png` | 1 |
| **FINDING-013** | `findings/FINDING-013_BranchEmailPasswordExposedToClient/` — `failure.png` (credential value deliberately excluded from all evidence) | 1 |
| **FINDING-014** | `findings/FINDING-014_ActiveInactiveStatusNotDisplayed/` — `failure.png` | 1 |
| **FINDING-015** | `findings/FINDING-015_CityFilterIsMultiSelect/` — `failure.png`, `after.png` | 1 |
