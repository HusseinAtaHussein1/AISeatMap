#!/usr/bin/env node
'use strict';

/**
 * Report Builder CLI — turns a report model (JSON) into the platform's standard
 * self-contained HTML report.
 *
 *   node cli.js build --model <model.json> --out <report.html>
 *   node cli.js validate --model <model.json>
 *   node cli.js schema
 *
 * The Markdown report stays the authoritative artifact; this produces the
 * shareable HTML view alongside it.
 */

const fs = require('fs');
const path = require('path');

const { ReportModelError, normalizeModel } = require('./model');
const { renderReport } = require('./render');

const USAGE = `Usage:
  cli.js build    --model <model.json> [--out <report.html>] [--stdout]
  cli.js validate --model <model.json>
  cli.js schema   [--json]

Options:
  --model <path>   Report model JSON. Use "-" to read from stdin.
  --out <path>     Where to write the HTML. Defaults next to the model file.
  --stdout         Write the HTML to stdout instead of a file.
  --json           Machine-readable output.
`;

function parseArgs(argv) {
  const args = { _: [], flags: {} };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith('--')) {
      args._.push(arg);
      continue;
    }
    const name = arg.slice(2);
    if (name === 'stdout' || name === 'json' || name === 'help') {
      args.flags[name] = true;
      continue;
    }
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) {
      throw new Error(`--${name} requires a value`);
    }
    args.flags[name] = next;
    i += 1;
  }
  return args;
}

function readStdin() {
  return fs.readFileSync(0, 'utf8');
}

function loadModel(modelPath) {
  if (!modelPath) throw new Error('--model is required');
  const raw = modelPath === '-' ? readStdin() : fs.readFileSync(path.resolve(modelPath), 'utf8');
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`--model is not valid JSON: ${error.message}`);
  }
}

function defaultOutPath(modelPath) {
  const resolved = path.resolve(modelPath);
  const dir = path.dirname(resolved);
  const base = path.basename(resolved).replace(/\.report\.json$|\.json$/i, '');
  return path.join(dir, `${base}.html`);
}

function commandBuild(args) {
  const model = loadModel(args.flags.model);
  const html = renderReport(model);

  if (args.flags.stdout) {
    process.stdout.write(html);
    return 0;
  }

  const outPath = args.flags.out
    ? path.resolve(args.flags.out)
    : defaultOutPath(args.flags.model === '-' ? 'report.json' : args.flags.model);

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, html, 'utf8');

  if (args.flags.json) {
    process.stdout.write(`${JSON.stringify({ ok: true, out: outPath, bytes: Buffer.byteLength(html) }, null, 2)}\n`);
  } else {
    process.stdout.write(`Wrote ${outPath} (${Buffer.byteLength(html)} bytes)\n`);
  }
  return 0;
}

function commandValidate(args) {
  const model = loadModel(args.flags.model);
  const normalized = normalizeModel(model);

  const categories = normalized.testCases ? normalized.testCases.categories.length : 0;
  const cases = normalized.testCases
    ? normalized.testCases.categories.reduce((sum, c) => sum + c.cases.length, 0)
    : 0;
  const result = {
    ok: true,
    title: normalized.title,
    statuses: normalized.statuses.map((s) => s.key),
    categories,
    testCases: cases,
    sections: normalized.sections.map((s) => `${s.type}:${s.title}`),
  };

  if (args.flags.json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } else {
    process.stdout.write(
      `Model is valid — ${cases} test case(s) in ${categories} category/ies, `
      + `${normalized.sections.length} section(s).\n`,
    );
  }
  return 0;
}

function commandSchema(args) {
  const doc = path.join(__dirname, 'README.md');
  if (args.flags.json) {
    process.stdout.write(`${JSON.stringify({ ok: true, reference: doc }, null, 2)}\n`);
    return 0;
  }
  process.stdout.write(fs.readFileSync(doc, 'utf8'));
  return 0;
}

function main(argv) {
  let args;
  try {
    args = parseArgs(argv);
  } catch (error) {
    process.stderr.write(`${error.message}\n\n${USAGE}`);
    return 1;
  }

  const command = args._[0];
  if (!command || args.flags.help) {
    process.stdout.write(USAGE);
    return command ? 0 : 1;
  }

  try {
    if (command === 'build') return commandBuild(args);
    if (command === 'validate') return commandValidate(args);
    if (command === 'schema') return commandSchema(args);
    process.stderr.write(`Unknown command "${command}".\n\n${USAGE}`);
    return 1;
  } catch (error) {
    if (error instanceof ReportModelError) {
      // Exit 2 marks "the model is wrong", separate from an I/O or usage failure.
      process.stderr.write(`Invalid report model — ${error.message}\n`);
      return 2;
    }
    process.stderr.write(`${error.message}\n`);
    return 1;
  }
}

if (require.main === module) {
  process.exitCode = main(process.argv.slice(2));
}

module.exports = { main, parseArgs };
