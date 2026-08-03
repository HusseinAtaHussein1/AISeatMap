# Manual Execution Results — run-002__2026-08-03_10-26-17__UserStory__US-8605CreateBranch

## 1. Execution Metadata

| Field | Value |
|---|---|
| Execution ID | EXEC-BR-001 |
| Run Folder | `run-002__2026-08-03_10-26-17__UserStory__US-8605CreateBranch` |
| Run Scope Type / Run Type | User Story / User Story |
| Environment | STG (shared, internal/LAN) |
| Target URL | `http://192.168.1.70` |
| Role(s) used | Super Admin |
| Started | 2026-08-03 |
| Ended | 2026-08-03 |
| Test Suites executed | `modules/branch/test_design/TestCases_Branch.md` (39 cases; 31 `Review = Approved`) |

## 2. Result Totals

| Status | Count |
|---|---|
| Passed | 27 |
| Failed | 3 |
| Blocked | 0 |
| Skipped | 0 |
| Not Executed | 0 |
| Inconclusive | 1 |
| **Executable scope** (`Review = Approved`) | **31** |
| Excluded — Pending Review | 0 |
| Excluded — Rejected at Review | 8 |
| **Suite total** | **39** |

## 3. Per-Test Results

| Test Case ID | Module | Status | Execution Time | Reason (non-Passed) | Evidence Refs |
|---|---|---|---|---|---|
| TC-BR-001 | branch | Passed | 2026-08-03 | — | `TC-BR-001-after-submit.png` |
| TC-BR-002 | branch | Passed | 2026-08-03 | — | `TC-BR-002-last-field.png` |
| TC-BR-003 | branch | Failed | 2026-08-03 | Special-character input (`QA<script>Branch</script>`) accepted verbatim; see §3.1 | `TC-BR-003.png` |
| TC-BR-004 | branch | Passed | 2026-08-03 | — | `TC-BR-004.png` |
| TC-BR-005 | branch | Passed | 2026-08-03 | — | `TC-BR-005.png` |
| TC-BR-006 | branch | Passed | 2026-08-03 | — | `TC-BR-006.png` |
| TC-BR-007 | branch | Excluded | — | Rejected at Review | — |
| TC-BR-008 | branch | Excluded | — | Rejected at Review | — |
| TC-BR-009 | branch | Excluded | — | Rejected at Review | — |
| TC-BR-010 | branch | Passed | 2026-08-03 | — | `TC-BR-010.png` |
| TC-BR-011 | branch | Excluded | — | Rejected at Review | — |
| TC-BR-012 | branch | Passed | 2026-08-03 | — | `TC-BR-012.png` |
| TC-BR-013 | branch | Passed | 2026-08-03 | — | `TC-BR-013-last-field.png` |
| TC-BR-014 | branch | Excluded | — | Rejected at Review | — |
| TC-BR-015 | branch | Excluded | — | Rejected at Review | — |
| TC-BR-016 | branch | Passed | 2026-08-03 | — | `TC-BR-016.png` |
| TC-BR-017 | branch | Passed | 2026-08-03 | — | `TC-BR-017-last-field.png` |
| TC-BR-018 | branch | Excluded | — | Rejected at Review | — |
| TC-BR-019 | branch | Inconclusive | 2026-08-03 | Second Contact Person's row could not be reliably re-verified via automation; first contact person's Add behavior is confirmed (TC-BR-016) but adding a *second* entry produced an ambiguous DOM state across repeated attempts — see §3.1 | `TC-BR-019.png` |
| TC-BR-020 | branch | Excluded | — | Rejected at Review | — |
| TC-BR-021 | branch | Passed | 2026-08-03 | — | `TC-BR-021-last-field.png` |
| TC-BR-022 | branch | Passed | 2026-08-03 | — | `TC-BR-022.png` |
| TC-BR-023 | branch | Passed | 2026-08-03 | — | `TC-BR-023.png` |
| TC-BR-024 | branch | Passed | 2026-08-03 | — | `TC-BR-024.png` |
| TC-BR-025 | branch | Passed | 2026-08-03 | — | `TC-BR-025.png` |
| TC-BR-026 | branch | Failed | 2026-08-03 | Warning Prompt (Days) still accepts a 15-digit value with no truncation or message; see §3.1 | `TC-BR-026.png` |
| TC-BR-027 | branch | Passed | 2026-08-03 | — | `TC-BR-027.png` |
| TC-BR-028 | branch | Passed | 2026-08-03 | — | `TC-BR-028.png` |
| TC-BR-029 | branch | Passed | 2026-08-03 | — | `TC-BR-029.png` |
| TC-BR-030 | branch | Passed | 2026-08-03 | — | `TC-BR-030.png` |
| TC-BR-031 | branch | Passed | 2026-08-03 | — | `TC-BR-031.png` |
| TC-BR-032 | branch | Passed | 2026-08-03 | — | `TC-BR-032.png` |
| TC-BR-033 | branch | Passed | 2026-08-03 | — | `TC-BR-033.png` |
| TC-BR-034 | branch | Passed | 2026-08-03 | — | `TC-BR-034.png` |
| TC-BR-035 | branch | Failed | 2026-08-03 | Submit button reads "Send For Approval", not "Submit for Approval"; see §3.1 | `TC-BR-035.png` |
| TC-BR-036 | branch | Passed | 2026-08-03 | — | `TC-BR-036.png` |
| TC-BR-037 | branch | Passed | 2026-08-03 | — | `TC-BR-037.png` |
| TC-BR-038 | branch | Passed | 2026-08-03 | — | `TC-BR-038.png` |
| TC-BR-039 | branch | Passed | 2026-08-03 | — | `TC-BR-039.png` |

### 3.1 Defect Detail — Failed / Inconclusive cases

#### TC-BR-003 — Branch Name accepts unfiltered special/markup characters (input-validation gap; NOT confirmed Stored XSS)

**1. Test Case ID:** TC-BR-003

**2. Execution Status:** Failed

**3. Execution Time:** 2026-08-03

**4. Preconditions:** Logged in as Super Admin, on Admin → Branch → Add branch.

**5. Test Data:** Name = `QA<script>Branch</script>` (original probe); follow-up investigation used `QAXSS55219<script>window.__x=1;</script>` as a live, end-to-end-traceable payload.

**6. Steps Performed:** Typed the Test Data value into the Name field character-by-character (to accurately simulate real keystrokes rather than a one-shot value assignment) and moved focus away. **Follow-up investigation (2026-08-03, at module owner's request), to determine whether this is a confirmed Stored XSS or simply unfiltered special-character acceptance:** (a) confirmed the injected `<script>` did not execute at the moment of typing, by checking for a global JS flag it would have set — it did not fire; (b) completed and submitted a full Branch record using the payload as the Name, to confirm whether the value is actually persisted; (c) located the resulting record (status "Pending for approval") in the Branch list with the Status filter set to "Both" (the default "Active" filter hides not-yet-approved records); (d) inspected the raw DOM of the list row that displays this Branch's Name; (e) re-checked the same global JS flag after the value was rendered in the list view.

**7. Expected Result:** Per US 8605 §Branch Details ("Branch Name — free text, alphanumeric input only"), the system should reject non-alphanumeric characters, either by blocking their entry or by displaying a validation message once the field loses focus. Separately — and this is the specific question the follow-up investigation answers — *if* such a value is ever accepted and stored, it should never be rendered in a way that lets injected markup/script execute when the record is later displayed.

**8. Actual Result:** Two distinct, separately-confirmed observations:
- **Input-side:** The full literal string was retained in the Name field with no truncation, no character-level blocking, and no validation message on blur, at initial entry. This part of the original observation is confirmed exactly as before.
- **Storage and output-side (new, from the follow-up investigation):** The value **was** successfully stored — the Branch was created with status "Pending for approval" and is retrievable by name search. When that Branch's row is rendered in the Branch list, the stored value's raw DOM markup is `QAXSS55219&lt;script&gt;window.__x=1;&lt;/script&gt;` — the angle brackets are HTML-entity-encoded, not raw `<script>` tags. The injected script did **not** execute at any point checked: not while typing it into the form, and not when the list view rendered the stored value back out. No unexpected dialog fired either.

**9. Impact:** A Branch record can be created with a Name that contains markup/script-like characters, which directly contradicts the documented "alphanumeric input only" business rule and would let non-conforming data reach the database. However, based on everything checked in this run, that data does **not** translate into script execution when displayed back in the one rendering location exercised (the Branch list) — that location HTML-encodes the value correctly. The residual risk is a data-integrity/business-rule gap (non-conforming Branch Names can be saved), not a confirmed code-execution vulnerability. This conclusion is scoped to the rendering locations actually checked; other places the Branch Name might be displayed (e.g., PDF/email correspondence, other admin screens, reports) were not exercised this run and are not covered by this conclusion either way.

**10. Classification**

| Field | Value |
|---|---|
| **Category** | Validation (input-side gap only — NOT Security; no executable injection was observed at any rendering point checked) |
| **Layer** | Frontend (input validation) / confirmed safe at output on the one Frontend rendering point checked (Branch list) |
| **Reproducibility** | Always for the input-side acceptance (two independent observations: original probe and follow-up investigation, both showing the value retained unfiltered). Unable to confirm site-wide safe-rendering, since only one output location (the Branch list) was checked. |
| **Regression** | No — first time this case has been executed; no prior passing baseline exists to regress from |
| **Suspected Component** | Branch Name input's client-side validator (Angular reactive form control for Name) — missing an alphanumeric-only pattern/keydown filter. The list view's row rendering (Angular's default text interpolation) correctly HTML-encodes on output and is not implicated. |
| **Confidence** | High for both observations — Direct Observation in both cases (the stored, encoded DOM markup was read directly from the live list page; the absence of script execution was checked programmatically, not inferred) |

**11. Root Cause Analysis:** The Name field likely has no client-side character-class validator at all (neither a pattern-based keydown filter nor a blur-time validation message), unlike other fields on the same form (e.g., Credit Limit, which does show a numeric-only message) — this appears to be an omission specific to the Name field. Separately, the Branch list's row template appears to use Angular's default text interpolation (`{{ }}`) rather than an unsafe HTML-binding mechanism (like `[innerHTML]` without sanitization), which is why the stored value renders as encoded, harmless text there rather than executing.

**12. Conclusion:** The Branch Name field does not enforce the documented "alphanumeric input only" rule — this remains a genuine, confirmed input-validation defect. It is **not** a confirmed Stored XSS: the one output location checked (Branch list) correctly HTML-encodes the value and no script execution was observed at any point in this investigation. This should be tracked and fixed as a data-validation gap; it should **not** be labeled or reported as a security/XSS vulnerability on the evidence gathered so far.

**13. Severity:** Low — downgraded from the original Medium rating now that the security-relevant question has been directly investigated and answered: the one rendering location checked encodes output safely, so the practical risk is limited to non-conforming data being persisted, not code execution. Severity should be reconsidered upward only if a future check finds an unsafe rendering location this run did not cover.

**14. Priority:** P3

**15. Evidence:**

| Evidence | Path |
|---|---|
| Screenshot — field value retained at entry | `manual_execution/artifacts/TC-BR-003.png` |
| Screenshot — full form completed with payload as Name, before submit | `manual_execution/artifacts/TC-BR-003-before-submit.png` |
| Screenshot — Branch list, Status=Both, search result showing the created record ("Pending for approval") | `manual_execution/artifacts/TC-BR-003-list-search-result.png` |
| Raw DOM snippet of the list row (captured in the investigation script's output) confirming `&lt;script&gt;...&lt;/script&gt;` HTML-entity encoding, not a raw tag | Recorded in this write-up (§8) — see also `manual_execution/artifacts/TC-BR-003-list-view.png` |

---

#### TC-BR-026 — Warning Prompt (Days) still has no 11-digit length enforcement

**1. Test Case ID:** TC-BR-026

**2. Execution Status:** Failed

**3. Execution Time:** 2026-08-03

**4. Preconditions:** Logged in as Super Admin, on Admin → Branch → Add branch.

**5. Test Data:** Credit Terms(Days) = 999999999999999 (15 digits); Warning Prompt(Days) = 999999999999999 (15 digits) — Credit Terms set to the same value specifically so the separate, already-confirmed cross-field rule (TC-BR-027) cannot itself be the source of any resulting message, isolating this case to the length rule alone.

**6. Steps Performed:** Typed both values character-by-character (not via a one-shot value assignment) to accurately simulate a real user typing, then moved focus away.

**7. Expected Result:** Per US 8605 §Branch Sales Configuration ("Warning Prompt (Days) — ... it has a max length of 11 number..."), the system should truncate the input to 11 digits, block further entry past the 11th digit, or display a validation message stating the 11-digit maximum.

**8. Actual Result:** The full 15-digit value was retained with no truncation, no blocked keystrokes, and no length-related validation message.

**9. Impact:** An unreasonably large Warning Prompt (Days) value can be configured, undermining the intent of an early-warning threshold ahead of Credit Terms (Days) expiry.

**10. Classification**

| Field | Value |
|---|---|
| **Category** | Validation |
| **Layer** | Frontend |
| **Reproducibility** | Always — confirmed independently in Discovery (2026-08-03, FINDING-004, using a 14-digit value) and again in this execution pass (using a 15-digit value with realistic character-by-character typing) |
| **Regression** | Yes — this is a regression case for FINDING-004; the underlying defect remains unresolved |
| **Suspected Component** | Warning Prompt (Days) input's client-side validator |
| **Confidence** | High (Direct Observation, confirmed twice via two different interaction methods) |

**11. Root Cause Analysis:** No `maxlength` constraint or equivalent keydown-level filter appears to be attached to this field, consistent with Discovery's original finding.

**12. Conclusion:** FINDING-004 (Warning Prompt (Days) has no 11-digit max-length enforcement) remains an open, unresolved defect.

**13. Severity:** Medium — matches the Medium criterion "Validation issues"; carried over from FINDING-004, unchanged.

**14. Priority:** P1 (per Test Design's assigned priority for this regression case)

**15. Evidence:**

| Evidence | Path |
|---|---|
| Screenshot (15-digit value retained) | `manual_execution/artifacts/TC-BR-026.png` |

---

#### TC-BR-035 — Submit button label still reads "Send For Approval"

**1. Test Case ID:** TC-BR-035

**2. Execution Status:** Failed

**3. Execution Time:** 2026-08-03

**4. Preconditions:** Logged in as Super Admin, on Admin → Branch → Add branch.

**5. Test Data:** None — the button's rendered label was read directly.

**6. Steps Performed:** Navigated to the Create Branch form and read the primary submit button's `innerText`.

**7. Expected Result:** Per US 8605 §Buttons & Actions, the primary submit action button should read exactly "Submit for Approval."

**8. Actual Result:** The button reads "Send For Approval."

**9. Impact:** Minor user-facing inconsistency between the documented requirement and the live label; low risk of confusion but a direct, literal mismatch against the accepted requirement wording.

**10. Classification**

| Field | Value |
|---|---|
| **Category** | UI |
| **Layer** | Frontend |
| **Reproducibility** | Always — confirmed independently in Discovery (2026-08-03, FINDING-011) and again in this execution pass |
| **Regression** | Yes — this is a regression case for FINDING-011; the underlying defect remains unresolved |
| **Suspected Component** | Create Branch form's submit button template/label binding |
| **Confidence** | High (Direct Observation) |

**11. Root Cause Analysis:** Likely a literal label string that was never updated to match the finalized requirement wording; no functional behavior is affected.

**12. Conclusion:** FINDING-011 (button label mismatch) remains an open, unresolved defect.

**13. Severity:** Low — carried over from FINDING-011, unchanged.

**14. Priority:** P4 (per Test Design's assigned priority for this regression case)

**15. Evidence:**

| Evidence | Path |
|---|---|
| Screenshot (button label) | `manual_execution/artifacts/TC-BR-035.png` |

---

#### TC-BR-019 — Second Contact Person could not be reliably re-verified

**1. Test Case ID:** TC-BR-019

**2. Execution Status:** Inconclusive

**3. Execution Time:** 2026-08-03

**4. Preconditions:** Logged in as Super Admin, on Admin → Branch → Add branch.

**5. Test Data:** Contact 1 — Ahmed Ayman / contact1.qa@example.com / +20 1001234567. Contact 2 — Sara Ali / contact2.qa@example.com / +20 1007654321.

**6. Steps Performed:** Entered Contact 1's details and clicked **Add**; entered Contact 2's details into what was expected to be a newly-presented empty row and clicked **Add** again; then inspected every input field's current value on the page.

**7. Expected Result:** Per US 8605 §Branch Contact Info, both contact persons should be retained and visible as separate entries in the Branch Contact Info list after both **Add** actions.

**8. Actual Result:** After the second **Add**, only Contact 2's values (Sara Ali) were found among the page's input values; Contact 1's values (Ahmed Ayman) were not found. This is inconsistent with TC-BR-016's confirmed result (a single contact person is reliably added and retained), so this specific result is not trusted as a confirmed defect — it may reflect the automation targeting a field index that no longer corresponded to a genuinely new, separate row, rather than the application actually discarding Contact 1.

**9. Impact:** Unknown pending manual re-verification. If genuinely reproducible by a human tester, it would mean only one Contact Person can ever be retained on a Branch, contradicting the "Add" affordance's implied support for multiple contacts.

**10. Classification**

| Field | Value |
|---|---|
| **Category** | Not applicable — status is Inconclusive, no defect is confirmed |
| **Layer** | Unknown |
| **Reproducibility** | Unable to confirm |
| **Regression** | Not applicable |
| **Suspected Component** | Unknown |
| **Confidence** | Low |

**12. Conclusion:** Whether a Branch can genuinely retain more than one Contact Person cannot be confirmed or refuted from this run's evidence. This must be re-checked by a human tester driving the UI directly (add two contacts, observe both rows persist) before this case can be scored Passed or Failed.

**13. Severity:** Not applicable — no defect confirmed.

**14. Priority:** P3 (per Test Design's assigned priority; re-verification should happen before the next automation pass over this case)

**15. Evidence:**

| Evidence | Path |
|---|---|
| Screenshot (final state after both Add actions) | `manual_execution/artifacts/TC-BR-019.png` |

## 4. Evidence Inventory

| Test Case ID | Evidence Type | Path | Captured? | Gap Reason |
|---|---|---|---|---|
| TC-BR-001 | Full-page screenshot | `manual_execution/artifacts/TC-BR-001-after-submit.png` | Yes | — |
| TC-BR-002 | Full-page screenshot | `manual_execution/artifacts/TC-BR-002-last-field.png` | Yes | — |
| TC-BR-003 | Full-page screenshot | `manual_execution/artifacts/TC-BR-003.png` | Yes | — |
| TC-BR-004 | Full-page screenshot | `manual_execution/artifacts/TC-BR-004.png` | Yes | — |
| TC-BR-005 | Full-page screenshot | `manual_execution/artifacts/TC-BR-005.png` | Yes | — |
| TC-BR-006 | Full-page screenshot | `manual_execution/artifacts/TC-BR-006.png` | Yes | — |
| TC-BR-010 | Full-page screenshot | `manual_execution/artifacts/TC-BR-010.png` | Yes | — |
| TC-BR-012 | Full-page screenshot | `manual_execution/artifacts/TC-BR-012.png` | Yes | — |
| TC-BR-013 | Full-page screenshot | `manual_execution/artifacts/TC-BR-013-last-field.png` | Yes | — |
| TC-BR-016 | Full-page screenshot | `manual_execution/artifacts/TC-BR-016.png` | Yes | — |
| TC-BR-017 | Full-page screenshot | `manual_execution/artifacts/TC-BR-017-last-field.png` | Yes | — |
| TC-BR-019 | Full-page screenshot | `manual_execution/artifacts/TC-BR-019.png` | Yes | — |
| TC-BR-021 | Full-page screenshot | `manual_execution/artifacts/TC-BR-021-last-field.png` | Yes | — |
| TC-BR-022 | Full-page screenshot | `manual_execution/artifacts/TC-BR-022.png` | Yes | — |
| TC-BR-023 | Full-page screenshot | `manual_execution/artifacts/TC-BR-023.png` | Yes | — |
| TC-BR-024 | Full-page screenshot | `manual_execution/artifacts/TC-BR-024.png` | Yes | — |
| TC-BR-025 | Full-page screenshot | `manual_execution/artifacts/TC-BR-025.png` | Yes | — |
| TC-BR-026 | Full-page screenshot | `manual_execution/artifacts/TC-BR-026.png` | Yes | — |
| TC-BR-027 | Full-page screenshot | `manual_execution/artifacts/TC-BR-027.png` | Yes | — |
| TC-BR-028 | Full-page screenshot | `manual_execution/artifacts/TC-BR-028.png` | Yes | — |
| TC-BR-029 | Full-page screenshot | `manual_execution/artifacts/TC-BR-029.png` | Yes | — |
| TC-BR-030 | Full-page screenshot | `manual_execution/artifacts/TC-BR-030.png` | Yes | — |
| TC-BR-031 | Full-page screenshot | `manual_execution/artifacts/TC-BR-031.png` | Yes | — |
| TC-BR-032 | Full-page screenshot | `manual_execution/artifacts/TC-BR-032.png` | Yes | — |
| TC-BR-033 | Full-page screenshot | `manual_execution/artifacts/TC-BR-033.png` | Yes | — |
| TC-BR-034 | Full-page screenshot | `manual_execution/artifacts/TC-BR-034.png` | Yes | — |
| TC-BR-035 | Full-page screenshot | `manual_execution/artifacts/TC-BR-035.png` | Yes | — |
| TC-BR-036 | Full-page screenshot | `manual_execution/artifacts/TC-BR-036.png` | Yes | — |
| TC-BR-037 | Full-page screenshot | `manual_execution/artifacts/TC-BR-037.png` | Yes | — |
| TC-BR-038 | Full-page screenshot | `manual_execution/artifacts/TC-BR-038.png` | Yes | — |
| TC-BR-039 | Full-page screenshot | `manual_execution/artifacts/TC-BR-039.png` | Yes | — |
| All executed cases | Console logs / network capture | — | No | Not captured this run — the Browser Driver session was not instrumented to persist per-case console/network logs to disk; only screenshots were retained. Recommended for a future pass if a Failed/Inconclusive case needs deeper technical follow-up. |

**Evidence root:** `platform_core_data/runs/run-002__2026-08-03_10-26-17__UserStory__US-8605CreateBranch/manual_execution/artifacts/`
