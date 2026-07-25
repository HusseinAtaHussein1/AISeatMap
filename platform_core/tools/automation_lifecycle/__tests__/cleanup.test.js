const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { accountedForPaths, cleanupRunPackage } = require('../cleanup');

test('accountedForPaths includes added/modified/deleted/renamed-from/discarded, nothing else', () => {
  const plan = {
    added: ['A.java'],
    modified: ['B.java'],
    deleted: ['C.java'],
    renamed: [{ from: 'Old.java', to: 'New.java' }],
    discardedIgnored: ['target/Build.class'],
  };
  assert.deepEqual(accountedForPaths(plan), ['A.java', 'B.java', 'C.java', 'Old.java', 'target/Build.class']);
});

test('cleanupRunPackage dry-run (default) reports what would be deleted without touching disk', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cleanup-dry-'));
  try {
    fs.writeFileSync(path.join(dir, 'A.java'), 'x');
    const plan = {
      added: ['A.java'], modified: [], deleted: [], renamed: [], discardedIgnored: [],
    };
    const result = cleanupRunPackage(dir, plan);
    assert.deepEqual(result.wouldDelete, ['A.java']);
    assert.deepEqual(result.deleted, []);
    assert.equal(fs.existsSync(path.join(dir, 'A.java')), true);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('cleanupRunPackage with apply:true deletes only accounted-for files, never a whole-directory nuke', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cleanup-apply-'));
  try {
    fs.writeFileSync(path.join(dir, 'Merged.java'), 'x');
    fs.mkdirSync(path.join(dir, 'target'));
    fs.writeFileSync(path.join(dir, 'target', 'Build.class'), 'y'); // discarded/ignored, still accounted for
    fs.writeFileSync(path.join(dir, 'Untouched.md'), 'z'); // NOT in the plan at all — must survive

    const plan = {
      added: ['Merged.java'], modified: [], deleted: [], renamed: [], discardedIgnored: ['target/Build.class'],
    };
    const result = cleanupRunPackage(dir, plan, { apply: true });

    assert.deepEqual(result.deleted.sort(), ['Merged.java', 'target/Build.class'].sort());
    assert.equal(fs.existsSync(path.join(dir, 'Merged.java')), false);
    assert.equal(fs.existsSync(path.join(dir, 'target')), false); // now-empty dir removed too
    assert.equal(fs.existsSync(path.join(dir, 'Untouched.md')), true);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('cleanupRunPackage never fails on a candidate path that no longer exists on disk', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cleanup-missing-'));
  try {
    const plan = {
      added: ['DoesNotExist.java'], modified: [], deleted: [], renamed: [], discardedIgnored: [],
    };
    const result = cleanupRunPackage(dir, plan, { apply: true });
    assert.deepEqual(result.deleted, []);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
