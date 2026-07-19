# Discovery Snapshot — Agency (Actions column: pencil / Approve / Reject)

**Discovery Mode:** Browser Automation (`tools/browser_driver`, ad hoc script per `agents/automation_agent.md` §17 selector-verification use) · **Date:** 2026-07-18 · **URL:** `http://192.168.1.70/admin/agency` · **Role:** Admin · **Scope:** Agency module only. Run against `.70` per explicit user instruction this run (contrast with `runs/RUN-20260712-002`'s `profile.json`, which points `.80` per FINDING-001 — this is a live, mid-run override, not a correction to that finding; the discrepancy between the two hosts is noted as a Risk in the Automation Plan, not resolved here).

## Why this was needed

`runs/RUN-20260713-001/discovery/Agency_Activate.md` (FINDING-007) left "where Agency Approve/Reject actually happens" **Blocked — needs human input**. The Test Design's Agency Actions User Story (v3, this run) answered it conceptually, but every `TC-AGENCY-ACTIONS-*` case was marked "Discovery Reference: Not independently verified." This snapshot verifies it live before generating any automation against it.

## Key finding: blank/default List search DOES return Pending records — FINDING-007 was about the *name-filtered* search specifically

Navigating to `/admin/agency`, clicking "Search in grid" with Status=Both and **no name filter**, returns Pending-approval rows sorted newest-first at the top of the grid (e.g. `AGN9748 QASPIKE7300 | Inactive | Pending for approval` was row 0 of 9,544 total, `.80` pass). FINDING-007's original observation (name-filtered search excludes Pending) still stands and is unchanged by this — this is a materially different, narrower reproduction path than what FINDING-007 already covered, not a contradiction of it.

## Actions column — real DOM structure

```html
<div class="actions">
  <div class="action exception-buttons"><i class="pi pi-pencil"></i></div>
  <div class="action exception-buttons"><i class="pi pi-thumbs-up"></i></div>
  <div class="action exception-buttons"><i class="pi pi-thumbs-down"></i></div>
</div>
```

- **Pending for approval** rows: pencil + thumbs-up + thumbs-down (all three).
- **Approved** rows observed on `.70`: pencil + thumbs-down only (no thumbs-up).
- **Rejected** rows observed on `.70`: pencil + thumbs-up only (no thumbs-down).

This means thumbs-up/thumbs-down are **not exclusively a Pending-only pair** as `TC-AGENCY-ACTIONS-002` assumes ("Approve/Reject buttons shown only for Pending agencies") — they behave more like a per-status single toggle (Approved rows can still be thumbed-down i.e. re-rejected/deactivated; Rejected rows can still be thumbed-up i.e. re-approved). **This needs to be reconciled with the Test Design's ACTIONS-002 wording** — flagged as a new Finding (FINDING-008) rather than silently rewritten.

## Approve/Reject remark popup — real structure (both Approve and Reject use the same dialog shape)

- Dialog title = the Agency's own name (e.g. `QASPIKE_ACT11222`).
- One field: **Remarks** (required, red asterisk), a `<textarea placeholder="remarks...">` — **not** a stable `id` attribute (the label's `for="id-Remarks"` is present but the textarea itself renders without that id in the DOM; the reusable `ndc-fg-form-generator` component does not guarantee a stable id/attribute here across instances). **Locate by placeholder, not id.**
- Buttons: **Cancel**, **Submit**.

## Verified behavior (live, both directions, using disposable `QASPIKE_ACT*` fixtures created this run)

| Action | Result |
|---|---|
| Click Submit with **empty** Remarks | Confirmed live: the record's Approval Status **remains unchanged** ("Pending for approval") after the attempt — genuinely blocked, not merely a client-side visual error. The dialog closing on the attempt (rather than staying open with an inline message) is itself the observed behavior; no inline validation-message text was captured. |
| Click Submit with a **real** Remarks value, on a Pending row's thumbs-up | Toast: `"{AgencyName} is Approved Successfully"`. Row's `Status` becomes `Active`, `Approval Status` becomes `Approved`. |
| Click Submit with a **real** Remarks value, on a Pending row's thumbs-down | Toast: `"{AgencyName} is Rejected Successfully"`. Row's `Status` becomes `Inactive`, `Approval Status` becomes `Rejected`. |

Evidence: `qa_spike_agency_asset` fixtures `AGN10200`/`QASPIKE_ACT11222` (approved) and `AGN10201`/`QASPIKE_ACT76414` (rejected), both created live this run for this purpose.

## Pencil icon → Update screen

- URL pattern: `/admin/agency/edit/{numericId}` (e.g. `/admin/agency/edit/11801`), a numeric internal id — **not** the Agency Code (`AGN10200`).
- Confirmed: clicking pencil on a specific row opens that exact record's Update screen (its Agency Name field matches, per the pre-population dump — see `Agency_Update.md`).
