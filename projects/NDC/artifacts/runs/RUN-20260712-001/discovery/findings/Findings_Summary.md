# NDC — Findings Summary (RUN-20260712-001)

| ID | Title | Category | Severity | Confidence Score | Status | Occurrence Count | Module | Description |
|---|---|---|---|---|---|---|---|---|
| FINDING-NDC-LOGIN-001 | Valid login redirects to a different host (192.168.1.80) than the login screen's own host (192.168.1.70) | Observation | Low | 70% | Needs Human Review | 2 | Login / Authentication | Post-login landing page is served from a different IP than the login form itself — may be intentional multi-host architecture; needs infrastructure-owner confirmation. A second occurrence (secondary/Documentation-category evidence) surfaced a *third* host (192.168.1.90) in the Reference Automation Project's own test expectations — see Update note. |
| FINDING-NDC-LOGIN-002 | Reference automation project's "Remember Me" locator targets an element not present on the live login screen | Observation | Low | 92% | Needs Human Review | 1 | Login / Authentication | Directly confirmed absent via a targeted DOM search — the Reference SHAFT Project's `LogIn_Page.java` still references a "Remember Me" checkbox that no longer exists live. Affects Stage 4 reuse decisions, not Login itself. |

Severity Reason (FINDING-NDC-LOGIN-001): Defaults to Low per `agents/explorer_agent.md` §5.4 — no functional break was observed (login itself succeeds, dashboard renders correctly), and nothing in this run's Project Context defines an expected single-host topology to contradict. Confidence capped below 90% because Evidence Category is Direct Observation of the *symptom* (the redirect itself, clearly and reproducibly observed) but not of *intent* — whether this is by design is unknown, so this cannot reach `Confirmed` per §11 rule 10 (expected behavior not clearly defined) even though the observation itself is solid.

Severity Reason (FINDING-NDC-LOGIN-002): Defaults to Low — does not affect Login's own behavior, only which Reference Project locators are safe to reuse for Stage 4.
