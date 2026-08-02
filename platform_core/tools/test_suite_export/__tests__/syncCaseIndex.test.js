'use strict';

// The Case Index is DERIVED from the case bodies — the same argument that makes the workbook
// generated, applied one level down, inside the Markdown.
//
// This drifted in practice within minutes of the lifecycle columns existing: a reviewer's decisions
// and a rewritten case title landed in the bodies while the index still showed superseded values, so
// the document disagreed with itself about which cases were approved.

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { syncCaseIndex, readCases, IndexSyncError } = require('../syncCaseIndex');

function tmpFile(content) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sync-index-'));
  test.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const p = path.join(dir, 'TestCases_Agency.md');
  fs.writeFileSync(p, content);
  return p;
}

function caseBlock(id, o = {}) {
  return [
    `### ${id} — ${o.title || 'A case'}`, '',
    '**Objective:** Verify something.', '',
    '**Steps:**', '1. Do it.', '',
    '**Expected Result:** It happened.', '',
    `**Priority:** ${o.priority || 'P2'}`, '',
    `**Tags:** ${o.tags || 'Atomic'}`, '',
    `**Review:** ${o.review || 'Pending'}`, '',
    `**Automation:** ${o.automation || 'Pending'}`, '',
  ].join('\n');
}

function doc(indexRows, blocks, extras = '') {
  return [
    '# Manual Test Suite — Agency', '',
    '| Field | Value |', '|---|---|', '| Total Test Cases | 999 |', '',
    '## Case Index', '',
    '| Test Case ID | Title | Tier | Priority | Tags | Review | Automation |',
    '|---|---|---|---|---|---|---|',
    ...indexRows, '',
    '**Tier breakdown:** 99 Atomic',
    extras, '',
    ...blocks,
  ].join('\n');
}

test('rewrites an index row that disagrees with its case body', () => {
  const p = tmpFile(doc(
    ['| TC-AG-001 | Old title | Atomic | P3 | Atomic | Pending | Pending |'],
    [caseBlock('TC-AG-001', { title: 'New title', priority: 'P1', tags: 'Scenario, Smoke', review: 'Approved', automation: 'Rejected' })],
  ));

  const result = syncCaseIndex(p);
  assert.strictEqual(result.written, true);
  const text = fs.readFileSync(p, 'utf8');
  assert.match(text, /\| TC-AG-001 \| New title \| Scenario \| P1 \| Scenario, Smoke \| Approved \| Rejected \|/);
  assert.ok(!text.includes('Old title'));
});

test('the case body wins — the index is never treated as a second source', () => {
  const p = tmpFile(doc(
    ['| TC-AG-001 | T | Atomic | P1 | Atomic | Approved | Approved |'],
    [caseBlock('TC-AG-001', { title: 'T', priority: 'P1', review: 'Pending', automation: 'Pending' })],
  ));

  syncCaseIndex(p);
  const text = fs.readFileSync(p, 'utf8');
  // An index claiming Approved must not survive a body that says Pending: the index cannot
  // authorize execution the case body has not recorded.
  assert.match(text, /\| TC-AG-001 \| T \| Atomic \| P1 \| Atomic \| Pending \| Pending \|/);
});

test('appends a case that is missing from the index entirely', () => {
  const p = tmpFile(doc(
    ['| TC-AG-001 | One | Atomic | P1 | Atomic | Pending | Pending |'],
    [caseBlock('TC-AG-001', { title: 'One', priority: 'P1' }), caseBlock('TC-AG-002', { title: 'Two' })],
  ));

  const result = syncCaseIndex(p);
  assert.ok(result.changes.some((c) => c.id === 'TC-AG-002' && c.from === '(absent from index)'));
  assert.match(fs.readFileSync(p, 'utf8'), /\| TC-AG-002 \| Two \|/);
});

test('an index row with no case body warns and is left for a human to remove', () => {
  const p = tmpFile(doc(
    [
      '| TC-AG-001 | One | Atomic | P1 | Atomic | Pending | Pending |',
      '| TC-AG-404 | Deleted case | Atomic | P1 | Atomic | Approved | Approved |',
    ],
    [caseBlock('TC-AG-001', { title: 'One', priority: 'P1' })],
  ));

  const result = syncCaseIndex(p);
  assert.match(result.warnings.join('\n'), /TC-AG-404: listed in the Case Index but has no case body/);
  // Deleting a row on the tool's own initiative could silently drop a case someone meant to restore.
  assert.match(fs.readFileSync(p, 'utf8'), /TC-AG-404/);
});

test('Tier is derived from Tags, most-specific first', () => {
  const cases = readCases([
    caseBlock('TC-AG-001', { tags: 'Atomic, Smoke' }),
    caseBlock('TC-AG-002', { tags: 'Scenario, Regression' }),
    caseBlock('TC-AG-003', { tags: 'E2E, Blocked' }),
    caseBlock('TC-AG-004', { tags: 'Regression' }),
  ].join('\n'));

  assert.deepStrictEqual(cases.map((c) => c.tier), ['Atomic', 'Scenario', 'E2E', '']);
});

test('recomputes the totals a hand-maintained document gets wrong', () => {
  const p = tmpFile(doc(
    ['| TC-AG-001 | One | Atomic | P1 | Atomic | Pending | Pending |'],
    [
      caseBlock('TC-AG-001', { title: 'One', priority: 'P1', tags: 'Atomic' }),
      caseBlock('TC-AG-002', { title: 'Two', tags: 'Scenario', review: 'Approved' }),
    ],
    '\n**Lifecycle breakdown:** Review — 99 Pending · 0 Approved · 0 Rejected · Automation — 99 Pending · 0 Approved · 0 Rejected',
  ));

  syncCaseIndex(p);
  const text = fs.readFileSync(p, 'utf8');
  assert.match(text, /\| Total Test Cases \| 2 \|/);
  assert.match(text, /\*\*Tier breakdown:\*\* 1 Atomic · 1 Scenario/);
  assert.match(text, /\*\*Lifecycle breakdown:\*\* Review — 1 Pending · 1 Approved · 0 Rejected/);
});

test('zeros are shown in the roll-up, because absent reads as "not tracked"', () => {
  const p = tmpFile(doc(
    ['| TC-AG-001 | One | Atomic | P1 | Atomic | Pending | Pending |'],
    [caseBlock('TC-AG-001', { title: 'One', priority: 'P1' })],
    '\n**Lifecycle breakdown:** x',
  ));

  syncCaseIndex(p);
  assert.match(fs.readFileSync(p, 'utf8'), /Review — 1 Pending · 0 Approved · 0 Rejected/);
});

test('a pipe in a title cannot break the table it is rendered into', () => {
  const p = tmpFile(doc(
    ['| TC-AG-001 | old | Atomic | P1 | Atomic | Pending | Pending |'],
    [caseBlock('TC-AG-001', { title: 'Search by A | B', priority: 'P1' })],
  ));

  syncCaseIndex(p);
  assert.match(fs.readFileSync(p, 'utf8'), /\| TC-AG-001 \| Search by A \\\| B \| Atomic \| P1 \|/);
});

test('--check reports without writing', () => {
  const original = doc(
    ['| TC-AG-001 | stale | Atomic | P3 | Atomic | Pending | Pending |'],
    [caseBlock('TC-AG-001', { title: 'fresh', priority: 'P1' })],
  );
  const p = tmpFile(original);

  const result = syncCaseIndex(p, { dryRun: true });
  assert.ok(result.changes.length > 0);
  assert.strictEqual(result.written, false);
  assert.strictEqual(fs.readFileSync(p, 'utf8'), original);
});

test('an already-consistent document is a no-op', () => {
  const p = tmpFile(doc(
    ['| TC-AG-001 | One | Atomic | P1 | Atomic | Pending | Pending |'],
    [caseBlock('TC-AG-001', { title: 'One', priority: 'P1' })],
  ));

  syncCaseIndex(p);
  const after = fs.readFileSync(p, 'utf8');
  const result = syncCaseIndex(p);
  assert.deepStrictEqual(result.changes, []);
  assert.strictEqual(result.written, false);
  assert.strictEqual(fs.readFileSync(p, 'utf8'), after);
});

test('a document with no Case Index is a named error, not a silent pass', () => {
  const p = tmpFile(['# Suite', '', caseBlock('TC-AG-001')].join('\n'));
  assert.throws(() => syncCaseIndex(p), (err) => {
    assert.ok(err instanceof IndexSyncError);
    assert.match(err.message, /no Case Index table/);
    return true;
  });
});

test('CRLF input keeps its line endings', () => {
  const p = tmpFile(doc(
    ['| TC-AG-001 | stale | Atomic | P3 | Atomic | Pending | Pending |'],
    [caseBlock('TC-AG-001', { title: 'fresh', priority: 'P1' })],
  ).split('\n').join('\r\n'));

  syncCaseIndex(p);
  const text = fs.readFileSync(p, 'utf8');
  assert.ok(text.includes('\r\n'));
  assert.ok(!/[^\r]\n/.test(text), 'no bare LF should remain');
});
