# Platform Paths

The single place the platform's two roots are resolved. Every other tool depends on this module, so it depends on none of them.

## 1. Why two roots

The platform is installed **into** the repository it tests. That makes two distinct roots, and confusing them is the difference between "generated a test suite" and "committed into somebody else's repository":

| Root | What it is | Platform access |
|---|---|---|
| **Tool Root** | the `agentic-testing-tool/` folder — `platform_core/`, `platform_core_data/`, `workflows_and_pipelines/`, `platform.config.json` | read + write, unrestricted |
| **Target Root** | the host application's repository | read for **technical facts only**; write **only** inside the configured automation directory |

The full contract is [`pipeline.md` §13](../../../workflows_and_pipelines/pipeline/pipeline.md). This module is what makes it enforceable rather than aspirational.

Every process artifact — Project Context, discovery findings, test cases, execution results, reports, run history, knowledge base — lives under `dataRoot`, inside the Tool Root. The Target Project receives generated automation code and nothing else.

## 2. Usage

```js
const { resolveRoots, classifyPath, canRead, canWrite } = require('./paths');

const roots = resolveRoots();
roots.toolRoot;    // C:/work/my-app/agentic-testing-tool
roots.dataRoot;    // C:/work/my-app/agentic-testing-tool/platform_core_data
roots.targetRoot;  // C:/work/my-app
roots.mode;        // 'installed' | 'self-hosted'

canWrite('C:/work/my-app/tests/e2e/login.spec.ts', roots);  // true  — allowlisted
canWrite('C:/work/my-app/src/app.ts', roots);               // false — outside the allowlist
canRead('C:/work/my-app/.env', roots);                       // false — denylisted
```

From a pipeline stage or a shell:

```bash
node platform_core/tools/platform_paths/cli.js roots --json
node platform_core/tools/platform_paths/cli.js classify tests/e2e/login.spec.ts
node platform_core/tools/platform_paths/cli.js doctor
```

**An agent must never infer a root** from `process.cwd()`, from `__dirname`, or by searching for `.git` (`pipeline.md` §1.1). It calls `cli.js roots --json`.

## 3. Configuration

`platform.config.json`, at the Tool Root. It lives there rather than under `platform_core_data/` deliberately: data is replaced when the platform is retargeted, but this file is tool wiring and survives.

```json
{
  "$schema": "./platform_core/tools/platform_paths/platform.config.schema.json",
  "configVersion": 1,
  "mode": "installed",
  "targetRoot": "..",
  "dataRoot": "platform_core_data",
  "target": {
    "testDirs": { "e2e": "tests/e2e" },
    "automationRoot": "tests/e2e",
    "writeAllowlist": ["tests/e2e/**", "playwright.config.ts"],
    "readDenylist": [],
    "detectedStack": null
  },
  "git": { "mode": "tool-repo", "commitBaseline": true }
}
```

`platform.config.schema.json` documents every field. Notable semantics:

- **`targetRoot` is relative to this file's own directory**, so a tool folder can be moved without rewriting it. Usually `".."`.
- **`writeAllowlist` is fail-closed.** Empty or absent means the platform writes *nothing* to the Target Project, and Stage 5 generates inside `platform_core_data/` instead (the `automation-skill` §32.3 Option 1 behavior). Enabling target writes is an explicit act.
- **`readDenylist` is merged with, never replaces,** a non-overridable built-in list (`.env*`, `**/credentials*.json`, `**/secrets*`, `**/*.pem`, `**/*.key`, `**/.aws/**`, `**/id_rsa*`). Secrets reach the platform only through `platform_core_data/credentials/credentials.json`.
- **`configVersion` mismatch is a hard error**, never a best-effort read — it names whether to upgrade the platform or migrate the config.

`platform.config.local.json` sits beside it, is gitignored, and shallow-merges over the base (one level deep for `target` and `git`). Use it for machine-specific overrides.

## 4. Resolution precedence

Highest wins:

1. Explicit argument — `resolveRoots({ toolRoot, dataRoot, targetRoot })`
2. Environment — `AGENTIC_TESTING_TOOL_ROOT`, `_DATA_ROOT`, `_TARGET_ROOT`, `_GIT_MODE`, `_MODE`, `_CONFIG`
3. `platform.config.local.json`
4. `platform.config.json`
5. Built-in defaults — `dataRoot` = `platform_core_data`, `git.mode` = `tool-repo`

`mode` is the one exception: if config and environment **disagree**, that is a hard error rather than a precedence question. Silently picking a winner would decide whether the platform may write into somebody else's repository.

`roots.resolution` carries an ordered, human-readable trace of every decision — `cli.js doctor` prints it.

### How each root is found

- **Tool Root** — walk up from the caller's directory; the first directory containing `platform.config.json` or `platform_core/tools/platform_paths/paths.js` wins. If none is found, the error lists every directory searched.
- **Target Root** — **only ever config- or env-declared, never inferred at runtime.** Missing in installed mode is an error naming the fix (`npx agentic-testing init`). The walk-up heuristics that guess a target root live in `tools/init`, where a human confirms them; a stage that silently guessed could write into the wrong repository.

Guards: `targetRoot` must not equal the Tool Root (that's `mode: "self-hosted"`) and must not sit inside it — the target contains the tool, never the reverse. `dataRoot` must resolve inside the Tool Root.

## 5. Self-hosted mode

`mode: "self-hosted"` means `targetRoot === toolRoot`: the platform is testing its own repository. This repo uses it for the `examples/` fixture, so the pipeline stays self-testable. It is a degenerate case of installed mode, not a separate code path — the only difference is that the `targetRoot === toolRoot` assertion is permitted instead of rejected.

## 6. `classifyPath`

Answers *which root does this path belong to, and may we write it*:

```js
classifyPath('/work/my-app/tests/e2e/a.spec.ts', roots);
// { root: 'target', relative: 'tests/e2e/a.spec.ts', writable: true,
//   reason: 'inside the Target Project write allowlist (pipeline.md §13.3)' }
```

`root` is one of `'data'`, `'tool'`, `'target'`, `'outside'`. **Check order matters**: the Tool Root normally sits *inside* the Target Project, so a path under the tool folder classifies as `data`/`tool` even though it is also under `targetRoot`.

Glob matching supports `**`, `*` and `?`, and a bare directory pattern covers its descendants (`tests/e2e` matches `tests/e2e/a/b.ts`). It is deliberately dependency-free — this module must not pull in a glob library that every consumer then inherits.

## 7. Files

| File | Purpose |
|---|---|
| `paths.js` | the resolver — `resolveRoots`, `classifyPath`, `canRead`, `canWrite`, `assertValidInstall` |
| `cli.js` | `roots` · `classify <path>` · `doctor` |
| `platform.config.schema.json` | the configuration contract |
| `__tests__/paths.test.js` | precedence, guards, classification, denylist, glob semantics |
