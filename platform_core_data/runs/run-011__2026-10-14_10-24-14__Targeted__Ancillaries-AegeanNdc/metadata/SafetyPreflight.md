# Execution Safety Preflight — run-011__2026-10-14_10-24-14__Targeted__Ancillaries-AegeanNdc

> Produced before execution, from the run's planned operations. **Non-mutating** — evaluating a
> policy touches nothing in the application under test.
>
> A `Forbidden` row here is a policy decision, not a test result and not an Application Failure.
> The affected cases are recorded by the executing stage as `Skipped`, reason
> `Execution Safety Policy`, and still appear in every total.

| Field | Value |
|---|---|
| Run | `run-011__2026-10-14_10-24-14__Targeted__Ancillaries-AegeanNdc` |
| Environment | Staging |
| Policy | `ndc-admin-portal-stg` v2 |
| Policy hash | `sha256:14b55a3e109d86cd5750551a1aa1e1d3` |
| Generated | 2026-10-14T10:45:23.268Z |

## 1. Mutation Footprint

| Action | Module | Ownership | Occurrences | Decision | Matched Rule | Cleanup |
|---|---|---|---|---|---|---|
| BOOK | ancillaries | SelfCreated | 17 | Approval Required | `policy.actions.BOOK.*` | — |
| PAYMENT | ancillaries | SelfCreated | 4 | Approval Required | `policy.actions.PAYMENT.*` | — |
| HOLD | ancillaries | SelfCreated | 3 | Approval Required | `policy.actions.HOLD.*` | — |
| READ | ancillaries | Shared | 1 | Allowed | `policy.categories.read.Shared` | — |

## 2. Totals

| Metric | Count |
|---|---|
| Operations planned | 25 |
| Mutating | 24 |
| Allowed | 1 |
| Approval Required | 24 |
| Already authorized for this run | 0 |
| Forbidden | 0 |
| Cleanup-required actions | 0 |

## 3. Authorization Questions

- Allow **BOOK** of **SelfCreated** **ancillaries** records for this run? (17 operations, 17 test cases)
- Allow **PAYMENT** of **SelfCreated** **ancillaries** records for this run? (4 operations, 4 test cases)
- Allow **HOLD** of **SelfCreated** **ancillaries** records for this run? (3 operations, 3 test cases)

## 4. Blocked by Policy

None.
