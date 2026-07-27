<!--
TEMPLATE — Coverage Summary (Stage 2 of 7)
Renders to: platform_core_data/runs/{{RUN_FOLDER}}/discovery/Coverage_Summary.md
Authority:  .claude/skills/explorer-skill/SKILL.md §7

The run-wide coverage tracker, reconciled against the Project Context's DECLARED in-scope surface —
not against whatever happened to be reachable. Rolled up into the QA Assessment Report §10.

Every Visited/Skipped/Blocked/Unreachable entry records its Discovery Mode (§8.1), so a reviewer can
see at a glance which parts of the run were live-verified versus covered by a fallback mode.
-->

# Coverage Summary — {{RUN_FOLDER}}

| Field | Value |
|---|---|
| Run Folder | `{{RUN_FOLDER}}` |
| In-scope surface (from Project Context) | {{DECLARED_IN_SCOPE_SURFACE}} |
| Generated | {{TIMESTAMP}} |

## 1. Coverage Percentage

<!-- A simple, stated ratio of Visited Screens against the Project Context's TOTAL DECLARED in-scope
     screens/surface, with the ratio's basis SHOWN. A mechanical count — never a judgment about
     whether that coverage was sufficient. -->

**{{COVERAGE_PERCENT}}%** — basis: {{COVERAGE_BASIS}}
<!-- e.g. "6/6 Login-scope screens visited = 100%" -->

## 2. Visited Screens

<!-- Distinct screens/URLs actually explored. -->

| Screen / URL | Module | Discovery Mode | Snapshot Artifact |
|---|---|---|---|
| {{SCREEN}} | {{MODULE}} | {{MODE}} | `discovery/{{SNAPSHOT_FILE}}` |

## 3. Visited Components

<!-- Distinct reusable UI components exercised (e.g. a shared typeahead, a shared dropdown pattern).
     Noted ONCE PER COMPONENT — not once per occurrence. -->

| Component | Where Exercised | Discovery Mode |
|---|---|---|
| {{COMPONENT}} | {{LOCATIONS}} | {{MODE}} |

## 4. Skipped Areas

<!-- In-scope areas this skill CHOSE not to explore this run, and why (e.g. deprioritized within a
     time-bounded run). A choice, distinct from Blocked (attempted, couldn't proceed). -->

| Area | Module | Why Skipped | Discovery Mode Available |
|---|---|---|---|
| {{AREA}} | {{MODULE}} | {{REASON}} | {{MODE}} |

## 5. Blocked Areas

<!-- In-scope areas exploration was ATTEMPTED against but could not proceed past (e.g. a workflow
     requiring data the environment lacks). Record only after the mid-run Recovery Strategy (§21)
     has been attempted and failed. -->

| Area | Module | What Blocked It | Recovery Attempted (§21) | Discovery Mode |
|---|---|---|---|---|
| {{AREA}} | {{MODULE}} | {{BLOCKER}} | {{RECOVERY_ATTEMPTS}} | {{MODE}} |

## 6. Unreachable Areas

<!-- In-scope areas that could not be reached AT ALL given the Environment Constraints or credentials
     available — including features that don't exist yet with no documentation either (§8.2), each of
     which also raises a `Test Gap` Finding rather than fabricated discovery. -->

| Area | Module | Why Unreachable | Finding / Open Question ID |
|---|---|---|---|
| {{AREA}} | {{MODULE}} | {{REASON}} | {{FINDING_ID}} |

## 7. Roll-Up

| Status | Count |
|---|---|
| Visited Screens | {{VISITED_SCREEN_COUNT}} |
| Visited Components | {{VISITED_COMPONENT_COUNT}} |
| Skipped | {{SKIPPED_COUNT}} |
| Blocked | {{BLOCKED_COUNT}} |
| Unreachable | {{UNREACHABLE_COUNT}} |

**By Discovery Mode:** {{MODE_BREAKDOWN}}
<!-- e.g. "Browser automation: 5 screens · User-guided: 1 screen · Documentation: 2 areas" -->
