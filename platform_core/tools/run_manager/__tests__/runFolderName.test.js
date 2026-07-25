const test = require('node:test');
const assert = require('node:assert/strict');

const {
  CANONICAL_SCOPES,
  sanitizeSegment,
  normalizeScope,
  formatTimestamp,
  buildRunFolderName,
  generateRunFolderName,
  parseRunFolderName,
} = require('../runFolderName');

test('sanitizeSegment removes filesystem-unsafe characters', () => {
  assert.equal(sanitizeSegment('Add/Cabin\\Class:Filter?'), 'AddCabinClassFilter');
  assert.equal(sanitizeSegment('US-245 Add Cabin Class Filter'), 'US-245AddCabinClassFilter');
});

test('sanitizeSegment collapses whitespace and trims stray separators', () => {
  assert.equal(sanitizeSegment('  Flight   Search  '), 'FlightSearch');
  assert.equal(sanitizeSegment('--Login--'), 'Login');
});

test('sanitizeSegment falls back to Unknown on empty/nullish input', () => {
  assert.equal(sanitizeSegment(''), 'Unknown');
  assert.equal(sanitizeSegment('   '), 'Unknown');
  assert.equal(sanitizeSegment(null), 'Unknown');
  assert.equal(sanitizeSegment(undefined), 'Unknown');
  assert.equal(sanitizeSegment('///'), 'Unknown');
});

test('sanitizeSegment caps length at 60 characters', () => {
  const long = 'A'.repeat(100);
  assert.equal(sanitizeSegment(long).length, 60);
});

test('sanitizeSegment accepts a custom fallback', () => {
  assert.equal(sanitizeSegment(null, 'Custom'), 'Custom');
});

test('normalizeScope maps known free-text scopes onto the canonical set', () => {
  assert.equal(normalizeScope('Full Regression'), 'Regression');
  assert.equal(normalizeScope('Regression'), 'Regression');
  assert.equal(normalizeScope('Entire Project'), 'FullRun');
  assert.equal(normalizeScope('Smoke'), 'Smoke');
  assert.equal(normalizeScope('Sanity'), 'Sanity');
  assert.equal(normalizeScope('User Story'), 'UserStory');
  assert.equal(normalizeScope('Bug'), 'Targeted');
  assert.equal(normalizeScope('Custom'), 'Targeted');
  assert.equal(normalizeScope('Custom Scope'), 'Targeted');
  assert.equal(normalizeScope('Feature'), 'Module');
});

test('normalizeScope is case-insensitive and accepts exact canonical values', () => {
  for (const scope of CANONICAL_SCOPES) {
    assert.equal(normalizeScope(scope.toLowerCase()), scope);
    assert.equal(normalizeScope(scope.toUpperCase()), scope);
  }
});

test('normalizeScope: unrecognized non-empty input reads as Targeted, never FullRun', () => {
  assert.equal(normalizeScope('Some ad hoc thing nobody has seen before'), 'Targeted');
});

test('normalizeScope: empty/missing input is Unknown, not Targeted', () => {
  assert.equal(normalizeScope(''), 'Unknown');
  assert.equal(normalizeScope(null), 'Unknown');
  assert.equal(normalizeScope(undefined), 'Unknown');
});

test('formatTimestamp produces YYYY-MM-DD_HH-mm-ss', () => {
  const d = new Date(2026, 6, 23, 10, 35, 18); // July is month index 6
  assert.equal(formatTimestamp(d), '2026-07-23_10-35-18');
});

test('formatTimestamp zero-pads single digit components', () => {
  const d = new Date(2026, 0, 5, 3, 4, 5);
  assert.equal(formatTimestamp(d), '2026-01-05_03-04-05');
});

test('formatTimestamp rejects invalid input', () => {
  assert.throws(() => formatTimestamp(new Date('not a date')), TypeError);
  assert.throws(() => formatTimestamp('2026-07-23'), TypeError);
});

test('buildRunFolderName matches the required convention exactly', () => {
  assert.equal(
    buildRunFolderName({ timestamp: '2026-07-23_10-35-18', scope: 'FullRun', target: 'FlightSearch' }),
    '2026-07-23_10-35-18__FullRun__FlightSearch'
  );
  assert.equal(
    buildRunFolderName({ timestamp: '2026-07-23_15-48-55', scope: 'Targeted', target: 'US-245_AddCabinClassFilter' }),
    '2026-07-23_15-48-55__Targeted__US-245_AddCabinClassFilter'
  );
});

test('generateRunFolderName reproduces every example from the requirements', () => {
  const cases = [
    { now: new Date(2026, 6, 23, 10, 35, 18), metadata: { scope: 'FullRun', target: 'FlightSearch' }, expected: '2026-07-23_10-35-18__FullRun__FlightSearch' },
    { now: new Date(2026, 6, 23, 11, 2, 41), metadata: { scope: 'Smoke', target: 'Login' }, expected: '2026-07-23_11-02-41__Smoke__Login' },
    { now: new Date(2026, 6, 23, 14, 20, 5), metadata: { scope: 'Regression', target: 'BookingFlow' }, expected: '2026-07-23_14-20-05__Regression__BookingFlow' },
    { now: new Date(2026, 6, 23, 15, 48, 55), metadata: { scope: 'Targeted', target: 'US-245_AddCabinClassFilter' }, expected: '2026-07-23_15-48-55__Targeted__US-245_AddCabinClassFilter' },
    { now: new Date(2026, 6, 23, 16, 10, 32), metadata: { scope: 'Targeted', target: 'AgencyManagement' }, expected: '2026-07-23_16-10-32__Targeted__AgencyManagement' },
  ];
  for (const c of cases) {
    assert.equal(generateRunFolderName(c.metadata, { now: c.now }), c.expected);
  }
});

test('generateRunFolderName derives target from userStory/module/feature priority order', () => {
  const now = new Date(2026, 6, 23, 9, 0, 0);
  assert.equal(
    generateRunFolderName({ scope: 'UserStory', userStory: 'AddCabinClassFilter', module: 'FlightSearch' }, { now }),
    '2026-07-23_09-00-00__UserStory__AddCabinClassFilter'
  );
  assert.equal(
    generateRunFolderName({ scope: 'Module', module: 'FlightSearch' }, { now }),
    '2026-07-23_09-00-00__Module__FlightSearch'
  );
});

test('generateRunFolderName falls back to Unknown scope/target when metadata is empty', () => {
  const now = new Date(2026, 6, 23, 9, 0, 0);
  assert.equal(generateRunFolderName({}, { now }), '2026-07-23_09-00-00__Unknown__Unknown');
});

test('generateRunFolderName requires an explicit now (never defaults internally)', () => {
  assert.throws(() => generateRunFolderName({ scope: 'Smoke', target: 'Login' }), TypeError);
});

test('generateRunFolderName resolves collisions with a deterministic numeric suffix', () => {
  const now = new Date(2026, 6, 23, 10, 35, 18);
  const base = '2026-07-23_10-35-18__FullRun__FlightSearch';
  const metadata = { scope: 'FullRun', target: 'FlightSearch' };

  assert.equal(generateRunFolderName(metadata, { now, existingNames: [base] }), `${base}__2`);
  assert.equal(generateRunFolderName(metadata, { now, existingNames: [base, `${base}__2`] }), `${base}__3`);
});

test('folder names sort chronologically as plain strings', () => {
  const names = [
    generateRunFolderName({ scope: 'Smoke', target: 'A' }, { now: new Date(2026, 6, 23, 9, 0, 0) }),
    generateRunFolderName({ scope: 'Smoke', target: 'B' }, { now: new Date(2026, 6, 23, 8, 0, 0) }),
    generateRunFolderName({ scope: 'Smoke', target: 'C' }, { now: new Date(2026, 6, 22, 23, 59, 59) }),
  ];
  const sorted = [...names].sort();
  assert.deepEqual(sorted.map((n) => n.split('__')[0]), [
    '2026-07-22_23-59-59',
    '2026-07-23_08-00-00',
    '2026-07-23_09-00-00',
  ]);
});

test('parseRunFolderName round-trips new-format names', () => {
  const parsed = parseRunFolderName('2026-07-23_15-48-55__Targeted__US-245_AddCabinClassFilter');
  assert.equal(parsed.format, 'new');
  assert.equal(parsed.timestamp, '2026-07-23_15-48-55');
  assert.equal(parsed.scope, 'Targeted');
  assert.equal(parsed.target, 'US-245_AddCabinClassFilter');
});

test('parseRunFolderName recovers the base name and suffix for a deduplicated folder', () => {
  const parsed = parseRunFolderName('2026-07-23_10-35-18__FullRun__FlightSearch__2');
  assert.equal(parsed.format, 'new');
  assert.equal(parsed.target, 'FlightSearch');
  assert.equal(parsed.dedupeSuffix, 2);
});

test('parseRunFolderName recognizes legacy RUN-YYYYMMDD-XXX and RUN-YYYYMMDD-XXX-slug forms', () => {
  const plain = parseRunFolderName('RUN-20260706-001');
  assert.equal(plain.format, 'legacy');
  assert.equal(plain.runId, 'RUN-20260706-001');
  assert.equal(plain.slug, undefined);

  const withSlug = parseRunFolderName('RUN-20260721-001-first-run-login');
  assert.equal(withSlug.format, 'legacy');
  assert.equal(withSlug.runId, 'RUN-20260721-001');
  assert.equal(withSlug.slug, 'first-run-login');
});

test('parseRunFolderName returns unknown for garbage input', () => {
  assert.equal(parseRunFolderName('not_a_run_folder').format, 'unknown');
  assert.equal(parseRunFolderName('').format, 'unknown');
  assert.equal(parseRunFolderName(null).format, 'unknown');
});
