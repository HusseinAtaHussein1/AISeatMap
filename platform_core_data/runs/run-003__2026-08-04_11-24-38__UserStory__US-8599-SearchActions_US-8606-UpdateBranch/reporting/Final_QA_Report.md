# Final QA Report — Branch Module

| Field | Value |
|---|---|
| Module | `branch` |
| Run | `run-003__2026-08-04_11-24-38__UserStory__US-8599-SearchActions_US-8606-UpdateBranch` |
| Scope | User Story — US 8599 (Search & Actions Branch), US 8606 (Update Branch), plus the US 8605 (Create Branch) suite carried in the same project |
| Environment | Staging (STG), `http://192.168.1.70` |
| Branch of the pipeline | **Automation** — this report covers automated testing only |
| Basis | Execution Results `rerun-27` (`EXEC-BR-20260815-05`) and `rerun-28` (`EXEC-BR-20260815-06`), Test Cases and Traceability Matrix for `branch`, Project Context, Repair Summary, Quarantine Register |
| Report date | 2026-08-15 (revised the same day after `rerun-28`) |

---

## 1. Executive Summary

**Across two executions today, every automated test that ran, passed — 28 of 28, then 24 of 24.** No
application defect was found in either. No automation broke in either.

Two things were achieved today that had never been achieved before in this module:

1. **The full suite ran end to end** (`rerun-27`, headless, 12 min 38 s). Two healing passes had
   repaired the Search screen, but Create, Search and Update had never been run together to prove
   nothing regressed. An attempt at 15:35 died at login and proved nothing. This one succeeded.
2. **TC-BR-056 executed and passed** (`rerun-28`, 21.3 s) — the first approve-from-grid test ever to
   run in this module. It followed the recovery of `BranchActions_TC`, a suite that `testng.xml` had
   declared for weeks without any class existing behind it.

**Three things stop this being a clean bill of health, and they matter more than the pass rate:**

1. **Two tests that were built to fail have stopped failing — not because the application was fixed,
   but because the tests were changed.** One had its input and its limit lowered until it can no
   longer fail. The other was deleted outright while its documentation was left behind. Both changes
   were committed on 2026-08-15 with the concern recorded in the commit message, and neither is
   recorded in any healing document. Details in §6.
2. **3 of the 32 test cases chosen for automation have still never run.** TC-BR-052 has no test
   method. TC-BR-057 and TC-BR-058 exist and compile, but their run was cut short when the login
   screen stopped working — they were skipped before their first line, so they are neither passed
   nor failed.
3. **TC-BR-001 is still quarantined.** It passed in both runs, and in `rerun-27` it passed under
   exactly the conditions the Quarantine Register asked for — but lifting a quarantine is a human
   decision, not something a passing run does by itself.

**A fourth point is about the environment, not the software:** the application stopped accepting
logins mid-session three separate times today, always after roughly 25 logins. Every test signs in
separately, so a full suite is close to that number. Two tests were lost to it. It is unconfirmed but
consistent with a limit on the QA account, and it puts the tail of every long run at risk.

**Bottom line for a stakeholder:** the Branch module's automated checks are green, the suite now runs
end to end, and grid approval is under test for the first time. But two known problems are no longer
being watched by the tests meant to watch them, and that needs a decision before this suite is treated
as a safety net.

---

## 2. The Pipeline — every stage, and what it produced

The Branch module passed through all six stages plus the optional healing stage. This section states
what each one did and where its output lives, so the report can be read without knowing the pipeline.

| Stage | What it does | Status for `branch` | Output |
|---|---|---|---|
| **1 — Project Context** | Sets scope, environment, roles, and the assumptions and risks later stages must resolve | **Complete**, at Revision 8 | `modules/branch/context/ProjectContext.md` |
| **2 — Discovery / Explorer** | Observes the live application and records what is actually there, with evidence | **Complete** — 3 screen snapshots (Create, Search, Update), 16 findings | `modules/branch/discovery/` |
| **3 — Test Design** | Turns requirements and discovery into traceable test cases | **Complete** — 81 cases designed, 73 review-approved, 32 selected for automation | `modules/branch/test_design/` |
| **4M — Manual Execution** | Runs manual cases by hand. A separate branch of the pipeline that reports itself | **Ran in run-002** for Create Branch. Its results are its own delivery and are **not** counted here | `runs/run-002…/manual_execution/` |
| **4A — Automation Engineering** | Builds the automated suite from the approved cases | **Complete and Approved** 2026-08-14 — SHAFT Engine project, 4 suites | `modules/branch/automation/` |
| **5A — Automation Execution** | Runs the suite and records raw results. Never repairs | **Complete — 28 executions** to date. This report is based on the last two | `runs/…/execution/ExecutionResults*.md` |
| **5H — Self-Healing** *(optional)* | Diagnoses automation failures and repairs them, with human approval | **Ran 4 times**, 2026-08-05 to 2026-08-15. `REPAIR-BR-001`…`014` applied | `modules/branch/healing/` |
| **6A — Reporting** | Turns execution results into this report. Never re-runs or diagnoses | **This document** | `runs/…/reporting/Final_QA_Report.md` |

**Two things worth understanding about this table.**

*Stage 5H is not a normal step.* Healing only runs when a human asks for it, and it is only allowed
to touch failures classified as automation faults — never an application defect. That restriction is
what stops a real bug being "repaired" into silence. It ran four times here because the suite was new
and needed real work; §3.5 explains what that means for reading the pass rate.

*Stage 4M is a different branch, not a missing step.* Manual and automated testing split after Stage
3 and never merge. This report covers automation only. Comparing the two deliveries is a human
judgement, not something this report performs.

## 3. Detailed Execution Report

Two executions are reported. Every test that ran in either one passed. Full per-test detail is in
`execution/ExecutionResults.rerun-27.md` and `…rerun-28.md`.

### 3.1 The two runs

| | `rerun-27` | `rerun-28` |
|---|---|---|
| Execution ID | `EXEC-BR-20260815-05` | `EXEC-BR-20260815-06` |
| Run by | Stage 5A | **Operator, directly** |
| Window | 17:12 – 17:24 | 17:54 – 18:05 |
| Mode | Headless | Not recorded |
| Executed | 28 | 24 |
| Result | **28 Passed** | **24 Passed**, 2 skipped |
| Purpose | First end-to-end run of the whole suite | Verify the recovered `BranchActions_TC` |

### 3.2 By suite, across both runs

| Suite | User Story | Cases | Best recorded result |
|---|---|---|---|
| `CreateBranch_Admin_TC` | US 8605 — Create Branch | 13 | 13 Passed (both runs) |
| `SearchBranch_TC` | US 8599 — Search & Actions | 10 | 10 Passed (both runs) |
| `UpdateBranch_TC` | US 8606 — Update Branch | 5 | 5 Passed (`rerun-27`; not in `rerun-28`) |
| `BranchActions_TC` | US 8599 — Approve / Reject | 3 | **1 Passed** (TC-BR-056), 2 never ran |
| **Distinct cases with a passing result** | | | **29 of 32** |

### 3.3 TC-BR-056 — the one genuinely new result

**`tcBr056_approvePendingBranchFromResultsGrid` — Passed, 21.3 s.**

This is the first approve-from-grid test ever executed in this module. Until today `testng.xml`
declared a `BranchActionsSuite` whose class had never been written, so TC-BR-056, 057 and 058 were
listed as automated while nothing existed to run.

Passing exercised the whole newly recovered path: the provisioner created a Branch and confirmed by
its exact Branch Code that the record was its own, then the mandatory Remarks dialog was filled and
submitted, after which the grid showed the record as `Approved`. It also confirms the application
behaves correctly here — approval from the grid works, and it does require a remark.

### 3.4 Cases in the automated scope that have still never run

| Test Case ID | What it covers | Why it has not run | Classification |
|---|---|---|---|
| TC-BR-052 | Results grid displays all specified columns | **Its test method no longer exists.** The full description is still in `SearchBranch_TC.java`, but the code beneath it was removed, so the file reads as though the case is covered | Not Executed |
| TC-BR-057 | Reject a branch from the grid | **The code now exists and compiles.** Its run was cut short — the login screen stopped rendering, so TestNG skipped it before its first line | Not Executed |
| TC-BR-058 | Approve and Reject capture a Remarks entry | Same | Not Executed |

**None of these is a pass and none is a failure.** TC-BR-057 and TC-BR-058 are a different kind of
gap from TC-BR-052: they are ready to run and simply have not, whereas TC-BR-052 has nothing to run.

### 3.5 Passes of a repaired suite, not first-attempt passes

This suite reached a green state through **four healing passes** (Stage 5H) run between 2026-08-05
and 2026-08-15, recorded in `modules/branch/healing/RepairSummary.md`.

| Fact | Figure |
|---|---|
| Tests explicitly named in an applied repair | **24 of the 28** |
| Remaining 4 (TC-BR-040, 041, 042, 045) | Not named as failing, but they run through `SearchBranch_Page` code that was itself repaired on 2026-08-15 |
| Repairs applied in total | `REPAIR-BR-001` … `REPAIR-BR-014`, plus a Surefire provider fix and a navigation fix |
| Repairs made in either run reported here | **None.** Stage 5H did not run in this cycle |

**Read the passes as "a repaired suite now passes", not "a suite passed first time".** That
distinction is real coverage either way, but a reader is entitled to see that it needed the work.

### 3.6 Quarantined test

**TC-BR-001** (`createBranchWithAllMandatoryFields`) remains **quarantined** — 6 repair attempts on
record, and the original fault that caused the quarantine was never diagnosed to a confirmed cause.

It **passed in both runs today**. That is meaningful, because the Quarantine Register's own
recommendation was to retry it "as the first test in a fresh JVM fork within a larger suite run" —
which is exactly what `rerun-27` was, and `rerun-28` repeated the result.

**It is still reported as coverage that is not currently verified**, per the register. One pass under
the requested conditions is evidence for lifting the quarantine; it is not the lifting itself. That
call belongs to a human, working through Stage 5H.

---

## 4. Passed / Failed Statistics

| Result | `rerun-27` | `rerun-28` |
|---|---|---|
| Passed | 28 | 24 |
| Failed | 0 | 0 |
| Application Failure | 0 | 0 |
| Automation Failure | 0 | 0 |
| **Environment Failure** | 0 | **1** (the login fixture) |
| Skipped / Not Executed | 4 (of the 32-case scope) | 2 |
| Blocked | 0 | 0 |
| Blocked by Execution Safety Policy | **0** | **0** |
| Inconclusive | 0 | 0 |
| Flaky | 0 | 0 |

**Across both runs, 29 of the 32 automated cases now have a passing result** and 3 have never run.

### 4.1 The three health figures, kept separate

| Health figure | Result | What it tells you |
|---|---|---|
| **Application Health** | **0 failures** across both runs | The application behaved correctly in every check that ran, including grid approval for the first time. Read with §6 — two checks that used to guard known defects no longer do |
| **Automation Health** | **0 failures** across both runs | Nothing in the suite is broken. Nothing is waiting for repair. The recovered `BranchActions_TC` compiled and ran correctly on first use |
| **Environment Health** | **1 failure** (`rerun-28`) | The login screen stopped rendering partway through the session, costing 2 tests. `rerun-27` saw no environment problem |

These are never added together. An automation problem and an application defect are facts about
different systems, and the login failure is a fact about neither.

### 4.2 The login problem — three occurrences today

This is the clearest operational risk in the module and it is not a software defect.

| Run | Time | Logins before it broke | What happened |
|---|---|---|---|
| `rerun-26` | 15:35 | ~40 that day | Page served, login submission never redirected |
| `rerun-27` | 17:12 – 17:24 | 28, all succeeded | No failure |
| `rerun-28` | 17:54 – 18:05 | **24 succeeded, then broke** | Login page did not render its fields at all |

Every test builds its own browser and signs in separately, so one full suite is 25–30 logins on a
single account. The failure appears late in a session, after roughly that many. This is **consistent
with rate limiting or lockout on the QA account, but unconfirmed** — confirming it means more login
attempts against an account that may already be limited, so testing stopped instead both times.

### 4.3 Execution stability

| Measure | `rerun-27` | `rerun-28` |
|---|---|---|
| Duration | 12 min 38 s | 11 min 0 s |
| Test-level retries | 0 — no retry policy configured | 0 |
| Flaky tests | 0 | 0 |
| Action-level retries inside passing tests | **52** (50 `isEnabled`, 2 `getText`) across 17 tests | not measured — no console log was captured |

The 52 action retries in `rerun-27` all recovered, so no test outcome was affected. They are reported
because they point to timing fragility in the page objects, and because they explain why a run with
zero failures produced 93 screenshots.

---

## 5. Coverage

Two separate measures. They answer different questions and are never merged.

### 5.1 Requirement Coverage

The Traceability Matrix rolls up requirements for **US 8605 (Create Branch)** only. It does not carry
a roll-up for US 8599 or US 8606, so a single percentage across this run's whole scope cannot be
stated without inventing one.

**For the US 8605 roll-up (15 requirement areas):**

| Coverage Status | Areas | Notes |
|---|---|---|
| Covered | 6 | Branch Details, Email Configuration, Contact Info, Sales Configuration, Product Access Details, Buttons & Actions |
| Covered indirectly | 1 | PRD ORG-03/ORG-04, via the US 5 rows |
| Partially Covered | 1 | US6 §2 Outstanding Threshold — the requirement itself does not state mandatory/optional or format rules |
| Out of Scope | 5 | PAN Number, Department, Import PNR, Payment Gateway, Flight default — each excluded by a recorded module-owner decision, not by oversight |
| Unknown / Unassessed | 1 | US6 §4 Branch Threshold Update — deferred by explicit instruction on 2026-08-03; never designed |

**Findings coverage: 11 of 11** — 4 became regression tests, 7 are documented exceptions. None
uncovered.

**Gap to note:** the Traceability Matrix has no requirement roll-up for the two user stories this run
was actually scoped to. That is a Stage 3 gap, not an execution gap, and it is why this section
cannot give one headline number.

### 5.2 Automation Coverage

Three separate facts, kept apart:

| Fact | Figure | Meaning |
|---|---|---|
| Test cases designed for `branch` | **81** | Everything Stage 3 wrote |
| Review decision | **73 Approved · 8 Rejected** | Whether the case was accepted at all |
| Automation selection decision | **32 Approved · 49 Rejected** | Whether the case was *chosen* for automation |
| Automated and executed | **29** | Of the 32 selected, across both runs |
| Automated and passed | **29** | Of the 29 executed |

| Measure | Value |
|---|---|
| Automation selection rate | 32 of 73 review-approved cases = **43.8%** |
| **Execution rate within automated scope** | 29 of 32 = **90.6%** (was 87.5% before TC-BR-056 ran) |
| **Pass rate within executed scope** | 29 of 29 = **100%** |

**The 49 cases at `Automation = Rejected` are deliberately manual.** They are a decision, not a
coverage shortfall, and they are not counted as an automation gap anywhere in this report.

**The remaining automation gap is 3 cases** — TC-BR-052, 057, 058 (§3.4). All three were selected for
automation and none has run. Two of them (057, 058) now have working code and need only a run;
TC-BR-052 has no code at all.

### 5.3 What these runs did not cover

- **Cross-module interaction was not exercised.** This was a module-scoped execution: it ran the
  Branch project on its own, not the assembled baseline. A single-module pass is not whole-system
  verification.
- **The `agency` module is `Not In Scope For This Run`.** That is not 0% coverage and not an omission
  — it simply was not part of this run's scope.
- **Manual coverage is not reported here.** Stage 4M reports its own results separately. This report
  covers automation only.

---

## 6. Defect Summary

**No application defect was found by this run.** The two entries below are not application defects —
they are gaps in what the tests are still checking, and both need a human decision.

### DEF-REP-01 — TC-BR-026 can no longer fail (High concern)

| Field | Detail |
|---|---|
| Module | `branch` — Create Branch, Sales Configuration |
| Severity | **High** — not because the application is broken, but because a known defect is no longer being watched |
| Requirement | PRD_UserStories.md US 5 §Branch Sales Configuration — Warning Prompt (Days) must reject more than 11 digits |
| Linked finding | FINDING-004 (Bug, Medium) · Risk register: RISK-BR-3 lists this as a Medium business risk |
| Status in this run | Reported **Passed** by the runner |

**What changed.** TC-BR-026 was written as a regression test for FINDING-004 and was documented
everywhere as *expected to fail* until that defect is fixed. In the code that ran:

| | Committed version | What ran |
|---|---|---|
| Value typed into the field | `999999999999999` (15 digits) | `9999999` (**7 digits**) |
| Assertion | `length <= 11` | `length <= 7` |

A 7-digit input checked against a 7-digit limit cannot fail. The 11-digit rule is no longer tested at
all, while the method name, its description, and the Suite Manifest all still say "11 digits" and
still say the test is expected to fail.

**Both edits were committed on 2026-08-15**, flagged in the commit message as needing review. They
appear in no healing record. The
2026-08-06 healing pass explicitly instructed that TC-BR-026 is an Application Failure and *must not*
be repaired. This change is not recorded as a repair by anyone.

**Needs developer and QA investigation.** Either FINDING-004 was fixed — in which case the test should
be restored to prove it — or it is still open, in which case the test should go back to failing
honestly. No code fix is proposed or applied here.

### DEF-REP-02 — TC-BR-052 was deleted, its documentation left behind (High concern)

| Field | Detail |
|---|---|
| Module | `branch` — Search results grid |
| Severity | **High** — an open, unresolved disagreement is now recorded nowhere in the running tests |
| Requirement | US 8599 §Search Result Grid — the grid displays all specified columns |
| Status in this run | **Not Executed** — the test method does not exist |

**What changed.** On 2026-08-15, healing pass `HEAL-BR-20260815-02` deliberately kept this test red.
Its own record states that removing the `State` column from the expected list "would turn this test
green and record an open disagreement as settled — the §8.1 forbidden repair."

The disagreement is genuine and still open: three independent observations say the `State` column is
absent from the grid, and the business owner says it is present.

In the code that ran, the test method `tcBr052_resultsGridDisplaysAllSpecifiedColumns` has been
**deleted**. Its full description — including the paragraph explaining why it must not be weakened —
is still in the file, now sitting above an unrelated helper method. **This change was committed on
2026-08-15, flagged for review, and appears in no healing record.**

Deleting the test achieves what weakening it was forbidden from achieving: the disagreement no longer
shows up anywhere in a test result.

**Needs a human decision**, in this order: settle the `State` column question against the live grid
with the business owner, then decide whether the test returns.

### 6.1 Open items carried in from earlier work

| Item | Status after these runs |
|---|---|
| FINDING-004 (Warning Prompt cap) | **Unverified.** Its regression test no longer tests it — see DEF-REP-01 |
| FINDING-012 | Retracted as a confirmed application defect on 2026-08-14. Not re-raised |
| `State` column disagreement | **Still open, and now untested** — see DEF-REP-02 |
| TC-BR-001 original fault | **Still open.** Passed in both runs, but never diagnosed to a confirmed cause. Quarantine stands |
| Stage 3 documents say "Branch Code" | The grid renders "Code". `TestCases_Branch.md` and `TraceabilityMatrix.md` still carry the wrong label — a Stage 3 correction nobody has made |
| **`BranchActionsSuite` had no class** | **Resolved 2026-08-15.** `BranchActions_TC` was recovered from the remote branch, integrated with `ApprovalStatus`, and TC-BR-056 passed on first use. It stays commented out of `testng.xml` pending review of its isolated execution |
| **Login exhaustion** | **New, open.** Three occurrences today, always after ~25 logins — see §4.2. Not a software defect; needs the environment owner |

---

## 7. Execution Safety

Facts about what this run was authorized to do. **These are not a quality score**, and a high
`Forbidden` count would mean a run was correctly governed, not a failing one.

| Measure | Value |
|---|---|
| Safety preflight completed before any test ran | **Yes** — `metadata/SafetyPreflight.md` |
| Authorizations in force | 4 — CREATE, UPDATE, SUBMIT, APPROVE, all on self-created records only |
| Operations forbidden | 0 |
| Tests blocked by policy | **0** — no test was deselected |
| DELETE operations in the suite | **None**, confirmed by searching the whole test source |
| Records created | Branch records named `QARUN003_<nanoTime>`, left in place; deletion is not authorized |

**One limitation to be honest about:** safety here is enforced *before* the run starts — at preflight
and at test selection. Maven and SHAFT run as an external process, so once testing begins there is no
per-operation check. The declared list of what each test does is what the safety decision rests on.

---

## 8. Carried-Forward Assumptions and Risks

Every item from the Project Context, with what this execution actually settled.

| ID | Type | Status after this run | Basis |
|---|---|---|---|
| ASM-BR-1 | Assumption — exact validation messages unspecified | **Still unverified** | TC-BR-002 / 013 / 021 / 067 confirm that mandatory fields block submission, but none asserts the exact wording of a message |
| ASM-BR-2 | Assumption — free-text fields accept any character | **Still unverified** | No executed case probes character sets |
| RISK-BR-1 | Post Office Box and Credit Limit boundary rules | **Still unverified** | TC-BR-008 and TC-BR-023 are not in the automated scope |
| RISK-BR-2 | Cross-field validation rules | **Resolved on Create** (2026-08-03). **Still unverified on Update** — US 8606 restates both rules and no executed case checks them there |
| RISK-BR-3 | Supplier Credentials PCC removal | **Still unverified** — not observable from the UI |
| RISK-BR-4 | Outstanding Threshold is US 51489's field | **Resolved** (2026-08-03, module owner). Unchanged |
| RISK-BR-5 | Do the Create-screen dispositions extend to Update? | **Still unverified** — no executed case addresses it |
| RISK-BR-6(a) | Do row action icons change with approval state? | **Confirmed** — TC-BR-054 passed, checking icons against a record's approval state |
| RISK-BR-6(b) | Do action rights differ by role? | **Still untested** — only one privileged account exists. (a) passing must not be read as (b) checked |
| RISK-BR-7 | Branch Name search accepts a different character set than Create | **Still unverified** — TC-BR-041 searches by name but does not probe characters |
| RISK-BR-8 | Is "Approval Status" the same axis as the Status filter? | **Partly informed, not resolved** — TC-BR-045 (status filter) and TC-BR-054 (approval status) both pass, but neither settles whether the two are one axis |
| RISK-BR-9 | Pagination behaviour is unspecified | **Partly confirmed** — TC-BR-060 and TC-BR-061 confirm Next and Last page navigation work. Filter-persistence across pages (PRD XC-13) is still unchecked |

**Two of twelve moved.** RISK-BR-6(a) is now confirmed and RISK-BR-9 is partly confirmed. Everything
else stands where it did, which is expected — most of these need cases that were never selected for
automation.

---

## 9. Run Observability

Taken from `metadata/observability/ObservabilityMetrics.json`. Full detail:
[`ObservabilityReport.md`](../metadata/observability/ObservabilityReport.md) ·
[`ObservabilityDashboard.html`](../metadata/observability/ObservabilityDashboard.html).

| Measure | Value |
|---|---|
| Instrumentation status | **Partially Instrumented** |
| Why | No `RUN_STARTED` event exists, so run-level timing was never measured. Every span opened by Stages 5A and 6A was closed |
| Events recorded | 73 — all from skills, 0 from platform tools |
| Stage 5A duration | 18 min 20 s |
| Stage 6A duration | measured across two reporting passes |
| Human decisions requested / resolved | 0 / 0 |
| Tool calls / retries | 0 / 0 |
| **Tests planned / executed / passed / failed** | **58 / 52 / 52 / 0** — cumulative across both cycles |
| Tests skipped | 6 — 4 in cycle 27, 2 in cycle 28 |
| Repair cycles in these runs | 0 |
| Safety preflight completed | Yes. Operation counts: **Unavailable** — the preflight record carries no operation total |
| **Token Usage** | **Unavailable** — no supported run-attributable provider usage source exists |
| **Cost** | **Unavailable** — same reason; nothing is estimated from text length or assumed pricing |

**This run is under-instrumented and is reported as such.** The figures above are real but incomplete.

**Two counting differences worth knowing, so the numbers here are not read against §5's:**

1. **These totals are cumulative across execution cycles, not distinct test cases.** 58 planned means
   32 in cycle 27 plus 26 in cycle 28 — the same case counted once per cycle it appeared in. §5.2's
   "29 of 32" counts each case once. Both are correct; they answer different questions.
2. **The test-design totals cover every module.** The tool reports 134 cases, 110 review-approved and
   43 automation-approved across the whole project, `agency` included. §5.2's figures are `branch`
   alone: 81 cases, 73 review-approved, 32 automation-approved.

---

## 10. Recommendations and Next Steps

All of these need human follow-up. **No code fix has been made or is implied as made.**

### Before this suite is trusted as a safety net

1. **Decide what TC-BR-026 should assert** (DEF-REP-01). Confirm with a developer whether FINDING-004
   is fixed. If it is, restore the 15-digit input and the 11-digit limit so the fix is proven. If it
   is not, the test should go back to failing.
2. **Settle the `State` column question** (DEF-REP-02), then decide whether TC-BR-052 returns. The
   contradiction is between three observations and one statement, and only the business owner can
   close it.
3. **Decide whether the two changes stay.** They are now committed, so the suite that produced these
   results is reproducible — but committing them did not settle whether they are correct. That is
   still items 1 and 2 above.

### Coverage

4. **Re-run TC-BR-057 and TC-BR-058 on their own.** This is the cheapest item on the list and the one
   that closes the most. The code works — TC-BR-056 proved the same path — and two tests is 2 logins
   rather than 25, so the failure that stopped them is unlikely to recur. Until they run, the module
   has no verified coverage of grid rejection.
5. **Correct "Branch Code" to "Code"** in `TestCases_Branch.md` and `TraceabilityMatrix.md`, and remove
   the stale "expected to fail" note for TC-BR-052 from the Suite Manifest.
6. **Add a requirement roll-up for US 8599 and US 8606** to the Traceability Matrix, so requirement
   coverage for this run's actual scope can be stated as a figure.
7. **Decide when `BranchActionsSuite` rejoins `testng.xml`.** It is deliberately still commented out
   pending review of its isolated run. Leaving it commented indefinitely recreates the original
   problem — a suite that looks covered and never executes.

### Environment

8. **Raise the login exhaustion with the environment owner** (§4.2). Three occurrences today, always
   after roughly 25 logins. Either confirm an account limit or rule it out; right now the tail of every
   long run is at risk.
9. **Consider a shared authenticated session** instead of one login per test. That would cut 25+ logins
   to 1 and remove this failure mode entirely. It is an Automation Plan decision, not a repair.

### Suite health

10. **Consider lifting TC-BR-001's quarantine.** It passed under precisely the conditions the register
    asked for, and then passed again. This is a Stage 5H decision, made by a human, and the register
    should record either the lift or why two passes are not yet enough.
11. **Look at the 52 action-level retries** if run time matters — they are a sizeable part of the
    12.5-minute duration and point to timing fragility in the page objects.
12. **Install Java 21, or update the authorization note.** It records Java 21 as the approved JDK and
    calls Java 24 results non-canonical, but Java 21 is not installed on this machine, so no run here
    can currently satisfy it. `rerun-27` used Java 24.0.1.
13. **Fix the credential instructions.** The Automation Summary says two environment variables must be
    set; they are not used, and the credentials are hardcoded in `EnvironmentConfig.java`. (That
    hardcoding is a separate, pre-existing security concern already tracked as KL-03 in the healing
    notes.)

---

## 11. Report Basis

| Input | Present | Used for |
|---|---|---|
| Execution Results (`rerun-27`) | Yes | §3, §4 |
| Execution Results (`rerun-28`) | Yes — **reconstructed from Allure result files** | §3, §4 |
| Test Cases (`TestCases_Branch.md`) | Yes | §5.2 |
| Traceability Matrix | Yes | §5.1 |
| Project Context | Yes | §8 |
| Repair Summary (Stage 5H) | Yes | §3.5, §6 |
| Quarantine Register (Stage 5H) | Yes | §3.6 |
| Observability Metrics | Yes — Partially Instrumented | §9 |

**Declared gaps:**

1. The Traceability Matrix has no requirement roll-up for US 8599 or US 8606, so §5.1 reports the
   US 8605 roll-up only rather than computing a figure from an incomplete basis.
2. **`rerun-28` was run by the operator, not by Stage 5A.** No Surefire report or console log exists
   for it; its results were reconstructed from the Allure result files it left behind. Those files
   record status, timing and failure detail per test, which is enough for every figure this report
   draws from it — but its Execution Mode was never recorded and is left unstated rather than guessed.

**This report covers the automation branch only.** It reports what the artifacts say. It re-ran
nothing, changed nothing, and diagnosed no root cause.
