<!--
TEMPLATE — Single Test Case entry (Stage 3 of 7)
Used INSIDE: platform_core_data/runs/{{RUN_FOLDER}}/test_design/TestCases_{{MODULE}}.md
Authority:  .claude/skills/test-design-skill/SKILL.md §6.1 (these fields, this order — "no more"),
            §6.0 (Lean Test Case Philosophy), §6.0.1 (Granularity Tier), §6.2

THE TEST CASE IS FOR EXECUTION, NOT ANALYSIS. Traceability, Risk, and categorization detail are
mandatory for the pipeline's traceability guarantee — but they are recorded in the Traceability
Matrix and Coverage Report (keyed by Test Case ID), NOT as inline fields here. Adding a Requirement
Reference / Risk / Category field to this block is a spec violation, not extra rigour.

ONE BUSINESS BEHAVIOUR PER TEST CASE. A case chaining unrelated actions must be split. One behaviour
exercised across several data points (matrix-style) is still one behaviour, parameterized.

Readability Check — apply before finalizing (§6.0):
  1. Can a new QA engineer execute it without help?
  2. Can it be understood in under 30 seconds?
  3. Is every step necessary?
  4. Is there any redundant wording?
  5. Does it verify only one business rule?
If any answer is "No", rewrite the case.

GOLDEN RULE: if removing a sentence does not change how the test is executed, remove it.
-->

### {{TEST_CASE_ID}} — {{TITLE}}

<!-- Test Case ID: stable, unique, scoped per module. e.g. TC-LOGIN-001
     Title: short, specific, human-scannable. -->

**Objective:** {{OBJECTIVE}}
<!-- ONE sentence stating what this case verifies. Not a restatement of the requirement. -->

**Preconditions:** {{PRECONDITIONS}}
<!-- Only what is required IMMEDIATELY BEFORE execution. e.g. "User is logged in as Admin." -->

**Test Data:**
<!-- The specific input values the steps actually reference, kept minimal — never values the steps
     never use. For a negative test, include the exact boundary/invalid value being exercised (§7).
     OMIT THIS FIELD ENTIRELY when the case has no test data. -->

| Field | Value |
|---|---|
| {{FIELD}} | {{VALUE}} |

**Steps:**
<!-- ONE USER ACTION PER STEP. Steps carry actions only — verification belongs in Expected Result.
     "Click Save and verify the message appears" is two things: split it.
     Short, direct sentences. No jargon, no long paragraphs, no explaining obvious actions.

     Good: "1. Open the Agency page. 2. Click **Create Agency**. 3. Enter a valid Agency Name.
            4. Leave the Product Access section empty. 5. Click **Save**."
     Bad:  "Navigate to the Agency management module, ensuring all required prerequisites are
            satisfied before attempting to initiate the creation workflow…" -->

1. {{STEP}}

**Expected Result:** {{EXPECTED_RESULT}}
<!-- The specific, OBSERVABLE outcome that constitutes a pass. One verification point per statement.
     Complete but minimal — not a hedge, not a value judgment.
     For a regression test derived from a Finding (§5.3), state the CORRECTED behaviour — never a
     restatement of the bug.

     Good: "The system displays a validation message indicating that Product Access is required."
     Bad:  "The application should ideally validate according to the business rules and prevent the
            user from proceeding." -->

**Priority:** {{PRIORITY}}
<!-- P1–P4 — how urgently this case should run relative to others. -->

**Tags:** {{TAGS}}
<!-- Short labels only, never a paragraph. MUST include the Granularity Tier (§6.0.1) on every case:
       Atomic     — a single business rule or validation
       Scenario   — one complete user workflow composed of several related business rules
       E2E        — an entire business journey spanning multiple screens or modules
     Plus, as applicable: Smoke, Regression, Negative-InvalidInputs, AutomationCandidate.
     Tags replace what used to be separate Category / Test Type / Automation-Candidate fields.

     An E2E case must state in its Objective that it spans multiple screens/modules, and never
     replaces the Atomic/Scenario cases covering the same ground — E2E is additive. -->

**Notes:** {{NOTES}}
<!-- OPTIONAL — genuinely helpful execution context only. NEVER move essential execution information
     (a step, a value, the actual expected outcome) into Notes to keep Steps short: that is hiding
     required content, not simplifying. Omit the field entirely when there is nothing to add. -->
