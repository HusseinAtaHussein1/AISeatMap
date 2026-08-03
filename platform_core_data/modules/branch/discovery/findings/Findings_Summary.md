# Findings Summary — run-002__2026-08-03_10-26-17__UserStory__US-8605CreateBranch

| Field | Value |
|---|---|
| Run Folder | `run-002__2026-08-03_10-26-17__UserStory__US-8605CreateBranch` |
| Total Findings | 11 |
| Generated | 2026-08-03 |

## Index

| ID | Title | Category | Severity | Confidence | Status | Occurrences | Module | Description (one line) |
|---|---|---|---|---|---|---|---|---|
| FINDING-001 | Payment Option checkbox group contains ~25 non-payment-method entries | Observation | N/A | 95% | Rejected | 1 | branch | Confirmed intended: reflects Payment Gateway module's Active records live, not a Branch defect. |
| FINDING-002 | Post Office Box field has no 8-character max-length enforcement | Bug | Medium | 90% | Confirmed | 1 | branch | 12-character input accepted with no truncation or error, vs. AC's 8-char max. |
| FINDING-003 | Credit Limit field has no 15-digit max-length enforcement | Bug | Medium | 90% | Confirmed | 1 | branch | 16-digit input accepted with no truncation or error, vs. AC's 15-char max. |
| FINDING-004 | Warning Prompt (Days) field has no 11-digit max-length enforcement | Bug | Medium | 88% | Confirmed | 1 | branch | 14-digit input accepted with no truncation or error, vs. AC's 11-digit max. |
| FINDING-005 | Import PNR checkbox is unchecked by default on a fresh Create Branch form | Requirement Gap | N/A | 96% | Rejected | 1 | branch | Confirmed intended feature; US 8605's "always checked" wording is outdated. |
| FINDING-006 | "Flight" Product Access checkbox is user-editable rather than backend-only | Requirement Gap | N/A | 93% | Rejected | 1 | branch | Outdated Requirement — US 8605 predates current behavior, per module owner. |
| FINDING-007 | No Payment Gateway dropdown appears when Credit Card payment option is selected | Requirement Gap | N/A | 92% | Rejected | 1 | branch | Outdated Requirement — US 8605 predates current behavior, per module owner. |
| FINDING-008 | "PAN Number" field absent from the live Create Branch screen | Requirement Gap | N/A | 95% | Rejected | 1 | branch | Ignored per module-owner direction (US 8605 outdated). |
| FINDING-009 | Mandatory "Department" multi-select absent from Branch Contact Info | Requirement Gap | N/A | 95% | Rejected | 1 | branch | Ignored per module-owner direction (US 8605 outdated). |
| FINDING-010 | "Outstanding Threshold" field traces to US 51489's "Child Agencies Threshold Amount" | Observation | N/A | 97% | Rejected | 1 | branch | Expected Implementation / Requirement Traceability — confirmed match to US 51489 §2, not a defect. |
| FINDING-011 | Submit button reads "Send For Approval" instead of the AC's "Submit for Approval" | Bug | Low | 95% | Confirmed | 1 | branch | Cosmetic label mismatch on the primary submit action. |

## Breakdown

**By Severity:** 0 Critical · 0 High · 3 Medium · 1 Low · 7 N/A

**By Category:** 4 Bug · 5 Requirement Gap · 2 Observation

**By Status:** 4 Confirmed · 0 Needs Human Review · 7 Rejected

**By Module:** 11 branch

**Note (2026-08-03):** Statuses/Categories for FINDING-001 and FINDING-005 through FINDING-010 were updated after module-owner review of this run's Discovery output — see each Finding's "Human Review Update" note and `ProjectContext.md` §6 for the dispositions and their basis. FINDING-010 is now fully closed: the module owner confirmed "Outstanding Threshold" = US 51489's "Child Agencies Threshold Amount," reclassified to Observation/Rejected with disposition **Expected Implementation / Requirement Traceability** — not an application defect. Every Finding in this run's set now has a settled disposition; none remain `Needs Human Review`.

## Evidence Packages

| Finding ID | Evidence Package | Evidence Files |
|---|---|---|
| FINDING-001 | `findings/FINDING-001_PaymentOptionListPollution/` | 2 |
| FINDING-002 | `findings/FINDING-002_PostOfficeBoxNoMaxLength/` | 1 |
| FINDING-003 | `findings/FINDING-003_CreditLimitNoMaxLength/` | 1 |
| FINDING-004 | `findings/FINDING-004_WarningPromptNoMaxLength/` | 1 |
| FINDING-005 | `findings/FINDING-005_ImportPnrDefaultUnchecked/` | 1 |
| FINDING-006 | `findings/FINDING-006_FlightCheckboxEditable/` | 1 |
| FINDING-007 | `findings/FINDING-007_NoPaymentGatewayOnCreditCard/` | 1 |
| FINDING-008 | `findings/FINDING-008_PanNumberFieldAbsent/` | 1 |
| FINDING-009 | `findings/FINDING-009_DepartmentFieldAbsent/` | 1 |
| FINDING-010 | `findings/FINDING-010_UndocumentedOutstandingThreshold/` | 1 |
| FINDING-011 | `findings/FINDING-011_SubmitButtonLabelMismatch/` | 1 |
