# Discovery Snapshot — Search & Actions Branch

| Field | Value |
|---|---|
| Module | `branch` |
| Produced by run | `run-003__2026-08-04_11-24-38__UserStory__US-8599-SearchActions_US-8606-UpdateBranch` |
| Revision | 1 |
| Screen / State | Search Branch (list, filter, actions, pagination) |
| URL / Route | `http://192.168.1.70/admin/branch` |
| Discovery Mode | Browser automation — **Browser Driver** |
| Evidence Category | Direct Observation |
| Captured | 2026-08-04 |
| Role / Credential used | Super Admin (`odeysysadmin`), standing in for both actors per the 2026-08-04 directive |

## 1. Purpose

The list screen through which a Super Admin or Admin searches Branch records, reads the results grid, and acts on a row — edit, approve, reject — with pagination across the result set. The screen US 8599 describes.

**Prior coverage note:** run-002 visited this screen as a single navigation waypoint only (`Coverage_Summary.md`: *"Browser automation — available, deliberately not used beyond the single waypoint screenshot"*). This is its first substantive exploration.

## 2. Entry Points

| From | Action | Result |
|---|---|---|
| Post-login dashboard | Left nav → Admin → Company → **Branch** | Navigates to `/admin/branch` (this screen) |
| This screen | Click **Add branch** | Navigates to `/admin/branch/add` (Create Branch — covered by `DiscoverySnapshot_CreateBranch.md`) |
| This screen | Click a row's **edit pen** (`pi-pencil`) | Navigates to `/admin/branch/edit/{BranchCode}` (Update Branch — see `DiscoverySnapshot_UpdateBranch.md`) |

## 3. Search & Filter Form — observed structure

All six controls US 8599 specifies are **present**. Four are PrimeNG widgets rather than native HTML controls, which is why a naive `input`/`select` scan under-reports them.

| Control | Live label | Element id | Widget | Observed behaviour |
|---|---|---|---|---|
| Branch Code | `Branch code` | `id-Branchcode` | plain text input, placeholder `Code` | Accepts free text. Carries CSS `text-transform: uppercase` — see §7 Obs-1 |
| Branch Name | `Branch name` | `id-Branchname` | plain text input, placeholder `Name` | Accepts alphanumeric **and** special characters — see §7 Obs-2 |
| Country | `Country` | `id-Country` | `p-dropdown` (clearable) | **Enabled** on load. 11 options observed |
| State | `State` | `id-State` | `p-dropdown` | **Disabled** on load; enables only after a Country is chosen |
| City | `City` | `id-City` | **`p-multiselect`** (`selecteditemslabel="All ({0} selected)"`) | **Disabled** on load; enables only after a State is chosen. Multi-select, not single-select — see FINDING-015 |
| Status | `Status :` | `id-Status-Inactive` / `-Active` / `-Both` | `p-radiobutton` group, `name="id-Status"` | Values `0` / `1` / `-1`. **`Active` is checked on load** — matches the AC's stated default |
| Search | — | — | `button[type=submit]` | Executes the query with applied filters |

**No Reset/Clear control is present** on this form (PRD.md XC-16 records Reset as `[O]` — observed-but-unasserted platform-wide; it does not exist here).

### 3.1 Cascading dropdown behaviour — confirmed working

Directly observed, matching US 8599's Business Rule:

| Step | State dropdown | City multiselect |
|---|---|---|
| On load | disabled | disabled |
| After `Country = Egypt` | **enabled** (33 options) | disabled |
| After a State is chosen | enabled | **enabled** |

Country options observed (11): `Serbia, Algeria, Lebanon, MASCAT, United Arab Emirates, Saudi Arabia, Egypt, Sri Lanka, EMIRATES, beirut, Sudan`. Several entries are evidently test/junk master data (`MASCAT`, `EMIRATES`, `beirut` duplicating Lebanon) — a **data-quality observation about `master-geography`, not a Branch defect**, and out of this module's scope to fix.

## 4. Results Grid — observed structure

| # | Live header | US 8599 requires |
|---|---|---|
| 1 | `Code` | Branch Code |
| 2 | `Branch Name` | Branch Name |
| 3 | `Country Name` | Country Name |
| — | *(absent)* | **State** ← see FINDING-012 |
| 4 | `City` | City |
| 5 | `Approval Status` | Approval Status |
| 6 | `Actions` | Action Options |

Header count is **6**, verified twice on independent page loads, with an explicit check that no seventh header exists hidden (`offsetParent === null` / `display`) — the State column is genuinely absent, not responsive-hidden.

**There is no Active/Inactive `Status` column** — the property the Status radio filters on is never displayed in the grid (FINDING-014). PRD.md XC-07 states Status and Approval Status are distinct columns platform-wide; on this grid only Approval Status exists.

### 4.1 Approval Status values observed

`Approved` · `Pending for approval` · `Rejected`

`Pending for approval` matches PRD.md XC-01 / §9.2's contractual string exactly.

## 5. Row Actions — availability is state-dependent (resolves RISK-BR-6a)

Directly observed across 120 distinct branch records spanning 12 pages:

| Approval Status | Icons present | Interpretation |
|---|---|---|
| `Approved` | `pi-pencil`, `pi-thumbs-down` | Edit + Reject. **No thumbs-up** — cannot re-approve an approved record |
| `Pending for approval` | `pi-pencil`, `pi-thumbs-up`, `pi-thumbs-down` | Edit + Approve + Reject — the full action set |
| `Rejected` | `pi-pencil`, `pi-thumbs-up` | Edit + Approve. **No thumbs-down** — cannot re-reject a rejected record |

The pattern is internally coherent: **a record only offers transitions to a state it is not already in.** US 8599 does not specify this behaviour; it is neither required nor contradicted by the story, and is recorded as Confirmed Behaviour rather than as a defect.

**Not observed:** whether clicking thumbs-up/thumbs-down opens a Remarks prompt (PRD.md XC-03 requires approve/reject to capture free-text Remarks as the audit reason). Establishing that requires *performing* an approve/reject, which under this run's authorization is permitted only on a record this run created — see §8.

## 6. Pagination — observed behaviour (resolves RISK-BR-9)

| Property | Observed |
|---|---|
| Default page size | **10** (a page-size `p-dropdown` is present, showing `10`) |
| Record counts | `Active` → **491** · `Inactive` → **125** · `Both` → **616** |
| Page count at size 10 | 62 pages on `Both` (pager exposes `1`, `2`, …, `62`, plus First/Last) |
| Count text | `Showing 10 results of 616 results` (page 1) → `Showing 30 results of 616 results` (page 3) |
| Filter persistence across paging | **Preserved** — `Status=Both` still selected after advancing pages (XC-13 ✓) |
| Cross-page uniqueness | 120 distinct codes across 12 pages of 10 — no repetition observed (XC-14 consistent) |

**`Both` (616) = `Active` (491) + `Inactive` (125) exactly.** The status filter partitions the set arithmetically, which is direct evidence XC-09 ("the grid must return only records matching the selected status") holds at the aggregate level.

**Pagination is testable with zero seeded data** — 616 live records against a page size of 10. This closes RISK-BR-9's cost concern entirely: no Branch creation is required to exercise pagination.

## 7. Additional observations

| ID | Observation |
|---|---|
| Obs-1 | The **Branch code** search input carries CSS `text-transform: uppercase`. Typing `abc123` displays `ABC123` but the element's value remains `abc123` — the transform is presentational only. Whether the backend match is case-insensitive is not established; a tester reading the screen would reasonably believe an uppercase value was submitted. |
| Obs-2 | The **Branch name** search input accepted `<script>@#$%^&*()` unmodified client-side. This is consistent with US 8599's "Alphabetic & Special Char" for the *search* field — so the search side does **not** contradict the story (resolves RISK-BR-7 for this field). |
| Obs-3 | Empty-result state renders **`No data has been found!`** — an exact match to PRD.md XC-11 / §9.2's contractual string. Confirmed Behaviour. When empty, the "Showing … results" count text is absent entirely. |
| Obs-4 | The count text appears to be **cumulative through the current page** (`Showing 30 results of 616` on page 3 at size 10), not the current page's own row count. PRD.md §9.2 states the format but not the semantics, so this is recorded as an observation, not a mismatch. |

## 8. Not covered on this screen, and why

| Area | Why |
|---|---|
| Performing approve / reject | Permitted only on a record this run created (ProjectContext §5). Every record on this screen is pre-existing, so no approve/reject was executed. Belongs to Stage `4M`. |
| Remarks capture on grid-level approve/reject (XC-03) | Same reason — cannot be observed without performing the action. |
| XC-06 self-approval | Requires creating a record, then attempting to approve it from the same account. A Stage `4M` activity. |
| Role-differentiated action availability | Not observable — one account with Super Admin privileges stands in for both actors (ProjectContext §4). |
