# Automation Plan — `agency` / SHAFT

> **2026-08-23 architecture refactor addendum (after this plan's generation).** A pure architecture
> refactor was applied on top of the generation this plan describes: no behaviour change, no new live
> verification, no live execution. `Agency_Common` → removed, split into `utilities/PrimeNgHelper.java`
> (PrimeNG technical behaviour) plus page-owned members; fixed locators extracted into
> `AddAgency_Locators` / `SearchAgency_Locators` / `UpdateAgency_Locators` / shared `AgencyForm_Locators`;
> `AgencyProvisioner` + `SupplierBranchProvisioner` + the old `AgencyFixture` → consolidated into one
> `src/test/java/utilities/AgencyFixture.java` (moved out of `AdminPages.Admin.Agency`); the Branch
> create-fallback retired — the configured known Branch is now a read-only standing precondition;
> `agency_baseline.properties` + `AgencyTestData.java` → `src/test/resources/testDataFiles/agency/agency-data.json`
> via a new generic `Generic_Classes/JsonDataReader.java`; `BranchSupplierGrid.java` deleted as dead code.
> All REPAIR-AG-* mechanisms below are preserved verbatim in their new location. See
> `AutomationSummary_SHAFT.md`'s banner for the full list.

| Field | Value |
|---|---|
| Module | `agency` |
| Produced by run | `run-004__2026-08-17_14-35-25__UserStory__US-4222-UpdateAgency` |
| Stage | `4A` — Automation (generation) |
| Project Context | `modules/agency/context/ProjectContext.md` rev 4, **Approved** |
| Manual Test Suite | `modules/agency/test_design/TestCases_Agency.md` rev 3, **Approved** — 60 cases |
| Written | 2026-08-18 |
| **Revised** | **2026-08-23 — the 2026-08-18 generation was REJECTED (see §0 below). This revision supersedes §5.1's single-fixture decision and records new live-verification findings. Generation is being redone from a clean re-seed of the baseline.** |
| Status | **Superseded — regenerating.** The Target Write Plan for the regenerated package is presented separately, per §11C.4, before any code is written under this revision |
| Operator amendment, 2026-08-18 (**superseded**) | ~~One Agency fixture for the entire execution~~ — see §0.2 |
| Operator amendment, 2026-08-23 (**current**) | **One Agency (+ its Branch dependency) per test CLASS** — 5 fixtures per execution instead of 1 (§0.2) |

## 0. Rejection and Regeneration (2026-08-23)

### 0.1 Why the 2026-08-18 package was rejected

A live Headed execution of the full `testng-agency.xml` suite showed `prepareSharedFixture` failing at
the Add Agency step for the shared fixture: the form never submitted (`[PROVISION] validation messages
= []`, `productAccessRows = 2`), and because §5.1 gave the whole suite **one** shared Agency, that single
failure skipped all 18 tests. Two candidate root causes were named at rejection time: (a) `clickVia`'s
synthetic `MouseEvent` dispatch not reaching the "Send For Approval" handler, or (b) a genuinely empty
mandatory field silently blocking submission (the application renders zero validation messages —
`FINDING-010`).

### 0.2 Re-verification findings (2026-08-23, live, headless, read-only)

Both candidates were re-checked live against the running Add Agency form before any new code was written
(§11A). Neither the old assumption nor the old diagnostic held up unedited:

**Finding A — the old diagnostic list was misleading.** The prior run's `[PROVISION] empty visible
fields` log named 8 fields: Company URL, Fax No, Address, Account Number, Bank name, Target, Reaching
Percentage, Warning Prompt (Days). Live inspection of every `label` on the form shows **7 of those 8
carry no `*`** — they are optional fields, and being empty was never a defect. **Only `Address` is
mandatory** (`Address *`, a `<textarea>`, confirmed `ng-invalid` on a pristine form alongside 15 other
starred fields: Branch, Agency, Country, State, City, Post office box, Contact person, Email ID,
Contract Start/End Date, Name, Invoice generation, Credit limit, Top up limit, Credit Terms (Days)). The
old diagnostic helper printed every empty field indiscriminately, optional or not, which is exactly the
noise that made root-causing this from the log alone impossible. **Root cause is (b): the mandatory
`Address` textarea was not actually holding a value at submit time** — most likely the same class of
defect `REPAIR-BR-013` already named for Branch (SHAFT/driver-issued text entry reporting delivered while
Angular's control stays `ng-pristine`), now confirmed to reach Agency's `Address` field too.

**Finding B — the button itself is not the suspect.** `"Send For Approval"` is a genuine native
`<button type="submit">` carrying PrimeNG's `pButton` directive (`<button pbutton="" type="submit"
class="p-element p-buttonp p-button-raised p-button p-component ...">`). This is structurally different
from the fake-div PrimeNG controls (`p-checkbox`, `p-dropdown`) that made `clickVia`'s synthetic
`MouseEvent` dispatch necessary for Branch (`REPAIR-BR-010`) — those need it because a driver-issued
click lands on a wrapper `div`, not the real control. A real `<button>` has no such wrapper problem.

**Decision, made on this evidence:** the new `AddAgency_Page.clickSendForApproval()` uses a **plain
SHAFT/WebDriver click**, not `clickVia`. `clickVia` (or the equivalent `typeVia` JS-assignment technique
already proven for Branch text inputs) is reserved for the form's actual PrimeNG dropdown/checkbox
controls, exactly as Branch already does. The new `AddAgency_Page.fillAddress(...)` must use `typeVia`
(JS value assignment + `input`/`change` dispatch, per `REPAIR-BR-013`) rather than a plain `sendKeys`,
and the fixture provisioner explicitly asserts the `Address` textarea's `value` is non-empty **before**
calling `clickSendForApproval()` — turning a silent submit failure into a named, diagnosable assertion
failure at the exact step that caused it, instead of a 15-second URL-poll timeout four call frames away.

### 0.3 Fixture strategy — superseded, per-class now (overrides §5.1 below)

**Operator decision, 2026-08-23: each test CLASS gets its own freshly-provisioned Agency and Branch —
not one Agency shared by all 5 classes/18 tests.** §5.1's "one shared Agency for the whole suite"
decision is superseded for this reason: under §5.1, `prepareSharedFixture`'s single failure skipped every
one of the suite's 18 tests, because there was exactly one fixture and every test depended on it. Per-
class fixtures contain a fixture failure to that one class's tests — the other 4 classes proceed
normally.

| | §5.1 (superseded) | §0.3 (current) |
|---|---|---|
| Fixtures per execution | 1 Branch + 1 Agency | **5 Agencies**, each beneath the class's own fixture call |
| Branch handling | 1 new Branch | **0 new Branches** — `SupplierBranchProvisioner` already reuses the known, pre-approved `BRN908` read-only (operator instruction, 2026-08-20); this is unchanged by the per-class decision and correctly carried forward from the restored code |
| Blast radius of a fixture failure | All 18 tests | Only that one class's tests (at most 5) |
| Permanent STG records per execution | 2 (1 Branch + 1 Agency) | **5** (5 Agencies, 0 new Branches) — cheaper than the original §5.1 estimate implied, not more expensive |
| Cross-test interference risk (§5.1's rules 1–2 below) | High — explicit reset/ordering required within the shared record | Eliminated **between classes**; still required **within** a class where more than one test shares that class's one Agency |

This trades STG record volume (10 instead of 2, still bounded and one-way per `PO-3`) for eliminating the
single point of failure that caused the 2026-08-23 rejection. The maker–checker ordering constraint
(§5.1 rules 1–2, the `Draft → Pending → Reject → Pending → Approve` chain) is unchanged **within**
`AgencyMakerChecker_TC`'s own class-scoped Agency — it is a same-class concern regardless of which
fixture scope wins.

**Everywhere below that still describes "the shared Agency" (§5.1) is superseded by this section.** §5.1
is left in place, unedited, as the record of what was tried and why it failed — not as instruction.

## 1. Target Framework and Language

| Field | Value |
|---|---|
| **Target Framework** | **SHAFT Engine 7.4.20231015** (pinned) |
| **Target Language** | **Java 17** |
| Test runner | TestNG (Surefire 3.1.2) |
| Reporting | Allure, via SHAFT |
| Stack record | [`StackDocumentationContext_SHAFT.md`](StackDocumentationContext_SHAFT.md) |

**Justification — the decision, not merely the recommendation (§31.4).** The Framework Decision Gate
was answered by the operator at the Stage 4A gate on 2026-08-18: **SHAFT Engine, Java 17**. The
recommendation offered alongside it was the same, on these grounds: the repository already holds one
authoritative SHAFT package (`automation_baseline/shaft/tests_SHAFT/`, 31 tests, `branch`, Promoted), so
this is *extend the existing framework's conventions* rather than introduce a second toolchain; and the
Selector Verification and Repair knowledge bases already hold SHAFT-shaped entries from run-002/003.
**Playwright's use for Discovery and for this stage's own selector verification carried zero weight**
(§6, §31.3) — the two are independent decisions.

**Strategy (§23) — Run Scope Type `User Story`.** Narrowest reading: automate only cases traceable to
US-4222's acceptance criteria, and do not opportunistically extend coverage to adjacent cases that
happen to share a suite file.

## 2. Project Architecture and Design Pattern

| Field | Value |
|---|---|
| **Project Architecture** | Page Object Model over a shared driver/session layer, with a provisioner layer for run-owned fixtures |
| **Design Pattern** | Page Object Model + Component Objects, composed; data factories for test data; TestNG for lifecycle |
| **Generation root** | `platform_core_data/modules/agency/automation/tests_SHAFT/` |
| Root resolution | `automation_lifecycle/cli.js resolve-root --module agency` returned `NO_AUTOMATION` (greenfield for this module); root taken from the operator's package-location decision, never hardcoded |
| Seeded from | `automation_baseline/shaft/tests_SHAFT` via `copy-in`, `baselineRef` **`c072129`** |

**Where this generates, and where it must not.** The shared baseline is `branch`'s single source of
truth (`branch` is `Promoted`). **This run writes nothing to it.** `branch`'s code rides along inside
the seeded working copy and is never run, modified, or merged back; only `agency`-owned paths merge on a
future approval. `testng-branch.xml` is left untouched and a separate `testng-agency.xml` is added.

**Standalone-ness (§11D.1): Yes.** The seeded project carries its own `pom.xml`, SHAFT
`properties/`, `environment.properties`, and TestNG suite, so it compiles and runs alone — which is
what makes the approval gate a real review rather than a formality.

### 2.1 Architecture Deviations vs. `automation-skill` §8.1 (2026-08-23 addendum)

The current specification's §8.1 names a Maven layout with `AdminPages/`, `Drive_Factory/`,
`Generic_Classes/`, and `utilities/` as sibling roots under `src/main/java`, and a
`DBs_Query_Execution/`/`org/example/` pair under `src/test/java`. **The actual, authoritative baseline
this project was seeded from (`automation_baseline/shaft/tests_SHAFT`, `branch`, Promoted) does not use
that exact layout** — it uses `AdminPages/Admin/{Module}/` for both Page and Locator-bearing classes
(locators live as `private static final By` fields inside the Page class itself, not in a separate
Locator Class per §8.3), `AdminPages/Login/` for auth, and a flat `utilities/` package; there is no
`Drive_Factory/`, `Generic_Classes/`, `DBs_Query_Execution/`, or `org/example/`. Per §8.13 and §32.5's
precedence rule ("an approved existing or Reference project architecture takes precedence when
explicitly documented"), **the baseline's actual convention governs this regeneration** — classified
`Preserved (approved convention)`. This regeneration does **not** introduce a separate Locator Class per
Page Class (§8.3's ideal), because doing so for only the newly-generated Agency package while every
existing Branch class keeps locators inline would leave one module's code shaped differently from every
other module's in the same Maven project, which is a worse outcome than the deviation itself. This
deviation is reported here rather than silently corrected or silently followed without comment, per
§8.13's mandatory-disclosure rule.

**Optional Abstractions (§5, §8.11): None.** No workflow, service, assertion class, Component Object
package, data factory, builder, adapter, module-specific `BasePage`, or one-method wrapper is generated.
`Agency_Common` (§5) mirrors `Branch_Common`'s existing, already-precedented role as a shared
section-helper base class for one module's Page classes — an existing convention being matched, not a
new layer being introduced.

## 3. Planned Automation Suites (§10)

Organised by **business workflow**, never by screen.

| Suite | TestNG file | Workflow | In-scope cases |
|---|---|---|---|
| **Agency Update — Field Persistence** | `testng-agency.xml` | Edit a run-owned Agency's sections and confirm the values persist through submission | TC-001, 011, 012, 044, 053 |
| **Agency Update — Validation** | same | Mandatory-field and format behaviour on the Update form | TC-002, 021, 037 |
| **Agency Update — Documents & Logo** | same | Upload, contract dates, and file-type behaviour | TC-016, 020, 022, 023 |
| **Agency Update — Inheritance & Read-only** | same | Values inherited from Branch/Supplier, and controls that must not be editable | TC-055, 059 |
| **Agency Maker–Checker** | same | The full approval workflow on a run-created record | TC-047, 048, 049, 050 |

Five suites, one per workflow, sharing setup/teardown/fixtures via `TestBase` and the provisioners.

## 4. Existing Assets (§9) — reused, not regenerated

Inspected in the seeded working copy. **Reuse before generating is the default, not a preference.**

| Asset | Path | Use |
|---|---|---|
| `TestBase` | `src/test/java/AdminPages/Login/TestBase.java` | Driver lifecycle + Super Admin login. Agency test classes **extend** it and override `navigateToStartScreen()` |
| `LogIn_Page` | `src/main/java/AdminPages/Login/LogIn_Page.java` | Authentication. Reused unchanged |
| `BrowserSession` | `src/main/java/utilities/BrowserSession.java` | The only sanctioned driver construction. Reused unchanged |
| `EnvironmentConfig` | `src/main/java/utilities/EnvironmentConfig.java` | Env values + credentials. **Extended** with agency routes (§5) |
| `BranchProvisioner` | `src/test/java/AdminPages/Admin/Branch/BranchProvisioner.java` | The provenance-tag → submit → read-back-code pattern. **Extended** for `PO-14` (see §5) |
| `AddBranch_Page` | `src/main/java/AdminPages/Admin/Branch/AddBranch_Page.java` | `fillMandatoryBaseline(skipSet)` reused to build the fixture Branch |
| `SearchBranch_Page` | `src/main/java/AdminPages/Admin/Branch/SearchBranch_Page.java` | Branch lookup by name/code with status filter. Reused |
| `BranchDataFactory` | `src/main/java/utilities/BranchDataFactory.java` | Unique-value generation. Reused |
| `pom.xml`, SHAFT `properties/`, `environment.properties` | project root / resources | Build + config. Reused; `environment.properties` gains agency paths |

**Nothing above is duplicated into an agency-specific twin.** That was the whole point of seeding from
the baseline rather than hand-copying eight shared files (§11D.2 — duplicating an auth fixture five ways
guarantees five drifts).

## 5. Assets To Generate

| Asset | Path | Why nothing existing covers it |
|---|---|---|
| `UpdateAgency_Page` | `src/main/java/AdminPages/Admin/Agency/` | No Agency page object exists. Carries the 44 verified locators and the two mandatory mechanics: reach-via-pen (`REPAIR-004`) and spinner-plus-visibility readiness (`REPAIR-014`) |
| `AddAgency_Page` | same | Needed to build `{AGENCY_UNDER_TEST}`. Create Agency is **in scope as a means only** — nothing about it is asserted |
| `SearchAgency_Page` | same | Grid read, row identity, and the row action icons (`pi-pencil`, `pi-thumbs-up`, `pi-thumbs-down`) |
| `Agency_Common` | same | Shared section helpers, mirroring `Branch_Common`'s role |
| `AgencyProvisioner` | `src/test/java/AdminPages/Admin/Agency/` | Builds `{AGENCY_UNDER_TEST}` under `{BRANCH_UNDER_TEST}`, tags it, reads back its Agency Code, and proves identity per row |
| `AgencyFixture` | same | Orchestrates the `PO-14` build order: Branch (2+ suppliers) → submit → **approve** → Agency |
| `AgencyDataFactory` | `src/main/java/utilities/` | Unique, synthetic agency field values |
| 5 test classes | `src/test/java/AdminPages/Admin/Agency/` | One per suite in §3 |
| `testng-agency.xml` | project root | Module-scoped suite, so Stage `5A`/`5H` can run `agency` alone |
| Upload fixtures (4 files) | `src/test/resources/testDataFiles/agency/uploads/` | `PO-4`: synthetic, non-sensitive. Operator confirmed this path at the gate |

**Extension of an existing asset, planned and recorded rather than done as a side effect (§11):**
`BranchProvisioner` currently leaves a Branch in `Pending for approval`. `PO-14` needs an **approved**
Branch carrying **two or more suppliers with credentials**, because `BR-006` makes that the precondition
for the PCC section existing at all. The extension adds an approve step and multi-supplier selection.
It is additive — the existing `createPendingBranch` behaviour is unchanged, so `branch`'s 31 tests are
unaffected.

### 5.1 Fixture scope — ONE Agency for the whole execution

**Operator decision at the approval gate (2026-08-18): a single run-created Agency serves every
in-scope case. Not one Agency per test case, and not one per suite.**

| | |
|---|---|
| Fixtures built per execution | **One Branch** (approved, 2+ suppliers) and **one Agency** beneath it |
| Built by | `AgencyFixture`, at **suite** scope — `@BeforeSuite`, once per execution |
| Shared by | All 17 generated tests across all five suites in §3 |
| Records created on STG per execution | **2** (1 Branch + 1 Agency) |

This is cheaper and it matches `PO-3` — STG has no DELETE, so every extra fixture is a permanent
record. Provisioning per test case would have created 17 Agencies and 17 Branches on every execution.

**What this costs, stated rather than discovered in Stage `5A`:** the tests are no longer mutually
independent. Two rules follow, and the generated code enforces both.

1. **No test may leave the shared Agency in a state another test depends on not being in.** Every
   field-persistence and validation case must **reset the fields it touched** before it ends, or assert
   only on fields no other case writes. The suite is ordered explicitly (TestNG `priority`), never left
   to declaration order.
2. **The Maker–Checker suite has a genuine ordering constraint, because `Send For Approval`, `Approve`
   and `Reject` are state transitions on the one record — not repeatable actions.** TC-047 is read-only
   and unaffected. TC-048/049/050 must chain:

   ```
   Draft ──Send For Approval──▶ Pending ──Reject──▶ ? ──Send For Approval──▶ Pending ──Approve──▶ Approved
   ```

**The `?` is an unverified assumption and the single largest risk this amendment introduces.** Whether a
**rejected** Agency returns to an editable/resubmittable state is **not** established by Discovery, and
could not be verified in §11A because verification is strictly read-only — confirming it would have
required rejecting a record this run did not create, which the safety policy makes
`Forbidden (absolute)`. Two outcomes:

- **Rejected → resubmittable:** the whole chain runs on the one Agency, exactly as instructed.
- **Rejected → terminal:** the chain breaks after TC-049. The approve path then has no eligible record.

**Resolution in the generated code:** the chain is ordered **reject before approve**, and
`AgencyFixture` asserts the post-reject state explicitly. If the record is terminal after rejection,
TC-050 reports a **blocked precondition naming this exact assumption** — it does **not** silently pass,
and it does **not** provision a second Agency to work around the operator's instruction. Unblocking it
is then a one-line operator decision (allow a second Agency for the approve path), taken on evidence
instead of pre-emptively.


## 6. Estimated Automation Coverage — before generation

Scope was the **18 dual-approved cases** (`Review = Approved` **and** `Automation = Approved`) at the time
this Plan was written. The other 42 were out of scope by recorded human decision, not by omission.

> **Correction, 2026-08-24.** TC-AGENCY-055 was rejected by explicit operator direction after Stage 5A's
> execution found no `@Test` method had ever been generated for it, despite this Plan projecting it below.
> Current scope is **17**; see `AutomationCoverageReport_SHAFT.md` §1 for the corrected arithmetic. This
> section is left as originally written — a projection, not restated to match the outcome (§6's own stated
> discipline, carried through consistently by this correction).

| Projected decision | Count | Cases |
|---|---|---|
| **Generate New Automation** | **17** | TC-001, 002, 011, 012, 016, 020, 021, 022, 023, 037, 044, 047, 048, 049, 050, 053, **055** *(rejected 2026-08-24 — see correction above)* |
| **Reuse Existing Automation** | 0 | No existing Agency automation exists to reuse |
| **Partially Automatable** | 1 | TC-059 — see §8 |
| **Manual Only** | 0 | — |
| **Blocked** | 0 | TC-055 was unblocked during verification — its three PCC locators are confirmed on `AGN9767` (Selector Verification Report §4.2) |

**Projected: 17/18 = 94% fully automated**, 1 partial (TC-059), 0 blocked. These are projections; the binding
per-case decisions land in the Decision Report after generation.

## 7. Assets To Reuse — mapping

| In-scope case | Reuses | Generates |
|---|---|---|
| All 18 | `TestBase`, `BrowserSession`, `LogIn_Page`, `EnvironmentConfig` | — |
| TC-048, 049, 050 | `BranchProvisioner` (extended), `AddBranch_Page`, `SearchBranch_Page` | `AgencyFixture`, `AgencyProvisioner` |
| TC-016, 020, 022, 023 | — | Upload fixtures + `UpdateAgency_Page` upload helpers |
| TC-002, 021, 037 | — | Validation assertions against the three confirmed strings |

## 8. Known Manual / Partial Tests

| Case | Decision | Reason |
|---|---|---|
| **TC-059** — Branch is read-only | **Partially Automatable** | `#id-Branch` is `readonly` **and** `disabled`, but `isVisible()` is `false` — the underlying input is hidden and the value is presented by the PrimeNG wrapper. Asserting on the hidden input would pass trivially against something no user can see. The assertion target must be the **visible wrapper**, resolved and re-verified during generation. Automatable; the locator is not yet settled |

**No case in scope is `Manual Only`.** Notably, `Manual Only` is not used for anything a safety policy
merely forbids executing right now (§27A) — that distinction is preserved deliberately.

## 9. Blocked Tests — and the smallest thing that unblocks each (§27)

| Case | Blocked on | Minimal prerequisite |
|---|---|---|
| **Upload fixture files (4)** | The four synthetic files do not exist yet | Create them at `src/test/resources/testDataFiles/agency/uploads/` per the suite's §0.1 names. Blocks TC-016, 020, 022, 023 from *executing*, not from being generated |

**TC-055 is no longer blocked.** Its three PCC locators were verified on `AGN9767` during the same
read-only pass (Selector Verification Report §4.2), so it is generated rather than deferred. The one
remaining item below blocks *execution* of four cases, not their generation.

**No blocker stops the run** (§27 rule 1).

## 10. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| **Form readiness is a 3-second, spinner-gated race** | High — the single most likely source of intermittent failure. Values bind ~1.5 s *before* the UI is visible, so a naive wait yields invisible elements | The readiness predicate is fixed in `UpdateAgency_Page`: spinners clear **and** visible inputs > 50. `REPAIR-014` applied proactively, and this run already hit the trap once and discarded that pass |
| **Deep-linking the edit route silently yields an empty shell** | High — locators resolve, tests run, assertions are meaningless | `UpdateAgency_Page` has **no** direct-navigation entry point. Reach-via-pen only (`REPAIR-004`) |
| **Fixture build is long and multi-stage** | **High** — Branch create → submit → approve → Agency create runs **once**, before any assertion. Under §5.1's single-fixture rule a failure here fails **all 17 tests**, not one | `AgencyFixture` fails fast with an explicit provisioning message naming the stage that failed, mirroring `BranchProvisioner`'s discipline. The blast radius is accepted deliberately: the alternative creates 17 permanent STG records per execution |
| **Shared-fixture cross-test interference** | **High**, introduced by §5.1 | Every mutating test resets the fields it wrote; suite order is explicit via TestNG `priority`, never declaration order. A test that cannot restore state asserts only on fields no other case writes |
| **Rejected Agency may not be resubmittable** | **High** — breaks the TC-048→049→050 chain on a single record. Unverifiable read-only (§5.1) | Chain ordered reject-before-approve; TC-050 reports a **blocked precondition** naming the assumption rather than passing falsely or provisioning a second Agency |
| **Payment option list is live shared master data** | Medium — the count moved 28 → 29 between runs | Select **by label** (`#id-Paymentoption-Cash` etc.), never by index or count. `APP-002` |
| **Duplicate DOM ids across sections** | Medium — `#id-EmailID` ×2, `Phone Number` ×3 | Disambiguated by document order and **verified unique**, not assumed |
| **TC-020 is expected to fail** | Low, if understood | It asserts a requirement the application appears not to meet (FINDING-004: the document input declares no `accept`). Recorded in Known Limitations so nobody "fixes" it into a pass |
| **`BrowserDriver` is broken headless** | Low for this stage | Verification used an equivalent direct session. Reported, not worked around — it is shared Stage-2 tooling |
| **Plaintext credential in `EnvironmentConfig`** | **Security** | Pre-existing in the baseline and acknowledged in `BrowserSession`'s own Javadoc. Classified `shared`, so this run **proposes** rotation and does not edit it (§11D.2) |
| **Retention on STG** | Low | `PO-3`: records accumulate, no DELETE. Under §5.1 each execution creates exactly **2** records — 1 Branch + 1 Agency — and the Suite Manifest records their codes |

## 11. Assumptions

| # | Assumption | If wrong |
|---|---|---|
| 1 | The seeded working copy may hold `branch`'s code as long as nothing writes to, runs, or merges it back | Operator decision at the Stage 4A gate, 2026-08-18, taken with this consequence stated. Only agency-owned paths merge later |
| 2 | The `#id-<FieldName>` convention holds for the Add Agency form as verified on Update | Casing already differs between Branch and Agency (`#id-PostOfficeBox` vs `#id-Postofficebox`), so **every Add-form locator is verified live before use**, never inferred |
| 3 | `i.pi.pi-thumbs-up` appears on a row in `Pending for approval` | **Unverified** — no pending record existed to observe. TC-048's approve path re-verifies it against the run's own pending fixture before asserting |
| 4 | An approved Branch with 2+ suppliers makes the PCC section render on its child Agency | Confirmed by Discovery's controlled experiment (FINDING-008, Branch `BRN287` → Agency `AGN9799`), not by this stage. Re-verified at fixture build |
| 5 | `AUTH-BRANCH-*-SelfCreated` grants cover the fixture build | Recorded in the run's `metadata/SafetyAuthorizations.json`. **None carries beyond this run** |
| 6 | SHAFT 7.4.20231015's API surface is as the existing 31 passing tests use it | `context7` was unavailable, so this is the substitute authority — working code against the pinned version, not recalled API |

## 12. Traceability

Every generated script will cite its Test Case ID and inherit, unaltered, that case's Requirement /
Discovery / Finding / Evidence / Acceptance-Criteria / Run-Scope references from
`test_design/TraceabilityMatrix.md` (§12). This stage re-derives none of them.

## 13. What has NOT happened yet

- Plan **approved as-is** 2026-08-18 with the §5.1 single-fixture amendment. Generation authorised; assets are recorded in `AutomationManifest_SHAFT.md`, and it is complete as of this file.
- **No Target Write Plan has been approved** (§11C.4). Generation writes only inside
  `platform_core_data/modules/agency/automation/`; there is no Target Project projection in this run.
- **Nothing has been executed.** This stage never runs what it generates, and never repairs (§2).
