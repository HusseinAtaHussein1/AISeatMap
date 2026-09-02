// featureRegistry.js's FEATURES_DIRNAME generalization — the ONE surgical change existing code took
// for the NDC Core Service layer's shared-scope entities (module_architecture.md, NDC section).
//
// Every existing caller omits `dirname` and must get BYTE-IDENTICAL behavior to before: this file
// proves that default (agency/branch/plain-module Feature calls), then proves a caller that DOES
// pass `dirname: 'shared'` gets a fully independent, non-colliding namespace alongside it.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { registerModule } = require('../moduleRegistry');
const { scaffoldModule } = require('../moduleScaffold');
const {
  featuresDir,
  featureDir,
  featureStatePath,
  proposeFeature,
  approveFeatures,
  recordFeatureStage,
  resolveFeature,
  FEATURES_DIRNAME,
} = require('../featureRegistry');
const {
  planFeatureScaffold,
  scaffoldFeature,
  featureArtifactPath,
} = require('../featureScaffold');

const NOW = new Date('2026-09-02T08:00:00Z');
const LATER = new Date('2026-09-02T09:00:00Z');

function makeModulesDir() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'feature-dirname-test-'));
  const modulesDir = path.join(root, 'modules');
  fs.mkdirSync(modulesDir, { recursive: true });
  return modulesDir;
}
const cleanup = (d) => fs.rmSync(path.dirname(d), { recursive: true, force: true });

function seedModule(modulesDir, name = 'Import Booked PNR') {
  const { entry } = registerModule(modulesDir, { name, status: 'Active' }, { now: NOW });
  scaffoldModule(modulesDir, entry.slug, { now: NOW });
  return entry.slug;
}

// ── Default behavior is unchanged ───────────────────────────────────────────────────────────────

test('featuresDir/featureDir/featureStatePath default to "features" exactly as before', () => {
  assert.equal(featuresDir('/root', 'agency'), path.join('/root', 'agency', 'features'));
  assert.equal(featuresDir('/root', 'agency', FEATURES_DIRNAME), featuresDir('/root', 'agency'));
  assert.equal(featureDir('/root', 'agency', 'bulk-export'), path.join('/root', 'agency', 'features', 'bulk-export'));
  assert.equal(
    featureStatePath('/root', 'agency', 'bulk-export'),
    path.join('/root', 'agency', 'features', 'bulk-export', 'feature.json')
  );
});

test('featureArtifactPath default rendering is unchanged', () => {
  assert.equal(
    featureArtifactPath('agency', 'bulk-export', 'context'),
    'platform_core_data/modules/agency/features/bulk-export/context'
  );
});

test('a full propose→approve→scaffold→stage flow with no dirname behaves exactly as the plain-module tests expect', () => {
  const modulesDir = makeModulesDir();
  try {
    const slug = seedModule(modulesDir, 'Branch');
    const { feature } = proposeFeature(modulesDir, slug, { name: 'Bulk Export' }, { now: NOW });
    approveFeatures(modulesDir, slug, [feature.slug], { now: NOW, approvedBy: 'Reviewer' });
    scaffoldFeature(modulesDir, slug, feature.slug, { now: NOW });

    const dir = path.join(modulesDir, slug, 'features', feature.slug);
    assert.ok(fs.existsSync(path.join(dir, 'context')));
    assert.ok(fs.existsSync(path.join(dir, 'feature.json')));

    const updated = recordFeatureStage(
      modulesDir, slug, feature.slug, 'context', { status: 'Approved' }, { now: LATER }
    );
    assert.equal(updated.stages.context.status, 'Approved');
    assert.equal(resolveFeature(modulesDir, slug, feature.slug).onDisk, true);
  } finally {
    cleanup(modulesDir);
  }
});

// ── dirname: 'shared' is a fully independent, non-colliding namespace ──────────────────────────

test('dirname "shared" scaffolds under shared/ instead of features/, and features/ is never created', () => {
  const modulesDir = makeModulesDir();
  try {
    const slug = seedModule(modulesDir);
    const { feature } = proposeFeature(modulesDir, slug, { name: 'New Layer Contract' }, { now: NOW });
    approveFeatures(modulesDir, slug, [feature.slug], { now: NOW, approvedBy: 'Reviewer' });

    const plan = planFeatureScaffold(modulesDir, slug, feature.slug, 'shared');
    assert.ok(plan.featureDir.includes(`${path.sep}shared${path.sep}`));

    scaffoldFeature(modulesDir, slug, feature.slug, { now: NOW, dirname: 'shared' });

    assert.ok(fs.existsSync(path.join(modulesDir, slug, 'shared', feature.slug, 'feature.json')));
    assert.equal(fs.existsSync(path.join(modulesDir, slug, 'features')), false);
  } finally {
    cleanup(modulesDir);
  }
});

test('recordFeatureStage with dirname "shared" writes feature.json under shared/, never under features/', () => {
  const modulesDir = makeModulesDir();
  try {
    const slug = seedModule(modulesDir);
    const { feature } = proposeFeature(modulesDir, slug, { name: 'New Layer Contract' }, { now: NOW });
    approveFeatures(modulesDir, slug, [feature.slug], { now: NOW, approvedBy: 'Reviewer' });
    scaffoldFeature(modulesDir, slug, feature.slug, { now: NOW, dirname: 'shared' });

    recordFeatureStage(
      modulesDir, slug, feature.slug, 'context', { status: 'Approved' }, { now: LATER, dirname: 'shared' }
    );

    const onDisk = JSON.parse(fs.readFileSync(
      path.join(modulesDir, slug, 'shared', feature.slug, 'feature.json'), 'utf8'
    ));
    assert.equal(onDisk.stages.context.status, 'Approved');
    assert.equal(fs.existsSync(path.join(modulesDir, slug, 'features', feature.slug, 'feature.json')), false);
  } finally {
    cleanup(modulesDir);
  }
});

test('resolveFeature with dirname "shared" reports stage folders from shared/, not features/', () => {
  const modulesDir = makeModulesDir();
  try {
    const slug = seedModule(modulesDir);
    const { feature } = proposeFeature(modulesDir, slug, { name: 'New Layer Contract' }, { now: NOW });
    approveFeatures(modulesDir, slug, [feature.slug], { now: NOW, approvedBy: 'Reviewer' });
    scaffoldFeature(modulesDir, slug, feature.slug, { now: NOW, dirname: 'shared' });

    const resolved = resolveFeature(modulesDir, slug, feature.slug, 'shared');
    assert.equal(resolved.onDisk, true);
    assert.deepEqual(resolved.stagesPresent, ['context', 'discovery']);
  } finally {
    cleanup(modulesDir);
  }
});
