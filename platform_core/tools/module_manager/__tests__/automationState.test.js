const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  AUTOMATION_STATE_FILENAME,
  AutomationStateError,
  automationStatePath,
  readAutomationState,
  setAutomationState,
  recordAssembly,
  listAssemblable,
} = require('../automationState');

const NOW = new Date('2026-07-29T10:00:00Z');
const LATER = new Date('2026-07-29T12:00:00Z');

function makeModulesDir() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'automation-state-test-'));
  const modulesDir = path.join(root, 'modules');
  fs.mkdirSync(path.join(modulesDir, 'login', 'automation'), { recursive: true });
  return modulesDir;
}

function cleanup(modulesDir) {
  fs.rmSync(path.dirname(modulesDir), { recursive: true, force: true });
}

test('readAutomationState returns null when no automation project exists', () => {
  // A legitimate state — Stage 4A has not run for this module — not an error.
  const modulesDir = makeModulesDir();
  assert.equal(readAutomationState(modulesDir, 'login'), null);
  cleanup(modulesDir);
});

test('setAutomationState writes the state file inside the module automation folder', () => {
  const modulesDir = makeModulesDir();
  const state = setAutomationState(modulesDir, 'login', 'Generated', {
    now: NOW,
    framework: 'Playwright',
    baselineRef: 'abc1234',
  });

  assert.equal(state.state, 'Generated');
  assert.equal(state.framework, 'Playwright');
  assert.equal(state.baselineRef, 'abc1234');
  assert.ok(fs.existsSync(automationStatePath(modulesDir, 'login')));
  assert.ok(automationStatePath(modulesDir, 'login').endsWith(AUTOMATION_STATE_FILENAME));
  cleanup(modulesDir);
});

test('setAutomationState requires an explicit now', () => {
  const modulesDir = makeModulesDir();
  assert.throws(() => setAutomationState(modulesDir, 'login', 'Generated', {}), /now/);
  cleanup(modulesDir);
});

test('setAutomationState rejects an unknown state', () => {
  const modulesDir = makeModulesDir();
  assert.throws(
    () => setAutomationState(modulesDir, 'login', 'Merged', { now: NOW }),
    /Unknown automation state/
  );
  cleanup(modulesDir);
});

test('the normal progression Generated -> Executed -> Approved is legal', () => {
  const modulesDir = makeModulesDir();
  setAutomationState(modulesDir, 'login', 'Generated', { now: NOW });
  setAutomationState(modulesDir, 'login', 'Executed', { now: NOW, sourceRun: 'run-001' });
  const state = setAutomationState(modulesDir, 'login', 'Approved', { now: LATER, approvedBy: 'QA Lead' });

  assert.equal(state.state, 'Approved');
  assert.equal(state.approvedBy, 'QA Lead');
  assert.equal(state.approvedAt, LATER.toISOString());
  cleanup(modulesDir);
});

test('Approved -> Healed is legal, and drops the suite out of Approved', () => {
  // An already-approved suite that later fails may be repaired; the repair must re-clear the gate.
  const modulesDir = makeModulesDir();
  setAutomationState(modulesDir, 'login', 'Generated', { now: NOW });
  setAutomationState(modulesDir, 'login', 'Approved', { now: NOW, approvedBy: 'QA Lead' });

  const healed = setAutomationState(modulesDir, 'login', 'Healed', { now: LATER, sourceRun: 'run-002' });
  assert.equal(healed.state, 'Healed');
  assert.throws(() => recordAssembly(modulesDir, 'login', { now: LATER }), /not Approved/);
  cleanup(modulesDir);
});

test('approving requires an approver — a record naming nobody is not an approval', () => {
  const modulesDir = makeModulesDir();
  setAutomationState(modulesDir, 'login', 'Generated', { now: NOW });
  assert.throws(
    () => setAutomationState(modulesDir, 'login', 'Approved', { now: NOW }),
    /requires `approvedBy`/
  );
  cleanup(modulesDir);
});

test('sourceRuns accumulate across executions without duplicating', () => {
  const modulesDir = makeModulesDir();
  setAutomationState(modulesDir, 'login', 'Generated', { now: NOW });
  setAutomationState(modulesDir, 'login', 'Executed', { now: NOW, sourceRun: 'run-001' });
  setAutomationState(modulesDir, 'login', 'Executed', { now: LATER, sourceRun: 'run-001' });
  const state = setAutomationState(modulesDir, 'login', 'Executed', { now: LATER, sourceRun: 'run-002' });
  assert.deepEqual(state.sourceRuns, ['run-001', 'run-002']);
  cleanup(modulesDir);
});

test('history records every transition', () => {
  const modulesDir = makeModulesDir();
  setAutomationState(modulesDir, 'login', 'Generated', { now: NOW });
  setAutomationState(modulesDir, 'login', 'Executed', { now: LATER, sourceRun: 'run-001' });
  const state = readAutomationState(modulesDir, 'login');
  assert.deepEqual(state.history.map((h) => h.state), ['Generated', 'Executed']);
  assert.equal(state.history[1].run, 'run-001');
  cleanup(modulesDir);
});

test('recordAssembly refuses anything but an Approved project', () => {
  // Letting an unapproved project assemble would make the §5.2 gate advisory.
  const modulesDir = makeModulesDir();
  setAutomationState(modulesDir, 'login', 'Generated', { now: NOW });
  assert.throws(() => recordAssembly(modulesDir, 'login', { now: NOW }), /not Approved/);
  cleanup(modulesDir);
});

test('recordAssembly refuses a module with no automation project', () => {
  const modulesDir = makeModulesDir();
  assert.throws(
    () => recordAssembly(modulesDir, 'login', { now: NOW }),
    /no automation project to assemble/
  );
  cleanup(modulesDir);
});

test('recordAssembly stamps assembledAt and keeps the state Approved', () => {
  const modulesDir = makeModulesDir();
  setAutomationState(modulesDir, 'login', 'Generated', { now: NOW });
  setAutomationState(modulesDir, 'login', 'Approved', { now: NOW, approvedBy: 'QA Lead' });

  const assembled = recordAssembly(modulesDir, 'login', {
    now: LATER,
    mergeSummaryPath: 'platform_core_data/modules/login/automation/automation_promotion.md',
  });

  assert.equal(assembled.assembledAt, LATER.toISOString());
  assert.equal(assembled.state, 'Approved');
  assert.equal(assembled.lastMergeSummary, 'platform_core_data/modules/login/automation/automation_promotion.md');
  assert.equal(assembled.history.at(-1).state, 'Assembled');
  cleanup(modulesDir);
});

test('listAssemblable returns only Approved module projects', () => {
  const modulesDir = makeModulesDir();
  fs.mkdirSync(path.join(modulesDir, 'booking', 'automation'), { recursive: true });

  setAutomationState(modulesDir, 'login', 'Generated', { now: NOW });
  setAutomationState(modulesDir, 'login', 'Approved', { now: NOW, approvedBy: 'QA Lead' });
  setAutomationState(modulesDir, 'booking', 'Generated', { now: NOW });

  const assemblable = listAssemblable(modulesDir, ['login', 'booking', 'ghost']);
  assert.deepEqual(assemblable.map((m) => m.slug), ['login']);
  cleanup(modulesDir);
});

test('a newer schemaVersion fails loudly rather than being misread', () => {
  const modulesDir = makeModulesDir();
  fs.writeFileSync(
    automationStatePath(modulesDir, 'login'),
    JSON.stringify({ schemaVersion: 99, state: 'Approved' })
  );
  assert.throws(() => readAutomationState(modulesDir, 'login'), AutomationStateError);
  cleanup(modulesDir);
});
