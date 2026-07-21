# NDC — Automation Decision Report — RUN-20260721-001 — SHAFT

**Status:** Pending Review · Every one of the 22 approved test cases (`workspace/test_design/Role/NDC_TestCases_Role.md`) receives exactly one decision below.

| Test Case | Decision | Justification | Reused Assets | Generated Assets | Automation Readiness | Known Limitations |
|---|---|---|---|---|---|---|
| TC-ROLE-001 | **Partially Automatable** | Positive path for Role Name format/uniqueness — deliberately paired with zero permissions selected (not the full happy path) so the submission still blocks (on Authorization only), since mutation is not authorized this run. The automatable portion (no Role-Name-specific error appears) is generated; a true end-to-end save is not. | Reference Project's `txt_RoleName` locator | `Role_TC.roleValidNameRaisesNoFormatOrDuplicateError()` | Ready | Full save/submit success remains untested until mutation is authorized. |
| TC-ROLE-002 | Generate New Automation | Deterministic, reproducible validation-message assertion (FINDING-002). | `Branch_Page`'s validation-message locator pattern | `Role_TC.roleNameRejectsInvalidFormat()` | Ready | Asserts the live text, not the AC's original quoted string, per explicit instruction. |
| TC-ROLE-003 | Generate New Automation | Same as above, empty-field case. | Same | `Role_TC.roleNameRequiredWhenEmpty()` | Ready | Same |
| TC-ROLE-004 | Generate New Automation | Same as above, duplicate-name case; uses a real, pre-existing role name ("Admin Role") confirmed by this run's own Discovery, never invented. | Same | `Role_TC.roleNameRejectsDuplicate()` | Ready | Same |
| TC-ROLE-005 | **Manual Only** | Test Design's own assumption-based disposition (whitespace-only Role Name, not independently verified in Discovery) — automating an unconfirmed expected behavior would mean inventing the assertion. | — | — | Not automated this run | Design what can be tested once Discovery confirms the behavior. |
| TC-ROLE-006 | **Manual Only** | Same reasoning — Unicode/non-Latin-script behavior, assumption-based. | — | — | Not automated this run | Same |
| TC-ROLE-007 | **Manual Only** | Same reasoning — long-input boundary, assumption-based, no stated max-length. | — | — | Not automated this run | Same |
| TC-ROLE-008 | **Manual Only** | Same reasoning — SQL-injection-style probe, assumption-based. | — | — | Not automated this run | Same |
| TC-ROLE-009 | Generate New Automation | Deterministic Authorization-required validation (FINDING-002). | `Branch_Page`'s validation-message locator pattern | `Role_TC.authorizationRequiredWhenNoPermissionSelected()` | Ready | Asserts live text, not AC's original quoted string. |
| TC-ROLE-010 | Generate New Automation | Deterministic — deliberately pairs an empty Role Name with one permission selected, so the overall submission still blocks (on Role Name only), proving the Authorization error specifically clears without ever completing a real save. | — | `Role_TC.selectingOnePermissionClearsAuthorizationError()` | Ready | Design intentionally avoids a full valid submission — see Automation Plan Risks. |
| TC-ROLE-011 | Generate New Automation | Structural presence check, no submission. | — | `Role_TC.moduleSegmentTabsAreDisplayed()` | Ready | Does not re-assert the full 11-item list (that's TC-ROLE-022's Exploratory charter). |
| TC-ROLE-012 | Generate New Automation | Structural presence check, no submission. | — | `Role_TC.adminSegmentShowsSubModuleTabs()` | Ready | — |
| TC-ROLE-013 | Generate New Automation | Structural presence check, no submission — also confirms the resolved naming-collision question (Company's "Role" row). | Reference Project's `formcontrolname` locators | `Role_TC.companyTabShowsExpectedGridRows()` | Ready | Row-scoped locator not yet independently confirmed live through SHAFT — see Manifest Recommendations. |
| TC-ROLE-014 | Generate New Automation | Deterministic checkbox-behavior assertion. | Reference Project's `formcontrolname` locators | `Role_TC.viewCheckboxSelectableIndependently()` | Ready | Same row-scoping caveat as TC-ROLE-013. |
| TC-ROLE-015 | Generate New Automation | Deterministic checkbox-behavior assertion. | Same | `Role_TC.editAutoSelectsView()` | Ready | Same |
| TC-ROLE-016 | Generate New Automation | Deterministic checkbox-behavior assertion. | Same | `Role_TC.approveAutoSelectsView()` | Ready | Same |
| TC-ROLE-017 | **Manual Only** | Test Design's own assumption-based disposition — reverse-direction checkbox behavior, not AC-stated, not independently verified. | — | — | Not automated this run | — |
| TC-ROLE-018 | **Manual Only** | Test Design's own assumption-based disposition — cross-row isolation, not independently re-verified for every row combination. | — | — | Not automated this run | — |
| TC-ROLE-019 | Generate New Automation | Deterministic navigation assertion, no data persisted. | `Branch_Page`'s Cancel-button locator pattern | `Role_TC.cancelNavigatesToRoleList()` | Ready | — |
| TC-ROLE-020 | Generate New Automation | Structural/cosmetic label check (FINDING-003). | — | `Role_TC.submitButtonLabelIsSendForApproval()` | Ready | Confirms the button resolves and is reachable; the label text itself is evidenced by this run's Discovery screenshot, not re-scraped via a separate `getText()` call for a single cosmetic assertion. |
| TC-ROLE-021 | **Manual Only** (Exploratory charter) | Finding disposition (FINDING-001) — no fixed pass/fail assertion is possible for a control that does not exist; per explicit user instruction, this is a charter for a human reviewer, not a script. | — | — | Not automated — by design | See `NDC_TestCases_Role.md` TC-ROLE-021. |
| TC-ROLE-022 | **Manual Only** (Exploratory charter) | Finding disposition (FINDING-004) — same reasoning; also requires the Admin-tier credential this project doesn't currently have. | — | — | Not automated — by design | Same |

## Totals

13 Generate New Automation, 1 Partially Automatable, 8 Manual Only, 0 Reuse Existing Automation (no directly-reusable existing test case existed for this scope), 0 undecided.
