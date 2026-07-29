#!/usr/bin/env node
// Automation Asset Lifecycle CLI. See workflows_and_pipelines/pipeline/pipeline.md §12.
//
// Usage — `--package` is the package being worked on: since 2026-07-29 that is the MODULE AUTOMATION
// PROJECT at platform_core_data/modules/{slug}/automation/tests_{Framework}/ (pipeline.md §12.1).
// `--run-package` is accepted as its pre-migration alias.
//
//   node platform_core/tools/automation_lifecycle/cli.js copy-in --baseline <path> --package <path>
//   node platform_core/tools/automation_lifecycle/cli.js plan-merge --baseline <path> --package <path> [--json]
//   node platform_core/tools/automation_lifecycle/cli.js merge --baseline <path> --package <path> \
//     --project <Name> --package-name <PackageName> --module <slug> --run-folder <RUN> [--apply]
//   node platform_core/tools/automation_lifecycle/cli.js cleanup --package <path> --plan <planJsonPath> \
//     [--scope build-only|all-accounted] [--apply]
//
// `cleanup` defaults to --scope build-only, which keeps a module project's SOURCE and removes only
// build/IDE output (pipeline.md §12.5). Pass --scope all-accounted only for a location meant to
// disappear after the merge.

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { copyBaselineIntoModule, loadSnapshot, SNAPSHOT_FILENAME } = require('./baselineCopy');
const { computeMergePlan } = require('./mergePlan');
const { applyMerge } = require('./mergeApply');
const { cleanupPackage } = require('./cleanup');

/**
 * Resolves the package PATH from `--run-package` (pre-migration) or `--package` (current).
 *
 * `--run-package` is checked FIRST on purpose. In the old `merge` spelling, `--package` carried the
 * package *name* while `--run-package` carried the path; preferring `--package` would hand a package
 * name to `fs` and fail somewhere with no connection to the mistake. When `--run-package` is present
 * it is unambiguously the path, so it wins.
 *
 * Missing is an explicit error rather than an `undefined` handed to `fs`, for the same reason.
 */
function packagePath(args) {
  const p = args['run-package'] || args.package;
  if (!p || p === true) {
    throw new Error(
      'Missing --package (the module automation project path, e.g. '
      + 'platform_core_data/modules/login/automation/tests_PW). --run-package is accepted as its '
      + 'pre-migration alias.'
    );
  }
  return p;
}

/**
 * Resolves the package NAME from `--package-name` (current) or `--package` (old spelling).
 *
 * `--package` only counts as a name when it is not also serving as the path — i.e. when
 * `--run-package` supplied the path. Returns undefined otherwise, which applyMerge() renders as a
 * missing segment rather than a wrong one.
 */
function packageName(args) {
  if (typeof args['package-name'] === 'string') return args['package-name'];
  if (args['run-package'] && typeof args.package === 'string') return args.package;
  return undefined;
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) {
        out[key] = true;
      } else {
        out[key] = next;
        i += 1;
      }
    }
  }
  return out;
}

function cmdCopyIn(args) {
  const result = copyBaselineIntoModule(args.baseline, packagePath(args), { execFileSync, now: new Date() });
  console.log(JSON.stringify(result, null, 2));
}

function cmdPlanMerge(args) {
  const pkg = packagePath(args);
  const snapshotPath = path.join(path.dirname(pkg), SNAPSHOT_FILENAME);
  const snapshot = loadSnapshot(snapshotPath);
  const plan = computeMergePlan(args.baseline, pkg, snapshot, { execFileSync });
  if (args.json) {
    console.log(JSON.stringify(plan, null, 2));
  } else {
    console.log(`Baseline: ${plan.baselinePath}`);
    console.log(`Dirty: ${plan.dirty.length ? plan.dirty.join('; ') : 'clean'}`);
    console.log(`Baseline moved since snapshot: ${plan.baselineMoved}`);
    console.log(`Added (${plan.added.length}): ${plan.added.join(', ') || '-'}`);
    console.log(`Modified (${plan.modified.length}): ${plan.modified.join(', ') || '-'}`);
    console.log(`Deleted (${plan.deleted.length}): ${plan.deleted.join(', ') || '-'}`);
    console.log(`Renamed (${plan.renamed.length}): ${plan.renamed.map((r) => `${r.from}->${r.to}`).join(', ') || '-'}`);
    console.log(`Conflicts (${plan.conflicts.length}): ${plan.conflicts.join(', ') || '-'}`);
    console.log(`Discarded/ignored (${plan.discardedIgnored.length}): ${plan.discardedIgnored.join(', ') || '-'}`);
  }
  return plan;
}

function cmdMerge(args) {
  const pkg = packagePath(args);
  const snapshotPath = path.join(path.dirname(pkg), SNAPSHOT_FILENAME);
  const snapshot = loadSnapshot(snapshotPath);
  const plan = computeMergePlan(args.baseline, pkg, snapshot, { execFileSync });
  const result = applyMerge(
    args.baseline,
    pkg,
    plan,
    {
      project: args.project,
      packageName: packageName(args),
      // The source module's slug, recorded in the assembly commit message (pipeline.md §12.4 step 4).
      module: typeof args.module === 'string' ? args.module : undefined,
      runFolder: args['run-folder'],
    },
    { execFileSync, now: new Date(), apply: Boolean(args.apply) },
  );
  console.log(JSON.stringify({ plan, result }, null, 2));
}

function cmdCleanup(args) {
  const plan = JSON.parse(fs.readFileSync(args.plan, 'utf8'));
  const result = cleanupPackage(packagePath(args), plan, {
    apply: Boolean(args.apply),
    // Undefined falls through to cleanup.js's own safe default ('build-only'), so the default lives
    // in exactly one place rather than being restated here.
    scope: typeof args.scope === 'string' ? args.scope : undefined,
  });
  console.log(JSON.stringify(result, null, 2));
}

function main() {
  const [sub, ...rest] = process.argv.slice(2);
  const args = parseArgs(rest);

  switch (sub) {
    case 'copy-in':
      cmdCopyIn(args);
      break;
    case 'plan-merge':
      cmdPlanMerge(args);
      break;
    case 'merge':
      cmdMerge(args);
      break;
    case 'cleanup':
      cmdCleanup(args);
      break;
    default:
      console.error('Usage: cli.js <copy-in|plan-merge|merge|cleanup> [options]');
      process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}

module.exports = { parseArgs };
