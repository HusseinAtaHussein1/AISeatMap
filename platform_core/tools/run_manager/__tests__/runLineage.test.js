const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const {
  LINEAGE_FILENAME,
  LineageError,
  inspectInheritable,
  planRefinement,
  writeLineage,
  readLineage,
  resolvePriorRunFolder,
  lineageChain,
} = require('../runLineage');

const NOW = new Date('2026-07-27T21:00:00Z');

function makeRunsDir() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lineage-'));
  const runsDir = path.join(root, 'runs');
  fs.mkdirSync(runsDir, { recursive: true });
  return runsDir;
}

function makeRun(runsDir, folderName, { stages = {}, meta } = {}) {
  const dir = path.join(runsDir, folderName);
  fs.mkdirSync(path.join(dir, 'metadata'), { recursive: true });
  for (const [stage, files] of Object.entries(stages)) {
    fs.mkdirSync(path.join(dir, stage), { recursive: true });
    for (const [name, content] of Object.entries(files)) {
      fs.writeFileSync(path.join(dir, stage, name), content);
    }
  }
  if (meta) fs.writeFileSync(path.join(dir, 'metadata', 'run.json'), JSON.stringify(meta, null, 2));
  return dir;
}

function cleanup(runsDir) {
  fs.rmSync(path.dirname(runsDir), { recursive: true, force: true });
}

const APPROVED_CTX = '# Project Context\n\n| Field | Value |\n|---|---|\n| Status | Approved |\n';
const PENDING_CTX = '# Project Context\n\n| Field | Value |\n|---|---|\n| Status | Pending Review |\n';

test('inspectInheritable lists the stages a prior run actually reached, with approval state', () => {
  const runsDir = makeRunsDir();
  makeRun(runsDir, 'run-002__2026-01-14_09-00-00__Targeted__Leave', {
    stages: {
      context: { 'ProjectContext.md': APPROVED_CTX },
      discovery: { 'QA_Assessment_Report.md': PENDING_CTX },
    },
  });

  const found = inspectInheritable(runsDir, 'run-002__2026-01-14_09-00-00__Targeted__Leave');

  assert.deepEqual(found.map((f) => f.stage), ['context', 'discovery'], 'pipeline order, reached only');
  assert.equal(found[0].approved, true);
  assert.equal(found[1].approved, false, 'a Pending artifact is listed, not hidden');
  cleanup(runsDir);
});

test('planRefinement derives a NEW run folder and never touches the prior run', () => {
  const runsDir = makeRunsDir();
  const priorDir = makeRun(runsDir, 'run-002__2026-01-14_09-00-00__Targeted__Leave', {
    stages: { context: { 'ProjectContext.md': APPROVED_CTX } },
  });
  const before = fs.readFileSync(path.join(priorDir, 'context', 'ProjectContext.md'), 'utf8');

  const plan = planRefinement(runsDir, 'run-002__2026-01-14_09-00-00__Targeted__Leave', { now: NOW });

  assert.equal(plan.priorRunFolder, 'run-002__2026-01-14_09-00-00__Targeted__Leave');
  assert.notEqual(plan.newRunFolder, plan.priorRunFolder, 'refinement is a new run, not an edit');
  assert.match(plan.newRunFolder, /^run-003__/, 'run index advances past the highest present');
  assert.equal(
    fs.readFileSync(path.join(priorDir, 'context', 'ProjectContext.md'), 'utf8'), before,
    'prior run artifacts are untouched'
  );
  cleanup(runsDir);
});

test('planRefinement inherits the prior run scope/target unless re-scoped', () => {
  const runsDir = makeRunsDir();
  makeRun(runsDir, 'run-002__2026-01-14_09-00-00__Targeted__Leave');

  const inherited = planRefinement(runsDir, 'run-002__2026-01-14_09-00-00__Targeted__Leave', { now: NOW });
  assert.equal(inherited.scope, 'Targeted');
  assert.equal(inherited.target, 'Leave');

  const rescoped = planRefinement(runsDir, 'run-002__2026-01-14_09-00-00__Targeted__Leave', {
    now: NOW, scope: 'UserStory', target: 'Leave Carry Forward',
  });
  assert.equal(rescoped.scope, 'UserStory');
  assert.match(rescoped.newRunFolder, /UserStory__LeaveCarryForward$/);
  cleanup(runsDir);
});

test('planRefinement requires an explicit now, and refuses an unknown prior run', () => {
  const runsDir = makeRunsDir();
  makeRun(runsDir, 'run-002__2026-01-14_09-00-00__Targeted__Leave');

  assert.throws(() => planRefinement(runsDir, 'run-002__2026-01-14_09-00-00__Targeted__Leave', {}), LineageError);
  assert.throws(() => planRefinement(runsDir, 'run-999__nope', { now: NOW }), LineageError);
  cleanup(runsDir);
});

test('writeLineage records inheritsFrom/supersedes and references artifacts by path', () => {
  const runsDir = makeRunsDir();
  makeRun(runsDir, 'run-002__2026-01-14_09-00-00__Targeted__Leave', {
    stages: { context: { 'ProjectContext.md': APPROVED_CTX } },
  });
  const plan = planRefinement(runsDir, 'run-002__2026-01-14_09-00-00__Targeted__Leave', { now: NOW });
  fs.mkdirSync(path.join(runsDir, plan.newRunFolder), { recursive: true });

  const rec = writeLineage(runsDir, plan, { reason: 'add carry-forward rules' });

  assert.equal(rec.inheritsFrom, 'run-002__2026-01-14_09-00-00__Targeted__Leave');
  assert.equal(rec.supersedes, 'run-002__2026-01-14_09-00-00__Targeted__Leave');
  assert.equal(rec.reason, 'add carry-forward rules');
  assert.equal(rec.inheritedArtifacts[0].path, 'platform_core_data/runs/run-002__2026-01-14_09-00-00__Targeted__Leave/context');
  assert.ok(fs.existsSync(path.join(runsDir, plan.newRunFolder, 'metadata', LINEAGE_FILENAME)));
  cleanup(runsDir);
});

test('writeLineage refuses to record lineage for a run folder that does not exist yet', () => {
  const runsDir = makeRunsDir();
  makeRun(runsDir, 'run-002__2026-01-14_09-00-00__Targeted__Leave');
  const plan = planRefinement(runsDir, 'run-002__2026-01-14_09-00-00__Targeted__Leave', { now: NOW });

  assert.throws(() => writeLineage(runsDir, plan), LineageError);
  cleanup(runsDir);
});

test('resolvePriorRunFolder resolves {{PRIOR_RUN_FOLDER}}, null when a run inherits nothing', () => {
  const runsDir = makeRunsDir();
  makeRun(runsDir, 'run-002__2026-01-14_09-00-00__Targeted__Leave');
  const plan = planRefinement(runsDir, 'run-002__2026-01-14_09-00-00__Targeted__Leave', { now: NOW });
  fs.mkdirSync(path.join(runsDir, plan.newRunFolder), { recursive: true });
  writeLineage(runsDir, plan);

  assert.equal(resolvePriorRunFolder(runsDir, plan.newRunFolder), 'run-002__2026-01-14_09-00-00__Targeted__Leave');
  assert.equal(resolvePriorRunFolder(runsDir, 'run-002__2026-01-14_09-00-00__Targeted__Leave'), null);
  cleanup(runsDir);
});

test('lineageChain walks the full inheritance chain newest-first', () => {
  const runsDir = makeRunsDir();
  makeRun(runsDir, 'run-001__2026-01-01_09-00-00__FullRun__Leave');

  // run-001 -> run-002 -> run-003
  const p2 = planRefinement(runsDir, 'run-001__2026-01-01_09-00-00__FullRun__Leave', { now: NOW });
  fs.mkdirSync(path.join(runsDir, p2.newRunFolder), { recursive: true });
  writeLineage(runsDir, p2);

  const p3 = planRefinement(runsDir, p2.newRunFolder, { now: NOW });
  fs.mkdirSync(path.join(runsDir, p3.newRunFolder), { recursive: true });
  writeLineage(runsDir, p3);

  const chain = lineageChain(runsDir, p3.newRunFolder);
  assert.equal(chain.length, 3);
  assert.equal(chain[0], p3.newRunFolder);
  assert.equal(chain[2], 'run-001__2026-01-01_09-00-00__FullRun__Leave');
  cleanup(runsDir);
});

test('lineageChain is cycle-guarded against a hand-edited lineage.json', () => {
  const runsDir = makeRunsDir();
  makeRun(runsDir, 'run-001__2026-01-01_09-00-00__FullRun__A');
  makeRun(runsDir, 'run-002__2026-01-02_09-00-00__FullRun__B');
  // Deliberate cycle: 001 -> 002 -> 001
  fs.writeFileSync(path.join(runsDir, 'run-001__2026-01-01_09-00-00__FullRun__A', 'metadata', LINEAGE_FILENAME),
    JSON.stringify({ inheritsFrom: 'run-002__2026-01-02_09-00-00__FullRun__B' }));
  fs.writeFileSync(path.join(runsDir, 'run-002__2026-01-02_09-00-00__FullRun__B', 'metadata', LINEAGE_FILENAME),
    JSON.stringify({ inheritsFrom: 'run-001__2026-01-01_09-00-00__FullRun__A' }));

  const chain = lineageChain(runsDir, 'run-001__2026-01-01_09-00-00__FullRun__A');
  assert.equal(chain.length, 2, 'terminates instead of looping forever');
  cleanup(runsDir);
});

test('readLineage returns null for a run with no lineage record', () => {
  const runsDir = makeRunsDir();
  makeRun(runsDir, 'run-001__2026-01-01_09-00-00__FullRun__A');
  assert.equal(readLineage(runsDir, 'run-001__2026-01-01_09-00-00__FullRun__A'), null);
  cleanup(runsDir);
});

test('planRefinement carries the drift report for prior-run -> now', () => {
  // A real git target, so the drift figures are genuine rather than mocked.
  const targetRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'lineage-target-'));
  const git = (...a) => execFileSync('git', a, { cwd: targetRoot, encoding: 'utf8' });
  git('init', '-q');
  git('config', 'user.email', 't@e.com');
  git('config', 'user.name', 'T');
  git('config', 'commit.gpgsign', 'false');
  fs.mkdirSync(path.join(targetRoot, 'src', 'leave'), { recursive: true });
  fs.writeFileSync(path.join(targetRoot, 'src/leave/request.js'), 'v1');
  git('add', '-A'); git('commit', '-q', '-m', 'init');
  const sha = git('rev-parse', 'HEAD').trim();

  const runsDir = makeRunsDir();
  makeRun(runsDir, 'run-002__2026-01-14_09-00-00__Targeted__Leave', {
    meta: { targetRef: sha, targetRefScope: ['src/leave'] },
  });

  // The app moves on after that run.
  fs.writeFileSync(path.join(targetRoot, 'src/leave/request.js'), 'v2');
  git('add', '-A'); git('commit', '-q', '-m', 'leave: change flow');

  const plan = planRefinement(runsDir, 'run-002__2026-01-14_09-00-00__Targeted__Leave', {
    now: NOW, targetRoot, execFileSync,
  });

  assert.equal(plan.drift.status, 'moved');
  assert.equal(plan.drift.commitsSince, 1);
  assert.deepEqual(plan.drift.changedPaths, ['src/leave/request.js']);
  cleanup(runsDir);
  fs.rmSync(targetRoot, { recursive: true, force: true });
});

test('planRefinement omits drift when no target root is supplied (never fabricates it)', () => {
  const runsDir = makeRunsDir();
  makeRun(runsDir, 'run-002__2026-01-14_09-00-00__Targeted__Leave');
  const plan = planRefinement(runsDir, 'run-002__2026-01-14_09-00-00__Targeted__Leave', { now: NOW });
  assert.equal(plan.drift, null);
  cleanup(runsDir);
});
