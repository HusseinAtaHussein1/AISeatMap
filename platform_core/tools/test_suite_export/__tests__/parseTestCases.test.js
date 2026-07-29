'use strict';

const test = require('node:test');
const assert = require('node:assert');

const { parseTestCases, toRows, FIELDS } = require('../parseTestCases');

/** A suite in the `## TC-x` + `**Title:**` shape the reference Stage 3 run produced. */
const REFERENCE_SHAPE = `# Manual Test Suite — Search

**Run ID:** \`run-001__x\` | **Module:** Search

> Scope banner prose that is not a test case.

---

## TC-SR-001

**Title:** Search returns results for a valid query

**Objective:** Verify that submitting a query returns a matching result grid.

**Preconditions:** Anonymous session.

**Test Data:** Query: \`wireless mouse\`

**Steps:**
1. Click the search box.
2. Type \`wireless mouse\`.
3. Press Enter.

**Expected Result:** At least one result card is displayed.

**Priority:** P1

**Tags:** Atomic, Smoke, Positive

---

## TC-SR-002

**Title:** Empty query is rejected

**Objective:** Verify an empty submission does not navigate.

**Preconditions:** Homepage open.

**Test Data:** None

**Steps:**
1. Press Enter with an empty search box.

**Expected Result:** The page does not navigate.

**Priority:** P2

**Tags:** Atomic, Negative-EmptyValues

**Notes:** Reading the DOM only.

---

## Summary

| Field | Value |
|---|---|
| Total | 2 |
`;

test('parses the reference suite shape: every case, every field', () => {
  const { cases, warnings } = parseTestCases(REFERENCE_SHAPE);
  assert.deepStrictEqual(warnings, []);
  assert.strictEqual(cases.length, 2);

  const [first, second] = cases;
  assert.strictEqual(first.id, 'TC-SR-001');
  assert.strictEqual(first.title, 'Search returns results for a valid query');
  assert.strictEqual(first.objective, 'Verify that submitting a query returns a matching result grid.');
  assert.strictEqual(first.preconditions, 'Anonymous session.');
  assert.strictEqual(first.testData, 'Query: `wireless mouse`');
  assert.strictEqual(first.expectedResult, 'At least one result card is displayed.');
  assert.strictEqual(first.priority, 'P1');
  assert.strictEqual(first.tags, 'Atomic, Smoke, Positive');
  // Absent optional field stays absent rather than becoming a placeholder string.
  assert.strictEqual(first.notes, undefined);
  assert.strictEqual(second.notes, 'Reading the DOM only.');
});

test('Steps join with " | " and carry canonical numbering', () => {
  const { cases } = parseTestCases(REFERENCE_SHAPE);
  assert.strictEqual(
    cases[0].steps,
    '1. Click the search box. | 2. Type `wireless mouse`. | 3. Press Enter.'
  );
  assert.strictEqual(cases[1].steps, '1. Press Enter with an empty search box.');
});

test('renumbers an all-"1." authored list, because Stage 4 cites step numbers', () => {
  const md = [
    '## TC-A-001', '', '**Title:** T', '', '**Objective:** O', '', '**Preconditions:** P', '',
    '**Steps:**', '1. First.', '1. Second.', '1. Third.', '',
    '**Expected Result:** E', '', '**Priority:** P1', '', '**Tags:** Atomic', '',
  ].join('\n');
  const { cases } = parseTestCases(md);
  assert.strictEqual(cases[0].steps, '1. First. | 2. Second. | 3. Third.');
});

test('accepts the combined `### TC-x — Title` heading shape', () => {
  const md = [
    '### TC-LOGIN-001 — Valid credentials sign the user in', '',
    '**Objective:** O', '', '**Preconditions:** P', '',
    '**Steps:**', '1. Sign in.', '',
    '**Expected Result:** E', '', '**Priority:** P1', '', '**Tags:** Scenario', '',
  ].join('\n');
  const { cases, warnings } = parseTestCases(md);
  assert.deepStrictEqual(warnings, []);
  assert.strictEqual(cases.length, 1);
  assert.strictEqual(cases[0].id, 'TC-LOGIN-001');
  assert.strictEqual(cases[0].title, 'Valid credentials sign the user in');
});

test('a heading Title wins over a later **Title:** field, without a duplicate warning', () => {
  const md = [
    '### TC-X-001 — Heading title', '', '**Title:** Field title', '',
    '**Objective:** O', '', '**Steps:**', '1. Do it.', '',
    '**Expected Result:** E', '', '**Priority:** P1', '', '**Tags:** Atomic', '',
  ].join('\n');
  const { cases, warnings } = parseTestCases(md);
  assert.strictEqual(cases[0].title, 'Heading title');
  assert.ok(warnings.some((w) => /duplicate "title"/.test(w)), 'the collision is reported, not hidden');
});

test('multi-line Test Data tables keep their line structure', () => {
  const md = [
    '## TC-D-001', '', '**Title:** T', '', '**Objective:** O', '',
    '**Test Data:**', '', '| Field | Value |', '|---|---|', '| Email | a@b.c |', '| Role | Admin |', '',
    '**Steps:**', '1. Submit.', '',
    '**Expected Result:** E', '', '**Priority:** P1', '', '**Tags:** Atomic', '',
  ].join('\n');
  const { cases } = parseTestCases(md);
  assert.strictEqual(cases[0].testData, '| Field | Value |\n|---|---|\n| Email | a@b.c |\n| Role | Admin |');
});

test('reports a missing required field instead of silently emitting a blank cell', () => {
  const md = [
    '## TC-M-001', '', '**Title:** T', '', '**Objective:** O', '',
    '**Steps:**', '1. Do something.', '', // no Expected Result, no Priority, no Tags
  ].join('\n');
  const { cases, warnings } = parseTestCases(md, { sourceLabel: 'TestCases_M.md' });
  assert.strictEqual(cases.length, 1, 'the case is still exported — the warning is the signal');
  const warning = warnings.find((w) => w.includes('TC-M-001'));
  assert.ok(warning, 'a warning names the offending case');
  assert.match(warning, /TestCases_M\.md/, 'and the file it came from');
  for (const field of ['expectedResult', 'priority', 'tags']) {
    assert.match(warning, new RegExp(field));
  }
});

test('reports duplicate Test Case IDs — uniqueness is a traceability requirement', () => {
  const caseBlock = (id) => [
    `## ${id}`, '', '**Title:** T', '', '**Objective:** O', '',
    '**Steps:**', '1. Go.', '', '**Expected Result:** E', '', '**Priority:** P1', '', '**Tags:** Atomic', '',
  ].join('\n');
  const { cases, warnings } = parseTestCases(caseBlock('TC-Z-001') + '\n---\n' + caseBlock('TC-Z-001'));
  assert.strictEqual(cases.length, 2);
  assert.ok(warnings.some((w) => /duplicate Test Case ID "TC-Z-001"/.test(w)));
});

test('an empty suite is a warning, not a silent success', () => {
  const { cases, warnings } = parseTestCases('# Manual Test Suite — Empty\n\nNo cases yet.\n');
  assert.deepStrictEqual(cases, []);
  assert.ok(warnings.some((w) => /no test cases found/.test(w)));
});

test('fenced code inside a field is preserved and never read as structure', () => {
  const md = [
    '## TC-F-001', '', '**Title:** T', '', '**Objective:** O', '',
    '**Test Data:**', '```', '## TC-FAKE-999', '**Title:** not a real case', '```', '',
    '**Steps:**', '1. Paste the payload.', '',
    '**Expected Result:** E', '', '**Priority:** P1', '', '**Tags:** Atomic', '',
  ].join('\n');
  const { cases } = parseTestCases(md);
  assert.strictEqual(cases.length, 1, 'the fenced heading did not open a second case');
  assert.match(cases[0].testData, /TC-FAKE-999/, 'the fenced content survived as data');
});

test('prose emphasis is not mistaken for a field marker', () => {
  const md = [
    '## TC-P-001', '', '**Title:** T', '', '**Objective:** O', '',
    '**Steps:**', '1. Go.', '',
    '**Expected Result:** The banner appears.', '**Important:** it must be dismissible.', '',
    '**Priority:** P1', '', '**Tags:** Atomic', '',
  ].join('\n');
  const { cases } = parseTestCases(md);
  assert.match(cases[0].expectedResult, /Important/, 'unknown label stayed with the open field');
  assert.strictEqual(cases[0].priority, 'P1', 'and real fields after it still parsed');
});

test('CRLF input parses identically to LF', () => {
  const lf = parseTestCases(REFERENCE_SHAPE);
  const crlf = parseTestCases(REFERENCE_SHAPE.replace(/\n/g, '\r\n'));
  assert.deepStrictEqual(crlf.cases, lf.cases);
});

test('toRows emits the §6.1 header in order, then one row per case', () => {
  const { cases } = parseTestCases(REFERENCE_SHAPE);
  const rows = toRows(cases);
  assert.deepStrictEqual(rows[0], [
    'Test Case ID', 'Title', 'Objective', 'Preconditions', 'Test Data',
    'Steps', 'Expected Result', 'Priority', 'Tags', 'Notes',
  ]);
  assert.strictEqual(rows.length, cases.length + 1);
  for (const row of rows) assert.strictEqual(row.length, FIELDS.length);
  // An absent optional field becomes '', never the string "undefined".
  assert.strictEqual(rows[1][9], '');
});
