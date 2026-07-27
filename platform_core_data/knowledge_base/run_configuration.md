# Run Configuration

> Describes *this run's* scope and environment. It never names which project it applies to — the
> Target Project's location is tool configuration (`platform.config.json` → `targetRoot`), not run
> configuration (`pipeline.md` §1.1).

## Target Environment

| Key | Value |
|---|---|
| Environment | _STG / PREPROD / …_ |
| Application URL | |
| Environment notes | _e.g. "shared environment — no destructive actions without authorization"_ |

## Modules In Scope

_The modules this run covers. Everything else is out of scope for this run._

## Credentials

Credentials live in `platform_core_data/knowledge_base/credentials/credentials.json`, created by a human from
`credentials.template.json`. That file is git-ignored and its values are never written into any
artifact, never typed into a tool call, and never echoed in a report.

| Role | Purpose | Available? |
|---|---|---|
| | | |

## History of scope choices

| Run | Scope Type | Target | Notes |
|---|---|---|---|
| | | | |
