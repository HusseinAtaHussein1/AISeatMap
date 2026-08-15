# Execution Results — run-003 (rerun-22) — post-restoration verification of the full SearchBranchSuite

**Purpose:** verify that restoring `SearchBranch_Page.java` to its pre-repair checkpoint (`0becb64`) reproduces the previously-known behaviour of every currently implemented Search Branch test, with no regression.

## 1. Execution Metadata

| Field | Value |
|---|---|
| Execution ID | `EXEC-BR-20260814-15` |
| JDK | **Java 21.0.11 (Microsoft)** — `mvn clean compile test-compile` BUILD SUCCESS, exit 0, before execution |
| Runner | Maven Surefire 3.1.2 |
| Mode | **Headed** (`-DheadlessExecution=false`) |
| Environment | Staging (`http://192.168.1.70`) |
| Suite | `artifacts_rerun-22/testng-searchsuite.xml` — scoping only, unfiltered `SearchBranch_TC`. `testng.xml` untouched and unused |
| Browser lifecycle | Per suite configuration — a fresh `SHAFT.GUI.WebDriver` and login per test method (`TestBase.setUp`/`tearDown`) |
| Safety | `SEARCH`/`READ`, `Shared`, branch, Staging → **Allowed** (`policy.categories.read.Shared`). Nothing created, updated, approved, rejected or deleted |
| Code / config / data / assertion / locator changes | **None**, before or during |
| Retries / healing / repair | **None** |
| Result | `Total Cases: 11 --> Passed: 6 | Failed: 5 | Skipped: 0`; Surefire `Tests run: 11, Failures: 5, Errors: 0, Skipped: 0`, 355.2 s |
| Artifacts | `artifacts_rerun-22/maven-console.log`, `artifacts_rerun-22/surefire/` |

## 2. Per-test results

| TC | Result | Own assertion reached? | Observed behaviour | Failure point | Cause classification | Matches pre-repair signature? | Internal stale retries |
|---|---|---|---|---|---|---|---|
| **TC-BR-040** | **Passed** | Yes | Typed `BRN2` into Branch code, Status **Both**. `clickSearch` **timed out at 20364 ms**, summary unchanged `"Showing 10 results of 509 results"`, 10 rows. Rows read: `BRN782, BRN774, BRN768, BRN761, BRN754, BRN753, BRN297, BRN742, BRN2, BRN298`. Assertion passed only because `BRN2` sits on the unfiltered first page | — | **Automation action-delivery defect + Test Integrity Finding (vacuous pass)** | **Yes** | 0 |
| **TC-BR-041** | **Failed** | Yes | Typed `Emirates NDC` into Branch name, Status **Both**. `clickSearch` timed out at 20441 ms, summary unchanged `509`, 10 rows. Grid returned `[QA_1930731486033100, QA_1927231207732600, QA_1925805352563400, QA_1924166850960800, QA_1921746026389000, QA_1921426639455500, NDC2_Ahmed Alhussieny, Anglea_ee4e8e, Test, Uplift2_Mohanad Dawood]` | `SearchBranch_TC:88` | **Automation action-delivery defect** (+ independent hardcoded test-data design weakness) | **Yes** | 0 |
| **TC-BR-042** | **Passed** | Yes | No criteria. `clickSearch` **resolved at 275 ms**, summary `"Showing 10 results of 509 results"`, 10 rows, no empty state | — | N/A — passed | Yes | 0 |
| **TC-BR-043** | **Failed** | Yes | Typed `ZZZZQQ9` into Branch code, Status **Both**. `clickSearch` timed out at 20211 ms, summary unchanged `509`, 10 rows, **no empty state** | `SearchBranch_TC:121` | **Automation action-delivery defect** — application empty-state behaviour is working | **Yes** | 0 |
| **TC-BR-045** | **Failed** | Yes | Three searches: Status **Active** → timed out 20290 ms, `509`; Status **Inactive** → resolved 542 ms, `509`; Status **Both** → resolved 279 ms, `509`. `Expected Both (509) to equal Active (509) plus Inactive (509)` | `SearchBranch_TC:143` | **Automation action-delivery / grid-completion defect** — application Status filtering and arithmetic are working | **Yes** | 0 |
| **TC-BR-046** | **Passed** | Yes | State filter disabled before Country selection; became enabled after selecting `Egypt`; State options non-empty | — | N/A — passed. Known intermittent (failed `rerun-16`, passed `rerun-19` and here) | Yes — consistent with its intermittent history | 0 |
| **TC-BR-052** | **Failed** | Yes | Headers rendered `[Code, Branch Name, Country Name, City, Approval Status, Actions]`; test expects `Branch Code` and `State` | `SearchBranch_TC:200` | **Test-Design / Expected-Result defect** — the expected contract is outdated (`Branch Code` should be `Code`; `State` is not in the approved current header set). **Not an application failure** | **Yes** | 0 |
| **TC-BR-054** | **Failed** | Yes | Scanned 10 pages, Status Both. `Approved` found on page 0. `Pending for approval` never found — `statusesSeen` on every scanned page was all-`Approved`. `Unmet precondition: no row with Approval Status "Pending for approval" was found within 10 pages` | `SearchBranch_TC:235 → assertIconsForStatus:272` | **Automation defect — previously confirmed scan-bound** | **Yes** | Included in the 10 recorded (see §3) |
| **TC-BR-055** | **Passed** | Yes | Search returned rows; edit pen opened Update Branch with Name/Country/City matching the grid row and a non-empty State | — | N/A — passed | Yes | see §3 |
| **TC-BR-060** | **Passed** | Yes | Page 1 `[BRN782, BRN774, BRN768, BRN761, BRN754, BRN753, BRN297, BRN742, BRN2, BRN298]` → page 2 `[BRN295, BRN251, BRN103, BRN253, BRN741, BRN710, BRN291, BRN709, BRN708, BRN309]` in 2611 ms; no code appeared on both pages. `highestOffered=51` | — | N/A — passed | Yes | see §3 |
| **TC-BR-061** | **Passed** | Yes | Walked the numbered page buttons to the final page; final page had rows and offered no further next page | — | N/A — passed | Yes | see §3 |

## 3. Internal stale-element retries

**10 `StaleElementReferenceException` occurrences** were caught and retried internally by the already-approved `Branch_Common.withStaleRetry` helper across the run, concentrated in the grid-scanning and pagination tests (TC-BR-054, TC-BR-055, TC-BR-060, TC-BR-061), which repeatedly re-read the grid while it re-renders. **Every one was absorbed by the retry and none surfaced as a test failure.** They are recorded here rather than hidden: this is the mechanism REPAIR-BR (2026-08-09) introduced, working as intended. No stale retry occurred in TC-BR-040/041/042/043/045.

## 4. Summary counts

| Metric | Value |
|---|---|
| Total Search tests executed | **11** |
| Passed | **6** — TC-BR-040 (vacuously), 042, 046, 055, 060, 061 |
| Failed | **5** — TC-BR-041, 043, 045, 052, 054 |
| Broken (error, not assertion) | **0** |
| Skipped | **0** |

## 5. Did reverting restore previously working behaviour? — **Yes**

Every test reproduces its pre-repair signature exactly. The five failures carry the same messages, values and failure points recorded before the repair attempt; the six passes behave as before. Notably, the loud commit guards are gone, so TC-BR-040/041/043/045 no longer fail fast at a delivery guard — they run the full 20 s `clickSearch` timeout and then evaluate against the unfiltered grid, exactly as in `rerun-19`.

**No previously-green Search test regressed.** TC-BR-042, 046, 055, 060, 061 all passed. TC-BR-046 passed, consistent with its known intermittency (failed `rerun-16`, passed `rerun-19` and here) — not a regression.

## 6. Credential dropdown — not involved

**The Credential dropdown does not appear anywhere in this run.** `SearchBranch_TC` provisions nothing and mutates nothing; no `openCredentialDropdownWithRetry`, no `selectFirstSupplierCredential`, and no `IllegalStateException` for a Credential open-commit occurs in the log. The Credential intermittency tracked for TC-BR-013/021/038/066/067/068 is unrelated to and untouched by these results.

## 7. New evidence — the delivery failure is screen-specific, not driver-wide

Every one of the 11 tests logs in first, and **`Type "odeysysadmin" into "Username *"` succeeds every time** — login completes and navigation proceeds. The same SHAFT/Selenium driver, in the same session, therefore **does** deliver keystrokes to the Login screen's inputs while delivering nothing to the Branch Search filter inputs.

**This materially weakens the Chrome 150 / SHAFT 7.4 CDP-mismatch lead recorded in `DIAG-BR-20260814-06`.** A global CDP/input breakage cannot explain working login typing. The defect is specific to the Branch Search filter controls (PrimeNG `p-inputtext` inside the `ndc-fg-input` wrapper), not to the driver stack as a whole. Recorded as evidence; no new cause is concluded, and no repair is proposed here.

## 8. Which failures need what

| Needs **test-design correction** | Needs **automation interaction repair** |
|---|---|
| **TC-BR-052** — expected header contract outdated (`Branch Code` → `Code`; `State` not in the approved set) | **TC-BR-041, TC-BR-043, TC-BR-045** — action delivery to the Search filter controls |
| **TC-BR-041** — additionally, the hardcoded `Emirates NDC` dependency needs runtime discovery | **TC-BR-040** — same delivery defect; its vacuous assertion also needs strengthening so the pass stops being false |
| **TC-BR-040** — vacuous assertion (Test Integrity Finding) | **TC-BR-054** — previously confirmed scan-bound automation defect |

## 9. No further action

No full Branch run, no merge, no promotion, no repair, no retry. Stopped for human review.
