# Discovery Snapshot — Staff (List screen)

**Discovery Mode:** Browser Automation · **Date:** 2026-07-12 · **URL:** `http://192.168.1.80/admin/staff` · **Role:** Admin · **Evidence:** `staff_list.png` (initial load), `staff_list_both.png` (after Search, Status=Both)

## What's on this screen

- Filters: Staff Name, User Name, Branch (Select Branch dropdown), Department (Select Department dropdown), Status (Inactive/Active/Both, default Active), "Search in grid" button.
- Table columns: not rendered — grid remained empty under both the default filter and an explicit Both-status "Search in grid" click.

## Confirmed vs. Project Context

- §6 Q5 (whether Staff is scoped per-Agency, per-Branch, or global) — **partially confirmed**: the List screen's own filter offers Branch and Department, not Agency, suggesting Staff is Branch-scoped (or global with a Branch filter) rather than Agency-scoped. Not fully confirmed since no actual Staff record was found to inspect.

## Open Question / Test Gap

Unlike Branch (149 records, auto-populated) and Agency (9,537 records, populated after Search), **the Staff grid returned zero visible rows even after an explicit Both-status "Search in grid" click** (`staff_list_both.png`). This is recorded as an **Open Question**, not asserted as fact: it is equally plausible that (a) this staging environment genuinely has zero Staff records, or (b) a click-timing/dropdown-interaction issue in this run's automation caused the search to silently no-op. See FINDING-005 (Test Gap).
