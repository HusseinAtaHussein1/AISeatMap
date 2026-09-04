const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  ActiveModuleError,
  coversEveryModule,
  deriveActiveScope,
  setActiveModules,
  setActiveModulesToAll,
  resolveActiveModules,
  readActiveModules,
  isActiveModuleStale,
  isActiveModuleSuperseded,
  clearActiveModules,
} = require('../activeModule');
const {
  readRegistry, writeRegistry, registerModule, proposeModules, supersedeModule,
} = require('../moduleRegistry');
const { scaffoldModule } = require('../moduleScaffold');

const NOW = new Date('2026-07-29T10:00:00Z');
const LATER = new Date('2026-07-29T12:00:00Z');

function makeModulesDir() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'active-module-test-'));
  const modulesDir = path.join(root, 'modules');
  fs.mkdirSync(modulesDir, { recursive: true });
  return modulesDir;
}

function cleanup(modulesDir) {
  fs.rmSync(path.dirname(modulesDir), { recursive: true, force: true });
}

function makeActiveModule(modulesDir, name) {
  const { entry } = registerModule(modulesDir, { name }, { now: NOW });
  scaffoldModule(modulesDir, entry.slug, { now: NOW, entry });
  return entry;
}

test('resolveActiveModules returns [] when nothing is active', () => {
  // A stage that gets [] must ASK. Inventing a module is what scatters artifacts across folders.
  const modulesDir = makeModulesDir();
  assert.deepEqual(resolveActiveModules(modulesDir, { env: {} }), []);
  assert.equal(readActiveModules(modulesDir, { env: {} }).scope, null);
  cleanup(modulesDir);
});

test('setActiveModules activates a single module and derives scope "single"', () => {
  const modulesDir = makeModulesDir();
  makeActiveModule(modulesDir, 'Login');
  makeActiveModule(modulesDir, 'Booking');

  const registry = setActiveModules(modulesDir, ['login'], { now: NOW });
  assert.deepEqual(registry.activeModules, ['login']);
  assert.equal(registry.activeScope, 'single');
  assert.equal(registry.switchedAt, NOW.toISOString());
  cleanup(modulesDir);
});

test('setActiveModules resolves display names and prefixes', () => {
  const modulesDir = makeModulesDir();
  makeActiveModule(modulesDir, 'Agency Management');
  const registry = setActiveModules(modulesDir, ['Agency Management'], { now: NOW });
  assert.deepEqual(registry.activeModules, ['agency-management']);
  cleanup(modulesDir);
});

test('naming every Active module individually is "multi", not "full-project"', () => {
  // `full-project` is an INSTRUCTION, not a description: Stage 5A reads it and runs the assembled
  // baseline instead of each module project, and Stage 6A then reports cross-module interaction as
  // exercised. Deriving it from selection extent would claim whole-system verification that no
  // execution performed. `use --all` is how a human asks for it.
  const modulesDir = makeModulesDir();
  makeActiveModule(modulesDir, 'Login');
  makeActiveModule(modulesDir, 'Booking');

  const registry = setActiveModules(modulesDir, ['login', 'booking'], { now: NOW });
  assert.equal(registry.activeScope, 'multi');
  // Reported so the CLI can ask "did you mean --all?", never acted on.
  assert.equal(registry.spansEveryModule, true);
  cleanup(modulesDir);
});

test('a partial multi-module selection derives scope "multi"', () => {
  const modulesDir = makeModulesDir();
  makeActiveModule(modulesDir, 'Login');
  makeActiveModule(modulesDir, 'Booking');
  makeActiveModule(modulesDir, 'Agency');

  const registry = setActiveModules(modulesDir, ['login', 'booking'], { now: NOW });
  assert.equal(registry.activeScope, 'multi');
  cleanup(modulesDir);
});

test('a lone module in a ONE-module project is "single", never "full-project"', () => {
  // The regression this pins: on a project with one module, deriving full-project made EVERY
  // single-module selection whole-project — so Stage 5A would try to execute an assembled baseline
  // that, greenfield, does not exist yet.
  const registry = { modules: [{ slug: 'login', status: 'Active' }] };
  assert.equal(deriveActiveScope(['login'], registry), 'single');
});

test('setActiveModules on the only module records scope "single" on disk', () => {
  const modulesDir = makeModulesDir();
  makeActiveModule(modulesDir, 'Login');

  const registry = setActiveModules(modulesDir, ['login'], { now: NOW });
  assert.equal(registry.activeScope, 'single');
  assert.equal(readActiveModules(modulesDir, { env: {} }).scope, 'single');
  cleanup(modulesDir);
});

test('an explicit scope is honoured — it is the only route to full-project', () => {
  const modulesDir = makeModulesDir();
  makeActiveModule(modulesDir, 'Login');
  makeActiveModule(modulesDir, 'Booking');

  const registry = setActiveModules(modulesDir, ['login'], { now: NOW, scope: 'full-project' });
  assert.equal(registry.activeScope, 'full-project');
  cleanup(modulesDir);
});

test('coversEveryModule reports project-spanning selections without changing scope', () => {
  const registry = {
    modules: [
      { slug: 'login', status: 'Active' },
      { slug: 'booking', status: 'Active' },
      { slug: 'payments', status: 'Proposed' },
    ],
  };
  // A Proposed module is not part of "every module": it has no folder and cannot be executed.
  assert.equal(coversEveryModule(['login', 'booking'], registry), true);
  assert.equal(coversEveryModule(['login'], registry), false);
  assert.equal(coversEveryModule([], registry), false);
});

test('setActiveModules refuses a Proposed module', () => {
  // Activating an unapproved module would let a switch command bypass Stage 1's gate.
  const modulesDir = makeModulesDir();
  proposeModules(modulesDir, [{ name: 'Payments' }], { now: NOW });
  assert.throws(
    () => setActiveModules(modulesDir, ['payments'], { now: NOW }),
    /still Proposed/
  );
  cleanup(modulesDir);
});

test('setActiveModules refuses a Superseded module and names its replacement', () => {
  const modulesDir = makeModulesDir();
  makeActiveModule(modulesDir, 'Booking');
  makeActiveModule(modulesDir, 'Booking Flow');
  supersedeModule(modulesDir, 'booking', 'booking-flow', { now: NOW });

  assert.throws(
    () => setActiveModules(modulesDir, ['booking'], { now: LATER }),
    /Superseded by "booking-flow"/
  );
  cleanup(modulesDir);
});

test('setActiveModules refuses a module Superseded by an EXTERNAL entity, naming the external reference', () => {
  // Constraint 2: import-booked-pnr is superseded by a Feature that now lives in a different
  // registry (supplier-features/import-booked-pnr) — not a sibling slug in modules.json.
  const modulesDir = makeModulesDir();
  makeActiveModule(modulesDir, 'Import Booked PNR');
  supersedeModule(modulesDir, 'import-booked-pnr', null, {
    now: NOW,
    externalSupersededBy: 'supplier-features/import-booked-pnr',
  });

  assert.throws(
    () => setActiveModules(modulesDir, ['import-booked-pnr'], { now: LATER }),
    /Superseded by "supplier-features\/import-booked-pnr"/
  );
  cleanup(modulesDir);
});

test('isActiveModuleSuperseded reports true when the active module is superseded WHILE active', () => {
  // setActiveModules() blocks SELECTING a Superseded module, but a module superseded while already
  // active does not auto-clear the pointer (supersedeModule() has no reason to reach into it) — this
  // is the mechanism that surfaces that case on a plain `active` read instead of hiding it.
  const modulesDir = makeModulesDir();
  makeActiveModule(modulesDir, 'Import Booked PNR');
  setActiveModules(modulesDir, ['import-booked-pnr'], { now: NOW });
  assert.equal(isActiveModuleSuperseded(modulesDir), false);

  supersedeModule(modulesDir, 'import-booked-pnr', null, {
    now: LATER,
    externalSupersededBy: 'supplier-features/import-booked-pnr',
  });
  assert.equal(isActiveModuleSuperseded(modulesDir), true);
  cleanup(modulesDir);
});

test('isActiveModuleSuperseded is false when nothing is active, or the active module is fine', () => {
  const modulesDir = makeModulesDir();
  assert.equal(isActiveModuleSuperseded(modulesDir), false);
  makeActiveModule(modulesDir, 'Login');
  setActiveModules(modulesDir, ['login'], { now: NOW });
  assert.equal(isActiveModuleSuperseded(modulesDir), false);
  cleanup(modulesDir);
});

test('setActiveModules refuses an unknown module rather than creating one', () => {
  const modulesDir = makeModulesDir();
  makeActiveModule(modulesDir, 'Login');
  assert.throws(() => setActiveModules(modulesDir, ['ghost'], { now: NOW }), /No module matches/);
  cleanup(modulesDir);
});

test('setActiveModules reports an ambiguous identifier with its candidates', () => {
  const modulesDir = makeModulesDir();
  makeActiveModule(modulesDir, 'Booking Create');
  makeActiveModule(modulesDir, 'Booking Cancel');
  assert.throws(
    () => setActiveModules(modulesDir, ['booking'], { now: NOW }),
    /matches 2 modules/
  );
  cleanup(modulesDir);
});

test('setActiveModules requires an explicit now', () => {
  const modulesDir = makeModulesDir();
  makeActiveModule(modulesDir, 'Login');
  assert.throws(() => setActiveModules(modulesDir, ['login'], {}), /now/);
  cleanup(modulesDir);
});

test('setActiveModules on an empty registry explains where modules come from', () => {
  const modulesDir = makeModulesDir();
  assert.throws(
    () => setActiveModules(modulesDir, ['login'], { now: NOW }),
    /No modules are registered yet/
  );
  cleanup(modulesDir);
});

test('previousActiveModules makes a mis-switch one command to undo', () => {
  const modulesDir = makeModulesDir();
  makeActiveModule(modulesDir, 'Login');
  makeActiveModule(modulesDir, 'Booking');

  setActiveModules(modulesDir, ['login'], { now: NOW });
  const registry = setActiveModules(modulesDir, ['booking'], { now: LATER });
  assert.deepEqual(registry.previousActiveModules, ['login']);
  cleanup(modulesDir);
});

test('re-setting the already-active selection carries the undo target forward', () => {
  // Otherwise a redundant set destroys the undo target — the same rule activeRun.js follows.
  const modulesDir = makeModulesDir();
  makeActiveModule(modulesDir, 'Login');
  makeActiveModule(modulesDir, 'Booking');

  setActiveModules(modulesDir, ['login'], { now: NOW });
  setActiveModules(modulesDir, ['booking'], { now: LATER });
  const registry = setActiveModules(modulesDir, ['booking'], { now: LATER });
  assert.deepEqual(registry.previousActiveModules, ['login']);
  cleanup(modulesDir);
});

test('setActiveModulesToAll activates every Active module as full-project', () => {
  const modulesDir = makeModulesDir();
  makeActiveModule(modulesDir, 'Login');
  makeActiveModule(modulesDir, 'Booking');
  proposeModules(modulesDir, [{ name: 'Payments' }], { now: NOW });

  const registry = setActiveModulesToAll(modulesDir, { now: NOW });
  assert.deepEqual(registry.activeModules.sort(), ['booking', 'login']);
  assert.equal(registry.activeScope, 'full-project');
  cleanup(modulesDir);
});

test('setActiveModulesToAll refuses when nothing is approved', () => {
  const modulesDir = makeModulesDir();
  proposeModules(modulesDir, [{ name: 'Payments' }], { now: NOW });
  assert.throws(() => setActiveModulesToAll(modulesDir, { now: NOW }), /No approved modules/);
  cleanup(modulesDir);
});

test('AGENTIC_TESTING_MODULE overrides the pointer without mutating it', () => {
  // The env var is what makes two concurrent sessions possible on different modules. Resolution is
  // a READ and must never write through to shared state.
  const modulesDir = makeModulesDir();
  makeActiveModule(modulesDir, 'Login');
  makeActiveModule(modulesDir, 'Booking');
  setActiveModules(modulesDir, ['login'], { now: NOW });

  const resolved = resolveActiveModules(modulesDir, { env: { AGENTIC_TESTING_MODULE: 'booking' } });
  assert.deepEqual(resolved, ['booking']);
  assert.deepEqual(readRegistry(modulesDir).activeModules, ['login'], 'the pointer must be untouched');
  cleanup(modulesDir);
});

test('AGENTIC_TESTING_MODULE accepts a comma-separated list', () => {
  const modulesDir = makeModulesDir();
  makeActiveModule(modulesDir, 'Login');
  makeActiveModule(modulesDir, 'Booking');
  const resolved = resolveActiveModules(modulesDir, {
    env: { AGENTIC_TESTING_MODULE: 'login, booking' },
  });
  assert.deepEqual(resolved, ['login', 'booking']);
  cleanup(modulesDir);
});

test('an override naming a missing module resolves to [] rather than falling back', () => {
  // Falling back to the pointer would send this process's output to the wrong module.
  const modulesDir = makeModulesDir();
  makeActiveModule(modulesDir, 'Login');
  setActiveModules(modulesDir, ['login'], { now: NOW });

  const resolved = resolveActiveModules(modulesDir, { env: { AGENTIC_TESTING_MODULE: 'ghost' } });
  assert.deepEqual(resolved, []);
  cleanup(modulesDir);
});

test('isActiveModuleStale reports a pointer naming a de-registered module', () => {
  const modulesDir = makeModulesDir();
  makeActiveModule(modulesDir, 'Login');
  setActiveModules(modulesDir, ['login'], { now: NOW });
  assert.equal(isActiveModuleStale(modulesDir), false);

  const registry = readRegistry(modulesDir);
  registry.modules = [];
  writeRegistry(modulesDir, registry);

  assert.equal(isActiveModuleStale(modulesDir), true);
  assert.deepEqual(resolveActiveModules(modulesDir, { env: {} }), []);
  cleanup(modulesDir);
});

test('clearActiveModules empties the selection and keeps the undo target', () => {
  const modulesDir = makeModulesDir();
  makeActiveModule(modulesDir, 'Login');
  setActiveModules(modulesDir, ['login'], { now: NOW });

  const registry = clearActiveModules(modulesDir, { now: LATER });
  assert.deepEqual(registry.activeModules, []);
  assert.equal(registry.activeScope, null);
  assert.deepEqual(registry.previousActiveModules, ['login']);
  cleanup(modulesDir);
});
