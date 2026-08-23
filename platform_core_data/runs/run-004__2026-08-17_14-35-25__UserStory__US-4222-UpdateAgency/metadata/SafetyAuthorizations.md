# Safety Authorizations — run-004__2026-08-17_14-35-25__UserStory__US-4222-UpdateAgency

> Run-scoped human authorizations granted for this run, and this run only. The machine-readable
> source is `SafetyAuthorizations.json` beside this file; this document exists so a reviewer can
> read what was approved without parsing JSON.
>
> **None of these carries forward.** A future run asks fresh. None of them lifts a `Forbidden`
> policy rule — no run-scoped approval can.

_Last updated: 2026-08-23T00:00:00.000Z_

## Authorizations

| ID | Action | Ownership | Module | Scope | Approved by | Approved at | Cleanup |
|---|---|---|---|---|---|---|---|
| `AUTH-AGENCY-CREATE-SelfCreated` | CREATE | SelfCreated | agency | all SelfCreated records in agency for this run | ahmed.ayman@tildetech.ae | 2026-08-17T11:35:25.430Z | — |
| `AUTH-AGENCY-UPDATE-SelfCreated` | UPDATE | SelfCreated | agency | all SelfCreated records in agency for this run | ahmed.ayman@tildetech.ae | 2026-08-17T11:35:25.430Z | — |
| `AUTH-AGENCY-SUBMIT-SelfCreated` | SUBMIT | SelfCreated | agency | all SelfCreated records in agency for this run | ahmed.ayman@tildetech.ae | 2026-08-17T11:35:25.430Z | — |
| `AUTH-AGENCY-APPROVE-SelfCreated` | APPROVE | SelfCreated | agency | all SelfCreated records in agency for this run | ahmed.ayman@tildetech.ae | 2026-08-17T11:35:25.430Z | — |
| `AUTH-AGENCY-REJECT-SelfCreated` | REJECT | SelfCreated | agency | all SelfCreated records in agency for this run | ahmed.ayman@tildetech.ae | 2026-08-17T11:35:25.430Z | — |
| `AUTH-BRANCH-CREATE-SelfCreated` | CREATE | SelfCreated | branch | Branch records this run creates as dependencies of its own Agency fixtures — never a pre-existing Branch | ahmed.ayman@tildetech.ae | 2026-08-18T09:30:00.000Z | — |
| `AUTH-BRANCH-UPDATE-SelfCreated` | UPDATE | SelfCreated | branch | Branch records this run created — never a pre-existing Branch | ahmed.ayman@tildetech.ae | 2026-08-18T09:30:00.000Z | — |
| `AUTH-BRANCH-SUBMIT-SelfCreated` | SUBMIT | SelfCreated | branch | Branch records this run created — never a pre-existing Branch | ahmed.ayman@tildetech.ae | 2026-08-18T09:30:00.000Z | — |
| `AUTH-BRANCH-APPROVE-SelfCreated` | APPROVE | SelfCreated | branch | Branch records this run created — never a pre-existing Branch | ahmed.ayman@tildetech.ae | 2026-08-18T09:30:00.000Z | — |
| `AUTH-AGENCY-UPLOAD-SelfCreated` | UPLOAD | SelfCreated | agency | document and logo uploads to the Agency this run created — never a pre-existing record | ahmed.ayman@tildetech.ae | 2026-08-23T00:00:00.000Z | — |

## Policy this run was authorized against

| Field | Value |
|---|---|
| Policy ID | `ndc-admin-portal-stg` |
| Policy version | 1 |
| Policy hash | `—` |

<!-- No credential, token, session identifier, or card value appears in this file, by design
     (execution safety §50). An approval names a role or an operator, never a secret. -->
