// Feature Scaffold — creates a standalone Feature's folder skeleton under its parent module.
//
// See workflows_and_pipelines/pipeline/module_architecture.md §5.5.
//
// Layout:
//   modules/<module>/features/<feature>/
//     feature.json
//     context/            ── Stage 1, feature-scoped
//     discovery/          ── Stage 2, feature-scoped
//       findings/  evidence/
//
// TWO RULES THIS FILE ENFORCES MECHANICALLY, both from the intake decision:
//
//   1. `features/` IS NEVER CREATED EAGERLY. A CRUD-only module has no features/ folder, and an
//      existing module does not grow an empty one. The folder appears the first time an APPROVED
//      standalone Feature is scaffolded and never before, because an empty features/ folder would
//      read as "this module has Features" to every human who opens it.
//
//   2. A PROPOSED FEATURE IS NOT SCAFFOLDED. Same reasoning as moduleScaffold.js: a folder on disk
//      reads as approval, so scaffolding refuses anything the human has not confirmed at intake.
//
// Only context/ and discovery/ are eager, matching moduleScaffold.js — the remaining stage folders
// are created by the stage that writes them, so an absent folder keeps meaning "that stage did not
// run" rather than "every stage is somehow in progress".

const fs = require('fs');
const path = require('path');

const { writeJsonAtomic } = require('./moduleRegistry');
const { assertValidModuleSlug } = require('./moduleSlug');
const {
  FEATURE_STAGES,
  FEATURES_DIRNAME,
  FEATURE_STATE_FILENAME,
  featureDir,
  featuresDir,
  findFeature,
  requireModule,
} = require('./featureRegistry');

/** Same two as a module gets, for the same reason (moduleScaffold.js EAGER_STAGE_FOLDERS). */
const EAGER_FEATURE_STAGE_FOLDERS = ['context', 'discovery'];

class FeatureScaffoldError extends Error {
  constructor(message) {
    super(message);
    this.name = 'FeatureScaffoldError';
  }
}

/**
 * Computes what scaffolding WOULD do, without writing — the plan/apply split every tool in this
 * platform uses, so a caller can always show the human what is about to happen first. That matters
 * more here than usual: intake requires the proposed paths to be shown and confirmed before anything
 * is created (new_us_intake.md §6).
 *
 * @param {string} modulesDir
 * @param {string} moduleSlug
 * @param {string} featureSlug
 * @param {string} [dirname] - the folder name to scaffold under, instead of `features` (default).
 *   Generalized for the NDC Core Service layer's shared-scope entities (module_architecture.md,
 *   NDC section), which scaffold through this same file but under `shared/`.
 * @returns {{moduleSlug: string, featureSlug: string, featureDir: string, exists: boolean,
 *   createsFeaturesDir: boolean, createDirs: string[], createFiles: string[]}}
 */
function planFeatureScaffold(modulesDir, moduleSlug, featureSlug, dirname = FEATURES_DIRNAME) {
  assertValidModuleSlug(moduleSlug);
  assertValidModuleSlug(featureSlug);

  const dir = featureDir(modulesDir, moduleSlug, featureSlug, dirname);
  const exists = fs.existsSync(dir);
  const parentFeaturesDir = featuresDir(modulesDir, moduleSlug, dirname);
  const createsFeaturesDir = !fs.existsSync(parentFeaturesDir);

  const createDirs = [];
  if (createsFeaturesDir) createDirs.push(parentFeaturesDir);
  if (!exists) createDirs.push(dir);
  for (const stage of EAGER_FEATURE_STAGE_FOLDERS) {
    const stageDir = path.join(dir, stage);
    if (!fs.existsSync(stageDir)) createDirs.push(stageDir);
  }
  for (const sub of ['findings', 'evidence']) {
    const subDir = path.join(dir, 'discovery', sub);
    if (!fs.existsSync(subDir)) createDirs.push(subDir);
  }

  const createFiles = [];
  const stateFile = path.join(dir, FEATURE_STATE_FILENAME);
  if (!fs.existsSync(stateFile)) createFiles.push(stateFile);

  return {
    moduleSlug,
    featureSlug,
    featureDir: dir,
    exists,
    createsFeaturesDir,
    createDirs,
    createFiles,
  };
}

/**
 * Creates a standalone Feature's folder skeleton and its feature.json.
 *
 * Idempotent: an existing Feature is left as it is and existing files are NEVER overwritten, so
 * re-scaffolding cannot destroy a Feature's context artifact.
 *
 * @param {string} modulesDir
 * @param {string} moduleSlug
 * @param {string} featureSlug
 * @param {{now: Date, dryRun?: boolean, dirname?: string}} opts - `dirname` defaults to `features`
 *   (see planFeatureScaffold)
 * @returns {{plan: object, created: boolean, wrote: string[]}}
 */
function scaffoldFeature(modulesDir, moduleSlug, featureSlug, opts = {}) {
  const { now, dryRun = false, dirname = FEATURES_DIRNAME } = opts;
  if (!(now instanceof Date) || Number.isNaN(now.getTime())) {
    throw new FeatureScaffoldError('scaffoldFeature requires an explicit valid `now` Date.');
  }

  const plan = planFeatureScaffold(modulesDir, moduleSlug, featureSlug, dirname);
  if (dryRun) return { plan, created: false, wrote: [] };

  const module = requireModule(modulesDir, moduleSlug);
  if (module.status === 'Proposed') {
    throw new FeatureScaffoldError(
      `Parent module "${moduleSlug}" is still Proposed. Approve the module before scaffolding a ` +
      'Feature under it — otherwise the Feature folder scaffolds a module no human approved.'
    );
  }
  if (!fs.existsSync(path.join(modulesDir, moduleSlug))) {
    throw new FeatureScaffoldError(
      `Parent module "${moduleSlug}" has no folder on disk. Scaffold the module first; a Feature ` +
      'folder must not be what brings its parent module into existence.'
    );
  }

  const entry = findFeature(modulesDir, moduleSlug, featureSlug);
  if (!entry) {
    throw new FeatureScaffoldError(
      `No Feature "${featureSlug}" is registered under module "${moduleSlug}". Register it before ` +
      'scaffolding — a folder on disk with no registry entry is a Feature nothing can find.'
    );
  }
  if (entry.status === 'Proposed') {
    throw new FeatureScaffoldError(
      `Feature "${featureSlug}" is still Proposed. Confirm the intake classification and approve it ` +
      'before scaffolding — a scaffolded folder reads as an approved Feature.'
    );
  }

  const wrote = [];
  for (const dir of plan.createDirs) {
    fs.mkdirSync(dir, { recursive: true });
    wrote.push(dir);
  }

  const stateFile = path.join(plan.featureDir, FEATURE_STATE_FILENAME);
  if (!fs.existsSync(stateFile)) {
    writeJsonAtomic(stateFile, { ...entry, module: moduleSlug });
    wrote.push(stateFile);
  }

  return { plan, created: !plan.exists, wrote };
}

/**
 * Ensures a Feature stage's folder exists, created on first write by the stage that owns it.
 * @param {string} modulesDir
 * @param {string} moduleSlug
 * @param {string} featureSlug
 * @param {string} stage
 * @param {string} [dirname]
 * @returns {string}
 */
function ensureFeatureStageFolder(modulesDir, moduleSlug, featureSlug, stage, dirname = FEATURES_DIRNAME) {
  if (!FEATURE_STAGES.includes(stage)) {
    throw new FeatureScaffoldError(
      `Unknown feature stage "${stage}". Expected one of: ${FEATURE_STAGES.join(', ')}.`
    );
  }
  const dir = path.join(featureDir(modulesDir, moduleSlug, featureSlug, dirname), stage);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

/**
 * The repo-relative path to a Feature's folder or one of its stage folders, for artifact headers.
 * Always forward-slashed — these strings land in Markdown read on every platform.
 * @param {string} moduleSlug
 * @param {string} featureSlug
 * @param {string} [stage]
 * @param {string} [dirname]
 * @param {string} [rootPrefix] - repo-relative prefix before `<module>/`, default
 *   `platform_core_data/modules`. Supplier Features callers pass `platform_core_data/supplier-features`.
 * @returns {string}
 */
function featureArtifactPath(
  moduleSlug, featureSlug, stage, dirname = FEATURES_DIRNAME, rootPrefix = 'platform_core_data/modules'
) {
  const base = `${rootPrefix}/${moduleSlug}/${dirname}/${featureSlug}`;
  return stage ? `${base}/${stage}` : base;
}

module.exports = {
  EAGER_FEATURE_STAGE_FOLDERS,
  FeatureScaffoldError,
  planFeatureScaffold,
  scaffoldFeature,
  ensureFeatureStageFolder,
  featureArtifactPath,
};
