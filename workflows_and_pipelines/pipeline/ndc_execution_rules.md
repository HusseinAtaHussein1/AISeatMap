# NDC Core Service — Execution & Governance Rules

**These rules apply only when the resolved project/run scope belongs to NDC Core Service** — i.e.
the scope lives under `platform_core_data/services/ndc-core-service/`, or the resolved run has
`service === "ndc-core-service"` on `run.json`. They are a SIBLING of the platform's normal
module/Feature rules, never a replacement for them.

They do **not** apply to `platform_core_data/modules/` (Agency, Branch, or any other classic
module/Feature workflow) unless that module's own documentation independently adopts an equivalent
rule. Do not infer NDC scope from words like "supplier", "API", "NDC", or "booking" appearing in a
User Story — use the actual resolved Service/run scope (`new_us_intake.md` §12.1, §13).

Routing into this rule set: `new_us_intake.md` §13. Domain model and schema this rule set sits on
top of: `module_architecture.md` §11. Stage-gate mechanics: `pipeline.md` §16.

---

## 1. Supplier inheritance

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

## 2. Supplier run intake

Before Stage 1 completes on an NDC Supplier run, record where applicable:

- Service, Feature, Supplier
- Source Environment (only if the Feature's execution flow requires one — §12)
- Target Environment
- Provider ID
- Supplier credential / PCC / market configuration
- Testing Layer Scope (§3)
- known test data
- known blockers
- inherited Feature artifacts (pointers, per §1)

An unknown value is allowed and must be stated explicitly as one of: `Unknown`, `To Be Discovered`,
`Blocked`, `Pending Confirmation`, `N/A`. Never left blank, never invented.

These fields are conceptual/Markdown today (`SupplierChecklist.md`, run intake notes) — they are not
enforced by a `run.json` schema, with the sole exception of `testingLayerScope`, which does have a
`run.json` field (§4).

## 3. Full Feature QA default

An NDC Supplier scope defaults to the full QA layer set:

`UI · API · Contract · Integration · E2E · Regression · DB · Security · Performance`

Each layer is one of `In Scope` (default) · `Out of Scope` · `Deferred`.

- `Out of Scope` requires an explicit human scope restriction, with a stated reason.
- `Deferred` means the layer belongs to scope but cannot currently execute — also with a reason.
- A layer is never silently dropped by omission.

## 4. Run scope freeze

Once an NDC run's scope is confirmed, its `service` / `feature` / `supplier` / `sharedScope` /
`testingLayerScope` are **frozen**. Mechanically enforced (module_architecture.md §11.5):

- `createRun.js`'s `validateNdcRunScope()` validates the shape at creation (Supplier XOR shared
  scope — §5 below).
- `createRun.js`'s `changeNdcRunScope()` is the **only** supported path to change any of those five
  fields on an existing run. It requires `approvedBy` and a non-empty `reason`, re-validates the
  Supplier-XOR-sharedScope invariant against the proposed new shape, and **appends** the change to
  `run.json`'s `scopeHistory[]` — the previous scope is never overwritten or lost.
- CLI: `cli.js ndc-scope-change [--run <r>] --approved-by "<name>" --reason "..." [--service ...]
  [--feature ...] [--supplier ... | --clear-supplier] [--shared-scope ... | --clear-shared-scope]
  [--testing-layer-scope <json> | --clear-testing-layer-scope]`.
- Calling this function/CLI on a non-NDC run (`service` null) is refused — scope-freeze/history is
  an NDC-only concept and never applies to Agency/Branch/classic-module runs.

A Supplier run must never be converted to a shared-scope run, or vice versa, other than through this
controlled path.

## 5. Supplier XOR Shared Scope

Exactly one of `Service → Feature → Supplier` or `Service → Feature → Shared Scope` — never both,
never neither. Enforced by `validateNdcRunScope()` at both creation (`createRun()`) and at any later
scope change (`changeNdcRunScope()`, §4).

## 6. Requirement authority (precedence)

When deciding expected behavior for NDC work, use this precedence:

1. Current approved User Story / Acceptance Criteria
2. Approved NDC Feature-level Project Context
3. Approved Feature Checklist Profile / Feature Execution Flow
4. Approved Supplier Checklist
5. Verified Supplier Discovery evidence
6. Historical documentation
7. Assumptions

A lower-precedence source never silently overrides a higher one. This precedence is specific to the
NDC project model and does not replace the requirement-authority model of any unrelated module unless
that module already uses the same one.

If two authoritative sources conflict: record the discrepancy, identify both sources, mark affected
test cases `Blocked` or `Pending Confirmation`, and never invent a resolution. Historical behavior is
regression evidence, not automatically the current requirement when the current User Story explicitly
changes it.

## 7. Discovery → Test Design gate

NDC Discovery findings are classified as: `Confirmed` · `Historical Requirement` ·
`Supplier-Specific Confirmed` · `Open Question` · `Assumption` · `Blocked` · `Provisional` ·
`Not Applicable`.

Test Design must not promote an Open Question, an assumption, provisional behavior, or a Blocked
finding into a confirmed expected result. When an expected result cannot be stated from evidence, the
test is classified `Discovery`, `Blocked`, or `Pending Confirmation` — never given an invented result.

## 8. Test Design → Automation gate

Do not automate an NDC test case when: its expected result is unresolved; required
environment/Supplier test data is unavailable; the Supplier contract is still under Discovery; the
test is explicitly `Blocked`; execution would violate `execution_safety_policy.json`; or destructive
cleanup/reset behavior is unknown.

Automation priority: (1) stable confirmed P1 flows, (2) API/contract/mapping validation, (3)
high-value regression, (4) stable E2E flows — before exploratory or unstable cases.

## 9. Execution evidence

For Supplier runs, capture enough evidence to reconstruct what was tested.

**Source state:** Source Environment, Supplier, credential/PCC/market, branch/agency, PNR, passenger
data, itinerary, fare/taxes/total/currency, tickets/coupons, baggage/services, original
booking/ticketing timestamp.

**Target state:** Target Environment, target branch/agency, Supplier configuration, target
credential/PCC, executing user, wallet baseline.

**Execution evidence:** UI screenshots, request/response payloads, relevant network calls, NDC Core
Service response, wallet before/after, Rule Engine evidence, persisted booking, booking/itinerary
state after import, DB evidence where allowed.

**Migration comparison** — for migration tests, compare:

`Source Supplier Booking → NDC Core Service Retrieval → NDC Application/UI → Persisted Target Booking`

Classify differences as: `Exact Match` · `Expected Normalization` · `Accepted Difference` ·
`Unexpected Difference` · `Missing` · `Not Verifiable`. Do not fail a normalization difference unless
it violates a confirmed contract or business rule.

## 10. Test-data isolation

Test data belongs to its owning `Service → Feature → Supplier → Run`. Do not reuse one Supplier's
PNR, credentials, PCC, market, or booking data for another Supplier unless a test explicitly targets
cross-provider behavior. Every generated booking/PNR records its owning Service/Feature/Supplier/Run.

## 11. Prior-run reuse

A new NDC run may read a prior run as evidence, but must never silently continue it. If evidence is
reused: reference the source run explicitly, state what is reused, state what is re-verified, and
never copy a previous `Passed` result into the new run without execution/evidence. A prior run is
evidence, not current execution.

## 12. Environment model — Import Booked PNR only

This rule is narrower than the rest of this document: it applies **only** to
`NDC_Core_Service → Import Booked PNR`.

- **Source Environment** — creates the offline ticketed booking.
- **Target Environment** — contains the Supplier implementation under test through NDC Core Service.

Actual environment values belong to the Supplier/run context and must never be hardcoded in the
Feature-level execution flow. Refund, Reissue, and Seatmap are **not** assumed to use this
dual-environment model — each defines its own environment model when its execution flow is known
(§14).

## 13. Completion reporting

At the end of each NDC stage/run, report separately: `Confirmed Passed` · `Confirmed Application
Failures` · `Automation Failures` · `Blocked` · `Inconclusive` · `Not Executed` · `Open Questions` ·
`Accepted Differences`. Never combine `Blocked`, `Inconclusive`, or `Not Executed` into Passed
coverage.

For migration work, also report separately: behavior unchanged, accepted intentional changes,
regressions, unverified migration risks.

## 14. Feature-state wording

Refund, Reissue, and Seatmap exist today as **empty Feature registrations only** — proposed and
approved (the name is reserved and traceable), with no `shared/` and no `suppliers/` content until a
real request arrives. Never state or imply that their folders/registrations hold live content. Use:

> "Refund, Reissue, and Seatmap are reserved NDC Core Service Feature names. Their folders/
> registrations must not be assumed to exist beyond the empty registration. Inspect the NDC registry
> before use and create content only through the approved NDC intake/scaffold flow."

## 15. Scope sweep before a new Supplier

Before creating a new NDC Supplier: verify the Service exists, verify the selected Feature exists,
check whether a Supplier already exists under that Feature, inspect active NDC pointers, inspect
existing Shared scopes, and inspect overlapping Supplier/run candidates.

This sweep already has a supported command — no new tooling is needed:

```bash
cli.js ndc inspect-scope --user-story "US-1234" --name "..." [--json]
```

See `new_us_intake.md` §12.2 step 3 and §12.3 for its full behavior (overlap candidates, exit code
2 on a hit). Overlap is a candidate, never a verdict.
