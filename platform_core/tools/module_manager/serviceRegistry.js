// Service Registry — the NDC Core Service layer's top-level entity: Service → Feature → Supplier/
// Shared. See workflows_and_pipelines/pipeline/module_architecture.md, NDC Core Service section.
//
// WHAT A SERVICE IS
//   A Service (e.g. "NDC_Core_Service") is a THIRD, independent hierarchy layer, a sibling of
//   `modules/` rather than a kind of module. It lives at platform_core_data/services/<service>/ and
//   is registered here, in services/services.json — deliberately a SEPARATE top-level registry from
//   modules/modules.json, so the two addressing systems never collide or get confused.
//
// WHAT A SERVICE IS NOT
//   A Service has no `stages` of its own. Work happens two levels down: a Feature under the Service
//   (Refund, Reissue, Seatmap, Import Booked PNR) reuses moduleRegistry.js's machinery wholesale —
//   `services/<service>/` is simply passed as that function's `modulesDir` — so a Feature's own
//   module.json and its registry cache (services/<service>/modules.json) already carry stage
//   tracking. Giving the Service itself a stages map would be a second, meaningless answer to "is
//   Stage 3 approved?" for a container that never runs a stage.
//
// This file therefore mirrors moduleRegistry.js's registration/approval/list shape (propose → human
// approval → scaffold, never created silently), but only as far as a Service actually needs it.

const fs = require('fs');
const path = require('path');

const {
  assertValidModuleSlug,
  generateModuleSlug,
  uniqueModuleSlug,
} = require('./moduleSlug');
const { writeJsonAtomic } = require('./moduleRegistry');

const REGISTRY_FILENAME = 'services.json';
const SERVICE_STATE_FILENAME = 'service.json';
const REGISTRY_SCHEMA_VERSION = 1;

/** Mirrors MODULE_STATUSES — a Service is proposed, approved, and superseded on the same terms. */
const SERVICE_STATUSES = ['Proposed', 'Active', 'Superseded', 'Archived'];

class ServiceRegistryError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ServiceRegistryError';
  }
}

/** @param {string} servicesDir @returns {string} */
function registryPath(servicesDir) {
  return path.join(servicesDir, REGISTRY_FILENAME);
}

/** @param {string} servicesDir @param {string} slug @returns {string} */
function serviceDir(servicesDir, slug) {
  return path.join(servicesDir, slug);
}

/** @param {string} servicesDir @param {string} slug @returns {string} */
function serviceStatePath(servicesDir, slug) {
  return path.join(serviceDir(servicesDir, slug), SERVICE_STATE_FILENAME);
}

/** An empty registry — a fresh install with no Services yet, not an error. */
function emptyRegistry() {
  return {
    schemaVersion: REGISTRY_SCHEMA_VERSION,
    approvedAt: null,
    approvedBy: null,
    // Kept in a SEPARATE pointer space from modules.json's activeModules/activeFeature — see
    // activeService.js. Two independent addressing systems must never be confused.
    activeService: null,
    activeFeature: null,
    activeSupplier: null,
    switchedAt: null,
    setBy: null,
    services: [],
  };
}

/** @param {string} servicesDir @returns {object} */
function readRegistry(servicesDir) {
  const file = registryPath(servicesDir);
  let raw;
  try {
    raw = fs.readFileSync(file, 'utf8');
  } catch {
    return emptyRegistry();
  }
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new ServiceRegistryError(`${REGISTRY_FILENAME} is not valid JSON: ${err.message}`);
  }
  if (parsed.schemaVersion !== undefined && parsed.schemaVersion > REGISTRY_SCHEMA_VERSION) {
    throw new ServiceRegistryError(
      `${REGISTRY_FILENAME} declares schemaVersion ${parsed.schemaVersion}, but this tool ` +
      `understands ${REGISTRY_SCHEMA_VERSION}. Upgrade the platform rather than editing the file.`
    );
  }
  return { ...emptyRegistry(), ...parsed };
}

/** @param {string} servicesDir @param {object} registry */
function writeRegistry(servicesDir, registry) {
  writeJsonAtomic(registryPath(servicesDir), registry);
}

/**
 * Reads a Service's own service.json — the AUTHORITATIVE record. Null when absent.
 * @param {string} servicesDir @param {string} slug @returns {object|null}
 */
function readServiceState(servicesDir, slug) {
  try {
    return JSON.parse(fs.readFileSync(serviceStatePath(servicesDir, slug), 'utf8'));
  } catch {
    return null;
  }
}

/** @param {string} servicesDir @param {string} slug @param {object} state */
function writeServiceState(servicesDir, slug, state) {
  writeJsonAtomic(serviceStatePath(servicesDir, slug), state);
}

/** @param {object} registry @param {string} slug @returns {object|undefined} */
function findService(registry, slug) {
  return (registry.services || []).find((s) => s.slug === slug);
}

/** @param {object} registry @returns {string[]} */
function listSlugs(registry) {
  return (registry.services || []).map((s) => s.slug);
}

/**
 * A Service's effective state: service.json where it exists, the registry cache otherwise.
 * @param {string} servicesDir @param {string} slug @param {object} [registry]
 * @returns {object|null}
 */
function resolveService(servicesDir, slug, registry) {
  const reg = registry || readRegistry(servicesDir);
  const entry = findService(reg, slug);
  const state = readServiceState(servicesDir, slug);
  if (!entry && !state) return null;
  return { ...(entry || {}), ...(state || {}) };
}

/**
 * Registers/records a Service. Idempotent by slug, same identity rule as registerModule().
 * @param {string} servicesDir
 * @param {{slug?: string, name: string, description?: string, status?: string}} service
 * @param {{now: Date, registry?: object, persist?: boolean}} opts
 * @returns {{registry: object, entry: object, created: boolean}}
 */
function registerService(servicesDir, service, opts = {}) {
  const { now, persist = true } = opts;
  if (!(now instanceof Date) || Number.isNaN(now.getTime())) {
    throw new ServiceRegistryError('registerService requires an explicit valid `now` Date.');
  }
  if (!service || !service.name) {
    throw new ServiceRegistryError('registerService requires a service with a `name`.');
  }

  const registry = opts.registry || readRegistry(servicesDir);
  const status = service.status || 'Active';
  if (!SERVICE_STATUSES.includes(status)) {
    throw new ServiceRegistryError(
      `Unknown service status "${status}". Expected one of: ${SERVICE_STATUSES.join(', ')}.`
    );
  }

  const derived = service.slug ? assertValidModuleSlug(service.slug) : generateModuleSlug(service.name);
  const sameName = service.slug
    ? null
    : (registry.services || []).find((s) => s.slug === derived && s.name === service.name);
  const slug = (service.slug || sameName) ? derived : uniqueModuleSlug(derived, listSlugs(registry));

  const existing = findService(registry, slug);
  const timestamp = now.toISOString();

  const entry = existing
    ? {
      ...existing,
      name: service.name,
      description: service.description ?? existing.description ?? null,
      status,
      updatedAt: timestamp,
    }
    : {
      slug,
      name: service.name,
      description: service.description ?? null,
      status,
      createdAt: timestamp,
      updatedAt: timestamp,
      supersededBy: null,
    };

  registry.services = existing
    ? registry.services.map((s) => (s.slug === slug ? entry : s))
    : [...(registry.services || []), entry];

  if (persist) {
    writeRegistry(servicesDir, registry);
    if (fs.existsSync(serviceDir(servicesDir, slug))) {
      writeServiceState(servicesDir, slug, entry);
    }
  }

  return { registry, entry, created: !existing };
}

/**
 * Records Stage 1-equivalent proposed Services. Proposed, never scaffolded (module_architecture.md
 * §6.4 #4 applies here too — a Service folder on disk reads as "this exists").
 * @param {string} servicesDir
 * @param {Array<{name: string, description?: string, slug?: string}>} proposals
 * @param {{now: Date}} opts
 * @returns {{registry: object, proposed: object[], alreadyPresent: object[]}}
 */
function proposeServices(servicesDir, proposals = [], opts = {}) {
  const { now } = opts;
  if (!(now instanceof Date) || Number.isNaN(now.getTime())) {
    throw new ServiceRegistryError('proposeServices requires an explicit valid `now` Date.');
  }

  let registry = readRegistry(servicesDir);
  const proposed = [];
  const alreadyPresent = [];

  for (const proposal of proposals) {
    const slug = proposal.slug ? assertValidModuleSlug(proposal.slug) : generateModuleSlug(proposal.name);
    const existing = findService(registry, slug);
    if (existing && existing.status !== 'Proposed') {
      alreadyPresent.push(existing);
      continue;
    }
    const result = registerService(
      servicesDir, { ...proposal, slug, status: 'Proposed' }, { now, registry, persist: false }
    );
    registry = result.registry;
    proposed.push(result.entry);
  }

  writeRegistry(servicesDir, registry);
  return { registry, proposed, alreadyPresent };
}

/**
 * Approves proposed Services — `approvedBy` REQUIRED, never defaulted (same reasoning as
 * approveModules()).
 * @param {string} servicesDir
 * @param {string[]} slugs - empty means every Proposed Service
 * @param {{now: Date, approvedBy: string}} opts
 * @returns {{registry: object, approved: object[]}}
 */
function approveServices(servicesDir, slugs = [], opts = {}) {
  const { now, approvedBy } = opts;
  if (!(now instanceof Date) || Number.isNaN(now.getTime())) {
    throw new ServiceRegistryError('approveServices requires an explicit valid `now` Date.');
  }
  if (!approvedBy || !String(approvedBy).trim()) {
    throw new ServiceRegistryError(
      'approveServices requires `approvedBy` — an approval record with no approver is not an approval.'
    );
  }

  const registry = readRegistry(servicesDir);
  const targets = slugs.length
    ? slugs
    : (registry.services || []).filter((s) => s.status === 'Proposed').map((s) => s.slug);

  const approved = [];
  const timestamp = now.toISOString();
  for (const slug of targets) {
    const entry = findService(registry, slug);
    if (!entry) throw new ServiceRegistryError(`No service "${slug}" is registered, so it cannot be approved.`);
    entry.status = 'Active';
    entry.updatedAt = timestamp;
    approved.push(entry);
  }

  registry.approvedAt = timestamp;
  registry.approvedBy = approvedBy;
  writeRegistry(servicesDir, registry);
  return { registry, approved };
}

/**
 * Creates a Service's folder and its service.json. Idempotent; never overwrites an existing file.
 * Does NOT create any Feature subfolder — Refund/Reissue/Seatmap exist as registry entries only
 * until a real request scaffolds them individually (`ndc feature scaffold <feature>`).
 * @param {string} servicesDir @param {string} slug @param {{now: Date}} opts
 * @returns {{created: boolean, wrote: string[]}}
 */
function scaffoldService(servicesDir, slug, opts = {}) {
  const { now } = opts;
  if (!(now instanceof Date) || Number.isNaN(now.getTime())) {
    throw new ServiceRegistryError('scaffoldService requires an explicit valid `now` Date.');
  }
  const registry = readRegistry(servicesDir);
  const entry = opts.entry || findService(registry, slug);
  if (!entry) {
    throw new ServiceRegistryError(`No service "${slug}" is registered. Register it before scaffolding.`);
  }
  if (entry.status === 'Proposed') {
    throw new ServiceRegistryError(
      `Service "${slug}" is still Proposed. Approve it before scaffolding — a scaffolded folder ` +
      'reads as an approved Service.'
    );
  }

  const dir = serviceDir(servicesDir, slug);
  const wrote = [];
  const existed = fs.existsSync(dir);
  if (!existed) {
    fs.mkdirSync(dir, { recursive: true });
    wrote.push(dir);
  }
  const stateFile = serviceStatePath(servicesDir, slug);
  if (!fs.existsSync(stateFile)) {
    writeJsonAtomic(stateFile, entry);
    wrote.push(stateFile);
  }
  return { created: !existed, wrote };
}

/** Every Service with its effective state. @param {string} servicesDir @returns {object[]} */
function listServices(servicesDir) {
  const registry = readRegistry(servicesDir);
  return (registry.services || []).map((entry) => {
    const resolved = resolveService(servicesDir, entry.slug, registry) || entry;
    return { ...resolved, onDisk: fs.existsSync(serviceDir(servicesDir, entry.slug)) };
  });
}

/**
 * Marks a Service superseded by another Service in this same registry. Mirrors
 * moduleRegistry.supersedeModule() — never deleted or renamed on disk.
 * @param {string} servicesDir @param {string} slug @param {string} bySlug @param {{now: Date}} opts
 * @returns {object} the registry
 */
function supersedeService(servicesDir, slug, bySlug, opts = {}) {
  const { now } = opts;
  if (!(now instanceof Date) || Number.isNaN(now.getTime())) {
    throw new ServiceRegistryError('supersedeService requires an explicit valid `now` Date.');
  }
  const registry = readRegistry(servicesDir);
  const entry = findService(registry, slug);
  if (!entry) throw new ServiceRegistryError(`No service "${slug}" is registered.`);
  if (!findService(registry, bySlug)) {
    throw new ServiceRegistryError(`No service "${bySlug}" is registered to supersede "${slug}".`);
  }
  entry.status = 'Superseded';
  entry.supersededBy = bySlug;
  entry.updatedAt = now.toISOString();
  writeRegistry(servicesDir, registry);
  if (fs.existsSync(serviceDir(servicesDir, slug))) writeServiceState(servicesDir, slug, entry);
  return registry;
}

module.exports = {
  REGISTRY_FILENAME,
  SERVICE_STATE_FILENAME,
  REGISTRY_SCHEMA_VERSION,
  SERVICE_STATUSES,
  ServiceRegistryError,
  registryPath,
  serviceDir,
  serviceStatePath,
  emptyRegistry,
  readRegistry,
  writeRegistry,
  readServiceState,
  writeServiceState,
  findService,
  listSlugs,
  resolveService,
  registerService,
  proposeServices,
  approveServices,
  scaffoldService,
  listServices,
  supersedeService,
};
