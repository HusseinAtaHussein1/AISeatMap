# FINDING-012 — `Blue Command Screen` is present, disabled, and documented nowhere

| Field | Value |
|---|---|
| **Finding ID** | FINDING-012 |
| **Title** | Agency Features carries a third, disabled toggle with a dependency hint that no requirement mentions |
| **Category** | Requirement Gap |
| **Severity** | N/A |
| **Severity Reason** | `Requirement Gap` carries `N/A` automatically (§5.4) — this is a gap in documentation coverage, not an application malfunction. |
| **Confidence Score** | 95% |
| **Evidence Category** | Direct Observation |
| **Status** | Needs Human Review — **the scope question is answered** (see below); the Status stays until a reviewer accepts the Finding at the Stage 2 gate |
| **Discovery Mode** | Browser automation — **Browser Driver**, headed |
| **Requirement Disposition** | **Documented exception — out of scope by product-owner decision, 2026-08-18.** Was `Story Outdated / Requires Business Confirmation` (row 2) when raised |
| **Business Risk** | An operator sees a permanently greyed control on a form they are asked to complete. If the dependency hint is the only explanation, a user whose agency has no Galileo supplier has no route to enabling it and no owner to ask. |
| **Technical Risk** | The control's enabled state depends on supplier configuration held in another module. That coupling is undocumented, so a change in `master-supplier` can silently alter what the Agency form offers. |
| **Module** | `agency` |
| **Workflow** | Admin → Agency → edit agency 949 → Agency Features |

## Description

The **Agency Features** section renders three checkboxes:

| Control | State on record 949 |
|---|---|
| `Import PNR Option` | ticked, enabled — this is US-4222 AC-10's toggle |
| `Transfer Pnr Option` | ticked, enabled — undocumented |
| `Blue Command Screen` | unticked, **disabled**, with the hint *"This option requires the Galileo supplier to be enabled"* |

US-4222 AC-10 names only the Import PNR toggle. The other two appear in no acceptance criterion and in no PRD requirement.

## Expected Behavior

US-4222 AC-10 covers the Import PNR toggle only. PRD **ORG-05** `[V]` lists an *Import PNR toggle* as part of the agency form and says nothing about further feature toggles. The Project Context does not define expected behaviour for `Transfer Pnr Option` or `Blue Command Screen` — **not defined in Project Context** is the complete statement of expectation here.

## Actual Behavior

Three toggles render. `Blue Command Screen` is disabled with an inline dependency hint naming the Galileo supplier. The record's Product Access table holds one supplier, `TravelportNdc`, which is consistent with the hint but was not proven to be its cause.

## Steps to Reproduce

1. Log in as `odeysysadmin`, open `/admin/agency/edit/949`.
2. Scroll to **Agency Features**, below the PCC section.
3. Observe the three controls and the hint under `Blue Command Screen`.

## Investigation/Recovery Result

Investigation and Recovery Engine — **not applicable, no failure category matched.** The disabled state is deterministic and was re-observed on every page load in this run.

## Investigation Notes

- This extends run-001's FINDING-005 (undocumented fields), which listed `Transfer Pnr Option` and `Blue Command Screen` among seven undocumented controls. run-004 adds two facts run-001 did not record: the control is **disabled**, and it states **why** in an inline hint.
- **Not probed:** whether enabling a Galileo supplier enables the control. That would require changing Product Access or supplier configuration and saving it — the first on a shared record, the second in an out-of-scope module. Both are outside the run-004 mutation grant (ProjectContext §5).
- `Transfer Pnr Option` was observed enabled and ticked; it was not toggled.

## Occurrence Count

1

## Decided — 2026-08-18: out of scope for run-004

> **Product-owner decision:** remove `Transfer Pnr Option`, `Blue Command Screen` and `Enable Search Limit` from this run's scope. They are discussed when the User Story for their own feature arrives.

This is a **decision, not a deferral pending an answer** — the same standing as `PO-5` (`Save as Draft`). It follows the precedent already set in Project Context §3 and `PO-11`: a capability the human has not brought into scope is excluded deliberately, and the exclusion is recorded so it stays visible rather than looking like coverage.

**What it changes:**

| | |
|---|---|
| Stage 3 | Designs **no** test case for any of the three controls. Does not assert their state, their labels, or the Galileo dependency |
| Stage 4A / 5A | Does not touch them. An automated Agency update leaves all three exactly as loaded |
| This Finding | Stays on record as a **documented exception**. It is not withdrawn, because the controls do exist and the next reader needs to know why no test covers them |

**What it does not change.** The observations stand: `Blue Command Screen` is disabled and states its own Galileo dependency inline, `Transfer Pnr Option` is enabled and ticked, and `Enable Search Limit` is ticked with a `Search Limit Category: A` chip on the create form. When their feature's User Story arrives, this Finding is the starting evidence for it.

**One follow-up for Stage 1, recorded rather than actioned here.** This decision belongs beside `PO-1` … `PO-12` in `context/ProjectContext.md` §1.2 as **`PO-13`**. Stage 2 does not edit an approved Project Context — that is Stage 1's gate — so it is flagged here for the next revision instead of written in.

## Unclear Items

| Rect | What was observed | What exactly is unclear | The question | Why the answer matters | Original | Annotated |
|---|---|---|---|---|---|---|
| `Q3` | `Blue Command Screen` renders disabled with the hint *"This option requires the Galileo supplier to be enabled"*. | **Answered 2026-08-18: out of scope by decision.** Whether the Galileo dependency is a documented business rule is still unknown — but it no longer matters to this run. | ~~Is `Blue Command Screen` (and `Transfer Pnr Option`) part of the Agency update scope?~~ **Answered: no.** Carried to the User Story that owns these features. | Settled: Stage 3 designs nothing here. The rectangle stays because the evidence is what that future story starts from. | `update_form_fullpage.png` | `update_form_fullpage.annotated.png` |

## Evidence Links

| File | What it shows |
|---|---|
| `update_form_fullpage.png` | Full page, unmodified |
| `update_form_fullpage.annotated.png` | `Q3` rectangle around the `Blue Command Screen` control and its hint |
| `../../evidence/run-004/phase_b_update_form_structure.json` | The three Agency Features checkboxes with their `disabled` and checked states |

**Not captured:** no accessibility snapshot was taken for this Finding. `Requirement Gap` calls for screenshots plus an accessibility snapshot (§5.11); the disabled state and the hint text were instead read directly from the DOM and are recorded in the structure JSON, which carries the same information in a reviewable form. This substitution is stated rather than left silent.

## Recommendation

**Answered — no further input needed for this run.** All three controls are out of scope by decision and recorded alongside `Save as Draft` (`PO-5`), so the exclusion is deliberate rather than incidental. When the User Story for these features arrives, the open technical question to settle then is whether the Galileo dependency is a documented business rule or an implementation detail.
