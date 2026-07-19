# Discovery Snapshot — Credential Routes Filter · Add Screen

**Discovery Mode:** User-guided exploration (§8.1 #4) · **Evidence Category:** Human Observation (§17) — screenshot supplied directly by human operator; not independently re-verifiable/reproducible by the agent within this run.
**URL observed:** `http://192.168.1.70/master/supplier/credential-routes-filter/add`
**Logged-in user (top-right):** `odeysysadmin` (see FINDING-002 — differs from `E.Saady`, the identity recorded in `run_configuration.md`)
**Module:** Master → Supplier → Credential Routes Filter (primary in-scope CRUD)
**Timestamp:** 2026-07-11 12:46 (per screenshot system clock)

## Structure Observed

**Top navigation bar** (11 items, "Master" active): Dashboard · Admin · Master · Rule Engine · Settings · User Management · Booking-Mid Office · Profile · Reports · PNR Query · Transfer PNR — see FINDING-001 (Import PNR / Import Booked PNR not present).

**Page heading:** "Add Routes Filter"

**Section — Configuration:**
- `Supplier` — dropdown, placeholder "Select supplier", empty at capture time
- `Supplier Credentials` — dropdown, placeholder "Select credential", empty at capture time
- Mode toggle — two radio buttons: `Whitelist` / `Blacklist`, neither selected in this empty-form state

**Section — Add Routes:**
- `Origin` — "Search airport (IATA or name)" typeahead/dropdown
- `Destination` — "Search airport (IATA or name)" typeahead/dropdown
- `Add` button — disabled (grey) with no Origin/Destination selected

**Section — Routes:**
- Empty state: "No routes added yet."
- Counter, bottom-right: **`0 / 50`** — see FINDING-003 (undocumented 50-route cap)

**Footer actions:** `Cancel` · `Save Configuration` (enabled)

## Relevance to Project Context

- Confirms (pending full corroboration — see Assumption #3 resolution in QA Assessment Report) that the live UI already implements a **single Routes list + Whitelist/Blacklist radio toggle** per rule, matching T3002-066's described target shape.
- No Airlines multi-select field is present on this empty-state Add form (Supplier not yet selected) — does not yet confirm/refute whether selecting a GDS-type Supplier conditionally reveals one (T3087). Follow-up interaction requested.
