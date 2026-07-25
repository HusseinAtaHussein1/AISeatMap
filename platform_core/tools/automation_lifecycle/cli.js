#!/usr/bin/env node
// Automation Asset Lifecycle CLI. See workflows_and_pipelines/pipeline/pipeline.md §12.
//
// Usage:
//   node platform_core/tools/automation_lifecycle/cli.js copy-in --baseline <path> --run-package <path>
//   node platform_core/tools/automation_lifecycle/cli.js plan-merge --baseline <path> --run-package <path> [--json]
//   node platform_core/tools/automation_lifecycle/cli.js merge --baseline <path> --run-package <path> \
//     --project <Name> --package <PackageName> --run-folder <RUN> [--apply]
//   node platform_core/tools/automation_lifecycle/cli.js cleanup --run-package <path> --plan <planJsonPath> [--apply]

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { copyBaselineIntoRun, loadSnapshot, SNAPSHOT_FILENAME } = require('./baselineCopy');
const { computeMergePlan } = require('./mergePlan');
const { applyMerge } = require('./mergeApply');
const { cleanupRunPackage } = require('./cleanup');

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
  const result = copyBaselineIntoRun(args.baseline, args['run-package'], { execFileSync, now: new Date() });
  console.log(JSON.stringify(result, null, 2));
}

function cmdPlanMerge(args) {
  const snapshotPath = path.join(path.dirname(args['run-package']), SNAPSHOT_FILENAME);
  const snapshot = loadSnapshot(snapshotPath);
  const plan = computeMergePlan(args.baseline, args['run-package'], snapshot, { execFileSync });
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
  const snapshotPath = path.join(path.dirname(args['run-package']), SNAPSHOT_FILENAME);
  const snapshot = loadSnapshot(snapshotPath);
  const plan = computeMergePlan(args.baseline, args['run-package'], snapshot, { execFileSync });
  const result = applyMerge(
    args.baseline,
    args['run-package'],
    plan,
    { project: args.project, packageName: args.package, runFolder: args['run-folder'] },
    { execFileSync, now: new Date(), apply: Boolean(args.apply) },
  );
  console.log(JSON.stringify({ plan, result }, null, 2));
}

function cmdCleanup(args) {
  const plan = JSON.parse(fs.readFileSync(args.plan, 'utf8'));
  const result = cleanupRunPackage(args['run-package'], plan, { apply: Boolean(args.apply) });
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
