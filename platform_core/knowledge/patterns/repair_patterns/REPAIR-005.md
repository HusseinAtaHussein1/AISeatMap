---
id: REPAIR-005
category: repair_patterns
title: Poll with findElements().isEmpty() instead of presenceOfElementLocated on a listener-wrapped WebDriver
status: confirmed
tags: [selenium, shaft, fluentwait, webdriver-listener, timeout-handling, synchronization]
producer: self-healing-skill
consumers: [automation-skill, automation-execution-skill, self-healing-skill]
promoted_from: modules/branch/healing/RepairSummary.md (HEAL-BR-20260806-01, confirmed HEAL-BR-20260809-01)
confidence: "4 executions, 1 project"
related_knowledge: []
created: 2026-08-14
last_updated: 2026-08-14
version: 1
---

## Provenance

```
Source Pattern ID:  REPAIR-BR-001
Source Module:      Branch
Source Run:         HEAL-BR-20260806-01 (addendum)
```

## Problem

A `FluentWait` (or equivalent bounded wait) built on top of a listener-wrapped `WebDriver` (e.g. SHAFT
Engine's own listened driver) can abort on its very first poll instead of retrying for the configured
duration. The listener intercepts the underlying driver call and throws a *wrapped* `TimeoutException`
of its own when the element is not yet present — but `FluentWait`'s default `ignoring(...)` set only
suppresses `NotFoundException`-family exceptions, not `TimeoutException`. The wait therefore exits on
the first failed poll (observed: `"tried for 0 second(s)"`) rather than waiting out its configured
timeout, and if the surrounding code only logs a `WARN` on that outcome, the failure to select/interact
is silent — the calling test proceeds as if the action succeeded.

## Strategy

Poll using `!driver.findElements(locator).isEmpty()` (a plain, unwrapped element-presence check that
never throws) as the wait's exit condition, instead of a condition built on `presenceOfElementLocated`
or any other check that lets the listener's wrapped exception propagate into the wait loop.

## Applicable Conditions

Any Selenium-based suite using a listener/wrapper around `WebDriver` (SHAFT Engine or an equivalent
observability/reporting listener) where a `FluentWait`-style condition is built on a locator-lookup
method that can throw through the listener. Symptom to watch for: a wait that should retry for its
full configured duration instead failing near-instantly, with the listener log showing a `WARN` or a
wrapped `TimeoutException` rather than the expected `NoSuchElementException`.

## Confidence

Confirmed by 4 executions, 1 project (branch module): applied in `AddBranch_Page.selectAutocompleteOption`
during `HEAL-BR-20260806-01`, and confirmed passing across TC-BR-002, TC-BR-013, TC-BR-021, and
TC-BR-038 once `HEAL-BR-20260806-01`'s addendum (`REPAIR-BR-008`) resolved the accompanying autocomplete
race — all four now land in the Fixed column.

## Confirmed In

- `run-003__2026-08-04_11-24-38__UserStory__US-8599-SearchActions_US-8606-UpdateBranch`,
  `EXEC-BR-20260806-03` — `platform_core_data/modules/branch/healing/RepairSummary.md`
  (Healing Pass `HEAL-BR-20260806-01`, addendum).
