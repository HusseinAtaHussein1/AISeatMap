const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  matchesPattern, classifyPath, classifyChangeset, assertWritable, registerModuleOwnership,
  readOwnership, BaselineOwnershipError, OWNERSHIP_FILENAME,
} = require('../baselineOwnership');

const MANIFEST = {
  schemaVersion: 1,
  modules: {
    branch: {
      owned: [
        'src/main/java/AdminPages/Admin/Branch/**',
        'src/test/java/AdminPages/Admin/Branch/**',
        'src/test/resources/branch_baseline.properties',
      ],
    },
    agency: { owned: ['src/main/java/AdminPages/Admin/Agency/**'] },
  },
  shared: ['pom.xml', 'src/main/java/utilities/**', 'src/main/java/AdminPages/Login/**'],
};

test('** matches across directory separators, * does not', () => {
  assert.equal(matchesPattern('a/b/c/D.java', 'a/**'), true);
  assert.equal(matchesPattern('a/b/c/D.java', 'a/*'), false);
  assert.equal(matchesPattern('a/D.java', 'a/*'), true);
});

test('patterns are anchored at both ends — a suffix match is not a match', () => {
  // Without anchoring, an unrelated module nesting the same folder name would inherit ownership.
  assert.equal(matchesPattern('other/src/main/java/AdminPages/Admin/Branch/X.java', 'src/main/java/AdminPages/Admin/Branch/**'), false);
});

test("a module's own file classifies as owned", () => {
  const r = classifyPath(MANIFEST, 'src/main/java/AdminPages/Admin/Branch/AddBranch_Page.java', 'branch');
  assert.equal(r.classification, 'owned');
  assert.equal(r.owner, 'branch');
});

test("another module's file classifies as foreign, and names the owner", () => {
  // The whole reason the manifest exists: after promotion every module lives in one tree, so
  // isolation has to be declared. The owner is reported because "you may not touch this" is only
  // actionable when it says whose it is.
  const r = classifyPath(MANIFEST, 'src/main/java/AdminPages/Admin/Agency/AgencyPage.java', 'branch');
  assert.equal(r.classification, 'foreign');
  assert.equal(r.owner, 'agency');
});

test('whole-project surface classifies as shared, not owned and not foreign', () => {
  assert.equal(classifyPath(MANIFEST, 'pom.xml', 'branch').classification, 'shared');
  assert.equal(classifyPath(MANIFEST, 'src/main/java/utilities/EnvironmentConfig.java', 'branch').classification, 'shared');
});

test('an unlisted path is unowned, never foreign — a new file must be addable', () => {
  assert.equal(classifyPath(MANIFEST, 'src/test/java/AdminPages/Admin/Branch/New_TC.java', 'branch').classification, 'owned');
  assert.equal(classifyPath(MANIFEST, 'docs/NOTES.md', 'branch').classification, 'unowned');
});

test('a changeset is allowed when it touches owned, shared and unowned paths only', () => {
  const r = classifyChangeset(MANIFEST, [
    'src/main/java/AdminPages/Admin/Branch/AddBranch_Page.java', 'pom.xml', 'docs/NOTES.md',
  ], 'branch');
  assert.equal(r.allowed, true);
  assert.deepEqual(r.shared, ['pom.xml']);
  assert.deepEqual(r.unowned, ['docs/NOTES.md']);
});

test('one foreign path fails the whole changeset, and the error lists every offender', () => {
  const paths = [
    'src/main/java/AdminPages/Admin/Branch/AddBranch_Page.java',
    'src/main/java/AdminPages/Admin/Agency/AgencyPage.java',
  ];
  assert.equal(classifyChangeset(MANIFEST, paths, 'branch').allowed, false);
  assert.throws(() => assertWritable(MANIFEST, paths, 'branch'), (err) => {
    assert.ok(err instanceof BaselineOwnershipError);
    assert.match(err.message, /AdminPages\/Admin\/Agency\/AgencyPage\.java/);
    assert.match(err.message, /owned by "agency"/);
    return true;
  });
});

test('no manifest means everything is unowned — a baseline before any promotion still works', () => {
  assert.equal(classifyPath(null, 'anything.java', 'branch').classification, 'unowned');
  assert.equal(classifyChangeset(null, ['a', 'b'], 'branch').allowed, true);
});

test('registerModuleOwnership round-trips through the manifest file', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ownership-'));
  try {
    registerModuleOwnership(dir, 'branch', {
      owned: ['src/main/java/AdminPages/Admin/Branch/**'],
      shared: ['pom.xml'],
      suite: 'testng-branch.xml',
      now: new Date('2026-08-17T00:00:00Z'),
    });
    const read = readOwnership(dir);
    assert.deepEqual(read.modules.branch.owned, ['src/main/java/AdminPages/Admin/Branch/**']);
    assert.equal(read.modules.branch.suite, 'testng-branch.xml');
    assert.ok(fs.existsSync(path.join(dir, OWNERSHIP_FILENAME)));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('a second module claiming the same paths is refused, not merged', () => {
  // Two owners means classifyPath answers "owned" for both, and the foreign guard never fires —
  // which would silently disable the only thing protecting one module's code from another's.
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ownership-collide-'));
  try {
    const now = new Date('2026-08-17T00:00:00Z');
    registerModuleOwnership(dir, 'branch', { owned: ['src/main/java/AdminPages/Admin/Branch/**'], now });
    assert.throws(
      () => registerModuleOwnership(dir, 'agency', { owned: ['src/main/java/AdminPages/Admin/Branch/**'], now }),
      /Ownership collision/,
    );
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('re-registering the SAME module is an update, not a collision', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ownership-update-'));
  try {
    const now = new Date('2026-08-17T00:00:00Z');
    registerModuleOwnership(dir, 'branch', { owned: ['a/**'], now });
    const next = registerModuleOwnership(dir, 'branch', { owned: ['a/**', 'b/**'], now });
    assert.deepEqual(next.modules.branch.owned, ['a/**', 'b/**']);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('a module must claim at least one path', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ownership-empty-'));
  try {
    assert.throws(
      () => registerModuleOwnership(dir, 'branch', { owned: [], now: new Date() }),
      /at least one owned path/,
    );
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
