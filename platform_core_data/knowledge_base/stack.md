# Detected Stack

> **Generated, then durable.** Unlike every other document in this folder, this one is written by the
> platform rather than by a human — Stage 5 (Automation) resolves the project's stack and its
> **pinned** dependency versions via `platform_core/tools/mcp/stack_docs/` and records the result
> here, so later runs reuse it instead of re-detecting from scratch.
>
> It lives in `knowledge_base/` because it is true of the project across runs, not of one run. The
> per-run companion artifact — which Context7 queries were made and what they returned — stays inside
> the run folder as `StackDocumentationContext_{Framework}.md` (`automation-skill` §34).
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
