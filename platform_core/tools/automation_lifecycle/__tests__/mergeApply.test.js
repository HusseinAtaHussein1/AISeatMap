const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  acquireLock, releaseLock, buildCommitMessage, applyMerge, LOCK_FILENAME,
} = require('../mergeApply');

const FIXED_NOW = new Date('2026-07-24T12:00:00.000Z');

test('buildCommitMessage summarizes added/modified/deleted/renamed counts', () => {
  const msg = buildCommitMessage('NDC', 'NDC_tests_SHAFT', 'RUN-20260712-001', {
    added: ['a', 'b'], modified: ['c'], deleted: [], renamed: [{ from: 'x', to: 'y' }],
  });
  assert.match(msg, /NDC\/NDC_tests_SHAFT/);
  assert.match(msg, /RUN-20260712-001/);
  assert.match(msg, /\+2\/~1\/-0\/→1/);
});

test('acquireLock creates an exclusive lock file, and a second acquire fails while it exists', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mergeapply-lock-'));
  try {
    const lockPath = acquireLock(dir, { now: FIXED_NOW });
    assert.equal(path.basename(lockPath), LOCK_FILENAME);
    assert.equal(fs.existsSync(lockPath), true);

    assert.throws(() => acquireLock(dir, { now: FIXED_NOW }), /locked/);

    releaseLock(lockPath);
    assert.equal(fs.existsSync(lockPath), false);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('acquireLock creates the baseline directory first when it does not exist yet (first-ever merge for a brand-new package)', () => {
  const parent = fs.mkdtempSync(path.join(os.tmpdir(), 'mergeapply-lock-greenfield-'));
  try {
    const baselineDir = path.join(parent, 'not-created-yet', 'NDC_tests_SHAFT');
    assert.equal(fs.existsSync(baselineDir), false);
    const lockPath = acquireLock(baselineDir, { now: FIXED_NOW });
    assert.equal(fs.existsSync(lockPath), true);
    releaseLock(lockPath);
  } finally {
    fs.rmSync(parent, { recursive: true, force: true });
  }
});

test('applyMerge dry-run (default) never touches the filesystem or invokes git', () => {
  const plan = {
    dirty: [], conflicts: [], added: ['New.java'], modified: [], deleted: [], renamed: [],
  };
  const result = applyMerge('/baseline', '/working', plan, { project: 'NDC', packageName: 'Pkg', runFolder: 'RUN-1' }, {
    execFileSync: () => { throw new Error('git must never be invoked during a dry run'); },
    now: FIXED_NOW,
    apply: false,
  });
  assert.equal(result.applied, false);
  assert.ok(result.commitMessage.includes('NDC/Pkg'));
});

test('applyMerge refuses to apply when the baseline is dirty', () => {
  const plan = {
    dirty: ['baseline has uncommitted changes'], conflicts: [], added: [], modified: [], deleted: [], renamed: [],
  };
  assert.throws(
    () => applyMerge('/baseline', '/working', plan, { project: 'NDC', packageName: 'Pkg', runFolder: 'RUN-1' }, {
      execFileSync: () => '', now: FIXED_NOW, apply: true,
    }),
    /uncommitted changes/,
  );
});

test('applyMerge refuses to apply when unresolved conflicts remain', () => {
  const plan = {
    dirty: [], conflicts: ['Conflicted.java'], added: [], modified: [], deleted: [], renamed: [],
  };
  assert.throws(
    () => applyMerge('/baseline', '/working', plan, { project: 'NDC', packageName: 'Pkg', runFolder: 'RUN-1' }, {
      execFileSync: () => '', now: FIXED_NOW, apply: true,
    }),
    /unresolved conflict/,
  );
});

test('applyMerge writes added/modified files into the baseline, git-adds them, and commits, releasing the lock afterward', () => {
  const baselineDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mergeapply-baseline-'));
  const workingDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mergeapply-working-'));
  try {
    fs.writeFileSync(path.join(workingDir, 'New.java'), 'new content');
    const plan = {
      dirty: [], conflicts: [], added: ['New.java'], modified: [], deleted: [], renamed: [],
    };
    const calls = [];
    const execFileSync = (cmd, args) => { calls.push(args.join(' ')); return ''; };

    const result = applyMerge(baselineDir, workingDir, plan, { project: 'NDC', packageName: 'Pkg', runFolder: 'RUN-1' }, {
      execFileSync, now: FIXED_NOW, apply: true,
    });

    assert.equal(result.applied, true);
    assert.equal(fs.readFileSync(path.join(baselineDir, 'New.java'), 'utf8'), 'new content');
    assert.ok(calls.some((c) => c.startsWith('add --')));
    assert.ok(calls.some((c) => c.startsWith('commit -m')));
    assert.equal(fs.existsSync(path.join(baselineDir, LOCK_FILENAME)), false);
  } finally {
    fs.rmSync(baselineDir, { recursive: true, force: true });
    fs.rmSync(workingDir, { recursive: true, force: true });
  }
});
