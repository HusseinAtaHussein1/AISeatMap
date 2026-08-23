<!--
TEMPLATE — Automation Manifest (Stage 4A — Automation branch)
Renders to: platform_core_data/modules/{{MODULE_SLUG}}/automation/AutomationManifest_{{FRAMEWORK}}.md
Authority:  .claude/skills/automation-skill/SKILL.md §16 Outputs #3, §15 (Self Review), §19

A structured INVENTORY of the Automation Package: every file it contains, which were GENERATED versus
REUSED, and the Self Review (§15) findings and recommendations.

Files are inventoried at the MODULE AUTOMATION PROJECT path — this stage never writes to the Workspace
Automation Baseline directly (§33.2, Execution Rule 35). Assembly into the baseline happens at
Workspace Merge, after this module's Automation Approval (pipeline.md §12.4).

A file referenced from `automation_baseline/{{FRAMEWORK_LOWER}}/shared/` is inventoried with Origin
`Shared` — it is neither Generated nor Reused by this module, and reporting it as either would claim
ownership of whole-project surface this module does not own (pipeline.md §12.1).

HARD RULE (§8.1, §25 #2): EVERY inventoried file carries its RESPONSIBILITY AREA. A file whose area
cannot be stated is an inventory defect, not an acceptable blank.

HARD RULE (§15.1): Architecture Review is BLOCKING. Section 3A below is mandatory, and it is NEVER
reported `Passed` while an unapproved blocking violation remains — `Passed with notes` is not a
verdict this stage may record.
-->

# Automation Manifest — {{FRAMEWORK}} — {{MODULE}}

| Field | Value |
|---|---|
| Module | `{{MODULE_SLUG}}` |
| Produced by run | `{{RUN_FOLDER}}` |
| Framework | {{FRAMEWORK}} |
| Module project | `modules/{{MODULE_SLUG}}/automation/tests_{{FRAMEWORK}}/` |
| Shared assets referenced | `automation_baseline/{{FRAMEWORK_LOWER}}/shared/` @ `{{BASELINE_REF}}` |
| Lifecycle state | {{AUTOMATION_STATE}} <!-- Generated / Executed / Healed / Approved — pipeline.md §12.3.1 --> |
| Total files | {{TOTAL_FILE_COUNT}} |
| Generated | {{GENERATED_FILE_COUNT}} |
| Reused | {{REUSED_FILE_COUNT}} |
| Created | {{TIMESTAMP}} |

## 1. File Inventory

<!-- EVERY file in the Automation Package. `Origin` is Generated or Reused — a file whose origin
     cannot be stated is an inventory defect, not an acceptable blank. -->

| File | Responsibility Area | Type | Origin | Suite | For Test Case(s) | Lines |
|---|---|---|---|---|---|---|
| `{{FILE_PATH}}` | {{AREA}} <!-- Page / Locator / Test / Fixture / Driver / Generic / Utility / Data / Config (§8.1) --> | {{FILE_TYPE}} | {{ORIGIN}} <!-- Generated / Reused / Shared --> | {{SUITE}} | {{TEST_CASE_IDS}} | {{LINES}} |

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

## 3A. Architecture Review (§15.1) — blocking

<!-- §15.1 — BLOCKING. The 22 named conditions: a locator in a Test Class · a locator declaration in
     a Page Class · a direct driver/element interaction in a Test Class · an assertion in a Page,
     Locator, Fixture, Driver Factory or utility · hardcoded/static test data in Java · a duplicate
     locator definition · a Page Class with no matching Locator Class · a Locator Class containing UI
     actions · a page-specific action outside its Page Class · reusable setup duplicated across tests
     · fixture behaviour inside a Page · a Page depending on a Fixture · a Test Class under src/main
     · a Page or Locator Class under src/test · a package declaration not matching its physical path
     · an unnecessary workflow/service/assertion wrapper · a one-method forwarding class · a
     mixed-responsibility generic helper · an overloaded base class · an empty or unjustified
     architecture folder · a credential or secret in JSON test data · a normal Test Case failing the
     §8.11 simplicity requirement.

     For a non-Java/SHAFT-UI package, each condition applies in that shape's own terms where its
     approved architecture states the equivalent boundary; a condition with no meaning for the shape
     is recorded `Not applicable` (§8.12) — NEVER quietly dropped. -->

**Verdict:** {{ARCHITECTURE_REVIEW_VERDICT}}
<!-- `Passed` / `Blocked — {n} unapproved violations`. NEVER `Passed with notes` while an
     unapproved blocking violation remains (§15.1). -->

| # | Blocking condition | File and method | Current responsibility / location | Expected responsibility / location | Correction made | Remaining exception | Approval requirement |
|---|---|---|---|---|---|---|---|
| {{N}} | {{CONDITION}} | `{{FILE_AND_METHOD}}` <!-- exact location, never "several places" --> | {{CURRENT}} | {{EXPECTED}} | {{CORRECTION}} <!-- or `None` --> | {{EXCEPTION}} <!-- or `None` --> | {{APPROVAL}} <!-- who must approve, at which gate; an exception nobody approved is not an exception --> |

**Violations:** {{VIOLATION_COUNT}} total · {{RESOLVED_COUNT}} resolved · {{APPROVED_EXCEPTION_COUNT}} approved exceptions · {{UNAPPROVED_COUNT}} unapproved
<!-- Any unapproved count above zero means the Verdict is `Blocked`. Write `0 — no violations found`
     rather than omitting the section (§18 Rule 18). -->

## 4. Self Review Recommendations (§15)

<!-- Suggestions from the review pass that were not themselves defects — e.g. a refactor worth doing
     before the suite grows. Suggestions, never applied silently as if approved. -->

| # | Recommendation | Rationale |
|---|---|---|
| {{N}} | {{RECOMMENDATION}} | {{RATIONALE}} |

## 5. Locator Fallbacks (§24.2)

<!-- Every place a preferred locator was unavailable and a fallback was used. Also surfaced in the
     Automation Summary's Known Limitations — Stage 5A reads it to know what is brittle.
     Omit this section only when no fallback was needed. -->

| File | Element | Preferred Locator (unavailable) | Fallback Used | Why Preferred Was Unavailable |
|---|---|---|---|---|
| `{{FILE}}` | {{ELEMENT}} | {{PREFERRED}} | {{FALLBACK}} | {{WHY}} |
