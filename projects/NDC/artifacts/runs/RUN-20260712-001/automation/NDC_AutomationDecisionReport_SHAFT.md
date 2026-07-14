> **Status:** Pending Automation Approval · **Run:** RUN-20260712-001, Stage 4.

# Automation Decision Report — NDC Login (SHAFT Export)

| Test Case ID | Decision | Justification | Reused Assets | Generated Assets | Automation Readiness | Known Limitations |
|---|---|---|---|---|---|---|
| TC-LOGIN-001 | Generate New Automation | Fully, directly observed; deterministic steps | `Txt_Username`, `Txt_Password`, `Btn_LogINButton` (Reference Project) | `loginWithValidCredential()`, `validLoginRedirectsToDashboard()` | Ready | Asserts on page title containing "Dashboard," not a host, per FINDING-NDC-LOGIN-001 |
| TC-LOGIN-002 | Generate New Automation | Fully, directly observed; exact message captured verbatim | `Txt_InValidCred` (Reference Project) | `invalidCredentialsShowGenericMessage()` | Ready | None |
| TC-LOGIN-003 | Generate New Automation | Deterministic steps; expected message is assumption-based (Coverage Report §7) | `Txt_ErrorOfUserName`, `Txt_ErrorOfPassword` (Reference Project, Documentation-category evidence) | `emptyUsernameAndPasswordBlocked()` | Ready, with caveat | Asserted message text not independently confirmed this run — see Risks |
| TC-LOGIN-004 | Generate New Automation | Fully, directly observed (Discovery) | `Txt_Password` (Reference Project) | `getPasswordFieldType()`, `passwordFieldIsMasked()` | Ready | None |
| TC-LOGIN-005 | Generate New Automation | Same caveat as TC-LOGIN-003 (split case) | `Txt_Username`, `Txt_ErrorOfUserName` | `emptyUsernameOnlyBlocked()` | Ready, with caveat | Same as TC-LOGIN-003 |
| TC-LOGIN-006 | Generate New Automation | Same caveat as TC-LOGIN-003 (split case) | `Txt_Password`, `Txt_ErrorOfPassword` | `emptyPasswordOnlyBlocked()` | Ready, with caveat | Same as TC-LOGIN-003 |
| TC-LOGIN-007 | Generate New Automation | Fully, directly observed (supplementary Discovery) | `Btn_LogINButton` (Reference Project) | `getLoginButtonLoadingIconAttribute()`, `loginButtonHasLoadingIndicatorAttribute()` | Ready | None |
| TC-LOGIN-008 | Generate New Automation | Deterministic steps; mirrors Reference Project's own `LogInWithInvalidPassword` test as precedent | `Txt_Username`, `Txt_Password`, `Txt_InValidCred` (Reference Project) | `loginWithValidUsernameWrongPassword()`, `wrongPasswordForRealUsernameShowsSameGenericMessage()` | Ready | Uses the real credential's username (not password) — single attempt only, per the shared-env negative-testing default |

## Summary

8/8 test cases: **Generate New Automation**. 0 Reuse Existing Automation (Reference Project's locators reused at the field level, but no complete existing test method for any of these 8 exact scenarios). 0 Partially Automatable. 0 Manual Only.
