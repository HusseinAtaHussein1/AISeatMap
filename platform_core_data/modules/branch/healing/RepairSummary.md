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

---

# Pass HEAL-BR-20260809-01

## 1. Healing Metadata

| Field | Value |
|---|---|
| Healing Pass ID | `HEAL-BR-20260809-01` |
| Module | `branch` |
| Triggering run | `run-003__2026-08-04_11-24-38__UserStory__US-8599-SearchActions_US-8606-UpdateBranch` |
| Source Execution ID | `EXEC-BR-20260806-03` (`rerun-5`) |
| Rerun cycles written | `execution/ExecutionResults.rerun-6.md` (Headless), `.rerun-7.md` (Headed) |
| Scope | Every `Automation Failure` in `rerun-5` (unscoped invocation): TC-BR-001, 043, 046, 054, 055, 060, 061, 065, 066, 067, 068, 069 |
| Environment | Staging (STG), shared internal/LAN, `http://192.168.1.70` |
| Framework | SHAFT Engine 7.4.20231015 / TestNG |
| Invocation Path | Direct |
| Run-scoped instruction | User, verbatim: "Restore `platform_core/knowledge/patterns/` from HEAD before proceeding... apply Option A for Clusters A, B, and C, perform diagnosis only for Cluster D, rerun only the 12 affected tests. Do not repair TC-BR-065 without an evidence-backed root cause... Report the before/after result per test, the repair applied, and whether TC-BR-001 must be quarantined." |

## 2. Eligibility Summary

| Stage 5A Classification | Count | Eligible? | Disposition |
|---|---|---|---|
| Automation Failure | 12 | Yes | Analysed below, 4 clusters |
| Application Failure | 2 (TC-BR-026, TC-BR-052) | Never | Out of scope, unchanged, never healed |
| Not Executed | 3 (`BranchActions_TC`, KL-01) | No | Out of scope — a Stage 4A fix (missing class), not a repair |

## 3. Per-Failure Analysis

### Cluster A — TC-BR-001, 066, 067, 068, 069 — missing post-submit wait

| Field | Value |
|---|---|
| Root Cause Confidence | High |
| Evidence consulted | `AddBranch_Page.java:712-731` read directly: `assertSubmissionSucceeded()` asserted `navigatedAway \|\| pendingApprovalShown`, both read immediately after `clickSubmit()`, no wait. `healing/evidence_0806/diagnosis6.log` confirms the app does navigate away, asynchronously |
| KB consulted | `REPAIR-001` ("Bounded poll for post-submit redirect state, not an immediate assertion") — confirmed 1 execution/1 project, and the same idiom is already used elsewhere in this file (`clickSearch()`, `waitForPageContentToChange()`) |
| Strategy selected | Option A — bounded `WebDriverWait` (10s) polling the same `navigatedAway \|\| pendingApprovalShown` condition, no expected value changed |
| Confidence | 90% (directly observed +50, targets cause +15, reproduced across 5 tests +10, matches KB rule REPAIR-001 +15) |

### Cluster B — TC-BR-043, 054, 055, 060, 061 — `StaleElementReference` in the Search grid

| Field | Value |
|---|---|
| Root Cause Confidence | High |
| Evidence consulted | Traced directly in code: `Branch_Common.textOf/valueOfInput/visibleTextsOf/hasClass` and `SearchBranch_Page.branchCodesOnCurrentPage/columnHeaders/actionsAvailableFor/actionsAvailableInRow/highestOfferedPageNumber` all call `findElements()` then perform nested reads with no re-render guard |
| KB consulted | No confirmed KB rule matched this exact pattern — novel to this project |
| Strategy selected | Option A — bounded retry-on-`StaleElementReferenceException` (`Branch_Common.withStaleRetry`, 3 attempts), applied to all listed read paths |
| Confidence | 60% (capped — novel pattern, no prior confirmation anywhere, per §9.2) |

### Cluster C — TC-BR-046 — country-filter option click

| Field | Value |
|---|---|
| Root Cause Confidence | **Revised to Medium after code inspection** — originally assessed High on the assumption this is the same PrimeNG autocomplete race `REPAIR-BR-008` fixed. Reading `SearchBranch_Page.java:85-86` shows `COUNTRY_DROPDOWN_ANCESTOR` is a plain `p-dropdown` (static option list), not the filtering `p-autocomplete` REPAIR-BR-008 addressed. **Citing that rule here was an unverified assumption of identical mechanism, corrected in-line in the code comment** |
| Strategy applied | Option A — bounded reopen+click retry (3 attempts) |
| Confidence (pre-rerun) | 80% (based on the now-corrected assumption) — **not achieved; see §5** |

### Cluster D — TC-BR-065 — Update screen 30s timeout

| Field | Value |
|---|---|
| Root Cause Confidence | Low |
| Action | Diagnosis only, no repair — per explicit user instruction not to repair without an evidence-backed root cause |
| Outcome | Both rerun cycles show TC-BR-065 failing on a **different, upstream** cause (0-rows search precondition) before ever reaching the original 30s-timeout code path. The original TC-BR-065 symptom was not reproduced in either cycle, so no new evidence toward its root cause was gathered this pass |

## 4. Applied Repairs

| Test Case(s) | File changed | Nature of change | Strategy |
|---|---|---|---|
| TC-BR-001, 066, 067, 068, 069 | `AddBranch_Page.java` (`assertSubmissionSucceeded`) | Replaced an immediate read with a 10s bounded `WebDriverWait` polling the same condition; no assertion value changed | Cluster A, Option A |
| TC-BR-043, 054, 055, 060, 061 | `Branch_Common.java` (new `withStaleRetry` helper; `textOf`, `valueOfInput`, `visibleTextsOf`, `hasClass`), `SearchBranch_Page.java` (`branchCodesOnCurrentPage`, `columnHeaders`, `actionsAvailableFor`, `actionsAvailableInRow`, `highestOfferedPageNumber`) | Wrapped each read in a bounded (3-attempt) retry on `StaleElementReferenceException` | Cluster B, Option A |
| TC-BR-046 | `SearchBranch_Page.java` (`selectCountry`) | Added a bounded (3-attempt) reopen+click retry with a settle wait before the click, replacing an unguarded double-click with no wait | Cluster C, Option A |

**Batch approval reference:** user, this conversation, "Apply Option A for Clusters A, B, and C, perform diagnosis only for Cluster D" — covers exactly this batch, nothing more.

## 5. Rerun Outcome

Two targeted rerun cycles (`rerun-6` Headless, `rerun-7` Headed) of the same 12 tests, run back-to-back against the same live shared STG instance with no data reset between them.

| Column | Count | Test Case IDs |
|---|---|---|
| **Fixed** (`Automation Repaired`) | 1 | TC-BR-043 — passed cleanly in both cycles, no `StaleElementReference` in either |
| **Remaining Failures** | 6 | TC-BR-046 (repair applied, confirmed not working) plus TC-BR-054, 055, 060, 061, 065 (original `StaleElementReference`/timeout symptoms did not recur, but each fails on a **different, unrepaired automation defect** — see the corrected §6) |
| **New Failures** | 0 | None — no test that passed pre-repair regressed |
| **Flaky** | 1 | TC-BR-001 — passed Headless, failed Headed on an unrelated upstream cause |
| **Unverified — never reached the repaired code** | 4 | TC-BR-066, 067, 069 (consistently, both cycles) and TC-BR-068 (reached it only in `rerun-7`, then timed out on the new 10s wait) |
| **Quarantined** | 1 | TC-BR-001 — see §8 |

**This pass's honest yield is 1 confirmed fix out of 12.** TC-BR-054/055/060/061/065 no longer show the
pre-repair symptom (`StaleElementReference`) — that specific defect this pass targeted appears
addressed. But each now fails on a **different, still-unrepaired automation defect** in the
search/pagination logic itself (see the corrected §6) — an initial write-up of this section wrongly
called these "Environment Failure" (data gap) on the strength of each test's own assertion message,
without independently checking the live application. A human reviewer caught this; a live DOM check
retracted it. These 6 stay in Remaining Failures, not resolved, not blamed on the environment.

TC-BR-066/067/069 never reached `assertSubmissionSucceeded()` at all in either cycle — both failed 20 seconds into `AddBranch_Page.open()`, a step this pass's Cluster A repair does not touch. TC-BR-068 reached it only once (`rerun-7`) and then exhausted the new 10-second wait without either signal appearing. **None of the four Update-suite repairs this pass targeted were actually exercised against the code that changed**, in a majority of attempts.

## 6. Reclassifications — RETRACTED, see correction below

**This section originally reclassified TC-BR-054/055/060/061/065 as `Environment Failure` ("data gap" /
"data volatility"). That reclassification was wrong and is retracted.** It was based on trusting each
test's own assertion message text (e.g. "This is an environment data gap, not an application defect")
without independently verifying against the live application — exactly the mistake the human reviewer
caught. A live, unfiltered DOM check of `/admin/branch` via `platform_core/tools/browser_driver/`
(2026-08-09, after this pass's initial write-up) shows:

```
rowCount: 10, summary: "Showing 10 results of 498 results"
rowSample includes: BRN309 | ... | Egypt | Cairo | Approved | ...
pageButtons: ["1", "2", "50"]
```

498 real records exist, "Approved" rows are plainly present, and the grid renders correctly with no
filter applied — directly contradicting TC-BR-054's claim that no "Approved"/"Pending for approval"
row could be found, and TC-BR-055/065's implicit claim that a plain search returns 0 rows. **These are
automation-side defects, not environment data gaps.** Corrected findings:

| Test Case | Corrected status | Evidence-backed hypothesis | Repair applied this pass |
|---|---|---|---|
| TC-BR-054 | **Automation Failure — unresolved** | Its own status-filtered search (via `selectStatus()`/`clickSearch()`) is very likely not finding rows that plainly exist unfiltered — the search/filter path itself is suspect, not the data | None — root cause not yet established at the needed precision |
| TC-BR-055 | **Automation Failure — unresolved** | Same: a plain search reporting 0 rows contradicts the unfiltered grid having 10+ | None |
| TC-BR-060 | **Automation Failure — unresolved** | `BRN309` (confirmed row 1 of page 1 in the live check) appearing on "page 2" too means the next-page click is very likely not changing pages at all, or `waitForPageContentToChange()`'s comparison is defective | None |
| TC-BR-061 | **Automation Failure — unresolved** | Pagination buttons are `["1", "2", "50"]`, not sequential — `highestOfferedPageNumber()` should jump straight to "50" in one click. Running 420s through 80 hops without converging means `currentPageNumber()`/`SELECTED_PAGE_BUTTON` most likely misreads the selected page after a jump, so the loop's own termination check never fires | None |
| TC-BR-065 | **Automation Failure — unresolved** | Same 0-rows pattern as TC-BR-055; original 30s-timeout cause still not reached | None |

**None of these were repaired this pass** — Root Cause Confidence for each is now Medium at best (a
plausible, evidence-consistent hypothesis, not a confirmed mechanism), which gates to diagnosis first
per §7.1, not a guessed repair. **No Application Failure was found or considered** — this remains an
automation-code question, not an application defect.

### Second diagnosis round, same day — live Playwright cross-check narrows it further

Using `platform_core/tools/browser_driver/` (Playwright-based, independent of the suite's own
Selenium/SHAFT stack), the exact interaction sequences were replicated directly against STG:

- `selectStatus(Status.BOTH)` + `clickSearch()` equivalent: the grid correctly returns 636 results, with
  "Pending for approval" visible in the first row — the filter mechanism itself works.
- Clicking page-button "2": `firstCode` changed from `BRN707` to `BRN471`, and the `.selected` class
  correctly moved to the "2" button — the pagination click mechanism itself works.
- `TestBase.java` confirmed: `@BeforeMethod` creates a fresh `SHAFT.GUI.WebDriver()` per test method, so
  cross-test browser-state contamination (e.g. a dropdown left open by a failing `tcBr046`) is ruled out.

**This disproves a structurally broken locator or filter/pagination algorithm** — the same operations,
performed the same way, work correctly when driven by Playwright. It does **not** disprove an automation
defect: it narrows the hypothesis to a **Selenium/SHAFT-specific synchronization gap** — `clickSearch()`
and `goToNextPage()`'s own wait conditions (`resultSummaryText` change / row-count change, both bounded
by `RESULT_TIMEOUT`) most likely resolve on a transient intermediate DOM state that Selenium's polling
observes but Playwright's own actionability/network-idle heuristics do not hit the same way. This is
still squarely an **Automation Failure** classification — the fix, if confirmed, belongs in this suite's
own wait logic, not the application. Confidence remains Medium (a well-evidenced narrowing, not a
confirmed mechanism) — a repair is not proposed yet; the next step is instrumenting an actual SHAFT run
(DOM/log capture at the moment `rowCount()`/`approvalStatusInRow()` are called) rather than a further
guess from Playwright-side evidence, which cannot observe Selenium's own timing.

### Third round, same day — Selenium-side instrumentation confirms and fixes the root cause

Per explicit user authorization (diagnosis-only first), `[DIAG-SYNC]`-tagged timestamped logging was
added to `clickSearch()`, `goToNextPage()`/`goToLastPage()`, `currentPageNumber()`,
`highestOfferedPageNumber()`, `waitForPageContentToChange()`, and the `assertIconsForStatus`/TC-BR-055/
TC-BR-065 call sites (no behavior changed). A scoped run of exactly the 5 tests in question
(TC-BR-054/055/060/061/065 — TC-BR-001 stayed quarantined, TC-BR-046/066/067/068/069 excluded as not
needed) reproduced all 5 failures identically, with the instrumentation showing the mechanism directly:

```
clickSearch clicked t=178ms
clickSearch poll t=198ms empty=true summaryNow="" changed=true rowCountNow=0
clickSearch resolved t=213ms
clickSearch end t=213ms summaryAfter="" rowCountAfter=0
```

**Root Cause Confidence: High, directly observed.** `clickSearch()`'s wait condition returns `true`
the instant `isEmptyStateShown()` is observed, in ~200-250ms — far faster than any genuine page-content
change elsewhere in the same run (1-2.5s). The empty-state placeholder renders **both** for a genuine
zero-result search **and** transiently while the grid clears its previous rows before the new set
streams in; the bare presence check cannot distinguish the two. Every downstream read inherits the
false-empty race: `rowCount()==0` immediately (TC-BR-055, TC-BR-065), pagination controls absent from
the empty DOM so `hasNextPage()==false` (TC-BR-060, TC-BR-061), and TC-BR-054's first page-scan
iteration recording a false 0-row page before permanently advancing past the real page 1.

**Repair applied and confirmed working (`REPAIR-BR-009`):** `clickSearch()` now requires
`isEmptyStateShown()` to hold continuously for `EMPTY_STATE_SETTLE` (600ms, ≈2 poll cycles) before
accepting it as final, rather than the instant it appears — the same "wait for a stable signal, not
mere appearance" principle already confirmed by `REPAIR-BR-008`, applied to disappearance instead.
A verification rerun of the same 5 tests showed **zero false-empty reads across the entire run** —
every `clickSearch()` call resolved on real data (`rowCount=10`, real summary text).

**This confirms the race is fixed, and simultaneously reveals it was masking three separate, previously
unreachable issues:**

| Test | Before this fix | After this fix | Status |
|---|---|---|---|
| TC-BR-054 | False 0-row page 0 (race) | Genuinely reads 10 "Approved" rows on page 1 — but `[DIAG-SYNC] goToNextPage before=[...] page=1` / `after=[same list] page=1 totalMs=21707` repeats identically, dozens of times, across the full run. **Retracting the "legitimate data limitation" call made earlier in this same document** — the page-scan loop never actually advances past page 1 at all | **Race confirmed fixed. New root cause found — see below, not a data limitation** |
| TC-BR-055 | `rowCount()==0` immediately (race) | Passes the row-count check; now times out 30s waiting for `UpdateBranch_Page` to load after the edit-pen click | **Race confirmed fixed.** New, distinct, undiagnosed issue exposed underneath |
| TC-BR-065 | Same as TC-BR-055 | Same new `UpdateBranch_Page` load timeout | **Race confirmed fixed.** Same new issue as TC-BR-055 |
| TC-BR-060 | `hasNextPage()==false` (race) | Pagination controls found; `BRN309` appears on both page 1 and page 2 | **Race confirmed fixed.** New, distinct pagination-content bug exposed underneath |
| TC-BR-061 | Same as TC-BR-060 | "No further next-page navigation... expected false but found true" | **Race confirmed fixed.** Related to TC-BR-060's new finding |

**Knowledge recorded:** `REPAIR-BR-009` (bounded-empty-state-settle pattern) — confirmed by this
targeted verification rerun, 1 execution, 1 project. Generalises to any grid/list read whose "no
results" placeholder can also render transiently during a data refresh — the same class of defect as
`REPAIR-BR-008` and `REPAIR-001`, now confirmed a third time in this codebase alone.

### Fourth round, same day — pagination and edit-pen click delivery (diagnosis only, no repair applied)

Continued instrumentation on the two newly-exposed issues found a **unified root cause for three of
them**, not two separate bugs:

`goToNextPage()`'s own `[DIAG-SYNC]` log shows the smoking gun directly:

```
goToNextPage before=[BRN309, BRN2, BRN298, ...] page=1
goToNextPage clicked t=750ms
goToNextPage after=[BRN309, BRN2, BRN298, ...] page=1 totalMs=21707   <- identical list, identical page
```

This exact before/after/totalMs≈21.5s pattern repeats **dozens of times consecutively** across the run
— `NEXT_PAGE_BUTTON` is clicked, 21+ seconds pass (`waitForPageContentToChange` timing out on
`RESULT_TIMEOUT`), and the grid never changes at all. This is what TC-BR-054's page-scan loop was
actually doing the whole time: never advancing past page 1. **The "legitimate data/scope limitation"
call made earlier in this document, three sections up, is retracted** — it was written before this
log was examined.

**Root Cause Confidence: High.** This is not a new hypothesis — it is the *same, already-documented,
already-fixed* issue in `AddBranch_Page.clickVia()`: *"a driver-issued click on these controls is
reported as delivered and changes nothing... dispatching the events the component actually binds to is
what works"* (confirmed there for the list screen's `routerLink` button and the autocomplete option).
`SearchBranch_Page`'s `NEXT_PAGE_BUTTON`/`PAGE_NUMBER_BUTTONS` clicks, and `clickEditPen`/
`clickEditPenInRow`'s row-icon clicks, all still use plain `driver.element().click()` — the same raw
click this application's PrimeNG-family components are already confirmed not to reliably respond to.
TC-BR-055/065's new `UpdateBranch_Page` load timeout is very plausibly the same mechanism on the
edit-pen icon click, though this has not yet been directly log-confirmed the way the pagination click
has.

**No repair applied yet** — reported for approval:

| Option | Strategy | Basis | Confidence |
|---|---|---|---|
| A | Replicate `AddBranch_Page.clickVia()`'s JS-dispatched mouse-event click for `NEXT_PAGE_BUTTON`, `PAGE_NUMBER_BUTTONS`, and the row-action icon locators (`actionIconInRow`) | Matches an already-confirmed pattern in this exact application — not a novel guess | 90% (pagination), 70% (edit-pen, unconfirmed by direct log evidence) |

**Scope note:** this would plausibly resolve TC-BR-054, TC-BR-060, TC-BR-061 outright, and TC-BR-055/065
if the edit-pen hypothesis holds — but it has not been applied or verified, per this round's diagnosis-
only authorization.

### Fifth round, same day — clickVia() applied and verified (`REPAIR-BR-010`)

Per explicit approval, Option A applied: `Branch_Common.clickVia()` added (ported from
`AddBranch_Page.clickVia`) and used in `goToNextPage()`, `goToLastPage()`, `clickEditPen()`,
`clickEditPenInRow()`, `clickThumbsUp()`, `clickThumbsDown()`. Verification rerun of the same 5 tests:

| Test | Result | Detail |
|---|---|---|
| TC-BR-060 | **Passed** | Confirms the pagination click-delivery hypothesis outright |
| TC-BR-065 | **Passed** | Confirms the edit-pen click-delivery hypothesis outright |
| TC-BR-054 | Still fails, different signature | Now finds "Approved" and "Pending for approval" successfully (both earlier `assertIconsForStatus` calls in the same test passed) — fails only on "Rejected" not found within 10 pages. Pagination genuinely works now; this may be a real data-scarcity fact rather than a defect |
| TC-BR-055 | Still fails, different signature | No longer times out — reaches `UpdateBranch_Page`, but reads the City dropdown label as `"loading..."` instead of `"Hurghada"`. A distinct, smaller timing gap: the City dropdown label is read before it repopulates, unlike `waitUntilLoaded()`'s Branch Name check which does wait |
| TC-BR-061 | Still fails, same signature | `goToLastPage()`'s convergence/final-page detection remains broken even though the click itself now registers |

**Knowledge recorded:** `REPAIR-BR-010` (JS-dispatched click for components that don't respond to a
driver-issued click) — confirmed a second and third time in this project (TC-BR-060, TC-BR-065), on top
of its original two confirmations in `AddBranch_Page`. Strong promotion candidate.

**Health impact:** Automation Health improves by 2 (TC-BR-060, TC-BR-065 now pass). Application Health
unchanged. Two of the three remaining failures are now materially smaller and more specific than at the
start of this pass — not yet fixed, but no longer explained by either the search race or the click
delivery defect.

### Sixth round, same day — the three narrowed leads closed out

**TC-BR-054 — data fact established, read-only, no code/expectation change.** Per explicit instruction,
the actual dataset was queried directly (not via the UI) by capturing the Branch search API's real
request/response (`POST .../Branch/search`) through the browser driver and replaying it with a page
size covering the full result set. Confirmed: **637 total records, `approvalStatus` codes `{0: 87,
1: 499, 2: 51}`**. Cross-checked one `approvalStatus: 2` record (`BRN466`) against its rendered grid
row: `["BRN466", "testThread", "Libya", "Tarablous", "Rejected", ""]` — **code 2 is confirmed
"Rejected", and 51 such records genuinely exist.** The data fact is therefore: Rejected records exist,
but apparently not within the first 10 pages (100 of 637 rows) of the default sort order — a scan-bound
question, not a missing-data question. **No code or test expectation changed** — this is reported for
a human decision (raise `MAX_PAGES_SCANNED_FOR_APPROVAL_STATES`, or search/sort by status directly)
rather than resolved unilaterally.

**TC-BR-055 — confirmed and fixed (`REPAIR-BR-012`).** `UpdateBranch_Page.city()`/`waitUntilLoaded()`
instrumented with a load-relative timestamp. Confirmed directly: at t=623ms (when `waitUntilLoaded()`
resolved on Branch Name populating), the City dropdown label still read literally `"loading..."`
(`placeholder=true`); 213ms later, still `"loading..."`. **Root Cause Confidence: High, directly
observed.** City (and State, the identical PrimeNG-dependent-dropdown pattern) populate on an
independent, slower async timeline than the Branch Name input — `waitUntilLoaded()` never waited for
either. Repair: `waitUntilLoaded()` now also waits, bounded, for City's and State's labels to move past
the literal `"loading..."` text. **Verification: TC-BR-055 passed.**

**TC-BR-061 — confirmed and fixed (`REPAIR-BR-011`).** With click delivery already fixed
(`REPAIR-BR-010`), instrumentation showed `goToLastPage()` itself converging correctly (`highestOffered
=50, current=50, "converged at hop=1"`) — but the very next `hasNextPage()` call still returned `true`
on that genuine last page. Live DOM inspection of the Next button on the confirmed last page (via the
browser driver, read-only, no automation-code assumption): `<button class="next"><i class="pi
pi-angle-right"></i></button>` — **no `disabled` attribute, no disabled class, identical markup whether
or not a next page exists.** `hasNextPage()`'s `hasClass(NEXT_PAGE_BUTTON, "disabled")` check was
looking for a signal this paginator never emits, on any page. Repair: `hasNextPage()` now compares
`currentPageNumber() < highestOfferedPageNumber()` — the same technique `goToLastPage()` already uses
successfully for its own convergence, rather than a disabled-state check. **Verification: TC-BR-061
passed.**

**Knowledge recorded:** `REPAIR-BR-011` (paginator "more pages available" must be inferred from
current-vs-highest page number, not a disabled-state check, when the component provides none) and
`REPAIR-BR-012` (a dependent PrimeNG dropdown's own async population must be waited for explicitly, not
inferred from an unrelated field on the same form) — both confirmed by this run, 1 execution each.

**Updated tally, this healing pass:** 5 of 12 original `Automation Failure` results now confirmed fixed
(TC-BR-043, TC-BR-060, TC-BR-065, TC-BR-055, TC-BR-061). TC-BR-054 has a confirmed root cause but no
repair (awaiting a human scan-bound/strategy decision). TC-BR-046 remains a Remaining Failure
(untouched, per scope). TC-BR-001 remains quarantined (untouched, per scope). TC-BR-066/067/068/069
remain unverified (untouched, per scope — never reached any of this pass's repaired code).

`[DIAG-SYNC]` instrumentation remains in place pending a cleanup decision.

**Instrumentation status:** `[DIAG-SYNC]` logging remains in `SearchBranch_Page.java`,
`SearchBranch_TC.java`, and `UpdateBranch_TC.java` per explicit instruction, pending a decision on the
two newly-exposed issues.

## 7. Disclosed Discrepancies

None newly disclosed this pass. (TC-BR-001's pre-existing "Pending for approval." vs "Added Successfully" question — see the Pass `HEAL-BR-20260806-01` addendum — is now understood differently: `assertSubmissionSucceeded()`'s `navigatedAway || pendingApprovalShown` condition never required literal text match in the first place, so there was no genuine assertion-value conflict to disclose. That prior disclosure is superseded by this correction.)

## 8. Quarantine

| Test Case | Attempts | Why withdrawn | Recommendation |
|---|---|---|---|
| TC-BR-001 | 4 (3 prior + this pass) | Reaches the §14 limit. This pass's repair is evidence-backed and passed cleanly once (Headless), but failed once (Headed) on an unrelated upstream cause (Add Branch button not found within 20s) — the outcome is not a clean, repeatable confirmation. A 5th guess would compound rather than resolve the ambiguity | Verify in isolation (not bundled with 11 other tests against a loaded shared environment) before any further repair attempt; investigate whether the button-open timeout is itself the same data-volume/list-rendering issue affecting §6's reclassified tests |

Cross-referenced to `QuarantineRegister.md` (created this pass).

## 9. Knowledge Recorded

| Test Case / Repair | Confirmed repair recorded | Promotion proposed? | Outcome |
|---|---|---|---|
| TC-BR-043 (stale-retry) | Yes — bounded retry-on-`StaleElementReferenceException` when a grid read races a re-render, confirmed passing in 2/2 cycles | Proposed | **Approved, with guardrails (2026-08-14, ahmed.ayman@tildetech.ae)** — promoted as a bounded, re-locating stale-read recovery technique, not a universal retry: every attempt discards prior `WebElement` references and re-locates from the current DOM; retries only on `StaleElementReferenceException`; bounded to 3 attempts with a condition-based wait between them; persistent staleness fails with the original diagnostic evidence rather than being masked. Recorded as `REPAIR-011 (source: TC-BR-043)` |
| REPAIR-BR-001 (stale listener poll) | Yes (`HEAL-BR-20260806-01`) | Proposed | **Approved (2026-08-14)** — recorded as `REPAIR-005 (source: REPAIR-BR-001)` |
| REPAIR-BR-008 (autocomplete commit signal) | Yes (`HEAL-BR-20260806-01` addendum) | Proposed | **Approved (2026-08-14)** — recorded as `REPAIR-006 (source: REPAIR-BR-008)` |
| REPAIR-BR-009 (empty-state settle) | Yes (this pass) | Proposed | **Approved (2026-08-14)** — recorded as `REPAIR-007 (source: REPAIR-BR-009)` |
| REPAIR-BR-010 (JS-dispatched click) | Yes (this pass, 3rd confirmation) | Proposed | **Approved, with guardrails (2026-08-14)** — promoted narrowly as a fallback for a *confirmed* click-delivery defect, never the default click strategy: a normal click must be attempted and confirmed non-functional first; the target must be verified visible, enabled, and unobstructed; the expected post-click outcome must be verified; it must never be used to click through a disabled control or bypass business validation. Recorded as `REPAIR-008 (source: REPAIR-BR-010)` |
| REPAIR-BR-011 (paginator page-number comparison) | Yes (this pass) | Proposed | **Approved (2026-08-14)** — recorded as `REPAIR-009 (source: REPAIR-BR-011)` |
| REPAIR-BR-012 (dependent-dropdown async wait) | Yes (this pass) | Proposed | **Approved (2026-08-14)** — recorded as `REPAIR-010 (source: REPAIR-BR-012)` |

No other test in Fixed this pass — nothing else is written to the KB (§10.2: confirmed repairs only).

**Note (2026-08-14):** platform IDs are independent sequential identifiers; module-local `REPAIR-BR-0NN` IDs preserve the repair's origin. `REPAIR-011` (platform, this pass's stale-retry promotion) and `REPAIR-BR-011` (module, the paginator pattern promoted as `REPAIR-009`) are correctly two different patterns that happen to share the number "011" under different, unrelated numbering schemes. Every promoted platform pattern file now carries a `## Provenance` block naming its `Source Pattern ID` / `Source Test Case`, `Source Module`, and `Source Run` — see `platform_core/knowledge/patterns/repair_patterns/REPAIR-005.md` through `REPAIR-011.md`.

## 10. Health Impact

| Figure | Before (`rerun-5`) | After (this pass) | Note |
|---|---|---|---|
| **Application Health** | 2 failures | 2 failures | **Unchanged**, as required — TC-BR-026/052 untouched throughout the entire pass |
| Automation Health | 12 failures | **2 confirmed remaining** (TC-BR-046 Remaining; TC-BR-001 Flaky/Quarantined), **5 confirmed Fixed** (TC-BR-043/055/060/061/065), **1 confirmed root cause, no repair applied** (TC-BR-054 — data fact established, awaiting a scan-bound decision) | 4 unverified, out of scope for this pass (TC-BR-066/067/068/069, never reached any repaired code) |
| Environment Health | 0 failures | 0 failures | **Corrected mid-pass** — an earlier draft wrongly moved 5 tests here as "Environment Failure" on the strength of unverified assertion-message text; a live DOM check retracted that (§6). Every subsequent finding in this pass (click delivery, City/State async load, paginator disabled-state) was confirmed as an automation-code cause, not an environment one |

## 11. Recommendations

| Item | Recommendation |
|---|---|
| TC-BR-046 | Do not guess a third repair. Live DOM diagnosis needed: does clicking `COUNTRY_DROPDOWN_ANCESTOR` reliably open the panel at all, and does re-clicking it on retry close an already-open panel? Consider replicating `AddBranch_Page.clickVia()`'s JS-dispatched click if a raw driver click is confirmed not to commit on this control, matching the precedent already established for the Add Branch screen |
| TC-BR-001 (quarantined) | Re-verify in isolation, single-test, before any further repair attempt |
| TC-BR-054/055/065 | Live-verify `selectStatus()`/`clickSearch()`/`searchByName()` against the real filter form — an unfiltered grid plainly returns rows (confirmed 498 total, "Approved" rows present), so a plain/status-filtered search reporting 0 rows or "no matching status" points at the search/filter interaction itself, not the data |
| TC-BR-060/061 | Live-verify `goToNextPage()`/`goToLastPage()`'s convergence logic. Pagination buttons are non-sequential (`["1","2","50"]`, not `1..N`) — `highestOfferedPageNumber()`'s jump-to-highest approach is structurally sound for this, but `currentPageNumber()`/`SELECTED_PAGE_BUTTON` most likely misreads the selected page after a jump, since BRN309 appearing on both "page 1" and "page 2" indicates the next-page click may not be changing pages at all |
| TC-BR-066/067/069 | Never exercised the repaired code in either cycle (20s upstream timeout). Needs its own diagnosis, out of this pass's original scope; do not fold into Cluster A's outcome |
| TC-BR-068 | Reached the repair once and exhausted its 10s wait. One data point is not enough to judge the wait's sufficiency — recommend a longer bound (matching `COMMIT_TIMEOUT`'s 6s × `SELECT_COMMIT_ATTEMPTS` precedent, or similar) once the environment is stable enough to test it cleanly |
| Evidence tooling | `target/surefire-reports/` and root `allure-results/` are not partitioned per invocation (KL-09) — two cycles run back-to-back lost the first cycle's XML report and merged screenshots. Recommend `mvn clean` (or an explicit results-directory override) between cycles in any future multi-cycle pass |

## 12. Approval Status

| Field | Value |
|---|---|
| Repaired suite status | **Approved — 2026-08-14, ahmed.ayman@tildetech.ae** |
| May merge to baseline? | **Yes — cleared this approval** |
| May project into Target Project? | **Yes — cleared this approval** |
| Reviewer | ahmed.ayman@tildetech.ae |
| What was weighed at approval | 5 confirmed fixes (TC-BR-043/055/060/061/065), 0 regressions, Application Health unchanged. TC-BR-046 and TC-BR-054 remain open (see §11); TC-BR-001 remains quarantined; TC-BR-066/067/068/069 remain unverified — none of these block this approval, they continue as separate follow-up work |

**Follow-on decisions made at this approval (2026-08-14):**

| Item | Decision |
|---|---|
| TC-BR-054 | Fix approach selected: **search/sort by status directly**, not raising `MAX_PAGES_SCANNED_FOR_APPROVAL_STATES`. Not yet implemented — see closing message |
| `[DIAG-SYNC]` instrumentation | **Keep in place** until TC-BR-046 and TC-BR-066/067/068/069 are diagnosed, then remove |
| KB Promotion | All 7 candidates approved — see updated §9 |

### Addendum — Group 1 formal verification (2026-08-14)

The Fifth/Sixth-round confirmations above for TC-BR-055, TC-BR-060, and TC-BR-061 were narrative-only — no dedicated `ExecutionResults.rerun-N.md` existed for them, which does not satisfy this skill's own §12.1 requirement. A standalone, human-approved formal verification was run 2026-08-14 (Headed, exactly these 3 tests, no code change): all 3 **Passed**. TC-BR-060 and TC-BR-061 each hit one internal `StaleElementReferenceException`, caught and resolved by the already-approved `withStaleRetry` retry mechanism (the REPAIR-011/`REPAIR-009` pattern) — recorded as 2 attempts each, not silently reported as a clean single pass. Full detail, exact command, timestamps, and both retried stack traces: `execution/ExecutionResults.rerun-8.md`. Human authorization for the CREATE/SelfCreated mutation class (each test provisions its own Branch record) was granted for this run only: `metadata/SafetyAuthorizations.json`, `AUTH-BRANCH-CREATE-SelfCreated`.

### Updated §10 Health Impact

| Figure | Before pass | After pass (per `EXEC-BR-20260806-03`) |
|---|---|---|
| **Application Health** | 1 failure | **2 failures — and unchanged by healing.** The second (TC-BR-052 / FINDING-012) appeared only because Search was executed for the first time this session; it is a pre-existing disclosed defect, not a healing side-effect |
| **Automation Health** | 1 failure (Create scope only) | Create scope: 1 (TC-BR-001). Whole cycle: 12, across Search and Update — screens this pass was **never scoped to touch** |
| **Environment Health** | 0 | 0 |

---

# Healing Pass HEAL-BR-20260815-01 — Branch Search screen action delivery

**Status:** Pending Automation Approval

## 1. Healing Metadata

| Field | Value |
|---|---|
| Healing Pass ID | HEAL-BR-20260815-01 |
| Module | `branch` |
| Triggering run | `run-003__2026-08-04_11-24-38__UserStory__US-8599-SearchActions_US-8606-UpdateBranch` |
| Source Execution ID(s) | EXEC-BR-20260815-01 (diagnosis, cycle 23) |
| Rerun cycle written | `execution/ExecutionResults.rerun-24.md` |
| Scope | `SearchBranch_TC` and `SearchBranch_Page` only — named in the invocation |
| Environment | Staging (STG), `http://192.168.1.70` |
| Framework | SHAFT Engine 7.4.20231015 / TestNG / Java 24.0.1 / Chrome 150 |
| Mode | Headed (human-selected; §12 deviation recorded in the rerun file) |
| Completed | 2026-08-15T15:00 (+03:00) |
| Invocation Path | Direct — `/self-healing-skill` |
| Code drift at pass start | **`moved`** — 15 commits since this run was anchored. All inherited repair knowledge was therefore treated as unverified and re-confirmed against live evidence before use |

## 2. Eligibility Summary

| Classification | Count | Eligible? | Disposition |
|---|---|---|---|
| Automation Failure | 7 | **Yes** | All 7 shared one root cause; repaired and rerun |
| Application Failure | 1 (TC-BR-052 / FINDING-012) | **Never (§8)** | Untouched. This test is deliberately red and must stay red |
| Environment / data dependency | 3 (TC-BR-055, 060, 061) | No | Not automation defects; not in this pass |

**Stale-evidence correction.** The failure list supplied at invocation came from cycle 23, produced **before** `SearchBranch_TC` and `SearchBranch_Page` were rewritten by the module owner earlier the same day. TC-BR-043's recorded failure belonged to a code path that no longer existed. A current-evidence diagnosis run was executed first, with no code change, and every strategy below is derived from that run — not from the stale list.

## 3. Per-Failure Analysis

**Root Cause Confidence: High** — one cause across all 7 failures.

### Root cause

On the Branch Search screen only, SHAFT 7.4's `driver.element().type()` and `driver.element().click()` are reported as delivered and change nothing. The text inputs stay empty, the Status radio never becomes selected, the Search button starts no result cycle, and the Country dropdown never opens.

### Evidence

| # | Evidence | Source |
|---|---|---|
| 1 | Three inputs reported `Actual value: ""` immediately after a successful `type()` call | Cycle 23, TC-BR-040/041/043 |
| 2 | Status radios all present and readable, requested one never selected, across 3 attempts | Cycle 23, TC-BR-054 diagnostics |
| 3 | Search click produced no grid re-render within 20s | Cycle 23, TC-BR-042/045 |
| 4 | Field stays `ng-pristine ng-untouched` with zero events after `type()` | `DIAG-BR-20260814-02`, 2026-08-14 |
| 5 | Native Selenium `clear()+sendKeys()` also leaves the field empty — so the fault is not the keystroke method | `rerun-21`, 2026-08-14 |
| 6 | The same driver types successfully into Login and into every Add Branch field in the same session | 2026-08-15 runs, 4 passing tests |
| 7 | Every control on this page already routed through `clickVia` works; the three still on the plain click were exactly the three failing | `REPAIR-008`, 3 confirmations |

### Why this is an automation defect and not an application defect (§8)

Checked before any repair was proposed. The 2026-08-14 live diagnosis drove these same filters with real keystrokes and every one worked — Branch Name to 1 result, Branch Code to 1 result, `ZZZZQQ9` to the empty state, Active/Inactive/Both to 509/172/681, which reconcile. Application, API and UI binding were ruled out then, and nothing observed since contradicts it. The application works; SHAFT's action delivery to this screen does not.

### Strategies enumerated

| | Strategy | Risk | Confidence | Outcome |
|---|---|---|---|---|
| **A** | Reuse the proven pattern — port `AddBranch_Page.setValueAndNotify` to the filter inputs; add a verified `clickVia` fallback to Status, Search and Country | Low | **90%** | **Selected and applied** |
| B | Clicks only | Low | 45% | Rejected — leaves TC-BR-040/041/043 dead |
| C | Upgrade SHAFT past 7.4 | Med–High | 30% | Rejected — 7.4 is pinned by explicit decision; would touch all 29 tests |

**Selection rule:** human choice, presented as the recommendation ("Apply Strategy A in full").

### Repair Confidence Report

```
Test Cases:            TC-BR-040, 041, 042, 043, 045, 046, 054
Automation Script:     AdminPages/Admin/Branch/SearchBranch_Page.java
Classification:        Automation Failure
Root Cause Confidence: High

Root Cause:
SHAFT 7.4's type() and click() do not reach this screen's PrimeNG controls; they report
success and change nothing.

Proposed Repair:
Try the normal interaction first; when it is observed not to have arrived, set the value
through the DOM with input/change/blur events, or dispatch the click, then verify the
result committed.

Confidence: 90%

Reasoning:
- Root cause directly observed in the guards' own runtime output (+55) -- cycle 23
- Repair targets that exact mechanism, not an adjacent one (+12)
- Reproduced 4x with the same signature (+10) -- cycle 23, DIAG-BR-20260814-02, rerun-21, rerun-22
- REPAIR-008 matches the click half, 3 confirmations in this codebase (+8)
- Statically verified: mvn test-compile clean, exit 0 (+5)
- Not a novel pattern: setValueAndNotify already proven across 13 AddBranch tests

Regression Risk: Low -- the normal path is attempted first and used whenever it works;
no assertion, expected value or timeout was modified.

Evidence: ExecutionResults.rerun-24.md (confirmed by rerun)
```

## 4. Applied Repairs

**One file changed: `src/main/java/AdminPages/Admin/Branch/SearchBranch_Page.java`.** No test class was modified. No shared class was modified — `Branch_Common` was deliberately left alone because `UpdateBranch_Page` also depends on it and that is outside this pass's scope (§4.1).

| Method | Change |
|---|---|
| `setBranchCode`, `setBranchName` | Now call `typeWithDeliveryFallback` instead of `driver.element().type()` |
| `typeWithDeliveryFallback` *(new)* | Types normally; if the value did not arrive within a short probe, sets it through the DOM and dispatches `input`, `change`, `blur`, `focusout` — the `AddBranch_Page.setValueAndNotify` pattern |
| `valueArrived` *(new)* | Bounded, non-throwing check that an input holds the expected value |
| `selectStatus` | Normal click, verify radio selected; only then `clickVia`, verify again. Bounded at 3 rounds |
| `clickSearch` | Normal click; if no result cycle starts within a 3s probe, `clickVia`. The existing staleness proof still has to hold afterwards |
| `cycleStarted` *(new)* | Bounded, non-throwing probe for "a new grid cycle began" |
| `selectCountry` | Rewritten. Opens the panel with a normal click, falls back to `clickVia` if it stays closed, and **checks whether the panel is already open before re-clicking** — the previous retry loop could toggle its own successful click shut, a hazard its own code comment had already flagged. Commit is proven by the panel closing, never by the State filter enabling, which is what TC-BR-046 asserts |
| `isDropdownPanelOpen`, `awaitPanelOpen`, `awaitPanelClosed` *(new)* | Panel-state helpers supporting the above |

**Guard rails honoured (`REPAIR-008`):** normal interaction always attempted first; fallback engages only after the normal one is observed to have failed; the post-interaction outcome is always verified rather than assuming the JS call succeeding means the action worked; nothing is forced through a disabled or blocked control.

## 5. Rerun Outcome

```
Tests run: 7, Failures: 1, Errors: 0, Skipped: 0
```

**6 Automation Repaired · 1 Remaining (reclassified) · 0 New Failures · 0 Quarantined.**
Full detail: `execution/ExecutionResults.rerun-24.md`; comparison: `BeforeAfterComparison.md`.

## 6. Reclassifications

**TC-BR-054** — its Automation Failure is resolved: it no longer fails at the Status filter. It now reaches its own logic and stops on an unmet precondition — no `Rejected` record within the 10-page scan limit. That is an **environment data gap**, ineligible for healing under §5, and it is the next problem rather than a failed repair. The fix approach was already chosen at the 2026-08-14 approval (search by status directly rather than raising the scan limit) and remains unimplemented.

## 7. Disclosed Discrepancies

None. No repair required changing an assertion's expected value.

## 8. Quarantine

None this pass. No test in scope reached the attempt limit.

## 9. Knowledge Recorded

One confirmed repair, eligible for the KB because it is in the Fixed column (§10.2):

```
Implements Platform Pattern:  extends REPAIR-008 (click half); the typing half is new
Execution Context:            EXEC-BR-20260815-02, SearchBranch_TC,
                              TC-BR-040/041/042/043/045/046
What Happened:                A framework's element actions were reported as delivered while
                              reaching nothing on one screen. Attempting the normal interaction,
                              detecting non-arrival by reading the control's own state, and
                              falling back to a DOM write plus the events the framework listens
                              for, restored 6 tests with no assertion changed.
```

**Promotion proposed, not yet approved.** `REPAIR-008`'s confirmation count is **not** incremented by this pass: this repair extends it rather than re-confirming it unchanged.

## 10. Health Impact

| Figure | Before | After |
|---|---|---|
| **Application Health** | Unchanged | **Unchanged** — no defect suppressed or introduced; no assertion touched |
| **Automation Health** (7-test scope) | 7 failures | **1** |
| **Environment Health** | 0 recorded | **1** — TC-BR-054's missing `Rejected` record |

## 11. Recommendations

| Item | Smallest corrective action |
|---|---|
| TC-BR-054 | Implement the already-agreed approach: filter by Approval Status directly instead of paging for it |
| ~~The other three Search tests~~ | **Closed 2026-08-15T15:07.** TC-BR-055 / 060 / 061 run separately: `Tests run: 3, Failures: 0` — BUILD SUCCESS. Zero regressions across the whole Search suite. Their logs show them using the repaired fallback paths too, so the repair's reach is wider than the 7 tests it was scoped to |
| `UpdateBranch_Page` | It still uses plain `driver.element()` actions. If the same delivery failure appears there, this pass's pattern applies — out of scope here, deliberately not applied |
| SHAFT 7.4 | The underlying delivery defect is worked around, not fixed. Worth a decision on the pinned version separately |

## 12. Approval Status

**The repaired suite is `Pending Automation Approval` (§15).** Stage `4A`'s original approval does not cover this code. It may not merge to the Workspace Automation Baseline, and may not be projected into the Target Project, until it clears that gate.


---

# Healing Pass HEAL-BR-20260815-02 — TC-BR-052 and TC-BR-054

**Status:** Pending Automation Approval

## 1. Healing Metadata

| Field | Value |
|---|---|
| Healing Pass ID | HEAL-BR-20260815-02 |
| Module | `branch` |
| Triggering run | `run-003__2026-08-04_11-24-38__UserStory__US-8599-SearchActions_US-8606-UpdateBranch` |
| Rerun cycle written | `execution/ExecutionResults.rerun-25.md` (EXEC-BR-20260815-03) |
| Scope | TC-BR-052 and TC-BR-054, named in the invocation |
| Environment | Staging (STG), `http://192.168.1.70` · Headed · Java 24.0.1 · Chrome 150 |
| Completed | 2026-08-15T15:33 (+03:00) |
| Invocation Path | Direct |

## 2. Eligibility Summary

| Test | Classification at pass start | Eligible? |
|---|---|---|
| TC-BR-052 | **Automation Defect / Needs Diagnosis** — reclassified 2026-08-14 when FINDING-012 was retracted | **Yes** |
| TC-BR-054 | Automation Failure — scan-bound precondition | **Yes** |

**Correction to an earlier statement in this session.** During HEAL-BR-20260815-01, TC-BR-052 was listed as an `Application Failure` that must never be healed. That was wrong: `FINDING-012` was retracted on 2026-08-14 and the test reclassified as an Automation Defect. The stale "expected to fail, do not soften" note in `AutomationSuiteManifest_SHAFT.md` is what carried the old classification forward. The test was eligible, and is repaired below — partially, and for reasons that are not the stale note's.

## 3. Per-Failure Analysis

### TC-BR-054 — Rejected records sit beyond the scan bound

**Root Cause Confidence: High** (established by a diagnosis probe, not inferred).

The test paged for one record in each approval state, bounded at 10 pages. A probe that temporarily raised the bound to 60 — applied, run once, and reverted — located the states precisely:

```
Approved             BRN801   page 1
Pending for approval BRN800   page 1
Rejected             BRN466   page 18   of roughly 52
```

So the failure was never about the icons. `Rejected` records simply sit deep in the default ordering, far past a bound that is generous for the other two.

**The approach agreed on 2026-08-14 is not implementable.** That decision read "search/sort by status directly". The Branch Search form has six controls and none filters on Approval Status — the `Status` filter is Active/Inactive/Both, a different property (Discovery §3). Reported rather than quietly substituted.

| | Strategy | Risk | Confidence | Outcome |
|---|---|---|---|---|
| **A** | Configure the Rejected fixture and reach it by direct code search; keep scanning for the two states found on page 1 | Low | **85%** | **Selected and applied** |
| B | Provision all three states in the test | Med | 55% | Rejected by the human — turns a read-only suite mutating, and the approve/reject-from-grid flow has never been built or verified (TC-BR-056/057 were never implemented) |
| C | Raise the page-scan limit permanently | Low | 40% | Rejected — moves the threshold without making the test deterministic; already rejected on 2026-08-14 |
| D | Sort by the Approval Status column | Unknown | — | Not pursued; column sortability was never established |

```
Repair Confidence Report

Test Case:            TC-BR-054
Automation Script:    SearchBranch_TC.java, branch_baseline.properties, BranchTestData.java
Classification:       Automation Failure
Root Cause Confidence:High

Root Cause:
Rejected records sit at roughly page 18 of 52 in the grid's default order, past the
10-page scan bound. Approved and Pending are on page 1.

Proposed Repair:
Configure the Rejected fixture by Branch Code and address it with one search instead of
18 page hops. Verify the record is still in that state before judging its icons.

Confidence: 85%

Reasoning:
- Root cause directly located by probe: BRN466 at page 18 (+55)
- Repair targets exactly that (+12)
- Consistent with the fixture-externalisation pattern this module already adopted for
  knownBranchCode / knownBranchName (+8)
- Statically verified: mvn test-compile clean (+5)
- Capped below 95% pre-rerun

Regression Risk: Low -- the assertion, the expected icon sets, and the two scanned states
are unchanged.

Evidence: ExecutionResults.rerun-25.md -- Passed.
```

### TC-BR-052 — one automation error, one unresolved disagreement

**Root Cause Confidence: High for the label; the State column is not a root-cause question at all.**

**Repaired.** The expected first column was `Branch Code`. The grid renders `Code` and always has — Discovery 2026-08-03 §4, re-confirmed by a live read on 2026-08-15. The business owner confirmed on 2026-08-14 that the grid's columns are correct, which resolves the §8.3 disagreement in the application's favour, so the expected value was corrected. Approved explicitly by the human before it was applied.

**Deliberately not repaired.** `State` stays in the expected list. Removing it would turn this test green and record an open disagreement as settled — the §8.1 forbidden repair. Evidence:

| Source | Says |
|---|---|
| Discovery 2026-08-03 §4 — explicit `offsetParent`/`display` check, two page loads | State absent, not responsive-hidden |
| This suite's own column indices — `cityOf` = column 4, `approvalStatusOf` = column 5 | A six-column grid; TC-BR-055 passes on those indices, which it could not if State existed |
| Live read 2026-08-15 | `[Code, Branch Name, Country Name, City, Approval Status, Actions]` |
| Business owner 2026-08-14 | State is present; no application defect |

Three independent observations contradict the fourth. Disclosed, not resolved.

## 4. Applied Repairs

| File | Change |
|---|---|
| `SearchBranch_TC.java` | TC-BR-052: expected column `"Branch Code"` corrected to `"Code"`; `"State"` left in place; assertion message rewritten to state why it must not be weakened; stale `@Story("Regression - FINDING-012")` corrected. TC-BR-054: Rejected now reached via new `assertIconsForKnownRecord`; scan bound restored to 10 with a note; permanent `[DIAG-SYNC]` line recording which record satisfied each state |
| `branch_baseline.properties` | Added `knownRejectedBranchCode=BRN466`, with the evidence for it and instructions for replacing it |
| `BranchTestData.java` | Added `knownRejectedBranchCode()` |

**Temporary diagnosis change, applied and reverted:** `MAX_PAGES_SCANNED_FOR_APPROVAL_STATES` was raised 10 to 60 for one probe run and restored to 10 in the same pass. It is not in the delivered code.

## 5. Rerun Outcome

Full-class regression run, all 11 tests:

```
Tests run: 11, Failures: 1, Errors: 0, Skipped: 0   (318.5 s)
```

**1 Automation Repaired (TC-BR-054) · 1 partially repaired and still failing by design (TC-BR-052) · 0 New Failures · 0 Quarantined.**

## 6. Reclassifications

None this pass. TC-BR-052's reclassification happened on 2026-08-14 and is honoured here rather than repeated.

## 7. Disclosed Discrepancies

1. **The State column.** Three independent observations say absent; the business owner says present. Unresolved, left to a human. TC-BR-052 stays red on it.
2. **Stage 3 documents still say "Branch Code".** `TestCases_Branch.md` and `TraceabilityMatrix.md` specify a label the application does not render. The automation now matches the application; the documents do not. This skill has no write access to Stage 1-3 artifacts (§11), so that correction is a human action.
3. **`AutomationSuiteManifest_SHAFT.md`'s "expected to fail / do not soften" note for TC-BR-052 is stale** — it predates the FINDING-012 retraction and caused this test to be misclassified earlier in this session.

## 8. Quarantine

None. Neither test reached the attempt limit.

## 9. Knowledge Recorded

One confirmed repair (TC-BR-054, in the Fixed column):

```
Implements Platform Pattern:  none yet -- promotion proposed
Execution Context:            EXEC-BR-20260815-03, SearchBranch_TC, TC-BR-054
What Happened:                A test scanned a paginated list for a record in a required state and
                              failed when that state sat beyond the scan bound. Locating the state
                              once by probe, configuring it as a named fixture, addressing it
                              directly, and verifying it still holds that state before asserting on
                              it, made the test deterministic and faster.
```

TC-BR-052's label correction is **not** written to the KB: it corrected a project-specific expected value, and it did not move the test to the Fixed column.

## 10. Health Impact

| Figure | Before | After |
|---|---|---|
| **Application Health** | Unchanged | **Unchanged** — no defect suppressed or introduced |
| **Automation Health** (SearchBranch_TC) | 2 failures | **1** |
| **Environment Health** | 1 | **0** — the data gap is resolved by configuration |

## 11. Recommendations

| Item | Smallest corrective action |
|---|---|
| TC-BR-052 / State | Settle the contradiction with the business owner against the live grid. Until then the test correctly stays red |
| Stage 3 documents | Correct "Branch Code" to "Code" in `TestCases_Branch.md` and `TraceabilityMatrix.md` |
| Suite Manifest | Remove the stale "expected to fail" note for TC-BR-052 |
| `knownRejectedBranchCode` | If BRN466 is ever approved, TC-BR-054 will name it and say what to change |

## 12. Approval Status

**Pending Automation Approval (§15).** Covers both passes run this session. The suite may not merge to the baseline until it clears that gate.

---

## Addendum to both 2026-08-15 passes — full-suite verification blocked, and a JDK correction

**Added 2026-08-15T15:45. This does not change any repair, any verdict, or any confidence figure.**

### 1. The requested full-suite run did not happen

A full 29-test run was launched at 15:35 to confirm `CreateBranch_Admin_TC` and `UpdateBranch_TC` were
unaffected by this session's work. **It produced no test results.** Authentication failed, so TestNG
skipped every test method:

```
Tests run: 87, Failures: 3, Errors: 0, Skipped: 84
TestBase.setUp:37 -- Timeout waiting for the URL to leave /auth/login (30s, three attempts)
```

Classified **Environment Failure** (§5) — not eligible for healing, and no repair was proposed. The
server answers (`HTTP 200`), the page loads, and the login submission never redirects. Login worked
normally for every run up to 15:33, and nothing this session touched `LogIn_Page`, `TestBase`, or
authentication.

**Leading hypothesis, unconfirmed:** roughly 40 separate logins were performed against the one QA
account today, since every test builds its own driver and authenticates. Lockout or rate limiting
would match this signature exactly. It was not confirmed, because confirming it means more login
attempts against an account that may already be limited. Testing stopped instead.

Full record: `execution/ExecutionResults.rerun-26.md`.

### 2. What remains unverified

| Suite | Status |
|---|---|
| `SearchBranch_TC` | **Verified** — `rerun-25`, 11 tests, 10 passing, 15:33 |
| `CreateBranch_Admin_TC` | **Unverified since the refactor and both healing passes.** Last confirmed 13:24 today, 3 targeted tests |
| `UpdateBranch_TC` | **Unverified since the refactor and both healing passes.** Last confirmed 13:24 today, 2 targeted tests |

Neither healing pass modified either of those classes. The refactor earlier in the session did touch
`CreateBranch_Admin_TC` and `UpdateBranch_TC`, and those changes were verified at the time. What has
not been done is a single clean run of everything together.

### 3. JDK correction

Both passes' artifacts recorded the runtime as **Java 21**. That was carried over from this module's
earlier run records and was never verified for these runs.

**Every run this session used Java 24.0.1**, confirmed by `mvn -version` (`runtime:
C:\Program Files\Java\jdk-24`) and by the Selenium capabilities block in `rerun-26`'s report
(`java.version: '24.0.1'`). All six occurrences are corrected in place, in
`ExecutionResults.rerun-24.md`, `rerun-25.md`, and both 2026-08-15 sections of this file and
`BeforeAfterComparison.md`.

This matters here more than it would elsewhere: this module's own history treats the JDK as a
variable that changed which tests failed (`rerun-16` under Java 24 versus `rerun-19` under Java 21).
An unverified runtime claim would have made those comparisons unsound.

**No repair verdict depends on the JDK.** Every fix in both passes was confirmed by a live rerun on
the same runtime that produced the failure it addressed.

---

# Healing Pass — 2026-08-17 (`HEAL-BR-20260817-01`)

**The first self-healing pass run against a Promoted module.** The code repaired here lives in the
Workspace Automation Baseline, not in a module working copy — that copy was retired earlier the same
day (`automation/automation_promotion.md`).

## 1. Healing Metadata

| Field | Value |
|---|---|
| Healing Pass ID | `HEAL-BR-20260817-01` |
| Module | `branch` (state `Promoted`, `sourceOfTruth: baseline`) |
| Suite location | `platform_core_data/automation_baseline/shaft/tests_SHAFT/` — resolved via `automation_lifecycle/cli.js resolve-root`, never hardcoded |
| Run Folder | `run-003__2026-08-04_11-24-38__UserStory__US-8599-SearchActions_US-8606-UpdateBranch` |
| Rerun record | `execution/ExecutionResults.rerun-30.md` |
| **Evidence source** | **External reports (§4.2)** — no Stage `5A` run produced these failures |
| Reports read | 3 runs: operator IDE run 12:19 (29/31), platform Headed 11:36 (31/31), platform A/B 11:16 (2/2) |
| Invocation | Human, explicit, in-session |
| Scope | `tcBr055`, `tcBr065` only |

## 2. Eligibility Summary

| Failure | Derived classification | Eligible? |
|---|---|---|
| `tcBr055_editPenOpensUpdateBranchPreFilled` | **Derived — Automation Failure** | Yes |
| `tcBr065_updateBranchPreFillsEveryStoredValue` | **Derived — Automation Failure** | Yes |

Both classifications were **derived**, presented to the human as derived, and approved as part of the
batch gate. The evidence behind each: the Allure step attachments recorded the City/State dropdown
carrying class `p-placeholder` with empty text at the moment of the read, while sibling text inputs in
the same form held real values.

**Not the application's fault, and that was checked before anything was touched.** The §8 prohibition
was the open question for most of this pass: if the application simply never populates City/State for
that record, the tests were correctly reporting a real defect and must not be "repaired". Two pieces
of evidence closed it — the field was observed entering `"loading..."` (so a fetch was genuinely in
flight), and the same field read `"Cairo"` in the 31/31 run earlier that day. The value does arrive;
the test was reading too early.

**Change-side vs baseline (§4.3):** not meaningfully applicable here. The §4.2 fallback exists for a
human who wrote new tests in their own IDE; in this case the human ran platform-generated code that
had not changed since the promotion. Both failures are in pre-existing code, and both were taken in
scope on the human's explicit instruction rather than by the change-side rule.

## 3. Per-Failure Analysis

### Root Cause Confidence

**Medium at first, deliberately.** The report evidence alone caps derivation at Medium (§4.2), so the
pass proposed **diagnosis, not repair**, and no code was touched until the failure had been reproduced
live. That gate did real work here — it is what forced the question of whether the application was at
fault.

**High after live reproduction.** Two diagnosis runs, one Headed and one Headless, both reproduced the
failure with timestamped instrumentation.

### Root cause

`UpdateBranch_Page.waitUntilLoaded()` waited for the City and State dropdown labels to stop reading
the literal string `"loading..."`. A dependent PrimeNG dropdown passes through three states in order:

```
""   ->   "loading..."   ->   the stored value
```

An empty label is not the string `"loading..."`, so the condition was **already satisfied in the first
state** and the wait released before the fetch had even started. Proven directly:

```
waitUntilLoaded resolved t=697ms  cityLabel=""  cityPlaceholder=true
city()          t=498ms sinceLoaded  value="loading..."  placeholder=true
```

498 ms *after* the form was declared ready, the field entered the loading state.

**This was an ordering defect, not a slow-load defect.** The distinction matters: lengthening the
timeout — the obvious first instinct — would have changed nothing at all, because the wait was
exiting immediately rather than expiring.

`REPAIR-BR-012` (2026-08-14) addressed the same area and was correct about the `"loading..."` state.
It watched the wrong edge of it.

### Strategies enumerated

| Option | Strategy | Risk | Confidence |
|---|---|---|---|
| **A** *(selected)* | Wait for the `p-placeholder` class to clear on City and State, each independently | Low | **88%** |
| B | Wait for the label text to be neither empty nor `"loading..."` | Medium | 72% |
| C | Two-phase wait: wait to enter the loading state, then to leave it | Medium | 65% |
| D | Read the bound value from the DOM instead of the label text | High | 60% |

**Why A.** `p-placeholder` was observed present in **both** unready states, and PrimeNG removes it only
when a real value is bound. The condition therefore *means* "a value is selected" rather than
approximating it through label text — and no future label string can slip through the way `""` did.
B keeps the dependency on text that caused the bug. C replaces one race with another. D is the most
robust long-term but changes read methods many other tests depend on, which is disproportionate.

Each dropdown is waited for **separately**, per `REPAIR-010`: in the same Headless run State already
read `"Cairo"` while City was still empty.

### Confidence derivation (§9.2)

| Factor | Contribution | Cited evidence |
|---|---|---|
| Root cause directly observed | 55% | `[DIAG-SYNC]` timestamps, both modes |
| Repair targets that observed cause | +15% | Condition changed to the state that was observed differing |
| Reproduced more than once, same signature | +10% | 4 runs: operator 12:19, platform Headless 10:41, diagnosis Headed + Headless |
| Repair KB `REPAIR-010` matches the pattern | +10% | Dependent-dropdown readiness, confirmed prior art |
| Static verification clean | +5% | `mvn test-compile`, 0 errors |
| **Total** | **90%** | Capped below 95% until the rerun confirmed it |

## 4. Applied Repairs

**One file: `src/main/java/AdminPages/Admin/Branch/UpdateBranch_Page.java`.** Ownership verified with
`cli.js check-ownership --module branch` before the change: `owned`, with no `shared` and no `foreign`
path touched.

Two lines added to `waitUntilLoaded()`:

```java
waitFor(LOAD_TIMEOUT).until(d -> !hasClass(CITY_DROPDOWN_LABEL,  "p-placeholder"));
waitFor(LOAD_TIMEOUT).until(d -> !hasClass(STATE_DROPDOWN_LABEL, "p-placeholder"));
```

The existing `"loading..."` conditions were **kept**. They are redundant under the placeholder
condition, but removing them is an unrelated change.

**No assertion was changed.** This alters *when* the test reads, never *what* it asserts. Where a
record genuinely has no City or State, the bounded wait expires and the caller's own assertion fails
with its own message — nothing passes that should not (§8.1).

## 5. Rerun Outcome

See `BeforeAfterComparison.md` and `ExecutionResults.rerun-30.md`. Both repaired tests passed in three
independent runs across both modes. The full-suite regression left `tcBr065` unverified because an
intermittent login failure skipped its whole class; a dedicated `UpdateBranch_TC` run completed it,
5/5 passed.

## 6. Reclassifications

None. Neither failure turned out to be an Application Failure — though that was the live question
until the diagnosis runs answered it.

## 7. Disclosed Discrepancies

None. No automation-vs-test-case disagreement arose.

## 8. Quarantine

None. Neither test reached the attempt limit; both are first-attempt repairs.

## 9. Knowledge Recorded

`REPAIR-BR-013` recorded below. Promotion to Platform Knowledge proposed — see §12.

## 10. Health Impact

| Dimension | Before | After |
|---|---|---|
| **Application Health** | — | **Unchanged.** No assertion weakened, removed, widened, or skipped |
| **Automation Health** | 2 failures in the Update Branch pre-fill path | **0** |

## 11. Recommendations

Three items are left open by this pass, and none of them is the repair:

1. **`tcBr061_navigateToLastPage`** failed in the regression — "the result set does not contain
   multiple pages". Data-dependent, and it does not open the Update Branch screen, so the repaired
   code path cannot reach it. Needs an isolating run to separate cause from coincidence.
2. **`tcBr057_rejectPendingBranchFromResultsGrid`** failed in the same regression — a self-created
   branch was not found on the grid. Same reasoning, same recommendation.
3. **The intermittent login failure** (`#id-Username` not found) cost five tests in the regression and
   then did not recur. It is the highest-value thing to investigate next: it can void any full-suite
   result at random, which makes every green run harder to trust.

**A note on the two failures above.** Both passed in the 31/31 run earlier that day, so they are new
relative to it. The code path says the repair cannot reach them. One run does not establish causation
in either direction, so they are recorded as open rather than attributed — to the repair or away from
it.

## 12. Approval Status

**The repaired suite is `Pending Automation Approval`** (§15). Stage `4A`'s approval covered the code
as it was before this pass. Because `branch` is Promoted, there is no merge to hold back — the change
is already in the only copy that exists — so the gate applies to *recording* the change, and the
in-place baseline update is not recorded as approved until a human approves it.

---

## Confirmed Repair Record — `REPAIR-BR-013`

```
Implements Platform Pattern:  REPAIR-010 (extends it — see below)
Execution Context:            EXEC-BR-20260817-5H-01 · BranchModuleSuite ·
                              TC-BR-055, TC-BR-065
What Happened:                A readiness wait keyed on a transient status STRING released before the
                              field began loading, because the field's initial empty state also
                              satisfied "not loading". Re-keying the wait onto the class that marks
                              "no value bound" (p-placeholder) fixed both tests in both modes.
```

**Relationship to `REPAIR-010`.** `REPAIR-010` says to wait for each dependent field's own loading
placeholder to clear, and that is right. This pass found that implementing it against the *text* of
the loading state leaves a hole: the state before loading also satisfies "not loading". The general
lesson extends `REPAIR-010` rather than replacing it — **wait on a signal that changes when the value
binds, not on the absence of a transient status string.**
