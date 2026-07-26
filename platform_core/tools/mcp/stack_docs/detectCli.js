#!/usr/bin/env node
// Project Detection CLI — prints what the platform can learn about a Target Project by reading it:
// its stack, where its tests live, the conventions they are written with, and the configuration
// `agentic-testing init` would propose.
//
// Usage:
//   node platform_core/tools/mcp/stack_docs/detectCli.js --root ../my-app
//   node platform_core/tools/mcp/stack_docs/detectCli.js --root . --json
//   node platform_core/tools/mcp/stack_docs/detectCli.js --root . --all --max-depth 12
//
// READ-ONLY: this performs no writes and no network calls. Per pipeline.md §6 Rule 9 its output
// describes what the project IS, never what it SHOULD DO.

const { detectProject } = require('./detectProject');

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith('--')) continue;
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

function toInt(value) {
  const n = Number.parseInt(value, 10);
  return Number.isNaN(n) ? undefined : n;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const root = typeof args.root === 'string' ? args.root : '.';

  const result = detectProject(root, {
    materialOnly: !args.all,
    maxDepth: toInt(args['max-depth']),
    includeQueryPlan: Boolean(args.plan),
  });

  if (args.json) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  const { stack, testDirs, recommended } = result;

  console.log(`Root:        ${result.root}`);
  console.log(`Mode:        ${result.greenfield ? 'GREENFIELD (no test suite found)' : 'BROWNFIELD'}`);
  console.log(`Ecosystems:  ${stack.ecosystems.join(', ') || '(none detected)'}`);
  console.log(`Framework:   ${recommended.framework || '(none resolved)'}`);
  console.log(`Language:    ${recommended.language || '(unknown)'}`);

  console.log('\nTest directories:');
  if (!testDirs.dirs.length) {
    console.log('  (none found)');
  }
  for (const dir of testDirs.dirs) {
    const primary = testDirs.primary && dir.path === testDirs.primary.path ? '  <- primary' : '';
    console.log(`  ${dir.path}${primary}`);
    console.log(`      kind: ${dir.kind} · confidence: ${dir.confidence} · via: ${dir.source} · files: ${dir.fileCount}`);
    for (const line of dir.evidence) console.log(`      - ${line}`);
  }

  if (!result.greenfield) {
    const c = testDirs.conventions;
    console.log('\nConventions to match when generating:');
    console.log(`  file naming:  ${c.fileNaming || '(unknown)'}${c.fileNamingSamples.length ? ` (e.g. ${c.fileNamingSamples.slice(0, 3).join(', ')})` : ''}`);
    console.log(`  page objects: ${c.pageObjectDir || '(none)'}`);
    console.log(`  fixtures:     ${c.fixtureDir || '(none)'}`);
    console.log(`  helpers:      ${c.helperDir || '(none)'}`);
    console.log(`  test data:    ${c.testDataDir || '(none)'}`);
    console.log(`  formatting:   ${c.indentation || '?'} indent · ${c.quoteStyle || '?'} quotes · ${c.importStyle || '?'} imports`);
  } else {
    console.log('\nSuggested locations (greenfield — test infrastructure only, never the application):');
    for (const s of testDirs.suggestions) console.log(`  ${s.path} — ${s.reason}`);
  }

  console.log('\nProposed platform.config.json target block:');
  console.log(
    JSON.stringify(
      {
        testDirs: recommended.testDirs,
        automationRoot: recommended.automationRoot,
        writeAllowlist: recommended.writeAllowlist,
      },
      null,
      2,
    )
      .split('\n')
      .map((l) => `  ${l}`)
      .join('\n'),
  );

  if (recommended.scaffoldTestInfra) {
    console.log('\nInit would scaffold test infrastructure only: the test directory, the framework');
    console.log('config, and one example smoke test. It never scaffolds the application (§13.6).');
  }

  if (result.warnings.length) {
    console.log('\nWarnings:');
    for (const w of result.warnings) console.log(`  - ${w}`);
  }
}

main();
