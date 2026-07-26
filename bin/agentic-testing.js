#!/usr/bin/env node
// Agentic AI Testing Platform CLI.
//
// Both install routes land here: `npx agentic-testing init` and a git clone plus scripts/init.sh
// invoke the same platform_core/tools/init code, so the two cannot drift apart.
//
// Commands:
//   init       Install the platform into a target project
//   doctor     Validate an installation; print resolved roots and diagnostics
//   detect     Print the detected stack and test dirs as JSON (read-only)
//   roots      Print resolved roots as JSON (what a pipeline stage calls)
//   upgrade    Update tool code and skills; never touches platform_core_data/
//   uninstall  Remove tool code; keeps platform_core_data/ unless --purge-data
//
// Exit codes: 0 ok · 1 error or refused operation.

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const PACKAGE_ROOT = path.join(__dirname, '..');

const { installPlatform, buildPlan, renderPlan, inferTargetRoot, InitError, MANIFEST_FILENAME, DEFAULT_TOOL_DIR } = require('../platform_core/tools/init');
const { detectProject } = require('../platform_core/tools/mcp/stack_docs/detectProject');

const BOOLEAN_FLAGS = new Set([
  'yes', 'y', 'dry-run', 'force', 'json', 'no-mcp', 'no-context7', 'allow-detached', 'purge-data',
  'help', 'h', 'version', 'v',
]);

function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith('--')) {
      if (arg.startsWith('-') && arg.length === 2) {
        out[arg.slice(1)] = true;
        continue;
      }
      out._.push(arg);
      continue;
    }
    const key = arg.slice(2);
    if (BOOLEAN_FLAGS.has(key)) {
      out[key] = true;
      continue;
    }
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) out[key] = true;
    else {
      out[key] = next;
      i += 1;
    }
  }
  return out;
}

const USAGE = `agentic-testing — spec-driven agentic QA, installed into your own repository

Usage: agentic-testing <command> [options]

Commands
  init         Install the platform into a target project
  doctor       Validate an installation and print its resolved roots
  detect       Print the detected stack and test directories (read-only)
  roots        Print resolved roots as JSON
  upgrade      Update tool code and skills, never platform_core_data/
  uninstall    Remove tool code; keeps your artifacts unless --purge-data

init options
  --target <path>        Project to install into            (default: current directory)
  --tool-dir <name>      Folder to create inside it         (default: ${DEFAULT_TOOL_DIR})
  --mode <m>             auto | brownfield | greenfield     (default: auto)
  --test-dir <path>      Override the detected test directory
  --framework <name>     Override the detected framework
  --git-mode <m>         tool-repo | host-repo | off        (default: tool-repo)
  --skills <s>           all | none | comma-separated list  (default: all)
  --no-mcp               Do not register MCP servers
  --no-context7          Register playwright only
  --dry-run              Print the plan and exit, writing nothing
  --yes                  Skip the confirmation prompt
  --force                Overwrite differing skills (never platform_core_data/)
  --allow-detached       Permit a tool folder outside the target project
  --json                 Machine-readable output

Examples
  npx agentic-testing init                     # install into the current project
  npx agentic-testing init --dry-run           # see exactly what would change
  npx agentic-testing detect --root ../my-app  # what would be detected
  npx agentic-testing doctor                   # is this installation sane?
`;

function fail(message) {
  console.error(`\nError: ${message}\n`);
  process.exitCode = 1;
}

/** Locates an existing installation by walking up for the tool marker. */
function findInstallation(startDir) {
  let dir = path.resolve(startDir);
  for (;;) {
    if (fs.existsSync(path.join(dir, 'platform.config.json'))) return dir;
    const candidate = path.join(dir, DEFAULT_TOOL_DIR, 'platform.config.json');
    if (fs.existsSync(candidate)) return path.join(dir, DEFAULT_TOOL_DIR);
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

function confirm(question) {
  return new Promise((resolve) => {
    if (!process.stdin.isTTY) {
      // Non-interactive (CI, a piped shell): refuse rather than assume consent for a write into
      // somebody's repository. --yes is the explicit opt-in.
      resolve(false);
      return;
    }
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(`${question} [y/N] `, (answer) => {
      rl.close();
      resolve(/^y(es)?$/i.test(answer.trim()));
    });
  });
}

// -------------------------------------------------------------------------------------------------
// init
// -------------------------------------------------------------------------------------------------

async function cmdInit(args) {
  const targetArg = args.target || args._[1];
  const target = targetArg ? path.resolve(targetArg) : process.cwd();

  if (!targetArg) {
    const inferred = inferTargetRoot(process.cwd());
    if (inferred.root !== target.split(path.sep).join('/')) {
      console.log(`Note: ${inferred.reason} → ${inferred.root}`);
      console.log(`Installing into the current directory instead: ${target.split(path.sep).join('/')}`);
      console.log('Pass --target to choose a different project.\n');
    }
  }

  const options = {
    packageRoot: PACKAGE_ROOT,
    targetRoot: target,
    toolDir: typeof args['tool-dir'] === 'string' ? args['tool-dir'] : undefined,
    mode: typeof args.mode === 'string' ? args.mode : 'auto',
    testDir: typeof args['test-dir'] === 'string' ? args['test-dir'] : undefined,
    framework: typeof args.framework === 'string' ? args.framework : undefined,
    gitMode: typeof args['git-mode'] === 'string' ? args['git-mode'] : undefined,
    skills: typeof args.skills === 'string' ? args.skills : undefined,
    mcp: !args['no-mcp'],
    context7: !args['no-context7'],
    force: Boolean(args.force),
    allowDetached: Boolean(args['allow-detached']),
    dryRun: Boolean(args['dry-run']),
    now: new Date(),
  };

  const plan = buildPlan(options);

  if (args.json && options.dryRun) {
    console.log(JSON.stringify(plan, null, 2));
    return;
  }

  console.log(renderPlan(plan));
  console.log('');

  if (options.dryRun) {
    console.log('Dry run — nothing was written.');
    return;
  }

  if (!args.yes && !args.y) {
    const ok = await confirm('Apply this plan?');
    if (!ok) {
      console.log(
        process.stdin.isTTY
          ? 'Cancelled — nothing was written.'
          : 'Refusing to write without confirmation in a non-interactive shell. Re-run with --yes.',
      );
      process.exitCode = 1;
      return;
    }
  }

  const { manifest } = installPlatform({ ...options, dryRun: false });

  console.log('');
  console.log(`Installed into ${plan.toolRoot}`);
  console.log('');
  console.log('Next steps:');
  console.log(`  1. Fill in ${plan.toolDir}/platform_core_data/PRD.md — the approved requirements.`);
  console.log(`  2. Fill in ${plan.toolDir}/platform_core_data/run_configuration.md — environment and scope.`);
  console.log('  3. Run /project-context-skill to produce the Project Context, then review it.');
  console.log('');
  console.log(`Approve the MCP servers once per machine with /mcp, and run \`npx playwright install chromium\`.`);
  if (manifest.hostFilesTouched.length) {
    console.log('');
    console.log('Files added outside the tool folder:');
    for (const f of manifest.hostFilesTouched) console.log(`  ${f}`);
  }
}

// -------------------------------------------------------------------------------------------------
// doctor / roots
// -------------------------------------------------------------------------------------------------

function loadPathsFor(toolRoot) {
  // Prefer the installation's own copy, so `doctor` reports what that install would actually do.
  const local = path.join(toolRoot, 'platform_core', 'tools', 'platform_paths', 'paths.js');
  return require(fs.existsSync(local) ? local : '../platform_core/tools/platform_paths/paths');
}

function cmdDoctor(args) {
  const toolRoot = findInstallation(args.target || process.cwd());
  if (!toolRoot) {
    fail(
      'No installation found here. Run `agentic-testing init` in your project, or pass --target.',
    );
    return;
  }

  const paths = loadPathsFor(toolRoot);
  const roots = paths.resolveRoots({ startDir: toolRoot, fresh: true });

  if (args.json) {
    console.log(JSON.stringify(roots, null, 2));
    return;
  }

  console.log(`Mode:         ${roots.mode}`);
  console.log(`Tool Root:    ${roots.toolRoot}`);
  console.log(`Data Root:    ${roots.dataRoot}`);
  console.log(`Target Root:  ${roots.targetRoot}`);
  console.log(`Config:       ${roots.configPath || '(none — built-in defaults)'}`);
  console.log(`Git mode:     ${roots.git.mode} (commitBaseline: ${roots.git.commitBaseline})`);
  console.log(`Automation:   ${roots.target.automationRoot || '(not configured)'}`);
  console.log(`Target write: ${roots.canWriteTarget ? 'enabled' : 'DISABLED (fail-closed)'}`);

  console.log('\nResolution trace:');
  for (const line of roots.resolution) console.log(`  ${line}`);

  const manifestPath = path.join(roots.toolRoot, MANIFEST_FILENAME);
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    console.log(`\nInstalled: ${manifest.installedAt} (${manifest.mode})`);
    if (manifest.hostFilesTouched.length) {
      console.log('Files this platform added outside the tool folder:');
      for (const f of manifest.hostFilesTouched) console.log(`  ${f}`);
    }
  }

  paths.assertValidInstall(roots);
  console.log('\nInstallation OK.');
}

function cmdRoots(args) {
  const toolRoot = findInstallation(args.target || process.cwd());
  if (!toolRoot) {
    fail('No installation found here. Run `agentic-testing init`, or pass --target.');
    return;
  }
  const paths = loadPathsFor(toolRoot);
  console.log(JSON.stringify(paths.resolveRoots({ startDir: toolRoot, fresh: true }), null, 2));
}

// -------------------------------------------------------------------------------------------------
// detect
// -------------------------------------------------------------------------------------------------

function cmdDetect(args) {
  const root = path.resolve(args.root || args._[1] || process.cwd());
  const result = detectProject(root, { exclude: [DEFAULT_TOOL_DIR] });

  if (args.json) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  console.log(`Root:        ${result.root}`);
  console.log(`Mode:        ${result.greenfield ? 'GREENFIELD (no test suite found)' : 'BROWNFIELD'}`);
  console.log(`Ecosystems:  ${result.stack.ecosystems.join(', ') || '(none detected)'}`);
  console.log(`Framework:   ${result.recommended.framework || '(none resolved)'}`);
  console.log(`Language:    ${result.recommended.language || '(unknown)'}`);

  console.log('\nTest directories:');
  if (!result.testDirs.dirs.length) console.log('  (none found)');
  for (const dir of result.testDirs.dirs) {
    const primary = result.testDirs.primary && dir.path === result.testDirs.primary.path ? '  <- primary' : '';
    console.log(`  ${dir.path}${primary}`);
    console.log(`      ${dir.kind} · ${dir.confidence} confidence · via ${dir.source} · ${dir.fileCount} files`);
  }

  if (result.greenfield) {
    console.log('\nSuggested (greenfield — test infrastructure only):');
    for (const s of result.testDirs.suggestions) console.log(`  ${s.path} — ${s.reason}`);
  } else {
    const c = result.testDirs.conventions;
    console.log('\nConventions generated code would match:');
    console.log(`  naming:       ${c.fileNaming || '(unknown)'}`);
    console.log(`  page objects: ${c.pageObjectDir || '(none)'}`);
    console.log(`  formatting:   ${c.indentation || '?'} · ${c.quoteStyle || '?'} quotes · ${c.importStyle || '?'}`);
  }
}

// -------------------------------------------------------------------------------------------------
// upgrade / uninstall
// -------------------------------------------------------------------------------------------------

async function cmdUpgrade(args) {
  const toolRoot = findInstallation(args.target || process.cwd());
  if (!toolRoot) {
    fail('No installation found here. Run `agentic-testing init`, or pass --target.');
    return;
  }

  const paths = loadPathsFor(toolRoot);
  const roots = paths.resolveRoots({ startDir: toolRoot, fresh: true });

  console.log(`Upgrading ${roots.toolRoot}`);
  console.log('platform_core_data/ is not touched — your PRD and artifacts stay exactly as they are.\n');

  // An upgrade is an install against the same target: tool code is replaced, data is preserved by
  // the same rule that protects it on a re-install.
  await cmdInit({
    ...args,
    target: roots.targetRoot,
    'tool-dir': path.basename(roots.toolRoot),
    'git-mode': roots.git.mode,
  });
}

async function cmdUninstall(args) {
  const toolRoot = findInstallation(args.target || process.cwd());
  if (!toolRoot) {
    fail('No installation found here.');
    return;
  }

  const paths = loadPathsFor(toolRoot);
  const roots = paths.resolveRoots({ startDir: toolRoot, fresh: true });
  const purge = Boolean(args['purge-data']);

  console.log(`Uninstalling from ${roots.toolRoot}`);
  console.log(
    purge
      ? 'WARNING: --purge-data will DELETE platform_core_data/, including your PRD, every artifact, and all run history.'
      : 'platform_core_data/ will be KEPT — pass --purge-data to delete it too.',
  );

  const manifestPath = path.join(roots.toolRoot, MANIFEST_FILENAME);
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    if (manifest.hostFilesTouched.length) {
      console.log('\nThese files were added outside the tool folder and are left in place for you to review:');
      for (const f of manifest.hostFilesTouched) console.log(`  ${f}`);
    }
  }

  if (!args.yes && !args.y) {
    const ok = await confirm('\nProceed?');
    if (!ok) {
      console.log('Cancelled — nothing was removed.');
      process.exitCode = 1;
      return;
    }
  }

  for (const dir of ['platform_core', 'workflows_and_pipelines']) {
    const abs = path.join(roots.toolRoot, dir);
    if (fs.existsSync(abs)) {
      fs.rmSync(abs, { recursive: true, force: true });
      console.log(`Removed ${dir}/`);
    }
  }
  if (purge) {
    fs.rmSync(roots.dataRoot, { recursive: true, force: true });
    console.log('Removed platform_core_data/');
  }
  for (const file of ['platform.config.json', MANIFEST_FILENAME]) {
    const abs = path.join(roots.toolRoot, file);
    if (fs.existsSync(abs)) fs.rmSync(abs);
  }
  console.log('\nDone. Remove the .gitignore block and .mcp.json entries yourself if you want them gone.');
}

// -------------------------------------------------------------------------------------------------

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const command = args._[0];

  if (args.help || args.h || !command) {
    console.log(USAGE);
    return;
  }
  if (args.version || args.v) {
    console.log(require('../package.json').version);
    return;
  }

  try {
    switch (command) {
      case 'init': await cmdInit(args); break;
      case 'doctor': cmdDoctor(args); break;
      case 'roots': cmdRoots(args); break;
      case 'detect': cmdDetect(args); break;
      case 'upgrade': await cmdUpgrade(args); break;
      case 'uninstall': await cmdUninstall(args); break;
      default:
        fail(`Unknown command "${command}". Run \`agentic-testing --help\`.`);
    }
  } catch (err) {
    if (err instanceof InitError || err.name === 'ConfigError') {
      fail(err.message);
      return;
    }
    throw err;
  }
}

main();
