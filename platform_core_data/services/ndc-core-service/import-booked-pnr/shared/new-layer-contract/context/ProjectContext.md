# Project Context — Import Booked PNR

| Field | Value |
|---|---|
| Module | `import-booked-pnr` |
| Feature | `new-layer-contract` |
| Source User Story | "As a technical team, I want to investigate the required flow and define an initial contract for the Import Booked PNR functionality through the new layer, so that we can establish the required interface and avoid depending on the existing Integration Layer." (supplied directly by the user at intake) |
| PRD Source | `platform_core_data/knowledge_base/PRD.md` |
| PRD sections this module derives from | §7.9 (Import PNR — related but distinct capability, see §3.1) and §3 (Module Map). **Corrected 2026-09-01, revision 2:** this Feature is **not** entirely new scope — see §0 below. The new-layer *integration contract* is new; the underlying *Import Booked PNR business capability* is existing, historically documented scope the PRD's 2026-07-25 automation-derived reconstruction does not cover (the automation suite predates this capability). |
| Historical Documentation Source | Supplied directly by the user, 2026-09-01, as authoritative historical feature context for the existing Import Booked PNR capability (business flow, validations, Rule Engine behavior, database/import-state concepts). Not part of `PRD.md`. Cited throughout as "Historical Documentation". |
| Meeting Source | `Import Booked PNR Meeting 1 (23-11).pdf` — "Phase 1: Import Booked PNR Validations", supplied 2026-09-01. Business-authored validation list, Rule Engine batch semantics, the affected reports list, and the open action items with named owners. Cited throughout as "Meeting 1". **Where Meeting 1 and the Historical Documentation differ, the difference is recorded as a discrepancy (§9), never silently resolved.** |
| Run Scope Type | Feature |
| Run Type | User Story |
| Target Environment | `http://192.168.1.70` (NDC Admin — per `platform_core_data/knowledge_base/browser/profile.json`; this Feature's own testing is API-level, see §1) |
| Produced by run | `run-005__2026-09-01_11-41-40__UserStory__ImportBookedPNR-NewLayerContract` |
| Revision | 3 (Meeting 1 incorporated — see §0.1) |
| Target ref at write | `46481cc18cc4a50218ae0a6b764bdc2a93dbbae6` |
| Generated | 2026-09-01 |
| Status | Draft |

## 0. Revision note (2026-09-01) — correcting the "entirely new scope" framing

**Revision 1 of this document was wrong to describe Import Booked PNR as "new scope" without
qualification.** The business capability already exists and has historical requirements. What is
actually new is the **integration path** used to retrieve supplier/GDS data:

```
Historical path:  NDC Core / Import Booked PNR → NDC Integration (NDC-INT) → Supplier / GDS
New path:         NDC Core / Import Booked PNR → NDC_Core_service           → Supplier / GDS
```

This document now separates three things that revision 1 collapsed into one:

1. **Existing Import Booked PNR business requirements** — historical, carried forward from
   Historical Documentation (§2.1), unchanged unless the current User Story or verified
   implementation explicitly says otherwise.
2. **The new `NDC_Core_service` API/integration contract** — genuinely new scope, investigated by
   the current User Story (§2.2).
3. **Regression/compatibility requirements caused by replacing NDC-INT** — the existing behavior in
   (1) must still hold once (2) is in place (§2.3).

**Evidence taxonomy used throughout this document, per explicit instruction:**

| Tag | Meaning |
|---|---|
| **CONFIRMED** | Stated directly by the current User Story, or verified live | 
| **HISTORICAL REQUIREMENT** | Stated in the supplied Historical Documentation — treated as authoritative existing business behavior, never as an assumption |
| **ASSUMPTION** | Inferred by this Feature from a developer-supplied example or from Historical Documentation applied by analogy — not yet confirmed |
| **OPEN QUESTION** | Genuinely unknown, requires the developer/business to answer |
| **DISCOVERY FINDING** | Would be populated once Stage 2 (Explorer) runs against a live endpoint — none exist yet |

## 0.1 Revision note (2026-09-01, revision 3) — Meeting 1 incorporated

The user supplied `Import Booked PNR Meeting 1 (23-11).pdf` ("Phase 1: Import Booked PNR Validations"),
a business-authored slide deck. It is a stronger source than the prose Historical Documentation
supplied in revision 2 — it is dated, has named owners for open items, and states mechanisms (e.g.
Rule Engine "batches") the earlier prose did not. Treated as **HISTORICAL REQUIREMENT** throughout,
tagged `[Meeting 1]` to distinguish it from the revision-2 prose `[Hist-Doc]` wherever the two sources
might otherwise be conflated.

**One discrepancy found, recorded rather than silently resolved (§9):** the exact mechanism behind
"Rule Engine uses the ticketing-time rules" is more specific than revision 2 stated — see HR-IBPNR-04
below.

**New facts Meeting 1 adds that revision 2 did not have:**
- Import Booked PNR is an NDC Admin-only feature (no Portal equivalent).
- Enablement is two-part: an Agency-level "Import PNR Option" toggle, **and**, when the importing user
  is Staff rather than the Agency owner, the Admin's own "Import PNR Option" toggle.
- The PNR must be ticketed **offline** specifically.
- A PNR carries two independent statuses that must both be considered: a **Supplier status** (e.g.
  "Booked") and a **System status** (e.g. "Don't Exist").
- Rule Engine operates on **batches**; the batch active at booking (ticketing) time governs pricing,
  and old batches are **periodically deleted** — a retention limit revision 2 did not mention.
- Two distinct validation categories: **General NDC Integration validations** (on the PNR's data) and
  **General NDC Core validations** (on the Import Booked PNR action itself).
- A broader concurrency case: multiple **different** PNRs, tied to different rule batches, imported
  simultaneously across a single day — not only two users racing to import the *same* PNR.
- A named list of reports the imported booking should affect, **with one item's visibility scoped to
  Super Admin only** (Agency History Wallet report).
- Named, owned action items — several of which are exactly the Open Questions this document already
  carried, now tracked to a person rather than only to "the developer" (§8).

## 1. Scope Summary

This Feature (Run Scope Type: **Feature**, Run Type: **User Story**) investigates the current Import
Booked PNR flow and defines the **initial contract** between NDC Core and a **new integration
service, `NDC_Core_service`**, so booking retrieval stops depending on the existing **NDC Integration
(NDC-INT)** layer.

**Import Booked PNR is an existing business capability with historical requirements and
validations.** [HISTORICAL REQUIREMENT] It imports a PNR that was **booked and ticketed offline**
(outside the platform) into NDC as a manual/imported booking, applies the Rule Engine, and deducts the
organization's wallet. **The current User Story introduces/investigates a new `NDC_Core_service`
integration contract intended to replace the previous NDC Integration (NDC-INT) dependency for
booking retrieval.** Historical Import Booked PNR behavior is baseline regression context and must
remain compatible after the integration-layer swap, unless the current requirements explicitly change
it.

This is distinct from the separate, already-automated **"Import PNR"** flow (PRD §7.9), which imports
an **un-ticketed** PNR for online payment/ticketing — see §3.1.

**Current phase scope, stated explicitly by the stakeholder: API-level only.** [CONFIRMED] This run
investigates and tests the `NDC_Core_service` contract at the API/request-response level. It does
**not** cover the "Import Booked PNR" Admin screen (Admin > Import Booked PNR — PNR Code, Supplier,
Supplier credential, Branch Name, Agency Name, Agent Name, Search) or any other UI.
**Full end-to-end business-flow execution (wallet deduction, Rule Engine snapshot proof, booking
persistence, downstream reporting) is real, in-scope regression/integration coverage (§2.3) — it is
simply not *executable* in this API-only phase**, because it requires the live application, not only
the new endpoint. It is designed now and classified `Blocked` pending that later integration/execution
phase, never dropped or silently deferred. UI-level testing of the screen itself is a separate, later
Feature.

Two reference contract payloads were supplied by the developer as **examples to investigate against,
not a signed-off specification** [ASSUMPTION where extrapolated, per §5.2]:
- `GET /api/v1/bookings/{recordLocator}?providerId={providerId}` — example 1: `providerId=TRAVELPORT_GDS`, Saudia (SV) flight CAI→JED, record locator `HMZ897`.
- Same endpoint — example 2: `providerId=SABRE_NDC`, Qatar Airways (QR) flight CAI→DOH, record locator `SIMQRC`.

## 2. In Scope for This Module

### 2.1 Existing Import Booked PNR business behavior [HISTORICAL REQUIREMENT] — baseline regression context

| Area / Screen / Flow | Why in scope | Source |
|---|---|---|
| Business flow: offline booked/ticketed PNR → retrieve from integration layer → validate PNR + organization → apply Rule Engine → show/use details → store as manual/imported booking → deduct wallet → reflect downstream | Historical Documentation states this is the existing end-to-end flow; it is the behavior `NDC_Core_service` must preserve | Historical Documentation §1 |
| The PNR must be ticketed; Held or Cancelled PNRs are not valid Import Booked PNR cases (historically belong to the separate Import PNR flow) | Historical Documentation, explicit eligibility rule | Historical Documentation §2 |
| Supported import cases: PNR does not exist in NDC; PNR exists with Failed status (4) | Historical Documentation, explicit supported cases | Historical Documentation §2 |
| Duplicate import prevention, including a different user importing the same booked PNR | Historical Documentation, explicit rule | Historical Documentation §2 |
| Organization wallet validation, including sufficient-credit check | Historical Documentation, explicit rule | Historical Documentation §2 |
| Import Booked PNR must be enabled for the organization; required PCC configuration must exist | Historical Documentation, explicit rule | Historical Documentation §2 |
| "The Validations shall be the same as the OLD booked PNR feature" | Historical Documentation, quoted directly — validations are not to be silently discarded because the integration layer changes | Historical Documentation §2 |
| Rule Engine calculates using the **original offline ticketing date/time**, not the import time — a rule disabled after ticketing but before import must still apply if it was active at ticketing time | Historical Documentation, explicit rule with worked example | Historical Documentation §3 |
| Import persistence concepts: `IMPORT_CASE` values `MANUAL` / `AUTOMATED_NOT_EXIST` / `AUTOMATED_FAILED`; tracking table `TT_TS_FB_BOOKED_IMPORTS` (`FLIGHT_BOOK_ID`, `FB_BOOKING_REF_NO`, `CREATION_TIME`, `IMPORT_CASE`); `CREATION_TIME` is import time, not ticketing time | Historical Documentation, implementation context — the *business behavior* it represents is in scope; the exact schema is not required of the new layer unless current scope demands it | Historical Documentation §4 |
| **[Meeting 1]** Import Booked PNR is an **NDC Admin-only** feature | Business-authored slide, stated as a standalone fact | Meeting 1, "Phase 1" slide |
| **[Meeting 1]** Enablement is two-part: the Agency's own "Import PNR Option" must be checked, **and**, when the importing user is Staff rather than the Agency owner, the Admin's "Import PNR Option" must also be checked | Business-authored slide — more specific than the generic "organization enabled" phrasing in revision 2 | Meeting 1, "Phase 1" slide |
| **[Meeting 1]** The PNR must be ticketed **offline** specifically | Business-authored slide | Meeting 1, "Phase 1" slide |
| **[Meeting 1]** A PNR carries two independent statuses relevant to import eligibility: a **Supplier status** (e.g. "Booked") and a **System status** (e.g. "Don't Exist") — both must be considered | Business-authored slide, called out in a "Notes" callout | Meeting 1, "Phase 1" slide |
| **[Meeting 1]** Two distinct validation categories apply: **General NDC Integration validations** (on the PNR's data) and **General NDC Core validations** (on the Import Booked PNR action itself) | Business-authored slide | Meeting 1, "Cont. Phase 1" slide |
| **[Meeting 1]** Multi-import: the system must correctly handle simultaneous imports of **different** PNRs, each possibly tied to a **different rule batch**, across a single day | Business-authored slide | Meeting 1, "Cont. Phase 1" slide |
| **[Meeting 1]** The imported booking should be reflected in: Agency Detailed Report, Agency History Wallet Report (**Super Admin only**), Finance, Statement, Ledger, Bookings, Sales, Import PNR | Business-authored slide — **provisional**, confirmation of which reports actually reflect it is an open, owned action item (Eng. Hagar/Nasser), not yet verified | Meeting 1, "Cont. Phase 1" slide + Action Items |

### 2.2 New `NDC_Core_service` integration contract — genuinely new scope

| Area / Screen / Flow | Why in scope | Source |
|---|---|---|
| Investigate the current Import Booked PNR flow and its dependencies | User Story scope bullet 1 | Current User Story |
| Identify the required request and response data for `NDC_Core_service`'s booking-retrieval endpoint | User Story scope bullet 2 | Current User Story |
| Define the initial contract (request/response) between NDC Core and `NDC_Core_service` | User Story scope bullet 3; anchored by the two developer-supplied example payloads | Current User Story + Developer-supplied payload [ASSUMPTION where extrapolated] |
| Identify required validations, business rules, and error scenarios for this contract | User Story scope bullet 4 | Current User Story |
| Define the mapping between `NDC_Core_service` and supplier/GDS responses (e.g. Travelport GDS, Sabre NDC) | User Story scope bullet 5 | Current User Story |
| Use `NDC_Core_service` as the target integration point instead of NDC-INT | User Story scope bullet 6 | Current User Story |
| Document gaps, dependencies, and follow-up implementation tasks | User Story scope bullet 7 | Current User Story |

### 2.3 Regression/compatibility coverage caused by replacing NDC-INT

| Area / Screen / Flow | Why in scope | Source |
|---|---|---|
| Every §2.1 historical behavior must still hold once retrieval goes through `NDC_Core_service` instead of NDC-INT | The objective is not "does the endpoint return JSON" but "can `NDC_Core_service` replace NDC-INT without breaking existing Import Booked PNR behavior" | Current User Story (bullet 6) + Historical Documentation |
| Supplier/GDS field mapping must be preserved end-to-end through the new path | A mapping difference between NDC-INT and `NDC_Core_service` would silently change downstream business data | Historical Documentation + Developer-supplied payload |

## 3. Out of Scope for This Module

| Area / Screen / Flow | Why out of scope | Covered by | Source |
|---|---|---|---|
| "Import Booked PNR" Admin UI screen (search form: PNR Code, Supplier, Supplier credential, Branch Name, Agency Name, Agent Name) | Explicit stakeholder decision: this run is API-only; UI is a later, separate phase | A future Feature under `import-booked-pnr` (not yet created) | Current User Story intake |
| "Import PNR" flow (PRD §7.9, IPN-01..13) — importing an un-ticketed PNR for payment/ticketing | Different, already-existing capability with its own automation; not this contract | Existing "Import PNR" module entry in the registry (`import-pnr`, Proposed) | PRD §7.9 |
| The existing NDC-INT layer's internal implementation | This Feature investigates what the *new* layer's contract should be and whether it preserves NDC-INT's observable behavior, not how NDC-INT works internally | Not tested — out of project scope for this run | Not in PRD |
| Role/menu visibility differences between Admin and Super Admin for Import PNR / Import Booked PNR nav items | Confirmed by the stakeholder to be an intentional business requirement, not a defect or open question for this Feature | Not tested — out of project scope | Not in PRD |

## 3.1 Module Boundaries

| Related module | Interaction | Verified by |
|---|---|---|
| `import-pnr` (Proposed, not yet on disk) | Distinct nav item/flow ("Import PNR") for un-ticketed PNR import and payment (PRD §7.9); shares terminology with this Feature's "Import Booked PNR" but is a different capability with different eligibility rules (ticketed only vs. un-ticketed) — kept explicitly separate to avoid scope conflation (per intake and Historical Documentation §2) | Not verified by this Feature — named here only to draw the boundary |
| `booking-mid-office` area (not yet a registered module) | PRD §3 lists "Import PNR" under Booking Mid Office; NDC-INT likely also serves booking/search flows in that area | Full-project execution only, if/when that module exists |

## 4. Roles & Credentials Required

| Role | Permissions / purpose | Credential source | PRD Reference |
|---|---|---|---|
| Admin (`ahmed ayman`) | Regular Admin — used to confirm the existing "Import Booked PNR" nav item exists and to give UI context during investigation (read-only observation; no UI testing in this phase) | `knowledge_base/credentials/credentials.json` (resolved at runtime) | PRD §2 |
| Super Admin (`odeysysadmin`) | Confirmed during intake NOT to see "Import PNR"/"Import Booked PNR" in its nav — intentional business rule, recorded here for context only | `knowledge_base/credentials/credentials.json` (resolved at runtime) | PRD §2 |
| API client / technical role for `NDC_Core_service`'s endpoint | [OPEN QUESTION] The User Story does not state what authenticates calls to `GET /api/v1/bookings/{recordLocator}` | Open Question — see §8 | Not in PRD |

## 5. Environment Constraints

| Constraint | Implication for downstream stages | Source |
|---|---|---|
| This phase is API-only | Discovery/Test Design/Automation for this Feature must target the `NDC_Core_service` HTTP contract, never the Admin UI, for what is executable now | Current User Story intake [CONFIRMED] |
| `NDC_Core_service`'s actual base URL/host, auth mechanism, and environment (dev/stg/prod) are not yet stated — the two example requests use `http://localhost:8080`, which reads as a developer's local instance | Discovery must treat the target host as an Open Question until confirmed; no environment-specific execution safety policy can be applied yet | Developer-supplied contract examples [OPEN QUESTION] |
| No formal, business-approved contract exists yet for `NDC_Core_service` — the two JSON payloads are illustrative examples from a developer, not a signed API spec. **A field must not be treated as mandatory only because both examples include it, and must not be treated as always-optional only because it is `null` in one example** | Test Design must treat every field's optionality/nullability as an ASSUMPTION or OPEN QUESTION, never CONFIRMED, until Discovery or the developer clarifies it | Developer-supplied contract examples [ASSUMPTION / OPEN QUESTION] |
| The existing Import Booked PNR **business validations** (§2.1) are Historical Requirements, not assumptions, and apply regardless of which integration layer serves the retrieval | Test Design must not silently drop or weaken them when designing `NDC_Core_service`-era coverage | Historical Documentation [HISTORICAL REQUIREMENT] |

## 6. Carried-Forward Assumptions & Risks

| ID | Type | Statement (meaning preserved) | Affected Module(s) | Source |
|---|---|---|---|---|
| HR-IBPNR-01 | Historical Requirement | Import Booked PNR works only with offline booked/ticketed PNRs; Held/Cancelled PNRs are ineligible | `import-booked-pnr` | Historical Documentation §2 |
| HR-IBPNR-02 | Historical Requirement | Supported cases: PNR not existing in NDC, or existing with Failed status (4); duplicate import (incl. by another user) must be prevented | `import-booked-pnr` | Historical Documentation §2 |
| HR-IBPNR-03 | Historical Requirement | Organization wallet, org-enablement, and PCC-configuration validations gate the import; "Validations shall be the same as the OLD booked PNR feature" | `import-booked-pnr` | Historical Documentation §2 |
| HR-IBPNR-04 | Historical Requirement | Rule Engine applies the rule set active at the **original offline ticketing date/time**, not at import time — refined by Meeting 1: rules are organized into **batches**, and it is the **batch active at booking time** that governs pricing, not one active at import time | `import-booked-pnr` | Historical Documentation §3; refined by Meeting 1 "Phase 1" + "Cont. Phase 1" slides |
| HR-IBPNR-05 | Historical Requirement | Rule batches are **periodically deleted**. If the batch active at a PNR's original ticketing time has since been deleted, the correct Rule Engine behavior on import is undefined by any source so far | `import-booked-pnr` | Meeting 1, "Phase 1" slide |
| HR-IBPNR-06 | Historical Requirement | Import Booked PNR is an NDC Admin-only feature; enablement requires the Agency's "Import PNR Option" checked, and — when the importer is Staff — the Admin's "Import PNR Option" also checked | `import-booked-pnr` | Meeting 1, "Phase 1" slide |
| HR-IBPNR-07 | Historical Requirement | The PNR must be ticketed **offline**; it carries two independent statuses (Supplier status, System status) both relevant to eligibility | `import-booked-pnr` | Meeting 1, "Phase 1" slide |
| HR-IBPNR-08 | Historical Requirement | Two distinct validation categories gate the import: General NDC Integration validations (PNR data) and General NDC Core validations (the import action itself) | `import-booked-pnr` | Meeting 1, "Cont. Phase 1" slide |
| HR-IBPNR-09 | Historical Requirement | Simultaneous import of different PNRs tied to different rule batches, across a single day, must be handled correctly | `import-booked-pnr` | Meeting 1, "Cont. Phase 1" slide |
| HR-IBPNR-10 | Historical Requirement | The imported booking should be reflected in eight named reports, one of them (Agency History Wallet Report) visible to Super Admin only — **provisional**, an open action item tracks confirming this list | `import-booked-pnr` | Meeting 1, "Cont. Phase 1" slide + Action Items |
| A-IBPNR-01 | Assumption | `NDC_Core_service` is a not-yet-fully-specified internal service; its contract is being defined by this investigation rather than read from an existing spec | `import-booked-pnr` | Current User Story |
| A-IBPNR-02 | Assumption | The two example JSON payloads (Travelport GDS / Sabre NDC) are representative of the response shape across suppliers, but field presence/nullability varies per supplier (e.g. `baggageAllowances`, `services`, `filedAmount` differ between the two examples) — this is an observation about the *examples*, not a confirmed contract rule | `import-booked-pnr` | Developer-supplied examples |
| R-IBPNR-01 | Risk | Without a confirmed target host/environment and auth mechanism for `NDC_Core_service`, API-level Discovery may stall — flagged for early resolution | `import-booked-pnr` | Not in PRD |
| R-IBPNR-02 | Risk | Conflating this Feature's "Import Booked PNR" (ticketed-booking retrieval) with the existing "Import PNR" flow (PRD §7.9, un-ticketed PNR import for payment) would misapply IPN-01..13's validations (PNR length 6–9 chars, etc.) to a contract that may not share them | `import-booked-pnr`, `import-pnr` | PRD §7.9 |
| R-IBPNR-03 | Risk | Treating example-only payload details (field presence, apparent optionality, apparent max/min lengths, apparent status codes) as confirmed requirements would create test cases with fabricated expected results | `import-booked-pnr` | Current instruction — corrective |
| R-IBPNR-04 | Risk | Replacing NDC-INT with `NDC_Core_service` could silently change supplier/GDS field mapping or drop a historical validation if regression coverage (§2.3) is not designed and executed before cutover | `import-booked-pnr` | Historical Documentation + Current User Story |

## 7. Traceability Anchor

| Context Item | Section here | Source |
|---|---|---|
| Revision correction (no longer "entirely new scope") | §0 | Current instruction — corrective |
| Scope Summary | §1 | Current User Story + Historical Documentation |
| Existing business behavior (historical, baseline regression) | §2.1, §6 (HR-IBPNR-01..04) | Historical Documentation |
| New `NDC_Core_service` contract scope | §2.2 | Current User Story |
| Regression/compatibility scope from the NDC-INT swap | §2.3 | Current User Story + Historical Documentation |
| UI screen exclusion (this phase) | §3 | Current User Story intake |
| Distinction from existing "Import PNR" flow | §3, §3.1, §6 (R-IBPNR-02) | PRD §7.9 (IPN-01..13), PRD §3 (Module Map) |
| Roles observed during intake (Admin vs Super Admin nav visibility) | §4, §3 | PRD §2 (Actors and roles) |
| Environment/host open item | §5, §8 | Developer-supplied examples only |
| Supplier-response variance (Travelport GDS vs Sabre NDC) | §6 (A-IBPNR-02) | Developer-supplied examples |
| Guardrail against fabricating requirements from examples | §5, §6 (R-IBPNR-03) | Current instruction — corrective |

## 8. Open Questions — Requires Run Configuration / Business Confirmation

| Missing Key | Sections Affected |
|---|---|
| `{{APP_URL}}` for `NDC_Core_service` (the developer examples use `http://localhost:8080`, not a shared environment) | §5 Environment Constraints, §4 Roles & Credentials |
| Authentication/authorization mechanism for calling `NDC_Core_service`'s endpoint | §4 Roles & Credentials Required |
| `{{ENVIRONMENT_NOTES}}` — whether this is a shared or isolated environment, and any destructive-action constraints for API testing | §5 Environment Constraints |
| Exact HTTP status codes and error-message contract for invalid/missing/unsupported input | §2.2, Test Design |
| Whether `providerId` is genuinely mandatory, and whether provider names are case-sensitive | §2.2, Test Design |
| Minimum/maximum `recordLocator` length for `NDC_Core_service` (must not be assumed to inherit the unrelated Import PNR flow's 6–9 character rule, PRD IPN-02/03) | §2.2, Test Design |
| Exact field optionality/nullability per field, per supplier, beyond what the two examples happen to show | §2.2, Test Design |
| Whether/how field mapping is verified to be identical between NDC-INT (historical) and `NDC_Core_service` (new) for the same booking | §2.3 |
| What observability (logs/monitoring) exists to prove which integration layer actually served a given request | §2.3, Test Design |
| What Rule Engine behavior is correct when a PNR's originally-active rule batch has since been deleted (HR-IBPNR-05) | §2.1, §6, Test Design |

### 8.1 Tracked action items — Meeting 1, with named owners

*(Not this Feature's own open questions — items the business already assigned, several of which**
answer or overlap the questions above. Carried forward for traceability, not duplicated as new asks.)*

| Action | Owner | Overlaps |
|---|---|---|
| Check whether new Galileo credentials are introduced/integrated, and the deadline if so | Eng. Tamer | Supplier/credential configuration context for `import-booked-pnr` |
| Set a meeting with Business to test with a production PNR from the Offline Screen (after Function Test) | Eng. Tamer / Nasser | Signals a planned execution phase using real, offline-ticketed PNRs — relevant to scheduling the regression phase (Coverage Report REC-07) |
| Test Cases follow-up meeting | Eng. Ahmed / Eng. Nada | This Test Design output is exactly what such a follow-up would review |
| Investigate which Reports the imported booked PNRs are actually reflected in | Eng. Hagar / Nasser | Directly resolves the "provisional" flag on HR-IBPNR-10's report list |
| Provide the APIs to Eng. Nada | Eng. Hagar | Directly resolves the missing `NDC_Core_service` specification (§2.2, §5) |
| Get the General NDC Integration validation list for PNR data | Eng. Tamer | Directly resolves HIST-13/HR-IBPNR-08's un-enumerated validation list (Coverage Report REC-04) |

## 9. Discrepancies Between Sources

*(§7 Rule 2 — where a secondary source conflicts with the primary, the conflict is logged, never
silently resolved.)*

| ID | Sources in tension | What each says | Resolution |
|---|---|---|---|
| DISC-01 | Historical Documentation (revision 2) vs. Meeting 1 | Historical Documentation: "Rule Engine calculation is based on the original offline ticketing date/time." Meeting 1: rules are organized into **batches**, and it is the **batch active at booking time** that applies — and old batches are periodically deleted. | Not a contradiction — Meeting 1 is the more specific, business-authored mechanism behind the same rule. HR-IBPNR-04 now states both; HR-IBPNR-05 records the batch-deletion edge case Meeting 1 adds and the earlier source did not mention. Treat Meeting 1 as authoritative where it is more specific. |
| DISC-02 | Historical Documentation (revision 2) vs. Meeting 1 | Historical Documentation lists two supported import cases: PNR not existing in NDC, and PNR existing with **Failed status (4)**. Meeting 1 states only "the PNR doesn't exist in the NDC System before" and does not mention a Failed-status(4) case. | Not treated as a contradiction — Meeting 1 is a higher-level slide and its silence on a case is not evidence the case is wrong. HIST-03 keeps both cases. Flagged so a reviewer can confirm the Failed-status(4) case with the business if Meeting 1's omission turns out to be deliberate. |
