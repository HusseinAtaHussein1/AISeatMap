---
id: REPAIR-014
category: repair_patterns
title: Wait on the signal that changes when the value binds, not on the absence of a transient status string
status: confirmed
tags: [async-load, form-readiness, synchronization, placeholder, dependent-field, ordering-defect]
producer: self-healing-skill
consumers: [automation-skill, automation-execution-skill, self-healing-skill]
extends: REPAIR-010
---

# REPAIR-014 — Wait on the signal that changes when the value binds, not on the absence of a transient status string

## Provenance

| Field | Value |
|---|---|
| ID | `REPAIR-014` |
| Promoted | 2026-08-17, with explicit human approval (`pipeline.md` §10.5) |
| Originating pass | `HEAL-BR-20260817-01`, module `branch`, project-local ID `REPAIR-BR-013` |
| Confirmed by | 3 executions — Headed ×2, Headless ×1 — plus a full-suite regression |
| Confirmed in | `run-003__2026-08-04_11-24-38__UserStory__US-8599-SearchActions_US-8606-UpdateBranch` → `execution/ExecutionResults.rerun-30.md`, `EXEC-BR-20260817-5H-01` |
| Extends | [`REPAIR-010`](REPAIR-010.md) — does not replace it |

## Problem

A readiness wait is keyed on a field's **transient status text** — `"loading..."`, `"Please wait"`,
`"--"`, `"Fetching…"` — with a condition of the shape *"wait until the text is no longer the loading
string"*.

The wait then passes **before the field has begun loading at all**, because the field's initial state
also satisfies the condition. An asynchronously-populated control typically passes through three
states, not two:

```
""  (empty / placeholder)   →   "loading..."   →   the real value
```

An empty label is not the string `"loading..."`, so *"not loading"* is already true in state one. The
wait releases immediately, the caller reads an empty field, and the assertion fails on a value that
was always going to arrive a moment later.

**This is an ordering defect, not a slow-load defect**, and the distinction is the whole point:

- Raising the timeout changes **nothing**, because the wait is *exiting instantly*, not expiring.
- The failure is **intermittent** in a way that looks like flakiness — it passes whenever the value
  happens to arrive before the read, and fails whenever it does not.
- It survives a previous, *correct* repair of the same area. A prior fix that added an explicit wait
  for the loading string to clear is not wrong; it is watching the wrong edge of the right state.

The mechanism is also invisible in a pass/fail report. Only a timestamped observation shows it:

```
waitUntilLoaded resolved t=697ms  cityLabel=""  cityPlaceholder=true
city()          t=498ms sinceLoaded  value="loading..."  placeholder=true
```

The field entered the loading state 498 ms **after** the form was declared ready.

## Strategy

Key the wait on a signal that changes **when a value is actually bound**, not on the absence of a
status string.

1. **Find a state marker rather than a text value.** UI libraries usually expose one: a CSS class on
   the control while nothing is selected (PrimeNG `p-placeholder`, Select2 `select2-selection__placeholder`),
   an `aria-*` attribute, a `data-*` flag, or the bound value in the DOM. Verify the marker is present
   in **every** unready state, including the initial one — that is exactly the check the text-based
   condition failed.
2. **Prefer the marker's removal as the condition.** *"The placeholder marker is gone"* means a value
   is bound. *"The text is not the loading string"* only means the text is not one particular string.
3. **Where no marker exists, require a positive assertion about the value** — non-empty **and** not
   any known transient string — never the negation of a single transient string alone.
4. **Wait per field, independently.** One dependent field's readiness is never evidence about
   another's; this is `REPAIR-010`'s rule and it still binds.
5. **Keep the wait bounded**, and let the caller's own assertion produce the failure when the value
   genuinely never arrives. The repair changes *when* the code reads, never *what* it asserts.

## Applicable Conditions

- Any asynchronously-populated form control that displays a transient status string before its value.
- Any framework and any UI library — the shape of the defect is the state sequence, not the technology.
- Especially where a dependent control loads on a separate timeline from its siblings (a
  country → state → city chain, a lookup that fires after another field is set).
- **Strongly indicated when** an existing wait already handles a loading string and the field still
  reads empty intermittently. That combination is close to diagnostic for this pattern.

## How to tell this pattern from a genuine application defect

This matters, because the repair is forbidden if the application is actually at fault
(`self-healing-skill` §8). Two observations separate them, and both are cheap:

- **The field is observed entering the loading state at all.** A fetch that starts is a fetch the
  application intends to complete. If the control never leaves its initial state across the full
  bounded wait, the application is not populating it — that is a defect to report, not to wait out.
- **The same field has been observed holding the real value in another run.** Then the value demonstrably
  arrives, and reading too early is the only remaining explanation.

Without at least one of these, the honest outcome is a diagnosis record, not a repair.

## Anti-pattern — what not to do instead

- **Do not raise the timeout.** It cannot help; the wait is not expiring.
- **Do not add a fixed sleep.** It trades a fast wrong answer for a slow unreliable one.
- **Do not add a retry around the assertion.** That hides the race and removes the signal.
- **Do not widen the expected value** to accept `""` or the loading string. That is weakening an
  assertion, which is prohibited outright.

## Confidence

Confirmed by 3 executions across 1 project. Derived confidence at proposal time was 90%, built from a
directly observed root cause with timestamps in both execution modes, reproduction across four runs,
a matching prior pattern (`REPAIR-010`), and a clean static verification before the rerun.

The repair was accepted only after the **mechanism** was observed to change, not merely the outcome:
the same wait moved from resolving in 697 ms with the placeholder marker present, to resolving in
0.8–7.5 s with the marker gone and the value bound.
