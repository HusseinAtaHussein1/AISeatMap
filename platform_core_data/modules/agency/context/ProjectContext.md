# Project Context — Agency

| Field | Value |
|---|---|
| Module | `agency` |
| PRD Source | `platform_core_data/knowledge_base/PRD.md` |
| PRD sections this module derives from | **§7.2 (ORG-05 – ORG-10)** primary · §6 (XC-01 – XC-23) cross-cutting · §8 (data model) · §9.1–§9.2 (message catalogue) · §10 (file storage, environments) · §11 (E2E-04) · §13 (GAP-7, GAP-8) · §15 (OQ-1, OQ-2, OQ-7) |
| In-scope requirement | `knowledge_base/requirements/user_stories/US-4222_Admin_Update_Agency.md` |
| Run Scope Type | **User Story** |
| Run Type | **User Story** |
| Pipeline branch | **Manual Execution Pipeline** (1 → 2 → 3 → `4M`) |
| Target Environment | `http://192.168.1.70` — STG, shared staging |
| Produced by run | `run-001__2026-07-31_11-56-38__UserStory__US-4222UpdateAgency` |
| Revision | 2 <!-- rev 2, 2026-07-31: user directive replaced the requirement-reconciliation rule and added the §1.1 disposition taxonomy --> |
| Target ref at write | `f700944` |
| Generated | 2026-07-31 |
| Status | **Approved** |
| Approved by | Ahmed Ayman — Stage 1 Human Review gate, 2026-07-31 |
| Revision 2 authored by | Ahmed Ayman (directive), 2026-07-31 — the application becomes the primary reference where US-4222 is clearly outdated; disposition taxonomy added at §1.1; Threshold fields confirmed as later enhancements |

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
shared staging, through the **Manual Execution Pipeline** only. Its Run Scope Type is `User Story` and its
Run Type is `User Story`, which means downstream stages take the **narrowest and most literal** reading of
scope: only US-4222's own acceptance criteria are designed and executed, with no broader wandering into
adjacent Agency behaviour the story did not ask for.

The `agency` module is broader than this run. The module owns the whole agency lifecycle — create, update,
search, self-registration requests, agent login details (PRD §7.2, ORG-05 – ORG-10). **This run covers the
update flow and its approval outcome, and nothing else in the module.** §3 records what that leaves out.

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

## 2. In Scope for This Module

| Area / Screen / Flow | Why in scope | PRD Reference — ID **and what it says** |
|---|---|---|
| **Agency Master section** — Branch, Agency Name, Country (read-only, inherited), State, City, IATA flag, Post Office Box, Company URL, Phone, Address 1/2 | US-4222 AC-1 — 11 fields with per-field validation, message, type, and mandatory/optional status | **ORG-05** `[V]` — *"An Agency is created under a Branch; the form spans Agency Master (branch, name, country inherited from branch, state, city, IATA flag, PO box, company URL, phone, address 1/2), …"* · **XC-17–XC-20** `[V]` — the platform-wide validation message vocabulary: `"Required"` for a missing mandatory field, and the standard email / phone / numeric-only messages |
| **Agency Owner Details section** — Contact Person, Email ID, Phone No. | US-4222 AC-2 | **ORG-05** `[V]` — lists *Agency Owner Details* as a section of the form · **XC-18** `[V]` — email errors read `"Please enter a valid email"` · **XC-19** `[V]` — phone errors read `"Please enter valid phone number"` |
| **Upload Document Details** — documents 1–3 (PDF), per-document Contract Start / End Date, Browse, Upload, multiple documents, displayed names, remove/update | US-4222 AC-3 — including the six behavioural rules | **ORG-05** `[V]` — *"Document uploads with per-document Contract Start/End dates"* · **§10** (file storage) — records that document upload is required in at least six flows, and that **the PDF constraint comes from the business story, not from automation** |
| **Agency Logo** — image type, ≤ 2 MB, preview before submission | US-4222 AC-4 | **ORG-05** `[V]` — lists *Agency Logo* as a section · **§10** (file storage) — *"image ≤ 2 MB"* is likewise **story-sourced, unverified by automation** |
| **Wonder Travel Sales Contact** — Name, Designation, Email, Phone; defaults inherited from Branch Contact Person; changeable; multiple sales personnel | US-4222 AC-5 | **ORG-05** `[V]` — lists *Sales Contact* as a section · **ORG-03** `[V]` — defines the Branch and its *owner Name / Email / Phone*, i.e. the fields these defaults are inherited **from** |
| **Bank Account Details** — Account Number, Account Type, Bank Name; multiple accounts | US-4222 AC-6 | **ORG-05** `[V]` — lists *Bank Accounts* as a section of the form |
| **Payment Settings** — Invoice Generation, Credit Limit, Top Up limit, Target, Set Month, Set Year, Credit Terms (Days), Reaching Percentage, Warning Prompt (Days), Credit Agency, Payment Options | US-4222 AC-7 — 11 fields | **ORG-06** `[V]` — *"Agency Payment Settings capture Invoice Generation frequency, Credit Limit, Top-Up Limit, and Credit Terms (days)"* — note it covers **only those four**; the other seven fields have no PRD requirement at all · **PAY-03** `[V]` — the supported instruments are Cash, Wallet, Credit Card, Bank Transfer, plus the Banque Misr and Fawry gateways |
| **Product Access Details** — Product, Status, Supplier Name (read-only), Credential name, Product Name (read-only), Description; inherited from Branch on branch selection | US-4222 AC-8 | **ORG-05** `[V]` — lists *Product Access* as a section · **SUP-05** `[V]` — *"Credentials cascade: a credential configured at supplier level must be visible/assignable at Branch and at Agency level"* — this is the mechanism that populates the section |
| **Airline Supplier Credential (PCC)** — Amadeus / Galileo / Sabre filters, Search Supplier Credential PCC, Ticketing Supplier Credentials PCC, Generic Supplier PCC, Manager Name, Supplier Credential Description; defaults inherited from Supplier & Branch | US-4222 AC-9 | **ORG-07** `[V]` — *"An agency is assigned one or more supplier PCCs (e.g. `Galileo Live UAE`), inherited from Supplier & Branch"* · **SUP-05** `[V]` — the same cascade as above |
| **Import PNR toggle** — controls whether the option appears on the agency portal | US-4222 AC-10 | **ORG-05** `[V]` — the toggle is part of the agency form · **IPN-05** `[V]` — *"Import PNR must be explicitly enabled for the organisation"*; a Branch/Agency with it closed is refused with the exact message `"Selected Organization does not support import pnr functionality"` — i.e. **this toggle has an observable downstream consequence** |
| **Submit for Approval** — saves the update and submits it for review, record enters *Pending for approval* | US-4222 Expected Outcome | **XC-01** `[V]` — *"Creating or updating a governed record does not publish it; the maker clicks Send for Approval and the record enters state 'Pending for approval'"* · **XC-04** `[V]` — *"The workflow applies to updates as well as creates"* — **the one PRD requirement that confirms an update path exists at all** · **§9.2** — the literal status string is `Pending for approval` |
| **Cancel** — clears unsaved changes / exits without persisting | US-4222 Expected Outcome | **GEO-09** `[V]` — an update *"can be cancelled without persisting"* (Rate of Exchange) · **SUP-10** `[V]` — *"Cancelling a Flight Search Limitation edit must not persist the change"*. Neither is about Agency: together they establish cancel-must-not-persist as a **platform-wide pattern**, which is the basis for expecting it here |
| **Approve** — an authorized user finalizes and applies the change | US-4222 Expected Outcome | **XC-02** `[V]` — *"A checker Approves (thumbs-up) or Rejects (thumbs-down) the pending record"* · **XC-03** `[V]` — *"Approval and rejection both accept a free-text Remarks entry, captured as the audit reason"* |
| **Reject** — an authorized user declines and provides a reason | US-4222 Expected Outcome | **XC-02**, **XC-03** `[V]` — as above; the story's *"provide a reason for rejection"* maps onto XC-03's Remarks field |
| **Locating the agency to update** (agency search / grid navigation) | In scope **as a means only** — reaching the record under test. Its own search semantics are not a test target of this run. | **ORG-08** `[V]` — *"Agencies are searchable, including an Active-only search"* |
| **Field-level validation and messages for every field above** | US-4222 states an exact message per field. These are the story's own acceptance criteria. | **§9.1** — the catalogue of literal, product-owned validation strings, treated as *contractual copy* · **GAP-7** — *"The Create-Agency story specifies ~45 fields with exact validation and message per field… only the happy path is automated; no negative field-level coverage"* — i.e. **this run is the first verification of those messages** |

## 3. Out of Scope for This Module

| Area / Screen / Flow | Why out of scope | Covered by | PRD Reference |
|---|---|---|---|
| **Create Agency** (the multi-section create form) | US-4222 is an *update* story. Creation is the same module's concern but a different flow and a different story. | `agency` — **different run scope** (a Create-Agency story exists in `PRD_UserStories.md`) | ORG-05 |
| **Agency search as a feature** — filters, Active-only search, pagination, empty state | Not named by US-4222. Used only to reach the record under test (§2). | `agency` — different run scope | ORG-08, XC-08 – XC-16 |
| **Agency self-registration requests** (New / In-progress queue) | Not named by US-4222. | `agency` — different run scope | ORG-09 |
| **Agent Login Details search** | Not named by US-4222. | `agency` — different run scope | ORG-10 |
| **Save as draft** | US-4222's Expected Outcome names only Submit for Approval / Cancel / Approve / Reject. PRD GAP-8 says the backlog specifies draft-save. **Recorded as a discrepancy (ASM-008), not folded into scope** — widening scope is a Human Decision, not this stage's call. | Nobody in this run — **unresolved discrepancy** | GAP-8 |
| **Branch CRUD** (a named dependency of the story) | The story lists Branch CRUD as a *dependency* — the Agency form consumes branch data. Testing Branch itself is another module's job. | `branch` | ORG-03, ORG-04 |
| **Supplier / Supplier Credential CRUD** (a named dependency) | Same: consumed here as pre-existing data. | `master-supplier` | SUP-01 – SUP-07 |
| **Payment Method master data** (a named dependency) | The Payment Options checkboxes consume it; configuring it is elsewhere. | `payment-gateway` | PAY-01, PAY-02 |
| **Reflection — Rule Engine** effect of an agency change | The story's Reflection list names it. Verifying an agency-scoped rule's price effect requires flight search and fare reading. **Open Question #8 in the story: impact-awareness or in scope?** Treated as out of scope for execution pending that answer; the module boundary is recorded in §3.1. | `rule-engine` — and only a full-project execution genuinely exercises it | RUL-03, RUL-13 |
| **Reflection — Search & Booking** | As above. Additionally blocked: no booking/payment action is authorized on this environment (§5). | `search-and-booking` | BMO-01, BMO-14 |
| **Reflection — NDC Portal screens** | As above; Portal is a separate application (`http://192.168.1.92:9500`) with no credentials configured for this run. | `portal-self-service` | §1 (two applications), AUTH-24, PTL-01 |
| **Reflection — Reports** | As above. Agency Wallet / AR Ledger / Total Due would show the effect of a credit-limit change. | `reports` | RPT-01, RPT-04, RPT-10 |
| **Reflection — Top Up submodule** | As above. Explicitly blocked: no wallet charge or top-up is authorized (§5). | `company` (Admin Top-Up Request) and `portal-self-service` (Portal top-up) | ORG-13, PTL-01 – PTL-07 |
| **Agency Owner activation → Portal login** (E2E-04's second half) | Not named by US-4222; owned by the module that manages agency users. | `agency-user-administration` | USM-09, AUTH-30, E2E-04 |
| **Non-functional requirements** — performance, accessibility, concurrency, multi-browser, localisation/RTL | The PRD states these are not derivable and largely absent; nothing in US-4222 states one. | **Not tested — out of project scope for this run** | §12 (NFR-01 – NFR-06 and the "Missing" row), OQ-4, OQ-5 |

### 3.1 Module Boundaries

| Related module | Interaction | Verified by |
|---|---|---|
| `branch` | **Inheritance on branch selection.** Country is read-only and inherited from Branch (AC-1); Sales Contact defaults inherit from the Branch Contact Person (AC-5); Product Access is populated from Branch (AC-8); Airline Supplier Credential defaults inherit from Supplier & Branch (AC-9). Changing Branch on an existing agency may re-inherit and overwrite values — Open Question #7 in the story. | **this module** — the inheritance is observed on the Agency form. Whether Branch's own data is correct is `branch`'s concern. |
| `master-supplier` | **Credential cascade.** A supplier credential configured at supplier level must be assignable at Agency level (SUP-05, `[V]`, verified by `setReflectionOnAgency`). The PCC section consumes it. | **this module** for "the credential appears and can be selected"; `master-supplier` for the cascade's own correctness; **full-project execution only** for the end-to-end cascade Supplier → Branch → Agency (E2E-03). |
| `payment-gateway` | Payment Options checkboxes (AC-7) are drawn from Payment Method master data (PAY-01). Cash / Wallet / Credit Card / Bank Transfer are the known instruments (PAY-03). The story's authoritative complete option set is unknown — story Open Question #5. | **this module** for selectability; `payment-gateway` for the master data. |
| `import-pnr` | The Import PNR toggle (AC-10) is the switch IPN-05 reads: a disabled organisation is refused with *"Selected Organization does not support import pnr functionality"*. | **this module** for the toggle's persistence; **`import-pnr`** for the refusal behaviour it causes; **full-project execution only** for toggle → refused import. |
| `rule-engine` | Rules are scoped Country POS → Branch → **Agency** (RUL-03). An agency's identity is a rule dimension. | **`rule-engine`**, and only a full-project execution shows an agency change altering a rule's reach. |
| `reports` | Credit Limit / Top-Up Limit / Credit Terms set here surface in Agency Wallet, AR Ledger, and Total Due to NDC (RPT-01, RPT-04, RPT-10). | **`reports`** — not verified by this run. |
| `agency-user-administration` | Agency Owner Details captured here (AC-2) are the user record that module administers; owner activation gates Portal login (AUTH-30, USM-09). | **`agency-user-administration`** — not verified by this run. |
| `company` | Credit limits set here bound the Top-Up Requests that module processes (ORG-13). | **`company`** — not verified by this run. |
| `authentication` | An Admin session is a precondition for reaching the form; Super Admin is required where a maker may not approve their own change (XC-06). | **`authentication`** — assumed working here, not a test target. |

## 4. Roles & Credentials Required

| Role | Permissions / purpose | Credential source | PRD Reference |
|---|---|---|---|
| **Admin** | The *maker*: navigate Admin → Agency, open an existing agency, edit each section, Cancel, and Submit for Approval. | `knowledge_base/credentials/credentials.json` (resolved at runtime; **file absent — see §8**) | §2 (Actors), AUTH-01 |
| **Super Admin** | The *checker*: Approve / Reject the submitted update with Remarks. Required because automation consistently switches to Super Admin to approve, implying a maker may not approve their own change — though this is `[I]`, never asserted (OQ-1). | `knowledge_base/credentials/credentials.json` (**absent**) | §2 (Actors), XC-02, XC-06, OQ-1 |
| Agency Owner / Agent (Portal) | **Not required for this run.** Portal-side reflection is out of scope (§3). | — | AUTH-24, PTL-01 |

**No credential value appears in this artifact, and none may be written into any downstream artifact,
tool call, or report.**

## 5. Environment Constraints

| Constraint | Implication for downstream stages | Source |
|---|---|---|
| **Shared staging, not isolated** — other testers and teams hold live data on `http://192.168.1.70` | Never assume a record you did not create is stable. Record the exact agency under test and its pre-edit values before changing anything, so the change is reversible and attributable. | run configuration — *Environment Constraints* |
| **Mutation authorized for Agency records only**, for this run only — update, Submit for Approval, Approve, Reject | Stage 2 and Stage `4M` may edit and submit an agency. They may **not** create/edit a Branch, Supplier, Staff, Role, Payment Method, or any reference data — even where a test would be easier with a purpose-built one. | run configuration — *Run-specific mutation override* (user, 2026-07-31) |
| **No bookings, payments, wallet charges, top-ups, holds, or ticketing** — even to verify a Reflection-area effect | Downstream-effect verification is limited to searching and reading. Any test case needing a booking or a charge is designed in full and marked `Deferred / Requires Authorization`. | run configuration — same override, limit 2 |
| **Stage `4M` executes headed** | A human watches each interaction live. This is the Manual branch's defining property, not a preference. | `pipeline.md` §3.4 |
| **No script of any kind may be produced** by this run | The Manual branch generates no Playwright file, helper, fixture, or throwaway driver script persisted as an artifact. | `pipeline.md` §4 (Stage `4M`) |
| **Destructive negative cases are deferred, not asked about** — account lockout, brute force, and equivalents | Design the case, mark it `Deferred / Requires Dedicated Environment`, state why, continue. Never ask, never silently drop. Directly relevant here: AUTH-11 locks an account after three failed OTP attempts. | `pipeline.md` §5.5; run configuration |
| **Upload fixtures must exist on the executing machine** — PDF documents for AC-3, an image ≤ 2 MB for AC-4, plus an over-size and a wrong-format file to test the negative paths | Stage 3 names the fixtures it needs; Stage `4M` cannot execute AC-3/AC-4 without them. They are test inputs, not artifacts — they belong in the scratchpad, never in the module workspace. | US-4222 AC-3, AC-4; §10 (file storage) |
| **Plain HTTP on a LAN address** | Reachable only from inside the network. Reachability has not been re-verified since 2026-07-29 — Stage 2 confirms it first and reports a blocker if it fails. | §10 (reference environments); run configuration |
| **Approve/Reject may need two identities** | If only one Admin credential is available, the four-eyes step may be unexecutable and the Approve/Reject criteria become `Blocked`, not `Failed`. Resolve before Stage `4M` (RSK-004). | XC-06, OQ-1 |

## 6. Carried-Forward Assumptions & Risks

| ID | Type | Statement (meaning preserved) | Affected Module(s) | PRD Reference |
|---|---|---|---|---|
| ASM-001 | Assumption | The PRD was **reverse-engineered from an automation suite**, is marked *Draft for business review*, and is **not business-approved**. Every requirement carries `[V]` verified / `[O]` observed / `[I]` inferred; `[O]` and `[I]` must be **probed, never treated as settled acceptance criteria**. Where automation and business intent disagree, business intent wins. | all | §0, §0.1, §17 |
| ASM-002 | Assumption | **The PRD contains no requirement describing the Agency *update* flow.** ORG-05 describes creation; XC-04 establishes only that the maker–checker workflow covers updates. The update form's section list is *assumed* to mirror the create form's. US-4222 is the sole requirement for the flow under test. | `agency` | ORG-05, XC-04 |
| ASM-003 | Assumption | Agency PCCs are **inherited from Supplier & Branch** — an agency does not define credentials of its own. | `agency`, `master-supplier`, `branch` | ORG-07 `[V]`, SUP-05 `[V]` |
| ASM-004 | Assumption | **Self-approval is assumed prohibited but never proven.** Automation switches to Super Admin to approve, yet never asserts that the maker is blocked. Whether an Admin can approve their own agency update is unconfirmed. | `agency`, all governed modules | XC-06 `[I]`, OQ-1 |
| ASM-005 | Assumption | **Credit enforcement behaviour is unspecified.** What actually happens at the credit limit, the top-up limit, the reaching-percentage threshold, and past credit terms in days is configured everywhere and exercised nowhere. Setting these fields is testable; their *effect* is not. | `agency`, `company`, `reports` | OQ-7 |
| ASM-006 | Assumption | **The complete approval matrix is unknown** — which record types require approval, and which role approves each, is inferred module by module. Who may approve an agency update is therefore unconfirmed. | `agency` | OQ-2 |
| ASM-007 | Assumption | **The agency field-level validation matrix has no existing coverage.** The business story specifies ~45 fields with an exact validation and message each; only the happy path was ever automated, with no negative field-level coverage. This run is the first verification of those messages. | `agency` | GAP-7 |
| ASM-008 | Open Question | **Draft-save discrepancy.** The backlog specifies "submit for approval **or save as draft**"; draft save was never automated; and US-4222's own Expected Outcome does **not** mention a draft. Whether the update form has a draft option is unresolved and is **not** folded into scope by this stage. | `agency` | GAP-8 |
| ASM-009 | Assumption | The **PDF-only** document constraint and the **image ≤ 2 MB** logo constraint come from the business story, **not** from automation — no automated check pins either. | `agency` | §10 (file storage) |
| ASM-010 | Assumption | Reference test data in the source suite **hardcodes environment-specific records** (e.g. branch `AboBakrTravel (BRN471)`) and past dates. Any such record named in a test case must be re-confirmed to exist on the current environment rather than assumed. | all | DEF-6 |
| ASM-011 | Open Question | **Story OQ #1** — "Cancel: clears unsaved changes or exits the **role** update process." The story is about Agency; "role update process" appears carried over from a Role story. Which is intended? | `agency` | US-4222 Open Questions |
| ASM-012 | Open Question | **Story OQ #2/#3** — AC-3 marks document upload and AC-4 marks the logo **Mandatory**. On updating an agency that already has them, must the user re-upload, or does "Mandatory" describe the create-time rule inherited by this form? | `agency` | US-4222 Open Questions |
| ASM-013 | Open Question | **Story OQ #4** — the AC-9 table's "Filter" column (Amadeus / Galileo / Sabre PCC) has ambiguous row alignment. Transcribed as a filter set over the section; confirm whether each PCC type is instead its own field row. | `agency` | US-4222 Open Questions |
| ASM-014 | Open Question | **Story OQ #5** — "Payment Options (e.g. Cash, Wallet, Credit Card, etc.)" gives no authoritative complete set. PRD PAY-03 names Cash, Wallet, Credit Card, Bank Transfer, Banque Misr, Fawry, but as *instruments*, not as this form's option list. | `agency`, `payment-gateway` | US-4222 Open Questions; PAY-03 |
| ASM-015 | Open Question | **Story OQ #6** — "authorized users (e.g. supervisors)" for Approve/Reject: which role(s) exactly, and is the approver distinct from the Admin who made the update? Compounds ASM-004 and ASM-006. | `agency` | US-4222 Open Questions; OQ-1, OQ-2 |
| ASM-016 | Open Question | **Story OQ #7** — does changing `Branch` on an existing agency re-inherit Country, Product Access, and Sales Contact defaults, **overwriting** values the agency already holds? A destructive-by-inheritance behaviour with no requirement covering it. | `agency`, `branch` | US-4222 Open Questions |
| ASM-017 | Open Question | **Story OQ #8** — are the five Reflection areas (Rule Engine, Search & Booking, NDC Portal, Reports, Top Up) in scope for downstream-effect verification, or listed as impact awareness only? Currently treated as impact awareness (§3). | `agency` + the five named modules | US-4222 Reflection |
| ASM-018 | Open Question | **Story OQ #9** — two validation messages are punctuated oddly in the source (`"Please enter a valid phone no.."` with two periods; `"Please enter a valid description"` with none). Are those the literal strings the application renders? Message assertions are exact-match, so this decides pass/fail. | `agency` | US-4222 Open Questions; §9.1 |
| RSK-001 | Risk | **Concurrent modification on shared staging.** Another tester may change the agency under test mid-execution, producing a false failure. Mitigation: record pre-edit values, prefer a low-traffic agency, and re-read before asserting. | all | run configuration |
| RSK-002 | Risk | **An agency's Payment Settings and PCCs are live commercial configuration.** Changing Credit Limit, Payment Options, or supplier credentials on shared staging can change what other testers see when they search or book. Mitigation: restore original values after each mutating case, and record the restore. | `agency`, `rule-engine`, `search-and-booking` | RUL-03, SUP-05; run configuration |
| RSK-003 | Risk | **Approve/Reject may be unexecutable with one identity.** If no Super Admin credential is available and self-approval is blocked (ASM-004), those two acceptance criteria end `Blocked` — an environment/access limitation, never a product `Failed`. | `agency` | XC-06, OQ-1 |
| RSK-004 | Risk | **Upload negative paths need deliberately bad fixtures** (a non-PDF, an over-2 MB image). Without them AC-3/AC-4's negative criteria cannot be executed and must be reported as not-executed rather than passed. | `agency` | US-4222 AC-3, AC-4 |
| RSK-005 | Risk | **Non-functional requirements are absent from the PRD** — no availability, capacity, response-time, retention, PCI-DSS, GDPR/passport-handling, audit-log, or accessibility requirement exists to test against. This run makes no non-functional claim. | all | §12 ("Missing" row) |
| RSK-006 | Risk | **No audit log exists to verify the change trail.** `Rule History` exists for rules; a general audit log is a known gap. An agency update's audit trail can therefore only be observed as approval state, not as a log entry. | `agency` | GAP-4 |
| RSK-007 | Risk | **`[O]`/`[I]`-tagged behaviour may not exist as described.** Several Agency-adjacent statements are inferred from locators or field names alone. A test case built on one may fail because the requirement was never real — that is a requirements defect, not necessarily a product defect, and must be classified as such. | `agency` | §0.1, §0.3 |

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
| Roles: Admin (maker), Super Admin (checker) | §4 | §2 (Actors), XC-02, XC-06 |
| Target environment `http://192.168.1.70` | §5 | §10 (reference environments) |
| Agency data model (credit limit, invoice frequency, payment options, documents + contract dates, logo, bank accounts, PCCs, import-PNR flag) | §2 | §8 |
| Agency onboarding → Portal access (boundary, out of scope) | §3, §3.1 | E2E-04 |
| Field-level validation matrix has no prior coverage | ASM-007 | GAP-7 |
| Draft-save discrepancy | §3, ASM-008 | GAP-8 |
| Governance open questions (self-approval, approval matrix, credit enforcement) | ASM-004 – ASM-006 | OQ-1, OQ-2, OQ-7 |
| Absent non-functional requirements | §3, RSK-005 | §12 |

## 8. Open Questions — Requires Run Configuration

| Missing Key | Sections Affected |
|---|---|
| `{{USERNAME}}` / `{{PASSWORD}}` for **Admin** — `knowledge_base/credentials/credentials.json` does not exist on this install and may only be created by a human | §4. **Blocks Stage 2 (Discovery) and Stage `4M` (Manual Execution) entirely.** Stage 1 does not need it, so this context is complete without it. |
| `{{USERNAME}}` / `{{PASSWORD}}` for **Super Admin** | §4, RSK-003. Without a second identity the Approve and Reject acceptance criteria may end `Blocked`. |
| Upload fixtures — a valid PDF, a valid image ≤ 2 MB, a non-PDF, an over-size image | §5, RSK-004. Stage 3 names them; Stage `4M` cannot execute AC-3/AC-4 without them. |
| The specific **agency record** to update on shared staging | §5, RSK-001. Not yet chosen. Stage 2 identifies candidates; the choice is a human's, because it names live data that will be modified. |
