# FINDING-004

- **Finding ID:** FINDING-004

- **Title:** The document upload field applies no file-type restriction, and a `.png` is currently attached where AC-3 requires PDF

- **Category:** Observation

- **Requirement Disposition:** **`Application Defect (candidate)`** *(Project Context §1.1, **row 5** — added 2026-07-31 by user directive)*
  **Basis:** row 5 covers application behaviour that appears to violate a rule **no source has
  superseded**, and that is the situation here. The directive reassigns authority where the story is
  *outdated* — it does not license treating every story requirement the application fails to enforce as
  obsolete. A PDF-only constraint on contract documents is a **business rule about data integrity, not a
  UI detail that evolves**: nothing in the PRD supersedes it, no later enhancement plausibly *removes* a
  format restriction, and PRD §10 records the constraint as real but never automation-verified (ASM-009).
  So the honest disposition is defect-candidate, pending the one test that settles it.
  **Not yet a confirmed defect:** only the *absence of client-side restriction* is established. Whether
  the server rejects a non-PDF on submit is untested, and that is the deciding question — Stage 4M answers
  it with the prepared fixtures. If the server does reject, this closes as a UI-affordance observation.

- **Severity:** N/A

- **Severity Reason:** `Observation` carries no impact-if-defect rating (§5.4). Classified as an Observation rather than a Bug because two facts are established (no client-side restriction; a PNG is attached) but the one that would make it a defect — that the form *accepts* a non-PDF on submit — was not tested, since testing it requires saving a record. Impact-if-real is under Business Risk.

- **Confidence Score:** 90%

- **Evidence Category:** Direct Observation

- **Status:** Needs Human Review

- **Business Risk:** AC-3 states documents must be **PDF files** and specifies the rejection message `"Please Upload a valid file format."` If the restriction is not enforced, agency contract documents can be stored in arbitrary formats — which matters because these documents carry contract start and end dates and are the record of the commercial agreement. A downstream consumer expecting a PDF (a viewer, a report, an export) may fail on an image. The presence of a PNG on a live agency record suggests this has already happened at least once.

- **Technical Risk:** The two file inputs on the form are configured **differently**, which is the substantive technical observation: the logo input restricts to `accept="image/*"`, while the document input carries **no `accept` attribute at all**. So the browser's own file-picker filtering is applied to logos and not to documents. Client-side `accept` is a convenience, never a security control — the real question is whether server-side validation exists, and that is untested. If it does not, the upload path accepts arbitrary file types, which is a file-handling risk beyond a formatting inconvenience.

- **Module:** `agency`

- **Workflow:** Admin → Agency → Agency → edit an existing agency → Upload Document

- **Description:** Two distinct facts were observed in the Upload Document section of the Update Agency form:

  1. **A non-PDF file is currently attached.** The document listed on the inspected agency is named `screen-1-logo-black-and-white.png` — an image, on a record whose document field AC-3 restricts to PDF.
  2. **The document input declares no accepted type.** Reading both file inputs on the form:

  | File input | `accept` attribute | `multiple` |
  |---|---|---|
  | Document (AC-3) | **none** | false |
  | Logo (AC-4) | `image/*` | false |

  The contrast is the point: the form's author restricted one input and not the other, so the absence on the document input is a specific configuration state rather than a framework-wide omission.

  Also worth noting for Stage 3, though not itself a defect: both inputs have `multiple=false`, while AC-3 requires that *"System shall allow the upload of multiple documents"*. The form provides an **`Add`** button beneath the document row instead, so multiple documents are presumably supported by adding rows rather than by multi-select — a design difference from what the story's wording implies, and one Stage 3 should design against.

- **Expected Behavior:** The Project Context (`modules/agency/context/ProjectContext.md` §2, row "Upload Document Details") cites **US-4222 AC-3** — documents are `PDF Files`, `Mandatory`, rejected with `"Please Upload a valid file format."` — together with **PRD §10 (file storage)**, which the Project Context records as confirming that *"the PDF constraint comes from the business story, not from automation"*. This is carried forward explicitly as **ASM-009**: no automated check has ever pinned the PDF-only or the 2 MB constraint. So the requirement exists in the story and has never been verified.

- **Actual Behavior:** The document field imposes no declared file-type restriction, and an agency record holds a `.png` as its uploaded document.

- **Steps to Reproduce:**
  1. Authenticate to `http://192.168.1.70` as an Admin-capable account.
  2. Navigate Admin → Agency → Agency; open any agency via the pencil icon (observed at `/admin/agency/edit/949`).
  3. Scroll to the **Upload Document** section.
  4. Observe the attached file name rendered beneath `Upload document *`.
  5. Inspect the two file inputs' declared accepted types (the logo input restricts to images; the document input declares nothing).

- **Investigation/Recovery Result:** Not applicable — no Investigation & Recovery Engine failure category matched (§5.7); nothing failed. The `accept` attribute reading and the attached filename were each observed once and are static page state, not transient behaviour, so repetition would add nothing.

- **Investigation Notes:** **The decisive test was deliberately not run.** Uploading `AgencyContract_wrongformat.txt` or `AgencyContract_fake_extension.pdf` (both prepared as fixtures for this run) and submitting would establish whether the server rejects a non-PDF — but submitting means saving a live agency record on shared staging, and this stage does not draw on the run's Agency-mutation authorization (Project Context §5). That test belongs to Stage 4M under a designed case with a recorded pre-edit state. Consequently this Finding claims only what was observed: no client-side restriction, and a PNG present. It does **not** claim the product accepts non-PDF uploads. Similarly untested: whether the `Add` button genuinely adds a second document row, whether an attached document can be removed or replaced (AC-3's last behavioural rule), and whether the 2 MB logo limit is enforced — all three require file selection and a save. **Provenance of the attached PNG is unknown and is the reason Confidence is 90% rather than higher:** it may have been uploaded through this form, seeded directly into the database, or created before any format restriction was introduced. Its filename (`screen-1-logo-black-and-white.png`) reads like a logo asset, raising the further possibility that it was attached to the wrong field by a previous tester.

- **Root Cause Hypothesis:** The PDF-only rule may **never have been implemented**, being story-side specification that PRD §10 already flags as unverified by automation (ASM-009); the differing `accept` attributes suggest the logo field's restriction was added deliberately while the document field's was not. An alternative, equally consistent reading is that server-side validation *does* exist and the PNG predates it or bypassed it via direct data seeding on this shared environment. **Confidence in this hypothesis: 50%** — deliberately low, because the two readings are not distinguishable without either an upload attempt or a look at the server. *Unknowns:* whether server-side type validation exists; how the PNG came to be attached; whether any consumer of these documents requires PDF specifically.

- **Occurrence Count:** 1

- **Evidence Links:**
  - `upload_document_section.png` — the Upload Document section with the attached `.png` filename, the Contract Start/End Date fields, and the `Add` button
  - `file_input_accept_attributes.txt` — both file inputs' declared `accept` values and `multiple` flags, plus the rendered document-section text
  - **Not captured:** an upload attempt and its result — deliberately, as it requires a save (see Investigation Notes). Console log — the session produced zero console output.

- **Recommendation:** Stage 4M should execute the format-negative cases first among AC-3's criteria, using the prepared fixtures — `AgencyContract_wrongformat.txt` for the obvious case and `AgencyContract_fake_extension.pdf` (a `.pdf` filename with plain-text bytes and no `%PDF` header) to distinguish extension-based from content-based validation. That second case is worth reporting on regardless of what AC-3 says, since extension-only validation is a materially weaker control than the story implies. Separately, ask the product owner whether the existing PNG on this agency should be treated as invalid data to clean up, and confirm whether AC-3's "multiple documents" is satisfied by the `Add` button pattern.
