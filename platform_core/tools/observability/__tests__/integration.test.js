// End-to-end: instrument a fixture run through the real recorder, then assert the exact metrics.
//
// Nothing is stubbed. Events go through recordEvent onto a real (temporary) filesystem, come back
// through readEvents, and are aggregated by the same code path the CLI uses. If the recorder and the
// aggregator ever disagree about a field name, this is where it shows.
//
// The other half of this file is the boundary suite: observability must not change a Review
// decision, an Automation decision, a Safety decision, a pipeline route, or a test outcome. Those
// are asserted directly, because "it only observes" is a claim that decays without a test.

'use strict';

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const { recordEvent, startSpan, endSpan, readEvents } = require('../recorder');
const { aggregate, INSTRUMENTATION } = require('../aggregator');
const { renderReport } = require('../report');
const { renderDashboard } = require('../dashboard');
const { loadTestSuites, loadSafetyEvidence } = require('../sources');
const { makeDataRoot, makeRun, makeTestSuite, RUN, FIXTURE_CASES } = require('./fixtures');

const NOW = new Date('2026-08-07T12:00:00.000Z');
const at = (n) => new Date(Date.UTC(2026, 7, 7, 9, 0, 0) + n * 1000);

/** Drives a whole run through the real recorder, exactly as a Skill and the tools would. */
function instrumentRun(dataRoot) {
  const R = { runFolder: RUN, dataRoot };
  const run = startSpan({ ...R, now: at(0), type: 'RUN_STARTED', source: 'skill' });

  // Stage 3 — Test Design
  const s3 = startSpan({ ...R, now: at(10), type: 'STAGE_STARTED', source: 'skill', stage: '3', parentSpanId: run.spanId });
  const skill = startSpan({ ...R, now: at(11), type: 'SKILL_STARTED', source: 'skill', stage: '3', skill: 'test-design-skill', parentSpanId: s3.spanId });
  const tool = startSpan({ ...R, now: at(20), type: 'TOOL_STARTED', source: 'platform-tool', stage: '3', tool: 'test_suite_export', parentSpanId: skill.spanId });
  endSpan({ ...R, now: at(26), type: 'TOOL_COMPLETED', source: 'platform-tool', tool: 'test_suite_export', spanId: tool.spanId });
  recordEvent({ ...R, now: at(27), event: { type: 'VALIDATION_PASSED', source: 'platform-tool', stage: '3', kind: 'export-check' } });
  recordEvent({ ...R, now: at(30), event: { type: 'TEST_CASES_GENERATED', source: 'skill', stage: '3', count: 6, module: 'fixture' } });
  recordEvent({ ...R, now: at(35), event: { type: 'HUMAN_DECISION_REQUESTED', source: 'skill', stage: '3', decisionId: 'HD-INT-1', category: 'Review' } });
  recordEvent({ ...R, now: at(95), event: { type: 'HUMAN_DECISION_RESOLVED', source: 'skill', stage: '3', decisionId: 'HD-INT-1', status: 'Approved' } });
  endSpan({ ...R, now: at(100), type: 'SKILL_COMPLETED', source: 'skill', skill: 'test-design-skill', spanId: skill.spanId });
  endSpan({ ...R, now: at(110), type: 'STAGE_COMPLETED', source: 'skill', stage: '3', spanId: s3.spanId });

  // Stage 5A — a tool failure, a retry, a Safety preflight, three first-attempt results
  const s5 = startSpan({ ...R, now: at(120), type: 'STAGE_STARTED', source: 'skill', stage: '5A', parentSpanId: run.spanId });
  const bad = startSpan({ ...R, now: at(122), type: 'TOOL_STARTED', source: 'platform-tool', stage: '5A', tool: 'browser_provider', parentSpanId: s5.spanId });
  endSpan({ ...R, now: at(152), type: 'TOOL_FAILED', source: 'platform-tool', tool: 'browser_provider', spanId: bad.spanId, errorType: 'TIMEOUT', retryable: true });
  recordEvent({ ...R, now: at(153), event: { type: 'RETRY_OCCURRED', source: 'platform-tool', stage: '5A', tool: 'browser_provider' } });
  recordEvent({
    ...R,
    now: at(155),
    event: {
      type: 'SAFETY_PREFLIGHT_COMPLETED', source: 'skill', stage: '5A',
      metadata: {
        policyId: 'fixture-policy', policyVersion: 1, policyHash: 'sha256:int', environment: 'Staging',
        totals: { operations: 8, allowed: 5, approvalRequired: 1, forbidden: 2, preAuthorized: 1, cleanupRequired: 1 },
        cleanupCompleted: 1,
      },
    },
  });
  recordEvent({ ...R, now: at(156), event: { type: 'SAFETY_BLOCKED', source: 'skill', stage: '5A', count: 2, testCaseId: 'TC-F-006' } });
  recordEvent({ ...R, now: at(160), event: { type: 'TEST_EXECUTION_RESULT', source: 'platform-tool', stage: '5A', testCaseId: 'TC-F-001', status: 'Passed', attempt: 1, cycle: 1 } });
  recordEvent({ ...R, now: at(161), event: { type: 'TEST_EXECUTION_RESULT', source: 'platform-tool', stage: '5A', testCaseId: 'TC-F-002', status: 'Failed', attempt: 1, cycle: 1, errorType: 'Automation Failure' } });
  recordEvent({ ...R, now: at(162), event: { type: 'TEST_EXECUTION_RESULT', source: 'platform-tool', stage: '5A', testCaseId: 'TC-F-006', status: 'Skipped', attempt: 1, cycle: 1, errorType: 'Execution Safety Policy' } });
  endSpan({ ...R, now: at(200), type: 'STAGE_COMPLETED', source: 'skill', stage: '5A', spanId: s5.spanId });

  endSpan({ ...R, now: at(300), type: 'RUN_COMPLETED', source: 'skill', spanId: run.spanId });
}

function setup() {
  const dataRoot = makeDataRoot();
  makeRun(dataRoot);
  makeTestSuite(dataRoot, 'fixture', FIXTURE_CASES);
  instrumentRun(dataRoot);
  const read = readEvents({ runFolder: RUN, dataRoot });
  const { suites } = loadTestSuites({ dataRoot });
  const safety = loadSafetyEvidence({ dataRoot, runFolder: RUN, events: read.events });
  const metrics = aggregate({
    runId: RUN, runJson: { folderName: RUN, scope: 'UserStory', target: 'FIXTURE', workflow: 'user_story_run' },
    events: read.events, testSuites: suites, safety, environment: 'Staging',
  });
  return { dataRoot, read, metrics, safety };
}

test('a run instrumented end-to-end through the real recorder validates cleanly', () => {
  const { read, metrics } = setup();
  assert.strictEqual(read.ok, true);
  assert.strictEqual(read.problems.length, 0);
  assert.strictEqual(read.events.length, 22);
  assert.strictEqual(metrics.instrumentation.status, INSTRUMENTATION.FULL);
  assert.deepStrictEqual(metrics.instrumentation.unclosedSpans, []);
});

test('the exact metrics fall out of it — every number asserted, none approximate', () => {
  const { metrics: m } = setup();
  assert.strictEqual(m.run.durationMs.value, 300_000);
  assert.strictEqual(m.stages['3'].durationMs.value, 100_000);
  assert.strictEqual(m.stages['5A'].durationMs.value, 80_000);
  assert.strictEqual(m.stagesStarted.value, 2);
  assert.strictEqual(m.skills.length, 1);
  assert.strictEqual(m.skills[0].durationMs.value, 89_000);

  assert.strictEqual(m.tools.totals.calls.value, 2);
  assert.strictEqual(m.tools.totals.succeeded.value, 1);
  assert.strictEqual(m.tools.totals.failed.value, 1);
  assert.strictEqual(m.tools.totals.retries.value, 1);
  assert.strictEqual(m.tools.totals.timeouts.value, 1);

  assert.strictEqual(m.humanDecisions.requested.value, 1);
  assert.strictEqual(m.humanDecisions.entries[0].latencyMs.value, 60_000);

  assert.strictEqual(m.testDesign.totalCases.value, 6);
  assert.strictEqual(m.testDesign.review.approved.value, 4);
  assert.strictEqual(m.testDesign.automation.approved.value, 2);
  assert.strictEqual(m.testDesign.generatedThisRun.value, 6);

  assert.strictEqual(m.execution.planned.value, 3);
  assert.strictEqual(m.execution.executed.value, 2);
  assert.strictEqual(m.execution.passed.value, 1);
  assert.strictEqual(m.execution.failed.value, 1);
  assert.strictEqual(m.execution.skipped.value, 1);
  assert.strictEqual(m.execution.blockedBySafety.value, 2);

  assert.strictEqual(m.safety.operationsEvaluated.value, 8);
  assert.strictEqual(m.safety.forbidden.value, 2);
  assert.strictEqual(m.safety.cleanupCompleted.value, 1);

  assert.strictEqual(m.formulas.TC_ACCEPTANCE_RATE.value, 0.8);
  assert.strictEqual(m.formulas.FIRST_PASS_AUTOMATION_SUCCESS.value, 0.5);
  assert.strictEqual(m.formulas.TOOL_FAILURE_RATE.value, 0.5);
  assert.strictEqual(m.formulas.SAFETY_BLOCK_RATE.value, 0.25);
  assert.strictEqual(m.formulas.CLEANUP_COMPLETION_RATE.value, 1);
});

test('the report and dashboard render from those metrics without recomputing them', () => {
  const { metrics } = setup();
  const md = renderReport(metrics, { now: NOW });
  const html = renderDashboard(metrics, { now: NOW });
  assert.match(md, /\| Total duration \| 5m 00s \|/);
  assert.match(md, /\*\*Test Case Acceptance Rate:\*\* 80\.0%/);
  assert.ok(html.includes('5m 00s'));
  assert.ok(html.includes('80.0%'));
});

// ─── The boundary: observability observes, and changes nothing ────────────────────────────────

test('running observability does not change a single Review or Automation decision', () => {
  const { dataRoot } = setup();
  const file = path.join(dataRoot, 'modules', 'fixture', 'test_design', 'TestCases_fixture.md');
  const before = fs.readFileSync(file, 'utf8');

  const read = readEvents({ runFolder: RUN, dataRoot });
  const { suites } = loadTestSuites({ dataRoot });
  const m = aggregate({ runId: RUN, events: read.events, testSuites: suites });
  renderReport(m, { now: NOW });
  renderDashboard(m, { now: NOW });

  assert.strictEqual(fs.readFileSync(file, 'utf8'), before, 'the test suite artifact is byte-identical');
});

test('it does not change an Execution Safety decision — it reads the totals and stops', () => {
  const { metrics, safety } = setup();
  assert.strictEqual(metrics.safety.forbidden.value, safety.preflight.totals.forbidden);
  assert.strictEqual(metrics.safety.allowed.value, safety.preflight.totals.allowed);
  // No evaluator, no policy, no rule anywhere in the metrics object.
  const json = JSON.stringify(metrics);
  assert.ok(!/matchedRule|"decision":"(Allowed|Forbidden|Approval Required)"/.test(json),
    'observability holds no opinion about whether an operation was allowed');
});

test('it does not change a test outcome — reported statuses match the recorded events exactly', () => {
  const { read, metrics } = setup();
  const recorded = read.events.filter((e) => e.type === 'TEST_EXECUTION_RESULT')
    .map((e) => `${e.testCaseId}:${e.status}`).sort();
  const reported = metrics.execution.byTest.map((t) => `${t.testCaseId}:${t.status}`).sort();
  assert.deepStrictEqual(reported, recorded);
});

test('it writes nothing into the run beyond its own observability folder', () => {
  const { dataRoot } = setup();
  const meta = path.join(dataRoot, 'runs', RUN, 'metadata');
  assert.deepStrictEqual(fs.readdirSync(meta).sort(), ['observability', 'run.json']);
  assert.deepStrictEqual(
    fs.readdirSync(path.join(meta, 'observability')),
    ['ObservabilityEvents.jsonl'],
    'only the event stream; metrics/report/dashboard are written on demand',
  );
});

test('a stage the run never reached is absent, not zero — routing is unaffected either way', () => {
  const { metrics } = setup();
  assert.deepStrictEqual(Object.keys(metrics.stages).sort(), ['3', '5A']);
  for (const id of ['1', '2', '4A', '4M', '5H', '6A']) {
    assert.strictEqual(metrics.stages[id], undefined, `stage ${id} must have no row at all`);
  }
});

test('the whole pipeline is reproducible — recorded, read, aggregated, rendered, twice, identically', () => {
  const a = setup();
  const b = setup();
  // Event IDs hash the run + seq + content, all of which match, so even those are identical.
  assert.deepStrictEqual(
    a.read.events.map((e) => ({ ...e, timestamp: e.timestamp })),
    b.read.events.map((e) => ({ ...e, timestamp: e.timestamp })),
  );
  assert.strictEqual(JSON.stringify(a.metrics), JSON.stringify(b.metrics));
  assert.strictEqual(renderReport(a.metrics, { now: NOW }), renderReport(b.metrics, { now: NOW }));
  assert.strictEqual(renderDashboard(a.metrics, { now: NOW }), renderDashboard(b.metrics, { now: NOW }));
});

test('no secret reaches any produced artifact, even when one is pushed at the recorder', () => {
  const { dataRoot, metrics } = setup();
  recordEvent({
    runFolder: RUN, dataRoot, now: at(310),
    event: {
      type: 'TOOL_FAILED', source: 'platform-tool', tool: 'browser_driver', spanId: 'spn-leak',
      metadata: { url: 'http://192.168.1.70/login', password: 'hunter2', cookie: 'JSESSIONID=99', apiKey: 'AKIA-XYZ' },
    },
  });
  const read = readEvents({ runFolder: RUN, dataRoot });
  const m = aggregate({ runId: RUN, events: read.events });

  const surfaces = [
    fs.readFileSync(read.path, 'utf8'),
    JSON.stringify(m),
    renderReport(m, { now: NOW }),
    renderDashboard(m, { now: NOW }),
    JSON.stringify(metrics),
  ];
  for (const text of surfaces) {
    for (const secret of ['hunter2', 'JSESSIONID=99', 'AKIA-XYZ']) {
      assert.ok(!text.includes(secret), `${secret} leaked into a produced artifact`);
    }
  }
});
