'use strict';

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { exportSuite, exportSuiteDir, ExportError } = require('../exportSuites');

function tmpDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'suite-export-'));
  test.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return dir;
}

function suiteMarkdown(idPrefix, count) {
  const blocks = [];
  for (let i = 1; i <= count; i += 1) {
    const id = `TC-${idPrefix}-${String(i).padStart(3, '0')}`;
    blocks.push([
      `## ${id}`, '',
      `**Title:** Case ${i}`, '',
      '**Objective:** Verify something specific.', '',
      '**Preconditions:** Anonymous session.', '',
      '**Test Data:** None', '',
      '**Steps:**', '1. Do the thing.', '2. Observe.', '',
      '**Expected Result:** The thing happened.', '',
      '**Priority:** P1', '',
      '**Tags:** Atomic, Positive', '',
      '---', '',
    ].join('\n'));
  }
  return `# Manual Test Suite — ${idPrefix}\n\n---\n\n${blocks.join('\n')}\n## Summary\n\nTotal: ${count}\n`;
}

test('exports one suite to the sibling .xlsx, named for the module', () => {
  const dir = tmpDir();
  const md = path.join(dir, 'TestCases_Search.md');
  fs.writeFileSync(md, suiteMarkdown('SR', 3));

  const result = exportSuite(md);
  assert.strictEqual(result.module, 'Search');
  assert.strictEqual(result.caseCount, 3);
  assert.strictEqual(result.xlsxPath, path.join(dir, 'TestCases_Search.xlsx'));
  assert.strictEqual(result.written, true);
  assert.deepStrictEqual(result.warnings, []);
  assert.ok(fs.existsSync(result.xlsxPath));
  // A real ZIP starts with "PK\x03\x04".
  assert.strictEqual(fs.readFileSync(result.xlsxPath).slice(0, 4).toString('binary'), 'PK');
});

test('--check parses and reports without writing anything', () => {
  const dir = tmpDir();
  const md = path.join(dir, 'TestCases_Cart.md');
  fs.writeFileSync(md, suiteMarkdown('CART', 2));

  const result = exportSuite(md, { dryRun: true });
  assert.strictEqual(result.caseCount, 2);
  assert.strictEqual(result.written, false);
  assert.strictEqual(result.bytes, 0);
  assert.ok(!fs.existsSync(path.join(dir, 'TestCases_Cart.xlsx')), 'check mode must not write');
});

test('a custom sheet name supports one file grouping several requirement groups', () => {
  const dir = tmpDir();
  const md = path.join(dir, 'TestCases_Navigation.md');
  fs.writeFileSync(md, suiteMarkdown('NAV', 1));

  exportSuite(md, { sheetName: 'Navigation_NFR_BR' });
  const xml = fs.readFileSync(path.join(dir, 'TestCases_Navigation.xlsx'), 'utf8');
  assert.ok(xml.includes('name="Navigation_NFR_BR"'));
});

test('exporting a whole folder covers every module and totals the cases', () => {
  const dir = tmpDir();
  fs.writeFileSync(path.join(dir, 'TestCases_Search.md'), suiteMarkdown('SR', 13));
  fs.writeFileSync(path.join(dir, 'TestCases_Cart.md'), suiteMarkdown('CART', 4));
  fs.writeFileSync(path.join(dir, 'TestCases_Authentication.md'), suiteMarkdown('AUTH', 5));
  // Non-suite files in the same folder are left alone.
  fs.writeFileSync(path.join(dir, 'CoverageReport.md'), '# Coverage Report\n');
  fs.writeFileSync(path.join(dir, 'TraceabilityMatrix.md'), '# Matrix\n');

  const { results, warnings, skipped } = exportSuiteDir(dir);
  assert.strictEqual(results.length, 3);
  assert.deepStrictEqual(warnings, []);
  assert.deepStrictEqual(skipped, []);
  assert.deepStrictEqual(results.map((r) => r.module).sort(), ['Authentication', 'Cart', 'Search']);
  assert.strictEqual(results.reduce((n, r) => n + r.caseCount, 0), 22);

  for (const name of ['Search', 'Cart', 'Authentication']) {
    assert.ok(fs.existsSync(path.join(dir, `TestCases_${name}.xlsx`)));
  }
  assert.ok(!fs.existsSync(path.join(dir, 'CoverageReport.xlsx')), 'only suite documents are exported');
});

test('superseded .vN copies are skipped loudly, never exported as shadow workbooks', () => {
  const dir = tmpDir();
  fs.writeFileSync(path.join(dir, 'TestCases_Search.md'), suiteMarkdown('SR', 2));
  fs.writeFileSync(path.join(dir, 'TestCases_Search.v1.md'), suiteMarkdown('SR', 99));

  const { results, skipped } = exportSuiteDir(dir);
  assert.strictEqual(results.length, 1);
  assert.strictEqual(results[0].caseCount, 2, 'the current suite, not the v1 copy');
  assert.strictEqual(skipped.length, 1);
  assert.match(skipped[0], /TestCases_Search\.v1\.md/);
  assert.ok(!fs.existsSync(path.join(dir, 'TestCases_Search.v1.xlsx')));
});

test('per-module sheet name overrides apply when exporting a folder', () => {
  const dir = tmpDir();
  fs.writeFileSync(path.join(dir, 'TestCases_Navigation.md'), suiteMarkdown('NAV', 1));
  exportSuiteDir(dir, { sheetNames: { Navigation: 'Navigation_NFR_BR' } });
  assert.ok(fs.readFileSync(path.join(dir, 'TestCases_Navigation.xlsx'), 'utf8').includes('name="Navigation_NFR_BR"'));
});

test('parse warnings propagate to the folder result, so a caller can gate on them', () => {
  const dir = tmpDir();
  // Missing Expected Result / Priority / Tags.
  fs.writeFileSync(path.join(dir, 'TestCases_Broken.md'), [
    '## TC-B-001', '', '**Title:** T', '', '**Objective:** O', '', '**Steps:**', '1. Go.', '',
  ].join('\n'));

  const { results, warnings } = exportSuiteDir(dir);
  assert.strictEqual(results.length, 1);
  assert.ok(warnings.length > 0, 'the defect is surfaced, not swallowed');
  assert.match(warnings.join('\n'), /TC-B-001/);
  assert.ok(fs.existsSync(path.join(dir, 'TestCases_Broken.xlsx')), 'the workbook is still produced');
});

test('a folder with no suite documents is a clear error, not an empty success', () => {
  const dir = tmpDir();
  fs.writeFileSync(path.join(dir, 'CoverageReport.md'), '# Coverage Report\n');
  assert.throws(() => exportSuiteDir(dir), (err) => {
    assert.ok(err instanceof ExportError);
    assert.match(err.message, /No TestCases_\{Module\}\.md documents found/);
    return true;
  });
});

test('a non-suite filename and a missing directory both fail with a named error', () => {
  const dir = tmpDir();
  const stray = path.join(dir, 'NotASuite.md');
  fs.writeFileSync(stray, '# nope\n');
  assert.throws(() => exportSuite(stray), (err) => {
    assert.ok(err instanceof ExportError);
    assert.match(err.message, /expected TestCases_\{Module\}\.md/);
    return true;
  });
  assert.throws(() => exportSuiteDir(path.join(dir, 'does-not-exist')), /Not a directory/);
  assert.throws(() => exportSuite(path.join(dir, 'TestCases_Ghost.md')), /Cannot read/);
});

test('re-exporting unchanged Markdown rewrites identical bytes', () => {
  const dir = tmpDir();
  const md = path.join(dir, 'TestCases_Search.md');
  fs.writeFileSync(md, suiteMarkdown('SR', 4));

  const first = fs.readFileSync(exportSuite(md).xlsxPath);
  const second = fs.readFileSync(exportSuite(md).xlsxPath);
  assert.ok(first.equals(second), 'a re-run must not churn the file in git');
});
