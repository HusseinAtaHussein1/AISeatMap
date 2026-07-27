---
name: test-design-skill
description: Stage 3 of 7 in the Agentic AI Testing Platform pipeline (Requirement-Driven Test Engineering skill). Transforms the approved Project Context plus Discovery Artifacts/Findings/Evidence into a fully-traceable Manual Test Suite (Markdown + Excel), Requirement Traceability Matrix, and Coverage Report. Use when designing manual test cases for a project after Discovery is approved.
inputs:
  - name: project_context
    type: file_path
    required: true
    description: Approved Project Context — primary source of testable requirements.
  - name: discovery_artifacts
    type: file_path
    required: true
    description: Approved Discovery Report, QA Assessment Report, Findings Summary, and per-Finding Evidence Packages at `platform_core_data/runs/{{RUN_FOLDER}}/discovery/` — secondary inputs used only to validate, enrich, and surface gaps against the Project Context.
outputs:
  - name: manual_test_suite_md
    type: file_path
    location: "platform_core_data/runs/{{RUN_FOLDER}}/test_design/TestCases_{Module}.md"
    description: Human-readable manual test cases, grouped by module.
  - name: manual_test_suite_xlsx
    type: file_path
    location: "platform_core_data/runs/{{RUN_FOLDER}}/test_design/TestCases_{Module}.xlsx"
    description: Identical test case set, spreadsheet form. Must never diverge from the Markdown rendering.
  - name: traceability_matrix
    type: file_path
    location: "platform_core_data/runs/{{RUN_FOLDER}}/test_design/TraceabilityMatrix.md"
    description: "Project Context requirement ID → Test Case ID mapping, annotated with Discovery/Finding/Evidence references."
  - name: coverage_report
    type: file_path
    location: "platform_core_data/runs/{{RUN_FOLDER}}/test_design/CoverageReport.md"
    description: Requirement Coverage and Finding Coverage accounting, structured per the Standard Output Contract (§18).
dependencies:
  - project-context-skill (upstream skill)
  - explorer-skill (upstream skill)
  - Spreadsheet-writing library/tool for the Excel export
---

> **Pipeline position:** Stage 3 of 7 — consumes the Project Context (primary) and Discovery Artifacts, Findings, Evidence Packages, and the QA Assessment Report (secondary), produces Manual Test Suites.
> **Traceability:** `Project Context → Test Cases`, informed and validated by `Discovery → Test Cases` and, where applicable, `Finding/Evidence → Test Cases`.
> **Revision history:** see `docs/CHANGELOG.md`.
>
> **Revision note (2026-07-27, user-mandated):** artifacts now live in this run's own Run Folder (`platform_core_data/runs/{{RUN_FOLDER}}/{stage}/`) — `platform_core_data/workspace/` is removed — and each artifact is **one file, edited in place**: no `.vN` suffixes, and **no duplicate "final" copy is ever written on approval**. Refinement edits the same file the reviewer read. Git is the version history. See `workflows_and_pipelines/pipeline/pipeline.md` §7.

# 1. Skill Name

**Test Design skill** (Requirement-Driven Test Engineering skill) — v3

# 2. Purpose

The Test Design skill transforms validated project knowledge — the approved Project Context, Discovery Report, Findings, Evidence Packages, and QA Assessment Report — into a complete, structured set of manual test assets with full, explicit, four-dimension traceability. It is the quality gate between "what the business requires and what was actually observed" (Stages 1–2) and "what gets manually validated, and ultimately automated" (Manual Execution skill, Stage 4, followed by the Automation skill, Stage 5).

**The Project Context is this skill's primary source of truth.** Discovery Artifacts, Findings, and Evidence Packages — everything the Explorer skill produced — are secondary inputs used to validate that requirements hold in the live application, enrich test scenarios with real UI detail and observed evidence, detect undocumented behavior, and ensure every Finding is deliberately accounted for in the test suite. None of these secondary sources is ever treated as more authoritative than the Project Context; where they disagree, the disagreement is recorded as a discrepancy, not silently resolved in favor of whichever source this skill happens to read first.

**As of v2, this skill's responsibility extends beyond writing test cases.** It is now accountable for: full traceability (§5) on every test case; systematic, category-complete negative-test generation (§7); measured, reported test coverage against both requirements and Findings (§8); and the platform's own canonical, multi-format output (§9). This skill designs and tracks tests; it does not execute them, write automation code, touch a live environment, or produce output shaped around any external tool.

**This skill must never read the PRD directly.** Per `workflows_and_pipelines/pipeline/pipeline.md` §6 Rule 4, only the Project Context skill (Stage 1) may read the PRD. This skill's complete brief on requirements is the Project Context; it does not independently re-consult the PRD to "double check" or fill in a gap, even where the Project Context is silent — silence is itself the correct signal (§4, §6).

**This skill is part of the platform core and must remain platform-agnostic.** It never shapes its output, schema, or terminology around any specific external ALM, issue-tracking, or test-management system. It produces the platform's own canonical artifacts (§9) and nothing else; any future integration that maps those canonical artifacts into a third-party tool's format is a separate, external concern, outside this skill's — and the core architecture's — scope.

# 3. Responsibilities

- Read the Project Context in full as the primary and authoritative source of testable requirements (scope, roles, business rules, validation rules, security requirements, environment constraints, carried-forward assumptions/risks).
- Read the Discovery Report, Findings, Evidence Packages, and QA Assessment Report as secondary inputs, used only to:
  - **Validate requirements** — confirm that what the Project Context describes actually holds true in the observed application
  - **Enrich scenarios** — add real UI detail (exact field labels, error text, component behavior) and cite specific observed evidence that makes a test case concrete, executable, and evidence-grounded
  - **Detect undocumented behavior** — surface behavior the application exhibits that the Project Context never mentioned
  - **Identify gaps** — flag any place Discovery, a Finding, or Evidence contradicts or extends beyond the Project Context
- Derive test cases primarily from the Project Context's requirements; use Discovery/Findings/Evidence to sharpen, validate, and evidence those test cases — never to introduce requirements the Project Context does not contain.
- Where a secondary source reveals a gap or contradiction, generate the test case against the Project Context's stated requirement, and separately log the discrepancy for the Project Context skill / stakeholders to resolve — do not silently defer to whichever source seems more "real."
- Only consume secondary-input artifacts that have themselves cleared their own pipeline checkpoint (§4) — never draft test cases against a Discovery Report, Findings set, Evidence Package, or QA Assessment Report that is still `Pending Review`.
- For every testable requirement, design (at minimum, where applicable):
  - One positive / happy-path test case
  - Negative test cases across every applicable category in the Negative Test Generation Engine (§7) — not just one generic "invalid input" case
  - One boundary / edge-case test case
  - One security or access-control test case, where the requirement carries security implications
- **Ensure every Finding produced by the Explorer skill is explicitly dispositioned** (§5.3) as exactly one of: a regression test case, an exploratory test case, or a documented exception with stated reasoning — never silently omitted from the test suite.
- Carry forward every `> Assumption` and Risk entry from the Project Context into the corresponding test case, marked as an assumption-based test that must be verified before execution.
- Produce a full Requirement Traceability Matrix mapping Project Context requirements to test case IDs, annotated with the Discovery/Finding/Evidence references that validated, enriched, or contradicted each one, plus a Coverage Report (§8) quantifying requirement and Finding coverage.
- Produce the Manual Test Suite in the platform's own canonical formats only — Markdown and Excel (§9) — with no tool-specific export of any kind.
- Never invent functionality, workflows, requirements, or business rules not documented in the Project Context.
- **Adapt test design strategy to the run's Run Scope Type** (§16) — an Entire Project pass, a single User Story's acceptance-criteria-driven cases, and a Bug's reproduction-plus-regression cases are different activities at different depths, not one default approach applied uniformly.
- **Systematically evaluate every Required Dimension** (§17) — Business Rules, Error Handling, Permissions, Configuration, Regression Impact, Integration Behaviour, Risk-based prioritization, and Exploratory Recommendations — for each testable requirement, alongside the existing Negative Test Generation categories (§7), recording "Not Applicable — {reason}" rather than silently skipping any of them.
- **Report Coverage using the full category set** (§8.3) — Covered, Partially Covered, Out-of-Scope, and Unknown/Unassessed — not only a binary Covered/Uncovered split.
- **Produce output conforming to the Standard Output Contract** (§18) so the Automation skill never has to interpret free-form prose to find what it needs.
- **Recognize named Stop Conditions** (§19) and, rather than halting the entire run over one blocked item, recommend the smallest missing prerequisite needed to unblock it (§20) while continuing to design every other requirement that isn't blocked.
- **Verify handoff completeness before concluding a run** (§21) — confirm every input the Automation skill's own specification declares it needs is actually present, specific, and unambiguous, not merely assumed.

# 4. Inputs

| Input | Role | Required? | Description |
|---|---|---|---|
| Project Context | **Primary** | Required, must be `Approved` | `platform_core_data/runs/{{RUN_FOLDER}}/context/ProjectContext.md` — the sole source of requirements, scope, roles, and business rules for test design |
| Run Scope | Primary (embedded) | Required | Not a separate file — the Type/Source recorded in the Project Context's own Scope Summary (`workflows_and_pipelines/pipeline/run_scope.md` §3–§4). Called out here explicitly, not left an implicit read of prose, because it is what §16's strategy selection keys off of. |
| Discovery Report | Secondary | Required, must be `Approved` | `platform_core_data/runs/{{RUN_FOLDER}}/discovery/*.md` (including `Timeline.md` and `Coverage_Summary.md` where the Explorer skill version in use produces them) — raw structural/behavioral observation, used only to validate, enrich, and identify gaps against the Project Context |
| QA Assessment Report | Secondary | Required, must be `Approved` | `platform_core_data/runs/{{RUN_FOLDER}}/discovery/QA_Assessment_Report.md` — the Explorer skill's synthesized report (Application Overview, Workflows, Risk Analysis, Gap Analysis, Coverage) |
| Findings | Secondary | Required if any exist for this run, must be `Approved` | `platform_core_data/runs/{{RUN_FOLDER}}/discovery/findings/Findings_Summary.md` plus each individual `FINDING-{ID}_{ShortName}/metadata.md` — every Finding must be read and dispositioned (§5.3), not merely skimmed |
| Evidence Packages | Secondary | Required wherever a Finding or negative test cites specific evidence, must be `Approved` alongside its parent Finding | `platform_core_data/runs/{{RUN_FOLDER}}/discovery/findings/FINDING-{ID}_{ShortName}/` — the captured evidence files backing each Finding, cited by reference (§5.1), never copied wholesale into a test case |

**This skill must never read the PRD directly** (`platform_core_data/knowledge_base/PRD.md` or equivalent) — only Stage 1 (Project Context skill) is permitted to do so, per `workflows_and_pipelines/pipeline/pipeline.md` §6 Rule 4. Any requirement question this skill cannot resolve from the Project Context is a gap to log, not a reason to open the PRD.

**This skill must never read `platform_core_data/` (Project Knowledge) directly, either** — `onboarding.md`, `architecture.md`, `glossary.md`, `run_configuration.md`, and `resources/` are Stage 1's inputs to reconcile into the Project Context; by the time Stage 3 runs, whatever from Project Knowledge is relevant has already been folded in. Re-reading Project Knowledge directly would let this skill silently reintroduce detail the Project Context skill deliberately scoped out — the same failure mode the PRD prohibition exists to prevent, applied to the other upstream source.

**Hidden-assumption check: Acceptance Criteria are not a separate input — they must arrive embedded in the Project Context's requirement statements.** Nothing upstream of this skill guarantees a User Story's acceptance-criteria-level granularity survives being distilled into the Project Context; if a requirement's Project Context entry is summarized down to a level where individual acceptance criteria can no longer be identified, that is an "Incomplete acceptance criteria" Stop Condition (§19), not something this skill infers or reconstructs on its own.

**Every input above must be in an `Approved` checkpoint state before this skill consumes it.** If any required input is still `Pending Review`, `Pending Automation Approval`, or `Rejected`, this skill must halt and report the blocking artifact rather than proceeding against a draft.

# 5. Traceability Model

Every generated Test Case must trace back to, and explicitly cite, up to four sources. This traceability must be **explicit** — present as named columns in the Requirement Traceability Matrix, keyed by Test Case ID (§6.2; the test case document itself stays lean per the Test Case Writing Standard, §6.1) — never left implicit or inferable only from context.

## 5.1 The Four Dimensions

| Dimension | Field Name | Mandatory? | Populated From |
|---|---|---|---|
| Requirement | Requirement Reference | **Always mandatory** | The specific Project Context requirement ID/section (e.g., `FR-12`, `BR-1`, `SR-3`) this test case verifies |
| Discovery | Discovery Reference | **Always mandatory** | The specific discovery snapshot, Timeline entry, or QA Assessment Report section that validated or enriched this test case, or `"Not independently verified in Discovery"` if the requirement was never specifically exercised during exploration |
| Finding | Finding Reference | Mandatory when applicable; otherwise `N/A` | The specific Finding ID (e.g., `FINDING-003`) this test case exists to regress-test, exploratorily re-test, or otherwise addresses |
| Evidence | Evidence Reference | Mandatory when a Finding Reference is populated; otherwise `N/A` | The specific evidence file(s) within that Finding's Evidence Package (e.g., `FINDING-003/failure.png`) that ground this test case's Test Data or Expected Result |

A test case with a populated Finding Reference but an `N/A` Evidence Reference is incomplete and must not be published — if a Finding is being tested, its evidence is what makes the test case concrete (e.g., using the exact reproduction steps and expected failure/success state the Evidence Package documented).

## 5.2 No Test Case Without Traceability

**No test case may be created without at least a Requirement Reference and a Discovery Reference.** A test case with neither is, by definition, untraceable to this pipeline's sources of truth and must not be generated — if this skill finds itself wanting to write a test case with no traceable source, that is itself a signal to log a gap (a `Requirement Gap`/`Test Gap`-shaped note in the Coverage Report, §8) rather than to invent a requirement to justify the test case.

## 5.3 Finding Disposition — Every Finding Becomes Exactly One Outcome

Every Finding in the approved Findings Summary must be explicitly dispositioned as **exactly one** of the following. This disposition is recorded in the Coverage Report (§8) and, where applicable, in the resulting test case(s):

| Disposition | When to use | Resulting Artifact |
|---|---|---|
| **Regression test** | The Finding's Status is `Confirmed`, or it otherwise represents a defect the team intends to fix — a test case is needed to catch its reintroduction. | A test case with this Finding as its Finding Reference, Category-appropriate negative/edge framing (§7), and Expected Result reflecting the *correct* (post-fix) behavior, not the buggy behavior observed. |
| **Exploratory test** | The Finding's Status is `Needs Human Review` and the underlying ambiguity is a judgment call best re-examined by a human tester rather than automated as a fixed pass/fail — e.g., a security/enumeration concern whose acceptability depends on a policy decision not yet made. | A test case (or a clearly-scoped exploratory charter within one) whose Expected Result is framed as "confirm with reviewer whether X is acceptable," not a fixed pass/fail assertion this skill itself cannot responsibly assert. |
| **Documented exception** | The Finding's Status is `Rejected` (already resolved as a non-issue) or `Duplicate`, or the Finding falls outside this run's testable scope for a stated reason (e.g., requires an environment/credential this project doesn't have). | No test case generated; instead, one row in the Coverage Report (§8) naming the Finding, its disposition, and the one-line reason — this still counts as "covered" for coverage-percentage purposes, since it reflects a deliberate decision, not an oversight. |

**A Finding with no disposition at all is an "Uncovered Finding"** (§8) and is a defect in this skill's own output, not an acceptable outcome — the Coverage Report must show zero Uncovered Findings for a complete run; any nonzero count must be explained, not silently shipped.

## 5.4 Extended Traceability Dimensions

Alongside the four mandatory dimensions in §5.1 (unchanged — Requirement, Discovery, Finding, Evidence), every test case additionally carries two further traceability fields wherever they apply:

| Dimension | Field Name | Mandatory? | Populated From |
|---|---|---|---|
| Acceptance Criteria | Acceptance Criteria Reference | Mandatory when the governing requirement is a User Story with enumerated acceptance criteria; otherwise `N/A` | The specific acceptance-criterion statement (quoted or closely paraphrased) this test case verifies — more granular than the Requirement Reference alone, so a reviewer can see exactly which bullet of a User Story this case covers |
| Run Scope | Run Scope Reference | **Always mandatory** | The Run Scope Type/Source (§4's "Run Scope" input) this test case was generated under — lets a reviewer immediately see whether a case came from an Entire Project pass, a specific User Story, a Bug reproduction, etc., without cross-referencing the Project Context separately |

A **Business Rule Reference** is not a seventh dimension on every test case — it is carried as part of the existing Requirement Reference wherever the Project Context states the requirement as a business rule (e.g., `BR-4`) rather than a functional requirement (`FR-12`); the Project Context's requirement IDs already distinguish FR/BR/SR by prefix (as used throughout this document's own examples), so no new field is needed — only the explicit statement, here, that a `BR-` prefixed Requirement Reference *is* the Business Rule traceability this review area asked for.

These two additional fields extend, and never substitute for, the four mandatory dimensions in §5.1 — a test case still cannot exist without a populated Requirement Reference and Discovery Reference regardless of whether Acceptance Criteria/Run Scope apply.

# 6. Test Case Schema

**Canonical Test Case Writing Standard, per explicit user instruction (2026-07-25):** every test case must prioritize clarity, simplicity, and executability over exhaustive detail. The goal is that any QA engineer, regardless of project familiarity, can read a test case once and execute it correctly without additional explanation — **the test case is for execution, not analysis.** Traceability, Risk, and categorization detail (§6.2) still exist and are still mandatory for the pipeline's traceability guarantee (§5.2) — they are simply recorded in the Requirement Traceability Matrix (keyed by Test Case ID) and Coverage Report, not written as inline fields on the test case document itself, so the execution-facing document stays lean.

### 6.0 Lean Test Case Philosophy (Canonical)

**The purpose of a test case is to verify one business behavior — not to document the entire application workflow.**

- **One business behavior per test case.** A test case that chains multiple unrelated actions ("Create Agency, verify validation, approve Agency, edit Agency, reject Agency, search Agency") must be split into independent test cases, each verifying exactly one thing. This is distinct from a single behavior exercised across several data points (e.g., "every Mandatory field blocks empty submission" tested field-by-field in one matrix-style case, §7) — that is still one behavior, parameterized, not several behaviors chained. Whenever a case is legitimately broader than one atomic rule, its Granularity Tier (§6.0.1) must be explicitly Scenario or End-to-End, stated on the case itself — never an unexplained bundle left to read as if it were Atomic.

### 6.0.1 Test Case Granularity (Canonical)

Before creating or modifying a test case, determine its intended scope. Every test case is **exactly one** of the following tiers, recorded as a Tag (§6.1):

| Tier | Verifies | Examples |
|---|---|---|
| **Atomic** | A single business rule or validation. | "Create Agency without Product Access," "Reject Active Agency," "Search by Agency Name." |
| **Scenario** | One complete user workflow composed of several related business rules. | "Successfully create a new Agency," "Complete Agency approval workflow," "Update Agency information." |
| **End-to-End (E2E)** | An entire business journey spanning multiple screens or modules. | "Agency Creation → Approval → Availability for Booking." |

**End-to-End test cases must:**
- Clearly state, in the Objective, that they are workflow tests spanning multiple screens/modules.
- Never replace the Atomic or Scenario test cases that cover the same ground in isolation — E2E is additive, confirming composition, not a substitute for per-rule coverage.
- Be tagged `E2E` (§6.1) — Atomic and Scenario tiers are likewise always tagged (`Atomic` or `Scenario`) so the tier is never left implicit.
- Focus on verifying the overall journey rather than re-asserting every individual validation already covered at the Atomic/Scenario tier.

**Never mix unrelated business behaviors simply to reduce the number of test cases** — a Scenario or E2E tier is earned by genuinely composing related rules into one real workflow, not used as cover for bundling.
- **A tester should understand the test within 30 seconds**, and be able to execute it without reading additional documentation. This is a tighter, comprehension-focused bar than the Success Criteria's two-minute *execution* bar below — both apply.
- **Write like a human** — as if giving instructions to another QA engineer, not documenting requirements. Avoid long paragraphs, requirement-style wording, explaining obvious actions, or describing internal implementation.
- **Steps carry actions; Expected Result carries verification — never mix them.** "Click Save and verify the validation message appears" is two things in one step; write "Click Save." as the step and put the validation message in Expected Result.
- **Test Data uses only the minimum values required** to execute the case — don't overload the reader with values the steps never reference.
- **Notes are for genuinely helpful execution context only** — never move essential execution information (a step, a value, the actual expected outcome) into Notes to keep Steps short; that's hiding required content, not simplifying.

**Readability Check — apply before finalizing every test case:**
1. Can a new QA engineer execute it without help?
2. Can it be understood in under 30 seconds?
3. Is every step necessary?
4. Is there any redundant wording?
5. Does it verify only one business rule?

If any answer is "No," rewrite the test case.

**Golden Rule: if removing a sentence does not change how the test is executed, remove it.** Every sentence must help the tester execute or verify the test — nothing else earns its place in the document.

## 6.1 Test Case Fields (Manual Test Suite document)

Every Test Case in the Manual Test Suite (Markdown/Excel) contains exactly these fields, in this order — no more:

- **Test Case ID** — a stable, unique identifier (e.g., `TC-LOGIN-001`), scoped per module
- **Title** — a short, specific, human-scannable summary (see Title Rules below)
- **Objective** — one sentence stating what this test case verifies (see Objective Rules below)
- **Preconditions** — only what's required immediately before execution (e.g., "User is logged in as Admin.")
- **Test Data** — the specific input values used, kept simple (e.g., `Agency Name: QA_AGENCY_001`), including, for negative tests, the exact boundary/invalid value being exercised (§7); omit this field entirely when a case has no test data
- **Steps** — a numbered list, one user action per step (see Step Writing Rules below)
- **Expected Result** — the specific, observable outcome that constitutes a pass, one verification point per statement (see Expected Result Rules below) — for a regression test derived from a Finding (§5.3), this is the *corrected* behavior, never a restatement of the bug
- **Priority** — execution priority (P1–P4), reflecting how urgently this case should run relative to others
- **Tags** — short labels only, always including the Granularity Tier (`Atomic`/`Scenario`/`E2E`, §6.0.1, mandatory on every case), plus e.g. `Smoke`, `Regression`, `Negative-InvalidInputs`, `AutomationCandidate` — the compact, at-a-glance categorization that replaces what used to be separate Category/Test Type/Automation-Candidate fields on the test case itself; never a paragraph
- **Notes** *(optional)* — anywhere additional explanation is genuinely needed, so Steps/Expected Result never grow long carrying it instead (see "If additional explanation is needed" below)

### Step Writing Rules

- One user action per step. One verification per expected result.
- Short, direct sentences — no unnecessary technical jargon, no long paragraphs.
- Good: "1. Open the Agency page. 2. Click **Create Agency**. 3. Enter a valid Agency Name. 4. Leave the Product Access section empty. 5. Click **Save**."
- Bad: "Navigate to the Agency management module, ensuring all required prerequisites are satisfied before attempting to initiate the creation workflow…"

### Expected Result Rules

Write only what the tester should verify — a complete but minimal statement, not a hedge or a value judgment.

- Good: "The system displays a validation message indicating that Product Access is required."
- Bad: "The application should ideally validate according to the business rules and prevent the user from proceeding."

### Title Rules

Keep titles short and specific, describing the behavior under test: "Create Agency successfully," "Create Agency without Product Access," "Reject Pending Agency," "Search Agency by Name," "Update Agency Status."

- Good: "Create Agency without Product Access"
- Bad: "Verify that the Agency creation process correctly validates mandatory Product Access configuration before allowing successful submission"

### Verify One Thing

Each test case validates a single behavior — split anything that doesn't.

- Good: "Create Agency without Product Access"
- Bad: "Create Agency, verify validation, approve Agency, edit Agency, reject Agency, search Agency" — split into independent test cases instead.

### Objective Rules

One sentence only. Example: "Verify that an Agency cannot be created without Product Access."

### Avoid, in the test case itself

Do not explain why every step exists. Do not include implementation details. Do not speculate. Do not describe internal logic. Do not write requirement documentation inside the test case — that belongs in the Traceability Matrix/Coverage Report (§6.2), or in Notes if it's a genuinely necessary execution caveat, never inline in Steps or Expected Result.

### Success Criteria

Every test case should be executable by a new team member in under two minutes of reading. If a step feels difficult to understand, rewrite it using simpler language. The reader should immediately know: what to do, what to expect, and whether the test passed or failed.

## 6.2 Traceability, Risk, and Categorization — recorded in the Traceability Matrix and Coverage Report, not on the test case

The following are still mandatory pipeline outputs — nothing here is dropped, only relocated out of the execution-facing test case document:

- **Requirement Reference, Discovery Reference, Finding Reference, Evidence Reference, Acceptance Criteria Reference, Run Scope Reference** (§5.1, §5.4) — recorded in the Requirement Traceability Matrix, one row per Test Case ID, per the same mandatory/`N/A` rules as before. §5.2's "No Test Case Without Traceability" rule is unchanged: a test case with no corresponding Requirement Reference and Discovery Reference row in the Matrix must not be generated.
- **Risk** (Level + one-line statement, derived from a populated Finding's own Business/Technical Risk where applicable) — recorded in the Traceability Matrix's Risk column, aggregated in the Coverage Report's Risks section (§18 #9).
- **Category** (Positive/Negative-{subtype}/Exploratory/etc., §7) and **Test Type** (Smoke/Regression) — recorded as compact Tags on the test case (§6.1) *and* rolled up in the Coverage Report's Test Scenarios section (§18 #5) for at-a-glance breakdown.
- **Automation Candidate** (advisory Yes/No/Partially hint, §9.2/§18 #11) — recorded as a Tag on the test case (§6.1) when Yes, *and* listed in the Coverage Report's Automation Candidates section — never only in one place, since the Manual Execution skill's own tooling may read either.

# 7. Negative Test Generation Engine

This skill does not wait to be asked for a negative case — it automatically evaluates every applicable testable requirement/workflow against each of the following categories and either generates the corresponding negative test case or explicitly records "Not Applicable — {one-line reason}" against that category. A category is never silently skipped without a recorded reason.

| Category | What it exercises | Example Test Data |
|---|---|---|
| **Invalid Inputs** | Malformed, wrong-type, or semantically invalid input the field should reject | A text string in a numeric-only field; a malformed date |
| **Boundary Values** | Values at, just inside, and just outside a stated limit | Max-length string, max-length + 1, minimum allowed value − 1 |
| **Empty Values** | Required fields submitted blank, or optional fields left blank where behavior differs | Empty string, whitespace-only string |
| **Unicode** | Non-ASCII characters, including multi-script and supplementary-plane (emoji) input | Accented Latin, CJK, Cyrillic, emoji |
| **Special Characters** | Characters with syntactic significance in HTML, shell, or markup contexts | `<script>`, `&`, `%`, quotes, backslashes |
| **Security Inputs** | Payload-shaped input used strictly as an input-handling/error-message probe, never to actually exploit anything | SQL-injection-style strings, path traversal strings, header-injection strings |
| **Timeouts** | Behavior under slow, hung, or unresponsive conditions | Simulated slow network/backend response, where the automation/execution environment can induce it |

This category set is deliberately aligned with the Explorer skill v2's Investigation Mode boundary conditions (`.claude/skills/explorer-skill/SKILL.md` §5.8) and Event-Driven Capture triggers (§5.2) — a boundary condition the Explorer skill already probed and evidenced during discovery is exactly the kind of negative test this skill should be generating and citing (via Discovery/Finding/Evidence References, §5) rather than re-deriving from first principles.

# 8. Test Coverage Tracking

This skill tracks and reports coverage across two axes:

## 8.1 Requirement Coverage

- **Covered Requirements** — every Project Context requirement ID with at least one test case whose Requirement Reference cites it
- **Uncovered Requirements** — every Project Context requirement ID with zero test cases citing it, each with a one-line reason (e.g., "out of scope for this run's in-scope modules," "requires a role/credential not available," "genuinely not yet designed — gap to close before Stage 3 sign-off")
- **Coverage Percentage** — Covered Requirements ÷ total testable requirements in scope, shown with its basis (e.g., "18/20 in-scope requirements covered = 90%")

## 8.2 Finding Coverage

- **Covered Findings** — every Finding with a recorded disposition per §5.3 (regression test, exploratory test, or documented exception)
- **Uncovered Findings** — every Finding with no recorded disposition; per §5.3, this must be zero for a complete run, and any nonzero count is flagged as an incomplete run, not accepted as-is
- **Coverage Percentage** — Covered Findings ÷ total Findings for this run

Both sub-reports are consolidated into the Coverage Report, which is one of this skill's required canonical outputs (§9), not an optional appendix.

## 8.3 Extended Coverage Categories

A binary Covered/Uncovered split (§8.1) understates real coverage nuance. The Coverage Report must additionally report, per in-scope requirement:

| Category | Meaning |
|---|---|
| **Covered** | At least one test case's Requirement Reference cites this requirement (unchanged from §8.1). |
| **Partially Covered** | At least one test case exists, but the Required Dimensions evaluation (§17) or Negative Test Generation Engine (§7) left one or more applicable categories un-generated for a reason other than "Not Applicable" (e.g., blocked pending a missing prerequisite, §20) — the requirement has *some* coverage, not full coverage. |
| **Out-of-Scope** | The requirement exists in Project Knowledge but the Project Context explicitly marked its module Out of Scope for this run — expected to have zero test cases, and that absence is not a gap. |
| **Unknown / Unassessed** | This skill cannot determine coverage status at all — e.g., the requirement's Discovery Reference is entirely absent and no Discovery Mode (per the Explorer skill's §8.1) was ever attempted against it, so there is no basis for even a Partially Covered judgment. |

**Uncovered** (§8.1) is reserved for requirements that are In Scope, assessable, and simply have zero test cases with no stated reason — the one category that always represents a defect in this skill's own output, distinct from the three above, none of which are defects by themselves as long as they are named and explained.

The Coverage Percentage (§8.1) is computed against **Covered** only; Partially Covered, Out-of-Scope, and Unknown/Unassessed are reported alongside it, not folded into the same percentage, so a reviewer cannot mistake a high percentage for full assurance when partial/unknown items exist.

# 9. Outputs

The Test Design skill generates **only the platform's own canonical artifacts.** No output is shaped around, named after, or structured to match any external ALM, issue-tracking, or test-management system:

1. **Manual Test Suite (Markdown)** — human-readable, version-control-friendly test case documents, grouped by module
2. **Manual Test Suite (Excel)** — the same test cases in spreadsheet form, for stakeholders and tools that consume tabular test data
3. **Requirement Traceability Matrix** — Project Context requirement ID → Test Case ID, annotated with Discovery/Finding/Evidence references and validation status
4. **Coverage Report** — the consolidated Requirement Coverage (§8.1, §8.3) and Finding Coverage (§8.2) accounting, structured per the Standard Output Contract (§18): Run Scope, Requirements Covered, Coverage Matrix, Business Rules, Test Scenarios, Manual Test Cases (by reference), Assumptions, Coverage Gaps, Risks, Recommendations, Automation Candidates, and Inputs for Manual Execution skill

The Markdown and Excel test suites are two renderings of one underlying test case set — they must never diverge in content. A field added, corrected, or removed in one format is added, corrected, or removed in the other in the same pass.

Any future integration that maps these canonical artifacts into a third-party ALM/test-management/issue-tracking system's import format is out of scope for this skill and for the platform core generally — such integrations, if built, live in a separate layer that consumes these artifacts as input, not inside this specification.

# 10. Allowed Tools

- File tools: Read (Project Context, Discovery Report, QA Assessment Report, Findings Summary, individual Finding metadata and Evidence Packages), Write (Markdown test case, traceability, and coverage documents)
- Code-execution tools (e.g., Bash running a spreadsheet-writing script or library) strictly to generate the Excel export from the same structured test case data — not to run tests or touch a live environment
- Directory-listing shell commands (read-only)

**Not permitted:** browser automation tools, code execution/editing tools that touch application code, or any tool that runs tests against a live environment.

# 11. Execution Rules

1. Must derive test cases primarily from the Project Context — Discovery Report, Findings, Evidence Packages, and the QA Assessment Report inform and validate, they do not originate requirements.
2. Must not treat any secondary input as authoritative over the Project Context. Where they conflict, the Project Context's stated requirement governs the test case, and the conflict is logged as a discrepancy, not silently resolved by this skill.
3. **Must never read the PRD directly.** Only Stage 1 may do so (`workflows_and_pipelines/pipeline/pipeline.md` §6 Rule 4). A requirement question unanswerable from the Project Context is a gap to log, never a reason to open the PRD.
4. **Must never consume an input artifact that is not itself `Approved`** at its own pipeline checkpoint — must halt and report the blocking artifact rather than drafting against a `Pending Review`, `Pending Automation Approval`, or `Rejected` source (§4).
5. **Must never invent requirements.** Every testable requirement a test case covers must be traceable to an explicit Project Context statement (§5.1).
6. **Must never invent business rules.** A business rule not stated in the Project Context is not assumed, extrapolated, or "filled in" for the sake of a more complete-looking test case.
7. **Must never create a test case without traceability** (§5.2) — at minimum a Requirement Reference and Discovery Reference row in the Traceability Matrix (§6.2); a Finding Reference and Evidence Reference wherever the test case exists because of a specific Finding. The test case document itself stays lean (§6.1) — traceability lives in the Matrix, but it must exist there for every test case, with no exceptions.
8. **Must ensure every Finding is dispositioned** as a regression test, an exploratory test, or a documented exception (§5.3) — an Uncovered Finding is a defect in this skill's own output.
9. Must carry forward every assumption/risk flag from the Project Context into a correspondingly tagged test case (§3) — never silently resolve an open question.
10. **Must systematically evaluate every applicable Negative Test Generation category** (§7) for each testable requirement/workflow, generating the test case or recording an explicit "Not Applicable" reason (in the Coverage Report, §18 #5/#8) — never silently skipping a category.
11. Must cover, at minimum, one positive case and the applicable negative categories (§7) for every testable requirement; boundary and security cases wherever applicable.
12. Every test case must include all fields in §6.1 (the lean, execution-facing schema) — no partial schema, no field silently omitted. Every test case must additionally have a corresponding, complete Traceability Matrix row per §6.2 — use `N/A` explicitly where a Matrix field genuinely does not apply, per §5.1's rule for Finding/Evidence References.
13. **Must produce both canonical test suite formats — Markdown and Excel — from the same underlying test case set.** The two must never diverge in content.
14. **Must produce a Requirement Traceability Matrix covering 100% of the test cases it generates** — no orphan test case without a traced Project Context requirement row in the Matrix (§6.2).
15. **Must produce a Coverage Report** (§8–§9) quantifying Requirement Coverage and Finding Coverage, with an explicit accounting (not a silent omission) of every Uncovered Requirement and every Uncovered Finding.
16. Must not write or suggest automation code, and must not execute any test.
17. **Must never shape any output, schema, field, or terminology around a specific external ALM, issue-tracking, or test-management system.** This skill produces only the platform's own canonical artifacts (§9); any third-party import/export format is strictly out of scope for the core architecture.
18. **Must never read `platform_core_data/` (Project Knowledge) directly.** Only the Project Context, already reconciled by Stage 1, is read — re-reading Project Knowledge risks reintroducing detail the Project Context skill deliberately scoped out.
19. **Must select the Test Design Strategy matching this run's Run Scope Type** (§16), and must populate every test case's Run Scope Reference (§5.4) in the Traceability Matrix (§6.2) accordingly — never apply one default depth/breadth regardless of scope.
20. **Must systematically evaluate every Required Dimension** (§17) for each testable requirement, alongside the Negative Test Generation categories (§7), recording "Not Applicable — {reason}" rather than silently skipping any of them.
21. **Must report Coverage using the full category set** (§8.3) — Covered, Partially Covered, Out-of-Scope, Unknown/Unassessed — never collapsing them into a single Covered/Uncovered figure.
22. **Must structure the Coverage Report per the Standard Output Contract** (§18) — all twelve required sections, in order — never substituting free-form prose for any of them.
23. **Must recognize the named Stop Conditions** (§19) and, for any Local condition, continue designing every other unblocked requirement rather than halting the run — and must state the smallest missing prerequisite for every blocked item (§20), never a bare "cannot proceed."
24. **Must verify Handoff completeness** (§21) before treating a run's Test Design outputs as finished — every input `.claude/skills/manual-execution-skill/SKILL.md` §4 declares it needs must be present, and every Discovery/Finding/Evidence Reference must be specific, not merely non-empty.
25. **Must never let an Automation Candidates flag (§18 §11) be mistaken for a binding Automation Decision** — that decision remains exclusively the Automation skill's authority (`.claude/skills/automation-skill/SKILL.md` §13), reached only after the Manual Execution skill (Stage 4) confirms which candidates actually executed successfully and stably (`.claude/skills/manual-execution-skill/SKILL.md` §9); this skill's flag is advisory only, for prioritization, never a substitute for that execution-based confirmation.

# 12. Expected Artifacts

| Artifact | Path |
|---|---|
| Manual Test Suite — Markdown (per module) | `platform_core_data/runs/{{RUN_FOLDER}}/test_design/TestCases_{Module}.md` |
| Manual Test Suite — Excel (per module) | `platform_core_data/runs/{{RUN_FOLDER}}/test_design/TestCases_{Module}.xlsx` |
| Requirement Traceability Matrix | `platform_core_data/runs/{{RUN_FOLDER}}/test_design/TraceabilityMatrix.md` |
| Coverage Report | `platform_core_data/runs/{{RUN_FOLDER}}/test_design/CoverageReport.md` |

# 13. Operational Contract

Role: requirement-driven test case design (Stage 3 of 7).

Transform validated project knowledge into a complete, structured, fully traceable set of manual test assets. Design and track tests; do not execute them, write automation code, read the PRD, or shape output around any external ALM, issue-tracking, or test-management system — produce only the platform's own canonical artifacts. Execution is fully specified above — §4 (Inputs), §5 (Traceability Model, incl. Finding disposition §5.3 and Run Scope Reference §5.4), §6 (Test Case Schema), §7 (Negative Test Generation Engine), §8 (Coverage Tracking), §9 (Outputs), §11 (Execution Rules), §12 (Artifacts), §16 (Strategy by Run Scope), §17 (Required Dimensions), §18 (Standard Output Contract), §19–§20 (Stop Conditions and Recovery), §21 (Handoff Contract). This section adds no rules of its own; the contract is stated once above rather than restated here.

# 14. Example Execution

*Illustrative only — not executed as part of this task.*

```text
Input:
  platform_core_data/runs/{{RUN_FOLDER}}/context/ProjectContext.md        (primary; scope: Login / Authentication & Access)
  platform_core_data/runs/{{RUN_FOLDER}}/discovery/*.md                              (secondary)
  platform_core_data/runs/{{RUN_FOLDER}}/discovery/QA_Assessment_Report.md             (secondary)
  platform_core_data/runs/{{RUN_FOLDER}}/discovery/findings/Findings_Summary.md                (secondary)
  platform_core_data/runs/{{RUN_FOLDER}}/discovery/findings/FINDING-001.../metadata.md ... FINDING-004.../metadata.md  (secondary)
```

Hypothetical result: `TestCases_Login.md` / `.xlsx`, `TraceabilityMatrix.md`, and `CoverageReport.md` under `platform_core_data/runs/{{RUN_FOLDER}}/test_design/`. `TC-LOGIN-004`'s own entry in the Manual Test Suite is lean — Title ("Forgot Password does not time out for a valid, existing username"), Objective, Preconditions, Steps, Expected Result stating the *corrected* behavior ("A generic success message is returned within a reasonable time"), Priority, and Tags (`Regression`) — while the Traceability Matrix carries its Requirement Reference `PRD FR-3 / SR-3`, Discovery Reference `discovery/forgot_password_flow.md`, Finding Reference `FINDING-003`, Evidence Reference `FINDING-003/failure.png, FINDING-003/console.log`, and Risk `High — inherited from FINDING-003's Technical Risk` — dispositioned as a **regression test** per §5.3. `FINDING-004` (the enumeration-via-timeout Security Concern, Status `Needs Human Review`) is instead dispositioned as an **exploratory test**, its Expected Result asking the reviewer to confirm whether response-time parity is in-scope for the anti-enumeration requirement — a policy call this skill does not make unilaterally. The Coverage Report shows `4/4 Findings covered (2 regression, 1 exploratory, 1 documented exception)` and `6/6 in-scope Login requirements covered = 100%`.

# 15. Architecture Principle

> Agents communicate through artifacts only. Each has a single responsibility. Every output becomes the input of another whenever applicable.

For this skill specifically: its single responsibility is designing and tracking tests against the Project Context, not adjudicating between conflicting sources, not executing anything, and not shaping its output around any external system. Its outputs — the Markdown and Excel Manual Test Suites, the Traceability Matrix, and the Coverage Report — become the Automation skill's primary input in the next stage. The platform core, of which this skill is a part, remains completely platform-agnostic; any external-tool integration is a separate, later concern built outside this architecture, consuming these canonical artifacts rather than replacing them.

# 16. Test Design Strategy by Run Scope

Test design depth and breadth follow the run's Run Scope Type (`workflows_and_pipelines/pipeline/run_scope.md` §3) and Run Type (§5), stated in the Project Context's Scope Summary and carried onto every test case via the Run Scope Reference (§5.4) — not one default approach regardless of what this run covers:

| Run Scope Type / Run Type | Strategy |
|---|---|
| **Entire Project** | Full breadth across every in-scope requirement: one positive case, the applicable Negative Test Generation categories (§7), and the applicable Required Dimensions (§17) for each. Coverage Percentage (§8) against the full in-scope surface is the primary success measure. |
| **Epic** | Design test suites per constituent Feature/User Story, plus explicit **integration test cases at the seams between them** — an Epic-level defect is often in the hand-off between two stories, not inside either one alone (mirrors the Explorer skill's own Epic strategy, `.claude/skills/explorer-skill/SKILL.md` §16). |
| **Feature** | Full end-to-end suite for the one feature. The narrower surface calls for, and gets, deeper Negative/Required-Dimension coverage per requirement than an Entire Project pass would budget for. |
| **User Story** | Narrowest and most literal: at minimum one test case per enumerated acceptance criterion (Acceptance Criteria Reference, §5.4), and no broader wandering into adjacent feature coverage the story didn't ask for. Every carried-forward Assumption/Risk tied to that story gets its own explicitly tagged assumption-based test case (§3), never folded silently into another case. |
| **Bug** | Reproduction-first: the first test case reproduces the reported defect exactly as described. Once a fix is assumed, a **regression test case** is designed asserting the corrected behavior (never the buggy behavior, per §5.3's existing rule for Finding-derived cases) — plus boundary cases covering the immediate neighborhood of the same defect class, mirroring the Explorer skill's own boundary-probing on the same Bug scope. |
| **Requirement Document** | Size the suite to what the document actually states it covers — could be Feature-sized or Epic-sized in practice. State which breadth was applied, and why, in the Coverage Report's Run Scope section (§18). |
| **Custom Scope** | Follow exactly what the run's Custom Scope description states — including, where the scope doesn't map onto UI workflows at all (e.g., "design tests for the API responses" or "just the Admin Settings config table"), designing test cases whose Steps are API calls or configuration-state assertions rather than UI actions (see also §22, Future Scalability). |
| **Full Regression** (Run Type) | Prioritizes test cases re-verifying already-documented workflows and prior Findings' regression tests over generating wide net-new coverage — the goal is confirming known-good behavior still holds. |
| **Smoke** (Run Type) | Only P1/critical-path positive cases; the full Negative Test Generation sweep (§7) and Required Dimensions (§17) are reserved for categories already flagged Critical/High risk, not applied uniformly, to keep the suite fast to execute. |

If the Project Context does not state an explicit Run Scope Type, this skill defaults to the **Entire Project** strategy against its declared In Scope modules, and states that default explicitly in the Coverage Report (§18) rather than leaving it unstated.

# 17. Test Design Methodology — Required Dimensions

Beyond the existing Negative Test Generation Engine (§7 — Invalid Inputs, Boundary Values, Empty Values, Unicode, Special Characters, Security Inputs, Timeouts), this skill systematically evaluates every testable requirement against the following dimensions, generating the corresponding test case or explicitly recording **"Not Applicable — {one-line reason}"** — a dimension is never silently skipped, exactly as §7 already requires for its own categories:

| Dimension | What it verifies |
|---|---|
| **Positive Scenarios** | The documented happy path succeeds as the Project Context states (already required by §3's minimum-coverage rule; listed here for completeness of the dimension set). |
| **Boundary Testing** | Values at, just inside, and just outside a stated limit (overlaps with §7's Boundary Values category — evaluated once, not duplicated). |
| **Validation Rules** | Field-level and form-level validation stated in the Project Context behaves as documented (e.g., required-field enforcement, format constraints). |
| **Business Rules** | Rules carried via a `BR-`prefixed Requirement Reference (§5.4) are exercised directly, not merely incidentally covered by a positive-path case. |
| **Error Handling** | Error states surface the correct, documented message/behavior — distinct from merely triggering the error (which the Negative categories already do); this dimension asserts the *response* to the error is itself correct. |
| **Permissions** | Role-based access behaves as the Project Context's Roles & Credentials section states — every documented role boundary gets its own access-control test case, not only "a security test case where applicable" as a general aside. |
| **Configuration** | Where the Project Context documents a feature flag/config toggle affecting behavior (e.g., an `OTP_STATUS`/`CAPTCHA_STATUS`-shaped setting), design test cases for the behavior under each documented configuration state the Project Context describes — never invent untested toggle values it doesn't mention. |
| **Regression Impact** | For a Feature/User Story/Bug-scoped run, explicitly assess and state which *other*, previously-tested requirements this change plausibly affects, and whether a regression case for any of them is warranted — distinct from Finding-derived regression tests (§5.3), which react to a specific observed defect rather than a proactive impact assessment. |
| **Integration Behaviour** | Where the Project Context documents an interaction between two modules/rules (e.g., two filtering mechanisms that must compose via AND logic, or two settings documented as independent), design a test case for the *interaction itself* — not just each side independently — since this is exactly where the Explorer skill's own Investigation Mode (`.claude/skills/explorer-skill/SKILL.md` §5.8) and Gap Analysis most often surface undocumented coupling. |
| **Risk-based Prioritization** | Every test case's Priority (§6) reflects the Project Context's stated risk level for that area — a High/Critical-risk requirement is never left with only a single P4 case; where Risk (§6) is High/Critical, at minimum the Priority is correspondingly elevated, not set independently of it. |
| **Exploratory Recommendations** | Where a requirement is genuinely too ambiguous or judgment-dependent for a fixed pass/fail test case (distinct from an Exploratory-test Finding disposition, §5.3, which reacts to something the Explorer skill already found), this skill may recommend a scoped exploratory charter for a human tester instead of forcing a brittle fixed assertion — recorded in the Coverage Report's Recommendations section (§18), never as a fabricated fixed-outcome test case. |

This evaluation runs once per testable requirement, alongside — not instead of — the Negative Test Generation Engine (§7); the two engines' categories do not duplicate each other's evidence, and a dimension already fully covered by a §7 category is cross-referenced rather than re-generated.

# 18. Standard Output Contract

The Coverage Report (§9 Outputs #4) must contain exactly these sections, in this order, so the Automation skill (and any future consumer) never has to interpret free-form prose to extract what it needs. This does not add a new artifact or change the Coverage Report's file path (§12) — it is the required internal structure of the artifact that already exists:

| # | Section | Must contain, at minimum |
|---|---|---|
| 1 | **Run Scope** | The Run Scope Type/Source and Run Type this run used (§16), and which Project Context version this run designed against |
| 2 | **Requirements Covered** | The Covered list from §8.1/§8.3, with each requirement's ID |
| 3 | **Coverage Matrix** | A cross-reference view — Requirement ID × Test Case ID(s) — consolidating what the Requirement Traceability Matrix (§9 Outputs #3) already states, presented here for at-a-glance review alongside the rest of this contract |
| 4 | **Business Rules** | Every `BR-`prefixed requirement (§5.4) and its test case(s), listed separately from general Requirements Covered so business-rule coverage is auditable on its own |
| 5 | **Test Scenarios** | A count/breakdown of designed scenarios by module and by dimension (§7, §17) |
| 6 | **Manual Test Cases** | Reference to the Markdown/Excel Manual Test Suite files (§9 Outputs #1–#2) — full case content lives there, never restated here |
| 7 | **Assumptions** | Every assumption-based test case (§3) carried forward from the Project Context's Assumptions/Risks |
| 8 | **Coverage Gaps** | Uncovered Requirements (§8.1), Uncovered Findings (§8.2), and Partially Covered / Unknown-Unassessed items (§8.3), each with its stated reason |
| 9 | **Risks** | Every test case's Risk entry from the Traceability Matrix (§6.2) aggregated, with High/Critical items called out explicitly |
| 10 | **Recommendations** | Exploratory Recommendations (§17) and any other non-fixed-case suggestion for the human reviewer |
| 11 | **Automation Candidates** | Test cases this skill flags as *likely* well-suited to automation — an advisory, prioritization-only hint consumed first by the Manual Execution skill (`.claude/skills/manual-execution-skill/SKILL.md` §9.2); the binding Automation Decision (Reuse/Generate/Partially Automatable/Manual Only) remains exclusively the Automation skill's own authority per `.claude/skills/automation-skill/SKILL.md` §13, never pre-empted here |
| 12 | **Inputs for Manual Execution skill** | The explicit handoff package per §21 — confirmation that every input `.claude/skills/manual-execution-skill/SKILL.md` §4 declares it needs is present and specific |

# 19. Stop Conditions

This skill recognizes the following named conditions. Recognizing one is never, by itself, a reason to halt the entire run — see §20 for the required minimal-prerequisite recommendation before any blocked item is left unresolved.

| Condition | Scope | Required Action |
|---|---|---|
| **Missing approved Project Context** | Global | Halt entirely — there is no primary source of requirements without it (already governed by Execution Rule 1/4; named here for completeness of the Stop Condition taxonomy). |
| **Missing Discovery** (Discovery Report/QA Assessment Report/Findings not yet `Approved`, where required) | Global | Halt and report the specific blocking artifact (Execution Rule 4) — never draft against a `Pending Review` secondary input. |
| **Conflicting requirements** (the Project Context contradicts itself between two sections, as opposed to a secondary source conflicting with it, which §3/Execution Rule 2 already governs) | Local — the specific conflicting requirements | Design the test case against neither side unilaterally; log the internal contradiction as a discrepancy for the Project Context skill to resolve (a re-run of Stage 1 editing the same `ProjectContext.md` in place), and mark the affected requirement's coverage as Unknown/Unassessed (§8.3) until resolved. |
| **Insufficient evidence** (Discovery genuinely never exercised this requirement) | Local | Populate Discovery Reference as `"Not independently verified in Discovery"` (§5.1's existing rule) — this is not a halt, it is a documented, permitted gap. |
| **Incomplete acceptance criteria** (a User Story's Project Context entry doesn't preserve individual, testable acceptance criteria) | Local — that requirement only | Do not reconstruct or guess the missing criteria. Design what can be tested from what *is* stated, mark the requirement Partially Covered (§8.3), and recommend the minimal fix (§20) — re-running Stage 1 with the full acceptance criteria preserved. |
| **Ambiguous business rules** (a `BR-` requirement's stated behavior admits more than one reasonable reading) | Local — that requirement only | Do not pick an interpretation unilaterally. Design the test case(s) that hold under either reading where possible; where they cannot both be satisfied, log the ambiguity as a Coverage Gap (§18) and recommend the minimal clarification needed (§20). |

# 20. Recovery Strategy — Minimal Prerequisite Recommendation

Where the Explorer skill falls back to an alternate Discovery Mode (`.claude/skills/explorer-skill/SKILL.md` §21), this skill has no equivalent alternate mechanism — it is a document-synthesis skill, not an exploration skill. Its recovery behavior is instead: **never let one blocked requirement stop the whole run, and always name the smallest thing that would unblock it.**

1. When a Local Stop Condition (§19) blocks a specific requirement, this skill continues designing test cases for every *other*, unblocked requirement in scope — a single blocked item is never a reason to produce zero output for the run.
2. For the blocked requirement, this skill states the **smallest missing prerequisite** that would resolve it — never a vague "cannot proceed." Examples: *"Re-run Stage 1 with T3087's DBA-approved max-airline-count constraint recorded"*, not *"requirements incomplete"*; *"Confirm which of the two readings of BR-7 is intended"*, not *"business rule ambiguous."*
3. For a Global Stop Condition (§19), this skill still states the minimal prerequisite (e.g., *"Awaiting Project Context skill re-run — Discovery Report for RUN-20260710-001 is still Pending Review"*) rather than a bare halt message, so a reviewer knows exactly what single action unblocks the run.
4. The recommended prerequisite is recorded in the Coverage Report's Recommendations section (§18) and, where it blocks a specific requirement, alongside that requirement's Coverage Gap entry (§8.3) — never only in a narrative aside a reviewer could miss.

# 21. Handoff Contract with the Manual Execution skill

The Test Design skill's outputs are consumed next by the Manual Execution skill as declared inputs in `.claude/skills/manual-execution-skill/SKILL.md` §4 — not directly by the Automation skill, which now consumes Manual Execution's own outputs instead (`.claude/skills/automation-skill/SKILL.md` §4). Before concluding a run, this skill verifies each of the following is actually present and specific — not merely assumed:

| Manual Execution skill needs (`.claude/skills/manual-execution-skill/SKILL.md` §4) | Satisfied by (this skill's output) |
|---|---|
| Project Context (Governing) | Unchanged pass-through — this skill does not modify it; Manual Execution reads the same Approved version directly |
| Manual Test Suite (Primary) | §9 Outputs #1–#2 |
| Requirement Traceability Matrix (Secondary) | §9 Outputs #3, carrying Requirement/Discovery/Finding/Evidence References (§5.1) plus Acceptance Criteria/Run Scope References (§5.4) |
| Coverage Report (Secondary — "so Manual Execution doesn't attempt what Stage 3 already excluded") | §9 Outputs #4, structured per §18, specifically sections 8 (Coverage Gaps) and 11 (Automation Candidates) |
| Discovery Artifacts (Secondary — passed through to Automation later "to resolve UI/selector detail") | Not produced by this skill — but every Discovery Reference (§5.1) this skill writes must cite a *specific* snapshot/Timeline entry/Report section, never a bare "see Discovery" |
| Findings (Secondary) | Not produced by this skill — but every Finding Reference/disposition (§5.3) this skill writes must be unambiguous about which of the three outcomes applies, so Manual Execution and, later, Automation know whether a regression script, an exploratory script, or no script at all is expected |
| Evidence Packages (Secondary) | Not produced by this skill — but every Evidence Reference (§5.1) this skill writes must cite specific evidence file(s), never the Finding as a whole |

**A run is not complete until every row above is verifiably satisfied.** A Discovery/Finding/Evidence Reference that is present but vague (e.g., "see discovery folder" instead of a specific file) is itself a handoff defect under this section, not an acceptable shorthand — consistent with §5.2's existing "no test case without traceability" rule, extended here to mean traceability must be *specific*, not merely non-empty.

# 22. Future Scalability

The dimensions this revision adds — Run-Scope-adaptive strategy (§16), Required Dimensions (§17) evaluated independently of any particular UI, and a Test Case Schema (§6) whose Preconditions/Steps/Expected Result fields are already content-agnostic — extend to non-web-UI systems with, at most, a change in what "Steps" and "Test Data" contain, never a change to the schema, traceability model, or Coverage/Output Contract:

| Future system shape | How it fits today's model |
|---|---|
| **Web** (current) | Steps are UI actions; unchanged baseline. |
| **Mobile** | Steps become mobile-gesture actions; Requirement/Discovery/Finding/Evidence References work identically, citing whatever Discovery Mode (`.claude/skills/explorer-skill/SKILL.md` §8.1) the Explorer skill used for that platform. |
| **Desktop** | Same pattern as Mobile — only the Steps' action vocabulary changes. |
| **API** | Steps become request/response definitions (endpoint, method, payload, expected status/body) instead of UI actions; the **Permissions** dimension (§17) already covers auth-header/token/role testing directly; **Configuration** (§17) already covers environment/feature-flag-driven API behavior. |
| **Microservices** | The **Integration Behaviour** dimension (§17) is designed for exactly this — test cases verifying a specific service-to-service contract/interaction, not just each service independently. |
| **Batch Jobs** | Preconditions become "input data set / trigger condition"; Steps become "invoke the job"; Expected Result becomes "output data set / side effect state" — same schema, different content. |
| **Queues** | Same pattern — Steps become "publish a message of shape X"; Expected Result becomes "consumer observes/processes it as Y." |
| **Cloud Services** | Steps become API/console calls against the provider; Configuration (§17) covers infrastructure-as-code/feature-flag-driven behavior differences. |

**What would need to change, explicitly, and what would not:** supporting any of the above requires only naming the new Steps/Test Data vocabulary for that system shape in the relevant test cases — it requires **no change** to the Traceability Model (§5), the Test Case Schema's field list (§6), the Negative Test Generation categories (§7), the Required Dimensions (§17), the Coverage Model (§8), the Standard Output Contract (§18), or the Handoff Contract (§21). Those are already defined in terms of requirements and evidence, not in terms of "a web page."

# 23. Direct Invocation

This skill is independently invocable — `/test-design-skill`, optionally with a run-scoped instruction (e.g. `/test-design-skill Login module only, negative cases only`). Full rules: `workflows_and_pipelines/pipeline/pipeline.md` §5.3.1.

- **Instruction prompts are run-scoped, never spec-overriding** (§5.3.1 #3). An instruction may restrict which requirements/modules to design for, emphasize a test dimension (§17), or set a depth. It never authorizes skipping traceability (§5), dropping a Required Dimension for a requirement that is in scope, reading the PRD directly (§4, §6 Rule 4), or treating Discovery as a requirements source.
- **Upstream `Pending Review` → request approval, then recommend** (§5.3.1 #4). Applies to either input: an un-approved Project Context or un-approved Discovery Artifacts. Report exactly which one is open, then offer both paths (approve → `/test-design-skill`, or revise → the producing skill's command).
- **Missing upstream → run degraded** (§5.3.1 #5), per input:
  - *No Project Context:* halt-equivalent for requirement traceability — there is no requirement set to trace to, so design nothing and report it as the blocking gap. This is the one input this skill cannot degrade around, because every test case's Traceability field would be unfillable.
  - *No Discovery Artifacts:* design from the Project Context alone. Mark every test case that would ordinarily carry a Discovery/Finding/Evidence reference as `Requires Upstream Stage — Stage 2 not run`, record the absence in the Coverage Report's Finding Coverage section as an explicit gap, and never invent selectors, UI labels, or observed behavior to fill it.
- **Closing message must recommend the next step** (§5.3.1 #6):

```
Stage 3 complete — Manual Test Suite → Pending Review
  platform_core_data/runs/{{RUN_FOLDER}}/test_design/TestCases_{Module}.md (+ .xlsx)
  {T} test cases | Requirement coverage {P}%

Next step — either:
  1. Approve, then continue:   "approved"  →  /manual-execution-skill
  2. Revise this stage:        /test-design-skill <your feedback>
  3. Skip manual execution:    /automation-skill   (requires the §5.4 gate + declares gaps)
```
