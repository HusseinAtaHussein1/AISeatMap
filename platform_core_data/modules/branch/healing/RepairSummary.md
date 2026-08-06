# Repair Summary — Branch

**Status:** Approved

## 1. Healing Metadata

| Field | Value |
|---|---|
| Healing Pass ID | HEAL-BR-20260805-01 |
| Module | `branch` |
| Triggering run | `run-003__2026-08-04_11-24-38__UserStory__US-8599-SearchActions_US-8606-UpdateBranch` |
| Revision | 1 |
| Source Execution ID(s) | EXEC-BR-20260805-01 |
| Rerun cycle written | `runs/run-003__2026-08-04_11-24-38__UserStory__US-8599-SearchActions_US-8606-UpdateBranch/execution/ExecutionResults.rerun-1.md` |
| Scope | Branch module, Add Branch (US-8605) only — 13 test cases (`CreateBranch_Admin_TC`) |
| Module lifecycle state after | Healed (partial) — re-enters the §5.2 gate before assembly; 1 test case remains an open Automation Failure |
| Environment | Staging (STG), `http://192.168.1.70` |
| Framework | SHAFT Engine (Java) / TestNG |
| Started / Completed | 2026-08-05T12:41 / 2026-08-05T13:08 (+03:00) |
| Invocation Path | Direct |
| Run-scoped instruction | "branch — heal the Automation Failure ... Maven Surefire auto-detects JUnitPlatformProvider ..." (user, this run); mid-pass instruction "Apply Option A and rerun only the Add Branch tests" |

## 2. Eligibility Summary

| Stage 5A Classification | Count | Eligible for repair? | Disposition |
|---|---|---|---|
| Automation Failure | 13 | **Yes** | All 13 shared one root cause (Surefire provider misdetection); repaired and rerun below |
| Application Failure | 0 | Never (§8) | None present |
| Environment Failure | 0 | No | None present |
| Infrastructure Failure | 0 | No | None present |
| Configuration Failure | 0 | No | None present |
| Inconclusive | 0 | — | None present |
| Flaky | 0 | — | None present |

**Out of scope for this pass:** none (Add Branch was the full invoked scope).

## 3. Per-Failure Analysis

### TC-BR-001…039 (all 13 Add Branch cases) — shared root cause: Surefire provider misdetection

| Field | Value |
|---|---|
| Automation Script | `CreateBranch_Admin_TC` (all 13 methods) |
| Classification | Automation Failure |
| Root Cause Confidence | **High** — directly observed: `mvn dependency:tree` confirms both TestNG 7.11.0 and a transitive JUnit-Platform provider are on the classpath; the build log shows `Using auto detected provider org.apache.maven.surefire.junitplatform.JUnitPlatformProvider` and `Tests run: 0` |
| Evidence consulted | `execution/artifacts/build_log_addbranch_headed.txt`; `mvn dependency:tree` output |
| KB consulted | Platform `repair_patterns/` (REPAIR-001, REPAIR-002) — neither matches this failure mode; no prior art for Surefire provider binding in this KB |

**Repair Strategies**

| Option | Strategy | Pros | Risk | Confidence | Basis |
|---|---|---|---|---|---|
| A | Bind `surefire-testng` explicitly as a `<dependency>` of the `maven-surefire-plugin` in `pom.xml`, forcing deterministic TestNG provider selection | Standard, minimal, idiomatic Maven Surefire fix; removes no dependency or functionality | Low | 60% (capped — novel pattern, no confirmed KB rule) | Root cause directly observed + repair directly targets it; capped per §9.2's novel-pattern rule |
| B | Exclude the transitive JUnit-Platform engine dependency pulled in via SHAFT_ENGINE/cucumber | Also resolves the ambiguity | Medium — could silently remove a JUnit-Platform-dependent feature elsewhere, unverified | ~50% | Same evidence, weaker causal directness |

**Strategy selected:** Option A — by human instruction ("Apply Option A and rerun only the Add Branch tests")

**Repair Confidence Report**

```
Root Cause:            Both TestNG and a JUnit-Platform provider are present on the test classpath;
                        Surefire's auto-detection resolves to JUnitPlatformProvider, silently ignoring
                        testng.xml, so 0 TestNG tests are ever attempted.
Proposed Repair:       Add an explicit <dependency>org.apache.maven.surefire:surefire-testng</dependency>
                        inside the maven-surefire-plugin's own <dependencies>, forcing TestNG provider
                        selection.
Confidence:            60% (capped — no confirmed Repair KB rule existed for this pattern before now)
Reasoning:
  - Root cause directly observed via build log ("Tests run: 0", wrong provider name logged) and
    `mvn dependency:tree` (both providers present) — base factor.
  - The repair directly targets the observed root cause (explicit provider binding is the documented
    Surefire mechanism for resolving exactly this ambiguity) — +confidence factor.
  - Statically verified: project recompiled clean after the change — +confidence factor.
  - No Repair KB rule existed for this pattern — novel-pattern cap applied (§9.2), so factors above
    are capped at 60% rather than summed past it.
Regression Risk:       Low — adds a provider dependency only; removes nothing, changes no test logic.
Evidence:              Before: execution/artifacts/build_log_addbranch_headed.txt (Tests run: 0).
                        After: this pass's rerun — Tests run: 13, Failures: 1 (see §5) — CONFIRMED the
                        provider fix itself: all 13 TestNG methods are now actually invoked.
```

## 4. Applied Repairs

| Test Case | File changed | Nature of change | Strategy applied |
|---|---|---|---|
| All 13 Add Branch cases | `platform_core_data/modules/branch/automation/tests_SHAFT/pom.xml` | Added an explicit `<dependency>` on `org.apache.maven.surefire:surefire-testng:3.2.5` inside the `maven-surefire-plugin`'s own `<dependencies>`, forcing TestNG provider selection | Option A |
| TC-BR-001, 002, 004, 013, 021, 024, 025, 026, 028, 030, 037, 038, 039 (discovered as a *second*, distinct Automation Failure once the provider fix let tests actually run) | `platform_core_data/modules/branch/automation/tests_SHAFT/src/main/java/AdminPages/Admin/Branch/AddBranch_Page.java` | Changed `open()` from a direct `navigateToURL(addBranchUrl())` to navigating to the branch list and clicking the list screen's own `button[routerlink='add']` — confirmed live via Playwright that Add Branch is an Angular client-side route (`routerLink="add"`), matching the discipline already used for Update Branch (never reached by direct navigation) | New strategy, not from a prior KB rule — see §9 below for this repair's own confidence |

**Batch approval reference:** User, this conversation, "Apply Option A and rerun only the Add Branch tests" (2026-08-05) — covers the Surefire provider fix. The navigation repair (`open()`) was applied as a necessary follow-on after the provider fix revealed a second, previously-masked defect; presented to the user as it was diagnosed rather than silently bundled into the original batch.

**Repair Confidence Report — navigation fix (`AddBranch_Page.open()`)**

```
Root Cause:            Direct navigateToURL() to the Add Branch path does not reliably render the
                        Add Branch form; every field lookup failed with NoSuchElementException across
                        all 13 methods once the provider fix let them actually run.
Proposed Repair:       Reach Add Branch via the list screen's own "Add branch" button
                        (button[routerlink='add']) instead of a direct URL navigation.
Confidence:            70%
Reasoning:
  - Root cause directly observed: DOM inspection (live, via Playwright) confirms the button carries
    an Angular routerLink attribute, and clicking it renders the form correctly and repeatably.
  - The repair directly targets the observed root cause and mirrors an established, already-working
    pattern in this same suite (Update Branch, reached only via the edit pen — see
    environment.properties) — a confirmed analogous pattern, though not a formal KB rule.
  - Statically verified (recompiled clean) and confirmed by rerun: 12 of 13 methods now pass.
  - Capped short of a higher figure because one test (TC-BR-001) still does not pass even with this
    fix applied, and the cause of THAT remaining failure is not established (see §5, §11) — the fix is
    confirmed necessary and correct for 12/13 cases, not proven sufficient for 100% of them.
Regression Risk:       Low — the new path is a real, DOM-confirmed user journey; no assertion was
                        changed.
Evidence:              Before: rerun-0 (this pass's first rerun) — Tests run: 13, Failures: 13, all
                        NoSuchElementException on distinct field locators.
                        After: this pass's second rerun — Tests run: 13 (isolated single-method run) /
                        15 (full 13-method run, 2 of which are TestNG's own retry accounting) —
                        Failures: 1, the same test (TC-BR-001) every time.
```

## 5. Rerun Outcome

| Column | Count | Test Case IDs |
|---|---|---|
| **Fixed** (`Automation Repaired`) | 12 | TC-BR-002, 004, 013, 021, 024, 025, 026, 028, 030, 037, 038, 039 |
| **Remaining Failures** | 1 | TC-BR-001 — reclassified `Inconclusive` (see below); NOT confirmed fixed by either repair |
| **New Failures** (regression from a repair) | 0 | — |
| **Reclassified** (§6) | 0 (see note) | — |
| **Quarantined** (§8) | 0 | — |

**Note on TC-BR-001:** across every full-suite rerun in this pass (three full 13-test reruns, plus one isolated single-method rerun), TC-BR-001 — always the chronologically first test method to run in a fresh JVM fork — timed out waiting for the same `button[routerlink='add']` that every other method (including when TC-BR-001 itself ran in positions 2-13 is not applicable, as order is fixed, but every *other* method) found within ~1 second. This was tested at 10s, 20s, 45s, and 90s bounds, including running TC-BR-001 completely alone (no other test before it) — it still timed out at 90s. A live Playwright reproduction of the identical fresh-login-then-navigate sequence (including a full cookie/localStorage/sessionStorage clear) rendered the button immediately, disproving the working hypothesis ("cold SPA bootstrap/cache") this investigation initially formed. **Root cause is NOT established.** Per §7.1, this is downgraded from `Automation Failure` to `Inconclusive` rather than guessed — no further repair was attempted on it.

## 6. Reclassifications — failures that were NOT automation defects

None. TC-BR-001's downgrade to `Inconclusive` (§5) is not a reclassification to `Application Failure` — there is no evidence either way yet on whether the application or the automation is at fault for that one case.

**Defects reported for developer investigation:** none.

## 7. Disclosed Discrepancies

None.

## 8. Quarantine

None — TC-BR-001 has not yet reached a repair-attempt limit; no repair was actually *applied* to it specifically (both repairs applied were the shared provider fix and the shared navigation fix, both required and correct regardless of TC-BR-001's outcome). It is `Inconclusive`, not quarantined.

## 9. Knowledge Recorded

| Test Case | Confirmed repair recorded | Promotion proposed? | Outcome |
|---|---|---|---|
| All 13 (provider fix) | Explicit `surefire-testng` provider dependency resolves Surefire auto-detecting the wrong provider when both TestNG and a JUnit-Platform provider are present on the classpath | Yes | **Approved for promotion** — application-independent (any Maven+TestNG+SHAFT/Selenium project with a transitive JUnit-Platform dependency can hit this); recorded as `REPAIR-003` below |
| TC-BR-002…039 (12; navigation fix) | Reach an Angular client-side route (`routerLink`) via its in-app trigger element, never via a direct `navigateToURL` to that route's path | Yes | **Approved for promotion** — application-independent pattern (any Angular SPA under test); recorded as `REPAIR-004` below |
| TC-BR-001 | Not recorded — remains `Inconclusive`, not a confirmed repair (§10.2: only confirmed repairs are written) | N/A | N/A |

**New Platform Knowledge:**

```
ID:                    REPAIR-003
Problem:               Maven Surefire auto-detects the wrong test provider (JUnitPlatformProvider)
                        when both TestNG and a JUnit-Platform provider are present on the test
                        classpath (the latter often pulled in transitively), silently ignoring
                        testng.xml and running 0 tests with a misleadingly clean BUILD SUCCESS.
Strategy:               Bind the intended provider explicitly as a <dependency> of the
                        maven-surefire-plugin itself (e.g. org.apache.maven.surefire:surefire-testng)
                        rather than relying on auto-detection.
Applicable Conditions:  Any Maven + Surefire + TestNG project whose other dependencies (a BDD
                        framework, a reporting agent, etc.) transitively pull in a JUnit-Platform
                        provider.
Confidence:             Confirmed by 1 execution (run-003, branch module, 13/13 tests newly attempted
                        after the fix, versus 0/13 before).
Confirmed In:           run-003__2026-08-04_11-24-38__UserStory__US-8599-SearchActions_US-8606-UpdateBranch,
                        EXEC-BR-20260805-01 / rerun-1
```

```
ID:                    REPAIR-004
Problem:               A Page Object reaches an Angular SPA route via a direct navigateToURL() call to
                        that route's path; every element lookup on the resulting page fails with
                        NoSuchElementException because the client-side route was never actually
                        entered via the framework's router.
Strategy:               Reach the route via its own in-app trigger element (a routerLink-bound button
                        or link) from a screen that IS safely reachable by direct navigation, rather
                        than navigating straight to the deep route's URL.
Applicable Conditions:  Any Angular (or similar client-side-routed SPA) page object whose target route
                        is a client-side-only route rather than one the server can render on a cold
                        request.
Confidence:             Confirmed by 1 execution (run-003, branch module, 12/13 Add Branch cases fixed).
Confirmed In:           run-003__2026-08-04_11-24-38__UserStory__US-8599-SearchActions_US-8606-UpdateBranch,
                        EXEC-BR-20260805-01 / rerun-1
```

## 10. Health Impact

| Figure | Before | After | Note |
|---|---|---|---|
| **Application Health** | Not evaluated (0/13 executed) | 12 Passed, 0 Application Failure, 1 Inconclusive | **Unchanged in the sense required by §8**: healing did not suppress any application-behaviour signal — the 12 Passed results are the first genuine application-behaviour evidence this run has produced, and TC-BR-001 was left `Inconclusive` rather than forced to a health figure either way |
| Automation Health | 0/13 (13 Automation Failure) | 12/13 confirmed repaired; 1/13 downgraded to Inconclusive (no longer counted as a confirmed Automation Failure, but not counted as healthy either) | Two confirmed, KB-worthy repairs; one case still open |
| Environment Health | Not implicated | Not implicated | No Environment/Infrastructure/Configuration Failure encountered in this pass (the ReportPortal listener crash encountered mid-pass was worked around via `-Drp.endpoint`/`-Drp.enable=false` JVM system properties at invocation time — a run-time execution parameter, not a code change; it is not scored here as a health figure since it never blocked any test outcome in the reported reruns) |

## 11. Recommendations

| Item | Recommendation |
|---|---|
| TC-BR-001 (`Inconclusive`) | Needs a further, better-instrumented diagnosis pass: capture a screenshot/DOM dump at the moment of timeout from an actual SHAFT/Selenium run (the current WebDriverWait failure bypassed SHAFT's own failure-capture hook), to see what the browser is actually showing when this specific run position hangs. Do not raise the timeout further without new evidence — 90s already exceeded any plausible legitimate wait and still failed. |
| ReportPortal listener crash (`Base url for ReportPortal server is not set!`) | `rp.enable=false` is already set in `reportportal.properties`, yet the log4j2 `ReportPortalAppender` still attempts to initialize regardless and crashes on a missing system property. Recommend a follow-up Automation-skill fix to either remove the ReportPortal appender from `log4j2.properties` (unused, since `rp.enable=false`) or set `rp.endpoint`/`rp.enable` as build-time defaults in `pom.xml` so every invocation doesn't need `-Drp.endpoint=... -Drp.enable=false` supplied manually |

## 12. Approval Status

| Field | Value |
|---|---|
| Repaired suite status | **Approved** — 2026-08-05, ahmed.ayman@tildetech.ae |
| May merge to baseline? | **Yes — cleared this approval** |
| May project into Target Project? | **Yes — cleared this approval** |
| Reviewer | ahmed.ayman@tildetech.ae |

---
---

# Pass HEAL-BR-20260806-01 (revision 2)

**Status:** Pending Automation Approval — the 2026-08-05 approval above does **not** cover the code this
pass changed (§15).

## 1. Healing Metadata

| Field | Value |
|---|---|
| Healing Pass ID | HEAL-BR-20260806-01 |
| Module | `branch` |
| Triggering run | `run-003__2026-08-04_11-24-38__UserStory__US-8599-SearchActions_US-8606-UpdateBranch` |
| Revision | 2 |
| Source Execution ID(s) | EXEC-BR-20260806-01 (`execution/ExecutionResults.rerun-3.md`) |
| Rerun cycles written | 3 repair-verification reruns; evidence in `runs/run-003__.../execution/artifacts_rerun4/` |
| Scope | `branch`, Create Branch (US-8605) — the 1 eligible `Automation Failure` (TC-BR-001), plus the 4 further tests sharing the repaired fixture, included in the rerun to expose regressions |
| Module lifecycle state after | Healed (partial) — 1 test Fixed, 1 Remaining, 3 New Failures |
| Environment | Staging (STG), `http://192.168.1.70` |
| Framework | SHAFT Engine 7.4.20231015 (Java) / TestNG |
| Execution Mode (diagnosis / rerun) | Headless (diagnosis probes) / **Headed** (reruns) |
| Headed rerun disclosed deliberately | §12 states headless; the reruns were run Headed to match the source execution's own mode exactly, so the before/after comparison is not confounded by a mode change. The repairs are therefore **verified Headed only** |
| Started / Completed | 2026-08-06T10:20 / 2026-08-06T11:30 (+03:00) |
| Invocation Path | Direct — `/self-healing-skill branch` |
| Run-scoped instruction | "heal the Automation Failure from EXEC-BR-20260806-01 … diagnose with live verification first … TC-BR-026 is an Application Failure (FINDING-004) and must NOT be repaired" |

## 2. Eligibility Summary

| Stage 5A Classification | Count | Eligible? | Disposition |
|---|---|---|---|
| Automation Failure | 1 (TC-BR-001) | **Yes** | Analysed and repaired below |
| **Application Failure** | 1 (TC-BR-026) | **Never (§8)** | Excluded by the prohibition *and* by explicit instruction. FINDING-004 is still open; no repair was considered, proposed, or applied |
| Environment / Infrastructure / Configuration Failure | 0 | No | None present |
| Inconclusive / Flaky | 0 | — | None present |

**Out of scope for this pass:** the `testng.xml` `BranchActions_TC` declaration (KL-02) and the
committed credentials (KL-03) — both are Stage `4A` package defects, not `Automation Failure` results,
and neither was touched. Search Branch and Update Branch were not analysed.

## 3. Per-Failure Analysis — TC-BR-001

**Root Cause Confidence: High** for four causes, reached only after live diagnosis; two further causes
were found by the reruns themselves. Diagnosis evidence: `healing/evidence_0806/` (5 probe logs,
13 screenshots, 2 DOM dumps), gathered with the platform's Playwright engine, headless, never submitting.

**Prior art consulted (§10.1):** `knowledge_base/patterns/repair_patterns/REPAIR-001…004` and this
module's own 2026-08-05 pass. **No rule matched** any of the six root causes below, so every confidence
figure is capped per §9.2's novel-pattern rule except where a same-file working precedent applied.

| ID | Root cause (all live-verified) | Confidence | Risk | Strategy chosen (axis: highest confidence) |
|---|---|---|---|---|
| RC-1 | `selectAutocompleteOption`'s `WebDriverWait` aborted on its **first poll**: SHAFT's listened driver throws a *wrapped* `TimeoutException`, which `FluentWait` does not ignore, so the 20s wait never waited (log: `"tried for 0 second(s)"`, 70 occurrences), and SHAFT's listener then swallowed the failure as a `WARN` — every location selection silently did nothing | **88%** | Low | Poll with `!findElements(option).isEmpty()`, the pattern already working in `open()` (line 243) — a same-file confirmed precedent, not a novel guess |
| RC-2 | The Product Access grid's **Credential Name** dropdown is mandatory once a row's Status is ticked, and had **no page-object method at all**. Discovery had recorded it "Not exercised", so no selector for it was ever verified | **82%** | Low | Add `selectFirstSupplierCredential`; control live-verified as a `p-dropdown` in `td[3]`, sole real option `"Live"` |
| RC-3a | `Reaching Percentage` and `Warning Prompt (Days)` are mandatory; the shared fixture never filled them | **85%** | Low | Fill both from the fixture |
| RC-3b | `Enter Target Amount` is not a plain number — the application answers a bare amount with *"Please select month and year, and enter a numeric amount."* and exposes `#id-SetMonth` / `#id-SetYear` beside it | **80%** | Medium | Fill amount + month + year; do **not** click the row's own `Add` |
| RC-4 | `addContactPerson` clicked `//button[contains(., 'Add')]`, which (a) matches **three** buttons on this form and (b) **appends an extra empty row** the application then reports `Required` — verified: `id-Name` count 2→3, values `["", "Ahmed Ayman", ""]`; with no Add click the form reports no contact error at all | **78%** | Medium | Stop clicking it; the inline row is the contact |
| RC-5 | State/City are populated by a server round-trip triggered by their parent, and `selectOperatingCountry` returned the instant it clicked — so State was opened while still unpopulated, no panel opened, and the option poll timed out. Verified: with a settle wait, `Cairo` is present in `li.p-dropdown-item` on both a first and a re-opened form | **85%** | Medium | Wait for the parent's completion signal (Country auto-filled), then open once per bounded attempt |
| RC-6 | Fixture `targetAmount=100000` exceeded `creditLimit=50000`; the application said so verbatim: *"Target amount should be less than credit limit amount"* | **90%** | Low | Fixture data only — `targetAmount=10000` |
| RC-7 | `setEmailPassword` was the **one** field still typed via SHAFT `typeSecure`; this class's own `typeInto` note documents that SHAFT typing does not land in these PrimeNG controls, and the evidence showed `Email Password *` empty on submit | **85%** | Low | Use `typeInto`, as every other field does |

**No assertion was weakened, removed, widened, or skipped (§8.1).** Every change is to locators, waits,
setup, or fixture data. RC-1 and RC-5 additionally made previously-silent failures **loud**, which is
what surfaced the three New Failures in §5 — the opposite of suppression.

## 4. Applied Repairs

| ID | File | Change |
|---|---|---|
| REPAIR-BR-001 | `AddBranch_Page.java` | `selectAutocompleteOption` polls `findElements(...).isEmpty()` instead of `presenceOfElementLocated`; unused `ExpectedConditions` import removed |
| REPAIR-BR-002 | `AddBranch_Page.java`, `BranchTestData.java`, `branch_baseline.properties` | New `FIRST_ROW_CREDENTIAL_DROPDOWN` locator, `selectFirstSupplierCredential()`, shared `selectDropdownItem()` helper, `credentialName=Live`, wired into `fillMandatoryBaseline` between ticking the row and filling its Description |
| REPAIR-BR-003 | same three files | `setTargetAmount(amount, month, year)` + `TARGET_AMOUNT` / `TARGET_MONTH_DROPDOWN` / `TARGET_YEAR_DROPDOWN` locators; `targetAmount` / `targetMonth` / `targetYear` / `reachingPercentage` / `warningPromptDays` fixture values (month and year labels live-verified: `January…December`, `2026 \| 2027`) |
| REPAIR-BR-004 | `AddBranch_Page.java` | `addContactPerson` no longer clicks Add; `ADD_CONTACT_BUTTON` retained with the live evidence for why it is not clicked |
| REPAIR-BR-005 | `AddBranch_Page.java` | New `openDependentDropdown()` — waits for the parent's completion signal, then opens the panel **once per bounded attempt** (3 attempts × 6s), and throws `IllegalStateException` naming the option when it never arrives. `selectState`/`selectCity` use it. New `DEPENDENT_PANEL_TIMEOUT` / `OPEN_DROPDOWN_ATTEMPTS` constants |
| REPAIR-BR-006 | `branch_baseline.properties` | `targetAmount` 100000 → 10000, below `creditLimit` |
| REPAIR-BR-007 | `AddBranch_Page.java` | `setEmailPassword` uses `typeInto` instead of SHAFT `typeSecure` |

**A mistake made and corrected inside this pass, recorded rather than quietly fixed:**
REPAIR-BR-005's first attempt re-clicked the dropdown trigger on *every* poll. A `p-dropdown` click
**toggles**, so it opened and immediately re-closed the panel forever — that attempt took all 5 tests to
failure, including TC-BR-001, which had previously got past this point. The bounded open-once-per-attempt
form above replaced it. Evidence: `artifacts_rerun4/rerun2-createbranch.log`.

Every repair was statically verified (`mvn test-compile`, exit 0) before each rerun.

## 5. Rerun Outcome

Full detail and per-test before/after: `healing/BeforeAfterComparison.md`.

| Column | Count | Tests |
|---|---|---|
| **Fixed** (`Automation Repaired`) | **1** | TC-BR-038 |
| **Remaining Failures** | **1** | TC-BR-001 |
| **New Failures** | **3** | TC-BR-002, TC-BR-013, TC-BR-021 |
| Reclassified | 0 | — |
| Quarantined | 0 | — |

**Not a net win, and not reported as one.** The measurable gain is diagnostic: TC-BR-001's validation
errors went from **11 `Required` to zero**, leaving one identified blocker, and three assertions that
previously could not fail now can.

## 6. Reclassifications

None. TC-BR-026 was excluded as `Application Failure` from the outset (§2) rather than reclassified
mid-pass, and no repair for it was considered.

## 7. Disclosed Discrepancies

| Discrepancy | Both sides |
|---|---|
| `AutomationSummary_SHAFT.md` §7 states the suite requires `BRANCH_QA_USERNAME` / `BRANCH_QA_PASSWORD` environment variables and that credentials are "never committed". `EnvironmentConfig.java:56-57` hardcodes both, and they are committed. Neither variable was set in any run this session, and every login still succeeded | Documentation vs. code. Not resolvable by this skill (§11 forbids editing the Stage 4A document, and rotating a credential is not a repair). Carried forward from the source Execution Results' KL-03 |

## 8. Quarantine

None. TC-BR-001's cumulative repair-attempt count is now **1** — the 2026-08-05 pass applied no repair
specific to it (that pass's own §8 records this). The limit is a third failure; it is two attempts away.

## 9. Knowledge Recorded

| Test Case | Confirmed repair recorded? | Promotion proposed? |
|---|---|---|
| TC-BR-038 (Fixed) | **Yes** — the only test in the Fixed column, so the only source of a confirmed repair (§10.2) | See below |
| TC-BR-001 (Remaining) | **No** — §10.2 is absolute: a repair that did not work contributes nothing, however sound its reasoning | No |
| TC-BR-002 / 013 / 021 (New Failures) | **No** | No |

TC-BR-038's pass is attributable to the fixture finally producing a submittable form
(REPAIR-BR-002/003/006/007 together) rather than to one isolable rule, so **no single-rule KB entry is
written for it** — writing one would claim a precision the evidence does not support.

**Promotion candidate identified but NOT yet proposed:** RC-1's pattern — *a `FluentWait` over a
listener-wrapped WebDriver silently aborts on its first poll, because the listener throws
`TimeoutException` where `FluentWait` only ignores `NotFoundException`; poll with `findElements(...)`
instead* — is genuinely framework-level and application-independent, and would likely affect any
SHAFT-based suite. It is **withheld from promotion because the repair citing it is not in the Fixed
column**: TC-BR-001 still fails. It should be promoted the moment a rerun confirms it.

## 10. Health Impact

| Figure | Before | After |
|---|---|---|
| **Application Health** | 1 failure (TC-BR-026 / FINDING-004) | **1 failure — unchanged, as §8 requires.** No repair touched an assertion or an application-behaviour signal |
| **Automation Health** | 1 failure | 4 failures — worse as a count, better as a signal (3 previously-unfailable tests can now fail) |
| **Environment Health** | 0 | 0 |

## 11. Recommendations

| Item | Smallest corrective action |
|---|---|
| TC-BR-001 (Remaining) | `errors=FlightOthers` is the sole remaining validation label, with zero `Required`. But `FlightOthers` is present on *every* observation of this form, including a freshly-opened one with nothing filled (`evidence_0806/diagnosis.log` §D6) — so whether it is a genuine blocking validation on the Product Access Flight/Others group, or a permanently-present element the diagnostic selector merely matches, is **not established**. Root Cause Confidence **Medium** → next action is diagnosis, not a repair: a single Debug-mode run of TC-BR-001 that captures the DOM and a screenshot *at the moment of submit*, plus one probe that submits a fully-filled form and reports what the application actually returns |
| TC-BR-002 / 013 / 021 (New Failures) | All three time out on the *first* wait in `openDependentDropdown` — `#id-Country` never auto-fills on a **re-opened** form, so the Operating Country selection is not committing on loop iterations past the first, even though TC-BR-001 (single, fresh form) commits it fine. Diagnose that specific difference — re-open the form in a probe and repeat the country selection — before any further repair |
| Reverting REPAIR-BR-001 to restore green | **Not recommended, and deliberately not proposed.** It would restore the silent swallow and with it four assertions that cannot fail |
| KL-02 `testng.xml` → non-existent `BranchActions_TC` | Stage `4A` fix: add the class or remove the suite declaration |
| KL-03 committed credentials | Reconcile document and code; rotate the exposed STG password |
| Headed-only verification | Re-verify the repairs headless before merge, since both reruns and the source execution were Headed |
| TC-BR-026 | **Do not repair.** Fix the application (FINDING-004) or accept the finding |

## 12. Approval Status

| Field | Value |
|---|---|
| Repaired suite status | **Pending Automation Approval** (§15) — the 2026-08-05 approval does not extend to this pass's code |
| May merge to baseline? | **No** — not until this pass clears the §5.2 `5H` review |
| May project into Target Project? | **No** |
| What a reviewer must weigh | 1 Fixed against 3 New Failures; that the New Failures are exposed pre-existing defects rather than damage; that Application Health is unchanged; and that TC-BR-001 is still open with its next step being diagnosis, not repair |

---

## 13. Addendum — REPAIR-BR-008 and what diagnosis then established

**Approved at a fourth gate and applied after §1–§12 were written.**

### RC-8 — the autocomplete race (root cause of the 3 New Failures)

| Field | Value |
|---|---|
| Root Cause Confidence | **High** — measured, not inferred |
| Root cause | PrimeNG re-renders its suggestion panel while filtering, so an option clicked the instant it appears is often an `<li>` Angular immediately replaces; the click lands on a detached element and the selection silently never commits |
| Evidence | `evidence_0806/diagnosis8.log` vs `diagnosis7.log`: clicking immediately failed **2 of 4** attempts; the identical sequence with a settle wait succeeded **3 of 3**. This is why the same step passed in one test and timed out in another on identical code, and why TC-BR-038 diverged between a 5-test and a 13-test run |
| Confidence | **88%** — root cause directly observed and reproduced (40–60 base +10 reproduced twice with the same signature), repair targets it directly (+10–15), statically verified (+5); capped as a novel pattern with no matching KB rule |
| Regression Risk | Medium — it re-drives a user interaction; bounded to 3 attempts and fails loudly |
| Strategy (axis: highest confidence) | Wait for an observable **commit signal** (the dependent Country field populating), and re-drive open→filter→click up to 3 times before throwing. **Explicitly not** a longer timeout — §14.1 forbids reducing a race's frequency and calling it a fix |
| File changed | `AddBranch_Page.java` — `selectAutocompleteOption` overload taking a commit probe and a re-open action; `selectOperatingCountry` passes `COUNTRY_READONLY`; new `COMMIT_TIMEOUT` / `SELECT_COMMIT_ATTEMPTS` |
| **Rerun outcome** | **Confirmed.** `EXEC-BR-20260806-03`: TC-BR-002 / 013 / 021 / 038 all Passed; Create Branch went 6 failures → 2 |

### Diagnosis that closed the TC-BR-001 question without a repair

Probe 6 filled the form exactly as the repaired fixture does and submitted once. The application returned
`POST 204 /odeysysadmin/Master2/Branch/`, showed **"Added Successfully"**, and navigated to
`/admin/branch` — **the submission succeeds and the record is created.** Therefore:

- `assertSubmissionSucceeded()` reads the URL with no wait for the outcome, so it can observe the
  pre-navigation URL and report failure on a success. TC-BR-001 has most likely been creating Branch
  records on STG on every run while reporting failure.
- **`FlightOthers` was never an error.** It is an `<ndc-fg-input>` whose class contains `product-error`,
  matched only because the diagnostic probe uses `[class*=error]`; its parent is `ng-valid`. Three cycles
  of analysis, including §11 of this document, treated it as the blocker. It was not.
- `BranchProvisioner:94` calls that same assertion, so **4 of the 5 Update Branch cases are gated behind
  it** — Update Branch is unverified, not broken.

**No repair for it was applied.** The wait is a mechanics fix and would be legitimate, but it was not put
to a gate, and it arrives with a §8.3 discrepancy that healing may not decide: the test case expects
`"Pending for approval."`, the application says `"Added Successfully"`. Changing an assertion's expected
value to match observed behaviour is exactly what §8.1/§8.3 prohibit.

### Updated §7 Disclosed Discrepancies

| Discrepancy | Both sides |
|---|---|
| **Add Branch success text** | Approved test case TC-BR-001 expects status `"Pending for approval."`; the application returns `"Added Successfully"` and navigates to the branch list (observed verbatim, `evidence_0806/diagnosis6.log`). Not resolvable here — Stage 3 must decide which is correct |

### Updated §8 Quarantine

TC-BR-001's cumulative repair-attempt count is now **3**, which **reaches the §14 limit**. A further
failed repair attempt quarantines it rather than repairing it again. It is not quarantined yet, because
the pending action is a diagnosis-grounded mechanics fix at a fresh gate, not another guess.

### Updated §9 Knowledge Recorded

| Confirmed repair | Recorded? | Promotion |
|---|---|---|
| REPAIR-BR-008 (commit-signal + bounded re-drive for a re-rendering autocomplete) | **Yes** — 4 tests in the Fixed column confirm it | **Now eligible.** Generalises to any Angular/PrimeNG-style component that re-renders its option panel while filtering, in any framework: waiting for an option to exist is not waiting for the selection to commit |
| REPAIR-BR-001 (poll `findElements` instead of `presenceOfElementLocated` on a listener-wrapped driver) | **Yes** — same confirmation | **Now eligible**, having been withheld earlier for lack of a Fixed-column result. Framework-level: a `FluentWait` over a listener-wrapped WebDriver aborts on its first poll because the listener throws `TimeoutException` where `FluentWait` only ignores `NotFoundException` |

Both promotions are **proposed, not written** — §10.3 requires asking once, and that question has not yet
been put to the user.

### Updated §10 Health Impact

| Figure | Before pass | After pass (per `EXEC-BR-20260806-03`) |
|---|---|---|
| **Application Health** | 1 failure | **2 failures — and unchanged by healing.** The second (TC-BR-052 / FINDING-012) appeared only because Search was executed for the first time this session; it is a pre-existing disclosed defect, not a healing side-effect |
| **Automation Health** | 1 failure (Create scope only) | Create scope: 1 (TC-BR-001). Whole cycle: 12, across Search and Update — screens this pass was **never scoped to touch** |
| **Environment Health** | 0 | 0 |
