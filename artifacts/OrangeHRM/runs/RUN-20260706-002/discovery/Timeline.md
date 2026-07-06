# Timeline — RUN-20260706-002 (Explorer Agent v2)

Chronological log of significant actions and events. Maintained per `agents/explorer_agent.md` §6.

| Time (UTC) | Event |
|---|---|
| 14:12 | Stage 2 (Explorer Agent v2) started. Scope: Login + PIM (read/search/validate only), per `OrangeHRM_ProjectContext.v2.md`. |
| 14:12 | Login page loaded. 0 console errors. |
| 14:12 | Empty-form submit → client-side `Required` validation confirmed. |
| 14:13 | Emoji-in-Username submitted → `"Unexpected error occurred"` (Event-Driven Capture: distinct from normal "Invalid credentials"). Isolated to Username field via password-only-emoji control test. SQL-injection payload tested — normal, no bypass. → **FINDING-001 created.** |
| 14:19 | Brute-force probe: 3 consecutive failed logins against `Admin` — no lockout/CAPTCHA/delay/rate-limit signal on any attempt. → **FINDING-002 created.** |
| 14:22 | Deep-link probe: unauthenticated navigation to Directory URL → Timeout (Event-Driven Capture), retried once → `ERR_HTTP_RESPONSE_CODE_FAILURE`; pivoted to in-scope PIM URL instead (Directory itself out of scope) — logged as Open Question, not escalated to a Finding. |
| 14:22 | Unauthenticated navigation to `/pim/viewEmployeeList` → correctly redirected to `/auth/login`. |
| 14:23 | Single authorized successful login (Admin/admin123) → redirected directly to the originally-requested `/pim/viewEmployeeList` — FR-2/SR-1 redirect-and-return confirmed for a 3rd distinct URL across this project. |
| 14:23 | PIM Employee List loaded — (95) Records Found, up from the PRD's documented ~50-53 (data growth since PRD reconstruction — Observation, not a Finding). Data-quality issues (duplicate names, garbled entries, literal "ATPValue" IDs) still present, matching PRD-documented risk. |
| 14:24 | Filter panel expanded — confirmed FR-6's 7 filter fields present exactly as documented. |
| 14:24 | Employee Id filter tested with `ZZZ-NONEXISTENT-99999` → Event-Driven Capture (console error, HTTP 422) — UI silently left stale "(95) Records Found" on screen with no error shown. |
| 14:24–14:07 | Isolated via binary search: 10 characters → `200`; 11 characters → `422`. Confirmed length-only trigger (not character class). → **FINDING-003 created.** |
| 14:07 | Navigated to Add Employee. Structure matches FR-9 exactly. |
| 14:08 | Empty-form Save click → `Required` validation confirmed (VR-1); no employee created. |
| 14:08 | Employee Id field: emoji + long string → live uniqueness-check endpoint returned HTTP `500`. Isolated to a single emoji character alone (length-independent). Full Name left blank throughout — no employee ever persisted. → **FINDING-004 created**, cross-referenced to FINDING-001 (same emoji/encoding root-cause class, second independent confirmation). |
| 14:10 | Navigated to PIM Employee List, clicked into an existing employee's detail view (empNumber 104). |
| 14:11 | Personal Details tab confirmed matches FR-11 exactly; record's own name fields are garbled test data (`A8DCo`/`4Ys`/`010Z`) — re-confirms PIM data-quality risk as an Observation. |
| 14:12 | Job Details tab loaded cleanly under the same `empNumber/104` (BR-3 stable identifier confirmed). 0 console errors. No field edited/saved on any tab. |
| 14:12 | Logged out cleanly, returned to `/auth/login`. |
| 14:12 | Forgot Password: `Admin` (valid) → `504 Gateway Time-out`, no message. → **FINDING-005 created.** |
| 14:14 | Forgot Password: `nonexistent_user_run002` (invalid) → fast, normal success message, confirming the differential pattern a 3rd time across this project. → **FINDING-006 created.** |
| 14:15 | Browser closed. Stage 2 exploration complete. |
