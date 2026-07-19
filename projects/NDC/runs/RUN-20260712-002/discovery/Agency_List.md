# Discovery Snapshot — Agency (List screen)

**Discovery Mode:** Browser Automation · **Date:** 2026-07-12 · **URL:** `http://192.168.1.80/admin/agency` · **Role:** Admin · **Evidence:** `agency_list.png` (initial load, empty grid), `agency_list_both.png` (after explicit Search, Status=Both)

## What's on this screen

- Filters: Agency code, Agency name, Select Country, State, City, Status (Inactive/Active/Both, default Active), "Search in grid" button.
- Table columns: Code, Agency Name, Country Name, City, Status, Approval Status, Branch Name, Actions.
- **On initial page load, the grid renders empty** (`agency_list.png`) despite matching data existing.
- After explicitly clicking "Search in grid": **9,537 total Agency records** (Active + Both), paginated 10/page (954 pages). All sampled rows show Status=Active, Approval Status=Approved, and a populated Branch Name column (confirming Agency → Branch linkage).

## Confirmed vs. Project Context

- §6 Q5 is about Staff scoping, not Agency — not applicable here.
- Confirms Agency records are linked to a specific Branch (Branch Name column, and the Add form's required Branch dropdown — see `Agency_Add.md`).

## Notes

- See **FINDING-003** — this screen requires an explicit "Search in grid" click to populate, unlike Branch's List screen which auto-populates on load. This is a real, observed UX inconsistency between sibling Admin screens.
