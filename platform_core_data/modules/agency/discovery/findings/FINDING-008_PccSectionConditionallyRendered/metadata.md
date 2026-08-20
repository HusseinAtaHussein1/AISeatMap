# FINDING-008 — Airline Supplier credential (PCC) section is present, and renders only while a Product Access supplier row is selected

| Field | Value |
|---|---|
| **Finding ID** | FINDING-008 |
| **Title** | AC-9's PCC section renders conditionally on the Product Access supplier selection; three of its named controls exist, the filters and two PCC fields do not |
| **Category** | Requirement Gap |
| **Severity** | N/A |
| **Severity Reason** | `Requirement Gap` carries `N/A` automatically (§5.4) — this records a disagreement between US-4222 and the application, not an application malfunction. |
| **Confidence Score** | 99% - the controlled experiment of 2026-08-18 replaced inference with a direct before/after observation |
| **Evidence Category** | Direct Observation |
| **Status** | Needs Human Review |
| **Discovery Mode** | Browser automation — **Browser Driver**, headed (human operator opt-in for this run) |
| **Requirement Disposition** | **Re-opens run-001's FINDING-002, and narrows it to two fields.** The section and three controls exist and are testable. For the two absent fields the PRD names the *section* (ORG-05 `[V]`) but **not** those fields, so PRD silence puts them at **`Story Outdated / Requires Business Confirmation`** (ProjectContext §1.1 **row 2**) - down from row 3, which applied only while the whole section was believed missing |
| **Business Risk** | On run-001's evidence Stage 3 would have designed AC-9 as untestable. Three of AC-9's controls are in fact testable, and one absent control (`Search Supplier Credential PCC`) is **Mandatory** in the story — leaving it unexamined drops a mandatory requirement from coverage. |
| **Technical Risk** | The section's visibility is bound to the Product Access supplier row. An automated test that reads the PCC section without first asserting a selected supplier row reads an empty DOM and reports a false absence — the exact shape of the run-001 result. |
| **Module** | `agency` |
| **Workflow** | Admin → Agency → edit an agency (`/admin/agency/edit/949`) → Product Access Details → Airline Supplier credential (PCC) |

## Description

The Agency Update form **does** contain a section headed **`Airline Supplier credential (PCC)`**, between *Product Access Details* and *Agency Features*. It carries a supplier tab (`TravelportNdc`) and three controls:

| Control as rendered | Type | Mandatory marker | State observed |
|---|---|---|---|
| `Generic supplier credentials (PCC) *` | PrimeNG multiselect | yes | `All (4 selected)` |
| `Manager Name *` | Text | yes | **read-only**, value `live` — see FINDING-009 |
| `Supplier Credentials Description *` | Text | yes | `szds`, editable |

Against US-4222 AC-9, which names five fields plus a filter set:

| AC-9 names | Present on the live form? |
|---|---|
| Filters: Amadeus PCC · Galileo PCC · Sabre PCC | **no** |
| `Search Supplier Credential PCC` — Multi Select, **Mandatory** | **no** |
| `Ticketing Supplier Credentials PCC` — Multi Select, Optional | **no** |
| `Generic Supplier PCC` — Drop Down, Mandatory | **yes**, as `Generic supplier credentials (PCC) *` |
| `Manager Name` — Text Field, Mandatory | **yes**, but read-only (FINDING-009) |
| `Supplier Credential Description` | **yes**, as `Supplier Credentials Description *` |

## Expected Behavior

US-4222 AC-9 states the Airline Supplier Credential section carries the three PCC filters and the five listed fields, with `Search Supplier Credential PCC`, `Generic Supplier PCC` and `Manager Name` mandatory. PRD **ORG-05** `[V]` lists *Airline Supplier Credential (PCC)* as a section of the agency form, and **ORG-07** `[V]` states an agency is assigned one or more supplier PCCs inherited from Supplier and Branch. Project Context §2 (AC-9 row) and `PO-8` require this stage to **observe and document the exact live layout** rather than infer field identity from the story's ambiguous table.

## Actual Behavior

The section exists and renders three controls. It is **conditionally displayed**: deselecting the single supplier row in the Product Access Details table removes the entire `Airline Supplier credential (PCC)` heading and all three of its controls; reloading the record (no save performed) restores them.

```
supplier row selected    -> PCC heading present: true  | controls: Generic supplier credentials (PCC) *, Manager Name *, Supplier Credentials Description *
supplier row deselected  -> PCC heading present: false | controls: (none)
form reloaded, no save   -> PCC heading present: true  | controls restored
```

## Steps to Reproduce

1. Log in to `http://192.168.1.70` as `odeysysadmin`.
2. Navigate to `/admin/agency/edit/949`; wait for the form to pre-fill (fields populate within about 1 second — poll, do not sample once).
3. Scroll to **Product Access Details** — one supplier row, `TravelportNdc` / `Flight`, its Status checkbox ticked.
4. Observe the **Airline Supplier credential (PCC)** section immediately below, with the three controls listed above.
5. Untick the supplier row's Status checkbox. The PCC section disappears.
6. Reload the record without saving. The section and its values return.

## Investigation/Recovery Result

Investigation and Recovery Engine — **applied, "Unexpected UI rendering" category**: the disappearance after deselection was re-checked by a fresh navigation rather than trusted from a single observation. The section returned, so its absence is bound to the supplier selection rather than to a rendering fault. The section itself was present on every one of the six page loads this run performed.

## Investigation Notes

- **This contradicts run-001's FINDING-002**, which recorded the whole PCC section as absent from both forms. run-004 does not decide which observation was right at the time; it records that on 2026-08-18 the section is present whenever a supplier row is selected. The conditional rendering above is the most plausible reconciliation and is stated as a hypothesis, not a conclusion.
- Boundary conditions probed: supplier row selected, deselected, restored by reload. ~~**Not probed:** whether selecting a second supplier adds a second tab~~ — **probed and answered on 2026-08-18**: three inherited suppliers produced three tabs (see *Verified by experiment*). Still not probed: whether an agency whose Branch carries no supplier at all shows the section, which would require changing a shared Branch and approving it — `Forbidden (absolute)` for this run.
- The `Select Product` checkboxes (`Flight` ticked, `Others` unticked) were **not** toggled; only the supplier row's own Status checkbox was, and nothing was saved. All non-GET traffic during the session was `…/state/search` and `…/agency/search` — read calls only.

## Root Cause Hypothesis

- **Possible Root Cause** — the section may be rendered per selected supplier (one tab per supplier row), so an agency with no supplier row selected shows no section at all. run-001 may have observed a record in exactly that state.
- **Confidence** — **superseded on 2026-08-18: this is no longer a hypothesis.** The controlled experiment below confirmed one tab per inherited supplier. Kept here as written so the reasoning that led to the experiment stays visible.
- **Supporting Evidence** — `pcc_dependency_probe.json`, `pcc_section_present.png`, `pcc_section_absent_after_supplier_deselected.png`; the section is headed by a `TravelportNdc` tab, which is the supplier's own name.
- **Unknowns** — whether run-001's record had a supplier row selected (run-001's evidence does not record the Product Access row state), and whether the section is also gated by role, branch inheritance, or a feature flag.

## Occurrence Count

1

## Product-owner answer — 2026-08-18 (partial)

Received after this Finding was raised. It settles the **mechanism**, and the Root Cause Hypothesis above is confirmed by it:

> Agency suppliers are **inherited from the parent Branch**. A supplier is never added at Agency level — the Agency can only **check or uncheck** what the Branch already has. A Branch with no suppliers gives its Agencies none, so the section cannot appear. Where the Branch holds several, the Agency selects **at least one** of them.

**What this settles:**

- The conditional rendering is **intended behaviour**, not a defect. A record whose Branch carries no supplier shows no PCC section at all, which is the most likely explanation of run-001's FINDING-002.
- The section-level message `Please select at least one supplier.` is the enforcement of that rule, not an incidental validation string.
- **Fixture precondition for Stage 3 and Stage 5A:** the agency under test must sit under a Branch that has at least one supplier, or AC-9 is unreachable by construction. An automated test that creates an agency under an arbitrary Branch may find no PCC section and report a false absence.
- Recorded as durable cross-module knowledge **`BR-006`** in `platform_core_data/knowledge/INDEX.md`, extending `BR-002` (Branch Supplier Routing is inherited by child Agencies).

**What it does not settle** — the field-identity half of the question stays open, and is restated in the Unclear Items table below: whether the three live controls are AC-9's fields renamed, and whether `Search Supplier Credential PCC` (Mandatory), `Ticketing Supplier Credentials PCC` and the Amadeus / Galileo / Sabre filters were removed, renamed, or never built. The inheritance rule explains *when the section appears*; it does not explain *which fields it should contain*.

## Verified by experiment - 2026-08-18

The human answered that the suppliers shown on an Agency are **inherited from the parent Branch**, and that the AC-9 fields appear once the Branch carries GDS suppliers with PCCs selected. That was tested directly.

**Method.** This run could not perform the Branch change itself: mutating a shared Branch is `Approval Required`, but **approving a record this run did not create is `Forbidden (absolute)`** in `execution_safety_policy.json`, and no grant lifts it - so a Branch edit could have been submitted but never approved, leaving BRN287 stuck in *Pending for approval* with the question still unanswered. The human therefore made and approved the change; this stage observed the result **read-only**.

**Before** - Branch `BRN287` carried one supplier (`NDCGal`); Agency `AGN9799` (`/admin/agency/edit/11006`) showed one Product Access row and one PCC tab.

**After** - the human added `Amadeus` and `Sabre` to the Branch and approved it:

| | Branch `BRN287` | Agency `AGN9799` |
|---|---|---|
| Suppliers | `Amadeus`, `NDCGal`, `Sabre` | the same three, all three rows present **and ticked** |
| PCC tabs | `NDCGal`, `Sabre`, `Amadeus` | `Amadeus`, `Sabre`, `NDCGal` |

**The cascade is confirmed end to end:** a supplier added at Branch level appears on the child Agency without any action on the Agency, and each inherited supplier gets its **own PCC tab**.

**And this answers the field-identity question.** With three suppliers inherited and their PCCs selected, **every tab renders exactly the same three controls**:

| AC-9 names | Live equivalent | Verdict |
|---|---|---|
| Filters: Amadeus PCC / Galileo PCC / Sabre PCC | **the supplier tabs themselves** - one tab per inherited supplier | **Renamed in form, not missing.** The story's "filter" is a tab in the application |
| `Generic Supplier PCC` (Mandatory) | `Generic supplier credentials (PCC) *` | present |
| `Manager Name` (Mandatory) | `Manager Name *` | present, read-only - FINDING-009 |
| `Supplier Credential Description` | `Supplier Credentials Description *` | present |
| **`Search Supplier Credential PCC` (Mandatory)** | - | **absent** |
| **`Ticketing Supplier Credentials PCC` (Optional)** | - | **absent** |

The two absent fields were searched for by page text across **five supplier tabs on two Branches and two Agencies** - `TravelportNdc`, `NDCGal`, `Amadeus`, `Sabre` - and appear in none of them. The earlier hypothesis that they might surface only for a GDS supplier with a PCC selected is therefore **refuted**: Amadeus and Sabre are GDS, their PCCs are selected, and the fields still do not exist.

**Consequences for Stage 3:**

1. AC-9 is designed as **three controls per supplier tab**, repeated for each inherited supplier - not as five flat fields.
2. A test for AC-9 must first assert the parent Branch carries the supplier, because the tab exists only through inheritance (`BR-006`).
3. `Search Supplier Credential PCC` and `Ticketing Supplier Credentials PCC` get **no test case**. They are recorded as a requirement gap awaiting business confirmation, neither designed against nor silently dropped.

## Unclear Items

| Rect | What was observed | What exactly is unclear | The question | Why the answer matters | Original | Annotated |
|---|---|---|---|---|---|---|
| `Q4` | The `Airline Supplier credential (PCC)` section renders one tab per inherited supplier, each carrying Generic supplier credentials (PCC), Manager Name and Supplier Credentials Description. | **Answered 2026-08-18 by controlled experiment.** The filters are the tabs; three of AC-9's fields exist under near-identical names. What remains is a business question, not an observation. | ~~Are the live controls AC-9's fields renamed?~~ **Answered: yes.** Remaining: were `Search Supplier Credential PCC` (Mandatory) and `Ticketing Supplier Credentials PCC` deliberately removed, or never built? | Coverage is now decidable: three controls per tab get test cases. The remaining question decides only whether the two absent fields are logged as an accepted gap or escalated - it no longer blocks Stage 3. | `update_form_fullpage.png` and `../../evidence/run-004/run004_agency_pcc_tab_Amadeus.png` | `update_form_fullpage.annotated.png` |

## Evidence Links

| File | What it shows |
|---|---|
| `pcc_section_present.png` | Full page with the PCC section rendered and populated |
| `pcc_section_absent_after_supplier_deselected.png` | The same page after the supplier row was deselected — section gone |
| `pcc_dependency_probe.json` | The programmatic before/after state read |
| `update_form_fullpage.png` / `update_form_fullpage.annotated.png` | Original, and the `Q4` rectangle around the PCC section |
| `../../evidence/run-004/phase_b_update_form_structure.json` | Full control inventory of the update form, including the three PCC controls |
| `../../evidence/run-004/phase_x_after_branch_change.json` | The before/after cascade read: Branch suppliers, and the Agency's inherited rows and tabs |
| `../../evidence/run-004/phase_y_agency_pcc_tabs.json` | Every PCC tab read individually, with the page-text search for the two absent fields |
| `../../evidence/run-004/run004_agency_pcc_tab_Amadeus.png` (also `_Sabre`, `_NDCGal`) | Each inherited supplier's tab and its three controls |
| `../../evidence/run-004/run004_branch_BRN287_after_human_change.png` | The Branch after the human added and approved the two GDS suppliers |

**Not captured:** no HAR was exported for this Finding — the section's presence is a DOM and visual fact; the session's request log is recorded in `../../evidence/run-004/phase_f_probes.json` (`nonGetRequests`) instead.

## Recommendation

Ask the product owner to confirm, against the live form, which AC-9 fields survive under which names, and whether `Search Supplier Credential PCC` was deliberately removed. Until that answer exists, Stage 3 should design the three observed controls and hold the two absent PCC fields as **blocked on this decision** rather than dropping them. run-001's record state cannot be re-checked — treat the contradiction as resolved by recency, not as an error in either run.
