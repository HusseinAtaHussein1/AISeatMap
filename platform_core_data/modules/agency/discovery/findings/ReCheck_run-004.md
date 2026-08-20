# Re-check of run-001's Findings — run-004, 2026-08-18

| Field | Value |
|---|---|
| Module | `agency` |
| Performed by run | `run-004__2026-08-17_14-35-25__UserStory__US-4222-UpdateAgency` |
| Against | run-001's FINDING-001 … FINDING-007 |
| Discovery Mode | Browser automation — **Browser Driver**, headed |
| Evidence Category | Direct Observation |
| Record observed | Agency **949** (`Test Egypt`, AGN2), `/admin/agency/edit/949` — the same record run-001 observed |

## Why this file exists, and what it deliberately does not do

run-004 is an independent run. It **does not edit run-001's Finding packages** — their `metadata.md` files, their evidence, and their recorded dispositions are left exactly as run-001 wrote them and as the reviewer approved them. What changes between two runs is not a previous run's record; it is what is true now. This file is that record.

Where a re-check produced materially new information, run-004 raised its **own** Finding (FINDING-008 … FINDING-012) rather than amending run-001's. Where it produced no new information, that is stated plainly here and no Finding was created, because a re-observation that changes nothing is a result, not a defect.

## The seven, re-checked

| run-001 Finding | Re-check outcome on 2026-08-18 | Evidence | Consequence |
|---|---|---|---|
| **FINDING-001** — mandatory violations render `Required`, not US-4222's per-field messages | **Still true, and now measured precisely.** An empty create form submitted for approval produced **23 × `Required`** (exact string, capital R, no full stop) plus one section-level message, **`Please select at least one supplier.`** (with full stop). One per-field format message does exist and matches the PRD exactly: **`Please enter a valid email`** (XC-18 `[V]`). | `../evidence/run-004/run004_create_form_validation_messages.png`, `phase_d2_validation_messages.json`, `phase_e_message_field_map.json` | Disposition unchanged (`Story Outdated — PRD-corroborated`). Stage 3 now has the **exact strings and the field-to-message map** required by `PO-12`, instead of a description of them. |
| **FINDING-002** — AC-9's PCC section absent from both forms | **Contradicted.** The `Airline Supplier credential (PCC)` section is present on the update form, with three controls. It is **conditionally rendered** — deselecting the Product Access supplier row removes it entirely. | **FINDING-008** (own package, with the dependency probe) | The disposition `Possible Application Defect / Possible Removed Feature` **narrows** from the whole section to the two absent PCC fields and the three filters. This is the single most consequential change this run makes to Stage 3's inputs. |
| **FINDING-003** — Payment option list carries person names and single letters | **Still true, count moved 28 → 29** with no action by this run. Pre-disposed by knowledge item `APP-002` (`branch` reuse R-9): the list reflects Master → Payment Gateway → Payment Method, and its size is intended cross-module reflection. | **FINDING-011** (own package, annotated) | Not re-raised as an application defect. Stage 3 must select payment options **by label** and never assert a count — the count is demonstrably volatile. |
| **FINDING-004** — document upload applies no file-type restriction | **Still true.** The document input declares **no `accept` attribute**; the logo input declares `accept="image/*"`. The attached document on record 949 is still a `.png` (`screen-1-logo-black-and-white.png`), where AC-3 requires PDF. | `../evidence/run-004/phase_b_update_form_structure.json` (control 18 vs control 21) | Disposition unchanged — `Application Defect (candidate)`, row 5. No new Finding: run-004 observed exactly what run-001 observed, with no new dimension. |
| **FINDING-005** — seven undocumented fields, two mandatory | **Still true**, and confirmed field-by-field: `Fax No`, `Outstanding Threshold *`, `Reaching Percentage`, `Warning Prompt (Days)`, `Enable Search Limit`, `Transfer Pnr Option`, `Blue Command Screen`, plus mandatory `Remarks *`. Two facts are new: `Blue Command Screen` is **disabled**, and it states its own dependency inline. | **FINDING-012** for the new facts; `../evidence/run-004/phase_b_update_form_structure.json` for the rest | `Outstanding Threshold` stays settled by the product owner (row 4). The two new facts are raised separately rather than appended to run-001's package. |
| **FINDING-006** — AC-5's `Designation` dropdown absent from Sales Contact | **Still true.** The section renders `Name *`, `Email ID *`, `Phone Number *` and an `Add` button. No Designation control exists. | `../evidence/run-004/run004_agency_update_form_fullpage.png`, `phase_b_update_form_structure.json` | Disposition unchanged (row 2). No new Finding. |
| **FINDING-007** — segregation of duties unassessable; one identity sees Approve and Reject | **Still true, and now scoped out by decision rather than by circumstance.** The update form shows `Cancel · Send For Approval · Approve · Reject`; the create form shows only `Cancel · Send For Approval`. `PO-1`, `PO-6` and `PO-9` remove role authorization from run-004 entirely. | `../evidence/run-004/run004_agency_update_form_fullpage.png`, `run004_create_form_empty.png` | The coverage gap is unchanged but is now a **declared exclusion** owned by the future Role CRUD module, not an open risk in this run. The `Send For Approval` label is confirmed for the second time (row 1). |

## What the re-check confirms about the application (nothing new was needed here)

These were checked because the Project Context's product-owner decisions require this stage to observe them rather than assume them (`PO-7`, `PO-8`, `PO-10`, `PO-12`, and `branch` reuse R-2). Each held, so none produced a Finding:

| Decision | Observed |
|---|---|
| `PO-7` — existing documents and logo persist on Update | **Holds.** `screen-1-logo-black-and-white.png` is attached and shown on load, and the Agency Logo preview renders a stored image. Neither required re-upload to open or edit the form. |
| `PO-8` — Product Access renders as a table | **Holds exactly.** Columns `STATUS · SUPPLIER NAME · CREDENTIAL NAME · PRODUCT NAME · DESCRIPTION`; one row, `TravelportNdc` / `Flight`; products chosen by the `Select Product` checkboxes `Flight` and `Others`. |
| `PO-10` — Branch is not changeable from inside Agency Update | **Holds.** The Branch control is `disabled` and `readOnly`, displaying `Test (BRN2)`. No attempt was made to change it. |
| `PO-6` — Cancel discards unsaved changes and exits | **Holds.** `Company URL` was changed in-form from `asdas` to `run004-cancel-probe`, `Cancel` was clicked, the browser returned to `/admin/agency`, and reopening the record showed `asdas`. Nothing persisted. |
| `branch` reuse **R-2** — read a pre-filled Update form by polling | **Vindicated.** 61 of 78 inputs were populated within 1000 ms of navigation. A single early sample would have read the form as empty and produced a false high-severity "Update form does not pre-fill" Finding, exactly as it did on `branch`. |
| `branch` reuse **R-1** — probe max length with real keystrokes | **Vindicated.** `Post office box *` kept 8 of 12 typed characters and `Credit Terms (Days) *` kept 11 of 15 — caps enforced, and observable only because the probe typed rather than assigned. |

## Safety record for this re-check

Every action above was a read or an in-form edit that was reverted without saving. **No Agency record was created, updated, approved, or rejected.** The only non-GET requests the session issued were `…/Master2/state/search` and `…/Admin2/agency/search` — both read operations. The empty create form was submitted once to elicit validation messages; it produced **zero** non-GET requests, so no record could have been created by it.
