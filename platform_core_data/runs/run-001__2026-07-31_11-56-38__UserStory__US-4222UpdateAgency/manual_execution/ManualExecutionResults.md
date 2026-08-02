# Manual Execution Results — run-001__2026-07-31_11-56-38__UserStory__US-4222UpdateAgency

## 1. Execution Metadata

| Field | Value |
|---|---|
| Execution ID | EXEC-4M-US4222-001 |
| Run Folder | `run-001__2026-07-31_11-56-38__UserStory__US-4222UpdateAgency` |
| Run Scope Type / Run Type | User Story / User Story |
| Environment | STG — shared, holding live commercial data; Agency-record mutation authorized for this run |
| Target URL | http://192.168.1.70 |
| Role(s) used | Super Admin |
| Started | 2026-07-31 |
| Ended | 2026-08-02 |
| Test Suites executed | `platform_core_data/modules/agency/test_design/TestCases_Agency.md` (53 cases, revision 3, Approved) |

## 2. Result Totals

| Status | Count |
|---|---|
| Passed | 31 |
| Failed | 1 |
| Blocked | 4 |
| Skipped | 1 |
| Not Executed | 0 |
| Inconclusive | 0 |
| **Executable scope** (`Review = Approved`) | **37** |
| Excluded — Pending Review | 0 |
| Excluded — Rejected at Review | 16 |
| **Suite total** | **53** |

Pass rate is **83.8% of the executable scope** (31 of 37). Against the suite
total it is 58.5% (31 of 53), and that figure is not the run's pass rate — it is the
consequence of 16 cases never being authorized to run.

## 3. Per-Test Results

| Test Case ID | Module | Status | Execution Time | Reason (non-Passed) | Evidence Refs |
|---|---|---|---|---|---|
| TC-AGENCY-001 | agency | Passed | 44.6s | — | `artifacts/TC-AGENCY-001.png` |
| TC-AGENCY-002 | agency | Passed | 9.4s | — | `artifacts/TC-AGENCY-002_kbd.png` |
| TC-AGENCY-003 | agency | Passed | 20.8s | — | `artifacts/TC-AGENCY-003_rerun.png` |
| TC-AGENCY-004 | agency | Excluded | — | Rejected at Review | — |
| TC-AGENCY-005 | agency | Excluded | — | Rejected at Review | — |
| TC-AGENCY-006 | agency | Excluded | — | Rejected at Review | — |
| TC-AGENCY-007 | agency | Excluded | — | Rejected at Review | — |
| TC-AGENCY-008 | agency | Passed | 6.1s | — | `artifacts/TC-AGENCY-008_kbd.png` |
| TC-AGENCY-009 | agency | Excluded | — | Rejected at Review | — |
| TC-AGENCY-010 | agency | Excluded | — | Rejected at Review | — |
| TC-AGENCY-011 | agency | Passed | 37.3s | — | `artifacts/TC-AGENCY-011.png` |
| TC-AGENCY-012 | agency | Passed | 43.4s | — | `artifacts/TC-AGENCY-012.png` |
| TC-AGENCY-013 | agency | Passed | 9.3s | — | `artifacts/TC-AGENCY-013_kbd.png` |
| TC-AGENCY-014 | agency | Passed | 8.4s | — | `artifacts/TC-AGENCY-014_kbd.png` |
| TC-AGENCY-015 | agency | Passed | 8.2s | — | `artifacts/TC-AGENCY-015_kbd.png` |
| TC-AGENCY-016 | agency | Passed | 53.7s | — | `artifacts/TC-AGENCY-016.png` |
| TC-AGENCY-017 | agency | Passed | 44.6s | — | `artifacts/TC-AGENCY-017.png` |
| TC-AGENCY-018 | agency | Passed | 50.5s | — | `artifacts/TC-AGENCY-018.png` |
| TC-AGENCY-019 | agency | Excluded | — | Rejected at Review | — |
| TC-AGENCY-020 | agency | Failed | 65.4s | The file was accepted and persisted with no validation message — document format is validated neither by content nor by extension. | `artifacts/TC-AGENCY-020.png` |
| TC-AGENCY-021 | agency | Passed | 17.4s | — | `artifacts/TC-AGENCY-021_rerun.png` |
| TC-AGENCY-022 | agency | Passed | 45.5s | — | `artifacts/TC-AGENCY-022.png` |
| TC-AGENCY-023 | agency | Passed | 33.8s | — | `artifacts/TC-AGENCY-023.png` |
| TC-AGENCY-024 | agency | Passed | 32.6s | — | `artifacts/TC-AGENCY-024.png` |
| TC-AGENCY-025 | agency | Excluded | — | Rejected at Review | — |
| TC-AGENCY-026 | agency | Excluded | — | Rejected at Review | — |
| TC-AGENCY-027 | agency | Passed | 9.1s | — | `artifacts/TC-AGENCY-027_kbd.png` |
| TC-AGENCY-028 | agency | Excluded | — | Rejected at Review | — |
| TC-AGENCY-029 | agency | Excluded | — | Rejected at Review | — |
| TC-AGENCY-030 | agency | Excluded | — | Rejected at Review | — |
| TC-AGENCY-031 | agency | Excluded | — | Rejected at Review | — |
| TC-AGENCY-032 | agency | Excluded | — | Rejected at Review | — |
| TC-AGENCY-033 | agency | Passed | 44.7s | — | `artifacts/TC-AGENCY-033.png` |
| TC-AGENCY-034 | agency | Passed | 9.4s | — | `artifacts/TC-AGENCY-034_kbd.png` |
| TC-AGENCY-035 | agency | Passed | 7.2s | — | `artifacts/TC-AGENCY-035_kbd.png` |
| TC-AGENCY-036 | agency | Passed | 40.4s | — | `artifacts/TC-AGENCY-036.png` |
| TC-AGENCY-037 | agency | Blocked | — | BLOCKED FOR AUTOMATION — the payment-option checkbox component cannot be driven reliably through the public UI with any interaction method available to this harness. NOT an application defect. | `artifacts/TC-AGENCY-037_network.json`<br>`artifacts/TC-AGENCY-037_network_final.png`<br>`artifacts/TC-AGENCY-037_realclick.png` |
| TC-AGENCY-038 | agency | Excluded | — | Rejected at Review | — |
| TC-AGENCY-039 | agency | Passed | 36.4s | — | `artifacts/TC-AGENCY-039.png` |
| TC-AGENCY-040 | agency | Passed | — | — | `artifacts/TC-AGENCY-040_product_access_grid.png` |
| TC-AGENCY-041 | agency | Passed | 39.3s | A product other than the one deselected also changed. | `artifacts/TC-AGENCY-041.png` |
| TC-AGENCY-042 | agency | Passed | — | — | `artifacts/TC-AGENCY-042_readonly_columns.png` |
| TC-AGENCY-043 | agency | Excluded | — | Rejected at Review | — |
| TC-AGENCY-044 | agency | Passed | 39.7s | — | `artifacts/TC-AGENCY-044_rerun.png` |
| TC-AGENCY-045 | agency | Passed | 47.8s | — | `artifacts/TC-AGENCY-045.png` |
| TC-AGENCY-046 | agency | Passed | 14.0s | — | `artifacts/TC-AGENCY-046_rerun.png` |
| TC-AGENCY-047 | agency | Passed | 16.4s | — | `artifacts/TC-AGENCY-047.png` |
| TC-AGENCY-048 | agency | Blocked | — | Only one credential exists on this install (odeysysadmin, Super Admin), so the submitter and the approver would be the same identity. The four-eyes separation this case exists to verify cannot be exercised, and approving one's own change under Super Admin would prove nothing about whether the platform permits it for anyone else (FINDING-007). The case's own Notes require Blocked here, never Passed or Failed. | — |
| TC-AGENCY-049 | agency | Blocked | — | Same single-credential limitation as TC-AGENCY-048: rejection by a different user cannot be exercised with one identity (FINDING-007). | — |
| TC-AGENCY-050 | agency | Blocked | — | The end-to-end path includes an approval by a different user, which the single available credential cannot provide (FINDING-007). Its edit-and-submit portion was exercised by TC-AGENCY-045, but the case as written is not executable and is not reported as partially passed. | — |
| TC-AGENCY-051 | agency | Passed | 36.9s | — | `artifacts/TC-AGENCY-051.png` |
| TC-AGENCY-052 | agency | Skipped | — | Deferred / Requires Dedicated Environment. The case's own Notes mark it DEFERRED and forbid execution in this run: changing Branch may overwrite Product Access and Sales Contact values the agency already holds, which on this shared environment is a destructive and possibly unrecoverable change to a live commercial record. | — |
| TC-AGENCY-053 | agency | Passed | 35.6s | — | `artifacts/TC-AGENCY-053.png` |

### 3.1 Defect Detail — Failed / Inconclusive cases

#### TC-AGENCY-020 — A file whose contents are not a PDF is accepted and stored as an agency contract document

**1. Test Case ID:** TC-AGENCY-020

**2. Execution Status:** Failed

**3. Execution Time:** 2026-08-02T11:53:58.454Z (65.4s)

**4. Preconditions:** Logged in to the NDC Admin Portal as Super Admin, on the Update Agency form for agency `AGN2 — Test Egypt`, which already holds one document.

**5. Test Data:** `AgencyContract_fake_extension.pdf` — 297 bytes of plain text with no `%PDF` header, carrying a `.pdf` file name.

**6. Steps Performed:** A second document row was added with **Add**, the fixture was selected through the row's own **Upload document** control, contract dates of 01/04/2026 and 30/04/2027 were entered, and the update was submitted with **Send For Approval** and then approved. The agency was reopened and the Upload Document section re-read.

**7. Expected Result:** The upload should have been rejected with a message identifying the file format as invalid. Acceptance criterion AC-3 governs contract documents, and the Agency Logo control on this same form demonstrates that the product does validate uploads — it rejects a non-image with "Please upload an image in .gif, .jpg, .png, .jpeg, .webp format ." A contract document is the record of a commercial agreement, so the same standard of validation is the reasonable expectation.

**8. Actual Result:** The file was accepted silently at selection with no validation message, the submission was accepted, and after the agency was reopened the file was listed as an attached contract document. Neither the file's contents nor its declared type was checked; the `.pdf` extension in the name was sufficient. The document upload control declares no `accept` attribute at all, so the file dialog offers every file type, whereas the logo control declares `accept="image/*"`.

**9. Impact:** Any file can be stored as an agency contract document provided it is named `.pdf`. A user who attaches the wrong file, or a corrupt one, receives no indication of the problem; the error surfaces later, when somebody opens the contract and finds it unreadable. Because the stored artefact is the evidence of the commercial agreement with the agency, the failure is discovered exactly when the document matters most.

**10. Classification**

| Field | Value |
|---|---|
| **Category** | Validation |
| **Layer** | Frontend and Backend — the browser accepted it with no filter and the server stored it, so neither layer validates |
| **Reproducibility** | Unable to confirm — observed once in this run. The single observation was clean and fully evidenced, but the standard for `Always` is at least two independent observations. |
| **Regression** | Unknown — no earlier execution of this case exists to compare against. |
| **Suspected Component** | Agency document upload (`ndc-fg-file-input`, `input[name=docId]`) |
| **Confidence** | High that the behaviour is as described; the observation is direct and the stored result was re-read after reopening the record. |

**11. Root Cause Analysis:** The logo control constrains its file dialog with `accept="image/*"` and rejects a non-image at submit, while the document control declares no `accept` and produced no message. The most plausible explanation is that document format validation was simply never implemented, rather than implemented and bypassed — but that is an inference from the contrast between the two controls, not something this run established.

**12. Conclusion:** Agency contract documents are subject to no format validation whatsoever: not by content, and not even by file extension, since the file dialog is unrestricted.

**13. Severity:** Medium — No data is lost or corrupted and no security boundary is crossed, but a commercial record can be stored in an unusable state with no warning to the user who stored it.

**14. Priority:** P2

**15. Evidence:**

| Evidence | Path |
|---|---|
| Screenshot — the accepted file listed after reopening | `manual_execution/artifacts/TC-AGENCY-020.png` |


### 3.2 Defect Detail — a defect found by a case that PASSED

<!-- Reported here deliberately, outside the Failed/Inconclusive convention. TC-AGENCY-041's own assertion
     was met, so recording it only as "Passed" would be accurate and would also bury the more important
     thing the case found. -->

#### TC-AGENCY-041 — A deselected product cannot be re-selected and saved, and its configuration is lost

**1. Test Case ID:** TC-AGENCY-041 *(the case itself Passed — see §3 — this entry documents a defect it exposed)*

**2. Execution Status:** Passed, with an unresolved change left on the record (§5)

**3. Execution Time:** 2026-08-02T12:41:47.552Z

**4. Preconditions:** On the Update Agency form for `AGN2 — Test Egypt`, with both products (`Flight`, `Others`) selected.

**5. Test Data:** No entered data — the case deselects the `Flight` product.

**6. Steps Performed:** The `Flight` product was deselected, the update was submitted and approved, and the agency was reopened; the deselection had persisted, which is what the case asserts. The revert then re-selected `Flight` and attempted to save.

**7. Expected Result:** Re-selecting a product should restore it, exactly as deselecting it removed it. A selection control that cannot be returned to its previous value is not a selection control; and nothing in US-4222 suggests that changing a product selection is a one-way action.

**8. Actual Result:** Re-selecting `Flight` renders a blank supplier-credential panel in which **Manager Name** and **Supplier Credentials Description** are mandatory, and the form refuses to save until both are filled. The agency has no values for either: its stored `Sabre` credential carries an empty credential name and an empty description. The stored credential is still present in the grid and its selection checkbox is still ticked, so the association was never lost — the block is purely the empty panel. Deselecting the product also discarded its dependent values: the supplier-credential grid row disappeared from the form and the dropdown that held `10` was removed.

**9. Impact:** An administrator who deselects a product by mistake cannot undo it. Restoring the product requires inventing supplier-credential details the agency never had, which replaces one wrong state with another, or a direct database correction. On a live agency this silently changes what the agency is able to sell.

**10. Classification**

| Field | Value |
|---|---|
| **Category** | Workflow — a state transition that cannot be reversed through the interface that performed it |
| **Layer** | Frontend — the block is client-side form validation on a panel the client itself renders empty |
| **Reproducibility** | Always — four independent attempts, each refused with the same two Required markers: plain re-select and save; re-select with a wait for the section to repopulate; re-select with the stored credential row explicitly ticked; and clicking the stored row to load it into the panel |
| **Regression** | Unknown — no earlier execution of this case exists to compare against |
| **Suspected Component** | Select Product / supplier-credential panel on the Update Agency form |
| **Confidence** | High — reproduced four ways, with the refusal message located and attributed to two named fields each time |

**11. Root Cause Analysis:** The credential panel appears to be an "add a credential" form whose validators activate once the product group is marked dirty, rather than a view of the credential already attached. That would explain why the record saved normally for the whole run while the product selection was untouched, and refuses only after the selection is changed. This is an inference from the observed behaviour, not something this run established.

**12. Conclusion:** Deselecting a product is irreversible through the UI, and it destroys the product's supplier-credential configuration.

**13. Severity:** High — a reversible-looking action is not reversible, and it changes commercial capability on a live record.

**14. Priority:** P1

**15. Evidence:**

| Evidence | Path |
|---|---|
| Screenshot — the product deselected and persisted | `manual_execution/artifacts/TC-AGENCY-041.png` |
| Per-case record, including all four restoration attempts | `manual_execution/ManualExecutionResults.md` §5 |

## 4. Evidence Inventory

| Test Case ID | Evidence Type | Path | Captured? | Gap Reason |
|---|---|---|---|---|
| TC-AGENCY-001 | Screenshot | `manual_execution/artifacts/TC-AGENCY-001.png` | Yes | — |
| TC-AGENCY-002 | Screenshot | `manual_execution/artifacts/TC-AGENCY-002_kbd.png` | Yes | — |
| TC-AGENCY-003 | Screenshot | `manual_execution/artifacts/TC-AGENCY-003_rerun.png` | Yes | — |
| TC-AGENCY-008 | Screenshot | `manual_execution/artifacts/TC-AGENCY-008_kbd.png` | Yes | — |
| TC-AGENCY-011 | Screenshot | `manual_execution/artifacts/TC-AGENCY-011.png` | Yes | — |
| TC-AGENCY-012 | Screenshot | `manual_execution/artifacts/TC-AGENCY-012.png` | Yes | — |
| TC-AGENCY-013 | Screenshot | `manual_execution/artifacts/TC-AGENCY-013_kbd.png` | Yes | — |
| TC-AGENCY-014 | Screenshot | `manual_execution/artifacts/TC-AGENCY-014_kbd.png` | Yes | — |
| TC-AGENCY-015 | Screenshot | `manual_execution/artifacts/TC-AGENCY-015_kbd.png` | Yes | — |
| TC-AGENCY-016 | Screenshot | `manual_execution/artifacts/TC-AGENCY-016.png` | Yes | — |
| TC-AGENCY-017 | Screenshot | `manual_execution/artifacts/TC-AGENCY-017.png` | Yes | — |
| TC-AGENCY-018 | Screenshot | `manual_execution/artifacts/TC-AGENCY-018.png` | Yes | — |
| TC-AGENCY-020 | Screenshot | `manual_execution/artifacts/TC-AGENCY-020.png` | Yes | — |
| TC-AGENCY-021 | Screenshot | `manual_execution/artifacts/TC-AGENCY-021_rerun.png` | Yes | — |
| TC-AGENCY-022 | Screenshot | `manual_execution/artifacts/TC-AGENCY-022.png` | Yes | — |
| TC-AGENCY-023 | Screenshot | `manual_execution/artifacts/TC-AGENCY-023.png` | Yes | — |
| TC-AGENCY-024 | Screenshot | `manual_execution/artifacts/TC-AGENCY-024.png` | Yes | — |
| TC-AGENCY-027 | Screenshot | `manual_execution/artifacts/TC-AGENCY-027_kbd.png` | Yes | — |
| TC-AGENCY-033 | Screenshot | `manual_execution/artifacts/TC-AGENCY-033.png` | Yes | — |
| TC-AGENCY-034 | Screenshot | `manual_execution/artifacts/TC-AGENCY-034_kbd.png` | Yes | — |
| TC-AGENCY-035 | Screenshot | `manual_execution/artifacts/TC-AGENCY-035_kbd.png` | Yes | — |
| TC-AGENCY-036 | Screenshot | `manual_execution/artifacts/TC-AGENCY-036.png` | Yes | — |
| TC-AGENCY-037 | Screenshot | `manual_execution/artifacts/TC-AGENCY-037_network.json` | Yes | — |
| TC-AGENCY-037 | Screenshot | `manual_execution/artifacts/TC-AGENCY-037_network_final.png` | Yes | — |
| TC-AGENCY-037 | Screenshot | `manual_execution/artifacts/TC-AGENCY-037_realclick.png` | Yes | — |
| TC-AGENCY-039 | Screenshot | `manual_execution/artifacts/TC-AGENCY-039.png` | Yes | — |
| TC-AGENCY-040 | Screenshot | `manual_execution/artifacts/TC-AGENCY-040_product_access_grid.png` | Yes | — |
| TC-AGENCY-041 | Screenshot | `manual_execution/artifacts/TC-AGENCY-041.png` | Yes | — |
| TC-AGENCY-042 | Screenshot | `manual_execution/artifacts/TC-AGENCY-042_readonly_columns.png` | Yes | — |
| TC-AGENCY-044 | Screenshot | `manual_execution/artifacts/TC-AGENCY-044_rerun.png` | Yes | — |
| TC-AGENCY-045 | Screenshot | `manual_execution/artifacts/TC-AGENCY-045.png` | Yes | — |
| TC-AGENCY-046 | Screenshot | `manual_execution/artifacts/TC-AGENCY-046_rerun.png` | Yes | — |
| TC-AGENCY-047 | Screenshot | `manual_execution/artifacts/TC-AGENCY-047.png` | Yes | — |
| TC-AGENCY-048 | Screenshot | — | No | The case was never executed (Blocked), so there was no execution to capture. |
| TC-AGENCY-049 | Screenshot | — | No | The case was never executed (Blocked), so there was no execution to capture. |
| TC-AGENCY-050 | Screenshot | — | No | The case was never executed (Blocked), so there was no execution to capture. |
| TC-AGENCY-051 | Screenshot | `manual_execution/artifacts/TC-AGENCY-051.png` | Yes | — |
| TC-AGENCY-052 | Screenshot | — | No | The case was never executed (Skipped), so there was no execution to capture. |
| TC-AGENCY-053 | Screenshot | `manual_execution/artifacts/TC-AGENCY-053.png` | Yes | — |

**Evidence root:** `platform_core_data/runs/run-001__2026-07-31_11-56-38__UserStory__US-4222UpdateAgency/manual_execution/artifacts/`

Console and network logs were not captured as a matter of routine, because the cases assert user-visible
outcomes. One exception: TC-AGENCY-037 was re-run with a full network capture in order to settle a
disagreement between the harness and the reviewer's manual observation, and that capture is retained at
`manual_execution/artifacts/TC-AGENCY-037_network.json`. Video was not captured — the tooling recorded
still evidence per case instead.

Three non-image files sit alongside the screenshots, each supporting a claim made above rather than left as an
unexplained dump:

| File | What it is | The claim it supports |
|---|---|---|
| `BASELINE_AGN2_verified.json` | The 74-value reference state every case was checked against | §5 — that the record was restored, and to what |
| `PerCaseExecutionRecord.json` | The per-case record behind §3: values observed before and after each case, each revert, each full-state comparison, and the harness-validation verdict for every interaction type | Every status in §3, at a level of detail the table cannot carry |
| `TC-AGENCY-037_network.json` | The submit request, payload, status and response captured for TC-AGENCY-037 | The Blocked classification — the request carried a payment option the visible controls showed as cleared |

## 5. Outstanding Change to the Environment

<!-- Reported at the top level rather than inside a case record, because it is the one thing a reader must
     not miss: the environment was NOT returned to its pre-run state in full. -->

**One change remains on agency `AGN2 — Test Egypt`.** The `Flight` product is still **deselected**, and the
supplier-credential grid row and the dropdown holding `10` that belonged to it are gone.

It could not be restored, and §3.2 explains why: the application will not save a re-selected product without
supplier-credential values the agency never held. Four restoration routes were attempted and all four were
refused. Restoring it requires either entering data the record did not previously contain, or a database
correction — a decision for the reviewer, not for this stage.

**Decision taken (2026-08-02, reviewer): restore in the database**, so that no invented credential data enters
the record. The target state below is what the form displayed before the change, read from the verified
baseline; it is stated as observable form state rather than as table names, because this stage never inspected
the schema and should not guess at it.

| What | Before the run (target) | Now |
|---|---|---|
| `Select Product` → `Flight` | selected | **not selected** |
| `Select Product` → `Others` | selected | selected (unchanged) |
| Supplier credential grid row | `Sabre` · credential name empty · product `Flight` · description empty, with its selection checkbox ticked | row absent from the form |
| Product dropdown beside that row | `10` | control absent |
| Everything else on the record | see `artifacts/BASELINE_AGN2_verified.json` | matches |

Agency is `AGN2 — Test Egypt`, reached at `/admin/agency/edit/949`. After the correction, reopening the form
should show `Flight` selected, the `Sabre` row present and ticked, and the dropdown reading `10`; the
published baseline file can be diffed against the reopened form to confirm the whole record, not just this
part of it.

Everything else this run touched was restored and re-verified against a 74-value baseline — 25 text fields and
textareas, 38 checkboxes and radios, 8 dropdowns, the uploaded document filenames, the stored logo path and the
supplier grid. That reference state is published alongside the evidence as
`manual_execution/artifacts/BASELINE_AGN2_verified.json`, so the restoration claims here can be checked rather
than taken on trust. It includes
both files replaced during the upload cases: the original document `screen-1-logo-black-and-white.png` and the
original logo, whose stored path is once again `/fstore/org/Test/2026/08/Test Egypt/Capture1.JPG`.

One further difference is recorded for completeness and was **not** caused by this run: the Product Access
grid changed from two supplier rows (`SalamAir`, `FlyNas`) to a single `Sabre` row between two clean
verifications, with no action from this run in between. It is a read-only list populated from supplier
credentials configured elsewhere, so the baseline reference was re-anchored to the new value rather than
overwriting somebody else's configuration.
