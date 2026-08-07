// `0` vs `Unavailable` — the distinction the whole model is built to preserve (§60, §73, §75).
//
// A run that reports zeroes is asserting nothing happened. A run that reports Unavailable is
// admitting it does not know. These tests exist because the two collapse into each other by
// accident — `count || 0` is all it takes — and once collapsed, the platform is quietly lying.

'use strict';

const test = require('node:test');
const assert = require('node:assert');

const { aggregate, INSTRUMENTATION, NOT_INSTRUMENTED_REASON } = require('../aggregator');
const { renderReport } = require('../report');
const { renderDashboard } = require('../dashboard');
const { fixtureEvents, fixtureSafety, FIXTURE_CASES, RUN } = require('./fixtures');

const NOW = new Date('2026-08-07T12:00:00.000Z');
const SUITES = [{ module: 'fixture', cases: FIXTURE_CASES }];

/** A run that was never instrumented: no events at all. */
const bare = () => aggregate({ runId: RUN, runJson: { folderName: RUN, startedTime: '2026-08-04T08:24:38.821Z', status: 'Preparing' } });

/** A run that WAS instrumented and genuinely had none of the thing being counted. */
const quiet = () => aggregate({
  runId: RUN,
  events: [
    { eventId: 'e1', schemaVersion: 1, seq: 1, runId: RUN, timestamp: '2026-08-07T09:00:00.000Z', type: 'RUN_STARTED', source: 'skill', spanId: 'r1' },
    { eventId: 'e2', schemaVersion: 1, seq: 2, runId: RUN, timestamp: '2026-08-07T09:10:00.000Z', type: 'RUN_COMPLETED', source: 'skill', spanId: 'r1' },
  ],
  testSuites: SUITES,
});

test('a non-instrumented run reports Not Instrumented, not a wall of zeroes', () => {
  const m = bare();
  assert.strictEqual(m.instrumentation.status, INSTRUMENTATION.NONE);
  for (const metric of [
    m.stagesStarted, m.tools.totals.calls, m.tools.totals.failed, m.tools.totals.retries,
    m.validation.runs, m.humanDecisions.requested, m.execution.executed, m.repair.cycles,
  ]) {
    assert.strictEqual(metric.available, false);
    assert.strictEqual(metric.value, null, 'null, never 0');
    assert.strictEqual(metric.reason, NOT_INSTRUMENTED_REASON);
  }
});

test('an instrumented but quiet run reports measured zeroes — the opposite claim', () => {
  const m = quiet();
  for (const metric of [
    m.stagesStarted, m.tools.totals.calls, m.tools.totals.failed, m.tools.totals.retries,
    m.validation.runs, m.humanDecisions.requested, m.execution.executed, m.repair.cycles,
  ]) {
    assert.strictEqual(metric.available, true);
    assert.strictEqual(metric.value, 0, 'measured, and nothing happened');
  }
  assert.strictEqual(m.instrumentation.status, INSTRUMENTATION.FULL);
});

test('the two runs are distinguishable in the JSON a consumer reads', () => {
  assert.notStrictEqual(
    JSON.stringify(bare().tools.totals.calls),
    JSON.stringify(quiet().tools.totals.calls),
  );
  assert.deepStrictEqual(quiet().tools.totals.calls, { value: 0, available: true, provenance: 'emitted' });
});

test('repair cycles: 0 and Unavailable survive into the Markdown report as different text', () => {
  const zero = renderReport(quiet(), { now: NOW });
  const gone = renderReport(bare(), { now: NOW });
  assert.match(zero, /\| Repair cycles \| 0 \|/);
  assert.match(gone, /\| Repair cycles \| \*\*Unavailable\*\* \|/);
});

test('and into the HTML dashboard as different markup', () => {
  const zero = renderDashboard(quiet(), { now: NOW });
  const gone = renderDashboard(bare(), { now: NOW });
  assert.ok(zero.includes('>0<'), 'a measured zero renders as the digit');
  assert.ok(!zero.includes('Repair Cycles</div>\n      <div class="kpi__value"><span class="unavail"'));
  assert.ok(gone.includes('class="unavail"'), 'an unmeasured value renders as Unavailable');
  assert.ok(gone.includes('Unavailable'));
});

test('token and cost are Unavailable on every run, instrumented or not', () => {
  for (const m of [bare(), quiet()]) {
    assert.strictEqual(m.aiUsage.available, false);
    assert.strictEqual(m.aiUsage.tokens.total.value, null);
    assert.strictEqual(m.aiUsage.cost.total.value, null);
    assert.ok(m.aiUsage.reason.length > 40, 'the reason is stated, not implied');
  }
});

test('AI usage is never rendered as 0 tokens or $0.00', () => {
  const md = renderReport(quiet(), { now: NOW });
  const html = renderDashboard(quiet(), { now: NOW });
  assert.match(md, /\| Token telemetry \| \*\*Unavailable\*\* \|/);
  assert.match(md, /\| Cost telemetry \| \*\*Unavailable\*\* \|/);
  assert.ok(!/0 tokens|\$0\.00|~\d+K tokens/.test(md));
  assert.ok(!/0 tokens|\$0\.00/.test(html));
});

test('human corrections are Unavailable even on a fully instrumented run', () => {
  const m = aggregate({ runId: RUN, events: fixtureEvents(), testSuites: SUITES, safety: fixtureSafety() });
  assert.strictEqual(m.repair.rework.humanCorrections.available, false);
  assert.match(m.repair.rework.humanCorrections.reason, /not its author/);
});

test('an in-progress run has an elapsed time, not a duration — and says so', () => {
  const events = fixtureEvents().filter((e) => e.type !== 'RUN_COMPLETED');
  const m = aggregate({ runId: RUN, events, testSuites: SUITES });
  assert.strictEqual(m.run.durationMs.available, false);
  assert.strictEqual(m.run.finishedTime, null);
  assert.strictEqual(m.instrumentation.status, INSTRUMENTATION.PARTIAL);
});

test('every unavailable metric carries a reason — an unexplained gap is not a measurement', () => {
  const walk = (node, path = '') => {
    if (!node || typeof node !== 'object') return;
    if (Object.prototype.hasOwnProperty.call(node, 'available')) {
      if (node.available === false) {
        assert.ok(node.reason && node.reason.length > 10, `${path} is unavailable with no usable reason`);
      }
      return;
    }
    for (const [k, val] of Object.entries(node)) walk(val, path ? `${path}.${k}` : k);
  };
  walk(bare());
  walk(quiet());
  walk(aggregate({ runId: RUN, events: fixtureEvents(), testSuites: SUITES, safety: fixtureSafety() }));
});

test('the report lists every unavailable metric with its reason, and says so when there are none', () => {
  const md = renderReport(bare(), { now: NOW });
  assert.match(md, /## 13\. Unavailable Metrics/);
  assert.match(md, /Why it could not be measured/);
  assert.ok(md.split('\n').filter((l) => l.startsWith('| `')).length > 8, 'the gaps are itemised, not summarised');
});

test('a non-instrumented run labels test-design totals as current artifact values, not run evidence', () => {
  // run-003's real shape: no telemetry, but the module Case Index still exists and is still edited
  // by later runs. Reporting today's totals as though that run measured them is the mixing
  // HD-OBS-003 forbids, so the provenance says otherwise.
  const m = aggregate({ runId: RUN, runJson: { folderName: RUN }, testSuites: SUITES });
  assert.strictEqual(m.instrumentation.status, INSTRUMENTATION.NONE);
  assert.strictEqual(m.testDesign.totalCases.provenance, 'historical-derived');
  assert.match(m.testDesign.provenanceNote, /CURRENT values, read now/);
  assert.match(renderReport(m, { now: NOW }), /CURRENT values, read now/);
});

test('an instrumented run labels the same totals as derived, not historical', () => {
  const m = aggregate({ runId: RUN, events: fixtureEvents(), testSuites: SUITES });
  assert.strictEqual(m.instrumentation.status, INSTRUMENTATION.FULL);
  assert.strictEqual(m.testDesign.totalCases.provenance, 'derived');
  assert.match(m.testDesign.provenanceNote, /canonical record/);
});
