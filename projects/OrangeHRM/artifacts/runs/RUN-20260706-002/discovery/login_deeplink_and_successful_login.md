# Discovery Snapshot — Login (Deep-Link Redirect + Successful Login)

- **Run:** RUN-20260706-002
- **Timestamp:** 2026-07-06T14:22Z

## Carried-Forward Risk #2 (SR-1 / FR-2)

1. Attempted to navigate unauthenticated to `https://opensource-demo.orangehrmlive.com/web/index.php/directory/viewDirectory` as a redirect-probe target — encountered a genuine **Timeout** (Event-Driven Capture trigger), retried once per the Investigation & Recovery Engine (§5.7), and on retry received `net::ERR_HTTP_RESPONSE_CODE_FAILURE`. Since Directory is out of scope for this run (Project Context §3), this was **not investigated further as a Finding** — Directory's own content/behavior is not something this run is authorized to explore. Logged as an Open Question in the QA Assessment Report rather than escalated.
2. Pivoted to an in-scope target instead: `https://opensource-demo.orangehrmlive.com/web/index.php/pim/viewEmployeeList` (unauthenticated) → `302` → redirected to `/auth/login` correctly. Screenshot: `screenshots/deeplink_redirect_to_login.png`.
3. **Single authorized successful login** (Admin/admin123) performed from this login page → redirected directly to `https://opensource-demo.orangehrmlive.com/web/index.php/pim/viewEmployeeList`, the originally-requested URL. Screenshot: `screenshots/deeplink_return_after_login.png`.

**Carried-Forward Risk #2 status:** further corroborated — redirect-and-return now independently confirmed for a 3rd distinct URL across this project's two runs (Admin > System Users [legacy], PIM Employee List [`RUN-20260706-001`], and again here). The PRD's own "not verified for every module URL" caveat still technically stands (a sample, not exhaustive), but is increasingly well-supported.

Since the redirect landed on an in-scope PIM URL, exploration continues directly into PIM (§4 below) from this authenticated session, rather than logging out — consistent with Project Context §5's instruction to stop only at out-of-scope boundaries, not at every opportunity to log out.
