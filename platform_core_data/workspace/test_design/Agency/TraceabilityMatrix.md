# NDC — Requirement Traceability Matrix — Admin / Agency (Create · Search · Update · Actions)

> **Approved** 2026-07-18 (user) — copied here from `runs/RUN-20260718-001/test_design/` as the current latest-approved state, per `workspace/test_design/README.md`. **Extended 2026-07-25** with a new "Test Case Reference" appendix (Risk/Acceptance Criteria/Run Scope, keyed by Test Case ID) when `TestCases_Agency.md` was rewritten to the Canonical Test Case Writing Standard — the Requirement-ID-centric rows below are otherwise unchanged in content.

**Run:** RUN-20260718-001 · **Run Scope:** User Story / Pasted text (four jointly-scoped User Stories) · **Project Context:** `context/ProjectContext_Agency.md` (single living document, not versioned — per explicit user instruction 2026-07-18) · **Test Suite:** `test_design/TestCases_Agency.md` / `.xlsx`

Maps every Requirement ID from Project Context v4 §2 to the Test Case ID(s) that cover it, annotated with Discovery/Finding/Evidence status. "Coverage" values use the full category set from `agents/test_design_agent.md` §8.3 (Covered / Partially Covered / Out-of-Scope / Unknown-Unassessed) — see `CoverageReport.md` for the consolidated accounting.

## Agency Master Section

| Req. ID | Test Case(s) | Discovery status | Finding/Evidence | Coverage |
|---|---|---|---|---|
| FR-AGCRT-MASTER-01 (Branch) | TC-AGENCY-CREATE-001, -002 | Validated — `Agency_Add.md` | N/A | Covered |
| FR-AGCRT-MASTER-02 (Agency Name) | TC-AGENCY-CREATE-001, -002, -003, -004, -038, -039 | Validated (base field) / Not independently verified (special-char/length/security/unicode sub-cases) | N/A | Covered |
| FR-AGCRT-MASTER-03 (Country, read only) | TC-AGENCY-CREATE-008 | Not independently verified in Discovery | N/A | Covered |
| FR-AGCRT-MASTER-04 (State) | TC-AGENCY-CREATE-001, -002 | Validated — `Agency_Add.md` | N/A | Covered |
| FR-AGCRT-MASTER-05 (City) | TC-AGENCY-CREATE-001, -002 | Validated — `Agency_Add.md` | N/A | Covered |
| FR-AGCRT-MASTER-06 (IATA Agency) | TC-AGENCY-CREATE-009 | Not independently verified in Discovery | N/A | Covered |
| FR-AGCRT-MASTER-07 (Post Office Box) | TC-AGENCY-CREATE-001, -002, -005 | Validated (truncation note) — `TestCases_Agency.md` (RUN-20260712-002) TC-AGENCY-001 | N/A | Covered |
| FR-AGCRT-MASTER-08 (Company URL) | TC-AGENCY-CREATE-006 | Not independently verified in Discovery | N/A | Covered |
| FR-AGCRT-MASTER-09 (Phone no.) | TC-AGENCY-CREATE-001, -002, -007 | Validated — `RunManifest.md` RUN-20260713-001; resolved 2026-07-18 | `knowledge_base/business_rules/BR-005.md` | Covered — resolved 2026-07-18 (national number only, confirmed by design) |
| FR-AGCRT-MASTER-10 (Address 1) | TC-AGENCY-CREATE-001, -002, -038, -039 | Validated — `Agency_Add.md` | N/A | Covered |
| FR-AGCRT-MASTER-11 (Address 2) | TC-AGENCY-CREATE-038, -039 | Not independently verified in Discovery | N/A | Partially Covered — only Security/Unicode probes exist; no dedicated positive/optional-blank case |

## Agency Owner Details Section

| Req. ID | Test Case(s) | Discovery status | Finding/Evidence | Coverage |
|---|---|---|---|---|
| FR-AGCRT-OWNER-01 (Contact Person) | TC-AGENCY-CREATE-001, -002, -010, -011 | Validated — FINDING-006 | FINDING-006 / `knowledge_base/business_rules/BR-001.md` | Covered |
| FR-AGCRT-OWNER-02 (Email ID) | TC-AGENCY-CREATE-001, -002, -012 | Not independently verified in Discovery | N/A | Covered |
| FR-AGCRT-OWNER-03 (Phone No.) | TC-AGENCY-CREATE-001, -002, -007 | Validated; resolved 2026-07-18 | `knowledge_base/business_rules/BR-005.md` | Covered — resolved 2026-07-18 |

## Upload Document Details Section

| Req. ID | Test Case(s) | Discovery status | Finding/Evidence | Coverage |
|---|---|---|---|---|
| FR-AGCRT-DOC-01 (Choose documents) | TC-AGENCY-CREATE-001, -002, -013 | Validated — `Agency_Add.md` | N/A | Covered |
| FR-AGCRT-DOC-02 (Contract Start Date) | TC-AGENCY-CREATE-001, -002, -014 | Validated — `Agency_Add.md` | N/A | Covered |
| FR-AGCRT-DOC-03 (Contract End Date) | TC-AGENCY-CREATE-001, -002, -014 | Validated — `Agency_Add.md` | N/A | Covered |
| FR-AGCRT-DOC-04 (Upload button) | TC-AGENCY-CREATE-015 | Not independently verified in Discovery | N/A | Covered |
| FR-AGCRT-DOC-05 (multiple documents) | TC-AGENCY-CREATE-015 | Not independently verified in Discovery | N/A | Covered |
| FR-AGCRT-DOC-06 (names displayed) | TC-AGENCY-CREATE-015 | Not independently verified in Discovery | N/A | Covered |
| FR-AGCRT-DOC-07 (remove/update) | TC-AGENCY-CREATE-016 | Not independently verified in Discovery | N/A | Covered |

## Agency Logo Details Section

| Req. ID | Test Case(s) | Discovery status | Finding/Evidence | Coverage |
|---|---|---|---|---|
| FR-AGCRT-LOGO-01 (Logo) | TC-AGENCY-CREATE-001, -002, -017 | Validated — `Agency_Add.md` | N/A | Covered |
| FR-AGCRT-LOGO-02 (preview before submit) | TC-AGENCY-CREATE-018 | Not independently verified in Discovery | N/A | Covered |

## Wonder Travel Sales Contact Section

| Req. ID | Test Case(s) | Discovery status | Finding/Evidence | Coverage |
|---|---|---|---|---|
| FR-AGCRT-SALES-01 (Name) | TC-AGENCY-CREATE-001, -002, -010, -011 | Validated (base) / enrichment from FINDING-006 (Contact Person, not this exact field) | N/A | Covered |
| FR-AGCRT-SALES-02 (Designation) | TC-AGENCY-CREATE-021 | Not independently verified in Discovery | N/A | Covered |
| FR-AGCRT-SALES-03 (Email ID) | TC-AGENCY-CREATE-001, -002, -012 | Not independently verified in Discovery | N/A | Covered |
| FR-AGCRT-SALES-04 (Phone No.) | TC-AGENCY-CREATE-001, -002, -007 | Validated; resolved 2026-07-18 | `knowledge_base/business_rules/BR-005.md` | Covered — resolved 2026-07-18 |
| FR-AGCRT-SALES-05 (inherited default) | TC-AGENCY-CREATE-019 | Not independently verified in Discovery | N/A | Covered |
| FR-AGCRT-SALES-06 (editable) | TC-AGENCY-CREATE-019 | Not independently verified in Discovery | N/A | Covered |
| FR-AGCRT-SALES-07 (multiple personnel) | TC-AGENCY-CREATE-020 | Not independently verified in Discovery | N/A | Covered |

## Bank Account Details Section

| Req. ID | Test Case(s) | Discovery status | Finding/Evidence | Coverage |
|---|---|---|---|---|
| FR-AGCRT-BANK-01 (Account Number) | TC-AGENCY-CREATE-023 | Not independently verified in Discovery | N/A | Covered |
| FR-AGCRT-BANK-02 (Account Type) | TC-AGENCY-CREATE-024 | Not independently verified in Discovery | N/A | Partially Covered — partial-entry validation rule unstated (Exploratory) |
| FR-AGCRT-BANK-03 (Bank Name) | TC-AGENCY-CREATE-023, -039 | Not independently verified in Discovery | N/A | Covered |
| FR-AGCRT-BANK-04 (multiple accounts) | TC-AGENCY-CREATE-022 | Not independently verified in Discovery | N/A | Covered |

## Payment Settings Section

| Req. ID | Test Case(s) | Discovery status | Finding/Evidence | Coverage |
|---|---|---|---|---|
| FR-AGCRT-PAY-01 (Invoice Generation) | TC-AGENCY-CREATE-001, -002, -028 | Validated — `Agency_Add.md` | N/A | Covered |
| FR-AGCRT-PAY-02 (Credit Limit) | TC-AGENCY-CREATE-001, -002, -025 | Validated — `Agency_Add.md` | N/A | Covered |
| FR-AGCRT-PAY-03 (Top Up limit) | TC-AGENCY-CREATE-001, -002, -025 | Validated — `Agency_Add.md` | N/A | Covered |
| FR-AGCRT-PAY-04 (Target) | TC-AGENCY-CREATE-025 | Not independently verified in Discovery | N/A | Covered |
| FR-AGCRT-PAY-05 (Set Month) | TC-AGENCY-CREATE-028 | Not independently verified in Discovery | N/A | Covered |
| FR-AGCRT-PAY-06 (Set Year) | TC-AGENCY-CREATE-028 | Not independently verified in Discovery | N/A | Covered |
| FR-AGCRT-PAY-07 (Credit Terms Days) | TC-AGENCY-CREATE-001, -002, -025 | Validated — `Agency_Add.md` | N/A | Covered |
| FR-AGCRT-PAY-08 (Reaching Percentage) | TC-AGENCY-CREATE-025, -026 | Not independently verified in Discovery | N/A | Partially Covered — no stated boundary (Exploratory sub-case) |
| FR-AGCRT-PAY-09 (Warning Prompt Days) | TC-AGENCY-CREATE-025 | Not independently verified in Discovery | N/A | Covered |
| FR-AGCRT-PAY-10 (Credit Agency) | TC-AGENCY-CREATE-028 | Not independently verified in Discovery | N/A | Covered |
| FR-AGCRT-PAY-11 (Payment Options, mandatory) | TC-AGENCY-CREATE-001, -002, -027 | Validated — `Agency_Add.md` | N/A | Covered |
| FR-AGCRT-PAY-12 (multi-select behavior) | TC-AGENCY-CREATE-027 | Not independently verified in Discovery | N/A | Covered |

## Product Access Details Section

| Req. ID | Test Case(s) | Discovery status | Finding/Evidence | Coverage |
|---|---|---|---|---|
| FR-AGCRT-PRODUCT-01 (Product) | TC-AGENCY-CREATE-001, -030 | Not independently verified in Discovery | N/A | Covered |
| FR-AGCRT-PRODUCT-02 (Status Column) | TC-AGENCY-CREATE-030 | Not independently verified in Discovery | N/A | Covered |
| FR-AGCRT-PRODUCT-03 (Supplier Name, read only) | TC-AGENCY-CREATE-029 | Not independently verified in Discovery | N/A | Covered |
| FR-AGCRT-PRODUCT-04 (Credential name) | TC-AGENCY-CREATE-001, -002, -030 | Not independently verified in Discovery | N/A | Covered |
| FR-AGCRT-PRODUCT-05 (Product Name, read only) | TC-AGENCY-CREATE-029 | Not independently verified in Discovery | N/A | Covered |
| FR-AGCRT-PRODUCT-06 (Description) | TC-AGENCY-CREATE-001, -002, -030, -038 | Not independently verified in Discovery | N/A | Covered |
| FR-AGCRT-PRODUCT-07 (inherited from Branch) | TC-AGENCY-CREATE-029 | Not independently verified in Discovery | N/A | Covered |

## Airline Supplier Credential (PCC) Section

| Req. ID | Test Case(s) | Discovery status | Finding/Evidence | Coverage |
|---|---|---|---|---|
| FR-AGCRT-PCC-01 (Search Supplier Credential PCC) | TC-AGENCY-CREATE-001, -002, -032, -033 | Not independently verified in Discovery | N/A | Covered |
| FR-AGCRT-PCC-02 (Ticketing Supplier Credentials PCC) | TC-AGENCY-CREATE-033 | Not independently verified in Discovery | N/A | Covered |
| FR-AGCRT-PCC-03 (Generic Supplier PCC) | TC-AGENCY-CREATE-001, -002, -032, -033 | Not independently verified in Discovery | N/A | Covered |
| FR-AGCRT-PCC-04 (Manager Name) | TC-AGENCY-CREATE-001, -002, -032, -038, -039 | Not independently verified in Discovery | N/A | Covered |
| FR-AGCRT-PCC-05 (Supplier Credential Description) | TC-AGENCY-CREATE-001, -002, -032, -038, -039 | Not independently verified in Discovery | N/A | Covered |
| FR-AGCRT-PCC-06 (inherited from Supplier & Branch) | TC-AGENCY-CREATE-031 | Not independently verified in Discovery | N/A | Covered |

## Import PNR Option Segment

| Req. ID | Test Case(s) | Discovery status | Finding/Evidence | Coverage |
|---|---|---|---|---|
| FR-AGCRT-PNR-01 (toggle) | TC-AGENCY-CREATE-001, -034 | Not independently verified in Discovery | N/A | Partially Covered — Admin-side only; Portal-side effect out of this run's scope |

## Expected Outcome — Submission Workflow

| Req. ID | Test Case(s) | Discovery status | Finding/Evidence | Coverage |
|---|---|---|---|---|
| FR-AGCRT-SUBMIT-01 (Submit for Approval) | TC-AGENCY-CREATE-001 | Validated — `Agency_Add.md` | FINDING-002 | Covered |
| FR-AGCRT-SUBMIT-02 (Save as Draft) | TC-AGENCY-CREATE-035 | Not independently verified in Discovery | N/A | Partially Covered — Draft's own minimum-field floor unstated (Exploratory sub-case) |
| FR-AGCRT-SUBMIT-03 (Approve) | TC-AGENCY-CREATE-037 | Blocked — `RunManifest.md` RUN-20260713-001 "Activate Agency: Blocked" | FINDING-002, FINDING-007 | Partially Covered — Exploratory/blocked, actor and screen unresolved |
| FR-AGCRT-SUBMIT-04 (Reject) | TC-AGENCY-CREATE-037 | Blocked — `RunManifest.md` RUN-20260713-001 "Activate Agency: Blocked" | FINDING-002, FINDING-007 | Partially Covered — Exploratory/blocked, actor and screen unresolved |
| FR-AGCRT-SUBMIT-05 (Cancel) | TC-AGENCY-CREATE-036 | Not independently verified in Discovery | N/A | Covered |

## Dependencies (external preconditions)

| Req. ID | Test Case(s) | Discovery status | Finding/Evidence | Coverage |
|---|---|---|---|---|
| BR-AGCRT-01 (Branch CRUD) | TC-AGENCY-CREATE-001, -008, -019, -029, -031 | Validated — v3 Branch discovery | N/A | Covered (as precondition) |
| BR-AGCRT-02 (Supplier CRUD) | TC-AGENCY-CREATE-001, -031 | Not independently verified in Discovery | N/A | Covered (as precondition) |
| BR-AGCRT-03 (Payment Method) | TC-AGENCY-CREATE-001, -027 | Enrichment — `knowledge_base` APP-002 (Branch's own Payment Option list; not independently confirmed for Agency) | N/A | Covered (as precondition) |

---

**Security/Unicode sweep (Negative Test Generation Engine §7, cross-cutting):** TC-AGENCY-CREATE-038 (Security Inputs) and TC-AGENCY-CREATE-039 (Unicode) each cite multiple Requirement IDs above as the specific free-text fields probed — listed under each requirement's own row rather than as a separate, untraceable entry.

**TC-AGENCY-CREATE-037 note:** Requirement IDs `FR-AGCRT-SUBMIT-03`/`-04` are retired (see `ProjectContext_Agency.md` §2.1.10) — superseded below by `FR-AGACTION-03/04/05`.

---

## Search Agency Section

| Req. ID | Test Case(s) | Discovery status | Finding/Evidence | Coverage |
|---|---|---|---|---|
| FR-AGSEARCH-01 (Agency Code) | TC-AGENCY-SEARCH-001, -006 | Not independently verified (Agency Code specifically) | N/A | Covered |
| FR-AGSEARCH-02 (Agency Name) | TC-AGENCY-SEARCH-002, -006, -007 | Validated — `Agency_Search.md` | N/A | Covered |
| FR-AGSEARCH-03 (State) | TC-AGENCY-SEARCH-003, -007 | Not independently verified in Discovery | N/A | Covered |
| FR-AGSEARCH-04 (City) | TC-AGENCY-SEARCH-003, -007 | Not independently verified in Discovery | N/A | Covered |
| FR-AGSEARCH-05 (Status) | TC-AGENCY-SEARCH-004, -007 | Partial — Status=Both validated on List screen only | N/A | Partially Covered — control-type ambiguity (Radio Button vs. Drop Down wording) unresolved |
| FR-AGSEARCH-06 (Search results display) | TC-AGENCY-SEARCH-001 through -004, -007, -009 | Validated (List) / Not independently verified (Search screen specifically) | N/A | Covered |
| FR-AGSEARCH-07 (No Results Found) | TC-AGENCY-SEARCH-005 | Not independently verified in Discovery | N/A | Partially Covered — exact message wording unconfirmed |
| FR-AGSEARCH-08 ("Add" button) | TC-AGENCY-SEARCH-008 | Validated — `Agency_List.md` | N/A | Covered |
| FR-AGSEARCH-09 (Real-time/on-Search update) | TC-AGENCY-SEARCH-010 (cross-ref TC-AGENCY-003) | Validated — `Agency_List.md` | FINDING-003 | Covered |
| FR-AGSEARCH-10 (Validation messages) | TC-AGENCY-SEARCH-006 | Not independently verified in Discovery | N/A | Covered |
| BR-AGSEARCH-01 (Add Agency Page dependency) | TC-AGENCY-SEARCH-008 | Covered (as precondition) | N/A | Covered |
| BR-AGSEARCH-02 (Region Module dependency) | TC-AGENCY-SEARCH-003 | Covered (as precondition) | N/A | Covered |

## Agency Actions Section

| Req. ID | Test Case(s) | Discovery status | Finding/Evidence | Coverage |
|---|---|---|---|---|
| FR-AGACTION-01 (pen icon displayed) | TC-AGENCY-ACTIONS-001, -008 | Enrichment — FINDING-004 (Branch's equivalent) | FINDING-004 | Covered |
| FR-AGACTION-02 (pen icon navigates to Update) | TC-AGENCY-ACTIONS-001 | Not independently verified in Discovery | N/A | Covered |
| FR-AGACTION-03 (Approve/Reject shown only for Pending) | TC-AGENCY-ACTIONS-002, -003, -005, -008 | Not independently verified in Discovery | N/A | Covered |
| FR-AGACTION-04 (remark popup shown) | TC-AGENCY-ACTIONS-003, -005 | Not independently verified in Discovery | N/A | Covered |
| FR-AGACTION-05 (remark mandatory) | TC-AGENCY-ACTIONS-003, -005 | Not independently verified in Discovery | N/A | Covered |
| FR-AGACTION-06 (Submit → Inactive/Pending) | TC-AGENCY-ACTIONS-007, -009 | Not independently verified in Discovery | FINDING-007 | Partially Covered — depends on whether FINDING-007's Pending-exclusion-from-Search still applies |
| FR-AGACTION-07 (Approved → Active/Approved) | TC-AGENCY-ACTIONS-004, -009 | Not independently verified in Discovery | N/A | Covered |
| FR-AGACTION-08 (Rejected → Inactive/Rejected) | TC-AGENCY-ACTIONS-006, -009 | Not independently verified in Discovery | N/A | Covered |
| BR-AGACTION-01 (Create Agency dependency) | TC-AGENCY-ACTIONS-001 through -009 | Covered (as precondition) | N/A | Covered |
| BR-AGACTION-02 (Update Agency dependency) | TC-AGENCY-ACTIONS-001 | Covered (as precondition) | N/A | Covered |

## Update Agency Section

| Req. ID | Test Case(s) | Discovery status | Finding/Evidence | Coverage |
|---|---|---|---|---|
| FR-AGUPDATE-01 (pre-population) | TC-AGENCY-UPDATE-001 | Not independently verified in Discovery | N/A | Covered |
| FR-AGUPDATE-02 (fields editable) | TC-AGENCY-UPDATE-002, -004 | Not independently verified in Discovery | N/A | Covered |
| FR-AGUPDATE-03 (Submit re-enters approval workflow) | TC-AGENCY-UPDATE-002 | Not independently verified in Discovery | N/A | Covered |
| FR-AGUPDATE-04 (Cancel discards changes) | TC-AGENCY-UPDATE-003 | Not independently verified in Discovery | N/A | Covered |
| FR-AGUPDATE-05 (Approve, authorized users) | TC-AGENCY-UPDATE-005, TC-AGENCY-ACTIONS-010 | Not independently verified in Discovery | N/A | Partially Covered — role-terminology discrepancy (Project Context §6 #2) |
| FR-AGUPDATE-06 (Reject, authorized users) | TC-AGENCY-UPDATE-006, -007, TC-AGENCY-ACTIONS-010 | Not independently verified in Discovery | N/A | Partially Covered — same role discrepancy, plus post-Reject data-state unstated |
| FR-AGCRT-MASTER-02 (reused for Update spot-check) | TC-AGENCY-UPDATE-004 | Validated (Create) | N/A | Covered |

**Out-of-scope Requirement IDs:** none — every Requirement ID in `ProjectContext_Agency.md` §2 has at least one citing Test Case. See `CoverageReport.md` for the Coverage Percentage computation and the full Coverage Gaps accounting (Partially Covered items above, plus the Findings disposition table).

---

## Test Case Reference (Risk, Acceptance Criteria, Run Scope)

**Added 2026-07-25**, when `TestCases_Agency.md` was rewritten to the Canonical Test Case Writing Standard (`.claude/skills/test-design-skill/SKILL.md` §6.1) — Risk, Acceptance Criteria Reference, and Run Scope Reference moved here from inline test-case fields; Requirement/Discovery/Finding/Evidence References are unchanged above, keyed by Requirement ID.

**Run Scope Reference (all 66 test cases, no exceptions):** User Story / Pasted text — four jointly-scoped User Stories (Create, Search, Actions, Update), RUN-20260718-001.

**Acceptance Criteria Reference:** each test case's governing acceptance criterion is the same one named against its Requirement ID's own row above (e.g. `TC-AGENCY-CREATE-030` → Product Access Details, Product/Status Column/Credential name/Description rows). Not repeated per test case here — follow the Requirement ID back to its section above.

**Risk** (Level + one-line statement — derived from the populating Finding's own Business/Technical Risk where one applies, otherwise independently assessed against this User Story's own stated risk framing):

| Test Case ID | Risk | Test Case ID | Risk |
|---|---|---|---|
| CREATE-001 | High — core positive path across the whole User Story; inherits FINDING-002's approval-workflow risk. | ACTIONS-001 | High — inherits FINDING-004's near-miss context (wrong action triggered on a real record). |
| CREATE-002 | High — a missing/wrong validation message on any Mandatory field lets bad data reach the approval queue. | ACTIONS-002 | High — showing Approve/Reject on an already-decided row risks a duplicate/contradictory workflow action. **Confirmed 2026-07-25 — see Manual Execution Results.** |
| CREATE-003 | Medium — ambiguous reading of "special characters allowed"; re-interpretation risk regardless of outcome. | ACTIONS-003 | High — formalizes FINDING-002's approval-workflow mechanism. |
| CREATE-004 | Low — data-integrity/UI-truncation concern, not a stated requirement. | ACTIONS-004 | High — financial/operational impact if an Approved Agency is left Inactive. |
| CREATE-005 | Medium — silent truncation risks an incomplete Post Office Box value undetected. | ACTIONS-005 | High — same rationale as ACTIONS-003, Reject path. |
| CREATE-006 | Low — Optional field; malformed data is cosmetic, not a workflow blocker. | ACTIONS-006 | High — same operational-impact rationale as Approve. |
| CREATE-007 | Medium — internationalization/data-entry-format concern; behavior confirmed by design, not an open conflict. | ACTIONS-007 | Medium — completes the three-state Status Reflection matrix. |
| CREATE-008 | Medium — an editable/incorrect Country would misclassify the Agency's operating country downstream. | ACTIONS-008 | High — inherits FINDING-004's near-miss (a real shared-environment record was nearly affected). |
| CREATE-009 | Low — Optional, no stated validation message. | ACTIONS-009 | High — same as the individual Status Reflection cases this consolidates. |
| CREATE-010 | Medium — a Name field accepting digits/symbols pollutes contact records used elsewhere. | ACTIONS-010 | Medium — if a distinct role is actually required and unavailable, every Approve/Reject case may need re-scoping. |
| CREATE-011 | Low — internationalization/data-integrity concern, already confirmed by design for Contact Person. | UPDATE-001 | High — a field that fails to pre-populate could be silently blanked and overwritten on next Save. |
| CREATE-012 | Medium — an invalid stored email breaks downstream approval-workflow communication. | UPDATE-002 | High — core positive path for the entire Update Agency feature. |
| CREATE-013 | Medium — accepting a non-PDF contract document risks invalid compliance records. | UPDATE-003 | Medium — a Cancel that silently saves partial edits violates explicit user intent. |
| CREATE-014 | Medium — unenforced Start/End ordering could create a contract with an inverted/zero-length validity period. | UPDATE-004 | Medium — if Update's validation is looser than Create's, bad data could enter an existing record. |
| CREATE-015 | Medium — a user unable to confirm which file was attached cannot verify the correct upload. | UPDATE-005 | Medium — confirms Update's re-entry into the approval workflow is a real, functioning loop. |
| CREATE-016 | Medium — without a remove/replace path, a wrong-file upload has no recovery short of abandoning the form. | UPDATE-006 | Medium — same rationale as UPDATE-005, Reject path. |
| CREATE-017 | Medium — an oversized/invalid logo could break Agency Portal branding rendering. | UPDATE-007 | Medium — if rejected edits are silently applied anyway, that's a real data-integrity defect. |
| CREATE-018 | Low — a UX/confirmation concern, not a blocking defect if still correctly saved. | SEARCH-001 | Medium — Agency Code is expected to be the most precise search key among 9,500+ records. |
| CREATE-019 | Medium — an un-editable/incorrect default forces every Agency under a Branch to share one contact. | SEARCH-002 | Medium — same rationale as SEARCH-001. |
| CREATE-020 | Medium — a hard single-entry limit would be a functional gap against the AC. | SEARCH-003 | Medium — an incorrect geo-filter could surface/hide Agencies from the wrong region. |
| CREATE-021 | Low — Optional field. | SEARCH-004 | Medium — Status is a primary way staff distinguish Active from Inactive/Pending. |
| CREATE-022 | Medium — financial/reconciliation impact if multi-account Agencies can't be represented. | SEARCH-005 | Low — UX clarity; an empty grid with no message could look broken. |
| CREATE-023 | Medium — an invalid Account Number stored without rejection risks a misdirected payment downstream. | SEARCH-006 | Low — Optional search fields; a gap here doesn't block any workflow. |
| CREATE-024 | Low — Optional field; a rejected/blank Account Type is a data-completeness concern, not a blocker. | SEARCH-007 | Medium — incorrect AND/OR logic could hide a real record or surface unrelated ones. |
| CREATE-025 | High — financial/credit-control fields; non-numeric or nonsensical values undermine the User Story's compliance goal. | SEARCH-008 | Low — navigation-only, but a broken entry point blocks Create Agency's discoverability. |
| CREATE-026 | Medium — an unbounded percentage stored without rejection misrepresents the Agency Wallet threshold logic. | SEARCH-009 | Low — an Optional-everything form blocking on empty submission would contradict its own field statuses. |
| CREATE-027 | High — Payment Options directly govern invoicing/settlement; wrong/absent settings have direct financial impact. | | |
| CREATE-028 | Medium — Invoice Generation directly determines how/when the Agency is invoiced. | | |
| CREATE-029 | Medium — incorrect inheritance would let an Agency access products its parent Branch was never granted. | | |
| CREATE-030 | High — Product Access governs a live booking capability. **Confirmed 2026-07-25 — see Manual Execution Results.** | | |
| CREATE-031 | High — PCC credentials gate GDS/ticketing access; incorrect inheritance risks the wrong supplier's credential scope. | | |
| CREATE-032 | High — same rationale as CREATE-031. **Inconclusive 2026-07-25 — re-test needed, see Manual Execution Results.** | | |
| CREATE-033 | Medium — an incorrect filter could let a user select a mismatched credential. | | |
| CREATE-034 | Medium — if the toggle has no observable Portal effect, Admin has no way to confirm it took effect. | | |
| CREATE-035 | Medium — if Draft enforces full validation it adds no value; if it allows zero fields, an unidentifiable empty record is created. | | |
| CREATE-036 | Low — a Cancel that silently persists a partial record would pollute the Agency list. | | |
| CREATE-038 | High — this User Story explicitly frames Agency creation around compliance; unsanitized input is a real security exposure. | | |
| CREATE-039 | Low — internationalization/data-integrity concern, consistent with an already-confirmed-by-design precedent. | | |
