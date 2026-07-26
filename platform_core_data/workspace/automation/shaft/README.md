# SHAFT — Workspace Automation Baseline

Per the Automation Asset Lifecycle (`workflows_and_pipelines/pipeline/pipeline.md` §12, added 2026-07-24), this folder **is** the authoritative, persistent Workspace Automation Baseline for NDC's SHAFT automation — the opposite of this folder's pre-2026-07-24 role. The prior structural-refactor decision ("generated automation code is never duplicated out of the run that produced it") is deliberately reversed as of this date; see `docs/CHANGELOG.md` for the full rationale.

**This folder holds exactly one authoritative SHAFT project — never multiple, competing SHAFT packages** (`.claude/skills/automation-skill/SKILL.md` §31.5, v8, revised 2026-07-24). Every future SHAFT run copies this one project into its own run-scoped working copy (`pipeline.md` §12.3), modifies only the modules the run actually touches, and — once that run's automation clears Automation Approval (`pipeline.md` §5.2) — merges those changes back into it (`pipeline.md` §12.4). This folder is never edited directly by a Stage 5 run.

| Project | Framework | Source (bootstrap) |
|---|---|---|
| `tests_SHAFT/` | SHAFT Engine 7.4.20231015 (Java 17 / Maven / TestNG) | Bootstrap-migrated from `platform_core_data/runs/RUN-20260712-001/automation/tests_SHAFT/` (Login/Branch/Staff/Role), then consolidated on 2026-07-24 with the Agency automation originally bootstrap-migrated as a separate `tests_SHAFT_Agency` package from `platform_core_data/runs/RUN-20260718-001/automation/tests_SHAFT_Agency/`. See `../AutomationPackages.md` Notes for the full consolidation record (what was ported, what was dropped, why) and each source run's `automation_promotion.md`. |

**This bootstrap migration/consolidation is not an Automation Approval.** The project has not yet cleared `pipeline.md` §5.2's real review criteria (selector robustness, environment safety, no invented business logic) — it remains `Pending Automation Approval` exactly as before migration; only its storage location and internal composition changed. See `../AutomationPackages.md` for full status and history.
