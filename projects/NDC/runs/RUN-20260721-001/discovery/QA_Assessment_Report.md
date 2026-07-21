# NDC — QA Assessment Report — RUN-20260721-001 (Admin → Role Management → Create Role)

**Produced by:** Explorer Agent (Stage 2) · **Date:** 2026-07-21 · **Project Context validated:** `projects/NDC/workspace/context/NDC_ProjectContext_Role.md` (Approved 2026-07-21)

## 1. Scope

Run Scope Type: **User Story**, Source: Pasted text (`resources/requirements/user_stories/Create-Role.md`; `PRD.md` User Story 4). Run Type: standard (not Smoke/Full Regression). This run validates the Project Context's Create Role scope only — Search Role, Update Role, and STAFF CRUD (named in the User Story's own Reflection section) remain explicitly Out of Scope, per the Project Context §3.

## 2. Objectives

Resolve, via live observation, the Project Context's carried-forward open items (§6): where the Create Role screen actually lives in the navigation (#4), whether Company's own "Role" tab is the same entity as this document's whole subject (#3), the actor/role-tier ambiguity tied to the project's existing FINDING-004 (#2), and whether the Select-All/Edit-implies-View/Approval-implies-View checkbox behavior holds live (#6) — then validate the rest of the AC's stated fields, messages, and buttons against the real application.

## 3. Evidence Sources

**Browser Automation** (`platform_core/tools/browser_driver/`, headless Chromium) was used for the entire run — no fallback to a lower-priority Discovery Mode was needed. One platform-infrastructure blocker was hit and fixed before this mode became usable: `driver.js`'s repo-root path computation was stale after a recent restructure (`tools/` → `platform_core/tools/`); corrected as a one-line path fix (see Timeline #1). A separate, unfixed config discrepancy was worked around rather than fixed: `browser/profile.json`'s `defaultBaseUrl` (`.80`) doesn't match the host `credentials.json` actually authenticates against (`.70`), so all navigation this run used absolute URLs rather than the driver's relative-path convenience (Timeline #6).

## 4. Modules Explored

- **Sitemap:** `/dashboard` → `/admin/operating-country` (Admin landing) → `/admin/role` (Role List/Search) → `/admin/role/add` (Add Role, this run's primary target).
- **Business modules:** Admin → Company (Operating Country, **Role**, Department, Advance Credit/Top Up Request), Branch, Agency, Staff — sidebar structure confirmed matching `architecture.md` exactly, with **Role** now confirmed as a real, reachable sub-item of Company (previously undocumented in `architecture.md`'s table).
- **Reusable components:** the PrimeNG `p-tabview` pattern, used identically for the top nav, the Add Role module-segment bar, and the Add Role sub-module bar — and its one shared quirk (doesn't respond to Playwright's synthetic `.click()`, needs raw mouse events — see §3/Timeline #3), worth carrying forward to Stage 4 (Automation Agent) as a known technique, similar to prior REP-series wrapper-click findings for this project.

## 5. Observed Behaviour

The Add Role screen (`/admin/role/add`) presents: a mandatory Role Name text field; a horizontally-scrollable module-segment tab bar (11 segments observed for this session's tier); for a segment with no further structure (Dashboard), a single "Display" row with View/Edit/Approve; for a segment with sub-modules (Admin), a second-level tab bar (Company/Branch/Agency/Staff) whose active tab (Company) shows a 4-row permission grid (Operating Country, Role, Department, Advance Credit/Top Up), each row with its own View/Edit/Approve triplet; and two bottom action buttons. Submitting with various invalid inputs correctly blocks the action and surfaces a validation message every time — the validation logic itself works in every case tested.

## 6. Confirmed Behaviour

Directly validated against the Project Context and found to match:
- `FR-ROLECRT-PERM-01` (View independently selectable) — confirmed (Timeline #13).
- `FR-ROLECRT-PERM-02` (Edit ticked → View auto-selected) — confirmed (Timeline #11).
- `FR-ROLECRT-PERM-03` (Approval ticked → View auto-selected) — confirmed (Timeline #12).
- `FR-ROLECRT-ACTION-02` (Cancel clears/exits and navigates to the Search Role Screen) — confirmed; Cancel navigates to `/admin/role` (Timeline #19).
- `FR-ROLECRT-MOD-01`/`-04`, `FR-ROLECRT-TAB-01` (module → sub-module → tab-grid structure, with the Admin/Company/Operating-Country/Role/Department example) — confirmed to match the AC's own example exactly (Timeline #5, #9).
- Role Name is a mandatory text field whose format is actively validated (rejects numeric/special-character input) and whose uniqueness is enforced (rejects a name matching an existing role) — the underlying *behavior* the AC describes is present, even though the exact message text differs (see Gaps, §11, and FINDING-002).
- At least one authorization/permission checkbox is required before submission succeeds — behavior confirmed, message text differs (FINDING-002).

## 7. Assumptions

- The Admin-tier (`e.saady`) view of this screen is assumed similar to the Super Admin (`odeysysadmin`) view tested here, but this is unconfirmed (Evidence Category: Assumption) — the credential isn't available in this project's `credentials.json`.
- The 115 pre-existing roles observed in the Role List are assumed to be real, pre-existing shared-staging data (consistent with this being a shared, non-isolated environment per the Project Context §5), not artifacts of this session — no role was created this session to test this assumption directly.

## 8. Open Questions

All resolved this run except one:
- **Project Context §6 #3 (naming collision) — RESOLVED.** Company's "Role" tab *is* this same Create-Role entity's own self-referential permission row, not a separate or unrelated screen.
- **Project Context §6 #4 (nav location) — RESOLVED.** `Admin → Company → Role` (`/admin/role`, Add form at `/admin/role/add`); not a standalone top-level Admin sidebar item.
- **Project Context §6 #5 (segment-list discrepancy) — CONFIRMED as real**, see FINDING-004.
- **Project Context §6 #6 (checkbox behavior) — RESOLVED**, confirmed true to the AC (§6 above).
- **Project Context §6 #1 (Role Name message ambiguity) — RESOLVED (differently than expected)**: revealed as *four* distinct real messages, none matching the AC's single quoted string. See FINDING-002.
- **Project Context §6 #2 / #7 (actor/role-tier ambiguity, existing FINDING-004) — PARTIALLY resolved.** Confirmed this session ran as the Super Admin tier (`odeysysadmin`), and independently reconfirmed the existing FINDING-004's reduced-nav observation live for this host (11-item nav, no Import PNR/Import Booked PNR). **Still open:** whether the Admin tier (`e.saady`) sees a different Role-grid segment list or different Create-Role behavior at all — untested, Admin credential unavailable (Coverage: Unreachable).

## 9. Discovered Risks

- **Business risk:** see each Finding's own Business Risk field (FINDING-001 through -004) — chiefly, Test Design/automation asserting the AC's literal message/label text would produce false-negative failures against the real application (FINDING-002, FINDING-003).
- **Technical risk:** none of this run's Findings indicate an application-side technical/architectural risk — all four are documentation-vs-implementation mismatches, not functional defects in the underlying validation or permission logic.
- **Tooling risk (platform-side, not NDC):** `browser/profile.json`'s stale `defaultBaseUrl` (§3) will silently misdirect any future relative-path `driver.navigate()` call for this project — including a future Stage 4 (Automation Agent) SHAFT/Playwright script — until corrected. Recommend fixing `defaultBaseUrl` to `http://192.168.1.70` (or confirming `.70` vs `.80` with whoever manages the STG hosts) before this project's next browser-automation-dependent run.

## 10. Coverage

Roll-up from `Coverage_Summary.md`: **2/2 in-scope screens visited (100%)** — Add Role (primary target) and Role List (Cancel's navigation target, Out-of-Scope itself but directly cited). Branch/Agency/Staff sub-module grids and the other 8 module segments' internal rows were deliberately not exhaustively opened (Skipped, not Blocked) — the AC's structural pattern was already confirmed twice via Dashboard and Company. One area is Unreachable (Admin-tier credential). See `Coverage_Summary.md` for full detail.

## 11. Gaps

Documented (Project Context) vs. Observed (Application):
- **FINDING-001** — AC requires a "Select All" checkbox per sub-module; none exists live.
- **FINDING-002** — AC quotes one Role Name message and one Authorization message; live has four distinct messages across the two validation areas, none matching the quoted text.
- **FINDING-003** — AC's button label "Submit for Approval" vs. live "Send For Approval."
- **FINDING-004** — AC's 9-item segment list vs. live's 11-item list (session-tier-dependent).

No gaps were found in the *structural* AC (module → sub-module → tab-grid → checkbox-triplet, and the auto-select rules) — every structural and behavioral claim in the AC was confirmed to match live behavior exactly.

## 12. Recommendations

- Resolve FINDING-001 through FINDING-004 with the Product Owner/dev team before Test Design asserts any of the AC's exact quoted strings or the Select-All behavior as Covered requirements.
- **Regression Test Candidates:** the three confirmed checkbox auto-select rules (View alone / Edit→View / Approve→View) and the four validation-message cases (empty/invalid-format/duplicate/no-authorization) are all stable, reproducible, low-effort candidates for regression test cases once Test Design proceeds.
- Fix `browser/profile.json`'s `defaultBaseUrl` discrepancy (§9) before any future Stage 4 automation work on this project relies on relative-path navigation.
- Populate the Admin-tier (`e.saady`) credential in `credentials.json` if this project wants the still-open tier-comparison question (§8) answered in a future run.

## 13. Inputs for Test Design

- **Findings by ID/Category/Status:** FINDING-001 (Bug, Medium, Needs Human Review), FINDING-002 (Bug, Medium, Needs Human Review, 4 occurrences), FINDING-003 (Bug, Low, Needs Human Review), FINDING-004 (Requirement Gap, N/A, Needs Human Review). All four map toward an Exploratory-test/documented-exception disposition rather than a straight regression assertion, until resolved with the Product Owner — see each Finding's own Recommendation field.
- **Confirmed Assumptions:** all of Project Context §6's checkbox-behavior and structural assumptions (items #3, #4, #6) — safe for Test Design to assert directly.
- **Unresolved Assumptions:** Project Context §6 #2/#7 (Admin-tier behavior) — remains untested; Test Design should mark any Admin-tier-specific test case as Blocked/credential-dependent rather than assume parity with the Super Admin tier tested here.
- **Regression Test Candidates:** see §12 above.
- **Requirement Gaps needing a coverage decision:** FINDING-001 (does Test Design assert Select-All as Covered, Not Covered, or defer?), FINDING-002/FINDING-003 (which message/label text should test assertions use — the AC's or the live one?), FINDING-004 (should the segment list test assertion be tier-specific?).
