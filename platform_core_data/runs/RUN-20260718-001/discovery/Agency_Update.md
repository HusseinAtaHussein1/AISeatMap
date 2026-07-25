# Discovery Snapshot — Agency (Update / Edit screen)

**Discovery Mode:** Browser Automation (`tools/browser_driver`, ad hoc script) · **Date:** 2026-07-18 · **URL:** `http://192.168.1.70/admin/agency/edit/{id}` · **Role:** Admin.

## Navigation

Reached via the Actions column's pencil icon on the Agency List (see `Agency_Actions.md`). URL is `/admin/agency/edit/{numericId}` — the numeric internal id, not the Agency Code.

## Pre-population — confirmed field-for-field reuse of the Add form

The Update screen renders the **exact same field ids** as `/admin/agency/add` (same `ndc-fg-form-generator`-based component, populated from the existing record instead of blank). Confirmed via live DOM dump on `QASPIKE_ACT11222` (created this run):

```
id-Branch=              id-Agency=QASPIKE_ACT11222       id-Country=Egypt
id-State=               id-City=                          id-Postofficebox=QASPIKEB
id-CompanyURL=          id-FaxNo=                          Phone No=1009876543
id-IATAAgency-yes=true  id-AgencyBusinessType-B2B=0
id-Contactperson=QA Spike Actions Contact
id-EmailID=qa.spike.actions@example.com   Phone Number=1009876544
id-ContractStartDate=01/01/2026           id-ContractEndDate=31/12/2027
id-Name=QA Spike Actions Sales            id-EmailID=qa.spike.actions.sales@example.com
id-Invoicegeneration=   id-Creditlimit=50000   id-Topuplimit=500000
id-CreditTerms(Days)=1  id--Creditagency=true
id-Paymentoption-Cash=1 (checked)  ...(~26 payment-option checkboxes total)
id-SelectProduct-Flight=1  id--ImportPNROption=true  id--TransferPnrOption=true  id--BlueCommandScreen=true
```

**Important — Branch/State/City/Invoice-generation dropdowns read back empty (`=`)** even though they have a real underlying value (Branch must have a value since the record was created under one). This is a **PrimeNG dropdown display quirk, not missing data** — the same components on the Add form need their panel opened to render the selected label; reading `.value` on the hidden proxy `<input>` doesn't reflect the dropdown's actual bound selection here, consistent with why `Agency_Page.java`'s own `selectBranch()`/`selectStateAndCity()` never read these back either. **Do not treat an empty read-back of these specific fields as "State/City lost on Update" without opening the dropdown to check** — a genuine assertion needs the dropdown's rendered label, not the proxy input's `value` attribute.

**Confirmed real default values** for `Creditlimit` (50000), `Topuplimit` (500000), `CreditTerms(Days)` (1) — these were never filled during this run's Add-form submission and still show non-empty here, meaning the backend applies its own defaults. This explains why the existing `Agency_Page.java` happy-path test (which never fills these) has always submitted successfully.

## Update screen's own action buttons

Distinct from the List screen's grid-level icons — the Update screen itself exposes: `Cancel`, `Send For Approval`, **and also `Approve` / `Reject`** directly on the same screen (confirmed present in the button list, not independently exercised this run — `TC-AGENCY-UPDATE-005`/`-006` should reuse the same remark-popup mechanics documented in `Agency_Actions.md` if these buttons open the same dialog; not yet confirmed byte-for-byte, since this run exercised Approve/Reject only from the grid icons).

## Cancel — confirmed

Clicking `Cancel` on the Update screen navigates back to `/admin/agency` (confirmed via URL check). Whether it discards an in-progress *edit* specifically (`TC-AGENCY-UPDATE-003`'s exact scenario: change a field, then Cancel, then re-open and confirm the change was NOT saved) was not independently isolated this run — this pass clicked Cancel without first changing a field. **Automation Plan should mark the "discards changes" half of `TC-AGENCY-UPDATE-003` as needing one more targeted live check before being asserted as Reuse-ready, not Generate-ready outright.**

## Known gap not resolved by this pass

Editing a field and resubmitting (`TC-AGENCY-UPDATE-002`), and the mandatory-field-still-enforced spot-check (`TC-AGENCY-UPDATE-004`), were not exercised live this run — the Automation Plan should classify these as **Generate, pattern-reused from the Add form's already-proven fill methods** (same field ids, same page), not as blocked, since the field-level interaction mechanics are already fully proven by `Agency_Page.java` and this snapshot's own id confirmation — only the "open via pencil, assert pre-population, edit, resubmit" wrapper is new.
