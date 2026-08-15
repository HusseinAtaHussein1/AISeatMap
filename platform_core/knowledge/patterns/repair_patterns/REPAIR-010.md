---
id: REPAIR-010
category: repair_patterns
title: Wait explicitly for a dependent field's own async population, not for an unrelated field on the same form
status: confirmed
tags: [primeng, dependent-field, async-load, form-readiness, synchronization]
producer: self-healing-skill
consumers: [automation-skill, automation-execution-skill, self-healing-skill]
promoted_from: modules/branch/healing/RepairSummary.md (HEAL-BR-20260809-01)
confidence: "1 execution, 1 project"
related_knowledge: [REPAIR-006, REPAIR-007]
created: 2026-08-14
last_updated: 2026-08-14
version: 1
---

## Provenance

```
Source Pattern ID:  REPAIR-BR-012
Source Module:      Branch
Source Run:         HEAL-BR-20260809-01
```

## Problem

A form's "page loaded" or "ready to interact" check is often built on one field's readiness (e.g. a
simple text input populating) and then assumed to cover the whole form. Where a dependent field (a
PrimeNG dropdown whose options come from a server round-trip tied to another field's value, such as
City depending on a selected Country/State) populates on an independent, slower async timeline, that
assumption is false: the "ready" check can resolve while the dependent field still literally displays
its own loading placeholder (e.g. `"loading..."`), and any read of that field immediately after
returns the placeholder text instead of real data.

## Strategy

Identify every field on the form that populates via its own asynchronous, dependent load — not just the
field the existing readiness check happens to use — and wait for each of them explicitly, bounded, for
their own loading-placeholder text to clear before treating the form as ready to read or interact with.
Do not infer one field's readiness from another's, even when they appear to load "at the same time" in
casual observation.

## Applicable Conditions

Any form with one or more dependent fields whose population is driven by an async call distinct from the
form's primary/fastest-loading field. Symptom to watch for: a field read immediately after a "page
loaded" wait returns a literal loading placeholder instead of real data, especially for dropdowns
populated based on another field's selected value.

## Confidence

Confirmed by 1 execution, 1 project (branch module): timestamp instrumentation directly observed the
City dropdown still reading `"loading..."` 213ms after the existing readiness check (based on the
Branch Name field) had already resolved; the fix (waiting explicitly for City's and State's labels to
move past `"loading..."`) was verified by rerun — TC-BR-055 passed with no other change.

## Confirmed In

- `run-003__2026-08-04_11-24-38__UserStory__US-8599-SearchActions_US-8606-UpdateBranch`,
  `EXEC-BR-20260806-03` — `platform_core_data/modules/branch/healing/RepairSummary.md`
  (Healing Pass `HEAL-BR-20260809-01` — `REPAIR-BR-012`).
