# Migration Report — Platform v2 (2026-07-29)

**Status:** Complete, **not committed**. Awaiting final human review.
**Scope:** Architecture evolution from a project-centric repository into a reusable platform package.
**Tests:** 96 passing, 0 failing (`npm test`).

---

## 1. Architecture Summary

### Before

Five layers with two structural problems. `platform_core/` held both reusable tooling **and** a
Platform Knowledge tree that mirrored the project's own knowledge tree category-for-category. Skill
specifications named concrete tools (including a Playwright MCP server) in their own prose, embedded
their own environment requirements, and implied a forward handoff to the next stage. Every path was
written as a literal `platform_core_data/…`, hardcoded in two tools and ~40 documents.

### After

Two concerns, one wire between them.

| | Owns | Never contains |
|---|---|---|
| **Capability** — `.claude/skills/`, `workflows_and_pipelines/`, `platform_core/` | what the platform can *do*: Skill behavior, orchestration, Tools, Prerequisites | project content, runtime knowledge, a project directory name |
| **Project Data** — `{{PROJECT_ROOT}}/` | one application: inputs, **all** knowledge, workspace, runs, generated output | Skill logic, stage sequencing, tool code |

`platform.config.json` is the only wire: it names the project root, the generated-output directory, and
the active Browser Provider. That is why retargeting is now a one-value change.

**Five architectural shifts:**

1. **Agent → Skill.** Seven folders renamed; terminology updated across every live document.
2. **Skills never invoke Skills.** Each is independently executable; the orchestration layer owns order.
3. **One knowledge tree, under project data.** Category is the folder; layer is `scope:` frontmatter.
4. **Capability prerequisites replace embedded tool names.** Declared once, referenced by ID.
5. **The project root is an input, not a constant.** Resolved dynamically; enforced by test.

---

## 2. Migration Summary — objective by objective

| # | Objective | Status | Notes |
|---|---|---|---|
| 1 | Skills — rename every Agent | ✅ Done | 7 `git mv`s, history preserved; all references, diagrams, READMEs, changelog updated |
| 2 | Manual Skill execution | ✅ Done | `pipeline.md` §15 + `## 0. Independent Execution Contract` in all 7 Skills |
| 3 | Project Context owns initialization | ✅ Done | `pipeline.md` §14 + `project-context/SKILL.md` §2.1 |
| 4 | Delete `platform_core/knowledge` | ✅ Done | Folder removed; 19 documents `git mv`d into project data; promotion metadata preserved |
| 5 | Redesign knowledge hierarchy | ✅ Done | `business/` + `patterns/` per your tree; `confidence/` correctly omitted |
| 6 | `ProjectContext.v1.md` | ⏸ **Deferred** | Requested scope exists nowhere in this repo — your decision: wait for the PRD |
| 7 | MCP prerequisites model | ✅ Done | `platform_core/prerequisites/` — 7 documents + `pipeline.md` §13 |
| 8 | Playwright CLI integration | ✅ Done | Browser Provider abstraction; MCP removed; functionality unchanged |
| 9 | Generated output | ✅ Done | Configurable, isolated, gitignored |
| 10 | Git ignore ownership | ✅ Done | Marker-delimited managed block; credential + source rules untouched |
| — | Platform independence | ✅ Done | `project_paths` + `{{PROJECT_ROOT}}` notation; enforced by test |

---

## 3. Changed Files

### New (23)

| Path | Purpose |
|---|---|
| `platform.config.json` | project root · generated-output dir · Browser Provider |
| `platform_core/tools/project_paths/index.js` | the path-resolution layer |
| `platform_core/tools/project_paths/platform.config.schema.json` | config schema |
| `platform_core/tools/project_paths/README.md` | platform-independence contract |
| `platform_core/tools/project_paths/__tests__/projectPaths.test.js` | 10 tests |
| `platform_core/tools/browser_provider/index.js` | the Browser Provider interface |
| `platform_core/tools/browser_provider/interface.md` | provider contract + capability matrix |
| `platform_core/tools/browser_provider/providers/playwright_node/index.js` | node provider registration |
| `platform_core/tools/browser_provider/providers/playwright_cli/index.js` | CLI provider |
| `platform_core/tools/browser_provider/__tests__/browserProvider.test.js` | 9 tests |
| `platform_core/prerequisites/README.md` | the prerequisites model |
| `platform_core/prerequisites/PREREQ-{NODE,GIT,BROWSER-PROVIDER,PLAYWRIGHT,JAVA,CONTEXT7,SPREADSHEET}.md` | 7 declarations |
| `platform_core_data/knowledge/README.md` | knowledge layer contract + metadata standard |
| `platform_core_data/knowledge/INDEX.md` | full catalog + migration mapping |
| `docs/MIGRATION_REPORT_2026-07-29.md` | this document |

### Modified (29)

`README.md` · `docs/README.md` · `docs/CHANGELOG.md` · `.claude/README.md` ·
`platform_core/README.md` · `.gitignore` · `package.json` ·
`workflows_and_pipelines/README.md` · `pipeline.md` · `run_manager.md` · `run_scope.md` ·
`workflows/{first_run,user_story_run,bug_fix_run}.md` ·
`platform_core/tools/run_manager/{migrate.js,cli.js,runFolderIndex.js,__tests__/migrate.test.js}` ·
`platform_core_data/{README,architecture,automation_framework,glossary,onboarding,reference_automation_project,run_configuration}.md` ·
`platform_core_data/{browser,credentials,resources}/README.md` ·
`platform_core_data/resources/requirements/user_stories/Q2-CORE-WT1-T3002-066_*.md`

Plus all 7 `SKILL.md` files (tracked as renames with modifications).

### Deleted (17)

`platform_core/knowledge/**` — `INDEX.md`, `README.md`, and 6 `.gitkeep` placeholders.
`platform_core_data/knowledge_base/**` — `INDEX.md` and 9 `.gitkeep` placeholders.

Both directories are gone. Every document they held was moved, not deleted.

---

## 4. Renamed Folders

### Skills (7)

| Was | Now |
|---|---|
| `.claude/skills/project-context-agent/` | `.claude/skills/project-context/` |
| `.claude/skills/explorer-agent/` | `.claude/skills/explorer/` |
| `.claude/skills/test-design-agent/` | `.claude/skills/test-design/` |
| `.claude/skills/manual-execution-agent/` | `.claude/skills/manual-execution/` |
| `.claude/skills/automation-agent/` | `.claude/skills/automation/` |
| `.claude/skills/automation-execution-agent/` | `.claude/skills/automation-execution/` |
| `.claude/skills/reporting-agent/` | `.claude/skills/reporting/` |

### Tools

| Was | Now |
|---|---|
| `platform_core/tools/browser_driver/` | `platform_core/tools/browser_provider/` |
| `browser_driver/driver.js` | `browser_provider/providers/playwright_node/driver.js` |
| `browser_driver/api.js` | `browser_provider/providers/playwright_node/session.js` |

### Knowledge

| Was | Now | Scope |
|---|---|---|
| `platform_core/knowledge/repair_patterns/REPAIR-*.md` | `knowledge/patterns/repair/` | `platform` |
| `platform_core/knowledge/reasoning/REASON-*.md` | `knowledge/patterns/reasoning/` | `platform` |
| `platform_core/knowledge/{automation,diagnosis,execution,framework}_patterns/`, `reporting/` | `knowledge/patterns/{…}/` | — |
| `platform_core/knowledge/pipeline_decision_patterns/` | **dropped** — no reader, no promotion source | — |
| `knowledge_base/repair/REP-*.md` | `knowledge/patterns/repair/` | `project` |
| `knowledge_base/{automation,diagnosis,execution}/` | `knowledge/patterns/{…}/` | — |
| `knowledge_base/business_rules/BR-*.md` | `knowledge/business/rules/` | `project` |
| `knowledge_base/application/APP-*.md` | `knowledge/business/rules/` | `project` |
| `knowledge_base/{ui,findings,lessons_learned}/` | `knowledge/business/{…}/` | — |
| — | `knowledge/business/{requirements,api}/` (new) | — |

All 29 renames were performed with `git mv` and are tracked as renames — full history intact.

---

## 5. Compatibility Notes

**Nothing about the pipeline's behavior changed.** Seven stages, their order, both gate types, the
Automation Asset Lifecycle, the Run Scope model, and every Skill's Inputs/Outputs are untouched.

| Area | Compatibility |
|---|---|
| **Existing runs** | Untouched. `runs/**` is immutable (ADR-001) and keeps its original paths, filenames, and "Agent" vocabulary. The run-folder compatibility index still resolves legacy `RUN-YYYYMMDD-XXX` names. |
| **Existing workspace artifacts** | Untouched. Approved artifacts keep their current locations and names. |
| **Knowledge IDs** | Unchanged. `REPAIR-001`, `REP-001`, `BR-001`, `APP-001` all resolve; only their paths moved. Every `[[REP-00N]]` citation still works. |
| **Default project root** | `platform_core_data/`. A caller passing nothing behaves exactly as before. |
| **`platform_core/knowledge/` readers** | **Breaking.** Any external script reading that path will fail — the folder is gone. No in-repo reader remains. |
| **`browser_driver` importers** | **Breaking.** `require('.../browser_driver/api')` and the `BrowserDriver` class no longer exist. Use `require('.../browser_provider').createSession()`. |
| **Skill invocation by name** | **Breaking.** `Skill(automation-agent)` → `Skill(automation)`. The harness picked up the new names during this session. |
| **`migrate.js` API** | Extended, not broken: `migrateRuns({apply})` still works; `projectRoot` is a new optional parameter. |
| **Credential enforcement** | Both layers verified intact with `git check-ignore` after the `.gitignore` restructure. |

---

## 6. Remaining Technical Debt

| # | Item | Severity | Note |
|---|---|---|---|
| 1 | **`ProjectContext.v1.md` not authored** | Blocking objective 6 | Awaiting the Auto Suggest / Query Processing PRD |
| 2 | **Artifact-naming convention unresolved** | Medium | `pipeline.md` §7 now documents both scope-named and version-suffixed conventions and flags the choice as an open Human Decision. Documented, not silently resolved |
| 3 | **Project Initialization is specified, not implemented** | Medium | §14 and §2.1 define it precisely; no `init` tool exists yet. Recommended next build |
| 4 | **`.playwright-mcp/` still on disk (190 files)** | Low | Orphaned generated output, gitignored, untracked. Left in place rather than deleted unprompted — say the word |
| 5 | **`.claude/settings.local.json` has stale skill paths** | Low | 9 `Edit(/.claude/skills/*-agent/**)` permission grants no longer match. Untracked local state; may re-prompt on first edit of a renamed skill |
| 6 | **Two pre-existing broken links in project data** | Low | `PRD.md` → external automation repo path; `resources/README.md` → literal `URL` placeholder. Both predate this migration |
| 7 | **Prerequisite detection is not automated** | Low | Each PREREQ documents its check; no runner executes them yet |
| 8 | **`playwright-cli` provider is untested against a live suite** | Medium | Unit-tested for argument validation and capability reporting; no real `runSuite` has executed |
| 9 | **`business/{requirements,api}` are empty** | Informational | New categories with no content yet, by design |

---

## 7. Recommendations

1. **Build the Project Initialization tool** (`platform_core/tools/project_init/`) to make §14
   executable and idempotent, with the "created vs. already-present" report the spec requires. This is
   the largest remaining gap between specification and implementation.
2. **Add a prerequisite-check runner** that reads `platform_core/prerequisites/*.md` frontmatter and
   reports each `detection` result, so a Skill's preflight is mechanical rather than prose.
3. **Exercise `playwright-cli` end to end** on the existing SHAFT or a small Playwright suite, to
   confirm the generated-output redirection works against a real runner.
4. **Resolve the artifact-naming convention** (debt #2) as an explicit decision, then make `pipeline.md`
   §7 state one rule instead of two.
5. **Promote the reference-integrity validator into the repo** as `platform_core/tools/doc_validator/`
   with a test. It found 7 real broken links and several stale paths in this migration; run it in CI.
6. **Consider renaming `platform_core_data/` to something neutral** (e.g. `project/`). The name now
   describes nothing — it is one possible value of a configurable root. Purely cosmetic, deliberately
   not done here since it wasn't requested.
7. **Decide the four `promotion candidate` repair records** (`REP-004`…`REP-008`). They have been
   candidates since 2026-07-24; the PrimeNG and phone-input patterns look genuinely framework-general.

---

## 8. Risks

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| 1 | **A Skill spec still assumes a behavior its new contract forbids** — this migration touched ~4,400 lines of Skill prose mechanically | Medium | Medium | Frontmatter validated; terminology validated; §0 contract added to all 7. **Recommend a careful read of each `SKILL.md` §0–§7 before the first real run** |
| 2 | **Project Initialization is specified but unimplemented** — a reader may assume it runs | Medium | Medium | Debt #3 + Recommendation 1. Until built, the project tree is still created by hand |
| 3 | **`playwright-cli` untested live** — the config could be wrong in a way unit tests can't see | Medium | Low | Debt #8. `playwright-node` (the path in daily use) is unchanged in behavior |
| 4 | **Mechanical terminology sweep may have altered meaning somewhere** — it repaired 4 self-inflicted over-replacements mid-flight | Low | Medium | All 4 found and fixed; validator run clean afterward; historical docs excluded entirely |
| 5 | **Knowledge `scope:` can be set wrongly** — one field now carries what a directory used to enforce | Low | Medium | §10.6 keeps the human gate; a declared field is *easier* to audit (greppable) than a directory inference. Consider a lint rule |
| 6 | **An external consumer breaks** on `platform_core/knowledge/`, `browser_driver`, or an old skill name | Low | Medium | §5 lists every breaking change. No in-repo reader remains |
| 7 | **Documentation volume** — `pipeline.md` grew from 550 to ~660 lines, README to ~800 | Low | Low | New sections are self-contained (§13–§16) and cross-referenced rather than restated |

---

## 9. Future Improvements

- **A knowledge lint rule** — assert `category:` matches the folder, `scope:` is one of two values, a
  `generalizes`/`generalized_by` pair points both ways, and no `scope: platform` document names an
  application-specific noun.
- **A Skill contract schema** — validate all seven frontmatter blocks against one JSON Schema in CI, so
  a malformed `artifact_prerequisites` fails fast instead of at invocation.
- **More Browser Providers** — a Selenium or remote-grid provider would prove the abstraction. The
  interface and capability model are already designed for it; no Skill would change.
- **An orchestrator implementation** — §15 defines manual invocation and the offer-to-run flow
  precisely; nothing implements it yet. This is the natural companion to Recommendation 1.
- **Prerequisite versioning** — `PREREQ-*` documents carry a `version`, but nothing yet detects when a
  Skill was written against an older revision.
- **Multi-project support via config** — the project root is now an input, so pointing several configs at
  several roots is a small step. It would need a decision about shared vs. per-project `patterns/`.

---

## 10. Validation Results

| Check | Result |
|---|---|
| Tool tests (`npm test`) | ✅ 96 passed, 0 failed |
| Skill frontmatter parses, `name:` matches folder | ✅ 7/7 |
| No outdated Agent terminology in live specs | ✅ Clean (remaining hits are domain vocabulary, generic AI-session references, and migration notes) |
| No references to `platform_core/knowledge` | ✅ Clean (2 hits, both stating it no longer exists) |
| No references to `browser_driver` / `BrowserDriver` | ✅ 0 |
| No Playwright MCP dependency | ✅ Clean (remaining mentions document its removal) |
| Markdown link targets resolve | ✅ 7 fixed; 2 pre-existing project-data issues remain (debt #6) |
| Same-file anchors resolve | ✅ 0 broken |
| Code-fence balance across all docs | ✅ All balanced |
| Orphan / empty directories | ✅ None |
| Old skill folders removed | ✅ 7/7 |
| Credential ignore rules intact | ✅ Both layers verified with `git check-ignore` |
| Generated output ignored | ✅ Verified |
| Source files not over-ignored | ✅ Verified |

---

## 11. Human Decisions Taken During This Migration

Four architectural conflicts were surfaced before implementation and resolved by explicit decision, not
by default:

1. **`ProjectContext.v1.md` scope does not exist** → defer until the PRD is supplied.
2. **Do the knowledge layers survive the move?** → yes, as `patterns/` vs `business/` with promotion
   preserved; not a full collapse.
3. **Category mapping for six orphaned categories** → the explicit tree you specified, with `confidence/`
   omitted and `reporting/` retained.
4. **Playwright integration shape** → a Browser Provider abstraction with pluggable providers, not a
   CLI-only rewrite (which would have been a functional regression).

Five further decisions were stated as recommendations and proceeded on: rename blast radius (live specs
only), `.gitignore` ownership mechanism, the init boundary (project vs. run), the generated-output path,
and the reconciliation of "offer to auto-run missing prerequisites" with "Skills never invoke Skills"
(the orchestrator offers; the Skill only reports).

---

*No commit was made. Every change is staged in the working tree for review.*
