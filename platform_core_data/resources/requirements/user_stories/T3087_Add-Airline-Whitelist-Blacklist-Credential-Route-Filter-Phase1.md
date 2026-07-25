# T3087 — Add Airline in Whitelist/Blacklist (Credential Route Filter CRUD) Phase 1

**Type:** User Story · **Source:** Plain Text (pasted) · **Received:** 2026-07-10 · **Status:** Raw pasted-text source, not yet used to generate a Project Context (per `pipeline/run_scope.md` §4.1, this is a User Story Run Scope, Source = Pasted text).

> Source is metadata, not a folder — see `resources/README.md` → "Requirement Source is metadata." This file lives at `requirements/user_stories/` regardless of Source; only the `Source:` field above records how it was delivered.

**Related:** [`Q2-CORE-WT1-T3002-066_White-Black-list-route-based.md`](Q2-CORE-WT1-T3002-066_White-Black-list-route-based.md) — this story extends the same Credential Route Filter CRUD with an airline dimension. See "Cross-references" below for the overlap this creates with the pre-existing Restricted Airlines mechanism.

## Description

As an NDC Admin,
I want to configure airlines within Credential Route White/Black List rules for GDS suppliers ONLY,
So that route filtering can be applied to specific airlines returned by a selected GDS supplier on certain route.

Enhance the Credential Route Filter configuration in the Master Module by introducing airline-level filtering for White List and Black List rules.

When a user selects a supplier whose type is GDS, an additional Airlines multi-select dropdown shall be displayed. The dropdown shall allow the user to select one or more active airlines associated with the rule.

The configured airline filtering shall be applied after the supplier returns search results and before Rule Engine processing, aggregation, and result display.

The enhancement shall be supported in both Admin and Portal booking modules while retaining the current White List and Black List behavior for configurations that do not include airline filtering.

## Acceptance Criteria

### CRUD Operation Added Fields

- A new Airlines multi-select dropdown is displayed when the selected supplier type is GDS.
- The Airlines dropdown is hidden for non-GDS suppliers.
- The Airlines dropdown displays active airlines.
- Users can select one or more airlines from the dropdown.
- Selected airlines are saved as part of the White List or Black List route configuration.
- Existing White List and Black List configurations continue to function without modification.

### Search Processing

- Airline filtering is applied only to results returned by the configured GDS supplier.
- The filtering is executed after supplier results are received.
- The filtering is executed before:
  - Rule Engine processing
  - Aggregation
  - Search result display
- For White List rules, only configured airlines are allowed to proceed.
- For Black List rules, configured airlines are excluded from proceeding.
- Existing route filtering behavior remains unchanged when no airlines are configured.

### Scope

The filtering logic is applied consistently in both:
- Admin Booking Module
- Portal Booking Module

### Prerequisites

- DBA consultation is required to determine and approve the maximum number of airline selections that can be stored, as the Airlines field supports multi-selection.
- Active airline data must be available and accessible for the population of the Airlines dropdown.

## Cross-references

- Relevant existing modules observed live (see `platform_core_data/architecture.md` Navigation Model): `Master → Supplier → Credential Routes Filter`, `Master → Flight → Airline` (Airline Type field distinguishes GDS/LCC/Both), `Master → Supplier → Supplier Credentials` (pre-existing Restricted Airlines).
- **Open overlap to test, not yet resolved:** `Q2-CORE-WT1-T3002-066` documented that the pre-existing **Restricted Airlines** setting (in Supplier Credentials) operates independently of Credential Routes filtering, applying only after route validation, with no conflict. This story adds a *second*, distinct airline-level filter living inside the Credential Routes rule itself, scoped to GDS suppliers only. The same independence question T3002-066 answered for Restricted Airlines vs. route-level filtering needs re-asking for Restricted Airlines vs. this new in-rule Airlines list — they are two different mechanisms that will now coexist.
- DBA sign-off on max airline-selection count is an **unresolved prerequisite**, not a settled detail — do not assume a specific cap until confirmed.
