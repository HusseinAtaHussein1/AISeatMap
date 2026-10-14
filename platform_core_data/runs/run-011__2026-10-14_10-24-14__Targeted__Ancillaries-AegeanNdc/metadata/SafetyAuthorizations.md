# Safety Authorizations — run-011__2026-10-14_10-24-14__Targeted__Ancillaries-AegeanNdc

> Run-scoped human authorizations granted for this run, and this run only. The machine-readable
> source is `SafetyAuthorizations.json` beside this file; this document exists so a reviewer can
> read what was approved without parsing JSON.
>
> **None of these carries forward.** A future run asks fresh. None of them lifts a `Forbidden`
> policy rule — no run-scoped approval can.

_Last updated: 2026-10-14T11:01:18.573Z_

## Authorizations

| ID | Action | Ownership | Module | Scope | Approved by | Approved at | Cleanup |
|---|---|---|---|---|---|---|---|
| `AUTH-ANCILLARIES-BOOK-SelfCreated` | BOOK | SelfCreated | ancillaries | all SelfCreated records in ancillaries for this run | Hussien Ata | 2026-10-14T11:01:18.562Z | — |
| `AUTH-ANCILLARIES-PAYMENT-SelfCreated` | PAYMENT | SelfCreated | ancillaries | all SelfCreated records in ancillaries for this run | Hussien Ata | 2026-10-14T11:01:18.562Z | — |
| `AUTH-ANCILLARIES-HOLD-SelfCreated` | HOLD | SelfCreated | ancillaries | all SelfCreated records in ancillaries for this run | Hussien Ata | 2026-10-14T11:01:18.562Z | — |

## Policy this run was authorized against

| Field | Value |
|---|---|
| Policy ID | `ndc-admin-portal-stg` |
| Policy version | 2 |
| Policy hash | `sha256:14b55a3e109d86cd5750551a1aa1e1d3` |

<!-- No credential, token, session identifier, or card value appears in this file, by design
     (execution safety §50). An approval names a role or an operator, never a secret. -->
