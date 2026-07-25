# NDC — Manual Execution Summary — Agency (Create · Search · Update · Actions)

**Run:** RUN-20260725-001 · **Date:** 2026-07-25 · **Environment:** Shared staging, `http://192.168.1.70` · **Produced by:** Manual Execution Agent (Stage 4)

## 1. Execution Summary

Executed the Smoke/P1 subset (16 of 66 approved Agency test cases) against the live shared staging environment, by explicit user scope decision given the setup cost per case and the volume of live records each case creates/mutates. **13 Passed, 2 Failed, 1 Inconclusive.** The remaining 48 Regression-tagged cases are `Not Executed` (deferred, not dropped) and 2 cases are `Superseded` per the Test Suite's own text. Three new Agency records were created this run (`QA_SPIKE_1`/`AGN10205`, `QA_SPIKE_027B`/`AGN10206` — later renamed `QA_SPIKE_027B_EDITED`, `QA_SPIKE_030A`/`AGN10207`); no pre-existing record on the shared environment was modified, per the user's explicit mutation-scope authorization for this run.

**Excluded from the Automation Candidate Package, with reason:**
- `TC-AGENCY-CREATE-030` — Failed (see §5).
- `TC-AGENCY-CREATE-032` — Inconclusive (see §6).
- All 48 Not Executed / 2 Superseded cases — never executed this run, so there is no execution-based confirmation to offer Stage 5.

## 2. Real, Evidence-Based Discrepancies Found This Run

These are new findings from this execution, not previously documented in the Project Context, Test Design, or prior Discovery runs:

1. **Undocumented mandatory "IATA Number" field.** Selecting `IATA Agency = Yes` on the Add Agency form reveals a mandatory "IATA Number" text field that appears nowhere in the Project Context or Test Design's field tables. Worked around this run by keeping `IATA Agency = No` for the baseline positive-path cases; `TC-AGENCY-CREATE-009` (Regression, Not Executed this run) will need to account for it when it runs.
2. **Product Access / Airline Supplier Credential (PCC) sections are Branch-dependent, not simply "missing."** An earlier Discovery-derived finding (FINDING-008) characterized these sections as absent from the live form. This run found they render, and auto-populate from the Branch's own configuration, **only after a Branch is selected** — confirmed live for the `Alexandria (BRN9)` branch. FINDING-008 may be branch-specific (a branch with no configured Product/PCC data) rather than a form-wide absence; worth re-checking against the specific branch FINDING-008 used.
3. **Documents and Sales Contact sections' own "Add" buttons append a second, empty, `Required` row.** Already documented for Documents specifically (Automation Decision Report, `CREATE-015`); this run confirms the same quirk applies to Sales Contact (`CREATE-020`'s territory) too. Do not click these "Add" buttons unless deliberately adding a second entry.
4. **Agency Name uniqueness is enforced server-side** ("Agency Name is already exists") — resolves Project Context §6 Q4's previously untested open question.
5. **A freshly-submitted Pending Agency was found via Search with Status=Both.** This appears to **resolve FINDING-007** (Pending Agencies previously excluded from Search/List) for the current Search Agency screen — worth a deliberate re-confirmation pass, but this run's direct observation (three separate Pending agencies, all found) is a consistent signal.
6. **Credit Limit (50000), Top-up Limit (500000), and Credit Terms/Days (1) carry non-empty backend defaults on a blank Add form**, not only on Update as previously documented (`Agency_Update.md`). Submissions that never touch these fields still succeed with these default values.

## 3. Known Limitations

- **Scope**: only the Smoke/P1 subset (16/66) was executed this run — a deliberate, user-confirmed scope decision, not a coverage claim. The 48 Regression-tagged cases (matrix-style negative/boundary/exploratory checks — e.g. `CREATE-002`'s 28-field blank-check matrix) remain genuinely unexecuted.
- **TC-AGENCY-CREATE-032 (Inconclusive)**: the attempt to isolate the PCC section's own "clear" control hit a selector-ambiguity issue (see Results §2) and could not be re-attempted with a precisely-scoped selector within this run's remaining budget.
- **Project Context header discrepancy**: `workspace/context/ProjectContext_Agency.md` still reads `Status: Pending` in its own header despite living at the canonical "approved" path. User explicitly directed proceeding without correcting this — flagged here for visibility, not silently normalized.
- **Environment Profile correction made this run**: `platform_core_data/browser/profile.json`'s `defaultBaseUrl` was reverted from `.80` back to `.70` (see file's own revision note) — the `.80` value set 2026-07-13 per FINDING-001 no longer matched where live login actually redirects. Anyone re-running this suite should get the corrected profile automatically; flagged here in case `.80` reappears elsewhere in this project's docs.
- No video/session-recording or persisted browser console/network log evidence was captured — only screenshots and page-text extraction, per §7 of the Manual Execution Agent's own contract ("name explicitly what wasn't captured and why"). Network/dialog capture was used once, diagnostically, for `CREATE-001`.

## 4. Automation Candidates

Applied the qualifying criteria in full (Manual Execution Agent skill §9.1): Passed this run, deterministic/objectively verifiable, consistent across every execution this run, and not dispositioned Exploratory by Test Design. 13 of the 16 executed cases qualify — see the standalone `AutomationCandidatePackage_Agency.md` for the full list and citations. `CREATE-030` (Failed) and `CREATE-032` (Inconclusive) are excluded per criterion 1; the 48 Not Executed / 2 Superseded cases were never executed so offer no execution-based confirmation.

## 5. Recommendations

Full defect documentation (Preconditions, Test Data, Steps, Expected/Actual, Impact, Root Cause, Conclusion, Severity, Priority, Evidence) for both Failed cases and the one Inconclusive case is in `ManualExecutionResults_Agency.md` §2.2, written to the Defect Documentation Standard (`.claude/skills/manual-execution-agent/SKILL.md` §10.1) and ready to paste directly into Jira/Azure DevOps.

1. **TC-AGENCY-CREATE-030 — Failed, Severity High, Priority P1.** Product Access's stated Mandatory fields (`FR-AGCRT-PRODUCT-01/02/04/06`) do not block submission when the entire section is left untouched — likely because validation runs per-row rather than checking the collection isn't empty (see Results §2.2 for full Root Cause reasoning). Recommend confirming with the business/dev team whether zero product access is ever a legitimate Agency state; if not, file against `FR-AGCRT-PRODUCT-*` as a genuine validation gap, not a test-design error.
2. **TC-AGENCY-ACTIONS-002 — Failed, Severity High, Priority P1.** Approve/Reject icon visibility hides only the *matching* action for the row's current decision (Approve hidden once Approved, Reject hidden once Rejected) rather than hiding both once the row leaves Pending — confirmed by two independent row observations (see Results §2.2). Recommend confirming with the business team whether reversing a decision from the grid is intended; if not, this is a real workflow-control gap allowing an Approved/Rejected Agency's decision to be silently reversed with no secondary review.
3. **TC-AGENCY-CREATE-032 — Inconclusive, not a confirmed defect.** Re-run with a selector precisely scoped to the PCC section's own dropdown (e.g., locate by the PCC section's container, not a page-wide `.p-dropdown-clear-icon` query) before concluding Pass or Fail. The adjacent, structurally similar Product Access finding (#1 above) makes a similar PCC gap plausible, but this must be independently confirmed, not inferred.
4. **Undocumented "IATA Number" field** (§2 #1) — escalate to Test Design as a discrepancy so `TC-AGENCY-CREATE-009` (IATA Yes/No, Regression, not yet executed) accounts for it when it runs.
5. **Follow-up run recommended** for the 48 Not Executed Regression-tagged cases, especially the larger negative-value matrices (`CREATE-002`, `-025`, `-038`, `-039`) and the Update/Actions Regression cases (`UPDATE-003…007`, `ACTIONS-008`, `-010`) not covered by this Smoke pass.

## 6. Inputs for Automation Agent

Per the Manual Execution Agent's own Handoff Contract (skill §20.2) — confirming every input the Automation Agent's specification (`​.claude/skills/automation-agent/SKILL.md` §4) declares it needs from this stage is present:

| Automation Agent needs | Satisfied by |
|---|---|
| Automation Candidate Package (Primary) | `AutomationCandidatePackage_Agency.md` (this run's folder) |
| Manual Execution Summary (Secondary) | This document |
| Manual Test Suite / Traceability Matrix / Coverage Report (unchanged pass-through) | `workspace/test_design/Agency/TestCases_Agency.md`, `TraceabilityMatrix.md`, `CoverageReport.md` — this agent did not modify any of them |
| Project Context | `workspace/context/ProjectContext_Agency.md` (unchanged pass-through; header discrepancy noted in §3 above) |

**Note for Stage 5:** an Agency SHAFT automation package already exists (`runs/RUN-20260718-001/automation/`, merged to `main` per the repo's commit history) — generated directly from Discovery + Test Design, without a prior Manual Execution pass. This run's Automation Candidate Package is the **first execution-confirmed** candidate set for Agency; reconciling it against the already-generated package (which cases it actually covers vs. this run's 13 confirmed candidates) is a Stage 5 decision, not made here.
