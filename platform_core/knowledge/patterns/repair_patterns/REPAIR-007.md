---
id: REPAIR-007
category: repair_patterns
title: Require an empty-state to hold steady before trusting it, when a grid can render it transiently mid-refresh
status: confirmed
tags: [grid, list, empty-state, race-condition, synchronization, search]
producer: self-healing-skill
consumers: [automation-skill, automation-execution-skill, self-healing-skill]
promoted_from: modules/branch/healing/RepairSummary.md (HEAL-BR-20260809-01)
confidence: "1 execution, 1 project"
related_knowledge: [REPAIR-005, REPAIR-006]
created: 2026-08-14
last_updated: 2026-08-14
version: 1
---

## Provenance

```
Source Pattern ID:  REPAIR-BR-009
Source Module:      Branch
Source Run:         HEAL-BR-20260809-01
```

## Problem

A grid or list's "no results" placeholder can render **both** for a genuine zero-result query **and**
transiently while the component clears its previous rows before the new result set streams in. A wait
condition that treats the placeholder's mere presence as final resolves in ~200-250ms — far faster than
a genuine content change elsewhere in the same page (typically 1-2.5s) — and every downstream read
inherits a false-empty result: row counts read as zero, pagination controls appear absent, and
page-scan loops record a false empty page before permanently advancing past the real data.

## Strategy

Require the empty-state signal to hold **continuously** for a short settle window (600ms, roughly two
poll cycles, confirmed sufficient) before accepting it as final, rather than accepting it the instant it
appears. This is the same "wait for a stable signal, not mere appearance" principle as `REPAIR-006`,
applied to a disappearance/empty-state condition instead of an option-selection condition.

## Applicable Conditions

Any grid/list component whose "no results" placeholder can render transiently during a data refresh —
not specific to any one framework. Symptom to watch for: a search or filter action that appears to find
zero rows near-instantly, while a slower, independently-verified check of the same query shows real
data present; especially where a page-scan or pagination loop consistently mis-terminates or misreads
its first iteration.

## Confidence

Confirmed by 1 execution, 1 project (branch module): Selenium-side instrumentation directly observed the
mechanism (`clickSearch()` resolving in ~200ms on the empty-state placeholder while genuine content
changes elsewhere took 1-2.5s); a verification rerun of the same 5 tests (TC-BR-054, 055, 060, 061, 065)
showed zero false-empty reads across the entire run after the fix, confirming the specific defect this
pattern targets.

## Confirmed In

- `run-003__2026-08-04_11-24-38__UserStory__US-8599-SearchActions_US-8606-UpdateBranch`,
  `EXEC-BR-20260806-03` — `platform_core_data/modules/branch/healing/RepairSummary.md`
  (Healing Pass `HEAL-BR-20260809-01` — `REPAIR-BR-009`).
