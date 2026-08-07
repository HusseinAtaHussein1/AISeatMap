'use strict';

// The lifecycle import — decisions flow Excel -> Markdown, and NOTHING else does.
//
// The reader must survive a workbook a human has actually saved, which is a different file from the
// one we wrote: DEFLATE instead of STORED, sharedStrings instead of inlineStr, and omitted empty
// cells. Those are the cases most of these tests cover, because a reader that only understood our
// own output would fail on precisely the files this tool exists for.

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const zlib = require('node:zlib');

const { importLifecycle, readDecisions, ImportError } = require('../importLifecycle');
const { readWorkbook, columnIndex } = require('../readWorkbook');
const { buildWorkbook } = require('../xlsxWriter');
const { FIELDS } = require('../parseTestCases');

function tmpDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lifecycle-'));
  test.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return dir;
}

/** A suite document with `count` cases, all lifecycle fields at Pending unless overridden. */
function suiteMarkdown(count, overrides = {}) {
  const blocks = [];
  for (let i = 1; i <= count; i += 1) {
    const id = `TC-AG-${String(i).padStart(3, '0')}`;
    const o = overrides[id] || {};
    blocks.push([
      `### ${id} — Case ${i}`, '',
      '**Objective:** Verify something specific.', '',
      '**Preconditions:** Logged in as Admin.', '',
      '**Steps:**', '1. Do the thing.', '',
      '**Expected Result:** The thing happened.', '',
      '**Priority:** P1', '',
      '**Tags:** Atomic', '',
      ...(o.review === null ? [] : [`**Review:** ${o.review || 'Pending'}`, '']),
      ...(o.automation === null ? [] : [`**Automation:** ${o.automation || 'Pending'}`, '']),
      '---', '',
    ].join('\n'));
  }
  return `# Manual Test Suite — Agency\n\n---\n\n${blocks.join('\n')}`;
}

/** Header + rows in the §6.1 column order, so column positions match the real workbook. */
function workbookRows(cases) {
  const header = FIELDS.map((f) => f.label);
  const rows = [header];
  for (const c of cases) {
    const row = new Array(header.length).fill('');
    row[header.indexOf('Test Case ID')] = c.id;
    row[header.indexOf('Title')] = c.title || 'Case';
    row[header.indexOf('Review')] = c.review ?? 'Pending';
    row[header.indexOf('Automation')] = c.automation ?? 'Pending';
    rows.push(row);
  }
  return rows;
}

function writeOurWorkbook(dir, cases, name = 'TestCases_Agency.xlsx') {
  const p = path.join(dir, name);
  fs.writeFileSync(p, buildWorkbook({ sheetName: 'Agency', rows: workbookRows(cases) }));
  return p;
}

/**
 * A workbook in the shape a SPREADSHEET APPLICATION saves: DEFLATE entries, a sharedStrings part
 * referenced by `t="s"`, and empty cells omitted entirely rather than emitted blank.
 */
function writeForeignWorkbook(dir, cases, name = 'TestCases_Agency.xlsx') {
  const rows = workbookRows(cases);
  const strings = [];
  const idOf = (text) => {
    let i = strings.indexOf(text);
    if (i === -1) { strings.push(text); i = strings.length - 1; }
    return i;
  };

  const colName = (n) => {
    let s = '';
    for (let x = n; x >= 0; x = Math.floor(x / 26) - 1) s = String.fromCharCode(65 + (x % 26)) + s;
    return s;
  };

  const sheetRows = rows.map((cells, r) => {
    const xml = cells.map((v, c) => (v === '' || v === undefined
      ? '' // omitted, exactly as a real spreadsheet does
      : `<c r="${colName(c)}${r + 1}" t="s"><v>${idOf(String(v))}</v></c>`)).join('');
    return `<row r="${r + 1}">${xml}</row>`;
  }).join('');

  const sheet = `<?xml version="1.0"?><worksheet><sheetData>${sheetRows}</sheetData></worksheet>`;
  const shared = `<?xml version="1.0"?><sst count="${strings.length}" uniqueCount="${strings.length}">`
    + strings.map((s) => `<si><t>${s.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</t></si>`).join('')
    + '</sst>';

  const parts = [
    ['[Content_Types].xml', '<?xml version="1.0"?><Types/>'],
    ['xl/workbook.xml', '<?xml version="1.0"?><workbook/>'],
    ['xl/sharedStrings.xml', shared],
    ['xl/worksheets/sheet1.xml', sheet],
  ];

  // Minimal ZIP writer using DEFLATE (method 8) — the encoding our own writer never produces.
  const locals = [];
  const central = [];
  let offset = 0;
  for (const [name_, content] of parts) {
    const raw = Buffer.from(content, 'utf8');
    const comp = zlib.deflateRawSync(raw);
    const crc = require('../crc32').crc32(raw);
    const nameBuf = Buffer.from(name_, 'utf8');

    const lh = Buffer.alloc(30);
    lh.writeUInt32LE(0x04034b50, 0); lh.writeUInt16LE(20, 4); lh.writeUInt16LE(8, 8);
    lh.writeUInt32LE(crc, 14); lh.writeUInt32LE(comp.length, 18); lh.writeUInt32LE(raw.length, 22);
    lh.writeUInt16LE(nameBuf.length, 26);
    locals.push(lh, nameBuf, comp);

    const ch = Buffer.alloc(46);
    ch.writeUInt32LE(0x02014b50, 0); ch.writeUInt16LE(20, 6); ch.writeUInt16LE(8, 10);
    ch.writeUInt32LE(crc, 16); ch.writeUInt32LE(comp.length, 20); ch.writeUInt32LE(raw.length, 24);
    ch.writeUInt16LE(nameBuf.length, 28); ch.writeUInt32LE(offset, 42);
    central.push(ch, nameBuf);

    offset += lh.length + nameBuf.length + comp.length;
  }

  const cdBuf = Buffer.concat(central);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(parts.length, 8); eocd.writeUInt16LE(parts.length, 10);
  eocd.writeUInt32LE(cdBuf.length, 12); eocd.writeUInt32LE(offset, 16);

  const p = path.join(dir, name);
  fs.writeFileSync(p, Buffer.concat([...locals, cdBuf, eocd]));
  return p;
}

// ── the reader ───────────────────────────────────────────────────────────────────────────────────

test('reads our own STORED / inlineStr workbook', () => {
  const dir = tmpDir();
  const p = writeOurWorkbook(dir, [{ id: 'TC-AG-001', review: 'Approved', automation: 'Rejected' }]);
  const { rows } = readWorkbook(p);
  assert.strictEqual(rows[0][0], 'Test Case ID');
  assert.strictEqual(rows[1][10], 'Approved');
  assert.strictEqual(rows[1][11], 'Rejected');
});

test('reads a DEFLATE + sharedStrings workbook — the shape Excel saves', () => {
  const dir = tmpDir();
  const p = writeForeignWorkbook(dir, [
    { id: 'TC-AG-001', review: 'Approved', automation: 'Approved' },
    { id: 'TC-AG-002', review: 'Rejected', automation: 'Pending' },
  ]);
  const { rows } = readWorkbook(p);
  assert.strictEqual(rows[0][10], 'Review');
  assert.strictEqual(rows[1][10], 'Approved');
  assert.strictEqual(rows[2][10], 'Rejected');
});

test('omitted empty cells do not shift later columns', () => {
  const dir = tmpDir();
  // Objective/Preconditions/etc. are blank here, so a real spreadsheet omits those <c> elements
  // entirely. A positional reader would slide Review into an earlier column.
  const p = writeForeignWorkbook(dir, [{ id: 'TC-AG-001', review: 'Approved', automation: 'Rejected' }]);
  const { rows } = readWorkbook(p);
  assert.strictEqual(rows[1][columnIndex('K')], 'Approved');
  assert.strictEqual(rows[1][columnIndex('L')], 'Rejected');
});

// ── the import ───────────────────────────────────────────────────────────────────────────────────

test('moves the reviewer decisions into the Markdown and reports each change', () => {
  const dir = tmpDir();
  const md = path.join(dir, 'TestCases_Agency.md');
  fs.writeFileSync(md, suiteMarkdown(3));
  writeForeignWorkbook(dir, [
    { id: 'TC-AG-001', review: 'Approved', automation: 'Approved' },
    { id: 'TC-AG-002', review: 'Rejected' },
    { id: 'TC-AG-003' },
  ]);

  const result = importLifecycle(md);
  assert.strictEqual(result.written, true);
  assert.deepStrictEqual(result.changes, [
    { id: 'TC-AG-001', field: 'review', from: 'Pending', to: 'Approved' },
    { id: 'TC-AG-001', field: 'automation', from: 'Pending', to: 'Approved' },
    { id: 'TC-AG-002', field: 'review', from: 'Pending', to: 'Rejected' },
  ]);

  const text = fs.readFileSync(md, 'utf8');
  assert.match(text, /### TC-AG-001[\s\S]*?\*\*Review:\*\* Approved/);
  assert.match(text, /### TC-AG-002[\s\S]*?\*\*Review:\*\* Rejected/);
  assert.match(text, /### TC-AG-003[\s\S]*?\*\*Review:\*\* Pending/);
});

test('imports ONLY the two lifecycle columns — derived content is left alone', () => {
  const dir = tmpDir();
  const md = path.join(dir, 'TestCases_Agency.md');
  fs.writeFileSync(md, suiteMarkdown(1));
  // A reviewer who also retyped the Title in the spreadsheet: that edit must NOT come back, because
  // Title is derived content and editing it there is the mistake §9.1 exists to prevent.
  writeForeignWorkbook(dir, [{ id: 'TC-AG-001', title: 'RETYPED IN EXCEL', review: 'Approved' }]);

  importLifecycle(md);
  const text = fs.readFileSync(md, 'utf8');
  assert.ok(!text.includes('RETYPED IN EXCEL'), 'a Title edited in the workbook must not be imported');
  assert.match(text, /\*\*Review:\*\* Approved/);
});

test('preserves the rest of the document byte-for-byte', () => {
  const dir = tmpDir();
  const md = path.join(dir, 'TestCases_Agency.md');
  const original = suiteMarkdown(2);
  fs.writeFileSync(md, original);
  writeForeignWorkbook(dir, [{ id: 'TC-AG-001', review: 'Approved' }, { id: 'TC-AG-002' }]);

  importLifecycle(md);
  const after = fs.readFileSync(md, 'utf8');
  // Exactly one line differs: TC-AG-001's Review.
  const diff = original.split('\n').filter((line, i) => line !== after.split('\n')[i]);
  assert.deepStrictEqual(diff, ['**Review:** Pending']);
});

test('inserts an absent lifecycle field rather than skipping the decision', () => {
  const dir = tmpDir();
  const md = path.join(dir, 'TestCases_Agency.md');
  fs.writeFileSync(md, suiteMarkdown(1, { 'TC-AG-001': { review: null, automation: null } }));
  writeForeignWorkbook(dir, [{ id: 'TC-AG-001', review: 'Approved', automation: 'Rejected' }]);

  const result = importLifecycle(md);
  assert.deepStrictEqual(result.changes.map((c) => c.from), ['(absent)', '(absent)']);
  const text = fs.readFileSync(md, 'utf8');
  assert.match(text, /\*\*Review:\*\* Approved/);
  assert.match(text, /\*\*Automation:\*\* Rejected/);
});

test('an unrecognised value warns and leaves the Markdown unchanged', () => {
  const dir = tmpDir();
  const md = path.join(dir, 'TestCases_Agency.md');
  fs.writeFileSync(md, suiteMarkdown(1));
  writeForeignWorkbook(dir, [{ id: 'TC-AG-001', review: 'Maybe Later' }]);

  const result = importLifecycle(md);
  assert.deepStrictEqual(result.changes, []);
  assert.match(result.warnings.join('\n'), /Review is "Maybe Later"/);
  assert.match(fs.readFileSync(md, 'utf8'), /\*\*Review:\*\* Pending/);
});

test('casing is normalised, so "approved" is a valid decision', () => {
  const dir = tmpDir();
  const md = path.join(dir, 'TestCases_Agency.md');
  fs.writeFileSync(md, suiteMarkdown(1));
  writeForeignWorkbook(dir, [{ id: 'TC-AG-001', review: 'approved', automation: 'REJECTED' }]);

  importLifecycle(md);
  const text = fs.readFileSync(md, 'utf8');
  assert.match(text, /\*\*Review:\*\* Approved/);
  assert.match(text, /\*\*Automation:\*\* Rejected/);
});

test('--check reports the changes without writing', () => {
  const dir = tmpDir();
  const md = path.join(dir, 'TestCases_Agency.md');
  const original = suiteMarkdown(1);
  fs.writeFileSync(md, original);
  writeForeignWorkbook(dir, [{ id: 'TC-AG-001', review: 'Approved' }]);

  const result = importLifecycle(md, undefined, { dryRun: true });
  assert.strictEqual(result.changes.length, 1);
  assert.strictEqual(result.written, false);
  assert.strictEqual(fs.readFileSync(md, 'utf8'), original);
});

test('a workbook row with no matching Markdown case warns instead of inventing one', () => {
  const dir = tmpDir();
  const md = path.join(dir, 'TestCases_Agency.md');
  fs.writeFileSync(md, suiteMarkdown(1));
  writeForeignWorkbook(dir, [
    { id: 'TC-AG-001', review: 'Approved' },
    { id: 'TC-AG-999', review: 'Approved' },
  ]);

  const result = importLifecycle(md);
  assert.match(result.warnings.join('\n'), /TC-AG-999: in the workbook but not in the Markdown/);
});

test('a workbook predating the lifecycle columns is a named error, not a crash', () => {
  const dir = tmpDir();
  const md = path.join(dir, 'TestCases_Agency.md');
  fs.writeFileSync(md, suiteMarkdown(1));
  const legacy = path.join(dir, 'TestCases_Agency.xlsx');
  fs.writeFileSync(legacy, buildWorkbook({
    sheetName: 'Agency',
    rows: [['Test Case ID', 'Title'], ['TC-AG-001', 'Case 1']],
  }));

  assert.throws(() => importLifecycle(md), (err) => {
    assert.ok(err instanceof ImportError);
    assert.match(err.message, /has no "Review" column/);
    return true;
  });
});

test('a stale workbook is flagged, since the review may predate the current case text', () => {
  const dir = tmpDir();
  const md = path.join(dir, 'TestCases_Agency.md');
  const xlsx = writeForeignWorkbook(dir, [{ id: 'TC-AG-001', review: 'Approved' }]);
  fs.writeFileSync(md, suiteMarkdown(1));
  const old = new Date(Date.parse('2020-01-01T00:00:00Z'));
  fs.utimesSync(xlsx, old, old);

  const result = importLifecycle(md);
  assert.match(result.warnings.join('\n'), /is OLDER than/);
});

test('readDecisions surfaces the raw per-case decisions', () => {
  const dir = tmpDir();
  const p = writeForeignWorkbook(dir, [{ id: 'TC-AG-001', review: 'Approved', automation: 'Rejected' }]);
  const { decisions } = readDecisions(p);
  assert.deepStrictEqual(decisions.get('TC-AG-001'), { review: 'Approved', automation: 'Rejected' });
});

// ─────────────────────────────────────────────────────────────────────────────────────────────────
// INCONSISTENT LIFECYCLE PAIRS ARRIVING FROM THE WORKBOOK
// ─────────────────────────────────────────────────────────────────────────────────────────────────
// The reviewer works in the spreadsheet, so the spreadsheet is where a contradictory pair is most
// likely to be created. The import must WRITE WHAT THE REVIEWER RECORDED and report the conflict —
// never quietly reconcile it, in either direction.

test('an inconsistent pair imported from the workbook is written verbatim and reported', () => {
  const dir = tmpDir();
  const md = path.join(dir, 'TestCases_Agency.md');
  fs.writeFileSync(md, suiteMarkdown(2));
  writeOurWorkbook(dir, [
    { id: 'TC-AG-001', review: 'Rejected', automation: 'Approved' },
    { id: 'TC-AG-002', review: 'Approved', automation: 'Approved' },
  ]);

  const result = importLifecycle(md);
  const text = fs.readFileSync(md, 'utf8');

  assert.match(text, /\*\*Review:\*\* Rejected/, 'the reviewer’s Review value is written as recorded');
  assert.match(text, /\*\*Automation:\*\* Approved/, 'Automation is NOT reset to Pending');
  assert.ok(
    result.warnings.some((w) => w.includes('INCONSISTENT lifecycle') && w.includes('TC-AG-001')),
    'the contradiction is surfaced to the operator'
  );
  assert.ok(
    !result.warnings.some((w) => w.includes('TC-AG-002')),
    'the consistent case must not be flagged'
  );
});

test('an inconsistency formed by combining workbook and Markdown values is still caught', () => {
  // The workbook supplies only Automation; Review stays whatever the Markdown already held. The
  // resulting PAIR is what matters, so the check runs on the post-import state, not on either input.
  const dir = tmpDir();
  const md = path.join(dir, 'TestCases_Agency.md');
  fs.writeFileSync(md, suiteMarkdown(1, { 'TC-AG-001': { review: 'Rejected' } }));
  writeOurWorkbook(dir, [{ id: 'TC-AG-001', review: '', automation: 'Approved' }]);

  const result = importLifecycle(md);
  assert.ok(
    result.warnings.some((w) => w.includes('INCONSISTENT lifecycle')),
    'Rejected (from Markdown) + Approved (from workbook) is still a contradiction'
  );
  assert.match(fs.readFileSync(md, 'utf8'), /\*\*Review:\*\* Rejected/, 'Review untouched');
});

test('a dry run reports the inconsistency without writing anything', () => {
  const dir = tmpDir();
  const md = path.join(dir, 'TestCases_Agency.md');
  fs.writeFileSync(md, suiteMarkdown(1));
  const before = fs.readFileSync(md, 'utf8');
  writeOurWorkbook(dir, [{ id: 'TC-AG-001', review: 'Pending', automation: 'Approved' }]);

  const result = importLifecycle(md, undefined, { dryRun: true });
  assert.strictEqual(result.written, false);
  assert.strictEqual(fs.readFileSync(md, 'utf8'), before, 'nothing written on a dry run');
  assert.ok(result.warnings.some((w) => w.includes('INCONSISTENT lifecycle')));
});
