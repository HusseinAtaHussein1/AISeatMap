#!/usr/bin/env node
// Test Suite Export CLI — renders Stage 3's authored Markdown suites into the matching .xlsx
// workbooks. The Markdown is the authored artifact; the workbook is generated output.
//
// Usage:
//   # export every TestCases_*.md in the ACTIVE run's test_design/ folder (the normal call)
//   node platform_core/tools/test_suite_export/cli.js
//
//   node .../cli.js --run <run-folder>       # a specific run instead of the active one
//   node .../cli.js --dir <path>             # any folder holding TestCases_*.md
//   node .../cli.js --file <path/to/TestCases_Search.md>      # a single suite
//   node .../cli.js --sheet-name Navigation_NFR_BR            # with --file: name the sheet tab
//   node .../cli.js --check                  # parse + report only; write nothing (CI / review gate)
//   node .../cli.js --json                   # machine-readable result
//
// Exit codes:  0 = exported, 1 = error, 2 = parsed with warnings (or --check found drift)
//
// A run folder is NEVER guessed: it comes from the Active Run pointer via run_manager, per
// test-design-skill/SKILL.md §24. A stage that writes into a run it inferred is how one logical run's
// artifacts end up scattered across several folders.

'use strict';

const fs = require('fs');
const path = require('path');

const { exportSuite, exportSuiteDir, ExportError } = require('./exportSuites');

function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) out[key] = true;
      else { out[key] = next; i += 1; }
    } else {
      out._.push(arg);
    }
  }
  return out;
}

const value = (args, key) => (args[key] && args[key] !== true ? args[key] : undefined);

/**
 * Resolve the `test_design/` folder to export from.
 *
 * Roots come from platform_paths, never from __dirname — installed inside a host project,
 * `__dirname/../../..` is the host's repository rather than the tool folder (pipeline.md §1.1).
 */
function resolveDesignDir(args) {
  const explicitDir = value(args, 'dir');
  if (explicitDir) return path.resolve(explicitDir);

  let roots;
  try {
    roots = require('../platform_paths/paths').resolveRoots();
  } catch (err) {
    throw new ExportError(
      `Could not resolve platform roots (${err.message}).\n`
      + 'Pass --dir <path> explicitly, or fix platform.config.json.'
    );
  }
  const runsDir = path.join(roots.dataRoot, 'runs');

  const { resolveActiveRunFolder } = require('../run_manager/activeRun');
  const { resolveRunFolder } = require('../run_manager/runFolderIndex');

  const explicitRun = value(args, 'run');
  const runFolder = explicitRun
    ? resolveRunFolder(runsDir, explicitRun)
    : resolveActiveRunFolder(runsDir);

  if (!runFolder) {
    throw new ExportError(
      'No active run — cannot decide which run to export.\n'
      + 'Set one with:  node platform_core/tools/run_manager/cli.js use <run-folder>\n'
      + '     or pass:  --run <run-folder>  /  --dir <path>'
    );
  }

  const designDir = path.join(runsDir, runFolder, 'test_design');
  if (!fs.existsSync(designDir)) {
    throw new ExportError(
      `Run "${runFolder}" has no test_design/ folder yet (${designDir}).\n`
      + 'Stage 3 authors the Markdown suites first; this tool renders them to Excel.'
    );
  }
  return designDir;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const dryRun = Boolean(args.check);

  let payload;
  try {
    const file = value(args, 'file');
    if (file) {
      const result = exportSuite(path.resolve(file), {
        dryRun,
        ...(value(args, 'sheet-name') ? { sheetName: value(args, 'sheet-name') } : {}),
      });
      payload = { designDir: path.dirname(result.markdownPath), results: [result], skipped: [], warnings: result.warnings };
    } else {
      payload = exportSuiteDir(resolveDesignDir(args), { dryRun });
    }
  } catch (err) {
    if (err instanceof ExportError) {
      console.error(err.message);
      process.exitCode = 1;
      return;
    }
    throw err;
  }

  const totalCases = payload.results.reduce((sum, r) => sum + r.caseCount, 0);

  if (args.json) {
    console.log(JSON.stringify({ ...payload, totalCases, mode: dryRun ? 'check' : 'export' }, null, 2));
  } else {
    console.log(`${dryRun ? 'Checked' : 'Exported'} Manual Test Suites in ${payload.designDir}`);
    for (const r of payload.results) {
      const target = dryRun ? '(not written)' : path.basename(r.xlsxPath);
      console.log(`  ${path.basename(r.markdownPath).padEnd(34)} ${String(r.caseCount).padStart(3)} case(s) -> ${target}`);
    }
    for (const s of payload.skipped) console.log(`  skipped: ${s}`);
    console.log(`  total: ${totalCases} test case(s) across ${payload.results.length} module(s)`);

    if (payload.warnings.length) {
      console.log('\nWarnings — the Markdown suite needs fixing, not the workbook:');
      for (const w of payload.warnings) console.log(`  ! ${w}`);
    }
  }

  // Non-zero on warnings so a workflow step can gate on "did every case parse cleanly?" rather than
  // shipping a workbook with blank Expected Result cells that nobody notices until Stage 4.
  if (payload.warnings.length) process.exitCode = 2;
}

if (require.main === module) {
  main();
}

module.exports = { main };
