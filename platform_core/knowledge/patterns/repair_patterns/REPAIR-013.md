---
id: REPAIR-013
category: repair_patterns
title: Address a required-state record by configured identity instead of scanning a paginated list for it
status: confirmed
tags: [pagination, test-data, precondition, fixture, determinism, grid, search]
producer: self-healing-skill
consumers: [automation-skill, automation-execution-skill, self-healing-skill]
promoted_from: modules/branch/healing/RepairSummary.md (HEAL-BR-20260815-02)
confidence: "1 execution, 1 project"
related_knowledge: [REPAIR-009]
created: 2026-08-15
last_updated: 2026-08-15
version: 1
---

## Provenance

```
Source Pattern ID:  REPAIR-BR-014
Source Module:      Branch
Source Run:         HEAL-BR-20260815-02 (EXEC-BR-20260815-03)
```

## Problem

A test needs one record in a particular state — rejected, expired, archived, suspended — and finds it
by walking a paginated list until it sees one. The walk is bounded, because an unbounded one can loop
forever on a mis-read paginator.

The bound is the defect. States are rarely distributed evenly through a default ordering: newly
created records cluster at the front, while a state the workflow reaches rarely, or that is only ever
reached by old records, sits deep. The test then fails with "no record in state X found within N
pages" — which reads as missing test data, and usually is not. The records exist; the scan simply
stopped short.

This wastes investigation time twice over. Someone checks the environment, finds the records present,
and concludes the test is flaky. Meanwhile the real failure mode is invisible: **raising the bound
makes the test pass, which looks like a fix and is not one.** The next environment, or the next few
hundred records, puts the state back out of reach.

## Strategy

1. **Establish where the state actually lives, once.** Temporarily raise the bound as a deliberate
   diagnosis step and record which record satisfied each state and at which page. Revert the bound in
   the same pass — the probe is evidence-gathering, not the repair. In the source case: two states on
   page 1, the third at page 18 of roughly 52.
2. **Configure the deep state as a named fixture** in the project's existing test-data mechanism —
   its identifier, not a page number or row index. Do not introduce a new configuration layer for it.
3. **Address it directly** — search or fetch by that identifier. One lookup replaces the walk.
4. **Re-verify the record still holds the expected state before asserting anything about it.** This is
   what separates the pattern from hardcoding: a fixture that has since changed state must fail as an
   out-of-date fixture, naming the record and saying what to change, never as a false defect in the
   behaviour under test.
5. **Keep scanning for states the scan finds immediately.** Configuring every state would add fixtures
   that earn nothing and that can go stale. In the source case only one of three states needed this.

## What this is not

- **Not a reason to raise the bound instead.** A larger bound is slower, still environment-dependent,
  and fails the same way once the data grows. It moves the threshold without making anything
  deterministic.
- **Not the same as hardcoding a record.** The identifier is configuration, and step 4's state check
  is mandatory. Without that check this degrades into a brittle dependency on a record nobody is
  maintaining.
- **Not preferable to provisioning where provisioning is genuinely available.** A test that creates
  its own record in the required state depends on no pre-existing data at all, which is stronger. Use
  this pattern where provisioning is not viable — for example where the suite is deliberately
  read-only, or where the transition into that state has never been automated.

## Applicable Conditions

Any test needing a record in a specific state, drawn from a paginated or ordered collection it does
not control, where that state is unevenly distributed through the default ordering. Independent of UI
technology and equally applicable to API-driven list endpoints.

## Confidence

Confirmed once. The source test moved from failing ("no row with Approval Status Rejected found
within the configured 10-page scan limit") to passing, with the scan bound restored to its original
value and no assertion or expected value altered. It also ran faster: two tests in 57.5 s against
71.3 s for the one test alone under the raised probe bound.

## Confirmed In

- `run-003__2026-08-04_11-24-38__UserStory__US-8599-SearchActions_US-8606-UpdateBranch`,
  `EXEC-BR-20260815-03` — `platform_core_data/modules/branch/healing/RepairSummary.md`
  (Healing Pass `HEAL-BR-20260815-02`), rerun record
  `execution/ExecutionResults.rerun-25.md`. Test TC-BR-054.
