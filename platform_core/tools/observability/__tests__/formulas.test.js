// The Formula Registry — every published ratio, and every boundary case §76 names.

'use strict';

const test = require('node:test');
const assert = require('node:assert');

const {
  measured, unavailable, isAvailable, ratio, formatRatio, formatDuration, formatCount,
  FORMULAS, computeFormulas,
} = require('../formulas');
const { aggregate } = require('../aggregator');
const { fixtureEvents, fixtureSafety, FIXTURE_CASES, RUN } = require('./fixtures');

const SUITES = [{ module: 'fixture', cases: FIXTURE_CASES }];
const base = (over = {}) => aggregate({
  runId: RUN, events: fixtureEvents(), testSuites: SUITES, safety: fixtureSafety(), ...over,
});

test('every registered formula declares an id, a name, an expression, and notes', () => {
  assert.ok(FORMULAS.length >= 10);
  for (const f of FORMULAS) {
    assert.ok(f.id && f.name && f.expression && f.notes, `${f.id} is under-documented`);
    assert.strictEqual(typeof f.compute, 'function');
  }
  assert.strictEqual(new Set(FORMULAS.map((f) => f.id)).size, FORMULAS.length, 'ids are unique');
});

test('every formula in the registry has a value in the computed output — no hidden formulas', () => {
  const m = base();
  for (const f of FORMULAS) {
    assert.ok(m.formulas[f.id], `${f.id} was registered but never computed`);
    assert.strictEqual(m.formulas[f.id].expression, f.expression, 'the published expression is the computed one');
  }
  // And nothing appears in the output that is not in the registry.
  assert.deepStrictEqual(Object.keys(m.formulas).sort(), FORMULAS.map((f) => f.id).sort());
});

test('a zero denominator is Unavailable, never 0% — the boundary case that matters most', () => {
  const r = ratio(0, 0);
  assert.strictEqual(r.available, false);
  assert.strictEqual(r.value, null);
  assert.match(r.reason, /not the same as a ratio of zero/);
});

test('an ordinary ratio is measured and marked derived', () => {
  const r = ratio(3, 4);
  assert.deepStrictEqual(r, { value: 0.75, available: true, provenance: 'derived' });
});

test('unavailable() refuses to exist without a reason', () => {
  assert.throws(() => unavailable(), /requires a reason/);
  assert.throws(() => unavailable(''), /requires a reason/);
});

test('TC acceptance excludes Pending from the denominator', () => {
  const m = base();
  // 4 Approved, 1 Rejected, 1 Pending  ->  4/5, not 4/6.
  assert.ok(Math.abs(m.formulas.TC_ACCEPTANCE_RATE.value - 0.8) < 1e-9);
});

test('all-Pending test cases give no acceptance rate at all', () => {
  const cases = FIXTURE_CASES.map((c) => ({ ...c, review: 'Pending', automation: 'Pending' }));
  const m = base({ testSuites: [{ module: 'fixture', cases }] });
  assert.strictEqual(m.formulas.TC_ACCEPTANCE_RATE.available, false);
  assert.match(m.formulas.TC_ACCEPTANCE_RATE.reason, /neither way|either way/i);
});

test('all-rejected test cases give an acceptance rate of exactly 0 — measured, not unavailable', () => {
  const cases = FIXTURE_CASES.map((c) => ({ ...c, review: 'Rejected' }));
  const m = base({ testSuites: [{ module: 'fixture', cases }] });
  assert.strictEqual(m.formulas.TC_ACCEPTANCE_RATE.available, true);
  assert.strictEqual(m.formulas.TC_ACCEPTANCE_RATE.value, 0);
  assert.strictEqual(formatRatio(m.formulas.TC_ACCEPTANCE_RATE), '0%');
});

test('all-approved gives exactly 1', () => {
  const cases = FIXTURE_CASES.map((c) => ({ ...c, review: 'Approved' }));
  const m = base({ testSuites: [{ module: 'fixture', cases }] });
  assert.strictEqual(m.formulas.TC_ACCEPTANCE_RATE.value, 1);
});

test('no test suite at all means Unavailable, not 0%', () => {
  const m = base({ testSuites: [] });
  assert.strictEqual(m.formulas.TC_ACCEPTANCE_RATE.available, false);
  assert.strictEqual(m.testDesign.totalCases.available, false);
});

test('tool failure rate counts closed calls only', () => {
  const m = base();
  // 2 succeeded + 1 failed = 3 closed; 1/3.
  assert.ok(Math.abs(m.formulas.TOOL_FAILURE_RATE.value - 1 / 3) < 1e-9);
});

test('no tool call means no failure rate — and no automatic 0%', () => {
  const events = fixtureEvents().filter((e) => !e.type.startsWith('TOOL_'));
  const m = base({ events });
  assert.strictEqual(m.formulas.TOOL_FAILURE_RATE.available, false);
  assert.strictEqual(m.tools.totals.calls.value, 0, 'the COUNT is a measured zero...');
  assert.strictEqual(m.tools.totals.calls.available, true, '...even though the RATE is unavailable');
});

test('execution pass rate excludes Skipped and Blocked from both sides', () => {
  const m = base();
  // 3 passed, 1 failed, 1 skipped -> 3/4, not 3/5.
  assert.strictEqual(m.formulas.EXECUTION_PASS_RATE.value, 0.75);
});

test('no execution at all means no pass rate', () => {
  const events = fixtureEvents().filter((e) => e.type !== 'TEST_EXECUTION_RESULT');
  const m = base({ events });
  assert.strictEqual(m.formulas.EXECUTION_PASS_RATE.available, false);
});

test('retry rate may exceed 1 and is not clamped', () => {
  const extra = [2, 3, 4, 5].map((i) => ({
    eventId: `evt-00009${i}-retry000`, schemaVersion: 1, seq: 90 + i, runId: RUN,
    timestamp: '2026-08-07T09:08:00.000Z', type: 'RETRY_OCCURRED', source: 'platform-tool', tool: 'module_manager',
  }));
  const m = base({ events: [...fixtureEvents(), ...extra] });
  assert.strictEqual(m.tools.totals.retries.value, 5);
  assert.ok(m.formulas.RETRY_RATE.value > 1, '5 retries across 3 calls is a real signal, not an error');
});

test('cleanup completion is 1 when every required cleanup was done', () => {
  const m = base();
  assert.strictEqual(m.formulas.CLEANUP_COMPLETION_RATE.value, 1);
});

test('no cleanup required means no completion rate — not 0%, and not a failure', () => {
  const safety = fixtureSafety();
  safety.preflight.totals.cleanupRequired = 0;
  safety.cleanupCompleted = 0;
  const m = base({ safety });
  assert.strictEqual(m.formulas.CLEANUP_COMPLETION_RATE.available, false);
});

test('no Safety evidence leaves every Safety formula Unavailable', () => {
  const m = base({ safety: null, events: fixtureEvents().filter((e) => e.type !== 'SAFETY_PREFLIGHT_COMPLETED') });
  assert.strictEqual(m.formulas.SAFETY_BLOCK_RATE.available, false);
  assert.strictEqual(m.formulas.CLEANUP_COMPLETION_RATE.available, false);
  assert.strictEqual(m.safety.forbidden.available, false);
});

test('safety block rate is a fact — 2 forbidden of 10 evaluated', () => {
  const m = base();
  assert.strictEqual(m.formulas.SAFETY_BLOCK_RATE.value, 0.2);
});

test('human decisions per stage is reported without a good/bad reading', () => {
  const m = base();
  assert.strictEqual(m.formulas.HUMAN_DECISIONS_PER_STAGE.value, 0.5, '2 decisions across 4 stages');
  assert.match(m.humanDecisions.interpretation, /not a quality score/);
  const f = FORMULAS.find((x) => x.id === 'HUMAN_DECISIONS_PER_STAGE');
  assert.match(f.notes, /More decisions is not worse/);
});

test('repair success rate is 1 when the single cycle succeeded, Unavailable when none ran', () => {
  assert.strictEqual(base().formulas.REPAIR_SUCCESS_RATE.value, 1);
  const events = fixtureEvents().filter((e) => !e.type.startsWith('REPAIR_'));
  assert.strictEqual(base({ events }).formulas.REPAIR_SUCCESS_RATE.available, false);
});

test('validation failure rate is separate from application failures', () => {
  const m = base();
  assert.strictEqual(m.formulas.VALIDATION_FAILURE_RATE.value, 0.5, '1 failed of 2 platform validations');
  const f = FORMULAS.find((x) => x.id === 'VALIDATION_FAILURE_RATE');
  assert.match(f.notes, /Application test failures are not validation failures/);
});

test('a formula that throws degrades to Unavailable rather than taking the run down', () => {
  const out = computeFormulas({ testDesign: null, tools: null, execution: null });
  for (const f of FORMULAS) {
    assert.strictEqual(out[f.id].available, false);
    assert.ok(out[f.id].reason);
  }
});

test('no formula is named or described as an accuracy, quality, or productivity score', () => {
  for (const f of FORMULAS) {
    assert.ok(!/AI Accuracy|Quality Score|Productivity|Intelligence Score/i.test(`${f.id} ${f.name}`),
      `${f.id} reads as a vanity metric`);
  }
  const acceptance = FORMULAS.find((f) => f.id === 'TC_ACCEPTANCE_RATE');
  assert.match(acceptance.notes, /never be labelled "AI Accuracy"/);
});

test('formatters keep 0 and Unavailable visibly apart', () => {
  assert.strictEqual(formatCount(measured(0)), '0');
  assert.strictEqual(formatCount(unavailable('no source')), 'Unavailable');
  assert.strictEqual(formatRatio(measured(0, 'derived')), '0%');
  assert.strictEqual(formatRatio(unavailable('no source')), 'Unavailable');
  assert.strictEqual(formatDuration(measured(0)), '0s');
  assert.strictEqual(formatDuration(unavailable('never closed')), 'Unavailable');
});

test('durations format at second, minute, and hour scale', () => {
  assert.strictEqual(formatDuration(measured(45_000)), '45s');
  assert.strictEqual(formatDuration(measured(400_000)), '6m 40s');
  assert.strictEqual(formatDuration(measured(3_930_000)), '1h 05m 30s');
});

test('isAvailable is false for null, undefined, and an unavailable measure', () => {
  assert.strictEqual(isAvailable(null), false);
  assert.strictEqual(isAvailable(undefined), false);
  assert.strictEqual(isAvailable(unavailable('x')), false);
  assert.strictEqual(isAvailable(measured(0)), true);
});
