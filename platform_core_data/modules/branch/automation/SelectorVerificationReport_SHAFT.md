# Selector Verification Report — SHAFT — run-002__2026-08-03_10-26-17__UserStory__US-8605CreateBranch

| Field | Value |
|---|---|
| Module | `branch` |
| Produced by run | `run-002__2026-08-03_10-26-17__UserStory__US-8605CreateBranch` |
| Revision | 1 |
| Verified against | STG — `http://192.168.1.70`, code-state anchor: live build as of 2026-08-03 (same day as this suite's execution) |
| Mechanism | Browser Driver (`platform_core/tools/browser_driver/`), headless — one of the two sanctioned verification mechanisms per `automation-skill` §17 |
| Note on timing | Every locator below was verified **during this same run's Stage 4M (Manual Execution) pass**, hours before this Stage 4A pass, against the identical build — not re-driven a second time redundantly. This satisfies §11A's intent (verify against the build the suite will actually run on) without a duplicate live pass; each row cites the Stage 4M artifact where the interaction is directly evidenced. |

## Verified Locators

| Screen/Component | Element | Strategy | Locator | Resolved | Interactable | Fallback chain | Verified At | Evidence |
|---|---|---|---|---|---|---|---|---|
| Add Branch form | Operating Country | css id | `#id-Operatingcountry` | Unique | Yes (autocomplete — click, type, select `role=option` exact) | text-based `role=option` match on filtered list | 2026-08-03 | `manual_execution/artifacts/TC-BR-004.png`; confirmed via live script output (`Country: "Egypt"` after selecting `EgyptUAT`) |
| Add Branch form | Country (read-only auto-fill) | css id | `#id-Country` | Unique | Read-only, assert `inputValue()` | none needed — single stable id | 2026-08-03 | `manual_execution/artifacts/TC-BR-004.png` |
| Add Branch form | State dropdown | css id + ancestor | `#id-State` → click `xpath=ancestor::div[contains(@class,"p-dropdown")][1]`, then `role=option` exact | Unique (raw `#id-State` input is a 0×0 accessibility node; the `p-dropdown` ancestor div is the real, sized, clickable target) | Yes, once the correct ancestor is targeted | Direct click on `#id-State` fails (0×0 element) — recorded here so it is never regenerated as a naive first attempt | 2026-08-03 | `manual_execution/artifacts/TC-BR-005.png`; discovered and documented live during this run (see conversation record of the `p-hidden-accessible` vs `p-dropdown` investigation) |
| Add Branch form | City dropdown | css id + ancestor | `#id-City` → same `p-dropdown` ancestor pattern as State | Unique | Yes | Same as State | 2026-08-03 | `manual_execution/artifacts/TC-BR-006.png` |
| Add Branch form | Branch Name | css id, nth(0) | `#id-Name` (first of two same-id inputs on the page — Branch Details vs. Contact Info) | Unique once scoped by document order (`nth(0)`) | Yes | None — position is stable within one static form layout | 2026-08-03 | `manual_execution/artifacts/TC-BR-001-after-submit.png` |
| Add Branch form | Post Office Box | css id | `#id-PostOfficeBox` | Unique | Yes | None | 2026-08-03 | `manual_execution/artifacts/TC-BR-002-last-field.png` |
| Add Branch form | Phone Number (Branch Details) | css attribute, nth(0) | `input[type="tel"]` (first of two same-attribute inputs) | Unique once scoped by `nth(0)` | Yes | None | 2026-08-03 | `manual_execution/artifacts/TC-BR-002-last-field.png` |
| Add Branch form | Branch Email ID | css id, nth(0) | `#id-EmailID` (first of two same-id inputs) | Unique once scoped by `nth(0)` | Yes | None | 2026-08-03 | `manual_execution/artifacts/TC-BR-013-last-field.png` |
| Add Branch form | Email Password | css id | `#id-EmailPassword` | Unique | Yes | None | 2026-08-03 | `manual_execution/artifacts/TC-BR-013-last-field.png` |
| Add Branch form | Credit Limit | css id | `#id-CreditLimit` | Unique | Yes | None | 2026-08-03 | `manual_execution/artifacts/TC-BR-023.png` |
| Add Branch form | Top Up Limit | css id | `#id-TopUpLimit` | Unique | Yes | None | 2026-08-03 | `manual_execution/artifacts/TC-BR-021-last-field.png` |
| Add Branch form | Credit Terms (Days) | css attribute (parens in id require attribute selector) | `[id="id-CreditTerms(Days)"]` | Unique | Yes | None | 2026-08-03 | `manual_execution/artifacts/TC-BR-027.png` |
| Add Branch form | Reaching Percentage | css id | `#id-ReachingPercentage` | Unique | Yes | None | 2026-08-03 | `manual_execution/artifacts/TC-BR-024.png`, `TC-BR-025.png` |
| Add Branch form | Warning Prompt (Days) | css attribute | `[id="id-WarningPrompt(Days)"]` | Unique | Yes | None | 2026-08-03 | `manual_execution/artifacts/TC-BR-026.png` |
| Add Branch form | Payment Option — Cash checkbox | css id + ancestor | `#id-PaymentOption-Cash` → click `xpath=ancestor::div[contains(@class,"p-checkbox")][1]` | Unique | Yes, once the correct ancestor is targeted | Direct `.check()` on the raw input silently no-ops (visually hidden behind a styled box) — recorded so it is never regenerated as a naive first attempt | 2026-08-03 | `manual_execution/artifacts/TC-BR-028.png`; discovered and documented live during this run |
| Add Branch form | Outstanding Threshold | css id | `#id-OutstandingThreshold` | Unique | Yes | None | 2026-08-03 | `manual_execution/artifacts/TC-BR-037.png`, `TC-BR-038.png`, `TC-BR-039.png` |
| Add Branch form | Product Access grid — first row Status checkbox | css, first row | `table tbody tr:first-of-type input[type="checkbox"]` → same `p-checkbox` ancestor pattern | Unique within first row | Yes | Content-scoped alternative recommended if row order is not guaranteed stable in production (see Automation Plan RISK-AUTO-3 note); this scope's TC-BR-030 does not depend on which specific supplier is first, only that *a* row toggles | 2026-08-03 | `manual_execution/artifacts/TC-BR-030.png` |
| Add Branch form | Product Access grid — first row Description field | css attribute pattern | `input[id^="id-supplier-"][placeholder="Description"]` (first match) | Unique (first match) | Yes — `isDisabled()` used to assert the enable/disable transition | None | 2026-08-03 | `manual_execution/artifacts/TC-BR-030.png` |
| Add Branch form | Submit button | text | `button:has-text("Send For Approval")` | Unique | Yes | Also matches `button:has-text("Submit for Approval")` so the same locator keeps working unmodified once FINDING-011's label defect is fixed | 2026-08-03 | `manual_execution/artifacts/TC-BR-001-after-submit.png`, `TC-BR-034.png` |

## Unverifiable

*(None. All 13 in-scope test cases' elements were directly exercised and confirmed during this run's own Stage 4M pass, against the same build this suite will run against.)*

## Budget

Not separately time-boxed this run — verification was a byproduct of Stage 4M's already-completed live execution rather than a dedicated Stage 4A verification pass. No element was left unverified, so no budget exhaustion occurred; this is stated explicitly rather than silently omitted, per §11A.6.
