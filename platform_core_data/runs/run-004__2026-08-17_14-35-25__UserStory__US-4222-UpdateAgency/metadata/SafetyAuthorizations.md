# Safety Authorizations — run-004__2026-08-17_14-35-25__UserStory__US-4222-UpdateAgency

> Run-scoped human authorizations granted for this run, and this run only. The machine-readable
> source is `SafetyAuthorizations.json` beside this file; this document exists so a reviewer can
> read what was approved without parsing JSON.
>
> **None of these carries forward.** A future run asks fresh. None of them lifts a `Forbidden`
> policy rule — no run-scoped approval can.

_Last updated: 2026-08-18_

## Authorizations

| ID | Action | Ownership | Module | Scope | Approved by | Approved at |
|---|---|---|---|---|---|---|
| `AUTH-AGENCY-CREATE-SelfCreated` | CREATE | SelfCreated | agency | records this run creates | ahmed.ayman@tildetech.ae | 2026-08-17 |
| `AUTH-AGENCY-UPDATE-SelfCreated` | UPDATE | SelfCreated | agency | records this run creates | ahmed.ayman@tildetech.ae | 2026-08-17 |
| `AUTH-AGENCY-SUBMIT-SelfCreated` | SUBMIT | SelfCreated | agency | records this run creates | ahmed.ayman@tildetech.ae | 2026-08-17 |
| `AUTH-AGENCY-APPROVE-SelfCreated` | APPROVE | SelfCreated | agency | records this run creates | ahmed.ayman@tildetech.ae | 2026-08-17 |
| `AUTH-AGENCY-REJECT-SelfCreated` | REJECT | SelfCreated | agency | records this run creates | ahmed.ayman@tildetech.ae | 2026-08-17 |
| `AUTH-BRANCH-CREATE-SelfCreated` | CREATE | SelfCreated | **branch** | Branch records this run creates as its own fixtures | ahmed.ayman@tildetech.ae | **2026-08-18** |
| `AUTH-BRANCH-UPDATE-SelfCreated` | UPDATE | SelfCreated | **branch** | Branch records this run created | ahmed.ayman@tildetech.ae | **2026-08-18** |
| `AUTH-BRANCH-SUBMIT-SelfCreated` | SUBMIT | SelfCreated | **branch** | Branch records this run created | ahmed.ayman@tildetech.ae | **2026-08-18** |
| `AUTH-BRANCH-APPROVE-SelfCreated` | APPROVE | SelfCreated | **branch** | Branch records this run created | ahmed.ayman@tildetech.ae | **2026-08-18** |

## The dependency grant of 2026-08-18, in the operator's own terms

> Where something under test depends on other records, and the run can build those records itself,
> it builds them and runs the full cycle on its own. **It reserves nothing** unless told to at the time.

**What it authorizes.** Building a dependency the run owns, end to end: create it, configure it,
submit it, approve it. It exists because AC-9's PCC section is only reachable on an Agency whose
**parent Branch carries a supplier with a credential selected** (`BR-006`, `BR-008`) — so the Branch
is not context, it is a prerequisite of the thing under test.

**What it does not authorize, and cannot.** The words *"reserve nothing"* match what the policy already
holds absolute, so this grant does not widen them and no future grant could:

| Category | Standing decision |
|---|---|
| `booking` — BOOK · HOLD · TICKET · CANCEL_BOOKING · VOID | **Forbidden (absolute)** |
| `financial` — PAYMENT · TOP_UP · WALLET_CHARGE · REFUND | **Forbidden (absolute)** |
| `privileged` — CREDENTIAL_CHANGE · ROLE_PERMISSION_CHANGE | **Forbidden (absolute)** |
| `notification` — SEND_NOTIFICATION | Forbidden |
| `DELETE`, any ownership | Not granted; `PO-3` accepts retention instead of cleanup |

**The ownership line is the whole grant.** Every row above is `SelfCreated`. Acting on a record this
run did not create is unchanged: mutation needs its own grant, and **APPROVE / REJECT on a Shared or
Unknown record is `Forbidden (absolute)`**. That is not a formality — on 2026-08-18 this stage stopped
rather than edit Branch `BRN287`, precisely because it could have submitted a change and then been
unable to approve it, stranding a shared record in *Pending for approval*. The human made that change.

## Obligations attached to this grant

1. **Capture the identifier of every record created, at creation, before any other action** (`PO-2`).
2. **Record how many Branches and Agencies each execution created** (`PO-3`) — retention is accepted,
   cleanup by DELETE is not available.
3. **Reuse a self-created fixture wherever test independence and validity allow**, rather than seeding
   a fresh one per case.
4. **Tag seeded records identifiably** so ownership stays provable for the life of the record.

## Policy this run is authorized against

| Field | Value |
|---|---|
| Policy ID | `ndc-admin-portal-stg` |
| Policy version | 1 |
| Effective from | 2026-08-07 |
| Policy hash | `—` (not recorded at grant time) |

## Open item for Stage 1

`context/ProjectContext.md` §5 still reads that this run *"may **not** create or edit a Branch,
Supplier, Staff, Role, Payment Method, or any reference data."* The Branch rows above **contradict
that approved sentence**. The grant is recorded here because run-scoped authorizations live here, but
**Project Context §5 needs a matching Stage 1 revision** — Stage 2 does not edit an approved Stage 1
artifact. Until that revision exists, the two documents disagree, and this note is what makes the
disagreement visible instead of silent.

The Supplier, Payment Method and Role exclusions in that sentence are **unchanged and still binding**:
this grant covers Branch only, because a Branch is the one dependency the run can legitimately build
for itself.

<!-- No credential, token, session identifier, or card value appears in this file, by design.
     An approval names a role or an operator, never a secret. -->
