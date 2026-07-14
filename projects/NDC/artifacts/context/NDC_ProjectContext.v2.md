# NDC — Project Context v2

**Run:** RUN-20260712-001 · **Status:** `Approved` (reviewer: Aymoon, Business Analyst / Product Owner role, 2026-07-12) · **Produced by:** Project Context Agent (Stage 1) · **Date:** 2026-07-12
**Run Scope:** Type = Feature · Source = Custom scope description · per `pipeline/run_scope.md` §3/§4.1

> ⚠️ **OBSERVATION-BASED SPIKE — NOT PRD-BACKED.** `projects/NDC/PRD.md` contains zero content on Login/Authentication (it holds only the two Credential Routes Filter user stories used by RUN-20260710-001). Per explicit user authorization on 2026-07-12, this run's scope is established via a **Custom scope description** (`pipeline/run_scope.md` §4.2) instead of a PRD, and every requirement below is derived from **directly observed live application behavior** (Discovery Mode: Browser Automation), not a written business rule. Every such item is tagged **"Observation-derived"**. This is a deliberate, one-off relaxation of `agents/project_context_agent.md`'s normal PRD-traceability rule, authorized for exploratory/spike runs where an application exists ahead of its documentation — see the platform's "Observation-based Spike run type" standing decision. This Project Context does **not** supersede or amend `NDC_ProjectContext.v1.md` (RUN-20260710-001, Credential Routes Filter scope), which remains independently Approved and untouched.

---

## 1. Scope Summary

This run is a scoped Spike covering the NDC Admin Portal's **Login / Authentication screen** — the entry point every other module sits behind. Its purpose is twofold: (a) produce a minimal, genuinely defensible functional test baseline for Login itself, and (b) exercise the full pipeline (Stages 1–4, and onward) end-to-end for the platform's own validation, per the standing execution-priority directive to drive toward a real, executable Automation Agent output. Scope is intentionally narrow: functional login validation only, no security/penetration-style testing (see §5 Environment Constraints).

## 2. Modules In Scope

| Module | Why in scope | Source |
|---|---|---|
| Login screen (`http://192.168.1.70` root — pre-authentication) | The explicit target of this run, per direct user instruction 2026-07-12 | Custom scope description |

## 3. Modules Out of Scope

Everything else — every module covered or not covered by RUN-20260710-001's Project Context v1 (Credential Routes Filter, Airport, Supplier Credentials, Airline, Booking-Mid Office, Portal Booking Module, Admin, Master, Rule Engine, Settings, User Management, Profile, Reports, PNR Query, Transfer PNR, Import PNR, Import Booked PNR, Miscellaneous, Payment Gateway) — is out of scope for this run. Post-login session/logout behavior, password-reset/"Forgot Password" flow (not confirmed to exist on this screen — see §6), and any account-administration screen (e.g., `Admin → Agency → Search Login Details`) are also out of scope; this run covers only the login *screen itself*.

## 4. Roles & Credentials Required

- One working Admin-tier credential is required to confirm the positive (valid-login) case — already available per `projects/NDC/credentials/credentials.json` (STG environment), the same credential used by prior Discovery in this project. No new credential is required for this run.
- No distinct role/permission matrix applies to the Login screen itself — it is pre-authentication and identical regardless of which role subsequently logs in.

## 5. Environment Constraints

Per `projects/NDC/run_configuration.md` (unchanged by this run):
- Target: `http://192.168.1.70`, **shared staging**, not isolated to this testing effort.
- Read-only for now — unchanged; Login itself does not create/edit/delete persistent business data, but see the negative-testing constraint below, which is stricter than a general read-only rule.
- **Negative-testing constraint (new, standing default as of 2026-07-12):** because this environment is Shared, this run performs **at most one invalid-login attempt**, using a **non-existent username** (never the real shared credential with a wrong password), solely to observe error-message behavior. Lockout, brute-force, rate-limiting, repeated-invalid-attempt, and other security/destructive-oriented scenarios are explicitly **out of scope** for this run and are recorded as Deferred (§6), not silently skipped. See the platform's "shared-env negative testing default" standing decision.

## 6. Carried-Forward Assumptions & Risks

Since this is a Spike with no PRD, this section carries forward **Open Questions requiring direct observation** rather than PRD-sourced assumptions:

| # | Item | Status this run should treat it as |
|---|---|---|
| 1 | Exact field set, labels, and validation behavior of the Login form | Unconfirmed — Explorer must observe directly (Observation-derived) |
| 2 | Whether a "Forgot Password" or similar recovery flow exists on this screen | Unconfirmed — out of scope to exercise even if present (§3) |
| 3 | Error-message wording/behavior for an invalid login attempt | Unconfirmed — Explorer observes exactly once, per §5's negative-testing constraint |
| 4 | Lockout/rate-limiting/brute-force protection behavior | **Explicitly deferred** — not observed this run; a Coverage Gap, not a resolved item, per §5 |
| 5 | Session/post-login redirect target | Partially known (existing `profile.json` uses `text=Dashboard` as the success signal) — treated as confirmed baseline, not re-litigated this run |

## 7. Traceability Anchor

| Item above | Section | Source |
|---|---|---|
| §1–§3 (Scope) | Custom scope description | User instruction, 2026-07-12 (chat), recorded in platform memory `project_observation_based_spike_run_type` |
| §4 (Credentials) | Existing project setup | `projects/NDC/credentials/credentials.json`, `projects/NDC/run_configuration.md` |
| §5 (Environment Constraints, negative-testing default) | User instruction, 2026-07-12 | Recorded in platform memory `project_shared_env_negative_testing_default` |
| §6 (Open Questions) | Observation-derived | To be resolved by Stage 2 (Explorer Agent), Discovery Mode: Browser Automation |

---

*Per `pipeline/pipeline.md` §5.1, this artifact requires Human Review (suggested reviewer: Business Analyst / Product Owner) before Stage 2 (Explorer Agent) may formally clear its own checkpoint — Stage 2 discovery below was, per explicit user instruction, performed concurrently with this draft rather than strictly after its approval, given this run's Spike/exploratory nature. Final sign-off for all of Stages 1–3 together is requested in one batch — see the run's status note in `NDC_RunManifest.md`.*
