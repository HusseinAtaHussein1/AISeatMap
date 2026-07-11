# Discovery Snapshot — Login (Validation Sweep & Brute-Force Probe)

- **Run:** RUN-20260706-002
- **Timestamp:** 2026-07-06T14:12Z–14:20Z

## Empty-form submission

Both fields show client-side `Required` inline messages on empty submit. Screenshot: `screenshots/login_empty_submit.png`. Consistent with `RUN-20260706-001`'s baseline.

## Validation boundary sweep (abbreviated re-confirmation)

| Boundary condition | Result |
|---|---|
| Emoji (Username) | **"Unexpected error occurred"** — see FINDING-001 |
| Emoji (Password only) | "Invalid credentials" — normal, confirms Username-field isolation |
| SQL injection payload (both fields) | "Invalid credentials" — normal, no bypass |

Special characters/XSS and long-input boundary conditions were not independently re-run this run (time-scoped decision, disclosed in FINDING-001's Investigation Notes) — both were confirmed clean under `RUN-20260706-001`.

## Brute-force probe (Carried-Forward Risk #1)

3 consecutive failed logins against `Admin` with different wrong passwords — all returned identical `"Invalid credentials"` + HTTP `302`, no lockout/CAPTCHA/delay/rate-limit headers on any attempt. Screenshot: `screenshots/login_bruteforce_attempt3.png`. Full detail: `findings/FINDING-002_NoBruteForceProtection/metadata.md`.

**Carried-Forward Risk #1 status: Re-confirmed** (3rd independent confirmation across this project's two runs).

## Console

0 errors/0 warnings across every state above (only the recurring benign autocomplete-attribute notice), consistent with Carried-Forward Observation #8 (NFR-1).
