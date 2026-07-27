// Input-document templates written into a fresh platform_core_data/.
//
// Deliberately blank scaffolds: headings and inline guidance, no invented content. A template that
// shipped plausible-looking placeholder requirements would be worse than an empty one — Stage 1
// reads the PRD as approved truth, and it cannot tell a real requirement from a sample.
//
// Every template names what it is for and what happens if it stays empty, so an unfilled document
// fails loudly at the gate rather than quietly producing a Project Context built on nothing.

const PRD = `# Product Requirements Document

> **This file is the platform's only source of requirements.** Stage 1 (Project Context) is the one
> stage permitted to read it, and every later stage works from the Project Context it produces.
> Nothing is inferred from the application's source code — a discrepancy between this document and
> the code is a Finding to report, never a requirement to adopt (\`pipeline.md\` §6 Rule 9).
>
> Replace every section below. Stage 1 halts if this file is missing or unreadable, and marks
> sections it cannot resolve as \`Open Question\` rather than guessing.

## 1. Overview

_What the product is, and who uses it._

## 2. Scope

### In Scope

_Modules, features, and flows this platform should test._

### Out of Scope

_Named explicitly. Silence on a module is not the same as excluding it._

## 3. User Roles

| Role | Description | Permissions |
|---|---|---|
| | | |

## 4. Functional Requirements

_One numbered requirement per row or subsection. Stage 3 traces every test case back to an ID here,
so each requirement needs a stable identifier._

| ID | Requirement | Acceptance Criteria |
|---|---|---|
| REQ-001 | | |

## 5. Business Rules

| ID | Rule | Applies To |
|---|---|---|
| BR-001 | | |

## 6. Assumptions

> Assumption: _each one on its own line, prefixed like this — Stage 1 carries every assumption
> relevant to in-scope modules forward verbatim, so later stages know what was never confirmed._

## 7. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| | | |
`;

const PRD_USER_STORIES = `# User Stories

> Supplements \`PRD.md\` with story-level detail. Optional: the pipeline runs without it, but a
> UserStory-scoped run (\`workflows_and_pipelines/workflows/user_story_run.md\`) reads from here.

## US-001 — _title_

**As a** _role_
**I want** _capability_
**So that** _outcome_

### Acceptance Criteria

- [ ] _Given … When … Then …_

### Traceability

Implements: _REQ-xxx from PRD.md §4_
`;

const RUN_CONFIGURATION = `# Run Configuration

> Describes *this run's* scope and environment. It never names which project it applies to — the
> Target Project's location is tool configuration (\`platform.config.json\` → \`targetRoot\`), not run
> configuration (\`pipeline.md\` §1.1).

## Target Environment

| Key | Value |
|---|---|
| Environment | _STG / PREPROD / …_ |
| Application URL | |
| Environment notes | _e.g. "shared environment — no destructive actions without authorization"_ |

## Modules In Scope

_The modules this run covers. Everything else is out of scope for this run._

## Credentials

Credentials live in \`platform_core_data/knowledge_base/credentials/credentials.json\`, created by a human from
\`credentials.template.json\`. That file is git-ignored and its values are never written into any
artifact, never typed into a tool call, and never echoed in a report.

| Role | Purpose | Available? |
|---|---|---|
| | | |

## History of scope choices

| Run | Scope Type | Target | Notes |
|---|---|---|---|
| | | | |
`;

const ARCHITECTURE = `# Application Architecture

> Project Knowledge: how the application under test is built. Read by Stage 1 when reconciling the
> Project Context; never a source of requirements.

## Technology Stack

_Frontend, backend, database, hosting. The platform also detects the stack mechanically
(\`platform_core/tools/mcp/stack_docs/\`); this document is where a human records what detection
cannot see._

## Key Components

## Integration Points

_External services, APIs, authentication providers._

## Environments

| Environment | URL | Purpose |
|---|---|---|
| | | |
`;

const GLOSSARY = `# Glossary

> Domain terms specific to this application, so generated test cases and reports use the team's own
> vocabulary rather than paraphrasing it.

| Term | Definition |
|---|---|
| | |
`;

const ONBOARDING = `# Onboarding Notes

> Project Knowledge that does not belong in the PRD: local conventions, known quirks, things a new
> tester would otherwise learn the hard way.

## How to reach the application

## Known quirks and gotchas

## Path conventions

_If this project's artifact layout differs from the defaults in \`pipeline.md\`, record the variance
here — every stage checks this document for path overrides._
`;

const AUTOMATION_FRAMEWORK = `# Automation Framework Standards

> The project's own automation standards. **These win over anything fetched from external
> documentation**: where an idiomatic upstream layout contradicts this document, this document is
> authoritative (\`automation-skill\` §34.5).

## Framework

_Framework and version. Detected mechanically; recorded here once chosen._

## Project Structure

## Page Object Pattern

## Naming Conventions

| Artifact | Convention | Example |
|---|---|---|
| Test file | | |
| Page object | | |
| Test method | | |

## Assertions and Reporting

## Test Data Strategy
`;

const REFERENCE_AUTOMATION_PROJECT = `# Reference Automation Project

> An optional, external, human-owned automation codebase the platform reads for *structural style*
> only — never for requirements, business rules, test cases, or domain knowledge
> (\`pipeline.md\` §6 Rule 9). **Read-only by default**: it is never modified unless a human
> explicitly chooses that target for a specific run (\`automation-skill\` §32.2).
>
> Leave this file as-is if there is no reference project. The Automation Target gate then offers only
> generating inside the platform, or writing into the Target Project's own test directories.

## Registered Reference Project

| Key | Value |
|---|---|
| Path | _not registered_ |
| Read-only | Yes (default) |

## Architecture Summary

_Completed once, on registration: framework and version, language, build system, project/module
structure, Page Object pattern, base classes, driver initialization, test data strategy, config
management, reporting solution, naming conventions, reusable utilities._
`;

const STACK = `# Detected Stack

> **Generated, then durable.** Unlike every other document in this folder, this one is written by the
> platform rather than by a human — Stage 5 (Automation) resolves the project's stack and its
> **pinned** dependency versions via \`platform_core/tools/mcp/stack_docs/\` and records the result
> here, so later runs reuse it instead of re-detecting from scratch.
>
> It lives in \`knowledge_base/\` because it is true of the project across runs, not of one run. The
> per-run companion artifact — which Context7 queries were made and what they returned — stays inside
> the run folder as \`StackDocumentationContext_{Framework}.md\` (\`automation-skill\` §34).
>
> Safe to edit by hand: where a human correction and mechanical detection disagree, record the
> correction plus the reason, and Stage 5 surfaces the conflict rather than silently overwriting it.

## Detected At

_ISO timestamp of the last detection run — left blank until Stage 5 first writes here._

## Ecosystems

| Ecosystem | Detected From |
|---|---|
| | |

## Automation Framework

| Key | Value |
|---|---|
| Framework | |
| Version | |
| Pinned? | |
| Language | |
| Automation root | |

## Dependency Table

_Material libraries only — what the generated code actually imports, not transitive dependencies._

| Library | Resolved Version | Pinned? | Source File | Context7 ID |
|---|---|---|---|---|
| | | | | |

## Conventions Observed

| Aspect | Convention |
|---|---|
| File naming | |
| Page object pattern | |
| Fixture strategy | |

## Human Corrections

_Anything detection got wrong or cannot see. Each entry: what was detected, what is actually true,
and why — Stage 5 reads this before trusting its own detection._

## Detection Gaps

_What could not be resolved mechanically and still needs a human answer._
`;

const CREDENTIALS_TEMPLATE = `{
  "_comment": "Copy this file to credentials.json in the same folder and fill in real values. credentials.json is git-ignored and must never be committed. The platform reads it directly; credential values are never written into artifacts, never typed into tool calls, and never echoed in reports.",
  "activeEnvironment": "STG",
  "environments": {
    "STG": {
      "baseUrl": "https://staging.example.com",
      "username": "",
      "password": ""
    }
  }
}
`;

const TEMPLATES = {
  'PRD.md': PRD,
  'PRD_UserStories.md': PRD_USER_STORIES,
  'run_configuration.md': RUN_CONFIGURATION,
  'architecture.md': ARCHITECTURE,
  'glossary.md': GLOSSARY,
  'onboarding.md': ONBOARDING,
  'automation_framework.md': AUTOMATION_FRAMEWORK,
  'reference_automation_project.md': REFERENCE_AUTOMATION_PROJECT,
  'stack.md': STACK,
  'credentials.template.json': CREDENTIALS_TEMPLATE,
};

/** The .gitignore written inside platform_core_data/knowledge_base/credentials/ as a second line of defence. */
const CREDENTIALS_GITIGNORE = `# Never commit real credentials. The repository-root .gitignore is the primary rule; this is a
# local backstop so the secret stays ignored even if the tool folder is moved or copied elsewhere.
credentials.json
*.creds.json
!credentials.template.json
`;

function getTemplate(name) {
  const content = TEMPLATES[name];
  if (content === undefined) throw new Error(`No template named "${name}"`);
  return content;
}

module.exports = { TEMPLATES, CREDENTIALS_GITIGNORE, getTemplate };
