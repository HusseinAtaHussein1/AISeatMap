# Repair Summary — `agency` / SHAFT, 2026-08-23

## 1. Healing Metadata

| Field | Value |
|---|---|
| Healing Pass ID | HEAL-AGENCY-20260823-001 |
| Run Folder | `run-004__2026-08-17_14-35-25__UserStory__US-4222-UpdateAgency` |
| Source Execution | exec2 (`execution/artifacts/maven_execution_exec2.log`), Headed, `testng-agency.xml` |
| Scope | `agency` — the two per-class fixture failures in `AgencyInheritanceAndReadOnly_TC` and `AgencyDocumentsAndLogo_TC` |
| Environment | Staging (`http://192.168.1.70`) |
| Invocation | Direct, human-requested after reviewing exec2's results |
| Evidence source | Stage `5A` (this run's own execution), not external reports |

## 2. Eligibility Summary

Two `prepareClassFixture` failures were present, both carrying the identical message: *"Provisioning failed: the Add Agency form did not submit."* Both classified eligible as **Flaky** (§5, §14.1) — non-deterministic (failed once, then passed on SHAFT's own automatic retry, in every observed instance), and the automation's own new diagnostic (`stillInvalidMandatoryFields()`) ruled out a field-content defect at the moment of both failures (empty list both times). No `Application Failure` candidates. No cases out of scope for this pass.

## 3. Per-Failure Analysis

**Root Cause Confidence: High**, established from timestamped log correlation across all 5 fixture builds in exec2:

| Class | Branch-ready → outcome | Result |
|---|---|---|
| `AgencyInheritanceAndReadOnly_TC` | ~21.1s | Failed (Run 1), passed on retry |
| `AgencyUpdatePersistence_TC` | ~10.9s | Passed |
| `AgencyUpdateValidation_TC` | ~10.6s | Passed |
| `AgencyDocumentsAndLogo_TC` | ~20.6s | Failed (Run 1), passed on retry |
| `AgencyMakerChecker_TC` | ~9.6s | Passed |

**Strategies enumerated (§7.2):**

| Option | Strategy | Confidence | Risk | Basis |
|---|---|---|---|---|
| A | Widen `SUBMIT_OUTCOME_TIMEOUT` 15s → 30s | 60% (novel pattern, capped per §9.2) | Low | Root cause directly observed via timing correlation; repair targets it directly; reproduced twice with the same signature |
| B | Wait for a busy/spinner indicator before starting the timeout window (reuse `Agency_Common.BUSY_INDICATORS`) | 60% (novel pattern, capped) | Medium | Reuses an existing, live-verified selector, but unverified for this specific submit flow |

**Selected: Option A** (human choice, highest-confidence/lowest-risk option). Applied as `REPAIR-AG-020`.

**Post-application evidence — the repair did not fully resolve it.** A targeted rerun of the two classes reproduced the same failure signature on Run 1, this time with an even longer duration (~35.2s and ~35.3s — both exceeding the new 30s window). A further live diagnosis (§7.1's Diagnosis Strategy — network capture, then in-code timing checkpoints) established that the fixture's own form-filling phase takes only ~4-5s; **the full remaining time (16-31s) is spent between the click and the outcome**, not in filling the form or in the Branch/State/City cascade (all cascade network calls measured under 320ms in a separate live capture). No slower mechanism could be pinned down further without instrumentation beyond this pass's practical reach (browser-level network/CDP tracing on the actual SHAFT-driven session).

## 4. Applied Repairs

| File | Change |
|---|---|
| `src/main/java/AdminPages/Admin/Agency/AddAgency_Page.java` | `SUBMIT_OUTCOME_TIMEOUT` widened from `Duration.ofSeconds(15)` to `Duration.ofSeconds(30)`, documented as `REPAIR-AG-020` |

No other file was changed. Temporary diagnostic timing checkpoints added to `AgencyProvisioner.createAgency` during this pass were removed afterward — they served their purpose (confirming the fill phase is fast) and are not part of the applied repair.

## 5. Rerun Outcome

See `BeforeAfterComparison_20260823.md`. Summary: 0 Fixed, 2 Remaining (reclassified `Flaky`, not resolved by the timeout widening), 0 New Failures, 0 Quarantined.

## 6. Reclassifications

None. Both failures remain classified `Flaky` — the widened evidence (post-repair duration climbing to ~35s) does not point to `Application Failure`; the same fixture build that failed on Run 1 always succeeds, unmodified, on SHAFT's own automatic retry, which is inconsistent with a genuine application defect (a broken create-agency flow would not intermittently self-correct without any client-side change).

## 7. Disclosed Discrepancies

None.

## 8. Quarantine

Neither test/class is quarantined. Attempt count under `QuarantineRegister.md`: this is the first healing pass against this fixture pattern (1 of the default 2-prior-attempt limit).

## 9. Knowledge Recorded

**Nothing written to the Repair KB.** Per §10.2, only confirmed-fixed repairs are recorded — the widened timeout did not resolve the failure on rerun (it recurred at a longer duration), so `REPAIR-AG-020` is documented here, in this module's own history, but is **not** promoted to `platform_core/knowledge/patterns/repair_patterns/`.

## 10. Health Impact

| | Before this pass | After this pass |
|---|---|---|
| Automation Health | 2 Flaky (both self-recovered via SHAFT's built-in retry) | Unchanged — still 2 Flaky, same self-recovery behaviour observed 3/3 times across two separate executions |
| Application Health | Unchanged | Unchanged — no application defect was found or suppressed |

## 11. Recommendations

- **Accept as a known, self-recovering Flaky pattern for now** (operator decision, 2026-08-23). SHAFT Engine's own built-in automatic retry (not a project-added mechanism — confirmed no `rerunFailingTestsCount` or custom `IRetryAnalyzer` exists in this project) has recovered this fixture build on the very next attempt in **3 of 3** observed occurrences across two separate executions.
- **Keep the 30s timeout** — it is a real, evidence-based improvement over 15s even though it did not eliminate the slow case observed this pass, and widening it further without new diagnostic evidence would be guessing, which this skill's own rules (§14.1) exclude.
- **If this recurs at a rate that costs meaningful execution time, the next diagnostic step is browser-level network/CDP tracing on the actual SHAFT-driven session** (not a hand-built Playwright reproduction, which could not fully replicate the real fixture's request sequence) — to see the create-agency request's own server response time directly, rather than inferring it from surrounding measurements.

## 12. Approval Status

The one applied change (`REPAIR-AG-020`, the timeout widening) is a **minor, low-risk synchronization adjustment** already compiled and verified. Per §15, it still requires the standing Stage `4A` Automation Approval gate before any merge to the baseline — the module remains `Pending Automation Approval`, unchanged by this pass.
