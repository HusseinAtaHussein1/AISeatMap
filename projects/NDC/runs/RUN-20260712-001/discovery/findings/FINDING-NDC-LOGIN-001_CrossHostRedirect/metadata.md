# FINDING-NDC-LOGIN-001 — Valid login redirects to a different host than the login screen

- **Category:** Observation
- **Severity:** Low — Severity Reason: no functional break observed; login succeeds and the Dashboard renders correctly. Defaults to Low per `agents/explorer_agent.md` §5.4 in the absence of a criterion this clearly matches.
- **Confidence Score:** 70%
- **Status:** Needs Human Review — per §11 rule 10, cannot reach `Confirmed` because the Project Context does not (and cannot, absent an architecture doc) define whether single-host or multi-host is the expected topology.
- **Evidence Category:** Direct Observation (Browser Automation) — the redirect itself is directly, reproducibly observed; what is *not* observable is intent.
- **Module:** Login / Authentication
- **Discovery Mode:** Browser Automation

## Observed Behaviour

1. Navigated to `http://192.168.1.70` (the login screen's own host, per `projects/NDC/browser/profile.json`'s `defaultBaseUrl`).
2. Authenticated successfully with a valid, existing project credential.
3. Browser was redirected to `http://192.168.1.80/dashboard` (title "NDC - Dashboard") — a **different IP** than the login screen's host.

## Evidence

- `post_login_redirect.png` — full-page screenshot of the post-login Dashboard, URL bar visible showing `192.168.1.80`.
- Raw discovery log: `../../_login_discovery_results.json` (`validLoginUrl` field).

## Root Cause Hypothesis (labeled as hypothesis, not fact)

Possibly a reverse-proxy/load-balancer arrangement where `.70` fronts authentication and `.80` serves the authenticated application — or simply two adjacent hosts on the same internal network serving different halves of the app. **Unconfirmed** — no internal architecture documentation exists yet to corroborate either explanation (this project's `architecture.md` does not document a multi-host topology).

**Update 2026-07-12 (secondary evidence, weaker category):** The Reference SHAFT Automation Project (`E:\Automation2\NDC-Uplift-Automation`, `src/test/java/AdminPages/Login/LogIn_TC.java`) asserts a *third* host after login — `http://192.168.1.90/admin/operating-country` — in its `LogInWithAdminValidData` test. This is Documentation-category evidence (an existing, unexecuted test's hardcoded expectation, not this run's own Direct Observation) and may simply be stale relative to today's live behavior, but it reinforces that the post-login host has moved/varied over time rather than being a one-off fluke. Does not upgrade this Finding's Status — still `Needs Human Review` — but strengthens the case for asking the infrastructure owner rather than assuming either `.80` or `.90` is "the" correct target.

## Recommendation

Confirm with the infrastructure/DevOps owner whether this is intentional. If intentional, `projects/NDC/browser/profile.json`'s `login.successSelector` (`text=Dashboard`) remains valid as-is (it does not assert a host), and no automation change is needed — but `defaultBaseUrl` should be revisited if any future screen needs to be reached directly by URL post-login. If unintentional, this may indicate a misconfigured redirect worth its own investigation.

## Missing Evidence

None — Smart Evidence Collection floor for an `Observation` category (screenshot + reproducible URL trace) is met.
