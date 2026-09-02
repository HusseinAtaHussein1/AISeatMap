#!/usr/bin/env node
// Module Manager CLI — the module registry and the Active Module pointer.
//
// This is the one place the pipeline's current module selection is read or changed
// (module_architecture.md §6). A stage resolves which module it is working on through `active`,
// never from conversational context.
//
// Usage:
//   node platform_core/tools/module_manager/cli.js list [--json]
//                                              # every module, status, active marked *
//   node .../cli.js active [--json]            # what is active, and what the selection means
//   node .../cli.js use <slug>[,<slug>...]     # activate one or several (sticky)
//   node .../cli.js use --all                  # activate every approved module (full-project)
//   node .../cli.js show <slug> [--json]       # one module's full state
//   node .../cli.js clear                      # clear the selection
//
//   node .../cli.js propose --name "Flight Search" [--description "..."] [--prd <path>]
//                                              # Stage 1's module decomposition proposal
//   node .../cli.js approve [<slug>...] --by "Reviewer Name"
//                                              # the write side of Stage 1's Human Review gate
//   node .../cli.js scaffold <slug> [--dry-run] # create the module's folder skeleton
//   node .../cli.js summary <slug>             # regenerate the module's README.md
//   node .../cli.js stage <slug> <stage> --status <Approved|...> [--artifact P] [--run R]
//                                              # record a stage's progress
//   node .../cli.js automation <slug> --state <Generated|Executed|Healed|Approved> [--by R]
//                                              # record the module automation project's lifecycle
//   node .../cli.js drift [<slug>] [--json]    # per-module drift + staleness
//
//   # New User Story intake — standalone Features (new_us_intake.md, module_architecture.md §5.5)
//   node .../cli.js inspect-scope [--user-story US-4222] [--name "..."] [--json]
//                                              # the existing-scope sweep run BEFORE anything is
//                                              # created. exit 2 = overlap candidates to ask about
//   node .../cli.js feature list [<module>] [--json]
//   node .../cli.js feature propose <module> --name "..." [--user-story US-1234] [--ac-ref <path>]
//   node .../cli.js feature approve <module> [<feature>...] --by "Reviewer"
//   node .../cli.js feature scaffold <module> <feature> [--dry-run]
//   node .../cli.js feature show <module> <feature> [--json]
//   node .../cli.js feature stage <module> <feature> <stage> --status <Approved|...>
//   node .../cli.js use-feature <module> <feature>   # activate Feature scope (decision C)
//
// A Feature is always a CHILD of a module, never a peer — which is why every Feature verb names its
// module. A CRUD area (Add/Update/Search/Approve/Reject for one entity) is NOT a Feature and gets no
// feature folder; that classification is a human decision made at intake, never inferred here.
//
// --modules-dir overrides where modules/ is looked for (defaults to the conventional location).

const fs = require('fs');
const path = require('path');

const {
  MODULE_STAGES,
  STAGE_STATUSES,
  ModuleRegistryError,
  readRegistry,
  resolveModule,
  registerModule,
  recordStage,
  proposeModules,
  approveModules,
  listModules,
} = require('./moduleRegistry');
const {
  ActiveModuleError,
  ActiveFeatureError,
  setActiveModules,
  setActiveModulesToAll,
  setActiveFeature,
  clearActiveFeature,
  readActiveModules,
  resolveActiveFeature,
  isActiveModuleStale,
  isActiveModuleSuperseded,
  isActiveFeatureStale,
  clearActiveModules,
} = require('./activeModule');
const { ModuleScaffoldError, scaffoldModule, planScaffold } = require('./moduleScaffold');
const {
  FEATURE_STAGES,
  FeatureRegistryError,
  approveFeatures,
  findScopeOverlap,
  listAllFeatures,
  listFeatures,
  proposeFeature,
  recordFeatureStage,
  resolveFeature,
} = require('./featureRegistry');
const {
  FeatureScaffoldError, planFeatureScaffold, scaffoldFeature,
} = require('./featureScaffold');
const {
  AUTOMATION_STATES, AutomationStateError, setAutomationState, readAutomationState,
} = require('./automationState');
const { computeModuleDrift, computeAllModuleDrift, detectStaleStages } = require('./moduleDrift');
const { writeModuleSummary } = require('./moduleSummary');
const { ModuleSlugError, generateModuleSlug } = require('./moduleSlug');

// NDC Core Service layer: Service → Feature → Supplier/Shared (module_architecture.md, NDC section).
const {
  ServiceRegistryError,
  proposeServices,
  approveServices,
  scaffoldService,
  listServices,
} = require('./serviceRegistry');
const {
  ActiveServiceError,
  findFeatureAcrossServices,
  setActiveNdcFeature,
  setActiveSupplier,
  readActiveService,
} = require('./activeService');
const {
  SupplierRegistryError,
  proposeSupplier,
  approveSuppliers,
  recordSupplierStage,
  resolveSupplier,
  scaffoldSupplier,
  listSuppliers,
  listAllSuppliers,
} = require('./supplierRegistry');

const VERBS = new Set([
  'list', 'active', 'use', 'show', 'clear',
  'propose', 'approve', 'scaffold', 'summary', 'stage', 'automation', 'drift',
  // New User Story intake (new_us_intake.md): standalone Features and the scope sweep that runs
  // before anything is created.
  'feature', 'use-feature', 'inspect-scope',
  // NDC Core Service layer — its own namespace, kept separate from the verbs above (which must keep
  // working byte-for-byte identically for agency/branch/plain modules).
  'ndc',
]);

/** A malformed invocation — reported like every other named error, never as a stack trace. */
class CliUsageError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CliUsageError';
  }
}

/**
 * Every flag any verb reads. A flag absent from this set is a typo, and `parseArgs` refuses it.
 *
 * This matters more here than in a typical CLI: most of these flags carry *provenance* —
 * `--run`, `--by`, `--target-ref`, `--artifact`. Silently ignoring an unrecognized flag would
 * accept `--lastRun run-001` and record `lastRun: null`, leaving a module's audit trail quietly
 * incomplete while the command reported success. A stage recording its own progress is exactly
 * the caller least able to notice that, so a wrong flag has to fail loudly instead
 * (module_architecture.md §6.3 — every recorded field is the basis of drift and staleness).
 */
const KNOWN_FLAGS = new Set([
  'all', 'artifact', 'baseline-ref', 'by', 'description', 'dry-run', 'framework', 'help',
  'json', 'modules-dir', 'name', 'no-revision', 'note', 'now', 'prd', 'run', 'scope',
  'scope-paths', 'state', 'status', 'target-ref', 'target-root',
  // Intake flags. `--user-story` is what makes overlap detection possible later without re-reading
  // every context document, and `--ac-ref` points at the acceptance criteria a human compares
  // when the tool reports a candidate (intake rule #9 — never decide overlap from a story number).
  'user-story', 'ac-ref', 'module', 'feature',
  // NDC Core Service layer.
  'services-dir',
]);

function parseArgs(argv) {
  const out = { _: [] };
  const unknown = [];
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      if (!KNOWN_FLAGS.has(key)) {
        unknown.push(arg);
        // Still consume an attached value, so it is not mistaken for a positional argument and
        // reported as a second, confusing error.
        const peek = argv[i + 1];
        if (peek !== undefined && !peek.startsWith('--')) i += 1;
        continue;
      }
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) {
        out[key] = true;
      } else {
        out[key] = next;
        i += 1;
      }
    } else {
      out._.push(arg);
    }
  }
  if (unknown.length > 0) {
    const known = [...KNOWN_FLAGS].sort().map((f) => `--${f}`).join(' ');
    throw new CliUsageError(
      `Unknown option${unknown.length > 1 ? 's' : ''}: ${unknown.join(', ')}\n`
      + `Known flags: ${known}`,
    );
  }
  return out;
}

/**
 * Where modules/ lives, and where the Target Project is.
 *
 * Roots come from platform_paths and NEVER from this file's own location — pipeline.md §1.1 is
 * explicit that an agent must never infer a root from process.cwd()/__dirname. Installed inside a
 * host project, `__dirname/../../..` is the HOST's repository rather than the tool folder, which is
 * exactly how artifacts land in the wrong place. `--modules-dir` still wins, for tests and for
 * inspecting another checkout. Mirrors run_manager/cli.js's resolveRoots().
 */
function resolveRoots(args) {
  const explicit = args['modules-dir'] && args['modules-dir'] !== true;
  let roots = null;
  try {
    roots = require('../platform_paths/paths').resolveRoots();
  } catch (err) {
    if (!explicit) {
      console.error(
        `Could not resolve platform roots (${err.message}).\n` +
        'Pass --modules-dir <path> explicitly, or fix platform.config.json.'
      );
      process.exitCode = 1;
      return null;
    }
  }
  const modulesDir = explicit
    ? path.resolve(args['modules-dir'])
    : path.join(roots.dataRoot, 'modules');
  // --target-root pairs with --modules-dir: overriding only one would leave drift computed against
  // a different project than the modules belong to, silently reporting the wrong answer.
  const targetRoot = (args['target-root'] && args['target-root'] !== true)
    ? path.resolve(args['target-root'])
    : (roots ? roots.targetRoot : null);
  return { modulesDir, targetRoot };
}

function resolveModulesDir(args) {
  const r = resolveRoots(args);
  return r ? r.modulesDir : null;
}

/**
 * Where services/ lives — a SIBLING of modules/, never nested inside it (module_architecture.md,
 * NDC section). `--services-dir` overrides, mirroring `--modules-dir`.
 */
function resolveServicesDir(args) {
  const explicit = args['services-dir'] && args['services-dir'] !== true;
  if (explicit) return path.resolve(args['services-dir']);
  try {
    const roots = require('../platform_paths/paths').resolveRoots();
    return path.join(roots.dataRoot, 'services');
  } catch (err) {
    console.error(
      `Could not resolve platform roots (${err.message}).\n` +
      'Pass --services-dir <path> explicitly, or fix platform.config.json.'
    );
    process.exitCode = 1;
    return null;
  }
}

function now(args) {
  const value = args.now && args.now !== true ? new Date(args.now) : new Date();
  if (Number.isNaN(value.getTime())) {
    throw new ModuleRegistryError(`Invalid --now value: ${args.now}`);
  }
  return value;
}

function cmdList(args) {
  const modulesDir = resolveModulesDir(args);
  if (!modulesDir) return;

  const modules = listModules(modulesDir);
  const active = new Set(readActiveModules(modulesDir).modules);

  if (args.json) {
    console.log(JSON.stringify(
      modules.map((m) => ({ ...m, active: active.has(m.slug) })),
      null,
      2
    ));
    return;
  }

  if (!modules.length) {
    console.log('No modules registered yet.');
    console.log('Stage 1 proposes the module decomposition from the PRD; approve it to create modules.');
    return;
  }

  for (const m of modules) {
    const marker = active.has(m.slug) ? '*' : ' ';
    const stages = m.stagesPresent?.length ? m.stagesPresent.join(', ') : 'none';
    console.log(`${marker} ${m.slug.padEnd(28)} ${String(m.status).padEnd(11)} ${m.name}`);
    console.log(`  ${''.padEnd(28)} stages on disk: ${stages}`);
  }
}

function cmdActive(args) {
  const modulesDir = resolveModulesDir(args);
  if (!modulesDir) return;

  if (isActiveModuleStale(modulesDir)) {
    console.error(
      'The active module selection names a module that is no longer registered. ' +
      'Run `cli.js list` and re-select — this is an error, not a prompt to fall back.'
    );
    process.exitCode = 1;
    return;
  }

  const state = readActiveModules(modulesDir);
  // A stale FEATURE pointer is reported, but does not make `active` fail — you must be able to LOOK
  // at a broken pointer in order to fix it. What must fail is any stage trying to RESOLVE it, and
  // that is resolveActiveFeature()'s job (decision C — never fall back silently).
  const featureStale = isActiveFeatureStale(modulesDir);
  // Likewise, an active module superseded WHILE active is surfaced rather than hidden — the pointer
  // does not auto-clear on supersede (see isActiveModuleSuperseded's header).
  const superseded = isActiveModuleSuperseded(modulesDir);

  if (args.json) {
    console.log(JSON.stringify({ ...state, featureStale, superseded }, null, 2));
    return;
  }
  if (!state.modules.length) {
    console.error('No module is active. Run `cli.js use <slug>` to select one.');
    process.exitCode = 1;
    return;
  }
  console.log(state.modules.join('\n'));
  if (state.feature) {
    console.log(`feature: ${state.feature}${featureStale ? '   ⚠ STALE — does not resolve' : ''}`);
  }
  if (superseded) {
    console.error(
      '\nThe active module has been Superseded since it was selected. Re-select the module that '
      + 'superseded it with `cli.js use <slug>` — recording further stages here would write into a '
      + 'module that is no longer where work lands.'
    );
    process.exitCode = 1;
  }
  if (featureStale) {
    console.error(
      '\nThe active Feature pointer does not resolve against the active module. '
      + 'Re-select with `cli.js use-feature <module> <feature>`, or drop to module/CRUD scope with '
      + '`cli.js use <module>`. A stage will refuse to run until this is corrected.'
    );
    process.exitCode = 1;
  }
}

function cmdUse(args) {
  const modulesDir = resolveModulesDir(args);
  if (!modulesDir) return;

  try {
    const registry = args.all
      ? setActiveModulesToAll(modulesDir, {
        now: now(args),
        setBy: args.by && args.by !== true ? args.by : undefined,
        note: args.note && args.note !== true ? args.note : undefined,
      })
      : setActiveModules(
        modulesDir,
        String(args._[1] || '').split(',').map((s) => s.trim()).filter(Boolean),
        {
          now: now(args),
          setBy: args.by && args.by !== true ? args.by : undefined,
          note: args.note && args.note !== true ? args.note : undefined,
          ...(args.scope && args.scope !== true ? { scope: args.scope } : {}),
        }
      );
    console.log(`Active module(s): ${registry.activeModules.join(', ')}  [${registry.activeScope}]`);

    // Selecting module/CRUD scope clears any Feature pointer (decision C). Saying so out loud
    // matters: a silent clear looks identical to "there was never a Feature selected", and the
    // human needs to know their scope just changed.
    if (registry.clearedFeature) {
      console.log(
        `\nCleared active Feature \`${registry.clearedFeature}\` — this is consolidated `
        + 'module/CRUD scope.\n'
        + `      To work on that Feature again: cli.js use-feature ${registry.activeModules[0]} `
        + `${registry.clearedFeature}`
      );
    }

    // A selection that happens to span the project is REPORTED, never silently upgraded to
    // full-project — that scope changes what Stage 5A executes (the assembled baseline rather than
    // each module project) and what Stage 6A may claim about cross-module coverage. The human opts
    // in; the tool does not opt them in. See activeModule.js's deriveActiveScope.
    if (registry.spansEveryModule && registry.activeScope !== 'full-project') {
      console.log(
        '\nNote: that is every approved module, but the scope is still '
        + `\`${registry.activeScope}\` — each module\'s own automation project is what runs.\n`
        + '      For a whole-system run against the assembled baseline: cli.js use --all'
      );
    }
  } catch (err) {
    console.error(err.message);
    process.exitCode = 1;
  }
}

function cmdShow(args) {
  const modulesDir = resolveModulesDir(args);
  if (!modulesDir) return;

  const slug = args._[1];
  if (!slug) {
    console.error('Usage: cli.js show <slug>');
    process.exitCode = 1;
    return;
  }

  const module = resolveModule(modulesDir, slug);
  if (!module) {
    console.error(`No module "${slug}" is registered.`);
    process.exitCode = 1;
    return;
  }

  const automation = readAutomationState(modulesDir, slug);
  if (args.json) {
    console.log(JSON.stringify({ ...module, automation }, null, 2));
    return;
  }

  console.log(`${module.name}  (${module.slug})`);
  console.log(`Status: ${module.status}`);
  if (module.description) console.log(`Scope:  ${module.description}`);
  console.log('');
  for (const stage of MODULE_STAGES) {
    const s = module.stages?.[stage] || {};
    console.log(`  ${stage.padEnd(14)} ${String(s.status || 'Not Started').padEnd(28)} `
      + `${s.lastUpdated ? s.lastUpdated.slice(0, 10) : ''}`);
  }
  if (automation) console.log(`\n  automation project: ${automation.state}`);
}

function cmdClear(args) {
  const modulesDir = resolveModulesDir(args);
  if (!modulesDir) return;
  try {
    clearActiveModules(modulesDir, { now: now(args) });
    console.log('Active module selection cleared.');
  } catch (err) {
    console.error(err.message);
    process.exitCode = 1;
  }
}

function cmdPropose(args) {
  const modulesDir = resolveModulesDir(args);
  if (!modulesDir) return;

  const name = args.name && args.name !== true ? args.name : null;
  if (!name) {
    console.error('Usage: cli.js propose --name "Module Name" [--description "..."] [--prd <path>]');
    process.exitCode = 1;
    return;
  }

  try {
    const { proposed, alreadyPresent } = proposeModules(
      modulesDir,
      [{
        name,
        description: args.description && args.description !== true ? args.description : undefined,
      }],
      {
        now: now(args),
        ...(args.prd && args.prd !== true ? { prdPath: args.prd } : {}),
      }
    );
    for (const m of proposed) {
      console.log(`Proposed: ${m.slug}  (${m.name})`);
    }
    for (const m of alreadyPresent) {
      console.log(`Already registered as ${m.status}: ${m.slug}`);
    }
    if (proposed.length) {
      console.log('\nProposed modules are NOT scaffolded until approved at the Stage 1 gate:');
      console.log(`  cli.js approve ${proposed.map((m) => m.slug).join(' ')} --by "<reviewer>"`);
    }
  } catch (err) {
    console.error(err.message);
    process.exitCode = 1;
  }
}

function cmdApprove(args) {
  const modulesDir = resolveModulesDir(args);
  if (!modulesDir) return;

  const approvedBy = args.by && args.by !== true ? args.by : null;
  if (!approvedBy) {
    console.error(
      'Usage: cli.js approve [<slug>...] --by "<reviewer>"\n' +
      '`--by` is required: an approval record naming no approver is not an approval.'
    );
    process.exitCode = 1;
    return;
  }

  try {
    const stamp = now(args);
    const { approved } = approveModules(modulesDir, args._.slice(1), { now: stamp, approvedBy });
    for (const m of approved) {
      scaffoldModule(modulesDir, m.slug, { now: stamp, entry: m });
      writeModuleSummary(modulesDir, m.slug, { now: stamp });
      console.log(`Approved and scaffolded: ${m.slug}`);
    }
    if (!approved.length) console.log('No proposed modules to approve.');
  } catch (err) {
    console.error(err.message);
    process.exitCode = 1;
  }
}

function cmdScaffold(args) {
  const modulesDir = resolveModulesDir(args);
  if (!modulesDir) return;

  const slug = args._[1];
  if (!slug) {
    console.error('Usage: cli.js scaffold <slug> [--dry-run]');
    process.exitCode = 1;
    return;
  }

  try {
    if (args['dry-run']) {
      const plan = planScaffold(modulesDir, slug);
      console.log(JSON.stringify(plan, null, 2));
      return;
    }
    const stamp = now(args);
    const { wrote } = scaffoldModule(modulesDir, slug, { now: stamp });
    writeModuleSummary(modulesDir, slug, { now: stamp });
    for (const p of wrote) console.log(`created  ${p}`);
  } catch (err) {
    console.error(err.message);
    process.exitCode = 1;
  }
}

function cmdSummary(args) {
  const modulesDir = resolveModulesDir(args);
  if (!modulesDir) return;

  const slug = args._[1];
  if (!slug) {
    console.error('Usage: cli.js summary <slug>');
    process.exitCode = 1;
    return;
  }

  try {
    console.log(writeModuleSummary(modulesDir, slug, { now: now(args) }));
  } catch (err) {
    console.error(err.message);
    process.exitCode = 1;
  }
}

function cmdStage(args) {
  const modulesDir = resolveModulesDir(args);
  if (!modulesDir) return;

  const [, slug, stage] = args._;
  const status = args.status && args.status !== true ? args.status : null;
  if (!slug || !stage || !status) {
    console.error(
      `Usage: cli.js stage <slug> <${MODULE_STAGES.join('|')}> --status <${STAGE_STATUSES.join('|')}> ` +
      '[--artifact <path>] [--run <run-folder>] [--target-ref <sha>]'
    );
    process.exitCode = 1;
    return;
  }

  try {
    const stamp = now(args);
    recordStage(modulesDir, slug, stage, {
      status,
      ...(args.artifact && args.artifact !== true ? { artifactPath: args.artifact } : {}),
      ...(args.run && args.run !== true ? { lastRun: args.run } : {}),
      ...(args['target-ref'] && args['target-ref'] !== true ? { targetRefAtWrite: args['target-ref'] } : {}),
      ...(args['no-revision'] ? { incrementRevision: false } : {}),
    }, { now: stamp });
    writeModuleSummary(modulesDir, slug, { now: stamp });
    console.log(`Recorded ${slug}/${stage}: ${status}`);
  } catch (err) {
    console.error(err.message);
    process.exitCode = 1;
  }
}

function cmdAutomation(args) {
  const modulesDir = resolveModulesDir(args);
  if (!modulesDir) return;

  const slug = args._[1];
  const state = args.state && args.state !== true ? args.state : null;
  if (!slug || !state) {
    console.error(
      `Usage: cli.js automation <slug> --state <${AUTOMATION_STATES.filter((s) => s !== 'Promoted').join('|')}> ` +
      '[--by <approver>] [--framework F] [--run <run-folder>] [--baseline-ref <sha>]\n' +
      'Note: "Promoted" is not settable here. It is the outcome of a verified promotion — merge, ' +
      'byte-identity verification, retirement — and is recorded by:\n' +
      '  node platform_core/tools/automation_lifecycle/cli.js retire-module --module <slug> ...'
    );
    process.exitCode = 1;
    return;
  }

  try {
    const stamp = now(args);
    const result = setAutomationState(modulesDir, slug, state, {
      now: stamp,
      ...(args.by && args.by !== true ? { approvedBy: args.by } : {}),
      ...(args.framework && args.framework !== true ? { framework: args.framework } : {}),
      ...(args.run && args.run !== true ? { sourceRun: args.run } : {}),
      ...(args['baseline-ref'] && args['baseline-ref'] !== true ? { baselineRef: args['baseline-ref'] } : {}),
      ...(args.note && args.note !== true ? { note: args.note } : {}),
    });
    writeModuleSummary(modulesDir, slug, { now: stamp });
    console.log(`${slug} automation: ${result.state}`);
  } catch (err) {
    console.error(err.message);
    process.exitCode = 1;
  }
}

/**
 * `feature <propose|approve|scaffold|list|show|stage>` — standalone Features (new_us_intake.md).
 *
 * Grouped under one verb rather than spread across six top-level ones, so `cli.js --help` still
 * reads as a module tool with a Feature sub-surface, which is what the architecture actually is: a
 * Feature is never a peer of a module, always a child of one.
 */
function cmdFeature(args) {
  const modulesDir = resolveModulesDir(args);
  if (!modulesDir) return;

  const sub = args._[1];
  const SUBS = ['propose', 'approve', 'scaffold', 'list', 'show', 'stage'];
  if (!sub || !SUBS.includes(sub)) {
    console.error(`Usage: cli.js feature <${SUBS.join('|')}> [...]`);
    process.exitCode = 1;
    return;
  }

  const stamp = now(args);
  const moduleSlug = args._[2];
  const str = (v) => (v && v !== true ? String(v) : undefined);

  if (sub === 'list') {
    // No module named → every Feature everywhere. This is the sweep intake runs before proposing
    // anything, so it has to be answerable in one call (intake rule #8).
    const rows = moduleSlug
      ? listFeatures(modulesDir, moduleSlug).map((f) => ({ ...f, module: moduleSlug }))
      : listAllFeatures(modulesDir);
    if (args.json) {
      console.log(JSON.stringify(rows, null, 2));
      return;
    }
    if (!rows.length) {
      console.log(moduleSlug
        ? `Module "${moduleSlug}" has no registered standalone Features (CRUD-only scope).`
        : 'No standalone Features are registered in any module.');
      return;
    }
    for (const f of rows) {
      console.log(`  ${f.module}/${f.slug.padEnd(28)} ${String(f.status).padEnd(10)} `
        + `${f.sourceUserStory || '—'}`);
    }
    return;
  }

  if (!moduleSlug) {
    console.error(`Usage: cli.js feature ${sub} <module-slug> [...]`);
    process.exitCode = 1;
    return;
  }

  if (sub === 'propose') {
    const name = str(args.name);
    if (!name) {
      console.error('feature propose requires --name "<Feature name>".');
      process.exitCode = 1;
      return;
    }
    const result = proposeFeature(modulesDir, moduleSlug, {
      name,
      description: str(args.description),
      sourceUserStory: str(args['user-story']),
      acceptanceCriteriaRef: str(args['ac-ref']),
    }, { now: stamp });
    console.log(`${result.created ? 'Proposed' : 'Updated proposal for'} feature `
      + `${moduleSlug}/${result.feature.slug}  [${result.feature.status}]`);
    console.log(`  path (on approval): ${featurePathFor(moduleSlug, result.feature.slug)}`);
    console.log('  Not scaffolded — a folder on disk reads as an approved Feature.');
    return;
  }

  if (sub === 'approve') {
    const by = str(args.by);
    if (!by) {
      console.error('feature approve requires --by "<Reviewer Name>" — '
        + 'an approval record with no approver is not an approval.');
      process.exitCode = 1;
      return;
    }
    const slugs = args._.slice(3);
    const { approved } = approveFeatures(modulesDir, moduleSlug, slugs, { now: stamp, approvedBy: by });
    if (!approved.length) {
      console.log(`No Proposed Features under "${moduleSlug}" to approve.`);
      return;
    }
    for (const f of approved) console.log(`Approved feature ${moduleSlug}/${f.slug}`);
    return;
  }

  if (sub === 'scaffold') {
    const featureSlug = args._[3] || str(args.feature);
    if (!featureSlug) {
      console.error(`Usage: cli.js feature scaffold ${moduleSlug} <feature-slug> [--dry-run]`);
      process.exitCode = 1;
      return;
    }
    if (args['dry-run']) {
      const plan = planFeatureScaffold(modulesDir, moduleSlug, featureSlug);
      console.log(`Would create under ${featurePathFor(moduleSlug, featureSlug)}:`);
      for (const d of plan.createDirs) console.log(`  dir  ${d}`);
      for (const f of plan.createFiles) console.log(`  file ${f}`);
      if (plan.createsFeaturesDir) {
        console.log(`\n  This creates the module's features/ folder for the first time.`);
      }
      if (!plan.createDirs.length && !plan.createFiles.length) console.log('  (nothing — already scaffolded)');
      return;
    }
    const result = scaffoldFeature(modulesDir, moduleSlug, featureSlug, { now: stamp });
    writeModuleSummary(modulesDir, moduleSlug, { now: stamp });
    console.log(`${result.created ? 'Scaffolded' : 'Already present:'} `
      + `${featurePathFor(moduleSlug, featureSlug)}`);
    for (const w of result.wrote) console.log(`  ${w}`);
    return;
  }

  if (sub === 'show') {
    const featureSlug = args._[3] || str(args.feature);
    if (!featureSlug) {
      console.error(`Usage: cli.js feature show ${moduleSlug} <feature-slug>`);
      process.exitCode = 1;
      return;
    }
    const feature = resolveFeature(modulesDir, moduleSlug, featureSlug);
    if (!feature) {
      console.error(`No Feature "${featureSlug}" is registered under module "${moduleSlug}".`);
      process.exitCode = 1;
      return;
    }
    if (args.json) {
      console.log(JSON.stringify(feature, null, 2));
      return;
    }
    console.log(`${feature.name}  (${moduleSlug}/${feature.slug})`);
    console.log(`Status: ${feature.status}   On disk: ${feature.onDisk ? 'yes' : 'no'}`);
    if (feature.sourceUserStory) console.log(`Story:  ${feature.sourceUserStory}`);
    if (feature.description) console.log(`Scope:  ${feature.description}`);
    console.log('');
    for (const stage of FEATURE_STAGES) {
      const s = feature.stages?.[stage] || {};
      console.log(`  ${stage.padEnd(14)} ${String(s.status || 'Not Started').padEnd(28)} `
        + `${s.lastUpdated ? s.lastUpdated.slice(0, 10) : ''}`);
    }
    return;
  }

  // sub === 'stage' — records progress against the FEATURE, never its parent module (decision A).
  const featureSlug = args._[3];
  const stage = args._[4];
  if (!featureSlug || !stage) {
    console.error(`Usage: cli.js feature stage ${moduleSlug} <feature-slug> <stage> --status <S>`);
    process.exitCode = 1;
    return;
  }
  const status = str(args.status);
  if (!status) {
    console.error(`feature stage requires --status <${STAGE_STATUSES.join('|')}>.`);
    process.exitCode = 1;
    return;
  }
  const updated = recordFeatureStage(modulesDir, moduleSlug, featureSlug, stage, {
    status,
    artifactPath: str(args.artifact),
    lastRun: str(args.run),
    targetRefAtWrite: str(args['target-ref']),
    ...(args['no-revision'] ? { incrementRevision: false } : {}),
  }, { now: stamp });
  writeModuleSummary(modulesDir, moduleSlug, { now: stamp });
  console.log(`Recorded ${moduleSlug}/${featureSlug} ${stage}: ${updated.stages[stage].status}`);
  console.log(`  (the parent module's ${stage} stage is unchanged — feature stages never roll up)`);
}

/** Repo-relative feature path, for messages. Kept here so the CLI has one renderer for it. */
function featurePathFor(moduleSlug, featureSlug) {
  return `platform_core_data/modules/${moduleSlug}/features/${featureSlug}`;
}

/** `use-feature <module> <feature>` — point the pipeline at a standalone Feature (decision C). */
function cmdUseFeature(args) {
  const modulesDir = resolveModulesDir(args);
  if (!modulesDir) return;

  const moduleSlug = args._[1];
  const featureSlug = args._[2];
  if (!moduleSlug || !featureSlug) {
    console.error('Usage: cli.js use-feature <module-slug> <feature-slug>');
    process.exitCode = 1;
    return;
  }

  try {
    const registry = setActiveFeature(modulesDir, moduleSlug, featureSlug, {
      now: now(args),
      setBy: args.by && args.by !== true ? args.by : undefined,
      note: args.note && args.note !== true ? args.note : undefined,
    });
    console.log(`Active: ${registry.activeModules[0]} / feature ${registry.activeFeature}`);
    console.log('  Stages resolve BOTH {{MODULE_SLUG}} and {{FEATURE_SLUG}} while this is set.');
    console.log(`  To return to consolidated CRUD scope: cli.js use ${registry.activeModules[0]}`);
  } catch (err) {
    console.error(err.message);
    process.exitCode = 1;
  }
}

/**
 * `inspect-scope` — the existing-scope sweep intake runs BEFORE proposing anything (intake §5, rule
 * #8). Reports modules, Features, story mappings, stage states, and overlap candidates in one call.
 *
 * It reports CANDIDATES and never a verdict, because intake rule #9 forbids concluding overlap from
 * a story number: the business scope and acceptance criteria have to be compared by a human. The
 * exit code says whether there is something to ask about, not whether something is wrong.
 */
function cmdInspectScope(args) {
  const modulesDir = resolveModulesDir(args);
  if (!modulesDir) return;

  const str = (v) => (v && v !== true ? String(v) : undefined);
  const query = {
    userStory: str(args['user-story']),
    name: str(args.name),
    moduleSlug: str(args.module),
  };

  const modules = listModules(modulesDir);
  const features = listAllFeatures(modulesDir);
  const overlap = findScopeOverlap(modulesDir, query);
  const active = readActiveModules(modulesDir);

  const report = {
    query,
    modules: modules.map((m) => ({
      slug: m.slug,
      name: m.name,
      status: m.status,
      onDisk: m.onDisk,
      stages: Object.fromEntries(
        MODULE_STAGES.map((s) => [s, m.stages?.[s]?.status || 'Not Started'])
      ),
      featureCount: features.filter((f) => f.module === m.slug).length,
    })),
    features: features.map((f) => ({
      module: f.module,
      slug: f.slug,
      name: f.name,
      status: f.status,
      sourceUserStory: f.sourceUserStory ?? null,
      stages: Object.fromEntries(
        FEATURE_STAGES.map((s) => [s, f.stages?.[s]?.status || 'Not Started'])
      ),
    })),
    active: { modules: active.modules, feature: active.feature, scope: active.scope },
    overlapCandidates: {
      modules: overlap.modules.map((m) => m.slug),
      features: overlap.features.map((f) => `${f.module}/${f.slug}`),
    },
  };

  if (args.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log('Registered modules');
    for (const m of report.modules) {
      console.log(`  ${m.slug.padEnd(28)} ${String(m.status).padEnd(10)} `
        + `features: ${m.featureCount}`);
    }
    console.log('\nRegistered standalone Features');
    if (!report.features.length) console.log('  (none)');
    for (const f of report.features) {
      console.log(`  ${`${f.module}/${f.slug}`.padEnd(40)} ${String(f.status).padEnd(10)} `
        + `${f.sourceUserStory || '—'}`);
    }
    console.log(`\nActive: ${report.active.modules.join(', ') || '(none)'}`
      + `${report.active.feature ? ` / feature ${report.active.feature}` : ''}`);

    const hits = report.overlapCandidates.modules.length + report.overlapCandidates.features.length;
    console.log(`\nOverlap candidates: ${hits || 'none'}`);
    for (const m of report.overlapCandidates.modules) console.log(`  module  ${m}`);
    for (const f of report.overlapCandidates.features) console.log(`  feature ${f}`);
    if (hits) {
      console.log(
        '\nThese are CANDIDATES, not a verdict. Compare the business scope and acceptance criteria '
        + 'before concluding anything — a matching story number is not a matching scope, and a '
        + 'different number does not prove the scope is new. Ask the human which they want.'
      );
    }
  }

  // Exit 2 = "there is something to ask about", distinct from 1 = error. Lets a caller branch
  // without parsing prose.
  const hits = report.overlapCandidates.modules.length + report.overlapCandidates.features.length;
  if (hits) process.exitCode = 2;
}

function cmdDrift(args) {
  const roots = resolveRoots(args);
  if (!roots) return;
  const { modulesDir, targetRoot } = roots;

  const slug = args._[1];
  const scopePaths = args['scope-paths'] && args['scope-paths'] !== true
    ? String(args['scope-paths']).split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  try {
    const reports = slug
      ? [computeModuleDrift(modulesDir, slug, { targetRoot, scopePaths })]
      : computeAllModuleDrift(modulesDir, { targetRoot, scopePaths });

    const enriched = reports.map((r) => ({ ...r, stale: detectStaleStages(modulesDir, r.module) }));

    if (args.json) {
      console.log(JSON.stringify(enriched, null, 2));
    } else {
      for (const r of enriched) {
        console.log(`${r.module}:`);
        for (const [stage, d] of Object.entries(r.stages)) {
          console.log(`  ${stage.padEnd(14)} ${d.status}`);
        }
        for (const s of r.stale) {
          console.log(`  ! ${s.stage} is stale against ${s.staleAgainst} `
            + `(${s.staleAgainst} updated ${s.upstreamUpdated} > ${s.stage} ${s.downstreamUpdated})`);
        }
        if (!Object.keys(r.stages).length) console.log('  (no stage has run yet)');
      }
    }

    // Exit 2 when anything is not unchanged, mirroring `run_manager cli.js drift`. A caller that
    // wants "is anything suspect?" as a shell condition gets it without parsing output.
    if (enriched.some((r) => r.anySuspect || r.stale.length)) process.exitCode = 2;
  } catch (err) {
    console.error(err.message);
    process.exitCode = 1;
  }
}

// ── NDC Core Service layer: Service → Feature → Supplier/Shared ────────────────────────────────
//
// Kept as its OWN namespace, entirely separate from the verbs above. A Feature here reuses
// moduleRegistry.js wholesale (services/<service>/ passed as its modulesDir); a shared scope reuses
// featureRegistry.js with dirname 'shared' instead of 'features'; a Supplier is its own file
// (supplierRegistry.js), never registered as a "feature". See module_architecture.md, NDC section.

const SHARED_DIRNAME = 'shared';

function ndcFeaturePathFor(serviceSlug, featureSlug) {
  return `platform_core_data/services/${serviceSlug}/${featureSlug}`;
}
function ndcSharedPathFor(serviceSlug, featureSlug, scopeSlug) {
  return `${ndcFeaturePathFor(serviceSlug, featureSlug)}/${SHARED_DIRNAME}/${scopeSlug}`;
}
function ndcSupplierPathFor(serviceSlug, featureSlug, supplierSlug) {
  return `${ndcFeaturePathFor(serviceSlug, featureSlug)}/suppliers/${supplierSlug}`;
}

/**
 * Resolves the single Active service. The `ndc feature/shared/supplier` verbs deliberately do not
 * require the human to name the Service on every call (see activeService.js's header) — today there
 * is exactly one (`ndc-core-service`). Ambiguity is reported, never silently resolved.
 */
function resolveSingleActiveService(servicesDir) {
  const active = listServices(servicesDir).filter((s) => s.status === 'Active');
  if (!active.length) {
    throw new ServiceRegistryError(
      'No Active service is registered. Run `cli.js ndc service propose --name "..."` then ' +
      '`cli.js ndc service approve <slug> --by "..."` first.'
    );
  }
  if (active.length > 1) {
    throw new ServiceRegistryError(
      `${active.length} services are registered (${active.map((s) => s.slug).join(', ')}). ` +
      'This CLI surface assumes exactly one Active service at a time.'
    );
  }
  return active[0].slug;
}

function cmdNdc(args) {
  const servicesDir = resolveServicesDir(args);
  if (!servicesDir) return;

  const sub = args._[1];
  const SUBS = ['service', 'feature', 'shared', 'supplier', 'use-feature', 'use-supplier', 'inspect-scope'];
  if (!sub || !SUBS.includes(sub)) {
    console.error(`Usage: cli.js ndc <${SUBS.join('|')}> [...]`);
    process.exitCode = 1;
    return;
  }

  const stamp = now(args);
  const str = (v) => (v && v !== true ? String(v) : undefined);

  if (sub === 'service') { cmdNdcService(servicesDir, args, stamp, str); return; }
  if (sub === 'feature') { cmdNdcFeature(servicesDir, args, stamp, str); return; }
  if (sub === 'shared') { cmdNdcShared(servicesDir, args, stamp, str); return; }
  if (sub === 'supplier') { cmdNdcSupplier(servicesDir, args, stamp, str); return; }
  if (sub === 'use-feature') { cmdNdcUseFeature(servicesDir, args, stamp); return; }
  if (sub === 'use-supplier') { cmdNdcUseSupplier(servicesDir, args, stamp); return; }
  cmdNdcInspectScope(servicesDir, args);
}

function cmdNdcService(servicesDir, args, stamp, str) {
  const action = args._[2];

  if (action === 'list') {
    const rows = listServices(servicesDir);
    if (args.json) { console.log(JSON.stringify(rows, null, 2)); return; }
    if (!rows.length) { console.log('No services registered yet.'); return; }
    for (const s of rows) console.log(`  ${s.slug.padEnd(24)} ${String(s.status).padEnd(10)} ${s.name}`);
    return;
  }

  if (action === 'propose') {
    const name = str(args.name);
    if (!name) {
      console.error('Usage: cli.js ndc service propose --name "Service Name" [--description "..."]');
      process.exitCode = 1;
      return;
    }
    const { proposed, alreadyPresent } = proposeServices(
      servicesDir, [{ name, description: str(args.description) }], { now: stamp }
    );
    for (const s of proposed) console.log(`Proposed: ${s.slug}  (${s.name})`);
    for (const s of alreadyPresent) console.log(`Already registered as ${s.status}: ${s.slug}`);
    return;
  }

  if (action === 'approve') {
    const by = str(args.by);
    if (!by) {
      console.error('Usage: cli.js ndc service approve [<slug>...] --by "<reviewer>"');
      process.exitCode = 1;
      return;
    }
    const { approved } = approveServices(servicesDir, args._.slice(3), { now: stamp, approvedBy: by });
    for (const s of approved) {
      scaffoldService(servicesDir, s.slug, { now: stamp, entry: s });
      console.log(`Approved and scaffolded: ${s.slug}`);
    }
    if (!approved.length) console.log('No proposed services to approve.');
    return;
  }

  console.error('Usage: cli.js ndc service <list|propose|approve> [...]');
  process.exitCode = 1;
}

function cmdNdcFeature(servicesDir, args, stamp, str) {
  const action = args._[2];

  if (action === 'list') {
    const rows = [];
    for (const svc of listServices(servicesDir)) {
      for (const m of listModules(path.join(servicesDir, svc.slug))) rows.push({ ...m, service: svc.slug });
    }
    if (args.json) { console.log(JSON.stringify(rows, null, 2)); return; }
    if (!rows.length) { console.log('No Features registered under any service.'); return; }
    for (const f of rows) {
      console.log(`  ${f.service}/${f.slug.padEnd(24)} ${String(f.status).padEnd(10)} ${f.name}`);
    }
    return;
  }

  let serviceSlug;
  try {
    serviceSlug = resolveSingleActiveService(servicesDir);
  } catch (err) {
    console.error(err.message);
    process.exitCode = 1;
    return;
  }
  const svcDir = path.join(servicesDir, serviceSlug);

  if (action === 'propose') {
    const name = str(args.name);
    if (!name) {
      console.error('Usage: cli.js ndc feature propose --name "Feature Name"');
      process.exitCode = 1;
      return;
    }
    const { proposed, alreadyPresent } = proposeModules(
      svcDir, [{ name, kind: 'ndc_feature', service: serviceSlug }], { now: stamp }
    );
    for (const f of proposed) console.log(`Proposed: ${serviceSlug}/${f.slug}  (${f.name})`);
    for (const f of alreadyPresent) console.log(`Already registered as ${f.status}: ${serviceSlug}/${f.slug}`);
    return;
  }

  if (action === 'approve') {
    const by = str(args.by);
    if (!by) {
      console.error('Usage: cli.js ndc feature approve [<feature>...] --by "<reviewer>"');
      process.exitCode = 1;
      return;
    }
    const { approved } = approveModules(svcDir, args._.slice(3), { now: stamp, approvedBy: by });
    for (const f of approved) {
      scaffoldModule(svcDir, f.slug, { now: stamp, entry: f });
      console.log(`Approved and scaffolded: ${serviceSlug}/${f.slug}`);
    }
    if (!approved.length) console.log('No proposed Features to approve.');
    return;
  }

  if (action === 'scaffold') {
    const featureSlug = args._[3];
    if (!featureSlug) {
      console.error('Usage: cli.js ndc feature scaffold <feature> [--dry-run]');
      process.exitCode = 1;
      return;
    }
    if (args['dry-run']) {
      console.log(JSON.stringify(planScaffold(svcDir, featureSlug), null, 2));
      return;
    }
    const { wrote } = scaffoldModule(svcDir, featureSlug, { now: stamp });
    for (const w of wrote) console.log(`created  ${w}`);
    return;
  }

  console.error('Usage: cli.js ndc feature <list|propose|approve|scaffold> [...]');
  process.exitCode = 1;
}

function cmdNdcShared(servicesDir, args, stamp, str) {
  const action = args._[2];
  const featureSlug = args._[3];
  const ACTIONS = ['propose', 'approve', 'scaffold', 'stage'];
  if (!action || !ACTIONS.includes(action) || !featureSlug) {
    console.error(`Usage: cli.js ndc shared <${ACTIONS.join('|')}> <feature> [...]`);
    process.exitCode = 1;
    return;
  }

  let serviceSlug;
  try {
    ({ serviceSlug } = findFeatureAcrossServices(servicesDir, featureSlug));
  } catch (err) {
    console.error(err.message);
    process.exitCode = 1;
    return;
  }
  const svcDir = path.join(servicesDir, serviceSlug);

  if (action === 'propose') {
    const name = str(args.name);
    if (!name) {
      console.error(`Usage: cli.js ndc shared propose ${featureSlug} --name "..." [--user-story ...]`);
      process.exitCode = 1;
      return;
    }
    const result = proposeFeature(svcDir, featureSlug, {
      name,
      sourceUserStory: str(args['user-story']),
      acceptanceCriteriaRef: str(args['ac-ref']),
    }, { now: stamp });
    console.log(`${result.created ? 'Proposed' : 'Updated proposal for'} shared scope ` +
      `${featureSlug}/${result.feature.slug}  [${result.feature.status}]`);
    console.log(`  path (on approval): ${ndcSharedPathFor(serviceSlug, featureSlug, result.feature.slug)}`);
    return;
  }

  if (action === 'approve') {
    const by = str(args.by);
    if (!by) {
      console.error(`Usage: cli.js ndc shared approve ${featureSlug} <scope> --by "<reviewer>"`);
      process.exitCode = 1;
      return;
    }
    const scopeSlug = args._[4];
    const { approved } = approveFeatures(
      svcDir, featureSlug, scopeSlug ? [scopeSlug] : [], { now: stamp, approvedBy: by }
    );
    for (const s of approved) console.log(`Approved shared scope ${featureSlug}/${s.slug}`);
    if (!approved.length) console.log('No proposed shared scopes to approve.');
    return;
  }

  if (action === 'scaffold') {
    const scopeSlug = args._[4];
    if (!scopeSlug) {
      console.error(`Usage: cli.js ndc shared scaffold ${featureSlug} <scope> [--dry-run]`);
      process.exitCode = 1;
      return;
    }
    if (args['dry-run']) {
      console.log(JSON.stringify(planFeatureScaffold(svcDir, featureSlug, scopeSlug, SHARED_DIRNAME), null, 2));
      return;
    }
    const result = scaffoldFeature(svcDir, featureSlug, scopeSlug, { now: stamp, dirname: SHARED_DIRNAME });
    for (const w of result.wrote) console.log(`created  ${w}`);
    return;
  }

  // stage
  const scopeSlug = args._[4];
  const stage = args._[5];
  const status = str(args.status);
  if (!scopeSlug || !stage || !status) {
    console.error(`Usage: cli.js ndc shared stage ${featureSlug} <scope> <stage> --status <S>`);
    process.exitCode = 1;
    return;
  }
  const updated = recordFeatureStage(svcDir, featureSlug, scopeSlug, stage, {
    status,
    artifactPath: str(args.artifact),
    lastRun: str(args.run),
    targetRefAtWrite: str(args['target-ref']),
    ...(args['no-revision'] ? { incrementRevision: false } : {}),
  }, { now: stamp, dirname: SHARED_DIRNAME });
  console.log(`Recorded ${featureSlug}/${scopeSlug} ${stage}: ${updated.stages[stage].status}`);
}

function cmdNdcSupplier(servicesDir, args, stamp, str) {
  const action = args._[2];
  const ACTIONS = ['propose', 'approve', 'scaffold', 'stage', 'list'];
  const featureSlug = args._[3];
  if (!action || !ACTIONS.includes(action) || !featureSlug) {
    console.error(`Usage: cli.js ndc supplier <${ACTIONS.join('|')}> <feature> [...]`);
    process.exitCode = 1;
    return;
  }

  let serviceSlug;
  try {
    ({ serviceSlug } = findFeatureAcrossServices(servicesDir, featureSlug));
  } catch (err) {
    console.error(err.message);
    process.exitCode = 1;
    return;
  }
  const svcDir = path.join(servicesDir, serviceSlug);

  if (action === 'list') {
    const rows = listSuppliers(svcDir, featureSlug);
    if (args.json) { console.log(JSON.stringify(rows, null, 2)); return; }
    if (!rows.length) { console.log(`Feature "${featureSlug}" has no registered Suppliers.`); return; }
    for (const s of rows) console.log(`  ${featureSlug}/${s.slug.padEnd(20)} ${String(s.status).padEnd(10)} ${s.name}`);
    return;
  }

  if (action === 'propose') {
    const name = str(args.name);
    if (!name) {
      console.error(`Usage: cli.js ndc supplier propose ${featureSlug} --name "Supplier Name"`);
      process.exitCode = 1;
      return;
    }
    const result = proposeSupplier(svcDir, serviceSlug, featureSlug, { name }, { now: stamp });
    console.log(`${result.created ? 'Proposed' : 'Updated proposal for'} supplier ` +
      `${featureSlug}/${result.supplier.slug}  [${result.supplier.status}]`);
    console.log(`  path (on approval): ${ndcSupplierPathFor(serviceSlug, featureSlug, result.supplier.slug)}`);
    return;
  }

  if (action === 'approve') {
    const by = str(args.by);
    if (!by) {
      console.error(`Usage: cli.js ndc supplier approve ${featureSlug} <supplier> --by "<reviewer>"`);
      process.exitCode = 1;
      return;
    }
    const supplierSlug = args._[4];
    const { approved } = approveSuppliers(
      svcDir, featureSlug, supplierSlug ? [supplierSlug] : [], { now: stamp, approvedBy: by }
    );
    for (const s of approved) console.log(`Approved supplier ${featureSlug}/${s.slug}`);
    if (!approved.length) console.log('No proposed Suppliers to approve.');
    return;
  }

  if (action === 'scaffold') {
    const supplierSlug = args._[4];
    if (!supplierSlug) {
      console.error(`Usage: cli.js ndc supplier scaffold ${featureSlug} <supplier> [--dry-run]`);
      process.exitCode = 1;
      return;
    }
    if (args['dry-run']) {
      const { plan } = scaffoldSupplier(svcDir, featureSlug, supplierSlug, { now: stamp, dryRun: true });
      console.log(JSON.stringify(plan, null, 2));
      return;
    }
    const result = scaffoldSupplier(svcDir, featureSlug, supplierSlug, { now: stamp });
    for (const w of result.wrote) console.log(`created  ${w}`);
    return;
  }

  // stage
  const supplierSlug = args._[4];
  const stage = args._[5];
  const status = str(args.status);
  if (!supplierSlug || !stage || !status) {
    console.error(`Usage: cli.js ndc supplier stage ${featureSlug} <supplier> <stage> --status <S>`);
    process.exitCode = 1;
    return;
  }
  const updated = recordSupplierStage(svcDir, featureSlug, supplierSlug, stage, {
    status,
    artifactPath: str(args.artifact),
    lastRun: str(args.run),
    targetRefAtWrite: str(args['target-ref']),
    ...(args['no-revision'] ? { incrementRevision: false } : {}),
  }, { now: stamp });
  console.log(`Recorded ${featureSlug}/${supplierSlug} ${stage}: ${updated.stages[stage].status}`);
}

function cmdNdcUseFeature(servicesDir, args, stamp) {
  const featureSlug = args._[2];
  if (!featureSlug) {
    console.error('Usage: cli.js ndc use-feature <feature>');
    process.exitCode = 1;
    return;
  }
  try {
    const registry = setActiveNdcFeature(servicesDir, featureSlug, { now: stamp });
    console.log(`Active: ${registry.activeService} / feature ${registry.activeFeature}`);
  } catch (err) {
    console.error(err.message);
    process.exitCode = 1;
  }
}

function cmdNdcUseSupplier(servicesDir, args, stamp) {
  const featureSlug = args._[2];
  const supplierSlug = args._[3];
  if (!featureSlug || !supplierSlug) {
    console.error('Usage: cli.js ndc use-supplier <feature> <supplier>');
    process.exitCode = 1;
    return;
  }
  try {
    const registry = setActiveSupplier(servicesDir, featureSlug, supplierSlug, { now: stamp });
    console.log(
      `Active: ${registry.activeService} / ${registry.activeFeature} / supplier ${registry.activeSupplier}`
    );
  } catch (err) {
    console.error(err.message);
    process.exitCode = 1;
  }
}

/** `ndc inspect-scope` — the same-shaped sweep as `inspect-scope`, across the NDC layer. */
function cmdNdcInspectScope(servicesDir, args) {
  const str = (v) => (v && v !== true ? String(v) : undefined);
  const query = { userStory: str(args['user-story']), name: str(args.name) };
  const normalize = (v) => (v === null || v === undefined ? null : String(v).toLowerCase().replace(/[^a-z0-9]/g, ''));
  const wantedStory = query.userStory ? normalize(query.userStory) : null;
  const wantedName = query.name ? String(query.name).toLowerCase().trim() : null;

  const services = listServices(servicesDir);
  const features = [];
  const sharedScopes = [];
  const suppliers = [];
  for (const svc of services) {
    const svcDir = path.join(servicesDir, svc.slug);
    for (const f of listModules(svcDir)) {
      features.push({ ...f, service: svc.slug });
      for (const sh of listFeatures(svcDir, f.slug)) {
        sharedScopes.push({ ...sh, service: svc.slug, feature: f.slug });
      }
      for (const s of listSuppliers(svcDir, f.slug)) {
        suppliers.push({ ...s, service: svc.slug, feature: f.slug });
      }
    }
  }

  const active = readActiveService(servicesDir);
  const matchesName = (n) => wantedName && String(n || '').toLowerCase().trim() === wantedName;

  const overlapFeatures = features.filter((f) => matchesName(f.name));
  const overlapShared = sharedScopes.filter((s) => (wantedStory && normalize(s.sourceUserStory) === wantedStory) || matchesName(s.name));
  const overlapSuppliers = suppliers.filter((s) => matchesName(s.name));

  const report = {
    query,
    services: services.map((s) => ({ slug: s.slug, name: s.name, status: s.status })),
    features: features.map((f) => ({ service: f.service, slug: f.slug, name: f.name, status: f.status })),
    sharedScopes: sharedScopes.map((s) => ({
      service: s.service, feature: s.feature, slug: s.slug, name: s.name, status: s.status,
      sourceUserStory: s.sourceUserStory ?? null,
    })),
    suppliers: suppliers.map((s) => ({ service: s.service, feature: s.feature, slug: s.slug, name: s.name, status: s.status })),
    active,
    overlapCandidates: {
      features: overlapFeatures.map((f) => `${f.service}/${f.slug}`),
      sharedScopes: overlapShared.map((s) => `${s.service}/${s.feature}/shared/${s.slug}`),
      suppliers: overlapSuppliers.map((s) => `${s.service}/${s.feature}/suppliers/${s.slug}`),
    },
  };

  const hits = report.overlapCandidates.features.length + report.overlapCandidates.sharedScopes.length
    + report.overlapCandidates.suppliers.length;

  if (args.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log('Registered services');
    for (const s of report.services) console.log(`  ${s.slug.padEnd(24)} ${s.status}`);
    console.log('\nRegistered Features');
    for (const f of report.features) console.log(`  ${f.service}/${f.slug.padEnd(24)} ${f.status}`);
    console.log('\nRegistered shared scopes');
    if (!report.sharedScopes.length) console.log('  (none)');
    for (const s of report.sharedScopes) {
      console.log(`  ${s.service}/${s.feature}/shared/${s.slug.padEnd(20)} ${s.status}  ${s.sourceUserStory || '—'}`);
    }
    console.log('\nRegistered suppliers');
    if (!report.suppliers.length) console.log('  (none)');
    for (const s of report.suppliers) {
      console.log(`  ${s.service}/${s.feature}/suppliers/${s.slug.padEnd(20)} ${s.status}`);
    }
    console.log(
      `\nActive: ${active.service || '(none)'}${active.feature ? ` / ${active.feature}` : ''}` +
      `${active.supplier ? ` / ${active.supplier}` : ''}`
    );
    console.log(`\nOverlap candidates: ${hits || 'none'}`);
    for (const f of report.overlapCandidates.features) console.log(`  feature  ${f}`);
    for (const s of report.overlapCandidates.sharedScopes) console.log(`  shared   ${s}`);
    for (const s of report.overlapCandidates.suppliers) console.log(`  supplier ${s}`);
    if (hits) {
      console.log(
        '\nThese are CANDIDATES, not a verdict — compare business scope and acceptance criteria before ' +
        'concluding anything.'
      );
    }
  }

  if (hits) process.exitCode = 2;
}

function main(argv) {
  let args;
  try {
    args = parseArgs(argv);
  } catch (err) {
    if (err instanceof CliUsageError) {
      console.error(err.message);
      process.exitCode = 1;
      return;
    }
    throw err;
  }
  const verb = VERBS.has(args._[0]) ? args._[0] : null;

  if (!verb || args.help) {
    console.error(
      'Usage: cli.js <list|active|use|show|clear|propose|approve|scaffold|summary|stage|automation|drift|feature|use-feature|inspect-scope|ndc> [...]\n' +
      'See the header of this file for the full verb list.'
    );
    process.exitCode = args.help ? 0 : 1;
    return;
  }

  const handlers = {
    list: cmdList,
    active: cmdActive,
    use: cmdUse,
    show: cmdShow,
    clear: cmdClear,
    propose: cmdPropose,
    approve: cmdApprove,
    scaffold: cmdScaffold,
    summary: cmdSummary,
    stage: cmdStage,
    automation: cmdAutomation,
    drift: cmdDrift,
    feature: cmdFeature,
    'use-feature': cmdUseFeature,
    'inspect-scope': cmdInspectScope,
    ndc: cmdNdc,
  };

  try {
    handlers[verb](args);
  } catch (err) {
    if (err instanceof ModuleRegistryError || err instanceof ActiveModuleError
      || err instanceof ActiveFeatureError || err instanceof FeatureRegistryError
      || err instanceof FeatureScaffoldError
      || err instanceof ModuleScaffoldError || err instanceof AutomationStateError
      || err instanceof ModuleSlugError || err instanceof ServiceRegistryError
      || err instanceof ActiveServiceError || err instanceof SupplierRegistryError) {
      console.error(err.message);
      process.exitCode = 1;
      return;
    }
    throw err;
  }
}

if (require.main === module) {
  main(process.argv.slice(2));
}

module.exports = { main, parseArgs };
