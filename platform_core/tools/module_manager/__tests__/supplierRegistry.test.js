// Supplier Registry — Suppliers registered under an NDC Core Service Feature.
//
// A Feature is implemented by reusing moduleRegistry.js wholesale: `services/<service>/` is passed
// as its `modulesDir`, and the Feature slug is its "module" slug. These tests therefore seed a
// Feature the same way, then exercise supplierRegistry.js against it.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { registerModule, readModuleState, readRegistry } = require('../moduleRegistry');
const { scaffoldModule } = require('../moduleScaffold');
const {
  SupplierRegistryError,
  proposeSupplier,
  approveSuppliers,
  recordSupplierStage,
  resolveSupplier,
  scaffoldSupplier,
  listSuppliers,
  listAllSuppliers,
  findSupplier,
  hasSuppliers,
} = require('../supplierRegistry');

const NOW = new Date('2026-09-02T08:00:00Z');
const LATER = new Date('2026-09-02T09:00:00Z');

function makeSvcDir() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'supplier-registry-test-'));
  const svcDir = path.join(root, 'ndc-core-service');
  fs.mkdirSync(svcDir, { recursive: true });
  return svcDir;
}
const cleanup = (d) => fs.rmSync(path.dirname(d), { recursive: true, force: true });

/** Seeds an Active, scaffolded Feature — the host a Supplier registers under. */
function seedFeature(svcDir, name = 'Import Booked PNR') {
  const { entry } = registerModule(
    svcDir, { name, status: 'Active', kind: 'ndc_feature', service: 'ndc-core-service' }, { now: NOW }
  );
  scaffoldModule(svcDir, entry.slug, { now: NOW });
  return entry.slug;
}

function seedSupplier(svcDir, featureSlug, name = 'NDCGal') {
  const { supplier } = proposeSupplier(svcDir, 'ndc-core-service', featureSlug, { name }, { now: NOW });
  approveSuppliers(svcDir, featureSlug, [supplier.slug], { now: NOW, approvedBy: 'Reviewer' });
  return supplier.slug;
}

test('a Feature carries kind:ndc_feature and service — never mistaken for a plain module', () => {
  const svcDir = makeSvcDir();
  try {
    const slug = seedFeature(svcDir);
    const state = readModuleState(svcDir, slug);
    assert.equal(state.kind, 'ndc_feature');
    assert.equal(state.service, 'ndc-core-service');
  } finally {
    cleanup(svcDir);
  }
});

test('proposeSupplier requires the parent Feature to exist first', () => {
  const svcDir = makeSvcDir();
  try {
    assert.throws(
      () => proposeSupplier(svcDir, 'ndc-core-service', 'nonexistent', { name: 'NDCGal' }, { now: NOW }),
      (err) => err instanceof SupplierRegistryError && /No Feature "nonexistent"/.test(err.message)
    );
  } finally {
    cleanup(svcDir);
  }
});

test('a proposed Supplier is not scaffolded, and scaffolding one is refused', () => {
  const svcDir = makeSvcDir();
  try {
    const featureSlug = seedFeature(svcDir);
    const { supplier } = proposeSupplier(svcDir, 'ndc-core-service', featureSlug, { name: 'NDCGal' }, { now: NOW });
    assert.equal(supplier.status, 'Proposed');
    assert.equal(fs.existsSync(path.join(svcDir, featureSlug, 'suppliers')), false);
    assert.throws(
      () => scaffoldSupplier(svcDir, featureSlug, supplier.slug, { now: NOW }),
      (err) => err instanceof SupplierRegistryError && /still Proposed/.test(err.message)
    );
  } finally {
    cleanup(svcDir);
  }
});

test('approving a Supplier requires an approver', () => {
  const svcDir = makeSvcDir();
  try {
    const featureSlug = seedFeature(svcDir);
    proposeSupplier(svcDir, 'ndc-core-service', featureSlug, { name: 'NDCGal' }, { now: NOW });
    assert.throws(
      () => approveSuppliers(svcDir, featureSlug, [], { now: NOW }),
      (err) => err instanceof SupplierRegistryError && /approvedBy/.test(err.message)
    );
  } finally {
    cleanup(svcDir);
  }
});

test('scaffolding an approved Supplier creates suppliers/<slug>/ with eager context/discovery', () => {
  const svcDir = makeSvcDir();
  try {
    const featureSlug = seedFeature(svcDir);
    const supplierSlug = seedSupplier(svcDir, featureSlug);
    scaffoldSupplier(svcDir, featureSlug, supplierSlug, { now: NOW });

    const dir = path.join(svcDir, featureSlug, 'suppliers', supplierSlug);
    assert.ok(fs.existsSync(path.join(dir, 'context')));
    assert.ok(fs.existsSync(path.join(dir, 'discovery')));
    assert.ok(fs.existsSync(path.join(dir, 'supplier.json')));
    assert.equal(fs.existsSync(path.join(dir, 'test_design')), false);

    const onDisk = JSON.parse(fs.readFileSync(path.join(dir, 'supplier.json'), 'utf8'));
    assert.equal(onDisk.service, 'ndc-core-service');
    assert.equal(onDisk.feature, featureSlug);
  } finally {
    cleanup(svcDir);
  }
});

test('two Suppliers with the same name under DIFFERENT Features are independent', () => {
  const svcDir = makeSvcDir();
  try {
    const refund = seedFeature(svcDir, 'Refund');
    const pnr = seedFeature(svcDir, 'Import Booked PNR');
    const refundGal = seedSupplier(svcDir, refund, 'NDCGal');
    const pnrGal = seedSupplier(svcDir, pnr, 'NDCGal');

    scaffoldSupplier(svcDir, refund, refundGal, { now: NOW });
    scaffoldSupplier(svcDir, pnr, pnrGal, { now: NOW });

    recordSupplierStage(svcDir, refund, refundGal, 'context', { status: 'Approved' }, { now: NOW });

    // The SAME supplier name under a different Feature is untouched.
    assert.equal(findSupplier(svcDir, pnr, pnrGal).stages.context.status, 'Not Started');
    assert.equal(findSupplier(svcDir, refund, refundGal).stages.context.status, 'Approved');
  } finally {
    cleanup(svcDir);
  }
});

test('recording a Supplier stage never advances the parent Feature stage', () => {
  const svcDir = makeSvcDir();
  try {
    const featureSlug = seedFeature(svcDir);
    const supplierSlug = seedSupplier(svcDir, featureSlug);
    scaffoldSupplier(svcDir, featureSlug, supplierSlug, { now: NOW });

    recordSupplierStage(svcDir, featureSlug, supplierSlug, 'test_design', { status: 'Approved' }, { now: NOW });

    assert.equal(findSupplier(svcDir, featureSlug, supplierSlug).stages.test_design.status, 'Approved');
    const feature = readModuleState(svcDir, featureSlug);
    assert.equal(feature.stages.test_design.status, 'Not Started');
  } finally {
    cleanup(svcDir);
  }
});

test('a Supplier stage increments its own revision count, and writes supplier.json when on disk', () => {
  const svcDir = makeSvcDir();
  try {
    const featureSlug = seedFeature(svcDir);
    const supplierSlug = seedSupplier(svcDir, featureSlug);
    scaffoldSupplier(svcDir, featureSlug, supplierSlug, { now: NOW });

    recordSupplierStage(svcDir, featureSlug, supplierSlug, 'context', { status: 'Draft' }, { now: NOW });
    const second = recordSupplierStage(
      svcDir, featureSlug, supplierSlug, 'context', { status: 'Approved' }, { now: LATER }
    );
    assert.equal(second.stages.context.revisionCount, 2);

    const onDisk = JSON.parse(fs.readFileSync(
      path.join(svcDir, featureSlug, 'suppliers', supplierSlug, 'supplier.json'), 'utf8'
    ));
    assert.equal(onDisk.stages.context.status, 'Approved');
  } finally {
    cleanup(svcDir);
  }
});

test('an unregistered Supplier cannot record a stage', () => {
  const svcDir = makeSvcDir();
  try {
    const featureSlug = seedFeature(svcDir);
    assert.throws(
      () => recordSupplierStage(svcDir, featureSlug, 'ghost', 'context', { status: 'Draft' }, { now: NOW }),
      (err) => err instanceof SupplierRegistryError && /No Supplier "ghost"/.test(err.message)
    );
  } finally {
    cleanup(svcDir);
  }
});

test('resolveSupplier reports which stage folders actually exist on disk', () => {
  const svcDir = makeSvcDir();
  try {
    const featureSlug = seedFeature(svcDir);
    const supplierSlug = seedSupplier(svcDir, featureSlug);
    scaffoldSupplier(svcDir, featureSlug, supplierSlug, { now: NOW });

    const resolved = resolveSupplier(svcDir, featureSlug, supplierSlug);
    assert.equal(resolved.onDisk, true);
    assert.deepEqual(resolved.stagesPresent, ['context', 'discovery']);
  } finally {
    cleanup(svcDir);
  }
});

test('a Feature with no Suppliers reports hasSuppliers false and an empty list', () => {
  const svcDir = makeSvcDir();
  try {
    const featureSlug = seedFeature(svcDir);
    assert.equal(hasSuppliers(svcDir, featureSlug), false);
    assert.deepEqual(listSuppliers(svcDir, featureSlug), []);
  } finally {
    cleanup(svcDir);
  }
});

test('listAllSuppliers flattens Suppliers across every Feature under one service', () => {
  const svcDir = makeSvcDir();
  try {
    const refund = seedFeature(svcDir, 'Refund');
    const pnr = seedFeature(svcDir, 'Import Booked PNR');
    seedSupplier(svcDir, refund, 'NDCGal');
    seedSupplier(svcDir, pnr, 'SabreNDC');

    const all = listAllSuppliers(svcDir);
    assert.equal(all.length, 2);
    assert.deepEqual(all.map((s) => s.feature).sort(), [pnr, refund].sort());
  } finally {
    cleanup(svcDir);
  }
});

test('the suppliers[] cache lands in BOTH the Feature module.json and the modules.json registry', () => {
  const svcDir = makeSvcDir();
  try {
    const featureSlug = seedFeature(svcDir);
    seedSupplier(svcDir, featureSlug, 'NDCGal');

    const state = readModuleState(svcDir, featureSlug);
    assert.equal(state.suppliers.length, 1);

    const registry = readRegistry(svcDir);
    const cached = registry.modules.find((m) => m.slug === featureSlug);
    assert.equal(cached.suppliers.length, 1);
  } finally {
    cleanup(svcDir);
  }
});
