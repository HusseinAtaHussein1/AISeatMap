# Discovery Snapshot — Credential Routes Filter · Add Screen (Supplier + Credential selected)

**Discovery Mode:** Browser Automation (§8.1 #1) — via the platform's `tools/browser_driver/` (`BrowserDriver`), driving the system's real Chrome browser, headed, authenticated as `odeysysadmin` (Super Admin).
**Evidence Category:** Direct Observation (§17) — the agent itself directly witnessed this live, through interactive tooling it controlled. First Direct Observation evidence this run (all prior evidence was Human Observation via User-guided exploration).
**URL:** `http://192.168.1.70/master/supplier/credential-routes-filter/add`
**Logged-in user:** `odeysysadmin`
**Timestamp:** 2026-07-11 (this session)

## Action Taken

On a fresh (empty) Add Routes Filter form: selected Supplier = **Galileo**, then Supplier Credentials = **Galileo Live UAE**.

## Structure Observed After Selection

**Configuration section**, in order: `Supplier` (Galileo, selected) → `Supplier Credentials` (Galileo Live UAE, selected) → `Whitelist` / `Blacklist` radio toggle (neither selected). **No additional field appears between Supplier Credentials and the Whitelist/Blacklist toggle** — specifically, no Airlines multi-select field is rendered.

Rest of the form unchanged from the empty-state snapshot (`CredentialRoutesFilter_AddScreen.md`): Add Routes (Origin/Destination typeahead, disabled Add button), empty Routes list, `0 / 50` counter, Cancel/Save Configuration footer.

No unexpected dialog fired during this interaction (checked via `takePendingDialog()` after every step).

## Relevance to Project Context

- **Directly confirms** (Direct Observation, not just Human Observation) that the T3087 Airlines multi-select filter does not exist on the live Credential Routes Filter Add screen, even when a Galileo/Galileo Live UAE combination is selected — consistent with T3087's own premise (it is the story requesting this capability be built).
- Does **not** yet resolve whether Galileo is classified as a "GDS-type" supplier — that classification (wherever it actually lives) has still not been directly observed. This remains relevant to the open "supplier type" vs. "Airline Type" wording question (see QA Assessment Report §8).
