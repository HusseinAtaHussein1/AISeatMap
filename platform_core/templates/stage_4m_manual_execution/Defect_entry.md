<!--
TEMPLATE — Defect entry for a Failed / Inconclusive test case (Stage 4M — Manual branch, terminal)
Used INSIDE: platform_core_data/runs/{{RUN_FOLDER}}/manual_execution/ManualExecutionResults.md §3
Authority:  .claude/skills/manual-execution-skill/SKILL.md §10.1 (Defect Documentation Standard —
            these 15 sections, this order)

MANDATORY for EVERY `Failed` or `Inconclusive` test case. A one-line "expected: X, actual: Y" note is
NEVER sufficient for a non-Passed result.

Written to be professional, complete-sentence, and ready to paste directly into Jira/Azure DevOps
without further editing.

Do not simply state what happened — explain:
  1. What business rule or requirement is being violated.
  2. Why the observed behaviour is incorrect.
  3. Under which conditions the issue occurs (state conditions explicitly — never imply it is
     unconditional when it isn't).
  4. The user/business impact.
  5. Whether it is a UI / validation / business logic / workflow / security / data integrity /
     documentation-mismatch problem — classified explicitly.
-->

#### {{TEST_CASE_ID}} — {{DEFECT_TITLE}}

**1. Test Case ID:** {{TEST_CASE_ID}}

**2. Execution Status:** {{STATUS}}
<!-- Failed / Inconclusive (§8). -->

**3. Execution Time:** {{EXECUTION_TIME}}

**4. Preconditions:** {{PRECONDITIONS}}
<!-- Include only if relevant to HOW the defect manifested. -->

**5. Test Data:** {{TEST_DATA}}

**6. Steps Performed:** {{STEPS_PERFORMED}}
<!-- Brief — the ACTUAL sequence executed, not the Test Design steps restated verbatim. -->

**7. Expected Result:** {{EXPECTED_RESULT}}
<!-- A COMPLETE, PROFESSIONAL STATEMENT naming the requirement/business rule that should have
     governed the outcome — not a fragment. "Blocked" alone is insufficient: state WHY it should be
     blocked.

     Bad:  "Expected: blocked."
     Good: "The system should prevent submission because the Product Access section contains
            mandatory fields, and at least one Product Access configuration is required before
            creating an Agency." -->

**8. Actual Result:** {{ACTUAL_RESULT}}
<!-- A COMPLETE, PROFESSIONAL STATEMENT of what was actually observed, INCLUDING the specific
     condition that let the actual behaviour occur.

     Bad:  "Actual: submitted."
     Good: "The Agency was successfully created even though no Product Access entry was added.
            Validation was not triggered because the entire Product Access section was skipped." -->

**9. Impact:** {{IMPACT}}
<!-- The concrete user/business consequence. -->

**10. Classification**

<!-- A FIXED SIX-FIELD BLOCK, always present — even when a field's honest answer is "Unknown" or
     "Not applicable". Never omit a field to avoid an uncertain answer: an honest "Unknown" is
     correct output, a missing field is not. -->

| Field | Value |
|---|---|
| **Category** | {{CATEGORY}} <!-- Validation / UI / Workflow / Authorization / Business Rule / Data Integrity / Performance / Security. Prefer the most MECHANICALLY PRECISE category over the broadest applicable one — a missing "at least one required" check is `Validation` even though the underlying rule is a business rule; a decision-reversal path that shouldn't exist is `Workflow`, not `Validation`. --> |
| **Layer** | {{LAYER}} <!-- Frontend / Backend / API / Database / Integration / Unknown — based ONLY on what was actually observed. Use `Unknown` rather than guessing when the evidence doesn't distinguish layers. --> |
| **Reproducibility** | {{REPRODUCIBILITY}} <!-- Always / Intermittent / Unable to confirm. `Always` requires AT LEAST TWO independent observations agreeing; a single observation is `Unable to confirm`, never `Always`. --> |
| **Regression** | {{REGRESSION}} |
| **Suspected Component** | {{SUSPECTED_COMPONENT}} |
| **Confidence** | {{CONFIDENCE}} |

**11. Root Cause Analysis:** {{ROOT_CAUSE_ANALYSIS}}
<!-- Include only when it can be REASONABLY INFERRED from what was observed — a plausible
     implementation explanation, ALWAYS HEDGED. Omit this section ENTIRELY, rather than guessing,
     when no reasonable inference is possible. -->

**12. Conclusion:** {{CONCLUSION}}
<!-- A concise statement of the ACTUAL DEFECT — not a repetition of the execution result. -->

**13. Severity:** {{SEVERITY}} — {{SEVERITY_JUSTIFICATION}}
<!-- Critical / High / Medium / Low, with a one-line justification. -->

**14. Priority:** {{PRIORITY}}
<!-- P0 / P1 / P2 / P3. -->

**15. Evidence:**

| Evidence | Path |
|---|---|
| {{EVIDENCE_TYPE}} | `{{EVIDENCE_PATH}}` |
