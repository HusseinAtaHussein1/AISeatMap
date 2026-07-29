<!--
TEMPLATE — Stack Documentation Context (Stage 4A — Automation branch)
Renders to: platform_core_data/modules/{{MODULE_SLUG}}/automation/StackDocumentationContext_{{FRAMEWORK}}.md
Authority:  .claude/skills/automation-skill/SKILL.md §34 (Stack Documentation Step), §34.4 (this
            structure), §34.5, §34.6; platform_core/tools/mcp/README.md §2.5

Produced PER RUN, BEFORE any code generation. Records what the project's stack actually is, at its
PINNED versions, and which version-accurate documentation was fetched to guide generation.

The same detection ALSO updates platform_core_data/knowledge_base/stack.md IN PLACE (durable, shared
across runs). The split follows §10.4: a run folder holds what happened IN THAT RUN — which Context7
queries were made is run history — while knowledge_base/ holds what is true OF THE PROJECT. A later
run reads stack.md first and re-detects to confirm rather than starting blind.

HARD RULE (§34.4): a run against a pinned-version stack with zero queries performed and no recorded
documentation gap is an INCOMPLETE Automation Plan.

NEVER write business logic, requirements, or application behaviour here (§34.4). This records the
TOOLCHAIN and nothing that belongs in the Project Context or a Finding.
-->

# Stack Documentation Context — {{FRAMEWORK}} — {{RUN_FOLDER}}

| Field | Value |
|---|---|
| Module | `{{MODULE_SLUG}}` |
| Produced by run | `{{RUN_FOLDER}}` |
| Revision | {{REVISION_COUNT}} <!-- in-place edits since creation; this artifact belongs to the module, not the run --> |
| Framework | {{FRAMEWORK}} |
| Detected At | {{TIMESTAMP}} |
| Extractor | `platform_core/tools/mcp/stack_docs/` |
| Durable record updated | `platform_core_data/knowledge_base/stack.md` |

## 1. Detected Stack

<!-- Extracted from the project's own SOURCE (manifests / lockfiles / framework config) and its
     DOCUMENTATION (Project Context Technology Stack, architecture.md, automation_framework.md). -->

| Field | Value | Source |
|---|---|---|
| Ecosystem(s) | {{ECOSYSTEMS}} | {{SOURCE}} |
| Automation Framework | {{FRAMEWORK}} | {{SOURCE}} |
| Language / Runtime | {{LANGUAGE_RUNTIME}} | {{SOURCE}} |
| Build / Test Runner | {{RUNNER}} | {{SOURCE}} |

## 2. Dependency Table

<!-- §34.4 / mcp/README.md §2.5 — one row per material library.
     `Pinned?` matters: a pinned version is what makes version-accurate documentation fetchable, and
     an unpinned one is itself worth recording. -->

| Library | Resolved Version | Pinned? | Source File | Context7 ID | Queried? |
|---|---|---|---|---|---|
| {{LIBRARY}} | {{VERSION}} | {{PINNED}} | `{{SOURCE_FILE}}` | {{CONTEXT7_ID}} | {{QUERIED}} |

## 3. Queries Performed

<!-- The actual Context7 queries made this run — run history, which is why it lives here rather than
     in stack.md. A material library with `Queried? = no` must appear in §6 Documentation Gaps. -->

| # | Library (Context7 ID) | Query | Outcome |
|---|---|---|---|
| {{N}} | {{CONTEXT7_ID}} | {{QUERY}} | {{OUTCOME}} |

## 4. Guidelines Extracted

<!-- The version-specific guidance that will shape generation. Cited by the Automation Plan §12.
     A guideline is only recorded here if it came from FETCHED DOCUMENTATION — never from model
     memory (§34.6). -->

| Library | Version | Guideline | Applies To |
|---|---|---|---|
| {{LIBRARY}} | {{VERSION}} | {{GUIDELINE}} | {{APPLIES_TO}} |

## 5. Conflicts

<!-- §34.5 — THE APPROVED PROJECT FRAMEWORK GOVERNS. Where Context7's idiomatic layout contradicts
     knowledge_base/automation_framework.md (e.g. an idiomatic Playwright structure against SHAFT's
     Pages/Locators/Tests/Data layering, or accessibility-first locators against the `Btn_`/`Txt_`
     prefix convention), the APPROVED FRAMEWORK WINS.

     Every conflict is recorded here AND in the Automation Plan's Assumptions/Risks, resolved by a
     HUMAN per automation_framework.md's Gap Resolution Rule. Fetched docs never license redesigning
     an approved framework, and never justify a coverage decision, a Finding, or a test case's
     existence — they are outside the traceability chain (§12).

     Also record here any detected value that contradicts a HUMAN CORRECTION in stack.md — the
     detected value does NOT replace the correction (§34.4). -->

| # | Fetched Documentation Says | Approved Framework Says | Resolution (human) |
|---|---|---|---|
| {{N}} | {{DOC_POSITION}} | {{FRAMEWORK_POSITION}} | {{RESOLUTION}} |

## 6. Documentation Gaps

<!-- §34.6 — recorded per-library, NEVER backfilled from memory and never silently dropped:
       - `context7` unavailable or unapproved → record as a gap and proceed, generating from the
         pinned versions and the project's established conventions.
       - No credible library match, or no docs for the pinned version → a per-library gap.
       - No material dependency detected at all → a gap, NOT an assumed stack. If the framework is
         resolved but its dependencies are undiscoverable, state that plainly in the Plan's Risks. -->

| Library / Scope | Gap | Why | Fallback Used |
|---|---|---|---|
| {{LIBRARY}} | {{GAP}} | {{WHY}} | {{FALLBACK}} |
