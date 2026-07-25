# NDC — Onboarding

Read this first if you're picking up work on the NDC project for the first time.

## What NDC is

NDC Admin Portal is a web-based travel distribution system (Java 17 / Spring Boot, Oracle or SQL Server) used by travel agencies and administrators to configure suppliers, business rules, and users; manage agencies/agents/traveller profiles; search and book flights across multiple suppliers via a .NET integration layer; issue tickets through NDC Core; and analyze bookings through reporting/dashboards. See [`architecture.md`](architecture.md) for the full module breakdown and data flow.

- **Target instance:** NDC Admin Portal, logged in as `E.Saady` (Admin role — full nav bar visible: Dashboard, Admin, Master, Rule Engine, Settings, User Management, Booking-Mid Office, Profile, Reports, PNR Query, Transfer PNR, Import PNR, Import Booked PNR)
- **URL:** `http://192.168.1.70` — confirmed via screenshots 2026-07-10. Internal/LAN address, served over plain HTTP (browser flags "Not secure") — not a public hostname.
- **Environment sensitivity:** not yet confirmed from screenshots alone — still treat per `run_configuration.md` (shared staging, read-only) until stated otherwise.

## Reading order

1. [`run_configuration.md`](run_configuration.md) — what's in scope right now, credentials, environment constraints
2. [`architecture.md`](architecture.md) — how the application itself is structured
3. [`glossary.md`](glossary.md) — domain terms you'll hit in the PRD and discovery artifacts
4. `platform_core_data/PRD.md` — the full Product Requirements Document
5. `platform_core_data/workspace/context/ProjectContext_CredentialRoutesFilter.md` — the current approved Project Context (single source of truth for every pipeline agent downstream of Stage 1)

**Folder naming note:** unlike other projects on this platform, which use `platform_core_data/workspace/`, NDC uses `platform_core_data/workspace/` for the latest approved state and a sibling `platform_core_data/runs/` for immutable per-run history. This is an NDC-specific override, not a platform-wide rename — see `docs/CHANGELOG.md` for why.

## Where things stand

Don't hardcode pipeline status in this file — it will go stale. Instead check:

- `platform_core_data/workspace/pipeline/RunManifest.md` — per-stage version/checkpoint status
- `platform_core_data/runs/` — individual run workspaces

## Key things to know before touching this project

<!-- Anything a newcomer would otherwise have to rediscover: known unconfirmed assumptions, which roles/credentials actually work, coexisting legacy artifacts, etc. -->
- The original knowledge source was a system-overview/architecture infographic (2026-07-10), transcribed into [`architecture.md`](architecture.md) and [`glossary.md`](glossary.md). No PRD has been provided yet — module/flow relationships from the infographic are still provisional until confirmed against a PRD.
- Live screenshots of the running Admin Portal (2026-07-10, `http://192.168.1.70`, logged in as `E.Saady`) confirmed the real navigation/module structure — see the updated Navigation Model in [`architecture.md`](architecture.md). This is real, observed structure, not inferred from the infographic.
- **Open discrepancy to confirm:** the infographic-derived tech stack in `architecture.md` says the database is Oracle/SQL Server, but a screenshot shows a MySQL-Workbench-style tool querying a schema literally named `wonderdb` (`SELECT * FROM wonderdb.TT_TS_SETTINGS`). Don't assume either is correct — confirm the actual DB engine before it matters for test design.
