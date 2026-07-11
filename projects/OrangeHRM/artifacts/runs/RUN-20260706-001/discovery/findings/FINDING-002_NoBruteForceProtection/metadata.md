# FINDING-002

- **Finding Type:** Security Concern
- **Severity:** Low *(see Investigation Notes — ambiguity against the PRD's own "High" risk rating)*
- **Confidence:** 95%
- **Status:** Needs Human Review

## Description

Five consecutive failed login attempts against the known-valid `Admin` username, each with a different wrong password, submitted in immediate succession, produced no visible brute-force/credential-stuffing protection: no CAPTCHA, no account lockout, no increasing delay, and no rate-limit-related HTTP headers on any attempt.

## Expected Behavior

Not defined in Project Context as a hard requirement to implement lockout — the Project Context (§6, Carried-Forward Risk #1) instructs the Explorer Agent to *re-attempt a small number of failed logins and observe* whether any lockout, delay, throttling, or CAPTCHA appears; it does not assert that such a control must exist. PRD §10 SR-5 independently documents this as a pre-existing, already-known risk ("no such control was observed in the UI... a confirmed absence of visible control, not a confirmed vulnerability, since server-side enforcement may exist without UI feedback").

## Actual Behavior

5 consecutive `POST /web/index.php/auth/validate` requests (Username=`Admin`, Password=`wrongpass1`…`wrongpass5`) each returned an identical `302` redirect to `/web/index.php/auth/login` with identical response headers (no `Retry-After`, `X-RateLimit-*`, or similar throttling headers present on any attempt — see `network.log`). Every attempt rendered the same `"Invalid credentials"` alert with no growing latency and no CAPTCHA challenge introduced after any attempt, including the 5th.

## Steps to Reproduce

1. Navigate to `https://opensource-demo.orangehrmlive.com/web/index.php/auth/login` (unauthenticated).
2. Submit Username=`Admin`, Password=`<any wrong value>`, click Login.
3. Repeat step 2 four more times (5 total), each with a different wrong password.
4. Observe: no lockout, delay, throttling indicator, or CAPTCHA appears on any of the 5 attempts.

## Related Module

Login / Authentication & Access (in scope per Project Context §2)

## Related User Journey

Repeated login-failure handling (PRD §10 SR-5)

## Retry Result

Not applicable — this Finding's own investigation *is* the "retry-like" repeated-attempt probe called for by the Project Context's Carried-Forward Risk #1; the Retry Policy (§5.6) governs retrying an *ambiguous observation* to validate it, not this deliberate 5-attempt security probe itself. Each of the 5 attempts was validated directly (identical, unambiguous "Invalid credentials" + `302` result each time — no retry needed to confirm what was observed).

## Investigation Notes

This candidate falls under the Authorization category of Investigation Mode (§5.7: "Session expiration" and account-access boundary conditions are the closest listed items; repeated-failed-login lockout behavior is the specific boundary condition named explicitly by the Project Context's Carried-Forward Risk #1, which supersedes the generic category list for this run). Probed boundary: 5 repeated failed attempts against a single known-valid account, in quick succession (~1 request/second) — the "small, reasonable number of probe attempts" ceiling set by the Project Context's Environment Constraints (§5). No further escalation (e.g., dozens/hundreds of attempts) was performed, per that same constraint — this is a probe of the risk, not an attempt to actually defeat any protection that might exist server-side.

**Severity ambiguity, recorded per §5.3's explicit rule:** this observed condition does not cleanly match any of this Explorer Agent's own Critical/High/Medium/Low criteria (it is not application unavailability, a blocked core workflow, a validation/business-rule inconsistency, nor a cosmetic issue — it is the *absence* of a security control). Per §5.3, the correct default in that case is **Low**, which is what is recorded above. This is flagged explicitly because the source PRD (§14 Risks) independently rates this same underlying condition as a **High**-impact risk. This Finding does not override that PRD rating (nor does it inherit it, per the Explorer Agent's instruction to classify by its own matrix, not by intuition or by re-stating an upstream document's rating) — the discrepancy itself is what is being surfaced here for the human reviewer to resolve, exactly the kind of judgment call this agent is required to escalate rather than silently pick a side on (§4, Core Philosophy #4).

Post-probe account-lockout check: immediately following this probe, a 6th attempt using the *correct* credentials (`Admin` / `admin123`) succeeded normally (see the successful-login discovery snapshot) — confirming the account was not locked out by the 5 prior failures, consistent with "no lockout control observed."

## Occurrence Count

1

## Evidence List

- `after.png` — screenshot after the 5th consecutive failed attempt, showing the unchanged "Invalid credentials" state with no lockout/CAPTCHA UI
- `network.log` — the 5 `POST /web/index.php/auth/validate` requests, each `302`, with response headers captured showing no rate-limiting headers on any attempt
- Not captured: a `before.png`/video of the full 5-attempt sequence (each intermediate state is materially identical to the others and to `after.png`; capturing all 5 would not add information beyond what `network.log`'s 5 identical entries already document)
- Console: 0 errors/warnings across the sequence (not saved as a separate file for this Finding — identical to the console state already documented in `FINDING-001`'s `console.log`, captured minutes earlier in the same session)

## Recommendation

Confirm with the Product Owner / Security stakeholder whether server-side rate-limiting, lockout, or CAPTCHA is intentionally deferred for this open-source demo build (a reasonable choice for a public demo that must remain accessible) or whether it is a genuine gap that should be remediated before this codebase is used in a non-demo deployment. If deferred intentionally, downgrade this risk's tracked severity to reflect that decision; if not, treat per the PRD's own "High" impact rating (§14) rather than this Finding's spec-driven Low default.
