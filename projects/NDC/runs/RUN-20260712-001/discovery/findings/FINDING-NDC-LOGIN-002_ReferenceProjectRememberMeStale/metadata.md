# FINDING-NDC-LOGIN-002 — Reference automation project's "Remember Me" locator targets an element not present on the live login screen

- **Category:** Observation
- **Severity:** Low — Severity Reason: does not block or affect Login itself; only affects reuse decisions for one specific Reference Project locator/method. Defaults to Low per `agents/explorer_agent.md` §5.4.
- **Confidence Score:** 92%
- **Status:** Needs Human Review — the absence is directly, reproducibly confirmed (see Evidence), but *why* the reference project's code still targets it (removed feature vs. always-broken locator vs. role/environment-conditional rendering) is not something Discovery alone can determine.
- **Evidence Category:** Direct Observation (Browser Automation) — a targeted, static DOM inspection of the live login screen (no login attempt performed).
- **Module:** Login / Authentication
- **Discovery Mode:** Browser Automation

## Observed Behaviour

The Reference SHAFT Automation Project (`E:\Automation2\NDC-Uplift-Automation`, `src/main/java/AdminPages/Login/LogIn_Page.java`) declares a locator `Btn_RememberMyInfoNextTime = By.xpath("//div[@class='p-checkbox-box']")` and a `ClickRememberMe()` method, implying a "Remember Me" PrimeNG-style checkbox exists on the login screen. A targeted supplementary Discovery pass on 2026-07-12 searched the live login screen for: (a) any element whose visible text contains "remember," and (b) any element matching PrimeNG's `.p-checkbox-box`/`[class*="checkbox"]` convention. **Neither search found any match.**

## Evidence

- `login_screen_no_remember_me.png` — full-page screenshot of the live login screen at inspection time, showing only Username, Password, Login button, and "Forgot Password?" link — no checkbox of any kind.
- Raw discovery log: `../../_login_discovery_supplement_results.json` (`rememberMeCandidates: []`, `primeCheckboxCandidates: []`).

## Root Cause Hypothesis (labeled as hypothesis, not fact)

Most likely the "Remember Me" feature was removed from the live login screen at some point after the reference project's `LogIn_Page.java` was last updated (feature drift), rather than a locator that was always wrong — the very specific, plausible PrimeNG selector suggests it was written against a real, once-existing element. **Unconfirmed** — no changelog/architecture documentation available to verify when or whether this was intentionally removed.

## Recommendation

Do not reuse `LogIn_Page.java`'s `Btn_RememberMyInfoNextTime`/`ClickRememberMe()` when extending the Reference Project for Login automation (per `platform_core_data/reference_automation_project.md`) — this locator currently targets nothing live. Do not design a "Remember Me" test case for the current Login Manual Test Suite (RUN-20260712-001) — there is nothing to test. Flag to the reference project's maintainers that this method may be dead code.

## Missing Evidence

None — Smart Evidence Collection floor for an `Observation` category (screenshot + reproducible negative search) is met.
