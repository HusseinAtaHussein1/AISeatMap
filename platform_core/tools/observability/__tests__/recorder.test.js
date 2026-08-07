// Writing events, reading them back, and refusing to read another run's.

'use strict';

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const {
  recordEvent, startSpan, endSpan, readEvents, eventsPath, makeEventId, makeSpanId, observabilityDir,
} = require('../recorder');
const { ObservabilityError } = require('../schema');
const { makeDataRoot, makeRun, RUN, fixtureEvents, writeEvents } = require('./fixtures');

const NOW = new Date('2026-08-07T09:00:00.000Z');

function setup() {
  const dataRoot = makeDataRoot();
  makeRun(dataRoot);
  return dataRoot;
}

test('an event is appended as one JSON line, with identity fields the caller cannot forge', () => {
  const dataRoot = setup();
  const res = recordEvent({
    runFolder: RUN, dataRoot, now: NOW,
    event: { type: 'VALIDATION_PASSED', source: 'platform-tool', kind: 'schema' },
  });

  assert.strictEqual(res.ok, true);
  assert.strictEqual(res.event.seq, 1);
  assert.strictEqual(res.event.runId, RUN);
  assert.strictEqual(res.event.timestamp, NOW.toISOString());
  assert.match(res.event.eventId, /^evt-000001-[0-9a-f]{8}$/);

  const lines = fs.readFileSync(res.path, 'utf8').split('\n').filter(Boolean);
  assert.strictEqual(lines.length, 1);
  assert.deepStrictEqual(JSON.parse(lines[0]), res.event);
});

test('appending never rewrites what came before it', () => {
  const dataRoot = setup();
  const first = recordEvent({ runFolder: RUN, dataRoot, now: NOW, event: { type: 'RETRY_OCCURRED', source: 'platform-tool' } });
  const before = fs.readFileSync(first.path, 'utf8');

  recordEvent({ runFolder: RUN, dataRoot, now: new Date('2026-08-07T09:05:00.000Z'), event: { type: 'RETRY_OCCURRED', source: 'platform-tool' } });
  const after = fs.readFileSync(first.path, 'utf8');

  assert.ok(after.startsWith(before), 'the original line must survive byte-identical');
  assert.strictEqual(after.split('\n').filter(Boolean).length, 2);
  assert.strictEqual(JSON.parse(after.split('\n')[1]).seq, 2);
});

test('event IDs are unique within a run even when two events share a millisecond', () => {
  const dataRoot = setup();
  const ids = new Set();
  for (let i = 0; i < 25; i += 1) {
    const r = recordEvent({ runFolder: RUN, dataRoot, now: NOW, event: { type: 'RETRY_OCCURRED', source: 'platform-tool' } });
    ids.add(r.event.eventId);
  }
  assert.strictEqual(ids.size, 25, 'timestamp alone would have collided 25 times');
});

test('event IDs are deterministic — the same inputs always produce the same ID', () => {
  const a = makeEventId('run-x', 4, { type: 'RETRY_OCCURRED', source: 'skill' });
  const b = makeEventId('run-x', 4, { source: 'skill', type: 'RETRY_OCCURRED' });
  assert.strictEqual(a, b, 'key order must not change the ID');
  assert.notStrictEqual(a, makeEventId('run-y', 4, { type: 'RETRY_OCCURRED', source: 'skill' }));
  assert.notStrictEqual(a, makeEventId('run-x', 5, { type: 'RETRY_OCCURRED', source: 'skill' }));
  assert.strictEqual(makeSpanId('stage', 7), 'spn-stage-000007');
});

test('a span round-trips: startSpan returns the ID endSpan needs', () => {
  const dataRoot = setup();
  const open = startSpan({ runFolder: RUN, dataRoot, now: NOW, type: 'STAGE_STARTED', source: 'skill', stage: '3' });
  assert.match(open.spanId, /^spn-stage-\d{6}$/);

  const close = endSpan({
    runFolder: RUN, dataRoot, now: new Date('2026-08-07T09:02:00.000Z'),
    type: 'STAGE_COMPLETED', source: 'skill', stage: '3', spanId: open.spanId,
  });
  assert.strictEqual(close.ok, true);
  assert.strictEqual(close.event.spanId, open.spanId);
});

test('startSpan refuses a type that does not open a span, and endSpan one that does not close', () => {
  const dataRoot = setup();
  assert.throws(() => startSpan({ runFolder: RUN, dataRoot, now: NOW, type: 'RETRY_OCCURRED', source: 'skill' }), ObservabilityError);
  assert.throws(() => endSpan({ runFolder: RUN, dataRoot, now: NOW, type: 'STAGE_STARTED', source: 'skill', spanId: 'x' }), ObservabilityError);
  assert.throws(() => endSpan({ runFolder: RUN, dataRoot, now: NOW, type: 'STAGE_COMPLETED', source: 'skill' }), ObservabilityError);
});

test('an invalid event is refused outright — malformed evidence is worse than none', () => {
  const dataRoot = setup();
  assert.throws(
    () => recordEvent({ runFolder: RUN, dataRoot, now: NOW, event: { type: 'NOT_A_TYPE', source: 'skill' } }),
    ObservabilityError,
  );
  assert.strictEqual(fs.existsSync(eventsPath(dataRoot, RUN)), false, 'nothing was written');
});

test('recordEvent requires an explicit clock, matching createRun and recordStage', () => {
  const dataRoot = setup();
  assert.throws(() => recordEvent({ runFolder: RUN, dataRoot, event: { type: 'RETRY_OCCURRED', source: 'skill' } }), ObservabilityError);
  assert.throws(() => recordEvent({ dataRoot, now: NOW, event: { type: 'RETRY_OCCURRED', source: 'skill' } }), ObservabilityError);
});

test('a secret handed to the recorder is redacted before it reaches disk, and the redaction is visible', () => {
  const dataRoot = setup();
  const res = recordEvent({
    runFolder: RUN, dataRoot, now: NOW,
    event: {
      type: 'TOOL_FAILED', source: 'platform-tool', tool: 'browser_provider', spanId: 's1',
      metadata: { user: 'qa.super.admin', password: 'hunter2', headers: { authorization: 'Bearer tok_live_9911' } },
    },
  });

  const raw = fs.readFileSync(res.path, 'utf8');
  assert.ok(!raw.includes('hunter2'));
  assert.ok(!raw.includes('tok_live_9911'));
  assert.ok(raw.includes('qa.super.admin'), 'an identity is allowed where necessary; a secret is not');
  assert.deepStrictEqual(res.event.redactedKeys.sort(), ['headers.authorization', 'password']);
});

test('a write failure surfaces a warning and does not throw — telemetry never breaks the QA run', () => {
  const dataRoot = setup();
  // Occupy the events path with a DIRECTORY, so appendFileSync cannot write there.
  fs.mkdirSync(eventsPath(dataRoot, RUN), { recursive: true });
  const res = recordEvent({ runFolder: RUN, dataRoot, now: NOW, event: { type: 'RETRY_OCCURRED', source: 'platform-tool' } });

  assert.strictEqual(res.ok, false);
  assert.match(res.warning, /run continues/);
  assert.ok(res.event, 'the event is still returned, so a caller can log it elsewhere');
});

test('reading a run with no stream is not an error — it means "nothing recorded"', () => {
  const dataRoot = setup();
  const read = readEvents({ runFolder: RUN, dataRoot });
  assert.deepStrictEqual(
    { ok: read.ok, exists: read.exists, events: read.events, problems: read.problems },
    { ok: true, exists: false, events: [], problems: [] },
  );
});

test('events are returned ordered by seq, not by the order lines happened to land', () => {
  const dataRoot = setup();
  const events = fixtureEvents();
  writeEvents(dataRoot, RUN, [...events].reverse());
  const read = readEvents({ runFolder: RUN, dataRoot });
  assert.deepStrictEqual(read.events.map((e) => e.seq), events.map((e) => e.seq));
});

test('a corrupt line is reported by line number, and does not take the stream with it', () => {
  const dataRoot = setup();
  const file = writeEvents(dataRoot, RUN, fixtureEvents().slice(0, 3));
  fs.appendFileSync(file, '{ this is not json\n');

  const read = readEvents({ runFolder: RUN, dataRoot });
  assert.strictEqual(read.ok, false);
  assert.strictEqual(read.events.length, 3);
  assert.ok(read.problems[0].includes('Line 4'));
});

test('run A telemetry copied into run B authorizes nothing there — every event carries its own runId', () => {
  const dataRoot = setup();
  const OTHER = 'run-998__2026-08-07_10-00-00__UserStory__OTHER';
  makeRun(dataRoot, OTHER);

  // Write run A's stream, then copy the file verbatim into run B's folder.
  const aFile = writeEvents(dataRoot, RUN, fixtureEvents(RUN));
  fs.mkdirSync(observabilityDir(dataRoot, OTHER), { recursive: true });
  fs.copyFileSync(aFile, eventsPath(dataRoot, OTHER));

  const read = readEvents({ runFolder: OTHER, dataRoot });
  assert.strictEqual(read.events.length, 0, 'not one copied event is counted');
  assert.ok(read.foreign.length > 0);
  assert.ok(read.problems[0].includes('never crosses runs'));
});

test('telemetry is written inside the run folder and nowhere else', () => {
  const dataRoot = setup();
  recordEvent({ runFolder: RUN, dataRoot, now: NOW, event: { type: 'RUN_STARTED', source: 'skill', spanId: 's1' } });

  const written = eventsPath(dataRoot, RUN);
  assert.ok(written.includes(path.join('runs', RUN, 'metadata', 'observability')));
  // The modules tree — where durable project artifacts live — is untouched.
  assert.deepStrictEqual(fs.readdirSync(path.join(dataRoot, 'modules')), []);
});
