# Branch Search Filter Diagnosis — 2026-08-14

**Diagnosis ID:** `DIAG-BR-20260814-01`
**Scope:** Branch Search filters — Branch Name, Branch Code, Status.
**Trigger:** Evidence review of TC-BR-041 established that no Branch Search filter affected the result set across `rerun-15`/`16`/`19`, and that TC-BR-040's pass was vacuous for the same reason. Root cause was recorded as Inconclusive/Needs Diagnosis, Medium confidence, diagnosis-only. Human approved one Headed, read-only live diagnosis.

**This was a diagnosis, not a repair.** No code, configuration, assertion, or test-data file was changed. No repair was applied.

## 1. Safety

| Item | Value |
|---|---|
| Actions performed | Navigate, type, click Search, read grid. **Nothing else.** |
| Records created / updated / approved / rejected / deleted | **Zero** |
| Execution Safety decision | `SEARCH` and `READ`, ownership `Shared`, module `branch`, environment `Staging` → **Allowed**, matched rule `policy.categories.read.Shared` ("Searching, filtering, paginating and viewing pre-existing records is not mutation and is fully in scope"). No mutation authorization was required or created. |
| Mode | **Headed**, Chrome, viewport 1440×900, via the platform Browser Driver layer |
| Session start | 2026-08-14T16:53:23Z |
| Target | `http://192.168.1.70/admin/branch` (Staging) |
| Screenshots | `evidence_filter_diagnosis_2026-08-14/` — one per scenario |

## 2. Method

Seven scenarios, each from a **fresh page load** of the Branch list, capturing before-state, input state, DOM events, the outbound request, the response, and after-state.

The discovered target row (chosen at runtime from the unfiltered grid, not hardcoded) was **`BRN782` / `QA_1930731486033100`**.

Two interaction variants were used for Branch Name, deliberately, to isolate the layer:

- **Real keystrokes** — `pressSequentially` with per-character key events, then blur. This is the user-equivalent interaction.
- **Value set without events** — `element.value = "…"` via JavaScript, dispatching nothing. This models a lost input-commit.

## 3. Results

### 3.1 Branch Name — real keystrokes

| Item | Value |
|---|---|
| Visible input value | `QA_1930731486033100` ✔ |
| Angular form-control classes | `ng-valid ng-dirty ng-touched`, plus PrimeNG `p-filled` |
| Events observed | 19 × `input`, 19 × `keyup`, 1 × `change`, 1 × `blur` — **all `isTrusted: true`** |
| Outbound request | `POST http://192.168.1.70:8080/odeysysadmin/Master2/Branch/search?size=10&page=1` |
| Request payload | `{"branchName":"QA_1930731486033100","status":1}` |
| Response | `200`, `{"total": 1}` |
| Grid after | `Showing 1 results of 1 results`, 1 row |

**The filter works.**

### 3.2 Branch Name — value set, no events *(the reproduction)*

| Item | Value |
|---|---|
| Visible input value | `QA_1930731486033100` ✔ — **looks correct on screen** |
| Angular form-control classes | `ng-untouched ng-pristine ng-valid` — **the form model was never updated** |
| Events observed | **none** |
| Outbound request | `POST …/Master2/Branch/search?size=10&page=1` |
| Request payload | **`{"branchName":null,"status":1}`** — the criterion is **missing from the request** |
| Response | `200`, `{"total": 509}` |
| Grid after | `Showing 10 results of 509 results`, 10 rows, unfiltered |

**This reproduces the failure signature from `rerun-15`/`16`/`19` exactly**: a visibly-populated input, a search that returns the complete unfiltered result set, no empty state, and no change to the summary.

### 3.3 Branch Code — real keystrokes

Payload `{"branchCode":"BRN782","branchName":null,"status":1}` → `200`, `{"total": 1}` → `Showing 1 results of 1 results`. **Works.**

### 3.4 Branch Code — guaranteed non-matching (`ZZZZQQ9`)

Payload `{"branchCode":"ZZZZQQ9","branchName":null,"status":1}` → `200`, `{"total": 0}` → **empty state shown**, 0 rows.

**Works — this is exactly the behaviour TC-BR-043 asserts and currently fails on.**

### 3.5 Status filter — all three options

| Option | Radio `checked` | Payload `status` | Response total | Grid summary |
|---|---|---|---|---|
| Active | `true`, value `1` | `1` | 509 | `Showing 10 results of 509 results` |
| Inactive | `true`, value `0` | `0` | 172 | `Showing 10 results of 172 results` |
| Both | `true`, value `-1` | `-1` | 681 | `Showing 10 results of 681 results` |

**509 + 172 = 681.** The Status filter works correctly, and **TC-BR-045's assertion (`Both == Active + Inactive`) is arithmetically correct and would pass** against this behaviour.

### 3.6 Does "Emirates NDC" exist? — **Yes**

A follow-up read-only search, Status = Both, real keystrokes:

| Search | API total | Rows returned |
|---|---|---|
| Branch Name = `Emirates NDC` | 1 | `BRN22` / `Emirates NDC` |
| Branch Code = `BRN22` | 1 | `BRN22` / `Emirates NDC` |

**The record was never deleted.** It is present in Staging as of 2026-08-14, under the same code (`BRN22`) it had in the last passing cycle on 2026-08-06.

## 4. Failing layer — determined

Against the human-specified decision rule:

| Rule | Verdict |
|---|---|
| Criterion missing from the outbound request → **Automation input-commit defect** | **✔ THIS ONE** |
| Criterion sent correctly but backend returned unfiltered data → Application/API defect | Ruled out — the API filtered correctly every time it received a criterion |
| Backend returned filtered data but UI stayed unchanged → Application UI-binding defect | Ruled out — the grid rendered every filtered response correctly |
| No request sent → click/action-delivery or application event defect | Ruled out — a `POST …/Branch/search` was dispatched in all 7 scenarios |

**Confirmed failing layer: automation input-commit.** The application, its search API, and its UI binding are all working correctly.

**Application defect: ruled out** for TC-BR-040, TC-BR-041, TC-BR-043 and TC-BR-045.

### 4.1 What remains unconfirmed

- **The SHAFT process's own outbound payload was not captured.** The layer is established by reproduction — suppressing input events produces the identical observable outcome the SHAFT runs produce (visibly-filled input, unfiltered 509/508 result, no empty state, no summary change) — not by intercepting SHAFT's own request. Direct capture would require running SHAFT behind a proxy.
- **The precise mechanism inside SHAFT is not established.** No `clickUsingJavascript`/`forceCheckTextWasTypedCorrectly` overrides exist in this project's `execution.properties`, so SHAFT engine defaults are in effect. Which default path (`sendKeys` vs. a JavaScript value-set fallback) is being taken at runtime has not been observed.
- **The Status filter's automation-side mechanism is not established.** A real click on `label[for='id-Status-…']` commits correctly (§3.5). TC-BR-045's runs show all three options returning the Active total, which means the Status value did not reach the request there either — but this diagnosis did not reproduce SHAFT's specific click path, so the shared-mechanism inference is evidence-consistent, **not confirmed**.

## 5. Impact

| Test | Impact |
|---|---|
| **TC-BR-040** | Test Integrity Finding confirmed. Branch Code filtering **does** work (§3.3/3.4); the test's pass never proved it. Needs a non-vacuous assertion. |
| **TC-BR-041** | Application search defect **ruled out**. The expected record **exists** (§3.6). Two live findings remain: the hardcoded shared-data dependency (Test-Design Defect, real but not the cause), and the automation input-commit defect (the actual cause). |
| **TC-BR-043** | Assertion is **correct as written** — a non-matching code genuinely produces `total: 0` and the empty state. Same input-commit cause. |
| **TC-BR-045** | Assertion is **correct as written** — `681 == 509 + 172`. Same cause, via the Status control rather than a text input. |

**These are one defect, not four.** A single input-commit repair is expected to resolve TC-BR-041, TC-BR-043 and TC-BR-045 together, and to make TC-BR-040's assertion meaningful again.

## 6a. SUPERSEDED BY D1 — `DIAG-BR-20260814-02`, 2026-08-14

The instrumented confirmation run (`ExecutionResults.rerun-20.md`, `EXEC-BR-20260814-13`, Headed, Java 21, TC-BR-040/041/043/045) **refuted the mechanism proposed in §4 of this document**, while leaving §4's application-side conclusions intact.

| Question | §4's expectation | D1's evidence |
|---|---|---|
| Text inputs visibly filled but `ng-pristine`? | Expected yes | **No** — `visibleValue: ""`. The field is empty; SHAFT's text never landed. Zero events. Element **is** the focused element |
| Status selection fails to commit? | Evidence-consistent only | **Confirmed** — requesting `Both` leaves `Active` checked, `Both.checked=false`, zero events, all three options |
| Missing/incorrect criteria in the request? | Expected yes | **No** — `NETWORK issued-by-Search -> []` in **6 of 6** searches. **No request is sent at all** |

**Corrected failing layer: SHAFT action delivery**, not input-commit. `driver.element().type()` and `.click()` are logged as performed while producing no value, no events, no radio change and no HTTP request. §3's browser-level results and §4's ruling-out of Application/API/UI-binding defects are unaffected and still stand — the application works under real user-equivalent interaction.

**Repair implication:** Strategy A as originally scoped (native `clear()` + `sendKeys()`) targets the wrong mechanism and may not survive contact with a delivery failure that also swallows plain clicks. The already-proven in-repo remedy for this exact symptom is `Branch_Common.clickVia` (REPAIR-BR-010/011), which dispatches the full event sequence — and notably, every control already routed through `clickVia` works, while every control still on plain `driver.element()` fails. Not concluded; the human's approval is required before any strategy is applied.

## 6b. Completion-signal probe — `DIAG-BR-20260814-03`, 2026-08-14

Read-only, Headed, via the Browser Driver. Nothing created, updated, approved, rejected or deleted; no production code touched. Instrumentation (pass-through XHR timing wrapper, `MutationObserver`, node-identity references) was installed in the page immediately before the Search click and torn down after; sampling at 75 ms for ~9 s.

Two scenarios, both driven with real user-equivalent interaction:
- **A — result set changes:** search Branch Name = `QA_1930731486033100` (runtime-discovered), 509 → 1.
- **B — result set identical:** select the already-default `Active`, no text criteria, 509 → 509.

| Signal | A (changed) | B (identical) | Verdict |
|---|---|---|---|
| Request | `POST …/Branch/search`, start 32 ms, end 114 ms, 200, `total: 1` | start 37 ms, end 252 ms, 200, `total: 509` | — |
| **Loading overlay** `div.p-datatable-loading-overlay.p-component-overlay` | appears 33 ms, disappears 114 ms | appears 38 ms, disappears 252 ms | **Exists.** Tracks request start/end almost exactly. But lifetime is only **81 ms / 213 ms** |
| **First `<tr>` detached / replaced** | 116.7 ms | **279 ms** | **Reliable in both.** 10 `<tr>` removed + 10 added even when the result is identical — no `trackBy` reuse |
| `tbody` detached / replaced | never | never | **Unreliable** — the node is reused |
| Summary node detached / replaced | never | never | **Unreliable** — the node is reused |
| Summary **text** change | 117 ms | **never** | **Unreliable** — fails exactly in case B |
| Row **count** change | 117 ms | **never** | **Unreliable** — fails exactly in case B |

**Confirmed completion signal: staleness of a `<tr>` captured before the click.** It is *terminal* (once stale, always stale), so it is catchable at any polling rate, and it fired in both scenarios — including the identical-result case where every count- and text-based signal fails.

**The loading overlay is real but must not be the primary signal.** Its 81 ms lifetime is shorter than the suite's 250 ms `POLL_INTERVAL`, so a polling wait would routinely miss it entirely. It is retained as best-effort diagnostic context only.

**Discovery-snapshot gap noted:** `DiscoverySnapshot_SearchBranch.md` records no loading indicator, yet PrimeNG's DataTable overlay demonstrably exists on this screen. Recorded as a Discovery accuracy gap, not actioned here.

## 6c. Empty-grid completion-signal probe — `DIAG-BR-20260814-04`, 2026-08-14

Read-only, Headed. Observer armed **before** the Search click so the overlay could not be missed. Pre-click state reached by searching a non-matching code, then searching again from that empty grid.

| Signal | C1 — empty → rows | C2 — empty → empty |
|---|---|---|
| Request | start 29 ms, end 91 ms, 200, `total: 1` | start 41 ms, end 75 ms, 200, `total: 0` |
| **Overlay (observer-armed)** | **appeared 30 ms → disappeared 91 ms** | **appeared 42 ms → disappeared 75 ms** |
| Empty-state cell detached / replaced | **111.9 ms** | **never** |
| Empty-state row detached | 111.9 ms | never |
| `tbody` detached / replaced | never | never |
| `<tr>` added / removed | 1 added, 1 removed @ 91 ms | **none** |
| Row count | 0 → 1 | 0 → 0 |

**C2 is the decisive case: the DOM does not change at all.** No node detached, replaced, added or removed; the empty-state text is identical. The observer-recorded overlay cycle is the **only** evidence the search ran — and its lifetime here was **33 ms**, so nothing that polls could ever see it.

**Mandatory empty-grid signal: the pre-armed overlay appear→disappear cycle**, with empty-state-row staleness accepted as an equivalent signal for the C1 shape. **No non-fatal fallback.** If neither is observed, `clickSearch` throws an unsupported-pre-click-state diagnostic rather than accepting the unchanged empty state — which would otherwise have been a false pass of exactly the kind this whole diagnosis chain exists to eliminate.

**Overlay diagnostics constraint recorded:** a one-shot presence check at failure time must never be read as "no request was delivered", because the overlay will normally have come and gone before any timeout fires. Only the pre-armed observer's record may support a delivery claim, and `searchDiagnostics()` reports only that.

## 6d. TC-BR-052 grid-header inspection — `DIAG-BR-20260814-05`

Read-only live DOM inspection. Screenshot: `evidence_filter_diagnosis_2026-08-14/tc-br-052-grid-headers.png`.

- **Expected labels in the test** (`SearchBranch_TC:191-192`): `Branch Code, Branch Name, Country Name, State, City, Approval Status, Actions`.
- **Locator/method:** `GRID_HEADER_CELLS = By.cssSelector("table thead th")`, read by `SearchBranch_Page.columnHeaders()` inside `withStaleRetry`, compared case-insensitively at `SearchBranch_TC:200`.
- **Headers captured by the automation:** `[Code, Branch Name, Country Name, City, Approval Status, Actions]`.
- **Live DOM:** exactly **1** `<table>` (`p-datatable-table`), **1** `<thead>`, **1** header row, **6** `<th>`. Table width 817px in a 1440px viewport. `horizontalScroller: null`. No cell is zero-size, `display:none`, `visibility:hidden`, icon-only, or positioned off-screen. No duplicate or sticky header table. First data row also has 6 cells: `BRN782, QA_1930731486033100, Egypt, Cairo, Approved, ""`.

**Ruled out by direct evidence:** viewport-only reads, horizontal-scroll clipping, responsive/collapsed headers, duplicate/sticky header tables, icon-only or empty headers, wrong table or header row, and read-before-render (the inspection ran 1.5s after rows rendered and matches every prior cycle).

**Established causes:**
1. **Expected-label mismatch — confirmed automation defect.** The application renders `"Code"`; the test expects `"Branch Code"`. This alone accounts for one of the two reported missing columns.
2. **`State` — unresolved.** No State header was observed. Per the human's business clarification (grid columns work correctly; Branch Code and State are present; no application defect), **no application defect is claimed here**; the condition under which State renders must be settled before the expected set is finalised.

## 6e. Keystroke-delivery mechanism comparison — `DIAG-BR-20260814-06`

Temporary diagnostic harness (`SearchDeliveryDiagnostic_TC`), same SHAFT/Selenium driver, Headed, Java 21, asserting nothing and changing no production behaviour. **Harness deleted after capture; `mvn clean compile test-compile` exit 0 afterwards.**

| | A — `clear()` + `sendKeys()` | B — W3C `Actions` |
|---|---|---|
| Visible value (Code / Name) | `""` / `""` | `""` / `""` |
| Angular state | `ng-pristine ng-untouched` | `ng-pristine ng-untouched` |
| `readOnly` / `disabled` | `false` / `false` | `false` / `false` |
| Bounds | 347×45 at (371,335) / (748,335) | same |
| `elementFromPoint` at centre | **the target input itself** (`topmostIsTarget: true`) | **the target input itself** |
| `activeElement` after | **`INPUT#id-Branchcode`** — focus reached the target | **`BODY#`** — the click never focused the input |
| Events observed in the page | **`[]`** for Code; **`["blur(t)"]`** for Name | **`[]`** — not even a `click` |

**Both mechanisms fail. No JS-dispatched fallback was attempted, per instruction.**

**Root-cause lead — a version mismatch in the Selenium stack, not the page:**
```
WARNING: Unable to find CDP implementation matching 150
WARNING: Unable to find version of CDP to use for 150.0.7871.187.
```
The browser is **Chrome 150.0.7871.187**; the project pins **SHAFT_ENGINE 7.4.20231015** (deliberately downgraded from 9.4.20251220, per the pom's own comment), whose bundled Selenium has no CDP implementation for Chrome 150.

This fits every observation: Playwright, which ships its own version-matched CDP, delivered keystrokes to these same controls flawlessly (`DIAG-BR-20260814-01`); Selenium's plain element-click endpoint still works (the Status label committed in `rerun-21`); but keyboard input and `Actions`-synthesised input reach nothing. **Recorded as an evidence-backed lead, not a conclusion** — no controlled experiment pinning a matching driver/browser pair has been run.

## 6. No repair applied

Per instruction, no repair was implemented during diagnosis. No code change has been made. Repair and the TC-BR-041 runtime-discovery redesign both await explicit human approval.
