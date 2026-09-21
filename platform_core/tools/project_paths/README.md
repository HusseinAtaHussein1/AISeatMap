# Project Paths — Platform Independence Layer

The platform's **single source of truth for path resolution**. Every Skill, Tool, Pipeline, and Workflow
resolves project paths through this module. Nothing else in the repository may hardcode a project
directory name.

## The contract

> **The only required input is the project root.** Every other path is derived from it.

No Skill may assume `projects/`, `{{PROJECT_ROOT}}/`, `NDC`, `OrangeHRM`, or any other
repository-specific folder name. `platform_core_data` is the **default value** of the project root in
this repository — a value, not a constant.

## Resolution order

The project root is resolved by first match:

1. An explicit `projectRoot` argument passed to `resolvePaths()` / `resolveProjectRoot()`.
2. The `PLATFORM_PROJECT_ROOT` environment variable.
3. `"projectRoot"` in `platform.config.json` at the repository root.
4. The built-in default, `platform_core_data`.

Relative values resolve against the repository root. **Absolute values are used as-is**, so a project
root may live entirely outside this repository.

## Usage

```js
const { resolvePaths, runPath, assertProjectRoot } = require('<repo>/platform_core/tools/project_paths');

const p = resolvePaths();              // uses the configured root
p.prd                                  // {PROJECT_ROOT}/PRD.md
p.workspaceContext                     // {PROJECT_ROOT}/workspace/context
p.knowledgePatterns                    // {PROJECT_ROOT}/knowledge/patterns
p.generatedPlaywright                  // {GENERATED_OUTPUT_DIR}/playwright

runPath('2026-07-29_10-00-00__Module__Login')   // {PROJECT_ROOT}/runs/<folder>
assertProjectRoot();                            // fail fast with an actionable message
```

`browserProviderConfig()` and `debugModeEnabled()` read the same `platform.config.json` for the
configured Browser Provider id/settings and the `debugMode` flag, so callers never re-parse the
config file themselves.

Retargeting the platform at a different application is a **one-value change**:

```bash
PLATFORM_PROJECT_ROOT=/abs/path/to/other_project node <script>
```

or edit `projectRoot` in `platform.config.json`.

## Derived path map

| Key | Resolves to |
|---|---|
| `projectRoot` | the configured root |
| `prd`, `runConfiguration`, `architecture`, `glossary`, `onboarding`, `resources` | project inputs |
| `knowledgeRoot`, `knowledgeBusiness`, `knowledgePatterns` | the one knowledge tree |
| `browser`, `browserProfile`, `browserScreens`, `browserComponents` | Browser Provider assets |
| `credentials`, `credentialsFile`, `credentialsTemplate` | credentials (real file git-ignored) |
| `ui`, `uiScreenshots` | UI Knowledge Base |
| `workspaceRoot` + `workspace{Context,Discovery,TestDesign,ManualExecution,Automation,Execution,Reporting,Pipeline}` | current-approved state per stage |
| `runManifest` | `workspace/pipeline/RunManifest.md` |
| `runsRoot` | immutable per-run snapshots |
| `generatedRoot`, `generatedPlaywright` | isolated, gitignored generated output |
| `platformCore`, `platformTools`, `prerequisites` | the application-agnostic platform layer |

## Documentation notation

Platform documents write project paths as `{{PROJECT_ROOT}}/…` — the placeholder this module
resolves. A literal `{{PROJECT_ROOT}}/…` in a specification is a platform-independence defect;
a literal path inside a dated historical record or an immutable run artifact is not (those describe
what was true when written).

## Rules

- **Never** hardcode a project directory name outside this module.
- **Never** resolve a project path by string-concatenating `'platform_core_data'` in a Tool or script.
- **Always** derive generated-artifact locations from `generatedRoot`, so they stay isolated and
  gitignored and never mix with maintained source code.
- **Always** fail fast via `assertProjectRoot()` rather than silently creating a root that a typo invented.

## Related

- [`../browser_provider/interface.md`](../browser_provider/interface.md) — the Browser Provider abstraction, configured by the same file.
- [`../../prerequisites/README.md`](../../prerequisites/README.md) — the reusable prerequisites Skills reference.
- [`../../../workflows_and_pipelines/pipeline/pipeline.md`](../../../workflows_and_pipelines/pipeline/pipeline.md) §1 — the single-project-root architecture principle this implements.
