# Discovery Snapshot — Create Branch

| Field | Value |
|---|---|
| Module | `branch` |
| Produced by run | `run-002__2026-08-03_10-26-17__UserStory__US-8605CreateBranch` |
| Revision | 1 |
| Screen / State | Create Branch (Add Branch) |
| URL / Route | `http://192.168.1.70/admin/branch/add` |
| Discovery Mode | Browser automation — Browser Driver |
| Evidence Category | Direct Observation |
| Captured | 2026-08-03 |
| Role / Credential used | Super Admin |

## 1. Purpose

The form through which a System Administrator creates a new NDC Branch, covering Branch Details, Branch Email Configuration, Branch Contact Info, Branch Sales Configuration, and Product Access Details, ending in Submit-for-Approval or Cancel — the screen US 8605 describes.

## 2. Entry Points

| From | Action | Result |
|---|---|---|
| Dashboard | Click "Admin" tab (`span.p-tabview-title`, not the profile-menu "Admin" substring match) | Navigates to `/admin/operating-country`, revealing the Company/Branch/Agency/Staff left-nav |
| Admin → Company (left nav) | Click "Branch" in the left nav | Navigates to `/admin/branch` (Search Branch grid) |
| Search Branch grid | Click "Add branch" | Navigates to `/admin/branch/add` (this screen) |

## 3. Structure

| Region / Section | Type | Notes |
|---|---|---|
| Top nav | Tab bar | Dashboard / Admin / Master / Rule Engine / Settings / User Management / Booking-Mid Office / Profile / Reports / PNR Query / Transfer PNR |
| Left nav (within Admin) | Collapsible menu | Company (expandable) / Branch / Agency (expandable) / Staff |
| Branch Details | Form section | Operating country, Name, Country (read-only), State, City, Address 1, Address 2, Post Office Box, Phone Number, Service Tax Number, ABTA Number — no PAN Number, no Brand field (see FINDING-008) |
| Branch Email Config Info | Form section | Email ID, Email Password (masked, with show/hide eye icon) |
| Branch Contact Info | Form section + Add button | Name, Email ID, Phone Number, then "Add" — no Department control (see FINDING-009), no visible Designation field (consistent with AC's backend-only Designation) |
| Branch Sales Configuration | Form section | Target Amount / Set Month / Set Year + "Add +"; Credit Limit, Top Up Limit, Credit Terms(Days); Reaching Percentage, Warning Prompt(Days); Payment Option checkboxes; Outstanding Threshold (undocumented — FINDING-010) |
| Product Access Details | Checkbox group + grid | Flight (checked, enabled) / Others (unchecked); grid columns Status, Supplier Name, Credential Name (dropdown), Product Name (read-only "Flight"), Description |
| Import PNR | Single checkbox | Positioned after the Product Access grid |
| Footer actions | Button row | Cancel, "Send For Approval" (see FINDING-011) |

## 4. Interactive Elements

| Element | Type | Label / Accessible Name | Locator | Required? | Notes |
|---|---|---|---|---|---|
| Operating country | Searchable dropdown | "Operating country *" | label-relative (no stable `id`/`data-testid` observed) | Mandatory | Not deeply probed this run — out of this Finding set's boundary-testing budget |
| Name | Text input | "Name *" | label-relative | Mandatory | Branch Name |
| Country | Read-only field | "Country *" | label-relative | Mandatory (auto-filled) | Greyed out in screenshot, consistent with AC |
| State / City | Dropdowns | "State *" / "City *" | label-relative | Mandatory | Cascading behavior not exercised this run (no Operating Country was selected) |
| Address 1 / Address 2 | Textareas | "Address 1 *" / "Address 2" | label-relative | Mandatory / Optional | Not boundary-tested this run |
| Post Office Box | Text input | "Post Office Box *" | label-relative, marked via `data-probe-id` during probing | Mandatory | See FINDING-002 |
| Phone Number (x2: Branch, Contact) | Country-code selector + numeric input | "Phone Number *" | label-relative | Mandatory | Not boundary-tested this run |
| Service Tax Number / ABTA Number | Text inputs | as labeled | label-relative | Optional | Present; PAN Number is not (FINDING-008) |
| Email ID (Branch Email Config) | Text input | "Email ID *" | label-relative | Mandatory | Not boundary-tested |
| Email Password | Masked text input with show/hide toggle | "Email Password *" | label-relative | Mandatory | 15-char max length not boundary-tested this run |
| Branch Contact Info: Name / Email ID / Phone Number | Inputs | as labeled | label-relative | Mandatory | "Add" button beneath adds another contact person; multi-add not exercised this run |
| Enter Target Amount / Set Month / Set Year / "Add +" | Inputs + button | as labeled | label-relative | Optional | Not exercised this run |
| Credit Limit / Top Up Limit / Credit Terms(Days) | Numeric inputs | as labeled | label-relative, `data-probe-id` for Credit Limit | Mandatory | See FINDING-003 |
| Reaching Percentage | Numeric input | "Reaching Percentage" | label-relative, `data-probe-id` | Optional | See §5 below — >100% correctly rejected |
| Warning Prompt(Days) | Numeric input | "Warning Prompt(Days)" | label-relative, `data-probe-id` | Optional | See FINDING-004 |
| Payment Option checkboxes | Checkbox group | "Payment Option *" | label-relative | Mandatory | See FINDING-001, FINDING-007 |
| Outstanding Threshold | Numeric input, default "5" | "Outstanding Threshold *" | label-relative | Mandatory (undocumented) | See FINDING-010 |
| Flight / Others | Checkboxes | "Flight" / "Others" | label-relative | Mandatory (Flight, per AC) | See FINDING-006 |
| Product Access grid: Credential Name dropdown, Description | Dropdown + text input | per column header | label-relative | Description Mandatory once a credential/supplier is selected (per AC) | Not exercised — no supplier row was selected this run |
| Import PNR | Checkbox | "Import PNR" | label-relative | Per AC: should always be checked | See FINDING-005 |
| Cancel / "Send For Approval" | Buttons | as labeled | label-relative | Mandatory actions | Neither was clicked this run — see Investigation Notes in FINDING-011 |

## 5. Observed Validation & Business Rules

| Field / Action | Observed Behaviour | Trigger | Finding ID (if raised) |
|---|---|---|---|
| Post Office Box | Accepts >8 alphanumeric characters with no truncation/error | Type 12-char value, blur | FINDING-002 |
| Credit Limit | Rejects non-numeric input with inline message "Please enter a numeric value (with 2 decimal places allowed)." | Type "abc123xyz789", blur | FINDING-003 (length aspect only; numeric-only rule confirmed working) |
| Credit Limit | Accepts >15 numeric digits with no truncation/error | Type 16-digit value, blur | FINDING-003 |
| Reaching Percentage | Correctly rejects >100% with inline message "Reaching Percentage should not be greater than 100%" | Type "150.1234", blur | None — confirms AC, see QA Assessment Report §6 |
| Warning Prompt(Days) | Accepts >11 digits with no truncation/error | Type 14-digit value, blur | FINDING-004 |
| Payment Option | Checkbox list includes ~25 entries unrelated to payment methods | Load screen, scroll to Payment Option row | FINDING-001 |
| Credit Card checkbox | No Payment Gateway dropdown appears | Click Credit Card checkbox | FINDING-007 |
| Import PNR checkbox | Renders unchecked by default | Fresh page load | FINDING-005 |
| Flight checkbox | Renders checked but not disabled (user-editable) | Fresh page load, DOM attribute read | FINDING-006 |
| "Search Supplier Credentials PCC" / "Ticketing Supplier Credential PCC" text | Confirmed absent from the rendered page | Full-page text search | None — confirms AC, see QA Assessment Report §6 |
| "PAN" text | Confirmed absent from the rendered page | Full-page text search | FINDING-008 |
| "Department" text | Confirmed absent from the rendered page | Full-page text search | FINDING-009 |

## 6. States Observed

| State | How Reached | What Differs |
|---|---|---|
| Fresh/empty Create Branch form | Direct navigation to `/admin/branch/add` after login | Baseline state; all fields at their defaults (Flight checked, Import PNR unchecked, Outstanding Threshold = "5") |
| Partially probed form | After typing boundary-condition values into Post Office Box, Credit Limit, Reaching Percentage, Warning Prompt and blurring each | Inline validation messages appear under Credit Limit and Reaching Percentage; no messages under Post Office Box or Warning Prompt |

## 7. System Responses

Not captured this run — the ad hoc Browser Driver probe scripts used for this Discovery pass captured screenshots and DOM/attribute reads only; network and console capture (`captureNetwork()`, browser console listeners) were not wired into these scripts. Recorded here as a Not-Captured item per §5.10 rather than omitted silently (see §9 below).

## 8. Evidence Captured

| Evidence | Path |
|---|---|
| Post-login screenshot | `platform_core_data/modules/branch/discovery/evidence/01-post-login.png` |
| Dashboard screenshot | `platform_core_data/modules/branch/discovery/evidence/02-dashboard.png` |
| Search Branch grid screenshot | `platform_core_data/modules/branch/discovery/evidence/03-search-branch-grid.png` |
| Create Branch full-page screenshot (initial) | `platform_core_data/modules/branch/discovery/evidence/04-create-branch-fullpage.png` |
| Create Branch full-page screenshot (after boundary probes) | `platform_core_data/modules/branch/discovery/evidence/05-create-branch-after-probes.png` |
| Per-Finding evidence | `platform_core_data/modules/branch/discovery/findings/FINDING-0XX_*/` |

## 9. Not Captured

| Missing Item | Reason |
|---|---|
| Console logs | Not wired into this run's ad hoc Browser Driver probe scripts |
| Network requests/responses (HAR) | Not wired into this run's ad hoc Browser Driver probe scripts |
| DOM/accessibility snapshots (serialized) | Only targeted attribute reads (`checked`, `disabled`, `maxlength`, `innerText` searches) were captured, not full serialized DOM/accessibility-tree dumps |
| Operating Country → Country/State/City cascade behaviour | No Operating Country was selected this run; cascading behaviour is unverified |
| Multi-contact "Add" behaviour (Branch Contact Info) | Not exercised this run |
| Multi-target "Add +" behaviour (Sales Configuration) | Not exercised this run |
| GDS-conditional PCC sub-grid (AC: "If a GDS is selected...") | No supplier row was checked this run, so the conditional sub-grid never appeared to inspect |
| Actual Submit-for-Approval outcome (server-side validation, created-record state) | Not attempted this run — see QA Assessment Report §8 Open Questions |

## 10. Findings Raised From This Screen

| Finding ID | Category | Severity |
|---|---|---|
| FINDING-001 | Bug | Medium |
| FINDING-002 | Bug | Medium |
| FINDING-003 | Bug | Medium |
| FINDING-004 | Bug | Medium |
| FINDING-005 | Bug | Medium |
| FINDING-006 | Requirement Gap | N/A |
| FINDING-007 | Bug | Medium |
| FINDING-008 | Requirement Gap | N/A |
| FINDING-009 | Requirement Gap | N/A |
| FINDING-010 | Requirement Gap | N/A |
| FINDING-011 | Bug | Low |
