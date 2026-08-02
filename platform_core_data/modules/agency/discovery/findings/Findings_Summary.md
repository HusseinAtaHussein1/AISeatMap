# Findings Summary — `agency`

| Field | Value |
|---|---|
| Module | `agency` |
| Run Folder | `run-001__2026-07-31_11-56-38__UserStory__US-4222UpdateAgency` |
| Total Findings | 7 |
| Generated | 2026-07-31 14:20 |

## Index

| ID | Title | Category | **Requirement Disposition** | Severity | Confidence | Status | Occurrences | Module | Description (one line) |
|---|---|---|---|---|---|---|---|---|---|
| FINDING-001 | Mandatory-field violations render `Required`, not US-4222's per-field messages | Requirement Gap | **Story Outdated — PRD-corroborated** *(row 1)* | N/A | 95% | Needs Human Review | 4 | `agency` | Four mandatory fields all rendered `Required`; the story specifies a distinct message for each of ~20 fields. |
| FINDING-002 | AC-9's entire Airline Supplier Credential (PCC) section absent from both forms | Requirement Gap | **Possible Application Defect / Possible Removed Feature** *(row 3 — NOT story-outdated)* | N/A | 90% | Needs Human Review | 1 | `agency` | Neither the update nor the create form contains the PCC section or any of its five named fields. |
| FINDING-003 | Mandatory Payment option control offers 28 choices, 23 of them person names or single letters | Observation | Not a requirement mismatch — environment / data quality | N/A | 98% | Needs Human Review | 2 | `agency` | Cash/Wallet/Credit Card/BANQUE MISR/Fawry followed by 21 given names plus `m` and `f`. |
| FINDING-004 | Document upload applies no file-type restriction; a `.png` is attached where AC-3 requires PDF | Observation | **Application Defect (candidate)** *(row 5)* | N/A | 90% | Needs Human Review | 1 | `agency` | The logo input restricts to `image/*`; the document input declares no `accept` at all. |
| FINDING-005 | Seven undocumented fields on the update form — later enhancements, two mandatory | Requirement Gap | **Story Outdated / Requires Business Confirmation** — `Outstanding Threshold` **Confirmed** *(row 4)*, `Remarks` **PRD-corroborated** *(row 1)*, other five *(row 2)* | N/A | 95% | Needs Human Review | 1 | `agency` | `Outstanding Threshold *` and `Remarks *` are mandatory and absent from US-4222 — both legitimate later functionality. |
| FINDING-006 | AC-5's `Designation` dropdown absent from the Sales Contact section on both forms | Requirement Gap | **Story Outdated / Requires Business Confirmation** *(row 2)* | N/A | 90% | Needs Human Review | 1 | `agency` | The section renders Name, Email ID, Phone Number and `Add` — no Designation control. |
| FINDING-007 | Segregation of duties unassessable — one identity, which sees Approve and Reject on the edit form | Test Gap | Not a requirement mismatch — coverage limitation *(the `Send For Approval` label difference is row 1)* | N/A | 95% | Needs Human Review | 1 | `agency` | Only `odeysysadmin` (Super Admin) is configured, so maker-vs-checker cannot be separated. |

### Requirement Disposition — what the column means

Added 2026-07-31 by user directive. **US-4222 is relatively old and the application has evolved since it was authored**, so the running application is now the primary reference *where the story is clearly outdated*. Every mismatch is still recorded as a Finding and stays fully traceable; what the directive changes is the disposition, never whether it is reported.

The taxonomy and the discriminator that assigns it live in `../context/ProjectContext.md` §1.1. In short: when the application and the story disagree, **the PRD decides** — corroborating the application means the story is outdated (row 1), silence means treat the application as the reference pending confirmation (row 2), and **corroborating the story means the opposite: escalate as a possible removed feature (row 3)**, never auto-disposition it as outdated.

**Disposition summary:**

| Disposition | Findings | Meaning for Stage 3 |
|---|---|---|
| `Story Outdated — PRD-corroborated` (row 1) | FINDING-001, plus `Remarks` in 005 and the `Send For Approval` label in 007 | Design to observed behaviour. Settled |
| `Story Outdated — Confirmed` (row 4) | `Outstanding Threshold` in FINDING-005 | Design to observed behaviour. Settled by the product owner |
| `Story Outdated / Requires Business Confirmation` (row 2) | FINDING-006, plus five fields in FINDING-005 | Design to observed behaviour, labelled as resting on the directive |
| **`Possible Application Defect / Possible Removed Feature`** (row 3) | **FINDING-002** | **Do not design to observed behaviour. Blocked on DOQ-02** |
| `Application Defect (candidate)` (row 5) | FINDING-004 | Design to the requirement; let execution report the outcome |
| Not a requirement mismatch | FINDING-003, FINDING-007 | Unaffected by the directive |

**Two of the seven are not "story outdated", and that is the point of the discriminator.** FINDING-002 and FINDING-004 both describe the application falling short of something no source superseded — a section two `[V]`-tagged PRD requirements describe, and a data-integrity rule on contract documents. Dispositioning either as outdated specification would convert a possible regression into a documentation correction.

## Breakdown

**By Severity:** 0 Critical · 0 High · 0 Medium · 0 Low · 7 N/A

**By Category:** 4 Requirement Gap · 2 Observation · 1 Test Gap

**By Status:** 0 Confirmed · 7 Needs Human Review · 0 Duplicate · 0 Rejected

**By Module:** `agency` 7

**Note on the severity and status distribution — this is a deliberate outcome, not an omission.** No Finding is `Confirmed` and none carries a Critical/High/Medium/Low severity, and the reason is structural rather than a judgment that nothing serious was found. Every Finding in this run is a disagreement between two requirement sources, or a limitation of this run's own coverage — not an application misbehaving against a settled requirement. §5.4 assigns `N/A` automatically to `Requirement Gap`, `Observation` and `Test Gap`, and §5.6 reserves `Confirmed` for observations that contradict a *clearly documented* requirement with no plausible alternative explanation. Here the Project Context deliberately carries **both** sides of each conflict forward (US-4222 as authoritative, the PRD's `[V]`/`[O]`/`[I]` tags alongside it), so "which source is right" is a human decision this stage is required not to make. The impact of each Finding is stated in its **Business Risk** field, which is where the weight of FINDING-001 and FINDING-005 in particular is recorded — both of them materially affect what Stage 3 can design.

## Evidence Packages

| Finding ID | Evidence Package | Evidence Files |
|---|---|---|
| FINDING-001 | `findings/FINDING-001_ValidationMessageMismatch/` | 4 (metadata + 2 screenshots + observed messages) |
| FINDING-002 | `findings/FINDING-002_MissingPccSection/` | 4 (metadata + 2 screenshots + full section inventory) |
| FINDING-003 | `findings/FINDING-003_PaymentOptionDataPollution/` | 3 (metadata + screenshot + rendered option list) |
| FINDING-004 | `findings/FINDING-004_NonPdfDocumentAttached/` | 3 (metadata + screenshot + file-input accept attributes) |
| FINDING-005 | `findings/FINDING-005_UndocumentedMandatoryFields/` | 4 (metadata + 2 screenshots + app-marked mandatory list) |
| FINDING-006 | `findings/FINDING-006_MissingDesignationField/` | 2 (metadata + screenshot) |
| FINDING-007 | `findings/FINDING-007_ApprovalControlsOnMakerForm/` | 3 (metadata + screenshot + button inventory) |

**Shared evidence** referenced by several Findings is held once under `../evidence/` rather than copied into each package: `agency_update_form_fullpage.png`, `agency_list.png`, `session_console.log`, `session_network_summary.txt`.
