# Automation Manifest — `agency` / SHAFT

| Field | Value |
|---|---|
| Module | `agency` |
| Framework | SHAFT Engine 7.4.20231015 · Java 17 · TestNG · Allure |
| Produced by run | `run-004__2026-08-17_14-35-25__UserStory__US-4222-UpdateAgency` |
| Target root | `platform_core_data/modules/agency/automation/tests_SHAFT` (resolved via `resolve-root`, **never hardcoded**) |
| Module state | **`Generated`** — Draft; source of truth is the module workspace |
| Seeded from | `automation_baseline/shaft/tests_SHAFT` @ `c072129a3ac2efc0a2da488d325e46d9034a60a3` via `copy-in` |
| Suite file | `testng-agency.xml` |
| Tests generated | **18** |
| Lines of Java generated | **3,703** across 16 files |
| Build | `mvn -o test-compile` — **clean, zero errors, zero warnings** |
| Executed? | **No.** Stage 4A never executes (§2). Running the suite is Stage 5A's responsibility |
| Written | 2026-08-18 |

## 1. Assets Generated

### 1.1 Page Objects — `src/main/java/AdminPages/Admin/Agency/`

| File | Lines | Role |
|---|---|---|
| `Agency_Common.java` | 314 | Abstract base. **Extends `Branch_Common`** rather than copying it. Adds the settled-form readiness gate, PrimeNG ancestor addressing, the field-scoped validation-message locator, and state reads (`readonly` vs `disabled`, kept distinct) |
| `UpdateAgency_Page.java` | 792 | The Update form. 44 verified locators, ~90 accessors. No URL entry point exists, by design |
| `AddAgency_Page.java` | 524 | The Create form. In scope **as a means only** — nothing about it is asserted |
| `SearchAgency_Page.java` | 295 | Agency list: grid reads, per-row identity, row action icons, the only sanctioned route to the Update form |
| `BranchSupplierGrid.java` | 147 | Row-indexed access to the Add Branch Product Access grid — the two-supplier capability `BR-006` needs and the Branch suite never had |
| `AgencyTestData.java` | 121 | Baseline fixture accessors; unset keys fail loudly rather than typing `"null"` into a field |

### 1.2 Test-side assets — `src/test/java/AdminPages/Admin/Agency/`

| File | Lines | Role |
|---|---|---|
| `AgencyTestBase.java` | 44 | Extends `TestBase`. Adds the shared-fixture hook without re-declaring the driver lifecycle |
| `SupplierBranchProvisioner.java` | 207 | Creates the **approved** Branch carrying **two** credentialled suppliers |
| `AgencyProvisioner.java` | 128 | Creates the Agency beneath it; proves identity per row before any action |
| `AgencyFixture.java` | 143 | Holds the **one** Branch + Agency pair for the whole execution (§5.1). Failure is remembered, not retried |
| `AgencyUpdatePersistence_TC.java` | 196 | 5 tests — TC-001, 011, 012, 044, 053 |
| `AgencyUpdateValidation_TC.java` | 214 | 3 tests — TC-002, 021, 037 |
| `AgencyDocumentsAndLogo_TC.java` | 158 | 4 tests — TC-016, 020, 022, 023 |
| `AgencyInheritanceAndReadOnly_TC.java` | 109 | 2 tests — TC-055, 059 |
| `AgencyMakerChecker_TC.java` | 247 | 4 tests — TC-047, 049, 048, 050 (in that order) |

### 1.3 Utilities and resources

| File | Role |
|---|---|
| `src/main/java/utilities/AgencyDataFactory.java` | Unique synthetic values. RFC 2606 domains, reserved phone range — nothing generated can reach a real mailbox, phone or host (`PO-4`) |
| `src/test/resources/agency_baseline.properties` | Baseline fixture data. Test data lives here, never inside a Page Object |
| `testng-agency.xml` | Module-scoped suite, **one `<test>` block** — see §3 |

### 1.4 Upload fixtures — `src/test/resources/testDataFiles/agency/uploads/`

Names match the Stage 3 suite's §0.1 fixture table exactly.

| File | Size | Used by | Why it is built this way |
|---|---|---|---|
| `AgencyContract_Doc1_valid.pdf` | 406 B | TC-016 | A genuine, minimal, structurally valid PDF with a real `%PDF` header |
| `AgencyContract_fake_extension.pdf` | 161 B | TC-020 | A `.pdf` **filename** whose bytes are plain text with **no** `%PDF` header. The name/content mismatch *is* the test |
| `AgencyLogo_valid.png` | 0.269 MB | TC-022 | Valid PNG, comfortably under the 2 MB limit, matching the suite's stated 0.27 MB |
| `AgencyLogo_oversize.png` | 3.164 MB | TC-023 | Structurally valid PNG padded with **random** bytes, so it is genuinely incompressible — a rejection can only be about size, never corruption |

## 2. Assets Reused Unchanged

**Nothing below was duplicated into an agency-specific twin.** That was the point of seeding via `copy-in`
rather than hand-copying shared files (§11D.2 — duplicating an auth fixture five ways guarantees five drifts).

`TestBase` · `LogIn_Page` · `BrowserSession` · `Branch_Common` · `AddBranch_Page` · `SearchBranch_Page` ·
`BranchDataFactory` · `BranchTestData` · `ApprovalStatus` · `pom.xml` · SHAFT `properties/`

## 3. Assets Extended — additively, and declared

| Asset | Change | Why it is safe |
|---|---|---|
| `utilities/EnvironmentConfig.java` | **Added** `agencyListUrl/Path`, `addAgencyUrl/Path`, `editAgencyPath` | Purely additive. No existing member was read, renamed, or modified. Classified `shared`, so declared here per §11D.2 |
| `src/test/resources/environment.properties` | **Appended** three agency paths | Additive. Existing Branch keys untouched |

**`BranchProvisioner` was NOT modified**, although the approved Plan said it would be extended — see the
Decision Report's deviation record. Composing beside it turned out to require *no* Branch file changes at
all, which honours the Plan's stated intent ("additive, so branch's tests are unaffected") more strictly
than its letter.

## 4. Baseline Impact

```
$ node platform_core/tools/automation_lifecycle/cli.js check-ownership --module agency \
      --baseline platform_core_data/automation_baseline/shaft/tests_SHAFT
{ "allowed": true, "owned": [], "shared": [], "unowned": [], "foreign": [] }
```

**Every list is empty because nothing was written to the shared baseline.** `agency` is a `Draft` module,
so its source of truth is the module workspace; the baseline stays exactly as `branch` promoted it. That is
the operator's Stage 4A instruction — *module working copy first, do not touch the shared baseline* —
verified by tool rather than asserted by this report.

## 5. Traceability

Every test method carries its Test Case ID in both its `@Test(description = ...)` and its Javadoc, so the
chain `Requirement → Discovery → Finding → Manual Test Case → Automation Script → Verified Locator` is
recoverable from the code alone. Findings are cited inline where they shape behaviour: `FINDING-001`
(the `Required` string), `FINDING-005` (undocumented Business Type), `FINDING-008` (conditional PCC),
`FINDING-009` (read-only Manager Name), `FINDING-011` (payment-option pollution), `FINDING-012`
(disabled Blue Command Screen), plus `REPAIR-001/002/004/014` and `REPAIR-BR-002/010/013/014`.
