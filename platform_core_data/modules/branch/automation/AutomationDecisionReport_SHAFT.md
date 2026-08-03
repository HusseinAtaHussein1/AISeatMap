# Automation Decision Report — SHAFT — run-002__2026-08-03_10-26-17__UserStory__US-8605CreateBranch

| Field | Value |
|---|---|
| Module | `branch` |
| Produced by run | `run-002__2026-08-03_10-26-17__UserStory__US-8605CreateBranch` |
| Revision | 1 |
| Framework | SHAFT Engine |
| Scope source | `modules/branch/test_design/TestCases_Branch.md` (Approved), narrowed to `Review = Approved AND Automation = Approved` |
| Candidates decided | 13 of 13 |
| Generated | 2026-08-03 |

## 1. Decision Totals

| Decision | Count |
|---|---|
| Reuse Existing Automation | 0 |
| Generate New Automation | 13 |
| Partially Automatable | 0 |
| Manual Only | 0 |
| **Total decided** | 13 |

## 2. Per-Test-Case Decisions

### TC-BR-001 — Create Branch with all mandatory Branch Details fields

| Field | Value |
|---|---|
| **Decision** | Generate New Automation |
| **Justification** | No existing automation project; live-verified this run's own Stage 4M pass confirmed the full happy-path submission succeeds with the `EgyptUAT`/`Cairo`/`Cairo` location cascade, one Payment Option, and one non-GDS Product Access row selected |
| **Reused Assets** | None |
| **Generated Assets** | `AddBranchPage.java`, `LoginPage.java`, `BaseTest.java`, `BranchTestData.java`, `BranchDataFactory.java`, `CreateBranchTests.tcBr001_createBranchWithAllMandatoryFields` |
| **Automation Readiness** | Ready — compiles cleanly (`mvn test-compile`, 0 errors) |
| **Known Limitations** | Assumes the `EgyptUAT`/`Cairo`/`Cairo` STG master-data record remains valid (Automation Plan ASM-AUTO-2) |

**Traceability:**

| Requirement Ref | Discovery Ref | Finding Ref | Evidence Ref |
|---|---|---|---|
| PRD_UserStories.md US 5 §Branch Details | discovery/DiscoverySnapshot_CreateBranch.md §3-4 | N/A | N/A |

### TC-BR-002 — Mandatory Branch Details fields block submission when empty

| Field | Value |
|---|---|
| **Decision** | Generate New Automation |
| **Justification** | Parameterized across 7 fields via `fillMandatoryBaseline`'s skip set, per §14.1 Parameterization — no existing asset |
| **Reused Assets** | None |
| **Generated Assets** | `CreateBranchTests.tcBr002_mandatoryBranchDetailsFieldsBlockSubmissionWhenEmpty` (reuses `AddBranchPage.fillMandatoryBaseline`) |
| **Automation Readiness** | Ready |
| **Known Limitations** | None beyond ASM-AUTO-2 |

**Traceability:**

| Requirement Ref | Discovery Ref | Finding Ref | Evidence Ref |
|---|---|---|---|
| PRD_UserStories.md US 5 §Branch Details | discovery/DiscoverySnapshot_CreateBranch.md §4 | N/A | N/A |

### TC-BR-004 — Country field auto-fills based on selected Operating Country

| Field | Value |
|---|---|
| **Decision** | Generate New Automation |
| **Justification** | Discovery's OQ-BR-1 was resolved this run's own Stage 4M pass (Country confirmed "Egypt"); the assertion is directly automatable |
| **Reused Assets** | None |
| **Generated Assets** | `AddBranchPage.assertCountryEquals`, `CreateBranchTests.tcBr004_countryAutoFillsFromOperatingCountry` |
| **Automation Readiness** | Ready |
| **Known Limitations** | None |

**Traceability:**

| Requirement Ref | Discovery Ref | Finding Ref | Evidence Ref |
|---|---|---|---|
| PRD_UserStories.md US 5 §Branch Details | OQ-BR-1 (resolved via this run's Stage 4M execution, see manual_execution/artifacts/TC-BR-004.png) | N/A | N/A |

### TC-BR-013 — Mandatory Branch Email Configuration fields block submission when empty

| Field | Value |
|---|---|
| **Decision** | Generate New Automation |
| **Justification** | Same parameterized pattern as TC-BR-002, scoped to 2 fields |
| **Reused Assets** | `AddBranchPage.fillMandatoryBaseline` |
| **Generated Assets** | `CreateBranchTests.tcBr013_mandatoryEmailConfigFieldsBlockSubmissionWhenEmpty` |
| **Automation Readiness** | Ready |
| **Known Limitations** | None |

**Traceability:**

| Requirement Ref | Discovery Ref | Finding Ref | Evidence Ref |
|---|---|---|---|
| PRD_UserStories.md US 5 §Branch Email Configuration | "Not independently verified in Discovery" | N/A | N/A |

### TC-BR-021 — Mandatory Branch Sales Configuration fields block submission when empty

| Field | Value |
|---|---|
| **Decision** | Generate New Automation |
| **Justification** | Same parameterized pattern, scoped to 3 fields |
| **Reused Assets** | `AddBranchPage.fillMandatoryBaseline` |
| **Generated Assets** | `CreateBranchTests.tcBr021_mandatorySalesConfigFieldsBlockSubmissionWhenEmpty` |
| **Automation Readiness** | Ready |
| **Known Limitations** | None |

**Traceability:**

| Requirement Ref | Discovery Ref | Finding Ref | Evidence Ref |
|---|---|---|---|
| PRD_UserStories.md US 5 §Branch Sales Configuration | "Not independently verified in Discovery" | N/A | N/A |

### TC-BR-024 — Reaching Percentage rejects a value greater than 100%

| Field | Value |
|---|---|
| **Decision** | Generate New Automation |
| **Justification** | Confirmed Behaviour in Discovery; formalizes a repeatable regression check |
| **Reused Assets** | None |
| **Generated Assets** | `AddBranchPage.assertReachingPercentageCapMessageShown`, `CreateBranchTests.tcBr024_reachingPercentageRejectsValueGreaterThan100` |
| **Automation Readiness** | Ready |
| **Known Limitations** | Message-text assertion is a literal substring match — a copy change to the validation message would break this test, which is the correct/intended sensitivity for a regression check |

**Traceability:**

| Requirement Ref | Discovery Ref | Finding Ref | Evidence Ref |
|---|---|---|---|
| PRD_UserStories.md US 5 §Branch Sales Configuration | discovery/QA_Assessment_Report.md §6 Confirmed Behaviour | N/A | N/A |

### TC-BR-025 — Reaching Percentage accepts a value with up to 3 decimal places

| Field | Value |
|---|---|
| **Decision** | Generate New Automation |
| **Justification** | Directly automatable field-retention check |
| **Reused Assets** | None |
| **Generated Assets** | `AddBranchPage.assertReachingPercentageValueEquals`, `CreateBranchTests.tcBr025_reachingPercentageAcceptsThreeDecimalPlaces` |
| **Automation Readiness** | Ready |
| **Known Limitations** | None |

**Traceability:**

| Requirement Ref | Discovery Ref | Finding Ref | Evidence Ref |
|---|---|---|---|
| PRD_UserStories.md US 5 §Branch Sales Configuration | "Not independently verified in Discovery" | N/A | N/A |

### TC-BR-026 — Warning Prompt (Days) rejects a value exceeding 11 digits

| Field | Value |
|---|---|
| **Decision** | Generate New Automation |
| **Justification** | Regression test for FINDING-004; asserts the corrected behavior per §13's guidance for Finding-backed regression cases, even though it is known to fail against the current, still-open defect |
| **Reused Assets** | None |
| **Generated Assets** | `AddBranchPage.assertWarningPromptCappedAt11DigitsOrMessageShown`, `CreateBranchTests.tcBr026_warningPromptRejectsValueExceeding11Digits` |
| **Automation Readiness** | Ready — compiles and runs; **will report Failed against the live application until FINDING-004 is fixed** (AutomationPlan_SHAFT.md RISK-AUTO-2). This is disclosed, expected behavior, not a blocked/broken script. |
| **Known Limitations** | Will fail until FINDING-004 is fixed (by design) |

**Traceability:**

| Requirement Ref | Discovery Ref | Finding Ref | Evidence Ref |
|---|---|---|---|
| PRD_UserStories.md US 5 §Branch Sales Configuration | discovery/findings/FINDING-004_WarningPromptNoMaxLength/metadata.md | FINDING-004 | discovery/findings/FINDING-004_WarningPromptNoMaxLength/failure.png |

### TC-BR-028 — Select at least one Payment Option

| Field | Value |
|---|---|
| **Decision** | Generate New Automation |
| **Justification** | Checkbox-retention check only; deliberately does not assert on the full Payment Option list contents (that list mirrors the Payment Gateway module's Active records — FINDING-001, documented exception — not a Branch-side rule) |
| **Reused Assets** | None |
| **Generated Assets** | `AddBranchPage.checkPaymentOptionCash`, `AddBranchPage.assertPaymentOptionCashChecked`, `CreateBranchTests.tcBr028_selectAtLeastOnePaymentOption` |
| **Automation Readiness** | Ready |
| **Known Limitations** | Hardcodes "Cash" as a stable, always-present option (Automation Plan RISK-AUTO-3) — locator is scoped by the checkbox's own `id`, not position, so a list reorder does not break it |

**Traceability:**

| Requirement Ref | Discovery Ref | Finding Ref | Evidence Ref |
|---|---|---|---|
| PRD_UserStories.md US 5 §Branch Sales Configuration | discovery/findings/FINDING-001_PaymentOptionListPollution/metadata.md | FINDING-001 | discovery/findings/FINDING-001_PaymentOptionListPollution/failure.png |

### TC-BR-030 — Description field is enabled only when a Supplier row is selected

| Field | Value |
|---|---|
| **Decision** | Generate New Automation |
| **Justification** | Directly automatable enable/disable state check |
| **Reused Assets** | None |
| **Generated Assets** | `AddBranchPage.assertFirstSupplierDescriptionDisabled`, `AddBranchPage.assertFirstSupplierDescriptionEnabled`, `CreateBranchTests.tcBr030_descriptionEnabledOnlyWhenSupplierRowSelected` |
| **Automation Readiness** | Ready |
| **Known Limitations** | Scoped to the first Product Access row by position, not by a specific supplier name — sufficient for this test case, which does not depend on which supplier is first |

**Traceability:**

| Requirement Ref | Discovery Ref | Finding Ref | Evidence Ref |
|---|---|---|---|
| PRD_UserStories.md US 5 §Product Access Details | "Not independently verified in Discovery" | N/A | N/A |

### TC-BR-037 — Create Branch with a valid Child Agencies Threshold Amount value

| Field | Value |
|---|---|
| **Decision** | Generate New Automation |
| **Justification** | Field-retention check; field traced to US 51489 via FINDING-010, not US 8605 |
| **Reused Assets** | None |
| **Generated Assets** | `AddBranchPage.assertOutstandingThresholdValueEquals`, `CreateBranchTests.tcBr037_createBranchWithValidOutstandingThreshold` |
| **Automation Readiness** | Ready |
| **Known Limitations** | None |

**Traceability:**

| Requirement Ref | Discovery Ref | Finding Ref | Evidence Ref |
|---|---|---|---|
| PRD_UserStories.md US 6 §2 Branch Module | discovery/findings/FINDING-010_UndocumentedOutstandingThreshold/metadata.md | FINDING-010 | discovery/findings/FINDING-010_UndocumentedOutstandingThreshold/failure.png |

### TC-BR-038 — Child Agencies Threshold Amount blocks submission when empty

| Field | Value |
|---|---|
| **Decision** | Generate New Automation |
| **Justification** | Directly automatable, despite being an Assumption-Based test case (Mandatory/Optional not stated by US 51489) — the assumption itself (Mandatory, per the live UI's asterisk) is what this test asserts, and that is a legitimate, codifiable assertion, not an invented one |
| **Reused Assets** | `AddBranchPage.fillMandatoryBaseline` |
| **Generated Assets** | `CreateBranchTests.tcBr038_outstandingThresholdBlocksSubmissionWhenEmpty` |
| **Automation Readiness** | Ready |
| **Known Limitations** | If the assumption is ever refuted (i.e., the field turns out to be genuinely Optional), this test would need to be revised at Test Design's level first — this skill does not modify an approved test case (Execution Rule 15) |

**Traceability:**

| Requirement Ref | Discovery Ref | Finding Ref | Evidence Ref |
|---|---|---|---|
| PRD_UserStories.md US 6 §2 Branch Module | discovery/findings/FINDING-010_UndocumentedOutstandingThreshold/metadata.md | FINDING-010 | discovery/findings/FINDING-010_UndocumentedOutstandingThreshold/failure.png |

### TC-BR-039 — Child Agencies Threshold Amount accepts a numeric value

| Field | Value |
|---|---|
| **Decision** | Generate New Automation |
| **Justification** | Field-retention check |
| **Reused Assets** | None |
| **Generated Assets** | `CreateBranchTests.tcBr039_outstandingThresholdAcceptsNumericValue` (reuses `AddBranchPage.assertOutstandingThresholdValueEquals`) |
| **Automation Readiness** | Ready |
| **Known Limitations** | US 51489 §2 states no format constraints beyond numeric — no boundary case is generated here, matching Test Design's own deliberate choice not to invent one |

**Traceability:**

| Requirement Ref | Discovery Ref | Finding Ref | Evidence Ref |
|---|---|---|---|
| PRD_UserStories.md US 6 §2 Branch Module | discovery/findings/FINDING-010_UndocumentedOutstandingThreshold/metadata.md | FINDING-010 | discovery/findings/FINDING-010_UndocumentedOutstandingThreshold/failure.png |

## 3. Partially Automatable — Non-Automated Remainders

*(None — zero Partially Automatable decisions this run.)*

## 4. Manual Only — Reasons

*(None — zero Manual Only decisions this run. The 26 test cases with `Automation = Rejected` are out of this run's scope by the reviewer's own prior decision, not a Manual Only automation decision made here.)*
