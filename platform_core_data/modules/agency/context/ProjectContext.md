# Project Context — Agency

| Field | Value |
|---|---|
| Module | `agency` |
| PRD Source | `platform_core_data/knowledge_base/PRD.md` |
| PRD sections this module derives from | **§7.2 (ORG-05 – ORG-10)** primary · §6 (XC-01 – XC-23) cross-cutting · §8 (data model) · §9.1–§9.2 (message catalogue) · §10 (file storage, environments) · §11 (E2E-04) · §13 (GAP-7, GAP-8) · §15 (OQ-1, OQ-2, OQ-7) |
| In-scope requirement | `knowledge_base/requirements/user_stories/US-4222_Admin_Update_Agency.md` |
| Run Scope Type | **User Story** |
| Run Type | **User Story** |
| Pipeline branch | **Automation Pipeline** (1 → 2 → 3 → `4A` → `5A` → optional `5H` → `6A`) — **changed at Revision 3**; run-001 took the Manual branch |
| Target Environment | `http://192.168.1.70` — STG, shared staging |
| Produced by run | `run-004__2026-08-17_14-35-25__UserStory__US-4222-UpdateAgency` |
| Revision | 3 <!-- rev 3, 2026-08-17: new independent run; branch changed to Automation; safety policy now governs; mutation narrowed to self-created records; Branch-module knowledge reuse recorded --> |
| Target ref at write | `b0a6eb1` |
| Generated | 2026-08-17 |
| Status | **Approved** |
| Approved by | Revisions 1–2: Ahmed Ayman — Stage 1 Human Review gate, 2026-07-31. **Revision 3: Ahmed Ayman — Stage 1 Human Review gate, 2026-08-17**, after review of the full document and the twelve product-owner decisions at §1.2. |
| Revision 2 authored by | Ahmed Ayman (directive), 2026-07-31 — the application becomes the primary reference where US-4222 is clearly outdated; disposition taxonomy added at §1.1; Threshold fields confirmed as later enhancements |
| Revision 3 authored by | Stage 1, run-004, 2026-08-17 — see §0.1 for exactly what changed and what did not |
| Revision 3 amended | 2026-08-17 — **twelve product-owner decisions applied** (§1.2) plus five document corrections. Still `Pending Review`; the decisions are recorded, the approval of the document is not yet given. |

## 0.1 What Revision 3 changed

This module was already Approved through Stage 3 from run-001. Revision 3 is **not** a rewrite. It is a
re-check of an existing context against a freshly supplied requirement, plus the things this new run
changes. Everything not listed here or in §1.2 is unchanged from Revision 2 and still carries its original
approval.

| # | Change | Why |
|---|---|---|
| 1 | **Requirement re-checked — no drift.** The AC pasted on 2026-08-17 is identical to the 2026-07-31 transcription across all 10 ACs, Dependencies, Expected Outcome, and Reflection. | The user asked for a re-check. §2's requirement rows therefore stand unaltered. |
| 2 | **Pipeline branch changed to Automation** (`4A` → `5A` → `6A`). | User decision at this gate, 2026-08-17. Rewrites §5's execution constraints; leaves §2 and §3 scope untouched. |
| 3 | **`execution_safety_policy.json` now governs.** run-004 was created after 2026-08-07, so run-001's prose mutation override no longer applies and the machine-readable policy decides. Mutation is narrowed to **self-created Agency records**, which pulls **Create Agency into scope as a means** (§2). | Approve and Reject on a pre-existing agency are `Forbidden (absolute)` and no grant can lift that. Creating the record under test is the only way US-4222's Approve/Reject criteria are executable at all. |
| 4 | **Twelve product-owner decisions applied** — recorded once at §1.2 and threaded through §2–§8. Nine of the module's open questions are closed, answered, or deferred; none is left labelled open after being decided. | Product owner, 2026-08-17. |
| 5 | **Role authorization removed as a test target.** No role-permission case, no maker-checker separation case, no self-approval authorization case is designed in this run. | Decision 1, 6, 9. Exact role authorization belongs to the future **Role CRUD** module. |

**A note on what "new run" means here.** run-004 is independent of run-001 and does not read, continue, or
modify run-001's run artifacts. It does edit *this* file, because a module's Project Context is durable and
edited in place by whichever run refines it (`pipeline.md` §7) — that is the module's file, not run-001's.
run-001's own folder is untouched.

## 0. How to read the requirement references in this document

Every row below cites the PRD requirement it derives from, by ID. **The ID alone is not the
explanation** — each citation in §2 also states, in plain words, what that requirement says, so this
document is reviewable without opening the PRD alongside it.

**ID shape:** `<GROUP>-<NN>`, e.g. `ORG-05`. IDs are stable and are never renumbered (PRD §0.2).

| Group | What it covers | PRD section |
|---|---|---|
| `ORG` | Organisation hierarchy — Company → Branch → **Agency** → Agent | §7.2 |
| `XC` | Cross-cutting rules that repeat across every Admin module — the approval workflow (`XC-01`–`XC-07`), search/filter/paginate/export (`XC-08`–`XC-16`), and the standard field-validation message vocabulary (`XC-17`–`XC-23`) | §6 |
| `SUP` | Suppliers and Supplier Credentials (PCCs), including the cascade down to Agency | §7.5 |
| `PAY` | Payment Method master data and the supported payment instruments | §7.6 |
| `IPN` | Import PNR | §7.9 |
| `RUL` | Rule Engine — markup, discount, service charge, and the rest | §7.7 |
| `BMO` | Booking Mid Office — search, booking, quotes, manual invoice | §7.8 |
| `RPT` | Reports | §7.13 |
| `PTL` | NDC Portal (agency-facing application) | §7.14 |
| `USM` | Agency user administration | §7.11 |
| `GEO` | Geography and currency master data | §7.3 |
| `AUTH` | Authentication, OTP, passwords | §4 |
| `E2E` | End-to-end business journeys | §11 |
| `GAP` | Requirements known to exist in the business backlog with **no** automation coverage | §13 |
| `OQ` | Open questions the business has not answered | §15 |
| `DEF` | Defects and hygiene issues found while deriving the PRD | §14 |
| `NFR` | Non-functional requirements | §12 |
| `ASM` / `RSK` | **This document's own** assumption and risk IDs (§6 below) — not PRD IDs |

**Evidence tags**, attached to each PRD requirement and carried forward here:

| Tag | Meaning | How a downstream stage must treat it |
|---|---|---|
| `[V]` Verified | An automated assertion pins the behaviour — expected message, state, or value. | Settled acceptance criterion. |
| `[O]` Observed | The action is performed and the flow depends on it, but nothing asserts the outcome. | **Unconfirmed** — probe it, never assume it. |
| `[I]` Inferred | Derived from locators, field names, or menu structure only — never exercised. | **Unconfirmed** — the field/screen exists; the rule does not necessarily. |

## 1. Scope Summary

This run validates **one User Story — US-4222, [Admin] Update Agency** — against the NDC Admin Portal on
shared staging, through the **Automation Pipeline**. Its Run Scope Type is `User Story` and its Run Type is
`User Story`, which means downstream stages take the **narrowest and most literal** reading of scope: only
US-4222's own acceptance criteria are designed and automated, with no broader wandering into adjacent
Agency behaviour the story did not ask for.

The `agency` module is broader than this run. The module owns the whole agency lifecycle — create, update,
search, self-registration requests, agent login details (PRD §7.2, ORG-05 – ORG-10). **This run covers the
update flow and its approval outcome, and nothing else in the module.** §3 records what that leaves out.

**One exception, forced by the safety policy: Create Agency is exercised, but is not tested.** Approve and
Reject on an agency this run did not create are `Forbidden (absolute)`, so the only way US-4222's Approve
and Reject criteria are executable at all is against a record this run creates itself. Create Agency is
therefore **in scope as a means** — the same standing agency search already had in Revision 2 — and its own
acceptance criteria are **not** test targets. A defect found while creating a seed record is reported as an
observation against `agency`, never as a US-4222 result.

**Three requirement sources, and the rule for reconciling them** *(revised 2026-07-31, revision 2, by
explicit user directive — see §1.1)*. This replaces the original rule, which made US-4222 authoritative
outright.

| Source | Standing |
|---|---|
| **The running application** | **Primary reference where US-4222 is clearly outdated.** The story predates later enhancements; functionality has been added and changed since it was authored |
| **US-4222** | Business-authored, and the definition of *scope* for this run — but not automatically the definition of *correct behaviour* |
| **`PRD.md`** | Reverse-engineered from an automation suite, marked *Draft for business review*, every requirement tagged `[V]` verified / `[O]` observed / `[I]` inferred. Its role is now **the tie-breaker** (§1.1) |

**Every mismatch is still recorded as a Finding, fully traceable. Nothing is removed, ignored, or
silently reconciled** — what changes is the *disposition* assigned to it, not whether it is reported.

## 1.1 Requirement Disposition — the taxonomy and the discriminator

*(Added 2026-07-31 by user directive. Governs Stage 2 Findings and every Stage 3 expected result.)*

**The distinction that matters:** an *application defect* means the implementation violates current
intended behaviour; an *outdated requirement* means the implementation has legitimately evolved beyond
the original story. Collapsing the two in either direction is harmful — calling every mismatch a defect
generates noise against a working product, and calling every mismatch "story outdated" would convert a
**removed-feature regression into a documentation correction**, which is the more dangerous error and the
reason this section is a discriminator rather than a blanket rule.

**When the application and US-4222 disagree, the PRD decides which disposition applies:**

| # | What the PRD says | Disposition | Stage 3 treatment |
|---|---|---|---|
| 1 | **Corroborates the application** — a `[V]`-tagged requirement matches observed behaviour | `Story Outdated — PRD-corroborated` | Design to **observed behaviour**. Highest confidence: two sources agree the story is the outlier |
| 2 | **Silent** — neither confirms nor contradicts | `Story Outdated / Requires Business Confirmation` | Design to **observed behaviour**, and mark the expected result as resting on this directive rather than on a requirement |
| 3 | **Corroborates the story** — a requirement describes behaviour the application lacks | **`Possible Application Defect / Possible Removed Feature`** — **never** auto-dispositioned as story-outdated | Do **not** design to observed behaviour. Escalate; two independent sources expected the behaviour |
| 4 | **Superseded by explicit product-owner confirmation** | `Story Outdated — Confirmed` | Design to observed behaviour as settled. No open question remains |
| 5 | Application behaviour violates a rule **no source has superseded** | `Application Defect (candidate)` | Design the case to the requirement and let execution report the failure |

**Rows 3 and 5 are the load-bearing ones.** They are what stops "the application is the reference" from
becoming "the application is always right". A `[V]` tag on a PRD requirement means an automated assertion
once passed against that behaviour — so its absence from the UI is a change that someone should
consciously confirm, not a stale sentence to correct.

**Confirmed by the product owner, 2026-07-31:** the **Threshold-related fields are later enhancements**
and are expected to exist despite US-4222's silence. `Outstanding Threshold` is therefore disposition
row 4 — settled, not an open question.

Where the PRD is the only source for a behaviour, its evidence tag is still carried forward, so a
downstream stage never treats an `[O]`/`[I]` statement as settled acceptance criteria.

**One structural gap governs this whole context, stated once here:** the PRD contains **no requirement
describing the Agency *update* flow**. ORG-05 describes agency *creation*; XC-04 establishes only that the
maker–checker workflow applies to updates as well as creates. US-4222 is therefore the sole requirement for
the flow under test, and every PRD reference below is either cross-cutting (§6), structural (§8), or about
the *create* form whose sections the update form is assumed to mirror (ASM-002).

## 1.2 Product-owner decisions — 2026-08-17

**Stated once here, applied throughout.** Every decision below is a **product-owner answer**, not an
observation and not this stage's inference. Where a section further down acts on one, it cites `PO-n`.
Together they close or defer nine of the module's open questions; §6 records the disposition of each.

**A decision is not evidence.** `PO-7`, `PO-8`, `PO-10`, and `PO-12` describe how the application is
*intended* to behave. Stage 2 still observes each on the live Agency screens before Stage 3 asserts it — an
answer from the product owner settles *what to expect*, not *what is there*.

| ID | Decision | What it settles |
|---|---|---|
| **PO-1** | **`odeysysadmin` is approved as both the Admin actor and the Super Admin actor** for run-004, and is authorized to Create Agency test records, Update self-created ones, Send For Approval, Approve, and Reject. **Not** authorized: booking, ticketing, payments, wallet charges, top-ups, holds, refunds, voids, or similar commercial operations — restrictions for those arrive with their own modules. | Closes the §8 credential gap. Retires ASM-004 and ASM-015 as test targets. |
| **PO-2** | **Self-created records only.** Create / Update / Send For Approval / Approve / Reject act **only** on Agency records run-004 created. Shared and pre-existing Agency records are never mutated. The created Agency identifier is captured **immediately** and preserved in the execution evidence, so ownership stays provable. | Confirms the §5 mutation posture. Makes RSK-008's mitigation mandatory rather than advisory. |
| **PO-3** | **Retention accepted.** run-004 cannot delete its records, and self-created agencies may remain on STG. Minimize accumulation by **safely reusing a self-created record where test independence and validity allow it**, and **record how many Agency records each execution created**. **No cleanup through DELETE.** | Converts RSK-009 from an open risk into an accepted cost with two binding obligations. |
| **PO-4** | **Synthetic upload fixtures at a stable committed path** inside the automation test resources, containing **no real, private, production, customer, or sensitive information**. At least: a valid PDF · a valid supported image ≤ 2 MB · a non-PDF file · an image > 2 MB. Stage 3 identifies each; Stage `4A` places or references it by a **suite-resolvable path**. | Closes the §8 fixture gap. Retires RSK-004. |
| **PO-5** | **`Save as Draft` is out of scope.** Kept on record as a requirement discrepancy / future coverage item. **No test cases for it in this run.** | Settles ASM-008 as *Deferred*, not open. |
| **PO-6** | **"Role" in the Cancel open question means role-based authorization** — only certain roles may Approve or Reject. That question is **out of scope** for run-004 (Role CRUD owns it). **For the Agency update flow itself: Cancel discards unsaved Agency changes and exits without persisting them.** | Answers ASM-011 on both halves — the wording *and* the behaviour. |
| **PO-7** | **Existing documents and the Agency logo persist on Update.** They remain present when the Update form opens. **The user is not required to re-upload them on every update.** Re-upload is required only when adding, replacing, or updating that file. | Answers ASM-012. Changes AC-3/AC-4's expected behaviour on the update path. |
| **PO-8** | **The live form layout is the intended reference.** Product Access renders as a **table** with Status · Supplier Name · Credential Name · Product Name · Description. Products (`Flight`, `Others`) are selected by **product checkboxes**; suppliers (e.g. Galileo, SpiceJet) appear as **table rows**; Credential Name may be populated per applicable supplier row. For AC-9 and any PCC ambiguity, **Stage 2 observes and documents the exact live layout and controls** — no field is inferred from ambiguous row alignment in the written AC. | Answers ASM-013 by replacing a guess with an observation task. |
| **PO-9** | **No role coverage in run-004.** No role-permission cases, no self-approval authorization case. **The lack of a second account is neither a blocker nor a risk.** Assertions are limited to Agency **workflow behaviour and resulting state**, never to the correctness of the role authorization model. | Retires ASM-004, ASM-015, and RSK-003 outright. |
| **PO-10** | **Branch cannot be changed from inside the Agency Update form.** All coverage of changing Branch, and of re-inheriting Country / Product Access / Sales Contact / Supplier Credentials after such a change, is removed. **Stage 2 verifies Branch is non-editable / read-only and does not attempt to change it.** | Retires ASM-016 and rewrites the `branch` boundary in §3.1. |
| **PO-11** | **Reflection areas are impact-awareness boundaries only** for run-004 — Rule Engine, Search & Booking, NDC Portal, Reports, Top Up, and any other downstream module affected by Agency configuration. **No reflection-area test cases are created or executed.** Relationships are preserved as documented module boundaries and future full-project coverage. Revisited once enough modules are reviewed and an application-level Project Context exists. | Answers ASM-017 and confirms §3's existing exclusions as decided rather than provisional. |
| **PO-12** | **Observed behaviour sets the expected result for validation messages.** Stage 2 triggers each relevant validation **through a valid interaction**, captures the **exact displayed string including punctuation and capitalization**, does not rely on the older story wording alone, records every story-vs-application difference, and classifies it under §1.1. **Stage 3 designs expected results from the verified Stage 2 observations — never a blind exact-match against outdated or oddly punctuated US-4222 strings.** | Supersedes ASM-018. Turns ~45 fields' worth of contractual-copy risk into a Discovery obligation. |

**One consequence worth stating plainly.** `PO-1`, `PO-6`, and `PO-9` together remove role authorization
from this run entirely. That is a deliberate narrowing, and it has a cost: **run-004 will not answer whether
a maker can approve their own Agency change** (PRD `OQ-1`). The workflow is tested; the governance around it
is not. That is Role CRUD's job, and this document no longer pretends otherwise.

## 2. In Scope for This Module

| Area / Screen / Flow | Why in scope | PRD Reference — ID **and what it says** |
|---|---|---|
| **Agency Master section** — Branch, Agency Name, Country (read-only, inherited), State, City, IATA flag, Post Office Box, Company URL, Phone, Address 1/2 | US-4222 AC-1 — 11 fields with per-field validation, message, type, and mandatory/optional status | **ORG-05** `[V]` — *"An Agency is created under a Branch; the form spans Agency Master (branch, name, country inherited from branch, state, city, IATA flag, PO box, company URL, phone, address 1/2), …"* · **XC-17–XC-20** `[V]` — the platform-wide validation message vocabulary: `"Required"` for a missing mandatory field, and the standard email / phone / numeric-only messages |
| **Agency Owner Details section** — Contact Person, Email ID, Phone No. | US-4222 AC-2 | **ORG-05** `[V]` — lists *Agency Owner Details* as a section of the form · **XC-18** `[V]` — email errors read `"Please enter a valid email"` · **XC-19** `[V]` — phone errors read `"Please enter valid phone number"` |
| **Upload Document Details** — documents 1–3 (PDF), per-document Contract Start / End Date, Browse, Upload, multiple documents, displayed names, remove/update | US-4222 AC-3 — including the six behavioural rules. **`PO-7` changes the update-path expectation:** documents already stored on the agency **remain present** when the form opens, and re-upload is **not** required on every update — only when adding, replacing, or updating a file. AC-3's "Mandatory" describes the create-time rule, not a per-update obligation. | **ORG-05** `[V]` — *"Document uploads with per-document Contract Start/End dates"* · **§10** (file storage) — records that document upload is required in at least six flows, and that **the PDF constraint comes from the business story, not from automation** · **`PO-7`** |
| **Agency Logo** — image type, ≤ 2 MB, preview before submission | US-4222 AC-4. **`PO-7` applies identically:** an existing logo persists on the Update form and is not re-uploaded unless it is being replaced. | **ORG-05** `[V]` — lists *Agency Logo* as a section · **§10** (file storage) — *"image ≤ 2 MB"* is likewise **story-sourced, unverified by automation** · **`PO-7`** |
| **Wonder Travel Sales Contact** — Name, Designation, Email, Phone; defaults inherited from Branch Contact Person; changeable; multiple sales personnel | US-4222 AC-5 | **ORG-05** `[V]` — lists *Sales Contact* as a section · **ORG-03** `[V]` — defines the Branch and its *owner Name / Email / Phone*, i.e. the fields these defaults are inherited **from** |
| **Bank Account Details** — Account Number, Account Type, Bank Name; multiple accounts | US-4222 AC-6 | **ORG-05** `[V]` — lists *Bank Accounts* as a section of the form |
| **Payment Settings** — Invoice Generation, Credit Limit, Top Up limit, Target, Set Month, Set Year, Credit Terms (Days), Reaching Percentage, Warning Prompt (Days), Credit Agency, Payment Options | US-4222 AC-7 — 11 fields | **ORG-06** `[V]` — *"Agency Payment Settings capture Invoice Generation frequency, Credit Limit, Top-Up Limit, and Credit Terms (days)"* — note it covers **only those four**; the other seven fields have no PRD requirement at all · **PAY-03** `[V]` — the supported instruments are Cash, Wallet, Credit Card, Bank Transfer, plus the Banque Misr and Fawry gateways |
| **Product Access Details** — **a table** with columns Status · Supplier Name · Credential Name · Product Name · Description. Products (`Flight`, `Others`) are chosen by **product checkboxes**; suppliers (e.g. Galileo, SpiceJet) appear as **rows**; Credential Name may be populated per applicable supplier row. Inherited from Branch. | US-4222 AC-8. **`PO-8`: the live layout is the intended reference**, and it is a table — not the flat field list the AC's table implies. | **ORG-05** `[V]` — lists *Product Access* as a section · **SUP-05** `[V]` — *"Credentials cascade: a credential configured at supplier level must be visible/assignable at Branch and at Agency level"* — this is the mechanism that populates the section · **`PO-8`** |
| **Airline Supplier Credential (PCC)** — Amadeus / Galileo / Sabre filters, Search Supplier Credential PCC, Ticketing Supplier Credentials PCC, Generic Supplier PCC, Manager Name, Supplier Credential Description; defaults inherited from Supplier & Branch | US-4222 AC-9. **`PO-8`: Stage 2 must observe and document the exact live layout and available controls before Stage 3 designs anything here.** No field is inferred from the ambiguous row alignment in the written AC — that inference is explicitly prohibited. | **ORG-07** `[V]` — *"An agency is assigned one or more supplier PCCs (e.g. `Galileo Live UAE`), inherited from Supplier & Branch"* · **SUP-05** `[V]` — the same cascade as above · **`PO-8`** |
| **Import PNR toggle** — controls whether the option appears on the agency portal | US-4222 AC-10 | **ORG-05** `[V]` — the toggle is part of the agency form · **IPN-05** `[V]` — *"Import PNR must be explicitly enabled for the organisation"*; a Branch/Agency with it closed is refused with the exact message `"Selected Organization does not support import pnr functionality"` — i.e. **this toggle has an observable downstream consequence** |
| **Submit for Approval** — saves the update and submits it for review, record enters *Pending for approval* | US-4222 Expected Outcome | **XC-01** `[V]` — *"Creating or updating a governed record does not publish it; the maker clicks Send for Approval and the record enters state 'Pending for approval'"* · **XC-04** `[V]` — *"The workflow applies to updates as well as creates"* — **the one PRD requirement that confirms an update path exists at all** · **§9.2** — the literal status string is `Pending for approval` |
| **Cancel** — **discards unsaved Agency changes and exits without persisting them** | US-4222 Expected Outcome, as **settled by `PO-6`**. The story's stray *"role update process"* wording is a reference to role-based authorization, not to this behaviour, and does not qualify it. | **GEO-09** `[V]` — an update *"can be cancelled without persisting"* (Rate of Exchange) · **SUP-10** `[V]` — *"Cancelling a Flight Search Limitation edit must not persist the change"*. Neither is about Agency: together they establish cancel-must-not-persist as a **platform-wide pattern** · **`PO-6`** |
| **Approve** — the record is finalized and the change applied | US-4222 Expected Outcome. **Performed as `odeysysadmin` (`PO-1`).** **Scope limit (`PO-9`): the assertion is on the Agency workflow behaviour and the resulting record state — never on *which role is permitted* to approve.** | **XC-02** `[V]` — *"A checker Approves (thumbs-up) or Rejects (thumbs-down) the pending record"* · **XC-03** `[V]` — *"Approval and rejection both accept a free-text Remarks entry, captured as the audit reason"* · **`PO-1`, `PO-9`** |
| **Reject** — the record is declined with a reason | US-4222 Expected Outcome. **Performed as `odeysysadmin` (`PO-1`); same scope limit as Approve (`PO-9`).** | **XC-02**, **XC-03** `[V]` — as above; the story's *"provide a reason for rejection"* maps onto XC-03's Remarks field · **`PO-1`, `PO-9`** |
| **Locating the agency to update** (agency search / grid navigation) | In scope **as a means only** — reaching the record under test. Its own search semantics are not a test target of this run. | **ORG-08** `[V]` — *"Agencies are searchable, including an Active-only search"* |
| **Creating the agency under test** (Create Agency flow) | *(Added Revision 3.)* In scope **as a means only** — seeding a run-owned, run-tagged record so the Approve and Reject criteria are executable at all. **Its own acceptance criteria are not test targets**; a defect seen here is an observation, not a US-4222 result. | **ORG-05** `[V]` — the create form and its sections. Scope basis is the run-004 mutation grant, not the story. |
| **Field-level validation and messages for every field above** | US-4222 states an exact message per field. **`PO-12` changes where the expected result comes from:** Stage 2 triggers each validation through a valid interaction and captures the exact displayed string, punctuation and capitalization included; **Stage 3 designs expected results from those verified observations**, not from a blind exact-match against the story. Every story-vs-application difference is recorded and classified under §1.1. | **§9.1** — the catalogue of literal, product-owned validation strings · **GAP-7** — *"The Create-Agency story specifies ~45 fields with exact validation and message per field… only the happy path is automated; no negative field-level coverage"* — i.e. **this run is the first verification of those messages** · **`PO-12`** |
| **Branch field is read-only on the Update form** | *(Added by `PO-10`.)* Branch **cannot be changed** from inside Agency Update. Stage 2 **verifies it is non-editable and does not attempt to change it.** This is a *confirmation* case, not an inheritance-behaviour case. | **ORG-05** `[V]` — Branch is part of the agency form · **`PO-10`** |

## 3. Out of Scope for This Module

| Area / Screen / Flow | Why out of scope | Covered by | PRD Reference |
|---|---|---|---|
| **Create Agency as a *tested* flow** — its field validation, its messages, its own acceptance criteria | US-4222 is an *update* story. Creation is the same module's concern but a different flow and a different story (User Story 3 in `PRD_UserStories.md`). **Revision 3 narrows this exclusion rather than removing it:** the create form is now *exercised* to seed a record (§2), but nothing about it is *asserted*. Exercised ≠ tested. | `agency` — **different run scope** | ORG-05 |
| **Agency search as a feature** — filters, Active-only search, pagination, empty state | Not named by US-4222. Used only to reach the record under test (§2). | `agency` — different run scope | ORG-08, XC-08 – XC-16 |
| **Agency self-registration requests** (New / In-progress queue) | Not named by US-4222. | `agency` — different run scope | ORG-09 |
| **Agent Login Details search** | Not named by US-4222. | `agency` — different run scope | ORG-10 |
| **Save as Draft** | **Decided out of scope by `PO-5`**, not merely undecided. US-4222's Expected Outcome names only Submit for Approval / Cancel / Approve / Reject; PRD GAP-8 says the backlog specifies draft-save. The discrepancy **stays on record** as a future coverage item (ASM-008, now *Deferred*). **No test cases in this run.** | Nobody in this run — **recorded discrepancy, deferred** | GAP-8; `PO-5` |
| **Role authorization and role-permission coverage** — which roles may Approve or Reject, whether maker and checker must be different identities, self-approval authorization | **Removed as a test target by `PO-1`, `PO-6`, and `PO-9`.** run-004 asserts Agency **workflow behaviour and resulting state** only, never the correctness of the role authorization model. `odeysysadmin` is the approved actor for every required action; the single account is **neither a blocker nor a risk**. | **Role CRUD module** (future) | XC-06, OQ-1, OQ-2; `PO-1`, `PO-6`, `PO-9` |
| **Branch CRUD** (a named dependency of the story) | The story lists Branch CRUD as a *dependency* — the Agency form consumes branch data. Testing Branch itself is another module's job. | `branch` | ORG-03, ORG-04 |
| **Supplier / Supplier Credential CRUD** (a named dependency) | Same: consumed here as pre-existing data. | `master-supplier` | SUP-01 – SUP-07 |
| **Payment Method master data** (a named dependency) | The Payment Options checkboxes consume it; configuring it is elsewhere. | `payment-gateway` | PAY-01, PAY-02 |
| **Reflection — all five areas, and any other downstream module affected by Agency configuration** | **Settled by `PO-11`: impact-awareness boundaries only.** No reflection-area test case is created or executed in run-004. This is a **decision, not a deferral pending an answer** — the earlier "impact-awareness or in scope?" question (ASM-017) is closed. The relationships are preserved as documented module boundaries (§3.1) and as future full-project coverage, to be revisited once enough modules are reviewed and an application-level Project Context exists. | Each area's own module; **full-project execution only** | US-4222 Reflection; `PO-11` |
| ↳ **Rule Engine** | Verifying an agency-scoped rule's price effect requires flight search and fare reading. | `rule-engine` | RUL-03, RUL-13 |
| ↳ **Search & Booking** | Additionally blocked: no booking or payment action is authorized (§5, `Forbidden (absolute)`). | `search-and-booking` | BMO-01, BMO-14 |
| ↳ **NDC Portal screens** | Portal is a separate application (`http://192.168.1.92:9500`) with no credentials configured for this run. | `portal-self-service` | §1 (two applications), AUTH-24, PTL-01 |
| ↳ **Reports** | Agency Wallet / AR Ledger / Total Due would show the effect of a credit-limit change. | `reports` | RPT-01, RPT-04, RPT-10 |
| ↳ **Top Up submodule** | Additionally blocked: no wallet charge or top-up is authorized (§5, `Forbidden (absolute)`). | `company` (Admin Top-Up Request) and `portal-self-service` (Portal top-up) | ORG-13, PTL-01 – PTL-07 |
| **Agency Owner activation → Portal login** (E2E-04's second half) | Not named by US-4222; owned by the module that manages agency users. | `agency-user-administration` | USM-09, AUTH-30, E2E-04 |
| **Non-functional requirements** — performance, accessibility, concurrency, multi-browser, localisation/RTL | The PRD states these are not derivable and largely absent; nothing in US-4222 states one. | **Not tested — out of project scope for this run** | §12 (NFR-01 – NFR-06 and the "Missing" row), OQ-4, OQ-5 |

### 3.1 Module Boundaries

| Related module | Interaction | Verified by |
|---|---|---|
| `branch` | **Inheritance from the agency's Branch.** Country is read-only and inherited (AC-1); Sales Contact defaults inherit from the Branch Contact Person (AC-5); Product Access is populated from Branch (AC-8); Airline Supplier Credential defaults inherit from Supplier & Branch (AC-9). **`PO-10`: Branch cannot be changed from inside the Agency Update form.** All re-inheritance-after-Branch-change coverage is removed; Stage 2 verifies Branch is read-only and **does not attempt to change it**. The inherited *values* are still observed on the form. | **this module** — for the inherited values as displayed, and for Branch being non-editable. Whether Branch's own data is correct is `branch`'s concern. |
| `master-supplier` | **Credential cascade.** A supplier credential configured at supplier level must be assignable at Agency level (SUP-05, `[V]`, verified by `setReflectionOnAgency`). The PCC section consumes it. | **this module** for "the credential appears and can be selected"; `master-supplier` for the cascade's own correctness; **full-project execution only** for the end-to-end cascade Supplier → Branch → Agency (E2E-03). |
| `payment-gateway` | Payment Options checkboxes (AC-7) are drawn from Payment Method master data (PAY-01). **The authoritative option set is Master → Payment Gateway → Payment Method's Active entries** (ASM-014, answered) — it is not a fixed list, so a test reads the master rather than hardcoding a count. | **this module** for selectability; `payment-gateway` for the master data. |
| `import-pnr` | The Import PNR toggle (AC-10) is the switch IPN-05 reads: a disabled organisation is refused with *"Selected Organization does not support import pnr functionality"*. | **this module** for the toggle's persistence; **`import-pnr`** for the refusal behaviour it causes; **full-project execution only** for toggle → refused import. |
| `rule-engine` | Rules are scoped Country POS → Branch → **Agency** (RUL-03). An agency's identity is a rule dimension. | **`rule-engine`**, and only a full-project execution shows an agency change altering a rule's reach. |
| `reports` | Credit Limit / Top-Up Limit / Credit Terms set here surface in Agency Wallet, AR Ledger, and Total Due to NDC (RPT-01, RPT-04, RPT-10). | **`reports`** — not verified by this run. |
| `agency-user-administration` | Agency Owner Details captured here (AC-2) are the user record that module administers; owner activation gates Portal login (AUTH-30, USM-09). | **`agency-user-administration`** — not verified by this run. |
| `company` | Credit limits set here bound the Top-Up Requests that module processes (ORG-13). | **`company`** — not verified by this run. |
| `authentication` | An `odeysysadmin` session is a precondition for reaching the form. | **`authentication`** — assumed working, not a test target. Stage 2 confirms login succeeds before anything else, as an environment check rather than a test case. |
| **Role CRUD** *(future module, not yet proposed)* | Owns the question `PO-9` removed from this run: which roles may Approve or Reject, and whether maker and checker must be different identities (XC-06, PRD `OQ-1`, `OQ-2`). | **Role CRUD** — **explicitly not verified by run-004.** The boundary is recorded so the gap stays visible rather than looking like coverage. |

## 4. Roles & Credentials Required

> **Corrected at Revision 3.** An earlier draft of this section said the credentials file was *absent*
> while §8 said it existed. **The file exists** — `platform_core_data/knowledge_base/credentials/credentials.json`,
> created 2026-08-03, git-ignored. What is **not** yet established is that the credentials in it still work
> on this environment: they have **not been re-verified in run-004**. **Stage 2 verifies login before
> anything else** and reports a blocker if it fails. Existing ≠ verified, and this document no longer
> conflates the two.

**One account, both actors (`PO-1`).** `odeysysadmin` is the approved actor for every Admin-side Agency
operation this run needs. There is no second identity, and **none is needed** — `PO-9` states plainly that
the single account is neither a blocker nor a risk, because role authorization is not being tested.

| Role / actor | Authorized for, in this run | Credential source | PRD Reference |
|---|---|---|---|
| **`odeysysadmin`** — standing in as **both Admin and Super Admin** (`PO-1`) | **Create** Agency test records · **Update** self-created Agency records · **Send For Approval** · **Approve** · **Reject**. Also: navigate Admin → Agency, open a record, edit every section, and Cancel. | `knowledge_base/credentials/credentials.json` — **exists (2026-08-03), git-ignored, resolved at runtime, not yet re-verified in run-004** | §2 (Actors), AUTH-01, XC-02 |
| **`odeysysadmin` — explicitly NOT authorized for** | Booking, ticketing, payments, wallet charges, top-ups, holds, refunds, voids, or similar commercial operations. Restrictions for those arrive with their own modules. | — | `PO-1`; `execution_safety_policy.json` (all `Forbidden (absolute)`) |
| Agency Owner / Agent (Portal) | **Not required.** Portal-side reflection is out of scope (`PO-11`, §3). | — | AUTH-24, PTL-01 |

**What this section deliberately no longer claims.** Revision 2 said a Super Admin was *required as a
separate checker* because "a maker may not approve their own change". That was an `[I]`-tagged inference,
never asserted, and `PO-9` removes it as a test target. **run-004 does not test who is allowed to approve.**
It uses an approved account to drive the workflow and asserts the workflow's behaviour and resulting state.

**No credential value appears in this artifact, and none may be written into any downstream artifact,
tool call, or report.**

## 5. Environment Constraints

> **Revised at Revision 3 (2026-08-17).** The Manual-branch rows are gone — this run takes the Automation
> branch — and the prose mutation override is replaced by the machine-readable policy. run-004 was created
> after 2026-08-07, so **`knowledge_base/execution_safety_policy.json` decides what may execute**, evaluated
> through `platform_core/tools/execution_safety/`. A stage does not interpret prose to decide; it calls the
> evaluator. The rows below state the consequences a test designer needs to know, not a second rulebook.

| Constraint | Implication for downstream stages | Source |
|---|---|---|
| **Shared staging, not isolated** — other testers and teams hold live data on `http://192.168.1.70` | Never assume a record you did not create is stable. Every ownership classification (`SelfCreated` vs `Shared`) is a real distinction with different permissions, not bookkeeping. | run configuration; `execution_safety_policy.json` |
| **Mutation is limited to Agency records this run creates.** `CREATE / UPDATE / APPROVE / REJECT SelfCreated` are authorized by the human grant of 2026-08-17. | Stage 2 and Stage `5A` create their own agencies, tagged and identifiable, then act on those. They may **not** create or edit a Branch, Supplier, Staff, Role, Payment Method, or any reference data — reading it to populate a dropdown is fine. | run configuration — *Run-specific mutation grant — run-004* |
| **`APPROVE Shared` and `REJECT Shared` are `Forbidden (absolute)`.** No human grant can lift an absolute Forbidden; the evaluator refuses it. | This is **why** Create Agency is in scope as a means (§1, §2). A test case that would approve a pre-existing agency is not designed — it is redesigned to act on a self-created one. | `execution_safety_policy.json` |
| **`DELETE` is not authorized in any form** — absolute for `Shared`/`Unknown`, and not requested for `SelfCreated`. **`PO-3` accepts this** rather than working around it. | Records this run creates are **left in place**, tagged. **No cleanup through DELETE**, and no test case ends by deleting its fixture. Two binding obligations replace cleanup: **reuse a self-created record wherever test independence and validity allow**, and **record how many Agency records each execution created**. | `execution_safety_policy.json`; run-004 grant; `PO-3` |
| **The created Agency identifier is captured immediately** (`PO-2`) and preserved in the execution evidence | Ownership must stay provable for the life of the record. Capture happens **at creation, before any other action** — not reconstructed afterwards from a grid. Without it, an Approve cannot be shown to have acted on an authorized record. | `PO-2`; RSK-008 |
| **No bookings, payments, wallet charges, top-ups, holds, ticketing, refunds, or voids** — `Forbidden (absolute)`, even to verify a Reflection-area effect | Downstream-effect verification is limited to searching and reading. Any case needing a booking or a charge is designed in full and marked `Deferred / Requires Authorization`. | `execution_safety_policy.json` |
| **Headed vs Headless is asked immediately before every execution** — including reruns, verification runs, and regression runs | The Automation branch does not fix the mode the way `4M` did. It is **never inferred** from the previous run and never assumed from this document. | user standing instruction |
| **Every selector must be verified live** against the running application before Stage `4A` emits it | Stage `4A` uses the headless Playwright MCP server to confirm each locator, and consults the shared Selector Verification and Repair knowledge before generating. No locator is written from a snapshot alone. | `pipeline.md` (Stage `4A`) |
| **The automation framework is fixed, not chosen** — the SHAFT structure in `knowledge_base/automation_framework.md` | Stage `4A` follows that structure. It does not select, propose, or invent a framework, and does not copy `modules/branch/automation/` as a template. | user standing instruction; `automation_framework.md` |
| **Destructive negative cases are deferred, not asked about** — account lockout, brute force, and equivalents | Design the case, mark it `Deferred / Requires Dedicated Environment`, state why, continue. Never ask, never silently drop. Directly relevant: AUTH-11 locks an account after three failed OTP attempts. | `pipeline.md` §5.5; run configuration |
| **Upload fixtures are synthetic and committed** (`PO-4`) — at a stable path inside the automation test resources, containing **no real, private, production, customer, or sensitive information**. At minimum: a valid PDF · a valid supported image ≤ 2 MB · a non-PDF file · an image > 2 MB. | **Stage 3 identifies each required fixture by name and purpose; Stage `4A` places or references it by a suite-resolvable path.** A scratchpad file will not do — an automated rerun cannot depend on a file deleted after the session. **This is a change from Revision 2**, which sent them to the scratchpad because only a human was going to use them. The synthetic-content rule is not optional: these files are committed to the repository. | US-4222 AC-3, AC-4; §10 (file storage); `PO-4` |
| **Plain HTTP on a LAN address** | Reachable only from inside the network. Reachability is unverified for this run — Stage 2 confirms it first. If browser navigation times out, probe over raw HTTP before declaring a blocker: on `branch` run-003 an apparent outage was local tooling, not the application. | §10 (reference environments); run configuration; `branch` reuse item R-4 |
| **One account covers both actors** — `odeysysadmin` is approved as Admin and Super Admin (`PO-1`) | **Neither a blocker nor a risk** (`PO-9`). No role-permission case, no maker-checker separation case, and no self-approval authorization case is designed. Assertions cover **Agency workflow behaviour and resulting state only**, never the correctness of the role authorization model. | run configuration — Credentials; `PO-1`, `PO-9` |
| **Expected results for validation messages come from Stage 2 observation, not from the story** (`PO-12`) | Stage 2 triggers each validation **through a valid interaction** (see `branch` reuse R-1 — a scripted `.value` assignment does not trigger real validation), captures the exact displayed string with punctuation and capitalization, and records every story-vs-application difference under §1.1. Stage 3 designs from those observations. **No blind exact-match against outdated US-4222 strings.** | `PO-12`; §9.1 |
| **Branch is read-only on the Update form and must not be changed** (`PO-10`) | Stage 2 **verifies** non-editability; it does not attempt an edit. No re-inheritance-after-Branch-change coverage exists in this run. | `PO-10` |

## 6. Carried-Forward Assumptions & Risks

| ID | Type | Statement (meaning preserved) | Affected Module(s) | PRD Reference |
|---|---|---|---|---|
| ASM-001 | Assumption | The PRD was **reverse-engineered from an automation suite**, is marked *Draft for business review*, and is **not business-approved**. Every requirement carries `[V]` verified / `[O]` observed / `[I]` inferred; `[O]` and `[I]` must be **probed, never treated as settled acceptance criteria**. Where automation and business intent disagree, business intent wins. | all | §0, §0.1, §17 |
| ASM-002 | Assumption | **The PRD contains no requirement describing the Agency *update* flow.** ORG-05 describes creation; XC-04 establishes only that the maker–checker workflow covers updates. The update form's section list is *assumed* to mirror the create form's. US-4222 is the sole requirement for the flow under test. | `agency` | ORG-05, XC-04 |
| ASM-003 | Assumption | Agency PCCs are **inherited from Supplier & Branch** — an agency does not define credentials of its own. | `agency`, `master-supplier`, `branch` | ORG-07 `[V]`, SUP-05 `[V]` |
| ASM-004 | ~~Assumption~~ **Retired — Out of Scope (`PO-9`)** | **"Self-approval is assumed prohibited but never proven."** Retired as a test target. `PO-1` approves `odeysysadmin` for both actors; `PO-9` removes role-permission and self-approval authorization cases from this run. **run-004 does not test who may approve.** The underlying question (XC-06, PRD `OQ-1`) is real and stays open **for the Role CRUD module** — it is not answered here and must not be reported as covered. | Role CRUD (future) | XC-06 `[I]`, OQ-1; `PO-1`, `PO-9` |
| ASM-005 | Assumption | **Credit enforcement behaviour is unspecified.** What actually happens at the credit limit, the top-up limit, the reaching-percentage threshold, and past credit terms in days is configured everywhere and exercised nowhere. Setting these fields is testable; their *effect* is not. | `agency`, `company`, `reports` | OQ-7 |
| ASM-006 | ~~Assumption~~ **Deferred to Role CRUD (`PO-9`)** | **The complete approval matrix is unknown** — which record types require approval, and which role approves each. Still true, still unanswered, but **no longer this run's concern**: run-004 asserts workflow behaviour, not the authorization model. Carried as a documented boundary (§3.1) so the gap stays visible. | Role CRUD (future) | OQ-2; `PO-9` |
| ASM-007 | Assumption | **The agency field-level validation matrix has no existing coverage.** The business story specifies ~45 fields with an exact validation and message each; only the happy path was ever automated, with no negative field-level coverage. This run is the first verification of those messages. | `agency` | GAP-7 |
| ASM-008 | ~~Open Question~~ **Deferred — Future Coverage (`PO-5`)** | **Draft-save discrepancy.** The backlog specifies "submit for approval **or save as draft**"; draft save was never automated; US-4222's Expected Outcome does not mention a draft. **`PO-5` puts `Save as Draft` out of scope for run-004 and directs that the discrepancy stay on record as a future coverage item.** No test cases in this run. The discrepancy is **deferred, not resolved** — nobody has established whether the form has a draft option. | `agency` | GAP-8; `PO-5` |
| ASM-009 | Assumption | The **PDF-only** document constraint and the **image ≤ 2 MB** logo constraint come from the business story, **not** from automation — no automated check pins either. | `agency` | §10 (file storage) |
| ASM-010 | Assumption | Reference test data in the source suite **hardcodes environment-specific records** (e.g. branch `AboBakrTravel (BRN471)`) and past dates. Any such record named in a test case must be re-confirmed to exist on the current environment rather than assumed. | all | DEF-6 |
| ASM-011 | ~~Open Question~~ **Answered (`PO-6`)** | **Story OQ #1** — "Cancel: clears unsaved changes or exits the **role** update process." **Answered on both halves.** The word *role* refers to **role-based authorization** (only certain roles may Approve or Reject), not to a Role-story copy-paste — and that question is out of scope for run-004 (Role CRUD owns it). **For the Agency update flow: Cancel discards unsaved Agency changes and exits without persisting them.** That is the behaviour Stage 3 designs to. | `agency` | US-4222 Open Questions; `PO-6` |
| ASM-012 | ~~Open Question~~ **Answered (`PO-7`)** | **Story OQ #2/#3** — must documents and the logo be re-uploaded on every update? **No.** Files already stored on an agency **remain present** when the Update form opens. Re-upload is required **only when adding, replacing, or updating** that file. AC-3's and AC-4's "Mandatory" describes the create-time rule, inherited by this form — not a per-update obligation. §2's AC-3 and AC-4 rows carry the revised expectation. | `agency` | US-4222 Open Questions; `PO-7` |
| ASM-013 | ~~Open Question~~ **Converted to a Stage 2 observation task (`PO-8`)** | **Story OQ #4** — the AC-9 table's ambiguous "Filter" column alignment. **Not answered by re-reading the AC, and deliberately so:** `PO-8` makes the **live form layout the intended reference** and **prohibits inferring separate fields from ambiguous row alignment**. Stage 2 **observes and documents the exact live layout and available controls** for AC-9 and every PCC-related ambiguity; Stage 3 designs from that record. Known shape for the adjacent Product Access section: a table of Status · Supplier Name · Credential Name · Product Name · Description, with product checkboxes and per-supplier rows. | `agency` | US-4222 Open Questions; `PO-8` |
| ASM-014 | ~~Open Question~~ **Answered (Revision 3)** | **Story OQ #5** — "Payment Options (e.g. Cash, Wallet, Credit Card, etc.)" gives no authoritative complete set. **It does have one:** the checkbox list is sourced from **Master → Payment Gateway → Payment Method**, and its size (~34 Active entries, Online/Offline) is intended cross-module reflection. Confirmed on the Branch form and dispositioned by the module owner. **The count is not fixed** — it tracks whatever is Active in that master, so a test must read the master rather than hardcode a number, and must re-observe the list on the Agency form before asserting it. | `agency`, `payment-gateway` | `knowledge/business/rules/APP-002`; `branch` reuse R-9; PAY-03 |
| ASM-015 | ~~Open Question~~ **Deferred to Role CRUD (`PO-9`)** | **Story OQ #6** — "authorized users (e.g. supervisors)" for Approve/Reject: which role(s), and must the approver differ from the maker? **Out of scope for run-004.** `odeysysadmin` performs both sides under `PO-1`; no case asserts who is *permitted* to. The question remains genuinely unanswered and belongs to Role CRUD. | Role CRUD (future) | US-4222 Open Questions; OQ-1, OQ-2; `PO-9` |
| ASM-016 | ~~Open Question~~ **Retired (`PO-10`)** | **Story OQ #7** — does changing `Branch` re-inherit and overwrite Country, Product Access, and Sales Contact? **The question does not arise: Branch cannot be changed from inside the Agency Update form.** All coverage of Branch change and post-change re-inheritance is removed. Stage 2 **verifies Branch is non-editable / read-only and does not attempt to change it** (§2, §3.1, §5). | `agency`, `branch` | US-4222 Open Questions; `PO-10` |
| ASM-017 | ~~Open Question~~ **Answered (`PO-11`)** | **Story OQ #8** — are the Reflection areas in scope, or impact awareness only? **Impact awareness only, for run-004** — Rule Engine, Search & Booking, NDC Portal, Reports, Top Up, and any other downstream module affected by Agency configuration. **No reflection-area test cases are created or executed.** Relationships stay recorded as module boundaries (§3.1) and future full-project coverage, revisited once enough modules are reviewed and an application-level Project Context exists. This is a **decision**, not a pending answer. | `agency` + the named modules | US-4222 Reflection; `PO-11` |
| ASM-018 | ~~Open Question~~ **Superseded by method (`PO-12`)** | **Story OQ #9** — are the oddly punctuated strings (`"Please enter a valid phone no.."`, `"Please enter a valid description"`) what the application actually renders? **No longer a question to answer up front — it is a Discovery obligation.** Stage 2 triggers each validation through a valid interaction, captures the exact displayed message including punctuation and capitalization, records every story-vs-application difference, and classifies it under §1.1. **Stage 3 designs expected results from those verified observations, never a blind exact-match against the story.** | `agency` | US-4222 Open Questions; §9.1; `PO-12` |
| RSK-001 | **Risk — rewritten (Revision 3)** | **Concurrent modification.** *No longer about picking a shared agency:* run-004 acts **only on records it creates** (`PO-2`), so no other team's agency is selected, read as a baseline, or modified. **The residual exposure is narrower and real:** the **shared reference data** a self-created agency depends on — Branch, Supplier, Payment Method, Country/State/City — can change mid-run and shift what the form offers. Mitigation: capture the reference values the record was created with, and re-read rather than assume when a dropdown's contents matter to an assertion. **Do not "prefer a low-traffic agency" — do not select an existing agency at all.** | `agency` | run configuration; `PO-2` |
| RSK-002 | **Risk — rewritten (Revision 3)** | **Commercial configuration on shared staging.** *No longer about editing a live agency's settings:* Credit Limit, Payment Options, and PCCs are changed **only on run-004's own records**, so no other tester's agency configuration is altered and **no restore step is needed or performed.** **The residual exposure:** a self-created agency is still a real, visible record on shared staging — it appears in other people's searches and, once approved, is live configuration in its own right. Mitigation: the run-tag makes it identifiable as test data (`PO-2`), and its count is recorded per execution (`PO-3`). **The "restore original values after each mutating case" instruction from Revision 2 is withdrawn — there are no original values to restore.** | `agency` | RUL-03, SUP-05; run configuration; `PO-2`, `PO-3` |
| RSK-003 | ~~Risk~~ **Retired (`PO-9`)** | **"Approve/Reject may be unexecutable with one identity."** Retired outright. `PO-9` states the single account is **neither a blocker nor a risk**, and `PO-1` approves `odeysysadmin` for both sides of the workflow. The identity-count concern is gone; RSK-008 (record ownership) is the risk that actually governs Approve and Reject. | `agency` | XC-06, OQ-1; `PO-1`, `PO-9` |
| RSK-004 | ~~Risk~~ **Closed by decision (`PO-4`)** | **"Upload negative paths need deliberately bad fixtures."** Closed: `PO-4` directs that synthetic fixtures be created at a stable committed path — a valid PDF, a valid image ≤ 2 MB, a non-PDF, and an image > 2 MB. **Closed by a decision, not by the files existing yet**; §8 tracks the outstanding work. Two conditions ride with it: the content must be **synthetic and non-sensitive** (they are committed to the repository), and the path must be **suite-resolvable** (`PO-4`, §5). | `agency` | US-4222 AC-3, AC-4; `PO-4` |
| RSK-005 | Risk | **Non-functional requirements are absent from the PRD** — no availability, capacity, response-time, retention, PCI-DSS, GDPR/passport-handling, audit-log, or accessibility requirement exists to test against. This run makes no non-functional claim. | all | §12 ("Missing" row) |
| RSK-006 | Risk | **No audit log exists to verify the change trail.** `Rule History` exists for rules; a general audit log is a known gap. An agency update's audit trail can therefore only be observed as approval state, not as a log entry. | `agency` | GAP-4 |
| RSK-007 | Risk | **`[O]`/`[I]`-tagged behaviour may not exist as described.** Several Agency-adjacent statements are inferred from locators or field names alone. A test case built on one may fail because the requirement was never real — that is a requirements defect, not necessarily a product defect, and must be classified as such. | `agency` | §0.1, §0.3 |
| RSK-008 | **Risk — mitigation now mandatory (`PO-2`)** | **An untagged self-created record is indistinguishable from a shared one after the fact.** The grant's boundary is "records this run created". Without a captured, run-tagged identifier a later Approve cannot prove it acted on an authorized record — and Approve on a shared record is `Forbidden (absolute)`. **`PO-2` makes the mitigation a directive rather than advice:** capture the identifier **immediately at creation**, before any other action, and **preserve it in the execution evidence**. | `agency` | run-004 mutation grant; `PO-2` |
| RSK-009 | **Risk — accepted, with two obligations (`PO-3`)** | **Records accumulate and are never cleaned up.** `DELETE` is not authorized in any form, so every agency this run creates stays on shared staging permanently, and every rerun adds more. **`PO-3` accepts this explicitly.** Two binding obligations replace cleanup: **(1)** reuse a self-created record **where test independence and test validity allow it** — reuse never at the cost of a valid test; **(2)** **record how many Agency records each execution created**. **No cleanup through DELETE.** An accepted cost, recorded — not a defect to fix silently, and not a reason to skip a test. | `agency` | `execution_safety_policy.json`; run-004 grant; `PO-3` |
| RSK-010 | Risk | *(New, Revision 3.)* **Automation-branch drift risk on a form of ~45 fields.** Stage `4A` verifies every selector live, but the Agency form is built on PrimeNG widgets whose DOM shape differs from their apparent control (`p-dropdown`, `p-calendar`, `p-multiselect`). A locator written against the hidden native input rather than the wrapper compiles, runs, and silently does nothing. Mitigation: apply the shared PrimeNG repair patterns (REP-004 … REP-009) **before** generating, not after the first failure. | `agency` | `knowledge/patterns/repair/`; `branch` reuse R-8 |

## 6.1 Knowledge reused from the `branch` module

*(Added Revision 3, on user direction, 2026-08-17.)*

Reusable knowledge, patterns, conventions, and validated solutions from `branch` are carried into this run.
**Branch-specific test data, selectors, assumptions, defects, and artifacts are not.** Nothing was copied
into this module; every item is cited by its `modules/branch/…` path and read from there.

**The rule applied:** a *method* transfers; a *fact about Branch* does not. The full item-by-item record,
including what was deliberately excluded and why, is at
[`runs/run-004…/metadata/BranchKnowledgeReuse.md`](../../../runs/run-004__2026-08-17_14-35-25__UserStory__US-4222-UpdateAgency/metadata/BranchKnowledgeReuse.md).

| Ref | Reused | Effect here |
|---|---|---|
| R-1 | Max-length probes must drive **real keystrokes**, never assign `element.value` — a scripted assignment bypasses HTML `maxlength` and reports a false "no cap". | Applies to seven Agency numeric fields. On `branch` this method defect produced three false findings. |
| R-2 | Read a pre-filled Update form by **polling**, not one fixed-delay sample. | US-4222 is an update story; ~45 fields are read pre-filled. The highest-value transfer in this list. |
| R-3 | Probe PrimeNG **widget-aware**; a native `input`/`select` scan under-reports controls that are present. | Agency's form is dense with PrimeNG dropdowns, calendars, and multi-selects. |
| R-4 | On a navigation timeout, probe over **raw HTTP** before raising a blocker. | Decides whether a Stage 2 environment blocker is real. |
| R-5 | **Record rejected finding candidates** — a dismissed candidate is a result, not an absence of one. | Adopted as this run's Discovery convention. |
| R-6 | A **Create-screen disposition does not automatically transfer to Update** (stored value ≠ form default). Where it cannot transfer, record *not comparable*. | AC-10's Import PNR toggle is exactly this shape. |
| R-7 | ~~One account **is** the self-approval configuration.~~ **Superseded by `PO-9`.** | **No longer applied.** The method was sound, but `PO-9` removes self-approval authorization from this run's scope entirely, so there is nothing here for it to enable. RSK-003 is retired and ASM-004 is deferred to Role CRUD. Retained in the table so the reuse record stays complete and its withdrawal is visible. |
| R-8 | PrimeNG interaction patterns — wrapper not hidden input; filter-then-select with exact-prefix match on `"Name (Code)"`; `p-calendar` needs keystrokes; a repeatable "Add" creates a second required row; poll for post-submit navigation. | Platform-scope patterns (REP-004 … REP-009), mandatory reading for Stage `4A`. See RSK-010. |
| R-9 | Payment Options are sourced from **Master → Payment Gateway → Payment Method**; the long list is intended. | Answers ASM-014. Also **pre-disposes** this module's existing `FINDING-003_PaymentOptionDataPollution` — Stage 2 re-checks it against APP-002 rather than re-raising it. |
| R-10 | Phone fields expect the **national number only**, no literal `+` prefix, despite the AC's wording. | Applies to all three US-4222 phone fields. A known AC-vs-application mismatch, not a new finding. |
| R-11 | The submit control reads **"Send For Approval"**, not "Submit for Approval" — module owner confirmed the AC is stale. | US-4222's Expected Outcome says "Submit for Approval". Disposition **row 1** under §1.1. **`PO-12` governs how this resolves on Agency:** Stage 2 captures the button's actual label; Stage 3 asserts what was captured. The Branch answer is a prior, not the expected result. |

### The Agency / Branch evidence boundary

**Strict separation, restated because Revision 3 leans on Branch more than any prior revision.**

| | |
|---|---|
| **What crosses** | **Methodology only** — how to probe, how to read, how to avoid a known false result. Plus application-domain facts already promoted to the shared `knowledge/` tree (`APP-002`, `BR-005`), which are citable precisely because they are no longer Branch's private observations. |
| **What never crosses** | Branch test data, selectors, page objects, findings, assumptions, risks, artifacts, and mutation grants. None is copied into `modules/agency/`; each reused item is cited by its `modules/branch/…` path and read from there. |
| **The standing rule** | **Every item in the table above is re-observed on the Agency screens before any test asserts it.** A fact confirmed on Branch is a **strong prior about this application** — never evidence about this form. |
| **Where evidence lands** | Agency evidence in `modules/agency/discovery/evidence/`; Branch evidence stays in `modules/branch/`. A Stage 2 Finding for Agency cites **Agency** evidence. A Branch citation may appear as *context for why we looked*, never as the proof. |

**The failure this prevents:** carrying a Branch conclusion into an Agency report would produce a finding —
or worse, a *passing* test — that no one ever observed on the Agency screens. Under `PO-12` that is already
prohibited for validation messages; this subsection extends the same discipline to every reused item.

## 7. Traceability Anchor

| Context Item | Section here | PRD Reference |
|---|---|---|
| Agency form section list (Master, Owner, Documents, Logo, Sales Contact, Bank Accounts, Payment Settings, Product Access, PCC, Import PNR) | §2 | ORG-05 `[V]` |
| Payment Settings fields (Invoice Generation, Credit Limit, Top-Up Limit, Credit Terms) | §2 | ORG-06 `[V]` |
| PCC inheritance from Supplier & Branch | §2, §3.1 | ORG-07 `[V]`, SUP-05 `[V]` |
| Locating an agency (search) | §2 | ORG-08 `[V]` |
| Maker–checker: Send for Approval → *Pending for approval* → Approve/Reject with Remarks, on updates as well as creates | §2 | XC-01 – XC-04 `[V]` |
| Cancel must not persist | §2 | GEO-09, SUP-10 `[V]` |
| Platform validation vocabulary (`Required`, email, phone, numeric-only) and success/empty-state strings | §2, ASM-018 | XC-17 – XC-22, §9.1, §9.2 |
| Import PNR toggle and the refusal it causes | §2, §3.1 | ORG-05, IPN-05 `[V]` |
| Document / logo upload constraints | §2, ASM-009 | §10 |
| Actor: `odeysysadmin` as both Admin and Super Admin | §4 | §2 (Actors), XC-02; `PO-1` |
| Role authorization excluded from this run | §3, §3.1, ASM-004, ASM-006, ASM-015 | XC-06, OQ-1, OQ-2; `PO-1`, `PO-6`, `PO-9` |
| Branch read-only on the Update form | §2, §3.1, §5, ASM-016 | ORG-05; `PO-10` |
| Existing documents and logo persist on Update | §2 (AC-3, AC-4), ASM-012 | §10; `PO-7` |
| Product Access renders as a table; PCC layout observed, not inferred | §2 (AC-8, AC-9), ASM-013 | ORG-05, ORG-07, SUP-05; `PO-8` |
| Validation expected results derive from Stage 2 observation | §2, §5, ASM-018 | §9.1; `PO-12` |
| Reflection areas are impact-awareness boundaries only | §3, §3.1, ASM-017 | US-4222 Reflection; `PO-11` |
| Target environment `http://192.168.1.70` | §5 | §10 (reference environments) |
| Agency data model (credit limit, invoice frequency, payment options, documents + contract dates, logo, bank accounts, PCCs, import-PNR flag) | §2 | §8 |
| Agency onboarding → Portal access (boundary, out of scope) | §3, §3.1 | E2E-04 |
| Field-level validation matrix has no prior coverage | ASM-007 | GAP-7 |
| Draft-save discrepancy | §3, ASM-008 | GAP-8 |
| Credit enforcement behaviour unspecified (still open) | ASM-005 | OQ-7 |
| Absent non-functional requirements | §3, RSK-005 | §12 |

## 8. Open Questions — Requires Run Configuration

*(Rewritten at Revision 3, then again after the §1.2 decisions.)*

### 8.1 Closed

| Was missing / open | Now |
|---|---|
| Admin credentials | ✅ `credentials/credentials.json` **exists** (2026-08-03). ⚠️ **Not re-verified in run-004** — Stage 2 verifies login before anything else and reports a blocker if it fails. *Existing is not verified; §4 no longer says otherwise.* |
| Admin-actor confirmation | ✅ **Granted for run-004 by `PO-1`.** `odeysysadmin` is approved as both Admin and Super Admin. No longer inherited from run-003's directive. |
| A second identity for Approve/Reject | ✅ Not needed and **not a risk** (`PO-9`). RSK-003 retired. |
| Which agency record to update | ✅ Moot — this run **creates** its own records (`PO-2`). |
| Upload fixtures — *should they exist and where* | ✅ **Decided by `PO-4`.** Synthetic, non-sensitive, at a stable committed path in the automation test resources. The *decision* is closed; the *work* is tracked at §8.3. |
| Record retention / cleanup | ✅ **Accepted by `PO-3`**, with reuse-where-valid and per-execution record counts. No DELETE. |

### 8.2 Story Open Questions — **count corrected**

Revision 3 said *"seven"* and listed **eight** IDs. The correct figure after the §1.2 decisions is neither:

> **Zero of US-4222's nine story Open Questions remain open for run-004.**

| Disposition | Count | IDs |
|---|---|---|
| **Answered** | 4 | ASM-011 (`PO-6`) · ASM-012 (`PO-7`) · ASM-014 (`APP-002`) · ASM-017 (`PO-11`) |
| **Retired — the question no longer arises** | 1 | ASM-016 (`PO-10`) |
| **Converted to a Stage 2 observation task** | 2 | ASM-013 (`PO-8`) · ASM-018 (`PO-12`) |
| **Deferred, still genuinely unanswered** | 2 | ASM-008 → future coverage (`PO-5`) · ASM-015 → Role CRUD (`PO-9`) |

**"Deferred" is not "answered."** ASM-008 and ASM-015, plus ASM-004 and ASM-006, are open questions that
**someone still has to answer — just not in this run, and not by this module.** They are recorded so the
gap stays visible and is never reported as coverage.

### 8.3 Outstanding work — decided, not yet done

Not questions. Tracked here so nothing decided quietly fails to happen.

| Item | Owner | Sections |
|---|---|---|
| **Build the four synthetic upload fixtures.** Valid PDF · valid supported image ≤ 2 MB · non-PDF file · image > 2 MB. Synthetic and non-sensitive — they are committed. | Stage 3 identifies each by name and purpose; Stage `4A` places them and wires a suite-resolvable path. | §5, RSK-004, `PO-4` |
| **Verify `odeysysadmin` can log in** on `http://192.168.1.70`. | Stage 2, before any other action. | §4, §5 |
| **Observe and document the live AC-8 / AC-9 layout and controls.** | Stage 2. Stage 3 designs from that record, never from the AC's row alignment. | §2, ASM-013, `PO-8` |
| **Capture every validation message exactly as displayed**, via a valid interaction. | Stage 2. Stage 3 derives expected results from it. | §2, §5, ASM-018, `PO-12` |
| **Verify Branch is read-only** on the Update form — without attempting to change it. | Stage 2. | §2, §3.1, ASM-016, `PO-10` |

### 8.4 Still requires a human decision

Two items, neither blocking Stage 1 approval.

| # | Decision needed | Why it is yours, and my recommendation |
|---|---|---|
| 1 | **Where exactly the upload fixtures live.** `PO-4` says "within the automation test resources"; `agency` has no automation package yet, so no such folder exists to put them in. | A repo-structure call, so I recommend rather than default. **Recommendation:** `platform_core_data/automation_baseline/shaft/tests_SHAFT/src/test/resources/testDataFiles/agency/uploads/` — `testDataFiles/` is the SHAFT baseline's existing test-resource root, so the path is suite-resolvable on day one and needs no new convention. **Confirm or name a different path**; Stage `4A` needs it settled before it writes the upload steps. |
| 2 | **Whether to register a `Role CRUD` module now.** Four items are deferred to it — ASM-004, ASM-006, ASM-015, and RSK-003's underlying question — and it does not exist in `modules.json`. | Only Stage 1 may *propose* a module and only you may approve one. **Recommendation: not yet.** Proposing it now would be a placeholder with no requirement behind it; the deferrals are already recorded as a `Role CRUD` boundary in §3.1, which keeps the gap visible without asserting a module exists. **Say so if you would rather it be proposed at this gate.** |
