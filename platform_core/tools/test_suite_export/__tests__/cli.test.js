'use strict';

// Design-directory resolution — the CLI's answer to "which test_design/ folder am I exporting?"
//
// Regression cover for platform defect DREC-T04: the default resolved `runs/{run}/test_design/`
// long after the 2026-07-29 module-workspace migration moved Stage 3's output to
// `modules/{module}/test_design/`, so the no-argument call — the documented normal call — could not
// find any module suite. These tests pin the default to the MODULE.

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { parseArgs, resolveDesignDirs } = require('../cli');
const { ExportError } = require('../exportSuites');

/**
 * A throwaway dataRoot with the module/run layout the resolver reads.
 * Injected via opts.dataRoot rather than env, because resolveRoots() correctly refuses a dataRoot
 * outside the Tool Root (paths.js) — a temp dir is always outside it.
 */
function dataRoot({ modules = [], activeModules = [], activeScope = null, runs = [] } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'suite-export-cli-'));
  test.after(() => fs.rmSync(root, { recursive: true, force: true }));

  const modulesDir = path.join(root, 'modules');
  fs.mkdirSync(modulesDir, { recursive: true });
  fs.writeFileSync(
    path.join(modulesDir, 'modules.json'),
    JSON.stringify({
      schemaVersion: 1,
      modules: modules.map((m) => ({ slug: m.slug, name: m.slug, status: m.status || 'Active' })),
      activeModules,
      activeScope,
    }, null, 2),
  );
  for (const m of modules) {
    if (m.withSuite) {
      const designDir = path.join(modulesDir, m.slug, 'test_design');
      fs.mkdirSync(designDir, { recursive: true });
      fs.writeFileSync(path.join(designDir, `TestCases_${m.slug}.md`), '# placeholder\n');
    }
  }

  for (const r of runs) {
    const runDir = path.join(root, 'runs', r.folder);
    fs.mkdirSync(runDir, { recursive: true });
    if (r.withDesignDir) fs.mkdirSync(path.join(runDir, 'test_design'), { recursive: true });
  }

  return root;
}

const resolve = (argv, root) => resolveDesignDirs(parseArgs(argv), { dataRoot: root });

test('with no arguments, resolves the ACTIVE MODULE — not the active run (DREC-T04)', () => {
  const root = dataRoot({
    modules: [{ slug: 'agency', withSuite: true }],
    activeModules: ['agency'],
    activeScope: 'single',
  });

  const { dirs, source, strict } = resolve([], root);
  assert.deepStrictEqual(dirs, [path.join(root, 'modules', 'agency', 'test_design')]);
  assert.match(source, /^active module: agency$/);
  assert.strictEqual(strict, true, 'one named target — a missing suite must be an error');
  // The defect in one assertion: the old default pointed here.
  assert.ok(!dirs[0].includes(`${path.sep}runs${path.sep}`));
});

test('a multi-module selection resolves one folder per module, non-strict', () => {
  const root = dataRoot({
    modules: [{ slug: 'agency', withSuite: true }, { slug: 'branch' }],
    activeModules: ['agency', 'branch'],
    activeScope: 'multi',
  });

  const { dirs, strict } = resolve([], root);
  assert.deepStrictEqual(dirs, [
    path.join(root, 'modules', 'agency', 'test_design'),
    path.join(root, 'modules', 'branch', 'test_design'),
  ]);
  // `branch` has not reached Stage 3. That is an expected state, not a reason to abort agency's
  // export — so the caller skips it instead of throwing.
  assert.strictEqual(strict, false);
});

test('--module overrides the pointer and accepts a prefix', () => {
  const root = dataRoot({
    modules: [{ slug: 'agency', withSuite: true }, { slug: 'branch', withSuite: true }],
    activeModules: ['agency'],
    activeScope: 'single',
  });

  const { dirs, source, strict } = resolve(['--module', 'bra'], root);
  assert.deepStrictEqual(dirs, [path.join(root, 'modules', 'branch', 'test_design')]);
  assert.strictEqual(source, 'module branch');
  assert.strictEqual(strict, true);
});

test('--module naming an unregistered module fails, listing what exists', () => {
  const root = dataRoot({ modules: [{ slug: 'agency' }], activeModules: ['agency'] });
  assert.throws(() => resolve(['--module', 'nope'], root), (err) => {
    assert.ok(err instanceof ExportError);
    assert.match(err.message, /No module matches "nope"/);
    assert.match(err.message, /agency/);
    return true;
  });
});

test('no active module asks rather than guessing the only registered one', () => {
  const root = dataRoot({ modules: [{ slug: 'agency', withSuite: true }], activeModules: [] });
  assert.throws(() => resolve([], root), (err) => {
    assert.ok(err instanceof ExportError);
    assert.match(err.message, /No active module/);
    // Falling back to "the only module" is exactly what module_architecture.md §6.5 #1 forbids.
    assert.match(err.message, /module_manager\/cli\.js use <slug>/);
    return true;
  });
});

test('--dir still wins over every pointer', () => {
  const root = dataRoot({ modules: [{ slug: 'agency' }], activeModules: ['agency'] });
  const { dirs, source } = resolve(['--dir', 'some/other/place'], root);
  assert.deepStrictEqual(dirs, [path.resolve('some/other/place')]);
  assert.strictEqual(source, 'explicit --dir');
});

test('--run still reads a historic run folder that has a pre-migration test_design/', () => {
  const root = dataRoot({
    modules: [{ slug: 'agency', withSuite: true }],
    activeModules: ['agency'],
    runs: [{ folder: 'run-001__2026-01-01__Legacy', withDesignDir: true }],
  });

  const { dirs, source } = resolve(['--run', 'run-001__2026-01-01__Legacy'], root);
  assert.deepStrictEqual(dirs, [path.join(root, 'runs', 'run-001__2026-01-01__Legacy', 'test_design')]);
  assert.match(source, /historic layout/);
});

test('--run on a run with no test_design/ points the caller at the module layout', () => {
  const root = dataRoot({
    modules: [{ slug: 'agency', withSuite: true }],
    activeModules: ['agency'],
    runs: [{ folder: 'run-002__2026-07-31__Current' }],
  });

  assert.throws(() => resolve(['--run', 'run-002__2026-07-31__Current'], root), (err) => {
    assert.match(err.message, /module-workspace migration/);
    assert.match(err.message, /--module <slug>/);
    return true;
  });
});
