const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { buildPlan, renderPlan, inferTargetRoot, InitError, DATA_DIRS } = require('../plan');
const { applyPlan } = require('../apply');
const { installPlatform } = require('../index');

const PACKAGE_ROOT = path.join(__dirname, '..', '..', '..', '..');
const NOW = new Date('2026-07-26T10:00:00.000Z');

/** A throwaway target project. `files` is a {relPath: contents} map. */
function makeTarget(files = {}, prefix = 'init-target-') {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  for (const [rel, contents] of Object.entries(files)) {
    const abs = path.join(root, rel);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, contents);
  }
  return { root, cleanup: () => fs.rmSync(root, { recursive: true, force: true }) };
}

const PLAYWRIGHT_APP = {
  'package.json': JSON.stringify({
    name: 'shop', devDependencies: { '@playwright/test': '1.61.1' },
  }),
  'playwright.config.ts': "export default { testDir: './tests/e2e' };\n",
  'tests/e2e/login.spec.ts': "import { test } from '@playwright/test';\ntest('a', async () => {});\n",
  'tests/e2e/pages/LoginPage.ts': 'export class LoginPage {}\n',
  'src/app.ts': 'export const app = 1;\n',
  '.gitignore': 'node_modules/\ndist/\n',
};

const GREENFIELD_APP = {
  'package.json': JSON.stringify({ name: 'api', dependencies: { express: '4.19.2' } }),
  'src/index.js': "const express = require('express');\n",
};

function plan(targetRoot, overrides = {}) {
  return buildPlan({ packageRoot: PACKAGE_ROOT, targetRoot, ...overrides });
}

const opPaths = (p, kind) => p.operations.filter((o) => o.op === kind).map((o) => o.to);

// -------------------------------------------------------------------------------------------------
// Brownfield
// -------------------------------------------------------------------------------------------------

test('a brownfield project is detected and its conventions drive the config', () => {
  const t = makeTarget(PLAYWRIGHT_APP);
  try {
    const p = plan(t.root);

    assert.equal(p.mode, 'brownfield');
    assert.equal(p.greenfield, false);
    assert.equal(p.framework, 'Playwright');
    assert.equal(p.automationRoot, 'tests/e2e');
    assert.equal(p.config.target.automationRoot, 'tests/e2e');
    assert.deepEqual(p.config.target.writeAllowlist, ['tests/e2e/**']);
    assert.equal(p.config.targetRoot, '..', 'relative to the config file, so the folder can move');
    assert.equal(p.config.mode, 'installed');
    assert.equal(p.config.git.mode, 'tool-repo', 'the safe default');
  } finally {
    t.cleanup();
  }
});

test('an existing framework config is not added to the write allowlist', () => {
  // It belongs to the team; changing it needs per-run approval (pipeline.md §13.3 item 3).
  const t = makeTarget(PLAYWRIGHT_APP);
  try {
    const p = plan(t.root);
    assert.ok(!p.config.target.writeAllowlist.includes('playwright.config.ts'));
  } finally {
    t.cleanup();
  }
});

test('the write allowlist confines writes to the automation directory', () => {
  const t = makeTarget(PLAYWRIGHT_APP);
  try {
    const { resolveRoots, canWrite } = require('../../platform_paths/paths');
    const p = plan(t.root);

    // Apply, then ask the real resolver what the written config actually permits.
    applyPlan(p, { now: NOW });
    const roots = resolveRoots({ startDir: p.toolRoot, env: {}, fresh: true });

    assert.equal(canWrite(path.join(t.root, 'tests', 'e2e', 'new.spec.ts'), roots), true);
    assert.equal(canWrite(path.join(t.root, 'src', 'app.ts'), roots), false);
    assert.equal(canWrite(path.join(t.root, 'package.json'), roots), false);
    assert.equal(canWrite(path.join(t.root, '.github', 'workflows', 'ci.yml'), roots), false);
  } finally {
    t.cleanup();
  }
});

// -------------------------------------------------------------------------------------------------
// Greenfield
// -------------------------------------------------------------------------------------------------

test('a greenfield project plans test infrastructure only', () => {
  const t = makeTarget(GREENFIELD_APP);
  try {
    const p = plan(t.root);

    assert.equal(p.mode, 'greenfield');
    assert.equal(p.automationRoot, 'tests/e2e', 'from the suggestion, not a detected directory');
    assert.ok(p.notes.some((n) => n.includes('INFRASTRUCTURE only')));
    assert.ok(p.notes.some((n) => n.includes('never scaffolds the application')));

    // Nothing in the plan writes application source.
    for (const op of p.operations) {
      assert.ok(!/\/src\//.test(op.to || ''), `no operation may touch src/: ${op.to}`);
    }
  } finally {
    t.cleanup();
  }
});

test('mode can be forced against detection', () => {
  const t = makeTarget(PLAYWRIGHT_APP);
  try {
    assert.equal(plan(t.root, { mode: 'greenfield' }).mode, 'greenfield');
    assert.equal(plan(t.root, { mode: 'brownfield' }).mode, 'brownfield');
  } finally {
    t.cleanup();
  }
});

// -------------------------------------------------------------------------------------------------
// Guards
// -------------------------------------------------------------------------------------------------

test('a tool folder outside the target is refused unless --allow-detached', () => {
  const t = makeTarget(PLAYWRIGHT_APP);
  try {
    assert.throws(
      () => plan(t.root, { toolDir: path.join('..', 'outside') }),
      /outside the target project/,
    );
    assert.doesNotThrow(() => plan(t.root, { toolDir: path.join('..', 'outside'), allowDetached: true }));
  } finally {
    t.cleanup();
  }
});

test('installing the platform into itself is refused', () => {
  assert.throws(
    () => buildPlan({ packageRoot: PACKAGE_ROOT, targetRoot: path.dirname(PACKAGE_ROOT), toolDir: path.basename(PACKAGE_ROOT) }),
    /installing the platform into itself/,
  );
});

test('a non-existent target is refused', () => {
  assert.throws(
    () => plan(path.join(os.tmpdir(), 'no-such-target-98765')),
    InitError,
  );
});

// -------------------------------------------------------------------------------------------------
// The data scaffold
// -------------------------------------------------------------------------------------------------

test('the fixed platform_core_data shape is scaffolded in full', () => {
  const t = makeTarget(PLAYWRIGHT_APP);
  try {
    const p = plan(t.root);
    const dirs = opPaths(p, 'mkdir');

    for (const rel of DATA_DIRS) {
      assert.ok(
        dirs.some((d) => d.endsWith(`platform_core_data/${rel}`)),
        `${rel} must be scaffolded — the shape is fixed even for empty categories (pipeline.md §10.4)`,
      );
    }
  } finally {
    t.cleanup();
  }
});

test('blank input templates are written, never invented content', () => {
  const t = makeTarget(PLAYWRIGHT_APP);
  try {
    const p = plan(t.root);
    const templates = p.operations.filter((o) => o.op === 'write-template').map((o) => o.template);

    assert.ok(templates.includes('PRD.md'));
    assert.ok(templates.includes('run_configuration.md'));
    assert.ok(templates.includes('credentials.template.json'));
  } finally {
    t.cleanup();
  }
});

test('an existing platform_core_data is never overwritten, even with --force', () => {
  // It holds the team's PRD and every artifact produced so far.
  const t = makeTarget(PLAYWRIGHT_APP);
  try {
    const dataRoot = path.join(t.root, 'agentic-testing-tool', 'platform_core_data');
    fs.mkdirSync(path.join(dataRoot, 'knowledge_base'), { recursive: true });
    fs.writeFileSync(path.join(dataRoot, 'knowledge_base', 'PRD.md'), '# OUR REAL REQUIREMENTS\n');

    const p = plan(t.root, { force: true });

    const touchesPrd = p.operations.some((o) => (o.to || '').endsWith('platform_core_data/knowledge_base/PRD.md'));
    assert.equal(touchesPrd, false, 'an existing PRD must never be planned for a write');
    assert.ok(p.notes.some((n) => n.includes('will not be touched')));

    applyPlan(p, { now: NOW });
    assert.equal(
      fs.readFileSync(path.join(dataRoot, 'knowledge_base', 'PRD.md'), 'utf8'),
      '# OUR REAL REQUIREMENTS\n',
    );
  } finally {
    t.cleanup();
  }
});

test('missing folders are added to an existing data root without disturbing it', () => {
  const t = makeTarget(PLAYWRIGHT_APP);
  try {
    const dataRoot = path.join(t.root, 'agentic-testing-tool', 'platform_core_data');
    fs.mkdirSync(path.join(dataRoot, 'runs'), { recursive: true });
    fs.writeFileSync(path.join(dataRoot, 'runs', 'ProjectContext.md'), 'approved');

    const p = plan(t.root);
    const dirs = opPaths(p, 'mkdir');

    assert.ok(!dirs.some((d) => d.endsWith('platform_core_data/runs')), 'existing folders are skipped');
    assert.ok(dirs.some((d) => d.endsWith('automation_baseline')), 'missing folders are added');

    applyPlan(p, { now: NOW });
    assert.equal(
      fs.readFileSync(path.join(dataRoot, 'runs', 'ProjectContext.md'), 'utf8'),
      'approved',
    );
  } finally {
    t.cleanup();
  }
});

// -------------------------------------------------------------------------------------------------
// Apply
// -------------------------------------------------------------------------------------------------

test('a full install produces a working, resolvable installation', () => {
  const t = makeTarget(PLAYWRIGHT_APP);
  try {
    const { plan: p, manifest } = installPlatform({
      packageRoot: PACKAGE_ROOT, targetRoot: t.root, now: NOW,
    });

    const tool = path.join(t.root, 'agentic-testing-tool');
    assert.ok(fs.existsSync(path.join(tool, 'platform.config.json')));
    assert.ok(fs.existsSync(path.join(tool, 'platform_core', 'tools', 'platform_paths', 'paths.js')));
    assert.ok(fs.existsSync(path.join(tool, 'workflows_and_pipelines', 'pipeline', 'pipeline.md')));
    assert.ok(fs.existsSync(path.join(tool, 'platform_core_data', 'knowledge_base', 'PRD.md')));
    assert.ok(fs.existsSync(path.join(t.root, '.claude', 'skills', 'explorer-skill', 'SKILL.md')));
    assert.ok(fs.existsSync(path.join(t.root, '.mcp.json')));

    // The resolver agrees with what init wrote.
    const { resolveRoots, assertValidInstall } = require('../../platform_paths/paths');
    const roots = resolveRoots({ startDir: tool, env: {}, fresh: true });
    assert.equal(roots.mode, 'installed');
    assert.equal(roots.targetRoot, t.root.split(path.sep).join('/'));
    assert.equal(roots.target.automationRoot, 'tests/e2e');
    assert.doesNotThrow(() => assertValidInstall(roots));

    assert.equal(manifest.manifestVersion, 1);
    assert.equal(manifest.installedAt, NOW.toISOString());
    assert.ok(manifest.hostFilesTouched.length > 0, 'host writes are recorded for uninstall');
  } finally {
    t.cleanup();
  }
});

test('the host application source is never modified by an install', () => {
  const t = makeTarget(PLAYWRIGHT_APP);
  try {
    const before = fs.readFileSync(path.join(t.root, 'src', 'app.ts'), 'utf8');
    const specBefore = fs.readFileSync(path.join(t.root, 'tests', 'e2e', 'login.spec.ts'), 'utf8');

    installPlatform({ packageRoot: PACKAGE_ROOT, targetRoot: t.root, now: NOW });

    assert.equal(fs.readFileSync(path.join(t.root, 'src', 'app.ts'), 'utf8'), before);
    assert.equal(
      fs.readFileSync(path.join(t.root, 'tests', 'e2e', 'login.spec.ts'), 'utf8'),
      specBefore,
      'init writes no test code — that is the pipeline\'s job, after approval',
    );
    assert.equal(
      fs.readFileSync(path.join(t.root, 'package.json'), 'utf8'),
      PLAYWRIGHT_APP['package.json'],
    );
  } finally {
    t.cleanup();
  }
});

test('the host .gitignore keeps its own content and gains one block', () => {
  const t = makeTarget(PLAYWRIGHT_APP);
  try {
    installPlatform({ packageRoot: PACKAGE_ROOT, targetRoot: t.root, now: NOW });
    const gi = fs.readFileSync(path.join(t.root, '.gitignore'), 'utf8');

    assert.ok(gi.startsWith('node_modules/\ndist/\n'), 'existing rules stay first and unchanged');
    assert.ok(gi.includes('agentic-testing-tool/'));
    assert.ok(!gi.includes('.claude/*'), "the host's .claude policy is not overridden");
  } finally {
    t.cleanup();
  }
});

test('a re-install is a no-op for content: the second run changes nothing', () => {
  const t = makeTarget(PLAYWRIGHT_APP);
  try {
    installPlatform({ packageRoot: PACKAGE_ROOT, targetRoot: t.root, now: NOW });

    const snapshot = (rel) => fs.readFileSync(path.join(t.root, rel), 'utf8');
    const before = {
      gitignore: snapshot('.gitignore'),
      mcp: snapshot('.mcp.json'),
      prd: snapshot('agentic-testing-tool/platform_core_data/knowledge_base/PRD.md'),
      config: snapshot('agentic-testing-tool/platform.config.json'),
    };

    const second = installPlatform({ packageRoot: PACKAGE_ROOT, targetRoot: t.root, now: NOW });

    assert.equal(second.plan.reinstall, true, 'the prior manifest is detected');
    assert.equal(snapshot('.gitignore'), before.gitignore, '.gitignore must not drift on re-install');
    assert.equal(snapshot('.mcp.json'), before.mcp);
    assert.equal(snapshot('agentic-testing-tool/platform_core_data/knowledge_base/PRD.md'), before.prd);
    assert.equal(snapshot('agentic-testing-tool/platform.config.json'), before.config);
  } finally {
    t.cleanup();
  }
});

test('re-detection never mistakes the tool\'s own tests for the host project\'s', () => {
  // The installed tool folder ships dozens of __tests__ directories. Without excluding it, a
  // re-install detects those as the host's test suite — and would then aim generated automation at
  // the platform's own source tree.
  const t = makeTarget(PLAYWRIGHT_APP);
  try {
    installPlatform({ packageRoot: PACKAGE_ROOT, targetRoot: t.root, now: NOW });
    const second = buildPlan({ packageRoot: PACKAGE_ROOT, targetRoot: t.root });

    assert.equal(second.automationRoot, 'tests/e2e');
    for (const dir of second.detected.testDirs.dirs) {
      assert.ok(
        !dir.path.startsWith('agentic-testing-tool'),
        `detection must skip the tool folder, but found ${dir.path}`,
      );
    }
    assert.deepEqual(Object.values(second.config.target.testDirs), ['tests/e2e']);
  } finally {
    t.cleanup();
  }
});

test('a customized skill is preserved and the shipped one lands alongside it', () => {
  const t = makeTarget(PLAYWRIGHT_APP);
  try {
    const skill = path.join(t.root, '.claude', 'skills', 'explorer-skill', 'SKILL.md');
    fs.mkdirSync(path.dirname(skill), { recursive: true });
    fs.writeFileSync(skill, '# our customized explorer skill\n');

    const { plan: p } = installPlatform({ packageRoot: PACKAGE_ROOT, targetRoot: t.root, now: NOW });

    assert.equal(fs.readFileSync(skill, 'utf8'), '# our customized explorer skill\n', 'never overwritten');
    assert.ok(fs.existsSync(`${skill}.new`), 'the shipped version is written alongside');
    assert.ok(p.warnings.some((w) => w.includes('explorer-skill')));
  } finally {
    t.cleanup();
  }
});

test('--force overwrites a customized skill but still never touches platform_core_data', () => {
  const t = makeTarget(PLAYWRIGHT_APP);
  try {
    const skill = path.join(t.root, '.claude', 'skills', 'explorer-skill', 'SKILL.md');
    fs.mkdirSync(path.dirname(skill), { recursive: true });
    fs.writeFileSync(skill, '# customized\n');

    installPlatform({ packageRoot: PACKAGE_ROOT, targetRoot: t.root, now: NOW, force: true });

    assert.notEqual(fs.readFileSync(skill, 'utf8'), '# customized\n');
    assert.ok(!fs.existsSync(`${skill}.new`));
  } finally {
    t.cleanup();
  }
});

test('--skills none installs no skills; a csv installs exactly those named', () => {
  const t = makeTarget(PLAYWRIGHT_APP);
  try {
    installPlatform({ packageRoot: PACKAGE_ROOT, targetRoot: t.root, now: NOW, skills: 'none' });
    assert.equal(fs.existsSync(path.join(t.root, '.claude', 'skills', 'explorer-skill')), false);

    installPlatform({
      packageRoot: PACKAGE_ROOT, targetRoot: t.root, now: NOW, skills: 'explorer-skill,reporting-skill',
    });
    assert.ok(fs.existsSync(path.join(t.root, '.claude', 'skills', 'explorer-skill', 'SKILL.md')));
    assert.ok(fs.existsSync(path.join(t.root, '.claude', 'skills', 'reporting-skill', 'SKILL.md')));
    assert.equal(fs.existsSync(path.join(t.root, '.claude', 'skills', 'automation-skill')), false);
  } finally {
    t.cleanup();
  }
});

test('--no-mcp writes no .mcp.json at all', () => {
  const t = makeTarget(GREENFIELD_APP);
  try {
    installPlatform({ packageRoot: PACKAGE_ROOT, targetRoot: t.root, now: NOW, mcp: false });
    assert.equal(fs.existsSync(path.join(t.root, '.mcp.json')), false);
  } finally {
    t.cleanup();
  }
});

test('a dry run reports the plan and writes nothing', () => {
  const t = makeTarget(PLAYWRIGHT_APP);
  try {
    const before = fs.readdirSync(t.root).sort();
    const { plan: p, applied, manifest } = installPlatform({
      packageRoot: PACKAGE_ROOT, targetRoot: t.root, now: NOW, dryRun: true,
    });

    assert.equal(applied, null);
    assert.equal(manifest, null);
    assert.ok(p.operations.length > 0);
    assert.deepEqual(fs.readdirSync(t.root).sort(), before, 'the target is untouched');
    assert.equal(fs.existsSync(path.join(t.root, 'agentic-testing-tool')), false);
  } finally {
    t.cleanup();
  }
});

test('applyPlan requires an explicit now', () => {
  const t = makeTarget(GREENFIELD_APP);
  try {
    assert.throws(() => applyPlan(plan(t.root), {}), TypeError);
  } finally {
    t.cleanup();
  }
});

// -------------------------------------------------------------------------------------------------
// Git modes
// -------------------------------------------------------------------------------------------------

test('tool-repo mode gives the tool folder its own repository and ignores it in the host', () => {
  const t = makeTarget(PLAYWRIGHT_APP);
  try {
    installPlatform({ packageRoot: PACKAGE_ROOT, targetRoot: t.root, now: NOW });

    assert.ok(fs.existsSync(path.join(t.root, 'agentic-testing-tool', '.git')));
    assert.ok(fs.readFileSync(path.join(t.root, '.gitignore'), 'utf8').includes('agentic-testing-tool/'));
  } finally {
    t.cleanup();
  }
});

test('host-repo mode creates no nested repository and warns about the consequence', () => {
  const t = makeTarget(PLAYWRIGHT_APP);
  try {
    const { plan: p } = installPlatform({
      packageRoot: PACKAGE_ROOT, targetRoot: t.root, now: NOW, gitMode: 'host-repo',
    });

    assert.equal(fs.existsSync(path.join(t.root, 'agentic-testing-tool', '.git')), false);
    assert.ok(p.warnings.some((w) => w.includes("commit its process artifacts into THIS")));
    const gi = fs.readFileSync(path.join(t.root, '.gitignore'), 'utf8');
    assert.ok(!gi.includes('\nagentic-testing-tool/\n'), 'the tool folder is tracked in host-repo mode');
  } finally {
    t.cleanup();
  }
});

test('git off mode warns that baseline protection is unavailable', () => {
  const t = makeTarget(PLAYWRIGHT_APP);
  try {
    const p = plan(t.root, { gitMode: 'off' });
    assert.ok(p.warnings.some((w) => w.includes('no three-way-merge protection')));
  } finally {
    t.cleanup();
  }
});

// -------------------------------------------------------------------------------------------------
// Target-root inference (init-time only)
// -------------------------------------------------------------------------------------------------

test('inferTargetRoot walks up to the nearest project marker', () => {
  const t = makeTarget({ 'package.json': '{}', 'src/deep/nested/file.ts': 'x' });
  try {
    const { root, reason } = inferTargetRoot(path.join(t.root, 'src', 'deep', 'nested'));
    assert.equal(root, t.root.split(path.sep).join('/'));
    assert.match(reason, /package\.json/);
  } finally {
    t.cleanup();
  }
});

test('inferTargetRoot falls back to the given directory when nothing is found', () => {
  const bare = fs.mkdtempSync(path.join(os.tmpdir(), 'init-bare-'));
  try {
    const { root, reason } = inferTargetRoot(bare);
    assert.equal(root, bare.split(path.sep).join('/'));
    assert.match(reason, /no project marker found/);
  } finally {
    fs.rmSync(bare, { recursive: true, force: true });
  }
});

// -------------------------------------------------------------------------------------------------
// Rendering
// -------------------------------------------------------------------------------------------------

test('renderPlan surfaces the decisions a human needs to approve', () => {
  const t = makeTarget(PLAYWRIGHT_APP);
  try {
    const out = renderPlan(plan(t.root));
    for (const expected of ['Target project:', 'Install into:', 'Mode:', 'Framework:', 'Automation dir:', 'Git mode:', 'Operations']) {
      assert.ok(out.includes(expected), `the plan output should include "${expected}"`);
    }
    assert.ok(out.includes('brownfield'));
    assert.ok(out.includes('tests/e2e'));
  } finally {
    t.cleanup();
  }
});
