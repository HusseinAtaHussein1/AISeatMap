const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { copyBaselineIntoRun, loadSnapshot, SNAPSHOT_FILENAME } = require('../baselineCopy');

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

    const result = copyBaselineIntoRun(baselineDir, runPackagePath, {
      execFileSync: (cmd, args) => (args[0] === 'log' ? 'abc123\n' : ''),
      now: FIXED_NOW,
    });

    assert.equal(result.copied, true);
    assert.equal(result.baselineRef, 'abc123');
    assert.equal(fs.readFileSync(path.join(runPackagePath, 'Page.java'), 'utf8'), 'content');

    const snapshot = loadSnapshot(result.snapshotPath);
    assert.equal(snapshot.baselineRef, 'abc123');
    assert.equal(snapshot.copiedAt, FIXED_NOW.toISOString());
    assert.equal(path.basename(result.snapshotPath), SNAPSHOT_FILENAME);
  } finally {
    fs.rmSync(baselineDir, { recursive: true, force: true });
    fs.rmSync(runRoot, { recursive: true, force: true });
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
