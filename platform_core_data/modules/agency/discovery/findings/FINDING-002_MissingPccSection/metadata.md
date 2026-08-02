# FINDING-002

- **Finding ID:** FINDING-002

- **Title:** AC-9's entire Airline Supplier Credential (PCC) section is absent from both the update and the create form

- **Category:** Requirement Gap

- **Requirement Disposition:** **`Possible Application Defect / Possible Removed Feature`** — **explicitly NOT dispositioned as story-outdated** *(Project Context §1.1, **row 3** — added 2026-07-31 by user directive)*
  **Basis:** this is the case row 3 exists for, and it points the opposite way from the Threshold fields.
  Here the PRD **corroborates the story rather than the application**: **ORG-05 `[V]`** lists *"Airline
  Supplier Credential (PCC)"* among the agency form's sections, and **ORG-07 `[V]`** describes an agency
  being assigned supplier PCCs inherited from Supplier & Branch. Both carry `[V]`, meaning an automated
  assertion once passed against that behaviour. So **two independent sources expected this section and
  the application does not render it** — which is the signature of removed or relocated functionality,
  not of an outdated story.
  Applying "the application is the primary reference" here would convert a possible regression into a
  documentation correction. **DOQ-02 therefore remains open and requires business confirmation before
  Stage 3 designs against observed behaviour.**

- **Severity:** N/A

- **Severity Reason:** `Requirement Gap` carries no impact-if-defect rating (§5.4). Whether the absence is a defect or a superseded requirement is exactly what a human must decide, and asserting a severity would prejudge that.

- **Confidence Score:** 90%

- **Evidence Category:** Direct Observation

- **Status:** Needs Human Review

- **Business Risk:** AC-9 defines five fields, three of them mandatory (`Search Supplier Credential PCC`, `Generic Supplier PCC`, `Manager Name`, plus `Supplier Credential Description` mandatory and `Ticketing Supplier Credentials PCC` optional). If the section genuinely does not exist, **five acceptance criteria cannot be tested at all** and the story cannot be accepted as written. If instead the capability was folded into Product Access Details (see the hypothesis), the criteria are testable but under different field names — and Stage 3 would need rewriting against the real section rather than the story's.

- **Technical Risk:** None identified from the UI alone. Supplier-credential assignment to an agency does appear to exist in some form — the Product Access Details grid carries `SUPPLIER NAME` and `CREDENTIAL NAME` columns with populated rows — so this is more likely a UI/requirement reorganisation than a missing capability. That cannot be confirmed without a source or database view, neither of which is in this run's scope.

- **Module:** `agency`

- **Workflow:** Admin → Agency → Agency → edit an existing agency (and, for comparison, Add agency)

- **Description:** The Update Agency form's rendered text was searched for AC-9's section heading and every field name it defines. None is present. The same search was then run against the **create** form (`/admin/agency/add`) to establish whether the section exists in the product at all — it does not appear there either.

  | AC-9 term | On create form | On update form |
  |---|---|---|
  | `Airline Supplier Credential` | absent | absent |
  | `Supplier Credential` | absent | absent |
  | `PCC` | absent | absent |
  | `Amadeus` | absent | absent |
  | `Sabre` | absent | absent |
  | `Ticketing` | absent | absent |
  | `Generic Supplier` | absent | absent |
  | `Manager Name` | absent | absent |
  | `Galileo` | **present** | **present** |

  The single hit, `Galileo`, is **not** an AC-9 field. It occurs in the Agency Features section as explanatory text for an unrelated control: *"Blue Command Screen — This option requires the Galileo supplier to be enabled."* It is reported here so the term-presence table is not read as partial support for AC-9 existing.

  The form's actual sections, in order, are: Agency Master (untitled, under the `Update Agency` heading) · Agency Owner Details · Upload Document · Agency Logo · Wonder Travel Sales Contact · Bank Account Details · Payment settings · Product Access Details · Agency Features · Remarks. Nine of US-4222's ten AC groups map onto these; **AC-9 is the one with no counterpart.**

- **Expected Behavior:** The Project Context (`modules/agency/context/ProjectContext.md` §2, row "Airline Supplier Credential (PCC)") lists this section as in scope for this run, citing **US-4222 AC-9** and **PRD ORG-07 `[V]`** — *"An agency is assigned one or more supplier PCCs (e.g. `Galileo Live UAE`), inherited from Supplier & Branch"* — together with **PRD ORG-05 `[V]`**, which lists *"Airline Supplier Credential (PCC)"* among the agency form's sections. Both PRD requirements are tagged `[V]`, meaning an existing automated assertion pins them.

- **Actual Behavior:** Neither the update form nor the create form renders an Airline Supplier Credential / PCC section, nor any of its five named fields.

- **Steps to Reproduce:**
  1. Authenticate to `http://192.168.1.70` as an Admin-capable account.
  2. Navigate Admin → Agency → Agency; click **Add agency**. Scroll the full form. Observe no Airline Supplier Credential / PCC section.
  3. Return to `/admin/agency`, open any agency via the pencil icon (observed at `/admin/agency/edit/949`). Scroll the full form to the bottom.
  4. Observe the section list ends: Product Access Details → Agency Features → Remarks → action buttons. No PCC section appears at any scroll position.

- **Investigation/Recovery Result:** Not applicable — no failure category from the Investigation & Recovery Engine (§5.7) matched. Nothing failed; a section is simply not present. In place of recovery, the observation was **corroborated on a second, independent surface**: the create form was read for the same terms, which is what distinguishes "absent from the flow under test" from "absent from the product". Both came back absent.

- **Investigation Notes:** The form was fully scrolled top-to-bottom before reading, in 500-pixel steps with a pause at each, specifically so any lazily-mounted section would render before the text was captured — an earlier pass that read the form without scrolling saw fewer sections, so this precaution is load-bearing rather than defensive. Two conditions under which the section might still exist were **not** exercised, and are the reason Confidence is 90% rather than higher: (a) the section may be conditional on state this agency lacks — for example, it might appear only after changing `Branch`, or only for an agency whose branch has particular supplier credentials assigned; and (b) it may live on a different screen reached from elsewhere in the Agency submenu (`Category Management` and `Agency Assignation` were seen in that submenu and not explored, since neither is named by US-4222). Probing (a) would mean changing the Branch dropdown on a live agency, which risks the destructive-by-inheritance behaviour the Project Context flags as ASM-016 — deliberately not attempted during Discovery.

- **Root Cause Hypothesis:** AC-8 (Product Access Details) and AC-9 (Airline Supplier Credential) may have been **merged into one section** in the current build. The Product Access Details grid renders columns `STATUS · SUPPLIER NAME · CREDENTIAL NAME · PRODUCT NAME · DESCRIPTION`, populated with `SalamAir / Salam Air Live / Flight` and `FlyNas / fly nas cred / Flight` — that is supplier-credential assignment, and `DESCRIPTION` plausibly corresponds to AC-9's `Supplier Credential Description`, which AC-8 also lists. On that reading the capability survives while AC-9's field-level vocabulary (the three PCC-type filters, `Generic Supplier PCC`, `Manager Name`) does not. **Confidence in this hypothesis: 55%.** *Unknowns:* whether `Manager Name` and the Amadeus/Galileo/Sabre filters have any counterpart anywhere; whether the merge was deliberate; and whether the PRD's `[V]` tag on ORG-05/ORG-07 reflects automation that has since been broken by a UI change, which would make those tags stale rather than wrong.

- **Occurrence Count:** 1

- **Evidence Links:**
  - `product_access_section.png` — the Product Access Details section as it actually renders, including the supplier/credential grid that the hypothesis concerns
  - `agency_features_section.png` — the section immediately following it, showing the form proceeding to Agency Features with no PCC section between them
  - `section_inventory.txt` — the update form's complete rendered text, so a reviewer can confirm the absence independently rather than taking this Finding's word for it
  - `../../evidence/agency_update_form_fullpage.png` — full-page capture of the entire form, top to bottom
  - **Not captured:** a screenshot of the create form is held once at `../../evidence/` rather than duplicated into this package; console log — the session produced zero console output.

- **Recommendation:** Ask the product owner whether AC-9 was superseded by the Product Access Details section, and if so obtain the field-level mapping so Stage 3 can design against the real section rather than the story's names. If AC-9 is still expected as specified, this becomes a missing-feature defect and its five criteria should be marked `Blocked — feature not present` rather than `Failed`. Separately worth flagging to whoever maintains the reference automation suite: PRD ORG-05/ORG-07 are tagged `[V]`, which implies a passing assertion against a section that does not appear to exist — those tags may be stale.
