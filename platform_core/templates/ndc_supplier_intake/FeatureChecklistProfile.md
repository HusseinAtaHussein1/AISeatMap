# Feature Checklist Profile — {{FEATURE_NAME}}

<!-- Renders to (Feature-level, NOT bound to one shared scope):
     platform_core_data/services/ndc-core-service/{{FEATURE_SLUG}}/context/FeatureChecklistProfile.md

     Sourced FROM one or more of this Feature's approved shared contexts — never invented
     independently of them. A Supplier renderer resolves this Profile from the Feature root; it must
     never depend on a specific shared-scope name (a Feature may have more than one approved shared
     scope over time, e.g. `new-layer-contract` today, another scope added later). Every source used
     is listed explicitly in the Sources table below, with its own revision. When any source changes,
     this Profile is updated in the same review, not silently left stale.

     THIS TEMPLATE IS GENERIC. It carries no Feature's business content — every row in a rendered
     instance is drawn from that Feature's own approved shared context(s), with an explicit
     Requirement ID. A row with no verifiable Requirement ID is flagged, never invented. -->

**Feature:** {{FEATURE_NAME}} ({{FEATURE_SLUG}})
**Canonical location:** `platform_core_data/services/ndc-core-service/{{FEATURE_SLUG}}/context/FeatureChecklistProfile.md`
**Status:** {{STATUS}} <!-- Draft / Proposed / Approved -->
**Last Updated:** {{LAST_UPDATED}}

### Sources

<!-- One row per shared scope this Profile currently draws from. Add a row rather than replacing one
     when a Feature gains a second approved shared scope — this Profile is never rebuilt per scope. -->

| Shared Scope | Path | Revision | What it contributed |
|---|---|---|---|
| | | | |

**ID scheme used below:** name the Requirement ID scheme this Feature's shared context actually uses
(e.g. a Traceability Matrix's own `HIST-xx`/`SVC-xx`/`MIG-xx`, or an equivalent). State it explicitly
here so every row below can cite a real, resolvable ID rather than a scheme invented for this Profile.

## A. Feature-Specific Test Data Rows

<!-- Injected into SupplierChecklist.md §5b. One row per test-data item this Feature's shared context
     calls for, each citing the Requirement ID that makes it necessary. -->

| Test Data Item | Why (Requirement ID) | Notes |
|---|---|---|
| | | |

## B. Feature-Specific Business / E2E Behavior Rows

<!-- Injected into SupplierChecklist.md §7b. Columns match §7a's table exactly; this Profile supplies
     only "Behavior" and "Inherited Requirement ID" (plus a Source Status so an Open/Provisional/
     Pending-Confirmation item is never silently rendered as Confirmed) — the rest (Applicability/
     Test Data/Layer/Status) is filled per Supplier during Discovery, not here.

     A composite/aggregate behavior (one that only holds once several other rows all succeed) must
     list every Requirement ID it depends on rather than being assigned a new invented ID, and must
     exclude any Open/Provisional dependency from being implied as a mandatory success criterion —
     record that dependency as its own separate row with its own status instead. -->

| Behavior | Inherited Requirement ID | Source Status |
|---|---|---|
| | | |

## C. Feature-Specific Error Rows

<!-- Injected into SupplierChecklist.md §8b. Only include a Requirement ID where one genuinely exists
     in the source; where the closest available ID's own source status is itself Open Question, say
     so explicitly rather than presenting the error case as a confirmed, defined contract. -->

| Error Case | Why (Requirement ID) |
|---|---|
| | |

## D. Feature-Specific UI Notes (optional)

<!-- Only where this Feature's UI has fixed, Feature-wide characteristics worth stating once rather
     than rediscovering per Supplier. Omit this section entirely if nothing applies. -->

| Note | Requirement ID |
|---|---|
| | |

---

## Open Questions carried from the shared context

<!-- Not new questions — this Feature's shared context's own Open Questions/Discrepancies, carried
     here only where they directly affect a row above. A Supplier Checklist's §12 references these
     rather than re-deriving them independently. -->

| Source | Question | Affects |
|---|---|---|
| | | |
