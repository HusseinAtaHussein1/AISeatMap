# Prerequisites

Reusable, independently-versioned declarations of what must be available for a Skill to do its work.

> **Skills reference prerequisites. They do not redefine them.**

## Why this layer exists

Before this model, each Skill embedded its own environmental requirements in its own prose — one
named a specific MCP server, another named a test-runner CLI, a third mentioned a spreadsheet
library in passing. Three problems followed:

1. **Duplication with drift.** The same requirement was stated differently in different Skills, and
   nothing kept the statements in sync.
2. **Implementation leakage.** A Skill naming a concrete tool (a specific MCP server, a specific
   browser library) coupled the *capability it needs* to *one way of providing it* — so swapping the
   provider meant editing Skills.
3. **No uniform absence behavior.** "What happens when this isn't available?" was answered ad hoc,
   or not at all.

A prerequisite is declared **once**, here, with its own ID, detection method, and absence behavior.
A Skill's frontmatter lists the IDs it needs. That is the whole contract.

## The registry

| ID | Name | Kind | Required by |
|---|---|---|---|
| [`PREREQ-NODE`](PREREQ-NODE.md) | Node.js runtime | runtime | every Skill that runs platform tooling |
| [`PREREQ-GIT`](PREREQ-GIT.md) | Git | tool | automation, automation-execution |
| [`PREREQ-BROWSER-PROVIDER`](PREREQ-BROWSER-PROVIDER.md) | Browser Provider | capability | explorer, manual-execution, automation, automation-execution |
| [`PREREQ-PLAYWRIGHT`](PREREQ-PLAYWRIGHT.md) | Playwright | tool | satisfies `PREREQ-BROWSER-PROVIDER` for the Playwright providers |
| [`PREREQ-JAVA`](PREREQ-JAVA.md) | Java + Maven | toolchain | automation, automation-execution — only for JVM-framework packages |
| [`PREREQ-CONTEXT7`](PREREQ-CONTEXT7.md) | Context7 documentation lookup | capability | automation (framework API accuracy) |
| [`PREREQ-SPREADSHEET`](PREREQ-SPREADSHEET.md) | Spreadsheet writer | library | test-design (Excel rendering of the Manual Test Suite) |

## Prerequisite document contract

Every `PREREQ-*.md` carries this frontmatter, then the prose sections below it:

```yaml
---
id: PREREQ-EXAMPLE
name: <human-readable name>
kind: runtime | tool | toolchain | library | capability
scope: platform            # platform (application-agnostic) — never project-specific
required_by: [skill-name, ...]
optional_for: [skill-name, ...]
satisfied_by: [PREREQ-OTHER, ...]   # for a capability, the concrete prerequisites that can fulfil it
detection: <the exact check performed>
absence_behavior: halt | degrade | skip
version: 1
last_updated: 2026-07-29
---
```

Required sections: **Purpose** · **Why a Skill needs it** · **Detection** · **If absent** ·
**What this prerequisite is not** · **Related**.

## Kinds

| Kind | Meaning |
|---|---|
| `runtime` | a language runtime the platform's own tooling executes on |
| `tool` | an external executable invoked by the platform |
| `toolchain` | a compiler/build system group required by one framework family |
| `library` | an in-process dependency |
| `capability` | an *abstract* need, satisfied by one of several concrete prerequisites — the form a Skill should prefer, because it names what is needed rather than how it is provided |

**Prefer a `capability` in a Skill's `prerequisites` list.** `PREREQ-BROWSER-PROVIDER` is the
canonical example: a Skill declares that it needs browser access, and stays correct when the
underlying provider changes.

## Absence behavior — the three uniform outcomes

| Value | Meaning |
|---|---|
| `halt` | The Skill stops before producing any artifact and reports the missing prerequisite by ID. It never fabricates, estimates, or silently proceeds. |
| `degrade` | The Skill continues via a documented lower-confidence path, and **discloses** which path it used and what that implies (e.g. the explorer Skill's fallback Discovery Modes). |
| `skip` | The Skill continues, omitting only the part that needed the prerequisite, and records the omission as a named gap. |

**A missing prerequisite is never resolved by a Skill invoking another Skill.** Skills do not call
each other (see `workflows_and_pipelines/pipeline/pipeline.md` §5.3 and §6 Rule 1). Installing or
configuring a prerequisite is an operator action; the orchestration layer may *offer* to perform it,
and a human accepts — but that offer comes from the orchestrator, never from one Skill reaching into
another.

## How a Skill references one

```yaml
prerequisites:
  - PREREQ-NODE
  - PREREQ-BROWSER-PROVIDER
```

That is all. A Skill must **not** restate the detection command, the install steps, the version
floor, or the absence behavior — those live in the prerequisite document, and restating them lets
the two drift apart.

## Rules

- **Always** declare a prerequisite here once and reference it by ID from a Skill.
- **Never** name a concrete tool or server inside a Skill where a `capability` prerequisite exists.
- **Never** restate a prerequisite's detection or absence behavior inside a Skill.
- **Never** make a prerequisite project-specific — every document here is `scope: platform`. A
  project's own environment specifics (which URL, which credentials, which environment) belong in
  that project's `run_configuration.md`.
- **Never** let a Skill resolve a missing prerequisite by invoking another Skill.

## Related

- [`../tools/browser_provider/README.md`](../tools/browser_provider/README.md) — the Browser Provider abstraction `PREREQ-BROWSER-PROVIDER` describes.
- [`../tools/project_paths/README.md`](../tools/project_paths/README.md) — path resolution; not itself a prerequisite, since it ships with the platform.
- [`../../workflows_and_pipelines/pipeline/pipeline.md`](../../workflows_and_pipelines/pipeline/pipeline.md) §13 — where the prerequisites model is bound into the pipeline specification.
