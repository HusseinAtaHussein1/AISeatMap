// Active Supplier Feature Pointer — "which Supplier Feature / Supplier is the pipeline working on
// right now?" The Supplier Features layer's analogue of activeModule.js.
//
// See workflows_and_pipelines/pipeline/module_architecture.md, Supplier Features section.
//
// KEPT IN A SEPARATE POINTER SPACE FROM modules.json's activeModules/activeFeature. These are two
// independent addressing systems, and the words collide dangerously: a classic module's
// `activeFeature` means "which standalone Feature UNDER the active module", while this file's
// `activeFeature` means "which top-level Supplier Feature". They answer different questions about
// different registries and must never be confused. This pointer therefore lives in the Supplier
// Features registry (supplier-features/modules.json), read together with that registry on every
// stage invocation — exactly as activeModule.js's pointer lives in modules/modules.json.
//
// WHY THIS IS SMALLER THAN THE activeService.js IT REPLACES
//   The retired Service tier meant a Feature lived under a VARIABLE parent folder, so activating one
//   first had to search every registered Service's own modules.json to discover its owner. There is
//   no Service tier any more: `supplier-features/` is a fixed root and a Feature slug is unique
//   within its one registry, so resolution is a direct lookup — the same way a classic module is
//   resolved. The whole findFeatureAcrossServices() step simply no longer exists.

const {
  readRegistry,
  writeRegistry,
  findModule,
  listSlugs,
} = require('./moduleRegistry');
const { resolveModuleSlug, resolveModuleSlugStrict } = require('./moduleSlug');
const { findSupplier } = require('./supplierRegistry');

class ActiveSupplierFeatureError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ActiveSupplierFeatureError';
  }
}

/**
 * Resolves an identifier to a registered Feature entry, applying the same activation guards every
 * other pointer in this platform applies: a Proposed entity has no approved folder to point at, and
 * a Superseded one names its replacement rather than silently working.
 * @param {string} supplierFeaturesDir @param {string} identifier @returns {object} the entry
 */
function requireActivatableFeature(supplierFeaturesDir, identifier) {
  const registry = readRegistry(supplierFeaturesDir);
  const known = listSlugs(registry);
  if (!known.length) {
    throw new ActiveSupplierFeatureError(
      'No Supplier Features are registered yet. Propose and approve one first.'
    );
  }

  const slug = resolveModuleSlug(known, identifier);
  if (!slug) {
    const strict = resolveModuleSlugStrict(known, identifier);
    if (strict.ambiguous) {
      throw new ActiveSupplierFeatureError(
        `"${identifier}" matches ${strict.candidates.length} Supplier Features: ` +
        `${strict.candidates.join(', ')}.`
      );
    }
    throw new ActiveSupplierFeatureError(
      `No Supplier Feature matches "${identifier}". ` +
      'Run `cli.js supplier-feature feature list` to see registered Features.'
    );
  }

  const entry = findModule(registry, slug);
  if (entry.status === 'Proposed') {
    throw new ActiveSupplierFeatureError(
      `Supplier Feature "${slug}" is still Proposed and has not been approved. ` +
      'Approve it before activating.'
    );
  }
  if (entry.status === 'Superseded') {
    throw new ActiveSupplierFeatureError(
      `Supplier Feature "${slug}" is Superseded by "${entry.supersededBy}".`
    );
  }
  return entry;
}

/**
 * Points the pipeline at a Supplier Feature. Clears `activeSupplier` — the Supplier below a Feature
 * is meaningless once the Feature itself changes, exactly as setActiveService() cleared the pointers
 * beneath it.
 * @param {string} supplierFeaturesDir @param {string} identifier @param {{now: Date, setBy?: string}} opts
 * @returns {object} the updated registry
 */
function setActiveSupplierFeature(supplierFeaturesDir, identifier, opts = {}) {
  const { now, setBy } = opts;
  if (!(now instanceof Date) || Number.isNaN(now.getTime())) {
    throw new ActiveSupplierFeatureError('setActiveSupplierFeature requires an explicit valid `now` Date.');
  }
  const entry = requireActivatableFeature(supplierFeaturesDir, identifier);

  const registry = readRegistry(supplierFeaturesDir);
  registry.activeFeature = entry.slug;
  registry.activeSupplier = null;
  registry.switchedAt = now.toISOString();
  registry.setBy = setBy || 'Module Manager';
  writeRegistry(supplierFeaturesDir, registry);
  return registry;
}

/**
 * Points the pipeline at a Supplier under a Feature, setting BOTH pointers together — a Supplier is
 * unresolvable without naming its Feature, since the same Supplier name under a different Feature is
 * a completely independent entity.
 * @param {string} supplierFeaturesDir @param {string} featureIdentifier @param {string} supplierSlug
 * @param {{now: Date, setBy?: string}} opts
 * @returns {object} the updated registry
 */
function setActiveSupplierFor(supplierFeaturesDir, featureIdentifier, supplierSlug, opts = {}) {
  const { now, setBy } = opts;
  if (!(now instanceof Date) || Number.isNaN(now.getTime())) {
    throw new ActiveSupplierFeatureError('setActiveSupplierFor requires an explicit valid `now` Date.');
  }
  const featureEntry = requireActivatableFeature(supplierFeaturesDir, featureIdentifier);
  const supplier = findSupplier(supplierFeaturesDir, featureEntry.slug, supplierSlug);

  if (!supplier) {
    throw new ActiveSupplierFeatureError(
      `No Supplier "${supplierSlug}" is registered under Supplier Feature "${featureEntry.slug}".`
    );
  }
  if (supplier.status === 'Proposed') {
    throw new ActiveSupplierFeatureError(
      `Supplier "${supplierSlug}" is still Proposed and has not been approved.`
    );
  }
  if (supplier.status === 'Superseded') {
    throw new ActiveSupplierFeatureError(
      `Supplier "${supplierSlug}" is Superseded by "${supplier.supersededBy}".`
    );
  }

  const registry = readRegistry(supplierFeaturesDir);
  registry.activeFeature = featureEntry.slug;
  registry.activeSupplier = supplier.slug;
  registry.switchedAt = now.toISOString();
  registry.setBy = setBy || 'Module Manager';
  writeRegistry(supplierFeaturesDir, registry);
  return registry;
}

/**
 * The active Supplier Features selection, read as data. Never throws on a stale pointer — same
 * "look before you fix it" contract as readActiveModules().
 * @param {string} supplierFeaturesDir
 * @returns {{feature: string|null, supplier: string|null, switchedAt: string|null, setBy: string|null}}
 */
function readActiveSupplierFeature(supplierFeaturesDir) {
  const registry = readRegistry(supplierFeaturesDir);
  return {
    feature: registry.activeFeature ?? null,
    supplier: registry.activeSupplier ?? null,
    switchedAt: registry.switchedAt ?? null,
    setBy: registry.setBy ?? null,
  };
}

/**
 * Clears the entire Supplier Features selection.
 * @param {string} supplierFeaturesDir @param {{now: Date, setBy?: string}} opts
 * @returns {object} the registry
 */
function clearActiveSupplierFeature(supplierFeaturesDir, opts = {}) {
  const { now, setBy } = opts;
  if (!(now instanceof Date) || Number.isNaN(now.getTime())) {
    throw new ActiveSupplierFeatureError('clearActiveSupplierFeature requires an explicit valid `now` Date.');
  }
  const registry = readRegistry(supplierFeaturesDir);
  registry.activeFeature = null;
  registry.activeSupplier = null;
  registry.switchedAt = now.toISOString();
  registry.setBy = setBy || 'Module Manager';
  writeRegistry(supplierFeaturesDir, registry);
  return registry;
}

module.exports = {
  ActiveSupplierFeatureError,
  requireActivatableFeature,
  setActiveSupplierFeature,
  setActiveSupplierFor,
  readActiveSupplierFeature,
  clearActiveSupplierFeature,
};
