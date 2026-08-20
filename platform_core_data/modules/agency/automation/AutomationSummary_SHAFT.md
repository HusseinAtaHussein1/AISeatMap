# Automation Summary — `agency` / SHAFT

The Standard Output Contract's eight sections (§25). This is the document Stage `5A` reads first.

| Field | Value |
|---|---|
| Module | `agency` |
| Run | `run-004__2026-08-17_14-35-25__UserStory__US-4222-UpdateAgency` |
| Stage | `4A` — Automation (generation) |
| Framework | SHAFT Engine 7.4.20231015 · Java 17 · TestNG · Allure |
| Module state | **`Generated`** |
| Written | 2026-08-18 |

## 1. What Was Done

Generated a standalone, compiling SHAFT automation package for the `agency` module covering the **18**
dual-approved cases from `TestCases_Agency.md` revision 3 — 3,703 lines of Java across 16 new files, plus
a module-scoped suite file, externalised baseline data, and four synthetic upload fixtures.

Before any code was written: the target root was resolved by tool, the project was seeded from the promoted
baseline via `copy-in`, both knowledge bases were read, the stack was detected from `pom.xml`, **49 locators
were verified live and headless against the running application**, and the Automation Plan was written and
approved.

**The suite was not executed.** Stage 4A never executes; that is Stage `5A`'s responsibility.

## 2. Scope Covered

| | |
|---|---|
| Cases in the approved Stage 3 suite | 60 |
| Dual-approved (`Review` **and** `Automation` = Approved) | **18** |
| Fully automated | **16** (89%) |
| Partially automated | 2 — TC-AGENCY-002, TC-AGENCY-059 |
| Not automated | 0 |

The other 42 cases carry recorded human decisions (`Rejected`, or one still `Pending`). They are **not
coverage gaps** and are never reported as such.

## 3. Key Decisions

| Decision | Made by | Substance |
|---|---|---|
| Framework · package location · execution mode · fixture path | **Operator**, at the gate | SHAFT/Java 17 · module working copy · Headless · Stage 1's recommended fixture path |
| Seed shared infrastructure via `copy-in` | **Operator** | `automation_baseline/shaft/shared/` does not exist; `copy-in` satisfies "reuse, don't duplicate" *and* "don't touch the baseline" |
| **One Agency for the entire execution** | **Operator**, at approval | 2 permanent STG records per run instead of 34. Recorded as Plan §5.1 |
| Compose beside `BranchProvisioner` rather than extend it | This stage | Needed **zero** Branch file changes — stricter than the Plan's letter, truer to its intent |
| Reach the Update form only via the row's edit pen | Live evidence | A deep link renders an empty shell whose locators still resolve |
| Readiness = spinners clear **and** fields visible | Live measurement | Values bind ~1.5 s *before* the UI is visible |

## 4. Findings and Verification Results

**Three live-verified facts changed the generated code**, each caught here rather than in Stage 5A:

1. **`/admin/agency/edit/{id}` renders an empty shell** — 246 characters of body text, every field blank, no
   product-access table, *while every locator still resolves*. A deep-linked test reads blanks without error
   and reports a false defect. There is no URL entry point in `UpdateAgency_Page`, by design (REPAIR-004).
2. **The form's values bind ~1.5 s before it becomes visible**, behind two spinners. At t=1500 ms: values
   bound, 0 of 72 inputs visible. At t=3000 ms: 69 visible, 0 spinners. A wait on "fields hold values" is a
   **false readiness signal** — it was invalidated *my own* first verification pass, which I discarded
   (REPAIR-014).
3. **`id-Postofficebox` vs Branch's `id-PostOfficeBox`.** The `#id-<FieldName>` convention transfers between
   modules; its casing does not.

**Two additional structural facts came from verifying the Add form**, which Discovery had captured labels for
but never element ids:

4. **29 Payment option checkboxes, of which 26 are personal first names or single letters** —
   `-Edgardo`, `-Filomena`, `-Astrid`, `-m`, `-f`. FINDING-011 confirmed and, for the first time,
   **quantified**.
5. **`#id-AccountNumber` and `#id-Bankname` exist on the Add form but not on Update.** The two locators
   reported "unverified" earlier are more precisely *absent from Update, present on Create*.

**Verification totals:** 47 of 49 Update-form locators unique; the full 74-control Add-form inventory
enumerated with **zero non-GET requests issued** — proof the pass was read-only.

**TC-AGENCY-055 was unblocked rather than deferred.** The PCC section renders on no ordinary agency; five
were scanned read-only until `AGN9767` rendered it, confirming `#id-ManagerName` visible, **read-only**, and
carrying an inherited value — exactly as FINDING-009 predicted.

## 5. Risks and Limitations

| Risk | Severity | Handling |
|---|---|---|
| Fixture build failure fails **all 18** tests | **High**, accepted | Direct cost of §5.1's single fixture. `AgencyFixture` fails fast naming the stage, and remembers the failure rather than retrying 17 times |
| Cross-test interference via the shared record | **High** | Explicit `priority` ordering; each test restores what it wrote |
| **A rejected Agency may not be resubmittable** | **High** | Unverifiable read-only — it needed a rejection on a record this run did not create, `Forbidden (absolute)`. Chain ordered reject-first; TC-048/050 skip with the assumption **named** |
| Uploaded-filename / logo-preview locators unverified | Medium | Disclosed in code and in every failure message |
| TC-020, TC-023 expected to fail | By design | The failure *is* the finding. **Must not be repaired into passes** |
| `State`/`City` cannot be cleared | Medium | Reported as partial, not simulated |

## 6. Security Items — reported, not acted on

1. **Plaintext STG Super Admin password in committed source** (`EnvironmentConfig.java`). Pre-existing;
   `BrowserSession`'s own Javadoc notes the credential appears in a public breach corpus (`KL-03`). The file
   is `shared`, so it was **proposed, not edited** (P-3). Rotation is an operator decision.
2. **`BrowserDriver.authenticate()` times out headless** although login succeeds (`200`,
   `redirect:/Dashboard/dashboard`, marker visible in ~1.5 s). Shared Stage-2 tooling, so **reported, not
   fixed** (P-4).

This run's own conduct: no credential value was typed into a tool call, printed, or written to observability
metadata; verification dropped the reference before its first navigation.

## 7. Verification Evidence

`platform_core_data/modules/agency/automation/evidence/selector_verification/` — three locator JSONs, the
read-only Add-form verification script, and four headless screenshots (update form, agency list, PCC
section, add form).

Build verified twice: `mvn -o compile` and `mvn -o test-compile`, both clean.
`check-ownership --module agency` returns `allowed: true` with **every list empty** — nothing was written to
the shared baseline, exactly as instructed.

## 8. Handoff to Stage 5A

**Read `AutomationSuiteManifest_SHAFT.md` first.** It carries the run command, the mandatory execution order
and why it binds, the fixtures created at runtime, the expected-failure and expected-skip lists, and the
safety constraints still in force.

```bash
cd platform_core_data/modules/agency/automation/tests_SHAFT
mvn test -DsuiteXmlFile=testng-agency.xml
```

Three things Stage 5A must not do:

1. **Do not run `mvn test` bare** — `testng.xml` includes the `branch` module.
2. **Do not split the suite or parallelise it.** TestNG scopes `priority` to the `<test>` tag, so splitting
   silently discards the ordering the shared fixture depends on.
3. **Do not ask this stage whether to run Headed or Headless.** Ask the operator. The standing rule is that
   the question is put before *every* execution and never carried over.

**Awaiting the Stage 4A approval gate.** The module state is `Generated`; approval authorises the
module-scoped run, and only after that the baseline assembly.
