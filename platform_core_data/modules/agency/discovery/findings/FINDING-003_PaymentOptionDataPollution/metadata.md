# FINDING-003

- **Finding ID:** FINDING-003

- **Title:** The mandatory Payment option control offers 28 choices, of which 23 are person names or single letters

- **Category:** Observation

- **Requirement Disposition:** **`Not a requirement mismatch — environment / data quality`** *(Project Context §1.1 — added 2026-07-31 by user directive)*
  **Basis:** the disposition taxonomy exists to arbitrate between the story and the application where the
  two describe the same behaviour differently. **This Finding is outside that frame entirely.** The
  application's *behaviour* is not in question — a mandatory checkbox group renders the Payment Method
  master data it is given, which is correct. What is in question is the *data*. No requirement, in either
  source, is outdated or violated by the rendering itself.
  Consequently the 2026-07-31 directive neither resolves nor weakens this Finding: it stands exactly as
  raised. The one thing the directive does rule out is reading the currently-rendered 28 options as
  authoritative simply because they are what the application shows — "the application is the primary
  reference" applies to *behaviour where the story is outdated*, not to polluted master data.

- **Severity:** N/A

- **Severity Reason:** `Observation` carries no impact-if-defect rating (§5.4). It is classified as an Observation rather than a Bug because this skill cannot determine from the UI whether the extra entries are shared-staging test pollution (an environment condition, not a product defect) or master data the product accepted without validation (a real defect). Both readings are stated under Root Cause Hypothesis; the impact-if-real is under Business Risk.

- **Confidence Score:** 98%

- **Evidence Category:** Direct Observation

- **Status:** Needs Human Review

- **Business Risk:** `Payment option` is a **mandatory** control (the application marks it `*`) that determines how an agency is permitted to pay. An operator configuring an agency is presented with 28 checkboxes of which only five are recognisable payment instruments; the remaining 23 are selectable and indistinguishable in kind from the real ones. Two consequences: an agency can be saved with a meaningless payment instrument, and a tester executing AC-7 cannot tell a correct option set from a polluted one — so "verify the payment options are correct" has no stable expected result until the list is cleaned. If this list is drawn from the same Payment Method master data the production system uses, the same pollution would be visible to production operators.

- **Technical Risk:** Suggests **Payment Method master data accepts arbitrary free-text names with no validation and no cleanup path**. PRD PAY-01 documents Payment Methods as configurable master data with add/edit/enable-disable, and PRD PAY-02 records only success-message and activation-indicator assertions — no uniqueness, format, or plausibility constraint is documented or automated. Entries `m` and `f` (single characters) suggest the field accepts input of any length.

- **Module:** `agency`

- **Workflow:** Admin → Agency → Agency → edit an existing agency → Payment settings → Payment option

- **Description:** The `Payment option *` control on the Update Agency form renders 28 checkboxes. The first five are payment instruments; the next 21 are given names; the last two are the single characters `m` and `f`. In document order:

  | # | Entry | Plausible payment instrument? |
  |---|---|---|
  | 1–5 | `Cash`, `Wallet`, `Credit Card`, `BANQUE MISR`, `Fawry` | yes — all five match PRD PAY-03 |
  | 6–26 | `Isaiah`, `Filomena`, `Astrid`, `Olive`, `Dan`, `Rico`, `Collin`, `Bryant`, `Emilio`, `Tracy`, `Alma`, `Desmond`, `Enda`, `Hiram`, `Shannon`, `Quinton`, `Monserrate`, `Joey`, `Israel`, `Kasi`, `Joan` | no — all read as given names |
  | 27–28 | `m`, `f` | no — single characters |

  On the agency inspected, four of the five real instruments were checked (`Cash`, `Wallet`, `BANQUE MISR`, `Fawry`) and none of the 23 others.

- **Expected Behavior:** The Project Context (`modules/agency/context/ProjectContext.md` §2, row "Payment Settings") cites **US-4222 AC-7**, which states *"Multiple payment options (e.g., Cash, Wallet, Credit Card, etc.) must be selectable"* and gives no authoritative complete list — recorded as **ASM-014** precisely because the story leaves the option set undefined. **PRD PAY-03 `[V]`** does name the set: *"Supported agency payment instruments include Cash, Wallet, Credit Card, Bank Transfer, and the gateways Banque Misr and Fawry."* Neither source describes person names as valid payment options, but neither explicitly forbids additional configured methods either, since PAY-01 makes Payment Methods configurable master data.

- **Actual Behavior:** 28 selectable options, 23 of which correspond to nothing in either requirement source and read as personal names or stray characters.

- **Steps to Reproduce:**
  1. Authenticate to `http://192.168.1.70` as an Admin-capable account.
  2. Navigate Admin → Agency → Agency; open any agency via the pencil icon (observed at `/admin/agency/edit/949`).
  3. Scroll to the **Payment settings** section.
  4. Read the checkbox row labelled `Payment option *`.

- **Investigation/Recovery Result:** Not applicable — no Investigation & Recovery Engine failure category matched (§5.7); nothing failed. The list was read twice in two separate browser sessions (during form inventory, and again during evidence capture) and both returned the identical 28 entries in the identical order, so this is not a transient render artefact.

- **Investigation Notes:** Membership was established two ways rather than one, because the first method was unreliable: reading each checkbox's label through DOM-wrapper heuristics returned every label blank (this application's checkbox labels are not associated in a way those heuristics detect), and it over-collected — climbing the wrapper tree captured 56 checkboxes spanning both Payment option and Product Access. The figure of 28 comes instead from slicing the page's **rendered visible text** between the `Payment option` label and the next section heading, `Product Access Details`, which is what a human reading the screen sees; it is confirmed independently by the screenshot, where all 28 checkboxes and their labels are legible in a single frame. **The upstream source was deliberately not inspected:** confirming these entries exist in Payment Method master data would mean navigating Master → Payment Gateway → Payment Method, which belongs to the `payment-gateway` module and is out of scope for this run (Project Context §3), and the run's mutation authorization covers Agency records only — so no attempt was made to delete or edit any of them. **A second, related pollution instance was observed in the same section and is recorded here rather than as a separate Finding:** the Product Access Details grid's `DESCRIPTION` cell for the `SalamAir` row contains the free text `sad`, visible in this Finding's screenshot. It is the same underlying condition — unvalidated test data on shared staging — and per §5.9 an equivalent condition is appended, not re-raised.

- **Root Cause Hypothesis:** These are most likely **Faker-generated Payment Method records created by prior automated test runs against this shared environment**, never cleaned up. Three details support that reading: the names are stylistically consistent with Faker's given-name corpus (`Filomena`, `Monserrate`, `Kasi` are uncommon in real use but characteristic of generated data); PRD DEF-6 already records that the reference automation suite hardcodes and generates environment-specific test records; and the Project Context carries ASM-010 forward on exactly this risk. The entries `m` and `f` look instead like a gender field's values written into the wrong master-data table, or a manual smoke-test entry. **Confidence in this hypothesis: 70%.** *Unknowns:* whether these records exist in Payment Method master data or are injected by this screen; whether they exist in any environment other than STG — which is the question that decides whether this is staging hygiene or a production data-integrity defect; and whether the master-data screen offers a delete path at all.

- **Occurrence Count:** 2 *(the Payment option list, and the `sad` value in the Product Access `DESCRIPTION` field — one underlying condition, per §5.9)*

- **Evidence Links:**
  - `payment_options_focused.png` — all 28 checkboxes with labels legible in one frame, plus the surrounding Payment settings fields and the Product Access grid showing the `sad` description
  - `rendered_options.txt` — the 28 entries as an ordered list, extracted from the page's rendered text
  - **Not captured:** the upstream Payment Method master-data screen — deliberately, as out of scope (see Investigation Notes). Console log — the session produced zero console output.

- **Recommendation:** Confirm with whoever owns this environment whether the 23 extra entries exist only on STG. If they do, request a master-data cleanup **before Stage 4M executes AC-7**, since the payment-option criteria have no stable expected result until then; if they exist in other environments, this warrants a defect against Payment Method master-data validation rather than an environment cleanup. Either way, Stage 3 should treat the *authoritative* option set as an open question (ASM-014) rather than encoding the currently-rendered 28 as expected — and it is worth asking whether Payment Method creation should validate its input at all, which is a `payment-gateway` module concern, not this one's.
