# Discovery Snapshot — Agency Update Form (run-004)

| Field | Value |
|---|---|
| Module | `agency` |
| Produced by run | `run-004__2026-08-17_14-35-25__UserStory__US-4222-UpdateAgency` |
| Revision | 1 |
| Screen / State | Update Agency — populated, editable, agency id 949 (`Test Egypt`, AGN2) |
| URL / Route | `http://192.168.1.70/admin/agency/edit/949` (pattern `/admin/agency/edit/{id}`) |
| Discovery Mode | Browser automation — **Browser Driver** (`platform_core/tools/browser_driver/`), **headed** — the human operator selected headed for this run at the standing Headed/Headless gate |
| Evidence Category | Direct Observation |
| Captured | 2026-08-18 09:56–10:07 (local) |
| Role / Credential used | `odeysysadmin` (role only; no credential value appears in any artifact or tool call) |
| Relationship to run-001 | **Independent re-observation.** run-001's `AgencyUpdateForm.md` is left untouched. Differences are recorded in `findings/ReCheck_run-004.md`. |

## 1. Purpose

The screen US-4222 governs. It edits every attribute of an existing agency and routes the change through the maker–checker workflow rather than publishing on save. This snapshot exists because run-004 is a new run against a **revised Project Context** (Revision 3) carrying twelve product-owner decisions, four of which (`PO-7`, `PO-8`, `PO-10`, `PO-12`) explicitly require this stage to *observe* rather than assume.

## 2. Entry Points

| From | Action | Result |
|---|---|---|
| Agency list (`/admin/agency`) | Click the pencil icon in a row's Actions column | Navigates to `/admin/agency/edit/{id}` with fields pre-populated |
| Any authenticated page | Direct URL `/admin/agency/edit/949` | Loads the same form — used throughout this run |

**Pre-fill timing.** 61 of 78 inputs were populated **within 1000 ms** of navigation. The form was read by polling at 250 ms intervals, never by one fixed-delay sample (`branch` reuse item R-2).

## 3. Structure

Eleven regions in rendered document order. Section names are the application's own headings except where noted.

| Region / Section | Type | Notes |
|---|---|---|
| Agency Master | Form fields | **Untitled in the UI**; sits under the `Update Agency` page heading |
| Agency Owner Details | Form fields | Contact person, Email ID, Phone Number — all mandatory |
| Upload Document | File upload + dates | One existing `.png` attached and displayed; Contract Start/End Date; `Add` for further rows |
| Agency Logo | File upload | Stored logo rendered as a preview; input restricted to `image/*` |
| Wonder Travel Sales Contact | Form fields + repeat | Name, Email ID, Phone Number, `Add`. **No `Designation`** |
| Bank Account Details | Form fields + repeat | Account Number, Account Type, Bank name, `Add` — all optional, all empty on this record |
| Payment settings | Form fields + checkbox group | Includes a `Payment terms` sub-heading, `Set target`, and the mandatory `Payment option *` group |
| Product Access Details | Checkboxes + **table** | `Select Product` (`Flight`, `Others`) above a five-column table |
| **Airline Supplier credential (PCC)** | Supplier tab + fields | **Present.** Renders only while a Product Access supplier row is selected — FINDING-008 |
| Agency Features | Checkbox group | `Import PNR Option`, `Transfer Pnr Option`, `Blue Command Screen` (disabled) — FINDING-012 |
| Remarks | Textarea | Mandatory (`Remarks *`); present on update, absent from create |
| Action bar | Buttons | `Cancel` · `Send For Approval` · `Approve` · `Reject` |

## 4. Interactive Elements

**No locator values are recorded here, deliberately** — `pipeline.md` §3.5 and `explorer-skill` §5.15 place selector acquisition in Stage `4A`, which verifies each locator live at the moment it generates the code that uses it. What follows is each control's accessible name, type and observed state, which is what this stage may record and what a test designer works from.

### 4.1 Agency Master

| Element | Type | Label | Required | State observed |
|---|---|---|---|---|
| Branch | PrimeNG dropdown | `Branch *` | yes | **`disabled` and `readOnly`**, showing `Test (BRN2)` — `PO-10` verified |
| Agency name | Text | `Agency *` | yes | `Test Egypt` |
| Country | Text, read-only | `Country *` | yes | `Egypt`, greyed — inherited, AC-1 satisfied |
| State | PrimeNG dropdown | `State *` | yes | `Cairo`, with a clear (×) affordance |
| City | PrimeNG dropdown | `City *` | yes | `Cairo`, with a clear (×) affordance |
| Post office box | Text | `Post office box *` | yes | `0022`; **max length 8, enforced against real keystrokes** |
| Company URL | Text | `Company URL` | no | `asdas`; max length 50; **no URL format validation** — FINDING-010 |
| Fax No | Text | `Fax No` | no | empty; max length 11; undocumented in US-4222 |
| Address 1 | Textarea | `Address *` | yes | `Cairo`; max length 250 |
| Address 2 | Textarea | `Address` | no | `down town`; max length 250 |
| Phone No | Tel | `Phone No *` | yes | `1149730331`, national number only, country flag selector beside it; max length 15 |
| IATA Agency | Radio pair | `yes` / `No` | — | `No` selected |
| Agency Business Type | Radio pair | `B2B` / `Freelancer` | — | `Freelancer` selected |

### 4.2 Agency Owner Details

| Element | Type | Label | Required | State observed |
|---|---|---|---|---|
| Contact person | Text | `Contact person *` | yes | `Essam Saady` |
| Email ID | Text | `Email ID *` | yes | `test.user.ndc@gmail.com`; max length 49; rejects a malformed address with `Please enter a valid email` |
| Phone Number | Tel | `Phone Number *` | yes | `1000000000`; max length 15 |

### 4.3 Upload Document · Agency Logo

| Element | Type | Required | State observed |
|---|---|---|---|
| Upload document | File input | yes | **No `accept` attribute** — any file type offered. An existing `screen-1-logo-black-and-white.png` is attached and displayed with a remove (×) control |
| Contract Start Date | PrimeNG calendar | yes | `05/07/2020` |
| Contract End Date | PrimeNG calendar | yes | `28/12/2030` |
| Add | Button | — | Adds a further document row |
| Upload logo | File input | yes | `accept="image/*"`. The stored logo renders as a preview with a remove (×) control |

**`PO-7` verified:** both the stored document and the stored logo are present when the Update form opens; neither had to be re-uploaded to open or edit the record.

### 4.4 Wonder Travel Sales Contact · Bank Account Details

| Element | Type | Label | Required | State observed |
|---|---|---|---|---|
| Name | Text | `Name *` | yes | `Essam`; max length 100 |
| Email ID | Text | `Email ID *` | yes | `ESaady@wondertravel-eg.com`; max length 49 |
| Phone Number | Tel | `Phone Number *` | yes | `540951737`; max length 15 |
| Add (sales contact) | Button | — | Adds a further sales-contact row |
| Account Number | Text | `Account Number` | no | empty; max length 20 |
| Account Type | PrimeNG dropdown | `Account Type` | no | `Select` (unset) |
| Bank name | Text | `Bank name` | no | empty; max length 49 |
| Add (bank account) | Button | — | Adds a further bank row |

**No `Designation` control exists** in the Sales Contact section, as run-001 recorded (FINDING-006).

### 4.5 Payment settings

| Element | Type | Label | Required | State observed |
|---|---|---|---|---|
| Invoice generation | PrimeNG dropdown | `Invoice generation *` | yes | `monthly` |
| Credit limit | Text (numeric) | `Credit limit *` | yes | `1000000`; max length 15; **discards alphabetic keystrokes silently** — FINDING-010 |
| Top up limit | Text (numeric) | `Top up limit *` | yes | `5000000`; max length 15 |
| Outstanding Threshold | Text | `Outstanding Threshold *` | yes | `5` — undocumented in US-4222, settled as a later enhancement (`PO`-confirmed, disposition row 4) |
| Target | Text | `Target` | no | empty; max length 15 |
| Month / Year | PrimeNG dropdowns | `Month` / `Year` | no | both `Select` |
| Set target | Button | — | — | Present |
| Credit Terms (Days) | Text (numeric) | `Credit Terms (Days) *` | yes | `1000`; **max length 11, enforced against real keystrokes** |
| Reaching Percentage | Text | `Reaching Percentage` | no | empty |
| Warning Prompt (Days) | Text | `Warning Prompt (Days)` | no | empty; max length 11 |
| Credit agency | Checkbox | `Credit agency` | no | unticked |
| Payment option | Checkbox group | `Payment option *` | yes | **29 options**; `Cash`, `Wallet`, `BANQUE MISR` ticked — FINDING-011 |

### 4.6 Product Access Details — a table, exactly as `PO-8` describes

| Select Product | State |
|---|---|
| `Flight` | ticked |
| `Others` | unticked |

| STATUS | SUPPLIER NAME | CREDENTIAL NAME | PRODUCT NAME | DESCRIPTION |
|---|---|---|---|---|
| ticked | `TravelportNdc` | *(empty)* | `Flight` | `fdf` (editable text input in-cell) |

`Enable Search Limit` renders below the PCC section as a separate ticked checkbox.

### 4.7 Airline Supplier credential (PCC) — present, conditional

| Element | Type | Label | Required | State observed |
|---|---|---|---|---|
| Supplier tab | Tab | `TravelportNdc` | — | One tab, named for the selected supplier |
| Generic supplier credentials (PCC) | PrimeNG multiselect | `Generic supplier credentials (PCC) *` | yes | `All (4 selected)` |
| Manager Name | Text | `Manager Name *` | yes | **read-only**, `live` — FINDING-009 |
| Supplier Credentials Description | Text | `Supplier Credentials Description *` | yes | `szds`, editable |

**The whole section disappears when the Product Access supplier row is deselected, and returns on reload.** This is the reconciliation for run-001's FINDING-002 — FINDING-008.

### 4.8 Agency Features · Remarks · Action bar

| Element | Type | State observed |
|---|---|---|
| Import PNR Option | Checkbox | ticked, enabled — US-4222 AC-10 |
| Transfer Pnr Option | Checkbox | ticked, enabled — undocumented |
| Blue Command Screen | Checkbox | unticked, **disabled**, hint *"This option requires the Galileo supplier to be enabled"* — FINDING-012 |
| Remarks | Textarea | `Remarks *`, mandatory, holding `QA TC23 - reactivating after test` — evidence that this shared record is used by other testers |
| Cancel | Button | Discards unsaved changes and returns to `/admin/agency` — `PO-6` verified |
| Send For Approval | Button | Present. The story says *"Submit for Approval"*; the application says `Send For Approval` (second confirmation of this label) |
| Approve · Reject | Buttons | Both visible to `odeysysadmin` on the maker form. Neither was clicked |

## 5. Validation behaviour observed (`PO-12`)

Captured through real interaction, never by assigning a value in script.

| Trigger | Field | Exact string rendered |
|---|---|---|
| Mandatory field cleared | `Agency *`, `Phone No *` | `Required` |
| Mandatory fields left empty on the create form | 20 fields plus the document upload | `Required` (23 instances) |
| No supplier selected | Product Access Details (section level) | `Please select at least one supplier.` |
| Malformed email | `Email ID *` | `Please enter a valid email` |
| Alphabetic into a numeric field | `Credit limit *` | **no message** — keystrokes discarded, previous value restored |
| Free text into a URL field | `Company URL` | **no message** — value accepted |

The full field-to-message map is in `evidence/run-004/phase_e_message_field_map.json`.

## 6. Observations recorded, not concluded

- The record's `Remarks` value and its `Company URL` of `asdas` show this is **shared data other testers act on**. Nothing about this record's contents is treated as a stable fixture.
- All non-GET traffic during every session of this run was `…/state/search` and `…/agency/search` — read calls. No create, update, approve or reject was performed.

## 7. Evidence

| File | What it holds |
|---|---|
| `evidence/run-004/run004_agency_update_form_fullpage.png` | The full form as loaded |
| `evidence/run-004/run004_update_form_unclear_items.png` / `.annotated.png` | Original and the five labelled rectangles `Q1`–`Q5` |
| `evidence/run-004/run004_pcc_section_present.png` | PCC section rendered |
| `evidence/run-004/run004_pcc_after_supplier_deselected.png` | The same page with the supplier row deselected |
| `evidence/run-004/phase_b_update_form_structure.json` | Full control inventory: labels, types, required, read-only, disabled, accept, max length |
| `evidence/run-004/phase_f_probes.json` | Every format and max-length probe with typed vs accepted values |
| `evidence/run-004/phase_g_cancel.json` | The Cancel non-persistence check |
| `evidence/run-004/phase_a_timeline.txt` | Raw session log behind `Timeline.md` |
