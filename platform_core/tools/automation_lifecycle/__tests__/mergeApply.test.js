const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  acquireLock, releaseLock, buildCommitMessage, applyMerge, LOCK_FILENAME,
} = require('../mergeApply');
const { RepoBoundaryError } = require('../gitUtils');

const FIXED_NOW = new Date('2026-07-24T12:00:00.000Z');

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

test('buildCommitMessage summarizes added/modified/deleted/renamed counts', () => {
  const msg = buildCommitMessage('NDC', 'tests_SHAFT', 'RUN-20260712-001', {
    added: ['a', 'b'], modified: ['c'], deleted: [], renamed: [{ from: 'x', to: 'y' }],
  });
  assert.match(msg, /NDC\/tests_SHAFT/);
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
    const baselineDir = path.join(parent, 'not-created-yet', 'tests_SHAFT');
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
      execFileSync, now: FIXED_NOW, apply: true, repo: fixtureRepo(baselineDir),
    });

    assert.equal(result.applied, true);
    assert.equal(result.committed, true);
    assert.equal(fs.readFileSync(path.join(baselineDir, 'New.java'), 'utf8'), 'new content');
    assert.ok(calls.some((c) => c.startsWith('add --')));
    assert.ok(calls.some((c) => c.startsWith('commit -m')));
    assert.equal(fs.existsSync(path.join(baselineDir, LOCK_FILENAME)), false);
  } finally {
    fs.rmSync(baselineDir, { recursive: true, force: true });
    fs.rmSync(workingDir, { recursive: true, force: true });
  }
});

// -------------------------------------------------------------------------------------------------
// The two-root guarantee, against real git repositories
// -------------------------------------------------------------------------------------------------

function initRepo(dir) {
  const { execFileSync } = require('child_process');
  execFileSync('git', ['init', '-q'], { cwd: dir });
  execFileSync('git', ['config', 'user.email', 'test@example.com'], { cwd: dir });
  execFileSync('git', ['config', 'user.name', 'Test'], { cwd: dir });
  execFileSync('git', ['config', 'commit.gpgsign', 'false'], { cwd: dir });
}

function countCommits(dir) {
  const { execFileSync } = require('child_process');
  try {
    return Number(execFileSync('git', ['rev-list', '--count', 'HEAD'], { cwd: dir, encoding: 'utf8' }).trim());
  } catch {
    return 0; // no HEAD yet => no commits
  }
}

test('a real merge commits into the tool repository and leaves the host repository untouched', () => {
  // THE regression this whole refactor exists to prevent: before it, gitUtils aimed every command at
  // a REPO_ROOT derived from __dirname, so an installed tool would have committed into the host's
  // history. Here the baseline lives in its own nested repository, and the host must stay clean.
  const { execFileSync } = require('child_process');
  const host = fs.mkdtempSync(path.join(os.tmpdir(), 'ma-host-'));
  const workingDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ma-working-'));
  try {
    initRepo(host);
    fs.writeFileSync(path.join(host, 'app.js'), 'const app = 1;\n');
    // What `init --git-mode tool-repo` writes into the host: the tool folder is the host's business
    // to ignore, so the host's working tree stays clean while the tool versions its own artifacts.
    fs.writeFileSync(path.join(host, '.gitignore'), 'node_modules/\nagentic-testing-tool/\n');
    execFileSync('git', ['add', '-A'], { cwd: host });
    execFileSync('git', ['commit', '-q', '-m', 'host initial'], { cwd: host });
    const hostCommitsBefore = countCommits(host);

    // The tool folder, with its own nested repository (the `--git-mode tool-repo` default).
    const dataRoot = path.join(host, 'agentic-testing-tool', 'platform_core_data');
    const baselineDir = path.join(dataRoot, 'workspace', 'automation', 'shaft', 'tests_SHAFT');
    fs.mkdirSync(baselineDir, { recursive: true });
    initRepo(path.join(host, 'agentic-testing-tool'));

    fs.writeFileSync(path.join(workingDir, 'LoginTest.java'), 'public class LoginTest {}\n');
    const plan = {
      dirty: [], conflicts: [], added: ['LoginTest.java'], modified: [], deleted: [], renamed: [],
    };

    const result = applyMerge(baselineDir, workingDir, plan, {
      project: 'MyApp', packageName: 'tests_SHAFT', runFolder: 'RUN-1',
    }, {
      execFileSync, now: FIXED_NOW, apply: true, dataRoot, gitMode: 'tool-repo',
    });

    assert.equal(result.applied, true);
    assert.equal(result.committed, true);
    assert.equal(
      fs.readFileSync(path.join(baselineDir, 'LoginTest.java'), 'utf8'),
      'public class LoginTest {}\n',
    );

    assert.equal(countCommits(path.join(host, 'agentic-testing-tool')), 1, 'the tool repo receives the commit');
    assert.equal(countCommits(host), hostCommitsBefore, 'the HOST repository must be untouched');
    assert.equal(
      execFileSync('git', ['status', '--porcelain'], { cwd: host, encoding: 'utf8' }).trim(),
      '',
      'the host working tree must be clean — the tool folder is gitignored by the host',
    );
  } finally {
    fs.rmSync(host, { recursive: true, force: true });
    fs.rmSync(workingDir, { recursive: true, force: true });
  }
});

test('applyMerge refuses a baseline outside the repository it holds', () => {
  // A Target Project path reaching the lifecycle must raise rather than be staged.
  const elsewhere = fs.mkdtempSync(path.join(os.tmpdir(), 'ma-elsewhere-'));
  const workingDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ma-w-'));
  try {
    const plan = {
      dirty: [], conflicts: [], added: [], modified: [], deleted: [], renamed: [],
    };
    assert.throws(
      () => applyMerge(elsewhere, workingDir, plan, { project: 'P', packageName: 'K', runFolder: 'R' }, {
        execFileSync: () => { throw new Error('git must not be invoked past the boundary check'); },
        now: FIXED_NOW,
        apply: true,
        repo: fixtureRepo(path.resolve('/some/other/repo')),
      }),
      RepoBoundaryError,
    );
  } finally {
    fs.rmSync(elsewhere, { recursive: true, force: true });
    fs.rmSync(workingDir, { recursive: true, force: true });
  }
});

// -------------------------------------------------------------------------------------------------
// Degraded write paths
// -------------------------------------------------------------------------------------------------

test('a no-git plan writes files, stages nothing, and says so', () => {
  const baselineDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ma-nogit-baseline-'));
  const workingDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ma-nogit-working-'));
  try {
    fs.writeFileSync(path.join(workingDir, 'New.java'), 'content');
    const plan = {
      dirty: [], conflicts: [], added: ['New.java'], modified: [], deleted: [], renamed: [],
      degradedMode: 'no-git',
    };

    const result = applyMerge(baselineDir, workingDir, plan, {
      project: 'P', packageName: 'K', runFolder: 'R',
    }, {
      execFileSync: () => { throw new Error('git must not be invoked in no-git mode'); },
      now: FIXED_NOW,
      apply: true,
    });

    assert.equal(result.applied, true);
    assert.equal(result.committed, false, 'nothing may be reported as committed without git');
    assert.equal(result.degradedMode, 'no-git');
    assert.match(result.reason, /not committed/);
    assert.equal(fs.readFileSync(path.join(baselineDir, 'New.java'), 'utf8'), 'content');
  } finally {
    fs.rmSync(baselineDir, { recursive: true, force: true });
    fs.rmSync(workingDir, { recursive: true, force: true });
  }
});

test('a no-git plan still applies deletions and renames on the filesystem', () => {
  const baselineDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ma-nogit-fs-baseline-'));
  const workingDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ma-nogit-fs-working-'));
  try {
    fs.writeFileSync(path.join(baselineDir, 'Gone.java'), 'old');
    fs.writeFileSync(path.join(baselineDir, 'Old.java'), 'same');
    const plan = {
      dirty: [],
      conflicts: [],
      added: [],
      modified: [],
      deleted: ['Gone.java'],
      renamed: [{ from: 'Old.java', to: 'New.java' }],
      degradedMode: 'no-git',
    };

    applyMerge(baselineDir, workingDir, plan, { project: 'P', packageName: 'K', runFolder: 'R' }, {
      execFileSync: () => { throw new Error('git must not be invoked in no-git mode'); },
      now: FIXED_NOW,
      apply: true,
    });

    // `git rm`/`git mv` would have done this; without git the filesystem result must be identical.
    assert.equal(fs.existsSync(path.join(baselineDir, 'Gone.java')), false);
    assert.equal(fs.existsSync(path.join(baselineDir, 'Old.java')), false);
    assert.equal(fs.readFileSync(path.join(baselineDir, 'New.java'), 'utf8'), 'same');
  } finally {
    fs.rmSync(baselineDir, { recursive: true, force: true });
    fs.rmSync(workingDir, { recursive: true, force: true });
  }
});

test('a no-git plan skips the dirty-baseline check, since it would be vacuous', () => {
  const baselineDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ma-nogit-dirty-'));
  const workingDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ma-nogit-dirty-w-'));
  try {
    const plan = {
      dirty: ['baseline has uncommitted changes'],
      conflicts: [], added: [], modified: [], deleted: [], renamed: [],
      degradedMode: 'no-git',
    };
    assert.doesNotThrow(() => applyMerge(baselineDir, workingDir, plan, {
      project: 'P', packageName: 'K', runFolder: 'R',
    }, { execFileSync: () => '', now: FIXED_NOW, apply: true }));
  } finally {
    fs.rmSync(baselineDir, { recursive: true, force: true });
    fs.rmSync(workingDir, { recursive: true, force: true });
  }
});

test('a no-git plan still refuses to apply with unresolved conflicts', () => {
  const plan = {
    dirty: [], conflicts: ['git-protection-lost'], added: [], modified: [], deleted: [], renamed: [],
    degradedMode: 'no-git',
  };
  assert.throws(
    () => applyMerge('/baseline', '/working', plan, { project: 'P', packageName: 'K', runFolder: 'R' }, {
      execFileSync: () => '', now: FIXED_NOW, apply: true,
    }),
    /unresolved conflict/,
  );
});

test('commitBaseline:false writes the baseline but stages nothing, and names the consequence', () => {
  const baselineDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ma-nocommit-baseline-'));
  const workingDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ma-nocommit-working-'));
  try {
    fs.writeFileSync(path.join(workingDir, 'New.java'), 'content');
    const plan = {
      dirty: [], conflicts: [], added: ['New.java'], modified: [], deleted: [], renamed: [],
    };
    const calls = [];

    const result = applyMerge(baselineDir, workingDir, plan, {
      project: 'P', packageName: 'K', runFolder: 'R',
    }, {
      execFileSync: (cmd, args) => { calls.push(args.join(' ')); return ''; },
      now: FIXED_NOW,
      apply: true,
      repo: fixtureRepo(baselineDir),
      commitBaseline: false,
    });

    assert.equal(result.applied, true);
    assert.equal(result.committed, false);
    assert.match(result.reason, /commit them yourself/);
    assert.ok(!calls.some((c) => c.startsWith('commit')), 'no commit may be issued');
    assert.equal(fs.readFileSync(path.join(baselineDir, 'New.java'), 'utf8'), 'content');
  } finally {
    fs.rmSync(baselineDir, { recursive: true, force: true });
    fs.rmSync(workingDir, { recursive: true, force: true });
  }
});
