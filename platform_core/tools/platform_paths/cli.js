#!/usr/bin/env node
// Platform Paths CLI — prints the platform's resolved roots. This is what a pipeline stage calls
// when it needs an absolute root; per pipeline.md §1.1 an agent must never infer a root from
// process.cwd(), from __dirname, or by searching for .git.
//
// Usage:
//   node platform_core/tools/platform_paths/cli.js roots --json
//   node platform_core/tools/platform_paths/cli.js roots
//   node platform_core/tools/platform_paths/cli.js classify <path> [--json]
//   node platform_core/tools/platform_paths/cli.js doctor
//
// Exit codes: 0 ok · 1 invalid installation or unreadable configuration.

const {
  resolveRoots,
  classifyPath,
  assertValidInstall,
  ConfigError,
} = require('./paths');

function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith('--')) {
      out._.push(arg);
      continue;
    }
    const key = arg.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) {
      out[key] = true;
    } else {
      out[key] = next;
      i += 1;
    }
  }
  return out;
}

function printRoots(roots, json) {
  if (json) {
    console.log(JSON.stringify(roots, null, 2));
    return;
  }
  console.log(`Mode:         ${roots.mode}`);
  console.log(`Tool Root:    ${roots.toolRoot}`);
  console.log(`Data Root:    ${roots.dataRoot}`);
  console.log(`Core Root:    ${roots.coreRoot}`);
  console.log(`Target Root:  ${roots.targetRoot}`);
  console.log(`Config:       ${roots.configPath || '(none — built-in defaults)'}`);
  console.log(`Git mode:     ${roots.git.mode} (commitBaseline: ${roots.git.commitBaseline})`);
  console.log(`Automation:   ${roots.target.automationRoot || '(not configured)'}`);
  console.log(`Target write: ${roots.canWriteTarget ? 'enabled' : 'DISABLED (fail-closed)'}`);

  if (roots.target.writeAllowlist.length) {
    console.log('\nWrite allowlist (relative to Target Root):');
    for (const p of roots.target.writeAllowlist) console.log(`  ${p}`);
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const command = args._[0] || 'roots';

  try {
    switch (command) {
      case 'roots': {
        printRoots(resolveRoots({ fresh: true }), Boolean(args.json));
        return;
      }

      case 'classify': {
        const target = args._[1];
        if (!target) {
          console.error('classify requires a path argument.');
          process.exitCode = 1;
          return;
        }
        const roots = resolveRoots({ fresh: true });
        const result = classifyPath(target, roots);
        if (args.json) {
          console.log(JSON.stringify(result, null, 2));
          return;
        }
        console.log(`Path:     ${target}`);
        console.log(`Root:     ${result.root}`);
        console.log(`Relative: ${result.relative === null ? '(n/a)' : result.relative}`);
        console.log(`Writable: ${result.writable ? 'yes' : 'no'}`);
        console.log(`Reason:   ${result.reason}`);
        return;
      }

      case 'doctor': {
        const roots = resolveRoots({ fresh: true });
        printRoots(roots, false);
        console.log('\nResolution trace:');
        for (const line of roots.resolution) console.log(`  ${line}`);
        assertValidInstall(roots);
        console.log('\nInstallation OK.');
        return;
      }

      default: {
        console.error(`Unknown command "${command}". Expected: roots | classify | doctor`);
        process.exitCode = 1;
      }
    }
  } catch (err) {
    if (err instanceof ConfigError) {
      console.error(`\n${err.message}\n`);
      process.exitCode = 1;
      return;
    }
    throw err;
  }
}

main();
