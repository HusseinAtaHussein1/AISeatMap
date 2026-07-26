// Note on scope: git is injected, both as a fake `execFileSync` and as an explicit GitRepo handle.
// Before the two-root refactor gitUtils derived one fixed repository root from __dirname, so a test
// could not point the lifecycle at a throwaway fixture repository without either mutating this
// actual repository's git state or reworking that convention; faking was the only option. The repo
// handle is now a parameter, so a test can supply a fixture root directly — see gitUtils.test.js's
// real-repository cases. These tests keep the fake, because the pure classification/rename logic —
// the highest-risk part per the design review that shaped pipeline.md §12 — is best exercised
// directly against Map fixtures rather than through git.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  classifyChanges, detectRenames, buildDiskSnapshot, computeMergePlan, NO_GIT_WARNING,
} = require('../mergePlan');

/** A writable tool-repo handle rooted at `root`, standing in for discoverRepo's result. */
function fixtureRepo(root) {
  return {
    root: root.split(path.sep).join('/'),
    available: true,
    writable: true,
    mode: 'tool-repo',
    reason: 'test fixture',
  };
}

const UNAVAILABLE_REPO = {
  root: null, available: false, writable: false, mode: 'off', reason: 'no git in this test',
};

// ---- classifyChanges -------------------------------------------------------------------------

test('classifyChanges: unchanged file produces no classification', () => {
  const m = new Map([['a.txt', 'h1']]);
  const result = classifyChanges({ base: m, theirs: m, ours: m });
  assert.deepEqual(result, { added: [], modified: [], deleted: [], conflicts: [] });
});

test('classifyChanges: file changed only by us -> modified', () => {
  const base = new Map([['a.txt', 'h1']]);
  const theirs = new Map([['a.txt', 'h1']]);
  const ours = new Map([['a.txt', 'h2']]);
  const result = classifyChanges({ base, theirs, ours });
  assert.deepEqual(result, { added: [], modified: ['a.txt'], deleted: [], conflicts: [] });
});

test('classifyChanges: file changed only by another run since our snapshot -> left alone', () => {
  const base = new Map([['a.txt', 'h1']]);
  const theirs = new Map([['a.txt', 'h2']]); // the other run's merge already changed baseline
  const ours = new Map([['a.txt', 'h1']]); // we never touched it
  const result = classifyChanges({ base, theirs, ours });
  assert.deepEqual(result, { added: [], modified: [], deleted: [], conflicts: [] });
});

test('classifyChanges: both changed the same file differently -> conflict', () => {
  const base = new Map([['a.txt', 'h1']]);
  const theirs = new Map([['a.txt', 'h2']]);
  const ours = new Map([['a.txt', 'h3']]);
  const result = classifyChanges({ base, theirs, ours });
  assert.deepEqual(result.conflicts, ['a.txt']);
});

test('classifyChanges: we deleted a file unchanged since base -> deleted', () => {
  const base = new Map([['a.txt', 'h1']]);
  const theirs = new Map([['a.txt', 'h1']]);
  const ours = new Map();
  const result = classifyChanges({ base, theirs, ours });
  assert.deepEqual(result, { added: [], modified: [], deleted: ['a.txt'], conflicts: [] });
});

test('classifyChanges: the other run added a file after our snapshot -> left alone, not treated as our deletion', () => {
  // This is the exact silent-data-loss scenario the design review flagged: a naive two-way diff
  // of (ours-now, theirs-now) would see theirs has it and ours doesn't, and misclassify it as
  // "we deleted this" — the three-way base check must prevent that.
  const base = new Map(); // neither side had it at snapshot time
  const theirs = new Map([['new-from-other-run.txt', 'h1']]);
  const ours = new Map();
  const result = classifyChanges({ base, theirs, ours });
  assert.deepEqual(result, { added: [], modified: [], deleted: [], conflicts: [] });
});

test('classifyChanges: the other run modified a file we never had at all -> conflict, not silently dropped', () => {
  const base = new Map([['a.txt', 'h1']]);
  const theirs = new Map([['a.txt', 'h2']]);
  const ours = new Map();
  const result = classifyChanges({ base, theirs, ours });
  assert.deepEqual(result.conflicts, ['a.txt']);
});

test('classifyChanges: we added a brand new file -> added', () => {
  const base = new Map();
  const theirs = new Map();
  const ours = new Map([['new.txt', 'h1']]);
  const result = classifyChanges({ base, theirs, ours });
  assert.deepEqual(result, { added: ['new.txt'], modified: [], deleted: [], conflicts: [] });
});

test('classifyChanges: the other run deleted a file we never touched -> respected, not re-added', () => {
  const base = new Map([['a.txt', 'h1']]);
  const theirs = new Map(); // other run's merge deleted it
  const ours = new Map([['a.txt', 'h1']]); // our stale copy still has it, unchanged
  const result = classifyChanges({ base, theirs, ours });
  assert.deepEqual(result, { added: [], modified: [], deleted: [], conflicts: [] });
});

test('classifyChanges: we modified a file the other run deleted -> conflict', () => {
  const base = new Map([['a.txt', 'h1']]);
  const theirs = new Map();
  const ours = new Map([['a.txt', 'h2']]);
  const result = classifyChanges({ base, theirs, ours });
  assert.deepEqual(result.conflicts, ['a.txt']);
});

test('classifyChanges: both independently created the same new path with different content -> conflict', () => {
  const base = new Map();
  const theirs = new Map([['new.txt', 'h1']]);
  const ours = new Map([['new.txt', 'h2']]);
  const result = classifyChanges({ base, theirs, ours });
  assert.deepEqual(result.conflicts, ['new.txt']);
});

// ---- detectRenames ----------------------------------------------------------------------------

test('detectRenames: exact content match reclassifies an add+delete pair as a rename', () => {
  const theirs = new Map([['OldName.java', 'h1']]);
  const ours = new Map([['NewName.java', 'h1']]);
  const result = detectRenames({ added: ['NewName.java'], deleted: ['OldName.java'] }, { theirs, ours });
  assert.deepEqual(result, { added: [], deleted: [], renamed: [{ from: 'OldName.java', to: 'NewName.java' }] });
});

test('detectRenames: renamed AND modified content is NOT auto-detected — stays a separate add+delete', () => {
  // Documented, acceptable limitation (pipeline.md §12 Step 3): exact-hash-only rename detection,
  // not git's fuzzy similarity index. No data loss either way — just a less precise label.
  const theirs = new Map([['OldName.java', 'h1']]);
  const ours = new Map([['NewName.java', 'h2']]);
  const result = detectRenames({ added: ['NewName.java'], deleted: ['OldName.java'] }, { theirs, ours });
  assert.deepEqual(result, { added: ['NewName.java'], deleted: ['OldName.java'], renamed: [] });
});

test('detectRenames: unrelated adds/deletes with no matching content are left as-is', () => {
  const theirs = new Map([['Deleted.java', 'h1']]);
  const ours = new Map([['Added.java', 'h2']]);
  const result = detectRenames({ added: ['Added.java'], deleted: ['Deleted.java'] }, { theirs, ours });
  assert.deepEqual(result, { added: ['Added.java'], deleted: ['Deleted.java'], renamed: [] });
});

// ---- buildDiskSnapshot (real fs, faked git) ----------------------------------------------------

function fakeGitIgnoring(ignoredSuffixes) {
  return (cmd, args) => {
    if (args[0] === 'check-ignore') {
      const target = args[args.length - 1];
      const ignored = ignoredSuffixes.some((suffix) => target.endsWith(suffix));
      if (ignored) return ''; // exit 0 -> ignored
      const err = new Error('not ignored');
      err.status = 1;
      throw err;
    }
    throw new Error(`unexpected git invocation in test: ${args.join(' ')}`);
  };
}

test('buildDiskSnapshot separates tracked content from git-ignored files', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mergeplan-disk-'));
  try {
    fs.writeFileSync(path.join(dir, 'Page.java'), 'source');
    fs.mkdirSync(path.join(dir, 'target'));
    fs.writeFileSync(path.join(dir, 'target', 'Page.class'), 'binary');

    const { tracked, ignored } = buildDiskSnapshot(fixtureRepo(dir), dir, {
      execFileSync: fakeGitIgnoring(['.class']),
    });

    assert.deepEqual([...tracked.keys()], ['Page.java']);
    assert.deepEqual(ignored, ['target/Page.class']);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('buildDiskSnapshot classifies nothing as ignored when git is unavailable', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mergeplan-nogit-'));
  try {
    fs.writeFileSync(path.join(dir, 'Page.java'), 'source');
    fs.mkdirSync(path.join(dir, 'target'));
    fs.writeFileSync(path.join(dir, 'target', 'Page.class'), 'binary');

    const { tracked, ignored } = buildDiskSnapshot(UNAVAILABLE_REPO, dir, {
      execFileSync: () => { throw new Error('git must not be invoked when unavailable'); },
    });

    // Everything is tracked content: without git there is no ignore concept to consult, so the
    // build output is diffed rather than silently discarded.
    assert.deepEqual([...tracked.keys()].sort(), ['Page.java', 'target/Page.class']);
    assert.deepEqual(ignored, []);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

// ---- computeMergePlan (real fs, faked git) -----------------------------------------------------

test('computeMergePlan: fast-forward case (baseline unchanged since snapshot) uses a plain two-way diff', () => {
  const baselineDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mergeplan-baseline-'));
  const workingDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mergeplan-working-'));
  try {
    fs.writeFileSync(path.join(baselineDir, 'Existing.java'), 'v1');
    fs.writeFileSync(path.join(workingDir, 'Existing.java'), 'v1'); // unchanged
    fs.writeFileSync(path.join(workingDir, 'New.java'), 'new'); // added during generation

    const execFileSync = (cmd, args, opts) => {
      if (args[0] === 'status') return '';
      if (args[0] === 'log') return 'REF1\n';
      if (args[0] === 'check-ignore') {
        const err = new Error('not ignored');
        err.status = 1;
        throw err;
      }
      throw new Error(`unexpected git invocation: ${args.join(' ')}`);
    };

    const plan = computeMergePlan(baselineDir, workingDir, { baselineRef: 'REF1' }, {
      execFileSync, repo: fixtureRepo(baselineDir),
    });

    assert.deepEqual(plan.dirty, []);
    assert.equal(plan.baselineMoved, false);
    assert.deepEqual(plan.added, ['New.java']);
    assert.deepEqual(plan.modified, []);
    assert.deepEqual(plan.deleted, []);
    assert.deepEqual(plan.conflicts, []);
    assert.equal(plan.degradedMode, null);
    assert.deepEqual(plan.warnings, []);
  } finally {
    fs.rmSync(baselineDir, { recursive: true, force: true });
    fs.rmSync(workingDir, { recursive: true, force: true });
  }
});

test('computeMergePlan: null snapshot (first-ever promotion) treats everything present as Added, never a conflict', () => {
  const baselineDir = path.join(os.tmpdir(), 'mergeplan-baseline-missing-so-far');
  const workingDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mergeplan-working-greenfield-'));
  try {
    fs.writeFileSync(path.join(workingDir, 'Generated.java'), 'content');

    const execFileSync = (cmd, args) => {
      if (args[0] === 'status') return '';
      if (args[0] === 'log') return ''; // no commits ever touched the baseline path
      if (args[0] === 'check-ignore') {
        const err = new Error('not ignored');
        err.status = 1;
        throw err;
      }
      throw new Error(`unexpected git invocation: ${args.join(' ')}`);
    };

    const plan = computeMergePlan(baselineDir, workingDir, null, {
      execFileSync, repo: fixtureRepo(os.tmpdir()),
    });

    assert.equal(plan.currentRef, null);
    assert.equal(plan.baselineMoved, false);
    assert.deepEqual(plan.added, ['Generated.java']);
    assert.deepEqual(plan.conflicts, []);
  } finally {
    fs.rmSync(workingDir, { recursive: true, force: true });
  }
});

// ---- degraded and hard-block paths (pipeline.md §12.4) -----------------------------------------

test('computeMergePlan without git reports degradedMode and warns, rather than implying protection', () => {
  const baselineDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mergeplan-degraded-baseline-'));
  const workingDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mergeplan-degraded-working-'));
  try {
    fs.writeFileSync(path.join(baselineDir, 'Existing.java'), 'v1');
    fs.writeFileSync(path.join(workingDir, 'Existing.java'), 'v2'); // we changed it

    const plan = computeMergePlan(baselineDir, workingDir, null, {
      repo: UNAVAILABLE_REPO,
      execFileSync: () => { throw new Error('git must not be invoked when unavailable'); },
    });

    assert.equal(plan.degradedMode, 'no-git');
    assert.ok(plan.warnings.some((w) => w.includes(NO_GIT_WARNING)), 'the exact §12.4 wording must be present');
    assert.equal(plan.repo.available, false);
    // The diff itself still works: base == theirs, so our edit reads as a modification.
    assert.deepEqual(plan.modified, ['Existing.java']);
    assert.deepEqual(plan.conflicts, [], 'degraded is not the same as conflicted');
    assert.deepEqual(plan.dirty, [], 'no uncommitted-change concept exists without git');
  } finally {
    fs.rmSync(baselineDir, { recursive: true, force: true });
    fs.rmSync(workingDir, { recursive: true, force: true });
  }
});

test('computeMergePlan hard-blocks when the snapshot had git but git is gone now', () => {
  const baselineDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mergeplan-lostgit-baseline-'));
  const workingDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mergeplan-lostgit-working-'));
  try {
    fs.writeFileSync(path.join(baselineDir, 'A.java'), 'v1');

    const plan = computeMergePlan(baselineDir, workingDir, {
      baselineRef: 'REF1', gitAvailable: true, repoRoot: '/some/repo',
    }, {
      repo: UNAVAILABLE_REPO,
      execFileSync: () => { throw new Error('git must not be invoked when unavailable'); },
    });

    assert.ok(plan.conflicts.includes('git-protection-lost'));
    assert.ok(plan.warnings.some((w) => w.includes('cannot be verified')));
  } finally {
    fs.rmSync(baselineDir, { recursive: true, force: true });
    fs.rmSync(workingDir, { recursive: true, force: true });
  }
});

test('computeMergePlan hard-blocks when the baseline changed repository mid-run', () => {
  const baselineDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mergeplan-identity-baseline-'));
  const workingDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mergeplan-identity-working-'));
  try {
    fs.writeFileSync(path.join(baselineDir, 'A.java'), 'v1');

    const execFileSync = (cmd, args) => {
      if (args[0] === 'status') return '';
      if (args[0] === 'log') return 'REF1\n';
      if (args[0] === 'check-ignore') { const e = new Error('not ignored'); e.status = 1; throw e; }
      throw new Error(`unexpected: ${args.join(' ')}`);
    };

    const plan = computeMergePlan(baselineDir, workingDir, {
      baselineRef: 'REF1', gitAvailable: true, repoRoot: '/a-different/repo',
    }, { execFileSync, repo: fixtureRepo(baselineDir) });

    assert.ok(plan.conflicts.includes('repo-identity-changed'));
    assert.ok(plan.warnings.some((w) => w.includes('repository changed mid-run')));
  } finally {
    fs.rmSync(baselineDir, { recursive: true, force: true });
    fs.rmSync(workingDir, { recursive: true, force: true });
  }
});
