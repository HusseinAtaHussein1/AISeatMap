// Characterization tests — Phase 0 of the installable-tool refactor.
//
// These pin the CURRENT, pre-refactor behavior of REPO_ROOT: every git command in gitUtils.js is
// aimed at `path.join(__dirname, '..', '..', '..')`, i.e. this platform's own repository root, and
// every caller converts absolute paths to paths relative to it. That is exactly what makes the
// tool unsafe to install into a host project (it would run `git commit` in the host's repository),
// so the behavior is captured here BEFORE it changes.
//
// Phase 3 replaces REPO_ROOT with an explicit GitRepo handle. When it does, the tests below are
// expected to fail — that failure is the signal, not a regression. Each one names the Phase 3
// replacement it should be rewritten to assert.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const gitUtils = require('../gitUtils');
const { copyBaselineIntoRun } = require('../baselineCopy');

const FIXED_NOW = new Date('2026-07-26T12:00:00.000Z');
const PLATFORM_ROOT = path.join(__dirname, '..', '..', '..', '..');

/** Records every execFileSync call so we can assert on the `cwd` each git command was aimed at. */
function recordingGit(responses = {}) {
  const calls = [];
  const execFileSync = (cmd, args, opts = {}) => {
    calls.push({ cmd, args, cwd: opts.cwd });
    const key = args[0];
    if (typeof responses[key] === 'function') return responses[key](args);
    return responses[key] !== undefined ? responses[key] : '';
  };
  return { calls, execFileSync };
}

// ---------------------------------------------------------------------------------------------
// 1. REPO_ROOT itself
// ---------------------------------------------------------------------------------------------

test('CHARACTERIZATION: REPO_ROOT is derived from __dirname, three levels up', () => {
  // Phase 3: this export is deleted. Replacement — discoverRepo(absPath, deps) returns a GitRepo
  // whose .root comes from `git rev-parse --show-toplevel`, never from __dirname.
  assert.equal(gitUtils.REPO_ROOT, PLATFORM_ROOT);
  assert.equal(path.basename(gitUtils.REPO_ROOT), 'agentic-ai-testing-platform-2');
});

test('CHARACTERIZATION: REPO_ROOT is exported as part of the public API', () => {
  // Phase 3: `REPO_ROOT` must no longer appear in module.exports.
  assert.ok(Object.prototype.hasOwnProperty.call(gitUtils, 'REPO_ROOT'));
});

// ---------------------------------------------------------------------------------------------
// 2. Every read aims its cwd at REPO_ROOT
// ---------------------------------------------------------------------------------------------

test('CHARACTERIZATION: every gitUtils read runs with cwd pinned to REPO_ROOT', () => {
  // Phase 3: cwd becomes repo.root, and each of these takes (repo, absPath, deps).
  const cases = [
    ['getPathScopedRef', () => gitUtils.getPathScopedRef('some/rel/path', recorded)],
    ['isPathClean', () => gitUtils.isPathClean('some/rel/path', recorded)],
    ['showFileAtRef', () => gitUtils.showFileAtRef('abc123', 'some/rel/path', recorded)],
    ['listFilesAtRef', () => gitUtils.listFilesAtRef('abc123', 'some/rel/dir', recorded)],
  ];

  let recorded;
  for (const [name, invoke] of cases) {
    recorded = recordingGit();
    invoke();
    assert.equal(recorded.calls.length, 1, `${name} should issue exactly one git call`);
    assert.equal(recorded.calls[0].cwd, gitUtils.REPO_ROOT, `${name} must currently aim at REPO_ROOT`);
  }
});

test('CHARACTERIZATION: reads accept a REPO_ROOT-relative path, not an absolute one', () => {
  // Phase 3: signatures take ABSOLUTE paths plus a repo handle; relInRepo(repo, abs) does the
  // conversion, and throws RepoBoundaryError when the path escapes repo.root.
  const recorded = recordingGit({ log: 'deadbeef\n' });
  const ref = gitUtils.getPathScopedRef('platform_core_data/workspace/automation', recorded);

  assert.equal(ref, 'deadbeef');
  assert.deepEqual(recorded.calls[0].args, [
    'log', '-1', '--format=%H', '--', 'platform_core_data/workspace/automation',
  ]);
});

test('CHARACTERIZATION: getPathScopedRef is path-scoped, never a bare rev-parse HEAD', () => {
  // This property must SURVIVE Phase 3 unchanged — a bare HEAD would make any unrelated commit
  // in a monorepo look like a change to this specific baseline (pipeline.md §12.3).
  const recorded = recordingGit({ log: '' });
  gitUtils.getPathScopedRef('a/b', recorded);

  assert.deepEqual(recorded.calls[0].args.slice(0, 3), ['log', '-1', '--format=%H']);
  assert.ok(recorded.calls[0].args.includes('--'), 'must use a -- pathspec separator');
  assert.ok(!recorded.calls[0].args.includes('rev-parse'));
});

// ---------------------------------------------------------------------------------------------
// 3. Every write aims its cwd at REPO_ROOT — the actual danger
// ---------------------------------------------------------------------------------------------

test('CHARACTERIZATION: gitAdd/gitRm/gitMv/gitCommit all write into the REPO_ROOT repository', () => {
  // THIS is the blocker the refactor exists to fix: installed into a host project, these four
  // would run against the HOST's repository. Phase 3 makes the repo an explicit argument and adds
  // assertSameRepo(), so a path outside repo.root raises RepoBoundaryError instead.
  const writes = [
    ['gitAdd', () => gitUtils.gitAdd('rel/path', recorded)],
    ['gitRm', () => gitUtils.gitRm('rel/path', recorded)],
    ['gitMv', () => gitUtils.gitMv('rel/from', 'rel/to', recorded)],
    ['gitCommit', () => gitUtils.gitCommit('msg', ['rel/path'], recorded)],
  ];

  let recorded;
  for (const [name, invoke] of writes) {
    recorded = recordingGit();
    invoke();
    assert.equal(recorded.calls[0].cwd, gitUtils.REPO_ROOT, `${name} must currently aim at REPO_ROOT`);
  }
});

test('CHARACTERIZATION: nothing today prevents a write aimed outside the platform repository', () => {
  // No boundary check exists: an absolute path from a completely different repository is passed
  // straight through to git. Phase 3 must make this throw RepoBoundaryError.
  const recorded = recordingGit();
  const foreignPath = path.join(os.tmpdir(), 'some-other-repo', 'tests', 'e2e', 'login.spec.ts');

  gitUtils.gitAdd(foreignPath, recorded); // currently succeeds — that is the bug

  assert.equal(recorded.calls[0].cwd, gitUtils.REPO_ROOT);
  assert.ok(recorded.calls[0].args.includes(foreignPath));
});

test('CHARACTERIZATION: gitCommit refuses an empty pathspec', () => {
  // This guard must SURVIVE Phase 3 verbatim — a bare `git commit` would sweep unrelated staged
  // changes into an automation-merge commit.
  assert.throws(() => gitUtils.gitCommit('msg', [], { execFileSync: () => '' }), TypeError);
  assert.throws(() => gitUtils.gitCommit('msg', null, { execFileSync: () => '' }), TypeError);
});

test('CHARACTERIZATION: gitCommit scopes the commit with a trailing -- pathspec', () => {
  // Must SURVIVE Phase 3.
  const recorded = recordingGit();
  gitUtils.gitCommit('Automation Merge: x', ['a/b', 'c/d'], recorded);

  assert.deepEqual(recorded.calls[0].args, ['commit', '-m', 'Automation Merge: x', '--', 'a/b', 'c/d']);
});

// ---------------------------------------------------------------------------------------------
// 4. isIgnored's error discipline
// ---------------------------------------------------------------------------------------------

test('CHARACTERIZATION: isIgnored maps exit 0/1 to true/false and rethrows anything else', () => {
  // Must SURVIVE Phase 3, except that it returns false when !repo.available.
  const ignored = { execFileSync: () => '' };
  assert.equal(gitUtils.isIgnored('/abs/path', ignored), true);

  const notIgnored = { execFileSync: () => { const e = new Error('no match'); e.status = 1; throw e; } };
  assert.equal(gitUtils.isIgnored('/abs/path', notIgnored), false);

  const realFailure = { execFileSync: () => { const e = new Error('not a git repo'); e.status = 128; throw e; } };
  assert.throws(() => gitUtils.isIgnored('/abs/path', realFailure), /not a git repo/);
});

test('CHARACTERIZATION: isIgnored uses --no-index so unstaged paths can be classified', () => {
  // Must SURVIVE Phase 3 — a freshly generated run working copy has never been staged.
  const recorded = recordingGit();
  gitUtils.isIgnored('/abs/path', recorded);
  assert.ok(recorded.calls[0].args.includes('--no-index'));
});

// ---------------------------------------------------------------------------------------------
// 5. Callers convert absolute paths against REPO_ROOT
// ---------------------------------------------------------------------------------------------

test('CHARACTERIZATION: copyBaselineIntoRun relativizes the baseline against REPO_ROOT', () => {
  // Phase 3: the recorded snapshot path becomes dataRoot-relative POSIX with schemaVersion 2,
  // and the git ref lookup goes through the injected repo handle.
  const baselineDir = fs.mkdtempSync(path.join(os.tmpdir(), 'char-baseline-'));
  const runRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'char-run-'));
  try {
    fs.writeFileSync(path.join(baselineDir, 'Page.java'), 'content');
    const recorded = recordingGit({ log: 'abc123\n' });

    copyBaselineIntoRun(baselineDir, path.join(runRoot, 'automation', 'tests_SHAFT'), {
      ...recorded,
      now: FIXED_NOW,
    });

    // The baseline lives in os.tmpdir(), NOT under the platform repo, so relativizing against
    // REPO_ROOT escapes it with '..' segments — and today nothing objects.
    const relPassedToGit = recorded.calls[0].args[recorded.calls[0].args.length - 1];
    assert.equal(relPassedToGit, path.relative(gitUtils.REPO_ROOT, baselineDir).split(path.sep).join('/'));
    assert.ok(relPassedToGit.startsWith('..'), 'today an escaping relative path is passed to git unchecked');
  } finally {
    fs.rmSync(baselineDir, { recursive: true, force: true });
    fs.rmSync(runRoot, { recursive: true, force: true });
  }
});

test('CHARACTERIZATION: the v1 snapshot has no schemaVersion, gitAvailable, or repoRoot fields', () => {
  // Phase 3 adds all three (schemaVersion: 2) and loadSnapshot must still accept v1.
  const baselineDir = fs.mkdtempSync(path.join(os.tmpdir(), 'char-snap-baseline-'));
  const runRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'char-snap-run-'));
  try {
    fs.writeFileSync(path.join(baselineDir, 'a.txt'), 'x');
    const result = copyBaselineIntoRun(baselineDir, path.join(runRoot, 'automation', 'tests_X'), {
      execFileSync: (cmd, args) => (args[0] === 'log' ? 'ref1\n' : ''),
      now: FIXED_NOW,
    });

    const snapshot = JSON.parse(fs.readFileSync(result.snapshotPath, 'utf8'));
    assert.equal(snapshot.schemaVersion, undefined);
    assert.equal(snapshot.gitAvailable, undefined);
    assert.equal(snapshot.repoRoot, undefined);
    assert.equal(snapshot.baselineRef, 'ref1');
    assert.ok(typeof snapshot.baselinePath === 'string');
  } finally {
    fs.rmSync(baselineDir, { recursive: true, force: true });
    fs.rmSync(runRoot, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------------------------
// 6. Real-git proof: a commit lands in whichever repo REPO_ROOT names
// ---------------------------------------------------------------------------------------------

test('CHARACTERIZATION: with real git, cwd decides which repository receives the commit', () => {
  // Not a test of gitUtils' code but of the premise the refactor rests on: `cwd` alone determines
  // the target repository. Two independent repos, the same relative path, same git invocation —
  // only the cwd differs, and the commit lands wherever cwd pointed. This is why REPO_ROOT
  // (derived from __dirname) is a correctness bug once the tool is installed elsewhere.
  const { execFileSync } = require('child_process');
  const hostRepo = fs.mkdtempSync(path.join(os.tmpdir(), 'char-host-repo-'));
  const toolRepo = fs.mkdtempSync(path.join(os.tmpdir(), 'char-tool-repo-'));

  const initRepo = (dir) => {
    execFileSync('git', ['init', '-q'], { cwd: dir });
    execFileSync('git', ['config', 'user.email', 'test@example.com'], { cwd: dir });
    execFileSync('git', ['config', 'user.name', 'Test'], { cwd: dir });
    execFileSync('git', ['config', 'commit.gpgsign', 'false'], { cwd: dir });
  };

  try {
    initRepo(hostRepo);
    initRepo(toolRepo);

    for (const dir of [hostRepo, toolRepo]) {
      fs.writeFileSync(path.join(dir, 'file.txt'), 'x');
      execFileSync('git', ['add', '--', 'file.txt'], { cwd: dir });
    }

    // Commit in ONE repo only, exactly as gitCommit does — array args, -- pathspec, explicit cwd.
    execFileSync('git', ['commit', '-m', 'landed here', '--', 'file.txt'], { cwd: toolRepo });

    const countCommits = (dir) => {
      try {
        return execFileSync('git', ['rev-list', '--count', 'HEAD'], { cwd: dir, encoding: 'utf8' }).trim();
      } catch {
        return '0'; // no HEAD yet => zero commits
      }
    };

    assert.equal(countCommits(toolRepo), '1', 'the commit must land in the repo named by cwd');
    assert.equal(countCommits(hostRepo), '0', 'the other repository must be untouched');
  } finally {
    fs.rmSync(hostRepo, { recursive: true, force: true });
    fs.rmSync(toolRepo, { recursive: true, force: true });
  }
});
