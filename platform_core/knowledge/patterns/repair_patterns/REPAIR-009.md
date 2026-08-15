---
id: REPAIR-009
category: repair_patterns
title: Infer "more pages available" from current-vs-highest page number when a paginator gives no disabled-state signal
status: confirmed
tags: [pagination, primeng, disabled-state, convergence]
producer: self-healing-skill
consumers: [automation-skill, automation-execution-skill, self-healing-skill]
promoted_from: modules/branch/healing/RepairSummary.md (HEAL-BR-20260809-01)
confidence: "1 execution, 1 project"
related_knowledge: [REPAIR-008]
created: 2026-08-14
last_updated: 2026-08-14
version: 1
---

## Provenance

```
Source Pattern ID:  REPAIR-BR-011
Source Module:      Branch
Source Run:         HEAL-BR-20260809-01
```

## Problem

A "has next page" check built on inspecting the next-page button for a `disabled` attribute or a
disabled CSS class fails silently when the component never emits that signal at all — the button's
markup is identical whether or not a next page actually exists. Any wait or loop-termination logic
built on that check is structurally broken: it will report "more pages available" forever, even on the
genuine last page, because there is no disabled signal to observe.

## Strategy

Do not infer pagination state from the button's own attributes/classes when the component is confirmed
not to expose a disabled signal. Instead, compare the currently-selected page number to the highest
page number the paginator currently offers (`currentPageNumber() < highestOfferedPageNumber()`) — the
same page-number-based technique already used for the paginator's own "jump to last page" convergence
logic, applied here to next-page availability instead.

## Applicable Conditions

Any paginator component confirmed — via direct DOM inspection on a known-last page — to render its
next/previous controls identically regardless of whether further pages exist. Symptom to watch for: a
pagination loop that never terminates, or a "next page" check that returns true even when manual
inspection confirms the current page is the last one.

## Confidence

Confirmed by 1 execution, 1 project (branch module): live DOM inspection of a confirmed-last page showed
the next button with no `disabled` attribute or class present; the page-number-comparison replacement
was verified to correctly resolve `hasNextPage()` to false on that same page, and TC-BR-061 passed after
the change with no other repair applied to it in this pass.

## Confirmed In

- `run-003__2026-08-04_11-24-38__UserStory__US-8599-SearchActions_US-8606-UpdateBranch`,
  `EXEC-BR-20260806-03` — `platform_core_data/modules/branch/healing/RepairSummary.md`
  (Healing Pass `HEAL-BR-20260809-01` — `REPAIR-BR-011`).
