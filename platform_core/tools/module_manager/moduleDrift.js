// Per-Module Drift — "has the code under this module changed since we designed it?"
//
// See workflows_and_pipelines/pipeline/module_architecture.md §10.3.
//
// This extends run_manager's §5.8 drift machinery from runs to modules. The drift COMPUTATION is
// reused unchanged (computeDrift) rather than reimplemented — there must be exactly one definition
// of what "moved" means. What this module adds is the per-module question, which is strictly more
// useful than the per-run one: a run may span modules that have drifted very differently, and a
// single run-level status averages that away.
//
// Every "unknown" stays its own answer, never collapsed into "unchanged" — collapsing them is how a
// stale module's design gets silently trusted (run_manager.md §5.8).

const { computeDrift } = require('../run_manager/targetRef');
const { MODULE_STAGES, readRegistry, resolveModule } = require('./moduleRegistry');

/** Drift statuses that mean "this module's conclusions are unverified against current code". */
const SUSPECT_STATUSES = ['moved', 'unknown-no-git', 'unknown-no-anchor', 'unknown-unresolvable'];

/**
 * Computes drift for one module's stages.
 *
 * Each stage recorded the Target Project commit it last wrote against (`targetRefAtWrite`, §6.3), so
 * drift is answered per stage rather than per module: a module whose Discovery predates a change but
 * whose Test Design followed it has one stale stage, not two, and saying so is more useful than
 * flagging the whole module.
 *
 * @param {string} modulesDir
 * @param {string} slug
 * @param {{targetRoot: string, scopePaths?: string[], execFileSync?: Function}} opts
 * @returns {{module: string, stages: object, suspect: string[], anySuspect: boolean}}
 */
function computeModuleDrift(modulesDir, slug, opts = {}) {
  const { targetRoot, scopePaths = [], execFileSync } = opts;
  const module = resolveModule(modulesDir, slug);
  if (!module) throw new Error(`No module "${slug}" is registered.`);

  const stages = {};
  const suspect = [];

  for (const stage of MODULE_STAGES) {
    const state = module.stages?.[stage];
    if (!state || state.status === 'Not Started') continue;

    if (!state.targetRefAtWrite) {
      // A stage that ran before anchoring existed, or when git was unavailable. Reported as its own
      // status rather than assumed unchanged — an unversioned write is not an unchanged one.
      stages[stage] = {
        status: 'unknown-no-anchor',
        reason: `Stage "${stage}" recorded no targetRefAtWrite.`,
        writtenAt: state.lastUpdated ?? null,
      };
      suspect.push(stage);
      continue;
    }

    const anchor = {
      targetRef: state.targetRefAtWrite,
      targetRefScope: state.targetRefScope ?? scopePaths,
      targetRepoRoot: targetRoot,
    };

    const drift = computeDrift(targetRoot, anchor, execFileSync ? { execFileSync } : {});
    stages[stage] = { ...drift, writtenAt: state.lastUpdated ?? null };
    if (SUSPECT_STATUSES.includes(drift.status)) suspect.push(stage);
  }

  return { module: slug, stages, suspect, anySuspect: suspect.length > 0 };
}

/**
 * Drift for every registered module.
 * @param {string} modulesDir
 * @param {{targetRoot: string, scopePaths?: string[], execFileSync?: Function}} opts
 * @returns {Array<object>}
 */
function computeAllModuleDrift(modulesDir, opts = {}) {
  const registry = readRegistry(modulesDir);
  return (registry.modules || [])
    .filter((m) => m.status === 'Active')
    .map((m) => computeModuleDrift(modulesDir, m.slug, opts));
}

/**
 * Detects STALENESS — a different question from drift, and the one §10.4 is about.
 *
 * Drift asks "did the application change since we designed this?". Staleness asks "did an UPSTREAM
 * ARTIFACT change since the downstream one consumed it?". A Test Design suite produced before
 * Discovery was refined is stale regardless of whether any application code moved.
 *
 * Stale is a REPORT, never an automatic re-run (§10.4). Re-running a stage is a human decision at
 * that stage's own gate; this function's only job is to make the staleness impossible to miss.
 *
 * @param {string} modulesDir
 * @param {string} slug
 * @returns {Array<{stage: string, staleAgainst: string, downstreamUpdated: string, upstreamUpdated: string}>}
 */
function detectStaleStages(modulesDir, slug) {
  const module = resolveModule(modulesDir, slug);
  if (!module) throw new Error(`No module "${slug}" is registered.`);

  const stale = [];
  const stages = module.stages || {};

  // MODULE_STAGES is in pipeline order, so every earlier entry is upstream of every later one.
  for (let i = 1; i < MODULE_STAGES.length; i += 1) {
    const stage = MODULE_STAGES[i];
    const downstream = stages[stage];
    if (!downstream?.lastUpdated || downstream.status === 'Not Started') continue;

    for (let j = 0; j < i; j += 1) {
      const upstreamStage = MODULE_STAGES[j];
      const upstream = stages[upstreamStage];
      if (!upstream?.lastUpdated || upstream.status === 'Not Started') continue;

      if (new Date(upstream.lastUpdated) > new Date(downstream.lastUpdated)) {
        stale.push({
          stage,
          staleAgainst: upstreamStage,
          downstreamUpdated: downstream.lastUpdated,
          upstreamUpdated: upstream.lastUpdated,
        });
      }
    }
  }

  return stale;
}

module.exports = {
  SUSPECT_STATUSES,
  computeModuleDrift,
  computeAllModuleDrift,
  detectStaleStages,
};
