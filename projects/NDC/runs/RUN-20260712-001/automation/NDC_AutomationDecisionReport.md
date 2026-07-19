> **Status:** Pending Automation Approval · **Run:** RUN-20260712-001, Stage 4.

# Automation Decision Report — NDC (Login / Authentication)

| Test Case ID | Decision | Justification | Reused Assets | Generated Assets | Automation Readiness | Known Limitations |
|---|---|---|---|---|---|---|
| TC-LOGIN-001 | Generate New Automation | Fully, directly observed (Discovery, RUN-20260712-001) — deterministic steps and expected result, no missing logic. | None (greenfield) | `LoginPage.login()`, `LoginLocators`, `tests/login.spec.js` test #1, `data/credentialsLoader.js` | Ready | Asserts on the `text=Dashboard` success signal, not a host/URL, to stay stable regardless of FINDING-NDC-LOGIN-001's resolution. |
| TC-LOGIN-002 | Generate New Automation | Fully, directly observed — exact error message text captured verbatim during Discovery. | `LoginPage`, `LoginLocators` (shared with TC-LOGIN-001) | `tests/login.spec.js` test #2, `data/loginTestData.json.invalidLogin` | Ready | `Txt_ErrorMessage` locator falls back to Locator Strategy priority level 3 (text match) — no `data-testid` exists on this element; recommend the application add one (see Locators Layer file comment). |
| TC-LOGIN-003 | Generate New Automation | Steps/expected result are specific enough to generate deterministic code, but the underlying expected behavior is itself assumption-based (not independently re-observed this run) — generated per §18 Execution Rule 14 exactly as designed, without inventing a stronger assertion than Test Design actually specified. | `LoginPage`, `LoginLocators` (shared) | `tests/login.spec.js` test #3, `data/loginTestData.json.emptyLogin` | Ready, with caveat | Test asserts only the weakest safe claim (no "Invalid credentials" round-trip on empty submission) rather than a specific required-field message, because Coverage Report §7 flags the stronger claim as unverified. If Stage 5 execution shows this assertion is too weak or wrong, that is a Test Design re-verification item, not an Automation Agent defect. |

## Summary

3/3 test cases: **Generate New Automation**. 0 Reuse Existing Automation. 0 Partially Automatable. 0 Manual Only.
