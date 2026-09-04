# Manual Test Suite — Import Booked PNR (NDC_Core_service Integration)

| Field | Value |
|---|---|
| Module | `import-booked-pnr` |
| Feature | `new-layer-contract` |
| Produced by run | `run-005__2026-09-01_11-41-40__UserStory__ImportBookedPNR-NewLayerContract` |
| Revision | 2 (corrected — see Revision Note) |
| Run Scope Type / Run Type | Feature / User Story |
| Project Context | `modules/import-booked-pnr/features/new-layer-contract/context/ProjectContext.md` (rev 2) |
| Total Test Cases | 61 |
| Generated | 2026-09-01 |
| Status | Pending Review |

> **Revision note (2026-09-01, revision 2).** Revision 1 treated Import Booked PNR as an entirely new
> feature. That was wrong. The **business capability already exists** with historical requirements;
> what is new is the **integration path** — `NDC_Core_service` replacing NDC Integration (NDC-INT) for
> supplier/GDS booking retrieval. This suite is rebuilt on that corrected understanding: every one of
> revision 1's 15 cases was reviewed individually (see the Change Log at the end), fabricated
> expected results were removed, and historical-business regression coverage was added.
>
> **Discovery gap:** Stage 2 (Explorer) has not run — no live `NDC_Core_service` endpoint exists yet.
> Every case's Discovery Reference reads `Requires Upstream Stage — Stage 2 not run`.
> **Smallest unblocking prerequisite:** the developer exposes `NDC_Core_service` on a reachable
> environment, then `/explorer-skill` runs against it.
>
> **Revision 3 note.** `Import Booked PNR Meeting 1 (23-11).pdf` — a business-authored slide deck —
> added eight new historical requirements (HR-IBPNR-04 refined, HR-IBPNR-05 … HR-IBPNR-10) not present
> in the revision-2 prose Historical Documentation: the two-part enablement toggle, offline-ticketing
> and dual-status eligibility, Rule Engine batch mechanics and batch-deletion retention risk, the
> NDC Integration/NDC Core validation split, broader multi-PNR concurrency, and a named (provisional)
> reports list. Eight cases (TC-IBPNR-REG-017 … 024) were added for them. No existing case was
> invalidated by Meeting 1 — see Project Context §9 for the one point requiring reconciliation
> (Rule Engine mechanism) and the one point flagged rather than reconciled (the Failed-status(4) case
> Meeting 1 does not mention).

## Test Case Classification

Every case carries exactly one classification tag, so no case is read as more certain than its evidence:

| Tag | Meaning |
|---|---|
| **ClassA-Confirmed** | Expected behavior is supported by verified requirements, a signed specification, or Discovery evidence |
| **ClassB-Regression** | Existing Import Booked PNR business behavior (Historical Documentation) that must remain compatible after the NDC-INT → `NDC_Core_service` migration |
| **ClassC-Discovery** | Written to *discover* currently unspecified contract behavior; the expected result records what must be observed and documented, not a fixed pass/fail assertion invented here |
| **ClassD-Blocked** | Cannot have a trustworthy expected result yet — a named Open Question must be answered first |

**No case is tagged ClassA-Confirmed in this revision.** Nothing about `NDC_Core_service` has been
verified against a live endpoint or a signed specification yet. That is a statement of evidence, not
of test quality.

## Case Index

| Test Case ID | Title | Tier | Priority | Tags | Review | Automation |
|---|---|---|---|---|---|---|
| TC-IBPNR-001 | Retrieve a ticketed booking via Travelport GDS provider | Atomic | P1 | ClassC-Discovery, Positive | Pending | Pending |
| TC-IBPNR-002 | Retrieve a ticketed booking via Sabre NDC provider | Atomic | P1 | ClassC-Discovery, Positive | Pending | Pending |
| TC-IBPNR-003 | Passenger data is returned and mapped | Atomic | P1 | ClassC-Discovery, Positive | Pending | Pending |
| TC-IBPNR-004 | Segment data is returned and mapped | Atomic | P1 | ClassC-Discovery, Positive | Pending | Pending |
| TC-IBPNR-005 | Fare and tax data is returned and mapped | Atomic | P1 | ClassC-Discovery, Positive | Pending | Pending |
| TC-IBPNR-006 | Ticket and coupon data is returned and mapped | Atomic | P1 | ClassC-Discovery, Positive | Pending | Pending |
| TC-IBPNR-007 | Baggage allowance data is returned and mapped | Atomic | P2 | ClassC-Discovery, Positive | Pending | Pending |
| TC-IBPNR-008 | Service/ancillary data is returned and mapped | Atomic | P2 | ClassC-Discovery, Positive | Pending | Pending |
| TC-IBPNR-009 | Response data types match the documented contract | Atomic | P2 | ClassC-Discovery | Pending | Pending |
| TC-IBPNR-010 | Currency is consistent across all monetary values | Atomic | P2 | ClassC-Discovery | Pending | Pending |
| TC-IBPNR-011 | Base + tax total equals the stated total | Atomic | P2 | ClassC-Discovery | Pending | Pending |
| TC-IBPNR-012 | Passenger-to-ticket relationship resolves correctly | Atomic | P1 | ClassC-Discovery | Pending | Pending |
| TC-IBPNR-013 | Segment-to-coupon relationship resolves correctly | Atomic | P1 | ClassC-Discovery | Pending | Pending |
| TC-IBPNR-014 | Multi-passenger booking is fully mapped | Atomic | P1 | ClassC-Discovery | Pending | Pending |
| TC-IBPNR-015 | Connecting itinerary with multiple segments is fully mapped | Atomic | P1 | ClassC-Discovery | Pending | Pending |
| TC-IBPNR-016 | Booking with multiple issued tickets is fully mapped | Atomic | P2 | ClassC-Discovery | Pending | Pending |
| TC-IBPNR-017 | ADT, CHD and INF passenger types are mapped correctly | Atomic | P1 | ClassC-Discovery | Pending | Pending |
| TC-IBPNR-018 | Optional collections behave consistently when the supplier returns no data | Atomic | P2 | ClassC-Discovery | Pending | Pending |
| TC-IBPNR-019 | Null-valued fields are represented consistently | Atomic | P2 | ClassC-Discovery | Pending | Pending |
| TC-IBPNR-020 | Supplier fields not in the contract are handled predictably | Atomic | P2 | ClassC-Discovery | Pending | Pending |
| TC-IBPNR-021 | Provider normalization: same booking shape across both providers | Scenario | P1 | ClassC-Discovery, Integration | Pending | Pending |
| TC-IBPNR-022 | Behavior when recordLocator does not exist at the supplier | Atomic | P1 | ClassD-Blocked, Negative | Pending | Pending |
| TC-IBPNR-023 | Behavior when providerId is omitted | Atomic | P1 | ClassD-Blocked, Negative | Pending | Pending |
| TC-IBPNR-024 | Behavior when providerId names an unsupported provider | Atomic | P1 | ClassD-Blocked, Negative | Pending | Pending |
| TC-IBPNR-025 | Behavior for providerId supplied in different letter casing | Atomic | P3 | ClassD-Blocked, Negative | Pending | Pending |
| TC-IBPNR-026 | Determine whether a recordLocator length rule exists | Atomic | P2 | ClassC-Discovery, Negative-BoundaryValues | Pending | Pending |
| TC-IBPNR-027 | Injection-shaped recordLocator is handled safely | Atomic | P1 | ClassC-Discovery, Negative-SecurityInputs | Pending | Pending |
| TC-IBPNR-028 | Non-Latin recordLocator is handled safely | Atomic | P3 | ClassC-Discovery, Negative-Unicode | Pending | Pending |
| TC-IBPNR-029 | Empty recordLocator path segment is handled safely | Atomic | P2 | ClassC-Discovery, Negative-EmptyValues | Pending | Pending |
| TC-IBPNR-030 | Behavior when the supplier does not respond within the timeout | Atomic | P1 | ClassD-Blocked, Negative-Timeouts | Pending | Pending |
| TC-IBPNR-031 | Behavior when the supplier is unavailable | Atomic | P1 | ClassD-Blocked, Negative | Pending | Pending |
| TC-IBPNR-032 | Behavior when supplier authentication fails | Atomic | P1 | ClassD-Blocked, Negative | Pending | Pending |
| TC-IBPNR-033 | Behavior when the supplier returns a malformed response | Atomic | P2 | ClassD-Blocked, Negative | Pending | Pending |
| TC-IBPNR-034 | Behavior when the supplier returns a partial response | Atomic | P2 | ClassD-Blocked, Negative | Pending | Pending |
| TC-IBPNR-035 | Behavior on an internal NDC_Core_service failure | Atomic | P2 | ClassD-Blocked, Negative | Pending | Pending |
| TC-IBPNR-036 | Supplier errors are normalized rather than leaked verbatim | Atomic | P1 | ClassD-Blocked, Negative | Pending | Pending |
| TC-IBPNR-037 | Endpoint authentication and authorization behavior | Atomic | P1 | ClassD-Blocked, Security | Pending | Pending |
| TC-IBPNR-REG-001 | Ticketed PNR is eligible for import | Atomic | P1 | ClassB-Regression | Pending | Pending |
| TC-IBPNR-REG-002 | Held PNR is rejected as ineligible | Atomic | P1 | ClassB-Regression, Negative | Pending | Pending |
| TC-IBPNR-REG-003 | Cancelled PNR is rejected as ineligible | Atomic | P1 | ClassB-Regression, Negative | Pending | Pending |
| TC-IBPNR-REG-004 | PNR not existing in NDC is importable | Atomic | P1 | ClassB-Regression | Pending | Pending |
| TC-IBPNR-REG-005 | PNR existing with Failed status (4) is importable | Atomic | P1 | ClassB-Regression | Pending | Pending |
| TC-IBPNR-REG-006 | Duplicate import of the same PNR is prevented | Atomic | P1 | ClassB-Regression, Negative | Pending | Pending |
| TC-IBPNR-REG-007 | Concurrent import of the same PNR by two users is prevented | Atomic | P1 | ClassB-Regression, Negative | Pending | Pending |
| TC-IBPNR-REG-008 | Organization without Import Booked PNR permission is refused | Atomic | P1 | ClassB-Regression, Negative | Pending | Pending |
| TC-IBPNR-REG-009 | Organization without required PCC configuration is refused | Atomic | P1 | ClassB-Regression, Negative | Pending | Pending |
| TC-IBPNR-REG-010 | Organization with insufficient wallet credit is refused | Atomic | P1 | ClassB-Regression, Negative | Pending | Pending |
| TC-IBPNR-REG-011 | Wallet is deducted correctly after a successful import | Atomic | P1 | ClassB-Regression | Pending | Pending |
| TC-IBPNR-REG-012 | Rule Engine uses the offline ticketing date/time, not the import time | Atomic | P1 | ClassB-Regression | Pending | Pending |
| TC-IBPNR-REG-013 | A rule disabled after ticketing still applies to the imported PNR | Atomic | P1 | ClassB-Regression | Pending | Pending |
| TC-IBPNR-REG-014 | Imported booking is persisted with the correct import classification | Atomic | P1 | ClassB-Regression | Pending | Pending |
| TC-IBPNR-REG-015 | A successful import creates exactly one booking record | Atomic | P1 | ClassB-Regression | Pending | Pending |
| TC-IBPNR-REG-016 | Business data matches between the NDC-INT path and the NDC_Core_service path | Scenario | P1 | ClassB-Regression, Integration | Pending | Pending |
| TC-IBPNR-REG-017 | Rule Engine behavior when the original rule batch has been deleted | Atomic | P1 | ClassD-Blocked | Pending | Pending |
| TC-IBPNR-REG-018 | Import is refused when the Agency's Import PNR Option is not checked | Atomic | P1 | ClassB-Regression, Negative | Pending | Pending |
| TC-IBPNR-REG-019 | Staff-initiated import is refused when the Admin's Import PNR Option is not checked | Atomic | P1 | ClassB-Regression, Negative | Pending | Pending |
| TC-IBPNR-REG-020 | Both NDC Integration and NDC Core validations are applied to the import | Atomic | P1 | ClassB-Regression | Pending | Pending |
| TC-IBPNR-REG-021 | Simultaneous import of different PNRs under different rule batches on the same day | Scenario | P2 | ClassB-Regression | Pending | Pending |
| TC-IBPNR-REG-022 | Imported booking is reflected in the Agency Detailed Report | Atomic | P2 | ClassB-Regression, Exploratory | Pending | Pending |
| TC-IBPNR-REG-023 | Agency History Wallet report reflects the import and is visible to Super Admin only | Atomic | P2 | ClassB-Regression, Exploratory | Pending | Pending |
| TC-IBPNR-REG-024 | Imported booking is reflected across Finance, Statement, Ledger, Bookings, Sales and Import PNR reports | Atomic | P2 | ClassB-Regression, Exploratory | Pending | Pending |

**Tier breakdown:** 58 Atomic · 3 Scenario · 0 E2E

**Classification breakdown:** 0 ClassA-Confirmed · 24 ClassB-Regression · 21 ClassC-Discovery · 17 ClassD-Blocked

**Lifecycle breakdown:** Review — 61 Pending · 0 Approved · 0 Rejected · Automation — 61 Pending · 0 Approved · 0 Rejected

## Test Cases

### TC-IBPNR-001 — Retrieve a ticketed booking via Travelport GDS provider

**Objective:** Verify NDC_Core_service returns a booking record for a known ticketed PNR retrieved through a Travelport GDS provider.

**Preconditions:** NDC_Core_service is reachable. A ticketed booking exists at the supplier for the given record locator.

**Test Data:**

| Field | Value |
|---|---|
| Request | `GET /api/v1/bookings/HMZ897?providerId=TRAVELPORT_GDS` |

**Steps:**

1. Send the request.
2. Record the HTTP status code and the response body.

**Expected Result:** A success response is returned containing a `bookedPnr` object whose `recordLocator` and `providerId` match the values requested. Record the exact status code and full response as the contract baseline.

**Priority:** P1

**Tags:** Atomic, ClassC-Discovery, Positive, Smoke

**Notes:** Anchored on the developer-supplied example payload for HMZ897 (Saudia CAI→JED). The example is a reference, not a signed specification — the observed status code and field set become evidence, they are not asserted in advance.

**Review:** Pending

**Automation:** Pending

---

### TC-IBPNR-002 — Retrieve a ticketed booking via Sabre NDC provider

**Objective:** Verify NDC_Core_service returns a booking record for a known ticketed PNR retrieved through a Sabre NDC provider.

**Preconditions:** NDC_Core_service is reachable. A ticketed booking exists at the supplier for the given record locator.

**Test Data:**

| Field | Value |
|---|---|
| Request | `GET /api/v1/bookings/SIMQRC?providerId=SABRE_NDC` |

**Steps:**

1. Send the request.
2. Record the HTTP status code and the response body.

**Expected Result:** A success response is returned containing a `bookedPnr` object whose `recordLocator` and `providerId` match the values requested. Record the exact status code and full response as the contract baseline for this provider.

**Priority:** P1

**Tags:** Atomic, ClassC-Discovery, Positive

**Notes:** Anchored on the developer-supplied example payload for SIMQRC (Qatar Airways CAI→DOH).

**Review:** Pending

**Automation:** Pending

---

### TC-IBPNR-003 — Passenger data is returned and mapped

**Objective:** Verify passenger data from the supplier appears in the response and matches the supplier's own record.

**Preconditions:** A successful retrieval has been performed for a booking with at least one passenger. The supplier-side passenger data for that booking is known.

**Steps:**

1. Send a retrieval request for a booking with known passenger data.
2. Compare each entry in the response's `passengers` array against the supplier's record.

**Expected Result:** Every passenger present at the supplier appears in the response, with name and passenger type matching the supplier's record. Record which passenger fields are populated and which are null.

**Priority:** P1

**Tags:** Atomic, ClassC-Discovery, Positive

**Notes:** Which passenger fields are mandatory is an Open Question — this case records what is returned rather than asserting a required field set.

**Review:** Pending

**Automation:** Pending

---

### TC-IBPNR-004 — Segment data is returned and mapped

**Objective:** Verify flight segment data from the supplier appears in the response and matches the supplier's own record.

**Preconditions:** A successful retrieval has been performed for a booking with at least one segment. The supplier-side segment data is known.

**Steps:**

1. Send a retrieval request for a booking with known segment data.
2. Compare each entry in the response's `segments` array against the supplier's record.

**Expected Result:** Every segment present at the supplier appears in the response, with carrier, flight number, departure and arrival airports, dates and times matching the supplier's record. Record which segment fields are populated and which are null.

**Priority:** P1

**Tags:** Atomic, ClassC-Discovery, Positive

**Review:** Pending

**Automation:** Pending

---

### TC-IBPNR-005 — Fare and tax data is returned and mapped

**Objective:** Verify fare and tax data from the supplier appears in the response and matches the supplier's own record.

**Preconditions:** A successful retrieval has been performed for a booking with a known fare breakdown.

**Steps:**

1. Send a retrieval request for a booking with a known fare breakdown.
2. Compare the response's `fares` entries — base, tax total, total, and individual tax codes — against the supplier's record.

**Expected Result:** Base amount, tax total, grand total, and each individual tax code and amount match the supplier's record. Record the currency used and whether every supplier tax line is represented.

**Priority:** P1

**Tags:** Atomic, ClassC-Discovery, Positive

**Notes:** Fare and tax values feed Rule Engine calculation and wallet deduction downstream (Historical Documentation §1), so a mapping error here has business impact beyond the contract.

**Review:** Pending

**Automation:** Pending

---

### TC-IBPNR-006 — Ticket and coupon data is returned and mapped

**Objective:** Verify issued ticket and coupon data from the supplier appears in the response and matches the supplier's own record.

**Preconditions:** A successful retrieval has been performed for a ticketed booking with known ticket numbers.

**Steps:**

1. Send a retrieval request for a ticketed booking with known ticket data.
2. Compare the response's `tickets` entries and their `coupons` against the supplier's record.

**Expected Result:** Every issued ticket appears with its ticket number and validating carrier matching the supplier's record, and each ticket's coupons match the supplier's coupon list. Record which ticket and coupon fields are populated.

**Priority:** P1

**Tags:** Atomic, ClassC-Discovery, Positive

**Review:** Pending

**Automation:** Pending

---

### TC-IBPNR-007 — Baggage allowance data is returned and mapped

**Objective:** Verify baggage allowance data from the supplier appears in the response and matches the supplier's own record.

**Preconditions:** A successful retrieval has been performed for a booking that has baggage allowances at the supplier.

**Steps:**

1. Send a retrieval request for a booking with known baggage allowances.
2. Compare the response's `baggageAllowances` entries against the supplier's record.

**Expected Result:** Each baggage allowance at the supplier appears in the response with its type, piece count and weight matching. Record how allowances are associated with passengers and segments.

**Priority:** P2

**Tags:** Atomic, ClassC-Discovery, Positive

**Review:** Pending

**Automation:** Pending

---

### TC-IBPNR-008 — Service/ancillary data is returned and mapped

**Objective:** Verify service and ancillary data from the supplier appears in the response and matches the supplier's own record.

**Preconditions:** A successful retrieval has been performed for a booking that has services or ancillaries at the supplier.

**Steps:**

1. Send a retrieval request for a booking with known services.
2. Compare the response's `services` entries against the supplier's record.

**Expected Result:** Each service at the supplier appears in the response with its code and status matching, and is associated with the correct passengers and segments. Record which service fields are populated.

**Priority:** P2

**Tags:** Atomic, ClassC-Discovery, Positive

**Review:** Pending

**Automation:** Pending

---

### TC-IBPNR-009 — Response data types match the documented contract

**Objective:** Verify each response field uses the data type the contract defines.

**Preconditions:** A successful retrieval has been performed. A documented contract or schema for NDC_Core_service is available.

**Steps:**

1. Send a retrieval request.
2. Compare each field's data type in the response against the contract's declared type.

**Expected Result:** Every field's type matches the contract — amounts are numeric, dates and times use the documented format, counts are integers, and flags are boolean. Record any field whose type differs from the contract or varies between providers.

**Priority:** P2

**Tags:** Atomic, ClassC-Discovery

**Notes:** Blocked in part on the contract itself: no formal schema exists yet (Project Context §8). Until one does, this case records observed types as the basis for the schema rather than checking against it.

**Review:** Pending

**Automation:** Pending

---

### TC-IBPNR-010 — Currency is consistent across all monetary values

**Objective:** Verify every monetary value in one booking response uses a consistent currency.

**Preconditions:** A successful retrieval has been performed for a booking with fares, taxes and ticket prices.

**Steps:**

1. Send a retrieval request.
2. Collect the currency of every monetary value in the response — booking price, fare prices, individual taxes, and ticket prices.

**Expected Result:** All monetary values share the same currency, except any field the contract explicitly documents as a supplier-filed amount in a different currency. Record every currency found and where it appears.

**Priority:** P2

**Tags:** Atomic, ClassC-Discovery

**Notes:** The developer's Travelport example shows a filed amount in USD alongside AED prices — whether that mix is intended is an Open Question, not a defect to assert here.

**Review:** Pending

**Automation:** Pending

---

### TC-IBPNR-011 — Base + tax total equals the stated total

**Objective:** Verify the response's price totals are internally consistent.

**Preconditions:** A successful retrieval has been performed for a booking with a base fare and taxes.

**Steps:**

1. Send a retrieval request.
2. Add the base amount and the tax total, and compare the sum with the stated total.
3. Add the individual tax amounts and compare the sum with the stated tax total.

**Expected Result:** Base plus tax total equals the stated total, and the individual taxes sum to the stated tax total, at every level the contract defines them (booking, fare, and ticket). Record any level where they do not reconcile.

**Priority:** P2

**Tags:** Atomic, ClassC-Discovery

**Review:** Pending

**Automation:** Pending

---

### TC-IBPNR-012 — Passenger-to-ticket relationship resolves correctly

**Objective:** Verify each ticket in the response points to a passenger that exists in the same response.

**Preconditions:** A successful retrieval has been performed for a ticketed booking.

**Steps:**

1. Send a retrieval request.
2. For each ticket, resolve its passenger reference against the response's passenger list.

**Expected Result:** Every ticket resolves to exactly one passenger present in the response, and the resolved passenger matches the traveller the supplier issued that ticket to.

**Priority:** P1

**Tags:** Atomic, ClassC-Discovery

**Review:** Pending

**Automation:** Pending

---

### TC-IBPNR-013 — Segment-to-coupon relationship resolves correctly

**Objective:** Verify each coupon in the response points to a segment that exists in the same response.

**Preconditions:** A successful retrieval has been performed for a ticketed booking.

**Steps:**

1. Send a retrieval request.
2. For each coupon, resolve its segment reference against the response's segment list.

**Expected Result:** Every coupon resolves to exactly one segment present in the response, and the resolved segment matches the flight the coupon covers at the supplier.

**Priority:** P1

**Tags:** Atomic, ClassC-Discovery

**Review:** Pending

**Automation:** Pending

---

### TC-IBPNR-014 — Multi-passenger booking is fully mapped

**Objective:** Verify a booking with more than one passenger returns all passengers with their individual fares and tickets.

**Preconditions:** A ticketed booking with at least two passengers exists at the supplier.

**Steps:**

1. Send a retrieval request for the multi-passenger booking.
2. Compare the passenger, fare and ticket data in the response against the supplier's record.

**Expected Result:** Every passenger appears, each with the fare and ticket the supplier issued to them. No passenger's data is merged into another's or omitted.

**Priority:** P1

**Tags:** Atomic, ClassC-Discovery

**Review:** Pending

**Automation:** Pending

---

### TC-IBPNR-015 — Connecting itinerary with multiple segments is fully mapped

**Objective:** Verify a booking with connecting flights returns every segment in the correct order.

**Preconditions:** A ticketed booking with at least two connecting segments exists at the supplier.

**Steps:**

1. Send a retrieval request for the connecting-itinerary booking.
2. Compare the segment list and its ordering against the supplier's record.

**Expected Result:** Every segment appears in the supplier's travel order, each with its own departure and arrival details, and each links to its own coupon.

**Priority:** P1

**Tags:** Atomic, ClassC-Discovery

**Review:** Pending

**Automation:** Pending

---

### TC-IBPNR-016 — Booking with multiple issued tickets is fully mapped

**Objective:** Verify a booking with more than one issued ticket returns all of them.

**Preconditions:** A booking with at least two issued tickets exists at the supplier.

**Steps:**

1. Send a retrieval request for the multi-ticket booking.
2. Compare the ticket list against the supplier's record.

**Expected Result:** Every issued ticket appears with its own number, passenger and coupons. No ticket is omitted or duplicated.

**Priority:** P2

**Tags:** Atomic, ClassC-Discovery

**Review:** Pending

**Automation:** Pending

---

### TC-IBPNR-017 — ADT, CHD and INF passenger types are mapped correctly

**Objective:** Verify adult, child and infant passenger types are each returned with their own type code and fare.

**Preconditions:** A ticketed booking containing adult, child and infant passengers exists at the supplier.

**Steps:**

1. Send a retrieval request for the mixed-passenger-type booking.
2. Compare each passenger's type code and associated fare against the supplier's record.

**Expected Result:** Each passenger carries the passenger type code the supplier assigned, and each type's fare matches the supplier's per-type fare.

**Priority:** P1

**Tags:** Atomic, ClassC-Discovery

**Notes:** Whether NDC_Core_service supports all three passenger types is itself an Open Question — if a type is unsupported, record that as the finding rather than as a failure.

**Review:** Pending

**Automation:** Pending

---

### TC-IBPNR-018 — Optional collections behave consistently when the supplier returns no data

**Objective:** Determine how the response represents a collection the supplier returned no data for.

**Preconditions:** A booking exists at the supplier with no baggage allowances and no services.

**Steps:**

1. Send a retrieval request for that booking.
2. Record how `baggageAllowances` and `services` appear — empty array, null, or absent.

**Expected Result:** The representation is recorded and is consistent across providers and across all optional collections. Whichever representation is used, no error is raised and the rest of the response is unaffected.

**Priority:** P2

**Tags:** Atomic, ClassC-Discovery, Positive

**Notes:** Revision 1 asserted these fields must be `[]`. That was extrapolated from one example and is not a confirmed rule — this case now discovers the representation instead of asserting it.

**Review:** Pending

**Automation:** Pending

---

### TC-IBPNR-019 — Null-valued fields are represented consistently

**Objective:** Determine how the response represents a field the supplier provided no value for.

**Preconditions:** A successful retrieval has been performed for bookings from both providers.

**Steps:**

1. Send retrieval requests for a booking from each provider.
2. Record, per field, whether an unset value appears as null, as an empty string, or as an absent key.

**Expected Result:** The representation of unset values is consistent within and across providers. Record every field where the representation differs, as input to the contract definition.

**Priority:** P2

**Tags:** Atomic, ClassC-Discovery

**Notes:** The two developer examples already differ — for instance, `filedAmount` and `fareCalculation` are populated in the Travelport example and null in the Sabre example. Whether that reflects supplier data or inconsistent mapping is unknown.

**Review:** Pending

**Automation:** Pending

---

### TC-IBPNR-020 — Supplier fields not in the contract are handled predictably

**Objective:** Determine what NDC_Core_service does with supplier data that has no field in the contract.

**Preconditions:** A booking exists whose supplier response contains data outside the documented contract, or the supplier response can be inspected alongside the NDC_Core_service response.

**Steps:**

1. Retrieve the raw supplier response for a booking.
2. Send a retrieval request for the same booking through NDC_Core_service.
3. Compare the two, listing supplier data that does not appear in the NDC_Core_service response.

**Expected Result:** Supplier data outside the contract is either mapped to a documented field or deliberately dropped — never causing an error or corrupting an adjacent field. Record every dropped item so the business can confirm none of it is needed.

**Priority:** P2

**Tags:** Atomic, ClassC-Discovery

**Notes:** Directly relevant to migration risk R-IBPNR-04 — data NDC-INT surfaced but NDC_Core_service drops would be a silent behavior change.

**Review:** Pending

**Automation:** Pending

---

### TC-IBPNR-021 — Provider normalization: same booking shape across both providers

**Objective:** Verify a booking retrieved through different providers is normalized into the same response structure.

**Preconditions:** Ticketed bookings are available through both a GDS provider and an NDC provider.

**Steps:**

1. Send a retrieval request for a booking through the Travelport GDS provider.
2. Send a retrieval request for a booking through the Sabre NDC provider.
3. Compare the two responses field by field at the structural level.

**Expected Result:** Both responses use the same object structure and field names. Any structural difference is attributable to a documented supplier capability difference, not to inconsistent normalization. Record every difference found.

**Priority:** P1

**Tags:** Scenario, ClassC-Discovery, Integration

**Notes:** Normalization consistency is the main value NDC_Core_service adds over calling suppliers directly; a structural difference here would push supplier-specific handling back into NDC Core.

**Review:** Pending

**Automation:** Pending

---

### TC-IBPNR-022 — Behavior when recordLocator does not exist at the supplier

**Objective:** Determine the response when the requested record locator has no booking at the supplier.

**Preconditions:** NDC_Core_service is reachable. A record locator known not to exist at the supplier is available.

**Test Data:**

| Field | Value |
|---|---|
| Request | `GET /api/v1/bookings/{non-existent locator}?providerId=TRAVELPORT_GDS` |

**Steps:**

1. Send the request with a record locator that does not exist at the supplier.
2. Record the HTTP status code and the response body.

**Expected Result:** *Cannot be stated yet — the error contract is undefined (Project Context §8).* Once defined: the response distinguishes "booking not found" from a service failure, and returns no partial booking data. Record the observed status code and message so the contract can be written from it.

**Priority:** P1

**Tags:** Atomic, ClassD-Blocked, Negative

**Notes:** Revision 1 asserted a `4xx`. That was invented, not evidenced. Blocked pending the developer confirming the error-response contract.

**Review:** Pending

**Automation:** Pending

---

### TC-IBPNR-023 — Behavior when providerId is omitted

**Objective:** Determine the response when the `providerId` query parameter is not supplied.

**Preconditions:** NDC_Core_service is reachable.

**Test Data:**

| Field | Value |
|---|---|
| Request | `GET /api/v1/bookings/HMZ897` (no `providerId`) |

**Steps:**

1. Send the request without the `providerId` parameter.
2. Record the HTTP status code and the response body.

**Expected Result:** *Cannot be stated yet — whether `providerId` is mandatory is an Open Question (Project Context §8).* Record whether the service rejects the request, applies a default provider, or attempts a lookup across providers, so the contract can document the actual rule.

**Priority:** P1

**Tags:** Atomic, ClassD-Blocked, Negative

**Notes:** Revision 1 asserted `providerId` is mandatory because both examples include it. Presence in an example is not evidence of a mandatory parameter.

**Review:** Pending

**Automation:** Pending

---

### TC-IBPNR-024 — Behavior when providerId names an unsupported provider

**Objective:** Determine the response when `providerId` names a provider the service does not support.

**Preconditions:** NDC_Core_service is reachable.

**Test Data:**

| Field | Value |
|---|---|
| Request | `GET /api/v1/bookings/HMZ897?providerId=UNKNOWN_SUPPLIER_X` |

**Steps:**

1. Send the request with an unsupported provider identifier.
2. Record the HTTP status code and the response body.

**Expected Result:** *Cannot be stated yet — the error contract is undefined.* Once defined: the response indicates the provider is not supported and returns no booking data from any other provider. Record the observed behavior.

**Priority:** P1

**Tags:** Atomic, ClassD-Blocked, Negative

**Review:** Pending

**Automation:** Pending

---

### TC-IBPNR-025 — Behavior for providerId supplied in different letter casing

**Objective:** Determine whether provider identifiers are case-sensitive.

**Preconditions:** NDC_Core_service is reachable. A valid booking and provider are known.

**Test Data:**

| Field | Value |
|---|---|
| Request A | `GET /api/v1/bookings/HMZ897?providerId=TRAVELPORT_GDS` |
| Request B | `GET /api/v1/bookings/HMZ897?providerId=travelport_gds` |

**Steps:**

1. Send request A and record the outcome.
2. Send request B and record the outcome.
3. Compare the two.

**Expected Result:** *Cannot be stated yet — case sensitivity is an Open Question.* Record whether the two requests behave identically, so the contract can document the rule either way.

**Priority:** P3

**Tags:** Atomic, ClassD-Blocked, Negative

**Review:** Pending

**Automation:** Pending

---

### TC-IBPNR-026 — Determine whether a recordLocator length rule exists

**Objective:** Discover whether NDC_Core_service enforces a minimum or maximum record locator length.

**Preconditions:** NDC_Core_service is reachable.

**Test Data:**

| Field | Value |
|---|---|
| Requests | Record locators of length 1, 5, 6, 9, 10 and 30, each with `providerId=TRAVELPORT_GDS` |

**Steps:**

1. Send a retrieval request for each record locator length in the test data.
2. Record the HTTP status code and response for each.

**Expected Result:** The observed behavior at each length is recorded, showing whether a length rule exists and where its boundaries lie. No length causes a server error.

**Priority:** P2

**Tags:** Atomic, ClassC-Discovery, Negative-BoundaryValues

**Notes:** Revision 1 asserted a minimum length. No such rule is documented for NDC_Core_service. The unrelated Import PNR flow enforces 6–9 characters (PRD IPN-02/03) but that rule must not be assumed to carry over (Project Context R-IBPNR-02). This case discovers the rule instead of assuming one.

**Review:** Pending

**Automation:** Pending

---

### TC-IBPNR-027 — Injection-shaped recordLocator is handled safely

**Objective:** Verify a record locator containing injection-shaped characters causes no server error and returns no unintended data.

**Preconditions:** NDC_Core_service is reachable.

**Test Data:**

| Field | Value |
|---|---|
| Request | `GET /api/v1/bookings/' OR '1'='1?providerId=TRAVELPORT_GDS` (URL-encoded) |

**Steps:**

1. Send the request with the URL-encoded injection-shaped record locator.
2. Record the HTTP status code and the response body.

**Expected Result:** No server error occurs and no booking data belonging to another record locator is returned. Record the observed status code and message.

**Priority:** P1

**Tags:** Atomic, ClassC-Discovery, Negative-SecurityInputs

**Notes:** The expected result asserts only what holds regardless of the error contract — absence of a server error and absence of a data leak. The exact rejection status code remains an Open Question.

**Review:** Pending

**Automation:** Pending

---

### TC-IBPNR-028 — Non-Latin recordLocator is handled safely

**Objective:** Verify a record locator containing non-Latin characters causes no server error.

**Preconditions:** NDC_Core_service is reachable.

**Test Data:**

| Field | Value |
|---|---|
| Request | `GET /api/v1/bookings/日本語ABC?providerId=TRAVELPORT_GDS` (URL-encoded) |

**Steps:**

1. Send the request with the URL-encoded non-Latin record locator.
2. Record the HTTP status code and the response body.

**Expected Result:** No server error occurs and no character-encoding error appears in the response. Record the observed status code and message.

**Priority:** P3

**Tags:** Atomic, ClassC-Discovery, Negative-Unicode

**Review:** Pending

**Automation:** Pending

---

### TC-IBPNR-029 — Empty recordLocator path segment is handled safely

**Objective:** Verify calling the endpoint with no record locator causes no server error.

**Preconditions:** NDC_Core_service is reachable.

**Test Data:**

| Field | Value |
|---|---|
| Request | `GET /api/v1/bookings/?providerId=TRAVELPORT_GDS` |

**Steps:**

1. Send the request with an empty record locator segment.
2. Record the HTTP status code and the response body.

**Expected Result:** No server error occurs, and no booking data is returned. Record whether the request is rejected as a bad request, returns a not-found, or matches a different route.

**Priority:** P2

**Tags:** Atomic, ClassC-Discovery, Negative-EmptyValues

**Review:** Pending

**Automation:** Pending

---

### TC-IBPNR-030 — Behavior when the supplier does not respond within the timeout

**Objective:** Determine how NDC_Core_service responds when the supplier does not answer in time.

**Preconditions:** A means exists to make the supplier response slow or unanswered — a stub, a fault-injection facility, or a configured short timeout.

**Steps:**

1. Configure the supplier interaction to exceed the service's timeout.
2. Send a retrieval request.
3. Record the HTTP status code, the response body, and how long the caller waited.

**Expected Result:** *Cannot be stated yet — the timeout value and the error contract are both undefined.* Record the observed wait and response so the contract can document the timeout behavior and the caller's expected handling.

**Priority:** P1

**Tags:** Atomic, ClassD-Blocked, Negative-Timeouts

**Notes:** Requires a fault-injection capability that is not confirmed to exist. Blocked on both that capability and the error contract.

**Review:** Pending

**Automation:** Pending

---

### TC-IBPNR-031 — Behavior when the supplier is unavailable

**Objective:** Determine how NDC_Core_service responds when the supplier cannot be reached at all.

**Preconditions:** A means exists to make the supplier unreachable from NDC_Core_service.

**Steps:**

1. Make the supplier unreachable.
2. Send a retrieval request.
3. Record the HTTP status code and the response body.

**Expected Result:** *Cannot be stated yet — the error contract is undefined.* Once defined: the response distinguishes "supplier unavailable" from "booking not found", so the caller does not treat an outage as a missing booking. Record the observed behavior.

**Priority:** P1

**Tags:** Atomic, ClassD-Blocked, Negative

**Notes:** The distinction matters for the historical duplicate-prevention rule — treating an outage as "not found" could allow a second import attempt to proceed incorrectly.

**Review:** Pending

**Automation:** Pending

---

### TC-IBPNR-032 — Behavior when supplier authentication fails

**Objective:** Determine how NDC_Core_service responds when its own credentials for the supplier are rejected.

**Preconditions:** A means exists to make the supplier reject NDC_Core_service's credentials.

**Steps:**

1. Configure invalid or expired supplier credentials.
2. Send a retrieval request.
3. Record the HTTP status code and the response body.

**Expected Result:** *Cannot be stated yet — the error contract is undefined.* Once defined: the response indicates a supplier-side authorization failure without exposing credential values. Record the observed behavior and confirm no credential appears in the response.

**Priority:** P1

**Tags:** Atomic, ClassD-Blocked, Negative

**Review:** Pending

**Automation:** Pending

---

### TC-IBPNR-033 — Behavior when the supplier returns a malformed response

**Objective:** Determine how NDC_Core_service responds when the supplier's response cannot be parsed.

**Preconditions:** A means exists to make the supplier return an unparseable response.

**Steps:**

1. Configure the supplier to return a malformed response.
2. Send a retrieval request.
3. Record the HTTP status code and the response body.

**Expected Result:** *Cannot be stated yet — the error contract is undefined.* Once defined: the service returns a controlled error rather than a partial or corrupted booking object. Record the observed behavior.

**Priority:** P2

**Tags:** Atomic, ClassD-Blocked, Negative

**Review:** Pending

**Automation:** Pending

---

### TC-IBPNR-034 — Behavior when the supplier returns a partial response

**Objective:** Determine how NDC_Core_service responds when the supplier returns a booking with data missing.

**Preconditions:** A means exists to make the supplier return a booking response with sections omitted.

**Steps:**

1. Configure the supplier to omit part of the booking data — for example, the ticket section.
2. Send a retrieval request.
3. Record the HTTP status code and the response body.

**Expected Result:** *Cannot be stated yet — whether a partial booking is a success or an error is undefined.* Record whether the service returns the partial booking, rejects it, or fills in defaults, so the contract can state the rule.

**Priority:** P2

**Tags:** Atomic, ClassD-Blocked, Negative

**Notes:** Relevant to the historical flow: a partial booking silently accepted could produce an imported booking with missing fare or ticket data, affecting wallet deduction.

**Review:** Pending

**Automation:** Pending

---

### TC-IBPNR-035 — Behavior on an internal NDC_Core_service failure

**Objective:** Determine how the service responds when it fails internally rather than at the supplier.

**Preconditions:** A means exists to induce an internal failure in NDC_Core_service.

**Steps:**

1. Induce an internal failure.
2. Send a retrieval request.
3. Record the HTTP status code and the response body.

**Expected Result:** *Cannot be stated yet — the error contract is undefined.* Once defined: the response indicates an internal error without exposing a stack trace, internal host name, or supplier credential. Record the observed behavior and confirm nothing sensitive is exposed.

**Priority:** P2

**Tags:** Atomic, ClassD-Blocked, Negative

**Review:** Pending

**Automation:** Pending

---

### TC-IBPNR-036 — Supplier errors are normalized rather than leaked verbatim

**Objective:** Determine whether supplier-specific error text is normalized into a consistent error contract.

**Preconditions:** A means exists to trigger the same error condition at two different suppliers.

**Steps:**

1. Trigger a "booking not found" condition at the Travelport GDS provider and record the response.
2. Trigger the same condition at the Sabre NDC provider and record the response.
3. Compare the two error responses.

**Expected Result:** *Cannot be stated yet — the error contract is undefined.* Record whether both providers produce the same normalized error shape, or whether supplier-specific text reaches the caller unchanged.

**Priority:** P1

**Tags:** Atomic, ClassD-Blocked, Negative

**Notes:** Error normalization is a migration concern: NDC Core's existing handling was written against NDC-INT's error messages. If NDC_Core_service passes supplier text through differently, existing handling may break.

**Review:** Pending

**Automation:** Pending

---

### TC-IBPNR-037 — Endpoint authentication and authorization behavior

**Objective:** Determine what authentication and authorization the endpoint requires.

**Preconditions:** NDC_Core_service is reachable.

**Steps:**

1. Send a retrieval request with no credentials and record the outcome.
2. Send the same request with invalid credentials and record the outcome.
3. Send the same request with valid credentials and record the outcome.

**Expected Result:** *Cannot be stated yet — the authentication mechanism is an Open Question (Project Context §8).* Record whether the endpoint is open, requires credentials, and how it responds to missing versus invalid credentials.

**Priority:** P1

**Tags:** Atomic, ClassD-Blocked, Security

**Notes:** Until this is answered, the Permissions dimension cannot be evaluated for this contract. An endpoint returning booking data without authentication would be a significant finding.

**Review:** Pending

**Automation:** Pending

---

### TC-IBPNR-REG-001 — Ticketed PNR is eligible for import

**Objective:** Verify a PNR ticketed offline can still be imported once retrieval goes through NDC_Core_service.

**Preconditions:** The Import Booked PNR flow is configured to retrieve through NDC_Core_service. A PNR booked and ticketed offline exists at the supplier. The organization has import permission, PCC configuration and sufficient wallet credit.

**Steps:**

1. Start an Import Booked PNR for the ticketed PNR.
2. Complete the import.

**Expected Result:** The import succeeds and the booking is created in NDC, exactly as it did through the NDC-INT path.

**Priority:** P1

**Tags:** Atomic, ClassB-Regression

**Notes:** Historical requirement HR-IBPNR-01. Not executable in the current API-only phase — requires the full application with NDC_Core_service wired in. Designed now for the later integration phase.

**Review:** Pending

**Automation:** Pending

---

### TC-IBPNR-REG-002 — Held PNR is rejected as ineligible

**Objective:** Verify a held, un-ticketed PNR is still rejected by Import Booked PNR after the migration.

**Preconditions:** The Import Booked PNR flow retrieves through NDC_Core_service. A held, un-ticketed PNR exists at the supplier.

**Steps:**

1. Start an Import Booked PNR for the held PNR.

**Expected Result:** The import is refused because the PNR is not ticketed, and no booking is created in NDC.

**Priority:** P1

**Tags:** Atomic, ClassB-Regression, Negative

**Notes:** Historical requirement HR-IBPNR-01 — held PNRs belong to the separate Import PNR flow. Not executable in the API-only phase.

**Review:** Pending

**Automation:** Pending

---

### TC-IBPNR-REG-003 — Cancelled PNR is rejected as ineligible

**Objective:** Verify a cancelled PNR is still rejected by Import Booked PNR after the migration.

**Preconditions:** The Import Booked PNR flow retrieves through NDC_Core_service. A cancelled PNR exists at the supplier.

**Steps:**

1. Start an Import Booked PNR for the cancelled PNR.

**Expected Result:** The import is refused because the PNR is cancelled, and no booking is created in NDC.

**Priority:** P1

**Tags:** Atomic, ClassB-Regression, Negative

**Notes:** Historical requirement HR-IBPNR-01. Not executable in the API-only phase.

**Review:** Pending

**Automation:** Pending

---

### TC-IBPNR-REG-004 — PNR not existing in NDC is importable

**Objective:** Verify a PNR with no record in NDC can still be imported after the migration.

**Preconditions:** The Import Booked PNR flow retrieves through NDC_Core_service. A ticketed PNR exists at the supplier with no corresponding record in NDC.

**Steps:**

1. Start an Import Booked PNR for the PNR.
2. Complete the import.

**Expected Result:** The import succeeds and a new booking is created in NDC.

**Priority:** P1

**Tags:** Atomic, ClassB-Regression

**Notes:** Historical requirement HR-IBPNR-02 — one of the two supported import cases. Not executable in the API-only phase.

**Review:** Pending

**Automation:** Pending

---

### TC-IBPNR-REG-005 — PNR existing with Failed status (4) is importable

**Objective:** Verify a PNR whose previous import failed can still be re-imported after the migration.

**Preconditions:** The Import Booked PNR flow retrieves through NDC_Core_service. A ticketed PNR exists at the supplier and has a record in NDC with Failed status (4).

**Steps:**

1. Start an Import Booked PNR for the PNR.
2. Complete the import.

**Expected Result:** The import succeeds and the booking reaches a successful state, rather than being blocked as a duplicate.

**Priority:** P1

**Tags:** Atomic, ClassB-Regression

**Notes:** Historical requirement HR-IBPNR-02 — the second supported import case. This is the boundary between "duplicate, block it" and "previously failed, allow it"; a migration regression here would either block valid retries or allow true duplicates. Not executable in the API-only phase.

**Review:** Pending

**Automation:** Pending

---

### TC-IBPNR-REG-006 — Duplicate import of the same PNR is prevented

**Objective:** Verify a PNR already imported successfully cannot be imported again after the migration.

**Preconditions:** The Import Booked PNR flow retrieves through NDC_Core_service. A PNR has already been imported successfully into NDC.

**Steps:**

1. Start an Import Booked PNR for the same PNR again.

**Expected Result:** The import is refused as already imported, and no second booking is created.

**Priority:** P1

**Tags:** Atomic, ClassB-Regression, Negative

**Notes:** Historical requirement HR-IBPNR-02. Not executable in the API-only phase.

**Review:** Pending

**Automation:** Pending

---

### TC-IBPNR-REG-007 — Concurrent import of the same PNR by two users is prevented

**Objective:** Verify two users importing the same PNR at the same time produce only one booking.

**Preconditions:** The Import Booked PNR flow retrieves through NDC_Core_service. A ticketed PNR is available for import. Two user sessions are available.

**Steps:**

1. Start an Import Booked PNR for the PNR in the first session.
2. Start an Import Booked PNR for the same PNR in the second session before the first completes.
3. Complete both.

**Expected Result:** Exactly one import succeeds and one is refused. Only one booking exists in NDC, and the wallet is deducted once.

**Priority:** P1

**Tags:** Atomic, ClassB-Regression, Negative

**Notes:** Historical requirement HR-IBPNR-02 — duplicate prevention explicitly covers another user importing the same booked PNR. Timing-sensitive; not executable in the API-only phase.

**Review:** Pending

**Automation:** Pending

---

### TC-IBPNR-REG-008 — Organization without Import Booked PNR permission is refused

**Objective:** Verify the organization-level permission check still applies after the migration.

**Preconditions:** The Import Booked PNR flow retrieves through NDC_Core_service. An organization exists with Import Booked PNR not enabled.

**Steps:**

1. Sign in as a user of that organization.
2. Attempt an Import Booked PNR for a valid ticketed PNR.

**Expected Result:** The import is refused because the organization is not permitted to use Import Booked PNR, and no booking is created.

**Priority:** P1

**Tags:** Atomic, ClassB-Regression, Negative

**Notes:** Historical requirement HR-IBPNR-03. Not executable in the API-only phase.

**Review:** Pending

**Automation:** Pending

---

### TC-IBPNR-REG-009 — Organization without required PCC configuration is refused

**Objective:** Verify the PCC configuration check still applies after the migration.

**Preconditions:** The Import Booked PNR flow retrieves through NDC_Core_service. An organization exists without the required PCC configuration.

**Steps:**

1. Sign in as a user of that organization.
2. Attempt an Import Booked PNR for a valid ticketed PNR.

**Expected Result:** The import is refused because the required PCC configuration is missing, and no booking is created.

**Priority:** P1

**Tags:** Atomic, ClassB-Regression, Negative

**Notes:** Historical requirement HR-IBPNR-03. Not executable in the API-only phase.

**Review:** Pending

**Automation:** Pending

---

### TC-IBPNR-REG-010 — Organization with insufficient wallet credit is refused

**Objective:** Verify the wallet sufficiency check still applies after the migration.

**Preconditions:** The Import Booked PNR flow retrieves through NDC_Core_service. An organization has less wallet credit than the booking total.

**Steps:**

1. Sign in as a user of that organization.
2. Attempt an Import Booked PNR for a ticketed PNR costing more than the available credit.

**Expected Result:** The import is refused for insufficient credit, no booking is created, and the wallet balance is unchanged.

**Priority:** P1

**Tags:** Atomic, ClassB-Regression, Negative

**Notes:** Historical requirement HR-IBPNR-03. Not executable in the API-only phase.

**Review:** Pending

**Automation:** Pending

---

### TC-IBPNR-REG-011 — Wallet is deducted correctly after a successful import

**Objective:** Verify the wallet deduction amount is unchanged after the migration.

**Preconditions:** The Import Booked PNR flow retrieves through NDC_Core_service. An organization has sufficient wallet credit. The expected deduction for the booking is known.

**Steps:**

1. Record the organization's wallet balance.
2. Complete an Import Booked PNR for a ticketed PNR.
3. Record the wallet balance again.

**Expected Result:** The balance decreases by exactly the expected amount for that booking, and the deduction occurs once.

**Priority:** P1

**Tags:** Atomic, ClassB-Regression

**Notes:** Historical requirement HR-IBPNR-03. The deducted amount depends on fare and tax data now arriving through NDC_Core_service — a mapping difference would show up here as a wrong amount. Not executable in the API-only phase.

**Review:** Pending

**Automation:** Pending

---

### TC-IBPNR-REG-012 — Rule Engine uses the offline ticketing date/time, not the import time

**Objective:** Verify Rule Engine calculation is still based on the original offline ticketing date and time after the migration.

**Preconditions:** The Import Booked PNR flow retrieves through NDC_Core_service. A ticketed PNR exists whose offline ticketing date differs from today. The Rule Engine configuration on both dates is known.

**Steps:**

1. Complete an Import Booked PNR for the PNR.
2. Compare the applied rules against the Rule Engine configuration as it stood at the offline ticketing date and time.

**Expected Result:** The rules applied match the configuration in force at the original offline ticketing date and time, not the configuration in force at import time.

**Priority:** P1

**Tags:** Atomic, ClassB-Regression

**Notes:** Historical requirement HR-IBPNR-04, stated explicitly in the Historical Documentation. This depends on the ticketing date arriving correctly through NDC_Core_service, which makes it both a business regression and a mapping check. Not executable in the API-only phase.

**Review:** Pending

**Automation:** Pending

---

### TC-IBPNR-REG-013 — A rule disabled after ticketing still applies to the imported PNR

**Objective:** Verify a rule that was active at ticketing time but disabled before import is still applied.

**Preconditions:** The Import Booked PNR flow retrieves through NDC_Core_service. A rule was active when the PNR was ticketed offline and has since been disabled. A ticketed PNR from that period is available.

**Steps:**

1. Confirm the rule is currently disabled.
2. Complete an Import Booked PNR for the PNR ticketed while the rule was active.
3. Inspect the pricing applied to the imported booking.

**Expected Result:** The disabled rule is still applied, because it was active at the original ticketing time.

**Priority:** P1

**Tags:** Atomic, ClassB-Regression

**Notes:** Historical requirement HR-IBPNR-04 — this is the worked example the Historical Documentation gives. It is the clearest single test that the ticketing-time rule snapshot behavior survived the migration. Not executable in the API-only phase.

**Review:** Pending

**Automation:** Pending

---

### TC-IBPNR-REG-014 — Imported booking is persisted with the correct import classification

**Objective:** Verify the imported booking is recorded with the correct import case after the migration.

**Preconditions:** The Import Booked PNR flow retrieves through NDC_Core_service. Access to the import tracking records is available.

**Steps:**

1. Complete an Import Booked PNR for a PNR that does not exist in NDC.
2. Inspect the import tracking record created for it.
3. Repeat for a PNR that exists in NDC with Failed status (4).

**Expected Result:** Each import is recorded with the classification matching its case, the booking reference and import time are recorded, and the import time is the time of import rather than the original ticketing time.

**Priority:** P1

**Tags:** Atomic, ClassB-Regression

**Notes:** Historical Documentation §4 describes `IMPORT_CASE` values (`MANUAL`, `AUTOMATED_NOT_EXIST`, `AUTOMATED_FAILED`) and the `TT_TS_FB_BOOKED_IMPORTS` tracking table. The exact schema is historical implementation context and is not itself a requirement on NDC_Core_service; the business behavior it represents is what this case protects. Not executable in the API-only phase.

**Review:** Pending

**Automation:** Pending

---

### TC-IBPNR-REG-015 — A successful import creates exactly one booking record

**Objective:** Verify a single successful import produces exactly one booking after the migration.

**Preconditions:** The Import Booked PNR flow retrieves through NDC_Core_service. A ticketed PNR is available for import.

**Steps:**

1. Complete an Import Booked PNR for the PNR.
2. Search NDC for bookings matching that PNR.

**Expected Result:** Exactly one booking exists for that PNR.

**Priority:** P1

**Tags:** Atomic, ClassB-Regression

**Notes:** Guards against a retry inside the new integration path creating a second booking. Not executable in the API-only phase.

**Review:** Pending

**Automation:** Pending

---

### TC-IBPNR-REG-016 — Business data matches between the NDC-INT path and the NDC_Core_service path

**Objective:** Verify the same booking produces the same business data through both integration paths.

**Preconditions:** Both the NDC-INT path and the NDC_Core_service path can be exercised for the same booking. A ticketed PNR is available.

**Steps:**

1. Retrieve the booking through the NDC-INT path and record the resulting business data.
2. Retrieve the same booking through the NDC_Core_service path and record the resulting business data.
3. Compare passengers, segments, fares, taxes, totals, baggage, services, tickets and coupons between the two.

**Expected Result:** Every business value that Import Booked PNR depends on is identical between the two paths. Any difference is recorded and confirmed as intended before cutover.

**Priority:** P1

**Tags:** Scenario, ClassB-Regression, Integration

**Notes:** This is the single most important migration test — it is what distinguishes "the new endpoint works" from "the new endpoint can replace the old one". Requires both paths to be available at once, which is not yet confirmed possible (Project Context §8). Not executable in the API-only phase.

**Review:** Pending

**Automation:** Pending

---

### TC-IBPNR-REG-017 — Rule Engine behavior when the original rule batch has been deleted

**Objective:** Determine what happens when a PNR is imported after its originally-active rule batch has been periodically deleted.

**Preconditions:** The Import Booked PNR flow retrieves through NDC_Core_service. A ticketed PNR exists whose original ticketing date falls within a rule batch that has since been deleted.

**Steps:**

1. Confirm the rule batch active at the PNR's original ticketing time no longer exists.
2. Complete an Import Booked PNR for the PNR.
3. Inspect the pricing and outcome of the import.

**Expected Result:** *Cannot be stated yet — no source defines the correct behavior once the originally-active batch is gone (Historical Requirement HR-IBPNR-05, Project Context §8).* Record the observed outcome — for example, a fallback batch applied, the import blocked, or an error — so the business can confirm the intended rule.

**Priority:** P1

**Tags:** Atomic, ClassD-Blocked

**Notes:** Sourced from Meeting 1: "old batches are deleted periodically." Not executable in the API-only phase, and additionally blocked on an undefined business rule.

**Review:** Pending

**Automation:** Pending

---

### TC-IBPNR-REG-018 — Import is refused when the Agency's Import PNR Option is not checked

**Objective:** Verify the Agency-level enablement toggle gates the import, independent of any Staff-level toggle.

**Preconditions:** The Import Booked PNR flow retrieves through NDC_Core_service. An Agency exists with its "Import PNR Option" unchecked.

**Steps:**

1. Sign in as that Agency's owner.
2. Attempt an Import Booked PNR for a valid, ticketed PNR.

**Expected Result:** The import is refused because the Agency does not have Import PNR enabled, and no booking is created.

**Priority:** P1

**Tags:** Atomic, ClassB-Regression, Negative

**Notes:** Historical requirement HR-IBPNR-06 (Meeting 1). Refines the earlier, more generic TC-IBPNR-REG-008 by naming the specific toggle. Not executable in the API-only phase.

**Review:** Pending

**Automation:** Pending

---

### TC-IBPNR-REG-019 — Staff-initiated import is refused when the Admin's Import PNR Option is not checked

**Objective:** Verify a Staff user's import additionally depends on the Admin's own enablement toggle, even when the Agency's toggle is checked.

**Preconditions:** The Import Booked PNR flow retrieves through NDC_Core_service. The Agency's "Import PNR Option" is checked. The Admin's "Import PNR Option" is not checked. A Staff user under that Admin exists.

**Steps:**

1. Sign in as the Staff user.
2. Attempt an Import Booked PNR for a valid, ticketed PNR belonging to the enabled Agency.

**Expected Result:** The import is refused because the Admin's Import PNR Option is not checked, even though the Agency's is, and no booking is created.

**Priority:** P1

**Tags:** Atomic, ClassB-Regression, Negative

**Notes:** Historical requirement HR-IBPNR-06 (Meeting 1) — the two-part toggle is easy to under-test by checking only the Agency side. Not executable in the API-only phase.

**Review:** Pending

**Automation:** Pending

---

### TC-IBPNR-REG-020 — Both NDC Integration and NDC Core validations are applied to the import

**Objective:** Verify an import is checked against both the general NDC Integration validations on the PNR's data and the general NDC Core validations on the import action itself.

**Preconditions:** The Import Booked PNR flow retrieves through NDC_Core_service. The specific validations in each category are known (Project Context §8.1 — tracked to Eng. Tamer).

**Steps:**

1. Trigger an import that violates an NDC Integration-category validation (e.g. malformed PNR data) and record the outcome.
2. Trigger a separate import that violates an NDC Core-category validation (e.g. an Import Booked PNR-specific rule) and record the outcome.

**Expected Result:** Each violation is caught by its respective validation category, and a valid import passes both. Record which category actually caught each violation.

**Priority:** P1

**Tags:** Atomic, ClassB-Regression

**Notes:** Historical requirement HR-IBPNR-08 (Meeting 1). Cannot be fully designed until the validation lists themselves are obtained (Coverage Report REC-04). Not executable in the API-only phase.

**Review:** Pending

**Automation:** Pending

---

### TC-IBPNR-REG-021 — Simultaneous import of different PNRs under different rule batches on the same day

**Objective:** Verify importing several different PNRs at the same time, each priced from a different rule batch, produces correct results for all of them.

**Preconditions:** The Import Booked PNR flow retrieves through NDC_Core_service. At least two ticketed PNRs are available, ticketed at times governed by different rule batches.

**Steps:**

1. Start imports for both PNRs at the same time.
2. Complete both imports.
3. Inspect the pricing applied to each resulting booking.

**Expected Result:** Each booking is priced from the rule batch that was active at its own original ticketing time, with no cross-contamination between the two concurrent imports.

**Priority:** P2

**Tags:** Scenario, ClassB-Regression

**Notes:** Historical requirement HR-IBPNR-09 (Meeting 1) — broader than TC-IBPNR-REG-007, which covers two users racing to import the *same* PNR; this covers concurrent imports of *different* PNRs under *different* batches. Not executable in the API-only phase.

**Review:** Pending

**Automation:** Pending

---

### TC-IBPNR-REG-022 — Imported booking is reflected in the Agency Detailed Report

**Objective:** Verify a successfully imported booking appears in the Agency Detailed Report.

**Preconditions:** The Import Booked PNR flow retrieves through NDC_Core_service. An import has completed successfully for a known Agency.

**Steps:**

1. Complete an Import Booked PNR for the Agency.
2. Open the Agency Detailed Report for that Agency.

**Expected Result:** The imported booking appears in the report with matching booking reference and amount.

**Priority:** P2

**Tags:** Atomic, ClassB-Regression, Exploratory

**Notes:** Historical requirement HR-IBPNR-10 (Meeting 1) — the report list itself is provisional; an open action item (Eng. Hagar/Nasser, Project Context §8.1) tracks confirming it. Not executable in the API-only phase.

**Review:** Pending

**Automation:** Pending

---

### TC-IBPNR-REG-023 — Agency History Wallet report reflects the import and is visible to Super Admin only

**Objective:** Verify the wallet deduction from an import appears in the Agency History Wallet report, and that the report is visible only to Super Admin.

**Preconditions:** The Import Booked PNR flow retrieves through NDC_Core_service. An import has completed successfully, deducting the Agency's wallet.

**Steps:**

1. Sign in as a regular Admin and attempt to open the Agency History Wallet report.
2. Sign in as Super Admin and open the Agency History Wallet report for the same Agency.

**Expected Result:** The regular Admin cannot access the report (or does not see it), and the Super Admin sees the import's wallet deduction reflected in it.

**Priority:** P2

**Tags:** Atomic, ClassB-Regression, Exploratory

**Notes:** Historical requirement HR-IBPNR-10 (Meeting 1), which explicitly marks this report "*Odeyss Admin" (Super Admin) only. This is one of the few Meeting-1 facts that touches role visibility directly — distinct from the earlier, unrelated observation that Super Admin's nav is missing the Import PNR/Import Booked PNR menu items entirely (Project Context §3, confirmed intentional and out of scope). Not executable in the API-only phase.

**Review:** Pending

**Automation:** Pending

---

### TC-IBPNR-REG-024 — Imported booking is reflected across Finance, Statement, Ledger, Bookings, Sales and Import PNR reports

**Objective:** Verify a successfully imported booking appears correctly in each of the remaining named downstream reports.

**Preconditions:** The Import Booked PNR flow retrieves through NDC_Core_service. An import has completed successfully.

**Test Data:**

| Field | Value |
|---|---|
| Reports to check | Finance, Statement, Ledger, Bookings, Sales, Import PNR |

**Steps:**

1. Complete an Import Booked PNR.
2. Open each report listed in the test data and locate the imported booking.

**Expected Result:** The imported booking appears in every listed report with consistent booking reference, amount and status.

**Priority:** P2

**Tags:** Atomic, ClassB-Regression, Exploratory

**Notes:** Historical requirement HR-IBPNR-10 (Meeting 1); provisional pending the same open action item as TC-IBPNR-REG-022. One case parameterized across six reports, since it is one behavior (downstream reflection) repeated per report, not six distinct behaviors. Not executable in the API-only phase.

**Review:** Pending

**Automation:** Pending

---

## Change Log — revision 1 → revision 2

Every revision 1 case was reviewed individually. Nothing was appended blindly.

| Rev 1 ID | Rev 1 title | Outcome | Rev 2 ID | What changed and why |
|---|---|---|---|---|
| TC-IBPNR-001 | Retrieve a ticketed booked PNR successfully (Travelport GDS) | Revised | TC-IBPNR-001 | Expected result no longer asserts `200 OK` or a fixed field set — the status code was invented. Now records the observed response as the contract baseline. Reclassified ClassC-Discovery. |
| TC-IBPNR-002 | Retrieve a ticketed booked PNR successfully (Sabre NDC) | Revised | TC-IBPNR-002 | Same correction as 001. The "same top-level field set" assertion was extrapolated from two examples; provider normalization is now tested properly by TC-IBPNR-021. |
| TC-IBPNR-003 | Response includes complete passenger details | Revised | TC-IBPNR-003 | Was asserting a mandatory field list derived only from examples. Now compares against the supplier's actual record and records field presence. |
| TC-IBPNR-004 | Response includes complete segment details | Revised | TC-IBPNR-004 | Same correction as 003. |
| TC-IBPNR-005 | Response includes complete fare and tax breakdown | Revised | TC-IBPNR-005 | Same correction as 003, plus a note that these values feed Rule Engine and wallet deduction. |
| TC-IBPNR-006 | Response includes ticket and coupon details | Revised | TC-IBPNR-006 | Same correction as 003. The relationship checks it implied are now separate cases (TC-IBPNR-012, TC-IBPNR-013). |
| TC-IBPNR-007 | Non-existent record locator returns an error | Revised + reclassified | TC-IBPNR-022 | Asserted a `4xx`. No error contract exists — that was fabricated. Now ClassD-Blocked with the expected result stated as pending the contract. |
| TC-IBPNR-008 | Missing providerId returns an error | Revised + reclassified | TC-IBPNR-023 | Asserted `providerId` is mandatory because both examples include it. Presence in an example is not evidence. Now ClassD-Blocked, discovering the actual rule. |
| TC-IBPNR-009 | Unsupported providerId value returns an error | Revised + reclassified | TC-IBPNR-024 | Asserted a `4xx`. Now ClassD-Blocked pending the error contract. |
| TC-IBPNR-010 | Record locator shorter than the minimum length is rejected | Rewritten | TC-IBPNR-026 | Invented a minimum length rule. Rewritten as a discovery case across several lengths, with an explicit note not to inherit the unrelated Import PNR 6–9 rule. |
| TC-IBPNR-011 | Record locator with SQL-injection-shaped input is handled safely | Revised | TC-IBPNR-027 | Asserted a `4xx`. Expected result narrowed to what holds regardless of the error contract: no server error, no data leak. |
| TC-IBPNR-012 | Record locator with Unicode characters is handled without a server error | Revised | TC-IBPNR-028 | Asserted a `4xx`. Narrowed to "no server error", which is the part that holds. |
| TC-IBPNR-013 | Empty record locator path segment is rejected | Revised | TC-IBPNR-029 | Asserted a specific `4xx` range. Now records the observed routing behavior. |
| TC-IBPNR-014 | New layer, not the existing Integration Layer, serves the request | Superseded | TC-IBPNR-REG-016 | The intent was right but the framing was too narrow — proving *which layer answered* matters less than proving *the business data is identical*. Replaced by a full data-comparison regression case, and the remaining observability question is recorded as an Open Question. |
| TC-IBPNR-015 | Supplier-specific optional fields may be empty without breaking the contract | Revised | TC-IBPNR-018 | Asserted the fields "are present as empty arrays `[]`". That representation was extrapolated from one example. Now discovers the actual representation. |

**Added in revision 2:** 17 new contract cases (TC-IBPNR-007 to TC-IBPNR-021, TC-IBPNR-025, and the supplier/service failure set TC-IBPNR-030 to TC-IBPNR-037) and 16 historical-business regression cases (TC-IBPNR-REG-001 to TC-IBPNR-REG-016).

**Removed outright:** none. Every revision 1 case survives in corrected form except TC-IBPNR-014, which is superseded by a stronger replacement.

## Change Log — revision 2 → revision 3

`Import Booked PNR Meeting 1 (23-11).pdf` was supplied. No existing case (revision 1 or 2) was found
to be wrong because of it — the new facts are additive. Eight cases added:

| Rev 3 ID | Title | Why added |
|---|---|---|
| TC-IBPNR-REG-017 | Rule Engine behavior when the original rule batch has been deleted | New retention-limit fact (HR-IBPNR-05) not present in either earlier source |
| TC-IBPNR-REG-018 | Import refused when the Agency's Import PNR Option is not checked | Names the specific toggle behind the generic "organization enabled" case (HR-IBPNR-06) |
| TC-IBPNR-REG-019 | Staff-initiated import refused when the Admin's Import PNR Option is not checked | The two-part toggle's Staff-side half, easy to under-test if only the Agency side is checked (HR-IBPNR-06) |
| TC-IBPNR-REG-020 | Both NDC Integration and NDC Core validations are applied | New validation-category split (HR-IBPNR-08) |
| TC-IBPNR-REG-021 | Simultaneous import of different PNRs under different rule batches | Broader concurrency scenario than TC-IBPNR-REG-007 (HR-IBPNR-09) |
| TC-IBPNR-REG-022 | Imported booking reflected in the Agency Detailed Report | Named report, provisional pending business confirmation (HR-IBPNR-10) |
| TC-IBPNR-REG-023 | Agency History Wallet report — Super Admin only | The one report with a role-visibility restriction named in the source (HR-IBPNR-10) |
| TC-IBPNR-REG-024 | Reflected across Finance/Statement/Ledger/Bookings/Sales/Import PNR reports | Remaining named reports, parameterized as one case (HR-IBPNR-10) |

**One point required reconciliation, not a case change:** Meeting 1's "rule batch" mechanism is more
specific than the earlier "ticketing date/time" phrasing. `HR-IBPNR-04`'s statement in the Project
Context was refined to state both; `TC-IBPNR-REG-012` and `TC-IBPNR-REG-013` did not need rewriting —
"the offline ticketing date/time" is still accurate, just less precise than "the batch active at that
time." **One point was flagged, not reconciled:** Meeting 1 does not mention the Failed-status(4)
import case that the revision-2 prose Historical Documentation stated; both sources are kept and the
gap is logged (Project Context §9, DISC-02) rather than dropping either one.
