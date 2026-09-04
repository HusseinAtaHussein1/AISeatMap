# Execution Flow — Import Booked PNR — Happy Path

<!-- Feature-level operational knowledge. This is HOW to execute the existing Happy Scenario across
     environments — not a restatement of WHAT the Azure Test Case says (that stays the authoritative
     business-level steps). Referenced, never duplicated, by Supplier runs: Travelport NDC, Sabre NDC,
     and any future Import Booked PNR Supplier read this file and record only their own Supplier-
     specific execution values (SupplierChecklist.md §3c, plus their own Discovery/Manual Execution/
     Automation evidence) — the procedure itself is not copied into each Supplier's context.

     This dual-environment execution model is Import Booked PNR-specific for now, not a platform-wide
     rule. SupplierChecklist.md §3c offers Source/Target Environment as a generic CAPABILITY any
     Feature can use; whether a Feature actually needs it is decided by that Feature's own execution
     knowledge. Refund, Reissue, and Seatmap decide their own model when their flows are defined —
     nothing here is assumed to generalize to them. -->

**Feature:** Import Booked PNR (`import-booked-pnr`)
**Canonical location:** `platform_core_data/supplier-features/import-booked-pnr/context/ExecutionFlow_HappyPath.md`
**Status:** Approved
**Last Updated:** 2026-09-02
**Related:** `FeatureChecklistProfile.md` (same folder) — Requirement IDs cited below trace to that
Profile's §B, which traces to the approved `shared/new-layer-contract/context/ProjectContext.md` (rev 3).
**Source:** Business-supplied operational explanation of the existing Azure Happy Scenario Test Case,
recorded 2026-09-02. The Azure Test Case remains the authoritative business-level step list; this
document is the execution knowledge underneath it.

## 0. Why this exists

The existing Azure Test Case states the Happy Scenario as ten business-level steps (precondition,
login, navigate, enter data, search, save, verify wallet, verify Rule Engine, search booking, verify
itinerary). It does not say **how** to actually produce a valid precondition or execute those steps
across environments. This document fills that gap so a future Supplier run — Discovery, Manual
Execution, or Automation — can execute the Happy Path correctly on the first attempt instead of
rediscovering the environment model from scratch.

## 1. Environment Model

Two environments are involved. Neither environment number below is a platform constant — both are
resolved from the run's Supplier Checklist (`SupplierChecklist.md` §3c) at execution time. Do not
hardcode an environment number into any reusable logic, script, or fixture.

| Role | Purpose | Example only — never hardcoded |
|---|---|---|
| `SOURCE_ENVIRONMENT` | Creates the already-ticketed offline booking through the Supplier, so a real Supplier PNR exists that does **not** already exist in the Target environment | ENV 80 |
| `TARGET_ENVIRONMENT` | Contains the Supplier's new NDC Core Service integration; this is where Import Booked PNR is actually exercised | ENV 83 |

```
NDC UI (Target)
    ↓
NDC Application (Target)
    ↓
NDC Core Service (Target)
    ↓
Supplier
```

## 2. Step 1 — Create the offline booked PNR (SOURCE_ENVIRONMENT)

**Azure step:** "Pre Condition: Get a Booked PNR to be Imported"

**Operational meaning:** do not search for an existing PNR. A new, real, ticketed Supplier booking
must be **created** outside the Target environment, so it is genuinely offline from the Target's
perspective. (HIST-01, HIST-16 — a PNR ticketed offline is the eligible case.)

1. Open the configured `SOURCE_ENVIRONMENT`.
2. Login with the appropriate user.
3. Navigate to the Branch configuration/module used to create the booking.
4. Verify/configure the Supplier under test (e.g. Travelport NDC, Sabre NDC).
5. Select/configure the Supplier Credential to use. Credentials may represent different
   markets/configurations (e.g. Egypt, UAE, Saudi Arabia, or another configured market) — do not
   choose one arbitrarily. Record exactly: Supplier, Supplier Credential, PCC (if applicable),
   Market/Country, Branch, Agency (if applicable).
6. Confirm the selected Supplier + Credential configuration is active and usable on the Source
   environment.
7. Using that Supplier + Credential, create a real booking through the normal booking flow.
8. Complete the booking until it is **ticketed**. A Held/un-ticketed booking is not valid Happy Path
   test data (HIST-02 — Held/Cancelled PNRs are ineligible).
9. Capture the generated PNR/Record Locator, plus the full Source Booking Snapshot — §3 below.
10. This PNR becomes the input test data for the Target environment.

```
SOURCE_ENVIRONMENT
    ↓
Create and ticket booking through Supplier
    ↓
Capture Supplier PNR + full Source Booking Snapshot
    ↓
PNR is NOT already imported/created in TARGET_ENVIRONMENT
```

Do not create this booking through Import Booked PNR itself.

## 3. Source Booking Snapshot — REQUIRED

Before moving to the Target environment, capture a **complete** booking snapshot — not only the PNR.
This snapshot is the expected-data baseline for the later comparison in §7. Capture as much confirmed
data as is actually available; an unavailable field is recorded as such, never fabricated.

| Category | Fields |
|---|---|
| Booking identifiers | PNR/Record Locator, Supplier, Supplier Credential, PCC, Market/Country, Branch, Agency, Booking status, Ticketing status, Original booking date/time, Original ticketing date/time |
| Passengers | Passenger count, names, passenger types (ADT/CHD/INF), passenger references/indexes where available |
| Itinerary | Trip type, Origin, Destination, all flight segments, marketing carrier, operating carrier (where available), flight number, departure/arrival airport, departure/arrival date/time, cabin class, RBD/booking class, connection information, segment order |
| Pricing | Base fare, taxes (individual tax codes/amounts where available), total fare, currency, fare per passenger/type, supplier-filed amount, markup/commission/discount where applicable and observable |
| Ticketing | Ticket number(s), ticket-to-passenger relationship, coupon information, coupon-to-segment relationship, ticket status, coupon status (where available), validating carrier |
| Baggage | Allowance, pieces, weight, unit, passenger association, segment association |
| Ancillaries/services | Selected services, SSRs, meals, seats, extra baggage, service status, passenger association, segment association, price/currency where applicable |
| Other business data | Any data Rule Engine will need later, any amount affecting wallet deduction, any known-important supplier-specific field, relevant remarks/booking metadata exposed by the source flow |

Original ticketing date/time is the single most consequential field in this snapshot — it drives
Rule Engine behavior in §8 (HIST-09, HIST-10) and must be captured precisely, not approximated.

**Evidence to preserve from the Source environment before leaving it** (§9 Evidence expands on this):
screenshots, API/network payloads, PNR details, fare breakdown, ticket details, itinerary,
ancillary/baggage data, original ticketing timestamp. Do not rely on memory or assume the Source
booking will still be easily retrievable later.

## 4. Step 2 — Prepare the Target environment (TARGET_ENVIRONMENT)

Before attempting Import Booked PNR:

1. Login to `TARGET_ENVIRONMENT` with a valid Admin account. (HIST-14 — NDC Admin-only feature.)
2. Navigate to the Branch module.
3. Identify the Branch to use for the Import Booked PNR test.
4. Verify the **same** Supplier used to create the Source booking is configured for this Branch
   (e.g. Source booking used Travelport NDC → Target Branch must have Travelport NDC configured).
5. Verify the corresponding Supplier Credential is configured, representing the **same**
   applicable supplier/market/PCC setup used to create the booking (e.g. Source
   Travelport NDC/Egypt → Target must use the corresponding Travelport NDC/Egypt configuration — do
   not silently substitute UAE/Saudi/another credential just because it's available).
6. Add/configure the Supplier + Credential on the Target Branch if missing and the test user is
   authorized to do so.
7. Verify any other required Branch/Agency/PCC configuration before continuing. (HIST-05, HIST-06,
   HIST-15.)
8. Record the Target configuration used as execution evidence.

## 5. Step 3 — Navigate to Import Booked PNR

Navigate to **Admin → Import Booked PNR**. Verify the screen loads successfully. Do not continue if
the required Supplier/credential configuration is not available.

## 6. Step 4 — Enter the import data

Use the PNR generated from `SOURCE_ENVIRONMENT`. Enter/select the required data — PNR Code, Supplier,
Supplier Credential/PCC, Branch, Agency, and any other field the actual UI currently requires
(discover the exact field set live rather than assuming §D of `FeatureChecklistProfile.md`'s known
list is exhaustive).

**Consistency rule:** the Supplier and Credential selected here must correspond to the configuration
used to create the offline booking. Do not mix Source Supplier A with Target Supplier B, or a Source
Egypt credential with a Target UAE credential, unless the specific test intentionally validates that
mismatch.

## 7. Step 5 — Search/retrieve the PNR

Select the eligible Branch or Agency, click Search.

**Expected Happy Path:** the system retrieves the PNR through NDC UI → NDC Application → NDC Core
Service → the selected Supplier, and the PNR details are returned and displayed successfully.

At this point, verify the retrieved data against the Source Booking Snapshot (§3) where observable —
PNR, passenger(s), route/segments, airline/flight, ticket information, booking/ticketing status,
fare, taxes, currency, baggage, services, original ticketing date/time. Do not invent expected fields
the current UI/contract does not expose — Discovery establishes the exact comparison set.

## 8. Step 6 — Save/Import

After the retrieved details are validated, click Save/the current Import action.

**Expected:** the PNR is imported successfully into the Target NDC environment. Capture: success
message, resulting booking reference/state, relevant network/API evidence where available.

## 9. Step 7 — Verify wallet

Check the applicable Branch/Agency wallet **before** and **after** import, then verify the actual
deduction rather than checking only that "something changed." (HIST-07, HIST-08.) The exact expected
amount/calculation comes from confirmed business requirements and the booking data captured in §3 —
never invented.

## 10. Step 8 — Verify Rule Engine

Verify the applicable Rule Engine result. **Critical rule:** the applicable rule must be based on the
**original offline ticketing date/time** of the booking (HIST-09, HIST-10), not the time Import
Booked PNR was executed. Retain the Source booking's original ticketing timestamp (§3) as test
evidence, and where possible compare: Source ticketing date/time → rule batch applicable at that time
→ rule result after Import Booked PNR.

Do not guess expected Rule Engine behavior where `FeatureChecklistProfile.md` §B marks the item Open
or Provisional — specifically, do not assert an expected result for the HIST-20 "rule batch deleted
before import" case; it remains an open business gap.

## 11. Step 9 — Verify booking persistence

Navigate to the Search Booking page in the Target environment and search for the imported PNR.
**Expected:** the imported booking is found — this confirms the operation persisted/imported the
booking (HIST-11), not merely retrieved/displayed it.

## 12. Step 10 — Verify itinerary details

Open Itinerary Details for the imported booking. Verify Booking Status/import classification reflects
the expected Manual Import behavior where that historical requirement still applies (HIST-11), and
verify booking information against all three checkpoints in §7 below.

## 13. Post-Import Comparison

After Import Booked PNR succeeds, compare the imported booking against the Source Booking Snapshot
(§3) at three checkpoints:

```
SOURCE SUPPLIER BOOKING
        ↓
NDC CORE SERVICE RETRIEVAL / IMPORT SCREEN
        ↓
PERSISTED TARGET BOOKING
```

For every captured field, classify the result as one of:

- **Exact Match**
- **Expected Normalization/Transformation**
- **Missing**
- **Unexpected Difference**
- **Not Exposed / Not Verifiable**

A difference is a defect only when it violates a confirmed contract/business requirement — do not
automatically fail a difference that is an intentional NDC Core Service normalization.

## 14. Price Comparison — high priority

Pricing is a high-priority comparison area. Record the complete Source price before import (§3), then
after import verify: base fare, taxes, tax breakdown, total amount, currency, passenger-level fare,
ticket amount (where applicable), and any business-calculated amounts used by NDC. Compare the
expected wallet deduction (§9) against the imported booking's final financial result — do not verify
wallet deduction independently from the original booking price.

The execution evidence should be able to answer, in order:

1. What did the Supplier booking cost originally?
2. What pricing did NDC Core Service retrieve?
3. What pricing was stored after import?
4. What amount was deducted from the wallet?

## 15. Evidence

Preserve, where possible, from the Source environment before leaving it: screenshots, API/network
payloads, PNR details, fare breakdown, ticket details, itinerary, ancillary/baggage data, original
ticketing timestamp. Do not rely on memory or return later expecting Source booking details to still
be easily available — the Source Booking Snapshot (§3) is mandatory evidence for the Happy Path and
for migration comparison (MIG-03).

## 16. Execution Data Relationship — what every Happy Path execution must record

Source and Target configuration are linked test data — treat them as one execution record, not two
independent ones.

| | Fields |
|---|---|
| **Source Environment** | Environment, Supplier, Credential, PCC/Market, Branch/Agency, Generated PNR, Ticket status, Ticket number(s), Original ticketing timestamp |
| **Target Environment** | Environment, Branch, Agency, Supplier, Credential, PCC/Market, Import user |
| **Result** | Search/retrieval result, Import result, Wallet before, Wallet after, Rule Engine evidence, Persisted booking, Itinerary/import status |

This relationship must be preserved in execution evidence, not scattered across disconnected
artifacts.

## 17. Supplier independence

This execution model is shared across Import Booked PNR Suppliers; actual configuration and test data
are Supplier-specific. Never use one Supplier's PNR to validate another Supplier unless a test
explicitly requires cross-provider behavior.

```
Travelport NDC run → create Travelport NDC offline booking → configure Travelport NDC on Target
                      → import using Travelport NDC

Sabre NDC run       → create Sabre NDC offline booking      → configure Sabre NDC on Target
                      → import using Sabre NDC
```

## 18. How this is inherited

This document is Feature-level operational knowledge. It is **referenced, never duplicated**, by
every Import Booked PNR Supplier run:

- A Supplier's `SupplierChecklist.md` §3c records its own `SOURCE_ENVIRONMENT` / `TARGET_ENVIRONMENT`
  values, Supplier/Credential/Market/Branch/Agency configuration, and a pointer back to this file's
  path — it does not restate the procedure.
- Discovery, Manual Execution, and Automation for Travelport NDC / Sabre NDC read this file for HOW to
  execute the Happy Path, and record only their own execution evidence (§16) and any Supplier-specific
  deviation they discover.
- A Supplier-specific deviation from this procedure (e.g. a different navigation path, an additional
  required field) belongs in that Supplier's own Checklist/Discovery output, not as an edit to this
  Feature-level file — unless the deviation reveals the Happy Path procedure itself was wrong for
  every Supplier, in which case this file is corrected in place and the change is recorded, not
  silently overwritten.
