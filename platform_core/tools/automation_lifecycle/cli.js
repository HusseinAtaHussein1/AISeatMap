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
//
// PROMOTION AS A TERMINAL MOVE (2026-08-17, user-mandated) — pipeline.md §12.5/§12.9/§12.10:
//
//   node .../cli.js resolve-root --module <slug> [--json]
//                                              # WHERE this module's code lives right now. Every
//                                              # stage asks this instead of building a path.
//   node .../cli.js verify-promotion --baseline <path> --package <path> [--json]
//                                              # byte-identity proof, required before retirement
//   node .../cli.js retire-module --module <slug> --baseline <path> --package <path> \
//     --owned <glob,glob> [--shared <glob,glob>] [--suite <file>] --by "<name>" [--apply]
//                                              # verify -> register ownership -> delete the module
//                                              # working copy -> record Promoted. Dry-run default.
//   node .../cli.js check-retired --module <slug>
//                                              # asserts a retired directory has NOT come back
//   node .../cli.js check-ownership --module <slug> --baseline <path> [--paths a,b,c]
//                                              # classifies changed baseline paths as owned/shared/
//                                              # foreign; non-zero exit on any foreign path
//
// `--modules-dir` overrides where modules/ is looked for (defaults to platform_core_data/modules).

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { copyBaselineIntoModule, loadSnapshot, SNAPSHOT_FILENAME } = require('./baselineCopy');
const { computeMergePlan } = require('./mergePlan');
const { applyMerge } = require('./mergeApply');
const { cleanupPackage, retireModulePackage } = require('./cleanup');
const { resolveAutomationRoot, assertModuleDirRetired } = require('./automationRoot');
const { verifyPromotion, renderVerificationReport } = require('./promoteVerify');
const { registerModuleOwnership, readOwnership, classifyChangeset } = require('./baselineOwnership');
const { recordPromotion, readAutomationState } = require('../module_manager/automationState');

const DEFAULT_MODULES_DIR = 'platform_core_data/modules';

function modulesDir(args) {
  return typeof args['modules-dir'] === 'string' ? args['modules-dir'] : DEFAULT_MODULES_DIR;
}

/** Splits a comma-separated CLI list, tolerating spaces and a trailing comma. */
function listArg(value) {
  if (typeof value !== 'string') return [];
  return value.split(',').map((s) => s.trim()).filter(Boolean);
}

function requiredArg(args, name, why) {
  const value = args[name];
  if (typeof value !== 'string' || !value) {
    throw new Error(`Missing --${name} — ${why}`);
  }
  return value;
}

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

function cmdResolveRoot(args) {
  const slug = requiredArg(args, 'module', 'resolution is per module.');
  const resolved = resolveAutomationRoot(slug, {
    modulesDir: modulesDir(args),
    baselineRoot: args.baseline || 'platform_core_data/automation_baseline',
    framework: typeof args.framework === 'string' ? args.framework : undefined,
  });
  if (args.json) {
    console.log(JSON.stringify(resolved, null, 2));
    return resolved;
  }
  console.log(`Module:        ${resolved.slug}`);
  console.log(`State:         ${resolved.state}`);
  console.log(`Source of truth: ${resolved.mode === 'baseline' ? 'Workspace Automation Baseline' : 'module workspace'}`);
  console.log(`Root:          ${resolved.root}`);
  console.log(`Exists:        ${resolved.exists}`);
  if (resolved.mode === 'baseline') {
    console.log(`Owned paths:   ${resolved.ownedPaths.join(', ') || '(none declared)'}`);
    console.log(`Module suite:  ${resolved.suite || '(none)'}`);
  }
  return resolved;
}

function cmdVerifyPromotion(args) {
  const report = verifyPromotion(args.baseline, packagePath(args), { execFileSync });
  if (args.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(renderVerificationReport(report));
  }
  // A failed verification must be visible to a shell script, not just to a reader.
  if (!report.passed) process.exitCode = 1;
  return report;
}

/**
 * verify -> register ownership -> retire the working copy -> record Promoted.
 *
 * Ordered so nothing irreversible happens before its own precondition is proven, and so a dry run
 * exercises every check except the delete. Ownership is registered BEFORE the deletion on purpose:
 * if the process dies between the two, the baseline still knows who owns what, whereas a deletion
 * with no ownership record would leave code in the baseline that no module can claim.
 */
function cmdRetireModule(args) {
  const slug = requiredArg(args, 'module', 'retirement is per module.');
  const baseline = requiredArg(args, 'baseline', 'the baseline path is what gets verified against.');
  const pkg = packagePath(args);
  const owned = listArg(args.owned);
  const apply = Boolean(args.apply);
  const dir = modulesDir(args);

  if (owned.length === 0) {
    throw new Error(
      'Missing --owned — the baseline paths this module owns. Without them the module cannot be ' +
      'located inside the shared baseline afterwards (pipeline.md §12.9).'
    );
  }
  const promotedBy = requiredArg(args, 'by', 'an unattributed promotion record is not a record.');

  const state = readAutomationState(dir, slug);
  if (!state) throw new Error(`Module "${slug}" has no automation state.`);

  const verification = verifyPromotion(baseline, pkg, { execFileSync });
  console.log(renderVerificationReport(verification));
  if (!verification.passed) {
    process.exitCode = 1;
    console.error('Retirement ABORTED — verification failed. The module working copy is untouched.');
    return { verification, retired: null };
  }

  if (!apply) {
    const preview = retireModulePackage(pkg, { verification, apply: false });
    console.log(JSON.stringify({ dryRun: true, wouldRetire: preview, ownedPaths: owned }, null, 2));
    return { verification, retired: preview };
  }

  const manifest = registerModuleOwnership(baseline, slug, {
    owned,
    shared: listArg(args.shared).length ? listArg(args.shared) : undefined,
    suite: typeof args.suite === 'string' ? args.suite : undefined,
    baselineRef: typeof args['baseline-ref'] === 'string' ? args['baseline-ref'] : undefined,
    promotedAt: new Date().toISOString(),
    now: new Date(),
  });

  const retired = retireModulePackage(pkg, { verification, apply: true });

  const promoted = recordPromotion(dir, slug, {
    now: new Date(),
    baselinePath: baseline,
    ownedPaths: owned,
    retiredPath: retired.path,
    verification: { passed: true, fileCount: verification.verifiedCount },
    promotedBy,
    baselineRef: typeof args['baseline-ref'] === 'string' ? args['baseline-ref'] : undefined,
    note: typeof args.note === 'string' ? args.note : undefined,
  });

  console.log(JSON.stringify({
    retired, ownership: manifest.modules[slug], state: promoted.state, sourceOfTruth: promoted.sourceOfTruth,
  }, null, 2));
  return { verification, retired, promoted };
}

function cmdCheckRetired(args) {
  const slug = requiredArg(args, 'module', 'the check is per module.');
  const result = assertModuleDirRetired(slug, {
    modulesDir: modulesDir(args),
    framework: typeof args.framework === 'string' ? args.framework : undefined,
  });
  console.log(result.message);
  if (!result.ok) process.exitCode = 1;
  return result;
}

function cmdCheckOwnership(args) {
  const slug = requiredArg(args, 'module', 'ownership is judged from one module\'s point of view.');
  const baseline = requiredArg(args, 'baseline', 'the manifest lives in the baseline.');
  const manifest = readOwnership(baseline);
  let paths = listArg(args.paths);

  // With no explicit list, judge what has actually changed in the baseline right now — the check a
  // stage runs after editing, when the question is "did I stay in my lane?".
  if (paths.length === 0) {
    const porcelain = execFileSync('git', ['status', '--porcelain', '--', baseline], { encoding: 'utf8' });
    paths = porcelain.split('\n').map((l) => l.slice(3).trim()).filter(Boolean)
      .map((p) => path.relative(path.resolve(baseline), path.resolve(p)).split(path.sep).join('/'))
      .filter((p) => p && !p.startsWith('..'));
  }

  const result = classifyChangeset(manifest, paths, slug);
  console.log(JSON.stringify(result, null, 2));
  if (!result.allowed) {
    console.error(
      `OWNERSHIP VIOLATION: ${result.foreign.length} path(s) belong to another module. ` +
      'Scope the change to this module and its genuinely shared dependencies (pipeline.md §12.9).'
    );
    process.exitCode = 1;
  }
  return result;
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
    case 'resolve-root':
      cmdResolveRoot(args);
      break;
    case 'verify-promotion':
      cmdVerifyPromotion(args);
      break;
    case 'retire-module':
      cmdRetireModule(args);
      break;
    case 'check-retired':
      cmdCheckRetired(args);
      break;
    case 'check-ownership':
      cmdCheckOwnership(args);
      break;
    default:
      console.error(
        'Usage: cli.js <copy-in|plan-merge|merge|cleanup|resolve-root|verify-promotion|'
        + 'retire-module|check-retired|check-ownership> [options]'
      );
      process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}

module.exports = { parseArgs };
