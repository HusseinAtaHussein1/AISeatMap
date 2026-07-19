# NDC — Project Context — E-Ticket Agency Branding (WT1-T2919)

**Run:** RUN-20260718-001 · **Status:** `Pending` (checkpoint open per `pipeline/pipeline.md` §5.3 — awaiting Human Review) · **Produced by:** Project Context Agent (Stage 1) · **Date:** 2026-07-18
**Run Scope:** Type = User Story · Source = Pasted text — WT1-T2919 "E-Ticket Template Modification – Agency Branding On/Off Feature."

> **Track B — a separate, unrelated scope from `NDC_ProjectContext_Agency.md`.** Per the user-confirmed track split (2026-07-18), this document does not extend or depend on the Agency CRUD Project Context beyond one shared data point: the new **Agency Type** field this User Story adds to the Agency CRUD screen. Every other testable behavior here belongs to the **E-Ticket Page** and **Booking Confirmation Page** — screens outside the Agency module entirely.
>
> **Single living document, not a version sequence** — consistent with the naming pattern adopted for `NDC_ProjectContext_Agency.md` the same session. Moves to `projects/NDC/workspace/context/NDC_ProjectContext_ETicketBranding.md` once approved.

---

## 1. Scope Summary

As an Admin, the Agency CRUD screen (Create/Edit) gains one new field — **Agency Type** (B2B / Freelance), a radio button, stored and retrievable per Agency. Once configured, two downstream, customer-facing rendering surfaces change conditionally based on that Agency Type: the **E-Ticket Page** and the **Booking Confirmation Page**. Freelance-type Agencies get a reduced/de-branded presentation (no Agency name/contact/branding, no booking reference, no Trip ID, a distinct header/title treatment, a small "Flywt.com" credit); B2B-type Agencies retain the existing full presentation. A background image asset change and edge-case guarantees (default behavior for unconfigured Agencies, no impact to already-issued tickets) round out the scope.

This is a genuinely different testable surface from Agency CRUD (Create/Search/Update/Actions, `NDC_ProjectContext_Agency.md`) — only the new Agency Type *field* lives on that screen; everything the field actually *does* happens on the E-Ticket/Booking Confirmation screens.

## 2. Modules In Scope

### 2.1 Agency Type Configuration (Agency CRUD screen)

| Req. ID | Field / Behavior | Notes |
|---|---|---|
| FR-ETB-AGTYPE-01 | A new radio button field, **Agency Type** (B2B / Freelance), is added to the Agency CRUD screen. | Present on both Create and Update Agency (per WT1-T2919's own "How to Initiate": "Admin creates or edits an agency... Admin selects the Agency Type"). |
| FR-ETB-AGTYPE-02 | The selected Agency Type is stored and retrievable. | No Mandatory/Optional status is stated by this AC — see §6 #1. |

### 2.2 E-Ticket Page — Dynamic Agency Details & Layout

| Req. ID | Behavior |
|---|---|
| FR-ETB-ETICKET-01 | The agency details section on the E-Ticket is dynamically rendered based on the configured Agency Type and the agency-level flag/settings. |
| FR-ETB-ETICKET-02 | If the configuration indicates hiding agency details (i.e., Freelance): Agency name, contact, and branding do **not** appear on the E-Ticket. |
| FR-ETB-ETICKET-03 | The header above the flight details section is removed when the Freelance flag is selected. |
| FR-ETB-ETICKET-04 | The E-Ticket displays the fixed Title: **"Online Booking Confirmation."** |
| FR-ETB-ETICKET-05 | The E-Ticket displays the fixed Subtitle: **"Your flight is confirmed. Have a nice flight."** |
| FR-ETB-ETICKET-06 | The flight details section appears immediately after the title content. |
| FR-ETB-ETICKET-07 | The ticket number is displayed as the primary (first) value on the E-Ticket, in **all** cases (both B2B and Freelance). |
| FR-ETB-ETICKET-08 | The booking reference is removed on the E-Ticket for Freelance agencies. |
| FR-ETB-ETICKET-09 | The current background image is replaced with a new image. |
| FR-ETB-ETICKET-10 | For Freelance tickets, "Flywt.com" is displayed as small-font text. |

### 2.3 Booking Confirmation Page

| Req. ID | Behavior |
|---|---|
| FR-ETB-BOOKCONF-01 | The ticket number is displayed as the first value in its section, in all cases (both B2B and Freelance). |
| FR-ETB-BOOKCONF-02 | The booking reference is removed for Freelance agencies. |
| FR-ETB-BOOKCONF-03 | The Trip ID is removed for Freelance agencies. |

### 2.4 Edge Cases

| Req. ID | Behavior |
|---|---|
| FR-ETB-EDGE-01 | If Agency Type is not configured, default (existing) behavior applies. |
| FR-ETB-EDGE-02 | Existing, already-issued tickets are not impacted by this change. |

### 2.5 Design Notes

| Req. ID | Behavior |
|---|---|
| FR-ETB-DESIGN-01 | The same attached design is used for both Freelance and normal (B2B) agencies; the only differences are: Logo, Agency information (B2B only), and Booking date (present for both, per the Design Notes' own wording — a distinct statement from the Booking Confirmation Page's Trip ID/booking reference removal above). |

### 2.6 Dependencies

| Req. ID | Dependency |
|---|---|
| BR-ETB-01 | Agency CRUD Screen — Agency Type must be configurable there before any downstream rendering behavior applies. |

## 3. Modules Out of Scope

- **Agency CRUD's own field-level validation** (Create/Search/Update/Actions) — governed entirely by `NDC_ProjectContext_Agency.md`; this document only adds the one new Agency Type field to that screen and does not restate or re-test its existing fields.
- **Any other Booking Module screen** not named by this User Story (e.g., the booking search/itinerary flow itself, payment processing) — only the E-Ticket Page and Booking Confirmation Page are in scope.
- **Rule Engine Module (Discount, Markups)** — not mentioned by this User Story at all (unlike Agency Actions', which explicitly names it in Reflection); not in scope here.

## 4. Roles & Credentials Required

- **Admin** — configures Agency Type on the Agency CRUD screen (per WT1-T2919's own Actor: "Admin (Create, Edit, Approve Agency)").
- **A booking/end user** — views or downloads the issued E-Ticket (per "How to Initiate": "User views or downloads the issued E-Ticket"). No specific end-user credential is named or available in `run_configuration.md`; treat as a Coverage Gap if end-to-end (Admin configures → user views) testing is later required — see §6 #4.

## 5. Environment Constraints

This document governs Stage 1 (Project Context) and Stage 3 (Test Design) only. No mutation authorization is needed yet, and none is assumed from any prior run.

## 6. Carried-Forward Assumptions & Risks

| # | Item | Status |
|---|---|---|
| 1 | **Agency Type's Mandatory/Optional status is not stated.** Every other Agency CRUD field states this explicitly (per `NDC_ProjectContext_Agency.md`); this AC does not. | Test Design should design a case probing whether submission is blocked when Agency Type is left unselected, without assuming an answer — log as a Coverage Gap if genuinely ambiguous once observed. |
| 2 | **Whether the Title/Subtitle (FR-ETB-ETICKET-04/05) and flight-details-immediately-after-title (FR-ETB-ETICKET-06) apply only to Freelance tickets, or to all tickets, is not explicitly stated.** These three bullets appear directly after the Freelance-specific header-removal bullet, with no explicit "in this case" qualifier repeated — a genuinely ambiguous business rule. | Design the case against the more literal, narrower reading (Freelance-only, since it's listed in sequence with the other Freelance-specific bullets) and log the ambiguity as a Coverage Gap for confirmation, per `agents/test_design_agent.md` §19 Ambiguous Business Rules. |
| 3 | **B2B's own retained behavior is never explicitly stated** — the AC only states what changes *for Freelance* (header removed, agency details hidden, booking reference/Trip ID removed, "Flywt.com" shown). B2B's continuation of the existing/current behavior is an inference, not a direct AC statement. | Design B2B test cases as the inverse/contrast case, explicitly noting they assert *inferred continuity*, not a directly stated requirement. |
| 4 | **No end-user credential is available** to test the full "Admin configures → user views the issued E-Ticket" loop end-to-end via a real second session; this project's `run_configuration.md` lists only Admin/Agency/Agent (Admin-tier) credentials. | Design test cases assuming the E-Ticket/Booking Confirmation Page can be reached via the same Admin session (e.g., a preview/reissue action) or flag as a Coverage Gap requiring a dedicated end-user credential once Discovery clarifies how these pages are actually reached. |
| 5 | **Background image replacement (FR-ETB-ETICKET-09) depends on an asset "to be provided from your side"** — i.e., supplied by the business, not yet delivered as of this Project Context. | Cannot be designed as a fixed-assertion test case until the actual replacement image is supplied; recorded as a blocked/Exploratory item, not silently skipped. |
| 6 | **This entire feature has never been observed in any prior Discovery run** — no E-Ticket or Booking Confirmation Page discovery exists in this project at all (prior Discovery only reached Admin CRUD screens: Branch, Agency, Staff, Login). | Every test case's Discovery Reference will be "Not independently verified in Discovery." |

## 7. Traceability Anchor

| Item above | Source |
|---|---|
| §2.1–§2.6 (all requirements) | WT1-T2919, pasted text, 2026-07-18 |
| §6 #4 (end-user credential gap) | `projects/NDC/run_configuration.md`, Credentials Available table |
| §6 #6 (no prior Discovery) | Cross-checked against `projects/NDC/runs/*/discovery/` — no E-Ticket/Booking Confirmation artifacts exist |

---

*Per `pipeline/pipeline.md` §5.1, this artifact requires Human Review before Stage 3 formally clears its own checkpoint.*
