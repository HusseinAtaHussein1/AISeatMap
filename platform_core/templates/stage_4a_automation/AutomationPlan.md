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

<!-- The overall structure of the automation project — e.g. Page Object Model with a shared
     driver/session layer, or the equivalent pattern for the selected framework. -->

{{PROJECT_ARCHITECTURE}}

## 4. Design Pattern

<!-- The specific pattern(s) in use — e.g. Page Object Model, Screenplay, Fixture-based composition. -->

{{DESIGN_PATTERN}}

## 5. Planned Automation Suites

<!-- §10 — GROUPING MUST FOLLOW BUSINESS WORKFLOWS, NOT INDIVIDUAL PAGES.
     A suite organized around a single page (e.g. just "Employee List Page tests", disconnected from
     the Add Employee / Employee Detail tests forming the same workflow) is THE WRONG SHAPE and must
     not be produced. The workflow, not the screen, is the organizing unit.
     Good: Login Suite · Employee Suite · Leave Suite · Recruitment Suite -->

| Suite | Business Workflow | Test Case IDs | Shared Setup | Shared Teardown | Shared Fixtures | Shared Components | Shared Utilities | Shared Test Data |
|---|---|---|---|---|---|---|---|---|
| {{SUITE}} | {{WORKFLOW}} | {{TEST_CASE_IDS}} | {{SETUP}} | {{TEARDOWN}} | {{FIXTURES}} | {{COMPONENTS}} | {{UTILITIES}} | {{TEST_DATA}} |

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
