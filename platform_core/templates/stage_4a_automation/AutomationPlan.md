<!--
TEMPLATE — Automation Plan (Stage 4A — Automation branch)
Renders to: platform_core_data/modules/{{MODULE_SLUG}}/automation/AutomationPlan_{{FRAMEWORK}}.md
Authority:  .claude/skills/automation-skill/SKILL.md §5 (Automation Planning Engine — these fields),
            §10 (Suite Planning), §34 (Stack Documentation), §16 Outputs #1, §19

HARD RULE (§5): NO code generation of any kind — no script, page object, fixture, or configuration
file — begins before this plan is finished and internally consistent. It is written FIRST, IN FULL,
before any other artifact in this stage.

HARD RULE (§34.4): a run against a pinned-version stack with ZERO Context7 queries performed and NO
recorded documentation gap is an INCOMPLETE Automation Plan — the same standard §7 applies to an
unjustified framework choice.

HARD RULE (§8): for JAVA/SHAFT UI automation the Project Architecture is NOT an open choice — it is
§8.1's approved Maven structure, stated by reference, never re-derived. Sections 3A/3B/3C below are
mandatory for that framework. An Optional Abstraction listed with NO justification is an INCOMPLETE
Automation Plan, held to the same standard §7 applies to an unjustified framework choice.
-->

# Automation Plan — {{FRAMEWORK}} — {{RUN_FOLDER}}

| Field | Value |
|---|---|
| Module | `{{MODULE_SLUG}}` |
| Produced by run | `{{RUN_FOLDER}}` |
| Revision | {{REVISION_COUNT}} <!-- in-place edits since creation; this artifact belongs to the module, not the run --> |
| Framework Decision Gate answer (§31) | {{FRAMEWORK_GATE_ANSWER}} |
| Scope source | `modules/{{MODULE_SLUG}}/test_design/TestCases_*.md` (approved) — scope AND content |
| Stack Documentation Context | `modules/{{MODULE_SLUG}}/automation/StackDocumentationContext_{{FRAMEWORK}}.md` |
| Generated | {{TIMESTAMP}} |
| Status | {{STATUS}} <!-- Pending Review / Approved --> |

## 1. Target Framework

<!-- §5 — the framework selected per §6–§8, WITH its justification.
     §6 (v4, reinforced by v9): that Discovery happened to use Playwright MCP carries ZERO WEIGHT in
     the Framework Decision Gate. -->

| Field | Value |
|---|---|
| Framework | {{FRAMEWORK}} |
| Version | {{FRAMEWORK_VERSION}} |
| Justification | {{FRAMEWORK_JUSTIFICATION}} |

## 2. Target Language

{{TARGET_LANGUAGE}}

## 3. Project Architecture

<!-- §5 / §8. For JAVA/SHAFT UI: state `§8.1 approved Maven structure` — do NOT re-derive a layout,
     and do NOT substitute generic root packages (pages/ locators/ tests/ fixtures/ workflows/
     assertions/ services/ data/), which §8.1 prohibits. For any other framework or system shape,
     state that stack's own approved structure; §8.1 is NEVER forced onto API, mobile, messaging,
     batch, or cloud automation (§8.12). An explicitly documented approved existing or Reference
     project architecture takes precedence, and the difference is recorded in §3C. -->

{{PROJECT_ARCHITECTURE}}

**Java/SHAFT UI responsibility areas (§8.1)** — omit this table entirely for a non-Java/SHAFT-UI package:

| Area | Path | Holds |
|---|---|---|
| Page Classes | `src/main/java/AdminPages/` | one class per page/screen; actions, state-reading, waits, navigation (§8.2) |
| Locator Classes | `src/main/java/AdminPages/` | one per Page Class, same package; locator definitions only (§8.3) |
| Driver Factory | `src/main/java/Drive_Factory/` | driver init, browser config, lifecycle — reused, never re-created (§8.7) |
| Generic Classes | `src/main/java/Generic_Classes/` | project-wide, single-responsibility only (§8.8) |
| Utilities | `src/main/java/utilities/` | cohesive technical utilities (§8.9) |
| Configuration | `src/main/resources/properties/` | configuration; never a credential value |
| Test Classes | `src/test/java/AdminPages/` | readable flow, page calls, assertions, traceability (§8.4) |
| DB query execution | `src/test/java/DBs_Query_Execution/` | authorized database query execution |
| Shared fixtures | `src/test/java/utilities/` | setup and cleanup only (§8.5) |
| JSON test data | `src/test/resources/` | by module/business scope; no secrets (§8.6) |

## 3A. Responsibility Map

<!-- §5 — EVERY asset this plan intends to create or modify, with the §8.1 responsibility area it
     belongs to and its target path. An asset with NO stated area is an INCOMPLETE plan field.
     A [Test] path under src/main, or a [Page]/[Locator] path under src/test, is a §15.1 BLOCKING
     violation this plan must not carry to the gate. -->

| Asset | Responsibility Area | Target Path | Create / Modify / Reuse |
|---|---|---|---|
| {{ASSET}} | {{AREA}} <!-- Page / Locator / Test / Fixture / Driver / Generic / Utility / Data / Config --> | `{{TARGET_PATH}}` | {{OPERATION}} |

## 3B. Optional Abstractions

<!-- §8.11 — every abstraction OUTSIDE §8.1's default areas. Workflows, services, assertion classes,
     Component Object packages, data factories, builders, technical adapters, module-specific
     BasePage classes, and one-method wrappers are NEVER default layers.

     Each row needs ALL FOUR justification columns. POSSIBLE FUTURE REUSE IS NOT A JUSTIFICATION.
     NO EMPTY FOLDER is created for an optional abstraction.

     Where none are proposed, keep this section and write `None` — do NOT omit it, and do NOT
     pre-create rows for abstractions that were not actually used. -->

| Abstraction | Ground (existing/Reference requirement · proven duplication, named) | Why maintenance is simpler | Why it fits nowhere in §8.1 | Approved by |
|---|---|---|---|---|
| {{ABSTRACTION}} | {{GROUND}} | {{MAINTENANCE_BENEFIT}} | {{WHY_NO_HOME}} | {{APPROVER}} |

**Optional abstractions proposed:** {{OPTIONAL_ABSTRACTION_COUNT}} <!-- `None` when zero -->

## 3C. Architecture Deviations

<!-- §8.13 — BROWNFIELD ONLY. Every place the authoritative existing structure differs from
     §8.1–§8.11, or where an approved existing/Reference architecture takes precedence over §8.1.

     REPORTING IS MANDATORY; REFACTORING IS NOT AUTHORIZED BY IT. A structural move is proposed in
     the Target Write Plan (§11C.4) and approved file by file. Never a silent refactor, never a
     silent omission, and never new complexity added because similar complexity already exists.

     Omit this section only for a genuinely greenfield package. -->

| Deviation | Where | Classification | Note |
|---|---|---|---|
| {{DEVIATION}} | `{{LOCATION}}` | {{CLASSIFICATION}} <!-- Preserved (approved convention) / Correction proposed in Target Write Plan / Reported, no action --> | {{NOTE}} |

## 4. Design Pattern

<!-- The specific pattern(s) in use. For JAVA/SHAFT UI this is fixed: Page Class + dedicated Locator
     Class + Test Class + Fixture + JSON test data (§8.2–§8.6) — assertions in the Test Class, state
     reading on the Page Class, no assertion class and no workflow/service class (§8.11). -->

{{DESIGN_PATTERN}}

## 5. Planned Automation Suites

<!-- §10 — GROUPING MUST FOLLOW BUSINESS WORKFLOWS, NOT INDIVIDUAL PAGES.
     A suite organized around a single page (e.g. just "Employee List Page tests", disconnected from
     the Add Employee / Employee Detail tests forming the same workflow) is THE WRONG SHAPE and must
     not be produced. The workflow, not the screen, is the organizing unit.
     Good: Login Suite · Employee Suite · Leave Suite · Recruitment Suite -->

| Suite | Business Workflow | Test Case IDs | Shared Setup | Shared Teardown | Shared Fixtures | Shared Utilities | Shared Test Data | Shared Components |
|---|---|---|---|---|---|---|---|---|
| {{SUITE}} | {{WORKFLOW}} | {{TEST_CASE_IDS}} | {{SETUP}} | {{TEARDOWN}} | {{FIXTURES}} | {{UTILITIES}} | {{TEST_DATA}} | {{COMPONENTS}} |

<!-- §10 / §8 — A SUITE IS A LOGICAL GROUPING, NOT A FOLDER LAYER AND NOT A CLASS. For Java/SHAFT it
     is expressed as TestNG groups and a <test> block in testng.xml — NEVER a workflows/ or services/
     package, and never a Workflow/Service class orchestrating page calls (§8.1, §8.11). Test Classes
     stay organized by application area and module (§8.4).

     Where each element actually lives, Java/SHAFT UI:
       Shared Setup / Teardown / Fixtures -> src/test/java/utilities/      (§8.5)
       Shared Utilities                   -> src/main/java/utilities/ or Generic_Classes/ (§8.9, §8.8)
       Shared Test Data                   -> src/test/resources/{module}/  (§8.6)
       Shared Components                  -> NOT A DEFAULT LAYER. Write `None — §8.11` unless a
                                             Component Object is justified in the Plan's §3B. -->

## 6. Existing Assets

<!-- Everything already reusable, discovered per Existing Framework Analysis (§9) against the
     Workspace Automation Baseline copied in at run start. -->

| Asset | Type | Location | Reusable As-Is? |
|---|---|---|---|
| {{ASSET}} | {{TYPE}} | `{{LOCATION}}` | {{REUSABLE}} |

## 7. Assets To Generate

<!-- What must be newly authored, AND WHY NOTHING EXISTING COVERS IT — the second half is mandatory;
     "new" without a gap statement is not a justification. -->

| Asset | Type | For Test Case(s) | Why nothing existing covers it |
|---|---|---|---|
| {{ASSET}} | {{TYPE}} | {{TEST_CASE_IDS}} | {{GAP_REASON}} |

## 8. Assets To Reuse

| Existing Asset | Reused Where | Composition Needed |
|---|---|---|
| {{ASSET}} | {{REUSED_WHERE}} | {{COMPOSITION}} |

## 9. Estimated Automation Coverage

<!-- A PROJECTED percentage of approved test cases expected to receive a Reuse/Generate decision
     versus Partially Automatable/Manual Only — BEFORE generation actually happens. An estimate, and
     labelled as one; the realized figures live in AutomationCoverageReport. -->

| Projected Decision | Estimated Count | Estimated % |
|---|---|---|
| Reuse / Generate | {{EST_AUTOMATED_COUNT}} | {{EST_AUTOMATED_PERCENT}}% |
| Partially Automatable | {{EST_PARTIAL_COUNT}} | {{EST_PARTIAL_PERCENT}}% |
| Manual Only | {{EST_MANUAL_COUNT}} | {{EST_MANUAL_PERCENT}}% |

## 10. Known Manual Tests

<!-- Test cases already known, BEFORE generation, to require `Manual Only` — e.g. visual judgment
     calls, exploratory-test dispositions carried from Test Design. -->

| Test Case ID | Why Manual Only |
|---|---|
| {{TEST_CASE_ID}} | {{REASON}} |

## 11. Blocked Tests

<!-- Test cases that cannot proceed to a decision yet because a prerequisite (environment, credential,
     upstream artifact) is missing. Name the SPECIFIC missing prerequisite, never "blocked". -->

| Test Case ID | Missing Prerequisite |
|---|---|
| {{TEST_CASE_ID}} | {{PREREQUISITE}} |

## 12. Version-Specific Guidelines Applied

<!-- §34.4 — the version-accurate guidelines from StackDocumentationContext that shaped generation.
     §34.5: fetched documentation is a GUIDELINE INPUT, NEVER AN AUTHORITY over approved project
     standards. Where Context7's idiomatic layout contradicts
     knowledge_base/automation_framework.md, THE APPROVED FRAMEWORK WINS — the conflict is recorded
     in §14 Risks and resolved by a human. Fetched docs never enter the traceability chain (§12). -->

| Library | Pinned Version | Guideline Applied | Source |
|---|---|---|---|
| {{LIBRARY}} | {{VERSION}} | {{GUIDELINE}} | {{CONTEXT7_ID}} |

**Documentation gaps:** {{DOCUMENTATION_GAPS}}
<!-- Mandatory when any material library could not be queried. Never backfill from model memory, and
     never present model-memory recall as fetched documentation (§34.6). -->

## 13. Assumptions

<!-- Anything this plan assumes to be true that is NOT independently confirmed — e.g. "assumes the
     existing Page Object for Login remains stable for the duration of this suite's generation".
     A detected value that CONTRADICTS a human correction in stack.md is surfaced here (§34.4), never
     silently substituted for the correction. -->

| ID | Assumption | If false, impact |
|---|---|---|
| {{ASSUMPTION_ID}} | {{ASSUMPTION}} | {{IMPACT}} |

## 14. Risks

<!-- Risks to the AUTOMATION EFFORT ITSELF — e.g. a flaky shared environment, an under-specified
     requirement likely to need rework. Also where an approved-framework-versus-fetched-docs conflict
     is recorded for human resolution (§34.5). -->

| ID | Risk | Likelihood / Impact | Mitigation |
|---|---|---|---|
| {{RISK_ID}} | {{RISK}} | {{LIKELIHOOD_IMPACT}} | {{MITIGATION}} |
