// Automation Root Resolution — the one place any stage learns WHERE a module's executable
// automation lives. See workflows_and_pipelines/pipeline/pipeline.md §12.9.
//
// Since 2026-08-17 a module has exactly two possible homes over its lifetime, never both at once:
//
//   Draft    (state Generated / Executed / Healed / Approved, sourceOfTruth 'module')
//            -> platform_core_data/modules/{slug}/automation/tests_{Framework}/
//
//   Promoted (state Promoted, sourceOfTruth 'baseline')
//            -> platform_core_data/automation_baseline/{framework}/tests_{Framework}/
//            scoped to the module's owned paths (baselineOwnership.js)
//
// EVERY stage resolves through this function. No skill, script, or agent hardcodes either path,
// because the whole point of the two-home model is that the answer changes over a module's life and
// a hardcoded path is a caller quietly asserting it has not.
//
// THE RESURRECTION GUARD is the reason this returns rather than throws in the ordinary case but
// throws hard in one specific one: if a Promoted module has a tests_{Framework}/ directory again,
// something recreated a working copy this lifecycle retired on purpose. That directory cannot be
// trusted — it is either a stale restore, a mis-scoped copy, or a tool that did not know about
// promotion — and silently preferring the baseline would leave someone editing files they believe
// are live. So resolution STOPS and reports, per the user-mandated safety rule (§12.10 rule 3).

const fs = require('fs');
const path = require('path');

const { readAutomationState } = require('../module_manager/automationState');
const { readOwnership } = require('./baselineOwnership');

class AutomationRootError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'AutomationRootError';
    this.code = code;
  }
}

function toPosix(p) {
  return String(p).split(path.sep).join('/');
}

/**
 * The module working copy's conventional path — used to LOOK for a directory that should not exist
 * as much as to return one that should.
 * @param {string} modulesDir
 * @param {string} slug
 * @param {string} framework
 * @returns {string}
 */
function moduleAutomationPath(modulesDir, slug, framework) {
  return path.join(modulesDir, slug, 'automation', `tests_${framework}`);
}

/**
 * @param {string} baselineRoot - platform_core_data/automation_baseline
 * @param {string} framework - e.g. 'SHAFT'
 * @returns {string}
 */
function baselineAutomationPath(baselineRoot, framework) {
  return path.join(baselineRoot, String(framework).toLowerCase(), `tests_${framework}`);
}

/**
 * Resolves where `slug`'s automation code lives right now.
 *
 * @param {string} slug
 * @param {{modulesDir: string, baselineRoot: string, framework?: string, fs?: object}} opts
 * @returns {{mode: 'module'|'baseline', root: string, framework: string, state: string,
 *            ownedPaths: string[], suite: string|null, exists: boolean, slug: string}}
 * @throws {AutomationRootError} when the module has no automation, when a Promoted module's working
 *   copy has reappeared, or when a Promoted module's baseline is missing.
 */
function resolveAutomationRoot(slug, opts = {}) {
  const fsImpl = opts.fs || fs;
  const { modulesDir, baselineRoot } = opts;
  if (!modulesDir || !baselineRoot) {
    throw new AutomationRootError(
      'resolveAutomationRoot requires both `modulesDir` and `baselineRoot` — resolution depends on ' +
      'comparing the two homes, so neither may be inferred.',
      'MISSING_ROOTS'
    );
  }

  const state = readAutomationState(modulesDir, slug);
  if (!state) {
    throw new AutomationRootError(
      `Module "${slug}" has no automation state. Stage 4A has not generated automation for it yet, ` +
      'so it has no automation root in either location.',
      'NO_AUTOMATION'
    );
  }

  const framework = opts.framework || state.framework;
  if (!framework) {
    throw new AutomationRootError(
      `Module "${slug}" records no framework, so neither automation path can be built. Pass ` +
      '`framework` explicitly or repair .module_automation_state.json.',
      'NO_FRAMEWORK'
    );
  }

  const modulePath = moduleAutomationPath(modulesDir, slug, framework);
  const promoted = state.state === 'Promoted' || state.sourceOfTruth === 'baseline';

  if (!promoted) {
    return {
      slug,
      mode: 'module',
      root: toPosix(modulePath),
      framework,
      state: state.state,
      ownedPaths: [],
      suite: null,
      exists: fsImpl.existsSync(modulePath),
    };
  }

  // --- Promoted from here down. Both guards below are hard stops, never warnings. ---

  if (fsImpl.existsSync(modulePath)) {
    throw new AutomationRootError(
      `Module "${slug}" is Promoted — the Workspace Automation Baseline is its single source of ` +
      `truth and its working copy was retired on ${state.promotedAt || 'promotion'}. But a ` +
      `directory has reappeared at:\n  ${toPosix(modulePath)}\n` +
      'This is NOT a usable working copy: it is a stale restore, a mis-scoped copy, or a tool that ' +
      'does not know about promotion, and anything edited there would never reach the suite that ' +
      'actually runs. Stopping instead of choosing for you. Inspect it, salvage anything genuinely ' +
      'new into the baseline, then delete it (pipeline.md §12.10, safety rule 3).',
      'MODULE_DIR_RESURRECTED'
    );
  }

  const baselinePath = baselineAutomationPath(baselineRoot, framework);
  if (!fsImpl.existsSync(baselinePath)) {
    throw new AutomationRootError(
      `Module "${slug}" is Promoted, so its code should live at:\n  ${toPosix(baselinePath)}\n` +
      'but that directory does not exist. The module has no working copy to fall back to — this is ' +
      'a missing baseline, and restoring it from git history is the only correct recovery.',
      'BASELINE_MISSING'
    );
  }

  const manifest = readOwnership(baselinePath, { fs: fsImpl });
  const claim = manifest && manifest.modules ? manifest.modules[slug] : null;

  return {
    slug,
    mode: 'baseline',
    root: toPosix(baselinePath),
    framework,
    state: state.state,
    ownedPaths: claim ? [...claim.owned] : [...(state.ownedPaths || [])],
    suite: claim && claim.suite ? claim.suite : null,
    exists: true,
  };
}

/**
 * The check step 8 of the promotion order asks for: confirm a retired directory has not come back.
 *
 * Separate from resolveAutomationRoot() because it must be runnable as a standalone assertion —
 * after a promotion, in CI, or before a release — without a caller needing a root back.
 *
 * @param {string} slug
 * @param {{modulesDir: string, framework?: string, fs?: object}} opts
 * @returns {{ok: boolean, checkedPath: string, message: string}}
 */
function assertModuleDirRetired(slug, opts = {}) {
  const fsImpl = opts.fs || fs;
  const { modulesDir } = opts;
  const state = readAutomationState(modulesDir, slug);
  if (!state || state.state !== 'Promoted') {
    return {
      ok: true,
      checkedPath: '',
      message: `Module "${slug}" is not Promoted; it is expected to have a working copy.`,
    };
  }

  const framework = opts.framework || state.framework;
  const modulePath = moduleAutomationPath(modulesDir, slug, framework);
  const exists = fsImpl.existsSync(modulePath);
  return {
    ok: !exists,
    checkedPath: toPosix(modulePath),
    message: exists
      ? `RETIRED DIRECTORY HAS REAPPEARED: ${toPosix(modulePath)} exists for Promoted module ` +
        `"${slug}". Do not use it (pipeline.md §12.10, safety rule 3).`
      : `Confirmed retired: ${toPosix(modulePath)} does not exist, as expected for Promoted module ` +
        `"${slug}".`,
  };
}

module.exports = {
  AutomationRootError,
  moduleAutomationPath,
  baselineAutomationPath,
  resolveAutomationRoot,
  assertModuleDirRetired,
};
