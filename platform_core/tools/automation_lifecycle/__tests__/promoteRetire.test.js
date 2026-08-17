const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { verifyPromotion } = require('../promoteVerify');
const { retireModulePackage, cleanupPackage, assertNotBaseline, RetirementError } = require('../cleanup');

const PASS = { passed: true, verifiedCount: 3 };

function tree(root, files) {
  for (const [rel, content] of Object.entries(files)) {
    const abs = path.join(root, rel);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, content);
  }
  return root;
}

function pair(moduleFiles, baselineFiles) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'promote-'));
  const modulePkg = tree(path.join(root, 'modules', 'branch', 'automation', 'tests_SHAFT'), moduleFiles);
  const baseline = tree(path.join(root, 'baseline', 'tests_SHAFT'), baselineFiles);
  return { root, modulePkg, baseline };
}

// --- verification -----------------------------------------------------------------------------

test('verification passes when the baseline holds every module file with identical content', () => {
  const f = pair({ 'src/A.java': 'a', 'pom.xml': 'p' }, { 'src/A.java': 'a', 'pom.xml': 'p' });
  try {
    const r = verifyPromotion(f.baseline, f.modulePkg, { repo: null });
    assert.equal(r.passed, true);
    assert.equal(r.verifiedCount, 2);
  } finally {
    fs.rmSync(f.root, { recursive: true, force: true });
  }
});

test('verification fails on a missing file — one absent test class is one test that stops running', () => {
  const f = pair({ 'src/A.java': 'a', 'src/B.java': 'b' }, { 'src/A.java': 'a' });
  try {
    const r = verifyPromotion(f.baseline, f.modulePkg, { repo: null });
    assert.equal(r.passed, false);
    assert.deepEqual(r.missing, ['src/B.java']);
  } finally {
    fs.rmSync(f.root, { recursive: true, force: true });
  }
});

test('verification fails on differing content, and reports both hashes', () => {
  const f = pair({ 'src/A.java': 'a' }, { 'src/A.java': 'DIFFERENT' });
  try {
    const r = verifyPromotion(f.baseline, f.modulePkg, { repo: null });
    assert.equal(r.passed, false);
    assert.equal(r.differing.length, 1);
    assert.notEqual(r.differing[0].moduleHash, r.differing[0].baselineHash);
  } finally {
    fs.rmSync(f.root, { recursive: true, force: true });
  }
});

test('baseline-only files are reported, never treated as a failure', () => {
  // The baseline is a WHOLE-PROJECT suite: other modules' code and shared assets legitimately live
  // there and have no module counterpart.
  const f = pair({ 'src/A.java': 'a' }, { 'src/A.java': 'a', 'src/Other.java': 'o' });
  try {
    const r = verifyPromotion(f.baseline, f.modulePkg, { repo: null });
    assert.equal(r.passed, true);
    assert.deepEqual(r.baselineOnly, ['src/Other.java']);
  } finally {
    fs.rmSync(f.root, { recursive: true, force: true });
  }
});

test('a missing baseline fails verification rather than reporting an empty pass', () => {
  const f = pair({ 'src/A.java': 'a' }, {});
  try {
    fs.rmSync(f.baseline, { recursive: true, force: true });
    const r = verifyPromotion(f.baseline, f.modulePkg, { repo: null });
    assert.equal(r.passed, false);
    assert.match(r.reason, /only copy/);
  } finally {
    fs.rmSync(f.root, { recursive: true, force: true });
  }
});

// --- retirement -------------------------------------------------------------------------------

test('retirement without a passing verification is refused', () => {
  const f = pair({ 'src/A.java': 'a' }, { 'src/A.java': 'a' });
  try {
    assert.throws(
      () => retireModulePackage(f.modulePkg, { verification: { passed: false }, apply: true }),
      RetirementError,
    );
    assert.throws(() => retireModulePackage(f.modulePkg, { apply: true }), /PASSING/);
    assert.equal(fs.existsSync(f.modulePkg), true, 'the working copy must survive a refused retirement');
  } finally {
    fs.rmSync(f.root, { recursive: true, force: true });
  }
});

test('retirement is dry-run by default and reports what it would delete', () => {
  const f = pair({ 'src/A.java': 'a', 'src/B.java': 'b' }, {});
  try {
    const r = retireModulePackage(f.modulePkg, { verification: PASS });
    assert.equal(r.retired, false);
    assert.equal(r.fileCount, 2);
    assert.equal(fs.existsSync(f.modulePkg), true);
  } finally {
    fs.rmSync(f.root, { recursive: true, force: true });
  }
});

test('retirement with --apply removes the whole working copy', () => {
  const f = pair({ 'src/A.java': 'a' }, {});
  try {
    const r = retireModulePackage(f.modulePkg, { verification: PASS, apply: true });
    assert.equal(r.retired, true);
    assert.equal(fs.existsSync(f.modulePkg), false);
  } finally {
    fs.rmSync(f.root, { recursive: true, force: true });
  }
});

test('retirement refuses a path that is not a tests_* package under automation/', () => {
  // Retirement deletes a whole tree. Pointed one level up it would take the module's governance
  // artifacts and evidence with it — the exact thing the user drew the line around.
  const f = pair({ 'src/A.java': 'a' }, {});
  try {
    const moduleRoot = path.dirname(path.dirname(f.modulePkg));
    assert.throws(
      () => retireModulePackage(moduleRoot, { verification: PASS, apply: true }),
      /not a module automation package/,
    );
    assert.equal(fs.existsSync(moduleRoot), true);
  } finally {
    fs.rmSync(f.root, { recursive: true, force: true });
  }
});

// --- the baseline is never a deletion target ---------------------------------------------------

test('retirement refuses any path inside automation_baseline/', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'baseline-guard-'));
  try {
    const p = path.join(root, 'platform_core_data', 'automation_baseline', 'shaft', 'automation', 'tests_SHAFT');
    fs.mkdirSync(p, { recursive: true });
    assert.throws(() => retireModulePackage(p, { verification: PASS, apply: true }), /Workspace Automation Baseline/);
    assert.equal(fs.existsSync(p), true);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('cleanup refuses any path inside automation_baseline/ too', () => {
  // After promotion the baseline is the ONLY copy. A cleanup pass pointed at it is not a cleanup.
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'baseline-cleanup-'));
  try {
    const p = path.join(root, 'automation_baseline', 'shaft', 'tests_SHAFT');
    fs.mkdirSync(p, { recursive: true });
    assert.throws(
      () => cleanupPackage(p, { added: [], modified: [], deleted: [], renamed: [], discardedIgnored: ['target/x'] }, { apply: true }),
      /Workspace Automation Baseline/,
    );
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('the baseline guard resolves the path first, so a relative walk cannot slip past it', () => {
  assert.throws(
    () => assertNotBaseline(path.join('a', 'b', '..', '..', 'platform_core_data', 'automation_baseline', 'x'), 'Test'),
    /Workspace Automation Baseline/,
  );
});
