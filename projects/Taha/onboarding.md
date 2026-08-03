# Taha — Onboarding

Read this first if you're picking up work on the Taha project for the first time.

## What Taha is

<!-- One paragraph: what the application under test does, its domain, and why it's being tested. -->

- **Target instance:** <!-- environment name/version -->
- **URL:** <!-- target environment URL -->
- **Environment sensitivity:** <!-- e.g., "shared public demo — avoid destructive actions" or "isolated test environment — full CRUD permitted" -->

## Reading order

1. [`run_configuration.md`](run_configuration.md) — what's in scope right now, credentials, environment constraints
2. [`architecture.md`](architecture.md) — how the application itself is structured
3. [`glossary.md`](glossary.md) — domain terms you'll hit in the PRD and discovery artifacts
4. `artifacts/Taha/knowledge/Taha_PRD.md` — the full Product Requirements Document
5. `artifacts/Taha/context/Taha_ProjectContext.md` — the current approved Project Context (single source of truth for every pipeline agent downstream of Stage 1)

## Where things stand

Don't hardcode pipeline status in this file — it will go stale. Instead check:

- `artifacts/Taha/pipeline/Taha_RunManifest.md` — per-stage version/checkpoint status
- `artifacts/Taha/runs/` — individual run workspaces

## Key things to know before touching this project

<!-- Anything a newcomer would otherwise have to rediscover: known unconfirmed assumptions, which roles/credentials actually work, coexisting legacy artifacts, etc. -->
