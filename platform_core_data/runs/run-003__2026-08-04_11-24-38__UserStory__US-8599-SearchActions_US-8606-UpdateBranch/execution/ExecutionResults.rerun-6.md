# Execution Results — run-003__2026-08-04_11-24-38__UserStory__US-8599-SearchActions_US-8606-UpdateBranch (rerun-6)

**Note on cycle labelling:** a Stage `5H` **targeted rerun** (healing pass `HEAL-BR-20260809-01`) — only the 12 tests classified `Automation Failure` in `EXEC-BR-20260806-03`/`rerun-5`, on code carrying three new repairs (Clusters A/B/C, `modules/branch/healing/RepairSummary.md` § Pass HEAL-BR-20260809-01). Filed as `rerun-6`; cycles 1–5 are untouched.

## 1. Execution Metadata

| Field | Value |
|---|---|
| Execution ID | EXEC-BR-20260809-01 |
| Run Folder | `run-003__2026-08-04_11-24-38__UserStory__US-8599-SearchActions_US-8606-UpdateBranch` |
| Execution cycle | 7 (targeted rerun 1 of 2 for this healing pass) |
| Modules executed | branch |
| Module scope | single |
| Run Scope Type / Run Type | Selective Re-run — the 12 `Automation Failure` results from `rerun-5` |
| Environment | Staging (STG), shared internal/LAN |
| Target URL | `http://192.168.1.70` |
| Framework | SHAFT Engine 7.4.20231015 (Java) / TestNG |
| Suite executed | scoped `testng-heal-0809.xml` — `CreateBranch_Admin_TC.tcBr001`, `UpdateBranch_TC.tcBr065/066/067/068/069`, `SearchBranch_TC.tcBr043/046/054/055/060/061` = 12 methods |
| Suite code state | Post-healing (Clusters A/B/C applied), `Pending Automation Approval` |
| Execution Mode | **Headless** (`-DheadlessExecution=true`) — self-healing-skill §12 mandates headless for a targeted rerun |
| Concurrency Mode | Sequential |
| Retry Policy | No automatic retry |
| Started / Ended | 2026-08-09 (see `artifacts_rerun-6/maven-console.log` for timestamps not captured in this summary) |

## 2. Execution Summary

12 tests executed: **2 Passed, 10 Failed**. TC-BR-001 and TC-BR-043 passed. The other 10 failed, but **not on the original stale-element/timing symptoms** — no `StaleElementReferenceException` and no `NoSuchElementException` on the country-filter option appeared in this cycle except TC-BR-046, which failed on the exact original symptom (repair unconfirmed). The other 9 failures are new signatures: empty result sets, "no matching row within 10 pages," "only one page of results," and 20-second timeouts reaching the Add Branch button — consistent with the already-disclosed, uncontrolled growth of `QARUN`/`QAPROBE` Branch records on shared STG (`rerun-5` KL-06). This cycle alone cannot separate "repair didn't work" from "environment/data volume broke an unrelated precondition" — see `rerun-7` for the headed cross-check and the Repair Summary's Before/After analysis for the reconciled verdict.

## 3. Execution Results

| Test Case ID | Automation Script ID | Status (§17) | Failure Detail |
|---|---|---|---|
| TC-BR-001 | `CreateBranch_Admin_TC::tcBr001_...` | **Passed** | — |
| TC-BR-043 | `SearchBranch_TC::tcBr043_...` | **Passed** | — |
| TC-BR-046 | `::tcBr046_...` | **Automation Failure** | `NoSuchElement option never became clickable` — identical to pre-repair symptom |
| TC-BR-054 | `::tcBr054_...` | **Inconclusive** | `Unmet precondition: no row with Approval Status "Pending for approval" was found within 10 pages` — the test's own message names this an environment data gap, not confirmed automation-side |
| TC-BR-055 | `::tcBr055_...` | **Inconclusive** | `Expected results to open a record from` — search returned 0 rows |
| TC-BR-060 | `::tcBr060_...` | **Inconclusive** | `Unmet precondition: the search returned only one page` |
| TC-BR-061 | `::tcBr061_...` | **Inconclusive** | Same one-page precondition |
| TC-BR-065 | `UpdateBranch_TC::tcBr065_...` | **Inconclusive** | Same 0-rows precondition as TC-BR-055 |
| TC-BR-066 | `::tcBr066_...` | **Inconclusive** | 20s timeout reaching the Add Branch button — a step upstream of this pass's repair |
| TC-BR-067 | `::tcBr067_...` | **Inconclusive** | Same upstream timeout |
| TC-BR-068 | `::tcBr068_...` | **Inconclusive** | Same upstream timeout |
| TC-BR-069 | `::tcBr069_...` | **Inconclusive** | Same upstream timeout |

## 4. Evidence Inventory

| Evidence Type | Captured? | Location / Reason |
|---|---|---|
| Execution Logs | Yes | `artifacts_rerun-6/maven-console.log` |
| Test Runner Reports | Partial | `target/surefire-reports/TEST-TestSuite.xml` was overwritten by `rerun-7` (same suite name, same output path) before being copied — not recoverable separately for this cycle. Disclosed as a gap, not silently omitted |
| Screenshots | Partial | `allure-results/` at the project root is not cleaned between `mvn test` invocations; this cycle's screenshots are indistinguishable from `rerun-7`'s in that folder. Combined set preserved under `artifacts_rerun-7/allure/` |
| Scoping input | Yes | `artifacts_rerun-6/testng-heal-0809.xml` |

## 5. Health Summary

| Figure | Count |
|---|---|
| Application Health | 0 — no Application Failure in scope this cycle |
| Automation Health | 2 failures confirmed automation-side (TC-BR-046 unrepaired; the rest reclassified below) |
| Environment Health | Not finalized in this cycle alone — see `rerun-7` and the Repair Summary for the reconciled classification |
| Inconclusive | 9 (TC-BR-054/055/060/061/065/066/067/068/069) — held pending the headed cross-check in `rerun-7` |

## 6. Known Limitations

| ID | Limitation |
|---|---|
| KL-08 | This cycle and `rerun-7` were run back-to-back against the same shared STG instance without any data reset; the growing `QARUN`/`QAPROBE` record set (KL-06) is now large enough to break pagination- and status-search-dependent tests independent of any code change |
| KL-09 | `target/surefire-reports/` and the project-root `allure-results/` are not partitioned per invocation — running two cycles back-to-back lost this cycle's XML report and merged its screenshots with `rerun-7`'s |

## 7. Execution Recommendations

See the Repair Summary (`modules/branch/healing/RepairSummary.md`, Pass `HEAL-BR-20260809-01`) for the reconciled verdict across both reruns — a single cycle's Inconclusive results are not resolved here in isolation.
