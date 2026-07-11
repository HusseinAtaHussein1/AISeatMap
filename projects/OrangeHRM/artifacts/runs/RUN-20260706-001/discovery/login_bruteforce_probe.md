# Discovery Snapshot — Login (Brute-Force Probe)

- **Run:** RUN-20260706-001
- **Project Context:** `artifacts/OrangeHRM/context/OrangeHRM_ProjectContext.md` (v1, Approved)
- **Module (In Scope):** Login / Authentication & Access
- **URL:** https://opensource-demo.orangehrmlive.com/web/index.php/auth/login
- **Timestamp:** 2026-07-06T10:33Z–10:34Z
- **Browser:** Chromium (Playwright MCP)
- **Logged-in user:** none (unauthenticated) throughout the probe

## Carried-Forward Risk #1 (SR-5 — brute-force protection)

5 consecutive failed login attempts submitted against the known-valid `Admin` username, each with a different wrong password, in immediate succession (~1 request/second):

| Attempt | Password | Result |
|---|---|---|
| 1 | `wrongpass1` | "Invalid credentials" |
| 2 | `wrongpass2` | "Invalid credentials" |
| 3 | `wrongpass3` | "Invalid credentials" |
| 4 | `wrongpass4` | "Invalid credentials" |
| 5 | `wrongpass5` | "Invalid credentials" |

No CAPTCHA, lockout message, increasing delay, or rate-limit response header (`Retry-After`, `X-RateLimit-*`, etc.) appeared on any attempt. Full detail and evidence in `artifacts/OrangeHRM/runs/RUN-20260706-001/findings/FINDING-002_NoBruteForceProtection/metadata.md`.

**Carried-Forward Risk #1 status: Re-confirmed** — the absence of a visible brute-force control observed in the prior legacy-pipeline exploration still holds under this run's re-test.
