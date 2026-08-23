<!--
TEMPLATE — Automation Suite Manifest (Stage 4A — Automation branch)
Renders to: platform_core_data/modules/{{MODULE_SLUG}}/automation/AutomationSuiteManifest_{{FRAMEWORK}}.md
Authority:  .claude/skills/automation-skill/SKILL.md §10 (Suite Planning Engine), §16 Outputs #6, §19

The REALIZED suite structure — what the Automation Plan §5 planned, as it actually came out. Which
suites exist, which test cases and automation assets belong to each, and each suite's shared
setup/teardown/fixtures/components/utilities/test data.

HARD RULE (§10): suites follow BUSINESS WORKFLOWS, NOT INDIVIDUAL PAGES. A suite organized around a
single page, disconnected from the other tests forming the same business workflow, is the wrong shape
and must not be produced. The workflow, not the screen, is the organizing unit.

HARD RULE (§10, §8.11): A SUITE IS A LOGICAL GROUPING, NOT A FOLDER LAYER AND NOT A CLASS. For
Java/SHAFT it is expressed as TestNG groups plus a <test> block in testng.xml /
testng-{{MODULE_SLUG}}.xml — NEVER a workflows/ or services/ package, and never a Workflow or Service
class orchestrating page calls. Test Classes stay organized by application area and module under
src/test/java/AdminPages/ (§8.4); the suite that groups them is organized by workflow. Both are true
at once: the directory answers "what does this test", the suite answers "which tests run together".

Where the realized structure diverges from the Plan, §4 records why — a silent divergence between
plan and manifest is a defect in this stage's output.
-->

# Automation Suite Manifest — {{FRAMEWORK}} — {{MODULE}}

| Field | Value |
|---|---|
| Module | `{{MODULE_SLUG}}` |
| Produced by run | `{{RUN_FOLDER}}` |
| Framework | {{FRAMEWORK}} |
| Module project | `modules/{{MODULE_SLUG}}/automation/tests_{{FRAMEWORK}}/` |
| Runs standalone | {{STANDALONE_VERIFIED}} <!-- Yes / No + why. "No" blocks the §5.2 gate: a reviewer must be able to run it (pipeline.md §4, Stage 4A) --> |
| Suites | {{SUITE_COUNT}} |
| Automated test cases | {{AUTOMATED_CASE_COUNT}} |
| Generated | {{TIMESTAMP}} |

## 1. Suite Index

| Suite | Business Workflow | Grouping Mechanism | Test Cases | Assets | Execution Order |
|---|---|---|---|---|---|
| {{SUITE}} | {{WORKFLOW}} | {{GROUPING}} <!-- e.g. `TestNG group: agency` + `testng-agency.xml <test>` — NEVER a package or class name --> | {{CASE_COUNT}} | {{ASSET_COUNT}} | {{ORDER}} |

## 2. Suites

<!-- One block per suite. Every shared-element row is mandatory per §10; a suite with no shared
     teardown states `None` with a reason rather than omitting the row. -->

### {{SUITE}}

**Business workflow:** {{WORKFLOW}}
<!-- The workflow this suite is organized around — the justification for its shape. -->

**Test cases:**

| Test Case ID | Automation Script | Decision | Status |
|---|---|---|---|
| {{TEST_CASE_ID}} | `{{SCRIPT_PATH}}` | {{DECISION}} <!-- Reuse / Generate / Partially Automatable --> | {{STATUS}} |

**Shared elements (§10) — each mapped to its §8.1 responsibility area:**

| Element | Value / Location | Responsibility area (Java/SHAFT UI) |
|---|---|---|
| Shared Setup | {{SHARED_SETUP}} | Fixture — `src/test/java/utilities/` (§8.5) |
| Shared Teardown | {{SHARED_TEARDOWN}} | Fixture cleanup — `src/test/java/utilities/` (§8.5) |
| Shared Fixtures | {{SHARED_FIXTURES}} | `src/test/java/utilities/` (§8.5) |
| Shared Utilities | {{SHARED_UTILITIES}} | `src/main/java/utilities/` · `Generic_Classes/` (§8.9, §8.8) |
| Shared Test Data | {{SHARED_TEST_DATA}} | JSON — `src/test/resources/{module}/` (§8.6) |
| Shared Components | {{SHARED_COMPONENTS}} <!-- `None — §8.11` unless justified in Plan §3B --> | Not a default layer (§8.11) |

<!-- Repeat the block above for every suite. -->

## 3. Cross-Suite Shared Assets

<!-- Assets shared across more than one suite — the layer a change would ripple through. Knowing this
     is what lets Stage 5H scope a repair's blast radius. -->

| Asset | Responsibility Area | Type | Used By Suites |
|---|---|---|---|
| `{{ASSET}}` | {{AREA}} <!-- Page / Locator / Test / Fixture / Driver / Generic / Utility / Data / Config (§8.1) --> | {{TYPE}} | {{SUITES}} |

## 4. Divergence From Plan

<!-- Where the realized structure differs from AutomationPlan §5 Planned Automation Suites, and WHY.
     Omit this section only when the realized structure matches the plan exactly. -->

| Planned | Realized | Why |
|---|---|---|
| {{PLANNED}} | {{REALIZED}} | {{REASON}} |
