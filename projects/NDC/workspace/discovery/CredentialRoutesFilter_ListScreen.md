# Discovery Snapshot — Credential Routes Filter · List Screen

**Discovery Mode:** User-guided exploration (§8.1 #4) · **Evidence Category:** Human Observation (§17)
**URL observed:** `http://192.168.1.70/master/supplier/credential-routes-filter`
**Logged-in user:** `odeysysadmin`
**Module:** Master → Supplier → Credential Routes Filter
**Timestamp:** 2026-07-11 12:46

## Structure Observed

**Top navigation bar:** same 11 items as `CredentialRoutesFilter_AddScreen.md` — see FINDING-001.

**Left sidebar (Master module, expanded):** Flight · Supplier · Miscellaneous · Payment Gateway — matches the four top-level Master categories `architecture.md` documents.

**Page heading:** "Credential Routes Filter" · top-right action button: `Add Routes Filter +`

**Filter bar:** `Supplier` dropdown ("Select supplier") · `Supplier Credential` dropdown ("Select credential") · `Search` button (both empty/unfiltered at capture time)

**Results table:**

| Supplier | Credential Name | Actions |
|---|---|---|
| Galileo | Galileo Live UAE | view (eye) / edit (pencil) / delete (trash) icons |

- "Showing 1 results of 1 results"
- "Show `10` results" page-size selector

## Observation

Exactly **one** Credential Routes Filter rule exists in this shared staging environment at capture time: `Galileo` / `Galileo Live UAE`. This is the full current-state baseline for this screen — no other supplier/credential combinations are configured. Useful as the regression baseline for Test Design (Stage 3).
