// Active Module Pointer — "which module(s) is the pipeline working on right now?"
//
// See workflows_and_pipelines/pipeline/module_architecture.md §6.
//
// This is the module-layer analogue of activeRun.js, and it exists for the identical reason: before
// it, a stage resolved its target module from conversational context, so "continue Login" and "start
// Booking" were indistinguishable to the tooling — and Stage 3 output could land in a module whose
// Stage 2 belonged to something else.
//
// It differs from the run pointer in exactly one way, and the difference is load-bearing: the
// active selection is an ARRAY, because a run may legitimately scope to one module, several, or all
// of them (§9.1). `activeScope` records what the selection MEANS, so a stage can tell "just Login"
// from "all five, of which Login happens to be first" — a distinction the array alone cannot carry
// when the project has exactly one module.
//
// The pointer lives inside modules.json rather than in a file of its own, because it and the
// registry are read together on every stage invocation (§6.1).

const {
  ACTIVE_SCOPES,
  ModuleRegistryError,
  findModule,
  listSlugs,
  readRegistry,
  writeRegistry,
} = require('./moduleRegistry');

const { resolveModuleSlug, resolveModuleSlugStrict } = require('./moduleSlug');

class ActiveModuleError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ActiveModuleError';
  }
}

/**
 * Every Active (approved) module in the registry.
 * @param {object} registry
 * @returns {string[]}
 */
function activeSlugs(registry) {
  return (registry.modules || [])
    .filter((m) => m.status === 'Active')
    .map((m) => m.slug);
}

/**
 * True when `slugs` covers every approved module. Used to REPORT that a selection happens to span
 * the project — never to silently upgrade its scope (see deriveActiveScope).
 * @param {string[]} slugs
 * @param {object} registry
 * @returns {boolean}
 */
function coversEveryModule(slugs, registry) {
  const active = activeSlugs(registry);
  return active.length > 0
    && slugs.length === active.length
    && active.every((s) => slugs.includes(s));
}

/**
 * Derives what a selection MEANS from its size: `single` for one module, `multi` for several.
 *
 * **`full-project` is never derived.** It is set only by explicit intent — `setActiveModulesToAll()`
 * (`cli.js use --all`) or an explicit `scope` option.
 *
 * This was originally derived, on the reasoning that a selection covering every module simply *is*
 * full-project. That reasoning misses what the value does: `full-project` is not a description of a
 * selection's extent, it is an INSTRUCTION. Stage 5A reads it and executes the **assembled baseline**
 * instead of each module's own project, and Stage 6A reports cross-module interaction as exercised
 * (pipeline.md §4 Stage 5A; module_architecture.md §9.1). Deriving it produced two wrong outcomes:
 *
 *   1. On a project with ONE module, every single-module selection became full-project — so Stage 5A
 *      would try to run an assembled baseline that, greenfield, does not exist yet.
 *   2. Naming two of two modules in order to work through them individually silently claimed
 *      whole-system verification that no execution actually performed.
 *
 * The risk is asymmetric, which is what settles it: wrongly `full-project` overstates verification
 * and may not be executable at all, while wrongly `multi` merely runs each module project directly —
 * always available, and never claiming more than happened. A selection that spans the project is
 * REPORTED as such (coversEveryModule) so the human can opt in, rather than being opted in.
 *
 * @param {string[]} slugs
 * @param {object} [registry] - unused; retained so callers need not change
 * @returns {string} `'single'` or `'multi'`
 */
function deriveActiveScope(slugs, registry) {
  return slugs.length === 1 ? 'single' : 'multi';
}

/**
 * Points the pipeline at one or more modules.
 *
 * Every named module MUST be registered and MUST NOT be merely `Proposed`: activating a module no
 * human has approved would let Stage 1's gate be bypassed by a switch command (§6.4 #4). A typo
 * fails here, at the switch, rather than at some later stage's write.
 *
 * @param {string} modulesDir
 * @param {string[]|string} identifiers - slugs, display names, or prefixes; `'--all'` is not
 *        handled here (the CLI expands it) so this function's contract stays explicit
 * @param {{now: Date, setBy?: string, note?: string, scope?: string}} opts - `now` is required,
 *        never defaulted internally, matching setActiveRun()'s contract. `scope` is the ONLY way to
 *        get `full-project`; it is never inferred (see deriveActiveScope).
 * @returns {object} the updated registry, with `spansEveryModule` set when the selection happens to
 *        cover the whole project — a hint for the caller to surface, not a scope upgrade.
 */
function setActiveModules(modulesDir, identifiers, opts = {}) {
  const { now, setBy, note, scope } = opts;
  if (!(now instanceof Date) || Number.isNaN(now.getTime())) {
    throw new ActiveModuleError('setActiveModules requires an explicit valid `now` Date.');
  }

  const list = Array.isArray(identifiers) ? identifiers : [identifiers];
  const cleaned = list.map((v) => String(v ?? '').trim()).filter(Boolean);
  if (!cleaned.length) {
    throw new ActiveModuleError('At least one module identifier is required.');
  }

  const registry = readRegistry(modulesDir);
  const known = listSlugs(registry);
  if (!known.length) {
    throw new ActiveModuleError(
      'No modules are registered yet. Stage 1 proposes the module decomposition from the PRD; ' +
      'approve it before activating a module.'
    );
  }

  const resolved = [];
  for (const identifier of cleaned) {
    const slug = resolveModuleSlug(known, identifier);
    if (!slug) {
      const strict = resolveModuleSlugStrict(known, identifier);
      if (strict.ambiguous) {
        throw new ActiveModuleError(
          `"${identifier}" matches ${strict.candidates.length} modules: ${strict.candidates.join(', ')}. ` +
          'Pass the full slug.'
        );
      }
      throw new ActiveModuleError(
        `No module matches "${identifier}". Run \`cli.js list\` to see registered modules.`
      );
    }

    const entry = findModule(registry, slug);
    if (entry.status === 'Proposed') {
      throw new ActiveModuleError(
        `Module "${slug}" is still Proposed and has not been approved at the Stage 1 gate. ` +
        'Approve the module decomposition before activating it.'
      );
    }
    if (entry.status === 'Superseded') {
      throw new ActiveModuleError(
        `Module "${slug}" is Superseded by "${entry.supersededBy}". Activate that module instead ` +
        '— the superseded one stays readable but is no longer where work lands.'
      );
    }
    if (!resolved.includes(slug)) resolved.push(slug);
  }

  if (scope && !ACTIVE_SCOPES.includes(scope)) {
    throw new ActiveModuleError(
      `Unknown activeScope "${scope}". Expected one of: ${ACTIVE_SCOPES.join(', ')}.`
    );
  }

  const previous = registry.activeModules || [];
  const same = previous.length === resolved.length && previous.every((s) => resolved.includes(s));

  registry.activeModules = resolved;
  registry.activeScope = scope || deriveActiveScope(resolved, registry);
  // Reported, never acted on: it lets the CLI say "this is every module — did you mean --all?"
  // without deciding for the human that it did.
  registry.spansEveryModule = coversEveryModule(resolved, registry);
  registry.switchedAt = now.toISOString();
  registry.setBy = setBy || 'Module Manager';
  // Kept so a mis-switch is one command to undo. Re-setting the already-active selection carries the
  // prior value forward rather than recording the selection as its own predecessor — otherwise a
  // redundant set destroys the undo target. Same rule as activeRun.js's previousRun.
  registry.previousActiveModules = same
    ? (registry.previousActiveModules || [])
    : previous;
  if (note) registry.note = note; else delete registry.note;

  writeRegistry(modulesDir, registry);
  return registry;
}

/**
 * THE accessor a stage calls to resolve which module(s) it is working on.
 *
 * Precedence mirrors resolveActiveRunFolder() exactly:
 *   1. AGENTIC_TESTING_MODULE env var (explicit, per-process override; comma-separated)
 *   2. modules.json's activeModules
 *   3. [] — the caller ASKS; it never guesses
 *
 * The env var is what makes two concurrent sessions possible on different modules: each exports its
 * own value and neither touches the shared file. Resolution is a READ and never mutates the pointer.
 *
 * Returns [] rather than guessing when nothing is active. A stage that gets [] must ask which module
 * to use — inventing one is what scatters a module's artifacts across unrelated folders (§6.5 #1).
 *
 * @param {string} modulesDir
 * @param {{env?: object}} [opts]
 * @returns {string[]} on-disk module slugs
 */
function resolveActiveModules(modulesDir, opts = {}) {
  const env = opts.env || process.env;
  const registry = readRegistry(modulesDir);
  const known = listSlugs(registry);

  const override = env.AGENTIC_TESTING_MODULE;
  if (override) {
    const requested = String(override).split(',').map((s) => s.trim()).filter(Boolean);
    const resolved = requested.map((id) => resolveModuleSlug(known, id));
    // An override naming a module that does not exist is an ERROR surfaced as [], not a silent
    // fallback to the pointer — falling back would send this process's output to the wrong module.
    if (resolved.some((s) => s === null)) return [];
    return resolved;
  }

  return (registry.activeModules || []).filter((slug) => known.includes(slug));
}

/**
 * The active selection plus what it means. Returns scope `null` when nothing is active, so a caller
 * can distinguish "no selection" from "a single-module selection".
 *
 * `spansEveryModule` is computed from the resolved selection rather than read from the registry, so
 * it stays correct when an `AGENTIC_TESTING_MODULE` override is in force — the override changes what
 * is active for this process without touching the file.
 *
 * @param {string} modulesDir
 * @param {{env?: object}} [opts]
 * @returns {{modules: string[], scope: string|null, spansEveryModule: boolean,
 *   switchedAt: string|null, setBy: string|null, previousActiveModules: string[]}}
 */
function readActiveModules(modulesDir, opts = {}) {
  const registry = readRegistry(modulesDir);
  const modules = resolveActiveModules(modulesDir, opts);
  return {
    modules,
    scope: modules.length ? (registry.activeScope || deriveActiveScope(modules, registry)) : null,
    spansEveryModule: modules.length ? coversEveryModule(modules, registry) : false,
    switchedAt: registry.switchedAt ?? null,
    setBy: registry.setBy ?? null,
    previousActiveModules: registry.previousActiveModules ?? [],
  };
}

/**
 * True when the pointer names a module that is no longer registered — worth reporting distinctly
 * from "nothing active", since it means something was removed out from under the pipeline.
 * @param {string} modulesDir
 * @returns {boolean}
 */
function isActiveModuleStale(modulesDir) {
  const registry = readRegistry(modulesDir);
  const pointed = registry.activeModules || [];
  if (!pointed.length) return false;
  const known = listSlugs(registry);
  return pointed.some((slug) => !known.includes(slug));
}

/**
 * Clears the selection. Used when a project intentionally has no active module.
 * @param {string} modulesDir
 * @param {{now: Date, setBy?: string}} opts
 * @returns {object} the registry
 */
function clearActiveModules(modulesDir, opts = {}) {
  const { now, setBy } = opts;
  if (!(now instanceof Date) || Number.isNaN(now.getTime())) {
    throw new ActiveModuleError('clearActiveModules requires an explicit valid `now` Date.');
  }
  const registry = readRegistry(modulesDir);
  registry.previousActiveModules = registry.activeModules || [];
  registry.activeModules = [];
  registry.activeScope = null;
  registry.switchedAt = now.toISOString();
  registry.setBy = setBy || 'Module Manager';
  writeRegistry(modulesDir, registry);
  return registry;
}

/**
 * Activates every Active module — the `full-project` selection (§9.1).
 * @param {string} modulesDir
 * @param {{now: Date, setBy?: string, note?: string}} opts
 * @returns {object} the registry
 */
function setActiveModulesToAll(modulesDir, opts = {}) {
  const registry = readRegistry(modulesDir);
  const active = activeSlugs(registry);
  if (!active.length) {
    throw new ActiveModuleError(
      'No approved modules to activate. Stage 1 proposes the decomposition; approve it first.'
    );
  }
  return setActiveModules(modulesDir, active, { ...opts, scope: 'full-project' });
}

module.exports = {
  ActiveModuleError,
  ModuleRegistryError,
  activeSlugs,
  coversEveryModule,
  deriveActiveScope,
  setActiveModules,
  setActiveModulesToAll,
  resolveActiveModules,
  readActiveModules,
  isActiveModuleStale,
  clearActiveModules,
};
