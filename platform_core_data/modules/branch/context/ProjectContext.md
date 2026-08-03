# Project Context — Branch

| Field | Value |
|---|---|
| Module | `branch` |
| PRD Source | `platform_core_data/knowledge_base/PRD.md` §7.2 (ORG-03, ORG-04); `platform_core_data/knowledge_base/PRD_UserStories.md` User Story 5 (US 8605 — [Admin] Create Branch) and User Story 6 (US 51489 / WT1-T3177 — Agency wallet Threshold option) |
| PRD sections this module derives from | PRD.md §7.2 (ORG-03, ORG-04); PRD_UserStories.md User Story 5; PRD_UserStories.md User Story 6 §2 Branch Module (**authoritative source for the "Outstanding Threshold" field**, confirmed 2026-08-03) and §4 Branch Threshold Update |
| Run Scope Type | User Story (`run_scope.md` §3) — resolves to `single` module (`branch`) |
| Run Type | User Story |
| Target Environment | `http://192.168.1.70` — STG, shared, internal/LAN, plain HTTP (per `run_configuration.md` §Target Environment — carried over from the prior run; **not re-confirmed for this run**, see §8 below) |
| Produced by run | `run-002__2026-08-03_10-26-17__UserStory__US-8605CreateBranch` |
| Revision | 5 (in place — RISK-BR-2 fully resolved: Warning Prompt vs. Credit Terms cross-field validation confirmed enforced via module-owner-supplied evidence) |
| Target ref at write | `ff287f9` |
| Generated | 2026-08-03 |
| Status | Pending Review |

## 1. Scope Summary

This is a **User Story** run covering US 8605 — [Admin] Create Branch: a System Administrator creates a new Branch by entering Branch Details, Branch Email Configuration, Branch Contact Info, Branch Sales Configuration, and Product Access Details, then submits it for approval. The reverse-engineered PRD (`PRD.md` §7.2, ORG-03/ORG-04) independently describes Branch creation, but at far coarser field granularity than US 8605's field-by-field acceptance criteria (mandatory/optional, input type, format/length/uppercase rules, cross-field dependencies).

**Requirement authority for this run:** where US 8605 (business-authored) and `PRD.md` ORG-03 (reverse-engineered from automation) disagree or diverge in detail, **US 8605 is authoritative** — it is business-written and more granular; `PRD.md`'s own provenance note (§0, §17) states business intent wins over automation-derived text where they conflict. No override analogous to the US-4222 "application is primary reference" directive has been granted for this run (§8).

**Update 2026-08-03 — US 8605 confirmed partially outdated by the module owner.** Following Stage 2 Discovery, the module owner reviewed the Findings and confirmed several of US 8605's acceptance criteria no longer match current, intended behavior — not because the application is defective, but because the story predates later product changes:
- The Payment Option checkbox list is **not** a fixed 5-value set; it inherits every **Active** record from the Payment Gateway module by design (see §3.1). US 8605's wording implies a closed list — that implication is outdated, not the observed behavior.
- Import PNR's unchecked-by-default state is **confirmed intended** ("a feature, not a bug"); US 8605's "always checked" wording is outdated.
- The Flight product-access checkbox being user-editable, and the absence of a Payment Gateway dropdown on Credit Card selection, are both attributed to US 8605 being old — the current build has moved past what the story describes for these two points, though neither has yet been re-specified in writing.
- PAN Number and Department, both absent from the live UI, are to be **ignored** per the module owner's explicit direction — not pursued as blocking gaps for Test Design.

None of this is treated as silently overriding the PRD — each disposition is recorded against its Finding (`discovery/findings/FINDING-001, 005, 006, 007, 008, 009`) with the human clarification quoted, so the reasoning stays traceable rather than resolved by assumption.

## 2. In Scope for This Module

| Area / Screen / Flow | Why in scope | PRD Reference |
|---|---|---|
| Branch Details (Brand [system-set "NDC"], Operating Country, Branch Name, Country auto-fill, State/City cascading dropdowns, Address 1/2, Post Office Box, Phone + country code, PAN/Service Tax/ABTA numbers) | Core Create Branch form section named explicitly in US 8605 | PRD_UserStories.md US 5 §Branch Details; PRD.md ORG-03 |
| Branch Email Configuration (Branch Email ID, Email Password) | Named field group in US 8605, distinct from Branch Details | PRD_UserStories.md US 5 §Branch Email Configuration |
| Branch Contact Info (Contact Name, Email ID, Phone, system-set Designation "ADMIN", Department multi-select, multiple contacts via Add) | Named field group in US 8605 | PRD_UserStories.md US 5 §Branch Contact Info |
| Branch Sales Configuration (Target Amount/Month/Year + Add Target, Credit Limit, Top-Up Limit, Credit Terms (Days), Reaching Percentage, Warning Prompt (Days), Payment Options + conditional Payment Gateway) | Named field group in US 8605; overlaps ORG-03/ORG-06's Credit Limit/Top-Up Limit/Credit Terms but US 8605 adds Target, Reaching Percentage, Warning Prompt, Payment Options | PRD_UserStories.md US 5 §Branch Sales Configuration; PRD.md ORG-03, ORG-06 (Agency-level analogue) |
| Product Access Details (default product Flight, grid columns Status/Supplier Name/Credential Name/Product Name/Description, conditional GDS sub-grid: Generic Supplier Credentials PCC, Manager Name, Supplier Credentials Description) | Named field group in US 8605; parallels the Agency-level Product Access section in User Story 3 (Create Agency) | PRD_UserStories.md US 5 §Product Access Details; PRD_UserStories.md US 3 §Product Access Details Section (structural analogue) |
| Import PNR (checkbox always checked, no user interaction) | Explicit AC in US 8605 | PRD_UserStories.md US 5 §Import PNR |
| Submit for Approval / Cancel actions | Explicit AC in US 8605; consistent with platform-wide maker–checker pattern | PRD_UserStories.md US 5 §Buttons & Actions; PRD.md §6.1 (XC-01…XC-04) |
| Child Agencies Threshold Amount field (Branch-level default threshold applied to inheriting child agencies) — live UI label is "Outstanding Threshold" | **Confirmed 2026-08-03 by the module owner: "Outstanding Threshold" on the live Create Branch screen IS US 51489 §2's "Child Agencies Threshold Amount" — same feature, different literal label.** US 51489 §2 Branch Module is this field's authoritative requirement (FINDING-010, disposition: Expected Implementation / Requirement Traceability, not a defect) | PRD_UserStories.md US 6 §2 Branch Module |
| Branch Threshold Update confirmation-popup flow (checks for child agencies with custom thresholds, lists them for review before confirming) | Explicit AC in US 51489 §4 Branch Threshold Update — triggered from the Branch side when its threshold changes | PRD_UserStories.md US 6 §4 Branch Threshold Update |

## 3. Out of Scope for This Module

| Area / Screen / Flow | Why out of scope | Covered by | PRD Reference |
|---|---|---|---|
| Search Branch (status-filtered search/list) | US 8605 covers Create only; Search Branch is named only as a Reflection item, not an AC | Not tested this run — out of run scope; owned by `branch` module's own future Search scope | PRD_UserStories.md US 5 §Reflection; PRD.md ORG-04 |
| Booking Module | Named only as a Reflection item (downstream impact awareness), no AC in US 8605 | `search-and-booking` module (Proposed) | PRD_UserStories.md US 5 §Reflection |
| Staff CRUD | Named only as a Reflection item | `staff` module (Proposed) | PRD_UserStories.md US 5 §Reflection |
| Agency CRUD | Named only as a Reflection item; Branch is a dependency/parent of Agency, not the reverse | `agency` module (Active) | PRD_UserStories.md US 5 §Reflection |
| Country POS (Operating Country master data) | Named as a Dependency, not an AC — Branch consumes it, doesn't create/manage it | Out of project scope for this module; likely `master-geography` (Proposed) | PRD_UserStories.md US 5 §Dependency |
| Department CRUD | Named as a Dependency, not an AC — Branch consumes Department for its multi-select, doesn't manage Departments | Not tested — no module yet owns Department CRUD explicitly (see §3.1) | PRD_UserStories.md US 5 §Dependency; PRD.md ORG-02 |
| Payment Mode (gateway master data) | Named as a Dependency, not an AC — Branch consumes it for the conditional Payment Gateway dropdown | `payment-gateway` module (Proposed) | PRD_UserStories.md US 5 §Dependency; PRD.md §7.6 (PAY-01…03) |
| Agency Threshold field (per-agency, individually adjustable) | US 51489 §1 Agency Module — this is the Agency CRUD screen's own field, not Branch's | `agency` module (Active) | PRD_UserStories.md US 6 §1 Agency Module |
| PNR Query read-only Threshold display | US 51489 §3 PNR Query — a display-only surface owned by whichever module ends up covering PNR Query (not yet decomposed — see §3.1 decomposition gap) | Not tested — no module yet owns PNR Query explicitly | PRD_UserStories.md US 6 §3 PNR Query |
| PAN Number field (US 8605 §Branch Details) | Confirmed absent from the live UI; module owner directed this be **ignored**, not pursued as a Test Design blocker | Ignored per module-owner direction, 2026-08-03 (see FINDING-008) | PRD_UserStories.md US 5 §Branch Details |
| Department multi-select (US 8605 §Branch Contact Info) | Confirmed absent from the live UI; module owner directed this be **ignored**, not pursued as a Test Design blocker | Ignored per module-owner direction, 2026-08-03 (see FINDING-009) | PRD_UserStories.md US 5 §Branch Contact Info |

## 3.1 Module Boundaries

| Related module | Interaction | Verified by |
|---|---|---|
| `agency` | Agency is created under a Branch and inherits Branch-level configuration (cascade); Create Branch must exist and succeed before an Agency creation flow can be exercised against it. | full-project execution only — this run is single-module (`branch`) |
| `master-geography` (Proposed) | Branch's Operating Country / Country / State / City cascading dropdowns depend on this module's master data. | not verified this run — treated as an external dependency; Discovery should probe whether the cascade behaves correctly given whatever master data currently exists |
| `payment-gateway` (Proposed) | Branch's Payment Option checkbox list **reflects the Payment Gateway module's Active records live** — confirmed by the module owner 2026-08-03 (FINDING-001), not a Branch-side data-binding defect. This is the same reflection pattern as the Supplier Credentials cascade (PRD.md SUP-05), extended to Payment Gateway. If a gateway record's name looks wrong on the Branch screen, the fix (if any) belongs to `payment-gateway`'s own data, not to Branch. | Confirmed 2026-08-03 via Human Observation corroborating this run's Direct Observation — not independently re-verified against the Payment Gateway module's own record list |
| Department CRUD (no module currently owns this explicitly — `company` module is Proposed and PRD.md ORG-02 describes Department CRUD under the Company hierarchy) | Branch Contact Info's Department multi-select depends on existing Departments. **Superseded 2026-08-03:** the Department control itself was found absent from the live Create Branch screen (FINDING-009), and the module owner directed this be ignored rather than pursued — this boundary is now moot for Branch's current build, though the decomposition gap below still stands on its own. | not verified this run — Department control does not currently exist on this screen to depend on anything |
| `agency` (Active) | US 51489 gives Agency its own Threshold field (§1), separate from Branch's Child Agencies Threshold Amount (§2); Branch's threshold is a *default* that child agencies inherit unless manually overridden with a custom value, and the Branch Threshold Update flow (§4) must detect and confirm-through agencies with such custom values. | not verified this run — Agency-side Threshold field and the inheritance/override mechanics are out of scope for this single-module run |
| PNR Query (not yet a module in `modules.json`) | US 51489 §3 requires PNR Query to display each agency's configured Threshold, read-only. | not verified this run — flagged as a second decomposition gap below |

**Decomposition gaps to flag at this stage's gate:**
1. Department CRUD (PRD.md ORG-02) has no explicit owning module in `modules.json` today — it would naturally sit under `company` (currently Proposed, scope not yet detailed). Moot for Branch's current build (Department control doesn't exist there — FINDING-009), but still an open decomposition question for whichever module eventually needs real Department CRUD.
2. PNR Query (PRD.md module map §3, under "Booking Mid Office") has no owning module in `modules.json` at all — US 51489 §3 needs it to display a read-only Threshold value. This run does not propose or create that module; it only records the gap.

This run does not create or modify any module. It only records these gaps per §3.1's guidance to report rather than guess.

## 4. Roles & Credentials Required

| Role | Permissions / purpose | Credential source | PRD Reference |
|---|---|---|---|
| Super Admin (`odeysysadmin`) | Creates a Branch via NDC Admin → Company → Branch → Create; submits for approval; also acts as approver — per the platform's standing maker–checker pattern (XC-01…XC-06), a Branch submitted for approval is expected to require a second approver, though US 8605 does not itself describe the approval step's UI | `knowledge_base/credentials/credentials.json` (resolved at runtime) — **available as of 2026-08-03** | PRD_UserStories.md US 5 (actor: System Administrator); PRD.md §2 (Actor table); PRD.md §6.1 |

## 5. Environment Constraints

| Constraint | Implication for downstream stages | Source |
|---|---|---|
| STG is a **shared environment**, not isolated — other testers/teams may have live data on it | Downstream stages must avoid destructive or irreversible actions against shared master/reference data (e.g. Departments, Payment Methods, geography) that other tests depend on | `run_configuration.md` §Target Environment |
| **Standing default is read-only** for every entity except Branch, per a run-specific override granted 2026-08-03 | Creating a Branch, Submit for Approval, Approve, and Reject are authorized **for Branch records only**. Every other entity (Company, Agency, Staff, Supplier, Role, reference data) stays read-only; no bookings, payments, wallet, top-ups, holds, or ticketing are permitted even to verify a downstream Reflection effect. Override does not carry forward to future runs. | `run_configuration.md` §Run-specific mutation override — US-8605 / `branch` only |
| Application URL reachability was last noted as **unverified since the 2026-07-29 platform migration**, and has not been re-checked for this run | Stage 2 (Discovery) must confirm reachability before proceeding and report a blocker if unreachable | `run_configuration.md` §Target Environment |

## 6. Carried-Forward Assumptions & Risks

| ID | Type | Statement (meaning preserved) | Affected Module(s) | PRD Reference |
|---|---|---|---|---|
| ASM-BR-1 | Assumption | US 8605 does not specify the exact validation *messages* per field (unlike User Story 3's Create-Agency field table, which lists a message per field). Downstream stages must treat exact error copy as unconfirmed and probe it rather than assume parity with the Agency form's messages. | branch | PRD_UserStories.md US 5 (absence of a message column); PRD_UserStories.md US 3 (contrast) |
| ASM-BR-2 | Assumption | "Free text, all character input" for Address 1/2, Branch Email ID, Email Password, and Contact Info Email ID is taken to mean no character-set restriction is enforced client-side; this has not been verified against the running application. | branch | PRD_UserStories.md US 5 §Branch Details, §Branch Email Configuration, §Branch Contact Info |
| RISK-BR-1 | Risk | US 8605's Post Office Box rule ("alphanumeric, max length 8") and Credit Limit rule ("numeric only, max length 15") are testable boundary conditions (7/8/9 chars; 14/15/16 digits) that PRD.md's ORG-03 does not mention at all — a gap between the two sources that Discovery/Test Design must resolve against the live UI, not by picking one source over the other silently. | branch | PRD_UserStories.md US 5 §Branch Details, §Branch Sales Configuration; PRD.md ORG-03 |
| RISK-BR-2 | Risk — **Resolved 2026-08-03 (both halves)** | ~~Warning Prompt (Days) must be "less than Credit Terms (Days)" and Reaching Percentage must not exceed 100% with up to 3 decimals — cross-field validations with no stated error message; if unenforced...~~ — **Both confirmed enforced.** Reaching Percentage cap confirmed via Direct Observation; Warning Prompt vs. Credit Terms cross-field rule confirmed via module-owner-supplied evidence (message: "Warning prompt days should not be greater than credit terms days"; boundary is strictly-greater-than, equal permitted). | branch | PRD_UserStories.md US 5 §Branch Sales Configuration; discovery/QA_Assessment_Report.md §6, §9 |
| RISK-BR-3 | Risk | "Search Supplier Credentials PCC & Ticketing Supplier Credential PCC shall be removed from UI and statically checked in the backend" describes a UI *removal* that cannot be visually verified as "absent by design" versus "not yet built" without Discovery evidence; the backend static-check behaviour is inherently unobservable from the UI alone. | branch | PRD_UserStories.md US 5 §Product Access Details |
| RISK-BR-4 | Risk — **Resolved 2026-08-03** | ~~The live "Outstanding Threshold *" field is believed to be US 51489's "Child Agencies Threshold Amount"...~~ — **Confirmed by the module owner as the same feature.** US 51489 §2 Branch Module is now this field's authoritative requirement; no longer treated as a working hypothesis. | branch | PRD_UserStories.md US 6 §2 Branch Module; discovery/findings/FINDING-010 |

**Dispositions recorded 2026-08-03 (module-owner review of Stage 2 Discovery):**

| Finding | Disposition | Basis |
|---|---|---|
| FINDING-001 (Payment Option list) | Not a defect — confirmed intended cross-module reflection of Payment Gateway's Active records | Module owner: "inherite from the payment gateway module so if i create any payment gateway it will be appeared in the Branch CRUD, if only the payment gateway is active" |
| FINDING-005 (Import PNR unchecked) | Not a defect — confirmed intended, current behavior; US 8605's "always checked" wording is outdated | Module owner: "this is a feature not a bug" |
| FINDING-006 (Flight checkbox editable) | Outdated Requirement — US 8605 predates current behavior | Module owner: "Flight ... [is] a US Gap because the US is old" |
| FINDING-007 (no Payment Gateway dropdown on Credit Card) | Outdated Requirement — US 8605 predates current behavior | Module owner: "Payment Gateway ... [is] a US Gap because the US is old" |
| FINDING-008 (PAN Number absent) | Ignored per explicit module-owner direction — not pursued as a Test Design blocker | Module owner: "ignore this Two Mandatory fields from the story don't exist in the UI at all" |
| FINDING-009 (Department absent) | Ignored per explicit module-owner direction — not pursued as a Test Design blocker | Module owner: "ignore this Two Mandatory fields from the story don't exist in the UI at all" |
| FINDING-010 (Outstanding Threshold field) | **Expected Implementation / Requirement Traceability** — confirmed match to US 51489 §2 Branch Module ("Child Agencies Threshold Amount"); not an application defect | Module owner: "Yes, you can treat them as the same feature. Outstanding Threshold on the Branch UI corresponds to 'Child Agencies Threshold Amount' defined in US 51489 / WT1-T3177." |

## 7. Traceability Anchor

| Context Item | Section here | PRD Reference |
|---|---|---|
| Branch Details field group | §2 | PRD_UserStories.md US 5 §Branch Details; PRD.md ORG-03 |
| Branch Email Configuration field group | §2 | PRD_UserStories.md US 5 §Branch Email Configuration |
| Branch Contact Info field group | §2 | PRD_UserStories.md US 5 §Branch Contact Info |
| Branch Sales Configuration field group | §2 | PRD_UserStories.md US 5 §Branch Sales Configuration; PRD.md ORG-03, ORG-06 |
| Product Access Details field group | §2 | PRD_UserStories.md US 5 §Product Access Details |
| Import PNR checkbox | §2 | PRD_UserStories.md US 5 §Import PNR |
| Submit for Approval / Cancel | §2 | PRD_UserStories.md US 5 §Buttons & Actions; PRD.md §6.1 |
| Search Branch / Booking / Staff CRUD / Agency CRUD exclusions | §3 | PRD_UserStories.md US 5 §Reflection |
| Country POS / Department CRUD / Payment Mode dependencies | §3, §3.1 | PRD_UserStories.md US 5 §Dependency |
| Field-message and validation-boundary assumptions/risks | §6 | PRD_UserStories.md US 5; PRD_UserStories.md US 3 (contrast) |
| Child Agencies Threshold Amount field ("Outstanding Threshold" live) / Branch Threshold Update popup | §2, §3.1, §6 | PRD_UserStories.md US 6 §2, §4 (**authoritative source for this field, confirmed 2026-08-03**) |
| Agency Threshold field / PNR Query Threshold display exclusions | §3, §3.1 | PRD_UserStories.md US 6 §1, §3 |
| Module-owner Finding dispositions (2026-08-03) | §6 | discovery/findings/FINDING-001, 005, 006, 007, 008, 009, 010 |

## 8. Open Questions — Requires Run Configuration

`platform_core_data/knowledge_base/run_configuration.md` was updated 2026-08-03 to reflect this run
(US-8605 — Create Branch): modules-in-scope, requirements sources, credentials, and a Branch-scoped mutation
override are now current. Two items remain genuinely open and must not be guessed:

| Missing Key | Sections Affected |
|---|---|
| Re-confirmation that `http://192.168.1.70` (STG) is actually reachable post-migration — noted as unverified, not yet re-checked | §5 Environment Constraints — Stage 2 (Discovery) resolves this as its first action |
| Pipeline Branch (Manual vs. Automation) for this run has not yet been chosen | §1 Scope Summary — not a Discovery blocker; becomes one at the Stage 3→4 branch point |

**Resolved as of 2026-08-03** (previously listed here, now closed): `branch` named explicitly in Modules In
Scope; Branch-scoped mutation override granted (Create, Submit for Approval, Approve, Reject — Branch
records only); Super Admin (`odeysysadmin`) credentials supplied and available via `credentials.json`.

**Carried forward, not resolved (by design — see §3.1):** Department CRUD (PRD.md ORG-02) is attributed to
the `company` module by that module's own proposed scope statement, but `company` itself remains `Proposed`
— not yet approved or scaffolded. This is a decomposition/approval gap, not a run-configuration gap, and is
recorded in §3.1 rather than here.
