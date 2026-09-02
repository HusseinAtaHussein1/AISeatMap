// Service Registry — the NDC Core Service layer's top-level entity (services/services.json).

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  ServiceRegistryError,
  registerService,
  proposeServices,
  approveServices,
  scaffoldService,
  listServices,
  resolveService,
  supersedeService,
  readRegistry,
} = require('../serviceRegistry');

const NOW = new Date('2026-09-02T08:00:00Z');
const LATER = new Date('2026-09-02T09:00:00Z');

function makeServicesDir() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'service-registry-test-'));
  const servicesDir = path.join(root, 'services');
  fs.mkdirSync(servicesDir, { recursive: true });
  return servicesDir;
}
const cleanup = (d) => fs.rmSync(path.dirname(d), { recursive: true, force: true });

test('registerService derives a slug and registers an Active entry by default', () => {
  const servicesDir = makeServicesDir();
  try {
    const { entry, created } = registerService(servicesDir, { name: 'NDC_Core_Service' }, { now: NOW });
    assert.equal(created, true);
    assert.equal(entry.slug, 'ndc-core-service');
    assert.equal(entry.status, 'Active');
  } finally {
    cleanup(servicesDir);
  }
});

test('proposeServices registers as Proposed and does NOT scaffold a folder', () => {
  const servicesDir = makeServicesDir();
  try {
    const { proposed } = proposeServices(servicesDir, [{ name: 'NDC_Core_Service' }], { now: NOW });
    assert.equal(proposed[0].status, 'Proposed');
    assert.equal(fs.existsSync(path.join(servicesDir, 'ndc-core-service')), false);
  } finally {
    cleanup(servicesDir);
  }
});

test('approveServices requires an approver and flips Proposed to Active', () => {
  const servicesDir = makeServicesDir();
  try {
    proposeServices(servicesDir, [{ name: 'NDC_Core_Service' }], { now: NOW });
    assert.throws(
      () => approveServices(servicesDir, [], { now: NOW }),
      (err) => err instanceof ServiceRegistryError && /approvedBy/.test(err.message)
    );
    const { approved } = approveServices(servicesDir, [], { now: LATER, approvedBy: 'Reviewer' });
    assert.equal(approved[0].status, 'Active');
  } finally {
    cleanup(servicesDir);
  }
});

test('scaffolding a Proposed service is refused — a folder on disk reads as approval', () => {
  const servicesDir = makeServicesDir();
  try {
    proposeServices(servicesDir, [{ name: 'NDC_Core_Service' }], { now: NOW });
    assert.throws(
      () => scaffoldService(servicesDir, 'ndc-core-service', { now: NOW }),
      (err) => err instanceof ServiceRegistryError && /still Proposed/.test(err.message)
    );
  } finally {
    cleanup(servicesDir);
  }
});

test('scaffolding an approved service creates the folder and service.json, idempotently', () => {
  const servicesDir = makeServicesDir();
  try {
    proposeServices(servicesDir, [{ name: 'NDC_Core_Service' }], { now: NOW });
    approveServices(servicesDir, [], { now: NOW, approvedBy: 'Reviewer' });
    const first = scaffoldService(servicesDir, 'ndc-core-service', { now: NOW });
    assert.equal(first.created, true);
    assert.ok(fs.existsSync(path.join(servicesDir, 'ndc-core-service', 'service.json')));

    // No sub-folder created eagerly for any Feature — Refund/Reissue/Seatmap exist as registry
    // entries only, never as scaffolded folders, until real work arrives.
    assert.deepEqual(fs.readdirSync(path.join(servicesDir, 'ndc-core-service')), ['service.json']);

    const second = scaffoldService(servicesDir, 'ndc-core-service', { now: LATER });
    assert.equal(second.created, false);
    assert.equal(second.wrote.length, 0);
  } finally {
    cleanup(servicesDir);
  }
});

test('registering the same Service name twice updates it rather than minting a second one', () => {
  const servicesDir = makeServicesDir();
  try {
    registerService(servicesDir, { name: 'NDC_Core_Service' }, { now: NOW });
    const { entry, created } = registerService(
      servicesDir, { name: 'NDC_Core_Service', description: 'refined' }, { now: LATER }
    );
    assert.equal(created, false);
    assert.equal(entry.description, 'refined');
    assert.equal(listServices(servicesDir).length, 1);
  } finally {
    cleanup(servicesDir);
  }
});

test('resolveService prefers service.json (authoritative) over the registry cache', () => {
  const servicesDir = makeServicesDir();
  try {
    proposeServices(servicesDir, [{ name: 'NDC_Core_Service' }], { now: NOW });
    approveServices(servicesDir, [], { now: NOW, approvedBy: 'Reviewer' });
    scaffoldService(servicesDir, 'ndc-core-service', { now: NOW });

    // Hand-corrupt the registry cache to prove service.json wins.
    const registry = readRegistry(servicesDir);
    registry.services[0].name = 'STALE CACHE NAME';
    fs.writeFileSync(
      path.join(servicesDir, 'services.json'), JSON.stringify(registry, null, 2), 'utf8'
    );

    const resolved = resolveService(servicesDir, 'ndc-core-service');
    assert.equal(resolved.name, 'NDC_Core_Service');
  } finally {
    cleanup(servicesDir);
  }
});

test('supersedeService marks Superseded without renaming or deleting the folder', () => {
  const servicesDir = makeServicesDir();
  try {
    registerService(servicesDir, { name: 'Old Service', slug: 'old-service' }, { now: NOW });
    registerService(servicesDir, { name: 'New Service', slug: 'new-service' }, { now: NOW });
    scaffoldService(servicesDir, 'old-service', { now: NOW });

    supersedeService(servicesDir, 'old-service', 'new-service', { now: LATER });
    const old = resolveService(servicesDir, 'old-service');
    assert.equal(old.status, 'Superseded');
    assert.equal(old.supersededBy, 'new-service');
    assert.ok(fs.existsSync(path.join(servicesDir, 'old-service')));
  } finally {
    cleanup(servicesDir);
  }
});

test('a schemaVersion 1 registry with no services yet reads as empty, not an error', () => {
  const servicesDir = makeServicesDir();
  try {
    assert.deepEqual(listServices(servicesDir), []);
    assert.equal(readRegistry(servicesDir).schemaVersion, 1);
  } finally {
    cleanup(servicesDir);
  }
});
