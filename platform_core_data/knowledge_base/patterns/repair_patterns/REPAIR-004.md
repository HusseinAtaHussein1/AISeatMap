---
id: REPAIR-004
category: repair_patterns
title: Reach a client-side SPA route via its own in-app trigger element, never via a direct URL navigation
status: confirmed
tags: [spa, angular, routing, navigation, client-side-route]
producer: self-healing-skill
consumers: [automation-skill, automation-execution-skill, self-healing-skill]
promoted_from: modules/branch/healing/RepairSummary.md (HEAL-BR-20260805-01)
confidence: "1 execution, 1 project"
related_knowledge: []
created: 2026-08-05
last_updated: 2026-08-05
version: 1
---

## Problem

A Page Object reaches a target screen by calling `navigateToURL()`/`driver.get()` directly on that
screen's URL. When the target route is a client-side-only route in a single-page application (e.g. an
Angular route reached only via `routerLink`, with no server-side render for a cold request to that
path), every subsequent element lookup on the "loaded" page fails with `NoSuchElementException` —
the browser has the right URL in its address bar, but the SPA's router/component tree was never
actually entered, so the expected form/screen never renders.

## Strategy

Reach the route via its own in-app trigger element (a `routerLink`-bound button or link, confirmed live
against the DOM) from a screen that IS safely reachable by direct navigation, rather than navigating
straight to the deep route's URL:

```java
driver.browser().navigateToURL(EnvironmentConfig.listScreenUrl());  // the safe, direct-navigable screen
driver.element().click(IN_APP_TRIGGER_LOCATOR);                     // e.g. button[routerlink='add']
```

Confirm the trigger locator live (DOM inspection) rather than guessing — the routing attribute itself
(e.g. `routerlink="add"`) is strong, durable evidence that the target is a client-side route and that
this is the correct entry path.

## Applicable Conditions

Any Page Object for a single-page application (Angular, React Router, Vue Router, etc.) whose target
screen is reached only through client-side routing rather than a URL the server can render directly.
Symptom to watch for: the browser's reported URL after navigation looks correct, but every element on
that "page" is missing — check the DOM for a `routerLink`/`router-link`/similar attribute on the
element that would normally lead there from elsewhere in the app.

## Confidence

Confirmed by 1 execution, across 1 project (branch module, `run-003`): 0/13 Add Branch cases could
locate any form field before this fix (all failed on distinct field locators, all traced to the form
never having rendered); 12/13 passed immediately after switching to the in-app trigger. 1/13
(TC-BR-001) still failed for a separate, undiagnosed cause specific to running first in a fresh JVM
fork — not attributable to this pattern, since every other test using the same fix passed.

## Confirmed In

- `run-003__2026-08-04_11-24-38__UserStory__US-8599-SearchActions_US-8606-UpdateBranch`,
  `EXEC-BR-20260805-01` / `rerun-1` — `platform_core_data/modules/branch/healing/RepairSummary.md`
  (Healing Pass `HEAL-BR-20260805-01`).
