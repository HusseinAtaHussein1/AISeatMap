const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  isRenameSafe,
  buildIndexEntry,
  loadIndex,
  saveIndex,
  resolveRunFolder,
  INDEX_FILENAME,
} = require('../runFolderIndex');

function makeTempProject() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'run-folder-index-test-'));
}

test('isRenameSafe returns true when no other file references the folder name', () => {
  const root = makeTempProject();
  const runsDir = path.join(root, 'runs');
  const folder = path.join(runsDir, 'RUN-20260101-001');
  fs.mkdirSync(folder, { recursive: true });
  fs.writeFileSync(path.join(folder, 'note.md'), 'RUN-20260101-001 mentions itself, which is fine');
  fs.writeFileSync(path.join(root, 'unrelated.md'), 'nothing to see here');

  assert.equal(isRenameSafe(root, folder), true);
  fs.rmSync(root, { recursive: true, force: true });
});

test('isRenameSafe returns false when another file references the folder name', () => {
  const root = makeTempProject();
  const runsDir = path.join(root, 'runs');
  const folder = path.join(runsDir, 'RUN-20260101-001');
  fs.mkdirSync(folder, { recursive: true });
  fs.writeFileSync(path.join(root, 'RunManifest.md'), 'See RUN-20260101-001 for details.');

  assert.equal(isRenameSafe(root, folder), false);
  fs.rmSync(root, { recursive: true, force: true });
});

test('saveIndex/loadIndex round-trip and are idempotent', () => {
  const root = makeTempProject();
  const runsDir = path.join(root, 'runs');
  fs.mkdirSync(runsDir, { recursive: true });

  const entries = [
    buildIndexEntry('RUN-20260101-001', '2026-01-01_00-00-00__Targeted__Unknown', { source: 'test', confidence: 'low' }),
  ];
  saveIndex(runsDir, entries);
  const firstWrite = fs.readFileSync(path.join(runsDir, INDEX_FILENAME), 'utf8');

  saveIndex(runsDir, loadIndex(runsDir));
  const secondWrite = fs.readFileSync(path.join(runsDir, INDEX_FILENAME), 'utf8');

  assert.equal(firstWrite, secondWrite);
  assert.deepEqual(loadIndex(runsDir), entries);
  fs.rmSync(root, { recursive: true, force: true });
});

test('loadIndex returns an empty array when no index file exists yet', () => {
  const root = makeTempProject();
  assert.deepEqual(loadIndex(path.join(root, 'runs')), []);
  fs.rmSync(root, { recursive: true, force: true });
});

test('resolveRunFolder finds an exact on-disk match without consulting the index', () => {
  const root = makeTempProject();
  const runsDir = path.join(root, 'runs');
  fs.mkdirSync(path.join(runsDir, '2026-07-23_10-35-18__FullRun__FlightSearch'), { recursive: true });

  assert.equal(
    resolveRunFolder(runsDir, '2026-07-23_10-35-18__FullRun__FlightSearch'),
    '2026-07-23_10-35-18__FullRun__FlightSearch'
  );
  fs.rmSync(root, { recursive: true, force: true });
});

test('resolveRunFolder resolves a new-convention name back to its legacy on-disk folder via the index', () => {
  const root = makeTempProject();
  const runsDir = path.join(root, 'runs');
  fs.mkdirSync(path.join(runsDir, 'RUN-20260706-001'), { recursive: true });
  saveIndex(runsDir, [
    buildIndexEntry('RUN-20260706-001', '2026-07-06_10-02-30__UserStory__Login', { source: 'test', confidence: 'high' }),
  ]);

  assert.equal(resolveRunFolder(runsDir, '2026-07-06_10-02-30__UserStory__Login'), 'RUN-20260706-001');
  fs.rmSync(root, { recursive: true, force: true });
});

test('resolveRunFolder resolves a bare Run ID to its full legacy folder name', () => {
  const root = makeTempProject();
  const runsDir = path.join(root, 'runs');
  fs.mkdirSync(path.join(runsDir, 'RUN-20260721-001-first-run-login'), { recursive: true });

  assert.equal(resolveRunFolder(runsDir, 'RUN-20260721-001'), 'RUN-20260721-001-first-run-login');
  fs.rmSync(root, { recursive: true, force: true });
});

test('resolveRunFolder returns null for an unresolvable identifier', () => {
  const root = makeTempProject();
  const runsDir = path.join(root, 'runs');
  fs.mkdirSync(runsDir, { recursive: true });

  assert.equal(resolveRunFolder(runsDir, 'RUN-99999999-999'), null);
  fs.rmSync(root, { recursive: true, force: true });
});
