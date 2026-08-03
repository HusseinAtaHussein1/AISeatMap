# QA Assessment Report — run-002__2026-08-03_10-26-17__UserStory__US-8605CreateBranch

| Field | Value |
|---|---|
| Module | `branch` |
| Produced by run | `run-002__2026-08-03_10-26-17__UserStory__US-8605CreateBranch` |
| Revision | 2 |
| Project Context validated against | `modules/branch/context/ProjectContext.md` (revision 2) |
| Discovery Mode(s) used | Browser automation — Browser Driver |
| Generated | 2026-08-03 |
| Status | Pending Review |

## 1. Scope

Run Scope Type: **User Story** (US 8605 — [Admin] Create Branch). Run Type: **User Story**. This run validated the live NDC Admin application against `modules/branch/context/ProjectContext.md` revision 2 (the revision that closed the credential/mutation-authorization run-configuration gaps). Per the Explorer skill's User Story strategy (§16), exploration was narrowed strictly to what's needed to reach and verify the Create Branch screen's acceptance criteria — no broad sweep of the wider Branch or Admin module was attempted.

## 2. Objectives

Verify the live Create Branch screen (`/admin/branch/add`) against every acceptance criterion in US 8605, with specific, explicit attention to the six carried-forward Assumptions/Risks in `ProjectContext.md` §6: unstated validation messages (ASM-BR-1), unverified free-text character rules (ASM-BR-2), Post Office Box/Credit Limit boundary lengths (RISK-BR-1), the Warning Prompt < Credit Terms and Reaching Percentage ≤ 100% cross-field rules (RISK-BR-2), and the PCC-fields-removed-from-UI claim (RISK-BR-3).

## 3. Evidence Sources

| Discovery Mode | In-Scope Areas Covered | Why This Mode |
|---|---|---|
| Browser automation — Browser Driver | Dashboard→Admin navigation, Search Branch waypoint, full Create Branch screen (all 7 field groups) | Per Explorer skill §8.1/§1.2 of `mcp/README.md`: the Browser Driver is the default mode for any authenticated flow, and it authenticates automatically without ever exposing the Super Admin credential to a tool call. Playwright MCP was not needed — the Browser Driver, once `playwright` was installed (see §11 Gaps), handled both first-contact exploration and boundary-condition probing in one session type, so no fallback to MCP or any lower-priority mode was required this run. |

## 4. Modules Explored

| Module | Route(s) | Purpose | Discovery Mode |
|---|---|---|---|
| branch | `/admin/branch`, `/admin/branch/add` | Branch creation and (unexplored this run) Branch search | Browser automation — Browser Driver |

**Shared UI components:** top `p-tabview` tab navigation; left collapsible Admin nav (Company/Branch/Agency/Staff); country-code phone input; masked password input with show/hide toggle.

## 5. Observed Behaviour

| Module | Workflow / Rule | What Was Observed | Evidence Category | Finding ID(s) |
|---|---|---|---|---|
| branch | Post Office Box length | Accepts 12 alphanumeric characters with no truncation/error, vs. AC's 8-char max | Direct Observation | FINDING-002 |
| branch | Credit Limit numeric-only rule | Correctly rejects alphanumeric input with an inline error message on blur | Direct Observation | (confirms AC — see §6) |
| branch | Credit Limit length | Accepts 16 numeric digits with no truncation/error, vs. AC's 15-char max | Direct Observation | FINDING-003 |
| branch | Reaching Percentage ≤100% rule | Correctly rejects 150.1234% with an inline error message on blur | Direct Observation | (confirms AC — see §6) |
| branch | Warning Prompt(Days) length | Accepts 14 digits with no truncation/error, vs. AC's 11-digit max | Direct Observation | FINDING-004 |
| branch | Payment Option checkbox contents | Contains ~25 entries unrelated to payment methods alongside the 5 expected ones | Direct Observation | FINDING-001 |
| branch | Credit Card → Payment Gateway conditional field | Dropdown never appears after checking Credit Card | Direct Observation | FINDING-007 |
| branch | Import PNR default state | Renders unchecked on a fresh form | Direct Observation | FINDING-005 |
| branch | Flight product-access control | Checked by default but enabled (not disabled) | Direct Observation | FINDING-006 |
| branch | Search Supplier Credentials PCC / Ticketing Supplier Credential PCC UI presence | Both confirmed absent from the rendered page | Direct Observation | (confirms AC — see §6) |
| branch | PAN Number field presence | Absent from the rendered page | Direct Observation | FINDING-008 |
| branch | Department control presence | Absent from the rendered page | Direct Observation | FINDING-009 |
| branch | Outstanding Threshold field | An undocumented Mandatory field, default "5", present | Direct Observation | FINDING-010 |
| branch | Submit button label | Reads "Send For Approval" | Direct Observation | FINDING-011 |

## 6. Confirmed Behaviour

| Requirement (Project Context §) | Confirmed Behaviour | Evidence Category | Finding ID(s) |
|---|---|---|---|
| §2 Branch Details — "system shall automatically set the brand as NDC (backend configuration, no dropdown on UI)" | No Brand field/dropdown appears anywhere on the Create Branch form | Direct Observation | None (matches AC) |
| §2 Product Access Details — "Search Supplier Credentials PCC & Ticketing Supplier Credential PCC shall be removed from UI" | Confirmed absent via full-page text search | Direct Observation | None — resolves RISK-BR-3 (Confirmed, refutes the risk) |
| §2 Branch Sales Configuration — "Reaching Percentage ... must not be greater than 100%" | Confirmed enforced: entering 150.1234 triggers "Reaching Percentage should not be greater than 100%" on blur | Direct Observation | None — resolves half of RISK-BR-2 (Confirmed for the percentage cap) |
| §2 Branch Sales Configuration — "Warning Prompt (Days) ... should be less than Credit Terms (Days)" | **Added 2026-08-03 (module owner review):** Confirmed enforced — Credit Terms(Days)=10000 with Warning Prompt(Days)=151515 triggers "Warning prompt days should not be greater than credit terms days" on blur (boundary is strictly-greater-than; equal values are not rejected) | Human Observation (module-owner-supplied screenshot) | None — resolves the other half of RISK-BR-2 (Confirmed for the cross-field rule); closes OQ-BR-2 |
| §2 Branch Sales Configuration — "Credit Limit (numeric input only)" | Confirmed enforced: alphanumeric input triggers an inline numeric-validation error on blur | Direct Observation | None — the numeric-only rule itself holds; only its length cap does not (FINDING-003) |
| §2 Country field — "auto-filled based on selected Operating Country" | Country field renders read-only/greyed, consistent with an auto-fill design (cascade itself not exercised — no Operating Country was selected this run) | Direct Observation | None (partial — see §8 Open Questions) |

**Added 2026-08-03 after module-owner review** — these were originally raised as candidate Bugs/Gaps in §11 Gaps but are now Confirmed Behaviour per human clarification (see each Finding's Human Review Update):

| Requirement (Project Context §) | Confirmed Behaviour | Evidence Category | Finding ID(s) |
|---|---|---|---|
| Payment Option checkbox contents | Confirmed intended: the list reflects the Payment Gateway module's Active records live, by design (same pattern as the Supplier Credentials cascade) | Direct Observation + Human Observation | FINDING-001 |
| Import PNR default state | Confirmed intended: unchecked-by-default is current, correct behavior; US 8605's "always checked" wording is outdated | Direct Observation + Human Observation | FINDING-005 |
| Flight product-access control editability | Confirmed as an Outdated Requirement disposition (US 8605 predates current behavior), not a defect | Direct Observation + Human Observation | FINDING-006 |
| Credit Card → Payment Gateway conditional field | Confirmed as an Outdated Requirement disposition (US 8605 predates current behavior), not a defect | Direct Observation + Human Observation | FINDING-007 |

**Added 2026-08-03, second review pass:**

| Requirement (Project Context §) | Confirmed Behaviour | Evidence Category | Finding ID(s) |
|---|---|---|---|
| Outstanding Threshold field (PRD_UserStories.md User Story 6 / US 51489 §2 Branch Module) | Confirmed match: the module owner established "Outstanding Threshold" (live label) = "Child Agencies Threshold Amount" (US 51489 §2) as the same feature. Disposition: **Expected Implementation / Requirement Traceability** — this field is now fully traced to its authoritative requirement and is not an application defect. | Direct Observation + Human Observation | FINDING-010 |

## 7. Assumptions

| ID | Assumption | Why Inferred (not observed) | Evidence Category |
|---|---|---|---|
| ASM-BR-1 (carried forward) | Exact validation-message wording for fields not explicitly quoted in US 8605 (e.g. Post Office Box, Warning Prompt) may differ from what a future build shows, since the AC never states literal message text | Only the messages actually observed this run (Credit Limit's numeric message, Reaching Percentage's cap message) can be cited as fact; message text for untested fields remains unobserved | Assumption |
| ASM-BR-2 (carried forward) | Address 1/Address 2 "free text, all character input" is assumed to mean no character-set restriction, but this run did not type unicode/emoji/special characters into those fields to confirm | Not directly tested this run — deprioritized within the User Story-scoped strategy in favor of the numeric/length boundary checks that produced FINDING-002 through FINDING-004 | Assumption |
| ASM-BR-3 (new) | The "2 decimal places allowed" wording in Credit Limit's validation message may be an undocumented, real business rule rather than a bug, since US 8605 is silent on decimal precision for that field | Inferred from the message text alone; not confirmed with Product/Business | Assumption |

## 8. Open Questions

| ID | Open Question | What Would Resolve It | Project Context Ref |
|---|---|---|---|
| OQ-BR-1 | Does the Operating Country → Country/State/City cascade actually populate correctly, and does Country truly auto-fill from a real Operating Country selection? | A follow-up pass selecting a real Operating Country value and observing the resulting Country/State/City behavior | ProjectContext.md §2, §3.1 |
| OQ-BR-2 | ~~Is Warning Prompt(Days) actually validated as "less than Credit Terms (Days)" once both fields are populated?~~ — **Resolved 2026-08-03.** Module-owner-supplied screenshot (Credit Terms=10000, Warning Prompt=151515) confirms the cross-field rule fires with message "Warning prompt days should not be greater than credit terms days." | Resolved — see §6 Confirmed Behaviour addendum | ProjectContext.md §6 RISK-BR-2; FINDING-004 |
| OQ-BR-3 | Is Import PNR forced on server-side regardless of the checkbox's visually unchecked default, or is the checkbox genuinely the only control and it is truly off by default? | Submitting a Branch with Import PNR left unchecked and inspecting the resulting record (requires this run's Branch-record mutation authorization) | FINDING-005 |
| OQ-BR-4 | Does a real, mouse-driven click on Credit Card (as opposed to this run's dispatched DOM click) surface the Payment Gateway dropdown? | Re-test with `page.click()` / an MCP `browser_click`-equivalent on the actual checkbox element | FINDING-007 |
| OQ-BR-5 | What does the GDS-conditional Supplier Credentials sub-grid actually look like, and does it match the AC (Generic Supplier Credentials PCC multi-select, Manager Name, Supplier Credentials Description)? | Check a GDS-type supplier row in the Product Access grid and observe the resulting sub-grid | Coverage_Summary.md §5 Blocked Areas |
| OQ-BR-6 | What does Submit for Approval actually do server-side (validation errors surfaced, record state created)? | A dedicated Test Design case exercising the full happy-path submission, under this run's Branch-mutation authorization | FINDING-011; run_configuration.md mutation override |

## 9. Discovered Risks

| ID | Risk | Business Risk | Technical Risk | Finding ID(s) |
|---|---|---|---|---|
| RISK-BR-DISC-1 | Multiple Mandatory numeric fields (Post Office Box, Credit Limit, Warning Prompt) have no client-side max-length enforcement | Branch records could be created with data far outside documented business bounds, risking downstream inconsistency in credit-risk calculations and correspondence formatting | If server-side validation mirrors the client gap, oversized values could reach the database with unknown effect on dependent calculations/reports | FINDING-002, FINDING-003, FINDING-004 |

**Superseded 2026-08-03 (module-owner review, two passes):** RISK-BR-DISC-2 (Payment Option data source) and RISK-BR-DISC-3 (PAN Number/Department absence) were reclassified as, respectively, confirmed-intended cross-module behavior and explicitly-ignored gaps — see FINDING-001, FINDING-008, FINDING-009 Human Review Updates. RISK-BR-DISC-4 (Outstanding Threshold field-identity match) is now **resolved, not a standing risk** — the module owner confirmed the match on the second review pass; see FINDING-010 and RISK-BR-4 in `ProjectContext.md` §6. All four are retained here as a record of what this run originally flagged, not as standing risks.

## 10. Coverage

| Area / Module | Coverage Status | Discovery Mode | Notes |
|---|---|---|---|
| Branch Details | Covered | Browser automation | Cascade behavior (Operating Country → State/City) not exercised — see OQ-BR-1 |
| Branch Email Configuration | Covered | Browser automation | Presence confirmed; 15-char password max length not boundary-tested |
| Branch Contact Info | Covered | Browser automation | Department control absent (FINDING-009); multi-contact Add not exercised |
| Branch Sales Configuration | Covered | Browser automation | Full boundary-testing on Credit Limit, Reaching Percentage, Warning Prompt, Post Office Box (n/a — different section but same pass) |
| Product Access Details | Partial | Browser automation | Top-level checkboxes covered; GDS-conditional sub-grid blocked (no GDS supplier selected) |
| Import PNR | Covered | Browser automation | Default-state discrepancy found (FINDING-005) |
| Submit for Approval / Cancel | Partial | Browser automation | Labels read; neither button was clicked this run |

**Roll-up:** 5 Covered · 2 Partial · 0 Blocked · 0 Unreachable

## 11. Gaps

| ID | Gap Type | Description | Project Context Ref | Finding ID(s) |
|---|---|---|---|---|
| GAP-BR-7 | Contradicts | Post Office Box, Credit Limit, and Warning Prompt(Days) are documented with explicit max-length caps; none is enforced client-side | ProjectContext.md §2 | FINDING-002, FINDING-003, FINDING-004 |

**This run's only remaining open Gap is GAP-BR-7.** Every other Gap originally raised is now closed:

| Former ID | Disposition | Finding ID(s) |
|---|---|---|
| GAP-BR-1 (PAN Number absent) | Ignored per explicit module-owner direction | FINDING-008 |
| GAP-BR-2 (Department absent) | Ignored per explicit module-owner direction | FINDING-009 |
| GAP-BR-3 (Outstanding Threshold, undocumented) | **Resolved 2026-08-03 (second review pass):** traced to US 51489 §2 Branch Module ("Child Agencies Threshold Amount") as its authoritative requirement — Expected Implementation / Requirement Traceability, not a Gap | FINDING-010 |
| GAP-BR-4 (Flight editable) | Outdated Requirement, not a Gap needing resolution | FINDING-006 |
| GAP-BR-5 (Import PNR unchecked) | Confirmed intended feature, not a Gap | FINDING-005 |
| GAP-BR-6 (no Payment Gateway dropdown) | Outdated Requirement, not a Gap needing resolution | FINDING-007 |

## 12. Recommendations

| ID | Recommendation | Rationale | Finding ID(s) |
|---|---|---|---|
| REC-BR-1 | Add client-side `maxlength`/pattern validators (and confirm matching server-side limits) for Post Office Box, Credit Limit, and Warning Prompt(Days) | Closes a consistent class of unenforced-length defects found across three separate fields in one pass — the only Findings from this run still needing a development fix | FINDING-002, FINDING-003, FINDING-004 |
| REC-BR-5 (2026-08-03) | Update US 8605's wording for Payment Option (drop the implied fixed 5-value list), Import PNR (drop "always checked"), Flight/Product Access, and Credit Card→Payment Gateway to match confirmed current behavior; revise Branch Details/Contact Info to drop PAN Number and Department per module-owner direction | Prevents this same set of "Findings" from being re-raised on a future Discovery pass against an AC that no one intends to hold the application to anymore | FINDING-001, FINDING-005, FINDING-006, FINDING-007, FINDING-008, FINDING-009 |
| REC-BR-6 (2026-08-03, resolved) | ~~Confirm whether the live "Outstanding Threshold" field is US 51489's "Child Agencies Threshold Amount"~~ — **done.** Module owner confirmed the match; Test Design should write cases against US 51489 §2 and §4 (the confirmation-popup flow, not yet explored by Discovery) using US 51489 as the authoritative requirement | Closes what was this run's one remaining open Requirement Gap | FINDING-010 |

**Regression Test Candidates:** Post Office Box / Credit Limit / Warning Prompt length-boundary checks are the only Findings from this run still worth a regression test — the length caps remain unenforced defects pending a fix. FINDING-001/005/006/007 are now confirmed-intended behavior and belong in a standard functional regression suite (not a "bug regression" suite) once Test Design designs cases for them at all.

## 13. Inputs for Test Design

**Findings by ID** (updated 2026-08-03 after module-owner review — see each Finding's Human Review Update):

| Finding ID | Category | Status | Severity | Module |
|---|---|---|---|---|
| FINDING-001 | Observation | Rejected | N/A | branch |
| FINDING-002 | Bug | Confirmed | Medium | branch |
| FINDING-003 | Bug | Confirmed | Medium | branch |
| FINDING-004 | Bug | Confirmed | Medium | branch |
| FINDING-005 | Requirement Gap | Rejected | N/A | branch |
| FINDING-006 | Requirement Gap | Rejected | N/A | branch |
| FINDING-007 | Requirement Gap | Rejected | N/A | branch |
| FINDING-008 | Requirement Gap | Rejected | N/A | branch |
| FINDING-009 | Requirement Gap | Rejected | N/A | branch |
| FINDING-010 | Observation | Rejected | N/A | branch |
| FINDING-011 | Bug | Confirmed | Low | branch |

**Only FINDING-002, FINDING-003, FINDING-004, and FINDING-011 remain live defect candidates for Test Design.** Every other Finding — including FINDING-010, now fully resolved as Expected Implementation / Requirement Traceability to US 51489 §2 — is `Rejected`, a resolved non-issue for this run's purposes, per explicit module-owner review. None remain `Needs Human Review`. Rejected Findings are retained in the record for traceability, not as active input to test-case design — except FINDING-010, which Test Design should still use as the pointer to US 51489 §2/§4 as the authoritative source for the Outstanding Threshold field and its confirmation-popup flow.

**Assumption disposition:**

| Assumption ID | Disposition | Basis |
|---|---|---|
| ASM-BR-1 | Unresolved | Only two of several unstated validation messages were actually observed this run (Credit Limit numeric, Reaching Percentage cap); others remain unobserved |
| ASM-BR-2 | Unresolved | Address 1/2 character-set behavior not tested this run |
| ASM-BR-3 | Unresolved | Credit Limit's "2 decimal places allowed" message wording not independently confirmed as an intended business rule |
| RISK-BR-1 | Confirmed (as a real defect) | Post Office Box boundary directly tested and found unenforced — see FINDING-002; Credit Limit boundary also tested and found unenforced — see FINDING-003 |
| RISK-BR-2 | **Confirmed 2026-08-03 (both halves)** | Reaching Percentage ≤100% rule Confirmed enforced; Warning Prompt-not-greater-than-Credit Terms cross-field rule now also Confirmed enforced via module-owner-supplied evidence (message: "Warning prompt days should not be greater than credit terms days") — refutes the risk in full |
| RISK-BR-3 | Refuted (risk did not materialize) | PCC fields confirmed absent from UI, exactly as the AC states |
| RISK-BR-4 | **Resolved 2026-08-03 (second review pass)** | Module owner confirmed "Outstanding Threshold" = US 51489's "Child Agencies Threshold Amount" — see FINDING-010 |

**Requirement Gaps needing a coverage decision:** none remaining — every Gap this run raised is now closed (see §11). US 51489 §2 (the field) and §4 (the Branch Threshold Update confirmation-popup flow, not yet explored by Discovery) are ready for Test Design to trace directly, with FINDING-010 as the pointer.

**Closed, no longer needing a Test Design coverage decision (module-owner review, 2026-08-03):** GAP-BR-1 (PAN Number, ignored), GAP-BR-2 (Department, ignored), GAP-BR-3 (Outstanding Threshold, traced to US 51489 §2), GAP-BR-4 (Flight editability, outdated requirement), GAP-BR-5 (Import PNR default, confirmed feature), GAP-BR-6 (no Payment Gateway dropdown, outdated requirement) — see §11.

**Handoff confirmation:** Every input `test-design-skill/SKILL.md` §4 declares as needed is present: this Discovery Report (this file + `Timeline.md` + `Coverage_Summary.md`), the Findings Summary and every Finding's populated `metadata.md` (each with an Expected Behavior field citing a specific `PRD_UserStories.md` US 5/US 6 section or `ProjectContext.md` section), the Evidence Packages referenced above, and Regression Test Candidates (§12). No Finding in this run's set is missing an Expected Behavior citation, and each Finding's Status/Evidence Category combination is unambiguous for Test Design's disposition mapping (Confirmed → Regression candidate; Needs Human Review → pending-clarification candidate; Rejected → Documented exception, not carried into test-case design).
