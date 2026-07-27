// Regression tests for C7: a bare legacy Run ID that matches more than one folder must not resolve to
// whichever one readdir happened to list first.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { resolveRunFolder, resolveRunFolderStrict, saveIndex, buildIndexEntry } = require('../runFolderIndex');
const { setActiveRun, ActiveRunError } = require('../activeRun');

const NOW = new Date('2026-07-27T21:00:00Z');

function makeRunsDir() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ambig-'));
  const runsDir = path.join(root, 'runs');
  fs.mkdirSync(runsDir, { recursive: true });
  return runsDir;
}
const mk = (d, n) => fs.mkdirSync(path.join(d, n, 'metadata'), { recursive: true });
const cleanup = (d) => fs.rmSync(path.dirname(d), { recursive: true, force: true });

test('an unambiguous bare Run ID still resolves', () => {
  const runsDir = makeRunsDir();
  mk(runsDir, 'RUN-20260706-001-login');

  assert.equal(resolveRunFolder(runsDir, 'RUN-20260706-001'), 'RUN-20260706-001-login');
  cleanup(runsDir);
});

test('an ambiguous bare Run ID resolves to null instead of guessing', () => {
  const runsDir = makeRunsDir();
  mk(runsDir, 'RUN-20260706-001-login');
  mk(runsDir, 'RUN-20260706-001-logout');

  assert.equal(
    resolveRunFolder(runsDir, 'RUN-20260706-001'), null,
    'two candidates must not silently collapse to one'
  );
  cleanup(runsDir);
});

test('an exact folder name is never treated as ambiguous, even when it prefixes another', () => {
  const runsDir = makeRunsDir();
  mk(runsDir, 'RUN-20260706-001');
  mk(runsDir, 'RUN-20260706-001-login');

  // The identifier IS a real folder — exact match wins before any prefix logic runs.
  assert.equal(resolveRunFolder(runsDir, 'RUN-20260706-001'), 'RUN-20260706-001');
  cleanup(runsDir);
});

test('resolveRunFolderStrict distinguishes ambiguous from not-found', () => {
  const runsDir = makeRunsDir();
  mk(runsDir, 'RUN-20260706-001-login');
  mk(runsDir, 'RUN-20260706-001-logout');

  const ambiguous = resolveRunFolderStrict(runsDir, 'RUN-20260706-001');
  assert.equal(ambiguous.folderName, null);
  assert.equal(ambiguous.ambiguous, true);
  assert.deepEqual(ambiguous.candidates, ['RUN-20260706-001-login', 'RUN-20260706-001-logout']);

  const missing = resolveRunFolderStrict(runsDir, 'RUN-19990101-999');
  assert.equal(missing.folderName, null);
  assert.equal(missing.ambiguous, false, 'nothing matched — not the same as too much matching');
  assert.deepEqual(missing.candidates, []);

  const found = resolveRunFolderStrict(runsDir, 'RUN-20260706-001-login');
  assert.equal(found.folderName, 'RUN-20260706-001-login');
  assert.equal(found.ambiguous, false);
  cleanup(runsDir);
});

test('candidates are returned in a stable order, not readdir order', () => {
  const runsDir = makeRunsDir();
  // Created in reverse alphabetical order on purpose.
  mk(runsDir, 'RUN-20260706-001-zulu');
  mk(runsDir, 'RUN-20260706-001-alpha');

  const { candidates } = resolveRunFolderStrict(runsDir, 'RUN-20260706-001');
  assert.deepEqual(candidates, ['RUN-20260706-001-alpha', 'RUN-20260706-001-zulu']);
  cleanup(runsDir);
});

test('setActiveRun reports ambiguity with the candidates, not a misleading "no match"', () => {
  const runsDir = makeRunsDir();
  mk(runsDir, 'RUN-20260706-001-login');
  mk(runsDir, 'RUN-20260706-001-logout');

  assert.throws(
    () => setActiveRun(runsDir, 'RUN-20260706-001', { now: NOW }),
    (err) => {
      assert.ok(err instanceof ActiveRunError);
      assert.match(err.message, /matches 2 runs/);
      assert.match(err.message, /RUN-20260706-001-login/);
      assert.match(err.message, /RUN-20260706-001-logout/);
      assert.match(err.message, /Pass the full folder name/);
      return true;
    }
  );
  // And nothing was written.
  assert.equal(fs.existsSync(path.join(runsDir, 'current_active_run.json')), false);
  cleanup(runsDir);
});

test('setActiveRun still reports a genuine not-found as not-found', () => {
  const runsDir = makeRunsDir();
  mk(runsDir, 'RUN-20260706-001-login');

  assert.throws(
    () => setActiveRun(runsDir, 'RUN-19990101-999', { now: NOW }),
    (err) => {
      assert.match(err.message, /No run folder matches/);
      assert.doesNotMatch(err.message, /matches \d+ runs/);
      return true;
    }
  );
  cleanup(runsDir);
});

test('the compatibility index still resolves a legacy run by its inferred new name', () => {
  const runsDir = makeRunsDir();
  mk(runsDir, 'RUN-20260706-001-login');
  saveIndex(runsDir, [
    buildIndexEntry('RUN-20260706-001-login', 'run-001__2026-07-06_00-00-00__UserStory__Login', {
      source: 'metadata/run.json', confidence: 'high',
    }),
  ]);

  assert.equal(
    resolveRunFolder(runsDir, 'run-001__2026-07-06_00-00-00__UserStory__Login'),
    'RUN-20260706-001-login',
    'index lookup is unaffected by the ambiguity change'
  );
  cleanup(runsDir);
});
