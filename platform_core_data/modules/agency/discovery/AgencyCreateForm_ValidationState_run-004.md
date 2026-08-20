# Discovery Snapshot — Agency Create Form, empty-submit validation state (run-004)

| Field | Value |
|---|---|
| Module | `agency` |
| Produced by run | `run-004__2026-08-17_14-35-25__UserStory__US-4222-UpdateAgency` |
| Revision | 1 |
| Screen / State | Add Agency — empty form, immediately after `Send For Approval` was clicked |
| URL / Route | `http://192.168.1.70/admin/agency/add` |
| Discovery Mode | Browser automation — **Browser Driver**, headed |
| Evidence Category | Direct Observation |
| Captured | 2026-08-18 09:59 (local) |
| Role / Credential used | `odeysysadmin` |

## 1. Why this state was captured

`PO-12` requires Stage 2 to capture the **exact displayed validation string**, punctuation and capitalisation included, through a valid interaction — because Stage 3 must design expected results from observed strings rather than from US-4222's older wording. On the update form only one field can be emptied at a time, which yields one message per probe. Submitting the **empty create form** renders every mandatory message at once, in one screenshot, with no record created.

**Why this is safe, stated explicitly:** with every mandatory field blank, client-side validation blocks the submission. The session recorded **zero non-GET requests** during and after the click, so nothing reached the server and no agency could have been created. Create Agency is in scope for run-004 as a means only (Project Context §2), and this interaction did not even exercise it — it exercised the form's validation and stopped there.

## 2. Structure differences from the Update form

| Difference | Create form | Update form |
|---|---|---|
| Action bar | `Cancel` · `Send For Approval` | `Cancel` · `Send For Approval` · **`Approve`** · **`Reject`** |
| `Remarks *` | **absent** | present and mandatory |
| `Outstanding Threshold *` | present, pre-filled `5` | present, `5` |
| `Enable Search Limit` | ticked, with a `Search Limit Category: A` chip | ticked |
| Airline Supplier credential (PCC) | **not rendered** — no supplier row can exist yet | rendered while a supplier row is selected |
| Branch | editable dropdown (`Select`) | disabled, showing the agency's branch |

The Approve/Reject asymmetry is the observable half of run-001's FINDING-007: the maker form for a *new* record offers no checker actions, while the update form offers both to the same identity.

## 3. Validation messages rendered

**23 × `Required`** and **1 × `Please select at least one supplier.`**, rendered as red list items (`rgb(220, 53, 69)`).

| Field carrying `Required` | Section |
|---|---|
| `Branch *` | Agency Master |
| `Agency *` | Agency Master |
| `Country *` | Agency Master |
| `State *` | Agency Master |
| `City *` | Agency Master |
| `Post office box *` | Agency Master |
| `Address *` | Agency Master |
| `Phone No *` | Agency Master |
| `Contact person *` | Agency Owner Details |
| `Email ID *` | Agency Owner Details |
| `Phone Number *` | Agency Owner Details |
| *(document upload)* | Upload Document |
| `Contract Start Date *` | Upload Document |
| `Contract End Date *` | Upload Document |
| *(logo upload)* | Agency Logo |
| `Name *` | Sales Contact |
| `Email ID *` | Sales Contact |
| `Phone Number *` | Sales Contact |
| `Invoice generation *` | Payment settings |
| `Credit limit *` | Payment settings |
| `Top up limit *` | Payment settings |
| `Credit Terms (Days) *` | Payment settings |
| `Payment option *` | Payment settings |

| Section-level message | Where |
|---|---|
| `Please select at least one supplier.` | Product Access Details |

**Not one field-specific message appears.** US-4222 specifies a distinct message per field (for example *"Please enter a valid Agency Name."*); the application renders the platform-wide `Required` from PRD XC-17 `[V]`. This is the second run to observe it — see `findings/ReCheck_run-004.md`, FINDING-001 row.

## 4. Evidence

| File | What it holds |
|---|---|
| `evidence/run-004/run004_create_form_empty.png` | The form before the submit attempt |
| `evidence/run-004/run004_create_form_validation_messages.png` | Every message rendered at once |
| `evidence/run-004/phase_d2_validation_messages.json` | The red-text node inventory, with computed colour and counts |
| `evidence/run-004/phase_e_message_field_map.json` | Field-to-message map |
| `evidence/run-004/phase_d_validation_messages.json` | The request log proving zero non-GET traffic |
