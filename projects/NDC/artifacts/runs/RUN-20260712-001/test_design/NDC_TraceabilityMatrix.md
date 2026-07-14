# NDC — Requirement Traceability Matrix — RUN-20260712-001

**Status:** Pending Review · Login / Authentication scope only · **Observation-based Spike** — "Requirement" below means a Project Context v2 §6 Open Question or a directly-observed structural property resolved by observation, not a PRD requirement ID (none exist for Login). Updated 2026-07-12 after the Login Test Case Validation Pass (`NDC_LoginGapAnalysis.md`).

| Requirement Reference (Project Context v2 / this validation pass) | Test Case ID | Discovery Reference | Finding Reference | Evidence Reference | Validation Status |
|---|---|---|---|---|---|
| §6 item 5 — Session/post-login redirect target | TC-LOGIN-001 | `discovery/Login_Screen.md` | FINDING-NDC-LOGIN-001 | `discovery/login_screen_valid_post_login.png` | Validated (Direct Observation) — redirect works; cross-host aspect flagged, not blocking |
| §6 item 3 — Error-message wording/behavior for invalid login | TC-LOGIN-002 | `discovery/Login_Screen.md` | N/A | `discovery/login_screen_invalid_attempt.png` | Validated (Direct Observation) |
| §6 item 1 — Exact field set / validation behavior (empty-field case, combined) | TC-LOGIN-003 | Not independently re-verified this run | N/A | N/A | Partially Validated — field presence confirmed; empty-submission behavior assumption-based |
| Password field masking | TC-LOGIN-004 | `discovery/_login_discovery_results.json` | N/A | N/A | Validated (Direct Observation) |
| Empty Username only, split from §6 item 1 | TC-LOGIN-005 | Not independently re-verified this run | N/A | N/A | Assumption-based, same caveat as TC-LOGIN-003 |
| Empty Password only, split from §6 item 1 | TC-LOGIN-006 | Not independently re-verified this run | N/A | N/A | Assumption-based, same caveat as TC-LOGIN-003 |
| Login button loading-indicator attribute | TC-LOGIN-007 | `discovery/_login_discovery_supplement_results.json` | N/A | `discovery/login_screen_supplement.png` | Validated (Direct Observation) |
| Anti-enumeration (real username + wrong password) | TC-LOGIN-008 | Not yet independently observed this run — designed per the automatic Engineering Decision rule (`pipeline/pipeline.md` §5.5), mirroring the Reference Project's own equivalent test | N/A | N/A | Designed, not yet executed — this is a Stage 3 artifact, no live attempt performed |

## Coverage

8/8 designed test cases traced to a Project Context v2 item or a directly-observed structural property. No orphan test case exists.

## Explicitly Out of Scope / Deferred (not orphaned — see Test Design Agent §5.3 disposition rule)

- Forgot Password flow existence — out of scope this run (Project Context v2 §3).
- Logout — Out of Current Scope, resolved automatically as an Engineering Decision (`pipeline/pipeline.md` §5.5) rather than asked about; documented as a candidate for a future module/run.
- Lockout/rate-limiting/security-input/boundary-value scenarios — explicitly deferred (shared-env negative-testing default); see `NDC_CoverageReport.md` Coverage Gaps.
- "Remember Me" — confirmed **absent** from the live screen (FINDING-NDC-LOGIN-002); no test case designed because there is nothing to test.

## Pending Decisions

None remaining — the anti-enumeration case (added as TC-LOGIN-008) and the Logout scope question (kept out of scope) were both resolved automatically as Engineering Decisions, 2026-07-12. See `NDC_LoginGapAnalysis.md` for the full reasoning.
