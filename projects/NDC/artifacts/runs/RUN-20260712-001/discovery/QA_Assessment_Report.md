# NDC — QA Assessment Report (Stage 2, Explorer Agent) — RUN-20260712-001

**Status:** `Approved` (reviewer: Aymoon, QA Lead role, 2026-07-12). Complete for this run's narrow scope — Login screen only, see Project Context v2.

## 1. Scope

- Run Scope: Type = Feature · Source = Custom scope description (Observation-based Spike — no PRD coverage)
- Project Context version used: `NDC_ProjectContext.v2.md` (Pending Review)

## 2. Objectives

- Establish, via direct observation, the actual structure and functional behavior of the NDC Admin Portal Login screen, since no PRD documents it.
- Confirm a valid credential successfully authenticates and reaches the Dashboard.
- Confirm generic invalid-credential handling (one safe attempt only, per the shared-env negative-testing default).

## 3. Evidence Sources

- **Browser Automation** — the sole Discovery Mode this run, via a raw Playwright script (`_login_discovery.js`) for the pre-auth/invalid-attempt states and `tools/browser_driver/`'s `BrowserDriver` for the valid-login confirmation. Evidence Category: Direct Observation throughout.

## 4. Modules Explored

- `http://192.168.1.70/auth/login` (Login screen)
- Post-login landing (`http://192.168.1.80/dashboard`) — confirmed only as the success signal, not itself explored.

## 5. Observed Behaviour

- Login form: Username (text), Password (masked), Login submit button, "Forgot Password?" link. No other controls.
- Invalid credentials (fabricated, non-existent username): rejected with "Invalid credentials, Please try again."; user remains on the login screen.
- Valid credentials: redirect to a Dashboard on a **different host** than the login screen itself — see FINDING-NDC-LOGIN-001.

## 6. Confirmed Behaviour

- Valid-login → Dashboard redirect works as expected (functionally).
- Invalid-login rejection message renders correctly and does not error out.

## 7. Assumptions

_None introduced — this run's Project Context is itself explicitly Observation-derived; see that document's §6 Open Questions instead of PRD-carried Assumptions._

## 8. Open Questions

- Is the cross-host redirect (`.70` → `.80`) intentional? See FINDING-NDC-LOGIN-001.
- Does the "Forgot Password?" link lead to a functioning flow? Not exercised — out of scope this run.
- What lockout/rate-limiting protection (if any) exists? Deliberately not tested this run (shared environment).

## 9. Discovered Risks

- **Business Risk:** None identified within this run's narrow scope.
- **Technical Risk:** Unconfirmed multi-host topology (FINDING-NDC-LOGIN-001) could complicate any future automation that assumes a single host for both login and post-login navigation.

## 10. Coverage

Roll-up from `Coverage_Summary.md`: 1/1 in-scope area visited = 100% of this run's declared (narrow) scope. See that file for the Deferred-item accounting.

## 11. Gaps (Documented vs. Observed)

| Documented (source) | Observed | Gap |
|---|---|---|
| No PRD/architecture documentation of Login exists at all | Full form structure + both success/failure behaviors now documented, first time, this run | Closes a documentation gap rather than exposing one |
| `browser/profile.json`'s `defaultBaseUrl` (`.70`) | Post-login lands on `.80` | FINDING-NDC-LOGIN-001 |

## 12. Recommendations

- **Regression Test Candidates:** (a) valid login continues to redirect successfully; (b) invalid login continues to show the generic message without leaking whether the username itself exists.
- No `Recommendation`-category Findings raised this round.

## 13. Inputs for Test Design

- **Findings:** FINDING-NDC-LOGIN-001 (Observation, Needs Human Review) — informational, does not block Test Design.
- **Resolved Open Questions:** Field structure, invalid-credential message, valid-login redirect target (all now directly observed).
- **Unresolved, carried forward:** Forgot Password flow (out of scope), lockout/rate-limiting (deferred by design).
- **Regression Test Candidates:** see §12.
