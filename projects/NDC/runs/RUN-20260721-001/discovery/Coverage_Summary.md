# NDC — Coverage Summary — RUN-20260721-001 (Role Management — Create Role)

Run Scope Type: **User Story** (narrowest strategy — verify the AC's own stated cases, don't wander beyond what's needed). Discovery Mode for every entry below: **Browser Automation**.

## Visited Screens

| Screen | URL | Discovery Mode | Notes |
|---|---|---|---|
| Dashboard (post-login landing) | `/dashboard` | Browser Automation | Confirmed 11-item nav for this session's tier (Super Admin) |
| Admin → Company (default: Operating Country) | `/admin/operating-country` | Browser Automation | Confirmed Admin sidebar = Company/Branch/Agency/Staff only, no standalone "Role" item |
| Admin → Role List/Search | `/admin/role` | Browser Automation | Out of Scope per this run's own Project Context (§3) — visited only because it's the Cancel button's cited navigation target and because "Add Role" is reached from here; not itself explored beyond confirming its existence and the 115-row grid |
| **Admin → Role → Add Role (in-scope target)** | `/admin/role/add` | Browser Automation | Fully explored: Role Name field, all validation-message cases the AC states, module/sub-module segment structure (Dashboard single-row pattern + Admin→Company 4-row grid pattern), checkbox auto-select behavior (View/Edit/Approve), Cancel and Submit buttons |

## Visited Components

- Global top navigation (11-item tab bar, PrimeNG `p-tabview`) — reused across all screens above
- Add Role's module-segment tab bar (same `p-tabview` pattern, nested one level down)
- Add Role's sub-module tab bar (Company/Branch/Agency/Staff, within the Admin segment)
- Permission-row grid (View/Edit/Approve checkbox triplet) — sampled on 2 distinct row types (Dashboard's single "Display" row; Company's 4-row grid)

## Skipped Areas

- **Branch / Agency / Staff sub-module tabs' own permission grids** (within the Admin segment) — not individually inspected row-by-row. Reason: this run's User Story strategy targets verifying the AC's own stated structural pattern (module → sub-module → tab-grid → View/Edit/Approve), which was already confirmed twice (Dashboard's single-row pattern, Company's 4-row grid pattern); enumerating every other sub-module's specific row contents wasn't necessary to answer this Project Context's open items and was deprioritized within this run's scope.
- **Master, Rule Engine, Settings, User Management, Booking-Mid Office, Profile, Reports, PNR Query, Transfer PNR segments' own permission grids** — same reasoning; the segment tab bar's presence/list was confirmed (relevant to FINDING-004), but each segment's internal row content was not individually opened.

## Blocked Areas

- None. Every in-scope area (per this run's own Project Context, §2) was reachable.

## Unreachable Areas

- **Admin-tier credential's (`e.saady`) view of the Add Role screen** — `projects/NDC/credentials/credentials.json` currently populates only the Super Admin (`odeysysadmin`) account for this project's STG environment; the Admin-tier account is not available to test with this session. Relevant specifically to FINDING-004 (whether the Admin tier sees a different/fuller segment list, e.g. including Import PNR/Import Booked PNR).

## Coverage %

**In-scope surface (this run's Project Context §2): 1 primary screen (Add Role) + its 1 directly-cited dependency screen (Role List, for Cancel's navigation target) = 2/2 visited = 100%.** Sub-module/segment-internal row enumeration beyond the two structural patterns sampled is not counted against this ratio — see Skipped Areas above for what was deliberately not exhaustively opened, and why.
