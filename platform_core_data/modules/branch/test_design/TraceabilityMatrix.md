# Requirement Traceability Matrix — run-002__2026-08-03_10-26-17__UserStory__US-8605CreateBranch

| Field | Value |
|---|---|
| Module | `branch` |
| Produced by run | `run-002__2026-08-03_10-26-17__UserStory__US-8605CreateBranch` |
| Revision | 2 (in place — TC-BR-026/027 evidence and validation status corrected) |
| Project Context | `modules/branch/context/ProjectContext.md` |
| Run Scope Type / Run Type | User Story / User Story |
| Test Cases Traced | 39 |
| Generated | 2026-08-03 |

## 1. Matrix

| Test Case ID | Requirement Reference | Discovery Reference | Finding Reference | Evidence Reference | Acceptance Criteria Reference | Run Scope Reference | Risk Level | Risk Statement | Validation Status |
|---|---|---|---|---|---|---|---|---|---|
| TC-BR-001 | PRD_UserStories.md US 5 §Branch Details | discovery/DiscoverySnapshot_CreateBranch.md §3–4 | N/A | N/A | "The user must select the Operating Country... enter a Branch Name... State/City dropdowns... Address 1... Post Office Box... Phone Number." | User Story — US 8605 Create Branch | Low | None identified | Validated |
| TC-BR-002 | PRD_UserStories.md US 5 §Branch Details | discovery/DiscoverySnapshot_CreateBranch.md §4 | N/A | N/A | Each Branch Details field marked "(Mandatory)" | User Story — US 8605 Create Branch | Low | None identified | Not Yet Validated |
| TC-BR-003 | PRD_UserStories.md US 5 §Branch Details | "Not independently verified in Discovery" | N/A | N/A | "The user must enter a Branch Name (free text, alphanumeric input only)." | User Story — US 8605 Create Branch | Low | None identified | Not Yet Validated |
| TC-BR-004 | PRD_UserStories.md US 5 §Branch Details | "Not independently verified in Discovery" (OQ-BR-1) | N/A | N/A | "The Country field shall be auto-filled based on the selected Operating Country." | User Story — US 8605 Create Branch | Low | None identified | Not Yet Validated |
| TC-BR-005 | PRD_UserStories.md US 5 §Branch Details | "Not independently verified in Discovery" (OQ-BR-1) | N/A | N/A | "The State dropdown shall dynamically populate based on the selected Country." | User Story — US 8605 Create Branch | Low | None identified | Not Yet Validated |
| TC-BR-006 | PRD_UserStories.md US 5 §Branch Details | "Not independently verified in Discovery" (OQ-BR-1) | N/A | N/A | "The City dropdown shall dynamically populate based on the selected State." | User Story — US 8605 Create Branch | Low | None identified | Not Yet Validated |
| TC-BR-007 | PRD_UserStories.md US 5 §Branch Details | discovery/DiscoverySnapshot_CreateBranch.md §5 (Post Office Box row) | N/A | N/A | "Post Office Box... alphanumeric and has a max length of 8 characters." | User Story — US 8605 Create Branch | Low | None identified | Not Yet Validated |
| TC-BR-008 | PRD_UserStories.md US 5 §Branch Details | discovery/DiscoverySnapshot_CreateBranch.md §5 | FINDING-002 | discovery/findings/FINDING-002_PostOfficeBoxNoMaxLength/failure.png | "Post Office Box... alphanumeric and has a max length of 8 characters." | User Story — US 8605 Create Branch | Medium | Branch records could be created with a Post Office Box far longer than the business rule allows (FINDING-002 Business Risk) | Contradicted — regression pending fix |
| TC-BR-009 | PRD_UserStories.md US 5 §Branch Details | discovery/DiscoverySnapshot_CreateBranch.md §4 (Phone Number row) | N/A | N/A | "...selecting a country code from a dropdown and entering a numeric input." | User Story — US 8605 Create Branch | Low | None identified | Validated |
| TC-BR-010 | PRD_UserStories.md US 5 §Branch Details | "Not independently verified in Discovery" | N/A | N/A | "...entering a numeric input." | User Story — US 8605 Create Branch | Low | None identified | Not Yet Validated |
| TC-BR-011 | PRD_UserStories.md US 5 §Branch Details | discovery/DiscoverySnapshot_CreateBranch.md §3 | N/A | N/A | "The user may enter a PAN Number, Service Tax Number, and ABTA Number... alphanumeric... uppercase." | User Story — US 8605 Create Branch | Low | None identified | Validated (Service Tax/ABTA only — PAN Number excluded, see Coverage Report §8) |
| TC-BR-012 | PRD_UserStories.md US 5 §Branch Email Configuration | discovery/DiscoverySnapshot_CreateBranch.md §3 | N/A | N/A | "The user must enter a Branch Email ID... Email Password..." | User Story — US 8605 Create Branch | Low | None identified | Validated |
| TC-BR-013 | PRD_UserStories.md US 5 §Branch Email Configuration | "Not independently verified in Discovery" | N/A | N/A | Both fields marked "(Mandatory)" | User Story — US 8605 Create Branch | Low | None identified | Not Yet Validated |
| TC-BR-014 | PRD_UserStories.md US 5 §Branch Email Configuration | "Not independently verified in Discovery" (Not Captured §9) | N/A | N/A | "Email Password... max length of 15 characters." | User Story — US 8605 Create Branch | Low | None identified | Not Yet Validated |
| TC-BR-015 | PRD_UserStories.md US 5 §Branch Email Configuration | "Not independently verified in Discovery" (Not Captured §9) | N/A | N/A | "Email Password... max length of 15 characters." | User Story — US 8605 Create Branch | Low | None identified | Not Yet Validated |
| TC-BR-016 | PRD_UserStories.md US 5 §Branch Contact Info | discovery/DiscoverySnapshot_CreateBranch.md §3 | N/A | N/A | "The user must enter a Contact Name... Email ID... Phone Number." | User Story — US 8605 Create Branch | Low | None identified | Validated |
| TC-BR-017 | PRD_UserStories.md US 5 §Branch Contact Info | "Not independently verified in Discovery" | N/A | N/A | Name/Email ID/Phone Number marked "(Mandatory)" | User Story — US 8605 Create Branch | Low | None identified | Not Yet Validated |
| TC-BR-018 | PRD_UserStories.md US 5 §Branch Contact Info | "Not independently verified in Discovery" | N/A | N/A | "...input accepts alphabets, spaces, and a single dot (.)" | User Story — US 8605 Create Branch | Low | None identified | Not Yet Validated |
| TC-BR-019 | PRD_UserStories.md US 5 §Branch Contact Info | "Not independently verified in Discovery" (Not Captured §9) | N/A | N/A | "The user must be able to add multiple contact persons using an 'Add' button. (Optional)" | User Story — US 8605 Create Branch | Low | None identified | Not Yet Validated |
| TC-BR-020 | PRD_UserStories.md US 5 §Branch Sales Configuration | "Not independently verified in Discovery" (Not Captured §9) | N/A | N/A | "The user may click 'Add Target' to set multiple targets, but only after entering Target Amount, Month, and Year." | User Story — US 8605 Create Branch | Low | None identified | Not Yet Validated |
| TC-BR-021 | PRD_UserStories.md US 5 §Branch Sales Configuration | "Not independently verified in Discovery" | N/A | N/A | Credit Limit/Top-Up Limit/Credit Terms(Days) marked "(Mandatory)" | User Story — US 8605 Create Branch | Low | None identified | Not Yet Validated |
| TC-BR-022 | PRD_UserStories.md US 5 §Branch Sales Configuration | discovery/findings/FINDING-003_CreditLimitNoMaxLength/metadata.md | N/A | N/A | "The user must enter a Credit Limit (numeric input only)." | User Story — US 8605 Create Branch | Low | None identified | Validated |
| TC-BR-023 | PRD_UserStories.md US 5 §Branch Sales Configuration | discovery/findings/FINDING-003_CreditLimitNoMaxLength/metadata.md | FINDING-003 | discovery/findings/FINDING-003_CreditLimitNoMaxLength/failure.png | "Credit Limit... max length of 15 characters." | User Story — US 8605 Create Branch | Medium | Credit Limit is a core credit-risk control field; accepting values beyond 15 digits could allow unintended credit limits (FINDING-003 Business Risk) | Contradicted — regression pending fix |
| TC-BR-024 | PRD_UserStories.md US 5 §Branch Sales Configuration | discovery/QA_Assessment_Report.md §6 Confirmed Behaviour | N/A | N/A | "Reaching Percentage... must not be greater than 100%." | User Story — US 8605 Create Branch | Low | None identified | Validated |
| TC-BR-025 | PRD_UserStories.md US 5 §Branch Sales Configuration | "Not independently verified in Discovery" | N/A | N/A | "Reaching Percentage... numeric values with up to 3 decimal places..." | User Story — US 8605 Create Branch | Low | None identified | Not Yet Validated |
| TC-BR-026 | PRD_UserStories.md US 5 §Branch Sales Configuration | discovery/findings/FINDING-004_WarningPromptNoMaxLength/metadata.md | FINDING-004 | discovery/findings/FINDING-004_WarningPromptNoMaxLength/failure.png | "Warning Prompt (Days)... max length of 11 number..." | User Story — US 8605 Create Branch | Medium | An unreasonably large Warning Prompt value undermines the early-warning threshold's intent (FINDING-004 Business Risk) | Contradicted — regression pending fix (re-isolated 2026-08-03 from the confirmed cross-field rule; see TC-BR-027) |
| TC-BR-027 | PRD_UserStories.md US 5 §Branch Sales Configuration | discovery/QA_Assessment_Report.md §6 Confirmed Behaviour addendum (resolves §8 OQ-BR-2) | N/A | Module-owner-supplied screenshot, 2026-08-03 (chat) — Human Observation | "Warning Prompt (Days)... should be less than Credit Terms (Days)." | User Story — US 8605 Create Branch | Low | None identified — rule confirmed enforced, not a defect | Validated |
| TC-BR-028 | PRD_UserStories.md US 5 §Branch Sales Configuration | discovery/findings/FINDING-001_PaymentOptionListPollution/metadata.md | FINDING-001 | discovery/findings/FINDING-001_PaymentOptionListPollution/failure.png | "The user may select Payment Options (multi-select checkboxes)." | User Story — US 8605 Create Branch | Low | None identified — FINDING-001 disposition is Documented Exception (confirmed intended cross-module behavior) | Validated (selection mechanism only; list contents out of scope — see Coverage Report §8) |
| TC-BR-029 | PRD_UserStories.md US 5 §Product Access Details | discovery/DiscoverySnapshot_CreateBranch.md §3 | N/A | N/A | "The grid shall include the following columns: Status, Supplier Name, Credential Name, Product Name, Description." | User Story — US 8605 Create Branch | Low | None identified | Validated |
| TC-BR-030 | PRD_UserStories.md US 5 §Product Access Details | "Not independently verified in Discovery" | N/A | N/A | "Description... enabled only when a supplier is selected." | User Story — US 8605 Create Branch | Low | None identified | Not Yet Validated |
| TC-BR-031 | PRD_UserStories.md US 5 §Product Access Details | "Not independently verified in Discovery" | N/A | N/A | "Description... (Mandatory)" | User Story — US 8605 Create Branch | Low | None identified | Not Yet Validated |
| TC-BR-032 | PRD_UserStories.md US 5 §Product Access Details | discovery/Coverage_Summary.md §5 Blocked Areas | N/A | N/A | "If a GDS is selected in the grid, an additional grid shall appear with: Generic Supplier Credentials (PCC)... Manager Name... Supplier Credentials Description." | User Story — US 8605 Create Branch | Low | None identified | Not Yet Validated |
| TC-BR-033 | PRD_UserStories.md US 5 §Product Access Details | discovery/QA_Assessment_Report.md §6 Confirmed Behaviour | N/A | N/A | "Search Supplier Credentials PCC & Ticketing Supplier Credential PCC shall be removed from UI..." | User Story — US 8605 Create Branch | Low | None identified | Validated |
| TC-BR-034 | PRD_UserStories.md US 5 §Buttons & Actions | "Not independently verified in Discovery" | N/A | N/A | "Submit for Approval: Saves the updates and submits the branch for review." | User Story — US 8605 Create Branch | Low | None identified | Not Yet Validated |
| TC-BR-035 | PRD_UserStories.md US 5 §Buttons & Actions | discovery/findings/FINDING-011_SubmitButtonLabelMismatch/metadata.md | FINDING-011 | discovery/findings/FINDING-011_SubmitButtonLabelMismatch/failure.png | "Submit for Approval: Saves the updates and submits the branch for review." | User Story — US 8605 Create Branch | Low | Minor confusion if the business expects the literal label "Submit for Approval" (FINDING-011 Business Risk) | Contradicted — regression pending fix |
| TC-BR-036 | PRD_UserStories.md US 5 §Buttons & Actions | "Not independently verified in Discovery" | N/A | N/A | "Cancel: Clears unsaved changes or exits the process." | User Story — US 8605 Create Branch | Low | None identified | Not Yet Validated |
| TC-BR-037 | PRD_UserStories.md US 6 §2 Branch Module | discovery/findings/FINDING-010_UndocumentedOutstandingThreshold/metadata.md | FINDING-010 | discovery/findings/FINDING-010_UndocumentedOutstandingThreshold/failure.png | "Add a new Child Agencies Threshold Amount field. Allows administrators to define a default threshold for all child agencies under the branch." | User Story — US 8605 Create Branch (field traced to US 51489, module-owner confirmed 2026-08-03) | Low | None identified — Expected Implementation, not a defect | Validated (field presence and traceability; submission behavior not yet executed) |
| TC-BR-038 | PRD_UserStories.md US 6 §2 Branch Module | discovery/findings/FINDING-010_UndocumentedOutstandingThreshold/metadata.md | FINDING-010 | discovery/findings/FINDING-010_UndocumentedOutstandingThreshold/failure.png | "Add a new Child Agencies Threshold Amount field..." (Mandatory/Optional not stated — see Coverage Report §8) | User Story — US 8605 Create Branch (field traced to US 51489) | Low | None identified | Not Yet Validated (assumption-based) |
| TC-BR-039 | PRD_UserStories.md US 6 §2 Branch Module | discovery/findings/FINDING-010_UndocumentedOutstandingThreshold/metadata.md | FINDING-010 | discovery/findings/FINDING-010_UndocumentedOutstandingThreshold/failure.png | "Add a new Child Agencies Threshold Amount field..." | User Story — US 8605 Create Branch (field traced to US 51489) | Low | None identified | Validated (numeric field type observed; no format spec to test against) |

## 2. Requirement → Test Case Roll-Up

| Requirement ID | Requirement Summary | Test Case ID(s) | Coverage Status |
|---|---|---|---|
| US5 §Branch Details | Operating Country, Branch Name, Country auto-fill, State/City cascade, Address 1/2, Post Office Box, Phone Number, Service Tax/ABTA Number | TC-BR-001–011 | Covered |
| US5 §Branch Details — PAN Number | Optional PAN Number field | — | Out-of-Scope (ignored per module-owner direction 2026-08-03, FINDING-008) |
| US5 §Branch Email Configuration | Branch Email ID, Email Password | TC-BR-012–015 | Covered |
| US5 §Branch Contact Info | Contact Name, Email ID, Phone Number, Add button | TC-BR-016–019 | Covered |
| US5 §Branch Contact Info — Department | Mandatory Department multi-select | — | Out-of-Scope (ignored per module-owner direction 2026-08-03, FINDING-009) |
| US5 §Branch Sales Configuration | Target/Month/Year + Add Target, Credit Limit, Top-Up Limit, Credit Terms, Reaching Percentage, Warning Prompt, Payment Option | TC-BR-020–028 | Covered |
| US5 §Branch Sales Configuration — Payment Gateway | Conditional Payment Gateway dropdown on Credit Card selection | — | Out-of-Scope (Outdated Requirement, FINDING-007) |
| US5 §Product Access Details | Grid columns, Description enable/mandatory rule, GDS sub-grid, PCC removal | TC-BR-029–033 | Covered |
| US5 §Product Access Details — Flight default | "Flight" backend-only, no user selection | — | Out-of-Scope (Outdated Requirement, FINDING-006) |
| US5 §Import PNR | "Always checked" | — | Out-of-Scope (confirmed feature — Import PNR is now a user-controlled toggle with no authoritative replacement requirement; see Coverage Report §8 — documented as an Observation, not tested) |
| US5 §Buttons & Actions | Submit for Approval, Cancel | TC-BR-034–036 | Covered |
| US6 §2 Branch Module | Child Agencies Threshold Amount ("Outstanding Threshold") | TC-BR-037–039 | Partially Covered (Mandatory/Optional and format constraints not specified by US 51489 — see Coverage Report §8) |
| US6 §4 Branch Threshold Update | Confirmation-popup flow for child agencies with custom thresholds | — | Unknown / Unassessed — deferred per explicit user instruction (2026-08-03); not designed this pass |
| PRD.md ORG-03/ORG-04 | Reverse-engineered Branch creation/search baseline | (see US5 rows above) | Covered indirectly — US 5 is authoritative and more granular per ProjectContext.md §1 |

## 3. Finding Disposition

| Finding ID | Category | Severity | Disposition | Test Case ID(s) / Reason |
|---|---|---|---|---|
| FINDING-001 | Observation | N/A | Documented exception | Confirmed intended cross-module behavior (Payment Option reflects Payment Gateway's Active records) — no regression/exploratory test needed; informs TC-BR-028's scope boundary |
| FINDING-002 | Bug | Medium | Regression test | TC-BR-008 |
| FINDING-003 | Bug | Medium | Regression test | TC-BR-023 |
| FINDING-004 | Bug | Medium | Regression test | TC-BR-026 |
| FINDING-005 | Requirement Gap | N/A | Documented exception | Confirmed intended feature (Import PNR unchecked default) — US 8605's "always checked" wording is outdated with no replacement requirement stated; no test case designed (documented as an Observation, Coverage Report §8) |
| FINDING-006 | Requirement Gap | N/A | Documented exception | Outdated Requirement (Flight editability) — no test case designed against the "backend-only" AC wording |
| FINDING-007 | Requirement Gap | N/A | Documented exception | Outdated Requirement (no Payment Gateway dropdown) — no test case designed against this AC wording; informs TC-BR-028's scope boundary |
| FINDING-008 | Requirement Gap | N/A | Documented exception | Ignored per explicit module-owner direction — PAN Number excluded from this suite |
| FINDING-009 | Requirement Gap | N/A | Documented exception | Ignored per explicit module-owner direction — Department excluded from this suite |
| FINDING-010 | Observation | N/A | Documented exception (Finding itself) + drives standard requirement-based cases | Finding disposition: Documented exception (Expected Implementation / Requirement Traceability, not a defect — no regression/exploratory test needed for the Finding itself). Its underlying field is separately covered by TC-BR-037, TC-BR-038, TC-BR-039 under ordinary Requirement traceability to US 51489 §2, not because of the Finding being a defect. |
| FINDING-011 | Bug | Low | Regression test | TC-BR-035 |

**Findings covered: 11/11 (4 regression, 0 exploratory, 7 documented exception). Uncovered Findings: 0.**

## 4. Risk Register

| Risk Level | Test Case ID(s) | Statement | Source |
|---|---|---|---|
| Medium | TC-BR-008 | Branch records could be created with a Post Office Box far longer than the business rule allows | FINDING-002 Business Risk |
| Medium | TC-BR-023 | Credit Limit is a core credit-risk control field; accepting values beyond 15 digits could allow unintended credit limits | FINDING-003 Business Risk |
| Medium | TC-BR-026 | An unreasonably large Warning Prompt value undermines the early-warning threshold's intent | FINDING-004 Business Risk |
| Low | TC-BR-035 | Minor confusion if the business expects the literal label "Submit for Approval" | FINDING-011 Business Risk |
| Low | All other 35 test cases | No elevated risk beyond standard functional/validation coverage | Project Context / standard AC |
