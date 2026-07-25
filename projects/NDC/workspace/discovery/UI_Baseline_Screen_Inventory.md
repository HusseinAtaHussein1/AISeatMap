# NDC — UI Baseline Discovery: Screen Inventory

**Mission:** UI Baseline Discovery (read-only visual knowledge base) · **Not tied to RUN-20260710-001** — this is a standalone documentation pass across the whole reachable Admin Portal, run in parallel with (not part of) that run's Stage 2 User Story discovery.

**Session used:** Browser Automation via `tools/browser_driver/` (`BrowserDriver.authenticate({ env: 'STG' })`), logged in as `odeysysadmin` — **Super Admin** tier (per `FINDING-002`/`FINDING-004`, this is a distinct, more restricted role than the `E.Saady` "Admin" tier `run_configuration.md` was originally written against). Every "Required role" note below describes what this one Super Admin session could/couldn't see — role differences for Admin/Agency/Agent tiers are **not** covered by this mission and remain untested.

**Screenshots live under:** `platform_core_data/workspace/discovery/UI Baseline/<Module>/[<Category>/]<Screen>.png` — one clean full-page screenshot per reachable landing screen. Raw machine-readable log: [`UI Baseline/_results.json`](UI%20Baseline/_results.json).

**Totals:** 53 screens captured · 5 confirmed absent from this role's navigation (not bugs in this pass — documented observations) · 2 menu labels turned out not to be distinct screens (corrected after diagnostic verification, see notes).

---

## Dashboard

| Screen | Nav Path | Screenshot | Page Title | Notes |
|---|---|---|---|---|
| Dashboard | Dashboard | `Dashboard/Dashboard.png` | NDC - Dashboard | **Unexpected:** content is a booking-search-style form (Country POS / Branch / Booking Date range / Booking Reference / Supplier / Airline), not KPI widgets/charts. Worth confirming with product owner whether this is the intended Super Admin landing page or a misconfiguration. |

## Admin

| Screen | Nav Path | Screenshot | Page Title | Notes |
|---|---|---|---|---|
| Operating Country | Admin → Company → Operating Country | `Admin/Company/OperatingCountry.png` | NDC - Operating Country | |
| Branch | Admin → Company → Branch | `Admin/Company/Branch.png` | NDC - Branch | |
| Agency | Admin → Agency → Agency | `Admin/Agency/Agency.png` | NDC - Agency | Category and leaf share the label "Agency" — resolved via last-match. |
| Search Login Details | Admin → Agency → Search Login Details | `Admin/Agency/SearchLoginDetails.png` | NDC - Login Details | |
| Registration Requests | Admin → Agency → Registration Requests | `Admin/Agency/RegistrationRequests.png` | NDC - Registration Requests | |
| Category Management | Admin → Agency → Category Management | `Admin/Agency/CategoryManagement.png` | NDC - Category Management | |
| Agency Assignation | Admin → Agency → Agency Assignation | `Admin/Agency/AgencyAssignation.png` | NDC - Agency Assignation | |
| Staff | Admin → Staff | `Admin/Staff.png` | NDC - Staff | No category level — sibling to Company/Agency directly under Admin. |

## Master → Flight

| Screen | Nav Path | Screenshot | Page Title | Notes |
|---|---|---|---|---|
| Airline | Master → Flight → Airline | `Master/Flight/Airline.png` | NDC - Flight | |
| Airport | Master → Flight → Airport | `Master/Flight/Airport.png` | NDC - Flight | Also has a canonical copy at `platform_core_data/ui/screenshots/Airport.png` (separate UI Knowledge Base convention, distinct from this Discovery artifact). |
| Prefer Airline | Master → Flight → Prefer Airline | `Master/Flight/PreferAirline.png` | NDC - Flight | |
| BSP Commission | Master → Flight → BSP Commission | `Master/Flight/BSPCommission.png` | NDC - Flight | |
| Deal Code | Master → Flight → Deal Code | `Master/Flight/DealCode.png` | NDC - Flight | |

## Master → Supplier

| Screen | Nav Path | Screenshot | Page Title | Notes |
|---|---|---|---|---|
| Supplier | Master → Supplier → Supplier | `Master/Supplier/Supplier.png` | NDC - Supplier | Category and leaf share the label "Supplier" — resolved via last-match. |
| Credential Field | Master → Supplier → Credential Field | `Master/Supplier/CredentialField.png` | NDC - Supplier | |
| Supplier Credentials | Master → Supplier → Supplier Credentials | `Master/Supplier/SupplierCredentials.png` | NDC - Supplier | |
| Credential Routes Filter | Master → Supplier → Credential Routes Filter | `Master/Supplier/CredentialRoutesFilter.png` | NDC - Supplier | Already had prior Discovery snapshots (`CredentialRoutesFilter_*Screen.md`) from RUN-20260710-001 — this is the same screen's baseline, captured fresh for this mission. |
| Flight Search Limitation | Master → Supplier → Flight Search Limitation | `Master/Supplier/FlightSearchLimitation.png` | NDC - Supplier | |

## Master → Miscellaneous

| Screen | Nav Path | Screenshot | Page Title | Notes |
|---|---|---|---|---|
| Region | Master → Miscellaneous → Region | `Master/Miscellaneous/Region.png` | NDC - Region | |
| Currency | Master → Miscellaneous → Currency | `Master/Miscellaneous/Currency.png` | NDC - Miscellaneous | |
| Rate of Exchange | Master → Miscellaneous → Rate of Exchange | `Master/Miscellaneous/RateOfExchange.png` | NDC - Miscellaneous | |
| Credential Rate of Exchange | Master → Miscellaneous → Credential Rate of Exchange | `Master/Miscellaneous/CredentialRateOfExchange.png` | NDC - Miscellaneous | |

## Master → Payment Gateway

| Screen | Nav Path | Screenshot | Page Title | Notes |
|---|---|---|---|---|
| Payment Method | Master → Payment Gateway → Payment Method | `Master/Payment Gateway/PaymentMethod.png` | NDC - Payment Gateway | |

## Rule Engine

*(Flat list directly under the top-nav item — no category level.)*

| Screen | Nav Path | Screenshot | Page Title | Notes |
|---|---|---|---|---|
| Markup | Rule Engine → Markup | `Rule Engine/Markup.png` | NDC - Markup | |
| Discount | Rule Engine → Discount | `Rule Engine/Discount.png` | NDC - Discount | |
| Service Charge | Rule Engine → Service Charge | `Rule Engine/ServiceCharge.png` | NDC - Service Charge | |
| Cancellation Charge | Rule Engine → Cancellation Charge | `Rule Engine/CancellationCharge.png` | NDC - Cancellation Charge | |
| Fare Rule Master | Rule Engine → Fare Rule Master | `Rule Engine/FareRuleMaster.png` | NDC - Rule Master | |
| Offer Pricing | Rule Engine → Offer Pricing | `Rule Engine/OfferPricing.png` | NDC - Pricing | |
| Terms And Conditions | Rule Engine → Terms And Conditions | `Rule Engine/TermsAndConditions.png` | NDC - Terms | |

## Settings

| Screen | Nav Path | Screenshot | Page Title | Notes |
|---|---|---|---|---|
| Suppliers | Settings → Suppliers | `Settings/Suppliers.png` | NDC - Suppliers Settings | |
| Admin Settings | Settings → Admin Settings | `Settings/AdminSettings.png` | NDC - Admin Settings | Confirms the `TT_TS_SETTINGS` key/value table already documented in `architecture.md` (39 total rows, paginated 10/page) — matches the DB-query observation from that file. |

## User Management

*(Corrected structure — architecture.md's flat "Agency User Information → Agent Information, Travellers Details" listing understated the real nesting. "Agency User Information" is an **accordion category**, not a screen itself; it has two real leaf screens.)*

| Screen | Nav Path | Screenshot | Page Title | Notes |
|---|---|---|---|---|
| *(Agency User Information)* | User Management → Agency User Information | *(none — see note)* | — | Not a distinct landing page. Clicking it only expands the accordion and auto-selects its default child, Agent Information. |
| Agent Information | User Management → Agency User Information (category) → Agent Information | `User Management/AgentInformation.png` | NDC - Agency Info | Default child of the category above. |
| Travellers Details | User Management → Agency User Information (category) → Travellers Details | `User Management/TravellersDetails.png` | NDC - Travellers Details | |

## Booking-Mid Office

*(Corrected structure — for this Super Admin session, this module's sidebar renders exactly one item.)*

| Screen | Nav Path | Screenshot | Page Title | Notes |
|---|---|---|---|---|
| Booking (Search Booking) | Booking-Mid Office → Booking | `Booking-Mid Office/Booking.png` | NDC - Search Booking | A search-only landing form (Branch/Agency/date range + Booking/Flight tabs) — no results were searched (read-only constraint). |
| My Quotes | Booking-Mid Office → My Quotes | *(confirmed absent)* | — | Not rendered in this role's sidebar — diagnostic DOM dump shows only "Booking" as a menu entry. Consistent with `FINDING-004` ("Super Admin cannot complete the Booking Cycle"). |
| Manual Booking Invoice | Booking-Mid Office → Manual Booking Invoice | *(confirmed absent)* | — | Same as above. |
| Blue Command Screen | Booking-Mid Office → Blue Command Screen | *(confirmed absent)* | — | Same as above. |

## Profile

| Screen | Nav Path | Screenshot | Page Title | Notes |
|---|---|---|---|---|
| Traveller | Profile → Traveller | `Profile/Traveller.png` | NDC - Traveller | |

## Reports

*(Flat list directly under the top-nav item — no category level; 14 of 14 documented reports captured.)*

| Screen | Nav Path | Screenshot | Page Title |
|---|---|---|---|
| Total Due Report | Reports → Total Due Report | `Reports/TotalDueReport.png` | NDC - Total Due Report |
| Agency Wallet Report | Reports → Agency Wallet Report | `Reports/AgencyWalletReport.png` | NDC - Agency Wallet Report |
| Sales Report | Reports → Sales Report | `Reports/SalesReport.png` | NDC - Sales Report |
| Sync. PNR Report | Reports → Sync. PNR Report | `Reports/SyncPnrReport.png` | NDC - Sync PNR Report |
| Booking Report | Reports → Booking Report | `Reports/BookingReport.png` | NDC - Booking Report |
| Quotation Report | Reports → Quotation Report | `Reports/QuotationReport.png` | NDC - Quotation Report |
| Finance Report | Reports → Finance Report | `Reports/FinanceReport.png` | NDC - Financial Report |
| Statement Report | Reports → Statement Report | `Reports/StatementReport.png` | NDC - Statement Report |
| Released PNR Report | Reports → Released PNR Report | `Reports/ReleasedPnrReport.png` | NDC - Released Pnr Report |
| AR Ledger Report | Reports → AR Ledger Report | `Reports/ArLedgerReport.png` | NDC - AR Ledger Report |
| Wallet History Report | Reports → Wallet History Report | `Reports/WalletHistoryReport.png` | NDC - Wallet History Report |
| Daily Sales Report | Reports → Daily Sales Report | `Reports/DailySalesReport.png` | NDC - Daily Sales Report |
| Import PNR Report | Reports → Import PNR Report | `Reports/ImportPnrReport.png` | NDC - Import PNR Report |
| Transfer PNR Report | Reports → Transfer PNR Report | `Reports/TransferPnrReport.png` | NDC - Transfer PNR Report |

## Single top-level screens

| Screen | Nav Path | Screenshot | Page Title | Notes |
|---|---|---|---|---|
| PNR Query | PNR Query | `PNR Query/PNR Query.png` | NDC - Pnr Query | Has an Itinerary Details / Agency Information toggle (per `architecture.md`) — only the default state was captured, per this mission's "one baseline screenshot per screen" scope. |
| Transfer PNR | Transfer PNR | `Transfer PNR/Transfer PNR.png` | NDC - Transfer PNR | Screen actually contains two sections in one view: "Transfer PNR" (send) and "Search Transferred PNR" — both visible in the single baseline screenshot, so no separate capture needed. |
| Import PNR | Import PNR | *(confirmed absent)* | — | Not present in the top nav bar for this role. Matches `FINDING-001` (nav bar shows 11 items for this session vs. `architecture.md`'s 13 — Import PNR / Import Booked PNR are the two missing items). |
| Import Booked PNR | Import Booked PNR | *(confirmed absent)* | — | Same as Import PNR — see `FINDING-001`. |

---

## Summary of genuinely unexpected observations (candidates for future Findings if not already covered)

1. **Dashboard shows a booking-search form, not KPI/summary widgets** for this Super Admin session — not previously documented in `architecture.md`.
2. **Booking-Mid Office exposes only "Booking"** for this role — My Quotes, Manual Booking Invoice, and Blue Command Screen (all documented in `architecture.md`) are not rendered at all. Reinforces the existing `FINDING-004` role-access theme rather than being a new Finding.
3. **User Management's real structure is one level deeper than `architecture.md` implies** — "Agency User Information" is a category, not a screen; its two real children are Agent Information (default) and Travellers Details. Worth fixing in `architecture.md` on the next review pass (out of scope for this mission — no Project Context/architecture edits made here).
4. Import PNR / Import Booked PNR absence reconfirms `FINDING-001` with an independent, systematic pass (all 13 documented top-nav items were explicitly attempted, not just the ones visibly present).
