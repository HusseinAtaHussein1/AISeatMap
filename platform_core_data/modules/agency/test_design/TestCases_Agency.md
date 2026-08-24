# Manual Test Suite — Agency

| Field | Value |
|---|---|
| Module | `agency` |
| Produced by run | `run-004__2026-08-17_14-35-25__UserStory__US-4222-UpdateAgency` |
| Revision | 3 |
| Run Scope Type / Run Type | User Story / User Story |
| Project Context | `modules/agency/context/ProjectContext.md` (revision 4, Approved) |
| Total Test Cases | 60 |
| Generated | 2026-08-18 |
| Status | **Approved** |
| Approved | 2026-08-18 — Ahmed Ayman, Stage 3 Human Review gate, after per-case review of all 60 cases (33 Approved / 27 Rejected / 0 Pending) |
| Revision 1 | run-001, 2026-08-01 — 53 cases. Approved 2026-08-02 after per-case review (37 Approved / 16 Rejected). |
| Revision 2 | run-001, 2026-08-01 — in-place corrections to TC-AGENCY-005 / 007 and the addition of TC-AGENCY-053. |
| Revision 3 | **run-004, 2026-08-18** — re-traced against run-004 Discovery and Project Context revision 4. See §0. |

## 0. What Revision 3 changed

Revision 3 is **not** a rewrite of the suite. Forty-one of the 53 inherited cases changed, seven were
added, one was retired, and twelve are untouched and keep their original approval. Nothing was deleted.

| # | Change | Cases affected | Why |
|---|---|---|---|
| 1 | **The record under test moved off shared agency 949 onto a self-created fixture.** | 41 | Project Context `PO-2` restricts every mutation to Agency records **this run created**, and `execution_safety_policy.json` makes Approve/Reject on a record the run did not create `Forbidden (absolute)`. run-004 Discovery also proved 949 is live shared data: its `Remarks` field reads `QA TC23 - reactivating after test`, written by another tester. `PO-14` grants the run its own Branch, so a compliant fixture exists for the first time. |
| 2 | **AC-9 is unblocked and redesigned.** The PCC section is present, renders one tab per inherited supplier, and carries three controls per tab. | TC-AGENCY-043 rewritten; 054, 055, 056, 057, 060 added | FINDING-008 contradicted run-001's FINDING-002 by controlled experiment. run-001 designed AC-9 as untestable; three of its controls are in fact testable. |
| 3 | **Approve, Reject and the E2E journey are unblocked.** | TC-AGENCY-048, 049, 050 | `PO-9` removes role authorization from this run entirely and states that the single account is neither a blocker nor a risk. The cases no longer wait on a second identity — they assert workflow behaviour and resulting state, never which role may approve. |
| 4 | **Two silent-format behaviours are now designed explicitly.** | TC-AGENCY-004, 009, 035 rewritten; 058 added | FINDING-010, the run's one `Bug`. `Credit limit *` discards alphabetic keystrokes with no message where PRD XC-20 `[V]` requires one; `Company URL` accepts free text with no message. |
| 5 | **Manager Name becomes an inheritance assertion, not a validation case.** | TC-AGENCY-055 | FINDING-009 — the value is authored in the Supplier master and inherited read-only, so AC-9's *"Please enter a valid Manager Name."* is not an Agency requirement. |
| 6 | **Branch read-only gains its own case; Branch-change coverage is retired.** | TC-AGENCY-059 added; TC-AGENCY-052 retired | `PO-10`. Discovery observed the Branch control as `disabled` and `readOnly`. Re-inheritance-after-Branch-change is no longer a test target. |
| 7 | **Sales Contact inheritance is unblocked.** | TC-AGENCY-028 | It was deferred because verifying inheritance needed a created agency. `PO-14` and `PO-2` now require one. |
| 8 | **Payment options are selected by label, never by count.** | TC-AGENCY-036, 037 | FINDING-011 — the option count moved 28 → 29 between runs with no action by either. A count assertion would be flaky by construction. |
| 9 | **Three controls are designed against deliberately.** | none | `PO-13` puts `Transfer Pnr Option`, `Blue Command Screen` and `Enable Search Limit` out of scope. No case asserts their state, labels, or dependencies (FINDING-012). |

**Forty-one cases have `Review` reset to `Pending`.** Under §6.3.1 a material rewrite — any change to
Objective, Preconditions, Test Data, Steps or Expected Result — mandatorily withdraws a stale approval.
Every reset case records the fact and the reason in its own Notes. **No case was advanced to `Approved`
by this stage**, and no `Automation` value was altered in either direction.

> **Read this before executing.**
>
> **1. The record under test is created by the run, not borrowed.** Every mutating case operates on
> `{AGENCY_UNDER_TEST}` (§0.1). Agency 949 (`AGN2 — Test Egypt`) is **not** a valid target for any
> case in this suite. Twelve read-only cases may be executed against any agency and say so.
>
> **2. Expected results come from observed behaviour** wherever Project Context §1.1 disposes the story
> as outdated. Most visibly: **a cleared mandatory field renders `Required`** — capital `R`, no full
> stop — not the per-field messages US-4222 specifies (FINDING-001, disposition row 1, corroborated by
> PRD XC-17). run-004 measured 23 instances of it on an empty create form.
>
> **3. Three exact strings are confirmed** and are the only per-field messages known to exist:
>
> | Trigger | Exact string |
> |---|---|
> | Any mandatory field left empty | `Required` |
> | No supplier selected in Product Access | `Please select at least one supplier.` |
> | Malformed email | `Please enter a valid email` |
>
> **4. Cases that deliberately assert the *requirement* rather than observed behaviour** are the AC-3 /
> AC-4 upload cases and TC-AGENCY-058 (disposition row 5). Each says so in its Notes and **is expected
> to fail** — that failure is the finding.
>
> **5. Two cases remain genuinely blocked**, and must be recorded `Blocked`, never `Failed`:
> TC-AGENCY-056 and the two absent PCC fields it cannot reach (FINDING-008's open business question).
> TC-AGENCY-052 is retired, not blocked — it is out of scope by decision.

## 0.1 Fixtures

**The run builds its own records.** `PO-14` grants `CREATE` / `UPDATE` / `SUBMIT` / `APPROVE` on a
**self-created** Branch, recorded as `AUTH-BRANCH-*-SelfCreated` in the run's
`metadata/SafetyAuthorizations.json`. Nothing here authorizes touching a pre-existing record.

| Fixture | Definition | Why it must be this |
|---|---|---|
| `{BRANCH_UNDER_TEST}` | A Branch **created by this run**, submitted and approved by this run, carrying **at least one supplier with a supplier credential selected**. | The `Airline Supplier credential (PCC)` section renders only through inheritance from the parent Branch (FINDING-008, knowledge item `BR-006`). An Agency under a supplier-less Branch shows no PCC section, and a test would report a false absence. |
| `{AGENCY_UNDER_TEST}` | An Agency **created by this run** under `{BRANCH_UNDER_TEST}`, its identifier captured immediately and preserved in the execution evidence. | `PO-2` — mutation acts only on self-created records, and ownership must stay provable. |

**Build order:** `{BRANCH_UNDER_TEST}` → approve it → `{AGENCY_UNDER_TEST}`. Creating the Agency is
**in scope as a means only** (Project Context §2): a defect seen while creating it is reported as an
observation against `agency`, never as a US-4222 result.

**Retention.** `PO-3` accepts that these records remain on STG. Reuse one fixture across cases wherever
test independence and validity allow, record how many Agency records each execution created, and
**never attempt a DELETE**.

| Upload fixture | Purpose | Used by |
|---|---|---|
| `AgencyContract_Doc1_valid.pdf` | Valid PDF | TC-AGENCY-016 |
| `AgencyContract_Doc2_valid.pdf` | Second valid PDF | TC-AGENCY-017 |
| `AgencyContract_wrongformat.txt` | Non-PDF file | TC-AGENCY-019 |
| `AgencyContract_fake_extension.pdf` | `.pdf` name, non-PDF bytes | TC-AGENCY-020 |
| `AgencyLogo_valid.png` | Valid image, 0.27 MB | TC-AGENCY-022 |
| `AgencyLogo_oversize.png` | Valid PNG, 3.46 MB | TC-AGENCY-023 |
| `AgencyLogo_wrongformat.txt` | Non-image file | TC-AGENCY-024 |

`PO-4` requires these to be synthetic and free of any real, private or sensitive information. Their
committed location is still open — see the Coverage Report's Recommendations.

## Case Index

| Test Case ID | Title | Tier | Priority | Tags | Review | Automation |
|---|---|---|---|---|---|---|
| TC-AGENCY-001 | Update Agency Master fields successfully | Scenario | P1 | Scenario, Smoke | Approved | Approved |
| TC-AGENCY-002 | Mandatory Agency Master fields block submission when cleared | Atomic | P1 | Atomic, Negative-EmptyValues, Regression | Approved | Approved |
| TC-AGENCY-003 | Country is read-only and inherited from the Branch | Atomic | P2 | Atomic, Regression | Approved | Rejected |
| TC-AGENCY-004 | Post office box discards non-numeric input and caps at 8 characters | Atomic | P2 | Atomic, Negative-InvalidInputs, Negative-BoundaryValues | Rejected | Rejected |
| TC-AGENCY-005 | Agency name rejects characters outside letters, digits and underscore | Atomic | P3 | Atomic, Negative-InvalidInputs | Rejected | Rejected |
| TC-AGENCY-006 | Agency name rejects an over-length value | Atomic | P3 | Atomic, Negative-BoundaryValues | Rejected | Rejected |
| TC-AGENCY-007 | Agency name refuses injection-shaped input | Atomic | P2 | Atomic, Negative-SecurityInputs | Rejected | Pending |
| TC-AGENCY-008 | Phone No rejects an invalid phone number | Atomic | P2 | Atomic, Negative-InvalidInputs | Approved | Rejected |
| TC-AGENCY-009 | Company URL accepts free text with no format message | Atomic | P3 | Atomic, Negative-InvalidInputs, Exploratory | Rejected | Rejected |
| TC-AGENCY-010 | IATA Agency selection persists | Atomic | P3 | Atomic | Rejected | Rejected |
| TC-AGENCY-011 | Agency Business Type selection persists | Atomic | P3 | Atomic | Approved | Approved |
| TC-AGENCY-012 | Update Agency Owner Details successfully | Atomic | P1 | Atomic, Smoke | Approved | Approved |
| TC-AGENCY-013 | Mandatory Agency Owner fields block submission when cleared | Atomic | P1 | Atomic, Negative-EmptyValues | Approved | Rejected |
| TC-AGENCY-014 | Owner Email ID rejects an invalid email format | Atomic | P2 | Atomic, Negative-InvalidInputs | Approved | Rejected |
| TC-AGENCY-015 | Contact person rejects numeric input | Atomic | P3 | Atomic, Negative-InvalidInputs | Rejected | Rejected |
| TC-AGENCY-016 | Upload a valid PDF document with contract dates | Scenario | P1 | Scenario, Smoke | Approved | Approved |
| TC-AGENCY-017 | Upload multiple documents | Atomic | P2 | Atomic | Rejected | Rejected |
| TC-AGENCY-018 | Remove an uploaded document | Atomic | P2 | Atomic | Rejected | Rejected |
| TC-AGENCY-019 | Non-PDF document is rejected | Atomic | P1 | Atomic, Negative-InvalidInputs, Regression | Rejected | Rejected |
| TC-AGENCY-020 | File named .pdf with non-PDF content is rejected | Atomic | P1 | Atomic, Negative-SecurityInputs, Regression | Rejected | Rejected |
| TC-AGENCY-021 | Contract dates block submission when cleared | Atomic | P2 | Atomic, Negative-EmptyValues | Approved | Approved |
| TC-AGENCY-022 | Upload a valid agency logo | Atomic | P1 | Atomic, Smoke | Approved | Approved |
| TC-AGENCY-023 | Logo larger than 2 MB is rejected | Atomic | P1 | Atomic, Negative-BoundaryValues, Regression | Approved | Approved |
| TC-AGENCY-024 | Non-image file is rejected as a logo | Atomic | P2 | Atomic, Negative-InvalidInputs | Approved | Rejected |
| TC-AGENCY-025 | Update Wonder Travel Sales Contact successfully | Atomic | P2 | Atomic | Rejected | Rejected |
| TC-AGENCY-026 | Add a second sales contact | Atomic | P2 | Atomic | Rejected | Rejected |
| TC-AGENCY-027 | Mandatory Sales Contact fields block submission when cleared | Atomic | P2 | Atomic, Negative-EmptyValues | Rejected | Rejected |
| TC-AGENCY-028 | Sales Contact defaults inherit from the Branch contact person | Atomic | P3 | Atomic | Rejected | Rejected |
| TC-AGENCY-029 | Add a bank account | Atomic | P2 | Atomic | Rejected | Rejected |
| TC-AGENCY-030 | Add multiple bank accounts | Atomic | P3 | Atomic | Rejected | Rejected |
| TC-AGENCY-031 | Agency saves with all bank account fields empty | Atomic | P3 | Atomic | Rejected | Rejected |
| TC-AGENCY-032 | Account Number rejects non-numeric input | Atomic | P3 | Atomic, Negative-InvalidInputs | Rejected | Rejected |
| TC-AGENCY-033 | Update Payment Settings successfully | Scenario | P1 | Scenario, Smoke | Rejected | Rejected |
| TC-AGENCY-034 | Mandatory Payment Settings fields block submission when cleared | Atomic | P1 | Atomic, Negative-EmptyValues | Rejected | Rejected |
| TC-AGENCY-035 | Numeric Payment Settings fields discard non-numeric keystrokes | Atomic | P2 | Atomic, Negative-InvalidInputs | Rejected | Rejected |
| TC-AGENCY-036 | Select multiple payment options | Atomic | P2 | Atomic | Approved | Rejected |
| TC-AGENCY-037 | Payment option blocks submission when none is selected | Atomic | P2 | Atomic, Negative-EmptyValues | Approved | Approved |
| TC-AGENCY-038 | Set a target for a month and year | Atomic | P3 | Atomic | Rejected | Rejected |
| TC-AGENCY-039 | Credit agency selection persists | Atomic | P3 | Atomic | Approved | Rejected |
| TC-AGENCY-040 | Product Access is populated from the parent Branch | Atomic | P2 | Atomic | Rejected | Rejected |
| TC-AGENCY-041 | Change the selected products | Atomic | P2 | Atomic | Rejected | Rejected |
| TC-AGENCY-042 | Supplier Name and Product Name are read-only | Atomic | P3 | Atomic | Approved | Rejected |
| TC-AGENCY-043 | Airline Supplier credential (PCC) section renders with its three controls | Scenario | P1 | Scenario, Regression | Rejected | Rejected |
| TC-AGENCY-044 | Import PNR Option persists | Atomic | P2 | Atomic | Approved | Approved |
| TC-AGENCY-045 | Submit an agency update for approval | Scenario | P1 | Scenario, Smoke | Approved | Rejected |
| TC-AGENCY-046 | Remarks blocks submission when empty | Atomic | P2 | Atomic, Negative-EmptyValues | Approved | Rejected |
| TC-AGENCY-047 | Cancel discards unsaved changes | Atomic | P1 | Atomic, Regression | Approved | Approved |
| TC-AGENCY-048 | Approve a pending agency update | Atomic | P1 | Atomic | Approved | Approved |
| TC-AGENCY-049 | Reject a pending agency update with a reason | Atomic | P1 | Atomic | Rejected | Rejected |
| TC-AGENCY-050 | Agency update end to end: edit, submit, approve | E2E | P1 | E2E | Approved | Approved |
| TC-AGENCY-051 | Save an update without re-uploading the existing document and logo | Atomic | P2 | Atomic | Approved | Rejected |
| TC-AGENCY-052 | Changing Branch re-inherits dependent values | Atomic | P2 | Atomic, OutOfScope | Rejected | Rejected |
| TC-AGENCY-053 | Agency name accepts a space between words | Atomic | P1 | Atomic, Regression | Approved | Approved |
| TC-AGENCY-054 | PCC section is removed when the Product Access supplier is deselected | Atomic | P2 | Atomic, Regression | Rejected | Rejected |
| TC-AGENCY-055 | Manager Name shows the supplier's value and cannot be edited | Atomic | P2 | Atomic, Regression | Rejected | Rejected |
| TC-AGENCY-056 | Generic supplier credentials (PCC) blocks submission when cleared | Atomic | P2 | Atomic, Negative-EmptyValues | Approved | Rejected |
| TC-AGENCY-057 | Supplier Credentials Description change persists | Atomic | P3 | Atomic | Approved | Rejected |
| TC-AGENCY-058 | Credit limit shows the numeric format message for alphabetic input | Atomic | P2 | Atomic, Negative-InvalidInputs, Regression | Approved | Rejected |
| TC-AGENCY-059 | Branch is read-only on the Update form | Atomic | P2 | Atomic, Regression | Approved | Approved |
| TC-AGENCY-060 | One PCC tab renders per supplier inherited from the parent Branch | Atomic | P1 | Atomic, Regression | Approved | Rejected |

**Tier breakdown:** 54 Atomic · 5 Scenario · 1 E2E

**Lifecycle breakdown:** Review — 0 Pending · 33 Approved · 27 Rejected · Automation — 1 Pending · 18 Approved · 41 Rejected
11 Approved · 37 Rejected

**Eligibility right now:** 11 cases are eligible for Stage `4M` (`Review = Approved`); **3** are
eligible for Stage `4A` (`Review = Approved` **and** `Automation = Approved`) — TC-AGENCY-002, 021,
047. Eight cases carry `Automation = Approved` against a `Review` this revision reset to `Pending`;
those pairs are inconsistent under §6.3.4, are preserved exactly as recorded, and are listed for human
resolution in the Coverage Report §11.

## Test Cases

### TC-AGENCY-001 — Update Agency Master fields successfully

**Objective:** Verify that changes to the Agency Master section are accepted and persisted.

**Preconditions:** Logged in to NDC Admin as `odeysysadmin`. On the Update Agency form for `{AGENCY_UNDER_TEST}`.

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

**Notes:** `Remarks` is mandatory on the update form and must be filled for any submission to succeed. **Review reset to `Pending` on 2026-08-18** — the reviewer approved this case on 2026-08-02 against shared agency 949, which `PO-2` no longer permits; the record under test changed, so the approval no longer covers the text. No value restoration is needed on a self-created fixture.

**Review:** Approved

**Automation:** Approved

### TC-AGENCY-002 — Mandatory Agency Master fields block submission when cleared

**Objective:** Verify that each mandatory Agency Master field blocks submission when left empty.

**Preconditions:** On the Update Agency form for any agency. No value is saved by this case.

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

**Notes:** `Required` is the platform-wide message (FINDING-001, PRD XC-17) — capital `R`, no full stop, confirmed by run-004 across 23 instances. US-4222's per-field messages such as `"Please enter a valid Agency Name."` are outdated specification; a per-field message appearing instead is a **finding to report**, not a pass. Nothing is submitted, so this case is safe on any agency and its 2026-08-02 approval still stands.

**Review:** Approved

**Automation:** Approved

### TC-AGENCY-003 — Country is read-only and inherited from the Branch

**Objective:** Verify that Country cannot be edited directly on the Agency form.

**Preconditions:** On the Update Agency form for any agency. No value is saved by this case.

**Steps:**

1. Click into the `Country` field.
2. Attempt to type any character.

**Expected Result:** The field is not editable, retains the value inherited from the parent Branch, and is visibly greyed.

**Priority:** P2

**Tags:** Atomic, Regression

**Notes:** Confirmed by run-004 Discovery on record 949, where the field held `Egypt`. The expected result names the inherited value rather than a literal, so the case holds on any agency.

**Review:** Approved

**Automation:** Rejected

### TC-AGENCY-004 — Post office box discards non-numeric input and caps at 8 characters

**Objective:** Verify that Post office box keeps only numeric characters and enforces its 8-character limit.

**Preconditions:** On the Update Agency form for `{AGENCY_UNDER_TEST}`.

**Test Data:**

| Typed | Expected to remain |
|---|---|
| `ABC!@#` | nothing — the field keeps its previous value |
| `123456789012` | `12345678` |

**Steps:**

1. Clear the `Post office box` field.
2. Type `ABC!@#` using real keystrokes.
3. Observe the field.
4. Clear the field and type `123456789012` using real keystrokes.
5. Observe the field.

**Expected Result:** After step 2 the field holds no non-numeric character and no validation message is displayed. After step 4 the field holds exactly 8 digits.

**Priority:** P2

**Tags:** Atomic, Negative-InvalidInputs, Negative-BoundaryValues

**Notes:** **Rewritten 2026-08-18.** run-004 probed this field with real keystrokes and measured both behaviours: non-numeric characters never reach the control, and 12 typed characters were truncated to 8. The previous version left the outcome open between two possibilities; both are now settled, so the case asserts them. **Type — never assign a value in script.** A scripted assignment bypasses the keystroke filter and the case would prove nothing (knowledge item `R-1`, inherited from the `branch` module). **Review reset to `Pending`** — the reviewer rejected this case on 2026-08-02 because its expected result was indeterminate; that rejection triggered this rewrite, so per §6.3.1 the column is reset rather than left as a trapdoor.

**Review:** Rejected

**Automation:** Rejected

### TC-AGENCY-005 — Agency name rejects characters outside letters, digits and underscore

**Objective:** Verify that the agency name field rejects characters outside its allowed set.

**Preconditions:** On the Update Agency form for `{AGENCY_UNDER_TEST}`.

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

**Notes:** Designed to reviewer-reported behaviour: the field accepts letters, digits and underscore only. This **contradicts US-4222 AC-1**, which states "Special characters allowed". Disposition per Project Context §1.1 row 2 — the PRD is **silent** on this field's character rule, so the case follows observed behaviour and is labelled `Story Outdated / Requires Business Confirmation`; it is **not** treated as the application being wrong. **The rule itself is still unverified.** run-004 did not probe the character set — it deliberately skipped payload-shaped input on shared record 949 — so executing this case is what establishes it. Record which mechanism enforces the rule: keystroke filtering or submit-time validation. Every value here is space-free so the case tests one rule; the space is TC-AGENCY-053. **Review history:** rejected 2026-08-01 (the earlier version asserted the opposite rule), rewritten, then **reset to `Pending` again on 2026-08-18** when the record under test moved to a self-created fixture.

**Review:** Rejected

**Automation:** Rejected

### TC-AGENCY-006 — Agency name rejects an over-length value

**Objective:** Verify the agency name field's behaviour at an excessive length.

**Preconditions:** On the Update Agency form for `{AGENCY_UNDER_TEST}`.

**Test Data:** Agency: a single string of 300 `A` characters, entered with real keystrokes.

**Steps:**

1. Clear the `Agency` field.
2. Type the Test Data value.
3. Observe the field.
4. Enter a value in `Remarks`.
5. Click **Send For Approval**.

**Expected Result:** The value is either truncated at a defined maximum length or rejected with a validation message — the field does not accept 300 characters and store them unchanged.

**Priority:** P3

**Tags:** Atomic, Negative-BoundaryValues

**Notes:** No maximum length is stated in US-4222 or the Project Context, and run-004 did not probe this field. Record the observed limit; it is the input needed to write a precise boundary case later. Neighbouring fields do enforce caps — `Post office box` at 8 and `Credit Terms (Days)` at 11 — so a cap here is likely. **Type rather than paste**: run-004 showed caps on this form are enforced against keystrokes. **Review reset to `Pending`** — the record under test moved to a self-created fixture, and step 2 changed from paste to typing.

**Review:** Rejected

**Automation:** Rejected

### TC-AGENCY-007 — Agency name refuses injection-shaped input

**Objective:** Verify that markup- and SQL-shaped input never reaches the agency record.

**Preconditions:** On the Update Agency form for `{AGENCY_UNDER_TEST}`.

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

**Notes:** Every character that makes this payload dangerous — `<` `>` `/` `'` and the spaces — is outside the reported allowed set, so the payload should never be stored at all. **If the value IS accepted, that is a finding twice over:** it contradicts the reported character rule *and* it means the field stores markup. **Input-handling probe only — never an attempt to exploit.** run-004 explicitly deferred payload probes to a self-created record rather than run them against shared agency 949; this fixture is that record, which is why the case is now executable as designed. **Review reset to `Pending`** — the record under test changed.

**Review:** Rejected

**Automation:** Pending

### TC-AGENCY-008 — Phone No rejects an invalid phone number

**Objective:** Verify that the Agency Master phone field rejects a malformed number.

**Preconditions:** On the Update Agency form for any agency. No value is saved by this case.

**Test Data:** Phone No: `12`

**Steps:**

1. Clear the `Phone No` field.
2. Type the Test Data value.
3. Move focus out of the field.

**Expected Result:** A validation message is displayed and the form cannot be submitted with this value.

**Priority:** P2

**Tags:** Atomic, Negative-InvalidInputs

**Notes:** The field carries a country selector (Egypt by default) and holds a national number only. Record the exact message text. run-004 established what this field does with *alphabetic* input — the characters are discarded and the field then reports `Required` — but did not probe a too-short number, so this case is still the one that establishes it. Nothing is submitted, so the 2026-08-02 approval still stands.

**Review:** Approved

**Automation:** Rejected

### TC-AGENCY-009 — Company URL accepts free text with no format message

**Objective:** Verify what Company URL does with a value that is not a URL, and have the reviewer confirm whether that behaviour is intended.

**Preconditions:** On the Update Agency form for `{AGENCY_UNDER_TEST}`.

**Test Data:** Company URL: `not a url at all`

**Steps:**

1. Clear the `Company URL` field.
2. Type the Test Data value.
3. Move focus out of the field.
4. Enter a value in `Remarks`.
5. Click **Send For Approval**.
6. Reopen the same agency.

**Expected Result:** The value is accepted, no validation message is displayed, and the agency stores it unchanged. **Confirm with the reviewer whether Company URL is meant to validate URL format at all.**

**Priority:** P3

**Tags:** Atomic, Negative-InvalidInputs, Exploratory

**Notes:** **Rewritten 2026-08-18 as an exploratory case (FINDING-010, URL half).** run-004 typed `not a url at all` into this field and it was accepted with no message; shared agency 949 already stores `asdas`. US-4222 AC-1 specifies `"Please enter a valid URL."` and **the PRD is silent**, which is Project Context §1.1 row 2 — design to observed behaviour, and mark the expected result as resting on that directive rather than on a requirement. This case therefore asserts what the application does and asks the reviewer to settle whether it should. It is deliberately **not** designed to the story's rule: doing so would report a failure against a criterion no second source supports. Contrast TC-AGENCY-058, where the PRD *does* corroborate the story and the case is designed to the requirement instead. **Review reset to `Pending`** — the previous version asserted the opposite outcome and was rejected on 2026-08-02.

**Review:** Rejected

**Automation:** Rejected

### TC-AGENCY-010 — IATA Agency selection persists

**Objective:** Verify that the IATA Agency choice is saved.

**Preconditions:** On the Update Agency form for `{AGENCY_UNDER_TEST}`.

**Steps:**

1. Record the current `IATA Agency` selection.
2. Select the opposite value (`yes` or `No`).
3. Enter a value in `Remarks`.
4. Click **Send For Approval**.
5. Reopen the same agency.

**Expected Result:** The `IATA Agency` selection shows the value chosen in step 2.

**Priority:** P3

**Tags:** Atomic

**Notes:** **Review reset to `Pending`** — the record under test moved to a self-created fixture. The reviewer's 2026-08-02 rejection was recorded against a case that mutated shared agency 949; that objection may no longer apply, which is exactly why the column is reset rather than left as a trapdoor (§6.3.1).

**Review:** Rejected

**Automation:** Rejected

### TC-AGENCY-011 — Agency Business Type selection persists

**Objective:** Verify that the Agency Business Type choice is saved.

**Preconditions:** On the Update Agency form for `{AGENCY_UNDER_TEST}`.

**Steps:**

1. Record the current `Agency Business Type` selection.
2. Select the opposite value (`B2B` or `Freelancer`).
3. Enter a value in `Remarks`.
4. Click **Send For Approval**.
5. Reopen the same agency.

**Expected Result:** The `Agency Business Type` selection shows the value chosen in step 2.

**Priority:** P3

**Tags:** Atomic

**Notes:** The field is not described in US-4222 — later functionality (FINDING-005, re-confirmed by run-004, disposition row 2). This case verifies persistence only; the business meaning of each value is unconfirmed, so do not judge whether the *right* value is set. **Review reset to `Pending`** — the record under test changed.

**Review:** Approved

**Automation:** Approved

### TC-AGENCY-012 — Update Agency Owner Details successfully

**Objective:** Verify that changes to the Agency Owner Details section are accepted and persisted.

**Preconditions:** On the Update Agency form for `{AGENCY_UNDER_TEST}`.

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

**Notes:** `Email ID` is capped at 49 characters (run-004). **Review reset to `Pending`** — the record under test changed.

**Review:** Approved

**Automation:** Approved

### TC-AGENCY-013 — Mandatory Agency Owner fields block submission when cleared

**Objective:** Verify that each mandatory Agency Owner Details field blocks submission when left empty.

**Preconditions:** On the Update Agency form for any agency. No value is saved by this case.

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

**Notes:** run-004 confirmed all three fields are mandatory on the live form. Nothing is submitted, so the 2026-08-02 approval still stands.

**Review:** Approved

**Automation:** Rejected

### TC-AGENCY-014 — Owner Email ID rejects an invalid email format

**Objective:** Verify that the Agency Owner email field rejects a malformed address.

**Preconditions:** On the Update Agency form for any agency. No value is saved by this case.

**Test Data:** Email ID: `qa.owner@@example`

**Steps:**

1. Clear the Agency Owner `Email ID` field.
2. Type the Test Data value.
3. Move focus out of the field.

**Expected Result:** The message `Please enter a valid email` is displayed and the form cannot be submitted with this value.

**Priority:** P2

**Tags:** Atomic, Negative-InvalidInputs

**Notes:** run-004 captured this exact string from the live form, and it matches PRD XC-18 `[V]` and US-4222's own wording for this field. It is the **only** per-field format message confirmed to exist anywhere on the Agency forms — every other mandatory violation renders `Required`. Naming the exact string is a precision improvement over the previous "record the exact message text", not a change to what is verified, so the 2026-08-02 approval still stands.

**Review:** Approved

**Automation:** Rejected

### TC-AGENCY-015 — Contact person rejects numeric input

**Objective:** Verify that the Contact person field accepts characters only.

**Preconditions:** On the Update Agency form for `{AGENCY_UNDER_TEST}`.

**Test Data:** Contact person: `12345`

**Steps:**

1. Clear the `Contact person` field.
2. Type the Test Data value.
3. Enter a value in `Remarks`.
4. Click **Send For Approval**.

**Expected Result:** A validation message is displayed and the form cannot be submitted with this value.

**Priority:** P3

**Tags:** Atomic, Negative-InvalidInputs

**Notes:** Designed to AC-2's "Only Characters validation" rule, which no source has superseded. If the value is accepted, that is a finding to report. run-004 did not probe this field. **Review reset to `Pending`** — the record under test changed.

**Review:** Rejected

**Automation:** Rejected

### TC-AGENCY-016 — Upload a valid PDF document with contract dates

**Objective:** Verify that a PDF document can be uploaded with its contract start and end dates.

**Preconditions:** On the Update Agency form for `{AGENCY_UNDER_TEST}`. Upload fixtures available (§0.1).

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

**Notes:** Dates use `dd/mm/yyyy`, as observed on this form. **Review reset to `Pending`** — the record under test changed.

**Review:** Approved

**Automation:** Approved

### TC-AGENCY-017 — Upload multiple documents

**Objective:** Verify that more than one document can be attached to an agency.

**Preconditions:** On the Update Agency form for `{AGENCY_UNDER_TEST}`, with at least one document already uploaded.

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

**Notes:** AC-3 requires multiple documents. The `Add` button is the mechanism run-004 confirmed present; the file inputs are single-select. **Review reset to `Pending`** — the record under test changed.

**Review:** Rejected

**Automation:** Rejected

### TC-AGENCY-018 — Remove an uploaded document

**Objective:** Verify that an uploaded document can be removed from an agency.

**Preconditions:** On the Update Agency form for `{AGENCY_UNDER_TEST}`, with at least two documents uploaded.

**Steps:**

1. Remove the second document row.
2. Enter a value in `Remarks`.
3. Click **Send For Approval**.
4. Reopen the same agency.

**Expected Result:** The removed document's file name is no longer displayed; the remaining document is unchanged.

**Priority:** P2

**Tags:** Atomic

**Notes:** AC-3 requires the user be able to remove or update documents. run-004 confirmed a remove (×) control exists on an attached document, so the affordance is no longer in doubt — the case now verifies that using it works. **Review reset to `Pending`** — the record under test changed.

**Review:** Rejected

**Automation:** Rejected

### TC-AGENCY-019 — Non-PDF document is rejected

**Objective:** Verify that a non-PDF file cannot be uploaded as an agency document.

**Preconditions:** On the Update Agency form for `{AGENCY_UNDER_TEST}`. Upload fixtures available (§0.1).

**Test Data:** Document: `AgencyContract_wrongformat.txt`

**Steps:**

1. Click **Upload document**.
2. Select the `.txt` fixture.
3. Enter a value in `Remarks`.
4. Click **Send For Approval**.

**Expected Result:** The file is rejected and a validation message about the file format is displayed; the agency is not saved with the `.txt` file attached.

**Priority:** P1

**Tags:** Atomic, Negative-InvalidInputs, Regression

**Notes:** **Designed to the requirement, not to observed behaviour** (FINDING-004, disposition row 5). **This case is expected to fail, and that failure is the finding.** run-004 re-confirmed the document input declares **no `accept` attribute** while the logo input declares `accept="image/*"` — the restriction exists on one input and not the other, on the same form. US-4222 specifies the message `"Please Upload a valid file format."`; record the actual text. **Review reset to `Pending`** — the record under test changed. The reviewer rejected this case on 2026-08-02; the rejection is preserved here and the reset lets it be re-decided against a fixture where a wrongly-attached file harms nobody else's record.

**Review:** Rejected

**Automation:** Rejected

### TC-AGENCY-020 — File named .pdf with non-PDF content is rejected

**Objective:** Verify whether document format validation inspects file content or only the file name.

**Preconditions:** On the Update Agency form for `{AGENCY_UNDER_TEST}`. Upload fixtures available (§0.1).

**Test Data:** Document: `AgencyContract_fake_extension.pdf` — a `.pdf` filename whose bytes are plain text with no `%PDF` header.

**Steps:**

1. Click **Upload document**.
2. Select the fixture.
3. Enter a value in `Remarks`.
4. Click **Send For Approval**.

**Expected Result:** The file is rejected and a validation message about the file format is displayed.

**Priority:** P1

**Tags:** Atomic, Negative-SecurityInputs, Regression

**Notes:** Run this immediately after TC-AGENCY-019 and compare. If TC-AGENCY-019 rejects the `.txt` and this case accepts the fake `.pdf`, validation is by file name only — report that regardless of what AC-3 says, since it is materially weaker than a real format check. With no `accept` attribute on the input at all (run-004), the likeliest outcome is that **both** files are accepted; record which. **Review reset to `Pending`** — the record under test changed.

**Review:** Rejected

**Automation:** Rejected

### TC-AGENCY-021 — Contract dates block submission when cleared

**Objective:** Verify that both contract dates are mandatory for an uploaded document.

**Preconditions:** On the Update Agency form for any agency with a document uploaded. No value is saved by this case.

**Steps:**

1. Clear the `Contract Start Date` field.
2. Move focus out of the field.
3. Observe the field.
4. Restore the original date.
5. Repeat steps 1–4 for `Contract End Date`.

**Expected Result:** For each field, a red border appears and the message `Required` is displayed beneath it.

**Priority:** P2

**Tags:** Atomic, Negative-EmptyValues

**Notes:** Nothing is submitted, so the 2026-08-02 approval still stands.

**Review:** Approved

**Automation:** Approved

### TC-AGENCY-022 — Upload a valid agency logo

**Objective:** Verify that an image within the size limit can be uploaded as the agency logo.

**Preconditions:** On the Update Agency form for `{AGENCY_UNDER_TEST}`. Upload fixtures available (§0.1).

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

**Notes:** AC-4 requires the logo be displayed for review before final submission — step 3 is that check. run-004 confirmed a stored logo renders as a preview. **Review reset to `Pending`** — the record under test changed.

**Review:** Approved

**Automation:** Approved

### TC-AGENCY-023 — Logo larger than 2 MB is rejected

**Objective:** Verify that the agency logo size limit is enforced.

**Preconditions:** On the Update Agency form for `{AGENCY_UNDER_TEST}`. Upload fixtures available (§0.1).

**Test Data:** Logo: `AgencyLogo_oversize.png` (3.46 MB, a structurally valid PNG)

**Steps:**

1. Click **Upload logo**.
2. Select the oversize fixture.
3. Enter a value in `Remarks`.
4. Click **Send For Approval**.

**Expected Result:** The file is rejected and a validation message is displayed; the agency is not saved with the oversize image.

**Priority:** P1

**Tags:** Atomic, Negative-BoundaryValues, Regression

**Notes:** The fixture is a genuine, uncorrupted PNG made incompressible on purpose, so a rejection can only be about size. The 2 MB limit comes from US-4222 and PRD §10 records it as story-sourced and never verified by automation (Project Context ASM-009) — if a different threshold is enforced, record the observed one. **Review reset to `Pending`** — the record under test changed.

**Review:** Approved

**Automation:** Approved

### TC-AGENCY-024 — Non-image file is rejected as a logo

**Objective:** Verify that a non-image file cannot be uploaded as the agency logo.

**Preconditions:** On the Update Agency form for any agency. Upload fixtures available (§0.1). No value is saved by this case.

**Test Data:** Logo: `AgencyLogo_wrongformat.txt`

**Steps:**

1. Click **Upload logo**.
2. Attempt to select the `.txt` fixture.

**Expected Result:** The file cannot be selected, or is rejected with a validation message.

**Priority:** P2

**Tags:** Atomic, Negative-InvalidInputs

**Notes:** The logo input declares `accept="image/*"` (re-confirmed by run-004), so the file picker will most likely filter the `.txt` out before it can be chosen. That counts as a pass — record which of the two behaviours occurs. Nothing is submitted, so the 2026-08-02 approval still stands.

**Review:** Approved

**Automation:** Rejected

### TC-AGENCY-025 — Update Wonder Travel Sales Contact successfully

**Objective:** Verify that changes to the Sales Contact section are accepted and persisted.

**Preconditions:** On the Update Agency form for `{AGENCY_UNDER_TEST}`.

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

**Notes:** **Review reset to `Pending`** — the record under test changed. The reviewer's 2026-08-02 rejection was against a case that mutated shared agency 949.

**Review:** Rejected

**Automation:** Rejected

### TC-AGENCY-026 — Add a second sales contact

**Objective:** Verify that more than one sales contact can be recorded against an agency.

**Preconditions:** On the Update Agency form for `{AGENCY_UNDER_TEST}`.

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

**Notes:** Step 3 settles an open question at no extra cost: AC-5 specifies an optional `Designation` dropdown that run-001 and run-004 both found absent from the first row on both forms (FINDING-006). An added row is the only remaining place it could exist. Record whether it appears. **Review reset to `Pending`** — the record under test changed.

**Review:** Rejected

**Automation:** Rejected

### TC-AGENCY-027 — Mandatory Sales Contact fields block submission when cleared

**Objective:** Verify that each mandatory Sales Contact field blocks submission when left empty.

**Preconditions:** On the Update Agency form for any agency. No value is saved by this case.

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

**Notes:** run-004 observed all three fields carrying a mandatory marker (`Name *`, `Email ID *`, `Phone Number *`), which resolves run-001's doubt that only `Name` was marked. AC-5 marks all three mandatory and the form now agrees. Nothing is submitted, so the 2026-08-02 approval still stands.

**Review:** Rejected

**Automation:** Rejected

### TC-AGENCY-028 — Sales Contact defaults inherit from the Branch contact person

**Objective:** Verify that Sales Contact fields are pre-populated from the parent Branch's contact person.

**Preconditions:** `{AGENCY_UNDER_TEST}` newly created under `{BRANCH_UNDER_TEST}`, with the Branch's contact person details recorded and the Agency's Sales Contact never edited.

**Steps:**

1. Record the contact person name, email and phone on `{BRANCH_UNDER_TEST}`.
2. Open `{AGENCY_UNDER_TEST}` and scroll to Wonder Travel Sales Contact.
3. Compare the three Sales Contact values against the values recorded in step 1.

**Expected Result:** The Sales Contact name, email, and phone match the parent Branch's contact person.

**Priority:** P3

**Tags:** Atomic

**Notes:** **Unblocked 2026-08-18.** This case was deferred because verifying inheritance needed either a created agency or a Branch change on a shared record. `PO-14` grants the run its own Branch and `PO-2` requires a self-created Agency, so the clean path now exists and is mandatory rather than optional. Run this **before** TC-AGENCY-025, which overwrites the inherited values. **Review reset to `Pending`** — the case was rejected on 2026-08-02 as unexecutable and has been rewritten to be executable, so per §6.3.1 the column resets rather than permanently excluding a case that has since been fixed.

**Review:** Rejected

**Automation:** Rejected

### TC-AGENCY-029 — Add a bank account

**Objective:** Verify that bank account details can be recorded against an agency.

**Preconditions:** On the Update Agency form for `{AGENCY_UNDER_TEST}`.

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

**Notes:** `Account Number` is capped at 20 characters and `Bank name` at 49 (run-004). **Review reset to `Pending`** — the record under test changed, and the previous version's cleanup step is no longer needed.

**Review:** Rejected

**Automation:** Rejected

### TC-AGENCY-030 — Add multiple bank accounts

**Objective:** Verify that more than one bank account can be recorded against an agency.

**Preconditions:** On the Update Agency form for `{AGENCY_UNDER_TEST}`, with one bank account already entered.

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

**Notes:** **Review reset to `Pending`** — the record under test changed.

**Review:** Rejected

**Automation:** Rejected

### TC-AGENCY-031 — Agency saves with all bank account fields empty

**Objective:** Verify that the Bank Account Details section is optional.

**Preconditions:** On the Update Agency form for `{AGENCY_UNDER_TEST}`, with every bank account field empty.

**Steps:**

1. Confirm all Bank Account Details fields are empty.
2. Enter a value in `Remarks`.
3. Click **Send For Approval**.

**Expected Result:** The agency is submitted successfully with no validation message against any Bank Account Details field.

**Priority:** P3

**Tags:** Atomic

**Notes:** AC-6 marks all three fields Optional, and run-004 confirmed the form marks none of them mandatory. Run this **before** TC-AGENCY-029, which fills them. **Review reset to `Pending`** — the record under test changed.

**Review:** Rejected

**Automation:** Rejected

### TC-AGENCY-032 — Account Number rejects non-numeric input

**Objective:** Verify that Account Number accepts numeric input only.

**Preconditions:** On the Update Agency form for any agency. No value is saved by this case.

**Test Data:** Account Number: `ABCDEF`

**Steps:**

1. Type the Test Data value in `Account Number`.
2. Move focus out of the field.

**Expected Result:** The non-numeric characters are either not accepted into the field, or a validation message is displayed.

**Priority:** P3

**Tags:** Atomic, Negative-InvalidInputs

**Notes:** Nothing is submitted, so the reviewer's 2026-08-02 rejection stands unaltered — this stage did not rewrite the case and therefore may not reset the column.

**Review:** Rejected

**Automation:** Rejected

### TC-AGENCY-033 — Update Payment Settings successfully

**Objective:** Verify that changes to the Payment Settings section are accepted and persisted.

**Preconditions:** On the Update Agency form for `{AGENCY_UNDER_TEST}`.

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

**Notes:** `Outstanding Threshold` is a later enhancement not described in US-4222 and is mandatory (FINDING-005; settled as expected functionality by the product owner, disposition row 4). Its valid range is unconfirmed — `10` is chosen against an observed value of `5`; if it is rejected, record the constraint rather than treating it as a defect. `Credit Terms (Days)` is capped at 11 characters (run-004). **Review reset to `Pending`** — the record under test changed, which also removes the previous version's warning about live commercial settings.

**Review:** Rejected

**Automation:** Rejected

### TC-AGENCY-034 — Mandatory Payment Settings fields block submission when cleared

**Objective:** Verify that each mandatory Payment Settings field blocks submission when left empty.

**Preconditions:** On the Update Agency form for any agency. No value is saved by this case.

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

**Notes:** `Outstanding Threshold` is included because the application marks it mandatory, though US-4222 does not mention it. Nothing is submitted, so the 2026-08-02 approval still stands.

**Review:** Rejected

**Automation:** Rejected

### TC-AGENCY-035 — Numeric Payment Settings fields discard non-numeric keystrokes

**Objective:** Verify that the numeric Payment Settings fields keep no non-numeric character.

**Preconditions:** On the Update Agency form for `{AGENCY_UNDER_TEST}`.

**Test Data:** `ABC` typed, one field at a time, into `Credit limit`, `Top up limit`, `Target`, `Reaching Percentage`, `Warning Prompt (Days)`.

**Steps:**

1. Type `ABC` into `Credit limit` using real keystrokes.
2. Observe the field and the area beneath it.
3. Restore the original value.
4. Repeat steps 1–3 for `Top up limit`, `Target`, `Reaching Percentage`, and `Warning Prompt (Days)`.

**Expected Result:** For each field, no typed letter appears in the field and the field's previous value is left in place.

**Priority:** P2

**Tags:** Atomic, Negative-InvalidInputs

**Notes:** **Rewritten 2026-08-18 (FINDING-010, numeric half).** run-004 typed `abcdef` into `Credit limit *` and the field re-displayed `1000000` — the previous value — with **no message**. The likely mechanism is a keystroke filter that drops disallowed characters before they reach the form control, so the control never enters an invalid state. This case asserts the **masking**, which is observed fact. Whether a message *should* also appear is a separate question, and it is TC-AGENCY-058's — the two cases are deliberately split so a failure is unambiguous about which half failed. **Type — never assign a value in script**, or the filter is bypassed and the case proves nothing. **Review reset to `Pending`** — the expected result changed from an open either/or to a definite assertion.

**Review:** Rejected

**Automation:** Rejected

### TC-AGENCY-036 — Select multiple payment options

**Objective:** Verify that more than one payment option can be selected for an agency.

**Preconditions:** On the Update Agency form for `{AGENCY_UNDER_TEST}`.

**Test Data:** Payment options: `Cash`, `Wallet`, `Credit Card`

**Steps:**

1. Record the currently selected payment options.
2. Select `Cash`, `Wallet`, and `Credit Card` by label, deselecting any others.
3. Enter a value in `Remarks`.
4. Click **Send For Approval**.
5. Reopen the same agency.

**Expected Result:** `Cash`, `Wallet`, and `Credit Card` are selected, and no other option is.

**Priority:** P2

**Tags:** Atomic

**Notes:** **Select by label only — never by index, and never assert the option count** (FINDING-011). The count moved from 28 to 29 between run-001 and run-004 with no action by either run, which is direct evidence the list is live shared master data; a count or index assertion would be flaky by construction. 24 of the options are meaningless entries such as `Edgardo`, `Filomena`, `m` and `f`; use only the real instruments. The authoritative set is Master → Payment Gateway → Payment Method's Active entries (`APP-002`), which belongs to the `payment-gateway` module. **Review reset to `Pending`** — the record under test changed and step 2 now specifies selection by label.

**Review:** Approved

**Automation:** Rejected

### TC-AGENCY-037 — Payment option blocks submission when none is selected

**Objective:** Verify that at least one payment option must be selected.

**Preconditions:** On the Update Agency form for `{AGENCY_UNDER_TEST}`.

**Steps:**

1. Record the currently selected payment options.
2. Deselect every payment option.
3. Enter a value in `Remarks`.
4. Click **Send For Approval**.

**Expected Result:** A validation message is displayed against the `Payment option` group and the agency is not submitted.

**Priority:** P2

**Tags:** Atomic, Negative-EmptyValues

**Notes:** The application marks `Payment option *` mandatory. run-004 captured `Required` for every empty mandatory field it measured, so that is the likeliest string here — but this specific group was not among the 23 measured instances, so the expected result names the behaviour rather than asserting an unverified literal. Record the exact text. Do not confuse it with `Please select at least one supplier.`, which belongs to Product Access. **Review reset to `Pending`** — the record under test changed.

**Review:** Approved

**Automation:** Approved

### TC-AGENCY-038 — Set a target for a month and year

**Objective:** Verify that a target can be recorded against a month and year.

**Preconditions:** On the Update Agency form for `{AGENCY_UNDER_TEST}`.

**Test Data:** Target: `100000`, Month: any value, Year: any value

**Steps:**

1. Enter the target value.
2. Select a month.
3. Select a year.
4. Click **Set target**.

**Expected Result:** The target is added and displayed against the selected month and year.

**Priority:** P3

**Tags:** Atomic

**Notes:** US-4222 names these fields `Set Month` and `Set Year`; the form labels them `Month` and `Year`. `Target` is capped at 15 characters (run-004). **Review reset to `Pending`** — the record under test changed. Whether `Set target` persists immediately or only on submission is unconfirmed; record which.

**Review:** Rejected

**Automation:** Rejected

### TC-AGENCY-039 — Credit agency selection persists

**Objective:** Verify that the Credit agency checkbox is saved.

**Preconditions:** On the Update Agency form for `{AGENCY_UNDER_TEST}`.

**Steps:**

1. Record the current `Credit agency` state.
2. Toggle it.
3. Enter a value in `Remarks`.
4. Click **Send For Approval**.
5. Reopen the same agency.

**Expected Result:** The `Credit agency` checkbox shows the state set in step 2.

**Priority:** P3

**Tags:** Atomic

**Notes:** **Review reset to `Pending`** — the record under test changed.

**Review:** Approved

**Automation:** Rejected

### TC-AGENCY-040 — Product Access is populated from the parent Branch

**Objective:** Verify that the Product Access table shows the suppliers and credentials inherited from the agency's Branch.

**Preconditions:** `{AGENCY_UNDER_TEST}` sits under `{BRANCH_UNDER_TEST}`, which carries at least one supplier with a credential selected.

**Steps:**

1. Record the suppliers and credentials configured on `{BRANCH_UNDER_TEST}`.
2. Open `{AGENCY_UNDER_TEST}` and scroll to Product Access Details.
3. Read the table rows and the `Select Product` checkboxes.

**Expected Result:** The table lists one row per supplier recorded in step 1, with `SUPPLIER NAME`, `CREDENTIAL NAME` and `PRODUCT NAME` populated, under the five columns `STATUS · SUPPLIER NAME · CREDENTIAL NAME · PRODUCT NAME · DESCRIPTION`.

**Priority:** P2

**Tags:** Atomic

**Notes:** **Rewritten 2026-08-18.** `PO-8` confirmed the section is a five-column table, not the flat field list AC-8's layout implies, and run-004 observed the exact column headings. Two changes matter: the case now names the columns, and it **must run on the self-created fixture** — on shared agency 949 the `CREDENTIAL NAME` cell is empty, so the previous version's expected result would have failed there for reasons that have nothing to do with the requirement. Step 1 makes the parent Branch the reference; whether the Branch's own data is correct remains the `branch` module's concern. **Review reset to `Pending`** — the record under test and the expected result both changed.

**Review:** Rejected

**Automation:** Rejected

### TC-AGENCY-041 — Change the selected products

**Objective:** Verify that the product selection can be changed and saved.

**Preconditions:** On the Update Agency form for `{AGENCY_UNDER_TEST}`.

**Steps:**

1. Record the current `Select Product` selections.
2. Deselect one product.
3. Enter a value in `Remarks`.
4. Click **Send For Approval**.
5. Reopen the same agency.

**Expected Result:** The product deselected in step 2 is no longer selected.

**Priority:** P2

**Tags:** Atomic

**Notes:** The products observed are `Flight` and `Others`. **Do not deselect the supplier row** while running this case — that removes the PCC section entirely (TC-AGENCY-054), which would confuse this result with a different behaviour. **Review reset to `Pending`** — the record under test changed.

**Review:** Rejected

**Automation:** Rejected

### TC-AGENCY-042 — Supplier Name and Product Name are read-only

**Objective:** Verify that the inherited columns in the Product Access table cannot be edited.

**Preconditions:** On the Update Agency form for any agency with at least one Product Access row. No value is saved by this case.

**Steps:**

1. Attempt to edit the `SUPPLIER NAME` value on the first Product Access row.
2. Attempt to edit the `PRODUCT NAME` value on the same row.

**Expected Result:** Neither value can be changed.

**Priority:** P3

**Tags:** Atomic

**Notes:** AC-8 marks both fields Read Only. run-004 observed `DESCRIPTION` to be an editable in-cell text input on the same row, so the read-only property is per-column, not per-table — do not generalise a pass here to the whole row. Nothing is submitted, so the 2026-08-02 approval still stands.

**Review:** Approved

**Automation:** Rejected

### TC-AGENCY-043 — Airline Supplier credential (PCC) section renders with its three controls

**Objective:** Verify that the Airline Supplier credential (PCC) section is present and carries its three controls for the selected supplier.

**Preconditions:** On the Update Agency form for `{AGENCY_UNDER_TEST}`, with its Product Access supplier row selected.

**Steps:**

1. Scroll to the `Airline Supplier credential (PCC)` section.
2. Read the supplier tab heading.
3. Confirm the presence of `Generic supplier credentials (PCC)`, `Manager Name`, and `Supplier Credentials Description`.

**Expected Result:** The section is present. It shows a tab named for the inherited supplier, and beneath it the three controls `Generic supplier credentials (PCC) *`, `Manager Name *`, and `Supplier Credentials Description *`.

**Priority:** P1

**Tags:** Scenario, Regression

**Notes:** **Rewritten 2026-08-18 and unblocked (FINDING-008).** run-001 recorded this whole section as absent and the case was `Blocked` pending a business decision. A controlled experiment on 2026-08-18 **contradicted that**: the section is present, and AC-9's three "filters" are the supplier tabs themselves — one tab per inherited supplier. Three of AC-9's named fields exist under near-identical names, which is why this case now asserts them.
>
> **Two of AC-9's fields genuinely do not exist** and are deliberately **not** asserted here: `Search Supplier Credential PCC` (which the story marks Mandatory) and `Ticketing Supplier Credentials PCC`. They were searched for by page text across five supplier tabs on two Branches and two Agencies and appear in none. They are recorded as a requirement gap awaiting business confirmation — neither designed against nor silently dropped. See the Coverage Report's Coverage Gaps.
>
> **Review reset to `Pending`** — this is the most changed case in the suite. Its 2026-08-02 rejection was correct against text asserting five fields and three filters that do not exist in that form.

**Review:** Rejected

**Automation:** Rejected

### TC-AGENCY-044 — Import PNR Option persists

**Objective:** Verify that the Import PNR Option setting is saved.

**Preconditions:** On the Update Agency form for `{AGENCY_UNDER_TEST}`.

**Steps:**

1. Record the current `Import PNR Option` state in the Agency Features section.
2. Toggle it.
3. Enter a value in `Remarks`.
4. Click **Send For Approval**.
5. Reopen the same agency.

**Expected Result:** The `Import PNR Option` shows the state set in step 2.

**Priority:** P2

**Tags:** Atomic

**Notes:** US-4222 calls this a toggle; the application renders a checkbox. This case verifies persistence on the agency record only — the downstream refusal (`"Selected Organization does not support import pnr functionality"`, PRD IPN-05) belongs to the `import-pnr` module. **Do not touch `Transfer Pnr Option` or `Blue Command Screen`**, the two neighbouring checkboxes: `PO-13` puts both out of scope, and `Blue Command Screen` is disabled in any case. **Review reset to `Pending`** — the record under test changed.

**Review:** Approved

**Automation:** Approved

### TC-AGENCY-045 — Submit an agency update for approval

**Objective:** Verify that submitting an agency update places it in a pending-approval state rather than publishing it.

**Preconditions:** On the Update Agency form for `{AGENCY_UNDER_TEST}`, in an approved state.

**Test Data:** Agency: `QA_AGENCY_SUBMIT`, Remarks: `US-4222 submit test`

**Steps:**

1. Record the current agency name.
2. Enter the Test Data agency name.
3. Enter the Test Data remarks.
4. Click **Send For Approval**.
5. Open the Agency list and locate the agency.

**Expected Result:** A success confirmation is shown and the agency's Approval Status reads `Pending for approval`.

**Priority:** P1

**Tags:** Scenario, Smoke

**Notes:** US-4222 names this action `Submit for Approval`; the button reads `Send For Approval` — confirmed twice, by run-001 and again by run-004. The literal status string `Pending for approval` comes from PRD §9.2 and XC-01 `[V]`; no run has yet observed it, because every agency in the list was `Active`/`Approved`. Record the exact status text. This case is the precondition for TC-AGENCY-048 and 049. **Review reset to `Pending`** — the record under test changed.

**Review:** Approved

**Automation:** Rejected

### TC-AGENCY-046 — Remarks blocks submission when empty

**Objective:** Verify that Remarks must be provided before an agency update can be submitted.

**Preconditions:** On the Update Agency form for `{AGENCY_UNDER_TEST}`.

**Steps:**

1. Make any valid change to one field.
2. Leave the `Remarks` field empty.
3. Click **Send For Approval**.

**Expected Result:** A validation message is displayed against `Remarks` and the agency is not submitted.

**Priority:** P2

**Tags:** Atomic, Negative-EmptyValues

**Notes:** `Remarks` is not described in US-4222. run-004 re-confirmed it is mandatory on the update form and absent from the create form — consistent with PRD XC-03, which requires a free-text remark as the audit reason for approval actions (FINDING-005). **Review reset to `Pending`** — the record under test changed.

**Review:** Approved

**Automation:** Rejected

### TC-AGENCY-047 — Cancel discards unsaved changes

**Objective:** Verify that cancelling an agency update does not persist the changes.

**Preconditions:** On the Update Agency form for any agency. Nothing is saved by this case.

**Test Data:** Agency: `QA_CANCEL_TEST`

**Steps:**

1. Record the current agency name.
2. Enter the Test Data agency name.
3. Click **Cancel**.
4. Reopen the same agency.

**Expected Result:** The agency name is the value recorded in step 1; the change made in step 2 was not saved.

**Priority:** P1

**Tags:** Atomic, Regression

**Notes:** run-004 verified this behaviour directly on the live form: `Company URL` was changed in-form, `Cancel` was clicked, the browser returned to `/admin/agency`, and reopening the record showed the original value. Nothing persisted, which also makes this case safe on any agency. `PO-6` settles the story's stray "role update process" wording as a reference to role-based authorization, not to this behaviour. Cancel-must-not-persist is an established platform pattern (PRD GEO-09, SUP-10). The 2026-08-02 approval still stands.

**Review:** Approved

**Automation:** Approved

### TC-AGENCY-048 — Approve a pending agency update

**Objective:** Verify that approving a pending agency update applies the submitted change and moves the record out of the pending state.

**Preconditions:** `{AGENCY_UNDER_TEST}` in a pending-approval state, created and submitted by this run (TC-AGENCY-045). Logged in as `odeysysadmin`.

**Steps:**

1. Open `{AGENCY_UNDER_TEST}` from the Agency list.
2. Enter approval remarks.
3. Click **Approve**.
4. Reopen the agency.

**Expected Result:** The agency's Approval Status leaves the pending state and reads as approved, and the field values submitted in TC-AGENCY-045 are applied to the record.

**Priority:** P1

**Tags:** Atomic

**Notes:** **Unblocked 2026-08-18 (`PO-9`).** run-001 recorded this case `Blocked` because only one credential exists, so maker and checker would be the same identity. `PO-9` removes role authorization from this run entirely: **the assertion is on the Agency workflow behaviour and the resulting record state, never on which role is permitted to approve.** Read that way, one identity is sufficient and is explicitly *not* a risk. **This case is only executable against a self-created record** — approving a record the run did not create is `Forbidden (absolute)` in `execution_safety_policy.json` and no grant lifts it, which is why the fixture is a hard precondition rather than a convenience. Whether the platform *should* permit self-approval belongs to the future Role CRUD module and is recorded as a declared exclusion, not covered here. **Review reset to `Pending`** — the Objective, Preconditions and Steps all changed.

**Review:** Approved

**Automation:** Approved

### TC-AGENCY-049 — Reject a pending agency update with a reason

**Objective:** Verify that rejecting a pending agency update records the reason and leaves the submitted values unapplied.

**Preconditions:** `{AGENCY_UNDER_TEST}` in a pending-approval state, created and submitted by this run (TC-AGENCY-045). Logged in as `odeysysadmin`.

**Steps:**

1. Record the agency's current stored field values.
2. Open `{AGENCY_UNDER_TEST}` from the Agency list.
3. Click **Reject**.
4. Enter a rejection reason.
5. Confirm the rejection.
6. Reopen the agency.

**Expected Result:** The agency's Approval Status reads as rejected, the rejection reason is recorded, and the values recorded in step 1 are unchanged.

**Priority:** P1

**Tags:** Atomic

**Notes:** **Unblocked 2026-08-18 for the same reason as TC-AGENCY-048 (`PO-9`).** The rejection reason maps onto PRD XC-03's Remarks field, which is captured as the audit reason. Run this on a **separate** submission from TC-AGENCY-048 — approving and rejecting the same pending record is not possible, and reusing one submission would make whichever case ran second unexecutable. **Review reset to `Pending`** — the Preconditions and Steps changed.

**Review:** Rejected

**Automation:** Rejected

### TC-AGENCY-050 — Agency update end to end: edit, submit, approve

**Objective:** Verify the complete agency update journey across the update form, the approval step, and the Agency list.

**Preconditions:** `{AGENCY_UNDER_TEST}` in an approved state. Logged in as `odeysysadmin`.

**Steps:**

1. Open `{AGENCY_UNDER_TEST}`.
2. Change one field in each of the Agency Master, Agency Owner Details, and Payment Settings sections.
3. Enter remarks and click **Send For Approval**.
4. Confirm the Agency list shows the agency in a pending-approval state.
5. Reopen the pending agency.
6. Enter approval remarks and click **Approve**.
7. Reopen the agency.

**Expected Result:** All three changed values are applied and the agency's Approval Status reads as approved.

**Priority:** P1

**Tags:** E2E

**Notes:** **Unblocked 2026-08-18 (`PO-9`).** This case spans the update form, the approval action, and the Agency list; it is additive to the atomic cases above and does not replace them. It verifies that the three steps **compose** — that a multi-section edit survives the full maker–checker round trip — which no atomic case establishes. Run it last: it leaves the fixture in an approved state with test values applied. **Review reset to `Pending`** — the Preconditions and Steps changed, and the second identity the previous version required is no longer part of the design.

**Review:** Approved

**Automation:** Approved

### TC-AGENCY-051 — Save an update without re-uploading the existing document and logo

**Objective:** Verify that an agency with an existing document and logo can be updated without re-uploading them.

**Preconditions:** On the Update Agency form for `{AGENCY_UNDER_TEST}`, which already has a document and a logo attached.

**Steps:**

1. Change one Agency Master field.
2. Do not touch the Upload Document or Agency Logo sections.
3. Enter a value in `Remarks`.
4. Click **Send For Approval**.
5. Reopen the same agency.

**Expected Result:** The agency is submitted successfully and the existing document and logo remain attached.

**Priority:** P2

**Tags:** Atomic

**Notes:** The `Assumption-based` tag is **removed**: `PO-7` settled the question and run-004 verified it on the live form — a stored document and a stored logo were both present when the Update form opened, and neither had to be re-uploaded to open or edit the record. AC-3 and AC-4's "Mandatory" describes the create-time rule, not a per-update obligation. What remains untested, and is what this case establishes, is that a **submission** succeeds without re-upload — Discovery only opened and edited the form, it never submitted. **Review reset to `Pending`** — the record under test changed and step 5 was added.

**Review:** Approved

**Automation:** Rejected

### TC-AGENCY-052 — Changing Branch re-inherits dependent values

**Objective:** Verify what happens to inherited values when an existing agency's Branch is changed.

**Preconditions:** None — this case is out of scope and is not executed.

**Steps:**

1. Not applicable.

**Expected Result:** Not applicable — the case is retired.

**Priority:** P2

**Tags:** Atomic, OutOfScope

**Notes:** **RETIRED 2026-08-18 — do not execute, and do not record a result.** `PO-10` removes all Branch-change and re-inheritance coverage from this run, and run-004 verified why: the `Branch` control on the Update form is both `disabled` and `readOnly`, displaying its value with no affordance to change it. **The behaviour this case describes cannot be reached from the Agency Update form at all**, so it is not blocked by an environment limitation — it is out of scope by decision, against a control that does not exist. The case is kept rather than deleted so the reviewer's 2026-08-02 approval and the reasoning behind the retirement stay on record. Its replacement is TC-AGENCY-059, which confirms the read-only state. If Branch-change behaviour is ever wanted, it belongs to a story about the Branch relationship, designed against whatever screen actually permits the change. **Review reset to `Pending`** — the case no longer executes anything, so an approval of its former steps cannot stand.

**Review:** Rejected

**Automation:** Rejected

### TC-AGENCY-053 — Agency name accepts a space between words

**Objective:** Verify that a space is within the agency name's allowed character set.

**Preconditions:** On the Update Agency form for `{AGENCY_UNDER_TEST}`.

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

**Notes:** The reviewer reported the field accepts letters, digits and underscore only — which, read literally, excludes the space. This case exists because **existing agency names already contain one**: run-004 observed `Test Egypt` stored on record 949. If a space is genuinely rejected, then no agency whose name has a space can be resubmitted without first being renamed, which would block updates across the existing data set — hence P1, not P3. The expected result is therefore stated definitely rather than left open: the existing data proves a space must be storable, so rejection is a defect, not an undocumented rule. Kept separate from TC-AGENCY-005 deliberately — every value there is space-free, so one case tests one rule and a failure is unambiguous. **Review reset to `Pending`** — the record under test changed. The field order also corrected here: `Review` precedes `Automation`, per §6.1.

**Review:** Approved

**Automation:** Approved

### TC-AGENCY-054 — PCC section is removed when the Product Access supplier is deselected

**Objective:** Verify that the Airline Supplier credential (PCC) section renders only while a Product Access supplier row is selected.

**Preconditions:** On the Update Agency form for `{AGENCY_UNDER_TEST}`, with its Product Access supplier row selected and the PCC section visible.

**Steps:**

1. Confirm the `Airline Supplier credential (PCC)` section is visible.
2. Deselect the supplier row's `STATUS` checkbox in the Product Access table.
3. Observe the area where the PCC section was.
4. Reload the page without saving.

**Expected Result:** After step 2 the whole PCC section is no longer displayed. After step 4 it is displayed again.

**Priority:** P2

**Tags:** Atomic, Regression

**Notes:** **New 2026-08-18 (FINDING-008).** This is the behaviour that explains run-001's contradictory observation, so it is worth pinning as a regression: the section is not missing, it is **conditional**. run-004 established it by controlled experiment with a before/after programmatic state read. Step 4 confirms the deselection was never persisted, which keeps this case non-mutating. **This dependency is why the fixture's Branch must carry a supplier** (§0.1): an Agency under a supplier-less Branch shows no PCC section, and a test run there would report a false absence — exactly the error run-001's evidence would have led Stage 3 into. Recorded as durable cross-module knowledge `BR-006`.

**Review:** Rejected

**Automation:** Rejected

### TC-AGENCY-055 — Manager Name shows the supplier's value and cannot be edited

**Objective:** Verify that Manager Name displays the value held on the supplier master and is read-only on the Agency form.

**Preconditions:** On the Update Agency form for `{AGENCY_UNDER_TEST}`, with the PCC section visible. The `Manager Name` value on the corresponding supplier record is known.

**Steps:**

1. Scroll to the `Airline Supplier credential (PCC)` section.
2. Compare the `Manager Name` value against the value held on the supplier master.
3. Click into `Manager Name` and attempt to type any character.

**Expected Result:** The displayed value matches the supplier master's, and the field cannot be edited.

**Priority:** P2

**Tags:** Atomic, Regression

**Notes:** **New 2026-08-18 (FINDING-009).** AC-9 lists `Manager Name` as Mandatory and specifies the message *"Please enter a valid Manager Name."*. run-004 established the field is **read-only** and inherited: the value is authored in `Master → Supplier → Supplier` and displayed here. **AC-9's Manager Name validation is therefore not an Agency test case** — this is an inheritance assertion instead, and no validation case is designed for that message. If Supplier CRUD is ever brought into scope, the message is tested there. One cosmetic question stays open and is deliberately **not** asserted: the field carries a mandatory asterisk although nobody can fill it. That is recorded as a low-priority observation, not a failure condition for this case. Step 2 needs the supplier master's value, which is read from the `master-supplier` module's record — reading it is in scope; changing it is not. **Rejected 2026-08-24 by explicit operator direction: no longer needed for this run.** No automation exists for this case — Stage 4A's suite documented it in a Javadoc block but never implemented an `@Test` method for it (found during Stage 5A execution, `ExecutionResults.md`) — so this decision retires a documented gap rather than a working asset.

**Review:** Rejected

**Automation:** Rejected

### TC-AGENCY-056 — Generic supplier credentials (PCC) blocks submission when cleared

**Objective:** Verify that Generic supplier credentials (PCC) is mandatory.

**Preconditions:** On the Update Agency form for `{AGENCY_UNDER_TEST}`, with the PCC section visible.

**Steps:**

1. Scroll to the `Airline Supplier credential (PCC)` section.
2. Clear every selection in `Generic supplier credentials (PCC)`.
3. Move focus out of the control.
4. Observe the control.

**Expected Result:** A validation message is displayed against the control and the form cannot be submitted with no credential selected.

**Priority:** P2

**Tags:** Atomic, Negative-EmptyValues

**Notes:** **New 2026-08-18 (FINDING-008).** The control is a multiselect the application marks mandatory (`Generic supplier credentials (PCC) *`), observed by run-004 holding `All (4 selected)`. It is AC-9's `Generic Supplier PCC`, which the story also marks Mandatory — the one AC-9 field where the story and the application agree outright. run-004 did not clear it, so the message is unverified; `Required` is the likeliest string given every other mandatory field on this form, but do not assert a literal that has not been seen. Record the exact text. **If clearing the control is not possible at all**, record the case `Blocked` with that reason rather than `Passed` — a control that cannot be emptied does not demonstrate that emptying it is refused.

**Review:** Approved

**Automation:** Rejected

### TC-AGENCY-057 — Supplier Credentials Description change persists

**Objective:** Verify that a change to Supplier Credentials Description is saved against the agency.

**Preconditions:** On the Update Agency form for `{AGENCY_UNDER_TEST}`, with the PCC section visible.

**Test Data:** Supplier Credentials Description: `QA PCC description US-4222`

**Steps:**

1. Record the current `Supplier Credentials Description` value.
2. Enter the Test Data value.
3. Enter a value in `Remarks`.
4. Click **Send For Approval**.
5. Reopen the same agency and return to the PCC section.

**Expected Result:** `Supplier Credentials Description` displays the Test Data value.

**Priority:** P3

**Tags:** Atomic

**Notes:** **New 2026-08-18 (FINDING-008).** This is AC-9's `Supplier Credential Description`, present under a near-identical name and the only one of the three PCC controls that is freely editable — `Manager Name` is read-only and `Generic supplier credentials (PCC)` is a fixed-option multiselect. run-004 observed it holding `szds`. It is the natural persistence case for the section, and it also confirms the PCC section takes part in the maker–checker submission at all, which no other case establishes.

**Review:** Approved

**Automation:** Rejected

### TC-AGENCY-058 — Credit limit shows the numeric format message for alphabetic input

**Objective:** Verify that typing letters into Credit limit produces the platform's numeric-format message.

**Preconditions:** On the Update Agency form for `{AGENCY_UNDER_TEST}`.

**Test Data:** Credit limit: `abcdef`, typed with real keystrokes.

**Steps:**

1. Clear the `Credit limit` field.
2. Type the Test Data value.
3. Move focus out of the field.
4. Observe the area beneath the field.

**Expected Result:** A format message is displayed stating that only numeric values are allowed.

**Priority:** P2

**Tags:** Atomic, Negative-InvalidInputs, Regression

**Notes:** **New 2026-08-18 (FINDING-010, numeric half). Designed to the requirement, and expected to fail — that failure is the finding.** PRD **XC-20** `[V]` states both the rejection *and* the message for exactly this case, and no source supersedes it, which is Project Context §1.1 **row 5**: design the case to the requirement and let execution report the outcome. run-004 typed `abcdef` into this field and observed the characters silently discarded with **no message at all**.
>
> **Why this is split from TC-AGENCY-035.** That case asserts the masking, which is observed fact and should pass. This one asserts the message, which the requirement demands and the application does not render. Bundling them would produce a single result that cannot distinguish "the filter works" from "the message is missing" — and the missing message is the whole finding. Two cases, one rule each.
>
> **The `[V]` tag is what makes this a defect candidate rather than an outdated story line.** It means an automated assertion once passed against this behaviour somewhere in the platform, so its absence here is a change someone should consciously confirm. Contrast TC-AGENCY-009, where the PRD is silent on URL validation and the case follows observed behaviour instead. **Confidence in the underlying observation is 92%, and the Finding is `Needs Human Review`** — if the product owner confirms silent masking as the intended platform design, this case is withdrawn and XC-20 is corrected. Until then it is designed and run.

**Review:** Approved

**Automation:** Rejected

### TC-AGENCY-059 — Branch is read-only on the Update form

**Objective:** Verify that Branch cannot be changed from inside the Agency Update form.

**Preconditions:** On the Update Agency form for any agency. No value is saved by this case.

**Steps:**

1. Read the `Branch` value.
2. Click the `Branch` control and attempt to open its list.
3. Attempt to type into it.

**Expected Result:** The control does not open a list and does not accept input; the displayed Branch value is unchanged.

**Priority:** P2

**Tags:** Atomic, Regression

**Notes:** **New 2026-08-18 (`PO-10`).** run-004 verified the control is both `disabled` and `readOnly`, displaying `Test (BRN2)` on record 949, and **did not attempt to change it** — the observation was of the control's state, not of a change being refused. This case makes that a standing assertion, because it is the property the whole retired Branch-change area now rests on: if Branch ever becomes editable here, TC-AGENCY-052's questions return and `PO-10`'s exclusion needs revisiting. This is a *confirmation* case, not an inheritance-behaviour case — the inherited values themselves are covered by TC-AGENCY-003 (Country), TC-AGENCY-028 (Sales Contact) and TC-AGENCY-040 (Product Access). Safe on any agency: nothing is entered and nothing is saved.

**Review:** Approved

**Automation:** Approved

### TC-AGENCY-060 — One PCC tab renders per supplier inherited from the parent Branch

**Objective:** Verify that the PCC section shows one supplier tab for each supplier inherited from the agency's Branch.

**Preconditions:** `{AGENCY_UNDER_TEST}` sits under `{BRANCH_UNDER_TEST}`, which carries **two or more** suppliers with credentials selected. The Branch's supplier list is recorded.

**Steps:**

1. Record the suppliers configured on `{BRANCH_UNDER_TEST}`.
2. Open `{AGENCY_UNDER_TEST}` and scroll to the `Airline Supplier credential (PCC)` section.
3. Read every supplier tab heading.
4. Open each tab in turn and confirm it carries the three PCC controls.

**Expected Result:** There is one tab per supplier recorded in step 1, each named for its supplier, and each carries `Generic supplier credentials (PCC) *`, `Manager Name *`, and `Supplier Credentials Description *`.

**Priority:** P1

**Tags:** Atomic, Regression

**Notes:** **New 2026-08-18 (FINDING-008).** This is the case AC-9's three "filters" actually map onto: run-004 established that `Amadeus PCC` / `Galileo PCC` / `Sabre PCC` are **not** filter controls but the supplier tabs themselves, one per inherited supplier. The cascade was confirmed end to end — a supplier added at Branch level appeared on the child Agency with no action on the Agency, and each inherited supplier got its own tab, with all three controls identical across five tabs on two Branches and two Agencies.
>
> **Why this is separate from TC-AGENCY-043.** That case verifies the section and its controls exist for one supplier. This one verifies the *relationship* — that the tab set tracks the parent Branch's supplier set — which is integration behaviour across the `agency` and `branch` modules (`BR-006`, extending `BR-002`) and is where undocumented coupling would surface. A single-supplier fixture cannot show it, which is why the precondition asks for two.
>
> **Requires a two-supplier Branch.** If `{BRANCH_UNDER_TEST}` carries only one supplier, record the case `Blocked` with that reason — a single tab neither confirms nor refutes the rule. Whether the Branch's own supplier data is correct stays the `branch` module's concern.

**Review:** Approved

**Automation:** Rejected
