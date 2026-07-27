const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  ACTIVE_RUN_FILENAME,
  ACTIVE_RUN_SCHEMA_VERSION,
  ActiveRunError,
  activeRunPath,
  listRuns,
  setActiveRun,
  readActiveRun,
  resolveActiveRunFolder,
  isActiveRunStale,
  clearActiveRun,
  refreshActiveRun,
} = require('../activeRun');

const NOW = new Date('2026-07-27T21:10:04Z');

function makeRunsDir() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'active-run-test-'));
  const runsDir = path.join(root, 'runs');
  fs.mkdirSync(runsDir, { recursive: true });
  return runsDir;
}

function makeRun(runsDir, folderName, { stages = [], meta } = {}) {
  fs.mkdirSync(path.join(runsDir, folderName), { recursive: true });
  for (const stage of stages) {
    fs.mkdirSync(path.join(runsDir, folderName, stage), { recursive: true });
  }
  if (meta) {
    fs.mkdirSync(path.join(runsDir, folderName, 'metadata'), { recursive: true });
    fs.writeFileSync(
      path.join(runsDir, folderName, 'metadata', 'run.json'),
      JSON.stringify(meta, null, 2)
    );
  }
  return path.join(runsDir, folderName);
}

function cleanup(runsDir) {
  fs.rmSync(path.dirname(runsDir), { recursive: true, force: true });
}

test('readActiveRun returns null when no run has been activated yet', () => {
  const runsDir = makeRunsDir();
  assert.equal(readActiveRun(runsDir), null);
  assert.equal(resolveActiveRunFolder(runsDir), null);
  cleanup(runsDir);
});

test('setActiveRun writes the pointer at runs/current_active_run.json', () => {
  const runsDir = makeRunsDir();
  makeRun(runsDir, 'run-001__2026-07-23_10-35-18__FullRun__FlightSearch');

  setActiveRun(runsDir, 'run-001__2026-07-23_10-35-18__FullRun__FlightSearch', { now: NOW });

  const file = activeRunPath(runsDir);
  assert.equal(path.basename(file), ACTIVE_RUN_FILENAME);
  assert.ok(fs.existsSync(file));
  cleanup(runsDir);
});

test('the pointer records folder name, index, scope, target and schema version', () => {
  const runsDir = makeRunsDir();
  makeRun(runsDir, 'run-007__2026-07-23_10-35-18__UserStory__Create-Role');

  const pointer = setActiveRun(runsDir, 'run-007__2026-07-23_10-35-18__UserStory__Create-Role', { now: NOW });

  assert.equal(pointer.schemaVersion, ACTIVE_RUN_SCHEMA_VERSION);
  assert.equal(pointer.activeRun.folderName, 'run-007__2026-07-23_10-35-18__UserStory__Create-Role');
  assert.equal(pointer.activeRun.index, 7);
  assert.equal(pointer.activeRun.scope, 'UserStory');
  assert.equal(pointer.switchedAt, '2026-07-27T21:10:04.000Z');
  assert.equal(pointer.activeRun.path, 'platform_core_data/runs/run-007__2026-07-23_10-35-18__UserStory__Create-Role');
  cleanup(runsDir);
});

test('setActiveRun caches status/title from the run own metadata/run.json', () => {
  const runsDir = makeRunsDir();
  makeRun(runsDir, 'run-002__2026-07-24_09-00-00__Targeted__Leave', {
    meta: { status: 'Waiting For Approval', title: 'Leave module regression', startedTime: '2026-07-24T09:00:00Z' },
  });

  const pointer = setActiveRun(runsDir, 'run-002__2026-07-24_09-00-00__Targeted__Leave', { now: NOW });

  assert.equal(pointer.activeRun.status, 'Waiting For Approval');
  assert.equal(pointer.activeRun.title, 'Leave module regression');
  assert.equal(pointer.activeRun.startedTime, '2026-07-24T09:00:00Z');
  cleanup(runsDir);
});

test('a run with no metadata/run.json is still switchable (nulls, not a throw)', () => {
  const runsDir = makeRunsDir();
  makeRun(runsDir, 'run-003__2026-07-25_09-00-00__FullRun__PIM');

  const pointer = setActiveRun(runsDir, 'run-003__2026-07-25_09-00-00__FullRun__PIM', { now: NOW });

  assert.equal(pointer.activeRun.status, null);
  assert.equal(pointer.activeRun.title, null);
  cleanup(runsDir);
});

test('a corrupt metadata/run.json does not block switching', () => {
  const runsDir = makeRunsDir();
  const dir = makeRun(runsDir, 'run-004__2026-07-25_09-00-00__FullRun__Admin');
  fs.mkdirSync(path.join(dir, 'metadata'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'metadata', 'run.json'), '{ not json');

  const pointer = setActiveRun(runsDir, 'run-004__2026-07-25_09-00-00__FullRun__Admin', { now: NOW });
  assert.equal(pointer.activeRun.folderName, 'run-004__2026-07-25_09-00-00__FullRun__Admin');
  cleanup(runsDir);
});

test('stagesPresent reflects only the stage folders that actually exist, in pipeline order', () => {
  const runsDir = makeRunsDir();
  // Deliberately created out of pipeline order to prove the output is ordered, not insertion-ordered.
  makeRun(runsDir, 'run-005__2026-07-25_09-00-00__FullRun__Admin', {
    stages: ['test_design', 'context', 'discovery'],
  });

  const pointer = setActiveRun(runsDir, 'run-005__2026-07-25_09-00-00__FullRun__Admin', { now: NOW });

  assert.deepEqual(pointer.activeRun.stagesPresent, ['context', 'discovery', 'test_design']);
  cleanup(runsDir);
});

test('switching to a previous run rewrites the pointer and records the one it replaced', () => {
  const runsDir = makeRunsDir();
  makeRun(runsDir, 'run-001__2026-07-23_10-35-18__FullRun__FlightSearch');
  makeRun(runsDir, 'run-002__2026-07-24_09-00-00__Targeted__Leave');

  setActiveRun(runsDir, 'run-002__2026-07-24_09-00-00__Targeted__Leave', { now: NOW });
  const switched = setActiveRun(runsDir, 'run-001__2026-07-23_10-35-18__FullRun__FlightSearch', { now: NOW });

  assert.equal(switched.activeRun.folderName, 'run-001__2026-07-23_10-35-18__FullRun__FlightSearch');
  assert.equal(switched.previousRun, 'run-002__2026-07-24_09-00-00__Targeted__Leave');
  // Sticky: a fresh read still resolves to the switched-to run.
  assert.equal(resolveActiveRunFolder(runsDir), 'run-001__2026-07-23_10-35-18__FullRun__FlightSearch');
  cleanup(runsDir);
});

test('previousRun is null for the first switch in a project', () => {
  const runsDir = makeRunsDir();
  makeRun(runsDir, 'run-001__2026-07-23_10-35-18__FullRun__FlightSearch');

  const pointer = setActiveRun(runsDir, 'run-001__2026-07-23_10-35-18__FullRun__FlightSearch', { now: NOW });
  assert.equal(pointer.previousRun, null);
  cleanup(runsDir);
});

test('re-setting the already-active run preserves the real undo target', () => {
  const runsDir = makeRunsDir();
  makeRun(runsDir, 'run-001__2026-07-23_10-35-18__FullRun__FlightSearch');
  makeRun(runsDir, 'run-002__2026-07-24_09-00-00__Targeted__Leave');

  setActiveRun(runsDir, 'run-001__2026-07-23_10-35-18__FullRun__FlightSearch', { now: NOW });
  setActiveRun(runsDir, 'run-002__2026-07-24_09-00-00__Targeted__Leave', { now: NOW });
  // Redundant set of the run that is already active — must not clobber previousRun with itself.
  const again = setActiveRun(runsDir, 'run-002__2026-07-24_09-00-00__Targeted__Leave', { now: NOW });

  assert.equal(again.previousRun, 'run-001__2026-07-23_10-35-18__FullRun__FlightSearch');
  cleanup(runsDir);
});

test('setActiveRun refuses a run folder that does not exist', () => {
  const runsDir = makeRunsDir();
  assert.throws(
    () => setActiveRun(runsDir, 'run-999__2026-07-23_10-35-18__FullRun__Nope', { now: NOW }),
    ActiveRunError
  );
  // Nothing is written on failure.
  assert.equal(fs.existsSync(activeRunPath(runsDir)), false);
  cleanup(runsDir);
});

test('setActiveRun requires an explicit now (never defaults internally)', () => {
  const runsDir = makeRunsDir();
  makeRun(runsDir, 'run-001__2026-07-23_10-35-18__FullRun__FlightSearch');
  assert.throws(
    () => setActiveRun(runsDir, 'run-001__2026-07-23_10-35-18__FullRun__FlightSearch', {}),
    ActiveRunError
  );
  cleanup(runsDir);
});

test('a legacy Run ID resolves to its real folder name', () => {
  const runsDir = makeRunsDir();
  makeRun(runsDir, 'RUN-20260706-001-flight-search');

  const pointer = setActiveRun(runsDir, 'RUN-20260706-001', { now: NOW });

  assert.equal(pointer.activeRun.folderName, 'RUN-20260706-001-flight-search');
  assert.equal(pointer.activeRun.index, null, 'legacy runs carry no run index');
  cleanup(runsDir);
});

test('resolveActiveRunFolder returns null when the pointed-at folder was deleted', () => {
  const runsDir = makeRunsDir();
  const dir = makeRun(runsDir, 'run-001__2026-07-23_10-35-18__FullRun__FlightSearch');
  setActiveRun(runsDir, 'run-001__2026-07-23_10-35-18__FullRun__FlightSearch', { now: NOW });

  fs.rmSync(dir, { recursive: true, force: true });

  assert.equal(resolveActiveRunFolder(runsDir), null, 'never guesses a replacement run');
  assert.equal(isActiveRunStale(runsDir), true);
  cleanup(runsDir);
});

test('isActiveRunStale is false when there is no pointer at all', () => {
  const runsDir = makeRunsDir();
  assert.equal(isActiveRunStale(runsDir), false);
  cleanup(runsDir);
});

test('a pointer from a newer schema version is rejected rather than misread', () => {
  const runsDir = makeRunsDir();
  fs.writeFileSync(
    activeRunPath(runsDir),
    JSON.stringify({ schemaVersion: ACTIVE_RUN_SCHEMA_VERSION + 1, activeRun: { folderName: 'x' } })
  );
  assert.throws(() => readActiveRun(runsDir), ActiveRunError);
  cleanup(runsDir);
});

test('an unparseable pointer file raises rather than silently resetting', () => {
  const runsDir = makeRunsDir();
  fs.writeFileSync(activeRunPath(runsDir), '{ not json');
  assert.throws(() => readActiveRun(runsDir), ActiveRunError);
  cleanup(runsDir);
});

test('clearActiveRun removes the pointer and reports whether there was one', () => {
  const runsDir = makeRunsDir();
  makeRun(runsDir, 'run-001__2026-07-23_10-35-18__FullRun__FlightSearch');
  setActiveRun(runsDir, 'run-001__2026-07-23_10-35-18__FullRun__FlightSearch', { now: NOW });

  assert.equal(clearActiveRun(runsDir), true);
  assert.equal(readActiveRun(runsDir), null);
  assert.equal(clearActiveRun(runsDir), false, 'clearing twice is not an error');
  cleanup(runsDir);
});

test('refreshActiveRun updates cached status/stages without changing the active run', () => {
  const runsDir = makeRunsDir();
  makeRun(runsDir, 'run-001__2026-07-23_10-35-18__FullRun__FlightSearch', {
    stages: ['context'],
    meta: { status: 'Running' },
  });
  const before = setActiveRun(runsDir, 'run-001__2026-07-23_10-35-18__FullRun__FlightSearch', { now: NOW });
  assert.deepEqual(before.activeRun.stagesPresent, ['context']);

  // The run advances: Stage 2 lands and status moves on.
  fs.mkdirSync(path.join(runsDir, 'run-001__2026-07-23_10-35-18__FullRun__FlightSearch', 'discovery'));
  fs.writeFileSync(
    path.join(runsDir, 'run-001__2026-07-23_10-35-18__FullRun__FlightSearch', 'metadata', 'run.json'),
    JSON.stringify({ status: 'Waiting For Approval' })
  );

  const after = refreshActiveRun(runsDir);
  assert.equal(after.activeRun.folderName, before.activeRun.folderName);
  assert.equal(after.activeRun.status, 'Waiting For Approval');
  assert.deepEqual(after.activeRun.stagesPresent, ['context', 'discovery']);
  assert.equal(after.switchedAt, before.switchedAt, 'refresh is not a switch');
  cleanup(runsDir);
});

test('refreshActiveRun returns null when there is no pointer', () => {
  const runsDir = makeRunsDir();
  assert.equal(refreshActiveRun(runsDir), null);
  cleanup(runsDir);
});

test('listRuns sorts newest-first by run index, with legacy runs last', () => {
  const runsDir = makeRunsDir();
  makeRun(runsDir, 'run-001__2026-07-23_10-35-18__FullRun__FlightSearch');
  makeRun(runsDir, 'run-003__2026-07-25_09-00-00__FullRun__PIM');
  makeRun(runsDir, 'run-002__2026-07-24_09-00-00__Targeted__Leave');
  makeRun(runsDir, 'RUN-20260706-001-legacy');

  const runs = listRuns(runsDir);

  assert.deepEqual(runs.map((r) => r.index), [3, 2, 1, null]);
  assert.equal(runs[3].folderName, 'RUN-20260706-001-legacy');
  cleanup(runsDir);
});

test('listRuns ignores stray files and returns [] for a missing runs dir', () => {
  const runsDir = makeRunsDir();
  makeRun(runsDir, 'run-001__2026-07-23_10-35-18__FullRun__FlightSearch');
  fs.writeFileSync(path.join(runsDir, ACTIVE_RUN_FILENAME), '{}');
  fs.writeFileSync(path.join(runsDir, '.gitkeep'), '');

  assert.equal(listRuns(runsDir).length, 1);
  assert.deepEqual(listRuns(path.join(runsDir, 'does-not-exist')), []);
  cleanup(runsDir);
});

test('the pointer file is stable across identical writes (byte-identical, newline-terminated)', () => {
  const runsDir = makeRunsDir();
  makeRun(runsDir, 'run-001__2026-07-23_10-35-18__FullRun__FlightSearch');

  setActiveRun(runsDir, 'run-001__2026-07-23_10-35-18__FullRun__FlightSearch', { now: NOW });
  const first = fs.readFileSync(activeRunPath(runsDir), 'utf8');
  setActiveRun(runsDir, 'run-001__2026-07-23_10-35-18__FullRun__FlightSearch', { now: NOW });
  const second = fs.readFileSync(activeRunPath(runsDir), 'utf8');

  assert.equal(first, second);
  assert.ok(first.endsWith('\n'));
  cleanup(runsDir);
});
