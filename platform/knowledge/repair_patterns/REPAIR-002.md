---
id: REPAIR-002
category: repair_patterns
title: Transient toast/snackbar — text-content locator + non-throwing presence poll
status: confirmed
---

## Problem

A transient, auto-dismissing message/toast element (renders for a few seconds, then disappears) is checked using (a) a locator strategy that doesn't actually match the real element (e.g., an assumed `aria-label` attribute match the live DOM doesn't carry), combined with (b) a framework helper whose own internal wait (e.g., SHAFT's `getText()`, ~60s FluentWait at 100ms intervals) throws an uncatchable-by-`catch(Exception)` `AssertionError`/`Error` on timeout — so a naive retry wrapper never actually gets to retry, and the long internal wait window can also outlast a message that has already auto-dismissed.

## Strategy

Two changes together: (1) replace the incorrect locator with a text-content-based match on the element's own direct text (`normalize-space(text())='...'`, not an ancestor's), confirmed against a DOM snapshot showing the real text present while the old locator's element count was 0; (2) check for presence using a raw, non-throwing primitive (e.g., `driver.findElements(locator).isEmpty()`) in a short, tight poll loop, only calling the framework's own assert-based text-read once presence is confirmed — never wrap the framework's long-internal-wait call directly in `catch (Exception e)` and expect it to be retryable, since a timeout there throws `Error`, not `Exception`.

## Applicable Conditions

Any transient toast/snackbar/inline-validation message in a client-side-rendered (SPA) app, especially where the exact ARIA/attribute structure hasn't been independently confirmed against the live DOM — verify with a DOM snapshot before trusting an attribute-based locator carried over from another source (e.g., a reference project). Framework note: the "long internal wait throws `Error`, not `Exception`" hazard is specific to frameworks whose assertion helpers use a FluentWait-style internal timeout (confirmed against SHAFT Engine; verify before assuming it applies to a different framework).

## Confidence

Confirmed by 1 execution, across 1 project.

## Confirmed In

- [[NDC/REP-003]] — `projects/NDC/knowledge_base/repair/REP-003.md`
