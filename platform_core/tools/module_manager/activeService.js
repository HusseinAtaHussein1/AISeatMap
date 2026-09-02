// Active Service Pointer — "which Service/Feature/Supplier is the NDC Core Service pipeline working
// on right now?" The Service-layer analogue of activeModule.js.
//
// See workflows_and_pipelines/pipeline/module_architecture.md, NDC Core Service section.
//
// KEPT IN A SEPARATE POINTER SPACE FROM modules.json's activeModules/activeFeature. These are two
// independent addressing systems — a plain module's `activeFeature` and this file's `activeFeature`
// answer different questions and must never be confused or allowed to collide. This pointer lives in
// services.json, exactly as activeModule.js's lives in modules.json, for the identical reason: it is
// read together with the registry on every NDC stage invocation.
//
// A Feature under a Service is implemented by reusing moduleRegistry.js wholesale — the Feature IS a
// "module" as far as that file is concerned, with `services/<service>/` passed as its `modulesDir`.
// Resolving "which service does this Feature belong to" therefore means searching every registered
// Service's own modules.json, because the CLI surface (`ndc use-feature <feature>`, `ndc supplier ...
// <feature> ...`) deliberately does not require the human to name the Service every time — today
// there is exactly one (`ndc-core-service`), and a Feature slug is unique within it. Ambiguity across
// several Services is reported, never silently resolved to the first match.

const path = require('path');

const {
  readRegistry,
  writeRegistry,
  findService,
  listSlugs,
} = require('./serviceRegistry');
const {
  readRegistry: readModuleRegistry,
  findModule,
} = require('./moduleRegistry');
const { resolveModuleSlug, resolveModuleSlugStrict } = require('./moduleSlug');
const {
  findSupplier,
} = require('./supplierRegistry');

class ActiveServiceError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ActiveServiceError';
  }
}

/** @param {object} registry @returns {string[]} every Active service slug */
function activeServiceSlugs(registry) {
  return (registry.services || []).filter((s) => s.status === 'Active').map((s) => s.slug);
}

/**
 * Points the pipeline at one Service.
 * @param {string} servicesDir @param {string} identifier @param {{now: Date, setBy?: string}} opts
 * @returns {object} the updated registry
 */
function setActiveService(servicesDir, identifier, opts = {}) {
  const { now, setBy } = opts;
  if (!(now instanceof Date) || Number.isNaN(now.getTime())) {
    throw new ActiveServiceError('setActiveService requires an explicit valid `now` Date.');
  }
  const registry = readRegistry(servicesDir);
  const known = listSlugs(registry);
  if (!known.length) {
    throw new ActiveServiceError('No services are registered yet. Propose and approve one first.');
  }

  const slug = resolveModuleSlug(known, identifier);
  if (!slug) {
    const strict = resolveModuleSlugStrict(known, identifier);
    if (strict.ambiguous) {
      throw new ActiveServiceError(
        `"${identifier}" matches ${strict.candidates.length} services: ${strict.candidates.join(', ')}.`
      );
    }
    throw new ActiveServiceError(`No service matches "${identifier}".`);
  }
  const entry = findService(registry, slug);
  if (entry.status === 'Proposed') {
    throw new ActiveServiceError(`Service "${slug}" is still Proposed and has not been approved.`);
  }
  if (entry.status === 'Superseded') {
    throw new ActiveServiceError(`Service "${slug}" is Superseded by "${entry.supersededBy}".`);
  }

  registry.activeService = slug;
  registry.activeFeature = null;
  registry.activeSupplier = null;
  registry.switchedAt = now.toISOString();
  registry.setBy = setBy || 'Module Manager';
  writeRegistry(servicesDir, registry);
  return registry;
}

/**
 * Finds which registered Service holds a Feature with this slug.
 * @param {string} servicesDir @param {string} featureSlug
 * @returns {{serviceSlug: string, entry: object}}
 */
function findFeatureAcrossServices(servicesDir, featureSlug) {
  const registry = readRegistry(servicesDir);
  const hits = [];
  for (const svc of registry.services || []) {
    const svcDir = path.join(servicesDir, svc.slug);
    const modReg = readModuleRegistry(svcDir);
    const entry = findModule(modReg, featureSlug);
    if (entry) hits.push({ serviceSlug: svc.slug, entry });
  }
  if (!hits.length) {
    throw new ActiveServiceError(
      `No Feature "${featureSlug}" is registered under any Service. ` +
      'Run `cli.js ndc feature list` to see registered Features.'
    );
  }
  if (hits.length > 1) {
    throw new ActiveServiceError(
      `Feature "${featureSlug}" is registered under ${hits.length} services: ` +
      `${hits.map((h) => h.serviceSlug).join(', ')}. This tool cannot disambiguate — ` +
      'pass the Service explicitly via the registry functions directly.'
    );
  }
  return hits[0];
}

/**
 * Points the pipeline at a Feature — resolves its Service automatically (see file header), and sets
 * BOTH pointers together, exactly as activeModule.js's setActiveFeature() does for a plain Feature.
 * @param {string} servicesDir @param {string} featureSlug @param {{now: Date, setBy?: string}} opts
 * @returns {object} the updated registry
 */
function setActiveNdcFeature(servicesDir, featureSlug, opts = {}) {
  const { now, setBy } = opts;
  if (!(now instanceof Date) || Number.isNaN(now.getTime())) {
    throw new ActiveServiceError('setActiveNdcFeature requires an explicit valid `now` Date.');
  }
  const { serviceSlug, entry } = findFeatureAcrossServices(servicesDir, featureSlug);

  if (entry.status === 'Proposed') {
    throw new ActiveServiceError(
      `Feature "${featureSlug}" is still Proposed and has not been approved. Approve it before activating.`
    );
  }
  if (entry.status === 'Superseded') {
    throw new ActiveServiceError(`Feature "${featureSlug}" is Superseded by "${entry.supersededBy}".`);
  }

  const registry = readRegistry(servicesDir);
  registry.activeService = serviceSlug;
  registry.activeFeature = entry.slug;
  registry.activeSupplier = null;
  registry.switchedAt = now.toISOString();
  registry.setBy = setBy || 'Module Manager';
  writeRegistry(servicesDir, registry);
  return registry;
}

/**
 * Points the pipeline at a Supplier under a Feature — resolves the Feature's Service automatically,
 * and sets all three pointers together (a Supplier is unresolvable without naming its Service and
 * Feature, exactly as a plain Feature is unresolvable without its module).
 * @param {string} servicesDir @param {string} featureSlug @param {string} supplierSlug
 * @param {{now: Date, setBy?: string}} opts
 * @returns {object} the updated registry
 */
function setActiveSupplier(servicesDir, featureSlug, supplierSlug, opts = {}) {
  const { now, setBy } = opts;
  if (!(now instanceof Date) || Number.isNaN(now.getTime())) {
    throw new ActiveServiceError('setActiveSupplier requires an explicit valid `now` Date.');
  }
  const { serviceSlug, entry: featureEntry } = findFeatureAcrossServices(servicesDir, featureSlug);
  const svcDir = path.join(servicesDir, serviceSlug);
  const supplier = findSupplier(svcDir, featureEntry.slug, supplierSlug);

  if (!supplier) {
    throw new ActiveServiceError(
      `No Supplier "${supplierSlug}" is registered under Feature "${featureEntry.slug}".`
    );
  }
  if (supplier.status === 'Proposed') {
    throw new ActiveServiceError(`Supplier "${supplierSlug}" is still Proposed and has not been approved.`);
  }
  if (supplier.status === 'Superseded') {
    throw new ActiveServiceError(`Supplier "${supplierSlug}" is Superseded by "${supplier.supersededBy}".`);
  }

  const registry = readRegistry(servicesDir);
  registry.activeService = serviceSlug;
  registry.activeFeature = featureEntry.slug;
  registry.activeSupplier = supplier.slug;
  registry.switchedAt = now.toISOString();
  registry.setBy = setBy || 'Module Manager';
  writeRegistry(servicesDir, registry);
  return registry;
}

/**
 * The active NDC selection, read as data. Never throws on a stale pointer — same "look before you
 * fix it" contract as readActiveModules().
 * @param {string} servicesDir @returns {{service: string|null, feature: string|null, supplier: string|null}}
 */
function readActiveService(servicesDir) {
  const registry = readRegistry(servicesDir);
  return {
    service: registry.activeService ?? null,
    feature: registry.activeFeature ?? null,
    supplier: registry.activeSupplier ?? null,
    switchedAt: registry.switchedAt ?? null,
    setBy: registry.setBy ?? null,
  };
}

/**
 * Clears the entire NDC selection.
 * @param {string} servicesDir @param {{now: Date, setBy?: string}} opts
 * @returns {object} the registry
 */
function clearActiveService(servicesDir, opts = {}) {
  const { now, setBy } = opts;
  if (!(now instanceof Date) || Number.isNaN(now.getTime())) {
    throw new ActiveServiceError('clearActiveService requires an explicit valid `now` Date.');
  }
  const registry = readRegistry(servicesDir);
  registry.activeService = null;
  registry.activeFeature = null;
  registry.activeSupplier = null;
  registry.switchedAt = now.toISOString();
  registry.setBy = setBy || 'Module Manager';
  writeRegistry(servicesDir, registry);
  return registry;
}

module.exports = {
  ActiveServiceError,
  activeServiceSlugs,
  setActiveService,
  findFeatureAcrossServices,
  setActiveNdcFeature,
  setActiveSupplier,
  readActiveService,
  clearActiveService,
};
