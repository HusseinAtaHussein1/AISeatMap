# Quarantine Register — branch module

Per self-healing-skill §14: a test's repair-attempt count is cumulative across this module's whole
history, edited in place. Quarantine is not deletion and not a skip — the test remains in the suite
and remains reported; it is withdrawn from further automated repair, with its history intact, referred
to a human.

## TC-BR-001 — `CreateBranch_Admin_TC::tcBr001_createBranchWithAllMandatoryFields`

| # | Pass | Strategy | Confidence | Outcome |
|---|---|---|---|---|
| 1 | HEAL-BR-20260805-01 | (see `RepairSummary.md` §1, original file) | — | Failed |
| 2 | HEAL-BR-20260806-01 | REPAIR-BR-008 (autocomplete commit-signal) — targeted the Add Branch form generally, not this test's specific cause | — | Failed (separately diagnosed same pass: `FlightOthers` false-positive, not a real cause) |
| 3 | HEAL-BR-20260806-01 (diagnosis, no repair applied) | Root-cause diagnosis established the real cause: `assertSubmissionSucceeded()` read outcome signals immediately, no wait | — | Diagnosis only; no repair attempted that cycle |
| 4 | HEAL-BR-20260809-01 | Bounded 10s `WebDriverWait` on `navigatedAway \|\| pendingApprovalShown` (Cluster A, Option A) | 90% | **Mixed** — passed cleanly in `rerun-6` (Headless); failed in `rerun-7` (Headed) on an unrelated upstream cause (20s timeout locating the Add Branch button, a step this repair does not touch) |
| 5 | Isolated quarantine-recovery verification, 2026-08-14 (`rerun-9`, `EXEC-BR-20260814-02`) | None — diagnosis-only, per human instruction | — | **Failed — a third, previously undocumented signature.** The Add Branch button opened fine this time; the test instead timed out 20s waiting for the Credential Name dropdown's option panel to render (`AddBranch_Page.selectDropdownItem`, called from `selectFirstSupplierCredential`). Never reached `clickSubmit()`/`assertSubmissionSucceeded()`. Live diagnosis (read-only, no code change) identified two confirmed gaps: the locator's `contains(@class,'p-dropdown')` could also match `p-dropdown-trigger` as a substring, and no explicit readiness wait existed between ticking the Status checkbox and clicking the dropdown |
| 6 | Isolated post-repair verification, 2026-08-14 (`rerun-10`, `EXEC-BR-20260814-03`) | REPAIR applied (this session, `AddBranch_Page.java`, Credential-selection path only): token-exact locator, debounced readiness wait, normal click, scoped overlay lookup, mandatory display post-condition, full diagnostic capture on failure | — | **Passed.** Credential selected ("Live"), form submitted, and the created Branch record independently confirmed persisted and retrievable via the live Branch search API (`branchId 11925`, `BRN744`, `QA_BRANCH_1915451539277800`, Egypt/Cairo, status Pending) — not inferred from toast/navigation alone |

**Current classification (corrected 2026-08-14, per explicit human instruction): QUARANTINE REMAINS OPEN.** The attempt count is not reset; it remains a 6-attempt history.

This corrects an earlier draft of this register that read "quarantine lifted." That was premature. Distinguish three separate facts, which must not be collapsed into one status:

| Fact | Status |
|---|---|
| Latest isolated TC-BR-001 execution (attempt 6, `rerun-10`) | **Passed** |
| Credential-selection defect (attempt 5's cause) | **Repaired and formally verified** (`rerun-10`) |
| Original Add Branch open-timeout defect (attempts 1-4's cause, the reason this test was quarantined in the first place) | **Still open / under observation — not repaired, not reproduced, not conclusively resolved** |

**Why quarantine stays open:** quarantine was entered because of the original button-open intermittency, not because of the Credential-selection defect (which was only discovered later, during attempt 5's recovery diagnosis). Fixing and verifying a *different* defect than the one that triggered quarantine does not retire the quarantine — it retires only the sub-issue it addressed. The original symptom has not been independently re-triggered, diagnosed to a confirmed root cause, or repaired. Absent that, TC-BR-001 remains withdrawn from unsupervised automated repair and is counted in the **Quarantined** bucket in reconciled totals, not Confirmed Passed.

**Recommendation:** unchanged — a further verification pass under conditions closer to the original failure (first test in a fresh JVM fork within a larger suite run) is the way to actually test whether the original symptom recurs. Until that happens, this entry stays open.
