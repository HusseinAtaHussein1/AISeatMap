# Self-Review Report — `agency` / SHAFT (§15, §15A)

| Field | Value |
|---|---|
| Module | `agency` |
| Iterations used | **2 of 3** (bounded) |
| Outcome | **All checks satisfied.** 4 real defects found and fixed; 1 recorded as technical debt |
| Build after review | `mvn -o test-compile` clean |
| Written | 2026-08-18 |

## 1. Defects Found and Fixed

### D-1 — Approval status read too early (REPAIR-001 class) · **fixed**

`SearchAgency_Page.waitForApprovalStatus` had been generated but **the maker–checker tests never called
it** — all five status assertions read `approvalStatusOf()` directly, immediately after clicking
Approve / Reject / Send For Approval.

This is exactly the fault the Branch suite diagnosed and repaired: the transition is applied
asynchronously, so an immediate read observes the *pre*-transition value and reports a false failure.
Writing a bounded wait and then not using it is worse than not writing one — it looks correct on review.

**Fix:** added `waitForApprovalStatusContaining(code, fragment)` and routed all five assertions through it.
`contains` rather than `equals`, because the grid renders the pending state as `"Pending for approval"`, and
an exact-match wait cannot express "has it become pending yet?" without hardcoding a label this stage never
verified character-for-character.

### D-2 — Two sources of truth for one fixture value · **fixed**

`agency_baseline.properties` defined `credentialName` and `productAccessDescription`, and `AgencyTestData`
exposed accessors for both. But those values belong to the **Add Branch** form's Product Access grid, and
`branch_baseline.properties` already owns them — `SupplierBranchProvisioner` correctly reads
`BranchTestData`.

So the Agency copies were unreachable duplicates. They would have sat there until someone changed one and
not the other, and the drift would have been silent.

**Fix:** removed both from the properties file and from `AgencyTestData`, with a comment in the properties
file naming `branch_baseline.properties` as the owner so the next person does not re-add them.

### D-3 — Dead configuration · **fixed**

`outstandingThreshold`, `reachingPercentage` and `warningPromptDays` were configured and exposed but never
read: Outstanding Threshold arrives pre-filled (observed value `5`) and the other two are optional, so
`fillMandatoryBaseline` sets none of them. `AgencyDataFactory.uniqueCompanyUrl` and `uniquePostOfficeBox`
were likewise never called.

**Fix:** removed. A property nothing reads is a second source of truth waiting to drift.

### D-4 — A weak assertion where a strong one was available · **fixed**

`AgencyProvisioner` asserted only that Country was **non-empty** after the Branch cascade, while
`AgencyTestData.country()` held the expected value and went unused.

**Fix:** it now asserts Country equals the configured value, and the failure message explains that a
mismatch means the two baseline files have drifted apart rather than that Add Agency is broken. This also
turns a previously unused accessor into a working check.

## 2. Recorded as Technical Debt, Not Actioned

| Item | Why it was not actioned here |
|---|---|
| `Agency_Common` extends `Branch_Common` across packages | The correct home is `utilities.Page_Common`, but moving it modifies a file the Branch suite's tests depend on. §11D.2 says propose, not perform — filed as Proposal **P-1** |
| `AddBranch_Page.FIRST_ROW_DESCRIPTION` is not row-scoped | Same reason. Filed as Proposal **P-2**. `BranchSupplierGrid` anchors every locator inside its own row, so this suite is unaffected |

## 3. Checks Run and Their Results

| Check (§15) | Result |
|---|---|
| Naming consistency | **Pass.** `{Screen}_Page`, `{Suite}_TC`, `{Module}_Common`, `{Module}TestData`, `{Module}DataFactory` — matches the Branch suite's conventions throughout |
| Duplicate code | **Pass after D-2/D-3.** `Agency_Common` extends rather than copies `Branch_Common`'s ~180 lines; `SupplierBranchProvisioner` composes rather than duplicating `AddBranch_Page` |
| Broken references | **Pass.** `mvn -o test-compile` clean. One forward reference to a method I had not yet written (`selectBusinessTypeFreelancer`) was caught and fixed during generation |
| Missing reusable assets | **Pass.** Page objects, provisioners, fixture holder, data factory and externalised test data all present |
| Unused reusable assets | **Fixed in D-3.** Page-object accessors that no in-scope test calls are retained deliberately as public API surface, which is normal for a Page Object; unused *configuration* was removed |
| `Thread.sleep` anywhere | **None.** Only Javadoc prohibitions mention it |
| `new SHAFT.GUI.WebDriver()` anywhere | **None.** All construction via `BrowserSession.start()` |
| Assertions on `getPageSource()` | **None.** Only a Javadoc note explaining why such an assertion is unfalsifiable |
| Fixed delays substituting for readiness | **None.** Every wait is a bounded `waitFor(...)`, none nested inside another wait's condition |
| Assertions weakened to pass | **None** — see §4 |
| Test data separation | **Pass.** No literal fixture value inside a Page Object; all in `agency_baseline.properties` |
| Credential handling | **Pass.** No credential in any log line, assertion message, or observability metadata |

## 4. Assertions Deliberately Left Strict

The temptation in a self-review pass is to soften whatever looks likely to fail. Four assertions were
**left alone on purpose**:

- **TC-AGENCY-020** — expected to fail; the document input has no `accept` attribute. The failure *is* the
  finding.
- **TC-AGENCY-023** — expected to fail if the 2 MB limit is unenforced (ASM-009).
- **TC-AGENCY-053** — the expected result is stated definitely, not as "record what happens", because
  existing stored data (`Test Egypt`) proves a space must be storable.
- **TC-AGENCY-002** — `State` and `City` were reported as *not automated* rather than simulated with an
  invented clear interaction. A test that passes without exercising its rule is worse than an honest
  partial.

## 5. Simple English Check (§15A)

Read back for a reader who was not present while this was written:

- Every non-obvious decision states **why**, not just what — the readiness gate, the reach-via-pen rule, the
  PrimeNG ancestor rule, the reject-before-approve ordering.
- Every unverified thing is labelled **unverified** in the code itself, not only in a report.
- Failure messages name the likely *cause* and say whether it points at the application, the fixture, or the
  locator — so Stage 5A does not have to guess and Stage 5H does not misdiagnose.
- Two odd-looking things carry explicit "this is not a typo" notes: the double-dash ids
  (`id--Creditagency`) and the casing difference between `id-Postofficebox` and Branch's
  `id-PostOfficeBox`.
- `testng-agency.xml` explains why its shape differs from `testng-branch.xml`, so the difference is not
  "tidied up" later into a bug.
