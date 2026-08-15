---
id: REPAIR-012
category: repair_patterns
title: Detect silent action-delivery failure by reading the control's own state, then fall back to a DOM write plus the framework's expected events
status: confirmed
tags: [action-delivery, silent-failure, angular, primeng, shaft, selenium, guarded-fallback, form-control]
producer: self-healing-skill
consumers: [automation-skill, automation-execution-skill, self-healing-skill]
promoted_from: modules/branch/healing/RepairSummary.md (HEAL-BR-20260815-01)
confidence: "1 execution, 1 project"
related_knowledge: [REPAIR-008, REPAIR-006]
created: 2026-08-15
last_updated: 2026-08-15
version: 1
---

## Provenance

```
Source Pattern ID:  REPAIR-BR-013
Source Module:      Branch
Source Run:         HEAL-BR-20260815-01 (EXEC-BR-20260815-02)
```

## Problem

A test framework's element actions — typing and clicking alike — can be reported as delivered while
reaching nothing. The call returns cleanly, the log records the action as performed, and the control
does not change: the input stays empty, the radio stays unselected, the button's handler never runs.

This is worse than an outright error, in two specific ways:

1. **It produces false passes.** A search whose filter never arrived runs unfiltered and returns the
   full result set. A test asserting "the record I searched for is in the results" then passes for
   entirely the wrong reason. One test in the source module passed this way for weeks.
2. **It looks like an application defect.** The natural reading of "I typed a filter and got
   unfiltered results" is that filtering is broken. Investigation time gets spent on an application
   that is behaving correctly.

The failure is **screen-specific, not global**. In the source case, the identical driver typed
successfully into the login form and into every field of another form in the same session, while
delivering nothing to one particular screen's controls. So "the framework is broken" and "the
application is broken" are both wrong conclusions, and both are easy to reach.

## Strategy — detect non-arrival, then fall back; never replace the normal action

1. **Perform the normal, user-equivalent action first, every time.** Never begin with the fallback.
   Where the normal action works, it must be what runs — including on later attempts within the same
   run, since delivery can be intermittent.
2. **Detect arrival by reading the control's own state, with a short bounded probe.** Read the input's
   value, the radio's `isSelected()`, the panel's presence — not the absence of an exception, and not
   the framework's own "action performed" log line. Keep the probe short: it measures whether an
   action arrived, not how long the application takes to respond.
3. **On non-arrival, apply the fallback for that interaction type:**
   - *Typing:* set the value through the DOM, then dispatch the events the UI framework's form
     binding listens for — `input`, `change`, and, where field-level validation is touched-based,
     `blur` and `focusout`. Setting the value alone is not enough: a modern form control ignores a
     value it was not told about.
   - *Clicking:* dispatch the mouse event sequence (see `REPAIR-008`, whose guard rails apply in
     full).
4. **Verify the fallback's own outcome by the same state read.** A JS call that did not throw is not
   evidence the interaction worked.
5. **Prove commit by something other than the assertion under test.** In the source case a dropdown
   selection was proven by the panel closing, deliberately not by the dependent field enabling —
   that was the test's own assertion, and a page object proving it would have made the test
   tautological.
6. **Check current state before re-driving an open/close control.** A retry loop that blindly
   re-clicks a toggle can close the panel its own previous click opened. The source case's earlier,
   unconfirmed repair had exactly this defect.

## What this is not

- **Not a way past a disabled or blocked control.** A read-only or disabled input rejects a DOM write
  the same way, and the arrival check still has to pass. If the application is deliberately blocking
  the interaction, that is real behaviour and must not be forced (`REPAIR-008` rule 4).
- **Not a substitute for fixing the framework.** It is a workaround at the automation layer. The
  underlying delivery defect remains, and the version or configuration causing it is worth a separate
  decision.
- **Not a licence to weaken an assertion.** This pattern changes only *how the test interacts with*
  the application, never *what it asserts to be correct*.

## Applicable Conditions

Any framework/component-library pair where an element action is confirmed — not assumed — to be
reported as delivered while the control does not change, and where the control is otherwise visible,
enabled, and unobstructed. Confirmed against SHAFT Engine 7.4 with PrimeNG/Angular; the mechanism
(framework reports success, form binding never notified) is not specific to either.

**Confirm before applying.** Read the control's state after a normal action and observe it unchanged.
Applying this pattern on the assumption of a delivery defect, rather than on evidence of one, hides
whatever the real cause is.

## Confidence

Confirmed once: 6 tests moved from failing to passing with this as the only change, no assertion
altered, zero regressions. The typing half was independently proven beforehand — the same
set-value-and-dispatch approach had already been in production use across 13 passing tests on another
screen of the same application, which is why it was reused here rather than invented.

Native keystroke delivery (`clear()` + `sendKeys()`) was separately tried against the same controls
and left them empty, so the fallback is not merely another way of sending keystrokes.

## Confirmed In

- `run-003__2026-08-04_11-24-38__UserStory__US-8599-SearchActions_US-8606-UpdateBranch`,
  `EXEC-BR-20260815-02` — `platform_core_data/modules/branch/healing/RepairSummary.md`
  (Healing Pass `HEAL-BR-20260815-01`), rerun record
  `execution/ExecutionResults.rerun-24.md`. Tests TC-BR-040, 041, 042, 043, 045, 046.
