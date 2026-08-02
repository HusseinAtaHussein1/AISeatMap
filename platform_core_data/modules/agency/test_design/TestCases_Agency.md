# Manual Test Suite — Agency

| Field | Value |
|---|---|
| Module | `agency` |
| Produced by run | `run-001__2026-07-31_11-56-38__UserStory__US-4222UpdateAgency` |
| Revision | 1 |
| Run Scope Type / Run Type | User Story / User Story |
| Project Context | `modules/agency/context/ProjectContext.md` (revision 2, Approved) |
| Total Test Cases | 53 |
| Generated | 2026-08-01 |
| Status | **Approved** |
| Approved | 2026-08-02 — reviewer, after per-case review of all 53 cases (37 Approved / 16 Rejected / 0 Pending) |

> **Read this before executing.** Expected results are written against **observed application
> behaviour**, not against US-4222's wording, wherever the Project Context §1.1 disposition says the
> story is outdated. Most visibly: **a cleared mandatory field renders `Required`** — not the
> per-field messages the story specifies (FINDING-001, disposition row 1, corroborated by PRD XC-17).
> Cases that deliberately assert the *requirement* rather than observed behaviour are the AC-3/AC-4
> upload cases (disposition row 5), and they say so in their Notes.
>
> **Six cases cannot be executed as designed** and must be recorded `Blocked`, never `Failed`:
> TC-AGENCY-043 (AC-9 section absent, pending DOQ-02), TC-AGENCY-048, TC-AGENCY-049, TC-AGENCY-050
> (a second identity is required), TC-AGENCY-028 and TC-AGENCY-052 (deferred — destructive on a
> shared environment). Each states its reason.
>
> **Shared environment.** Record the agency's pre-edit values before the first mutating case and
> restore them after the last one. Every case below operates on **`AGN2 — Test Egypt`** unless it
> says otherwise.

## Case Index

| Test Case ID | Title | Tier | Priority | Tags | Review | Automation |
|---|---|---|---|---|---|---|
| TC-AGENCY-001 | Update Agency Master fields successfully | Scenario | P1 | Scenario, Smoke | Approved | Approved |
| TC-AGENCY-002 | Mandatory Agency Master fields block submission when cleared | Atomic | P1 | Atomic, Negative-EmptyValues, Regression | Approved | Approved |
| TC-AGENCY-003 | Country is read-only and inherited from the Branch | Atomic | P2 | Atomic, Regression | Approved | Pending |
| TC-AGENCY-004 | Post office box rejects non-numeric input | Atomic | P2 | Atomic, Negative-InvalidInputs | Rejected | Rejected |
| TC-AGENCY-005 | Agency name rejects characters outside letters, digits and underscore | Atomic | P3 | Atomic, Negative-InvalidInputs | Rejected | Rejected |
| TC-AGENCY-006 | Agency name rejects an over-length value | Atomic | P3 | Atomic, Negative-BoundaryValues | Rejected | Rejected |
| TC-AGENCY-007 | Agency name refuses injection-shaped input | Atomic | P2 | Atomic, Negative-SecurityInputs | Rejected | Pending |
| TC-AGENCY-008 | Phone No rejects an invalid phone number | Atomic | P2 | Atomic, Negative-InvalidInputs | Approved | Pending |
| TC-AGENCY-009 | Company URL rejects a malformed URL | Atomic | P3 | Atomic, Negative-InvalidInputs | Rejected | Pending |
| TC-AGENCY-010 | IATA Agency selection persists | Atomic | P3 | Atomic | Rejected | Rejected |
| TC-AGENCY-011 | Agency Business Type selection persists | Atomic | P3 | Atomic | Approved | Rejected |
| TC-AGENCY-012 | Update Agency Owner Details successfully | Atomic | P1 | Atomic, Smoke | Approved | Rejected |
| TC-AGENCY-013 | Mandatory Agency Owner fields block submission when cleared | Atomic | P1 | Atomic, Negative-EmptyValues | Approved | Rejected |
| TC-AGENCY-014 | Owner Email ID rejects an invalid email format | Atomic | P2 | Atomic, Negative-InvalidInputs | Approved | Rejected |
| TC-AGENCY-015 | Contact person rejects numeric input | Atomic | P3 | Atomic, Negative-InvalidInputs | Approved | Rejected |
| TC-AGENCY-016 | Upload a valid PDF document with contract dates | Scenario | P1 | Scenario, Smoke | Approved | Rejected |
| TC-AGENCY-017 | Upload multiple documents | Atomic | P2 | Atomic | Approved | Rejected |
| TC-AGENCY-018 | Remove an uploaded document | Atomic | P2 | Atomic | Approved | Rejected |
| TC-AGENCY-019 | Non-PDF document is rejected | Atomic | P1 | Atomic, Negative-InvalidInputs, Regression | Rejected | Approved |
| TC-AGENCY-020 | File named .pdf with non-PDF content is rejected | Atomic | P1 | Atomic, Negative-SecurityInputs, Regression | Approved | Approved |
| TC-AGENCY-021 | Contract dates block submission when cleared | Atomic | P2 | Atomic, Negative-EmptyValues | Approved | Approved |
| TC-AGENCY-022 | Upload a valid agency logo | Atomic | P1 | Atomic, Smoke | Approved | Approved |
| TC-AGENCY-023 | Logo larger than 2 MB is rejected | Atomic | P1 | Atomic, Negative-BoundaryValues, Regression | Approved | Rejected |
| TC-AGENCY-024 | Non-image file is rejected as a logo | Atomic | P2 | Atomic, Negative-InvalidInputs | Approved | Rejected |
| TC-AGENCY-025 | Update Wonder Travel Sales Contact successfully | Atomic | P2 | Atomic | Rejected | Rejected |
| TC-AGENCY-026 | Add a second sales contact | Atomic | P2 | Atomic | Rejected | Rejected |
| TC-AGENCY-027 | Mandatory Sales Contact fields block submission when cleared | Atomic | P2 | Atomic, Negative-EmptyValues | Approved | Rejected |
| TC-AGENCY-028 | Sales Contact defaults inherit from the Branch contact person | Atomic | P3 | Atomic, Deferred | Rejected | Rejected |
| TC-AGENCY-029 | Add a bank account | Atomic | P2 | Atomic | Rejected | Rejected |
| TC-AGENCY-030 | Add multiple bank accounts | Atomic | P3 | Atomic | Rejected | Rejected |
| TC-AGENCY-031 | Agency saves with all bank account fields empty | Atomic | P3 | Atomic | Rejected | Rejected |
| TC-AGENCY-032 | Account Number rejects non-numeric input | Atomic | P3 | Atomic, Negative-InvalidInputs | Rejected | Rejected |
| TC-AGENCY-033 | Update Payment Settings successfully | Scenario | P1 | Scenario, Smoke | Approved | Rejected |
| TC-AGENCY-034 | Mandatory Payment Settings fields block submission when cleared | Atomic | P1 | Atomic, Negative-EmptyValues | Approved | Rejected |
| TC-AGENCY-035 | Numeric Payment Settings fields reject non-numeric input | Atomic | P2 | Atomic, Negative-InvalidInputs | Approved | Rejected |
| TC-AGENCY-036 | Select multiple payment options | Atomic | P2 | Atomic | Approved | Rejected |
| TC-AGENCY-037 | Payment option blocks submission when none is selected | Atomic | P2 | Atomic, Negative-EmptyValues | Approved | Rejected |
| TC-AGENCY-038 | Set a target for a month and year | Atomic | P3 | Atomic | Rejected | Rejected |
| TC-AGENCY-039 | Credit agency selection persists | Atomic | P3 | Atomic | Approved | Rejected |
| TC-AGENCY-040 | Product Access is populated from the parent Branch | Atomic | P2 | Atomic | Approved | Approved |
| TC-AGENCY-041 | Change the selected products | Atomic | P2 | Atomic | Approved | Rejected |
| TC-AGENCY-042 | Supplier Name and Product Name are read-only | Atomic | P3 | Atomic | Approved | Rejected |
| TC-AGENCY-043 | Airline Supplier Credential (PCC) section is available | Scenario | P1 | Scenario, Blocked | Rejected | Rejected |
| TC-AGENCY-044 | Import PNR Option persists | Atomic | P2 | Atomic | Approved | Rejected |
| TC-AGENCY-045 | Submit an agency update for approval | Scenario | P1 | Scenario, Smoke | Approved | Rejected |
| TC-AGENCY-046 | Remarks blocks submission when empty | Atomic | P2 | Atomic, Negative-EmptyValues | Approved | Rejected |
| TC-AGENCY-047 | Cancel discards unsaved changes | Atomic | P1 | Atomic, Regression | Approved | Approved |
| TC-AGENCY-048 | Approve a pending agency update | Atomic | P1 | Atomic, Blocked | Approved | Rejected |
| TC-AGENCY-049 | Reject a pending agency update with a reason | Atomic | P1 | Atomic, Blocked | Approved | Rejected |
| TC-AGENCY-050 | Agency update end to end: edit, submit, approve | E2E | P1 | E2E, Blocked | Approved | Approved |
| TC-AGENCY-051 | Save an update without re-uploading the existing document and logo | Atomic | P2 | Atomic, Assumption-based | Approved | Rejected |
| TC-AGENCY-052 | Changing Branch re-inherits dependent values | Atomic | P2 | Atomic, Assumption-based, Deferred | Approved | Approved |
| TC-AGENCY-053 | Agency name accepts a space between words | Atomic | P1 | Atomic, Regression | Approved | Approved |

**Tier breakdown:** 47 Atomic · 5 Scenario · 1 E2E

**Lifecycle breakdown:** Review — 0 Pending · 37 Approved · 16 Rejected · Automation — 4 Pending · 11 Approved · 38 Rejected

> Stage 3 always writes both columns as `Pending`, and no skill may change either — only a human
> reviewer may. Stage `4A` (Automation) consumes a case only when **both** read `Approved`, so at
> this moment **no case in this suite is eligible for automation**, which is correct: none has been
> reviewed yet.

## Test Cases

### TC-AGENCY-001 — Update Agency Master fields successfully

**Objective:** Verify that changes to the Agency Master section are accepted and persisted.

**Preconditions:** Logged in to NDC Admin. On the Update Agency form for agency `AGN2 — Test Egypt` (Admin → Agency → Agency → pencil icon on the row).

**Test Data:**

| Field | Value |
|---|---|
| Agency | `QA_AGENCY_US4222` |
| Post office box | `12345` |
| Company URL | `https://qa.example.com` |
| Address (first) | `12 QA Street` |
| Remarks | `US-4222 test execution` |

**Steps:**

1. Record the current value of every field in the Agency Master section.
2. Enter the Test Data values in `Agency`, `Post office box`, `Company URL`, and the first `Address` field.
3. Enter the Remarks value.
4. Click **Send For Approval**.
5. Reopen the same agency from the Agency list.

**Expected Result:** The four edited fields display the Test Data values.

**Priority:** P1

**Tags:** Scenario, Smoke

**Notes:** Restore the recorded original values after execution — shared environment. `Remarks` is mandatory on the update form and must be filled for any submission to succeed.

**Review:** Approved

**Automation:** Approved

### TC-AGENCY-002 — Mandatory Agency Master fields block submission when cleared

**Objective:** Verify that each mandatory Agency Master field blocks submission when left empty.

**Preconditions:** On the Update Agency form for agency `AGN2 — Test Egypt`.

**Test Data:** Cleared, one at a time: `Agency`, `State`, `City`, `Post office box`, `Address` (first), `Phone No`.

**Steps:**

1. Clear the `Agency` field.
2. Move focus out of the field.
3. Observe the field.
4. Restore the original value.
5. Repeat steps 1–4 for `State`, `City`, `Post office box`, the first `Address` field, and `Phone No`.

**Expected Result:** For each field, a red border appears and the message `Required` is displayed beneath it.

**Priority:** P1

**Tags:** Atomic, Negative-EmptyValues, Regression

**Notes:** `Required` is the platform-wide message (FINDING-001, PRD XC-17). US-4222's per-field messages such as `"Please enter a valid Agency Name."` are outdated specification — a per-field message appearing instead is a **finding to report**, not a pass.

**Review:** Approved

**Automation:** Approved

### TC-AGENCY-003 — Country is read-only and inherited from the Branch

**Objective:** Verify that Country cannot be edited directly on the Agency form.

**Preconditions:** On the Update Agency form for agency `AGN2 — Test Egypt`.

**Steps:**

1. Click into the `Country` field.
2. Attempt to type any character.

**Expected Result:** The field is not editable, retains its inherited value `Egypt`, and is visibly greyed.

**Priority:** P2

**Tags:** Atomic, Regression

**Review:** Approved

**Automation:** Pending

### TC-AGENCY-004 — Post office box rejects non-numeric input

**Objective:** Verify that Post office box accepts numeric input only.

**Preconditions:** On the Update Agency form for agency `AGN2 — Test Egypt`.

**Test Data:** Post office box: `ABC!@#`

**Steps:**

1. Clear the `Post office box` field.
2. Type the Test Data value.
3. Move focus out of the field.

**Expected Result:** The non-numeric characters are either not accepted into the field, or a validation message is displayed and the form cannot be submitted.

**Priority:** P2

**Tags:** Atomic, Negative-InvalidInputs

**Notes:** Record which of the two behaviours occurs — the two are equally valid implementations of the rule and US-4222 does not distinguish them.

**Review:** Rejected

**Automation:** Rejected

### TC-AGENCY-005 — Agency name rejects characters outside letters, digits and underscore

**Objective:** Verify that the agency name field rejects characters outside its allowed set.

**Preconditions:** On the Update Agency form for agency `AGN2 — Test Egypt`.

**Test Data:**

| Field | Value |
|---|---|
| Agency | `QA&Co` |
| Agency | `QA.Co` |
| Agency | `QA-Co` |
| Agency | `وكالة` |

**Steps:**

1. Clear the `Agency` field.
2. Type one Test Data value.
3. Enter a value in `Remarks`.
4. Click **Send For Approval**.
5. Repeat steps 1–4 for each remaining Test Data value.

**Expected Result:** Each value is refused — either the out-of-class character cannot be entered at all, or submission is blocked with a validation message. In neither case is the value persisted to the agency record.

**Priority:** P3

**Tags:** Atomic, Negative-InvalidInputs

**Notes:** **Rewritten 2026-08-01 on reviewer-reported behaviour:** the field accepts letters, digits and underscore only. This **contradicts US-4222 AC-1**, which states "Special characters allowed" for Agency Name. Disposition per Project Context §1.1 row 2 — the PRD is **silent** on this field's character rule, so the case is designed to observed behaviour and labelled `Story Outdated / Requires Business Confirmation`; it is **not** treated as the application being wrong. The evidence is `[O]` reviewer-reported and was **not** verified in Discovery, so executing this case is what establishes it. **Lifecycle:** the reviewer marked this case `Rejected` on 2026-08-01 — correctly, since the previous version asserted that special characters are accepted. That rejection was the trigger for this rewrite, so per §6.3.1 the `Review` column is reset from `Rejected` to `Pending` and awaits a fresh decision on this text. The rejection is not erased; it is recorded here. Record which mechanism enforces the rule (keystroke filtering vs. submit-time validation) — neither source states it. Every value here is deliberately space-free so this case tests one rule; the space is TC-AGENCY-053. Restore the original name afterwards.

**Review:** Rejected

**Automation:** Rejected

### TC-AGENCY-006 — Agency name rejects an over-length value

**Objective:** Verify the agency name field's behaviour at an excessive length.

**Preconditions:** On the Update Agency form for agency `AGN2 — Test Egypt`.

**Test Data:** Agency: a single string of 300 `A` characters.

**Steps:**

1. Clear the `Agency` field.
2. Paste the Test Data value.
3. Move focus out of the field.
4. Enter a value in `Remarks`.
5. Click **Send For Approval**.

**Expected Result:** The value is either truncated at a defined maximum length or rejected with a validation message — the field does not accept 300 characters and store them unchanged.

**Priority:** P3

**Tags:** Atomic, Negative-BoundaryValues

**Notes:** No maximum length is stated in US-4222 or the Project Context. Record the observed limit; it is the input needed to write a precise boundary case later.

**Review:** Rejected

**Automation:** Rejected

### TC-AGENCY-007 — Agency name refuses injection-shaped input

**Objective:** Verify that markup- and SQL-shaped input never reaches the agency record.

**Preconditions:** On the Update Agency form for agency `AGN2 — Test Egypt`.

**Test Data:** Agency: `<script>alert(1)</script>' OR '1'='1`

**Steps:**

1. Clear the `Agency` field.
2. Type the Test Data value.
3. Enter a value in `Remarks`.
4. Click **Send For Approval**.
5. Reopen the same agency and view it in the Agency list.

**Expected Result:** The value is refused — either its out-of-class characters cannot be entered, or submission is blocked with a validation message. The agency name is unchanged, no script executes, and no browser dialog appears in the form or the list.

**Priority:** P2

**Tags:** Atomic, Negative-SecurityInputs

**Notes:** **Rewritten 2026-08-01 on the same reviewer-reported rule as TC-AGENCY-005.** Every character that makes this payload dangerous — `<` `>` `/` `'` and the spaces — is outside the reported allowed set of letters, digits and underscore, so the payload should never be stored at all. That is a **stronger** outcome than the sanitised-on-store behaviour this case previously asserted, which is why the expected result changed rather than the case being dropped. **If the value IS accepted, that is a finding twice over:** it contradicts the reported character rule *and* it means the field stores markup. Input-handling probe only — never an attempt to exploit. Restore the original name immediately after execution.

**Review:** Rejected

**Automation:** Pending

### TC-AGENCY-008 — Phone No rejects an invalid phone number

**Objective:** Verify that the Agency Master phone field rejects a malformed number.

**Preconditions:** On the Update Agency form for agency `AGN2 — Test Egypt`.

**Test Data:** Phone No: `12`

**Steps:**

1. Clear the `Phone No` field.
2. Type the Test Data value.
3. Move focus out of the field.

**Expected Result:** A validation message is displayed and the form cannot be submitted with this value.

**Priority:** P2

**Tags:** Atomic, Negative-InvalidInputs

**Notes:** The field carries a country selector (Egypt by default). Record the exact message text.

**Review:** Approved

**Automation:** Pending

### TC-AGENCY-009 — Company URL rejects a malformed URL

**Objective:** Verify that Company URL validates URL format.

**Preconditions:** On the Update Agency form for agency `AGN2 — Test Egypt`.

**Test Data:** Company URL: `asdas`

**Steps:**

1. Clear the `Company URL` field.
2. Type the Test Data value.
3. Enter a value in `Remarks`.
4. Click **Send For Approval**.

**Expected Result:** A validation message is displayed and the form cannot be submitted with this value.

**Priority:** P3

**Tags:** Atomic, Negative-InvalidInputs

**Notes:** Designed to the requirement, not to observed behaviour. The value `asdas` was found already stored on this agency during Discovery, so the field may accept it — if it does, that is a genuine finding against AC-1's `"Please enter a valid URL."` rule, which no source has superseded.

**Review:** Rejected

**Automation:** Pending

### TC-AGENCY-010 — IATA Agency selection persists

**Objective:** Verify that the IATA Agency choice is saved.

**Preconditions:** On the Update Agency form for agency `AGN2 — Test Egypt`.

**Steps:**

1. Record the current `IATA Agency` selection.
2. Select the opposite value (`yes` or `No`).
3. Enter a value in `Remarks`.
4. Click **Send For Approval**.
5. Reopen the same agency.

**Expected Result:** The `IATA Agency` selection shows the value chosen in step 2.

**Priority:** P3

**Tags:** Atomic

**Notes:** Restore the recorded original selection afterwards.

**Review:** Rejected

**Automation:** Rejected

### TC-AGENCY-011 — Agency Business Type selection persists

**Objective:** Verify that the Agency Business Type choice is saved.

**Preconditions:** On the Update Agency form for agency `AGN2 — Test Egypt`.

**Steps:**

1. Record the current `Agency Business Type` selection.
2. Select the opposite value (`B2B` or `Freelancer`).
3. Enter a value in `Remarks`.
4. Click **Send For Approval**.
5. Reopen the same agency.

**Expected Result:** The `Agency Business Type` selection shows the value chosen in step 2.

**Priority:** P3

**Tags:** Atomic

**Notes:** Field is not described in US-4222 — later functionality (FINDING-005, disposition row 2). This case verifies persistence only; the business meaning of each value is unconfirmed, so do not judge whether the *right* value is set. Restore the original afterwards.

**Review:** Approved

**Automation:** Rejected

### TC-AGENCY-012 — Update Agency Owner Details successfully

**Objective:** Verify that changes to the Agency Owner Details section are accepted and persisted.

**Preconditions:** On the Update Agency form for agency `AGN2 — Test Egypt`.

**Test Data:**

| Field | Value |
|---|---|
| Contact person | `QA Owner` |
| Email ID | `qa.owner@example.com` |
| Phone Number | `1000000001` |

**Steps:**

1. Record the current values of the three Agency Owner Details fields.
2. Enter the Test Data values.
3. Enter a value in `Remarks`.
4. Click **Send For Approval**.
5. Reopen the same agency.

**Expected Result:** The three Agency Owner Details fields display the Test Data values.

**Priority:** P1

**Tags:** Atomic, Smoke

**Notes:** Restore the recorded original values afterwards.

**Review:** Approved

**Automation:** Rejected

### TC-AGENCY-013 — Mandatory Agency Owner fields block submission when cleared

**Objective:** Verify that each mandatory Agency Owner Details field blocks submission when left empty.

**Preconditions:** On the Update Agency form for agency `AGN2 — Test Egypt`.

**Test Data:** Cleared, one at a time: `Contact person`, `Email ID`, `Phone Number`.

**Steps:**

1. Clear the `Contact person` field.
2. Move focus out of the field.
3. Observe the field.
4. Restore the original value.
5. Repeat steps 1–4 for `Email ID` and `Phone Number`.

**Expected Result:** For each field, a red border appears and the message `Required` is displayed beneath it.

**Priority:** P1

**Tags:** Atomic, Negative-EmptyValues

**Review:** Approved

**Automation:** Rejected

### TC-AGENCY-014 — Owner Email ID rejects an invalid email format

**Objective:** Verify that the Agency Owner email field rejects a malformed address.

**Preconditions:** On the Update Agency form for agency `AGN2 — Test Egypt`.

**Test Data:** Email ID: `qa.owner@@example`

**Steps:**

1. Clear the Agency Owner `Email ID` field.
2. Type the Test Data value.
3. Move focus out of the field.

**Expected Result:** A validation message is displayed and the form cannot be submitted with this value.

**Priority:** P2

**Tags:** Atomic, Negative-InvalidInputs

**Notes:** PRD XC-18 records the platform email message as `"Please enter a valid email"` — the same wording US-4222 uses for this field. Record the exact text observed.

**Review:** Approved

**Automation:** Rejected

### TC-AGENCY-015 — Contact person rejects numeric input

**Objective:** Verify that the Contact person field accepts characters only.

**Preconditions:** On the Update Agency form for agency `AGN2 — Test Egypt`.

**Test Data:** Contact person: `12345`

**Steps:**

1. Clear the `Contact person` field.
2. Type the Test Data value.
3. Enter a value in `Remarks`.
4. Click **Send For Approval**.

**Expected Result:** A validation message is displayed and the form cannot be submitted with this value.

**Priority:** P3

**Tags:** Atomic, Negative-InvalidInputs

**Notes:** Designed to AC-2's "Only Characters validation" rule, which no source has superseded. If the value is accepted, that is a finding to report.

**Review:** Approved

**Automation:** Rejected

### TC-AGENCY-016 — Upload a valid PDF document with contract dates

**Objective:** Verify that a PDF document can be uploaded with its contract start and end dates.

**Preconditions:** On the Update Agency form for agency `AGN2 — Test Egypt`. Fixture files available locally.

**Test Data:**

| Field | Value |
|---|---|
| Document | `AgencyContract_Doc1_valid.pdf` |
| Contract Start Date | `01/01/2026` |
| Contract End Date | `31/12/2027` |

**Steps:**

1. Click **Upload document**.
2. Select the fixture PDF.
3. Enter the Contract Start Date.
4. Enter the Contract End Date.
5. Enter a value in `Remarks`.
6. Click **Send For Approval**.
7. Reopen the same agency.

**Expected Result:** The uploaded document's file name is displayed in the Upload Document section with the two dates entered.

**Priority:** P1

**Tags:** Scenario, Smoke

**Notes:** Fixtures are in the session fixture folder (`fixtures/us-4222/`, see `FIXTURES.md`). Dates use `dd/mm/yyyy` as observed on this form.

**Review:** Approved

**Automation:** Rejected

### TC-AGENCY-017 — Upload multiple documents

**Objective:** Verify that more than one document can be attached to an agency.

**Preconditions:** On the Update Agency form for agency `AGN2 — Test Egypt`, with at least one document already uploaded.

**Test Data:** Document: `AgencyContract_Doc2_valid.pdf`

**Steps:**

1. Click **Add** beneath the Upload Document section.
2. Click **Upload document** on the new row.
3. Select the fixture PDF.
4. Enter a contract start and end date on the new row.
5. Enter a value in `Remarks`.
6. Click **Send For Approval**.
7. Reopen the same agency.

**Expected Result:** Both documents' file names are displayed, each with its own contract start and end dates.

**Priority:** P2

**Tags:** Atomic

**Notes:** AC-3 requires multiple documents. The `Add` button is the mechanism observed during Discovery; the file inputs are single-select.

**Review:** Approved

**Automation:** Rejected

### TC-AGENCY-018 — Remove an uploaded document

**Objective:** Verify that an uploaded document can be removed from an agency.

**Preconditions:** On the Update Agency form for agency `AGN2 — Test Egypt`, with at least two documents uploaded.

**Steps:**

1. Remove the second document row.
2. Enter a value in `Remarks`.
3. Click **Send For Approval**.
4. Reopen the same agency.

**Expected Result:** The removed document's file name is no longer displayed; the remaining document is unchanged.

**Priority:** P2

**Tags:** Atomic

**Notes:** AC-3 requires the user be able to remove or update documents. If no remove affordance exists, record the case as Failed against that criterion.

**Review:** Approved

**Automation:** Rejected

### TC-AGENCY-019 — Non-PDF document is rejected

**Objective:** Verify that a non-PDF file cannot be uploaded as an agency document.

**Preconditions:** On the Update Agency form for agency `AGN2 — Test Egypt`. Fixture files available locally.

**Test Data:** Document: `AgencyContract_wrongformat.txt`

**Steps:**

1. Click **Upload document**.
2. Select the `.txt` fixture.
3. Enter a value in `Remarks`.
4. Click **Send For Approval**.

**Expected Result:** The file is rejected and a validation message about the file format is displayed; the agency is not saved with the `.txt` file attached.

**Priority:** P1

**Tags:** Atomic, Negative-InvalidInputs, Regression

**Notes:** **Designed to the requirement, not to observed behaviour** (FINDING-004, disposition row 5). Discovery found the document input declares no accepted file type and that a `.png` is already attached to this agency, so this case may fail — that failure is the expected finding. US-4222 specifies the message `"Please Upload a valid file format."`; record the actual text.

**Review:** Rejected

**Automation:** Approved

### TC-AGENCY-020 — File named .pdf with non-PDF content is rejected

**Objective:** Verify whether document format validation inspects file content or only the file name.

**Preconditions:** On the Update Agency form for agency `AGN2 — Test Egypt`. Fixture files available locally.

**Test Data:** Document: `AgencyContract_fake_extension.pdf` — a `.pdf` filename whose bytes are plain text with no `%PDF` header.

**Steps:**

1. Click **Upload document**.
2. Select the fixture.
3. Enter a value in `Remarks`.
4. Click **Send For Approval**.

**Expected Result:** The file is rejected and a validation message about the file format is displayed.

**Priority:** P1

**Tags:** Atomic, Negative-SecurityInputs, Regression

**Notes:** Run this immediately after TC-AGENCY-019 and compare. If TC-AGENCY-019 rejects the `.txt` and this case accepts the fake `.pdf`, validation is by file name only — report that regardless of what AC-3 says, since it is materially weaker than a real format check. **Review:** approved by the reviewer on 2026-08-02, given directly rather than in the workbook — the last of the 53 cases to be decided. It is the surviving half of the FINDING-004 pair: TC-AGENCY-019 was rejected, so this case can establish whether a content check exists but not whether validation is extension-only. Record that limitation in the result.

**Review:** Approved

**Automation:** Approved

### TC-AGENCY-021 — Contract dates block submission when cleared

**Objective:** Verify that both contract dates are mandatory for an uploaded document.

**Preconditions:** On the Update Agency form for agency `AGN2 — Test Egypt`, with a document uploaded.

**Steps:**

1. Clear the `Contract Start Date` field.
2. Move focus out of the field.
3. Observe the field.
4. Restore the original date.
5. Repeat steps 1–4 for `Contract End Date`.

**Expected Result:** For each field, a red border appears and the message `Required` is displayed beneath it.

**Priority:** P2

**Tags:** Atomic, Negative-EmptyValues

**Review:** Approved

**Automation:** Approved

### TC-AGENCY-022 — Upload a valid agency logo

**Objective:** Verify that an image within the size limit can be uploaded as the agency logo.

**Preconditions:** On the Update Agency form for agency `AGN2 — Test Egypt`. Fixture files available locally.

**Test Data:** Logo: `AgencyLogo_valid.png` (0.27 MB)

**Steps:**

1. Click **Upload logo**.
2. Select the fixture image.
3. Observe the Agency Logo section.
4. Enter a value in `Remarks`.
5. Click **Send For Approval**.
6. Reopen the same agency.

**Expected Result:** The uploaded logo is displayed in the Agency Logo section both before submission and after reopening the agency.

**Priority:** P1

**Tags:** Atomic, Smoke

**Notes:** AC-4 requires the logo be displayed for review before final submission — step 3 is that check.

**Review:** Approved

**Automation:** Approved

### TC-AGENCY-023 — Logo larger than 2 MB is rejected

**Objective:** Verify that the agency logo size limit is enforced.

**Preconditions:** On the Update Agency form for agency `AGN2 — Test Egypt`. Fixture files available locally.

**Test Data:** Logo: `AgencyLogo_oversize.png` (3.46 MB, a structurally valid PNG)

**Steps:**

1. Click **Upload logo**.
2. Select the oversize fixture.
3. Enter a value in `Remarks`.
4. Click **Send For Approval**.

**Expected Result:** The file is rejected and a validation message is displayed; the agency is not saved with the oversize image.

**Priority:** P1

**Tags:** Atomic, Negative-BoundaryValues, Regression

**Notes:** The fixture is a genuine, uncorrupted PNG made incompressible on purpose, so a rejection can only be about size. The 2 MB limit comes from US-4222 and has never been verified (Project Context ASM-009) — if a different threshold is enforced, record the observed one.

**Review:** Approved

**Automation:** Rejected

### TC-AGENCY-024 — Non-image file is rejected as a logo

**Objective:** Verify that a non-image file cannot be uploaded as the agency logo.

**Preconditions:** On the Update Agency form for agency `AGN2 — Test Egypt`. Fixture files available locally.

**Test Data:** Logo: `AgencyLogo_wrongformat.txt`

**Steps:**

1. Click **Upload logo**.
2. Attempt to select the `.txt` fixture.

**Expected Result:** The file cannot be selected, or is rejected with a validation message.

**Priority:** P2

**Tags:** Atomic, Negative-InvalidInputs

**Notes:** The logo input declares `accept="image/*"`, so the file picker may filter the `.txt` out before it can be chosen. That counts as a pass — record which of the two behaviours occurs.

**Review:** Approved

**Automation:** Rejected

### TC-AGENCY-025 — Update Wonder Travel Sales Contact successfully

**Objective:** Verify that changes to the Sales Contact section are accepted and persisted.

**Preconditions:** On the Update Agency form for agency `AGN2 — Test Egypt`.

**Test Data:**

| Field | Value |
|---|---|
| Name | `QA Sales` |
| Email ID | `qa.sales@example.com` |
| Phone Number | `1000000002` |

**Steps:**

1. Record the current values of the three Sales Contact fields.
2. Enter the Test Data values.
3. Enter a value in `Remarks`.
4. Click **Send For Approval**.
5. Reopen the same agency.

**Expected Result:** The three Sales Contact fields display the Test Data values.

**Priority:** P2

**Tags:** Atomic

**Notes:** Restore the recorded original values afterwards.

**Review:** Rejected

**Automation:** Rejected

### TC-AGENCY-026 — Add a second sales contact

**Objective:** Verify that more than one sales contact can be recorded against an agency.

**Preconditions:** On the Update Agency form for agency `AGN2 — Test Egypt`.

**Test Data:**

| Field | Value |
|---|---|
| Name | `QA Sales Two` |
| Email ID | `qa.sales2@example.com` |
| Phone Number | `1000000003` |

**Steps:**

1. Click **Add** beneath the Wonder Travel Sales Contact section.
2. Enter the Test Data values on the new row.
3. Note whether the new row contains a `Designation` field.
4. Enter a value in `Remarks`.
5. Click **Send For Approval**.
6. Reopen the same agency.

**Expected Result:** Both sales contacts are displayed with their own name, email, and phone values.

**Priority:** P2

**Tags:** Atomic

**Notes:** Step 3 settles an open question at no extra cost: AC-5 specifies an optional `Designation` dropdown that Discovery found absent from the first row on both the create and update forms (FINDING-006). Record whether it appears on an added row.

**Review:** Rejected

**Automation:** Rejected

### TC-AGENCY-027 — Mandatory Sales Contact fields block submission when cleared

**Objective:** Verify that each mandatory Sales Contact field blocks submission when left empty.

**Preconditions:** On the Update Agency form for agency `AGN2 — Test Egypt`.

**Test Data:** Cleared, one at a time: `Name`, `Email ID`, `Phone Number` (Sales Contact section).

**Steps:**

1. Clear the Sales Contact `Name` field.
2. Move focus out of the field.
3. Observe the field.
4. Restore the original value.
5. Repeat steps 1–4 for the Sales Contact `Email ID` and `Phone Number`.

**Expected Result:** For each field, a red border appears and the message `Required` is displayed beneath it.

**Priority:** P2

**Tags:** Atomic, Negative-EmptyValues

**Notes:** Discovery confirmed only `Name` carries a visible `*` marker among the app-marked mandatory fields for this section. If `Email ID` or `Phone Number` submits successfully when empty, record it — AC-5 marks all three mandatory.

**Review:** Approved

**Automation:** Rejected

### TC-AGENCY-028 — Sales Contact defaults inherit from the Branch contact person

**Objective:** Verify that Sales Contact fields are pre-populated from the parent Branch's contact person.

**Preconditions:** A newly created agency under a branch with a known contact person, or an agency whose Branch has just been changed.

**Steps:**

1. Open an agency whose Sales Contact has never been edited.
2. Compare the Sales Contact values against the parent Branch's contact person details.

**Expected Result:** The Sales Contact name, email, and phone match the parent Branch's contact person.

**Priority:** P3

**Tags:** Atomic, Deferred

**Notes:** **DEFERRED — do not execute in this run.** Verifying inheritance requires either creating an agency (out of this run's scope) or changing an existing agency's Branch, which may overwrite values the agency already holds (Project Context ASM-016) — destructive on a shared environment. Record as `Deferred / Requires Dedicated Environment`, not as Failed.

**Review:** Rejected

**Automation:** Rejected

### TC-AGENCY-029 — Add a bank account

**Objective:** Verify that bank account details can be recorded against an agency.

**Preconditions:** On the Update Agency form for agency `AGN2 — Test Egypt`.

**Test Data:**

| Field | Value |
|---|---|
| Account Number | `1234567890` |
| Account Type | any value from the list |
| Bank name | `QA Bank` |

**Steps:**

1. Enter the Test Data values in the Bank Account Details section.
2. Enter a value in `Remarks`.
3. Click **Send For Approval**.
4. Reopen the same agency.

**Expected Result:** The three bank account fields display the Test Data values.

**Priority:** P2

**Tags:** Atomic

**Notes:** These fields were empty on this agency at Discovery. Clear them again after execution.

**Review:** Rejected

**Automation:** Rejected

### TC-AGENCY-030 — Add multiple bank accounts

**Objective:** Verify that more than one bank account can be recorded against an agency.

**Preconditions:** On the Update Agency form for agency `AGN2 — Test Egypt`, with one bank account already entered.

**Test Data:** Account Number: `9876543210`, Bank name: `QA Bank Two`

**Steps:**

1. Click **Add** beneath the Bank Account Details section.
2. Enter the Test Data values on the new row.
3. Enter a value in `Remarks`.
4. Click **Send For Approval**.
5. Reopen the same agency.

**Expected Result:** Both bank accounts are displayed with their own values.

**Priority:** P3

**Tags:** Atomic

**Review:** Rejected

**Automation:** Rejected

### TC-AGENCY-031 — Agency saves with all bank account fields empty

**Objective:** Verify that the Bank Account Details section is optional.

**Preconditions:** On the Update Agency form for agency `AGN2 — Test Egypt`, with every bank account field empty.

**Steps:**

1. Confirm all Bank Account Details fields are empty.
2. Enter a value in `Remarks`.
3. Click **Send For Approval**.

**Expected Result:** The agency is submitted successfully with no validation message against any Bank Account Details field.

**Priority:** P3

**Tags:** Atomic

**Notes:** AC-6 marks all three fields Optional. Discovery confirmed clearing `Bank name` produces no message.

**Review:** Rejected

**Automation:** Rejected

### TC-AGENCY-032 — Account Number rejects non-numeric input

**Objective:** Verify that Account Number accepts numeric input only.

**Preconditions:** On the Update Agency form for agency `AGN2 — Test Egypt`.

**Test Data:** Account Number: `ABCDEF`

**Steps:**

1. Type the Test Data value in `Account Number`.
2. Move focus out of the field.

**Expected Result:** The non-numeric characters are either not accepted into the field, or a validation message is displayed.

**Priority:** P3

**Tags:** Atomic, Negative-InvalidInputs

**Review:** Rejected

**Automation:** Rejected

### TC-AGENCY-033 — Update Payment Settings successfully

**Objective:** Verify that changes to the Payment Settings section are accepted and persisted.

**Preconditions:** On the Update Agency form for agency `AGN2 — Test Egypt`.

**Test Data:**

| Field | Value |
|---|---|
| Invoice generation | any value from the list other than the current one |
| Credit limit | `500000` |
| Top up limit | `100000` |
| Outstanding Threshold | `10` |
| Credit Terms (Days) | `30` |
| Remarks | `US-4222 payment settings test` |

**Steps:**

1. Record the current value of every Payment Settings field.
2. Enter the Test Data values.
3. Click **Send For Approval**.
4. Reopen the same agency.

**Expected Result:** Each edited Payment Settings field displays the Test Data value.

**Priority:** P1

**Tags:** Scenario, Smoke

**Notes:** `Outstanding Threshold` is a later enhancement not described in US-4222 and is mandatory (FINDING-005, confirmed as expected functionality). Its valid range is unconfirmed — `10` is chosen against an observed value of `5`; if it is rejected, record the constraint rather than treating it as a defect. **Credit limit and payment configuration are live commercial settings — restore every recorded original value after execution.**

**Review:** Approved

**Automation:** Rejected

### TC-AGENCY-034 — Mandatory Payment Settings fields block submission when cleared

**Objective:** Verify that each mandatory Payment Settings field blocks submission when left empty.

**Preconditions:** On the Update Agency form for agency `AGN2 — Test Egypt`.

**Test Data:** Cleared, one at a time: `Credit limit`, `Top up limit`, `Outstanding Threshold`, `Credit Terms (Days)`.

**Steps:**

1. Clear the `Credit limit` field.
2. Move focus out of the field.
3. Observe the field.
4. Restore the original value.
5. Repeat steps 1–4 for `Top up limit`, `Outstanding Threshold`, and `Credit Terms (Days)`.

**Expected Result:** For each field, a red border appears and the message `Required` is displayed beneath it.

**Priority:** P1

**Tags:** Atomic, Negative-EmptyValues

**Notes:** `Outstanding Threshold` is included because the application marks it mandatory, though US-4222 does not mention it.

**Review:** Approved

**Automation:** Rejected

### TC-AGENCY-035 — Numeric Payment Settings fields reject non-numeric input

**Objective:** Verify that the numeric Payment Settings fields accept numeric input only.

**Preconditions:** On the Update Agency form for agency `AGN2 — Test Egypt`.

**Test Data:** `ABC` entered, one at a time, into `Credit limit`, `Top up limit`, `Target`, `Reaching Percentage`, `Warning Prompt (Days)`.

**Steps:**

1. Type `ABC` into `Credit limit`.
2. Move focus out of the field.
3. Observe the field.
4. Restore the original value.
5. Repeat steps 1–4 for `Top up limit`, `Target`, `Reaching Percentage`, and `Warning Prompt (Days)`.

**Expected Result:** For each field, the non-numeric characters are either not accepted into the field, or a validation message is displayed.

**Priority:** P2

**Tags:** Atomic, Negative-InvalidInputs

**Review:** Approved

**Automation:** Rejected

### TC-AGENCY-036 — Select multiple payment options

**Objective:** Verify that more than one payment option can be selected for an agency.

**Preconditions:** On the Update Agency form for agency `AGN2 — Test Egypt`.

**Test Data:** Payment options: `Cash`, `Wallet`, `Credit Card`

**Steps:**

1. Record the currently selected payment options.
2. Select `Cash`, `Wallet`, and `Credit Card`, deselecting any others.
3. Enter a value in `Remarks`.
4. Click **Send For Approval**.
5. Reopen the same agency.

**Expected Result:** Exactly `Cash`, `Wallet`, and `Credit Card` are selected.

**Priority:** P2

**Tags:** Atomic

**Notes:** The control renders 28 options, of which 23 are person names and single letters (FINDING-003) — use only the five real instruments. Do **not** assert the full option list; the authoritative set is an open question. Restore the recorded originals afterwards.

**Review:** Approved

**Automation:** Rejected

### TC-AGENCY-037 — Payment option blocks submission when none is selected

**Objective:** Verify that at least one payment option must be selected.

**Preconditions:** On the Update Agency form for agency `AGN2 — Test Egypt`.

**Steps:**

1. Record the currently selected payment options.
2. Deselect every payment option.
3. Enter a value in `Remarks`.
4. Click **Send For Approval**.

**Expected Result:** A validation message is displayed and the agency is not submitted.

**Priority:** P2

**Tags:** Atomic, Negative-EmptyValues

**Notes:** The application marks `Payment option` mandatory. Restore the recorded originals afterwards.

**Review:** Approved

**Automation:** Rejected

### TC-AGENCY-038 — Set a target for a month and year

**Objective:** Verify that a target can be recorded against a month and year.

**Preconditions:** On the Update Agency form for agency `AGN2 — Test Egypt`.

**Test Data:** Target: `100000`, Month: any value, Year: any value

**Steps:**

1. Enter the target value.
2. Select a month.
3. Select a year.
4. Click **Set target**.

**Expected Result:** The target is added and displayed against the selected month and year.

**Priority:** P3

**Tags:** Atomic

**Notes:** US-4222 names these fields `Set Month` and `Set Year`; the form labels them `Month` and `Year`.

**Review:** Rejected

**Automation:** Rejected

### TC-AGENCY-039 — Credit agency selection persists

**Objective:** Verify that the Credit agency checkbox is saved.

**Preconditions:** On the Update Agency form for agency `AGN2 — Test Egypt`.

**Steps:**

1. Record the current `Credit agency` state.
2. Toggle it.
3. Enter a value in `Remarks`.
4. Click **Send For Approval**.
5. Reopen the same agency.

**Expected Result:** The `Credit agency` checkbox shows the state set in step 2.

**Priority:** P3

**Tags:** Atomic

**Notes:** Restore the recorded original state afterwards.

**Review:** Approved

**Automation:** Rejected

### TC-AGENCY-040 — Product Access is populated from the parent Branch

**Objective:** Verify that the Product Access section shows supplier credentials inherited from the agency's branch.

**Preconditions:** On the Update Agency form for agency `AGN2 — Test Egypt`.

**Steps:**

1. Scroll to the Product Access Details section.
2. Read the grid rows.

**Expected Result:** The grid lists supplier and credential rows with Supplier Name, Credential Name, and Product Name populated.

**Priority:** P2

**Tags:** Atomic

**Notes:** AC-8 states this section is inherited from the Branch. This case verifies population only — confirming the values match the parent Branch's own configuration requires opening the Branch record, which belongs to the `branch` module.

**Review:** Approved

**Automation:** Approved

### TC-AGENCY-041 — Change the selected products

**Objective:** Verify that the product selection can be changed and saved.

**Preconditions:** On the Update Agency form for agency `AGN2 — Test Egypt`.

**Steps:**

1. Record the current `Select Product` selections.
2. Deselect one product.
3. Enter a value in `Remarks`.
4. Click **Send For Approval**.
5. Reopen the same agency.

**Expected Result:** The product deselected in step 2 is no longer selected.

**Priority:** P2

**Tags:** Atomic

**Notes:** Restore the recorded original selections afterwards.

**Review:** Approved

**Automation:** Rejected

### TC-AGENCY-042 — Supplier Name and Product Name are read-only

**Objective:** Verify that the inherited columns in the Product Access grid cannot be edited.

**Preconditions:** On the Update Agency form for agency `AGN2 — Test Egypt`.

**Steps:**

1. Attempt to edit the `SUPPLIER NAME` value on the first Product Access row.
2. Attempt to edit the `PRODUCT NAME` value on the same row.

**Expected Result:** Neither value can be changed.

**Priority:** P3

**Tags:** Atomic

**Notes:** AC-8 marks both fields Read Only.

**Review:** Approved

**Automation:** Rejected

### TC-AGENCY-043 — Airline Supplier Credential (PCC) section is available

**Objective:** Verify that the Airline Supplier Credential (PCC) section is present with its specified fields.

**Preconditions:** On the Update Agency form for agency `AGN2 — Test Egypt`.

**Steps:**

1. Scroll the full Update Agency form.
2. Locate the Airline Supplier Credential section.
3. Confirm the presence of `Search Supplier Credential PCC`, `Ticketing Supplier Credentials PCC`, `Generic Supplier PCC`, `Manager Name`, and `Supplier Credential Description`.
4. Confirm the Amadeus, Galileo, and Sabre PCC filters are present.

**Expected Result:** The Airline Supplier Credential section is present with all five fields and the three PCC filters.

**Priority:** P1

**Tags:** Scenario, Blocked

**Notes:** **BLOCKED — record as `Blocked`, never `Failed`.** Discovery confirmed this entire section is absent from both the update and the create form (FINDING-002). Two PRD requirements tagged `[V]` describe it, so it may be removed or relocated functionality rather than an outdated story — that is the open question DOQ-02, awaiting business confirmation. Executing this case before DOQ-02 is answered would record a failure against a criterion whose status is undecided. This one case stands for all five of AC-9's criteria.

**Review:** Rejected

**Automation:** Rejected

### TC-AGENCY-044 — Import PNR Option persists

**Objective:** Verify that the Import PNR Option setting is saved.

**Preconditions:** On the Update Agency form for agency `AGN2 — Test Egypt`.

**Steps:**

1. Record the current `Import PNR Option` state in the Agency Features section.
2. Toggle it.
3. Enter a value in `Remarks`.
4. Click **Send For Approval**.
5. Reopen the same agency.

**Expected Result:** The `Import PNR Option` shows the state set in step 2.

**Priority:** P2

**Tags:** Atomic

**Notes:** US-4222 calls this a toggle; the application renders a checkbox. This case verifies persistence on the agency record only — the downstream effect on PNR import belongs to the `import-pnr` module. **Restore the recorded original state afterwards:** with the option disabled, PNR imports for this agency are refused.

**Review:** Approved

**Automation:** Rejected

### TC-AGENCY-045 — Submit an agency update for approval

**Objective:** Verify that submitting an agency update places it in a pending-approval state rather than publishing it.

**Preconditions:** On the Update Agency form for agency `AGN2 — Test Egypt`.

**Test Data:** Agency: `QA_AGENCY_SUBMIT`, Remarks: `US-4222 submit test`

**Steps:**

1. Record the current agency name.
2. Enter the Test Data agency name.
3. Enter the Test Data remarks.
4. Click **Send For Approval**.
5. Open the Agency list and locate the agency.

**Expected Result:** A success confirmation is shown and the agency's Approval Status changes to a pending state.

**Priority:** P1

**Tags:** Scenario, Smoke

**Notes:** US-4222 names this action `Submit for Approval`; the button reads `Send For Approval`. Every agency visible in the list at Discovery was `Active`/`Approved`, so the pending state has no observed baseline — record the exact status text shown. Restore the original name after the update is resolved.

**Review:** Approved

**Automation:** Rejected

### TC-AGENCY-046 — Remarks blocks submission when empty

**Objective:** Verify that Remarks must be provided before an agency update can be submitted.

**Preconditions:** On the Update Agency form for agency `AGN2 — Test Egypt`.

**Steps:**

1. Make any valid change to one field.
2. Leave the `Remarks` field empty.
3. Click **Send For Approval**.

**Expected Result:** A validation message is displayed against `Remarks` and the agency is not submitted.

**Priority:** P2

**Tags:** Atomic, Negative-EmptyValues

**Notes:** `Remarks` is not described in US-4222. It is mandatory on the update form and absent from the create form — consistent with PRD XC-03, which requires a free-text remark as the audit reason for approval actions (FINDING-005).

**Review:** Approved

**Automation:** Rejected

### TC-AGENCY-047 — Cancel discards unsaved changes

**Objective:** Verify that cancelling an agency update does not persist the changes.

**Preconditions:** On the Update Agency form for agency `AGN2 — Test Egypt`.

**Test Data:** Agency: `QA_CANCEL_TEST`

**Steps:**

1. Record the current agency name.
2. Enter the Test Data agency name.
3. Click **Cancel**.
4. Reopen the same agency.

**Expected Result:** The agency name is the value recorded in step 1; the change made in step 2 was not saved.

**Priority:** P1

**Tags:** Atomic, Regression

**Notes:** Cancel-must-not-persist is an established platform pattern (PRD GEO-09, SUP-10), though neither is about agencies. US-4222's wording for this action refers to "the role update process", which appears to be an error carried over from a different story — test the agency behaviour.

**Review:** Approved

**Automation:** Approved

### TC-AGENCY-048 — Approve a pending agency update

**Objective:** Verify that an authorized user can approve a pending agency update and apply the change.

**Preconditions:** An agency update in a pending-approval state, submitted by a **different** user than the one approving.

**Steps:**

1. Log in as a user authorized to approve, other than the user who submitted the update.
2. Open the pending agency.
3. Enter approval remarks.
4. Click **Approve**.
5. Reopen the agency.

**Expected Result:** The agency's Approval Status changes to approved and the submitted field values are applied.

**Priority:** P1

**Tags:** Atomic, Blocked

**Notes:** **BLOCKED — record as `Blocked`, never `Failed` or `Passed`.** Only one credential exists on this install (`odeysysadmin`, Super Admin), so the maker and the checker would be the same identity and the four-eyes separation this case exists to verify cannot be exercised (FINDING-007). Approving one's own change under Super Admin proves nothing about whether the platform permits it for others. Unblocked by adding a second, non-Super-Admin credential.

**Review:** Approved

**Automation:** Rejected

### TC-AGENCY-049 — Reject a pending agency update with a reason

**Objective:** Verify that an authorized user can reject a pending agency update and record a reason.

**Preconditions:** An agency update in a pending-approval state, submitted by a **different** user than the one rejecting.

**Steps:**

1. Log in as a user authorized to approve, other than the user who submitted the update.
2. Open the pending agency.
3. Click **Reject**.
4. Enter a rejection reason.
5. Confirm the rejection.
6. Reopen the agency.

**Expected Result:** The agency's Approval Status changes to rejected, the rejection reason is recorded, and the submitted field values are not applied.

**Priority:** P1

**Tags:** Atomic, Blocked

**Notes:** **BLOCKED for the same reason as TC-AGENCY-048** — a single identity cannot separate maker from checker (FINDING-007).

**Review:** Approved

**Automation:** Rejected

### TC-AGENCY-050 — Agency update end to end: edit, submit, approve

**Objective:** Verify the complete agency update journey across the update form, the approval step, and the Agency list, spanning multiple screens.

**Preconditions:** Two credentials available: one to make the change, one to approve it.

**Steps:**

1. Log in as the maker and open agency `AGN2 — Test Egypt`.
2. Change one field in each of the Agency Master, Agency Owner Details, and Payment Settings sections.
3. Enter remarks and click **Send For Approval**.
4. Confirm the Agency list shows the agency in a pending-approval state.
5. Log in as the approver and open the pending agency.
6. Click **Approve**.
7. Reopen the agency as either user.

**Expected Result:** All three changed values are applied and the agency's Approval Status is approved.

**Priority:** P1

**Tags:** E2E, Blocked

**Notes:** **BLOCKED — requires a second identity** (FINDING-007). This case spans the update form, the approval action, and the Agency list; it is additive to the atomic cases above and does not replace them.

**Review:** Approved

**Automation:** Approved

### TC-AGENCY-051 — Save an update without re-uploading the existing document and logo

**Objective:** Verify that an agency with an existing document and logo can be updated without re-uploading them.

**Preconditions:** On the Update Agency form for agency `AGN2 — Test Egypt`, which already has a document and a logo attached.

**Steps:**

1. Change one Agency Master field.
2. Do not touch the Upload Document or Agency Logo sections.
3. Enter a value in `Remarks`.
4. Click **Send For Approval**.

**Expected Result:** The agency is submitted successfully and the existing document and logo remain attached.

**Priority:** P2

**Tags:** Atomic, Assumption-based

**Notes:** **Assumption-based** — resolves Project Context ASM-012. AC-3 and AC-4 mark the document and logo Mandatory, which may describe the create-time rule rather than a re-upload requirement on every update. If submission is blocked demanding a re-upload, that is the answer and should be recorded as a finding against the story's intent.

**Review:** Approved

**Automation:** Rejected

### TC-AGENCY-052 — Changing Branch re-inherits dependent values

**Objective:** Verify what happens to inherited values when an existing agency's Branch is changed.

**Preconditions:** An agency in a dedicated environment, with Country, Product Access, and Sales Contact values recorded beforehand.

**Steps:**

1. Record the current Country, Product Access rows, and Sales Contact values.
2. Change the `Branch` selection to a different branch.
3. Observe Country, Product Access, and Sales Contact.

**Expected Result:** Country updates to the new branch's country; the behaviour of Product Access and Sales Contact matches the documented inheritance rule.

**Priority:** P2

**Tags:** Atomic, Assumption-based, Deferred

**Notes:** **DEFERRED — do not execute in this run.** Resolves Project Context ASM-016. Changing Branch may overwrite Product Access and Sales Contact values the agency already holds, and on a shared environment that is a destructive, possibly unrecoverable change to a live commercial record. Record as `Deferred / Requires Dedicated Environment`. The expected result is deliberately open because no source documents whether re-inheritance should overwrite existing values — that question is what makes the case worth running once an environment allows it.

**Review:** Approved

**Automation:** Approved


### TC-AGENCY-053 — Agency name accepts a space between words

**Objective:** Verify that a space is within the agency name's allowed character set.

**Preconditions:** On the Update Agency form for agency `AGN2 — Test Egypt`.

**Test Data:** Agency: `QA Test Agency`

**Steps:**

1. Clear the `Agency` field.
2. Type the Test Data value.
3. Enter a value in `Remarks`.
4. Click **Send For Approval**.
5. Reopen the same agency.

**Expected Result:** The value is accepted and redisplayed exactly as entered, space included.

**Priority:** P1

**Tags:** Atomic, Regression

**Notes:** **Added 2026-08-01.** The reviewer reported the field accepts letters, digits and underscore only — which, read literally, excludes the space. This case exists because **the agency's own stored name already contains one**: `AGN2 — Test Egypt`. If a space is genuinely rejected, then no agency whose name has a space can be resubmitted without first being renamed, which would block updates across the existing data set — hence P1, not P3. The expected result is therefore stated definitely rather than left open: the existing data proves a space must be storable, so rejection is a defect, not an undocumented rule. Kept separate from TC-AGENCY-005 deliberately — every value there is space-free, so one case tests one rule and a failure is unambiguous. Restore the original name afterwards.

**Automation:** Approved

**Review:** Approved
