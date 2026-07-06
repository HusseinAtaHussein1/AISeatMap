# FINDING-003

- **Finding Type:** Bug
- **Severity:** High
- **Confidence:** 98%
- **Status:** Confirmed

## Description

Submitting the Forgot Password ("Reset Password") form with the known, valid username `Admin` does not return the expected generic success message. Instead, the request hangs until the reverse proxy times it out, and the browser is delivered a raw `504 Gateway Time-out` error page (`nginx/1.18.0 (Ubuntu)`). Reproduced identically on 2 of 2 attempts.

## Expected Behavior

Per Project Context §6 Carried-Forward Assumption #3 (quoting PRD §5.1 FR-3 / §10 SR-3): *"A 'Forgot Password' flow must accept a username and return a generic success message regardless of whether the username exists (anti-enumeration)."* This is a clearly documented, unambiguous functional requirement — the flow must return a generic success message for a submitted username, full stop.

## Actual Behavior

- Username = `Admin` (the known, valid account used throughout this run) → the browser navigates to `https://opensource-demo.orangehrmlive.com/web/index.php/auth/requestResetPassword`, which returns HTTP `504` and renders nginx's default Gateway Time-out page — no success message, no error message from the application itself, nothing PRD-FR-3-compliant is returned at all.
- Reproduced twice (see Retry Result below), byte-for-byte identical outcome both times: `504 Gateway Time-out`, 1–2 console errors (`Failed to load resource: the server responded with a status of 504`), page title literally becomes `504 Gateway Time-out`.
- By contrast, the same flow with an unknown/nonexistent username returns normally within ~1 second with the expected `"Reset Password link sent successfully"` message (see `FINDING-004_ForgotPasswordEnumerationViaTimeout`, which covers the security implication of this asymmetry separately from this Finding's functional-defect framing).

## Steps to Reproduce

1. From the Login page, click "Forgot your password?" → lands on `/web/index.php/auth/requestPasswordResetCode`.
2. Enter `Admin` in the Username field.
3. Click "Reset Password".
4. Observe the page navigates to `/web/index.php/auth/requestResetPassword` and renders `504 Gateway Time-out` instead of a success message. Repeat steps 1–3 once more from a fresh page load — the same outcome recurs.

## Related Module

Login / Authentication & Access — Forgot Password flow (PRD §5.1 FR-3, §10 SR-3)

## Related User Journey

Password reset request for an existing account

## Retry Result

Failure category: **Timeout** (§5.6). Retry Policy applied: retried once after the first occurrence. Outcome: **persisted after retry** — the 504 recurred identically on the 2nd attempt. Per §5.6, having recurred on retry, performance/timing evidence was collected (see Evidence List) and the candidate proceeded to Finding creation per the policy's instruction.

## Investigation Notes

This candidate touches both Validation (username field) and, arguably, Navigation (the request results in navigating to a distinct error-page URL) — but the dominant, decisive boundary condition here was the Timeout/Retry Policy path, which was followed to completion (retry once, recurred, evidence collected) before classification. To isolate whether the failure was specific to the `Admin` username or a general endpoint outage, an unknown username (`nonexistent_user_xyz123`, then a second one `another_nonexistent_user_456`) was submitted immediately afterward through the same form — both succeeded normally and quickly (~1s), ruling out a blanket endpoint outage and confirming the failure is specific to submitting a **valid, existing** username. This isolation is the basis for the separate `FINDING-004` (Security Concern: the differential outcome itself functions as a username-enumeration side channel).

Classified as `Bug` rather than `Needs Human Review`-only `Observation`/`Unknown Behavior` because the contradicted requirement (FR-3/SR-3, carried forward verbatim into the Project Context) is unambiguous, and the observed failure (complete absence of the required generic success message, replaced by an infrastructure-level error) is unambiguous and was independently reproduced twice — satisfying §9 Rule 9's bar for a `Bug` classification (clearly documented requirement + supporting evidence + no reasonable doubt about what happened). `Status: Confirmed` for the same reason: there is no interpretive ambiguity about whether this satisfies FR-3 — it plainly does not.

Root cause is not determinable from black-box browser testing (plausible candidates include a slow/unreachable outbound email step specific to real accounts, a slow database write for the real account's reset token, or shared-demo-instance resource contention) — this Finding reports the observed contradiction of FR-3, not a diagnosis of why it occurs; root-causing is a developer/ops task.

## Occurrence Count

1 (encountered on 2 attempts against the same underlying condition — counted as one Finding per §5.8, not two)

## Evidence List

- `failure.png` — the rendered `504 Gateway Time-out` page after submitting username `Admin`
- `console.log` — console errors captured at the failure state (`Failed to load resource: 504` on `/auth/requestResetPassword`, plus an unrelated `404` on `/favicon.ico`)
- Not captured: HAR/full network timing for the hung request itself — the Playwright MCP network tool records completed requests; the request that ultimately 504'd was captured as its final `504` status but granular server-side timing (e.g., time-to-first-byte) was not separately instrumented. The `~30s` client-side timeout observed on the initial `browser_click` action is the closest timing signal available and is recorded here: the interaction that triggered the request did not return control until the gateway's own timeout elapsed.

## Recommendation

Escalate to the development team as a functional defect in the Forgot Password flow specific to existing accounts. Given `FINDING-004`'s security framing of the same root observation, prioritize accordingly — this is not merely "reset email is slow for real users," it is "the flow is completely non-functional for the one case (a real account) it exists to serve, while remaining fast for the case (a fake account) it exists to reject harmlessly."
