# NDC — Project Context — Credential Routes Filter

> **Renamed 2026-07-18** from `NDC_ProjectContext.v1.md` — per explicit user instruction, this project's Project Context files are named by scope, not by sequential version number (see `NDC_ProjectContext_Agency.md` for the pattern this now follows). No content below was changed by the rename.

**Run:** RUN-20260710-001 · **Status:** Pending Review · **Produced by:** Project Context Agent (Stage 1) · **Date:** 2026-07-10
**Run Scope:** Type = User Story (two stories, jointly scoped) · Source = Pasted text · per `pipeline/run_scope.md` §3/§4.1

---

## 1. Scope Summary

This run covers two related User Stories against the NDC Admin Portal's `Master → Supplier → Credential Routes Filter` module and its immediate neighbors:

- **Q2-CORE-WT1-T3002-066** ("White / Black list route based") — establishing/confirming route-level (origin–destination) filtering tied to a specific supplier + supplier credential, expressed as a single rule list with a Whitelist/Blacklist radio-button mode (selecting one mode implies the opposite for everything not listed), plus three new supporting capabilities: a system-wide audit log, a supplier-verification/diagnostic function to trace filtering decisions across system layers, and a route "tag" that may reference only the origin or the destination of a route, never both.
- **T3087** ("Add Airline in Whitelist/Blacklist — Credential Route Filter CRUD, Phase 1") — extending the same Credential Route Filter CRUD with a conditional Airlines multi-select filter, shown only when the rule's supplier type is GDS, applied to a GDS supplier's results after they're returned but before Rule Engine processing/aggregation/display, across both the Admin and Portal booking modules.

Both stories modify the same underlying CRUD screen and must be tested for interaction with each other and with two pre-existing, independent filtering mechanisms (Airport-level BlackList/WhiteList, and Restricted Airlines inside Supplier Credentials) that this run's requirement source explicitly documents as already-confirmed, non-conflicting AND-logic behavior — not itself a defect to re-litigate.

## 2. Modules In Scope

| Module (per live Navigation Model, `projects/NDC/architecture.md`) | Why in scope |
|---|---|
| `Master → Supplier → Credential Routes Filter` | Primary target of both stories — the CRUD being modified |
| `Master → Flight → Airport` | Airport-level BlackList/WhiteList — the AND-logic counterpart T3002-066's Notes ask to investigate before implementing |
| `Master → Supplier → Supplier Credentials` (Restricted Airlines setting) | Pre-existing, independent airline filter both stories must not conflict with |
| `Master → Flight → Airline` (Airline Type field: GDS / LCC / Both) | Determines whether T3087's Airlines dropdown appears at all |
| Booking-Mid Office (Admin Booking Module) | Where filtered search results surface, Admin side |
| Portal Booking Module | Where filtered search results surface, agency/customer-facing side — **not yet confirmed to exist as a distinct, separately-accessible surface in this environment; needs Explorer confirmation** |
| New capabilities not yet built: Audit Log, supplier-verification/diagnostic function, route tag (origin/destination-exclusive) | Explicitly requested by T3002-066 — in scope as design/acceptance targets even though nothing exists live to explore yet |

## 3. Modules Out of Scope

Everything else in the confirmed live Navigation Model is out of scope for this run: Admin (Company / Branch / Agency / Staff / Registration Requests / Category Management), Rule Engine (Markup, Discount, Service Charge, Cancellation Charge, Fare Rule Master, Offer Pricing, Terms And Conditions — referenced only as a downstream boundary marker "before Rule Engine processing," never itself modified), Settings (Suppliers, Admin Settings), User Management, Profile / Traveller, Reports (all report types), PNR Query, Transfer PNR, Import PNR, Import Booked PNR, Miscellaneous (Region, Currency, Rate of Exchange, Credential Rate of Exchange), Payment Gateway.

## 4. Roles & Credentials Required

- **NDC Admin** — both stories are written "As an NDC Admin." A working Admin session is confirmed (`E.Saady`, full nav bar) per `projects/NDC/run_configuration.md`. Username/password values are not recorded in this repo; see `projects/NDC/resources/credentials/`.
- **Agency / Agent** — not the actor in either story, but T3087's "Portal Booking Module" in-scope item may require an Agency or Agent-facing credential to verify search-result filtering from that side. Per `projects/NDC/run_configuration.md`, Agency is unconfirmed and Agent is not available for this run — **flagged as a credential gap for the Explorer Agent to surface, not assumed resolved.**

## 5. Environment Constraints

Per `projects/NDC/run_configuration.md` (unchanged by this run):
- Target: `http://192.168.1.70`, shared staging, not isolated to this testing effort.
- **Read-only for now** — no creating, editing, or deleting Companies, Branches, Agencies, Agents, bookings, or reference data (this explicitly includes Credential Routes Filter rules, Airport BlackList/WhiteList entries, and Supplier Credentials/Restricted Airlines settings) is authorized until explicitly cleared.
- **Direct consequence for this run:** the Explorer Agent may *observe* current Credential Routes Filter / Airport / Supplier Credentials configuration and behavior, but may **not** create or modify a rule to empirically test the AND-logic or Restricted-Airlines-independence claims below — those claims can only be corroborated via what's already configured, or via read-only inspection (e.g., the `TT_TS_SETTINGS`-style direct-DB view already used once in this project), not via new mutating test rules.

## 6. Carried-Forward Assumptions & Risks

| # | Assumption / Risk | Source | Status this run should treat it as |
|---|---|---|---|
| 1 | Airport-level BlackList/WhiteList and Credential-Routes-level WhiteList/BlackList combine with **AND** logic (any BlackList from either module blocks the route; both must allow it to appear) | T3002-066 Comments, Example 1 | Presented as already-confirmed via prior investigation — carry forward as true, but T3002-066's own Notes still ask to re-investigate current blacklists/whitelists "to obtain a complete view" before implementing, so this is a *carried* assumption to corroborate via read-only observation, not blindly re-accept without any check |
| 2 | Restricted Airlines (Supplier Credentials) filters airline results **after** route validation and is fully independent of Credential Routes filtering — no flag needed to disable either | T3002-066 Comments, Example 2 | Same as above — carried as confirmed, but this is exactly the interaction T3087 reintroduces risk into (see #5) |
| 3 | Current Credential Routes Filter UI may or may not already implement "one list + Whitelist/Blacklist radio" — not yet confirmed against the live screen | T3002-066 Notes ("investigate... to obtain a complete view") | Unconfirmed — Explorer must determine current UI shape before Test Design can write baseline/regression cases accurately |
| 4 | Audit log, supplier-verification/diagnostic function, and origin/destination-exclusive route tag do not exist yet in the live system | Absence from all captured screenshots; T3002-066 "We need to implement" section | Treat as net-new capabilities — no live baseline to explore; Test Design will need to mark these test cases assumption-based pending build |
| 5 | T3087's new in-rule Airlines list and the pre-existing Restricted Airlines setting are two distinct mechanisms that will coexist, and their independence (per assumption #2) is **untested for this new combination** | Derived by cross-referencing both stories — not stated explicitly in either | Open risk — flag explicitly for Explorer/Test Design, do not assume it holds just because Restricted Airlines vs. plain route filtering already does |
| 6 | Max number of airlines storable per rule is undetermined pending DBA sign-off | T3087 Prerequisites | Unresolved dependency — do not assume any specific cap in test design |
| 7 | Database engine mismatch: infographic-derived architecture says Oracle/SQL Server; a screenshot shows a MySQL-Workbench-style tool querying schema `wonderdb` | `projects/NDC/architecture.md` Known Structural Risks | Relevant if Explorer needs to inspect how Credential Routes Filter rules are actually persisted — confirm engine before relying on either claim |
| 8 | "Portal Booking Module" as a distinct booking surface from "Admin Booking Module" (`Booking-Mid Office`) is asserted by T3087 but not yet confirmed to exist/be reachable in this environment | T3087 Scope section | Explorer must confirm whether this is a separate accessible surface or the same Booking-Mid Office under a different name |

## 7. Traceability Anchor

| Item above | Section | PRD-equivalent source |
|---|---|---|
| §1 Scope Summary, §2 Modules In Scope (Credential Routes Filter, radio-button list) | US1 Description + Acceptance Criteria | `artifacts/NDC/knowledge/NDC_PRD.md` §"User Story 1" |
| §2 Modules In Scope (Audit Log, verification function, route tag) | US1 "We need to implement" | `artifacts/NDC/knowledge/NDC_PRD.md` §"User Story 1" |
| §6 Assumption 1, 2 | US1 Comments, Examples 1–2 | `artifacts/NDC/knowledge/NDC_PRD.md` §"User Story 1" |
| §6 Assumption 3 | US1 Notes | `artifacts/NDC/knowledge/NDC_PRD.md` §"User Story 1" |
| §2 Modules In Scope (Airlines dropdown, GDS-only, Portal Booking Module), §6 Assumption 5, 6, 8 | US2 Description + Acceptance Criteria + Prerequisites | `artifacts/NDC/knowledge/NDC_PRD.md` §"User Story 2" |
| §4 Roles & Credentials, §5 Environment Constraints | Run configuration | `projects/NDC/run_configuration.md` |
| §6 Assumption 7 | Standing architecture risk | `projects/NDC/architecture.md` §"Known Structural Risks" |

---

*Per `pipeline/pipeline.md` §5.1, this artifact requires Human Review (suggested reviewer: Business Analyst / Product Owner) before Stage 2 (Explorer Agent) may begin. It is not yet the "current approved" Project Context — see `artifacts/NDC/pipeline/NDC_RunManifest.md`.*
