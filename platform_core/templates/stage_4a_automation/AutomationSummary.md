<!--
TEMPLATE — Automation Summary (Stage 4A — Automation branch)
Renders to: platform_core_data/automation_baseline/{{FRAMEWORK_LOWER}}/AutomationSummary_{{FRAMEWORK}}.md
Authority:  .claude/skills/automation-skill/SKILL.md §25 (Standard Output Contract — these 8
            sections, this order), §16 Outputs #7, §19

The single consolidated handoff document, for a consumer that needs one file rather than six. It does
NOT replace the other artifacts (§16 #1–#6) — it is a consolidated POINTER/SUMMARY over them.

Section order is mandatory: the Automation Execution skill (and any future consumer) must never have
to interpret free-form prose to extract what it needs.
-->

# Automation Summary — {{FRAMEWORK}}

| Field | Value |
|---|---|
| Framework | {{FRAMEWORK}} |
| Run Folder (this update) | `{{RUN_FOLDER}}` |
| Baseline location | `platform_core_data/automation_baseline/{{FRAMEWORK_LOWER}}/tests_{{FRAMEWORK}}/` |
| Generated | {{TIMESTAMP}} |
| Status | {{STATUS}} <!-- Pending Review / Approved --> |

## 1. Automation Summary

<!-- §25 #1 — ONE PARAGRAPH: Run Scope (§23), framework used, and the overall automation outcome. -->

{{AUTOMATION_SUMMARY_NARRATIVE}}

## 2. Generated Files

<!-- §25 #2 — a FILE-LEVEL listing of what was generated versus reused this run, consolidating the
     Automation Manifest (§16 #3). -->

| File | Responsibility Area | Type | Generated / Reused | Suite |
|---|---|---|---|---|
| `{{FILE_PATH}}` | {{AREA}} <!-- Page / Locator / Test / Fixture / Driver / Generic / Utility / Data / Config (§8.1) --> | {{FILE_TYPE}} | {{ORIGIN}} | {{SUITE}} |

**Totals:** {{GENERATED_FILE_COUNT}} generated · {{REUSED_FILE_COUNT}} reused

<!-- §25 #2 — a file whose responsibility area cannot be stated is an INVENTORY DEFECT, not an
     acceptable blank. -->

## 3. Framework Used

<!-- §25 #3 — the selected framework (§6–§8) and its justification, RESTATED from the Automation Plan
     for a reader who does not want to open a second document. -->

| Field | Value |
|---|---|
| Framework | {{FRAMEWORK}} |
| Version | {{FRAMEWORK_VERSION}} |
| Selection basis | {{SELECTION_BASIS}} <!-- the Framework Decision Gate (§31) answer and its rationale --> |
| Justification | {{JUSTIFICATION}} |
| Architecture used | {{ARCHITECTURE_USED}} <!-- §25 #3. For Java/SHAFT UI: `§8.1 approved Maven structure`. For any other framework/system shape: that stack's own approved structure (§8.12). A bare framework name is not enough for a reader deciding whether the package is reviewable. --> |
| Architecture deviations | {{ARCHITECTURE_DEVIATIONS}} <!-- each named with its §8.13 classification, or `None` --> |
| Architecture Review (§15.1) | {{ARCHITECTURE_REVIEW_VERDICT}} <!-- Passed / Blocked — {n} unapproved violations --> |

## 4. Coverage

<!-- §25 #4 — the Automation Coverage Report's HEADLINE figures only: decision counts and percentage.
     The full accounting stays in AutomationCoverageReport_{{FRAMEWORK}}.md. -->

| Metric | Value |
|---|---|
| Automation coverage | {{AUTOMATION_COVERAGE_PERCENT}}% |
| Basis | {{COVERAGE_BASIS}} |

| Decision | Count |
|---|---|
| Reuse Existing Automation | {{REUSE_COUNT}} |
| Generate New Automation | {{GENERATE_COUNT}} |
| Partially Automatable | {{PARTIAL_COUNT}} |
| Manual Only | {{MANUAL_ONLY_COUNT}} |

## 5. Automation Decisions

<!-- §25 #5 — a REFERENCE to the full Automation Decision Report. This section lists ONLY COUNTS PER
     DECISION TYPE, never every individual case. -->

**Full report:** `modules/{{MODULE_SLUG}}/automation/AutomationDecisionReport_{{FRAMEWORK}}.md`

{{DECISION_COUNT_SUMMARY}}

## 6. Known Limitations

<!-- §25 #6 — EVERY locator fallback (§24.2), EVERY Partially Automatable / Manual Only reason, and
     any Self Review (§15) finding NOT YET RESOLVED. Completeness matters here: this is the section
     Stage 5A reads to know what it cannot trust. -->

**Locator fallbacks (§24.2):**

| Asset | Element | Preferred Locator (unavailable) | Fallback Used | Risk |
|---|---|---|---|---|
| {{ASSET}} | {{ELEMENT}} | {{PREFERRED}} | {{FALLBACK}} | {{RISK}} |

**Partially Automatable / Manual Only reasons:**

| Test Case ID | Decision | Reason |
|---|---|---|
| {{TEST_CASE_ID}} | {{DECISION}} | {{REASON}} |

**Unresolved Self Review findings (§15):**

| Finding | Why unresolved |
|---|---|
| {{SELF_REVIEW_FINDING}} | {{WHY_UNRESOLVED}} |

**Architecture Review (§15.1):**

<!-- §25 #6 — the verdict, EVERY unresolved blocking violation, and EVERY human-approved exception,
     named. Full detail lives in AutomationManifest §3A. -->

| Blocking violation | File and method | Status | Approved by |
|---|---|---|---|
| {{VIOLATION}} | `{{FILE_AND_METHOD}}` | {{STATUS}} <!-- Unresolved / Approved exception --> | {{APPROVER}} <!-- `None` when unapproved --> |

**Optional abstractions generated (§8.11):**

<!-- Every abstraction outside §8.1's default areas that actually shipped, with its justification.
     `None` when zero — possible future reuse is never a justification. -->

| Abstraction | Justification | Approved by |
|---|---|---|
| {{ABSTRACTION}} | {{JUSTIFICATION}} | {{APPROVER}} |

**Architecture deviations carried forward (§8.13):**

| Deviation | Where | Classification |
|---|---|---|
| {{DEVIATION}} | `{{LOCATION}}` | {{CLASSIFICATION}} <!-- Preserved (approved convention) / Correction proposed / Reported, no action --> |

## 7. Execution Instructions

<!-- §25 #7 — HOW TO ACTUALLY RUN the generated suite: command(s), required environment
     variables/config, and any prerequisite setup.
     e.g. `npm install && npx playwright test`, or the SHAFT/TestNG equivalent.
     NEVER include a credential value — reference the credential source instead. -->

**Prerequisites:** {{PREREQUISITES}}

```bash
{{EXECUTION_COMMANDS}}
```

| Required Config / Env Var | Purpose | Source |
|---|---|---|
| {{ENV_VAR}} | {{PURPOSE}} | {{SOURCE}} <!-- e.g. knowledge_base/credentials/credentials.json (git-ignored) --> |

## 8. Inputs for Automation Execution skill

<!-- §25 #8 — the explicit handoff package (§28): confirmation that every input
     .claude/skills/automation-execution-skill/SKILL.md §4 declares it needs is present. -->

| Required Input (Automation Execution §4) | Present? | Location / Note |
|---|---|---|
| {{REQUIRED_INPUT}} | {{PRESENT}} | {{LOCATION}} |

**Handoff confirmation:** {{HANDOFF_CONFIRMATION}}

**Suite to execute:** `modules/{{MODULE_SLUG}}/automation/tests_{{FRAMEWORK}}/`
<!-- Stage 5A executes this run's WORKING COPY, never the Workspace Automation Baseline directly. -->
