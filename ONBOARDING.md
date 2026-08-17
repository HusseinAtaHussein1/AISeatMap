# Onboarding Guide — Agentic AI Testing Platform

Welcome. This guide gets a new team member from zero to productive on this repository. It is a summary and map, not a replacement for the deeper docs it links to.

---

## 1. What this platform is

The Agentic AI Testing Platform runs the full software QA lifecycle — **Explore → Design → Validate → Automate → Execute → Report** — as one governed, traceable pipeline. It turns an approved requirements document (PRD) into a Final QA Report, using specialized AI agents ("Skills" in Claude Code) that each own one stage and hand off versioned artifacts to the next.

Two rules explain almost every design decision in the repo:

- **Separate defining from validating, and separate producing from judging.** No single stage both writes a requirement and checks it, or both runs a test and writes the conclusion about it.
- **Human governance at every risky step.** Any step that produces a document that will govern downstream work, or that is about to run code against a real environment, stops for explicit human approval before anything continues.

Read the full picture in [`README.md`](README.md) — it is the architectural reference. For a task-oriented walkthrough (install, inputs, running the pipeline, troubleshooting, CLI reference), read [`docs/USER_GUIDE.md`](docs/USER_GUIDE.md) first.

---

## 2. How this specific repository is set up

Most teams install this platform *into* another project (`npx agentic-testing init` inside the project they want to test). **This repository is different: it runs in self-hosted mode.** See `platform.config.json`:

```json
"mode": "self-hosted",
"targetRoot": ".",
"dataRoot": "platform_core_data"
```

That means this repo is both the platform's source code and the thing being tested (currently against the reference project, **NDC**). Don't be confused if docs describe a separate "target project" — here, the target is this same folder.

---

## 3. Tech stack and setup

- **Node.js ≥ 18.17**, CommonJS. Distributed as an installable CLI (`bin/agentic-testing.js`, command `agentic-testing`).
- Dev dependency: `playwright` (browser automation).
- Useful npm scripts:
  - `npm test` — runs unit tests under `platform_core/tools/**/__tests__/*.test.js`
  - `npm run selftest` — runs `agentic-testing doctor` (validates the installation)
  - `npm run detect` — read-only report of what the platform detects about the project
  - `npm run test:e2e` — runs `scripts/e2e/verify-install.sh`
  - `npm run verify:boundary` — checks the repo's branch boundary rules

If you ever need to install this platform into a *different* project, see [README §16 Quick Start](README.md#16-quick-start) and [§17 Getting Started](README.md#17-getting-started).

---

## 4. The pipeline, stage by stage

Each stage is a Claude Code **Skill** (under `.claude/skills/`), invoked as a slash command (e.g. `/project-context-skill`). Every stage consumes the previous stage's approved artifact — never re-derives it from scratch.

| Stage | Skill | Produces |
|---|---|---|
| 1 | `project-context-skill` | Project Context (scoped from the approved PRD) — **every later stage depends on this being approved** |
| 2 | `explorer-skill` | Discovery Artifacts / evidence, from live exploration of the app (or docs/recordings/user-guided fallback) |
| 3 | `test-design-skill` | Manual Test Suite + Requirement Traceability Matrix + Coverage Report — **this is the divergence point**; requires human review |
| 4M | `manual-execution-skill` | Manual execution results, defects, CSV, QA report — a terminal, standalone delivery |
| 4A | `automation-skill` | Automation package — gated by an "Automation Approval Required" checkpoint before it can run |
| 5A | `automation-execution-skill` | Execution results, separating Application / Automation / Environment failures |
| 5H | `self-healing-skill` | *(optional, human-invoked)* Repair proposals + confidence scores for Automation Failures, applied only after approval |
| 6A | `reporting-skill` | Final QA Report |

The manual branch (4M) and the automation branch (4A → 5A → 5H → 6A) both start from the same Stage 3 output but never merge — pick one per run.

For the authoritative spec of approval gates, run scopes, and skill responsibilities, read [`workflows_and_pipelines/pipeline/pipeline.md`](workflows_and_pipelines/pipeline/pipeline.md). For ready-made shortcuts through common scenarios, see `workflows_and_pipelines/workflows/` (`first_run.md`, `bug_fix_run.md`, `user_story_run.md`).

---

## 5. Repository map

```
.claude/skills/                 The 8 Skills (each has a SKILL.md — read before touching that stage's code)
platform_core/                  Engineering layer: reusable code and platform-level knowledge
  knowledge/patterns/           Platform Knowledge — accumulated engineering know-how, NOT app-specific
  prerequisites/                Checks that must pass before a stage can run
  templates/                    One folder per stage (stage_1_context ... stage_6a_reporting)
  tools/                        automation_lifecycle, browser_driver, browser_provider, execution_safety,
                                 init, mcp, module_manager, observability, platform_paths, project_paths,
                                 run_manager, test_suite_export
platform_core_data/             The currently-targeted project's data (here: NDC). This is what init
                                 never overwrites — your PRD and every run artifact live here.
  knowledge/  knowledge_base/   Two different folders — see the warning below
  modules/    runs/             runs/ holds one immutable folder per pipeline run
  workspace/  automation_baseline/
workflows_and_pipelines/
  pipeline/pipeline.md          The master spec: approval gates, run scope, knowledge base architecture
  workflows/                    Named shortcuts for common run types
docs/                           USER_GUIDE.md, CHANGELOG.md, LESSONS_LEARNED.md, BRANCH_MODEL.md, etc.
presentation/, scripts/         Presentation material; install/verify shell scripts
```

### Things that will trip you up if nobody tells you

- **`platform_core_data/knowledge/` vs `platform_core_data/knowledge_base/` are two different folders.** Don't assume they're the same thing or a typo.
- **`platform_core_data/knowledge_base/onboarding.md` is project data** (about the NDC application), **not** this team-onboarding guide. Different audience, different content.
- **`NDC_Previous_used_helper_docs_tobe_delete/`** under `platform_core_data/` is legacy/dead content — don't build on it, and don't assume it's current.
- **`platform_core/knowledge/patterns/` is Platform Knowledge** (reusable engineering know-how) and is deliberately untouched when retargeting to a new application. Everything else under `knowledge_base/` is Project Knowledge, specific to the app you're currently pointed at.
- There is no `projects/<Name>/` multi-project layout in this repo — it hosts exactly one target (NDC) at a time, under `platform_core_data/`.
- There is no root-level `CLAUDE.md` in this repo — contributor conventions live in `workflows_and_pipelines/pipeline/pipeline.md` and the individual `SKILL.md` files, not in a CLAUDE.md.

---

## 6. Credentials and browser access

If a run needs live browser access to an application, follow [`platform_core/tools/browser_driver/README.md`](platform_core/tools/browser_driver/README.md):

- Create `platform_core_data/knowledge_base/browser/profile.json` (login selectors + a post-login success signal).
- Create `platform_core_data/knowledge_base/credentials/credentials.json` from the provided template.

**Never commit credentials.json.** It is git-ignored by design and must stay that way — always keep credentials outside the repo tree (e.g. in a scratchpad) if you're handling them manually, never log or copy them elsewhere.

---

## 7. Recommended first steps for a new contributor

1. Read [`README.md`](README.md) (architecture) and [`docs/USER_GUIDE.md`](docs/USER_GUIDE.md) (walkthrough) in that order.
2. Read [`workflows_and_pipelines/pipeline/pipeline.md`](workflows_and_pipelines/pipeline/pipeline.md) — this is the master spec for approval gates and stage responsibilities. Nearly every "why does it work this way" question is answered here.
3. Open the `SKILL.md` for whichever stage you'll be working on, under `.claude/skills/<stage>-skill/`.
4. Run `npm test` and `npm run selftest` to confirm your local setup is healthy before making changes.
5. Skim [`docs/LESSONS_LEARNED.md`](docs/LESSONS_LEARNED.md) — it documents past mistakes and why current safeguards exist; it will save you from re-discovering the same problems.
6. Check [`docs/BRANCH_MODEL.md`](docs/BRANCH_MODEL.md) before creating or merging branches — this repo enforces branch-boundary rules (`npm run verify:boundary`).

---

## 8. Where to ask / what to check when stuck

- Architecture and "why" questions → [`README.md`](README.md) and [`docs/LESSONS_LEARNED.md`](docs/LESSONS_LEARNED.md).
- "How do I run X" questions → [`docs/USER_GUIDE.md`](docs/USER_GUIDE.md).
- Pipeline/stage/approval-gate questions → [`workflows_and_pipelines/pipeline/pipeline.md`](workflows_and_pipelines/pipeline/pipeline.md).
- Skill-specific behavior → that skill's own `SKILL.md`.
- Installation/CLI problems → `agentic-testing doctor`, `agentic-testing roots`, `agentic-testing detect`.
