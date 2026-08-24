# Automation Suite Manifest — `agency` / SHAFT

Machine-readable handoff for Stage `5A`. Everything the Execution skill needs, in one place, so it never
has to interpret prose.

| Field | Value |
|---|---|
| Module | `agency` |
| Suite name | `AgencyModuleSuite` |
| Suite file | `testng-agency.xml` |
| Project root | `platform_core_data/modules/agency/automation/tests_SHAFT` |
| Module state | `Generated` |
| Framework | SHAFT Engine 7.4.20231015 · Java 17 · TestNG · Allure |
| Test count | 17 *(was stated 18; TC-AGENCY-055 rejected 2026-08-24 — never had a generated `@Test` method, see §5)* |
| Build verified | `mvn -o test-compile` clean |
| **Executed by Stage 4A?** | **No — never.** Stage 4A generates only |

## 1. Run Command

```bash
cd platform_core_data/modules/agency/automation/tests_SHAFT
mvn test -DsuiteXmlFile=testng-agency.xml
```

**Do not run `mvn test` without the suite file.** `testng.xml` is the whole-project suite and includes the
`branch` module's tests, which are outside this run's scope.

## 2. Execution Mode

**Headless**, per the operator's Stage 4A decision. Configured through SHAFT's own
`src/main/resources/properties/`, inherited from the baseline unchanged.

**Stage 5A must ask again.** The standing rule is that Headed vs Headless is asked before *every* execution
and never carried over from a previous run — this row records what generation targeted, not an authorisation
for the next run.

## 3. Execution Order — mandatory, not advisory

| Priority | Class | Tests |
|---|---|---|
| 6 | `AgencyInheritanceAndReadOnly_TC` | TC-059 *(priority 5, TC-055, was listed here but no `@Test` method was ever generated — rejected 2026-08-24)* |
| 10–50 | `AgencyUpdatePersistence_TC` | TC-001, 011, 012, 044, 053 |
| 60–80 | `AgencyUpdateValidation_TC` | TC-002, 021, 037 |
| 90–120 | `AgencyDocumentsAndLogo_TC` | TC-016, 020, 022, 023 |
| 200–230 | `AgencyMakerChecker_TC` | TC-047, 049, 048, 050 |

**Why the order binds.** The suite shares **one** Agency record (Automation Plan §5.1). The maker–checker
class drives it through one-way state transitions, so it must run last; the read-only cases must run first,
before anything has mutated the fixture.

**Do not split the suite into parallel `<test>` blocks or run classes independently.** TestNG scopes
`priority` to the enclosing `<test>` tag, so splitting silently discards this ordering.
Do not enable parallel execution.

## 4. Fixtures Created at Runtime

| Fixture | Count per execution | Provisioned by |
|---|---|---|
| Branch — approved, 2 credentialled suppliers | 1 | `SupplierBranchProvisioner` |
| Agency — beneath that Branch | 1 | `AgencyProvisioner` |

Both are created under run-tagged names (`QA_…`) and their application-assigned codes are read back and
identity-checked per row. **`PO-3`: STG has no DELETE, so both records are permanent.** The execution log
prints both identifiers — capture them in the Execution Summary.

**Provisioning failure fails all 18 tests**, by design: `AgencyFixture` remembers the failure instead of
retrying it 17 more times and littering the environment with partial records.

## 5. Expected Outcomes Stage 5A Must Not Treat as Bugs in the Suite

| Test | Expected outcome | Meaning |
|---|---|---|
| TC-AGENCY-020 | **Likely FAIL** | The document input has no `accept` attribute. The failure **is the finding** — do not repair it into a pass |
| TC-AGENCY-023 | **Possible FAIL** | The 2 MB limit is unverified (ASM-009). Record the observed threshold |
| TC-AGENCY-048 | **Possible SKIP** | A rejected Agency may not be resubmittable — §5.1's recorded assumption |
| TC-AGENCY-050 | **Possible SKIP** | Same cause as TC-048 |

**TC-AGENCY-055, previously listed here as Possible SKIP, was rejected 2026-08-24** by explicit operator
direction after Stage 5A's execution found no `@Test` method had ever been generated for it — it was never
in the runnable suite to begin with, under any Execution Mode. Row removed; see
`AutomationCoverageReport_SHAFT.md` §1 for the corrected scope.

A `SkipException` here carries a **named blocked precondition**. Record it as `Blocked`, never as `Failed`
and never as `Passed`.

## 6. Known Unverified Locators

| Locator | Used by | Consequence if wrong |
|---|---|---|
| Uploaded-file name labels | TC-016 | Test fails on the locator, not the behaviour. The failure message says so |
| Logo preview image | TC-022 | Same |

Neither could be verified read-only: doing so required uploading to a record this run did not create.

## 7. Safety Constraints Still in Force

- Every mutating action targets **only** the Agency this run created. Identity is proven per row before any
  action (`PO-2`).
- **Approve/Reject on a record this run did not create is `Forbidden (absolute)`.** No test does this.
- **Agency 949 (`AGN2 · Test Egypt`) is never touched** by any test in this suite.
- All test data is synthetic and non-sensitive (`PO-4`): RFC 2606 domains, reserved phone ranges.
- No credential value appears in any log line, assertion message, or observability metadata.

## 8. Handoff Completeness Check (§28)

| Stage 5A requires | Present? |
|---|---|
| Runnable project with its own build manifest | **Yes** — `pom.xml`, compiles standalone |
| Module-scoped suite file | **Yes** — `testng-agency.xml` |
| Explicit run command | **Yes** — §1 |
| Test-case → test-method mapping | **Yes** — every `@Test(description)` carries its TC ID |
| Fixture/provisioning description | **Yes** — §4 |
| Expected-failure list | **Yes** — §5 |
| Unverified-locator disclosure | **Yes** — §6 |
| Safety constraints | **Yes** — §7 |
| Environment + execution mode | **Yes** — §2 |
