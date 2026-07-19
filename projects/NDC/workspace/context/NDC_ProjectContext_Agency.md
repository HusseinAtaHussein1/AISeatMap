# NDC — Project Context — Agency (Create · Search · Update · Actions)

**Run:** RUN-20260718-001 · **Status:** `Pending` (checkpoint open per `pipeline/pipeline.md` §5.3 — awaiting Human Review) · **Produced by:** Project Context Agent (Stage 1) · **Date:** 2026-07-18
**Run Scope:** Type = User Story · Source = Pasted text — four jointly-scoped User Stories: **Create Agency**, **Search Agency**, **Agency Actions** (Edit/Approve/Reject/Status), **Update Agency**.

> **Single living document, not a version sequence.** Per explicit user instruction (2026-07-18), this project no longer mints a new numbered version (`v4`, `v5`, …) for every incremental addition to the same scope — this file **is** the current Project Context for the Agency entity's CRUD lifecycle, and gets extended/edited in place as more Agency-related User Stories arrive. It replaces what would otherwise have been separately-numbered `NDC_ProjectContext.v4.md` (Create Agency) and `.v5.md` (Search/Actions/Update) drafts — both folded into this one file instead.
>
> **Approval workflow:** this file lives under `runs/RUN-20260718-001/context/` while still `Pending`. Per explicit user instruction, once approved it moves to `projects/NDC/workspace/context/NDC_ProjectContext_Agency.md` — the project's canonical "current approved" location (consistent with `v1`/`v2`/`v3`'s existing home there) — not to be confused with this run-scoped draft copy.
>
> **Relationship to other Project Context documents:** `v1` (Credential Routes Filter/Airport/Supplier Credentials/Airline), `v2` (Login/Authentication), and `v3`'s **Branch** and **Staff** sections are untouched, unrelated, and remain fully authoritative under their own existing files. Only `v3`'s **Agency List/Search** portion (Observation-derived, no User Story at the time) is superseded — by this document's §2.2 Search Agency section, now AC-backed. A fifth, unrelated User Story (WT1-T2919, E-Ticket Agency Branding) is **out of scope here** — it touches the E-Ticket/Booking Confirmation screens, not Agency CRUD, and gets its own separately-named document, `NDC_ProjectContext_ETicketBranding.md` ("Track B"), per the user-confirmed track split.

---

## 1. Scope Summary

This document covers the full **Admin → Agency** CRUD lifecycle across four jointly-scoped User Stories:

1. **Create Agency** — the Add Agency form's full field-level Acceptance Criteria (Agency Master, Owner Details, Documents, Logo, Sales Contact, Bank Accounts, Payment Settings, Product Access, Airline Supplier Credential PCC, Import PNR toggle, submission workflow).
2. **Search Agency** — a dedicated search screen (Agency Code, Agency Name, State, City, Status) for locating existing Agency records.
3. **Agency Actions** — grid-level actions on the Search/List results: Edit (pen icon → Update Agency) and Approve/Reject (buttons shown only for Pending-approval agencies, each requiring a mandatory remark), plus the grid's Active/Inactive + Approval Status reflection rules.
4. **Update Agency** — an edit form with the *same field set and validation rules as Create Agency*, reached via Agency Actions' Edit action, with its own Submit for Approval / Cancel / Approve / Reject workflow.

Per the User Story Run Scope strategy (`agents/test_design_agent.md` §16), test design stays narrow to what these four stories state — Update Agency's field-level validation is not re-derived from scratch (cited from Create Agency's own test cases via the Regression Impact dimension, §17), and this document does not wander into WT1-T2919's E-Ticket scope (Track B).

## 2. Modules In Scope

### 2.1 Create Agency — Agency Master Section

| Req. ID | Field | Validation | Error Msg | Field Type | Status |
|---|---|---|---|---|---|
| FR-AGCRT-MASTER-01 | Branch | Select a Branch from a pre-populated list | "Please select a valid Branch." | Drop Down | Mandatory |
| FR-AGCRT-MASTER-02 | Agency Name | Must not be blank; special characters allowed | "Please enter a valid Agency Name." | Text Input | Mandatory |
| FR-AGCRT-MASTER-03 | Country | Inherited when a branch is selected | N/A | Read Only | Mandatory |
| FR-AGCRT-MASTER-04 | State | Select a State from a pre-populated list | "Please select a valid State." | Drop Down | Mandatory |
| FR-AGCRT-MASTER-05 | City | Select a City from a pre-populated list | "Please select a valid City Name." | Drop Down | Mandatory |
| FR-AGCRT-MASTER-06 | IATA Agency | Yes or No | N/A | Radio Button | Optional |
| FR-AGCRT-MASTER-07 | Post Office Box | Must not be blank | "Please enter a valid City Post Office." | Numeric Input | Mandatory |
| FR-AGCRT-MASTER-08 | Company URL | Special characters allowed | "Please enter a valid URL." | URL | Optional |
| FR-AGCRT-MASTER-09 | Phone no. | Must not be blank. **Confirmed 2026-07-18: no `+` country-code prefix required — national number only** (`knowledge_base/business_rules/BR-005.md`) | "Please enter a valid phone no.." | Numeric Input | Mandatory |
| FR-AGCRT-MASTER-10 | Address 1 | Must not be blank | "Please enter a valid Address." | Text & Numeric Input | Mandatory |
| FR-AGCRT-MASTER-11 | Address 2 | N/A | N/A | Text & Numeric Input | Optional |

### 2.1.2 Create Agency — Agency Owner Details Section

| Req. ID | Field | Validation | Error Msg | Field Type | Status |
|---|---|---|---|---|---|
| FR-AGCRT-OWNER-01 | Contact Person | Only-characters validation | "Please enter a valid Name." | Text Input | Mandatory |
| FR-AGCRT-OWNER-02 | Email ID | Special characters allowed | "Please enter a valid email." | Char & Special Char | Mandatory |
| FR-AGCRT-OWNER-03 | Phone No. | Must not be blank. Confirmed national-number-only, same as FR-AGCRT-MASTER-09. | "Please enter a valid phone no." | Numeric Input | Mandatory |

### 2.1.3 Create Agency — Upload Document Details Section

| Req. ID | Field / Behavior | Validation | Error Msg | Field Type | Status |
|---|---|---|---|---|---|
| FR-AGCRT-DOC-01 | Choose documents 1, 2, 3 | PDF files only | "Please Upload a valid file format." | Attachments | Mandatory |
| FR-AGCRT-DOC-02 | Contract Start Date | Must not be blank | "Please enter a valid Start Date." | Calendar Input | Mandatory |
| FR-AGCRT-DOC-03 | Contract End Date | Must not be blank | "Please enter a valid End Date." | Calendar Input | Mandatory |
| FR-AGCRT-DOC-04 | "Upload" button attaches the file chosen via browsing | Behavioral | N/A | Button | Mandatory |
| FR-AGCRT-DOC-05 | Multiple documents may be uploaded | Behavioral | N/A | Repeatable section | Mandatory |
| FR-AGCRT-DOC-06 | Uploaded document names are displayed | Behavioral | N/A | Display | Mandatory |
| FR-AGCRT-DOC-07 | Uploaded documents can be removed or updated | Behavioral | N/A | Action | Mandatory |

### 2.1.4 Create Agency — Agency Logo Details Section

| Req. ID | Field / Behavior | Validation | Error Msg | Field Type | Status |
|---|---|---|---|---|---|
| FR-AGCRT-LOGO-01 | Logo | Image type, max size 2MB | "Please Upload a valid file format." | Attachments | Mandatory |
| FR-AGCRT-LOGO-02 | Uploaded logo is displayed for review before final submission | Behavioral | N/A | Display | Mandatory |

### 2.1.5 Create Agency — Wonder Travel Sales Contact Section

| Req. ID | Field / Behavior | Validation | Error Msg | Field Type | Status |
|---|---|---|---|---|---|
| FR-AGCRT-SALES-01 | Name | Only-characters validation | "Please enter a valid Name." | Text Input | Mandatory |
| FR-AGCRT-SALES-02 | Designation | Select a Designation from a pre-populated list | "Please Select a valid Designation." | Drop Down | Optional |
| FR-AGCRT-SALES-03 | Email ID | Special characters allowed | "Please enter a valid email." | Char & Special Char | Mandatory |
| FR-AGCRT-SALES-04 | Phone No. | Must not be blank. Confirmed national-number-only, same as FR-AGCRT-MASTER-09. | "Please enter a valid phone no." | Numeric Input | Mandatory |
| FR-AGCRT-SALES-05 | Default values are inherited from the Branch Contact Person | Behavioral | N/A | Auto-fill | Mandatory |
| FR-AGCRT-SALES-06 | Inherited details can be changed | Behavioral | N/A | Editable | Mandatory |
| FR-AGCRT-SALES-07 | Multiple Sales personnel can be added | Behavioral | N/A | Repeatable section | Mandatory |

### 2.1.6 Create Agency — Bank Account Details Section

| Req. ID | Field / Behavior | Validation | Error Msg | Field Type | Status |
|---|---|---|---|---|---|
| FR-AGCRT-BANK-01 | Account Number | Numeric input only | "Please enter a valid Bank No." | Numeric Input | Optional |
| FR-AGCRT-BANK-02 | Account Type | Select a Type from a pre-populated list | "Please Select a valid Account Type." | Drop Down | Optional |
| FR-AGCRT-BANK-03 | Bank Name | Only-characters validation | "Please enter a valid Bank Name." | Text Input | Optional |
| FR-AGCRT-BANK-04 | Multiple bank accounts can be added | Behavioral | N/A | Repeatable section | Optional |

### 2.1.7 Create Agency — Payment Settings Section

| Req. ID | Field / Behavior | Validation | Error Msg | Field Type | Status |
|---|---|---|---|---|---|
| FR-AGCRT-PAY-01 | Invoice Generation | Select from a pre-populated list | "Please select a valid Invoice Generation Type." | Drop Down | Mandatory |
| FR-AGCRT-PAY-02 | Credit Limit | Must not be blank | "Please enter a valid Credit Limit." | Numeric Input | Mandatory |
| FR-AGCRT-PAY-03 | Top Up limit | Must not be blank | "Please enter a valid Top Up Limit." | Numeric Input | Mandatory |
| FR-AGCRT-PAY-04 | Target | Numeric input only | "Please enter a valid Target." | Numeric Input | Optional |
| FR-AGCRT-PAY-05 | Set Month | Select a month from a pre-populated list | "Please select a valid Month." | Drop Down | Optional |
| FR-AGCRT-PAY-06 | Set Year | Select a year from a pre-populated list | "Please select a valid Year." | Drop Down | Optional |
| FR-AGCRT-PAY-07 | Credit Terms (Days) | Must not be blank | "Please enter a valid Number of days." | Numeric Input | Mandatory |
| FR-AGCRT-PAY-08 | Reaching Percentage | Numeric input only | "Please enter a valid Percentage." | Numeric Input | Optional |
| FR-AGCRT-PAY-09 | Warning Prompt (Days) | Numeric input only | "Please enter a valid Number of days." | Numeric Input | Optional |
| FR-AGCRT-PAY-10 | Credit Agency | N/A | N/A | Check Box | Optional |
| FR-AGCRT-PAY-11 | Payment Options | Multiple-select validation | N/A | Check Boxes | Mandatory |
| FR-AGCRT-PAY-12 | Multiple payment options (Cash, Wallet, Credit Card, etc.) must be selectable | Behavioral | N/A | Check Boxes | Mandatory |

### 2.1.8 Create Agency — Product Access Details Section

| Req. ID | Field / Behavior | Validation | Error Msg | Field Type | Status |
|---|---|---|---|---|---|
| FR-AGCRT-PRODUCT-01 | Product | Multi-select | N/A | Check Boxes | Mandatory |
| FR-AGCRT-PRODUCT-02 | Status Column | Multi-select | N/A | Check Boxes | Mandatory |
| FR-AGCRT-PRODUCT-03 | Supplier Name | Read only | N/A | Text Field | N/A |
| FR-AGCRT-PRODUCT-04 | Credential name | Must not be blank | N/A | Drop Down | Mandatory |
| FR-AGCRT-PRODUCT-05 | Product Name | Read only | N/A | Text Field | N/A |
| FR-AGCRT-PRODUCT-06 | Description | Must not be blank | N/A | Text Field | Mandatory |
| FR-AGCRT-PRODUCT-07 | Inherited from Branch — populated once a Branch is selected | Behavioral | N/A | Auto-fill | Mandatory |

### 2.1.9 Create Agency — Airline Supplier Credential (PCC) Section

Filters: Amadeus PCC, Galileo PCC, Sabre PCC.

| Req. ID | Field / Behavior | Validation | Error Msg | Field Type | Status |
|---|---|---|---|---|---|
| FR-AGCRT-PCC-01 | Search Supplier Credential PCC | Multi-select | "Please select a valid PCC Type." | Check Boxes | Mandatory |
| FR-AGCRT-PCC-02 | Ticketing Supplier Credentials PCC | Multi-select | N/A | Check Boxes | Optional |
| FR-AGCRT-PCC-03 | Generic Supplier PCC | Select from a pre-populated list | "Please Select a valid Supplier PCC." | Drop Down | Mandatory |
| FR-AGCRT-PCC-04 | Manager Name | Must not be blank | "Please enter a valid Manager Name." | Text Field | Mandatory |
| FR-AGCRT-PCC-05 | Supplier Credential Description | Must not be blank | "Please enter a valid description" | Text Field | Mandatory |
| FR-AGCRT-PCC-06 | Default values inherited from Supplier & Branch | Behavioral | N/A | Auto-fill | Mandatory |

### 2.1.10 Create Agency — Import PNR Option / Submission Workflow

| Req. ID | Field / Behavior |
|---|---|
| FR-AGCRT-PNR-01 | Import PNR Option toggle — controls whether this option is displayed on the agency portal |
| FR-AGCRT-SUBMIT-01 | User can submit the Agency for approval |
| FR-AGCRT-SUBMIT-02 | User can save the Agency as a draft |
| FR-AGCRT-SUBMIT-05 | The submission action can be Cancelled |

> `FR-AGCRT-SUBMIT-03`/`-04` (Approve/Reject) are **retired as Create-Agency-scoped IDs** — resolved and superseded by §2.3 Agency Actions below (`FR-AGACTION-03/04/05`), which states the actual mechanism.

### 2.1.11 Dependencies (Create Agency)

| Req. ID | Dependency | Why it matters |
|---|---|---|
| BR-AGCRT-01 | Branch CRUD | Branch field and every "inherited from Branch" behavior. |
| BR-AGCRT-02 | Supplier CRUD | Generic Supplier PCC dropdown and "inherited from Supplier" behavior. |
| BR-AGCRT-03 | Payment Method | Payment Options list (`knowledge_base` APP-002). |

---

### 2.2 Search Agency Section

> Note: the User Story's own table is titled "Top Up Details Section" — an apparent copy-paste artifact from a template, not a scope statement; the fields themselves are unambiguously Search criteria and are treated as such below.

| Req. ID | Field | Validation | Error Msg | Field Type | Status |
|---|---|---|---|---|---|
| FR-AGSEARCH-01 | Agency Code | Optional — normal char & numeric input | "Please Enter a valid Agency Code." | Text Input | Optional |
| FR-AGSEARCH-02 | Agency Name | Optional — normal char | "Please Enter a valid Agency Name." | Text Input | Optional |
| FR-AGSEARCH-03 | State | Optional — select from a pre-populated list | "Please Select a valid State." | Drop Down | Optional |
| FR-AGSEARCH-04 | City | Optional — select from a pre-populated list | "Please Select a valid City." | Drop Down | Optional |
| FR-AGSEARCH-05 | Status | Optional — select from a pre-populated list | "Please Select a valid Status." | **Radio Button** (Field Type column) — inconsistent with the Validation column's dropdown-style wording; see §6. | Optional |
| FR-AGSEARCH-06 | Search results display | On "Search" click, results matching the criteria are shown | N/A | Behavioral | Mandatory |
| FR-AGSEARCH-07 | No Results Found | If no agencies match, a "No Results Found" message is shown | N/A | Behavioral | Mandatory |
| FR-AGSEARCH-08 | "Add" button | Navigates the admin to Add Agency (§2.1) | N/A | Behavioral | Mandatory |
| FR-AGSEARCH-09 | Real-time/on-Search update | Results update in real time or upon pressing "Search" | N/A | Behavioral | Mandatory |
| FR-AGSEARCH-10 | Validation messages | Incorrect input in any search field shows its stated message | N/A | Behavioral | Mandatory |

**Dependencies:** `BR-AGSEARCH-01` Add Agency Page (§2.1). `BR-AGSEARCH-02` Region Module (State/City data source, not independently tested here).

### 2.3 Agency Actions Section

**Actor:** Odeysys Admin / Admin.

| Req. ID | Behavior |
|---|---|
| FR-AGACTION-01 | A pen icon is displayed in the Actions column of the Agency grid, for every row. |
| FR-AGACTION-02 | Clicking the pen icon navigates to the Update Agency screen (§2.5) for that specific Agency record. |
| FR-AGACTION-03 | Approve and Reject buttons are displayed **only** for Agencies whose Approval Status is Pending for Approval. |
| FR-AGACTION-04 | Clicking Approve or Reject displays a remark popup text field. |
| FR-AGACTION-05 | A remark **must** be provided before the Approve/Reject action completes — blocked without one. |

### 2.4 Status Reflection Section (Search grid)

| Req. ID | If the Action is… | Active/Inactive | Approval Status |
|---|---|---|---|
| FR-AGACTION-06 | Submit for Approval (newly created/updated) | Inactive | Pending for Approval |
| FR-AGACTION-07 | Approved | Active | Approved |
| FR-AGACTION-08 | Rejected | Inactive | Rejected |

**Dependencies:** `BR-AGACTION-01` Create Agency (§2.1) — the record must exist to act on. `BR-AGACTION-02` Update Agency (§2.5) — the pen icon's destination.

### 2.5 Update Agency Section

**Field-level scope:** identical to Create Agency's full field set (§2.1.1–§2.1.9) — same validation rules, same messages, same Mandatory/Optional status. **These `FR-AGCRT-*` Requirement IDs are reused as-is for Update Agency — not re-numbered, and not re-tested field-by-field a second time** (Regression Impact dimension, `agents/test_design_agent.md` §17 — Create Agency's own test cases already establish this behavior).

| Req. ID | Behavior new to the Update/Edit context |
|---|---|
| FR-AGUPDATE-01 | The Update Agency screen pre-populates every field with the selected Agency's current stored values. |
| FR-AGUPDATE-02 | Any field (subject to the same Mandatory/Optional rules as Create) can be changed before resubmission. |
| FR-AGUPDATE-03 | **Submit for Approval** saves the updates and submits them for review — re-entering the approval workflow (§2.4, `FR-AGACTION-06`). |
| FR-AGUPDATE-04 | **Cancel** clears unsaved changes or exits the update process without persisting them. |
| FR-AGUPDATE-05 | **Approve** (authorized users, e.g. supervisors) finalizes and applies the changes — same mechanism as Agency Actions' Approve (§2.3, `FR-AGACTION-03/04/05`), not a separate implementation. |
| FR-AGUPDATE-06 | **Reject** (authorized users) declines the changes and requires a reason — same mechanism as Agency Actions' Reject (§2.3), not separate. |

## 3. Modules Out of Scope

- **WT1-T2919 (E-Ticket Agency Branding)** — its own document, `NDC_ProjectContext_ETicketBranding.md` ("Track B"), per the user-confirmed track split 2026-07-18.
- **Agency's own sub-items** — Registration Requests, Category Management, Agency Assignation.
- **Rule Engine Module, Search & Booking Module, NDC Portal Screens, Reports Module, Import PNR (as a portal-side feature), Region Module's own CRUD** — named as downstream-impacted/dependency-only, not in-scope test targets.
- Branch and Staff CRUD (still governed by `v3`); Login/Authentication (`v2`); Credential Routes Filter et al. (`v1`).

## 4. Roles & Credentials Required

- **Admin** credential — required and available.
- **"Authorized users (e.g., supervisors)"** — Update Agency's Expected Outcome names this for Approve/Reject, while Agency Actions' own AC states the actor simply as "Admin/Odeysys admin." Whether this is a distinct role/permission level is an open question — see §6.

## 5. Environment Constraints

This document governs Stage 1 (Project Context) and Stage 3 (Test Design) only; no mutation authorization is needed yet, and none is assumed from any prior run (per `feedback_automation_decision_gates`).

## 6. Carried-Forward Assumptions & Risks

| # | Item | Status |
|---|---|---|
| 1 | **Search Agency's Status field is inconsistently typed** — Validation column implies a dropdown, Field Type column says "Radio Button." | Design against the stated Field Type (Radio Button); log the inconsistency as a Coverage Gap. |
| 2 | **Approve/Reject actor: "Admin/Odeysys admin" (Agency Actions) vs. "authorized users, e.g., supervisors" (Update Agency).** | Design against the Admin credential already available; log the role-terminology discrepancy as a Coverage Gap, not assume a new credential exists. |
| 3 | **Update Agency's field-level validation is assumed identical to Create Agency's** (verbatim-identical AC tables) — not independently re-confirmed live. | Cite Create Agency's test cases as the validation-behavior source; flagged as assumed for the Edit screen specifically. |
| 4 | **Search Agency, Agency Actions, and Update Agency have never been independently observed in Discovery.** FINDING-004 (Actions-column click landing on an unexpected Reject/Deactivate confirmation, RUN-20260712-002) is directly relevant now that Approve/Reject buttons are formally in scope. | Discovery Reference: "Not independently verified in Discovery," except where FINDING-004 enriches the Actions column specifically. |
| 5 | **"No Results Found" message's exact wording** is not itself quoted in the pasted AC (only "as shown on the screen"). | Assert *a* no-results message is shown without asserting an unconfirmed exact string; log wording as a Coverage Gap. |
| 6 | ~~Phone "+ country code" requirement~~ — **Resolved 2026-07-18**, user/business confirmed no `+` prefix needed. See `knowledge_base/business_rules/BR-005.md`. Reflected directly in §2.1's field tables above, not repeated as an open item. | Resolved — Confirmed By Design. |
| 7 | ~~Approve/Reject actor/screen location unresolved~~ — **Resolved 2026-07-18** by the Agency Actions User Story (§2.3/§2.4). Previously blocked `TC-AGENCY-CREATE-037`; superseded by this document's new Agency Actions test cases. | Resolved. |

## 7. Traceability Anchor

| Item above | Source |
|---|---|
| §2.1 (Create Agency) | `PRD.md` User Story 3; `resources/requirements/user_stories/Create-Agency.md` |
| §2.2 (Search Agency) | Pasted text, 2026-07-18 — "Search Agency" User Story |
| §2.3–§2.4 (Agency Actions, Status Reflection) | Pasted text, 2026-07-18 — "As an Odeysys admin, I need to perform actions..." |
| §2.5 (Update Agency) | Pasted text, 2026-07-18 — "[Admin] Update Agency" |
| §6 #4 (Actions column risk) | FINDING-004 (`runs/RUN-20260712-002/discovery/findings/FINDING-004_ActionsColumnAmbiguity/metadata.md`) |
| §6 #6 (phone resolution) | `knowledge_base/business_rules/BR-005.md` |

---

*Per `pipeline/pipeline.md` §5.1, this artifact requires Human Review before Stage 3 formally clears its own checkpoint. Once approved, this file moves to `projects/NDC/workspace/context/NDC_ProjectContext_Agency.md` per explicit user instruction — this run-scoped copy is the pre-approval draft.*
