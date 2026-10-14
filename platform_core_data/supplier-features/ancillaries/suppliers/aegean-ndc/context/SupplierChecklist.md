# Supplier Checklist — AegeanNdc

**Scope family:** Supplier Features → Feature → Supplier
**Feature:** Ancillaries (ancillaries)
**Integration Layer:** Unknown / not declared
**Supplier:** AegeanNdc (aegean-ndc)
**Status:** Draft
**Revision:** 6
**Last Updated:** 2026-10-14
**Produced by run:** run-011__2026-10-14_10-24-14__Targeted__Ancillaries-AegeanNdc
**Rendered from Feature Profile:** platform_core_data/supplier-features/ancillaries/context/FeatureChecklistProfile.md (revision 2)
**Capability Model used for §5c:** platform_core_data/supplier-features/ancillaries/context/CapabilityModel.md (revision 1)

### Revision History

| Rev | Date | Changed By | What Changed | Why / Evidence |
|---|---|---|---|---|
| 1 | 2026-10-14 | Rendering agent (Claude), for Hussien Ata | Initial intake. Rendered from the generic template and the Ancillaries Feature Checklist Profile rev 2, with §5c from the Capability Model rev 1. §2c and §7c mirror the values recorded in `supplier.json` | Supplier AegeanNdc approved 2026-10-14 by Hussien Ata. Capabilities, credential and rules supplied at intake |
| 2 | 2026-10-14 | Claude, for Hussien Ata | Environment & access supplied: credential name AegeanNDCProd, PCC EGY, Admin and Portal URLs, Branch NDC1_Hussein, Agency Hussein_AGN (AGN9748), Admin and Portal accounts, route CAI–FCO. SUP-OQ-02 and SUP-OQ-03 answered; SUP-OQ-04 partly answered. Added SUP-OQ-08 (production-named credential) | Intake — Hussien Ata, 2026-10-14. Passwords were supplied in session and deliberately **not** recorded in this repository |
| 3 | 2026-10-14 | Claude, for Hussien Ata | Travel date 2026-10-15, market EGY, AegeanNdc assigned to Branch NDC1_Hussein, AegeanNDCProd confirmed **not** a production credential. SUP-OQ-02, SUP-OQ-03 and SUP-OQ-08 answered; SUP-OQ-04 narrowed to airline scope and multi-segment data | Human decision, Hussien Ata, 2026-10-14 |
| 4 | 2026-10-14 | Claude, for Hussien Ata | No multi-segment route is available for AegeanNdc. Recorded as a supplier limitation; segment- vs journey-level distinction marked Blocked; SUP-OQ-04 narrowed to airline scope only | Human decision, Hussien Ata, 2026-10-14 |
| 5 | 2026-10-14 | Claude, for Hussien Ata | Bound to run-011__2026-10-14_10-24-14__Targeted__Ancillaries-AegeanNdc. §2 and §2b: API, Contract, Integration, DB, Security and Performance Out of Scope for this run; execution in Admin + Portal | Human scope restriction 2026-10-14 (Hussien Ata): functional only
| 6 | 2026-10-14 | Claude, for Hussien Ata | §5a travel date changed from 2026-10-15 to 2026-10-16 (route CAI→FCO unchanged); run-011 `run.json` environment.travelDate updated to match | Human decision, Hussien Ata, 2026-10-14: execution moves past 2026-10-15 |

---

> A Supplier scope is the **complete QA ownership boundary** for this Feature + Supplier
> implementation:
>
> ```
> Application UI
>     ↓
> Application
>     ↓
> Supplier
> ```
>
> Ancillaries declares no `integrationLayer` (`null`), so the path has three tiers. The
> integration-layer tier is omitted. That is a complete, valid scope, not a gap. The Feature can span
> more than one application: Admin for configuration and Portal for the business flow. Each
> application's access details are recorded separately.
>
> By default a Supplier run is **Full Feature QA** across every applicable layer. No run exists yet
> and no human scope restriction has been stated, so every layer is In Scope. See §2b.
>
> This checklist holds only **supplier-specific** information. Shared Feature business requirements
> belong to the Feature's approved shared context,
> `shared/ancillaries-baseline/context/ProjectContext.md` rev 1, through the Feature Checklist Profile
> named above. They are not duplicated here. Supplier-specific Test Cases must trace back to the
> shared `ANC-xx` requirement IDs.
>
> AegeanNdc under Ancillaries is its own Supplier scope. It is independent of any Supplier with the
> same name under another Feature.

Every field below carries a Status: Confirmed · Provided · Unknown · To Be Discovered · Blocked ·
Pending Confirmation · N/A.

## 1. Supplier Identity — GENERIC

| Field | Value | Status | Evidence/Source | Notes |
|---|---|---|---|---|
| Supplier name | AegeanNdc | Provided | `supplier.json` (approved 2026-10-14 by Hussien Ata) | |
| Provider ID / code | Unknown | Unknown | — | No Provider ID was supplied at intake. §12 SUP-OQ-01 |
| Integration type (if known) | Unknown | Unknown | — | Not inferred from the "Ndc" in the name |
| Airline/GDS scope (if applicable) | Unknown. Known route: CAI–FCO | Unknown (airline). Provided (route) | Intake, 2026-10-14 | Airline not inferred from the Supplier's name. §12 SUP-OQ-04 |

## 2. Supplier Scope — GENERIC

| Field | Value | Status | Evidence/Source | Notes |
|---|---|---|---|---|
| Feature capability being implemented | Ancillaries — Baggage and Seat (per §5c); Hold and Pay after Hold (per §2c) | Provided | Intake, 2026-10-14 | Meal and Bundle recorded Not Supported |
| Supported booking/use cases | Pending Confirmation | Pending Confirmation | — | No scope description supplied at intake. §12 SUP-OQ-06 |
| Known exclusions | Meal, Bundle | Provided | Intake, 2026-10-14 | Capability facts, not defects (ANC-05) |
| Known supplier limitations | No route with more than one segment is available | Provided | Human decision, Hussien Ata, 2026-10-14 | Segment- vs journey-level behavior cannot be distinguished (§5a, §5c). Other limitations: Unknown |
| UI scope included? | Yes | Provided | run-011 `testingLayerScope` | Admin + Portal |
| API scope included? | No | Provided | run-011 `testingLayerScope` | Out of Scope for run-011. Human scope restriction 2026-10-14 (Hussien Ata): functional only |
| Contract scope included? | No | Provided | run-011 `testingLayerScope` | Out of Scope for run-011. Human scope restriction 2026-10-14 (Hussien Ata): functional only |
| Integration scope included? | No | Provided | run-011 `testingLayerScope` | Out of Scope for run-011. Human scope restriction 2026-10-14 (Hussien Ata): functional only |
| E2E scope included? | Yes | Provided | run-011 `testingLayerScope` | |
| Regression against previous integration required? | Unknown | Unknown | — | No "previous integration" baseline identified |
| DB validation applicable? | No | Provided | run-011 `testingLayerScope` | Out of Scope for run-011. Human scope restriction 2026-10-14 (Hussien Ata): functional only |
| Security testing applicable? | No | Provided | run-011 `testingLayerScope` | Out of Scope for run-011. Human scope restriction 2026-10-14 (Hussien Ata): functional only |
| Performance testing applicable? | No | Provided | run-011 `testingLayerScope` | Out of Scope for run-011. Human scope restriction 2026-10-14 (Hussien Ata): functional only |

## 2c. Supplier Capabilities — GENERIC

Recorded at intake (`ndc_execution_rules.md` §A15). The authoritative values are in `supplier.json`,
written with `cli.js supplier-feature supplier capabilities` — this table mirrors them. `Unknown` is
treated as Not Supported when a run is planned.

| Capability | Supported / Not Supported / Unknown | Source | Notes |
|---|---|---|---|
| Hold | **Supported** | Intake — Hussien Ata, 2026-10-14 | |
| Pay after Hold | **Supported** | Intake — Hussien Ata, 2026-10-14 | |
| Meal | **Not Supported** | Intake — Hussien Ata, 2026-10-14 | Meal cases are excluded at planning, never run and failed |
| Baggage | **Supported** | Intake — Hussien Ata, 2026-10-14 | |
| Seat | **Supported** | Intake — Hussien Ata, 2026-10-14 | |
| Bundle | **Not Supported** | Intake — Hussien Ata, 2026-10-14 | Bundle and cabin × bundle cases are excluded at planning |

## 2b. Testing Layer Scope — GENERIC

Frozen on run-011 (`ndc_execution_rules.md` §A4). The only way to change it is `run_manager/cli.js scope-change`.

| Layer | In Scope / Out of Scope / Deferred | Reason (mandatory if not In Scope) | Notes |
|---|---|---|---|
| UI | In Scope | | |
| API | Out of Scope | Human scope restriction 2026-10-14 (Hussien Ata): functional only | |
| Contract | Out of Scope | Human scope restriction 2026-10-14 (Hussien Ata): functional only | |
| Integration | Out of Scope | Human scope restriction 2026-10-14 (Hussien Ata): functional only | |
| E2E | In Scope | | |
| Regression | In Scope | | |
| DB | Out of Scope | Human scope restriction 2026-10-14 (Hussien Ata): functional only | |
| Security | Out of Scope | Human scope restriction 2026-10-14 (Hussien Ata): functional only | |
| Performance | Out of Scope | Human scope restriction 2026-10-14 (Hussien Ata): functional only | |

## 3. Environment & Access — GENERIC

### 3a. UI

The Feature Execution Flow keeps Admin and Portal details apart while OQ-ANC-08 is open. Each is
recorded on its own row here.

| Field | Value | Status | Evidence/Source | Notes |
|---|---|---|---|---|
| Application URL/environment — Admin | http://192.168.1.83/auth/login | Provided | Intake, 2026-10-14 | |
| Application URL/environment — Portal | http://192.168.1.83:9500/auth/login | Provided | Intake, 2026-10-14 | Same host as Admin, different port. Whether they share one tenant/login stays Open — OQ-ANC-08 |
| Required role/user | Admin: user `e.saady`. Portal: Agency code AGN9748, email Hussien.ata@tildetech.ae | Provided | Intake, 2026-10-14 | Admin and Portal use different accounts. Role name: To Be Discovered (Profile §A, ANC-14). §12 SUP-OQ-05 |
| Navigation/menu availability | To Be Discovered | To Be Discovered | — | |
| Supplier configuration visibility | To Be Discovered | To Be Discovered | — | ExecutionFlow §2, ANC-15 |
| Branch/Agency/PCC setup | Branch NDC1_Hussein. Agency Hussein_AGN (AGN9748). PCC EGY | Provided | Intake, 2026-10-14 | AegeanNdc assigned to NDC1_Hussein — Provided (Hussien Ata, 2026-10-14); live evidence To Be Discovered at the Admin precheck (ANC-15) |
| Required permissions | Unknown | Unknown | — | |
| Test account availability | Admin `e.saady`; Portal AGN9748 / Hussien.ata@tildetech.ae | Provided | Intake, 2026-10-14 | Passwords are held outside this repository (`knowledge_base/credentials/credentials.json`, gitignored, created by a human) and are never recorded here |

### 3b. API / Integration

| Field | Value | Status | Evidence/Source | Notes |
|---|---|---|---|---|
| Integration layer base URL (per the Feature's declared `integrationLayer`; N/A when it declares none) | N/A | N/A | `module.json`: `integrationLayer: null` | The Feature declares no integration layer |
| Endpoint(s) | https://ndc-integration-stg-ne-3.azurewebsites.net | Provided | Intake — Hussien Ata, 2026-10-14 (given as the supplier credential) | A staging endpoint, by its name. Recorded as supplied; not treated as an integration layer, which the Feature does not declare |
| Authentication mechanism | Unknown | Unknown | — | |
| Supplier credential | "AegeanNDCProd" (endpoint https://ndc-integration-stg-ne-3.azurewebsites.net) | Provided | Intake — Hussien Ata, 2026-10-14 | Record exactly this credential on every execution (ANC-17). Despite "Prod" in the name, it is **not** a production credential (Hussien Ata, 2026-10-14) — §12 SUP-OQ-08 |
| Provider ID | Unknown | Unknown | — | |
| Environment availability | Unknown | Unknown | — | |
| Logs/observability access | Unknown | Unknown | — | |
| Swagger/OpenAPI/Postman availability | Unknown | Unknown | — | |
| Direct API access availability | Unknown | Unknown | — | |
| PCC / market | PCC: EGY. Market: EGY | Provided | Intake, 2026-10-14 | |

### 3c. Source / Target Environment Model (if applicable)

| Field | Value | Status | Evidence/Source | Notes |
|---|---|---|---|---|
| Dual-environment execution required? | N/A | N/A | ExecutionFlow_HappyPath.md. Profile §D | Ancillaries creates its booking inside its own flow. `ndc_execution_rules.md` §C1 does not apply |
| Source Environment (preparation/offline environment, if required) | N/A | N/A | Same as above | The Feature's execution flow requires no Source environment |
| Target Environment (the environment under test) | Admin http://192.168.1.83/auth/login. Portal http://192.168.1.83:9500/auth/login | Provided | Intake, 2026-10-14 | |
| Feature-level Execution Flow reference (path, if one exists for this Feature) | `platform_core_data/supplier-features/ancillaries/context/ExecutionFlow_HappyPath.md` (rev 2) | Provided | Referenced, not duplicated (`ndc_execution_rules.md` §A1) | §3.1 cabin × bundle coverage is gated on Bundle, which is Not Supported here |

## 4. UI / User Flow — GENERIC

| Field | Value | Status | Evidence/Source | Notes |
|---|---|---|---|---|
| Screen/page name | To Be Discovered | To Be Discovered | — | |
| Entry/navigation path | Per ExecutionFlow_HappyPath.md (Admin precheck, then Portal flow) | Provided | ExecutionFlow rev 2. Profile §D | Not yet observed for this Supplier |
| Required fields | To Be Discovered | To Be Discovered | — | |
| Supplier selection | To Be Discovered | To Be Discovered | — | Flight attribution to AegeanNdc needs evidence (ANC-20) |
| Supplier credential selection | "AegeanNDCProd" | Provided | Intake, 2026-10-14 | §12 SUP-OQ-08 |
| Branch/Agency/Agent fields (where applicable) | Branch NDC1_Hussein. Agency Hussein_AGN (AGN9748) | Provided | Intake, 2026-10-14 | Agent name: To Be Discovered |
| Search/action buttons | To Be Discovered | To Be Discovered | — | |
| Expected successful flow | Per ExecutionFlow_HappyPath.md | Provided | ExecutionFlow rev 2 | |
| Expected failure behavior/messages | To Be Discovered | To Be Discovered | — | |
| Loading/progress behavior | To Be Discovered | To Be Discovered | — | |
| Data displayed after retrieval | To Be Discovered | To Be Discovered | — | |
| UI validations | To Be Discovered | To Be Discovered | — | |
| Role/permission differences | Unknown | Unknown | — | |
| Known UI limitations | Unknown | Unknown | — | |
| UI evidence/screenshots/designs available | None for this Supplier | Unknown | — | `context/ANCILLARIES-SEATMAP.md` is Feature-level background, not evidence for this Supplier |

## 5. Test Data

### 5a. Generic Test Data — GENERIC

| Field | Value | Status | Evidence/Source | Notes |
|---|---|---|---|---|
| UI account/user | Admin `e.saady`. Portal AGN9748 / Hussien.ata@tildetech.ae | Provided | Intake, 2026-10-14 | No passwords are recorded here |
| Valid organization/branch | Branch NDC1_Hussein. Agency Hussein_AGN (AGN9748) | Provided | Intake, 2026-10-14 | |
| Valid happy-path test data | Route CAI→FCO. Travel date 2026-10-16 | Provided (route, date). To Be Discovered (flight numbers) | Updated 2026-10-14 (rev 6; was 2026-10-15 at intake) | The date must be in the future at execution time; replace it if execution runs on or after 2026-10-16. That the route returns AegeanNdc results: To Be Discovered (ANC-20) |
| Invalid/negative test data | To Be Discovered | To Be Discovered | — | |
| Multi-passenger data (if applicable) | To Be Discovered | To Be Discovered | — | |
| Multi-segment data (if applicable) | None available — no AegeanNdc route has more than one segment | Blocked | Human decision, Hussien Ata, 2026-10-14 | A single-segment route cannot tell segment-level from journey-level behavior (Profile §A). Application Level stays unresolved between Per Segment and Per Journey; no case may assert one over the other |
| Supplier-specific test data | Unknown | Unknown | — | |

### 5b. Feature-Specific Test Data — INJECTED FROM FEATURE PROFILE

| Test Data Item | Why (Requirement ID) | Notes |
|---|---|---|
| Branch configured with the Supplier under test, active/available | ANC-14, ANC-15 | Precondition. Without it the execution is Blocked, not Failed |
| Supplier Credential / PCC / Market assigned to that Branch | ANC-16, ANC-17 | Record exactly which credential is used — never chosen arbitrarily |
| Admin user able to configure a Branch and assign a Supplier | ANC-14 | Actual role name To Be Discovered per Supplier |
| Portal user able to search, book, and select ancillaries | ANC-19, ANC-21 | May or may not be the same account as the Admin user — OQ-ANC-08 |
| A valid search route and date returning results from the Supplier under test | ANC-19, ANC-20 | Availability may depend on route / cabin / fare family — ANC-39, per-Supplier |
| A multi-segment journey (e.g. CAI to DXB to BKK) | ANC-10, ANC-11, ANC-12, ANC-13 | Required to tell Segment-level from Journey-level behavior. A single-segment route cannot distinguish them |
| Valid passenger data for the required passenger mix | ANC-21 | Passenger-type eligibility rules are Feature-level (OQ-ANC-06 answered 2026-09-27); Supplier-only rules are in each Supplier's `SupplierChecklist.md` §7c |
| A fare/cabin on which ancillaries are actually offered | ANC-39 | Which fares expose ancillaries is a per-Supplier Discovery obligation, never assumed |
| At least one flight **per cabin class** the Supplier returns, and the live bundle list for each cabin `[gated: Bundle]` | ANC-39; human decision 2026-09-27 | Drives the cabin × bundle matrix — `ExecutionFlow_HappyPath.md` §3.1. Prefer one flight selling several cabins on the same aircraft |
| Baggage-eligible booking `[gated: Baggage]` | ANC-23, ANC-29, ANC-37 | Only where Baggage is Supported for this Supplier |
| Meal-eligible booking `[gated: Meal]` | ANC-23, ANC-29, ANC-37 | Only where Meal is Supported for this Supplier |
| Seat-eligible booking `[gated: Seat]` | ANC-23, ANC-29, ANC-37 | Only where Seat is Supported. Exposing Seat claims no Seatmap scope — OQ-ANC-09 |
| Bundle-eligible booking `[gated: Bundle]` | ANC-23, ANC-29, ANC-37 | Only where Bundle is Supported. Exposing Bundle claims no Upselling scope — OQ-ANC-10 |
| A capability confirmed **Unsupported** for this Supplier | ANC-05 | Test data for the optional unsupported-capability confirmation case. Never a defect |
| Quantity/limit boundary data per supported capability | ANC-41 | Maximum baggage quantity, seat eligibility, bundle restrictions — values are per-Supplier, recorded from evidence, never invented |

### 5c. Feature Capability Matrix — INJECTED FROM FEATURE PROFILE (CONDITIONAL)

This section renders because `context/CapabilityModel.md` exists for Ancillaries. The dimensions and
vocabulary come from Capability Model rev 1, §2 and §3. **Capability Result for all four
capabilities was provided at intake** (Hussien Ata, 2026-10-14), Source Status `Provided` — not yet
Verified. Per Capability Model §8, Supported + Provided cases may be designed with a **verification
dependency**; Unsupported + Provided is treated as Unsupported for coverage, with the absence noted as
unverified. Application Level and the other dimensions were not provided and keep the absence default.

"Other dimensions" means UI visible · API data available · Price available · Currency returned ·
Passenger association · Flight association · Pricing basis · Availability timing · Restrictions.

| Capability | Capability Result | Source Status | Application Level | Source Status | Other dimensions (per the Feature's Capability Model) | Evidence | Notes |
|---|---|---|---|---|---|---|---|
| Baggage | Supported | Provided | To Be Discovered | — | All To Be Discovered | To Be Discovered | Verification dependency until Discovery or execution confirms. Per Segment vs Per Journey cannot be resolved — no multi-segment route (§5a) |
| Meal | Unsupported | Provided | N/A | — | N/A | To Be Discovered | Absence unverified. Optional unsupported-capability confirmation case only (ANC-05) |
| Seat | Supported | Provided | To Be Discovered | — | All To Be Discovered | To Be Discovered | OQ-ANC-09 stays open at Feature level. Verification dependency until confirmed. Per Segment vs Per Journey cannot be resolved — no multi-segment route (§5a) |
| Bundle | Unsupported | Provided | N/A | — | N/A | To Be Discovered | Absence unverified. Cabin × bundle rows do not apply. Optional unsupported-capability confirmation case only (ANC-05) |

**Discrepancy records for this Supplier** — one block per contradicted value, appended, never
overwriting:

| Capability | Dimension | Provided Value | Discovery Finding | Final Verified Value | Evidence | Change Reason |
|---|---|---|---|---|---|---|
| N/A | N/A | N/A | N/A | N/A | N/A | No contradictions recorded. Discovery has not run |

## 6. Contract / Mapping — GENERIC

| Field | Value | Status | Evidence/Source | Notes |
|---|---|---|---|---|
| Request shape | To Be Discovered | To Be Discovered | — | |
| Response shape | To Be Discovered | To Be Discovered | — | |
| Provider-specific fields | To Be Discovered | To Be Discovered | — | |
| Original ticketing date/time mapping (if applicable to this Feature) | N/A | N/A | — | Import-Booked-PNR concern (tier §C). Does not apply to Ancillaries |
| Booking status mapping | To Be Discovered | To Be Discovered | — | Includes held vs. paid status — Hold and Pay after Hold are Supported |
| Supplier status → platform status mapping | To Be Discovered | To Be Discovered | — | |
| Supplier identifier / provider routing | Unknown | Unknown | — | Provider ID is Unknown |
| Passenger mapping | To Be Discovered | To Be Discovered | — | |
| Passenger type mapping | To Be Discovered | To Be Discovered | — | |
| Segment mapping | To Be Discovered | To Be Discovered | — | |
| Fare/tax/currency mapping | To Be Discovered | To Be Discovered | — | OQ-ANC-01, OQ-ANC-05 |
| Ticket/coupon mapping | To Be Discovered | To Be Discovered | — | |
| Passenger ↔ ticket relationship | To Be Discovered | To Be Discovered | — | |
| Segment ↔ coupon relationship | To Be Discovered | To Be Discovered | — | |
| Baggage mapping | To Be Discovered | To Be Discovered | — | Gated on §5c Baggage (Supported + Provided) |
| Ancillary/service mapping | To Be Discovered | To Be Discovered | — | |
| Known nullable/optional fields | To Be Discovered | To Be Discovered | — | |
| Fields required by the UI/business layer | To Be Discovered | To Be Discovered | — | |
| Differences from the old integration-layer mapping (if applicable) | N/A | N/A | `integrationLayer: null` | The Feature declares no integration layer |

## 7. Business / E2E Flow

### 7a. Table Structure — GENERIC

Behavior rows follow in §7b. Columns: Behavior · Inherited Requirement ID · Source Status (carried
unchanged from the Profile) · Supplier Applicability · Test Data Available? · Execution Layer ·
Status · Evidence/Notes. The four per-Supplier columns are filled during Discovery, which has not run,
so they read `To Be Discovered` — except rows gated on a capability recorded Unsupported.

### 7b. Behavior Rows — INJECTED FROM FEATURE PROFILE

| Behavior | Inherited Requirement ID | Source Status | Supplier Applicability | Test Data Available? | Execution Layer | Status | Evidence/Notes |
|---|---|---|---|---|---|---|---|
| Admin: Branch selected and Supplier assigned before execution | ANC-14, ANC-15 | Confirmed | To Be Discovered | To Be Discovered | To Be Discovered | To Be Discovered | Branch NDC1_Hussein; AegeanNdc assignment Provided at intake, not yet evidenced |
| Admin: correct Supplier Credential / PCC / Market assigned and available | ANC-16 | Confirmed | To Be Discovered | To Be Discovered | To Be Discovered | To Be Discovered | Credential "AegeanNDCProd" (not production), PCC EGY, market EGY |
| Admin: the credential used is recorded exactly, never chosen arbitrarily | ANC-17 | Confirmed | To Be Discovered | To Be Discovered | To Be Discovered | To Be Discovered | |
| Full execution context recorded (Supplier, Credential, PCC, Market, Branch, Agency, Environment, User) | ANC-18 | Confirmed | To Be Discovered | To Be Discovered | To Be Discovered | To Be Discovered | |
| Admin and Portal access details recorded **independently** | ANC-26 | Confirmed as a rule; whether they share one environment is Open — OQ-ANC-08 | To Be Discovered | Yes | To Be Discovered | To Be Discovered | Recorded apart in §3a: same host, ports 80 and 9500, separate accounts |
| Portal: valid flight search performed | ANC-19 | Confirmed | To Be Discovered | To Be Discovered | To Be Discovered | To Be Discovered | |
| Portal: selected flight is from the Supplier under test, with attribution evidence | ANC-20 | Confirmed | To Be Discovered | To Be Discovered | To Be Discovered | To Be Discovered | |
| Portal: PAX Details entered with valid passenger information | ANC-21 | Confirmed | To Be Discovered | To Be Discovered | To Be Discovered | To Be Discovered | |
| Ancillaries section opens, and intake-recorded capability information is **verified** there rather than re-determined | ANC-22 | Confirmed | To Be Discovered | To Be Discovered | To Be Discovered | To Be Discovered | Verify §5c: Baggage and Seat offered, Meal and Bundle absent |
| A live-behavior difference from a Provided value produces a discrepancy record, never a silent overwrite | ANC-08, ANC-22 | Confirmed | To Be Discovered | To Be Discovered | To Be Discovered | To Be Discovered | |
| Only Supported capabilities are exercised | ANC-23 | Confirmed | To Be Discovered | To Be Discovered | To Be Discovered | To Be Discovered | Baggage and Seat only |
| Available ancillary options recorded **before** selection | ANC-27 | Confirmed | To Be Discovered | To Be Discovered | To Be Discovered | To Be Discovered | |
| Baggage selection behaves at this Supplier's recorded application level `[gated: Baggage]` | ANC-10, ANC-12, ANC-24 | Confirmed as a rule; the level itself is per-Supplier | To Be Discovered | To Be Discovered | To Be Discovered | To Be Discovered | Gated on §5c Baggage (Supported + Provided) |
| Meal selection behaves at this Supplier's recorded application level `[gated: Meal]` | ANC-10, ANC-12, ANC-24 | Confirmed as a rule; the level itself is per-Supplier | Not Applicable | N/A | N/A | N/A | Meal Unsupported + Provided (§5c) |
| Seat selection behaves at this Supplier's recorded application level `[gated: Seat]` | ANC-10, ANC-12, ANC-24 | Confirmed as a rule; the level itself is per-Supplier | To Be Discovered | To Be Discovered | To Be Discovered | To Be Discovered | Gated on §5c Seat (Supported + Provided) |
| Bundle selection behaves at this Supplier's recorded application level `[gated: Bundle]` | ANC-10, ANC-12, ANC-24 | Confirmed as a rule; the level itself is per-Supplier | Not Applicable | N/A | N/A | N/A | Bundle Unsupported + Provided (§5c) |
| Different capabilities may use different application levels within one Supplier | ANC-12 | Confirmed | To Be Discovered | No (multi-segment) | To Be Discovered | Blocked (segment vs journey) | No multi-segment route available. Per Passenger vs Booking-wide can still be observed |
| A capability confirmed Unsupported is a recorded fact, not a product defect | ANC-05 | Confirmed | To Be Discovered | To Be Discovered | To Be Discovered | To Be Discovered | Applies to Meal and Bundle |
| Booking flow completes after ancillary selection | ANC-24 | Confirmed | To Be Discovered | To Be Discovered | To Be Discovered | To Be Discovered | Hold and Pay after Hold Supported (§2c), so held-then-paid bookings are in reach |
| Selected ancillary data preserved through booking | ANC-25 | Confirmed | To Be Discovered | To Be Discovered | To Be Discovered | To Be Discovered | |
| Selected ancillary data reflected in downstream booking details | ANC-25 | **Open** — the "where applicable" set is undefined (OQ-ANC-04). Do not assert an expected result for an unlisted screen | To Be Discovered | To Be Discovered | To Be Discovered | To Be Discovered | |
| Validation across all six checkpoints (Selection UI, Fare Breakdown, Booking Request, Supplier Confirmation, Persisted Booking, Itinerary) | ANC-31 | Confirmed where the checkpoint is observable | To Be Discovered | To Be Discovered | To Be Discovered | To Be Discovered | |
| Each selected ancillary classified per checkpoint using the five-value model | ANC-32 | Confirmed | To Be Discovered | To Be Discovered | To Be Discovered | To Be Discovered | |
| Per-checkpoint checks: passenger, segment/journey, type, quantity, price, currency, total, persisted status | ANC-33 | Confirmed | To Be Discovered | To Be Discovered | To Be Discovered | To Be Discovered | |
| Ancillary pricing captured separately from base flight price, at all three points | ANC-34, ANC-35 | Confirmed | To Be Discovered | To Be Discovered | To Be Discovered | To Be Discovered | |
| Final booking amount validated against the confirmed pricing contract | ANC-36 | **Open** — the pricing contract is undefined (OQ-ANC-01). Do not assert an expected total, and do not defect an arithmetic mismatch on the simple formula alone | To Be Discovered | To Be Discovered | To Be Discovered | To Be Discovered | |
| Wallet or payment validation on ancillary selection | — | **Open** — OQ-ANC-02. Not known to exist. Its absence is not a defect | To Be Discovered | To Be Discovered | To Be Discovered | To Be Discovered | |
| Change or removal of a selected ancillary, before or after booking | — | **Open** — OQ-ANC-03. No coverage designed until confirmed | To Be Discovered | To Be Discovered | To Be Discovered | To Be Discovered | |
| Currency handling when credential market currency differs from booking currency | ANC-28, ANC-33 | **Open** — OQ-ANC-05 | To Be Discovered | To Be Discovered | To Be Discovered | To Be Discovered | Credential market EGY |
| Bundle interaction with individually selected capabilities `[gated: Bundle]` | — | **Open** — OQ-ANC-07. Whether a Bundle includes, excludes, or coexists with separate selections is undefined | Not Applicable | N/A | N/A | N/A | Bundle Unsupported + Provided (§5c) |
| Every bundle is exercised in every cabin class the Supplier returns — one fresh offer per cabin × bundle, same check set on each `[gated: Bundle]` | ANC-39; human decision 2026-09-27 | Confirmed (human decision). Procedure: `ExecutionFlow_HappyPath.md` §3.1. A combination already executed in the same run is not repeated | Not Applicable | N/A | N/A | N/A | Bundle Unsupported + Provided (§5c) |
| Seat eligibility rules (infants, children, exit rows, seat sets) apply to every Supplier; only Supplier-specific rules differ `[gated: Seat]` | ANC-21; human decision 2026-09-27 | Confirmed (human decision). Supplier-only rules (e.g. ladies-only seats) are recorded per Supplier in `SupplierChecklist.md` §7c, collected at intake | To Be Discovered | To Be Discovered | To Be Discovered | To Be Discovered | Gated on §5c Seat. No AegeanNdc-only rules (§7c) |

The Profile deliberately has no universal happy-path row. Every capability row is gated (ANC-01).
AegeanNdc's composite outcome is built from its own Supported capabilities: Baggage and Seat.

### 7c. Supplier-Specific Rules — GENERIC

Feature-level rules (exit rows, infants, children, seat sets, cabin × bundle coverage) apply to every
Supplier. AegeanNdc has none of its own.

| Rule | Slug | Relation to Feature rules | Applies to | Expected behavior | Source | Status |
|---|---|---|---|---|---|---|
| None | — | — | — | — | Intake — Hussien Ata, 2026-10-14 | Confirmed |

## 8. Error Handling

The Feature declares no integration layer, so the "Integration Layer Behavior" column is N/A
throughout.

### 8a. Generic Cross-Feature Error Categories — GENERIC

| Error Case | Supplier Behavior | Integration Layer Behavior | Application Behavior | UI Behavior (toaster/message/page/retry) | Status | Evidence/Notes |
|---|---|---|---|---|---|---|
| Invalid request | To Be Discovered | N/A | To Be Discovered | To Be Discovered | To Be Discovered | |
| Supplier timeout | To Be Discovered | N/A | To Be Discovered | To Be Discovered | To Be Discovered | |
| Supplier unavailable | To Be Discovered | N/A | To Be Discovered | To Be Discovered | To Be Discovered | |
| Authentication failure | To Be Discovered | N/A | To Be Discovered | To Be Discovered | To Be Discovered | |
| Malformed response | To Be Discovered | N/A | To Be Discovered | To Be Discovered | To Be Discovered | |
| Partial response | To Be Discovered | N/A | To Be Discovered | To Be Discovered | To Be Discovered | |
| Unexpected supplier response | To Be Discovered | N/A | To Be Discovered | To Be Discovered | To Be Discovered | |
| Integration-layer normalized error (N/A where the Feature declares no integration layer) | N/A | N/A | N/A | N/A | N/A | `integrationLayer: null` |

### 8b. Feature-Specific Error Rows — INJECTED FROM FEATURE PROFILE

| Error Case | Supplier Behavior | Integration Layer Behavior | Application Behavior | UI Behavior (toaster/message/page/retry) | Status | Evidence/Notes |
|---|---|---|---|---|---|---|
| Supplier not assigned to the Branch | To Be Discovered | N/A | To Be Discovered | To Be Discovered | To Be Discovered | ANC-15. Execution is **Blocked**, not Failed — a configuration gap is not an Ancillaries defect |
| Required Supplier Credential / PCC / Market missing for the Branch | To Be Discovered | N/A | To Be Discovered | To Be Discovered | To Be Discovered | ANC-16. Blocked, same reasoning |
| Search returns no results from the Supplier under test | To Be Discovered | N/A | To Be Discovered | To Be Discovered | To Be Discovered | ANC-19, ANC-20. Cannot proceed; the run did not test the Supplier in scope |
| A flight from a different Supplier was selected | To Be Discovered | N/A | To Be Discovered | To Be Discovered | To Be Discovered | ANC-20. **Invalidates the execution.** Not a defect and not a partial pass — discard and repeat with correct attribution |
| Ancillaries section does not open, or exposes nothing | To Be Discovered | N/A | To Be Discovered | To Be Discovered | To Be Discovered | ANC-22. Record against the capability matrix. Where every capability is `Unsupported`, this is expected behavior, not an error |
| A capability recorded as Supported is not exposed live | To Be Discovered | N/A | To Be Discovered | To Be Discovered | To Be Discovered | ANC-08, ANC-22. Produces a discrepancy record; whether it is a defect depends on whether the Provided value was authoritative |
| A capability recorded as Unsupported **is** exposed live | To Be Discovered | N/A | To Be Discovered | To Be Discovered | To Be Discovered | ANC-08, ANC-22. Discrepancy record. Not a defect — the recorded value was incomplete. Watch for this on Meal and Bundle |
| Selection rejected by a Supplier restriction (quantity, eligibility, passenger type, route, fare family) | To Be Discovered | N/A | To Be Discovered | To Be Discovered | To Be Discovered | ANC-41. Expected behavior where the restriction is confirmed. Restrictions are recorded from evidence, never invented, so an unconfirmed rejection is an observation first |
| Selected ancillary missing after booking | To Be Discovered | N/A | To Be Discovered | To Be Discovered | To Be Discovered | ANC-25, ANC-32. Classified as `Missing` at the failing checkpoint |
| Price or currency mismatch across checkpoints | To Be Discovered | N/A | To Be Discovered | To Be Discovered | To Be Discovered | ANC-33, ANC-36. Record as an observation against OQ-ANC-01 until the pricing contract is confirmed |
| Supplier error or timeout during ancillary retrieval or booking | To Be Discovered | N/A | To Be Discovered | To Be Discovered | To Be Discovered | Requirement ID: —. Flagged: no requirement defines an expected error contract for this Feature. Record the Supplier behavior as observed during Discovery. Do not assume a normalized error shape |

## 9. Historical / Comparison Evidence — GENERIC

| Field | Value | Status | Evidence/Source | Notes |
|---|---|---|---|---|
| Old integration-layer implementation available for this supplier? | N/A | N/A | `integrationLayer: null` | |
| Same booking retrievable through both old and new paths? | N/A | N/A | — | There is no old/new path pair for this Feature |
| Old UI behavior | Unknown | Unknown | — | |
| Old API payload | Unknown | Unknown | — | |
| Existing supplier payload examples | Unknown | Unknown | — | |
| Existing Postman/Swagger/API documentation | Unknown | Unknown | — | |
| Existing test cases | Unknown | Unknown | — | No Test Design has run for this Supplier |
| Existing Azure test cases (if available) | Unknown | Unknown | — | |
| Existing logs/screenshots/test evidence | Unknown | Unknown | — | |
| Existing production/UAT evidence | Unknown | Unknown | — | |
| Known accepted differences | Unknown | Unknown | — | |
| Known migration differences | N/A | N/A | — | No integration-layer migration applies |
| Historical supplier limitations | Unknown | Unknown | — | |

## 10. Automation Feasibility — GENERIC

Feasibility only. It does not authorize automation.

### 10a. UI Automation

| Field | Value | Status | Evidence/Source | Notes |
|---|---|---|---|---|
| Framework available | Unknown | Unknown | — | |
| Stable locators | To Be Discovered | To Be Discovered | — | |
| Test-user availability | Admin `e.saady`; Portal AGN9748 | Provided | Intake, 2026-10-14 | |
| Environment stability | Unknown | Unknown | — | |
| Test-data repeatability | Unknown | Unknown | — | |
| Destructive-action risk | Unknown | Unknown | — | Credential is not production (SUP-OQ-08). Whether completed or paid bookings debit the agency wallet: To Be Discovered |
| Cleanup/reset capability | Unknown | Unknown | — | Hold is Supported; whether an unpaid hold can be released for cleanup: To Be Discovered |

### 10b. API Automation

| Field | Value | Status | Evidence/Source | Notes |
|---|---|---|---|---|
| Endpoint callable directly | Unknown | Unknown | — | Endpoint supplied at intake (§3b); callability not tested |
| Authentication automatable | Unknown | Unknown | — | |
| Test data reusable | Unknown | Unknown | — | |
| Request generation possible | Unknown | Unknown | — | |
| Response assertions possible | Unknown | Unknown | — | |
| Mocking/stubbing available | Unknown | Unknown | — | |
| Supplier dependency controllable | Unknown | Unknown | — | |

### 10c. E2E Automation

| Field | Value | Status | Evidence/Source | Notes |
|---|---|---|---|---|
| Can supplier calls be executed safely? | Pending Confirmation | Pending Confirmation | — | |
| Can real supplier responses be used? | Unknown | Unknown | — | |
| Can wallet effects be verified? | Unknown | Unknown | — | |
| Can database effects be verified? | Unknown | Unknown | — | |
| Can booking persistence be verified? | To Be Discovered | To Be Discovered | — | |
| Can cleanup/reset be performed? | Unknown | Unknown | — | |
| Can tests run repeatedly? | Unknown | Unknown | — | |
| Parallel/concurrency feasibility | Unknown | Unknown | — | |
| External supplier limitations | Unknown | Unknown | — | |

## 11. Discovery Contacts / Ownership — GENERIC

| Field | Value | Status | Evidence/Source | Notes |
|---|---|---|---|---|
| Developer/contact responsible for supplier integration | Unknown | Unknown | — | |
| Person who can confirm API contract/mapping | Unknown | Unknown | — | |
| Person who can confirm business behavior | Unknown | Unknown | — | |
| Person who can confirm UI behavior | Unknown | Unknown | — | |
| Person who can provide supplier test data | Unknown | Unknown | — | |
| Person who can provide environment/access | Hussien Ata | Provided | Intake, 2026-10-14 | Supplied environment and accounts |
| Other relevant owner/contact | Hussien Ata: Supplier scope approver and intake source | Provided | `supplier.json` | |

## 12. Open Questions — GENERIC + INJECTED

**Supplier-level (AegeanNdc):**

| # | Open Question | Category | Status | Owner | Evidence/Source | Notes |
|---|---|---|---|---|---|---|
| SUP-OQ-01 | What is the Provider ID for AegeanNdc? | Missing access | Unknown | Unknown | Intake | §1, §3b |
| SUP-OQ-02 | The credential was supplied as the URL `https://ndc-integration-stg-ne-3.azurewebsites.net`. What is the credential's name as selected in Admin, and which PCC and market does it use? | Environment issue | Answered | Hussien Ata | Intake, 2026-10-14 | "AegeanNDCProd", PCC EGY, market EGY. §3b |
| SUP-OQ-03 | Admin and Portal URLs, target environment, test Branch / Agency, and whether AegeanNdc is assigned to that Branch | Missing access | Answered | Hussien Ata | Intake, 2026-10-14 | URLs, Branch NDC1_Hussein, Agency Hussein_AGN (AGN9748), accounts; AegeanNdc assigned to NDC1_Hussein. Live evidence still collected at the Admin precheck (ANC-15) |
| SUP-OQ-04 | Airline scope, a route and future date returning AegeanNdc results, and a multi-segment journey | Missing test data | Answered (partly) | Hussien Ata | Intake, 2026-10-14 | Answered: route CAI→FCO, date 2026-10-15 (changed to 2026-10-16 in rev 6); no multi-segment route exists (recorded as a supplier limitation, §2). Airline scope still open |
| SUP-OQ-05 | Admin role name and required permissions | Missing access | To Be Discovered | Unknown | Profile §A, ANC-14 | §3a |
| SUP-OQ-06 | Supplier scope description / supported booking use cases | Business decision required | Pending Confirmation | Hussien Ata | Intake — not supplied 2026-10-14 | §2 |
| SUP-OQ-07 | Meal and Bundle recorded Unsupported + Provided. Confirm the absence during Discovery | Unconfirmed supplier behavior | To Be Discovered | Unknown | §5c. CapabilityModel §8 | Not a defect either way (ANC-05) |
| SUP-OQ-08 | The credential is named "AegeanNDCProd" but its endpoint is `ndc-integration-stg-…`. Is it a production credential? If so, completed or paid bookings may be real and debit real funds | Environment issue | Answered | Hussien Ata | Human decision, Hussien Ata, 2026-10-14 | **Not** a production credential. Booking-completing cases are no longer blocked by this question |

**Feature-level (injected from the Profile's "Open Questions carried from the shared context"):**

| # | Open Question | Category | Status | Owner | Evidence/Source | Notes |
|---|---|---|---|---|---|---|
| OQ-ANC-01 | What is the confirmed ancillary pricing contract? Which of taxes, fees, markup, commission, discount, bundle pricing sit between ancillary amounts and the final total? | Business decision required | Open | Unknown | ProjectContext §8, OQ-ANC-01 | Affects: §B pricing rows, §C price-mismatch row |
| OQ-ANC-02 | Does ancillary selection trigger wallet or payment validation? | Unconfirmed supplier behavior | Open | Unknown | ProjectContext §8, OQ-ANC-02 | Affects: §B wallet row |
| OQ-ANC-03 | Can a selected ancillary be changed or removed, before or after booking? | Business decision required | Open | Unknown | ProjectContext §8, OQ-ANC-03 | Affects: §B change/removal row |
| OQ-ANC-04 | Which downstream representations must reflect ancillaries? | Business decision required | Open | Unknown | ProjectContext §8, OQ-ANC-04 | Affects: §B downstream row, ANC-25 completion criteria |
| OQ-ANC-05 | Currency handling when credential market currency differs from booking currency | Mapping decision | Open | Unknown | ProjectContext §8, OQ-ANC-05 | Affects: §B currency row |
| OQ-ANC-06 | Are passenger-type eligibility rules global, or purely per-Supplier? **Answered 2026-09-27 (Mohanad Dawood): global — they apply to every Supplier — except Supplier-specific rules such as ladies-only seats, which are collected per Supplier at intake (`SupplierChecklist.md` §7c).** To be folded into the shared baseline context at its next Stage 1 review | Business decision required | Answered | Mohanad Dawood | ProjectContext §8, OQ-ANC-06. Profile rev 2 | Affects: §A passenger data row, §C restriction row |
| OQ-ANC-07 | Do Bundle and individual capabilities conflict? | Business decision required | Open | Unknown | ProjectContext §8, OQ-ANC-07 | Affects: §B Bundle interaction row. Not applicable to AegeanNdc while Bundle is Unsupported |
| OQ-ANC-08 | Are Admin and Portal the same environment and tenant? Same login? | Environment issue | Open | Unknown | ProjectContext §8, OQ-ANC-08 | Affects: §A user rows, §B independent-recording row, §D URL row. See SUP-OQ-03 |
| OQ-ANC-09 | Seat / Seatmap boundary — deferred by decision | Business decision required | Open — deferred by decision | Unknown | ProjectContext §8, OQ-ANC-09. CapabilityModel §10 | Affects: §A and §B Seat rows |
| OQ-ANC-10 | Bundle / Upselling boundary — deferred by decision | Business decision required | Open — deferred by decision | Unknown | ProjectContext §8, OQ-ANC-10. CapabilityModel §10 | Affects: §A and §B Bundle rows |
| OQ-ANC-11 | Which integration/backend path does Ancillaries use? `integrationLayer` stays `null` | Unknown contract behavior | Open | Unknown | ProjectContext §8, OQ-ANC-11 | Keeps `ndc_execution_rules.md` §B inactive for this Feature |

Feature-level UI notes that sit alongside these questions are in the Feature Checklist Profile §D.
They are referenced here, not copied.

## 13. Intake Decision — GENERIC

> **The Intake Decision does not gate Supplier scope or run creation.** "Blocked from Discovery"
> means the Supplier scope/run may still exist — it means meaningful Discovery cannot proceed until
> the recorded blocker(s) below are resolved. Blockers are tracked here and in §12, not used to
> refuse creating the scope.

| Field | Value |
|---|---|
| Decision | Ready with known blockers |
| Reason | Capabilities, supplier rules, a non-production credential with PCC and market, Admin and Portal environments, Branch/Agency with AegeanNdc assigned, accounts, route CAI→FCO and travel date 2026-10-15 were supplied at intake (rev 3) |
| Blocking items (if any) | No multi-segment route exists (supplier limitation) — segment- vs journey-level coverage is Blocked; everything else can proceed. Passwords must be placed in the local `credentials.json` before execution |
| Recorded by | Rendering agent (Claude), for Hussien Ata. Human review Pending Confirmation |
| Date | 2026-10-14 |
