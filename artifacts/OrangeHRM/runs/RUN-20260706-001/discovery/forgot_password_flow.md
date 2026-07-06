# Discovery Snapshot — Forgot Password Flow

- **Run:** RUN-20260706-001
- **Project Context:** `artifacts/OrangeHRM/context/OrangeHRM_ProjectContext.md` (v1, Approved)
- **Module (In Scope):** Login / Authentication & Access
- **URL:** https://opensource-demo.orangehrmlive.com/web/index.php/auth/requestPasswordResetCode
- **Timestamp:** 2026-07-06T10:38Z–10:42Z
- **Browser:** Chromium (Playwright MCP)
- **Logged-in user:** none (unauthenticated) throughout

## Initial State

Reached via the Login page's "Forgot your password?" link. Form: heading "Reset Password", instructional text "Please enter your username to identify your account to reset your password", a single Username textbox, and Cancel/Reset Password buttons. Screenshot: `artifacts/OrangeHRM/runs/RUN-20260706-001/screenshots/forgot_password_initial.png`.

## Carried-Forward Risk #3 (SR-3 / FR-3 — anti-enumeration)

| Username submitted | Outcome |
|---|---|
| `Admin` (valid) — attempt 1 | `504 Gateway Time-out` (no message returned) |
| `Admin` (valid) — attempt 2 (retry per §5.6) | `504 Gateway Time-out` again (identical) |
| `nonexistent_user_xyz123` (invalid) | `"Reset Password link sent successfully"` — normal, fast |
| `another_nonexistent_user_456` (invalid) | `"Reset Password link sent successfully"` — normal, fast |

**Carried-Forward Risk #3 status: Partially refuted.** The specific claim previously confirmed in the legacy exploration — that the *message text* is identical for valid/invalid usernames — was not re-exercised for the valid-username case in this run, because that case never reaches a message at all; it times out. What this run instead surfaces is a **more fundamental anti-enumeration failure**: username validity is trivially distinguishable by which of two very different outcomes (fast success vs. slow failure) occurs. Full detail in `FINDING-003_ForgotPasswordTimeoutKnownUser` (the functional defect) and `FINDING-004_ForgotPasswordEnumerationViaTimeout` (the enumeration-channel framing of the same observation).

## Console

2 console errors recorded during the Admin-username 504 case (`Failed to load resource: 504` on `/auth/requestResetPassword`, and an unrelated `404` on `/favicon.ico`); 0 errors during either unknown-username case. This is the first departure from Carried-Forward Observation #4's "no console errors" baseline observed in this run — scoped specifically to the failing Forgot Password path, not the Login form itself (which remained error-free throughout, per `login_validation_states.md` and `login_bruteforce_probe.md`).
