const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  accountedForPaths, cleanupPackage, cleanupRunPackage, CleanupScopeError, DEFAULT_CLEANUP_SCOPE,
} = require('../cleanup');

const FULL_PLAN = {
  added: ['A.java'],
  modified: ['B.java'],
  deleted: ['C.java'],
  renamed: [{ from: 'Old.java', to: 'New.java' }],
  discardedIgnored: ['target/Build.class'],
};

test('accountedForPaths includes added/modified/deleted/renamed-from/discarded, nothing else', () => {
  assert.deepEqual(
    accountedForPaths(FULL_PLAN, 'all-accounted'),
    ['A.java', 'B.java', 'C.java', 'Old.java', 'target/Build.class'],
  );
});

test('accountedForPaths at build-only scope returns discarded build output and nothing else', () => {
  // pipeline.md §12.5: a module automation project is the module's durable automation home. Cleanup
  // removes build/IDE output; deleting its source would recreate the problem the module workspace
  // was introduced to solve.
  assert.deepEqual(accountedForPaths(FULL_PLAN, 'build-only'), ['target/Build.class']);
});

test('the default cleanup scope is the safe one — a forgotten scope keeps a runnable project', () => {
  assert.equal(DEFAULT_CLEANUP_SCOPE, 'build-only');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cleanup-default-'));
  try {
    fs.writeFileSync(path.join(dir, 'A.java'), 'x');
    const result = cleanupPackage(dir, FULL_PLAN);
    assert.equal(result.scope, 'build-only');
    assert.deepEqual(result.wouldDelete, ['target/Build.class']);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('build-only cleanup deletes build output and leaves every source file runnable', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cleanup-build-only-'));
  try {
    fs.writeFileSync(path.join(dir, 'A.java'), 'x');
    fs.writeFileSync(path.join(dir, 'playwright.config.ts'), 'x');
    fs.mkdirSync(path.join(dir, 'target'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'target', 'Build.class'), 'x');

    const result = cleanupPackage(dir, FULL_PLAN, { apply: true, scope: 'build-only' });

    assert.deepEqual(result.deleted, ['target/Build.class']);
    assert.equal(fs.existsSync(path.join(dir, 'A.java')), true);
    assert.equal(fs.existsSync(path.join(dir, 'playwright.config.ts')), true);
    assert.equal(fs.existsSync(path.join(dir, 'target')), false);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('an unknown cleanup scope is an error, never a silent fallback to deleting everything', () => {
  assert.throws(() => accountedForPaths(FULL_PLAN, 'everything'), CleanupScopeError);
});

test('cleanupRunPackage keeps its pre-migration all-accounted behaviour', () => {
  // Silently narrowing this alias would leave merged source behind in a location its existing
  // callers expect to be emptied.
  const result = cleanupPackage(
    '/nonexistent', FULL_PLAN, { scope: 'all-accounted' },
  );
  assert.deepEqual(cleanupRunPackage('/nonexistent', FULL_PLAN).wouldDelete, result.wouldDelete);
  assert.equal(cleanupRunPackage('/nonexistent', FULL_PLAN).scope, 'all-accounted');
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
