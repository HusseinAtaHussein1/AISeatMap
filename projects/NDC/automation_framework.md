# NDC — SHAFT Automation Package Structure

> **Reframed 2026-07-12 (`.claude/skills/automation-agent/SKILL.md` v5):** This document specifies the structure for NDC's **SHAFT** Automation Package specifically — it is **not** a project-wide mandate binding every NDC automation effort to SHAFT. Per the platform's multi-package model, NDC may hold several independent Automation Packages (e.g. `tests_SHAFT/`, `tests_Playwright/`), each tracked in `platform_core_data/workspace/automation/AutomationPackages.md`. Which package (and therefore which framework) a given Stage 5 run targets is decided by the Framework Decision Gate (`.claude/skills/automation-agent/SKILL.md` §31) at the start of that run — this document is authoritative only for whichever run's answer is "SHAFT."

This is the durable, versioned specification for the SHAFT package's own internal structure, referenced whenever a Stage 5 run's Framework Decision Gate answer is SHAFT.

> Per `.claude/skills/automation-agent/SKILL.md` §7 Rule 1 ("If the Project Context explicitly specifies a framework, the agent must use it — no selection process overrides an explicit instruction... still requires running the Framework Decision Gate §31 first") and §6 ("SHAFT Engine [is] a first-class option"): this file is the structural specification for the SHAFT package whenever a run's Framework Decision Gate selects it. It must be read before generating any SHAFT-package code, and compared against the approved Test Design first — implementation gaps identified by that comparison are resolved before generation starts (see "Gap Resolution Rule" below).

**Source:** SHAFT Automation Framework Structure Rules, supplied 2026-07-11.
**Status:** Binding on the SHAFT package specifically, whenever a run selects it via the Framework Decision Gate — do not redesign or replace this package's internal architecture. Only extend it, and only when a real, discovered-during-implementation limitation requires it (see "Gap Resolution Rule"). Does not constrain any other package (e.g. `tests_Playwright/`) this project may also hold.

---

## 1. Pages Layer

- Responsible for representing UI pages.
- Contains Page Classes only.
- Each page represents a single screen.
- Only UI interaction methods allowed.
- No locators in test classes.
- No business logic in tests.

## 2. Locators Layer

- Each page has its own locator class.
- No locators inside test classes.
- No duplicate locators.
- Each locator = one method only.

**Naming convention:**

| Prefix | Element type |
|---|---|
| `Btn_` | Buttons |
| `Txt_` | Text Fields |
| `Lst_` | Dropdowns / Lists |
| `Icn_` | Icons |
| `Rbtn_` | Radio Buttons |
| `Cbox_` | Checkboxes |
| `Dpick_` | Date Pickers |

## 3. Tests Layer

- Contains only test flow and assertions.
- No locators allowed.
- No business logic allowed.
- No static data allowed.
- Tests only call Actions methods.

## 4. Data Layer (JSON Driven)

- All test data stored in JSON files.
- No hardcoded data in code.
- Supports data-driven testing.

## Core Rules (summary — governs every generated asset)

1. No locators in test classes.
2. No static data in code.
3. No business logic in tests.
4. No duplicate locators.
5. Each locator = one method only.
6. JSON only for test data.
7. Tests call methods only.

---

## How this maps onto `.claude/skills/automation-agent/SKILL.md`

| Automation Agent concept | SHAFT mapping |
|---|---|
| §6–§8 Framework Detection/Selection | Framework is **explicitly specified** by this document — §7 Rule 1 applies; no criteria-based selection needed for NDC. |
| §8 SHAFT Engine Support | This document is the concrete instantiation of §8's `DriverFactory` / Page Object Model / TestNG / Allure / SHAFT configuration / reusable utilities / data-driven-testing / shared test infrastructure list, specialized with NDC's own locator-prefix naming convention. |
| §14.1 Page Object Model / Component Objects | = this framework's **Pages Layer** (§1 above). |
| §14.1 Naming Conventions | = this framework's **Locators Layer prefix table** (§2 above) — must be followed exactly (`Btn_`, `Txt_`, `Lst_`, `Icn_`, `Rbtn_`, `Cbox_`, `Dpick_`), not a new convention invented per suite. |
| §14.1 Test Data Separation | = this framework's **Data Layer (JSON Driven)** (§4 above) — no hardcoded test data in code, ever. |
| §24 Locator Strategy | Locators still follow §24.1's accessibility-first priority order *within* the Locators Layer's own classes — this framework governs *where* locators live and how they're named, not a replacement for the priority order itself. |
| §9 Existing Framework Analysis / §11 Automation Knowledge Base | When Stage 5 runs, it must inspect `platform_core_data/workspace/automation/tests/` (once one exists) against this structure before generating anything new — reuse existing Page/Locator/Test/Data classes before authoring new ones. |

## Gap Resolution Rule

If, during Stage 5 implementation, the approved Test Design requires something this framework doesn't yet accommodate (e.g., a new element type with no locator prefix above, a data shape JSON-driven testing doesn't cleanly cover):

1. **Do not redesign or replace the framework.**
2. Document the specific gap explicitly (what's needed, why the current structure doesn't cover it).
3. Recommend the **smallest possible extension** (e.g., "add a new `Dtable_` prefix for data-table components" rather than a new locators pattern) — per `.claude/skills/automation-agent/SKILL.md` §26–§27's Stop Condition / Recovery Strategy model (mark the specific gap, continue generating everything else, never a bare halt).
4. Surface the recommended extension in the Automation Plan's "Assumptions"/"Risks" fields and the Automation Summary's "Known Limitations" section — never apply the extension silently.

## Required before Stage 5 code generation begins

Per the user's explicit instruction (2026-07-11): before generating any automation code, compare the approved Test Design (Stage 3 output) against this framework and identify implementation gaps first. Resolve them (per the Gap Resolution Rule above), then generate the automation package. This precedes and supplements — but does not replace — the Automation Plan (`.claude/skills/automation-agent/SKILL.md` §5), which must still be written in full before any code generation, and must record this framework as the justified Target Framework (§5 "Target Framework") rather than running framework selection criteria (§7) from scratch.
