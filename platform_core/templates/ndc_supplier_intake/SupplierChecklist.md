# Supplier Checklist — {{SUPPLIER_NAME}}

<!-- Renders to: platform_core_data/services/ndc-core-service/{{FEATURE_SLUG}}/suppliers/{{SUPPLIER_SLUG}}/context/SupplierChecklist.md -->
<!-- This is an INTAKE document, not a completeness gate. Unknown fields are recorded as Unknown /
     To Be Discovered / Blocked / Pending Developer Confirmation — they do not block Supplier scope
     creation or run start. Discovery is where most Unknown/To Be Discovered items get resolved.

     This document is NOT a frozen one-time snapshot. It is created at intake and refined in place
     across Discovery as information becomes verified. Every update is recorded in the Revision
     History table below — what changed, why, and on what evidence — so no earlier assumption is
     silently overwritten.

     THIS TEMPLATE IS GENERIC AND FEATURE-AGNOSTIC. It must remain reusable, unmodified, across every
     NDC Core Service Feature (Refund, Reissue, Seatmap, Import Booked PNR, and future Features).
     Feature-specific rows are never hardcoded here — they are injected at render time from that
     Feature's FeatureChecklistProfile.md (platform_core/templates/ndc_supplier_intake/FeatureChecklistProfile.md
     is the generic Profile template; each Feature has its own populated instance at
     services/ndc-core-service/{{FEATURE_SLUG}}/context/FeatureChecklistProfile.md). Sections/rows
     marked "GENERIC — cross-Feature" belong in this file. Sections/rows marked "INJECTED FROM FEATURE
     PROFILE" are populated by the renderer, never authored directly into this template. -->

**Service:** NDC_Core_Service
**Feature:** {{FEATURE_NAME}} ({{FEATURE_SLUG}})
**Supplier:** {{SUPPLIER_NAME}} ({{SUPPLIER_SLUG}})
**Status:** {{STATUS}} <!-- Draft / Proposed / Approved -->
**Revision:** {{REVISION_COUNT}}
**Last Updated:** {{LAST_UPDATED}}
**Produced by run:** {{RUN_FOLDER}}
**Rendered from Feature Profile:** {{FEATURE_CHECKLIST_PROFILE_PATH}} (revision {{FEATURE_CHECKLIST_PROFILE_REVISION}})

### Revision History

| Rev | Date | Changed By | What Changed | Why / Evidence |
|---|---|---|---|---|
| 1 | | | Initial intake | |

---

> A Supplier scope is the **complete QA ownership boundary** for this Feature + Supplier
> implementation:
>
> ```
> NDC UI
>     ↓
> NDC Application
>     ↓
> NDC Core Service
>     ↓
> Supplier
> ```
>
> It is not an API-only or contract-only scope by default. Unless a specific run is explicitly
> narrowed by the human, a Supplier run is **Full Feature QA** — UI, API, Contract, Integration,
> E2E, Regression, DB, Security, and Performance, wherever each is technically and functionally
> applicable (see §2b Testing Layer Scope).
>
> This checklist captures only **supplier-specific** information: applicability, supplier-specific
> behavior, mappings, test data/evidence, deviations, blockers, execution capability, and
> testing-layer applicability. Shared Feature business requirements are owned by, and not duplicated
> from, this Feature's approved shared context(s) — see this Feature's `FeatureChecklistProfile.md`
> for the exact source path(s) and revision(s) used to populate the injected rows below.
> Supplier-specific Test Cases must trace back to the relevant shared requirement IDs.
>
> This template is reusable across every NDC Core Service Feature and every Supplier. It never
> assumes one Feature's UI, mappings, or business flow apply to another. The same Supplier name under
> two different Features is two completely independent Supplier scopes (e.g. `NDCGal / Refund` ≠
> `NDCGal / Import Booked PNR`).

<!-- Every field below carries a Status value:
     Confirmed | Provided | Unknown | To Be Discovered | Blocked | Pending Developer Confirmation | N/A
     plus Evidence/Source and Notes. A field with no evidence yet is still recorded — never omitted,
     and never invented. -->

## 1. Supplier Identity — GENERIC

| Field | Value | Status | Evidence/Source | Notes |
|---|---|---|---|---|
| Supplier name | | | | |
| Provider ID / code | | | | |
| Integration type (if known) | | | | |
| Airline/GDS scope (if applicable) | | | | |

## 2. Supplier Scope — GENERIC

| Field | Value | Status | Evidence/Source | Notes |
|---|---|---|---|---|
| Feature capability being implemented | | | | |
| Supported booking/use cases | | | | |
| Known exclusions | | | | |
| Known supplier limitations | | | | |
| UI scope included? | Yes / No / Unknown | | | |
| API scope included? | Yes / No / Unknown | | | |
| Contract scope included? | Yes / No / Unknown | | | |
| Integration scope included? | Yes / No / Unknown | | | |
| E2E scope included? | Yes / No / Unknown | | | |
| Regression against previous integration required? | Yes / No / Unknown | | | |
| DB validation applicable? | Yes / No / Unknown | | | |
| Security testing applicable? | Yes / No / Unknown | | | |
| Performance testing applicable? | Yes / No / Unknown | | | |

## 2b. Testing Layer Scope — GENERIC

<!-- Default: every layer is In Scope unless the human explicitly restricts a specific run — a
     restriction is a deliberate, stated decision, never an assumption. "In Scope" means the layer
     belongs to this Supplier's QA scope and must be considered during Discovery and Test Design; it
     does NOT mean every possible test in that layer executes immediately. If a layer can't currently
     be executed (missing access/environment/test data/tooling), prefer "Deferred + reason" over
     silently downgrading it to "Out of Scope" — Out of Scope is a scope decision, Deferred is a
     capability gap. A reason is mandatory for anything not fully In Scope. A single test case may
     later carry more than one layer tag (e.g. "UI + E2E + Regression", "API + Contract + Integration"). -->

| Layer | In Scope / Out of Scope / Deferred | Reason (mandatory if not In Scope) | Notes |
|---|---|---|---|
| UI | In Scope | | |
| API | In Scope | | |
| Contract | In Scope | | |
| Integration | In Scope | | |
| E2E | In Scope | | |
| Regression | In Scope | | |
| DB | In Scope | | |
| Security | In Scope | | |
| Performance | In Scope | | |

## 3. Environment & Access — GENERIC

### 3a. UI

| Field | Value | Status | Evidence/Source | Notes |
|---|---|---|---|---|
| Application URL/environment | | | | |
| Required role/user | | | | |
| Navigation/menu availability | | | | |
| Supplier configuration visibility | | | | |
| Branch/Agency/PCC setup | | | | |
| Required permissions | | | | |
| Test account availability | | | | |

### 3b. API / Integration

| Field | Value | Status | Evidence/Source | Notes |
|---|---|---|---|---|
| NDC Core Service base URL | | | | |
| Endpoint(s) | | | | |
| Authentication mechanism | | | | |
| Supplier credential | | | | |
| Provider ID | | | | |
| Environment availability | | | | |
| Logs/observability access | | | | |
| Swagger/OpenAPI/Postman availability | | | | |
| Direct API access availability | | | | |

### 3c. Source / Target Environment Model (if applicable)

<!-- A generic CAPABILITY, not a rule that every NDC Feature must use two environments. Some Feature
     flows need a separate preparation environment to produce input test data before the Feature under
     test can be exercised (e.g. Import Booked PNR — see its FeatureChecklistProfile.md /
     ExecutionFlow_*.md for whether and why); others don't. Mark "Dual-environment execution required?"
     N/A and leave the rest blank when this Feature has no such requirement — do not invent a Source
     environment where the Feature's own execution knowledge doesn't call for one. -->

| Field | Value | Status | Evidence/Source | Notes |
|---|---|---|---|---|
| Dual-environment execution required? | Yes / No / N/A | | | |
| Source Environment (preparation/offline environment, if required) | | | | |
| Target Environment (the environment under test) | | | | |
| Feature-level Execution Flow reference (path, if one exists for this Feature) | | | | |

## 4. UI / User Flow — GENERIC

<!-- Capture the CURRENT flow for THIS Feature only — never assume one Feature's UI applies to
     another. Field labels are generic; values are always supplier/Feature-specific and filled in
     per Supplier, never pre-filled here. -->

| Field | Value | Status | Evidence/Source | Notes |
|---|---|---|---|---|
| Screen/page name | | | | |
| Entry/navigation path | | | | |
| Required fields | | | | |
| Supplier selection | | | | |
| Supplier credential selection | | | | |
| Branch/Agency/Agent fields (where applicable) | | | | |
| Search/action buttons | | | | |
| Expected successful flow | | | | |
| Expected failure behavior/messages | | | | |
| Loading/progress behavior | | | | |
| Data displayed after retrieval | | | | |
| UI validations | | | | |
| Role/permission differences | | | | |
| Known UI limitations | | | | |
| UI evidence/screenshots/designs available | | | | |

## 5. Test Data

<!-- Mark items N/A when not relevant to the selected Feature. Missing test data is never automatic
     grounds to block scope/run creation — record it as a Discovery blocker or open item instead. -->

### 5a. Generic Test Data — GENERIC

| Field | Value | Status | Evidence/Source | Notes |
|---|---|---|---|---|
| UI account/user | | | | |
| Valid organization/branch | | | | |
| Valid happy-path test data | | | | |
| Invalid/negative test data | | | | |
| Multi-passenger data (if applicable) | | | | |
| Multi-segment data (if applicable) | | | | |
| Supplier-specific test data | | | | |

### 5b. Feature-Specific Test Data — INJECTED FROM FEATURE PROFILE

<!-- Rows injected from this Feature's FeatureChecklistProfile.md §A. Do not author Feature-specific
     rows directly in this file — edit the Feature's Profile instead, then re-render. -->

| Test Data Item | Why (Requirement ID) | Notes |
|---|---|---|
| *(injected at render time)* | | |

## 6. Contract / Mapping — GENERIC

<!-- Do NOT invent mandatory fields, nullability, exact status/error codes, array representation,
     min/max lengths, provider casing rules, supplier limitations, or field formats without evidence. -->

| Field | Value | Status | Evidence/Source | Notes |
|---|---|---|---|---|
| Request shape | | | | |
| Response shape | | | | |
| Provider-specific fields | | | | |
| Original ticketing date/time mapping (if applicable to this Feature) | | | | |
| Booking status mapping | | | | |
| Supplier status → NDC status mapping | | | | |
| Supplier identifier / provider routing | | | | |
| Passenger mapping | | | | |
| Passenger type mapping | | | | |
| Segment mapping | | | | |
| Fare/tax/currency mapping | | | | |
| Ticket/coupon mapping | | | | |
| Passenger ↔ ticket relationship | | | | |
| Segment ↔ coupon relationship | | | | |
| Baggage mapping | | | | |
| Ancillary/service mapping | | | | |
| Known nullable/optional fields | | | | |
| Fields required by the UI/business layer | | | | |
| Differences from the old integration-layer mapping (if applicable) | | | | |

## 7. Business / E2E Flow

<!-- Do NOT duplicate shared Feature requirements as new supplier requirements. Reference the
     approved shared Feature Context and record only this supplier's applicability/execution status
     against each shared behavior. The base template defines the table structure only — the Behavior
     rows are injected from this Feature's FeatureChecklistProfile.md §B. -->

### 7a. Table Structure — GENERIC

| Behavior | Inherited Requirement ID | Supplier Applicability | Test Data Available? | Execution Layer | Status | Evidence/Notes |
|---|---|---|---|---|---|---|
| *(rows injected at render time from FeatureChecklistProfile.md §B — see 7b)* | | | | | | |

### 7b. Behavior Rows — INJECTED FROM FEATURE PROFILE

<!-- Populated 1:1 from FeatureChecklistProfile.md §B "Behavior" and "Inherited Requirement ID"
     columns. This Supplier's "Supplier Applicability", "Test Data Available?", "Execution Layer" and
     "Status" columns are filled in per Supplier during Discovery — the Profile never fills them,
     since applicability is a per-Supplier judgment. -->

*(injected at render time)*

<!-- Execution Layer values: UI / API / Contract / Integration / E2E / Regression / DB.
     A behavior marked Open/Provisional/Pending Confirmation in the Profile keeps that status here —
     rendering never promotes it to Confirmed. -->

## 8. Error Handling

<!-- Distinguish where possible: Supplier behavior → NDC Core Service behavior → NDC Application
     behavior → UI behavior. Do not assume a supplier error is exposed to the UI unchanged. -->

### 8a. Generic Cross-Feature Error Categories — GENERIC

| Error Case | Supplier Behavior | NDC Core Service Behavior | NDC Application Behavior | UI Behavior (toaster/message/page/retry) | Status | Evidence/Notes |
|---|---|---|---|---|---|---|
| Invalid request | | | | | | |
| Supplier timeout | | | | | | |
| Supplier unavailable | | | | | | |
| Authentication failure | | | | | | |
| Malformed response | | | | | | |
| Partial response | | | | | | |
| Unexpected supplier response | | | | | | |
| NDC Core Service normalized error | | | | | | |

### 8b. Feature-Specific Error Rows — INJECTED FROM FEATURE PROFILE

<!-- Rows injected from this Feature's FeatureChecklistProfile.md §C. -->

| Error Case | Supplier Behavior | NDC Core Service Behavior | NDC Application Behavior | UI Behavior (toaster/message/page/retry) | Status | Evidence/Notes |
|---|---|---|---|---|---|---|
| *(injected at render time)* | | | | | | |

## 9. Historical / Comparison Evidence — GENERIC

| Field | Value | Status | Evidence/Source | Notes |
|---|---|---|---|---|
| Old integration-layer implementation available for this supplier? | | | | |
| Same booking retrievable through both old and new paths? | | | | |
| Old UI behavior | | | | |
| Old API payload | | | | |
| Existing supplier payload examples | | | | |
| Existing Postman/Swagger/API documentation | | | | |
| Existing test cases | | | | |
| Existing Azure test cases (if available) | | | | |
| Existing logs/screenshots/test evidence | | | | |
| Existing production/UAT evidence | | | | |
| Known accepted differences | | | | |
| Known migration differences | | | | |
| Historical supplier limitations | | | | |

<!-- Do not automatically treat every old behavior as correct if a current requirement explicitly
     changed it — record the old behavior as evidence, not as the target. -->

## 10. Automation Feasibility — GENERIC

<!-- Feasibility only — a positive assessment here is not authorization to start automation.
     Automation still follows the platform's normal approval/workflow rules. -->

### 10a. UI Automation

| Field | Value | Status | Evidence/Source | Notes |
|---|---|---|---|---|
| Framework available | | | | |
| Stable locators | | | | |
| Test-user availability | | | | |
| Environment stability | | | | |
| Test-data repeatability | | | | |
| Destructive-action risk | | | | |
| Cleanup/reset capability | | | | |

### 10b. API Automation

| Field | Value | Status | Evidence/Source | Notes |
|---|---|---|---|---|
| Endpoint callable directly | | | | |
| Authentication automatable | | | | |
| Test data reusable | | | | |
| Request generation possible | | | | |
| Response assertions possible | | | | |
| Mocking/stubbing available | | | | |
| Supplier dependency controllable | | | | |

### 10c. E2E Automation

| Field | Value | Status | Evidence/Source | Notes |
|---|---|---|---|---|
| Can supplier calls be executed safely? | | | | |
| Can real supplier responses be used? | | | | |
| Can wallet effects be verified? | | | | |
| Can database effects be verified? | | | | |
| Can booking persistence be verified? | | | | |
| Can cleanup/reset be performed? | | | | |
| Can tests run repeatedly? | | | | |
| Parallel/concurrency feasibility | | | | |
| External supplier limitations | | | | |

## 11. Discovery Contacts / Ownership — GENERIC

| Field | Value | Status | Evidence/Source | Notes |
|---|---|---|---|---|
| Developer/contact responsible for supplier integration | | | | |
| Person who can confirm API contract/mapping | | | | |
| Person who can confirm business behavior | | | | |
| Person who can confirm UI behavior | | | | |
| Person who can provide supplier test data | | | | |
| Person who can provide environment/access | | | | |
| Other relevant owner/contact | | | | |

## 12. Open Questions — GENERIC + INJECTED

<!-- Every meaningful Unknown / To Be Discovered / Blocked / Pending Developer Confirmation item
     above should trace to a row here. Nothing unresolved is dropped silently. This section also
     carries forward the "Open Questions carried from the shared context" list from this Feature's
     FeatureChecklistProfile.md, so a Supplier's own open items sit alongside the Feature-level ones
     that affect it. -->

| # | Open Question | Category | Status | Owner | Evidence/Source | Notes |
|---|---|---|---|---|---|---|
| | | Unknown contract behavior / Missing access / Missing test data / Unconfirmed supplier behavior / UI behavior / Mapping decision / Business decision required / Environment issue / Automation limitation / Historical behavior requiring confirmation | | | | |
| *(Feature-level Open Questions injected here from FeatureChecklistProfile.md)* | | | | | | |

## 13. Intake Decision — GENERIC

> **The Intake Decision does not gate Supplier scope or run creation.** "Blocked from Discovery"
> means the Supplier scope/run may still exist — it means meaningful Discovery cannot proceed until
> the recorded blocker(s) below are resolved. Blockers are tracked here and in §12, not used to
> refuse creating the scope.

| Field | Value |
|---|---|
| Decision | Ready for Discovery / Ready with known blockers / Blocked from Discovery |
| Reason | |
| Blocking items (if any) | |
| Recorded by | |
| Date | |
