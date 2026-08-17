// Standalone Features — registry, scaffold, stage independence, and the active-Feature pointer.
//
// Covers decisions A (independent feature stages), B (optional features[] at schemaVersion 1), and
// C (nullable activeFeature pointer with no silent fallback), plus the structural rule that a CRUD
// area never produces a feature folder.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  REGISTRY_SCHEMA_VERSION,
  readRegistry,
  writeRegistry,
  readModuleState,
  registerModule,
  recordStage,
} = require('../moduleRegistry');
const { scaffoldModule } = require('../moduleScaffold');
const {
  FeatureRegistryError,
  approveFeatures,
  findFeature,
  findScopeOverlap,
  hasFeatures,
  listAllFeatures,
  listFeatures,
  proposeFeature,
  recordFeatureStage,
  resolveFeature,
} = require('../featureRegistry');
const {
  FeatureScaffoldError,
  planFeatureScaffold,
  scaffoldFeature,
  featureArtifactPath,
} = require('../featureScaffold');
const {
  ActiveFeatureError,
  setActiveModules,
  setActiveFeature,
  clearActiveFeature,
  clearActiveModules,
  readActiveModules,
  resolveActiveFeature,
  isActiveFeatureStale,
} = require('../activeModule');

const NOW = new Date('2026-08-17T10:00:00Z');
const LATER = new Date('2026-08-17T12:00:00Z');

function makeModulesDir() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'feature-registry-test-'));
  const modulesDir = path.join(root, 'modules');
  fs.mkdirSync(modulesDir, { recursive: true });
  return modulesDir;
}

function cleanup(modulesDir) {
  fs.rmSync(path.dirname(modulesDir), { recursive: true, force: true });
}

/** An Active, scaffolded module — the post-approval state a Feature can be registered under. */
function seedModule(modulesDir, name = 'Agency') {
  const { entry } = registerModule(modulesDir, { name, status: 'Active' }, { now: NOW });
  scaffoldModule(modulesDir, entry.slug, { now: NOW });
  return entry.slug;
}

/** Registers AND approves a Feature — the state most tests start from. */
function seedFeature(modulesDir, moduleSlug, name, extra = {}) {
  const { feature } = proposeFeature(modulesDir, moduleSlug, { name, ...extra }, { now: NOW });
  approveFeatures(modulesDir, moduleSlug, [feature.slug], { now: NOW, approvedBy: 'Reviewer' });
  return feature.slug;
}

// ── Decision B — schema compatibility ────────────────────────────────────────────────────────

test('a schemaVersion 1 registry with no features[] key reads as "no Features", not as an error', () => {
  const modulesDir = makeModulesDir();
  try {
    // Hand-write the exact shape a pre-Features registry has: no `features` key anywhere.
    writeRegistry(modulesDir, {
      schemaVersion: 1,
      activeModules: ['branch'],
      activeScope: 'single',
      modules: [{ slug: 'branch', name: 'Branch', status: 'Active', stages: {} }],
    });

    assert.deepEqual(listFeatures(modulesDir, 'branch'), []);
    assert.equal(hasFeatures(modulesDir, 'branch'), false);
    assert.deepEqual(listAllFeatures(modulesDir), []);
    // And the registry is still readable at version 1 — nothing forced a migration.
    assert.equal(readRegistry(modulesDir).schemaVersion, 1);
  } finally {
    cleanup(modulesDir);
  }
});

test('registering a Feature does NOT bump schemaVersion', () => {
  const modulesDir = makeModulesDir();
  try {
    const slug = seedModule(modulesDir);
    seedFeature(modulesDir, slug, 'Bulk Export');
    assert.equal(readRegistry(modulesDir).schemaVersion, REGISTRY_SCHEMA_VERSION);
    assert.equal(REGISTRY_SCHEMA_VERSION, 1);
  } finally {
    cleanup(modulesDir);
  }
});

test('features[] lands in BOTH module.json and the registry cache, module.json authoritative', () => {
  const modulesDir = makeModulesDir();
  try {
    const slug = seedModule(modulesDir);
    seedFeature(modulesDir, slug, 'Bulk Export', { sourceUserStory: 'US-9001' });

    const state = readModuleState(modulesDir, slug);
    assert.equal(state.features.length, 1);
    assert.equal(state.features[0].sourceUserStory, 'US-9001');

    const cached = readRegistry(modulesDir).modules.find((m) => m.slug === slug);
    assert.equal(cached.features.length, 1);
  } finally {
    cleanup(modulesDir);
  }
});

// ── Feature lifecycle ────────────────────────────────────────────────────────────────────────

test('a proposed Feature is not scaffolded, and scaffolding one is refused', () => {
  const modulesDir = makeModulesDir();
  try {
    const slug = seedModule(modulesDir);
    const { feature } = proposeFeature(modulesDir, slug, { name: 'Bulk Export' }, { now: NOW });

    assert.equal(feature.status, 'Proposed');
    assert.equal(fs.existsSync(path.join(modulesDir, slug, 'features')), false);

    assert.throws(
      () => scaffoldFeature(modulesDir, slug, feature.slug, { now: NOW }),
      (err) => err instanceof FeatureScaffoldError && /still Proposed/.test(err.message)
    );
  } finally {
    cleanup(modulesDir);
  }
});

test('approving requires an approver — an approval with nobody attached is refused', () => {
  const modulesDir = makeModulesDir();
  try {
    const slug = seedModule(modulesDir);
    proposeFeature(modulesDir, slug, { name: 'Bulk Export' }, { now: NOW });
    assert.throws(
      () => approveFeatures(modulesDir, slug, [], { now: NOW }),
      (err) => err instanceof FeatureRegistryError && /approvedBy/.test(err.message)
    );
  } finally {
    cleanup(modulesDir);
  }
});

test('a Feature under a module that does not exist is refused, and creates nothing', () => {
  const modulesDir = makeModulesDir();
  try {
    assert.throws(
      () => proposeFeature(modulesDir, 'nonexistent', { name: 'X' }, { now: NOW }),
      (err) => err instanceof FeatureRegistryError && /No module "nonexistent"/.test(err.message)
    );
    assert.equal(fs.existsSync(path.join(modulesDir, 'nonexistent')), false);
  } finally {
    cleanup(modulesDir);
  }
});

test('re-proposing the same Feature name updates it rather than minting a second one', () => {
  const modulesDir = makeModulesDir();
  try {
    const slug = seedModule(modulesDir);
    proposeFeature(modulesDir, slug, { name: 'Bulk Export' }, { now: NOW });
    const again = proposeFeature(
      modulesDir, slug, { name: 'Bulk Export', description: 'refined' }, { now: LATER }
    );

    assert.equal(again.created, false);
    assert.equal(listFeatures(modulesDir, slug).length, 1);
    assert.equal(listFeatures(modulesDir, slug)[0].description, 'refined');
  } finally {
    cleanup(modulesDir);
  }
});

test('two Features with different names coexist under one module', () => {
  const modulesDir = makeModulesDir();
  try {
    const slug = seedModule(modulesDir);
    seedFeature(modulesDir, slug, 'Bulk Export');
    seedFeature(modulesDir, slug, 'Audit Trail');
    assert.deepEqual(listFeatures(modulesDir, slug).map((f) => f.slug).sort(),
      ['audit-trail', 'bulk-export']);
  } finally {
    cleanup(modulesDir);
  }
});

test('a Feature slug follows the module slug convention', () => {
  const modulesDir = makeModulesDir();
  try {
    const slug = seedModule(modulesDir);
    const { feature } = proposeFeature(
      modulesDir, slug, { name: 'Bulk PNR Export!' }, { now: NOW }
    );
    assert.equal(feature.slug, 'bulk-pnr-export');
  } finally {
    cleanup(modulesDir);
  }
});

// ── Scaffolding ──────────────────────────────────────────────────────────────────────────────

test('scaffolding an approved Feature creates features/<slug>/ with eager context and discovery', () => {
  const modulesDir = makeModulesDir();
  try {
    const slug = seedModule(modulesDir);
    const featureSlug = seedFeature(modulesDir, slug, 'Bulk Export');
    scaffoldFeature(modulesDir, slug, featureSlug, { now: NOW });

    const dir = path.join(modulesDir, slug, 'features', featureSlug);
    assert.ok(fs.existsSync(path.join(dir, 'context')));
    assert.ok(fs.existsSync(path.join(dir, 'discovery', 'findings')));
    assert.ok(fs.existsSync(path.join(dir, 'discovery', 'evidence')));
    assert.ok(fs.existsSync(path.join(dir, 'feature.json')));

    // Not eager — an absent folder still means "that stage did not run".
    assert.equal(fs.existsSync(path.join(dir, 'test_design')), false);
    assert.equal(fs.existsSync(path.join(dir, 'automation')), false);
  } finally {
    cleanup(modulesDir);
  }
});

test('a CRUD-only module never grows an empty features/ folder', () => {
  const modulesDir = makeModulesDir();
  try {
    const slug = seedModule(modulesDir, 'Branch');
    // Everything a CRUD module does: register, scaffold, record every stage.
    for (const stage of ['context', 'discovery', 'test_design']) {
      recordStage(modulesDir, slug, stage, { status: 'Approved' }, { now: NOW });
    }
    assert.equal(fs.existsSync(path.join(modulesDir, slug, 'features')), false);
    assert.equal(hasFeatures(modulesDir, slug), false);
  } finally {
    cleanup(modulesDir);
  }
});

test('scaffolding is idempotent and never overwrites an existing feature artifact', () => {
  const modulesDir = makeModulesDir();
  try {
    const slug = seedModule(modulesDir);
    const featureSlug = seedFeature(modulesDir, slug, 'Bulk Export');
    scaffoldFeature(modulesDir, slug, featureSlug, { now: NOW });

    const contextFile = path.join(
      modulesDir, slug, 'features', featureSlug, 'context', 'ProjectContext.md'
    );
    fs.writeFileSync(contextFile, '# precious', 'utf8');

    const second = scaffoldFeature(modulesDir, slug, featureSlug, { now: LATER });
    assert.equal(second.created, false);
    assert.equal(fs.readFileSync(contextFile, 'utf8'), '# precious');
  } finally {
    cleanup(modulesDir);
  }
});

test('planFeatureScaffold reports what would be created and writes nothing', () => {
  const modulesDir = makeModulesDir();
  try {
    const slug = seedModule(modulesDir);
    const featureSlug = seedFeature(modulesDir, slug, 'Bulk Export');
    const plan = planFeatureScaffold(modulesDir, slug, featureSlug);

    assert.equal(plan.createsFeaturesDir, true);
    assert.ok(plan.createDirs.length > 0);
    assert.equal(fs.existsSync(path.join(modulesDir, slug, 'features')), false);
  } finally {
    cleanup(modulesDir);
  }
});

test('featureArtifactPath renders the documented repo-relative path', () => {
  assert.equal(
    featureArtifactPath('agency', 'bulk-export', 'context'),
    'platform_core_data/modules/agency/features/bulk-export/context'
  );
});

// ── Decision A — feature stages are independent ──────────────────────────────────────────────

test('recording a Feature stage never advances the parent module stage', () => {
  const modulesDir = makeModulesDir();
  try {
    const slug = seedModule(modulesDir);
    const featureSlug = seedFeature(modulesDir, slug, 'Bulk Export');
    scaffoldFeature(modulesDir, slug, featureSlug, { now: NOW });

    recordFeatureStage(
      modulesDir, slug, featureSlug, 'test_design', { status: 'Approved' }, { now: NOW }
    );

    const feature = findFeature(modulesDir, slug, featureSlug);
    assert.equal(feature.stages.test_design.status, 'Approved');

    // The module's own CRUD scope is untouched.
    const module = readModuleState(modulesDir, slug);
    assert.equal(module.stages.test_design.status, 'Not Started');
  } finally {
    cleanup(modulesDir);
  }
});

test('recording a module stage never advances a Feature stage', () => {
  const modulesDir = makeModulesDir();
  try {
    const slug = seedModule(modulesDir);
    const featureSlug = seedFeature(modulesDir, slug, 'Bulk Export');
    recordStage(modulesDir, slug, 'test_design', { status: 'Approved' }, { now: NOW });

    assert.equal(findFeature(modulesDir, slug, featureSlug).stages.test_design.status, 'Not Started');
  } finally {
    cleanup(modulesDir);
  }
});

test('a Feature stage increments its own revision count, and writes feature.json when on disk', () => {
  const modulesDir = makeModulesDir();
  try {
    const slug = seedModule(modulesDir);
    const featureSlug = seedFeature(modulesDir, slug, 'Bulk Export');
    scaffoldFeature(modulesDir, slug, featureSlug, { now: NOW });

    recordFeatureStage(modulesDir, slug, featureSlug, 'context', { status: 'Draft' }, { now: NOW });
    const second = recordFeatureStage(
      modulesDir, slug, featureSlug, 'context', { status: 'Approved' }, { now: LATER }
    );

    assert.equal(second.stages.context.revisionCount, 2);
    const onDisk = JSON.parse(fs.readFileSync(
      path.join(modulesDir, slug, 'features', featureSlug, 'feature.json'), 'utf8'
    ));
    assert.equal(onDisk.module, slug);
    assert.equal(onDisk.stages.context.status, 'Approved');
  } finally {
    cleanup(modulesDir);
  }
});

test('an unregistered Feature cannot record a stage', () => {
  const modulesDir = makeModulesDir();
  try {
    const slug = seedModule(modulesDir);
    assert.throws(
      () => recordFeatureStage(modulesDir, slug, 'ghost', 'context', { status: 'Draft' }, { now: NOW }),
      (err) => err instanceof FeatureRegistryError && /No Feature "ghost"/.test(err.message)
    );
  } finally {
    cleanup(modulesDir);
  }
});

test('resolveFeature reports which stage folders actually exist on disk', () => {
  const modulesDir = makeModulesDir();
  try {
    const slug = seedModule(modulesDir);
    const featureSlug = seedFeature(modulesDir, slug, 'Bulk Export');
    scaffoldFeature(modulesDir, slug, featureSlug, { now: NOW });

    const resolved = resolveFeature(modulesDir, slug, featureSlug);
    assert.equal(resolved.onDisk, true);
    assert.deepEqual(resolved.stagesPresent, ['context', 'discovery']);
  } finally {
    cleanup(modulesDir);
  }
});

// ── Decision C — the active Feature pointer ──────────────────────────────────────────────────

test('activeFeature defaults to null, meaning consolidated module/CRUD scope', () => {
  const modulesDir = makeModulesDir();
  try {
    const slug = seedModule(modulesDir);
    setActiveModules(modulesDir, [slug], { now: NOW });

    assert.equal(readActiveModules(modulesDir).feature, null);
    assert.deepEqual(resolveActiveFeature(modulesDir), {
      module: slug, feature: null, scope: 'module',
    });
  } finally {
    cleanup(modulesDir);
  }
});

test('use-feature sets both pointers, and resolves to feature scope', () => {
  const modulesDir = makeModulesDir();
  try {
    const slug = seedModule(modulesDir);
    const featureSlug = seedFeature(modulesDir, slug, 'Bulk Export');
    setActiveFeature(modulesDir, slug, featureSlug, { now: NOW });

    assert.deepEqual(resolveActiveFeature(modulesDir), {
      module: slug, feature: featureSlug, scope: 'feature',
    });
  } finally {
    cleanup(modulesDir);
  }
});

test('selecting module/CRUD scope clears activeFeature', () => {
  const modulesDir = makeModulesDir();
  try {
    const slug = seedModule(modulesDir);
    const featureSlug = seedFeature(modulesDir, slug, 'Bulk Export');
    setActiveFeature(modulesDir, slug, featureSlug, { now: NOW });

    const registry = setActiveModules(modulesDir, [slug], { now: LATER });
    assert.equal(registry.activeFeature, null);
    assert.equal(registry.clearedFeature, featureSlug);
    assert.equal(resolveActiveFeature(modulesDir).scope, 'module');
  } finally {
    cleanup(modulesDir);
  }
});

test('switching to a different module clears an incompatible activeFeature', () => {
  const modulesDir = makeModulesDir();
  try {
    const agency = seedModule(modulesDir, 'Agency');
    const branch = seedModule(modulesDir, 'Branch');
    const featureSlug = seedFeature(modulesDir, agency, 'Bulk Export');
    setActiveFeature(modulesDir, agency, featureSlug, { now: NOW });

    setActiveModules(modulesDir, [branch], { now: LATER });
    const state = readActiveModules(modulesDir);
    assert.deepEqual(state.modules, [branch]);
    assert.equal(state.feature, null);
    // Not silently carried onto a module it does not belong to.
    assert.equal(resolveActiveFeature(modulesDir).scope, 'module');
  } finally {
    cleanup(modulesDir);
  }
});

test('a Feature pointer that does not belong to the active module FAILS — never falls back', () => {
  const modulesDir = makeModulesDir();
  try {
    const agency = seedModule(modulesDir, 'Agency');
    const branch = seedModule(modulesDir, 'Branch');
    seedFeature(modulesDir, agency, 'Bulk Export');

    // Force the invalid pair directly, as a corrupted or hand-edited pointer would.
    const registry = readRegistry(modulesDir);
    registry.activeModules = [branch];
    registry.activeScope = 'single';
    registry.activeFeature = 'bulk-export';
    writeRegistry(modulesDir, registry);

    assert.equal(isActiveFeatureStale(modulesDir), true);
    assert.throws(
      () => resolveActiveFeature(modulesDir),
      (err) => err instanceof ActiveFeatureError
        && /not a registered Feature of the active module/.test(err.message)
        && /NOT treated as module scope/.test(err.message)
    );
  } finally {
    cleanup(modulesDir);
  }
});

test('a Feature pointer with several active modules is contradictory and fails', () => {
  const modulesDir = makeModulesDir();
  try {
    const agency = seedModule(modulesDir, 'Agency');
    const branch = seedModule(modulesDir, 'Branch');
    const featureSlug = seedFeature(modulesDir, agency, 'Bulk Export');

    const registry = readRegistry(modulesDir);
    registry.activeModules = [agency, branch];
    registry.activeScope = 'multi';
    registry.activeFeature = featureSlug;
    writeRegistry(modulesDir, registry);

    assert.throws(
      () => resolveActiveFeature(modulesDir),
      (err) => err instanceof ActiveFeatureError && /contradictory/.test(err.message)
    );
  } finally {
    cleanup(modulesDir);
  }
});

test('activating a Proposed Feature is refused', () => {
  const modulesDir = makeModulesDir();
  try {
    const slug = seedModule(modulesDir);
    const { feature } = proposeFeature(modulesDir, slug, { name: 'Bulk Export' }, { now: NOW });
    assert.throws(
      () => setActiveFeature(modulesDir, slug, feature.slug, { now: NOW }),
      (err) => err instanceof ActiveFeatureError && /still Proposed/.test(err.message)
    );
  } finally {
    cleanup(modulesDir);
  }
});

test('activating an unknown Feature names what IS registered', () => {
  const modulesDir = makeModulesDir();
  try {
    const slug = seedModule(modulesDir);
    seedFeature(modulesDir, slug, 'Bulk Export');
    assert.throws(
      () => setActiveFeature(modulesDir, slug, 'ghost', { now: NOW }),
      (err) => err instanceof ActiveFeatureError && /bulk-export/.test(err.message)
    );
  } finally {
    cleanup(modulesDir);
  }
});

test('clearActiveFeature drops to module scope without switching modules', () => {
  const modulesDir = makeModulesDir();
  try {
    const slug = seedModule(modulesDir);
    const featureSlug = seedFeature(modulesDir, slug, 'Bulk Export');
    setActiveFeature(modulesDir, slug, featureSlug, { now: NOW });

    clearActiveFeature(modulesDir, { now: LATER });
    const state = readActiveModules(modulesDir);
    assert.deepEqual(state.modules, [slug]);
    assert.equal(state.feature, null);
  } finally {
    cleanup(modulesDir);
  }
});

test('clearing the module selection also clears the Feature pointer', () => {
  const modulesDir = makeModulesDir();
  try {
    const slug = seedModule(modulesDir);
    const featureSlug = seedFeature(modulesDir, slug, 'Bulk Export');
    setActiveFeature(modulesDir, slug, featureSlug, { now: NOW });

    clearActiveModules(modulesDir, { now: LATER });
    assert.equal(readRegistry(modulesDir).activeFeature, null);
  } finally {
    cleanup(modulesDir);
  }
});

test('an orphaned Feature pointer with no active module fails clearly', () => {
  const modulesDir = makeModulesDir();
  try {
    const slug = seedModule(modulesDir);
    seedFeature(modulesDir, slug, 'Bulk Export');
    const registry = readRegistry(modulesDir);
    registry.activeModules = [];
    registry.activeFeature = 'bulk-export';
    writeRegistry(modulesDir, registry);

    assert.throws(
      () => resolveActiveFeature(modulesDir),
      (err) => err instanceof ActiveFeatureError && /no module is active/.test(err.message)
    );
  } finally {
    cleanup(modulesDir);
  }
});

// ── Overlap detection (intake rule #9) ───────────────────────────────────────────────────────

test('overlap detection matches a story reference regardless of punctuation', () => {
  const modulesDir = makeModulesDir();
  try {
    const slug = seedModule(modulesDir);
    seedFeature(modulesDir, slug, 'Bulk Export', { sourceUserStory: 'US-9001' });

    for (const variant of ['US-9001', 'US 9001', 'us9001']) {
      const hit = findScopeOverlap(modulesDir, { userStory: variant });
      assert.equal(hit.features.length, 1, `expected a candidate for "${variant}"`);
    }
  } finally {
    cleanup(modulesDir);
  }
});

test('overlap detection also matches by Feature name, so a renumbered story is still caught', () => {
  const modulesDir = makeModulesDir();
  try {
    const slug = seedModule(modulesDir);
    seedFeature(modulesDir, slug, 'Bulk Export', { sourceUserStory: 'US-9001' });

    // A DIFFERENT story number describing the same capability still surfaces — which is exactly
    // why rule #9 forbids deciding overlap from the number alone.
    const hit = findScopeOverlap(modulesDir, { userStory: 'US-9999', name: 'Bulk Export' });
    assert.equal(hit.features.length, 1);
  } finally {
    cleanup(modulesDir);
  }
});

test('overlap detection reports nothing for genuinely new scope', () => {
  const modulesDir = makeModulesDir();
  try {
    const slug = seedModule(modulesDir);
    seedFeature(modulesDir, slug, 'Bulk Export', { sourceUserStory: 'US-9001' });
    const hit = findScopeOverlap(modulesDir, { userStory: 'US-1234', name: 'Rate Limiting' });
    assert.equal(hit.features.length, 0);
    assert.equal(hit.modules.length, 0);
  } finally {
    cleanup(modulesDir);
  }
});
