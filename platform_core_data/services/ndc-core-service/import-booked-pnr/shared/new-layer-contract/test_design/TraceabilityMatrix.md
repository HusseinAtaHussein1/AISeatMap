# Requirement Traceability Matrix — run-005__2026-09-01_11-41-40__UserStory__ImportBookedPNR-NewLayerContract

| Field | Value |
|---|---|
| Module | `import-booked-pnr` |
| Feature | `new-layer-contract` |
| Produced by run | `run-005__2026-09-01_11-41-40__UserStory__ImportBookedPNR-NewLayerContract` |
| Revision | 3 (Meeting 1 incorporated) |
| Project Context | `modules/import-booked-pnr/features/new-layer-contract/context/ProjectContext.md` (rev 3) |
| Run Scope Type / Run Type | Feature / User Story |
| Test Cases Traced | 61 |
| Generated | 2026-09-01 |

## 0. Requirement Sources

Every requirement below names where it came from. These are different kinds of evidence and must not
be flattened into one.

| Source Tag | Meaning |
|---|---|
| **US** | The current User Story supplied at intake |
| **HIST** | Historical Import Booked PNR documentation supplied 2026-09-01 (prose) — authoritative existing business behavior, **never** an assumption |
| **MTG1** | `Import Booked PNR Meeting 1 (23-11).pdf`, a business-authored slide deck supplied 2026-09-01 — authoritative existing business behavior, treated with the same weight as HIST and distinguished only because it is a separate, dated source |
| **DEV-EX** | Developer-supplied `NDC_Core_service` example payload — a reference sample, **not** a formal requirement |
| **DISC** | Verified Discovery evidence — none exists yet (Stage 2 not run) |
| **ASSUM** | An assumption made by this Feature, not yet confirmed |
| **OQ** | Open Question — unknown, requires the developer or business to answer |

## 1. Requirement Register

### 1.1 Historical business requirements [HIST] — existing scope, baseline regression

| Req ID | Requirement | Source |
|---|---|---|
| HIST-01 | Import Booked PNR works with PNRs booked, paid and ticketed via the offline flow | HIST |
| HIST-02 | The PNR must be ticketed; held and cancelled PNRs are ineligible (historically the Import PNR flow's cases) | HIST |
| HIST-03 | Supported import cases: PNR does not exist in NDC, or exists with Failed status (4) | HIST |
| HIST-04 | Duplicate import must be prevented, including by a different user | HIST |
| HIST-05 | Import Booked PNR must be enabled/allowed for the organization | HIST |
| HIST-06 | Required PCC configuration must exist for the organization | HIST |
| HIST-07 | Organization wallet validation is required, including sufficient credit | HIST |
| HIST-08 | The wallet is deducted on successful import | HIST |
| HIST-09 | Rule Engine calculation uses the original offline ticketing date/time, not the import time | HIST |
| HIST-10 | A rule active at ticketing time still applies even if disabled before import | HIST |
| HIST-11 | The imported booking is stored in NDC as a manual/imported booking, with an import classification and tracking record; import time is distinct from ticketing time | HIST |
| HIST-12 | "The Validations shall be the same as the OLD booked PNR feature" — validations are not weakened by the integration change | HIST |
| HIST-13 | Supplier/integration validations and normal API/input validations continue to apply | HIST |
| HIST-14 | Import Booked PNR is an NDC Admin-only feature | MTG1 |
| HIST-15 | Enablement is two-part: Agency's "Import PNR Option", and — when the importer is Staff — the Admin's "Import PNR Option" also | MTG1 |
| HIST-16 | The PNR must be ticketed offline specifically; it carries two independent statuses (Supplier status, System status) both relevant to eligibility | MTG1 |
| HIST-17 | Two validation categories gate the import: General NDC Integration validations and General NDC Core validations | MTG1 |
| HIST-18 | Simultaneous import of different PNRs under different rule batches, across a single day, must be handled correctly | MTG1 |
| HIST-19 | The imported booking should be reflected in eight named reports; one (Agency History Wallet) is Super Admin only — provisional, tracked as an open action | MTG1 |
| HIST-20 | Rule Engine batches are periodically deleted; behavior when a PNR's originally-active batch is gone is undefined | MTG1 |

### 1.2 New `NDC_Core_service` contract requirements [US + DEV-EX] — new scope

| Req ID | Requirement | Source |
|---|---|---|
| SVC-01 | A booking-retrieval endpoint exists at `GET /api/v1/bookings/{recordLocator}` taking a `providerId` | US + DEV-EX |
| SVC-02 | The response returns a booking object covering the data Import Booked PNR needs | US + DEV-EX |
| SVC-03 | Passenger data is returned and mapped from the supplier | US + DEV-EX |
| SVC-04 | Segment data is returned and mapped from the supplier | US + DEV-EX |
| SVC-05 | Fare and tax data is returned and mapped from the supplier | US + DEV-EX |
| SVC-06 | Ticket and coupon data is returned and mapped from the supplier | US + DEV-EX |
| SVC-07 | Baggage allowance data is returned and mapped where the supplier provides it | US + DEV-EX |
| SVC-08 | Service/ancillary data is returned and mapped where the supplier provides it | US + DEV-EX |
| SVC-09 | Relationships between passengers, tickets, segments and coupons are resolvable within the response | US + DEV-EX |
| SVC-10 | Responses are normalized to a consistent shape across providers | US |
| SVC-11 | Request parameters are validated | US |
| SVC-12 | Error scenarios are defined and returned predictably | US, contract undefined → OQ |
| SVC-13 | Supplier failure modes are handled and normalized | US, contract undefined → OQ |
| SVC-14 | The endpoint's authentication/authorization is defined | OQ |

### 1.3 Migration/regression requirements [US + HIST] — caused by replacing NDC-INT

| Req ID | Requirement | Source |
|---|---|---|
| MIG-01 | `NDC_Core_service` replaces NDC-INT as the booking-retrieval integration point | US |
| MIG-02 | Every historical business behavior (HIST-01 … HIST-20) still holds after the swap | US + HIST + MTG1 |
| MIG-03 | Business data returned through `NDC_Core_service` matches what NDC-INT returned for the same booking | US + HIST |

## 2. Matrix

Discovery Reference is `Requires Upstream Stage — Stage 2 not run` for every case: no live endpoint
exists yet. Finding and Evidence References are `N/A` because no Findings exist.

| Test Case ID | Requirement Reference | Requirement Source | Class | Acceptance Criteria Reference | Run Scope Reference | Risk Level | Risk Statement |
|---|---|---|---|---|---|---|---|
| TC-IBPNR-001 | SVC-01, SVC-02 | US + DEV-EX | ClassC-Discovery | AC-2, AC-3 | Feature / User Story | Medium | Contract shape unverified against a live endpoint |
| TC-IBPNR-002 | SVC-01, SVC-02 | US + DEV-EX | ClassC-Discovery | AC-3, AC-5 | Feature / User Story | Medium | Contract shape unverified per provider |
| TC-IBPNR-003 | SVC-03 | US + DEV-EX | ClassC-Discovery | AC-2 | Feature / User Story | Medium | Passenger mapping errors reach the imported booking |
| TC-IBPNR-004 | SVC-04 | US + DEV-EX | ClassC-Discovery | AC-2 | Feature / User Story | Medium | Segment mapping errors reach the imported booking |
| TC-IBPNR-005 | SVC-05 | US + DEV-EX | ClassC-Discovery | AC-2, AC-5 | Feature / User Story | High | Fare/tax feed Rule Engine and wallet deduction |
| TC-IBPNR-006 | SVC-06 | US + DEV-EX | ClassC-Discovery | AC-2 | Feature / User Story | Medium | Ticket/coupon data drives servicing downstream |
| TC-IBPNR-007 | SVC-07 | US + DEV-EX | ClassC-Discovery | AC-5 | Feature / User Story | Low | Baggage mapping only |
| TC-IBPNR-008 | SVC-08 | US + DEV-EX | ClassC-Discovery | AC-5 | Feature / User Story | Low | Service mapping only |
| TC-IBPNR-009 | SVC-02 | US + DEV-EX | ClassC-Discovery | AC-2 | Feature / User Story | Medium | No schema exists to check against yet |
| TC-IBPNR-010 | SVC-05 | US + DEV-EX | ClassC-Discovery | AC-2 | Feature / User Story | Medium | Currency inconsistency would corrupt wallet deduction |
| TC-IBPNR-011 | SVC-05 | US + DEV-EX | ClassC-Discovery | AC-2 | Feature / User Story | Medium | Totals inconsistency would corrupt wallet deduction |
| TC-IBPNR-012 | SVC-09 | US + DEV-EX | ClassC-Discovery | AC-5 | Feature / User Story | Medium | Broken references would misattribute tickets |
| TC-IBPNR-013 | SVC-09 | US + DEV-EX | ClassC-Discovery | AC-5 | Feature / User Story | Medium | Broken references would misattribute coupons |
| TC-IBPNR-014 | SVC-03, SVC-09 | US + DEV-EX | ClassC-Discovery | AC-5 | Feature / User Story | Medium | Multi-passenger mapping untested by either example |
| TC-IBPNR-015 | SVC-04 | US + DEV-EX | ClassC-Discovery | AC-5 | Feature / User Story | Medium | Both examples are single-segment |
| TC-IBPNR-016 | SVC-06 | US + DEV-EX | ClassC-Discovery | AC-5 | Feature / User Story | Low | Both examples are single-ticket |
| TC-IBPNR-017 | SVC-03, SVC-05 | US + DEV-EX | ClassC-Discovery | AC-5 | Feature / User Story | Medium | Both examples are adult-only |
| TC-IBPNR-018 | SVC-07, SVC-08 | DEV-EX → ASSUM | ClassC-Discovery | AC-2 | Feature / User Story | Low | Representation extrapolated from one example |
| TC-IBPNR-019 | SVC-02 | DEV-EX → ASSUM | ClassC-Discovery | AC-2 | Feature / User Story | Medium | Nullability unconfirmed; examples disagree |
| TC-IBPNR-020 | SVC-02, MIG-03 | US + HIST | ClassC-Discovery | AC-5, AC-7 | Feature / User Story | High | Data NDC-INT surfaced but the new path drops is a silent behavior change |
| TC-IBPNR-021 | SVC-10 | US | ClassC-Discovery | AC-5 | Feature / User Story | Medium | Inconsistent normalization pushes supplier logic back into NDC Core |
| TC-IBPNR-022 | SVC-12 | OQ | ClassD-Blocked | AC-4 | Feature / User Story | Medium | Error contract undefined |
| TC-IBPNR-023 | SVC-11, SVC-12 | OQ | ClassD-Blocked | AC-4 | Feature / User Story | Medium | `providerId` mandatory-ness unconfirmed |
| TC-IBPNR-024 | SVC-11, SVC-12 | OQ | ClassD-Blocked | AC-4 | Feature / User Story | Medium | Error contract undefined |
| TC-IBPNR-025 | SVC-11 | OQ | ClassD-Blocked | AC-4 | Feature / User Story | Low | Case sensitivity unconfirmed |
| TC-IBPNR-026 | SVC-11 | OQ | ClassC-Discovery | AC-4 | Feature / User Story | Low | No length rule documented for this service |
| TC-IBPNR-027 | SVC-11, HIST-13 | US + HIST | ClassC-Discovery | AC-4 | Feature / User Story | High | Unsafe input handling could leak data or crash the service |
| TC-IBPNR-028 | SVC-11 | US | ClassC-Discovery | AC-4 | Feature / User Story | Low | Encoding handling only |
| TC-IBPNR-029 | SVC-11 | US | ClassC-Discovery | AC-4 | Feature / User Story | Low | Routing behavior only |
| TC-IBPNR-030 | SVC-13 | OQ | ClassD-Blocked | AC-4 | Feature / User Story | High | Timeout behavior undefined; a hung call blocks the import flow |
| TC-IBPNR-031 | SVC-13 | OQ | ClassD-Blocked | AC-4 | Feature / User Story | High | An outage mistaken for "not found" could break duplicate prevention |
| TC-IBPNR-032 | SVC-13 | OQ | ClassD-Blocked | AC-4 | Feature / User Story | Medium | Supplier auth failure handling undefined |
| TC-IBPNR-033 | SVC-13 | OQ | ClassD-Blocked | AC-4 | Feature / User Story | Medium | Malformed-response handling undefined |
| TC-IBPNR-034 | SVC-13 | OQ | ClassD-Blocked | AC-4 | Feature / User Story | High | A silently accepted partial booking would produce a wrong wallet deduction |
| TC-IBPNR-035 | SVC-13 | OQ | ClassD-Blocked | AC-4 | Feature / User Story | Medium | Internal failure handling undefined |
| TC-IBPNR-036 | SVC-13, MIG-01 | OQ + US | ClassD-Blocked | AC-4, AC-6 | Feature / User Story | High | NDC Core's existing error handling was written against NDC-INT's messages |
| TC-IBPNR-037 | SVC-14 | OQ | ClassD-Blocked | AC-4 | Feature / User Story | High | An unauthenticated booking-data endpoint would be a significant finding |
| TC-IBPNR-REG-001 | HIST-01, HIST-02, MIG-02 | HIST + US | ClassB-Regression | AC-6 | Feature / User Story | High | Core capability must survive the migration |
| TC-IBPNR-REG-002 | HIST-02, MIG-02 | HIST + US | ClassB-Regression | AC-6 | Feature / User Story | High | Accepting a held PNR would import an unpaid booking |
| TC-IBPNR-REG-003 | HIST-02, MIG-02 | HIST + US | ClassB-Regression | AC-6 | Feature / User Story | High | Accepting a cancelled PNR would import an invalid booking |
| TC-IBPNR-REG-004 | HIST-03, MIG-02 | HIST + US | ClassB-Regression | AC-6 | Feature / User Story | High | A supported import case must not regress |
| TC-IBPNR-REG-005 | HIST-03, MIG-02 | HIST + US | ClassB-Regression | AC-6 | Feature / User Story | High | The Failed-status retry boundary is easy to break either way |
| TC-IBPNR-REG-006 | HIST-04, MIG-02 | HIST + US | ClassB-Regression | AC-6 | Feature / User Story | High | Duplicate import would double-charge the wallet |
| TC-IBPNR-REG-007 | HIST-04, MIG-02 | HIST + US | ClassB-Regression | AC-6 | Feature / User Story | High | Concurrency is where duplicate prevention usually fails |
| TC-IBPNR-REG-008 | HIST-05, HIST-12, MIG-02 | HIST + US | ClassB-Regression | AC-6 | Feature / User Story | High | Permission bypass |
| TC-IBPNR-REG-009 | HIST-06, HIST-12, MIG-02 | HIST + US | ClassB-Regression | AC-6 | Feature / User Story | High | PCC validation bypass |
| TC-IBPNR-REG-010 | HIST-07, HIST-12, MIG-02 | HIST + US | ClassB-Regression | AC-6 | Feature / User Story | High | Import without credit creates unbacked liability |
| TC-IBPNR-REG-011 | HIST-08, MIG-02, MIG-03 | HIST + US | ClassB-Regression | AC-6 | Feature / User Story | High | Wrong deduction amount is a direct financial defect |
| TC-IBPNR-REG-012 | HIST-09, MIG-02 | HIST + US | ClassB-Regression | AC-6 | Feature / User Story | High | Wrong rule snapshot changes the price charged |
| TC-IBPNR-REG-013 | HIST-10, MIG-02 | HIST + US | ClassB-Regression | AC-6 | Feature / User Story | High | The clearest single test of ticketing-time rule behavior |
| TC-IBPNR-REG-014 | HIST-11, MIG-02 | HIST + US | ClassB-Regression | AC-6 | Feature / User Story | Medium | Wrong import classification corrupts reporting |
| TC-IBPNR-REG-015 | HIST-04, HIST-11, MIG-02 | HIST + US | ClassB-Regression | AC-6 | Feature / User Story | High | A retry inside the new path could create a second booking |
| TC-IBPNR-REG-016 | MIG-01, MIG-03 | US + HIST | ClassB-Regression | AC-6, AC-7 | Feature / User Story | High | The decisive migration test — data equivalence, not just endpoint availability |
| TC-IBPNR-REG-017 | HIST-20, MIG-02 | MTG1 + US | ClassD-Blocked | AC-6 | Feature / User Story | High | No source defines behavior once the originally-active batch is deleted |
| TC-IBPNR-REG-018 | HIST-15, MIG-02 | MTG1 + US | ClassB-Regression | AC-6 | Feature / User Story | High | Names the specific Agency-level toggle |
| TC-IBPNR-REG-019 | HIST-15, MIG-02 | MTG1 + US | ClassB-Regression | AC-6 | Feature / User Story | High | The Staff-side half of the toggle, easy to under-test |
| TC-IBPNR-REG-020 | HIST-17, MIG-02 | MTG1 + US | ClassB-Regression | AC-6 | Feature / User Story | Medium | Validation-category split not yet enumerated |
| TC-IBPNR-REG-021 | HIST-18, MIG-02 | MTG1 + US | ClassB-Regression | AC-6 | Feature / User Story | Medium | Cross-PNR concurrency, broader than REG-007 |
| TC-IBPNR-REG-022 | HIST-19, MIG-02 | MTG1 + US | ClassB-Regression | AC-6 | Feature / User Story | Medium | Report list is provisional |
| TC-IBPNR-REG-023 | HIST-19, MIG-02 | MTG1 + US | ClassB-Regression | AC-6 | Feature / User Story | Medium | Only report with a stated role-visibility restriction |
| TC-IBPNR-REG-024 | HIST-19, MIG-02 | MTG1 + US | ClassB-Regression | AC-6 | Feature / User Story | Medium | Report list is provisional |

## 3. Requirement → Test Case Roll-Up

| Requirement ID | Test Case ID(s) | Coverage Status |
|---|---|---|
| HIST-01 | TC-IBPNR-REG-001 | Designed — not executable in the API-only phase |
| HIST-02 | TC-IBPNR-REG-001, REG-002, REG-003 | Designed — not executable in the API-only phase |
| HIST-03 | TC-IBPNR-REG-004, REG-005 | Designed — not executable in the API-only phase |
| HIST-04 | TC-IBPNR-REG-006, REG-007, REG-015 | Designed — not executable in the API-only phase |
| HIST-05 | TC-IBPNR-REG-008 | Designed — not executable in the API-only phase |
| HIST-06 | TC-IBPNR-REG-009 | Designed — not executable in the API-only phase |
| HIST-07 | TC-IBPNR-REG-010 | Designed — not executable in the API-only phase |
| HIST-08 | TC-IBPNR-REG-011 | Designed — not executable in the API-only phase |
| HIST-09 | TC-IBPNR-REG-012 | Designed — not executable in the API-only phase |
| HIST-10 | TC-IBPNR-REG-013 | Designed — not executable in the API-only phase |
| HIST-11 | TC-IBPNR-REG-014 | Designed — not executable in the API-only phase |
| HIST-12 | TC-IBPNR-REG-008, REG-009, REG-010 | Designed — not executable in the API-only phase |
| HIST-13 | TC-IBPNR-027, and the REG-008/009/010 set | Partially designed — the supplier-side validation list is not fully enumerated in the Historical Documentation |
| HIST-14 | — | Contextual fact, not independently test-cased (NDC Admin-only is implicit in every REG case's precondition) |
| HIST-15 | TC-IBPNR-REG-018, REG-019 | Designed — not executable in the API-only phase |
| HIST-16 | TC-IBPNR-REG-001, REG-002, REG-003 | Designed — not executable in the API-only phase |
| HIST-17 | TC-IBPNR-REG-020 | Partially designed — validation lists not yet enumerated |
| HIST-18 | TC-IBPNR-REG-021 | Designed — not executable in the API-only phase |
| HIST-19 | TC-IBPNR-REG-022, REG-023, REG-024 | Partially Covered — report list itself is provisional |
| HIST-20 | TC-IBPNR-REG-017 | Unknown/Unassessed — no source states the correct behavior |
| SVC-01 | TC-IBPNR-001, TC-IBPNR-002 | Partially Covered — no live endpoint |
| SVC-02 | TC-IBPNR-001, 002, 009, 019, 020 | Partially Covered — no live endpoint, no schema |
| SVC-03 | TC-IBPNR-003, 014, 017 | Partially Covered |
| SVC-04 | TC-IBPNR-004, 015 | Partially Covered |
| SVC-05 | TC-IBPNR-005, 010, 011, 017 | Partially Covered |
| SVC-06 | TC-IBPNR-006, 016 | Partially Covered |
| SVC-07 | TC-IBPNR-007, 018 | Partially Covered |
| SVC-08 | TC-IBPNR-008, 018 | Partially Covered |
| SVC-09 | TC-IBPNR-012, 013, 014 | Partially Covered |
| SVC-10 | TC-IBPNR-021 | Partially Covered |
| SVC-11 | TC-IBPNR-023, 024, 025, 026, 027, 028, 029 | Partially Covered — validation rules undefined |
| SVC-12 | TC-IBPNR-022, 023, 024 | Unknown/Unassessed — error contract undefined |
| SVC-13 | TC-IBPNR-030 … TC-IBPNR-036 | Unknown/Unassessed — error contract and fault-injection capability both undefined |
| SVC-14 | TC-IBPNR-037 | Unknown/Unassessed — auth mechanism undefined |
| MIG-01 | TC-IBPNR-036, TC-IBPNR-REG-016 | Designed — not executable in the API-only phase |
| MIG-02 | TC-IBPNR-REG-001 … REG-015 | Designed — not executable in the API-only phase |
| MIG-03 | TC-IBPNR-020, TC-IBPNR-REG-011, REG-016 | Designed — not executable in the API-only phase; also blocked on dual-path availability |

## 4. Finding Disposition

No Findings exist — Stage 2 (Explorer) was not executed for this run. Nothing to disposition.

## 5. Risk Register

| Risk Level | Test Case ID(s) | Statement | Source |
|---|---|---|---|
| High | TC-IBPNR-REG-001 … REG-013, REG-015 … REG-019, REG-021 | Historical Import Booked PNR business behavior could regress silently when NDC-INT is replaced | R-IBPNR-04 (Project Context §6) |
| High | TC-IBPNR-REG-017 | No source defines the correct Rule Engine behavior once the originally-active batch has been deleted — a genuine gap, not just an execution blocker | HIST-20 (Meeting 1) |
| High | TC-IBPNR-005, TC-IBPNR-REG-011 | Fare/tax mapping differences would produce a wrong wallet deduction — a direct financial defect | HIST-08 + DEV-EX variance |
| High | TC-IBPNR-REG-012, REG-013 | The ticketing-time Rule Engine snapshot depends on the ticketing date arriving correctly through the new path | HIST-09, HIST-10 |
| High | TC-IBPNR-020, TC-IBPNR-REG-016 | Data the old path surfaced but the new path drops would change downstream business behavior invisibly | MIG-03 |
| High | TC-IBPNR-027 | Unsafe handling of injection-shaped input could leak data or crash the service | Negative Test Generation — Security Inputs |
| High | TC-IBPNR-030, 031, 034, 036, 037 | Undefined failure and auth behavior means the caller's own handling cannot be designed correctly | OQ (Project Context §8) |
| Medium | TC-IBPNR-001 … 004, 006, 009 … 019, 021 … 026, 032, 033, 035, TC-IBPNR-REG-014, REG-020, REG-022, REG-023, REG-024 | Contract shape, validation rules and error behavior are provisional until a live endpoint exists; report list is provisional pending business confirmation | R-IBPNR-01, R-IBPNR-03, HIST-19 |
| Low | TC-IBPNR-007, 008, 016, 018, 028, 029 | Lower-impact structural, encoding and routing checks | Negative Test Generation / DEV-EX |
