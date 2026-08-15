---
id: REPAIR-011
category: repair_patterns
title: Bounded, re-locating retry on StaleElementReferenceException for a grid read that races a re-render
status: confirmed
tags: [selenium, stale-element, grid, re-render, bounded-retry, guarded-recovery]
producer: self-healing-skill
consumers: [automation-skill, automation-execution-skill, self-healing-skill]
promoted_from: modules/branch/healing/RepairSummary.md (HEAL-BR-20260809-01)
confidence: "1 execution, 1 project"
related_knowledge: [REPAIR-005]
created: 2026-08-14
last_updated: 2026-08-14
version: 1
---

## Provenance

```
Source Test Case:   TC-BR-043
Source Module:      Branch
Source Run:         HEAL-BR-20260809-01
```

## Problem

A grid/list read that locates a `WebElement` and then performs a nested read against it (text, value,
class, attribute) can hit `StaleElementReferenceException` when the underlying row or cell re-renders
between the locate and the read — a genuine concurrent-DOM-update race, not evidence that the element
never existed or that the data is wrong.

## Strategy — bounded stale-read recovery, not a universal retry

**This is promoted narrowly as a stale-read recovery technique, per explicit review — not as a
general-purpose retry wrapper for any failure.**

1. **Re-locate from the current DOM on every attempt.** Discard all previously captured `WebElement`
   references entirely — a stale reference must never be reused or re-read; the grid and the target
   row/cell are found again from scratch each attempt.
2. **Retry only for a confirmed concurrent re-render**, i.e. only on `StaleElementReferenceException`
   itself — never as a catch-all for other exception types or for a genuinely absent element.
3. **Bound the retry to a maximum of 3 attempts**, with a condition-based wait between attempts (not a
   fixed sleep) so each retry only re-attempts once the DOM has plausibly settled.
4. **If staleness persists past the attempt limit, fail with the original diagnostic evidence** —
   report the failure as it actually occurred, rather than swallowing it or reporting a generic timeout
   that would obscure the real cause. Masking a persistent staleness this way is exactly the kind of
   result-suppression the platform's healing rules forbid.

## Applicable Conditions

Any Selenium-based (or equivalent) suite reading from a grid/list whose rows or cells can re-render
concurrently with the read — pagination refresh, live data updates, or a search result replacing itself.
Not applicable as a blanket retry for arbitrary failures, and not a substitute for diagnosing a
genuinely absent element or a real application defect.

## Confidence

Confirmed by 1 execution, 1 project (branch module): applied to `Branch_Common.textOf` / `valueOfInput`
/ `visibleTextsOf` / `hasClass` and several `SearchBranch_Page` grid-read methods; TC-BR-043 passed
cleanly in 2 of 2 verification cycles with no `StaleElementReferenceException` recurrence.

## Confirmed In

- `run-003__2026-08-04_11-24-38__UserStory__US-8599-SearchActions_US-8606-UpdateBranch`,
  `EXEC-BR-20260806-03` — `platform_core_data/modules/branch/healing/RepairSummary.md`
  (Healing Pass `HEAL-BR-20260809-01`).
