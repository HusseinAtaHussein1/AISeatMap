const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  copyBaselineInto, copyBaselineIntoModule, copyBaselineIntoRun, loadSnapshot, SNAPSHOT_FILENAME,
} = require('../baselineCopy');

const FIXED_NOW = new Date('2026-07-24T12:00:00.000Z');

test('copyBaselineIntoRun requires an explicit now (never defaults internally)', () => {
  assert.throws(
    () => copyBaselineIntoRun('/baseline', '/run/pkg', { execFileSync: () => '' }),
    TypeError,
  );
});

test('copyBaselineIntoRun copies an existing baseline and records its ref in a snapshot file', () => {
  const baselineDir = fs.mkdtempSync(path.join(os.tmpdir(), 'baseline-'));
  const runRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'run-'));
  try {
    fs.writeFileSync(path.join(baselineDir, 'Page.java'), 'content');
    const runPackagePath = path.join(runRoot, 'automation', 'Project_tests_SHAFT');
    const repo = {
      root: baselineDir.split(path.sep).join('/'),
      available: true,
      writable: true,
      mode: 'tool-repo',
      reason: 'test fixture',
    };

    const result = copyBaselineIntoRun(baselineDir, runPackagePath, {
      execFileSync: (cmd, args) => (args[0] === 'log' ? 'abc123\n' : ''),
      now: FIXED_NOW,
      repo,
      dataRoot: baselineDir,
    });

    assert.equal(result.copied, true);
    assert.equal(result.baselineRef, 'abc123');
    assert.equal(fs.readFileSync(path.join(runPackagePath, 'Page.java'), 'utf8'), 'content');

    const snapshot = loadSnapshot(result.snapshotPath);
    assert.equal(snapshot.baselineRef, 'abc123');
    assert.equal(snapshot.copiedAt, FIXED_NOW.toISOString());
    assert.equal(path.basename(result.snapshotPath), SNAPSHOT_FILENAME);

    // schemaVersion 2 records which repository governed the baseline, so a later merge can detect
    // that git protection was lost or the repository changed identity mid-run (pipeline.md §12.4).
    assert.equal(snapshot.schemaVersion, 2);
    assert.equal(snapshot.gitAvailable, true);
    assert.equal(snapshot.gitMode, 'tool-repo');
    assert.equal(snapshot.repoRoot, repo.root);
    assert.equal(snapshot.baselinePath, '.', 'recorded relative to dataRoot');
    assert.equal(snapshot.baselinePathRoot, 'data');
  } finally {
    fs.rmSync(baselineDir, { recursive: true, force: true });
    fs.rmSync(runRoot, { recursive: true, force: true });
  }
});

test('a schemaVersion 1 snapshot is normalized rather than rejected', () => {
  // An in-flight run created before the two-root upgrade must still be mergeable.
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'snapshot-v1-'));
  try {
    const p = path.join(dir, '.lifecycle_snapshot.json');
    fs.writeFileSync(p, JSON.stringify({
      baselinePath: 'platform_core_data/automation_baseline/tests_SHAFT',
      baselineRef: 'oldref',
      copiedAt: FIXED_NOW.toISOString(),
    }));

    const snapshot = loadSnapshot(p);
    assert.equal(snapshot.schemaVersion, 1);
    assert.equal(snapshot.baselineRef, 'oldref');
    assert.equal(snapshot.baselinePathRoot, 'legacy-repo-relative');
    // A v1 snapshot could only have been written by a build that required git unconditionally, so
    // gitAvailable defaults true — which makes "git is gone now" a hard block, not a silent downgrade.
    assert.equal(snapshot.gitAvailable, true);
    assert.equal(snapshot.repoRoot, null);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('copyBaselineIntoRun with no existing baseline (greenfield) copies nothing and records a null ref', () => {
  const runRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'run-greenfield-'));
  try {
    const baselinePath = path.join(runRoot, 'no-such-baseline');
    const runPackagePath = path.join(runRoot, 'automation', 'Project_tests_NewFramework');

    const result = copyBaselineIntoRun(baselinePath, runPackagePath, {
      execFileSync: () => { throw new Error('git must not be invoked when there is no baseline to inspect'); },
      now: FIXED_NOW,
    });

    assert.equal(result.copied, false);
    assert.equal(result.baselineRef, null);
    assert.equal(fs.existsSync(runPackagePath), false);

    const snapshot = loadSnapshot(result.snapshotPath);
    assert.equal(snapshot.baselineRef, null);
  } finally {
    fs.rmSync(runRoot, { recursive: true, force: true });
  }
});

test('loadSnapshot returns null when no snapshot file exists yet', () => {
  assert.equal(loadSnapshot(path.join(os.tmpdir(), 'no-such-snapshot.json')), null);
});

test('copyBaselineIntoModule seeds a module automation project and records the baseline ref', () => {
  // pipeline.md §12.3: generation happens in the module automation project, not a run working copy.
  // Both the baseline and the module live under the data root, as they do in a real install — the
  // lifecycle only ever holds the repository governing platform_core_data/ (pipeline.md §13.3).
  const dataRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'data-'));
  try {
    const baselineDir = path.join(dataRoot, 'automation_baseline', 'playwright', 'shared');
    fs.mkdirSync(baselineDir, { recursive: true });
    fs.writeFileSync(path.join(baselineDir, 'BasePage.ts'), 'shared');
    const modulePackagePath = path.join(dataRoot, 'modules', 'login', 'automation', 'tests_PW');
    const repo = {
      available: true, writable: true, mode: 'tool-repo', root: dataRoot, reason: 'test fixture',
    };

    const result = copyBaselineIntoModule(baselineDir, modulePackagePath, {
      execFileSync: (cmd, args) => (args[0] === 'log' ? 'sharedref\n' : ''),
      now: FIXED_NOW,
      repo,
    });

    assert.equal(result.copied, true);
    assert.equal(result.baselineRef, 'sharedref');
    assert.equal(fs.readFileSync(path.join(modulePackagePath, 'BasePage.ts'), 'utf8'), 'shared');
    // The snapshot sits beside the project, inside the module's own automation folder.
    assert.equal(
      path.basename(path.dirname(result.snapshotPath)),
      'automation',
    );
    assert.equal(path.basename(result.snapshotPath), SNAPSHOT_FILENAME);
  } finally {
    fs.rmSync(dataRoot, { recursive: true, force: true });
  }
});

test('the module, run, and generic entry points are one implementation, not three', () => {
  // Two copies of the ref-capture logic would be two things to keep in agreement about what a
  // snapshot means, which is why this revision added a name rather than an implementation.
  assert.equal(typeof copyBaselineInto, 'function');
  for (const fn of [copyBaselineIntoModule, copyBaselineIntoRun]) {
    assert.throws(() => fn('/baseline', '/dest', { execFileSync: () => '' }), TypeError);
  }
});
