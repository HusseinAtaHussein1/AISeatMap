#!/usr/bin/env node
// Stack Detection CLI — extracts a project's stack + pinned dependency versions and plans the
// Context7 lookups Stage 5 should perform before generating automation.
//
// Usage:
//   node platform_core/tools/mcp/stack_docs/cli.js --root platform_core_data/automation_baseline/playwright/tests_Playwright
//   node platform_core/tools/mcp/stack_docs/cli.js --root . --json
//   node platform_core/tools/mcp/stack_docs/cli.js --root . --all --max-libraries 8
//
// --root defaults to the current directory. --all includes non-material dependencies (off by
// default — see README.md §2.4). --json emits the machine-readable detection + query plan.
//
// This CLI performs no network calls: it prints the plan. The Skill issues the resolve-library-id /
// query-docs calls itself and records the outcome in the Stack Documentation Context artifact.

const { detectStack } = require('./detectStack');
const { planQueries } = require('./planQueries');

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

  const stack = detectStack(root, { materialOnly: !args.all });
  const plan = planQueries(stack, {
    maxConceptsPerLibrary: toInt(args['max-concepts']),
    maxLibraries: toInt(args['max-libraries']),
  });

  if (args.json) {
    console.log(JSON.stringify({ stack, plan }, null, 2));
    return;
  }

  console.log(`Root:        ${stack.root}`);
  console.log(`Ecosystems:  ${stack.ecosystems.join(', ') || '(none detected)'}`);
  console.log(`Frameworks:  ${stack.frameworks.join(', ') || '(none detected from config files)'}`);
  console.log(`Manifests:   ${stack.sources.join(', ') || '(none found)'}`);

  console.log('\nDependencies:');
  if (!stack.dependencies.length) {
    console.log('  (none detected — record a documentation gap, do not assume a stack)');
  }
  for (const dep of stack.dependencies) {
    const pin = dep.pinned ? 'pinned' : 'UNPINNED';
    console.log(`  ${dep.ecosystem.padEnd(7)} ${dep.library}@${dep.version} [${pin}] <- ${dep.source}`);
  }

  console.log('\nPlanned Context7 queries:');
  if (!plan.queries.length) console.log('  (none)');
  for (const q of plan.queries) {
    console.log(`  [${q.role}] ${q.docName}@${q.version}`);
    console.log(`      resolve: ${q.resolveQuery}`);
    console.log(`      ask:     ${q.question}`);
  }

  if (plan.notes.length) {
    console.log('\nNotes:');
    for (const note of plan.notes) console.log(`  - ${note}`);
  }
}

main();
