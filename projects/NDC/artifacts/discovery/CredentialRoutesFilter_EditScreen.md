# Discovery Snapshot — Credential Routes Filter · Edit Screen

**Discovery Mode:** User-guided exploration (§8.1 #4) · **Evidence Category:** Human Observation (§17)
**URL observed:** `http://192.168.1.70/master/supplier/credential-routes-filter/edit/287`
**Logged-in user:** `odeysysadmin`
**Module:** Master → Supplier → Credential Routes Filter
**Timestamp:** 2026-07-11 12:46

## Structure Observed

**Top navigation bar:** same 11 items — see FINDING-001.

**Page heading:** "Edit Routes Filter" (record ID `287`)

**Section — Configuration:**
- `Supplier` = **Galileo**
- `Supplier Credentials` = **Galileo Live UAE**
- Mode toggle: **`Whitelist`** selected (filled blue radio) · `Blacklist` unselected
- No Airlines multi-select field present, despite Galileo already being selected as Supplier here — see "Relevance" below.

**Section — Add Routes:** `Origin` / `Destination` typeaheads, both empty, `Add` disabled — same shape as the Add screen.

**Section — Routes:**
- One route row: **`SSH` → `AMM`** (origin/destination airport codes), with a delete (trash) icon
- Counter: **`1 / 50`**

**Footer actions:** `Cancel` · `Save Configuration`

## Relevance to Project Context

- **Resolves Carried-Forward Assumption #3** (Project Context §6): the live Credential Routes Filter UI **already implements** the "single Routes list + Whitelist/Blacklist radio" model T3002-066 describes as its target shape — this is not something that still needs to be built from scratch, it already exists in this form. Recorded as Confirmed Behaviour in the QA Assessment Report.
- **Relevant to T3087 (Assumption #5) and the Airlines-dropdown-existence question:** with `Galileo` already selected as Supplier on this Edit screen, no Airlines multi-select is rendered. This is consistent with T3087's Airlines filter not yet being built (expected, since T3087 is itself the story requesting this capability) — but it does **not** by itself confirm whether Galileo would even be classified as a "GDS-type" supplier, since Galileo's own type/classification has not yet been observed (Master → Flight → Airline, and possibly a separate Supplier-level type field, are still unvisited). See the Open Question raised in the QA Assessment Report about "supplier type" (T3087's wording) vs. "Airline Type" (Project Context §2's wording) potentially referring to two different fields.
- Confirms existing production data: one Whitelist-mode rule for `Galileo`/`Galileo Live UAE` permitting exactly one route, `SSH → AMM`.
