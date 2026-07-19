# NDC — Coverage Summary (RUN-20260712-001)

**Run:** RUN-20260712-001 · **Stage:** 2 — Explorer Agent · Reconciled against Project Context v2 §2 Modules In Scope.

## Visited Screens

| Screen | Module | Discovery Mode |
|---|---|---|
| Login screen (`/auth/login`, pre-auth) | Login / Authentication | Browser Automation |
| Post-login landing (`/dashboard`) | Confirmed only as the login success signal — not itself in scope | Browser Automation |

## Visited Components

| Component | Notes | Discovery Mode |
|---|---|---|
| Username/Password form | Two inputs, one submit button | Browser Automation |
| "Forgot Password?" link | Presence confirmed only — flow not exercised (out of scope, Project Context v2 §3) | Browser Automation |

## Skipped Areas

- "Forgot Password?" flow — explicitly out of scope this run (Project Context v2 §3), not a Discovery gap.

## Blocked Areas
_None._

## Unreachable Areas
_None._

## Coverage %

**In-scope surface (Project Context v2 §2):** 1 area — Login screen. **Visited:** 1/1 = **100%** of declared in-scope surface. This is a narrow, deliberately-scoped Spike — 100% coverage reflects the scope's small size, not exhaustive login-security coverage (see Deferred items below).

## Deferred (not a Coverage Gap in the usual sense — an explicit scope exclusion)

Lockout/brute-force/rate-limiting/security-input scenarios were deliberately not attempted this run, per the shared-env negative-testing default (Project Context v2 §5). Recorded here for traceability into Stage 3's Coverage Report, not because Discovery failed to reach them.
