# Discovery Snapshot — Forgot Password Flow

- **Run:** RUN-20260706-002
- **Timestamp:** 2026-07-06T14:52Z–14:54Z

## Carried-Forward Risk #3 (SR-3 / FR-3)

| Username | Outcome |
|---|---|
| `Admin` (valid) | `504 Gateway Time-out` — no message ever returned |
| `nonexistent_user_run002` (invalid) | `"Reset Password link sent successfully"` — fast, normal |

**Status: Re-confirmed** (3rd independent confirmation across this project's two runs). Full detail: `findings/FINDING-005_ForgotPasswordTimeoutKnownUser/metadata.md` (functional-defect framing) and `findings/FINDING-006_ForgotPasswordEnumerationViaTimeout/metadata.md` (security/enumeration framing).

## Logout

Confirmed clean logout via direct navigation to `/auth/logout`, returning to `/auth/login`, prior to this test sequence.
