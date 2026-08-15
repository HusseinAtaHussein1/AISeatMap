---
id: REPAIR-006
category: repair_patterns
title: Wait for a commit signal, not option-appearance, when selecting from a re-rendering filter autocomplete
status: confirmed
tags: [angular, primeng, autocomplete, race-condition, synchronization, re-render]
producer: self-healing-skill
consumers: [automation-skill, automation-execution-skill, self-healing-skill]
promoted_from: modules/branch/healing/RepairSummary.md (HEAL-BR-20260806-01, addendum)
confidence: "1 execution, 1 project"
related_knowledge: [REPAIR-005]
created: 2026-08-14
last_updated: 2026-08-14
version: 1
---

## Provenance

```
Source Pattern ID:  REPAIR-BR-008
Source Module:      Branch
Source Run:         HEAL-BR-20260806-01 (addendum)
```

## Problem

An Angular/PrimeNG-style `p-autocomplete` (or equivalent filtering-dropdown component) re-renders its
suggestion panel while the user's input is still being filtered. An option clicked the instant it
appears in the DOM can already be the element Angular is about to replace with a fresh one on the next
render tick — the click lands on a now-detached node and the selection silently never commits. This
produces intermittent, order-dependent failures: the same step passes when run in isolation and fails
when run as part of a larger suite, because timing (not logic) determines whether the click beats the
re-render.

## Strategy

Do not treat "the option element exists" as sufficient to click it. Instead:

1. Wait for the option to exist (a `findElements` presence check).
2. Click it.
3. Wait for an independent, observable **commit signal** — some effect that only occurs once the
   selection has actually taken hold (e.g. a dependent field auto-populating, a form-state change).
4. If the commit signal does not appear within a bounded time, re-open the dropdown, re-filter, and
   re-click — up to a small fixed number of attempts (3 confirmed sufficient) — then fail loudly if it
   still does not commit.

Explicitly **not** a longer timeout on the original click-and-hope sequence: raising a timeout does not
address a race whose failure mode is "clicked the wrong instance," and would only make the flake
frequency-dependent rather than eliminating it.

## Applicable Conditions

Any Angular (or similar virtual-DOM / component-re-rendering framework) autocomplete-style control
whose option list re-renders while filtering. Symptom to watch for: a selection step that passes
reliably alone but fails intermittently inside a larger run, with no exception at the click itself —
the click "succeeds" against a detached element and the downstream state never reflects the intended
selection.

## Confidence

Confirmed by 1 execution, 1 project (branch module): reproduced the failure directly (`diagnosis7.log`
vs `diagnosis8.log` — an immediate click failed 2 of 4 attempts, the identical sequence with a settle
wait and re-drive succeeded 3 of 3), then confirmed by rerun across 4 tests (TC-BR-002, 013, 021, 038)
going from failing to passing with no other change.

## Confirmed In

- `run-003__2026-08-04_11-24-38__UserStory__US-8599-SearchActions_US-8606-UpdateBranch`,
  `EXEC-BR-20260806-03` — `platform_core_data/modules/branch/healing/RepairSummary.md`
  (Healing Pass `HEAL-BR-20260806-01`, addendum — `REPAIR-BR-008`).
