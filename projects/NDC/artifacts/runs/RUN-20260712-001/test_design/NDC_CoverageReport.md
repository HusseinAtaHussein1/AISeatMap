# NDC — Coverage Report — RUN-20260712-001 (Login / Authentication)

**Status:** `Approved` (reviewer: Aymoon, QA Architect / Test Lead role, 2026-07-12) · Produced by Test Design Agent v3, per the Standard Output Contract (`agents/test_design_agent.md` §18). Updated 2026-07-12 after the Login Test Case Validation Pass (`NDC_LoginGapAnalysis.md`), then finalized the same day once the anti-enumeration and Logout questions were resolved as automatic Engineering Decisions (`pipeline/pipeline.md` §5.5) rather than asked about.

## 1. Run Scope

Type = Feature · Source = Custom scope description · **Observation-based Spike** — see `NDC_ProjectContext.v2.md`. Scope: the NDC Admin Portal Login screen only.

## 2. Requirements Covered

8 test cases now trace to either a Project Context v2 §6 Open Question or a directly-observed structural property (see `NDC_LoginGapAnalysis.md`'s Traceability Matrix for the full cross-reference against the live screen, this platform's own Discovery, and the Reference SHAFT Project). Forgot Password existence, Logout, and lockout/rate-limiting remain explicitly out of scope / deferred, not uncovered requirements — Logout's exclusion was decided automatically (Engineering Decision), not asked about.

## 3. Coverage Matrix

| Item | Covered? | Test Case(s) |
|---|---|---|
| Valid login → Dashboard | Covered | TC-LOGIN-001 |
| Invalid credentials → generic error | Covered | TC-LOGIN-002 |
| Empty-field validation (combined) | Partially Covered (assumption-based) | TC-LOGIN-003 |
| Password field masking | Covered (Direct Observation) | TC-LOGIN-004 |
| Empty Username only | Partially Covered (assumption-based) | TC-LOGIN-005 |
| Empty Password only | Partially Covered (assumption-based) | TC-LOGIN-006 |
| Login button loading-indicator attribute | Covered (Direct Observation) | TC-LOGIN-007 |
| "Remember Me" | Not Applicable — confirmed absent from the live screen (FINDING-NDC-LOGIN-002) | — |
| Anti-enumeration check (real username + wrong password) | Covered (designed) | TC-LOGIN-008 |
| Forgot Password flow | Out-of-Scope (this run) | — |
| Logout | Out-of-Current-Scope (decided automatically, Engineering Decision — candidate for a future module) | — |
| Lockout / brute-force / rate-limiting | Out-of-Scope (deferred, shared environment) | — |
| Security-input handling (e.g. SQL-injection-style payloads) | Out-of-Scope (deferred to a future dedicated security pass) | — |

## 4. Business Rules

None stated in a PRD for this module — see Project Context v2's explicit Observation-derived framing. No business rule is asserted or invented; behavior is described exactly as observed, cross-referenced against the Reference SHAFT Project only as secondary (Documentation-category) corroboration, never as a primary source.

## 5. Test Scenarios

Positive (valid login, password masking, loading-indicator attribute), Negative — Invalid Inputs (wrong/non-existent credentials), Negative — Empty Values (combined and split empty-field submissions, assumption-based).

## 6. Manual Test Cases (by reference)

TC-LOGIN-001 through TC-LOGIN-008 — see `NDC_TestCases_Login.md` / `.xlsx`.

## 7. Assumptions

- TC-LOGIN-003/005/006 (empty-field validation, combined and split) are assumption-based — Discovery this run did not independently submit an all-empty or half-empty form; behavior is inferred, not directly observed. The Reference SHAFT Project's own test suite asserts specific messages ("Username is required" / "Password is required") but that is Documentation-category evidence only, not this platform's own Direct Observation — flagged rather than adopted as fact.

## 8. Coverage Gaps

| Gap | Reason | Disposition |
|---|---|---|
| Lockout / brute-force protection | Deferred — shared staging environment, real-account lockout risk | Deferred, recommend a future dedicated pass on an isolated environment |
| Rate-limiting | Same as above | Deferred |
| Security-input handling (SQL-injection-style, XSS-style payloads) | Explicitly out of scope for this functional Spike | Deferred |
| Boundary values (very long Username/Password) | Not attempted — additional live login attempt beyond the one-safe-attempt budget | Deferred |
| Empty-field submission — direct re-observation (combined + both split cases) | Not independently re-verified this run (time-boxed Spike) | Test Gap — recommend a follow-up Discovery pass before Stage 4 hardens TC-LOGIN-003/005/006's assertions |
| TC-LOGIN-008 (anti-enumeration) not yet independently observed | Designed from Test Design reasoning + Reference Project precedent; not yet exercised via this platform's own live Discovery | Test Gap — recommend Stage 5 (Execution) as the first real observation of this exact scenario, or a quick Discovery confirmation first if higher confidence is wanted before automating |
| Logout | Out of Current Scope — decided automatically as an Engineering Decision, not a gap | Documented candidate for a future module/run, not designed this run |
| Enter-key submission, already-authenticated-user behavior, password-visibility toggle, field trimming, copy/paste restrictions, browser-refresh mid-form, session/cookie inspection | No evidence from any source (this run's Discovery or the Reference Project) that these exist/apply | Not designed — explicitly not invented, per instruction; recorded as Open Questions in `NDC_LoginGapAnalysis.md`, not silently omitted |

## 9. Risks

- Automating TC-LOGIN-003/005/006 against an unverified assumption risks a false-negative or false-positive result if the actual empty-field behavior differs from what's assumed. Automation Agent should either mark these Partially Automatable or re-verify before generating a hard assertion.
- FINDING-NDC-LOGIN-001 (cross-host redirect) is unresolved and now has a *third* host value in play (via the Reference Project's own, possibly-stale test expectations) — any automation asserting a specific post-login host should assert on the documented `successSelector` (`text=Dashboard`) rather than a specific URL/host.
- FINDING-NDC-LOGIN-002 — do not reuse the Reference Project's `Btn_RememberMyInfoNextTime`/`ClickRememberMe()` when Stage 4 extends that project; it targets a no-longer-existent element.

## 10. Recommendations

- Prioritize TC-LOGIN-001, TC-LOGIN-002, TC-LOGIN-004, TC-LOGIN-007 for automation (Generate) — all four are cleanly, directly observed.
- Flag TC-LOGIN-003/005/006 to the Automation Agent as needing either a quick re-verification or an explicit "assumption-based" label carried into the generated test.
- TC-LOGIN-008 (anti-enumeration) is ready to generate — its single live attempt at Stage 5 execution time will be its first real observation, which is an acceptable order for a Generate decision (per Automation Agent §13, this is not an invented business rule, just an as-yet-unexercised but well-specified scenario).

## 11. Automation Candidates (advisory only — not a binding Automation Decision)

| Test Case | Candidate Disposition |
|---|---|
| TC-LOGIN-001 | Strong candidate — Generate |
| TC-LOGIN-002 | Strong candidate — Generate |
| TC-LOGIN-003 | Candidate — Generate, but carry the assumption-based label into the generated test's own documentation/comments |
| TC-LOGIN-004 | Strong candidate — Generate (simple structural assertion) |
| TC-LOGIN-005 | Candidate — Generate, assumption-based label (same as TC-LOGIN-003) |
| TC-LOGIN-006 | Candidate — Generate, assumption-based label (same as TC-LOGIN-003) |
| TC-LOGIN-007 | Strong candidate — Generate (simple structural assertion) |
| TC-LOGIN-008 | Strong candidate — Generate (uses the real credential already loaded at execution time for TC-LOGIN-001; no new credential handling needed) |

## 12. Inputs for Automation Agent

- Manual Test Suite: `NDC_TestCases_Login.md` / `.xlsx` (this folder)
- Traceability Matrix: `NDC_TraceabilityMatrix.md` (this folder)
- Coverage Report: this document
- Gap Analysis / Validation Pass: `NDC_LoginGapAnalysis.md` (this folder)
- Discovery Artifacts: `../discovery/Login_Screen.md`, `Timeline.md`, `Coverage_Summary.md`, `QA_Assessment_Report.md`, `_login_discovery_supplement_results.json`
- Findings: `../discovery/findings/Findings_Summary.md`, `FINDING-NDC-LOGIN-001_CrossHostRedirect/metadata.md`, `FINDING-NDC-LOGIN-002_ReferenceProjectRememberMeStale/metadata.md`
- Project Context: `../context/NDC_ProjectContext.v2.md`
- Automation Package options (per the platform's multi-package model, `agents/automation_agent.md` §31): the SHAFT-structure spec at `projects/NDC/automation_framework.md`, and/or the Reference SHAFT Project at `projects/NDC/reference_automation_project.md` — which one (or neither) applies is decided by Stage 4's own Framework/Target/Strategy Decision Gates, not fixed here.
