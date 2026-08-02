# Discovery Snapshot — Agency List

| Field | Value |
|---|---|
| Module | `agency` |
| Produced by run | `run-001__2026-07-31_11-56-38__UserStory__US-4222UpdateAgency` |
| Revision | 1 |
| Screen / State | Agency list — populated grid, unfiltered |
| URL / Route | `http://192.168.1.70/admin/agency` |
| Discovery Mode | Browser automation — **Browser Driver**, headless |
| Evidence Category | Direct Observation |
| Captured | 2026-07-31 14:01 (local) |
| Role / Credential used | Super Admin (`odeysysadmin` — role only) |

## 1. Purpose

Lists every agency and provides the row-level actions that reach the update form. **In scope for this run as a means only** — it is how the record under test is located, not a test target itself (`modules/agency/context/ProjectContext.md` §2). Its own search semantics, filters, pagination and empty state belong to a different story and are recorded as out of scope in the Project Context §3.

## 2. Entry Points

| From | Action | Result |
|---|---|---|
| Any authenticated page | Expand `Admin` in the navigation, then expand the `Agency` group, then click `Agency` | Navigates to `/admin/agency` |
| Any authenticated page | Direct URL `/admin/agency` | Loads the same list |

**Navigation structure worth recording** (it cost this run a wrong turn): under `Admin`, only `Branch` (`/admin/branch`) and `Staff` (`/admin/staff`) are leaf links. `Company` and `Agency` are **expandable groups**, so clicking the word "Agency" expands rather than navigates. The Agency group's children are:

| Child | Route | In scope this run? |
|---|---|---|
| Agency | `/admin/agency` | yes — as a means |
| Search Login Details | `/admin/login-details` | no — Project Context §3 |
| Registration Requests | `/admin/registration-requests` | no — Project Context §3 |
| Category Management | `/admin/category-management` | no — not named by US-4222 |
| Agency Assignation | `/admin/agency-categorization` | no — not named by US-4222 |

The last two are **not mentioned anywhere in US-4222 or in the PRD's ORG requirements**, so they are recorded here as observed navigation surface rather than assessed. Widening scope to include them would be a Human Decision (§5.3.1 #3).

## 3. Structure

| Region / Section | Type | Notes |
|---|---|---|
| Search criteria | Two text fields | `Agency code`, `Agency name` |
| Primary action | Button | `Add agency` — leads to `/admin/agency/add` |
| Results grid | Table | Populated on load without requiring a search |
| Pagination | Controls | Pages `1`, `2`, … and a total of **903** |
| Grid utility | Control | `Search in grid` |

## 4. Interactive Elements

**No locator values recorded** — deliberately, per `pipeline.md` §3.5 / `explorer-skill` §5.15, as explained in `AgencyUpdateForm.md` §4.

| Element | Type | Label / Accessible Name | Locator | Required? | Notes |
|---|---|---|---|---|---|
| Agency code | Text | `Agency code` | out of scope — §3.5 | no | Search criterion |
| Agency name | Text | `Agency name` | out of scope — §3.5 | no | Search criterion |
| Add agency | Button | `Add agency` | out of scope — §3.5 | — | Opens the create form |
| Row edit | Icon button | pencil icon (PrimeNG `pi pi-pencil`), no text label, no `title`, no `aria-label` | out of scope — §3.5 | — | The route to the update form. **Carries no accessible name** — see §5 |
| Pagination | Controls | `1`, `2`, `903` | out of scope — §3.5 | — | 903 total agencies |
| Search in grid | Control | `Search in grid` | out of scope — §3.5 | — | Not exercised |

**Grid columns as rendered:** `Code · Agency Name · Country Name · City · Status · Approval Status · Branch Name · Actions`.

`Status` and `Approval Status` appearing as **separate columns** is a direct match for PRD XC-07 `[V]` — *"Grid columns expose approval state to the operator: Status and Approval Status are distinct columns"* — and is recorded in the QA Assessment Report §6 as confirmed behaviour.

**First rows observed** (read-only; recorded because the agency under test must be identifiable and because Project Context RSK-001 requires knowing what was touched on a shared environment):

| Code | Agency Name | Country | City | Status | Approval Status | Branch Name |
|---|---|---|---|---|---|---|
| AGN2 | Test Egypt | Egypt | Cairo | Active | Approved | Test |
| AGN10022 | AbouBakr | Egypt | Cairo | Active | Approved | kiko |
| AGN10217 | Louie_b38ae8 | Egypt | Badrashin | Active | Approved | Mina_ac4548 |
| AGN10020 | killua | Egypt | Cairo | Active | Approved | Nartuo |
| AGN9781 | Mamdouh | Egypt | Badr | Active | Approved | NDC2_Hatem Mamdouh |
| AGN9809 | Uplift2_Mohanad Dawood | Egypt | Badr | Active | Approved | Uplift2_Mohanad Dawood |
| AGN10216 | Pearle_41ccf9 | Egypt | Badrashin | Active | Approved | Basil_920239 |

**The agency this run inspected is row 1 — `AGN2 / Test Egypt`, id 949.** Nothing about it was saved.

**Two data-quality observations from this grid**, recorded but not raised as Findings because the list is not a test target of this run and neither indicates a product defect:

- Several agency and branch names are clearly generated or ad-hoc — `Louie_b38ae8`, `Pearle_41ccf9`, `Mina_ac4548`, `Basil_920239` (hash-suffixed, characteristic of automated test runs), plus `killua` / `Nartuo`. This corroborates Project Context **ASM-010** (the reference suite seeds environment-specific records) and **RSK-001** (shared environment) — and it is the same underlying condition as FINDING-003, on a different screen.
- Every visible row is `Active` / `Approved`, so the grid gave this run no example of an agency in a `Pending for approval` state. That matters for Stage 4M: after `Send For Approval`, the expected state transition has no observed baseline to compare against.

## 5. Observed Validation & Business Rules

| Field / Action | Observed Behaviour | Trigger | Finding ID (if raised) |
|---|---|---|---|
| Grid load | Populates immediately with all agencies; **no search is required first** | Navigate to `/admin/agency` | — |
| Row pencil icon | Navigates to `/admin/agency/edit/{id}` for that row | Click | — |
| Row action affordance | The **only** action affordance in the row is the pencil icon; it exposes no text, no `title`, and no `aria-label` | Read the row's controls | — (see note) |

**On the unlabelled pencil icon.** This is recorded as an observation, not raised as an Accessibility Finding, and the reason is a scope boundary rather than an oversight: a control with no accessible name is a genuine accessibility concern, but the Project Context §3 places accessibility explicitly **out of project scope for this run** (PRD §12 records no accessibility requirement exists to test against, and US-4222 states none). Raising it as an Accessibility Finding would assert a requirement that no source in this project defines. It is recorded here so a future accessibility-scoped run has the observation, and it is listed in the QA Assessment Report §12 as a recommendation instead.

## 6. States Observed

| State | How Reached | What Differs |
|---|---|---|
| Populated, unfiltered | Navigate to `/admin/agency` | 903 records, paginated; all visible rows Active/Approved |

**Not observed:** filtered results, empty state (`No data has been found!` per PRD XC-11), and any agency in a pending-approval state. None is in scope for this run, and the third is a Stage 4M dependency noted in §4.

## 7. System Responses

| Type | Observation |
|---|---|
| Network | No responses with status ≥ 400 on this screen |
| Console | Clean — 0 messages |
| Redirect | None; the route loads directly |

## 8. Evidence Captured

| Evidence | Path |
|---|---|
| Screenshot of the populated list | `evidence/agency_list.png` |
| Session console + network summary | `evidence/session_console.log`, `evidence/session_network_summary.txt` |

## 9. Not Captured

| Missing Item | Reason |
|---|---|
| Selector / locator catalogue | Deliberately out of scope — `pipeline.md` §3.5 |
| Search, filter, pagination and empty-state behaviour | Out of scope for this run (Project Context §3) — the list is a means of reaching the record under test, not a test target |
| An agency in `Pending for approval` state | None present among the visible rows; the environment offered no such example to observe |
| Console log | Nothing emitted — recorded once at `evidence/session_console.log` |

## 10. Findings Raised From This Screen

| Finding ID | Category | Severity |
|---|---|---|
| *(none raised from this screen)* | — | — |

Two observations from this screen contribute to Findings raised elsewhere: the generated agency/branch names corroborate **FINDING-003** (shared-environment data pollution), and the absent `Pending for approval` example is recorded as a Stage 4M dependency in the QA Assessment Report §13.
