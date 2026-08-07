// Observability — what a run that predates instrumentation can honestly still prove.
//
// HD-OBS-003 MADE OBSERVABILITY PROSPECTIVE. run-001, run-002 and run-003 were never instrumented,
// and no event is fabricated for them. But "not instrumented" is not the same as "nothing is known":
// those runs left immutable artifacts behind, and some of those artifacts contain hard facts —
// Surefire recorded how many tests ran and how long they took, `run.json` recorded when the run
// started, the execution folder's rerun files record how many cycles there were.
//
// THIS FILE READS THOSE FACTS AND NOTHING ELSE.
//
// What it will NEVER produce, because no artifact records it:
//   stage durations · skill timings · tool calls · retries · validation runs · human decisions
// Those are `Not Instrumented`. Filling them with zeroes would make a six-day run look like a run
// with no activity, which is §75's exact prohibition.
//
// The output is returned under its own key and is never merged into `metrics`. A reader must always
// be able to tell a measured number from a reconstructed one (HD-OBS-003: "do not mix
// historical-derived metrics with fully instrumented run metrics in a way that implies equal
// measurement coverage").

'use strict';

const fs = require('fs');
const path = require('path');

const { measured, unavailable } = require('./formulas');
const { INSTRUMENTATION } = require('./aggregator');
const { resolveDataRoot } = require('./recorder');
const { loadRunJson } = require('./sources');

const NOT_RECORDED = 'Not recorded by any artifact this run produced. This run predates observability '
  + 'instrumentation (HD-OBS-003) and no value is estimated in its place.';

/**
 * Reads Surefire's own XML — the external runner's official report format, and the only
 * machine-readable execution evidence a historical run has.
 *
 * Attribute extraction is regex-based rather than XML-parsed because the platform carries no XML
 * dependency and the four attributes needed sit on the single `<testsuite>` root element. Anything
 * deeper would justify a parser; this does not.
 */
function readSurefire(dir) {
  const files = [];
  const walk = (d, depth) => {
    if (depth > 6) return;
    let entries = [];
    try { entries = fs.readdirSync(d, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p, depth + 1);
      else if (/^TEST-.*\.xml$/.test(e.name)) files.push(p);
    }
  };
  walk(dir, 0);

  const suites = [];
  for (const file of files.sort()) {
    let head;
    try {
      head = fs.readFileSync(file, 'utf8').slice(0, 4000);
    } catch { continue; }
    const m = head.match(/<testsuite\b[^>]*>/);
    if (!m) continue;
    const attr = (name) => {
      const a = m[0].match(new RegExp(`${name}="([^"]*)"`));
      return a ? a[1] : null;
    };
    const num = (name) => {
      const v = attr(name);
      const n = v === null ? NaN : Number(v);
      return Number.isFinite(n) ? n : null;
    };
    suites.push({
      file: path.relative(dir, file).replace(/\\/g, '/'),
      name: attr('name'),
      tests: num('tests'),
      failures: num('failures'),
      errors: num('errors'),
      skipped: num('skipped'),
      timeSeconds: num('time'),
    });
  }
  return suites;
}

/**
 * Derives what a non-instrumented run's artifacts genuinely prove.
 *
 * @param {{dataRoot?: string, runFolder: string}} opts
 * @returns {object} always carries `status: 'Historical Derived'` and an explicit limitations list
 */
function deriveHistorical({ dataRoot, runFolder } = {}) {
  if (!runFolder) throw new Error('deriveHistorical requires a `runFolder`.');
  const root = dataRoot || resolveDataRoot();
  const runDir = path.join(root, 'runs', runFolder);
  const { runJson, exists } = loadRunJson({ dataRoot: root, runFolder });

  // ---- Timing, only if the run actually recorded an end -------------------------------------
  const started = runJson.startedTime || null;
  const finished = runJson.finishedTime || null;
  let durationMs;
  if (started && finished) {
    const a = Date.parse(started); const b = Date.parse(finished);
    durationMs = (Number.isFinite(a) && Number.isFinite(b) && b >= a)
      ? measured(b - a, 'historical-derived')
      : unavailable('run.json timestamps do not form a valid interval.');
  } else if (started) {
    durationMs = unavailable(
      'run.json records a start but no `finishedTime`. The run was never marked complete, so its '
      + 'duration is unknown — measuring to "now" would grow the number every time this is read.',
    );
  } else {
    durationMs = unavailable('run.json records no start time.');
  }

  // ---- Execution cycles, structurally visible in the filenames -------------------------------
  const execDir = path.join(runDir, 'execution');
  let cycleFiles = [];
  try {
    cycleFiles = fs.readdirSync(execDir).filter((f) => /^ExecutionResults(\.rerun-\d+)?\.md$/.test(f)).sort();
  } catch { /* no execution folder — this run never reached Stage 5A */ }

  const surefire = readSurefire(execDir);
  const sum = (key) => {
    const vals = surefire.map((s) => s[key]).filter((v) => Number.isFinite(v));
    return vals.length ? vals.reduce((a, b) => a + b, 0) : null;
  };
  const tests = sum('tests');
  const failures = sum('failures');
  const errors = sum('errors');
  const skipped = sum('skipped');
  const seconds = sum('timeSeconds');

  const s = (v, reason) => (v === null ? unavailable(reason) : measured(v, 'historical-derived'));

  return {
    status: INSTRUMENTATION.HISTORICAL,
    runId: runFolder,
    runJsonFound: exists,
    banner: 'Historical Derived Metrics — this run predates observability instrumentation. '
      + 'Only metrics provable from existing immutable artifacts are shown.',

    run: {
      folderName: runJson.folderName || runFolder,
      scope: runJson.scope || null,
      target: runJson.target || null,
      workflow: runJson.workflow || null,
      status: runJson.status || null,
      startedTime: started,
      finishedTime: finished,
      durationMs,
    },

    execution: {
      // Every number below is Surefire's own, summed across its report files. None is inferred from
      // the Markdown narrative beside them.
      source: surefire.length
        ? `Maven Surefire XML (${surefire.length} report file${surefire.length === 1 ? '' : 's'})`
        : null,
      cyclesObserved: cycleFiles.length
        ? measured(cycleFiles.length, 'historical-derived')
        : unavailable('This run has no ExecutionResults artifact; it never reached Stage 5A.'),
      cycleFiles,
      tests: s(tests, 'No Surefire report was found for this run.'),
      failures: s(failures, 'No Surefire report was found for this run.'),
      errors: s(errors, 'No Surefire report was found for this run.'),
      skipped: s(skipped, 'No Surefire report was found for this run.'),
      runnerSeconds: s(seconds, 'No Surefire report was found for this run.'),
      suites: surefire,
    },

    // The whole point of the section: saying plainly what cannot be recovered.
    notInstrumented: {
      stageDurations: unavailable(NOT_RECORDED),
      skillDurations: unavailable(NOT_RECORDED),
      toolCalls: unavailable(NOT_RECORDED),
      toolFailures: unavailable(NOT_RECORDED),
      retries: unavailable(NOT_RECORDED),
      validationRuns: unavailable(NOT_RECORDED),
      humanDecisions: unavailable(NOT_RECORDED),
      firstPassAutomationSuccess: unavailable(
        'First-attempt evidence was never recorded as such. Reading it back from the final state '
        + 'after five rerun cycles cannot distinguish "passed first time" from "passed eventually" (§27).',
      ),
      aiUsage: unavailable('No supported provider usage source exists (HD-OBS-002).'),
    },

    limitations: [
      'These are facts read from immutable run artifacts. They are NOT telemetry, and they are not '
        + 'presented alongside instrumented metrics as though the coverage were equal.',
      'Test Design decisions (Review / Automation) are deliberately excluded here: they live on the '
        + 'module\'s test suite, which later runs continue to edit, so their CURRENT values are not '
        + 'evidence of what they were when this run executed.',
      'Surefire totals cover the tests the external runner actually reported. A cycle whose artifacts '
        + 'were not retained contributes nothing and is not estimated.',
      'No event was fabricated for this run (HD-OBS-003).',
    ],
  };
}

module.exports = { deriveHistorical, readSurefire, NOT_RECORDED };
