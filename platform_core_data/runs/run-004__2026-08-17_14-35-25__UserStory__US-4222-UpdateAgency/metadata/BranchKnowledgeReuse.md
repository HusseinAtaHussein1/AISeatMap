# Branch → Agency knowledge reuse — run-004

| Field | Value |
|---|---|
| Run | `run-004__2026-08-17_14-35-25__UserStory__US-4222-UpdateAgency` |
| Target module | `agency` |
| Source module | `branch` (read-only for this run) |
| Directed by | Ahmed Ayman, 2026-08-17 |
| Written at | Stage 1 |

## Why this file exists

The user directed that this run reuse the `branch` module's knowledge, patterns, conventions, and
validated solutions — and that it **not** carry across Branch's test data, selectors, assumptions,
defects, or artifacts. Those two instructions pull in opposite directions, so the boundary between them
has to be written down rather than left to judgement at each stage. This file is that record.

**The rule applied throughout:** a *method* transfers; a *fact about Branch* does not. "Probe max-length
with real keystrokes" is a method. "Branch's Post Office Box caps at 8" is a fact about Branch.

**Nothing was copied into `modules/agency/`.** Every item below is cited by its `modules/branch/…` path
and read from there. The two module workspaces stay separate.

---

## 1. Reused — method and convention

These transfer as-is. None of them asserts anything about the Agency application.

| # | What was reused | Source | How it applies to Agency |
|---|---|---|---|
| R-1 | **Max-length probes must drive real keystrokes, never assign `element.value` in JS.** The browser enforces HTML `maxlength` only against real input; a scripted assignment bypasses it and reports "no cap enforced" on a field that caps correctly. | `modules/branch/discovery/findings/Findings_Summary.md` — the method-defect note behind FINDING-002/003/004 | Agency has **six** numeric fields whose caps will be probed: Post Office Box, Credit Limit, Top Up Limit, Target, Credit Terms (Days), Warning Prompt (Days), Reaching Percentage. Without this, the run would repeat three false findings. |
| R-2 | **Read a pre-filled Update form by polling, not by one fixed-delay sample.** A single early sample catches the page mid-render and reads fields as empty. | `modules/branch/discovery/DiscoverySnapshot_UpdateBranch.md` §4 — a would-be high-severity "Update form does not pre-fill" finding, rejected as a false read after polling showed 10/10 fields populated within 500 ms | US-4222 is an **update** story. Every one of its ~45 fields is read pre-filled. This is the single highest-value method transfer in this list. |
| R-3 | **Probe PrimeNG widgets widget-aware, not with a native `input`/`select` scan.** A native-element scan under-reports the controls that are present. | `modules/branch/discovery/DiscoverySnapshot_SearchBranch.md` §3 — four filters wrongly reported absent | Agency's form is dense with `p-dropdown`, `p-calendar`, `p-multiselect`, and checkbox groups (State, City, Account Type, Designation, Invoice Generation, Set Month/Year, contract dates, PCC selectors). |
| R-4 | **When browser navigation times out, probe the URL over raw HTTP before raising anything.** | `modules/branch/discovery/findings/Findings_Summary.md` — "Candidates investigated and NOT published" | The environment's reachability is unverified for this run. This decides whether a Stage 2 blocker is real. |
| R-5 | **Record rejected finding candidates explicitly.** A candidate investigated and dismissed is a result; leaving it out reads as never having looked. | Same section as R-4 | Adopted as this run's Discovery convention. |
| R-6 | **A Create-screen disposition does not automatically transfer to the Update screen**, because Update shows a saved record's stored value where Create shows a form default. Where it cannot transfer, record *not comparable* rather than forcing an answer. | `modules/branch/discovery/findings/Findings_Summary.md` — run-003 note on FINDING-005 | Directly load-bearing: run-001's Agency Discovery ran against both the Create and Update forms, and AC-10's Import PNR toggle is exactly the not-comparable shape. |
| R-7 | **One account is the self-approval test configuration, not an obstacle to it.** Act as maker, then attempt to approve the same record with the same account. | `knowledge_base/run_configuration.md` — the 2026-08-04 single-account note | Resolves `agency` **ASM-004** and **RSK-003**, which run-001 recorded as possibly `Blocked`. XC-06 self-approval becomes designable for Agency. |
| R-8 | **PrimeNG interaction patterns** — click the wrapper (`p-dropdown`, `p-radiobutton`) rather than the hidden input; filter-then-select with exact-prefix matching on `"Name (Code)"` options; `p-calendar` needs real keystrokes; a repeatable-section "Add" button creates a second, itself-required empty row; poll for post-submit navigation. | `knowledge/patterns/repair/` — REP-004, REP-005, REP-006, REP-008, REP-009 | These are **platform-scope UI-technology patterns already in the shared knowledge tree**, not Branch property. They are listed here because Stage 4A must consult them before generating a single selector. |

## 2. Reused — application-domain facts that are genuinely cross-module

These are facts about the **application**, not about Branch. Each is already recorded as a `business/rules`
entry in the shared knowledge tree, which is what makes it citable outside the module that found it.

| # | Fact | Source | Effect on this run |
|---|---|---|---|
| R-9 | The **Payment Option checkbox list is sourced from Master → Payment Gateway → Payment Method** (~34 entries, Online/Offline), and its size is intended cross-module reflection, not data pollution. | `knowledge/business/rules/APP-002`; corroborated by `modules/branch/discovery/findings/FINDING-001` (Rejected — confirmed intended) | **Answers the story's own Open Question #5** and `agency` **ASM-014** ("is the complete Payment Options set defined anywhere?"). Also **pre-disposes** the existing `modules/agency/discovery/findings/FINDING-003_PaymentOptionDataPollution` — Stage 2 should re-check it against APP-002 rather than re-raising it. |
| R-10 | **Phone fields expect the national number only** — no literal `+` country-code prefix — despite the AC's "+ Phone country code" wording. | `knowledge/business/rules/BR-005`; `knowledge/patterns/repair/REP-007` | Applies to **three** US-4222 phone fields (AC-1 Phone no., AC-2 Owner Phone, AC-5 Sales Contact Phone), all three of which state "+ Phone country code". This is a known AC-vs-application mismatch, not a new finding. *(Note: BR-005 was itself derived from the Agency Add form, so this is knowledge returning home.)* |
| R-11 | The approval-submit button reads **"Send For Approval"**, not the AC's "Submit for Approval" — confirmed by the module owner on 2026-08-10 as correct, with the AC stale. | `modules/branch/discovery/findings/FINDING-011` (Rejected — Outdated Requirement) | US-4222's Expected Outcome says "Submit for Approval". Under the application-primacy directive this is disposition **row 1** (Story Outdated — corroborated), not a defect. Stage 3 should assert the real label. **Confirmed for Branch; to be re-observed on the Agency form, not assumed.** |

## 3. Deliberately NOT carried across

Recorded because an exclusion decided on purpose is different from one overlooked.

| What | Why it stays in `branch` |
|---|---|
| **Branch test data** — `AboBakrTravel (BRN471)`, run-002's and run-003's created Branch records, every branch name, code, and identifier | Environment-specific live data belonging to another module's runs. Agency's own test data is created fresh under this run's grant and tagged to it. |
| **Branch selectors and page objects** — `Branch_Common.typeVia`, `AddBranch_Page.setValueAndNotify`, and the rest of `modules/branch/automation/` | Screen-specific. Stage 4A verifies every Agency selector live against the running application; it does not adapt a Branch locator. *(The `typeVia` / `setValueAndNotify` pair is cited in R-1 only as the **defect** to avoid, never as an implementation to copy.)* |
| **Branch findings FINDING-001 … FINDING-016** | Observations about the Branch screens. Agency keeps its own `FINDING-001…007` numbering, untouched. Where a Branch finding taught a *method* or a *cross-module fact*, that method or fact appears in §1 or §2 above — the finding itself does not travel. |
| **Branch assumptions and risks (`ASM-BR-*`, `RISK-BR-*`)** | Scoped to Branch's own uncertainty. Agency's ASM/RSK set stays as run-001 established it, revised only on Agency evidence. |
| **Branch's Project Context, Test Cases, Traceability Matrix, Coverage Report** | Branch artifacts. Agency's equivalents are its own. |
| **Branch's mutation grants (run-002, run-003)** | Authorizations never carry across runs, modules, actions, or ownership classes. run-004's grant was asked and answered separately. |
| **Branch's `modules/branch/automation/` SHAFT package** | A separate package for a separate module. Agency's package is generated new. The **framework structure** in `knowledge_base/automation_framework.md` is shared and mandatory; the Branch code is not a template. |

## 4. Boundary check

- [x] Nothing was written into `modules/agency/` that originated as a Branch artifact.
- [x] Nothing was written into `modules/branch/` by this run.
- [x] Nothing from `run-001`, `run-002`, or `run-003` was modified.
- [x] Every reused item above is either a method, or an application fact already promoted to the shared
      `knowledge/` tree — none is a Branch-specific observation asserted as true of Agency.
- [x] Every item in §2 is marked for **re-observation on the Agency screens** before any test asserts it.
