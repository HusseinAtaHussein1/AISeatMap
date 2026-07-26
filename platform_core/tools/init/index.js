// Install/upgrade/uninstall for the Agentic AI Testing Platform.
//
// Two install routes share this code exactly: `npx agentic-testing init` and a git clone plus
// scripts/init.sh both call installPlatform() below, so the two cannot drift.

const { buildPlan, renderPlan, inferTargetRoot, InitError, ...planExports } = require('./plan');
const { applyPlan, buildManifest } = require('./apply');
const fragments = require('./fragments');
const templates = require('./templates');

/**
 * Plan and (unless `dryRun`) perform an install.
 *
 * @param {object} opts see buildPlan; plus `dryRun` and `now`
 * @returns {{plan: object, applied: object[]|null, manifest: object|null}}
 */
function installPlatform(opts) {
  const plan = buildPlan(opts);
  if (opts.dryRun) return { plan, applied: null, manifest: null };

  const { applied, manifest } = applyPlan(plan, {
    fs: opts.fs,
    now: opts.now,
    execFileSync: opts.execFileSync,
    onProgress: opts.onProgress,
  });
  return { plan, applied, manifest };
}

module.exports = {
  installPlatform,
  buildPlan,
  renderPlan,
  applyPlan,
  buildManifest,
  inferTargetRoot,
  InitError,
  fragments,
  templates,
  ...planExports,
};
