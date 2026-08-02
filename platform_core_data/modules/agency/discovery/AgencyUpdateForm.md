# Discovery Snapshot — Agency Update Form

| Field | Value |
|---|---|
| Module | `agency` |
| Produced by run | `run-001__2026-07-31_11-56-38__UserStory__US-4222UpdateAgency` |
| Revision | 1 |
| Screen / State | Update Agency — populated, editable, agency id 949 |
| URL / Route | `http://192.168.1.70/admin/agency/edit/949` (pattern: `/admin/agency/edit/{id}`) |
| Discovery Mode | Browser automation — **Browser Driver** (`platform_core/tools/browser_driver/`), headless |
| Evidence Category | Direct Observation |
| Captured | 2026-07-31 14:02–14:14 (local) |
| Role / Credential used | Super Admin (`odeysysadmin` — role only; no credential value recorded anywhere) |

## 1. Purpose

The screen US-4222 governs: it edits every attribute of an existing agency across ten sections, then routes the change through the platform's maker–checker approval workflow rather than publishing it on save. It is reached from the Agency list's row-level pencil icon and carries the page heading **`Update Agency`**.

## 2. Entry Points

| From | Action | Result |
|---|---|---|
| Agency list (`/admin/agency`) | Click the pencil icon in a grid row's Actions column | Navigates to `/admin/agency/edit/{id}` with every field pre-populated from that agency |
| Any authenticated page | Direct URL to `/admin/agency/edit/949` | Loads the same form — the route is directly addressable and was used repeatedly during this run |

## 3. Structure

Ten sections, in rendered document order. Section names are the application's own headings, except where noted.

| Region / Section | Type | Notes |
|---|---|---|
| Agency Master | Form fields | **Untitled in the UI** — it sits directly under the `Update Agency` page heading. US-4222 calls it "Agency Master"; the application gives it no heading of its own. |
| Agency Owner Details | Form fields | Three fields, all mandatory |
| Upload Document | File upload + dates | One file row (an existing `.png` attached), Contract Start/End Date, `Add` button for further rows |
| Agency Logo | File upload | Single logo input, restricted to `image/*` |
| Wonder Travel Sales Contact | Form fields + repeat | Three fields + `Add`. **No `Designation` field** — FINDING-006 |
| Bank Account Details | Form fields + repeat | Three fields, all optional, + `Add` |
| Payment settings | Form fields + checkbox group | Contains a `Payment terms` sub-label, the `Set target` control, and the `Payment option *` checkbox group — FINDING-003 |
| Product Access Details | Checkbox group + grid | `Select Product` checkboxes (Flight, Others) and a supplier/credential grid; plus `Enable Search Limit` |
| Agency Features | Checkbox group | `Import PNR Option` (AC-10), `Transfer Pnr Option`, `Blue Command Screen` — the last two undocumented |
| Remarks | Textarea | Mandatory (`Remarks *`), **present on update only, absent from the create form** — FINDING-005 |
| Action bar | Buttons | `Cancel` · `Send For Approval` · `Approve` · `Reject` |

**There is no Airline Supplier Credential (PCC) section.** AC-9 requires one; the form goes straight from Product Access Details to Agency Features. See FINDING-002.

## 4. Interactive Elements

**No locator values are recorded in this snapshot, deliberately.** `pipeline.md` §3.5 and `explorer-skill` §5.15 place selector and DOM acquisition outside this stage entirely — locators are acquired and verified live by Stage `4A` at the moment code is generated, so a selector captured here would be a selector verified against a possibly-older build. What this table records instead is each control's **accessible name and type**, which is what §5.15 permits and what a manual tester works from. The `Locator` column is retained from the template and marked accordingly rather than filled with CSS.

Section headings below correspond to §3. `*` reproduces the application's own mandatory marker.

| Element | Type | Label / Accessible Name | Locator | Required? | Notes |
|---|---|---|---|---|---|
| Branch | Custom dropdown | `Branch *` | out of scope — §3.5 | yes | Value observed: `Test (BRN2)`. Changing it may re-inherit and overwrite inherited values — Project Context ASM-016, untested |
| Agency name | Text | `Agency *` | out of scope — §3.5 | yes | Story calls this "Agency Name"; app label is `Agency` |
| Country | Text, **read-only** | `Country *` | out of scope — §3.5 | yes | Confirmed `readOnly`, rendered greyed. Value `Egypt`. **AC-1 satisfied** |
| State | Custom dropdown | `State *` | out of scope — §3.5 | yes | Value `Cairo`; offers a clear (×) affordance |
| City | Custom dropdown | `City *` | out of scope — §3.5 | yes | Value `Cairo`; offers a clear (×) affordance |
| Post office box | Text | `Post office box *` | out of scope — §3.5 | yes | Value `0022` |
| Company URL | Text | `Company URL` | out of scope — §3.5 | no | Value `asdas` — not a URL; see §5 |
| Fax No | Text | `Fax No` | out of scope — §3.5 | no | **Not in US-4222** — FINDING-005 |
| Address 1 | Textarea | `Address *` | out of scope — §3.5 | yes | Value `Cairo` |
| Address 2 | Textarea | `Address` | out of scope — §3.5 | no | Value `down town`. Both address fields share the label `Address` |
| Phone No | Tel + country selector | `Phone No *` | out of scope — §3.5 | yes | Egypt flag + `1149730331` |
| IATA Agency | Radio group | `IATA Agency` → `yes` / `No` | out of scope — §3.5 | no | Rendered **after** Phone/Address, not after City as AC-1 orders it |
| Agency Business Type | Radio group | `Agency Business Type` → `B2B` / `Freelancer` | out of scope — §3.5 | no | **Not in US-4222** — FINDING-005 |
| Contact person | Text | `Contact person *` | out of scope — §3.5 | yes | Value `Essam Saady` |
| Owner Email ID | Text | `Email ID *` | out of scope — §3.5 | yes | Value `test.user.ndc@gmail.com` |
| Owner Phone Number | Tel + country selector | `Phone Number *` | out of scope — §3.5 | yes | Value `1000000000` |
| Document upload | File input | `Upload document *` | out of scope — §3.5 | yes | **No `accept` attribute**; `multiple=false`. Attached: `screen-1-logo-black-and-white.png` — FINDING-004 |
| Contract Start Date | Text (calendar) | `Contract Start Date *` | out of scope — §3.5 | yes | Value `05/07/2020` — `dd/mm/yyyy` |
| Contract End Date | Text (calendar) | `Contract End Date *` | out of scope — §3.5 | yes | Value `28/12/2030` |
| Add document row | Button | `Add` | out of scope — §3.5 | — | Presumed the mechanism for AC-3's "multiple documents"; not executed |
| Logo upload | File input | `Upload logo *` | out of scope — §3.5 | yes | `accept="image/*"`, `multiple=false` |
| Sales Name | Text | `Name *` | out of scope — §3.5 | yes | Value `Essam` |
| Sales Email ID | Text | `Email ID *` | out of scope — §3.5 | yes | Value `ESaady@wondertravel-eg.com` |
| Sales Phone Number | Tel + country selector | `Phone Number *` | out of scope — §3.5 | yes | Value `540951737` |
| Add sales contact | Button | `Add` | out of scope — §3.5 | — | AC-5's "multiple Sales personnel"; not executed |
| Account Number | Text | `Account Number` | out of scope — §3.5 | no | Empty |
| Account Type | Custom dropdown | `Account Type` | out of scope — §3.5 | no | Value `Select` (unset) |
| Bank name | Text | `Bank name` | out of scope — §3.5 | no | Empty; rendered no validation message when cleared — consistent with optional |
| Add bank account | Button | `Add` | out of scope — §3.5 | — | AC-6's "multiple bank accounts"; not executed |
| Invoice generation | Custom dropdown | `Invoice generation *` | out of scope — §3.5 | yes | Value `monthly` |
| Credit limit | Text | `Credit limit *` | out of scope — §3.5 | yes | Value `1000000` |
| Top up limit | Text | `Top up limit *` | out of scope — §3.5 | yes | — |
| Outstanding Threshold | Text | `Outstanding Threshold *` | out of scope — §3.5 | **yes** | **Not in US-4222, and mandatory** — FINDING-005. Value `5` |
| Target | Text | `Target` | out of scope — §3.5 | no | Empty |
| Month | Custom dropdown | `Month` | out of scope — §3.5 | no | Value `Select`. Story calls it "Set Month" |
| Year | Custom dropdown | `Year` | out of scope — §3.5 | no | Value `Select`. Story calls it "Set Year" |
| Set target | Button | `Set target +` | out of scope — §3.5 | — | Groups Target/Month/Year into a repeatable entry; not executed |
| Credit Terms (Days) | Text | `Credit Terms (Days) *` | out of scope — §3.5 | yes | Value `1000` |
| Reaching Percentage | Text | `Reaching Percentage` | out of scope — §3.5 | no | Empty |
| Warning Prompt (Days) | Text | `Warning Prompt (Days)` | out of scope — §3.5 | no | Empty |
| Credit agency | Checkbox | `Credit agency` | out of scope — §3.5 | no | Unchecked |
| Payment option | Checkbox group | `Payment option *` | out of scope — §3.5 | yes | **28 entries, 23 of them junk** — FINDING-003. Checked: Cash, Wallet, BANQUE MISR, Fawry |
| Select Product | Checkbox group | `Select Product` → `Flight` / `Others` | out of scope — §3.5 | no marker | Both checked. Story marks `Product` Mandatory; app shows no `*` |
| Product access grid | Grid | columns `STATUS · SUPPLIER NAME · CREDENTIAL NAME · PRODUCT NAME · DESCRIPTION` | out of scope — §3.5 | no marker | Rows: `SalamAir / Salam Air Live / Flight`, `FlyNas / fly nas cred / Flight`. `DESCRIPTION` on row 1 contains `sad` |
| Enable Search Limit | Checkbox | `Enable Search Limit` | out of scope — §3.5 | no | **Not in US-4222** — FINDING-005 |
| Import PNR Option | Checkbox | `Import PNR Option` | out of scope — §3.5 | no | **AC-10.** Rendered as a checkbox, not a toggle/switch as the story's "toggle" wording implies |
| Transfer Pnr Option | Checkbox | `Transfer Pnr Option` | out of scope — §3.5 | no | **Not in US-4222** — FINDING-005 |
| Blue Command Screen | Checkbox | `Blue Command Screen` | out of scope — §3.5 | no | **Not in US-4222.** Carries in-app note: *"This option requires the Galileo supplier to be enabled"* |
| Remarks | Textarea | `Remarks *` | out of scope — §3.5 | **yes** | **Not in US-4222, mandatory, update-only** — FINDING-005 |
| Cancel | Button | `Cancel` | out of scope — §3.5 | — | Discard behaviour not executed |
| Send For Approval | Button | `Send For Approval` | out of scope — §3.5 | — | Story names this `Submit for Approval` — FINDING-007 |
| Approve | Button | `Approve` | out of scope — §3.5 | — | Visible and enabled to this account — FINDING-007 |
| Reject | Button | `Reject` | out of scope — §3.5 | — | Visible and enabled to this account — FINDING-007 |

**Totals as counted mechanically:** 74 form fields, 2 file inputs, 35 `<input type=checkbox>`, 4 visible radios, 0 `<select>`, 0 `<table>` at first load. Every dropdown is a custom component rendering as a div, and the Product Access grid is not a `<table>` — which is why plain DOM inspection under-reported this form and the rendered-text reading in §5 was used instead.

## 5. Observed Validation & Business Rules

| Field / Action | Observed Behaviour | Trigger | Finding ID (if raised) |
|---|---|---|---|
| `Agency *` | Red border + message `Required` beneath the field | Clear the field, then blur | FINDING-001 |
| `Post office box *` | Message `Required` | Clear, blur | FINDING-001 |
| `Contact person *` | Message `Required` | Clear, blur | FINDING-001 |
| `Credit limit *` | Message `Required` | Clear, blur | FINDING-001 |
| `Bank name` (optional) | **No message rendered** | Clear, blur | — (control observation: confirms `Required` is tied to mandatory status, not shown indiscriminately) |
| `Country *` | Not editable — `readOnly`, rendered greyed | Attempt focus/edit | — (**AC-1 confirmed**) |
| `Company URL` | Holds the value `asdas`, which is not a URL | Read existing data | — (see note below) |

**On `Company URL` holding `asdas`.** This is recorded as an observation, not a Finding, and the distinction is deliberate: it shows only that *stored* data is not URL-shaped. Whether the field validates URL format **on input** was not tested, because doing so requires typing and submitting — a save. AC-1 marks the field Optional with the message `"Please enter a valid URL."`, so it is a legitimate Stage 4M case; the existing value is a hint that validation may be absent, and nothing more. Treating it as evidence of missing validation would be exactly the inference this stage must not make.

## 6. States Observed

| State | How Reached | What Differs |
|---|---|---|
| Populated / editable | Open any agency from the list | The state described throughout this snapshot |
| Field-level invalid | Clear a mandatory field and blur | Red border + `Required` beneath the offending field; the rest of the form is unaffected and no banner appears |

**States not observed, each requiring a save this stage does not perform:** post-submit `Pending for approval`, post-approve, post-reject, and any server-side validation state. All four belong to Stage 4M.

## 7. System Responses

| Type | Observation |
|---|---|
| Network | 136 events captured across the session; **0 responses with status ≥ 400**. No 4xx or 5xx at any point, on any screen |
| Console | **Clean — 0 messages** of any type across the whole session, including during the validation probes |
| Redirect | None on this route. `/admin/agency/edit/949` loads directly, including on direct URL entry with an established session |

## 8. Evidence Captured

| Evidence | Path |
|---|---|
| Full-page screenshot of the entire form | `evidence/agency_update_form_fullpage.png` |
| Complete rendered text (the section/field inventory this snapshot is built from) | `findings/FINDING-002_MissingPccSection/section_inventory.txt` |
| Agency Master section | `findings/FINDING-005_UndocumentedMandatoryFields/agency_master_section.png` |
| Payment settings section | `findings/FINDING-005_UndocumentedMandatoryFields/payment_settings_section.png` |
| Payment option group (all 28 entries legible) | `findings/FINDING-003_PaymentOptionDataPollution/payment_options_focused.png` |
| Product Access Details section | `findings/FINDING-002_MissingPccSection/product_access_section.png` |
| Agency Features section | `findings/FINDING-002_MissingPccSection/agency_features_section.png` |
| Sales Contact section | `findings/FINDING-006_MissingDesignationField/sales_contact_section.png` |
| Upload Document section | `findings/FINDING-004_NonPdfDocumentAttached/upload_document_section.png` |
| Validation state — `Agency` cleared, `Required` rendered | `findings/FINDING-001_ValidationMessageMismatch/required_message_on_cleared_agency_name.png` |
| Action buttons at the foot of the form | `findings/FINDING-007_ApprovalControlsOnMakerForm/action_buttons_bottom_of_form.png` |
| App-marked mandatory field list (23 fields) | `findings/FINDING-005_UndocumentedMandatoryFields/mandatory_fields_as_marked_by_app.txt` |
| Session console + network summary | `evidence/session_console.log`, `evidence/session_network_summary.txt` |

## 9. Not Captured

| Missing Item | Reason |
|---|---|
| Selector / locator catalogue | **Deliberately out of scope** — `pipeline.md` §3.5, `explorer-skill` §5.15. Locators are acquired and verified live by Stage `4A` against the build they will run on. Not a capture failure |
| DOM snapshot | Same reason. No Finding here needed DOM state as its evidence; each is fully evidenced by screenshot plus rendered text |
| Console log per Finding | The session emitted **zero** console messages, so there is nothing to attach. Recorded once in `evidence/session_console.log` rather than as an empty file in seven packages |
| Video recording | No Finding in this run touches Navigation, which is the one category §5.11 requires video for |
| Post-save states (`Pending for approval`, approved, rejected) | Requires submitting a live agency record. Deliberately not performed — this stage does not draw on the run's Agency-mutation authorization; Stage 4M does, under a designed case with a recorded pre-edit state |
| Server-side validation behaviour | Same reason — only client-side, on-blur validation was observed |
| Values available in each custom dropdown | Would require opening each dropdown; not needed for a behavioural inventory, and the option sets belong to the master-data modules that own them (`branch`, `master-geography`, `payment-gateway`) |

## 10. Findings Raised From This Screen

| Finding ID | Category | Severity |
|---|---|---|
| FINDING-001 | Requirement Gap | N/A |
| FINDING-002 | Requirement Gap | N/A |
| FINDING-003 | Observation | N/A |
| FINDING-004 | Observation | N/A |
| FINDING-005 | Requirement Gap | N/A |
| FINDING-006 | Requirement Gap | N/A |
| FINDING-007 | Test Gap | N/A |
