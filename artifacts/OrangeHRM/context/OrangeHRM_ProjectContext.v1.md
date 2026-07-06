> **Status:** `Approved` — cleared the Human Review checkpoint (reviewer: Aymoon, Business Analyst / Product Owner role, 2026-07-06) per `pipeline/pipeline.md` §5.1. This is version `v1`. The unsuffixed "current approved" pointer (`OrangeHRM_ProjectContext.md`) has been created as an identical copy of this version, per `pipeline/pipeline.md` §7.
> **Run:** Produced under `RUN-20260706-001` as part of the `workflows/first_run.md` First Run workflow.
> **Source PRD:** `artifacts/OrangeHRM/knowledge/OrangeHRM_PRD.md`

# OrangeHRM — Project Context (v1)

## 1. Scope Summary

This run validates the Agentic AI Testing Platform's operational readiness (the "First Run" workflow, `workflows/first_run.md`) against OrangeHRM's **Login / Authentication & Access** functionality only. "Login" is not one of the ten sidebar modules listed in the PRD's Core Modules table (§4 of the PRD) — it refers to the PRD's §5.1 "Authentication & Access" functional area (the login form, its validation/error behavior, the Forgot Password flow, and unauthenticated-access redirect behavior). No sidebar module's content (Admin, PIM, Leave, Time, Recruitment, My Info, Performance, Dashboard, Directory, Maintenance) is in scope for this run, including the landing page/Dashboard content reached immediately after a successful login — only the fact that a successful login redirects away from the login page is in scope, not what that destination page contains.

## 2. Modules In Scope

- **Login / Authentication & Access** — the login form itself, credential validation and error messaging, the "Forgot Password" flow, and unauthenticated-access redirect behavior for protected URLs (PRD §5.1: FR-1 through FR-4).

## 3. Modules Out of Scope

All ten sidebar modules from the PRD's Core Modules table (§4), in full, including their content once reached via a successful login:

- Admin
- PIM
- Leave
- Time
- Recruitment
- My Info
- Performance
- Dashboard (including the post-login landing page reached after a successful Login test — confirm the redirect occurred, do not explore its content)
- Directory
- Maintenance

## 4. Roles & Credentials Required

| Role | Credentials | Source |
|---|---|---|
| Admin | Username: `Admin`, Password: `admin123` | PRD §3 — the only role directly confirmed to exist and be usable; "Account used: Admin / admin123 (Admin role)" |

No other role's credentials are available or required for this run — PRD §3 explicitly flags ESS/non-Admin, Supervisor/Approver, and Hiring Manager as unconfirmed/assumed roles never actually logged into.

## 5. Environment Constraints

- **Target environment:** `https://opensource-demo.orangehrmlive.com/web/index.php/auth/login` — a **shared public demo instance** (PRD §14 Risks: "Shared/public demo state... tested instance is shared across all internet users of the demo; exploration that mutates data affects everyone").
- **No destructive or persistent data-mutating actions** are authorized in this run, beyond what is inherent to testing the Login form itself.
- **Login-form testing is explicitly authorized and non-destructive**, including: submitting invalid/malformed credentials, submitting an empty form, and multiple repeated failed-login attempts specifically to probe SR-5 (brute-force protection) — this is expected exploration, not an unauthorized action, and does not mutate persistent application data.
- **A single successful login with the confirmed Admin credentials is authorized** to verify FR-1/FR-2 (successful redirect behavior) — but exploration must stop at confirming the redirect occurred. No sidebar module content may be explored afterward, per §3 above. Log out (if reachable without exploring another module) or simply stop, once the redirect is confirmed.
- **Do not attempt to actually exploit** any weakness this run probes for (e.g., no genuine brute-force/credential-stuffing attempt beyond a small, reasonable number of probe attempts; no SQL-injection-style payloads submitted with intent to succeed — per `agents/explorer_agent.md` §5.7, any such probe is an input-handling/error-message observation only).

## 6. Carried-Forward Assumptions & Risks

The following PRD assumptions and risks are relevant to the Login scope and must be specifically investigated by the Explorer Agent:

| # | Assumption / Risk | PRD Source | What Explorer Must Check |
|---|---|---|---|
| 1 | **No visible brute-force protection** — repeated failed logins showed no CAPTCHA, lockout, or delay in the UI in the prior (legacy-pipeline) exploration. Flagged as a **High**-impact risk (confirmed absence of visible control, not a confirmed vulnerability, since server-side enforcement may exist without UI feedback). | PRD §10 SR-5, §14 Risks | Re-attempt a small number of failed logins and observe whether any lockout, delay, throttling, or CAPTCHA appears. |
| 2 | **Auth-gated deep links — partial verification.** SR-1 (unauthenticated access to a protected URL redirects to login, and returns the user to the originally requested page after login) was confirmed only for one URL (Admin > System Users) in the prior exploration; not verified for every module URL. Flagged as a **Medium**-impact risk. | PRD §5.1 FR-2, §10 SR-1, §14 Risks | Attempt at least one direct/deep-link navigation to a protected URL while unauthenticated; confirm redirect-to-login and (if a login is performed) return-to-original-URL behavior. |
| 3 | **Forgot Password anti-enumeration.** The password-reset flow must return an identical generic success message regardless of whether the submitted username exists. Previously confirmed in the legacy exploration. | PRD §5.1 FR-3, §10 SR-3 | Re-confirm this behavior holds; treat any difference in messaging between a known and unknown username as a Finding. |
| 4 | **Login form UI stability.** No JavaScript console errors were observed during login/logout/forgot-password flows in the prior exploration. | PRD §11 NFR-1 | Capture console logs during Login exploration and compare against this prior "no errors" observation. |

No other PRD assumption/risk items (e.g., Employee Id editability, RBAC on Admin/Maintenance, date format ambiguity) are in scope for this run — they pertain to modules explicitly out of scope per §3.

## 7. Traceability Anchor

| Item | PRD Section |
|---|---|
| Scope Summary / Login definition | PRD §4 (Core Modules), §5.1 (Authentication & Access) |
| Roles & Credentials | PRD §3 (User Roles) |
| Environment Constraints (shared public demo) | PRD §14 (Risks — "Shared/public demo state") |
| Carried-Forward Risk #1 (brute-force) | PRD §10 SR-5, §14 Risks |
| Carried-Forward Risk #2 (deep-link redirect) | PRD §5.1 FR-2, §10 SR-1, §14 Risks |
| Carried-Forward Assumption #3 (Forgot Password) | PRD §5.1 FR-3, §10 SR-3 |
| Carried-Forward Observation #4 (console stability) | PRD §11 NFR-1 |
