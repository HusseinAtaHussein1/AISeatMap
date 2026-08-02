# US-4222 — [Admin] Update Agency

**Source:** Plain Text (pasted) — supplied by the user on 2026-07-31 and transcribed here verbatim in structure and wording.
**Work item ID:** 4222
**Type:** User Story
**Recorded:** 2026-07-31
**Status:** Requirements input — not yet consumed by Stage 1.

> **Transcription note.** This file is the *requirement as supplied*, not an interpretation of it. Wording,
> validation messages (including their original punctuation, e.g. `"Please enter a valid phone no.."`),
> field ordering, and mandatory/optional markings are reproduced exactly as pasted. Anything unclear is
> listed under [Open Questions](#open-questions) rather than resolved here — resolving it is Stage 1's job,
> and inventing an answer is prohibited (`pipeline.md` §6 Rule 4).

---

## Story

**As an** Admin
**I want** to update agency details including basic information, agency owner details, document uploads, bank accounts, payment settings, and product access credentials
**So that** agencies' configurations are up to date and integrated into the NDC Admin version for operational efficiency and compliance.

---

## Acceptance Criteria

### AC-1 — Agency Master Section

| Field | Validation | Msg | Field Type | Status |
|---|---|---|---|---|
| Branch | Select a Branch from a pre-populated list | "Please select a valid Branch." | Drop Down | Mandatory |
| Agency Name | Must not be blank; Special characters allowed Validation | "Please enter a valid Agency Name." | Text Input | Mandatory |
| Country | Inherited when a branch is selected | N/A | Read Only | Mandatory |
| State | Select a State from a pre-populated list | "Please select a valid State." | Drop Down | Mandatory |
| City | Select a city from a pre-populated list | "Please select a valid City Name." | Drop Down | Mandatory |
| IATA Agency | Yes or No | N/A | Radio Button | Optional |
| Post Office Box | Must not be blank; | "Please enter a valid City Post Office." | Numeric Input | Mandatory |
| Company URL | Special characters allowed | "Please enter a valid URL." | URL | Optional |
| Phone no. | Must not be blank; + Phone country code | "Please enter a valid phone no.." | Numeric Input | Mandatory |
| Address 1 | Must not be blank; | "Please enter a valid Address." | Text & Numeric Input | Mandatory |
| Address 2 | N/A | N/A | Text & Numeric Input | Optional |

### AC-2 — Agency Owner Details Section

| Field | Validation | Msg | Field Type | Status |
|---|---|---|---|---|
| Contact Person | Only Characters validation | "Please enter a valid Name." | Text Input | Mandatory |
| Email ID | Special characters allowed | "Please enter a valid email." | Char & Special Char | Mandatory |
| Phone No. | Must not be blank; + Phone country code | "Please enter a valid phone no." | Numeric Input | Mandatory |

### AC-3 — Upload Document Details (Document Section)

| Field | Validation | Msg | Field Type | Status |
|---|---|---|---|---|
| Choose documents 1, 2, 3 | PDF Files | "Please Upload a valid file format." | Attachments | Mandatory |
| Contact Start Date | Must not be blank | "Please enter a valid Start Date." | Calendar Input | Mandatory |
| Contract End Date | Must not be blank | "Please enter a valid End Date." | Calendar Input | Mandatory |

Behavioural rules:

- The "Browse" button lets the user browse the document on his device.
- "Upload" button so that the user can attach the file he has chosen from the browsing process.
- Each document upload should have fields for contract start and end dates.
- System shall allow the upload of multiple documents.
- Uploaded document names should be displayed.
- The user must be able to remove or update documents if needed.

### AC-4 — Agency Logo Section

| Field | Validation | Msg | Field Type | Status |
|---|---|---|---|---|
| Logo | Image Type, Size 2MB | "Please Upload a valid file format." | Attachments | Mandatory |

Behavioural rules:

- The user must be able to upload an agency logo (with size restrictions).
- Uploaded logo should be displayed for review before final submission.

### AC-5 — Wonder Travel Sales Contact (Sales Contact Details Section)

| Field | Validation | Msg | Field Type | Status |
|---|---|---|---|---|
| Name | Only Characters validation | "Please enter a valid Name." | Text Input | Mandatory |
| Designation | Select a Designation from a pre-populated list | "Please Select a valid Designation." | Drop Down | Optional |
| Email ID | Special characters allowed | "Please enter a valid email." | Char & Special Char | Mandatory |
| Phone No. | Must not be blank; + Phone country code | "Please enter a valid phone no." | Numeric Input | Mandatory |

Behavioural rules:

- Default Values are to be inherited from the Branch Contact Person.
- Details can be changed.
- Users must be able to add multiple Sales personnel.

### AC-6 — Bank Account Details Section

| Field | Validation | Msg | Field Type | Status |
|---|---|---|---|---|
| Account Number | Numeric Input Only | "Please enter a valid Bank No." | Numeric Input | Optional |
| Account Type | Select a Type from a pre-populated list | "Please Select a valid Account Type." | Drop Down | Optional |
| Bank Name | Only Characters validation | "Please enter a valid Bank Name." | Text Input | Optional |

Behavioural rules:

- Users must be able to add multiple bank accounts.

### AC-7 — Payment Settings Section

| Field | Validation | Msg | Field Type | Status |
|---|---|---|---|---|
| Invoice Generation | Select an invoice from a pre-populated list | "Please select a valid Invoice Generation Type." | Drop Down | Mandatory |
| Credit Limit | Must not be blank | "Please enter a valid Credit Limit." | Numeric Input | Mandatory |
| Top Up limit | Must not be blank | "Please enter a valid Top Up Limit." | Numeric Input | Mandatory |
| Target | Numeric Input Only | "Please enter a valid Target." | Numeric Input | Optional |
| Set Month | Select a month from a pre-populated list | "Please select a valid Month." | Drop Down | Optional |
| Set Year | Select a year from a pre-populated list | "Please select a valid Year." | Drop Down | Optional |
| Credit Terms (Days) | Must not be blank | "Please enter a valid Number of days." | Numeric Input | Mandatory |
| Reaching Percentage | Numeric Input Only | "Please enter a valid Percentage." | Numeric Input | Optional |
| Warning Prompt (Days) | Numeric Input Only | "Please enter a valid Number of days." | Numeric Input | Optional |
| Credit Agency | N/A | N/A | Check Box | Optional |
| Payment Options | Multiple Select validations | N/A | Check Boxes | Mandatory |

Behavioural rules:

- Multiple payment options (e.g., Cash, Wallet, Credit Card, etc.) must be selectable.

### AC-8 — Product Access Details Section

| Field | Validation | Msg | Field Type | Status |
|---|---|---|---|---|
| Product | Multi Select | N/A | Check Boxes | Mandatory |
| Status Column | Multi Select | N/A | Check Boxes | Mandatory |
| Supplier Name | Read Only | N/A | Text Field | N/A |
| Credential name | Must not be blank | N/A | Drop Down | Mandatory |
| Product Name | Read Only | N/A | Text Field | N/A |
| Description | Must not be blank | N/A | Text Field | Mandatory |

Behavioural rules:

- The Product Access details segment is inherited from Branch (when you select the branch, it will be populated), since the Agency is a subset and the Branch is the parent.

### AC-9 — Airline Supplier Credential (PCC) — Airline Supplier Credentials Section

**Filters:** Amadeus PCC · Galileo PCC · Sabre PCC

| Field | Validation | Msg | Field Type | Status |
|---|---|---|---|---|
| Search Supplier Credential PCC | Multi Select | "Please select a valid PCC Type." | Check Boxes | Mandatory |
| Ticketing Supplier Credentials PCC | Multi Select | N/A | Check Boxes | Optional |
| Generic Supplier PCC | Select a supplier PCC from a pre-populated list | "Please Select a valid Supplier PCC." | Drop Down | Mandatory |
| Manager Name | Must not be blank | "Please enter a valid Manager Name." | Text Field | Mandatory |
| Supplier Credential Description | Must not be blank | "Please enter a valid description" | Text Field | Mandatory |

Behavioural rules:

- Airline Supplier Credential details "Default Values" are inherited from Supplier & Branch.

### AC-10 — Import PNR Option Segment

- The user should be able to toggle the "Import PNR Option," which determines if this option will be displayed on the agency portal.

---

## Dependencies

- Branch CRUD
- Supplier CRUD
- Payment Method

---

## Expected Outcome

| Action | Behaviour |
|---|---|
| **Submit for Approval** | Saves the updates and submits them for review. |
| **Cancel** | Clears unsaved changes or exits the role update process. |
| **Approve** | Available to authorized users (e.g., supervisors) to finalize and apply the changes. |
| **Reject** | Allows authorized users to decline the changes and provide a reason for rejection. |

---

## Reflection (impacted areas named by the story)

- Rule Engine Module
- Search & Booking Module
- NDC Portal Screens
- Reports Module
- Top Up Submodule

---

## Open Questions

Recorded, not resolved — Stage 1 carries each forward as an `Open Question` rather than guessing
(`pipeline.md` §6 Rule 4; `project-context-skill` gap vocabulary).

1. **"Cancel: Clears unsaved changes or exits the role update process."** The story is about *Agency* update; "role update process" appears to be carried over from a Role story. Which is intended?
2. **Mandatory document upload on an *update*.** AC-3 marks "Choose documents 1, 2, 3" Mandatory. On an update of an agency that already has documents, does the user have to re-upload, or does "Mandatory" describe the create-time rule inherited by this form?
3. **Agency Logo Mandatory on update** — same question as #2 for AC-4.
4. **AC-9 table shape.** The pasted table carries a "Filter" column (Amadeus/Galileo/Sabre PCC) whose row alignment to the five fields is ambiguous. Transcribed above as a filter *set* over the section; confirm whether each PCC type instead has its own field row.
5. **Payment Options list.** "e.g., Cash, Wallet, Credit Card, etc." — is the complete authoritative option set defined anywhere?
6. **Approve / Reject authorization.** "authorized users (e.g., supervisors)" — which role(s) exactly, and is the approving role distinct from the Admin performing the update?
7. **Field-level immutability on update.** Does changing `Branch` on an existing agency re-inherit Country, Product Access, and Sales Contact defaults, overwriting values the agency already has?
8. **"Reflection" areas.** Are the five named modules in scope for verification of downstream effect, or listed as impact awareness only?
9. **Validation-message fidelity.** Two messages are punctuated oddly in the source (`"Please enter a valid phone no.."`, `"Please enter a valid description"` with no period). Are those the literal strings the application renders?

---

## Traceability

**Implements:** US-4222 (external work item). No `REQ-*` ID in `PRD.md` yet — `PRD.md` is currently an
unpopulated template, so this story is a standalone requirement source. Stage 1 assigns the requirement
IDs that Stage 3 traces test cases back to.
