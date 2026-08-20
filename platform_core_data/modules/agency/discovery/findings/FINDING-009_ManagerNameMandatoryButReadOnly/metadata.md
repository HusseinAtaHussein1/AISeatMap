# FINDING-009 — `Manager Name *` carries a mandatory marker but is rendered read-only

| Field | Value |
|---|---|
| **Finding ID** | FINDING-009 |
| **Title** | PCC section's `Manager Name *` is marked mandatory and is not editable |
| **Category** | Observation |
| **Severity** | N/A |
| **Severity Reason** | `Observation` carries `N/A` automatically (§5.4). No requirement states the field must be editable on the update path, so this is not asserted as a defect. |
| **Confidence Score** | 96% |
| **Evidence Category** | Direct Observation |
| **Status** | Needs Human Review — **the open question is answered** (see below); the Status stays until a reviewer accepts the Finding at the Stage 2 gate |
| **Discovery Mode** | Browser automation — **Browser Driver**, headed |
| **Requirement Disposition** | **`Story Outdated — Confirmed`** (ProjectContext §1.1 **row 4**) — settled by the product owner on 2026-08-18 and verified on the Supplier master. Was row 2 when raised |
| **Business Risk** | US-4222 AC-9 lists `Manager Name` as a **Mandatory Text Field** with the message *"Please enter a valid Manager Name."*. If the field cannot be typed into, that message can never be produced, and any test case designed from the story would fail for the wrong reason. |
| **Technical Risk** | A mandatory-marked control that cannot receive input is a validation dead end: if its inherited value is ever empty, the form may be unsubmittable with no user-facing way to fix it. Not reproduced — the observed value was non-empty. |
| **Module** | `agency` |
| **Workflow** | Admin → Agency → edit agency 949 → Airline Supplier credential (PCC) |

## Description

Inside the PCC section, `Manager Name *` renders with the application's own mandatory asterisk, greyed, with `readOnly = true` on the input (`#id-ManagerName`). Its value, `live`, is inherited and displayed but cannot be edited. The two controls beside it behave differently: `Generic supplier credentials (PCC) *` is an interactive multiselect, and `Supplier Credentials Description *` is an ordinary editable text field.

## Expected Behavior

US-4222 AC-9: `Manager Name` — *"Must not be blank"*, message *"Please enter a valid Manager Name."*, type **Text Field**, **Mandatory**. The Project Context does not state whether the Agency form is meant to inherit this value read-only from the supplier credential; PRD ORG-07 `[V]` states only that PCCs are *inherited from Supplier and Branch*, which is consistent with a read-only display but does not assert it.

## Actual Behavior

The control is present, marked mandatory, and read-only. Typing into it is not possible; it was not modified.

```
input #id-ManagerName : readOnly = true , value = "live"
label                 : "Manager Name *"
```

## Steps to Reproduce

1. Log in as `odeysysadmin`, open `/admin/agency/edit/949`.
2. Scroll to **Airline Supplier credential (PCC)**.
3. Observe `Manager Name *` — greyed, mandatory asterisk, not focusable for editing.

## Investigation/Recovery Result

Investigation and Recovery Engine — **not applicable, no failure category matched**. Nothing failed; this is a static rendering fact, re-observed on every page load of this run (six loads). No retry behaviour applies to a deterministic read-only attribute.

## Investigation Notes

- Validation boundary conditions were **not** probed on this field, because it accepts no input — probing would require a scripted `value` assignment, which the `branch` reuse item R-1 explicitly forbids as a method defect (it bypasses the browser and produces false results).
- The read-only state was read from the DOM property, not inferred from the grey styling.
- Whether the value originates from a master record was **not** verified when this Finding was first raised. **It was verified afterwards, on 2026-08-18, at the human's direction** — see the *Answered* section below. The read was targeted at this one field and did not assess the `master-supplier` module, which stays out of scope (ProjectContext §3).

## Root Cause Hypothesis

- **Possible Root Cause** — the field may be a display of a value inherited from the supplier record (ORG-07's cascade), where the mandatory marker comes from a shared form-generator config rather than being a statement about user input.
- **Confidence** — **superseded on 2026-08-18: the inheritance half is now an observed fact, not a hypothesis** (see *Answered* below). The marker half remains a hypothesis at ~55%.
- **Supporting Evidence** — the whole PCC section is supplier-scoped (FINDING-008); the value `live` matches the naming style of supplier credential records rather than a person's name.
- **Unknowns** — the form-generator's field definition, and whether the same field is editable on the Create form or in the `master-supplier` module.

## Occurrence Count

2 — observed on the Agency form (record 949, value `live`) and on the Branch form (BRN287, value `ewr`). Same underlying condition, so one Finding.

## Answered — 2026-08-18 (product owner, then verified by observation)

> `Manager Name` is entered in the **Supplier CRUD** itself.

**Verified read-only by this stage**, at the human's direction, as a targeted corroboration read — not an exploration of the `master-supplier` module, which stays out of scope (Project Context §3):

| Where | State of `Manager Name` |
|---|---|
| `Master → Supplier → Supplier` (`/master/supplier/supplier/edit/119`, supplier `Galileo`) | **Present, mandatory, editable.** Sits beside Products Type (`GDS`), Country, Supplier type (`web service`), PIN code, Address |
| Branch `Airline Supplier credential (PCC)` tab (BRN287, `NDCGal`) | present, mandatory marker, **read-only** |
| Agency `Airline Supplier credential (PCC)` tab (949, `TravelportNdc`) | present, mandatory marker, **read-only** |

The value differs per supplier (`Galileo` → `Test`, `NDCGal` → `ewr`, `TravelportNdc` → `live`), which is what a per-supplier master value inherited downstream looks like.

**What this settles:**

- The read-only state is **intended**, and it is read-only at **both** the Branch and Agency levels — this is not the Agency inheriting a lock from the Branch, it is a master-owned value displayed downstream.
- **US-4222 AC-9's *"Please enter a valid Manager Name."* cannot fire on the Agency form, and is not an Agency requirement.** It belongs to the Supplier module's own CRUD. Disposition: `Story Outdated — Confirmed` (Project Context §1.1 **row 4**), upgraded from row 2.
- **Stage 3 designs an inheritance assertion here, not a validation case:** assert that the Agency's `Manager Name` displays the value held on the supplier master and cannot be edited.
- Recorded as durable cross-module knowledge **`BR-007`** in `platform_core_data/knowledge/INDEX.md`.

**One consequence worth naming:** the mandatory asterisk on a field the user can never fill is still unexplained. It is cosmetic rather than functional, and it is not worth a Finding of its own — noted here so the observation is not lost.

## Unclear Items

| Rect | What was observed | What exactly is unclear | The question | Why the answer matters | Original | Annotated |
|---|---|---|---|---|---|---|
| `Q1` | `Manager Name *` renders with a mandatory asterisk and is read-only, showing the inherited value `live`. | **Answered 2026-08-18.** The value is authored in the Supplier master and inherited read-only; read-only is intended. What remains is cosmetic only: why a field nobody can fill still carries a mandatory marker. | ~~Is `Manager Name` intentionally read-only on Agency Update?~~ **Answered: yes — it is entered in the Supplier CRUD and inherited.** Remaining, low priority: should it still display a mandatory marker? | Settled what mattered: AC-9's Manager Name validation is **not** an Agency test case. Stage 3 designs an inheritance assertion instead. The leftover marker question changes nothing about coverage. | `manager_name.png` | `manager_name.annotated.png` |

## Evidence Links

| File | What it shows |
|---|---|
| `manager_name.png` | Full page, unmodified |
| `manager_name.annotated.png` | `Q1` rectangle around the `Manager Name *` control only |
| `../../evidence/run-004/phase_b_update_form_structure.json` | Control inventory recording `readOnly: true` for this input |
| `../../evidence/run-004/phase_w_supplier_master_managername.json` | The Supplier master's field list showing `Manager Name *`, captured **structure-only**: the supplier's contact-person name, email and phone are real third-party details and were deliberately not recorded |
| `../../evidence/run-004/phase_o_branch_pcc_controls.json` | The same field read-only on the Branch form |

**Not captured:** console log and DOM snapshot are not included — `Observation` requires full-page and focused screenshots (§5.11), and the read-only state is already recorded as a DOM property in the structure JSON.

## Recommendation

**Answered — no further product-owner input needed.** Stage 3 designs an inheritance assertion (the Agency displays the supplier master's `Manager Name` and cannot edit it) and designs **no** validation case for AC-9's *"Please enter a valid Manager Name."*, which belongs to the Supplier module. If Supplier CRUD is ever brought into scope, that message is tested there.
