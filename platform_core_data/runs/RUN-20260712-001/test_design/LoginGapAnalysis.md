# NDC — Login Test Case Validation Pass (RUN-20260712-001)

**Status:** Pending Review · Performed before any Stage 4 automation generation, per explicit user instruction 2026-07-12. **Not a Stage 4 artifact** — this is a Stage 3 (Test Design) validation/gap-closure pass on the already-drafted Login Manual Test Suite, cross-referenced against a source it didn't originally have: the Reference SHAFT Automation Project.

## Sources Consulted

1. Live Login screen — Browser Automation, this run's original Discovery (`discovery/Login_Screen.md`) plus a new, targeted supplementary pass (`discovery/_login_discovery_supplement.js`), both today.
2. Project Context v2 (`context/ProjectContext_LoginAuthentication.md`).
3. Discovery artifacts (`discovery/Login_Screen.md`, `Timeline.md`, `Coverage_Summary.md`, `QA_Assessment_Report.md`, `findings/`).
4. Current Login Test Cases (`test_design/TestCases_Login.md` — TC-LOGIN-001/002/003, before this pass).
5. Reference SHAFT Project (`E:\Automation2\NDC-Uplift-Automation`, specifically `AdminPages/Login/LogIn_Page.java` and `src/test/java/AdminPages/Login/LogIn_TC.java`) — read-only, per `platform_core_data/reference_automation_project.md`. Treated as **secondary, Documentation-category evidence** (an existing test suite's own expectations, not this run's Direct Observation) — used to surface scenarios worth checking, never as a substitute for this platform's own observation.

## Traceability Matrix

| Observed UI Behavior | Existing Test Case | Covered? | Missing? | Reason / Source |
|---|---|---|---|---|
| Valid login → Dashboard | TC-LOGIN-001 | Yes | — | Direct Observation, this run |
| Invalid credentials (non-existent username) → "Invalid credentials, Please try again." | TC-LOGIN-002 | Yes | — | Direct Observation, this run |
| Empty username + empty password (combined) → blocked | TC-LOGIN-003 | Partially | — | Direct Observation of *some* behavior pending; exact assertion is assumption-based (see original Coverage Report §7) |
| Password field masks input (`type="password"`) | — | No | **Yes** | Direct Observation, this run's original Discovery (`_login_discovery_results.json`) — never turned into its own test case until now |
| Login button carries a `loadingicon="pi pi-spin pi-spinner"` attribute (loading-state capable) | — | No | **Yes** | Direct Observation, supplementary pass today (`_login_discovery_supplement_results.json`) — corroborated by Reference Project's own locator convention for this exact element |
| Empty **username only** (password filled) → blocked | TC-LOGIN-003 (combined only) | No | **Yes** | Not previously split out; safe to add (no new live interaction risk beyond what TC-LOGIN-003 already does) |
| Empty **password only** (username filled) → blocked | TC-LOGIN-003 (combined only) | No | **Yes** | Same as above |
| Required-field messages ("Username is required" / "Password is required") | TC-LOGIN-003 (weak assertion only) | Partially | Strengthening recommended | Reference Project's `Txt_ErrorOfUserName`/`Txt_ErrorOfPassword` locators and exact expected strings are Documentation-category evidence only — not yet independently confirmed by this platform's own Discovery. Recommend one more Discovery pass before hardening TC-LOGIN-003's assertion to these exact strings. |
| "Remember Me" checkbox | — | N/A | **No — confirmed absent** | Direct Observation, supplementary pass today: no such element exists on the live screen, despite the Reference Project's `LogIn_Page.java` still referencing one. See FINDING-NDC-LOGIN-002. No test case designed — there is nothing to test. |
| "Forgot Password?" link (presence only) | — | N/A (out of scope) | No | Confirmed present (Direct Observation, original Discovery) but the flow itself is explicitly out of scope for this run (Project Context v2 §3) |
| Wrong password against a **real, valid** username (anti-enumeration check: does the message differ from a non-existent username?) | — | No | **Yes — needs an explicit decision** | Reference Project's `LogInWithInvalidPassword` test covers exactly this. Adding it here means using a real NDC username in a negative case (even though only one attempt, generic message expected) — a judgment call this platform is surfacing rather than deciding unilaterally, per the shared-environment negative-testing default. See "Open Decisions" below. |
| Logout (after a successful login) | — | No | **Scope question, not a gap** | Reference Project treats Logout as part of its Login test class (`LogIn_TC.java`). This platform's own Project Context v2 §3 explicitly places "post-login session/logout behavior" **out of scope** for this run. Flagged as a scope-boundary question, not silently added or silently ignored. See "Open Decisions" below. |
| Post-login redirect host consistency | TC-LOGIN-001 (asserts host-independently) | Yes (already mitigated) | — | FINDING-NDC-LOGIN-001, now reinforced by a *third* host value seen in the Reference Project's own (possibly stale) test expectations |
| Enter-key submission of the login form | — | N/A | Not designed | **No evidence either way** — neither this run's Discovery nor the Reference Project's tests exercise keyboard-only submission. Per instruction not to invent scenarios, this is recorded as an Open Question, not a test case. |
| Already-authenticated user revisiting `/auth/login` | — | N/A | Not designed | No evidence from any source — Open Question only. |
| Password visibility toggle (show/hide) | — | N/A | Not designed | No evidence from any source (no such control found in either the live DOM inspection or the Reference Project's locators) — not invented. |
| Disabled Login button until fields are filled | — | N/A | Resolved — does NOT apply | Reference Project's own `LogInWithEmptyFields` test clicks the Login button while both fields are empty and receives it successfully (validation appears *after* the click) — this is evidence *against* a disabled-until-filled pattern, not a gap. No test case needed. |
| Field trimming (leading/trailing whitespace) | — | N/A | Not designed | No evidence from any source. |
| Copy/paste restrictions | — | N/A | Not designed | No evidence from any source. |
| Browser refresh behavior mid-form | — | N/A | Not designed | No evidence from any source. |
| Session creation (cookie/token) | — | N/A | Not designed | Implied by the Dashboard redirect (TC-LOGIN-001) but never independently inspected (no cookie/storage check performed by any source) — Open Question, not asserted as a distinct scenario. |

## New Test Cases Added This Pass

- **TC-LOGIN-004** — Password field masks input.
- **TC-LOGIN-005** — Empty Username only (Password filled) blocked.
- **TC-LOGIN-006** — Empty Password only (Username filled) blocked.
- **TC-LOGIN-007** — Login button exposes a loading-indicator attribute during/around submission.
- **TC-LOGIN-008** — Anti-enumeration: wrong password against a real, valid username yields the same generic message as TC-LOGIN-002.

All five are additive — no existing test case (TC-LOGIN-001/002/003) was altered or removed, per instruction.

## Decisions Resolved (2026-07-12, update)

The two items below were originally surfaced as questions for the human. Per a same-day platform clarification (`pipeline/pipeline.md` §5.5, Human Decisions vs. Engineering Decisions), both are ordinary Test Design/scope-management calls, not Human Decisions — resolved automatically instead of asked about:

1. **Anti-enumeration check (valid username + wrong password).** Resolved: **include it** — added as TC-LOGIN-008 above. One single attempt, generic-message-only assertion, no repeats, consistent with the shared-env negative-testing default.
2. **Logout.** Resolved: **stays Out of Current Scope** for this Login-only run. Documented as a candidate for a future module/run (see `TestCases_Login.md`'s Deferred Scenarios table) — not a test case, not a Project Context amendment, per the explicit instruction that adjacent-feature scope questions shouldn't interrupt execution unless they'd change the run's business objective.

## Coverage Impact Summary

Before this pass: 3 test cases, 100% of a narrow, un-cross-referenced scope. After this pass: 8 test cases (3 kept unchanged + 5 added), both candidate scenarios from the validation pass resolved (one included, one kept out of scope) without a round-trip, and 8 scenarios from the example list explicitly confirmed **not to apply** (no evidence they exist) rather than fabricated. See updated `CoverageReport.md` and `TraceabilityMatrix.md`.
