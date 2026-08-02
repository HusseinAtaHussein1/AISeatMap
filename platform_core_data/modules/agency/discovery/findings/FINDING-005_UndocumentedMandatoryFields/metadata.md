# FINDING-005

- **Finding ID:** FINDING-005

- **Title:** Seven fields exist on the update form that US-4222 does not describe — later enhancements, two of them mandatory

- **Category:** Requirement Gap

- **Requirement Disposition:** **`Story Outdated / Requires Business Confirmation`** — with **`Outstanding Threshold` confirmed settled** *(Project Context §1.1 — added 2026-07-31 by user directive)*

  The user directive of 2026-07-31 states that US-4222 predates later enhancements and that
  **Threshold-related fields are expected to exist despite the story's silence.** These seven fields are
  therefore *later implemented functionality*, not unexpected or missing functionality. The disposition is
  assigned **per field**, because the PRD does not say the same thing about all seven:

  | Field | §1.1 row | Disposition | Basis |
  |---|---|---|---|
  | `Outstanding Threshold *` | **4** | **`Story Outdated — Confirmed`** | **Explicitly confirmed by the product owner, 2026-07-31**, as a later enhancement. Settled — no open question remains |
  | `Remarks *` | **1** | **`Story Outdated — PRD-corroborated`** | **PRD XC-03 `[V]`** — *"Approval and rejection both accept a free-text Remarks entry, captured as the audit reason"*. The PRD corroborates the application, so the story is the outlier. Its update-only presence is exactly what XC-03 predicts: it is a governance field of the approval workflow |
  | `Fax No` | 2 | `Story Outdated / Requires Business Confirmation` | PRD silent. Treated as later functionality under the directive |
  | `Agency Business Type` (`B2B`/`Freelancer`) | 2 | `Story Outdated / Requires Business Confirmation` | PRD silent. A functional switch, so worth confirming rather than assuming cosmetic |
  | `Transfer Pnr Option` | 2 | `Story Outdated / Requires Business Confirmation` | PRD silent on an agency-level toggle. PRD §7.13 RPT-12 records a Transfer PNR report with no coverage, so the capability exists elsewhere in the product |
  | `Blue Command Screen` | 2 | `Story Outdated / Requires Business Confirmation` | PRD silent. Carries its own in-app note tying it to Galileo, so it is clearly deliberate functionality |
  | `Enable Search Limit` | 2 | `Story Outdated / Requires Business Confirmation` | PRD silent here, though SUP-08/SET-01 `[V]` establish search-result limiting as a real platform concern — consistent with a later agency-level exposure of it |

  **None of the seven is an application defect.** The two sub-observations recorded further down disposition differently and are called out so they are not swept in: **AC-8's absent mandatory markers** are §1.1 **row 2** but carry a caveat — "no `*` shown" could equally mean validation was never applied, which is a defect-shaped possibility, so Stage 3 should design to observed behaviour *and* note it; **field order** and **toggle-vs-checkbox** are row 2 and purely cosmetic.

- **Severity:** N/A

- **Severity Reason:** `Requirement Gap` carries no impact-if-defect rating (§5.4). The application is not misbehaving; the story is incomplete relative to it. The consequence for this run is under Business Risk.

- **Confidence Score:** 95%

- **Evidence Category:** Direct Observation

- **Status:** Needs Human Review

- **Business Risk:** **Reduced by the 2026-07-31 directive, but not eliminated.** The load-bearing fact is unchanged: two of the seven fields are mandatory (`Outstanding Threshold *`, `Remarks *`), so **a test case that fills only what US-4222 names cannot complete a save.** What changed is its meaning — that is now a Stage 3 *design instruction* rather than an unresolved requirement problem, because both fields are dispositioned as legitimate later functionality (row 4 and row 1 respectively) and Stage 3 has authority to supply values for them.

  What remains: four of the seven (`Agency Business Type`, `Transfer Pnr Option`, `Blue Command Screen`, `Enable Search Limit`) are **functional switches on live commercial configuration with no acceptance criteria governing them**. An agency update can therefore change real behaviour — whether PNRs can be transferred, whether the Galileo command screen is available — in ways this run has no defined expected result for. That is a genuine coverage gap regardless of which requirement source is authoritative, and confirming intended behaviour for those four is worth doing before they are ever exercised. `Fax No` needs no such caution; it is an inert contact field.

- **Technical Risk:** None identified. The fields are present and populated; nothing about their existence indicates a fault.

- **Module:** `agency`

- **Workflow:** Admin → Agency → Agency → edit an existing agency (full form)

- **Description:** The Update Agency form was compared field-by-field against US-4222's ten AC groups. Seven controls exist in the application that the story does not describe at all:

  | Field | Section | Mandatory in app? | In US-4222? |
  |---|---|---|---|
  | `Fax No` | Agency Master | no | absent |
  | `Agency Business Type` (`B2B` / `Freelancer`) | Agency Master | no | absent |
  | `Outstanding Threshold` | Payment settings | **yes (`*`)** | absent |
  | `Transfer Pnr Option` | Agency Features | no | absent |
  | `Blue Command Screen` | Agency Features | no | absent |
  | `Enable Search Limit` | Product Access Details | no | absent |
  | `Remarks` | *(own section, above the buttons)* | **yes (`*`)** | absent |

  `Remarks` has a further property worth separating out: it is present on the **update** form and **absent from the create** form. It is therefore specific to the update flow — the very flow US-4222 governs — and mandatory there.

  For completeness, the application marks 23 fields mandatory. The full list as rendered: `Branch`, `Agency`, `Country`, `State`, `City`, `Post office box`, `Address`, `Phone No`, `Contact person`, `Email ID`, `Phone Number`, `Upload document`, `Contract Start Date`, `Contract End Date`, `Upload logo`, `Name`, `Invoice generation`, `Credit limit`, `Top up limit`, `Outstanding Threshold`, `Credit Terms (Days)`, `Payment option`, `Remarks`.

  Two further mismatches surfaced from the same comparison and are recorded here rather than as separate Findings, since all three are the one condition — *the story's field set and the application's field set differ*:

  - **Field order differs from AC-1.** The story orders the Agency Master fields: Branch, Agency Name, Country, State, City, IATA Agency, Post Office Box, Company URL, Phone no., Address 1, Address 2. The application renders: Branch, Agency, Country, State, City, Post office box, Company URL, Fax No, Address, Address, Phone No, IATA Agency, Agency Business Type. `IATA Agency` sits near the end rather than after City.
  - **AC-8's mandatory markings are not reflected.** The story marks `Product`, `Status Column`, `Credential name`, and `Description` as Mandatory; none of the Product Access Details controls carries a `*` in the application.

- **Expected Behavior:** The Project Context (`modules/agency/context/ProjectContext.md` §2) enumerates the in-scope surface as exactly US-4222's ten AC groups, and §1 states the run takes *"the narrowest and most literal"* reading of scope. It also records, in §1, that **the PRD contains no requirement describing the Agency update flow** (ASM-002) — so for any field the story omits, there is no secondary requirement source to fall back on. PRD ORG-05 `[V]` and ORG-06 `[V]` list the create form's sections and four Payment Settings fields respectively; neither mentions any of the seven fields above. The Project Context does not define expected behaviour for them.

- **Actual Behavior:** Seven undocumented controls are present, two of them mandatory, plus the ordering and mandatory-marking differences noted above.

- **Steps to Reproduce:**
  1. Authenticate to `http://192.168.1.70` as an Admin-capable account.
  2. Navigate Admin → Agency → Agency; open any agency via the pencil icon (observed at `/admin/agency/edit/949`).
  3. Scroll the full form and read every field label and `*` marker.
  4. Compare against US-4222's AC-1 through AC-10 field tables.
  5. For the `Remarks` difference specifically: return to `/admin/agency`, click **Add agency**, scroll that form, and observe no Remarks field.

- **Investigation/Recovery Result:** Not applicable — no Investigation & Recovery Engine failure category matched (§5.7); nothing failed. The field inventory was read in two independent sessions with identical results, and the create/update comparison was performed in a single session so both forms were read against the same build.

- **Investigation Notes:** The mandatory list was derived from the `*` markers the application itself renders, read out of the page's visible text — not from HTML `required` attributes, which on this form are unreliable (an earlier pass found the framework does not set them consistently on its custom controls). The form was fully scrolled before reading so lazily-mounted sections were present. **What was deliberately not established:** whether `Outstanding Threshold` and `Remarks` are enforced on submit, or merely marked. Confirming enforcement means clearing one and submitting — a save against a live agency, which this stage does not perform (Project Context §5); FINDING-001 established that clearing a mandatory field renders `Required` on blur, so client-side enforcement is likely for both, but server-side enforcement is untested. The semantics of the four functional switches (`Agency Business Type`, `Transfer Pnr Option`, `Blue Command Screen`, `Enable Search Limit`) were **not** explored: doing so would mean toggling live commercial configuration on shared staging, and none of them is named by US-4222. `Blue Command Screen` carries its own on-screen note — *"This option requires the Galileo supplier to be enabled"* — which is the only in-app documentation any of the seven provides.

- **Root Cause Hypothesis:** US-4222 most likely describes an **earlier or idealised version of the form** than the one deployed. Supporting details: the story's Expected Outcome section contains a copy-paste artefact from a Role story (`"the role update process"` — Project Context ASM-011), suggesting it was assembled from a template; and `Remarks` existing only on update is consistent with PRD XC-03 `[V]`, which requires a free-text Remarks entry as the audit reason for approval actions — i.e. it is a governance field the story's author may have considered out of the form's scope rather than part of it. **Confidence in this hypothesis: 65%.** *Unknowns:* whether the seven fields postdate the story; whether any are deliberately excluded from its scope rather than overlooked; and what valid values `Outstanding Threshold` accepts, which Stage 3 needs in order to write a positive case at all.

- **Occurrence Count:** 1 *(one condition — the story's field set differs from the application's — evidenced across three sections, per §5.9)*

- **Evidence Links:**
  - `agency_master_section.png` — Agency Master as rendered, showing `Fax No`, the field order, and `Country` greyed out as read-only
  - `payment_settings_section.png` — Payment settings, showing `Outstanding Threshold *` mandatory alongside the fields AC-7 does describe
  - `mandatory_fields_as_marked_by_app.txt` — all 23 fields the application marks mandatory
  - `../../evidence/agency_update_form_fullpage.png` — the whole form, so the seven fields can be located in context
  - `../FINDING-002_MissingPccSection/section_inventory.txt` — the complete rendered text of the update form (held once, referenced not duplicated)
  - **Not captured:** the create form's rendered text is at `../../evidence/` rather than duplicated here. Console log — the session produced zero console output.

- **Recommendation:** **Largely resolved by the 2026-07-31 directive.** Stage 3 should now design all seven fields **to observed behaviour** rather than marking them `Requires Upstream Requirement`, and should supply values for the two mandatory ones so positive cases can complete — labelling each expected result with its §1.1 disposition row so a reviewer can see which rest on the directive (rows 1–2) and which on explicit confirmation (row 4).

  Two items still worth a product-owner answer, neither blocking: (a) **valid range and business meaning for `Outstanding Threshold`** — its existence is confirmed, but Stage 3 still has to choose a value, and the observed value is `5` against a `Credit limit` of `1000000`, which suggests it is not a currency amount and may be a count or a percentage; getting this wrong produces a passing test that asserts nothing meaningful. (b) **Whether `Remarks` content is governed** — free text is assumed. Separately, confirm intended behaviour for the four functional switches before any test toggles them (see Business Risk). Field order and toggle-vs-checkbox remain documentation corrections, not test cases.
