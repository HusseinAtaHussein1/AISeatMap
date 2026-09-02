# Coverage Report — run-005__2026-09-01_11-41-40__UserStory__ImportBookedPNR-NewLayerContract

| Field | Value |
|---|---|
| Module | `import-booked-pnr` |
| Feature | `new-layer-contract` |
| Produced by run | `run-005__2026-09-01_11-41-40__UserStory__ImportBookedPNR-NewLayerContract` |
| Revision | 3 (Meeting 1 incorporated) |
| Generated | 2026-09-01 |
| Status | Pending Review |

> **Revision 2 correction.** Revision 1 treated Import Booked PNR as an entirely new feature and
> produced coverage figures against that misreading. The business capability already exists; the
> **integration path** is what is new. This report now accounts separately for existing historical
> business requirements, new `NDC_Core_service` contract requirements, and the migration/regression
> requirements the swap creates.
>
> **Revision 3 addition.** `Import Booked PNR Meeting 1 (23-11).pdf` added seven historical
> requirements (HIST-14 … HIST-20) and eight regression cases (TC-IBPNR-REG-017 … 024). One of them,
> HIST-20 (Rule Engine batch deletion), is a genuine, currently unanswerable gap — not merely an
> execution blocker — and is reported as `Unknown/Unassessed` accordingly (§2.4).

## 1. Run Scope

| Field | Value |
|---|---|
| Run Scope Type / Source | Feature / the User Story supplied at intake |
| Run Type | User Story |
| Project Context | `modules/import-booked-pnr/features/new-layer-contract/context/ProjectContext.md` (rev 2) |
| Executable in this phase | API-level contract testing against `NDC_Core_service` only |
| Designed but not executable in this phase | Historical business regression and migration coverage — needs the full application with `NDC_Core_service` wired in |
| Out of scope for this phase | Import Booked PNR Admin UI (a later, separate Feature) |

## 2. Requirements Covered

### 2.1 Historical business requirements [HIST] — existing capability

| Requirement ID | Summary | Test Case ID(s) |
|---|---|---|
| HIST-01 | Works with offline booked/paid/ticketed PNRs | TC-IBPNR-REG-001 |
| HIST-02 | PNR must be ticketed; held/cancelled ineligible | REG-001, REG-002, REG-003 |
| HIST-03 | Supported cases: not-existing, or Failed status (4) | REG-004, REG-005 |
| HIST-04 | Duplicate import prevented, including by another user | REG-006, REG-007, REG-015 |
| HIST-05 | Organization must have Import Booked PNR enabled | REG-008 |
| HIST-06 | Required PCC configuration must exist | REG-009 |
| HIST-07 | Wallet validation, including sufficient credit | REG-010 |
| HIST-08 | Wallet deducted on successful import | REG-011 |
| HIST-09 | Rule Engine uses original offline ticketing date/time | REG-012 |
| HIST-10 | Rule active at ticketing still applies if later disabled | REG-013 |
| HIST-11 | Booking persisted with import classification and tracking | REG-014 |
| HIST-12 | Validations same as the OLD booked PNR feature | REG-008, REG-009, REG-010 |
| HIST-13 | Supplier/integration and normal input validations still apply | TC-IBPNR-027, REG-008/009/010 |
| HIST-14 | NDC Admin-only feature [Meeting 1] | Contextual — implicit in every REG precondition |
| HIST-15 | Two-part enablement: Agency toggle + Staff/Admin toggle [Meeting 1] | REG-018, REG-019 |
| HIST-16 | Offline ticketing; dual PNR statuses (Supplier/System) [Meeting 1] | REG-001, REG-002, REG-003 |
| HIST-17 | NDC Integration validations + NDC Core validations, as two categories [Meeting 1] | REG-020 |
| HIST-18 | Concurrent import of different PNRs under different rule batches [Meeting 1] | REG-021 |
| HIST-19 | Reflected in 8 named reports; one Super-Admin-only [Meeting 1, provisional] | REG-022, REG-023, REG-024 |
| HIST-20 | Rule batches periodically deleted — behavior on a deleted batch is undefined [Meeting 1] | REG-017 |

### 2.2 New `NDC_Core_service` contract requirements [US + DEV-EX]

| Requirement ID | Summary | Test Case ID(s) |
|---|---|---|
| SVC-01 | Booking-retrieval endpoint exists and takes a provider | TC-IBPNR-001, 002 |
| SVC-02 | Response returns the booking data Import Booked PNR needs | TC-IBPNR-001, 002, 009, 019, 020 |
| SVC-03 | Passenger mapping | TC-IBPNR-003, 014, 017 |
| SVC-04 | Segment mapping | TC-IBPNR-004, 015 |
| SVC-05 | Fare and tax mapping | TC-IBPNR-005, 010, 011, 017 |
| SVC-06 | Ticket and coupon mapping | TC-IBPNR-006, 016 |
| SVC-07 | Baggage allowance mapping | TC-IBPNR-007, 018 |
| SVC-08 | Service/ancillary mapping | TC-IBPNR-008, 018 |
| SVC-09 | Passenger↔ticket and segment↔coupon relationships | TC-IBPNR-012, 013, 014 |
| SVC-10 | Cross-provider normalization | TC-IBPNR-021 |
| SVC-11 | Request parameter validation | TC-IBPNR-023 … 029 |
| SVC-12 | Error scenarios | TC-IBPNR-022, 023, 024 |
| SVC-13 | Supplier failure handling | TC-IBPNR-030 … 036 |
| SVC-14 | Endpoint authentication/authorization | TC-IBPNR-037 |

### 2.3 Migration/regression requirements [US + HIST]

| Requirement ID | Summary | Test Case ID(s) |
|---|---|---|
| MIG-01 | `NDC_Core_service` replaces NDC-INT for booking retrieval | TC-IBPNR-036, REG-016 |
| MIG-02 | Every historical behavior still holds after the swap | REG-001 … REG-015 |
| MIG-03 | Business data matches between the two integration paths | TC-IBPNR-020, REG-011, REG-016 |

**Coverage Percentage: 0% Covered** (37 requirements, none confirmable yet)

| Category | Count | Notes |
|---|---|---|
| Covered | 0 | Nothing is verified — no live endpoint, no Discovery evidence, no signed contract |
| Partially Covered | 11 | SVC-01 … SVC-11 — designed against developer examples, awaiting a live endpoint |
| Designed, Not Executable This Phase | 22 | HIST-01 … HIST-19 (excluding HIST-20), MIG-01 … MIG-03 — real coverage, deferred to the integration phase, not a gap |
| Unknown / Unassessed | 4 | SVC-12, SVC-13, SVC-14 — error contract/auth undefined; HIST-20 — no source states the correct Rule Engine behavior once a batch is deleted, a genuine gap rather than only an execution blocker |
| Uncovered | 0 | No requirement is left without designed coverage |

## 2.4 The one genuine (non-execution) gap: HIST-20

Every other item above is blocked only by *execution* — a missing endpoint, an unconfirmed error
contract, or a phase that hasn't started. **HIST-20 is different: no source, including Meeting 1
itself, states what the correct Rule Engine behavior is once a PNR's originally-active rule batch has
been deleted.** `TC-IBPNR-REG-017` is designed to discover the answer, but its Expected Result cannot
be written as a fixed assertion — it is `ClassD-Blocked` for a business-rule reason, not an
environment reason. This is called out separately because "blocked pending an endpoint" and "blocked
pending a decision nobody has made yet" are different kinds of gaps.

**"Designed, Not Executable This Phase" is not "Uncovered".** These are real, designed regression
cases with concrete expected results, waiting on the integration phase rather than on more design work.

## 3. Coverage Matrix

See `TraceabilityMatrix.md` §3 for the full requirement → test case roll-up. Summary:

| Requirement Group | Requirements | Test Cases | Status |
|---|---|---|---|
| Historical business (HIST-01 … 20) | 20 | 24 regression cases | Designed, not executable this phase (except HIST-20 — genuine gap) |
| New contract (SVC-01 … 14) | 14 | 37 contract cases | Partially Covered (11) / Unknown (3) |
| Migration (MIG-01 … 03) | 3 | 3 cases, overlapping the above | Designed, not executable this phase |

## 4. Business Rules

The Historical Documentation supplies confirmed business rules for the **existing** capability. These
are Historical Requirements, not assumptions, and are listed here so business-rule coverage is
auditable on its own.

| Business Rule ID | Rule | Test Case ID(s) | Status |
|---|---|---|---|
| HIST-02 | Only ticketed PNRs are eligible; held and cancelled are not | REG-001, REG-002, REG-003 | Designed, not executable this phase |
| HIST-03 | Importable when the PNR does not exist in NDC, or exists with Failed status (4) | REG-004, REG-005 | Designed, not executable this phase |
| HIST-04 | Duplicate import is prevented, including across users | REG-006, REG-007, REG-015 | Designed, not executable this phase |
| HIST-05 | The organization must have Import Booked PNR enabled | REG-008 | Designed, not executable this phase |
| HIST-06 | The organization must have the required PCC configuration | REG-009 | Designed, not executable this phase |
| HIST-07 | Wallet credit must be sufficient | REG-010 | Designed, not executable this phase |
| HIST-08 | The wallet is deducted once, correctly, on success | REG-011 | Designed, not executable this phase |
| HIST-09 | Rule Engine uses the offline ticketing date/time | REG-012 | Designed, not executable this phase |
| HIST-10 | A rule active at ticketing applies even if later disabled | REG-013 | Designed, not executable this phase |
| HIST-11 | Import classification and tracking are recorded; import time ≠ ticketing time | REG-014 | Designed, not executable this phase |
| HIST-12 | Validations are the same as the OLD booked PNR feature | REG-008, REG-009, REG-010 | Designed, not executable this phase |
| HIST-15 | Two-part enablement: Agency toggle, and Admin toggle when the importer is Staff | REG-018, REG-019 | Designed, not executable this phase |
| HIST-16 | Offline ticketing; dual PNR statuses (Supplier/System) both relevant to eligibility | REG-001, REG-002, REG-003 | Designed, not executable this phase |
| HIST-17 | Two validation categories: NDC Integration + NDC Core | REG-020 | Partially designed — categories named, not yet enumerated |
| HIST-18 | Concurrent import of different PNRs under different rule batches | REG-021 | Designed, not executable this phase |
| HIST-19 | Reflected in 8 named reports; one Super-Admin-only | REG-022, REG-023, REG-024 | Partially designed — report list itself provisional |
| HIST-20 | Rule batches periodically deleted; behavior on a deleted batch is undefined | REG-017 | Unknown/Unassessed — genuine business-rule gap, see §2.4 |

**No business rule has been confirmed for `NDC_Core_service` itself.** Its validation rules, error
contract, and auth model are all Open Questions (§8).

## 5. Test Scenarios

**By module:**

| Module | Total | Atomic | Scenario | E2E | Positive | Negative | Discovery | Regression |
|---|---|---|---|---|---|---|---|---|
| import-booked-pnr / new-layer-contract | 61 | 58 | 3 | 0 | 21 | 20 | 21 | 24 |

**By classification:**

| Classification | Count |
|---|---|
| ClassA-Confirmed | 0 |
| ClassB-Regression | 24 |
| ClassC-Discovery | 21 |
| ClassD-Blocked | 17 |

**By dimension (§7 Negative Test Generation, §17 Required Dimensions):**

| Dimension / Negative Subtype | Case Count |
|---|---|
| Positive Scenarios | 21 |
| Negative — Invalid Inputs | 3 (TC-024, 025, 027) |
| Negative — Boundary Values | 1 (TC-026) |
| Negative — Empty Values | 2 (TC-023, 029) |
| Negative — Unicode | 1 (TC-028) |
| Negative — Special Characters | Covered by TC-027 (injection-shaped input exercises the same handling path) |
| Negative — Security Inputs | 2 (TC-027, TC-037) |
| Negative — Timeouts | 1 (TC-030) |
| Business Rules (§17) | 20 historical rules, 24 regression cases |
| Error Handling (§17) | 7 (TC-030 … TC-036) |
| Permissions (§17) | 4 (TC-037 endpoint auth; REG-008/018 org permission; REG-009 PCC; REG-019 Staff/Admin toggle; REG-023 report role visibility) |
| Configuration (§17) | 3 (REG-012, REG-013, REG-017 — Rule Engine batch state over time) |
| Regression Impact (§17) | 24 (the full REG set) |
| Integration Behaviour (§17) | 3 (TC-021, TC-036, REG-016) |
| Risk-based Prioritization (§17) | Reflected in each case's Priority |
| Exploratory Recommendations (§17) | 21 ClassC-Discovery cases, plus REG-022/023/024 (report reflection, pending confirmation) |

## 6. Manual Test Cases

| Module | Markdown | Excel | Case Count |
|---|---|---|---|
| import-booked-pnr / new-layer-contract | `features/new-layer-contract/test_design/TestCases_ImportBookedPNR.md` | `features/new-layer-contract/test_design/TestCases_ImportBookedPNR.xlsx` | 61 |
| **Total** | | | **61** |

One file deliberately groups three requirement groups (HIST, SVC, MIG), because they describe one
capability across one migration and splitting them would hide the relationship the suite exists to
protect. Regression cases carry the `TC-IBPNR-REG-` prefix to keep them separable.

## 7. Assumptions

| ID | Statement | Test Case ID | Type |
|---|---|---|---|
| A-IBPNR-01 | `NDC_Core_service` is a not-yet-fully-specified internal service whose contract this work defines | TC-IBPNR-001, 002 | Assumption |
| A-IBPNR-02 | The two example payloads are representative but field presence/nullability varies per supplier | TC-IBPNR-018, 019 | Assumption |

**Historical requirements are deliberately not listed here.** HIST-01 … HIST-20 come from supplied
documentation and Meeting 1 and are recorded as requirements (§2.1, §4), not assumptions.

## 8. Coverage Gaps

| Gap Type | ID | Reason | Smallest Unblocking Prerequisite |
|---|---|---|---|
| Partially Covered | SVC-01 … SVC-11 | No live `NDC_Core_service` endpoint exists to execute against; Stage 2 was not run | Developer exposes `NDC_Core_service` on a reachable environment, then run `/explorer-skill` |
| Unknown/Unassessed | SVC-12 | The error-response contract (status codes, message shape) is undefined | Developer confirms the error contract for not-found, invalid and unsupported input |
| Unknown/Unassessed | SVC-13 | Supplier failure-mode behavior is undefined, and no fault-injection capability is confirmed | Developer confirms failure-mode behavior; confirm whether supplier faults can be simulated in a test environment |
| Unknown/Unassessed | SVC-14 | The endpoint's authentication/authorization mechanism is unknown | Developer confirms the auth mechanism |
| Designed, Not Executable | HIST-01 … HIST-19 (excluding HIST-20), MIG-01, MIG-02 | Requires the full application with `NDC_Core_service` wired into the Import Booked PNR flow — beyond this API-only phase | Schedule the integration/regression execution phase once `NDC_Core_service` is integrated |
| Designed, Not Executable | MIG-03 | Additionally requires both integration paths to be exercisable for the same booking | Confirm whether NDC-INT and `NDC_Core_service` can both be reached in one environment, or capture NDC-INT baselines before cutover |
| Partially Covered | HIST-13 | The Historical Documentation states supplier/integration validations apply but does not enumerate them | Obtain the full validation list from the OLD booked PNR feature specification (tracked to Eng. Tamer, Meeting 1 action items) |
| Partially Covered | HIST-17 | Meeting 1 names two validation categories (NDC Integration, NDC Core) but does not enumerate either | Same prerequisite as HIST-13 |
| Partially Covered | HIST-19 | The 8-report reflection list is provisional | Confirm the list (tracked to Eng. Hagar/Nasser, Meeting 1 action items) |
| Unknown/Unassessed | HIST-20 | No source states the correct Rule Engine behavior once a PNR's originally-active batch has been deleted — see §2.4 | Business decision required: what pricing applies when the original batch is gone |
| Not testable as a case | AC-1, AC-7 (investigate the flow; document gaps) | Process/documentation acceptance criteria | None — satisfied by the Project Context and this report |

## 9. Risks

**High / Critical:**

| Risk Level | Test Case ID(s) | Statement |
|---|---|---|
| High | REG-001 … REG-013, REG-015 … REG-019, REG-021 | Historical business behavior could regress silently when NDC-INT is replaced |
| High | REG-017 | No source defines the correct Rule Engine behavior once the originally-active batch is deleted — a genuine gap, not just an execution blocker |
| High | TC-IBPNR-005, REG-011 | Fare/tax mapping differences would produce a wrong wallet deduction — a direct financial defect |
| High | REG-012, REG-013 | The ticketing-time Rule Engine snapshot depends on the ticketing date arriving correctly through the new path |
| High | TC-IBPNR-020, REG-016 | Data the old path surfaced but the new path drops would change downstream behavior invisibly |
| High | TC-IBPNR-027 | Unsafe input handling could leak data or crash the service |
| High | TC-IBPNR-030, 031, 034, 036, 037 | Undefined failure and auth behavior means the caller's own handling cannot be designed correctly |

**All risks:**

| Risk Level | Count |
|---|---|
| High | 38 |
| Medium | 21 |
| Low | 6 |

## 10. Recommendations

| ID | Recommendation | Rationale |
|---|---|---|
| REC-01 | Expose `NDC_Core_service` on a shared, reachable environment (not `localhost`) and run Stage 2 (Explorer) against it before executing any contract case | 37 contract cases are currently unverifiable — the single largest blocker |
| REC-02 | Obtain the error-response contract from the developer: status codes and message shape for not-found, invalid input, unsupported provider, supplier failure, and internal failure | 16 ClassD-Blocked cases cannot have trustworthy expected results without it |
| REC-03 | Confirm the authentication/authorization mechanism for the endpoint | Blocks the Permissions dimension and TC-IBPNR-037 |
| REC-04 | Obtain the full validation list from the OLD booked PNR feature, so HIST-12's "same validations" can be verified item by item rather than in summary | HIST-12 is currently covered by three representative cases, not by an enumerated list |
| REC-05 | Capture NDC-INT baseline responses for a set of representative bookings **before** cutover | REG-016 compares the two paths. Once NDC-INT is switched off, that comparison becomes impossible and the migration can no longer be proven safe |
| REC-06 | Confirm whether supplier faults (timeout, outage, malformed response) can be simulated in a test environment | Seven supplier-failure cases depend on that capability |
| REC-07 | Schedule an integration/regression execution phase for the 16 regression cases once `NDC_Core_service` is wired into the Import Booked PNR flow | These are the cases that answer "can the new layer actually replace the old one" |
| REC-08 | Treat the developer's two example payloads as samples, not a specification, until a schema is published | Prevents the revision 1 failure mode from recurring |
| REC-09 | Get a business decision on Rule Engine behavior when a PNR's originally-active batch has been deleted (HIST-20) | This is not an execution blocker but an unmade decision — REG-017 cannot be given a fixed expected result without it |
| REC-10 | Confirm the 8-report reflection list and the two validation-category enumerations via the Meeting 1 action items already assigned to Eng. Hagar/Nasser and Eng. Tamer | These are tracked, owned items, not new asks — closing them resolves HIST-13, HIST-17 and HIST-19's "provisional" status |

## 11. Review & Automation

| Column | Pending | Approved | Rejected |
|---|---|---|---|
| **Review** | 61 | 0 | 0 |
| **Automation** | 61 | 0 | 0 |

| Decision | Count | Test Case IDs |
|---|---|---|
| `Review = Approved` — executable by Stage `4M` | 0 | — |
| `Review = Rejected` — excluded, reason `Rejected at Review` | 0 | — |
| `Review = Pending` — excluded, reason `Pending Review` | 61 | TC-IBPNR-001 … 037, TC-IBPNR-REG-001 … 024 |
| `Review = Approved AND Automation = Approved` — in scope for Stage `4A` | 0 | — |
| `Review = Approved AND Automation = Rejected` — manual by decision | 0 | — |

**Inconsistent pairs:** None.

## 12. Inputs for Both Branches

| Required Input | Present? | Location / Note |
|---|---|---|
| Project Context (Governing) | Yes | `features/new-layer-contract/context/ProjectContext.md` (rev 3) |
| Manual Test Suite (Primary) | Yes | `features/new-layer-contract/test_design/TestCases_ImportBookedPNR.md` (+ `.xlsx`) |
| Requirement Traceability Matrix (Secondary) | Yes | `features/new-layer-contract/test_design/TraceabilityMatrix.md` (rev 3) |
| Coverage Report (Secondary) | Yes | This document |
| Historical feature documentation (prose + Meeting 1 slides) | Yes | Supplied 2026-09-01; distilled into Project Context §2.1/§0.1 and this report §2.1/§4 |
| Discovery Artifacts (Secondary) | **No** | Stage 2 not run — no live endpoint exists |
| Findings (Secondary) | **No Findings exist** | Nothing to disposition |
| Evidence Packages (Secondary) | **No** | None — no Findings exist |

**Handoff confirmation:** Handoff is **incomplete by design**. No case is executable against a real
system yet. The 16 ClassD-Blocked cases must not be executed until REC-02/REC-03 are answered — an
executor would otherwise have to invent a pass criterion. The 16 ClassB-Regression cases belong to a
later integration phase, not to this API-only one. Neither Stage `4M` nor Stage `4A` should treat this
suite as ready to run until REC-01 is satisfied.
