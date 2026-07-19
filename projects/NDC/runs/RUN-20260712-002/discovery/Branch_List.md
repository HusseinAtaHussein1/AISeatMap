# Discovery Snapshot — Branch (List screen)

**Discovery Mode:** Browser Automation (`tools/browser_driver/`, real Playwright session — see §8.1 #1; upgraded from the run's initial User-guided decision once live tooling was confirmed available and working, per Explorer Agent §8.2 "must use the highest-priority mode actually available") · **Date:** 2026-07-12 · **URL:** `http://192.168.1.80/admin/branch` · **Role:** Admin (`odeysysadmin`) · **Evidence:** `branch_list.png`

## What's on this screen

- Filters: Branch code, Branch name, Country, State, City (dependent dropdowns — State/City show "loading..." until Country is picked), Status (Inactive / Active / Both, default Active), a "Search" button.
- Table columns: Code, Branch Name, Country Name, City, Approval Status, Actions (Edit pencil, and a second icon — see FINDING-004 on Actions-column risk).
- **149 total Branch records** visible under default Active filter, paginated 10/page (15 pages).
- All visible rows show Approval Status = "Approved."
- "Add branch" button top-right.

## Confirmed vs. Project Context

Project Context v3 §6 open question — none of the five carried-forward questions concern the List screen directly; this snapshot establishes the baseline the Add/Edit snapshots build on.

## Notes

- The grid populated automatically on page load (no explicit "Search" click needed) — contrast with Agency/Staff (see `Agency_List.md`, `Staff_List.md`, and FINDING-003).
