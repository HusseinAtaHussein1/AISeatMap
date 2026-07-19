# Create Agency (Admin — Agency Master Form)

**Type:** User Story · **Source:** Plain Text (pasted) · **Received:** 2026-07-18 · **Status:** Raw pasted-text source, not yet used to generate a Project Context (per `pipeline/run_scope.md` §4.1, this is a User Story Run Scope, Source = Pasted text).

> Source is metadata, not a folder — see `resources/README.md` → "Requirement Source is metadata." This file lives at `requirements/user_stories/` regardless of Source; only the `Source:` field above records how it was delivered.

## Description

As an Admin, I want to create agency including basic information, agency owner details, document uploads, bank accounts, payment settings, and product access credentials, so that agencies are properly configured and integrated into the NDC Admin version for operational efficiency and compliance.

## Acceptance Criteria

### Agency Master Section

| Field | Validation | Msg | Field Type | Status |
|---|---|---|---|---|
| Branch | Select a Branch from a pre-populated list | "Please select a valid Branch." | Drop Down | Mandatory |
| Agency Name | Must not be blank; Special characters allowed Validation | "Please enter a valid Agency Name." | Text Input | Mandatory |
| Country | Inherited when a branch is selected | N/A | Read Only | Mandatory |
| State | Select a State from a pre-populated list | "Please select a valid State." | Drop Down | Mandatory |
| City | Select a city from a pre-populated list | "Please select a valid City Name." | Drop Down | Mandatory |
| IATA Agency | Yes or No | N/A | Radio Button | Optional |
| Post Office Box | Must not be blank | "Please enter a valid City Post Office." | Numeric Input | Mandatory |
| Company URL | Special characters allowed | "Please enter a valid URL." | URL | Optional |
| Phone no. | Must not be blank; + Phone country code | "Please enter a valid phone no.." | Numeric Input | Mandatory |
| Address 1 | Must not be blank | "Please enter a valid Address." | Text & Numeric Input | Mandatory |
| Address 2 | N/A | N/A | Text & Numeric Input | Optional |

### Agency Owner Details Section

| Field | Validation | Msg | Field Type | Status |
|---|---|---|---|---|
| Contact Person | Only Characters validation | "Please enter a valid Name." | Text Input | Mandatory |
| Email ID | Special characters allowed | "Please enter a valid email." | Char & Special Char | Mandatory |
| Phone No. | Must not be blank; + Phone country code | "Please enter a valid phone no." | Numeric Input | Mandatory |

### Upload Document Details (Document Section)

| Field | Validation | Msg | Field Type | Status |
|---|---|---|---|---|
| Choose documents 1, 2, 3 | PDF Files | "Please Upload a valid file format." | Attachments | Mandatory |
| Contract Start Date | Must not be blank | "Please enter a valid Start Date." | Calendar Input | Mandatory |
| Contract End Date | Must not be blank | "Please enter a valid End Date." | Calendar Input | Mandatory |

Additional behavior:
- An "Upload" button so the user can attach the file chosen from the browsing process.
- Each document upload should have fields for contract start and end dates.
- The system shall allow the upload of multiple documents.
- Uploaded document names should be displayed.
- The user must be able to remove or update documents if needed.

### Agency Logo Details (Agency Logo Section)

| Field | Validation | Msg | Field Type | Status |
|---|---|---|---|---|
| Logo | Image Type, Size 2MB | "Please Upload a valid file format." | Attachments | Mandatory |

Additional behavior:
- The user must be able to upload an agency logo (with size restrictions).
- Uploaded logo should be displayed for review before final submission.

### Wonder Travel Sales Contact (Sales Contact Details Section)

| Field | Validation | Msg | Field Type | Status |
|---|---|---|---|---|
| Name | Only Characters validation | "Please enter a valid Name." | Text Input | Mandatory |
| Designation | Select a Designation from a pre-populated list | "Please Select a valid Designation." | Drop Down | Optional |
| Email ID | Special characters allowed | "Please enter a valid email." | Char & Special Char | Mandatory |
| Phone No. | Must not be blank; + Phone country code | "Please enter a valid phone no." | Numeric Input | Mandatory |

Additional behavior:
- Default Values are to be inherited from the Branch Contact Person.
- Details can be changed.
- Users must be able to add multiple Sales personnel.

### Bank Account Details Section

| Field | Validation | Msg | Field Type | Status |
|---|---|---|---|---|
| Account Number | Numeric Input Only | "Please enter a valid Bank No." | Numeric Input | Optional |
| Account Type | Select a Type from a pre-populated list | "Please Select a valid Account Type." | Drop Down | Optional |
| Bank Name | Only Characters validation | "Please enter a valid Bank Name." | Text Input | Optional |

Additional behavior:
- Users must be able to add multiple bank accounts.

### Payment Settings Section

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

Additional behavior:
- Multiple payment options (e.g., Cash, Wallet, Credit Card, etc.) must be selectable.

### Product Access Details Section

| Field | Validation | Msg | Field Type | Status |
|---|---|---|---|---|
| Product | Multi Select | N/A | Check Boxes | Mandatory |
| Status Column | Multi Select | N/A | Check Boxes | Mandatory |
| Supplier Name | Read Only | N/A | Text Field | N/A |
| Credential name | Must not be blank | N/A | Drop Down | Mandatory |
| Product Name | Read Only | N/A | Text Field | N/A |
| Description | Must not be blank | N/A | Text Field | Mandatory |

Additional behavior:
- The Product Access details segment is inherited from Branch (when the branch is selected, it is populated) — Agency is a subset, Branch is the parent.

### Airline Supplier Credential (PCC) Section

Filter: Amadeus PCC, Galileo PCC, Sabre PCC.

| Field | Validation | Msg | Field Type | Status |
|---|---|---|---|---|
| Search Supplier Credential PCC | Multi Select | "Please select a valid PCC Type." | Check Boxes | Mandatory |
| Ticketing Supplier Credentials PCC | Multi Select | N/A | Check Boxes | Optional |
| Generic Supplier PCC | Select a supplier PCC from a pre-populated list | "Please Select a valid Supplier PCC." | Drop Down | Mandatory |
| Manager Name | Must not be blank | "Please enter a valid Manager Name." | Text Field | Mandatory |
| Supplier Credential Description | Must not be blank | "Please enter a valid description" | Text Field | Mandatory |

Additional behavior:
- Airline Supplier Credential details "Default Values" are inherited from Supplier & Branch.

### Import PNR Option Segment

- The user should be able to toggle the "Import PNR Option," which determines if this option will be displayed on the agency portal.

## Dependencies

- Branch CRUD
- Supplier CRUD
- Payment Method

## Expected Outcome

The user must be able to submit the agency information for approval or save it as a draft, with options to approve, reject, or cancel.

## Reflection

- Rule Engine Module
- Search & Booking Module
- NDC Portal Screens
- Reports Module (Agency Wallet, Total Due to NDC)
