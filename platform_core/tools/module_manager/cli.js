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
  setActiveModules,
  setActiveModulesToAll,
  readActiveModules,
  isActiveModuleStale,
  clearActiveModules,
} = require('./activeModule');
const { ModuleScaffoldError, scaffoldModule, planScaffold } = require('./moduleScaffold');
const {
  AUTOMATION_STATES, AutomationStateError, setAutomationState, readAutomationState,
} = require('./automationState');
const { computeModuleDrift, computeAllModuleDrift, detectStaleStages } = require('./moduleDrift');
const { writeModuleSummary } = require('./moduleSummary');
const { ModuleSlugError, generateModuleSlug } = require('./moduleSlug');

const VERBS = new Set([
  'list', 'active', 'use', 'show', 'clear',
  'propose', 'approve', 'scaffold', 'summary', 'stage', 'automation', 'drift',
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
  if (args.json) {
    console.log(JSON.stringify(state, null, 2));
    return;
  }
  if (!state.modules.length) {
    console.error('No module is active. Run `cli.js use <slug>` to select one.');
    process.exitCode = 1;
    return;
  }
  console.log(state.modules.join('\n'));
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
      `Usage: cli.js automation <slug> --state <${AUTOMATION_STATES.join('|')}> ` +
      '[--by <approver>] [--framework F] [--run <run-folder>] [--baseline-ref <sha>]'
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
      'Usage: cli.js <list|active|use|show|clear|propose|approve|scaffold|summary|stage|automation|drift> [...]\n' +
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
  };

  try {
    handlers[verb](args);
  } catch (err) {
    if (err instanceof ModuleRegistryError || err instanceof ActiveModuleError
      || err instanceof ModuleScaffoldError || err instanceof AutomationStateError
      || err instanceof ModuleSlugError) {
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
