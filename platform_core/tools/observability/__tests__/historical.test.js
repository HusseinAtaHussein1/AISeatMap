// Historical Derived Metrics — what a run that predates instrumentation can still prove, and what
// it must never be made to claim.

'use strict';

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const { deriveHistorical, readSurefire } = require('../historical');
const { aggregate, INSTRUMENTATION } = require('../aggregator');
const { readEvents } = require('../recorder');
const { makeDataRoot, makeRun, RUN } = require('./fixtures');

const OLD = 'run-003__2026-08-04_11-24-38__UserStory__FIXTURE-HISTORICAL';

function surefireXml(name, { tests, failures, errors, skipped, time }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<testsuite name="${name}" time="${time}" tests="${tests}" errors="${errors}" skipped="${skipped}" failures="${failures}">
  <properties><property name="java.specification.version" value="23"/></properties>
</testsuite>`;
}

function legacyRun(dataRoot, over = {}) {
  const dir = makeRun(dataRoot, OLD, {
    startedTime: '2026-08-04T08:24:38.821Z', status: 'Preparing', target: 'FIXTURE-HISTORICAL', ...over,
  });
  const exec = path.join(dir, 'execution');
  fs.mkdirSync(path.join(exec, 'artifacts', 'exec-a', 'surefire'), { recursive: true });
  fs.mkdirSync(path.join(exec, 'artifacts_rerun4', 'surefire'), { recursive: true });
  for (const f of ['ExecutionResults.md', 'ExecutionResults.rerun-1.md', 'ExecutionResults.rerun-2.md']) {
    fs.writeFileSync(path.join(exec, f), '# fixture\n');
  }
  fs.writeFileSync(path.join(exec, 'artifacts', 'exec-a', 'surefire', 'TEST-Fixture.xml'),
    surefireXml('Fixture', { tests: 13, failures: 1, errors: 0, skipped: 2, time: 21.355 }));
  fs.writeFileSync(path.join(exec, 'artifacts_rerun4', 'surefire', 'TEST-Fixture2.xml'),
    surefireXml('Fixture2', { tests: 4, failures: 0, errors: 1, skipped: 0, time: 8.5 }));
  return dir;
}

test('a run with no telemetry is Not Instrumented, and reports that rather than zeroes', () => {
  const dataRoot = makeDataRoot();
  legacyRun(dataRoot);
  const read = readEvents({ runFolder: OLD, dataRoot });
  assert.strictEqual(read.exists, false);

  const m = aggregate({ runId: OLD, runJson: { folderName: OLD, startedTime: '2026-08-04T08:24:38.821Z' } });
  assert.strictEqual(m.instrumentation.status, INSTRUMENTATION.NONE);
  assert.strictEqual(m.stagesStarted.value, null);
  assert.strictEqual(m.tools.totals.calls.value, null);
  assert.strictEqual(m.humanDecisions.requested.value, null);
});

test('historical derivation is labelled as such and carries a banner', () => {
  const dataRoot = makeDataRoot();
  legacyRun(dataRoot);
  const h = deriveHistorical({ dataRoot, runFolder: OLD });
  assert.strictEqual(h.status, INSTRUMENTATION.HISTORICAL);
  assert.match(h.banner, /predates observability instrumentation/);
  assert.match(h.banner, /Only metrics provable from existing immutable artifacts/);
});

test('Surefire totals are summed across every report file — real numbers, from the runner itself', () => {
  const dataRoot = makeDataRoot();
  legacyRun(dataRoot);
  const h = deriveHistorical({ dataRoot, runFolder: OLD });
  assert.strictEqual(h.execution.tests.value, 17);
  assert.strictEqual(h.execution.failures.value, 1);
  assert.strictEqual(h.execution.errors.value, 1);
  assert.strictEqual(h.execution.skipped.value, 2);
  assert.ok(Math.abs(h.execution.runnerSeconds.value - 29.855) < 1e-9);
  assert.strictEqual(h.execution.tests.provenance, 'historical-derived');
});

test('execution cycles are read from the filenames, which are structural evidence', () => {
  const dataRoot = makeDataRoot();
  legacyRun(dataRoot);
  const h = deriveHistorical({ dataRoot, runFolder: OLD });
  assert.strictEqual(h.execution.cyclesObserved.value, 3);
  assert.deepStrictEqual(h.execution.cycleFiles,
    ['ExecutionResults.md', 'ExecutionResults.rerun-1.md', 'ExecutionResults.rerun-2.md']);
});

test('a run that never reached execution reports no cycles, and does not call that zero', () => {
  const dataRoot = makeDataRoot();
  makeRun(dataRoot, OLD);
  const h = deriveHistorical({ dataRoot, runFolder: OLD });
  assert.strictEqual(h.execution.cyclesObserved.available, false);
  assert.match(h.execution.cyclesObserved.reason, /never reached Stage 5A/);
  assert.strictEqual(h.execution.tests.available, false);
});

test('duration is derived only when the run actually recorded an end', () => {
  const dataRoot = makeDataRoot();
  legacyRun(dataRoot);
  // run-003's real state: started, never marked finished.
  let h = deriveHistorical({ dataRoot, runFolder: OLD });
  assert.strictEqual(h.run.durationMs.available, false);
  assert.match(h.run.durationMs.reason, /grow the number every time this is read/);

  const dataRoot2 = makeDataRoot();
  legacyRun(dataRoot2, { finishedTime: '2026-08-04T10:24:38.821Z' });
  h = deriveHistorical({ dataRoot: dataRoot2, runFolder: OLD });
  assert.strictEqual(h.run.durationMs.value, 7_200_000);
});

test('stage timings, tool calls, retries and human decisions are never fabricated', () => {
  const dataRoot = makeDataRoot();
  legacyRun(dataRoot);
  const h = deriveHistorical({ dataRoot, runFolder: OLD });
  for (const key of ['stageDurations', 'skillDurations', 'toolCalls', 'toolFailures', 'retries', 'validationRuns', 'humanDecisions']) {
    assert.strictEqual(h.notInstrumented[key].available, false, `${key} must not be derived`);
    assert.strictEqual(h.notInstrumented[key].value, null);
  }
  const json = JSON.stringify(h);
  assert.ok(!/STAGE_STARTED|TOOL_CALLED|TOKEN_USAGE|"events"/.test(json), 'no event was invented');
});

test('first-pass success is refused for a historical run, with the reason stated', () => {
  const dataRoot = makeDataRoot();
  legacyRun(dataRoot);
  const h = deriveHistorical({ dataRoot, runFolder: OLD });
  assert.strictEqual(h.notInstrumented.firstPassAutomationSuccess.available, false);
  assert.match(h.notInstrumented.firstPassAutomationSuccess.reason, /passed first time.*passed eventually/);
});

test('Test Design decisions are deliberately excluded — they are current values, not run evidence', () => {
  const dataRoot = makeDataRoot();
  legacyRun(dataRoot);
  const h = deriveHistorical({ dataRoot, runFolder: OLD });
  assert.strictEqual(h.testDesign, undefined);
  assert.ok(h.limitations.some((l) => l.includes('CURRENT values are not')));
});

test('historical output is returned separately and is never merged into instrumented metrics', () => {
  const dataRoot = makeDataRoot();
  legacyRun(dataRoot);
  const h = deriveHistorical({ dataRoot, runFolder: OLD });
  const m = aggregate({ runId: OLD, runJson: { folderName: OLD } });
  assert.strictEqual(m.historical, undefined, 'aggregate() never absorbs it');
  assert.strictEqual(h.status, INSTRUMENTATION.HISTORICAL);
  assert.strictEqual(m.instrumentation.status, INSTRUMENTATION.NONE);
});

test('deriveHistorical writes nothing — the run folder is untouched evidence', () => {
  const dataRoot = makeDataRoot();
  const dir = legacyRun(dataRoot);
  const snapshot = (d) => fs.readdirSync(d, { recursive: true, withFileTypes: true })
    .map((e) => path.join(e.parentPath || e.path, e.name)).sort();
  const before = snapshot(dir);
  deriveHistorical({ dataRoot, runFolder: OLD });
  assert.deepStrictEqual(snapshot(dir), before);
});

test('readSurefire ignores non-Surefire XML and unreadable files rather than guessing', () => {
  const dataRoot = makeDataRoot();
  const dir = legacyRun(dataRoot);
  const exec = path.join(dir, 'execution');
  fs.writeFileSync(path.join(exec, 'artifacts', 'environment.xml'), '<environment><a>1</a></environment>');
  fs.writeFileSync(path.join(exec, 'artifacts', 'TEST-broken.xml'), 'not xml at all');
  const suites = readSurefire(exec);
  assert.strictEqual(suites.length, 2, 'only the two real testsuite roots');
  assert.deepStrictEqual(suites.map((s) => s.name).sort(), ['Fixture', 'Fixture2']);
});

test('deriveHistorical needs a run folder and says so', () => {
  assert.throws(() => deriveHistorical({}), /requires a `runFolder`/);
});

test('a missing run.json degrades to Unavailable rather than throwing', () => {
  const dataRoot = makeDataRoot();
  const h = deriveHistorical({ dataRoot, runFolder: 'run-000__does-not-exist' });
  assert.strictEqual(h.runJsonFound, false);
  assert.strictEqual(h.run.durationMs.available, false);
  assert.strictEqual(h.status, INSTRUMENTATION.HISTORICAL);
});
