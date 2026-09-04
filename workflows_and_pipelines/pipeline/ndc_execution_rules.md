# Supplier Features — Execution & Governance Rules

The execution and governance rules for work under `platform_core_data/supplier-features/`. Structure
(registries, state files, pointers, run-ownership schema) is defined in `module_architecture.md` §11;
this document is the rules that sit on top of it. Routing into this rule set: `new_us_intake.md` §13.
Stage-gate mechanics: `pipeline.md` §16.

They are a SIBLING of the platform's normal module/Feature rules, never a replacement for them. They
do **not** apply to `platform_core_data/modules/` (Agency, Branch, or any other classic
module/Feature workflow) unless that module's own documentation independently adopts an equivalent
rule.

## How to tell which rules apply

Every rule below sits in exactly one tier. **A rule never activates merely because a Feature sits in
this folder alongside another one**, and never because a word appeared in a User Story.

| Tier | Activates when | Never activates from |
|---|---|---|
| **§A Supplier-Feature-wide** | the resolved scope is any Feature under `supplier-features/`, or the run has `scopeFamily === "supplier-feature"` | a classic module run |
| **§B NDC-Core-Service-specific** | that Feature's registered `integrationLayer === "ndc-core-service"` | folder location, Supplier name, or the words "NDC", "supplier", "API", "booking" appearing in a User Story |
| **§C Import-Booked-PNR-specific** | the resolved Feature is `import-booked-pnr` | any other Feature, however similar it looks |

Resolve the tier from the **actual registered scope** — `cli.js supplier-feature feature list --json`
reports each Feature's `integrationLayer` — never by inference.

---

# §A — Supplier-Feature-wide rules

Apply to any Feature under `supplier-features/`, whatever its integration layer.

## A1. Supplier inheritance

A Supplier scope inherits Feature-level knowledge **by reference**, never by duplication:

- `context/FeatureChecklistProfile.md`
- Feature-level Execution Flow / runbook artifacts (e.g. `ExecutionFlow_HappyPath.md`)
- approved shared Feature contexts
- shared Requirement IDs

A Supplier's own artifacts hold only what is genuinely Supplier-specific: applicability, mappings,
actual environments, credentials/PCC/market, test data, evidence, deviations, blockers, execution
capability, and Supplier Discovery findings. Do not copy a full Feature artifact into a Supplier
folder unless a run needs an explicit immutable snapshot — and if it does, say so explicitly rather
than let a stale copy silently diverge from the Feature original.

## A2. Supplier run intake

Before Stage 1 completes on a Supplier run, record where applicable:

- Feature, Supplier
- the Feature's integration layer (as registered — not restated as an owner)
- Target Environment
- Source Environment (only if the Feature's execution flow requires one — see §C1; not every Feature
  has one)
- Provider ID
- Supplier credential / PCC / market configuration
- Testing Layer Scope (§A3)
- known test data
- known blockers
- inherited Feature artifacts (pointers, per §A1)

An unknown value is allowed and must be stated explicitly as one of: `Unknown`, `To Be Discovered`,
`Blocked`, `Pending Confirmation`, `N/A`. Never left blank, never invented.

These fields are conceptual/Markdown today (`SupplierChecklist.md`, run intake notes) — they are not
enforced by a `run.json` schema, with the sole exception of `testingLayerScope`, which does have a
`run.json` field (§A4).

## A3. Full Feature QA default

A Supplier scope defaults to the full QA layer set:

`UI · API · Contract · Integration · E2E · Regression · DB · Security · Performance`

Each layer is one of `In Scope` (default) · `Out of Scope` · `Deferred`.

- `Out of Scope` requires an explicit human scope restriction, with a stated reason.
- `Deferred` means the layer belongs to scope but cannot currently execute — also with a reason.
- A layer is never silently dropped by omission.

## A4. Run scope freeze

Once a run's scope is confirmed, its `feature` / `supplier` / `sharedScope` / `testingLayerScope` are
**frozen**. Mechanically enforced (`module_architecture.md` §11.5.1):

- `createRun.js`'s `validateRunScopeFamily()` validates the shape at creation (Supplier XOR shared
  scope — §A5).
- `createRun.js`'s `changeSupplierFeatureRunScope()` is the **only** supported path to change any of
  those four fields on an existing run. It requires `approvedBy` and a non-empty `reason`,
  re-validates the Supplier-XOR-sharedScope invariant against the proposed new shape, and **appends**
  the change to `run.json`'s `scopeHistory[]` — the previous scope is never overwritten or lost.
- CLI: `cli.js scope-change [--run <r>] --approved-by "<name>" --reason "..." [--feature ...]
  [--supplier ... | --clear-supplier] [--shared-scope ... | --clear-shared-scope]
  [--testing-layer-scope <json> | --clear-testing-layer-scope]`.
- `scopeFamily` itself is **frozen absolutely**, not frozen-but-changeable: converting a classic run
  into a Supplier-Feature run is not a scope change, it is a different run.
- Calling this function/CLI on a classic run (`scopeFamily` null) is refused — scope-freeze/history
  never applies to Agency/Branch/classic-module runs.

A Supplier run must never be converted to a shared-scope run, or vice versa, other than through this
controlled path.

## A5. Supplier XOR Shared Scope

Exactly one of `Feature → Supplier` or `Feature → Shared Scope` — never both, never neither.
Enforced by `validateRunScopeFamily()` at both creation (`createRun()`) and at any later scope change
(`changeSupplierFeatureRunScope()`, §A4).

## A6. Requirement authority (precedence)

When deciding expected behavior, use this precedence:

1. Current approved User Story / Acceptance Criteria
2. Approved Feature-level Project Context
3. Approved Feature Checklist Profile / Feature Execution Flow
4. Approved Supplier Checklist
5. Verified Supplier Discovery evidence
6. Historical documentation
7. Assumptions

A lower-precedence source never silently overrides a higher one. This precedence is specific to the
Supplier Features model and does not replace the requirement-authority model of any unrelated module
unless that module already uses the same one.

If two authoritative sources conflict: record the discrepancy, identify both sources, mark affected
test cases `Blocked` or `Pending Confirmation`, and never invent a resolution. Historical behavior is
regression evidence, not automatically the current requirement when the current User Story explicitly
changes it.

## A7. Discovery → Test Design gate

Discovery findings are classified as: `Confirmed` · `Historical Requirement` ·
`Supplier-Specific Confirmed` · `Open Question` · `Assumption` · `Blocked` · `Provisional` ·
`Not Applicable`.

Test Design must not promote an Open Question, an assumption, provisional behavior, or a Blocked
finding into a confirmed expected result. When an expected result cannot be stated from evidence, the
test is classified `Discovery`, `Blocked`, or `Pending Confirmation` — never given an invented result.

## A8. Test Design → Automation gate

Do not automate a test case when: its expected result is unresolved; required environment/Supplier
test data is unavailable; the Supplier contract is still under Discovery; the test is explicitly
`Blocked`; execution would violate `execution_safety_policy.json`; or destructive cleanup/reset
behavior is unknown.

Automation priority: (1) stable confirmed P1 flows, (2) API/contract/mapping validation, (3)
high-value regression, (4) stable E2E flows — before exploratory or unstable cases.

## A9. Execution evidence

For Supplier runs, capture enough evidence to reconstruct what was tested.

**Source state** (where the Feature has a Source Environment — §C1): Source Environment, Supplier,
credential/PCC/market, branch/agency, booking reference, passenger data, itinerary,
fare/taxes/total/currency, tickets/coupons, baggage/services, original booking/ticketing timestamp.

**Target state:** Target Environment, target branch/agency, Supplier configuration, target
credential/PCC, executing user, wallet baseline where the Feature involves a wallet.

**Execution evidence:** UI screenshots, request/response payloads, relevant network calls, the
integration layer's response, persisted records, and DB evidence where allowed.

Classify differences as: `Exact Match` · `Expected Normalization` · `Accepted Difference` ·
`Unexpected Difference` · `Missing` · `Not Verifiable`. Do not fail a normalization difference unless
it violates a confirmed contract or business rule.

## A10. Test-data isolation

Test data belongs to its owning `Feature → Supplier → Run`. Do not reuse one Supplier's PNR,
credentials, PCC, market, or booking data for another Supplier unless a test explicitly targets
cross-provider behavior. Every generated booking/PNR records its owning Feature/Supplier/Run.

Because the same Supplier name under two Features is two independent entities
(`module_architecture.md` §11.1), test data never crosses that boundary either.

## A11. Prior-run reuse

A new run may read a prior run as evidence, but must never silently continue it. If evidence is
reused: reference the source run explicitly, state what is reused, state what is re-verified, and
never copy a previous `Passed` result into the new run without execution/evidence. A prior run is
evidence, not current execution.

## A12. Completion reporting

At the end of each stage/run, report separately: `Confirmed Passed` · `Confirmed Application
Failures` · `Automation Failures` · `Blocked` · `Inconclusive` · `Not Executed` · `Open Questions` ·
`Accepted Differences`. Never combine `Blocked`, `Inconclusive`, or `Not Executed` into Passed
coverage.

For migration work, also report separately: behavior unchanged, accepted intentional changes,
regressions, unverified migration risks.

## A13. Feature-state wording

Only Features actually present in the registry exist. Refund, Reissue, Seatmap, Ancillaries, and
Upselling are **candidate names, not registrations** — they are not on disk and not in
`supplier-features/modules.json`. Never state or imply that they hold live content, and never treat
one as pre-existing because it is named in a document. Use:

> "That is a candidate Supplier Feature name. It must not be assumed to exist. Inspect the registry
> before use and create it only through the approved intake/scaffold flow."

## A14. Scope sweep before a new Supplier

Before creating a new Supplier: verify the selected Feature exists, check whether a Supplier already
exists under that Feature, inspect the active pointers, inspect existing Shared scopes, and inspect
overlapping Supplier/run candidates.

This sweep already has a supported command — no new tooling is needed:

```bash
cli.js supplier-feature inspect-scope --user-story "US-1234" --name "..." [--json]
```

See `new_us_intake.md` §12.2 step 3 and §12.3 for its full behavior (overlap candidates, exit code 2
on a hit). Overlap is a candidate, never a verdict.

---

# §B — NDC-Core-Service-specific rules

**Apply only when the resolved Feature's registered `integrationLayer === "ndc-core-service"`.** NDC
Core Service is an integration layer, not an owner: a Supplier-driven Feature that does not declare
it (Ancillaries, Upselling, or any future Feature) is never subject to this section.

## B1. NDC Core Service evidence

In addition to §A9, capture the NDC Core Service response itself for each exercised operation — it is
the integration point under test, and a difference cannot be classified without it.

## B2. Migration comparison — NDC-INT → NDC Core Service

For migration tests on a Feature whose retrieval path moved from NDC-INT to NDC Core Service, compare
along the full chain:

`Source Supplier Booking → NDC Core Service Retrieval → NDC Application/UI → Persisted Target Booking`

Apply §A9's difference classification to each hop. An intentional NDC Core Service normalization is
an `Expected Normalization`, not a failure, unless it violates a confirmed contract or business rule.

## B3. Contract authority

Where a Feature's behavior is defined by the NDC Core Service contract, that contract sits at
precedence level 4-5 of §A6 (Supplier Checklist / verified Discovery evidence) — it does not
outrank the current approved User Story or the Feature-level Project Context.

---

# §C — Import-Booked-PNR-specific rules

**Apply only to the `import-booked-pnr` Feature.** These are never generalized to Ancillaries,
Upselling, Refund, Reissue, Seatmap, or any other Feature — each defines its own model when its
execution flow is known.

## C1. Dual-environment model

- **Source Environment** — creates the offline ticketed booking.
- **Target Environment** — contains the Supplier implementation under test.

Actual environment values belong to the Supplier/run context and must never be hardcoded in the
Feature-level execution flow. No other Feature is assumed to use a dual-environment model; a Feature
with no such requirement marks Source Environment `N/A` rather than inventing one.

Full operational procedure:
`platform_core_data/supplier-features/import-booked-pnr/context/ExecutionFlow_HappyPath.md`.

## C2. Source Booking Snapshot

Capture the source booking's full state before import — passenger data, itinerary,
fare/taxes/total/currency, tickets/coupons, baggage/services, and the original booking/ticketing
timestamp. The snapshot is the baseline every post-import comparison is made against; without it a
difference cannot be attributed.

## C3. Rule Engine ticketing-time behavior

The **original offline ticketing date/time** governs which rule batch applies — not the import time.
A booking ticketed while a since-deleted rule batch was active is an open case: no source defines the
correct expected result, so it is recorded as an Open Question and never given an invented one.

## C4. Wallet and import persistence

Wallet validation (sufficient credit) precedes import; wallet deduction follows a successful import.
The imported booking persists as a manual/imported booking carrying its import classification.
Capture wallet balance before and after as part of §A9's evidence.
