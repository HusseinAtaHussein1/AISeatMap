> **Status:** `Pending Review` — awaiting Human Review checkpoint (QA Lead), per `pipeline/pipeline.md` §5.1.
> **Run:** RUN-20260706-001, Stage 2 (Explorer Agent), under the `workflows/first_run.md` First Run workflow.
> **Scope:** Login / Authentication & Access only, per `artifacts/OrangeHRM/context/OrangeHRM_ProjectContext.md` (v1, Approved).
> **Location note:** This report, and every other Stage 2 artifact produced by this run (discovery snapshots, Findings Summary, Finding evidence packages), lives entirely under `artifacts/OrangeHRM/runs/RUN-20260706-001/` rather than the flat `artifacts/OrangeHRM/Reports/`, `discovery/`, `findings/` paths that `agents/explorer_agent.md` and `pipeline/pipeline.md` nominally specify. This is a deliberate adaptation for this bootstrap/reconciliation run: the flat `Reports/` path already holds a pre-existing legacy-pipeline `QA_Assessment_Report.md` (produced under the old 4-stage Explorer→Knowledge→TestDesign→Automation pipeline), which must be preserved immutably, unmodified, and un-renamed, at its original path. Keeping this run's output entirely inside the Run Workspace avoids any path collision or risk to that legacy artifact while this reconciliation is worked out. It does **not** supersede, invalidate, or re-validate the legacy report's content for the modules that report covers (Admin/PIM/Leave/Time/Recruitment/Performance/Directory/Maintenance) — this report's scope is Login only.

# QA Assessment Report — OrangeHRM (Login / Authentication & Access)

## 1. Application Overview

OrangeHRM OS 5.8 presents an unauthenticated login screen at `/web/index.php/auth/login` as the sole entry point for the application. The screen exposes exactly two fields (Username, Password), a Login button, and a "Forgot your password?" link. As a demo-instance convenience, the page also statically displays the valid demo credentials ("Username : Admin", "Password : admin123") — not a documented requirement, simply an observed convenience for this public demo. Authentication is handled via a standard HTML form POST to `/web/index.php/auth/validate`, which responds with an HTTP `302` redirect back to `/web/index.php/auth/login` (rendering either an "Invalid credentials" message or, on success, redirecting onward) rather than an XHR/JSON API — consistent with a traditional server-rendered PHP application (nginx/1.18.0 Ubuntu backend, per response headers).

## 2. Feature Inventory (Sitemap + Business Modules + Key Reusable Components)

In-scope surface for this run:

- `/web/index.php/auth/login` — Login form
- `/web/index.php/auth/validate` — form-POST credential validation endpoint (302 redirect, no distinct JSON API)
- `/web/index.php/auth/requestPasswordResetCode` — Forgot Password: enter username
- `/web/index.php/auth/requestResetPassword` / `/web/index.php/auth/sendPasswordReset` — Forgot Password: submission/result endpoints
- Post-login redirect target — confirmed to return to the originally-requested protected URL when one was pending (deep-link case), not merely to a fixed Dashboard default

Reusable components observed: the `role="alert"` banner pattern used for both login failures and (implicitly) other form-level errors across the app; the profile dropdown (avatar + display name, top-right) exposing "Logout" — the same pattern presumably used to reach other profile-menu items (About/Support/Change Password) per the legacy PRD's NFR-2, though those were not re-opened in this run (out of scope).

No sidebar module content (Admin, PIM, Leave, Time, Recruitment, My Info, Performance, Dashboard, Directory, Maintenance) was explored, per Project Context §3.

## 3. User Workflows

1. **Standard login** — enter valid Username/Password → redirect away from `/auth/login`. Confirmed.
2. **Failed login** — enter invalid credentials of any kind (wrong username, wrong password, empty, boundary-condition input) → `"Invalid credentials"` alert, remains on `/auth/login`. Confirmed, with one input-class exception (see Finding FINDING-001).
3. **Unauthenticated deep-link access** — request a protected URL directly while logged out → redirected to `/auth/login`; upon subsequent successful login, redirected onward to the originally-requested URL rather than a fixed default landing page. Confirmed for a second URL beyond the one previously confirmed in the legacy exploration.
4. **Forgot Password** — enter a username → expected generic success message. Confirmed working correctly **only for unknown/invalid usernames**; confirmed **broken** (504 Gateway Time-out) for the one known/valid username tested (`Admin`). See Findings FINDING-003/FINDING-004.
5. **Logout** — via profile dropdown → returns cleanly to `/auth/login`. Confirmed.

## 4. Risk Analysis

| Risk | Status this run | Related Finding(s) |
|---|---|---|
| No visible brute-force protection (SR-5) | Re-confirmed still absent (5/5 failed attempts, no lockout/CAPTCHA/delay/rate-limit headers) | FINDING-002 |
| Auth-gated deep links — partial verification (SR-1/FR-2) | Further corroborated (2nd distinct URL now confirmed to redirect-and-return correctly); PRD's "not verified for every module URL" caveat still technically stands with only 2 URLs sampled | — (positive confirmation, no new Finding) |
| Forgot Password anti-enumeration (SR-3/FR-3) | **New risk surfaced, more severe than previously known:** the flow is not merely equal-message for valid/invalid usernames — it is completely non-functional (504) for valid usernames while working normally for invalid ones, itself a stronger enumeration signal than any message-text difference would be | FINDING-003, FINDING-004 |
| Login form UI/console stability (NFR-1) | Held for the Login form itself across every state tested (0 console errors); **did not hold** for the Forgot Password flow's failure path (2 console errors during the 504 case) | Noted in `discovery/forgot_password_flow.md`; not escalated to its own Finding since it is a symptom of FINDING-003, not a separate condition |

New risk identified in this run, not previously carried forward: the Username field's handling of emoji/supplementary-plane Unicode input produces a distinct, generic server error rather than the normal "Invalid credentials" path (FINDING-001) — a narrower, input-handling-specific risk not previously documented in the PRD.

## 5. Regression Test Candidates

For the Test Design Agent's consideration when deriving the Login manual test suite:

- Valid login (Admin/admin123) → redirect confirmation
- Invalid credentials (multiple variants: wrong username, wrong password, both wrong) → "Invalid credentials"
- Empty-form submission → client-side "Required" on both fields
- 5x repeated failed login → no lockout/CAPTCHA (regression-worthy: confirm this remains the documented, accepted behavior rather than an unnoticed regression if a lockout control is ever added)
- Deep-link redirect-and-return for at least one protected URL
- Forgot Password with a valid, existing username → **must not** 504; must return the generic success message (currently failing — see FINDING-003)
- Forgot Password with an invalid username → generic success message (currently passing)
- Username field emoji input → should not surface a distinct "Unexpected error occurred" path (currently failing — see FINDING-001)
- Logout → returns cleanly to Login

## 6. Exploratory Testing Findings

Four Findings were raised and finalized during this run; full detail lives in each Finding's own evidence package under `artifacts/OrangeHRM/runs/RUN-20260706-001/findings/`, indexed in `artifacts/OrangeHRM/runs/RUN-20260706-001/findings/Findings_Summary.md`:

- **FINDING-001** — Security Concern, Medium, Needs Human Review — emoji in the Username field produces "Unexpected error occurred" instead of "Invalid credentials."
- **FINDING-002** — Security Concern, Low (PRD itself rates the underlying risk High — see the Finding's own Investigation Notes for why this Explorer Agent's severity matrix and the PRD's rating diverge), Needs Human Review — no brute-force protection observed across 5 attempts.
- **FINDING-003** — Bug, High, Confirmed — Forgot Password times out (504) for the valid username `Admin`, contradicting PRD FR-3.
- **FINDING-004** — Security Concern, Medium, Needs Human Review — the 504-vs-success asymmetry between valid and invalid usernames is itself a username-enumeration side channel.

## 7. Gap Analysis — Documented (Project Context) vs. Observed (Application)

| Documented (Project Context / PRD) | Observed | Gap Type |
|---|---|---|
| FR-3/SR-3: Forgot Password returns identical generic success message for valid and invalid usernames | Valid username → 504 timeout, no message at all; invalid username → message, quickly | **Contradiction** — the documented anti-enumeration guarantee does not hold in its strongest, behavior-inclusive sense (see FINDING-003/004) |
| SR-5: no visible brute-force protection (documented as an existing, known risk) | Re-confirmed unchanged | **Match** — application behavior matches the already-documented risk; no new gap |
| SR-1/FR-2: deep-link redirect-and-return, previously confirmed for one URL only | Confirmed working for a second, different URL | **Match / partial resolution** — reduces but does not eliminate the "not verified for every module URL" caveat |
| NFR-1: no console errors observed across login/logout/forgot-password flows | Held for login/logout; **did not hold** for the Forgot Password failure path (2 console errors) | **Contradiction**, scoped narrowly to the one failing flow |
| (Not documented at all) Username field's handling of emoji/non-BMP Unicode input | Produces a distinct "Unexpected error occurred" error path | **Missing Requirement** — the Project Context/PRD is silent on this input class entirely; this is a documentation gap, not a contradiction, since there was nothing to contradict |
| (Not documented) The Login page statically displays valid demo credentials as help text | Observed on every load | **Missing Requirement** — a demo-environment convenience with no corresponding PRD statement either way |

## 8. Assumptions

- The differing outcome between valid- and invalid-username Forgot Password submissions is assumed to stem from some processing step specific to real accounts (e.g., an email-send or token-persistence step) rather than a client-side or routing issue, based on the request reaching a distinct URL (`/auth/requestResetPassword`) and failing at the infrastructure level (nginx 504) rather than failing to route at all — this is an inference from black-box behavior, not confirmed via any server-side visibility.
- The single successful login performed in this run is assumed representative of "a" successful login for FR-1/FR-2 verification purposes; only one such login was authorized and performed per the Project Context's Environment Constraints, so this run does not independently re-verify that every possible login path (e.g., repeated successful logins, concurrent sessions) behaves identically.

## 9. Open Questions

1. Is the Forgot Password 504 (FINDING-003) reproducible outside this shared public demo environment, or is it specific to this instance's current load/configuration? Cannot be resolved without access to a second, isolated environment or server-side logs — out of scope for browser-only exploration.
2. Should the anti-enumeration requirement (FR-3/SR-3) be understood to cover response-timing/availability symmetry, or message-text symmetry only (see FINDING-004)? This is a requirements-scope question for the Product Owner, not something resolvable by further exploration.
3. Is the emoji-input server error (FINDING-001) a known, accepted limitation of this specific demo build, or a genuine defect worth fixing? Requires developer/vendor input, not further black-box testing.
