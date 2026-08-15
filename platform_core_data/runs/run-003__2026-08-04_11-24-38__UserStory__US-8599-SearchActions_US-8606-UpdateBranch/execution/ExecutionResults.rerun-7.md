# Execution Results — run-003__2026-08-04_11-24-38__UserStory__US-8599-SearchActions_US-8606-UpdateBranch (rerun-7)

**Note on cycle labelling:** the second targeted rerun of healing pass `HEAL-BR-20260809-01`, run **Headed** immediately after `rerun-6` (Headless) to isolate the repair effect from the execution-mode variable. Same 12 tests, same code, same environment — only the mode differs.

## 1. Execution Metadata

| Field | Value |
|---|---|
| Execution ID | EXEC-BR-20260809-02 |
| Run Folder | `run-003__2026-08-04_11-24-38__UserStory__US-8599-SearchActions_US-8606-UpdateBranch` |
| Execution cycle | 8 (targeted rerun 2 of 2 for this healing pass) |
| Modules executed | branch |
| Module scope | single |
| Run Scope Type / Run Type | Selective Re-run — the same 12 tests as `rerun-6` |
| Environment | Staging (STG), shared internal/LAN |
| Target URL | `http://192.168.1.70` |
| Framework | SHAFT Engine 7.4.20231015 (Java) / TestNG |
| Suite executed | scoped `testng-heal-0809.xml` — same 12 methods as `rerun-6` |
| Suite code state | Post-healing (Clusters A/B/C applied), `Pending Automation Approval` |
| Execution Mode | **Headed** (`-DheadlessExecution=false`) — deliberate cross-check against `rerun-6`'s Headless cycle |
| Concurrency Mode | Sequential |
| Retry Policy | No automatic retry |

## 2. Execution Summary

12 tests executed: **1 Passed (TC-BR-043), 11 Failed** — worse than `rerun-6`, and with **different failure signatures for the same tests**: TC-BR-001 failed here on a 20s upstream timeout (it had passed cleanly in `rerun-6`); TC-BR-060 failed on a duplicate-Branch-Code-across-pages assertion instead of "only one page"; TC-BR-061 ran **420 seconds** and failed on `goToLastPage()` exhausting its 80-hop bound without reaching a genuine last page; TC-BR-068 reached the submit step this time (progress past the upstream timeout) but timed out on the new 10-second post-submit wait itself. Only TC-BR-043 and TC-BR-046's failure signature are consistent with `rerun-6`. The inconsistency between the two cycles is itself the primary finding: this suite cannot currently be assessed reliably against this dataset in a single pass, independent of the repairs applied.

## 3. Execution Results

| Test Case ID | Status (§17) | Failure Detail | vs. rerun-6 |
|---|---|---|---|
| TC-BR-001 | **Flaky** | 20s timeout reaching Add Branch button — a step the repair does not touch | Passed in rerun-6; different cause than any pre-repair failure |
| TC-BR-043 | **Passed** | — | Consistent — Fixed |
| TC-BR-046 | **Automation Failure** | Identical `NoSuchElement option never became clickable` | Consistent — repair confirmed not working |
| TC-BR-054 | **Inconclusive** | `no row with Approval Status "Approved" was found within 10 pages` (different status than rerun-6, same cause class) | Consistent data-gap pattern |
| TC-BR-055 | **Inconclusive** | Same 0-rows precondition | Consistent |
| TC-BR-060 | **Inconclusive** | `Branch Code BRN309 appeared on both page 1 and page 2` — data duplication/instability across a live-growing grid, not a stale-element symptom | Different signature; same underlying data-volatility cause class |
| TC-BR-061 | **Inconclusive** | 420s runtime; `goToLastPage()` exhausted `MAX_PAGINATION_HOPS=80` without reaching a stable last page | Different signature; same underlying data-volatility cause class |
| TC-BR-065 | **Inconclusive** | Same 0-rows precondition | Consistent |
| TC-BR-066 | **Inconclusive** | Same upstream 20s timeout | Consistent |
| TC-BR-067 | **Inconclusive** | Same upstream 20s timeout | Consistent |
| TC-BR-068 | **Inconclusive** | Reached submission; `assertSubmissionSucceeded()`'s new 10s bounded wait elapsed with neither signal observed | New — first time this test reached the repaired code |
| TC-BR-069 | **Inconclusive** | Same upstream 20s timeout | Consistent |

## 4. Evidence Inventory

| Evidence Type | Captured? | Location |
|---|---|---|
| Execution Logs | Yes | `artifacts_rerun-7/maven-console.log` |
| Test Runner Reports | Yes | `artifacts_rerun-7/surefire/TEST-TestSuite.xml` |
| Screenshots | Combined with rerun-6 | `artifacts_rerun-7/allure/` (`allure-results/` was not cleaned between cycles — see rerun-6 §4/§6 KL-09) |
| Scoping input | Yes | `artifacts_rerun-7/testng-heal-0809.xml` |

## 5. Health Summary

| Figure | Count |
|---|---|
| Application Health | 0 |
| Automation Health | 1 confirmed (TC-BR-046) |
| Environment Health | Not cleanly separable from Automation Health this cycle — see Repair Summary §5/§6 for the reconciled call |
| Flaky | 1 (TC-BR-001) |
| Inconclusive | 9 |

## 6. Known Limitations

Carries forward `rerun-6`'s KL-08/KL-09 unchanged — both apply equally here, and this cycle's own results (TC-BR-061's 420s runtime, TC-BR-060's duplicate row) are direct evidence that KL-06's data-growth problem has now reached a severity that breaks test execution, not just leaves residue.

## 7. Execution Recommendations

See Repair Summary `HEAL-BR-20260809-01` §5/§11 for the reconciled Before/After verdict and recommendations across both reruns.
