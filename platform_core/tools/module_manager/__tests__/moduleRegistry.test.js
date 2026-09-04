const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  REGISTRY_FILENAME,
  REGISTRY_SCHEMA_VERSION,
  MODULE_STAGES,
  ModuleRegistryError,
  readRegistry,
  writeRegistry,
  readModuleState,
  findModule,
  resolveModule,
  registerModule,
  recordStage,
  proposeModules,
  approveModules,
  supersedeModule,
  listModules,
} = require('../moduleRegistry');
const { scaffoldModule } = require('../moduleScaffold');

const NOW = new Date('2026-07-29T10:00:00Z');
const LATER = new Date('2026-07-29T12:00:00Z');

function makeModulesDir() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'module-registry-test-'));
  const modulesDir = path.join(root, 'modules');
  fs.mkdirSync(modulesDir, { recursive: true });
  return modulesDir;
}

function cleanup(modulesDir) {
  fs.rmSync(path.dirname(modulesDir), { recursive: true, force: true });
}

/** Registers an Active module and scaffolds it — the post-approval state most tests start from. */
function makeActiveModule(modulesDir, name, opts = {}) {
  const { entry } = registerModule(modulesDir, { name, ...opts }, { now: NOW });
  scaffoldModule(modulesDir, entry.slug, { now: NOW, entry });
  return entry;
}

test('readRegistry returns an empty registry when modules.json is absent', () => {
  const modulesDir = makeModulesDir();
  const registry = readRegistry(modulesDir);
  assert.deepEqual(registry.modules, []);
  assert.deepEqual(registry.activeModules, []);
  assert.equal(registry.activeScope, null);
  cleanup(modulesDir);
});

test('readRegistry throws on malformed JSON rather than silently starting empty', () => {
  // Treating a corrupt registry as empty would lose every module on the next write.
  const modulesDir = makeModulesDir();
  fs.writeFileSync(path.join(modulesDir, REGISTRY_FILENAME), '{ not json');
  assert.throws(() => readRegistry(modulesDir), ModuleRegistryError);
  cleanup(modulesDir);
});

test('readRegistry fails loudly on a newer schemaVersion', () => {
  const modulesDir = makeModulesDir();
  writeRegistry(modulesDir, { schemaVersion: REGISTRY_SCHEMA_VERSION + 1, modules: [] });
  assert.throws(() => readRegistry(modulesDir), /schemaVersion/);
  cleanup(modulesDir);
});

test('registerModule derives a slug, records the entry, and starts every stage Not Started', () => {
  const modulesDir = makeModulesDir();
  const { entry, created } = registerModule(modulesDir, { name: 'Flight Search' }, { now: NOW });

  assert.equal(created, true);
  assert.equal(entry.slug, 'flight-search');
  assert.equal(entry.status, 'Active');
  for (const stage of MODULE_STAGES) {
    assert.equal(entry.stages[stage].status, 'Not Started');
    assert.equal(entry.stages[stage].revisionCount, 0);
  }
  assert.ok(findModule(readRegistry(modulesDir), 'flight-search'));
  cleanup(modulesDir);
});

test('registerModule requires an explicit now, never defaulting it internally', () => {
  const modulesDir = makeModulesDir();
  assert.throws(() => registerModule(modulesDir, { name: 'Login' }, {}), /now/);
  cleanup(modulesDir);
});

test('registerModule validates an explicit slug instead of silently normalizing it', () => {
  // A caller passing "Flight_Search" expects that folder; quietly creating a different one surprises
  // them later, at a place with no connection to the mistake.
  const modulesDir = makeModulesDir();
  assert.throws(
    () => registerModule(modulesDir, { name: 'Flight Search', slug: 'Flight_Search' }, { now: NOW }),
    /not a valid module slug/
  );
  cleanup(modulesDir);
});

test('re-registering a module preserves its recorded stage progress', () => {
  // Re-running Stage 1 must never reset a module's Test Design status back to Not Started.
  const modulesDir = makeModulesDir();
  makeActiveModule(modulesDir, 'Login');
  recordStage(modulesDir, 'login', 'test_design', { status: 'Approved' }, { now: NOW });

  const { created } = registerModule(
    modulesDir,
    { name: 'Login', description: 'updated description' },
    { now: LATER }
  );

  assert.equal(created, false);
  const state = resolveModule(modulesDir, 'login');
  assert.equal(state.stages.test_design.status, 'Approved');
  assert.equal(state.description, 'updated description');
  cleanup(modulesDir);
});

test('registerModule de-duplicates a colliding derived slug', () => {
  const modulesDir = makeModulesDir();
  registerModule(modulesDir, { name: 'Booking' }, { now: NOW });
  const { entry } = registerModule(modulesDir, { name: 'booking' }, { now: NOW });
  assert.equal(entry.slug, 'booking-2');
  cleanup(modulesDir);
});

test('recordStage writes module.json and refreshes the registry cache from it', () => {
  const modulesDir = makeModulesDir();
  makeActiveModule(modulesDir, 'Login');

  recordStage(modulesDir, 'login', 'context', {
    status: 'Approved',
    artifactPath: 'platform_core_data/modules/login/context/ProjectContext.md',
    lastRun: 'run-001__2026-07-29_10-00-00__Module__Login',
    targetRefAtWrite: 'abc1234',
  }, { now: NOW });

  const state = readModuleState(modulesDir, 'login');
  assert.equal(state.stages.context.status, 'Approved');
  assert.equal(state.stages.context.targetRefAtWrite, 'abc1234');
  assert.equal(state.stages.context.revisionCount, 1);

  const cached = findModule(readRegistry(modulesDir), 'login');
  assert.equal(cached.stages.context.status, 'Approved');
  cleanup(modulesDir);
});

test('module.json wins over a stale registry cache', () => {
  // The precedence rule, exercised: the registry is a display cache and must never be trusted over
  // the module's own authoritative record.
  const modulesDir = makeModulesDir();
  makeActiveModule(modulesDir, 'Login');
  recordStage(modulesDir, 'login', 'context', { status: 'Approved' }, { now: NOW });

  const registry = readRegistry(modulesDir);
  findModule(registry, 'login').stages.context.status = 'Draft';
  writeRegistry(modulesDir, registry);

  assert.equal(resolveModule(modulesDir, 'login').stages.context.status, 'Approved');
  cleanup(modulesDir);
});

test('recordStage increments revisionCount on each in-place edit', () => {
  const modulesDir = makeModulesDir();
  makeActiveModule(modulesDir, 'Login');

  recordStage(modulesDir, 'login', 'context', { status: 'Draft' }, { now: NOW });
  recordStage(modulesDir, 'login', 'context', { status: 'Pending Review' }, { now: LATER });
  assert.equal(resolveModule(modulesDir, 'login').stages.context.revisionCount, 2);

  recordStage(modulesDir, 'login', 'context', { status: 'Approved', incrementRevision: false }, { now: LATER });
  assert.equal(resolveModule(modulesDir, 'login').stages.context.revisionCount, 2);
  cleanup(modulesDir);
});

test('recordStage rejects an execution stage that belongs to the run folder', () => {
  const modulesDir = makeModulesDir();
  makeActiveModule(modulesDir, 'Login');
  assert.throws(
    () => recordStage(modulesDir, 'login', 'execution', { status: 'Approved' }, { now: NOW }),
    /Execution stages .* write to the run folder/
  );
  cleanup(modulesDir);
});

test('recordStage rejects a status outside the Run Manifest vocabulary', () => {
  const modulesDir = makeModulesDir();
  makeActiveModule(modulesDir, 'Login');
  assert.throws(
    () => recordStage(modulesDir, 'login', 'context', { status: 'Done' }, { now: NOW }),
    /Unknown stage status/
  );
  cleanup(modulesDir);
});

test('recordStage rejects an unregistered module', () => {
  const modulesDir = makeModulesDir();
  assert.throws(
    () => recordStage(modulesDir, 'ghost', 'context', { status: 'Draft' }, { now: NOW }),
    /No module "ghost" is registered/
  );
  cleanup(modulesDir);
});

test('proposeModules registers as Proposed and does NOT scaffold a folder', () => {
  // The mechanical enforcement of "a module is never created silently": a folder on disk reads as
  // an approved module, so a proposal must not create one.
  const modulesDir = makeModulesDir();
  const { proposed } = proposeModules(
    modulesDir,
    [{ name: 'Flight Search' }, { name: 'Booking' }],
    { now: NOW, prdPath: 'platform_core_data/knowledge_base/PRD.md', prdSha256: 'deadbeef' }
  );

  assert.equal(proposed.length, 2);
  assert.ok(proposed.every((m) => m.status === 'Proposed'));
  assert.ok(!fs.existsSync(path.join(modulesDir, 'flight-search')));

  const registry = readRegistry(modulesDir);
  assert.equal(registry.derivedFrom.prdPath, 'platform_core_data/knowledge_base/PRD.md');
  assert.equal(registry.derivedFrom.prdSha256, 'deadbeef');
  cleanup(modulesDir);
});

test('re-proposing leaves an already-approved module untouched', () => {
  // A later run whose PRD changed re-proposes; an Active module must not be reset to Proposed.
  const modulesDir = makeModulesDir();
  makeActiveModule(modulesDir, 'Login');

  const { proposed, alreadyPresent } = proposeModules(
    modulesDir,
    [{ name: 'Login' }, { name: 'Payments' }],
    { now: LATER }
  );

  assert.deepEqual(proposed.map((m) => m.slug), ['payments']);
  assert.deepEqual(alreadyPresent.map((m) => m.slug), ['login']);
  assert.equal(findModule(readRegistry(modulesDir), 'login').status, 'Active');
  cleanup(modulesDir);
});

test('approveModules requires an approver and flips Proposed to Active', () => {
  const modulesDir = makeModulesDir();
  proposeModules(modulesDir, [{ name: 'Login' }], { now: NOW });

  assert.throws(
    () => approveModules(modulesDir, ['login'], { now: NOW }),
    /requires `approvedBy`/
  );

  const { approved, registry } = approveModules(modulesDir, ['login'], { now: NOW, approvedBy: 'QA Lead' });
  assert.equal(approved[0].status, 'Active');
  assert.equal(registry.approvedBy, 'QA Lead');
  assert.equal(registry.approvedAt, NOW.toISOString());
  cleanup(modulesDir);
});

test('approveModules with no slugs approves every Proposed module', () => {
  const modulesDir = makeModulesDir();
  proposeModules(modulesDir, [{ name: 'Login' }, { name: 'Booking' }], { now: NOW });
  const { approved } = approveModules(modulesDir, [], { now: NOW, approvedBy: 'QA Lead' });
  assert.deepEqual(approved.map((m) => m.slug).sort(), ['booking', 'login']);
  cleanup(modulesDir);
});

test('supersedeModule marks a module superseded without renaming or deleting it', () => {
  // Other artifacts cite a module's path, exactly as they cite a legacy run folder's name.
  const modulesDir = makeModulesDir();
  makeActiveModule(modulesDir, 'Booking');
  makeActiveModule(modulesDir, 'Booking Flow');

  supersedeModule(modulesDir, 'booking', 'booking-flow', { now: LATER });

  const old = resolveModule(modulesDir, 'booking');
  assert.equal(old.status, 'Superseded');
  assert.equal(old.supersededBy, 'booking-flow');
  assert.ok(fs.existsSync(path.join(modulesDir, 'booking')), 'the folder must stay readable');
  cleanup(modulesDir);
});

test('supersedeModule accepts an externalSupersededBy reference when the superseding entity lives in a different registry', () => {
  // Constraint 2: import-booked-pnr is promoted into supplier-features/import-booked-pnr —
  // a different registry this file cannot resolve or validate, so it is stored as an opaque string
  // in its OWN field rather than overloading `supersededBy` (which every reader assumes is a sibling
  // slug in THIS registry).
  const modulesDir = makeModulesDir();
  makeActiveModule(modulesDir, 'Import Booked PNR');

  supersedeModule(modulesDir, 'import-booked-pnr', null, {
    now: LATER,
    externalSupersededBy: 'supplier-features/import-booked-pnr',
  });

  const entry = resolveModule(modulesDir, 'import-booked-pnr');
  assert.equal(entry.status, 'Superseded');
  assert.equal(entry.supersededBy, null);
  assert.equal(entry.supersededByExternal, 'supplier-features/import-booked-pnr');
  assert.ok(fs.existsSync(path.join(modulesDir, 'import-booked-pnr')), 'the folder must stay readable');
  cleanup(modulesDir);
});

test('supersedeModule requires either bySlug or externalSupersededBy — refuses a supersede naming neither', () => {
  const modulesDir = makeModulesDir();
  makeActiveModule(modulesDir, 'Booking');
  assert.throws(
    () => supersedeModule(modulesDir, 'booking', null, { now: LATER }),
    (err) => err instanceof ModuleRegistryError && /requires either `bySlug`/.test(err.message)
  );
  cleanup(modulesDir);
});

test('recordStage is structurally unreachable for a Superseded module through the CLI activation path', () => {
  // Stage-recording tools resolve their target module through the active-module pointer (or an
  // explicit slug a human typed), and setActiveModules() already refuses a Superseded module
  // (activeModule.test.js). recordStage() itself does not re-check status — by design, an explicit
  // `cli.js stage <slug> ...` targeting a slug directly must still work for a human fixing a
  // pre-Superseded record — but the NORMAL path (select-then-record) cannot reach it, because
  // selection is the gate. This test documents that recordStage() has no status guard of its own,
  // so the guarantee lives entirely in setActiveModules().
  const modulesDir = makeModulesDir();
  makeActiveModule(modulesDir, 'Import Booked PNR');
  supersedeModule(modulesDir, 'import-booked-pnr', null, {
    now: LATER,
    externalSupersededBy: 'supplier-features/import-booked-pnr',
  });

  // recordStage() does not throw on a Superseded module when targeted explicitly by slug — proving
  // the guard is structural (nothing can SELECT it as active) rather than duplicated here.
  const updated = recordStage(modulesDir, 'import-booked-pnr', 'context', { status: 'Draft' }, { now: LATER });
  assert.equal(updated.stages.context.status, 'Draft');
  cleanup(modulesDir);
});

test('listModules reports stagesPresent from disk, not from status fields', () => {
  // "Where did this module actually get to?" answered without trusting a field that may be stale.
  const modulesDir = makeModulesDir();
  makeActiveModule(modulesDir, 'Login');
  fs.mkdirSync(path.join(modulesDir, 'login', 'test_design'), { recursive: true });

  const [login] = listModules(modulesDir);
  assert.deepEqual(login.stagesPresent, ['context', 'discovery', 'test_design']);
  assert.equal(login.onDisk, true);
  cleanup(modulesDir);
});

test('listModules marks a Proposed module as not on disk', () => {
  const modulesDir = makeModulesDir();
  proposeModules(modulesDir, [{ name: 'Payments' }], { now: NOW });
  const [payments] = listModules(modulesDir);
  assert.equal(payments.onDisk, false);
  assert.deepEqual(payments.stagesPresent, []);
  cleanup(modulesDir);
});
