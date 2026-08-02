# Discovery Snapshot — Agency Create Form

| Field | Value |
|---|---|
| Module | `agency` |
| Produced by run | `run-001__2026-07-31_11-56-38__UserStory__US-4222UpdateAgency` |
| Revision | 1 |
| Screen / State | Add Agency — empty form |
| URL / Route | `http://192.168.1.70/admin/agency/add` |
| Discovery Mode | Browser automation — **Browser Driver**, headless |
| Evidence Category | Direct Observation |
| Captured | 2026-07-31 14:07 (local) |
| Role / Credential used | Super Admin (`odeysysadmin` — role only) |

## 1. Purpose

**This screen is out of scope for this run, and it was read anyway for one specific reason.** US-4222 is an *update* story; agency creation is a different flow and a different story (Project Context §3). It was opened solely as a **control surface** for two absence claims: AC-9's PCC section and AC-5's `Designation` field are missing from the update form, and "absent from the flow under test" and "absent from the product" are very different findings with very different consequences. Reading this form is what distinguishes them — asserting either without checking both would have been a guess.

No creation was attempted. The form was opened, scrolled, read, and left.

## 2. Entry Points

| From | Action | Result |
|---|---|---|
| Agency list (`/admin/agency`) | Click `Add agency` | Navigates to `/admin/agency/add` with an empty form |

## 3. Structure

The create form carries the **same nine sections** as the update form, in the same order, with one difference:

| Region / Section | Present on create? | Present on update? |
|---|---|---|
| Agency Master (untitled) | yes | yes |
| Agency Owner Details | yes | yes |
| Upload Document | yes | yes |
| Agency Logo | yes | yes |
| Wonder Travel Sales Contact | yes | yes |
| Bank Account Details | yes | yes |
| Payment settings | yes | yes |
| Product Access Details | yes | yes |
| Agency Features | yes | yes |
| **Remarks** | **no** | **yes (mandatory)** |
| Airline Supplier Credential (PCC) — AC-9 | **no** | **no** |

## 4. Interactive Elements

**Not inventoried, deliberately.** This screen is out of scope (§1) and was read only for the two absence checks. Cataloguing its controls would be work on a flow this run does not test, and would invite a later reader to treat unverified create-form detail as though it had been assessed. The update form's inventory is in `AgencyUpdateForm.md` §4.

No locator values are recorded here either, per `pipeline.md` §3.5.

## 5. Observed Validation & Business Rules

| Field / Action | Observed Behaviour | Trigger | Finding ID (if raised) |
|---|---|---|---|
| *(none)* | No validation behaviour was exercised on this screen | — | — |

The form was read in its empty state only. No field was filled, cleared, or blurred, and nothing was submitted.

## 6. States Observed

| State | How Reached | What Differs |
|---|---|---|
| Empty / initial | Click `Add agency` from the list | All fields blank; the Remarks section is absent |

## 7. System Responses

| Type | Observation |
|---|---|
| Network | No responses with status ≥ 400 while loading or reading this screen |
| Console | Clean — 0 messages |
| Redirect | None |

## 8. Evidence Captured

| Evidence | Path |
|---|---|
| Complete rendered text of the create form (the basis of the term-presence comparison) | *scratchpad only — see §9* |
| Session console + network summary | `evidence/session_console.log`, `evidence/session_network_summary.txt` |

The **term-presence comparison table** that this screen exists to support — every AC-9 term, plus `Designation`, checked against both forms — is recorded in full in `findings/FINDING-002_MissingPccSection/metadata.md` and `findings/FINDING-006_MissingDesignationField/metadata.md`, where the claims it supports actually live.

## 9. Not Captured

| Missing Item | Reason |
|---|---|
| Full control inventory | Deliberately — out of scope (§1, §4) |
| Full-page screenshot | Captured during the run but held in the session scratchpad rather than promoted into this module workspace. It documents an out-of-scope screen, and `pipeline.md` §11.2 keeps scaffolding out of durable artifacts; the two absence claims it supported are evidenced by the term-presence tables in the Findings that make them |
| Rendered-text dump of this form | Same reason — held in the scratchpad, its conclusions carried into FINDING-002 and FINDING-006 |
| Selector / locator catalogue | Deliberately out of scope — `pipeline.md` §3.5 |
| Any validation or submission behaviour | Nothing was filled or submitted; creation is not in this run's scope |

## 10. Findings Raised From This Screen

| Finding ID | Category | Severity |
|---|---|---|
| FINDING-002 | Requirement Gap | N/A |
| FINDING-006 | Requirement Gap | N/A |

Both Findings were **observed on the update form and corroborated here.** This screen's contribution is what raises each one's confidence from "missing where we looked" to "missing from both agency forms" — and, equally, what stops either from being overstated as "missing from the product", since a capability could still exist on a screen neither form exposes.
