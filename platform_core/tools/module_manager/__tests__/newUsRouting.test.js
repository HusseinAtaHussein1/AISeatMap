// New User Story intake routing — the Feature path and the CRUD path, end to end at CLI level.
//
// See workflows_and_pipelines/pipeline/new_us_intake.md.
//
// These tests exercise the two routes a supplied User Story can take, and the boundary between them.
// The boundary is the point of the whole rule, so it is tested from both sides:
//
//   Feature route → modules/<module>/features/<feature>/   (parent exists, and parent missing)
//   CRUD route    → modules/<module>/                      (one story, and several consolidated)
//
// The single most important assertion in this file is the negative one: a CRUD package — however
// feature-shaped an Add/Update/Search/Approve/Reject area may sound — produces NO feature folder.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { main } = require('../cli');
const { readRegistry, readModuleState } = require('../moduleRegistry');
const { listFeatures, listAllFeatures } = require('../featureRegistry');

const NOW = '2026-08-17T10:00:00Z';

function makeModulesDir() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'new-us-routing-test-'));
  const modulesDir = path.join(root, 'modules');
  fs.mkdirSync(modulesDir, { recursive: true });
  return modulesDir;
}

function cleanup(modulesDir) {
  fs.rmSync(path.dirname(modulesDir), { recursive: true, force: true });
}

/** Runs the CLI, capturing stdout/stderr and the exit code, exactly as a caller would see them. */
function run(modulesDir, argv) {
  const out = [];
  const err = [];
  const origLog = console.log;
  const origErr = console.error;
  const origCode = process.exitCode;
  console.log = (...a) => out.push(a.join(' '));
  console.error = (...a) => err.push(a.join(' '));
  process.exitCode = 0;
  try {
    main([...argv, '--modules-dir', modulesDir, '--now', NOW]);
    return { out: out.join('\n'), err: err.join('\n'), code: process.exitCode || 0 };
  } finally {
    console.log = origLog;
    console.error = origErr;
    process.exitCode = origCode;
  }
}

/** Registers, approves and scaffolds a module — an already-existing parent. */
function seedModule(modulesDir, name) {
  run(modulesDir, ['propose', '--name', name]);
  run(modulesDir, ['approve', '--by', 'Product Owner']);
  const slug = readRegistry(modulesDir).modules.find((m) => m.name === name).slug;
  run(modulesDir, ['scaffold', slug]);
  return slug;
}

function featureDirOf(modulesDir, moduleSlug, featureSlug) {
  return path.join(modulesDir, moduleSlug, 'features', featureSlug);
}

// ── §2.1 Feature route — parent module already exists ────────────────────────────────────────

test('Feature route, existing parent: the Feature nests, and no duplicate module is created', () => {
  const modulesDir = makeModulesDir();
  try {
    const agency = seedModule(modulesDir, 'Agency');
    const modulesBefore = readRegistry(modulesDir).modules.length;

    run(modulesDir, ['feature', 'propose', agency,
      '--name', 'Bulk Agency Export', '--user-story', 'US-7001']);
    run(modulesDir, ['feature', 'approve', agency, '--by', 'Product Owner']);
    const res = run(modulesDir, ['feature', 'scaffold', agency, 'bulk-agency-export']);

    assert.equal(res.code, 0);
    assert.ok(fs.existsSync(featureDirOf(modulesDir, agency, 'bulk-agency-export')));

    // The parent module was reused, not duplicated.
    assert.equal(readRegistry(modulesDir).modules.length, modulesBefore);
    assert.deepEqual(
      readRegistry(modulesDir).modules.filter((m) => m.slug === agency).length, 1
    );

    // And the Feature is registered under it, carrying its source story.
    const features = listFeatures(modulesDir, agency);
    assert.equal(features.length, 1);
    assert.equal(features[0].sourceUserStory, 'US-7001');
  } finally {
    cleanup(modulesDir);
  }
});

test('Feature route: the Feature is traceable to its module and story from a single sweep', () => {
  const modulesDir = makeModulesDir();
  try {
    const agency = seedModule(modulesDir, 'Agency');
    run(modulesDir, ['feature', 'propose', agency, '--name', 'Bulk Export', '--user-story', 'US-7001']);
    run(modulesDir, ['feature', 'approve', agency, '--by', 'PO']);

    const all = listAllFeatures(modulesDir);
    assert.equal(all.length, 1);
    assert.equal(all[0].module, agency);
    assert.equal(all[0].sourceUserStory, 'US-7001');
  } finally {
    cleanup(modulesDir);
  }
});

// ── §2.2 Feature route — parent module does not exist ────────────────────────────────────────

test('Feature route, missing parent: the module is created FIRST, then the Feature nests inside', () => {
  const modulesDir = makeModulesDir();
  try {
    // A Feature cannot conjure its own parent — that is a separate, human-approved step.
    const premature = run(modulesDir, ['feature', 'propose', 'reports', '--name', 'Wallet Ledger']);
    assert.equal(premature.code, 1);
    assert.match(premature.err, /No module "reports" is registered/);
    assert.equal(fs.existsSync(path.join(modulesDir, 'reports')), false);

    // The correct order: module first.
    const reports = seedModule(modulesDir, 'Reports');
    run(modulesDir, ['feature', 'propose', reports, '--name', 'Wallet Ledger', '--user-story', 'US-8002']);
    run(modulesDir, ['feature', 'approve', reports, '--by', 'PO']);
    run(modulesDir, ['feature', 'scaffold', reports, 'wallet-ledger']);

    assert.ok(fs.existsSync(path.join(modulesDir, reports, 'module.json')));
    assert.ok(fs.existsSync(featureDirOf(modulesDir, reports, 'wallet-ledger')));
    assert.ok(fs.existsSync(path.join(featureDirOf(modulesDir, reports, 'wallet-ledger'), 'context')));
    assert.ok(fs.existsSync(path.join(featureDirOf(modulesDir, reports, 'wallet-ledger'), 'feature.json')));
  } finally {
    cleanup(modulesDir);
  }
});

// ── §3 / §4 CRUD route ───────────────────────────────────────────────────────────────────────

test('CRUD route, one User Story: one module, no features/ folder', () => {
  const modulesDir = makeModulesDir();
  try {
    const branch = seedModule(modulesDir, 'Branch');
    run(modulesDir, ['stage', branch, 'context', '--status', 'Approved']);

    assert.ok(fs.existsSync(path.join(modulesDir, branch)));
    assert.equal(fs.existsSync(path.join(modulesDir, branch, 'features')), false);
    assert.deepEqual(listFeatures(modulesDir, branch), []);
  } finally {
    cleanup(modulesDir);
  }
});

test('CRUD route, several stories: ONE consolidated module, not one module per area', () => {
  const modulesDir = makeModulesDir();
  try {
    // Add, Update, Search, Approve and Reject for the same entity arrive together.
    const branch = seedModule(modulesDir, 'Branch');
    for (const stage of ['context', 'discovery', 'test_design']) {
      run(modulesDir, ['stage', branch, stage, '--status', 'Approved', '--run', 'run-010']);
    }

    const registry = readRegistry(modulesDir);
    assert.equal(registry.modules.length, 1, 'five CRUD areas must not become five modules');
    assert.equal(registry.modules[0].slug, branch);

    // One consolidated stage map covering the whole CRUD scope.
    const state = readModuleState(modulesDir, branch);
    assert.equal(state.stages.test_design.status, 'Approved');
    assert.equal(fs.existsSync(path.join(modulesDir, branch, 'features')), false);
  } finally {
    cleanup(modulesDir);
  }
});

test('THE BOUNDARY: a CRUD capability must not produce a Feature folder', () => {
  const modulesDir = makeModulesDir();
  try {
    const branch = seedModule(modulesDir, 'Branch');

    // "Approve/Reject Branch" is feature-shaped language, and is still a CRUD area. Routed as CRUD,
    // it records against the module's own stages and creates nothing under features/.
    run(modulesDir, ['stage', branch, 'test_design', '--status', 'Approved']);

    assert.equal(fs.existsSync(path.join(modulesDir, branch, 'features')), false);
    assert.deepEqual(listAllFeatures(modulesDir), []);
    assert.equal(readModuleState(modulesDir, branch).stages.test_design.status, 'Approved');
  } finally {
    cleanup(modulesDir);
  }
});

// ── §6 Existing-scope protection ─────────────────────────────────────────────────────────────

test('inspect-scope reports modules, Features, story mappings, stage states and the active pointer', () => {
  const modulesDir = makeModulesDir();
  try {
    const agency = seedModule(modulesDir, 'Agency');
    run(modulesDir, ['stage', agency, 'context', '--status', 'Approved']);
    run(modulesDir, ['feature', 'propose', agency, '--name', 'Bulk Export', '--user-story', 'US-7001']);
    run(modulesDir, ['feature', 'approve', agency, '--by', 'PO']);
    run(modulesDir, ['use', agency]);

    const res = run(modulesDir, ['inspect-scope', '--json']);
    const report = JSON.parse(res.out);

    assert.equal(report.modules.length, 1);
    assert.equal(report.modules[0].stages.context, 'Approved');
    assert.equal(report.modules[0].featureCount, 1);
    assert.equal(report.features[0].sourceUserStory, 'US-7001');
    assert.equal(report.features[0].stages.context, 'Not Started');
    assert.deepEqual(report.active.modules, [agency]);
    assert.equal(report.active.feature, null);
  } finally {
    cleanup(modulesDir);
  }
});

test('a duplicate User Story surfaces as an overlap candidate, exit 2 — never silent creation', () => {
  const modulesDir = makeModulesDir();
  try {
    const agency = seedModule(modulesDir, 'Agency');
    run(modulesDir, ['feature', 'propose', agency, '--name', 'Bulk Export', '--user-story', 'US-7001']);
    run(modulesDir, ['feature', 'approve', agency, '--by', 'PO']);

    const res = run(modulesDir, ['inspect-scope', '--user-story', 'US-7001']);
    assert.equal(res.code, 2, 'overlap must be signalled distinctly from success and from error');
    assert.match(res.out, /Overlap candidates: 1/);
    assert.match(res.out, /agency\/bulk-export/);
    assert.match(res.out, /CANDIDATES, not a verdict/);
  } finally {
    cleanup(modulesDir);
  }
});

test('an overlapping Feature scope under a different story number still surfaces (rule #9)', () => {
  const modulesDir = makeModulesDir();
  try {
    const agency = seedModule(modulesDir, 'Agency');
    run(modulesDir, ['feature', 'propose', agency, '--name', 'Bulk Export', '--user-story', 'US-7001']);
    run(modulesDir, ['feature', 'approve', agency, '--by', 'PO']);

    // Different number, same capability — the number alone would have missed this.
    const res = run(modulesDir, ['inspect-scope', '--user-story', 'US-9999', '--name', 'Bulk Export']);
    assert.equal(res.code, 2);
    assert.match(res.out, /agency\/bulk-export/);
  } finally {
    cleanup(modulesDir);
  }
});

test('genuinely new scope reports no overlap candidates and exits 0', () => {
  const modulesDir = makeModulesDir();
  try {
    seedModule(modulesDir, 'Agency');
    const res = run(modulesDir, ['inspect-scope', '--user-story', 'US-1234', '--name', 'Rate Limiting']);
    assert.equal(res.code, 0);
    assert.match(res.out, /Overlap candidates: none/);
  } finally {
    cleanup(modulesDir);
  }
});

// ── Decision C at CLI level ──────────────────────────────────────────────────────────────────

test('use-feature then use <module> reports the cleared Feature rather than clearing it silently', () => {
  const modulesDir = makeModulesDir();
  try {
    const agency = seedModule(modulesDir, 'Agency');
    run(modulesDir, ['feature', 'propose', agency, '--name', 'Bulk Export']);
    run(modulesDir, ['feature', 'approve', agency, '--by', 'PO']);

    const setRes = run(modulesDir, ['use-feature', agency, 'bulk-export']);
    assert.equal(setRes.code, 0);
    assert.match(setRes.out, /feature bulk-export/);

    const clearRes = run(modulesDir, ['use', agency]);
    assert.match(clearRes.out, /Cleared active Feature `bulk-export`/);
    assert.equal(readRegistry(modulesDir).activeFeature, null);
  } finally {
    cleanup(modulesDir);
  }
});

test('`active` reports a stale Feature pointer and exits non-zero, but still shows it', () => {
  const modulesDir = makeModulesDir();
  try {
    const agency = seedModule(modulesDir, 'Agency');
    run(modulesDir, ['use', agency]);

    const registry = readRegistry(modulesDir);
    registry.activeFeature = 'ghost';
    fs.writeFileSync(
      path.join(modulesDir, 'modules.json'), `${JSON.stringify(registry, null, 2)}\n`, 'utf8'
    );

    const res = run(modulesDir, ['active']);
    // You must be able to LOOK at a broken pointer in order to fix it.
    assert.match(res.out, /ghost/);
    assert.match(res.out, /STALE/);
    assert.equal(res.code, 1);
    assert.match(res.err, /use-feature/);
  } finally {
    cleanup(modulesDir);
  }
});

test('feature stage records against the Feature and says the module is unchanged', () => {
  const modulesDir = makeModulesDir();
  try {
    const agency = seedModule(modulesDir, 'Agency');
    run(modulesDir, ['feature', 'propose', agency, '--name', 'Bulk Export']);
    run(modulesDir, ['feature', 'approve', agency, '--by', 'PO']);
    run(modulesDir, ['feature', 'scaffold', agency, 'bulk-export']);

    const res = run(modulesDir, ['feature', 'stage', agency, 'bulk-export', 'context',
      '--status', 'Pending Review']);
    assert.equal(res.code, 0);
    assert.match(res.out, /feature stages never roll up/);

    assert.equal(listFeatures(modulesDir, agency)[0].stages.context.status, 'Pending Review');
    assert.equal(readModuleState(modulesDir, agency).stages.context.status, 'Not Started');
  } finally {
    cleanup(modulesDir);
  }
});

test('the module README shows CRUD progress and Feature progress as separate sections', () => {
  const modulesDir = makeModulesDir();
  try {
    const agency = seedModule(modulesDir, 'Agency');
    run(modulesDir, ['stage', agency, 'context', '--status', 'Approved']);
    run(modulesDir, ['feature', 'propose', agency, '--name', 'Bulk Export', '--user-story', 'US-7001']);
    run(modulesDir, ['feature', 'approve', agency, '--by', 'PO']);
    run(modulesDir, ['feature', 'scaffold', agency, 'bulk-export']);

    const readme = fs.readFileSync(path.join(modulesDir, agency, 'README.md'), 'utf8');
    assert.match(readme, /## Pipeline Status — consolidated module \(CRUD\) scope/);
    assert.match(readme, /## Features/);
    assert.match(readme, /bulk-export/);
    assert.match(readme, /US-7001/);
    assert.match(readme, /never advances the module/);
  } finally {
    cleanup(modulesDir);
  }
});

test('a CRUD-only module README has no Features section at all', () => {
  const modulesDir = makeModulesDir();
  try {
    const branch = seedModule(modulesDir, 'Branch');
    run(modulesDir, ['stage', branch, 'context', '--status', 'Approved']);

    const readme = fs.readFileSync(path.join(modulesDir, branch, 'README.md'), 'utf8');
    assert.doesNotMatch(readme, /## Features/);
  } finally {
    cleanup(modulesDir);
  }
});

// ── Backward compatibility ───────────────────────────────────────────────────────────────────

test('every module verb still works on a pre-Features registry, unmodified', () => {
  const modulesDir = makeModulesDir();
  try {
    // The exact shape on disk before this change: schemaVersion 1, no features, no activeFeature.
    fs.writeFileSync(path.join(modulesDir, 'modules.json'), `${JSON.stringify({
      schemaVersion: 1,
      activeModules: ['branch'],
      activeScope: 'single',
      previousActiveModules: [],
      modules: [{
        slug: 'branch',
        name: 'Branch',
        status: 'Active',
        description: 'Branch CRUD',
        stages: {
          context: { status: 'Approved', artifactPath: null, lastRun: null, lastUpdated: null, revisionCount: 1, targetRefAtWrite: null },
        },
      }],
    }, null, 2)}\n`, 'utf8');
    fs.mkdirSync(path.join(modulesDir, 'branch'), { recursive: true });

    assert.equal(run(modulesDir, ['list']).code, 0);
    assert.equal(run(modulesDir, ['active']).code, 0);
    assert.equal(run(modulesDir, ['show', 'branch']).code, 0);
    assert.equal(run(modulesDir, ['use', 'branch']).code, 0);
    assert.equal(run(modulesDir, ['feature', 'list', 'branch']).code, 0);
    assert.equal(run(modulesDir, ['inspect-scope']).code, 0);

    // Reading and re-writing it neither bumped the version nor invented Features.
    const after = readRegistry(modulesDir);
    assert.equal(after.schemaVersion, 1);
    assert.equal(after.activeFeature, null);
    assert.equal(after.modules[0].features, undefined);
    assert.equal(fs.existsSync(path.join(modulesDir, 'branch', 'features')), false);
  } finally {
    cleanup(modulesDir);
  }
});
