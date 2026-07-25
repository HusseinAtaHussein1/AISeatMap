# NDC — Project Context: Rule Engine

**Pipeline stage:** 1 of 7 (Project Context Agent)
**Run:** `2026-07-25_16-45-00__Module__RuleEngine`
**Version:** v1 (this run)
**Checkpoint status:** ⛔ **Pending Human Review** — Business Analyst / Product Owner (pipeline.md §5.1)
**Requirement source:** `platform_core_data/PRD.md` (reverse-engineered PRD, installed 2026-07-25)
**Run configuration source:** `platform_core_data/run_configuration.md` + user decisions 2026-07-25

> **This document is the single source of truth for Stages 2–7 of this run.** Per pipeline.md §6 Rule 4,
> no downstream stage may read `PRD.md` directly. Any requirement change must come back through a new
> Project Context Agent run.

---

## 0. Requirement-source health warning (must be read by every downstream stage)

This run's PRD is **not business-authored**. It was reverse-engineered from the Reference Automation
Project on 2026-07-25 and is marked *Draft for business review* in its own status line. Consequences
that bind every stage of this run:

1. **Evidence tags are load-bearing.** Each PRD requirement is tagged `[V]` (an automated assertion
   pins it), `[O]` (exercised but unasserted), or `[I]` (inferred from locators/field names/test data
   only). This document carries those tags forward per requirement. **`[O]` and `[I]` requirements are
   unconfirmed** — Stage 2 must probe them, Stage 3 must not assert them as settled acceptance
   criteria, and Stage 7 must report them as resolved/refuted/unverified rather than "covered."
2. **The PRD describes as-built behaviour, not business intent.** Where the two conflict, business
   intent wins and the conflict is escalated at this stage's checkpoint — not silently resolved
   downstream (PRD §17).
3. **The PRD's own §15 lists ten unanswered business questions.** Three of them fall inside this
   run's scope and are carried forward in §6 below as blocking or probe-worthy items.

---

## 1. Scope Summary

This run validates the **Rule Engine module** of NDC Admin — the platform's commercial pricing core,
which adjusts supplier-returned fares before an agency sees a price. In scope are all seven rule
types (Markup, Discount, Service Charge, Cancellation Charge, Fare Rules, Offer Pricing, Terms &
Conditions) plus the Rule History audit view: their definition shape, hierarchical scoping
(Country POS → Branch → Agency), maker–checker approval governance, search/filter/pagination
behaviour, and — critically — the requirement that a configured rule **demonstrably changes the fare
shown in a flight search** (PRD RUL-13, E2E-01).

This is a **Full Regression run type over one module** at full depth, and it is the first NDC run
covering Rule Engine at all — no prior Project Context, Discovery artifact, or test suite in this
project touches it (verified against `workspace/context/`, `workspace/test_design/`, and
`workspace/pipeline/RunManifest.md`, 2026-07-25).

**Data mutation is authorized for Rule Engine records only** for the duration of this run (§5).

---

## 2. Modules In Scope

### 2.1 Primary scope — Rule Engine (PRD §7.7)

| Requirement ID | Requirement | PRD source | Evidence |
|---|---|---|---|
| **FR-RULE-DEF-01** | Seven rule types exist and are individually configurable: Markup, Discount, Service Charge, Cancellation Charge, Fare Rules, Offer Pricing, Terms & Conditions. A **Rule History** audit view exists alongside them. | §7.7 RUL-01 | [V] (Rule History itself: [I] — see §6 OI-6) |
| **FR-RULE-DEF-02** | Markup / Discount / Service Charge share one definition shape: Name, Description, Validity Period From/To, Country (POS), Branch, Agency, Attribute + Operator + Value (e.g. `Supplier IN All`), Fare Type, Amount Type, Value. | §7.7 RUL-02 | [V] |
| **FR-RULE-DEF-03** | A rule's amount is expressed as either a **Percentage** or an absolute **Amount**. | §7.7 RUL-04 | [V] |
| **FR-RULE-DEF-04** | A rule applies against **Total Fare** or **Base Fare**. | §7.7 RUL-05 | [V] |
| **FR-RULE-SCOPE-01** | Rules are scoped hierarchically — Country POS → Branch → Agency — so one engine serves global, branch-level, and agency-specific pricing. | §7.7 RUL-03 | [V] |
| **FR-RULE-CC-01** | Cancellation Charge additionally takes **per-passenger-type amounts (Adult / Child / Infant)**. | §7.7 RUL-06 | [V] |
| **FR-RULE-CC-02** | Cancellation Charge supports **Clone** and **Delete**. | §7.7 RUL-06 | [V] |
| **FR-RULE-CC-03** | Cancellation Charge records carry a **system-generated code**. | §7.7 RUL-07 | **[O]** — probe |
| **FR-RULE-FR-01** | Fare Rules are defined per **Supplier** and **Supplier Type**, per Country, with a validity date, name, and description; searchable and approvable. | §7.7 RUL-08 | [V] |
| **FR-RULE-OP-01** | Offer Pricing records include a **promotional image upload**, and are created / searched / updated under approve–reject governance. | §7.7 RUL-09 | [V] |
| **FR-RULE-TC-01** | Terms & Conditions are configured per **Supplier, Country (or All Countries), Branch (or All Branches)** with a description. | §7.7 RUL-10 | [V] |
| **FR-RULE-TC-02** | Terms & Conditions target specific delivery channels: **E-Ticket, Confirmation Page, Review Page, Email**. | §7.7 RUL-10 | [V] |
| **FR-RULE-TC-03** | Terms & Conditions support Deselect-All / bulk channel selection, edit under approval, activate/deactivate, approve/reject, and delete. | §7.7 RUL-12 | [V] |
| **FR-RULE-APPLY-01** | A configured rule **must demonstrably change the price shown in booking**. Search results are verified to reflect the configured Markup, Discount, Service Charge, and Cancellation Charge. | §7.7 RUL-13, §11 E2E-01 | [V] |
| **FR-RULE-APPLY-02** | The full rule lifecycle is a first-class business flow: **create rule → approve → search flights → verify fare reflects it → update rule → verify again**. | §7.7 RUL-14, §11 E2E-01 | [V] |
| **FR-RULE-APPLY-03** | Rules can be applied ad-hoc to a **Manual Booking Invoice**. | §7.7 RUL-16 | [V] |
| **FR-RULE-SRCH-01** | All rule types are searchable by Country + Branch, filterable Active / Inactive / Both, paginated with cross-page lookup, and approvable/rejectable with remarks. | §7.7 RUL-15 | [V] |

### 2.2 Inherited cross-cutting requirements that apply to every Rule Engine screen (PRD §6)

These are not separate scope — they are the platform-wide conventions the Rule Engine screens must
honour, and they are in scope **as they manifest on Rule Engine screens only**.

| Requirement ID | Requirement | PRD source | Evidence |
|---|---|---|---|
| **FR-RULE-GOV-01** | Creating or updating a rule does not publish it. The maker clicks **Send for Approval**; the record enters state **"Pending for approval"**. | §6.1 XC-01 | [V] |
| **FR-RULE-GOV-02** | A checker **Approves** (thumbs-up) or **Rejects** (thumbs-down) the pending rule. | §6.1 XC-02 | [V] |
| **FR-RULE-GOV-03** | Approval and rejection both accept free-text **Remarks**, captured as the audit reason. | §6.1 XC-03 | [V] |
| **FR-RULE-GOV-04** | The approval workflow applies to **updates as well as creates**. | §6.1 XC-04 | [V] |
| **FR-RULE-GOV-05** | Rules carry an **Active / Inactive** lifecycle independent of approval state, toggled from the grid. | §6.1 XC-05 | [V] |
| **FR-RULE-GOV-06** | Grids expose **Status** and **Approval Status** as two distinct columns. | §6.1 XC-07 | [V] |
| **FR-RULE-SRCH-02** | Status filtering offers **Active / Inactive / Both**, and the grid must return only rows matching the selected status. | §6.2 XC-09 | [V] |
| **FR-RULE-SRCH-03** | An empty result set displays **"No data has been found!"** — never a bare empty grid. | §6.2 XC-11 | [V] |
| **FR-RULE-SRCH-04** | Results are paginated, pagination preserves the active filter, and **Next**/**Last** are supported. | §6.2 XC-13 | [V] |
| **FR-RULE-SRCH-05** | A rule whose match is not on page 1 must still be findable — grids support cross-page lookup. | §6.2 XC-14 | [V] |
| **FR-RULE-SRCH-06** | A **Reset / Clear** control returns the search form to its default state. | §6.2 XC-16 | **[O]** — probe |
| **BR-RULE-01** | Mandatory-field violations display **"Required"**. | §6.3 XC-17, §9.1 | [V] |
| **BR-RULE-02** | At least one Terms & Conditions channel must be selected: **"Please check atleast one event type option."** | §7.7 RUL-11, §9.1 | [V] |
| **BR-RULE-03** | Successful create/update confirm with **"Added Successfully"** / **"Updated Successfully"**. | §6.3 XC-22, §9.2 | [V] |
| **BR-RULE-04** | Duplicate rule names are rejected with **"This name already exists"**. | §6.3 XC-21, §9.1 | [V] — but the asserted instance is Prefer Airline, not a Rule Engine screen. Treat as **[I]** for Rule Engine and probe. |

### 2.3 In scope for verification only — not themselves under test

`FR-RULE-APPLY-01`/`-02` cannot be verified inside the Rule Engine module: observing that a rule
changed a fare requires performing a flight search. Therefore:

- **Booking Mid Office → Booking (flight search + fare breakdown)** is in scope **solely as the
  observation surface** for a rule's price effect (PRD §7.8 BMO-01, BMO-04). Its own requirements
  (search filters, branded fares, hold/book/quote outcomes) are **out of scope** — see §3.
- **Booking Mid Office → Manual Booking Invoice** is in scope **solely** for `FR-RULE-APPLY-03`
  (applying rules to a manual invoice, PRD §7.8 BMO-24). Its own fare-entry and passenger
  requirements are out of scope.

No booking may be completed, paid, held, or ticketed in service of this verification — see §5.

---

## 3. Modules Out of Scope

Silence is not sufficient (pipeline.md, Stage 1 Execution Rule 3), so every module named in the PRD
is classified here.

| Module | PRD § | Status this run |
|---|---|---|
| Authentication (Admin login, OTP, forgot/change password) | §4 | **Out of scope** — covered by RUN-20260712-001. Login is used only as a means of access. |
| Access control — Roles & permissions | §5 | **Out of scope** — covered by RUN-20260721-001. |
| Dashboard | §7.1 | **Out of scope** |
| Organisation hierarchy — Company, Branch, Agency, Staff, Top-Up Request | §7.2 | **Out of scope** as subjects. Branch/Agency/Country values are *consumed* as scoping data for rules (FR-RULE-SCOPE-01); no Branch/Agency/Staff record may be created or modified this run. |
| Master data — Geography & currency | §7.3 | **Out of scope** — consumed as reference data only (Country POS). |
| Master data — Flight (Airport, Airline, Prefer Airline, **BSP Commission**, Deal Code, RBD) | §7.4 | **Out of scope.** Note: BSP Commission is commercially adjacent to Rule Engine and appears in the fare chain, but the PRD places it under Master → Flight (FLT-15…18), not Rule Engine — it is therefore excluded, and the interaction is logged as OI-3 in §6. |
| Master data — Supplier & credentials | §7.5 | **Out of scope** — Supplier values are consumed as rule Attribute values only. |
| Payment gateway / Payment Method | §7.6 | **Out of scope** |
| Booking Mid Office — Search Booking, My Quotes, Import PNR | §7.8, §7.9 | **Out of scope** |
| Booking Mid Office — Booking (flight search), Manual Booking Invoice | §7.8 | **Out of scope as subjects** — in scope only as the verification surface per §2.3 |
| Traveller / client management | §7.10 | **Out of scope** |
| Agency user administration | §7.11 | **Out of scope** |
| Admin settings | §7.12 | **Out of scope** |
| Reports (all 12) | §7.13 | **Out of scope** |
| **NDC Portal — entire application** (login, top-up, agent profile management, Financial per-airline markup, travellers, portal reports) | §7.14 | **Out of scope.** Explicitly noted: Portal → Settings → Financial (PTL-11…14) is an agency-side *markup* feature and is commercially related to Rule Engine markup, but it is a separate application, a separate PRD section, and a separate requirement set — it is not folded into this run. Logged as OI-4. |
| Credential Route White/Black List, Airport lists, airline-level GDS filtering, route tag | §13 GAP-1/2/3/5 | **Out of scope** — no requirements exist in automation form; partly covered by RUN-20260710-001. |
| Audit log (GAP-4) | §13 GAP-4 | **Out of scope as a module.** The Rule Engine's own **Rule History** view is in scope (FR-RULE-DEF-01); a platform-wide audit log is not. |

---

## 4. Roles & Credentials Required

Drawn from `run_configuration.md` "Credentials Available" and PRD §2.

| Role | Identity | Status for this run | Needed for |
|---|---|---|---|
| **Super Admin** | `odeysysadmin` | **Available** — populated in `credentials/credentials.json`, confirmed working by RUN-20260721-001's Stage 2. | Rule creation, and rule **approval** (FR-RULE-GOV-02) |
| **Admin** | displayed as `E.Saady` | ⚠️ **Not usable this run** — RUN-20260721-001's Stage 2 recorded that this credential "isn't populated in `credentials.json`". `run_configuration.md` lists it as confirmed working in a *browser* session, but the automation credential store does not hold it. | Would be required to verify FR-RULE-GOV maker≠checker separation |
| Agency / Agent (Portal) | — | Not required — Portal is out of scope (§3). | — |

**Consequence carried forward (blocking for one requirement):** with only one usable identity, the
maker and the checker are necessarily the same user. **PRD §15 OQ-1 — "Is self-approval
prohibited?" — cannot be answered this run.** Stage 2 must not attempt to infer it, and Stage 3 must
mark any maker≠checker separation test `Deferred / Requires Second Credential` with that reason
stated, per pipeline.md §5.5's "can't safely execute" rule. Obtaining the Admin credential is the
single highest-value unblock for a future run.

---

## 5. Environment Constraints

| Field | Value |
|---|---|
| Application | NDC Admin (back office) |
| URL | `http://192.168.1.70` — internal LAN, plain HTTP. **Reachability verified 2026-07-25, 19 ms.** |
| Environment | **Shared staging — not isolated.** Other teams/testers have live data on it. |
| Execution mode | **Headed** (`run_configuration.md`, set 2026-07-12) |
| Browser | Chrome, via `platform_core/tools/browser_driver/` |
| Resolution | 1440x900 |

### 5.1 Mutation authorization — run-specific override

> **GRANTED, for Rule Engine records only, for this run only.** User decision, 2026-07-25.
>
> **Permitted:** create, update, activate/deactivate, approve, reject, clone, and delete records of
> the seven Rule Engine types (Markup, Discount, Service Charge, Cancellation Charge, Fare Rules,
> Offer Pricing, Terms & Conditions).
>
> **Not permitted — the standing read-only constraint remains in full force:** any create/update/
> delete against Company, Branch, Agency, Staff, Role, Supplier, Supplier Credential, Airline,
> Airport, Geography, Currency, Rate of Exchange, Payment Method, Travellers, or Agency users.
>
> **Not permitted regardless of the above — no money, no tickets, no bookings.** Verifying a rule's
> price effect (FR-RULE-APPLY-01/-02) is limited to **searching and reading the fare breakdown**. No
> booking may be completed, paid, held, ticketed, or converted from a quote; no wallet may be
> charged; no Manual Booking Invoice may be submitted to payment. FR-RULE-APPLY-03 is therefore
> verifiable only up to the point of applying a rule to a draft invoice and reading the computed
> figures.
>
> Per `run_configuration.md`, this override **does not carry forward** — a future run must ask fresh.

### 5.2 Shared-environment safety obligations

Because the environment is shared and **Rule Engine changes alter the prices other users see**
(FR-RULE-APPLY-01 is precisely the requirement that they do), the following apply to Stages 2, 4,
and 6:

1. Every rule created this run must be **identifiable as test data** (a naming convention that marks
   it as belonging to this run) so another team can recognise it.
2. Every rule created this run should be **left Inactive or Rejected, or deleted, at the end of the
   stage that created it** — an approved, active markup left behind silently changes real search
   results for other testers.
3. **Prefer creating a new narrowly-scoped rule over editing an existing one.** An existing rule may
   belong to another team's in-flight test.
4. Rules must be scoped as narrowly as the requirement under test allows (a specific Branch/Agency
   rather than Country-wide) to limit blast radius.

---

## 6. Carried-Forward Assumptions, Risks & Open Items

Every item below is carried forward verbatim in meaning from its source. `OI-` = open item for this
run; each states which stage should resolve it.

### 6.1 From the PRD

| ID | Item | Source | Resolve at |
|---|---|---|---|
| **OI-1** | **The fare arithmetic is entirely unspecified.** Verbatim: *"the automation never asserts the arithmetic — the order of application (markup before or after discount), rounding, currency conversion point, and precedence when two rules of the same type both match are all unspecified. This is the single largest business-logic gap in this reconstruction."* | PRD §7.7 closing note; §15 OQ-3 | **Partially answerable from existing Project Knowledge — see §6.2 OI-2.** Residual (rounding, currency-conversion point, same-type precedence) is a **business question**, escalate at this checkpoint; Stage 2 may observe actual computed values but must not infer the general rule from one example. |
| **OI-6** | Rule History exists in the Rule Engine menu but **has no automation coverage**, and the PRD classifies a platform-wide audit log as a gap. Verbatim: *"`Rule History` exists in the Rule Engine menu but has no test."* | PRD §13 GAP-4 | Stage 2 — confirm the screen exists, is reachable, and what it records. |
| **OI-7** | **Self-approval prohibition is unverified.** Verbatim: *"Is self-approval prohibited? Automation consistently switches to Super Admin to approve, but never asserts that the maker is blocked."* | PRD §6.1 XC-06; §15 OQ-1 | **Blocked this run** — only one credential available (§4). Stage 3 marks `Deferred / Requires Second Credential`. |
| **OI-8** | **The complete approval matrix is unknown** — which record types require approval, and which role approves each. | PRD §15 OQ-2 | Stage 2 — observe for the seven rule types only; do not generalise beyond Rule Engine. |
| **OI-9** | `FR-RULE-CC-03` (system-generated Cancellation Charge code), `FR-RULE-SRCH-06` (Reset control) are `[O]` — the capability exists but no assertion pins its behaviour. | PRD §7.7 RUL-07; §6.2 XC-16 | Stage 2 probe → Stage 3 design against observed behaviour. |
| **OI-10** | `BR-RULE-04` (duplicate-name rejection) is asserted in the PRD only against Prefer Airline, not against any Rule Engine screen. Whether Rule Engine enforces name uniqueness at all is unconfirmed. | PRD §6.3 XC-21 | Stage 2 probe. |
| **OI-11** | The PRD reports a **product-side typo in a user-facing success message** on an adjacent Master screen (`"Deal Code hAdded Successfully"`). Rule Engine's own confirmation strings should be read carefully rather than assumed to match `BR-RULE-03` exactly. | PRD §14 DEF-2 | Stage 2 — record actual observed strings. |

### 6.2 From existing NDC Project Knowledge (pipeline.md §10.2 — Project Knowledge extends the PRD)

| ID | Item | Source | Note |
|---|---|---|---|
| **OI-2** | **A documented Rule Engine ordering already exists in this project's knowledge and is not reflected in the PRD.** `architecture.md` §"Rule Engine Flow": *"Markup → Discount → Service Charge → Cancellation Charge → Offer Pricing → Final Fare"*, restated in `glossary.md` ("Rule Engine outputs applied in sequence … to arrive at the Final Fare"). | `architecture.md:58`, `glossary.md:20` | **Disclosed as a discrepancy, not silently substituted** (pipeline.md §10.2). The PRD says the order is unspecified; Project Knowledge states an order. Per Stage 1 Execution Rule 6 this document does not "correct" the PRD. **Stage 2 should treat this sequence as a hypothesis to verify, and Stage 3 should design a test that confirms or refutes it** — it is the most valuable single test in this run. Note the documented sequence is itself of unrecorded provenance (infographic/chat-derived, per `architecture.md`'s own note) and does not address rounding, currency conversion, or same-type precedence. |
| **OI-3** | **BSP Commission also sits in the fare chain but is out of scope.** `architecture.md`: *"Each booking additionally depends on: Airline → Supplier → Credential → Markup/Rules → Currency → Payment Gateway."* The PRD places BSP Commission under Master → Flight (FLT-15…18). | `architecture.md:52`; PRD §7.4 | If Stage 2 finds an observed fare that the in-scope rules alone cannot explain, BSP Commission or a Deal Code is the likely cause — record it as an open question, do not expand scope to chase it. |
| **OI-4** | **Portal → Settings → Financial lets an agency set its own per-airline markup** (PRD §7.14 PTL-11…14), independently of Admin's Rule Engine. How the two compose — whether agency markup stacks on Admin markup, overrides it, or applies at a different point — is undocumented anywhere. | PRD §7.14; §3 above | Out of scope this run. Escalate as a business question at this checkpoint; a future run pairing both is warranted. |
| **OI-5** | **Branch-level Supplier Routing constrains which suppliers return results, and Agencies inherit it.** Verbatim from `BR-002`: *"Every Agency under that Branch automatically inherits the Branch's Supplier Routing configuration."* | `knowledge_base/business_rules/BR-002.md` | Directly relevant: rules use `Attribute = Supplier, Operator = IN, Value = All` (FR-RULE-DEF-02). A `Supplier IN All` rule's effect depends on which suppliers that Branch is even allowed to return. Stage 2 must record the test Branch's Supplier Routing before interpreting any fare. |
| **OI-12** | **GDS vs LCC suppliers differ in which airlines they return** (`BR-004`) and in how credentials are selected (`BR-003`). | `BR-003.md`, `BR-004.md` | Affects the choice of test route/supplier for FR-RULE-APPLY-01. Choose a supplier whose returned content is predictable. |
| **OI-13** | **FINDING-004 (open since RUN-20260710-001): multiple distinct Admin-tier roles with different feature access.** Re-raised by RUN-20260721-001. | `workspace/pipeline/RunManifest.md` | Compounds OI-7/OI-8: the approval matrix may differ by Admin tier, and only the Super Admin tier is observable this run. |
| **OI-14** | **`browser/profile.json`'s `defaultBaseUrl` (`.80`) does not match the working login host (`.70`).** Recorded by RUN-20260721-001's Stage 2 as a standing recommendation, worked around rather than fixed. | `workspace/pipeline/RunManifest.md` | Stage 2 will hit this immediately. Use `.70` per §5. |

### 6.3 Risks specific to this run

| ID | Risk | Mitigation |
|---|---|---|
| **R-1** | **Mutation authorization plus shared staging plus a module that changes prices** = the highest blast-radius combination this project has run to date. An approved, active markup left behind alters what every other tester sees. | §5.2's four obligations are mandatory, not advisory. |
| **R-2** | The verification requirement (FR-RULE-APPLY-01) needs a flight search that reliably returns results. The PRD notes test data rot in the reference suite — hardcoded PNRs, past departure dates (§14 DEF-6). | Stage 2 must establish a working route/date/branch combination **before** creating rules, and record it for Stages 3–6. |
| **R-3** | Rule validity periods are date-windowed (FR-RULE-DEF-02). A rule created with a future validity window will correctly have **no** price effect — an easy false negative. | Stage 2/4 must set validity windows that include the search date, and record the window used with every fare observation. |
| **R-4** | Seven rule types × create/search/update/approve/reject/activate/deactivate × cross-cutting conventions is a large surface for one run. Under-coverage is more likely than over-coverage. | Stage 3 should prioritise FR-RULE-APPLY-01/-02 and OI-2 (the ordering hypothesis) over exhaustive CRUD permutations on all seven types. |

---

## 7. Traceability Anchor

Every item in this document, mapped to its source section.

| This document | Source |
|---|---|
| §0 evidence-tag regime | `platform_core_data/PRD.md` §0.1 (Evidence levels), §0.3 (Known limits) |
| §1 Scope Summary | PRD §7.7; run scope decision, user, 2026-07-25 |
| §2.1 FR-RULE-DEF-01…04, SCOPE-01, CC-01…03, FR-01, OP-01, TC-01…03, APPLY-01…03, SRCH-01 | PRD §7.7 RUL-01 … RUL-16 (individually cited per row) |
| §2.2 FR-RULE-GOV-01…06, SRCH-02…06, BR-RULE-01…04 | PRD §6.1 XC-01…07, §6.2 XC-09/11/13/14/16, §6.3 XC-17/21/22, §9.1, §9.2 |
| §2.3 verification surface | PRD §7.8 BMO-01, BMO-04, BMO-24; §11 E2E-01 |
| §3 Out of Scope | PRD §4, §5, §7.1–§7.6, §7.8–§7.14, §13 |
| §4 Roles & Credentials | `run_configuration.md` "Credentials Available"; PRD §2; RUN-20260721-001 Stage 2 summary in `RunManifest.md` |
| §5 Environment Constraints | `run_configuration.md` "Target Environment", "Execution Configuration", "Environment Constraints"; reachability check 2026-07-25 |
| §5.1 Mutation authorization | User decision 2026-07-25; precedent form of RUN-20260712-002's override in `run_configuration.md` |
| §6.1 OI-1, OI-6…OI-11 | PRD §7.7 closing note, §13 GAP-4, §14 DEF-2, §15 OQ-1/OQ-2/OQ-3, §6.1 XC-06, §6.2 XC-16, §6.3 XC-21 |
| §6.2 OI-2…OI-5, OI-12…OI-14 | `architecture.md:52`, `:58`; `glossary.md:20`; `knowledge_base/business_rules/BR-002.md`, `BR-003.md`, `BR-004.md`; `workspace/pipeline/RunManifest.md` |
| §6.3 R-1…R-4 | PRD §7.7 RUL-02 (validity windows), §14 DEF-6 (data rot); `run_configuration.md` shared-environment constraint |

---

## 8. Checkpoint

**Status:** ⛔ Pending Human Review — Business Analyst / Product Owner (pipeline.md §5.1)

**Review this document for:** scope accuracy, the in-scope/out-of-scope split (particularly the §2.3
verification-surface carve-out and the §3 exclusions of BSP Commission and Portal Financial), and
whether the §6 assumptions are correctly carried forward.

**Three items warrant a business answer at this checkpoint rather than downstream discovery:**

1. **OI-2 / OI-1 — is `architecture.md`'s "Markup → Discount → Service Charge → Cancellation Charge
   → Offer Pricing → Final Fare" the authoritative order?** If yes, this run can verify it. If it is
   itself an unverified sketch, say so and Stage 3 will treat it as a hypothesis only.
2. **OI-7 / §4 — can the Admin credential (`E.Saady`) be added to `credentials.json`?** Without a
   second identity, maker≠checker approval separation is untestable and will be reported `Deferred`.
3. **OI-4 — how does Portal agency-side Financial markup compose with Admin Rule Engine markup?**
   Out of scope this run, but the answer determines whether a follow-up run is needed.

Stage 2 (Explorer Agent) may not be invoked until this checkpoint is explicitly approved
(pipeline.md §5.3 Rule 5).
