# NDC — Manual Execution Results — Agency (Create · Search · Update · Actions)

> **Run:** RUN-20260725-001 · **Status:** Raw execution record (not a checkpointed/versioned artifact) · **Produced by:** Manual Execution Agent (Stage 4) · **Date:** 2026-07-25
> **Executed against:** `http://192.168.1.70` (Shared staging — per `run_configuration.md` §Environment Constraints) · **Role:** Admin (`odeysysadmin`)
> **Manual Test Suite executed against:** `workspace/test_design/Agency/NDC_TestCases_Agency.md` (Approved 2026-07-18) — 66 test cases total
> **Project Context:** `workspace/context/NDC_ProjectContext_Agency.md` — header still reads `Status: Pending`; user explicitly confirmed treating it as approved and proceeding without correcting the header (2026-07-25)
> **Run Scope executed this run:** Smoke/P1 subset only (16 of 66 cases) — explicit user scope decision, 2026-07-25 (see Summary §Known Limitations). Remaining 48 Regression-tagged cases are `Not Executed`; 2 cases (`TC-AGENCY-CREATE-037`, `TC-AGENCY-SEARCH-010`) are `Superseded` per the Test Suite's own text, not executed by design.
> **Mutation authorization:** user explicitly authorized creating new Agency records this run, restricted to **only update/approve/reject records this run itself created** — no pre-existing Agency record on the shared environment was modified (2026-07-25, overriding the standing "read-only" default in `run_configuration.md` for this run's own new records only).

---

## 1. Execution Metadata

| Field | Value |
|---|---|
| Execution ID | RUN-20260725-001 |
| Run Scope / Run Type | User Story (Agency, inherited from Test Design) — this run's own scope narrowed to the Smoke/P1 subset only, by explicit user decision |
| Environment | STG, `http://192.168.1.70` (Shared staging, per `browser/profile.json` — corrected this run, see §6 Known Limitations) |
| Start / End | 2026-07-25 (single session, multiple sequential browser sessions per test case) |
| Executed by | Manual Execution Agent, via Platform Browser Driver Layer (`platform_core/tools/browser_driver/`) |

## 2. Per-Test Results

### 2.1 Summary Table

Full defect documentation for the two **Failed** and one **Inconclusive** case is in §2.2, per the Defect Documentation Standard (`.claude/skills/manual-execution-agent/SKILL.md` §10.1). This table covers all 16 executed cases at a glance.

| Test Case ID | Status | Execution Time | Evidence | Notes |
|---|---|---|---|---|
| TC-AGENCY-CREATE-001 | **Passed** | ~90s | `evidence/verify-search-qaspike1.png` | Full happy-path submission succeeded. Created `QA_SPIKE_1` / `AGN10205`, landed `Inactive` / `Pending for approval` — exactly as expected. IATA Agency left at `No` to avoid an undocumented mandatory sub-field (see §6 #1). |
| TC-AGENCY-CREATE-027 | **Passed** | ~120s (2 sub-cases) | `evidence/c027-01-zero-payment.png`, `evidence/c027-02-multi-payment.png` | Zero Payment Options → blocked with a visible `Required` marker under the Payment Option row. Cash+Wallet+CreditCard together → submission succeeded (created `QA_SPIKE_027B`, later renamed — see UPDATE-002). |
| TC-AGENCY-CREATE-030 | **Failed** | ~90s | `evidence/c030-01-no-product.png` | See full defect documentation in §2.2 — Product Access Mandatory fields not enforced when the section is left entirely unset. |
| TC-AGENCY-CREATE-032 | **Inconclusive** | ~90s | `evidence/c032-03-post-submit.png` | See full documentation in §2.2 — test-execution limitation (wrong dropdown cleared), not a confirmed application defect. |
| TC-AGENCY-SEARCH-001 | **Passed** | ~20s | `evidence/search001-by-code.png` | Searching Agency Code `AGN10205` returned exactly the matching record. |
| TC-AGENCY-SEARCH-002 | **Passed** | ~20s | `evidence/search002-by-name.png` | Searching Agency Name `QA_SPIKE_1` returned exactly the matching record, no unrelated rows. |
| TC-AGENCY-ACTIONS-001 | **Passed** | ~20s | `evidence/actions001-update-screen-v2.png` | Pencil icon on `QA_SPIKE_1`'s row navigated to `/admin/agency/edit/11810`; Agency Name field on that screen read back `QA_SPIKE_1`, confirming the correct record opened. |
| TC-AGENCY-ACTIONS-002 | **Failed** | ~30s | `evidence/actions002-active-row.png`; grid text captured in execution log for the Rejected-row check | See full defect documentation in §2.2 — Approve/Reject icon visibility not limited to Pending rows. |
| TC-AGENCY-ACTIONS-003 | **Passed** | ~15s | `evidence/actions003-approve-popup.png`, `evidence/actions003-empty-remark-attempt.png` | Clicking Approve on `QA_SPIKE_027B` (Pending) showed a remark popup (`Remarks *` / Cancel / Submit); submitting with the remark left blank kept the popup open (blocked). |
| TC-AGENCY-ACTIONS-004 | **Passed** | ~15s | `evidence/actions004-remark-filled.png`, `evidence/actions004-post-approve.png` | Entering a remark and submitting completed Approve; re-searched grid showed `AGN10206` / `QA_SPIKE_027B` as `Active` / `Approved`. |
| TC-AGENCY-ACTIONS-005 | **Passed** | ~15s | `evidence/actions005-reject-popup.png`, `evidence/actions005-empty-remark-attempt.png` | Same mechanism as Approve, independently verified for Reject on `QA_SPIKE_030A` (Pending): popup shown, blocked with no remark. |
| TC-AGENCY-ACTIONS-006 | **Passed** | ~15s | `evidence/actions006-remark-filled.png`, `evidence/actions006-post-reject.png` | Entering a remark and submitting completed Reject; re-searched grid showed `AGN10207` / `QA_SPIKE_030A` as `Inactive` / `Rejected`. |
| TC-AGENCY-ACTIONS-007 | **Passed** | (observed via CREATE-001/027/030's own results) | `evidence/verify-search-qaspike1.png` | Every Agency created this run (`QA_SPIKE_1`, `QA_SPIKE_027B`, `QA_SPIKE_030A`) landed `Inactive` / `Pending for approval` immediately after submission, before any Approve/Reject action — and was found via Search with Status=Both. This also **re-resolves FINDING-007** (previously: Pending Agencies excluded from Search) — no longer reproducing on the current Search Agency screen. |
| TC-AGENCY-ACTIONS-009 | **Passed** | (consolidated from ACTIONS-003/004/005/006/007) | Same evidence as those cases | Agency A (`QA_SPIKE_027B`): Submit → Inactive/Pending → Approve → Active/Approved. Agency B (`QA_SPIKE_030A`): Submit → Inactive/Pending → Reject → Inactive/Rejected. All three rows of the Status Reflection matrix confirmed. |
| TC-AGENCY-UPDATE-001 | **Passed** | ~20s | `evidence/update001-prepopulated.png` | Opened Update Agency for `QA_SPIKE_027B` (`/admin/agency/edit/11811`); Agency Name, Post Office Box, Contact Person, Owner Email, Sales Name, Credit Limit, and the uploaded document name all read back matching the values set at creation. |
| TC-AGENCY-UPDATE-002 | **Passed** | ~20s | `evidence/update002-edited.png`, `evidence/update002-post-submit.png` | Changed Agency Name to `QA_SPIKE_027B_EDITED` and Credit Limit to `99999`, submitted; re-searched grid showed the renamed record as `Inactive` / `Pending for approval` — editing an Active record correctly re-triggers the approval workflow. |

### 2.2 Failed / Inconclusive Test Cases — Full Defect Documentation

---

#### TC-AGENCY-CREATE-030 — Product Access: Mandatory selections (Product, Status Column, Credential name, Description) block submission when unset

**Execution Status:** Failed
**Execution Time:** ~90 seconds
**Preconditions:** Logged in as Admin. On Admin → Agency → Add, with Branch `Alexandria (BRN9)` selected — a branch confirmed to have its own Product Access configuration available (Product Access/PCC sections render and auto-populate once this branch is selected, per §6 #2 below).
**Test Data:** The entire Product Access section left untouched — no Product checkbox selected (neither `Flight` nor `Others`), and consequently no Status Column, Credential Name, or Description values existed at all. Every other Mandatory field across the form (Agency Master, Owner Details, Documents, Logo, Sales Contact, Payment Settings) was filled with valid data, isolating Product Access as the only variable under test.
**Steps Performed:** Selected Branch `Alexandria (BRN9)`; filled Agency Name, State, City, Post Office Box, Address, and Phone No.; set IATA Agency = No; filled Owner Contact Person, Email, and Phone; uploaded a valid contract document with Contract Start/End Dates; uploaded a valid logo; filled one Sales Contact entry; selected an Invoice Generation option and the Cash Payment Option; left Select Product entirely unchecked; clicked "Send For Approval."

**Expected Result:**
The system should prevent submission because the Product Access section's Product, Status Column, Credential Name, and Description fields are each documented as Mandatory (`FR-AGCRT-PRODUCT-01`, `-02`, `-04`, `-06`) — an Agency record should not be creatable without at least one valid Product Access configuration establishing which NDC products/suppliers it may use.

**Actual Result:**
The Agency was created successfully (`QA_SPIKE_030A`, code `AGN10207`, landing `Inactive` / `Pending for approval`) even though no Product Access entry was ever added. No validation message appeared for Product, Status Column, Credential Name, or Description, and the "Send For Approval" action completed without any blocking behavior.

**Impact:**
An Agency can be fully onboarded with zero configured product access, silently bypassing a control the business has documented as mandatory. Downstream, this Agency would have no defined Supplier/Product/Credential scope — any process that assumes every Active Agency has at least one Product Access row (booking eligibility checks, product-access reporting, credential-based GDS/ticketing access) may behave unpredictably or fail against this record. It also means the four stated validation messages for this section can never be observed in practice, since nothing triggers them.

**Classification:**
| Field | Value |
|---|---|
| Category | Validation |
| Layer | Frontend (suspected) — no client-side error rendered before submission; Backend/API also did not independently reject the empty collection, since the record was persisted successfully, but no direct evidence isolates which layer would need the fix vs. which is merely absent of a check |
| Reproducibility | Always — two independent executions (`TC-AGENCY-CREATE-001`, which left Credential Name blank with Flight checked, and this case, which left the whole section unset) both completed without any Product Access validation firing |
| Regression | Unknown — Test Design's own Discovery Reference for this case states "Not independently verified in Discovery"; no prior run's evidence establishes this ever worked differently |
| Suspected Component | Add/Update Agency form's Product Access section — likely the shared `ndc-fg-form-generator`-based component noted in `runs/RUN-20260718-001/discovery/Agency_Update.md` |
| Confidence | High — the defect's existence (submission succeeding with zero Product Access) was observed consistently across two independent executions with no ambiguity in the observed behavior |

**Root Cause Analysis:**
Likely the validation logic for Product, Status Column, Credential Name, and Description is implemented at the level of an individual Product Access row (validating each row's fields once a row exists), while no separate validation exists for the case where the Product Access collection itself is empty. Appears to be a missing "at least one row required" check rather than a broken per-field validator, since the adjacent Payment Option field (also a "must select at least one" requirement, `FR-AGCRT-PAY-11`) correctly blocked submission with zero selections in the same form (`TC-AGENCY-CREATE-027`), suggesting the pattern for "must not be empty as a collection" is implemented correctly elsewhere but not here.

**Conclusion:**
This is a genuine application defect, not a test-design or test-data issue: the Product Access section's Mandatory-field validation (`FR-AGCRT-PRODUCT-01/02/04/06`) is not enforced at all when the section is left completely empty, allowing an Agency to be created with no product access configuration in direct contradiction of the documented requirement.

**Severity:** High
**Reason:** Mandatory validation can be bypassed entirely, allowing an Agency with no product/supplier access configuration to be persisted and enter the approval workflow as if it were valid.

**Priority:** P1 — matches this test case's own stated Priority in the Manual Test Suite; the underlying requirement (`FR-AGCRT-PRODUCT-*`) is flagged High risk there specifically because Product Access governs live booking capability.

**Evidence:** `evidence/c030-01-no-product.png` (post-submission state showing successful creation with Product Access left unset).

---

#### TC-AGENCY-ACTIONS-002 — Approve/Reject buttons shown only for Pending agencies

**Execution Status:** Failed
**Execution Time:** ~30 seconds (two independent row checks)
**Preconditions:** Logged in as Admin. Three Agency records available, one per Approval Status: `QA_SPIKE_1`/`QA_SPIKE_027B` (Pending, this run's own), `AGN10081`/`AAAA` (Active/Approved, a pre-existing shared-environment record — inspected read-only, never modified), `QA_SPIKE_030A` (Rejected, this run's own, produced immediately prior by `TC-AGENCY-ACTIONS-006`).
**Test Data:** The Actions-column icon set for one row per Approval Status, inspected via the Agency List/Search grid.
**Steps Performed:** Searched the Agency grid for each of the three records in turn; for each matching row, read the Actions column's rendered icon set (pencil / thumbs-up "Approve" / thumbs-down "Reject") directly from the DOM.

**Expected Result:**
The system should display the Approve and Reject actions only on rows whose Approval Status is "Pending for approval," per the Agency Actions User Story's own Acceptance Criteria ("Approve/Reject buttons are displayed for agencies pending approval"). Active/Approved and Rejected rows should show neither action.

**Actual Result:**
The Active/Approved row (`AGN10081`/`AAAA`) displayed the pencil icon and the Reject (thumbs-down) icon — the Approve icon was correctly absent, but Reject was not. The Rejected row (`QA_SPIKE_030A`) displayed the pencil icon and the Approve (thumbs-up) icon — Reject was correctly absent, but Approve was not. In both cases, exactly the *opposite* of the row's current decision remained available, rather than both actions being hidden as the Acceptance Criteria states.

**Impact:**
Staff can Reject an already-Approved, live Agency directly from the list — or Approve an already-Rejected one — without going through Update Agency or any secondary review step the Acceptance Criteria implies should gate a re-decision. This creates a path for a decision to be silently reversed by anyone with Admin access, with no re-validation of the record's current data, which is inconsistent with an approval workflow whose whole purpose is controlled, auditable state transitions.

**Classification:**
| Field | Value |
|---|---|
| Category | Workflow |
| Layer | Frontend — the finding is specifically about Actions-column icon visibility (a rendering condition); whether the backend would also allow completing an Approve/Reject action from these states was not independently tested this run |
| Reproducibility | Always — two independent rows (one Active/Approved, one Rejected) both showed the same pattern in a single pass, with no inconsistency between them |
| Regression | Unknown — this test case's own Discovery Reference states "Not independently verified in Discovery"; no prior run's evidence establishes this ever worked differently |
| Suspected Component | Agency List/Search grid's Actions-column icon-visibility condition |
| Confidence | High — two independent, mutually consistent observations (Active row retains Reject, Rejected row retains Approve) |

**Root Cause Analysis:**
Likely the Actions column's visibility condition is implemented as "hide the action matching the row's current Approval Status" (hide Approve when already Approved; hide Reject when already Rejected) rather than "show Approve and Reject only when Approval Status is Pending." Appears to be an inverted or partial condition — checking against the record's *own* prior decision instead of checking specifically for the Pending state — but this is inferred from the two observed rows, not confirmed against the front-end source.

**Conclusion:**
This is a genuine workflow/business-logic defect: Approve/Reject icon visibility is governed by "hide the matching action," not "show only when Pending," so both Active and Rejected rows retain one live decision-reversal action each, contradicting the Agency Actions Acceptance Criteria.

**Severity:** High
**Reason:** Allows a completed approval decision to be reversed directly from the grid outside the intended Pending-only workflow, on a record type this run confirmed governs live booking/product access — a duplicate or contradictory workflow action is a real, not theoretical, risk here.

**Priority:** P1 — matches this test case's own stated Priority in the Manual Test Suite.

**Evidence:** `evidence/actions002-active-row.png` (Active row's Actions cell, Reject icon present); Rejected-row Actions-cell HTML captured directly from the DOM during this run's `TC-AGENCY-ACTIONS-006` follow-up check (Approve icon present) — quoted in the execution log, not separately screenshotted.

---

#### TC-AGENCY-CREATE-032 — Airline Supplier Credential (PCC): Mandatory fields block submission when unset

**Execution Status:** Inconclusive
**Execution Time:** ~90 seconds
**Preconditions:** Logged in as Admin. On Admin → Agency → Add, with Branch `Alexandria (BRN9)` selected and Product `Flight` checked, which auto-rendered the PCC section pre-populated with the branch/supplier's own default PCC configuration.
**Test Data:** Attempted to clear the auto-populated "Generic supplier credentials (PCC)" dropdown to test whether submission is blocked when that Mandatory field is genuinely empty.
**Steps Performed:** Filled the form to the same valid baseline as `TC-AGENCY-CREATE-001`; located a dropdown "clear" (×) icon on the page and clicked it, intending to clear the PCC section's Generic Supplier Credentials selection; attempted to submit.

**Expected Result:**
The system should prevent submission when Search Supplier Credential PCC, Generic Supplier PCC, Manager Name, or Supplier Credential Description are left unset, per `FR-AGCRT-PCC-01/03/04/05`, each with its own stated validation message.

**Actual Result:**
The clear (×) icon selector used (`.p-dropdown-clear-icon`, first match on the page) targeted the **Branch** dropdown instead of the PCC section's dropdown — both are independently clearable PrimeNG controls, and the Branch one appears first in DOM order. Clearing Branch correctly blocked submission (a `Required` marker appeared under Branch), but this only re-confirms Branch's own Mandatory validation — it did not exercise the PCC field's Mandatory validation at all, since clearing Branch also removed the entire Product Access/PCC section from the page as a side effect (confirming §6 #2's Branch-dependency finding, but not answering this test case's actual question). A second attempt to precisely scope the click to the PCC section's own control could not re-locate it reliably within this run's remaining time budget.

**Impact:**
Not applicable as an application-impact statement — this is a test-execution limitation, not a confirmed behavior of the application. Whether PCC's Mandatory fields are actually enforced remains unknown; no conclusion about user or business impact can be responsibly drawn from this attempt.

**Classification:**
| Field | Value |
|---|---|
| Category | Not applicable — no defect confirmed; the ambiguity is a test-execution limitation, not an observed application behavior |
| Layer | Unknown — the automation script's selector ambiguity means no application layer was actually isolated by this attempt |
| Reproducibility | Unable to confirm — the intended negative sub-case (PCC field genuinely empty) was never actually produced |
| Regression | Unknown |
| Suspected Component | N/A for the application — the limitation was in this run's own automation script (an un-scoped `.p-dropdown-clear-icon` selector matching the Branch dropdown before the PCC dropdown) |
| Confidence | Low — regarding whether PCC's Mandatory validation is actually broken. (The adjacent `TC-AGENCY-CREATE-030` finding makes a similar gap plausible — Medium confidence in that inference specifically — but that is a different test case's evidence, not a direct observation of PCC itself.) |

**Root Cause Analysis:**
Not applicable — the ambiguous outcome traces to the automation script's selector choice (an un-scoped, page-wide query matching more than one clearable dropdown), not to any observed application behavior. No inference about the application's implementation can be responsibly made from this attempt.

**Conclusion:**
This is a test-execution limitation, not a confirmed application defect: the negative sub-case for PCC's Mandatory fields was not actually exercised, because the control that was cleared belonged to a different field (Branch) than intended. The adjacent, structurally similar Product Access section was independently confirmed not to enforce its equivalent stated-Mandatory fields (`TC-AGENCY-CREATE-030`, Failed), which makes it plausible PCC behaves the same way — but that is an inference from a different test case, not a direct observation of PCC itself, and must not be reported as a confirmed PCC defect on that basis alone.

**Severity:** Not applicable — no defect confirmed this run.
**Priority:** P2 — recommended priority for the re-test itself (isolating a selector scoped strictly to the PCC section's own dropdown), given the adjacent Product Access finding raises a reasonable expectation that PCC may have the same gap.

**Evidence:** `evidence/c032-03-post-submit.png` (shows the Branch dropdown cleared and the Product Access/PCC section absent as a result, rather than the intended PCC-only state).

---

**48 Regression-tagged cases** (`TC-AGENCY-CREATE-002…029,031,033…036,038,039`; `TC-AGENCY-SEARCH-003…009`; `TC-AGENCY-ACTIONS-008,010`; `TC-AGENCY-UPDATE-003…007`): **Not Executed** — reason: explicit user scope decision to execute the Smoke/P1 subset only this run (2026-07-25), given the setup cost per case and the volume of live records each case would create/mutate on the shared environment. Deferred to a follow-up run, not silently dropped.

**2 cases marked Superseded by the Test Suite itself, not executed by design:** `TC-AGENCY-CREATE-037` (pointer to `TC-AGENCY-ACTIONS-003…008`), `TC-AGENCY-SEARCH-010` (pointer to the prior run's `TC-AGENCY-003`).

## 3. Evidence Inventory

All evidence below is stored under `runs/RUN-20260725-001/manual_execution/evidence/`. Every screenshot was captured via the Platform Browser Driver Layer (`platform_core/tools/browser_driver/`) at the point described. Grid/search-result text quoted directly in §2 above was captured via the driver's page-text extraction at the same time as its neighboring screenshot, not independently re-verified after the fact — cited inline rather than duplicated as a separate file.

| File | Captures |
|---|---|
| `verify-search-qaspike1.png` | Search grid confirming `QA_SPIKE_1`/`AGN10205` created, Inactive/Pending |
| `c027-01-zero-payment.png` | Payment Option `Required` block with zero selections |
| `c027-02-multi-payment.png` | Post-submission state after Cash+Wallet+CreditCard selection |
| `c030-01-no-product.png` | Post-submission state with Product Access left entirely unset (succeeded — the discrepancy) |
| `c032-03-post-submit.png` | Branch dropdown incorrectly cleared instead of PCC dropdown; PCC section absent as a result |
| `search001-by-code.png` | Search by Agency Code result grid |
| `search002-by-name.png` | Search by Agency Name result grid |
| `actions001-update-screen-v2.png` | Update Agency screen opened via pencil icon, Agency Name confirmed |
| `actions002-active-row.png` | Active/Approved row still showing a Reject icon |
| `actions003-approve-popup.png` | Approve remark popup shown |
| `actions003-empty-remark-attempt.png` | Popup still open after submitting with no remark |
| `actions004-remark-filled.png` | Remark entered before Approve completion |
| `actions004-post-approve.png` | Post-Approve state |
| `actions005-reject-popup.png` | Reject remark popup shown |
| `actions005-empty-remark-attempt.png` | Popup still open after submitting with no remark |
| `actions006-remark-filled.png` | Remark entered before Reject completion |
| `actions006-post-reject.png` | Post-Reject state |
| `update001-prepopulated.png` | Update Agency screen with all fields pre-populated |
| `update002-edited.png` | Agency Name/Credit Limit edited before resubmission |
| `update002-post-submit.png` | Post-resubmission state |

No video/log capture was applicable this run (no session-recording tooling configured; browser console/network logs were not separately persisted beyond the driver's in-memory capture used for the CREATE-001 diagnostic, per §6).
