---
id: REPAIR-008
category: repair_patterns
title: JS-dispatched click as a guarded fallback for confirmed click-delivery defects — never the default click strategy
status: confirmed
tags: [primeng, angular-material, click-delivery, javascript-executor, guarded-fallback]
producer: self-healing-skill
consumers: [automation-skill, automation-execution-skill, self-healing-skill]
promoted_from: modules/branch/healing/RepairSummary.md (HEAL-BR-20260806-01, HEAL-BR-20260809-01)
confidence: "3 executions, 1 project"
related_knowledge: []
created: 2026-08-14
last_updated: 2026-08-14
version: 1
---

## Provenance

```
Source Pattern ID:  REPAIR-BR-010
Source Module:      Branch
Source Run:         HEAL-BR-20260806-01 (original confirmation), HEAL-BR-20260809-01 (2nd/3rd confirmation)
```

## Problem

Some PrimeNG/Angular-Material-family components do not reliably respond to a plain, driver-issued click
(`WebElement.click()` / the Selenium native click). The driver reports the click as delivered, but the
component's own event bindings never fire, so nothing changes — no navigation, no state update, no
visual response. This has been directly confirmed for a router-link-bound list button, pagination
controls, and row-action icons in this codebase, all sharing the same component family.

## Strategy — guarded fallback, not a default

**This is not a general-purpose replacement for a normal click.** It is promoted narrowly, with the
following mandatory guard rail, per explicit review:

1. **Attempt a normal, user-equivalent click first.** Only fall back to a JS-dispatched click after
   confirming the normal click did not produce the expected effect.
2. **Verify preconditions before dispatching:** the target element must be confirmed visible, enabled,
   and unobstructed (not covered by another element, not inside a closed/collapsed container). A
   JS-dispatched click on an element that fails these checks is not a synchronization fix — it is
   bypassing a state the application is deliberately presenting.
3. **Verify the expected post-click outcome actually occurred** (e.g. navigation happened, the expected
   state changed) — do not treat "the JS call executed without throwing" as success.
4. **Never use this to click through a disabled control or to bypass business validation.** If the
   element is genuinely disabled, or the application is correctly blocking the action pending some
   condition, that is the application's real behavior and must not be forced.

Only when a normal click is confirmed non-functional on a visible, enabled, unobstructed element — and
the fallback's own outcome is verified — is the JS-dispatched click justified.

## Applicable Conditions

Any PrimeNG, Angular Material, or similar component-library control confirmed (not assumed) to ignore a
standard driver-issued click while otherwise being visible, enabled, and unobstructed. Not applicable
as a first-line click strategy, and not applicable to any element whose disabled or hidden state should
legitimately block the interaction.

## Confidence

Confirmed 3 times in this project: the Add Branch list screen's `routerLink`-bound button (original
confirmation), pagination controls (`goToNextPage`/`goToLastPage`, TC-BR-060), and row-action edit-pen
icons (`clickEditPen`/`clickEditPenInRow`, TC-BR-065) — each confirmed via a live rerun going from
failing to passing with the JS-dispatched click as the only change, and no other assertion altered.

## Confirmed In

- `run-003__2026-08-04_11-24-38__UserStory__US-8599-SearchActions_US-8606-UpdateBranch`,
  `EXEC-BR-20260806-03` — `platform_core_data/modules/branch/healing/RepairSummary.md`
  (Healing Pass `HEAL-BR-20260806-01` original confirmation; `HEAL-BR-20260809-01` — `REPAIR-BR-010`,
  second and third confirmations).
