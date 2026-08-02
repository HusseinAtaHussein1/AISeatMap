// Project Paths — the platform's single source of truth for path resolution.
//
// PLATFORM INDEPENDENCE CONTRACT (see platform_core/tools/project_paths/README.md):
//   No Skill, Tool, Pipeline, or Workflow may hardcode a project directory name. The only
//   required input is the PROJECT ROOT; every other path is derived from it here. `platform_core_data`
//   is the DEFAULT VALUE of that root in this repository — it is not a constant, and nothing
//   outside this module may assume it.
//
// Resolution order for the project root (first match wins):
//   1. An explicit `projectRoot` argument passed to `resolvePaths()`.
//   2. The PLATFORM_PROJECT_ROOT environment variable.
//   3. `projectRoot` in platform.config.json at the repository root.
//   4. The built-in default, `platform_core_data`.
//
// Relative values are resolved against the repository root. Absolute values are used as-is,
// so a project root may live entirely outside this repository.

const fs = require('fs');
const path = require('path');

const DEFAULT_PROJECT_ROOT = 'platform_core_data';
const DEFAULT_GENERATED_DIR = '.generated';
const CONFIG_FILENAME = 'platform.config.json';

// platform_core/tools/project_paths/index.js -> repository root is three levels up.
const REPO_ROOT = path.resolve(__dirname, '..', '..', '..');

let cachedConfig;

/** Reads platform.config.json once. A missing file is not an error — defaults apply. */
function loadConfig({ reload = false } = {}) {
  if (cachedConfig && !reload) return cachedConfig;
  const configPath = path.join(REPO_ROOT, CONFIG_FILENAME);
  if (!fs.existsSync(configPath)) {
    cachedConfig = {};
    return cachedConfig;
  }
  let raw;
  try {
    raw = fs.readFileSync(configPath, 'utf8');
  } catch (err) {
    throw new Error(`Cannot read ${CONFIG_FILENAME} at ${configPath}: ${err.message}`);
  }
  try {
    cachedConfig = JSON.parse(raw);
  } catch (err) {
    throw new Error(
      `${CONFIG_FILENAME} is not valid JSON (${err.message}). ` +
      `Fix it or delete it to fall back to defaults.`
    );
  }
  if (cachedConfig === null || typeof cachedConfig !== 'object' || Array.isArray(cachedConfig)) {
    throw new Error(`${CONFIG_FILENAME} must contain a JSON object at its top level.`);
  }
  return cachedConfig;
}

function repoRoot() {
  return REPO_ROOT;
}

/** Resolves a configured path value against the repository root unless already absolute. */
function absolutize(value) {
  return path.isAbsolute(value) ? path.normalize(value) : path.join(REPO_ROOT, value);
}

/**
 * Resolves the project root. Never returns a hardcoded directory name to callers —
 * always the fully-resolved absolute path for whatever root is configured.
 */
function resolveProjectRoot(explicitRoot, opts = {}) {
  const fromEnv = process.env.PLATFORM_PROJECT_ROOT;
  const config = loadConfig(opts);
  const raw =
    (explicitRoot && String(explicitRoot).trim()) ||
    (fromEnv && String(fromEnv).trim()) ||
    (config.projectRoot && String(config.projectRoot).trim()) ||
    DEFAULT_PROJECT_ROOT;
  return absolutize(raw);
}

/**
 * The full derived path map for a project root. Every path any Skill, Tool, Pipeline, or
 * Workflow needs is derived here, so a retarget changes one value instead of N call sites.
 */
function resolvePaths(explicitRoot, opts = {}) {
  const config = loadConfig(opts);
  const root = resolveProjectRoot(explicitRoot, opts);

  const generatedRaw = (config.generatedOutputDir && String(config.generatedOutputDir).trim()) || DEFAULT_GENERATED_DIR;
  // The generated-output directory is isolated and gitignored (see the platform-managed
  // .gitignore block). It is resolved relative to the PROJECT ROOT, never the repo root, so
  // generated artifacts never mix with maintained source code.
  const generatedRoot = path.isAbsolute(generatedRaw) ? path.normalize(generatedRaw) : path.join(root, generatedRaw);

  const knowledgeRoot = path.join(root, 'knowledge');
  const workspaceRoot = path.join(root, 'workspace');

  return {
    repoRoot: REPO_ROOT,
    projectRoot: root,

    // --- Project inputs (human-authored) ---
    prd: path.join(root, 'PRD.md'),
    runConfiguration: path.join(root, 'run_configuration.md'),
    architecture: path.join(root, 'architecture.md'),
    glossary: path.join(root, 'glossary.md'),
    onboarding: path.join(root, 'onboarding.md'),
    resources: path.join(root, 'resources'),

    // --- Knowledge (one tree; category = folder, layer = frontmatter `scope:`) ---
    knowledgeRoot,
    knowledgeBusiness: path.join(knowledgeRoot, 'business'),
    knowledgePatterns: path.join(knowledgeRoot, 'patterns'),

    // --- Browser Provider assets ---
    browser: path.join(root, 'browser'),
    browserProfile: path.join(root, 'browser', 'profile.json'),
    browserScreens: path.join(root, 'browser', 'screens'),
    browserComponents: path.join(root, 'browser', 'components'),
    credentials: path.join(root, 'credentials'),
    credentialsFile: path.join(root, 'credentials', 'credentials.json'),
    credentialsTemplate: path.join(root, 'credentials', 'credentials.template.json'),

    // --- UI knowledge base ---
    ui: path.join(root, 'ui'),
    uiScreenshots: path.join(root, 'ui', 'screenshots'),

    // --- Workspace (current-approved state, one folder per stage) ---
    workspaceRoot,
    workspaceContext: path.join(workspaceRoot, 'context'),
    workspaceDiscovery: path.join(workspaceRoot, 'discovery'),
    workspaceTestDesign: path.join(workspaceRoot, 'test_design'),
    workspaceManualExecution: path.join(workspaceRoot, 'manual_execution'),
    workspaceAutomation: path.join(workspaceRoot, 'automation'),
    workspaceExecution: path.join(workspaceRoot, 'execution'),
    workspaceReporting: path.join(workspaceRoot, 'reporting'),
    workspacePipeline: path.join(workspaceRoot, 'pipeline'),
    runManifest: path.join(workspaceRoot, 'pipeline', 'RunManifest.md'),

    // --- Runs (immutable per-run snapshots) ---
    runsRoot: path.join(root, 'runs'),

    // --- Generated output (isolated, gitignored, never mixed with source) ---
    generatedRoot,
    generatedPlaywright: path.join(generatedRoot, 'playwright'),

    // --- Platform layer (application-agnostic) ---
    platformCore: path.join(REPO_ROOT, 'platform_core'),
    platformTools: path.join(REPO_ROOT, 'platform_core', 'tools'),
    prerequisites: path.join(REPO_ROOT, 'platform_core', 'prerequisites'),
  };
}

/** Absolute path for a run folder, without assuming any naming convention. */
function runPath(runFolder, explicitRoot, opts = {}) {
  if (!runFolder || !String(runFolder).trim()) {
    throw new Error('runPath requires a run folder name.');
  }
  return path.join(resolvePaths(explicitRoot, opts).runsRoot, String(runFolder).trim());
}

/** Throws a clear, actionable error if the configured project root does not exist. */
function assertProjectRoot(explicitRoot, opts = {}) {
  const root = resolveProjectRoot(explicitRoot, opts);
  if (!fs.existsSync(root)) {
    throw new Error(
      `Project root not found: ${root}\n` +
      `Set it via PLATFORM_PROJECT_ROOT, or "projectRoot" in ${CONFIG_FILENAME}, ` +
      `or initialize a project with the project-context Skill (Project Initialization).`
    );
  }
  return root;
}

/** The configured Browser Provider id and its settings — see tools/browser_provider/. */
function browserProviderConfig(opts = {}) {
  const config = loadConfig(opts);
  const id = (config.browserProvider && String(config.browserProvider).trim()) || 'playwright-node';
  const providers = config.browserProviders || {};
  return { id, settings: providers[id] || {}, all: providers };
}

function debugModeEnabled(opts = {}) {
  return loadConfig(opts).debugMode === true;
}

module.exports = {
  DEFAULT_PROJECT_ROOT,
  DEFAULT_GENERATED_DIR,
  CONFIG_FILENAME,
  loadConfig,
  repoRoot,
  resolveProjectRoot,
  resolvePaths,
  runPath,
  assertProjectRoot,
  browserProviderConfig,
  debugModeEnabled,
};
