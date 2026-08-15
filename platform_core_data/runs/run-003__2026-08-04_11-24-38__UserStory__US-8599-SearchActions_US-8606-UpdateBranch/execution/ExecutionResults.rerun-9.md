# Execution Results — run-003__2026-08-04_11-24-38__UserStory__US-8599-SearchActions_US-8606-UpdateBranch (rerun-9)

**Note on cycle labelling:** Isolated quarantine-recovery verification, requested 2026-08-14, of **TC-BR-001 only**. TC-BR-001 is quarantined (`QuarantineRegister.md`, 4 prior attempts across HEAL-BR-20260805-01 / HEAL-BR-20260806-01 / HEAL-BR-20260809-01, reaching the §14 attempt limit). This run is an explicitly human-authorized attempt beyond that limit, run to gather diagnostic evidence in isolation — **it does not reset or silently extend the historical attempt count**, and no repair was proposed or applied before, during, or after it. **No code, configuration, assertion, wait, or test data was modified before or during this run.**

## 1. Execution Metadata

| Field | Value |
|---|---|
| Execution ID | `EXEC-BR-20260814-02` |
| Run Folder | `run-003__2026-08-04_11-24-38__UserStory__US-8599-SearchActions_US-8606-UpdateBranch` |
| Execution cycle | 10 (isolated quarantine-recovery verification — standalone, not part of any healing pass's own numbered cycle count) |
| Modules executed | branch |
| Module scope | single |
| Run Scope Type / Run Type | Selective Re-run — exactly 1 test, no others |
| Environment | Staging (STG), shared internal/LAN |
| Target URL | `http://192.168.1.70` |
| Framework | SHAFT Engine 7.4.20231015 (Java) / TestNG |
| Suite executed | `artifacts_rerun-9/testng-verify-001-isolated.xml` — scoped to exactly `tcBr001_createBranchWithAllMandatoryFields` in `CreateBranch_Admin_TC`, run alone |
| Suite code state | Unchanged from the Approved HEAL-BR-20260809-01 pass — no repair, no code edit, before or during this run |
| Execution Mode | **Headed** (`-DheadlessExecution=false`), per explicit instruction |
| Concurrency Mode | Sequential (single test, single fork) |
| Retry Policy | No TestNG-level retry configured. No internal `withStaleRetry`-style catch applies to this failure point (see §3) — the exception propagated directly to TestNG as a single, unretried failure |
| Exact command | `mvn -q test -Dsurefire.suiteXmlFiles="<abs path>/artifacts_rerun-9/testng-verify-001-isolated.xml" -DheadlessExecution=false -Drp.endpoint=http://localhost:8080 -Drp.enable=false` |
| Command working directory | `platform_core_data/modules/branch/automation/tests_SHAFT/` |
| Authorization | Covered by the existing run-scoped grant `AUTH-BRANCH-CREATE-SelfCreated` (`metadata/SafetyAuthorizations.json`) — same run, same action/ownership/module/environment class as Group 1; no new authorization question was needed |
| Start timestamp | 2026-08-14T09:47:20.187Z (UTC) / 12:47:20 PM (+03:00) |
| End timestamp | 2026-08-14T09:48:13.389Z (UTC) / 12:48:13 PM (+03:00) |
| Total wall time | 53.2s (process) / 48.18s (TestNG-reported suite time) |
| Maven/process exit code | **1** (test failure) |

**A first invocation attempt at 09:46:53–09:46:58 UTC failed before any test method ran**, due to a malformed XML comment in the scoping file I authored (`--` inside an XML comment, invalid per the XML spec) — a tooling/authoring error on my part, not a test execution. Zero test methods executed in that attempt; it produced no evidence about TC-BR-001 and is recorded here only for a complete, honest timeline. The scoping file was corrected and the run above is the first (and only) actual execution of TC-BR-001 this cycle.

## 2. Execution Result — TC-BR-001, full lifecycle

| Field | Value |
|---|---|
| Status | **Failed** |
| Attempts | 1 (no retry — this exception type is not caught by any retry mechanism in the current code) |
| Duration | 23.726s (`surefire/TEST-TestSuite.xml`), within a 48.18s total suite time (login + navigation + the test) |

**Full lifecycle, in order:**

1. **Login** — 12:47:44 PM, `odeysysadmin` / (secure, masked) into `http://192.168.1.70`. Succeeded — landed on `/dashboard`, then navigated to `/admin/branch/add` at 12:47:46 PM.
2. **Precondition check (`setUp`)** — `ValidateElementExists` on `#id-Operatingcountry` **PASSED** at 12:47:48 PM (screenshot `Screenshot - 1786700867257_setUp_ValidateElementExists_passed`). **This is the same button/route TC-BR-001 has previously timed out on (20s waiting for `button[routerlink='add']`) — it did NOT reproduce that failure this cycle.** The Add Branch form opened normally and fast (~2 seconds from navigation to confirmed form presence).
3. **Test method starts** — 12:47:48 PM, `fillMandatoryBaseline()` begins populating the form.
4. **Failure point** — `AddBranch_Page.selectFirstSupplierCredential()` → `selectDropdownItem()` (`AddBranch_Page.java:594`), called from `fillMandatoryBaseline` (`AddBranch_Page.java:680`), called from the test method itself (`CreateBranch_Admin_TC.java:37`). The dropdown-open click (`clickVia(FIRST_ROW_CREDENTIAL_DROPDOWN)`) executed, but the subsequent wait for the option `//li[contains(@class,'p-dropdown-item')][normalize-space(.)='Live']` to appear in the DOM **never resolved** — `org.openqa.selenium.TimeoutException: Expected condition failed ... (tried for 20 second(s) with 500 milliseconds interval)`, thrown at 12:48:11 PM (23.7s after the test method started).
5. **Submit action** — **never reached.** `clickSubmit()` (test method line 38) and `assertSubmissionSucceeded()` (line 39) were never executed; the test failed inside `fillMandatoryBaseline()`, two calls before submission would have been attempted.
6. **Toast / navigation** — **none occurred**, because submission was never attempted.
7. **Persisted-record verification** — **not applicable and not performed.** No branch record was created this cycle: the form was never submitted. There is nothing to verify as retrievable, and none was falsely inferred from a toast or navigation that never happened.
8. **Teardown** — driver closed normally at 12:48:12 PM. No application-side error was surfaced to the user in-browser (this is a pure automation-side wait timeout, not an application error message).

**Exact exception / stack trace:**

```
org.openqa.selenium.TimeoutException:
Expected condition failed: waiting for AdminPages.Admin.Branch.AddBranch_Page$$Lambda/0x000002830159bac0@7d9f0cf4 (tried for 20 second(s) with 500 milliseconds interval)
Build info: version: '4.13.0', revision: 'ba948ece5b*'
System info: os.name: 'Windows 11', os.arch: 'amd64', os.version: '10.0', java.version: '24.0.1'
Driver info: net.bytebuddy.renamed.java.lang.Object$ByteBuddy$bX3Iy24W
Session ID: 28540f89119a483cfb52cfb653f20da3
	at org.openqa.selenium.support.ui.WebDriverWait.timeoutException(WebDriverWait.java:84)
	at org.openqa.selenium.support.ui.FluentWait.until(FluentWait.java:230)
	at AdminPages.Admin.Branch.AddBranch_Page.selectDropdownItem(AddBranch_Page.java:594)
	at AdminPages.Admin.Branch.AddBranch_Page.selectFirstSupplierCredential(AddBranch_Page.java:581)
	at AdminPages.Admin.Branch.AddBranch_Page.fillMandatoryBaseline(AddBranch_Page.java:680)
	at AdminPages.Admin.Branch.CreateBranch_Admin_TC.tcBr001_createBranchWithAllMandatoryFields(CreateBranch_Admin_TC.java:37)
```
(Full trace with framework/TestNG frames: `artifacts_rerun-9/maven-console.log` lines 112–156; `artifacts_rerun-9/surefire/TEST-TestSuite.xml`.)

**Human live observation (Headed execution, recorded verbatim, 2026-08-14):** the reviewer watched the Product Access Supplier row directly during this run and observed, at the point of failure: **Status: selected (checkbox ticked)** · **Supplier Name: 3O** · **Product Name: Flight** · **Credential Name: still showing the placeholder "Select"**. This is direct visual corroboration of the log-based finding below: the Credential Name dropdown's option panel never rendered a selectable "Live" option, and no selection was ever made, consistent with `selectDropdownItem()`'s 20-second wait for the option element never resolving. This observation is treated as evidence in §5, not as a new, separately-run attempt.

**Screenshots captured:** one — `Screenshot - 1786700867257_setUp_ValidateElementExists_passed` (setup precondition check, before the test method began). **No failure-moment screenshot exists for this specific failure.** This is not an omission introduced by this run: a raw `org.openqa.selenium.TimeoutException` thrown directly by `FluentWait.until()` bypasses SHAFT's own action-wrapper failure-capture hook, which only fires for actions performed through SHAFT's own element-interaction methods. This exact gap was already identified as a recommendation in the original HEAL-BR-20260805-01 pass ("the current WebDriverWait failure bypassed SHAFT's own failure-capture hook") and has not been closed since — it recurred here, on a different call site, unchanged.

## 3. Did this run reach the shared precondition code path used by TC-BR-066/067/068/069?

**No.** TC-BR-066/067/068/069 depend on `BranchProvisioner` successfully creating a branch record as their setup precondition, which in turn depends on `fillMandatoryBaseline()` completing and `clickSubmit()`/`assertSubmissionSucceeded()` (the Cluster A-repaired code) actually executing. **This run never reached `clickSubmit()` or `assertSubmissionSucceeded()` at all** — it failed two method calls earlier, inside `fillMandatoryBaseline()` itself, at the Credential Name dropdown selection step. This is there­fore **not** a recurrence of the specific "20s timeout reaching the Add Branch button" symptom recorded in every prior TC-BR-001 attempt (§1 above already confirms that specific step passed fast and cleanly this cycle) — it is a **third, previously undocumented failure signature** for this test case, at an earlier stage of the same test method, and it provides no direct evidence either way about whether TC-BR-066/067/068/069's own upstream blocker is resolved, since this run never got far enough to exercise the code path they share.

## 4. Evidence Inventory

| Evidence Type | Captured? | Location |
|---|---|---|
| Execution Logs | Yes | `artifacts_rerun-9/maven-console.log` (full console, including the corrected/failed first invocation for a complete timeline) |
| Test Runner Reports | Yes | `artifacts_rerun-9/surefire/TEST-TestSuite.xml` (1 test, 1 failure, full stack trace embedded) |
| Dumpstream | Yes | `artifacts_rerun-9/surefire/` (copied) |
| Scoping input | Yes | `artifacts_rerun-9/testng-verify-001-isolated.xml` |
| Screenshots | Partial — see §2 | Setup-only screenshot in `allure-results/` (not partitioned per invocation, KL-09 carried forward); no failure-moment screenshot exists, for the structural reason explained above |
| Persisted-record check | Not applicable | No record was created this cycle — nothing to check |

## 5. Root-Cause Classification

| Field | Value |
|---|---|
| Classification | **Inconclusive / Needs diagnosis** — per explicit instruction, no automatic repair or further retry was attempted |
| What is confirmed | The failure is real, reproducible-in-this-instance, and occurs at `AddBranch_Page.selectDropdownItem()` (line 594), waiting for the Credential Name PrimeNG dropdown's `"Live"` option to render, called from `selectFirstSupplierCredential()`. It is a **different failure point** than any of TC-BR-001's 4 prior documented attempts (all of which either timed out on the Add Branch button open, or failed at `assertSubmissionSucceeded()`) |
| What is NOT established | Whether this is: (a) the same class of click-delivery defect `REPAIR-BR-010`/platform `REPAIR-008` addresses (i.e., `clickVia()` on `FIRST_ROW_CREDENTIAL_DROPDOWN` did not actually open the panel this time), (b) a data/state issue (e.g., the Supplier row's Status checkbox not actually ticked before this call, so the Credential dropdown never rendered at all), (c) a shared-environment timing issue distinct from both, or (d) evidence toward the same still-unexplained intermittency documented in `QuarantineRegister.md` for this test. No DOM snapshot or console/network capture exists for the failure moment (§2), so none of these can be confirmed or ruled out from this run's evidence alone |
| Explicitly not concluded | This finding does **not** confirm, refute, or otherwise resolve the original quarantine reason (the Add Branch button open-timeout) — that specific symptom simply did not occur this cycle. Quarantine status is unaffected by this result |

## 6. Health Summary

| Figure | Count |
|---|---|
| Application Health | 0 — no application-behavior signal was touched; no application error was shown; nothing was submitted |
| Automation Health | 1 Failed (TC-BR-001) — new, undocumented failure signature |
| Environment Health | 0 — not established as environment-caused; see §5 |
| Flaky | Not reclassified — this run adds a third distinct signature to an already-flaky history, but reclassifying the QuarantineRegister entry is a follow-up decision, not made unilaterally here |

## 7. Quarantine Register Cross-Reference

Cross-referenced to `healing/QuarantineRegister.md` as **Attempt 5** (this run), following the 4 attempts already logged there (HEAL-BR-20260805-01, HEAL-BR-20260806-01, HEAL-BR-20260809-01 ×2). **The historical attempt count is not reset** — this is attempt 5 of an ongoing, explicitly-authorized-beyond-limit diagnostic history, not a fresh count. Register entry updated with this cycle's result and new failure signature; no repair strategy was proposed or applied.

## 8. Execution Recommendations

- **Do not attempt an automatic repair from this evidence alone.** The failure point is genuinely new for this test, and per §5 multiple plausible causes exist with no discriminating evidence yet.
- **The screenshot/DOM-capture gap recommended after the very first HEAL-BR-20260805-01 pass is still open** and directly cost diagnostic value in this run — a raw `FluentWait`/`WebDriverWait` timeout thrown outside SHAFT's own action wrapper still produces no failure-moment screenshot or DOM dump. Closing this gap (e.g., a global uncaught-exception listener that captures a screenshot before the exception propagates) would materially improve every future diagnosis of this test, not just this one.
- **A live, instrumented diagnosis** (matching the `[DIAG-SYNC]` approach already used successfully for the Search screen's PrimeNG dropdowns) targeted specifically at `FIRST_ROW_CREDENTIAL_DROPDOWN`'s click-and-render sequence would be the natural next step, but is out of this run's scope (diagnosis-only, no code instrumentation was authorized here).
