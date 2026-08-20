# Target Write Plan — `agency` / SHAFT (§11C.4)

Recorded **after** the writes, as the audit record of what was written where and why. The write decision
itself was approved at the Stage 4A gate on 2026-08-18 (framework, package location, execution mode, fixture
path) and again for the structural question (seed from baseline via `copy-in`).

| Field | Value |
|---|---|
| Brownfield or greenfield | **Brownfield** — detected, not asked |
| Detection basis | `copy-in` seeded a complete, working SHAFT project: 17 Java files, `pom.xml`, 31 passing Branch tests, SHAFT `properties/` |
| Target root | `platform_core_data/modules/agency/automation/tests_SHAFT` |
| Root resolution | `resolve-root --module agency` → `Generated` (Draft) → **module workspace**. Never hardcoded |
| Shared baseline | **Not written to.** Verified by `check-ownership` (all lists empty) |

## 1. Files Created

| Path | Classification |
|---|---|
| `src/main/java/AdminPages/Admin/Agency/Agency_Common.java` | `owned` |
| `src/main/java/AdminPages/Admin/Agency/UpdateAgency_Page.java` | `owned` |
| `src/main/java/AdminPages/Admin/Agency/AddAgency_Page.java` | `owned` |
| `src/main/java/AdminPages/Admin/Agency/SearchAgency_Page.java` | `owned` |
| `src/main/java/AdminPages/Admin/Agency/BranchSupplierGrid.java` | `owned` |
| `src/main/java/AdminPages/Admin/Agency/AgencyTestData.java` | `owned` |
| `src/main/java/utilities/AgencyDataFactory.java` | `owned` — new file in a shared *directory*, not a shared file |
| `src/test/java/AdminPages/Admin/Agency/AgencyTestBase.java` | `owned` |
| `src/test/java/AdminPages/Admin/Agency/AgencyFixture.java` | `owned` |
| `src/test/java/AdminPages/Admin/Agency/AgencyProvisioner.java` | `owned` |
| `src/test/java/AdminPages/Admin/Agency/SupplierBranchProvisioner.java` | `owned` |
| `src/test/java/AdminPages/Admin/Agency/AgencyUpdatePersistence_TC.java` | `owned` |
| `src/test/java/AdminPages/Admin/Agency/AgencyUpdateValidation_TC.java` | `owned` |
| `src/test/java/AdminPages/Admin/Agency/AgencyDocumentsAndLogo_TC.java` | `owned` |
| `src/test/java/AdminPages/Admin/Agency/AgencyInheritanceAndReadOnly_TC.java` | `owned` |
| `src/test/java/AdminPages/Admin/Agency/AgencyMakerChecker_TC.java` | `owned` |
| `src/test/resources/agency_baseline.properties` | `owned` |
| `src/test/resources/testDataFiles/agency/uploads/` (4 files) | `owned` |
| `testng-agency.xml` | `owned` |
| `.module_automation_state.json` | lifecycle metadata |

**20 paths created. None is `foreign`. None required an overwrite.**

## 2. Files Modified — both additive, both declared

| Path | Classification | Change | Existing content touched? |
|---|---|---|---|
| `src/main/java/utilities/EnvironmentConfig.java` | **`shared`** | Added 5 agency route accessors | **No.** Purely appended; no existing member read, renamed, reordered, or altered |
| `src/test/resources/environment.properties` | **`shared`** | Appended 3 agency path keys | **No.** Existing Branch keys untouched |

Both are declared here and in the Decision Report §3, per §11D.2's rule that a shared-asset change is
declared rather than made quietly.

## 3. Files Deliberately NOT Modified

| Path | Why | What was done instead |
|---|---|---|
| `AdminPages/Admin/Branch/AddBranch_Page.java` | 1,359 lines; 31 passing tests depend on it. Needed row-indexed supplier selection | New `BranchSupplierGrid` in the Agency package. Proposal P-2 filed for its non-row-scoped Description locator |
| `AdminPages/Admin/Branch/BranchProvisioner.java` | The approved Plan said "extend" — composing beside it needed no change at all | New `SupplierBranchProvisioner`. Deviation recorded in Decision Report §2 |
| `AdminPages/Admin/Branch/Branch_Common.java` | Correct home is `utilities`, but moving it modifies a file Branch's tests depend on | `Agency_Common` **extends** it. Proposal P-1 filed for relocation |
| `utilities/EnvironmentConfig.java` — the credential constants | Plaintext STG password, pre-existing, `shared` | **Proposed, not edited** (P-3). Rotation is an operator decision |
| `platform_core/tools/.../BrowserDriver.js` | Shared Stage-2 tooling used by other skills | **Reported, not fixed** (P-4) |
| `automation_baseline/shaft/tests_SHAFT/**` | The operator's instruction: module working copy first | Nothing written. Verified by `check-ownership` |

## 4. Overwrite Risk

**None.** Every created path was previously absent; both modified files were appended to. No reusable asset
was overwritten, so §3's "never overwrite an existing reusable asset without explicit approval" was not
engaged.

## 5. Post-Write Verification

| Check | Result |
|---|---|
| `mvn -o compile` | Clean |
| `mvn -o test-compile` | Clean |
| `check-ownership --module agency` | `allowed: true`, every list empty |
| `resolve-root --module agency` | `Generated` → module workspace, `Exists: true` |
| `@Test` method count | 18 — matches the 18 dual-approved cases exactly |
| Suite executed | **No.** Stage 4A never executes |
