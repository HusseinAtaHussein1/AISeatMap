const test = require('node:test');
const assert = require('node:assert');
const path = require('node:path');

const {
  DEFAULT_PROJECT_ROOT,
  resolveProjectRoot,
  resolvePaths,
  runPath,
  assertProjectRoot,
  repoRoot,
} = require('../index');

const REPO = repoRoot();

function withoutEnv(fn) {
  const prev = process.env.PLATFORM_PROJECT_ROOT;
  delete process.env.PLATFORM_PROJECT_ROOT;
  try {
    return fn();
  } finally {
    if (prev === undefined) delete process.env.PLATFORM_PROJECT_ROOT;
    else process.env.PLATFORM_PROJECT_ROOT = prev;
  }
}

test('an explicit root wins over every other source', () => {
  process.env.PLATFORM_PROJECT_ROOT = 'from_env';
  try {
    assert.strictEqual(resolveProjectRoot('explicit_root'), path.join(REPO, 'explicit_root'));
  } finally {
    delete process.env.PLATFORM_PROJECT_ROOT;
  }
});

test('PLATFORM_PROJECT_ROOT wins over platform.config.json', () => {
  process.env.PLATFORM_PROJECT_ROOT = 'env_project';
  try {
    assert.strictEqual(resolveProjectRoot(), path.join(REPO, 'env_project'));
  } finally {
    delete process.env.PLATFORM_PROJECT_ROOT;
  }
});

test('falls back to platform.config.json / the built-in default', () => {
  withoutEnv(() => {
    // This repository's platform.config.json sets the default root explicitly.
    assert.strictEqual(resolveProjectRoot(), path.join(REPO, DEFAULT_PROJECT_ROOT));
  });
});

test('an absolute root is used as-is, so a project may live outside the repository', () => {
  const abs = path.resolve(path.sep, 'elsewhere', 'other_project');
  assert.strictEqual(resolveProjectRoot(abs), path.normalize(abs));
});

test('every derived path hangs off the resolved root, not a hardcoded folder name', () => {
  const p = resolvePaths('some_project');
  const root = path.join(REPO, 'some_project');
  assert.strictEqual(p.projectRoot, root);
  assert.strictEqual(p.prd, path.join(root, 'PRD.md'));
  assert.strictEqual(p.workspaceContext, path.join(root, 'workspace', 'context'));
  assert.strictEqual(p.knowledgeBusiness, path.join(root, 'knowledge', 'business'));
  assert.strictEqual(p.knowledgePatterns, path.join(root, 'knowledge', 'patterns'));
  assert.strictEqual(p.runsRoot, path.join(root, 'runs'));
  assert.strictEqual(p.credentialsFile, path.join(root, 'credentials', 'credentials.json'));
});

test('no derived path contains the default project folder name when another root is configured', () => {
  const p = resolvePaths('other_root');
  for (const [key, value] of Object.entries(p)) {
    if (['repoRoot', 'platformCore', 'platformTools', 'prerequisites'].includes(key)) continue;
    assert.ok(
      !String(value).split(path.sep).includes(DEFAULT_PROJECT_ROOT),
      `${key} leaked the default project folder name: ${value}`
    );
  }
});

test('generated output is isolated under the project root, not the repository root', () => {
  const p = resolvePaths('gen_project');
  assert.strictEqual(p.generatedRoot, path.join(REPO, 'gen_project', '.generated'));
  assert.strictEqual(p.generatedPlaywright, path.join(REPO, 'gen_project', '.generated', 'playwright'));
});

test('runPath joins under the resolved runs root and rejects an empty folder', () => {
  assert.strictEqual(
    runPath('2026-07-29_10-00-00__Module__Login', 'r'),
    path.join(REPO, 'r', 'runs', '2026-07-29_10-00-00__Module__Login')
  );
  assert.throws(() => runPath('', 'r'), /requires a run folder/);
});

test('assertProjectRoot fails fast with an actionable message', () => {
  assert.throws(
    () => assertProjectRoot('definitely_not_a_real_root_xyz'),
    /Project root not found[\s\S]*PLATFORM_PROJECT_ROOT/
  );
});

test('assertProjectRoot passes for the configured root', () => {
  withoutEnv(() => {
    assert.strictEqual(assertProjectRoot(), path.join(REPO, DEFAULT_PROJECT_ROOT));
  });
});
