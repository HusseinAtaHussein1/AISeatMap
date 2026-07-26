# Prompt History — the `Project_owns_package` branch

Every prompt issued, every clarifying question asked back, every answer given, and what each one changed in the repository.

**Branch:** `Project_owns_package` · **Source branch:** `main` · **Merge base:** `c11fd8d`
**Span:** 2026-07-26 11:43 → 2026-07-27 · **8 chat sessions · 17 prompts · 12 question sets (21 individual questions) · 15 commits**

This document exists because the decisions below are not recoverable from the diff. A commit shows *what* changed; the exchanges here show *which alternatives were rejected and why* — which is the part that gets re-litigated six months later. Where an answer overrode a recommendation, that is called out explicitly.

---

## Contents

| Session | Theme | Prompts | Commits |
|---|---|---|---|
| [1](#session-1--branch-orientation) | Branch orientation | 2 | — |
| [2](#session-2--agents--skills) | Agents → Skills | 2 | `a064953`, `ca50c03` |
| [3](#session-3--mcp-server-integration) | MCP server integration | 2 | — |
| [4](#session-4--knowledge-layer-relocation) | Knowledge layer relocation | 4 | `bdc57ba` |
| [5](#session-5--headless-by-default) | Headless by default | 2 | `06ccedf` |
| [6](#session-6--direct-skill-invocation) | Direct skill invocation | 3 | `bf11533` |
| [7](#session-7--the-installable-package) | The installable package | 1 | `6fdeab1` … `e5450af` (7) |
| [8](#session-8--documentation) | Documentation | 1 | this document |

Cross-cutting analysis: [§ Decision Patterns](#decision-patterns) · [§ Impact Summary](#impact-summary)

---

## Session 1 — Branch orientation

### P1 · `need to know the current branch that i work on it now from the project repo`

**Impact:** None on the codebase. Established the working branch as `Project_owns_package`.

### P2 · `need to be on this brach .../tree/Project_owns_package`

**Impact:** Confirmed the branch target. Every subsequent commit landed here rather than on `main` — which is why `main` remains the untouched "before" state for [`BRANCH_COMPARISON.md`](BRANCH_COMPARISON.md).

---

## Session 2 — Agents → Skills

### P3 · The framing change

> `all skills should convert into skills (remove agent keyword)` … `need to do not change the logic of how they work, need to save full functionalities of them` … `also need them to be efficient structure with efficient tokens consumption`

Three requirements at once, one of which constrains the other two: reduce tokens and rename the framing, **without** changing behavior. That tension drove both questions below.

#### ❓ Q1 — The `Operational Prompt` blocks

**Asked:** ~1,050 lines of fenced `Operational Prompt` blocks restated the spec sections above them almost verbatim. Removing them was the single largest token win — but only if nothing invoked them as a literal prompt string.

| Option | |
|---|---|
| **Remove, fold in unique rules** | delete the blocks, but first diff each against the spec body and merge any rule existing *only* in the prompt back into the spec |
| Keep them verbatim | assumes an external runner reads the block as a literal prompt |

**✅ Answered:** *Remove, fold in unique rules*

**Impact — commit `ca50c03`.** ~1,050 lines removed, ~30–35% token reduction on the large skills. The diff-first step mattered: rules that existed only inside a prompt block were merged into the spec body rather than deleted with it, which is what made "no logic change" true rather than merely claimed.

#### ❓ Q2 — 458 `agent` references

**Asked:** These were two different things — the skill's own *identity* ("the Explorer Agent reads…") versus *cross-references* to sibling skills, which carry the handoff contracts.

| Option | |
|---|---|
| **Rewrite identity, keep cross-refs** | second person for self; siblings stay named as Stage N skills |
| Strip 'agent' everywhere | mechanical removal, including in handoff-contract tables |
| Leave naming as-is | pure token focus |

**✅ Answered:** *Rewrite identity, keep cross-refs*

**Impact.** The agent framing was removed without breaking the handoff contracts that name each other. A blanket find-and-replace would have destroyed the artifact-contract tables — the exact structure that makes the pipeline traceable.

### P4 · The rename was incomplete

> `still the team agent is used in the skills so why you did not remove it and rename the skill markdown file from -agent to -skill and inside the file itself`

A correction. The previous pass had cleaned prose but left folder names and `name:` frontmatter as `-agent`, so the invocation surface still read as agents. This prompt is why the rename went all the way to the invocation names.

#### ❓ Q3 — Rename scope

**Asked:** Renaming folders + `name:` frontmatter changes how a skill is invoked (`/project-context-agent` → `/project-context-skill`) and touched **361 references across 33 files**. Should historical run artifacts under `platform_core_data/runs/` be rewritten too?

| Option | |
|---|---|
| **Rename, keep run history** | rename dirs, frontmatter, and all live references; leave `runs/` untouched |
| Rename everything | rewrite past run artifacts too, so no `-agent` string survives |
| Keep folder names | prose only |

**✅ Answered:** *Rename, keep run history*

**Impact — commit `a064953`.** Past runs record what they *actually invoked*. Rewriting them would have made the run history describe a world that never ran — falsifying the audit trail to win a cosmetic consistency. This is the immutable-runs principle applied to a rename.

#### ❓ Q4 — How deep should the prose purge go?

**Asked:** `Agent` was also a proper noun for pipeline stages. Should the purge reach the Architecture Principle quote — *"Agents communicate through artifacts only"* — which `pipeline.md` §1 states verbatim as the platform's architecture rule?

| Option | |
|---|---|
| **Full purge to stage names** | `the agent` → `this skill`; `the Automation Agent` → `the Automation skill (Stage 5)`; the cited axiom survives |
| Full purge incl. axiom | rewrite the architecture principle too |

**✅ Answered:** *Full purge to stage names*

**Impact.** A cited axiom is a quotation, not vocabulary. Rewriting it would have edited the platform's own stated architecture rule to satisfy a naming convention — so it remains verbatim in `pipeline.md` §1 and in the layer READMEs that quote it.

---

## Session 3 — MCP server integration

### P5 · Register the two servers

> `need to add to the tools that in the platform_core to configure to use playwright mcp server and context7 mcp server`

### P6 · What Context7 is actually for

> `the target of context7 mcp sever will be once go for implementation of automation testing scripts from any stack need to search for the relavent upto date documentation that match with the project stack and full dependencies that match the used version for each dependency and use them as an additional guidline for the implementation`

This prompt is the one that made Context7 a *pipeline stage behavior* rather than a registered convenience. The operative words are **"match the used version for each dependency"** — not "look up the library," but pin the exact version the suite runs against.

#### ❓ Q5 — Playwright MCP vs. the existing BrowserDriver

| Option | |
|---|---|
| **Add as a second, selectable mode** | skills choose BrowserDriver (scripted, credential-aware) *or* Playwright MCP (interactive) per stage; BrowserDriver stays default for authenticated flows |
| Playwright MCP becomes primary | larger change to explorer + manual-execution |
| Config/registration only | no behavior change |

**✅ Answered:** *Add as a second, selectable mode*

**Impact.** Two mechanisms coexist with a documented selection rule ([`mcp/README.md` §1.2](../platform_core/tools/mcp/README.md)). The credential-handling guarantee is preserved: BrowserDriver remains the authenticated path, and §1.3 absolutely prohibits a credential value in any MCP tool call, since tool arguments are transcript-visible.

#### ❓ Q6 — Where the doc-lookup step lives

Three options were offered (a step inside `automation-skill`; a shared `platform_core` tool; both stages with cached artifacts).

**✅ Answered — free-text, not one of the options:**

> *"in the implementation of the automation scripts stage should investigate the project stack and extract it from the project source code and documentation and if shared with the tool in the platform core or platform core data then use context7 mcp server to use the related documentation references"*

**Impact.** A **conditional** design none of the three options captured: extract the stack from the target project's own source and documentation *first*, and consult Context7 only for what that extraction actually found. Built as [`platform_core/tools/mcp/stack_docs/`](../platform_core/tools/mcp/stack_docs/) — `detectStack.js` reads manifests and lockfiles, `planQueries.js` plans version-pinned lookups. Documentation is fetched for versions in evidence, never for a guessed dependency set.

---

## Session 4 — Knowledge layer relocation

### P7 · Move patterns out of `platform_core`

> `the platform core contains knowledge folder with subfolders for set of patterns need to move them under the platform core data under patterns folder will contains full these subfolders and remove the knowledge from the platform core`

#### ❓ Q7 — Which target path?

**Asked:** There was no `platform_core/data/` folder — only the sibling `platform_core_data/`. Flagged that option 2 **merges the Platform Knowledge layer into the Project Data layer, collapsing the two-layer split the docs describe**.

**✅ Answered:** *"patterns will be under the existing folder `platform_core_data`"* — the flagged option, chosen with the concern stated.

**Impact.** `platform_core/knowledge/` → `platform_core_data/patterns/`. `platform_core/` became Tools-only. The two-layer *semantics* were preserved in the documentation even though the folders now nest — which is why every layer README now states that the nesting is **structural only, not semantic**.

#### ❓ Q8 — Update the docs that reference the old path?

**✅ Answered:** *Update all references (Recommended)*

**Impact.** Every `platform_core/knowledge/` reference rewritten across the root README, three layer READMEs, `pipeline.md`, and the skill files, plus a CHANGELOG entry. The alternative would have left the documentation pointing at a path that no longer existed.

### P8 · One more level of nesting

> `now need to move the patterns to be under the lnowledge_base folder that under platform_core_data also need the diagnoisis folder that under the knowledege_base folder to be under patterns folder`

#### ❓ Q9 — Nesting, and where `diagnosis/` lands

**Asked:** This put the Platform layer *inside* the Project layer. Offered nesting-as-is versus fully merging the two layers — which would have **ended the two-layer Knowledge Architecture and the Promotion Workflow entirely**.

**✅ Answered:** *"there is an knowledge_base folder inside the plateform_core_data need this to contain also the patterns folder and make the existing diagonisis folder … to be under knowledge_base/patterns/diagonisis"* + *As patterns/diagnosis/*

**Impact — commit `bdc57ba`.** Final location: `platform_core_data/knowledge_base/patterns/`. The Promotion Workflow survived. Because the physical nesting now contradicts the logical separation, three guarantees had to be stated explicitly in the docs rather than implied by the folder layout:

1. `patterns/` resolves **first**, before the surrounding `knowledge_base/` folders (`pipeline.md` §10.2)
2. it is written to **only** through Promotion (§10.5)
3. nothing application-specific may enter it — the Isolation Guarantee (§10.6)

`diagnosis/` moved from the Project layer into `patterns/`, so application-specific diagnosis notes now belong in the `repair/` record that consumed them, or in `findings/`.

### P9 · `commit to github` → ### P10 · `commit to github to the branch project_owns_package`

**Impact.** P9 was under-specified; P10 named the branch. Committed as `bdc57ba` to `Project_owns_package`.

---

## Session 5 — Headless by default

### P11 · `need when run the explore skill using the playwright mcp server or the other option to run them in headless mode as default option`

#### ❓ Q10 — How wide should the default go?

**✅ Answered:** *Both mechanisms (Recommended)*

**Impact — commit `06ccedf`.** `--headless` on the playwright MCP server in `.mcp.json`, **and** `browser.headless: true` in `platform_core_data/browser/profile.json`. Headed became an explicit opt-in. The point of doing both: a default that only holds for one of two mechanisms isn't a default — it's a coin flip decided by which mode a stage happened to select.

### P12 · `commit to the github project_owns_package branch`

---

## Session 6 — Direct skill invocation

### P13 · `need to can trigger the skills manually to can call any skill direct not only through the full pipline`

### P14 · The clarification that redefined the problem

> `not mean the registeration, i mean if i run a skill then it finish it's tasks then it will wait for approve before start the next skill via approve statment at this point need to not only depend on approve need to can call the required skill via command and can use it direct or with add instruction prompt with it`

The first prompt was read as a *registration* question. This correction reframed it as an **authorization** question: the blocker wasn't discoverability, it was that the approval statement was the only path forward. This is the most consequential correction in the branch — it changed the work from "document how to invoke skills" to "define what authorizes a stage to run."

#### ❓ Q11 — Bypass rule, and missing inputs

**Asked (part 1):** When a skill is called directly while the upstream checkpoint is still `Pending Review`, what should happen? Recommended *"Run it, disclose the bypass — the direct call IS the authorization."*

**✅ Answered — overriding the recommendation:**

> *"in case for pending for review will ask for approve then recommend in the message the next step skill and action for the user to can call the required skill"*

**Impact — commit `bf11533`.** A **third** behavior neither offered nor recommended: rather than treating the direct call as implicit authorization, the skill asks for approval **and then recommends the next skill and action**. This keeps the approval gate meaningful — a direct call cannot quietly become a way to launder an un-reviewed artifact downstream — while removing the thing that was actually painful: being stopped without being told what to do next. The recommended option would have made every direct call a silent gate bypass.

**Asked (part 2):** Should a direct call be allowed when the upstream artifact doesn't exist at all?

**✅ Answered:** *Yes — run degraded, declare the gap (Recommended)*

**Impact.** The skill runs on whatever inputs exist, lists what was missing, and marks affected output sections as gaps — matching how `explorer-skill` already handles fallback Discovery Modes. Note the resulting asymmetry, which is deliberate: **un-approved** still requires approval, **absent** runs degraded. An existing-but-unreviewed artifact is a governance question; a missing one is a coverage question.

### P15 · `commit to github project_owns_package branch`

---

## Session 7 — The installable package

### P16 · The largest change in the branch

> `need to make this agentic testing tool to be like a tool that can install it and add it to the project and run its processes on the existing brown field project direct and if added an automation scripts will add them on the found project structure and stack direct like what happenes when try to use spec-kit as a reference, not will place the full project under projects folder in platform as before, also need to can use it to build new greenfield projects using this agentic testing tool`

One prompt, an architectural inversion. Before: projects were copied *into* the platform under `projects/`. After: the platform installs *into* the project. Five question sets and seven commits followed.

#### ❓ Q12 — Install route · artifact location · brownfield aggressiveness · self-hosted example

**Four questions, four answers, two of which overrode the recommendation:**

| Question | Recommended | ✅ Answered | Override? |
|---|---|---|---|
| Install route | npx CLI init | *"need to cover two options … git clone and as an installable npm package"* | **both, not one** |
| Artifact directory | `.agentic-testing/` | `agentic-testing-tool/` | **visible, not hidden** |
| Brownfield aggressiveness | detect + write in place | *"automation scripts will added to the project codebase and the full process artifacts will in the platform_core_data and runs"* | confirmed + split |
| Keep the hosted example? | move to `examples/` | *Move to `examples/`, keep as fixture* | no |

**Impact.**
- **Both install routes** — `bin/agentic-testing.js` plus `scripts/init.sh` / `scripts/init.ps1`, sharing one implementation. `scripts/verifyPackable.js` runs at `prepack` to guarantee the npm tarball and the clone stay byte-identical, because two routes that drift are worse than one route.
- **A visible folder** — `agentic-testing-tool/`, not a dotted directory. QA artifacts stay discoverable rather than hidden from anyone who doesn't know to look.
- **The clean split** — automation code goes into the host project's own structure; every *process* artifact stays under the tool's `platform_core_data/`. This is the sentence the entire two-root contract implements.

#### ❓ Q13 — Nesting ambiguity, and greenfield scope

**Asked:** The previous answer said artifacts go in `agentic-testing-tool/` *and* "in platform_core_data and runs" — two readings.

**✅ Answered:** *`agentic-testing-tool/platform_core_data/`* + *Scaffold test infra only*

**Impact.** One folder at the host root owns everything the tool owns. Greenfield mode scaffolds the test directory, framework config, and one example smoke test — never the application itself. Staying out of application scaffolding kept the tool a *testing* tool.

#### ❓ Q14 — 176 path literals, and git mode

**Asked:** A design finding — the 176 `platform_core_data/...` path strings in the skills **don't need rewriting**. After install, `agentic-testing-tool/platform_core_data/PRD.md` makes those paths already correct relative to the tool folder. Only the resolution rule needs stating once.

**✅ Answered:** *Leave literals, state rule once* + *`tool-repo`: nested git repo*

**Impact — commits `6fdeab1`, `451341e`, `1652f20`.**
- **Zero of 176 literals rewritten.** Four documents amended instead to define Tool Root and Target Root (`pipeline.md` §1, §1.1, Rule 9, and a new §13). Templating them as `{{DATA_ROOT}}` would have introduced a constant masquerading as a variable across 3,422 lines of prose — and the audit had already found one stale path left by an earlier manual migration, which is direct evidence of the drift risk.
- **`tool-repo` git mode** — the tool folder gets its own nested repo, the host ignores it. Baseline merge protection always works and **zero commits ever land in host history**. The rejected `auto` mode would have silently disabled merge protection whenever a host gitignored the tool folder — a safety guarantee that quietly evaporates is worse than one that was never offered.

#### ❓ Q15 — Purging prior-experiment data

**Asked:** Three groups of NDC data were found. Multi-select.

**✅ Answered — all three:** *Generated output only* **+** *NDC knowledge base entries* **+** *NDC inputs and assets*
**And:** root docs → *Keep as-is*

**Impact — commit `b31a7a5`.** ~340 files deleted: 175 under `runs/`, 153 under `workspace/`, 16 knowledge base entries, 11 NDC inputs and assets. `knowledge_base/patterns/` survived — Platform Knowledge is application-agnostic by design, so `REPAIR-001/002` and `REASON-001` are exactly what *should* outlive a retarget. Folder structure, `.gitkeep` files, and templates were kept, so the tree stays valid for a fresh install.

#### ❓ Q16 — The moved NDC docs

**Asked:** 8 NDC input docs had been moved into `platform_core_data/NDC_Previous_used_helper_docs_tobe_delete/`. Deleting the folder leaves no `PRD.md` or `run_configuration.md` — which Stage 1 declares as required inputs. Recommended deleting and recreating them as blank templates.

**✅ Answered:** *Leave the folder as-is for now* — "you'll deal with it yourself later."

**Impact.** The folder remains in the tree, still named `NDC_Previous_used_helper_docs_tobe_delete/`. **This is the one knowingly-open item on the branch**, deferred by explicit decision rather than overlooked — see [`BRANCH_COMPARISON.md` § Known Open Items](BRANCH_COMPARISON.md#known-open-items).

### Commits from this session

`6fdeab1` two-root resolver · `691dff5` stack/convention detection · `1652f20` explicit git repository · `451341e` two-root contract in pipeline.md · `fdb611d` plan-then-apply installer with additive merging · `8b88dd5` installable package · `e5450af` install documentation

---

## Session 8 — Documentation

### P17 · This document's own prompt

> `update the all readme files in the project with add user_guide.md file and add markdown file that contains all prompts that used in all chat session in this project and all asked questions from you and all me answers and the impact of each of them for prompts and questions and answers` … `and a markdown file that compare between the full project before and after the full edits and refactores that done in this branch vs the source branch of this branch`

**Impact.** Three new documents — [`USER_GUIDE.md`](USER_GUIDE.md), this file, and [`BRANCH_COMPARISON.md`](BRANCH_COMPARISON.md) — plus README updates across every layer to link them and correct naming left stale by the Session 2 rename.

---

## Decision Patterns

Six recurring themes across the 21 questions. They read as this project's implicit design constitution.

### 1. Never falsify history to gain consistency

Q3 kept `-agent` strings in past run artifacts. Q15 deleted generated output but kept `patterns/`. Immutable history is worth more than a clean grep.

### 2. Physical structure may nest; logical layers may not merge

Q7 and Q9 both moved the Platform Knowledge layer deeper into the Project layer, and both times the *layer separation* was preserved in the specification rather than in the folder tree. This is why the docs now say "the nesting is structural only, not semantic" — the guarantee had to move from implicit (folder layout) to explicit (§10.2, §10.5, §10.6).

### 3. Fail closed on anything that writes outside the tool

Fail-closed `writeAllowlist`; `targetRoot` never inferred at runtime; a non-overridable read denylist; `configVersion` mismatch as a hard error; `auto` git mode rejected. Every one of these prefers a loud stop over a silent guess about writing into someone else's repository.

### 4. Two mechanisms with a documented rule beats one mechanism by decree

Q5 (BrowserDriver + Playwright MCP) and Q12 (npm + git clone) both took "both, with a rule" over "pick one." Neither doubled the surface area, because a single implementation backs each pair.

### 5. Recommendations were overridden four times — and each override was better-informed

| Question | Recommended | Chosen | Why the override held |
|---|---|---|---|
| Q11 bypass | direct call = authorization | ask, then recommend next step | keeps the gate real; fixes the actual pain (not knowing what's next) |
| Q12 install | npx only | npm **and** clone | offline and air-gapped users exist |
| Q12 artifact dir | `.agentic-testing/` | `agentic-testing-tool/` | QA artifacts should be discoverable, not hidden |
| Q16 NDC docs | delete + blank templates | leave for now | keeps a real input example while the branch is in flux |

The pattern: the recommendations optimized for *architectural tidiness*; the overrides optimized for *how the tool is actually used*.

### 6. Corrections drove the two largest changes

P4 ("why did you not rename the files") turned a prose cleanup into a full rename of the invocation surface. P14 ("not mean the registeration") turned a discoverability question into the authorization model. Both times the first reading of the prompt was too narrow, and the correction — not the original prompt — set the real scope.

---

## Impact Summary

| Prompt | Change | Commit(s) |
|---|---|---|
| P1–P2 | branch orientation | — |
| P3 | ~1,050 duplicate lines removed; agent identity rewritten | `ca50c03` |
| P4 | folders + frontmatter + 361 references renamed `-agent` → `-skill` | `a064953` |
| P5–P6 | two MCP servers registered; version-pinned stack-doc extractor | — |
| P7–P8 | `platform_core/knowledge/` → `platform_core_data/patterns/` | — |
| P9–P10 | → `knowledge_base/patterns/`; `diagnosis/` relocated | `bdc57ba` |
| P11–P12 | headless default on both browser mechanisms | `06ccedf` |
| P13–P15 | direct skill invocation: approve-and-recommend, degraded runs | `bf11533` |
| P16 | installable package: two-root architecture, installer, detection, purge | `6fdeab1` `691dff5` `1652f20` `451341e` `fdb611d` `8b88dd5` `e5450af` `b31a7a5` |
| P17 | user guide, prompt history, branch comparison, README updates | this change |

**Net:** 843 files changed · +16,182 / −49,736 lines · 779 → 152 tracked files.

The line counts are dominated by two things pulling in opposite directions: ~49,000 deletions from purging the `projects/` tree and the NDC experiment data, and ~16,000 insertions that are mostly *new executable tooling* — the installer, the two-root resolver, the stack detector, the automation lifecycle tools, and their tests. The branch traded a large body of one application's accumulated artifacts for a small body of reusable, tested code.
