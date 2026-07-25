#!/usr/bin/env node
// Run Folder Naming CLI — the one place a new run's folder name is generated. Agents/skills must
// call this instead of hand-formatting a folder name.
//
// Usage:
//   node platform_core/tools/run_manager/cli.js --scope UserStory --target "Create Role" \
//     --started 2026-07-23T10:35:18 --existing-dir platform_core_data/runs [--json]
//
// --started defaults to now if omitted. --existing-dir, if given, is scanned for existing folder
// names so collisions get a deterministic __2/__3 suffix.

const fs = require('fs');
const { generateRunFolderName } = require('./runFolderName');

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

function main() {
  const args = parseArgs(process.argv.slice(2));

  const now = args.started ? new Date(args.started) : new Date();
  if (Number.isNaN(now.getTime())) {
    console.error(`Invalid --started value: ${args.started}`);
    process.exitCode = 1;
    return;
  }

  let existingNames = [];
  if (args['existing-dir'] && fs.existsSync(args['existing-dir'])) {
    existingNames = fs.readdirSync(args['existing-dir'], { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => e.name);
  }

  const folderName = generateRunFolderName(
    { scope: args.scope, target: args.target },
    { existingNames, now }
  );

  if (args.json) {
    console.log(JSON.stringify({ folderName, scope: args.scope, target: args.target, started: now.toISOString() }, null, 2));
  } else {
    console.log(folderName);
  }
}

if (require.main === module) {
  main();
}
