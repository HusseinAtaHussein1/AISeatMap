// The CLI — exit codes, output, and what it refuses to touch.

'use strict';

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const { makeDataRoot, makeRun, makeTestSuite, fixtureEvents, writeEvents, RUN, FIXTURE_CASES } = require('./fixtures');

const CLI = path.join(__dirname, '..', 'cli.js');

/** Runs the CLI with an isolated data root, so no test can touch the real platform_core_data/. */
function run(args, dataRoot) {
  const cwd = path.dirname(dataRoot); // the fixture root's parent becomes the discovery start dir
  try {
    const stdout = execFileSync(process.execPath, [CLI, ...args], {
      encoding: 'utf8', cwd, env: { ...process.env, PLATFORM_DATA_ROOT: dataRoot },
    });
    return { code: 0, stdout, stderr: '' };
  } catch (err) {
    return { code: err.status, stdout: err.stdout || '', stderr: err.stderr || '' };
  }
}

function setup({ withEvents = true, withSuite = true } = {}) {
  const dataRoot = makeDataRoot();
  makeRun(dataRoot);
  if (withEvents) writeEvents(dataRoot, RUN, fixtureEvents());
  if (withSuite) makeTestSuite(dataRoot, 'fixture', FIXTURE_CASES);
  // A platform.config.json makes resolveRoots find THIS root rather than the repository's.
  fs.writeFileSync(path.join(path.dirname(dataRoot), 'platform.config.json'), JSON.stringify({
    configVersion: 1, mode: 'self-hosted', targetRoot: '.', dataRoot: path.basename(dataRoot),
  }, null, 2));
  return dataRoot;
}

test('--help lists the subcommands and exits non-zero with no command', () => {
  const dataRoot = setup();
  const help = run(['--help'], dataRoot);
  for (const c of ['record', 'summary', 'validate', 'metrics', 'report', 'dashboard', 'historical', 'compare']) {
    assert.ok(help.stdout.includes(c), `${c} is missing from usage`);
  }
  assert.strictEqual(run([], dataRoot).code, 1);
});

test('an unknown command exits 1 and shows usage', () => {
  const r = run(['frobnicate'], setup());
  assert.strictEqual(r.code, 1);
  assert.match(r.stderr, /Unknown command/);
});

test('summary of a fully instrumented run exits 0 and reports the measured facts', () => {
  const r = run(['summary', '--run', RUN], setup());
  assert.strictEqual(r.code, 0);
  assert.match(r.stdout, /Instrumentation:\s+Fully Instrumented/);
  assert.match(r.stdout, /Duration:\s+6m 40s/);
  assert.match(r.stdout, /Human decisions:\s+2 requested, 1 pending/);
  assert.match(r.stdout, /Tool calls:\s+3 \(1 failed, 1 retries\)/);
  // Governance totals come from the fixture suite on disk, parsed by test_suite_export's own parser.
  // Asserting the real numbers here is what catches a fixture whose Markdown the parser cannot read —
  // which would otherwise show up as a plausible-looking wall of zeroes.
  assert.match(r.stdout, /Test cases:\s+6 — Review approved 4, Automation approved 2/);
  assert.match(r.stdout, /TC acceptance:\s+80\.0%/);
});

test('summary always states that token usage and cost are unavailable', () => {
  const r = run(['summary', '--run', RUN], setup());
  assert.match(r.stdout, /Token usage:\s+Unavailable/);
  assert.match(r.stdout, /Cost:\s+Unavailable/);
  assert.match(r.stdout, /`Unavailable` means unmeasured, and is not zero/);
});

test('summary of a non-instrumented run exits 2 and reports Not Instrumented', () => {
  const r = run(['summary', '--run', RUN], setup({ withEvents: false }));
  assert.strictEqual(r.code, 2);
  assert.match(r.stdout, /Not Instrumented/);
  assert.match(r.stdout, /Tool calls:\s+Unavailable/);
});

test('validate passes a clean stream', () => {
  const r = run(['validate', '--run', RUN], setup());
  assert.strictEqual(r.code, 0);
  assert.match(r.stdout, /schema-valid and every span is closed/);
});

test('validate detects an unclosed span and exits 2', () => {
  const dataRoot = setup({ withEvents: false });
  writeEvents(dataRoot, RUN, fixtureEvents().filter((e) => !(e.type === 'STAGE_COMPLETED' && e.stage === '4A')));
  const r = run(['validate', '--run', RUN], dataRoot);
  assert.strictEqual(r.code, 2);
  assert.match(r.stdout, /Unclosed spans \(1\)/);
  assert.match(r.stdout, /never given a duration/);
  assert.match(r.stdout, /spn-stage-4a/);
});

test('validate reports a non-instrumented run as such rather than as valid', () => {
  const r = run(['validate', '--run', RUN], setup({ withEvents: false }));
  assert.strictEqual(r.code, 2);
  assert.match(r.stdout, /NOT INSTRUMENTED/);
  assert.match(r.stdout, /No metric is invented in its place, and none is zero/);
});

test('validate reports corrupt telemetry by line and refuses to certify it', () => {
  const dataRoot = setup();
  const file = path.join(dataRoot, 'runs', RUN, 'metadata', 'observability', 'ObservabilityEvents.jsonl');
  fs.appendFileSync(file, '{ not json\n');
  const r = run(['validate', '--run', RUN], dataRoot);
  assert.strictEqual(r.code, 2);
  assert.match(r.stdout, /Line \d+: not valid JSON/);
});

test('validate rejects events copied in from another run', () => {
  const dataRoot = setup({ withEvents: false });
  writeEvents(dataRoot, RUN, fixtureEvents('run-777__someone-elses-run'));
  const r = run(['validate', '--run', RUN], dataRoot);
  assert.strictEqual(r.code, 2);
  assert.match(r.stdout, /Foreign: \d+ event\(s\) from another run — rejected/);
});

test('a missing run and no active pointer is an error, not a silent empty report', () => {
  const dataRoot = setup();
  const r = run(['summary'], dataRoot);
  assert.strictEqual(r.code, 1);
  assert.match(r.stderr, /No run specified and no Active Run pointer/);
});

test('metrics --json emits the canonical machine-readable shape', () => {
  const r = run(['metrics', '--run', RUN], setup());
  assert.strictEqual(r.code, 0);
  const m = JSON.parse(r.stdout);
  assert.strictEqual(m.schemaVersion, 1);
  assert.strictEqual(m.runId, RUN);
  assert.strictEqual(m.aiUsage.available, false);
  for (const key of ['instrumentation', 'run', 'stages', 'tools', 'humanDecisions', 'testDesign',
    'automation', 'execution', 'safety', 'formulas', 'integrity']) {
    assert.ok(m[key] !== undefined, `${key} is missing from the metrics shape`);
  }
});

test('report renders the Markdown, and --out writes it into the run folder', () => {
  const dataRoot = setup();
  const printed = run(['report', '--run', RUN], dataRoot);
  assert.match(printed.stdout, /^# Observability Report/m);

  const written = run(['report', '--run', RUN, '--out'], dataRoot);
  assert.strictEqual(written.code, 0);
  const file = path.join(dataRoot, 'runs', RUN, 'metadata', 'observability', 'ObservabilityReport.md');
  assert.ok(fs.existsSync(file));
  assert.match(fs.readFileSync(file, 'utf8'), /## 12\. AI Usage/);
});

test('dashboard writes a self-contained HTML file alongside regenerated metrics', () => {
  const dataRoot = setup();
  const r = run(['dashboard', '--run', RUN, '--out'], dataRoot);
  assert.strictEqual(r.code, 0);
  assert.match(r.stdout, /Self-contained: open it directly in a browser/);

  const dir = path.join(dataRoot, 'runs', RUN, 'metadata', 'observability');
  const html = fs.readFileSync(path.join(dir, 'ObservabilityDashboard.html'), 'utf8');
  assert.match(html, /^<!DOCTYPE html>/);
  assert.ok(!/https?:\/\//.test(html));
  assert.ok(fs.existsSync(path.join(dir, 'ObservabilityMetrics.json')), 'metrics regenerated with it');
});

test('generating a dashboard never modifies the source telemetry', () => {
  const dataRoot = setup();
  const events = path.join(dataRoot, 'runs', RUN, 'metadata', 'observability', 'ObservabilityEvents.jsonl');
  const before = fs.readFileSync(events, 'utf8');
  run(['dashboard', '--run', RUN, '--out'], dataRoot);
  run(['report', '--run', RUN, '--out'], dataRoot);
  run(['metrics', '--run', RUN, '--out'], dataRoot);
  assert.strictEqual(fs.readFileSync(events, 'utf8'), before, 'evidence is never revised');
});

test('record appends an event and prints its ID', () => {
  const dataRoot = setup({ withEvents: false });
  const r = run(['record', '--run', RUN, '--type', 'VALIDATION_PASSED', '--source', 'platform-tool', '--kind', 'schema'], dataRoot);
  assert.strictEqual(r.code, 0);
  assert.match(r.stdout, /^evt-000001-[0-9a-f]{8}\s+VALIDATION_PASSED/m);
});

test('record refuses to guess provenance', () => {
  const dataRoot = setup({ withEvents: false });
  const r = run(['record', '--run', RUN, '--type', 'VALIDATION_PASSED'], dataRoot);
  assert.strictEqual(r.code, 1);
  assert.match(r.stderr, /Provenance is never assumed/);
});

test('record refuses an unknown event type rather than inventing a bucket', () => {
  const dataRoot = setup({ withEvents: false });
  const r = run(['record', '--run', RUN, '--type', 'TOKENS_USED', '--source', 'skill'], dataRoot);
  assert.strictEqual(r.code, 1);
  assert.match(r.stderr, /Unknown event type/);
});

test('historical reports what artifacts prove and lists what they cannot', () => {
  const dataRoot = setup({ withEvents: false });
  const r = run(['historical', '--run', RUN], dataRoot);
  assert.strictEqual(r.code, 0);
  assert.match(r.stdout, /Historical Derived Metrics/);
  assert.match(r.stdout, /Not recoverable — no artifact records these, and none is estimated/);
  assert.match(r.stdout, /- humanDecisions/);
});

test('compare needs two runs and reports when a trend cannot be drawn', () => {
  const dataRoot = setup();
  assert.strictEqual(run(['compare', '--run', RUN], dataRoot).code, 1);

  makeRun(dataRoot, 'run-998__2026-08-07_10-00-00__UserStory__OTHER');
  const r = run(['compare', '--run', RUN, '--run', 'run-998__2026-08-07_10-00-00__UserStory__OTHER'], dataRoot);
  assert.strictEqual(r.code, 2, 'only one of the two is instrumented');
  assert.match(r.stdout, /Trend data unavailable — requires multiple instrumented runs/);
  assert.match(r.stdout, /`—` is Unavailable, never zero/);
});

test('compare of two instrumented runs exits 0 and lines the metrics up', () => {
  const dataRoot = setup();
  const B = 'run-998__2026-08-07_10-00-00__UserStory__OTHER';
  makeRun(dataRoot, B);
  writeEvents(dataRoot, B, fixtureEvents(B));
  const r = run(['compare', '--run', RUN, '--run', B], dataRoot);
  assert.strictEqual(r.code, 0);
  assert.match(r.stdout, /Duration\s+6m 40s\s+6m 40s/);
  assert.match(r.stdout, /Human Decisions\s+2\s+2/);
});

test('nothing outside the run folder is written by any subcommand', () => {
  const dataRoot = setup();
  const snap = () => fs.readdirSync(path.join(dataRoot, 'modules'), { recursive: true }).sort();
  const before = snap();
  for (const cmd of [['summary'], ['validate'], ['metrics', '--out'], ['report', '--out'], ['dashboard', '--out']]) {
    run([...cmd, '--run', RUN], dataRoot);
  }
  assert.deepStrictEqual(snap(), before, 'the modules tree is read-only to observability');
});
