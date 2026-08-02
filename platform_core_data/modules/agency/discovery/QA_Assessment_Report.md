# QA Assessment Report — `agency`

| Field | Value |
|---|---|
| Module | `agency` |
| Produced by run | `run-001__2026-07-31_11-56-38__UserStory__US-4222UpdateAgency` |
| Revision | 2 <!-- rev 2, 2026-07-31: Requirement Disposition applied to every Finding and gap per user directive; DOQ-01 and DOQ-04 resolved --> |
| Project Context validated against | `modules/agency/context/ProjectContext.md` — revision **2**, status **Approved** |
| Discovery Mode(s) used | Browser automation — **Browser Driver**, headless (§8.1 #1). No fallback mode was needed or used |
| Generated | 2026-07-31 14:20 · revised 2026-07-31 |
| Status | **Pending Review** |

---

## Headline

**The application works. The story is out of date.**

Nothing failed during this run — no HTTP error, no console message, no crash, no timeout, across 136 network events. **Seven Findings** were raised and every one is a disagreement between US-4222 and the application rather than a malfunction.

**Per the 2026-07-31 directive, the application is the primary reference where the story is clearly outdated.** US-4222 predates later enhancements. Applying the §1.1 discriminator — *when the two disagree, the PRD decides* — sorts the seven:

- **Five are the story being out of date**, and three of those are settled outright. **FINDING-001**: the application renders one shared `Required` message where the story specifies ~20 distinct ones, and PRD XC-17 `[V]` corroborates the application — so `Required` is the expected result, not a defect. **FINDING-005**: the seven undocumented fields are later functionality, with `Outstanding Threshold` confirmed by the product owner and `Remarks` corroborated by PRD XC-03 `[V]`.
- **Two are not**, and they are the ones worth attention. **FINDING-002** — AC-9's PCC section is absent, yet PRD ORG-05 and ORG-07 are *both* `[V]`, meaning two independent sources expected it. That is the signature of a removed or relocated feature, so it is dispositioned `Possible Application Defect / Possible Removed Feature` and **not** written off as an outdated story. **FINDING-004** — the document field enforces no file type, which no source superseded; a PDF-only rule on contract documents is a data-integrity rule, not a UI detail that evolves.

**Stage 3 is now unblocked except for one question.** DOQ-01 and DOQ-04 are resolved by the directive. **DOQ-02 (the AC-9 disposition) still blocks** — precisely because it is the one mismatch the directive's rule does not reach.

---

## 1. Scope

| | |
|---|---|
| **Run Scope Type** | User Story |
| **Run Scope Source** | Markdown file — `knowledge_base/requirements/user_stories/US-4222_Admin_Update_Agency.md` (supplied as pasted text 2026-07-31, transcribed before Stage 1 ran) |
| **Run Type** | User Story |
| **Pipeline branch** | Manual Execution Pipeline (1 → 2 → 3 → `4M`) |
| **Project Context validated against** | `modules/agency/context/ProjectContext.md`, revision 1, `Approved` |
| **Discovery Strategy applied** | **User Story** strategy (§16): *"Narrowest scope: targeted verification strictly of the story's acceptance criteria… does not wander into adjacent screens beyond what's needed to reach or verify the story, and every carried-forward Assumption/Risk tied to that story gets a direct, explicit confirm/refute/unresolved treatment."* §13 below discharges that last obligation for all 25 carried-forward items. |

The one deliberate step beyond the story's own screens was reading the **create** form, done solely to distinguish "absent from the update flow" from "absent from the product" for two absence claims — reasoning recorded in `AgencyCreateForm.md` §1. No other adjacent screen was explored, and four in-scope-adjacent routes were skipped on purpose (`Coverage_Summary.md` §4).

## 2. Objectives

Verify, against the live application, the ten acceptance-criteria groups and four Expected Outcome actions US-4222 defines for the Admin → Agency update flow — and give each of the Project Context's 18 carried-forward assumptions and 7 risks an explicit confirm / refute / unresolved treatment.

Concretely, this run set out to answer: does each of the story's ten sections exist; do its fields match in name, type and mandatory status; what does the application actually do when a mandatory field is empty; and are the four Expected Outcome actions reachable.

## 3. Evidence Sources

| Discovery Mode | In-Scope Areas Covered | Why This Mode |
|---|---|---|
| **Browser automation — Browser Driver** (§8.1 #1) | All of it: Agency list, Agency update form, Agency create form; every Finding; every component in `Coverage_Summary.md` §3 | Highest-priority mode, and available for the entire in-scope surface. Chosen over its peer, the Playwright MCP server, because the whole flow sits behind a login and **a credential value must never be typed into an MCP tool call** — MCP arguments are conversation-visible (`platform_core/tools/mcp/README.md` §1.3). `BrowserDriver.authenticate()` fills the login form in-process and never exposes the value. Ran headless throughout, the platform default; headless costs no evidence, so the Evidence Category and Confidence ceiling are unaffected (§18) |

**No lower-priority mode was substituted for a higher one anywhere in this run.** Every Finding rests on **Direct Observation**, the only Evidence Category that can reach `Confirmed` (§18) — so where a Finding here is not `Confirmed`, that is never because of a tooling limitation. It is because the requirement itself is contested, which §5.6 requires be reported as `Needs Human Review` rather than resolved by this stage.

## 4. Modules Explored

| Module | Route(s) | Purpose | Discovery Mode |
|---|---|---|---|
| `agency` | `/admin/agency` | Agency list — 903 records; search by code/name; `Add agency`; row-level pencil icon to edit | Browser automation (Browser Driver) |
| `agency` | `/admin/agency/edit/{id}` | **The screen under test** — Update Agency, ten sections, maker–checker action bar | Browser automation (Browser Driver) |
| `agency` | `/admin/agency/add` | Agency create form — read as a control surface only (§1) | Browser automation (Browser Driver) |

**Navigation structure discovered.** Under `Admin`, only `Branch` (`/admin/branch`) and `Staff` (`/admin/staff`) are leaf links; `Company` and `Agency` are expandable groups. The Agency group holds five children: `Agency` (`/admin/agency`), `Search Login Details` (`/admin/login-details`), `Registration Requests` (`/admin/registration-requests`), `Category Management` (`/admin/category-management`), `Agency Assignation` (`/admin/agency-categorization`).

**The last two are named nowhere in US-4222 and nowhere in the PRD's ORG requirements.** They are recorded as observed navigation surface, not assessed — folding them into scope would be a Human Decision (§5.3.1 #3), not this stage's call.

**Shared UI components:** global expandable navigation · search-and-grid pattern with row action icons · custom dropdown (PrimeNG-style, renders as a div rather than `<select>`) · international phone input with country flag/dial code · checkbox group · radio group · file upload row with an `Add` button for extra rows · inline field validation (red border + message beneath). Full detail in `Coverage_Summary.md` §3.

## 5. Observed Behaviour

| Module | Workflow / Rule | What Was Observed | Evidence Category | Finding ID(s) |
|---|---|---|---|---|
| `agency` | Reaching the update form | Admin → Agency group → `Agency` → row pencil icon → `/admin/agency/edit/{id}`. Directly addressable by URL with an established session | Direct Observation | — |
| `agency` | Form composition | Ten sections: Agency Master (untitled) · Agency Owner Details · Upload Document · Agency Logo · Wonder Travel Sales Contact · Bank Account Details · Payment settings · Product Access Details · Agency Features · Remarks | Direct Observation | FINDING-002, FINDING-005 |
| `agency` | Mandatory-field violation | Clearing any of four mandatory fields and blurring renders the single word **`Required`** in red beneath the field, with a red border. Never a field-specific message | Direct Observation | FINDING-001 |
| `agency` | Optional-field behaviour | Clearing `Bank name` (optional per AC-6) renders **no** message — so `Required` is tied to mandatory status, not shown indiscriminately | Direct Observation | — |
| `agency` | `Country` field | Not editable — `readOnly`, rendered greyed, value inherited (`Egypt`) | Direct Observation | — *(**AC-1 confirmed**, §6)* |
| `agency` | Mandatory markers | The application marks **23** fields with `*` (full list in FINDING-005's evidence) | Direct Observation | FINDING-005 |
| `agency` | Payment option control | 28 selectable entries: 5 payment instruments, then 21 given names, then `m` and `f` | Direct Observation | FINDING-003 |
| `agency` | Document upload | Document input declares **no** `accept` attribute; logo input declares `accept="image/*"`. Both `multiple=false`. A `.png` is currently attached as a document | Direct Observation | FINDING-004 |
| `agency` | Repeat-row pattern | `Add` buttons beneath Document, Sales Contact and Bank Account sections; `Set target +` groups Target/Month/Year | Direct Observation | FINDING-004 *(bears on AC-3's "multiple documents")* |
| `agency` | Action bar | `Cancel` · `Send For Approval` · `Approve` · `Reject` — all four visible and enabled to the single available account. **No "Save as draft" control on either form** | Direct Observation | FINDING-007 |
| `agency` | Product access grid | Columns `STATUS · SUPPLIER NAME · CREDENTIAL NAME · PRODUCT NAME · DESCRIPTION`; rows `SalamAir / Salam Air Live / Flight` and `FlyNas / fly nas cred / Flight`; row 1's `DESCRIPTION` holds `sad` | Direct Observation | FINDING-002, FINDING-003 |
| `agency` | Grid columns | `Status` and `Approval Status` render as **separate** columns on the Agency list | Direct Observation | — *(**PRD XC-07 confirmed**, §6)* |
| `agency` | Stored data quality | `Company URL` holds `asdas`; several agency/branch names are hash-suffixed generated values (`Louie_b38ae8`, `Pearle_41ccf9`) | Direct Observation | FINDING-003 |
| `agency` | System health | 136 network events, **0** responses ≥ 400. Console **clean — 0 messages**. No Event-Driven Capture trigger (§5.2) fired at any point | System Response | — |

## 6. Confirmed Behaviour

The subset of §5 validated against a clearly documented requirement **and found to match**. It is deliberately short: most of what this run observed is contested rather than confirmed, and contested items belong in §11.

| Requirement (Project Context §) | Confirmed Behaviour | Evidence Category | Finding ID(s) |
|---|---|---|---|
| §2 row "Agency Master" → AC-1: `Country` is *"Inherited when a branch is selected"*, field type **Read Only** | `Country` is `readOnly`, rendered greyed, populated `Egypt` | Direct Observation | — |
| §2 row "Bank Account Details" → AC-6: all three fields **Optional** | `Account Number`, `Account Type`, `Bank name` carry no `*`; clearing `Bank name` produces no validation message | Direct Observation | — |
| §7 Traceability Anchor → **PRD XC-17 `[V]`**: *"Mandatory-field violation message is `Required` platform-wide"* | Exactly what all four probed fields rendered | Direct Observation | FINDING-001 |
| §7 Traceability Anchor → **PRD XC-07 `[V]`**: *"Status and Approval Status are distinct columns"* | Both present as separate columns on the Agency list | Direct Observation | — |
| §2 rows for AC-2, AC-3, AC-4, AC-6, AC-7, AC-8, AC-10 → the sections exist | Nine of the story's ten sections are present, in the story's order | Direct Observation | FINDING-002 *(for the tenth)* |
| §2 row "Submit for Approval" → **PRD XC-01 `[V]`**: a governed record is submitted rather than published on save | A `Send For Approval` action exists and is distinct from `Approve`/`Reject`. **The state transition itself was not executed** — presence is confirmed, behaviour is not | Direct Observation | FINDING-007 |

**PRD XC-17 deserves a note.** It is confirmed here, and confirming it is what *creates* FINDING-001: the platform-wide `Required` behaviour the PRD documents is precisely what contradicts US-4222's per-field messages. This run therefore confirms one requirement source by refuting another — which is exactly why the disposition is a human's to make, not this stage's.

## 7. Assumptions

Inferred statements this run did **not** directly observe. Each is tagged with its Evidence Category; none is presented as an observation.

| ID | Assumption | Why Inferred (not observed) | Evidence Category |
|---|---|---|---|
| DA-01 | AC-3's *"System shall allow the upload of multiple documents"* is satisfied by the `Add` button adding further document rows, rather than by multi-file selection | Both file inputs are `multiple=false`, and an `Add` button sits beneath the document row — but no second row was ever added, so the mechanism is inferred from layout | Assumption |
| DA-02 | AC-5's *"add multiple Sales personnel"* and AC-6's *"add multiple bank accounts"* work the same way, via their own `Add` buttons | Same reasoning; neither `Add` was clicked | Assumption |
| DA-03 | `Outstanding Threshold` and `Remarks` are enforced on submit, not merely marked `*` | FINDING-001 established that clearing a mandatory field renders `Required` on blur, so client-side enforcement is likely — but neither field was cleared and submitted, so server-side enforcement is unobserved | Assumption |
| DA-04 | The Product Access Details grid is how supplier credentials (PCCs) are now assigned to an agency, AC-9's section having been folded into it | Inferred from the grid's `SUPPLIER NAME` / `CREDENTIAL NAME` / `DESCRIPTION` columns being populated. No mapping to AC-9's field names exists, and the merge itself is unconfirmed — this is FINDING-002's Root Cause Hypothesis at 55% | Assumption |
| DA-05 | The 23 non-payment entries in the Payment option control originate in Payment Method master data, seeded by prior automated runs against this shared environment | The master-data screen was deliberately not inspected — it belongs to the `payment-gateway` module, out of scope. FINDING-003's hypothesis, 70% | Assumption |
| DA-06 | `Import PNR Option` on this form is the same switch PRD IPN-05 reads when refusing an import for a non-enabled organisation | The control exists with a matching name; the causal link to import behaviour was not exercised (it would require the `import-pnr` module, out of scope) | Assumption |

## 8. Open Questions

Candidates that could not be validated, plus every carried-forward Project Context item this run leaves genuinely unresolved.

| ID | Open Question | What Would Resolve It | Project Context Ref |
|---|---|---|---|
| DOQ-01 | Are US-4222's ~20 per-field validation messages a real requirement, an accepted deviation, or specification boilerplate? | The story's author or the product owner. **Not answerable from the application** — the application's answer (`Required`) is already known | ASM-018, and FINDING-001 |
| DOQ-02 | Was AC-9 (Airline Supplier Credential / PCC) superseded by Product Access Details, or is it a missing feature? | Product owner, plus a field-level mapping if superseded | ASM-003, ASM-013, FINDING-002 |
| DOQ-03 | Can a plain Admin who edits an agency also approve it? | A second, non-Super-Admin credential. No Discovery Mode can substitute | ASM-004, ASM-015, PRD OQ-1, FINDING-007 |
| DOQ-04 | What are valid values and business meaning for `Outstanding Threshold`? | Product owner. **Blocking:** no positive test case can save without a value | FINDING-005 |
| DOQ-05 | Is `Remarks` content free-form, or governed (e.g. required to cite a reason)? | Product owner | FINDING-005 |
| DOQ-06 | Does changing `Branch` on an existing agency re-inherit and **overwrite** Country, Product Access and Sales Contact? | Deliberately not probed — it is destructive-by-inheritance on a live record. Stage 4M under a designed case with a recorded pre-edit state | ASM-016 |
| DOQ-07 | On updating an agency that already has a document and logo, must the user re-upload to save? | Stage 4M: save without touching either upload and observe. Both are marked `*` and a document is already attached | ASM-012 |
| DOQ-08 | What is the authoritative Payment option set? | Product owner, plus an environment cleanup decision | ASM-014, FINDING-003 |
| DOQ-09 | Is `Designation` (AC-5) expected? Might it appear only on an added sales-contact row? | Product owner; the row question is cheap for Stage 4M to settle while executing AC-5 | FINDING-006 |
| DOQ-10 | Does `Cancel` exit *"the role update process"* as the story says, or the agency update? | Story author — it reads as a copy-paste artefact from a Role story | ASM-011 |
| DOQ-11 | Are the five Reflection areas in scope for downstream-effect verification, or impact awareness only? | Product owner | ASM-017 |
| DOQ-12 | What do `Agency Business Type`, `Transfer Pnr Option`, `Blue Command Screen` and `Enable Search Limit` do, and should they be tested? | Product owner. No requirement exists to test them against | FINDING-005 |
| DOQ-13 | Does the product enforce PDF-only documents and the 2 MB logo limit server-side? | Stage 4M, using the prepared fixtures. Requires a save, so out of this stage's scope | ASM-009, FINDING-004 |
| DOQ-14 | Does `Company URL` validate URL format on input? The stored value is `asdas` | Stage 4M. Existing data shows only that stored values need not be URLs | — |
| DOQ-15 | Is credit enforcement (credit limit, top-up limit, reaching percentage, credit terms) observable at all? | Out of reach for this run — verifying it needs bookings/payments, which the environment forbids | ASM-005, PRD OQ-7 |
| DOQ-16 | Does a "Save as draft" option exist anywhere? PRD GAP-8 says the backlog specifies one; no such control was observed on either form | Product owner | ASM-008 |

## 9. Discovered Risks

| ID | Risk | Business Risk | Technical Risk | Finding ID(s) |
|---|---|---|---|---|
| DR-01 | ~~Stage 3 cannot write correct expected results for ~20 negative cases~~ — **retired 2026-07-31** | **Resolved by the directive.** `Required` is the expected result (disposition row 1, PRD XC-17 `[V]`). Residual risk is only that the story stays uncorrected and misleads a future reader | None — the application's behaviour is self-consistent and PRD-documented | FINDING-001 |
| DR-02 | ~~No positive test case can complete a save~~ — **downgraded 2026-07-31** | **Largely resolved.** The two mandatory fields are legitimate later functionality and Stage 3 may supply values. Residual risk: `Outstanding Threshold`'s valid range is still unknown, so a chosen value could produce a test that passes while asserting nothing meaningful | None | FINDING-005 |
| DR-02b | **Four undocumented functional switches can change live agency behaviour with no governing criteria** | `Agency Business Type`, `Transfer Pnr Option`, `Blue Command Screen`, `Enable Search Limit` alter real behaviour (e.g. whether PNRs can be transferred) and no source defines expected results for them | None | FINDING-005 |
| DR-03 | **Five acceptance criteria have no surface to test, and two `[V]`-tagged PRD requirements describe them** | AC-9 cannot be accepted as written. **Dispositioned row 3, not story-outdated** — writing it off as outdated specification would convert a possible removed-feature regression into a documentation correction | Supplier-credential assignment appears to exist in the Product Access grid, so outright capability loss is unlikely — but relocation is a change someone should confirm consciously | FINDING-002 |
| DR-04 | Four Expected Outcome actions cannot be properly exercised with one identity | `Approve`/`Reject` will be executed by the same identity that edits, so a segregation-of-duties failure is indistinguishable from correct behaviour. PRD §1.1 lists four-eyes governance as a **business objective** | None observed | FINDING-007 |
| DR-05 | A mandatory control offers 23 meaningless choices | An agency can be saved with a nonsense payment instrument; AC-7 has no stable expected result until the list is cleaned | Payment Method master data appears to accept arbitrary free text with no validation | FINDING-003 |
| DR-06 | Agency contract documents may be storable in any format | Contract documents carry contract dates and record the commercial agreement; a downstream PDF consumer could fail on an image | Client-side `accept` is absent on the document input; server-side validation untested. Arbitrary file-type upload is a file-handling risk | FINDING-004 |
| DR-07 | **Shared-environment interference during Stage 4M** | 903 agencies and visible generated test data mean another tester may change the record under test mid-execution, producing a false failure | None | — *(Project Context RSK-001, now corroborated)* |
| DR-08 | PRD requirements tagged `[V]` may be stale | ORG-05 and ORG-07 are `[V]` — implying a passing automated assertion — yet the PCC section they describe does not render. Other `[V]` tags may be equally out of date, which weakens the PRD as a fallback source | The reference automation suite may contain assertions that no longer match the UI | FINDING-002 |

## 10. Coverage

| Area / Module | Coverage Status | Discovery Mode | Notes |
|---|---|---|---|
| Agency list (`/admin/agency`) | Covered | Browser automation (Browser Driver) | In scope as a means of reaching the record under test only |
| Agency update form (`/admin/agency/edit/{id}`) | Covered | Browser automation (Browser Driver) | The screen under test; all ten AC groups inventoried |
| Agency create form (`/admin/agency/add`) | Covered | Browser automation (Browser Driver) | Out of scope; read as a control surface for two absence claims |
| AC-9 — Airline Supplier Credential (PCC) | **Unreachable** | — | Section does not render on either form (FINDING-002) |
| AC-5 — `Designation` field | **Unreachable** | — | Field absent from both forms (FINDING-006) |
| Maker-vs-checker separation | **Blocked** | Browser automation (single identity) | One credential exists; no mode can supply a second (FINDING-007) |
| `category-management`, `agency-categorization`, `login-details`, `registration-requests` | Skipped | — | Not named by US-4222; widening scope is a Human Decision |
| Undocumented feature switches | Skipped | — | No requirement to test against; toggling live config has no defined expected result |
| Five Reflection areas | Skipped | — | Impact awareness pending DOQ-11; verification needs bookings/payments, which the environment forbids |

**Roll-up:** 3 Covered · 0 Partial · 1 Blocked · 2 Unreachable *(plus 4 skipped areas)*

**Screen coverage is 100% (3/3), and that figure should not be read as criterion coverage.** Every screen the story touches was reached; roughly half of its criteria describe *behaviour on save*, which this stage does not perform. `Coverage_Summary.md` §1 gives the per-AC breakdown.

## 11. Gaps

**Every gap below now carries a Requirement Disposition** (column added 2026-07-31 by user directive; taxonomy and discriminator at `context/ProjectContext.md` §1.1). Nothing has been removed or downgraded out of the record — the disposition states *which source wins*, not whether the mismatch is reported.

| ID | Gap Type | Description | **Disposition** | Project Context Ref | Finding ID(s) |
|---|---|---|---|---|---|
| GAP-D01 | **Contradicts** | The application renders `Required` for every mandatory-field violation; US-4222 specifies ~20 distinct per-field messages. PRD XC-17 `[V]` sides with the application | **Story Outdated — PRD-corroborated** (row 1). **Resolves DOQ-01** | §2 "Field-level validation…", ASM-018 | FINDING-001 |
| GAP-D02 | **Absent** | AC-9's Airline Supplier Credential (PCC) section and all five of its fields are absent from both forms, though PRD ORG-05/ORG-07 `[V]` describe them | **Possible Application Defect / Possible Removed Feature** (row 3) — **not** story-outdated; two `[V]` sources expected it. **DOQ-02 stays open** | §2 "Airline Supplier Credential (PCC)", ASM-003, ASM-013 | FINDING-002 |
| GAP-D03 | **Absent** | AC-5's `Designation` dropdown is absent from both forms | Story Outdated / Requires Business Confirmation (row 2) | §2 "Wonder Travel Sales Contact" | FINDING-006 |
| GAP-D04 | **Extends** | Seven fields exist that US-4222 does not describe — `Fax No`, `Agency Business Type`, `Outstanding Threshold *`, `Transfer Pnr Option`, `Blue Command Screen`, `Enable Search Limit`, `Remarks *`. Two are mandatory | **Later enhancements.** `Outstanding Threshold` **Confirmed** (row 4); `Remarks` **PRD-corroborated** by XC-03 `[V]` (row 1); other five row 2. **Resolves DOQ-04** | §2 (in-scope surface is the ten AC groups), ASM-002 | FINDING-005 |
| GAP-D05 | **Contradicts** | US-4222 names the action `Submit for Approval`; the application's button reads `Send For Approval`. PRD XC-01 `[V]` sides with the application | Story Outdated — PRD-corroborated (row 1) | §2 "Submit for Approval" | FINDING-007 |
| GAP-D06 | **Contradicts** | AC-8 marks `Product`, `Status Column`, `Credential name`, `Description` Mandatory; no Product Access control carries a `*` | Story Outdated / Requires Business Confirmation (row 2) — **with a caveat:** absent markers could equally mean validation was never applied, so design to observed behaviour *and* note it | §2 "Product Access Details" | FINDING-005 |
| GAP-D07 | **Contradicts** | AC-1's field order places `IATA Agency` after `City`; the application renders it after `Phone No`, following `Address` | Story Outdated / Requires Business Confirmation (row 2) — cosmetic | §2 "Agency Master" | FINDING-005 |
| GAP-D08 | **Contradicts** | AC-10 describes a *"toggle"* for Import PNR; the application renders a checkbox in an `Agency Features` group | Story Outdated / Requires Business Confirmation (row 2) — cosmetic | §2 "Import PNR toggle" | FINDING-005 |
| GAP-D09 | **Absent** | Neither form offers a "Save as draft" control, though PRD GAP-8 records the backlog as specifying *"submit for approval or save as draft"*. US-4222 also omits it | Not a requirement mismatch — a backlog item that appears never to have been built. No source in scope requires it | §3 "Save as draft", ASM-008 | — *(no Finding)* |
| GAP-D10 | **Absent** | AC-3 requires PDF-only with a stated rejection message; the document input declares no accepted type, and a `.png` is attached | **Application Defect (candidate)** (row 5) — a data-integrity rule no source superseded. Settled by Stage 4M's upload test | §2 "Upload Document Details", ASM-009 | FINDING-004 |

**Disposition roll-up:** 3 `Story Outdated — PRD-corroborated or Confirmed` (settled) · 4 `Story Outdated / Requires Business Confirmation` · **1 `Possible Application Defect / Possible Removed Feature`** · **1 `Application Defect (candidate)`** · 1 not a requirement mismatch.

**Eight of the ten gaps are the story being out of date. Two are not** — GAP-D02 and GAP-D10 — and keeping those two out of the "story outdated" bucket is the whole purpose of the §1.1 discriminator. Both describe the application falling short of something no source superseded: a section two `[V]`-tagged PRD requirements describe, and a data-integrity rule on contract documents that no plausible enhancement would remove.

## 12. Recommendations

| ID | Recommendation | Rationale | Finding ID(s) |
|---|---|---|---|
| DREC-01 | **Answer DOQ-01 before Stage 3 finalizes expected results** | ~20 test cases depend on it. Deciding after the suite is written means rewriting it | FINDING-001 |
| DREC-02 | **Obtain a plain Admin credential** (distinct from `odeysysadmin`) before Stage 4M | One credential addition converts ASM-004, ASM-015 and PRD OQ-1 from untestable to testable, and lets maker/checker run as the story intends | FINDING-007 |
| DREC-03 | Get valid values for `Outstanding Threshold` and guidance on `Remarks` | Without them no positive case can save; Stage 3 would otherwise have to invent values and label them assumptions | FINDING-005 |
| DREC-04 | Ask the product owner to rule on AC-9 — superseded, or missing | Decides whether five criteria are `Blocked — feature not present` or redesigned against Product Access Details | FINDING-002 |
| DREC-05 | Request a Payment Method master-data cleanup on STG, or confirm the pollution is staging-only | AC-7 has no stable expected result while 23 of 28 options are junk. If the entries exist in other environments this is a defect, not hygiene | FINDING-003 |
| DREC-06 | Have Stage 4M run AC-3's format-negative cases **first**, including the extension-spoofing fixture | Extension-only validation is materially weaker than the story implies and is worth reporting regardless of AC-3's wording | FINDING-004 |
| DREC-07 | Flag to the reference-automation maintainers that ORG-05/ORG-07 are `[V]` against a section that does not render | Suggests stale assertions, which weakens the PRD as a fallback requirement source across the whole project | FINDING-002 |
| DREC-08 | Record `AGN2 / Test Egypt` (id 949) and its pre-edit values before Stage 4M mutates anything | Shared environment; a restorable baseline is what makes the mutation authorization safe to use | — |
| DREC-09 | Consider a future accessibility-scoped run | The Agency list's row action is an icon with no text, no `title` and no `aria-label`. Out of scope here (no accessibility requirement exists in this project to test against), so it is recorded rather than raised | — |

**Regression Test Candidates** — areas worth a regression test, not designed cases (Stage 3 owns those): mandatory-field enforcement across all 23 app-marked fields · `Country` read-only inheritance on branch selection · the maker–checker transition `Send For Approval` → `Pending for approval` → `Approve`/`Reject` with Remarks · `Cancel` discarding without persisting · document and logo upload format/size enforcement · the repeat-row `Add` pattern for documents, sales contacts and bank accounts · `Import PNR Option` persistence and its downstream effect on import (cross-module, full-project execution only).

## 13. Inputs for Test Design

**Findings by ID:**

| Finding ID | Category | Status | Severity | Module |
|---|---|---|---|---|
| FINDING-001 | Requirement Gap | Needs Human Review | N/A | `agency` |
| FINDING-002 | Requirement Gap | Needs Human Review | N/A | `agency` |
| FINDING-003 | Observation | Needs Human Review | N/A | `agency` |
| FINDING-004 | Observation | Needs Human Review | N/A | `agency` |
| FINDING-005 | Requirement Gap | Needs Human Review | N/A | `agency` |
| FINDING-006 | Requirement Gap | Needs Human Review | N/A | `agency` |
| FINDING-007 | Test Gap | Needs Human Review | N/A | `agency` |

Every Finding carries a populated **Expected Behavior** field citing a specific Project Context section, which is what lets Stage 3 fill its own Requirement Reference and Discovery Reference without re-deriving them (§22).

**Finding Disposition guidance** (§22 mapping — `Confirmed` → Regression, `Needs Human Review` → Exploratory, `Rejected`/`Duplicate` → Documented exception): all seven are `Needs Human Review`, so all seven map toward **Exploratory** treatment. In practice most are requirement conflicts that a human answer converts into ordinary Regression cases — FINDING-001 in particular becomes a straightforward regression suite the moment DOQ-01 is settled.

**Assumption disposition** — every carried-forward Project Context item, per the User Story strategy's explicit obligation (§16):

| Assumption ID | Disposition | Basis |
|---|---|---|
| ASM-001 (PRD is reverse-engineered, `[O]`/`[I]` unconfirmed) | **Confirmed, and sharpened** | Even a `[V]` tag proved unreliable — see ASM-007/RSK-007 |
| ASM-002 (no PRD requirement for the update flow) | **Confirmed** | Nothing observed changes it; US-4222 remains the sole source, which is why GAP-D04 has no fallback |
| ASM-003 (PCC inherited from Supplier & Branch) | **Unresolved** | The section does not exist, so inheritance could not be observed (FINDING-002) |
| ASM-004 (self-approval prohibited but unproven) | **Unresolved** | One identity available (FINDING-007) |
| ASM-005 (credit enforcement unspecified) | **Unresolved** | Fields are editable; their effect needs bookings/payments, forbidden here |
| ASM-006 (approval matrix unknown) | **Unresolved** | Same single-identity limitation |
| ASM-007 (field validation matrix never covered) | **Confirmed, and advanced** | Confirmed there was no prior coverage — and this run produced the first actual observation: the message is `Required` (FINDING-001) |
| ASM-008 (draft-save discrepancy) | **Refuted** | No "Save as draft" control on either form (GAP-D09). The backlog's draft-save is not present |
| ASM-009 (PDF / 2 MB constraints are story-sourced and unverified) | **Confirmed, and strengthened** | The document input declares no `accept` at all, and a `.png` is attached (FINDING-004) |
| ASM-010 (reference data is environment-specific and generated) | **Confirmed** | Hash-suffixed agency/branch names; 23 generated payment options (FINDING-003) |
| ASM-011 (`Cancel` "role update process" copy-paste) | **Unresolved** | Needs the story's author (DOQ-10) |
| ASM-012 (must documents be re-uploaded on update?) | **Unresolved, with new evidence** | Both uploads are marked `*` and a document is already attached; whether a save requires re-upload is untested (DOQ-07) |
| ASM-013 (AC-9 table shape ambiguity) | **Moot** | The whole section is absent, so its internal shape cannot be clarified (FINDING-002) |
| ASM-014 (authoritative payment option set unknown) | **Unresolved, and worse** | 28 options render, 23 of them meaningless (FINDING-003) |
| ASM-015 (which role may approve) | **Unresolved** | One identity available (FINDING-007) |
| ASM-016 (does changing Branch overwrite inherited values?) | **Unresolved** | Deliberately not probed — destructive-by-inheritance on a live record (DOQ-06) |
| ASM-017 (are the Reflection areas in scope?) | **Unresolved** | Needs the product owner (DOQ-11) |
| ASM-018 (are the story's message strings literal?) | **Refuted as framed** | The punctuation question is moot: the application does not render those strings at all (FINDING-001) |
| RSK-001 (concurrent modification on shared staging) | **Active, corroborated** | 903 agencies, visible generated test data (DR-07) |
| RSK-002 (agency config is live commercial data) | **Active, unchanged** | Payment options, credit limits and PCCs all editable here |
| RSK-003 (Approve/Reject may end `Blocked`) | **Realized** | Exactly what FINDING-007 records |
| RSK-004 (upload negative paths need bad fixtures) | **Mitigated** | Eight fixtures generated, including an over-2 MB PNG and an extension-spoofing `.pdf` |
| RSK-005 (non-functional requirements absent) | **Unchanged** | This run makes no non-functional claim |
| RSK-006 (no audit log to verify the change trail) | **Unresolved** | Not observable from this form |
| RSK-007 (`[O]`/`[I]` behaviour may not exist as described) | **Realized, and broader than stated** | ORG-05/ORG-07 are `[V]`, not `[O]`/`[I]`, and still do not match the UI (FINDING-002, DR-08) |

**Requirement Gaps needing a coverage decision:**

| Gap ID | Requirement | Decision Needed From Test Design |
|---|---|---|
| GAP-D01 | AC-1/AC-2/AC-5/AC-6/AC-7's ~20 per-field messages | **Resolved.** Encode **`Required`** as the expected result. Disposition row 1 — PRD XC-17 `[V]` corroborates the application. Record the story's strings as outdated specification |
| GAP-D02 | AC-9, all five fields | **Still blocked on DOQ-02** — the one gap the directive does not settle. Disposition row 3: do **not** design to observed behaviour. Design the five criteria as `Blocked — pending business confirmation`, and escalate as a possible removed feature |
| GAP-D03 | AC-5 `Designation` | Design to observed behaviour (field not present), labelled disposition row 2. Have Stage 4M check an added sales-contact row while executing AC-5 — cheap, and closes the last open condition |
| GAP-D04 | Seven undocumented fields, two mandatory | **Resolved.** Design **to observed behaviour** as later enhancements — no longer `Requires Upstream Requirement`. Supply values for `Outstanding Threshold` (row 4, confirmed) and `Remarks` (row 1, PRD-corroborated) so positive cases can save. Still ask for `Outstanding Threshold`'s valid range — its existence is settled, its semantics are not |
| GAP-D05 | Button label | Use the application's `Send For Approval` (row 1, PRD XC-01 `[V]`). Story wording is a documentation correction |
| GAP-D06 | AC-8 mandatory markings | Design to observed behaviour (not mandatory), row 2 — **and note the caveat**: absent markers may mean validation was never applied rather than that the requirement changed |
| GAP-D07, GAP-D08 | Field order; toggle vs checkbox | Row 2, cosmetic. Documentation corrections, not test cases |
| GAP-D09 | Save as draft | Out of scope — no source in scope requires it. Do not design a case |
| GAP-D10 | AC-3 PDF-only | Design the negative cases and run them **first**. Disposition row 5 — a data-integrity rule no source superseded, so this remains the run's strongest genuine defect candidate |

**What the 2026-07-31 directive changed here.** Before it, two gaps blocked Stage 3 (DOQ-01 and DOQ-02) and GAP-D04 had no requirement basis at all. Now **DOQ-01 and DOQ-04 are resolved** and Stage 3 can design ~20 negative cases plus every positive case. **DOQ-02 alone still blocks**, and deliberately so: GAP-D02 is the one mismatch where the PRD corroborates the story rather than the application, so the directive's "application is the primary reference" rule does not reach it.

**Handoff confirmation:** Every input `test-design-skill/SKILL.md` §4 declares is **present and specific**. Discovery snapshots: three (`AgencyList.md`, `AgencyUpdateForm.md`, `AgencyCreateForm.md`). `Timeline.md` and `Coverage_Summary.md`: complete and maintained during the run. This QA Assessment Report: all 13 §19 sections present, in order. `Findings_Summary.md` plus seven `metadata.md` files, each with a populated Expected Behavior citing a Project Context section. Evidence packages: seven, all self-contained, referenced by path.

**One gap in the handoff remains declared rather than papered over** *(revised 2026-07-31 — there were two)*. **Stage 3 cannot complete its expected results for GAP-D02 without an answer to DOQ-02.** It can design the case structure, but AC-9 is the single mismatch where the PRD corroborates the story rather than the application, so the directive's "application is the primary reference" rule does not reach it and designing to observed behaviour would assert that the section was legitimately removed — which nothing establishes.

**GAP-D01 is no longer a handoff gap.** The 2026-07-31 directive plus the §1.1 discriminator resolve it: PRD XC-17 `[V]` corroborates the application, so `Required` is the expected result and the story's message column is outdated specification. GAP-D04 is likewise resolved.

Separately and unchanged: **no selector or locator knowledge is handed over**, deliberately — `pipeline.md` §3.5 assigns that to Stage `4A` at generation time. Not a gap for the Manual branch, which needs behaviour and field names, both supplied.
