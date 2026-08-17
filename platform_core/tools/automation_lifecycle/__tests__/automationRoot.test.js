const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { resolveAutomationRoot, assertModuleDirRetired, AutomationRootError } = require('../automationRoot');
const { registerModuleOwnership } = require('../baselineOwnership');

/** Builds a modules/ + automation_baseline/ pair on disk, with one module in a given state. */
function fixture({ state, sourceOfTruth, withModuleDir, withBaseline = true, extra = {} }) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'autoroot-'));
  const modulesDir = path.join(root, 'modules');
  const baselineRoot = path.join(root, 'automation_baseline');
  const moduleAutomation = path.join(modulesDir, 'branch', 'automation');
  fs.mkdirSync(moduleAutomation, { recursive: true });
  fs.writeFileSync(
    path.join(moduleAutomation, '.module_automation_state.json'),
    JSON.stringify({ schemaVersion: 2, module: 'branch', state, sourceOfTruth, framework: 'SHAFT', ...extra }),
  );
  if (withModuleDir) fs.mkdirSync(path.join(moduleAutomation, 'tests_SHAFT'), { recursive: true });
  if (withBaseline) fs.mkdirSync(path.join(baselineRoot, 'shaft', 'tests_SHAFT'), { recursive: true });
  return { root, modulesDir, baselineRoot };
}

test('a Draft module resolves to its module workspace', () => {
  const f = fixture({ state: 'Approved', sourceOfTruth: 'module', withModuleDir: true });
  try {
    const r = resolveAutomationRoot('branch', f);
    assert.equal(r.mode, 'module');
    assert.match(r.root, /modules\/branch\/automation\/tests_SHAFT$/);
    assert.equal(r.exists, true);
  } finally {
    fs.rmSync(f.root, { recursive: true, force: true });
  }
});

test('a Promoted module resolves to the baseline, with its owned paths and suite', () => {
  const f = fixture({ state: 'Promoted', sourceOfTruth: 'baseline', withModuleDir: false });
  try {
    registerModuleOwnership(path.join(f.baselineRoot, 'shaft', 'tests_SHAFT'), 'branch', {
      owned: ['src/main/java/AdminPages/Admin/Branch/**'],
      suite: 'testng-branch.xml',
      now: new Date('2026-08-17T00:00:00Z'),
    });
    const r = resolveAutomationRoot('branch', f);
    assert.equal(r.mode, 'baseline');
    assert.match(r.root, /automation_baseline\/shaft\/tests_SHAFT$/);
    assert.deepEqual(r.ownedPaths, ['src/main/java/AdminPages/Admin/Branch/**']);
    assert.equal(r.suite, 'testng-branch.xml');
  } finally {
    fs.rmSync(f.root, { recursive: true, force: true });
  }
});

test('a Promoted module whose working copy REAPPEARED stops resolution instead of choosing', () => {
  // The user-mandated safety rule (pipeline.md §12.10 rule 3). Silently preferring the baseline
  // would leave someone editing a resurrected directory in the belief it is live.
  const f = fixture({ state: 'Promoted', sourceOfTruth: 'baseline', withModuleDir: true });
  try {
    assert.throws(() => resolveAutomationRoot('branch', f), (err) => {
      assert.ok(err instanceof AutomationRootError);
      assert.equal(err.code, 'MODULE_DIR_RESURRECTED');
      assert.match(err.message, /reappeared/);
      return true;
    });
  } finally {
    fs.rmSync(f.root, { recursive: true, force: true });
  }
});

test('a Promoted module with no baseline is a hard error, never a fallback to the module path', () => {
  // There is no working copy to fall back to; inventing one would hide a lost baseline.
  const f = fixture({ state: 'Promoted', sourceOfTruth: 'baseline', withModuleDir: false, withBaseline: false });
  try {
    assert.throws(() => resolveAutomationRoot('branch', f), (err) => {
      assert.equal(err.code, 'BASELINE_MISSING');
      return true;
    });
  } finally {
    fs.rmSync(f.root, { recursive: true, force: true });
  }
});

test('sourceOfTruth alone is enough to route to the baseline', () => {
  // Callers read one field. A state name that has not caught up must not change the answer.
  const f = fixture({ state: 'Approved', sourceOfTruth: 'baseline', withModuleDir: false });
  try {
    assert.equal(resolveAutomationRoot('branch', f).mode, 'baseline');
  } finally {
    fs.rmSync(f.root, { recursive: true, force: true });
  }
});

test('a module with no automation state resolves to nothing, with a reason', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'autoroot-none-'));
  try {
    fs.mkdirSync(path.join(root, 'modules', 'branch'), { recursive: true });
    assert.throws(
      () => resolveAutomationRoot('branch', { modulesDir: path.join(root, 'modules'), baselineRoot: root }),
      (err) => { assert.equal(err.code, 'NO_AUTOMATION'); return true; },
    );
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('assertModuleDirRetired confirms absence and reports a reappearance', () => {
  const gone = fixture({ state: 'Promoted', sourceOfTruth: 'baseline', withModuleDir: false });
  const back = fixture({ state: 'Promoted', sourceOfTruth: 'baseline', withModuleDir: true });
  try {
    assert.equal(assertModuleDirRetired('branch', gone).ok, true);
    const bad = assertModuleDirRetired('branch', back);
    assert.equal(bad.ok, false);
    assert.match(bad.message, /REAPPEARED/);
  } finally {
    fs.rmSync(gone.root, { recursive: true, force: true });
    fs.rmSync(back.root, { recursive: true, force: true });
  }
});

test('assertModuleDirRetired passes trivially for a module that was never promoted', () => {
  const f = fixture({ state: 'Executed', sourceOfTruth: 'module', withModuleDir: true });
  try {
    assert.equal(assertModuleDirRetired('branch', f).ok, true);
  } finally {
    fs.rmSync(f.root, { recursive: true, force: true });
  }
});
