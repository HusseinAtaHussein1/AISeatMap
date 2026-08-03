# Discovery Timeline — run-002__2026-08-03_10-26-17__UserStory__US-8605CreateBranch

| Field | Value |
|---|---|
| Module | `branch` |
| Produced by run | `run-002__2026-08-03_10-26-17__UserStory__US-8605CreateBranch` |
| Revision | 1 |
| Run Started | 2026-08-03 |
| Run Ended | 2026-08-03 |

## Log

```
T+00:00  Confirm STG (http://192.168.1.70) reachability via HTTP request — 200 OK
T+00:01  Discover playwright npm package not installed; Browser Driver unusable (infrastructure gap unrelated to the application)
T+00:02  npm install run to install devDependency `playwright` — resolves the gap
T+00:03  Stage 2 start — Explore module: branch
T+00:04  BrowserDriver.authenticate({env: 'STG'}) — login succeeded, landed on /dashboard as Super Admin
T+00:04  Screenshot: post-login state (evidence/01-post-login.png)
T+00:05  Inspect Dashboard nav text — confirms top-level tabs (Dashboard, Admin, Master, Rule Engine, Settings, User Management, Booking-Mid Office, Profile, Reports, PNR Query, Transfer PNR)
T+00:06  Click "Admin" text — landed back on /dashboard (wrong element: matched profile-menu "odeysysadmin" substring, not the Admin tab)
T+00:07  Investigate: 2 elements match text=Admin; index 1 (span.p-tabview-title) is the real Admin tab
T+00:08  Click span.p-tabview-title:has-text("Admin") — navigated to /admin/operating-country; left nav reveals Company / Branch / Agency / Staff
T+00:09  Click "Branch" in left nav — navigated to /admin/branch (Search Branch grid)
T+00:09  Screenshot: Search Branch grid (evidence/03-search-branch-grid.png)
T+00:10  Click "Add branch" — navigated to /admin/branch/add (Create Branch form)
T+00:10  Screenshot: Create Branch full page, initial state (evidence/04-create-branch-fullpage.png)
T+00:11  Extract field labels via DOM — confirms Branch Details / Branch Email Config Info / Branch Contact Info / Branch Sales Configuration / Product Access Details / Import PNR sections
T+00:12  DOM check: "Department" text absent from page body — candidate raised
T+00:12  DOM check: "PAN" text absent from page body — candidate raised
T+00:13  DOM check: Import PNR checkbox `checked` property = false — candidate raised
T+00:13  DOM check: Flight checkbox `checked=true, disabled=false` — candidate raised
T+00:14  Zoomed screenshot of Payment Option row — reveals ~25 non-payment-method checkboxes (person names, "m"/"f") mixed with Cash/Wallet/Credit Card/BANQUE MISR/Fawry — candidate raised
T+00:15  Probe: Post Office Box filled with 12-char alphanumeric value — accepted, no maxlength attribute, no error
T+00:15  Probe: Credit Limit filled with "abc123xyz789" — accepted in raw input; blur reveals inline error "Please enter a numeric value (with 2 decimal places allowed)."
T+00:16  Probe: Reaching Percentage filled with "150.1234" — blur reveals inline error "Reaching Percentage should not be greater than 100%" (AC's 100% cap confirmed enforced)
T+00:16  Probe: Warning Prompt(Days) filled with 14-digit value — accepted, no maxlength attribute, no error
T+00:17  Screenshot: Create Branch full page after boundary probes, with visible inline errors under Credit Limit and Reaching Percentage (evidence/05-create-branch-after-probes.png)
T+00:18  Fresh navigation #2 to /admin/branch/add (recovery attempt for Payment Option/Import PNR/Flight candidates per §5.7 "Unexpected UI rendering") — all three conditions persisted
T+00:18  DOM check: "Search Supplier Credentials PCC" and "Ticketing Supplier Credential PCC" text both absent from page body — confirms AC (PCC fields correctly removed from UI)
T+00:19  Probe: Credit Limit filled with 16-digit numeric value ("1234567890123456") — accepted in full, no maxlength attribute, no error
T+00:19  Click Credit Card checkbox (recovery attempt #2 for Payment Gateway candidate, per §5.7) — no "Payment Gateway" text appears before or after, on this second independent attempt
T+00:20  FINDING-001 created (Category: Bug) — Payment Option checkbox pollution
T+00:20  FINDING-002 created (Category: Bug) — Post Office Box max-length
T+00:20  FINDING-003 created (Category: Bug) — Credit Limit max-length
T+00:20  FINDING-004 created (Category: Bug) — Warning Prompt max-length
T+00:20  FINDING-005 created (Category: Bug) — Import PNR default unchecked
T+00:20  FINDING-006 created (Category: Requirement Gap) — Flight checkbox editable
T+00:20  FINDING-007 created (Category: Bug) — no Payment Gateway on Credit Card
T+00:20  FINDING-008 created (Category: Requirement Gap) — PAN Number absent
T+00:20  FINDING-009 created (Category: Requirement Gap) — Department absent
T+00:20  FINDING-010 created (Category: Requirement Gap) — undocumented Outstanding Threshold
T+00:20  FINDING-011 created (Category: Bug) — Submit button label mismatch
T+00:21  Stage 2 end — Explore module: branch (User Story-scoped strategy; Create Branch screen only)
```
