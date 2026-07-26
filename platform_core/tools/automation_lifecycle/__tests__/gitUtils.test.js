const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  gitCommit, gitAdd, gitRm, gitMv, discoverRepo, relInRepo, assertSameRepo,
  getPathScopedRef, isPathClean, isIgnored, showFileAtRef, listFilesAtRef,
  GitUnavailableError, GitWriteForbiddenError, RepoBoundaryError,
} = require('../gitUtils');

/** A writable tool-repo handle rooted at `root`. */
function toolRepo(root) {
  return {
    root: root.split(path.sep).join('/'),
    available: true,
    writable: true,
    mode: 'tool-repo',
    reason: 'test fixture',
  };
}

const UNAVAILABLE = {
  root: null, available: false, writable: false, mode: 'off', reason: 'no git in this test',
};

const READ_ONLY = {
  root: '/repo', available: true, writable: false, mode: 'host-repo', reason: 'read-only in this test',
};

function recorder(responses = {}) {
  const calls = [];
  const execFileSync = (cmd, args, opts = {}) => {
    calls.push({ args, cwd: opts.cwd, joined: args.join(' ') });
    const key = args[0];
    if (typeof responses[key] === 'function') return responses[key](args);
    return responses[key] !== undefined ? responses[key] : '';
  };
  return { calls, execFileSync };
}

// -------------------------------------------------------------------------------------------------
// gitCommit — the pathspec guarantee (must survive every refactor)
// -------------------------------------------------------------------------------------------------

test('gitCommit refuses to run without an explicit, non-empty pathspec — never a bare `git commit`', () => {
  // A repository's own index can (and, during this feature's own rollout, did) hold unrelated
  // staged changes from other work at the moment a merge runs. A bare `git commit` would sweep
  // those into the automation-merge commit. gitCommit must always be pathspec-scoped.
  const repo = toolRepo('/repo');
  const boom = { execFileSync: () => { throw new Error('must not be invoked'); } };
  assert.throws(() => gitCommit(repo, 'msg', [], boom), TypeError);
  assert.throws(() => gitCommit(repo, 'msg', undefined, boom), TypeError);
});

test('gitCommit passes a trailing pathspec after `--`, restricting the commit to those paths', () => {
  const root = path.resolve('/repo');
  const repo = toolRepo(root);
  const rec = recorder();

  gitCommit(repo, 'msg', [path.join(root, 'a', 'b.txt'), path.join(root, 'a', 'c.txt')], rec);

  assert.deepEqual(rec.calls[0].args, ['commit', '-m', 'msg', '--', 'a/b.txt', 'a/c.txt']);
  assert.equal(rec.calls[0].cwd, repo.root, 'the commit must be aimed at repo.root');
});

// -------------------------------------------------------------------------------------------------
// The repository boundary — what makes the tool safe to install in someone else's repository
// -------------------------------------------------------------------------------------------------

test('relInRepo converts an absolute path and rejects one that escapes the repository', () => {
  const root = path.resolve('/repo');
  const repo = toolRepo(root);

  assert.equal(relInRepo(repo, path.join(root, 'a', 'b.txt')), 'a/b.txt');
  assert.equal(relInRepo(repo, root), '.');
  assert.throws(() => relInRepo(repo, path.resolve('/elsewhere/x.txt')), RepoBoundaryError);
});

test('every write refuses a path outside its repository', () => {
  // THE guarantee: generated automation lives in the Target Project, and no git write may reach it.
  const root = path.resolve('/repo');
  const repo = toolRepo(root);
  const target = path.resolve('/my-app/tests/e2e/login.spec.ts');
  const boom = { execFileSync: () => { throw new Error('git must not be invoked past the boundary check'); } };

  assert.throws(() => gitAdd(repo, target, boom), RepoBoundaryError);
  assert.throws(() => gitRm(repo, target, boom), RepoBoundaryError);
  assert.throws(() => gitMv(repo, path.join(root, 'a'), target, boom), RepoBoundaryError);
  assert.throws(() => gitCommit(repo, 'msg', [target], boom), RepoBoundaryError);
});

test('assertSameRepo passes for in-repo paths and throws on the first escaping one', () => {
  const root = path.resolve('/repo');
  const repo = toolRepo(root);
  assert.doesNotThrow(() => assertSameRepo(repo, [path.join(root, 'a'), path.join(root, 'b')]));
  assert.throws(() => assertSameRepo(repo, [path.join(root, 'a'), path.resolve('/x')]), RepoBoundaryError);
});

// -------------------------------------------------------------------------------------------------
// Honest degradation — reads return documented values, writes throw
// -------------------------------------------------------------------------------------------------

test('reads return their documented "no git" value when the repository is unavailable', () => {
  const boom = { execFileSync: () => { throw new Error('git must not be invoked when unavailable'); } };

  assert.equal(getPathScopedRef(UNAVAILABLE, '/x', boom), null);
  assert.equal(isPathClean(UNAVAILABLE, '/x', boom), true);
  assert.equal(isIgnored(UNAVAILABLE, '/x', boom), false);
  assert.equal(showFileAtRef(UNAVAILABLE, 'ref', '/x', boom), null);
  assert.deepEqual(listFilesAtRef(UNAVAILABLE, 'ref', '/x', boom), []);
});

test('every write throws when the repository is unavailable or not writable', () => {
  const boom = { execFileSync: () => { throw new Error('must not be invoked'); } };
  assert.throws(() => gitAdd(UNAVAILABLE, '/x', boom), GitUnavailableError);
  assert.throws(() => gitRm(UNAVAILABLE, '/x', boom), GitUnavailableError);
  assert.throws(() => gitMv(UNAVAILABLE, '/x', '/y', boom), GitUnavailableError);
  assert.throws(() => gitCommit(UNAVAILABLE, 'msg', ['/x'], boom), GitUnavailableError);

  assert.throws(() => gitAdd(READ_ONLY, '/repo/x', boom), GitWriteForbiddenError);
  assert.throws(() => gitCommit(READ_ONLY, 'msg', ['/repo/x'], boom), GitWriteForbiddenError);
});

// -------------------------------------------------------------------------------------------------
// host-repo commit restriction
// -------------------------------------------------------------------------------------------------

test('host-repo mode confines a commit to dataRoot', () => {
  const root = path.resolve('/my-app');
  const dataRoot = path.join(root, 'agentic-testing-tool', 'platform_core_data');
  const repo = { ...toolRepo(root), mode: 'host-repo' };
  const rec = recorder();

  // Inside dataRoot: allowed.
  gitCommit(repo, 'msg', [path.join(dataRoot, 'workspace', 'a.md')], { ...rec, dataRoot });
  assert.equal(rec.calls.length, 1);

  // Inside the repository but outside dataRoot: refused, because that is the team's own code.
  assert.throws(
    () => gitCommit(repo, 'msg', [path.join(root, 'tests', 'e2e', 'a.spec.ts')], { ...recorder(), dataRoot }),
    GitWriteForbiddenError,
  );
});

test('host-repo mode refuses to commit without a configured dataRoot boundary', () => {
  const repo = { ...toolRepo(path.resolve('/my-app')), mode: 'host-repo' };
  assert.throws(
    () => gitCommit(repo, 'msg', [path.resolve('/my-app/x.md')], recorder()),
    /without a configured dataRoot/,
  );
});

test('commitBaseline:false blocks the commit in host-repo mode', () => {
  const root = path.resolve('/my-app');
  const dataRoot = path.join(root, 'tool', 'platform_core_data');
  const repo = { ...toolRepo(root), mode: 'host-repo' };
  assert.throws(
    () => gitCommit(repo, 'msg', [path.join(dataRoot, 'a.md')], {
      ...recorder(), dataRoot, commitBaseline: false,
    }),
    /commitBaseline is false/,
  );
});

test('tool-repo mode applies no dataRoot restriction', () => {
  const root = path.resolve('/tool');
  const rec = recorder();
  assert.doesNotThrow(() => gitCommit(toolRepo(root), 'msg', [path.join(root, 'anything.md')], rec));
  assert.equal(rec.calls.length, 1);
});

// -------------------------------------------------------------------------------------------------
// Read semantics preserved from before the refactor
// -------------------------------------------------------------------------------------------------

test('getPathScopedRef stays path-scoped — never a bare rev-parse HEAD', () => {
  const root = path.resolve('/repo');
  const rec = recorder({ log: 'deadbeef\n' });
  const ref = getPathScopedRef(toolRepo(root), path.join(root, 'baseline'), rec);

  assert.equal(ref, 'deadbeef');
  assert.deepEqual(rec.calls[0].args, ['log', '-1', '--format=%H', '--', 'baseline']);
  assert.ok(!rec.calls[0].joined.includes('rev-parse'));
});

test('getPathScopedRef maps empty output to null (a never-committed baseline)', () => {
  const root = path.resolve('/repo');
  assert.equal(getPathScopedRef(toolRepo(root), path.join(root, 'b'), recorder({ log: '' })), null);
});

test('isIgnored maps exit 0/1 to true/false and rethrows anything else', () => {
  const repo = toolRepo(path.resolve('/repo'));
  assert.equal(isIgnored(repo, '/repo/x', { execFileSync: () => '' }), true);

  const notIgnored = { execFileSync: () => { const e = new Error('no match'); e.status = 1; throw e; } };
  assert.equal(isIgnored(repo, '/repo/x', notIgnored), false);

  const realFailure = { execFileSync: () => { const e = new Error('fatal: bad repo'); e.status = 128; throw e; } };
  assert.throws(() => isIgnored(repo, '/repo/x', realFailure), /bad repo/);
});

test('isIgnored uses --no-index so a never-staged path can still be classified', () => {
  const rec = recorder();
  isIgnored(toolRepo(path.resolve('/repo')), '/repo/x', rec);
  assert.ok(rec.calls[0].args.includes('--no-index'));
});

test('showFileAtRef maps exit 128 to null and accepts a repository-relative path', () => {
  const repo = toolRepo(path.resolve('/repo'));
  const missing = { execFileSync: () => { const e = new Error('bad object'); e.status = 128; throw e; } };
  assert.equal(showFileAtRef(repo, 'ref', 'a/b.txt', missing), null);

  const rec = recorder({ show: () => Buffer.from('hi') });
  assert.equal(showFileAtRef(repo, 'ref', 'a/b.txt', rec).toString(), 'hi');
  assert.deepEqual(rec.calls[0].args, ['show', 'ref:a/b.txt']);
});

test('listFilesAtRef strips the directory prefix from each entry', () => {
  const root = path.resolve('/repo');
  const rec = recorder({ 'ls-tree': 'pkg/A.java\npkg/sub/B.java\n' });
  const files = listFilesAtRef(toolRepo(root), 'ref', path.join(root, 'pkg'), rec);
  assert.deepEqual(files, ['A.java', 'sub/B.java']);
});

// -------------------------------------------------------------------------------------------------
// discoverRepo
// -------------------------------------------------------------------------------------------------

test('discoverRepo returns unavailable for gitMode "off" without invoking git', () => {
  const repo = discoverRepo('/anywhere', {
    gitMode: 'off',
    execFileSync: () => { throw new Error('git must not be invoked when gitMode is off'); },
  });
  assert.equal(repo.available, false);
  assert.equal(repo.mode, 'off');
  assert.match(repo.reason, /git\.mode is "off"/);
});

test('discoverRepo returns unavailable, with a remedy, when no repository governs the path', () => {
  const repo = discoverRepo('/anywhere', {
    execFileSync: () => { const e = new Error('not a git repository'); e.status = 128; throw e; },
  });
  assert.equal(repo.available, false);
  assert.equal(repo.root, null);
  assert.match(repo.reason, /No git repository governs/);
  assert.match(repo.reason, /--git-mode tool-repo/, 'the reason must name the fix');
});

test('discoverRepo detects a gitignored dataRoot and degrades instead of reporting vacuous cleanliness', () => {
  // The trap: `git status --porcelain -- <ignored path>` is empty, so an untracked baseline reads
  // as CLEAN, and `git log -1 -- <path>` is empty, so every merge looks like a first promotion.
  const repo = discoverRepo('/my-app/tool/platform_core_data/workspace', {
    dataRoot: '/my-app/tool/platform_core_data',
    execFileSync: (cmd, args) => {
      if (args[0] === 'rev-parse') return '/my-app\n';
      if (args[0] === 'check-ignore') return ''; // exit 0 => ignored
      throw new Error(`unexpected: ${args.join(' ')}`);
    },
  });

  assert.equal(repo.available, false);
  assert.equal(repo.writable, false);
  assert.match(repo.reason, /is gitignored by the repository/);
  assert.match(repo.reason, /--git-mode tool-repo/);
});

test('discoverRepo reports available and writable for a normal repository', () => {
  const repo = discoverRepo('/tool/platform_core_data', {
    dataRoot: '/tool/platform_core_data',
    gitMode: 'tool-repo',
    execFileSync: (cmd, args) => {
      if (args[0] === 'rev-parse') return '/tool\n';
      if (args[0] === 'check-ignore') { const e = new Error('not ignored'); e.status = 1; throw e; }
      throw new Error(`unexpected: ${args.join(' ')}`);
    },
  });
  assert.equal(repo.available, true);
  assert.equal(repo.writable, true);
  assert.equal(repo.mode, 'tool-repo');
  assert.equal(repo.root, '/tool');
});

test('discoverRepo works against a real repository, and for a baseline that does not exist yet', () => {
  const { execFileSync } = require('child_process');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gu-real-'));
  try {
    execFileSync('git', ['init', '-q'], { cwd: dir });
    const notYetCreated = path.join(dir, 'workspace', 'automation', 'tests_SHAFT');

    const repo = discoverRepo(notYetCreated, { execFileSync, dataRoot: dir });

    assert.equal(repo.available, true, 'a not-yet-created baseline still resolves via its ancestor');
    assert.equal(repo.root, fs.realpathSync(dir).split(path.sep).join('/'));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
