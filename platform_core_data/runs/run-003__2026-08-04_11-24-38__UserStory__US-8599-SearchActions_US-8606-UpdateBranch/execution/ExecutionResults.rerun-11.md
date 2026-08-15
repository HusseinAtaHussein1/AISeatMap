# Execution Results — run-003__2026-08-04_11-24-38__UserStory__US-8599-SearchActions_US-8606-UpdateBranch (rerun-11)

**Note on cycle labelling:** Group verification of exactly **TC-BR-066, TC-BR-067, TC-BR-068, TC-BR-069**, requested 2026-08-14, following the Credential-selection repair to `AddBranch_Page.java` verified in isolation for TC-BR-001 (`rerun-10`). All four tests share `BranchProvisioner.createPendingBranch()` as a precondition, which reuses the exact same `fillMandatoryBaseline()` → `selectFirstSupplierCredential()` path just repaired. **No code, configuration, assertion, wait, or test data was modified before or during this execution.**

## 1. Execution Metadata

| Field | Value |
|---|---|
| Execution ID | `EXEC-BR-20260814-04` |
| Run Folder | `run-003__2026-08-04_11-24-38__UserStory__US-8599-SearchActions_US-8606-UpdateBranch` |
| Execution cycle | 12 |
| Modules executed | branch |
| Module scope | single |
| Run Scope Type / Run Type | Selective Re-run — exactly 4 tests, no others |
| Environment | Staging (STG), shared internal/LAN |
| Target URL | `http://192.168.1.70` |
| Framework | SHAFT Engine 7.4.20231015 (Java) / TestNG |
| Suite executed | `artifacts_rerun-11/testng-verify-066-067-068-069.xml` — scoped to `tcBr066_updateBranchAndSubmitForApproval`, `tcBr067_remarksIsMandatoryBeforeAnyUpdateAction`, `tcBr068_cancelDiscardsUnsavedChanges`, `tcBr069_approveBranchUpdateRequestFromUpdateScreen` in `UpdateBranch_TC`, run alone |
| Suite code state | Unchanged — same repaired `AddBranch_Page.java` as `rerun-10`; no file modified since that verification |
| Execution Mode | **Headed** (`-DheadlessExecution=false`), per explicit instruction |
| Concurrency Mode | Sequential (4 tests, single fork, each with its own fresh browser session per SHAFT's setUp/tearDown) |
| Retry Policy | No TestNG-level retry configured. No internal `withStaleRetry`-style retry was exercised by any of the four tests this cycle — each failed on its first and only attempt |
| Exact command | `mvn -q test -Dsurefire.suiteXmlFiles="<abs path>/artifacts_rerun-11/testng-verify-066-067-068-069.xml" -DheadlessExecution=false -Drp.endpoint=http://localhost:8080 -Drp.enable=false` |
| Command working directory | `platform_core_data/modules/branch/automation/tests_SHAFT/` |
| Authorization | `AUTH-BRANCH-CREATE-SelfCreated` (pre-existing) plus three new run-scoped grants created for this group per the execution-safety policy engine's per-action scoping (`AUTH-BRANCH-UPDATE-SelfCreated`, `AUTH-BRANCH-SUBMIT-SelfCreated`, `AUTH-BRANCH-APPROVE-SelfCreated`) — required because these four tests perform UPDATE/SUBMIT/APPROVE on self-created records, which the existing CREATE-only grant does not cover. All four actions evaluated `Allowed` before execution (`metadata/SafetyAuthorizations.json`) |
| Start timestamp | 2026-08-14T12:38:31Z (UTC) / 03:38:31 PM (+03:00) — first test's browser navigation |
| End timestamp | 2026-08-14T12:41:04Z (UTC) / 03:41:04 PM (+03:00) — Test Execution Summary Results line |
| Maven/process exit code | **1** |

## 2. Execution Result — per test, independently

**Governing rule for this section, per explicit instruction: successful provisioning is never counted as a test pass, and each test's own business assertion is reported separately from whether provisioning completed.**

| Field | Value |
|---|---|
| Test Status (SHAFT) | `Total Cases: 4 --> Passed: 0 \| Failed: 4 \| Skipped: 0` |
| Attempts | 1 each — no internal retry fired for any of the four |

### 2.1 TC-BR-066 — `tcBr066_updateBranchAndSubmitForApproval`

- **Did provisioning complete?** **No.** Failed inside `BranchProvisioner.createPendingBranch()` (`BranchProvisioner.java:94`), which itself failed inside `AddBranch_Page.assertSubmissionSucceeded()` (`AddBranch_Page.java:978`).
- **Did it reach its own repaired code path?** Yes — the Credential-selection step itself succeeded this time: log shows `Click element.` then `Click "Live".` at 03:38:43 PM, and `assertCredentialDisplayed()` did not throw.
- **Did it reach its own business assertion (update + submit for approval)?** **No — never reached.** The test's own logic (lines after provisioning) never ran.
- **Exact error:** `java.lang.AssertionError: Expected the Branch to be saved with status "Pending for approval." expected [true] but found [false]`
- **What actually failed (confirmed):** `assertSubmissionSucceeded()`'s own real check (`AddBranch_Page.java:954-979`) — a 10s bounded `WebDriverWait` on `!url.contains("/admin/branch/add") || pageSource.contains("Pending for approval")` — timed out. Neither signal appeared. This is a genuine, repeatable functional failure.
- **Correction (2026-08-14, re-evaluated against known false-positive history): the `[DIAG8] errors=FlightOthers` and `[DIAG8] emptyFields=...` lines printed alongside this failure do NOT establish why it failed, and must not be read as confirmed root cause.** Checked directly against the code (`AddBranch_Page.java:963-977`): both are diagnostic-only printouts, never consulted by the assertion itself.
  - `errors=` is captured via `document.querySelectorAll('.p-error,.invalid-feedback,[class*=error]')` — a class-name **substring** match. `RepairSummary.md:408-410` already established, from a prior live diagnosis, that `FlightOthers` is **not a real validation error**: it is an `<ndc-fg-input>` whose class merely contains the substring `product-error`, its parent is `ng-valid` (Angular itself treats it as valid), and it is present identically on a freshly-opened form with nothing filled at all. Citing it as evidence of a blocking error, as an earlier draft of this report did, was wrong.
  - `emptyFields=Address 2 | Service Tax Number | ABTA Number | id-supplier-180 | id-supplier-202 | ... [24 fields total]` only checks `getBoundingClientRect().width>0` and an empty value — it does **not** check `aria-invalid`, `ng-invalid`, required-ness, or any application-side validation signal. It proves these fields are empty; it does not prove the application considers them mandatory or that they blocked submission.
  - **No evidence in this run shows a real, visible validation error or a confirmed invalid application state.** The true cause of the timeout (unconfigured supplier rows genuinely required; a timing issue needing more than 10s under `BranchProvisioner`'s heavier setup, similar in kind to the original REPAIR-001 cause; or something else) is **not established** by this run's evidence.
- **DOM-evidence review (2026-08-14), read-only, no rerun:** the Allure result record for this test (`allure-results/0dd608c8-...-result.json`) captured 19 `getPageSource()` snapshots during the 10s wait, one per poll cycle. All 19 are byte-identical (SHA-256 `83b9503284c0c05c...`) — the DOM never changed after the Submit click. At that moment: Credential "Live" was selected and marked `ng-valid`/`ng-dirty`; no element anywhere carried `ng-invalid` (as an applied class, not a CSS-rule-text match) or `aria-invalid="true"`; every `fg-error` span was empty; the Submit button had no `disabled` attribute; no toast/alert/loading indicator was present anywhere.
- **Human-determined classification (2026-08-14), recorded verbatim, not independently re-derived by this pass:** "The failure is an automation click-delivery problem in the provisioning step. The form was valid based on the available evidence ... The automation attempted Submit through `clickVia()`, which dispatches synthetic JavaScript MouseEvents and bypasses the normal Selenium/SHAFT interaction and reporting path. After that attempted click, all 19 page-source snapshots remained byte-identical for 10 seconds, showing no evidence that the application reacted to or processed the action." Classification: **TC-BR-066 business behavior: Not Executed. Provisioning failure: Confirmed Automation Defect. Defect location: `AddBranch_Page.clickSubmit()`/`clickVia()` click-delivery mechanism. Application defect: Not established.** No repair implemented and no rerun performed, per explicit instruction.
- **Time elapsed:** 23.23s

### 2.2 TC-BR-067 — `tcBr067_remarksIsMandatoryBeforeAnyUpdateAction`

- **Did provisioning complete?** **No.** Identical failure point and identical evidence to TC-BR-066: same assertion, same stack (`AddBranch_Page.java:978` → `BranchProvisioner.java:94` → `UpdateBranch_TC.java:132`), same `[DIAG8] errors=FlightOthers` and the same 24-field `emptyFields` list — **subject to the same correction above: neither line is confirmed root-cause evidence.**
- **Did it reach its own repaired code path?** Yes — `Click element.` / `Click "Live".` logged at 03:39:23 PM, no exception in Credential selection.
- **Did it reach its own business assertion (Remarks-mandatory)?** **No — never reached.**
- **DOM-evidence review (2026-08-14), read-only, independently performed on this test's own record (not assumed from TC-BR-066):** the Allure result (`allure-results/f1686706-...-result.json`) captured 19 `getPageSource()` polls, all sharing one SHA-256 hash (`74f5263a8d6867b8...`) — byte-identical throughout the 10s wait. At that moment: Credential "Live" selected, `ng-valid`/`ng-dirty`; zero applied `ng-invalid`/`aria-invalid="true"`; all 60 `fg-error` spans empty; Submit button had no `disabled` attribute; no toast/loading/error component present.
- **Human-determined classification (2026-08-14), confirmed identical to TC-BR-066 via this independent check:** "TC-BR-067's Remarks-mandatory business behavior was not executed. The test stopped during its shared Branch provisioning precondition... The automation attempted Submit through the same synthetic clickVia() mechanism. All 19 page-source snapshots remained byte-identical throughout the 10-second wait, providing no evidence that the application reacted." Classification: **TC-BR-067 business behavior: Not Executed. Provisioning failure: Confirmed Automation Defect. Defect location: `AddBranch_Page.clickSubmit()`/`clickVia()`. Remarks validation application defect: Not established.** No repair implemented and no rerun performed.
- **Time elapsed:** 22.72s

### 2.3 TC-BR-068 — `tcBr068_cancelDiscardsUnsavedChanges`

- **Did provisioning complete?** **No.** Identical failure point and evidence to TC-BR-066/067 — **subject to the same correction above.**
- **Did it reach its own repaired code path?** Yes — Credential selection succeeded (log at 03:39:53 PM area, same pattern).
- **Did it reach its own business assertion (Cancel discards changes)?** **No — never reached.**
- **DOM-evidence review (2026-08-14), read-only, independently performed:** the Allure result (`allure-results/62235f25-...-result.json`) captured 20 `getPageSource()` polls, **not** all identical — snapshot 1 (12:40:04.395Z) differs from snapshots 2-20 (which are all identical to each other, hash `3a379fc0...`). Byte-diff of snapshot 1 vs. 2: the outer form, a nested form container, and the Branch Name field (`id-Name`) were `ng-pending` with an active spinner (`pi pi-spin pi-spinner`) in snapshot 1; by snapshot 2 (~550ms later) all three had transitioned to `ng-valid` and the spinner was gone. No other difference exists between snapshots 2-20 for the remaining ~9.4s.
- **Human-determined classification (2026-08-14), recorded verbatim — NOT the same evidenced pattern as TC-BR-066/067:** "At the time Submit was attempted, the Angular form and Branch Name control were still in ng-pending state, with an active spinner. Approximately 550ms later, the async validation completed and both transitioned to ng-valid, but the automation did not wait for this readiness condition before attempting Submit and did not submit again after validation completed." Classification: **TC-BR-068 business behavior: Not Executed. Provisioning failure: Confirmed Automation Synchronization Defect. Defect location: provisioning flow attempts Submit before the form's asynchronous Branch Name validation has settled. Application defect: Not established.** Repair contract specified for later approval: wait until Branch Name is no longer `ng-pending`, no validation spinner remains for that field, and the form has settled into a valid, submittable state, before performing the normal Submit action. No repair implemented and no rerun performed.
- **Time elapsed:** 23.59s

### 2.4 TC-BR-069 — `tcBr069_approveBranchUpdateRequestFromUpdateScreen`

- **Did provisioning complete?** **No.** Failed at a different point than the other three, and did not reach `assertSubmissionSucceeded()` at all.
- **Did it reach its own repaired code path?** **Partially, and this is a distinct failure signature.** The dropdown click was dispatched (`Click element.` logged at 03:40:43 PM), but no `Click "Live".` line ever followed — the option overlay never registered a selection within the 20s bound.
- **Exact error:** `java.lang.IllegalStateException: Credential overlay never showed a visible option "Live" within 20s. [Credential diagnostics @ overlay wait] requestedValue="Live"; dropdownMatchCount=1; dropdownState={ariaDisabled=null, className=p-dropdown p-component p-dropdown-clearable, disabledAttr=null, ... visibleLabel=Select}; overlayPanelCount=0;` — caused by `org.openqa.selenium.TimeoutException` inside the repaired `waitForCredentialOverlayContaining()`.
- **What this confirms and does not confirm:** `dropdownMatchCount=1` confirms the token-exact locator fix (verified for TC-BR-001) still resolves to exactly one element — the locator-ambiguity defect has not recurred. `overlayPanelCount=0` shows the option overlay itself never appeared this time, a **different symptom** from the original attempt-5 defect (which was locator ambiguity plus no readiness wait, not a non-appearing overlay). **This is new evidence of residual intermittency in the just-repaired Credential-selection code path, under a fourth consecutive invocation, distinct from and not diagnosed by the TC-BR-001 repair or its verification.**
- **Did it reach its own business assertion (Approve from Update screen)?** **No — never reached.**
- **Time elapsed:** 32.24s

## 3. Screenshots, Assertions, Diagnostics

| Evidence Type | Captured? | Location |
|---|---|---|
| Execution logs | Yes | `artifacts_rerun-11/maven-console.log` (full console, all 4 tests) |
| Test Runner Report | Yes | `artifacts_rerun-11/surefire/TEST-TestSuite.xml` — 4 tests, 4 failures |
| Scoping input | Yes | `artifacts_rerun-11/testng-verify-066-067-068-069.xml` |
| Per-test screenshots | Yes (setup only — each test's `ValidateElementExists` passed screenshot) | allure-results/, not partitioned per cycle (KL-09 carried forward, unchanged) |
| Full stack traces | Yes | `artifacts_rerun-11/maven-console.log` lines 409-579; reproduced in §2 above |

## 4. Health Summary

| Figure | Count |
|---|---|
| Application Health | 0 confirmed application defects from this cycle alone — TC-BR-066/067/068's blocking cause (unconfigured supplier rows) has not been diagnosed as application-vs-automation-vs-data yet; TC-BR-069's cause is automation-side (the repaired dropdown's residual intermittency) |
| Automation Health | 0/4 Passed — 4/4 blocked at the shared provisioning precondition, 0/4 reached their own business assertion |
| Environment Health | 0 confirmed |
| Flaky | **Notable finding:** the Credential-selection step itself succeeded in 3 of 4 invocations (TC-BR-066/067/068) and failed with a new signature in the 4th (TC-BR-069) — i.e., it is not uniformly reliable across repeated invocations, even after the TC-BR-001 repair |

## 5. Quarantine Register Cross-Reference

**TC-BR-001's quarantine is unaffected by this run and remains open** (`QuarantineRegister.md`) — none of these four tests are TC-BR-001 itself, and this run does not exercise TC-BR-001's original Add Branch button-open code path at all.

**However, this run surfaces evidence worth recording against the broader Credential-selection repair's reliability:** TC-BR-069's overlay-never-appeared failure is a new, previously undocumented symptom in the exact code path repaired and formally verified for TC-BR-001 in `rerun-10`. It does not reopen or extend TC-BR-001's own quarantine record (a different test, a different precise symptom), but it is evidence that the repair, while effective for the ambiguous-locator/no-readiness-wait defect it targeted, has not eliminated all intermittency in this shared dropdown interaction. This is reported here for visibility; no repair is proposed or applied in this cycle per your explicit instruction.

## 6. Reconciled Totals — updated based on this verified result only, corrected 2026-08-14

None of TC-BR-066/067/068/069 move out of `Not Executed/Unverified` into `Confirmed Passed`, because none reached their own business assertion. What changes is the evidence backing their classification — and per re-evaluation (2026-08-14) against the known `FlightOthers`/class-name-matching false-positive history, the strength of that evidence differs across the four:

1. **TC-BR-066/067/068 (3 of 4):** `assertSubmissionSucceeded()`'s own real check (navigation or "Pending for approval" text, per `AddBranch_Page.java:954-979`) genuinely timed out — a **confirmed, repeatable functional failure**. However, the `[DIAG8] errors=FlightOthers` and `[DIAG8] emptyFields=...` lines cited in §2.1-2.3 are diagnostic-only, class-name-substring-based printouts never consulted by the assertion itself. `FlightOthers` specifically is an already-confirmed false positive (`RepairSummary.md:408-410` — its parent is `ng-valid`, and it appears identically on a freshly-opened, nothing-filled form). The `emptyFields` list checks only visible+empty, not required-ness or any application-side invalid signal. **No evidence in this run shows a real, visible validation error or a confirmed invalid application state.** The *that it failed* is confirmed; the *why* is not — this is **Inconclusive/Needs Diagnosis**, not a confirmed root cause.
2. **TC-BR-069 (1 of 4):** blocked by a new, distinct manifestation of Credential-dropdown intermittency (overlay never appeared) in the already-repaired code path — **evidence-backed, not yet root-caused to the same certainty as attempt 5/6's diagnosis.** Also **Inconclusive/Needs Diagnosis**.

No repair or rerun was applied to either finding, per your explicit instruction to stop after evidence collection.

| Bucket | Count | Test Case IDs |
|---|---|---|
| Confirmed Passed | 20 | (unchanged, per `BranchFailureAnalysis_2026-08-14.md`) |
| Confirmed Application Failures | 2 | TC-BR-026, TC-BR-052 |
| Confirmed Automation Failures | **1** | TC-BR-054 (unchanged — TC-BR-066/067/068 do NOT join this bucket; their root cause is not confirmed) |
| Inconclusive / Needs Diagnosis | **5** | TC-BR-046, TC-BR-066, TC-BR-067, TC-BR-068 (confirmed functional failure, unconfirmed cause), TC-BR-069 (new evidence-backed symptom, unconfirmed cause) |
| Not Executed / Unverified | **3** | TC-BR-056, 057, 058 |
| Quarantined | 1 | TC-BR-001 |
| **Total** | **32** | 20+2+1+5+3+1 = 32 ✓ |

## 7. Recommendations

- **TC-BR-066/067/068:** the shared functional failure (submission's outcome signal never appears within 10s) is confirmed and repeatable, but its cause is not. Do not treat `FlightOthers` or the `emptyFields` list as the confirmed cause — both are diagnostic artifacts, and `FlightOthers` specifically is an established false positive. Recommend a live diagnosis (comparable to the one already done for TC-BR-001/attempt 5) checking: (a) whether the additional supplier rows are genuinely marked required/invalid by the application, (b) whether the 10s `SUBMIT_OUTCOME_TIMEOUT` is simply too short under `BranchProvisioner`'s heavier setup (same class of issue as the original REPAIR-001 cause), before proposing any repair.
- **TC-BR-069:** recommend a live diagnosis pass on the Credential-dropdown overlay-non-appearance, comparable in rigor to the one already done for TC-BR-001's attempt 5, before proposing any further repair to that code path — a second repair on an unconfirmed cause risks the same guess-based failure mode this run just avoided.
- **TC-BR-001's quarantine:** unaffected by this run; recommendation from `rerun-10`/`QuarantineRegister.md` stands unchanged — a further verification pass under conditions closer to the original open-timeout failure is still the way forward, independent of this group's outcome.
