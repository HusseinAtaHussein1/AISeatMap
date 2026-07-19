# NDC — Automation Summary — RUN-20260712-002 — SHAFT

Structured per `agents/automation_agent.md` §25 Standard Output Contract.

## 1. Automation Summary

Run Scope: Feature / Custom scope description — Observation-based Spike, Admin → Branch/Agency/Staff. Framework: SHAFT (Java 17/Maven/TestNG), continuing the existing `NDC_tests_SHAFT` package established by RUN-20260712-001's Login suite. Outcome: 13 of 17 approved test cases automated (6 unconditional Generate, 1 conditional, 7 Partially Automatable capturing-not-asserting validation text); 3 Exploratory-test dispositions correctly left Manual Only. Compilation verified — BUILD SUCCESS.

## 2. Generated Files

See `NDC_AutomationManifest_SHAFT.md` for the full listing — 8 new Java files, 3 new JSON data files, 1 modified `testng.xml`; all existing Login assets untouched.

## 3. Framework Used

SHAFT Engine, per the consolidated Decision Gate (`NDC_AutomationPlan_SHAFT.md`) — Automation Target = Export/Reference-Project-compatible, Framework = SHAFT, Strategy = Continue `NDC_tests_SHAFT`.

## 4. Coverage

35% Generate (unconditional), 41% including the one conditional case. See `NDC_AutomationCoverageReport_SHAFT.md` for the full breakdown.

## 5. Automation Decisions

6 Generate, 1 Generate (conditional), 7 Partially Automatable, 3 Manual Only — full per-case reasoning in `NDC_AutomationDecisionReport_SHAFT.md`.

## 6. Known Limitations

- **FINDING-004 selector reuse is unconfirmed live against Branch specifically** — `Icn_ThumbDown`/`Btn_Edit` are reused-by-analogy from the Reference Project's `Staff_Page.java`, not yet independently confirmed for Branch's own Actions column. `rejectRequiresNonEmptyRemark()` only ever targets a `QA_SPIKE_`-created test record (`dependsOnMethods`), never a pre-existing real one, specifically to contain this risk.
- **Agency_Page.java is newly authored, execution-unconfirmed** — the Reference Project's own Agency Add page objects (`AddAgencyCore_Page.java`, `AddAgency_Page.java`) were found stale/empty and not reused; this run's locators come from live Discovery but have not yet been exercised end-to-end by a real test run.
- **Staff dropdown test data is placeholder** (`staffTestData.json`'s `note` field) — Department/Role/Approver List option values are not confirmed against the live dropdowns.
- **7 Partially Automatable cases capture observed validation text via console output rather than asserting a fixed value** — by design, per Test Design's assumption-based framing; a human (or the Execution Agent's own reporting) must review these, a clean TestNG pass alone does not mean the assertion was meaningful.
- **`AdminMenu.java`'s Branch/Staff-tab selectors are positional**, inherited from the Reference Project, not introduced this run.
- **TC-BRANCH-008 targets `.70`, not `.80`** (2026-07-18, explicit user instruction) — `LogIn_Page.NDC_LOGIN_URL`, `PaymentMethod_Page.PAYMENT_METHOD_URL`, and `Branch_Page.BRANCH_EDIT_URL_PREFIX` were changed from `.80` to `.70` to match. This reopens (does not silently reverse) FINDING-001's "`.80` is the current STG environment, `.70` is stale" conclusion — every other test in this suite still targets `.80`, so the suite as a whole is now **split across two environments**; flagged for the user to reconcile (pick one environment for the whole suite, or explicitly confirm both stay). New Page Object `PaymentMethod_Page.java` (Master → Payment Gateway → Payment Method) has no Reference Project equivalent, authored fresh.
- **Repaired a pre-existing, unrelated bug found while first executing this suite since the repo's directory restructuring**: `CredentialsLoader.java`'s relative path to `credentials.json` still assumed the old `projects/NDC/artifacts/runs/...` layout (5 `../` segments) after the repo moved to `projects/NDC/runs/...` (one level shallower) — every test's login step was broken until corrected to 4 `../` segments. Not caused by this run's own changes; simply never caught because no test had executed since the restructuring.

## 7. Execution Instructions

From `projects/NDC/artifacts/runs/RUN-20260712-001/automation/NDC_tests_SHAFT/`:
```
mvn -o clean test-compile   # verify compilation only, already confirmed 2026-07-12
mvn -o test                 # runs the full testng.xml (Login + Branch + Agency + Staff suites)
```
No new environment variables/config required beyond what the Login run already established (`projects/NDC/credentials/credentials.json`, read automatically by `CredentialsLoader`/`AdminTestBase`).

## 8. Inputs for Execution Agent

- This automation package: `projects/NDC/artifacts/runs/RUN-20260712-001/automation/NDC_tests_SHAFT/` (continued in place)
- Manual Test Suite / Traceability Matrix / Coverage Report: `projects/NDC/artifacts/runs/RUN-20260712-002/test_design/`
- Discovery Artifacts + Findings: `projects/NDC/artifacts/runs/RUN-20260712-002/discovery/`
- Project Context: `projects/NDC/artifacts/context/NDC_ProjectContext_BranchAgencyStaff.md`
- **Before executing:** resolve TC-BRANCH-006's charter (confirm `Icn_ThumbDown` is the correct, safe Actions-column selector) ideally in a controlled/observed first pass, given FINDING-004's shared-environment risk.
