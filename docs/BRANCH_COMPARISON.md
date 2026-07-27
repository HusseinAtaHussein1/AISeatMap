# Branch Comparison — `main` → `Project_owns_package`

What the project was before this branch, what it is now, and why each change was made.

| | |
|---|---|
| **Source branch** | `main` |
| **This branch** | `Project_owns_package` |
| **Merge base** | `c11fd8d` |
| **Commits** | 15 |
| **Files changed** | 843 (66 added · 693 deleted · 20 modified · 64 renamed) |
| **Lines** | +16,182 / −49,736 |
| **Tracked files** | 779 → **152** |
| **Test files** | 0 → **18** (260 assertions, all passing) |

The decision trail behind every change is in [`PROMPT_HISTORY.md`](PROMPT_HISTORY.md).

---

## The headline change

**Before:** you copied your project *into* the platform.
**After:** you install the platform *into* your project.

```text
BEFORE — the platform hosts your project              AFTER — your project hosts the platform

agentic-ai-testing-platform/                          your-project/
├── projects/                                         ├── src/                     ← untouched
│   ├── NDC/            ← a real application          ├── tests/e2e/               ← automation lands here
│   ├── NDC_INT/        ← another one                 ├── agentic-testing-tool/    ← the platform
│   ├── OrangeHRM/      ← and another                 │   ├── platform_core/
│   └── templates/      ← copy this to onboard        │   ├── platform_core_data/   ← all process artifacts
├── platform_core/                                    │   ├── workflows_and_pipelines/
│   └── knowledge/      ← Platform Knowledge          │   └── platform.config.json  ← the two-root wiring
├── workflows_and_pipelines/                          ├── .claude/skills/          ← the seven skills
└── .claude/skills/*-agent/                           ├── .mcp.json                ← merged, not overwritten
                                                      └── .gitignore               ← one marker block
```

Everything else in this document follows from that inversion.

---

## Contents

1. [Architecture](#1-architecture--from-host-to-guest)
2. [The two-root contract](#2-the-two-root-contract--new)
3. [Skills: agents → skills](#3-skills-agents--skills)
4. [Knowledge architecture](#4-knowledge-architecture--relocated-twice)
5. [New tooling layer](#5-new-tooling-layer)
6. [MCP integration](#6-mcp-integration--new)
7. [Browser defaults](#7-browser-defaults)
8. [Invocation model](#8-invocation-model)
9. [Data purge](#9-data-purge)
10. [Documentation](#10-documentation)
11. [Side-by-side matrix](#11-side-by-side-matrix)
12. [What did not change](#12-what-did-not-change)
13. [Known open items](#known-open-items)
14. [Migration notes](#14-migration-notes)

---

## 1. Architecture — from host to guest

### Before

The repository was a **container**. `projects/` held three real applications (`NDC`, `NDC_INT`, `OrangeHRM`) plus a `templates/project_template/` you copied to onboard a fourth. Onboarding meant creating a directory inside the platform and populating it by hand. Generated automation lived inside the platform, structurally divorced from the codebase it tested.

This had two costs that compounded:

- **Automation lived in the wrong repository.** A test suite for `NDC` sat in the testing platform's tree, not in NDC's, so it couldn't participate in NDC's CI, code review, or branching.
- **Every project multiplied the tree.** 740 of 779 tracked files were under `projects/` — the platform's actual specification was a rounding error against the accumulated artifacts of three applications.

### After

The repository is a **distributable tool**. `projects/` is gone entirely. `npx agentic-testing init` installs into a target repository, detects its stack and conventions, and writes generated automation into that project's own test directories in that project's own idiom.

| | Before | After |
|---|---|---|
| Onboarding | copy `templates/project_template/` into `projects/` | `npx agentic-testing init` in the target repo |
| Hosted projects | 3 + a template | 0 — the tool is a guest |
| Generated automation | inside the platform | inside the target project's test dirs |
| Retargeting | clear and repopulate a project folder | run `init` in another repository |
| Greenfield | not supported | scaffolds test infrastructure only |
| Tracked files | 779 | 152 |

---

## 2. The two-root contract — new

The inversion created a problem that did not previously exist: once the tool lives *inside* someone else's repository, "where does this file go" becomes a safety question. The answer is a formal contract ([`pipeline.md` §13](../workflows_and_pipelines/pipeline/pipeline.md), enforced by [`platform_core/tools/platform_paths/`](../platform_core/tools/platform_paths/)).

| Root | What it is | Access |
|---|---|---|
| **Tool Root** | `agentic-testing-tool/` | read + write, unrestricted |
| **Target Root** | the host repository | read for **technical facts only**; write **only** inside the configured automation directory |

Five guarantees, each chosen to fail loudly rather than guess:

| Guarantee | Behavior |
|---|---|
| **Fail-closed write allowlist** | empty or absent `writeAllowlist` means the platform writes **nothing** to the host; Stage 5 generates inside `platform_core_data/` instead |
| **Target Root is never inferred** | only config- or env-declared. A stage that guessed could write into the wrong repository, so missing-in-installed-mode is an error naming the fix |
| **Non-overridable read denylist** | `readDenylist` *merges with*, never replaces, a built-in list (`.env*`, `**/credentials*.json`, `**/secrets*`, `**/*.pem`, `**/*.key`, `**/.aws/**`, `**/id_rsa*`) |
| **`configVersion` mismatch is a hard error** | never a best-effort read; the error names whether to upgrade the tool or migrate the config |
| **`mode` conflict is a hard error** | if config and environment disagree, the resolver refuses to pick a winner — that choice decides whether the platform may write into another repository |

Precedence is explicit (argument → env → `platform.config.local.json` → `platform.config.json` → defaults), and `roots.resolution` carries a human-readable trace of every decision, printed by `doctor`.

**Notably, zero of the 176 `platform_core_data/...` path literals in the skills were rewritten.** After install, `agentic-testing-tool/platform_core_data/PRD.md` makes them already correct relative to the Tool Root — only the resolution rule needed stating, in four documents. Templating them would have introduced a constant masquerading as a variable across 3,422 lines of prose ([`PROMPT_HISTORY.md` Q14](PROMPT_HISTORY.md)).

---

## 3. Skills: agents → skills

### Before

Six skills named `*-agent`, invoked as `/project-context-agent`. 458 uses of the word "agent," and ~1,050 lines of fenced `Operational Prompt` blocks restating the spec sections directly above them.

### After

Seven skills named `*-skill`. The rename covered folder names, `name:` frontmatter, and 361 references across 33 files.

| Before | After |
|---|---|
| `project-context-agent` | `project-context-skill` |
| `explorer-agent` | `explorer-skill` |
| `test-design-agent` | `test-design-skill` |
| — | `manual-execution-skill` **(new — Stage 4)** |
| `automation-agent` | `automation-skill` |
| `execution-agent` | `automation-execution-skill` |
| `reporting-agent` | `reporting-skill` |

Two things were preserved on purpose:

- **Past run artifacts keep their `-agent` strings.** They record what those runs actually invoked. Rewriting them would have made run history describe a world that never ran.
- **The Architecture Principle quote survives verbatim** — *"Agents communicate through artifacts only"* is cited from `pipeline.md` §1 as the platform's stated architecture rule. A citation is a quotation, not vocabulary.

**Token efficiency:** ~1,050 duplicate lines removed, ~30–35% reduction on the large skills. Each block was diffed against its spec body first, and rules that existed *only* in a prompt block were merged back in — which is what makes "no behavior change" a verified claim rather than an assertion.

---

## 4. Knowledge architecture — relocated twice

The two-layer split (Platform Knowledge vs. Project Knowledge) is unchanged in **semantics**. Its **location** moved twice in one session.

```
platform_core/knowledge/                        (before)
  → platform_core_data/patterns/                (intermediate)
    → platform_core_data/knowledge_base/patterns/   (final)
```

The final position nests the Platform layer physically *inside* the Project layer. Since the folder tree now contradicts the logical separation, three guarantees moved from implicit to explicitly specified:

1. `patterns/` resolves **first**, before the surrounding `knowledge_base/` folders (`pipeline.md` §10.2)
2. it is written to **only** through Promotion (§10.5)
3. nothing application-specific may enter it — the Isolation Guarantee (§10.6)

Every layer README now states plainly that **the nesting is structural only, not semantic**. `platform_core/` became Tools-only. `knowledge_base/diagnosis/` moved into `patterns/`, so application-specific diagnosis notes now belong in the `repair/` record that consumed them, or in `findings/`.

The alternative — merging the two layers into one flat `knowledge_base/` — was offered and declined, because it would have ended the Promotion Workflow entirely.

---

## 5. New tooling layer

The base branch had 24 JavaScript files and **zero tests**. This branch has 50 and **18 test files carrying 260 assertions, all passing**.

| Tool | Purpose | Tests |
|---|---|---|
| [`tools/platform_paths/`](../platform_core/tools/platform_paths/) | resolves Tool/Target roots; `classifyPath`, `canRead`, `canWrite`; the config schema | 2 files |
| [`tools/init/`](../platform_core/tools/init/) | plan-then-apply installer; **additive** host-file merging | 2 files |
| [`tools/mcp/stack_docs/`](../platform_core/tools/mcp/stack_docs/) | extracts stack + pinned versions + test dirs + conventions; plans Context7 queries | 3 files |
| [`tools/automation_lifecycle/`](../platform_core/tools/automation_lifecycle/) | baseline copy, three-way merge plan/apply, promotion record, cleanup, hashing | 8 files |
| [`tools/run_manager/`](../platform_core/tools/run_manager/) | deterministic run folder naming, legacy index, migration | 3 files |
| [`bin/agentic-testing.js`](../bin/agentic-testing.js) | the CLI: `init` · `detect` · `doctor` · `upgrade` · `uninstall` | — |
| [`scripts/init.sh`](../scripts/init.sh) · [`init.ps1`](../scripts/init.ps1) | the git-clone install route | — |
| [`scripts/verifyPackable.js`](../scripts/verifyPackable.js) | `prepack` guard: the npm tarball and the clone must stay identical | — |
| [`scripts/e2e/`](../scripts/e2e/) | fixture generation + install verification | — |

### The installer is plan-then-apply

Nothing is written until the plan is confirmed. `--dry-run` prints the plan and exits. Host-file changes are **additive merges, never overwrites**:

- `.gitignore` gets a **marker-delimited block**, so `upgrade` can update it without eating your rules
- `.mcp.json` gets two entries **merged in**; existing servers are preserved
- source, CI config, lockfiles, and existing tests are never touched
- nothing is ever committed to the host repository

### git became explicit rather than derived

Previously the git repository was inferred. Now it is declared: `tool-repo` (default — the tool folder gets its own nested repo, host ignores it, zero commits in host history), `host-repo`, or `off`. The rejected `auto` mode would have silently disabled baseline merge protection whenever a host gitignored the tool folder.

---

## 6. MCP integration — new

The base branch had no `.mcp.json`. This branch registers two servers with a documented usage contract ([`mcp/README.md`](../platform_core/tools/mcp/README.md)).

| Server | Role |
|---|---|
| `playwright` | a **second, selectable browser mode** alongside the Browser Driver — interactive, agent-driven |
| `context7` | **version-accurate documentation** for the exact stack Stage 5 generates against |

**The Browser Driver was not replaced.** It remains the default for authenticated flows; the selection rule is §1.2. §1.3 absolutely prohibits a credential value in any MCP tool call — tool arguments are transcript-visible, so a session is authenticated by `BrowserDriver.authenticate()` and handed to MCP already logged in.

**Context7 is conditional, not blanket.** Stage 5 first extracts the target project's stack and **pinned dependency versions** from its own manifests and lockfiles, then queries Context7 only for what that extraction actually found. Generated automation is written against docs for the versions the suite really runs on.

---

## 7. Browser defaults

| | Before | After |
|---|---|---|
| Playwright MCP | n/a | `--headless` in `.mcp.json` |
| Browser Driver | `headless: false` | `headless: true` in `profile.json`; since 2026-07-27, `headlessByStage.manual_execution: false` makes Stage 4 headed |

Both mechanisms flipped together. A default that holds for only one of two mechanisms isn't a default — it's decided by whichever mode a stage happens to select. Headed is now an explicit opt-in.

---

## 8. Invocation model

### Before

A stage advanced only when the previous checkpoint was approved. The approval statement was the sole path forward — a skill could not be invoked on its own.

### After

Any skill is invokable directly by name, with an optional instruction prompt (`/test-design-skill focus only on the negative cases for US-245`). Behavior depends on upstream state:

| Upstream state | Behavior |
|---|---|
| Approved | runs normally |
| **Pending Review** | **asks for approval, then recommends the next skill and action** |
| **Missing entirely** | runs **degraded** — lists what was missing, marks affected sections as gaps |

The asymmetry is deliberate. An existing-but-unreviewed artifact is a *governance* question, so the gate holds. A missing one is a *coverage* question, so the run proceeds and discloses. This preserves the meaning of the approval gate — a direct call can't launder an un-reviewed artifact downstream — while fixing the actual friction: being stopped without being told what to do next.

The offered-and-declined alternative was to treat the direct call as implicit authorization, which would have made every direct call a silent gate bypass ([`PROMPT_HISTORY.md` Q11](PROMPT_HISTORY.md)).

---

## 9. Data purge

~340 files of prior-experiment (NDC) content removed:

| Group | Files |
|---|---|
| Generated run output (`runs/` — 8 NDC runs) | 175 |
| Workspace output (automation, context, discovery, test_design, pipeline) | 153 |
| NDC knowledge base entries (`APP-001/002`, `BR-001..005`, `REP-001..009`) | 16 |
| NDC inputs and assets (user stories, browser screens/components, UI screenshots) | 11 |

**What survived, and why:**

- **`knowledge_base/patterns/`** — `REPAIR-001`, `REPAIR-002`, `REASON-001`. Platform Knowledge is application-agnostic by design; it is exactly what *should* outlive a retarget.
- **Folder structure, `.gitkeep` files, templates** — so the tree stays valid for a fresh install.

---

## 10. Documentation

| Document | Status |
|---|---|
| [`README.md`](../README.md) | rewritten for the installable model — §16 Quick Start and §17 Getting Started now lead with `npx agentic-testing init`; 783 → 844 lines |
| [`pipeline.md`](../workflows_and_pipelines/pipeline/pipeline.md) | +478 lines — "Single Project Root" replaced by the two-root contract (new §13) |
| [`run_manager.md`](../workflows_and_pipelines/pipeline/run_manager.md) | ±239 lines — explicit git repository, deterministic naming |
| [`run_scope.md`](../workflows_and_pipelines/pipeline/run_scope.md) | ±50 lines |
| All three named workflows | updated for the two-root model |
| Every layer README | updated for skills naming, the relocated knowledge layer, and the new tooling |
| [`platform_paths/README.md`](../platform_core/tools/platform_paths/README.md) | **new** — the two-root contract in full |
| [`mcp/README.md`](../platform_core/tools/mcp/README.md) | **new** — both servers and their usage contract |
| [`USER_GUIDE.md`](USER_GUIDE.md) | **new** — task-oriented walkthrough |
| [`PROMPT_HISTORY.md`](PROMPT_HISTORY.md) | **new** — every prompt, question, answer, and its impact |
| `BRANCH_COMPARISON.md` | **new** — this document |

---

## 11. Side-by-side matrix

| Dimension | `main` | `Project_owns_package` |
|---|---|---|
| **Distribution model** | clone and work inside it | `npx agentic-testing init` **or** git clone + `init.sh`/`init.ps1` |
| **Project relationship** | platform hosts the project | project hosts the platform |
| **Hosted projects** | 3 + template | 0 |
| **Automation destination** | inside the platform | the target project's own test dirs, in its conventions |
| **Path model** | single project root | **two roots** — Tool Root / Target Root, enforced |
| **Write safety** | none needed | fail-closed allowlist + non-overridable read denylist |
| **git** | derived | explicit: `tool-repo` (default) · `host-repo` · `off` |
| **Skill count** | 6 `*-agent` | 7 `*-skill` (Manual Execution added) |
| **Skill invocation** | pipeline order only | direct call, with degraded-run and approve-and-recommend semantics |
| **Knowledge layer** | `platform_core/knowledge/` | `platform_core_data/knowledge_base/patterns/` |
| **MCP servers** | none | `playwright` + `context7` |
| **Browser default** | headed | **headless**, both mechanisms — except Stage 4 (Manual Execution), headed since 2026-07-27 |
| **Stack awareness** | none | detects stack, pinned versions, test dirs, conventions |
| **Doc currency** | model's training data | Context7, pinned per dependency version |
| **Greenfield** | unsupported | test infrastructure scaffolding |
| **Tests** | 0 | 260 assertions across 18 files |
| **JS files** | 24 | 50 |
| **Tracked files** | 779 | 152 |
| **CLI** | none | `init` · `detect` · `doctor` · `upgrade` · `uninstall` |

---

## 12. What did not change

Worth stating plainly, because the file counts above suggest a rewrite. The platform's actual *governance model* is untouched — this branch changed where the platform lives and how it is delivered, not what it does or who authorizes it.

| Preserved | Detail |
|---|---|
| **The seven-stage pipeline** | same stages, same fixed order, same artifact handoff contracts. No stage added, removed, or reordered |
| **Two gate types** | "Human Review Required" (Stages 1–4) and "Automation Approval Required" (Stage 5) remain distinct risk classes |
| **No gate ever times out** | silence is still not consent (`pipeline.md` §5.3, §6 Rule 6) |
| **Only Stage 1 reads the PRD** | still enforced structurally, not by convention (`pipeline.md` §6 Rule 4) |
| **Immutable runs** | a run is never edited after the fact; a correction is a new run |
| **Workspace vs. Runs** | current-approved state and per-run history remain two distinct trees |
| **Two-layer Knowledge Architecture** | Platform Knowledge resolved first, then Project Knowledge; Promotion still human-gated. Only the *location* moved |
| **Human vs. engineering decision boundary** | the same list of what interrupts you and what doesn't (`pipeline.md` §5.5) |
| **Framework independence** | discovery tooling and automation tooling remain unrelated axes; the Framework Decision Gate still asks every run |
| **Multi-package registry** | a project still holds independent Automation Packages side by side, per framework |
| **Repair Loop + Confidence Engine** | unchanged, including the rule that no repair happens without explicit approval |
| **Three separate health figures** | Application / Automation / Environment Health are still never merged into one "Failed" count |
| **Credentials never committed** | `credentials.json` git-ignored by two overlapping rules; never in an MCP tool argument |
| **Skill behavior** | the ~1,050 removed lines were *duplicates* of the spec sections above them, diffed first so unique rules were merged rather than dropped |
| **The seven skills' responsibilities** | each still owns exactly one stage and communicates only through declared artifacts |

The one genuine behavioral addition is direct skill invocation ([§8](#8-invocation-model)) — and even that was deliberately designed to *preserve* the approval gate rather than route around it.

---

## Known open items

One, deferred by explicit decision rather than overlooked:

**`platform_core_data/NDC_Previous_used_helper_docs_tobe_delete/`** — 8 NDC input documents (`PRD.md`, `PRD_UserStories.md`, `architecture.md`, `automation_framework.md`, `glossary.md`, `onboarding.md`, `reference_automation_project.md`, `run_configuration.md`) still sit in a folder named for its own deletion.

Deleting it leaves `platform_core_data/` with no `PRD.md` or `run_configuration.md` — which Stage 1 declares as **required inputs**. The recommendation was to delete and recreate them as blank scaffolds; the decision was to leave the folder for later handling ([`PROMPT_HISTORY.md` Q16](PROMPT_HISTORY.md)).

**Consequence:** a self-hosted run against this repository has no PRD at the path Stage 1 expects. This does not affect installed usage — `init` scaffolds blank input documents into the target project independently.

**To close it:** delete the folder and add blank `PRD.md` + `run_configuration.md` scaffolds at `platform_core_data/`, or move those 8 documents to `examples/` as the worked reference they effectively are.

---

## 14. Migration notes

### If you used the `main` model

Your project lived under `projects/<name>/`. To move to this branch:

1. Note your project's `PRD.md`, `run_configuration.md`, and other input docs from `projects/<name>/`.
2. Run `npx agentic-testing init` **in your application's own repository**.
3. Copy those input documents into `agentic-testing-tool/platform_core_data/`.
4. Copy your `browser/profile.json` and re-create `credentials/credentials.json` from the template — never commit it.
5. Move generated automation into the project's own test directory; confirm `target.writeAllowlist` covers it, or Stage 5 will keep generating inside `platform_core_data/`.
6. Run `npx agentic-testing doctor` to confirm both roots resolve as intended.

Run history under the old `projects/<name>/artifacts/runs/` does not migrate — it is immutable by design. Keep it on the `main` branch, where the paths its manifests cite still exist.

### If you are starting fresh

Follow [`USER_GUIDE.md` §1](USER_GUIDE.md#1-install). Nothing here applies to you.

### Verifying the branch

```bash
npm test                 # 260 assertions
npm run selftest         # doctor against this repo
npm run test:e2e         # fixture install verification
npm run detect           # read-only stack report
```
