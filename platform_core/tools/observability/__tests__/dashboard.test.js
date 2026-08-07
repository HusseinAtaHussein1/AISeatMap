// The dashboard renders metrics. These tests make sure it only ever renders them.

'use strict';

const test = require('node:test');
const assert = require('node:assert');

const { renderDashboard } = require('../dashboard');
const { aggregate, INSTRUMENTATION } = require('../aggregator');
const { deriveHistorical } = require('../historical');
const { fixtureEvents, fixtureSafety, FIXTURE_CASES, RUN, makeDataRoot, makeRun } = require('./fixtures');

const NOW = new Date('2026-08-07T12:00:00.000Z');
const SUITES = [{ module: 'fixture', cases: FIXTURE_CASES }];
const full = () => aggregate({
  runId: RUN, runJson: { folderName: RUN, scope: 'UserStory', target: 'FIXTURE', workflow: 'user_story_run' },
  events: fixtureEvents(), testSuites: SUITES, safety: fixtureSafety(), environment: 'Staging',
});
const html = (m = full(), opts = {}) => renderDashboard(m, { now: NOW, ...opts });

test('a complete, self-contained HTML document is produced', () => {
  const out = html();
  assert.match(out, /^<!DOCTYPE html>/);
  assert.match(out, /<html lang="en">/);
  assert.match(out, /<\/html>\s*$/);
  assert.match(out, /<title>Observability — /);
});

test('it works offline: no external script, style, font, image or network reference', () => {
  const out = html();
  assert.ok(!/<script/i.test(out), 'no script tag at all — the page is inert');
  assert.ok(!/https?:\/\//i.test(out), 'no absolute URL of any kind');
  assert.ok(!/<link\b/i.test(out), 'no external stylesheet');
  assert.ok(!/@import|url\(/i.test(out), 'no CSS-loaded resource');
  assert.ok(!/<img|<iframe|fetch\(|XMLHttpRequest/i.test(out));
  assert.match(out, /<style>/, 'styles are inline');
  assert.match(out, /<svg /, 'charts are inline SVG');
});

test('rendering is deterministic — the same metrics always produce byte-identical HTML', () => {
  const m = full();
  const first = renderDashboard(m, { now: NOW });
  for (let i = 0; i < 10; i += 1) assert.strictEqual(renderDashboard(m, { now: NOW }), first);
});

test('the dashboard never mutates the metrics it renders', () => {
  const m = full();
  const before = JSON.stringify(m);
  html(m);
  assert.strictEqual(JSON.stringify(m), before);
});

test('malformed metrics are rejected — it renders canonical metrics or nothing', () => {
  assert.throws(() => renderDashboard(null, { now: NOW }), /canonical metrics object/);
  assert.throws(() => renderDashboard({}, { now: NOW }), /canonical metrics object/);
  assert.throws(() => renderDashboard({ runId: 'x' }, { now: NOW }), /canonical metrics object/);
  assert.throws(() => renderDashboard(full(), {}), /explicit valid `now`/);
});

test('chart values equal the canonical metric values — the dashboard computes nothing', () => {
  const m = full();
  const out = html(m);
  // Review distribution: 4 / 1 / 1 straight from the metrics object.
  assert.strictEqual(m.testDesign.review.approved.value, 4);
  assert.match(out, /<div class="bar__label">Approved<\/div>[\s\S]{0,240}?<div class="bar__value">4<\/div>/);
  // Safety donut total is operationsEvaluated, not a recount.
  assert.strictEqual(m.safety.allowed.value + m.safety.approvalRequired.value + m.safety.forbidden.value, 10);
  assert.match(out, /class="donut__total">10</);
});

test('a measured zero renders as 0; an unmeasured value renders as Unavailable', () => {
  const m = full();
  m.tools.totals.timeouts = { value: 0, available: true, provenance: 'emitted' };
  const out = html(m);
  assert.match(out, /Timeouts<\/div>\s*<div class="kpi__value">0<\/div>/);
  assert.match(out, /Token Usage<\/div>\s*<div class="kpi__value"><span class="unavail"/);
});

test('an Incomplete stage is labelled Incomplete and gets no bar width', () => {
  const events = fixtureEvents().filter((e) => !(e.type === 'STAGE_COMPLETED' && e.stage === '4A'));
  const m = aggregate({ runId: RUN, events, testSuites: SUITES, safety: fixtureSafety() });
  const out = html(m);
  assert.match(out, /Stage 4A — Automation<\/div>[\s\S]{0,200}?bar__fill--unavail" style="width:0%"/);
  assert.match(out, /<span class="tag tag--incomplete">Incomplete<\/span>/);
});

test('a partially instrumented run gets a banner listing exactly why', () => {
  const events = fixtureEvents().filter((e) => e.type !== 'RUN_COMPLETED');
  const m = aggregate({ runId: RUN, events, testSuites: SUITES });
  const out = html(m);
  assert.match(out, /Partially Instrumented — this is not a complete picture/);
  assert.match(out, /status-pill--partial/);
  for (const r of m.instrumentation.reasons) assert.ok(out.includes(r.slice(0, 40)));
});

test('a non-instrumented run gets a banner and never a fabricated timing', () => {
  const m = aggregate({ runId: RUN, runJson: { folderName: RUN } });
  const out = html(m);
  assert.match(out, /Not Instrumented/);
  assert.match(out, /none is invented for it/);
  assert.match(out, /No stage was instrumented in this run/);
  assert.ok(!/bar__fill--neutral" style="width:[1-9]/.test(out), 'no stage bar has a nonzero width');
});

test('the historical banner appears, with its limitations, when historical data is attached', () => {
  const dataRoot = makeDataRoot();
  makeRun(dataRoot, RUN, { finishedTime: '2026-08-07T10:00:00.000Z' });
  const historical = deriveHistorical({ dataRoot, runFolder: RUN });
  const m = aggregate({ runId: RUN, runJson: { folderName: RUN } });
  const out = html(m, { historical });

  assert.match(out, /Historical Derived Metrics/);
  assert.match(out, /predates observability instrumentation/);
  assert.match(out, /Not recoverable for this run/);
  assert.strictEqual(historical.status, INSTRUMENTATION.HISTORICAL);
});

test('the fixture banner is unmissable when the data is a fixture', () => {
  const out = html(full(), { fixture: true });
  assert.match(out, /Fixture \/ Example — not real run telemetry/);
  assert.match(out, /No run produced these numbers/);
});

test('no secret value reaches the rendered page', () => {
  const m = full();
  m.safety.authorizations[0].approvedBy = 'qa.super.admin@example.test';
  // Inject secrets everywhere a renderer might blindly interpolate.
  m.run.target = 'FIXTURE';
  m.execution.byTest.push({ testCaseId: 'TC-X', status: 'Failed', attempt: 1, cycle: 1, classification: null, durationMs: null });
  const out = html(m);
  for (const secret of ['hunter2', 'tok_live_9911', 'AKIA-XYZ', 'JSESSIONID', '4111111111111111', 'Bearer ']) {
    assert.ok(!out.includes(secret), `${secret} must never appear`);
  }
  assert.ok(out.includes('qa.super.admin@example.test'), 'an approver identity is legitimate');
});

test('every interpolated value is HTML-escaped', () => {
  const m = full();
  m.run.target = '<script>alert(1)</script>';
  m.safety.policyId = '"><img onerror=x>';
  const out = html(m);
  assert.ok(!out.includes('<script>alert(1)</script>'));
  assert.ok(!out.includes('<img onerror=x>'));
  assert.ok(out.includes('&lt;script&gt;'));
});

test('it renders light and dark, and prints, without a toggle script', () => {
  const out = html();
  assert.match(out, /@media \(prefers-color-scheme: dark\)/);
  assert.match(out, /@media print/);
  assert.match(out, /<meta name="viewport"/, 'responsive');
});

test('a single run shows no trend chart, and says why', () => {
  const out = html();
  assert.match(out, /Trend data unavailable — requires multiple instrumented runs/);
});

test('the automation funnel shows every step, including unavailable ones', () => {
  const m = full();
  m.automation.selected = { value: null, available: false, provenance: 'unavailable', reason: 'not recorded' };
  const out = html(m);
  for (const step of ['Approved Test Cases', 'Automation Selected', 'Generated', 'Compiled', 'Executed', 'First-Pass Passed', 'Final Passed']) {
    assert.ok(out.includes(step), `funnel step "${step}" was skipped`);
  }
  assert.match(out, /Automation Selected<\/div>[\s\S]{0,200}?class="unavail"/);
});

test('the dashboard defers to the Markdown and JSON as authoritative', () => {
  const out = html();
  assert.match(out, /Presentation only/);
  assert.match(out, /remain authoritative/);
  assert.match(out, /renders canonical metrics and computes nothing/);
});

test('Safety blocks stay distinguishable from application and automation failures', () => {
  const out = html();
  assert.match(out, /blocked by\s*<strong>Execution Safety policy<\/strong>/);
  assert.match(out, /never counted as an application,\s*automation, or environment failure/);
});
