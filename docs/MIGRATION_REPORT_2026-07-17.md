# Repository Structural Refactor — Migration Report

**Date:** 2026-07-17
**Scope:** Repository-wide cleanup (prompts/, .gitignore, root docs, agent changelogs) + NDC-specific project restructuring. No pipeline behavior, agent behavior, or business logic was changed — this was a structural refactor only, as scoped.

Nothing in this refactor has been committed. All changes are in the working tree for review.

---

## 1. Renamed directories

| Before | After | Notes |
|---|---|---|
| `projects/NDC/artifacts/runs/` | `projects/NDC/runs/` | Extracted to be a sibling of `workspace/`, not nested inside it — matches "runs are immutable history, workspace is current state." |
| `projects/NDC/artifacts/` | `projects/NDC/workspace/` | NDC-specific override. The platform-wide `projects/{{PROJECT_NAME}}/artifacts/` convention used by every other project (OrangeHRM, the template, future projects) is **unchanged** — see §7. |

Git detected 205 of the file movements inside these two renames as tracked renames (not delete+add), so blame/history is preserved.

## 2. New folders created

| Folder | Reason |
|---|---|
| `docs/` | Destination for the four root docs (see §4) + the new changelog. |
| `projects/NDC/config/` | Per your requested structure; empty, holds a `.gitkeep`. |
| `projects/NDC/resources/Records/` | New, empty (`.gitkeep`). |
| `projects/NDC/resources/TestData/` | New, empty (`.gitkeep`). |
| `projects/NDC/resources/Documents/` | New, empty (`.gitkeep`). |
| `projects/NDC/workspace/test_design/{Login,Branch,Agency,Staff}/` | Module-based reorganization (see §5). |
| `projects/NDC/workspace/automation/{shaft,playwright}/` | Framework-based reorganization (see §6). |

**`resources/Screenshots/` was NOT created as a separate folder** — this filesystem is case-insensitive, and `projects/NDC/resources/screenshots/` already exists. Attempting to create `Screenshots/` resolved to the same directory (verified: a test file written via the `Screenshots` path appeared under `screenshots`). Left as the existing lowercase folder, consistent with the platform-wide `resources/` convention used elsewhere. No action needed unless you want it renamed platform-wide, which is a separate, bigger discussion.

## 3. Deleted

- `prompts/` (all 4 files: `automation/automation_agent.md`, `exploration/explorer_agent.md`, `knowledge/knowledge_agent.md`, `testing/test_design_agent.md`) — confirmed unreferenced at runtime before deletion (verified in this conversation's earlier turn). All remaining mentions of `prompts/` in the repo are now historical prose in `docs/CHANGELOG.md`, `docs/LESSONS_LEARNED.md`, `docs/SESSION_HANDOFF.md`, and `projects/OrangeHRM/onboarding.md` — not links.

## 4. Root docs moved into `docs/`

`README.md`, `LESSONS_LEARNED.md`, `PLATFORM_VALIDATION_REPORT.md`, `SESSION_HANDOFF.md` → `docs/`.

**Judgment call:** `README.md` was *not* removed from the root — GitHub (and most Git hosts) only auto-render a root-level `README.md` as the repo landing page. A short stub now lives at the repo root pointing to `docs/README.md`, which holds the full content. If you'd rather have zero file at root, say so and I'll remove the stub — but the repo will then show no description on its GitHub homepage.

## 5. Agent changelogs extracted

All 6 `agents/*.md` files had their embedded revision-history blockquotes (`Revision note (vN)`, `Relationship to legacy prompts`, `New in this architecture`, `Update`) removed from the spec body. Each file now keeps only `Pipeline position`, `Traceability`, and a one-line pointer to `docs/CHANGELOG.md`. The full removed text was preserved verbatim in `docs/CHANGELOG.md`, organized per agent, plus a dated entry for this refactor itself.

## 6. Unrelated issue found and fixed: unresolved merge conflicts

`README.md` (now `docs/README.md`) contained **live, unresolved git merge-conflict markers** (`<<<<<<< HEAD` / `=======` / `>>>>>>> main`) in six places, despite a past commit (`e7ba18c`) titled "merge: resolve README conflict with main." The conflicting sections (repository structure diagrams, the Project Knowledge vs. Project Context table, the clone URL, a trailing whitespace diff) were resolved by keeping the side that matches the actual current repository (self-contained per-project `artifacts/`, real clone URL `ayman2911/...`). Also removed a dead `VISION.md` reference (that file doesn't exist anywhere in the repo) and the stale `prompts/` line from the directory diagram. Verified zero conflict markers remain anywhere in the repository.

## 7. NDC `workspace/` vs. platform `artifacts/` — scope decision

Per your explicit answer: this is an **NDC-only override**, not a platform-wide rename. The `{{PROJECT_NAME}}/artifacts/` convention hardcoded 151 times across 17 platform files (all `agents/*.md`, `pipeline/*.md`, `workflows_and_pipelines/workflows/first_run.md`, `projects/templates/project_template/`) is **untouched** and remains correct for OrangeHRM, the template, and any future project. NDC's own docs (`onboarding.md`, `README.md`) now explicitly document the exception so nobody assumes it's the default.

## 8. `workspace/test_design/` — module reorganization

No top-level `test_design/` existed before (test design artifacts only ever lived inside individual runs). Per your approval, the latest-approved files were **copied** (not moved) out of their originating run into the new module layout — originals remain untouched in `runs/`:

| Destination | Copied from | Files |
|---|---|---|
| `workspace/test_design/Login/` | `runs/RUN-20260712-001/test_design/` | `NDC_CoverageReport.md`, `NDC_LoginGapAnalysis.md`, `NDC_TestCases_Login.md`, `NDC_TestCases_Login.xlsx`, `NDC_TraceabilityMatrix.md` |
| `workspace/test_design/Agency/` | `runs/RUN-20260712-002/test_design/` | `NDC_TestCases_Agency.md`, `.xlsx` |
| `workspace/test_design/Branch/` | `runs/RUN-20260712-002/test_design/` | `NDC_TestCases_Branch.md`, `.xlsx` |
| `workspace/test_design/Staff/` | `runs/RUN-20260712-002/test_design/` | `NDC_TestCases_Staff.md`, `.xlsx` |
| `workspace/test_design/` (root) | `runs/RUN-20260712-002/test_design/` | `NDC_CoverageReport.md`, `NDC_TraceabilityMatrix.md` — combined Agency+Branch+Staff document, kept at root per your answer rather than duplicated into all 3 module folders |

Added `workspace/test_design/README.md` documenting this provenance so a future engineer knows these are copies and where the source-of-truth run is.

## 9. `workspace/automation/` — framework reorganization

Per your answer ("registry only, no duplication"): the real generated code — Playwright's `NDC_tests/` and SHAFT's `NDC_tests_SHAFT/` (438MB including `target/`, `.idea/`, `allure-results/`, report zips) — was **not** copied anywhere. It stays exactly where it was generated, inside `runs/RUN-20260712-001/automation/`.

- `workspace/automation/shaft/README.md` and `.../playwright/README.md` are pointer-only documents naming the exact run path where each framework's real code lives.
- `NDC_AutomationPackages.md` (the registry) moved with the rest of `artifacts/` → `workspace/` and had its internal paths updated to the new `runs/` location.

## 10. All path references updated (outside immutable runs/)

Files edited to reflect the renames: `projects/NDC/README.md`, `onboarding.md`, `run_configuration.md`, `automation_framework.md`, `resources/README.md`, `workspace/pipeline/NDC_RunManifest.md` (21 occurrences), `workspace/discovery/UI_Baseline_Screen_Inventory.md`, `workspace/discovery/findings/FINDING-004.../metadata.md`, `workspace/test_design/NDC_CoverageReport.md` (the new copy). Also fixed two unrelated but real broken relative links discovered during validation: `projects/OrangeHRM/README.md` and `projects/OrangeHRM/onboarding.md` linked to `../../SESSION_HANDOFF.md` / `../../LESSONS_LEARNED.md`, which broke when those files moved to `docs/`.

## 11. Known, intentional exceptions — stale paths left inside immutable runs/

Per "never modify anything inside `runs/`," the following files still say `projects/NDC/artifacts/...` in their own historical prose, and were deliberately **not** edited:

- `runs/RUN-20260712-002/execution/NDC_ExecutionResults.md`
- `runs/RUN-20260712-002/automation/NDC_AutomationSummary_SHAFT.md`, `NDC_AutomationManifest_SHAFT.md`, `NDC_AutomationPlan_SHAFT.md`
- `runs/RUN-20260712-002/test_design/NDC_CoverageReport.md` (line 92 — a relative link `../context/...` that resolved correctly under the old nested layout but no longer does, since `context/` moved out from being a sibling of `runs/`)
- `runs/RUN-20260712-001/automation/NDC_AutomationSummary_SHAFT.md`, `NDC_AutomationPlan_SHAFT.md`, `NDC_AutomationPlan.md`, `NDC_AutomationSummary.md`

This is an inherent tension in immutability: fixing these would mean editing historical run records. Flagging instead of silently fixing or silently ignoring, per your validation rule.

## 12. Deferred, not implemented

The **Active Automation Package lifecycle** (Candidate → Human Review → Promotion → Active Package, `workspace/automation/active/{shaft,playwright}/`, `registry.md`, `active_package.md`, and the associated changes to `automation_agent.md`/`execution_agent.md`/`pipeline.md` behavior) was explicitly deferred to a separate follow-up task per your answer — it's new pipeline functionality, not a structural refactor, and conflicted with this task's own "no behavior change" rule. Nothing for it was built yet.

## 13. Unrelated stray file found — needs your attention

`./to/Untitled.java` — an untracked file/folder at the repo root, not created by me, containing what read like a full alternate instruction (platform-wide rename + folding the Active Package lifecycle into this task). You confirmed this wasn't your intent for this task, so it was not acted on. I left it in place since I don't know its origin — you may want to delete it yourself (looks like an accidental editor-tab save, not repository content).

## 14. Validation performed

- ✅ No git merge-conflict markers anywhere in the repository (checked all `.md` files).
- ✅ `prompts/` fully removed; zero remaining functional (non-historical) references.
- ✅ `.gitignore` free of the pasted conversation text; produces a normal, valid ignore file.
- ✅ `runs/` directory contents unmodified — only the parent path changed via `git mv` (an atomic rename, not a copy), and no file inside any `RUN-*` folder was edited.
- ✅ All non-run NDC docs re-pointed to `workspace/`/`runs/` as appropriate.
- ✅ Two real broken relative links found outside the scope of the original ask (OrangeHRM → root docs) and fixed.
- ⚠️ Not run: an actual pipeline/agent invocation against NDC to confirm end-to-end behavior — this was explicitly a structural-only refactor with no agent execution involved.

## 15. Remaining manual actions

1. Decide whether the root `README.md` stub (§4) is acceptable, or whether you'd prefer no file at root at all.
2. Delete (or otherwise handle) `./to/Untitled.java` (§13) — left untouched pending your decision.
3. Review and commit — nothing in this refactor has been committed.
4. When ready, scope and design the Active Automation Package lifecycle (§12) as its own task.
