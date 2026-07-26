// Two-root invariants — the guard that replaces Phase 0's characterization tests.
//
// Those tests pinned the pre-refactor behavior (`REPO_ROOT` derived from `__dirname`, every git
// command aimed at this platform's own repository) so the refactor could not change it silently.
// They have served that purpose and failed on cue. These take over, asserting the properties that
// must now hold forever — the ones whose absence made the tool unsafe to install in a host repo.
//
// See git history at 6fdeab1 for the characterization tests themselves.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const gitUtils = require('../gitUtils');
const lifecycle = require('../index');

// -------------------------------------------------------------------------------------------------
// 1. No module may derive a repository root from its own location
// -------------------------------------------------------------------------------------------------

test('gitUtils no longer exports REPO_ROOT', () => {
  assert.equal(gitUtils.REPO_ROOT, undefined);
  assert.ok(!Object.prototype.hasOwnProperty.call(gitUtils, 'REPO_ROOT'));
});

test('no automation_lifecycle module derives a root from __dirname', () => {
  // The whole failure mode in one assertion: a root computed from the module's own location is
  // correct only while the tool lives in the repository it operates on.
  const dir = path.join(__dirname, '..');
  const offenders = [];

  for (const name of fs.readdirSync(dir)) {
    if (!name.endsWith('.js')) continue;
    const source = fs.readFileSync(path.join(dir, name), 'utf8');
    // `__dirname` for locating sibling data is fine; climbing out of the package is not.
    if (/__dirname\s*,\s*'\.\.'\s*,\s*'\.\.'/.test(source) || /__dirname\s*\+\s*['"]\/\.\.\/\.\./.test(source)) {
      offenders.push(name);
    }
  }

  assert.deepEqual(offenders, [], 'these modules climb out of the package to guess a repository root');
});

test('the lifecycle barrel exposes the new repository API', () => {
  for (const fn of ['discoverRepo', 'relInRepo', 'assertSameRepo']) {
    assert.equal(typeof lifecycle[fn], 'function', `${fn} must be exported`);
  }
  for (const err of ['GitUnavailableError', 'GitWriteForbiddenError', 'RepoBoundaryError']) {
    assert.equal(typeof lifecycle[err], 'function', `${err} must be exported`);
  }
});

// -------------------------------------------------------------------------------------------------
// 2. Every git function takes an explicit repository
// -------------------------------------------------------------------------------------------------

test('every git wrapper requires a repository argument rather than assuming one', () => {
  // Called with no repo at all, a read degrades and a write throws — neither silently picks a repo.
  const boom = { execFileSync: () => { throw new Error('git must not be invoked without a repository'); } };

  assert.equal(gitUtils.getPathScopedRef(null, '/x', boom), null);
  assert.equal(gitUtils.isPathClean(null, '/x', boom), true);
  assert.equal(gitUtils.isIgnored(null, '/x', boom), false);
  assert.equal(gitUtils.showFileAtRef(null, 'ref', '/x', boom), null);
  assert.deepEqual(gitUtils.listFilesAtRef(null, 'ref', '/x', boom), []);

  assert.throws(() => gitUtils.gitAdd(null, '/x', boom), gitUtils.GitUnavailableError);
  assert.throws(() => gitUtils.gitRm(null, '/x', boom), gitUtils.GitUnavailableError);
  assert.throws(() => gitUtils.gitMv(null, '/x', '/y', boom), gitUtils.GitUnavailableError);
  assert.throws(() => gitUtils.gitCommit(null, 'm', ['/x'], boom), gitUtils.GitUnavailableError);
});

// -------------------------------------------------------------------------------------------------
// 3. The properties that must survive every future refactor
// -------------------------------------------------------------------------------------------------

test('gitCommit is always pathspec-scoped and never a bare commit', () => {
  const root = path.resolve('/repo');
  const repo = {
    root: root.split(path.sep).join('/'), available: true, writable: true, mode: 'tool-repo', reason: 't',
  };

  assert.throws(() => gitUtils.gitCommit(repo, 'm', [], { execFileSync: () => '' }), TypeError);

  const args = [];
  gitUtils.gitCommit(repo, 'm', [path.join(root, 'a.txt')], {
    execFileSync: (cmd, a) => { args.push(a); return ''; },
  });
  assert.ok(args[0].includes('--'), 'a -- pathspec separator is mandatory');
  assert.deepEqual(args[0], ['commit', '-m', 'm', '--', 'a.txt']);
});

test('getPathScopedRef stays path-scoped, never a bare rev-parse HEAD', () => {
  const root = path.resolve('/repo');
  const repo = {
    root: root.split(path.sep).join('/'), available: true, writable: true, mode: 'tool-repo', reason: 't',
  };
  const args = [];
  gitUtils.getPathScopedRef(repo, path.join(root, 'baseline'), {
    execFileSync: (cmd, a) => { args.push(a); return 'ref\n'; },
  });
  assert.deepEqual(args[0], ['log', '-1', '--format=%H', '--', 'baseline']);
});

// -------------------------------------------------------------------------------------------------
// 4. The end-to-end property, with real git: a commit lands only where it was aimed
// -------------------------------------------------------------------------------------------------

test('a commit lands in the repository the handle names, and nowhere else', () => {
  const { execFileSync } = require('child_process');
  const hostRepo = fs.mkdtempSync(path.join(os.tmpdir(), 'tri-host-'));
  const toolRepo = fs.mkdtempSync(path.join(os.tmpdir(), 'tri-tool-'));

  const initRepo = (dir) => {
    execFileSync('git', ['init', '-q'], { cwd: dir });
    execFileSync('git', ['config', 'user.email', 'test@example.com'], { cwd: dir });
    execFileSync('git', ['config', 'user.name', 'Test'], { cwd: dir });
    execFileSync('git', ['config', 'commit.gpgsign', 'false'], { cwd: dir });
  };
  const countCommits = (dir) => {
    try {
      return Number(execFileSync('git', ['rev-list', '--count', 'HEAD'], { cwd: dir, encoding: 'utf8' }).trim());
    } catch {
      return 0;
    }
  };

  try {
    initRepo(hostRepo);
    initRepo(toolRepo);

    const repo = gitUtils.discoverRepo(toolRepo, { execFileSync, dataRoot: toolRepo });
    assert.equal(repo.available, true);

    const file = path.join(toolRepo, 'artifact.md');
    fs.writeFileSync(file, '# artifact\n');
    gitUtils.gitAdd(repo, file, { execFileSync });
    gitUtils.gitCommit(repo, 'Automation Merge: test', [file], { execFileSync });

    assert.equal(countCommits(toolRepo), 1, 'the named repository receives the commit');
    assert.equal(countCommits(hostRepo), 0, 'no other repository is touched');

    // And a path in the other repository is refused outright.
    const foreign = path.join(hostRepo, 'app.js');
    fs.writeFileSync(foreign, 'const a = 1;\n');
    assert.throws(() => gitUtils.gitAdd(repo, foreign, { execFileSync }), gitUtils.RepoBoundaryError);
    assert.equal(countCommits(hostRepo), 0);
  } finally {
    fs.rmSync(hostRepo, { recursive: true, force: true });
    fs.rmSync(toolRepo, { recursive: true, force: true });
  }
});
