// Observability — writing events, and finding them again.
//
// APPEND-ONLY, ONE EVENT PER LINE (§10, §13)
// JSONL was chosen over a single JSON document because this platform already treats run evidence as
// immutable and append-only: the Run Manifest's Checkpoint History is appended to, never rewritten,
// and SafetyAuthorizations appends rather than replaces. Appending a line cannot corrupt or silently
// alter what came before it. Rewriting a JSON array can, and does so invisibly.
//
// TELEMETRY MUST NOT BREAK THE THING IT OBSERVES (§57)
// `recordEvent` returns a result object; it does not throw on a write failure. A run whose disk is
// full should lose a metric, not lose a test result. It DOES throw on an invalid event, because
// writing malformed evidence is worse than writing none — the aggregator would then have to guess.
//
// CROSS-RUN ISOLATION, DEFENDED TWICE (§74)
//   1. The stream lives inside the run folder, so run B cannot read run A's file.
//   2. Every event carries its own `runId`, re-checked on load, so a COPIED file contributes nothing.
// This is the same two-layer defence the Safety authorization store uses, for the same reason: file
// placement alone is defeated by `cp`.

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const {
  SCHEMA_VERSION, ObservabilityError, EVENT_FIELDS, SPAN_OPENERS, SPAN_CLOSERS,
  assertValidEvent, redactSecrets,
} = require('./schema');

const OBSERVABILITY_DIRNAME = 'observability';
const EVENTS_FILENAME = 'ObservabilityEvents.jsonl';
const METRICS_FILENAME = 'ObservabilityMetrics.json';
const REPORT_FILENAME = 'ObservabilityReport.md';
const DASHBOARD_FILENAME = 'ObservabilityDashboard.html';

function resolveDataRoot(startDir) {
  // eslint-disable-next-line global-require
  const paths = require('../platform_paths/paths');
  return paths.resolveRoots({ startDir: startDir || process.cwd(), fresh: true }).dataRoot;
}

/**
 * The run's observability folder.
 *
 * A SUBFOLDER, unlike Execution Safety's two flat files in `metadata/`. Four related artifacts
 * (events, metrics, report, dashboard) that are always produced and consumed together are a family;
 * scattering them among `run.json`, `RunManifest.md` and the Safety records would make `metadata/`
 * the place where everything lands rather than the place where run state lives.
 */
function observabilityDir(dataRoot, runFolder) {
  return path.join(dataRoot || resolveDataRoot(), 'runs', runFolder, 'metadata', OBSERVABILITY_DIRNAME);
}

const eventsPath = (dataRoot, runFolder) => path.join(observabilityDir(dataRoot, runFolder), EVENTS_FILENAME);
const metricsPath = (dataRoot, runFolder) => path.join(observabilityDir(dataRoot, runFolder), METRICS_FILENAME);
const reportPath = (dataRoot, runFolder) => path.join(observabilityDir(dataRoot, runFolder), REPORT_FILENAME);
const dashboardPath = (dataRoot, runFolder) => path.join(observabilityDir(dataRoot, runFolder), DASHBOARD_FILENAME);

function stableStringify(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  return `{${Object.keys(value).sort().map((k) => `${JSON.stringify(k)}:${stableStringify(value[k])}`).join(',')}}`;
}

/**
 * A stable, unique event ID.
 *
 * §11 forbids relying on timestamp uniqueness alone — two tool calls inside the same millisecond are
 * ordinary. The sequence number guarantees uniqueness within a run; the content hash makes the ID
 * change if the event's substance changes, so an ID cannot be silently reused for different content.
 * Both inputs are supplied by the caller, so the same inputs always produce the same ID and the
 * whole pipeline stays testable without mocking a clock.
 */
function makeEventId(runId, seq, payload) {
  const digest = crypto.createHash('sha256')
    .update(stableStringify({ runId, seq, ...payload })).digest('hex').slice(0, 8);
  return `evt-${String(seq).padStart(6, '0')}-${digest}`;
}

/** A deterministic span ID, derived from the opening event's position rather than from randomness. */
function makeSpanId(kind, seq) {
  return `spn-${kind}-${String(seq).padStart(6, '0')}`;
}

/** How many events the stream already holds — the next event's `seq` is this + 1. */
function nextSeq(file) {
  try {
    const text = fs.readFileSync(file, 'utf8');
    return text.split('\n').filter((l) => l.trim()).length + 1;
  } catch {
    return 1;
  }
}

/**
 * Records one event.
 *
 * @param {object} opts
 * @param {string} opts.runFolder          the run this belongs to; also its `runId`
 * @param {string} [opts.dataRoot]
 * @param {object} opts.event              type, source, and whichever schema fields apply
 * @param {Date}   opts.now                explicit; never defaulted, matching createRun/recordStage
 * @returns {{ok: boolean, event: object|null, path: string, warning: string|null}}
 */
function recordEvent({ runFolder, dataRoot, event, now } = {}) {
  if (!runFolder) throw new ObservabilityError('recordEvent requires a `runFolder`.');
  if (!(now instanceof Date) || Number.isNaN(now.getTime())) {
    throw new ObservabilityError('recordEvent requires an explicit valid `now` Date.');
  }
  if (!event || typeof event !== 'object') throw new ObservabilityError('recordEvent requires an `event`.');

  const file = eventsPath(dataRoot, runFolder);
  const seq = nextSeq(file);

  // Whitelist first: a field the schema does not know is dropped here rather than rejected, so an
  // over-eager caller loses a field instead of losing the event.
  const clean = {};
  for (const key of EVENT_FIELDS) {
    if (event[key] !== undefined && !['eventId', 'schemaVersion', 'seq', 'timestamp', 'runId', 'redactedKeys'].includes(key)) {
      clean[key] = event[key];
    }
  }

  let redactedKeys = [];
  if (clean.metadata !== undefined) {
    const r = redactSecrets(clean.metadata);
    clean.metadata = r.value;
    redactedKeys = r.redactedKeys;
  }

  const record = {
    eventId: makeEventId(runFolder, seq, clean),
    schemaVersion: SCHEMA_VERSION,
    seq,
    timestamp: now.toISOString(),
    runId: runFolder,
    ...clean,
  };
  if (redactedKeys.length) record.redactedKeys = redactedKeys;

  // Invalid events are refused outright. Everything downstream assumes schema-valid evidence, and a
  // malformed line would force the aggregator to either guess or refuse the whole run.
  assertValidEvent(record);

  try {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.appendFileSync(file, `${JSON.stringify(record)}\n`, 'utf8');
  } catch (err) {
    // §57: surface, do not throw. The QA operation continues; the metric is the only casualty.
    return {
      ok: false,
      event: record,
      path: file,
      warning: `Observability write failed (${err.message}). The run continues; this event is lost `
        + 'and the stream will be reported as under-instrumented.',
    };
  }
  return { ok: true, event: record, path: file, warning: null };
}

/**
 * Opens a span and returns its ID for the matching `endSpan`.
 * @returns {{ok: boolean, spanId: string, event: object|null, warning: string|null}}
 */
function startSpan({ runFolder, dataRoot, type, now, ...rest } = {}) {
  if (!SPAN_OPENERS.includes(type)) {
    throw new ObservabilityError(`${type} does not open a span. Openers: ${SPAN_OPENERS.join(', ')}.`);
  }
  const seq = nextSeq(eventsPath(dataRoot, runFolder));
  const spanId = rest.spanId || makeSpanId(type.replace(/_STARTED$/, '').toLowerCase(), seq);
  const res = recordEvent({ runFolder, dataRoot, now, event: { ...rest, type, spanId } });
  return { ...res, spanId };
}

/** Closes a span opened by `startSpan`. The aggregator computes the duration; nothing computes it here. */
function endSpan({ runFolder, dataRoot, type, spanId, now, ...rest } = {}) {
  if (!SPAN_CLOSERS.includes(type)) {
    throw new ObservabilityError(`${type} does not close a span. Closers: ${SPAN_CLOSERS.join(', ')}.`);
  }
  if (!spanId) throw new ObservabilityError('endSpan requires the `spanId` returned by startSpan.');
  return recordEvent({ runFolder, dataRoot, now, event: { ...rest, type, spanId } });
}

/**
 * Reads a run's event stream.
 *
 * Returns problems rather than throwing, so `validate` can report a whole malformed stream. Callers
 * that need trustworthy metrics check `ok` and refuse — they never aggregate a partial read, because
 * metrics computed from half a stream look exactly like metrics computed from a quiet run.
 *
 * @returns {{ok, exists, path, events, foreign, problems, lineCount}}
 */
function readEvents({ runFolder, dataRoot, file } = {}) {
  const target = file || eventsPath(dataRoot, runFolder);
  if (!fs.existsSync(target)) {
    return { ok: true, exists: false, path: target, events: [], foreign: [], problems: [], lineCount: 0 };
  }

  const lines = fs.readFileSync(target, 'utf8').split('\n');
  const events = [];
  const foreign = [];
  const problems = [];
  let lineCount = 0;

  lines.forEach((line, i) => {
    if (!line.trim()) return;
    lineCount += 1;
    let parsed;
    try {
      parsed = JSON.parse(line);
    } catch (err) {
      problems.push(`Line ${i + 1}: not valid JSON (${err.message}).`);
      return;
    }
    // The copied-file defence. An event stamped with another run's ID is not this run's evidence,
    // whatever folder it is sitting in.
    if (runFolder && String(parsed.runId) !== String(runFolder)) {
      foreign.push(parsed);
      problems.push(
        `Line ${i + 1}: runId "${parsed.runId}" does not match the run folder it sits in `
        + `("${runFolder}"). Not counted — telemetry never crosses runs (§74).`,
      );
      return;
    }
    const { valid, problems: eventProblems } = require('./schema').validateEvent(parsed);
    if (!valid) {
      problems.push(...eventProblems.map((p) => `Line ${i + 1}: ${p}`));
      return;
    }
    events.push(parsed);
  });

  // Order by the recorded sequence, not by file order — a stream is trustworthy about what happened,
  // and `seq` is what makes that ordering explicit rather than an artefact of how lines were flushed.
  events.sort((a, b) => a.seq - b.seq);

  return { ok: problems.length === 0, exists: true, path: target, events, foreign, problems, lineCount };
}

module.exports = {
  OBSERVABILITY_DIRNAME,
  EVENTS_FILENAME,
  METRICS_FILENAME,
  REPORT_FILENAME,
  DASHBOARD_FILENAME,
  resolveDataRoot,
  observabilityDir,
  eventsPath,
  metricsPath,
  reportPath,
  dashboardPath,
  stableStringify,
  makeEventId,
  makeSpanId,
  nextSeq,
  recordEvent,
  startSpan,
  endSpan,
  readEvents,
};
