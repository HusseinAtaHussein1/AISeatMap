---
name: project-context-skill
description: Stage 1 of 7 in the Agentic AI Testing Platform pipeline. Reads an approved PRD and a run configuration, and distills them into the single Project Context artifact — the source of truth every downstream stage (Explorer, Test Design, Manual Execution, Automation, Automation Execution, Reporting) consumes. Use when starting a new pipeline run, onboarding a new project, or a PRD/run configuration needs to be reconciled into an approved Project Context.
inputs:
  - name: prd
    type: file_path
    required: true
    description: Approved Product Requirements Document at `platform_core_data/PRD.md`. This is the only skill in the pipeline permitted to read it directly.
  - name: run_configuration
    type: markdown
    required: true
    description: Modules in scope for this run, target environment URL, environment constraints, and available credentials/roles.
outputs:
  - name: project_context
    type: file_path
    location: "platform_core_data/workspace/context/ProjectContext.md"
    description: Single source-of-truth artifact (Scope Summary, Modules In/Out of Scope, Roles & Credentials, Environment Constraints, Carried-Forward Assumptions & Risks, Traceability Anchor) every downstream skill consumes. NDC uses a `workspace/context/` variant of this path — see `platform_core_data/onboarding.md`.
dependencies:
  - Read, Write, Glob (file tools only — no browser automation, no code execution)
  - none upstream (first stage in the pipeline)
---

> **Pipeline position:** Stage 1 of 7 — first stage in the pipeline, consumes the PRD.
> **Traceability:** `PRD → Project Context`. This is the only stage permitted to read the PRD directly.
> **Revision history:** see `docs/CHANGELOG.md`.

# 1. Skill Name

**Project Context skill**

# 2. Purpose

The Project Context skill is the entry point of the pipeline. It reads an already-approved Product Requirements Document (PRD) and a run configuration, and distills both into a single, compact **Project Context** artifact.

**The Project Context is the single source of truth (SSOT) for every downstream skill in this pipeline.** Once published, it — not the PRD — is the authoritative reference that the Explorer, Test Design, Manual Execution, Automation, Automation Execution, and Reporting skills read. No downstream skill independently re-reads or reinterprets the original PRD; every one of them consumes the same, already-reconciled Project Context.

Without this skill, each downstream skill would need to re-derive scope, credentials, environment constraints, and risk posture from the PRD on its own — inviting drift and inconsistent interpretation across a multi-stage run. The Project Context skill exists so that scope and requirements are interpreted exactly once, in exactly one place, and every other skill inherits that single interpretation.

# 3. Responsibilities

- Read the target PRD in full.
- Read the run configuration (which modules are in scope for this pipeline execution, target environment URL, credentials/roles available, environment safety constraints).
- Extract and structure:
  - A concise scope summary of what this pipeline run covers
  - The explicit list of in-scope modules (and, equally important, out-of-scope modules)
  - Roles and credentials required, drawn from the PRD's User Roles section
  - Environment constraints (e.g., "shared public demo — no destructive actions" vs "isolated test environment — full CRUD permitted")
  - Every `> Assumption` and Risk entry in the PRD relevant to the in-scope modules, carried forward so later skills don't have to re-discover them
- Never introduce scope, features, or constraints not present in the PRD or the run configuration.
- Halt and clearly report any conflict or gap (e.g., PRD missing, run configuration referencing a module the PRD never mentions) rather than guessing.

# 4. Inputs

| Input | Required? | Description |
|---|---|---|
| Product Requirements Document | Required | `platform_core_data/PRD.md` |
| Run configuration | Required | Modules in scope for this run, target environment URL, environment constraints, available credentials/roles |

Run configuration keys, supplied alongside the invocation: `{{MODULES_IN_SCOPE}}`, `{{APP_URL}}`, `{{ENVIRONMENT_NOTES}}`, and credentials `{{ROLE}}` / `{{USERNAME}}` / `{{PASSWORD}}`.

There is no `PROJECT_NAME` key: the platform tests one Target Project at a time, and its process artifacts are rooted at `platform_core_data/` relative to the Tool Root (`workflows_and_pipelines/pipeline/pipeline.md` §1, §1.1), so a run configuration describes *scope and environment*, never which project it applies to. The Target Project's own location is tool configuration (`platform.config.json` → `targetRoot`), not run configuration.

# 5. Outputs

A single **Project Context** document that becomes the sole source of truth for every downstream skill — the Explorer skill, Test Design skill, Manual Execution skill, Automation skill, Automation Execution skill, and Reporting skill. It is not a new PRD, not a rewrite of it, but a distilled, run-specific lens onto it. None of the downstream skills read the PRD file directly; they read this artifact instead.

# 6. Allowed Tools

- Read (PRD)
- Write (Project Context document)
- Glob (to locate the PRD and any run-configuration files)

**Not permitted:** browser automation tools, code execution tools, or any tool that mutates application data. This skill only reads and structures documents.

# 7. Execution Rules

1. Must not proceed if the PRD file is missing or unreadable — halt and report the gap.
2. Must not invent scope beyond what is stated in the PRD or explicit run configuration.
3. Must explicitly separate "In Scope" from "Out of Scope" modules — silence on a module is not sufficient; it must be listed in one category or the other.
4. Must carry forward every PRD `> Assumption` and Risk entry relevant to in-scope modules verbatim in meaning, not diluted or reworded away from its original caveat.
5. Must cite the PRD section number each extracted item was drawn from, preserving traceability back to the source document.
6. Must not alter, contradict, or "correct" the PRD — this skill summarizes and structures; it does not edit the source document.
7. Once this skill publishes the Project Context, it becomes the single source of truth for the remainder of the pipeline. No downstream skill (Explorer, Test Design, Manual Execution, Automation, Automation Execution, Reporting) may read the PRD directly or independently reinterpret it — any requirement change must flow through a new Project Context skill run, not through a downstream skill going back to the PRD on its own.

# 8. Expected Artifacts

| Artifact | Path |
|---|---|
| Project Context document | `platform_core_data/workspace/context/ProjectContext.md` |

Document structure:
1. Scope Summary
2. Modules In Scope
3. Modules Out of Scope
4. Roles & Credentials Required
5. Environment Constraints
6. Carried-Forward Assumptions & Risks
7. Traceability Anchor (PRD section references for every item above)

# 9. Operational Contract

Role: requirements-to-Project-Context distillation (Stage 1 of 7).

Convert an approved PRD into a single, structured Project Context that every downstream stage uses as its scope-of-truth. Execution is fully specified above — §3 (what to extract), §4 (inputs and run-configuration keys), §7 (rules and halt conditions), §8 (output structure and path). This section adds no rules of its own; the contract is stated once above rather than restated here.

# 10. Example Execution

*Illustrative only — not executed as part of this task.*

```text
Run configuration:
  MODULES_IN_SCOPE   = Agency, Branch, Staff
  APP_URL            = (per platform_core_data/run_configuration.md — STG)
  ENVIRONMENT_NOTES  = "Shared environment — no destructive or persistent
                        data-mutating actions without explicit authorization"
  ROLE               = Admin  (credentials resolved at runtime from
                       platform_core_data/credentials/, never written here)
```

Hypothetical result: `platform_core_data/workspace/context/ProjectContext.md`, listing Agency/Branch/Staff as In Scope; every other module as Out of Scope for this run; carrying forward the PRD's open items (unverified RBAC, no visible brute-force protection, uniqueness rules unconfirmed) as assumptions the Explorer skill should specifically probe.

# 11. Architecture Principle

> Agents communicate through artifacts only. Each has a single responsibility. Every output becomes the input of another whenever applicable.

For this skill specifically: it is the sole reader of the PRD in the entire pipeline, and its sole output — the Project Context — is what every other skill's "single responsibility" is scoped against.

# 12. Direct Invocation

This skill is independently invocable — `/project-context-skill`, optionally with a run-scoped instruction (e.g. `/project-context-skill scope this run to the Leave module only`). Full rules: `workflows_and_pipelines/pipeline/pipeline.md` §5.3.1.

- **Instruction prompts are run-scoped, never spec-overriding** (§5.3.1 #3). An instruction may narrow scope, focus on named modules, or set emphasis. It never authorizes violating §7's rules — most importantly, it never authorizes proceeding past a missing/unreadable PRD (Rule 1), and never authorizes inventing scope the PRD and run configuration don't support.
- **No upstream gate applies.** This is Stage 1; there is no predecessor checkpoint to wait on, so a direct call always runs immediately.
- **Missing run configuration → run degraded** (§5.3.1 #5): produce the Project Context from the PRD alone, list every absent run-configuration key explicitly, and mark the affected sections (Environment Constraints, Roles & Credentials) as `Open Question — Requires Run Configuration` rather than guessing values. A missing *PRD* remains a halt (Rule 1) — it is this stage's only genuinely required input.
- **Closing message must recommend the next step** (§5.3.1 #6):

```
Stage 1 complete — Project Context v{N} → Pending Review
  platform_core_data/workspace/context/ProjectContext.v{N}.md

Next step — either:
  1. Approve, then continue:   "approved"  →  /explorer-skill
  2. Revise this stage:        /project-context-skill <your feedback>
  3. Jump to another stage:    /test-design-skill   (will declare Discovery gaps)
```
