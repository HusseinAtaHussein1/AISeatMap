# NDC — Discovery Timeline (RUN-20260712-002)

Discovery Mode: Browser Automation throughout (`tools/browser_driver/`), unless noted.

| Time | Event |
|---|---|
| T+0 | Session authenticated against NDC STG via `BrowserDriver.authenticate({project:'NDC', env:'STG'})`. Post-login URL observed as `http://192.168.1.80/dashboard` — see FINDING-001 (documented URL is `192.168.1.70`). |
| T+1 | Navigated Admin tab. Sidebar enumerated: Company (expandable → Operating Country, Branch), Branch, Agency (expandable → Agency, Search Login Details, Registration Requests, Category Management, Agency Assignation), Staff. |
| T+2 | Branch List opened (`/admin/branch`) — 149 records, auto-populated on load. `Branch_List.md` / `branch_list.png`. |
| T+3 | Branch Add opened (`/admin/branch/add`) — large multi-section form captured. `Branch_Add.md` / `branch_add.png`. |
| T+4 | Attempted Branch Edit via the list's Actions column — the click landed on the **Reject/Deactivate action** (thumbs-down icon), not the Edit pencil, opening a "Remark *" confirmation modal for Branch "Test" (BRN2). **No Submit was clicked; no mutation occurred.** Screenshot captured (`branch_edit.png`) shows the unsubmitted modal. See FINDING-004. Branch's actual Edit-form field set remains unconfirmed (Coverage gap). |
| T+5 | Agency List opened (`/admin/agency`) — grid empty on initial load. `agency_list.png`. |
| T+6 | Agency Add opened (`/admin/agency/add`) — large multi-section form captured (Branch/Owner/Documents/Sales Contact/Bank/Payment). `Agency_Add.md` / `agency_add.png`. |
| T+7 | Agency List re-queried with Status=Both + explicit "Search in grid" — 9,537 records returned. `agency_list_both.png`. See FINDING-003 (list auto-load inconsistency vs. Branch). |
| T+8 | Staff List opened (`/admin/staff`) — grid empty. `staff_list.png`. |
| T+9 | Staff Add opened (`/admin/staff/add`) — compact single-section form captured. `Staff_Add.md` / `staff_add.png`. |
| T+10 | Staff List re-queried with Status=Both + explicit "Search in grid" — still zero visible rows. `staff_list_both.png`. See FINDING-005 (Test Gap — inconclusive whether zero real records or a tooling limitation). |
| T+11 | Session closed. No create/edit/delete action was submitted this Discovery pass — all Add/Edit forms were opened and structurally captured only, per Explorer Agent's discovery-not-mutation responsibility. Mutation authorized for this run (Project Context v3 §5) remains available for Stage 5 Execution once Test Design/Automation define the actual test cases to submit. |
