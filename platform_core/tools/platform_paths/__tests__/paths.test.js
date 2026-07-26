const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  resolveRoots,
  classifyPath,
  canRead,
  canWrite,
  assertValidInstall,
  findToolRoot,
  ConfigError,
  ENV_KEYS,
  BUILTIN_READ_DENYLIST,
  clearCache,
  _internals,
} = require('../paths');

/** Builds a throwaway installed-layout fixture: <tmp>/host/{src,tests/e2e,agentic-testing-tool}. */
function makeInstall(config = undefined, opts = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pp-'));
  const host = path.join(root, 'host');
  const tool = path.join(host, opts.toolDir || 'agentic-testing-tool');
  const dataDirname = opts.dataDirname || 'platform_core_data';

  fs.mkdirSync(path.join(host, 'src'), { recursive: true });
  fs.mkdirSync(path.join(host, 'tests', 'e2e'), { recursive: true });
  fs.mkdirSync(path.join(tool, dataDirname), { recursive: true });
  fs.mkdirSync(path.join(tool, 'platform_core', 'tools', 'platform_paths'), { recursive: true });
  fs.writeFileSync(path.join(tool, 'platform_core', 'tools', 'platform_paths', 'paths.js'), '// marker');

  const defaults = {
    configVersion: 1,
    mode: 'installed',
    targetRoot: '..',
    dataRoot: dataDirname,
    target: {
      testDirs: { e2e: 'tests/e2e' },
      automationRoot: 'tests/e2e',
      writeAllowlist: ['tests/e2e/**', 'playwright.config.ts'],
    },
    git: { mode: 'tool-repo', commitBaseline: true },
  };

  const effective = config === null ? null : { ...defaults, ...config };
  if (effective) {
    fs.writeFileSync(path.join(tool, 'platform.config.json'), JSON.stringify(effective, null, 2));
  }

  return {
    root,
    host,
    tool,
    dataRoot: path.join(tool, dataDirname),
    cleanup: () => fs.rmSync(root, { recursive: true, force: true }),
    /** Resolve from inside the fixture with a clean env. */
    resolve: (extra = {}) => resolveRoots({ startDir: tool, env: {}, fresh: true, ...extra }),
  };
}

const norm = (p) => p.split(path.sep).join('/');

// -------------------------------------------------------------------------------------------------
// Tool Root discovery
// -------------------------------------------------------------------------------------------------

test('findToolRoot walks up and stops at the first directory containing a marker', () => {
  const f = makeInstall();
  try {
    const deep = path.join(f.tool, 'platform_core', 'tools', 'platform_paths');
    const { toolRoot } = findToolRoot(deep, fs);
    assert.equal(toolRoot, norm(f.tool));
  } finally {
    f.cleanup();
  }
});

test('findToolRoot throws and lists every directory searched when no marker exists', () => {
  const bare = fs.mkdtempSync(path.join(os.tmpdir(), 'pp-bare-'));
  try {
    assert.throws(
      () => findToolRoot(bare, fs),
      (err) => {
        assert.ok(err instanceof ConfigError);
        assert.match(err.message, /Could not locate the Tool Root/);
        assert.match(err.message, /Searched:/);
        assert.ok(err.message.includes(norm(bare)));
        return true;
      },
    );
  } finally {
    fs.rmSync(bare, { recursive: true, force: true });
  }
});

test('resolveRoots never depends on process.cwd()', () => {
  const f = makeInstall();
  const originalCwd = process.cwd();
  try {
    process.chdir(os.tmpdir());
    const roots = f.resolve();
    assert.equal(roots.toolRoot, norm(f.tool));
  } finally {
    process.chdir(originalCwd);
    f.cleanup();
  }
});

// -------------------------------------------------------------------------------------------------
// Precedence
// -------------------------------------------------------------------------------------------------

test('precedence: explicit argument beats env, which beats config, which beats default', () => {
  const f = makeInstall({ dataRoot: 'from_config' });
  try {
    fs.mkdirSync(path.join(f.tool, 'from_config'), { recursive: true });
    fs.mkdirSync(path.join(f.tool, 'from_env'), { recursive: true });
    fs.mkdirSync(path.join(f.tool, 'from_arg'), { recursive: true });

    assert.equal(f.resolve().dataRoot, `${norm(f.tool)}/from_config`);

    assert.equal(
      resolveRoots({ startDir: f.tool, fresh: true, env: { [ENV_KEYS.dataRoot]: 'from_env' } }).dataRoot,
      `${norm(f.tool)}/from_env`,
    );

    assert.equal(
      resolveRoots({
        startDir: f.tool,
        fresh: true,
        env: { [ENV_KEYS.dataRoot]: 'from_env' },
        dataRoot: 'from_arg',
      }).dataRoot,
      `${norm(f.tool)}/from_arg`,
    );
  } finally {
    f.cleanup();
  }
});

test('a config-less install falls back to built-in defaults for dataRoot', () => {
  const f = makeInstall(null);
  try {
    // No config ⇒ no targetRoot ⇒ installed mode must refuse to guess.
    assert.throws(() => f.resolve(), /targetRoot is not configured/);
    const roots = f.resolve({ targetRoot: f.host });
    assert.equal(roots.dataRoot, `${norm(f.tool)}/platform_core_data`);
    assert.equal(roots.configPath, null);
  } finally {
    f.cleanup();
  }
});

test('platform.config.local.json shallow-merges over the base config', () => {
  const f = makeInstall();
  try {
    fs.writeFileSync(
      path.join(f.tool, 'platform.config.local.json'),
      JSON.stringify({ git: { mode: 'off' } }),
    );
    const roots = f.resolve();
    assert.equal(roots.git.mode, 'off');
    // Untouched keys survive the merge.
    assert.equal(roots.target.automationRoot, 'tests/e2e');
    assert.ok(roots.resolution.some((l) => l.includes('local override')));
  } finally {
    f.cleanup();
  }
});

test('resolution trace records the provenance of every decision', () => {
  const f = makeInstall();
  try {
    const trace = f.resolve().resolution.join('\n');
    for (const field of ['toolRoot', 'config', 'mode', 'dataRoot', 'targetRoot', 'git.mode', 'target writes']) {
      assert.ok(trace.includes(field), `trace should mention ${field}`);
    }
  } finally {
    f.cleanup();
  }
});

// -------------------------------------------------------------------------------------------------
// configVersion
// -------------------------------------------------------------------------------------------------

test('a missing, non-integer, or unsupported configVersion is a hard error', () => {
  for (const [value, pattern] of [
    [undefined, /missing "configVersion"/],
    ['1', /non-integer "configVersion"/],
    [2, /supports configVersion 1/],
    [0, /supports configVersion 1/],
  ]) {
    const f = makeInstall();
    try {
      const cfg = JSON.parse(fs.readFileSync(path.join(f.tool, 'platform.config.json'), 'utf8'));
      if (value === undefined) delete cfg.configVersion;
      else cfg.configVersion = value;
      fs.writeFileSync(path.join(f.tool, 'platform.config.json'), JSON.stringify(cfg));
      assert.throws(() => f.resolve(), pattern, `configVersion ${JSON.stringify(value)}`);
    } finally {
      f.cleanup();
    }
  }
});

test('a newer configVersion tells the user to upgrade; an older one to migrate', () => {
  for (const [version, pattern] of [[2, /Upgrade the platform/], [0, /agentic-testing upgrade/]]) {
    const f = makeInstall({ configVersion: version });
    try {
      assert.throws(() => f.resolve(), pattern);
    } finally {
      f.cleanup();
    }
  }
});

test('malformed JSON reports the file and refuses to guess', () => {
  const f = makeInstall();
  try {
    fs.writeFileSync(path.join(f.tool, 'platform.config.json'), '{ "configVersion": 1, ');
    assert.throws(() => f.resolve(), /is not valid JSON/);
  } finally {
    f.cleanup();
  }
});

// -------------------------------------------------------------------------------------------------
// mode conflict — a hard error, never a silent winner
// -------------------------------------------------------------------------------------------------

test('config mode and env mode disagreeing is a hard error', () => {
  const f = makeInstall({ mode: 'self-hosted', targetRoot: null });
  try {
    assert.throws(
      () => resolveRoots({ startDir: f.tool, fresh: true, env: { [ENV_KEYS.mode]: 'installed' } }),
      /Conflicting mode/,
    );
  } finally {
    f.cleanup();
  }
});

test('config mode and env mode agreeing resolves normally', () => {
  const f = makeInstall({ mode: 'self-hosted', targetRoot: null });
  try {
    const roots = resolveRoots({ startDir: f.tool, fresh: true, env: { [ENV_KEYS.mode]: 'self-hosted' } });
    assert.equal(roots.mode, 'self-hosted');
  } finally {
    f.cleanup();
  }
});

test('an invalid mode or git.mode value is rejected by name', () => {
  const bad = makeInstall({ mode: 'sideways' });
  try {
    assert.throws(() => bad.resolve(), /Invalid mode "sideways"/);
  } finally {
    bad.cleanup();
  }

  const badGit = makeInstall({ git: { mode: 'yolo' } });
  try {
    assert.throws(() => badGit.resolve(), /Invalid git\.mode "yolo"/);
  } finally {
    badGit.cleanup();
  }
});

// -------------------------------------------------------------------------------------------------
// Target Root rules
// -------------------------------------------------------------------------------------------------

test('targetRoot is resolved relative to the config file, not to cwd', () => {
  const f = makeInstall({ targetRoot: '..' });
  try {
    assert.equal(f.resolve().targetRoot, norm(f.host));
  } finally {
    f.cleanup();
  }
});

test('installed mode without a targetRoot names the fix instead of inferring one', () => {
  const f = makeInstall({ targetRoot: null });
  try {
    assert.throws(() => f.resolve(), /run `npx agentic-testing init`/);
  } finally {
    f.cleanup();
  }
});

test('targetRoot equal to toolRoot is rejected and points at self-hosted mode', () => {
  const f = makeInstall({ targetRoot: '.' });
  try {
    assert.throws(() => f.resolve(), /set "mode": "self-hosted"/);
  } finally {
    f.cleanup();
  }
});

test('targetRoot inside toolRoot is rejected — the target contains the tool, never the reverse', () => {
  const f = makeInstall({ targetRoot: './platform_core' });
  try {
    assert.throws(() => f.resolve(), /is inside the Tool Root/);
  } finally {
    f.cleanup();
  }
});

test('a detached install (tool outside the target) resolves and is flagged in the trace', () => {
  const f = makeInstall();
  const elsewhere = fs.mkdtempSync(path.join(os.tmpdir(), 'pp-detached-'));
  try {
    const roots = f.resolve({ targetRoot: elsewhere });
    assert.equal(roots.targetRoot, norm(elsewhere));
    assert.ok(roots.resolution.some((l) => l.includes('detached')));
  } finally {
    fs.rmSync(elsewhere, { recursive: true, force: true });
    f.cleanup();
  }
});

test('dataRoot resolving outside the Tool Root is rejected', () => {
  const f = makeInstall({ dataRoot: '../outside_data' });
  try {
    assert.throws(() => f.resolve(), /resolves outside the Tool Root/);
  } finally {
    f.cleanup();
  }
});

// -------------------------------------------------------------------------------------------------
// Self-hosted mode
// -------------------------------------------------------------------------------------------------

test('self-hosted mode sets targetRoot === toolRoot', () => {
  const f = makeInstall({ mode: 'self-hosted', targetRoot: null, dataRoot: 'examples/ndc/platform_core_data' });
  try {
    fs.mkdirSync(path.join(f.tool, 'examples', 'ndc', 'platform_core_data'), { recursive: true });
    const roots = f.resolve();
    assert.equal(roots.mode, 'self-hosted');
    assert.equal(roots.targetRoot, roots.toolRoot);
    assert.equal(roots.dataRoot, `${norm(f.tool)}/examples/ndc/platform_core_data`);
  } finally {
    f.cleanup();
  }
});

test('self-hosted mode accepts targetRoot "." but rejects a different root', () => {
  const ok = makeInstall({ mode: 'self-hosted', targetRoot: '.' });
  try {
    assert.equal(ok.resolve().targetRoot, ok.resolve().toolRoot);
  } finally {
    ok.cleanup();
  }

  const bad = makeInstall({ mode: 'self-hosted', targetRoot: '..' });
  try {
    assert.throws(() => bad.resolve(), /is not the Tool Root/);
  } finally {
    bad.cleanup();
  }
});

// -------------------------------------------------------------------------------------------------
// Fail-closed target writes
// -------------------------------------------------------------------------------------------------

test('an absent or empty writeAllowlist disables target writes (fail-closed)', () => {
  for (const allowlist of [undefined, []]) {
    const f = makeInstall({
      target: { testDirs: {}, automationRoot: 'tests/e2e', writeAllowlist: allowlist },
    });
    try {
      const roots = f.resolve();
      assert.equal(roots.canWriteTarget, false);
      assert.equal(canWrite(path.join(f.host, 'tests', 'e2e', 'a.spec.ts'), roots), false);
      assert.ok(roots.resolution.some((l) => l.includes('DISABLED')));
    } finally {
      f.cleanup();
    }
  }
});

test('a non-empty writeAllowlist enables writes only for matching paths', () => {
  const f = makeInstall();
  try {
    const roots = f.resolve();
    assert.equal(roots.canWriteTarget, true);
    assert.equal(canWrite(path.join(f.host, 'tests', 'e2e', 'login.spec.ts'), roots), true);
    assert.equal(canWrite(path.join(f.host, 'tests', 'e2e', 'pages', 'Login.ts'), roots), true);
    assert.equal(canWrite(path.join(f.host, 'playwright.config.ts'), roots), true);
    assert.equal(canWrite(path.join(f.host, 'src', 'app.ts'), roots), false);
    assert.equal(canWrite(path.join(f.host, 'package.json'), roots), false);
  } finally {
    f.cleanup();
  }
});

// -------------------------------------------------------------------------------------------------
// classifyPath — what enforces pipeline.md §13
// -------------------------------------------------------------------------------------------------

test('classifyPath distinguishes data, tool, target and outside', () => {
  const f = makeInstall();
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'pp-outside-'));
  try {
    const roots = f.resolve();

    assert.equal(classifyPath(path.join(f.dataRoot, 'PRD.md'), roots).root, 'data');
    assert.equal(classifyPath(path.join(f.tool, 'platform_core', 'x.js'), roots).root, 'tool');
    assert.equal(classifyPath(path.join(f.host, 'src', 'app.ts'), roots).root, 'target');
    assert.equal(classifyPath(path.join(outside, 'other.txt'), roots).root, 'outside');
  } finally {
    fs.rmSync(outside, { recursive: true, force: true });
    f.cleanup();
  }
});

test('the tool folder classifies as tool/data even though it sits inside the target', () => {
  // Order matters: dataRoot and toolRoot are checked before targetRoot, because the tool folder is
  // physically inside the Target Project.
  const f = makeInstall();
  try {
    const roots = f.resolve();
    const c = classifyPath(path.join(f.dataRoot, 'workspace', 'automation'), roots);
    assert.equal(c.root, 'data');
    assert.equal(c.writable, true);
    assert.equal(c.relative, 'workspace/automation');
  } finally {
    f.cleanup();
  }
});

test('classifyPath returns target-root-relative paths for target hits', () => {
  const f = makeInstall();
  try {
    const c = classifyPath(path.join(f.host, 'tests', 'e2e', 'login.spec.ts'), f.resolve());
    assert.equal(c.relative, 'tests/e2e/login.spec.ts');
    assert.equal(c.writable, true);
    assert.match(c.reason, /write allowlist/);
  } finally {
    f.cleanup();
  }
});

test('a path outside both roots is never readable or writable', () => {
  const f = makeInstall();
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'pp-out2-'));
  try {
    const roots = f.resolve();
    const p = path.join(outside, 'secrets.txt');
    assert.equal(canRead(p, roots), false);
    assert.equal(canWrite(p, roots), false);
    assert.match(classifyPath(p, roots).reason, /Rule 9/);
  } finally {
    fs.rmSync(outside, { recursive: true, force: true });
    f.cleanup();
  }
});

// -------------------------------------------------------------------------------------------------
// Read denylist
// -------------------------------------------------------------------------------------------------

test('the built-in read denylist blocks secrets in the Target Project', () => {
  const f = makeInstall();
  try {
    const roots = f.resolve();
    for (const rel of [
      '.env',
      '.env.production',
      'config/credentials.json',
      'deploy/secrets.yml',
      'certs/server.pem',
      'certs/server.key',
      '.aws/config',
      '.ssh/id_rsa',
    ]) {
      assert.equal(canRead(path.join(f.host, rel), roots), false, `${rel} must be unreadable`);
    }
  } finally {
    f.cleanup();
  }
});

test('a configured readDenylist is merged with, never replaces, the built-in list', () => {
  const f = makeInstall({
    target: {
      automationRoot: 'tests/e2e',
      writeAllowlist: ['tests/e2e/**'],
      readDenylist: ['internal/**'],
    },
  });
  try {
    const roots = f.resolve();
    for (const builtin of BUILTIN_READ_DENYLIST) {
      assert.ok(roots.target.readDenylist.includes(builtin), `${builtin} must survive`);
    }
    assert.equal(canRead(path.join(f.host, 'internal', 'notes.md'), roots), false);
    assert.equal(canRead(path.join(f.host, '.env'), roots), false);
    assert.equal(canRead(path.join(f.host, 'src', 'app.ts'), roots), true);
  } finally {
    f.cleanup();
  }
});

test('a denylisted path is never writable even when the allowlist would permit it', () => {
  const f = makeInstall({
    target: { automationRoot: 'tests/e2e', writeAllowlist: ['**'] },
  });
  try {
    const roots = f.resolve();
    assert.equal(canWrite(path.join(f.host, 'tests', 'e2e', 'a.spec.ts'), roots), true);
    assert.equal(canWrite(path.join(f.host, '.env'), roots), false);
    assert.match(classifyPath(path.join(f.host, '.env'), roots).reason, /denylist/);
  } finally {
    f.cleanup();
  }
});

// -------------------------------------------------------------------------------------------------
// Glob matching
// -------------------------------------------------------------------------------------------------

test('glob matching handles **, *, ? and bare directory prefixes', () => {
  const { matchesAny } = _internals;

  assert.ok(matchesAny('tests/e2e/a.spec.ts', ['tests/e2e/**']));
  assert.ok(matchesAny('tests/e2e/pages/deep/X.ts', ['tests/e2e/**']));
  assert.ok(matchesAny('tests/e2e', ['tests/e2e']));
  assert.ok(matchesAny('tests/e2e/a.spec.ts', ['tests/e2e']), 'bare dir prefix covers descendants');

  assert.ok(matchesAny('a.spec.ts', ['*.spec.ts']));
  assert.ok(!matchesAny('nested/a.spec.ts', ['*.spec.ts']), 'single * must not cross /');

  assert.ok(matchesAny('credentials.json', ['**/credentials*.json']), '**/ may match zero segments');
  assert.ok(matchesAny('a/b/credentials.json', ['**/credentials*.json']));

  assert.ok(matchesAny('.env.local', ['.env.*']));
  assert.ok(!matchesAny('denv', ['.env']), 'the dot is literal, not a wildcard');

  assert.ok(matchesAny('a1.ts', ['a?.ts']));
  assert.ok(!matchesAny('a12.ts', ['a?.ts']));

  assert.ok(!matchesAny('x', []));
  assert.ok(!matchesAny('', ['**']));
});

// -------------------------------------------------------------------------------------------------
// assertValidInstall
// -------------------------------------------------------------------------------------------------

test('assertValidInstall passes for a coherent install', () => {
  const f = makeInstall();
  try {
    assert.doesNotThrow(() => assertValidInstall(f.resolve()));
  } finally {
    f.cleanup();
  }
});

test('assertValidInstall reports a missing dataRoot and names the fix', () => {
  const f = makeInstall();
  try {
    fs.rmSync(f.dataRoot, { recursive: true, force: true });
    assert.throws(() => assertValidInstall(f.resolve()), /dataRoot does not exist/);
  } finally {
    f.cleanup();
  }
});

test('assertValidInstall rejects an allowlist with no automationRoot', () => {
  const f = makeInstall({
    target: { automationRoot: null, writeAllowlist: ['tests/e2e/**'] },
  });
  try {
    assert.throws(() => assertValidInstall(f.resolve()), /automationRoot is not/);
  } finally {
    f.cleanup();
  }
});

// -------------------------------------------------------------------------------------------------
// Memoization
// -------------------------------------------------------------------------------------------------

test('resolveRoots memoizes per (startDir, env) and clearCache resets it', () => {
  const f = makeInstall();
  try {
    const a = resolveRoots({ startDir: f.tool, env: {} });
    const b = resolveRoots({ startDir: f.tool, env: {} });
    assert.equal(a, b, 'same inputs should return the identical frozen object');

    const c = resolveRoots({ startDir: f.tool, env: {}, fresh: true });
    assert.notEqual(a, c, 'fresh must bypass the memo');
    assert.deepEqual(a.toolRoot, c.toolRoot);

    clearCache();
    const d = resolveRoots({ startDir: f.tool, env: {} });
    assert.notEqual(a, d);
  } finally {
    clearCache();
    f.cleanup();
  }
});

test('the returned roots object and its nested policy are frozen', () => {
  const f = makeInstall();
  try {
    const roots = f.resolve();
    assert.ok(Object.isFrozen(roots));
    assert.ok(Object.isFrozen(roots.target));
    assert.ok(Object.isFrozen(roots.git));
    // Sloppy-mode assignment to a frozen property is silently ignored rather than throwing, so
    // assert the value survived — that is the guarantee callers actually rely on.
    const original = roots.targetRoot;
    roots.targetRoot = '/elsewhere';
    assert.equal(roots.targetRoot, original);
    assert.throws(() => { 'use strict'; roots.targetRoot = '/elsewhere'; }, TypeError);
  } finally {
    f.cleanup();
  }
});

// -------------------------------------------------------------------------------------------------
// Path normalization
// -------------------------------------------------------------------------------------------------

test('every emitted root is absolute with POSIX separators', () => {
  const f = makeInstall();
  try {
    const roots = f.resolve();
    for (const key of ['toolRoot', 'dataRoot', 'coreRoot', 'targetRoot']) {
      assert.ok(path.isAbsolute(roots[key]), `${key} must be absolute`);
      assert.ok(!roots[key].includes('\\'), `${key} must use POSIX separators`);
    }
  } finally {
    f.cleanup();
  }
});

test('relativeWithin returns null for an escaping path and "." for the base itself', () => {
  const { relativeWithin } = _internals;
  const base = path.resolve('/a/b');
  assert.equal(relativeWithin(base, path.resolve('/a/b')), '.');
  assert.equal(relativeWithin(base, path.resolve('/a/b/c/d')), 'c/d');
  assert.equal(relativeWithin(base, path.resolve('/a/x')), null);
  assert.equal(relativeWithin(base, path.resolve('/a')), null);
});
