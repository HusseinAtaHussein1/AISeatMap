const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const {
  discoverTargetRepo,
  getTargetRef,
  captureTargetRef,
  countCommitsSince,
  changedPathsSince,
  computeDrift,
} = require('../targetRef');

const NOW = new Date('2026-07-27T21:00:00Z');
const DEPS = { execFileSync };

/** A real git repo — these functions shell out to git, so faking it would test nothing. */
function makeRepo() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'targetref-'));
  const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' });
  git('init', '-q');
  git('config', 'user.email', 'test@example.com');
  git('config', 'user.name', 'Test');
  git('config', 'commit.gpgsign', 'false');
  return { dir, git };
}

function commitFile(repo, relPath, content, message) {
  const abs = path.join(repo.dir, relPath);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content);
  repo.git('add', '-A');
  repo.git('commit', '-q', '-m', message);
  return repo.git('rev-parse', 'HEAD').trim();
}

function cleanup(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

test('discoverTargetRepo finds the repo governing the target root', () => {
  const repo = makeRepo();
  commitFile(repo, 'src/app.js', 'x', 'init');
  const found = discoverTargetRepo(repo.dir, DEPS);
  assert.equal(found.available, true);
  assert.equal(fs.realpathSync(found.root).toLowerCase(), fs.realpathSync(repo.dir).toLowerCase());
  cleanup(repo.dir);
});

test('discoverTargetRepo reports unavailable (never throws) when the target has no git repo', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nogit-'));
  const found = discoverTargetRepo(dir, DEPS);
  assert.equal(found.available, false);
  assert.equal(found.root, null);
  assert.match(found.reason, /No git repository governs/);
  // The reason must say an unversioned target is not an unchanged one — that distinction is the point.
  assert.match(found.reason, /not the same as an unchanged one/);
  cleanup(dir);
});

test('getTargetRef is path-scoped: an unrelated commit does not move a scoped ref', () => {
  const repo = makeRepo();
  commitFile(repo, 'src/leave/request.js', 'v1', 'leave: init');
  const found = discoverTargetRepo(repo.dir, DEPS);
  const scopedBefore = getTargetRef(found, ['src/leave'], DEPS);

  commitFile(repo, 'src/billing/invoice.js', 'v1', 'billing: unrelated');
  const scopedAfter = getTargetRef(found, ['src/leave'], DEPS);
  const repoWide = getTargetRef(found, [], DEPS);

  assert.equal(scopedAfter, scopedBefore, 'scoped ref must ignore unrelated paths (monorepo safety)');
  assert.notEqual(repoWide, scopedBefore, 'repo-wide ref does move');
  cleanup(repo.dir);
});

test('captureTargetRef records ref, scope, and timestamp', () => {
  const repo = makeRepo();
  const sha = commitFile(repo, 'src/leave/request.js', 'v1', 'init');
  const anchor = captureTargetRef(repo.dir, { scopePaths: ['src/leave'], capturedAt: NOW, execFileSync });

  assert.equal(anchor.targetRef, sha);
  assert.deepEqual(anchor.targetRefScope, ['src/leave']);
  assert.equal(anchor.targetRefCapturedAt, '2026-07-27T21:00:00.000Z');
  cleanup(repo.dir);
});

test('captureTargetRef requires an explicit capturedAt', () => {
  const repo = makeRepo();
  commitFile(repo, 'a.js', 'x', 'init');
  assert.throws(() => captureTargetRef(repo.dir, { execFileSync }), TypeError);
  cleanup(repo.dir);
});

test('captureTargetRef on a target with no git records null, with a stated reason', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nogit-'));
  const anchor = captureTargetRef(dir, { capturedAt: NOW, execFileSync });
  assert.equal(anchor.targetRef, null);
  assert.equal(anchor.targetRepoRoot, null);
  assert.match(anchor.targetRefReason, /No git repository governs/);
  cleanup(dir);
});

test('computeDrift reports unchanged when the scoped paths have not moved', () => {
  const repo = makeRepo();
  const sha = commitFile(repo, 'src/leave/request.js', 'v1', 'init');
  commitFile(repo, 'src/billing/invoice.js', 'v1', 'unrelated');

  const drift = computeDrift(repo.dir, { targetRef: sha, targetRefScope: ['src/leave'] }, DEPS);

  assert.equal(drift.status, 'unchanged');
  assert.equal(drift.commitsSince, 0);
  assert.deepEqual(drift.changedPaths, []);
  cleanup(repo.dir);
});

test('computeDrift reports moved, with the commit count and the changed files', () => {
  const repo = makeRepo();
  const sha = commitFile(repo, 'src/leave/request.js', 'v1', 'init');
  commitFile(repo, 'src/leave/request.js', 'v2', 'leave: change request flow');
  commitFile(repo, 'src/leave/approve.js', 'v1', 'leave: add approve');

  const drift = computeDrift(repo.dir, { targetRef: sha, targetRefScope: ['src/leave'] }, DEPS);

  assert.equal(drift.status, 'moved');
  assert.equal(drift.commitsSince, 2);
  assert.deepEqual(drift.changedPaths.sort(), ['src/leave/approve.js', 'src/leave/request.js']);
  assert.match(drift.summary, /need re-verification/);
  cleanup(repo.dir);
});

test('computeDrift distinguishes "no anchor" from "unchanged"', () => {
  const repo = makeRepo();
  commitFile(repo, 'src/app.js', 'v1', 'init');

  const drift = computeDrift(repo.dir, { targetRef: null }, DEPS);

  assert.equal(drift.status, 'unknown-no-anchor');
  assert.notEqual(drift.status, 'unchanged', 'a missing anchor must never read as "no drift"');
  assert.match(drift.summary, /unverified against current code/);
  cleanup(repo.dir);
});

test('computeDrift distinguishes "no git" from "unchanged"', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nogit-'));
  const drift = computeDrift(dir, { targetRef: 'deadbeef' }, DEPS);

  assert.equal(drift.status, 'unknown-no-git');
  assert.notEqual(drift.status, 'unchanged');
  assert.match(drift.summary, /not as current/);
  cleanup(dir);
});

test('computeDrift reports unresolvable rather than guessing when the recorded ref is gone', () => {
  const repo = makeRepo();
  commitFile(repo, 'src/app.js', 'v1', 'init');

  const drift = computeDrift(repo.dir, { targetRef: 'a'.repeat(40) }, DEPS);

  assert.equal(drift.status, 'unknown-unresolvable');
  assert.match(drift.summary, /cannot be resolved/);
  cleanup(repo.dir);
});

test('countCommitsSince / changedPathsSince return null when uncomputable', () => {
  const repo = makeRepo();
  commitFile(repo, 'a.js', 'x', 'init');
  const found = discoverTargetRepo(repo.dir, DEPS);

  assert.equal(countCommitsSince(found, null, [], DEPS), null, 'no ref -> null, not 0');
  assert.equal(changedPathsSince(found, null, [], DEPS), null);
  assert.equal(countCommitsSince({ available: false }, 'abc', [], DEPS), null);
  cleanup(repo.dir);
});

test('a repo-wide anchor still detects movement anywhere', () => {
  const repo = makeRepo();
  const sha = commitFile(repo, 'src/a.js', 'v1', 'init');
  commitFile(repo, 'docs/readme.md', 'v1', 'docs only');

  const drift = computeDrift(repo.dir, { targetRef: sha, targetRefScope: [] }, DEPS);

  assert.equal(drift.status, 'moved');
  assert.equal(drift.commitsSince, 1);
  cleanup(repo.dir);
});
