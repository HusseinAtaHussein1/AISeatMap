# Execution Results — run-003 (rerun-20) — D1 instrumented confirmation

**Purpose:** `DIAG-BR-20260814-02` — the human-approved D1 instrumented confirmation run. Diagnostic only. No repair was implemented; Strategy A and Strategy B were both explicitly withheld.

## 1. Execution Metadata

| Field | Value |
|---|---|
| Execution ID | `EXEC-BR-20260814-13` |
| JDK | **Java 21.0.11 (Microsoft)** — verified `java -version`, `mvn -version` (`runtime: C:\Users\Aymoon\.jdks\ms-21.0.11`), clean rebuild `mvn clean compile test-compile` exit 0 |
| Execution Mode | **Headed** (`-DheadlessExecution=false`), as instructed |
| Suite executed | `artifacts_rerun-20/testng-d1-diagnostic.xml` — scoping only, exactly TC-BR-040/041/043/045. `testng.xml` untouched and unused |
| Safety | `SEARCH`/`READ`, ownership `Shared`, module `branch`, env `Staging` → **Allowed** (`policy.categories.read.Shared`). No mutation authorization required; `SearchBranch_TC` mutates nothing |
| Result | `Tests run: 4, Failures: 3` — TC-BR-040 passed (vacuously), TC-BR-041/043/045 failed, reproducing `rerun-19` exactly |
| Diagnostic captures | 33 `[D1-DIAG]` records |
| Console log | `artifacts_rerun-20/maven-console.log` |

## 2. Instrumentation — what it did, and what it did not do

Added temporarily to `SearchBranch_Page.java`, inside a clearly delimited block:

- **Passive event listeners** on the filter inputs and Status radios, armed before SHAFT's action.
- **A pass-through XHR/fetch recorder** that records method, URL and body, then calls the original implementation unchanged.
- **Print-only dumps** of input value, class attribute, `ng-pristine`/`ng-dirty`, `ng-untouched`/`ng-touched`, active element, observed events, Angular model probe, radio checked state, request payloads, and result totals before/after Search.

It **did not** dispatch any missing event, alter any field or radio value, change any assertion, repair any interaction, or handle any sensitive data. Every diagnostic call is wrapped in its own `try/catch` so it cannot alter control flow.

**Control:** `rerun-19` produced the identical failure outcome with **no** instrumentation present, so the instrumentation is not the cause of what follows.

## 3. Findings — the expected mechanism is REFUTED

The human's three questions, answered directly.

### 3.1 "Does the SHAFT path leave text inputs visibly filled but ng-pristine / model-null?" — **No.**

SHAFT reports the action as performed:
```
[INFO] Type "BRN2" into "Branch code".
[INFO] [D1-DIAG] INPUT branchCode -> {"visibleValue":"",
   "classAttribute":"p-inputtext p-component p-element fg-input ng-untouched ng-pristine ng-valid",
   "ngPristineOrDirty":"ng-pristine","ngTouchedOrUntouched":"ng-untouched",
   "activeElement":"INPUT#id-Branchcode","isActiveElement":true,
   "events":[],"ngProbe":"unavailable","ngModel":null}
```

**The input is empty.** `visibleValue: ""` — not filled-but-uncommitted. Zero events of any kind were observed. The element **is** the focused element (`isActiveElement: true`), so SHAFT reached the correct control — the text simply never landed.

Identical for `branchName` (TC-BR-041) and for `branchCode` in TC-BR-043.

**This refutes the mechanism I proposed after the browser-level diagnosis.** My `value`-set-without-events reproduction produced the same *outcome* but by a different *mechanism*: there, the field was genuinely filled and only the Angular model was stale. Here nothing is set at all.

### 3.2 "Does it fail to commit the Status selection?" — **Yes, and more severely than expected.**

```
[INFO] Click "By.cssSelector: label[for='id-Status-Both']".
[INFO] [D1-DIAG] STATUS -> {"selectedLabel":"Both",
   "Active":{"present":true,"checked":true,"domValue":"1"},
   "Inactive":{"present":true,"checked":false,"domValue":"0"},
   "Both":{"present":true,"checked":false,"domValue":"-1"},
   "events":[],"ngProbe":"unavailable"}
```

The intended radio is **not checked**. `Active` remains checked — the default. Zero click or change events observed. This held for all three of TC-BR-045's selections (Active, Inactive, Both), which is why all three returned the Active total of 509.

**The Status-filter mechanism is now directly confirmed, not merely evidence-consistent.**

### 3.3 "Does it send missing or incorrect criteria in the request?" — **No. It sends no request at all.**

```
[D1-DIAG] NETWORK issued-by-Search -> []
```

**In 6 of 6 searches across the four tests, clicking Search issued no `Branch/search` request whatsoever** — while SHAFT logged `Click "Search".` as performed each time.

The recorder is working: it captured the application's own page-load search in TC-BR-045,
`{"m":"POST","u":"http://192.168.1.70:8080/odeysysadmin/Master2/Branch/search?size=10&page=1","b":"{\"status\":1}"}`.

Totals confirm it: `TOTAL before Search = 509` → `TOTAL after Search = 509`, `emptyState=false`, every time.

## 4. Corrected failing layer

Against the decision rule, the correct branch is now the fourth, not the first:

| Rule | Verdict |
|---|---|
| Criterion missing from the request → Automation input-commit defect | **Superseded.** The criterion is missing because it was never entered, and because no request is sent |
| Criterion sent but backend returned unfiltered data → Application/API defect | Ruled out (unchanged) |
| Backend returned filtered data but UI unchanged → Application UI-binding defect | Ruled out (unchanged) |
| **No request sent → click/action-delivery defect** | **✔ CONFIRMED** |

**Confirmed failing layer: SHAFT action delivery.** `driver.element().type()` and `driver.element().click()` report success in the Allure/console log while producing no observable effect on the DOM — no value, no events, no radio state change, no HTTP request.

**Application/API/UI-binding defects remain ruled out** for TC-BR-040/041/043/045. The browser-level diagnosis (`DIAG-BR-20260814-01`) proved every filter works correctly under real user-equivalent interaction.

## 5. Connection to already-documented behaviour — evidence-consistent, not concluded

This exact failure mode is already documented in this codebase, independently:

- `Branch_Common.clickVia`'s Javadoc (REPAIR-BR-010, 2026-08-09): *"a driver-issued click on these controls is reported as delivered and changes nothing"* — verified live 2026-08-05, and confirmed again for pagination via *"timestamped instrumentation showing 20+ second no-op clicks"* (REPAIR-BR-011).
- The Credential-dropdown open-commit intermittency tracked for TC-BR-013/021/038/066/067/068 has the same shape: the click is issued, `overlayPanelCount=0` and `aria-expanded="false"` are unchanged across all attempts.

**The controls that were repaired with `clickVia` are exactly the ones that work.** The Search form's inputs, Status radios and Search button still use plain `driver.element().type()`/`.click()` and are exactly the ones that fail.

This is a strong, coherent link and it is recorded as such — **it is not concluded**. Whether these are one root phenomenon has not been tested, and the 2026-08-06 cycle in which these same tests passed on the same code shows the delivery failure is not constant.

## 6. Instrumentation removed

The D1 block was removed from `SearchBranch_Page.java` after this evidence was preserved; the file was restored to its pre-D1 state and recompiled clean under Java 21. The evidence lives in `artifacts_rerun-20/maven-console.log` and in this artifact.

## 7. No repair applied

Strategy A and Strategy B were both withheld, per instruction. Stopped for human approval.
