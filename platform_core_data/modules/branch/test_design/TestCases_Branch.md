# Manual Test Suite — Branch

| Field | Value |
|---|---|
| Module | `branch` |
| Produced by run | `run-002__2026-08-03_10-26-17__UserStory__US-8605CreateBranch` |
| Revision | 2 (in place — TC-BR-026/027 corrected: cross-field Warning Prompt/Credit Terms validation confirmed, TC-BR-026 re-isolated from it) |
| Run Scope Type / Run Type | User Story / User Story |
| Project Context | `modules/branch/context/ProjectContext.md` |
| Total Test Cases | 39 |
| Generated | 2026-08-03 |
| Status | Approved — 31/39 Approved, 8 Rejected (module owner review, 2026-08-03); Rejected cases remain in the suite as a record, excluded from Stage 4 scope by owner decision |

## Case Index

| Test Case ID | Title | Tier | Priority | Tags | Review | Automation |
|---|---|---|---|---|---|---|
| TC-BR-001 | Create Branch with all mandatory Branch Details fields | Atomic | P1 | Atomic, Positive | Approved | Approved |
| TC-BR-002 | Mandatory Branch Details fields block submission when empty | Atomic | P1 | Atomic, Negative-EmptyValues | Approved | Approved |
| TC-BR-003 | Branch Name rejects non-alphanumeric special characters | Atomic | P2 | Atomic, Negative-SpecialCharacters | Approved | Rejected |
| TC-BR-004 | Country field auto-fills based on selected Operating Country | Atomic | P2 | Atomic, Positive | Approved | Approved |
| TC-BR-005 | State dropdown populates based on selected Country | Atomic | P2 | Atomic, Positive | Approved | Rejected |
| TC-BR-006 | City dropdown populates based on selected State | Atomic | P2 | Atomic, Positive | Approved | Rejected |
| TC-BR-007 | Post Office Box accepts an alphanumeric value up to 8 characters | Atomic | P2 | Atomic, Positive, Boundary | Rejected | Rejected |
| TC-BR-008 | Post Office Box rejects a value exceeding 8 characters | Atomic | P1 | Atomic, Negative-BoundaryValues, Regression | Rejected | Rejected |
| TC-BR-009 | Phone Number requires a country code and a numeric value | Atomic | P2 | Atomic, Positive | Rejected | Rejected |
| TC-BR-010 | Phone Number rejects non-numeric characters | Atomic | P2 | Atomic, Negative-InvalidInputs | Approved | Rejected |
| TC-BR-011 | Service Tax Number and ABTA Number accept optional uppercase alphanumeric values | Atomic | P3 | Atomic, Positive | Rejected | Rejected |
| TC-BR-012 | Create Branch with valid Branch Email Configuration | Atomic | P1 | Atomic, Positive | Approved | Rejected |
| TC-BR-013 | Mandatory Branch Email Configuration fields block submission when empty | Atomic | P1 | Atomic, Negative-EmptyValues | Approved | Approved |
| TC-BR-014 | Email Password accepts a value up to 15 characters | Atomic | P2 | Atomic, Positive, Boundary | Rejected | Rejected |
| TC-BR-015 | Email Password rejects a value exceeding 15 characters | Atomic | P2 | Atomic, Negative-BoundaryValues | Rejected | Rejected |
| TC-BR-016 | Add Branch Contact Person with valid Name, Email, and Phone | Atomic | P1 | Atomic, Positive | Approved | Rejected |
| TC-BR-017 | Mandatory Branch Contact Info fields block submission when empty | Atomic | P1 | Atomic, Negative-EmptyValues | Approved | Rejected |
| TC-BR-018 | Contact Name rejects characters other than letters, spaces, and a single dot | Atomic | P2 | Atomic, Negative-SpecialCharacters | Rejected | Rejected |
| TC-BR-019 | Add multiple Contact Persons using the Add button | Scenario | P3 | Scenario, Positive | Approved | Rejected |
| TC-BR-020 | Add Target requires Target Amount, Month, and Year before enabling Add Target | Atomic | P3 | Atomic, Positive | Rejected | Rejected |
| TC-BR-021 | Mandatory Branch Sales Configuration fields block submission when empty | Atomic | P1 | Atomic, Negative-EmptyValues | Approved | Approved |
| TC-BR-022 | Credit Limit rejects non-numeric input | Atomic | P2 | Atomic, Negative-InvalidInputs | Approved | Rejected |
| TC-BR-023 | Credit Limit rejects a value exceeding 15 characters | Atomic | P1 | Atomic, Negative-BoundaryValues, Regression | Approved | Rejected |
| TC-BR-024 | Reaching Percentage rejects a value greater than 100% | Atomic | P2 | Atomic, Negative-BoundaryValues | Approved | Approved |
| TC-BR-025 | Reaching Percentage accepts a value with up to 3 decimal places | Atomic | P3 | Atomic, Positive, Boundary | Approved | Approved |
| TC-BR-026 | Warning Prompt (Days) rejects a value exceeding 11 digits | Atomic | P1 | Atomic, Negative-BoundaryValues, Regression | Approved | Approved |
| TC-BR-027 | Warning Prompt (Days) rejects a value greater than Credit Terms (Days) | Atomic | P2 | Atomic, Negative-InvalidInputs | Approved | Rejected |
| TC-BR-028 | Select at least one Payment Option | Atomic | P3 | Atomic, Positive | Approved | Approved |
| TC-BR-029 | Product Access grid displays the required columns | Atomic | P2 | Atomic, Positive | Approved | Rejected |
| TC-BR-030 | Description field is enabled only when a Supplier row is selected | Atomic | P2 | Atomic, Positive | Approved | Approved |
| TC-BR-031 | Description field is mandatory once a Supplier row is selected | Atomic | P2 | Atomic, Negative-EmptyValues | Approved | Rejected |
| TC-BR-032 | Selecting a GDS-type Supplier reveals the Supplier Credentials sub-grid | Atomic | P2 | Atomic, Positive | Approved | Rejected |
| TC-BR-033 | Search Supplier Credentials PCC and Ticketing Supplier Credential PCC are not present on the UI | Atomic | P3 | Atomic, Positive | Approved | Rejected |
| TC-BR-034 | Submit for Approval saves the Branch and submits it for review | Scenario | P1 | Scenario, Positive | Approved | Rejected |
| TC-BR-035 | Submit action button displays the label "Submit for Approval" | Atomic | P4 | Atomic, Negative-UILabel, Regression | Approved | Rejected |
| TC-BR-036 | Cancel exits the Create Branch form without saving | Atomic | P2 | Atomic, Positive | Approved | Rejected |
| TC-BR-037 | Create Branch with a valid Child Agencies Threshold Amount value | Atomic | P2 | Atomic, Positive, ExpectedImplementation | Approved | Approved |
| TC-BR-038 | Child Agencies Threshold Amount blocks submission when empty | Atomic | P3 | Atomic, Negative-EmptyValues, AssumptionBased, ExpectedImplementation | Approved | Approved |
| TC-BR-039 | Child Agencies Threshold Amount accepts a numeric value | Atomic | P3 | Atomic, Positive, ExpectedImplementation | Approved | Approved |

**Tier breakdown:** 37 Atomic · 2 Scenario

**Lifecycle breakdown:** Review — 0 Pending · 31 Approved · 8 Rejected · Automation — 0 Pending · 13 Approved · 26 Rejected

## Test Cases

### TC-BR-001 — Create Branch with all mandatory Branch Details fields

**Objective:** Verify that a Branch can be created when every mandatory Branch Details field is completed.

**Preconditions:** User is logged in as Super Admin. Country POS master data exists for at least one Operating Country.

**Test Data:**

| Field | Value |
|---|---|
| Operating Country | Egypt |
| Name | QA_BRANCH_001 |
| Address 1 | 1 Test Street |
| Post Office Box | QA12345 |
| Phone Number | +20 1001234567 |

**Steps:**

1. Open Admin → Branch → Add branch.
2. Select the Operating Country.
3. Enter the Branch Name.
4. Select a State.
5. Select a City.
6. Enter Address 1.
7. Enter the Post Office Box.
8. Enter the Phone Number with country code.
9. Complete the remaining mandatory sections (Branch Email Configuration, Branch Contact Info, Branch Sales Configuration) with valid data.
10. Click **Submit for Approval**.

**Expected Result:** The Branch is saved and its status shows "Pending for approval."

**Priority:** P1

**Tags:** Atomic, Positive

**Review:** Approved

**Automation:** Approved

---

### TC-BR-002 — Mandatory Branch Details fields block submission when empty

**Objective:** Verify that each mandatory Branch Details field blocks submission when left empty.

**Preconditions:** User is logged in as Super Admin and has opened Admin → Branch → Add branch.

**Test Data:**

| Field Left Empty |
|---|
| Operating Country |
| Name |
| State |
| City |
| Address 1 |
| Post Office Box |
| Phone Number |

**Steps:**

1. Fill every Branch Details field with valid data except the one field under test.
2. Leave that one field empty.
3. Click **Submit for Approval**.
4. Repeat steps 1–3 for each field listed in Test Data.

**Expected Result:** For each field left empty, the system blocks submission and shows a required-field validation message for that field.

**Priority:** P1

**Tags:** Atomic, Negative-EmptyValues

**Review:** Approved

**Automation:** Approved

---

### TC-BR-003 — Branch Name rejects non-alphanumeric special characters

**Objective:** Verify that the Branch Name field only accepts alphanumeric input.

**Preconditions:** User is logged in as Super Admin and has opened Admin → Branch → Add branch.

**Test Data:**

| Field | Value |
|---|---|
| Name | `QA<script>Branch</script>` |

**Steps:**

1. Enter the Test Data value into the Name field.
2. Move focus away from the field.

**Expected Result:** The system rejects the special characters, either by blocking input or displaying a validation message indicating only alphanumeric characters are allowed.

**Priority:** P2

**Tags:** Atomic, Negative-SpecialCharacters

**Review:** Approved

**Automation:** Rejected

---

### TC-BR-004 — Country field auto-fills based on selected Operating Country

**Objective:** Verify that the Country field auto-fills once an Operating Country is selected.

**Preconditions:** User is logged in as Super Admin and has opened Admin → Branch → Add branch.

**Test Data:**

| Field | Value |
|---|---|
| Operating Country | Egypt |

**Steps:**

1. Select the Operating Country.
2. Observe the Country field.

**Expected Result:** The Country field is automatically populated and remains read-only.

**Priority:** P2

**Tags:** Atomic, Positive

**Notes:** Discovery did not exercise this cascade against live master data this run (Open Question OQ-BR-1) — execution is the first live verification of this behavior.

**Review:** Approved

**Automation:** Approved

---

### TC-BR-005 — State dropdown populates based on selected Country

**Objective:** Verify that the State dropdown populates once the Country field is set.

**Preconditions:** User is logged in as Super Admin, has opened Admin → Branch → Add branch, and has selected an Operating Country.

**Steps:**

1. Observe the State dropdown after the Country auto-fills.
2. Click the State dropdown.

**Expected Result:** The State dropdown lists states belonging to the auto-filled Country.

**Priority:** P2

**Tags:** Atomic, Positive

**Notes:** Not independently verified in Discovery (Open Question OQ-BR-1).

**Review:** Approved

**Automation:** Rejected

---

### TC-BR-006 — City dropdown populates based on selected State

**Objective:** Verify that the City dropdown populates once a State is selected.

**Preconditions:** User is logged in as Super Admin, has opened Admin → Branch → Add branch, and has selected an Operating Country and a State.

**Steps:**

1. Select a State.
2. Click the City dropdown.

**Expected Result:** The City dropdown lists cities belonging to the selected State.

**Priority:** P2

**Tags:** Atomic, Positive

**Notes:** Not independently verified in Discovery (Open Question OQ-BR-1).

**Review:** Approved

**Automation:** Rejected

---

### TC-BR-007 — Post Office Box accepts an alphanumeric value up to 8 characters

**Objective:** Verify that Post Office Box accepts a valid alphanumeric value at its maximum allowed length.

**Preconditions:** User is logged in as Super Admin and has opened Admin → Branch → Add branch.

**Test Data:**

| Field | Value |
|---|---|
| Post Office Box | QA123456 (8 characters) |

**Steps:**

1. Enter the Test Data value into Post Office Box.
2. Move focus away from the field.

**Expected Result:** The 8-character value is accepted with no validation error.

**Priority:** P2

**Tags:** Atomic, Positive, Boundary

**Review:** Rejected

**Automation:** Rejected

---

### TC-BR-008 — Post Office Box rejects a value exceeding 8 characters

**Objective:** Verify that Post Office Box rejects input longer than 8 characters.

**Preconditions:** User is logged in as Super Admin and has opened Admin → Branch → Add branch.

**Test Data:**

| Field | Value |
|---|---|
| Post Office Box | QA1234567 (9 characters) |

**Steps:**

1. Enter the Test Data value into Post Office Box.
2. Move focus away from the field.

**Expected Result:** The system truncates the input to 8 characters, or blocks the 9th character from being entered, or displays a validation message that the maximum length is 8 characters.

**Priority:** P1

**Tags:** Atomic, Negative-BoundaryValues, Regression

**Notes:** Regression test for FINDING-002 — as of Discovery 2026-08-03, a 12-character value was fully accepted with no truncation or error. This case must fail against that observed behavior and pass only once the max-length rule is enforced.

**Review:** Rejected

**Automation:** Rejected

---

### TC-BR-009 — Phone Number requires a country code and a numeric value

**Objective:** Verify that Phone Number is entered as a country code selection plus a numeric value.

**Preconditions:** User is logged in as Super Admin and has opened Admin → Branch → Add branch.

**Test Data:**

| Field | Value |
|---|---|
| Country Code | +20 |
| Phone Number | 1001234567 |

**Steps:**

1. Select the country code from the dropdown.
2. Enter the numeric phone value.

**Expected Result:** Both the selected country code and the entered number are retained together as the Phone Number value.

**Priority:** P2

**Tags:** Atomic, Positive

**Review:** Rejected

**Automation:** Rejected

---

### TC-BR-010 — Phone Number rejects non-numeric characters

**Objective:** Verify that the Phone Number field rejects non-numeric input.

**Preconditions:** User is logged in as Super Admin and has opened Admin → Branch → Add branch.

**Test Data:**

| Field | Value |
|---|---|
| Phone Number | ABC1234567 |

**Steps:**

1. Enter the Test Data value into the Phone Number field.
2. Move focus away from the field.

**Expected Result:** The system rejects the non-numeric input, either by blocking entry or displaying a validation message.

**Priority:** P2

**Tags:** Atomic, Negative-InvalidInputs

**Review:** Approved

**Automation:** Rejected

---

### TC-BR-011 — Service Tax Number and ABTA Number accept optional uppercase alphanumeric values

**Objective:** Verify that Service Tax Number and ABTA Number accept alphanumeric values and are not required for submission.

**Preconditions:** User is logged in as Super Admin and has opened Admin → Branch → Add branch.

**Test Data:**

| Field | Value |
|---|---|
| Service Tax Number | STN12345 |
| ABTA Number | ABTA6789 |

**Steps:**

1. Enter the Test Data values into Service Tax Number and ABTA Number.
2. Complete every other mandatory field with valid data.
3. Click **Submit for Approval**.

**Expected Result:** The Branch is submitted successfully with the entered Service Tax Number and ABTA Number values retained.

**Priority:** P3

**Tags:** Atomic, Positive

**Review:** Rejected

**Automation:** Rejected

---

### TC-BR-012 — Create Branch with valid Branch Email Configuration

**Objective:** Verify that a Branch Email ID and Email Password can be entered successfully.

**Preconditions:** User is logged in as Super Admin and has opened Admin → Branch → Add branch.

**Test Data:**

| Field | Value |
|---|---|
| Branch Email ID | qa.branch001@example.com |
| Email Password | Passw0rd!2026 |

**Steps:**

1. Enter the Branch Email ID.
2. Enter the Email Password.

**Expected Result:** Both values are accepted with no validation error.

**Priority:** P1

**Tags:** Atomic, Positive

**Review:** Approved

**Automation:** Rejected

---

### TC-BR-013 — Mandatory Branch Email Configuration fields block submission when empty

**Objective:** Verify that Branch Email ID and Email Password block submission when left empty.

**Preconditions:** User is logged in as Super Admin and has opened Admin → Branch → Add branch.

**Test Data:**

| Field Left Empty |
|---|
| Branch Email ID |
| Email Password |

**Steps:**

1. Fill every other mandatory field with valid data.
2. Leave the field under test empty.
3. Click **Submit for Approval**.
4. Repeat steps 1–3 for each field listed in Test Data.

**Expected Result:** For each field left empty, the system blocks submission and shows a required-field validation message for that field.

**Priority:** P1

**Tags:** Atomic, Negative-EmptyValues

**Review:** Approved

**Automation:** Approved

---

### TC-BR-014 — Email Password accepts a value up to 15 characters

**Objective:** Verify that Email Password accepts a value at its maximum allowed length.

**Preconditions:** User is logged in as Super Admin and has opened Admin → Branch → Add branch.

**Test Data:**

| Field | Value |
|---|---|
| Email Password | Aa1!Aa1!Aa1!Aa1 (15 characters) |

**Steps:**

1. Enter the Test Data value into Email Password.
2. Move focus away from the field.

**Expected Result:** The 15-character value is accepted with no validation error.

**Priority:** P2

**Tags:** Atomic, Positive, Boundary

**Notes:** Not independently verified in Discovery — Email Password boundary behavior was not captured this run.

**Review:** Rejected

**Automation:** Rejected

---

### TC-BR-015 — Email Password rejects a value exceeding 15 characters

**Objective:** Verify that Email Password rejects a value longer than 15 characters.

**Preconditions:** User is logged in as Super Admin and has opened Admin → Branch → Add branch.

**Test Data:**

| Field | Value |
|---|---|
| Email Password | Aa1!Aa1!Aa1!Aa1! (16 characters) |

**Steps:**

1. Enter the Test Data value into Email Password.
2. Move focus away from the field.

**Expected Result:** The system truncates the input to 15 characters, blocks the 16th character, or displays a validation message that the maximum length is 15 characters.

**Priority:** P2

**Tags:** Atomic, Negative-BoundaryValues

**Notes:** Not independently verified in Discovery — Email Password boundary behavior was not captured this run.

**Review:** Rejected

**Automation:** Rejected

---

### TC-BR-016 — Add Branch Contact Person with valid Name, Email, and Phone

**Objective:** Verify that a Branch Contact Person can be added with valid Name, Email ID, and Phone Number.

**Preconditions:** User is logged in as Super Admin and has opened Admin → Branch → Add branch.

**Test Data:**

| Field | Value |
|---|---|
| Name | Ahmed Ayman |
| Email ID | contact.qa@example.com |
| Phone Number | +20 1001234567 |

**Steps:**

1. Enter the Contact Name.
2. Enter the Contact Email ID.
3. Enter the Contact Phone Number.
4. Click **Add**.

**Expected Result:** The contact person is added and appears in the Branch Contact Info list.

**Priority:** P1

**Tags:** Atomic, Positive

**Review:** Approved

**Automation:** Rejected

---

### TC-BR-017 — Mandatory Branch Contact Info fields block submission when empty

**Objective:** Verify that Contact Name, Email ID, and Phone Number block submission when left empty.

**Preconditions:** User is logged in as Super Admin and has opened Admin → Branch → Add branch.

**Test Data:**

| Field Left Empty |
|---|
| Name |
| Email ID |
| Phone Number |

**Steps:**

1. Fill every other mandatory field with valid data.
2. Leave the Branch Contact Info field under test empty.
3. Click **Submit for Approval**.
4. Repeat steps 1–3 for each field listed in Test Data.

**Expected Result:** For each field left empty, the system blocks submission and shows a required-field validation message for that field.

**Priority:** P1

**Tags:** Atomic, Negative-EmptyValues

**Review:** Approved

**Automation:** Rejected

---

### TC-BR-018 — Contact Name rejects characters other than letters, spaces, and a single dot

**Objective:** Verify that Contact Name only accepts alphabets, spaces, and a single dot.

**Preconditions:** User is logged in as Super Admin and has opened Admin → Branch → Add branch.

**Test Data:**

| Field | Value |
|---|---|
| Name | Ahmed123!@# |

**Steps:**

1. Enter the Test Data value into the Contact Name field.
2. Move focus away from the field.

**Expected Result:** The system rejects the numeric and special-character input, either by blocking it or displaying a validation message.

**Priority:** P2

**Tags:** Atomic, Negative-SpecialCharacters

**Review:** Rejected

**Automation:** Rejected

---

### TC-BR-019 — Add multiple Contact Persons using the Add button

**Objective:** Verify that more than one Contact Person can be added to a Branch.

**Preconditions:** User is logged in as Super Admin and has opened Admin → Branch → Add branch.

**Test Data:**

| Contact | Name | Email ID | Phone Number |
|---|---|---|---|
| 1 | Ahmed Ayman | contact1.qa@example.com | +20 1001234567 |
| 2 | Sara Ali | contact2.qa@example.com | +20 1007654321 |

**Steps:**

1. Enter Contact 1's details and click **Add**.
2. Enter Contact 2's details and click **Add**.

**Expected Result:** Both contact persons appear in the Branch Contact Info list.

**Priority:** P3

**Tags:** Scenario, Positive

**Review:** Approved

**Automation:** Rejected

---

### TC-BR-020 — Add Target requires Target Amount, Month, and Year before enabling Add Target

**Objective:** Verify that Add Target only becomes usable once Target Amount, Month, and Year are all entered.

**Preconditions:** User is logged in as Super Admin and has opened Admin → Branch → Add branch.

**Test Data:**

| Field | Value |
|---|---|
| Target Amount | 5000 |
| Set Month | January |
| Set Year | 2026 |

**Steps:**

1. Enter the Target Amount only.
2. Attempt to click **Add Target**.
3. Select the Month and Year.
4. Click **Add Target**.

**Expected Result:** Step 2 does not add a target while a field is missing; step 4 adds the target once all three fields are populated.

**Priority:** P3

**Tags:** Atomic, Positive

**Review:** Rejected

**Automation:** Rejected

---

### TC-BR-021 — Mandatory Branch Sales Configuration fields block submission when empty

**Objective:** Verify that Credit Limit, Top-Up Limit, and Credit Terms (Days) block submission when left empty.

**Preconditions:** User is logged in as Super Admin and has opened Admin → Branch → Add branch.

**Test Data:**

| Field Left Empty |
|---|
| Credit Limit |
| Top Up Limit |
| Credit Terms(Days) |

**Steps:**

1. Fill every other mandatory field with valid data.
2. Leave the field under test empty.
3. Click **Submit for Approval**.
4. Repeat steps 1–3 for each field listed in Test Data.

**Expected Result:** For each field left empty, the system blocks submission and shows a required-field validation message for that field.

**Priority:** P1

**Tags:** Atomic, Negative-EmptyValues

**Review:** Approved

**Automation:** Approved

---

### TC-BR-022 — Credit Limit rejects non-numeric input

**Objective:** Verify that Credit Limit only accepts numeric input.

**Preconditions:** User is logged in as Super Admin and has opened Admin → Branch → Add branch.

**Test Data:**

| Field | Value |
|---|---|
| Credit Limit | abc123xyz |

**Steps:**

1. Enter the Test Data value into Credit Limit.
2. Move focus away from the field.

**Expected Result:** The system displays a validation message indicating that only a numeric value is accepted.

**Priority:** P2

**Tags:** Atomic, Negative-InvalidInputs

**Review:** Approved

**Automation:** Rejected

---

### TC-BR-023 — Credit Limit rejects a value exceeding 15 characters

**Objective:** Verify that Credit Limit rejects a numeric value longer than 15 characters.

**Preconditions:** User is logged in as Super Admin and has opened Admin → Branch → Add branch.

**Test Data:**

| Field | Value |
|---|---|
| Credit Limit | 1234567890123456 (16 digits) |

**Steps:**

1. Enter the Test Data value into Credit Limit.
2. Move focus away from the field.

**Expected Result:** The system truncates the input to 15 characters, blocks the 16th digit, or displays a validation message that the maximum length is 15 characters.

**Priority:** P1

**Tags:** Atomic, Negative-BoundaryValues, Regression

**Notes:** Regression test for FINDING-003 — as of Discovery 2026-08-03, a 16-digit value was fully accepted with no truncation or error. This case must fail against that observed behavior and pass only once the max-length rule is enforced.

**Review:** Approved

**Automation:** Rejected

---

### TC-BR-024 — Reaching Percentage rejects a value greater than 100%

**Objective:** Verify that Reaching Percentage rejects a value above 100%.

**Preconditions:** User is logged in as Super Admin and has opened Admin → Branch → Add branch.

**Test Data:**

| Field | Value |
|---|---|
| Reaching Percentage | 150.123 |

**Steps:**

1. Enter the Test Data value into Reaching Percentage.
2. Move focus away from the field.

**Expected Result:** The system displays a validation message stating Reaching Percentage should not be greater than 100%.

**Priority:** P2

**Tags:** Atomic, Negative-BoundaryValues

**Notes:** This rule was already confirmed enforced during Discovery 2026-08-03 (Confirmed Behaviour) — this case formalizes it as a repeatable regression check.

**Review:** Approved

**Automation:** Approved

---

### TC-BR-025 — Reaching Percentage accepts a value with up to 3 decimal places

**Objective:** Verify that Reaching Percentage accepts a value with exactly 3 decimal places.

**Preconditions:** User is logged in as Super Admin and has opened Admin → Branch → Add branch.

**Test Data:**

| Field | Value |
|---|---|
| Reaching Percentage | 99.123 |

**Steps:**

1. Enter the Test Data value into Reaching Percentage.
2. Move focus away from the field.

**Expected Result:** The value is accepted with no validation error.

**Priority:** P3

**Tags:** Atomic, Positive, Boundary

**Notes:** Not independently verified in Discovery — Discovery's blur probe on this field used a >100% value, which surfaced the percentage-cap message but did not isolate the 3-decimal-place rule specifically.

**Review:** Approved

**Automation:** Approved

---

### TC-BR-026 — Warning Prompt (Days) rejects a value exceeding 11 digits

**Objective:** Verify that Warning Prompt (Days) rejects a value longer than 11 digits, isolated from the separate cross-field rule verified by TC-BR-027.

**Preconditions:** User is logged in as Super Admin and has opened Admin → Branch → Add branch.

**Test Data:**

| Field | Value |
|---|---|
| Credit Terms(Days) | 999999999999999 (15 digits) |
| Warning Prompt(Days) | 999999999999999 (15 digits) |

**Steps:**

1. Enter the Credit Terms (Days) Test Data value first, so the cross-field rule ("Warning prompt days should not be greater than credit terms days") cannot itself be the source of any resulting message.
2. Enter the Warning Prompt (Days) Test Data value.
3. Move focus away from the field.

**Expected Result:** The system truncates the input to 11 digits, blocks the 12th digit, or displays a validation message that the maximum length is 11 digits. (If the application instead only ever shows the cross-field message from TC-BR-027 and never a length-specific one, that is itself evidence for FINDING-004 and must be recorded, not assumed away.)

**Priority:** P1

**Tags:** Atomic, Negative-BoundaryValues, Regression

**Notes:** Module-owner-supplied evidence (2026-08-03) confirmed the live application also enforces a separate cross-field rule — "Warning prompt days should not be greater than credit terms days" (see TC-BR-027) — that fires whenever Warning Prompt (Days) > Credit Terms (Days). The original version of this test case entered only Warning Prompt(Days) with Credit Terms(Days) left blank, which the module owner flagged as incorrect: with Credit Terms unset, any resulting message could be the cross-field rule rather than a length-specific one, so the test did not actually isolate FINDING-004's length-cap defect. Test Data now sets Credit Terms(Days) to the same value as Warning Prompt(Days) so the cross-field rule is satisfied (not violated) and cannot mask the length check. Regression test for FINDING-004 — as of Discovery 2026-08-03, a 14-digit value was fully accepted with no truncation or error; this case must fail against that observed behavior and pass only once the max-length rule is enforced.

**Review:** Approved

**Automation:** Approved

---

### TC-BR-027 — Warning Prompt (Days) rejects a value greater than Credit Terms (Days)

**Objective:** Verify that Warning Prompt (Days) is rejected when it is greater than Credit Terms (Days).

**Preconditions:** User is logged in as Super Admin and has opened Admin → Branch → Add branch.

**Test Data:**

| Field | Value |
|---|---|
| Credit Terms(Days) | 10000 |
| Warning Prompt(Days) | 151515 |

**Steps:**

1. Enter the Credit Terms (Days) value.
2. Enter a Warning Prompt (Days) value that is greater than Credit Terms (Days).
3. Move focus away from the field.

**Expected Result:** The system displays the validation message "Warning prompt days should not be greater than credit terms days".

**Priority:** P2

**Tags:** Atomic, Negative-InvalidInputs

**Notes:** Confirmed via module-owner-supplied screenshot (2026-08-03) showing the exact live behavior and message text with these Test Data values — this closes Discovery's OQ-BR-2 and resolves RISK-BR-2 in full (ProjectContext.md §6). No longer assumption-based; Evidence Category is Human Observation (module-owner-provided, not independently reproduced by Explorer this run). The rule is strictly-greater-than — equal values (e.g. both 10000) are not expected to be rejected; that boundary is not separately re-verified here and remains an assumption if a future case needs it.

**Review:** Approved

**Automation:** Rejected

---

### TC-BR-028 — Select at least one Payment Option

**Objective:** Verify that a Payment Option can be selected and retained on the Create Branch form.

**Preconditions:** User is logged in as Super Admin and has opened Admin → Branch → Add branch.

**Test Data:**

| Field | Value |
|---|---|
| Payment Option | Cash |

**Steps:**

1. Select the Cash checkbox in Payment Option.
2. Complete every other mandatory field with valid data.
3. Click **Submit for Approval**.

**Expected Result:** The Branch is submitted successfully with Cash retained as the selected Payment Option.

**Priority:** P3

**Tags:** Atomic, Positive

**Notes:** This case intentionally does not assert on the full contents of the Payment Option list. The list reflects the Payment Gateway module's Active records live (confirmed 2026-08-03, FINDING-001, documented exception) — that is not a Branch-side rule this suite tests. The AC's conditional Payment Gateway dropdown on Credit Card selection is also not tested here — confirmed absent and dispositioned as an Outdated Requirement (FINDING-007, documented exception).

**Review:** Approved

**Automation:** Approved

---

### TC-BR-029 — Product Access grid displays the required columns

**Objective:** Verify that the Product Access grid displays Status, Supplier Name, Credential Name, Product Name, and Description columns.

**Preconditions:** User is logged in as Super Admin and has opened Admin → Branch → Add branch.

**Steps:**

1. Scroll to the Product Access Details grid.
2. Observe the column headers.

**Expected Result:** The grid displays exactly the columns Status, Supplier Name, Credential Name, Product Name, and Description.

**Priority:** P2

**Tags:** Atomic, Positive

**Review:** Approved

**Automation:** Rejected

---

### TC-BR-030 — Description field is enabled only when a Supplier row is selected

**Objective:** Verify that the Description field in the Product Access grid is disabled until its Supplier row is selected.

**Preconditions:** User is logged in as Super Admin and has opened Admin → Branch → Add branch.

**Steps:**

1. Observe the Description field for a Supplier row that is not selected.
2. Select the Status checkbox for that Supplier row.
3. Observe the Description field again.

**Expected Result:** The Description field is disabled in step 1 and becomes enabled after the Supplier row is selected in step 2.

**Priority:** P2

**Tags:** Atomic, Positive

**Review:** Approved

**Automation:** Approved

---

### TC-BR-031 — Description field is mandatory once a Supplier row is selected

**Objective:** Verify that Description blocks submission when its Supplier row is selected but Description is left empty.

**Preconditions:** User is logged in as Super Admin and has opened Admin → Branch → Add branch.

**Steps:**

1. Select the Status checkbox for a Supplier row.
2. Leave that row's Description field empty.
3. Complete every other mandatory field with valid data.
4. Click **Submit for Approval**.

**Expected Result:** The system blocks submission and shows a required-field validation message for Description.

**Priority:** P2

**Tags:** Atomic, Negative-EmptyValues

**Review:** Approved

**Automation:** Rejected

---

### TC-BR-032 — Selecting a GDS-type Supplier reveals the Supplier Credentials sub-grid

**Objective:** Verify that selecting a GDS-type Supplier row displays the Supplier Credentials sub-grid.

**Preconditions:** User is logged in as Super Admin, has opened Admin → Branch → Add branch, and at least one GDS-type Supplier row exists in the Product Access grid.

**Steps:**

1. Select the Status checkbox for a GDS-type Supplier row.
2. Observe the area beneath the Product Access grid.

**Expected Result:** A sub-grid appears with Generic Supplier Credentials (PCC) (multi-select), Manager Name, and Supplier Credentials Description.

**Priority:** P2

**Tags:** Atomic, Positive

**Notes:** Not independently verified in Discovery — this area was recorded as Blocked in Coverage_Summary.md §5 because no supplier row was checked during that pass. This is the first live verification.

**Review:** Approved

**Automation:** Rejected

---

### TC-BR-033 — Search Supplier Credentials PCC and Ticketing Supplier Credential PCC are not present on the UI

**Objective:** Verify that Search Supplier Credentials PCC and Ticketing Supplier Credential PCC controls do not appear anywhere on the Create Branch screen.

**Preconditions:** User is logged in as Super Admin and has opened Admin → Branch → Add branch.

**Steps:**

1. Select a GDS-type Supplier row to reveal its sub-grid.
2. Search the page for "Search Supplier Credentials PCC" and "Ticketing Supplier Credential PCC."

**Expected Result:** Neither control is present anywhere on the page.

**Priority:** P3

**Tags:** Atomic, Positive

**Review:** Approved

**Automation:** Rejected

---

### TC-BR-034 — Submit for Approval saves the Branch and submits it for review

**Objective:** Verify that submitting a fully completed Create Branch form saves the record and sends it for approval.

**Preconditions:** User is logged in as Super Admin and has completed every mandatory field on the Create Branch form with valid data.

**Steps:**

1. Click the primary submit action button.

**Expected Result:** The Branch is saved and its status shows "Pending for approval."

**Priority:** P1

**Tags:** Scenario, Positive

**Review:** Approved

**Automation:** Rejected

---

### TC-BR-035 — Submit action button displays the label "Submit for Approval"

**Objective:** Verify that the primary submit action button on Create Branch reads "Submit for Approval."

**Preconditions:** User is logged in as Super Admin and has opened Admin → Branch → Add branch.

**Steps:**

1. Scroll to the bottom of the Create Branch form.
2. Read the primary action button's label.

**Expected Result:** The button reads exactly "Submit for Approval."

**Priority:** P4

**Tags:** Atomic, Negative-UILabel, Regression

**Notes:** Regression test for FINDING-011 — as of Discovery 2026-08-03, the button read "Send For Approval." This case must fail against that observed label and pass only once the label is corrected.

**Review:** Approved

**Automation:** Rejected

---

### TC-BR-036 — Cancel exits the Create Branch form without saving

**Objective:** Verify that clicking Cancel exits Create Branch without saving any entered data.

**Preconditions:** User is logged in as Super Admin and has entered data into at least one field on the Create Branch form.

**Steps:**

1. Click **Cancel**.
2. Navigate back to Admin → Branch.
3. Search for the Branch Name entered in step 1.

**Expected Result:** The Branch is not found — no record was saved.

**Priority:** P2

**Tags:** Atomic, Positive

**Review:** Approved

**Automation:** Rejected

---

### TC-BR-037 — Create Branch with a valid Child Agencies Threshold Amount value

**Objective:** Verify that a Branch can be created with a valid Child Agencies Threshold Amount value.

**Preconditions:** User is logged in as Super Admin and has opened Admin → Branch → Add branch.

**Test Data:**

| Field | Value |
|---|---|
| Outstanding Threshold | 10 |

**Steps:**

1. Enter the Test Data value into the Outstanding Threshold field.
2. Complete every other mandatory field with valid data.
3. Click **Submit for Approval**.

**Expected Result:** The Branch is submitted successfully with the entered Outstanding Threshold value retained.

**Priority:** P2

**Tags:** Atomic, Positive, ExpectedImplementation

**Notes:** The live field labeled "Outstanding Threshold" is confirmed to be the same feature as US 51489 §2's "Child Agencies Threshold Amount" (module-owner confirmation, 2026-08-03, FINDING-010). This case traces to US 51489, not US 8605, which does not mention this field.

**Review:** Approved

**Automation:** Approved

---

### TC-BR-038 — Child Agencies Threshold Amount blocks submission when empty

**Objective:** Verify that the Outstanding Threshold field blocks submission when left empty.

**Preconditions:** User is logged in as Super Admin and has opened Admin → Branch → Add branch.

**Steps:**

1. Complete every other mandatory field with valid data.
2. Leave the Outstanding Threshold field empty.
3. Click **Submit for Approval**.

**Expected Result:** The system blocks submission and shows a required-field validation message for Outstanding Threshold.

**Priority:** P3

**Tags:** Atomic, Negative-EmptyValues, AssumptionBased, ExpectedImplementation

**Notes:** Assumption-based test: US 51489 §2 does not explicitly state whether Child Agencies Threshold Amount is Mandatory or Optional; the live UI marks the field Mandatory with an asterisk. This case assumes Mandatory per the observed UI convention, pending confirmation — see CoverageReport.md §8 for the corresponding Coverage Gap.

**Review:** Approved

**Automation:** Approved

---

### TC-BR-039 — Child Agencies Threshold Amount accepts a numeric value

**Objective:** Verify that the Outstanding Threshold field accepts a numeric value.

**Preconditions:** User is logged in as Super Admin and has opened Admin → Branch → Add branch.

**Test Data:**

| Field | Value |
|---|---|
| Outstanding Threshold | 25 |

**Steps:**

1. Enter the Test Data value into the Outstanding Threshold field.
2. Move focus away from the field.

**Expected Result:** The value is accepted with no validation error.

**Priority:** P3

**Tags:** Atomic, Positive, ExpectedImplementation

**Notes:** US 51489 §2 does not specify format constraints (length, decimals) for this field beyond it being a threshold amount — no boundary/negative case is designed here to avoid inventing a rule the requirement doesn't state (see CoverageReport.md §8 for the corresponding Coverage Gap).

**Review:** Approved

**Automation:** Approved
