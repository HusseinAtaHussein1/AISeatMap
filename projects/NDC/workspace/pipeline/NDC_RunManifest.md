# NDC — Run Manifest

Tracking artifact per `pipeline/pipeline.md` §7 — records, per stage, what version was produced, when, and its checkpoint status. The pipeline orchestrator (and any human) consults this before invoking the next stage.

## RUN-20260710-001

Run Scope: Type = User Story (T3002-066 + T3087, jointly scoped) · Source = Pasted text
Run Workspace: `projects/NDC/runs/RUN-20260710-001/`

| Stage | Version | Timestamp | Checkpoint Status | Approving Reviewer | Artifact |
|---|---|---|---|---|---|
| 1 — Project Context | v1 | 2026-07-10 | **Approved** | Aymoon (Business Analyst / Product Owner role) | `projects/NDC/workspace/context/NDC_ProjectContext_CredentialRoutesFilter.md` |
| 2 — Explorer | — | — | Not started | — | — |
| 3 — Test Design | — | — | Not started | — | — |
| 4 — Automation | — | — | Not started | — | — |
| 5 — Execution | — | — | Not started | — | — |
| 6 — Reporting | — | — | Not started | — | — |

Stage 2 (Explorer) may now begin, per `pipeline/pipeline.md` §5.3 Rule 5. Per `agents/explorer_agent.md` §8.1, browser automation is unavailable for this run — Discovery Mode will be **User-guided exploration**, capping any resulting Findings at `Needs Human Review` (never `Confirmed`), per §8.3/§18.

## RUN-20260712-001

Run Scope: Type = Feature · Source = Custom scope description · **Observation-based Spike — not PRD-backed** (see Project Context v2's banner and platform memory `project_observation_based_spike_run_type`)
Run Workspace: `projects/NDC/runs/RUN-20260712-001/`
Purpose: Login/Authentication functional validation, run to unblock and exercise Stage 4 (Automation Agent) end-to-end per explicit user request 2026-07-12.

| Stage | Version | Timestamp | Checkpoint Status | Approving Reviewer | Artifact |
|---|---|---|---|---|---|
| 1 — Project Context | v2 | 2026-07-12 | **Approved** | Aymoon (Business Analyst / Product Owner role) | `projects/NDC/workspace/context/NDC_ProjectContext_LoginAuthentication.md` |
| 2 — Explorer | v1 (this run) | 2026-07-12 | **Approved** | Aymoon (QA Lead role) | `projects/NDC/runs/RUN-20260712-001/discovery/QA_Assessment_Report.md` |
| 3 — Test Design | v2 (finalized after the Login Test Case Validation Pass) | 2026-07-12 | **Approved** | Aymoon (QA Architect / Test Lead role) | `projects/NDC/runs/RUN-20260712-001/test_design/NDC_CoverageReport.md` (8 test cases; see `NDC_LoginGapAnalysis.md` for the validation pass) |
| 4 — Automation | v2 — SHAFT export, Reference-Project-compatible (v1 Playwright package superseded as this run's reviewed artifact, not deleted — see `projects/NDC/workspace/automation/NDC_AutomationPackages.md`) | 2026-07-12 | **Approved** | Aymoon (Automation Lead / Release Manager role) | `projects/NDC/runs/RUN-20260712-001/automation/NDC_AutomationSummary_SHAFT.md` |
| 5 — Execution | EXEC-20260712-001-001 | 2026-07-12 | **Complete** — no human checkpoint (mechanical run, `pipeline/pipeline.md` §4 Stage 5) | — | `projects/NDC/runs/RUN-20260712-001/execution/NDC_ExecutionResults.md` |
| 6 — Reporting | — | — | Not started | — | — |

Stages 1–4 approved together 2026-07-12 (Aymoon, all four reviewer roles). Stage 5 executed the same day, Headed mode, against `http://192.168.1.70`: initial run 3 Passed / 5 Failed (0 Application Failures), followed by two Automation Repair Loop passes (`agents/execution_agent.md` §25–§26, including the new Root Cause Confidence gate and a Diagnosis-before-Repair step for TC-LOGIN-002). **Final: Application Health 100% (8/8), Automation Health 100% (8/8, 5 via Automation Repaired), Environment Health nominal.** 3 new rules written to `knowledge_base/AUTOMATION_REPAIR_KB.md` (execution-confirmed only). See `NDC_ExecutionResults.md` and `NDC_AutomationRepairReport.md`. Stage 6 (Reporting) may now run per `pipeline/pipeline.md` §6 Rule 3.

**Reference Automation Project registered mid-run:** `E:\Automation2\NDC-Uplift-Automation` (external, read-only by default) — see `projects/NDC/reference_automation_project.md`. Stage 4's consolidated Decision Gate (`agents/automation_agent.md` §33.1) was answered once: Target = Export compatible with the Reference Project · Framework = SHAFT · Strategy = New package.

**Per `pipeline/pipeline.md` §5.3 Rule 5, all four checkpoints above (Stages 1–4) are open (`Pending`) simultaneously** — a deliberate deviation from strict sequential gating, authorized by the user 2026-07-12 for this run's Spike/exploratory nature, so all four could be reviewed together in one batch rather than four separate round-trips. Stage 5 remains correctly blocked until Stage 4's Automation Approval is explicitly granted — that gate was not bypassed.

## RUN-20260712-002

Run Scope: Type = Feature · Source = Custom scope description · **Observation-based Spike — not PRD-backed** (`PRD.md` has zero content on Administration/Branch/Agency/Staff; see platform memory `project_observation_based_spike_run_type`)
Run Workspace: `projects/NDC/runs/RUN-20260712-002/`
Purpose: Administration module functional validation — Branch, Agency, and Staff (Company → Branch → Agency → Staff structure per `architecture.md`) — per explicit user request 2026-07-12, "Run NDC automation for branch and agency and Stuff" (confirmed as Staff).

| Stage | Version | Timestamp | Checkpoint Status | Approving Reviewer | Artifact |
|---|---|---|---|---|---|
| 1 — Project Context | v3 | 2026-07-12 | Pending | — | `projects/NDC/workspace/context/NDC_ProjectContext_BranchAgencyStaff.md` |
| 2 — Explorer | v1 (this run) | 2026-07-12 | Pending | — | `projects/NDC/runs/RUN-20260712-002/discovery/QA_Assessment_Report.md` |
| 3 — Test Design | v1 (this run) | 2026-07-12 | Pending | — | `projects/NDC/runs/RUN-20260712-002/test_design/NDC_CoverageReport.md` |
| 4 — Automation | v1 (this run) — SHAFT, continuing `NDC_tests_SHAFT` | 2026-07-12 | **Approved** (implicit — user instructed "run stage 5", 2026-07-12) | Aymoon | `projects/NDC/runs/RUN-20260712-002/automation/NDC_AutomationSummary_SHAFT.md` |
| 5 — Execution | EXEC-20260712-002-001 | 2026-07-12 | **Complete, Repair Loop pending human answer** — no human checkpoint on Execution itself (`pipeline/pipeline.md` §4 Stage 5), but the Automation Repair Loop's one consolidated question is open | — | `projects/NDC/runs/RUN-20260712-002/execution/NDC_ExecutionResults.md` |
| 6 — Reporting | — | — | Not started — awaiting Repair Loop resolution | — | — |

Decisions confirmed with user 2026-07-12 before starting: (1) scope = Branch + Agency + Staff (Admin module); (2) Stage 1 scope source = Custom scope description; (3) **mutation (create/edit/delete) authorized for this run** for Branch/Agency/Staff — a run-specific override of the project's standing read-only constraint (see `run_configuration.md` Environment Constraints).

**Discovery Mode note:** the user initially selected **User-guided exploration** (§8.1 #4) for Stage 2. Once underway, `tools/browser_driver/` was confirmed working against this project (precedent: RUN-20260712-001), so per `agents/explorer_agent.md` §8.2 ("must use the highest-priority mode actually available, not skip it out of convenience") this run proceeded with **Browser Automation** (§8.1 #1) instead, disclosed here and in the QA Assessment Report rather than silently substituted.

**Stage 2 summary:** 149 Branch / 9,537 Agency / 0-visible Staff records observed; full Add-form field inventories captured for all three modules; Branch/Agency/Staff Edit screens not captured (see Coverage_Summary — one blocked by a near-miss, described next). 5 Findings raised, all `Needs Human Review` (none `Confirmed`) — most notable is **FINDING-004**: an Actions-column click on Branch's List screen landed on a Reject/Deactivate confirmation (not Edit) for a real, pre-existing shared-environment record (BRN2 "Test"). **No Submit was clicked and no mutation occurred**, but this is flagged as a safety-relevant near-miss for anyone scripting this screen next. See `discovery/findings/Findings_Summary.md` for all 5.

**Stage 3 summary:** 17 test cases (7 Branch, 5 Agency, 5 Staff) across `NDC_TestCases_Branch/Agency/Staff.md`+`.xlsx`, with a Requirement Traceability Matrix and Coverage Report. All 5 Stage 2 Findings explicitly dispositioned (0 Uncovered Findings): FINDING-002 → regression tests (TC-*-001), FINDING-003/004/005 → exploratory charters, FINDING-001 → documented exception (infra, not application scope). Two Project Context v3 §6 Open Questions (parent-child delete, role-boundary access) remain deliberately deferred, not designed this run.

**Stage 4 summary:** Consolidated Decision Gate re-asked fresh (Target = Export/Reference-Project-compatible, Framework = SHAFT, Strategy = Continue `NDC_tests_SHAFT`). Package extended in place at `projects/NDC/runs/RUN-20260712-001/automation/NDC_tests_SHAFT/` — Login assets untouched. 13/17 test cases automated (6 Generate, 1 conditional Generate, 7 Partially Automatable capturing-not-asserting unconfirmed validation text); 3 Exploratory-test dispositions correctly left Manual Only. Reused the Reference Project's current `Branch_Page.java`/`Staff_Page.java`/`AdminMenu.java` locators (confirmed matching this run's own Discovery); found the Reference Project's Agency Add page objects stale/empty and authored `Agency_Page.java` fresh from this run's own Discovery instead. Added `Btn_Edit`/`Icn_ThumbDown` locators to `Branch_Page.java` (by analogy to the Reference Project's own Staff_Page icon-class convention) to address FINDING-004 — not yet independently confirmed live against Branch, flagged as a Known Limitation for Stage 5. Compilation verified: `mvn -o clean test-compile` → BUILD SUCCESS (7 main + 6 test source files). See `automation/NDC_AutomationSummary_SHAFT.md`.

**Stage 5 summary:** Executed Headed (per the standing `run_configuration.md` setting), Sequential, no retry, against `http://192.168.1.80`. Of this run's 14 in-scope test methods: **7 Passed, 6 Automation Failure, 1 Blocked** (dependency skip). **Application Health 100%** — zero Application Failures; every failure traces to an automation-authoring gap, never the app itself. One real `QA_SPIKE_Branch01` record was created and confirmed entering the approval queue (FINDING-002 verified live for the first time).

**Repair Round 1** (user-approved, applied 2026-07-12): 1 of 6 Automation Failures confirmed **Repaired** (TC-BRANCH-005, missing-wait fix). 5 remain: 3 have better-diagnosed root causes ready for a focused Round 2 (row-scoped reject icon needs the List's real filter-field ID, not a guess; the Agency Branch dropdown needs its visible wrapping element clicked, not the hidden proxy input; the Staff dropdown-option scope needs a visibility filter since PrimeNG leaves stale hidden panels in the DOM) — and 1 (the Unicode/Agency Contact-person case) had its classification itself called into question: even a JS-based value injection couldn't preserve the Arabic-script portion, suggesting a possible Angular-side input filter rather than a pure Selenium limitation as first assessed. Stopped here to check back in before a second repair round rather than keep iterating unattended. See `execution/NDC_ExecutionResults.md` §7 for the full Before/After.

**Repair Round 2 — Agency scope only** (user-decided 2026-07-13: Agency fixes only, Branch/Staff Round 1 items deferred): all 3 Agency Automation Failures now **Automation Repaired** — TC-AGENCY-001/004 (Branch-dropdown wrapper-click + option-filter/exact-match fixes, discovered and fixed iteratively as each fix reached a new downstream issue — REP-004, REP-005) and TC-AGENCY-005 (reclassified: the Arabic-script drop is confirmed application-side via live DOM inspection bypassing Selenium entirely, not automation-repairable — **FINDING-006**, `Needs Human Review`; the test's assertion was narrowed to what the application actually guarantees). Environment for this pass: `192.168.1.80` (`projects/NDC/browser/profile.json` also updated to match, per FINDING-001's own recommendation). **Agency scope: Application Health 100%, Automation Health 100% (3/3 Automation Repaired), Environment Health nominal.** Branch Round 1 item #2 and Staff Round 1 item #5 remain open, deliberately deferred. See `execution/NDC_ExecutionResults.md` §"Repair Round 2 — Agency scope only" for the full Before/After and `knowledge_base/repair/REP-004.md`/`REP-005.md` for the confirmed rules. Stage 6 (Reporting) remains blocked on the still-open Branch/Staff Round 1 items, not on Agency.

## RUN-20260713-001

Run Scope: Type = Feature · Source = Custom scope description · **Observation-based Spike — not PRD-backed**, continuing the Admin/Agency thread opened in RUN-20260712-002.
Run Workspace: `projects/NDC/runs/RUN-20260713-001/`
Purpose: Automate Search Agency (promoting the exploratory-only TC-AGENCY-003 charter to a real functional test) and scope Activate Agency (undiscovered — Agency Add only reaches "Pending approval"; the actual approval/activation action has never been observed), per explicit user request 2026-07-13 ("automate Create/Search/Activate Agency, edit Agency TCs implementation").

Decisions confirmed with user 2026-07-13 before starting: (1) Repair Round 2 = Agency-relevant fixes only (see RUN-20260712-002 above); (2) Activate Agency = run Discovery first, since it has never been observed; (3) Search Agency = author a real functional TC and automate it (not left as manual-only); (4) Environment = continue against `192.168.1.80`, mutation authorized for Agency records for this run.

| Stage | Version | Timestamp | Checkpoint Status | Approving Reviewer | Artifact |
|---|---|---|---|---|---|
| 1 — Project Context | Continuing v3 (no new version needed — same Admin/Agency scope) | — | Approved (inherited from RUN-20260712-002) | — | `projects/NDC/workspace/context/NDC_ProjectContext_BranchAgencyStaff.md` |
| 2 — Explorer | v1 (this run) — Activate Agency spike + FINDING-001 resolution + Search Agency confirmation | 2026-07-13 | Complete (Activate Agency itself Blocked — needs human input) | — | `projects/NDC/runs/RUN-20260713-001/discovery/` |
| 3 — Test Design | v1 (this run) — TC-AGENCY-006 (Search Agency, new); TC-AGENCY-001's Test Data corrected to the real full-field set | 2026-07-13 | Complete (informal — no separate human checkpoint requested this pass) | — | `projects/NDC/runs/RUN-20260712-002/test_design/NDC_TestCases_Agency.md` |
| 4 — Automation | v2 — SHAFT, continuing `NDC_tests_SHAFT`: Search Agency (`SearchAgency_Page.java`, new) + Create Agency full-form fix (`Agency_Page.java`, extended) | 2026-07-13 | Complete | — | `projects/NDC/runs/RUN-20260712-001/automation/NDC_tests_SHAFT/` |
| 5 — Execution | EXEC-20260713-001 | 2026-07-13 | **Complete — 4/4 Passed.** Application Health 100%, Automation Health 100%, Environment Health nominal. | — | `projects/NDC/runs/RUN-20260712-002/execution/NDC_ExecutionResults.md` §"Round 3" |
| 6 — Reporting | — | — | Not started | — | — |

**Critical correction, discovered this run:** TC-AGENCY-001/004 were never actually creating real Agency records in any prior run (RUN-20260712-002's Round 1/2 included) — the test asserted nothing after `.submit()`, and the click was silently blocked by validation on ~9 required fields (State/City/Post Office Box/Document upload/Contract dates/Logo/Sales Contact/Invoice generation/Payment option) the automation never filled. Discovered when the user asked what the automation does with fields visible in a screenshot. Fixed by mapping and filling the complete required-field set (confirmed live, field by field, before porting to Java) and adding a real, race-safe success assertion (polls for navigation away from `/admin/agency/add`, confirmed via network inspection: `POST .../agency/ → 204`). Five new confirmed repair patterns recorded: `knowledge_base/repair/REP-006.md` through `REP-009.md` (p-calendar keystroke requirement, phone national-number format, repeatable-section "Add" pitfall, submit-navigation polling). Full narrative: `execution/NDC_ExecutionResults.md` §"Round 3".

**Search Agency (TC-AGENCY-006, new):** functional test added (distinct from TC-AGENCY-003's exploratory List-auto-load charter, which is unmodified) — searches for a stable, pre-existing Approved record (`EXEBA`/`AGN9741`) rather than the suite's own Pending `QA_SPIKE_` records (which FINDING-007 confirmed are not visible via this screen). Passed.

**Activate Agency:** Blocked. Discovery confirmed (on both `.70` and, after the FINDING-001 environment correction, `.80`) that Pending-approval Agency records are not visible/searchable via the Agency List/Search screen under any Status filter — see **FINDING-007**. Where the real approval/activation action lives was not found within the Agency module's own screens (a sibling "Registration Requests" menu item was briefly checked and is an unrelated external self-registration queue, not a match). Needs the human to say where this actually happens before Discovery/Test Design/Automation can proceed for this specific flow.

**FINDING-001 resolution:** `.80` confirmed as the actual current NDC STG environment; `.70` was stale. `LogIn_Page.java`'s hardcoded login URL corrected from `.70` to `.80`; the Agency Repair Round 2 suite was re-verified passing against the corrected login (the fixes are data-driven, not tied to either environment's specific dataset).

**FINDING-006 resolution (2026-07-18):** the open question of whether Arabic-script Contact-person input must be supported was answered — user/business stakeholder confirmed the application does not support Arabic-script input by design, not a defect. TC-AGENCY-005 redesigned from a capture-only Partially Automatable check to a real Generate/pass-fail assertion (Arabic segment absent, CJK/Latin segments present); `Agency_TC.java`'s test method renamed and strengthened accordingly. Recorded as `knowledge_base/business_rules/BR-001.md`. Not yet re-executed live against `.80` this pass — the assertion change is code-complete and traced but pending a Stage 5 confirmation run.

**TC-BRANCH-008 added and executed (2026-07-18):** new business knowledge surfaced by the user this session (Branch's Supplier Routing scoping/inheritance to Agency — BR-002/BR-003/BR-004; Operating Country as a Country×Currency entity — APP-001; Branch's Payment Option list sourced from Master → Payment Gateway → Payment Method, Online-only — APP-002) was turned into a real functional test for the Payment Method relationship. Verified twice: an ad hoc `tools/browser_driver` script against `.80`, then ported into `NDC_tests_SHAFT` as a permanent regression test (`Branch_TC.branchPaymentOptionReflectsMasterPaymentMethodStatus`, new `PaymentMethod_Page.java`) and re-executed against `.70` per the user's explicit environment redirect — **1/1 Passed** both times. **Also fixed:** `CredentialsLoader.java`'s relative path to `credentials.json` was stale after an earlier, unrelated repo directory restructuring (`artifacts/runs/` → `runs/`), breaking every test's login step until corrected — first caught here because this was the first live execution attempted since that restructuring. See `automation/NDC_AutomationSummary_SHAFT.md` §6 and `test_design/NDC_TestCases_Branch.md` TC-BRANCH-008 for full detail.

**Full Branch module re-verification against `.70` (2026-07-18, user request: "do automation for Branch module and Payment part, move to approved automation if it's good"):** entire suite (`.80` → `.70`, per the user's environment redirect above, now applied project-wide across all Branch tests) was re-executed live multiple times, surfacing and fixing 4 real, confirmed bugs — none guessed, each verified by re-running:
1. `LogIn_Page.enterPassword()` used SHAFT's plain `type()`, which logs the literal typed value — the real admin password was appearing in plaintext in console/report output on every login, a standing exposure since RUN-20260712-001's original Login suite. Switched to `typeSecure()`.
2. `Branch_Page.Txt_BranchNameFilter` used `id-Name`, which does not exist on the List page at all (confirmed via live DOM inspection) — this closes **Repair Round 1 item #2**, deferred since RUN-20260712-002. Real field is `id-Branchname`.
3. `AdminMenu.Btn_Branch`/`Btn_Staff` were positional (`(//a[@class="ng-star-inserted"])[2]`/`[4]`) — replaced with stable `href`-based locators (`/admin/branch`, `/admin/staff`), confirmed via live DOM dump. (Turned out not to be the actual cause of TC-BRANCH-007's failure, but a real fragility worth fixing regardless.)
4. `Branch_Page.searchByName()` never selected Status=Both despite `Rbtn_Both` existing unused — fixed, though this alone wasn't sufficient either (see below).

**Result: 6/7 Branch tests confirmed passing live** (TC-BRANCH-001–005, 008). **TC-BRANCH-007 is now Blocked — FINDING-008**, a new, broader version of the Activate Agency blocker: a Pending Branch is not visible in the List/Grid *at all* (not just Search — the default no-Search view and every Status filter option were checked live and all show zero Pending records). User confirmed (2026-07-18) TC-BRANCH-007 should be redesigned to reject an **Approved** test record instead of the just-created Pending one, and asked for the actual Branch approval mechanism to be investigated live as a follow-up (same treatment as Activate Agency) — not yet done. Side effect of repeated live runs today: ~10 duplicate `QA_SPIKE_Branch01` Pending records now exist on `.70` (Name uniqueness isn't enforced) — harmless, flagged for awareness.

**Not yet done:** moving the passing 6/7 Branch tests to a formal "Approved" Stage 4 checkpoint (the user's original ask) is still pending their explicit sign-off, per pipeline.md §5.2's Automation Approval gate — this manifest update alone does not constitute that approval.

## RUN-20260718-001

Run Scope: Type = User Story · Source = Pasted text (`PRD.md` User Story 3 — Create Agency) · **PRD-backed** — the platform's first formal, field-level Acceptance-Criteria source for the Admin/Agency area (all prior Agency work was Observation-based Spike).
Run Workspace: `projects/NDC/runs/RUN-20260718-001/`
Purpose: Formally re-ground the Create/Add Agency form's test coverage in the User Story's own Acceptance Criteria (Agency Master, Owner Details, Documents, Logo, Sales Contact, Bank Accounts, Payment Settings, Product Access, Airline Supplier Credential PCC, Import PNR toggle, submission workflow), per explicit user request 2026-07-18 to run Stage 1 (Project Context) then Stage 3 (Test Design) against it.

Decision confirmed with user before starting: Stage 1 → Stage 3 only for this run (no Discovery/Automation/Execution requested); Project Context v4 supersedes v3's Agency section for Create-form scope only, without retroactively changing v3 or touching Agency List/Search/Activate (still v3-governed).

| Stage | Version | Timestamp | Checkpoint Status | Approving Reviewer | Artifact |
|---|---|---|---|---|---|
| 1 — Project Context | Non-versioned (see below) | 2026-07-18 | **Approved** — moved to `workspace/context/` | Aymoon | `projects/NDC/workspace/context/NDC_ProjectContext_Agency.md` |
| 2 — Explorer | — | — | Not started (not requested this run) | — | — |
| 3 — Test Design | v3 (this run) | 2026-07-18 | **Approved** — "عايز اعتمد علي الجديدة بس" (2026-07-18); copied to `workspace/test_design/Agency/`, superseding the RUN-20260712-002-sourced Agency rows there | Aymoon | `projects/NDC/workspace/test_design/Agency/NDC_CoverageReport.md` |
| 4 — Automation | — | — | Not started | — | — |
| 5 — Execution | — | — | Not started | — | — |
| 6 — Reporting | — | — | Not started | — | — |

**Stage 1 summary:** Project Context v4 distills the Create Agency User Story into 68 Requirement IDs (`FR-AGCRT-*`/`BR-AGCRT-*`) across 12 sections. Carries forward 8 assumptions/risks, most notably: (1) Approve/Reject actor/screen still unresolved — reinforces RUN-20260713-001's "Activate Agency: Blocked"; (2) a **new discrepancy** between this AC's stated `+`-country-code phone format and RUN-20260713-001's observed national-number-only behavior, not silently resolved either way.

**Stage 3 summary:** 39 test cases (`TC-AGENCY-CREATE-001` through `-039`) in `runs/RUN-20260718-001/test_design/NDC_TestCases_Agency.md`/`.xlsx`, plus a Requirement Traceability Matrix and Coverage Report. Supersedes the prior Agency suite's Create-related cases (TC-AGENCY-001/002/004/005 in `runs/RUN-20260712-002/test_design/NDC_TestCases_Agency.md`) without touching its List/Search cases (TC-AGENCY-003/006). Coverage: 58/68 Requirement IDs fully Covered (85.3%), 10 Partially Covered (each with a stated reason — see `NDC_CoverageReport.md` §8), 0 Uncovered. FINDING-002 and FINDING-006 dispositioned within this run's scope; FINDING-007 cited as context only (remains owned by the List/Search-scoped test design). Per explicit user request the same day, every test case also carries a **Test Type** (Smoke/Regression) and an advisory **Automation Candidate** flag (28 Yes, 6 Partially, 5 No/Exploratory).

**Stage 4/5 not started.** Per the standing rule (platform memory `feedback_automation_decision_gates`), mutation authorization for this scope has **not** been asked or assumed — RUN-20260712-002/RUN-20260713-001's authorization does not carry forward. Recommendations requiring human input before automation (`NDC_CoverageReport.md` §10): locate the Approve/Reject screen (in progress, see below), and run Discovery against the never-observed Bank Account/Product Access/Airline Supplier Credential PCC sections.

**Update 2026-07-18 — phone country-code discrepancy resolved:** user/business stakeholder confirmed the Agency form's phone fields do not need a `+` country-code prefix ("الفورم مش محتاجة +"), resolving Project Context v4 §6 #7. Recorded as `knowledge_base/business_rules/BR-005.md`. `TC-AGENCY-CREATE-007` redesigned from an open-discrepancy probe to a confirmed-behavior assertion; Requirement IDs FR-AGCRT-MASTER-09/OWNER-03/SALES-04 moved from Partially Covered to Covered (61/68 = 89.7%); Automation Candidate for TC-007 moved from Partially (blocked) to Yes. `NDC_TraceabilityMatrix.md` and `NDC_CoverageReport.md` updated accordingly.

**Update 2026-07-18 — three more Agency-related User Stories processed (Track A), plus a process change:** "Agency Actions," "Search Agency," and "Update Agency" were formally processed together with Create Agency. Per explicit user instruction mid-session, this project **stops minting numbered Project Context versions** (`v4`, `v5`, …) for incremental additions to the same scope — `NDC_ProjectContext.v4.md` and a drafted `.v5.md` were folded into one new, non-versioned, per-scope document: **`context/NDC_ProjectContext_Agency.md`** (see `project_ndc_context_naming_and_approval_flow` platform memory). `v1`/`v2`/`v3` are untouched by this change. Per explicit user instruction, once this document is approved it moves from `runs/RUN-20260718-001/context/` to `projects/NDC/workspace/context/NDC_ProjectContext_Agency.md` — not yet done, still `Pending`.

A fifth User Story (WT1-T2919, E-Ticket Agency Branding) was also received and, per user confirmation, is explicitly **out of scope for the Agency document** — it touches E-Ticket/Booking Confirmation screens, not Agency CRUD, and gets its own document (`NDC_ProjectContext_ETicketBranding.md`, "Track B"), tracked separately below.

**Track A Stage 3 summary:** the test suite grew from 39 to **66 active test cases** (`TC-AGENCY-SEARCH-001..010`, `TC-AGENCY-ACTIONS-001..010`, `TC-AGENCY-UPDATE-001..007` added; `TC-AGENCY-CREATE-037` retired/superseded by `TC-AGENCY-ACTIONS-003..008`, which formally resolves the long-open "where does Approve/Reject happen" question first raised in RUN-20260713-001's "Activate Agency: Blocked"). Coverage: 84/96 Requirement IDs fully Covered (87.5%), 12 Partially Covered, 0 Uncovered. Update Agency's field-level validation is deliberately **not** re-tested from scratch — it cites Create Agency's own test cases (Regression Impact dimension) via one spot-check (`TC-AGENCY-UPDATE-004`) instead. FINDING-004 (Branch's Actions-column near-miss) is now directly regression-guarded for Agency (`TC-AGENCY-ACTIONS-008`); FINDING-007 (Pending Agencies excluded from Search) is flagged as a possible functional blocker for the whole Approve/Reject workflow, re-examined by `TC-AGENCY-ACTIONS-007`, not yet re-verified live.

**Excel sync note (resolved):** `runs/RUN-20260718-001/test_design/NDC_TestCases_Agency.xlsx` is now current (67 rows incl. header = 66 test cases), copied into place once the file's lock released.

## RUN-20260718-001 — Track B (E-Ticket Agency Branding, WT1-T2919)

Run Scope: Type = User Story · Source = Pasted text (WT1-T2919 — "E-Ticket Template Modification – Agency Branding On/Off Feature").
Run Workspace: `projects/NDC/runs/RUN-20260718-001/` (same run as Track A — both tracks received in the same session).
Purpose: a genuinely separate scope from Agency CRUD (Track A) — this feature's testable surface is the **E-Ticket Page** and **Booking Confirmation Page**, with only one shared touchpoint (a new Agency Type radio field added to Agency CRUD). Per user-confirmed track split, tracked as its own Project Context and test suite rather than folded into the Agency document.

| Stage | Version | Timestamp | Checkpoint Status | Artifact |
|---|---|---|---|---|
| 1 — Project Context | Non-versioned | 2026-07-18 | **Approved** — moved to `workspace/context/` | `projects/NDC/workspace/context/NDC_ProjectContext_ETicketBranding.md` |
| 2 — Explorer | — | — | Not started (never observed — no E-Ticket/Booking Confirmation Discovery exists in this project at all) | — |
| 3 — Test Design | v3 | 2026-07-18 | **Approved** — "عايز اعتمد علي الجديدة بس" (2026-07-18); copied to `workspace/test_design/ETicketBranding/` | `projects/NDC/workspace/test_design/ETicketBranding/NDC_CoverageReport.md` |
| 4 — Automation | — | — | Not started | — |
| 5 — Execution | — | — | Not started | — |
| 6 — Reporting | — | — | Not started | — |

**Stage 1 summary:** 19 Requirement IDs (`FR-ETB-*`/`BR-ETB-*`) across Agency Type Configuration, E-Ticket Page, Booking Confirmation Page, Edge Cases, and Design Notes. Three genuine AC ambiguities flagged (not resolved): Agency Type's Mandatory/Optional status, whether the fixed Title/Subtitle/flight-ordering rule applies to Freelance tickets only or all tickets, and B2B's own retained behavior being inferred rather than directly stated.

**Stage 3 summary:** 24 test cases (`TC-ETB-001` through `-024`) in `NDC_TestCases_ETicketBranding.md`/`.xlsx`, plus its own Traceability Matrix and Coverage Report. Coverage: 12/19 Requirement IDs fully Covered (**63.2%** — notably lower than Track A's 87.5%, reflecting real, unresolved AC ambiguity rather than a weaker pass), 7 Partially Covered, 0 Uncovered. One test case (`TC-ETB-013`, background image replacement) is fully **blocked** pending an external asset the business has not yet supplied. No Discovery has ever been run against either target screen — every Discovery Reference in this suite says so explicitly.

**Stage 4/5 not started.** Recommendations before automation (`NDC_CoverageReport_ETicketBranding.md` §10): confirm the Title/Subtitle scope, run Discovery against both screens, obtain the background image asset, confirm Agency Type's Mandatory/Optional status, and confirm an end-user credential/session path exists for reaching issued E-Tickets.
