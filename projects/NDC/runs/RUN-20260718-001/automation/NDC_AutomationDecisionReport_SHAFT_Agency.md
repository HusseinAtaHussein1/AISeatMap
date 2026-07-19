# NDC — Automation Decision Report (Agency, SHAFT, new package) — RUN-20260718-001

Per-case disposition for every one of the 66 approved Agency Test Design cases (v3). "Reason" cites the evidence this decision is based on — never an invented locator.

## Create suite (39)

| Test Case | Disposition | Reason |
|---|---|---|
| CREATE-001 | Reuse | Already automated in `NDC_tests_SHAFT` (RUN-20260712-002), ported forward |
| CREATE-002 | Generate | `Send For Approval` + `getInvalidFieldsDiagnostic()` already proven |
| CREATE-003 | Generate | Same fill/submit mechanics as CREATE-001, different Agency Name value |
| CREATE-004 | Partially Automatable | No documented length limit (Test Design itself calls it exploratory) |
| CREATE-005 | Generate | Post Office Box truncation already confirmed live (prior run) |
| CREATE-006 | Generate | `id-CompanyURL` confirmed live (Agency_Update.md id dump) |
| CREATE-007 | Generate | `Phone No`/`Phone Number` ids already proven (existing Agency_Page) |
| CREATE-008 | Generate | `id-Country` auto-fill already proven (existing Agency_Page) |
| CREATE-009 | Generate | `id-IATAAgency-yes`/`-No` confirmed live |
| CREATE-010 | Generate | `id-Contactperson` already proven (existing Agency_Page) |
| CREATE-011 | Generate | Same Unicode-typing mechanics already proven for Contact Person |
| CREATE-012 | Generate | `id-EmailID` already proven (existing Agency_Page) |
| CREATE-013 | Generate | Document upload input already proven; non-PDF asset created this run |
| CREATE-014 | Generate | Contract date fields already proven (existing Agency_Page) |
| CREATE-015 | Partially Automatable | Multi-doc "Add" button known to append an extra required row (documented Agency_Page limitation) — only single-doc display asserted |
| CREATE-016 | **Blocked** | No remove/replace control locator found in any discovery pass — human confirmed 2026-07-18: stays Blocked |
| CREATE-017 | Generate | Logo upload input already proven (existing Agency_Page) |
| CREATE-018 | Generate | Logo preview `<img>` confirmed present in Add-form screenshot |
| CREATE-019 | Partially Automatable | Inheritance mechanism not independently confirmed — only "field is non-blank after Branch selection" asserted |
| CREATE-020 | Partially Automatable | Same Add-button-appends-row quirk as CREATE-015 |
| CREATE-021 | **Blocked** | "Designation" field id not confirmed anywhere — human confirmed 2026-07-18: stays Blocked |
| CREATE-022 | **Blocked** | Bank Account Details field ids not confirmed — human confirmed 2026-07-18: stays Blocked |
| CREATE-023 | **Blocked** | Same as CREATE-022 |
| CREATE-024 | **Blocked** | Same as CREATE-022 |
| CREATE-025 | Generate | `id-Creditlimit`/`id-Topuplimit`/`id-CreditTerms(Days)` confirmed live |
| CREATE-026 | Generate | `id-ReachingPercentage` confirmed live |
| CREATE-027 | Generate | `id-Paymentoption-*` full list confirmed live (Agency_Update.md id dump) |
| CREATE-028 | Partially Automatable | Set target/Month/Year button flow not independently confirmed; Invoice Generation/Credit Agency are Generate-covered elsewhere |
| CREATE-029 | Generate (adjusted) | Only the confirmed-real "Select Product" checkboxes asserted, per FINDING-008 |
| CREATE-030 | **Deferred** | FINDING-008: "Status Column/Credential name/Description" mandatory sub-fields not found — human confirmed 2026-07-18: stays Deferred |
| CREATE-031 | **Deferred** | FINDING-008: entire PCC section does not exist in the live form |
| CREATE-032 | **Deferred** | Same as CREATE-031 |
| CREATE-033 | **Deferred** | Same as CREATE-031 |
| CREATE-034 | Generate | `id--ImportPNROption` confirmed live (plus enrichment: Transfer PNR/Blue Command Screen) |
| CREATE-035 | **Deferred** | FINDING-008: no "Save as Draft" button exists — only Cancel/Send For Approval |
| CREATE-036 | Generate | Cancel button confirmed present (Add-form screenshot) |
| CREATE-037 | Superseded/N/A | Already retired by the Test Design itself — see ACTIONS-003 through -008 |
| CREATE-038 | Generate (adjusted) | Only fields with a confirmed real id (Agency Name, Address 1) — Supplier Credential Description dropped, FINDING-008 |
| CREATE-039 | Generate (adjusted) | Only Agency Name/Address 1/Address 2 — Bank Name/Manager Name/Supplier Credential Description dropped, FINDING-008 |

## Search suite (10)

| Test Case | Disposition | Reason |
|---|---|---|
| SEARCH-001 | Generate | `id-Agencycode` confirmed live |
| SEARCH-002 | Reuse | Already automated in `NDC_tests_SHAFT` (RUN-20260713-001), ported forward with `.70` fixture data |
| SEARCH-003 | Generate | `id-SelectCountry`/`id-State`/`id-City` (p-multiselect) confirmed live |
| SEARCH-004 | Generate | `id-Status-Active/Inactive/Both` already proven |
| SEARCH-005 | Generate | `isNoDataFoundShown()` already proven (existing SearchAgency_Page) |
| SEARCH-006 | Generate | Reuses the search input already proven; asserts no raw script-tag rendering |
| SEARCH-007 | Generate | Combines already-proven Name + Status locators |
| SEARCH-008 | Generate | "Add agency" button confirmed present |
| SEARCH-009 | Generate | Blank-search baseline already proven (existing SearchAgency_Page) |
| SEARCH-010 | Superseded/N/A | Already retired by the Test Design itself — see prior run's TC-AGENCY-003 |

## Actions suite (10)

| Test Case | Disposition | Reason |
|---|---|---|
| ACTIONS-001 | Generate | Pencil → `/admin/agency/edit/{id}` confirmed live |
| ACTIONS-002 | Generate (asserts real behavior) | Icon-per-status confirmed live differs from literal wording — see FINDING-008 point 6 |
| ACTIONS-003 | Generate | Remark popup + empty-remark-blocked + real-remark-succeeds all confirmed live |
| ACTIONS-004 | Generate | Approve toast + Status/Approval Status change confirmed live |
| ACTIONS-005 | Generate | Same popup mechanics as ACTIONS-003, confirmed live for Reject too |
| ACTIONS-006 | Generate | Reject toast + Status/Approval Status change confirmed live |
| ACTIONS-007 | Generate | New-record Inactive/Pending state confirmed live |
| ACTIONS-008 | Generate | Distinct `pi-pencil`/`pi-thumbs-up`/`pi-thumbs-down` DOM elements confirmed live |
| ACTIONS-009 | Generate | Consolidates ACTIONS-003/004/005/006/007's already-confirmed mechanics |
| ACTIONS-010 | **Manual Only** | Role/business clarification, not a UI assertion |

## Update suite (7)

| Test Case | Disposition | Reason |
|---|---|---|
| UPDATE-001 | Generate | Field-id pre-population confirmed live (Agency_Update.md dump) |
| UPDATE-002 | Generate | Reuses already-proven Agency_Page fill methods against the edit URL |
| UPDATE-003 | Generate | Cancel-navigates-away confirmed live; full discard-chain composed from proven steps |
| UPDATE-004 | Generate | Reuses the same mandatory-validation mechanics already proven for Add |
| UPDATE-005 | Partially Automatable | Reuses the grid-icon Approve (fully proven) rather than the Update screen's own Approve button (seen present, not independently exercised) |
| UPDATE-006 | Partially Automatable | Same caveat as UPDATE-005, for Reject |
| UPDATE-007 | Partially Automatable | Data-integrity assertion via re-reading a known field after Reject — the specific chain wasn't independently exercised live, though each component action was |
