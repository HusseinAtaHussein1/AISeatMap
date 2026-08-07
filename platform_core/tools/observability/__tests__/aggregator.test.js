// Deterministic aggregation — exact numbers from an exact event set.
//
// Every assertion here is a literal value, not a shape check. A metric that "looks about right" is
// how a telemetry system starts drifting; the whole claim of §58 is that the same evidence always
// produces the same numbers, and only exact assertions can hold that.

'use strict';

const test = require('node:test');
const assert = require('node:assert');

const { aggregate, resolveSpans, INSTRUMENTATION } = require('../aggregator');
const { isAvailable } = require('../formulas');
const { fixtureEvents, fixtureSafety, FIXTURE_CASES, RUN } = require('./fixtures');

const SUITES = [{ module: 'fixture', cases: FIXTURE_CASES }];
const RUN_JSON = { folderName: RUN, scope: 'UserStory', target: 'FIXTURE', workflow: 'user_story_run', status: 'Completed' };

function full() {
  return aggregate({
    runId: RUN, runJson: RUN_JSON, events: fixtureEvents(), testSuites: SUITES,
    safety: fixtureSafety(), environment: 'Staging',
  });
}

const v = (m) => { assert.ok(isAvailable(m), `expected a measured value, got ${JSON.stringify(m)}`); return m.value; };

test('run duration comes from the run span — 400 seconds, exactly', () => {
  const m = full();
  assert.strictEqual(v(m.run.durationMs), 400_000);
  assert.strictEqual(m.run.startedTime, '2026-08-07T09:00:00.000Z');
  assert.strictEqual(m.run.finishedTime, '2026-08-07T09:06:40.000Z');
});

test('a complete stream with every span closed is Fully Instrumented', () => {
  const m = full();
  assert.strictEqual(m.instrumentation.status, INSTRUMENTATION.FULL);
  assert.deepStrictEqual(m.instrumentation.reasons, []);
  assert.deepStrictEqual(m.instrumentation.unclosedSpans, []);
});

test('stage durations are exact, and only reached stages have a row', () => {
  const m = full();
  assert.deepStrictEqual(Object.keys(m.stages).sort(), ['3', '4A', '5A', '5H']);
  assert.strictEqual(v(m.stages['3'].durationMs), 100_000);
  assert.strictEqual(v(m.stages['4A'].durationMs), 90_000);
  assert.strictEqual(v(m.stages['5A'].durationMs), 30_000);
  assert.strictEqual(v(m.stages['5H'].durationMs), 80_000);
  assert.strictEqual(m.stages['1'], undefined, 'a stage never reached has no row at all');
  assert.strictEqual(v(m.stagesStarted), 4);
});

test('an unclosed span is Incomplete and carries NO duration — never an elapsed-time estimate', () => {
  const events = fixtureEvents().filter((e) => !(e.type === 'STAGE_COMPLETED' && e.stage === '4A'));
  const m = aggregate({ runId: RUN, runJson: RUN_JSON, events, testSuites: SUITES, safety: fixtureSafety() });

  assert.strictEqual(m.stages['4A'].status, 'Incomplete');
  assert.strictEqual(m.stages['4A'].durationMs.available, false);
  assert.strictEqual(m.stages['4A'].durationMs.value, null, 'null, not 0 — this is the whole point');
  assert.match(m.stages['4A'].durationMs.reason, /never closed/);
  assert.strictEqual(m.instrumentation.status, INSTRUMENTATION.PARTIAL);
  assert.strictEqual(m.instrumentation.unclosedSpans.length, 1);
});

test('the other stages keep their exact durations when one span is left open', () => {
  const events = fixtureEvents().filter((e) => !(e.type === 'STAGE_COMPLETED' && e.stage === '4A'));
  const m = aggregate({ runId: RUN, runJson: RUN_JSON, events, testSuites: SUITES });
  assert.strictEqual(v(m.stages['3'].durationMs), 100_000, 'one bad span does not poison the rest');
});

test('an orphan close is reported as a structural problem rather than silently dropped', () => {
  const events = [...fixtureEvents(), {
    eventId: 'evt-000099-orphan00', schemaVersion: 1, seq: 99, runId: RUN,
    timestamp: '2026-08-07T09:10:00.000Z', type: 'STAGE_COMPLETED', source: 'skill', stage: '1', spanId: 'spn-nope',
  }];
  const m = aggregate({ runId: RUN, runJson: RUN_JSON, events, testSuites: SUITES });
  assert.strictEqual(m.integrity.ok, false);
  assert.match(m.integrity.problems[0], /never opened/);
});

test('tool activity is counted exactly, failures and retries included', () => {
  const m = full();
  assert.strictEqual(v(m.tools.totals.calls), 3);
  assert.strictEqual(v(m.tools.totals.succeeded), 2);
  assert.strictEqual(v(m.tools.totals.failed), 1);
  assert.strictEqual(v(m.tools.totals.retries), 1);
  assert.strictEqual(v(m.tools.totals.timeouts), 0, 'measured as zero — none occurred');
  assert.strictEqual(m.tools.totals.timeouts.available, true, 'zero is a measurement, not a gap');
});

test('per-tool breakdown lists only tools actually observed, in stable order', () => {
  const m = full();
  assert.deepStrictEqual(m.tools.byTool.map((t) => t.tool), ['module_manager', 'test_suite_export']);
  assert.deepStrictEqual(m.tools.byTool[0], { tool: 'module_manager', calls: 2, succeeded: 1, failed: 1, incomplete: 0, retries: 1 });
});

test('platform validation is counted apart from application test outcomes', () => {
  const m = full();
  assert.strictEqual(v(m.validation.runs), 2);
  assert.strictEqual(v(m.validation.passed), 1);
  assert.strictEqual(v(m.validation.failed), 1);
  // The run also has a Failed TEST_EXECUTION_RESULT. It must not have leaked into validation.
  assert.strictEqual(v(m.execution.failed), 1);
  assert.deepStrictEqual(m.validation.byKind.map((k) => k.kind), ['compile', 'export-check']);
});

test('human decisions: two requested, one resolved, one pending, with an exact latency', () => {
  const m = full();
  assert.strictEqual(v(m.humanDecisions.requested), 2);
  assert.strictEqual(v(m.humanDecisions.resolved), 1);
  assert.strictEqual(v(m.humanDecisions.pending), 1);
  assert.deepStrictEqual(m.humanDecisions.byCategory, {
    Safety: { requested: 1, resolved: 0, pending: 1 },
    Review: { requested: 1, resolved: 1, pending: 0 },
  });

  const hd1 = m.humanDecisions.entries.find((d) => d.decisionId === 'HD-1');
  assert.strictEqual(v(hd1.latencyMs), 30_000);
  const hd2 = m.humanDecisions.entries.find((d) => d.decisionId === 'HD-2');
  assert.strictEqual(hd2.status, 'Pending');
  assert.strictEqual(hd2.latencyMs.available, false, 'an unresolved decision has no latency, not zero latency');
});

test('a decision with no declared category becomes Other — never guessed from its text', () => {
  const events = [...fixtureEvents(), {
    eventId: 'evt-000098-nocat000', schemaVersion: 1, seq: 98, runId: RUN,
    timestamp: '2026-08-07T09:09:00.000Z', type: 'HUMAN_DECISION_REQUESTED', source: 'skill',
    decisionId: 'HD-3', note: 'Should we change the automation framework and the safety policy?',
  }];
  const m = aggregate({ runId: RUN, runJson: RUN_JSON, events, testSuites: SUITES });
  const hd3 = m.humanDecisions.entries.find((d) => d.decisionId === 'HD-3');
  assert.strictEqual(hd3.category, 'Other', 'the words "automation" and "safety" in the note prove nothing');
});

test('Review and Automation are derived from the Case Index and stay independent', () => {
  const m = full();
  assert.strictEqual(v(m.testDesign.totalCases), 6);
  assert.deepStrictEqual(
    { a: v(m.testDesign.review.approved), r: v(m.testDesign.review.rejected), p: v(m.testDesign.review.pending) },
    { a: 4, r: 1, p: 1 },
  );
  assert.deepStrictEqual(
    { a: v(m.testDesign.automation.approved), r: v(m.testDesign.automation.rejected), p: v(m.testDesign.automation.pending) },
    { a: 2, r: 3, p: 1 },
  );
  assert.strictEqual(v(m.testDesign.generatedThisRun), 6, 'from telemetry; the distribution is from the artifact');
});

test('a Review-Rejected / Automation-Approved contradiction is counted, not resolved', () => {
  const cases = [...FIXTURE_CASES, { id: 'TC-F-007', title: 'Contradiction', review: 'Rejected', automation: 'Approved' }];
  const m = aggregate({ runId: RUN, runJson: RUN_JSON, events: fixtureEvents(), testSuites: [{ module: 'fixture', cases }] });
  assert.strictEqual(v(m.testDesign.contradictions), 1);
  // Observability reports it. It does not change either decision.
  assert.strictEqual(v(m.testDesign.review.rejected), 2);
  assert.strictEqual(v(m.testDesign.automation.approved), 3);
});

test('automation phases are counted separately — generated is never collapsed into passed', () => {
  const m = full();
  assert.strictEqual(v(m.automation.selected), 3);
  assert.strictEqual(v(m.automation.generated), 2);
  assert.strictEqual(v(m.automation.reused), 1);
  assert.strictEqual(v(m.automation.compileAttempts), 2);
  assert.strictEqual(v(m.automation.compilePassed), 1);
  assert.strictEqual(v(m.automation.compileFailed), 1);
  assert.strictEqual(v(m.automation.eligible), 2, 'eligibility is Automation Approved, from the artifact');
});

test('execution totals distinguish planned, executed, and dispositioned-but-not-run', () => {
  const m = full();
  assert.strictEqual(v(m.execution.planned), 5, '4 first-attempt + 1 post-repair result');
  assert.strictEqual(v(m.execution.executed), 4, 'the Skipped case was planned but never ran');
  assert.strictEqual(v(m.execution.passed), 3);
  assert.strictEqual(v(m.execution.failed), 1);
  assert.strictEqual(v(m.execution.skipped), 1);
  assert.strictEqual(v(m.execution.blocked), 0);
});

test('a Safety block is counted apart and never folded into a failure total', () => {
  const m = full();
  assert.strictEqual(v(m.execution.blockedBySafety), 2);
  assert.strictEqual(v(m.execution.failed), 1, 'the 2 safety blocks did not become failures');
});

test('first-pass success uses attempt-1 evidence only, never the post-repair outcome', () => {
  const m = full();
  assert.strictEqual(v(m.execution.firstAttempt.executed), 3, 'the Skipped case did not run');
  assert.strictEqual(v(m.execution.firstAttempt.passed), 2);
  assert.strictEqual(v(m.execution.firstAttempt.failed), 1);
  // TC-F-003 failed at attempt 1 and passed at attempt 2. Final passed = 3, first-pass passed = 2.
  assert.strictEqual(v(m.execution.passed), 3);
  assert.ok(Math.abs(m.formulas.FIRST_PASS_AUTOMATION_SUCCESS.value - 2 / 3) < 1e-9);
});

test('with no attempt-1 evidence, first-pass success is Unavailable — never back-computed', () => {
  const events = fixtureEvents().map((e) => (e.type === 'TEST_EXECUTION_RESULT' ? { ...e, attempt: 2 } : e));
  const m = aggregate({ runId: RUN, runJson: RUN_JSON, events, testSuites: SUITES });
  assert.strictEqual(m.execution.firstAttempt.executed.available, false);
  assert.strictEqual(m.formulas.FIRST_PASS_AUTOMATION_SUCCESS.available, false);
  assert.match(m.formulas.FIRST_PASS_AUTOMATION_SUCCESS.reason, /never reconstructed|first-attempt/i);
});

test('repair and rework use explicit counters, and human corrections stay unattributable', () => {
  const m = full();
  assert.strictEqual(v(m.repair.cycles), 1);
  assert.strictEqual(v(m.repair.successes), 1);
  assert.strictEqual(v(m.repair.testsRepaired), 1);
  assert.strictEqual(v(m.repair.rework.artifactsUpdatedAfterCreation), 1);
  assert.strictEqual(m.repair.rework.humanCorrections.available, false);
  assert.match(m.repair.rework.humanCorrections.reason, /git diff proves a change, not its author/);
  assert.strictEqual(m.repair.reworkScore, undefined, 'there is deliberately no reworkScore');
});

test('Safety metrics are consumed from Safety evidence, not recomputed', () => {
  const m = full();
  assert.strictEqual(v(m.safety.operationsEvaluated), 10);
  assert.strictEqual(v(m.safety.allowed), 6);
  assert.strictEqual(v(m.safety.approvalRequired), 2);
  assert.strictEqual(v(m.safety.forbidden), 2);
  assert.strictEqual(v(m.safety.preAuthorized), 1);
  assert.strictEqual(v(m.safety.cleanupRequired), 2);
  assert.strictEqual(v(m.safety.cleanupCompleted), 2);
  assert.strictEqual(m.safety.policyId, 'fixture-policy');
  assert.strictEqual(m.safety.policyHash, 'sha256:fixture');
  assert.strictEqual(m.safety.authorizations.length, 1);
});

test('a Safety authorization is reported by identity and scope, never with a secret', () => {
  const m = full();
  const a = m.safety.authorizations[0];
  assert.deepStrictEqual(Object.keys(a).sort(),
    ['action', 'approvedAt', 'approvedBy', 'authorizationId', 'module', 'ownership', 'revoked'].sort());
  assert.ok(!/password|token|secret/i.test(JSON.stringify(a)));
});

test('AI usage is unavailable, with a stated reason and a schema ready for a real source', () => {
  const m = full();
  assert.strictEqual(m.aiUsage.available, false);
  assert.strictEqual(m.aiUsage.source, null);
  assert.match(m.aiUsage.reason, /No supported run-attributable provider usage source/);
  for (const k of ['input', 'output', 'total', 'cached']) {
    assert.strictEqual(m.aiUsage.tokens[k].available, false);
    assert.strictEqual(m.aiUsage.tokens[k].value, null);
  }
  assert.strictEqual(m.aiUsage.cost.total.available, false);
  assert.strictEqual(m.aiUsage.cost.pricingSource, null, 'no pricing is ever hardcoded');
});

test('provenance is preserved: the two event sources are counted apart, never summed as one', () => {
  const m = full();
  assert.strictEqual(m.instrumentation.bySource['platform-tool'], 16);
  assert.strictEqual(m.instrumentation.bySource.skill, 25);
  assert.strictEqual(m.instrumentation.eventCount, 41);
  assert.strictEqual(m.instrumentation.bySource['platform-tool'] + m.instrumentation.bySource.skill, 41);
  assert.match(m.instrumentation.provenanceNote, /not the same reliability class/);
});

test('aggregation is deterministic — 25 runs over the same evidence produce identical metrics', () => {
  const first = JSON.stringify(full());
  for (let i = 0; i < 25; i += 1) assert.strictEqual(JSON.stringify(full()), first);
});

test('aggregation is a pure function — it does not mutate the events it is given', () => {
  const events = fixtureEvents();
  const before = JSON.stringify(events);
  aggregate({ runId: RUN, runJson: RUN_JSON, events, testSuites: SUITES, safety: fixtureSafety() });
  assert.strictEqual(JSON.stringify(events), before);
});

test('resolveSpans pairs by spanId, not by proximity or ordering', () => {
  const { spans } = resolveSpans([
    { type: 'TOOL_STARTED', spanId: 'a', timestamp: '2026-08-07T09:00:00.000Z', source: 'platform-tool', tool: 't1' },
    { type: 'TOOL_STARTED', spanId: 'b', timestamp: '2026-08-07T09:00:01.000Z', source: 'platform-tool', tool: 't2' },
    { type: 'TOOL_COMPLETED', spanId: 'b', timestamp: '2026-08-07T09:00:05.000Z' },
    { type: 'TOOL_FAILED', spanId: 'a', timestamp: '2026-08-07T09:00:09.000Z' },
  ]);
  assert.strictEqual(spans.find((s) => s.spanId === 'a').durationMs.value, 9000);
  assert.strictEqual(spans.find((s) => s.spanId === 'b').durationMs.value, 4000);
  assert.strictEqual(spans.find((s) => s.spanId === 'a').status, 'Failed');
});

test('a span that closes before it opens yields Unavailable, not a negative duration', () => {
  const { spans } = resolveSpans([
    { type: 'STAGE_STARTED', spanId: 'x', stage: '3', timestamp: '2026-08-07T09:05:00.000Z', source: 'skill' },
    { type: 'STAGE_COMPLETED', spanId: 'x', timestamp: '2026-08-07T09:00:00.000Z' },
  ]);
  assert.strictEqual(spans[0].durationMs.available, false);
  assert.match(spans[0].durationMs.reason, /clock problem, not a fast stage/);
});

test('observability changes no governance value it reads', () => {
  const cases = JSON.parse(JSON.stringify(FIXTURE_CASES));
  const before = JSON.stringify(cases);
  aggregate({ runId: RUN, runJson: RUN_JSON, events: fixtureEvents(), testSuites: [{ module: 'fixture', cases }], safety: fixtureSafety() });
  assert.strictEqual(JSON.stringify(cases), before, 'Review and Automation are read, never written');
});
