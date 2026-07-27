<!--
TEMPLATE — Automation Manifest (Stage 5 of 7)
Renders to: platform_core_data/runs/{{RUN_FOLDER}}/automation/AutomationManifest_{{FRAMEWORK}}.md
Authority:  .claude/skills/automation-skill/SKILL.md §16 Outputs #3, §15 (Self Review), §19

A structured INVENTORY of the Automation Package: every file it contains, which were GENERATED versus
REUSED, and the Self Review (§15) findings and recommendations.

Files are inventoried at the run's WORKING COPY path — this stage never writes to the Workspace
Automation Baseline directly (§33.2, Execution Rule 35). Promotion happens at Workspace Merge, after
Automation Approval.
-->

# Automation Manifest — {{FRAMEWORK}} — {{RUN_FOLDER}}

| Field | Value |
|---|---|
| Run Folder | `{{RUN_FOLDER}}` |
| Framework | {{FRAMEWORK}} |
| Working copy | `runs/{{RUN_FOLDER}}/automation/tests_{{FRAMEWORK}}/` |
| Total files | {{TOTAL_FILE_COUNT}} |
| Generated | {{GENERATED_FILE_COUNT}} |
| Reused | {{REUSED_FILE_COUNT}} |
| Created | {{TIMESTAMP}} |

## 1. File Inventory

<!-- EVERY file in the Automation Package. `Origin` is Generated or Reused — a file whose origin
     cannot be stated is an inventory defect, not an acceptable blank. -->

| File | Type | Origin | Suite | For Test Case(s) | Lines |
|---|---|---|---|---|---|
| `{{FILE_PATH}}` | {{FILE_TYPE}} <!-- test script / page object / locator / fixture / utility / config / test data --> | {{ORIGIN}} <!-- Generated / Reused --> | {{SUITE}} | {{TEST_CASE_IDS}} | {{LINES}} |

## 2. By Type

| Type | Generated | Reused | Total |
|---|---|---|---|
| {{FILE_TYPE}} | {{GENERATED}} | {{REUSED}} | {{TOTAL}} |

## 3. Self Review Findings (§15)

<!-- The Self Review pass over the generated package. Unresolved findings ALSO appear in the
     Automation Summary's Known Limitations (§25 #6) — this is where their detail lives.
     A finding is recorded whether or not it was resolved; "resolved" is a status, not a reason to
     omit the row. -->

| # | Finding | File(s) | Severity | Status | Resolution / Why Unresolved |
|---|---|---|---|---|---|
| {{N}} | {{FINDING}} | `{{FILES}}` | {{SEVERITY}} | {{STATUS}} <!-- Resolved / Unresolved --> | {{RESOLUTION}} |

## 4. Self Review Recommendations (§15)

<!-- Suggestions from the review pass that were not themselves defects — e.g. a refactor worth doing
     before the suite grows. Suggestions, never applied silently as if approved. -->

| # | Recommendation | Rationale |
|---|---|---|
| {{N}} | {{RECOMMENDATION}} | {{RATIONALE}} |

## 5. Locator Fallbacks (§24.2)

<!-- Every place a preferred locator was unavailable and a fallback was used. Also surfaced in the
     Automation Summary's Known Limitations — Stage 6 reads it to know what is brittle.
     Omit this section only when no fallback was needed. -->

| File | Element | Preferred Locator (unavailable) | Fallback Used | Why Preferred Was Unavailable |
|---|---|---|---|---|
| `{{FILE}}` | {{ELEMENT}} | {{PREFERRED}} | {{FALLBACK}} | {{WHY}} |
