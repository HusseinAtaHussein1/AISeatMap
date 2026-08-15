# Execution Results — run-003__2026-08-04_11-24-38__UserStory__US-8599-SearchActions_US-8606-UpdateBranch (rerun-10)

**Note on cycle labelling:** Post-repair verification of **TC-BR-001 only**, requested 2026-08-14, following the Credential-selection repair to `AddBranch_Page.java` (locator token-fix, readiness wait, normal click, scoped overlay lookup, mandatory display post-condition — see `healing/RepairSummary.md`). TC-BR-001 was quarantined before this run (`QuarantineRegister.md`, 4 prior attempts). **This run is explicitly authorized beyond the quarantine attempt limit** and is attempt 6 in that register's cumulative history — the historical count is not reset. **No code, configuration, assertion, wait, or test data was modified before or during this execution.**

## 1. Execution Metadata

| Field | Value |
|---|---|
| Execution ID | `EXEC-BR-20260814-03` |
| Run Folder | `run-003__2026-08-04_11-24-38__UserStory__US-8599-SearchActions_US-8606-UpdateBranch` |
| Execution cycle | 11 (post-repair isolated verification — standalone) |
| Modules executed | branch |
| Module scope | single |
| Run Scope Type / Run Type | Selective Re-run — exactly 1 test, no others |
| Environment | Staging (STG), shared internal/LAN |
| Target URL | `http://192.168.1.70` |
| Framework | SHAFT Engine 7.4.20231015 (Java) / TestNG |
| Suite executed | `artifacts_rerun-10/testng-verify-001-post-repair.xml` — scoped to exactly `tcBr001_createBranchWithAllMandatoryFields` in `CreateBranch_Admin_TC`, run alone |
| Suite code state | **Repaired** — `AddBranch_Page.java`'s Credential-selection path only (see diff reviewed and approved this session); no other file changed |
| Execution Mode | **Headed** (`-DheadlessExecution=false`), per explicit instruction |
| Concurrency Mode | Sequential (single test, single fork) |
| Retry Policy | No TestNG-level retry configured. No exception was thrown this cycle, so no internal retry path (readiness wait, click, or post-condition) was exercised beyond its normal polling |
| Exact command | `mvn -q test -Dsurefire.suiteXmlFiles="<abs path>/artifacts_rerun-10/testng-verify-001-post-repair.xml" -DheadlessExecution=false -Drp.endpoint=http://localhost:8080 -Drp.enable=false` |
| Command working directory | `platform_core_data/modules/branch/automation/tests_SHAFT/` |
| Authorization | Covered by the existing run-scoped grant `AUTH-BRANCH-CREATE-SelfCreated` (`metadata/SafetyAuthorizations.json`) — same run, same action/ownership/module/environment class; no new authorization question was needed |
| Start timestamp | 2026-08-14T12:19:07.717Z (UTC) / 03:19:07 PM (+03:00) |
| End timestamp | 2026-08-14T12:20:09.383Z (UTC) / 03:20:09 PM (+03:00) |
| Total wall time | 61.7s (process) / 56.331s (TestNG-reported suite time) |
| Test method time | 9.864s (`surefire/TEST-TestSuite.xml`) |
| Maven/process exit code | **0** |

## 2. Execution Result

| Field | Value |
|---|---|
| Status | **Passed** |
| Attempts | 1 — clean, no exception, no retry of any kind |
| Test Status (SHAFT) | `Passed` (`maven-console.log` line 89) |
| Suite summary | `Total Cases: 1 --> Passed: 1 | Failed: 0 | Skipped: 0` |

## 3. Full Lifecycle — every requirement verified independently

### 3.1 Credential Name selection

```
[INFO] Click element.                | com.shaft.tools.io.ReportManager - main - 03:20:02 PM
[INFO] Click "Live".                 | com.shaft.tools.io.ReportManager - main - 03:20:02 PM
```

The first line is the repaired `clickCredentialDropdownNormally()` — a plain Selenium `.click()` on the token-exact-matched dropdown (not routed through SHAFT's fluent/labelled API, hence the generic label). The second line is `clickCredentialOptionWithin()` selecting the "Live" option, scoped to the located overlay panel — SHAFT's underlying listener labels it by the clicked element's own text. **`assertCredentialDisplayed()` (the mandatory post-condition) did not throw**, which is itself the confirmation the displayed label committed to "Live" and was no longer "Select" — had it not, the test would have failed inside `selectFirstSupplierCredential()`, before ever reaching `clickSubmit()`.

### 3.2 Form submission

The test method completed (`clickSubmit()` then `assertSubmissionSucceeded()`) with **Test Status: Passed** and no exception — submission was reached and succeeded.

### 3.3 Toast / navigation (captured, not treated as sufficient alone)

The pre-existing `[DIAG8]` instrumentation (kept in place per the current `assertSubmissionSucceeded()` implementation) recorded:

```
[INFO] [DIAG8] url=http://192.168.1.70/admin/branch
[INFO] [DIAG8] errors=
[INFO] [DIAG8] emptyFields=Branch code | Branch name
```

Navigation from `/admin/branch/add` to `/admin/branch` is confirmed (URL changed), and no validation errors were present. Per your requirement, **this is recorded as evidence, not as proof of persistence** — §3.4 below is the actual persistence check.

### 3.4 Independent persistence verification — the created Branch is retrievable

**Performed entirely outside the SHAFT suite**, via the shared `platform_core/tools/browser_driver/` layer (read-only — no record created, modified, or deleted by this check itself), against the same live Branch search API the Search screen itself calls (`POST /odeysysadmin/Master2/Branch/search`), using the exact payload shape captured from a real UI-driven search click:

```json
{
  "branchId": 11925,
  "branchCode": "BRN744",
  "branchName": "QA_BRANCH_1915451539277800",
  "countryId": 67,
  "countryName": "Egypt",
  "cityName": "Cairo",
  "approvalStatus": 0
}
```

This record was **not identifiable from the SHAFT run's own log** (this run's console output did not print the generated unique branch name), so it was located by replaying the production search endpoint and confirming a `"QA_BRANCH_"`-prefixed record exists with `countryName: "Egypt"` and `cityName: "Cairo"` — matching the fixture (`branch_baseline.properties`: `operatingCountry=EgyptUAT` → Egypt, `city=Cairo`) — and `approvalStatus: 0` (Pending), consistent with a freshly submitted, not-yet-approved Add Branch record. **A first attempt at this check, filtering the UI's Branch Name field on the partial string `"QA_BRANCH_"`, returned zero rows** — this is a search-semantics finding (the field requires an exact match, not a substring/contains match), not a defect in the created record; the record was confirmed to exist via the unfiltered/status-scoped search payload instead, where it appeared with `branchId: 11925` — the newest `branchId` in the returned set.

**This independently confirms the Branch record is persisted and retrievable, not merely that a toast appeared or navigation occurred.**

Caveat, stated plainly: identifying "the" record this run created relied on it being the newest `QA_BRANCH_`-prefixed, Pending-status record at verification time, since the exact generated name was not captured from the SHAFT log itself. On a shared environment this is not airtight against a concurrent creation by another process in the same narrow window — no evidence of such a collision was found, but it is not excluded by this method alone.

## 4. Screenshots, Assertions, Diagnostics

| Evidence Type | Captured? | Location |
|---|---|---|
| Setup screenshot | Yes | `Screenshot - 1786709996952_setUp_ValidateElementExists_passed` (allure-results/, not partitioned per cycle — KL-09 carried forward, unchanged) |
| Execution logs | Yes | `artifacts_rerun-10/maven-console.log` (full console) |
| Test Runner Report | Yes | `artifacts_rerun-10/surefire/TEST-TestSuite.xml` — 1 test, 0 failures/errors/skipped |
| Dumpstream | Yes | `artifacts_rerun-10/surefire/` |
| Scoping input | Yes | `artifacts_rerun-10/testng-verify-001-post-repair.xml` |
| Independent persistence check script + evidence | Yes | `artifacts_rerun-10/independent_verification/verify_tcbr001_record_v3.js`, `.../verify-tcbr001-record-v2.png` |
| Stack trace | N/A — no failure occurred | — |

No diagnostic capture from `captureCredentialDiagnostics()` fired, because no exception was thrown anywhere in the repaired Credential-selection path this cycle.

## 5. Health Summary

| Figure | Count |
|---|---|
| Application Health | 0 — unaffected; a real record was created and is retrievable exactly as the application is expected to behave |
| Automation Health | 1/1 Passed |
| Environment Health | 0 |
| Flaky | Not applicable to this single run — see §6 |

## 6. Quarantine Register Cross-Reference

Cross-referenced to `healing/QuarantineRegister.md` as **Attempt 6** (this run), following the 5 attempts already logged (4 original + the 2026-08-14 isolated pre-repair attempt, `rerun-9`, which failed on a different, now-repaired symptom). **This attempt Passed.**

**Correction (2026-08-14, per explicit human instruction):** an earlier draft of this section, and of the Reconciled Totals below, stated that quarantine was "lifted" by this pass. That was incorrect and has been corrected in place. TC-BR-001 was quarantined because of the *original* Add Branch open-timeout intermittency (attempts 1-4), not because of the Credential-dropdown defect (attempt 5's cause, discovered only during quarantine-recovery diagnosis). This run's repair and clean pass verify the Credential-dropdown fix only. The original open-timeout symptom was not reproduced, diagnosed, or repaired in either attempt 5 or attempt 6, and therefore remains open. **TC-BR-001's quarantine status is unchanged: still Quarantined**, pending a further verification pass under conditions closer to the original failure (first test in a fresh JVM fork within a larger suite run).

## 7. Reconciled Totals — updated based on this verified result only

TC-BR-001 **remains in the Quarantined bucket** for the exclusive 32-test reconciliation — its latest isolated execution passed, and its Credential-selection defect is repaired and formally verified, but its original quarantine cause is not resolved, so it is not moved to Confirmed Passed. This is reported separately, not blended into one status.

| Bucket | Count | Test Case IDs |
|---|---|---|
| **Confirmed Passed** | **20** | (unchanged — TC-BR-001 not added; its latest isolated run passed, but it remains Quarantined pending resolution of its original cause) |
| **Confirmed Application Failures** | 2 | TC-BR-026, TC-BR-052 |
| **Confirmed Automation Failures** | 1 | TC-BR-054 |
| **Inconclusive / Needs Diagnosis** | 1 | TC-BR-046 |
| **Not Executed / Unverified** | **7** | Not Executed (3): TC-BR-056, 057, 058 — Unverified (4): TC-BR-066, 067, 068, 069 |
| **Quarantined** | **1** | TC-BR-001 — latest isolated execution (`rerun-10`) Passed; Credential-selection defect repaired and verified; original open-timeout cause still open/under observation |
| **Total** | **32** | 20+2+1+1+7+1 = 32 ✓ |

**Important scope boundary:** TC-BR-066/067/068/069 depend on `BranchProvisioner`, which reuses the exact same `fillMandatoryBaseline()` → `selectFirstSupplierCredential()` path just repaired and verified here. This run provides **evidence-backed reason to expect** their provisioning step is now more reliable, but it does **not** verify them — they were not executed this cycle, per this run's scope ("Run exactly TC-BR-001; no other test cases"). They remain Unverified until their own group runs.

## 8. Recommendations

- TC-BR-001: quarantine remains open. The Credential-dropdown defect is resolved; the original button-open intermittency that triggered quarantine is not, and requires its own reproduction attempt (ideally as the first test in a fresh JVM fork within a larger suite run) before quarantine can be reconsidered.
- TC-BR-066/067/068/069: now a reasonable next candidate, since their shared upstream dependency has direct, fresh evidence of working correctly — but still require their own run to confirm, not to be inferred from this result alone.
