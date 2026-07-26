const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const migrate = require('../migrate');

// migrate.js used to resolve one fixed REPO_ROOT from its own __dirname, so exercising it against an
// isolated fixture tree meant copying the module into a temp directory just to relocate that root.
// dataRoot is now an explicit parameter (defaulting to platform_paths' resolution), so a fixture is
// passed in directly — no module copying, and the real module under test is the one exercised.
function makeFixtureRoot() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'run-folder-migrate-test-'));
}

/** The platform_core_data/ root inside a fixture tree. */
function dataRootOf(fixtureRoot) {
  return path.join(fixtureRoot, 'platform_core_data');
}

test('inferRunMetadata reads scope/target from a Title-Case run.json (real schema in use today)', () => {
  const root = makeFixtureRoot();
  const runFolder = path.join(root, 'platform_core_data', 'runs', 'RUN-20260707-001');
  fs.mkdirSync(path.join(runFolder, 'metadata'), { recursive: true });
  fs.writeFileSync(
    path.join(runFolder, 'metadata', 'run.json'),
    JSON.stringify({
      'Run ID': 'RUN-20260707-001',
      'Run Type': 'Full Regression',
      'Started Time': '2026-07-07T09:00:00Z',
    })
  );

  const { inferRunMetadata, computeInferredName } = migrate;
  const meta = inferRunMetadata('RUN-20260707-001', runFolder, dataRootOf(root));

  assert.equal(meta.scopeRaw, 'Full Regression');
  assert.equal(meta.source, 'metadata/run.json');
  assert.equal(meta.confidence, 'medium'); // scope found, no target field in run.json

  const name = computeInferredName(meta, 'RUN-20260707-001');
  assert.match(name, /^2026-07-07_09-00-00__Regression__/);

  fs.rmSync(root, { recursive: true, force: true });
});

test('inferRunMetadata falls back to run_configuration.md history table when run.json lacks scope/target', () => {
  const root = makeFixtureRoot();
  const runFolder = path.join(root, 'platform_core_data', 'runs', 'RUN-20260706-002');
  fs.mkdirSync(runFolder, { recursive: true });

  fs.writeFileSync(
    path.join(root, 'platform_core_data', 'run_configuration.md'),
    [
      '## History of scope choices',
      '',
      '| Run | Run Type | Run Scope (Type / Source) | In-scope modules (summary) | Project Context version |',
      '|---|---|---|---|---|',
      '| RUN-20260706-002 | Custom | Custom Scope / Pasted text | Login Module | v2 |',
    ].join('\n')
  );

  const { inferRunMetadata } = migrate;
  const meta = inferRunMetadata('RUN-20260706-002', runFolder, dataRootOf(root));

  assert.equal(meta.scopeRaw, 'Custom');
  assert.equal(meta.target, 'Login Module');
  assert.match(meta.source, /run_configuration\.md/);

  fs.rmSync(root, { recursive: true, force: true });
});

test('inferRunMetadata falls back to *_RunManifest.md when nothing else has the run', () => {
  const root = makeFixtureRoot();
  const runFolder = path.join(root, 'platform_core_data', 'runs', 'RUN-20260710-001');
  fs.mkdirSync(runFolder, { recursive: true });

  fs.writeFileSync(
    path.join(root, 'platform_core_data', 'RunManifest.md'),
    [
      '## RUN-20260710-001 — Credential Routes Filter',
      '',
      'Run Scope: Type = User Story · Source = Pasted text',
      'Purpose: Validate the Credential Routes Filter user story.',
      '',
      '## RUN-20260712-001 — Next run',
    ].join('\n')
  );

  const { inferRunMetadata } = migrate;
  const meta = inferRunMetadata('RUN-20260710-001', runFolder, dataRootOf(root));

  assert.equal(meta.scopeRaw, 'User Story');
  assert.equal(meta.target, 'Credential Routes Filter');
  assert.match(meta.source, /RunManifest.md/);

  fs.rmSync(root, { recursive: true, force: true });
});

test('inferRunMetadata never throws and returns Unknown-safe metadata when nothing can be found', () => {
  const root = makeFixtureRoot();
  const runFolder = path.join(root, 'platform_core_data', 'runs', 'RUN-20260101-001');
  fs.mkdirSync(runFolder, { recursive: true });

  const { inferRunMetadata, computeInferredName } = migrate;
  const meta = inferRunMetadata('RUN-20260101-001', runFolder, dataRootOf(root));

  assert.equal(meta.scopeRaw, undefined);
  assert.equal(meta.target, undefined);
  assert.equal(meta.confidence, 'low');

  const name = computeInferredName(meta, 'RUN-20260101-001');
  assert.match(name, /^2026-01-01_00-00-00__Unknown__Unknown$/);

  fs.rmSync(root, { recursive: true, force: true });
});

test('migrateRuns is idempotent: running it twice produces an identical index with no re-renames', () => {
  const root = makeFixtureRoot();
  const runsDir = path.join(root, 'platform_core_data', 'runs');
  const runFolder = path.join(runsDir, 'RUN-20260101-001');
  fs.mkdirSync(path.join(runFolder, 'metadata'), { recursive: true });
  fs.writeFileSync(
    path.join(runFolder, 'metadata', 'run.json'),
    JSON.stringify({ 'Run Type': 'Smoke', 'Started Time': '2026-01-01T00:00:00Z' })
  );

  const { migrateRuns } = migrate;
  const first = migrateRuns({ apply: false, dataRoot: dataRootOf(root) });
  const indexAfterFirst = fs.readFileSync(path.join(runsDir, '.run_folder_index.json'), 'utf8');

  // Reload fresh (module caches loadIndex results only via fs reads, so a second in-process call
  // is sufficient to prove idempotency without re-copying fixtures).
  const second = migrateRuns({ apply: false, dataRoot: dataRootOf(root) });
  const indexAfterSecond = fs.readFileSync(path.join(runsDir, '.run_folder_index.json'), 'utf8');

  assert.equal(indexAfterFirst, indexAfterSecond);
  assert.equal(first[0].inferredNewName, second[0].inferredNewName);
  assert.equal(second[0].renamed, false); // isRenameSafe is true here (no other file references it),
  // but --apply was not passed, so nothing on disk changes.
  assert.equal(fs.existsSync(runFolder), true);

  fs.rmSync(root, { recursive: true, force: true });
});
