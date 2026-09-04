# Feature Checklist Profile — Import Booked PNR

<!-- Sourced FROM one or more approved shared contexts for this Feature — never invented
     independently of them. This Profile is Feature-level: it does not bind to one shared scope's
     name, so a Supplier renderer resolves it from the Feature root regardless of how many shared
     scopes the Feature has accumulated. Every source used is listed explicitly below, with its own
     revision. When any source changes, this Profile is updated in the same review, not silently
     left stale. -->

**Feature:** Import Booked PNR (`import-booked-pnr`)
**Canonical location:** `platform_core_data/supplier-features/import-booked-pnr/context/FeatureChecklistProfile.md`
**Status:** Approved
**Last Updated:** 2026-09-02

### Sources

<!-- One row per shared scope this Profile currently draws from. A Feature with more than one
     approved shared scope lists each one here — this Profile is never rebuilt per shared scope. -->

| Shared Scope | Path | Revision | What it contributed |
|---|---|---|---|
| `new-layer-contract` | `platform_core_data/supplier-features/import-booked-pnr/shared/new-layer-contract/context/ProjectContext.md` | rev 3 (Meeting 1 incorporated) | §A, §B, §C, §D below, all rows |
| `new-layer-contract` (test design) | `platform_core_data/supplier-features/import-booked-pnr/shared/new-layer-contract/test_design/TraceabilityMatrix.md` | matches ProjectContext rev 3 | `HIST-xx` / `SVC-xx` / `MIG-xx` ID scheme and roll-up used throughout |
| — (Feature-level operational knowledge, not a shared scope) | `platform_core_data/supplier-features/import-booked-pnr/context/ExecutionFlow_HappyPath.md` | 2026-09-02 | HOW to execute the Happy Path across the Source/Target environment model — referenced by Suppliers via `SupplierChecklist.md` §3c, never duplicated |

**ID scheme used below:** `HIST-01…20` (the Traceability Matrix's canonical per-requirement IDs —
finer-grained than the Project Context §6's own `HR-IBPNR-01…10` numbering, which groups several
`HIST` items together). `HIST-xx` is used here because it's what Supplier Test Cases trace against,
matching the existing Requirement → Test Case Roll-Up. `MIG-xx` is used for migration/regression
behaviors. `SVC-xx` items are the `NDC_Core_service` contract requirements — included only where
genuinely relevant, flagged where the underlying contract is itself an Open Question.

## A. Feature-Specific Test Data Rows

| Test Data Item | Why (Requirement ID) | Notes |
|---|---|---|
| Valid ticketed offline PNR | HIST-01, HIST-16 | Baseline eligible case |
| Held (un-ticketed) PNR | HIST-02, HIST-16 | For eligibility-rejection testing |
| Cancelled PNR | HIST-02 | For eligibility-rejection testing |
| PNR not existing in NDC | HIST-03 | One of the two supported import cases |
| PNR existing with Failed status (4) | HIST-03 | The other supported import case |
| Duplicate-import candidate (same PNR imported a second time, incl. by a different user) | HIST-04 | Duplicate-prevention testing |
| Multiple different PNRs, each tied to a different rule batch, imported the same day | HIST-18 | Cross-PNR concurrency case, broader than same-PNR duplicate testing |
| Organization/agency with "Import PNR Option" enabled | HIST-05, HIST-15 | Agency-level enablement |
| Organization/agency with "Import PNR Option" disabled | HIST-05, HIST-15 | Negative case |
| Staff-role importer (not the Agency owner), with Admin's own "Import PNR Option" both required | HIST-15 | The Staff-side half of the two-part toggle |
| Organization with required PCC configuration present | HIST-06 | Positive case |
| Organization missing required PCC configuration | HIST-06 | Negative case |
| Organization with sufficient wallet balance | HIST-07 | Positive case |
| Organization with insufficient wallet balance | HIST-07 | Negative case |
| PNR ticketed at a time when the then-active rule batch has since been deleted | HIST-20 | Flagged — no source defines the correct expected result (see Open Questions) |

## B. Feature-Specific Business / E2E Behavior Rows

<!-- Status column so a rendered Supplier Checklist can see at a glance which behaviors are
     Confirmed vs. Open/Provisional/Pending Confirmation — required so MIG-02 and the composite
     success row (below) never silently promote an open item to a confirmed one. -->

| Behavior | Inherited Requirement ID | Source Status |
|---|---|---|
| Ticketed offline PNR eligibility | HIST-01, HIST-16 | Confirmed (Historical Requirement) |
| Held PNR rejection | HIST-02 | Confirmed |
| Cancelled PNR rejection | HIST-02 | Confirmed |
| PNR-not-existing supported case | HIST-03 | Confirmed |
| Failed-status(4) supported case | HIST-03 | Confirmed in Historical Documentation; Pending Confirmation against Meeting 1, which is silent on it — see DISC-02 |
| Duplicate import prevention | HIST-04 | Confirmed |
| Concurrent import — multiple different PNRs, different rule batches, same day | HIST-18 | Confirmed |
| Organization/Agency-level "Import PNR Option" enablement | HIST-05, HIST-15 | Confirmed |
| Staff-importer + Admin-level "Import PNR Option" enablement | HIST-15 | Confirmed |
| PCC configuration validation | HIST-06 | Confirmed |
| Wallet validation (sufficient credit) | HIST-07 | Confirmed |
| Wallet deduction on successful import | HIST-08 | Confirmed |
| Rule Engine — original offline ticketing date/time governs the applicable rule batch | HIST-09, HIST-10 | Confirmed |
| Rule batch deleted before import — correct behavior | HIST-20 | Open — no source defines correct behavior; do not assert an expected result for this row |
| Validations unchanged from the old (NDC-INT) Import Booked PNR feature | HIST-12, HIST-13 | Confirmed |
| Two validation categories: General NDC Integration (PNR data) vs. General NDC Core (the import action) | HIST-17 | Category split Confirmed; the validations within each category are Open — not yet enumerated |
| Booking persisted as manual/imported booking with import classification | HIST-11 | Confirmed |
| Downstream booking/report reflection (8 named reports; one Super Admin–only) | HIST-19 | Provisional — report list itself is pending business confirmation (owned: Eng. Hagar/Nasser) |
| NDC Core Service replaces NDC-INT as the retrieval integration point | MIG-01 | Confirmed |
| Business data returned via NDC Core Service matches what NDC-INT returned for the same booking | MIG-03 | Confirmed as a requirement; verification is blocked pending dual-path execution capability |
| Confirmed historical behavior remains compatible after the NDC-INT → NDC Core Service migration | MIG-02 (reworded — see note) | See note below |
| Successful complete import flow (core, confirmed outcome) | Composite — see note below | See note below |

**MIG-02 wording correction:** the source Traceability Matrix states MIG-02 as "every historical
business behavior (HIST-01…HIST-20) still holds after the swap." That phrasing is not used in this
Profile because several HIST items are explicitly **Open** (HIST-20), **Provisional** (HIST-19), or
**Pending Confirmation** (the HIST-03/Failed-status(4) case per DISC-02, and HIST-17's un-enumerated
validation lists). This Profile instead states MIG-02 as:

> **Confirmed historical Import Booked PNR behavior remains compatible after migration from NDC-INT
> to NDC Core Service, excluding requirements explicitly marked Open, Provisional, or Pending
> Confirmation.** Those excluded items (HIST-20, HIST-19's report list, HIST-17's validation
> enumeration, and the DISC-02 Failed-status(4) question) stay open until resolved — migration
> traceability must never silently promote them to confirmed requirements.

**Successful complete import flow — composite, confirmed-only:**

> ticketed eligibility (HIST-01, HIST-16)
> → organization/PCC/wallet validations (HIST-05, HIST-06, HIST-07, HIST-15)
> → supplier retrieval/mapping via the NDC Core Service contract (see SupplierChecklist.md §6
>   Contract/Mapping; governed by the Feature's `SVC-xx` contract requirements, tracked separately —
>   not duplicated here)
> → Rule Engine behavior (HIST-09, HIST-10)
> → wallet processing (HIST-08)
> → persistence / booking creation (HIST-11)
> → compatible with confirmed historical behavior after migration (MIG-02, as reworded above)
>
> **Downstream/report reflection (HIST-19) is deliberately excluded from this core outcome** — it
> remains its own separate row above with its own Provisional status, so a provisional requirement
> can never become a mandatory success criterion for "did the import succeed."

## C. Feature-Specific Error Rows

| Error Case | Why (Requirement ID) |
|---|---|
| Supplier PNR not found | Flagged — no dedicated Requirement ID. SVC-12 ("error scenarios are defined and returned predictably") and SVC-13 ("supplier failure modes are handled and normalized") are the only related IDs, and both are explicitly sourced as `OQ` (Open Question) in the Traceability Matrix — the error contract itself is undefined, not just this specific case. Record supplier behavior as observed during Discovery; do not assume a normalized shape until confirmed. |
| Missing expected supplier data / partial response | Same as above — SVC-13 (`OQ`), undefined |

## D. Feature-Specific UI Notes

| Note | Requirement ID |
|---|---|
| Import Booked PNR is an NDC Admin-only feature — no Portal equivalent | HIST-14 |
| Admin screen fields (when in scope for a run): PNR Code, Supplier, Supplier Credential, Branch Name, Agency Name, Agent Name, Search | Project Context §1 (out-of-scope note for the shared new-layer-contract run only — UI itself was never tested by that run; this row exists so a future Supplier run inherits the known field list rather than rediscovering it from scratch) |

---

## Open Questions carried from the shared context

<!-- Not new questions — these are the source document's own Open Questions (§8) and Discrepancies
     (§9), carried here because they directly affect rows above. A Supplier Checklist's own §12 Open
     Questions should reference these rather than re-deriving them independently. -->

| Source | Question | Affects |
|---|---|---|
| ProjectContext.md §8 / HIST-20 | What is the correct Rule Engine behavior when a PNR's originally-active rule batch has since been deleted? | §A test data row, §B "Rule batch deleted" row |
| TraceabilityMatrix.md §1.2 (SVC-12, SVC-13) | Error contract and supplier-failure-mode handling are undefined | §C both error rows |
| ProjectContext.md §9, DISC-02 | Historical Documentation lists "Failed status (4)" as a supported case; Meeting 1 mentions only "doesn't exist" and is silent on Failed-status — not yet confirmed as still valid | §A "Failed status (4)" row, §B "Failed-status(4) supported case" row |
| ProjectContext.md §6, HIST-19 | The 8-report reflection list is provisional, pending business confirmation (owned: Eng. Hagar/Nasser) | §B "Downstream booking/report reflection" row |
| ProjectContext.md §6, HIST-17 | "General NDC Integration validations" and "General NDC Core validations" are named as categories but not enumerated (owned: Eng. Tamer) | §B validation-category row |
