---
id: PREREQ-CONTEXT7
name: Context7 documentation lookup
kind: capability
scope: platform
required_by: []
optional_for: [automation, automation-execution]
detection: "the configured documentation-lookup capability resolves and answers a version-scoped library query"
absence_behavior: degrade
version: 1
last_updated: 2026-07-29
---

# PREREQ-CONTEXT7 — Context7 documentation lookup

## Purpose

On-demand, version-scoped lookup of a library or framework's real API surface, so generated
automation calls methods that actually exist in the version the package targets — rather than
plausible-looking APIs recalled from training data or inferred from an older release.

## Why a Skill needs it

| Skill | Uses it for |
|---|---|
| `automation` | confirming a framework's real API before generating against it — method names, signatures, annotation names, configuration keys, and version-specific differences |
| `automation-execution` | during the Repair Loop, confirming that a proposed repair uses a real API rather than an invented one |

The failure this prevents is specific and expensive: generated code that compiles in a reviewer's
head but fails at build or run time because a method was renamed, moved, or never existed in the
targeted version. That defect class costs a full generate → review → execute → repair cycle to catch.

## Detection

The capability resolves and answers a version-scoped query for a known library. As a `capability`
this is deliberately provider-agnostic: Context7 is the reference implementation and the ID retains
its name for continuity, but any documentation-lookup provider satisfying the same contract fulfils
it — the platform depends on **version-scoped API lookup**, not on one vendor.

## If absent

`absence_behavior: degrade`:

- **`automation`** — generates using the framework conventions already recorded in the project's
  binding framework structure document and in `knowledge/patterns/framework/`, and records in its
  Self Review and Known Limitations that API surfaces were **not** externally verified. Selector and
  API confidence are stated as lower; they are never presented as verified.
- **`automation-execution`** — a proposed repair that depends on an unverified API is disclosed as
  such in the Repair Summary, and its Confidence figure reflects the missing verification. Confidence
  is always evidence-derived; an unavailable verification source lowers it rather than being ignored.

**Absence never licenses invention.** A Skill that cannot verify an API says so; it does not guess and
present the guess as fact.

## What this prerequisite is not

- **Not a source of business logic or requirements.** It answers "does this framework API exist and
  what is its signature," never "what should the application do." Requirements come exclusively from
  the approved Project Context.
- **Not a substitute for the project's binding framework structure.** Where a project mandates a
  package structure (`{{PROJECT_ROOT}}/automation_framework.md`), that document is authoritative over
  any general documentation this capability returns.
- **Not a knowledge-base write path.** Anything learned here is used in the current run. Promoting a
  durable framework fact into `knowledge/patterns/framework/` is the separate, human-gated Promotion
  Workflow.

## Related

- [`../../workflows_and_pipelines/pipeline/pipeline.md`](../../workflows_and_pipelines/pipeline/pipeline.md) §10 — the Knowledge Architecture, including `patterns/framework/`.
- [`PREREQ-JAVA.md`](PREREQ-JAVA.md) — the toolchain that would surface an unverified-API error at compile time.
