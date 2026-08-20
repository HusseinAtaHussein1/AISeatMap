# Automation Decision Report — `agency` / SHAFT

| Field | Value |
|---|---|
| Module | `agency` |
| Produced by run | `run-004__2026-08-17_14-35-25__UserStory__US-4222-UpdateAgency` |
| Framework | SHAFT Engine 7.4.20231015 · Java 17 |
| Written | 2026-08-18 |

## 1. Automation Decision per Test Case (§13)

Scope is the Stage 3 suite narrowed by the lifecycle gate: **`Review = Approved` AND
`Automation = Approved`**. That yields **18** of 60 cases.

| Test Case | Decision | Justification |
|---|---|---|
| TC-AGENCY-001 | **Generate New** | Agency Master persistence. No Agency page object existed |
| TC-AGENCY-002 | **Partially Automatable** | Four of six mandatory fields automated. `State` and `City` are PrimeNG dropdowns with **no verified clear affordance** — see §4 |
| TC-AGENCY-011 | **Generate New** | Business Type persistence. Asserts persistence only, never business meaning (FINDING-005) |
| TC-AGENCY-012 | **Generate New** | Owner Details persistence |
| TC-AGENCY-016 | **Generate New** | Valid PDF + contract dates. Filename-display locator disclosed **unverified** |
| TC-AGENCY-020 | **Generate New** | Fake `.pdf` content. **Expected to fail** — that failure is the finding |
| TC-AGENCY-021 | **Generate New** | Contract dates mandatory. Nothing submitted |
| TC-AGENCY-022 | **Generate New** | Valid logo. Preview locator disclosed **unverified** |
| TC-AGENCY-023 | **Generate New** | Oversize logo. **Expected to fail** if the 2 MB limit is unenforced (ASM-009) |
| TC-AGENCY-037 | **Generate New** | Payment option group mandatory. Asserts behaviour, prints the observed string |
| TC-AGENCY-044 | **Generate New** | Import PNR persistence. Neighbouring checkboxes deliberately untouched (`PO-13`) |
| TC-AGENCY-047 | **Generate New** | Cancel discards. Saves nothing |
| TC-AGENCY-048 | **Generate New** | Approve. Chained after 049; skips with a named precondition if the record is terminal |
| TC-AGENCY-049 | **Generate New** | Reject with reason, asserting the submitted value was **not** applied |
| TC-AGENCY-050 | **Generate New** | E2E multi-section round trip. Runs last |
| TC-AGENCY-053 | **Generate New** | Space in agency name. Expected result stated definitely, not softened |
| TC-AGENCY-055 | **Generate New** | Manager Name inherited + read-only. Skips if the PCC section is absent |
| TC-AGENCY-059 | **Partially Automatable** | DOM read-only properties automated; "click and confirm no list opens" stays manual — see §4 |

**Totals: 16 Generate New · 2 Partially Automatable · 0 Manual Only · 0 Reuse Existing · 0 silently dropped.**

**The 42 cases outside this scope are not gaps.** 27 carry `Review = Rejected` and 41 carry
`Automation = Rejected` — recorded human decisions that a case stays manual or is not wanted. This stage
never advances either value and never reports a deliberate decision as missed coverage.

## 2. Deviation from the Approved Plan — recorded, not silent

The Plan (approved as-is, 2026-08-18) said `BranchProvisioner` would be **extended** with an approve step
and multi-supplier selection. **It was not modified at all.**

Composing beside it turned out to need *no* Branch file changes: `SupplierBranchProvisioner` calls the
existing `AddBranch_Page` and `SearchBranch_Page` unchanged, and `BranchSupplierGrid` supplies the only
missing capability (row-indexed supplier selection) from the Agency package.

**Why this is the better reading of the same instruction.** The Plan's stated intent was *"additive — the
existing `createPendingBranch` behaviour is unchanged, so `branch`'s 31 tests are unaffected."* Not touching
the file makes that true by construction rather than by careful review. `AddBranch_Page` is 1,359 lines and
31 passing tests depend on it; §11D.2 says a module needing a change to a shared asset **proposes** it.

**This is a narrowing, not a widening.** No capability was dropped: the fixture still gets an approved Branch
with two credentialled suppliers.

## 3. Proposals — changes this module wants but did not make (§11D.2)

| # | Proposal | Rationale | Risk of not doing it |
|---|---|---|---|
| P-1 | **Relocate `Branch_Common` → `utilities.Page_Common`** | `Agency_Common` extends it, so `agency` now depends on a type in the `Branch` package. The base is framework plumbing, not Branch domain logic | Cosmetic today. It becomes real if the two modules are ever promoted or versioned separately |
| P-2 | **Row-scope `AddBranch_Page.FIRST_ROW_DESCRIPTION`** | It is `input[id^='id-supplier-'][placeholder='Description']` — not anchored to a row, so it resolves to the first such input anywhere in the grid | Harmless while only row 1 is used. Silently wrong the moment a Branch test involves a second row. `BranchSupplierGrid` anchors every locator inside its own row |
| P-3 | **Remove the plaintext credential from `EnvironmentConfig`** | See §5 | Security. Pre-existing, not introduced here |
| P-4 | **Fix `BrowserDriver.authenticate()` headless** | See §5 | Blocks Stage 2 / Stage 4M tooling headless on this build |

## 4. Known Limitations

| # | Limitation | Effect | Why it was not solved here |
|---|---|---|---|
| L-1 | **`State` / `City` cannot be cleared** (TC-002) | 4 of 6 mandatory fields covered; 2 partial | PrimeNG dropdowns expose no verified clear affordance. Inventing an interaction would produce a test that passes without exercising the rule. Reported, not faked |
| L-2 | **TC-059's click-and-observe half is manual** | Partial | A missing dropdown panel cannot be distinguished from a panel the locator does not find. The three DOM properties that *are* unambiguous are asserted instead |
| L-3 | **Uploaded-filename and logo-preview locators are unverified** | TC-016, TC-022 may fail on the locator rather than the behaviour | No upload could be performed during read-only verification — it would have mutated a record this run did not create. Both failure messages say so explicitly, so Stage 5H repairs rather than misdiagnoses |
| L-4 | **Whether a rejected Agency is resubmittable is unverified** | TC-048 and TC-050 may skip with a blocked precondition | Verifying it read-only was impossible: it needed a rejection on a record this run did not create — `Forbidden (absolute)`. The chain is ordered reject-first so the assumption is tested rather than assumed |
| L-5 | **Tests are not mutually independent** | A shared-state defect could surface as an unrelated failure | Direct consequence of the operator's §5.1 one-Agency instruction. Mitigated by explicit `priority` ordering and per-test field restoration |
| L-6 | **`#id-AccountNumber` / `#id-Bankname` absent from the Update form** | Not modelled in `UpdateAgency_Page` | They exist on the **Add** form only — verified. No in-scope case needs them; the asymmetry is recorded rather than papered over with hopeful locators |
| L-7 | **`context7` unavailable** | No fetched SHAFT documentation | Recorded as a documentation gap (§34.6). Guidelines were extracted from the project's own compiling, passing code instead. **No model recall was presented as fetched docs** |

## 5. Security and Tooling Defects — reported, not acted on unilaterally

### 5.1 Plaintext Super Admin credential in committed source

`src/main/java/utilities/EnvironmentConfig.java` holds the STG Super Admin password as a committed
constant. **Pre-existing** — inherited from the promoted baseline, not introduced by this run.
`BrowserSession`'s own Javadoc acknowledges the credential appears in a public breach corpus and records
rotation as open (`KL-03`).

The file is classified `shared`, so §11D.2 requires **proposing** rather than editing. It was not edited.
Rotation and secret-management are an operator decision.

**This run's own conduct:** no credential value was ever typed into a tool call, printed, or written to
observability metadata. Verification read credentials in-process and dropped the reference immediately
(`env = null` before the first navigation).

### 5.2 `BrowserDriver.authenticate()` times out headless

Shared Stage-2 tooling. Its wait on `profile.login.successSelector` (`text=Dashboard`) times out at 20 s
against this build although login succeeds — `POST …/Admin2/loginAction` returns `200` with
`redirect:/Dashboard/dashboard`, and the marker is visible in ~1.5 s.

Used by the Explorer and Manual Execution skills, so it was **reported, not fixed** — editing it from Stage
4A would change another stage's behaviour outside this run's write scope. Selector verification used an
equivalent session with identical credential discipline.

## 6. What Was Deliberately Not Automated

- **Create Agency assertions.** In scope **as a means only** (Project Context §2). `AddAgency_Page` exists
  to provision the fixture; nothing about the create flow is asserted.
- **`Transfer Pnr Option`, `Blue Command Screen`.** `PO-13` puts both out of scope; the latter is verified
  `disabled` (FINDING-012). Neither is referenced by any test.
- **The 26 polluted payment options.** `id-Paymentoption-Edgardo`, `-Filomena`, `-m`, `-f` and the rest are
  polluted reference data (FINDING-011), not product behaviour. The fixture uses `Cash`; the count is
  measured and reported, not covered case-by-case.
- **AC-9's "Please enter a valid Manager Name."** Not an Agency concern: the field is inherited and
  read-only (FINDING-009). If Supplier CRUD enters scope, the message is tested there.
- **The mandatory asterisk on an unfillable Manager Name.** The Stage 3 suite records it as a cosmetic
  observation, explicitly not a failure condition. The test prints it and does not assert on it.
