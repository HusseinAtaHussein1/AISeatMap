<!--
TEMPLATE — Automation Suite Manifest (Stage 5 of 7)
Renders to: platform_core_data/runs/{{RUN_FOLDER}}/automation/AutomationSuiteManifest_{{FRAMEWORK}}.md
Authority:  .claude/skills/automation-skill/SKILL.md §10 (Suite Planning Engine), §16 Outputs #6, §19

The REALIZED suite structure — what the Automation Plan §5 planned, as it actually came out. Which
suites exist, which test cases and automation assets belong to each, and each suite's shared
setup/teardown/fixtures/components/utilities/test data.

HARD RULE (§10): suites follow BUSINESS WORKFLOWS, NOT INDIVIDUAL PAGES. A suite organized around a
single page, disconnected from the other tests forming the same business workflow, is the wrong shape
and must not be produced. The workflow, not the screen, is the organizing unit.

Where the realized structure diverges from the Plan, §4 records why — a silent divergence between
plan and manifest is a defect in this stage's output.
-->

# Automation Suite Manifest — {{FRAMEWORK}} — {{RUN_FOLDER}}

| Field | Value |
|---|---|
| Run Folder | `{{RUN_FOLDER}}` |
| Framework | {{FRAMEWORK}} |
| Working copy | `runs/{{RUN_FOLDER}}/automation/tests_{{FRAMEWORK}}/` |
| Suites | {{SUITE_COUNT}} |
| Automated test cases | {{AUTOMATED_CASE_COUNT}} |
| Generated | {{TIMESTAMP}} |

## 1. Suite Index

| Suite | Business Workflow | Test Cases | Assets | Execution Order |
|---|---|---|---|---|
| {{SUITE}} | {{WORKFLOW}} | {{CASE_COUNT}} | {{ASSET_COUNT}} | {{ORDER}} |

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

**Shared elements (§10):**

| Element | Value / Location |
|---|---|
| Shared Setup | {{SHARED_SETUP}} |
| Shared Teardown | {{SHARED_TEARDOWN}} |
| Shared Fixtures | {{SHARED_FIXTURES}} |
| Shared Components | {{SHARED_COMPONENTS}} |
| Shared Utilities | {{SHARED_UTILITIES}} |
| Shared Test Data | {{SHARED_TEST_DATA}} |

<!-- Repeat the block above for every suite. -->

## 3. Cross-Suite Shared Assets

<!-- Assets shared across more than one suite — the layer a change would ripple through. Knowing this
     is what lets Stage 6 scope a repair's blast radius. -->

| Asset | Type | Used By Suites |
|---|---|---|
| `{{ASSET}}` | {{TYPE}} | {{SUITES}} |

## 4. Divergence From Plan

<!-- Where the realized structure differs from AutomationPlan §5 Planned Automation Suites, and WHY.
     Omit this section only when the realized structure matches the plan exactly. -->

| Planned | Realized | Why |
|---|---|---|
| {{PLANNED}} | {{REALIZED}} | {{REASON}} |
