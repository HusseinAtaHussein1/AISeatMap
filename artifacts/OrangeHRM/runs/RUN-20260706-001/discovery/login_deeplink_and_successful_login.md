# Discovery Snapshot — Login (Deep-Link Redirect, Successful Login, Logout)

- **Run:** RUN-20260706-001
- **Project Context:** `artifacts/OrangeHRM/context/OrangeHRM_ProjectContext.md` (v1, Approved)
- **Module (In Scope):** Login / Authentication & Access
- **Timestamp:** 2026-07-06T10:36Z–10:37Z
- **Browser:** Chromium (Playwright MCP)

## Carried-Forward Risk #2 (SR-1 / FR-2 — auth-gated deep links, partial verification)

1. **Unauthenticated deep-link attempt.** Navigated directly to `https://opensource-demo.orangehrmlive.com/web/index.php/pim/viewEmployeeList` (a protected URL, PIM module — out of scope for content, used here only as a redirect-behavior probe target) while logged out.
   - Result: `GET /pim/viewEmployeeList` → `302` → `GET /web/index.php/auth/login` → `200`. Confirmed redirect-to-login. Screenshot: `artifacts/OrangeHRM/runs/RUN-20260706-001/screenshots/deeplink_redirect_to_login.png`.
   - The `302` response's `Location` header pointed to a plain `/web/index.php/auth/login` with no visible query parameter carrying the original destination — the "remembered" destination is evidently tracked server-side (session), not via a URL parameter.

2. **Single authorized successful login** (Admin / admin123, per Project Context §5), performed from the login page reached in step 1.
   - Result: successful login redirected directly to `https://opensource-demo.orangehrmlive.com/web/index.php/pim/viewEmployeeList` — the **originally requested URL**, not the default Dashboard landing page. Screenshot: `artifacts/OrangeHRM/runs/RUN-20260706-001/screenshots/deeplink_return_after_login.png`.
   - This directly confirms the redirect-and-return pattern (PRD FR-2 / SR-1) holds for a **second** URL beyond the one previously confirmed in the legacy exploration (Admin > System Users) — **Carried-Forward Risk #2 is further corroborated, reducing (not eliminating) its "partial verification" status.** Only one additional URL was tested in this run (per the single-successful-login constraint); the PRD's own caveat — "not verified for every module URL" — still technically stands, since 2 of many possible protected URLs is still a sample, not exhaustive coverage.
   - No PIM module content was explored beyond confirming the URL and taking the one evidence screenshot above — per Project Context §5, exploration stopped immediately at redirect confirmation.

3. **Logout**, performed immediately per Project Context §5 ("Log out... once the redirect is confirmed"), via the profile dropdown (top-right, labeled with the logged-in user's display name) → "Logout" link.
   - Result: returned cleanly to `https://opensource-demo.orangehrmlive.com/web/index.php/auth/login`. Screenshot: `artifacts/OrangeHRM/runs/RUN-20260706-001/screenshots/logout_confirmed.png`.

## Console

No console errors or warnings observed across this entire sequence (deep-link redirect, login, one PIM page load, logout) — consistent with Carried-Forward Observation #4 (NFR-1).

## Post-Probe Account State Check

This successful login also confirms the `Admin` account was **not** locked out by the 5 immediately-preceding failed-login attempts (`FINDING-002_NoBruteForceProtection`) — the correct credentials worked normally on the very next attempt after the brute-force probe.
