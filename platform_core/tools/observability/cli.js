#!/usr/bin/env node
// Observability CLI — record events, and read what they add up to.
//
// EVERY SUBCOMMAND EXCEPT `record` IS READ-ONLY over telemetry. `metrics`, `report` and `dashboard`
// derive from the event stream and write their own derived artifacts; none of them ever edits
// ObservabilityEvents.jsonl. Telemetry is evidence, and evidence is not revised to improve a metric.
//
// Usage:
//   node platform_core/tools/observability/cli.js record --type STAGE_STARTED --stage 3 \
//        --skill test-design-skill --source skill --span-id spn-stage-000004
//   node .../cli.js summary   [--run <folder>] [--json]
//   node .../cli.js validate  [--run <folder>] [--json]
//   node .../cli.js metrics   [--run <folder>] [--out] [--json]
//   node .../cli.js report    [--run <folder>] [--out]
//   node .../cli.js dashboard [--run <folder>] [--out]
//   node .../cli.js historical [--run <folder>] [--json]
//   node .../cli.js compare --run A --run B [--json]
//
// `--run` defaults to the Active Run pointer, so a Skill mid-pipeline does not have to know or repeat
// the folder name it is already working inside.
//
// Exit codes: 0 = ok · 1 = error · 2 = under-instrumented / telemetry problems found

'use strict';

const fs = require('fs');
const path = require('path');

const { ObservabilityError, EVENT_TYPES, EVENT_SOURCES, SCHEMA_VERSION } = require('./schema');
const {
  recordEvent, readEvents, eventsPath, metricsPath, reportPath, dashboardPath, observabilityDir,
  resolveDataRoot,
} = require('./recorder');
const { aggregate, INSTRUMENTATION } = require('./aggregator');
const { renderReport } = require('./report');
const { renderDashboard } = require('./dashboard');
const { deriveHistorical } = require('./historical');
const { loadRunJson, loadTestSuites, loadSafetyEvidence, listRuns } = require('./sources');
const { isAvailable, formatDuration, formatRatio } = require('./formulas');

const EXIT = { ok: 0, error: 1, incomplete: 2 };

function parseArgs(argv) {
  const out = { _: [], runs: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith('--')) { out._.push(arg); continue; }
    const key = arg.slice(2);
    const next = argv[i + 1];
    const value = (next === undefined || next.startsWith('--')) ? true : next;
    if (value !== true) i += 1;
    if (key === 'run' && value !== true) out.runs.push(value);
    out[key] = value;
  }
  return out;
}

const USAGE = `Observability — deterministic run telemetry.

  record     --type <TYPE> --source <platform-tool|skill> [--stage N] [--skill S] [--tool T]
             [--span-id ID] [--parent-span-id ID] [--status S] [--count N] [--attempt N]
             [--decision-id ID] [--category C] [--kind K] [--artifact PATH] [--test-case-id ID]
  summary    [--run <folder>] [--json]     the run's headline metrics
  validate   [--run <folder>] [--json]     schema-check the stream; report unclosed spans
  metrics    [--run <folder>] [--out]      derive ObservabilityMetrics.json
  report     [--run <folder>] [--out]      render ObservabilityReport.md
  dashboard  [--run <folder>] [--out]      render ObservabilityDashboard.html (self-contained)
  historical [--run <folder>] [--json]     what a non-instrumented run's artifacts still prove
  compare    --run A --run B [--json]      cross-run comparison of immutable run metrics

Event types: ${EVENT_TYPES.join(', ')}

Exit codes: 0 ok · 1 error · 2 under-instrumented
`;

/** Resolves the target run: explicit `--run`, else the Active Run pointer. */
function resolveRun(args) {
  if (typeof args.run === 'string') return args.run;
  try {
    // eslint-disable-next-line global-require
    const { resolveActiveRunFolder } = require('../run_manager/activeRun');
    const folder = resolveActiveRunFolder(path.join(resolveDataRoot(), 'runs'));
    if (folder) return folder;
  } catch { /* no pointer, or run_manager unavailable */ }
  return null;
}

function requireRun(args) {
  const run = resolveRun(args);
  if (!run) {
    console.error('No run specified and no Active Run pointer is set. Pass --run <folder>.');
    return null;
  }
  return run;
}

/** Loads everything the aggregator needs, in one place so every subcommand agrees. */
function buildMetrics(runFolder, { dataRoot } = {}) {
  const root = dataRoot || resolveDataRoot();
  const read = readEvents({ runFolder, dataRoot: root });
  const { runJson } = loadRunJson({ dataRoot: root, runFolder });
  const { suites } = loadTestSuites({ dataRoot: root });
  const safety = loadSafetyEvidence({ dataRoot: root, runFolder, events: read.events });
  const metrics = aggregate({
    runId: runFolder,
    runJson,
    events: read.events,
    testSuites: suites,
    safety,
    environment: safety.preflight ? safety.preflight.environment : null,
  });
  // A stream with unreadable lines is reported, never quietly averaged over.
  metrics.integrity.problems = [...metrics.integrity.problems, ...read.problems];
  metrics.integrity.ok = metrics.integrity.problems.length === 0;
  metrics.integrity.foreignEventsRejected = read.foreign.length;
  return { metrics, read, root };
}

function cmdRecord(args) {
  const run = requireRun(args);
  if (!run) return EXIT.error;
  if (typeof args.type !== 'string') { console.error('record requires --type. See --help.'); return EXIT.error; }
  if (!EVENT_SOURCES.includes(args.source)) {
    console.error(`record requires --source (${EVENT_SOURCES.join(' | ')}). Provenance is never assumed.`);
    return EXIT.error;
  }

  const event = { type: args.type, source: args.source };
  const map = {
    stage: 'stage', skill: 'skill', tool: 'tool', 'span-id': 'spanId', 'parent-span-id': 'parentSpanId',
    status: 'status', 'decision-id': 'decisionId', category: 'category', kind: 'kind',
    'error-type': 'errorType', artifact: 'artifact', 'artifact-class': 'artifactClass',
    'test-case-id': 'testCaseId', module: 'module', note: 'note',
  };
  for (const [flag, field] of Object.entries(map)) {
    if (typeof args[flag] === 'string') event[field] = args[flag];
  }
  for (const flag of ['count', 'attempt', 'cycle']) {
    if (args[flag] !== undefined && args[flag] !== true) event[flag] = Number(args[flag]);
  }
  if (args.retryable !== undefined) event.retryable = args.retryable === true || args.retryable === 'true';
  if (typeof args.metadata === 'string') {
    try { event.metadata = JSON.parse(args.metadata); } catch (err) {
      console.error(`--metadata is not valid JSON: ${err.message}`);
      return EXIT.error;
    }
  }

  const res = recordEvent({ runFolder: run, event, now: new Date() });
  if (!res.ok) { console.error(`! ${res.warning}`); return EXIT.error; }
  if (args.json) console.log(JSON.stringify(res.event, null, 2));
  else console.log(`${res.event.eventId}  ${res.event.type}${res.event.spanId ? `  span=${res.event.spanId}` : ''}`);
  return EXIT.ok;
}

function cmdValidate(args) {
  const run = requireRun(args);
  if (!run) return EXIT.error;
  const read = readEvents({ runFolder: run, dataRoot: resolveDataRoot() });
  const { metrics } = buildMetrics(run);
  const unclosed = metrics.instrumentation.unclosedSpans;

  const report = {
    runId: run,
    path: read.path,
    exists: read.exists,
    schemaVersion: SCHEMA_VERSION,
    instrumentation: metrics.instrumentation.status,
    eventCount: read.events.length,
    lineCount: read.lineCount,
    problems: metrics.integrity.problems,
    unclosedSpans: unclosed,
    foreignEventsRejected: read.foreign.length,
    ok: metrics.integrity.problems.length === 0 && unclosed.length === 0 && read.exists,
  };

  if (args.json) { console.log(JSON.stringify(report, null, 2)); return report.ok ? EXIT.ok : EXIT.incomplete; }

  console.log(`Run:     ${run}`);
  console.log(`Stream:  ${read.path}`);
  if (!read.exists) {
    console.log('Status:  NOT INSTRUMENTED');
    console.log('\nThis run has no telemetry. No metric is invented in its place, and none is zero.');
    return EXIT.incomplete;
  }
  console.log(`Events:  ${read.events.length} valid of ${read.lineCount} line(s)`);
  console.log(`Status:  ${metrics.instrumentation.status}`);
  if (read.foreign.length) console.log(`Foreign: ${read.foreign.length} event(s) from another run — rejected, not counted.`);
  if (unclosed.length) {
    console.log(`\nUnclosed spans (${unclosed.length}) — reported Incomplete, never given a duration:`);
    for (const s of unclosed) {
      console.log(`  - ${s.spanId}  ${s.kind}${s.stage ? ` stage=${s.stage}` : ''}${s.tool ? ` tool=${s.tool}` : ''}  opened ${s.startedAt}`);
    }
  }
  if (report.problems.length) {
    console.log(`\nProblems (${report.problems.length}):`);
    for (const p of report.problems) console.log(`  - ${p}`);
  }
  if (report.ok) console.log('\nTelemetry is schema-valid and every span is closed.');
  return report.ok ? EXIT.ok : EXIT.incomplete;
}

function cmdSummary(args) {
  const run = requireRun(args);
  if (!run) return EXIT.error;
  const { metrics } = buildMetrics(run);

  if (args.json) { console.log(JSON.stringify(metrics, null, 2)); return EXIT.ok; }

  const v = (m, kind) => {
    if (!isAvailable(m)) return 'Unavailable';
    if (kind === 'duration') return formatDuration(m);
    if (kind === 'ratio') return formatRatio(m, 1);
    return String(m.value);
  };

  console.log('Observability');
  console.log('─────────────');
  console.log('');
  console.log(`Run:              ${run}`);
  console.log(`Instrumentation:  ${metrics.instrumentation.status}`);
  console.log(`Events:           ${metrics.instrumentation.eventCount} `
    + `(${metrics.instrumentation.bySource['platform-tool']} platform-tool, ${metrics.instrumentation.bySource.skill} skill)`);
  console.log(`Schema:           v${metrics.schemaVersion}`);
  console.log('');
  console.log(`Duration:         ${v(metrics.run.durationMs, 'duration')}`);
  console.log(`Stages started:   ${v(metrics.stagesStarted)}`);
  console.log(`Human decisions:  ${v(metrics.humanDecisions.requested)} requested, ${v(metrics.humanDecisions.pending)} pending`);
  console.log(`Tool calls:       ${v(metrics.tools.totals.calls)} (${v(metrics.tools.totals.failed)} failed, ${v(metrics.tools.totals.retries)} retries)`);
  const tdMark = metrics.testDesign.totalCases.provenance === 'historical-derived' ? ' [current artifact values]' : '';
  console.log(`Test cases:       ${v(metrics.testDesign.totalCases)} — Review approved ${v(metrics.testDesign.review.approved)}, Automation approved ${v(metrics.testDesign.automation.approved)}${tdMark}`);
  console.log(`Execution:        ${v(metrics.execution.passed)} passed / ${v(metrics.execution.failed)} failed / ${v(metrics.execution.blocked)} blocked`);
  console.log(`Safety blocks:    ${v(metrics.safety.blocks)}`);
  console.log(`Repair cycles:    ${v(metrics.repair.cycles)}`);
  console.log('');
  console.log(`TC acceptance:    ${v(metrics.formulas.TC_ACCEPTANCE_RATE, 'ratio')}`);
  console.log(`First-pass auto:  ${v(metrics.formulas.FIRST_PASS_AUTOMATION_SUCCESS, 'ratio')}`);
  console.log(`Tool failure:     ${v(metrics.formulas.TOOL_FAILURE_RATE, 'ratio')}`);
  console.log('');
  console.log('Token usage:      Unavailable');
  console.log('Cost:             Unavailable');
  console.log('');
  if (metrics.instrumentation.reasons.length) {
    for (const r of metrics.instrumentation.reasons) console.log(`  ! ${r}`);
    console.log('');
  }
  console.log('No metric above was estimated. `Unavailable` means unmeasured, and is not zero.');
  return metrics.instrumentation.status === INSTRUMENTATION.FULL ? EXIT.ok : EXIT.incomplete;
}

function writeOut(file, contents, args) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, contents, 'utf8');
  if (!args.json) console.log(`Written: ${file}`);
  return file;
}

function cmdMetrics(args) {
  const run = requireRun(args);
  if (!run) return EXIT.error;
  const { metrics } = buildMetrics(run);
  const json = `${JSON.stringify(metrics, null, 2)}\n`;
  if (args.out) writeOut(metricsPath(undefined, run), json, args);
  else console.log(json.trimEnd());
  return EXIT.ok;
}

function cmdReport(args) {
  const run = requireRun(args);
  if (!run) return EXIT.error;
  const { metrics } = buildMetrics(run);
  const md = renderReport(metrics, {
    now: new Date(),
    fixture: args.fixture === true,
    dashboard: args.out ? 'ObservabilityDashboard.html' : null,
  });
  if (args.out) writeOut(reportPath(undefined, run), md, args);
  else console.log(md);
  return EXIT.ok;
}

function cmdDashboard(args) {
  const run = requireRun(args);
  if (!run) return EXIT.error;
  const { metrics } = buildMetrics(run);

  // A non-instrumented run gets the historical view attached, clearly bannered — never a dashboard
  // that pretends it was instrumented.
  let historical = null;
  if (metrics.instrumentation.status === INSTRUMENTATION.NONE) {
    try { historical = deriveHistorical({ runFolder: run }); } catch { /* nothing derivable */ }
  }

  const html = renderDashboard(metrics, { now: new Date(), fixture: args.fixture === true, historical });
  if (args.out) {
    // Metrics are regenerated alongside, so the dashboard can never be newer than the data it shows.
    writeOut(metricsPath(undefined, run), `${JSON.stringify(metrics, null, 2)}\n`, args);
    const file = writeOut(dashboardPath(undefined, run), html, args);
    if (!args.json) console.log('\nSelf-contained: open it directly in a browser. No server, no network.');
    return file ? EXIT.ok : EXIT.error;
  }
  console.log(html);
  return EXIT.ok;
}

function cmdHistorical(args) {
  const run = requireRun(args);
  if (!run) return EXIT.error;
  const h = deriveHistorical({ runFolder: run });
  if (args.json) { console.log(JSON.stringify(h, null, 2)); return EXIT.ok; }
  const v = (m) => (isAvailable(m) ? String(m.value) : 'Unavailable');
  console.log(`Historical Derived Metrics — ${run}`);
  console.log('─────────────────────────────────');
  console.log('');
  console.log(h.banner);
  console.log('');
  console.log(`Duration:          ${isAvailable(h.run.durationMs) ? formatDuration(h.run.durationMs) : 'Unavailable'}`);
  console.log(`Execution cycles:  ${v(h.execution.cyclesObserved)}`);
  console.log(`Surefire tests:    ${v(h.execution.tests)} (${v(h.execution.failures)} failures, ${v(h.execution.skipped)} skipped)`);
  console.log(`Runner seconds:    ${v(h.execution.runnerSeconds)}`);
  console.log('');
  console.log('Not recoverable — no artifact records these, and none is estimated:');
  for (const k of Object.keys(h.notInstrumented)) console.log(`  - ${k}`);
  console.log('');
  for (const l of h.limitations) console.log(`  · ${l}`);
  return EXIT.ok;
}

/**
 * Cross-run comparison (§37, §38).
 *
 * Reads each run's immutable telemetry and derives fresh. There is deliberately NO stored global
 * counter: a mutable aggregate drifts from the runs it claims to summarise, and then nobody can tell
 * which of the two is wrong.
 */
function cmdCompare(args) {
  const runs = args.runs.length ? args.runs : listRuns({}).slice(0, 3);
  if (runs.length < 2) {
    console.error('compare needs at least two runs: --run A --run B');
    return EXIT.error;
  }
  const rows = runs.map((r) => {
    const { metrics } = buildMetrics(r);
    return { runId: r, metrics };
  });

  if (args.json) {
    console.log(JSON.stringify({ runs: rows.map((r) => ({ runId: r.runId, metrics: r.metrics })) }, null, 2));
    return EXIT.ok;
  }

  const cells = (m, kind) => (isAvailable(m)
    ? (kind === 'duration' ? formatDuration(m) : kind === 'ratio' ? formatRatio(m, 0) : String(m.value))
    : '—');
  const lines = [
    ['Metric', ...rows.map((r) => r.runId.slice(0, 22))],
    ['Instrumentation', ...rows.map((r) => r.metrics.instrumentation.status)],
    ['Duration', ...rows.map((r) => cells(r.metrics.run.durationMs, 'duration'))],
    ['Human Decisions', ...rows.map((r) => cells(r.metrics.humanDecisions.requested))],
    ['Tool Calls', ...rows.map((r) => cells(r.metrics.tools.totals.calls))],
    ['Retries', ...rows.map((r) => cells(r.metrics.tools.totals.retries))],
    ['TC Acceptance', ...rows.map((r) => cells(r.metrics.formulas.TC_ACCEPTANCE_RATE, 'ratio'))],
    ['First-Pass Auto', ...rows.map((r) => cells(r.metrics.formulas.FIRST_PASS_AUTOMATION_SUCCESS, 'ratio'))],
    ['Tool Failure Rate', ...rows.map((r) => cells(r.metrics.formulas.TOOL_FAILURE_RATE, 'ratio'))],
    ['Safety Blocks', ...rows.map((r) => cells(r.metrics.safety.blocks))],
    ['Repair Cycles', ...rows.map((r) => cells(r.metrics.repair.cycles))],
  ];
  const widths = lines[0].map((_, i) => Math.max(...lines.map((l) => String(l[i]).length)));
  for (const l of lines) console.log(l.map((c, i) => String(c).padEnd(widths[i])).join('  '));
  console.log('');
  console.log('`—` is Unavailable, never zero. A run marked Not Instrumented contributes no timing.');
  const instrumented = rows.filter((r) => r.metrics.instrumentation.status !== INSTRUMENTATION.NONE).length;
  if (instrumented < 2) {
    console.log('\nTrend data unavailable — requires multiple instrumented runs.');
    return EXIT.incomplete;
  }
  return EXIT.ok;
}

function main(argv) {
  const args = parseArgs(argv);
  const command = args._[0];
  if (args.help || args.h || !command) { console.log(USAGE); return command ? EXIT.ok : EXIT.error; }
  try {
    switch (command) {
      case 'record': return cmdRecord(args);
      case 'validate': return cmdValidate(args);
      case 'summary': return cmdSummary(args);
      case 'metrics': return cmdMetrics(args);
      case 'report': return cmdReport(args);
      case 'dashboard': return cmdDashboard(args);
      case 'historical': return cmdHistorical(args);
      case 'compare': return cmdCompare(args);
      default:
        console.error(`Unknown command "${command}".\n`);
        console.log(USAGE);
        return EXIT.error;
    }
  } catch (err) {
    if (err instanceof ObservabilityError) { console.error(`\n${err.message}\n`); return EXIT.error; }
    throw err;
  }
}

if (require.main === module) process.exitCode = main(process.argv.slice(2));

module.exports = { main, parseArgs, EXIT, buildMetrics, resolveRun, observabilityDir, eventsPath };
