// Platform Paths — the single place the platform's two roots are resolved.
//
// The platform is installed INTO the repository it tests (pipeline.md §13), so two distinct roots
// exist and must never be confused:
//
//   Tool Root    the agentic-testing-tool/ folder — platform_core/, platform_core_data/,
//                workflows_and_pipelines/, platform.config.json. Read + write, unrestricted.
//   Target Root  the host application's repository. Readable for technical facts only; writable
//                only inside the configured automation directory (pipeline.md §6 Rule 9).
//
// Zero project-specific data lives here, and this module deliberately depends on no other tool
// module — every one of them depends on it, so it sits at the bottom of the graph. Every path is
// resolved from configuration or an explicit argument, never from process.cwd().
//
// See README.md in this folder for the configuration contract.

const fs = require('fs');
const path = require('path');

/** Files/dirs whose presence identifies a directory as the Tool Root. */
const MARKERS = [
  'platform.config.json',
  path.join('platform_core', 'tools', 'platform_paths', 'paths.js'),
];

const CONFIG_FILENAME = 'platform.config.json';
const LOCAL_CONFIG_FILENAME = 'platform.config.local.json';
const SUPPORTED_CONFIG_VERSION = 1;
const DEFAULT_DATA_DIRNAME = 'platform_core_data';
const GIT_MODES = ['tool-repo', 'host-repo', 'off'];
const MODES = ['installed', 'self-hosted'];

/**
 * Secret-bearing patterns the platform must never read out of the Target Project. Merged with —
 * never replaced by — `target.readDenylist` from config (pipeline.md §13.2). Credentials reach the
 * platform only via platform_core_data/credentials/credentials.json.
 */
const BUILTIN_READ_DENYLIST = Object.freeze([
  '.env',
  '.env.*',
  '**/credentials*.json',
  '**/secrets*',
  '**/*.pem',
  '**/*.key',
  '**/.aws/**',
  '**/id_rsa*',
]);

const ENV_KEYS = Object.freeze({
  toolRoot: 'AGENTIC_TESTING_TOOL_ROOT',
  dataRoot: 'AGENTIC_TESTING_DATA_ROOT',
  targetRoot: 'AGENTIC_TESTING_TARGET_ROOT',
  gitMode: 'AGENTIC_TESTING_GIT_MODE',
  config: 'AGENTIC_TESTING_CONFIG',
  mode: 'AGENTIC_TESTING_MODE',
});

class ConfigError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConfigError';
  }
}

/** Absolute, POSIX-separator form. Keeps every comparison and every emitted path consistent. */
function normalize(p) {
  return path.resolve(p).split(path.sep).join('/');
}

/** POSIX-relative path of `abs` within `base`, or null when `abs` escapes `base`. */
function relativeWithin(base, abs) {
  const rel = path.relative(base, abs).split(path.sep).join('/');
  if (rel === '') return '.';
  if (rel.startsWith('../') || rel === '..' || path.isAbsolute(rel)) return null;
  return rel;
}

function isWithin(base, abs) {
  return relativeWithin(base, abs) !== null;
}

// -------------------------------------------------------------------------------------------------
// Tool Root discovery
// -------------------------------------------------------------------------------------------------

function hasMarker(dir, fsImpl) {
  return MARKERS.some((marker) => fsImpl.existsSync(path.join(dir, marker)));
}

/**
 * Walk up from `startDir` to the filesystem root; the first directory containing any MARKER wins.
 * @returns {{ toolRoot: string, searched: string[] }}
 * @throws {ConfigError} when no marker is found, listing every directory searched.
 */
function findToolRoot(startDir, fsImpl) {
  const searched = [];
  let dir = path.resolve(startDir);
  for (;;) {
    searched.push(normalize(dir));
    if (hasMarker(dir, fsImpl)) return { toolRoot: normalize(dir), searched };
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  throw new ConfigError(
    `Could not locate the Tool Root: no directory from "${normalize(startDir)}" up to the ` +
      `filesystem root contains ${MARKERS.map((m) => `"${m.split(path.sep).join('/')}"`).join(' or ')}.\n` +
      `Searched:\n${searched.map((d) => `  ${d}`).join('\n')}\n` +
      'If the platform is installed, run `agentic-testing doctor` from inside the tool folder, ' +
      `or set ${ENV_KEYS.toolRoot}.`,
  );
}

// -------------------------------------------------------------------------------------------------
// Config loading
// -------------------------------------------------------------------------------------------------

function readJson(file, fsImpl) {
  let raw;
  try {
    raw = fsImpl.readFileSync(file, 'utf8');
  } catch (err) {
    throw new ConfigError(`Could not read config file "${normalize(file)}": ${err.message}`);
  }
  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new ConfigError(
      `Config file "${normalize(file)}" is not valid JSON: ${err.message}. ` +
        'Fix the syntax — the platform will not guess at your configuration.',
    );
  }
}

function assertConfigVersion(config, file) {
  const version = config.configVersion;
  if (version === undefined) {
    throw new ConfigError(
      `Config file "${normalize(file)}" is missing "configVersion". Add "configVersion": ` +
        `${SUPPORTED_CONFIG_VERSION}.`,
    );
  }
  if (!Number.isInteger(version)) {
    throw new ConfigError(
      `Config file "${normalize(file)}" has a non-integer "configVersion" (${JSON.stringify(version)}).`,
    );
  }
  if (version !== SUPPORTED_CONFIG_VERSION) {
    throw new ConfigError(
      `Config file "${normalize(file)}" declares configVersion ${version}, but this build of the ` +
        `platform supports configVersion ${SUPPORTED_CONFIG_VERSION}. ` +
        (version > SUPPORTED_CONFIG_VERSION
          ? 'Upgrade the platform (`npm i -g agentic-ai-testing-platform`) to read this config.'
          : 'Run `agentic-testing upgrade` to migrate this config forward.'),
    );
  }
}

/** Shallow merge, one level deep for `target` and `git`, so a local override needn't restate all. */
function mergeConfig(base, override) {
  const out = { ...base, ...override };
  for (const key of ['target', 'git']) {
    if (base[key] || override[key]) {
      out[key] = { ...(base[key] || {}), ...(override[key] || {}) };
    }
  }
  return out;
}

function loadConfig(toolRoot, env, fsImpl, resolution) {
  const explicit = env[ENV_KEYS.config];
  const basePath = explicit ? path.resolve(explicit) : path.join(toolRoot, CONFIG_FILENAME);

  if (explicit && !fsImpl.existsSync(basePath)) {
    throw new ConfigError(
      `${ENV_KEYS.config} points at "${normalize(basePath)}", which does not exist.`,
    );
  }
  if (!fsImpl.existsSync(basePath)) {
    resolution.push(`config: none found at ${normalize(basePath)} — using built-in defaults`);
    return { config: {}, configPath: null };
  }

  const config = readJson(basePath, fsImpl);
  assertConfigVersion(config, basePath);
  resolution.push(`config: loaded ${normalize(basePath)}`);

  const localPath = path.join(path.dirname(basePath), LOCAL_CONFIG_FILENAME);
  if (fsImpl.existsSync(localPath)) {
    const local = readJson(localPath, fsImpl);
    if (local.configVersion !== undefined) assertConfigVersion(local, localPath);
    resolution.push(`config: merged local override ${normalize(localPath)}`);
    return { config: mergeConfig(config, local), configPath: normalize(basePath) };
  }

  return { config, configPath: normalize(basePath) };
}

// -------------------------------------------------------------------------------------------------
// Field resolution
// -------------------------------------------------------------------------------------------------

/**
 * Resolve one field across the precedence chain: explicit argument > env > config > default.
 * A declared-but-conflicting env/config pair is a hard error for `mode` only (see resolveMode).
 */
function pick({ argValue, envValue, configValue, defaultValue, name, resolution }) {
  if (argValue !== undefined && argValue !== null) {
    resolution.push(`${name}: from explicit argument`);
    return argValue;
  }
  if (envValue !== undefined && envValue !== null && envValue !== '') {
    resolution.push(`${name}: from env`);
    return envValue;
  }
  if (configValue !== undefined && configValue !== null) {
    resolution.push(`${name}: from config`);
    return configValue;
  }
  resolution.push(`${name}: built-in default`);
  return defaultValue;
}

/**
 * `mode` is the one field where env and config disagreeing is a hard error rather than a
 * precedence question: silently choosing a winner would decide whether the platform may write into
 * somebody else's repository.
 */
function resolveMode(config, env, resolution) {
  const fromConfig = config.mode;
  const fromEnv = env[ENV_KEYS.mode];

  for (const [source, value] of [['config', fromConfig], ['env', fromEnv]]) {
    if (value !== undefined && value !== null && !MODES.includes(value)) {
      throw new ConfigError(
        `Invalid mode "${value}" from ${source}. Expected one of: ${MODES.join(', ')}.`,
      );
    }
  }

  if (fromConfig && fromEnv && fromConfig !== fromEnv) {
    throw new ConfigError(
      `Conflicting mode: config says "${fromConfig}" but ${ENV_KEYS.mode} says "${fromEnv}". ` +
        'Refusing to guess which is correct — unset the environment variable, or fix the config.',
    );
  }

  if (fromEnv) {
    resolution.push('mode: from env');
    return fromEnv;
  }
  if (fromConfig) {
    resolution.push('mode: from config');
    return fromConfig;
  }
  resolution.push('mode: built-in default (installed)');
  return 'installed';
}

function resolveGitMode(config, env, resolution) {
  const value = pick({
    envValue: env[ENV_KEYS.gitMode],
    configValue: (config.git || {}).mode,
    defaultValue: 'tool-repo',
    name: 'git.mode',
    resolution,
  });
  if (!GIT_MODES.includes(value)) {
    throw new ConfigError(`Invalid git.mode "${value}". Expected one of: ${GIT_MODES.join(', ')}.`);
  }
  return value;
}

// -------------------------------------------------------------------------------------------------
// resolveRoots
// -------------------------------------------------------------------------------------------------

const memo = new Map();

function memoKey(startDir, env) {
  const envSnapshot = Object.values(ENV_KEYS)
    .map((key) => `${key}=${env[key] || ''}`)
    .join(' ');
  return `${path.resolve(startDir)} ${envSnapshot}`;
}

/**
 * @typedef {Object} PlatformRoots
 * @property {string} toolRoot   Absolute POSIX. The agentic-testing-tool/ folder.
 * @property {string} dataRoot   Absolute POSIX. Every process artifact lives under here.
 * @property {string} coreRoot   Absolute POSIX. `${toolRoot}/platform_core`.
 * @property {string} targetRoot Absolute POSIX. Host project root; === toolRoot when self-hosted.
 * @property {'installed'|'self-hosted'} mode
 * @property {string|null} configPath
 * @property {{mode: string, commitBaseline: boolean}} git
 * @property {{automationRoot: string|null, testDirs: object, writeAllowlist: string[],
 *             readDenylist: string[], detectedStack: object|null}} target
 * @property {boolean} canWriteTarget  Fail-closed: false unless an allowlist is configured.
 * @property {string[]} resolution     Ordered provenance, one line per decision.
 */

/**
 * Resolve every root the platform uses.
 *
 * @param {Object} [opts]
 * @param {string} [opts.startDir]  Where to begin the Tool Root walk-up. Defaults to this module's
 *                                  own directory, so resolution never depends on process.cwd().
 * @param {Object} [opts.env]       Defaults to process.env. Injectable for tests.
 * @param {Object} [opts.fs]        Defaults to require('fs'). Injectable for tests.
 * @param {boolean} [opts.fresh]    Bypass the memo.
 * @param {string} [opts.toolRoot]  Explicit override (highest precedence).
 * @param {string} [opts.dataRoot]  Explicit override (highest precedence).
 * @param {string} [opts.targetRoot] Explicit override (highest precedence).
 * @returns {PlatformRoots}
 */
function resolveRoots(opts = {}) {
  const env = opts.env || process.env;
  const fsImpl = opts.fs || fs;
  const startDir = opts.startDir || __dirname;

  const key = memoKey(startDir, env);
  const canMemo = !opts.fresh && !opts.fs && !opts.toolRoot && !opts.dataRoot && !opts.targetRoot;
  if (canMemo && memo.has(key)) return memo.get(key);

  const resolution = [];

  // --- Tool Root -------------------------------------------------------------------------------
  let toolRoot;
  if (opts.toolRoot) {
    toolRoot = normalize(opts.toolRoot);
    resolution.push('toolRoot: from explicit argument');
  } else if (env[ENV_KEYS.toolRoot]) {
    toolRoot = normalize(env[ENV_KEYS.toolRoot]);
    if (!hasMarker(toolRoot, fsImpl)) {
      throw new ConfigError(
        `${ENV_KEYS.toolRoot} points at "${toolRoot}", which contains none of the expected ` +
          `markers (${MARKERS.map((m) => m.split(path.sep).join('/')).join(', ')}).`,
      );
    }
    resolution.push(`toolRoot: from env ${ENV_KEYS.toolRoot}`);
  } else {
    const found = findToolRoot(startDir, fsImpl);
    toolRoot = found.toolRoot;
    resolution.push(`toolRoot: marker walk-up from ${normalize(startDir)}`);
  }

  // --- Config ----------------------------------------------------------------------------------
  const { config, configPath } = loadConfig(toolRoot, env, fsImpl, resolution);
  const mode = resolveMode(config, env, resolution);
  const targetConfig = config.target || {};

  // --- Data Root -------------------------------------------------------------------------------
  const dataRootRaw = pick({
    argValue: opts.dataRoot,
    envValue: env[ENV_KEYS.dataRoot],
    configValue: config.dataRoot,
    defaultValue: DEFAULT_DATA_DIRNAME,
    name: 'dataRoot',
    resolution,
  });
  const dataRoot = normalize(path.resolve(toolRoot, dataRootRaw));
  if (!isWithin(toolRoot, dataRoot)) {
    throw new ConfigError(
      `dataRoot "${dataRoot}" resolves outside the Tool Root "${toolRoot}". Process artifacts must ` +
        'live under the Tool Root (pipeline.md §13.1).',
    );
  }

  // --- Target Root -----------------------------------------------------------------------------
  // Never inferred at runtime. Init-time walk-up heuristics live in tools/init, where a human
  // confirms them; a stage that silently guessed a target root could write into the wrong repo.
  const targetRootRaw = pick({
    argValue: opts.targetRoot,
    envValue: env[ENV_KEYS.targetRoot],
    configValue: config.targetRoot,
    defaultValue: null,
    name: 'targetRoot',
    resolution,
  });

  let targetRoot;
  if (mode === 'self-hosted') {
    if (targetRootRaw !== null && targetRootRaw !== undefined) {
      const declared = normalize(path.resolve(configPath ? path.dirname(configPath) : toolRoot, targetRootRaw));
      if (declared !== toolRoot) {
        throw new ConfigError(
          `mode is "self-hosted" but targetRoot "${declared}" is not the Tool Root "${toolRoot}". ` +
            'In self-hosted mode the two are the same root; omit targetRoot or set it to ".".',
        );
      }
    }
    targetRoot = toolRoot;
    resolution.push('targetRoot: self-hosted — equals toolRoot');
  } else if (targetRootRaw === null || targetRootRaw === undefined) {
    throw new ConfigError(
      'targetRoot is not configured — run `npx agentic-testing init` in your project root. ' +
        'The platform will not infer the Target Project from the current working directory.',
    );
  } else {
    // Relative to the config file's own directory, so a config can be moved with its tool folder.
    const base = configPath ? path.dirname(configPath) : toolRoot;
    targetRoot = normalize(path.resolve(base, targetRootRaw));

    if (targetRoot === toolRoot) {
      throw new ConfigError(
        `targetRoot "${targetRoot}" equals the Tool Root. If you intend to test this repository ` +
          'itself, set "mode": "self-hosted".',
      );
    }
    if (isWithin(toolRoot, targetRoot)) {
      throw new ConfigError(
        `targetRoot "${targetRoot}" is inside the Tool Root "${toolRoot}". The Target Project ` +
          'contains the tool, never the other way around.',
      );
    }
    if (!isWithin(targetRoot, toolRoot)) {
      resolution.push('targetRoot: detached — the Tool Root is not inside the Target Project');
    }
  }

  // --- Target access policy --------------------------------------------------------------------
  const writeAllowlist = Array.isArray(targetConfig.writeAllowlist) ? targetConfig.writeAllowlist.slice() : [];
  const readDenylist = BUILTIN_READ_DENYLIST.concat(
    Array.isArray(targetConfig.readDenylist) ? targetConfig.readDenylist : [],
  );
  const canWriteTarget = writeAllowlist.length > 0;
  resolution.push(
    canWriteTarget
      ? `target writes: enabled by ${writeAllowlist.length} allowlist pattern(s)`
      : 'target writes: DISABLED (fail-closed — no writeAllowlist configured)',
  );

  const gitMode = resolveGitMode(config, env, resolution);
  const commitBaseline = (config.git || {}).commitBaseline !== false;

  const roots = Object.freeze({
    toolRoot,
    dataRoot,
    coreRoot: normalize(path.join(toolRoot, 'platform_core')),
    targetRoot,
    mode,
    configPath,
    git: Object.freeze({ mode: gitMode, commitBaseline }),
    target: Object.freeze({
      automationRoot: targetConfig.automationRoot || null,
      testDirs: Object.freeze({ ...(targetConfig.testDirs || {}) }),
      writeAllowlist: Object.freeze(writeAllowlist),
      readDenylist: Object.freeze(readDenylist),
      detectedStack: targetConfig.detectedStack || null,
    }),
    canWriteTarget,
    resolution: Object.freeze(resolution),
  });

  if (canMemo) memo.set(key, roots);
  return roots;
}

/** Clear the memo. For tests and for `doctor` after a config rewrite. */
function clearCache() {
  memo.clear();
}

// -------------------------------------------------------------------------------------------------
// Path classification — what enforces pipeline.md §13
// -------------------------------------------------------------------------------------------------

/**
 * Which root does `absPath` belong to, and may the platform write it?
 *
 * Order matters: the Tool Root normally sits INSIDE the Target Project, so a path under the tool
 * folder must classify as 'tool' even though it is also under targetRoot.
 *
 * @param {string} absPath
 * @param {PlatformRoots} [roots]
 * @returns {{root: 'tool'|'data'|'target'|'outside', relative: string|null, writable: boolean,
 *            reason: string}}
 */
function classifyPath(absPath, roots = resolveRoots()) {
  const abs = normalize(absPath);

  const dataRel = relativeWithin(roots.dataRoot, abs);
  if (dataRel !== null) {
    return {
      root: 'data',
      relative: dataRel,
      writable: true,
      reason: 'process artifact under the Tool Root (pipeline.md §13.1)',
    };
  }

  const toolRel = relativeWithin(roots.toolRoot, abs);
  if (toolRel !== null) {
    return {
      root: 'tool',
      relative: toolRel,
      writable: true,
      reason: 'tool code or specification under the Tool Root',
    };
  }

  if (roots.mode === 'installed') {
    const targetRel = relativeWithin(roots.targetRoot, abs);
    if (targetRel !== null) {
      const allowed = roots.canWriteTarget && matchesAny(targetRel, roots.target.writeAllowlist);
      const denied = matchesAny(targetRel, roots.target.readDenylist);
      return {
        root: 'target',
        relative: targetRel,
        writable: allowed && !denied,
        reason: denied
          ? 'matches the Target Project read denylist — never read or written (pipeline.md §13.2)'
          : allowed
            ? 'inside the Target Project write allowlist (pipeline.md §13.3)'
            : roots.canWriteTarget
              ? 'inside the Target Project but outside its write allowlist (pipeline.md §13.3)'
              : 'Target Project writes are disabled — no writeAllowlist configured (fail-closed)',
      };
    }
  }

  return {
    root: 'outside',
    relative: null,
    writable: false,
    reason: 'outside both roots — never read or written (pipeline.md §6 Rule 9)',
  };
}

/** True when the platform may READ `absPath` (denylist is the only read restriction). */
function canRead(absPath, roots = resolveRoots()) {
  const c = classifyPath(absPath, roots);
  if (c.root === 'outside') return false;
  if (c.root === 'target') return !matchesAny(c.relative, roots.target.readDenylist);
  return true;
}

/** True when the platform may WRITE `absPath`. */
function canWrite(absPath, roots = resolveRoots()) {
  return classifyPath(absPath, roots).writable;
}

/**
 * Minimal glob matcher for allow/deny patterns: supports `**`, `*` and `?`. Deliberately
 * dependency-free — this module must not pull in a glob library that every consumer then inherits.
 */
function globToRegExp(pattern) {
  let re = '';
  for (let i = 0; i < pattern.length; i += 1) {
    const ch = pattern[i];
    if (ch === '*') {
      if (pattern[i + 1] === '*') {
        // `**/` may match zero segments, so `**/x` matches a bare `x`.
        if (pattern[i + 2] === '/') {
          re += '(?:.*/)?';
          i += 2;
        } else {
          re += '.*';
          i += 1;
        }
      } else {
        re += '[^/]*';
      }
    } else if (ch === '?') {
      re += '[^/]';
    } else {
      re += ch.replace(/[.+^${}()|[\]\\]/g, '\\$&');
    }
  }
  return new RegExp(`^${re}$`);
}

function matchesAny(relPath, patterns) {
  if (!relPath || !patterns || !patterns.length) return false;
  return patterns.some((pattern) => {
    if (globToRegExp(pattern).test(relPath)) return true;
    // A bare directory pattern covers everything beneath it: "tests/e2e" ⇒ "tests/e2e/a/b.ts".
    if (!pattern.includes('*') && relPath.startsWith(`${pattern.replace(/\/$/, '')}/`)) return true;
    return false;
  });
}

/**
 * Throw unless the installation is coherent enough to run a pipeline stage. Called by `doctor` and
 * at the top of any tool that is about to touch the Target Project.
 * @param {PlatformRoots} [roots]
 */
function assertValidInstall(roots = resolveRoots()) {
  const problems = [];
  if (!fs.existsSync(roots.toolRoot)) problems.push(`Tool Root does not exist: ${roots.toolRoot}`);
  if (!fs.existsSync(roots.dataRoot)) {
    problems.push(
      `dataRoot does not exist: ${roots.dataRoot} — run \`agentic-testing init\` or restore it from git.`,
    );
  }
  if (roots.mode === 'installed' && !fs.existsSync(roots.targetRoot)) {
    problems.push(`targetRoot does not exist: ${roots.targetRoot}`);
  }
  if (roots.canWriteTarget && !roots.target.automationRoot) {
    problems.push(
      'target.writeAllowlist is set but target.automationRoot is not — the platform would not know ' +
        'where to write generated automation (pipeline.md §13.3).',
    );
  }
  if (problems.length) {
    throw new ConfigError(`Invalid installation:\n${problems.map((p) => `  - ${p}`).join('\n')}`);
  }
  return roots;
}

module.exports = {
  resolveRoots,
  clearCache,
  classifyPath,
  canRead,
  canWrite,
  assertValidInstall,
  findToolRoot,
  ConfigError,
  MARKERS,
  CONFIG_FILENAME,
  LOCAL_CONFIG_FILENAME,
  SUPPORTED_CONFIG_VERSION,
  DEFAULT_DATA_DIRNAME,
  BUILTIN_READ_DENYLIST,
  GIT_MODES,
  ENV_KEYS,
  // Exported for tests and for tools that need the same normalization semantics.
  _internals: { normalize, relativeWithin, isWithin, globToRegExp, matchesAny, mergeConfig },
};
