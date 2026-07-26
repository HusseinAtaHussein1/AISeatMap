---
name: automation-skill
description: Stage 5 of 7 in the Agentic AI Testing Platform pipeline (Automation Engineering skill). Transforms the Manual Execution skill's confirmed Automation Candidates — plus their full content from the approved Manual Test Suite — into a production-quality automation package: detecting/selecting a framework (Playwright, SHAFT, Selenium, etc.), reusing existing automation, and never executing what it generates. Use when generating or extending test automation from a Manual Execution skill's Automation Candidate Package.
inputs:
  - name: project_context
    type: file_path
    required: true
    description: Approved Project Context.
  - name: automation_candidate_package
    type: file_path
    required: true
    description: Approved Automation Candidate Package from the Manual Execution skill — the sole source of which test case IDs are in scope for this run.
  - name: manual_execution_summary
    type: file_path
    required: true
    description: Approved Manual Execution Summary — the execution evidence backing the Automation Candidate Package.
  - name: manual_test_suite
    type: file_path
    required: true
    description: Approved Manual Test Suite (Markdown + Excel) — read for the full content of exactly the test case IDs named in the Automation Candidate Package.
  - name: traceability_matrix
    type: file_path
    required: true
    description: Approved Requirement Traceability Matrix.
  - name: coverage_report
    type: file_path
    required: true
    description: Approved Coverage Report.
  - name: discovery_artifacts
    type: file_path
    required: false
    description: Approved Discovery Artifacts, Findings, and Evidence Packages — used only to resolve UI/selector detail, never as a source of business logic.
  - name: existing_automation_package
    type: file_path
    required: false
    description: "The project's one authoritative automation project for the resolved framework, if one exists (`platform_core_data/workspace/automation/tests_{Framework}/`), copied wholesale into this run's own working copy at Working Copy Creation (`workflows_and_pipelines/pipeline/pipeline.md` §12.3) before any generation begins — inspected and reused per §9/§11, never edited at its baseline location directly."
outputs:
  - name: automation_plan
    type: file_path
    location: "platform_core_data/workspace/automation/AutomationPlan_{Framework}.md"
    description: Target framework/language/architecture, planned suites, existing vs. new assets, estimated coverage.
  - name: automation_package
    type: file_path
    location: "platform_core_data/workspace/automation/tests_{Framework}/"
    description: The generated/reused automation project — scripts, page objects, fixtures, configuration.
  - name: automation_manifest
    type: file_path
    location: "platform_core_data/workspace/automation/AutomationManifest_{Framework}.md"
    description: File inventory plus Self Review findings.
  - name: automation_decision_report
    type: file_path
    location: "platform_core_data/workspace/automation/AutomationDecisionReport_{Framework}.md"
    description: Per-test-case Reuse/Generate/Partially Automatable/Manual Only decision.
  - name: automation_coverage_report
    type: file_path
    location: "platform_core_data/workspace/automation/AutomationCoverageReport_{Framework}.md"
    description: Aggregate automation coverage percentage and named reasons for every gap.
  - name: automation_suite_manifest
    type: file_path
    location: "platform_core_data/workspace/automation/AutomationSuiteManifest_{Framework}.md"
    description: Realized suite structure and shared fixtures/utilities per suite.
  - name: automation_summary
    type: file_path
    location: "platform_core_data/workspace/automation/AutomationSummary_{Framework}.md"
    description: "Consolidated handoff document (Framework Used, Execution Instructions, Coverage, Known Limitations) for the automation-execution-skill. NDC uses a `workspace/automation/` variant of these paths — see `platform_core_data/onboarding.md`."
  - name: stack_documentation_context
    type: file_path
    location: "platform_core_data/workspace/automation/StackDocumentationContext_{Framework}.md"
    description: "Detected stack, pinned dependency versions, Context7 queries performed, version-specific guidelines extracted, conflicts, and documentation gaps (§34) — written before any code generation begins."
dependencies:
  - project-context-skill, explorer-skill, test-design-skill, manual-execution-skill (upstream skills)
  - Detected automation framework toolchain (Playwright, SHAFT/TestNG/Allure, Selenium, Cypress, Appium, REST Assured, or equivalent)
  - "platform_core/tools/mcp/ (MCP tools layer — the `context7` server for the §34 Stack Documentation step, and the `playwright` server as a selectable browser mode for selector verification per its README §1.2)"
  - "platform_core/tools/mcp/stack_docs/ (shared stack + pinned-dependency extractor backing §34.2)"
  - "platform_core_data/knowledge_base/patterns/repair_patterns/, automation_patterns/, framework_patterns/ (Platform Knowledge, consulted before generating new assets)"
---

> **Pipeline position:** Stage 5 of 7 — consumes the Approved Project Context, the Manual Execution skill's Automation Candidate Package and Manual Execution Summary, the Manual Test Suite (content source), Requirement Traceability Matrix, Coverage Report, Discovery Artifacts, Findings, and Evidence Packages, produces a production-quality Automation Package.
> **Traceability:** `Requirement → Discovery → Finding → Evidence → Manual Test Case → Manual Execution Result → Automation Candidate → Automation Script` (§12).
> **Revision history:** see `docs/CHANGELOG.md`.

# 1. Skill Name

**Automation skill** (Automation Engineering skill) — v3

# 2. Purpose

The Automation skill transforms the test cases the Manual Execution skill has confirmed successful and stable — pulling their full content from the approved Manual Test Suite — into a **production-quality automation project** — not merely a collection of isolated scripts. It is the bridge between manual validation and automated execution: it must automate exactly what the Automation Candidate Package names — no more, no less — respecting the business rules already reconciled into the Project Context, reusing whatever automation already exists before generating anything new, and being explicit about anything it could not safely, reliably, or confidently automate.

**Its responsibility ends the moment the automation package has been successfully generated.** It never executes automation, never runs the suite against any environment, and never reports pass/fail results — that is exclusively the Automation Execution skill's responsibility (Stage 6). This boundary is absolute: generating code and running code are two different pipeline stages, and this skill stops precisely at the handoff between them.

This skill designs and generates a project; it does not execute one.

# 3. Responsibilities

- **Consume only approved artifacts** (§4) — Project Context, the Manual Execution skill's Automation Candidate Package and Manual Execution Summary, the Manual Test Suite, Requirement Traceability Matrix, Coverage Report, Discovery Artifacts, Findings, and Evidence Packages, every one of them cleared at its own pipeline checkpoint.
- **Never read the PRD directly** — only Stage 1 (Project Context skill) is permitted to, per `workflows_and_pipelines/pipeline/pipeline.md` §6 Rule 4.
- **Produce a complete Automation Plan (§5) before any code generation begins.** No script, page object, or configuration file is written until the plan is finished.
- **Detect the target automation framework from the approved Project Context — never assume one** (§6), and select the most appropriate framework using explicit, justified criteria (§7), treating SHAFT Engine as a first-class option (§8) alongside Playwright, Selenium, Cypress, Appium, REST Assured, and any other framework the Project Context or existing project may specify.
- **Inspect any existing automation project before generating anything new** (§9), and treat it as a reusable knowledge base (§11) — reuse before generating is not a preference, it is the default behavior.
- **Group approved test cases into logical automation suites organized around business workflows**, not individual pages or screens (§10), with shared setup, teardown, fixtures, components, utilities, and test data per suite.
- **Assign every test case named in the Automation Candidate Package exactly one Automation Decision** — Reuse Existing Automation, Generate New Automation, Partially Automatable, or Manual Only (§13) — each with an explicit justification, never a silent omission.
- **Generate only maintainable automation** — modular, DRY, readable, reusable, maintainable, versionable (§14) — preferring composition over duplication.
- **Perform a Self Review pass before declaring generation complete** (§15), checking naming consistency, duplicate code, broken references, and missing reusable assets/page objects/utilities/test data, and producing recommendations wherever improvements are identified.
- **Maintain the full traceability chain** — Requirement → Discovery → Finding → Evidence → Manual Test Case → Automation Script (§12) — on every generated asset.
- Report any test case that cannot be automated safely — explicitly, by ID, with a reason — rather than silently dropping it or forcing a workaround.
- Never invent missing business logic. If a test case or the Project Context does not fully specify expected behavior for a scenario, this skill flags the case as not fully automatable (§13) rather than guessing at the missing logic.
- Never modify an approved manual test case to make it more automatable — a test case that needs to change is a Stage 3 concern, escalated as a discrepancy, not silently rewritten here.
- Never overwrite an existing reusable asset (page object, utility, fixture, component) without explicit approval — extend or compose around it instead, or flag the conflict for a human decision.
- **Never execute the generated automation** — running it is the Automation Execution skill's responsibility, exclusively.
- **Adapt automation strategy to the run's Run Scope Type** (§23) — an Entire Project generation pass, a single Feature's suite, and a Bug's regression-script-only scope are different activities at different breadth, not one default approach applied uniformly.
- **Apply a named, prioritized Locator Strategy with fallback and recovery recommendations** (§24) — never generate a brittle, single-strategy selector where a more stable and a fallback option both exist.
- **Produce output conforming to the Standard Output Contract** (§25), including the Automation Summary (§16), so the Automation Execution skill never has to interpret free-form prose to find what it needs.
- **Recognize named Stop Conditions** (§26) and, rather than halting the entire run over one blocked test case, recommend the smallest missing prerequisite needed to unblock it (§27) while continuing to generate automation for every other unblocked test case.
- **Verify handoff completeness before concluding a run** (§28) — confirm every input the Automation Execution skill's own specification declares it needs is actually present, specific, and unambiguous, not merely assumed.

# 4. Inputs

The Automation skill consumes only approved artifacts. Every input below must be in an `Approved` checkpoint state before this skill uses it; if any required input is still `Pending Review`, `Pending Automation Approval`, or `Rejected`, this skill halts and reports the blocking artifact rather than proceeding against a draft.

| Input | Role | Required? | Description |
|---|---|---|---|
| Project Context | Governing | Required, must be `Approved` | `platform_core_data/workspace/context/ProjectContext.md` — target environment URL, credentials, business rules, and safety constraints that govern what may be automated |
| Run Scope | Governing (embedded) | Required | Not a separate file — the Type/Source recorded in the Project Context's own Scope Summary (`workflows_and_pipelines/pipeline/run_scope.md` §3–§4). Called out explicitly because it drives §23's strategy selection, not left an implicit read of prose. |
| Framework Configuration | Governing (embedded, may be absent) | Conditionally required — see §6 | **Hidden-assumption check:** the Project Context's own required document structure (`.claude/skills/project-context-skill/SKILL.md` §8) has no dedicated "Framework" field — a framework preference, if one exists, currently surfaces only informally, inside Environment Constraints prose or an existing automation project (§9). This skill must not assume this field exists or is populated; if no framework is stated anywhere and no existing automation project exists to infer one from, §6's existing halt-and-report rule applies. |
| Project Configuration | Governing (embedded) | Required | Target environment, credentials, and safety constraints — already covered by the Project Context row above; named separately here only to confirm no *additional*, undeclared configuration source is silently assumed. |
| Automation Candidate Package | **Primary** | Required, must be `Approved` | `platform_core_data/workspace/manual_execution/AutomationCandidatePackage.md` — from the Manual Execution skill (Stage 4). The sole source of *which* test case IDs are in scope for this run: only test cases the Manual Execution skill actually executed, confirmed `Passed`, and judged deterministic and stable (`.claude/skills/manual-execution-skill/SKILL.md` §9) may receive an automation decision (§13). This skill no longer determines automation scope directly from the raw Manual Test Suite — a test case absent from this package is out of scope for this run, full stop, regardless of how it reads in the Manual Test Suite. |
| Manual Execution Summary | Secondary | Required, must be `Approved` | `platform_core_data/workspace/manual_execution/ManualExecutionSummary.md` — the execution evidence and exclusion reasoning backing the Automation Candidate Package; consulted for context, never re-litigated |
| Manual Test Suite | Secondary — content source | Required, must be `Approved` | `platform_core_data/workspace/test_design/TestCases_*.md` and `.xlsx` — read directly for the full test case content (Steps, Test Data, Expected Result, schema fields, §6 of `.claude/skills/test-design-skill/SKILL.md`) of exactly the test case IDs named in the Automation Candidate Package. This skill's entire "Automation Requirements" input is the combination of the Automation Candidate Package (which IDs) and this artifact (their full content) — there is no separate requirements artifact to consult beyond them. |
| Requirement Traceability Matrix | Secondary | Required, must be `Approved` | `platform_core_data/workspace/test_design/TraceabilityMatrix.md` — carries the Requirement/Discovery/Finding/Evidence references this skill must propagate onto each Automation Script (§12) |
| Coverage Report | Secondary | Required, must be `Approved` | `platform_core_data/workspace/test_design/CoverageReport.md` — informs which test cases and Findings are already known to be Uncovered/exceptions, so this skill doesn't attempt to automate what Stage 3 already excluded |
| Discovery Artifacts | Secondary | Required, must be `Approved` | `platform_core_data/workspace/discovery/*.md` — used only to resolve UI/selector detail a test case under-specifies, never as a source of business logic |
| Findings | Secondary | Required if any exist, must be `Approved` | `platform_core_data/workspace/discovery/findings/Findings_Summary.md` and each `FINDING-{ID}_{ShortName}/metadata.md` — used to carry Finding Reference through to the Automation Script that regress-tests or exploratory-tests it |
| Evidence Packages | Secondary | Required wherever a test case's Finding Reference is populated, must be `Approved` | `platform_core_data/workspace/discovery/findings/FINDING-{ID}_{ShortName}/` — cited by reference on the resulting Automation Script; never copied wholesale into generated code |
| Existing Automation Package(s) | Contextual | Optional — present if one or more prior automation efforts exist | **A project holds exactly one authoritative Automation Package per framework** (v8) — e.g. `tests_SHAFT/` and `tests_Playwright/` both under `platform_core_data/workspace/automation/`, tracked in that project's `AutomationPackages.md` registry (§19), one row per framework. Multiple *different* frameworks may coexist; never two competing packages within the same framework. This skill reads the registry in full, inspects each framework's one project per §9, and treats it as a reusable knowledge base per §11, before the Framework Decision Gate (§31) asks whether to extend the existing project, start one for a framework that doesn't have one yet, or (rare, explicit) reset one from scratch. |

**This skill must never read the PRD directly** (`platform_core_data/PRD.md` or equivalent) — only Stage 1 is permitted to, per `workflows_and_pipelines/pipeline/pipeline.md` §6 Rule 4. If a test case's specification is genuinely incomplete, that is reported as a gap (§13, "Partially Automatable" or "Manual Only") rather than a reason to independently consult the PRD or raw Discovery Artifacts for missing business logic.

# 5. Automation Planning Engine

**Before generating any automation asset, this skill must produce a complete Automation Plan.** No code generation of any kind — no script, page object, fixture, or configuration file — begins before this plan is finished and internally consistent.

The Automation Plan must include:

- **Target Framework** — the framework selected per §6–§8, with its justification
- **Target Language** — the programming language the framework will be authored in
- **Project Architecture** — the overall structure of the automation project (e.g., Page Object Model with a shared driver/session layer, or the equivalent pattern for the selected framework)
- **Design Pattern** — the specific pattern(s) in use (e.g., Page Object Model, Screenplay, Fixture-based composition)
- **Planned Automation Suites** — the business-workflow-organized suites from the Suite Planning Engine (§10)
- **Existing Assets** — everything already reusable, discovered per Existing Framework Analysis (§9)
- **Assets To Generate** — what must be newly authored, and why nothing existing covers it
- **Assets To Reuse** — the specific existing assets this plan intends to reuse, and where
- **Estimated Automation Coverage** — a projected percentage of approved test cases expected to receive a Reuse/Generate decision (§13) versus Partially Automatable/Manual Only, before generation actually happens
- **Known Manual Tests** — test cases already known, before generation, to require `Manual Only` (e.g., visual judgment calls, exploratory-test dispositions carried from Test Design)
- **Blocked Tests** — test cases that cannot proceed to a decision yet because a prerequisite (environment, credential, upstream artifact) is missing
- **Risks** — risks to the automation effort itself (e.g., a flaky shared environment, an under-specified requirement likely to need rework)
- **Assumptions** — anything this plan assumes to be true that isn't independently confirmed (e.g., "assumes the existing Page Object for Login remains stable for the duration of this suite's generation")

The Automation Plan is itself a required output (§16) and is written first, in full, before any other artifact in this stage.

# 6. Framework Detection

This skill determines the target automation technology from the approved Project Context. **It must never assume a framework.**

Supported automation frameworks include, but are not limited to:

- Playwright
- SHAFT Engine
- Selenium
- Cypress
- Appium
- REST Assured
- Postman (API collections/environments, where a project's automation is Postman-based rather than a full code framework)

This list is explicitly extensible and must never be treated as exhaustive — a Project Context or an existing automation project may specify or already use a framework not listed here, and this skill must accommodate it rather than forcing a fit into one of the frameworks named above.

**Playwright must never be treated as the default.** It appears first in the list above and throughout this document's examples purely for illustrative consistency — that is a documentation convenience, not a selection preference. This skill selects a framework only via §7's precedence rules (explicit Project Context statement → existing project's framework → criteria-based selection), and an example elsewhere in this specification using Playwright must never be read as license to prefer it absent one of those three grounds.

If the Project Context does not specify a framework and no existing automation project exists to infer one from, this skill halts and reports the gap rather than picking a framework unilaterally.

**Discovery technology is never Automation technology (v4).** Which tool Stage 2 (Explorer skill) happened to use for Browser Automation — Playwright, a Playwright MCP server, or anything else — is Discovery tooling, scoped entirely to §8.1 of `.claude/skills/explorer-skill/SKILL.md`. It carries **zero weight** in this skill's framework choice and must never be cited as a reason, partial reason, or tiebreaker for selecting an automation framework. A project whose Framework Configuration names SHAFT (or any other framework) uses that framework's real toolchain (for SHAFT: Java, TestNG, Allure — §8) regardless of which browser-automation tool Discovery happened to use. Conflating the two — e.g., generating Playwright automation because Playwright was already open for Discovery — is a specification violation under this revision, not a harmless convenience. See §31 (Framework Decision Gate).

# 7. Framework Selection

Where a specific framework is not already dictated (see below), the Automation skill selects the most appropriate automation framework based on the approved Project Context, using these criteria:

- Existing automation framework (if one is already in use in this project)
- Existing project structure
- Technology stack
- Programming language
- Application type (Web, API, Mobile, Desktop)
- Team standards (as stated in the Project Context or run configuration)
- Existing reusable automation assets

Rules, in order of precedence:

1. **If the Project Context explicitly specifies a framework, this skill must use it.** No selection process overrides an explicit instruction. This still requires running the Framework Decision Gate (§31) before generating anything — an explicit Project Context statement tells this skill *which answer to expect*, it does not license skipping the question. If the human confirms the stated framework, proceed; if the human asks for something else, that supersedes the Project Context statement (the human's live decision governs over a possibly-stale document, but the disagreement is itself surfaced, never silently resolved either way).
2. **A project holds exactly one authoritative Automation Package per framework (v8)** — the repository stores one project per framework it uses; it does not bind a project to a single framework overall, but it never holds two competing, independent packages *within* the same framework either. "Reuse before generating new" (§9/§11) applies within that one project, never split across parallel packages that fragment the same framework's coverage. Per §31, this skill enumerates every existing framework's project, and asks — per §31.6's Human Decision Principle, never inferred — whether to extend the existing one, start a project for a framework that doesn't have one yet, or (rare, explicit) reset a framework's project from scratch.
3. Only when neither of the above applies does this skill select a framework — but never autonomously. The criteria list above informs a **recommendation** this skill presents to a human via the Framework Decision Gate (§31); it is never used to silently pick a framework and proceed, no matter how clear-cut the criteria look.

**The selected framework must always be justified in the Automation Plan (§5)** — a framework choice with no stated justification is incomplete. The justification records both the criteria that informed any recommendation *and* the human's actual decision at the Framework Decision Gate (§31) — never a recommendation alone, presented as if it were the decision.

# 8. SHAFT Engine Support

**SHAFT Engine is a first-class automation framework for this skill — not a fallback, and not treated as a lesser-supported option.**

When SHAFT Engine is selected (per §6–§7), this skill must generate automation that follows SHAFT Engine best practices, and the generated project should align with the standard SHAFT architecture, including appropriate use of:

- `DriverFactory`
- Page Object Model
- TestNG
- Allure Reporting
- SHAFT configuration
- Reusable utilities
- Data-driven testing when applicable
- Shared test infrastructure

**This skill must avoid generating generic Selenium code when SHAFT Engine is selected.** SHAFT Engine wraps and extends Selenium/Appium/REST Assured with its own conventions and utilities; falling back to raw, unwrapped Selenium calls when SHAFT is the selected framework is a specification violation, not a harmless simplification.

# 9. Existing Framework Analysis

Before generating any new automation, this skill inspects the project's one existing Automation Package for the resolved framework (per §4's "Existing Automation Package(s)" input and the project's `AutomationPackages.md` registry, §19/§31) — and, if the project uses more than one framework, each of those frameworks' own one project independently. As of §33.2, "an existing Automation Package" means the **Workspace Automation Baseline**, copied wholesale into this run's own working copy at Working Copy Creation (`workflows_and_pipelines/pipeline/pipeline.md` §12.3) — never a prior run's folder inspected in place, and never a location this skill reads from without first having copied it in. For each package found, it detects:

- Existing Test Scripts
- Existing Page Objects
- Existing Components
- Existing Utilities
- Existing Fixtures
- Existing Test Data
- Existing Helpers
- Existing Folder Structure
- Existing Naming Conventions
- Existing Reporting Solution
- Existing Build Tool

**Reuse before generating.** The output of this analysis feeds directly into the Automation Plan's "Existing Assets" field (§5) and into the Automation Knowledge Base search performed before every individual generation decision (§11).

If no existing automation project exists, this section's analysis is trivially empty, and the Automation Plan records that explicitly ("no existing automation project found — greenfield generation") rather than silently skipping the step.

# 10. Suite Planning Engine

This skill analyzes all approved test cases and groups them into logical automation suites. **Grouping must follow business workflows, not individual pages.**

Examples of business-workflow-organized suites:

- Login Suite
- Employee Suite
- Leave Suite
- Recruitment Suite

A suite organized around a single page (e.g., a suite that is just "Employee List Page tests," disconnected from the Add Employee / Employee Detail tests that form the same business workflow) is the wrong shape and must not be produced — the workflow, not the screen, is the organizing unit.

Each suite should contain:

- Shared Setup
- Shared Teardown
- Shared Fixtures
- Shared Components
- Shared Utilities
- Shared Test Data

The resulting suite structure is recorded in the Automation Plan (§5, "Planned Automation Suites") and, after generation, in the Automation Suite Manifest (§16).

# 11. Automation Knowledge Base

**Distinct from the Automation Repair Knowledge Base (`.claude/skills/automation-execution-skill/SKILL.md` §28)** — that one stores execution-confirmed *repair patterns*, per the two-layer Knowledge Architecture (`workflows_and_pipelines/pipeline/pipeline.md` §10): project-scoped by default at `platform_core_data/knowledge_base/repair/`, generalized into `platform_core_data/knowledge_base/patterns/repair_patterns/`/`platform_core_data/knowledge_base/patterns/reasoning/` only via explicit Promotion (§10.5); this section is about reusable *code assets* within one project's own package. Before writing any new automation, also consult both Repair Knowledge Base layers — Platform first, then this project's own — for rules relevant to the flows being automated (e.g., a Login suite checks for any rule tagged "Authentication flows") and apply a matching rule's approach proactively — this closes the loop so a pattern the platform already learned the hard way, via a prior execution's repair, doesn't have to be rediscovered by failing again first.

This skill treats the existing automation project (§9) as a reusable knowledge base, not merely a folder to avoid clobbering. Before creating anything new, it searches for reusable:

- Page Objects
- Components
- Utilities
- Fixtures
- Helpers
- Test Data
- Common Workflows

**Never generate a duplicate reusable asset.** If a page object, utility, or fixture already exists that covers (or can be reasonably extended to cover) a new need, this skill reuses or extends it — it does not author a second, parallel version. Where reuse requires extending an existing asset, that extension is itself planned and recorded (Automation Plan §5, Automation Decision Report §13) rather than performed as an undocumented side effect.

# 12. Traceability

The Automation skill maintains the pipeline's full traceability chain, extended one level further than the Test Design skill's own four-dimension model:

```
Requirement
  ↓
Discovery
  ↓
Finding
  ↓
Evidence
  ↓
Manual Test Case
  ↓
Automation Script
```

Concretely: every Automation Script cites the Test Case ID it automates (1:1). Through that Test Case ID, it inherits — and must not re-derive or alter — the Requirement Reference, Discovery Reference, Finding Reference, and Evidence Reference already established on that test case by the Test Design skill (`.claude/skills/test-design-skill/SKILL.md` §5). This skill's job is to carry that chain forward into the generated code (e.g., as a header comment or metadata block on the script) and into the Automation Decision Report (§13) — never to re-investigate or reinterpret what those references mean.

A gap anywhere in this chain (an Automation Script that cannot cite its Test Case ID, or a Test Case ID that cannot be found in the Traceability Matrix) is itself a defect and must be reported, not silently generated around.

# 13. Automation Decision Engine

**Every test case named in the Automation Candidate Package must receive exactly one automation decision.** No candidate test case is left undecided. A test case absent from the Automation Candidate Package (never executed manually, or executed but not confirmed successful/stable) receives no automation decision this run — its status is tracked by the Manual Execution skill, not re-litigated here.

Possible decisions:

| Decision | Meaning |
|---|---|
| **Reuse Existing Automation** | An existing automation asset (script, page object composition) already covers this test case, as-is or via straightforward composition — no new code is generated for it, beyond wiring it into the appropriate suite. |
| **Generate New Automation** | No suitable existing automation covers this test case; new code is authored, following §14's code-generation standards and, where a Finding Reference is populated, §12's traceability inheritance. |
| **Partially Automatable** | Part of the test case's steps/assertions can be automated reliably; the remainder cannot (e.g., a visual-judgment assertion, a step requiring a manual/offline confirmation). The automatable portion is generated; the non-automatable remainder is explicitly called out, not silently dropped. |
| **Manual Only** | The test case cannot be automated at all with acceptable reliability or safety (e.g., it depends entirely on subjective visual judgment, or it is still an assumption-based test pending verification, or its expected behavior is underspecified in a way that would require inventing business logic to codify). No code is generated for it. |

Each decision must include:

- **Decision** — exactly one of the four above
- **Justification** — why this decision was reached, referencing the specific test case content, existing assets, or specification gap involved
- **Reused Assets** — which existing assets (if any) this decision relies on
- **Generated Assets** — which new assets (if any) this decision produces
- **Automation Readiness** — whether the resulting automation (full or partial) is ready to hand to the Automation Execution skill, or blocked pending something else (e.g., a missing test data fixture)
- **Known Limitations** — anything a future reader should know about this specific automation's reliability, scope, or edge cases it does not cover

This per-test-case record is what becomes the Automation Decision Report (§16).

# 14. Code Generation Standards

This skill generates only maintainable automation. Generated code must be:

- **Modular** — organized into composable units (page objects, fixtures, utilities), not monolithic scripts
- **DRY** — no duplicated logic where a shared utility or fixture already exists or should be created
- **Readable** — clear naming, consistent formatting, and structure a new team member could follow without this skill's own reasoning attached
- **Reusable** — authored so a later suite or test case can compose with it, not so narrowly written that it can only ever serve the one test case that first needed it
- **Maintainable** — resilient to minor UI/application changes (e.g., accessibility-based selectors — roles, labels, text — in preference to brittle CSS/XPath, per v1's carried-forward rule)
- **Versionable** — plain-text, diff-friendly source files suitable for version control, with no generated binary artifacts checked in where a text representation would do

**Prefer composition over duplication** — when a new test case's needs overlap substantially with an existing asset, compose around/extend that asset rather than copying its logic into a new one (§11).

## 14.1 Additional Named Standards

The general standards above (Modular/DRY/Readable/Reusable/Maintainable/Versionable) are made concrete through the following, applied at generation time — not only checked retroactively in Self Review (§15):

| Standard | What it requires |
|---|---|
| **Page Object Model / Component Objects** | Screens are represented as Page Objects; a UI element or behavior reused *across* multiple pages (e.g., a shared header, a shared date picker) is factored into its own Component Object rather than duplicated inside each Page Object that uses it. |
| **Reusable Actions** | A multi-step user action performed by more than one test case (e.g., "log in," "add an employee") is a named, reusable action/method — never re-authored inline per test. |
| **Reusable Assertions** | A verification performed by more than one test case (e.g., "assert the generic error banner is shown") is a named, reusable assertion helper — never re-authored inline per test. |
| **Test Data Separation** | Test data lives in dedicated fixtures/data files (§10's "Shared Test Data"), never hardcoded inline inside a test body. |
| **Configuration Management** | Environment-specific values (URLs, timeouts, feature-flag states) live in configuration files/environment variables, never hardcoded into test logic. |
| **Environment Awareness** | Generated automation reads its target environment from configuration (per Configuration Management above) rather than assuming a single hardcoded environment — the same suite must be able to target a different environment by configuration change alone, not a code edit. |
| **Parameterization** | Where a test case's Test Data (§6 of `.claude/skills/test-design-skill/SKILL.md`) implies data-driven variants (e.g., multiple boundary values), this skill generates a parameterized test rather than one copy-pasted test per data value. |
| **Naming Conventions** | Files, test names, and reusable assets follow one consistent convention throughout the generated project — matching the existing convention detected in §9 if an existing project is present, or a clearly stated new convention if greenfield. This is a generation-time standard here; §15's naming-consistency check verifies it was actually followed. |

Carried forward from v1, still in force:
- Every automated test maps 1:1 to a Test Case ID (§12), stated in the test name or an adjacent, unambiguous comment/metadata block.
- Every automated test is independent and idempotent — safe to re-run without manual cleanup — or uses explicit setup/teardown (§10's "Shared Setup"/"Shared Teardown") to guarantee that.

# 15. Self Review

**Before completing generation, this skill reviews the automation it just produced.** This is not optional and is not the same step as generation itself — it is a distinct, subsequent pass over the finished output.

This skill validates:

- Naming consistency (across the newly generated code and, where applicable, against existing conventions detected in §9)
- Duplicate code (any logic that should have been a shared utility/fixture but wasn't)
- Broken references (a script citing a Test Case ID, page object, or fixture that doesn't actually exist)
- Missing reusable assets (a need that should have produced a shared asset but instead produced one-off, non-reusable code)
- Missing page objects (a screen/component interacted with directly instead of through a page object)
- Missing utilities (repeated inline logic that should have been extracted)
- Missing test data (a hardcoded value that should have come from a shared test-data fixture)
- **Architecture** — the generated project actually matches the Project Architecture and Design Pattern stated in the Automation Plan (§5); a deviation discovered here is corrected or explicitly justified, never left silently inconsistent with the plan.
- **Compilation/syntax readiness** — the generated code is syntactically valid and, where a lint/type-check/compile tool is available (§17), passes it; a failure here is a defect this skill must fix before declaring generation complete, not a note left for the Automation Execution skill to discover.
- **Framework compliance** — the generated code actually follows the selected framework's conventions (e.g., SHAFT Engine's DriverFactory/Page Object Model/TestNG/Allure per §8, not generic unwrapped Selenium) — a compliance gap here is exactly the "specification violation" §8 already names, caught before handoff rather than after.
- **Traceability** — every generated script's Test Case ID, and the Requirement/Discovery/Finding/Evidence References it inherited (§12), are actually present and resolvable — distinct from "broken references" above, which checks internal code references (page objects/fixtures); this checks the external traceability chain specifically.

**This skill generates recommendations whenever improvements are identified** — it does not silently fix everything it finds without recording what it found and why, and it does not silently ship known rough edges without disclosing them. Self Review findings are recorded in the Automation Manifest (§16).

# 16. Outputs

The Automation skill generates only the following:

1. **Automation Plan** — the complete plan from §5, written before any code generation
2. **Automation Package** — the actual generated/reused automation project: scripts, page objects, fixtures, utilities, configuration, and any other source artifacts needed to run the suite, organized per the Suite Planning Engine (§10) and the selected framework's conventions (§6–§8)
3. **Automation Manifest** — a structured inventory of the Automation Package: every file it contains, which were generated versus reused, and the Self Review (§15) findings and recommendations
4. **Automation Decision Report** — the per-test-case record from the Automation Decision Engine (§13): Decision, Justification, Reused Assets, Generated Assets, Automation Readiness, Known Limitations, for every test case named in the Automation Candidate Package
5. **Automation Coverage Report** — the aggregate view: how many test cases received each of the four decisions, an automation coverage percentage, and named reasons for every Partially Automatable / Manual Only case
6. **Automation Suite Manifest** — the realized suite structure from the Suite Planning Engine (§10): which suites exist, which test cases and automation assets belong to each, and each suite's shared setup/teardown/fixtures/components/utilities/test data
7. **Automation Summary** — a single consolidated handoff document, structured per the Standard Output Contract (§25): Automation Summary, Generated Files, Framework Used, Coverage, Automation Decisions, Known Limitations, Execution Instructions, and Inputs for Automation Execution skill. This is the artifact `.claude/skills/automation-execution-skill/SKILL.md` §4 and `workflows_and_pipelines/pipeline/pipeline.md` §4 Stage 5 already name as required (`AutomationSummary.md`) but which v2's six-artifact split never actually produced — see the v3 revision note above. It does not replace the other five artifacts; it is a consolidated pointer/summary over them, for a consumer that needs one file rather than six.

No other artifact is produced by this skill. It does not execute the Automation Package, and it does not produce execution results, logs, or screenshots — those belong to the Automation Execution skill (Stage 6).

# 17. Allowed Tools

- File tools: Read (Project Context, Manual Test Suite, Traceability Matrix, Coverage Report, Discovery Artifacts, Findings, Evidence Packages, and the existing automation project's source files for reuse analysis), Write/Edit (Automation Plan, Automation Package source files, Automation Manifest, Automation Decision Report, Automation Coverage Report, Automation Suite Manifest)
- Code-authoring/lint/type-check tools (e.g., Bash for installing dependencies and running static checks only — never for running the suite against a live environment)
- **Browser tools for selector verification only** — either the Browser Driver (`platform_core/tools/browser_driver/`) or the **`playwright` MCP server** (`browser_navigate`, `browser_snapshot`, `browser_find`, `browser_click`, `browser_evaluate` read-only), selected per the Mode Selection Rule in `platform_core/tools/mcp/README.md` §1.2. Strictly for verifying a selector or reading an accessibility tree against the live/staging environment during generation, if available — **never** for executing the generated suite. A credential value is never typed into an MCP tool call (`mcp/README.md` §1.3): authenticate via `BrowserDriver.authenticate()` and use MCP only on the already-authenticated session.
- **`context7` MCP server** (`resolve-library-id`, `query-docs`) for the mandatory Stack Documentation step (§34) — version-accurate documentation for this project's own stack, used as a generation guideline. Never a source of business logic, requirements, or coverage justification.

**Not permitted:** modifying the PRD, Project Context, or any approved upstream artifact (Automation Candidate Package, Manual Execution Summary, Manual Test Suite, Traceability Matrix, Coverage Report, Discovery Artifacts, Findings, Evidence Packages); executing the generated Automation Package against any environment; automating any scenario not named in the Automation Candidate Package; inventing business logic to fill a specification gap; overwriting an existing reusable asset without explicit approval.

# 18. Execution Rules

1. Must consume only artifacts that are themselves `Approved` at their own pipeline checkpoint (§4) — must halt and report if any required input is `Pending Review`, `Pending Automation Approval`, or `Rejected`.
2. **Must never read the PRD directly.** Only Stage 1 may do so (`workflows_and_pipelines/pipeline/pipeline.md` §6 Rule 4).
3. **Must complete the Automation Plan (§5) before generating any code.** No script, page object, or configuration file is written first.
4. **Must never assume a target framework.** Detect it from the Project Context (§6) and, where not explicitly specified, select it transparently against the stated criteria (§7), always with a recorded justification in the Automation Plan.
5. **Must reuse an existing automation framework already in the project rather than introducing a new one**, and must use whatever framework the Project Context explicitly specifies, without exception.
6. **Must treat SHAFT Engine as a first-class framework** (§8) and must never generate generic, unwrapped Selenium code when SHAFT Engine is the selected framework.
7. **Must inspect any existing automation project (§9) before generating anything new**, and must record that inspection's findings (or their absence) in the Automation Plan.
8. **Must search the Automation Knowledge Base (§11) before creating any reusable asset**, and must never generate a duplicate of an asset that already exists or can be reasonably extended.
9. **Must organize automation into suites by business workflow, never by individual page** (§10).
10. **Must assign every manual test case exactly one Automation Decision** (§13) with full justification — no test case is left undecided.
11. Must automate only test cases named in the Automation Candidate Package, using their content exactly as explicitly defined in the Approved Manual Test Suite — no new scenarios invented, and no test case outside the Candidate Package attempted.
12. Must respect every business rule and safety constraint stated in the Project Context, even when a test case's steps do not restate them.
13. Must report, by Test Case ID and reason, any test case that receives `Partially Automatable` or `Manual Only` — never silently drop a test case and never force an unsafe workaround to force full automation.
14. **Must never invent missing business logic** to make an underspecified scenario automatable — the correct decision in that case is `Partially Automatable` or `Manual Only`, not a guess.
15. **Must never modify an approved manual test case.** A test case that needs to change is escalated as a discrepancy for Stage 3 to address, never silently rewritten by this skill.
16. **Must never overwrite an existing reusable asset without explicit approval** — extend, compose around, or flag the conflict instead.
17. **Must generate only maintainable code** per the standards in §14 — modular, DRY, readable, reusable, maintainable, versionable, composition-preferred.
18. **Must perform Self Review (§15) before declaring generation complete**, and must record findings/recommendations in the Automation Manifest even when no issues are found (state that explicitly, rather than omitting the section).
19. **Must maintain the full traceability chain** (§12) on every generated asset — every Automation Script cites its Test Case ID and inherits that test case's Requirement/Discovery/Finding/Evidence References without alteration.
20. Every automated test must be independent and idempotent, or use explicit setup/teardown to guarantee that.
21. **Must never execute the generated Automation Package.** Execution is exclusively the Automation Execution skill's responsibility (Stage 6) — this skill's task is complete the moment the Automation Package and its accompanying reports (§16) are generated.
22. **Must never assume Playwright, or any other single framework, as a default** (§6) — a framework is selected only via the §7 precedence rules, never because it happens to appear first in an example.
23. **Must apply the Locator Strategy's priority order** (§24) and record a fallback/recovery recommendation wherever the top-priority locator type is not viable for a given element.
24. **Must select the Automation Strategy matching this run's Run Scope Type** (§23) — never apply one default breadth/depth regardless of scope.
25. **Must produce the Automation Summary** (§16, §25) as a required output, structured per the Standard Output Contract — never omit it as redundant with the other five artifacts.
26. **Must recognize the named Stop Conditions** (§26) and, for any Local condition, continue generating automation for every other unblocked test case rather than halting the run — and must state the smallest missing prerequisite for every blocked item (§27), never a bare "cannot proceed."
27. **Must verify Handoff completeness** (§28) before treating a run's Automation outputs as finished — every input `.claude/skills/automation-execution-skill/SKILL.md` §4 declares it needs must be present and unambiguous.
28. **Must never begin this stage until the Automation Start Decision Gate (§30, `workflows_and_pipelines/pipeline/pipeline.md` §5.4) has been explicitly answered by a human** — a request for "automation" is never, by itself, authorization to also silently run, resume, or skip Stages 1–4.
29. **Must complete the Framework Decision Gate (§31) before writing the Automation Plan or any code** — must read the project's full Automation Package registry and summarize every existing framework's project (a project holds exactly one per framework, never assume otherwise), then ask (never infer) whether to extend the existing one, start a project for a framework that doesn't have one yet, or reset one from scratch, and which framework for a new one. Criteria-based analysis (§7) may only be offered as a labeled recommendation inside that question, never substituted for asking it. Must ask this every Stage 5 run, never treat a prior run's answer as a standing default.
30. **Must never treat the tool used for Stage 2 Browser Automation as evidence for the Stage 5 framework choice** (§6, §31.3) — discovery technology and automation technology are independent decisions, even when the same tool (e.g., Playwright) is technically capable of both roles.
31. **Must update `AutomationPackages.md` (§19) at the end of every run** that extends a framework's project or adds a new framework — a new framework's project added, the existing one's "last touched" run updated, or (on Reset) the reset noted — so the next run's registry summary (§31.1) is accurate.
32. **Must detect a registered Reference Automation Project (§32) at the start of every run** and ask the Automation Target Decision Gate (§32.3) — never silently assume "inside the platform" just because a Reference Project wasn't mentioned in the current request.
33. **Must never modify a Reference Automation Project's files** unless the human explicitly chose "Update the Reference Project directly" for *this* run (§32.2) — a prior run's choice is never carried forward as a default.
34. **Must ask the Automation Strategy Decision Gate (§33) every run**, independently of the Target (§32.3) and Framework (§31) answers — never infer extend/new-framework/reset from either of those.
35. **Must never generate or edit code directly inside a Workspace Automation Baseline** (§33.2, `workflows_and_pipelines/pipeline/pipeline.md` §12.1) — all generation happens in this run's own working copy, created via Working Copy Creation (§33.2); the baseline is only ever written by the Workspace Merge, after this run's automation clears Automation Approval.
36. **Must never decide any repository-structure question autonomously** (§31.6) — Automation Project/package/framework selection, new-package creation, merge destination, and repository structure always follow gather → analyze → recommend → wait for explicit approval, never a default or inferred decision.

# 19. Expected Artifacts

**(v8) Every path below is per-framework, not project-singular** — `{Framework}` is the human's Framework Decision Gate (§31) answer (e.g. `SHAFT`, `Playwright`), so a project can accumulate a complete, independent artifact set per framework it uses, without one framework's project overwriting another's. Within one framework, there is exactly one such artifact set — never several competing ones.

| Artifact | Path |
|---|---|
| Automation Package Registry | `platform_core_data/workspace/automation/AutomationPackages.md` — the one project-level (not per-package) index: every package that exists, its framework, its location, which run/checkpoint last touched it, and — per `workflows_and_pipelines/pipeline/pipeline.md` §12.7 — its **Baseline Ref** (the Workspace Automation Baseline's path-scoped git commit hash as of the last successful Workspace Merge) and **Last Merged Run** (which run's automation was most recently merged in). This skill reads it at the start of every run (§31.1) and updates it at the end of every run that adds or continues a package. |
| Automation Plan | `platform_core_data/workspace/automation/AutomationPlan_{Framework}.md` |
| Automation Package (Workspace Automation Baseline) | `platform_core_data/workspace/automation/tests_{Framework}/` — per `pipeline.md` §12.1, this is the authoritative, persistent copy; this skill never writes here directly (§33.2, Execution Rule 35) |
| Automation Manifest | `platform_core_data/workspace/automation/AutomationManifest_{Framework}.md` |
| Automation Decision Report | `platform_core_data/workspace/automation/AutomationDecisionReport_{Framework}.md` |
| Automation Coverage Report | `platform_core_data/workspace/automation/AutomationCoverageReport_{Framework}.md` |
| Stack Documentation Context (§34) | `platform_core_data/workspace/automation/StackDocumentationContext_{Framework}.md` |
| Automation Suite Manifest | `platform_core_data/workspace/automation/AutomationSuiteManifest_{Framework}.md` |
| Automation Summary | `platform_core_data/workspace/automation/AutomationSummary_{Framework}.md` |

**Where this skill actually generates** (v7 — see `pipeline.md` §12): a run-scoped working copy at `platform_core_data/runs/{{RUN_FOLDER}}/automation/tests_{Framework}/` (the run folder name itself is generated by `platform_core/tools/run_manager`, never hand-formatted here; see `workflows_and_pipelines/pipeline/run_manager.md` §5), created via Working Copy Creation (§33.2). This working copy is temporary — once its automation clears Automation Approval (`pipeline.md` §5.2), the Workspace Merge (`pipeline.md` §12.4) promotes its content into the flat, project-level Automation Package path above, and Cleanup (`pipeline.md` §12.5) removes the merged source from the run, leaving only its permanent reports (this table's other rows, plus `automation_promotion.md`) and, after Stage 6, its Execution Results and evidence.

# 20. Operational Contract

Role: automation engineering (Stage 5 of 7).

Turn the execution-confirmed Automation Candidate Package into a reviewable automation package. Execution is fully specified above — §4 (Inputs, all of which must be Approved), §5 (Automation Planning Engine — the plan is written in full before any code), §6–§7 (Framework Detection and Selection), §8 (SHAFT Engine Support), §9 (Existing Framework Analysis), §10 (Suite Planning Engine), §11 (Automation Knowledge Base), §12 (Traceability), §13 (Automation Decision Engine), §14 (Code Generation Standards), §15 (Self Review), §16 (Outputs), §18 (Execution Rules), §19 (Artifacts), §34 (Stack Documentation Step — mandatory before any code generation), §23 (Strategy by Run Scope), §24 (Locator Strategy), §25 (Standard Output Contract), §26–§27 (Stop Conditions and Recovery), §28 (Handoff Contract), and the human decision gates in §30–§33. This section adds no rules of its own; the contract is stated once above rather than restated here.

# 21. Example Execution

*Illustrative only — not executed as part of this task.*

```text
Input:
  platform_core_data/workspace/context/ProjectContext.md          (Approved)
  platform_core_data/workspace/test_design/TestCases_Login.md/.xlsx (Approved)
  platform_core_data/workspace/test_design/TraceabilityMatrix.md    (Approved)
  platform_core_data/workspace/test_design/CoverageReport.md        (Approved)
  platform_core_data/workspace/discovery/*.md                                (Approved)
  platform_core_data/workspace/discovery/findings/Findings_Summary.md, FINDING-001..004 (Approved)
  Existing automation project: none found
```

Hypothetical result: the Automation Plan detects no existing automation project and no framework explicitly named in the Project Context, so it selects **Playwright + TypeScript** against the selection criteria (Web application, no existing framework to reuse, no team-standard override stated), justified in the plan. Suite Planning produces a single **Login Suite** (matching this run's Login-only scope) with shared setup (navigate + clear session) and shared test data (the known valid/invalid credential sets already evidenced in Discovery). Automation Decisions: `TC-LOGIN-001` (valid login) → Generate New Automation; `TC-LOGIN-004` (Forgot Password must not time out, Finding Reference `FINDING-003`) → Generate New Automation, inheriting `FINDING-003`'s Requirement/Discovery/Evidence References onto the script, with Expected Result asserting the *corrected* behavior; the exploratory test derived from `FINDING-004` → Manual Only, Justification: "response-time-parity acceptability is a pending policy decision, not something this skill can assert pass/fail on." Self Review finds no duplicate code (single suite, first run) but recommends extracting the shared credential test-data fixture proactively for the next module's suite. The Automation Coverage Report shows, say, `5/6 test cases automated (83%), 1 Manual Only`.

*(If SHAFT Engine had instead been the selected or existing framework, the same Login Suite would be generated using DriverFactory-based session setup, Page Object Model classes for the Login and Forgot Password screens, TestNG test classes, and Allure annotations for reporting — never as raw Selenium calls.)*

# 22. Architecture Principle

> Agents communicate through artifacts only. Each has a single responsibility. Every output becomes the input of another whenever applicable.

For this skill specifically: it is responsible for producing a **production-ready automation project**, not merely isolated automation scripts — planning, framework justification, reuse, suite organization, per-test-case decisions, and self review are all part of that responsibility, not optional extras. **Execution belongs exclusively to the Automation Execution skill.** This skill's outputs — the Automation Package, Plan, Manifest, Decision Report, Coverage Report, Suite Manifest, and Automation Summary — become the Automation Execution skill's sole input in the next stage.

# 23. Automation Strategy by Run Scope

Automation breadth and priority follow the run's Run Scope Type (`workflows_and_pipelines/pipeline/run_scope.md` §3) and Run Type (§5), stated in the Project Context's Scope Summary and named explicitly in this skill's Run Scope input (§4) — not one default approach regardless of what this run covers:

| Run Scope Type / Run Type | Strategy |
|---|---|
| **Entire Project** | Full breadth: every approved test case in scope receives an Automation Decision (§13); suites are planned across the full module set (§10). |
| **Feature** | A single, complete suite for the one feature's approved test cases, with deeper reuse-search (§11) since the surface is narrow enough to fully index existing assets before generating. |
| **User Story** | Narrowest: automate only the test cases traceable to that story's acceptance criteria (`.claude/skills/test-design-skill/SKILL.md` §5.4); do not opportunistically extend the suite to cover adjacent, unrelated test cases just because they share a suite file. |
| **Bug** | Prioritize the regression test case(s) tied to the specific Finding (§12, §13's "Regression test" disposition) — these are generated first and are never deprioritized behind unrelated new coverage in the same run. |
| **Full Regression** (Run Type) | Prioritizes reusing and re-validating existing automation for already-covered requirements (§9, §11) over generating wide net-new scripts. |
| **Smoke** (Run Type) | Automate only P1/critical-path test cases; everything else is deliberately `Manual Only` for this pass and stated as such, not silently under-generated. |
| **API** | Suite Planning (§10) still organizes by business workflow, not by endpoint — an API-only run groups related endpoint calls into the same workflow-shaped suite a UI run would use, per §29. |
| **UI** | Baseline behavior, unchanged from the rest of this specification. |
| **Mixed** (UI + API in the same run) | Suites may combine UI and API steps within one business-workflow suite where the Manual Test Suite's own Steps do (e.g., a UI action followed by an API assertion) — the organizing unit is still the workflow, never the transport type. |

If the Project Context does not state an explicit Run Scope Type, this skill defaults to the **Entire Project** strategy and states that default explicitly in the Automation Plan (§5).

# 24. Locator Strategy

Generated automation must use a deliberate, prioritized approach to identifying elements — never a single brittle strategy applied uniformly.

## 24.1 Priority Order

1. **Accessibility-based locators** — role, label, accessible name, or visible text (e.g., Playwright's `getByRole`/`getByLabel`/`getByText`, or the equivalent construct in the selected framework). Preferred: resilient to styling/DOM-structure changes, and doubles as an accessibility signal.
2. **Stable data attributes** — a dedicated test-id attribute (e.g., `data-testid`) where the application exposes one. Preferred when accessibility-based locators are ambiguous or unavailable for a given element.
3. **Structural/semantic selectors** — a stable, unique CSS selector based on semantic structure (e.g., a form's labeled input), used only when neither of the above is viable.
4. **XPath/brittle CSS position-based selectors** — last resort only, and always flagged in the Automation Decision Report (§13) or Self Review (§15) as a known fragility risk, never used silently as if it were a first-choice locator.

## 24.2 Fallback and Recovery

- Where the top-priority locator type is not viable for a specific element (e.g., no accessible role/label exists and no test-id is present), this skill falls back down the priority order and **records which level it had to fall back to and why**, in the relevant Automation Decision's Known Limitations field (§13).
- This skill never silently settles for a Level 4 (brittle) locator without recording the recommendation to add a stable `data-testid` or accessible label to that element — this recommendation belongs in the Automation Manifest's Self Review section (§15) or the Automation Decision Report (§13), so a human can act on it even though this skill cannot modify application code itself.
- A locator that cannot be made reliable at any priority level (e.g., a dynamically regenerated, non-deterministic identifier) is a `Partially Automatable` or `Manual Only` signal for that portion of the test case (§13) — this skill does not force a flaky locator into passing automation just to claim full coverage.

# 25. Standard Output Contract

The Automation Summary (§16 Outputs #7) must contain exactly these sections, in this order, so the Automation Execution skill (and any future consumer) never has to interpret free-form prose to extract what it needs:

| # | Section | Must contain, at minimum |
|---|---|---|
| 1 | **Automation Summary** | One-paragraph narrative: Run Scope (§23), framework used, and overall automation outcome |
| 2 | **Generated Files** | A file-level listing of what was generated versus reused this run (consolidating the Automation Manifest, §16 #3) |
| 3 | **Framework Used** | The selected framework (§6–§8) and its justification, restated from the Automation Plan (§5) for a reader who doesn't want to open a second document |
| 4 | **Coverage** | The Automation Coverage Report's (§16 #5) headline figures — decision counts and percentage |
| 5 | **Automation Decisions** | A reference to the full Automation Decision Report (§16 #4); this section itself lists only counts per decision type, not every individual case |
| 6 | **Known Limitations** | Every locator fallback (§24.2), every Partially Automatable/Manual Only reason, and any Self Review (§15) finding not yet resolved |
| 7 | **Execution Instructions** | How to actually run the generated suite — command(s), required environment variables/config, and any prerequisite setup (e.g., `npm install && npx playwright test`, or the SHAFT/TestNG equivalent) |
| 8 | **Inputs for Automation Execution skill** | The explicit handoff package per §28 — confirmation that every input `.claude/skills/automation-execution-skill/SKILL.md` §4 declares it needs is present |

This does not replace the other five artifacts (§16 #1–#6) — it is a consolidated pointer/summary over them, and it is also the artifact that closes the pre-existing `_AutomationSummary.md` naming gap described in the v3 revision note.

# 26. Stop Conditions

This skill recognizes the following named conditions. Recognizing one is never, by itself, a reason to halt the entire run — see §27 for the required minimal-prerequisite recommendation before any blocked test case is left unresolved.

| Condition | Scope | Required Action |
|---|---|---|
| **Missing framework** (no Project Context statement, no existing automation project to infer from) | Global | Halt and report per §6's existing rule — there is no basis to select or justify a framework. |
| **Missing manual tests** (Automation Candidate Package or Manual Test Suite not `Approved`, or empty) | Global | Halt and report the blocking artifact (Execution Rule 1) — never generate against a draft or empty suite. |
| **Unsupported technology** (the Project Context describes an application type/stack no available framework can drive, and no existing automation project covers it either) | Global, or Local to the affected test cases if only part of the suite is affected | Report the gap explicitly; do not force-fit an unsuitable framework. Where only some test cases are affected, those specific cases become `Manual Only` (§13) while the rest of the run proceeds. |
| **Incomplete requirements** (a test case's Steps/Expected Result are too vague to generate deterministic automation without inventing logic) | Local — that test case only | Per the existing §13/Execution Rule 14 rule: `Partially Automatable` or `Manual Only`, never a guess. |
| **Missing selectors** (no stable locator exists at any priority level, §24) | Local — that test case/step only | Per §24.2: record the fallback attempted and the recommendation to add a stable locator; mark the affected portion `Partially Automatable` or `Manual Only`. |
| **Conflicting configuration** (e.g., the Project Context and an existing automation project's own config disagree on target environment or credentials) | Global | Do not silently prefer one source. Report the conflict and recommend which one needs reconciling (typically: the Project Context governs, per its role in §4, and the existing project's config is flagged for update) — never proceed on an assumed resolution. |

# 27. Recovery Strategy — Minimal Prerequisite Recommendation

Like the Test Design skill (`.claude/skills/test-design-skill/SKILL.md` §20), this skill has no alternate generation mechanism to fall back to — its recovery behavior is: **never let one blocked test case stop the whole run, and always name the smallest thing that would unblock it.**

1. When a Local Stop Condition (§26) blocks a specific test case, this skill continues processing every *other*, unblocked test case in the Automation Candidate Package — a single blocked case is never a reason to produce zero output for the run.
2. For the blocked case, this skill states the **smallest missing prerequisite** that would resolve it — never a vague "cannot automate." Examples: *"Add a `data-testid` to the Airlines multi-select dropdown"*, not *"selectors unreliable"*; *"Confirm the maximum airline-selection count with the DBA (T3087 Prerequisites)"*, not *"requirements incomplete."*
3. For a Global Stop Condition (§26), this skill still states the minimal prerequisite (e.g., *"Awaiting Test Design skill re-run — Coverage Report for RUN-20260710-001 is still Pending Review"*) rather than a bare halt message.
4. The recommended prerequisite is recorded in the Automation Plan's "Blocked Tests" field (§5) and in the Automation Summary's Known Limitations section (§25) — never only in a narrative aside a reviewer could miss.

# 28. Handoff Contract with the Automation Execution skill

The Automation skill's outputs are consumed by the Automation Execution skill as declared inputs in `.claude/skills/automation-execution-skill/SKILL.md` §4. Before concluding a run, this skill verifies each of the following is actually present and unambiguous — not merely assumed:

| Automation Execution skill needs (`.claude/skills/automation-execution-skill/SKILL.md` §4) | Satisfied by (this skill's output) |
|---|---|
| Automation Suite (`tests/`) | §16 Outputs #2, the Automation Package itself |
| Automation Coverage Summary (`AutomationSummary.md`) | §16 Outputs #7, the Automation Summary (§25) — this is the exact filename gap the v3 revision note identifies and closes |
| Project Context (environment, credentials, safety constraints) | Unchanged pass-through — this skill does not modify it; Automation Execution reads the same Approved version directly |
| Execution Mode | Not this skill's concern — `.claude/skills/automation-execution-skill/SKILL.md` §5.1 sources it from the Run Configuration or asks the user directly; this skill must not pre-select or assume one on Automation Execution's behalf |
| Execution scope | Not this skill's concern — an Automation Execution-time parameter, not something generated here |

**A run is not complete until every row above is verifiably satisfied.** Prior to this revision, the second row was a standing, unverified gap — the Automation Execution skill's own spec named a file this skill's spec never produced. §16/§25 close it; this table exists so the same category of drift is checked explicitly on every future revision of either skill, not just fixed once here.

# 29. Future Scalability

The abstractions this revision relies on — Framework Detection/Selection (§6–§8) already agnostic about *which* framework, Locator Strategy (§24) already framed as "element identification priority" rather than "CSS selector," and Suite Planning (§10) already organized by business workflow rather than by page — extend to non-web-UI systems with, at most, a new framework entry and a new locator-equivalent concept, never a change to the Traceability Model (§12), Automation Decision Engine (§13), Standard Output Contract (§25), or Handoff Contract (§28):

| Future system shape | How it fits today's model |
|---|---|
| **Web** (current) | Baseline — Playwright/Selenium/Cypress-class frameworks, DOM-based locators. |
| **API** | REST Assured/Postman (already listed, §6) as framework; "locators" become endpoint/field-path identification (request path, JSON field name) — same priority-order concept (stable named field over positional array index), same fallback/recovery recording. |
| **Mobile** | Appium (already listed, §6) as framework; locators become accessibility-ID/label-based (the mobile-equivalent Level 1 in §24.1) over coordinate-based taps (the mobile-equivalent Level 4). |
| **Desktop** | A desktop-automation framework (e.g., WinAppDriver-class tooling) slots into §6's extensible framework list the same way SHAFT/Appium already do. |
| **Microservices** | Suite Planning (§10) groups by business workflow across services, exactly as it already groups UI test cases across pages — a workflow spanning three services is still one suite, not three. |
| **Message Queues** | "Steps" become publish/consume actions; Test Data Separation (§14.1) already covers externalizing message payloads into fixtures. |
| **Batch Jobs** | "Steps" become job-trigger actions; Environment Awareness (§14.1) already covers running the same automation against different job environments via configuration. |
| **Cloud Resources** | Framework Detection (§6) extends to a cloud-provider SDK/CLI as the "framework"; Configuration Management (§14.1) already covers environment-specific credentials/resource identifiers. |

**What would need to change, explicitly, and what would not:** supporting any of the above requires naming the new framework (§6) and its locator-equivalent priority order (§24) for that system shape — it requires **no change** to the Traceability Model (§12), the Automation Decision Engine (§13), the Suite Planning organizing principle (§10), the Standard Output Contract (§25), or the Handoff Contract (§28). Those are already defined in terms of test cases and evidence, not in terms of "a browser."

# 30. Automation Start Decision Gate

**This is orchestration-level, not this skill's own internal step — it governs whether/how this skill gets invoked at all.** Full specification lives at `workflows_and_pipelines/pipeline/pipeline.md` §5.4; restated here because it directly bounds this skill's authority.

Whenever a human requests automation (or any single downstream stage) for a project, whoever/whatever is orchestrating the pipeline — a human, a script, or a skill acting in that capacity — must never unilaterally decide whether to: resume from the latest approved stage, run the full pipeline from Stage 1, or skip straight to generating automation. It must first inspect the Run Manifest for that project/run, present the actual current state (which stages are Approved/Pending/absent), and ask. See `workflows_and_pipelines/pipeline/pipeline.md` §5.4 for the required interaction format and options. This skill must never begin generating an Automation Plan or any code until that upstream decision has been made explicitly by a human — "the user asked for automation" is not, by itself, authorization to also silently run or skip Stages 1–4.

# 31. Framework Decision Gate

**Framework selection (§6–§8) is never a decision this skill makes and silently proceeds on — it is always a question put to a human, even when the answer looks obvious.** This section is the mandatory interaction that must complete before any Automation Plan (§5) is written or any code is generated.

## 31.1 Step 1 — Inspect and summarize every existing framework's project (v8: one row per framework, never more)

Before asking anything, this skill reads `AutomationPackages.md` (§19) — the project's registry of every framework this project has an authoritative Automation Package for — and, for each entry, inspects the actual code (§9), not just the registry's own claim about it. **A project may use several different frameworks, but never more than one project per framework.** This skill then summarizes plainly, e.g.:

```
Existing automation projects for NDC:
1. tests_Playwright — Playwright + JavaScript, 3 tests (Login), last touched RUN-20260712-001
2. tests_SHAFT — none yet
```

or, if the registry is empty/absent, "No previous automation projects exist for this project."

## 31.2 Step 2 — Ask, never infer

Per §31.6's Human Decision Principle, gather the options above, analyze them, present a recommendation with justification, and ask the human — never infer:

```
1. Extend the existing project for this framework (if one exists).
2. Start a project for a framework that doesn't have one yet.
3. Reset this framework's project from scratch (rare — discards the current
   baseline entirely; requires explicit confirmation, never a default).
```

- **If starting a project for a framework with none yet:** ask which framework to use. Present at minimum the frameworks the Project Context or run configuration has ever mentioned, plus the standard list (§6) — e.g. "SHAFT / Playwright / Selenium / Cypress / Other" — and let the human pick, or name one outright if the Project Context already states one explicitly (§7 Rule 1) — but *confirm* it via this same question rather than silently assuming the stated framework is still what's wanted (§7 Rule 1's own updated text).
- **"Extend" is the default recommendation whenever a project already exists for the chosen framework** — a second, independent, competing project for the same framework is never an available option; that gap (this platform's own former "v5" behavior) is exactly what produced NDC's `tests_SHAFT`/`tests_SHAFT_Agency` split, later consolidated back into one project (see `AutomationPackages.md` Notes, 2026-07-24).
- **"Reset" is rare and destructive** — it discards the current baseline's content entirely. Never offered as a casual alternative to "Extend"; only surfaced, with its consequence stated plainly, when the human has reason to believe the existing project is genuinely unsalvageable.
- **This skill's own criteria-based analysis (§7) is offered as a labeled recommendation inside this question, never substituted for it.** "Based on X/Y/Z, extending the existing SHAFT project looks correct — proceed with that, or choose differently?" is acceptable framing; silently proceeding with the recommendation is not.
- **This question is asked before every Stage 5 run**, not only the first one for a project — a prior run's answer is never treated as a standing default for the next run.

## 31.3 Step 3 — Never infer the framework from Discovery tooling

Per §6's hardened language: which tool Stage 2 used for Browser Automation must never appear as a factor in this question or its recommendation. If Discovery used Playwright and the project's actual Automation Framework is SHAFT (or anything else), the question in §31.2 is asked exactly the same way — Discovery's tool choice is invisible to this decision.

## 31.4 Recording the outcome

The human's actual answer — not this skill's recommendation — is what gets recorded in the Automation Plan's Target Framework/Target Language fields (§5), with the recommendation (if one was offered) noted alongside it for traceability. A Framework Decision Gate that was asked but whose answer wasn't recorded verbatim is treated as incomplete, per the same standard as any other missing Automation Plan field (§5). This skill also updates `AutomationPackages.md` (§19) with the outcome — a new framework's project added, the existing one's "last touched" run updated, or (on Reset) the project's history noted as reset — so the next Stage 5 run's Step 1 summary is accurate without re-deriving it from scratch.

## 31.5 Platform Principle (v8)

**Discovery technology != Automation technology, and one authoritative project per framework, project-wide.** Playwright may be the tool that inspected the application in Stage 2. SHAFT, Playwright, Selenium, or Cypress may each independently have their own one authoritative project for that same platform project — none of these facts constrain any other. A framework choice made for one Stage 5 invocation binds that framework's one project for the whole repository, not just that run — extending it is the expected path for every subsequent run targeting the same framework, never a coexisting second package.

## 31.6 Human Decision Principle for Repository-Structure Decisions (added 2026-07-24, user-mandated)

For every decision that affects Automation Project/package selection, framework selection, creation of a new framework's project, merge destination, or repository structure generally, this skill must never decide autonomously. It must:

1. **Gather** the available options (read the registry, inspect the actual code per §9).
2. **Analyze** them against the criteria this specification already names (§7, Existing Framework Analysis).
3. **Present a recommendation with justification** — never a bare option list with no stated reasoning, and never a silent pick.
4. **Wait for explicit human approval** before proceeding. No default or inferred decision is allowed, even when the "obviously correct" answer seems clear from context.

This is not a new category of judgment call — it is the existing discipline §31.2's "ask, never infer" and §5.5 of `workflows_and_pipelines/pipeline/pipeline.md`'s Human Decisions list already require — restated here as its own named principle because it must extend explicitly to merge destination and repository structure, not only to the original Framework/Target/Strategy questions. A concrete case this caught: consolidating two SHAFT packages back into one surfaced that the newer package's test-class redesign silently dropped a business-rule-backed regression assertion the older one had — exactly the kind of thing that must be surfaced and decided by a human, never silently resolved either way by this skill.

# 32. Reference Automation Project

**A project may designate an external, real, human-owned automation codebase as its Reference Automation Project** — e.g. a company's production SHAFT repository living outside this platform's own repository entirely (`E:\...` on local disk, or any path outside `platform_core_data/workspace/automation/`). This is distinct from the platform's own generated Automation Packages (§19, §31): it is not generated by this skill, is not one of the `tests_{Framework}/` packages in the registry, and is never assumed to be the same thing as "an existing automation package" in the §9/§31.1 sense — it gets its own handling.

## 32.1 Registration

Once a human designates a Reference Automation Project (path + a brief description of what it is), this skill persists it as durable project knowledge — e.g. `platform_core_data/reference_automation_project.md` — recording: the path, a one-time Architecture Summary (§32.4), and the standing read-only default (§32.2). This registration is a one-time analysis, not repeated every run — subsequent runs read the persisted file rather than re-inspecting the reference project's entire codebase from scratch, unless the human explicitly asks for a re-analysis.

## 32.2 Read-Only by Default

**A registered Reference Automation Project is never modified unless the human explicitly selects "Update the Reference Project directly"** via the Automation Target Decision Gate (§32.3). Default handling is always: inspect, learn from, generate code *compatible with* its architecture — never edit its files in place without that explicit choice, every time it's chosen (a prior run's "yes, update it" is never treated as a standing default for the next run either).

## 32.3 Automation Target Decision Gate

**Distinct from, and asked alongside, the Framework Decision Gate (§31) and the Automation Strategy Decision Gate (§33) — never assumed, never defaulted.** Whenever a project has a registered Reference Automation Project, this skill asks, before generating anything:

```
Automation Target
1. Generate inside the platform (a platform-tracked Automation Package, §19/§31).
2. Export a package compatible with the Reference Project (generated within the platform's
   own workspace, but structured to drop into the Reference Project's conventions with
   minimal rework).
3. Update the Reference Project directly (writes into the Reference Project's own repository —
   requires the read-only default in §32.2 to be explicitly overridden for this run).
4. Write into the Target Project's own test directories ({{TARGET_ROOT}}/<automationRoot>) —
   the installed-platform default. Generates in the run's working copy, merges to the
   baseline on approval, then projects into the Target Project per pipeline.md §13.3.
```

**Option 4 is available whenever `platform.config.json` declares `mode: "installed"` with a non-empty `target.writeAllowlist`** (`pipeline.md` §13.3), and in that case it is the **presented default** — the generated suite belongs in the repository the team actually runs their tests from. It is still asked, never assumed (§31.2's "Ask, never infer" is unchanged). Choosing it does not change *where generation happens*: the run's working copy and the Workspace Automation Baseline are unchanged, and the Target Project receives a projection of the baseline only after Automation Approval and the Workspace Merge, in that fixed order (`pipeline.md` §13.7).

If `writeAllowlist` is empty or absent, Option 4 is not offered at all — target writes are fail-closed, and Option 1 is the behavior that applies (`pipeline.md` §13.3).

If no Reference Automation Project is registered for this project, Options 2 and 3 are skipped (there is nothing to target) — with Option 4 available this gate still asks between generating inside the platform and writing into the Target Project; with Option 4 unavailable too, there is no choice left to make and this skill proceeds directly to the Framework Decision Gate (§31) and Automation Strategy Decision Gate (§33) as already specified.

## 32.4 Architecture Summary

The one-time registration analysis (§32.1) must produce and persist a plain-language Architecture Summary covering, at minimum: detected framework + version, language + version, build system, project/module structure, Page Object (or equivalent) pattern, base/shared classes, driver initialization pattern, test data strategy, configuration management, reporting solution, naming conventions, and reusable utilities/helpers/wrappers/assertions this skill should always prefer reusing over authoring new equivalents. Any pre-existing inconsistency, duplication, or drift discovered during this analysis (e.g., a locator that no longer matches the live application, two competing driver-init patterns) is recorded plainly, not silently smoothed over — it is knowledge for a human to act on, not this skill's to fix unilaterally.

## 32.5 Generation Rules When a Reference Project Governs (Target = Export or Update)

- **Never recreate SHAFT (or whichever framework's) infrastructure or framework boilerplate that already exists in the Reference Project** (driver factory, base test classes, reporting wiring) — generate only the business/page-specific automation code that fits its existing architecture.
- **Reuse existing utilities and patterns whenever possible** (per the persisted Architecture Summary, §32.4) rather than authoring parallel equivalents.
- Extend an existing Page Object for a screen already covered there (e.g. a Login page class) rather than authoring a competing one from scratch — this is the Reference Project's own version of §11's Automation Knowledge Base rule.

# 33. Automation Strategy Decision Gate

**Distinct from §32.3's Target question and §31's Framework question — all three may be asked together in one exchange, but are conceptually separate answers, none inferred from the others.** Before generating anything, ask:

```
Automation Strategy
1. Extend the existing project for this framework (if one exists).
2. Start a project for a framework that doesn't have one yet.
3. Reset this framework's project from scratch (rare — discards the current
   baseline entirely; requires explicit confirmation, never a default).
```

This is the same question already specified at §31.2 — restated here as its own named gate per explicit user instruction, so it is never accidentally treated as a sub-clause of the Framework question alone. It applies whether the Automation Target (§32.3) is "inside the platform" or "compatible with/updating the Reference Project" — extend vs. start-new-framework vs. reset is a live question in either case. As of v8, this is never framed as "continue vs. a completely new, coexisting package for the same framework" — that option no longer exists (§31.5).

## 33.1 Presentation — one consolidated gate, asked once per stage

**§30/§32.3/§31.2/§33 are presented to the human together, as one Decision Gate, not as separate questions across turns:** (1) proceed with Stage 5 now, or stop after Manual Execution; (2) Automation Target (§32.3); (3) Framework (§31.2); (4) Automation Strategy (§33). Every option is shown at once so the human answers all four in a single exchange, and no sub-question is silently skipped (e.g. never omit Framework just because Target implies an obvious answer — ask it, even if the expected answer is predictable from context). **Once this consolidated gate is answered, this skill does not ask again during that Stage 5 run** — it proceeds straight through Automation Plan → generation → the full Standard Output Contract (§25) without further confirmation dialogs, reserving any further pause exclusively for a genuine technical blocker encountered during generation (§26 Stop Conditions), never for a repeat or refinement of a decision already made.

> **Revision note (v6):** User-mandated addition, 2026-07-12, after registering NDC's real production SHAFT codebase (`E:\Automation2\NDC-Uplift-Automation`) as a Reference Automation Project. Adds §32 (Reference Automation Project — registration, read-only default, the Automation Target Decision Gate, its Architecture Summary requirement, and generation rules when it governs) and §33 (Automation Strategy Decision Gate, named explicitly and separately from §31's Framework question, though the same underlying "continue vs. new" choice §31.2 already specified). No prior section's numbering changed.

## 33.2 Working Copy Creation — the moment this gate hands off to generation

**Immediately after §33.1's consolidated gate is answered, and before the Automation Plan (§5) is written, Working Copy Creation runs** (`workflows_and_pipelines/pipeline/pipeline.md` §12.3): if the resolved package (Target + Framework + Strategy) already has a Workspace Automation Baseline, it is copied wholesale into this run's own automation folder via `platform_core/tools/automation_lifecycle/baselineCopy.js` — this, not an ad hoc inspection of wherever a prior run happened to leave its files, is what "an existing automation package" (§9) now means. If no baseline exists yet, the run starts empty, exactly as before. Every subsequent step in this specification — Existing Framework Analysis (§9), Suite Planning (§10), generation (§14) — operates on this run's working copy, never on the Workspace Automation Baseline directly; the baseline is only ever written later, by the Workspace Merge (`pipeline.md` §12.4), after this run's automation clears Automation Approval (`pipeline.md` §5.2).

# 34. Stack Documentation Step (Context7)

**Mandatory, and it runs at a fixed point:** after the Framework Decision Gate (§31) has resolved the framework and Working Copy Creation (§33.2) has brought in the baseline, and **before any code generation begins** (§14). It informs *how* code is written; it never decides *what* is tested.

Full specification: `platform_core/tools/mcp/README.md` §2. This section states the obligation and the stop conditions; the mechanics live there, once.

## 34.1 Why

Automation written from model memory drifts from the stack it must actually run on — an API removed two minor versions ago, a renamed config key, an assertion helper that never existed at the pinned version. When the authoritative, version-specific documentation is fetchable, guessing at a dependency's surface is a defect, not a shortcut.

## 34.2 Extract the stack from the project — never assume it

The stack is discovered from the project under test and its resolved automation project, in both of the forms the project actually records it:

1. **Source code** — dependency manifests and lockfiles (`package.json`/lockfiles, `pom.xml`, `build.gradle(.kts)`, `requirements.txt`, `pyproject.toml`/`poetry.lock`, `Pipfile.lock`, `*.csproj`, `Gemfile.lock`, `go.mod`, `composer.lock`) plus framework config (`playwright.config.*`, `testng.xml`, `cypress.config.*`, `pytest.ini`, SHAFT's `src/main/resources/properties/`). Run `node platform_core/tools/mcp/stack_docs/cli.js --root <resolved automation project> --json` for this — the shared extractor is the single source of truth for detection, exactly as `run_manager` is for run folder names. Never hand-assemble the dependency list when the tool can produce it.
2. **Documentation** — the project's own stated stack: the approved Project Context's Technology Stack section, `platform_core_data/architecture.md`, `automation_framework.md`, `run_configuration.md`, `onboarding.md`.

**The lockfile wins on version.** A manifest range (`^1.61.1`) is a constraint; the lockfile's resolved version is the fact, and it is the version documented. Where only a range exists, the artifact records it **as a range, flagged unpinned** — never presented as a resolved version.

Where the two sources disagree (documentation says Selenium, the manifests say Playwright), that contradiction is surfaced in the Automation Plan's Assumptions/Risks and at the §31 gate — **never** silently resolved in favor of either. Extracted stack facts do not override the Framework Decision Gate's answer; a manifest containing Playwright is not authorization to generate Playwright.

## 34.3 Query

Per material library (§2.4 of `mcp/README.md` — what the generated code actually imports, not transitive dependencies): `resolve-library-id` with the name **plus the concrete question**, preferring a **version-specific library ID** whenever the version is pinned, then `query-docs` scoped to **one concept per call**. `stack_docs/planQueries.js` produces the concept list and the exact questions; a combined multi-concept query returns shallow results for each and is not how this step is performed.

## 34.4 Output

One artifact per run, before generation: `platform_core_data/workspace/automation/StackDocumentationContext_{Framework}.md`, containing Detected Stack, Dependency Table (library · resolved version · pinned? · source file · Context7 ID · queried?), Queries Performed, Guidelines Extracted, Conflicts, and Documentation Gaps — per `mcp/README.md` §2.5.

The Automation Plan (§5) cites this artifact and records the version-specific guidelines that shaped generation. **A run against a pinned-version stack with zero queries performed and no recorded documentation gap is an incomplete Automation Plan** — the same standard §7 applies to an unjustified framework choice.

## 34.5 The approved project framework governs

Fetched documentation is a **guideline input, never an authority over approved project standards.** Where Context7's idiomatic layout contradicts `platform_core_data/automation_framework.md` (e.g. an idiomatic Playwright structure against SHAFT's Pages/Locators/Tests/Data layering, or accessibility-first locators against the `Btn_`/`Txt_` prefix convention), the **approved framework wins**; the conflict goes in the artifact's Conflicts row and the Plan's Assumptions/Risks, resolved by a human exactly as that document's Gap Resolution Rule requires. Fetched docs never license redesigning an approved framework, and never appear as justification for a coverage decision, a Finding, or a test case's existence — they are outside the traceability chain (§12).

## 34.6 Stop conditions

Consistent with §26–§27 (mark the specific gap, continue generating everything else, never a bare halt):

- **`context7` unavailable or unapproved** — record it as a documentation gap in the artifact and proceed, generating from the pinned versions and the existing project's established conventions. Never present model-memory recall as fetched documentation.
- **No credible library match, or no docs for the pinned version** — recorded per-library as a documentation gap, never backfilled from memory and never silently dropped.
- **No material dependency detected at all** — a documentation gap, not an assumed stack. If the framework is resolved but its dependencies are undiscoverable, that is stated plainly in the Plan's Risks.

> **Revision note (v7):** User-mandated addition, 2026-07-24, introducing the Automation Asset Lifecycle (`workflows_and_pipelines/pipeline/pipeline.md` §12). Adds §33.2 (Working Copy Creation) and Execution Rule 35; reframes §9's "existing Automation Package" and the `existing_automation_package` frontmatter input as the Workspace Automation Baseline copied in at run start, rather than an ambiguous prior package inspected wherever it happens to sit; extends §19's Automation Package Registry row and generation-location note to reflect that this skill now generates into a temporary per-run working copy, promoted to the flat project-level path only after Automation Approval. No prior section's numbering changed, and §30–§33.1's existing Decision Gates are unmodified — this lifecycle composes with them, it does not replace them.

> **Revision note (v8):** User-mandated reversal, 2026-07-24 (same day as v7), of this specification's own prior "v5" principle that a project may hold multiple independent Automation Packages side by side within the same framework. As of v8, **a project holds exactly one authoritative Automation Package per framework** — different frameworks may still coexist (e.g. one SHAFT project and one Playwright project), but never two competing packages within one framework. Rewrites §4's "Existing Automation Package(s)" input row, §7 Rule 2, §9's opening sentence, §19's heading note, §31.1/§31.2/§31.5, and §33's gate wording accordingly; the "continue an existing package (which one) / create a new package" question becomes "extend the existing project / start a project for a framework with none yet / reset a framework's project from scratch (rare, explicit)." Adds §31.6 (Human Decision Principle for Repository-Structure Decisions — gather, analyze, recommend, wait for explicit approval, never a default) and Execution Rule 36. Prompted directly by consolidating NDC's `tests_SHAFT`/`tests_SHAFT_Agency` split (itself a product of the old v5 principle) back into one project — a real diff during that consolidation surfaced a test-class redesign that had silently dropped a business-rule-backed assertion, which is exactly the kind of decision §31.6 now requires be surfaced to a human rather than resolved silently. §33.2 (Working Copy Creation) and the underlying `platform_core/tools/automation_lifecycle/` mechanics from v7 are unaffected — they already operated on a single resolved baseline path with no assumption about package cardinality.

> **Revision note (v9):** User-mandated addition, 2026-07-26, registering the platform's two MCP servers (`platform_core/tools/mcp/`, repo-root `.mcp.json`) and wiring them into this stage. Adds §34 (Stack Documentation Step) — before any code generation, the project's own stack and its **pinned** dependency versions are extracted from the project's source (manifests/lockfiles/framework config, via the new shared `platform_core/tools/mcp/stack_docs/` extractor) and its documentation (Project Context Technology Stack, `architecture.md`, `automation_framework.md`), then `context7` is queried per material library for version-accurate documentation used as a generation guideline. Adds the `stack_documentation_context` output and its §19 artifact row; rewrites §17's browser-tool bullet so the `playwright` MCP server is an explicitly *selectable second mode* alongside the Browser Driver (selection rule in `platform_core/tools/mcp/README.md` §1.2), with a hard prohibition on typing credential values into MCP tool calls (§1.3); adds the two `platform_core/tools/mcp/` dependencies. **§6's v4 rule is unchanged and reinforced:** that Discovery used Playwright MCP still carries zero weight in the Framework Decision Gate, and §34.5 states the parallel rule for documentation — fetched docs never override an approved project framework (`automation_framework.md` governs; conflicts are surfaced for human resolution, never silently resolved) and never enter the traceability chain (§12). No prior section's numbering changed.

# 35. Direct Invocation

This skill is independently invocable — `/automation-skill`, optionally with a run-scoped instruction (e.g. `/automation-skill automate the Login candidates only`). Full rules: `workflows_and_pipelines/pipeline/pipeline.md` §5.3.1.

**The §30 Automation Start Decision Gate is unchanged and still fires.** A direct call authorizes *this* skill to begin its own work; it is never authorization to run, resume, or skip Stages 1–4 (§5.3.1 #2, Execution Rule 28). §5.3.1 relaxes only *who may start this stage and when* — not §30's requirement that the upstream-state decision be made explicitly by a human.

- **Instruction prompts are run-scoped, never spec-overriding** (§5.3.1 #3). An instruction may select which candidate test case IDs to automate, prioritize a suite, or set a generation order. It never authorizes selecting a framework unilaterally (§31 — a Human Decision), choosing a merge destination or repository structure (§31.6), writing into a Workspace Automation Baseline directly (Execution Rule 35), reading the PRD (Execution Rule 2), inventing business logic, or executing what it generates (this skill never executes).
- **Upstream `Pending Review` / `Pending Automation Approval` → request approval, then recommend** (§5.3.1 #4). Report which required input is open, then offer both paths (approve → `/automation-skill`, or revise → `/manual-execution-skill <feedback>`).
- **Missing upstream → run degraded** (§5.3.1 #5):
  - *No Automation Candidate Package:* the scope of what to automate is undefined. Do not substitute "every test case in the Manual Test Suite" for it — that is exactly the scope invention §26's Stop Condition forbids. Report the gap and, if the invocation itself names specific test case IDs, treat that named list as the run-scoped candidate set and record it in the Automation Plan as `Scope source: direct invocation, not an approved Candidate Package`.
  - *No Manual Test Suite:* blocking for any candidate whose full content it would supply — report per §26/§27's minimal-prerequisite form.
  - *No Traceability Matrix / Coverage Report:* generate anyway; mark the Automation Plan's traceability section `Requires Upstream Stage`.
- **Closing message must recommend the next step** (§5.3.1 #6):

```
Stage 5 complete — Automation Package v{N} → Pending Automation Approval
  {run working copy}/automation/tests_{Framework}/
  {S} scripts | {A} automated | {P} partial | {M} manual-only
  Not executed — this skill never runs what it generates.

Next step — either:
  1. Approve, then execute:    "approved"  →  /automation-execution-skill
  2. Revise this stage:        /automation-skill <your feedback>
  3. Extend coverage first:    /automation-skill also automate {IDs}
```
