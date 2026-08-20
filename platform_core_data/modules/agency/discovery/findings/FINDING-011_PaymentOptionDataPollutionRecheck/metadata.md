# FINDING-011 — Payment option list still renders person names and single letters, re-checked against APP-002

| Field | Value |
|---|---|
| **Finding ID** | FINDING-011 |
| **Title** | Mandatory `Payment option *` offers 29 choices; 24 are given names or the single letters `m` and `f` |
| **Category** | Observation |
| **Severity** | N/A |
| **Severity Reason** | `Observation` carries `N/A` automatically (§5.4). The control works; what is in question is the data behind it, not the application's behaviour. |
| **Confidence Score** | 98% |
| **Evidence Category** | Direct Observation |
| **Status** | Needs Human Review |
| **Discovery Mode** | Browser automation — **Browser Driver**, headed |
| **Requirement Disposition** | Not a requirement mismatch — environment and master-data quality. **Pre-disposed by knowledge item `APP-002`** (`branch` reuse item R-9): the list is sourced from Master → Payment Gateway → Payment Method and its size is intended cross-module reflection, not a rendering defect. |
| **Business Risk** | A tester or a real operator choosing a payment option from this list cannot tell a real instrument from test data. A test case that selects by position, or that asserts an option count, will break the moment the master data changes. |
| **Technical Risk** | None identified in the Agency module. The values originate in `payment-gateway` master data; the Agency form reflects them faithfully. |
| **Module** | `agency` |
| **Workflow** | Admin → Agency → edit agency 949 → Payment settings → `Payment option *` |

## Description

`Payment option *` is a mandatory checkbox group. On 2026-08-18 it rendered **29** options, in this order:

```
Cash, Wallet, Credit Card, BANQUE MISR, Fawry,
Edgardo, Isaiah, Filomena, Astrid, Olive, Dan, Rico, Collin, Bryant, Emilio,
Tracy, Alma, Desmond, Enda, Hiram, Shannon, Quinton, Monserrate, Joey, Israel,
Kasi, Joan, m, f
```

The first five match PRD **PAY-03** `[V]` (Cash, Wallet, Credit Card, Bank Transfer, plus the Banque Misr and Fawry gateways). The remaining 24 are given names and two single letters. `Cash`, `Wallet` and `BANQUE MISR` were the options ticked on this record.

## Expected Behavior

Project Context §3.1 (`payment-gateway` boundary): *"The authoritative option set is Master → Payment Gateway → Payment Method's Active entries — it is not a fixed list, so a test reads the master rather than hardcoding a count."* Knowledge item **APP-002** records the same, and adds that the list's size is intended cross-module reflection. The Project Context therefore does **not** define a fixed expected option set, and does not state that only real payment instruments may appear.

## Actual Behavior

29 options rendered, 24 of them clearly test data. This is the second run to observe the condition — run-001 recorded 28 options on 2026-07-31 (FINDING-003). The count moved by one, which is consistent with the list being live master data rather than a static list.

## Steps to Reproduce

1. Log in as `odeysysadmin`, open `/admin/agency/edit/949`.
2. Scroll to **Payment settings** → `Payment option *`.
3. Read the rendered checkbox labels.

## Investigation/Recovery Result

Investigation and Recovery Engine — **not applicable, no failure category matched.** Nothing failed. The list was read on two separate page loads in this run with identical contents.

## Investigation Notes

- **Re-checked against APP-002 rather than re-raised as new**, per `branch` reuse item R-9 and the run-004 instruction to re-check run-001's Findings instead of repeating them. APP-002 explains the *mechanism* (master-data reflection) and the corroborating `branch` FINDING-001 was closed as intended behaviour. It does **not** explain why the master contains person names on this environment — that is a data-quality question about STG, not about the Agency form.
- The `payment-gateway` module was **not** opened to confirm the master's contents. It is out of scope for this run (ProjectContext §3), and APP-002 already records the sourcing.
- The option count changed between runs (28 → 29) without any action by this run, which is direct evidence that the list is live shared data — relevant to Stage 3, because an option-count assertion would be flaky by construction.

## Occurrence Count

1 in this run (2 across the module's history, counting run-001's FINDING-003)

## Unclear Items

| Rect | What was observed | What exactly is unclear | The question | Why the answer matters | Original | Annotated |
|---|---|---|---|---|---|---|
| `Q2` | The mandatory `Payment option *` group renders 29 checkboxes; 24 are given names such as `Edgardo`, `Filomena`, `Monserrate`, plus `m` and `f`. | Whether these entries are acceptable test data on STG that Stage 3 should simply avoid selecting, or master data that ought to be cleaned before test cases are designed against this environment. | Are the person-name and single-letter payment methods expected to remain on STG, and which options may a test safely select? | It decides whether Stage 3 can name a specific payment option in a test step at all. If the list is volatile, cases must select by known-good label (`Cash`, `Wallet`) and never by index or count. | `update_form_fullpage.png` | `update_form_fullpage.annotated.png` |

## Evidence Links

| File | What it shows |
|---|---|
| `update_form_fullpage.png` | Full page, unmodified |
| `update_form_fullpage.annotated.png` | `Q2` rectangle around the `Payment option *` group |
| `../../evidence/run-004/phase_b_update_form_structure.json` | Every checkbox label and checked state, as read from the DOM |

**Not captured:** no focused crop of the group was produced separately — the annotated rectangle serves that purpose and keeps the surrounding Payment settings context visible, which a crop would lose.

## Recommendation

No action against the Agency module. Ask whoever owns STG master data whether the person-name payment methods can be removed. For Stage 3: select payment options **by label**, restricted to `Cash` / `Wallet` / `Credit Card`, and never assert the option count.
