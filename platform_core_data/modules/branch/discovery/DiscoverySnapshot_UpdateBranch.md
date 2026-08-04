# Discovery Snapshot — Update Branch

| Field | Value |
|---|---|
| Module | `branch` |
| Produced by run | `run-003__2026-08-04_11-24-38__UserStory__US-8599-SearchActions_US-8606-UpdateBranch` |
| Revision | 1 |
| Screen / State | Update Branch (edit an existing Branch) |
| URL / Route | `http://192.168.1.70/admin/branch/edit/{BranchCode}` — observed against `BRN2` |
| Discovery Mode | Browser automation — **Browser Driver** |
| Evidence Category | Direct Observation |
| Captured | 2026-08-04 |
| Role / Credential used | Super Admin (`odeysysadmin`) |

> **Observation was strictly read-only.** `BRN2` is a pre-existing record, which this run's authorization forbids mutating. The screen was opened and inspected; **nothing was typed and nothing was submitted.** Reading a pre-filled form is not a mutation.

## 1. Purpose

The form through which a System Administrator updates an existing Branch — the screen US 8606 describes, and the destination of US 8599's edit-pen action.

## 2. Entry Point

| From | Action | Result |
|---|---|---|
| Search Branch grid | Click a row's edit pen (`pi-pencil`) | Navigates to `/admin/branch/edit/{BranchCode}` — the code appears in the URL, so a branch is addressable directly by its code |

## 3. Section structure — observed

| # | Section heading (live) |
|---|---|
| 1 | `Branch Details (BRN2)` — the branch code is interpolated into the heading |
| 2 | `Branch Email Config Info` |
| 3 | `Branch Contact Info` |
| 4 | `Payment Option *` |
| 5 | `Product Access Details` |
| 6 | `NDCGal` (the supplier-credential sub-grid for the assigned supplier) |

Compared with US 8606's five named groups, the live screen matches Branch Details / Email Config / Contact Info / Product Access, surfaces **Payment Option** as its own section rather than inside "Branch Sales Configuration", and adds a supplier-specific sub-grid. No section named "Branch Sales Configuration" appears as a heading, though every field US 8606 lists under it is present.

## 4. Pre-fill fidelity — CONFIRMED WORKING

**This was initially mis-read, and the correction matters.** An early sample taken at a fixed delay after the edit-pen click reported State, City, Name, Post Office Box, Credit Limit and Email Password as empty — which would have been a high-severity pre-fill defect. Polling instead of sampling showed the opposite:

| Probe | Result |
|---|---|
| Attempt 1, fresh navigation, polled t=500ms → 18,000ms | **10/10 fields populated at t=500ms**, stable at every subsequent sample |
| Attempt 2, fresh navigation, polled identically | **10/10 populated at t=500ms**, stable |
| After a hard reload of the edit URL | **10/10 populated** |

Fields verified populated: `Operating country`, `Country`, `State` (dropdown label), `City` (dropdown label), `Name`, `Post Office Box`, `Credit Limit`, `Outstanding Threshold`, `Email ID`, `Email Password`.

**Conclusion: pre-fill works, including the State and City cascading dropdowns.** The earlier empty reading was a sampling artifact — the snapshot ran before the edit screen had rendered. No Finding is published for it.

> **Hand-off consequence for Stage `4M` / any later automation:** the Update screen must be gated on an explicit readiness signal (a known field becoming non-empty), **not** a fixed sleep. A fixed delay produced a false "form is empty" read twice in this run. This is recorded in the QA Assessment Report's Inputs for Test Design.

## 5. Field inventory — 61 labelled fields observed

Selected fields, with the US 8606 acceptance criteria they correspond to:

| Live label | Element id | Type | Notes |
|---|---|---|---|
| `Operating country` | `id-Operatingcountry` | text/dropdown | Populated |
| `Name *` | `id-Name` | text | Populated |
| `Country *` | `id-Country` | text/dropdown | Populated |
| `State *` | `id-State` | `p-dropdown` | Populated |
| `City *` | `id-City` | `p-dropdown` | Populated |
| `Address 1 *` / `Address 2` | `id-Address1` / `id-Address2` | — | Labels present; ids do not resolve to a plain input (custom widget) |
| `Post Office Box *` | `id-PostOfficeBox` | text | Populated |
| `Phone Number *` | `id-PhoneNumber` | — | Label present; composite country-code + number widget |
| `Service Tax Number` / `ABTA Number` | `id-ServiceTaxNumber` / `id-ABTANumber` | text | Present, empty on this record |
| `Email ID *` | `id-EmailID` | text | Populated |
| `Email Password *` | `id-EmailPassword` | **`type="password"`** | Populated — **see FINDING-013** |
| `Enter Target Amount` / `Set Month` / `Set Year` | `id-EnterTargetAmount` etc. | text | Present, empty |
| `Credit Limit *` / `Top Up Limit *` / `Credit Terms(Days) *` | — | text | Populated |
| `Reaching Percentage` / `Warning Prompt(Days)` | — | text | Populated |
| `Outstanding Threshold *` | `id-OutstandingThreshold` | text | Populated — US 51489 §2's field (FINDING-010) |
| `Flight` / `Others` | `id--Flight` / `id--Others` | checkbox | `Flight` checked, `Others` unchecked; **both user-editable** (consistent with FINDING-006) |
| `Generic supplier credentials (PCC) *` / `Manager Name *` / `Description *` | — | text | Present under the `NDCGal` sub-grid |
| `Import PNR` | `id--ImportPNR` | checkbox | **Checked** on this record — see §6 |
| `Remarks *` | label `for="id-Remarks"` (does not resolve) | **`textarea`** | Present as a mandatory-marked textarea. The label's `for` attribute points at an id no element carries — a minor a11y defect (label not programmatically associated) |

## 6. RISK-BR-5 — do the Create-screen dispositions extend to Update?

This was the run's highest-value question. Answered directly, per field:

| US 8606 acceptance criterion | Create-screen disposition (2026-08-03) | **Observed on Update** | Verdict |
|---|---|---|---|
| PAN Number (Optional) | FINDING-008 — absent, "ignore" per module owner | **Absent** | Disposition **extends**. Same absence, same screen family |
| Department multi-select (Mandatory) | FINDING-009 — absent, "ignore" per module owner | **Absent** | Disposition **extends** |
| "If Credit Card is selected, a Payment Gateway dropdown shall appear as mandatory" | FINDING-007 — no such dropdown; "US Gap because the US is old" | **`Credit Card` is checked on this record, and no Payment Gateway control exists anywhere on the screen** | Disposition **extends**, and this is a *stronger* test than Create's: on Create the condition had to be triggered; here the triggering state is already saved and the dropdown still does not appear |
| "The Import PNR checkbox is always checked" | FINDING-005 — unchecked by default on a fresh Create form; confirmed intended | **Checked** on this record | **Does not transfer.** This is a saved record's stored value, not a default. Update legitimately shows what was saved; it says nothing about the Create default. Recorded as not-comparable rather than as agreement |

**Three of the four dispositions are confirmed to extend to the Update screen on direct evidence.** The fourth (Import PNR) is not a contradiction — it is a category error to compare a stored value against a default, and it is reported as such rather than forced into an answer.

## 7. Buttons & Actions — observed

Buttons present on the Update screen for an **Approved** record:

`Add` · `Add` · `Change Threshold` · `Cancel` · `Reject` · `Approve` · `Send For Approval`

| US 8606 requires | Live | Status |
|---|---|---|
| Submit for Approval | **`Send For Approval`** | Label mismatch — same condition as FINDING-011, now observed on a second screen (occurrence appended, not a new Finding) |
| Approve | `Approve` | Present |
| Reject | `Reject` | Present |
| Cancel | `Cancel` | Present |
| Mandatory Remarks before any action | `Remarks *` textarea present | Present; **enforcement not tested** — verifying that an action is blocked without Remarks requires performing the action |

**`Change Threshold`** is an additional control US 8606 does not name. It corresponds to US 51489 §4's Branch Threshold Update confirmation flow (already in scope per ProjectContext §2). Its popup behaviour was **not** exercised — doing so on a pre-existing branch would risk mutating it.

**Note on action availability:** `Approve` and `Reject` are both rendered on the form even though this record is already `Approved` — which differs from the grid, where an Approved row offers only thumbs-down. Whether the form-level buttons are enforced server-side or are simply always rendered is **not established**; it is a discrepancy between two surfaces of the same workflow and is recorded as an Open Question.

## 8. Not covered, and why

| Area | Why |
|---|---|
| Saving any change | `BRN2` is pre-existing; this run may not mutate it |
| Remarks mandatory-enforcement | Requires attempting an action |
| `Change Threshold` popup | Requires interacting with a pre-existing branch's threshold |
| Field-level validation on Update (max lengths, cross-field Warning-Prompt-vs-Credit-Terms) | Requires typing into a pre-existing record's form. Belongs to Stage `4M` against a self-created record |
