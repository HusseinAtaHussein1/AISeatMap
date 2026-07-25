# NDC Platform — Product Requirements Document

> **Provenance — read before using this document as a requirement source.**
>
> This PRD was **reverse-engineered from the NDC automation suite** (`E:\Automation2\NDC-Uplift-Automation`,
> the registered Reference Automation Project) on **2026-07-25**, and installed here as this project's
> PRD by explicit user decision the same day, in answer to the Stage 1 PRD-source question
> ("Reverse-engineered PRD only").
>
> **It is not a business-authored, business-approved PRD.** Its own status line reads *Draft for business
> review*. Every requirement in it carries an evidence tag — **[V] Verified** (an automated assertion pins
> the behaviour), **[O] Observed** (exercised but unasserted), **[I] Inferred** (derived from locators,
> field names, or test data only). Downstream stages must treat `[O]` and `[I]` requirements as
> **unconfirmed** and probe them, never as settled acceptance criteria. §13 lists nine business
> requirements that exist in the backlog with **no** automation counterpart, and §15 lists ten open
> questions the business has not answered.
>
> **The previous PRD — the pasted User Stories (Create Agency, Create Role, Credential Route
> White/Black List, Airline Whitelist/Blacklist) — has not been deleted.** It now lives at
> [`PRD_UserStories.md`](PRD_UserStories.md), unchanged. Every prior approved Project Context that cites
> "PRD.md User Story 1–4" (`workspace/context/ProjectContext_{CredentialRoutesFilter,Agency,Role,
> BranchAgencyStaff,LoginAuthentication}.md`) resolves to **that** file, not to this one. Those runs'
> traceability is unaffected; this document supersedes it as the requirement source only for runs
> from 2026-07-25 onward.
>
> Source of this document: `E:\Automation2\NDC-Uplift-Automation\docs\NDC-PRD-Reverse-Engineered.md`.

---

**Status:** Draft for business review

---

## 0. About this document

This PRD was **not** written from business documentation. It was reverse-engineered from the NDC
automation suite: 122 test classes (~358 test methods), ~150 page objects, and 129 JSON test-data
files. Every requirement below traces to something the automation actually drives or asserts.

### 0.1 Evidence levels

Each requirement carries a confidence tag:

| Tag | Meaning |
|---|---|
| **[V] Verified** | The automation asserts this behaviour explicitly (expected message, expected state, expected value). The requirement is business-confirmed by a passing/failing assertion. |
| **[O] Observed** | The automation performs the action and the flow depends on it, but no assertion pins the outcome. The capability exists; the acceptance criterion is not pinned down. |
| **[I] Inferred** | Derived from locators, field names, menu structure, or test data — the field/screen exists, but neither exercised nor asserted end-to-end. |

### 0.2 How to read the requirement IDs

`<MODULE>-<NN>` — e.g. `AUTH-04`. IDs are stable; append, never renumber.

### 0.3 Known limits of this reconstruction

- **Non-functional requirements are almost entirely absent** from the automation. Performance,
  concurrency, availability, data-retention, and security requirements (§12) are inferred or
  flagged as open questions — they must come from the business, not from here.
- **Negative/permission matrices are partial.** Automation covers the happy path plus selected
  validations. Absence of a rule below does **not** mean the product lacks it.
- **Calculation logic is a black box.** The suite asserts *that* a markup/discount/service charge
  is applied and *that* a fare matches, never *how* the number is computed (see §7.7, OQ-3).
- **Four business modules appear in the platform's user-story backlog but have no automation
  coverage at all** — see §13 (Coverage Gaps).

---

## 1. Product overview

NDC is a **B2B airline content distribution and booking platform**. A travel-services operator
(the "NDC operator") aggregates flight content from multiple GDS/NDC suppliers, applies its own
commercial rules (markup, discount, service charge, cancellation charge, BSP commission, deal
codes), and distributes the result to a network of travel **agencies** that book on credit or
pre-paid wallet.

The product is delivered as **two separate web applications** against a shared back end:

| Application | Audience | Purpose |
|---|---|---|
| **NDC Admin** (back office) | NDC operator staff — Super Admin, Admin, role-scoped staff | Master data, commercial rules, agency onboarding, supplier credentials, mid-office booking, reporting, approvals |
| **NDC Portal** (agency-facing) | Agency owners and agents | Self-service booking, wallet top-up, traveller management, own-agency markup (Financial), own reports |

**Evidence:** `src/test/resources/Environment.properties` defines two distinct base URLs and two
distinct credential sets (Admin host, and Portal host on port 9500 with an additional *agency code*
login factor). `src/main/java` is split `AdminPages/` vs `PortalPages/`.

### 1.1 Business objectives (inferred from what the system is built to control)

1. **Sell multi-supplier air content under the operator's own commercial terms** — every search
   result passes through a configurable Rule Engine before the agency sees a price.
2. **Control credit risk per agency** — credit limit, top-up limit, credit terms in days, warning
   thresholds, wallet balance, and a "Total Due to NDC" report.
3. **Enforce four-eyes governance on every commercial and master-data change** — nothing that
   affects price, access, or master data goes live without a second approver (§6.1).
4. **Give agencies self-service** so the operator's staff are not a bottleneck (Portal).

---

## 2. Actors and roles

| Actor | Evidence | Notes |
|---|---|---|
| **Super Admin (odeysysadmin)** | `LogIn_Page.ClickSuperAdmin()`, `LoginAsSuperAdmin()` used for approval steps and Agent Information edit | Highest privilege. Used in automation specifically where an Admin cannot approve their own change, and for `EditAgentInformation` / unlock. |
| **Admin** | `LogIn_Page.ClickAdmin()` / `AdminLogin()` | Day-to-day operator user. |
| **Staff user (role-scoped)** | `Role_TC.CreateRoleWithViewPermessionAndCreateStaffAndLoginWithIt` — creates a role, creates a staff user against it, logs in as that user, asserts the visible permissions | Access is entirely driven by the Role definition. |
| **Approver** | `ApprovalList: "No Approver"` in `CreateStaff.json`; `setSendApproval`, `BtnApprove`, `ClickReject` across modules | Staff can be created with or without an approver in their chain. |
| **Agency Owner** | `ActionActiveDeactiveAgentInformation_TC.VerifyClickingOnActiveButtonForAgencyOwner`, `VerifyThatAgencyOwnerCanLoginPortal` | Activating the agency owner in Admin is the gate for Portal access. |
| **Agent (agency staff)** | Portal `ProfileManagementtest.Tc1_ADD_NEW_AGENT_admin` / `Tc2_ADD_NEW_AGENT_AGENT`; `Financial_Page.select_AgentName` | Created from the Portal by an agency admin or by another agent. |
| **Traveller / Client** | `Travellers`, `PortalPages/TravellerPages`, `SearchTravellers` | A passenger profile owned by an agency/agent; not a system login. |

---

## 3. Module map (in-scope surface)

```
NDC ADMIN
├── Authentication            Login · OTP · Forgot Password · Change Password · Logout
├── Dashboard                 Flight search widget · Booking-reference lookup · Ticketed document
├── Admin
│   ├── Company               Operating Countries · Role · Department · Top-Up Request
│   ├── Branch                Create · Search
│   ├── Agency                Create (multi-section) · Search · Registration Requests · Agent Login Details
│   └── Staff                 Create · Search · Activate/Deactivate
├── Master
│   ├── Flight                Airport · Airline · RBD · Prefer Airline · BSP Commission · Deal Code
│   ├── Supplier              Supplier · Supplier Credential · Credential Field · Flight Search Limitation
│   ├── Miscellaneous         Region · Country · State · City · Currency · Rate of Exchange
│   └── Payment Gateway       Payment Method
├── Rule Engine               Markup · Discount · Service Charge · Cancellation Charge ·
│                             Fare Rules · Offer Pricing · Terms & Conditions · Rule History
├── Settings                  Admin Settings (search limit, upselling, refund) · Supplier settings
├── User Management           Agency User Information (Agent Information · Traveller Details)
├── Booking Mid Office        Booking · Search Booking · My Quotes · Manual Booking Invoice · Import PNR
├── Profile                   Change Password · Travellers
└── Reports                   Agency Wallet · Booking · Import PNR · AR Ledger · Quotation ·
                              Released PNR · Sales · Statement · Sync PNR · Total Due to NDC ·
                              Wallet History · Daily Sales · Transfer PNR · Finance

NDC PORTAL
├── Authentication            Login (agency code + email + password) · Forgot Password · Request Registration
├── Top Up                    Cash · Banque Misr (card) · Fawry · Bank Transfer
├── Settings                  Profile Management (agents) · Financial (per-airline markup)
├── Travellers                Create · Edit · Activate/Deactivate · Search
└── Reports                   Booking
```

---

## 4. Authentication and session (AUTH)

### 4.1 Admin login

| ID | Requirement | Level |
|---|---|---|
| AUTH-01 | Admin users authenticate with **username + password**. Successful login lands on the Dashboard. | **[V]** `LogIn_TC.LogInWithAdminValidData`; assertion *"User should be redirected to dashboard after successful login"* |
| AUTH-02 | Both **Super Admin** and **Admin** account types authenticate through the same form. | **[V]** `LogInWithSuperAdminValidData` |
| AUTH-03 | Submitting empty credentials shows required-field validation: **"Username is required"** and **"Password is required"**. | **[V]** `LogInWithEmptyFields` |
| AUTH-04 | Invalid username, invalid password, or invalid credential pair all return the same generic message: **"Invalid credentials, Please try again."** (no account enumeration). | **[V]** `LogInWithInvalidUerName`, `LogInWithInvalidPassword`, `LogInWithInvalidCreditional` |
| AUTH-05 | Non-Latin (Arabic) input in the username field is rejected as invalid credentials. | **[V]** `LogInWithArabicAndValidPassword` |
| AUTH-06 | A **"Remember Me"** option exists on the login form. | **[O]** `LogIn_Page.ClickRememberMe` |
| AUTH-07 | Users can log out; logout is confirmed to the user. | **[V]** assertion *"User is logged out successfully"* |

### 4.2 Two-factor (OTP) verification

| ID | Requirement | Level |
|---|---|---|
| AUTH-08 | After password validation the system may require a **one-time code sent to the user's device/email** (*"Please enter the OTP sent to your device:"*). | **[V]** `MailVerification_TC.OTPVerificationValidCode` — OTP is read from the mailbox via `GmailReaderUtil` |
| AUTH-09 | **Trusted-device bypass:** a recognised user skips OTP entirely. | **[V]** `MailVerification_TC` branches on *"User is trusted; OTP page did not appear."* vs *"OTP page appeared."* |
| AUTH-10 | An incorrect OTP is rejected. | **[V]** `OTPVerificationInValidCode` |
| AUTH-11 | **Three failed OTP attempts lock the account** — *"Your account has been locked"*. | **[V]** `MailVerification_TC.ThreeTimesTrialsError` |
| AUTH-12 | The user can **resend** the OTP. | **[V]** `ResendOTP` |
| AUTH-13 | Resend is itself rate-limited; exceeding it returns **"We can't send the OTP"**. | **[V]** `ResendOTPError`, `OTPCodeVerification_Page.SecondTimeResend` |
| AUTH-14 | A locked account must be **unlockable by an authorised user** from Agent Information (confirm/cancel dialog). | **[V]** `ViewAgentInformation_TC.UnlockClickableAndClickYes` / `...ClickNoClickable` |

### 4.3 Forgot password (Admin)

| ID | Requirement | Level |
|---|---|---|
| AUTH-15 | A user requests a reset by username; the system emails a reset link. | **[O]** `ForgetPassword_Page.ClickAndTypeUserName` → `OpenGmail` |
| AUTH-16 | The reset form requires **New Password + Confirm Password**, both mandatory and matching. | **[V]** test data `VerifyThatNewPasswordIsRequired.json`, `VerifyThatConfirmPasswordIsRequired.json`, `VerifyThatNewPasswordNotEqualConfirmPassword.json`, `VerifyThatNewPasswordEqualConfirmPassword.json` |
| AUTH-17 | The system distinguishes existing from non-existing usernames on the reset form. | **[I]** `VerifyThatGetErrorWhenUserNameIsExist.json` / `...IsNotExist.json` — data exists, no test method drives it |

### 4.4 Change password (authenticated)

| ID | Requirement | Level |
|---|---|---|
| AUTH-18 | Change Password requires **Old + New + Confirm**. | **[V]** `ChangePassword_TC` |
| AUTH-19 | Password length must be **8–64 characters**: *"Password length should be 8 to 64 characters."* | **[V]** `minLengthMatchChangePassword2`, `maxLengthMatchChangePassword2` |
| AUTH-20 | New and Confirm must match: *"New password and confirm password should be same."* | **[V]** `misMatchChangePassword2` |
| AUTH-21 | Both new-password fields are mandatory: *"Required"*. | **[V]** `inValidChangePasswordWithEmptyFields` |
| AUTH-22 | A wrong old password is rejected: *"Password change was not successful: Old password is wrong, Please enter correct password"*. | **[V]** `iNValidOldChangePassword` |
| AUTH-23 | The new password **must differ from the current password**. | **[V]** `ValidChangePassword` asserts the `SameNewOldPassword` validation fires when old == new |

### 4.5 Portal login

| ID | Requirement | Level |
|---|---|---|
| AUTH-24 | Portal login requires **three** factors of identification: **Agency Code + Email + Password**. | **[V]** `PortalPages/Login/Login_TC.PortalLogin` |
| AUTH-25 | Malformed agency code → *"Please enter a valid agency code"*. | **[V]** `invalidAgencyCodeValidationField` |
| AUTH-26 | Malformed email → *"Please enter a valid email"*. | **[V]** `invalidEmailValidationField` |
| AUTH-27 | Wrong credentials → *"Invalid credentials, Please try again."* | **[V]** `invalidAgencyCode`, `invalidEmail`, `invalidPassword` |
| AUTH-28 | Empty submit shows per-field required messages (agency code, email, password). | **[V]** `emptyLogin` |
| AUTH-29 | The Portal login page offers **Show Password**, **Remember Me**, **Forgot Password**, and **Request Registration** (self-service agency signup entry point). | **[O]** `Login_Page.clickShowPasswordIcon`, `clickRememberMeCheckbox`, `clickForgotPasswordLink`, `clickRequestRegistrationLink` |
| AUTH-30 | Portal login is only possible once the **agency owner has been activated in Admin**. | **[V]** `ActionActiveDeactiveAgentInformation_TC.VerifyThatAgencyOwnerCanLoginPortal` |

---

## 5. Access control — Roles and permissions (ROLE)

| ID | Requirement | Level |
|---|---|---|
| ROLE-01 | Access is granted through named **Roles**. A role is a matrix of permissions across every module, sub-module, and tab. | **[V]** `Role_TC`, `Role_Page` |
| ROLE-02 | The role matrix covers these top-level modules: **Dashboard, Admin, Master, Rule Engine, Settings, User Management, Booking Mid Office, Profile, Reports, PNR Query, Transfer PNR**. | **[V]** `Role_Page.ClickDashBoard_Tab … ClickTransferPNR_Tab` |
| ROLE-03 | Sub-module granularity exists at least for Admin (**Company, Branch, Agency, Staff**) and Master (**Flight, Supplier, Miscellaneous, Payment Gateway**). | **[V]** `Role_Page.ClickCompany_Tab … ClickPaymentGateway_Tab` |
| ROLE-04 | Each row in the permission grid carries three independent permissions: **View, Edit, Approval**. | **[V]** `ClickIsViewAtAllFields`, `ClickIsEditAtAllFields`, `ClickIsApproveAtAllFields` |
| ROLE-05 | A role may be created with **View only**, **Edit (+View)**, or **Approval (+View)**. | **[V]** `verifyThatUserCanCreateRoleWithViewOnly` / `...EditOnly` / `...AprrovalOnly` |
| ROLE-06 | **Permissions are enforced at runtime, not just stored:** a staff user created against a View-only role sees only view capability; the same applies to View+Edit and View+Approve. | **[V]** `CreateRoleWithViewPermessionAndCreateStaffAndLoginWithIt` → `VerifyThatUserHasHisPermissionOnly`; `verifyUserHasPermissionsViewOnly` / `...ViewAndEdit` / `...ViewAndApprove` |
| ROLE-07 | A newly created role is **submitted for approval**, not live on save. | **[V]** `ClickSendForApprove` + `verifyThatUserCanSearchWithRoleNameAndApproveTheRole` |
| ROLE-08 | Roles are searchable by name and filterable by **Active / Inactive / Both**. | **[V]** `SearchRole_TC.setSearchRoleActive` / `...Inactive` / `...Both` |
| ROLE-09 | An existing role can be **copied/cloned** as the basis for a new one. | **[I]** `Role_Page.ClickCopy` |
| ROLE-10 | Creating a staff user against a role **provisions login credentials** that the new user can authenticate with. | **[V]** `Role_Page.extractUserNameAndPassword` then login as that user |

**Business rules known from the backlog but not covered by automation** (see §13): role-name
uniqueness with message *"Role Name already exists, Please Enter another Role Name."*; at least one
authority must be selected (*"One authorization at least must be selected."*); ticking Edit or
Approval must auto-tick View.

---

## 6. Cross-cutting platform requirements (XC)

These behaviours repeat across effectively every Admin module and should be specified once.

### 6.1 Maker–checker approval workflow

| ID | Requirement | Level |
|---|---|---|
| XC-01 | Creating or updating a governed record does **not** publish it. The maker clicks **Send for Approval**; the record enters state **"Pending for approval"**. | **[V]** `Send for Approval` + `Pending for approval` assertions across Airline, Airport, Country, Region, State, City, Currency, Rate of Exchange, Department, Role, Supplier, Supplier Credential, BSP Commission, Prefer Airline, Terms & Conditions, Markup, Discount, Service Charge, Cancellation Charge, Fare Rules, Offer Pricing |
| XC-02 | A checker **Approves** (thumbs-up) or **Rejects** (thumbs-down) the pending record. | **[V]** `ThumpUp`/`ThumpDown`, `BtnApprove`/`ClickReject`, `approveAction`/`rejectAction` |
| XC-03 | Approval and rejection both accept a free-text **Remarks** entry, captured as the audit reason. | **[V]** `TxtRemarks`, `EnterRemarkText`, `RemarkSubmitButton`; `"remark"` present in Markup/Discount/ServiceCharge/Department test data |
| XC-04 | The workflow applies to **updates as well as creates** (`Update → Send for Approval → Approve`). | **[V]** `BtnUpdateSendForApproval`, `UpdateApprove`, `RemarksSendForApprovalEdit` |
| XC-05 | Governed records carry an independent **Active / Inactive** lifecycle, separate from approval state, toggled from the grid. | **[V]** `ClickOnActiveCircle`/`ClickOnInactiveCircle`, `InActiveCircle`/`ActiveCircle`, `ReActivate` |
| XC-06 | An approver **should not be able to approve their own change** — automation switches to Super Admin for approval steps. | **[I]** consistent `LoginAsSuperAdmin()` before approval in `AdminSettings_Page`, `FlightSearchLimitation_Page`, `AgentInformationnn_Page`. Not asserted as a rejection — **needs business confirmation (OQ-1)**. |
| XC-07 | Grid columns expose approval state to the operator: **Status** and **Approval Status** are distinct columns. | **[V]** header assertions *"The 'Status' table header does not match…"*, *"The 'Approval Status' table header does not match…"* |

### 6.2 Search, filter, paginate, export

| ID | Requirement | Level |
|---|---|---|
| XC-08 | Every list screen provides a search form and a results grid. | **[V]** ~60 `Search*_TC` classes |
| XC-09 | Status filtering is standardised to three mutually exclusive options: **Active / Inactive / Both**, and the grid must return only records matching the selected status. | **[V]** `performAssertions` / `isValueInArray` verify every returned row's status; e.g. `SearchAirline_TC.searchWithAirLineType1..3`, `SearchDiscount_TC.TC002_filterActive`…`TC004_filterBoth` |
| XC-10 | Searching with no criteria is permitted on some grids and returns the unfiltered set. | **[V]** `searchWithoutAnyData` (Airline, Rate of Exchange) |
| XC-11 | An empty result set displays **"No data has been found!"** — never an empty grid with no explanation. | **[V]** asserted in Cancellation Charge, Statement, Quotation, Released PNR, Sync PNR, Total Due to NDC, Flight Search Limitation |
| XC-12 | Mandatory search criteria are enforced with **"Required"** before the query runs. | **[V]** Agency Wallet, Statement, Released PNR (`UserCanNotSearchWithoutMandatoryFields`), Sync PNR (`verifyThatSystemBlockTheUserSearchWithEmptyData`), Agent Information (`SearchWithoutRequiredSelectAgency`) |
| XC-13 | Results are paginated. Pagination must preserve the active filter and support **Next** and **Last**. The grid states the count, e.g. *"Showing 20 results of 80 results"*. | **[V]** `PaginationAutomation`, `paginateAndVerifyData`, `goToNextPage`/`goToLastPage`, `TC005_paginationNext`/`TC006_paginationLast`, `verifyThatUserCanPaginateTheResult` |
| XC-14 | A search whose match is not on page 1 must still be found — grids support **cross-page lookup**. | **[V]** `findMarkupInPages`, `findDiscountInPages`, `findServiceInPages` |
| XC-15 | Reports provide **Export to Excel**. | **[V]** `ValidateExportToExcelReport` (Released PNR), `verifyThatUserCanExportTheReportAsExcel` (Sync PNR), `validateThatUserCanExportTheFile` (Total Due), `Btn_ExportExcel` (AR Ledger), Quotation export |
| XC-16 | A **Reset / Clear** control returns the search form to its default state. | **[O]** `ClickReset`, `ResetFields`, `ClearFields`, `setReset` |

### 6.3 Standard field validation vocabulary

| ID | Requirement | Level |
|---|---|---|
| XC-17 | Mandatory-field violation message is **"Required"** platform-wide. | **[V]** multiple modules |
| XC-18 | Email validation message is **"Please enter a valid email"**. | **[V]** Agent Information, Portal login, Travellers |
| XC-19 | Phone validation message is **"Please enter valid phone number"**. | **[V]** `EditAgentInformation_TC.PhoneIsClickableAndChangeableInvalid` |
| XC-20 | Numeric-only fields must reject non-numeric input: **"Please match the requested format, only numeric values are allowed"**. | **[V]** `RateOfExchange_Page.assertFieldAcceptsOnlyNumbers` |
| XC-21 | Duplicate master-data names are rejected with **"This name already exists"** (generic) / **"Prefer Airline already exists."** (specific). | **[V]** Prefer Airline; generic string present in the codebase |
| XC-22 | Successful create/update confirm with a toast: **"Added Successfully"**, **"Updated Successfully"**. | **[V]** `ExpectedResult`/`UpdatedMessage` in test data across modules |
| XC-23 | Referential integrity is enforced on delete with an explanatory message, e.g. **"Department Mapped To Staff You Need To Delete The Staff First"**. | **[V]** `ActionsDepartment_TC.MapToStaff` + `Delete` |

---

## 7. Functional requirements by module

### 7.1 Dashboard (DASH)

| ID | Requirement | Level |
|---|---|---|
| DASH-01 | The Dashboard hosts a **flight search entry point** so an operator can begin a booking without navigating to Booking Mid Office. | **[O]** `DashBoard_Tc.Tc1_Search_Flights_Dashboard` |
| DASH-02 | The Dashboard supports **lookup by Booking Reference** with a date filter. | **[V]** `Tc2_search_using_Booking_Reference` → `verify_booking_reference` |
| DASH-03 | Selecting a booking reference navigates to that booking's **itinerary**, and the **ticketed document** is reachable from there. | **[O]** `Tc3_search_using_Booking_Reference_Navigates_to_Itinerary`, `click_TicketedDocument` |

### 7.2 Organisation hierarchy — Company → Branch → Agency → Agent (ORG)

The system models a four-level commercial hierarchy. Configuration **cascades downward**: a Branch
inherits from Company, an Agency inherits from its Branch, and an Agent belongs to an Agency.

| ID | Requirement | Level |
|---|---|---|
| ORG-01 | **Operating Countries** define the countries the company trades in. Full CRUD + approve/reject + active/inactive + status-filtered search. | **[V]** `CreateCountry_TC`, `SearchCountry_TC`, `ActionCountry_TC` |
| ORG-02 | **Departments** are created, edited (name + remarks), activated/deactivated, approved/rejected, and deleted — deletion blocked while staff are mapped (XC-23). | **[V]** `ActionsDepartment_TC` (11 steps: Create → Search → Active → inActive → ReActivate → Approve → Reject → Delete → MapToStaff) |
| ORG-03 | A **Branch** is created with: Brand, Country, Operating Country, Branch Name, State, City, Address, Post Office box, Phone, Email + password, owner Name/Email/Phone, **Credit Limit, Top-up Limit, Credit Terms**, Description, and one or more **Supplier Credentials** with descriptions. | **[V]** `CreateBranch_Admin_TC` + `CreateBranch.json` |
| ORG-04 | Branches are searchable and filterable by Active / Inactive / Both. | **[V]** `SearchBranch_TC` |
| ORG-05 | An **Agency** is created under a Branch. The form spans: Agency Master (branch, name, country [inherited from branch], state, city, IATA flag, PO box, company URL, phone, address 1/2), Agency Owner Details, **Document uploads with per-document Contract Start/End dates**, Agency Logo, Sales Contact, Bank Accounts, **Payment Settings**, Product Access, **Airline Supplier Credential (PCC)**, and an **Import PNR toggle**. | **[V]** `CreateAGN_TC.CreateAGN`, `AddAgencyCore_TC` + `CreateAGN.json` / `AddAgencyCore.json`; corroborated by the Create-Agency user story |
| ORG-06 | Agency Payment Settings capture **Invoice Generation frequency** (e.g. `BiWeekly`), **Credit Limit**, **Top-Up Limit**, and **Credit Terms (days)**. | **[V]** test data `invoice`, `Credit`, `Top`, `CreditTerms` |
| ORG-07 | An agency is assigned one or more **supplier PCCs** (e.g. `Galileo Live UAE`) at creation, inherited from Supplier & Branch. | **[V]** `CreateAGN.json.pcc1`, `ReflectionAgencySupplierCredential.json` |
| ORG-08 | Agencies are searchable, including an **Active-only** search. | **[V]** `CreateAGN_TC.SearchAgency`, `SearchActiveAgency` |
| ORG-09 | Agencies may **self-register** ("Request for Registration" from the Portal). Admin processes the queue by state: **New**, **In-progress**, and approves. | **[V]** `RegistrationRequest_TC.RegistrationRequestNew` / `...Inprogress` / `RegistrationRequest`; Portal `clickRequestRegistrationLink` |
| ORG-10 | **Agent Login Details** are searchable by Admin, including an end-date criterion; invalid criteria are handled. | **[V]** `SearchLoginDetails_TC` (valid / invalid / end date) |
| ORG-11 | **Staff** are created with User Type, Operating Country, Branch, Department, **Role**, Employee Name, Email, Primary + Secondary Phone, Username, and an **Approval List** (may be *"No Approver"*). | **[V]** `CreateStaff_TC` + `CreateStaff.json` |
| ORG-12 | Staff are searchable (valid and invalid criteria) and can be activated/deactivated. | **[V]** `SearchStaff_TC`, `ActionStaff_TC` |
| ORG-13 | **Top-Up Requests** are raised and searched in Admin, including an **Advance Credit** request type, and are submitted for approval. Requests are filterable by Agency, date range, Status, Payment Type (e.g. `bankTransfer`), Top-Up Reference Number, Receipt Number, and Payment Mode (Offline). | **[V]** `AddTopUpRequest_TC`, `Advance_Credit_Top_Request_TC` + `TopUpRequest.json` |

### 7.3 Master data — Geography and currency (GEO)

| ID | Requirement | Level |
|---|---|---|
| GEO-01 | Geography is a four-level hierarchy — **Region → Country → State → City** — each with full CRUD, approve/reject, activate/deactivate, and status-filtered search. | **[V]** 12 test classes under `Master/Miscellaneous/Region` |
| GEO-02 | A Country carries **passport-mandatory flags separately for International and Domestic travel** (Yes/No each). | **[V]** `Country_Page.setInternationalpassportmandatoryYes/No`, `setDomesticpassportmandatoryYes/No` |
| GEO-03 | **Currencies** are created (subject to approval) and searched with status filters. | **[V]** `CreateCurrency_TC`, `SearchCurrency_TC` |
| GEO-04 | **Rate of Exchange** is maintained as From-Currency → To-Currency → Rate, subject to approval. | **[V]** `CreateRateOfExchange_TC.CreateRateWithValidData` |
| GEO-05 | From-Currency, To-Currency, and Rate are all **mandatory**. | **[V]** `CreateRateWithoutFromCurrency`, `...WithoutToCurrency`, `...WithoutRateCurrency` |
| GEO-06 | **From and To currency must differ** — a same-currency rate is rejected. | **[V]** `CreateRateWithValidDataWithSameCurrency` |
| GEO-07 | A rate of **zero is invalid**: *"Invalid Exchange Rate"*. | **[V]** `CreateRateWithInvalidRateCurrencyZero` |
| GEO-08 | The rate field accepts **numeric input only**. | **[V]** `assertFieldAcceptsOnlyNumbers` |
| GEO-09 | An existing rate can be updated, and the update can be **cancelled without persisting**. | **[V]** `CreateRateWithValidDataUpdate`, `CancelRateWithValidDataUpdate` |
| GEO-10 | Rates are searchable by From, To, or both; a no-match combination returns the standard empty-state. | **[V]** `SearchRateOfExchange_TC` (5 variants) |
| GEO-11 | **Credential-specific Rate of Exchange** exists as a distinct screen. | **[I]** `Master_Common.clickCredentialRateOfExchange` — no test coverage |

### 7.4 Master data — Flight (FLT)

| ID | Requirement | Level |
|---|---|---|
| FLT-01 | **Airports** are created with IATA code, Name, Country, City, **Type (Domestic / International / Both)**, Station, Latitude, Longitude, and **Nearby Airports**; subject to approval. | **[V]** `AirportTCs.AddAirport` + `Airport_Page` |
| FLT-02 | Airport IATA code and Name are asserted on retrieval — codes are the stable key. | **[V]** `AssertIATA`, `AssertName` |
| FLT-03 | An airport records **how many suppliers serve it**. | **[I]** `Airport_Page.NumberOfSupplier`, `NumberOfSupplier2` |
| FLT-04 | Airports are searchable and updatable, with approval on update. | **[V]** `SearchAirport`, `UpdateAirport`, `UpdateApprove` |
| FLT-05 | **Airlines** are created with Code, Name, **Airline Type**, **Network Type**, Logo, Airline Matrix, GDS association, and Airline Details. | **[V]** `CreateAirline_TC.CreateAirline` |
| FLT-06 | An airline carries the operational flags **Allow Online Hold**, **Seat Mapping (International)**, **Seat Mapping (Domestic)**, **Online Ticketing Rules (International)**, **Online Ticketing Rules (Domestic)**. | **[V]** `CreateAirline_Page` / `UpdateAirline_Page` |
| FLT-07 | **LCC airlines** are a distinct configuration path with its own validation — an invalid LCC setup is rejected. | **[V]** `CreateAirlineLCC`, `CreateAirlineInvalidLCC` |
| FLT-08 | Airlines are searchable by Name, by **Airline Type** (3 values), by **Network Type** (3 values), and with no criteria. Every returned row must match the selected filter. | **[V]** `SearchAirline_TC` (8 tests) + `TableColumnDataExtractor` assertions |
| FLT-09 | Airline grid actions: **view (eye) with detail popup**, edit, activate/deactivate, approve/reject — each independently reachable. | **[V]** `ActionAirline_TC` (`EyeIsClickable`, `ActiveIsClickable`, `InactiveIsClickable`, `ThumbsUpIsClickable`, `ThumbsDownIsClickable`) |
| FLT-10 | **Prefer Airline** rules bind an Airline to a Supplier and a specific **PCC/supplier credential**, so preferred content can be sourced from a chosen credential. | **[V]** `CreatePreferAirLine_TC` (7 variants) |
| FLT-11 | **A Prefer Airline rule and a Restricted Airline setting on the same credential are mutually exclusive:** *"Remove the restricted airlines to add prefer airline"*. | **[V]** `testCreateForPreferAirLineWithRestractedAirLine` |
| FLT-12 | Duplicate Prefer Airline rules are rejected: *"Prefer Airline already exists."* | **[V]** asserted literal |
| FLT-13 | Prefer Airline supports multi-row entry (add/remove rows via plus/minus) and multiple supplier PCCs per airline. | **[O]** `ClickOnPlusButton`, `ClickOnMinusButton`, `clickAddSupplierPCCButton` |
| FLT-14 | Prefer Airline is searchable by name, supplier, and status, with result-count verification; and editable with remarks + approval. | **[V]** `SearchPreferAirLine_TC` (8), `EditPreferAirLine_TC` (6), `ActionPreferAirLine_TC` (4) |
| FLT-15 | **BSP Commission** rules are defined per Airline + GDS Supplier + Supplier Credential, and scoped by **Journey Type, Ticket Designator, Tour Code, Origin/Destination at Airport / City / Country level, Cabin class (Economy, Premium Economy, Business, First, All), and RBD**. | **[V]** `CreateBSPCommission_TC` + `BSPCommission_Page` |
| FLT-16 | BSP Commission supports **three independent date windows plus blackout windows**: Validity Period, Outbound Period, Inbound Period, Blackout Outbound Period, Blackout Inbound Period. | **[V]** `BSPCommission_Page.ValidityPeriodFrom/To`, `OutboundPeriodFrom/To`, `InboundPeriodFrom/To`, `BlackoutInboundPeriodFrom/To`, `BlackoutOutboundPeriodFrom/To` |
| FLT-17 | BSP Commission values are set per **Adult / Child**, with an **Exclude** option, a **Fare Basis**, a **Fare Type**, and an Amount. | **[V]** `Adult`, `Child`, `Exclude`, `Fairebasis`, `FareType`, `Amount` |
| FLT-18 | BSP Commission is searchable by Airline, Commission Name, GDS Supplier, Supplier Credential, date range, and status; and is updatable under approval. | **[V]** `SearchBSPCommission_TC`, `UpdateBSPCommission_TC` |
| FLT-19 | **Deal Codes** are created per Airline and per Country, and are editable and approvable. | **[V]** `CreateDealCode.Create_DEALCODE`, `CreateDealCode_Country`, `EditDealCode`; success *"Deal Code hAdded Successfully"* (**note the typo is in the product**) |
| FLT-20 | **RBD** (booking-class) master exists. | **[I]** `Master_Common.clickRBD` — no test coverage |

### 7.5 Master data — Supplier and credentials (SUP)

| ID | Requirement | Level |
|---|---|---|
| SUP-01 | **Suppliers** (content sources: GDS such as Amadeus / Galileo / Sabre, and airline-direct) are searchable, editable, and subject to approve/reject. | **[V]** `SearchSupplier_TC`, `EditSupplier_TC`, `ActionSupplier_TC` |
| SUP-02 | Supplier search results must be status-consistent, and a rejected supplier is distinguishable from a pending one. | **[V]** `SearchSupplierReject`, `SearchSupplierRejected` |
| SUP-03 | A **Supplier Credential** is created with: Supplier, Credential Name, **Country POC**, **Currency**, **Credential Type (Live / Test)**, **Flight Search Limit**, **Connection Timeout**, **Read Timeout**, **Endpoint URL**. | **[V]** `AddSupplierCredential_TC` + `CreateSupplierCredential.json` |
| SUP-04 | A Supplier Credential holds a **GDS designation** and a list of **Restricted Airlines** (airlines excluded from results returned on that credential). | **[V]** `AddSupplierCredential_Page.GDS`, `.RestrictedAirline` |
| SUP-05 | **Credentials cascade:** a credential configured at supplier level must be visible/assignable at **Branch** and at **Agency** level. This reflection is explicitly verified. | **[V]** `SetReflectionOnBranch`, `setReflectionOnAgency` + `ReflectionBranchSupplierCredential.json`, `ReflectionAgencySupplierCredential.json` |
| SUP-06 | Supplier Credentials are searchable with status filters and can be activated/deactivated from the grid, and edited. | **[V]** `SearchSupplierCredential_TC`, `setEditSupplierCredential` |
| SUP-07 | **Credential Fields** are user-defined metadata fields attached to supplier credentials — created (with validation on invalid input), searched, and acted upon. | **[V]** `CreateCredential_TC`, `setInvalidCredentialField`, `SearchCredentialField_TC`, `ActionCredentialField_TC` |
| SUP-08 | **Flight Search Limitation** caps the number of flight results per supplier/credential, chosen from a controlled list of values. | **[V]** `FlightSearchLimitationUpdate_TC.VerifyThatUpdateIsUpdatedSuccessfully` |
| SUP-09 | On the Flight Search Limitation screen, **Supplier Name and Supplier Credential are read-only** — the limit is the only editable attribute. | **[V]** `VerifyThatSupplierNameIsNotClickable`, `VerifyThatSupplierCredentialIsNotClickable` |
| SUP-10 | Cancelling a Flight Search Limitation edit must **not** persist the change. | **[V]** `VerifyThatCanselIsNotUpdated` |
| SUP-11 | A limit updated here must **reflect on the Supplier record and on the Supplier Credential screen**. | **[V]** `VerifyThatSuccessfulUpdatedOnSupplier`, `VerifyThatSuccessfulUpdatedFromSupplierCredentialOnSearch` |
| SUP-12 | Flight Search Limitation is searchable by credential name and status, and paginated; a non-existent credential yields the standard empty-state. | **[V]** `FlightSearchLimitationSearch_TC` (8 tests) |

### 7.6 Payment gateway (PAY)

| ID | Requirement | Level |
|---|---|---|
| PAY-01 | **Payment Methods** are configurable master data: add, edit, and enable/disable. | **[V]** `PaymentMethod_TC.testAddNewPayment`, `testEditPayment`, `testToggleStatus` |
| PAY-02 | Confirmations are **"Payment method created successfully"** / **"Payment method updated successfully"**; the activation indicator must visibly change on toggle. | **[V]** `validateSuccessMessage`, `validateActivationCircleChanged` |
| PAY-03 | Supported agency payment instruments include **Cash, Wallet, Credit Card, Bank Transfer**, and the gateways **Banque Misr** and **Fawry**. | **[V]** Portal `TopUp` page (`selectCash`, `selectBanqueMisr`, `selectFawry`, `selectBankTransfer`); Agency Payment Options per the Create-Agency story |

### 7.7 Rule Engine (RUL)

The Rule Engine is the platform's commercial core: it adjusts supplier-returned fares before an
agency sees them.

| ID | Requirement | Level |
|---|---|---|
| RUL-01 | Rule types: **Markup, Discount, Service Charge, Cancellation Charge, Fare Rules, Offer Pricing, Terms & Conditions**, plus a **Rule History** audit view. | **[V]** `RuleEngine_Common` + one test package per type |
| RUL-02 | Markup / Discount / Service Charge share a common definition shape: **Name, Description, Validity Period From/To, Country (POS), Branch, Agency, Attribute + Operator + Value** (e.g. `Supplier IN All`), **Fare Type** (Total Fare / Base Fare), **Amount Type** (Percentage / Amount), **Value**. | **[V]** `Markup.json`, `Discount.json`, `ServiceCharge.json` + corresponding page objects |
| RUL-03 | Rules are **scoped hierarchically** — Country POS → Branch → Agency — so the same rule engine serves global, branch-level, and agency-specific pricing. | **[V]** `SelectListCountryPOS`, `SelectListBranch`, `SelectServiceAgency` |
| RUL-04 | A rule's amount may be expressed as a **Percentage** or an absolute **Amount**. | **[V]** `Amounttype: "Percentage"` in create data, `"Amount"` in update data |
| RUL-05 | Rules apply against **Total Fare** or **Base Fare**. | **[V]** `Faretype` values; `CancellationCharge.json` uses Total Fare on create, Base Fare on update |
| RUL-06 | **Cancellation Charge** additionally takes **per-passenger-type amounts (Adult / Child / Infant)** and supports **Clone** and **Delete**. | **[V]** `CancellationCharge_TC` (Create/Search/Update/Delete) + `Btn_Clone` |
| RUL-07 | Cancellation Charge records carry a **system-generated code**. | **[O]** `Get_CancellationChargeCode`; *"The new code generated successfully"* |
| RUL-08 | **Fare Rules** are defined per **Supplier** and **Supplier Type**, per Country, with a validity date and a name/description, and are searchable and approvable. | **[V]** `FareRulesTCs.createFareRule`, `SearchFareRule`, `ApproveFareRule` |
| RUL-09 | **Offer Pricing** records include a **promotional image upload**, and are created / searched / updated under approve-reject governance. | **[V]** `TC_CreateOffer`, `TC_SearchOffer`, `TC_UpdateOffer` + `uploadImage` |
| RUL-10 | **Terms & Conditions** are configured per **Supplier, Country (or All Countries), Branch (or All Branches)** with a description, and are targeted at specific **display/delivery channels: E-Ticket, Confirmation Page, Review Page, Email**. | **[V]** `TermsAndConditions_Page` |
| RUL-11 | At least one channel must be selected: **"Please check atleast one event type option."** | **[V]** `CreateTermsAndConditions_TC.VerifyErrorMessages` + `ValidationMessage` in test data |
| RUL-12 | Terms & Conditions support Deselect-All / bulk channel selection, edit under approval, activate/deactivate, approve/reject, and delete. | **[V]** `UpdateTermsAndConditions_TC`, `ActionTermsAndConditions_TC` |
| RUL-13 | **Rules must demonstrably affect the price shown in booking.** Search results are asserted to reflect the configured Markup, Discount, Service Charge, and Cancellation Charge. | **[V]** `SearchBookingBranch.ValidateTheDiscountIsApplied`, `ValidateTheServiceChargeIsApplied`, `ValidateTheCancellationChargeIsApplied`; assertions *"Base Fare match"*, *"Discount match"*, *"Servic Charge match"* |
| RUL-14 | End-to-end rule lifecycle is a first-class business flow: **create rule → approve → search flights → verify the fare reflects it → update the rule → verify again**. | **[V]** `Markup_E2E_TC`, `E2EDiscount`, `EndToEndService.E2E` |
| RUL-15 | All rule types are searchable by Country + Branch, filterable Active/Inactive/Both, paginated with cross-page lookup, and approvable/rejectable with remarks. | **[V]** `SearchMarkup_TC`, `SearchDiscount_TC`, `SearchserviceCharge` |
| RUL-16 | Rules can be applied ad-hoc to a **Manual Booking Invoice** (markup 100 / service charge 25 / discount 50 in test data). | **[V]** `ManualBooking_TC.verifyThatAdminCanCreateManualBookingInvoiceSuccessfullyWithRuleEngine` |

> **Open question OQ-3:** the automation never asserts the *arithmetic* — the order of application
> (markup before or after discount), rounding, currency conversion point, and precedence when two
> rules of the same type both match are all unspecified. This is the single largest business-logic
> gap in this reconstruction.

### 7.8 Search and booking (BMO)

| ID | Requirement | Level |
|---|---|---|
| BMO-01 | An operator searches flights **on behalf of a Branch** with Origin, Destination, Date of Journey, and passenger counts for **Adult / Child / Infant**. | **[V]** `Booking_TC.SearchOneWay` + `searchBookingBrData.json` |
| BMO-02 | Multi-segment / multi-destination search is supported (a second destination and second journey date are configured). | **[I]** `searchBookingBrData.json` `secondDestination`, `dayOfSecondJourney` |
| BMO-03 | Zero results must return an explicit no-results message. | **[O]** `ReturnNoSearchResultsMsg` |
| BMO-04 | Each result exposes: **Flight Card, Fare Breakdown, Segment Details, Fare Details, Baggage Info, Pax Segment Details** via an information side panel. | **[V]** `SearchBookingBranch.FareBreakDown`, `SegmentDetails`, `FareDetails`, `BaggageInfo`, `FlightCard`, `PaxSegmentDetails` |
| BMO-05 | **Branded fares** are supported: where a branded-fare choice exists, the flow must present it and allow proceeding. | **[V]** `proceedIfBrandedFareExists` (logs *"Branded fare not found, skipping proceed…"* when absent) |
| BMO-06 | Passenger details capture per traveller: **Title, First Name, Last Name, Date of Birth, Gender, Nationality, Document Type, Document Number, Document Expiry**, Email, Phone. | **[V]** `PaxDetailsPage.fillOnePassengerDetails`, `ManualBookingInvoice` traveller fields |
| BMO-07 | Child and Infant passengers are captured as **distinct passenger types** with their own detail sets and document types. | **[V]** `selectCHDTraveller`, `fillCHDPassengerDetails1`, `selectINFTraveller`, `fillINFPassengerDetails1` |
| BMO-08 | A traveller may be selected from the **saved traveller profiles** rather than typed. | **[O]** `addTraveler`, `selectCHDTraveller` |
| BMO-09 | **Terms & Conditions must be accepted before payment** — on both Booking and Import PNR. | **[V]** `SelectTermsAndConditions`, `checkTermsAndConditionsCheckbox` |
| BMO-10 | Three outcomes are available from a selected itinerary: **Save Quote**, **Hold**, and **Pay & Book**. | **[V]** `saveQuote`, `clickOnHold`, `payAndBook` |
| BMO-11 | **Hold** must confirm success to the user. | **[V]** `AssertThatTicketIsHoldSuccessfully` |
| BMO-12 | A **Quote can be saved from two points in the funnel** — from the search-results page and from the passenger-details page — and both must confirm. | **[V]** `SaveQuote.setSearchBookingAndSaveQuoteFromSearchPage`, `...FromPaxDetailsPage`, `AssertThatQuoteSaved` |
| BMO-13 | Saving a quote can capture a **new client's** First Name, Last Name, Email, Phone. | **[V]** `QuoteData.json` |

#### Search Booking (booking retrieval)

| ID | Requirement | Level |
|---|---|---|
| BMO-14 | Bookings are retrievable by any of: **Booking date range, Order ID, Booking Reference, Ticket Number, Airline/GDS PNR, Branch, Agency, Payment Status, Booking Status, Refund ID, Pax First/Last Name, Client Name, Client Email, Invoice Number**, plus flight/booking type. | **[V]** `SearchBooking_Page` + `SearchBookingTCs` (6 filter tests) + `SearchBooking.json` |
| BMO-15 | Results are paginated with an explicit count (*"Showing 20 results"* / *"Showing 10 results"*). | **[V]** `verifyThatUserCanPaginateTheResult` |

#### My Quotes

| ID | Requirement | Level |
|---|---|---|
| BMO-16 | Quotes are searchable by **Branch (mandatory), Agency, Quote Number, Passenger Name, Passenger Email, Agent Name, Creation Date, Travel Date, Quote Status**, and by all filters combined. | **[V]** `QuoteSearch` (11 tests) |
| BMO-17 | **Creation Date and Travel Date are distinct filter dimensions** and each must be honoured independently. | **[V]** `SearchByBranchNameAndCreationDate` / `...AndTravelDate`, `VerifyThatOnlyQuotesWithinCreationOrTravelDateAreDisplayed` |
| BMO-18 | Filtered results must contain **only** rows matching the selected Status / Agency. | **[V]** `VerifyThatOnlySelectedStatusDataAreDisplayed`, `VerifyThatOnlySelectedAgencyDataAreDisplayed` |
| BMO-19 | A quote opens in a **detail popup**. | **[V]** `CheckThatQuotePopupIsOpened`, `VerifyThatQuotePopupDisplayed` |
| BMO-20 | A quote can be **rejected**, and its status must update accordingly. | **[V]** `RejectQuote` + `ValidateQuoteStatus` |

#### Manual Booking Invoice

| ID | Requirement | Level |
|---|---|---|
| BMO-21 | Staff can raise a **Manual Booking Invoice** for travel booked outside the platform: Branch, Agency, Agent, Route (From/To), Date, Supplier, Airline, **supporting PDF upload**, GDS PNR, Airline PNR, Flight Number, and an **Assigned User**. | **[V]** `ManualBooking_TC` + `ManualBookingInvoice` page + `ManualInvoice.json` |
| BMO-22 | Fares are entered **manually as Base Fare + Tax per passenger type (ADT / CHD / INF)**, and the resulting Base Fare and Tax must be asserted on the created invoice. | **[V]** `enterBaseADT`…`enterTaxINF`, `assertBaseFare`, `assertTax` |
| BMO-23 | Ticket numbers are entered per passenger type. | **[V]** `enterADTTicketNumber`, `enterCHDTicketNumber`, `enterINFTicketNumber` |
| BMO-24 | Rule Engine rules can be applied to a manual invoice. | **[V]** `addRuleEngine` + `...WithRuleEngine` test |
| BMO-25 | Manual invoices can be raised **both by Admin and on behalf of / by an Agency**. | **[V]** `verifyThatAdminCanCreateManualBookingInvoiceSuccessfully`, `verifyThatAgencyCanCreateManualBookingInvoiceSuccessfully` |
| BMO-26 | The created invoice must display **Route, Passenger Count, Trip Type**, and expandable **Segment Details**. | **[V]** `assertRouteVisible`, `assertPassengerCountVisible`, `assertTripTypeVisible`, `openSegmentsDetails` |

### 7.9 Import PNR (IPN)

Importing a PNR created directly in a GDS into NDC for ticketing/servicing.

| ID | Requirement | Level |
|---|---|---|
| IPN-01 | An import is initiated with a **PNR code** plus **Branch** (and optionally **Agency + Agent**), **Supplier**, and **Supplier Credential**. | **[V]** `ImportPNR_Test.TC01`, `TC02` |
| IPN-02 | PNR code length must be **≥ 6 characters**: *"PNR code less than 6 chars!"* | **[V]** `TC04` |
| IPN-03 | PNR code length must be **≤ 9 characters**: *"PNR code cannot exceed 9 characters"* | **[V]** `TC03` (assertion string in the test is malformed — see §14, DEF-1) |
| IPN-04 | A non-existent PNR returns the GDS message **"UNABLE TO RETRIEVE - CHECK RECORD LOCATOR - `<code>`"**, echoing the attempted code. | **[V]** `TC08` |
| IPN-05 | **Import PNR must be explicitly enabled for the organisation.** A Branch/Agency with the feature closed is refused: *"Selected Organization does not support import pnr functionality"*. | **[V]** `TC05`, `TC06`; the toggle is set at agency creation (ORG-05) |
| IPN-06 | An **already-ticketed** PNR is shown with status *"Ticketed"* and **the Pay button must be disabled**. | **[V]** `TC07` — `Assert.assertFalse(isPayButtonClickable())` |
| IPN-07 | A **cancelled** PNR is refused: *"No Segments found for this PNR."* | **[V]** `TC010` |
| IPN-08 | Attempting to import a PNR that belongs to **a different supplier credential** must be refused with the GDS message *"BOOKING FILE DISPLAY DENIED PER SELECTIVE ACCESS AGREEMENT"*. | **[V]** `TC09`, `TC011` |
| IPN-09 | Re-importing a PNR **already present in this environment** is refused: *"This PNR is already exist kindly go to My Booking section to retrieve the details."* | **[V]** `TC012` |
| IPN-10 | Payment requires **Terms & Conditions acceptance** and a **confirmation popup** before charging. | **[V]** `checkTermsAndConditionsCheckbox` → `clickMainPayButton` → `clickConfirmPayPopupPayButton` |
| IPN-11 | **The total fare must be identical before and after payment** — no price change may occur during the payment step. | **[V]** `TC01` asserts `totalFareAfterPay == totalFareBeforePay` |
| IPN-12 | On success: *"Your ticket has been successfully Confirmed. Thank you for choosing NDC"*. | **[V]** `TC01` |
| IPN-13 | Both **AUTO** and **MANUAL** ticketing types are supported. | **[I]** `ImportPNR.json` `validAutoTicketingPnr` / `validManualTicketingPnr` — only AUTO is exercised |

### 7.10 Traveller / client management (TRV)

| ID | Requirement | Level |
|---|---|---|
| TRV-01 | Traveller profiles store **Personal Details** and **Passport Details** as distinct sections, and are created, updated, and searched. | **[V]** `CreateTravellers_TC`, `UpdateTraveller_TC`, `SearchTravellers_TC` |
| TRV-02 | Travellers are searchable with Active / Inactive / Both status filters. | **[V]** `SearchTravellers_Page` |
| TRV-03 | On the Portal, a traveller can be created with **mandatory fields only**, and separately with **mandatory + optional** fields. | **[V]** `VerifyAddingTravellerWithOnlyMandatoryFields`, `VerifyAddingTravellerWithMandatoryAndOptionalFields` |
| TRV-04 | Omitting a mandatory field blocks creation with a field-level message (e.g. First Name required). | **[V]** `VerifyAddingTravellerWithoutSendingAllMandatoryFields` + `IsFirstNameRequiredMessageDisplayed` |
| TRV-05 | Traveller identity documents support **Passport, Iqama, and National ID**, each with a country of issue. | **[V]** `SelectPassportCountryIssue`, `SelectIqamaCountryIssue`, `SelectNationalIDCountryIssue` |
| TRV-06 | Traveller attributes include Title, Nationality, Gender, Country. | **[V]** `selectTitle`, `selectNationality`, `selectGender` |
| TRV-07 | Travellers can be **edited, deactivated, and reactivated**; each action confirms via toast (*"Traveller has been added successfully"*, *"Traveller has been updated successfully"*). | **[V]** `EditTravellerData`, `DeactivateTraveller`, `ActivateTraveller` |
| TRV-08 | Portal traveller search supports **Client ID, Client Name, Email, Phone Number, Country, and all fields combined**, with returned rows verified against the criteria. | **[V]** `TravellerModuleTests` (6 search tests) + `AssertThatCorrectDataAreDisplayed` |
| TRV-09 | Admin can search **any agency's travellers** via User Management → Traveller Details, filtered by Agency, Agent, Client ID, Client Name, Email, Phone, **Corporate flag, Type, Nationality**. | **[V]** `travellersDetails_TC` (7 tests) + `travellersDetails_Page` |
| TRV-10 | Agency selection is **mandatory** for the Admin traveller search. | **[V]** `SearchWithOutAgentInformation` |
| TRV-11 | Invalid phone / email formats are rejected on the Admin traveller search. | **[V]** `SearchWithInValidPhoneAgentInformation`, `SearchWithInValidEmailAgentInformation` |

### 7.11 Agency user administration (USM)

| ID | Requirement | Level |
|---|---|---|
| USM-01 | Admin searches agency users by **Agency (mandatory) + Full Name / Phone / Email**, individually or combined. | **[V]** `SearchAgentInformation_TC` (4 positive tests) |
| USM-02 | Agency is a **required** search criterion. | **[V]** `SearchWithoutRequiredSelectAgency` |
| USM-03 | Invalid phone / invalid email / non-existent name are handled with validation or the standard empty-state. | **[V]** `SearchWithInvalidPhoneNumber`, `SearchWithInvalidEmail`, `SearchWithValidDataAndNotExistName` |
| USM-04 | Editing an agency user is available **to Super Admin**. | **[V]** `EditButtonExistForSuperAdmin` |
| USM-05 | **Full Name is immutable** on an existing agency user. | **[V]** `FullNameCannotBeChanged` |
| USM-06 | Email, primary Phone, and **Key/secondary Phone** are editable and format-validated. | **[V]** `EmailIsClickableAndChangeableInvalid`, `PhoneIsClickableAndChangeableInvalid`, `KeyPhoneIsClickableAndChangeableInvalid` |
| USM-07 | Cancelling an edit discards it; a saved edit must be **reflected on the record**. | **[V]** `CancelButtonIsClickable`, `ReflectionAfterSuccessfullyUpdate` |
| USM-08 | Agency users are viewable in a read-only detail panel that can be closed. | **[V]** `ValidView`, `ValidCloseView` |
| USM-09 | Admin/Agent users and **Agency Owner** users are activated/deactivated through **separate controls** (the owner is a distinct case). | **[V]** `VerifyClickingOnActiveButtonForAgentOrAdmin`, `VerifyClickingOnInActiveButtonForAgentOrAdminToActive`, `VerifyClickingOnActiveButtonForAgencyOwner` |
| USM-10 | A locked agency user can be **unlocked** from the view panel, with Yes/No confirmation. | **[V]** `UnlockClickableAndClickYes`, `UnlockClickableAndClickNoClickable` |

### 7.12 Admin settings (SET)

| ID | Requirement | Level |
|---|---|---|
| SET-01 | A global **flight-search result limit** is configurable from a controlled value list (`0,1,2,3,4,5,8,10,20,40,50,60,70,80,90,100,150,200,250`). | **[V]** `AdminSettings_TC` + `AdminSettings.json` |
| SET-02 | A global **Upselling** setting is configurable (enabled/disabled or count). | **[V]** `EditNewUpsellingNum` + `UpSelling1: "1"`, `UpSelling2: "0"` |
| SET-03 | A global **Refund** setting is configurable. | **[O]** `EditNewRefundNum` |
| SET-04 | Admin Settings changes require **Super Admin** to take effect (login switch in the flow). | **[I]** `AdminSettings_Page.LoginAsSuperAdmin` — see OQ-1 |

### 7.13 Reports (RPT)

All reports honour §6.2 (mandatory criteria, empty-state, pagination, Excel export).

| ID | Report | Criteria | Level |
|---|---|---|---|
| RPT-01 | **Agency Wallet** | Branch, Agency (supports `All`), **Currency** — all required (*"Required"*); invalid branch and invalid currency handled | **[V]** `AGNWallTC` |
| RPT-02 | **Booking** | Branch, From/To date, Email, Client Name, Phone; **Advanced:** Invoice Number, Booking Reference, Airline PNR, Ticket Number, Booking Status | **[V]** `BookingReport_TC` + `BookingReport` page |
| RPT-03 | **Import PNR** | Branch, Agency, From/To date; invalid From and invalid To date handled | **[V]** `Import_TC` |
| RPT-04 | **AR Ledger** | Branch, Agency, Invoice From/To date; Excel export | **[V]** `LedgerReportDetails_TC` |
| RPT-05 | **Quotation** | Branch + Agency, **Duration presets (Today / Current Week / Date Range)**, **date basis (Creation Date vs Travel Date)**, Quote Status, Client Name, Email, Quote No; export; pagination; no-data | **[V]** `QuotationTCs` (11 tests) |
| RPT-06 | **Released PNR** | From/To date **mandatory** (search blocked without them), Order ID, Booking Reference; export; pagination; no-data | **[V]** `ReleasedPNR_TCs` (7 tests) |
| RPT-07 | **Sales** | Branch, Agency, Start/End date, Invoice Number, Customer Name, Payment Date, Transaction ID | **[V]** `SearchSalesReport_TC` |
| RPT-08 | **Statement** | Branch + Invoice From/To **all mandatory**; **'Invoice To' must be after 'Invoice From'**; **date range must not exceed 60 days** | **[V]** `StateTC` — *"'Invoice To' date must be after 'Invoice From' date."*, *"Date difference between 'From' and 'To' should not exceed 60 days."* |
| RPT-09 | **Sync PNR** | From/To date mandatory (empty search blocked), Order ID, FB Booking/QR Reference No; export; pagination; no-data | **[V]** `SyncPNR_TC` (9 tests) |
| RPT-10 | **Total Due to NDC** | Branch, Agency, From/To date, Invoice Number, Customer Name, Booking Reference; export; pagination; a valid search must return **more than 10 rows** in the reference dataset | **[V]** `TotalDueToNDC_TC` — assertion *"Expected value to be greater than 10 but found:"* |
| RPT-11 | **Wallet History** | Branch, Agency, From/To date | **[V]** `WalletHistoryReport_TC` |
| RPT-12 | **Daily Sales**, **Transfer PNR**, **Finance** | menu entries exist; no automation coverage | **[I]** `Reports_Common.clickDailySales`, `clickTransferPNR`, `clickFinance` |

### 7.14 Portal — agency self-service (PTL)

| ID | Requirement | Level |
|---|---|---|
| PTL-01 | An agency tops up its **wallet** from the Portal by entering an **Amount** and selecting a payment method. | **[V]** `TopUpTCs` |
| PTL-02 | **Cash** top-up is supported. | **[V]** `verifyThatAgencyCanCreateTopUpSuccessfully` |
| PTL-03 | **Card payment via Banque Misr** captures Card Number, Expiry Month, Expiry Year, Card Holder Name, CVV, then Next → Confirm → Pay. | **[V]** `...withBanqueMasr` + `TopUpPortal.json` |
| PTL-04 | **Fawry** payment captures Email and Phone Number. | **[V]** `...withFawry` |
| PTL-05 | **Bank Transfer** captures Remarks and requires a **supporting document upload**, then **Send for Approval**. | **[V]** `TopUp.selectBankTransfer`, `clickUploadDocument`, `clickSendForApproval` |
| PTL-06 | Every top-up is confirmed with **"Your Top up has been processed successfully and sent for approval!!"** — i.e. **all top-ups are subject to operator approval before crediting the wallet** (Admin side: ORG-13). | **[V]** asserted literal + `getTopUpAmountLocator` |
| PTL-07 | An end-to-end top-up journey (Portal request → Admin approval → wallet effect) is a defined business flow. | **[O]** `endToEndTopUp` |
| PTL-08 | An agency manages its own **agents**: an agency admin can add an agent, and **an agent can add another agent**. | **[V]** `ProfileManagementtest.Tc1_ADD_NEW_AGENT_admin`, `Tc2_ADD_NEW_AGENT_AGENT` |
| PTL-09 | Agent profiles capture Full Name, Email, Address and support **document upload**. | **[V]** `ProfileManagemet.type_full_name_dynamic`, `TYPE_EMAIL`, `TYPE_Address`, `UploadPDF` |
| PTL-10 | Agents are searchable and editable, including activate/deactivate. | **[V]** `Tc3_Sesrch`, `Tc4_edit_active`, `Tc5_end_to_end` |
| PTL-11 | **Settings → Financial** lets an agency set its **own markup per airline**, separately for **Domestic** and **International**, with a **"For Each Airline"** mode. | **[V]** `FinancialTest` + `Financial_Page.click_ForEachAirline`, `click_Domestic`, `click_International` |
| PTL-12 | Financial markup can be scoped **per agent**, and airlines/agents are searchable by name within the screen. | **[V]** `select_AgentName`, `type_SearchByName`, `verify_AgentExistsInResults`, `verify_AirlineExistsInResults` |
| PTL-13 | An agency edits an airline's markup value and submits; the change confirms via **"Markup updated successfully"** and the **new value must be visible on the grid**. | **[V]** `Tc3_Edit_Markup_Value` → `verify_MarkupUpdatedToast`, `verify_MarkupValueUpdated` |
| PTL-14 | A newly created agent must be **visible in the Financial screen's agent list** — agent creation and financial configuration are linked. | **[V]** `Tc1_Create_Agent` → `Tc2_Verify_Airline_In_Financial` (agent created with Faker data, then verified) |
| PTL-15 | The Portal exposes a **Booking report** to agencies. | **[I]** `PortalPages/Reports/Booking` exists; no test methods |

---

## 8. Data model (entities and key relationships)

Derived from page objects, test data, and cascade assertions.

```
Company
 └── OperatingCountry (passport-mandatory flags: domestic, international)
 └── Department ──< Staff
 └── Role (permission matrix: module × sub-module × tab × {View, Edit, Approval}) ──< Staff
 └── Branch (credit limit, top-up limit, credit terms, supplier credentials)
      └── Agency (credit limit, top-up limit, credit terms, invoice frequency, payment options,
          │        documents + contract dates, logo, bank accounts, PCCs, import-PNR flag)
          ├──< Agent / AgencyOwner ──< Traveller (passport | iqama | national ID)
          ├──< Wallet ──< TopUpRequest (cash | card | Fawry | bank transfer) ──> approval
          └──< FinancialMarkup (per airline × {domestic, international} × agent)

Supplier (GDS | direct)
 └── SupplierCredential (country POC, currency, Live|Test, search limit, timeouts, endpoint URL)
      ├──< CredentialField
      ├──< RestrictedAirline
      └──> assigned to Branch and Agency  (SUP-05 cascade)

Airline ── PreferAirline ──> (Supplier, PCC)          [mutually exclusive with RestrictedAirline]
Airline ── BSPCommission ──> (GDS supplier, credential, journey/route/cabin/RBD scope, date windows)
Airline ── DealCode ──> Country

Region → Country → State → City
Currency ── RateOfExchange (from, to, rate)

Rule (Markup | Discount | ServiceCharge | CancellationCharge | FareRule | OfferPricing | T&C)
 └── scope: CountryPOS → Branch → Agency, attribute/operator/value, validity window
 └── effect: fare type (total|base) × amount type (percentage|amount) × value
 └── governance: send-for-approval → approve|reject (+remarks) → active|inactive → RuleHistory

Booking / Order
 ├── keys: OrderID, BookingReference, GDS/Airline PNR, TicketNo, InvoiceNo, RefundID
 ├── statuses: BookingStatus, PaymentStatus
 ├── origins: Search&Book | Hold | Quote | ManualBookingInvoice | ImportPNR
 └── passengers: ADT | CHD | INF (base fare + tax each, ticket number each)

Quote (quote no, branch, agency, agent, pax name/email, creation date, travel date, status)
```

---

## 9. Business rule catalogue (exact, product-confirmed strings)

These are literal, product-owned strings asserted by automation. Treat them as **contractual copy** —
changing them breaks both the product contract and the regression suite.

### 9.1 Blocking validations

| Rule | Message |
|---|---|
| Mandatory field | `Required` |
| Invalid email | `Please enter a valid email` |
| Invalid phone | `Please enter valid phone number` |
| Invalid agency code (Portal) | `Please enter a valid agency code` |
| Numeric-only field | `Please match the requested format, only numeric values are allowed` |
| Password length | `Password length should be 8 to 64 characters.` |
| Password confirmation | `New password and confirm password should be same.` |
| Wrong old password | `Password change was not successful: Old password is wrong, Please enter correct password` |
| Invalid login (Admin + Portal) | `Invalid credentials, Please try again.` |
| Account locked (3 OTP failures) | `Your account has been locked` |
| OTP resend limit | `We can't send the OTP` |
| Exchange rate zero/invalid | `Invalid Exchange Rate` |
| Duplicate name | `This name already exists` / `Prefer Airline already exists.` |
| Prefer-vs-restricted conflict | `Remove the restricted airlines to add prefer airline` |
| Department in use | `Department Mapped To Staff You Need To Delete The Staff First` |
| T&C channel not selected | `Please check atleast one event type option.` |
| Statement date order | `'Invoice To' date must be after 'Invoice From' date.` |
| Statement date span | `Date difference between 'From' and 'To' should not exceed 60 days.` |
| PNR too short | `PNR code less than 6 chars!` |
| PNR too long | `PNR code cannot exceed 9 characters` |
| PNR not found | `UNABLE TO RETRIEVE - CHECK RECORD LOCATOR - <code>` |
| Import PNR not enabled | `Selected Organization does not support import pnr functionality` |
| Cancelled PNR | `No Segments found for this PNR.` |
| Wrong credential for PNR | `BOOKING FILE DISPLAY DENIED PER SELECTIVE ACCESS AGREEMENT` |
| PNR already imported | `This PNR is already exist kindly go to My Booking section to retrieve the details.` |

### 9.2 Empty state and success

| Rule | Message |
|---|---|
| No results | `No data has been found!` |
| Record created | `Added Successfully` |
| Record updated | `Updated Successfully` |
| Awaiting approval | `Pending for approval` |
| Deal code created | `Deal Code hAdded Successfully` *(product typo — DEF-2)* |
| Payment method created / updated | `Payment method created successfully` / `Payment method updated successfully` |
| Traveller created / updated | `Traveller has been added successfully` / `Traveller has been updated successfully` |
| Ticket confirmed | `Your ticket has been successfully Confirmed. Thank you for choosing NDC` |
| Top-up submitted | `Your Top up has been processed successfully and sent for approval!!` |
| Markup updated (Portal Financial) | `Markup updated successfully` |
| Grid count format | `Showing <n> results of <m> results` |

---

## 10. Integrations

| Integration | Evidence | Requirement |
|---|---|---|
| **GDS / content suppliers** | `Amadeus`, `Galileo`, `Sabre` PCCs; `Galileo Live UAE`, `Amadeus Live`; supplier type GDS vs non-GDS | The platform must aggregate content from multiple GDSs, each addressed through a named credential/PCC with its own endpoint URL, connection timeout, read timeout, and result limit (SUP-03). |
| **Airlines (direct/NDC)** | Airline master with LCC and network type, `AirArabiaEgypt`, `EgyptAir`, `Aegean Airlines` | Airline-level configuration must distinguish LCC from full-service and carry its own ticketing/seat-map rules per domestic/international (FLT-06/07). |
| **Payment gateways** | `Banque Misr` (card: PAN, expiry, holder, CVV, 3-step confirm), `Fawry` (email + phone), Bank Transfer (document upload), Cash | Wallet top-up must support at least these four instruments (PTL-02…05). |
| **Email** | `GmailReaderUtil` reads OTP and reset mails; `sendGridUsage.pdf` in test resources | The platform must send OTP codes, password-reset links, and (per T&C channels) booking documents by email. SendGrid is the presumed transport. |
| **Database** | `Generic_Classes.Connect_DB_And_Execute_Query`, `Get_DB_Config_STG`, `Execute_And_Save_To_CSV_Production_DB`, `DBs_Query_Execution/A_Run_Query_OnSTG_DB_TC`, `DBVerification_TC` | Certain outcomes (notably OTP issuance) are verified at database level — the DB is treated as an assertable system of record. |
| **File storage** | `FileUploadUtil`, PDF uploads on Agency documents, Manual Invoice, Bank Transfer receipt, Portal agent profile; image upload for Airline logo, Agency logo, Offer Pricing | Document and image upload/retention is required in at least six flows. Format/size constraints (PDF; image ≤ 2 MB) come from the Create-Agency story, not from automation. |

**Reference environments** (from `Environment.properties`): Admin at `http://192.168.1.70`, Portal at
`http://192.168.1.92:9500`, plus a **STG** database and a **Production** database reachable by the
suite. Credentials are stored in plaintext in that file — see §14, DEF-3.

---

## 11. End-to-end business journeys

The suite defines these as explicit E2E flows; they are the platform's primary value paths and
should be the acceptance backbone for any release.

| ID | Journey | Evidence |
|---|---|---|
| E2E-01 | **Commercial rule → live price.** Create rule → approve → search flights → assert fare reflects the rule → update rule → assert the new fare. | `Markup_E2E_TC`, `E2EDiscount`, `EndToEndService.E2E` |
| E2E-02 | **Role → user → enforced access.** Create role with a permission set → submit → approve → create staff on that role → log in as them → assert only those permissions are available. | `Role_TC.CreateRoleWith*PermessionAndCreateStaffAndLoginWithIt` |
| E2E-03 | **Credential cascade.** Create supplier credential → assert it appears at Branch → assert it appears at Agency → edit → assert reflection. | `Demo` / `AddSupplierCredential_TC` (`SetReflectionOnBranch`, `setReflectionOnAgency`) |
| E2E-04 | **Agency onboarding → Portal access.** Create agency → activate agency owner in Admin → owner logs into Portal. | `CreateAGN_TC` + `VerifyThatAgencyOwnerCanLoginPortal` |
| E2E-05 | **Wallet funding.** Portal top-up → "sent for approval" → Admin Top-Up Request approval. | `endToEndTopUp` + `AddTopUpRequest_TC` |
| E2E-06 | **Quote to booking.** Search → save quote (from results or pax details) → find in My Quotes → open → reject or convert. | `SaveQuote`, `QuoteSearch` |
| E2E-07 | **Import external PNR to ticket.** Enter PNR + credential → retrieve → accept T&C → pay (fare unchanged) → ticket confirmed. | `ImportPNR_Test.TC01` |
| E2E-08 | **Portal agent → own markup.** Create agent → agent appears in Financial → set/edit per-airline markup → verify persisted. | `FinancialTest` |
| E2E-09 | **Flight search limit propagation.** Set limit on Flight Search Limitation → verify on Supplier → verify on Supplier Credential. | `FlightSearchLimitationUpdate_TC` |

---

## 12. Non-functional requirements

Almost nothing here is evidenced. Everything below is either weakly inferred or an explicit gap
the business must fill.

| ID | Requirement | Level |
|---|---|---|
| NFR-01 | The system must support configurable per-supplier result caps (0–250) — implying **search latency is a managed concern**. | **[I]** SET-01 / SUP-08 |
| NFR-02 | Supplier calls have configurable **connection timeout** and **read timeout** per credential (test data: 1000 ms / 2000 ms) — the platform must degrade gracefully when a supplier is slow. | **[I]** SUP-03 |
| NFR-03 | Reporting queries over transactional data are **range-capped (Statement: 60 days)** — a deliberate performance guard. | **[V]** RPT-08 |
| NFR-04 | Grids default to page sizes of 10/20 rows. | **[I]** `Showing 10 results` / `Showing 20 results` |
| NFR-05 | The platform is a **browser-based web application**, validated on Chrome. | **[V]** `browser=chrome`, `DriverFactory.DriverType.CHROME`. Multi-browser support is **unspecified** — OQ-4. |
| NFR-06 | Localisation: non-Latin (Arabic) input is handled in login. Whether the UI itself is localised is **unspecified**. | **[I]** `LogInWithArabicAndValidPassword` — OQ-5 |
| **Missing** | Availability/uptime target, concurrent-user capacity, search response-time SLA, data retention, PCI-DSS scope for card top-up, GDPR/passport-data handling, audit-log retention, disaster recovery, accessibility. | **not derivable** |

---

## 13. Coverage gaps — requirements known to exist but absent from automation

These come from the platform's user-story backlog (`platform_core_data/PRD.md`, i.e. requirements the
business has written) and have **no counterpart anywhere in this automation suite**. They are real
product scope that this reconstruction cannot describe from code.

| Gap | Business requirement | Status in automation |
|---|---|---|
| **GAP-1 — Credential Route White/Black List** | Filter returned journeys by supplier credential at **route level** (origin–destination), not only airport level. One list with a White/Black radio; whitelisting implies everything else is blacklisted. | **No coverage.** No page object, test, or locator for route-level filtering. |
| **GAP-2 — Airport White/Black List** | Airport-level allow/deny, which combines with GAP-1 under **AND** logic: if either module blacklists, the route must not appear; a route appears only when both permit it. | **No coverage.** |
| **GAP-3 — Airline-level route filtering (T3087)** | For **GDS suppliers only**, an Airlines multi-select on White/Black list rules; hidden for non-GDS; active airlines only; applied **after supplier response and before Rule Engine / aggregation / display**; must behave identically in Admin and Portal booking. | **No coverage.** Note the interaction with FLT-11: `RestrictedAirline` exists on the credential and is asserted to conflict with Prefer Airline, but the whitelist/blacklist airline feature itself is absent. |
| **GAP-4 — Audit log** | An audit log tracking system activities and changes; a supplier-verification function that identifies the failing system layer. | **No coverage.** `Rule History` exists in the Rule Engine menu but has no test. |
| **GAP-5 — Route tag** | A tag usable as a reference across routes, applicable to **either** origin **or** destination at route level, never both. | **No coverage.** |
| **GAP-6 — Role rules** | Role-name uniqueness message, "at least one authorisation" validation, and **View auto-ticking when Edit/Approval is ticked**. | Role CRUD and enforcement are covered (§5); these three specific rules are not. |
| **GAP-7 — Agency field-level validation matrix** | The Create-Agency story specifies ~45 fields with exact validation and message per field (mandatory/optional, type, message). | Only the happy path is automated; no negative field-level coverage. |
| **GAP-8 — Agency draft/approve/reject** | "Submit for approval **or save as draft**, with options to approve, reject, or cancel." | Draft save is not automated. |
| **GAP-9 — Menu items with no coverage** | RBD master, Credential Rate of Exchange, Daily Sales report, Transfer PNR report/module, Finance report, PNR Query module, Portal Booking report. | Menu entries only. |

---

## 14. Defects and hygiene issues found while deriving this document

Reported as observations for the owning team; none were changed.

| ID | Finding | Location |
|---|---|---|
| DEF-1 | **The PNR max-length test cannot pass as written.** `TC03_validatePnrCodeLength` asserts `actualMessage.matches("PNR code cannot exceed 9 characters554")` — a stray `554` appended to the expected message, and `matches()` requires a full-string regex match. It also reads the message via an inline XPath rather than the page object, and it enters `pnrCode` (6 chars) rather than an over-length code, so the message it looks for would never appear. | [src/test/java/AdminPages/ImportPNR/ImportPNR_Test.java:97-98](../src/test/java/AdminPages/ImportPNR/ImportPNR_Test.java#L97-L98) |
| DEF-2 | **Product-side typo in a user-facing message:** `Deal Code hAdded Successfully`. | Deal Code creation |
| DEF-3 | **Plaintext credentials committed to a repo with a live GitHub remote** — Admin, Super Admin, and Portal accounts in `Environment.properties`, plus hardcoded logins in Java. Rotate the accounts and scrub history if that remote is not private. | `src/test/resources/Environment.properties`, `AdminPages/Login/LogIn_Page.java`, `src/test/java/AdminPages/Login/LogIn_TC.java` |
| DEF-4 | **Environment coupling:** ~40 `@AfterMethod` hooks hardcode `driver.browser().navigateToURL("http://192.168.1.70")`, bypassing `Environment.properties`. The suite cannot run against another environment without edits. | e.g. `StateTC.Reload`, `ChangePassword_TC.navigateBackToURL` |
| DEF-5 | **Assertions that cannot fail:** several tests only click and log (`Booking_TC.Book`, `TC02_importPNrWithAgency`, `Tc1_Search_Flights_Dashboard`) — they pass whenever no exception is thrown. Coverage claims for those requirements are marked **[O]**, not **[V]**, above. | multiple |
| DEF-6 | **Test data hardcodes environment-specific records** — branch `AboBakrTravel (BRN471)`, PNR `GXY8L1`, order `BRN2TESORD260408RGSOH9`, past dates (`2026-05-20` departures, `03/20/2026` search windows). Several tests will rot as data ages. | `src/test/resources/testDataFiles/*.json` |
| DEF-7 | **Duplicate page objects** — `Country_Page`/`CreateCountry_Page`/`SearchCountry_Page`/`ActionCountry_Page` (same for Region, State, City, Currency, Supplier, SupplierCredential, CredentialField, RateOfExchange) hold overlapping locators; and two near-identical base classes `TestBase` / `TestBase_TC`. Requirement extraction had to reconcile divergent copies. | `src/main/java/AdminPages/Master/**` |

---

## 15. Open questions for the business

| ID | Question | Why it matters |
|---|---|---|
| OQ-1 | Is **self-approval prohibited**? Automation consistently switches to Super Admin to approve, but never asserts that the maker is blocked. | Core governance control (XC-06). |
| OQ-2 | What is the **complete approval matrix** — which record types require approval, and which role approves each? | Currently inferred module by module. |
| OQ-3 | **How is a final fare computed?** Order of Markup / Discount / Service Charge / BSP Commission, rounding, currency-conversion point, and precedence when two rules of the same type match. | The commercial heart of the product is unspecified (RUL, note after §7.7). |
| OQ-4 | Which **browsers and devices** must be supported? Is the Portal expected to work on mobile? | Only Chrome is exercised. |
| OQ-5 | Is the UI **localised / RTL-capable**? Arabic input is handled at login only. | Egypt/UAE market focus implies Arabic may be required. |
| OQ-6 | What happens to **in-flight bookings when a rule, credential, or agency credit limit changes** mid-session? | No coverage of concurrent-change behaviour. |
| OQ-7 | **Credit enforcement:** what exactly happens at the credit limit, the top-up limit, the reaching-percentage threshold, and past credit terms in days? | The fields are configured everywhere; no test exercises the enforcement. |
| OQ-8 | What is the authoritative **booking status and payment status lifecycle**? Filters exist for both; the value sets and transitions are unknown. | Needed for any booking-lifecycle requirement. |
| OQ-9 | Is **Hold** time-limited (auto-release)? A "Released PNR" report exists, implying an expiry process. | Hold/release is a revenue-affecting rule. |
| OQ-10 | Should the **60-day Statement cap** apply to other reports too? Only Statement enforces it. | Consistency and performance. |

---

## 16. Traceability — requirement area to automation coverage

| Area | Test classes | Test methods (approx.) | Assertion quality |
|---|---|---|---|
| Authentication (Admin + Portal + OTP + password) | 8 | 34 | Strong — messages asserted |
| Roles & permissions | 2 | 15 | Strong — runtime enforcement verified |
| Organisation (Company/Branch/Agency/Staff/TopUp) | 15 | 60 | Mixed — creates asserted, negative paths thin |
| Master: geography & currency | 15 | 48 | Strong on validation, status filters verified row-by-row |
| Master: flight | 14 | 55 | Strong on Airline/Prefer Airline; BSP create-only |
| Master: supplier & credentials | 10 | 37 | Strong — cascade explicitly verified |
| Payment method | 1 | 3 | Adequate |
| Rule Engine | 14 | 45 | Strong on lifecycle + E2E price effect; **no arithmetic** |
| Booking / quotes / manual invoice | 6 | 30 | Mixed — some non-asserting tests (DEF-5) |
| Import PNR | 1 | 12 | **Strongest module** — every negative path asserted |
| Travellers | 5 | 25 | Strong |
| Agency user administration | 5 | 27 | Strong |
| Reports | 13 | 60 | Strong on mandatory-field and empty-state rules |
| Admin settings | 1 | 2 | Thin |
| Portal (top-up, agents, financial) | 4 | 15 | Adequate; new-ish, Faker-driven |
| **Route/airline white-black list (GAP-1..3, 5)** | 0 | 0 | **None** |
| **Audit log (GAP-4)** | 0 | 0 | **None** |

---

## 17. Provenance

Generated by analysing, in this repository:

- `src/test/java/**` — 122 classes, ~358 `@Test`/`public void` methods (test names, flow order, assertions)
- `src/main/java/AdminPages/**`, `src/main/java/PortalPages/**` — ~150 page objects (fields, actions, locator names)
- `src/test/resources/testDataFiles/*.json` — 129 files (field sets, valid/invalid data, expected messages)
- `src/test/resources/Environment.properties` — environments and login model
- `pom.xml` — SHAFT Engine 7.4.20231015, Java 17, TestNG, Allure

Cross-checked against the business-authored user stories in
`e:\Projects\agentic-ai-testing-platform\projects\NDC\PRD.md` (Create Agency, Create Role,
Credential Route White/Black List, Airline Whitelist/Blacklist) — the source of §13.

**This document describes the system as the automation understands it.** Where automation and
business intent disagree, business intent wins; every such conflict should be raised against §13
and §15 rather than resolved silently here.
