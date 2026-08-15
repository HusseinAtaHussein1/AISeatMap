# Execution Results — Rerun 26 (ABORTED — Environment Failure, no test result produced)

**Cycle:** 26 · **Type:** Full-suite regression run requested after Healing Pass `HEAL-BR-20260815-02`
**Outcome: this run proves nothing about the repaired suite.** Authentication never succeeded, so no
test method ever executed. It is recorded because it happened and because it is evidence about the
environment — not because it carries a verdict on any test.

## 1. Execution Metadata

| Field | Value |
|---|---|
| Execution ID | EXEC-BR-20260815-04 |
| Module | `branch` |
| Intended scope | Full suite via `testng.xml` — `CreateBranch_Admin_TC` 13 · `SearchBranch_TC` 11 · `UpdateBranch_TC` 5 |
| Environment | Staging (STG), `http://192.168.1.70` |
| Mode | Headed |
| Framework | SHAFT Engine 7.4.20231015 / TestNG / **Java 24.0.1** / Chrome 150 |
| Started / Aborted | 2026-08-15T15:35 / 15:37 (+03:00) |
| Duration | 143.7 s — all of it spent failing to log in |

## 2. Result

```
Tests run: 87, Failures: 3, Errors: 0, Skipped: 84
```

**Read this correctly.** 87 is 29 tests counted across the three `testng.xml` suite blocks. The 3
failures are all `TestBase.setUp`, once per block. The 84 skips are every test method, skipped by
TestNG because its setup never completed. **Zero test methods ran.**

## 3. Classification: Environment Failure

```
TestBase.setUp:37 — Timeout
Expected condition failed: waiting for AdminPages.Login.LogIn_Page$$Lambda...
(tried for 30 second(s) with 500 milliseconds interval)
```

`LogIn_Page.loginAsSuperAdmin` waits for the browser URL to leave `/auth/login` after submitting
credentials. It never did, on any of the three attempts.

**Per `self-healing-skill` §5 this is an `Environment Failure` and is not eligible for healing.** The
fix, if one is needed, is to the environment or the account — not to the automation.

### What was ruled out

| Check | Result |
|---|---|
| Is the server reachable? | **Yes** — `HTTP 200`, 6691 bytes, at 15:39 |
| Did the browser reach the app? | **Yes** — `Navigate to url "http://192.168.1.70"` succeeded every time |
| Is this a regression from this session's repairs? | **No.** Nothing in either healing pass touched `LogIn_Page`, `TestBase`, or authentication. The failing test list includes `CreateBranch_Admin_TC` tests untouched all session |
| Was login working earlier today? | **Yes** — every run up to 15:33 authenticated normally, including the 11-test `SearchBranch_TC` run that finished 2 minutes before this one started |
| Is it isolated to the full-suite run? | **No** — a single-test check at 15:38 (`TC-BR-004`) failed identically |

So: the server answers, the page loads, and the login submission does not complete. The failure sits
between the login request and the redirect.

### Leading hypothesis — not confirmed

**A large number of authentications were performed against this one account today.** Every test in
this suite constructs its own WebDriver and logs in separately, and this session ran roughly 40 test
methods plus this aborted run's 3 setup attempts. Account lockout or rate limiting on repeated logins
would produce exactly this signature: the server healthy, the page served, the credential submission
accepted but never redirecting.

**This is a hypothesis with a matching signature, not a diagnosis.** It was not confirmed, because
confirming it would mean more login attempts against an account that may already be rate-limited.
Testing stopped instead.

## 4. Action taken

**None, deliberately.** No repair was proposed, no code changed, no retry loop run. Under §16, an
environment that cannot be reached is a stop condition for verification, not a problem to fix in the
automation.

## 5. Consequence for this session's repairs

The repaired `SearchBranch_TC` remains verified by `ExecutionResults.rerun-25.md` — 11 tests, 10
passing, run at 15:33 under working authentication.

**`CreateBranch_Admin_TC` and `UpdateBranch_TC` remain unverified since the refactor and both healing
passes.** They were last confirmed at 13:24 today (4 targeted tests passing). The full-suite
confirmation that was requested has not been obtained, and this file must not be read as providing
it.

## 6. Correction recorded with this cycle

Earlier artifacts from this session (`ExecutionResults.rerun-24.md`, `rerun-25.md`, and both
2026-08-15 sections of `RepairSummary.md` / `BeforeAfterComparison.md`) recorded the runtime as
**Java 21**. That was carried over from this module's earlier run records and was never verified for
these runs.

**Every run this session used Java 24.0.1** — confirmed by `mvn -version` (`runtime:
C:\Program Files\Java\jdk-24`) and by the Selenium capabilities block in this cycle's own report
(`java.version: '24.0.1'`). All six occurrences have been corrected in place.

This matters for this module specifically: its history treats the JDK as a variable that changed
which tests failed (`rerun-16` under Java 24 versus `rerun-19` under Java 21). Recording the wrong
runtime would have made those comparisons unsound.
