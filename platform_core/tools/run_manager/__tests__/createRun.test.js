const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const { createRun, backfillTargetRef, CreateRunError } = require('../createRun');
const { readActiveRun, resolveActiveRunFolder } = require('../activeRun');
const { readManifest } = require('../runManifest');
const { computeDrift } = require('../targetRef');

const NOW = new Date('2026-07-27T21:00:00Z');
const LATER = new Date('2026-07-28T09:00:00Z');

function makeRunsDir() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'createrun-'));
  const runsDir = path.join(root, 'runs');
  fs.mkdirSync(runsDir, { recursive: true });
  return runsDir;
}

/** A real git target, so the anchor is a genuine commit rather than a stub. */
function makeTarget() {
  const dir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'createrun-app-')));
  const git = (...a) => execFileSync('git', a, { cwd: dir, encoding: 'utf8' });
  git('init', '-q');
  git('config', 'user.email', 't@e.com');
  git('config', 'user.name', 'T');
  git('config', 'commit.gpgsign', 'false');
  fs.mkdirSync(path.join(dir, 'src', 'leave'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'src/leave/request.js'), 'v1');
  git('add', '-A'); git('commit', '-q', '-m', 'init');
  return { dir, git, sha: git('rev-parse', 'HEAD').trim() };
}

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const cleanup = (d) => fs.rmSync(path.dirname(d), { recursive: true, force: true });

test('createRun writes run.json with the code-state anchor captured', () => {
  const runsDir = makeRunsDir();
  const app = makeTarget();

  const res = createRun(runsDir, {
    scope: 'FullRun', target: 'Leave', now: NOW,
    targetRoot: app.dir, scopePaths: ['src/leave'], execFileSync,
    workflow: 'first_run',
  });

  const meta = readJson(path.join(res.runDir, 'metadata', 'run.json'));
  assert.equal(meta.targetRef, app.sha, 'the anchor is the target repo HEAD for the scoped paths');
  assert.deepEqual(meta.targetRefScope, ['src/leave']);
  assert.equal(meta.targetRefCapturedAt, NOW.toISOString());
  assert.equal(meta.workflow, 'first_run');
  assert.equal(meta.status, 'Preparing');
  // Folder names use local time (generateRunFolderName's existing behaviour), so assert the shape
  // rather than a timezone-dependent date.
  assert.match(res.folderName, /^run-001__\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}__FullRun__Leave$/);
  cleanup(runsDir);
  fs.rmSync(app.dir, { recursive: true, force: true });
});

test('the anchor is attempted even with no target root — null WITH a stated reason', () => {
  const runsDir = makeRunsDir();

  const res = createRun(runsDir, { scope: 'FullRun', target: 'Leave', now: NOW });
  const meta = readJson(path.join(res.runDir, 'metadata', 'run.json'));

  assert.equal(meta.targetRef, null);
  assert.ok('targetRefReason' in meta, 'the reason field is always present');
  assert.match(meta.targetRefReason, /could not be captured/);
  assert.ok('targetRefCapturedAt' in meta, 'an attempt is recorded even when it yields null');
  cleanup(runsDir);
});

test('createRun always creates metadata/ and RunManifest.md, and no stage folders', () => {
  const runsDir = makeRunsDir();
  const res = createRun(runsDir, { scope: 'FullRun', target: 'Leave', now: NOW });

  assert.ok(fs.existsSync(path.join(res.runDir, 'metadata', 'run.json')));
  assert.ok(fs.existsSync(path.join(res.runDir, 'metadata', 'RunManifest.md')));

  const entries = fs.readdirSync(res.runDir);
  assert.deepEqual(entries, ['metadata'], 'stage folders are created by stages, never pre-created');
  cleanup(runsDir);
});

test('a run created with no anchor has that declared as a gap in its Manifest', () => {
  const runsDir = makeRunsDir();
  const res = createRun(runsDir, { scope: 'FullRun', target: 'Leave', now: NOW });

  const manifest = fs.readFileSync(res.manifestPath, 'utf8');
  assert.match(manifest, /No code-state anchor/);
  assert.match(manifest, /unknown-no-anchor/);
  cleanup(runsDir);
});

test('createRun does not activate unless asked, and activates when asked', () => {
  const runsDir = makeRunsDir();

  const passive = createRun(runsDir, { scope: 'FullRun', target: 'A', now: NOW });
  assert.equal(passive.activated, false);
  assert.equal(readActiveRun(runsDir), null, 'creation alone never moves the pointer');

  const active = createRun(runsDir, { scope: 'FullRun', target: 'B', now: NOW, activate: true });
  assert.equal(active.activated, true);
  assert.equal(resolveActiveRunFolder(runsDir), active.folderName);
  cleanup(runsDir);
});

test('createRun requires an explicit now and a scope', () => {
  const runsDir = makeRunsDir();
  assert.throws(() => createRun(runsDir, { scope: 'FullRun', target: 'A' }), CreateRunError);
  assert.throws(() => createRun(runsDir, { target: 'A', now: NOW }), CreateRunError);
  cleanup(runsDir);
});

test('createRun refuses to overwrite an existing run folder', () => {
  const runsDir = makeRunsDir();
  const first = createRun(runsDir, { scope: 'FullRun', target: 'A', now: NOW });

  assert.throws(
    () => createRun(runsDir, { folderName: first.folderName, scope: 'FullRun', target: 'A', now: NOW }),
    (err) => {
      assert.ok(err instanceof CreateRunError);
      assert.match(err.message, /already exists/);
      assert.match(err.message, /immutable once written/);
      return true;
    }
  );
  cleanup(runsDir);
});

test('the run index advances past existing runs', () => {
  const runsDir = makeRunsDir();
  createRun(runsDir, { scope: 'FullRun', target: 'A', now: NOW });
  createRun(runsDir, { scope: 'FullRun', target: 'B', now: NOW });
  const third = createRun(runsDir, { scope: 'FullRun', target: 'C', now: NOW });
  assert.match(third.folderName, /^run-003__/);
  cleanup(runsDir);
});

test('extraRunJson carries lineage onto a refinement run, and shows in the Manifest', () => {
  const runsDir = makeRunsDir();
  const res = createRun(runsDir, {
    scope: 'Targeted', target: 'Leave', now: NOW,
    extraRunJson: { inheritsFrom: 'run-002__old', supersedes: 'run-002__old' },
  });

  const meta = readJson(path.join(res.runDir, 'metadata', 'run.json'));
  assert.equal(meta.inheritsFrom, 'run-002__old');

  const manifest = fs.readFileSync(res.manifestPath, 'utf8');
  assert.match(manifest, /inheritsFrom \/ supersedes `run-002__old`/);
  assert.doesNotMatch(manifest, /_\(this run reuses nothing\)_/);
  cleanup(runsDir);
});

test('a created run is immediately usable by the Manifest reader', () => {
  const runsDir = makeRunsDir();
  const res = createRun(runsDir, { scope: 'FullRun', target: 'Leave', now: NOW });
  const { stages, lastUpdated } = readManifest(runsDir, res.folderName);
  assert.deepEqual(stages, [], 'no stage has run yet');
  assert.equal(lastUpdated, NOW.toISOString());
  cleanup(runsDir);
});

test('a created run answers drift immediately — unchanged right after creation', () => {
  const runsDir = makeRunsDir();
  const app = makeTarget();
  const res = createRun(runsDir, {
    scope: 'FullRun', target: 'Leave', now: NOW,
    targetRoot: app.dir, scopePaths: ['src/leave'], execFileSync,
  });

  const meta = readJson(path.join(res.runDir, 'metadata', 'run.json'));
  const drift = computeDrift(app.dir, meta, { execFileSync });
  assert.equal(drift.status, 'unchanged', 'the anchor is real, so drift is computable at once');

  // Move the app on; the same run must now report moved.
  fs.writeFileSync(path.join(app.dir, 'src/leave/request.js'), 'v2');
  app.git('add', '-A'); app.git('commit', '-q', '-m', 'leave: change');
  assert.equal(computeDrift(app.dir, meta, { execFileSync }).status, 'moved');

  cleanup(runsDir);
  fs.rmSync(app.dir, { recursive: true, force: true });
});

test('backfillTargetRef anchors a run that has none, and marks it as backfilled', () => {
  const runsDir = makeRunsDir();
  const app = makeTarget();
  const res = createRun(runsDir, { scope: 'FullRun', target: 'Leave', now: NOW });

  const result = backfillTargetRef(runsDir, res.folderName, {
    now: LATER, targetRoot: app.dir, scopePaths: ['src/leave'], execFileSync,
  });

  assert.equal(result.updated, true);
  const meta = readJson(path.join(res.runDir, 'metadata', 'run.json'));
  assert.equal(meta.targetRef, app.sha);
  assert.equal(meta.targetRefBackfilled, true);
  assert.match(meta.targetRefReason, /BACKFILLED/);
  assert.match(meta.targetRefReason, /not when the run executed/,
    'the honesty caveat must survive — a backfilled anchor understates real drift');
  cleanup(runsDir);
  fs.rmSync(app.dir, { recursive: true, force: true });
});

test('backfillTargetRef refuses to overwrite a real anchor unless forced', () => {
  const runsDir = makeRunsDir();
  const app = makeTarget();
  const res = createRun(runsDir, {
    scope: 'FullRun', target: 'Leave', now: NOW,
    targetRoot: app.dir, scopePaths: ['src/leave'], execFileSync,
  });

  const refused = backfillTargetRef(runsDir, res.folderName, {
    now: LATER, targetRoot: app.dir, execFileSync,
  });
  assert.equal(refused.updated, false);
  assert.match(refused.reason, /already has targetRef/);

  const forced = backfillTargetRef(runsDir, res.folderName, {
    now: LATER, targetRoot: app.dir, execFileSync, force: true,
  });
  assert.equal(forced.updated, true);
  cleanup(runsDir);
  fs.rmSync(app.dir, { recursive: true, force: true });
});

test('backfillTargetRef reports a run with no readable run.json', () => {
  const runsDir = makeRunsDir();
  fs.mkdirSync(path.join(runsDir, 'run-009__x', 'metadata'), { recursive: true });
  const r = backfillTargetRef(runsDir, 'run-009__x', {
    now: NOW, targetRoot: runsDir, execFileSync,
  });
  assert.equal(r.updated, false);
  assert.match(r.reason, /no readable metadata\/run\.json/);
  cleanup(runsDir);
});
